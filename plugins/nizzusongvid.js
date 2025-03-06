const { cmd, commands } = require('../command');
const fg = require('api-dylux');
const yts = require('yt-search');

cmd({
    pattern: "song",
    desc: "Download songs.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube URL!");

        // Search for the song on YouTube
        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found!");

        const data = search.videos[0];
        const url = data.url;

        let desc = `
🎵 *Nizzu ID - Song Downloader* 🎶

🎶 *Title:* ${data.title}
📝 *Description:* ${data.description}
⏳ *Duration:* ${data.timestamp}
📅 *Uploaded:* ${data.ago}
👀 *Views:* ${data.views}

🤖✨ *Nizzu ID WhatsApp Bot* ✨🤖
        `;

        // Send song details with thumbnail
        await conn.sendMessage(from, { 
            image: { url: data.thumbnail }, 
            caption: desc 
        }, { quoted: mek });

        // Download audio
        let down = await fg.yta(url);
        let downloadUrl = down.dl_url;

        // Send the audio file
        await conn.sendMessage(from, { 
            audio: { url: downloadUrl }, 
            mimetype: "audio/mpeg" 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`⚠️ Error: ${e}`);
    }
});
