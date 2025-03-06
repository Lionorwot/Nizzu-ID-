const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");

// Function to format uptime
const runtime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

cmd({
    pattern: "system",
    alias: ["status", "nizzu"],
    desc: "Check uptime, RAM usage, and more.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let status = `
📊 *System Status* 🚀

⏳ *Uptime:* ${runtime(process.uptime())}  
💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB  
🖥️ *Host Name:* ${os.hostname()}  
👤 *Owner:* 🚀✨ *Nizzu ID & Galaxy UID* ✨🚀
        `;

        reply(status);
    } catch (e) {
        console.log(e);
        reply(`⚠️ Error: ${e}`);
    }
});
