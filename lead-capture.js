import nodemailer from "nodemailer";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, budget, location, propertyType, timeline, isSeller, consent, token } = req.body;

  // reCAPTCHA validation
  if (!token) return res.status(400).json({ error: "reCAPTCHA token missing" });

  const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
  });

  const recaptchaData = await recaptchaResponse.json();
  if (!recaptchaData.success) return res.status(400).json({ error: "reCAPTCHA validation failed" });

  // Consent check
  if (!consent) return res.status(400).json({ error: "Consent required" });

  try {
    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.FROM_ADDRESS || process.env.SMTP_USER,
      to: `${process.env.HEAD_REALTOR_EMAIL}, ${process.env.IXACT_EMAIL}`,
      subject: "New Lead from Website Chatbot",
      text: `
New lead details:

Name: ${name}
Email: ${email}
Phone: ${phone}
Budget: ${budget}
Location: ${location}
Property Type: ${propertyType}
Timeline: ${timeline}
Interested in Selling?: ${isSeller ? "Yes" : "No"}
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Lead submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
