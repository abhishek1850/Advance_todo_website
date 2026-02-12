
const https = require('https');
const fs = require('fs');
const path = require('path');

const colors = { reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", bold: "\x1b[1m" };

console.log(`\n${colors.bold}🔍 AI Connectivity Test${colors.reset}\n`);

try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.*)/);

    if (!match || !match[1]) {
        throw new Error("Key not found in .env");
    }

    const key = match[1].trim();
    console.log(`🔑 Key: ${colors.yellow}${key.substring(0, 8)}...${key.substring(key.length - 4)}${colors.reset}`);

    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

    let pending = models.length;

    models.forEach(model => {
        const data = JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] });
        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ ${colors.green}${model}: OK${colors.reset}`);
                } else {
                    console.log(`❌ ${colors.red}${model}: HTTP ${res.statusCode}${colors.reset}`);
                    if (res.statusCode === 404) console.log(`   (Model not enabled for this API key)`);
                }
                pending--;
            });
        });
        req.on('error', e => {
            console.log(`❌ ${model}: Error ${e.message}`);
            pending--;
        });
        req.write(data);
        req.end();
    });

} catch (e) {
    console.error(`❌ Error: ${e.message}`);
}
