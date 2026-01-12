const http = require('http');

const data = JSON.stringify({
    secretKey: 'viva-master-key-2025'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin-bypass',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Testing Admin Bypass Endpoint...");
const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', d => {
        process.stdout.write("BODY: " + d);
    });
});

req.on('error', error => {
    console.error("ERROR:", error.message);
});

req.write(data);
req.end();
