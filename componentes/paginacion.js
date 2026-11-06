class TourismEasyPagination {
    static render({
        selector = '[data-pagination]',
        currentPage = 1,
        totalItems = 0,
        pageSize = 10,
        label = 'Página',
        onPageChange = null
    } = {}) {
        const container = document.querySelector(selector);
        if (!container) return null;

        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(Math.max(currentPage, 1), totalPages);

        container.innerHTML = '';

        const previous = document.createElement('button');
        previous.type = 'button';
        previous.textContent = 'Anterior';
        previous.disabled = safePage <= 1;
        previous.addEventListener('click', () => {
            if (typeof onPageChange === 'function') onPageChange(safePage - 1);
        });

        const summary = document.createElement('span');
        summary.textContent = `${label} ${safePage} / ${totalPages}`;

        const next = document.createElement('button');
        next.type = 'button';
        next.textContent = 'Siguiente';
        next.disabled = safePage >= totalPages;
        next.addEventListener('click', () => {
            if (typeof onPageChange === 'function') onPageChange(safePage + 1);
        });

        container.append(previous, summary, next);
        return { container, previous, summary, next, totalPages };
    }
}

window.TourismEasyPagination = TourismEasyPagination;
