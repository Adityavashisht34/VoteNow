import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Store IP and user agent for audit purposes
  voterIp: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  }
});

// Compound index to ensure one vote per voter per election
voteSchema.index({ election: 1, voter: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;