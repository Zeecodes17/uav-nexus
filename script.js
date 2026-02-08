document.addEventListener("DOMContentLoaded", () => {

    // Inject PWA manifest + theme color once
    if (!document.querySelector('link[rel="manifest"]')) {
        const manifest = document.createElement("link");
        manifest.rel = "manifest";
        manifest.href = "manifest.json";
        document.head.appendChild(manifest);

        const themeMeta = document.createElement("meta");
        themeMeta.name = "theme-color";
        themeMeta.content = "#0f0f0f";
        document.head.appendChild(themeMeta);
    }

    fetch("sidebar.partial")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("afterbegin", html);
            setupTheme();
        })
        .catch(() => {
            console.warn("Sidebar not loaded");
        });
});


let currentStep = 1;
const totalSteps = 5;

const stepTitle = document.getElementById("stepTitle");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function showStep(step) {

    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
        document.getElementById("step" + i).style.display = "none";
    }

    // Show current step
    document.getElementById("step" + step).style.display = "block";

    // Update title
    // Update title
if (step === 1) stepTitle.textContent = "Step 1: Mission Definition & Compliance";
else if (step === 2) stepTitle.textContent = "Step 2: Operating Environment";
else if (step === 3) stepTitle.textContent = "Step 3: Payload & Platform Preference";
else if (step === 4) stepTitle.textContent = "Step 4: Endurance & Budget Constraints";
else if (step === 5) stepTitle.textContent = "Step 5: Design Recommendation";

    // Button states (THIS IS ALL THAT MATTERS)
    prevBtn.disabled = false;
    nextBtn.disabled = step === totalSteps;
}

nextBtn.addEventListener("click", () => {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);

        // If entering result step
        if (currentStep === 5) {
            generateRecommendation();
        }
    }
});

prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    } else {
        // Step 1 → go back to Home
        window.location.href = "index.html";
    }
});

// Initialize
showStep(currentStep);

