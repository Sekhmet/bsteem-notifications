const mongoose = require('mongoose');
const { Schema } = mongoose;

const tokenSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  owner: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
    unique: true,
  },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
