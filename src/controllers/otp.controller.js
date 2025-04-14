import twilio from 'twilio';
import { Otp } from '../models/otp.models.js';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number not present!' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await client.messages.create({
      body: `Your OTP for Kultivated Karats is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });

    const numberPresent = await Otp.findOne({phone});

    let otpRes = 0;

    if ( numberPresent )
        otpRes = await Otp.findOneAndUpdate(
            { phone },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );
    else 
        otpRes = await Otp.create({
            phone,
            otp,
            createdAt: new Date()
        });

    console.log(otpRes);

    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
  }

  try {
    const record = await Otp.findOne({ phone });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    if (record.otp !== otp) {
      return res.status(401).json({ success: false, message: 'Invalid OTP.' });
    }

    await Otp.deleteOne({ phone }); // Optional: remove after verification

    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'OTP verification failed.' });
  }
};
