// index.js - الربط الفعلي بالواتساب واستدعاء الهاندلر ومراقبة الأعضاء الجدد
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const handleMessage = require('./handler');

// 📌 معرف الجروب الثاني لاستقبال أرقام الأعضاء الجدد
const LOG_GROUP_JID = "120363430629123732@g.us";

// إعداد مدخلات الترمكس لطلب رقم التليفون
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    console.log("\x1b[36m[Core] Initializing WhatsApp Connection...\x1b[0m");

    // حفظ واسترجاع جلسة الاتصال تلقائياً
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        // 🔥 إضافة تفعيل جلب معلومات الجروبات وتتبع الأعضاء في إعدادات السوكيت
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    // لو الرقم مش مسجل والجلسة جديدة، اطلب رقم التليفون لكود الاقتران
    if (!sock.authState.creds.registered) {
        console.log("\x1b[33m[!] الجلسة جديدة، جاري تحضير طلب كود الاقتران...\x1b[0m");
        const phoneNumber = await question('\x1b[32m[+] أدخل رقم تليفون المالك (مع رمز الدولة مثلاً 2010xxxxxxx): \x1b[0m');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\x1b[35m[🔥] كود الاقتران الخاص بك هو: \x1b[1m\x1b[33m${code}\x1b[0m`);
    }

    // متابعة حالة الاتصال
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('\x1b[31m[!] تم قطع الاتصال. إعادة الاتصال:\x1b[0m', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('\x1b[32m[Connected] 🎉 تم الاتصال بالواتساب بنجاح! البوت يعمل الآن ويستمع للرسائل...\x1b[0m');
            
            try {
                await sock.groupFetchAllParticipating();
                console.log("\x1b[36m[Cache] تم تحميل بيانات الجروبات بنجاح ومراقبة الأعضاء مفعلة!\x1b[0m");
            } catch (e) {
                console.log("[خطأ في جلب بيانات الجروبات]:", e);
            }
        }
    });

    // حفظ البيانات تلقائياً
    sock.ev.on('creds.update', saveCreds);

    // 📥 التقاط انضمام الأعضاء الجدد (مع طباعة للتأكد في الترمكس)
    sock.ev.on('group-participants.update', async (update) => {
        try {
            console.log("\x1b[35m[Event Detected] تم رصد تغيير في أحد الجروبات:\x1b[0m", update);
            
            const { id, participants, action } = update;

            // عند دخول عضو جديد للجروب
            if (action === 'add') {
                for (let user of participants) {
                    const userNumber = user.split('@')[0];
                    
                    const logMessage = `📥 *عضو جديد انضم للتو!*\n\n` +
                                       `📱 *الرقم:* +${userNumber}\n` +
                                       `🏷️ *المعرف:* @${userNumber}`;

                    // إرسال الرقم لجروب المتابعة الثاني مع المنشن
                    await sock.sendMessage(LOG_GROUP_JID, {
                        text: logMessage,
                        mentions: [user]
                    });
                    console.log(`\x1b[32m[Success] تم إرسال رقم العضو ${userNumber} بنجاح!\x1b[0m`);
                }
            }
        } catch (err) {
            console.log("[خطأ في إرسال رقم العضو الجديد]:", err);
        }
    });

    // استقبال الرسائل وتمريرها لـ handler.js
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;
            await handleMessage(sock, mek);
        } catch (err) {
            console.log(err);
        }
    });
}

startBot();
