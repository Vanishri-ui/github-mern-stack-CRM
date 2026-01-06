const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    filename: { type: String, required: true }, // Store filename from Multer
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: { type: String, required: true }, // 'sales', 'tech', etc.
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
