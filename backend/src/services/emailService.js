const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const EVENT_TYPE_LABELS = {
  custom: 'Γενικό',
  ΣΥΝΑΝΤΗΣΗ: 'Συνάντηση',
  ΠΑΡΟΥΣΙΑΣΗ_ΘΕΩΡΗΤΙΚΗΣ_ΜΕΛΕΤΗΣ: 'Παρουσίαση Θεωρητικής Μελέτης',
  ΠΑΡΟΥΣΙΑΣΗ_ΠΛΑΝΟΥ_ΕΡΓΑΣΙΑΣ: 'Παρουσίαση Πλάνου Εργασίας',
  MILESTONE: 'Milestone',
  DEADLINE: 'Deadline'
};

const REMINDER_LABELS = {
  at_time: 'Ξεκινά τώρα',
  '10min': '10 λεπτά',
  '30min': '30 λεπτά',
  '1hour': '1 ώρα',
  '24hours': '24 ώρες'
};

const buildReminderEmail = (studentName, event, dissertationTitle, reminderLabel) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('el-GR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = event.time ? ` στις ${event.time}` : '';
  const typeLabel = EVENT_TYPE_LABELS[event.type] || event.type;

  return {
    subject: `⏰ Υπενθύμιση: "${event.title}" ${reminderLabel !== 'Ξεκινά τώρα' ? `σε ${reminderLabel}` : '— Ξεκινά τώρα!'}`,
    html: `
    <!DOCTYPE html>
    <html lang="el">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            
            <tr>
              <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 40px;text-align:center;">
                <div style="font-size:36px;margin-bottom:8px;">📅</div>
                <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Υπενθύμιση Γεγονότος</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">ThesisFlow — Σύστημα Διαχείρισης Διπλωματικών</p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 40px;">
                <p style="color:#374151;font-size:16px;margin:0 0 24px;">
                  Γεια σου <strong>${studentName}</strong>,
                </p>
                <p style="color:#6b7280;font-size:15px;margin:0 0 28px;">
                  ${reminderLabel === 'Ξεκινά τώρα'
                    ? 'Το παρακάτω γεγονός <strong>ξεκινά τώρα</strong>!'
                    : `Σε <strong>${reminderLabel}</strong> ξεκινά το παρακάτω γεγονός:`}
                </p>

                <div style="background:#f8f9ff;border-left:4px solid #667eea;border-radius:8px;padding:24px;margin-bottom:28px;">
                  <h2 style="color:#1f2937;margin:0 0 16px;font-size:20px;">${event.title}</h2>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Τύπος</span><br>
                        <span style="color:#374151;font-size:15px;font-weight:600;">${typeLabel}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Ημερομηνία</span><br>
                        <span style="color:#374151;font-size:15px;font-weight:600;">${formattedDate}${timeStr}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Διπλωματική</span><br>
                        <span style="color:#374151;font-size:15px;font-weight:600;">${dissertationTitle}</span>
                      </td>
                    </tr>
                    ${event.description ? `
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Σημείωση</span><br>
                        <span style="color:#374151;font-size:15px;">${event.description}</span>
                      </td>
                    </tr>` : ''}
                  </table>
                </div>

                <div style="text-align:center;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/calendar"
                     style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                    Άνοιγμα Ημερολογίου
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  ThesisFlow • Αυτόματη ειδοποίηση — παρακαλώ μην απαντάτε σε αυτό το email
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`
  };
};

const sendReminderEmail = async (toEmail, studentName, event, dissertationTitle) => {
  const reminderLabel = REMINDER_LABELS[event.reminderType] || '';
  const { subject, html } = buildReminderEmail(studentName, event, dissertationTitle, reminderLabel);

  await transporter.sendMail({
    from: `"ThesisFlow" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html
  });
};

module.exports = { sendReminderEmail };