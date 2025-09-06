
document.addEventListener('DOMContentLoaded', async () => {
    const terminal = document.getElementById('terminal');
    const ipLine = document.getElementById('ip-line');
    const cookiesLine = document.getElementById('cookies-line');
    const accountLine = document.getElementById('account-line');
    const jokeLine = document.getElementById('joke-line');
    const revealLine = document.getElementById('reveal-line');
    
    // Get and display the user's public IP
    const userIp = await getPublicIp();
    
    // Get a random Roblox username for the prank
    const randomUsernames = [
        'Your Photo have Been Stole Aswell'
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
    typeWriter(ipLine, `> IP Address: ${userIp} (${randomLocation.city}, ${randomLocation.country})`, 10, () => {
        addCursor(ipLine);
        
        setTimeout(() => {
            removeCursor(ipLine);
            
            // Continue with the rest of the sequence
            setTimeout(() => {
                typeWriter(cookiesLine, '>Found IP And Home Address & Device Data' + '_'.repeat(32), 20, () => {
                    addCursor(cookiesLine);
                    
                    setTimeout(() => {
                        removeCursor(cookiesLine);
                        typeWriter(accountLine, '> Device Data & Roblox account data...', 10, () => {
                            addCursor(accountLine);
                            
                            setTimeout(() => {
                                removeCursor(accountLine);
                                typeWriter(accountLine, `> We Also Stored Some Data About You: ${randomUsername}`, 10, () => {
                                    addCursor(accountLine);
                                    
                                    setTimeout(() => {
                                        removeCursor(accountLine);
                                        typeWriter(jokeLine, '> ⭐ All Your Data Has Been Stored ⭐', 10, () => {
                                            jokeLine.classList.add('warning');
                                            addCursor(jokeLine);
                                            
                                            setTimeout(() => {
                                                removeCursor(jokeLine);
                                                typeWriter(revealLine, '⭐ Made By Phonz ⭐', 10, () => {
                                                    revealLine.classList.add('success');
                                                    
                                                    // Add a button to share the prank
                                                    setTimeout(() => {
                                                        const button = document.createElement('button');
                                                        button.className = 'button';
                                                        button.textContent = '⭐ Thanks For Your Data ⭐';
                                                        button.onclick = () => {
                                                            const url = window.location.href;
                                                            if (navigator.share) {
                                                                navigator.share({
                                                                    title: '⭐ Thanks For Your Data ⭐',
                                                                    text: '⭐ Thanks For Your Data ⭐',
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
                                                                alert('⭐ Thanks For Your Data ⭐');
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
        }, 1000);
    });
    
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
