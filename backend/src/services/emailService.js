const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">ThesisFlow</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Dissertation Management System</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">ThesisFlow • Automated notification — please do not reply to this email</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"ThesisFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

const sendProposalApprovedEmail = async (studentEmail, studentName, dissertationTitle) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Dear <strong>${studentName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Your dissertation proposal has been approved!</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:20px;margin-bottom:28px;">
      <p style="color:#15803d;font-size:16px;font-weight:600;margin:0;">"${dissertationTitle}"</p>
    </div>
    <div style="text-align:center;">
      <a href="${BASE_URL}/my-dissertation"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View your Dissertation
      </a>
    </div>`;

  await sendEmail(studentEmail, '✅ Your proposal has been approved!', baseTemplate(content));
};

const sendProposalRejectedEmail = async (studentEmail, studentName, dissertationTitle) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Dear <strong>${studentName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Unfortunately, your dissertation proposal was not approved.</p>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:20px;margin-bottom:28px;">
      <p style="color:#991b1b;font-size:16px;font-weight:600;margin:0;">"${dissertationTitle}"</p>
    </div>
    <p style="color:#6b7280;font-size:14px;">You can submit a new proposal through the system.</p>
    <div style="text-align:center;margin-top:24px;">
      <a href="${BASE_URL}/my-proposals"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        My Proposals
      </a>
    </div>`;

  await sendEmail(studentEmail, '❌ Your proposal was not approved', baseTemplate(content));
};

const sendNewCommentEmail = async (recipientEmail, recipientName, commenterName, dissertationTitle, dissertationId) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Dear <strong>${recipientName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;"><strong>${commenterName}</strong> added a new comment on the dissertation:</p>
    <div style="background:#f8f9ff;border-left:4px solid #667eea;border-radius:8px;padding:20px;margin-bottom:28px;">
      <p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">"${dissertationTitle}"</p>
    </div>
    <div style="text-align:center;">
      <a href="${BASE_URL}/dissertation/${dissertationId}"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Comment
      </a>
    </div>`;

  await sendEmail(recipientEmail, `💬 New comment from ${commenterName}`, baseTemplate(content));
};

const sendNewFileEmail = async (recipientEmail, recipientName, uploaderName, dissertationTitle, dissertationId, fileName) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Dear <strong>${recipientName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;"><strong>${uploaderName}</strong> uploaded a new file to the dissertation:</p>
    <div style="background:#f8f9ff;border-left:4px solid #667eea;border-radius:8px;padding:20px;margin-bottom:16px;">
      <p style="color:#1f2937;font-size:16px;font-weight:600;margin:0 0 8px;">"${dissertationTitle}"</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">📎 ${fileName}</p>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${BASE_URL}/dissertation/${dissertationId}"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Files
      </a>
    </div>`;

  await sendEmail(recipientEmail, `📎 New file uploaded by ${uploaderName}`, baseTemplate(content));
};

const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = (email, otp, userData) => {
  otpStore.set(email, {
    otp,
    userData,
    expiresAt: Date.now() + 10 * 60 * 1000
  });
};

const verifyOTP = (email, otp) => {
  const entry = otpStore.get(email);
  if (!entry) return { valid: false, reason: 'NO_OTP' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: 'EXPIRED' };
  }
  if (entry.otp !== otp) return { valid: false, reason: 'INVALID' };
  const userData = entry.userData;
  otpStore.delete(email);
  return { valid: true, userData };
};

const sendOTPEmail = async (email, name, otp) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Use the code below to complete your registration on ThesisFlow:</p>
    <div style="background:#f0f4ff;border-left:4px solid #667eea;border-radius:8px;padding:28px;margin-bottom:28px;text-align:center;">
      <p style="color:#667eea;font-size:36px;font-weight:800;letter-spacing:10px;margin:0;">${otp}</p>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">The code expires in <strong>10 minutes</strong>. If you did not register, please ignore this email.</p>`;
  await sendEmail(email, '🔐 ThesisFlow verification code', baseTemplate(content));
};

const resetOtpStore = new Map();

const storeResetOTP = (email, otp) => {
  resetOtpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });
};

const verifyResetOTP = (email, otp) => {
  const entry = resetOtpStore.get(email);
  if (!entry) return { valid: false, reason: 'NO_OTP' };
  if (Date.now() > entry.expiresAt) {
    resetOtpStore.delete(email);
    return { valid: false, reason: 'EXPIRED' };
  }
  if (entry.otp !== otp && entry.otp !== '__verified__') return { valid: false, reason: 'INVALID' };
  if (entry.otp === '__verified__' && otp !== '__verify_only__') {
    resetOtpStore.delete(email);
    return { valid: true };
  }
  resetOtpStore.set(email, { ...entry, verified: true, otp: '__verified__' });
  return { valid: true };
};

const sendPasswordResetEmail = async (email, name, otp) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">We received a password reset request for your account. Use the code below:</p>
    <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:28px;margin-bottom:28px;text-align:center;">
      <p style="color:#ea580c;font-size:36px;font-weight:800;letter-spacing:10px;margin:0;">${otp}</p>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">The code expires in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>`;
  await sendEmail(email, '🔑 ThesisFlow password reset', baseTemplate(content));
};

module.exports = {
  sendProposalApprovedEmail,
  sendProposalRejectedEmail,
  sendNewCommentEmail,
  sendNewFileEmail,
  sendOTPEmail,
  storeOTP,
  verifyOTP,
  sendPasswordResetEmail,
  storeResetOTP,
  verifyResetOTP
};