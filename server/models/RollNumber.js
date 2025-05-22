import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Initialize roll numbers from JSON file
rollNumberSchema.statics.initializeRollNumbers = async function() {
  try {
    const count = await this.countDocuments();
    if (count === 0) {
      const jsonPath = path.join(__dirname, '../data/rollNumbers.json');
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      if (data.validRollNumbers && Array.isArray(data.validRollNumbers)) {
        const rollNumbers = data.validRollNumbers.map(rollNumber => ({
          rollNumber
        }));
        
        await this.insertMany(rollNumbers);
        console.log('Roll numbers initialized successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing roll numbers:', error);
  }
};

const RollNumber = mongoose.model('RollNumber', rollNumberSchema);

// Initialize roll numbers when the model is first loaded
RollNumber.initializeRollNumbers();

export default RollNumber;