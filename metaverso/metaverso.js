(() => {
    const aframeCdn = "https://aframe.io/releases/1.6.0/aframe.min.js";
    const modelAssets = {
        casa1: { file: "casa1.glb", width: 4.2, height: 3.6, depth: 3.8 },
        casa2: { file: "casa2.glb", width: 4.2, height: 3.6, depth: 3.8 },
        casa3: { file: "casa3.glb", width: 4.2, height: 3.6, depth: 3.8 },
        choza: { file: "choza.glb", width: 4.6, height: 4, depth: 4.6 },
        hormiga: { file: "hormiga.glb", width: 3.5, height: 3.2, depth: 3.5 },
        balsa: { file: "balsa.glb", width: 5.5, height: 3.2, depth: 4.5 },
        antorcha: { file: "antorcha.glb", width: 3.2, height: 6, depth: 3.2 },
        sombrero: { file: "sombrero.glb", width: 4.5, height: 2.5, depth: 4.5 },
        torrepetro: { file: "torrepetro.glb", width: 5, height: 8, depth: 5 },
        cabra: { file: "cabra.glb", width: 3.5, height: 3.5, depth: 3.5 },
        frailejon: { file: "frailejon.glb", width: 4.5, height: 7, depth: 4.5 },
    };
    const modelAssetDirectory = "../img/metaversoimg/";
    const villageModelLayouts = {
        metropolitana: ["casa1", "casa2", "casa3"],
        guanenta: ["casa2", "casa3", "casa1"],
        comunera: ["casa3", "casa1", "casa2"],
        velez: ["casa1", "casa3", "casa2"],
        "garcia-rovira": ["casa2", "casa1", "casa3"],
        "soto-norte": ["casa3", "casa2", "casa1"],
        yariguies: ["casa1", "choza", "casa2"],
    };
    const villageBuildingRadii = [8, 10, 12, 14];
    const placedVillageBuildings = [];
    const provinceMonuments = {
        metropolitana: { asset: "hormiga", position: [0, 0, 0], description: "Símbolo de la identidad santandereana." },
        guanenta: { asset: "balsa", position: [0, 0, 0], colliderRadius: 1.7, description: "Homenaje a la aventura del río Fonce." },
        comunera: { asset: "antorcha", position: [0, 0, 0], description: "Memoria de la libertad comunera." },
        velez: { asset: "sombrero", position: [0, 0, 0], colliderRadius: 1.7, description: "Emblema de la tradición veleña." },
        "garcia-rovira": { asset: "cabra", position: [0, 0, 0], description: "Representación de la cultura ganadera de montaña." },
        "soto-norte": { asset: "frailejon", position: [0, 0, 0], colliderRadius: 1.7, description: "Símbolo de la biodiversidad del páramo de Santurbán." },
        yariguies: { asset: "torrepetro", position: [0, 0, 0], colliderRadius: 1.7, description: "Homenaje al trabajo y la energía del Magdalena Medio." },
    };
    const startingPosition = [0, 29];
    const provinces = [
        {
            id: "metropolitana",
            name: "Metropolitana",
            icon: "🏢",
            capital: "Bucaramanga",
            municipalities: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"],
            position: [0, 20],
            color: "#58ecff",
        },
        {
            id: "guanenta",
            name: "Guanentá",
            icon: "🏞️",
            capital: "San Gil",
            municipalities: ["San Gil", "Barichara", "Aratoca", "Curití"],
            position: [2, 0],
            color: "#ff946a",
        },
        {
            id: "comunera",
            name: "Comunera",
            icon: "📜",
            capital: "El Socorro",
            municipalities: ["El Socorro", "Guadalupe", "Oiba", "Suaita"],
            position: [-12, -8],
            color: "#5ce0bd",
        },
        {
            id: "velez",
            name: "Vélez",
            icon: "🌿",
            capital: "Vélez",
            municipalities: ["Vélez", "Barbosa", "Puente Nacional", "Guavatá"],
            position: [-26, -30],
            color: "#b2f27a",
        },
        {
            id: "garcia-rovira",
            name: "García Rovira",
            icon: "🏔️",
            capital: "Málaga",
            municipalities: ["Málaga", "Concepción", "Capitanejo", "San Andrés"],
            position: [27, -7],
            color: "#ffc46b",
        },
        {
            id: "soto-norte",
            name: "Soto Norte",
            icon: "❄️",
            capital: "Suratá",
            municipalities: ["California", "Vetas", "Suratá", "Tona"],
            position: [8, 38],
            color: "#a6e9ff",
        },
        {
            id: "yariguies",
            name: "Yariguíes",
            icon: "🛢️",
            capital: "Barrancabermeja",
            municipalities: ["Barrancabermeja", "San Vicente de Chucurí", "El Carmen de Chucurí", "Puerto Wilches"],
            position: [-30, 20],
            color: "#f0d47a",
        },
    ];
    const municipalityCoordinates = {
        "bucaramanga": [7.1193, -73.1227],
        "floridablanca": [7.0622, -73.0864],
        "giron": [7.0682, -73.1698],
        "piedecuesta": [6.9879, -73.0502],
        "san-gil": [6.5557, -73.1330],
        "barichara": [6.6354, -73.2225],
        "aratoca": [6.6953, -73.0171],
        "curiti": [6.6057, -73.0680],
        "el-socorro": [6.4631, -73.2602],
        "guadalupe": [6.2476, -73.4182],
        "oiba": [6.2643, -73.2985],
        "suaita": [6.1012, -73.4409],
        "velez": [6.0105, -73.6733],
        "barbosa": [5.9317, -73.6151],
        "puente-nacional": [5.8775, -73.6788],
        "guavata": [5.9550, -73.7000],
        "malaga": [6.7056, -72.7324],
        "concepcion": [6.7663, -72.6942],
        "capitanejo": [6.5281, -72.6955],
        "san-andres": [6.8104, -72.8499],
        "california": [7.3477, -72.9465],
        "vetas": [7.3090, -72.8715],
        "surata": [7.3665, -72.9835],
        "tona": [7.2010, -72.9680],
        "barrancabermeja": [7.0634, -73.8547],
        "san-vicente-de-chucuri": [6.8788, -73.4099],
        "el-carmen-de-chucuri": [6.6988, -73.5115],
        "puerto-wilches": [7.3484, -73.8967],
    };

    const mapBoundary = [
        [-8, -52], [6, -50], [13, -44], [24, -41], [30, -34], [27, -26],
        [38, -19], [35, -8], [43, 2], [34, 12], [32, 22], [22, 30],
        [20, 42], [8, 48], [-4, 44], [-11, 36], [-23, 34], [-31, 27],
        [-40, 15], [-35, 3], [-42, -8], [-34, -21], [-29, -34], [-17, -42],
        [-15, -50],
    ];
    const hikingRoutes = [
        [[0, 29], [0, 20], [1, 13], [2, 7], [2, 0], [-4, -4], [-12, -8], [-19, -18], [-26, -30]],
        [[0, 20], [3, 27], [6, 33], [8, 38]],
        [[2, 0], [12, -4], [20, -6], [27, -7]],
        [[0, 20], [-10, 20], [-20, 20], [-30, 20]],
    ];
    const provinceDescriptions = {
        metropolitana: "Recorre Bucaramanga y sus municipios vecinos: Floridablanca, Girón y Piedecuesta. Aquí se encuentran la vida urbana, los parques y las montañas que rodean la capital santandereana.",
        guanenta: "Descubre San Gil, Barichara y el paisaje del cañón del Chicamocha. Sus caminos de piedra, pueblos patrimoniales y actividades al aire libre hacen de esta provincia uno de los destinos turísticos más conocidos de Santander.",
        comunera: "Conoce El Socorro, Guadalupe, Oiba y Suaita: municipios de historia, cascadas, cuevas y paisajes rurales del valle del río Suárez.",
        velez: "Explora el sur de Santander entre Vélez, Barbosa y Puente Nacional. La región es conocida por sus paisajes verdes, su tradición panelera y el bocadillo veleño.",
        "garcia-rovira": "Camina por los paisajes de montaña de Málaga, Concepción, Capitanejo y San Andrés. Sus páramos, valles y pueblos de altura muestran la diversidad natural del oriente santandereano.",
        "soto-norte": "Recorre California, Vetas, Suratá y Tona entre montañas, frailejones y paisajes de páramo. En esta provincia se encuentra parte del entorno natural del páramo de Santurbán.",
        yariguies: "Visita Barrancabermeja, San Vicente de Chucurí, El Carmen de Chucurí y Puerto Wilches. La provincia combina paisaje ribereño, cacao y tradición petrolera.",
    };
    const municipalityReferenceSources = [
        "../img/pueblos/pueblo1.png",
        "../img/pueblos/pueblo2.png",
        "../img/pueblos/pueblo3.png",
        "../img/pueblos/pueblo4.png",
    ];
    const municipalityOrbitRadius = 3.8;

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

    function distanceToMapBoundary(x, z) {
        let minimumDistance = Infinity;
        for (let index = 0, previous = mapBoundary.length - 1; index < mapBoundary.length; previous = index, index += 1) {
            const [currentX, currentZ] = mapBoundary[index];
            const [previousX, previousZ] = mapBoundary[previous];
            const segmentX = currentX - previousX;
            const segmentZ = currentZ - previousZ;
            const segmentLengthSquared = segmentX * segmentX + segmentZ * segmentZ;
            const progress = Math.max(0, Math.min(1,
                ((x - previousX) * segmentX + (z - previousZ) * segmentZ) / segmentLengthSquared));
            const closestX = previousX + segmentX * progress;
            const closestZ = previousZ + segmentZ * progress;
            minimumDistance = Math.min(minimumDistance, Math.hypot(x - closestX, z - closestZ));
        }
        return minimumDistance;
    }

    function nearHikingRoute(x, z, threshold, routes = hikingRoutes) {
        return routes.some((route) => route.some(([startX, startZ], index) => {
            if (index === route.length - 1) return false;
            const [endX, endZ] = route[index + 1];
            const segmentX = endX - startX;
            const segmentZ = endZ - startZ;
            const ratio = Math.max(0, Math.min(1, ((x - startX) * segmentX + (z - startZ) * segmentZ)
                / (segmentX * segmentX + segmentZ * segmentZ)));
            return Math.hypot(x - startX - ratio * segmentX, z - startZ - ratio * segmentZ) < threshold;
        }));
    }

    function naturalTerrainHeight(x, z) {
        const rolling = 0.32 * Math.sin(x * 0.12) * Math.cos(z * 0.09)
            + 0.2 * Math.sin((x + z) * 0.16);
        const gaussian = (centerX, centerZ, widthX, widthZ, height) =>
            height * Math.exp(-(((x - centerX) / widthX) ** 2 + ((z - centerZ) / widthZ) ** 2));
        const sotoNorth = gaussian(8, 38, 12, 12, 1.4);
        const garciaRovira = gaussian(27, -7, 13, 12, 1.1) + gaussian(30, -15, 10, 12, 0.7);
        const velez = gaussian(-26, -30, 15, 13, 0.6);
        return Math.max(0.35, 1 + rolling + sotoNorth + garciaRovira + velez);
    }

    const villageTerraces = provinces.map(({ id, position: [x, z] }) => ({
        x,
        z,
        flatRadius: 7.5,
        blendRadius: 5,
        height: naturalTerrainHeight(x, z),
    }));

    function villageTerrainHeight(x, z) {
        return villageTerraces.reduce((height, terrace) => {
            const distance = Math.hypot(x - terrace.x, z - terrace.z);
            if (distance >= terrace.flatRadius + terrace.blendRadius) return height;
            if (distance <= terrace.flatRadius) return terrace.height;
            const blend = (distance - terrace.flatRadius) / terrace.blendRadius;
            const smoothBlend = blend * blend * (3 - 2 * blend);
            return height + (terrace.height - height) * (1 - smoothBlend);
        }, naturalTerrainHeight(x, z));
    }

    const hikingTrail = {
        maxGrade: 0.18,
        blendDistance: 10,
        walkableWidth: 4,
    };
    const hikingRouteProfiles = hikingRoutes.map((route) => {
        const samples = [];
        route.slice(1).forEach(([endX, endZ], index) => {
            const [startX, startZ] = route[index];
            const distance = Math.hypot(endX - startX, endZ - startZ);
            const steps = Math.max(1, Math.ceil(distance));
            for (let step = index === 0 ? 0 : 1; step <= steps; step += 1) {
                const progress = step / steps;
                const x = startX + (endX - startX) * progress;
                const z = startZ + (endZ - startZ) * progress;
                samples.push({ x, z, height: villageTerrainHeight(x, z) });
            }
        });

        for (let index = 1; index < samples.length; index += 1) {
            const previous = samples[index - 1];
            const current = samples[index];
            const maxChange = Math.hypot(current.x - previous.x, current.z - previous.z) * hikingTrail.maxGrade;
            current.height = Math.min(previous.height + maxChange, Math.max(previous.height - maxChange, current.height));
        }
        for (let index = samples.length - 2; index >= 0; index -= 1) {
            const current = samples[index];
            const next = samples[index + 1];
            const maxChange = Math.hypot(next.x - current.x, next.z - current.z) * hikingTrail.maxGrade;
            current.height = Math.min(next.height + maxChange, Math.max(next.height - maxChange, current.height));
        }
        return samples;
    });

    function hikingTrailHeight(x, z) {
        let closestDistance = Infinity;
        let closestHeight = null;
        hikingRouteProfiles.forEach((samples) => {
            for (let index = 0; index < samples.length - 1; index += 1) {
                const start = samples[index];
                const end = samples[index + 1];
                const segmentX = end.x - start.x;
                const segmentZ = end.z - start.z;
                const ratio = Math.max(0, Math.min(1, ((x - start.x) * segmentX + (z - start.z) * segmentZ)
                    / (segmentX * segmentX + segmentZ * segmentZ)));
                const projectedX = start.x + segmentX * ratio;
                const projectedZ = start.z + segmentZ * ratio;
                const distance = Math.hypot(x - projectedX, z - projectedZ);
                if (distance >= closestDistance) continue;
                closestDistance = distance;
                closestHeight = start.height + (end.height - start.height) * ratio;
            }
        });
        if (closestDistance >= hikingTrail.blendDistance || closestHeight === null) return null;
        const blend = closestDistance / hikingTrail.blendDistance;
        const smoothBlend = blend * blend * (3 - 2 * blend);
        return { height: closestHeight, weight: 1 - smoothBlend };
    }

    function terrainHeight(x, z) {
        const ground = villageTerrainHeight(x, z);
        const trail = hikingTrailHeight(x, z);
        return trail ? ground + (trail.height - ground) * trail.weight : ground;
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
    const keyboardProvinceControls = document.getElementById("keyboardProvinceControls");
    const keyboardProvinceButtons = document.getElementById("keyboardProvinceButtons");
    const keyboardProvinceStatus = document.getElementById("keyboardProvinceStatus");
    const exploredProvinces = new Set();
    const touchSticks = { move: [0, 0], look: [0, 0] };
    const keyboardKeys = new Set();
    let ambientAudioContext = null;
    let ambientMasterGain = null;
    let ambientEnabled = false;
    let birdTimer = 0;
    let activeAttempt = 0;
    let loadTimeout = 0;
    let sceneInteractionsRegistered = false;
    let activeRouteIndex = null;
    let routeGuideMesh = null;
    let lastRouteProgress = -1;
    let worldHudCanvas = null;
    let worldHudContext = null;
    let worldHudTexture = null;
    let worldHudLogo = null;
    let municipalityReferenceImages = [];
    let municipalityCarousel = null;
    let municipalityCarouselOrbit = null;
    let municipalityCarouselControl = null;
    let municipalityCarouselControlCanvas = null;
    let municipalityCarouselControlTexture = null;
    let municipalityCarouselPaused = false;
    let municipalityCarouselProvinceIndex = null;
    let municipalityCarouselProvinceMarker = null;
    let activePanorama = null;
    let panoramaStatusMessage = "";
    let panoramaRequestId = 0;
    let selectedProvinceIndex = null;
    let provinceInfoVisible = true;
    let soundStatusMessage = "";
    let vrStatusMessage = "";
    let routeStatusMessage = "";

    provinces.forEach((province, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = province.name;
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => showProvince(index));
        keyboardProvinceButtons.appendChild(button);
    });

    function roundedRect(context, x, y, width, height, radius) {
        const corner = Math.min(radius, width / 2, height / 2);
        context.beginPath();
        context.moveTo(x + corner, y);
        context.lineTo(x + width - corner, y);
        context.quadraticCurveTo(x + width, y, x + width, y + corner);
        context.lineTo(x + width, y + height - corner);
        context.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
        context.lineTo(x + corner, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - corner);
        context.lineTo(x, y + corner);
        context.quadraticCurveTo(x, y, x + corner, y);
        context.closePath();
    }

    function drawPanel(context, x, y, width, height, radius = 14) {
        roundedRect(context, x, y, width, height, radius);
        context.fillStyle = "rgba(8, 13, 23, 0.9)";
        context.fill();
        context.strokeStyle = "rgba(90, 219, 225, 0.35)";
        context.lineWidth = 1.5;
        context.stroke();
    }

    function drawHudButton(context, x, y, width, height, label, color) {
        const gradient = context.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(8, 20, 29, 0.96)");
        roundedRect(context, x, y, width, height, 10);
        context.fillStyle = gradient;
        context.fill();
        context.strokeStyle = "rgba(226, 255, 227, 0.55)";
        context.lineWidth = 1.5;
        context.stroke();
        context.fillStyle = "#ffffff";
        context.font = "700 17px Segoe UI, Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(label, x + width / 2, y + height / 2, width - 12);
    }

    function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
        const words = text.split(/\s+/);
        let line = "";
        let lineCount = 0;
        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (context.measureText(candidate).width > maxWidth && line) {
                context.fillText(line, x, y + lineCount * lineHeight);
                lineCount += 1;
                if (lineCount >= maxLines) return lineCount;
                line = word;
            } else {
                line = candidate;
            }
        }
        if (line && lineCount < maxLines) {
            context.fillText(line, x, y + lineCount * lineHeight);
            lineCount += 1;
        }
        return lineCount;
    }

    function municipalitySlug(name) {
        return name.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function drawMunicipalityCardTexture(canvas, province, municipality, image) {
        const context = canvas.getContext("2d");
        if (!context) throw new Error("No se pudo crear la tarjeta 3D del municipio.");
        canvas.width = 640;
        canvas.height = 420;
        context.fillStyle = "rgba(8, 13, 23, 0.98)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (image?.complete && image.naturalWidth) {
            const imageHeight = 250;
            const scale = Math.max(canvas.width / image.naturalWidth, imageHeight / image.naturalHeight);
            const width = image.naturalWidth * scale;
            const height = image.naturalHeight * scale;
            context.save();
            context.beginPath();
            context.rect(0, 0, canvas.width, imageHeight);
            context.clip();
            context.drawImage(image, (canvas.width - width) / 2, (imageHeight - height) / 2, width, height);
            context.restore();
        } else {
            const gradient = context.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, "#285d62");
            gradient.addColorStop(1, "#14212d");
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, 250);
            context.fillStyle = "#f7f8ff";
            context.font = "800 76px Segoe UI, Arial, sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(province.icon, canvas.width / 2, 125);
        }

        const imageShade = context.createLinearGradient(0, 175, 0, 250);
        imageShade.addColorStop(0, "rgba(8, 13, 23, 0)");
        imageShade.addColorStop(1, "rgba(8, 13, 23, 0.86)");
        context.fillStyle = imageShade;
        context.fillRect(0, 175, canvas.width, 75);

        context.textAlign = "left";
        context.textBaseline = "middle";
        context.fillStyle = "#ffffff";
        context.font = "800 34px Segoe UI, Arial, sans-serif";
        context.fillText(municipality, 28, 292, 584);
        context.fillStyle = "#dce6f3";
        context.font = "600 21px Segoe UI, Arial, sans-serif";
        context.fillText("Foto de referencia · Ver en 360°", 28, 336, 584);

        roundedRect(context, 28, 362, 584, 42, 12);
        context.fillStyle = province.color;
        context.fill();
        context.fillStyle = "#07111a";
        context.font = "800 22px Segoe UI, Arial, sans-serif";
        context.textAlign = "center";
        context.fillText("ELEGIR MUNICIPIO", 320, 383);

        context.strokeStyle = province.color;
        context.lineWidth = 6;
        roundedRect(context, 3, 3, 634, 414, 22);
        context.stroke();
    }

    function refreshMunicipalityCarouselTextures() {
        if (!municipalityCarouselOrbit) return;
        municipalityCarouselOrbit.querySelectorAll(".municipality-360-card").forEach((card) => {
            const refreshTexture = card.object3D.userData.refreshTexture;
            if (refreshTexture) refreshTexture();
        });
    }

    function updateMunicipalityCarouselControl() {
        if (!municipalityCarouselControl || !municipalityCarouselControlCanvas || !municipalityCarouselControlTexture) return;
        const label = municipalityCarouselPaused ? "REANUDAR GIRO" : "PAUSAR GIRO";
        const context = municipalityCarouselControlCanvas.getContext("2d");
        if (!context) throw new Error("No se pudo actualizar el control del carrusel.");
        context.clearRect(0, 0, municipalityCarouselControlCanvas.width, municipalityCarouselControlCanvas.height);
        roundedRect(context, 8, 8, 496, 144, 26);
        context.fillStyle = "#0b1720";
        context.fill();
        context.strokeStyle = "#00d8eb";
        context.lineWidth = 8;
        context.stroke();
        context.fillStyle = "#f3fbff";
        context.font = "800 48px Segoe UI, Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(label, 256, 80);
        municipalityCarouselControlTexture.needsUpdate = true;
        municipalityCarouselControl.setAttribute("aria-label", label);
    }

    function createMunicipalityCarousel(scene, provinceIndex) {
        const province = provinces[provinceIndex];
        const map = scene.querySelector("#santanderMap");
        if (!province || !map || !window.AFRAME) return;
        const THREE = window.AFRAME.THREE;

        if (!municipalityCarousel) {
            municipalityCarousel = document.createElement("a-entity");
            municipalityCarousel.id = "municipality-carousel";
            municipalityCarousel.setAttribute("visible", false);
            municipalityCarouselOrbit = document.createElement("a-entity");
            municipalityCarouselOrbit.classList.add("municipality-carousel-orbit");
            municipalityCarousel.append(municipalityCarouselOrbit);
            municipalityCarouselControl = document.createElement("a-entity");
            municipalityCarouselControl.classList.add("interactive-3d", "municipality-carousel-control");
            municipalityCarouselControlCanvas = document.createElement("canvas");
            municipalityCarouselControlCanvas.width = 512;
            municipalityCarouselControlCanvas.height = 160;
            municipalityCarouselControlTexture = new THREE.CanvasTexture(municipalityCarouselControlCanvas);
            municipalityCarouselControlTexture.colorSpace = THREE.SRGBColorSpace;
            const controlMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(1.3, 0.4),
                new THREE.MeshBasicMaterial({
                    map: municipalityCarouselControlTexture,
                    side: THREE.DoubleSide,
                    toneMapped: false,
                }),
            );
            municipalityCarouselControl.setObject3D("mesh", controlMesh);
            municipalityCarouselControl.setAttribute("position", "0 0.1 0");
            municipalityCarouselControl.setAttribute("role", "button");
            municipalityCarouselControl.addEventListener("click", () => {
                municipalityCarouselPaused = !municipalityCarouselPaused;
                updateMunicipalityCarouselControl();
                routeStatusMessage = municipalityCarouselPaused
                    ? "Carrusel pausado. Elige una tarjeta para abrir su panorama 360."
                    : "Carrusel girando. Pulsa PAUSAR GIRO para detener las tarjetas.";
                drawWorldHud3d();
            });
            municipalityCarousel.append(municipalityCarouselControl);
            updateMunicipalityCarouselControl();
            map.append(municipalityCarousel);
        }
        if (municipalityCarouselProvinceIndex === provinceIndex) return;

        municipalityCarouselOrbit.querySelectorAll(".municipality-360-card").forEach((card) => {
            const mesh = card.getObject3D("mesh");
            if (mesh) {
                mesh.geometry.dispose();
                mesh.material.map?.dispose();
                mesh.material.dispose();
            }
            card.remove();
        });
        municipalityCarouselProvinceIndex = provinceIndex;
        const [x, z] = province.position;
        municipalityCarousel.object3D.position.set(x, terrainHeight(x, z) + 2.6, z);
        municipalityCarouselOrbit.object3D.rotation.y = 0;
        const municipalities = province.municipalities.slice(0, 4);

        municipalities.forEach((municipality, index) => {
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 420;
            const image = municipalityReferenceImages[index % municipalityReferenceImages.length];
            drawMunicipalityCardTexture(canvas, province, municipality, image);

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(2.5, 1.64),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    toneMapped: false,
                }),
            );
            const card = document.createElement("a-entity");
            card.classList.add("interactive-3d", "municipality-360-card");
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", `Elegir ${municipality} y ver su panorama 360`);
            card.setObject3D("mesh", mesh);
            municipalityCarouselOrbit.append(card);

            const angle = index * Math.PI * 2 / municipalities.length;
            card.object3D.position.set(
                Math.sin(angle) * municipalityOrbitRadius,
                0,
                Math.cos(angle) * municipalityOrbitRadius,
            );
            card.object3D.rotation.y = angle - Math.PI;
            card.object3D.userData.refreshTexture = () => {
                drawMunicipalityCardTexture(canvas, province, municipality, image);
                texture.needsUpdate = true;
            };
            card.addEventListener("click", () => openMunicipalityPanorama(provinceIndex, index));
        });
    }

    function setMunicipalityCarousel(provinceIndex) {
        const scene = sceneHost.querySelector("a-scene");
        if (!scene || !municipalityCarousel) return;
        if (provinceIndex === null || !provinces[provinceIndex]) {
            municipalityCarousel.setAttribute("visible", false);
            municipalityCarouselPaused = false;
            updateMunicipalityCarouselControl();
            if (municipalityCarouselProvinceMarker) {
                municipalityCarouselProvinceMarker.querySelectorAll(".province-model, .province-name-label, .province-beacon")
                    .forEach((entity) => { entity.object3D.visible = true; });
                municipalityCarouselProvinceMarker = null;
            }
            routeStatusMessage = selectedProvinceIndex === null
                ? ""
                : `Pisa la rotonda celeste para elegir un municipio de ${provinces[selectedProvinceIndex].name}.`;
            drawWorldHud3d();
            return;
        }

        createMunicipalityCarousel(scene, provinceIndex);
        const [provinceX, provinceZ] = provinces[provinceIndex].position;
        const rigPosition = scene.querySelector("#touristRig")?.object3D.position;
        if (rigPosition && municipalityCarouselControl) {
            const directionX = rigPosition.x - provinceX;
            const directionZ = rigPosition.z - provinceZ;
            if (Math.hypot(directionX, directionZ) > 0.001) {
                municipalityCarouselControl.object3D.rotation.y = Math.atan2(directionX, directionZ);
            }
        }
        municipalityCarousel.setAttribute("visible", true);
        municipalityCarouselPaused = false;
        updateMunicipalityCarouselControl();
        municipalityCarouselProvinceIndex = provinceIndex;
        selectedProvinceIndex = provinceIndex;
        provinceInfoVisible = true;
        const marker = scene.querySelector(`.province-location[data-province-index="${provinceIndex}"]`);
        if (municipalityCarouselProvinceMarker !== marker) {
            if (municipalityCarouselProvinceMarker) {
                municipalityCarouselProvinceMarker.querySelectorAll(".province-model, .province-name-label, .province-beacon")
                    .forEach((entity) => { entity.object3D.visible = true; });
            }
            municipalityCarouselProvinceMarker = marker;
            municipalityCarouselProvinceMarker?.querySelectorAll(".province-model, .province-name-label, .province-beacon")
                .forEach((entity) => { entity.object3D.visible = false; });
        }
        exploredProvinces.add(provinces[provinceIndex].id);
        routeStatusMessage = "Elige una tarjeta que gira sobre la rotonda celeste.";
        drawWorldHud3d();
    }

    function openMunicipalityPanorama(provinceIndex, municipalityIndex) {
        const province = provinces[provinceIndex];
        const municipality = province?.municipalities[municipalityIndex];
        if (!province || !municipality) return;

        const requestId = ++panoramaRequestId;
        const slug = municipalitySlug(municipality);
        const localPath = `../img/panoramas/${province.id}-${slug}.jpg`;
        panoramaStatusMessage = `Cargando el panorama 360 de ${municipality}...`;
        drawWorldHud3d();

        const showPanorama = (imageUrl, attribution = "", sourceUrl = "") => {
            const panorama = new Image();
            panorama.onload = () => {
                if (requestId !== panoramaRequestId) return;
                if (Math.abs((panorama.naturalWidth / panorama.naturalHeight) - 2) > 0.05) {
                    panoramaStatusMessage = "La imagen no es un panorama equirectangular 360 válido.";
                    drawWorldHud3d();
                    return;
                }
                const scene = sceneHost.querySelector("a-scene");
                const sky = scene?.querySelector("#worldSky");
                const camera = scene?.querySelector("#metaversoCamera");
                const map = scene?.querySelector("#santanderMap");
                if (!scene || !sky || !camera || !map) {
                    const error = new Error("No se pudo preparar el visor 360 del municipio.");
                    console.error(error.message, error);
                    panoramaStatusMessage = "No se pudo preparar el visor 360. Vuelve al mapa e inténtalo otra vez.";
                    drawWorldHud3d();
                    return;
                }

                scene.object3D.updateMatrixWorld(true);
                const cameraPosition = camera.object3D.getWorldPosition(new window.AFRAME.THREE.Vector3());
                sky.object3D.position.copy(cameraPosition);
                map.object3D.visible = false;
                if (routeGuideMesh) routeGuideMesh.visible = false;
                sky.setAttribute("src", imageUrl);
                sky.setAttribute("color", "#ffffff");
                activePanorama = { province, municipality, filePath: imageUrl, attribution, sourceUrl };
                panoramaStatusMessage = "";
                syncHudHitboxes();
                drawWorldHud3d();
            };
            panorama.onerror = () => {
                if (requestId !== panoramaRequestId) return;
                panoramaStatusMessage = "No se pudo cargar la imagen 360. Verifica la conexión e inténtalo otra vez.";
                drawWorldHud3d();
            };
            panorama.src = imageUrl;
        };

        const coordinates = municipalityCoordinates[slug];
        if (!coordinates) {
            panoramaStatusMessage = `No hay coordenadas configuradas para ${municipality}.`;
            drawWorldHud3d();
            return;
        }

        fetch(`mapillary-panorama.php?lat=${coordinates[0]}&lon=${coordinates[1]}`)
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || `Mapillary respondió con HTTP ${response.status}.`);
                return result;
            })
            .then((result) => {
                if (requestId !== panoramaRequestId) return;
                showPanorama(result.imageUrl, `Foto: ${result.creatorName} · ${result.license}`, result.sourceUrl);
            })
            .catch((error) => {
                if (requestId !== panoramaRequestId) return;
                console.error(`No se pudo cargar un panorama Mapillary para ${municipality}.`, error);
                const localPanorama = new Image();
                localPanorama.onload = () => {
                    if (requestId !== panoramaRequestId) return;
                    showPanorama(localPath);
                };
                localPanorama.onerror = () => {
                    if (requestId !== panoramaRequestId) return;
                    panoramaStatusMessage = error.message || `No se encontró un panorama 360 de ${municipality}.`;
                    drawWorldHud3d();
                };
                localPanorama.src = localPath;
            });
    }

    function closeMunicipalityPanorama() {
        if (!activePanorama) return;
        panoramaRequestId += 1;
        const scene = sceneHost.querySelector("a-scene");
        const sky = scene?.querySelector("#worldSky");
        const map = scene?.querySelector("#santanderMap");
        if (sky) {
            sky.removeAttribute("src");
            sky.setAttribute("color", "#a9c8d1");
        }
        if (map) map.object3D.visible = true;
        if (routeGuideMesh) routeGuideMesh.visible = true;
        activePanorama = null;
        panoramaStatusMessage = "";
        syncHudHitboxes();
        drawWorldHud3d();
    }

    function syncHudHitboxes() {
        document.querySelectorAll(".interactive-3d").forEach((hitbox) => {
            if (hitbox.id === "panoramaCloseHitbox") {
                hitbox.setAttribute("visible", Boolean(activePanorama));
                return;
            }
            if (hitbox.id === "panoramaSourceHitbox") {
                hitbox.setAttribute("visible", Boolean(activePanorama?.sourceUrl));
                return;
            }
            hitbox.setAttribute("visible", !activePanorama);
        });
    }

    function drawWorldHud3d() {
        if (!worldHudContext || !worldHudTexture) return;
        const context = worldHudContext;
        context.save();
        context.clearRect(0, 0, 1600, 900);
        context.textBaseline = "middle";
        context.textAlign = "left";
        context.shadowBlur = 0;
        if (activePanorama) {
            drawPanel(context, 18, 16, 720, 110, 16);
            context.fillStyle = "#f7f8ff";
            context.font = "800 22px Segoe UI, Arial, sans-serif";
            context.fillText(`VISTA 360° · ${activePanorama.municipality}`, 36, 38, 410);
            context.fillStyle = "#e0e8f4";
            context.font = "600 15px Segoe UI, Arial, sans-serif";
            context.fillText("Mira alrededor con el mouse o los controles de tus gafas", 36, 65, 410);
            if (activePanorama.attribution) {
                context.fillStyle = "#c5ccdb";
                context.font = "600 13px Segoe UI, Arial, sans-serif";
                context.fillText(activePanorama.attribution, 36, 91, 420);
            }
            if (activePanorama.sourceUrl) {
                drawHudButton(context, 470, 68, 140, 34, "VER EN MAPILLARY", "#253d2b");
            }
            drawHudButton(context, 620, 36, 84, 48, "VOLVER", "#227c54");
            context.restore();
            worldHudTexture.needsUpdate = true;
            return;
        }
        context.shadowColor = "rgba(0, 0, 0, 0.25)";
        context.shadowBlur = 18;

        drawPanel(context, 18, 16, 178, 56, 16);
        context.save();
        context.beginPath();
        context.arc(47, 44, 21, 0, Math.PI * 2);
        context.clip();
        if (worldHudLogo?.complete && worldHudLogo.naturalWidth) {
            context.drawImage(worldHudLogo, 26, 23, 42, 42);
        } else {
            context.fillStyle = "#25735a";
            context.fillRect(26, 23, 42, 42);
            context.fillStyle = "#ffffff";
            context.font = "800 18px Segoe UI, Arial, sans-serif";
            context.textAlign = "center";
            context.fillText("T", 47, 44);
        }
        context.restore();
        context.fillStyle = "#f7f8ff";
        context.font = "800 19px Segoe UI, Arial, sans-serif";
        context.fillText("TourismEasy", 77, 39);
        context.fillStyle = "#c5ccdb";
        context.font = "600 14px Segoe UI, Arial, sans-serif";
        context.fillText("Santander inmersivo", 77, 57);

        drawPanel(context, 725, 16, 150, 54, 15);
        context.fillStyle = "#c5ccdb";
        context.font = "600 15px Segoe UI, Arial, sans-serif";
        context.fillText("Provincias", 740, 34);
        context.fillStyle = "#30d890";
        context.font = "800 16px Segoe UI, Arial, sans-serif";
        context.textAlign = "right";
        context.fillText(`${exploredProvinces.size}/${provinces.length}`, 858, 35);
        roundedRect(context, 740, 53, 120, 5, 3);
        context.fillStyle = "#263345";
        context.fill();
        if (exploredProvinces.size) {
            roundedRect(context, 740, 53, 120 * exploredProvinces.size / provinces.length, 5, 3);
            context.fillStyle = "#30d890";
            context.fill();
        }

        drawHudButton(context, 1428, 16, 154, 38, ambientEnabled ? "Silenciar sonidos" : "Activar sonidos", "#253d2b");
        drawHudButton(context, 1428, 70, 154, 42, sceneHost.querySelector("a-scene")?.is("vr-mode") ? "Salir en VR" : "Entrar en VR", "#227c54");
        context.shadowBlur = 0;
        context.fillStyle = "#fff1bd";
        context.font = "600 15px Segoe UI, Arial, sans-serif";
        context.textAlign = "right";
        if (soundStatusMessage) context.fillText(soundStatusMessage, 1580, 128, 300);
        if (vrStatusMessage) context.fillText(vrStatusMessage, 1580, 148, 300);

        drawPanel(context, 18, 82, 255, 328, 14);
        provinces.forEach((province, index) => {
            const x = 24;
            const y = 89 + index * 45;
            const selected = index === selectedProvinceIndex;
            roundedRect(context, x, y, 243, 40, 10);
            context.fillStyle = selected ? "rgba(20, 41, 54, 0.98)" : "rgba(5, 14, 24, 0.94)";
            context.fill();
            context.strokeStyle = selected ? province.color : "rgba(90, 219, 225, 0.3)";
            context.lineWidth = selected ? 2 : 1;
            context.stroke();
            if (exploredProvinces.has(province.id)) {
                context.fillStyle = province.color;
                context.fillRect(x, y + 3, 3, 34);
            }
            context.textAlign = "left";
            context.font = "26px Segoe UI Emoji, Apple Color Emoji, sans-serif";
            context.fillText(province.icon, x + 12, y + 20);
            context.fillStyle = "#f0f7ff";
            context.font = "800 20px Segoe UI, Arial, sans-serif";
            context.fillText(province.name, x + 48, y + 14);
            context.fillStyle = "#e0e8f4";
            context.font = "600 15px Segoe UI, Arial, sans-serif";
            context.fillText(province.capital, x + 48, y + 32);
        });

        if (provinceInfoVisible) {
            const cardX = 1240;
            const cardY = 438;
            const cardWidth = 340;
            const cardHeight = selectedProvinceIndex === null ? 340 : 420;
            drawPanel(context, cardX, cardY, cardWidth, cardHeight, 16);
            context.textAlign = "left";
            context.fillStyle = "#30d890";
            context.font = "800 14px Segoe UI, Arial, sans-serif";
            context.fillText("TERRITORIO ACTIVO", cardX + 18, cardY + 27);
            context.textAlign = "center";
            drawHudButton(context, cardX + cardWidth - 44, cardY + 10, 30, 30, "×", "#283647");
            context.textAlign = "left";

            const province = selectedProvinceIndex === null ? null : provinces[selectedProvinceIndex];
            context.fillStyle = "#f7f8ff";
            context.font = "800 22px Segoe UI, Arial, sans-serif";
            context.fillText(province ? `${province.icon} Provincia ${province.name}` : "Explora Santander", cardX + 18, cardY + 61, cardWidth - 68);
            context.fillStyle = "#b7ffe0";
            context.font = "700 16px Segoe UI, Arial, sans-serif";
            context.fillText(province ? `Capital: ${province.capital}` : "Elige una provincia en el menú 3D", cardX + 18, cardY + 91, cardWidth - 36);

            context.fillStyle = "#c5ccdb";
            context.font = "600 16px Segoe UI, Arial, sans-serif";
            const description = province
                ? provinceDescriptions[province.id]
                : "Selecciona una provincia para ver su información y recibir una ruta luminosa por los senderos.";
            const descriptionLines = drawWrappedText(context, description, cardX + 18, cardY + 120, cardWidth - 36, 24, 6);
            const municipalityTitleY = cardY + 133 + descriptionLines * 24;
            context.fillStyle = "#f7f8ff";
            context.font = "800 15px Segoe UI, Arial, sans-serif";
            context.fillText("Municipios destacados", cardX + 18, municipalityTitleY);
            context.fillStyle = "#c5ccdb";
            context.font = "600 14px Segoe UI, Arial, sans-serif";
            const municipalities = province?.municipalities.join(" · ") || "La ruta evita las casas y limita el paso por las montañas.";
            drawWrappedText(context, municipalities, cardX + 18, municipalityTitleY + 24, cardWidth - 36, 20, 3);

            if (routeStatusMessage) {
                context.fillStyle = "#5cecff";
                context.font = "800 16px Segoe UI, Arial, sans-serif";
                drawWrappedText(context, routeStatusMessage, cardX + 18, cardY + cardHeight - 42, cardWidth - 36, 20, 2);
            }
        }

        if (panoramaStatusMessage) {
            drawPanel(context, 520, 710, 640, 92, 14);
            context.textAlign = "left";
            context.fillStyle = "#ffd1c9";
            context.font = "800 16px Segoe UI, Arial, sans-serif";
            drawWrappedText(context, panoramaStatusMessage, 540, 738, 600, 22, 3);
        }

        drawPanel(context, 445, 846, 710, 42, 9);
        context.fillStyle = "#d3dae7";
        context.font = "600 14px Segoe UI, Arial, sans-serif";
        context.textAlign = "center";
        context.fillText("Camina con WASD o las flechas · Usa el mouse para mirar · VR: controles de las gafas", 800, 867, 680);
        context.restore();
        worldHudTexture.needsUpdate = true;
    }

    function setupWorldHud3d(scene) {
        const camera = scene.querySelector("#metaversoCamera");
        if (!camera || !window.AFRAME) return;
        const THREE = window.AFRAME.THREE;
        worldHudCanvas = document.createElement("canvas");
        worldHudCanvas.width = 1600;
        worldHudCanvas.height = 900;
        worldHudContext = worldHudCanvas.getContext("2d");
        if (!worldHudContext) throw new Error("No se pudo crear el panel 3D.");

        worldHudTexture = new THREE.CanvasTexture(worldHudCanvas);
        worldHudTexture.colorSpace = THREE.SRGBColorSpace;
        const hudMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(7.2, 4.05),
            new THREE.MeshBasicMaterial({
                map: worldHudTexture,
                transparent: true,
                depthTest: false,
                depthWrite: false,
                toneMapped: false,
                side: THREE.DoubleSide,
            }),
        );
        hudMesh.name = "world-hud-3d";
        hudMesh.position.set(0, 0, -2.4);
        hudMesh.renderOrder = 20;
        camera.object3D.add(hudMesh);

        worldHudLogo = new Image();
        worldHudLogo.onload = drawWorldHud3d;
        worldHudLogo.src = "../img/TURISMEASY.png";
        municipalityReferenceImages = municipalityReferenceSources.map((source) => {
            const image = new Image();
            image.onload = () => {
                drawWorldHud3d();
                refreshMunicipalityCarouselTextures();
            };
            image.onerror = () => console.error(`No se pudo cargar la imagen de referencia ${source}.`);
            image.src = source;
            return image;
        });
        createMunicipalityCarousel(scene, 0);

        const addHitbox = (id, x, y, width, height, onClick) => {
            const hitbox = document.createElement("a-plane");
            const positionX = (x + width / 2 - 800) * 7.2 / 1600;
            const positionY = (450 - y - height / 2) * 4.05 / 900;
            hitbox.id = id;
            hitbox.className = "interactive-3d";
            hitbox.setAttribute("geometry", `primitive: plane; width: ${width * 7.2 / 1600}; height: ${height * 4.05 / 900}`);
            hitbox.setAttribute("material", "color: #ffffff; transparent: true; opacity: 0.001; side: double");
            hitbox.setAttribute("position", `${positionX} ${positionY} -2.385`);
            hitbox.setAttribute("role", "button");
            camera.append(hitbox);
            hitbox.addEventListener("click", onClick);
            return hitbox;
        };

        provinces.forEach((province, index) => {
            addHitbox(`province-menu-hitbox-${index}`, 24, 89 + index * 45, 243, 40, () => {
                showProvince(index, false, true);
            }).classList.add("province-menu-button");
            const hitbox = camera.querySelector(`#province-menu-hitbox-${index}`);
            hitbox.dataset.provinceIndex = String(index);
        });
        addHitbox("provinceInfoClose3d", 1536, 448, 30, 30, closeProvinceInfo);
        addHitbox("sound3dButton", 1428, 16, 154, 38, toggleAmbientSound);
        addHitbox("vr3dButton", 1428, 70, 154, 42, toggleVr);
        addHitbox("panoramaSourceHitbox", 470, 68, 140, 34, () => {
            if (activePanorama?.sourceUrl) window.open(activePanorama.sourceUrl, "_blank", "noopener,noreferrer");
        });
        addHitbox("panoramaCloseHitbox", 620, 36, 84, 48, closeMunicipalityPanorama);
        addHitbox("home3dButton", 18, 16, 178, 56, () => {
            window.location.href = "../index.html";
        });
        syncHudHitboxes();
        drawWorldHud3d();
    }

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
        loaderScreen.hidden = false;
        loaderError.textContent = message;
        loaderError.hidden = false;
        retryButton.hidden = false;
        loaderStatus.textContent = "No se pudo preparar la experiencia.";
        retryButton.focus();
    }

    function markProvinceExplored(index) {
        const province = provinces[index];
        if (!province) return;

        exploredProvinces.add(province.id);
        drawWorldHud3d();
    }

    function showProvince(index, markExplored = false, guide = false) {
        const province = provinces[index];
        if (!province) return;

        panoramaRequestId += 1;
        selectedProvinceIndex = index;
        provinceInfoVisible = true;
        panoramaStatusMessage = "";
        keyboardProvinceButtons.querySelectorAll("button").forEach((button, buttonIndex) => {
            button.setAttribute("aria-pressed", String(buttonIndex === index));
        });
        keyboardProvinceStatus.textContent = `Provincia ${province.name}. Capital: ${province.capital}. ${provinceDescriptions[province.id]} Municipios destacados: ${province.municipalities.join(", ")}.`;
        if (markExplored) markProvinceExplored(index);
        if (guide) guideToProvince(index);
        syncHudHitboxes();
        drawWorldHud3d();
    }

    function closeProvinceInfo() {
        panoramaRequestId += 1;
        provinceInfoVisible = false;
        syncHudHitboxes();
        drawWorldHud3d();
    }

    function findTrailRoute(start, destination) {
        const nodes = [];
        const nodeIndexes = new Map();
        const edges = [];
        const getNodeIndex = (x, z) => {
            const key = `${x},${z}`;
            if (!nodeIndexes.has(key)) {
                nodeIndexes.set(key, nodes.length);
                nodes.push([x, z]);
                edges.push([]);
            }
            return nodeIndexes.get(key);
        };

        hikingRoutes.forEach((route) => {
            route.slice(1).forEach(([x, z], index) => {
                const from = getNodeIndex(...route[index]);
                const to = getNodeIndex(x, z);
                const distance = Math.hypot(nodes[from][0] - x, nodes[from][1] - z);
                edges[from].push({ node: to, distance });
                edges[to].push({ node: from, distance });
            });
        });

        const nearestNode = (position) => nodes.reduce((nearest, node, index) =>
            Math.hypot(node[0] - position[0], node[1] - position[1])
                < Math.hypot(nodes[nearest][0] - position[0], nodes[nearest][1] - position[1])
                ? index
                : nearest, 0);
        const startNode = nearestNode(start);
        const destinationNode = nearestNode(destination);
        const distances = nodes.map(() => Infinity);
        const previous = nodes.map(() => -1);
        const visited = new Set();
        distances[startNode] = 0;

        for (let step = 0; step < nodes.length; step += 1) {
            let current = -1;
            for (let index = 0; index < nodes.length; index += 1) {
                if (!visited.has(index) && (current === -1 || distances[index] < distances[current])) current = index;
            }
            if (current === -1 || !Number.isFinite(distances[current])) break;
            if (current === destinationNode) break;
            visited.add(current);
            edges[current].forEach(({ node, distance }) => {
                const candidate = distances[current] + distance;
                if (candidate < distances[node]) {
                    distances[node] = candidate;
                    previous[node] = current;
                }
            });
        }

        const path = [];
        for (let node = destinationNode; node !== -1; node = previous[node]) {
            path.unshift(nodes[node]);
            if (node === startNode) break;
        }
        return [start, ...path, destination].filter(([x, z], index, points) =>
            index === 0 || Math.hypot(x - points[index - 1][0], z - points[index - 1][1]) > 0.1);
    }

    function guideToProvince(index) {
        const province = provinces[index];
        const scene = sceneHost.querySelector("a-scene");
        const touristRig = scene?.querySelector("#touristRig");
        if (!province || !scene || !touristRig || !window.AFRAME) return;

        const THREE = window.AFRAME.THREE;
        const current = touristRig.object3D.position;
        const path = findTrailRoute([current.x, current.z], province.position);
        const points = path.map(([x, z]) => new THREE.Vector3(x, terrainHeight(x, z) + 0.24, z));
        if (points.length < 2) {
            activeRouteIndex = null;
            routeStatusMessage = `Ya estás en ${province.name}.`;
            drawWorldHud3d();
            return;
        }
        if (routeGuideMesh) {
            routeGuideMesh.geometry.dispose();
            routeGuideMesh.material.dispose();
            routeGuideMesh.removeFromParent();
        }

        const firstSegmentLength = points[0].distanceTo(points[1]);
        const leadIn = Math.min(2.2, firstSegmentLength * 0.45);
        const guidePoints = points[0].clone().lerp(points[1], leadIn / firstSegmentLength);
        const curvePoints = [guidePoints, ...points.slice(1)];
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const segments = Math.max(32, Math.ceil(curve.getLength() * 5));
        routeGuideMesh = new THREE.Mesh(
            new THREE.TubeGeometry(curve, segments, 0.045, 8, false),
            new THREE.MeshStandardMaterial({
                color: "#5cecff",
                emissive: "#19c9e8",
                emissiveIntensity: 2.2,
                roughness: 0.3,
            }),
        );
        routeGuideMesh.name = "province-route-guide";
        scene.object3D.add(routeGuideMesh);
        activeRouteIndex = index;
        lastRouteProgress = -1;
        routeStatusMessage = `Sigue la ruta luminosa hacia ${province.name}.`;
        drawWorldHud3d();
    }

    function updateRouteProgress(x, z) {
        if (activeRouteIndex === null) return;
        const province = provinces[activeRouteIndex];
        const distance = Math.hypot(x - province.position[0], z - province.position[1]);
        if (distance <= 4) {
            routeStatusMessage = `Llegaste a ${province.name}.`;
            activeRouteIndex = null;
            drawWorldHud3d();
            return;
        }

        const roundedDistance = Math.round(distance);
        if (roundedDistance === lastRouteProgress) return;
        lastRouteProgress = roundedDistance;
        routeStatusMessage = `Hacia ${province.name}: aproximadamente ${roundedDistance} m.`;
        drawWorldHud3d();
    }

    document.querySelectorAll(".touch-stick").forEach((stick) => {
        const axis = stick.dataset.stick;
        let activePointer = null;

        const updateStick = (event) => {
            const bounds = stick.getBoundingClientRect();
            const radius = Math.min(bounds.width, bounds.height) * 0.34;
            const x = (event.clientX - (bounds.left + bounds.width / 2)) / radius;
            const y = (event.clientY - (bounds.top + bounds.height / 2)) / radius;
            const magnitude = Math.hypot(x, y);
            const scale = magnitude > 1 ? 1 / magnitude : 1;
            const values = [x * scale, y * scale];
            touchSticks[axis] = values.map((value) => Math.abs(value) < 0.12 ? 0 : value);
            stick.style.setProperty("--stick-x", `${values[0] * radius}px`);
            stick.style.setProperty("--stick-y", `${values[1] * radius}px`);
        };
        const releaseStick = () => {
            activePointer = null;
            touchSticks[axis] = [0, 0];
            stick.style.setProperty("--stick-x", "0px");
            stick.style.setProperty("--stick-y", "0px");
        };

        stick.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            activePointer = event.pointerId;
            stick.setPointerCapture(event.pointerId);
            updateStick(event);
        });
        stick.addEventListener("pointermove", (event) => {
            if (event.pointerId === activePointer) updateStick(event);
        });
        stick.addEventListener("pointerup", releaseStick);
        stick.addEventListener("pointercancel", releaseStick);
        stick.addEventListener("lostpointercapture", releaseStick);
    });

    const movementKeys = new Set([
        "KeyW", "KeyA", "KeyS", "KeyD",
        "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight",
    ]);
    document.addEventListener("keydown", (event) => {
        if (worldScreen.hidden || !movementKeys.has(event.code)) return;
        if (event.target instanceof HTMLElement && event.target.isContentEditable) return;
        event.preventDefault();
        keyboardKeys.add(event.code);
    });
    document.addEventListener("keyup", (event) => {
        keyboardKeys.delete(event.code);
    });

    window.addEventListener("blur", () => {
        keyboardKeys.clear();
        Object.keys(touchSticks).forEach((axis) => {
            touchSticks[axis] = [0, 0];
        });
        document.querySelectorAll(".touch-stick").forEach((stick) => {
            stick.style.setProperty("--stick-x", "0px");
            stick.style.setProperty("--stick-y", "0px");
        });
    });

    function toggleVr() {
        const scene = sceneHost.querySelector("a-scene");
        if (!scene) return;
        vrStatusMessage = "";
        drawWorldHud3d();
        try {
            const transition = scene.is("vr-mode") ? scene.exitVR() : scene.enterVR();
            if (transition && typeof transition.catch === "function") {
                transition.catch(() => {
                    vrStatusMessage = "Este navegador no permite iniciar VR.";
                    drawWorldHud3d();
                });
            }
        } catch (error) {
            console.error("No se pudo iniciar el modo VR.", error);
            vrStatusMessage = "Este navegador no permite iniciar VR.";
            drawWorldHud3d();
        }
    }

    function createAmbientSoundscape(context) {
        ambientMasterGain = context.createGain();
        ambientMasterGain.gain.value = 0;
        ambientMasterGain.connect(context.destination);

        const noiseBuffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
        const noise = noiseBuffer.getChannelData(0);
        for (let index = 0; index < noise.length; index += 1) {
            noise[index] = Math.random() * 2 - 1;
        }

        const createNoiseLayer = (type, frequency, volume) => {
            const source = context.createBufferSource();
            source.buffer = noiseBuffer;
            source.loop = true;
            const filter = context.createBiquadFilter();
            filter.type = type;
            filter.frequency.value = frequency;
            const gain = context.createGain();
            gain.gain.value = volume;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(ambientMasterGain);
            source.start();
        };

        createNoiseLayer("bandpass", 850, 0.3);
        createNoiseLayer("bandpass", 420, 0.09);
        createNoiseLayer("lowpass", 240, 0.18);
    }

    function playBirdChirp() {
        if (!ambientEnabled || !ambientAudioContext || !ambientMasterGain) return;
        const context = ambientAudioContext;
        const now = context.currentTime;
        const birdCount = 1 + Math.floor(Math.random() * 2);

        for (let bird = 0; bird < birdCount; bird += 1) {
            const start = now + bird * 0.24;
            const duration = 0.12 + Math.random() * 0.12;
            const baseFrequency = 1750 + Math.random() * 1150;
            const oscillator = context.createOscillator();
            const envelope = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(baseFrequency, start);
            oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * (1.12 + Math.random() * 0.24), start + duration * 0.45);
            oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 0.92, start + duration);
            envelope.gain.setValueAtTime(0.0001, start);
            envelope.gain.exponentialRampToValueAtTime(0.035, start + 0.025);
            envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            oscillator.connect(envelope);
            envelope.connect(ambientMasterGain);
            oscillator.start(start);
            oscillator.stop(start + duration + 0.01);
        }
    }

    async function toggleAmbientSound() {
        if (!ambientAudioContext) {
            const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextConstructor) {
                soundStatusMessage = "Este navegador no admite sonido.";
                drawWorldHud3d();
                return;
            }
            ambientAudioContext = new AudioContextConstructor();
            createAmbientSoundscape(ambientAudioContext);
        }

        if (ambientEnabled) {
            ambientEnabled = false;
            window.clearTimeout(birdTimer);
            ambientMasterGain.gain.cancelScheduledValues(ambientAudioContext.currentTime);
            ambientMasterGain.gain.setTargetAtTime(0, ambientAudioContext.currentTime, 0.18);
            soundStatusMessage = "Sonido ambiental desactivado.";
            drawWorldHud3d();
            return;
        }

        try {
            await ambientAudioContext.resume();
            ambientEnabled = true;
            ambientMasterGain.gain.cancelScheduledValues(ambientAudioContext.currentTime);
            ambientMasterGain.gain.setTargetAtTime(0.32, ambientAudioContext.currentTime, 0.35);
            soundStatusMessage = "Aves y brisa activadas.";
            drawWorldHud3d();
            playBirdChirp();
            const scheduleBirds = () => {
                if (!ambientEnabled) return;
                playBirdChirp();
                birdTimer = window.setTimeout(scheduleBirds, 2600 + Math.random() * 4300);
            };
            birdTimer = window.setTimeout(scheduleBirds, 1200 + Math.random() * 1800);
        } catch (error) {
            console.error("No se pudo activar el sonido ambiental.", error);
            soundStatusMessage = "No se pudo activar el sonido.";
            drawWorldHud3d();
        }
    }

    window.addEventListener("pagehide", () => {
        window.clearTimeout(birdTimer);
        if (ambientAudioContext && ambientAudioContext.state !== "closed") {
            ambientAudioContext.close();
        }
    }, { once: true });

    function villageBuildings(province) {
        const [originX, originZ] = province.position;
        const provinceIndex = provinces.findIndex(({ id }) => id === province.id);
        return villageModelLayouts[province.id].map((assetKey, buildingIndex) => {
            let position = null;
            for (const radius of villageBuildingRadii) {
                for (let attempt = 0; attempt < 36; attempt += 1) {
                    const angle = (attempt * 2.399963 + buildingIndex * 2.1 + provinceIndex * 1.7) % (Math.PI * 2);
                    const worldX = originX + Math.cos(angle) * radius;
                    const worldZ = originZ + Math.sin(angle) * radius;
                    if (!pointInsideMap(worldX, worldZ)
                        || nearHikingRoute(worldX, worldZ, 3.8)
                        || Math.hypot(worldX - originX, worldZ - originZ) < 6.5
                        || placedVillageBuildings.some(([x, z]) => Math.hypot(worldX - x, worldZ - z) < 6.2)) {
                        continue;
                    }
                    position = [worldX, worldZ, (buildingIndex * 90 + provinceIndex * 21) % 360];
                    placedVillageBuildings.push([worldX, worldZ]);
                    break;
                }
                if (position) break;
            }
            if (!position) {
                throw new Error(`No se encontró un espacio para las casas de ${province.name}.`);
            }

            const [worldX, worldZ, rotation] = position;
            const x = worldX - originX;
            const z = worldZ - originZ;
            const groundOffset = terrainHeight(originX + x, originZ + z) - terrainHeight(originX, originZ);
            const asset = modelAssets[assetKey];
            return `<a-entity class="world-collider" data-collider-radius="2.2"
                position="${x} ${groundOffset.toFixed(2)} ${z}" rotation="0 ${rotation} 0"
                model-stream="src: ${modelAssetDirectory}${asset.file}; label: ${asset.file}; range: 32"
                model-fit="width: ${asset.width}; height: ${asset.height}; depth: ${asset.depth}; label: ${asset.file}">
            </a-entity>`;
        }).join("");
    }

    function provinceMonument(province) {
        const monument = provinceMonuments[province.id];
        const asset = modelAssets[monument.asset];
        const [x, y, z] = monument.position;
        const loadRange = monument.asset === "frailejon" ? 28 : 36;
        const groundOffset = terrainHeight(province.position[0] + x, province.position[1] + z)
            - terrainHeight(province.position[0], province.position[1]);
        return `<a-entity class="province-monument" position="${x} ${(y + groundOffset).toFixed(2)} ${z}"
            rotation="0 35 0" role="img" aria-label="${province.name}: ${monument.description}">
            <a-entity class="world-collider" data-collider-radius="${monument.colliderRadius || Math.max(asset.width, asset.depth) / 2}"
                model-stream="src: ${modelAssetDirectory}${asset.file}; label: ${asset.file}; range: ${loadRange}"
                model-fit="width: ${asset.width}; height: ${asset.height}; depth: ${asset.depth}; colliderRadius: ${monument.colliderRadius || 0}; label: ${asset.file}">
            </a-entity>
        </a-entity>`;
    }

    function makeScene() {
        placedVillageBuildings.length = 0;
        const provinceEntities = provinces
            .map((province, index) => {
                const [x, z] = province.position;
                const y = terrainHeight(x, z);
                const model = provinceMonument(province);
                return `
                    <a-entity class="province-location" data-province-index="${index}" position="${x} ${y.toFixed(2)} ${z}" role="button" aria-label="Provincia ${province.name}" province-marker>
                        <a-circle position="0 0.055 0" rotation="-90 0 0" radius="7.5" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.12; transparent: true; opacity: 0.12"></a-circle>
                        <a-torus class="province-target" position="0 0.12 0" rotation="90 0 0" radius="2.35" radius-tubular="0.055" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.6"></a-torus>
                        <a-cylinder class="province-target province-beacon" position="0 1.25 0" radius="0.045" height="2.5" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.7; transparent: true; opacity: 0.7"></a-cylinder>
                        <a-sphere class="province-target province-beacon" position="0 2.6 0" radius="0.16" material="color: ${province.color}; emissive: ${province.color}; emissiveIntensity: 0.75" animation="property: position; to: 0 2.78 0; dir: alternate; dur: 1700; loop: true; easing: easeInOutSine"></a-sphere>
                        <a-entity class="province-name-label" position="0 3.15 0" scale="0.62 0.62 0.62" text="value: ${province.name.toUpperCase()}; align: center; anchor: center; width: 5.5; color: #f3fbff; wrapCount: 22"></a-entity>
                        <a-entity class="province-model">${villageBuildings(province)}${model}</a-entity>
                    </a-entity>`;
            })
            .join("");

        const [startX, startZ] = startingPosition;
        const startHeight = terrainHeight(startX, startZ);

        return `
            <a-scene class="metaverso-scene" embedded
                vr-mode-ui="enabled: false"
                shadow="type: pcfsoft"
                renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true; powerPreference: high-performance"
                background="color: #a9c8d1">
            <a-sky id="worldSky" color="#a9c8d1"></a-sky>
                <a-entity light="type: ambient; color: #fff3da; intensity: 0.65"></a-entity>
                <a-entity light="type: hemisphere; color: #d7efff; groundColor: #788952; intensity: 0.85"></a-entity>
                <a-entity light="type: directional; color: #fff0c2; intensity: 1.35" position="-25 38 14" shadow="cast: true; mapSize: 1024"></a-entity>

                <a-entity id="santanderMap" santander-terrain>
                    <a-entity santander-mountains></a-entity>
                    <a-entity santander-landscape></a-entity>
                    <a-entity santander-vegetation></a-entity>
                    <a-entity santander-roads></a-entity>
                    ${provinceEntities}
                </a-entity>

                <a-entity id="touristRig" position="${startX} ${startHeight.toFixed(2)} ${startZ}" tourist-physics>
                    <a-entity id="metaversoCamera" camera position="0 1.68 0"
                        look-controls="pointerLockEnabled: false; touchEnabled: true"
                        cursor="rayOrigin: mouse"
                        raycaster="objects: .province-target, .interactive-3d; far: 80">
                    </a-entity>
                    <a-entity id="leftController" laser-controls="hand: left" raycaster="objects: .province-target, .interactive-3d; far: 80"></a-entity>
                    <a-entity id="rightController" laser-controls="hand: right" raycaster="objects: .province-target, .interactive-3d; far: 80"></a-entity>
                </a-entity>
            </a-scene>`;
    }

    function registerSceneInteractions() {
        if (sceneInteractionsRegistered) return;

        const THREE = window.AFRAME.THREE;

        if (!window.AFRAME.components["model-stream"]) {
            window.AFRAME.registerComponent("model-stream", {
                schema: {
                    src: { type: "string" },
                    label: { type: "string", default: "modelo 3D" },
                    range: { type: "number", default: 42 },
                },
                init() {
                    this.requested = false;
                    this.lastCheck = -Infinity;
                    this.raycaster = new THREE.Raycaster();
                    this.direction = new THREE.Vector3();
                    this.origin = new THREE.Vector3();
                    this.target = new THREE.Vector3();
                    this.handleLoaded = () => {
                        this.requested = true;
                        this.el.object3D.visible = true;
                    };
                    this.el.addEventListener("model-loaded", this.handleLoaded);
                },
                tick(time) {
                    if (time - this.lastCheck < 450) return;
                    this.lastCheck = time;

                    const scene = this.el.sceneEl;
                    const touristRig = scene.querySelector("#touristRig");
                    if (!touristRig) return;
                    const model = this.el.getObject3D("mesh");
                    const entityPosition = this.el.object3D.getWorldPosition(this.target);
                    const playerPosition = touristRig.object3D.getWorldPosition(this.origin);
                    const distance = entityPosition.distanceTo(playerPosition);
                    if (distance > this.data.range) {
                        if (model) this.el.object3D.visible = false;
                        return;
                    }

                    if (model && distance > 20 && scene.__santanderTerrain) {
                        const camera = scene.camera;
                        if (camera) camera.getWorldPosition(this.origin);
                        this.direction.subVectors(entityPosition, this.origin);
                        const targetDistance = this.direction.length();
                        this.direction.normalize();
                        this.raycaster.set(this.origin, this.direction);
                        this.raycaster.far = Math.max(0, targetDistance - 2);
                        if (this.raycaster.intersectObject(scene.__santanderTerrain, false).length) {
                            this.el.object3D.visible = false;
                            return;
                        }
                    }

                    if (model) {
                        this.el.object3D.visible = true;
                    } else if (!this.requested) {
                        this.requested = true;
                        this.el.setAttribute("gltf-model", this.data.src);
                    }
                },
                remove() {
                    this.el.removeEventListener("model-loaded", this.handleLoaded);
                },
            });
        }

        if (!window.AFRAME.components["model-fit"]) {
            window.AFRAME.registerComponent("model-fit", {
                schema: {
                    width: { type: "number", default: 4 },
                    height: { type: "number", default: 3.5 },
                    depth: { type: "number", default: 4 },
                    colliderRadius: { type: "number", default: 0 },
                    label: { type: "string", default: "modelo 3D" },
                },
                init() {
                    this.showFallback = (error) => {
                        console.error(`No se pudo cargar el modelo ${this.data.label}; se usará una figura sencilla.`, error);
                        const fallback = new THREE.Group();
                        const isTorch = this.data.label === "antorcha.glb";
                        const bodyMaterial = new THREE.MeshStandardMaterial({
                            color: isTorch ? "#68472d" : "#55786b",
                            roughness: 0.82,
                        });
                        const topMaterial = new THREE.MeshStandardMaterial({
                            color: isTorch ? "#ff8b28" : "#75d7c3",
                            emissive: isTorch ? "#b84308" : "#17483f",
                            roughness: 0.55,
                        });
                        const body = isTorch
                            ? new THREE.Mesh(
                                new THREE.CylinderGeometry(this.data.width * 0.055, this.data.width * 0.09, this.data.height * 0.68, 8),
                                bodyMaterial,
                            )
                            : new THREE.Mesh(
                                new THREE.BoxGeometry(this.data.width * 0.58, this.data.height * 0.56, this.data.depth * 0.58),
                                bodyMaterial,
                            );
                        body.position.y = this.data.height * (isTorch ? 0.34 : 0.28);
                        fallback.add(body);

                        const top = new THREE.Mesh(
                            new THREE.ConeGeometry(Math.min(this.data.width, this.data.depth) * 0.28, this.data.height * 0.3, 8),
                            topMaterial,
                        );
                        top.position.y = this.data.height * (isTorch ? 0.82 : 0.72);
                        fallback.add(top);

                        this.el.setObject3D("mesh", fallback);
                        this.el.object3D.visible = true;
                        this.el.dataset.colliderRadius = String(
                            this.data.colliderRadius || Math.max(this.data.width, this.data.depth) / 2,
                        );
                        routeStatusMessage = `${this.data.label} no cargó; se muestra una figura sencilla.`;
                        drawWorldHud3d();
                    };
                    this.fitModel = () => {
                        const model = this.el.getObject3D("mesh");
                        if (!model || model.userData.metaversoModelFitted) return;

                        try {
                            model.updateMatrixWorld(true);
                            const bounds = new THREE.Box3().setFromObject(model);
                            const size = bounds.getSize(new THREE.Vector3());
                            if (![size.x, size.y, size.z].every((dimension) => Number.isFinite(dimension) && dimension > 0)) {
                                throw new Error(`El archivo ${this.data.label} no contiene geometría válida.`);
                            }

                            const scale = Math.min(
                                this.data.width / size.x,
                                this.data.height / size.y,
                                this.data.depth / size.z,
                            );
                            model.scale.multiplyScalar(scale);
                            model.updateMatrixWorld(true);

                            const fittedBounds = new THREE.Box3().setFromObject(model);
                            const fittedSize = fittedBounds.getSize(new THREE.Vector3());
                            const center = fittedBounds.getCenter(new THREE.Vector3());
                            center.y = fittedBounds.min.y;
                            this.el.object3D.worldToLocal(center);
                            model.position.sub(center);
                            this.el.dataset.colliderRadius = String(
                                this.data.colliderRadius || Math.max(fittedSize.x, fittedSize.z) / 2,
                            );
                            model.userData.metaversoModelFitted = true;
                        } catch (error) {
                            this.showFallback(error);
                        }
                    };
                    this.handleModelError = (event) => {
                        this.showFallback(event.detail);
                    };
                    this.el.addEventListener("model-loaded", this.fitModel);
                    this.el.addEventListener("model-error", this.handleModelError);
                },
                remove() {
                    this.el.removeEventListener("model-loaded", this.fitModel);
                    this.el.removeEventListener("model-error", this.handleModelError);
                },
            });
        }

        if (!window.AFRAME.components["santander-terrain"]) {
            window.AFRAME.registerComponent("santander-terrain", {
                init() {
                    const columns = 89;
                    const rows = 103;
                    const minX = -44;
                    const minZ = -53;
                    const positions = [];
                    const colors = [];
                    const uvs = [];
                    const indices = [];
                    const vertexIndex = (column, row) => row * (columns + 1) + column;
                    const lowland = new THREE.Color("#82a95e");
                    const highland = new THREE.Color("#b5a978");
                    const coldland = new THREE.Color("#9eaf89");
                    const aridland = new THREE.Color("#b09a6b");
                    const pointColor = new THREE.Color();

                    for (let row = 0; row <= rows; row += 1) {
                        for (let column = 0; column <= columns; column += 1) {
                            const x = minX + column;
                            const z = minZ + row;
                            const height = terrainHeight(x, z);
                            positions.push(x, height, z);
                            uvs.push(column / 7, row / 7);
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
                    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
                    geometry.setIndex(indices);
                    geometry.computeVertexNormals();
                    const textureCanvas = document.createElement("canvas");
                    textureCanvas.width = 256;
                    textureCanvas.height = 256;
                    const context = textureCanvas.getContext("2d");
                    if (!context) throw new Error("No se pudo crear la textura del terreno.");
                    context.fillStyle = "#e7ead2";
                    context.fillRect(0, 0, 256, 256);
                    let seed = 41;
                    const nextNoise = () => {
                        seed = (seed * 16807) % 2147483647;
                        return (seed - 1) / 2147483646;
                    };
                    for (let index = 0; index < 2200; index += 1) {
                        const shade = index % 3 === 0 ? "63, 91, 43" : "131, 135, 78";
                        context.fillStyle = `rgba(${shade}, ${0.08 + nextNoise() * 0.17})`;
                        context.beginPath();
                        context.ellipse(
                            nextNoise() * 256,
                            nextNoise() * 256,
                            0.6 + nextNoise() * 2.2,
                            0.5 + nextNoise() * 1.4,
                            nextNoise() * Math.PI,
                            0,
                            Math.PI * 2,
                        );
                        context.fill();
                    }
                    const groundTexture = new THREE.CanvasTexture(textureCanvas);
                    groundTexture.wrapS = THREE.RepeatWrapping;
                    groundTexture.wrapT = THREE.RepeatWrapping;
                    groundTexture.colorSpace = THREE.SRGBColorSpace;
                    const material = new THREE.MeshStandardMaterial({
                        map: groundTexture,
                        vertexColors: true,
                        roughness: 0.92,
                        metalness: 0,
                        side: THREE.DoubleSide,
                    });
                    this.mesh = new THREE.Mesh(geometry, material);
                    this.mesh.receiveShadow = true;
                    this.el.object3D.add(this.mesh);
                    this.el.sceneEl.__santanderTerrain = this.mesh;

                },
                remove() {
                    this.mesh?.geometry.dispose();
                    this.mesh?.material.map?.dispose();
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
                        new THREE.LineBasicMaterial({ color: "#d8d6a5", transparent: true, opacity: 0.055 }),
                    );
                    this.el.object3D.add(grid);

                    hikingRoutes.forEach((route) => {
                        const curve = new THREE.CatmullRomCurve3(
                            route.map(([x, z]) => new THREE.Vector3(x, 0, z)),
                        );
                        const vertices = [];
                        const faces = [];
                        const count = 140;
                        const width = 0.82;
                        for (let index = 0; index <= count; index += 1) {
                            const point = curve.getPointAt(index / count);
                            const tangent = curve.getTangentAt(index / count);
                            const sideX = -tangent.z;
                            const sideZ = tangent.x;
                            const leftX = point.x - sideX * width;
                            const leftZ = point.z - sideZ * width;
                            const rightX = point.x + sideX * width;
                            const rightZ = point.z + sideZ * width;
                            vertices.push(leftX, terrainHeight(leftX, leftZ) + 0.07, leftZ);
                            vertices.push(rightX, terrainHeight(rightX, rightZ) + 0.07, rightZ);
                            if (index < count) {
                                const start = index * 2;
                                faces.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
                            }
                        }
                        const pathGeometry = new THREE.BufferGeometry();
                        pathGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
                        pathGeometry.setIndex(faces);
                        pathGeometry.computeVertexNormals();
                        this.el.object3D.add(new THREE.Mesh(
                            pathGeometry,
                            new THREE.MeshStandardMaterial({
                                color: "#a78155",
                                roughness: 1,
                                side: THREE.DoubleSide,
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
                        if (nearHikingRoute(x, z, 2.2)) continue;

                        const ground = terrainHeight(x, z);
                        const scale = 0.72 + (attempt % 5) * 0.12;
                        transform.position.set(x, ground + 0.625 * scale, z);
                        transform.scale.setScalar(scale);
                        transform.updateMatrix();
                        trunk.setMatrixAt(placed, transform.matrix);
                        transform.position.y = ground + 2.35 * scale;
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

                    this.el.sceneEl.__santanderColliders = colliders;
                },
            });
        }

        if (!window.AFRAME.components["santander-mountains"]) {
            window.AFRAME.registerComponent("santander-mountains", {
                init() {
                    const centroid = mapBoundary.reduce(
                        (center, [x, z]) => [center[0] + x / mapBoundary.length, center[1] + z / mapBoundary.length],
                        [0, 0],
                    );
                    const mountains = [];
                    mapBoundary.forEach(([startX, startZ], index) => {
                        const [endX, endZ] = mapBoundary[(index + 1) % mapBoundary.length];
                        const segmentX = endX - startX;
                        const segmentZ = endZ - startZ;
                        const length = Math.hypot(segmentX, segmentZ);
                        const outward = new THREE.Vector2(segmentZ, -segmentX).normalize();
                        const midpointX = (startX + endX) / 2;
                        const midpointZ = (startZ + endZ) / 2;
                        const towardOutside = new THREE.Vector2(midpointX - centroid[0], midpointZ - centroid[1]);
                        if (outward.dot(towardOutside) < 0) outward.negate();

                        const count = Math.max(1, Math.ceil(length / 3.8));
                        for (let step = 0; step < count; step += 1) {
                            const progress = (step + 0.5) / count;
                            const boundaryX = startX + segmentX * progress;
                            const boundaryZ = startZ + segmentZ * progress;
                            const x = boundaryX + outward.x * 2;
                            const z = boundaryZ + outward.y * 2;
                            const height = 7 + mountains.length % 4 * 1.5;
                            mountains.push({
                                x,
                                z,
                                y: terrainHeight(boundaryX, boundaryZ) + height / 2 - 0.3,
                                radius: 3.2 + mountains.length % 3 * 0.55,
                                height,
                            });
                        }
                    });

                    const mesh = new THREE.InstancedMesh(
                        new THREE.ConeGeometry(1, 1, 6),
                        new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 }),
                        mountains.length,
                    );
                    const transform = new THREE.Object3D();
                    const colors = ["#40583c", "#516844", "#64754b"];
                    mountains.forEach((mountain, index) => {
                        transform.position.set(mountain.x, mountain.y, mountain.z);
                        transform.scale.set(mountain.radius, mountain.height, mountain.radius);
                        transform.rotation.y = (index % 5) * 0.24;
                        transform.updateMatrix();
                        mesh.setMatrixAt(index, transform.matrix);
                        mesh.setColorAt(index, new THREE.Color(colors[index % colors.length]));
                    });
                    mesh.count = mountains.length;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.computeBoundingSphere();
                    this.el.object3D.add(mesh);
                },
            });
        }

        if (!window.AFRAME.components["tourist-physics"]) {
            window.AFRAME.registerComponent("tourist-physics", {
                init() {
                    this.velocity = new THREE.Vector3();
                    this.grounded = true;
                    this.lastNearbyProvinceIndex = null;
                    this.lastRingProvinceIndex = -1;
                    this.radius = 0.42;
                    this.walkSpeed = 4.2;
                    this.scene = this.el.sceneEl;
                    this.castRay = new THREE.Raycaster();
                    this.down = new THREE.Vector3(0, -1, 0);
                    this.colliders = null;
                },
                readThumbstick(hand) {
                    const scene = this.scene;
                    if (!scene.is("vr-mode")) {
                        const gamepad = Array.from(navigator.getGamepads?.() || [])
                            .find((candidate) => candidate && candidate.connected && candidate.axes.length >= 2);
                        if (gamepad) {
                            const axisOffset = gamepad.axes.length >= 4 ? (hand === "left" ? 0 : 2) : 0;
                            const axes = [gamepad.axes[axisOffset] || 0, gamepad.axes[axisOffset + 1] || 0];
                            if (Math.hypot(axes[0], axes[1]) > 0.12) return axes;
                        }
                        return touchSticks[hand === "left" ? "move" : "look"];
                    }
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
                    const terrainHit = this.castRay.intersectObject(mesh, false)[0];
                    const groundHeight = terrainHit?.point.y ?? terrainHeight(x, z);
                    if (!terrainHit) {
                        const sampleDistance = 0.25;
                        const normal = new THREE.Vector3(
                            terrainHeight(x - sampleDistance, z) - terrainHeight(x + sampleDistance, z),
                            sampleDistance * 2,
                            terrainHeight(x, z - sampleDistance) - terrainHeight(x, z + sampleDistance),
                        ).normalize();
                        return { height: groundHeight, normal, surface: "terrain" };
                    }
                    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
                    return {
                        height: terrainHit.point.y,
                        normal: terrainHit.face.normal.clone().applyMatrix3(normalMatrix).normalize(),
                        surface: "terrain",
                    };
                },
                isInsideBounds(x, z) {
                    return pointInsideMap(x, z)
                        && distanceToMapBoundary(x, z) >= this.radius + 0.65;
                },
                blockedByLandmark(x, z, height, currentX, currentZ) {
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
                    return this.colliders.some((collider) => {
                        if (Math.abs(collider.y - height) >= 7) return false;
                        const minimumDistance = this.radius + collider.radius;
                        const nextDistance = Math.hypot(x - collider.x, z - collider.z);
                        if (nextDistance >= minimumDistance) return false;

                        const currentDistance = Math.hypot(currentX - collider.x, currentZ - collider.z);
                        return currentDistance >= minimumDistance || nextDistance <= currentDistance;
                    });
                },
                tick(time, delta) {
                    const camera = this.scene.camera;
                    if (!camera || activePanorama) return;
                    const elapsed = Math.min(delta / 1000, 0.04);
                    if (!elapsed) return;
                    const leftStick = this.readThumbstick("left");
                    const rightStick = this.readThumbstick("right");
                    const keyboardX = Number(keyboardKeys.has("KeyD") || keyboardKeys.has("ArrowRight"))
                        - Number(keyboardKeys.has("KeyA") || keyboardKeys.has("ArrowLeft"));
                    const keyboardY = Number(keyboardKeys.has("KeyS") || keyboardKeys.has("ArrowDown"))
                        - Number(keyboardKeys.has("KeyW") || keyboardKeys.has("ArrowUp"));
                    const moveX = THREE.MathUtils.clamp(leftStick[0] + (this.scene.is("vr-mode") ? 0 : keyboardX), -1, 1);
                    const moveY = THREE.MathUtils.clamp(leftStick[1] + (this.scene.is("vr-mode") ? 0 : keyboardY), -1, 1);
                    const forwardInput = Math.abs(moveY) > 0.12 ? -moveY : 0;
                    const strafeInput = Math.abs(moveX) > 0.12 ? moveX : 0;
                    if (Math.abs(rightStick[0]) > 0.12) {
                        this.el.object3D.rotation.y -= rightStick[0] * elapsed * 1.8;
                    }
                    if (!this.scene.is("vr-mode") && Math.abs(rightStick[1]) > 0.12) {
                        const cameraRotation = this.scene.querySelector("#metaversoCamera").object3D.rotation;
                        cameraRotation.x = THREE.MathUtils.clamp(
                            cameraRotation.x - rightStick[1] * elapsed * 1.35,
                            -Math.PI / 2,
                            Math.PI / 2,
                        );
                    }

                    const direction = new THREE.Vector3();
                    camera.getWorldDirection(direction);
                    direction.y = 0;
                    if (direction.lengthSq() < 0.0001) {
                        const cameraRotation = new THREE.Euler().setFromQuaternion(
                            camera.getWorldQuaternion(new THREE.Quaternion()),
                            "YXZ",
                        );
                        direction.set(-Math.sin(cameraRotation.y), 0, -Math.cos(cameraRotation.y));
                    }
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
                    const onHikingTrail = nearHikingRoute(nextX, nextZ, hikingTrail.walkableWidth);
                    const canClimb = ground && (ground.normal.y >= slopeLimit || onHikingTrail)
                        && ground.height <= current.y + 0.6;
                    const collision = ground && this.blockedByLandmark(
                        nextX,
                        nextZ,
                        ground.height,
                        current.x,
                        current.z,
                    );
                    if (ground && canEnterMap && canClimb && !collision) {
                        current.x = nextX;
                        current.z = nextZ;
                    } else {
                        this.velocity.x *= 0.35;
                        this.velocity.z *= 0.35;
                    }

                    const underfoot = this.getGround(current.x, current.z);
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
                        const onCurrentTrail = nearHikingRoute(current.x, current.z, hikingTrail.walkableWidth);
                        const steep = underfoot.normal.y < slopeLimit && !onCurrentTrail;
                        if (steep) {
                            this.velocity.x += underfoot.normal.x * 9.81 * underfoot.normal.y * elapsed;
                            this.velocity.z += underfoot.normal.z * 9.81 * underfoot.normal.y * elapsed;
                            this.grounded = false;
                        } else {
                            const friction = input.lengthSq() > 0 ? 1 : Math.exp(-7.5 * elapsed);
                            this.velocity.x *= friction;
                            this.velocity.z *= friction;
                            this.grounded = true;
                        }
                    } else {
                        this.velocity.y -= 9.81 * elapsed;
                        current.y += this.velocity.y * elapsed;
                        this.grounded = false;
                    }

                    const nearbyProvinceIndex = provinces.findIndex(({ position }) =>
                        Math.hypot(current.x - position[0], current.z - position[1]) < 8);
                    if (nearbyProvinceIndex !== this.lastNearbyProvinceIndex) {
                        this.lastNearbyProvinceIndex = nearbyProvinceIndex;
                        if (nearbyProvinceIndex >= 0) showProvince(nearbyProvinceIndex, true);
                    }

                    const previousRingIndex = this.lastRingProvinceIndex;
                    let ringProvinceIndex = -1;
                    if (previousRingIndex >= 0) {
                        const [previousX, previousZ] = provinces[previousRingIndex].position;
                        if (Math.hypot(current.x - previousX, current.z - previousZ) < 3.05) {
                            ringProvinceIndex = previousRingIndex;
                        }
                    }
                    if (ringProvinceIndex < 0) {
                        ringProvinceIndex = provinces.findIndex(({ position }) =>
                            Math.hypot(current.x - position[0], current.z - position[1]) < 2.55);
                    }
                    if (ringProvinceIndex !== previousRingIndex) {
                        this.lastRingProvinceIndex = ringProvinceIndex;
                        setMunicipalityCarousel(ringProvinceIndex >= 0 ? ringProvinceIndex : null);
                    }

                    if (municipalityCarousel?.object3D.visible && municipalityCarouselOrbit) {
                        if (!municipalityCarouselPaused) municipalityCarouselOrbit.object3D.rotation.y += elapsed * 0.42;
                        municipalityCarouselOrbit.querySelectorAll(".municipality-360-card").forEach((card, index) => {
                            card.object3D.position.y = municipalityCarouselPaused
                                ? 0
                                : Math.sin(time * 0.0016 + index * 1.4) * 0.12;
                        });
                    }
                    updateRouteProgress(current.x, current.z);
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
            scene.addEventListener("enter-vr", () => {
                worldScreen.classList.add("vr-active");
                vrStatusMessage = "";
                drawWorldHud3d();
            });
            scene.addEventListener("exit-vr", () => {
                worldScreen.classList.remove("vr-active");
                drawWorldHud3d();
            });
            scene.querySelectorAll("[laser-controls]").forEach((controller) => {
                controller.addEventListener("triggerdown", () => {
                    const intersections = controller.components.raycaster?.intersections || [];
                    const target = intersections[0]?.object?.el;
                    const marker = target?.closest(".province-location");
                    if (marker) {
                        showProvince(Number(marker.dataset.provinceIndex));
                        return;
                    }
                    target?.closest(".interactive-3d")?.emit("click");
                });
            });
            let sceneLoaded = false;

            const onSceneLoaded = () => {
                if (attempt !== activeAttempt || sceneLoaded) return;
                sceneLoaded = true;
                try {
                    setupWorldHud3d(scene);
                } catch (error) {
                    console.error("No se pudo crear la interfaz 3D del metaverso.", error);
                    showLoadError("No se pudo preparar la interfaz 3D. Vuelve a intentarlo.", attempt);
                    return;
                }
                window.clearTimeout(loadTimeout);
                setProgress(100, "¡El metaverso está listo!");
                window.setTimeout(() => {
                    if (attempt !== activeAttempt) return;
                    loaderScreen.hidden = true;
                    worldScreen.hidden = false;
                    keyboardProvinceControls.hidden = false;
                    keyboardProvinceControls.querySelector("summary").focus();
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
        keyboardProvinceControls.hidden = true;
        sceneHost.replaceChildren();
        worldScreen.hidden = false;
        consentScreen.hidden = true;
        loaderScreen.hidden = false;
        setProgress(8, "Iniciando la experiencia...");
        loaderStatus.focus();
        loadAFrame(attempt);
    }

    activateButton.addEventListener("click", beginExperience);
    retryButton.addEventListener("click", beginExperience);
})();
