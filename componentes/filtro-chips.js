class TourismEasyFilterChips {
    constructor({ selector = '[data-filter-chip-group]' } = {}) {
        this.selector = selector;
        this.groups = document.querySelectorAll(this.selector);
        this.init();
    }

    init() {
        this.groups.forEach((group) => {
            const buttons = group.querySelectorAll('[data-filter-chip]');
            if (!buttons.length) return;

            buttons.forEach((button) => {
                button.addEventListener('click', () => {
                    const isActive = button.classList.contains('active');

                    if (!button.dataset.multiSelect || button.dataset.multiSelect === 'false') {
                        buttons.forEach((item) => item.classList.remove('active'));
                    }

                    if (!isActive) {
                        button.classList.add('active');
                    }

                    group.dispatchEvent(new CustomEvent('filter:change', {
                        detail: {
                            value: button.dataset.filterChip,
                            button,
                            group
                        },
                        bubbles: true
                    }));
                });
            });
        });
    }
}

window.TourismEasyFilterChips = TourismEasyFilterChips;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TourismEasyFilterChips());
} else {
    new TourismEasyFilterChips();
}
