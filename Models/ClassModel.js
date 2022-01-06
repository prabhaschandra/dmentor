const mongoose = require('mongoose');

const classSchema = mongoose.Schema(
  {
    startTime: {
      type: String,
    },
    date: {
      type: String,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model('Class', classSchema);

module.exports = { Class };
