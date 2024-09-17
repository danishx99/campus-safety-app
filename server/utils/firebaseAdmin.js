const admin = require('firebase-admin');
const serviceAccount = require('../../campus-safety-fcm-firebase-adminsdk-k3uhg-5fe8524d8f.json');

//Initialize the admin SDK with the service account and make sure to catch any errors

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

} catch (error) {
    console.log('Firebase admin initialization error: ', error);
}



// //Log to see if the admin is initialized(by finding out from admin)
// console.log(admin);

module.exports = admin;