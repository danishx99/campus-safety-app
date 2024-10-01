const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middlewares/authMiddleware");

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should redirect to login if no token is provided", () => {
    authMiddleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if token is valid", () => {
    req.cookies.token = "validToken";

    jwt.verify.mockReturnValue({
      userEmail: "test@example.com",
      role: "user",
    });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      process.env.JWT_SECRET
    );

    expect(req.userEmail).toBe("test@example.com");
    expect(req.role).toBe("user");

    expect(next).toHaveBeenCalled();
  });

  it("should redirect to login if token is invalid", () => {
    req.cookies.token = "invalidToken";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "invalidToken",
      process.env.JWT_SECRET
    );

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("should log error message when token verification fails", () => {
    req.cookies.token = "invalidToken";
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    jwt.verify.mockImplementation(() => {
      throw new Error("Token verification failed");
    });

    authMiddleware(req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error authenticating user:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
