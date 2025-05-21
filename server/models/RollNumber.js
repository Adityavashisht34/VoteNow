import mongoose from 'mongoose';

const rollNumberSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RollNumber = mongoose.model('RollNumber', rollNumberSchema);

export default RollNumber;