import https from 'https';

const key = 'AIzaSyAdjpA8Aq-jauu5idCNNQiSDTwrCZcH8S4';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("ALL MODELS:");
                json.models.forEach(m => {
                    console.log(`- ${m.name} [${m.supportedGenerationMethods.join(',')}]`);
                });
            } else {
                console.log("No models found or error:", data);
            }
        } catch (e) {
            console.log("Response was not JSON:", data);
        }
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
