class TourismEasySearchToolbar {
    constructor({ selector = '[data-search-toolbar]' } = {}) {
        this.selector = selector;
        this.groups = document.querySelectorAll(this.selector);
        this.init();
    }

    init() {
        this.groups.forEach((group) => {
            const input = group.querySelector('[data-search-input]');
            const clearButton = group.querySelector('[data-search-clear]');

            if (input) {
                input.addEventListener('input', () => {
                    const event = new CustomEvent('search:input', {
                        detail: { value: input.value, input },
                        bubbles: true
                    });
                    group.dispatchEvent(event);
                });

                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        group.dispatchEvent(new CustomEvent('search:submit', {
                            detail: { value: input.value, input },
                            bubbles: true
                        }));
                    }
                });
            }

            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    if (input) input.value = '';
                    group.dispatchEvent(new CustomEvent('search:clear', {
                        detail: { input },
                        bubbles: true
                    }));
                });
            }
        });
    }
}

window.TourismEasySearchToolbar = TourismEasySearchToolbar;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TourismEasySearchToolbar());
} else {
    new TourismEasySearchToolbar();
}
