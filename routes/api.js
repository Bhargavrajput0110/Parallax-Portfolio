const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuditRequest = require('../models/AuditRequest');
const emailService = require('../services/emailService');
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

// POST /api/audit - Submit audit request
router.post('/audit', auditValidation, async (req, res) => {
    try {
        // Check for validation errors
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
            console.warn('DB save failed, falling back to local file:', dbErr && dbErr.message);
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
            ]).catch(err => console.error('Error sending emails (fallback):', err && err.message));

            return res.status(201).json({
                success: true,
                message: 'Audit request saved (local fallback)',
                data: { id: fallbackEntry._id, name: fallbackEntry.name, email: fallbackEntry.email, company: fallbackEntry.company }
            });
        }

    } catch (error) {
        console.error('Error submitting audit request:', error && error.message);
        res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
});

// GET /api/audit - Get all audit requests (admin endpoint)
router.get('/audit', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    try {
        const auditRequests = await AuditRequest.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await AuditRequest.countDocuments();
        return res.json({ success: true, data: auditRequests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (dbErr) {
        console.warn('DB fetch failed, using fallback file:', dbErr && dbErr.message);
        const all = readFallback();
        const total = all.length;
        const pageItems = all.slice(skip, skip + limit);
        return res.json({ success: true, data: pageItems, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
});

// GET /api/audit/:id - Get single audit request
router.get('/audit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const auditRequest = await AuditRequest.findById(id);
        if (auditRequest) return res.json({ success: true, data: auditRequest });
    } catch (dbErr) {
        console.warn('DB lookup failed, trying fallback:', dbErr && dbErr.message);
    }
    const all = readFallback();
    const found = all.find(a => String(a._id) === String(id));
    if (!found) return res.status(404).json({ success: false, message: 'Audit request not found' });
    return res.json({ success: true, data: found });
});

// PATCH /api/audit/:id - update fields (status, message, etc.)
router.patch('/audit/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body || {};
    try {
        const updated = await AuditRequest.findByIdAndUpdate(id, updates, { new: true });
        if (updated) return res.json({ success: true, data: updated });
    } catch (dbErr) {
        console.warn('DB patch failed, falling back to file:', dbErr && dbErr.message);
    }
    // Fallback
    const arr = readFallback();
    const idx = arr.findIndex(a => String(a._id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    arr[idx] = Object.assign({}, arr[idx], updates, { updatedAt: new Date().toISOString() });
    writeFallback(arr);
    return res.json({ success: true, data: arr[idx] });
});

// DELETE /api/audit/:id - remove
router.delete('/audit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const removed = await AuditRequest.findByIdAndDelete(id);
        if (removed) return res.json({ success: true, data: removed });
    } catch (dbErr) {
        console.warn('DB delete failed, falling back to file:', dbErr && dbErr.message);
    }
    // Fallback
    const arr = readFallback();
    const idx = arr.findIndex(a => String(a._id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    const removed = arr.splice(idx, 1)[0];
    writeFallback(arr);
    return res.json({ success: true, data: removed });
});

module.exports = router;
