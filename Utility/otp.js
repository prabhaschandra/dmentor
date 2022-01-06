const asyncHandler = require('express-async-handler');
const { default: axios } = require('axios');

//send OTP
module.exports.sendOtp = async (phone) => {

  const sendOtpPromise = new Promise(async (resolve, reject) => {
    
    try {
      const { data } = await axios.get(
        `https://2factor.in/API/V1/${process.env.FACTOR2_API_KEY}/SMS/+91${phone}/AUTOGEN/otp1`
      );
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });

  return sendOtpPromise;
};

//verify OTP
module.exports.verifyOTP = async (otp, details) => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(
        `https://2factor.in/API/V1/${process.env.FACTOR2_API_KEY}/SMS/VERIFY/${details}/${otp}`
      );
      if (data.Details === 'OTP Matched') {
        resolve(data);
      } else if (data.Details === 'OTP Expired') {
        throw new Error('OTP has expired, Please resend the OTP');
      } else {
        throw new Error('OTP does not match, Please enter the correct OTP');
      }
    } catch (error) {
      reject(error);
    }
  });

  return promise;
};
