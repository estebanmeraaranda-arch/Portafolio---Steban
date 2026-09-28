const DEFAULT_PASSWORD = 'steban2026';
const STORAGE_KEY = 'portfolio-privileged-projects-v6';

const defaultProjects = [
    {
        name: 'Balconera Fabuloso Energía Naranja',
        category: 'balconeras',
        image: 'Assets/Renders/Balconera Fabuloso Energia Naranja.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Balconera Fabuloso Energia Naranja/Balconera Fabuloso Energia Naranja.glb'
    },
    {
        name: 'Chimenea Axion Blue 7 en 1',
        category: 'chimeneas',
        image: 'Assets/Renders/Chimenea Axion Blue 7 en 1.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Chimenea Axion Blue 7 en 1/Chimenea Axion Blue 7 en 1.glb'
    },
    {
        name: 'Chimenea Axion Superioridad',
        category: 'chimeneas',
        image: 'Assets/Renders/Chimenea Axion Superioridad.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Chimenea Axion Superioridad/Chimenea Axion Superioridad.glb'
    },
    {
        name: 'Chimenea Suavitel BBRL',
        category: 'chimeneas',
        image: 'Assets/Renders/Chimenea Suavitel BBRL.png',
        model: '',
        embedType: 'sketchfab',
        embedUrl: 'https://sketchfab.com/models/6e229879b47e436b91c56335d22d4b53/embed'
    },
    {
        name: 'Columna Luminous White Color Correct',
        category: 'columnas',
        image: 'Assets/Renders/CARA COLUMNA LW Color Correct Sinú.682.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Columna Luminous White Color Correct Alameda del Sinú/Columna Luminous White Color Correct Alameda del Sinú.glb'
    },
    {
        name: 'Columna Suavitel & Fabuloso Avenida 6ta',
        category: 'columnas',
        image: 'Assets/Renders/Columna Suavitel BBRL & Fabuloso Alt Cloro Avenida 6ta (2).png',
        model: '',
        embedType: 'sketchfab',
        embedUrl: 'https://sketchfab.com/models/66e576b84c254aee98d279aa4e78414c/embed'
    },
    {
        name: 'Counter Abierto LW Wand',
        category: 'counters',
        image: 'Assets/Renders/Counter Abierto LW Wand.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Counter Abierto LW Wand/Counter Abierto LW Wand con Productos.glb',
        embedType: 'sketchfab',
        embedUrl: 'https://sketchfab.com/models/263f5b9ac75640418585ed6aa0b33ed3/embed'
    },
    {
        name: 'Balconera Suavitel Madres',
        category: 'balconeras',
        image: 'Assets/Renders/Balconera Suavitel Madres.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Balconera Suavitel Madres/Balconera Suavitel Madres.glb',
        embedType: 'sketchfab',
        embedUrl: 'https://sketchfab.com/models/6c6f144b5b2b44c5a1605ff8f7cde568/embed'
    },
    {
        name: 'Cenefa L Arriba Freshficacia',
        category: 'cenefas',
        image: 'Assets/Renders/Cenefa L Arriba Freshficacia.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Cenefa L Arriba Freshficacia/Cenefa L Arriba Freshficacia.glb'
    },
    {
        name: 'Arco Blancox',
        category: 'arcos',
        image: 'Assets/Renders/Arco Blancox.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Arco Blancox/Arco Blancox.glb',
        embedType: 'sketchfab',
        embedUrl: 'https://sketchfab.com/models/4364133bcf524671b2be2cd964520aa3/embed'
    },
    {
        name: 'Bandejas Termoformadas LSS & SS',
        category: 'otros',
        image: 'Assets/Renders/Bandejas Termoformadas LSS & SS.png',
        model: '',
        embedType: 'sketchfab',
        embedUrl: 'https://sketchfab.com/models/af8f09f5016c4f538f8c9d0e6047f1ba/embed'
    },
    {
        name: 'Glorificador Aceite Gourmet',
        category: 'otros',
        image: 'Assets/Renders/Glorificador Aceite Gourmet.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Glorificador Aceite Gourmet/Glorificador Aceite Gourmet.glb'
    },
    {
        name: 'Rejilla Éxito Freshficacia',
        category: 'otros',
        image: 'Assets/Renders/Rejilla Exito Freshficacia.png',
        model: 'Assets/Archivos 3D Portafolio Steban/Rejilla Exito Freshficacia/Rejilla Exito Freshficacia.glb'
    }
];

