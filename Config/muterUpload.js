const multer = require('multer');
const fs = require('fs');

const path = require('path');
// Multer config
module.exports = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      if (!fs.existsSync(path.join(path.dirname(require.main.filename), 'public', 'images'))) {
        fs.mkdirSync(path.join(path.dirname(require.main.filename), 'public', 'images'));
      }
      // callback(null, path.dirname(require.main.filename), 'public', 'images');
      callback(null, './public/images');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname + '.' + 'jpg');
    },
  }),
});
