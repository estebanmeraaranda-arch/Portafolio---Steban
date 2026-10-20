class LinkEditorManager {
    constructor(storageService, notificationService) {
        this.storage = storageService;
        this.notifier = notificationService;
        this.storageKey = AppConfig.STORAGE_KEYS.LINKS;
        this.defaultLinks = AppConfig.DEFAULT_LINKS;
        this.isAdminActive = false;
        this.popover = null;
        this.activeLinkKey = null;
    }

    init() {
        this.tagContactAndSocialLinks();
        this.applyLinksToDOM();
        this.bindAdminFormEvents();
        this.createInlineLinkPopover();
    }

    loadLinks() {
        const stored = this.storage.getJSON(this.storageKey, null);
        if (!stored || typeof stored !== 'object') {
            return JSON.parse(JSON.stringify(this.defaultLinks));
        }
        return {
            contactBtn: { ...this.defaultLinks.contactBtn, ...(stored.contactBtn || {}) },
            emailLink: { ...this.defaultLinks.emailLink, ...(stored.emailLink || {}) },
            instagramLink: { ...this.defaultLinks.instagramLink, ...(stored.instagramLink || {}) }
        };
    }

    saveLinks(linksData) {
        this.storage.setJSON(this.storageKey, linksData);
    }

    tagContactAndSocialLinks() {
        document.querySelectorAll('.btn-contact').forEach((el) => {
            el.dataset.editableLinkKey = 'contactBtn';
        });

        const footerLinks = document.querySelectorAll('.footer-contact-items .footer-contact-link');
        if (footerLinks[0]) {
            footerLinks[0].dataset.editableLinkKey = 'emailLink';
        }
        if (footerLinks[1]) {
            footerLinks[1].dataset.editableLinkKey = 'instagramLink';
        }

        document.querySelectorAll('[data-editable-link-key]').forEach((el) => {
            el.addEventListener('click', (event) => {
                if (!this.isAdminActive) return;
                event.preventDefault();
                event.stopPropagation();
                this.openPopoverForLink(el, el.dataset.editableLinkKey);
            });
        });
    }

    applyLinksToDOM() {
        const links = this.loadLinks();

        document.querySelectorAll('[data-editable-link-key]').forEach((el) => {
            const key = el.dataset.editableLinkKey;
            const data = links[key];
            if (!data) return;

            el.textContent = data.text;
            el.setAttribute('href', data.href);
        });

        this.populateAdminForm(links);
    }

    populateAdminForm(links) {
        const contactText = document.getElementById('link-contact-text');
        const contactHref = document.getElementById('link-contact-href');
        const emailText = document.getElementById('link-email-text');
        const emailHref = document.getElementById('link-email-href');
        const igText = document.getElementById('link-ig-text');
        const igHref = document.getElementById('link-ig-href');

        if (contactText) contactText.value = links.contactBtn.text;
        if (contactHref) contactHref.value = links.contactBtn.href;
        if (emailText) emailText.value = links.emailLink.text;
        if (emailHref) emailHref.value = links.emailLink.href;
        if (igText) igText.value = links.instagramLink.text;
        if (igHref) igHref.value = links.instagramLink.href;
    }

    normalizeHref(rawHref, isEmailDefault = false) {
        const trimmed = rawHref.trim();
        if (!trimmed) return '#';
        if (
            isEmailDefault &&
            !trimmed.startsWith('mailto:') &&
            !trimmed.startsWith('http://') &&
            !trimmed.startsWith('https://') &&
            trimmed.includes('@')
        ) {
            return `mailto:${trimmed}`;
        }
        return trimmed;
    }

    bindAdminFormEvents() {
        const linksForm = document.getElementById('links-form');
        if (!linksForm) return;

        linksForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const current = this.loadLinks();

            const contactText = document.getElementById('link-contact-text')?.value.trim();
            const contactHref = document.getElementById('link-contact-href')?.value.trim();
            const emailText = document.getElementById('link-email-text')?.value.trim();
            const emailHref = document.getElementById('link-email-href')?.value.trim();
            const igText = document.getElementById('link-ig-text')?.value.trim();
            const igHref = document.getElementById('link-ig-href')?.value.trim();

            const updated = {
                contactBtn: {
                    text: contactText || current.contactBtn.text,
                    href: this.normalizeHref(contactHref || current.contactBtn.href, true)
                },
                emailLink: {
                    text: emailText || current.emailLink.text,
                    href: this.normalizeHref(emailHref || emailText || current.emailLink.href, true)
                },
                instagramLink: {
                    text: igText || current.instagramLink.text,
                    href: this.normalizeHref(igHref || current.instagramLink.href, false)
                }
            };

            this.saveLinks(updated);
            this.applyLinksToDOM();
            this.notifier.show('Enlaces de contacto e Instagram actualizados.');
        });
    }

    createInlineLinkPopover() {
        if (document.getElementById('admin-link-popover')) return;

        const popover = document.createElement('div');
        popover.id = 'admin-link-popover';
        popover.className = 'admin-link-popover hidden';
        popover.innerHTML = `
            <div class="admin-link-popover-header">
                <strong>Editar enlace</strong>
                <button type="button" id="close-link-popover" class="link-popover-close" aria-label="Cerrar">&times;</button>
            </div>
            <div class="field-group">
                <label for="popover-link-text">Texto visible</label>
                <input id="popover-link-text" type="text" placeholder="Ej. @stebitannn o CONTACTAR">
            </div>
            <div class="field-group">
                <label for="popover-link-href">URL o correo de destino</label>
                <input id="popover-link-href" type="text" placeholder="https://instagram.com/... o mailto:...">
            </div>
            <div class="admin-link-popover-actions">
                <button type="button" id="save-link-popover" class="btn-primary admin-floating-btn">Guardar enlace</button>
            </div>
        `;
        document.body.appendChild(popover);
        this.popover = popover;

        document.getElementById('close-link-popover')?.addEventListener('click', () => this.closePopover());

        document.getElementById('save-link-popover')?.addEventListener('click', () => {
            if (!this.activeLinkKey) return;
            const links = this.loadLinks();
            const newText = document.getElementById('popover-link-text')?.value.trim() || '';
            const newHref = document.getElementById('popover-link-href')?.value.trim() || '';
            const isEmail = this.activeLinkKey === 'emailLink' || this.activeLinkKey === 'contactBtn';

            if (newText) {
                links[this.activeLinkKey].text = newText;
            }
            if (newHref) {
                links[this.activeLinkKey].href = this.normalizeHref(newHref, isEmail);
            }

            this.saveLinks(links);
            this.applyLinksToDOM();
            this.closePopover();
            this.notifier.show('Enlace actualizado correctamente.');
        });

        document.addEventListener('click', (event) => {
            if (!this.popover || this.popover.classList.contains('hidden')) return;
            if (
                !this.popover.contains(event.target) &&
                !event.target.closest('[data-editable-link-key]')
            ) {
                this.closePopover();
            }
        });
    }

    openPopoverForLink(targetEl, linkKey) {
        if (!this.popover) return;
        this.activeLinkKey = linkKey;
        const links = this.loadLinks();
        const item = links[linkKey];
        if (!item) return;

        const textInput = document.getElementById('popover-link-text');
        const hrefInput = document.getElementById('popover-link-href');
        if (textInput) textInput.value = item.text;
        if (hrefInput) hrefInput.value = item.href;

        this.popover.classList.remove('hidden');

        const rect = targetEl.getBoundingClientRect();
        const top = Math.min(window.innerHeight - 250, Math.max(16, rect.bottom + 10));
        const left = Math.min(window.innerWidth - 330, Math.max(16, rect.left));

        this.popover.style.top = `${top}px`;
        this.popover.style.left = `${left}px`;
        textInput?.focus();
    }

    closePopover() {
        if (this.popover) {
            this.popover.classList.add('hidden');
        }
        this.activeLinkKey = null;
    }

    setAdminMode(isActive) {
        this.isAdminActive = isActive;
        if (!isActive) {
            this.closePopover();
        }
        document.querySelectorAll('[data-editable-link-key]').forEach((el) => {
            el.classList.toggle('admin-editable-link', isActive);
            if (isActive) {
                el.setAttribute('title', 'Modo Admin: Haz clic para editar el texto y la URL de este enlace');
            } else {
                el.removeAttribute('title');
            }
        });
    }
}
