const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
        <p>To reset your password, please click the following link:</p>
        <p><a href="${url}/resetPassword?token=${resetToken}">${url}/resetPassword?token=${resetToken}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,</p>
        <p>Campus Safety Admin Team</p>
        <hr>
        <div style="text-align: center;">
          <img src="https://campus-safety.azurewebsites.net/assets/logo.webp" alt="Campus Safety Logo" style="max-width: 100px;"/>
        </div>
        <p>Contact us: 0764737275 | mycampussafety@gmail.com</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendSuccess = (to) => {
  const mailOptions = {
    from: "noreply@campus-safety.com",
    to,
    subject: "Password Reset Successful",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2>Password Reset Successful</h2>
        <p>Hello there,</p>
        <p>Your password has been successfully reset.</p>
        <p>If you did not make this request, please contact us immediately.</p>
        <p>Best regards,</p>
        <p>Campus Safety Admin Team</p>
        <hr>
        <div style="text-align: center;">
          <img src="https://campus-safety.azurewebsites.net/assets/logo.webp" alt="Campus Safety Logo" style="max-width: 100px;"/>
        </div>
        <p>Contact us: 0764737275 | mycampussafety@gmail.com</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendIncidentUpdateEmail = (
  title,
  description,
  to,
  firstName,
  LastName
) => {
  const mailOptions = {
    from: "noreply@campus-safety.com",
    to,
    subject: `Incident Update: ${title} `,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2>Incident Update</h2>
        <p>Hello ${firstName} ${LastName},</p>
        <p>${description}</p>
        <p>Best regards,</p>
        <p>Campus Safety Admin Team</p>
        <hr>
        <div style="text-align: center;">
          <img src="https://campus-safety.azurewebsites.net/assets/logo.webp" alt="Campus Safety Logo" style="max-width: 100px;"/>
        </div>
        <p>Contact us: 0764737275 | mycampussafety@gmail.com</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendVerificationEmail = (to, url, token) => {
  const mailOptions = {
    from: "noreply@campus-safety.com",
    to,
    subject: "Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2>Email Verification</h2>
        <p>Hello there,</p>
        <p>Please verify your email by clicking the link:</p>
        <p><a href="${url}/verifyEmail?token=${token}">${url}/verifyEmail?token=${token}</a></p>
        <p>Best regards,</p>
        <p>Campus Safety Admin Team</p>
        <hr>
        <div style="text-align: center;">
          <img src="https://campus-safety.azurewebsites.net/assets/logo.webp" alt="Campus Safety Logo" style="max-width: 100px;"/>
        </div>
        <p>Contact us: 0764737275 | mycampussafety@gmail.com</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const resendVerificationEmail = (to, url, token) => {
  const mailOptions = {
    from: "noreply@campus-safety.com",
    to,
    subject: "Email Verification (Resend)",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2>Email Verification (Resend)</h2>
        <p>Hello there,</p>
        <p>Please verify your email by clicking the link:</p>
        <p><a href="${url}/verifyEmail?token=${token}">${url}/verifyEmail?token=${token}</a></p>
        <p>Best regards,</p>
        <p>Campus Safety Admin Team</p>
        <hr>
        <div style="text-align: center;">
          <img src="https://campus-safety.azurewebsites.net/assets/logo.png" alt="Campus Safety Logo" style="max-width: 100px;"/>
        </div>
        <p>Contact us: 0764737275 | mycampussafety@gmail.com</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendRequest,
  sendSuccess,
  sendVerificationEmail,
  resendVerificationEmail,
  sendIncidentUpdateEmail,
};
