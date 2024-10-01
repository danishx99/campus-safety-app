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

jest.mock('../schemas/User');
jest.mock('../schemas/Code');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../utils/mailingTool');

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

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockSave).toHaveBeenCalled();
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
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(5);
      expect(res.json).toHaveBeenCalledWith({ success: true, redirect: 'user' });
    });

    it('should return error for invalid credentials', async () => {
      req.body = { email: 'user@example.com', password: 'wrongpassword' };
      User.findOne.mockResolvedValue({ password: 'hashedPassword' });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('googleRegister', () => {
    it('should register a new user with Google successfully', async () => {
      req.body = {
        name: 'John',
        surname: 'Doe',
        email: 'johndoe@gmail.com',
        phone: '1234567890',
        account: 1
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
  });

  describe('googleLogin', () => {
    it('should login user with Google successfully', async () => {
      req.body = { email: 'user@gmail.com' };

      const mockUser = {
        email: 'user@gmail.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe'
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('token');

      await googleLogin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@gmail.com' });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(5);
      expect(res.json).toHaveBeenCalledWith({ success: true, redirect: 'user' });
    });

    it('should return error if user does not exist', async () => {
      req.body = { email: 'nonexistent@gmail.com' };
      User.findOne.mockResolvedValue(null);

      await googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address does not exist.' });
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
  });

  describe('isVerified', () => {
    it('should check user verification status', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ email: 'user@example.com', isVerified: true });

      await isVerified(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      // Note: The current implementation doesn't return anything, so we can't test the response
    });

    it('should handle error if user not found', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'nonexistent@example.com' });
      User.findOne.mockResolvedValue(null);

      await isVerified(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address does not exist.' });
    });
  });

  describe('sendVerification', () => {
    it('should send verification email successfully', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      const mockUser = {
        email: 'user@example.com',
        verificationToken: 'token',
        verificationTokenExpires: Date.now() + 3600000,
        save: jest.fn()
      };
      User.findOne.mockResolvedValue(mockUser);

      await sendVerification(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mailer.sendVerificationEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Verification Email Successfully Sent!' });
    });

    it('should handle error if user not found', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'nonexistent@example.com' });
      User.findOne.mockResolvedValue(null);

      await sendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this email address does not exist.' });
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
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      const mockUser = {
        email: 'user@example.com',
        isVerified: false,
        verificationToken: 'newToken',
        verificationTokenExpires: Date.now() + 3600000,
        save: jest.fn()
      };
      User.findOne.mockResolvedValue(mockUser);

      await resendVerificationEmail(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mailer.resendVerificationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Verification email resent successfully!' });
    });

    it('should return error if user is already verified', async () => {
      req.cookies.token = 'validToken';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ email: 'user@example.com', isVerified: true });

      await resendVerificationEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User doesn't exist or is already verified" });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledTimes(5);
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
  });

  describe('generateCode', () => {
    it('should generate a unique code successfully', async () => {
      const mockCode = { userCode: 12345, save: jest.fn() };
      Code.findOne.mockResolvedValueOnce(null).mockResolvedValue(mockCode);
      Code.prototype.save = mockCode.save;

      await generateCode(req, res);

      expect(Code.findOne).toHaveBeenCalled();
      expect(mockCode.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(Number) });
    });

    it('should handle error when generating code', async () => {
      Code.findOne.mockRejectedValue(new Error('Database error'));

      await generateCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error generating code' });
    });
  });
});
