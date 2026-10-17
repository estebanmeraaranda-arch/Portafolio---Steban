class CvManager {
    constructor(storageService, notificationService) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.metaKey = AppConfig.STORAGE_KEYS.CV_META;

        this.downloadBtn = document.getElementById('download-cv-btn');
        this.quickUpdateBtn = document.getElementById('quick-update-cv-btn');
        this.cvFileInput = document.getElementById('cv-file-input');
        this.cvUrlInput = document.getElementById('cv-url-input');
        this.cvForm = document.getElementById('cv-form');
        this.cvStatusEl = document.getElementById('cv-current-status');

        this.isAdminActive = false;
    }

    init() {
        this.updateStatusUI();

        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', (event) => this.handleDownload(event));
        }

        if (this.quickUpdateBtn) {
            this.quickUpdateBtn.addEventListener('click', () => {
                const cvSection = document.getElementById('admin-cv-section');
                if (cvSection) {
                    cvSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (this.cvFileInput) {
                    this.cvFileInput.click();
                }
            });
        }

        if (this.cvFileInput) {
            this.cvFileInput.addEventListener('change', async () => {
                if (this.cvFileInput.files && this.cvFileInput.files[0]) {
                    await this.processAndSaveFile(this.cvFileInput.files[0]);
                }
            });
        }

        if (this.cvForm) {
            this.cvForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const file = this.cvFileInput?.files?.[0];
                const urlValue = this.cvUrlInput?.value.trim() || '';

                if (file) {
                    await this.processAndSaveFile(file);
                    this.cvFileInput.value = '';
                    return;
                }

                if (urlValue) {
                    this.storage.setJSON(this.metaKey, {
                        type: 'url',
                        url: urlValue,
                        fileName: urlValue.split('/').pop() || 'Hoja_de_Vida_Steban_Gomez.pdf',
                        updatedAt: new Date().toISOString()
                    });
                    this.updateStatusUI();
                    this.notifier.show('✓ Enlace de Hoja de Vida actualizado correctamente.');
                    return;
                }

                alert('Selecciona un archivo PDF/DOC de tu equipo o escribe un enlace/ruta para la Hoja de Vida.');
            });
        }
    }

    getMeta() {
        return this.storage.getJSON(this.metaKey, null);
    }

    updateStatusUI() {
        if (!this.cvStatusEl) return;

        const meta = this.getMeta();
        if (!meta) {
            this.cvStatusEl.textContent = 'Archivo actual: No configurado (sube un archivo PDF/DOC o ingresa un enlace)';
            return;
        }

        if (meta.type === 'file') {
            this.cvStatusEl.textContent = `Archivo actual cargado: ${meta.fileName}`;
        } else if (meta.type === 'url') {
            this.cvStatusEl.textContent = `Enlace/Ruta actual: ${meta.url}`;
            if (this.cvUrlInput && !this.cvUrlInput.value) {
                this.cvUrlInput.value = meta.url;
            }
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    async processAndSaveFile(file) {
        const dataUrl = await this.readFileAsDataURL(file);
        const payload = {
            fileName: file.name,
            fileType: file.type || 'application/pdf',
            dataUrl,
            updatedAt: new Date().toISOString()
        };

        try {
            await this.storage.saveCvFile(payload);
            this.storage.setJSON(this.metaKey, {
                type: 'file',
                fileName: file.name,
                updatedAt: payload.updatedAt
            });
        } catch (error) {
            this.storage.setJSON(this.metaKey, {
                type: 'file',
                fileName: file.name,
                fallbackDataUrl: dataUrl,
                updatedAt: payload.updatedAt
            });
        }

        this.updateStatusUI();
        this.notifier.show(`✓ Hoja de Vida actualizada: ${file.name}`);
    }

    async handleDownload(event) {
        if (this.isAdminActive) {
            return;
        }
        event.preventDefault();

        const meta = this.getMeta();
        if (!meta) {
            alert('La Hoja de Vida aún no ha sido cargada. Entra al modo administrador para subir el archivo del CV.');
            return;
        }

        if (meta.type === 'url' && meta.url) {
            const link = document.createElement('a');
            link.href = meta.url;
            link.target = '_blank';
            link.rel = 'noopener';
            if (!meta.url.startsWith('http')) {
                link.download = meta.fileName || 'Hoja_de_Vida_Steban_Gomez.pdf';
            }
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }

        if (meta.type === 'file') {
            try {
                const stored = await this.storage.getCvFile();
                if (stored && stored.dataUrl) {
                    const link = document.createElement('a');
                    link.href = stored.dataUrl;
                    link.download = stored.fileName || meta.fileName || 'Hoja_de_Vida_Steban_Gomez.pdf';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    return;
                }
            } catch (error) {
                console.warn('Error leyendo CV de IndexedDB:', error);
            }

            if (meta.fallbackDataUrl) {
                const link = document.createElement('a');
                link.href = meta.fallbackDataUrl;
                link.download = meta.fileName || 'Hoja_de_Vida_Steban_Gomez.pdf';
                document.body.appendChild(link);
                link.click();
                link.remove();
                return;
            }
        }

        alert('No se pudo encontrar el archivo de la Hoja de Vida. Por favor actualízalo desde el Modo Admin.');
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        if (this.quickUpdateBtn) {
            this.quickUpdateBtn.classList.toggle('hidden', !isActive);
        }
    }
}
