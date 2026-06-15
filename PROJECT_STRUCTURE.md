## Directory Structure

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
│   ├── utils/
│   │   └── encryption.js
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
│   │   │   │   ├── StudentCard.jsx
│   │   │   │   └── ParentDashboard.jsx
│   │   │   ├── ObservationLog/
│   │   │   │   ├── HabitTracker.jsx
│   │   │   │   └── ObservationLog.jsx
│   │   │   └── Charts/
│   │   │       └── FocusTrendChart.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── encryption.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── README.md
```

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
