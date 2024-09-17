const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middlewares/authMiddleware"); // Adjust the path as needed

jest.mock("jsonwebtoken"); // Mock the jwt module

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {}, // Mock cookies object
    };
    res = {
      redirect: jest.fn(), // Mock redirect function
      status: jest.fn().mockReturnThis(), // Mock status and chaining
      json: jest.fn(), // Mock json function for sending responses
    };
    next = jest.fn(); // Mock next function
  });

  it("should redirect to login if no token is provided", () => {
    // Call the middleware without a token
    authMiddleware(req, res, next);

    // Assert that res.redirect was called with '/login'
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled(); // next() should not be called
  });

  it("should call next if token is valid", () => {
    // Provide a valid token in cookies
    req.cookies.token = "validToken";

    // Mock jwt.verify to return a decoded token
    jwt.verify.mockReturnValue({
      userEmail: "test@example.com",
      role: "user",
    });

    // Call the middleware
    authMiddleware(req, res, next);

    // Assert that jwt.verify was called with the correct arguments
    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      process.env.JWT_SECRET
    );

    // Assert that the email and role were added to the request object
    expect(req.userEmail).toBe("test@example.com");
    expect(req.role).toBe("user");

    // Assert that next() was called
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    // Provide an invalid token in cookies
    req.cookies.token = "invalidToken";

    // Mock jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    // Call the middleware
    authMiddleware(req, res, next);

    // Assert that res.status and res.json were called with the correct error message
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });

    // Assert that next() was not called
    expect(next).not.toHaveBeenCalled();
  });
});
