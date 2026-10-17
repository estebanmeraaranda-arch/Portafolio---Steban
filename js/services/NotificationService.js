class NotificationService {
    constructor() {
        this.toastElement = null;
        this.hideTimer = null;
    }

    ensureToastElement() {
        if (this.toastElement) return this.toastElement;

        let existing = document.getElementById('admin-toast');
        if (!existing) {
            existing = document.createElement('div');
            existing.id = 'admin-toast';
            existing.className = 'admin-toast';
            document.body.appendChild(existing);
        }
        this.toastElement = existing;
        return this.toastElement;
    }

    show(message, duration = 3200) {
        const toast = this.ensureToastElement();
        toast.textContent = message;
        toast.classList.add('visible');

        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            toast.classList.remove('visible');
        }, duration);
    }
}
