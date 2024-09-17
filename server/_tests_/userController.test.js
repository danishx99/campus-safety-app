const { userSafetyResources } = require("../controllers/userController"); // Adjust the path as needed
const safetyResources = require("../schemas/safetyResources");

jest.mock("../schemas/safetyResources"); // Mock the safetyResources model

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
      // Mock the resolved value for safetyResources.find
      const mockResources = [
        { title: "Resource 1", type: "Type 1", description: "Description 1" },
        { title: "Resource 2", type: "Type 2", description: "Description 2" },
      ];
      safetyResources.find.mockResolvedValue(mockResources);

      await userSafetyResources(req, res);

      expect(safetyResources.find).toHaveBeenCalledWith(
        {},
        "title type description"
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
        "title type description"
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching safety resources." + error,
      });
    });
  });
});
