(function() {
    const mount = document.getElementById("dark-mode-toggle");
    if (!mount) return;

    mount.innerHTML = `
    <button class="btn-dark-mode" id="darkModeToggle">
      <i class="fa-solid fa-moon"></i>
    </button>
  `;

    const darkBtn = document.getElementById("darkModeToggle");
    const icon = darkBtn.querySelector("i");

    function applyTheme(dark) {
        document.body.classList.toggle("dark-mode", dark);
        icon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        localStorage.setItem("theme", dark ? "dark" : "light");
    }

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved ? saved === "dark" : prefersDark);

    darkBtn.addEventListener("click", () => {
        applyTheme(!document.body.classList.contains("dark-mode"));
    });
})();