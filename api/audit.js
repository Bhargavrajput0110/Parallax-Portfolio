const { body, validationResult } = require('express-validator');
const AuditRequest = require('../models/AuditRequest');
const emailService = require('../services/emailService');
const connectToDatabase = require('../lib/db');

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
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();

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

            // Create new audit request
            const auditRequest = new AuditRequest({
                name: req.body.name,
                email: req.body.email,
                company: req.body.company,
                website: req.body.website,
                message: req.body.message
            });

            await auditRequest.save();

            // Send emails (don't wait)
            Promise.all([
                emailService.sendAuditConfirmation(auditRequest),
                emailService.sendAdminNotification(auditRequest)
            ]).catch(err => {
                console.error('Error sending emails:', err);
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

        } else if (req.method === 'GET') {
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

        } else {
            res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
};
