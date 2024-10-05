const emergencyController = require('../controllers/emergencyController');
const Emergency = require('../schemas/Emergency');
const User = require('../schemas/User');
const notification = require('../schemas/notification');
const Chat = require('../schemas/Chat');
const jwt = require('jsonwebtoken');
const _sendNotification = require('../utils/sendNotification');

// Mocking required modules
jest.mock('../schemas/Emergency');
jest.mock('../schemas/User');
jest.mock('../schemas/notification');
jest.mock('../schemas/Chat');
jest.mock('jsonwebtoken');
jest.mock('../utils/sendNotification');

describe('Emergency Alert Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      cookies: { token: 'mockToken' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    next = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('tempUpdateEmergency', () => {
    it('should update emergency alert and send notification', async () => {
      // Mock data and function calls
      req.params.emergencyAlertId = 'mockEmergencyId';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValueOnce({ FCMtoken: 'userToken' });
      User.findOne.mockResolvedValueOnce({ 
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        phone: '1234567890'
      });

      await emergencyController.tempUpdateEmergency(req, res);

      // Assertions
      expect(Emergency.findByIdAndUpdate).toHaveBeenCalledWith('mockEmergencyId', {
        assignedTo: '2458487@students.wits.ac.za',
        status: 'Assigned',
      });
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Emergency alert assigned successfully' });
    });
  });

  describe('sendPanic', () => {
    it('should create a new emergency alert if no active alert exists', async () => {
      // Mock data
      req.body = { title: 'Test Emergency', description: 'Test Description', location: 'Test Location' };
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      Emergency.findOne.mockResolvedValue(null);
      const mockEmergency = { _id: 'newEmergencyId' };
      Emergency.prototype.save.mockResolvedValue(mockEmergency);

      await emergencyController.sendPanic(req, res);

      // Assertions
      expect(Emergency.prototype.save).toHaveBeenCalled();
      expect(notification.prototype.save).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Emergency alert sent successfully',
        emergencyAlertId: 'newEmergencyId',
      });
    });

    it('should return error if active emergency alert exists', async () => {
      // Mock active emergency
      Emergency.findOne.mockResolvedValue({ _id: 'activeEmergencyId' });

      await emergencyController.sendPanic(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'You already have an active emergency alert. Please cancel it or wait for it to be resolved before issuing another one.',
      });
    });
  });

  describe('getEmergencyAlertDetails', () => {
    it('should return emergency alert details with admin data if assigned', async () => {
      req.params.emergencyAlertId = 'emergencyId';
      const mockEmergency = { status: 'Assigned', assignedTo: 'admin@example.com' };
      Emergency.findById.mockResolvedValue(mockEmergency);
      User.findOne.mockResolvedValue({ name: 'Admin User' });

      await emergencyController.getEmergencyAlertDetails(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        emergencyAlert: mockEmergency,
        adminData: { name: 'Admin User' },
      });
    });

    it('should return only emergency alert details if not assigned', async () => {
      req.params.emergencyAlertId = 'emergencyId';
      const mockEmergency = { status: 'Searching' };
      Emergency.findById.mockResolvedValue(mockEmergency);

      await emergencyController.getEmergencyAlertDetails(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ emergencyAlert: mockEmergency });
    });
  });

  // Add more test cases for other functions...

  describe('findAndNotifyAdmins', () => {
    it('should notify admins and update emergency status', async () => {
      req.body = { emergencyAlertId: 'emergencyId', location: JSON.stringify({ latitude: 0, longitude: 0 }) };
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ FCMtoken: 'userToken' });
      User.find.mockResolvedValue([{ FCMtoken: 'adminToken' }]);
      Emergency.findById.mockResolvedValue({ status: 'Searching' });

      await emergencyController.findAndNotifyAdmins(req, res);

      // Assertions
      expect(_sendNotification).toHaveBeenCalled();
      expect(Emergency.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('acceptEmergencyAlert', () => {
    it('should assign emergency alert to admin', async () => {
      req.params.alertId = 'emergencyId';
      jwt.verify.mockReturnValue({ userEmail: 'admin@example.com' });
      Emergency.findById.mockResolvedValue({ status: 'Searching', reportedBy: 'user@example.com' });
      User.findOne.mockResolvedValueOnce({ FCMtoken: 'userToken' });
      User.findOne.mockResolvedValueOnce({ firstName: 'Admin', lastName: 'User', email: 'admin@example.com', phone: '1234567890' });

      await emergencyController.acceptEmergencyAlert(req, res);

      // Assertions
      expect(Emergency.findByIdAndUpdate).toHaveBeenCalledWith('emergencyId', {
        assignedTo: 'admin@example.com',
        status: 'Assigned',
      });
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('cancelEmergency', () => {
    it('should cancel emergency alert', async () => {
      req.params.emergencyAlertId = 'emergencyId';
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      User.findOne.mockResolvedValue({ _id: 'userId' });
      Emergency.findById.mockResolvedValue({ _id: 'emergencyId' });

      await emergencyController.cancelEmergency(req, res);

      // Assertions
      expect(Emergency.findByIdAndUpdate).toHaveBeenCalledWith('emergencyId', { status: 'Cancelled' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Emergency alert cancelled successfully' });
    });
  });

  describe('resolveEmergency', () => {
    it('should resolve emergency alert and notify user', async () => {
      req.params.emergencyAlertId = 'emergencyId';
      jwt.verify.mockReturnValue({ userEmail: 'admin@example.com' });
      User.findOne.mockResolvedValueOnce({ _id: 'adminId' });
      Emergency.findById.mockResolvedValue({ reportedBy: 'user@example.com' });
      User.findOne.mockResolvedValueOnce({ FCMtoken: 'userToken' });

      await emergencyController.resolveEmergency(req, res);

      // Assertions
      expect(Emergency.findByIdAndUpdate).toHaveBeenCalledWith('emergencyId', { status: 'Resolved' });
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Emergency alert resolved successfully' });
    });
  });

  describe('sendChatMessage', () => {
    it('should send a chat message and save it', async () => {
      req.body = { messageTo: 'user@example.com', message: 'Test message', emergencyAlertId: 'emergencyId' };
      jwt.verify.mockReturnValue({ role: 'admin' });
      User.findOne.mockResolvedValue({ FCMtoken: 'userToken' });
      Chat.findOne.mockResolvedValue({ emergencyAlertId: 'emergencyId', messages: [] });

      await emergencyController.sendChatMessage(req, res);

      // Assertions
      expect(Chat.prototype.save).toHaveBeenCalled();
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Chat message sent successfully' });
    });
  });

  describe('getChatMessages', () => {
    it('should retrieve chat messages for an emergency', async () => {
      req.params.emergencyAlertId = 'emergencyId';
      Chat.findOne.mockResolvedValue({ messages: [{ sender: 'admin', text: 'Test message' }] });

      await emergencyController.getChatMessages(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ messages: [{ sender: 'admin', text: 'Test message' }] });
    });
  });
});