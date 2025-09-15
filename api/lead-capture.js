export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, budget, location, propertyType, timeline, isSeller, consent } = req.body;

  if (!consent) return res.status(400).json({ error: "Consent required" });

  try {
    // Log the lead (no email, no reCAPTCHA)
    console.log("Lead captured:", { name, email, phone, budget, location, propertyType, timeline, isSeller });

    return res.status(200).json({ success: true, message: "Lead captured successfully (no emails sent)" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to capture lead" });
  }
}
