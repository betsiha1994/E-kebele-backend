const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML
 */
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

/**
 * Notify user when a service request is approved
 * @param {string} userEmail
 * @param {string} requestTitle
 */
async function notifyRequestApproved(userEmail, requestTitle) {
  const subject = "Your Request has been Approved ✅";
  const html = `<p>Hello,</p>
                <p>Your service request <strong>${requestTitle}</strong> has been <strong>approved</strong>.</p>
                <p>Thank you for using e-Kebele system!</p>`;
  await sendEmail(userEmail, subject, html);
}

/**
 * Notify user when a service request is rejected
 * @param {string} userEmail
 * @param {string} requestTitle
 * @param {string} reason
 */
async function notifyRequestRejected(userEmail, requestTitle, reason) {
  const subject = "Your Request has been Rejected ❌";
  const html = `<p>Hello,</p>
                <p>Your service request <strong>${requestTitle}</strong> has been <strong>rejected</strong>.</p>
                <p>Reason: ${reason}</p>
                <p>Please contact the admin if you have any questions.</p>`;
  await sendEmail(userEmail, subject, html);
}

module.exports = {
  sendEmail,
  notifyRequestApproved,
  notifyRequestRejected,
};
