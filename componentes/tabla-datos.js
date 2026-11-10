class TourismEasyTableData {
    static render({
        selector = '[data-table-data]',
        rows = [],
        columns = [],
        emptyText = 'Sin resultados',
        rowClass = '',
        renderRow = null
    } = {}) {
        const table = document.querySelector(selector);
        if (!table) return null;

        const tbody = table.querySelector('tbody');
        if (!tbody) return null;

        tbody.innerHTML = '';

        if (!rows.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = Math.max(columns.length || 1, 1);
            td.textContent = emptyText;
            td.style.textAlign = 'center';
            td.style.padding = '2rem';
            td.style.opacity = '.7';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return tbody;
        }

        const buildRow = (row, index) => {
            if (typeof renderRow === 'function') {
                return renderRow(row, index, tbody);
            }

            const tr = document.createElement('tr');
            if (rowClass) tr.className = rowClass;

            columns.forEach((column) => {
                const cell = document.createElement('td');
                const value = typeof column.value === 'function' ? column.value(row, index) : (row[column.key] ?? '');
                cell.innerHTML = value ?? '';
                tr.appendChild(cell);
            });

            return tr;
        };

        rows.forEach((row, index) => {
            const tr = buildRow(row, index);
            if (tr) tbody.appendChild(tr);
        });

        return tbody;
    }
}

window.TourismEasyTableData = TourismEasyTableData;
