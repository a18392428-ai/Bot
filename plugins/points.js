// plugins/points.js - عرض النقاط
module.exports = {
    command: ['النقاط', 'نقاطي', 'النقاط العامة'],
    execute: async (sock, m, { chatJid }) => {
        if (!global.userPoints || Object.keys(global.userPoints).length === 0) {
            return await sock.sendMessage(chatJid, { text: "لا توجد نقاط مسجلة لأي عضو حتى الآن!" });
        }

        let text = "🏆 *قائمة نقاط الفعاليات:*\n\n";
        let mentions = [];

        for (let user in global.userPoints) {
            text += `• @${user.split('@')[0]} ➔ *${global.userPoints[user]}* نقطة\n`;
            mentions.push(user);
        }

        await sock.sendMessage(chatJid, { text, mentions });
    }
};
