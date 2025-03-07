# Document Scanning and Matching System

A self-contained document scanning and matching platform designed for personal use within a company. It allows users to upload `.txt` files, scan them against a database of `.txt` and `.pdf` documents, and retrieve matches based on semantic similarity.

## Features

- User authentication and role-based access control
- Credit system with daily free scans and admin-managed additional credits
- AI-powered document matching with Google Gemini (fallback to basic algorithms)
- Smart analytics dashboard for admins
- Email notifications for key events

## Project Structure

```
document-scanner/
├── frontend/         # HTML, CSS, JS frontend
└── backend/          # Node.js Express TypeScript backend
```

## Setup Instructions

### Backend

1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Open `index.html` in your browser

## API Documentation

- The API documentation is available at `/api-docs` when the server is running.

## License

All rights reserved.
