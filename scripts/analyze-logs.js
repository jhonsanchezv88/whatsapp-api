const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'webhook-logs.json');

if (!fs.existsSync(logFile)) {
    console.error('Log file not found.');
    process.exit(1);
}

const logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));

console.log(`Total webhook events captured: ${logs.length}`);

const eventCounts = {};
const messageTypes = {};
const anomalies = [];

logs.forEach((log, index) => {
    const eventData = log.data;
    const eventName = eventData.event || 'UNKNOWN';
    
    eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;

    if (eventName === 'messages.upsert' || eventName === 'messages.update' || eventName === 'send.message') {
        let msgObj;
        
        // Find the message object depending on event structure
        if (eventData.data?.message) {
            msgObj = eventData.data.message;
        } else if (eventData.data?.messages && eventData.data.messages.length > 0) {
            msgObj = eventData.data.messages[0].message;
        }
        
        if (msgObj) {
            // Get the key of the message object (e.g. imageMessage, videoMessage, etc)
            const type = Object.keys(msgObj).find(k => k !== 'messageContextInfo' && k !== 'senderKeyDistributionMessage') || 'unknown';
            messageTypes[type] = (messageTypes[type] || 0) + 1;

            // Check for mediaUrl if it's a media message
            if (['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage'].includes(type)) {
                // Evolution API injects mediaUrl if S3 is enabled
                const mediaNode = msgObj[type];
                if (!eventData.data?.messages?.[0]?.message?.mediaUrl && !eventData.data?.mediaUrl) {
                    // Sometimes Evolution puts it at root or inside message, let's just log if it has a URL anywhere
                    const hasUrlStr = JSON.stringify(msgObj).includes('http');
                    if (!hasUrlStr) {
                         anomalies.push(`Log[${index}] ${eventName} (${type}) missing URL/mediaUrl string.`);
                    }
                }
            }
        }
    }
});

console.log('\n--- Event Types ---');
Object.entries(eventCounts).forEach(([k, v]) => console.log(`${k}: ${v}`));

console.log('\n--- Message Types Found ---');
Object.entries(messageTypes).forEach(([k, v]) => console.log(`${k}: ${v}`));

console.log('\n--- Anomalies / Issues ---');
if (anomalies.length === 0) {
    console.log('No anomalies found! Media seems to be processing correctly.');
} else {
    anomalies.forEach(a => console.log(a));
}
