document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const background = document.getElementById('background');
    const proposalText = document.getElementById('proposal-text');
    const buttonGroup = document.getElementById('button-group');
    const bgMusic = document.getElementById('bgm');

    // Fade in audio helper
    function fadeInAudio(audio, duration = 3000) {
        audio.volume = 0;

        const start = performance.now();
        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = progress * 0.6; // Increased from 0.2 for better visibility
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };
        requestAnimationFrame(tick);
    }

    // Floating hearts creation
    let currentEmoji = '❤️';
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = currentEmoji;
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
        background.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 5000);
    }

    setInterval(createHeart, 300);

    // "No" button logic
    let noClickCount = 0;
    let yesScale = 1;

    function handleNoAction() {
        noClickCount++;

        // Increase Yes button size and glow using CSS variables
        yesScale += 0.2;
        const glowIntensity = (noClickCount * 15) + 15;
        yesBtn.style.setProperty('--yes-scale', yesScale);
        yesBtn.style.boxShadow = `0 0 ${glowIntensity}px rgba(255, 77, 109, ${0.3 + (noClickCount * 0.1)})`;

        if (noClickCount === 1) {
            noBtn.innerText = "Are you sure? 🥺";
            currentEmoji = '🥺';
        } else if (noClickCount === 2) {
            noBtn.innerText = "Think again! 🤨";
            currentEmoji = '🤨';
        } else if (noClickCount === 3) {
            noBtn.innerText = "Don't be mean! 😭";
            currentEmoji = '😭';
        } else if (noClickCount >= 4) {
            noBtn.innerText = "You're breaking my heart 😭";
            currentEmoji = '😭';

            // Show sad GIF
            const mainImg = document.querySelector('.main-image');
            if (mainImg && !mainImg.src.includes('cute-sad')) {
                mainImg.src = "https://media.tenor.com/925LDfyVUGEAAAAm/cute-sad.webp";
                mainImg.alt = "Cute Sad GIF";
            }

            // Trigger dramatic heartbreak effect
            document.body.classList.add('ashy-mode');
            startRain();
        }
        moveButton();
    }

    let rainInterval;
    function startRain() {
        if (rainInterval) return; // Only start once
        rainInterval = setInterval(() => {
            const drop = document.createElement('div');
            drop.classList.add('raindrop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            drop.style.opacity = Math.random();
            background.appendChild(drop);

            setTimeout(() => {
                drop.remove();
            }, 2000);
        }, 50);
    }

    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleNoAction();
    });
    noBtn.addEventListener('click', handleNoAction);

    function moveButton(e) {
        const yesRect = yesBtn.getBoundingClientRect();
        const padding = 20; // Extra space around Yes button

        let x, y;
        let attempts = 0;

        do {
            x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
            y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
            attempts++;

            // Check if the new position overlaps with the Yes button's area
            const noRect = {
                left: x - padding,
                top: y - padding,
                right: x + noBtn.offsetWidth + padding,
                bottom: y + noBtn.offsetHeight + padding
            };

            const overlaps = !(noRect.right < yesRect.left ||
                noRect.left > yesRect.right ||
                noRect.bottom < yesRect.top ||
                noRect.top > yesRect.bottom);

            if (!overlaps || attempts > 20) break;
        } while (true);

        noBtn.style.position = 'fixed';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
        noBtn.style.transition = 'all 0.4s ease';
    }

    // "Yes" button logic
    yesBtn.addEventListener('touchstart', (e) => {
        // Handle touch specially for mobile
        if (!yesBtn.dataset.triggered) {
            yesBtn.dataset.triggered = 'true';
            yesBtn.click();
        }
    });

    yesBtn.addEventListener('click', () => {
        yesBtn.dataset.triggered = ''; // Reset

        console.log("--- Yes Clicked ---");

        // 1. IMMEDIATELY STOP HEAVY ANIMATIONS
        // This clears the main thread for audio
        if (rainInterval) {
            console.log("Stopping rain interval...");
            clearInterval(rainInterval);
            rainInterval = null;
        }
        document.body.classList.remove('ashy-mode');
        // Batch remove raindrops at once
        const raindrops = document.querySelectorAll('.raindrop');
        if (raindrops.length > 0) {
            console.log(`Removing ${raindrops.length} raindrops...`);
            raindrops.forEach(drop => drop.remove());
        }

        // 2. HIGH PRIORITY AUDIO TRIGGER
        if (bgMusic) {
            console.log("Audio Element State:", {
                readyState: bgMusic.readyState,
                paused: bgMusic.paused,
                src: bgMusic.src
            });

            bgMusic.pause();
            bgMusic.currentTime = 0;
            bgMusic.volume = 0;

            // Forced reset for mobile/stream issues
            if (bgMusic.readyState === 0) {
                console.log("Audio not ready, forcing load...");
                bgMusic.load();
            }

            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Playback success!");
                    setTimeout(() => {
                        fadeInAudio(bgMusic, 3500);
                    }, 500);
                }).catch(e => {
                    console.error("Playback failed!", e);
                    // Last resort: try playing without reset
                    bgMusic.play().catch(e2 => console.error("Final fallback failed", e2));
                });
            }
        }

        // Change image to success GIF
        const mainImg = document.querySelector('.main-image');
        if (mainImg) {
            mainImg.src = "https://media.tenor.com/3Yml0nL4aBwAAAAi/cosytales-love.gif";
            mainImg.alt = "Success Love GIF";
        }

        // Change background emojis to celebratory ones
        currentEmoji = '💖';

        // Confetti effect
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4d6d', '#ff8fa3', '#ffccd5', '#ffffff']
        });

        // Change text and state
        proposalText.innerText = "YAYY!! I love you so much! 💖";
        proposalText.classList.add('success-text');
        document.body.classList.add('success-bg');

        // Hide button group
        buttonGroup.style.display = 'none';

        // More confetti loop
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        // --- Letter Teaser Transition ---
        setTimeout(() => {
            // Keep both: Success bear and letter surprise
            const letterSticker = document.getElementById('letter-sticker');
            const mainImg = document.getElementById('main-image');

            letterSticker.src = "https://media.tenor.com/r2mSqYQUKycAAAAi/raf-rafs.gif";
            letterSticker.classList.remove('hidden');

            proposalText.style.opacity = '0';
            setTimeout(() => {
                proposalText.innerText = "oh wait.. seems like a letter for you";
                proposalText.style.opacity = '1';
                showEnvelope();
            }, 500);
        }, 2000);
    });

    function showEnvelope() {
        const letterContainer = document.getElementById('letter-container');
        const explorerPage = document.getElementById('explorer-page');
        const letterSticker = document.getElementById('letter-sticker');
        const explorerHeartBtn = document.getElementById('explorer-heart-btn');
        const closeBtn = document.getElementById('close-letter');
        const proposalText = document.getElementById('proposal-text');
        const explorerCard = document.querySelector('.explorer-card');
        const explorerMainText = document.querySelector('.explorer-main-text');
        const explorerSubText = document.querySelector('.explorer-sub-text');

        let currentStageIndex = 0;
        // bgMusic is globally available

        const explorerStages = [
            { mainText: "Still Here? Awesome! ✨", subText: "The journey is just beginning... click the heart! ❤️" },
            { mainText: "Every moment is a gift", subText: "I'm so lucky to have you in my life, making everything special. 🌹" },
            { mainText: "You're my favorite thought", subText: "Whenever I'm bored, I just start thinking about you and smile. 😊" },
            { mainText: "Through thick and thin...", subText: "No matter what happens, I'm always going to be by your side. 🤝" },
            { mainText: "You add color to my world", subText: "Everything seems brighter and happier when you're around. 🌈" },
            { mainText: "Just a reminder...", subText: "You are truly one of a kind and loved more than you know. 🧸" },
            { mainText: "One last thing!", subText: "I have a tiny surprise waiting for you right here... ❤️" }
        ];

        const openExplorer = () => {
            if (explorerPage.classList.contains('hidden')) {
                // Always start from the beginning
                currentStageIndex = 0;
                explorerMainText.innerText = explorerStages[0].mainText;
                explorerSubText.innerText = explorerStages[0].subText;
                explorerCard.style.opacity = '1';

                explorerPage.classList.remove('hidden');
                letterSticker.classList.add('shrunk-corner');
                proposalText.style.opacity = '0';
                setTimeout(() => {
                    explorerPage.style.opacity = '1';
                }, 10);
            }
        };

        const updateExplorerContent = () => {
            currentStageIndex++;
            if (currentStageIndex < explorerStages.length) {
                // Smooth transition between stages
                explorerCard.style.opacity = '0';
                setTimeout(() => {
                    explorerMainText.innerText = explorerStages[currentStageIndex].mainText;
                    explorerSubText.innerText = explorerStages[currentStageIndex].subText;
                    explorerCard.style.opacity = '1';
                }, 400);
            } else {
                openLetter();
            }
        };

        const openLetter = () => {
            letterContainer.classList.remove('hidden');
            setTimeout(() => {
                letterContainer.style.opacity = '1';
                explorerPage.style.opacity = '0';
                setTimeout(() => explorerPage.classList.add('hidden'), 500);
            }, 10);

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff4d6d', '#ff8fa3', '#ffffff']
            });
        };

        const closeExplorer = () => {
            explorerPage.style.opacity = '0';
            letterSticker.classList.add('shrunk-corner');
            proposalText.innerText = "YAYY!! yay i love you so muchh 💖";
            proposalText.style.opacity = '1';
            setTimeout(() => {
                explorerPage.classList.add('hidden');
            }, 500);
        };

        const closeLetter = () => {
            letterContainer.style.opacity = '0';
            letterSticker.classList.add('shrunk-corner');
            proposalText.innerText = "YAYY!! yay i love you so muchh 💖";
            proposalText.style.opacity = '1';
            setTimeout(() => {
                letterContainer.classList.add('hidden');
            }, 500);
        };

        letterSticker.addEventListener('click', openExplorer);
        explorerHeartBtn.addEventListener('click', updateExplorerContent);
        closeBtn.addEventListener('click', closeLetter);
        document.getElementById('close-explorer').addEventListener('click', closeExplorer);
    }
});
