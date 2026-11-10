(function () {
    "use strict";

    var CACHE_PREFIX = "te-catalog-v1:";
    var CACHE_DURATION_MS = 30 * 1000;

    async function fetchJson(url, options, errorMessage) {
        var cacheKey = CACHE_PREFIX + new URL(url, window.location.href).href;
        var cached;

        try {
            cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                var entry = JSON.parse(cached);
                if (entry.expiresAt > Date.now()) return entry.data;
                sessionStorage.removeItem(cacheKey);
            }
        } catch (error) {
            console.warn("[TourismEasy] No se pudo leer la caché temporal del catálogo.", error);
        }

        var response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(errorMessage || "No se pudieron cargar los datos del catálogo.");
        }

        var result = await response.json();
        if (result && result.ok === true && (
            Array.isArray(result.data)
            || (result.data && Array.isArray(result.data.ciudades))
        )) {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    expiresAt: Date.now() + CACHE_DURATION_MS,
                    data: result,
                }));
            } catch (error) {
                console.warn("[TourismEasy] No se pudo guardar la caché temporal del catálogo.", error);
            }
        }

        return result;
    }

    window.TECatalogCache = Object.freeze({
        fetchJson: fetchJson,
    });
})();
