document.addEventListener('DOMContentLoaded', function() {
    const phonzText = document.getElementById('phonz-text');
    const sceneContainer = document.querySelector('.scene-container');
    const particlesContainer = document.getElementById('particles');
    
    // Mouse interaction variables
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // 3D rotation variables
    let rotateX = 0;
    let rotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    
    // Initialize particles
    function createParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random starting position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
            
            // Random size variation
            const size = Math.random() * 3 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random opacity
            particle.style.opacity = Math.random() * 0.6 + 0.2;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // Mouse event handlers for dragging
    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        if (e.target.closest('.text-3d')) {
            isDragging = true;
            phonzText.style.cursor = 'grabbing';
        }
    }
    
    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        phonzText.style.cursor = 'grab';
    }
    
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            xOffset = currentX;
            yOffset = currentY;
            
            // Update 3D rotation based on mouse movement
            targetRotateY = (currentX / window.innerWidth) * 60;
            targetRotateX = -(currentY / window.innerHeight) * 60;
            
            // Apply transformation
            updateTransform();
        }
    }
    
    // Mouse movement for 3D effect (when not dragging)
    function handleMouseMove(e) {
        if (!isDragging) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            // Calculate rotation based on mouse position
            targetRotateY = (mouseX / centerX) * 15;
            targetRotateX = -(mouseY / centerY) * 15;
        }
    }
    
    // Smooth rotation animation
    function animateRotation() {
        // Smooth interpolation
        rotateX += (targetRotateX - rotateX) * 0.1;
        rotateY += (targetRotateY - rotateY) * 0.1;
        
        if (!isDragging) {
            updateTransform();
        }
        
        requestAnimationFrame(animateRotation);
    }
    
    // Update 3D transformation
    function updateTransform() {
        const letters = phonzText.querySelectorAll('.letter');
        
        letters.forEach((letter, index) => {
            const letterOffset = (index - 2) * 0.1; // Center the rotation
            const letterRotateX = rotateX + letterOffset * 5;
            const letterRotateY = rotateY + letterOffset * 10;
            
            letter.style.transform = `
                translateX(${xOffset}px) 
                translateY(${yOffset}px) 
                rotateX(${letterRotateX}deg) 
                rotateY(${letterRotateY}deg)
                translateZ(${Math.sin(letterOffset) * 20}px)
            `;
        });
    }
    
    // Add data-letter attributes to letters for 3D effect
    function initializeLetters() {
        const letters = phonzText.querySelectorAll('.letter');
        letters.forEach(letter => {
            letter.setAttribute('data-letter', letter.textContent);
        });
    }
    
    // Event listeners
    phonzText.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
    
    // Touch events for mobile
    phonzText.addEventListener('touchstart', dragStart);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('touchmove', drag);
    
    // Mouse movement for 3D effect
    document.addEventListener('mousemove', handleMouseMove);
    
    // Initialize
    createParticles();
    initializeLetters();
    animateRotation();
    
    // Add some interactive letter effects on hover
    const letters = phonzText.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
        letter.addEventListener('mouseenter', function() {
            if (!isDragging) {
                this.style.transform += ' scale(1.2) translateZ(30px)';
                this.style.color = '#00ffff';
            }
        });
        
        letter.addEventListener('mouseleave', function() {
            if (!isDragging) {
                this.style.color = '#ffffff';
            }
        });
    });
    
    // Add keyboard controls for additional interaction
    document.addEventListener('keydown', function(e) {
        const step = 10;
        const rotateStep = 5;
        
        switch(e.key) {
            case 'ArrowLeft':
                xOffset -= step;
                targetRotateY -= rotateStep;
                break;
            case 'ArrowRight':
                xOffset += step;
                targetRotateY += rotateStep;
                break;
            case 'ArrowUp':
                yOffset -= step;
                targetRotateX += rotateStep;
                break;
            case 'ArrowDown':
                yOffset += step;
                targetRotateX -= rotateStep;
                break;
            case ' ':
                // Spacebar to reset position
                xOffset = 0;
                yOffset = 0;
                targetRotateX = 0;
                targetRotateY = 0;
                e.preventDefault();
                break;
        }
        
        updateTransform();
    });
    
    // Add window resize handler
    window.addEventListener('resize', function() {
        // Recalculate center positions if needed
        updateTransform();
    });
    
    // Add some random movement when idle
    let idleTimer;
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (!isDragging) {
                // Add subtle random movement
                targetRotateX += (Math.random() - 0.5) * 10;
                targetRotateY += (Math.random() - 0.5) * 10;
            }
        }, 3000); // 3 seconds of idle time
    }
    
    // Reset idle timer on any user interaction
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('touchstart', resetIdleTimer);
    
    // Start the idle timer
    resetIdleTimer();
});
