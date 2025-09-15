document.addEventListener('DOMContentLoaded', () => {
    const commandInput = document.getElementById('command-input');
    const output = document.getElementById('output');
    const desktop = document.getElementById('desktop');
    let windowZIndex = 100;

    const welcomeMessage = `
Welcome to Piratheon OS v1.1.2
Type 'help' to see a list of available commands.
    `;

    // Shared quiz questions so both interactive quiz and check command use the same set
    const QUIZ_QUESTIONS = [
        { q: "What is the init system commonly used by Arch Linux?", a: "systemd" },
        { q: "Which kernel subsystem handles process scheduling (one word)?", a: "scheduler" },
        { q: "Which command shows kernel ring buffer messages (short)?", a: "dmesg" }
    ];

    function printToTerminal(text, isResult = true) {
        const div = document.createElement('div');
        div.className = isResult ? 'result' : 'command-history';
        div.innerHTML = text;
        output.appendChild(div);
        // Auto-scroll the terminal to the bottom when new content is added.
        // Prefer smooth scrolling when supported by browser, fall back to instant.
        const container = document.getElementById('terminal-body') || output;
        try {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } catch (err) {
            // If smooth isn't supported, fallback
            container.scrollTop = container.scrollHeight;
        }
    }

    printToTerminal(welcomeMessage);

    // Center the main terminal in pixels (avoid transform centering which breaks drag math)
    (function centerInitialTerminal() {
        const term = document.getElementById('terminal');
        if (!term) return;
        if (!window.matchMedia('(min-width: 769px)').matches) return;
        const desktopRect = desktop.getBoundingClientRect();
        const rect = term.getBoundingClientRect();
        const left = Math.max(0, (desktopRect.width - rect.width) / 2);
        const top = Math.max(0, (desktopRect.height - rect.height) / 2);
        term.style.left = `${left}px`;
        term.style.top = `${top}px`;
        term.style.transform = 'none';
    })();

    commandInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = commandInput.value.trim();
            if (command) {
                printToTerminal(`<span class="prompt"><span class="user">piratheon@archlinux</span><span class="tilde">~</span>$</span> ${command}`, false);
                executeCommand(command);
                commandInput.value = '';
            }
        }
    });

    // --- Command Definitions ---
    const commands = {
    help: `
Available commands:
  <span style="color:var(--green)">about</span>         - Opens a window with info about me.
  <span style="color:var(--green)">projects</span>      - Lists my featured projects in a new window.
  <span style="color:var(--green)">skills</span>        - Shows my technical skills.
  <span style="color:var(--green)">contact</span>       - Show contact info window.
  <span style="color:var(--green)">neofetch</span>      - Display system information.
  <span style="color:var(--green)">clear</span>         - Clears the terminal screen.
  <span style="color:var(--green)">ls</span>            - List files in the virtual filesystem (vfs).
  <span style="color:var(--green)">cat</span>           - Print the contents of a file: <code>cat file</code> or <code>cat ./file</code>.
  <span style="color:var(--green)">echo</span>          - Print text or write to files using redirection: <code>echo "text" &gt; anweser.txt</code>.
  <span style="color:var(--green)">quiz</span>          - Quiz helper. Use <code>quiz --help</code> for usage. To start interactive quiz run <code>quiz</code>.
  <span style="color:var(--green)">check</span>         - Validate the fixed answer file <code>anweser.txt</code> (equivalent to: <code>echo "..." &gt; anweser.txt && check</code>).
    `,
        about: () => {
            const content = `
                <h2>👨‍💻 About Me</h2>
                <p>Hey, I'm <strong>Chafiq El IBRAHIMI</strong> — a student and passionate hobby developer.</p>
                <p>I'm a Linux/Unix enthusiast (I use ArchLinux, btw), desktop ricer, and a proud distro hopper. I love building and breaking things: from creative CLI tools to desktop apps, and even the occasional VM-destroying virus (in the name of learning!).</p>
                <blockquote>“I don't just use my OS, I make it my own.”</blockquote>
            `;
            createWindow('about_me.txt', content);
        },
        projects: () => {
            const content = `
                <h2>🛠️ Featured Projects</h2>
                <div class="project">
                    <h3>ORI (OpenRouter Interactive Assistant)</h3>
                    <p>A CLI assistant for Unix-like environments. Alpha version available!</p>
                    <a href="https://github.com/piratheon/ORI" target="_blank">[View on GitHub]</a>
                </div>
                <div class="project">
                    <h3>Harpocrates</h3>
                    <p>Encrypt and securely hide files inside images, right in your browser.</p>
                    <a href="https://github.com/piratheon/Harpocrates" target="_blank">[View on GitHub]</a>
                </div>
                 <div class="project">
                    <h3>ASCII2MID</h3>
                    <p>A creative tool to convert ASCII art into MIDI music!</p>
                    <a href="https://github.com/piratheon/ASCII2MID" target="_blank">[View on GitHub]</a>
                </div>
            `;
            createWindow('projects.sh', content);
        },
        skills: () => {
             const content = `
                <h2>🔧 Languages & Tools</h2>
                <div class="skills-grid">
                    <span class="skill-badge">Python</span>
                    <span class="skill-badge">C++</span>
                    <span class="skill-badge">Bash</span>
                    <span class="skill-badge">PowerShell</span>
                    <span class="skill-badge">Linux</span>
                    <span class="skill-badge">ArchLinux</span>
                    <span class="skill-badge">Git</span>
                    <span class="skill-badge">Docker</span>
                </div>
                <h2>🎸 Interests</h2>
                <div class="skills-grid">
                    <span class="skill-badge">Music & Audio Programming</span>
                    <span class="skill-badge">Linux Ricing</span>
                    <span class="skill-badge">CLI Utilities</span>
                    <span class="skill-badge">Cybersecurity</span>
                    <span class="skill-badge">System Tweaking</span>
                </div>
            `;
            createWindow('skills.conf', content);
        },
        contact: () => {
            const content = `
                <h2>📫 Contact</h2>
                <p>You can reach me via:</p>
                <ul>
                    <li><strong>Email:</strong> <a href="mailto:chafiq.dev@gmail.com">chafiq.dev@gmail.com</a></li>
                    <li><strong>GitHub:</strong> <a href="https://github.com/piratheon" target="_blank">@piratheon</a></li>
                </ul>
            `;
            createWindow('contact.info', content);
        },
                    neofetch: `
        <div class="neofetch">
            <img class="neofetch-icon" src="./.github/icon.png" alt="icon">
            <div class="neofetch-text">
                <div class="nf-host"><span class="nf-user">piratheon@archlinux</span></div>
                <div class="nf-sep">---------------------------------</div>
                <div><strong>OS</strong>: Piratheon OS (Arch Linux Base)</div>
                <div><strong>Host</strong>: Portfolio v1.1.2</div>
                <div><strong>Shell</strong>: bash</div>
                <div><strong>Interests</strong>: Linux, Hacking, Music, Graphics</div>
                <div><strong>Contact</strong>: Run 'contact' command</div>
                <div><strong>GitHub</strong>: <a href="https://github.com/piratheon" target="_blank">github.com/piratheon</a></div>
            </div>
        </div>
                        `,
                        quiz: (args = []) => {
                            // Help
                            if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
                                printToTerminal(`quiz --help\n\nUsage:\n  quiz --help           Show this help\n  quiz --check          Check the fixed answer file 'anweser.txt' created via: echo "your answers" > anweser.txt && quiz --check\n\nWhen you run quiz for the first time, write your answer to 'anweser.txt' and check using the --check flag to emulate UNIX-style workflow.`);
                                return;
                            }

                            // Check: read the fixed file 'anweser.txt' from vfs
                            if (args.length === 1 && args[0] === '--check') {
                                const filename = 'anweser.txt';
                                if (!(filename in vfs)) {
                                    printToTerminal(`<span class=\"error\">No 'anweser.txt' found in virtual filesystem. Create it with: echo \"your answers\" > anweser.txt && quiz --check</span>`);
                                    return;
                                }
                                const answer = (vfs[filename] || '').trim().toLowerCase();
                                // Check against questions sequentially
                                let passed = true;
                                for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
                                    if (!answer.includes(QUIZ_QUESTIONS[i].a)) {
                                        passed = false;
                                        printToTerminal(`<span class=\"error\">Question ${i+1} failed: expected to find '${QUIZ_QUESTIONS[i].a}' in your answer.</span>`);
                                        break;
                                    }
                                }
                                if (passed) {
                                    printToTerminal(`<span style=\"color:var(--green)\">Quiz passed! You may now run 'contact' to see contact info.</span>`);
                                }
                                return;
                            }

                            // Start interactive quiz if no arguments provided
                            if (args.length === 0) {
                                securityChallenge();
                                return;
                            }

                            // Invalid usage
                            printToTerminal(`<span class="error">Invalid usage. Type 'quiz --help' for help.</span>`);
                        },
        clear: () => {
            output.innerHTML = '';
        }
    };

    // Add a simple virtual ls command to inspect vfs
    commands.ls = () => {
        const files = Object.keys(vfs);
        if (files.length === 0) {
            printToTerminal('<span class="muted">(vfs) No files</span>');
            return;
        }
        const list = files.map(f => `<div>${f}</div>`).join('');
        printToTerminal(`<div class="vfs-list">${list}</div>`);
    };

    // Helper: escape HTML for file content display
    function escapeHtml(unsafe) {
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // cat command: read files from vfs
    commands.cat = (args = []) => {
        if (!args || args.length === 0) {
            printToTerminal(`<span class="error">Usage: cat &lt;filename&gt;  (e.g. cat anweser.txt)</span>`);
            return;
        }
        // support multiple files and ./ prefix
        const outputs = [];
        args.forEach(a => {
            const filename = a.replace(/^\.\//, '');
            if (!(filename in vfs)) {
                outputs.push(`<span class=\"error\">cat: ${filename}: No such file in vfs</span>`);
            } else {
                outputs.push(`<div class=\"file-content\">${escapeHtml(vfs[filename])}</div>`);
            }
        });
        printToTerminal(outputs.join(''));
    };

    // check command: validate 'anweser.txt' using QUIZ_QUESTIONS
    commands.check = () => {
        const filename = 'anweser.txt';
        if (!(filename in vfs)) {
            printToTerminal(`<span class="error">No 'anweser.txt' found in virtual filesystem. Create it with: echo \"your answers\" &gt; anweser.txt && check</span>`);
            return;
        }
        const answer = (vfs[filename] || '').trim().toLowerCase();
        let passed = true;
        for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
            if (!answer.includes(QUIZ_QUESTIONS[i].a)) {
                passed = false;
                printToTerminal(`<span class=\"error\">Question ${i+1} failed: expected to find '${QUIZ_QUESTIONS[i].a}' in your answer.</span>`);
                break;
            }
        }
        if (passed) {
            printToTerminal(`<span style=\"color:var(--green)\">Quiz passed! You may now run 'contact' to see contact info.</span>`);
        }
    };

    // Simple virtual filesystem to emulate writing answer files
    const vfs = {};

    function executeCommand(command) {
        const raw = command.trim();

    // Detect patterns for writing into the virtual filesystem (echo only):
    // Supports: echo "content" > filename [&& quiz --check] or [&& check]
    const writePattern = raw.match(/echo\s+(['"])([\s\S]*?)\1\s*>\s*([^&\s]+)(?:\s*&&\s*(?:quiz\s+--check|check))?/i);
        // If user tried to use cat with redirection, notify them to use echo instead
        const catRedirect = raw.match(/cat\s+(['"])([\s\S]*?)\1\s*>\s*([^&\s]+)/i);
        if (catRedirect) {
            printToTerminal(`<span class="error">'cat' is for reading files. To write into a file use: echo "your text" &gt; anweser.txt</span>`);
            return;
        }
        if (writePattern) {
            const filename = writePattern[3];
            const content = writePattern[2];
            vfs[filename] = content;
            printToTerminal(`<span class="result">Wrote ${filename}</span>`);
                // If the user appended '&& quiz --check' or '&& check', run the check command automatically
            if (/&&\s*(?:quiz\s+--check|check)/i.test(raw)) {
                // Enforce the fixed answer filename 'anweser.txt' when running check
                if (filename !== 'anweser.txt') {
                    printToTerminal(`<span class="error">The quiz requires the answer file to be named 'anweser.txt'. Create it with: echo "your answers" > anweser.txt && check</span>`);
                    return;
                }
                if (typeof commands.check === 'function') {
                    commands.check();
                    return;
                }
            } else {
                // Normal write (no immediate quiz run)
                return;
            }
        }

        const tokens = raw.split(/\s+/);
        const cmd = tokens[0] ? tokens[0].toLowerCase() : '';
        const args = tokens.slice(1);

        if (cmd in commands) {
            const result = commands[cmd];
            if (typeof result === 'function') {
                result(args);
            } else {
                printToTerminal(result);
            }
        } else {
            printToTerminal(`<span class="error">Command not found: ${command}. Type 'help' for a list of commands.</span>`);
        }
    }

    // --- Window Management ---
    function createWindow(title, content) {
        const win = document.createElement('div');
        win.className = 'window';
        win.style.zIndex = ++windowZIndex;
        // We'll append first and then center in pixels (avoids transform issues that break dragging)

        win.innerHTML = `
            <div class="window-header">
                <div class="window-controls start">
                    <span class="control close"></span>
                </div>
                <span class="window-title">${title}</span>
                <div class="window-controls end"></div>
            </div>
            <div class="window-body">${content}</div>
        `;

        desktop.appendChild(win);

        // Helper: center a window using pixel left/top (relative to desktop)
        function centerWindowPixels(el) {
            const desktopRect = desktop.getBoundingClientRect();
            const rect = el.getBoundingClientRect();
            const left = Math.max(0, (desktopRect.width - rect.width) / 2);
            const top = Math.max(0, (desktopRect.height - rect.height) / 2);
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
            el.style.transform = 'none';
        }

        // Initially center on large screens; small screens handled by CSS
        if (window.matchMedia('(min-width: 769px)').matches) {
            // Set a fixed size for non-terminal windows so they are not resizable
            win.classList.add('fixed-window');
            // Give a default fixed size (can be adjusted in CSS)
            win.style.width = '520px';
            win.style.height = '340px';
            // Use pixel centering to avoid leaving a CSS transform that breaks dragging math
            centerWindowPixels(win);
        } else {
            win.style.left = `${Math.random() * 30 + 10}%`;
            win.style.top = `${Math.random() * 30 + 10}%`;
        }

        // Make window draggable
        const header = win.querySelector('.window-header');
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        // Only enable mouse dragging (ignore touch devices)
        header.addEventListener('mousedown', (e) => {
            // Don't start drag when clicking on control buttons
            if (e.target.closest('.control')) return;
            if (e.button !== 0) return; // only left mouse
            e.preventDefault(); // avoid text selection / native behaviors
            isDragging = true;
            const desktopRect = desktop.getBoundingClientRect();
            const rect = win.getBoundingClientRect();
            // Compute offset from mouse to window top-left (in viewport coords)
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            // Set explicit left/top relative to desktop so we can use pixel math
            const leftRel = rect.left - desktopRect.left;
            const topRel = rect.top - desktopRect.top;
            win.style.left = `${leftRel}px`;
            win.style.top = `${topRel}px`;
            // Prevent accidental resize while dragging (some browsers may allow resize handles)
            win.style.width = `${rect.width}px`;
            win.style.height = `${rect.height}px`;
            // Temporarily disable CSS resize while the user is dragging
            win.style.resize = 'none';
            // Override any CSS transform that was centering the window
            win.style.transform = 'none';
            win.style.zIndex = ++windowZIndex; 
            // focus styling
            document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
            win.classList.add('focused');
        });

        const onMouseMove = (e) => {
            if (isDragging) {
                // constrain to desktop bounds (use desktop-relative coordinates)
                const desktopRect = desktop.getBoundingClientRect();
                const winW = win.offsetWidth;
                const winH = win.offsetHeight;
                // left/top relative to desktop
                let left = e.clientX - offset.x - desktopRect.left;
                let top = e.clientY - offset.y - desktopRect.top;
                // clamp within desktop area
                left = Math.max(0, Math.min(left, desktopRect.width - winW));
                top = Math.max(0, Math.min(top, desktopRect.height - winH));
                win.style.left = `${left}px`;
                win.style.top = `${top}px`;
            }
        };

        const onMouseUp = () => { isDragging = false; };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', (e) => {
            // Restore resize behavior after drag completes and remove inline width/height locks
            if (win) {
                win.style.resize = '';
                // If this is not a fixed-window, remove inline width/height so CSS/min-size rules can take over
                if (!win.classList.contains('fixed-window')) {
                    win.style.removeProperty('width');
                    win.style.removeProperty('height');
                }
            }
            onMouseUp(e);
        });
        
        // Close button
        win.querySelector('.close').addEventListener('click', () => {
            win.remove();
        });

        // When clicking anywhere on the window bring to front
        win.addEventListener('mousedown', () => {
            win.style.zIndex = ++windowZIndex;
            document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
            win.classList.add('focused');
        });
    }
    
    // --- Security Challenge (Quiz/Game) ---
    function securityChallenge() {
        const questions = [
            { q: "Initial Reconnaissance: What is the codename of my project for hiding files in images?", a: "harpocrates" },
            { q: "Privilege Escalation: I often say, 'I use ______, btw'. What distro is it?", a: "archlinux" },
            { q: "Final Payload: What tool do I use to turn ASCII art into music?", a: "ascii2mid" }
        ];
        let currentQuestion = 0;
        
        printToTerminal(`
<span style="color:var(--yellow)">SECURITY CHALLENGE INITIATED</span>
To access contact details, please answer the following questions.
        `);
        askQuestion();

        function askQuestion() {
            if (currentQuestion < questions.length) {
                printToTerminal(`<b>Question ${currentQuestion + 1}:</b> ${questions[currentQuestion].q}`);
                commandInput.dataset.mode = 'quiz';
            } else {
                grantAccess();
            }
        }
        
        function checkAnswer(answer) {
            if (answer.toLowerCase() === questions[currentQuestion].a) {
                printToTerminal(`<span style="color:var(--green)">Correct!</span>`);
                currentQuestion++;
                askQuestion();
            } else {
                printToTerminal(`<span style="color:var(--red)">Access Denied. Incorrect answer. Challenge resetting...</span>`);
                commandInput.dataset.mode = 'normal';
            }
        }

        function grantAccess() {
             const content = `
                <h2>📫 Access Granted!</h2>
                <p>Congratulations, you've passed the challenge.</p>
                <ul>
                    <li><strong>Email:</strong> <a href="mailto:chafiq.dev@gmail.com">chafiq.dev@gmail.com</a></li>
                    <li><strong>Facebook:</strong> <a href="https://facebook.com/piratheon" target="_blank">/piratheon</a></li>
                    <li><strong>GitHub:</strong> <a href="https://github.com/piratheon" target="_blank">@piratheon</a></li>
                    <li><strong>Instagram:</strong> <a href="https://instagram.com/piratheon" target="_blank">@piratheon</a></li>
                    <li><strong>Threads:</strong> <a href="https://threads.net/@piratheon" target="_blank">@piratheon</a></li>
                </ul>
            `;
            createWindow('contact.info', content);
            commandInput.dataset.mode = 'normal';
        }

        commandInput.addEventListener('keydown', function handleQuiz(e) {
            if (e.key === 'Enter' && commandInput.dataset.mode === 'quiz') {
                const answer = commandInput.value.trim();
                printToTerminal(`<span class="prompt"><span class="user">challenge@input</span><span class="tilde">~</span>$</span> ${answer}`, false);
                checkAnswer(answer);
                 if(commandInput.dataset.mode === 'normal') {
                    // remove this specific event listener once quiz is done
                    commandInput.removeEventListener('keydown', handleQuiz);
                }
            }
        });
    }

});
