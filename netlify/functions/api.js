// netlify/functions/chat.js

// Import necessary modules
const express = require('express');
const serverless = require('serverless-http'); // For running Express app as a serverless function
const cors = require('cors'); // For Cross-Origin Resource Sharing

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies from incoming requests.
// This is crucial for accessing req.body.message.
app.use(express.json());

// Enable CORS for all origins.
// This allows your frontend (even if hosted on a different domain) to make requests
// to your Netlify Function without running into browser security errors.
// In a production environment, you might want to restrict this to specific origins
// (e.g., your frontend's deployed URL) for enhanced security:
// app.use(cors({ origin: 'https://your-frontend-domain.netlify.app' }));
app.use(cors());

/**
 * API Endpoint: POST /.netlify/functions/chat
 * Accessible via /api/chat due to Netlify redirects.
 *
 * Purpose: Receives a user message and returns a bot response based on predefined logic.
 *
 * Request Body (JSON):
 * {
 *   "message": "User's input string"
 * }
 *
 * Response (JSON):
 * Success (200 OK):
 * {
 *   "botResponse": "Bot's reply string",
 *   "timestamp": "ISO 8601 timestamp string"
 * }
 * Error (400 Bad Request):
 * {
 *   "error": "Error message string"
 * }
 */
app.post('/', (req, res) => {
    // Log the incoming request for debugging purposes.
    console.log('Received POST request to /chat');
    console.log('Request Body:', req.body);

    // 1. Request Validation: Check if the 'message' parameter is present and valid.
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
        // If 'message' is missing, not a string, or empty, return a 400 Bad Request error.
        console.error('Validation Error: Message parameter is required and must be a non-empty string.');
        return res.status(400).json({
            error: 'Message parameter is required and must be a non-empty string.'
        });
    }

    // 2. Bot Logic: Determine the bot's response based on the user's message.
    let botResponse;
    const lowerCaseMessage = userMessage.toLowerCase().trim();

    if (lowerCaseMessage === 'hello') {
        botResponse = 'Hi there!';
    } else if (lowerCaseMessage === 'how are you?') {
        botResponse = "I'm just a bot, but I'm doing great!";
    } else {
        // Default behavior: Echo the user's message back.
        botResponse = `You said: ${userMessage}`;
    }

    // 3. Construct and Send Response.
    const timestamp = new Date().toISOString(); // Generate an ISO 8601 timestamp for the response.

    console.log(`User message: "${userMessage}"`);
    console.log(`Bot response: "${botResponse}"`);

    // Send a 200 OK status with the JSON response.
    res.status(200).json({
        botResponse: botResponse,
        timestamp: timestamp
    });
});

// General Error Handling Middleware for Express.
// This catches any unhandled errors that occur during request processing.
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    // Return a 500 Internal Server Error for unexpected issues.
    // In a production environment, avoid sending `err.message` directly for security reasons.
    res.status(500).json({
        error: 'An unexpected server error occurred.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined // Show details only in dev
    });
});

// Export the Express app wrapped by serverless-http.
// This is the standard way to expose an Express application as a Netlify Function.
// Netlify will call this `handler` function when the API endpoint is hit.
exports.handler = serverless(app);