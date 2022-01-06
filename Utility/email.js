const nodemailer = require('nodemailer');

//password rest link email
module.exports.testMail = async (name, email, link) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.dmentors.in',
    port: 465,
    secure: true,
    auth: {
      user: 'app@dmentors.in',
      pass: 'W{Toun&if{pT',
    },
  });

  const mailOptions = {
    from: 'app@dmentors.in',
    to: `manish@trikara.com`,
    subject: 'Test',
    html: ` <p>Hi Manish,</p>
        <p>You requested to reset your password.</p>
        <p> Please, click the link below to reset your password</p>`,
  };

  const myPromise = new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve('success');
      }
    });
  });
  return myPromise;
};
