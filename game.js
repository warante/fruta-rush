"use strict";

/* ==================== Datos del juego ==================== */

const FRUITS = [
  { id: "manzana", emoji: "🍎", name: "Manzanas", value: 2,  unlockCost: 0 },
  { id: "platano", emoji: "🍌", name: "Plátanos", value: 3,  unlockCost: 0 },
  { id: "naranja", emoji: "🍊", name: "Naranjas", value: 5,  unlockCost: 50 },
  { id: "fresa",   emoji: "🍓", name: "Fresas",   value: 8,  unlockCost: 150 },
  { id: "uva",     emoji: "🍇", name: "Uvas",     value: 12, unlockCost: 400 },
  { id: "sandia",  emoji: "🍉", name: "Sandías",  value: 18, unlockCost: 1000 },
  { id: "pina",    emoji: "🍍", name: "Piñas",    value: 28, unlockCost: 2500 },
  { id: "kiwi",    emoji: "🥝", name: "Kiwis",    value: 40, unlockCost: 6000 },
  { id: "cereza",  emoji: "🍒", name: "Cerezas",  value: 60, unlockCost: 15000 },
  { id: "melon",   emoji: "🍈", name: "Melones",  value: 90, unlockCost: 40000 },
];

// Personal: cada uno sirve clientes automáticamente cada X segundos
const HELPERS = [
  { id: "becario",     emoji: "🧑‍🌾", name: "Becario",       interval: 20, baseCost: 30,  desc: "Sirve un cliente cada 20s." },
  { id: "dependienta", emoji: "👩‍💼", name: "Dependienta",   interval: 10, baseCost: 120, desc: "Sirve un cliente cada 10s." },
  { id: "caja",        emoji: "🤖", name: "Caja Automática", interval: 5,  baseCost: 500, desc: "Sirve un cliente cada 5s." },
];

const CART_COSTS = [120, 300, 750, 1800, 4500, 10000]; // +2 capacidad y +10% ventas por nivel
const QUEUE_COSTS = [200, 800, 2500];                  // hasta 4 colas
const MAX_QUEUES = 4;
const BLENDER_COST = 800;        // licuadora: desbloquea zumos y macedonias
const DECO_BASE_COST = 150;      // decoración: +10% paciencia y +5% llegada por nivel
const DECO_GROWTH = 2.2;
const DECO_MAX = 10;
const PRESTIGE_THRESHOLD = 5000; // fidelidad = sqrt(ganancias de la ronda / esto)

const DAY_GOAL = 10;
const BASE_PATIENCE = 30;   // segundos de paciencia del cliente
const VARIETY_STEP = 0.5;   // +50% por cada fruta distinta extra en el pedido
const STREAK_STEP = 0.05;   // +5% por venta consecutiva sin fallos
const STREAK_MAX = 0.5;     // tope de racha: +50%
const HELPER_GROWTH = 1.6;  // encarecimiento de cada ayudante extra
const VIP_CHANCE = 0.12;    // probabilidad de cliente VIP
const VIP_MULT = 5;         // los VIP pagan x5
const SPECIAL_CHANCE = 0.25;// probabilidad de zumo/macedonia (con licuadora)
const RUSH_DURATION = 30000;
const FID_SALE = 0.10;      // +10% ventas por punto de fidelidad
const FID_PATIENCE = 0.03;  // +3% paciencia por punto
const FID_SPEED = 0.05;     // +5% velocidad del personal por punto

const CUSTOMER_FACES = ["👩", "🧑", "👵", "👴", "👦", "👧", "🧔", "👱‍♀️", "🧓", "👨‍🦰", "👩‍🦱", "🧑‍🦳"];

