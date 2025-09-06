document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const cookiesLine = document.getElementById('cookies-line');
    const accountLine = document.getElementById('account-line');
    const jokeLine = document.getElementById('joke-line');
    const revealLine = document.getElementById('reveal-line');
    
    // Get a random Roblox username for the prank
    const randomUsernames = [
        'Username And Password have been stored as well as your ip address'
    ];
    
    const randomUsername = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
    
    // Typewriter effect function
    function typeWriter(element, text, speed = 10, callback) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        
        type();
    }
    
    // Create a blinking cursor
    function createCursor() {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        return cursor;
    }
    
    // Add cursor to an element
    function addCursor(element) {
        element.appendChild(createCursor());
    }
    
    // Remove cursor from an element
    function removeCursor(element) {
        const cursor = element.querySelector('.cursor');
        if (cursor) {
            cursor.remove();
        }
    }
    
    // Start the sequence
    setTimeout(() => {
        typeWriter(cookiesLine, '> Found Home Address and Roblox cookies: .ROBLOSECURITY=' + '_'.repeat(32), 20, () => {
            addCursor(cookiesLine);
            
            setTimeout(() => {
                removeCursor(cookiesLine);
                typeWriter(accountLine, '> Accessing Roblox account data...', 10, () => {
                    addCursor(accountLine);
                    
                    setTimeout(() => {
                        removeCursor(accountLine);
                        typeWriter(accountLine, `> House Found & Account found: ${randomUsername} (Premium Member)`, 10, () => {
                            addCursor(accountLine);
                            
                            setTimeout(() => {
                                removeCursor(accountLine);
                                typeWriter(jokeLine, '> WARNING: Your account has been compromised!', 10, () => {
                                    jokeLine.classList.add('warning');
                                    addCursor(jokeLine);
                                    
                                    setTimeout(() => {
                                        removeCursor(jokeLine);
                                        typeWriter(revealLine, 'Just kidding! Your About to get Raped By Black Men', 10, () => {
                                            revealLine.classList.add('success');
                                            
                                            // Add a button to share the prank
                                            setTimeout(() => {
                                                const button = document.createElement('button');
                                                button.className = 'button';
                                                button.textContent = 'Prank a Friend';
                                                button.onclick = () => {
                                                    const url = window.location.href;
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: 'Check this out!',
                                                            text: 'OMG! Click this link to see something crazy!',
                                                            url: url
                                                        }).catch(console.error);
                                                    } else {
                                                        // Fallback for browsers that don't support Web Share API
                                                        const tempInput = document.createElement('input');
                                                        document.body.appendChild(tempInput);
                                                        tempInput.value = url;
                                                        tempInput.select();
                                                        document.execCommand('copy');
                                                        document.body.removeChild(tempInput);
                                                        alert('');
                                                    }
                                                };
                                                terminal.appendChild(button);
                                            }, 1000);
                                        });
                                    }, 1000);
                                });
                            }, 1000);
                        });
                    }, 1500);
                });
            }, 1000);
        });
    }, 1000);
    
    // Add some terminal-like behavior
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for F5 and Ctrl+R
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
        }
        
        // Prevent context menu on right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    });
});
