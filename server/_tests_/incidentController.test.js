const {
  getIncidents,
  reportIncident,
  getUserDetails,
  deleteAllIncidents,
  updateIncidentStatus,
} = require("../controllers/incidentController"); // Adjust path as needed

const Incident = require("../schemas/Incident");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");

jest.mock("../schemas/Incident");
jest.mock("../schemas/User");
jest.mock("jsonwebtoken");

describe("Incident Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getIncidents", () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should fetch all incidents successfully", async () => {
      const mockIncidents = [
        { title: "Incident 1", status: "open", createdAt: new Date() },
        { title: "Incident 2", status: "closed", createdAt: new Date() },
      ];

      Incident.aggregate.mockResolvedValue(mockIncidents);

      await getIncidents(req, res);

      expect(Incident.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incidents fetched successfully",
        incidents: mockIncidents,
      });
    });

    it("should handle errors when fetching incidents", async () => {
      const error = new Error("Error fetching incidents");
      Incident.aggregate.mockRejectedValue(error);

      await getIncidents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching incidents",
      });
    });
  });

  describe("reportIncident", () => {
    let req, res;

    beforeEach(() => {
      req = {
        cookies: { token: "valid-token" },
        body: {
          title: "Incident Title",
          type: "Type",
          description: "Incident description",
          location: "Location",
          image: "base64image",
          date: new Date(),
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jwt.verify.mockReturnValue({ userEmail: "user@example.com" });
    });

    it("should report a new incident successfully", async () => {
      const mockIncident = {
        save: jest.fn(),
      };
      Incident.mockImplementation(() => mockIncident);

      await reportIncident(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_SECRET
      );
      expect(mockIncident.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incident reported successfully",
      });
    });

    it("should handle errors when reporting an incident", async () => {
      const error = new Error("Error saving incident");
      const mockIncident = {
        save: jest.fn().mockRejectedValue(error),
      };
      Incident.mockImplementation(() => mockIncident);

      await reportIncident(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error while reporting incident",
      });
    });
  });

  describe("getUserDetails", () => {
    let req, res;

    beforeEach(() => {
      req = { body: { email: "user@example.com" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should return user details successfully", async () => {
      const mockUser = {
        email: "user@example.com",
        firstName: "John",
        lastName: "Doe",
      };
      User.findOne.mockResolvedValue(mockUser);

      await getUserDetails(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User successfully fetched",
        user: mockUser,
      });
    });

    it("should return 404 if user is not found", async () => {
      User.findOne.mockResolvedValue(null);

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should handle errors when fetching user details", async () => {
      const error = new Error("Error fetching user");
      User.findOne.mockRejectedValue(error);

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching user",
      });
    });
  });

  describe("deleteAllIncidents", () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should delete all incidents successfully", async () => {
      Incident.deleteMany.mockResolvedValue();

      await deleteAllIncidents(req, res);

      expect(Incident.deleteMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All incidents deleted successfully",
      });
    });

    it("should handle errors when deleting all incidents", async () => {
      const error = new Error("Error deleting incidents");
      Incident.deleteMany.mockRejectedValue(error);

      await deleteAllIncidents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error deleting incidents",
      });
    });
  });

  describe("updateIncidentStatus", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          incidents: [
            { incidentId: "6139c12f9f1b2c001f8b4567", status: "closed" },
            { incidentId: "6139c12f9f1b2c001f8b4568", status: "open" },
          ],
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should update incident statuses successfully", async () => {
      Incident.findByIdAndUpdate.mockResolvedValue();

      await updateIncidentStatus(req, res);

      expect(Incident.findByIdAndUpdate).toHaveBeenCalledTimes(2); // Should be called twice for the two incidents
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incident statuses updated successfully",
      });
    });

    it("should handle errors when updating incident statuses", async () => {
      const error = new Error("Error updating incident statuses");
      Incident.findByIdAndUpdate.mockRejectedValue(error);

      await updateIncidentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error updating incident statuses",
      });
    });
  });
});
