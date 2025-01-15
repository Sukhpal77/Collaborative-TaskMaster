const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../utils/emailConfig'); 

// Signup
exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET);

    user.refreshToken = refreshToken;
    await user.save();

    const userData = { id: user._id, name: user.name, email: user.email };

    res.status(200).json({ accessToken, refreshToken, userData });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json({ message: 'Refresh token required' });

  try {
    const user = await User.findOne({ refreshToken: refreshToken });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userData) => {
      if (err) return res.status(403).json({ message: 'Token expired' });

      const accessToken = jwt.sign({ id: userData.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      res.status(200).json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password (send email)
exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1 * 60 * 1000;   
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Inter', sans-serif; line-height: 1.5; color: #374151; background-color: #F3F4F6; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #1F2937; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="margin-bottom: 16px;">Hello ${user.name},</p>
          <p style="margin-bottom: 16px;">You have requested to reset your password. Please click the button below to reset it:</p>
          <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
             style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
          <p style="margin-top: 20px;">If you did not request this, please ignore this email.</p>
          <p style="margin-top: 16px;">Thanks, <br> The Support Team</p>
        </div>
      `,
    };    

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
    
  }
};

// Reset Password (verify token and update password)
exports.resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  try {

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.refreshToken = undefined;
    await user.save();
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
