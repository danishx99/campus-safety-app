const jwt = require("jsonwebtoken");
const { isAdmin } = require("../middlewares/isAdmin"); // Adjust the path as needed

jest.mock("jsonwebtoken"); // Mock the jwt module

describe("isAdmin middleware", () => {
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

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it("should redirect to login if no token is provided", async () => {
    await isAdmin(req, res, next);

    // Assert that res.redirect was called with '/login'
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled(); // next() should not be called
  });

  it("should redirect to login if token verification fails", async () => {
    req.cookies.token = "invalidToken";

    // Mock jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await isAdmin(req, res, next);

    // Assert that res.redirect was called with '/login'
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not an admin", async () => {
    req.cookies.token = "validToken";

    // Mock jwt.verify to return a decoded token with a non-admin role
    jwt.verify.mockReturnValue({
      userEmail: "user@example.com",
      role: "user", // Not an admin
    });

    await isAdmin(req, res, next);

    // Assert that a 403 status is returned with the correct error message
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "You are not authorized to access this resource (Not an admin). This page will probs be replaced with a dedicated page for this error",
    });

    expect(next).not.toHaveBeenCalled(); // next() should not be called
  });

  it("should call next if the user is an admin", async () => {
    req.cookies.token = "validAdminToken";

    // Mock jwt.verify to return a decoded token with an admin role
    jwt.verify.mockReturnValue({
      userEmail: "admin@example.com",
      role: "admin", // Admin role
    });

    await isAdmin(req, res, next);

    // Assert that next() was called
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
