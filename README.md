# 🗳️ ECI Voter Data Extraction - Backend API

FastAPI backend for extracting and managing voter data from the Election Commission of India portal.

## 🚀 Features

- **Single EPIC Extraction** - Extract individual voter details by EPIC number
- **Bulk Excel Upload** - Upload Excel/CSV files for batch extraction
- **Folder Processing** - Process entire folders of voter files
- **Real-time Job Monitoring** - Track extraction progress with live updates
- **Captcha Solving** - Automatic captcha solving using ddddocr
- **Supabase Integration** - Store all voter data in PostgreSQL database
- **Health Monitoring** - API, Database, and ECI portal health checks

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **Python 3.9** - Required for ddddocr library
- **Supabase** - PostgreSQL database and real-time subscriptions
- **ddddocr** - ML-based captcha solver
- **Pandas** - Excel/CSV file processing
- **BeautifulSoup4** - HTML parsing
- **Uvicorn** - ASGI server

## 📋 Prerequisites

- Python 3.9.x (Required for ddddocr)
- Supabase account and database
- Internet connection for ECI portal access

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Pushkarsinghrajpoot/voters-backend.git
cd voters-backend
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### 4. Run Supabase migration

Run the SQL migration file in your Supabase dashboard to create tables.

### 5. Start the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: http://localhost:8000

## 📚 API Endpoints

### Health Check
```
GET /health
```
Returns API, database, and ECI portal health status.

### Single EPIC Extraction
```
POST /api/extract/single
Body: { "epic_number": "HP/04/020/174079" }
```
Extract data for a single EPIC number.

### Excel Upload
```
POST /api/extract/excel
Form Data: file, epic_column
```
Upload Excel/CSV file for batch extraction.

### Folder Processing
```
POST /api/extract/folder
Body: { "folder_path": "/path/to/folder" }
```
Process all Excel/CSV files in a folder.

### Job Monitoring
```
GET /api/jobs/{job_id}
```
Get status and progress of an extraction job.

### Job Logs
```
GET /api/jobs/{job_id}/logs?limit=20
```
Get detailed extraction logs with voter data.

### List Jobs
```
GET /api/jobs?status=in_progress&limit=10
```
List all extraction jobs with optional filtering.

## 🚀 Deployment

### Deploy to Railway.app (Recommended)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Deploy to Render.com

1. Connect your GitHub repository
2. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables (SUPABASE_URL, SUPABASE_KEY)
4. Deploy!

## 🔐 Environment Variables

Required variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anonymous key
- `PYTHON_VERSION` - Set to `3.9.18` for deployments

## 📊 Database Schema

The API uses the following Supabase tables:

- **voters** - Extracted voter information
- **extraction_jobs** - Batch extraction job tracking
- **extraction_logs** - Detailed extraction attempt logs

## 🧪 Testing

### Test health endpoint:
```bash
curl http://localhost:8000/health
```

### Test single extraction:
```bash
curl -X POST http://localhost:8000/api/extract/single \
  -H "Content-Type: application/json" \
  -d '{"epic_number": "HP/04/020/174079"}'
```

### View API documentation:
```
http://localhost:8000/docs
```

## 📝 API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🛡️ CORS Configuration

The API is configured to accept requests from:
- http://localhost:3000
- http://localhost:3002
- Your deployed frontend URL (configure in main.py)

## ⚙️ Configuration Files

- `requirements.txt` - Python dependencies
- `Procfile` - Railway/Heroku startup command
- `railway.json` - Railway deployment config
- `render.yaml` - Render deployment config
- `runtime.txt` - Python version specification
- `.env.example` - Environment variable template

## 🐛 Troubleshooting

### ddddocr installation fails
- Ensure you're using Python 3.9.x
- Install with: `pip install ddddocr==1.5.6`

### Captcha solving fails
- Check internet connection
- ECI portal may have updated captcha format
- Check logs for error messages

### Database connection fails
- Verify SUPABASE_URL and SUPABASE_KEY
- Ensure Supabase migration was run
- Check Supabase dashboard for errors

## 📄 License

MIT License - feel free to use for your projects

## 👥 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 🔗 Related

- Frontend Dashboard: [Link to frontend repo]
- Supabase Project: [Your Supabase URL]

## 📞 Support

For issues or questions, please create an issue on GitHub.

---

**Built with ❤️ for transparent electoral data access**
