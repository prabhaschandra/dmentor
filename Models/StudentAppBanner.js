const mongoose = require('mongoose');

const studentAppBannerSchema = mongoose.Schema(
  {
    imageUrl: {
      type: String,
    },
    title: {
      type: String,
    },    
  },
  {
    timestamps: true,
  }
);

const StudentAppBanner = mongoose.model('StudentAppBanner', studentAppBannerSchema);

module.exports = { StudentAppBanner };