const ACHIEVEMENTS = [
  { id: "first",    emoji: "🧺", name: "Primera Venta",     desc: "Sirve tu primer pedido.",         cond: () => state.totalSales >= 1 },
  { id: "sales50",  emoji: "📈", name: "Negocio en Marcha", desc: "Completa 50 ventas.",             cond: () => state.totalSales >= 50 },
  { id: "sales500", emoji: "🏪", name: "Franquicia Local",  desc: "Completa 500 ventas.",            cond: () => state.totalSales >= 500 },
  { id: "day5",     emoji: "🗓️", name: "Semana Completa",   desc: "Llega al día 5.",                 cond: () => state.day >= 5 },
  { id: "day30",    emoji: "🏆", name: "Mes Redondo",       desc: "Llega al día 30.",                cond: () => state.day >= 30 },
  { id: "fruit5",   emoji: "🌈", name: "Variedad",          desc: "Desbloquea 5 frutas.",            cond: () => state.fruitsUnlocked >= 5 },
  { id: "fruitAll", emoji: "🍒", name: "Frutería Completa", desc: "Desbloquea todas las frutas.",    cond: () => state.fruitsUnlocked >= FRUITS.length },
  { id: "queue4",   emoji: "👥", name: "Multitudes",        desc: "Atiende 4 colas a la vez.",       cond: () => state.queues.length >= MAX_QUEUES },
  { id: "helper1",  emoji: "🧑‍🌾", name: "Primer Empleado",   desc: "Contrata a tu primer ayudante.",  cond: () => totalHelpers() >= 1 },
  { id: "streak5",  emoji: "🔥", name: "En Racha",          desc: "Encadena 5 ventas sin fallos.",   cond: () => state.bestStreak >= 5 },
  { id: "rich",     emoji: "💰", name: "Hucha Llena",       desc: "Gana 10.000 monedas en total.",   cond: () => state.lifetimeEarned >= 10000 },
  { id: "angry1",   emoji: "😡", name: "Cliente Cabreado",  desc: "Un cliente se marcha sin comprar.", cond: () => state.angry >= 1 },
  { id: "vip10",    emoji: "⭐", name: "Cliente Estrella",  desc: "Sirve a 10 clientes VIP.",        cond: () => state.vipsServed >= 10 },
  { id: "rush1",    emoji: "🕐", name: "Hora Punta",        desc: "Sobrevive a una hora punta.",     cond: () => state.rushesSeen >= 1 },
  { id: "blender1", emoji: "🥤", name: "Zumos Naturales",   desc: "Compra la licuadora.",            cond: () => state.blender },
  { id: "deco5",    emoji: "🪴", name: "Tienda Bonita",     desc: "Decoración al nivel 5.",          cond: () => state.decoLevel >= 5 },
  { id: "prestige1",emoji: "🏪", name: "Segunda Casa",      desc: "Abre tu primera franquicia.",     cond: () => state.prestiges >= 1 },
  { id: "allmax",   emoji: "💎", name: "Todo al Máximo",    desc: "Carretilla, decoración, colas y licuadora al máximo.", cond: () => state.cartLevel >= CART_COSTS.length && state.decoLevel >= DECO_MAX && state.queues.length >= MAX_QUEUES && state.blender },
];

const SAVE_KEY = "fruta-rush-v2";
const TICK_MS = 100;

/* ==================== Estado ==================== */

function newQueue() {
  return { customer: null, nextSpawnAt: Date.now() + 1000 + Math.random() * 2000 };
}

function defaultState() {
  return {
    money: 0,
    totalEarned: 0,      // ganancias de la ronda actual (se reinicia con franquicia)
    lifetimeEarned: 0,   // ganancias de siempre (nunca se reinicia)
    totalSales: 0,
    angry: 0,
    streak: 0,
    bestStreak: 0,
    day: 1,
    salesToday: 0,
    fruitsUnlocked: 2,
    cartLevel: 0,
    decoLevel: 0,
    blender: false,
    bag: [],            // ids de fruta
    queues: [newQueue()],
    helpers: {},        // id -> cantidad
    helperTimers: {},   // id -> segundos acumulados
    achievements: {},   // id -> true
    fidelity: 0,        // puntos de fidelidad (prestigio)
    prestiges: 0,
    vipsServed: 0,
    rushesSeen: 0,
    rushUntil: 0,
    nextRushAt: 0,
    muted: false,
    lastSeen: 0,
  };
}

let state = defaultState();
let lastTick = Date.now();
const pendingToasts = [];

/* ==================== Utilidades ==================== */

function fmt(n) {
  if (n < 1000) return Number.isInteger(n) ? String(n) : n.toFixed(1);
  const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  let u = -1;
  while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
  return n.toFixed(2) + units[u];
}

function fruitById(id) { return FRUITS.find((f) => f.id === id); }
function bagCap() { return 4 + 2 * state.cartLevel; }
function cartMult() { return 1 + 0.1 * state.cartLevel; }
function priceMult() { return 1 + FID_SALE * state.fidelity; }
function streakMult() { return 1 + Math.min(state.streak * STREAK_STEP, STREAK_MAX); }
function patienceMax() { return BASE_PATIENCE * (1 + 0.1 * state.decoLevel) * (1 + FID_PATIENCE * state.fidelity); }
function helperSpeedMult() { return 1 + FID_SPEED * state.fidelity; }
function arrivalMult() { return 1 + 0.05 * state.decoLevel; }
function totalHelpers() { return Object.values(state.helpers).reduce((a, b) => a + b, 0); }
function helperCost(h) { return Math.ceil(h.baseCost * Math.pow(HELPER_GROWTH, state.helpers[h.id] || 0)); }
function decoCost() { return Math.ceil(DECO_BASE_COST * Math.pow(DECO_GROWTH, state.decoLevel)); }
function nextFruit() { return FRUITS[state.fruitsUnlocked] || null; }
function isRush() { return Date.now() < state.rushUntil; }
function prestigeGain() { return Math.floor(Math.sqrt(state.totalEarned / PRESTIGE_THRESHOLD)); }

