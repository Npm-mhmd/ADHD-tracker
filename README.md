# ADHD & Stress Monitoring App for Tunisian Schools

A web application designed to help teachers in Tunisia identify early signs of ADHD and stress in primary school students. The app allows teachers to log real-time behavior data and parents to monitor their child's progress via a unique Student ID.

## Features

### For Teachers
- Sign up and manage account
- Create and manage classes
- Add students to classes (generates a unique studentID)
- Log observations with a fast, one-tap interface
- Track behaviors: Focus, Physical Energy, Impulsivity, and Stress Levels (Scale 1-5)
- Quick action buttons for common behaviors: "Lost Focus," "Interrupted," "Fidgeting," etc.
- Mobile-friendly interface for easy use during class

### For Parents
- Sign up and link to their child using the studentID provided by the teacher
- View a "Habit Tracker" dashboard showing charts of their child's focus and stress trends over time
- Monitor average scores for each behavior category
- Access to daily observations with detailed notes

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- crypto-js for data encryption

### Frontend
- React.js (Vite)
- Tailwind CSS
- Recharts for data visualization
- Axios for API requests
- React Router for navigation

## Project Structure

```
adhd/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   └── observations.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── TeacherDashboard.jsx
│   │   │   │   └── ParentDashboard.jsx
│   │   │   └── ObservationLog/
│   │   │       └── ObservationLog.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/adhd-monitoring
   JWT_SECRET=your-secret-key-change-in-production
   ENCRYPTION_KEY=your-encryption-key-change-in-production
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   or for production:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following environment variable:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Teacher Workflow
1. Sign up as a teacher with your name, email, phone, and password
2. Create a class (e.g., "4ème Sc Exp")
3. Add students to the class (the system will generate a unique studentID for each)
4. Share the studentID with the parents
5. Use the Observation Log to track behaviors with one-tap buttons or custom observations

### Parent Workflow
1. Sign up as a parent
2. Link to your child using the studentID provided by the teacher
3. View the Habit Tracker dashboard to see your child's progress
4. Monitor focus and stress trends over time with interactive charts

## Data Security

- Student names are encrypted using AES-256-CBC encryption
- Parents can only view data if they have the exact Student ID
- JWT-based authentication ensures secure access to the application
- Passwords are hashed using bcrypt before storage

## License

This project is licensed under the ISC license.
