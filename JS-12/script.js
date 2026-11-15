"use strict";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const STORAGE_KEY = "weather-app:last";
const DEFAULT_PLACE = {
  name: "Karachi", admin1: "Sindh", country: "Pakistan",
  latitude: 24.8608, longitude: 67.0104
};

const $ = (id) => document.getElementById(id);
const els = {
  form: $("search-form"),
  input: $("city-input"),
  list: $("suggestions"),
  status: $("status"),
  weather: $("weather"),
  placeName: $("place-name"),
  placeMeta: $("place-meta"),
  localTime: $("local-time"),
  nowIcon: $("now-icon"),
  temp: $("temp"),
  tempUnit: $("temp-unit"),
  condition: $("condition"),
  feels: $("feels"),
  humidity: $("humidity"),
  wind: $("wind"),
  windUnit: $("wind-unit"),
  windDir: $("wind-dir"),
  todayHigh: $("today-high"),
  todayLow: $("today-low"),
  forecast: $("forecast")
};

const state = {
  unit: "metric",        // "metric" (°C, km/h) or "imperial" (°F, mph)
  place: null,
  results: [],
  activeIndex: -1,
  requestId: 0
};

/* ---------- Weather codes (WMO) ---------- */

// kind drives both the icon and the page background.
function describe(code, isDay = 1) {
  const map = {
    0:  ["Clear sky", "clear"],
    1:  ["Mainly clear", "clear"],
    2:  ["Partly cloudy", "partly"],
    3:  ["Overcast", "cloud"],
    45: ["Fog", "fog"],
    48: ["Freezing fog", "fog"],
    51: ["Light drizzle", "rain"],
    53: ["Drizzle", "rain"],
    55: ["Heavy drizzle", "rain"],
    56: ["Freezing drizzle", "rain"],
    57: ["Heavy freezing drizzle", "rain"],
    61: ["Light rain", "rain"],
    63: ["Rain", "rain"],
    65: ["Heavy rain", "rain"],
    66: ["Freezing rain", "rain"],
    67: ["Heavy freezing rain", "rain"],
    71: ["Light snow", "snow"],
    73: ["Snow", "snow"],
    75: ["Heavy snow", "snow"],
    77: ["Snow grains", "snow"],
    80: ["Light showers", "rain"],
    81: ["Showers", "rain"],
    82: ["Violent showers", "rain"],
    85: ["Snow showers", "snow"],
    86: ["Heavy snow showers", "snow"],
    95: ["Thunderstorm", "storm"],
    96: ["Thunderstorm, hail", "storm"],
    99: ["Severe thunderstorm, hail", "storm"]
  };
  const [label, kind] = map[code] || ["Unknown", "cloud"];
  let sky = kind;
  if (kind === "clear" || kind === "partly") sky = isDay ? "clear-day" : "clear-night";
  if (kind === "cloud") sky = "cloudy";
  return { label, kind, sky };
}

/* ---------- Icons (inline SVG, 64x64) ---------- */

const C = { sun: "#FFC93C", moon: "#F4EAC4", cloud: "#EEF3F9", cloudShade: "#C9D5E3", rain: "#6EC1FF", snow: "#FFFFFF", bolt: "#FFD23F" };

const parts = {
  sun: (x, y, r) => {
    let rays = "";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x1 = x + Math.cos(a) * (r + 4), y1 = y + Math.sin(a) * (r + 4);
      const x2 = x + Math.cos(a) * (r + 9), y2 = y + Math.sin(a) * (r + 9);
      rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    return `<g stroke="${C.sun}" stroke-width="3" stroke-linecap="round">${rays}</g><circle cx="${x}" cy="${y}" r="${r}" fill="${C.sun}"/>`;
  },
  moon: (x, y, r) =>
    `<path d="M${x + r * 0.35} ${y - r} A${r} ${r} 0 1 0 ${x + r} ${y + r * 0.35} A${r * 0.8} ${r * 0.8} 0 0 1 ${x + r * 0.35} ${y - r} Z" fill="${C.moon}"/>`,
  cloud: (dx = 0, dy = 0, fill = C.cloud) =>
    `<g transform="translate(${dx} ${dy})" fill="${fill}"><circle cx="24" cy="38" r="10"/><circle cx="36" cy="32" r="13"/><circle cx="47" cy="39" r="9"/><rect x="18" y="38" width="35" height="10" rx="5"/></g>`,
  drops: (n = 3, heavy = false) => {
    let out = "";
    for (let i = 0; i < n; i++) {
      const x = 24 + i * 11, y = 52;
      out += `<line x1="${x}" y1="${y}" x2="${x - 3}" y2="${y + (heavy ? 9 : 6)}"/>`;
    }
    return `<g stroke="${C.rain}" stroke-width="3" stroke-linecap="round">${out}</g>`;
  },
  flakes: () =>
    [26, 37, 48].map((x, i) => `<circle cx="${x}" cy="${55 + (i % 2) * 3}" r="2.6" fill="${C.snow}"/>`).join(""),
  bolt: () => `<path d="M34 44 L27 56 H33 L30 64 L42 50 H35 L38 44 Z" fill="${C.bolt}"/>`,
  fog: () =>
    `<g stroke="${C.cloudShade}" stroke-width="3.2" stroke-linecap="round"><line x1="16" y1="46" x2="50" y2="46"/><line x1="22" y1="53" x2="56" y2="53"/><line x1="16" y1="60" x2="44" y2="60"/></g>`
};

function iconSVG(kind, isDay = 1) {
  const body = isDay ? parts.sun : parts.moon;
  let inner = "";
  switch (kind) {
    case "clear":
      inner = isDay ? parts.sun(32, 32, 13) : parts.moon(32, 32, 16);
      break;
    case "partly":
      inner = body(24, 24, isDay ? 10 : 12) + parts.cloud(6, 2);
      break;
    case "cloud":
      inner = parts.cloud(-4, -6, C.cloudShade) + parts.cloud(2, 2);
      break;
    case "fog":
      inner = parts.cloud(0, -10) + parts.fog();
      break;
    case "rain":
      inner = parts.cloud(0, -8) + parts.drops(3);
      break;
    case "snow":
      inner = parts.cloud(0, -8) + parts.flakes();
      break;
    case "storm":
      inner = parts.cloud(0, -10, C.cloudShade) + parts.bolt();
      break;
    default:
      inner = parts.cloud();
  }
  return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

/* ---------- Helpers ---------- */

function compass(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function round(n) { return Math.round(n); }

function setStatus(text, isError = false) {
  els.status.textContent = text;
  els.status.classList.toggle("is-error", isError);
}

function placeLabel(p) {
  return [p.admin1, p.country].filter(Boolean).join(", ");
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function saveLast(place) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(place)); } catch (_) { /* storage may be blocked */ }
}

function loadLast() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return typeof p.latitude === "number" && typeof p.longitude === "number" && p.name ? p : null;
  } catch (_) { return null; }
}

/* ---------- City search (geocoding) ---------- */

async function searchCities(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const data = await getJSON(url);
  return data.results || [];
}

function hideSuggestions() {
  els.list.hidden = true;
  els.list.replaceChildren();
  els.input.setAttribute("aria-expanded", "false");
  state.activeIndex = -1;
}

function showSuggestions(results, query) {
  els.list.replaceChildren();

  if (!results.length) {
    const li = document.createElement("li");
    li.className = "s-empty";
    li.textContent = `No cities found for "${query}"`;
    els.list.append(li);
  } else {
    results.forEach((r, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.index = String(i);
      const name = document.createElement("span");
      name.className = "s-name";
      name.textContent = r.name;
      const sub = document.createElement("span");
      sub.className = "s-sub";
      sub.textContent = placeLabel(r);
      btn.append(name, sub);
      li.append(btn);
      els.list.append(li);
    });
  }
  els.list.hidden = false;
  els.input.setAttribute("aria-expanded", "true");
  state.activeIndex = -1;
}

function highlight(index) {
  const buttons = [...els.list.querySelectorAll("button")];
  buttons.forEach((b, i) => b.classList.toggle("is-active", i === index));
  state.activeIndex = index;
}

function choose(result) {
  hideSuggestions();
  els.input.value = result.name;
  loadWeather({
    name: result.name,
    admin1: result.admin1 || "",
    country: result.country || "",
    latitude: result.latitude,
    longitude: result.longitude
  });
}

let debounceTimer;
let searchToken = 0;

els.input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const q = els.input.value.trim();
  if (q.length < 2) { hideSuggestions(); return; }
  debounceTimer = setTimeout(async () => {
    const token = ++searchToken;
    try {
      const results = await searchCities(q);
      if (token !== searchToken) return;
      state.results = results;
      showSuggestions(results, q);
    } catch (err) {
      if (token !== searchToken) return;
      hideSuggestions();
      setStatus("Could not search cities. Check your connection and try again.", true);
    }
  }, 300);
});

