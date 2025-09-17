import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  houseId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Water', 'Electricity', 'Sanitation', 'Roads', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  address: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  comments: [{
  author: { type: String, required: true },      
  authorType: { type: String, enum: ['Sector Head', 'Admin'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}]
});

issueSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
