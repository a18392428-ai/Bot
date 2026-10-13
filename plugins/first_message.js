// plugins/first_message.js - تتبع أول رسالة للعضو الجديد بدون تكرار
const LOG_GROUP_JID = "120363430629123732@g.us";

// استخدام Set لحفظ الأرقام التي تم رصدها في جلسة البوت
if (!global.trackedMembers) {
    global.trackedMembers = new Set();
}

module.exports = {
    // تعريف اسم فريد للبلجن عشان الهاندلر يميزه
    name: "first_message",
    
    execute: async (sock, m, { userSender, chatJid }) => {
        try {
            // 1. التأكد أن الرسالة داخل مجموعة وليست محادثة خاصة
            if (!chatJid || !chatJid.endsWith('@g.us')) return;
            
            // 2. تجاهل رسائل البوت نفسه
            if (m.key.fromMe) return;
            if (!userSender) return;

            // 3. التحقق مما إذا كان العضو تم رصده مسبقاً في الذاكرة
            if (global.trackedMembers.has(userSender)) {
                return; // متسجل قبل كده، اتجاهل تماماً بدون أي تكرار
            }

            // 4. تسجيل العضو فورا في الذاكرة لمنع أي تكرار مستقبلي
            global.trackedMembers.add(userSender);

            // 5. استخراج الرقم الصافي
            const userNumber = userSender.split('@')[0];

            // 6. صياغة رسالة السجل
            const logMessage = `📥 *عضو جديد أرسل أول رسالة!*\n\n` +
                               `📱 *الرقم:* +${userNumber}\n` +
                               `🏷️ *المعرف:* @${userNumber}\n` +
                               `💬 *الجروب:* ${chatJid}`;

            // 7. إرسال الرقم لجروب المتابعة مرة واحدة فقط للعضو
            await sock.sendMessage(LOG_GROUP_JID, {
                text: logMessage,
                mentions: [userSender]
            });

            console.log(`\x1b[32m[Tracker] تم إرسال رقم العضو الجديد +${userNumber} بنجاح ولن يتم تكراره!\x1b[0m`);
            
        } catch (err) {
            console.log("[خطأ في تتبع أول رسالة]:", err);
        }
    }
};
