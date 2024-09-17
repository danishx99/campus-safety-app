const admin = require("./firebaseAdmin");

async function _sendNotification(fcmTokens, title, body, data = {}) {
  const stringifiedData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      stringifiedData[key] = String(data[key]);
    }
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: stringifiedData,
    tokens: fcmTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        console.log(`Successfully sent message to ${fcmTokens[idx]}`);
      } else {
        console.error(
          `Failed to send message to ${fcmTokens[idx]}: ${resp.error}`
        );
      }
    });
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.log("Error sending message:", error);
    throw error;
  }
}

module.exports = _sendNotification;

// _sendNotification(['eyWaTGlD-3v5cRW3k5BkON:APA91bHCVTn3PWsrepRC-NGrpulN4dq2C_wME2eFjVl7YPm2ua7Z7jK069VkIPp6E9Hisj-_lhLKpzfsmS8RGaqSgLT041peiXeeh-9RGrRhpBvc2cO4kAJ0-TGqJ82EMdK4uWHXgTxr'], 'Hi there!', 'sending custome message!', { key1: 'value1', key2: 'value2' });
