class TextEditorManager {
    constructor(storageService, notificationService) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.storageKey = AppConfig.STORAGE_KEYS.TEXTS;
        this.originalTextsMap = new Map();
        this.isAdminActive = false;
    }

    getPageId() {
        if (document.querySelector('.about-hero') || window.location.pathname.toLowerCase().includes('sobre-mi')) {
            return 'about';
        }
        return 'index';
    }

    prepareLogoTextContainers() {
        document.querySelectorAll('.logo-text').forEach((logoText) => {
            Array.from(logoText.childNodes).forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    const span = document.createElement('span');
                    span.className = 'logo-main-name';
                    span.textContent = node.textContent.trim();
                    logoText.replaceChild(span, node);
                }
            });
        });
    }

    init() {
        this.prepareLogoTextContainers();

        const pageId = this.getPageId();
        const selectors = [
            '.logo-main-name',
            '.logo-text span:not(.logo-main-name)',
            '.nav-links a:not(.btn-contact)',
            '.hero-badge',
            '.hero-tag',
            '.hero h1',
            '.hero-content > p',
            '[data-editable]',
            '.about-card h2',
            '.about-card p',
            '.skills-card h2',
            '.software-grid .software-item',
            '.projects-header h2',
            '.projects-subtitle',
            '.filter-btn',
            '.about-hero h1',
            '.about-lead',
            '.about-main-card h2',
            '.about-main-card p',
            '.process-list li',
            '.section-title-center h2',
            '.section-title-center p',
            '.software-card h3',
            '.software-card p',
            'footer .footer-desc',
            'footer .footer-location',
            'footer .footer-col h4',
            'footer .footer-col ul a',
            'footer .contact-col > p',
            'footer .footer-bottom p'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));
        const saved = this.storage.getJSON(this.storageKey, {});

        elements.forEach((el, idx) => {
            if (
                el.closest('#admin-panel') ||
                el.closest('#privileged-modal') ||
                el.closest('#modal-3d') ||
                el.closest('.project-card') ||
                el.id === 'quick-update-cv-btn'
            ) {
                return;
            }

            const key = el.getAttribute('data-editable') || `${pageId}.editable.${idx}.${el.tagName.toLowerCase()}`;
            el.setAttribute('data-editable-key', key);

            if (!this.originalTextsMap.has(key)) {
                this.originalTextsMap.set(key, el.innerHTML);
            }

            if (saved[key] !== undefined) {
                el.innerHTML = saved[key];
            }

            el.addEventListener('blur', () => {
                if (this.isAdminActive) {
                    this.saveAll(false);
                }
            });

            el.addEventListener('click', (event) => {
                if (!this.isAdminActive) return;
                const anchor = el.closest('a');
                if (anchor) {
                    event.preventDefault();
                }
            });
        });

        const saveBtn = document.getElementById('save-all-texts-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAll(true));
        }

        const resetBtn = document.getElementById('reset-texts-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAll());
        }
    }

    saveAll(showNotification = true) {
        const saved = this.storage.getJSON(this.storageKey, {});
        const editables = document.querySelectorAll('[data-editable-key]');

        editables.forEach((el) => {
            const key = el.getAttribute('data-editable-key');
            if (key) {
                saved[key] = el.innerHTML;
            }
        });

        const ok = this.storage.setJSON(this.storageKey, saved);
        if (ok && showNotification) {
            this.notifier.show('✓ Cambios de texto guardados correctamente.');
        }
    }

    resetAll() {
        if (!confirm('¿Deseas restaurar todos los textos de esta página a su versión original?')) {
            return;
        }
        const saved = this.storage.getJSON(this.storageKey, {});
        this.originalTextsMap.forEach((originalHtml, key) => {
            delete saved[key];
            const el = document.querySelector(`[data-editable-key="${CSS.escape(key)}"]`);
            if (el) {
                el.innerHTML = originalHtml;
            }
        });

        this.storage.setJSON(this.storageKey, saved);
        this.notifier.show('↺ Textos restaurados a su versión original.');
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        const editables = document.querySelectorAll('[data-editable-key]');
        editables.forEach((el) => {
            if (isActive) {
                el.setAttribute('contenteditable', 'true');
                el.classList.add('admin-editable-element');
                el.setAttribute('title', 'Modo Admin: Haz clic para editar este texto');
            } else {
                el.removeAttribute('contenteditable');
                el.classList.remove('admin-editable-element');
                el.removeAttribute('title');
            }
        });
    }
}
