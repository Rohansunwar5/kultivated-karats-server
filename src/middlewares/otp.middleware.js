import { Otp } from "../models/otp.models.js";

const verifyOtp = async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }

  try {
    const record = await Otp.findOne({ phone });

    req.phone = phone;

    console.log(record?.otp, otp);

    if (!record || record.otp != otp) {
        req.otpVerified = false;
        return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await Otp.deleteOne({ phone });

    req.otpVerified = true;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'OTP verification failed' });
  }
};

export { verifyOtp };