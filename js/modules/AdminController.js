class AdminController {
    constructor({
        storageService,
        notificationService,
        projectManager,
        textEditorManager,
        linkEditorManager,
        cvManager
    }) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.projectManager = projectManager;
        this.textEditorManager = textEditorManager;
        this.linkEditorManager = linkEditorManager;
        this.cvManager = cvManager;

        this.sessionKey = AppConfig.STORAGE_KEYS.ADMIN_SESSION;
        this.defaultPassword = AppConfig.DEFAULT_PASSWORD;

        this.privilegedToggle = document.getElementById('privileged-toggle');
        this.privilegedModal = document.getElementById('privileged-modal');
        this.privilegedPassword = document.getElementById('privileged-password');
        this.accessPrivilegedBtn = document.getElementById('access-privileged');
        this.closePrivilegedBtn = document.getElementById('close-privileged-modal');
        this.adminPanel = document.getElementById('admin-panel');
        this.logoutPrivilegedBtn = document.getElementById('logout-privileged');

        this.floatingBar = null;
        this.isAdminActive = false;
    }

    init() {
        this.floatingBar = this.createFloatingBar();
        this.bindEvents();

        const wasActive = this.storage.getSession(this.sessionKey) === 'true';
        this.setAdminMode(wasActive);
        this.closeModal();
    }

    createFloatingBar() {
        let bar = document.getElementById('admin-floating-bar');
        if (bar) return bar;

        const hasCvSection = Boolean(document.getElementById('admin-cv-section'));

        bar = document.createElement('div');
        bar.id = 'admin-floating-bar';
        bar.className = 'admin-floating-bar hidden';
        bar.innerHTML = `
            <div class="admin-floating-status">
                <span class="admin-status-dot"></span>
                <span><strong>Modo Admin:</strong> Haz clic en cualquier texto o enlace para editarlo</span>
            </div>
            <div class="admin-floating-actions">
                <button type="button" id="floating-save-texts-btn" class="btn-primary admin-floating-btn">💾 Guardar cambios</button>
                ${hasCvSection ? '<button type="button" id="floating-cv-btn" class="ghost-button admin-floating-btn">📄 Subir CV</button>' : ''}
                <button type="button" id="floating-logout-btn" class="ghost-button admin-floating-btn">Salir</button>
            </div>
        `;
        document.body.appendChild(bar);

        document.getElementById('floating-save-texts-btn')?.addEventListener('click', () => {
            this.textEditorManager.saveAll(true);
        });

        document.getElementById('floating-cv-btn')?.addEventListener('click', () => {
            const cvSection = document.getElementById('admin-cv-section');
            const cvFileInput = document.getElementById('cv-file-input');
            if (cvSection) {
                cvSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (cvFileInput) {
                cvFileInput.click();
            }
        });

        document.getElementById('floating-logout-btn')?.addEventListener('click', async () => {
            this.textEditorManager.saveAll(false);
            await this.storage.signOutAdmin?.();
            this.setAdminMode(false);
            this.notifier.show('🔒 Sesión de administrador cerrada.');
        });

        return bar;
    }

    bindEvents() {
        if (this.privilegedToggle) {
            this.privilegedToggle.addEventListener('click', () => {
                if (this.isAdminActive) {
                    if (this.adminPanel) {
                        this.adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    return;
                }
                const isOpen = this.privilegedModal && !this.privilegedModal.classList.contains('hidden');
                if (isOpen) {
                    this.closeModal();
                } else {
                    this.openModal();
                }
            });
        }

        if (this.closePrivilegedBtn) {
            this.closePrivilegedBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.accessPrivilegedBtn && this.privilegedPassword) {
            this.accessPrivilegedBtn.addEventListener('click', () => this.attemptLogin());
            this.privilegedPassword.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.attemptLogin();
                }
            });
        }

        if (this.logoutPrivilegedBtn) {
            this.logoutPrivilegedBtn.addEventListener('click', async () => {
                this.textEditorManager.saveAll(false);
                await this.storage.signOutAdmin?.();
                this.setAdminMode(false);
                this.notifier.show('🔒 Sesión de administrador cerrada.');
            });
        }
    }

    async attemptLogin() {
        if (!this.privilegedPassword) return;
        const password = this.privilegedPassword.value;
        const emailInput = document.getElementById('privileged-email');
        const email = emailInput?.value?.trim() || AppConfig.SUPABASE?.ADMIN_EMAIL || 'stebangomezlopez1224@gmail.com';

        // 1. Intentar autenticar contra Supabase Auth (para políticas RLS de escritura)
        if (typeof this.storage.signInAdmin === 'function') {
            const authResult = await this.storage.signInAdmin(email, password);
            if (authResult.ok) {
                this.setAdminMode(true);
                this.closeModal();
                this.notifier.show('🔓 Modo Admin (Supabase Cloud) activado.');
                await this.storage.seedProjectsIfEmpty?.(this.projectManager.loadProjects());
                return;
            }
        }

        // 2. Respaldo con contraseña maestra local
        if (password === this.defaultPassword) {
            this.setAdminMode(true);
            this.closeModal();
            this.notifier.show('🔓 Modo Admin activado. Puedes editar textos, enlaces, proyectos y CV.');
        } else {
            alert('Credenciales o contraseña incorrecta.');
        }
    }

    openModal() {
        if (!this.privilegedModal) return;
        this.privilegedModal.classList.remove('hidden');
        this.privilegedModal.setAttribute('aria-hidden', 'false');
        this.privilegedPassword?.focus();
    }

    closeModal() {
        if (!this.privilegedModal) return;
        this.privilegedModal.classList.add('hidden');
        this.privilegedModal.setAttribute('aria-hidden', 'true');
        if (this.privilegedPassword) {
            this.privilegedPassword.value = '';
        }
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        this.storage.setSession(this.sessionKey, isActive ? 'true' : 'false');
        document.body.classList.toggle('admin-mode-active', isActive);

        if (this.adminPanel) {
            this.adminPanel.classList.toggle('hidden', !isActive);
        }
        if (this.floatingBar) {
            this.floatingBar.classList.toggle('hidden', !isActive);
        }
        if (this.privilegedToggle) {
            this.privilegedToggle.classList.toggle('active', isActive);
            this.privilegedToggle.setAttribute(
                'aria-label',
                isActive ? 'Ir al panel de modo privilegiado' : 'Abrir modo privilegiado'
            );
        }

        this.projectManager.setAdminMode(isActive);
        this.textEditorManager.setAdminMode(isActive);
        this.linkEditorManager.setAdminMode(isActive);
        this.cvManager.setAdminMode(isActive);
    }
}
