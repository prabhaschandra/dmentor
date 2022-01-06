const mongoose = require('mongoose');

const demoRequestsSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },    
    date: {
      type: String,
    },    
  },
  {
    timestamps: true,
  }
);

const DemoRequest = mongoose.model('DemoRequest', demoRequestsSchema);

module.exports = { DemoRequest };
