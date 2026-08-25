const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// --- Configuration ---
const BASE_URL = 'https://whatsapp-api-production-8261.up.railway.app';
const API_KEY = 'e45f8sigjom6wb950c1xq8st52y85sax'; // Using key from .env file
const INSTANCE = 'John Personal';
const TARGET_NUMBER = '573181547440';
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'webhook-logs.json');

const headers = {
    'apikey': API_KEY,
    'Content-Type': 'application/json'
};

const mediaUrls = {
    image: 'https://drive.google.com/uc?export=download&id=1YCnT3ZP-L0M2ZAjiD1H0VimyXduJGatN',
    document: 'https://drive.google.com/uc?export=download&id=1xAD7Ghra7A_TiWkXct3YNeri0hiOyTLF',
    audio: 'https://drive.google.com/uc?export=download&id=1lsCPA3tB1QLOWBH-jwMnFiolJ_6DhMSG',
    video: 'https://drive.google.com/uc?export=download&id=1iLwSUnkbsA1npthQYxIzqEUxrVGRw9Vu',
    sticker: 'https://drive.google.com/uc?export=download&id=1sxP-27OuBbA-YvjuzYJQb3VGewlqQOYw'
};

// Helper to convert Google Drive URL to Base64 (more reliable for Railway)
async function getBase64Media(url) {
    try {
        console.log(`[DOWNLOAD] Fetching ${url}`);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (e) {
        console.error(`[DOWNLOAD ERROR] Failed to fetch media: ${e.message}`);
        return url; // fallback to URL
    }
}

const app = express();
app.use(express.json({ limit: '50mb' }));

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const eventData = req.body;
    console.log(`\n\x1b[36m[WEBHOOK RECEIVED]\x1b[0m Event: ${eventData.event || 'UNKNOWN'}`);
    
    try {
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            const raw = fs.readFileSync(LOG_FILE, 'utf-8');
            logs = JSON.parse(raw);
        }
        
        logs.unshift({
            timestamp: new Date().toISOString(),
            data: eventData
        });
        
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
        console.log(`\x1b[32m[LOGGED]\x1b[0m Webhook data appended to ${LOG_FILE}`);
    } catch (e) {
        console.error('\x1b[31m[ERROR]\x1b[0m Failed to save webhook log:', e.message);
    }
    
    res.status(200).send('OK');
});

