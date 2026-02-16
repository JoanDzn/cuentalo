import https from 'https';
import fs from 'fs';

const key = 'AIzaSyAdjpA8Aq-jauu5idCNNQiSDTwrCZcH8S4';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('models_list.txt', data);
        console.log("Written to models_list.txt");
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
