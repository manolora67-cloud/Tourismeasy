(function () {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const welcomeButton = document.getElementById("welcomeButton");
    const siteContent = document.getElementById("site-content");

    if (!welcomeScreen || !welcomeButton || !siteContent) {
        throw new Error("No se pudo iniciar la pantalla de bienvenida de TourismEasy.");
    }

    function makeBackgroundInert() {
        Array.from(document.body.children).forEach(function (element) {
            if (element !== welcomeScreen) element.inert = true;
        });
    }

    makeBackgroundInert();

    const backgroundObserver = new MutationObserver(makeBackgroundInert);
    backgroundObserver.observe(document.body, { childList: true });
    welcomeButton.focus();

    function dismissWelcome() {
        if (welcomeScreen.classList.contains("is-leaving")) return;

        welcomeButton.disabled = true;
        welcomeScreen.classList.add("is-leaving");
        let isDismissed = false;
        let fallbackTimer;

        const finishDismissal = function () {
            if (isDismissed) return;
            isDismissed = true;
            window.clearTimeout(fallbackTimer);
            backgroundObserver.disconnect();
            welcomeScreen.hidden = true;
            Array.from(document.body.children).forEach(function (element) {
                if (element !== welcomeScreen) element.inert = false;
            });
            document.body.classList.remove("welcome-active");

            const firstSiteLink = siteContent.querySelector("a[href], button:not([disabled])");
            if (firstSiteLink) firstSiteLink.focus();
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            finishDismissal();
            return;
        }

        welcomeScreen.addEventListener("transitionend", function (event) {
            if (event.target === welcomeScreen && event.propertyName === "opacity") {
                finishDismissal();
            }
        }, { once: true });

        fallbackTimer = window.setTimeout(finishDismissal, 600);
    }

    welcomeButton.addEventListener("click", dismissWelcome);

})();
