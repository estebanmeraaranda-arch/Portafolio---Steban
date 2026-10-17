class ProjectManager {
    constructor(storageService, notificationService) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.storageKey = AppConfig.STORAGE_KEYS.PROJECTS;
        this.defaultProjects = AppConfig.DEFAULT_PROJECTS;

        this.gridContainer = document.querySelector('.projects-grid');
        this.projectForm = document.getElementById('project-form');
        this.cancelEditBtn = document.getElementById('project-cancel-edit');
        this.submitBtn = document.getElementById('project-submit-btn');
        this.formTitle = document.getElementById('project-form-title');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        this.isAdminActive = false;
        this.modalViewer = new ModalViewer3D({
            onSaveDescription: (projectName, newDescription) => {
                this.updateProjectDescription(projectName, newDescription);
            }
        });
    }

    init() {
        this.modalViewer.init();
        this.bindFilterEvents();
        this.bindFormEvents();

        if (this.gridContainer) {
            const projects = this.loadProjects();
            this.renderProjects(projects);
            this.applyFilter('todas');
        }
    }

    loadProjects() {
        const stored = this.storage.getJSON(this.storageKey, null);
        if (!Array.isArray(stored) || stored.length === 0) {
            this.storage.setJSON(this.storageKey, this.defaultProjects);
            return [...this.defaultProjects];
        }

        let updatedCache = false;
        stored.forEach((proj) => {
            if (proj.image && proj.image.includes('Assets/Renders/Renders/')) {
                proj.image = proj.image.replace('Assets/Renders/Renders/', 'Assets/Renders/');
                updatedCache = true;
            }
            if (proj.description === undefined) {
                const match = this.defaultProjects.find((d) => d.name === proj.name);
                proj.description = match ? match.description : '';
                updatedCache = true;
            }
        });

        if (updatedCache) {
            this.storage.setJSON(this.storageKey, stored);
        }

        return stored;
    }

    saveProjects(projects) {
        this.storage.setJSON(this.storageKey, projects);
    }

    updateProjectDescription(projectName, newDescription) {
        const projects = this.loadProjects();
        const index = projects.findIndex((p) => p.name === projectName);
        if (index < 0) return;

        projects[index].description = newDescription;
        this.saveProjects(projects);
        this.modalViewer.updateDescriptionView(projects[index]);
        this.renderProjects(projects);
        this.applyFilter(this.getActiveFilter());
        this.notifier.show('✓ Descripción del proyecto actualizada.');
    }

    getActiveFilter() {
        return document.querySelector('.filter-btn.active')?.dataset.filter || 'todas';
    }

    bindFilterEvents() {
        this.filterBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                this.applyFilter(btn.dataset.filter);
            });
        });
    }

    bindFormEvents() {
        if (this.cancelEditBtn) {
            this.cancelEditBtn.addEventListener('click', () => this.resetFormEditingState());
        }

        if (!this.projectForm) return;

        this.projectForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const projectName = document.getElementById('project-name')?.value.trim() || '';
            const projectCategory = document.getElementById('project-category')?.value || 'otros';
            const projectImage = document.getElementById('project-image')?.value.trim() || '';
            const projectModel = document.getElementById('project-model')?.value.trim() || '';
            const projectDescription = document.getElementById('project-description')?.value.trim() || '';

            if (!projectName || !projectCategory || !projectImage) {
                alert('Completa el nombre, categoría e imagen del proyecto.');
                return;
            }

            const projects = this.loadProjects();
            const editingName = this.projectForm.dataset.editingId;

            if (editingName) {
                const index = projects.findIndex((project) => project.name === editingName);
                if (index >= 0) {
                    projects[index] = {
                        ...projects[index],
                        name: projectName,
                        category: projectCategory,
                        image: projectImage,
                        model: projectModel || '',
                        description: projectDescription
                    };
                }
                this.notifier.show('✓ Proyecto actualizado correctamente.');
            } else {
                projects.unshift({
                    name: projectName,
                    category: projectCategory,
                    image: projectImage,
                    model: projectModel || '',
                    description: projectDescription
                });
                this.notifier.show('✓ Nuevo proyecto agregado.');
            }

            this.saveProjects(projects);
            this.renderProjects(projects);
            this.applyFilter(this.getActiveFilter());
            this.resetFormEditingState();
        });
    }

    resetFormEditingState() {
        if (!this.projectForm) return;
        this.projectForm.reset();
        delete this.projectForm.dataset.editingId;
        if (this.submitBtn) this.submitBtn.textContent = 'Agregar proyecto';
        if (this.cancelEditBtn) this.cancelEditBtn.classList.add('hidden');
        if (this.formTitle) this.formTitle.textContent = 'Agregar / Editar Proyecto';
    }

    populateFormForEdit(project) {
        if (!this.projectForm) return;
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-image').value = project.image;
        document.getElementById('project-model').value = project.model || '';
        const descInput = document.getElementById('project-description');
        if (descInput) {
            descInput.value = project.description || '';
        }

        this.projectForm.dataset.editingId = project.name;
        if (this.submitBtn) this.submitBtn.textContent = 'Guardar cambios del proyecto';
        if (this.cancelEditBtn) this.cancelEditBtn.classList.remove('hidden');
        if (this.formTitle) this.formTitle.textContent = `Editando proyecto: ${project.name}`;

        this.projectForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('project-name').focus();
    }

    deleteProject(projectName) {
        const projectsList = this.loadProjects();
        const updated = projectsList.filter((item) => item.name !== projectName);
        this.saveProjects(updated);
        this.renderProjects(updated);
        this.applyFilter(this.getActiveFilter());
        this.notifier.show('🗑️ Proyecto eliminado.');
    }

    renderProjects(projects) {
        if (!this.gridContainer) return;
        this.gridContainer.innerHTML = '';

        projects.forEach((project) => {
            const card = document.createElement('article');
            card.className = 'project-card';
            if (this.isAdminActive) {
                card.classList.add('privileged');
            }
            card.dataset.category = project.category;
            card.dataset.src = project.model || '';
            card.dataset.name = project.name;
            if (project.embedType) card.dataset.embed = project.embedType;
            if (project.embedUrl) card.dataset.embedUrl = project.embedUrl;

            const adminActions = document.createElement('div');
            adminActions.className = 'project-admin-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'project-admin-btn edit';
            editBtn.textContent = 'Editar';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'project-admin-btn delete';
            deleteBtn.textContent = 'Eliminar';

            adminActions.appendChild(editBtn);
            adminActions.appendChild(deleteBtn);

            const preview = document.createElement('div');
            preview.className = 'card-preview';

            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.name;
            img.className = 'card-render-img';
            img.loading = 'lazy';

            const badge = document.createElement('span');
            badge.className = 'card-3d-badge';
            badge.textContent = project.model || project.embedUrl ? '3D' : 'IMG';

            preview.appendChild(img);
            preview.appendChild(badge);

            const info = document.createElement('div');
            info.className = 'project-info';

            const tag = document.createElement('span');
            tag.className = 'project-tag';
            tag.textContent = project.category;

            const title = document.createElement('h3');
            title.textContent = project.name;

            info.appendChild(tag);
            info.appendChild(title);

            if (project.description) {
                const shortDesc = document.createElement('p');
                shortDesc.className = 'project-card-desc';
                shortDesc.textContent = project.description;
                info.appendChild(shortDesc);
            }

            card.appendChild(adminActions);
            card.appendChild(preview);
            card.appendChild(info);

            card.addEventListener('click', (event) => {
                if (event.target.closest('.project-admin-btn')) return;
                const latestProjects = this.loadProjects();
                const currentProj = latestProjects.find((p) => p.name === project.name) || project;
                this.modalViewer.open(currentProj);
            });

            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.populateFormForEdit(project);
            });

            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.deleteProject(project.name);
            });

            this.gridContainer.appendChild(card);
        });
    }

    applyFilter(filter) {
        const cards = document.querySelectorAll('.project-card');
        if (!cards.length) return;

        cards.forEach((card) => {
            card.classList.add('fade-out');
        });

        setTimeout(() => {
            cards.forEach((card) => {
                const category = card.dataset.category;
                const shouldShow = filter === 'todas' || category === filter;
                if (shouldShow) {
                    card.classList.remove('hidden', 'fade-out');
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('fade-out');
                }
            });
        }, 300);
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        this.modalViewer.setAdminMode(isActive);
        document.querySelectorAll('.project-card').forEach((card) => {
            card.classList.toggle('privileged', isActive);
        });
    }
}
