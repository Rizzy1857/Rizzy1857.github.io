// js/nav.js — Navigation system with command bar
'use strict';

const Navigation = (() => {
    // Page routes
    const ROUTES = {
        'home': 'index.html',
        'index': 'index.html',
        'about': 'index.html',
        '/': 'index.html',
        'work': 'work.html',
        'projects': 'work.html',
        '/work': 'work.html',
        'experience': 'experience.html',
        'exp': 'experience.html',
        'resume': 'experience.html',
        '/exp': 'experience.html',
        'blog': 'blog.html',
        'log': 'blog.html',
        'posts': 'blog.html',
        '/log': 'blog.html',
        'contact': 'contact.html',
        'link': 'contact.html',
        '/link': 'contact.html'
    };

    // Keyboard shortcuts (1-5)
    const SHORTCUTS = {
        '1': 'index.html',
        '2': 'work.html',
        '3': 'experience.html',
        '4': 'blog.html',
        '5': 'contact.html'
    };

    // Command patterns
    const COMMANDS = [
        { pattern: /^cd\s+\/?([\w]+)/i, handler: (match) => navigate(match[1]) },
        { pattern: /^goto\s+([\w]+)/i, handler: (match) => navigate(match[1]) },
        { pattern: /^open\s+([\w]+)/i, handler: (match) => navigate(match[1]) },
        { pattern: /^ls$/i, handler: () => showHelp() },
        { pattern: /^help$/i, handler: () => showHelp() },
        { pattern: /^clear$/i, handler: () => clearInput() },
        { pattern: /^([\w]+)$/i, handler: (match) => navigate(match[1]) }
    ];

    let cmdInput = null;
    let cmdHint = null;

    const navigate = (target) => {
        const route = ROUTES[target.toLowerCase()];
        if (route) {
            // Add transition effect
            document.body.classList.add('navigating');
            setTimeout(() => {
                window.location.href = route;
            }, 150);
            return true;
        }
        return false;
    };

    const showHelp = () => {
        if (cmdHint) {
            cmdHint.textContent = 'Available: home, work, exp, log, link';
            setTimeout(() => resetHint(), 3000);
        }
        return true;
    };

    const clearInput = () => {
        if (cmdInput) {
            cmdInput.value = '';
        }
        return true;
    };

    const resetHint = () => {
        if (cmdHint) {
            cmdHint.innerHTML = 'Press <span class="cmdbar__key">1</span>-<span class="cmdbar__key">5</span> to navigate';
        }
    };

    const parseCommand = (input) => {
        const trimmed = input.trim();
        if (!trimmed) return false;

        for (const cmd of COMMANDS) {
            const match = trimmed.match(cmd.pattern);
            if (match) {
                return cmd.handler(match);
            }
        }

        // Unknown command
        if (cmdHint) {
            cmdHint.textContent = `Unknown: "${trimmed}"`;
            setTimeout(() => resetHint(), 2000);
        }
        return false;
    };

    const handleKeydown = (e) => {
        // Focus command bar on any alphanumeric key when not focused
        if (document.activeElement !== cmdInput &&
            e.key.length === 1 &&
            /[a-z0-9]/i.test(e.key) &&
            !e.ctrlKey && !e.metaKey && !e.altKey) {

            // Number shortcuts (1-5)
            if (SHORTCUTS[e.key]) {
                e.preventDefault();
                navigate(SHORTCUTS[e.key].replace('.html', ''));
                return;
            }

            // Focus and type
            if (cmdInput) {
                cmdInput.focus();
                // Let the key event propagate to type the character
            }
        }

        // Escape to blur
        if (e.key === 'Escape' && cmdInput) {
            cmdInput.blur();
            cmdInput.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cmdInput) {
            parseCommand(cmdInput.value);
            cmdInput.value = '';
        }
    };

    const setActivePage = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.dock__link');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('dock__link--active');
            } else {
                link.classList.remove('dock__link--active');
            }
        });
    };

    const init = () => {
        cmdInput = document.querySelector('.cmdbar__input');
        cmdHint = document.querySelector('.cmdbar__hint');
        const cmdForm = document.querySelector('.cmdbar');

        if (cmdForm && cmdInput) {
            cmdForm.addEventListener('submit', handleSubmit);
            cmdInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleSubmit(e);
                }
            });
        }

        document.addEventListener('keydown', handleKeydown);
        setActivePage();
    };

    return { init, navigate };
})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Navigation.init);
} else {
    Navigation.init();
}
