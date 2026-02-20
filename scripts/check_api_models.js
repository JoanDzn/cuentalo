
const http = require('http');

http.get('http://localhost:3001/api/ai/models', (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        try {
            const models = JSON.parse(data);
            console.log("AVAILABLE MODELS:");
            if (Array.isArray(models)) {
                models.forEach(m => console.log(`- ${m}`));
            } else {
                console.log(JSON.stringify(models, null, 2));
            }
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
            console.log("Raw Data:", data);
        }
    });
}).on('error', (e) => console.error(e));
