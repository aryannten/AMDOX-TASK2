# Certificate Verification System (MERN)

A web application to **issue, store, verify, and download internship certificates** using a unique **Certificate ID**. Admins can upload student/certificate data in bulk via **Excel**, while students (or public users) can **search and verify** certificates and **download a PDF**.

---

## Features

- **User Roles & Authentication**
  - Admin registration and login (Firebase Authentication)
  - **Email/Password** authentication
  - **Google Sign-In** (redirect-based, no popup blockers)
  - Automatic admin claim assignment after registration
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

- **Frontend**: 
  - React 18 + Vite
  - React Router (client-side routing)
  - Firebase Authentication (Email/Password + Google)
  - Modern CSS (inline styles with dark theme)
- **Backend**: 
  - Node.js + Express.js
  - Firebase Admin SDK (token verification)
  - MongoDB with Mongoose
- **File Processing**: 
  - `multer` (file uploads)
  - `xlsx` (Excel parsing)
  - `pdf-lib` (PDF generation)
- **Validation**: 
  - `zod` (schema validation)

---

## Project Structure

```
AMDOX-TASK2/
  client/                 # React frontend (Vite)
    src/
      pages/              # Home, Verify, Admin pages
      lib/                # Firebase config, API client
    .env                  # Frontend environment variables
  server/                 # Express backend
    src/
      routes/             # API routes (auth, certificates)
      models/             # MongoDB models
      middleware/         # Auth middleware
      lib/                # DB connection, Firebase Admin
    .env                  # Backend environment variables
  README.md
```

---

## Prerequisites

- **Node.js** (v18+ recommended, v22 tested)
- **npm** (comes with Node.js)
- **MongoDB Atlas account** (free tier) or local MongoDB
- **Firebase account** (free tier)

---

## Environment Variables

Create a `.env` file inside `server/` (copy `server/env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
CORS_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Never commit `.env` files to GitHub.

Create a `.env` file inside `client/` (copy `client/env.example`):

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

## API Endpoints

### Auth
- `POST /api/auth/set-admin-claim` *(Requires authentication)*
  - Sets `admin: true` custom claim for the authenticated user
  - Used automatically after registration
  - Headers: `Authorization: Bearer <firebase_id_token>`

### Certificates
- `POST /api/certificates/import` *(Admin only)*
  - Form-data: `file` = `.xlsx`
  - Returns: `{ inserted, updated, failed, total }`
  - Headers: `Authorization: Bearer <firebase_id_token>`
- `GET /api/certificates/:certificateId` *(Public)*
  - Returns certificate details for verification
  - Response: `{ certificate: {...} }`
- `GET /api/certificates/:certificateId/pdf` *(Public)*
  - Returns downloadable PDF file
  - Content-Type: `application/pdf`

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
Make sure your backend `CORS_ORIGIN` matches your deployed frontend URL. For multiple origins, use comma-separated values:
```env
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
```

### Firebase Authorized Domains
When deploying, add your frontend domain to Firebase Console:
- **Authentication → Settings → Authorized domains**
- Add your deployed domain (e.g., `your-app.vercel.app`)

---

## Firebase Auth Setup

### 1) Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. **Enable Authentication:**
   - Go to **Authentication → Sign-in method**
   - Enable **Email/Password** (required)
   - Enable **Google** (optional, for Google sign-in)
   - Click **Save**

### 2) Get Frontend Config (Web App)
1. Firebase Console → **Project Settings → General**
2. Scroll to **"Your apps"** section
3. Click **"Add app" → Web** (or use existing web app)
4. Copy the config values into `client/.env`:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

### 3) Get Backend Config (Service Account)
1. Firebase Console → **Project Settings → Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Extract these values into `server/.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   > **Important:** Keep the `\n` characters in `FIREBASE_PRIVATE_KEY` exactly as shown.

### 4) Admin Role Setup
- **Firebase Custom Claims** (implemented)
  - After registration, the app automatically sets `admin: true` custom claim
  - Backend middleware checks this claim to protect admin routes
  - No manual setup required - just register/login and admin access is granted

---

## Admin Setup

### Registration Flow
1. Go to **Admin** page (`/admin`)
2. Click **"Register New Admin"** tab
3. Enter email and password (min 6 characters)
4. Click **"Register"**
5. Admin claim is set automatically
6. Sign out and sign in again to activate admin access

### Login Options
- **Email/Password**: Use registered credentials
- **Google Sign-In**: Click "Sign in with Google" (redirect-based, no popup blockers)

### First-Time Setup
- The first admin must register via the **"Register New Admin"** option
- Subsequent admins can also register themselves
- All registered users automatically get admin permissions

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

### Admin Workflow
1. **Register/Login**
   - Go to `/admin` page
   - Register new admin OR login with existing credentials
   - Or use Google Sign-In
2. **Import Certificates**
   - After login, the "Import Certificates" section appears
   - Upload Excel file (`.xlsx` format)
   - View import summary (inserted/updated/failed rows)

### Student/Verifier Workflow
1. **Verify Certificate**
   - Go to `/verify` page (or click "Verify Certificate" on home)
   - Enter **Certificate ID**
   - View certificate details
2. **Download PDF**
   - Click "Download PDF" button
   - Certificate is downloaded as PDF file

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

## Troubleshooting

### Firebase Authentication Errors

**Error: `auth/operation-not-allowed`**
- **Solution**: Enable Email/Password in Firebase Console
  - Go to Firebase Console → Authentication → Sign-in method
  - Enable "Email/Password"
  - Click Save

**Error: `auth/popup-blocked` (Google Sign-In)**
- **Solution**: Already fixed! The app uses redirect-based Google sign-in (no popups)
- If you still see this, ensure popups are allowed in browser settings

**Error: `Missing Firebase config`**
- **Solution**: Check your `client/.env` file
- Ensure all `VITE_FIREBASE_*` variables are set
- Restart the frontend dev server after changing `.env`

### Backend Errors

**Error: `Missing MONGODB_URI`**
- **Solution**: Check your `server/.env` file
- Ensure `MONGODB_URI` is set with your MongoDB Atlas connection string
- Restart the backend server after changing `.env`

**Error: `Invalid Firebase private key`**
- **Solution**: Ensure `FIREBASE_PRIVATE_KEY` in `server/.env` includes:
  - Quotes around the entire key: `"-----BEGIN...-----END PRIVATE KEY-----\n"`
  - `\n` characters preserved (don't replace with actual newlines)

### Import Errors

**Excel import fails silently**
- Check browser console for errors
- Ensure Excel file has correct headers (see Excel Import Format section)
- Verify admin is logged in and has admin claim

**Certificate not found**
- Verify the Certificate ID is correct (case-sensitive)
- Check MongoDB to ensure certificate was imported successfully

---

## Roadmap (Optional Enhancements)

- QR code on certificates linking to `/verify/:certificateId`
- Import preview before saving to DB
- Audit logs for imports (who imported, when, summary)
- Email certificate to student (can be done with free-tier providers, optional)
- Certificate template customization
- Bulk certificate download

---

## License

This project is intended for educational/internship use. Add a license if publishing publicly (e.g., MIT).

---

## Contact

For questions or support, add your email/LinkedIn here.