function loadProjects() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
            return [...defaultProjects];
        }
        let parsed = JSON.parse(stored);
        
        // PARCHE: Corregir en tiempo real las rutas viejas cacheadas en localStorage
        let updatedCache = false;
        if (Array.isArray(parsed)) {
            parsed.forEach(proj => {
                if (proj.image && proj.image.includes('Assets/Renders/Renders/')) {
                    proj.image = proj.image.replace('Assets/Renders/Renders/', 'Assets/Renders/');
                    updatedCache = true;
                }
            });
            if (updatedCache) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
            return [...defaultProjects];
        }
        return parsed;
    } catch (error) {
        console.warn('No se pudieron cargar los proyectos guardados:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
        return [...defaultProjects];
    }
}

function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function renderProjects(projects) {
    const container = document.querySelector('.projects-grid');
    if (!container) return;

    container.innerHTML = '';

    projects.forEach((project) => {
        const card = document.createElement('article');
        card.className = 'project-card';
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

        card.appendChild(adminActions);
        card.appendChild(preview);
        card.appendChild(info);

        const openProjectModal = () => {
            if (!project.model && !project.embedUrl) return;
            const modal = document.getElementById('modal-3d');
            const modalViewer = document.getElementById('modal-viewer');
            const modalIframe = document.getElementById('modal-iframe');
            const modalTitle = document.getElementById('modal-title');

            modalTitle.textContent = project.name;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (project.embedType === 'sketchfab' && project.embedUrl) {
                modalViewer.style.display = 'none';
                if (modalIframe) {
                    modalIframe.style.display = 'block';
                    modalIframe.setAttribute('src', project.embedUrl);
                }
            } else if (project.model) {
                if (modalIframe) {
                    modalIframe.style.display = 'none';
                    modalIframe.setAttribute('src', '');
                }
                modalViewer.style.display = 'block';

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        modalViewer.setAttribute('src', project.model);
                    }, 150);
                });
            }
        };

        card.addEventListener('click', (event) => {
            if (event.target.closest('.project-admin-btn')) return;
            openProjectModal();
        });

        editBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const form = document.getElementById('project-form');
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-category').value = project.category;
            document.getElementById('project-image').value = project.image;
            document.getElementById('project-model').value = project.model || '';
            form.dataset.editingId = project.name;
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('project-name').focus();
        });

        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const projectsList = loadProjects();
            const updated = projectsList.filter((item) => item.name !== project.name);
            saveProjects(updated);
            renderProjects(updated);
            applyFilter(document.querySelector('.filter-btn.active')?.dataset.filter || 'todas');
        });

        container.appendChild(card);
    });
}

