const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Cloud Function to handle OpenAI API calls securely
exports.chatWithAI = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated (required for security)
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  // Validate input
  if (!data.message || typeof data.message !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Message is required and must be a string");
  }

  // Rate limiting: Check if user has made too many requests
  const userId = context.auth.uid;
  const userRequests = await getUserRequestCount(userId);

  if (userRequests > 10) { // Limit to 10 requests per user
    throw new functions.https.HttpsError("resource-exhausted", "Rate limit exceeded. Please wait before making more requests.");
  }

  try {
    // Make the API call to OpenAI (API key is secure on server)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${functions.config().openai.key}` // Secure!
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant. Keep responses concise and friendly."
          },
          {
            role: "user",
            content: data.message
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const apiMessage = (errorData && errorData.error && errorData.error.message)
        ? errorData.error.message
        : response.statusText;
      throw new Error(`OpenAI API error: ${apiMessage}`);
    }

    const result = await response.json();

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error("Unexpected API response structure");
    }

    // Log the request for monitoring
    await logUserRequest(userId, data.message, result.choices[0].message.content);

    // Return the AI response
    return {
      success: true,
      response: result.choices[0].message.content,
      usage: result.usage
    };

  } catch (error) {
    console.error("Error in chatWithAI function:", error);
    throw new functions.https.HttpsError("internal", "Failed to get AI response: " + error.message);
  }
});

// Helper function to track user requests (simplified version)
async function getUserRequestCount(userId) {
  // In a real application, you"d store this in Firestore
  // For this tutorial, we"ll return a simple count
  return 0; // Always allow requests for demo
}

// Helper function to log user requests (simplified version)
async function logUserRequest(userId, userMessage, aiResponse) {
  // In a real application, you"d log this to Firestore
  console.log(`User ${userId} requested: "${userMessage}" and got response: "${aiResponse}"`);
}