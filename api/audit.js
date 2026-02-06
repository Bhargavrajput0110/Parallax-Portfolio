const { body, validationResult } = require('express-validator');
const AuditRequest = require('../models/AuditRequest');
const emailService = require('../services/emailService');
const connectToDatabase = require('../lib/db');
const fs = require('fs');
const path = require('path');

const FALLBACK_DIR = path.join(__dirname, '..', 'data');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'audits.json');

function ensureFallback() {
    if (!fs.existsSync(FALLBACK_DIR)) fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    if (!fs.existsSync(FALLBACK_FILE)) fs.writeFileSync(FALLBACK_FILE, JSON.stringify([]));
}

function readFallback() {
    try {
        ensureFallback();
        const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (err) {
        console.warn('Could not read fallback file:', err && err.message);
        return [];
    }
}

function writeFallback(arr) {
    try {
        ensureFallback();
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(arr, null, 2));
    } catch (err) {
        console.error('Could not write fallback file:', err && err.message);
    }
}

// Validation middleware
const auditValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('company')
        .trim()
        .notEmpty().withMessage('Company name is required')
        .isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters'),
    body('website')
        .trim()
        .notEmpty().withMessage('Website URL is required')
        .isURL().withMessage('Please provide a valid URL'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
];

// Helper to run middleware
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Try to connect to DB, but continue if it fails
        try {
            await connectToDatabase();
        } catch (dbErr) {
            console.warn('DB connection failed, will use fallback storage');
        }

        if (req.method === 'POST') {
            // Run validation
            for (const validation of auditValidation) {
                await runMiddleware(req, res, validation);
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const payload = {
                name: req.body.name,
                email: req.body.email,
                company: req.body.company,
                website: req.body.website,
                message: req.body.message
            };

            try {
                const auditRequest = new AuditRequest(payload);
                const saved = await auditRequest.save();

                Promise.all([
                    emailService.sendAuditConfirmation(saved),
                    emailService.sendAdminNotification(saved)
                ]).catch(err => console.error('Error sending emails:', err && err.message));

                return res.status(201).json({
                    success: true,
                    message: 'Audit request submitted successfully',
                    data: { id: saved._id, name: saved.name, email: saved.email, company: saved.company }
                });
            } catch (dbErr) {
                console.warn('DB save failed, using fallback:', dbErr && dbErr.message);
                const current = readFallback();
                const fallbackEntry = Object.assign({}, payload, {
                    _id: Date.now().toString(),
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
                current.unshift(fallbackEntry);
                writeFallback(current);

                Promise.all([
                    emailService.sendAuditConfirmation(fallbackEntry),
                    emailService.sendAdminNotification(fallbackEntry)
                ]).catch(err => console.error('Error sending emails:', err && err.message));

                return res.status(201).json({
                    success: true,
                    message: 'Audit request saved (local fallback)',
                    data: { id: fallbackEntry._id, name: fallbackEntry.name, email: fallbackEntry.email, company: fallbackEntry.company }
                });
            }

        } else if (req.method === 'GET') {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            const id = req.query.id;

            try {
                if (id) {
                    const auditRequest = await AuditRequest.findById(id);
                    if (auditRequest) return res.json({ success: true, data: auditRequest });
                } else {
                    const auditRequests = await AuditRequest.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
                    const total = await AuditRequest.countDocuments();
                    return res.json({ success: true, data: auditRequests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
                }
            } catch (dbErr) {
                console.warn('DB fetch failed, using fallback:', dbErr && dbErr.message);
            }

            // Fallback
            const all = readFallback();
            if (id) {
                const found = all.find(a => String(a._id) === String(id));
                if (!found) return res.status(404).json({ success: false, message: 'Not found' });
                return res.json({ success: true, data: found });
            } else {
                const total = all.length;
                const pageItems = all.slice(skip, skip + limit);
                return res.json({ success: true, data: pageItems, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
            }

        } else if (req.method === 'PATCH') {
            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, message: 'ID required' });

            try {
                const updated = await AuditRequest.findByIdAndUpdate(id, req.body, { new: true });
                if (updated) return res.json({ success: true, data: updated });
            } catch (dbErr) {
                console.warn('DB patch failed, falling back:', dbErr && dbErr.message);
            }

            // Fallback
            const arr = readFallback();
            const idx = arr.findIndex(a => String(a._id) === String(id));
            if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
            arr[idx] = Object.assign({}, arr[idx], req.body, { updatedAt: new Date().toISOString() });
            writeFallback(arr);
            return res.json({ success: true, data: arr[idx] });

        } else if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, message: 'ID required' });

            try {
                const removed = await AuditRequest.findByIdAndDelete(id);
                if (removed) return res.json({ success: true, data: removed });
            } catch (dbErr) {
                console.warn('DB delete failed, falling back:', dbErr && dbErr.message);
            }

            // Fallback
            const arr = readFallback();
            const idx = arr.findIndex(a => String(a._id) === String(id));
            if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
            const removed = arr.splice(idx, 1)[0];
            writeFallback(arr);
            return res.json({ success: true, data: removed });

        } else {
            return res.status(405).json({ success: false, message: 'Method not allowed' });
        }

    } catch (error) {
        console.error('Error:', error && error.message);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
