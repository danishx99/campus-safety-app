const { updateLocation } = require("../controllers/locationUpdateController");
const User = require("../schemas/User");

jest.mock("../schemas/User");

describe("Location Update Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        longitude: 123.456,
        latitude: 78.910
      },
      userEmail: "test@example.com"
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findOneAndUpdate = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateLocation", () => {
    it("should update user location successfully", async () => {
      const mockUser = { email: "test@example.com", lastLocation: "[78.910, 123.456]" };
      User.findOneAndUpdate.mockResolvedValue(mockUser);

      await updateLocation(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: req.userEmail },
        { lastLocation: `[${req.body.latitude}, ${req.body.longitude}]` },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Location updated successfully" });
    });

    it("should return 404 if user is not found", async () => {
      User.findOneAndUpdate.mockResolvedValue(null);

      await updateLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found." });
    });

    it("should handle errors when updating location", async () => {
      const error = new Error("Database error");
      User.findOneAndUpdate.mockRejectedValue(error);

      await updateLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error updating location." });
    });
  });
});
