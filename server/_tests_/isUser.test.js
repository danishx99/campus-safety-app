const jwt = require("jsonwebtoken");
const path = require("path");
const { isUser } = require("../middlewares/isUser"); // Adjust the path as needed

jest.mock("jsonwebtoken"); // Mock the jwt module

describe("isUser middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {}, // Mock cookies object
    };
    res = {
      redirect: jest.fn(), // Mock redirect function
      status: jest.fn().mockReturnThis(), // Mock status and chaining
      sendFile: jest.fn(), // Mock sendFile for serving HTML
    };
    next = jest.fn(); // Mock next function
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it("should redirect to login if no token is provided", async () => {
    await isUser(req, res, next);

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

    await isUser(req, res, next);

    // Assert that res.redirect was called with '/login'
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 and send authorisation HTML for unauthorized roles", async () => {
    req.cookies.token = "validToken";

    // Mock jwt.verify to return a decoded token with an unauthorized role
    jwt.verify.mockReturnValue({
      userEmail: "user@example.com",
      role: "admin", // Unauthorized role
    });

    await isUser(req, res, next);

    // Assert that a 403 status is returned and authorisation.html is served
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, "../../client/html/error/authorisation.html")
    );

    expect(next).not.toHaveBeenCalled(); // next() should not be called
  });

  it("should call next if the user is a student", async () => {
    req.cookies.token = "validStudentToken";

    // Mock jwt.verify to return a decoded token with the "student" role
    jwt.verify.mockReturnValue({
      userEmail: "student@example.com",
      role: "student", // Authorized role
    });

    await isUser(req, res, next);

    // Assert that next() was called
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it("should call next if the user is a staff", async () => {
    req.cookies.token = "validStaffToken";

    // Mock jwt.verify to return a decoded token with the "staff" role
    jwt.verify.mockReturnValue({
      userEmail: "staff@example.com",
      role: "staff", // Authorized role
    });

    await isUser(req, res, next);

    // Assert that next() was called
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
  });
});
