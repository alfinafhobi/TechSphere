require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Registration = require('./models/Registration');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static frontend files safely from the root
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, '../style.css')));
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, '../script.js')));

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

// POST Route for Registration
app.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, college, department, year, gender, category } = req.body;

        // Basic server-side validation check
        if (!fullName || !email || !phone || !college || !year || !gender || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be provided.' 
            });
        }

        // Check for duplicate email
        const existingRegistration = await Registration.findOne({ email: email.toLowerCase() });
        if (existingRegistration) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered.'
            });
        }

        // Create new registration
        const newRegistration = new Registration({
            fullName,
            email,
            phone,
            college,
            department,
            year,
            gender,
            category
        });

        // Save to database
        await newRegistration.save();

        console.log('New Registration Saved:', newRegistration.email);

        // Return success response to the client
        res.status(201).json({
            success: true,
            message: 'Registration successful! Your details have been recorded.',
            data: {
                fullName: newRegistration.fullName,
                email: newRegistration.email,
                category: newRegistration.category
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration. Please try again later.'
        });
    }
});

// Start the server (only if run locally)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export the Express API for Vercel
module.exports = app;
