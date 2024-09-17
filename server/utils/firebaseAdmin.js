require("dotenv").config(); // Load environment variables from .env file

const admin = require("firebase-admin");

// Construct service account object from environment variables
const serviceAccount = {
  type: "service_account",
  project_id: "campus-safety-fcm",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newline characters in private key
  client_email:
    "firebase-adminsdk-k3uhg@campus-safety-fcm.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-k3uhg%40campus-safety-fcm.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.log("Firebase admin initialization error: ", error);
}

//console.log(admin);

module.exports = admin;
