const app = document.getElementById("app");

const states = [
    "access-denied",
    "verification",
    "progress",
    "authorized",
    // "reveal-m",
    // "reveal-me",
    // "reveal-mes",
    // "reveal-final",
    // "landing"
];

let currentIndex = 0;
function attachVerificationHandler() {
    const form = document.getElementById("verifyForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        nextState(); // moves to "progress"
    });
}
function startProgressLoader() {
    const counterElement = document.getElementById("percentageCounter");
    const ring = document.getElementById("progressRing");
    const statusText = document.getElementById("statusText");

    if (!counterElement || !ring || !statusText) return;

    let count = 0;
    const target = 100;
    const duration = 2500;
    const intervalTime = 25;
    const increment = target / (duration / intervalTime);

    const stages = [
        "Bypassing firewall…",
        "Injecting payload…",
        "Escalating privileges…",
        "Finalizing override…"
    ];

    const stageInterval = duration / stages.length;
    stages.forEach((text, i) => {
        setTimeout(() => statusText.textContent = text, i * stageInterval);
    });

    const timer = setInterval(() => {
        count += increment;

        if (count >= target) {
            count = target;
            clearInterval(timer);
            setTimeout(() => nextState(), 300);
        }

        counterElement.textContent = `${Math.floor(count)}%`;
        ring.setAttribute("stroke-dashoffset", target - count);
    }, intervalTime);
}
function startAuthorizedScreen() {
    setTimeout(() => {
        nextState();
    }, 1800);
}

async function loadState(name) {
    const res = await fetch(`states/${name}.html`);
    const html = await res.text();

    app.className = "screen-exit";

    setTimeout(() => {
        app.innerHTML = html;
        if (name === "verification") {
            attachVerificationHandler();
        }
        if (name === "progress") {
            startProgressLoader();
        }
        if (name === "authorized") {
            startAuthorizedScreen();
        }


        app.className = "screen-enter";
        requestAnimationFrame(() => {
            app.className = "screen-active";
        });

        updateScrollLock();
    }, 300);

    history.replaceState(null, "", `#${name}`);
}

function nextState() {
    if (currentIndex < states.length - 1) {
        currentIndex++;
        loadState(states[currentIndex]);
    }
}

function updateScrollLock() {
    const current = states[currentIndex];
    if (current === "landing") {
        document.body.classList.add("unlocked");
    } else {
        document.body.classList.remove("unlocked");
    }
}

/* Global interaction rule: any button with data-next proceeds */

document.addEventListener("click", (e) => {
    if (e.target.matches("[data-next]")) {
        nextState();
    }
});

/* Initial load */

const initial = location.hash.replace("#", "") || states[0];
currentIndex = Math.max(states.indexOf(initial), 0);
loadState(initial);
