(function() {
    "use strict";

    const PAGE_SIZE = 10;

    function initializeDashboard(getProductsLoadState) {
        const tableBody = document.getElementById("admin-table-body");
        const categoryFilter = document.getElementById("filterCategoria");
        let currentPage = 1;
        let statsCache = {
            categories: {},
            cities: {},
            productsByPrice: []
        };

        function setStatsLoading(value) {
            ["statTotal", "statMasCaro", "statMasBarato", "statPromedio", "statTopCategoria"]
                .forEach((id) => {
                    document.getElementById(id).textContent = value;
                });
            document.getElementById("badgeTotal").textContent = value;
            document.getElementById("badgeCategorias").textContent = value;
            document.getElementById("badgeCiudades").textContent = value;
        }

        function validRows() {
            return Array.from(tableBody.querySelectorAll("tr"))
                .filter((row) => !row.querySelector("td[colspan]"));
        }

        function renderProductsPage() {
            const rows = validRows();
            const category = categoryFilter.value.toLowerCase();
            const filteredRows = rows.filter((row) => {
                const rowCategory = row.cells[2] ? row.cells[2].dataset.codigo : "";
                return !category || rowCategory.toLowerCase() === category;
            });
            const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
            currentPage = Math.min(currentPage, totalPages);
            const firstIndex = (currentPage - 1) * PAGE_SIZE;
            const visibleRows = new Set(filteredRows.slice(firstIndex, firstIndex + PAGE_SIZE));
            rows.forEach((row) => {
                row.style.display = visibleRows.has(row) ? "" : "none";
            });

            const emptyFilterRow = tableBody.querySelector(".products-filter-empty");
            if (!filteredRows.length && rows.length) {
                if (!emptyFilterRow) {
                    const row = document.createElement("tr");
                    row.className = "products-filter-empty";
                    const cell = document.createElement("td");
                    cell.colSpan = 6;
                    cell.style.cssText = "text-align:center;padding:24px;color:var(--gray-600);";
                    cell.textContent = "No hay productos en esta categoría.";
                    row.appendChild(cell);
                    tableBody.appendChild(row);
                }
            } else if (emptyFilterRow) {
                emptyFilterRow.remove();
            }

            const pagination = window.TourismEasyPagination.render({
                selector: "#productosPaginacion",
                currentPage,
                totalItems: filteredRows.length,
                pageSize: PAGE_SIZE,
                label: "Mostrando",
                onPageChange: (page) => {
                    currentPage = page;
                    renderProductsPage();
                }
            });
            if (pagination) currentPage = pagination.currentPage;
        }

        function countBy(map, value) {
            const key = String(value || "").trim() || "Sin dato";
            map[key] = (map[key] || 0) + 1;
        }

        function renderBars(containerId, values) {
            const container = document.getElementById(containerId);
            const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);

            if (!entries.length) {
                const empty = document.createElement("div");
                empty.className = "chart-empty";
                const icon = document.createElement("i");
                icon.className = "fa-solid fa-chart-simple";
                const message = document.createElement("p");
                message.textContent = "Todavía no hay productos para graficar.";
                empty.append(icon, message);
                container.replaceChildren(empty);
                return;
            }

            const max = entries[0][1];
            const rows = entries.map(([label, count]) => {
                const row = document.createElement("div");
                row.className = "bar-row";
                const labelElement = document.createElement("span");
                labelElement.className = "bar-row__label";
                labelElement.title = label;
                labelElement.textContent = label;
                const track = document.createElement("div");
                track.className = "bar-row__track";
                const fill = document.createElement("div");
                fill.className = "bar-row__fill";
                fill.style.width = `${Math.round((count / max) * 100)}%`;
                track.appendChild(fill);
                const value = document.createElement("span");
                value.className = "bar-row__val";
                value.textContent = count;
                row.append(labelElement, track, value);
                return row;
            });
            container.replaceChildren(...rows);
        }

        function renderStatistics() {
            const loadState = getProductsLoadState();
            if (loadState !== "loaded") {
                const message = loadState === "error"
                    ? "No se pudieron cargar las estadísticas."
                    : "Cargando estadísticas…";
                document.getElementById("chartCategorias").textContent = message;
                document.getElementById("chartCiudades").textContent = message;
                document.getElementById("rankPrecios").textContent = message;
                document.getElementById("rankPreciosEmpty").style.display = "none";
                return;
            }

            renderBars("chartCategorias", statsCache.categories);
            renderBars("chartCiudades", statsCache.cities);

            const topProducts = statsCache.productsByPrice.slice(0, 5);
            const ranking = document.getElementById("rankPrecios");
            const emptyMessage = document.getElementById("rankPreciosEmpty");
            if (!topProducts.length) {
                ranking.replaceChildren();
                emptyMessage.style.display = "block";
                return;
            }

            emptyMessage.style.display = "none";
            const highestPrice = topProducts[0].price;
            const rows = topProducts.map((product, index) => {
                const row = document.createElement("div");
                row.className = "bar-row";
                row.style.marginBottom = "12px";
                const label = document.createElement("span");
                label.className = "bar-row__label";
                label.style.minWidth = "170px";
                label.title = product.name;
                const rank = document.createElement("span");
                rank.className = "rank-num";
                rank.textContent = index + 1;
                label.append(rank, document.createTextNode(product.name));
                const track = document.createElement("div");
                track.className = "bar-row__track";
                const fill = document.createElement("div");
                fill.className = "bar-row__fill";
                fill.style.width = `${Math.round((product.price / highestPrice) * 100)}%`;
                track.appendChild(fill);
                const value = document.createElement("span");
                value.className = "bar-row__val";
                value.textContent = "$" + product.price.toLocaleString("es-CO");
                row.append(label, track, value);
                return row;
            });
            ranking.replaceChildren(...rows);
        }

        function updateStatistics() {
            if (getProductsLoadState() !== "loaded") return;

            const rows = validRows();
            const categories = {};
            const cities = {};
            const productsByPrice = [];
            let totalPrice = 0;
            let pricedProducts = 0;

            rows.forEach((row) => {
                const name = row.cells[1] ? row.cells[1].textContent.trim() : "Producto";
                const category = row.cells[2] ? row.cells[2].textContent : "";
                const city = row.cells[4] ? row.cells[4].textContent : "";
                countBy(categories, category);
                countBy(cities, city);

                const priceText = row.cells[3] ? row.cells[3].textContent : "";
                const price = row.dataset.precio
                    ? parseFloat(row.dataset.precio)
                    : parseInt(priceText.replace(/[^0-9]/g, ""), 10);
                if (Number.isFinite(price) && price > 0) {
                    totalPrice += price;
                    pricedProducts++;
                    productsByPrice.push({ name, price });
                }
            });

            const topCategory = Object.keys(categories)
                .sort((a, b) => categories[b] - categories[a])[0] || "—";
            const averagePrice = pricedProducts ? Math.round(totalPrice / pricedProducts) : null;
            productsByPrice.sort((a, b) => b.price - a.price);

            document.getElementById("statTotal").textContent = rows.length;
            document.getElementById("statPromedio").textContent = averagePrice === null
                ? "—"
                : "$" + averagePrice.toLocaleString("es-CO");
            document.getElementById("statTopCategoria").textContent = topCategory;
            document.getElementById("statMasCaro").textContent = productsByPrice.length
                ? "$" + productsByPrice[0].price.toLocaleString("es-CO")
                : "—";
            document.getElementById("statMasBarato").textContent = productsByPrice.length
                ? "$" + productsByPrice[productsByPrice.length - 1].price.toLocaleString("es-CO")
                : "—";

            document.getElementById("badgeTotal").textContent =
                rows.length + (rows.length === 1 ? " producto" : " productos");
            document.getElementById("badgeCategorias").textContent =
                Object.keys(categories).length + " categorías";
            document.getElementById("badgeCiudades").textContent =
                Object.keys(cities).length + " ciudades";

            statsCache = { categories, cities, productsByPrice };
            if (document.getElementById("tab-estadisticas").classList.contains("active")) {
                renderStatistics();
            }
        }

        document.querySelectorAll(".panel-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                document.querySelectorAll(".panel-tab").forEach((item) => item.classList.remove("active"));
                document.querySelectorAll(".panel-content").forEach((item) => item.classList.remove("active"));
                tab.classList.add("active");
                document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
                if (tab.dataset.tab === "estadisticas") renderStatistics();
            });
        });

        categoryFilter.addEventListener("change", () => {
            currentPage = 1;
            renderProductsPage();
        });

        return {
            resetProductsPage() {
                currentPage = 1;
                document.getElementById("productosPaginacion").hidden = true;
            },
            setStatsLoading,
            renderProductsPage,
            updateStatistics,
            renderStatistics
        };
    }

    window.TEProductDashboard = { initialize: initializeDashboard };
})();
