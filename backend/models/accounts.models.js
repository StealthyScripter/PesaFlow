const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  memberNumber: {
    type: String,
    required: [true, 'Member number is required'],
    unique: true,  // This creates an index automatically
    trim: true,
    uppercase: true,
    ref: 'User'
  },
  savings: {
    type: Number,
    default: 0,
    min: [0, 'Savings cannot be negative'],
    set: function(value) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
  },
  monthlyContribution: {
    type: Number,
    default: 0,
    min: [0, 'Monthly contribution cannot be negative'],
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  sharesOwned: {
    type: Number,
    default: 0,
    min: [0, 'Shares owned cannot be negative'],
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  accountStatus: {
    type: String,
    enum: {
      values: ['pending', 'active', 'suspended', 'closed'],
      message: '{VALUE} is not a valid account status'
    },
    default: 'pending',
    lowercase: true,
    index: true
  },
  lastTransactionDate: {
    type: Date
  },
  accountOpenDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Pre-save middleware
accountSchema.pre('save', function(next) {
  if (this.memberNumber) {
    this.memberNumber = this.memberNumber.toUpperCase();
  }
  next();
});

// Instance method to update balance
accountSchema.methods.updateBalance = function(amount, type) {
  if (type === 'credit') {
    this.savings += amount;
  } else if (type === 'debit' && this.savings >= amount) {
    this.savings -= amount;
  } else {
    throw new Error('Insufficient funds');
  }
  this.lastTransactionDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Account', accountSchema);
