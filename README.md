# Certificate Verification System (MERN)

A web application to **issue, store, verify, and download internship certificates** using a unique **Certificate ID**. Admins can upload student/certificate data in bulk via **Excel**, while students (or public users) can **search and verify** certificates and **download a PDF**.

---

## Features

- **User Roles & Authentication**
  - Admin login (Firebase Authentication)
  - Role-based access control (Admin-only actions protected)
  - Backend verifies Firebase ID tokens (Firebase Admin SDK)

- **Data Management (Excel Import)**
  - Upload bulk certificate data via `.xlsx`
  - Server-side validation during import
  - Duplicate handling (prevent/skip/update based on implementation choice)

- **Certificate Verification**
  - Search by **Certificate ID**
  - Display certificate details for verification
  - Optional QR code linking to verification page

- **Certificate Download**
  - Download a **printable PDF** after verification

- **Security & Data Integrity**
  - Input validation
  - Protected routes for admin operations
  - Safe storage in MongoDB

---

## Tech Stack

- **Frontend**: React + Vite, React Router, Tailwind CSS / Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: Firebase Authentication (client) + Firebase Admin SDK (server-side token verification)
- **Excel Parsing**: `multer`, `xlsx`
- **PDF Generation**: `pdf-lib` (or Puppeteer for HTML-to-PDF templates)

---

## Project Structure (Suggested)

```
AMDOX-TASK2/
  client/                 # React frontend
  server/                 # Express backend
  README.md
```

---

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB Atlas account** (free tier) or local MongoDB

---

## Environment Variables

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
CORS_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Never commit `.env` files to GitHub.

Create a `.env` file inside `client/`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Private Key Note (Windows-friendly)
When copying `FIREBASE_PRIVATE_KEY` into `.env`, keep the `\n` newlines exactly as shown. Most Node apps load it like:
- `process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')`

---

## Excel Import Format

Upload an `.xlsx` file containing **one sheet** with the following headers (recommended):

| Column Header | Example |
|-------------:|:--------|
| certificateId | AMDOX-INT-0001 |
| studentName | Aryan Sharma |
| domain | Full Stack Development |
| internshipStart | 2025-12-01 |
| internshipEnd | 2026-01-15 |
| issueDate | 2026-01-20 |

### Notes
- `certificateId` should be **unique**
- Use consistent date format (ISO `YYYY-MM-DD` preferred)
- Extra columns can be ignored or stored based on your schema

---

## API Endpoints (Proposed)

### Auth (Firebase)
Authentication happens via **Firebase Auth on the frontend**. For protected APIs, send:
- Header: `Authorization: Bearer <firebase_id_token>`

### Certificates
- `POST /api/certificates/import` *(Admin only)*
  - Form-data: `file` = `.xlsx`
- `GET /api/certificates/:certificateId`
  - Returns certificate details for verification
- `GET /api/certificates/:certificateId/pdf`
  - Returns downloadable PDF

---

## Local Setup (Recommended Steps)

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd AMDOX-TASK2
```

### 2) Setup Backend

```bash
cd server
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3) Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Free Deployment (No Cost)

### Database (Free)
- **MongoDB Atlas (M0 Free Tier)**
  - Create a free cluster
  - Whitelist your IP (or use `0.0.0.0/0` temporarily for testing)
  - Copy connection string into `MONGODB_URI`

### Backend (Free)
Use **Render** (free tier):
- Create a new **Web Service**
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start` (or `node index.js`)
- Add environment variables from `.env`

### Frontend (Free)
Use **Cloudflare Pages** or **Vercel** (free tier):

- **Cloudflare Pages**
  - Connect your GitHub repo
  - Framework preset: **Vite**
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Add environment variable (example):
    - `VITE_API_BASE_URL=https://<your-backend-domain>`

- **Vercel**
  - Import your repo
  - Root directory: `client`
  - Set `VITE_API_BASE_URL` in Project Settings → Environment Variables

### CORS Note
Make sure your backend `CORS_ORIGIN` matches your deployed frontend URL.

---

## Firebase Auth Setup (Recommended)

### 1) Create Firebase Project
- Create a Firebase project
- Enable **Authentication → Sign-in method → Email/Password** (and Google if needed)

### 2) Create Web App (Frontend config)
- Firebase Console → Project Settings → Your apps → Web app
- Copy values into `client/.env` (`VITE_FIREBASE_*`)

### 3) Create Service Account (Backend verification)
- Firebase Console → Project Settings → Service accounts
- Generate a new private key JSON
- Put these into `server/.env`:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

### 4) Admin Role (Two common options)
- **Option A (recommended): Firebase Custom Claims**
  - Set `admin: true` on specific Firebase users via Admin SDK
  - Backend checks claim to protect admin routes (like Excel import)
- **Option B: MongoDB role mapping**
  - Store `{ uid, role }` in MongoDB
  - Backend checks DB for role on each request

---

## Admin Setup (Recommended)

You can choose one approach:

- **Firebase Custom Claims (best)**
  - Create one admin account in Firebase Auth (email/password)
  - Run a one-time script to set `admin: true` claim for that user
- **MongoDB role mapping**
  - Insert your admin `uid` in a `users` collection with role `admin`

---

## NPM Scripts (Suggested)

### `server/`
- `npm run dev` — start backend in development (nodemon)
- `npm start` — start backend in production

### `client/`
- `npm run dev` — start frontend in development
- `npm run build` — build frontend for production
- `npm run preview` — preview production build locally

---

## Usage (Quick Demo Flow)

- **Admin**
  - Login
  - Upload Excel file from the dashboard
  - Confirm import summary (inserted/updated/failed rows)

- **Student / Verifier**
  - Open verification page
  - Enter **Certificate ID**
  - View certificate details
  - Download the PDF

---

## Screenshots

Add your UI screenshots here:

```
docs/screenshots/
  home.png
  admin-dashboard.png
  verify.png
  certificate.png
```

Then reference them in this README (example):
- `docs/screenshots/home.png`

---

## Roadmap (Optional Enhancements)

- QR code on certificates linking to `/verify/:certificateId`
- Import preview before saving to DB
- Audit logs for imports (who imported, when, summary)
- Email certificate to student (can be done with free-tier providers, optional)

---

## License

This project is intended for educational/internship use. Add a license if publishing publicly (e.g., MIT).

---

## Contact

For questions or support, add your email/LinkedIn here.
