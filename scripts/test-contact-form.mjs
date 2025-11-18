#!/usr/bin/env node
/**
 * Test the contact form API endpoint directly
 * Run with: node --env-file=.env.local scripts/test-contact-form.mjs
 */

async function testContactForm() {
  console.log("🔍 Testing Contact Form API Endpoint...\n");

  // Test data
  const formData = {
    name: "Test User",
    email: "test@example.com",
    company: "Test Company",
    message: "This is a test message from the contact form test script.",
    token: "dummy-token-for-testing", // This will fail Turnstile but we can see the error
  };

  console.log("📤 Submitting to /api/contact...\n");
  console.log("Form data:", JSON.stringify(formData, null, 2));
  console.log("");

  try {
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("\n❌ Request failed!");

      if (result.message?.includes("Turnstile")) {
        console.log(
          "\n✅ Good! Turnstile validation is working (expected to fail with dummy token)"
        );
        console.log(
          "💡 This means the endpoint is reachable and working correctly."
        );
        console.log(
          "   The actual contact form with real Turnstile token should work."
        );
      }
    } else {
      console.log("\n✅ Contact form submission successful!");
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    console.error("\n💡 Possible issues:");
    console.error("   - Dev server is not running on localhost:3000");
    console.error("   - Run: npm run dev");
    process.exit(1);
  }
}

testContactForm();
