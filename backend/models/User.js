const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'sales', 'tech', 'ops', 'finance', 'hr'],
    default: 'sales'
  },
  department: {
    type: String,
    enum: ['sales', 'tech', 'general', 'ops', 'finance', 'hr'],
    default: 'general'
  }
});

module.exports = mongoose.model('User', UserSchema);
