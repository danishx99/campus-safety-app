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
  
// sendNotification(['eyWaTGlD-3v5cRW3k5BkON:APA91bFdypMWD6zu0BtV5JRJyuHjUrKuNBb6ZHT9W3zns4Ei4afoMYMXU7ifno2CEBS7piuX-w0pKGbOnDucN-IrHLoVyRvsOJq__JFWDYa2QfucQHjr6PVWyNhqPluEyqPEZ6lg9Wwm'], 'Hi there!', 'sending custome message!', { key1: 'value1', key2: 'value2' });