function generateRecommendation() {

    // Read inputs
    let weight = document.getElementById("weight").value;
    let mission = document.getElementById("mission").value;
    let control = document.getElementById("control").value;
    let environment = document.getElementById("environment").value;
    let gps = document.getElementById("gps").value;
    let area = parseFloat(document.getElementById("area").value) || 500;
    let obstacles = document.getElementById("obstacles").value;
    let payload = document.getElementById("payload").value;
    let preference = document.getElementById("preference").value;
    let flightTime = document.getElementById("flightTime").value;
    let budgetValue = parseFloat(document.getElementById("budget").value) || 15000;

    let reasons = [];

    // Budget category
    let budgetCategory = "Medium";
    if (budgetValue < 8000) {
        budgetCategory = "Low";
    } else if (budgetValue > 20000) {
        budgetCategory = "High";
    }

    // Area category
    let areaCategory = "Medium";
    if (area < 50) areaCategory = "Very Small";
    else if (area < 300) areaCategory = "Small";
    else if (area < 2000) areaCategory = "Medium";
    else if (area < 10000) areaCategory = "Large";
    else areaCategory = "Very Large";

    // Rotorcraft selection
let idealRotorcraft = "Quadcopter";
let rotorcraft = "Quadcopter";
let tradeoffs = [];

// Ideal logic
if (weight.includes("Small") || payload === "Delivery Package") {
    idealRotorcraft = "Hexacopter";
    reasons.push("Higher payload requires more rotors to distribute thrust and improve stability (standard multirotor design practice)");
}

if (weight.includes("Medium") || weight.includes("Large")) {
    idealRotorcraft = "Octocopter";
    reasons.push("Medium and large UAVs require additional rotors for lift capacity and redundancy, as used in industrial multirotors");
}

// Default to ideal
rotorcraft = idealRotorcraft;

// Preference override
if (preference !== "No Preference" && preference !== idealRotorcraft) {
    rotorcraft = preference;

    // Generate trade-offs
    if (idealRotorcraft === "Hexacopter" && preference === "Quadcopter") {
        tradeoffs.push("Reduced payload capacity");
        tradeoffs.push("No motor redundancy in case of failure");
    }

    if (idealRotorcraft === "Octocopter" && preference === "Hexacopter") {
        tradeoffs.push("Lower redundancy compared to octocopter");
        tradeoffs.push("Reduced heavy-lift capability");
    }

    if (idealRotorcraft === "Octocopter" && preference === "Quadcopter") {
        tradeoffs.push("Significantly lower lift capacity");
        tradeoffs.push("No redundancy for heavy payload operations");
    }
}

    // Frame selection
let frame = "X-frame";

if (payload === "Camera" || payload === "LiDAR") {
    frame = "H-frame";
    reasons.push("H-frame provides wider front clearance and stable geometry for sensor payloads, commonly used in aerial imaging drones");
}

if (mission === "Racing") {
    frame = "X-frame";
    reasons.push("X-frame provides agility for racing");
}

    // Motor class
    let motor = "800–1000 KV";
    if (flightTime === "20–40 minutes") {
        motor = "600–800 KV";
        reasons.push("Lower KV motors produce higher torque and work efficiently with larger propellers for endurance flights");
    }
    if (flightTime === "More than 40 minutes") {
        motor = "400–600 KV";
        reasons.push("Very low KV motors are optimized for large propellers and long-endurance UAV missions");
    }

    // Propeller
    let prop = "9–10 inch";
    if (flightTime === "20–40 minutes") {
        prop = "10–12 inch";
    }
    if (flightTime === "More than 40 minutes") {
        prop = "13–15 inch";
    }

    // Material
    let material = "Carbon fiber";
    if (budgetCategory === "Low") {
        material = "Plastic or aluminum";
    }
    if (budgetCategory === "High") {
        material = "Carbon fiber composite";
    }

    // Sensors
let sensors = [];

// Core sensor
sensors.push("IMU (Inertial Measurement Unit)");

// GPS-based logic
if (gps === "Yes") {
    sensors.push("GPS module");
} else if (control.includes("Autonomous")) {
    sensors.push("Camera or LiDAR for SLAM");
    reasons.push("Autonomous flight without GPS requires vision or LiDAR-based localization");
}

// Mission-based sensors
if (mission === "Mapping" || mission === "Surveillance" || mission === "Inspection") {
    sensors.push("Camera");
    reasons.push("Visual missions require onboard camera systems");
}

if (mission === "Search & Rescue") {
    sensors.push("Camera");
    sensors.push("Thermal or LiDAR (optional)");
    reasons.push("Search missions benefit from visual and depth sensing");
}

if (mission === "Delivery") {
    sensors.push("Altitude sensor");
    reasons.push("Delivery drones use altitude sensing for safe landing");
}

// Payload-based sensors
if (payload === "Camera") sensors.push("Camera");
if (payload === "LiDAR") sensors.push("LiDAR");

// Obstacle-based sensors
if (obstacles === "Moderate") {
    sensors.push("Ultrasonic or optical flow sensor");
    reasons.push("Moderate obstacles require basic distance sensing");
}

if (obstacles === "Many") {
    sensors.push("LiDAR or depth camera");
    reasons.push("Dense obstacles require advanced distance sensing");
}
// Remove duplicate sensors
sensors = [...new Set(sensors)];

    // Control system
    let controlSystem = "Manual RC Control";

if (control.includes("Autonomous")) {
    if (gps === "Yes") {
        controlSystem = "Autonomous GPS waypoint navigation";
        reasons.push("Autonomous outdoor missions use GPS-based navigation");
    } else {
        controlSystem = "Vision/SLAM-based autonomous navigation";
        reasons.push("Without GPS, autonomous flight relies on vision or SLAM-based localization methods");
    }
}

    // Path planning
    let path = "Waypoint Navigation";
    if (mission === "Mapping") {
        path = "Grid (Lawnmower) Pattern";
        reasons.push("Mapping missions use grid (lawnmower) patterns to ensure full area coverage without gaps");
    }
    if (obstacles === "Many") {
        path = "RRT-based obstacle avoidance";
        reasons.push("Obstacle-dense environments require adaptive planners such as RRT for collision-free paths");
    }

    // Result output
    // Result output
let resultHTML = `
<h3>Design Summary</h3>
<p>
<b>Mission:</b> ${mission}<br>
<b>Operating Environment:</b> ${environment}<br>
<b>DGCA Category:</b> ${weight}
</p>

<hr>

<h3>Configuration</h3>
<p><b>Rotorcraft Type:</b> ${rotorcraft}</p>
<p><b>Frame Type:</b> ${frame}</p>
<p><b>Motor Class:</b> ${motor}</p>
<p><b>Propeller Range:</b> ${prop}</p>
<p><b>Frame Material:</b> ${material}</p>

<hr>

<h3>Avionics & Control</h3>
<p><b>Sensors:</b> ${sensors.join(", ")}</p>
<p><b>Control System:</b> ${controlSystem}</p>
<p><b>Path Planning Strategy:</b> ${path}</p>

<hr>

<h3>Engineering Rationale</h3>
<p>• ${reasons.join("<br>• ")}</p>

${
(preference !== "No Preference" && rotorcraft !== idealRotorcraft)
? `
<hr>
<h3>Preference Override & Trade-offs</h3>
<p><b>Primary Recommendation:</b> ${idealRotorcraft}</p>
<p><b>User Preference Applied:</b> ${rotorcraft}</p>
<p>• ${tradeoffs.join("<br>• ")}</p>
`
: ""
}

<hr>

<h3>Design Assumptions & Validation</h3>
<p>
• Configuration follows standard multirotor thrust-to-weight practice.<br>
• Environmental and dynamic limits should be validated using <b>Flight Physics Tools</b>.<br>
• Final motor–propeller pairing requires datasheet or bench validation.
</p>
`;
    document.getElementById("resultBox").innerHTML = resultHTML;
}

//LEARN.HTML

// LEARN COMPONENTS

