# SeismoScan — Web-Based RVS Database System for Seismic Assessment of Buildings

A full-stack web application that digitalizes the **Rapid Visual Screening (RVS)** process based on **FEMA P-154**. Built with React.js, Node.js/Express, and MySQL.

---

## System Requirements

- **Node.js** v18 or higher: https://nodejs.org/en/download
- **MySQL** 8.0 or higher via **XAMPP** (recommended for Windows): https://www.apachefriends.org/download.html
- **Git** (optional): https://git-scm.com/download/win

---

## Project Structure

```
seismoscan/
├── backend/          ← Node.js + Express API server
├── frontend/         ← React.js application
├── database/         ← MySQL SQL schema file
└── README.md         ← This file
```

---

## Step-by-Step Setup Guide (Windows)

### STEP 1 — Install XAMPP and Start MySQL

1. Download and install XAMPP from https://www.apachefriends.org/download.html
2. Open the **XAMPP Control Panel**
3. Click **Start** next to **Apache** and **MySQL**
4. Open your browser and go to: http://localhost/phpmyadmin

### STEP 2 — Create the Database

1. In phpMyAdmin, click **"New"** in the left sidebar
2. Name the database: `seismoscan`
3. Click **"Create"**
4. Click on the `seismoscan` database
5. Click the **"Import"** tab
6. Click **"Choose File"** → navigate to and select:
   ```
   C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\database\seismoscan.sql
   ```
7. Click **"Go"** — all tables will be created automatically

### STEP 3 — Configure the Backend

1. Navigate to the backend folder:
   ```
   cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\backend
   ```
2. Copy the example environment file:
   ```
   copy .env.example .env
   ```
3. Open `.env` in Notepad and set your MySQL password:
   ```
   DB_PASSWORD=your_xampp_mysql_password
   ```
   > Note: Default XAMPP MySQL root password is usually blank (empty). Leave DB_PASSWORD= empty if so.
4. Save the `.env` file.

### STEP 4 — Install Backend Dependencies

Open Command Prompt in the backend folder and run:
```cmd
cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\backend
npm install
```

### STEP 5 — Start the Backend Server

```cmd
npm start
```

You should see:
```
MySQL database connected successfully
SeismoScan API server running on http://localhost:5000
```

> Leave this Command Prompt window open.

### STEP 6 — Install Frontend Dependencies

Open a **NEW** Command Prompt window and run:
```cmd
cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\frontend
npm install
```

> This may take 3–5 minutes as it downloads React dependencies.

### STEP 7 — Start the Frontend

```cmd
npm start
```

The browser will automatically open at: **http://localhost:3000**

---

## Default Login Credentials

| Role      | Email                     | Password   |
|-----------|---------------------------|------------|
| Admin     | admin@seismoscan.com      | Admin@123  |

> **Important:** Change the admin password immediately after first login!

---

## Quick Start Commands Summary

Open **two separate Command Prompt windows**:

**Window 1 — Backend:**
```cmd
cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\backend
npm start
```

**Window 2 — Frontend:**
```cmd
cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\frontend
npm start
```

Then open: **http://localhost:3000**

---

## Development Mode (Auto-Reload)

For development with auto-reload on code changes:

**Backend (with nodemon):**
```cmd
npm run dev
```

**Frontend:**
```cmd
npm start
```

---

## Features

### Inspector Role
- Create and manage building records
- Perform RVS assessments using the FEMA P-154 form
- Real-time automatic score computation (SL1)
- Upload building photos
- View assessment results (PASS/FAIL)
- Generate and print RVS reports
- Export reports to PDF

### Admin Role
- All inspector features
- Manage user accounts
- View all assessments across all inspectors
- System-wide dashboard and statistics

---

## FEMA P-154 Scoring Logic

The system automatically computes:

1. **Base Score** — Retrieved from the FEMA building type table (HIGH seismicity region)
2. **Score Modifiers:**
   - Vertical irregularity (severe or moderate)
   - Plan irregularity
   - Pre-code building
   - Post-benchmark building
   - Soil type (A/B, or E)
3. **Final Score (SL1)** = Base Score + Sum of Modifiers

**Decision:**
- SL1 ≥ 2.0 → **PASS** (No Level 2 evaluation required)
- SL1 < 2.0 → **FAIL** (Level 2 structural evaluation required)

---

## API Endpoints

| Method | Endpoint                    | Description                   |
|--------|-----------------------------|-------------------------------|
| POST   | /api/auth/login             | Login                         |
| POST   | /api/auth/register          | Register new inspector        |
| GET    | /api/auth/profile           | Get current user profile      |
| POST   | /api/buildings              | Create building               |
| GET    | /api/buildings              | List all buildings            |
| GET    | /api/buildings/:id          | Get building details          |
| PUT    | /api/buildings/:id          | Update building               |
| POST   | /api/rvs                    | Create RVS assessment         |
| GET    | /api/rvs                    | List assessments              |
| GET    | /api/rvs/:id                | Get assessment details        |
| POST   | /api/rvs/compute-score      | Live score preview            |
| GET    | /api/reports/:id            | Get full report               |
| GET    | /api/reports/dashboard      | Dashboard statistics          |
| POST   | /api/photos                 | Upload building photo         |
| GET    | /api/users                  | List users (admin only)       |
| POST   | /api/users                  | Create user (admin only)      |

---

## Troubleshooting

### "Cannot connect to database"
- Make sure XAMPP is running and MySQL is started
- Check your `.env` file for correct credentials
- Default XAMPP MySQL: host=localhost, user=root, password=(empty)

### "Port 3000 is already in use"
- Change the React port: `set PORT=3001 && npm start` (Windows)

### "Port 5000 is already in use"
- Change the backend port in `.env`: `PORT=5001`
- Update `frontend/package.json` proxy to match: `"proxy": "http://localhost:5001"`

### "npm is not recognized"
- Install Node.js from https://nodejs.org and restart Command Prompt

### npm install takes too long or fails
- Check your internet connection
- Try: `npm install --legacy-peer-deps`

---

## Security Notes

- JWT tokens expire after 24 hours by default
- Passwords are hashed using bcrypt (10 rounds)
- All API endpoints require authentication
- Admin-only routes are protected by role middleware
- File uploads are restricted to image formats only

---

## Technology Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend  | Node.js, Express.js 4    |
| Database | MySQL 8 (via XAMPP)      |
| Auth     | JWT (jsonwebtoken)       |
| Security | bcryptjs, CORS           |
| PDF      | html2pdf.js              |

---

## Academic Information

**Project Title:** SeismoScan – A Web-Based Rapid Visual Screening (RVS) Database System for Seismic Assessment of Buildings

**Reference Standard:** FEMA P-154 (Rapid Visual Screening of Buildings for Potential Seismic Hazards)

**Course:** CENG 116B

For questions or issues, contact the system administrator.