function applyFilter(filter) {
    const cards = document.querySelectorAll('.project-card');
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

document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            applyFilter(btn.dataset.filter);
        });
    });

    const modal = document.getElementById('modal-3d');
    const modalViewer = document.getElementById('modal-viewer');
    const modalIframe = document.getElementById('modal-iframe');
    const modalClose = document.getElementById('modal-close');

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modalViewer.setAttribute('src', '');
            if (modalIframe) {
                modalIframe.setAttribute('src', '');
                modalIframe.style.display = 'none';
            }
            modalViewer.style.display = 'block';
            modalViewer.cameraOrbit = 'auto auto auto';
            modalViewer.fieldOfView = 'auto';
        }, 500);
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const softwareItems = document.querySelectorAll('.software-item');
    softwareItems.forEach((item) => {
        const color = item.dataset.color || 'var(--primary-cyan)';
        item.style.setProperty('--software-color', getSoftwareColor(color));
    });

    function getSoftwareColor(color) {
        const map = {
            orange: '#ff8a00',
            amber: '#f4b400',
            'orange-dark': '#ff6a00',
            blue: '#1f8fff',
            cyan: '#00d7ff',
            'blue-strong': '#1c63ff',
            purple: '#a259ff'
        };
        return map[color] || '#00d7ff';
    }

    const privilegedToggle = document.getElementById('privileged-toggle');
    const privilegedModal = document.getElementById('privileged-modal');
    const privilegedPassword = document.getElementById('privileged-password');
    const accessPrivileged = document.getElementById('access-privileged');
    const closePrivilegedButton = document.getElementById('close-privileged-modal');
    const adminPanel = document.getElementById('admin-panel');
    const logoutPrivileged = document.getElementById('logout-privileged');
    const projectForm = document.getElementById('project-form');

    function togglePrivilegedView(isActive) {
        adminPanel.classList.toggle('hidden', !isActive);
        document.querySelectorAll('.project-card').forEach((card) => {
            card.classList.toggle('privileged', isActive);
        });
        privilegedToggle.setAttribute('aria-label', isActive ? 'Cerrar modo privilegiado' : 'Abrir modo privilegiado');
    }

    function openPrivilegedModal() {
        privilegedModal.classList.remove('hidden');
        privilegedModal.setAttribute('aria-hidden', 'false');
        privilegedPassword.focus();
    }

    function closePrivilegedModal() {
        privilegedModal.classList.add('hidden');
        privilegedModal.setAttribute('aria-hidden', 'true');
        privilegedPassword.value = '';
    }

    privilegedToggle.addEventListener('click', () => {
        const isOpen = !privilegedModal.classList.contains('hidden');
        if (isOpen) {
            closePrivilegedModal();
            return;
        }
        openPrivilegedModal();
    });

    closePrivilegedButton.addEventListener('click', closePrivilegedModal);

    accessPrivileged.addEventListener('click', () => {
        if (privilegedPassword.value === DEFAULT_PASSWORD) {
            togglePrivilegedView(true);
            closePrivilegedModal();
            return;
        }
        alert('Contraseña incorrecta.');
    });

    privilegedPassword.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && privilegedPassword.value === DEFAULT_PASSWORD) {
            togglePrivilegedView(true);
            closePrivilegedModal();
        }
    });

    logoutPrivileged.addEventListener('click', () => {
        togglePrivilegedView(false);
    });

    projectForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const projectName = document.getElementById('project-name').value.trim();
        const projectCategory = document.getElementById('project-category').value;
        const projectImage = document.getElementById('project-image').value.trim();
        const projectModel = document.getElementById('project-model').value.trim();

        if (!projectName || !projectCategory || !projectImage) {
            alert('Completa el nombre, categoría e imagen del proyecto.');
            return;
        }

        const projects = loadProjects();
        const editingName = projectForm.dataset.editingId;

        if (editingName) {
            const index = projects.findIndex((project) => project.name === editingName);
            if (index >= 0) {
                projects[index] = {
                    ...projects[index],
                    name: projectName,
                    category: projectCategory,
                    image: projectImage,
                    model: projectModel || ''
                };
            }
            delete projectForm.dataset.editingId;
        } else {
            projects.unshift({
                name: projectName,
                category: projectCategory,
                image: projectImage,
                model: projectModel || ''
            });
        }

        saveProjects(projects);
        renderProjects(projects);
        applyFilter(document.querySelector('.filter-btn.active')?.dataset.filter || 'todas');
        projectForm.reset();
    });

    const projects = loadProjects();
    renderProjects(projects);
    applyFilter('todas');
    togglePrivilegedView(false);
    closePrivilegedModal();
});
