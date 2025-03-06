const {readEnv} = require('../libs/database')
const { cmd, commands } = require('../command');

cmd({
    pattern: "menu",
    desc: "Get cmd base.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const config = await readEnv():
        let menu = {
            main: '',
            download: '',
            group: '',
            owner: ''
        };

        // Populate menu categories with commands
        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                menu[commands[i].category] += `${config.PREFIX}${commands[i].pattern}\n`;
            }
        }

        // Creating the dynamic menu with emojis
        let madeMenu = `*Hello ${pushname} 💖 Nizzu 🚀 Wha-ID 🤖*
> *DOWNLOAD COMMANDS* 🎵
${menu.download || 'No commands available'}

> *GROUP COMMANDS* 👥
${menu.group || 'No commands available'}

> *OWNER COMMANDS* 👑
${menu.owner || 'No commands available'}

> *MAIN COMMANDS* 🏠
${menu.main || 'No commands available'}

*🚀 Nizzu ID Galaxy BEA Forum* 🌌✨
`;

        await conn.sendMessage(from, { 
            image: { url:config.ALIVE_IMG }, 
            caption: madeMenu 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
