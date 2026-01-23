const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user record
    agentName: { type: String }, // Account Manager
    status: {
        type: String,
        enum: ['Pending Execution', 'Executed', 'Billed', 'Paid', 'Cancelled'],
        default: 'Pending Execution'
    },
    serviceLines: { type: String }, // Description of lines/service

    // NEW FIELDS as per user request
    orderType: { type: String, default: 'New Scale' }, // New Sale, Upgrade, Downgrade, etc.
    mrc: { type: Number, default: 0 }, // Monthly Recurring Charge
    initialRecharge: { type: Number, default: 0 },
    numberOfLines: { type: Number, default: 1 },
    remarks: { type: String },
    workOrderNumber: { type: String }, // e.g., VIVA-WO-20250122-001
    virtualNumber: { type: String }, // New Field

    // Reminder Fields
    followUpDate: { type: Date },
    followUpNotes: { type: String }
});

module.exports = mongoose.model('Sale', SaleSchema);
