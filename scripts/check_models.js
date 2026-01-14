
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("Error: API Key not found in environment.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(model => {
                console.log(`- ${model.name}`);
            });
        } else {
            console.error("Error fetching models:", data);
        }
    })
    .catch(error => console.error("Fetch error:", error));
