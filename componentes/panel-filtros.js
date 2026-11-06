class TourismEasyFilterPanel {
    constructor({ selector = '[data-filter-panel]' } = {}) {
        this.selector = selector;
        this.panels = document.querySelectorAll(this.selector);
        this.init();
    }

    init() {
        this.panels.forEach((panel) => {
            const form = panel.querySelector('form');
            if (!form) return;

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const data = Object.fromEntries(new FormData(form).entries());
                const eventName = panel.dataset.filterEvent || 'filter:submit';
                document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
            });
        });
    }
}

window.TourismEasyFilterPanel = TourismEasyFilterPanel;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TourismEasyFilterPanel();
    });
} else {
    new TourismEasyFilterPanel();
}
