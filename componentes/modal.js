class TourismEasyModal {
    constructor({ selector = '.modal', openClass = 'is-open' } = {}) {
        this.selector = selector;
        this.openClass = openClass;
        this.modals = document.querySelectorAll(this.selector);
        this.init();
    }

    init() {
        this.modals.forEach((modal) => {
            const openButtons = document.querySelectorAll(`[data-open-modal="${modal.id}"]`);
            const closeButtons = modal.querySelectorAll('[data-close-modal]');

            openButtons.forEach((button) => {
                button.addEventListener('click', () => this.open(modal));
            });

            closeButtons.forEach((button) => {
                button.addEventListener('click', () => this.close(modal));
            });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.close(modal);
                }
            });
        });
    }

    open(modal) {
        modal.classList.add(this.openClass);
        modal.setAttribute('aria-hidden', 'false');
    }

    close(modal) {
        modal.classList.remove(this.openClass);
        modal.setAttribute('aria-hidden', 'true');
    }
}

window.TourismEasyModal = TourismEasyModal;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TourismEasyModal();
    });
} else {
    new TourismEasyModal();
}
