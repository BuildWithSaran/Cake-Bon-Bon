// ✅ CommonJS syntax — required for Vercel Node.js serverless functions
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {

  // CORS headers — allow your Vercel domain to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body (Vercel parses JSON automatically)
  const { name, email, phone, eventType, message } = req.body;

  // Server-side validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Create Gmail transporter
  // Set GMAIL_USER = saranbvocsdsa@gmail.com in Vercel Environment Variables
  // Set GMAIL_PASS = your 16-char App Password (no spaces) in Vercel Environment Variables
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // ── Email 1: Sent TO you (bakery owner notification) ──
  const ownerMail = {
    from: `"Cake Bon Bon Website" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email || process.env.GMAIL_USER,
    subject: `🎂 New Enquiry from ${name} — ${eventType || 'General'}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8d5c0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#D97706,#F59E0B);padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">🎂 New Customer Enquiry</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Cake Bon Bon — Contact Form Submission</p>
        </div>
        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;color:#78614F;font-size:13px;width:140px;">👤 Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;font-weight:600;color:#1C1309;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;color:#78614F;font-size:13px;">📞 Phone</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;font-weight:600;color:#1C1309;">${phone}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;color:#78614F;font-size:13px;">📧 Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;color:#1C1309;">${email || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;color:#78614F;font-size:13px;">🎉 Event</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3e8d8;color:#D97706;font-weight:600;">${eventType || 'General Enquiry'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#78614F;font-size:13px;vertical-align:top;">💬 Message</td>
              <td style="padding:10px 0;color:#1C1309;line-height:1.6;">${message}</td>
            </tr>
          </table>
          <div style="margin-top:24px;">
            <a href="tel:${phone}" style="background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;margin-right:12px;">📞 Call Back</a>
            <a href="https://wa.me/91${phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20contacting%20Cake%20Bon%20Bon!" style="background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">💬 WhatsApp</a>
          </div>
        </div>
        <div style="background:#fffbf5;padding:16px 32px;border-top:1px solid #f3e8d8;font-size:12px;color:#a8927e;">
          Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </div>
    `,
  };

  // ── Email 2: Auto-reply TO the customer ──
  const customerMail = {
    from: `"Cake Bon Bon 🎂" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Thank you ${name}! We received your enquiry 🎂`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8d5c0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#D97706,#F59E0B);padding:28px 32px;text-align:center;">
          <div style="font-size:48px;">🎂</div>
          <h1 style="color:#fff;margin:8px 0 4px;font-size:22px;">Thank You, ${name}!</h1>
          <p style="color:rgba(255,255,255,0.9);margin:0;font-size:14px;">We have received your message</p>
        </div>
        <div style="padding:28px 32px;text-align:center;">
          <p style="color:#4A3728;font-size:15px;line-height:1.7;">Our team will get back to you within <strong>2 hours</strong> during business hours (6 AM – 10 PM).</p>
          <div style="background:#fffbf5;border:1px solid #e8d5c0;border-radius:10px;padding:20px;margin:20px 0;text-align:left;">
            <p style="margin:0 0 8px;font-weight:600;color:#D97706;font-size:13px;">YOUR ENQUIRY SUMMARY</p>
            <p style="margin:4px 0;font-size:13px;color:#4A3728;"><strong>Event:</strong> ${eventType || 'General Enquiry'}</p>
            <p style="margin:4px 0;font-size:13px;color:#4A3728;"><strong>Message:</strong> ${message}</p>
          </div>
          <a href="tel:08072340500" style="background:#D97706;color:#fff;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;margin-top:8px;">📞 Call Us: 08072340500</a>
        </div>
        <div style="background:#fffbf5;padding:16px 32px;border-top:1px solid #f3e8d8;text-align:center;font-size:12px;color:#a8927e;">
          No.105 GH Road-17 LM, Near Chinthamani, Puthur, Tiruchirappalli • Open Daily 6 AM – 10 PM
        </div>
      </div>
    `,
  };

  try {
    // Always send owner notification
    await transporter.sendMail(ownerMail);

    // Only send auto-reply if customer gave their email
    if (email && email.includes('@')) {
      await transporter.sendMail(customerMail);
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent! We will call you back soon.',
    });

  } catch (error) {
    console.error('Nodemailer error:', error.message);
    return res.status(500).json({
      error: 'Failed to send message. Please call us directly at 08072340500.',
    });
  }
};
