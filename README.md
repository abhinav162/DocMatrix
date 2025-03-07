# Document Scanning and Matching System

A self-contained document scanning and matching platform designed for personal use within a company. It allows users to upload `.txt` files, scan them against a database of `.txt` and `.pdf` documents, and retrieve matches based on semantic similarity.

## Features

- User authentication and role-based access control
- Credit system with daily free scans and admin-managed additional credits
- AI-powered document matching with Google Gemini (fallback to basic algorithms)
- Smart analytics dashboard for admins
- Email notifications for key events (e.g., new user registration, credit usage, credits request approval, etc.)

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
3. Initialize the database: `npm run db:init`, make sure to set up the `sqlitecloud` database connection in the `.env` file
4. Start the development server: `npm run dev`
5. Open `http://localhost:4000` in your browser to access the application

## API Documentation

- The API documentation is available at `/api-docs` when the server is running.

## License

All rights reserved.
