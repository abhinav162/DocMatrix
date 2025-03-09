# Document Scanning and Matching System

A self-contained document scanning and matching system. It allows users to upload `.txt` files, scan them against a database of `.txt` documents, and retrieve matches based on semantic similarity.

### Live Demo: https://docmatrix.zapto.org/

## Features

- AI-powered document matching with Google Gemini (fallback to Levenshtein distance algorithms)
- User authentication and role-based access control
- Credit system with daily free scans and admin-managed additional credits
- Automated credit reset at 11:59 PM
- Smart analytics dashboard for admins
- User activity summary (No of scans, documents uploaded)
- Document management (upload, view, delete)
- Multi-user support

## Tech Stack

- Backend: Node.js, Express, TypeScript
- Frontend: HTML, CSS, JavaScript
- Database: SQLite (Local) / SQLite Cloud

## Project Structure

```
DocMatrix/
├── /          # Node.js Express TypeScript backend
└── frontend/  # HTML, CSS, JS frontend
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- SQLite
- SQLite Cloud

### Start the application

1. Navigate to the project directory: `cd /`
2. Install dependencies: `npm install`
3. Set up the environment variables: `cp .env.example .env`
4. Set `GEMINI_API_KEY` in `.env` file. You can get it from [Google Gemini](https://aistudio.google.com/apikey).
5. Set up the database connection type and connection string in `.env`:
   - For local database: `DB_TYPE=LOCAL`
   - For cloud database: `DB_TYPE=CLOUD` and set up the `SQLITE_CLOUD_URI` ([Get cloud databse url from here](https://sqlitecloud.io/)). 
6. Initialize the database: `npm run db:init`
7. Start the development server: `npm run dev`
7. Open `http://localhost:4000` in your browser to access the application


### Test credentials

#### For Admin
- Username: `admin`
- Password: `admin1234`

#### For User
- Username: `test`
- Password: `test1234`

### Test data and usage

1. Download [test-data1.txt](https://storage.googleapis.com/gocsgc/docmatrix/test-data1.txt)
2. Download [test-data2.txt](https://storage.googleapis.com/gocsgc/docmatrix/test-data2.txt)
3. Go to [Upload](https://docmatrix.zapto.org/pages/upload.html) page and upload both files
4. Go to [Scan](https://docmatrix.zapto.org/pages/scan.html) page, select any file from dropdown and click `Scan` button
5. You will get the scan results

<!-- ## API Documentation

- The API documentation is available at `/api-docs` when the server is running.

## License

All rights reserved. -->
