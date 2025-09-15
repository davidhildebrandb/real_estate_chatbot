export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, budget, location, propertyType, timeline, isSeller, consent, token } = req.body;

  // reCAPTCHA validation
  if (!token) return res.status(400).json({ error: "reCAPTCHA token missing" });

  try {
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    });

    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success) return res.status(400).json({ error: "reCAPTCHA validation failed" });

    if (!consent) return res.status(400).json({ error: "Consent required" });

    // Instead of sending emails, just log lead for now
    console.log("Lead captured:", { name, email, phone, budget, location, propertyType, timeline, isSeller });
