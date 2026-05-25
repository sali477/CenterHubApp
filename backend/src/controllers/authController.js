import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const allowedRoles = ['student', 'teacher', 'center_owner'];
  const userRole = allowedRoles.includes(role) ? role : 'student';

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.password) {
    res.status(401);
    throw new Error('This account uses Google sign-in. Please use the Google button.');
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ email }, { googleId }] });

  if (!user) {
    const allowedRoles = ['student', 'teacher', 'center_owner'];
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture,
      role: allowedRoles.includes(role) ? role : 'student',
      isVerified: true,
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      await user.save();
    }
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses', 'title thumbnail subject');

  res.json({ success: true, user });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update password
// @route   PUT /api/auth/update-password
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const fields = ['name', 'phone', 'avatar'];
  const updates = {};

  fields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
});