// Valor de un pedido: suma de frutas x multiplicador (variedad o especial)
function orderValue(order) {
  const ids = Object.keys(order.items);
  let sum = 0;
  for (const id of ids) sum += fruitById(id).value * order.items[id];
  let mult = 1 + VARIETY_STEP * (ids.length - 1);
  if (order.special === "zumo") mult = 3;
  if (order.special === "macedonia") mult = 2.5;
  return Math.round(sum * mult);
}

// Pedido aleatorio: normal, VIP (grande) o especial (zumo/macedonia con licuadora)
function makeOrder(vip) {
  const unlocked = FRUITS.slice(0, state.fruitsUnlocked);
  const cap = bagCap();

  if (!vip && state.blender && Math.random() < SPECIAL_CHANCE && cap >= 3) {
    const canMacedonia = unlocked.length >= 3;
    const tipo = canMacedonia && Math.random() < 0.5 ? "macedonia" : "zumo";
    if (tipo === "zumo") {
      const f = unlocked[Math.floor(Math.random() * unlocked.length)];
      return { items: { [f.id]: 3 }, special: "zumo" };
    }
    const pool = [...unlocked];
    const items = {};
    for (let i = 0; i < 3; i++) {
      const f = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      items[f.id] = 1;
    }
    return { items, special: "macedonia" };
  }

  const maxDistinct = Math.min(vip ? 4 : 3, unlocked.length);
  const minDistinct = vip ? Math.min(2, maxDistinct) : 1;
  const distinct = minDistinct + Math.floor(Math.random() * (maxDistinct - minDistinct + 1));
  const pool = [...unlocked];
  const items = {};
  let count = 0;
  for (let i = 0; i < distinct && count < cap; i++) {
    const f = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    let qty = 1 + (Math.random() < (vip ? 0.5 : 0.35) ? 1 : 0);
    qty = Math.min(qty, cap - count);
    items[f.id] = qty;
    count += qty;
  }
  return { items, special: null };
}

function makeCustomer() {
  const vip = Math.random() < VIP_CHANCE;
  return {
    face: vip ? "🤩" : CUSTOMER_FACES[Math.floor(Math.random() * CUSTOMER_FACES.length)],
    vip,
    order: makeOrder(vip),
    patience: 1,
    maxPatience: patienceMax() * (vip ? 0.5 : 1),
    spawnedAt: Date.now(),
  };
}

function bagMatches(order) {
  const counts = {};
  for (const id of state.bag) counts[id] = (counts[id] || 0) + 1;
  const keys = Object.keys(counts);
  if (keys.length !== Object.keys(order.items).length) return false;
  return keys.every((k) => order.items[k] === counts[k]);
}

function spawnDelay() {
  return (2000 + Math.random() * 3000) / arrivalMult() / (isRush() ? 3 : 1);
}

/* ==================== Sonidos (WebAudio, sin archivos) ==================== */

let audioCtx = null;

function beep(freq, dur, type, vol, delay) {
  if (state.muted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch (e) { /* audio no disponible: silencio */ }
}

function sfx(name) {
  if (state.muted) return;
  switch (name) {
    case "sale":     beep(880, 0.09); beep(1320, 0.14, "triangle", 0.12, 0.08); break;
    case "bell":     beep(1568, 0.12, "sine", 0.07); beep(1175, 0.16, "sine", 0.06, 0.1); break;
    case "angry":    beep(160, 0.25, "sawtooth", 0.08); break;
    case "error":    beep(220, 0.12, "square", 0.08); beep(180, 0.16, "square", 0.08, 0.1); break;
    case "buy":      beep(660, 0.08); beep(990, 0.1, "triangle", 0.1, 0.07); break;
    case "prestige": [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, "triangle", 0.12, i * 0.12)); break;
    case "rush":     beep(1200, 0.08, "square", 0.07); beep(1200, 0.08, "square", 0.07, 0.12); break;
  }
}

/* ==================== Persistencia (navegador) ==================== */

function save() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* sin espacio o bloqueado: no pasa nada */ }
}

function sanitizeLoaded(data) {
  state = Object.assign(defaultState(), data);
  if (!Array.isArray(state.queues) || state.queues.length === 0) state.queues = [newQueue()];
  state.queues = state.queues.slice(0, MAX_QUEUES);
  state.queues.forEach((q) => {
    if (q.customer) {
      q.customer.patience = 1;
      if (!q.customer.maxPatience) q.customer.maxPatience = patienceMax();
    }
    if (typeof q.nextSpawnAt !== "number") q.nextSpawnAt = Date.now() + 1500;
  });
  if (!state.nextRushAt) scheduleRush();
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    sanitizeLoaded(JSON.parse(raw));
    offlineGains();
  } catch (e) {
    console.warn("No se pudo cargar la partida, empezando de cero.", e);
  }
}

function helpersRate() {
  return HELPERS.reduce((s, h) => s + (state.helpers[h.id] || 0) / h.interval, 0) * helperSpeedMult();
}

