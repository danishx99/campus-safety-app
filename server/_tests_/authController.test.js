// Import dependencies
const { register } = require("../controllers/authController");
const bcrypt = require("bcryptjs");
const httpMocks = require("node-mocks-http");
const User = require("../schemas/User");
const Code = require("../schemas/Code");
const mailer = require("../utils/mailingTool"); // Assuming mailing is used for verification emails

// Mock external dependencies
jest.mock("../schemas/User");
jest.mock("../schemas/Code");
jest.mock("bcryptjs");
jest.mock("../utils/mailingTool");

describe("AuthController - Register", () => {
  let req, res;

  beforeEach(() => {
    // Mock HTTP request and response
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it("should return 400 if the user provides an invalid code for admin", async () => {
    req.body = {
      email: "admin@example.com",
      account: 0, // admin account
      code: "invalidCode",
      phone: "123456789",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    // Mock Code.findOne to return null (invalid code)
    Code.findOne.mockResolvedValue(null);

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "Invalid code. Please contact management for further assistance",
    });
  });

  it("should return 400 if the registration code has expired", async () => {
    req.body = {
      email: "admin@example.com",
      account: 0, // admin account
      code: "validCode",
      phone: "123456789",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    // Mock Code.findOne to return a valid code that has expired
    Code.findOne.mockResolvedValue({
      userCode: "validCode",
      createdAt: Date.now() - 86400001, // more than 24 hours ago
    });

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "Registration code has expired",
    });
  });

  it("should return 400 if the user already exists", async () => {
    req.body = {
      email: "user@example.com",
      account: 1, // student account
      phone: "123456789",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    };

    // Mock User.findOne to return an existing user
    User.findOne.mockResolvedValue({
      email: "user@example.com",
    });

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "A user with this email address already exists.",
    });
  });

  it("should hash the password and create a new user successfully", async () => {
    req.body = {
      email: "newuser@example.com",
      account: 1, // student account
      phone: "123456789",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    };

    // Mock User.findOne to return null (no existing user)
    User.findOne.mockResolvedValue(null);

    // Mock bcrypt.hash to return a hashed password
    bcrypt.hash.mockResolvedValue("hashedPassword123");

    // Mock the save method on the User model
    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newuser@example.com",
        password: "hashedPassword123", // hashed password
      })
    );
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: "Registration successful!",
    });
  });

  it("should handle server errors gracefully", async () => {
    req.body = {
      email: "newuser@example.com",
      account: 1,
      phone: "123456789",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    };

    // Mock a server error when trying to save a new user
    User.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    }));

    await register(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      error: "Error registering user",
    });
  });
});
