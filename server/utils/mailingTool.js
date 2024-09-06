const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// check if transporter was created successfully
if (!transporter) {
    throw new Error("Error creating transporter");
  }
  
// Verify the transporter connection
transporter.verify((error, success) => {
if (error) {
    console.log("Error connecting to email transporter:", error);
} else {
    console.log("Email transporter connected successfully");
}
});
  

const sendRequest = (to, url, resetToken) => {
  const mailOptions = {
    from: "noreply@campus-safety.com",
    to,
    subject:"Password Reset Request",
    text:`
            Hello,
    
            We received a request to reset your password. If you did not make this request, please ignore this email.
    
            To reset your password, please click the following link:
            ${url}/resetPassword?token=${resetToken}
    
            This link will expire in 1 hour.
    
            Best regards,
            Campus Safety Admin Team
          `,
  };

  return transporter.sendMail(mailOptions);
};

const sendSuccess = (to) => {
    const mailOptions = {
      from: "noreply@campus-safety.com",
      to,
      subject:"Password Reset Successful",
      text: `
        Hello there,

        Your password has been successfully reset.

        If you did not make this request, please contact us immediately.

        Best regards,
        Campus Safety Admin Team
        

    `,
    };
  
    return transporter.sendMail(mailOptions);
  };

module.exports = { sendRequest, sendSuccess };