const qr = require('qrcode');
const fs = require('fs');
const path = require('path');

module.exports.qrCode = (id, name) => {
  const qrCodePromise = new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(path.join(path.dirname(require.main.filename), 'public', 'qrcodes'))) {
        fs.mkdirSync(path.join(path.dirname(require.main.filename), 'public', 'qrcodes'));
      }
      const qrCode = await qr.toDataURL(id.toString(), {
        errorCorrectionLevel: 'L',
      });
      const staticFolder = path.join(
        path.dirname(require.main.filename),
        'public',
        'qrcodes',
        `${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_qr_${id}.jpg`
      );
      const base64QRImage = qrCode.replace(/^data:image\/png;base64,/, '');
      fs.writeFile(staticFolder, base64QRImage, 'base64', () => {
        const data = {
          path: `https://app-backend.dmentors.in/qrcodes/${name
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase()}_qr_${id}.jpg`,
        };
        resolve([data, null]);
      });
    } catch (error) {
      reject([null, error]);
    }
  });
  return qrCodePromise;
};
