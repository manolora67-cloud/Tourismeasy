class TourismEasyToast {
    static show(message, { type = 'info', duration = 3000 } = {}) {
        const container = document.querySelector('#toast-container') || TourismEasyToast.createContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        setTimeout(() => {
            toast.classList.remove('is-visible');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}

window.TourismEasyToast = TourismEasyToast;
