const mongoose = require('mongoose');
const { ACTIONS, STATUS } = require('../constants/actions');

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    mobile: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      enum: Object.values(ACTIONS),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

logSchema.index({ action: 1 });
logSchema.index({ status: 1 });
logSchema.index({ userId: 1 });
logSchema.index({ mobile: 1 });
logSchema.index({ createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