function showComponent(type) {
    let content = "";

    if (type === "motor") {
        content = `
        <h3>Motors</h3>
        <p><b>KV Rating:</b> RPM per volt.</p>
        <ul>
            <li>High KV: High speed, small props, racing drones</li>
            <li>Low KV: High torque, large props, mapping drones</li>
        </ul>
        <p><b>Selection Tip:</b> Choose lower KV for endurance and higher KV for speed.</p>
        `;
    }

    if (type === "prop") {
        content = `
        <h3>Propellers</h3>
        <p><b>Size:</b> Determines thrust and efficiency.</p>
        <ul>
            <li>Small props: Faster response, racing</li>
            <li>Large props: Better efficiency, longer flight time</li>
        </ul>
        `;
    }

    if (type === "frame") {
        content = `
        <h3>Frames</h3>
        <ul>
            <li><b>X-frame:</b> Balanced and agile</li>
            <li><b>H-frame:</b> Stable for cameras</li>
            <li><b>Deadcat:</b> Keeps props out of view</li>
        </ul>
        `;
    }

    if (type === "fc") {
        content = `
        <h3>Flight Controllers</h3>
        <ul>
            <li>Pixhawk – autonomous drones</li>
            <li>Betaflight – racing drones</li>
            <li>Ardupilot – advanced missions</li>
        </ul>
        `;
    }

    if (type === "sensor") {
        content = `
        <h3>Sensors</h3>
        <ul>
            <li>GPS – outdoor navigation</li>
            <li>Camera – mapping and surveillance</li>
            <li>LiDAR – obstacle detection</li>
            <li>Ultrasonic – short-range sensing</li>
        </ul>
        `;
    }

    if (type === "battery") {
        content = `
        <h3>Batteries</h3>
        <p><b>Cell Count:</b> Determines voltage.</p>
        <p><b>C Rating:</b> Maximum discharge capability.</p>
        `;
    }

    let box = document.getElementById("componentContent");
    let menu = document.getElementById("componentMenu");

    box.innerHTML = `
        <button class="menu-btn" style="background:#444; margin-bottom:15px;" onclick="showComponentMenu()">← Back to Components</button>
        ${content}
    `;

    menu.style.display = "none";
    box.style.display = "block";
}

function showComponentMenu() {
    let box = document.getElementById("componentContent");
    let menu = document.getElementById("componentMenu");

    box.style.display = "none";
    menu.style.display = "flex";
}

/* ============================= */
/* SIDEBAR + THEME FUNCTIONS    */
/* ============================= */

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}

/* THEME HANDLING */
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        const toggle = document.getElementById("themeToggle");
        if (toggle) toggle.checked = true;
    } else {
        document.body.classList.remove("dark");
        const toggle = document.getElementById("themeToggle");
        if (toggle) toggle.checked = false;
    }
}

function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) {
        applyTheme(saved);
    } else {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(systemDark ? "dark" : "light");
    }
}

document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "themeToggle") {
        const mode = e.target.checked ? "dark" : "light";
        localStorage.setItem("theme", mode);
        applyTheme(mode);
    }
});

/* ============================= */
/* THEME SETUP (SAFE + FIXED)   */
/* ============================= */

function setupTheme() {
    const toggle = document.getElementById("themeToggle");

    if (!toggle) {
        console.warn("Theme toggle not found");
        return;
    }

    // Apply saved or system theme
    const saved = localStorage.getItem("theme");
    if (saved) {
        applyTheme(saved);
    } else {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(systemDark ? "dark" : "light");
    }

    // Bind toggle interaction
    toggle.addEventListener("change", () => {
        const mode = toggle.checked ? "dark" : "light";
        localStorage.setItem("theme", mode);
        applyTheme(mode);
    });
}

/* ================= SETTINGS ================= */

const themeSelect = document.getElementById("themeSelect");
const fontSizeSelect = document.getElementById("fontSizeSelect");
const resetBtn = document.getElementById("resetBtn");

// Apply theme
function applyTheme(mode) {
    document.body.classList.remove("dark");

    if (mode === "dark") {
        document.body.classList.add("dark");
    } else if (mode === "auto") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark");
        }
    }
}

// Apply font size
function applyFontSize(size) {
    document.body.classList.remove("font-small", "font-medium", "font-large");

    if (size === "small") document.body.classList.add("font-small");
    if (size === "medium") document.body.classList.add("font-medium");
    if (size === "large") document.body.classList.add("font-large");
}

// Load settings
function loadSettings() {
    const theme = localStorage.getItem("theme") || "auto";
    const fontSize = localStorage.getItem("fontSize") || "medium";

    applyTheme(theme);
    applyFontSize(fontSize);

    if (themeSelect) themeSelect.value = theme;
    if (fontSizeSelect) fontSizeSelect.value = fontSize;
}

// Save listeners
if (themeSelect) {
    themeSelect.addEventListener("change", () => {
        localStorage.setItem("theme", themeSelect.value);
        applyTheme(themeSelect.value);
    });
}

if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", () => {
        localStorage.setItem("fontSize", fontSizeSelect.value);
        applyFontSize(fontSizeSelect.value);
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        localStorage.removeItem("theme");
        localStorage.removeItem("fontSize");
        loadSettings();
    });
}

// Apply on page load
loadSettings();

/* ============================= */
/* PWA SERVICE WORKER REGISTER  */
/* ============================= */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .catch(err => console.warn("Service Worker registration failed", err));
    });
}
