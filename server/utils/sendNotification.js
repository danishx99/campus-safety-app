const admin = require("./firebaseAdmin");

async function sendNotificationn(fcmTokens, data = {}) {
  const stringifiedData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      stringifiedData[key] = String(data[key]);
    }
  }

  const message = {
    data: stringifiedData,
    tokens: fcmTokens,

    // Add Android and Web Push configurations with high priority
    android: {
      priority: 'high', // High priority for Android devices
    },
    webpush: {
      headers: {
        Urgency: 'high', // High urgency for Web Push notifications
      }
    }
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

module.exports = sendNotificationn;

// sendNotificationn(
//   ['cQAXp12Tf8QWe7DA2omD_m:APA91bHJKrgRDYT1QTs64Wz91HPM6AXBSWfIJmcZ-xGccOi5gyWGvM-zzu3E8do2Mqpddl7V0F4R0iDjGJRam6CyBU-7qY0cs7WdOl5se8UaeCIq-RSs80aFWxewGWN_Q145F9IRzbxu'],
  
  
//   { emergencyAlertId: '66fafebc1803524f2120da43', status: 'Assigned'}
// );
