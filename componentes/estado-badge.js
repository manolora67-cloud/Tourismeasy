class TourismEasyStatusBadge {
    static normalize(value) {
        return String(value ?? '').trim().toUpperCase();
    }

    static getClassName(value) {
        const normalized = this.normalize(value);
        const map = {
            PENDIENTE: 'status-badge--pending',
            ACTIVO: 'status-badge--active',
            APROBADO: 'status-badge--active',
            INACTIVO: 'status-badge--inactive',
            RECHAZADO: 'status-badge--inactive',
            BLOQUEADO: 'status-badge--inactive',
            ERROR: 'status-badge--error',
            ALERTA: 'status-badge--warning',
            WARNING: 'status-badge--warning',
            INFO: 'status-badge--info'
        };

        return map[normalized] || 'status-badge--neutral';
    }

    static getText(value) {
        return String(value ?? '').trim() || 'Sin estado';
    }

    static create(value) {
        const badge = document.createElement('span');
        badge.className = `status-badge ${this.getClassName(value)}`;
        badge.textContent = this.getText(value);
        return badge;
    }

    static bind(selector = '[data-status-badge]') {
        document.querySelectorAll(selector).forEach((element) => {
            const value = element.dataset.statusBadge;
            const badge = this.create(value);
            element.replaceWith(badge);
        });
    }
}

window.TourismEasyStatusBadge = TourismEasyStatusBadge;