function avgOrderValue() {
  const unlocked = FRUITS.slice(0, state.fruitsUnlocked);
  const avg = unlocked.reduce((s, f) => s + f.value, 0) / unlocked.length;
  return avg * 2 * cartMult() * priceMult(); // ~2 items de media por pedido
}

// Progreso offline: el personal trabaja al 50% mientras estás fuera
function offlineGains() {
  if (!state.lastSeen) return;
  const elapsed = (Date.now() - state.lastSeen) / 1000;
  if (elapsed < 60) return;
  const gain = helpersRate() * elapsed * 0.5 * avgOrderValue();
  if (gain < 1) return;
  state.money += gain;
  state.totalEarned += gain;
  state.lifetimeEarned += gain;
  pendingToasts.push(`💤 Tu personal ganó ${fmt(gain)} monedas mientras no estabas`);
}

/* ==================== Guardar / cargar desde disco ==================== */

function exportSave() {
  save(); // actualiza lastSeen antes de exportar
  const payload = {
    game: "fruta-rush",
    version: 2,
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fruta-rush-partida-dia" + state.day + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("💾 Partida descargada al disco");
}

function importSave(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const loaded = data && data.state ? data.state : data; // acepta con o sin envoltorio
      if (!loaded || typeof loaded.money !== "number") throw new Error("formato inválido");
      sanitizeLoaded(loaded);
      rebuildAll();
      save();
      toast("📂 Partida cargada desde el archivo");
    } catch (e) {
      console.warn("Archivo de partida no válido", e);
      toast("❌ Ese archivo no es una partida válida");
    }
  };
  reader.onerror = () => toast("❌ No se pudo leer el archivo");
  reader.readAsText(file);
}

/* ==================== Referencias DOM ==================== */

const $ = (id) => document.getElementById(id);
const moneyEl = $("money");
const dayEl = $("day");
const dayFillEl = $("day-fill");
const dayProgressEl = $("day-progress");
const streakEl = $("streak");
const streakNEl = $("streak-n");
const fidelityEl = $("fidelity");
const fidelityNEl = $("fidelity-n");
const fidelityPctEl = $("fidelity-pct");
const rushBannerEl = $("rush-banner");
const rushTimerEl = $("rush-timer");
const basketsEl = $("baskets");
const bagEl = $("bag");
const bagContentsEl = $("bag-contents");
const bagCountEl = $("bag-count");
const customersEl = $("customers");
const shopBarEl = $("shop-bar");
const helpersEl = $("helpers");
const achievementsEl = $("achievements");
const toastsEl = $("toasts");
const floatersEl = $("floaters");
const exportEl = $("export");
const importEl = $("import");
const loadFileEl = $("load-file");
const muteEl = $("mute");
const resetEl = $("reset");

