
import http from 'http';

const data = JSON.stringify({
    transcript: "Gasté 5 dólares en comida"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/ai/parse',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
