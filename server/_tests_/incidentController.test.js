const {
  getIncidents,
  reportIncident,
  getIncidentImage,
  getUserDetails,
  deleteAllIncidents,
  updateIncidentStatus,
  getIncidentByUser
} = require('../controllers/incidentController');
const Incident = require('../schemas/Incident');
const User = require('../schemas/User');
const notification = require('../schemas/notification');
const jwt = require('jsonwebtoken');
const _sendNotification = require('../utils/sendNotification');

jest.mock('../schemas/Incident');
jest.mock('../schemas/User');
jest.mock('../schemas/notification');
jest.mock('jsonwebtoken');
jest.mock('../utils/sendNotification');

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

describe('Incident Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      cookies: { token: 'mockToken' },
      params: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost')
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      cookie: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getIncidents', () => {
    it('should fetch incidents successfully', async () => {
      const mockIncidents = [
        { _id: '1', reportedBy: 'user1@example.com', _doc: { title: 'Incident 1' } },
        { _id: '2', reportedBy: 'user2@example.com', _doc: { title: 'Incident 2' } }
      ];
      const mockUsers = [
        { email: 'user1@example.com', firstName: 'User1', lastName: 'Test' },
        { email: 'user2@example.com', firstName: 'User2', lastName: 'Test' }
      ];

      Incident.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockIncidents)
        })
      });
      User.find.mockResolvedValue(mockUsers);

      await getIncidents(req, res);

      expect(Incident.find).toHaveBeenCalled();
      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Incidents fetched successfully',
        incidents: expect.any(Array)
      });
    });

    it('should handle errors when fetching incidents', async () => {
      const error = new Error('Database error');
      Incident.find.mockRejectedValue(error);

      await getIncidents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching incidents' });
    });
  });

  describe('reportIncident', () => {
    it('should report an incident successfully', async () => {
      const mockIncident = {
        title: 'Test Incident',
        type: 'Test',
        description: 'Test description',
        location: 'Test location',
        date: new Date(),
        save: jest.fn()
      };
      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      Incident.prototype.save = jest.fn();
      notification.prototype.save = jest.fn();
      User.find.mockResolvedValue([{ FCMtoken: 'mockToken' }]);

      req.body = mockIncident;

      await reportIncident(req, res);

      expect(jwt.verify).toHaveBeenCalled();
      expect(Incident.prototype.save).toHaveBeenCalled();
      expect(notification.prototype.save).toHaveBeenCalled();
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Incident reported successfully' });
    });

    it('should handle errors when reporting an incident', async () => {
      const error = new Error('Database error');
      jwt.verify.mockImplementation(() => { throw error; });

      await reportIncident(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error while reporting incident' });
    });
  });

  describe('getIncidentImage', () => {
    it('should return HTML with incident image', async () => {
      const mockIncident = { image: 'base64EncodedImage' };
      Incident.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockIncident)
      });

      req.params.incidentId = 'mockId';

      await getIncidentImage(req, res);

      expect(Incident.findById).toHaveBeenCalledWith('mockId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<!DOCTYPE html>'));
    });

    it('should handle incident not found', async () => {
      Incident.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      req.params.incidentId = 'nonExistentId';

      await getIncidentImage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('<h1>Incident not found</h1>');
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user details successfully', async () => {
      const mockUser = { email: 'user@example.com', firstName: 'Test', lastName: 'User' };
      User.findOne.mockResolvedValue(mockUser);

      req.body.email = 'user@example.com';

      await getUserDetails(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User successfully fetched',
        user: mockUser
      });
    });

    it('should handle user not found', async () => {
      User.findOne.mockResolvedValue(null);

      req.body.email = 'nonexistent@example.com';

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('deleteAllIncidents', () => {
    it('should delete all incidents successfully', async () => {
      Incident.deleteMany.mockResolvedValue({});

      await deleteAllIncidents(req, res);

      expect(Incident.deleteMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'All incidents deleted successfully' });
    });

    it('should handle errors when deleting incidents', async () => {
      const error = new Error('Database error');
      Incident.deleteMany.mockRejectedValue(error);

      await deleteAllIncidents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting incidents' });
    });
  });

  describe('updateIncidentStatus', () => {
    it('should update incident status successfully', async () => {
      const mockIncidents = [{ incidentId: '1', status: 'Resolved' }];
      jwt.verify.mockReturnValue({ userEmail: 'admin@example.com' });
      Incident.findById.mockResolvedValue({ reportedBy: 'user@example.com' });
      User.findOne.mockResolvedValue({ FCMtoken: 'userToken' });
      Incident.bulkWrite.mockResolvedValue({});

      req.body.incidents = mockIncidents;

      await updateIncidentStatus(req, res);

      expect(jwt.verify).toHaveBeenCalled();
      expect(Incident.findById).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalled();
      expect(notification.prototype.save).toHaveBeenCalled();
      expect(_sendNotification).toHaveBeenCalled();
      expect(Incident.bulkWrite).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Incident statuses updated successfully' });
    });

    it('should handle errors when updating incident status', async () => {
      const error = new Error('Database error');
      jwt.verify.mockImplementation(() => { throw error; });

      await updateIncidentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error updating incident statuses' });
    });
  });

  describe('getIncidentByUser', () => {
    it('should fetch incidents for a user successfully', async () => {
      const mockIncidents = [
        { _id: '1', reportedBy: 'user@example.com', _doc: { title: 'Incident 1' } }
      ];
      const mockUser = { email: 'user@example.com', firstName: 'Test', lastName: 'User' };

      jwt.verify.mockReturnValue({ userEmail: 'user@example.com' });
      Incident.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockIncidents)
        })
      });
      User.find.mockResolvedValue([mockUser]);

      await getIncidentByUser(req, res);

      expect(jwt.verify).toHaveBeenCalled();
      expect(Incident.find).toHaveBeenCalledWith({ reportedBy: 'user@example.com' });
      expect(User.find).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Incidents fetched successfully',
        incidents: expect.any(Array)
      });
    });

    it('should handle errors when fetching incidents for a user', async () => {
      const error = new Error('Database error');
      jwt.verify.mockImplementation(() => { throw error; });

      await getIncidentByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching incidents' });
    });
  });
});
