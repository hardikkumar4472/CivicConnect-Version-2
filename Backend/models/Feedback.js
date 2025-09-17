import mongoose from 'mongoose';
const feedbackSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
feedbackSchema.index({ citizen: 1, issue: 1 }, { unique: true });
const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
