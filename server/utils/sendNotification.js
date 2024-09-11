const admin = require('./firebase-admin');

async function sendNotification(fcmTokens, title, body, data = {}) {
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens: fcmTokens
    };
  
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      response.responses.forEach((resp, idx) => {
        if (resp.success) {
          console.log(`Successfully sent message to ${fcmTokens[idx]}`);
        } else {
          console.error(`Failed to send message to ${fcmTokens[idx]}: ${resp.error}`);
        }
      });
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.log('Error sending message:', error);
      throw error;
    }
  }

module.exports = sendNotification;
  
// sendNotification(['eyWaTGlD-3v5cRW3k5BkON:APA91bGcypc0uykn_XZZI8af1RAw_fkcXYZ0SzHBS6n8mS35TqZh1v3mgLhOng9HKEmg37ZYXyqmHahmubkdxh0A0_Zmt6v4q75VEt7Ern10L6n9hkTwowNKcbU9m1ZQWk-0wwFJOXnK'], 'Hi there!', 'sending custome message!', { key1: 'value1', key2: 'value2' });