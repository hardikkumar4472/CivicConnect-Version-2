import mongoose from 'mongoose';

const sectorHeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sector: {
    type: String,
    // required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    // required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

const SectorHead = mongoose.model('SectorHead', sectorHeadSchema);
export default SectorHead;
