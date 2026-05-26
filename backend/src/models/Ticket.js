const mongoose = require('mongoose');
const validator = require('validator');

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

// Status order for transition validation
const STATUS_ORDER = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Please provide a valid email address',
      },
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Priority must be one of: low, medium, high, urgent' },
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be one of: open, in_progress, resolved, closed' },
      default: 'open',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Static: validate a status transition
ticketSchema.statics.validateTransition = function (from, to) {
  const fromIdx = STATUS_ORDER[from];
  const toIdx = STATUS_ORDER[to];

  if (fromIdx === undefined || toIdx === undefined) {
    return { valid: false, message: `Unknown status value` };
  }

  if (fromIdx === toIdx) {
    return { valid: false, message: `Ticket is already in '${from}' status` };
  }

  const diff = toIdx - fromIdx;

  // Forward: only one step allowed
  if (diff > 1) {
    return {
      valid: false,
      message: `Invalid transition: cannot move from '${from}' to '${to}'. Forward moves are only allowed one step at a time (${from} → ${STATUSES[fromIdx + 1]}).`,
    };
  }

  // Backward: only one step allowed
  if (diff < -1) {
    return {
      valid: false,
      message: `Invalid transition: cannot move from '${from}' to '${to}'. Backward moves are only allowed one step at a time (${from} → ${STATUSES[fromIdx - 1]}).`,
    };
  }

  return { valid: true };
};

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
