// main.js - واجهة تشغيل ترمكس الملونة والمليئة بالأنيماشن
const { spawn } = require('child_process');
const readline = require('readline');

// أكواد الألوان لـ Terminal
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    red: "\x1b[31m",
    blue: "\x1b[34m"
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startTermuxBanner() {
    console.clear();
    console.log(colors.cyan + "================================================" + colors.reset);
    console.log(colors.bright + colors.yellow + "       [!] STARTING TERMINAL ENVIRONMENT...     " + colors.reset);
    console.log(colors.cyan + "================================================" + colors.reset);
    
    const steps = [
        "Initializing Termux storage modules...",
        "Loading Node.js runtime environment...",
        "Bypassing security protocols...",
        "Connecting to WhatsApp servers...",
        "System Ready. Launching Bot Core..."
    ];

    for (let i = 0; i < steps.length; i++) {
        process.stdout.write(colors.green + `[✔] ${steps[i]}` + colors.reset + "\n");
        await sleep(400);
    }
    
    console.log(colors.magenta + "\n[🔥] ALL SYSTEMS ONLINE. STARTING INDEX.JS...\n" + colors.reset);
    
    // تشغيل ملف الـ index.js الأساسي تلقائياً
    let child = spawn('node', ['index.js'], { stdio: 'inherit', shell: true });
    
    child.on('close', (code) => {
        console.log(colors.red + `[!] Bot stopped with code: ${code}. Restarting...` + colors.reset);
        startTermuxBanner();
    });
}

startTermuxBanner();
