class TourismEasyCardList {
    static render(containerSelector, items, renderItem) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = '';
        items.forEach((item) => {
            const node = renderItem(item);
            if (node) container.appendChild(node);
        });
    }
}

window.TourismEasyCardList = TourismEasyCardList;
