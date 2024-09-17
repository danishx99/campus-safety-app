const jwt = require("jsonwebtoken");
const { homeRedirect } = require("../middlewares/homeRedirect"); // Adjust the path as needed

jest.mock("jsonwebtoken"); // Mock jwt

describe("homeRedirect middleware", () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: {}, // Mock cookies
    };
    res = {
      redirect: jest.fn(), // Mock redirect
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks between tests
  });

  it("should redirect to /login if no token is present", async () => {
    req.cookies.token = undefined; // No token in cookies

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should redirect to /user for student role", async () => {
    req.cookies.token = "validStudentToken";

    // Mock jwt.verify to return a valid token with student role
    jwt.verify.mockReturnValue({
      userEmail: "student@example.com",
      role: "student",
    });

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/user");
  });

  it("should redirect to /user for staff role", async () => {
    req.cookies.token = "validStaffToken";

    // Mock jwt.verify to return a valid token with staff role
    jwt.verify.mockReturnValue({
      userEmail: "staff@example.com",
      role: "staff",
    });

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/user");
  });

  it("should redirect to /admin for admin role", async () => {
    req.cookies.token = "validAdminToken";

    // Mock jwt.verify to return a valid token with admin role
    jwt.verify.mockReturnValue({
      userEmail: "admin@example.com",
      role: "admin",
    });

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/admin");
  });

  it("should redirect to /login if token verification fails", async () => {
    req.cookies.token = "invalidToken";

    // Mock jwt.verify to throw an error for invalid token
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await homeRedirect(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/login");
  });
});
