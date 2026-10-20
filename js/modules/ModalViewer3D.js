class ModalViewer3D {
    constructor({ onSaveDescription }) {
        this.modal = document.getElementById('modal-3d');
        this.modalViewer = document.getElementById('modal-viewer');
        this.modalIframe = document.getElementById('modal-iframe');
        this.modalImageFallback = document.getElementById('modal-image-fallback');
        this.modalTitle = document.getElementById('modal-title');
        this.modalHint = document.getElementById('modal-hint');
        this.modalClose = document.getElementById('modal-close');
        this.modalDesc = document.getElementById('modal-description');
        this.modalAdminEditor = document.getElementById('modal-admin-desc-editor');
        this.modalDescTextarea = document.getElementById('modal-desc-textarea');
        this.modalSaveDescBtn = document.getElementById('modal-save-desc-btn');

        this.onSaveDescription = onSaveDescription;
        this.currentProjectName = null;
        this.currentProject = null;
        this.isAdminActive = false;
    }

    init() {
        if (!this.modal) return;

        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.close());
        }

        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        // Fallback automático a la imagen render si el archivo .glb no existe o falla al cargar
        if (this.modalViewer) {
            this.modalViewer.addEventListener('error', () => {
                if (this.currentProject && this.currentProject.image) {
                    this.showImageFallback(this.currentProject);
                }
            });
        }

        if (this.modalSaveDescBtn) {
            this.modalSaveDescBtn.addEventListener('click', () => {
                if (!this.currentProjectName || typeof this.onSaveDescription !== 'function') return;
                const newDescription = this.modalDescTextarea ? this.modalDescTextarea.value.trim() : '';
                this.onSaveDescription(this.currentProjectName, newDescription);
            });
        }
    }

    showImageFallback(project) {
        if (this.modalViewer) {
            this.modalViewer.style.display = 'none';
            this.modalViewer.removeAttribute('src');
        }
        if (this.modalIframe) {
            this.modalIframe.style.display = 'none';
            this.modalIframe.setAttribute('src', '');
        }
        if (this.modalImageFallback) {
            this.modalImageFallback.src = project.image;
            this.modalImageFallback.alt = project.name;
            this.modalImageFallback.style.display = 'block';
        }
        if (this.modalHint) {
            this.modalHint.textContent = 'Render de alta resolución del proyecto';
        }
    }

    open(project) {
        if (!this.modal || !project) return;

        this.currentProject = project;
        this.currentProjectName = project.name;
        if (this.modalTitle) {
            this.modalTitle.textContent = project.name;
        }

        this.updateDescriptionView(project);

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (project.embedType === 'sketchfab' && project.embedUrl) {
            if (this.modalViewer) this.modalViewer.style.display = 'none';
            if (this.modalImageFallback) this.modalImageFallback.style.display = 'none';
            if (this.modalIframe) {
                this.modalIframe.style.display = 'block';
                this.modalIframe.setAttribute('src', project.embedUrl);
            }
            if (this.modalHint) {
                this.modalHint.textContent = 'Arrastra para rotar · usa la rueda para acercar · explora cada detalle del modelo';
            }
        } else if (project.model) {
            if (this.modalIframe) {
                this.modalIframe.style.display = 'none';
                this.modalIframe.setAttribute('src', '');
            }
            if (this.modalImageFallback) this.modalImageFallback.style.display = 'none';
            if (this.modalViewer) {
                this.modalViewer.style.display = 'block';
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.modalViewer.setAttribute('src', project.model);
                    }, 100);
                });
            }
            if (this.modalHint) {
                this.modalHint.textContent = 'Arrastra para rotar · usa la rueda para acercar · explora cada detalle del modelo';
            }
        } else {
            this.showImageFallback(project);
        }
    }

    updateDescriptionView(project) {
        if (this.modalDesc) {
            const descText = (project.description || '').trim();
            this.modalDesc.textContent = descText || 'Sin descripción adicional registrada para este proyecto.';
        }
        if (this.modalAdminEditor) {
            this.modalAdminEditor.classList.toggle('hidden', !this.isAdminActive);
        }
        if (this.modalDescTextarea) {
            this.modalDescTextarea.value = project.description || '';
        }
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        if (this.modalAdminEditor) {
            this.modalAdminEditor.classList.toggle('hidden', !isActive);
        }
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentProjectName = null;
        this.currentProject = null;

        setTimeout(() => {
            if (this.modalViewer) {
                this.modalViewer.removeAttribute('src');
                this.modalViewer.style.display = 'block';
                this.modalViewer.cameraOrbit = 'auto auto auto';
                this.modalViewer.fieldOfView = 'auto';
            }
            if (this.modalIframe) {
                this.modalIframe.setAttribute('src', '');
                this.modalIframe.style.display = 'none';
            }
            if (this.modalImageFallback) {
                this.modalImageFallback.src = '';
                this.modalImageFallback.style.display = 'none';
            }
        }, 500);
    }
}
