const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');

const ownerNumber = ['94763038132'];

//=================== SESSION-AUTH ============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');

    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);

    filer.download((err, data) => {
        if (err) {
            console.error("Failed to download session:", err);
            return;
        }
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, (err) => {
            if (err) console.error("Error saving session:", err);
            else console.log("Session downloaded ✅");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//=============================================

async function connectToWA() {
    const connectDB = require('./libs/mongodb'); // Fixed incorrect path
    connectDB(); // Correct function call

    const { readEnv } = require('./libs/database'); // Fixed incorrect path
    const config = await readEnv();
    const prefix = config.PREFIX;

    console.log("Nizzu ID Connecting... ⏳...");

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"), // Fixed "Chorme" typo
        syncFullHistory: true,
        auth: state,
        version
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('Installing... 🔧⏳');

            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === ".js") {
                    require("./plugins/" + plugin);
                }
            });

            console.log('🔌 Plugins installed successfully 🎉🚀');
            console.log('Nizzu ID Connected To WhatsApp 🚀');

            let up = `Nizzu ID connected successful ✅\n\nPREFIX: ${prefix}`;

            conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
                image: { url: "https://i.ibb.co/9mB3S8Wm/Anime.jpg" }, // Fixed incorrect URL formatting
                caption: up
            });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;
        mek.message = getContentType(mek.message) === 'ephemeralMessage' 
            ? mek.message.ephemeralMessage.message 
            : mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
            await conn.readMessages([mek.key]);
        }

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation 
            : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text 
            : (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption 
            : (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption 
            : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const from = mek.key.remoteJid;
        const sender = mek.key.fromMe 
            ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) 
            : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const isOwner = ownerNumber.includes(senderNumber) || conn.user.id.includes(senderNumber);
        const reply = (teks) => conn.sendMessage(from, { text: teks }, { quoted: mek });

        if (!isOwner && config.MODE === "private") return;
        if (!isOwner && isGroup && config.MODE === "inbox") return;
        if (!isOwner && !isGroup && config.MODE === "groups") return;

        const events = require('./command');
        const cmd = events.commands.find((cmd) => cmd.pattern === command) || 
                    events.commands.find((cmd) => cmd.alias && cmd.alias.includes(command));

        if (isCmd && cmd) {
            if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

            try {
                cmd.function(conn, mek, m, {
                    from, body, isCmd, command, args, q, sender, senderNumber, isOwner, reply
                });
            } catch (e) {
                console.error("[PLUGIN ERROR] " + e);
                reply("⚠️ An error occurred while processing the command.");
            }
        }
    });
}

// Express Server for Nizzu ID status
app.get("/", (req, res) => {
    res.send("Nizzu ID 🔥 Wha-Bot 🚀 Running ✅");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

setTimeout(() => {
    connectToWA();
}, 4000);
