document.addEventListener("DOMContentLoaded", () => {
    const terminalLines = [
        "anas@awr-node:~$ systemctl status awr-navigation",
        "[ OK ] Started AWR Neural Navigation Service.",
        "[INFO] Initializing ROS2 Humble...",
        "[INFO] Calibration: IMU MPU-6050 detected.",
        "[INFO] Sensors: ToF VL53L0X (4/4) online.",
        "[SUCCESS] Loading v6.2 Weights (Accuracy: 92%).",
        "> Starting inference loop..."
    ];

    function typeTerminal() {
        const body = document.querySelector('.terminal-body');
        if (!body || body.innerHTML !== '') return;
        
        let lineIndex = 0;
        function addLine() {
            if (lineIndex < terminalLines.length) {
                const line = document.createElement('code');
                line.style.display = 'block';
                line.style.marginBottom = '6px';
                line.innerHTML = terminalLines[lineIndex];
                body.appendChild(line);
                lineIndex++;
                setTimeout(addLine, 400); // Slightly sped up the terminal text
            }
        }
        addLine();
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                if (entry.target.classList.contains('terminal-window')) {
                    typeTerminal();
                }
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.card, .video-container, .terminal-window, .section-header').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });

    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour12: false});
    }, 1000);
});