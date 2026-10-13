// plugins/writing_event.js - فعالية الكتابة والسرعة (أكثر من 50 كلمة متنوعة + دعم الإعلان والتخفي)
module.exports = {
    command: ['فعالية كتابة', 'فعاليه كتابة', 'كتابة'],
    
    execute: async (sock, m, { chatJid }) => {
        // 1. مسح رسالة الأمر فوراً للتخفي
        try { await sock.sendMessage(chatJid, { delete: m.key }); } catch (e) {}

        // 2. إيقاف وإلغاء أي فعالية قديمة شغالة لمنع تكرار الرسائل
        if (global.activeEvent && global.activeEvent.interval) {
            clearInterval(global.activeEvent.interval);
            global.activeEvent = null;
        }

        // قائمة ضخمة تضم أكثر من 50 كلمة أنمي فريدة
        const animeWordsList = [
            // شخصيات مشهورة
            "سايتما", "لوفي", "ناروتو", "ساسكي", "جوكو", "فجيتا", "زورو", "سانجي", "كاكاشي",
            "ايتاشي", "غون", "كيلوا", "هيسوكا", "لايت", "ارن", "ميكاسا", "تانجيرو", 
            "نيزوكو", "جينتوكي", "كارين", "باكوغو", "ميدوريا", "تودوروكي", "جوجو", "سوكونا",
            "ميليوداس", "إيرين", "كاوري", "كيريتو", "أسونا", "إتشيجو", "باين", "مصر",
            "غارا", "روك لي", "شيكامارو", "هيناتا", "سبيفاك", "آيزن", "كباتن",
            // أسماء أنمي قوية
            "ونبيس", "ناروتو", "بليتش", "هنتر", "دراجونبول", "هجوم العمالقة", "قاتل الشياطين",
            "طوكيو غول", "مونستر", "فايبر", "ديث نوت", "سورد آرت", "جنتاما", "بليتش",
            "الحديقة", "البلاتินوم", "دكتور ستون", "جوجوتسو كايسن", "تشينسو مان", "المحقق كونان"
        ];

        // دالة إرسال الكلمة
        const sendNextWord = async () => {
            if (!global.activeEvent) return;

            const randomWord = animeWordsList[Math.floor(Math.random() * animeWordsList.length)];
            global.activeEvent.word = randomWord.trim().toLowerCase();

            const eventMessage = `*◞ نوع الفعالية (كتابة وسرعة) • ╎🐦‍🔥 ⬂◜*

                        *╔═✦ೋ° 🐦‍🔥 °ೋ✦═╗*

*❅╎الـمـقـ5kـدم 🤵🏻. 〔 سايتما 〕↬*

*❅╎الـكـلـمـة 💎 .〔 ${randomWord} 〕↬*

                        *╚═✦ೋ° 🐦‍🔥 °ೋ✦═╝*

                   *『𝐊.𝐍.𝐇┆⊰🐦‍🔥⊱𝐈𝐆𝐍𝐈𝚂』*`;

            await sock.sendMessage(chatJid, { text: eventMessage });
        };

        // تجهيز الفعالية في المتغير العام مع اسم الفعالية للإعلان
        global.activeEvent = {
            eventName: "كتابة وسرعة",
            word: null,
            sendNext: sendNextWord,
            interval: null
        };

        // إرسال أول كلمة فوراً
        await sendNextWord();

        // تشغيل العداد التكراري كل 15 ثانية لو محدش جاوب أو عمل skip
        const eventInterval = setInterval(async () => {
            try {
                if (!global.activeEvent || !global.activeEvent.sendNext) {
                    clearInterval(eventInterval);
                    return;
                }
                await sendNextWord();
            } catch (err) {
                console.log("[خطأ في فعالية الكتابة]:", err);
            }
        }, 15000);

        global.activeEvent.interval = eventInterval;
    }
};
