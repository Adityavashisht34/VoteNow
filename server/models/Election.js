import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: ''
  }
});

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  candidates: [candidateSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for election status
electionSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'completed';
  return 'active';
});

// Update status before saving
electionSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now > this.endDate) {
    this.status = 'completed';
  } else {
    this.status = 'active';
  }
  
  next();
});

const Election = mongoose.model('Election', electionSchema);

export default Election;