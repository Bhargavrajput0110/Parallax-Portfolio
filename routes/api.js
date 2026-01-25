const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuditRequest = require('../models/AuditRequest');
const emailService = require('../services/emailService');

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

        // Create new audit request
        const auditRequest = new AuditRequest({
            name: req.body.name,
            email: req.body.email,
            company: req.body.company,
            website: req.body.website,
            message: req.body.message
        });

        // Save to database
        await auditRequest.save();

        // Send emails (don't wait for them to complete)
        Promise.all([
            emailService.sendAuditConfirmation(auditRequest),
            emailService.sendAdminNotification(auditRequest)
        ]).catch(err => {
            console.error('Error sending emails:', err);
            // Don't fail the request if emails fail
        });

        res.status(201).json({
            success: true,
            message: 'Audit request submitted successfully',
            data: {
                id: auditRequest._id,
                name: auditRequest.name,
                email: auditRequest.email,
                company: auditRequest.company
            }
        });

    } catch (error) {
        console.error('Error submitting audit request:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
});

// GET /api/audit - Get all audit requests (admin endpoint)
router.get('/audit', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const auditRequests = await AuditRequest.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditRequest.countDocuments();

        res.json({
            success: true,
            data: auditRequests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching audit requests:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching audit requests'
        });
    }
});

// GET /api/audit/:id - Get single audit request
router.get('/audit/:id', async (req, res) => {
    try {
        const auditRequest = await AuditRequest.findById(req.params.id);

        if (!auditRequest) {
            return res.status(404).json({
                success: false,
                message: 'Audit request not found'
            });
        }

        res.json({
            success: true,
            data: auditRequest
        });

    } catch (error) {
        console.error('Error fetching audit request:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the audit request'
        });
    }
});

module.exports = router;
