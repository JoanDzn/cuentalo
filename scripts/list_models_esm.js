
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();
// try loading .env.local
try {
    const envLocal = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    const parsed = dotenv.parse(envLocal);
    for (const k in parsed) {
        process.env[k] = parsed[k];
    }
} catch (e) { }

const apiKey = process.env.GEMINI_API_KEY;
console.log("Checking models with key ending in...", apiKey ? apiKey.slice(-5) : "NONE");

if (!apiKey) {
    console.error("No API key found!");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(rawData);
            if (parsed.models) {
                console.log("--- START MODELS ---");
                parsed.models.forEach(m => console.log(m.name.replace('models/', '')));
                console.log("--- END MODELS ---");
            } else {
                console.error("Error from API:", JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
