# Setup Commands for ADHD & Stress Monitoring App

## Prerequisites
Make sure you have Node.js (v14 or higher) and MongoDB installed on your system.

## Backend Setup

1. Navigate to the backend directory:
```bash
cd /home/mohamed/Documents/adhd/backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start MongoDB (if not already running):
```bash
# For Linux systems with MongoDB installed
sudo systemctl start mongod

# For macOS with Homebrew
brew services start mongodb-community

# For Windows
# Start MongoDB from the Services panel
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will start on port 5000 (or the port specified in your .env file).

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd /home/mohamed/Documents/adhd/frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend server will start on port 3000.

## Accessing the Application

Once both servers are running, open your browser and navigate to:
```
http://localhost:3000
```

## Running the Application in Production

### Backend Production Build

1. Navigate to the backend directory:
```bash
cd /home/mohamed/Documents/adhd/backend
```

2. Start the production server:
```bash
npm start
```

### Frontend Production Build

1. Navigate to the frontend directory:
```bash
cd /home/mohamed/Documents/adhd/frontend
```

2. Build the frontend for production:
```bash
npm run build
```

3. Preview the production build:
```bash
npm run preview
```

## Troubleshooting

### MongoDB Connection Issues
If you encounter MongoDB connection issues, make sure MongoDB is running and check the MONGODB_URI in your backend .env file.

### Port Already in Use
If port 5000 or 3000 is already in use, you can change the port in the respective .env files or server configuration.

### Dependency Issues
If you encounter dependency issues, try deleting node_modules and package-lock.json, then run npm install again.

## Additional Notes

- The application uses axios version 1.4.0 for security reasons
- Make sure to update the JWT_SECRET and ENCRYPTION_KEY in your backend .env file for production use
- For deployment, consider using a production MongoDB instance (MongoDB Atlas) instead of a local instance
