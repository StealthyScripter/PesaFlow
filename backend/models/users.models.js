const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  memberNumber: {
    type: String,
    required: [true, 'Member number is required'],
    unique: true,  
    trim: true,
    uppercase: true
  },
  fname: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lname: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  emergencyContacts: [emergencyContactSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true  
  }
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.fname} ${this.lname}`;
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.memberNumber) {
    this.memberNumber = this.memberNumber.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
