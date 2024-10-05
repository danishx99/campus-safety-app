const {
  register,
  login,
  googleRegister,
  googleLogin,
  resetPassword,
  forgotPassword,
  isVerified,
  sendVerification,
  verifyEmail,
  resendVerificationEmail,
  logout,
  checkEmailVerification,
  generateCode
} = require('../controllers/authController');
const User = require('../schemas/User');
const Code = require('../schemas/Code');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailingTool');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');
jest.mock('../schemas/User');
jest.mock('../schemas/Code');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../utils/mailingTool');
jest.mock('crypto');

// Mock the nodemailer createTransport function
const mockTransporter = {
  verify: jest.fn().mockResolvedValue(true),
  sendMail: jest.fn().mockResolvedValue({ messageId: 'mockMessageId' })
};
nodemailer.createTransport.mockReturnValue(mockTransporter);

// Mock the mailingTool
jest.mock('../utils/mailingTool', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(),
  sendRequest: jest.fn().mockResolvedValue(),
  sendSuccess: jest.fn().mockResolvedValue(),
  resendVerificationEmail: jest.fn().mockResolvedValue()
}));

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost')
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        account: 1,
        phone: '1234567890',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        FCMtoken: 'fcm-token'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockSave = jest.fn().mockResolvedValue();
      User.prototype.save = mockSave;
      crypto.randomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('verificationToken')
      });

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockSave).toHaveBeenCalled();
      expect(mailer.sendVerificationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful!' });
    });

    it('should return error if user already exists', async () => {
      req.body = { email: 'existing@example.com' };
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address already exists.' });
    });

    it('should handle registration error', async () => {
      req.body = {
        email: 'test@example.com',
        account: 1,
        phone: '1234567890',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        FCMtoken: 'fcm-token'
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error registering user' });
    });

    it('should handle admin registration with valid code', async () => {
      req.body = {
        email: 'admin@example.com',
        account: 0,
        phone: '1234567890',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        FCMtoken: 'fcm-token',
        code: 'validCode'
      };

      User.findOne.mockResolvedValue(null);
      Code.findOne.mockResolvedValue({ userCode: 'validCode', createdAt: new Date() });
      Code.deleteOne = jest.fn().mockResolvedValue({});
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockSave = jest.fn().mockResolvedValue();
      User.prototype.save = mockSave;

      await register(req, res);

      expect(Code.findOne).toHaveBeenCalledWith({ userCode: 'validCode' });
      expect(Code.deleteOne).toHaveBeenCalledWith({ userCode: 'validCode' });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful!' });
    });

    it('should return error for invalid admin registration code', async () => {
      req.body = {
        email: 'admin@example.com',
        account: 0,
        phone: '1234567890',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        FCMtoken: 'fcm-token',
        code: 'invalidCode'
      };

      User.findOne.mockResolvedValue(null);
      Code.findOne.mockResolvedValue(null);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid code. Please contact management for further assistance' });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
        FCMtoken: 'fcm-token'
      };

      const mockUser = {
        email: 'user@example.com',
        password: 'hashedPassword',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
        save: jest.fn(),
        phone: '1234567890',
        createdAt: new Date(),
        profilePicture: 'profile.jpg'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(8);
      expect(res.json).toHaveBeenCalledWith({ success: true, redirect: 'user', profilePicture: 'profile.jpg' });
    });

    it('should return error for invalid credentials', async () => {
      req.body = { email: 'user@example.com', password: 'wrongpassword' };
      User.findOne.mockResolvedValue({ password: 'hashedPassword' });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return error for unverified email', async () => {
      req.body = { email: 'user@example.com', password: 'password123' };
      User.findOne.mockResolvedValue({ 
        email: 'user@example.com',
        password: 'hashedPassword',
        isVerified: false
      });
      bcrypt.compare.mockResolvedValue(true);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Your email is not verified', email: 'user@example.com' });
    });

    it('should handle login error', async () => {
      req.body = { email: 'user@example.com', password: 'password123' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error logging in user' });
    });

    it('should handle login for admin user', async () => {
      req.body = {
        email: 'admin@example.com',
        password: 'adminpassword',
        rememberMe: true,
        FCMtoken: 'fcm-token'
      };

      const mockUser = {
        email: 'admin@example.com',
        password: 'hashedPassword',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isVerified: true,
        save: jest.fn(),
        phone: '1234567890',
        createdAt: new Date(),
        profilePicture: 'admin-profile.jpg'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('admintoken');

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('adminpassword', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(8);
      expect(res.json).toHaveBeenCalledWith({ success: true, redirect: 'admin', profilePicture: 'admin-profile.jpg' });
    });
  });

  describe('googleRegister', () => {
    it('should register a new user with Google successfully', async () => {
      req.body = {
        name: 'John',
        surname: 'Doe',
        email: 'johndoe@gmail.com',
        phone: '1234567890',
        account: 1,
        photoURL: 'https://example.com/photo.jpg'
      };

      User.findOne.mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue();
      User.prototype.save = mockSave;

      await googleRegister(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'johndoe@gmail.com' });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful!' });
    });

    it('should return error if user already exists', async () => {
      req.body = { email: 'existing@gmail.com' };
      User.findOne.mockResolvedValue({ email: 'existing@gmail.com' });

      await googleRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address already exists.' });
    });

    it('should handle registration error', async () => {
      req.body = {
        name: 'John',
        surname: 'Doe',
        email: 'johndoe@gmail.com',
        phone: '1234567890',
        account: 1
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await googleRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error registering user with Google' });
    });

    it('should handle admin registration with valid code', async () => {
      req.body = {
        name: 'Admin',
        surname: 'User',
        email: 'admin@gmail.com',
        phone: '1234567890',
        account: 0,
        code: 'validCode'
      };

      User.findOne.mockResolvedValue(null);
      Code.findOne.mockResolvedValue({ userCode: 'validCode', createdAt: new Date() });
      Code.deleteOne = jest.fn().mockResolvedValue({});
      const mockSave = jest.fn().mockResolvedValue();
      User.prototype.save = mockSave;

      await googleRegister(req, res);

      expect(Code.findOne).toHaveBeenCalledWith({ userCode: 'validCode' });
      expect(Code.deleteOne).toHaveBeenCalledWith({ userCode: 'validCode' });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful!' });
    });

    it('should return error for invalid admin registration code', async () => {
      req.body = {
        name: 'Admin',
        surname: 'User',
        email: 'admin@gmail.com',
        phone: '1234567890',
        account: 0,
        code: 'invalidCode'
      };

      User.findOne.mockResolvedValue(null);
      Code.findOne.mockResolvedValue(null);

      await googleRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid code. Please contact management for further assistance' });
    });
  });

  describe('googleLogin', () => {
    it('should login user with Google successfully', async () => {
      req.body = { 
        email: 'user@gmail.com',
        name: 'John',
        surname: 'Doe',
        photoURL: 'https://example.com/photo.jpg'
      };

      const mockUser = {
        email: 'user@gmail.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: 'https://example.com/photo.jpg',
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('token');

      await googleLogin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@gmail.com' });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(8);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        redirect: 'user', 
        profilePicture: 'https://example.com/photo.jpg' });
    });

    it('should return error if user does not exist', async () => {
      req.body = { email: 'nonexistent@gmail.com' };
      User.findOne.mockResolvedValue(null);

      await googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address does not exist.' });
    });

    it('should handle login error', async () => {
      req.body = { email: 'user@gmail.com' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error logging in using Google' });
    });

    it('should handle login for admin user with Google', async () => {
      req.body = { 
        email: 'admin@gmail.com',
        name: 'Admin',
        surname: 'User',
        photoURL: 'https://example.com/admin-photo.jpg'
      };

      const mockUser = {
        email: 'admin@gmail.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        profilePicture: 'https://example.com/admin-photo.jpg',
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('admintoken');

      await googleLogin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@gmail.com' });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(8);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        redirect: 'admin', 
        profilePicture: 'https://example.com/admin-photo.jpg' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body = {
        resetToken: 'validToken',
        password: 'newPassword123'
      };

      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ email: 'user@example.com', save: jest.fn() });
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      await resetPassword(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.RESET_JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mailer.sendSuccess).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
    });

    it('should return error for invalid token', async () => {
      req.body = { resetToken: 'invalidToken' };
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error resetting password' });
    });

    it('should return error if token is not provided', async () => {
      req.body = { password: 'newPassword123' };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token must be provided' });
    });

    it('should return error if user is not found', async () => {
      req.body = {
        resetToken: 'validToken',
        password: 'newPassword123'
      };

      jwt.verify.mockReturnValue({ userEmail: 'nonexistent@example.com' });
      User.findOne.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset successfully', async () => {
      req.body = { email: 'user@example.com' };
      User.findOne.mockResolvedValue({ email: 'user@example.com' });
      jwt.sign.mockReturnValue('resetToken');

      await forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(jwt.sign).toHaveBeenCalled();
      expect(mailer.sendRequest).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset instructions have been sent to your email.' });
    });

    it('should return error if user not found', async () => {
      req.body = { email: 'nonexistent@example.com' };
      User.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle error during password reset initiation', async () => {
      req.body = { email: 'user@example.com' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error initiating password reset' });
    });
  });

  describe('isVerified', () => {
    it('should check user verification status', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ email: 'user@example.com', isVerified: true });

      await isVerified(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(res.json).toHaveBeenCalledWith({ isVerified: true });
    });

    it('should handle error if user not found', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'nonexistent@example.com' });
      User.findOne.mockResolvedValue(null);

      await isVerified(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address does not exist.' });
    });

    it('should return error if no token provided', async () => {
      req.cookies = {};

      await isVerified(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should handle error during verification check', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await isVerified(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error checking verification status' });
    });
  });

  describe('sendVerification', () => {
    it('should send verification email successfully', async () => {
      req.body = { email: 'user@example.com' };
      const mockUser = {
        email: 'user@example.com',
        verificationToken: 'token',
        verificationTokenExpires: Date.now() + 3600000,
        save: jest.fn()
      };
      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('verificationToken')
      });

      await sendVerification(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mailer.sendVerificationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: 'Verification Email Successfully Sent!' });
    });

    it('should handle error if user not found', async () => {
      req.body = { email: 'nonexistent@example.com' };
      User.findOne.mockResolvedValue(null);

      await sendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address does not exist.' });
    });

    it('should handle error during sending verification email', async () => {
      req.body = { email: 'user@example.com' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await sendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error sending verification email' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      req.body = { token: 'validToken' };
      const mockUser = {
        isVerified: false,
        verificationToken: 'validToken',
        verificationTokenExpires: Date.now() + 3600000,
        role: 'user',
        save: jest.fn()
      };
      User.findOne.mockResolvedValue(mockUser);

      await verifyEmail(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        verificationToken: 'validToken',
        verificationTokenExpires: { $gt: expect.any(Number) }
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email verified successfully!',
        redirect: 'user'
      });
    });

    it('should return error for invalid token', async () => {
      req.body = { token: 'invalidToken' };
      User.findOne.mockResolvedValue(null);

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });

    it('should handle error during email verification', async () => {
      req.body = { token: 'validToken' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error verifying email' });
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      req.body = { email: 'user@example.com' };
      const mockUser = {
        email: 'user@example.com',
        isVerified: false,
        verificationToken: 'newToken',
        verificationTokenExpires: Date.now() + 3600000,
        save: jest.fn()
      };
      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('newVerificationToken')
      });

      await resendVerificationEmail(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mailer.resendVerificationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Verification email resent successfully!' });
    });

    it('should return error if user is already verified', async () => {
      req.body = { email: 'user@example.com' };
      User.findOne.mockResolvedValue({ email: 'user@example.com', isVerified: true });

      await resendVerificationEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User doesn't exist or is already verified" });
    });

    it('should handle error during resending verification email', async () => {
      req.body = { email: 'user@example.com' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await resendVerificationEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error resending verification email' });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledTimes(8);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('checkEmailVerification', () => {
    it('should check email verification status successfully', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ email: 'user@example.com', isVerified: true });

      await checkEmailVerification(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(res.json).toHaveBeenCalledWith({ isVerified: true });
    });

    it('should return error if no token provided', async () => {
      req.cookies = {};

      await checkEmailVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should handle error during email verification check', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await checkEmailVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error checking email verification status' });
    });
  });

  describe('generateCode', () => {
    it('should generate a unique code successfully', async () => {
      // Mock Math.random to return a predictable value
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.5;
      global.Math = mockMath;
  
      Code.findOne.mockResolvedValueOnce(null);
      Code.prototype.save = jest.fn().mockResolvedValue();
  
      await generateCode(req, res);
  
      expect(Code.findOne).toHaveBeenCalledWith({ userCode: 55000 });
      expect(Code.prototype.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 55000 });
  
      // Restore original Math
      global.Math = Object.create(global.Math);
    });
  
    it('should retry code generation if initial code already exists', async () => {
      const mockMath = Object.create(global.Math);
      mockMath.random = jest.fn()
        .mockReturnValueOnce(0.5)  // First call: 55000
        .mockReturnValueOnce(0.6); // Second call: 64000
      global.Math = mockMath;
  
      Code.findOne
        .mockResolvedValueOnce({ userCode: 55000 })  // First code exists
        .mockResolvedValueOnce(null);  // Second code doesn't exist
  
      Code.prototype.save = jest.fn().mockResolvedValue();
  
      await generateCode(req, res);
  
      expect(Code.findOne).toHaveBeenCalledTimes(2);
      expect(Code.findOne).toHaveBeenNthCalledWith(1, { userCode: 55000 });
      expect(Code.findOne).toHaveBeenNthCalledWith(2, { userCode: 64000 });
      expect(Code.prototype.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 64000 });
  
      global.Math = Object.create(global.Math);
    });
  
    it('should handle error when generating code', async () => {
      Code.findOne.mockRejectedValue(new Error('Database error'));
  
      await generateCode(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error generating code' });
    });
  
    it('should log the generated code', async () => {
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.5;
      global.Math = mockMath;
  
      Code.findOne.mockResolvedValueOnce(null);
      Code.prototype.save = jest.fn().mockResolvedValue();
  
      console.log = jest.fn();
  
      await generateCode(req, res);
  
      expect(console.log).toHaveBeenCalledWith('Generate code endpoint reached');
      expect(console.log).toHaveBeenCalledWith('Generated code: ', 55000);
  
      global.Math = Object.create(global.Math);
    });
  });
});
