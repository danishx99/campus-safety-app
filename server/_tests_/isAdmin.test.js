const jwt = require("jsonwebtoken");
const path = require("path");
const { isAdmin } = require("../middlewares/isAdmin");
const User = require("../schemas/User");

jest.mock("jsonwebtoken");
jest.mock("path");
jest.mock("../schemas/User");

describe("isAdmin middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      sendFile: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to login if no token is provided", async () => {
    await isAdmin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("should redirect to login if token verification fails", async () => {
    req.cookies.token = "invalidToken";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await isAdmin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 and send authorization error HTML if user is not an admin", async () => {
    req.cookies.token = "validToken";

    jwt.verify.mockReturnValue({
      userEmail: "user@example.com",
      role: "user",
    });

    path.join.mockReturnValue("/path/to/authorisation.html");

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.sendFile).toHaveBeenCalledWith("/path/to/authorisation.html");
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if the user is an admin", async () => {
    req.cookies.token = "validAdminToken";

    jwt.verify.mockReturnValue({
      userEmail: "admin@example.com",
      role: "admin",
    });

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it("should handle errors and redirect to login", async () => {
    req.cookies.token = "validToken";

    jwt.verify.mockImplementation(() => {
      throw new Error("Some unexpected error");
    });

    await isAdmin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });
});
