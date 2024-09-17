const jwt = require("jsonwebtoken");
const path = require("path");
const { isLoggedIn } = require("../middlewares/isLoggedIn"); // Adjust the path as needed

jest.mock("jsonwebtoken"); // Mock jwt
jest.mock("path"); // Mock path module

describe("isLoggedIn middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {}, // Mock cookies
    };
    res = {
      redirect: jest.fn(), // Mock redirect
      sendFile: jest.fn(), // Mock sendFile
    };
    next = jest.fn(); // Mock next
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks between tests
  });

  it("should redirect logged in students or staff to /user", async () => {
    req.cookies.token = "validToken";

    // Mock jwt.verify to return a valid token with student role
    jwt.verify.mockReturnValue({ role: "student" });

    const middleware = isLoggedIn("login");
    await middleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/user");
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it("should redirect logged in admins to /admin", async () => {
    req.cookies.token = "validAdminToken";

    // Mock jwt.verify to return a valid token with admin role
    jwt.verify.mockReturnValue({ role: "admin" });

    const middleware = isLoggedIn("login");
    await middleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/admin");
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it("should serve login.html if no token is present for login page", async () => {
    const resolvedPath = "/some/path/login.html";
    path.join.mockReturnValue(resolvedPath); // Mock path.join to return a resolved path

    const middleware = isLoggedIn("login");
    await middleware(req, res, next);

    expect(res.sendFile).toHaveBeenCalledWith(resolvedPath);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it("should serve register.html if no token is present for register page", async () => {
    const resolvedPath = "/some/path/register.html";
    path.join.mockReturnValue(resolvedPath); // Mock path.join to return a resolved path

    const middleware = isLoggedIn("register");
    await middleware(req, res, next);

    expect(res.sendFile).toHaveBeenCalledWith(resolvedPath);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it("should serve login.html if token verification fails", async () => {
    req.cookies.token = "invalidToken";

    // Mock jwt.verify to throw an error for invalid token
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const resolvedPath = "/some/path/login.html";
    path.join.mockReturnValue(resolvedPath);

    const middleware = isLoggedIn("login");
    await middleware(req, res, next);

    expect(res.sendFile).toHaveBeenCalledWith(resolvedPath);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
