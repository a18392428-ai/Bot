// plugins/flags_event.js - فعالية الأعلام (شاملة + تنزيل فور الإجابة/السكب + تخفي كامل)

module.exports = {
    command: ['فعالية اعلام', 'فعاليه اعلام', 'اعلام'],
    
    execute: async (sock, m, { chatJid }) => {
        // 1. حذف رسالة الأمر فوراً للتخفي
        try { await sock.sendMessage(chatJid, { delete: m.key }); } catch (e) {}

        // 2. إيقاف أي فعالية قديمة لمنع التداخل
        if (global.activeEvent && global.activeEvent.interval) {
            clearInterval(global.activeEvent.interval);
            global.activeEvent = null;
        }

        // قائمة شاملة لأعلام الدول (أكثر من 80 علم)
        const flagsList = [
            // الدول العربية
            { flag: "🇪🇬", name: "مصر" }, { flag: "🇸🇦", name: "السعودية" }, { flag: "🇲🇦", name: "المغرب" },
            { flag: "🇩🇿", name: "الجزائر" }, { flag: "🇹🇳", name: "تونس" }, { flag: "🇮🇶", name: "العراق" },
            { flag: "🇸🇾", name: "سوريا" }, { flag: "🇱🇧", name: "لبنان" }, { flag: "🇵🇸", name: "فلسطين" },
            { flag: "🇦🇪", name: "الامارات" }, { flag: "🇶🇦", name: "قطر" }, { flag: "🇰🇼", name: "الكويت" },
            { flag: "🇴🇲", name: "عمان" }, { flag: "🇾🇪", name: "اليمن" }, { flag: "🇸🇩", name: "السودان" },
            { flag: "🇯🇴", name: "الاردن" }, { flag: "🇱🇾", name: "ليبيا" }, { flag: "🇲🇷", name: "موريتانيا" },
            { flag: "🇸🇴", name: "الصومال" }, { flag: "🇧🇭", name: "البحرين" }, { flag: "🇩🇯", name: "جيبوتي" },
            { flag: "🇰🇲", name: "قمر" },

            // أوروبا
            { flag: "🇫🇷", name: "فرنسا" }, { flag: "🇩🇪", name: "المانيا" }, { flag: "🇪🇸", name: "اسبانيا" },
            { flag: "🇮🇹", name: "ايطاليا" }, { flag: "🇬🇧", name: "بريطانيا" }, { flag: "🇷🇺", name: "روسيا" },
            { flag: "🇵🇹", name: "البرتغال" }, { flag: "🇳🇱", name: "هولندا" }, { flag: "🇧🇪", name: "بلجيكا" },
            { flag: "🇨🇭", name: "سويسرا" }, { flag: "🇸🇪", name: "السويد" }, { flag: "🇳🇴", name: "النرويج" },
            { flag: "🇩🇰", name: "الدنمارك" }, { flag: "🇫🇮", name: "فنلندا" }, { flag: "🇵🇱", name: "بولندا" },
            { flag: "🇺🇦", name: "اوكرانيا" }, { flag: "🇬🇷", name: "اليونان" }, { flag: "🇦🇹", name: "النمسا" },
            { flag: "🇮🇪", name: "ايرلندا" }, { flag: "🇭🇺", name: "المجر" }, { flag: "🇷🇴", name: "رومانيا" },
            { flag: "🇨🇿", name: "التشيك" }, { flag: "🇭🇷", name: "كرواتيا" }, { flag: "🇸🇰", name: "سلوفاكيا" },

            // آسيا والأمريكتين وأفريقيا
            { flag: "🇯🇵", name: "اليابان" }, { flag: "🇰🇷", name: "كوريا" }, { flag: "🇨🇳", name: "الصين" },
            { flag: "🇮🇳", name: "الهند" }, { flag: "🇵🇰", name: "باكستان" }, { flag: "🇹🇷", name: "تركيا" },
            { flag: "🇮🇩", name: "اندونيسيا" }, { flag: "🇲🇾", name: "ماليزيا" }, { flag: "🇹🇭", name: "تايلاند" },
            { flag: "🇮🇷", name: "ايران" }, { flag: "🇵🇭", name: "الفلبين" }, { flag: "🇸🇬", name: "سنغافورة" },
            { flag: "🇺🇸", name: "امريكا" }, { flag: "🇨🇦", name: "كندا" }, { flag: "🇧🇷", name: "البرازيل" },
            { flag: "🇦🇷", name: "الارجنتين" }, { flag: "🇲🇽", name: "المكسيك" }, { flag: "🇨🇱", name: "تشيلي" },
            { flag: "🇨🇴", name: "كولومبيا" }, { flag: "🇵🇪", name: "بيرو" }, { flag: "🇺🇾", name: "اوروجواي" },
            { flag: "🇿🇦", name: "جنوب افريقيا" }, { flag: "🇳🇬", name: "نيجيريا" }, { flag: "🇸🇳", name: "السنغال" },
            { flag: "🇨🇲", name: "الكاميرون" }, { flag: "🇬🇭", name: "غانا" }, { flag: "🇦🇺", name: "استراليا" }
        ];

        // دالة إرسال العلم القادم
        const sendNextFlag = async () => {
            if (!global.activeEvent) return;

            const randomItem = flagsList[Math.floor(Math.random() * flagsList.length)];
            global.activeEvent.word = randomItem.name.trim().toLowerCase();

            const eventMessage = `*◞ نوع الفعالية (تخمين الأعلام) • ╎🐦‍🔥 ⬂◜*

                        *╔═✦ೋ° 🐦‍🔥 °ೋ✦═╗*

*❅╎الـمـقـ5kـدم 🤵🏻. 〔 سايتما 〕↬*

*❅╎الـعـلـم 💎 .〔 ${randomItem.flag} 〕↬*

                        *╚═✦ೋ° 🐦‍🔥 °ೋ✦═╝*

                   *『𝐊.𝐍.𝐇┆⊰🐦‍🔥⊱𝐈𝐆𝐍𝐈ْ🇸』*`;

            await sock.sendMessage(chatJid, { text: eventMessage });
        };

        // تجهيز الفعالية في المتغير العام مع اسم الفعالية للإعلان
        global.activeEvent = {
            eventName: "تخمين الأعلام",
            word: null,
            sendNext: sendNextFlag,
            interval: null
        };

        // إرسال أول علم فوراً
        await sendNextFlag();

        // التايمر الاحتياطي كل 15 ثانية لو محدش جاوب أو عمل skip
        const eventInterval = setInterval(async () => {
            try {
                if (!global.activeEvent || !global.activeEvent.sendNext) {
                    clearInterval(eventInterval);
                    return;
                }
                await sendNextFlag();
            } catch (err) {
                console.log("[خطأ في فعالية الأعلام]:", err);
            }
        }, 15000);

        global.activeEvent.interval = eventInterval;
    }
};
