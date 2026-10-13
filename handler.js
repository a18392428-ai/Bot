// handler.js - معالج الرسائل الشامل والنهائي مع التتبع المباشر بدون تكرار
const fs = require('fs');
const path = require('path');

// ⚠️ رقم المالك بدون + أو مسافات
const OWNER_NUMBER = "201000000000@s.whatsapp.net"; 

// 📌 معرف جروب الإعلانات الثابت وجروب استقبال الأرقام
const ADS_GROUP_JID = "120363432608533229@g.us";
const LOG_GROUP_JID = "120363430629123732@g.us"; // جروب استقبال أرقام الأعضاء الجدد

// 🔒 قاعدة بيانات ثابتة في الذاكرة لمنع تكرار إرسال رقم العضو نهائياً
if (!global.trackedMembers) {
    global.trackedMembers = new Set();
}

// قاعدة بيانات حفظ نقاط الأعضاء بشكل فردي
if (!global.userPoints) {
    global.userPoints = {}; 
}

// متغير الفعالية النشطة العام
if (!global.activeEvent) {
    global.activeEvent = null; 
}

module.exports = async (sock, mek) => {
    try {
        if (!mek.message) return;
        
        const m = mek;
        const chatJid = m.key.remoteJid;
        
        // 🎯 تحديد رقم العضو المُرسِل بدقة (سواء في الجروب أو المحادثة الخاصة)
        const userSender = m.key.participant || m.participant || m.key.remoteJid;
        const isOwner = userSender.includes(OWNER_NUMBER) || m.key.fromMe;

        // --- 📥 1. تتبع أول رسالة للعضو الجديد (مباشرة هنا لضمان عدم التكرار أبداً) ---
        if (chatJid && chatJid.endsWith('@g.us') && !m.key.fromMe && userSender) {
            if (!global.trackedMembers.has(userSender)) {
                // تسجيل العضو فوراً في الذاكرة قبل أي خطوة ثانية
                global.trackedMembers.add(userSender);

                const userNumber = userSender.split('@')[0];
                const logMessage = `📥 *عضو جديد أرسل أول رسالة!*\n\n` +
                                   `📱 *الرقم:* +${userNumber}\n` +
                                   `🏷️ *المعرف:* @${userNumber}\n` +
                                   `💬 *الجروب:* ${chatJid}`;

                // إرسال الرقم لجروب المتابعة مرة واحدة فقط في عمر البوت لهذا العضو
                await sock.sendMessage(LOG_GROUP_JID, {
                    text: logMessage,
                    mentions: [userSender]
                });

                console.log(`\x1b[32m[Tracker Success] تم رصد أول رسالة للعضو +${userNumber} وإرسال رقمه مرة واحدة فقط.\x1b[0m`);
            }
        }

        // استخراج النص الكامل للرسالة إن وجد
        const body = (m.message.conversation || 
                      m.message.extendedTextMessage?.text || 
                      m.message.imageMessage?.caption ||
                      m.message.videoMessage?.caption ||
                      '').trim();

        if (!body) return;

        const isCmdWithDot = body.startsWith('.');
        const cleanText = isCmdWithDot ? body.slice(1).trim() : body.trim();
        const command = cleanText.split(/ +/)[0].toLowerCase();
        const args = cleanText.split(/ +/).slice(1);

        // --- 🛑 2. فحص أوامر الإيقاف وإنهاء الفعالية وإرسال إعلان النتائج ---
        if (command === 'إيقاف البوت' || command === 'اطفاء' || command === 'وقف' || cleanText === 'إيقاف' || cleanText === 'كتابة وقف' || cleanText === 'كتابة إيقاف') {
            
            if (global.activeEvent) {
                if (global.activeEvent.interval) {
                    clearInterval(global.activeEvent.interval);
                }

                const eventName = global.activeEvent.eventName || "الفعالية";

                const sortedUsers = Object.entries(global.userPoints)
                    .sort((a, b) => b[1] - a[1]);

                let firstPlace = "لا يوجد";
                let secondPlace = "لا يوجد";
                let thirdPlace = "لا يوجد";

                if (sortedUsers.length > 0) {
                    firstPlace = `@${sortedUsers[0][0].split('@')[0]} (بـ ${sortedUsers[0][1]} نقطة)`;
                }
                if (sortedUsers.length > 1) {
                    secondPlace = `@${sortedUsers[1][0].split('@')[0]} (بـ ${sortedUsers[1][1]} نقطة)`;
                }
                if (sortedUsers.length > 2) {
                    thirdPlace = `@${sortedUsers[2][0].split('@')[0]} (بـ ${sortedUsers[2][1]} نقطة)`;
                }

                const mentions = sortedUsers.slice(0, 3).map(item => item[0]);

                const adMessage = `*📢┇‏إعلان فعالية 🐦‍🔥:↶*
*⎔══╄━━⌯⎔⸽﹝🐦‍🔥﹞⸽⎔⌯━━╃══⎔*

*┑━━╃ فـعـاليــة (${eventName}) ╃━━┍*

 *⇇ شرح الفعالية 📜↶* 
انتهت الفعالية وتم حصد النقاط بنجاح!

*⎔══╄━━⌯⎔⸽﹝🐦‍🔥﹞⸽⎔⌯━━╃══⎔*

*「 الجوائز 🎁」:-*

*🎩↫ الـمـقــ50kــدم ←『 سايتما 』*
*🥇↫ الـمـ50kـركـز الـاول ← ${firstPlace}*
*🥈↫ الـمـ40kـركـز الــثــانـي ← ${secondPlace}*
*🥉↫ الـمـ30kـركـز الـثـالــث ← ${thirdPlace}*
*⎔══╄━━⌯⎔⸽﹝🐦‍🔥﹞⸽⎔⌯━━╃══⎔*
~**『𝑲.𝑵.𝑯⊰🐦‍🔥⊱𝐈𝐺𝑁𝐼𝑆』*~`;

                try {
                    await sock.sendMessage(ADS_GROUP_JID, { 
                        text: adMessage, 
                        mentions: mentions 
                    });
                } catch (err) {
                    console.log("[خطأ في إرسال إعلان الجروب]:", err);
                }

                global.userPoints = {};
                global.activeEvent = null;
            }

            try { await sock.sendMessage(chatJid, { delete: m.key }); } catch (e) {}
            return;
        }

        // --- 🎯 3. فحص إجابة الفعالية أو أمر الـ Skip الحالية (لكل الأعضاء) ---
        if (global.activeEvent && global.activeEvent.word) {
            const userMsg = body.trim().toLowerCase();

            if (userMsg === 'skip' || userMsg === 'سكب') {
                try { await sock.sendMessage(chatJid, { delete: m.key }); } catch (e) {}

                global.activeEvent.word = null;

                if (typeof global.activeEvent.sendNext === 'function') {
                    if (global.activeEvent.interval) {
                        clearInterval(global.activeEvent.interval);
                        global.activeEvent.interval = setInterval(() => {
                            if (global.activeEvent && typeof global.activeEvent.sendNext === 'function') {
                                global.activeEvent.sendNext();
                            }
                        }, 15000);
                    }
                    await global.activeEvent.sendNext();
                }
                return;
            }

            if (userMsg === global.activeEvent.word) {
                global.userPoints[userSender] = (global.userPoints[userSender] || 0) + 1;
                const totalPoints = global.userPoints[userSender];

                const replyText = `تست ${totalPoints}`;
                await sock.sendMessage(chatJid, { text: replyText }, { quoted: m });

                global.activeEvent.word = null;

                if (typeof global.activeEvent.sendNext === 'function') {
                    if (global.activeEvent.interval) {
                        clearInterval(global.activeEvent.interval);
                        global.activeEvent.interval = setInterval(() => {
                            if (global.activeEvent && typeof global.activeEvent.sendNext === 'function') {
                                global.activeEvent.sendNext();
                            }
                        }, 15000);
                    }
                    await global.activeEvent.sendNext();
                }

                return;
            }
        }

        // --- 🧩 4. تنفيذ البلوجنات المعتمدة على الأوامر فقط (Command-Based Plugins) ---
        const pluginsFolder = path.join(__dirname, 'plugins');
        if (fs.existsSync(pluginsFolder)) {
            const pluginFiles = fs.readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
            
            for (let file of pluginFiles) {
                try {
                    const plugin = require(path.join(pluginsFolder, file));
                    
                    if (plugin.command && Array.isArray(plugin.command)) {
                        if (plugin.isOwner && !isOwner) continue;

                        const isMatched = plugin.command.some(cmd => cmd.toLowerCase() === cleanText.toLowerCase() || cmd.toLowerCase() === command);
                        
                        if (isMatched && typeof plugin.execute === 'function') {
                            await plugin.execute(sock, m, { args, text: args.join(' '), userSender, chatJid });
                        }
                    }
                } catch (err) {
                    console.log(`\x1b[31m[Error in Command Plugin ${file}]:`, err, `\x1b[0m`);
                }
            }
        }

    } catch (e) {
        console.log("\x1b[31m[Handler Error]:", e, "\x1b[0m");
    }
};
