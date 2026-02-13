const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    city: { type: String },

    status: {
        type: String,
        enum: ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiation', 'Qualified', 'Closed Won', 'Closed Lost'],
        default: 'New'
    },

    source: {
        type: String,
        enum: ['LinkedIn', 'Cold Call', 'Website', 'Referral', 'WhatsApp', 'Exhibition', 'Other'],
        default: 'Other'
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agentName: { type: String }, // Redundant but helpful for legacy AM naming

    estimatedValue: { type: Number, default: 0 },
    requirement: { type: String },

    // Activity History
    activities: [{
        note: String,
        date: { type: Date, default: Date.now },
        author: String
    }],

    nextFollowUpDate: { type: Date },
    lastInteraction: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
