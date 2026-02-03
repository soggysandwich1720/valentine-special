document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const background = document.getElementById('background');
    const proposalText = document.getElementById('proposal-text');
    const buttonGroup = document.getElementById('button-group');

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
    yesBtn.addEventListener('click', () => {
        // Clear heartbreak effects if active
        document.body.classList.remove('ashy-mode');
        if (rainInterval) {
            clearInterval(rainInterval);
            rainInterval = null;
            // Remove all existing raindrops
            const raindrops = document.querySelectorAll('.raindrop');
            raindrops.forEach(drop => drop.remove());
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
        proposalText.innerText = "YAYY!! i love you too";
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
    });
});
