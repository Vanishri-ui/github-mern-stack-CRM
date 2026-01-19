const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    linkedSale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }, // Link to specific product/sale
    productName: { type: String }, // Snapshot of product name
    serviceLines: { type: String } // Snapshot of lines
});

module.exports = mongoose.model('Ticket', TicketSchema);
