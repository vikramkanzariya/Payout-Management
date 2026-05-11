# Payout Management System MVP

A full-stack web application designed to manage vendor payouts with Role-Based Access Control (RBAC) and  status workflows. 

## Features
- **Role-Based Access Control**: Two distinct roles (`OPS` and `FINANCE`) with completely separated capabilities.
- **Vendor Management**: Create and list vendors.
- **Payout Workflow**: Strict state machine for payout statuses (`Draft` ➔ `Submitted` ➔ `Approved` or `Rejected`).
- **Audit Trail**: Every action taken on a payout is logged with the user's name, role, and a timestamp.
- **Backend Validation**: Strict server-side validation using `express-validator` to ensure data integrity.

## Tech Stack
- **Frontend**: React.js, React Router, Axios, CSS modules
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)

---

## 🚀 How to Run the Project (Locally in under 5 minutes)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Database Setup
1. Create a free MongoDB Atlas cluster.
2. In Atlas, go to **Database Access** and create a new Database User with a username and password.
3. Go to **Network Access** and whitelist your current IP address (or use `0.0.0.0/0` for testing).
4. Get your connection string (Node.js driver) from Atlas.

### 2. Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
npm install
```

Create an environment file:
1. Copy `.env.example` and rename it to `.env`.
2. Update the `.env` file with your MongoDB connection string (replace `<username>` and `<password>` with your Database User credentials). It should look like this:
```env
MONGODB_URI=mongodb+srv://your_user:your_password@cluster0.mongodb.net/payout_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

**Seed the Database & Start the Server:**
Run the following commands to populate your MongoDB with dummy data and start the backend:
```bash
npm run seed
npm run dev
```
*The backend will now be running on `http://localhost:5000`.*

### 3. Frontend Setup
Open a **new** terminal window and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will now be running on `http://localhost:5173`.*

---

## 🧪 Test Credentials

Once both servers are running, open `http://localhost:5173` in your browser. Use the following seeded accounts to test the application:

**OPS Role** (Can create and submit payouts, and add vendors)
- **Email:** `ops@demo.com`
- **Password:** `ops123`

**FINANCE Role** (Can approve or reject payouts)
- **Email:** `finance@demo.com`
- **Password:** `fin123`

---

## 📌 Assumptions Made During Development
1. **Frontend Role Enforcement:** While the UI hides/disables buttons based on the user's role, the **ultimate source of truth is the backend**. The API explicitly rejects unauthorized requests via middleware, guaranteeing security even if the frontend is bypassed.
2. **Database Choice:** Migrated to MongoDB Atlas (Mongoose) over a SQL database for ease of cloud deployment and flexible document structures for the Audit trail.
3. **Audit History Tracking:** To prevent massive table joins, basic user details (`performed_by_name`, `performed_by_role`) are denormalized and stored directly inside the `PayoutAudit` documents for quick retrieval.
