const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
    items: [
        {
            description: { type: String, required: true },
            amount: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Overdue', 'Cancelled'],
        default: 'Unpaid'
    },
    paymentDate: { type: Date },
    paymentMethod: { type: String }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
