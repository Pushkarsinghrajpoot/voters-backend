'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X, Loader2, Grid, List, Play, Pause } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { VoterCarousel } from './voter-carousel'
import { VotersTable } from './voters-table'
import * as XLSX from 'xlsx'

interface ExcelUploaderProps {
  onComplete: () => void
}

interface VoterExtraction {
  epicNumber: string
  status: 'loading' | 'success' | 'failed' | 'duplicate'
  data?: any
  timestamp: Date
}

export function ExcelUploader({ onComplete }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [jobStats, setJobStats] = useState({ successful: 0, failed: 0, duplicates: 0, total: 0 })
  const [extractedVoters, setExtractedVoters] = useState<VoterExtraction[]>([])
  const [viewMode, setViewMode] = useState<'carousel' | 'table'>('carousel')
  const [isPaused, setIsPaused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load persisted state on mount and check for active jobs
  useEffect(() => {
    const checkAndRestoreJob = async () => {
      const savedState = localStorage.getItem('activeExtractionJob')
      if (savedState) {
        try {
          const { jobId, fileName, timestamp } = JSON.parse(savedState)
          // Check if job is still active (within last 2 hours)
          if (Date.now() - timestamp < 7200000) {
            // Verify job still exists and is active
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/api/jobs/${jobId}`)
            if (response.ok) {
              const job = await response.json()
              if (job.status === 'in_progress' || job.status === 'pending') {
                console.log('Restoring job:', jobId)
                setJobId(jobId)
                setUploading(true)
                setFile({ name: fileName } as File)
                setProgress(job.progress || 0)
                setJobStats({
                  successful: job.successful_records || 0,
                  failed: job.failed_records || 0,
                  duplicates: job.duplicate_records || 0,
                  total: job.total_records || 0
                })
                monitorJobProgress(jobId)
                return
              }
            }
          }
          // Clean up if job is old or completed
          localStorage.removeItem('activeExtractionJob')
        } catch (err) {
          console.error('Error restoring job:', err)
          localStorage.removeItem('activeExtractionJob')
        }
      }
    }
    checkAndRestoreJob()
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Handle multiple files or folder upload
    const selectedFile = files[0]
    setFile(selectedFile)

    // Parse file to show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][]

      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[]
        const sampleData = jsonData.slice(1, 6).map((row: string[]) => row[0])
        setPreview(sampleData)

        // Auto-detect EPIC column (not stored in state, just for display)
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setExtractedVoters([])
    const formData = new FormData()
    formData.append('file', file)
    formData.append('epic_column', 'epic_number')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/extract/excel`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setJobId(result.job_id)
        // Save to localStorage for persistence
        localStorage.setItem('activeExtractionJob', JSON.stringify({
          jobId: result.job_id,
          fileName: file.name,
          timestamp: Date.now()
        }))
        monitorJobProgress(result.job_id)
      } else {
        alert(`Upload failed: ${result.detail}`)
        setUploading(false)
      }
    } catch (error) {
      alert(`Upload error: ${error}`)
      setUploading(false)
    }
  }

  const monitorJobProgress = async (jobId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    const pollJob = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, { cache: 'no-store' })
        
        if (!response.ok) {
          console.error('Failed to fetch job status')
          return
        }

        const job = await response.json()
        console.log('Job status:', job.status, 'Progress:', job.progress)
        
        setProgress(job.progress || 0)
        setJobStats({
          successful: job.successful_records || 0,
          failed: job.failed_records || 0,
          duplicates: job.duplicate_records || 0,
          total: job.total_records || 0
        })

        // Fetch recent extractions with full details
        try {
          const logsResponse = await fetch(`${apiUrl}/api/jobs/${jobId}/logs?limit=20`, {
            cache: 'no-store'
          })
          if (logsResponse.ok) {
            const logs = await logsResponse.json()
            
            if (logs.extractions && logs.extractions.length > 0) {
              const voters: VoterExtraction[] = logs.extractions
                .filter((ext: any) => ext.status === 'success' && ext.voter_data)
                .map((ext: any) => ({
                  epicNumber: ext.epic_number,
                  status: ext.status,
                  data: ext.voter_data,
                  timestamp: new Date(ext.created_at)
                }))
              
              if (voters.length > 0) {
                console.log('Updated voters:', voters.length)
                setExtractedVoters(voters)
              }
            }
          }
        } catch (e) {
          console.error('Error fetching logs:', e)
        }

        if (job.status === 'completed' || job.status === 'failed') {
          console.log('Job finished:', job.status)
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          setUploading(false)
          localStorage.removeItem('activeExtractionJob')
          // Keep the extracted voters visible
        }
      } catch (error) {
        console.error('Error monitoring job:', error)
      }
    }

    // Initial poll
    await pollJob()

    // Set up interval - poll every 2 seconds
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    pollingIntervalRef.current = setInterval(pollJob, 2000)
  }

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const resetUpload = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    setFile(null)
    setPreview([])
    setJobId(null)
    setProgress(0)
    setUploading(false)
    setExtractedVoters([])
    setJobStats({ successful: 0, failed: 0, duplicates: 0, total: 0 })
    localStorage.removeItem('activeExtractionJob')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Excel/CSV Upload
        </CardTitle>
        <CardDescription>
          Upload Excel or CSV file containing EPIC numbers for bulk extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              multiple
            />
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="folder-upload"
              {...({webkitdirectory: "", directory: ""} as any)}
            />
            <div className="space-y-4">
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-700 font-medium">Click to upload file(s)</p>
                <p className="text-sm text-slate-500 mt-1">Excel (.xlsx, .xls) or CSV files</p>
              </label>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">or</span>
                </div>
              </div>
              <label htmlFor="folder-upload" className="cursor-pointer block">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-700 font-medium">Upload Folder (e.g., BILASPUR)</p>
                <p className="text-sm text-slate-500 mt-1">Select folder containing Excel/CSV files</p>
              </label>
            </div>
          </div>
        )}

        {file && !uploading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {preview.length > 0 && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Preview - First 5 EPIC Numbers
                </h4>
                <div className="space-y-1">
                  {preview.map((epic, index) => (
                    <div key={index} className="text-sm font-mono text-slate-700 bg-white px-2 py-1 rounded">
                      {index + 1}. {epic}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ✓ System will automatically extract EPIC numbers from first column
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpload} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Start Extraction
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Processing...</span>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-700">{jobStats.successful}</p>
                <p className="text-green-600 text-xs">Success</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-700">{jobStats.failed}</p>
                <p className="text-red-600 text-xs">Failed</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{jobStats.duplicates}</p>
                <p className="text-yellow-600 text-xs">Duplicates</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            {extractedVoters.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Extracted Voters ({extractedVoters.length})
                </h4>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'carousel' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('carousel')}
                    className="h-7 px-2"
                  >
                    <Grid className="w-3 h-3 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-7 px-2"
                  >
                    <List className="w-3 h-3 mr-1" />
                    Table
                  </Button>
                </div>
              </div>
            )}

            {/* Carousel View */}
            {extractedVoters.length > 0 && viewMode === 'carousel' && (
              <VoterCarousel voters={extractedVoters} />
            )}

            {/* Table View */}
            {extractedVoters.length > 0 && viewMode === 'table' && (
              <div className="max-h-96 overflow-y-auto rounded-lg border">
                <VotersTable voters={extractedVoters} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