/* ==================== Toasts, flotantes y animaciones ==================== */

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  toastsEl.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function spawnFloater(x, y, text) {
  const s = document.createElement("span");
  s.textContent = text;
  s.style.left = x + (Math.random() * 30 - 15) + "px";
  s.style.top = y - 10 + "px";
  floatersEl.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

// La bolsa "vuela" desde la zona de preparación hasta el cliente
function animateBagToCustomer(targetCard) {
  if (!targetCard) return;
  const from = bagEl.getBoundingClientRect();
  const to = targetCard.getBoundingClientRect();
  const fly = document.createElement("div");
  fly.className = "bag-fly";
  fly.textContent = "🛍️";
  fly.style.left = from.left + from.width / 2 - 18 + "px";
  fly.style.top = from.top + from.height / 2 - 18 + "px";
  document.body.appendChild(fly);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  requestAnimationFrame(() => {
    fly.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    fly.style.opacity = "0";
  });
  setTimeout(() => fly.remove(), 700);
}

/* ==================== Cestos y bolsa ==================== */

function buildBaskets() {
  basketsEl.innerHTML = "";
  for (const f of FRUITS.slice(0, state.fruitsUnlocked)) {
    const card = document.createElement("div");
    card.className = "basket";
    card.innerHTML = `
      <div class="fruit">${f.emoji}</div>
      <div class="label">${f.name}</div>
      <div class="value">${f.value} 🪙</div>`;
    card.addEventListener("click", () => addToBag(f.id));
    basketsEl.appendChild(card);
  }
}

let bagFullToastAt = 0;

function addToBag(fruitId) {
  if (state.bag.length >= bagCap()) {
    bagEl.classList.remove("shake");
    void bagEl.offsetWidth;
    bagEl.classList.add("shake");
    const now = Date.now();
    if (now - bagFullToastAt > 2500) {
      bagFullToastAt = now;
      toast("🛍️ Bolsa llena: entrégala o vacíala");
    }
    return;
  }
  state.bag.push(fruitId);
  renderBag();
}

function renderBag() {
  if (state.bag.length === 0) {
    bagContentsEl.textContent = "vacía";
  } else {
    const counts = {};
    for (const id of state.bag) counts[id] = (counts[id] || 0) + 1;
    bagContentsEl.textContent = Object.keys(counts)
      .map((id) => fruitById(id).emoji + (counts[id] > 1 ? "×" + counts[id] : ""))
      .join(" ");
  }
  bagCountEl.textContent = state.bag.length + "/" + bagCap();
}

bagEl.addEventListener("click", () => {
  if (state.bag.length === 0) return;
  state.bag = [];
  renderBag();
});

/* ==================== Clientes ==================== */

let custKey = null;

function orderChipsHTML(order) {
  const chips = Object.keys(order.items).map((id) =>
    `<span class="order-chip">${fruitById(id).emoji}${order.items[id] > 1 ? "×" + order.items[id] : ""}</span>`
  );
  if (order.special) {
    chips.unshift(`<span class="order-chip special">${order.special === "zumo" ? "🥤" : "🥗"}</span>`);
  }
  return chips.join("");
}

function buildCustomers(force) {
  const key = state.queues.map((q) => (q.customer ? "c" : "e")).join("|") + "#" + state.queues.length;
  if (!force && key === custKey) return;
  custKey = key;
  customersEl.innerHTML = "";
  state._custEls = [];

  state.queues.forEach((q, qi) => {
    const slot = document.createElement("div");
    slot.className = "queue-slot";

    const label = document.createElement("div");
    label.className = "queue-label";
    label.textContent = "COLA " + (qi + 1);
    slot.appendChild(label);

    if (q.customer) {
      const card = document.createElement("div");
      card.className = "customer" + (q.customer.vip ? " vip" : "");
      card.innerHTML = `
        <div class="face">${q.customer.face}</div>
        <div style="flex:1">
          <div class="order">${orderChipsHTML(q.customer.order)}</div>
          <div class="patience"><div class="patience-fill"></div></div>
        </div>`;
      card.addEventListener("click", () => deliver(qi));
      slot.appendChild(card);
      state._custEls[qi] = {
        card,
        fill: card.querySelector(".patience-fill"),
        faceEl: card.querySelector(".face"),
      };
    } else {
      const waiting = document.createElement("div");
      waiting.className = "waiting";
      waiting.textContent = "Esperando cliente…";
      slot.appendChild(waiting);
      state._custEls[qi] = null;
    }
    customersEl.appendChild(slot);
  });
}

function updateCustomers() {
  state.queues.forEach((q, qi) => {
    const els = state._custEls && state._custEls[qi];
    if (!els || !q.customer) return;
    const c = q.customer;
    const pct = Math.max(0, c.patience * 100);
    els.fill.style.width = pct + "%";
    els.fill.style.background = pct > 50 ? "var(--green)" : pct > 25 ? "var(--orange)" : "var(--danger)";
    // La cara cambia según la paciencia restante
    els.faceEl.textContent = c.patience > 0.5 ? c.face : c.patience > 0.25 ? "😐" : "😠";
  });
}

/* ==================== Ventas ==================== */

function completeSale(qi, manual) {
  const q = state.queues[qi];
  if (!q || !q.customer) return 0;
  const c = q.customer;

  let value = orderValue(c.order) * cartMult() * priceMult();
  if (c.vip) value *= VIP_MULT;
  if (manual) {
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    value *= streakMult();
  }
  value = Math.round(value);

  state.money += value;
  state.totalEarned += value;
  state.lifetimeEarned += value;
  state.totalSales++;
  state.salesToday++;
  if (c.vip) state.vipsServed++;
  q.customer = null;
  q.nextSpawnAt = Date.now() + spawnDelay();

  checkDay();
  checkAchievements(false);
  return value;
}

function deliver(qi) {
  const q = state.queues[qi];
  if (!q || !q.customer) return;

  if (state.bag.length === 0) {
    toast("🛍️ La bolsa está vacía");
    return;
  }

  if (bagMatches(q.customer.order)) {
    const els = state._custEls && state._custEls[qi];
    const targetCard = els && els.card;
    const rect = targetCard && targetCard.getBoundingClientRect();
    const value = completeSale(qi, true);
    if (targetCard) {
      animateBagToCustomer(targetCard);
      spawnFloater(rect.left + rect.width / 2, rect.top + rect.height / 2, "+" + fmt(value) + " 🪙");
    }
    sfx("sale");
    state.bag = [];
    renderBag();
    buildCustomers(true);
  } else {
    state.streak = 0;
    q.customer.patience = Math.max(0.05, q.customer.patience - 0.2);
    sfx("error");
    toast("❌ Ese no es su pedido");
  }
  updateDynamic();
}

// Venta automática del personal (sin racha)
function autoServeOne() {
  let best = -1;
  let bestTime = Infinity;
  state.queues.forEach((q, qi) => {
    if (q.customer && q.customer.spawnedAt < bestTime) {
      bestTime = q.customer.spawnedAt;
      best = qi;
    }
  });
  if (best < 0) return;
  completeSale(best, false);
  buildCustomers(true);
}

function checkDay() {
  if (state.salesToday < DAY_GOAL) return;
  const bonus = Math.round(20 * state.day * priceMult());
  state.money += bonus;
  state.totalEarned += bonus;
  state.lifetimeEarned += bonus;
  state.day++;
  state.salesToday = 0;
  toast(`☀️ ¡Día completado! Bonus de cierre: +${fmt(bonus)} 🪙`);
}

/* ==================== Hora punta ==================== */

function scheduleRush() {
  state.nextRushAt = Date.now() + 90000 + Math.random() * 150000; // entre 1:30 y 4:00 min
}

function maybeRush(now) {
  if (isRush()) {
    rushBannerEl.hidden = false;
    rushTimerEl.textContent = Math.ceil((state.rushUntil - now) / 1000);
    return;
  }
  rushBannerEl.hidden = true;
  if (now >= state.nextRushAt) {
    state.rushUntil = now + RUSH_DURATION;
    state.rushesSeen++;
    scheduleRush();
    sfx("rush");
    toast("🕐 ¡Hora punta! Los clientes llegan x3 más rápido");
    checkAchievements(false);
  }
}

/* ==================== Barra de compras ==================== */

function shopCard(html, cls) {
  const card = document.createElement("div");
  card.className = "shop-card" + (cls ? " " + cls : "");
  card.innerHTML = html;
  shopBarEl.appendChild(card);
  return card;
}

function buildShopBar() {
  shopBarEl.innerHTML = "";

  // Nueva fruta
  const nf = nextFruit();
  const fruitCard = shopCard(nf
    ? `<div class="big">${nf.emoji}</div>
       <div class="info"><div class="name">Nueva fruta: ${nf.name}</div>
       <div class="desc">Vale ${nf.value} 🪙 y anima los pedidos</div></div>
       <button id="buy-fruit">${fmt(nf.unlockCost)} 🪙</button>`
    : `<div class="big">🌈</div>
       <div class="info"><div class="name">¡Todas las frutas!</div>
       <div class="desc">Tu frutería es legendaria</div></div>`);
  if (nf) fruitCard.querySelector("#buy-fruit").addEventListener("click", buyFruit);

  // Carretilla
  const cartMaxed = state.cartLevel >= CART_COSTS.length;
  const cartCard = shopCard(`
    <div class="big">🛒</div>
    <div class="info"><div class="name">Carretilla Nv. ${state.cartLevel}</div>
    <div class="desc">+2 a la bolsa y +10% a las ventas por nivel</div></div>
    ${cartMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-cart">${fmt(CART_COSTS[state.cartLevel])} 🪙</button>`}`);
  if (!cartMaxed) cartCard.querySelector("#buy-cart").addEventListener("click", buyCart);

  // Otra cola
  const queueMaxed = state.queues.length >= MAX_QUEUES;
  const queueCard = shopCard(`
    <div class="big">👥</div>
    <div class="info"><div class="name">Colas: ${state.queues.length}/${MAX_QUEUES}</div>
    <div class="desc">Atiende más clientes a la vez</div></div>
    ${queueMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-queue">${fmt(QUEUE_COSTS[state.queues.length - 1])} 🪙</button>`}`);
  if (!queueMaxed) queueCard.querySelector("#buy-queue").addEventListener("click", buyQueue);

  // Licuadora (zumos y macedonias)
  const blenderCard = shopCard(`
    <div class="big">🥤</div>
    <div class="info"><div class="name">Licuadora</div>
    <div class="desc">Desbloquea zumos (x3) y macedonias (x2.5)</div></div>
    ${state.blender ? `<div class="owned">✔</div>` : `<button id="buy-blender">${fmt(BLENDER_COST)} 🪙</button>`}`);
  if (!state.blender) blenderCard.querySelector("#buy-blender").addEventListener("click", buyBlender);

  // Decoración
  const decoMaxed = state.decoLevel >= DECO_MAX;
  const decoCard = shopCard(`
    <div class="big">🪴</div>
    <div class="info"><div class="name">Decoración Nv. ${state.decoLevel}</div>
    <div class="desc">+10% paciencia y +5% llegada de clientes por nivel</div></div>
    ${decoMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-deco">${fmt(decoCost())} 🪙</button>`}`);
  if (!decoMaxed) decoCard.querySelector("#buy-deco").addEventListener("click", buyDeco);

  // Franquicia (prestigio)
  const gain = prestigeGain();
  const prestigeCard = shopCard(`
    <div class="big">🏪</div>
    <div class="info"><div class="name">Franquicia ⭐ ${state.fidelity}</div>
    <div class="desc">Reinicia la tienda: cada punto da +10% ventas, +3% paciencia y +5% velocidad del personal</div></div>
    <button id="buy-prestige" ${gain < 1 ? "disabled" : ""}>+${gain} ⭐</button>`, "prestige");
  prestigeCard.querySelector("#buy-prestige").addEventListener("click", prestige);
}

function updateShopBar() {
  const nf = nextFruit();
  const bf = $("buy-fruit");
  if (bf && nf) bf.disabled = state.money < nf.unlockCost;
  const bc = $("buy-cart");
  if (bc) bc.disabled = state.money < CART_COSTS[state.cartLevel];
  const bq = $("buy-queue");
  if (bq) bq.disabled = state.money < QUEUE_COSTS[state.queues.length - 1];
  const bb = $("buy-blender");
  if (bb) bb.disabled = state.money < BLENDER_COST;
  const bd = $("buy-deco");
  if (bd) bd.disabled = state.money < decoCost();
  const bp = $("buy-prestige");
  if (bp) {
    const gain = prestigeGain();
    bp.textContent = "+" + gain + " ⭐";
    bp.disabled = gain < 1;
  }
}

function buyFruit() {
  const nf = nextFruit();
  if (!nf || state.money < nf.unlockCost) return;
  state.money -= nf.unlockCost;
  state.fruitsUnlocked++;
  sfx("buy");
  toast(`${nf.emoji} ¡Nueva fruta desbloqueada: ${nf.name}!`);
  buildBaskets();
  buildShopBar();
  updateDynamic();
  checkAchievements(false);
}

function buyCart() {
  if (state.cartLevel >= CART_COSTS.length) return;
  const cost = CART_COSTS[state.cartLevel];
  if (state.money < cost) return;
  state.money -= cost;
  state.cartLevel++;
  sfx("buy");
  toast(`🛒 Carretilla mejorada: bolsa ${bagCap()} y ventas x${cartMult().toFixed(1)}`);
  buildShopBar();
  renderBag();
  updateDynamic();
}

function buyQueue() {
  if (state.queues.length >= MAX_QUEUES) return;
  const cost = QUEUE_COSTS[state.queues.length - 1];
  if (state.money < cost) return;
  state.money -= cost;
  state.queues.push(newQueue());
  sfx("buy");
  toast("👥 ¡Nueva cola abierta!");
  buildShopBar();
  buildCustomers(true);
  updateDynamic();
  checkAchievements(false);
}

function buyBlender() {
  if (state.blender || state.money < BLENDER_COST) return;
  state.money -= BLENDER_COST;
  state.blender = true;
  sfx("buy");
  toast("🥤 ¡Licuadora comprada! Ya puedes servir zumos y macedonias");
  buildShopBar();
  updateDynamic();
  checkAchievements(false);
}

function buyDeco() {
  if (state.decoLevel >= DECO_MAX) return;
  const cost = decoCost();
  if (state.money < cost) return;
  state.money -= cost;
  state.decoLevel++;
  sfx("buy");
  toast(`🪴 Tienda más bonita: paciencia +${state.decoLevel * 10}%`);
  buildShopBar();
  updateDynamic();
  checkAchievements(false);
}

function prestige() {
  const gain = prestigeGain();
  if (gain < 1) return;
  if (!confirm(`¿Abrir una franquicia?\n\nPierdes: monedas, frutas, carretilla, colas, personal y día actual.\nGanas: ${gain} ⭐ de fidelidad (cada punto: +10% ventas, +3% paciencia, +5% velocidad del personal).\n\nLos logros y las estadísticas de siempre se conservan.`)) return;

  const keep = {
    achievements: state.achievements,
    lifetimeEarned: state.lifetimeEarned,
    totalSales: state.totalSales,
    bestStreak: state.bestStreak,
    angry: state.angry,
    vipsServed: state.vipsServed,
    rushesSeen: state.rushesSeen,
    muted: state.muted,
    fidelity: state.fidelity + gain,
    prestiges: state.prestiges + 1,
  };
  state = Object.assign(defaultState(), keep);
  custKey = null;
  sfx("prestige");
  rebuildAll();
  save();
  toast(`🏪 ¡Franquicia abierta! +${gain} ⭐ de fidelidad`);
  checkAchievements(false);
}

/* ==================== Personal ==================== */

function buildHelpers() {
  helpersEl.innerHTML = "";
  for (const h of HELPERS) {
    const card = document.createElement("div");
    card.className = "helper-card";
    card.innerHTML = `
      <div class="emoji">${h.emoji}</div>
      <div class="info">
        <div class="name">${h.name}</div>
        <div class="desc">${h.desc}</div>
      </div>
      <div class="owned" data-owned>x0</div>
      <button data-helper="${h.id}"></button>`;
    helpersEl.appendChild(card);
    h._els = { owned: card.querySelector("[data-owned]"), btn: card.querySelector("button") };
  }
}

function updateHelpers() {
  for (const h of HELPERS) {
    if (!h._els) continue;
    h._els.owned.textContent = "x" + (state.helpers[h.id] || 0);
    const cost = helperCost(h);
    h._els.btn.textContent = fmt(cost) + " 🪙";
    h._els.btn.disabled = state.money < cost;
  }
}

function buyHelper(id) {
  const h = HELPERS.find((x) => x.id === id);
  if (!h) return;
  const cost = helperCost(h);
  if (state.money < cost) return;
  state.money -= cost;
  state.helpers[id] = (state.helpers[id] || 0) + 1;
  sfx("buy");
  toast(`${h.emoji} ¡${h.name} contratado!`);
  updateHelpers();
  checkAchievements(false);
}

/* ==================== Logros ==================== */

function buildAchievements() {
  achievementsEl.innerHTML = "";
  for (const a of ACHIEVEMENTS) {
    const card = document.createElement("div");
    card.className = "ach-card locked";
    card.innerHTML = `
      <div class="emoji">${a.emoji}</div>
      <div>
        <div class="name">${a.name}</div>
        <div class="desc">${a.desc}</div>
      </div>`;
    achievementsEl.appendChild(card);
    a._el = card;
  }
}

function checkAchievements(silent) {
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id] || !a.cond()) continue;
    state.achievements[a.id] = true;
    if (a._el) {
      a._el.classList.remove("locked");
      a._el.classList.add("unlocked");
    }
    if (!silent) toast(`🏆 Logro desbloqueado: ${a.name}`);
  }
}

/* ==================== Bucle principal ==================== */

function updateDynamic() {
  moneyEl.textContent = fmt(state.money);
  dayEl.textContent = state.day;
  dayProgressEl.textContent = state.salesToday + "/" + DAY_GOAL;
  dayFillEl.style.width = Math.min(100, (state.salesToday / DAY_GOAL) * 100) + "%";

  if (state.streak >= 2) {
    streakEl.hidden = false;
    streakNEl.textContent = streakMult().toFixed(2);
  } else {
    streakEl.hidden = true;
  }

  if (state.fidelity > 0) {
    fidelityEl.hidden = false;
    fidelityNEl.textContent = state.fidelity;
    fidelityPctEl.textContent = Math.round(FID_SALE * state.fidelity * 100);
  } else {
    fidelityEl.hidden = true;
  }

  updateCustomers();
  updateShopBar();
  updateHelpers();
}

function tick() {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  let customersChanged = false;

  // Aparición y paciencia de clientes
  for (const q of state.queues) {
    if (!q.customer && now >= q.nextSpawnAt) {
      q.customer = makeCustomer();
      customersChanged = true;
      if (!document.hidden) sfx("bell");
    } else if (q.customer) {
      q.customer.patience -= dt / q.customer.maxPatience;
      if (q.customer.patience <= 0) {
        q.customer = null;
        q.nextSpawnAt = now + spawnDelay();
        state.angry++;
        state.streak = 0;
        customersChanged = true;
        sfx("angry");
        toast("😡 Un cliente se marchó sin comprar");
      }
    }
  }

  // Personal automático
  for (const h of HELPERS) {
    const count = state.helpers[h.id] || 0;
    if (count === 0) continue;
    const effectiveInterval = h.interval / (count * helperSpeedMult());
    state.helperTimers[h.id] = (state.helperTimers[h.id] || 0) + dt;
    while (state.helperTimers[h.id] >= effectiveInterval) {
      state.helperTimers[h.id] -= effectiveInterval;
      autoServeOne();
    }
  }

  maybeRush(now);
  if (customersChanged) buildCustomers(true);
  updateDynamic();
}

/* ==================== Reconstrucción completa ==================== */

function rebuildAll() {
  custKey = null;
  buildBaskets();
  renderBag();
  buildCustomers(true);
  buildShopBar();
  buildHelpers();
  buildAchievements();
  updateDynamic();
}

/* ==================== Eventos ==================== */

helpersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-helper]");
  if (btn) buyHelper(btn.dataset.helper);
});

exportEl.addEventListener("click", exportSave);

importEl.addEventListener("click", () => loadFileEl.click());

loadFileEl.addEventListener("change", () => {
  if (loadFileEl.files && loadFileEl.files[0]) importSave(loadFileEl.files[0]);
  loadFileEl.value = ""; // permite cargar el mismo archivo dos veces
});

muteEl.addEventListener("click", () => {
  state.muted = !state.muted;
  muteEl.textContent = state.muted ? "🔇" : "🔊";
  toast(state.muted ? "🔇 Sonido desactivado" : "🔊 Sonido activado");
});

resetEl.addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres borrar tu partida y empezar de cero? (Exporta antes si quieres conservarla)")) return;
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  scheduleRush();
  rebuildAll();
  toast("Partida reiniciada 🍎");
});

window.addEventListener("beforeunload", save);

/* ==================== Inicio ==================== */

load();
if (!state.nextRushAt) scheduleRush();
lastTick = Date.now();

rebuildAll();
checkAchievements(true); // marca en silencio los logros ya cumplidos al cargar
muteEl.textContent = state.muted ? "🔇" : "🔊";

for (const t of pendingToasts) toast(t);

setInterval(tick, TICK_MS);
setInterval(save, 10000);
