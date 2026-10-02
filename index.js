require('dotenv').config(); 
const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors'); 
const path = require('path'); // Kept if you use it later  // Kept if you use it later
const authRoutes = require('./routes/route');

const app = express();

// Configuration Variables
const PORT = process.env.PORT || 3000;  
const MONGODB_URI = process.env.MONGODB_URI; // Using this as our single source of truth
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';

// 1. GLOBAL MIDDLEWARE (Must be before routes)
// app.use(cors({ 
//     origin: FRONTEND_URL, 
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
//     allowedHeaders: ['Content-Type', 'Authorization'] 
// }));
app.use(express.json());
app.use(cors())
app.use('/api', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));

// 2. MONGODB CONNECTION
if (!MONGODB_URI) {
    console.error("CRITICAL ERROR: MONGODB_URI is not defined in the environment variables!");
    process.exit(1); 
}


mongoose.connect(MONGODB_URI, {
    dbName:'school',
     autoSelectFamily: false
     }) 
    .then(() => console.log("Connected successfully to MongoDB")) 
    .catch((err) => console.error('MongoDB connection error:', err));

// 4. START SERVER
app.listen(PORT, () => { 
    console.log(`Server running at http://localhost:${PORT}`); 
});
