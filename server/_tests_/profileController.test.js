const { getUserDetails, updateUserDetails } = require("../controllers/profileController");
const User = require("../schemas/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../schemas/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Profile Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: { token: "mockToken" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserDetails", () => {
    it("should get user details successfully", async () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "user",
        phone: "1234567890",
        profilePicture: "profile.jpg",
        createdAt: new Date(),
      };

      jwt.verify.mockReturnValue({ userEmail: "john@example.com" });
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await getUserDetails(req, res);

      expect(jwt.verify).toHaveBeenCalledWith("mockToken", process.env.JWT_SECRET);
      expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(res.json).toHaveBeenCalledWith({
        message: "Successfully got user details",
        user: mockUser,
      });
    });

    it("should return 404 if user is not found", async () => {
      jwt.verify.mockReturnValue({ userEmail: "nonexistent@example.com" });
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle errors and return 500", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Token verification failed");
      });

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("updateUserDetails", () => {
    it("should update user details successfully", async () => {
      const updatedUser = {
        email: "john@example.com",
        phone: "9876543210",
        profilePicture: "new-profile.jpg",
      };

      jwt.verify.mockReturnValue({ userEmail: "john@example.com" });
      User.findOneAndUpdate.mockResolvedValue(updatedUser);

      req.body = {
        phone: "9876543210",
        profilePicture: "new-profile.jpg",
      };

      await updateUserDetails(req, res);

      expect(jwt.verify).toHaveBeenCalledWith("mockToken", process.env.JWT_SECRET);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: "john@example.com" },
        { phone: "9876543210", profilePicture: "new-profile.jpg" },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully",
        user: updatedUser,
      });
    });

    it("should update password if newPassword is provided", async () => {
      jwt.verify.mockReturnValue({ userEmail: "john@example.com" });
      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.findOneAndUpdate.mockResolvedValue({
        email: "john@example.com",
        password: "hashedPassword",
      });

      req.body = { newPassword: "newPassword123" };

      await updateUserDetails(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: "john@example.com" },
        { password: "hashedPassword" },
        { new: true, runValidators: true }
      );
    });

    it("should return 404 if user is not found during update", async () => {
      jwt.verify.mockReturnValue({ userEmail: "nonexistent@example.com" });
      User.findOneAndUpdate.mockResolvedValue(null);

      req.body = { phone: "9876543210" };

      await updateUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle errors and return 500", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Token verification failed");
      });

      await updateUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
