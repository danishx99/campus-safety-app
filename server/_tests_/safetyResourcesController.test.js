const {
  adminSafetyResources,
  deleteOneSafetyResources,
  updateSafetyResource,
  userSafetyResources,
  getSafetyResource,
} = require("../controllers/safetyResourcesController"); // Adjust the path as needed
const safetyResources = require("../schemas/safetyResources");
const { ObjectId } = require("mongodb");

jest.mock("../schemas/safetyResources"); // Mock the safetyResources model

describe("Admin Safety Resources Controller", () => {
  describe("adminSafetyResources", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          title: "Safety Guide",
          type: "Guide",
          description: "Description of the safety guide",
          link: "https://example.com/safety-guide",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      safetyResources.prototype.save = jest.fn(); // Mock save method
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should add a new safety resource successfully", async () => {
      await adminSafetyResources(req, res);

      expect(safetyResources.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Resource added successfully",
      });
    });

    it("should handle errors when adding a new safety resource", async () => {
      const error = new Error("Database error");
      safetyResources.prototype.save.mockRejectedValue(error);

      await adminSafetyResources(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error adding safety resource." + error,
      });
    });
  });

  describe("deleteOneSafetyResources", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: { id: "6139c12f9f1b2c001f8b4567" }, // Mock ObjectId
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      safetyResources.deleteOne = jest.fn(); // Mock deleteOne method
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should delete the safety resource successfully", async () => {
      safetyResources.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await deleteOneSafetyResources(req, res);

      expect(safetyResources.deleteOne).toHaveBeenCalledWith({
        _id: new ObjectId(req.params.id),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Resource deleted successfully");
    });

    it("should return 404 if the resource is not found", async () => {
      safetyResources.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await deleteOneSafetyResources(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Resource not found");
    });

    it("should handle errors when deleting a safety resource", async () => {
      const error = new Error("Delete error");
      safetyResources.deleteOne.mockRejectedValue(error);

      await deleteOneSafetyResources(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error deleting the resource");
    });
  });

  describe("updateSafetyResource", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: { id: "6139c12f9f1b2c001f8b4567" }, // Mock ObjectId
        body: { title: "Updated Title", description: "Updated description" },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      safetyResources.updateOne = jest.fn(); // Mock updateOne method
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should update the safety resource successfully", async () => {
      safetyResources.updateOne.mockResolvedValue({ matchedCount: 1 });

      await updateSafetyResource(req, res);

      expect(safetyResources.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Resource updated successfully");
    });

    it("should return 404 if the resource to update is not found", async () => {
      safetyResources.updateOne.mockResolvedValue({ matchedCount: 0 });

      await updateSafetyResource(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Resource not found");
    });

    it("should handle errors when updating a safety resource", async () => {
      const error = new Error("Update error");
      safetyResources.updateOne.mockRejectedValue(error);

      await updateSafetyResource(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error updating the resource");
    });
  });

  describe("getSafetyResource", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: { id: "6139c12f9f1b2c001f8b4567" }, // Mock ObjectId
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      safetyResources.findOne = jest.fn(); // Mock findOne method
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch a single safety resource successfully", async () => {
      const mockResource = {
        _id: "6139c12f9f1b2c001f8b4567",
        title: "Resource 1",
        type: "Type 1",
        description: "Description 1",
        link: "https://example.com/resource1",
      };
      safetyResources.findOne.mockResolvedValue(mockResource);

      await getSafetyResource(req, res);

      expect(safetyResources.findOne).toHaveBeenCalledWith({
        _id: new ObjectId(req.params.id),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResource);
    });

    it("should return 404 if the resource is not found", async () => {
      safetyResources.findOne.mockResolvedValue(null);

      await getSafetyResource(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Resource not found");
    });

    it("should handle errors when fetching a safety resource", async () => {
      const error = new Error("Fetch error");
      safetyResources.findOne.mockRejectedValue(error);

      await getSafetyResource(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error fetching resource");
    });
  });
});

describe("User Safety Resources Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("userSafetyResources", () => {
    it("should fetch all safety resources successfully", async () => {
      const mockResources = [
        { title: "Resource 1", type: "Type 1", description: "Description 1", link: "https://example.com/resource1" },
        { title: "Resource 2", type: "Type 2", description: "Description 2", link: "https://example.com/resource2" },
      ];
      safetyResources.find.mockResolvedValue(mockResources);

      await userSafetyResources(req, res);

      expect(safetyResources.find).toHaveBeenCalledWith(
        {},
        "title type description link"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Resources fetched successfully",
        data: mockResources,
      });
    });

    it("should handle errors when fetching safety resources", async () => {
      const error = new Error("Database error");
      safetyResources.find.mockRejectedValue(error);

      await userSafetyResources(req, res);

      expect(safetyResources.find).toHaveBeenCalledWith(
        {},
        "title type description link"
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching safety resources." + error,
      });
    });
  });
});