
const fs = require('fs');
const https = require('https');
require('dotenv').config();
// try loading local env
try {
    const envConfig = require('dotenv').parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) { }

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    fs.writeFileSync('models_output.txt', 'ERROR: No API Key found');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                const names = json.models.map(m => m.name.replace('models/', ''));
                fs.writeFileSync('models_output.txt', names.join('\n'));
            } else {
                fs.writeFileSync('models_output.txt', 'ERROR: ' + JSON.stringify(json));
            }
        } catch (e) {
            fs.writeFileSync('models_output.txt', 'ERROR parsing: ' + e.message + '\nData: ' + data);
        }
    });
}).on('error', (e) => {
    fs.writeFileSync('models_output.txt', 'ERROR request: ' + e.message);
});
