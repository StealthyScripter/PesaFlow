const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  memberNumber: {
    type: String,
    required: [true, 'Member number is required'],
    trim: true,
    uppercase: true,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['deposit', 'withdrawal', 'contribution', 'share_purchase', 'loan_payment', 'dividend', 'fee', 'transfer'],
      message: '{VALUE} is not a valid transaction type'
    },
    lowercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    set: function(value) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'cancelled', 'processing'],
      message: '{VALUE} is not a valid transaction status'
    },
    default: 'pending',
    lowercase: true
  },
  accountBalance: {
    type: Number,
    default: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  confirmedBy: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['savings', 'shares', 'loan', 'fee', 'other'],
    default: 'savings',
    lowercase: true
  }
}, {
  timestamps: true
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Index for performance
transactionSchema.index({ memberNumber: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

// Compound indexes
transactionSchema.index({ memberNumber: 1, date: -1 });
transactionSchema.index({ memberNumber: 1, status: 1 });

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  if (this.transactionId) {
    this.transactionId = this.transactionId.toUpperCase();
  }
  if (this.memberNumber) {
    this.memberNumber = this.memberNumber.toUpperCase();
  }
  next();
});

// Static method to generate transaction ID
transactionSchema.statics.generateTransactionId = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `TXN${timestamp}${random}`;
};

// Instance method to complete transaction
transactionSchema.methods.complete = function(confirmedBy) {
  this.status = 'completed';
  this.confirmedBy = confirmedBy;
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema);