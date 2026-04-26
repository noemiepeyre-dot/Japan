const STORAGE_KEY = "japan-carnet-v1";
const state = {
  tab: "guide",
  notesByDay: {},
  journal: "",
  checklist: {
    passeports: false,
    jrpass: false,
    esim: false,
    adaptateur: false,
    medicaments: false,
  },
  rates: { date: "", EUR: 0, USD: 0 },
  weather: {},
};

const data = {
  guide: {
    Tokyo: {
      info: "Capitale très variée, quartiers contrastés, transports excellents.",
      lieux: ["Asakusa / Senso-ji", "Meiji-jingu", "TeamLab Planets", "Yanaka"],
      food: ["Ramen", "Sushi", "Konbini family meal", "Cafés à Daikanyama"],
    },
    Kyoto: {
      info: "Temples, ruelles traditionnelles, ambiance plus calme le matin.",
      lieux: ["Fushimi Inari", "Nijo", "Gion", "Arashiyama"],
      food: ["Kaiseki", "Matcha à Uji", "Okonomiyaki"],
    },
    Kanazawa: {
      info: "Culture samouraï + jardin + art contemporain.",
      lieux: ["Kenrokuen", "Higashi Chaya", "Nagamachi", "Myoryuji"],
      food: ["Poissons d'Omicho", "Glace feuille d'or", "Kaisendon"],
    },
  },
  itinerary: [
    { date: "2026-06-29", ville: "Tokyo", matin: "Arrivée", apm: "Transfert hôtel", soir: "Dîner Shinjuku" },
    { date: "2026-06-30", ville: "Tokyo", matin: "Meiji-jingu", apm: "Harajuku", soir: "Omoide Yokocho" },
    { date: "2026-07-04", ville: "Kanazawa", matin: "Shinkansen", apm: "Omicho", soir: "Higashi Chaya" },
    { date: "2026-07-08", ville: "Kyoto", matin: "Takayama", apm: "Train Kyoto", soir: "Rivière Kamo" },
  ],
  transports: [
    "N'EX Narita → Shinjuku",
    "Shinkansen Tokyo → Kanazawa",
    "Bus Kanazawa → Shirakawa-go",
    "Hida Takayama → Kyoto",
  ],
  hotels: [
    { nom: "Pasela Living", ville: "Tokyo", checkin: "2026-06-29", checkout: "2026-07-04", contact: "+81 ..." },
    { nom: "Hotel Nikko", ville: "Kanazawa", checkin: "2026-07-04", checkout: "2026-07-07", contact: "+81 ..." },
    { nom: "Kyoto Riverview", ville: "Kyoto", checkin: "2026-07-08", checkout: "2026-07-13", contact: "+81 ..." },
  ],
  tips: [
    "Sortir tôt (8h-12h), pause aux heures chaudes.",
    "Boire souvent et faire des pauses climatisées.",
    "À 4, taxi parfois rentable en ville.",
    "Prévoir du cash + carte de secours.",
  ],
};

const tabs = [
  ["guide", "📍 Guide"],
  ["itinerary", "🗓️ Itinéraire"],
  ["transport", "🚆 Transport"],
  ["hotel", "🏨 Hôtel"],
  ["tips", "💡 Tips"],
  ["tools", "🧰 Outils"],
  ["journal", "🧠 Journal"],
];

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  Object.assign(state, JSON.parse(raw));
}

function section(title, html) {
  return `<section class="card"><h2>${title}</h2>${html}</section>`;
}

function renderGuide() {
  const cities = Object.entries(data.guide).map(([city, v]) => `
    <article class="item">
      <h3>${city}</h3>
      <p class="small">${v.info}</p>
      <p><b>Lieux:</b> ${v.lieux.join(" • ")}</p>
      <p><b>Restos/activités:</b> ${v.food.join(" • ")}</p>
    </article>`).join("");
  return section("Guide par ville", `<div class="grid">${cities}</div>`);
}

function renderItinerary() {
  const rows = data.itinerary.map((d, i) => `
    <article class="item">
      <p><b>${d.date}</b> • ${d.ville}</p>
      <p class="small">Matin: ${d.matin}<br/>Après-midi: ${d.apm}<br/>Soir: ${d.soir}</p>
      <label class="small">Notes perso</label>
      <textarea data-day="${i}" class="day-note">${state.notesByDay[i] || ""}</textarea>
    </article>`).join("");
  return section("Itinéraire du jour", `<div class="grid">${rows}</div>`);
}

function renderTransport() {
  return section("Transports", `<ul>${data.transports.map(t => `<li class="item">${t}</li>`).join("")}</ul><p class="small">Astuce: ajoutez vos numéros de réservation dans les notes de jour.</p>`);
}

function renderHotel() {
  return section("Hébergement", `<div class="grid">${data.hotels.map(h => `<div class="item"><b>${h.nom}</b><p class="small">${h.ville}</p><p>Check-in: ${h.checkin}<br/>Check-out: ${h.checkout}</p><p>Contact: ${h.contact}</p></div>`).join("")}</div>`);
}

function renderTips() {
  return section("Tips / Budget", `<div class="grid">${data.tips.map(t => `<div class="item">${t}</div>`).join("")}</div>`);
}

async function updateRates() {
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=JPY&to=EUR,USD");
    const j = await r.json();
    state.rates = {
      date: j.date,
      EUR: 1 / j.rates.EUR,
      USD: 1 / j.rates.USD,
    };
    save();
    render();
  } catch {
    // offline: keep last cached rate
  }
}

function renderTools() {
  const eur = Number(document.getElementById("eurInput")?.value || 0);
  const usd = Number(document.getElementById("usdInput")?.value || 0);
  const eurToYen = state.rates.EUR ? (eur * state.rates.EUR).toFixed(0) : "-";
  const usdToYen = state.rates.USD ? (usd * state.rates.USD).toFixed(0) : "-";
  const checks = Object.entries(state.checklist).map(([k, v]) => `
    <label class="check-item item"><input type="checkbox" data-check="${k}" ${v ? "checked" : ""}/> ${k}</label>`).join("");

  return section("Outils utiles", `
    <p class="badge">Taux cache locale (maj online quand possible): ${state.rates.date || "non chargé"}</p>
    <div class="grid grid-2">
      <div class="item">
        <label>EUR → JPY</label>
        <input id="eurInput" type="number" value="${eur || ""}" placeholder="ex: 25" />
        <p>${eur || 0} EUR ≈ <b>${eurToYen}</b> JPY</p>
      </div>
      <div class="item">
        <label>USD → JPY</label>
        <input id="usdInput" type="number" value="${usd || ""}" placeholder="ex: 25" />
        <p>${usd || 0} USD ≈ <b>${usdToYen}</b> JPY</p>
      </div>
    </div>
    <h3>Check-list</h3>
    <div class="grid">${checks}</div>
    <div class="item small">Météo: pour limiter les APIs, ajoutez vos prévisions ici (copier/coller avant départ), disponible hors ligne ensuite.</div>
    <textarea id="weatherBox" placeholder="Tokyo: 30°C humide...">${state.weather.text || ""}</textarea>
  `);
}

function renderJournal() {
  return section("Journal de bord", `
    <p class="small">Ajoutez souvenirs, anecdotes et liens photo.</p>
    <textarea id="journalBox" placeholder="Aujourd'hui...">${state.journal || ""}</textarea>
  `);
}

function render() {
  const app = document.getElementById("app");
  const map = {
    guide: renderGuide,
    itinerary: renderItinerary,
    transport: renderTransport,
    hotel: renderHotel,
    tips: renderTips,
    tools: renderTools,
    journal: renderJournal,
  };
  app.innerHTML = map[state.tab]();

  document.querySelectorAll(".day-note").forEach((el) => {
    el.addEventListener("input", () => {
      state.notesByDay[el.dataset.day] = el.value;
      save();
    });
  });
  document.querySelectorAll("[data-check]").forEach((el) => {
    el.addEventListener("change", () => {
      state.checklist[el.dataset.check] = el.checked;
      save();
    });
  });
  document.getElementById("journalBox")?.addEventListener("input", (e) => {
    state.journal = e.target.value;
    save();
  });
  document.getElementById("weatherBox")?.addEventListener("input", (e) => {
    state.weather.text = e.target.value;
    save();
  });
  ["eurInput", "usdInput"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => render());
  });

  const nav = document.getElementById("bottomNav");
  nav.innerHTML = tabs.map(([id, label]) => `<button data-tab="${id}" class="${state.tab === id ? "active" : ""}">${label}</button>`).join("");
  nav.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    state.tab = b.dataset.tab;
    save();
    render();
  }));
}

async function init() {
  load();
  render();
  updateRates();
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("./sw.js");
  }
}

init();
