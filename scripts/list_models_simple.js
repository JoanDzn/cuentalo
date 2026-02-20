
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            console.error(JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log("--- START MODELS ---");
            data.models.forEach(m => console.log(m.name.replace('models/', '')));
            console.log("--- END MODELS ---");
        } else {
            console.log("No models found or unexpected response", data);
        }
    })
    .catch(e => console.error(e));
