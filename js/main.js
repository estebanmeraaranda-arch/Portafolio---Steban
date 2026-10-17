class PortfolioApp {
    constructor() {
        this.storageService = new StorageService();
        this.notificationService = new NotificationService();

        this.projectManager = new ProjectManager(this.storageService, this.notificationService);
        this.textEditorManager = new TextEditorManager(this.storageService, this.notificationService);
        this.linkEditorManager = new LinkEditorManager(this.storageService, this.notificationService);
        this.cvManager = new CvManager(this.storageService, this.notificationService);

        this.adminController = new AdminController({
            storageService: this.storageService,
            notificationService: this.notificationService,
            projectManager: this.projectManager,
            textEditorManager: this.textEditorManager,
            linkEditorManager: this.linkEditorManager,
            cvManager: this.cvManager
        });
    }

    init() {
        this.initSoftwareColors();
        this.initSmoothAnchors();

        this.textEditorManager.init();
        this.linkEditorManager.init();
        this.cvManager.init();
        this.projectManager.init();
        this.adminController.init();
    }

    initSoftwareColors() {
        const softwareItems = document.querySelectorAll('.software-item');
        softwareItems.forEach((item) => {
            const colorKey = item.dataset.color || 'cyan';
            const hexColor = AppConfig.SOFTWARE_COLORS[colorKey] || '#00d7ff';
            item.style.setProperty('--software-color', hexColor);
        });
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
