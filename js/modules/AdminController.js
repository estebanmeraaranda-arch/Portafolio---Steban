class AdminController {
    constructor({
        storageService,
        notificationService,
        projectManager,
        textEditorManager,
        linkEditorManager,
        cvManager,
        softwareManager
    }) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.projectManager = projectManager;
        this.textEditorManager = textEditorManager;
        this.linkEditorManager = linkEditorManager;
        this.cvManager = cvManager;
        this.softwareManager = softwareManager;

        this.sessionKey = AppConfig.STORAGE_KEYS.ADMIN_SESSION;
        this.defaultPassword = AppConfig.DEFAULT_PASSWORD;

        this.privilegedToggle = document.getElementById('privileged-toggle');
        this.privilegedModal = document.getElementById('privileged-modal');
        this.privilegedPassword = document.getElementById('privileged-password');
        this.accessPrivilegedBtn = document.getElementById('access-privileged');
        this.closePrivilegedBtn = document.getElementById('close-privileged-modal');
        this.adminPanel = document.getElementById('admin-panel');
        this.logoutPrivilegedBtn = document.getElementById('logout-privileged');

        this.forgotPassLink = document.getElementById('forgot-password-link');
        this.backToLoginBtn = document.getElementById('back-to-login-btn');
        this.sendRecoveryBtn = document.getElementById('send-recovery-btn');
        this.recoveryEmailInput = document.getElementById('recovery-email-input');

        this.loginView = document.getElementById('privileged-login-view');
        this.forgotView = document.getElementById('privileged-forgot-view');
        this.resetView = document.getElementById('privileged-reset-view');
        this.saveNewPassModalBtn = document.getElementById('save-new-pass-modal-btn');
        this.newPassModalInput = document.getElementById('new-pass-modal-input');
        this.confirmPassModalInput = document.getElementById('confirm-pass-modal-input');

        this.changePasswordForm = document.getElementById('change-password-form');

        this.floatingBar = null;
        this.isAdminActive = false;
    }

    init() {
        this.floatingBar = this.createFloatingBar();
        this.bindEvents();

        const wasActive = this.storage.getSession(this.sessionKey) === 'true';
        this.setAdminMode(wasActive);
        this.closeModal();

        // Detectar si el cliente abrió el enlace de recuperación enviado a su correo
        this.storage.onPasswordRecovery?.(() => {
            this.openRecoveryResetModal();
        });

        if (window.location.hash && window.location.hash.includes('type=recovery')) {
            setTimeout(() => this.openRecoveryResetModal(), 400);
        }
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
                <button type="button" id="floating-save-texts-btn" class="btn-primary admin-floating-btn">Guardar cambios</button>
                ${hasCvSection ? '<button type="button" id="floating-cv-btn" class="ghost-button admin-floating-btn">Subir CV</button>' : ''}
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
            this.notifier.show('Sesión de administrador cerrada.');
        });

        return bar;
    }

    showModalSubView(viewName) {
        if (this.loginView) this.loginView.classList.toggle('hidden', viewName !== 'login');
        if (this.forgotView) this.forgotView.classList.toggle('hidden', viewName !== 'forgot');
        if (this.resetView) this.resetView.classList.toggle('hidden', viewName !== 'reset');
    }

    openRecoveryResetModal() {
        if (!this.privilegedModal) return;
        this.showModalSubView('reset');
        this.privilegedModal.classList.remove('hidden');
        this.privilegedModal.setAttribute('aria-hidden', 'false');
        this.newPassModalInput?.focus();
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

        // Vista "¿Olvidaste tu contraseña?"
        if (this.forgotPassLink) {
            this.forgotPassLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.recoveryEmailInput && !this.recoveryEmailInput.value) {
                    this.recoveryEmailInput.value = AppConfig.SUPABASE?.ADMIN_EMAIL || 'stebangomezlopez1224@gmail.com';
                }
                this.showModalSubView('forgot');
            });
        }

        if (this.backToLoginBtn) {
            this.backToLoginBtn.addEventListener('click', () => {
                this.showModalSubView('login');
            });
        }

        if (this.sendRecoveryBtn) {
            this.sendRecoveryBtn.addEventListener('click', async () => {
                const email =
                    this.recoveryEmailInput?.value?.trim() ||
                    AppConfig.SUPABASE?.ADMIN_EMAIL ||
                    'stebangomezlopez1224@gmail.com';

                this.sendRecoveryBtn.disabled = true;
                this.sendRecoveryBtn.textContent = 'Enviando enlace...';

                const result = await this.storage.sendPasswordRecoveryEmail(email);

                this.sendRecoveryBtn.disabled = false;
                this.sendRecoveryBtn.textContent = 'Enviar enlace al correo';

                if (result.ok) {
                    this.notifier.show(`Enlace de recuperación enviado a ${email}`);
                    alert(
                        `Se ha enviado un enlace de recuperación a ${email}.\n\nAl abrir el enlace desde el correo podrás definir tu nueva contraseña de administrador.`
                    );
                    this.closeModal();
                } else {
                    alert(`No se pudo enviar el correo: ${result.error}`);
                }
            });
        }

        // Guardar nueva contraseña cuando regresa desde el enlace del correo (PASSWORD_RECOVERY)
        if (this.saveNewPassModalBtn) {
            this.saveNewPassModalBtn.addEventListener('click', async () => {
                const newPass = this.newPassModalInput?.value?.trim() || '';
                const confirmPass = this.confirmPassModalInput?.value?.trim() || '';

                if (newPass.length < 6) {
                    alert('La nueva contraseña debe tener mínimo 6 caracteres.');
                    return;
                }
                if (newPass !== confirmPass) {
                    alert('Las contraseñas no coinciden.');
                    return;
                }

                const res = await this.storage.updateAdminPassword(newPass);
                if (res.ok) {
                    this.setAdminMode(true);
                    this.closeModal();
                    if (window.location.hash.includes('type=recovery')) {
                        history.replaceState(null, '', window.location.pathname);
                    }
                    this.notifier.show('Contraseña actualizada y Modo Admin activado.');
                } else {
                    alert(res.error || 'No se pudo actualizar la contraseña.');
                }
            });
        }

        // Formulario de cambio de contraseña dentro del Panel Admin
        if (this.changePasswordForm) {
            this.changePasswordForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const currentInput = document.getElementById('admin-current-pass');
                const newInput = document.getElementById('admin-new-pass');
                const confirmInput = document.getElementById('admin-confirm-pass');

                const currentVal = currentInput?.value || '';
                const newVal = newInput?.value?.trim() || '';
                const confirmVal = confirmInput?.value?.trim() || '';

                const effectivePassword = this.storage.getEffectiveAdminPassword();
                if (currentVal !== effectivePassword) {
                    alert('La contraseña actual ingresada no es correcta.');
                    return;
                }
                if (newVal.length < 6) {
                    alert('La nueva contraseña debe tener al menos 6 caracteres.');
                    return;
                }
                if (newVal !== confirmVal) {
                    alert('La nueva contraseña y su confirmación no coinciden.');
                    return;
                }

                const res = await this.storage.updateAdminPassword(newVal);
                if (res.ok) {
                    this.changePasswordForm.reset();
                    this.notifier.show('Contraseña de administrador actualizada en la nube.');
                } else {
                    alert(res.error || 'Error actualizando la contraseña.');
                }
            });
        }

        if (this.logoutPrivilegedBtn) {
            this.logoutPrivilegedBtn.addEventListener('click', async () => {
                this.textEditorManager.saveAll(false);
                await this.storage.signOutAdmin?.();
                this.setAdminMode(false);
                this.notifier.show('Sesión de administrador cerrada.');
            });
        }
    }

    async attemptLogin() {
        if (!this.privilegedPassword) return;
        const password = this.privilegedPassword.value;
        const email = AppConfig.SUPABASE?.ADMIN_EMAIL || 'stebangomezlopez1224@gmail.com';
        const effectivePassword = this.storage.getEffectiveAdminPassword();

        // 1. Verificar contra la contraseña vigente sincronizada en la nube (o por defecto hasta que se cambie)
        if (password === effectivePassword) {
            // Intentar iniciar sesión silenciosamente en Supabase Auth
            await this.storage.signInAdmin?.(email, password);
            this.setAdminMode(true);
            this.closeModal();
            this.notifier.show('Modo Admin activado.');
            await this.storage.seedProjectsIfEmpty?.(this.projectManager.loadProjects());
            return;
        }

        // 2. Verificar directamente contra Supabase Auth (por si se cambió por correo)
        if (typeof this.storage.signInAdmin === 'function') {
            const authResult = await this.storage.signInAdmin(email, password);
            if (authResult.ok) {
                this.storage.setJSON(AppConfig.STORAGE_KEYS.ADMIN_PASSWORD, password, { syncCloud: true });
                this.setAdminMode(true);
                this.closeModal();
                this.notifier.show('Modo Admin (Supabase Cloud) activado.');
                await this.storage.seedProjectsIfEmpty?.(this.projectManager.loadProjects());
                return;
            }
        }

        alert('Contraseña incorrecta.');
    }

    openModal() {
        if (!this.privilegedModal) return;
        this.showModalSubView('login');
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
        this.softwareManager?.setAdminMode(isActive);
    }
}