// Setup function
async function setupTest() {
    // 1. Start Server
    const server = app.listen(PORT, () => {
        console.log(`\x1b[33m[SERVER]\x1b[0m Local server listening on port ${PORT}`);
    });

    // 2. Start Tunnel via NPX
    console.log('\x1b[33m[TUNNEL]\x1b[0m Starting localtunnel via npx...');
    const tunnelProcess = spawn('npx', ['localtunnel', '--port', PORT.toString()]);
    
    let webhookUrl = '';

    await new Promise((resolve, reject) => {
        tunnelProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[TUNNEL] ${output.trim()}`);
            if (output.includes('your url is:')) {
                webhookUrl = output.split('your url is:')[1].trim() + '/webhook';
                resolve();
            }
        });
        
        tunnelProcess.stderr.on('data', (data) => {
            console.error(`[TUNNEL ERROR] ${data.toString().trim()}`);
        });

        tunnelProcess.on('close', (code) => {
            console.log(`[TUNNEL] Process exited with code ${code}`);
            reject(new Error('Tunnel closed prematurely'));
        });
    });

    console.log(`\x1b[32m[TUNNEL SUCCESS]\x1b[0m Public URL: ${webhookUrl}`);

    // 3. Set Webhook in Evolution API
    try {
        console.log(`\x1b[33m[API]\x1b[0m Configuring webhook for instance "${INSTANCE}"...`);
        const webhookPayload = {
            webhook: {
                url: webhookUrl,
                enabled: true,
                byEvents: false,
                base64: false,
                events: [
                    "APPLICATION_STARTUP",
                    "QRCODE_UPDATED",
                    "MESSAGES_SET",
                    "MESSAGES_UPSERT",
                    "MESSAGES_EDITED",
                    "MESSAGES_UPDATE",
                    "MESSAGES_DELETE",
                    "SEND_MESSAGE",
                    "SEND_MESSAGE_UPDATE",
                    "CONTACTS_SET",
                    "CONTACTS_UPSERT",
                    "CONTACTS_UPDATE",
                    "PRESENCE_UPDATE",
                    "CHATS_SET",
                    "CHATS_UPSERT",
                    "CHATS_UPDATE",
                    "CHATS_DELETE",
                    "GROUPS_UPSERT",
                    "GROUP_UPDATE",
                    "GROUP_PARTICIPANTS_UPDATE",
                    "CONNECTION_UPDATE",
                    "LABELS_EDIT",
                    "LABELS_ASSOCIATION",
                    "CALL"
                ]
            }
        };

        const response = await axios.post(`${BASE_URL}/webhook/set/${INSTANCE}`, webhookPayload, { headers });
        console.log(`\x1b[32m[API SUCCESS]\x1b[0m Webhook configured successfully!`);
        
    } catch (error) {
        console.error(`\x1b[31m[API ERROR]\x1b[0m Failed to set webhook:`, error.response?.data || error.message);
        process.exit(1);
    }

    fs.writeFileSync(LOG_FILE, JSON.stringify([]));

    // 4. Run automated tests
    // await runTests(); // Skipped for this listener-only run

    console.log(`\n\x1b[35m=========================================================\x1b[0m`);
    console.log(`\x1b[35m[INTERACTIVE MODE]\x1b[0m The server is now listening for events.`);
    console.log(`\x1b[35m[INTERACTIVE MODE]\x1b[0m You can now test manually from your phone.`);
    console.log(`Every event will be saved to ${LOG_FILE}`);
    console.log(`Press Ctrl+C to exit.`);
    console.log(`\x1b[35m=========================================================\x1b[0m\n`);
}

async function sendApiRequest(endpoint, payload, typeName) {
    try {
        console.log(`\x1b[33m[TEST]\x1b[0m Sending ${typeName}...`);
        const url = `${BASE_URL}${endpoint}`;
        await axios.post(url, payload, { headers });
        console.log(`\x1b[32m[TEST SUCCESS]\x1b[0m Sent ${typeName}`);
    } catch (error) {
        console.error(`\x1b[31m[TEST ERROR]\x1b[0m Failed to send ${typeName}:`, error.response?.data || error.message);
    }
}

async function runTests() {
    console.log(`\n\x1b[34m--- STARTING AUTOMATED MESSAGE TESTS ---\x1b[0m\n`);

    await sendApiRequest(`/message/sendText/${INSTANCE}`, {
        number: TARGET_NUMBER,
        text: "🧪 *Automated Test* \nThis is a test text message from the webhook flow script."
    }, 'Text');

    console.log(`\n\x1b[36m[DOWNLOADS]\x1b[0m Preparing media...`);
    const imageB64 = await getBase64Media(mediaUrls.image, 'image/jpeg');
    const docB64 = await getBase64Media(mediaUrls.document, 'application/pdf');
    const audioB64 = await getBase64Media(mediaUrls.audio, 'audio/mp3');
    const videoB64 = await getBase64Media(mediaUrls.video, 'video/mp4');
    const stickerB64 = await getBase64Media(mediaUrls.sticker, 'image/webp');

    await sendApiRequest(`/message/sendMedia/${INSTANCE}`, {
        number: TARGET_NUMBER,
        mediatype: "image",
        media: imageB64,
        caption: "🧪 *Automated Test* Image"
    }, 'Image');

    await sendApiRequest(`/message/sendMedia/${INSTANCE}`, {
        number: TARGET_NUMBER,
        mediatype: "document",
        media: docB64,
        fileName: "test-document.pdf",
        mimetype: "application/pdf",
        caption: "🧪 *Automated Test* Document"
    }, 'Document');

    await sendApiRequest(`/message/sendWhatsAppAudio/${INSTANCE}`, {
        number: TARGET_NUMBER,
        audio: audioB64
    }, 'Audio');

    await sendApiRequest(`/message/sendMedia/${INSTANCE}`, {
        number: TARGET_NUMBER,
        mediatype: "video",
        media: videoB64,
        caption: "🧪 *Automated Test* Video"
    }, 'Video');

    await sendApiRequest(`/message/sendSticker/${INSTANCE}`, {
        number: TARGET_NUMBER,
        sticker: stickerB64
    }, 'Sticker');

    console.log(`\n\x1b[34m--- AUTOMATED MESSAGE TESTS COMPLETED ---\x1b[0m`);
}

setupTest();
