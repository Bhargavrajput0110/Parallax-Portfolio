require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api', apiRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/audit', (req, res) => {
    res.sendFile(path.join(__dirname, 'audit.html'));
});

// Admin auth middleware (simple bearer token)
const adminAuth = (req, res, next) => {
    const adminKey = process.env.ADMIN_KEY || 'admin-secret-key-change-me';
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');

    if (token !== adminKey) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Protect admin API endpoints
app.use('/api/admin', adminAuth);

// MongoDB Connection (optional)
async function startServer() {
    if (process.env.MONGODB_URI) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.warn('⚠️ MongoDB connection failed — continuing without DB:', error.message || error);
        }
    } else {
        console.warn('⚠️ No MONGODB_URI configured — running without database.');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
        }
    } catch (err) {
        console.warn('Error closing MongoDB connection', err);
    }
    process.exit(0);
});
