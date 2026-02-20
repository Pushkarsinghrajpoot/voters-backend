"""
ECI Voter Data Extraction API
FastAPI backend for voter data extraction and management
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
import os
import uuid
from datetime import datetime
import asyncio
import pandas as pd
import io

import detail_enhanced as detail

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Initialize FastAPI app
app = FastAPI(
    title="ECI Voter Data Extraction API",
    description="API for extracting voter data from ECI portal",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],  # Next.js dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Pydantic models
class EPICRequest(BaseModel):
    epic_number: str
    state_code: str = "S08"  # Default to Himachal Pradesh

class BulkEPICRequest(BaseModel):
    epic_numbers: List[str]
    state_code: str = "S08"

class ExtractionResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    voter_id: Optional[str] = None

class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: float
    total_records: int
    processed_records: int
    successful_records: int
    failed_records: int
    duplicate_records: int

# Helper Functions
def parse_eci_response(response_data: Dict[str, Any]) -> Dict[str, Any]:
    """Parse and structure ECI API response"""
    return {
        "epic_id": response_data.get("epicId"),
        "epic_number": response_data.get("epicNumber"),
        "form_reference_no": response_data.get("formReferenceNo"),
        
        # Personal Information
        "applicant_first_name": response_data.get("applicantFirstName"),
        "applicant_first_name_l1": response_data.get("applicantFirstNameL1"),
        "applicant_first_name_l2": response_data.get("applicantFirstNameL2"),
        "applicant_last_name": response_data.get("applicantLastName"),
        "applicant_last_name_l1": response_data.get("applicantLastNameL1"),
        "applicant_last_name_l2": response_data.get("applicantLastNameL2"),
        "full_name": response_data.get("fullName"),
        "full_name_l1": response_data.get("fullNameL1"),
        
        # Demographics
        "age": response_data.get("age"),
        "gender": response_data.get("gender"),
        "gender_l1": response_data.get("genderL1"),
        "birth_year": response_data.get("birthYear"),
        
        # Relation Information
        "relation_type": response_data.get("relationType"),
        "relation_type_l1": response_data.get("relationTypeL1"),
        "relation_name": response_data.get("relationName"),
        "relation_name_l1": response_data.get("relationNameL1"),
        "relation_name_l2": response_data.get("relationNameL2"),
        "relation_lname": response_data.get("relationLName"),
        "relation_lname_l1": response_data.get("relationLNameL1"),
        "relative_full_name": response_data.get("relativeFullName"),
        "relative_full_name_l1": response_data.get("relativeFullNameL1"),
        
        # Location Information
        "part_number": response_data.get("partNumber"),
        "part_id": response_data.get("partId"),
        "part_name": response_data.get("partName"),
        "part_name_l1": response_data.get("partNameL1"),
        "part_serial_number": response_data.get("partSerialNumber"),
        "section_no": response_data.get("sectionNo"),
        
        # Assembly/Parliamentary Details
        "asmbly_name": response_data.get("asmblyName"),
        "asmbly_name_l1": response_data.get("asmblyNameL1"),
        "ac_id": response_data.get("acId"),
        "ac_number": response_data.get("acNumber"),
        "prlmnt_name": response_data.get("prlmntName"),
        "prlmnt_name_l1": response_data.get("prlmntNameL1"),
        "prlmnt_no": response_data.get("prlmntNo"),
        
        # District/State
        "district_value": response_data.get("districtValue"),
        "district_value_l1": response_data.get("districtValueL1"),
        "district_cd": response_data.get("districtCd"),
        "district_id": response_data.get("districtId"),
        "district_no": response_data.get("districtNo"),
        "state_name": response_data.get("stateName"),
        "state_name_l1": response_data.get("stateNameL1"),
        "state_id": response_data.get("stateId"),
        "state_cd": response_data.get("stateCd"),
        
        # Polling Station Details
        "ps_building_name": response_data.get("psbuildingName"),
        "ps_building_name_l1": response_data.get("psBuildingNameL1"),
        "ps_room_details": response_data.get("psRoomDetails"),
        "ps_room_details_l1": response_data.get("psRoomDetailsL1"),
        "building_address": response_data.get("buildingAddress"),
        "building_address_l1": response_data.get("buildingAddressL1"),
        "part_lat_long": response_data.get("partLatLong"),
        
        # Disability Information
        "disability_any": response_data.get("disabilityAny"),
        "disability_type": response_data.get("disabilityType"),
        "is_locomotor_disabled": response_data.get("isLocomotorDisabled"),
        "is_speech_hearing_disabled": response_data.get("isSpeechHearingDisabled"),
        "is_visually_impaired": response_data.get("isVisuallyImpaired"),
        "other_disability": response_data.get("otherDisability"),
        "is_wheelchair_required": response_data.get("isWheelchairRequired"),
        "pwd": response_data.get("pwd"),
        "pwd_marking_form_type": response_data.get("pwdMarkingFormType"),
        "pwd_marking_ref_no": response_data.get("pwdMarkingRefNo"),
        
        # Form/Process Information
        "form_type": response_data.get("formType"),
        "process_type": response_data.get("processType"),
        "status_type": response_data.get("statusType"),
        "revision_id": response_data.get("revisionId"),
        
        # Timestamps
        "created_dttm": response_data.get("createdDttm"),
        "modified_dttm": response_data.get("modifiedDttm"),
        "epic_datetime": response_data.get("epicDatetime"),
        
        # Flags
        "is_active": response_data.get("isActive", True),
        "is_deleted": response_data.get("isDeleted", False),
        "is_validated": response_data.get("isValidated"),
        "is_vip": response_data.get("isVip"),
        "is_form8_migration": response_data.get("isForm8Migration"),
        
        # Store raw response
        "raw_response": response_data,
        "extraction_metadata": {
            "extracted_at": datetime.now().isoformat(),
            "api_version": "1.0"
        }
    }

async def save_voter_to_db(voter_data: Dict[str, Any]) -> str:
    """Save voter data to Supabase"""
    try:
        # Check for duplicate
        existing = supabase.table("voters").select("id").eq("epic_number", voter_data["epic_number"]).execute()
        
        if existing.data:
            raise HTTPException(status_code=409, detail="Voter already exists in database")
        
        # Insert voter
        result = supabase.table("voters").insert(voter_data).execute()
        
        if result.data:
            return result.data[0]["id"]
        else:
            raise HTTPException(status_code=500, detail="Failed to save voter to database")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

async def extract_single_epic(epic_number: str, state_code: str, job_id: Optional[str] = None) -> Dict[str, Any]:
    """Extract data for a single EPIC number"""
    try:
        # Call the enhanced detail function that returns actual data
        status, voter_data, attempts = detail.extract_voter_data(epic_number, state_code)
        
        if status == "success" and voter_data:
            # Parse and save to database
            parsed_data = parse_eci_response(voter_data)
            
            try:
                voter_id = await save_voter_to_db(parsed_data)
                return {
                    "status": "success",
                    "epic_number": epic_number,
                    "message": "Data extracted and saved successfully",
                    "voter_data": voter_data,
                    "voter_id": voter_id,
                    "attempts": attempts
                }
            except HTTPException as e:
                if e.status_code == 409:  # Duplicate
                    return {
                        "status": "duplicate",
                        "epic_number": epic_number,
                        "message": str(e.detail),
                        "voter_data": voter_data
                    }
                raise
        else:
            return {
                "status": "failed",
                "epic_number": epic_number,
                "message": f"Failed to extract data after {attempts} attempts",
                "attempts": attempts
            }
            
    except Exception as e:
        return {
            "status": "error",
            "epic_number": epic_number,
            "message": str(e)
        }

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "status": "ok",
        "message": "ECI Voter Data Extraction API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    health_status = {
        "api": "healthy",
        "database": "unknown",
        "eci_portal": "unknown",
        "timestamp": datetime.now().isoformat()
    }
    
    # Check database connection
    try:
        result = supabase.table("voters").select("id").limit(1).execute()
        health_status["database"] = "healthy"
    except Exception as e:
        health_status["database"] = "unhealthy"
        health_status["database_error"] = str(e)
    
    # Check ECI portal (simple connectivity test)
    try:
        import requests
        response = requests.get("https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha", timeout=5)
        if response.status_code == 200:
            health_status["eci_portal"] = "healthy"
        else:
            health_status["eci_portal"] = "degraded"
    except Exception as e:
        health_status["eci_portal"] = "unhealthy"
        health_status["eci_error"] = str(e)
    
    # Overall status
    if health_status["database"] == "healthy" and health_status["api"] == "healthy":
        health_status["overall"] = "healthy"
    elif health_status["database"] == "unhealthy":
        health_status["overall"] = "critical"
    else:
        health_status["overall"] = "degraded"
    
    return health_status

@app.post("/api/extract/single", response_model=ExtractionResponse)
async def extract_single(request: EPICRequest):
    """Extract data for a single EPIC number"""
    
    # Check if voter already exists
    existing = supabase.table("voters").select("id, full_name, full_name_l1, age, gender, part_name, district_value, created_at").eq("epic_number", request.epic_number).execute()
    
    if existing.data:
        voter = existing.data[0]
        return ExtractionResponse(
            status="duplicate",
            message=f"Voter already exists in database",
            data=voter,
            voter_id=voter["id"]
        )
    
    # Extract data
    result = await extract_single_epic(request.epic_number, request.state_code)
    
    return ExtractionResponse(
        status=result["status"],
        message=result["message"],
        data=result.get("voter_data"),
        voter_id=result.get("voter_id")
    )

@app.post("/api/extract/bulk")
async def extract_bulk(request: BulkEPICRequest, background_tasks: BackgroundTasks):
    """Extract data for multiple EPIC numbers"""
    
    # Create extraction job
    job_id = str(uuid.uuid4())
    job_data = {
        "id": job_id,
        "job_name": f"Bulk extraction - {len(request.epic_numbers)} EPICs",
        "job_type": "bulk_epic",
        "status": "pending",
        "total_records": len(request.epic_numbers),
        "processed_records": 0,
        "successful_records": 0,
        "failed_records": 0,
        "duplicate_records": 0
    }
    
    supabase.table("extraction_jobs").insert(job_data).execute()
    
    # Add background task
    background_tasks.add_task(process_bulk_extraction, job_id, request.epic_numbers, request.state_code)
    
    return {
        "status": "accepted",
        "message": "Bulk extraction job created",
        "job_id": job_id
    }

@app.post("/api/extract/excel")
async def extract_from_excel(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    epic_column: str = Form("epic_number")
):
    """Extract data from Excel file containing EPIC numbers"""
    
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only Excel (.xlsx, .xls) or CSV files are supported")
    
    # Read file
    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            # First try reading with header
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Check if the specified column exists
        if epic_column in df.columns:
            epic_numbers = df[epic_column].dropna().astype(str).tolist()
        else:
            # If column not found, assume first column contains EPIC numbers (no header)
            # Re-read without header
            if file.filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(contents), header=None)
            else:
                df = pd.read_excel(io.BytesIO(contents), header=None)
            
            # Take first column
            epic_numbers = df.iloc[:, 0].dropna().astype(str).tolist()
            
            # Filter out any non-EPIC looking values (in case first row was a header)
            epic_numbers = [e for e in epic_numbers if len(e) > 5 and not e.lower() in ['epic', 'epic_number', 'epic number', 'epic no']]
        
        if not epic_numbers:
            raise HTTPException(status_code=400, detail="No EPIC numbers found in file")
        
        # Create extraction job
        job_id = str(uuid.uuid4())
        job_data = {
            "id": job_id,
            "job_name": f"Excel upload - {file.filename}",
            "job_type": "excel_upload",
            "status": "pending",
            "file_name": file.filename,
            "file_size": len(contents),
            "total_records": len(epic_numbers),
            "processed_records": 0,
            "successful_records": 0,
            "failed_records": 0,
            "duplicate_records": 0
        }
        
        supabase.table("extraction_jobs").insert(job_data).execute()
        
        # Add background task
        background_tasks.add_task(process_bulk_extraction, job_id, epic_numbers, "S08")
        
        return {
            "status": "accepted",
            "message": f"File uploaded successfully. Processing {len(epic_numbers)} EPIC numbers",
            "job_id": job_id,
            "total_records": len(epic_numbers)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get status of an extraction job"""
    
    result = supabase.table("extraction_jobs").select("*").eq("id", job_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = result.data[0]
    progress = 0
    if job["total_records"] > 0:
        progress = (job["processed_records"] / job["total_records"]) * 100
    
    return JobStatus(
        job_id=job["id"],
        status=job["status"],
        progress=round(progress, 2),
        total_records=job["total_records"],
        processed_records=job["processed_records"],
        successful_records=job["successful_records"],
        failed_records=job["failed_records"],
        duplicate_records=job["duplicate_records"]
    )

@app.get("/api/jobs/{job_id}/logs")
async def get_job_logs(job_id: str, limit: int = 20):
    """Get recent extraction logs for a job with full voter details"""
    
    result = supabase.table("extraction_logs").select("*, voters(*)").eq("job_id", job_id).order("created_at", desc=True).limit(limit).execute()
    
    extractions = []
    for log in result.data or []:
        extraction = {
            "epic_number": log["epic_number"],
            "status": log["status"],
            "attempts": log["attempts"],
            "created_at": log["created_at"]
        }
        
        # Add complete voter data if available
        if log.get("voters"):
            voter = log["voters"]
            extraction["voter_data"] = {
                "fullName": voter.get("full_name"),
                "fullNameL1": voter.get("full_name_l1"),
                "age": voter.get("age"),
                "gender": voter.get("gender"),
                "relationType": voter.get("relation_type"),
                "relativeFullName": voter.get("relative_full_name"),
                "relativeFullNameL1": voter.get("relative_full_name_l1"),
                "partNumber": voter.get("part_number"),
                "partName": voter.get("part_name"),
                "acNumber": voter.get("ac_number"),
                "asmblyName": voter.get("asmbly_name"),
                "districtValue": voter.get("district_value"),
                "stateName": voter.get("state_name"),
                "psbuildingName": voter.get("psbuilding_name"),
                "psRoomDetails": voter.get("ps_room_details")
            }
        
        extractions.append(extraction)
    
    return {"extractions": extractions}

@app.get("/api/jobs")
async def list_jobs(limit: int = 10, status: Optional[str] = None):
    """List all extraction jobs"""
    
    query = supabase.table("extraction_jobs").select("*").order("created_at", desc=True).limit(limit)
    
    if status:
        query = query.eq("status", status)
    
    result = query.execute()
    
    return {
        "jobs": result.data,
        "count": len(result.data)
    }

@app.get("/api/voters/search")
async def search_voters(
    query: Optional[str] = None,
    epic_number: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Search voters by name or EPIC number"""
    
    if epic_number:
        result = supabase.table("voters").select("*").eq("epic_number", epic_number).execute()
    elif query:
        result = supabase.table("voters").select("*").ilike("full_name", f"%{query}%").limit(limit).offset(offset).execute()
    else:
        result = supabase.table("voters").select("*").limit(limit).offset(offset).execute()
    
    return {
        "voters": result.data,
        "count": len(result.data)
    }

@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Get overall analytics overview"""
    
    # Get demographic stats from view
    result = supabase.table("demographic_stats").select("*").execute()
    
    return {
        "demographics": result.data[0] if result.data else {},
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/analytics/ward-wise")
async def get_ward_wise_analytics():
    """Get ward-wise analytics"""
    
    result = supabase.table("ward_wise_analysis").select("*").execute()
    
    return {
        "wards": result.data,
        "total_wards": len(result.data)
    }

# Background task functions
async def process_bulk_extraction(job_id: str, epic_numbers: List[str], state_code: str):
    """Process bulk extraction in background"""
    
    # Update job status to in_progress
    supabase.table("extraction_jobs").update({
        "status": "in_progress",
        "started_at": datetime.now().isoformat()
    }).eq("id", job_id).execute()
    
    successful = 0
    failed = 0
    duplicates = 0
    failed_epics = []
    
    for i, epic_number in enumerate(epic_numbers):
        try:
            # Check for duplicate
            existing = supabase.table("voters").select("id").eq("epic_number", epic_number).execute()
            
            if existing.data:
                duplicates += 1
                log_data = {
                    "job_id": job_id,
                    "epic_number": epic_number,
                    "status": "duplicate",
                    "attempts": 1
                }
                supabase.table("extraction_logs").insert(log_data).execute()
            else:
                # Extract data
                result = await extract_single_epic(epic_number, state_code, job_id)
                
                if result["status"] == "success":
                    successful += 1
                    log_data = {
                        "job_id": job_id,
                        "epic_number": epic_number,
                        "status": "success",
                        "attempts": 1
                    }
                    supabase.table("extraction_logs").insert(log_data).execute()
                else:
                    failed += 1
                    failed_epics.append({"epic": epic_number, "reason": result["message"]})
                    log_data = {
                        "job_id": job_id,
                        "epic_number": epic_number,
                        "status": "failed",
                        "attempts": 1,
                        "error_message": result["message"]
                    }
                    supabase.table("extraction_logs").insert(log_data).execute()
            
            # Update progress
            supabase.table("extraction_jobs").update({
                "processed_records": i + 1,
                "successful_records": successful,
                "failed_records": failed,
                "duplicate_records": duplicates
            }).eq("id", job_id).execute()
            
            # Small delay to avoid overwhelming the API
            await asyncio.sleep(0.5)
            
        except Exception as e:
            failed += 1
            failed_epics.append({"epic": epic_number, "reason": str(e)})
    
    # Update job as completed
    supabase.table("extraction_jobs").update({
        "status": "completed",
        "completed_at": datetime.now().isoformat(),
        "failed_epics": failed_epics
    }).eq("id", job_id).execute()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
