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
<html lang="el">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">ThesisFlow</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Σύστημα Διαχείρισης Διπλωματικών</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">ThesisFlow • Αυτόματη ειδοποίηση — παρακαλώ μην απαντάτε σε αυτό το email</p>
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
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Γεια σου <strong>${studentName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Η πρότασή σου για διπλωματική εργασία εγκρίθηκε!</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:20px;margin-bottom:28px;">
      <p style="color:#15803d;font-size:16px;font-weight:600;margin:0;">"${dissertationTitle}"</p>
    </div>
    <div style="text-align:center;">
      <a href="${BASE_URL}/my-dissertation"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Δες την Εργασία σου
      </a>
    </div>`;

  await sendEmail(studentEmail, '✅ Η πρότασή σου εγκρίθηκε!', baseTemplate(content));
};

const sendProposalRejectedEmail = async (studentEmail, studentName, dissertationTitle) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Γεια σου <strong>${studentName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Δυστυχώς η πρότασή σου για διπλωματική εργασία δεν εγκρίθηκε.</p>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:20px;margin-bottom:28px;">
      <p style="color:#991b1b;font-size:16px;font-weight:600;margin:0;">"${dissertationTitle}"</p>
    </div>
    <p style="color:#6b7280;font-size:14px;">Μπορείς να υποβάλεις νέα πρόταση μέσω του συστήματος.</p>
    <div style="text-align:center;margin-top:24px;">
      <a href="${BASE_URL}/my-proposals"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Οι Προτάσεις μου
      </a>
    </div>`;

  await sendEmail(studentEmail, '❌ Η πρότασή σου δεν εγκρίθηκε', baseTemplate(content));
};

const sendNewCommentEmail = async (recipientEmail, recipientName, commenterName, dissertationTitle, dissertationId) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Γεια σου <strong>${recipientName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Ο/Η <strong>${commenterName}</strong> πρόσθεσε νέο σχόλιο στη διπλωματική εργασία:</p>
    <div style="background:#f8f9ff;border-left:4px solid #667eea;border-radius:8px;padding:20px;margin-bottom:28px;">
      <p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">"${dissertationTitle}"</p>
    </div>
    <div style="text-align:center;">
      <a href="${BASE_URL}/dissertation/${dissertationId}"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Δες το Σχόλιο
      </a>
    </div>`;

  await sendEmail(recipientEmail, `💬 Νέο σχόλιο από ${commenterName}`, baseTemplate(content));
};

const sendNewFileEmail = async (recipientEmail, recipientName, uploaderName, dissertationTitle, dissertationId, fileName) => {
  const content = `
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Γεια σου <strong>${recipientName}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Ο/Η <strong>${uploaderName}</strong> ανέβασε νέο αρχείο στη διπλωματική εργασία:</p>
    <div style="background:#f8f9ff;border-left:4px solid #667eea;border-radius:8px;padding:20px;margin-bottom:16px;">
      <p style="color:#1f2937;font-size:16px;font-weight:600;margin:0 0 8px;">"${dissertationTitle}"</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">📎 ${fileName}</p>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${BASE_URL}/dissertation/${dissertationId}"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Δες τα Αρχεία
      </a>
    </div>`;

  await sendEmail(recipientEmail, `📎 Νέο αρχείο από ${uploaderName}`, baseTemplate(content));
};

module.exports = {
  sendProposalApprovedEmail,
  sendProposalRejectedEmail,
  sendNewCommentEmail,
  sendNewFileEmail
};