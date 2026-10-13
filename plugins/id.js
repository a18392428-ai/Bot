// plugins/id.js - معرفة الـ JID الخاص بالجروب
module.exports = {
    command: ['ايدي', 'id', 'الاي دي'],
    
    execute: async (sock, m, { chatJid }) => {
        const text = `📌 *معرف هذا الجروب (JID):*\n\`\`\`${chatJid}\`\`\``;
        await sock.sendMessage(chatJid, { text: text }, { quoted: m });
    }
};