els.input.addEventListener("keydown", (e) => {
  const count = els.list.querySelectorAll("button").length;
  if (els.list.hidden || !count) return;
  if (e.key === "ArrowDown") { e.preventDefault(); highlight((state.activeIndex + 1) % count); }
  else if (e.key === "ArrowUp") { e.preventDefault(); highlight((state.activeIndex - 1 + count) % count); }
  else if (e.key === "Escape") { hideSuggestions(); }
});

els.list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  choose(state.results[Number(btn.dataset.index)]);
});

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = els.input.value.trim();
  if (!q) return;
  clearTimeout(debounceTimer);
  ++searchToken;

  // If the user arrowed to a suggestion, use it.
  if (!els.list.hidden && state.activeIndex >= 0) {
    choose(state.results[state.activeIndex]);
    return;
  }

  setStatus("Searching…");
  try {
    const results = await searchCities(q);
    state.results = results;
    if (!results.length) {
      showSuggestions(results, q);
      setStatus("");
      return;
    }
    choose(results[0]);
  } catch (err) {
    setStatus("Could not search cities. Check your connection and try again.", true);
  }
});

document.addEventListener("click", (e) => {
  if (!els.form.contains(e.target)) hideSuggestions();
});

/* ---------- Weather ---------- */

function buildForecastURL(place) {
  const imperial = state.unit === "imperial";
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "5",
    timezone: "auto",
    temperature_unit: imperial ? "fahrenheit" : "celsius",
    wind_speed_unit: imperial ? "mph" : "kmh"
  });
  return `${FORECAST_URL}?${params.toString()}`;
}

async function loadWeather(place) {
  const id = ++state.requestId;
  state.place = place;
  setStatus(`Loading weather for ${place.name}…`);
  try {
    const data = await getJSON(buildForecastURL(place));
    if (id !== state.requestId) return; // a newer request replaced this one
    render(place, data);
    saveLast(place);
    setStatus("");
  } catch (err) {
    if (id !== state.requestId) return;
    setStatus("Could not load the weather. Check your connection and try again.", true);
  }
}

function render(place, data) {
  const cur = data.current;
  const imperial = state.unit === "imperial";
  const info = describe(cur.weather_code, cur.is_day);

  document.body.className = `sky-${info.sky}`;

  els.placeName.textContent = place.name;
  els.placeMeta.textContent = placeLabel(place);

  // cur.time is local wall-clock time at the place (timezone=auto), so format it as-is.
  const t = new Date(cur.time);
  els.localTime.textContent = "Local time " + t.toLocaleString("en-US", {
    weekday: "long", hour: "numeric", minute: "2-digit"
  });

  els.nowIcon.innerHTML = iconSVG(info.kind, cur.is_day);
  els.temp.textContent = round(cur.temperature_2m);
  els.tempUnit.textContent = imperial ? "°F" : "°C";
  els.condition.textContent = info.label;
  els.feels.textContent = `${round(cur.apparent_temperature)}°`;
  els.humidity.textContent = round(cur.relative_humidity_2m);
  els.wind.textContent = round(cur.wind_speed_10m);
  els.windUnit.textContent = imperial ? " mph" : " km/h";
  els.windDir.textContent = `From the ${compass(cur.wind_direction_10m)}`;

  const d = data.daily;
  els.todayHigh.textContent = `${round(d.temperature_2m_max[0])}°`;
  els.todayLow.textContent = `${round(d.temperature_2m_min[0])}°`;

  els.forecast.replaceChildren();
  d.time.forEach((dateStr, i) => {
    const [y, m, day] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, day);
    const dInfo = describe(d.weather_code[i], 1);

    const li = document.createElement("li");
    li.className = "day";

    const name = document.createElement("span");
    name.className = "day-name";
    name.textContent = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });

    const icon = document.createElement("div");
    icon.className = "day-icon";
    icon.innerHTML = iconSVG(dInfo.kind, 1);

    const cond = document.createElement("span");
    cond.className = "day-cond";
    cond.textContent = dInfo.label;

    const temps = document.createElement("span");
    temps.className = "day-temps";
    temps.textContent = `${round(d.temperature_2m_max[i])}° `;
    const low = document.createElement("span");
    low.textContent = `${round(d.temperature_2m_min[i])}°`;
    temps.append(low);

    li.append(name, icon, cond, temps);
    els.forecast.append(li);
  });

  els.weather.hidden = false;
}

/* ---------- Units ---------- */

document.querySelectorAll(".unit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const unit = btn.dataset.unit;
    if (unit === state.unit) return;
    state.unit = unit;
    document.querySelectorAll(".unit-btn").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    if (state.place) loadWeather(state.place);
  });
});

/* ---------- Start ---------- */

loadWeather(loadLast() || DEFAULT_PLACE);