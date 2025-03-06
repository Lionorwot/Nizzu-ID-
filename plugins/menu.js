
const config = require('../config')
const {cmd , commands} = require('../command')

cmd({
    pattern: "menu",
    desc: "get cmd base.",
    category: "main",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let menu = {
  main: '',
  download: '',
  group: '',
  owner: ''
};

for (let i = 0; i < commands.length; i++) {
  if (commands[i].pattern && !commands[i].dontAddCommandList) {
    menu[commands[i].category] += `.${commands[i].pattern}\n`;
  }
}

// Creating the dynamic menu with emojis
let madeMenu = `*Hello ${pushname} 💖 Nizzu 🚀 Wha-ID 🤖*
> *DOWNLOAD COMMANDS* 🎵
${menu.download}

> *GROUP COMMANDS* 👥
${menu.group}

> *OWNER COMMANDS* 👑
${menu.owner}

> *MAIN COMMANDS* 🏠
${menu.main}

*🚀 Nizzu ID Galaxy BEA Forum* 🌌✨
`;
  
await conn.sendMessage(from, { text: madeMenu }, { quoted: mek });

  
}catch(e){
console.log(e)
  reply('${e}')
}
