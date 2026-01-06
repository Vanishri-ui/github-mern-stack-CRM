const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user record
    agentName: { type: String }, // Explicit Name (Account Manager) as requested
    status: {
        type: String,
        enum: ['Pending Execution', 'Executed', 'Billed', 'Cancelled'],
        default: 'Pending Execution'
    },
    // Reminder Fields
    followUpDate: { type: Date },
    followUpNotes: { type: String }
});

module.exports = mongoose.model('Sale', SaleSchema);
