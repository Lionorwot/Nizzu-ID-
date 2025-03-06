const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID,
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/Wp0Cb5Bh/Naruto.jpg",
ALIVE_MSG: process.env.ALIVE_MSG || "Hello , There Nizzu ID Is Alive  💡",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "Ttrue",
MODE: process.env.MODE || "public",
};
