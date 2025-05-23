import mongoose from 'mongoose';

const aadharSchema = new mongoose.Schema({
  aadhar: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\d{12}$/, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true 
  }
});

const Aadhar = mongoose.model('Aadhar', aadharSchema);

export default Aadhar;
