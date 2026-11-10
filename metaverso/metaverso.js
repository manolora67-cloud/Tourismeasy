(() => {
    const aframeCdn = "https://aframe.io/releases/1.6.0/aframe.min.js";
    const provinces = [
        {
            id: "metropolitana",
            name: "Metropolitana",
            icon: "🏢",
            capital: "Bucaramanga",
            municipalities: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Zapatoca"],
            position: [0, 34],
            color: "#58ecff",
        },
        {
            id: "soto-norte",
            name: "Soto Norte",
            icon: "❄️",
            capital: "Suratá",
            municipalities: ["California", "Vetas", "Matanza", "Suratá", "Tona"],
            position: [-23, -34],
            color: "#a6e9ff",
        },
        {
            id: "garcia-rovira",
            name: "García Rovira",
            icon: "🏔️",
            capital: "Málaga",
            municipalities: ["Málaga", "Concepción", "Cerrito", "Capitanejo", "San Andrés"],
            position: [22, -33],
            color: "#ffc46b",
        },
        {
            id: "guanenta",
            name: "Guanentá",
            icon: "🏞️",
            capital: "San Gil",
            municipalities: ["San Gil", "Barichara", "Aratoca", "Curití", "Charalá"],
            position: [-4, -10],
            color: "#ff946a",
        },
        {
            id: "comunera",
            name: "Comunera",
            icon: "💧",
            capital: "El Socorro",
            municipalities: ["El Socorro", "Guadalupe", "Oiba", "Simacota", "Suaita"],
            position: [20, 6],
            color: "#5ce0bd",
        },
        {
            id: "yariguies",
            name: "Yariguíes",
            icon: "🛢️",
            capital: "Barrancabermeja",
            municipalities: ["Barrancabermeja", "San Vicente de Chucurí", "Betulia", "El Carmen de Chucurí", "Puerto Wilches"],
            position: [-28, 8],
            color: "#f0d47a",
        },
        {
            id: "velez",
            name: "Vélez",
            icon: "🌿",
            capital: "Vélez",
            municipalities: ["Vélez", "Barbosa", "Puente Nacional", "Guavatá", "Güepsa"],
            position: [17, -42],
            color: "#b2f27a",
        },
    ];

    const mapBoundary = [
        [-8, -52], [6, -50], [13, -44], [24, -41], [30, -34], [27, -26],
        [38, -19], [35, -8], [43, 2], [34, 12], [32, 22], [22, 30],
        [20, 42], [8, 48], [-4, 44], [-11, 36], [-23, 34], [-31, 27],
        [-40, 15], [-35, 3], [-42, -8], [-34, -21], [-29, -34], [-17, -42],
        [-15, -50],
    ];
    const provinceDescriptions = {
        metropolitana: "La puerta de entrada a Santander, entre la ciudad, las montañas y los pueblos coloniales.",
        "soto-norte": "Altas montañas, neblina y frailejones en el paisaje del páramo de Santurbán.",
        "garcia-rovira": "Montañas amplias y secas, caminos rurales y pueblos de altura.",
        guanenta: "El cañón del Chicamocha, el teleférico de Panachi y los caminos de piedra de Barichara.",
        comunera: "Ríos, pozos rojizos y paisajes rurales alrededor de El Socorro y Guadalupe.",
        yariguies: "Las tierras ribereñas de Barrancabermeja y las zonas de cacao de San Vicente.",
        velez: "Laderas verdes, bosques y cuevas en el sur de Santander.",
    };

    function pointInsideMap(x, z) {
        let inside = false;
        for (let index = 0, previous = mapBoundary.length - 1; index < mapBoundary.length; previous = index, index += 1) {
            const [currentX, currentZ] = mapBoundary[index];
            const [previousX, previousZ] = mapBoundary[previous];
            const crosses = (currentZ > z) !== (previousZ > z)
                && x < ((previousX - currentX) * (z - currentZ)) / (previousZ - currentZ) + currentX;
            if (crosses) inside = !inside;
        }
        return inside;
    }

    function terrainHeight(x, z) {
        const rolling = 0.7 * Math.sin(x * 0.12) * Math.cos(z * 0.09)
            + 0.45 * Math.sin((x + z) * 0.16);
        const gaussian = (centerX, centerZ, widthX, widthZ, height) =>
            height * Math.exp(-(((x - centerX) / widthX) ** 2 + ((z - centerZ) / widthZ) ** 2));
        const sotoNorth = gaussian(-23, -34, 15, 17, 15) + gaussian(-34, -24, 10, 12, 8);
        const garciaRovira = gaussian(23, -33, 15, 18, 12) + gaussian(31, -22, 9, 12, 7);
        const velez = gaussian(17, -42, 15, 13, 7);
        const canyonCenter = -9 + x * 0.12;
        const canyon = 7.5
            * Math.exp(-(((z - canyonCenter) / 5.2) ** 2))
            * Math.exp(-(((x + 2) / 30) ** 4));
        return Math.max(0, 1 + rolling + sotoNorth + garciaRovira + velez - canyon);
    }

    const consentScreen = document.getElementById("consentScreen");
    const loaderScreen = document.getElementById("loaderScreen");
    const worldScreen = document.getElementById("worldScreen");
    const activateButton = document.getElementById("activateButton");
    const retryButton = document.getElementById("retryButton");
    const loaderStatus = document.getElementById("loaderStatus");
    const loaderError = document.getElementById("loaderError");
    const progressTrack = document.getElementById("progressTrack");
    const progressBar = document.getElementById("progressBar");
    const progressValue = document.getElementById("progressValue");
    const sceneHost = document.getElementById("sceneHost");
    const provinceMenu = document.getElementById("provinceMenu");
    const provinceCard = document.getElementById("provinceCard");
    const exploredProvinces = new Set();
    let activeAttempt = 0;
    let loadTimeout = 0;
    let sceneInteractionsRegistered = false;

    document.getElementById("provinceCount").textContent = String(provinces.length);
    provinceMenu.innerHTML = provinces
        .map(
            (province, index) =>
                `<button type="button" data-province-index="${index}" style="--province-color: ${province.color}" aria-pressed="false"><span aria-hidden="true">${province.icon}</span><span>${province.name}</span><small>${province.capital}</small></button>`
        )
        .join("");

    function setProgress(value, message) {
        const progress = Math.max(0, Math.min(100, value));
        loaderScreen.style.setProperty("--load-progress", `${progress}%`);
        progressBar.style.setProperty("--load-progress", `${progress}%`);
        progressTrack.setAttribute("aria-valuenow", String(progress));
        progressValue.textContent = `${progress}%`;
        loaderStatus.textContent = message;
    }

    function showLoadError(message, attempt) {
        if (attempt !== activeAttempt) return;
        window.clearTimeout(loadTimeout);
        activateButton.disabled = false;
        loaderError.textContent = message;
        loaderError.hidden = false;
        retryButton.hidden = false;
        loaderStatus.textContent = "No se pudo preparar la experiencia.";
    }

    function markProvinceExplored(index) {
        const province = provinces[index];
        if (!province) return;

        exploredProvinces.add(province.id);
        document.getElementById("exploredCount").textContent = String(exploredProvinces.size);
        document.getElementById("counterProgress").style.width = `${(exploredProvinces.size / provinces.length) * 100}%`;
        const button = provinceMenu.querySelector(`button[data-province-index="${index}"]`);
        if (button) button.dataset.explored = "true";
    }

    function showProvince(index) {
        const province = provinces[index];
        if (!province) return;

        document.getElementById("provinceTitle").textContent = `${province.icon} Provincia ${province.name}`;
        document.getElementById("provinceCapital").textContent = `Capital: ${province.capital}`;
        document.getElementById("provinceDescription").textContent = provinceDescriptions[province.id];
        document.getElementById("municipalityList").innerHTML = province.municipalities
            .map((municipality) => `<span>${municipality}</span>`)
            .join("");
        if (window.matchMedia("(max-width: 420px)").matches) provinceMenu.hidden = true;
        provinceCard.hidden = false;

        provinceMenu.querySelectorAll("button[data-province-index]").forEach((button) => {
            const selected = Number(button.dataset.provinceIndex) === index;
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    provinceMenu.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-province-index]");
        if (button) showProvince(Number(button.dataset.provinceIndex));
    });

    document.getElementById("closeProvinceCard").addEventListener("click", () => {
        provinceCard.hidden = true;
        provinceMenu.hidden = false;
        provinceMenu.querySelectorAll("button[data-province-index]").forEach((button) => {
            button.setAttribute("aria-pressed", "false");
        });
    });

    function provinceModel(id) {
        if (id === "metropolitana") {
            const towers = [
                [-5, -2, "#1c354c", 2.8], [-2.8, -5, "#273e55", 3.2],
                [2.8, -5, "#1c344b", 3.2], [5, -2.3, "#30465a", 2.4],
            ].map(([x, z, color, height]) => `
                <a-entity class="world-collider" data-collider-radius="1.1" position="${x} 0 ${z}">
                    <a-box position="0 ${(height / 2).toFixed(1)} 0" width="1.55" height="${height}" depth="1.45" material="color: ${color}; metalness: 0.35; roughness: 0.45" shadow="cast: true; receive: true"></a-box>
                    <a-box position="0 ${(height + 0.04).toFixed(1)} 0" width="1.65" height="0.08" depth="1.55" material="color: #42d9ff; emissive: #08a0cd; emissiveIntensity: 0.45"></a-box>
                    <a-plane position="0 ${(height / 2).toFixed(1)} 0.731" width="1.05" height="${Math.max(1, height - 0.8).toFixed(1)}" material="color: #6edcf0; emissive: #1489ae; emissiveIntensity: 0.25; transparent: true; opacity: 0.68"></a-plane>
                </a-entity>`).join("");
            return `
                ${towers}
                <a-entity class="world-collider" data-collider-radius="1.25" position="-7 0 2">
                    <a-cylinder position="0 1.8 0" radius="0.72" height="3.6" material="color: #ece9da" shadow="cast: true; receive: true"></a-cylinder>
                    <a-sphere position="0 3.75 0" radius="0.72" scale="1 0.52 1" material="color: #f0eedf"></a-sphere>
                    <a-cone position="0 4.55 0" radius-bottom="0.22" radius-top="0" height="1.2" material="color: #e6e5d7"></a-cone>
                    <a-torus position="0 2.1 0.71" radius="0.24" radius-tubular="0.045" material="color: #42e7ff; emissive: #0da8d1"></a-torus>
                </a-entity>`;
        }

        if (id === "soto-norte") {
            return Array.from({ length: 5 }, (_, index) => {
                const x = -6 + (index % 3) * 3;
                const z = -4 + Math.floor(index / 3) * 4;
                const height = 2.6 + (index % 3) * 0.5;
                return `
                    <a-entity position="${x} 0 ${z}">
                        <a-entity class="world-collider" data-collider-radius="0.55">
                            <a-cylinder position="0 ${(height * 0.34).toFixed(2)} 0" radius="0.12" height="${(height * 0.68).toFixed(2)}" material="color: #a9b5ad"></a-cylinder>
                            <a-sphere position="0 ${(height * 0.7).toFixed(2)} 0" radius="0.38" scale="1 0.55 1" material="color: #b6c4b8"></a-sphere>
                            <a-cone position="0 ${(height * 0.92).toFixed(2)} 0" radius-bottom="0.52" radius-top="0.05" height="0.42" material="color: #94aa9a"></a-cone>
                        </a-entity>
                        <a-torus position="0 0.08 0" rotation="90 0 0" radius="0.64" radius-tubular="0.025" material="color: #b4ebff; emissive: #4297b3; emissiveIntensity: 0.4"></a-torus>
                    </a-entity>`;
            }).join("");
        }

        if (id === "garcia-rovira") {
            return `
                <a-entity class="world-collider" data-collider-radius="1.4" position="3 0 -2">
                    <a-cylinder position="0 1 0" radius="0.17" height="2" material="color: #604c36"></a-cylinder>
                    <a-cone position="0 2.8 0" radius-bottom="1.25" radius-top="0.08" height="1.8" material="color: #315a46"></a-cone>
                    <a-cone position="0 3.65 0" radius-bottom="0.88" radius-top="0.03" height="1.5" material="color: #416c50"></a-cone>
                </a-entity>
                <a-entity class="world-collider" data-collider-radius="1.7" position="-3 0 1">
                    <a-box position="0 1 0" width="2.6" height="2" depth="2" material="color: #af8460" shadow="cast: true; receive: true"></a-box>
                    <a-cone position="0 2.25 0" radius-bottom="1.8" radius-top="0.1" height="0.65" material="color: #66513e"></a-cone>
                    <a-box position="0 0.7 1.03" width="0.45" height="1.4" depth="0.1" material="color: #423b31"></a-box>
                </a-entity>`;
        }

        if (id === "guanenta") {
            return `
                <a-entity position="0 8.5 0">
                    <a-entity line="start: -12 0 -2; end: 12 0 -2; color: #080d15"></a-entity>
                    <a-entity line="start: -12 0 2; end: 12 0 2; color: #080d15"></a-entity>
                    <a-entity class="province-target" geometry="primitive: box; width: 1.35; height: 0.8; depth: 0.85" position="0 -0.5 0" material="color: #ff861e; emissive: #d34b07; emissiveIntensity: 0.8" animation="property: position; to: 0 -0.2 0; dir: alternate; dur: 2300; loop: true"></a-entity>
                </a-entity>
                <a-entity position="-6 0 4">
                    <a-entity class="world-collider" data-collider-radius="1.7">
                        <a-box position="0 1.2 0" width="2.8" height="2.4" depth="2.4" material="color: #c7a77b" shadow="cast: true; receive: true"></a-box>
                        <a-cone position="0 2.65 0" radius-bottom="1.8" radius-top="0.05" height="0.65" material="color: #9c6248"></a-cone>
                        <a-box position="0 0.68 1.22" width="0.42" height="1.36" depth="0.08" material="color: #72523b"></a-box>
                    </a-entity>
                    <a-torus position="0 0.08 0" rotation="90 0 0" radius="2.3" radius-tubular="0.035" material="color: #ffc078; emissive: #9d5018"></a-torus>
                </a-entity>
                <a-entity class="world-collider" data-collider-radius="1.35" position="5 0 4">
                    <a-box position="0 1 0" width="2" height="2" depth="1.8" material="color: #e9dcc4"></a-box>
                    <a-cone position="0 2.2 0" radius-bottom="1.5" radius-top="0.05" height="0.55" material="color: #b97050"></a-cone>
                </a-entity>`;
        }

        if (id === "comunera") {
            return `
                <a-entity position="1 0 2">
                    <a-tube path="-7 0.25 -2; -4 0.23 0; -1 0.2 1; 2 0.18 0; 5 0.16 -1; 8 0.14 1" radius="0.42" material="color: #20bfe7; emissive: #087ba3; emissiveIntensity: 0.55"></a-tube>
                    <a-entity position="-2 0.2 2">
                        <a-circle rotation="-90 0 0" radius="1.35" material="color: #7d382e"></a-circle>
                        <a-torus rotation="90 0 0" radius="1.35" radius-tubular="0.1" material="color: #e85a4e; emissive: #aa221a; emissiveIntensity: 0.5"></a-torus>
                        <a-circle position="2.2 0.02 0.4" rotation="-90 0 0" radius="0.82" material="color: #633b34"></a-circle>
                        <a-torus position="2.2 0.04 0.4" rotation="90 0 0" radius="0.82" radius-tubular="0.09" material="color: #e85a4e"></a-torus>
                        <a-circle position="4 0.02 -0.5" rotation="-90 0 0" radius="0.57" material="color: #633b34"></a-circle>
                        <a-torus position="4 0.04 -0.5" rotation="90 0 0" radius="0.57" radius-tubular="0.07" material="color: #e85a4e"></a-torus>
                    </a-entity>
                    <a-entity class="world-collider" data-collider-radius="1.3" position="-6 0 -3">
                        <a-box position="0 1 0" width="2" height="2" depth="1.8" material="color: #e1d3b9"></a-box>
                        <a-cone position="0 2.15 0" radius-bottom="1.45" radius-top="0.08" height="0.5" material="color: #a8674d"></a-cone>
                    </a-entity>
                </a-entity>`;
        }

        if (id === "yariguies") {
            return `
                <a-entity class="world-collider" data-collider-radius="1.8" position="0 0 -2">
                    <a-cylinder position="-1.1 2.2 0" radius="0.09" height="4.4" material="color: #323c48" rotation="0 0 -9"></a-cylinder>
                    <a-cylinder position="1.1 2.2 0" radius="0.09" height="4.4" material="color: #323c48" rotation="0 0 9"></a-cylinder>
                    <a-cylinder position="0 1.8 0" radius="0.075" height="3.6" material="color: #374754" rotation="0 0 -29"></a-cylinder>
                    <a-cylinder position="0 2.2 0" radius="0.075" height="4.4" material="color: #374754" rotation="0 0 29"></a-cylinder>
                    <a-cylinder position="0 4.1 0" radius="0.09" height="2.4" material="color: #6beaff"></a-cylinder>
                    <a-torus position="0 4.3 0" rotation="0 90 0" radius="1" radius-tubular="0.045" material="color: #3ceaff; emissive: #13a5d6"></a-torus>
                </a-entity>
                ${[-5, -2, 3, 6].map((x, index) => `
                    <a-entity class="world-collider" data-collider-radius="0.85" position="${x} 0 ${index % 2 ? 3 : -4}">
                        <a-cylinder position="0 0.9 0" radius="0.12" height="1.8" material="color: #513f32"></a-cylinder>
                        <a-sphere position="0 2 0" radius="0.92" material="color: #36593d" shadow="cast: true; receive: true"></a-sphere>
                        <a-sphere position="0.6 1.65 0.38" radius="0.2" material="color: #7c4c35"></a-sphere>
                    </a-entity>`).join("")}`;
        }

        return `
            <a-entity class="world-collider" data-collider-radius="1.7" position="0 0 -3">
                <a-cone position="0 2.8 0" radius-bottom="2.5" radius-top="0.08" height="5.6" material="color: #426850"></a-cone>
                <a-cone position="0 4.2 0" radius-bottom="1.5" radius-top="0.02" height="2.8" material="color: #5f8060"></a-cone>
                <a-cylinder position="0 1.4 2" radius="1.05" height="2.8" rotation="90 0 0" material="color: #030609; emissive: #050b10"></a-cylinder>
                <a-torus position="0 1.4 2.12" rotation="90 0 0" radius="1.08" radius-tubular="0.12" material="color: #5be6ff; emissive: #098cac; emissiveIntensity: 0.75"></a-torus>
            </a-entity>
            <a-entity position="-4 0 2">
                <a-entity class="world-collider" data-collider-radius="0.7">
                    <a-cylinder position="0 1 0" radius="0.12" height="2" material="color: #6e5038"></a-cylinder>
                    <a-cone position="0 2.3 0" radius-bottom="1.2" radius-top="0.05" height="1.4" material="color: #44704c"></a-cone>
                </a-entity>
            </a-entity>`;
    }

    function makeScene() {
        const provinceEntities = provinces
            .map((province, index) => {
                const [x, z] = province.position;
                const y = terrainHeight(x, z);
                const model = provinceModel(province.id);
                return `
                    <a-entity class="province-location" data-province-index="${index}" position="${x} ${y.toFixed(2)} ${z}" role="button" aria-label="Provincia ${province.name}" province-marker>
                        <a-circle position="0 0.055 0" rotation="-90 0 0" radius="7.5" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.12; transparent: true; opacity: 0.12"></a-circle>
                        <a-torus class="province-target" position="0 0.12 0" rotation="90 0 0" radius="2.35" radius-tubular="0.055" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.6"></a-torus>
                        <a-cylinder class="province-target" position="0 1.25 0" radius="0.045" height="2.5" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.7; transparent: true; opacity: 0.7"></a-cylinder>
                        <a-sphere class="province-target" position="0 2.6 0" radius="0.16" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.75" animation="property: position; to: 0 2.78 0; dir: alternate; dur: 1700; loop: true; easing: easeInOutSine"></a-sphere>
                        <a-entity position="0 3.15 0" scale="0.62 0.62 0.62" text="value: ${province.name.toUpperCase()}; align: center; anchor: center; width: 5.5; color: #f3fbff; wrapCount: 22"></a-entity>
                        <a-entity class="province-model">${model}</a-entity>
                    </a-entity>`;
            })
            .join("");

        const startHeight = terrainHeight(0, 42);

        return `
            <a-scene class="metaverso-scene" embedded
                vr-mode-ui="enabled: true"
                shadow="type: pcfsoft"
                renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true"
                background="color: #071323"
                fog="type: exponential; color: #071323; density: 0.004">
                <a-sky color="#071323"></a-sky>
                <a-entity light="type: ambient; color: #7d9bb5; intensity: 0.35"></a-entity>
                <a-entity light="type: hemisphere; color: #70d7ef; groundColor: #12282a; intensity: 0.55"></a-entity>
                <a-entity light="type: directional; color: #a4efff; intensity: 1.1" position="-25 38 14" shadow="cast: true; mapSize: 1024"></a-entity>
                <a-entity light="type: point; color: #00c8ff; intensity: 1.3; distance: 45" position="0 13 0"></a-entity>

                <a-entity id="santanderMap" santander-terrain>
                    <a-entity santander-landscape></a-entity>
                    <a-entity santander-vegetation></a-entity>
                    <a-entity santander-mist></a-entity>
                    <a-entity santander-roads></a-entity>
                    ${provinceEntities}
                </a-entity>

                <a-entity id="touristRig" position="0 ${startHeight.toFixed(2)} 42" tourist-physics>
                    <a-entity id="metaversoCamera" camera position="0 1.65 0"
                        look-controls="pointerLockEnabled: false; touchEnabled: true"
                        cursor="rayOrigin: mouse"
                        raycaster="objects: .province-target; far: 80">
                    </a-entity>
                    <a-entity id="leftController" laser-controls="hand: left" raycaster="objects: .province-target; far: 80"></a-entity>
                    <a-entity id="rightController" laser-controls="hand: right" raycaster="objects: .province-target; far: 80"></a-entity>
                </a-entity>
            </a-scene>`;
    }

    function registerSceneInteractions() {
        if (sceneInteractionsRegistered) return;

        const THREE = window.AFRAME.THREE;

        if (!window.AFRAME.components["santander-terrain"]) {
            window.AFRAME.registerComponent("santander-terrain", {
                init() {
                    const columns = 89;
                    const rows = 103;
                    const minX = -44;
                    const minZ = -53;
                    const positions = [];
                    const colors = [];
                    const indices = [];
                    const vertexIndex = (column, row) => row * (columns + 1) + column;
                    const lowland = new THREE.Color("#193d37");
                    const highland = new THREE.Color("#555b4d");
                    const coldland = new THREE.Color("#42545a");
                    const aridland = new THREE.Color("#695849");
                    const pointColor = new THREE.Color();

                    for (let row = 0; row <= rows; row += 1) {
                        for (let column = 0; column <= columns; column += 1) {
                            const x = minX + column;
                            const z = minZ + row;
                            const height = terrainHeight(x, z);
                            positions.push(x, height, z);
                            pointColor.copy(height > 7 ? highland : lowland);
                            if (x < -13 && z < -20) pointColor.lerp(coldland, 0.52);
                            if (x > 12 && z < -20) pointColor.lerp(aridland, 0.5);
                            const shade = 0.82 + Math.min(height / 30, 0.14);
                            colors.push(pointColor.r * shade, pointColor.g * shade, pointColor.b * shade);
                        }
                    }

                    for (let row = 0; row < rows; row += 1) {
                        for (let column = 0; column < columns; column += 1) {
                            const x = minX + column + 0.5;
                            const z = minZ + row + 0.5;
                            if (!pointInsideMap(x, z)) continue;
                            const a = vertexIndex(column, row);
                            const b = vertexIndex(column + 1, row);
                            const c = vertexIndex(column, row + 1);
                            const d = vertexIndex(column + 1, row + 1);
                            indices.push(a, c, b, b, c, d);
                        }
                    }

                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
                    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
                    geometry.setIndex(indices);
                    geometry.computeVertexNormals();
                    const material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        roughness: 0.92,
                        metalness: 0.08,
                        side: THREE.DoubleSide,
                    });
                    this.mesh = new THREE.Mesh(geometry, material);
                    this.mesh.receiveShadow = true;
                    this.el.object3D.add(this.mesh);
                    this.el.sceneEl.__santanderTerrain = this.mesh;

                    const edgePoints = mapBoundary.map(([x, z]) =>
                        new THREE.Vector3(x, terrainHeight(x, z) + 0.18, z));
                    const edgeCurve = new THREE.CatmullRomCurve3(edgePoints, true, "centripetal");
                    const edge = new THREE.Mesh(
                        new THREE.TubeGeometry(edgeCurve, 320, 0.15, 6, true),
                        new THREE.MeshStandardMaterial({
                            color: "#47e9ff",
                            emissive: "#078bb0",
                            emissiveIntensity: 0.82,
                            roughness: 0.32,
                        }),
                    );
                    edge.castShadow = false;
                    this.el.object3D.add(edge);
                },
                remove() {
                    this.mesh?.geometry.dispose();
                    this.mesh?.material.dispose();
                    delete this.el.sceneEl.__santanderTerrain;
                },
            });
        }

        if (!window.AFRAME.components["santander-landscape"]) {
            window.AFRAME.registerComponent("santander-landscape", {
                init() {
                    const segments = [];
                    for (let z = -51; z <= 47; z += 3) {
                        for (let x = -43; x < 42; x += 1) {
                            if (pointInsideMap(x + 0.5, z)) {
                                segments.push(x, terrainHeight(x, z) + 0.08, z, x + 1, terrainHeight(x + 1, z) + 0.08, z);
                            }
                        }
                    }
                    for (let x = -41; x <= 43; x += 3) {
                        for (let z = -52; z < 47; z += 1) {
                            if (pointInsideMap(x, z + 0.5)) {
                                segments.push(x, terrainHeight(x, z) + 0.08, z, x, terrainHeight(x, z + 1) + 0.08, z + 1);
                            }
                        }
                    }
                    const gridGeometry = new THREE.BufferGeometry();
                    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3));
                    const grid = new THREE.LineSegments(
                        gridGeometry,
                        new THREE.LineBasicMaterial({ color: "#36b9a2", transparent: true, opacity: 0.16 }),
                    );
                    this.el.object3D.add(grid);

                    const addRiver = (coordinates, width) => {
                        const points = coordinates.map(([x, z]) => new THREE.Vector3(x, 0, z));
                        const curve = new THREE.CatmullRomCurve3(points);
                        const vertices = [];
                        const faces = [];
                        const count = 180;
                        for (let index = 0; index <= count; index += 1) {
                            const progress = index / count;
                            const center = curve.getPointAt(progress);
                            const tangent = curve.getTangentAt(progress);
                            const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
                            const leftX = center.x - side.x * width;
                            const leftZ = center.z - side.z * width;
                            const rightX = center.x + side.x * width;
                            const rightZ = center.z + side.z * width;
                            vertices.push(leftX, terrainHeight(leftX, leftZ) + 0.11, leftZ);
                            vertices.push(rightX, terrainHeight(rightX, rightZ) + 0.11, rightZ);
                            if (index < count) {
                                const start = index * 2;
                                faces.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
                            }
                        }
                        const geometry = new THREE.BufferGeometry();
                        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
                        geometry.setIndex(faces);
                        geometry.computeVertexNormals();
                        const river = new THREE.Mesh(
                            geometry,
                            new THREE.MeshStandardMaterial({
                                color: "#1d8da9",
                                emissive: "#063e63",
                                emissiveIntensity: 0.6,
                                roughness: 0.2,
                                metalness: 0.25,
                                transparent: true,
                                opacity: 0.84,
                                side: THREE.DoubleSide,
                            }),
                        );
                        this.el.object3D.add(river);
                    };
                    addRiver([[-28, 14], [-19, 12], [-11, 8], [-4, 3], [5, 0], [12, 4], [19, 8], [28, 13]], 0.85);

                    const routes = [
                        [[0, 40], [0, 27], [-2, 15], [-3, 5], [-5, -8], [-10, -20], [-17, -29], [-23, -32]],
                        [[-3, 4], [-7, 11], [-14, 14], [-23, 12], [-28, 9]],
                        [[-4, 5], [2, 12], [12, 15], [21, 12], [28, 11]],
                        [[-4, 5], [-1, -8], [5, -20], [12, -32], [17, -40]],
                    ];
                    routes.forEach((route) => {
                        const curve = new THREE.CatmullRomCurve3(
                            route.map(([x, z]) => new THREE.Vector3(x, terrainHeight(x, z) + 0.15, z)),
                        );
                        this.el.object3D.add(new THREE.Mesh(
                            new THREE.TubeGeometry(curve, 100, 0.09, 5, false),
                            new THREE.MeshStandardMaterial({
                                color: "#74ffd0",
                                emissive: "#148d72",
                                emissiveIntensity: 0.48,
                                roughness: 0.5,
                            }),
                        ));
                    });
                },
            });
        }

        if (!window.AFRAME.components["santander-vegetation"]) {
            window.AFRAME.registerComponent("santander-vegetation", {
                init() {
                    const count = 74;
                    const colliders = [];
                    const trunk = new THREE.InstancedMesh(
                        new THREE.CylinderGeometry(0.13, 0.18, 1.25, 6),
                        new THREE.MeshStandardMaterial({ color: "#72523a", roughness: 1 }),
                        count,
                    );
                    const canopy = new THREE.InstancedMesh(
                        new THREE.ConeGeometry(1, 1, 7),
                        new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 }),
                        count,
                    );
                    const transform = new THREE.Object3D();
                    const greenTones = ["#396d4b", "#4f8154", "#67854f"];
                    let placed = 0;
                    for (let attempt = 0; placed < count && attempt < count * 12; attempt += 1) {
                        const angle = attempt * 2.399963;
                        const radius = 11 + (attempt % 13) * 2.7;
                        const x = Math.cos(angle) * radius - 4;
                        const z = Math.sin(angle) * radius + 1;
                        if (!pointInsideMap(x, z)) continue;
                        if (provinces.some(({ position }) => Math.hypot(x - position[0], z - position[1]) < 8)) continue;

                        const ground = terrainHeight(x, z);
                        const scale = 0.72 + (attempt % 5) * 0.12;
                        transform.position.set(x, ground + 0.7 * scale, z);
                        transform.scale.setScalar(scale);
                        transform.updateMatrix();
                        trunk.setMatrixAt(placed, transform.matrix);
                        transform.position.y = ground + 1.9 * scale;
                        transform.scale.set(0.82 * scale, 2.2 * scale, 0.82 * scale);
                        transform.updateMatrix();
                        canopy.setMatrixAt(placed, transform.matrix);
                        canopy.setColorAt(placed, new THREE.Color(greenTones[attempt % greenTones.length]));
                        colliders.push({ x, z, y: ground, radius: 0.48 * scale });
                        placed += 1;
                    }
                    trunk.count = placed;
                    canopy.count = placed;
                    trunk.castShadow = true;
                    canopy.castShadow = true;
                    this.el.object3D.add(trunk, canopy);

                    const frailejonPositions = Array.from({ length: 18 }, (_, index) => {
                        const angle = index * 2.4;
                        return [-23 + Math.cos(angle) * (4 + (index % 3) * 1.5), -34 + Math.sin(angle) * (4 + (index % 3) * 1.5)];
                    });
                    frailejonPositions.forEach(([x, z], index) => {
                        const height = 1.5 + (index % 4) * 0.22;
                        const plant = new THREE.Mesh(
                            new THREE.ConeGeometry(0.38, height, 7),
                            new THREE.MeshStandardMaterial({ color: index % 2 ? "#b1bd88" : "#c2cba0", roughness: 1 }),
                        );
                        plant.position.set(x, terrainHeight(x, z) + height / 2, z);
                        plant.castShadow = true;
                        this.el.object3D.add(plant);
                        colliders.push({ x, z, y: terrainHeight(x, z), radius: 0.42 });
                    });
                    this.el.sceneEl.__santanderColliders = colliders;
                },
            });
        }

        if (!window.AFRAME.components["santander-mist"]) {
            window.AFRAME.registerComponent("santander-mist", {
                init() {
                    this.positions = new Float32Array(48 * 3);
                    for (let index = 0; index < 48; index += 1) {
                        const angle = index * 2.399963;
                        const radius = 2 + (index % 8) * 0.9;
                        const x = -23 + Math.cos(angle) * radius;
                        const z = -34 + Math.sin(angle) * radius;
                        this.positions[index * 3] = x;
                        this.positions[index * 3 + 1] = terrainHeight(x, z) + 0.22 + (index % 3) * 0.08;
                        this.positions[index * 3 + 2] = z;
                    }
                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
                    this.points = new THREE.Points(
                        geometry,
                        new THREE.PointsMaterial({
                            color: "#e7f7ff",
                            size: 0.42,
                            transparent: true,
                            opacity: 0.38,
                            depthWrite: false,
                            sizeAttenuation: true,
                        }),
                    );
                    this.el.object3D.add(this.points);
                },
                tick(time) {
                    const drift = Math.sin(time * 0.00022) * 2.4;
                    for (let index = 0; index < 48; index += 1) {
                        const x = this.positions[index * 3] + drift * 0.005;
                        const z = this.positions[index * 3 + 2];
                        this.positions[index * 3] = x > -13 ? -33 : x;
                        this.positions[index * 3 + 1] = terrainHeight(this.positions[index * 3], z) + 0.22 + (index % 3) * 0.08;
                    }
                    this.points.geometry.attributes.position.needsUpdate = true;
                },
                remove() {
                    this.points?.geometry.dispose();
                    this.points?.material.dispose();
                },
            });
        }

        if (!window.AFRAME.components["tourist-physics"]) {
            window.AFRAME.registerComponent("tourist-physics", {
                init() {
                    this.keys = new Set();
                    this.velocity = new THREE.Vector3();
                    this.grounded = true;
                    this.visited = new Set();
                    this.radius = 0.42;
                    this.walkSpeed = 4.2;
                    this.onKeyDown = (event) => {
                        const key = event.key.toLowerCase();
                        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
                            event.preventDefault();
                            this.keys.add(key);
                        }
                    };
                    this.onKeyUp = (event) => this.keys.delete(event.key.toLowerCase());
                    window.addEventListener("keydown", this.onKeyDown);
                    window.addEventListener("keyup", this.onKeyUp);
                    this.scene = this.el.sceneEl;
                    this.castRay = new THREE.Raycaster();
                    this.down = new THREE.Vector3(0, -1, 0);
                    this.colliders = null;
                },
                remove() {
                    window.removeEventListener("keydown", this.onKeyDown);
                    window.removeEventListener("keyup", this.onKeyUp);
                },
                readThumbstick(hand) {
                    const scene = this.scene;
                    if (!scene.is("vr-mode")) return [0, 0];
                    const controller = scene.querySelector(`[laser-controls="hand: ${hand}"]`);
                    const gamepad = controller?.components["tracked-controls"]?.controller?.gamepad;
                    const axes = gamepad?.axes || [];
                    if (axes.length < 2) return [0, 0];
                    const first = [axes[0] || 0, axes[1] || 0];
                    const second = [axes[2] || 0, axes[3] || 0];
                    return Math.hypot(second[0], second[1]) > Math.hypot(first[0], first[1]) ? second : first;
                },
                getGround(x, z) {
                    const mesh = this.scene.__santanderTerrain;
                    if (!mesh) return null;
                    mesh.updateMatrixWorld(true);
                    this.castRay.set(new THREE.Vector3(x, 100, z), this.down);
                    this.castRay.far = 150;
                    const hit = this.castRay.intersectObject(mesh, false)[0];
                    if (!hit) return null;
                    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
                    return {
                        height: hit.point.y,
                        normal: hit.face.normal.clone().applyMatrix3(normalMatrix).normalize(),
                    };
                },
                isInsideBounds(x, z) {
                    if (!pointInsideMap(x, z)) return false;
                    for (let index = 0; index < 8; index += 1) {
                        const angle = index * Math.PI / 4;
                        if (!pointInsideMap(x + Math.cos(angle) * this.radius, z + Math.sin(angle) * this.radius)) return false;
                    }
                    return true;
                },
                blockedByLandmark(x, z, height) {
                    if (!this.colliders) {
                        this.scene.object3D.updateMatrixWorld(true);
                        this.colliders = Array.from(this.scene.querySelectorAll(".world-collider")).map((entity) => {
                            const center = entity.object3D.getWorldPosition(new THREE.Vector3());
                            return {
                                x: center.x,
                                z: center.z,
                                y: center.y,
                                radius: Number(entity.dataset.colliderRadius) || 1,
                            };
                        }).concat(this.scene.__santanderColliders || []);
                    }
                    return this.colliders.some((collider) =>
                        Math.abs(collider.y - height) < 7
                        && Math.hypot(x - collider.x, z - collider.z) < this.radius + collider.radius);
                },
                surfaceFriction(x, z) {
                    if (x < -18 && z < -26) return 3.2;
                    const river = [[-28, 14], [-19, 12], [-11, 8], [-4, 3], [5, 0], [12, 4], [19, 8], [28, 13]];
                    let nearest = Infinity;
                    for (let index = 0; index < river.length - 1; index += 1) {
                        const [startX, startZ] = river[index];
                        const [endX, endZ] = river[index + 1];
                        const segmentX = endX - startX;
                        const segmentZ = endZ - startZ;
                        const ratio = Math.max(0, Math.min(1, ((x - startX) * segmentX + (z - startZ) * segmentZ)
                            / (segmentX * segmentX + segmentZ * segmentZ)));
                        nearest = Math.min(nearest, Math.hypot(x - startX - ratio * segmentX, z - startZ - ratio * segmentZ));
                    }
                    return nearest < 1.8 ? 2.2 : 7.5;
                },
                tick(time, delta) {
                    const camera = this.scene.camera;
                    if (!camera) return;
                    const elapsed = Math.min(delta / 1000, 0.04);
                    if (!elapsed) return;
                    const leftStick = this.readThumbstick("left");
                    const rightStick = this.readThumbstick("right");
                    const forwardInput = -((Math.abs(leftStick[1]) > 0.12) ? leftStick[1] : 0)
                        + Number(this.keys.has("w") || this.keys.has("arrowup"))
                        - Number(this.keys.has("s") || this.keys.has("arrowdown"));
                    const strafeInput = ((Math.abs(leftStick[0]) > 0.12) ? leftStick[0] : 0)
                        + Number(this.keys.has("d") || this.keys.has("arrowright"))
                        - Number(this.keys.has("a") || this.keys.has("arrowleft"));
                    if (Math.abs(rightStick[0]) > 0.12) {
                        this.el.object3D.rotation.y -= rightStick[0] * elapsed * 1.8;
                    }

                    const direction = new THREE.Vector3();
                    camera.getWorldDirection(direction);
                    direction.y = 0;
                    direction.normalize();
                    const input = new THREE.Vector3(
                        direction.x * forwardInput - direction.z * strafeInput,
                        0,
                        direction.z * forwardInput + direction.x * strafeInput,
                    );
                    if (input.lengthSq() > 1) input.normalize();
                    const acceleration = 12 * elapsed;
                    this.velocity.x += (input.x * this.walkSpeed - this.velocity.x) * Math.min(1, acceleration);
                    this.velocity.z += (input.z * this.walkSpeed - this.velocity.z) * Math.min(1, acceleration);

                    const current = this.el.object3D.position;
                    const nextX = current.x + this.velocity.x * elapsed;
                    const nextZ = current.z + this.velocity.z * elapsed;
                    const ground = this.getGround(nextX, nextZ);
                    const canEnterMap = this.isInsideBounds(nextX, nextZ);
                    const slopeLimit = Math.cos(Math.PI / 4);
                    const canClimb = ground && ground.normal.y >= slopeLimit
                        && ground.height <= current.y + 0.6;
                    const collision = ground && this.blockedByLandmark(nextX, nextZ, ground.height);
                    if (ground && canEnterMap && canClimb && !collision) {
                        current.x = nextX;
                        current.z = nextZ;
                    } else {
                        this.velocity.x *= 0.35;
                        this.velocity.z *= 0.35;
                    }

                    const underfoot = this.getGround(current.x, current.z);
                    if (this.keys.has(" ") && this.grounded) {
                        this.velocity.y = 5.2;
                        this.grounded = false;
                        this.keys.delete(" ");
                    }
                    if (underfoot && !this.grounded) {
                        this.velocity.y -= 9.81 * elapsed;
                        current.y += this.velocity.y * elapsed;
                        if (current.y <= underfoot.height && this.velocity.y <= 0) {
                            current.y = underfoot.height;
                            this.velocity.y = 0;
                            this.grounded = true;
                        }
                    } else if (underfoot) {
                        current.y = underfoot.height;
                        const steep = underfoot.normal.y < slopeLimit;
                        if (steep) {
                            this.velocity.x += underfoot.normal.x * 9.81 * underfoot.normal.y * elapsed;
                            this.velocity.z += underfoot.normal.z * 9.81 * underfoot.normal.y * elapsed;
                            this.grounded = false;
                        } else {
                            const riverFriction = this.surfaceFriction(current.x, current.z);
                            const friction = input.lengthSq() > 0 ? 1 : Math.exp(-riverFriction * elapsed);
                            this.velocity.x *= friction;
                            this.velocity.z *= friction;
                            this.grounded = true;
                        }
                    } else {
                        this.velocity.y -= 9.81 * elapsed;
                        current.y += this.velocity.y * elapsed;
                        this.grounded = false;
                    }

                    provinces.forEach((province, index) => {
                        if (this.visited.has(index)) return;
                        const [x, z] = province.position;
                        if (Math.hypot(current.x - x, current.z - z) < 5) {
                            this.visited.add(index);
                            markProvinceExplored(index);
                        }
                    });
                },
            });
        }

        if (!window.AFRAME.components["province-marker"]) {
            window.AFRAME.registerComponent("province-marker", {
                init() {
                    this.handleClick = (event) => {
                        const marker = event.target.closest(".province-location");
                        if (marker) showProvince(Number(marker.dataset.provinceIndex));
                    };
                    this.el.addEventListener("click", this.handleClick);
                },
                remove() {
                    this.el.removeEventListener("click", this.handleClick);
                },
            });
        }

        sceneInteractionsRegistered = true;
    }

    function startScene(attempt) {
        if (attempt !== activeAttempt) return;
        try {
            registerSceneInteractions();
            setProgress(68, "Construyendo el espacio de Santander...");
            const sceneMarkup = makeScene();
            worldScreen.hidden = false;
            sceneHost.innerHTML = sceneMarkup;
            const scene = sceneHost.querySelector("a-scene");
            scene.querySelectorAll("[laser-controls]").forEach((controller) => {
                controller.addEventListener("triggerdown", () => {
                    const intersections = controller.components.raycaster?.intersections || [];
                    const target = intersections[0]?.object?.el;
                    const marker = target?.closest(".province-location");
                    if (marker) {
                        showProvince(Number(marker.dataset.provinceIndex));
                    }
                });
            });
            let sceneLoaded = false;

            const onSceneLoaded = () => {
                if (attempt !== activeAttempt || sceneLoaded) return;
                sceneLoaded = true;
                window.clearTimeout(loadTimeout);
                setProgress(100, "¡El metaverso está listo!");
                window.setTimeout(() => {
                    if (attempt !== activeAttempt) return;
                    loaderScreen.hidden = true;
                    worldScreen.hidden = false;
                }, 350);
            };

            scene.addEventListener("loaded", onSceneLoaded, { once: true });
            loadTimeout = window.setTimeout(() => {
                showLoadError("A-Frame se cargó, pero el escenario 3D tardó demasiado en iniciar. Revisa si tu navegador permite aceleración gráfica y vuelve a intentarlo.", attempt);
            }, 45000);
            if (scene.hasLoaded) onSceneLoaded();
        } catch (error) {
            console.error("No se pudo construir el metaverso.", error);
            showLoadError("Ocurrió un error al construir el escenario 3D. Puedes volver a intentarlo.", attempt);
        }
    }

    function loadAFrame(attempt) {
        if (window.AFRAME) {
            startScene(attempt);
            return;
        }

        const existingScript = document.querySelector('script[data-metaverso-aframe="true"]');
        if (existingScript) existingScript.remove();

        setProgress(24, "Conectando con el CDN de A-Frame...");
        const script = document.createElement("script");
        script.src = aframeCdn;
        script.async = true;
        script.dataset.metaversoAframe = "true";
        script.referrerPolicy = "no-referrer";
        script.onload = () => {
            if (attempt !== activeAttempt) return;
            if (!window.AFRAME) {
                showLoadError("El proveedor respondió, pero A-Frame no quedó disponible. Revisa tu conexión y vuelve a intentarlo.", attempt);
                return;
            }
            setProgress(52, "Biblioteca 3D lista. Preparando el escenario...");
            startScene(attempt);
        };
        script.onerror = () => {
            showLoadError("No fue posible descargar A-Frame desde su CDN. Revisa tu conexión o las restricciones de red e inténtalo de nuevo.", attempt);
        };
        document.head.append(script);
    }

    function beginExperience() {
        activeAttempt += 1;
        const attempt = activeAttempt;
        window.clearTimeout(loadTimeout);
        activateButton.disabled = true;
        loaderError.hidden = true;
        retryButton.hidden = true;
        sceneHost.replaceChildren();
        worldScreen.hidden = false;
        consentScreen.hidden = true;
        loaderScreen.hidden = false;
        setProgress(8, "Iniciando la experiencia...");
        loadAFrame(attempt);
    }

    activateButton.addEventListener("click", beginExperience);
    retryButton.addEventListener("click", beginExperience);
    document.getElementById("revokeButton").addEventListener("click", () => {
        window.location.reload();
    });
})();
