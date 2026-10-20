class SoftwareManager {
    constructor(storageService, notificationService) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.storageKey = AppConfig.STORAGE_KEYS.SOFTWARE;
        this.defaultSoftware = AppConfig.DEFAULT_SOFTWARE;

        this.homeGrid = document.querySelector('.software-grid');
        this.aboutCardsGrid = document.querySelector('.software-cards-grid');
        this.softwareForm = document.getElementById('software-form');

        this.isAdminActive = false;
    }

    init() {
        this.render();
        this.bindFormEvents();
    }

    loadSoftware() {
        const stored = this.storage.getJSON(this.storageKey, null);
        if (!Array.isArray(stored) || stored.length === 0) {
            return JSON.parse(JSON.stringify(this.defaultSoftware));
        }
        return stored;
    }

    saveSoftware(list) {
        this.storage.setJSON(this.storageKey, list);
    }

    slugifyId(text) {
        return (
            text
                .toString()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || `soft-${Date.now()}`
        );
    }

    addSoftware({ name, color = 'cyan', description = '' }) {
        const cleanName = (name || '').trim();
        if (!cleanName) {
            alert('Ingresa el nombre del software o herramienta.');
            return false;
        }

        const list = this.loadSoftware();
        const id = this.slugifyId(cleanName);
        if (list.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) {
            alert(`"${cleanName}" ya está en el Stack de Software.`);
            return false;
        }

        list.push({
            id: `${id}-${Date.now().toString().slice(-3)}`,
            name: cleanName,
            color: color || 'cyan',
            description:
                (description || '').trim() ||
                'Herramienta especializada para diseño, modelado 3D y desarrollo de material POP para retail.'
        });

        this.saveSoftware(list);
        this.render();
        this.notifier.show(`"${cleanName}" agregado al Stack de Software.`);
        return true;
    }

    deleteSoftware(id) {
        const list = this.loadSoftware();
        const target = list.find((item) => item.id === id);
        if (!target) return;

        if (list.length <= 1) {
            alert('Debe quedar al menos una herramienta en el Stack de Software.');
            return;
        }

        if (!confirm(`¿Eliminar "${target.name}" del Stack de Software?`)) {
            return;
        }

        const updated = list.filter((item) => item.id !== id);
        this.saveSoftware(updated);
        this.render();
        this.notifier.show(`"${target.name}" eliminado del Stack.`);
    }

    updateSoftwareItem(id, changes) {
        const list = this.loadSoftware();
        const index = list.findIndex((item) => item.id === id);
        if (index < 0) return;

        list[index] = {
            ...list[index],
            ...changes
        };
        this.saveSoftware(list);
    }

    bindFormEvents() {
        if (!this.softwareForm) return;
        this.softwareForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const nameInput = document.getElementById('software-name');
            const colorSelect = document.getElementById('software-color');
            const descInput = document.getElementById('software-description');

            const added = this.addSoftware({
                name: nameInput?.value || '',
                color: colorSelect?.value || 'cyan',
                description: descInput?.value || ''
            });

            if (added) {
                this.softwareForm.reset();
            }
        });
    }

    render() {
        const list = this.loadSoftware();

        // 1. Renderizar grilla compacta en Inicio (.software-grid)
        if (this.homeGrid) {
            this.homeGrid.innerHTML = '';
            list.forEach((item) => {
                const pill = document.createElement('div');
                pill.className = 'software-item';
                pill.dataset.color = item.color || 'cyan';
                const hexColor = AppConfig.SOFTWARE_COLORS[item.color] || '#00d7ff';
                pill.style.setProperty('--software-color', hexColor);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'software-item-label';
                nameSpan.textContent = item.name;
                if (this.isAdminActive) {
                    nameSpan.setAttribute('contenteditable', 'true');
                    nameSpan.classList.add('admin-editable-element');
                    nameSpan.title = 'Haz clic para editar el nombre de este software';
                    nameSpan.addEventListener('blur', () => {
                        const newName = nameSpan.textContent.trim();
                        if (newName && newName !== item.name) {
                            this.updateSoftwareItem(item.id, { name: newName });
                            this.notifier.show('Nombre de software actualizado.');
                        }
                    });
                }
                pill.appendChild(nameSpan);

                if (this.isAdminActive) {
                    const delBtn = document.createElement('button');
                    delBtn.type = 'button';
                    delBtn.className = 'software-delete-btn';
                    delBtn.innerHTML = '&times;';
                    delBtn.title = `Eliminar ${item.name}`;
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteSoftware(item.id);
                    });
                    pill.appendChild(delBtn);
                }

                this.homeGrid.appendChild(pill);
            });

            if (this.isAdminActive) {
                const addCard = document.createElement('button');
                addCard.type = 'button';
                addCard.className = 'software-item software-add-pill';
                addCard.textContent = '+ Agregar software';
                addCard.addEventListener('click', () => {
                    const formSection = document.getElementById('admin-software-section');
                    if (formSection) {
                        formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        document.getElementById('software-name')?.focus();
                        return;
                    }
                    const name = prompt('Nombre del nuevo software (ej. Blender, SolidWorks, V-Ray):');
                    if (!name || !name.trim()) return;
                    const desc = prompt('Descripción breve del uso de este software (para la página Sobre Mí):') || '';
                    this.addSoftware({ name: name.trim(), color: 'cyan', description: desc });
                });
                this.homeGrid.appendChild(addCard);
            }
        }

        // 2. Renderizar tarjetas detalladas en Sobre Mí (.software-cards-grid)
        if (this.aboutCardsGrid) {
            this.aboutCardsGrid.innerHTML = '';
            list.forEach((item) => {
                const card = document.createElement('div');
                card.className = 'software-card';

                if (this.isAdminActive) {
                    const delBtn = document.createElement('button');
                    delBtn.type = 'button';
                    delBtn.className = 'software-card-delete';
                    delBtn.innerHTML = '&times;';
                    delBtn.title = `Eliminar ${item.name}`;
                    delBtn.addEventListener('click', () => this.deleteSoftware(item.id));
                    card.appendChild(delBtn);
                }

                const title = document.createElement('h3');
                title.textContent = item.name;

                const desc = document.createElement('p');
                desc.textContent = item.description || '';

                if (this.isAdminActive) {
                    title.setAttribute('contenteditable', 'true');
                    title.classList.add('admin-editable-element');
                    title.addEventListener('blur', () => {
                        const newName = title.textContent.trim();
                        if (newName && newName !== item.name) {
                            this.updateSoftwareItem(item.id, { name: newName });
                            this.notifier.show('Software actualizado.');
                        }
                    });

                    desc.setAttribute('contenteditable', 'true');
                    desc.classList.add('admin-editable-element');
                    desc.addEventListener('blur', () => {
                        const newDesc = desc.textContent.trim();
                        if (newDesc !== item.description) {
                            this.updateSoftwareItem(item.id, { description: newDesc });
                            this.notifier.show('Descripción de software actualizada.');
                        }
                    });
                }

                card.appendChild(title);
                card.appendChild(desc);
                this.aboutCardsGrid.appendChild(card);
            });
        }
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        this.render();
    }
}
