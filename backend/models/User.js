const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'sales', 'tech', 'ops', 'finance', 'hr', 'execution'],
    default: 'sales'
  },
  department: {
    type: String,
    enum: ['sales', 'tech', 'general', 'ops', 'finance', 'hr', 'admin', 'execution'],
    default: 'general'
  },
  isDepartmentHead: { type: Boolean, default: false }, // Can manage entire department
  isManager: { type: Boolean, default: false },        // Can manage team (subtype of department)
  isSalesManager: { type: Boolean, default: false }    // Legacy support for Tabrez
});

module.exports = mongoose.model('User', UserSchema);
