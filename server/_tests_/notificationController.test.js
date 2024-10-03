const {
  getNotificationHistory,
  sendNotification,
  getUnreadNotifications,
  getAllNotifications,
  redirectToNotificationPage
} = require("../controllers/notificationController");
const notification = require("../schemas/notification");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const _sendNotification = require("../utils/sendNotification");

jest.mock("../schemas/notification");
jest.mock("../schemas/User");
jest.mock("jsonwebtoken");
jest.mock("../utils/sendNotification");

describe("Notification Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      cookies: {},
      body: {},
      userEmail: "test@example.com",
      role: "student"
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getNotificationHistory", () => {
    it("should fetch notification history successfully", async () => {
      const mockNotifications = [
        { _id: "1", message: "Test notification 1" },
        { _id: "2", message: "Test notification 2" }
      ];
      notification.aggregate.mockResolvedValue(mockNotifications);

      await getNotificationHistory(req, res);

      expect(notification.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notifications: mockNotifications,
        totalPages: 1,
        currentPage: 1,
        totalNotifications: 2
      });
    });

    it("should handle errors when fetching notification history", async () => {
      const error = new Error("Database error");
      notification.aggregate.mockRejectedValue(error);

      await getNotificationHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error getting notification history." });
    });

    it("should handle pagination correctly", async () => {
      const mockNotifications = Array(25).fill().map((_, i) => ({ _id: i.toString(), message: `Test notification ${i}` }));
      notification.aggregate.mockResolvedValue(mockNotifications);

      req.query = { page: "2", limit: "10" };

      await getNotificationHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notifications: mockNotifications.slice(10, 20),
        totalPages: 3,
        currentPage: 2,
        totalNotifications: 25
      });
    });
  });

  describe("sendNotification", () => {
    it("should send notification successfully", async () => {
      const mockToken = "mockToken";
      const mockDecoded = { userEmail: "sender@example.com" };
      jwt.verify.mockReturnValue(mockDecoded);
      req.cookies.token = mockToken;
      req.body = {
        recipient: "everyone",
        message: "Test message",
        title: "Test title",
        notificationType: "test",
        senderLocation: [0, 0]
      };

      const mockSavedNotification = {
        _id: "1",
        recipient: "everyone",
        sender: "sender@example.com",
        message: "Test message",
        title: "Test title",
        notificationType: "test",
        senderLocation: [0, 0]
      };
      notification.prototype.save.mockResolvedValue(mockSavedNotification);

      const mockUsers = [{ FCMtoken: "token1" }, { FCMtoken: "token2" }];
      User.find.mockResolvedValue(mockUsers);

      await sendNotification(req, res);

      expect(notification.prototype.save).toHaveBeenCalled();
      expect(User.find).toHaveBeenCalled();
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Notification sent successfully" });
    });

    it("should handle errors when sending notification", async () => {
      const error = new Error("Database error");
      notification.prototype.save.mockRejectedValue(error);

      await sendNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining("Error sending notification.") });
    });

    it("should handle sending notifications to specific roles", async () => {
      const mockToken = "mockToken";
      const mockDecoded = { userEmail: "sender@example.com" };
      jwt.verify.mockReturnValue(mockDecoded);
      req.cookies.token = mockToken;
      req.body = {
        recipient: "staff",
        message: "Test message",
        title: "Test title",
        notificationType: "test",
        senderLocation: [0, 0]
      };

      const mockSavedNotification = {
        _id: "1",
        recipient: "staff",
        sender: "sender@example.com",
        message: "Test message",
        title: "Test title",
        notificationType: "test",
        senderLocation: [0, 0]
      };
      notification.prototype.save.mockResolvedValue(mockSavedNotification);

      const mockUsers = [{ FCMtoken: "token1" }, { FCMtoken: "token2" }];
      User.find.mockResolvedValue(mockUsers);

      await sendNotification(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: "staff" });
      expect(_sendNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle sending notifications to specific users", async () => {
      const mockToken = "mockToken";
      const mockDecoded = { userEmail: "sender@example.com" };
      jwt.verify.mockReturnValue(mockDecoded);
      req.cookies.token = mockToken;
      req.body = {
        recipient: "user@example.com",
        message: "Test message",
        title: "Test title",
        notificationType: "test",
        senderLocation: [0, 0]
      };

      const mockSavedNotification = {
        _id: "1",
        recipient: "user@example.com",
        sender: "sender@example.com",
        message: "Test message",
        title: "Test title",
        notificationType: "test",
        senderLocation: [0, 0]
      };
      notification.prototype.save.mockResolvedValue(mockSavedNotification);

      const mockUser = { FCMtoken: "userToken" };
      User.findOne.mockResolvedValue(mockUser);

      await sendNotification(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
      expect(_sendNotification).toHaveBeenCalledWith(["userToken"], expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getUnreadNotifications", () => {
    it("should fetch unread notifications for a user", async () => {
      const mockNotifications = [
        { _id: "1", message: "Unread notification 1" },
        { _id: "2", message: "Unread notification 2" }
      ];
      notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNotifications)
        })
      });

      await getUnreadNotifications(req, res);

      expect(notification.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: mockNotifications });
    });

    it("should handle errors when fetching unread notifications", async () => {
      const error = new Error("Database error");
      notification.find.mockRejectedValue(error);

      await getUnreadNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error getting unread notifications." });
    });

    it("should fetch unread notifications for admin", async () => {
      req.role = "admin";
      const mockNotifications = [{ _id: "1", message: "Admin notification" }];
      notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNotifications)
        })
      });

      await getUnreadNotifications(req, res);

      expect(notification.find).toHaveBeenCalledWith({ recipient: "admin", read: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: mockNotifications });
    });

    it("should fetch unread notifications for staff", async () => {
      req.role = "staff";
      req.userEmail = "staff@example.com";
      const mockNotifications = [{ _id: "1", message: "Staff notification" }];
      notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNotifications)
        })
      });

      await getUnreadNotifications(req, res);

      expect(notification.find).toHaveBeenCalledWith({
        $or: [
          { recipient: "everyone" },
          { recipient: "staff" },
          { recipient: "staff@example.com" },
        ],
        read: false,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: mockNotifications });
    });
  });

  describe("getAllNotifications", () => {
    it("should fetch all notifications for a user", async () => {
      const mockNotifications = [
        { _id: "1", message: "Notification 1" },
        { _id: "2", message: "Notification 2" }
      ];
      notification.countDocuments.mockResolvedValue(2);
      notification.updateMany.mockResolvedValue({});
      notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNotifications)
          })
        })
      });

      await getAllNotifications(req, res);

      expect(notification.countDocuments).toHaveBeenCalled();
      expect(notification.updateMany).toHaveBeenCalled();
      expect(notification.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notifications: mockNotifications,
        currentPage: 1,
        totalPages: 1,
        totalNotifications: 2
      });
    });

    it("should handle errors when fetching all notifications", async () => {
      const error = new Error("Database error");
      notification.countDocuments.mockRejectedValue(error);

      await getAllNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error getting all notifications." });
    });

    it("should handle pagination correctly", async () => {
      req.query = { page: "2", limit: "5" };
      const mockNotifications = Array(15).fill().map((_, i) => ({ _id: i.toString(), message: `Notification ${i}` }));
      notification.countDocuments.mockResolvedValue(15);
      notification.updateMany.mockResolvedValue({});
      notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNotifications.slice(5, 10))
          })
        })
      });

      await getAllNotifications(req, res);

      expect(notification.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notifications: mockNotifications.slice(5, 10),
        currentPage: 2,
        totalPages: 3,
        totalNotifications: 15
      });
    });
  });

  describe("redirectToNotificationPage", () => {
    it("should redirect admin to admin notification page", async () => {
      const mockToken = "mockToken";
      const mockDecoded = { role: "admin" };
      jwt.verify.mockReturnValue(mockDecoded);
      req.cookies.token = mockToken;

      await redirectToNotificationPage(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(res.redirect).toHaveBeenCalledWith("/admin/viewNotifications");
    });

    it("should redirect non-admin users to user notification page", async () => {
      const mockToken = "mockToken";
      const mockDecoded = { role: "student" };
      jwt.verify.mockReturnValue(mockDecoded);
      req.cookies.token = mockToken;

      await redirectToNotificationPage(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(res.redirect).toHaveBeenCalledWith("/user/viewNotifications");
    });

    it("should handle errors during redirection", async () => {
      const error = new Error("JWT error");
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await redirectToNotificationPage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error redirecting to notification page." });
    });

    it("should handle missing token", async () => {
      req.cookies = {};

      await redirectToNotificationPage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error redirecting to notification page." });
    });
  });
});
