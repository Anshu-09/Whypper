// 1. IMPORTS & INITIAL SETUP
// =================================================================
import 'dotenv/config'; // Loads environment variables from .env file
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid'; // For creating unique job IDs

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;


// =================================================================
// 2. MIDDLEWARE
// =================================================================
app.use(express.json()); // To parse JSON bodies from incoming requests
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files from the React build


// =================================================================
// 3. APPLICATION LOGIC (BACKGROUND JOBS)
// =================================================================

// In-memory "database" to store job statuses.
// In a real production app, you would use a proper database like Redis or PostgreSQL.
const jobs = {};

/**
 * A helper function to safely parse JSON from the model's response.
 * This function looks for the first '{' and the last '}' to extract the JSON object,
 * which helps clean up extra text like "Here is your JSON:" or markdown code blocks.
 * @param {string} text - The raw text response from the LLM.
 * @returns {object} The parsed JSON object.
 */
function parseJsonFromModelResponse(text) {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
        throw new Error("Could not find a JSON object in the model's response.");
    }

    let jsonString = text.substring(startIndex, endIndex + 1);
    
    // Decode HTML entities and clean the string
    const cleanedString = jsonString
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
    
    try {
        return JSON.parse(cleanedString);
    } catch (e) {
        console.error("Failed to parse JSON:", e.message);
        console.log("--- Failed JSON String ---");
        console.log(cleanedString.substring(0, 500) + '...');
        console.log("-------------------------");
        throw new Error("JSON parsing failed. Check server logs.");
    }
}


/**
 * The main worker function that calls the Gemini API in the background.
 * @param {string} jobId - The unique ID for the job.
 * @param {string} userTopics - The topics provided by the user.
 */
const runGeneration = async (jobId, userTopics, language) => {
    try {
        console.log(`[Job ${jobId}] Starting Gemini API call for topics: "${userTopics}"`);
        
        // ==============================================================================
        // !!! IMPORTANT !!!
        // Replace 'gemini-1.5-pro-latest' with the model name that your `checkModels.js`
        // script showed was available for your API key.
        // ==============================================================================
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{
                parts: [{
                    text: `Act as an expert technical interviewer. Based on the following topics: ${userTopics} and programming language: ${language} selected by the user is the programming syntax he/she prefers to solve the questions on, generate a structured JSON response.

The response must contain three sections: "Medium", "Hard", and "Ultra Hard". Each section must be an array of objects with these properties:
- "type": "MCQ", "Code Snippet", or "DSA"
- "text": the question text
- "options": array of 4 options (only for MCQ type)
- "answer": correct answer (option letter A/B/C/D for MCQ, or text answer for others)

For MCQ: provide 4 options labeled A, B, C, D. For Code Snippet/DSA: provide the expected answer or solution approach.

Ensure there are 2 questions of each type for each difficulty level. Use ${language} syntax for code questions.

Return only the JSON object, no other text.`
                }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // Correctly handle the response body to avoid the "body already read" error
        if (!response.ok) {
            const errorData = await response.json(); // Read the body ONCE for the error
            console.error(`[Job ${jobId}] API Error received:`, errorData);
            jobs[jobId].status = 'failed';
            return; // Stop the function here
        }

        const result = await response.json(); // Read the body ONCE for the success case

        // ==============================================================================
        // THIS IS THE CRITICAL DEBUGGING STEP: Log the raw text from the model
        // ==============================================================================
        const generatedText = result.candidates[0].content.parts[0].text;
        console.log("\n--- RAW RESPONSE FROM GEMINI ---");
        console.log(generatedText);
        console.log("---------------------------------\n");

        // Use the robust parsing function to handle potential extra text from the model
        const parsedResult = parseJsonFromModelResponse(generatedText);

        jobs[jobId].status = 'completed';
        jobs[jobId].result = parsedResult;
        console.log(`[Job ${jobId}] Completed and parsed successfully.`);

    } catch (error) {
        // This will catch errors from the fetch call itself or from the JSON.parse step
        console.error(`[Job ${jobId}] Failed during generation or parsing:`, error);
        jobs[jobId].status = 'failed';
    }
};


// =================================================================
// 4. API ENDPOINTS
// =================================================================

// Endpoint to START a generation job
app.post('/api/generate', (req, res) => {
    const userTopics = req.body.prompt;
    const language = req.body.language || 'JavaScript';
    if (!userTopics) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const jobId = uuidv4();
    jobs[jobId] = { status: 'pending', topics: userTopics, language: language, result: null };

    // Immediately respond to the user with the job ID
    res.status(202).json({ jobId: jobId });

    // Start the long-running task in the background
    runGeneration(jobId, userTopics, language); 
});

// Endpoint to CHECK the status of a job
app.get('/api/status/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const job = jobs[jobId];

    if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({
        status: job.status,
        result: job.result
    });
});


// =================================================================
// 5. SERVE FRONTEND & START SERVER
// =================================================================

// For any other requests, serve the main index.html file to handle client-side routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});