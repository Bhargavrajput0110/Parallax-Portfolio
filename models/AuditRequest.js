const mongoose = require('mongoose');

const auditRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [150, 'Company name cannot exceed 150 characters']
    },
    website: {
        type: String,
        required: [true, 'Website URL is required'],
        trim: true,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'contacted', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
auditRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('AuditRequest', auditRequestSchema);
