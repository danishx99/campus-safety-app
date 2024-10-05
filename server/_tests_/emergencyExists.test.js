const { emergencyExists } = require('../middlewares/emergencyExists');
const Emergency = require('../schemas/Emergency');
const mongoose = require('mongoose');
const path = require('path');

jest.mock('../schemas/Emergency', () => {
    return {
      findById: jest.fn()
    };
});
jest.mock('mongoose');
jest.mock('path');

describe('emergencyExists Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { emergencyId: 'validObjectId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      sendFile: jest.fn(),
      json: jest.fn()
    };
    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should call next() if emergency exists and is not cancelled', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Emergency.findById.mockResolvedValue({ status: 'Active' });

    await emergencyExists(req, res, next);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validObjectId');
    expect(Emergency.findById).toHaveBeenCalledWith('validObjectId');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it('should return 404 if emergencyId is not a valid ObjectId', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    path.join.mockReturnValue('/mocked/path/to/emergencyNotFound.html');

    await emergencyExists(req, res, next);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validObjectId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.sendFile).toHaveBeenCalledWith('/mocked/path/to/emergencyNotFound.html');
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 if emergency is not found', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Emergency.findById.mockResolvedValue(null);
    path.join.mockReturnValue('/mocked/path/to/emergencyNotFound.html');

    await emergencyExists(req, res, next);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validObjectId');
    expect(Emergency.findById).toHaveBeenCalledWith('validObjectId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.sendFile).toHaveBeenCalledWith('/mocked/path/to/emergencyNotFound.html');
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 if emergency status is "Cancelled"', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Emergency.findById.mockResolvedValue({ status: 'Cancelled' });
    path.join.mockReturnValue('/mocked/path/to/emergencyNotFound.html');

    await emergencyExists(req, res, next);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validObjectId');
    expect(Emergency.findById).toHaveBeenCalledWith('validObjectId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.sendFile).toHaveBeenCalledWith('/mocked/path/to/emergencyNotFound.html');
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Emergency.findById.mockRejectedValue(new Error('Database error'));

    await emergencyExists(req, res, next);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validObjectId');
    expect(Emergency.findById).toHaveBeenCalledWith('validObjectId');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();
  });
});
