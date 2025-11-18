#!/usr/bin/env node
/**
 * Test script to verify Resend email functionality
 * Run with: node --env-file=.env.local scripts/test-email.mjs
 */

async function testEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "contact@scanminers.com";
  const to = process.env.RESEND_TO || "founders@scanminers.com";

  console.log("🔍 Testing Resend Email API...\n");
  console.log("Configuration:");
  console.log(
    `  API Key: ${apiKey ? apiKey.substring(0, 10) + "..." : "❌ NOT SET"}`
  );
  console.log(`  From: ${from}`);
  console.log(`  To: ${to}`);
  console.log("");

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not set in .env.local");
    process.exit(1);
  }

  const emailData = {
    from,
    to: to.includes(",") ? to.split(",").map((s) => s.trim()) : to,
    subject: "Test Email from Scanminers Website",
    html: `
      <!doctype html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email sent from the Scanminers website email testing script.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            If you received this email, the Resend integration is working correctly.
          </p>
        </body>
      </html>
    `,
  };

  console.log("📤 Sending test email...\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Email send failed!");
      console.error("Status:", response.status);
      console.error("Response:", JSON.stringify(result, null, 2));

      if (response.status === 403) {
        console.error("\n💡 Possible issues:");
        console.error("   - API key is invalid or expired");
        console.error("   - API key doesn't have permission to send emails");
        console.error(
          "   - Check your Resend dashboard: https://resend.com/api-keys"
        );
      } else if (response.status === 422) {
        console.error("\n💡 Possible issues:");
        console.error("   - 'From' email domain is not verified in Resend");
        console.error("   - Verify your domain at: https://resend.com/domains");
        console.error(`   - Current 'from' address: ${from}`);
      }

      process.exit(1);
    }

    console.log("✅ Email sent successfully!");
    console.log("Email ID:", result.id);
    console.log("\n📧 Check your inbox at:", to);
    console.log("\n💡 View email status in Resend dashboard:");
    console.log(`   https://resend.com/emails/${result.id}`);
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    console.error("\n💡 Possible issues:");
    console.error("   - Network connectivity problem");
    console.error("   - Resend API is down");
    process.exit(1);
  }
}

testEmail();
