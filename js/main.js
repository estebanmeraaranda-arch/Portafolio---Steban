class PortfolioApp {
    constructor() {
        this.storageService = new StorageService();
        this.notificationService = new NotificationService();

        this.projectManager = new ProjectManager(this.storageService, this.notificationService);
        this.softwareManager = new SoftwareManager(this.storageService, this.notificationService);
        this.textEditorManager = new TextEditorManager(this.storageService, this.notificationService);
        this.linkEditorManager = new LinkEditorManager(this.storageService, this.notificationService);
        this.cvManager = new CvManager(this.storageService, this.notificationService);

        this.adminController = new AdminController({
            storageService: this.storageService,
            notificationService: this.notificationService,
            projectManager: this.projectManager,
            textEditorManager: this.textEditorManager,
            linkEditorManager: this.linkEditorManager,
            cvManager: this.cvManager,
            softwareManager: this.softwareManager
        });
    }

    async init() {
        this.softwareManager.init();
        this.initSmoothAnchors();

        this.textEditorManager.init();
        this.linkEditorManager.init();
        this.cvManager.init();
        this.projectManager.init();
        this.adminController.init();

        // Sincronizar en segundo plano con Supabase (Base de Datos y Storage)
        if (typeof this.storageService.syncFromCloud === 'function') {
            const updated = await this.storageService.syncFromCloud();
            if (updated) {
                this.softwareManager.render();
                this.projectManager.renderCategoriesUI();
                this.textEditorManager.refreshFromStorage?.();
                this.linkEditorManager.applyLinksToDOM();
                this.cvManager.updateStatusUI();
                if (this.projectManager.gridContainer) {
                    const cloudProjects = this.projectManager.loadProjects();
                    this.projectManager.renderProjects(cloudProjects);
                    this.projectManager.applyFilter(this.projectManager.getActiveFilter());
                }
            }
        }
    }

    initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                if (
                    this.adminController.isAdminActive &&
                    (anchor.hasAttribute('data-editable-key') || anchor.hasAttribute('data-editable-link-key'))
                ) {
                    event.preventDefault();
                    return;
                }
                const targetId = anchor.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.init();
});
