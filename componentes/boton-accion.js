class TourismEasyCtaButton {
    static bind(selector = '[data-cta]') {
        document.querySelectorAll(selector).forEach((button) => {
            button.addEventListener('click', () => {
                const action = button.dataset.cta || 'click';
                const event = new CustomEvent('cta:click', { detail: { action, element: button } });
                document.dispatchEvent(event);
            });
        });
    }
}

window.TourismEasyCtaButton = TourismEasyCtaButton;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TourismEasyCtaButton.bind());
} else {
    TourismEasyCtaButton.bind();
}
