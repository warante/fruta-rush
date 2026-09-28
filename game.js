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

// Personal con desbloqueo progresivo
const HELPERS = [
  { id: "becario",     emoji: "🧑‍🌾", name: "Becario",       interval: 20, baseCost: 30,   desc: "Sirve un cliente cada 20s.", unlockReq: null },
  { id: "dependienta", emoji: "👩‍💼", name: "Dependienta",   interval: 12, baseCost: 150,  desc: "Sirve un cliente cada 12s.", unlockReq: { type: "becario", count: 3 } },
  { id: "cajero",      emoji: "🧑‍💻", name: "Cajero",        interval: 7,  baseCost: 600,  desc: "Sirve un cliente cada 7s.", unlockReq: { type: "dependienta", count: 3 } },
  { id: "gerente",     emoji: "👔", name: "Gerente",         interval: 4,  baseCost: 2500, desc: "Sirve un cliente cada 4s.", unlockReq: { type: "cajero", count: 3 } },
  { id: "experto",     emoji: "🎩", name: "Experto",         interval: 2,  baseCost: 10000, desc: "Muy rápido pero a veces se equivoca (-10% valor).", unlockReq: { type: "gerente", count: 3 }, penalty: 0.1 },
];

const CART_COSTS = [120, 300, 750, 1800, 4500, 10000, 25000, 60000];
const QUEUE_COSTS = [200, 500, 1200, 3000, 7500, 18000, 45000];
const MAX_QUEUES = 8;
const QUEUE_CAP_COSTS = [150, 400, 1000, 2500]; // Aumentar capacidad de cola: 2→3→4→5
const MAX_QUEUE_CAP = 5;
const BLENDER_COST = 800;
const OVEN_COST = 3000;
const JUICER_COST = 8000;
const DECO_BASE_COST = 150;
const DECO_GROWTH = 2.2;
const DECO_MAX = 10;
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

const DAY_GOAL = 25;
const BASE_PATIENCE = 35;
const VARIETY_STEP = 0.5;
const STREAK_STEP = 0.05;
const STREAK_MAX = 0.5;
const MANUAL_TIP = 0.25;
const MANUAL_PATIENCE = 1.25;
const HELPER_GROWTH = 1.5;
const VIP_MULT = 5;
const SPECIAL_CHANCE = 0.25;
const RUSH_DURATION = 30000;
const FRANCHISE_CATALOG = [
  { id: "barrio", name: "Frutería del Barrio", district: "Residencial", emoji: "🏡", style: "residential", arrival: 0.85, patience: 1.25, vipChance: 0.08, varietyBonus: 0 },
  { id: "centro", name: "Mercado Central", district: "Centro", emoji: "🏙️", style: "downtown", arrival: 1.25, patience: 0.9, vipChance: 0.12, varietyBonus: 0, cost: 5000, reputation: 60, helper: "gerente", helperCount: 1, starterCash: 300 },
  { id: "turistico", name: "Fruta de Temporada", district: "Turístico", emoji: "🏖️", style: "tourist", arrival: 1, patience: 1, vipChance: 0.25, varietyBonus: 1, cost: 50000, reputation: 70, sales: 250, starterCash: 1500 },
];

const STORE_FIELDS = [
  "money", "totalEarned", "day", "salesToday", "fruitsUnlocked", "cartLevel", "decoLevel",
  "queueCapacity", "blender", "oven", "juicer", "bag", "queues", "helpers", "helperTimers",
  "helperAssignments", "streak", "rushUntil", "nextRushAt", "activeEvent", "eventUntil",
  "nextEventAt", "stats", "lastSeen", "reputation",
];

const CUSTOMER_FACES = ["👩", "🧑", "👵", "👴", "👦", "👧", "🧔", "👱‍♀️", "🧓", "👨‍🦰", "👩‍🦱", "🧑‍🦳"];

// Eventos aleatorios
const EVENTS = [
  { id: "market",   emoji: "🎪", name: "Día de Mercado",   desc: "Precios x2 durante 60s",       duration: 60000, type: "good" },
  { id: "tip",      emoji: "💰", name: "Propina Generosa", desc: "Bonus de 500 🪙",              duration: 0,     type: "good" },
  { id: "review",   emoji: "⭐", name: "Buena Reseña",     desc: "+20% paciencia durante 90s",   duration: 90000, type: "good" },
  { id: "inspect",  emoji: "📋", name: "Inspección",       desc: "-30% velocidad durante 45s",   duration: 45000, type: "bad" },
  { id: "rain",     emoji: "🌧️", name: "Día Lluvioso",     desc: "-50% clientes durante 60s",    duration: 60000, type: "bad" },
  { id: "break",    emoji: "🔧", name: "Avería",           desc: "Una cola se cierra 30s",       duration: 30000, type: "bad" },
];

const ACHIEVEMENTS = [
  { id: "first",      emoji: "🧺", name: "Primera Venta",       desc: "Sirve tu primer pedido.",              cond: () => state.totalSales >= 1 },
  { id: "sales50",    emoji: "📈", name: "Negocio en Marcha",   desc: "Completa 50 ventas.",                  cond: () => state.totalSales >= 50 },
  { id: "sales200",   emoji: "📊", name: "En Ascenso",          desc: "Completa 200 ventas.",                 cond: () => state.totalSales >= 200 },
  { id: "sales500",   emoji: "🏪", name: "Franquicia Local",    desc: "Completa 500 ventas.",                 cond: () => state.totalSales >= 500 },
  { id: "sales2000",  emoji: "🏬", name: "Cadena Nacional",     desc: "Completa 2000 ventas.",                cond: () => state.totalSales >= 2000 },
  { id: "day5",       emoji: "🗓️", name: "Semana Completa",     desc: "Llega al día 5.",                      cond: () => state.day >= 5 },
  { id: "day15",      emoji: "📅", name: "Quincena",            desc: "Llega al día 15.",                     cond: () => state.day >= 15 },
  { id: "day30",      emoji: "🏆", name: "Mes Redondo",         desc: "Llega al día 30.",                     cond: () => state.day >= 30 },
  { id: "day60",      emoji: "🎖️", name: "Dos Meses",           desc: "Llega al día 60.",                     cond: () => state.day >= 60 },
  { id: "fruit3",     emoji: "🍊", name: "Tres Frutas",         desc: "Desbloquea 3 frutas.",                 cond: () => state.fruitsUnlocked >= 3 },
  { id: "fruit5",     emoji: "🌈", name: "Variedad",            desc: "Desbloquea 5 frutas.",                 cond: () => state.fruitsUnlocked >= 5 },
  { id: "fruit8",     emoji: "🍇", name: "Frutero Experto",     desc: "Desbloquea 8 frutas.",                 cond: () => state.fruitsUnlocked >= 8 },
  { id: "fruitAll",   emoji: "🍒", name: "Fruta Rush Completa", desc: "Desbloquea todas las frutas.",         cond: () => state.fruitsUnlocked >= FRUITS.length },
  { id: "queue2",     emoji: "👥", name: "Doble Cola",          desc: "Abre 2 colas.",                        cond: () => state.queues.length >= 2 },
  { id: "queue4",     emoji: "👥", name: "Cuádruple Cola",      desc: "Abre 4 colas.",                        cond: () => state.queues.length >= 4 },
  { id: "queue8",     emoji: "👥", name: "Multitudes",          desc: "Abre 8 colas a la vez.",               cond: () => state.queues.length >= MAX_QUEUES },
  { id: "helper1",    emoji: "🧑‍🌾", name: "Primer Empleado",     desc: "Contrata a tu primer ayudante.",       cond: () => totalHelpers() >= 1 },
  { id: "helper5",    emoji: "👥", name: "Equipo Pequeño",      desc: "Contrata 5 empleados.",                cond: () => totalHelpers() >= 5 },
  { id: "helper10",   emoji: "🏢", name: "Departamento",        desc: "Contrata 10 empleados.",               cond: () => totalHelpers() >= 10 },
  { id: "streak5",    emoji: "🔥", name: "En Racha",            desc: "Encadena 5 ventas sin fallos.",        cond: () => state.bestStreak >= 5 },
  { id: "streak15",   emoji: "🔥", name: "Imparable",           desc: "Encadena 15 ventas sin fallos.",       cond: () => state.bestStreak >= 15 },
  { id: "rich",       emoji: "💰", name: "Hucha Llena",         desc: "Gana 10.000 monedas en total.",        cond: () => state.lifetimeEarned >= 10000 },
  { id: "richer",     emoji: "💎", name: "Millonario",          desc: "Gana 100.000 monedas en total.",       cond: () => state.lifetimeEarned >= 100000 },
  { id: "angry1",     emoji: "😡", name: "Cliente Cabreado",    desc: "Un cliente se marcha sin comprar.",    cond: () => state.angry >= 1 },
  { id: "angry10",    emoji: "😤", name: "Mala Reputación",     desc: "10 clientes se marchan enfadados.",    cond: () => state.angry >= 10 },
  { id: "vip10",      emoji: "⭐", name: "Cliente Estrella",    desc: "Sirve a 10 clientes VIP.",             cond: () => state.vipsServed >= 10 },
  { id: "vip50",      emoji: "🌟", name: "Favorito de los VIP", desc: "Sirve a 50 clientes VIP.",             cond: () => state.vipsServed >= 50 },
  { id: "rush1",      emoji: "🕐", name: "Hora Punta",          desc: "Sobrevive a una hora punta.",          cond: () => state.rushesSeen >= 1 },
  { id: "rush5",      emoji: "⏰", name: "Veterano del Rush",   desc: "Sobrevive 5 horas punta.",             cond: () => state.rushesSeen >= 5 },
  { id: "blender1",   emoji: "🥤", name: "Zumos Naturales",     desc: "Compra la licuadora.",                 cond: () => state.blender },
  { id: "oven1",      emoji: "🍰", name: "Repostero",           desc: "Compra el horno.",                     cond: () => state.oven },
  { id: "juicer1",    emoji: "🧃", name: "Zumos Premium",       desc: "Compra el exprimidor.",                cond: () => state.juicer },
  { id: "deco3",      emoji: "🌸", name: "Toque Floral",        desc: "Decoración al nivel 3.",               cond: () => state.decoLevel >= 3 },
  { id: "deco5",      emoji: "🪴", name: "Tienda Bonita",       desc: "Decoración al nivel 5.",               cond: () => state.decoLevel >= 5 },
  { id: "deco10",     emoji: "🏰", name: "Palacio de Fruta",    desc: "Decoración al máximo.",                cond: () => state.decoLevel >= DECO_MAX },
  { id: "prestige1",  emoji: "🏪", name: "Segunda Casa",        desc: "Abre tu primera franquicia.",          cond: () => state.franchises.length >= 2 },
  { id: "prestige3",  emoji: "🏢", name: "Cadena",              desc: "Abre 3 franquicias.",                  cond: () => state.franchises.length >= 3 },
  { id: "event1",     emoji: "🎲", name: "Suertudo",            desc: "Sobrevive un evento aleatorio.",       cond: () => state.eventsSeen >= 1 },
  { id: "event10",    emoji: "🎰", name: "Vividor",             desc: "Sobrevive 10 eventos.",                cond: () => state.eventsSeen >= 10 },
  { id: "allmax",     emoji: "💎", name: "Todo al Máximo",      desc: "Carretilla, decoración, colas y máquinas al máximo.", cond: () => state.cartLevel >= CART_COSTS.length && state.decoLevel >= DECO_MAX && state.queues.length >= MAX_QUEUES && state.blender && state.oven && state.juicer },
];

const SAVE_KEY = "fruta-rush-v4";
const LEGACY_SAVE_KEY = "fruta-rush-v3";
const TICK_MS = 100;

/* ==================== Estado ==================== */

function newQueue() {
  return { customers: [], nextSpawnAt: Date.now() + 1000 + Math.random() * 2000, closed: false, manual: false };
}

function emptyStoreRecord(profile) {
  return { ...profile, unlocked: true, data: null };
}

function defaultState() {
  return {
    money: 0,
    totalEarned: 0,
    lifetimeEarned: 0,
    totalSales: 0,
    angry: 0,
    streak: 0,
    bestStreak: 0,
    day: 1,
    salesToday: 0,
    reputation: 50,
    fruitsUnlocked: 2,
    cartLevel: 0,
    decoLevel: 0,
    queueCapacity: 2, // Capacidad máxima de clientes por cola
    blender: false,
    oven: false,
    juicer: false,
    bag: [],
    queues: [newQueue()],
    helpers: {},
    helperTimers: {},
    helperAssignments: {},
    achievements: {},
    franchises: [emptyStoreRecord(FRANCHISE_CATALOG[0])],
    activeFranchiseId: "barrio",
    vipsServed: 0,
    rushesSeen: 0,
    rushUntil: 0,
    nextRushAt: 0,
    eventsSeen: 0,
    activeEvent: null,
    eventUntil: 0,
    nextEventAt: 0,
    stats: {
      salesHistory: [],
      lastSaleTime: Date.now(),
    },
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
function activeFranchise() { return state.franchises.find((franchise) => franchise.id === state.activeFranchiseId); }
function bagCap() { return 4 + 2 * state.cartLevel; }
function cartMult() { return 1 + 0.1 * state.cartLevel; }
function priceMult() { return 1; }
function manualTip(streak) { return MANUAL_TIP + Math.min(Math.max(0, streak - 1) * STREAK_STEP, STREAK_MAX); }
function streakMult() { return 1 + manualTip(state.streak); }
function patienceMax() {
  const franchise = activeFranchise() || FRANCHISE_CATALOG[0];
  let mult = BASE_PATIENCE * (1 + 0.1 * state.decoLevel) * franchise.patience;
  if (state.activeEvent === "review") mult *= 1.2;
  return mult;
}
function helperSpeedMult() {
  let mult = 1;
  if (state.activeEvent === "inspect") mult *= 0.7;
  return mult;
}
function arrivalMult() {
  const franchise = activeFranchise() || FRANCHISE_CATALOG[0];
  let mult = (1 + 0.05 * state.decoLevel) * franchise.arrival;
  if (state.activeEvent === "rain") mult *= 0.5;
  return mult;
}
function eventPriceMult() {
  return state.activeEvent === "market" ? 2 : 1;
}
function totalHelpers() { return Object.values(state.helpers).reduce((a, b) => a + b, 0); }
function helperCost(h) { return Math.ceil(h.baseCost * Math.pow(HELPER_GROWTH, state.helpers[h.id] || 0)); }
function decoCost() { return Math.ceil(DECO_BASE_COST * Math.pow(DECO_GROWTH, state.decoLevel)); }
function nextFruit() { return FRUITS[state.fruitsUnlocked] || null; }
function isRush() { return Date.now() < state.rushUntil; }

function isHelperUnlocked(h) {
  if (!h.unlockReq) return true;
  return (state.helpers[h.unlockReq.type] || 0) >= h.unlockReq.count;
}

function getUnlockedHelpers() {
  return HELPERS.filter(isHelperUnlocked);
}

function orderValue(order) {
  const ids = Object.keys(order.items);
  let sum = 0;
  for (const id of ids) sum += fruitById(id).value * order.items[id];
  let mult = 1 + VARIETY_STEP * (ids.length - 1);
  if (order.special === "zumo") mult = 3;
  if (order.special === "macedonia") mult = 2.5;
  if (order.special === "pastel") mult = 4;
  if (order.special === "zumoDoble") mult = 5;
  return Math.round(sum * mult);
}

function makeOrder(vip) {
  const unlocked = FRUITS.slice(0, state.fruitsUnlocked);
  const cap = bagCap();
  const cartBonus = Math.min(state.cartLevel, 3);

  // Pedidos especiales según máquinas
  const hasSpecial = state.blender || state.oven || state.juicer;
  if (!vip && hasSpecial && Math.random() < SPECIAL_CHANCE && cap >= 3) {
    const specials = [];
    if (state.blender && unlocked.length >= 1) specials.push("zumo");
    if (state.blender && unlocked.length >= 3) specials.push("macedonia");
    if (state.oven) specials.push("pastel");
    if (state.juicer && unlocked.length >= 1) specials.push("zumoDoble");

    if (specials.length > 0) {
      const tipo = specials[Math.floor(Math.random() * specials.length)];
      if (tipo === "zumo") {
        const f = unlocked[Math.floor(Math.random() * unlocked.length)];
        return { items: { [f.id]: 3 }, special: "zumo" };
      }
      if (tipo === "macedonia") {
        const pool = [...unlocked];
        const items = {};
        for (let i = 0; i < 3; i++) {
          const f = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
          items[f.id] = 1;
        }
        return { items, special: "macedonia" };
      }
      if (tipo === "pastel") {
        const f = unlocked[Math.floor(Math.random() * unlocked.length)];
        return { items: { [f.id]: 4 }, special: "pastel" };
      }
      if (tipo === "zumoDoble") {
        const f = unlocked[Math.floor(Math.random() * unlocked.length)];
        return { items: { [f.id]: 5 }, special: "zumoDoble" };
      }
    }
  }

  // Pedido normal - tamaño influido por carretilla
  const franchise = activeFranchise() || FRANCHISE_CATALOG[0];
  const maxDistinct = Math.min((vip ? 4 : 3) + cartBonus + franchise.varietyBonus, unlocked.length);
  const minDistinct = vip ? Math.min(2, maxDistinct) : 1;
  const distinct = minDistinct + Math.floor(Math.random() * (maxDistinct - minDistinct + 1));
  const pool = [...unlocked];
  const items = {};
  let count = 0;
  const maxItems = cap + cartBonus;
  for (let i = 0; i < distinct && count < maxItems; i++) {
    const f = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    let qty = 1 + (Math.random() < (vip ? 0.6 : 0.4) ? 1 : 0);
    if (state.cartLevel >= 3 && Math.random() < 0.3) qty++;
    qty = Math.min(qty, maxItems - count);
    items[f.id] = qty;
    count += qty;
  }
  return { items, special: null };
}

function makeCustomer() {
  const franchise = activeFranchise() || FRANCHISE_CATALOG[0];
  const vip = Math.random() < franchise.vipChance;
  return {
    face: vip ? "🤩" : CUSTOMER_FACES[Math.floor(Math.random() * CUSTOMER_FACES.length)],
    vip,
    order: makeOrder(vip),
    patience: 1,
    maxPatience: patienceMax() * (vip ? 0.5 : 1),
    spawnedAt: Date.now(),
    id: Math.random().toString(36).substr(2, 9),
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

/* ==================== Sonidos ==================== */

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
  } catch (e) { /* audio no disponible */ }
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
    case "event":    beep(440, 0.1, "sine", 0.1); beep(660, 0.1, "sine", 0.1, 0.1); break;
  }
}

/* ==================== Persistencia ==================== */

function save() {
  state.lastSeen = Date.now();
  saveActiveFranchise();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* sin espacio */ }
}

function sanitizeLoaded(data) {
  state = Object.assign(defaultState(), data);
  const legacySave = !Array.isArray(data.franchises);
  const legacyFidelity = Number.isFinite(data.fidelity) ? Math.max(0, data.fidelity) : 0;
  if (legacySave && legacyFidelity > 0) {
    const expansionFunds = legacyFidelity * 5000;
    state.money += expansionFunds;
    pendingToasts.push(`⭐ Tu fidelidad anterior se convirtió en ${fmt(expansionFunds)} 🪙 para expandir la cadena`);
  }
  delete state.fidelity;
  delete state.prestiges;
  if (!Array.isArray(state.franchises) || state.franchises.length === 0) {
    state.franchises = [emptyStoreRecord(FRANCHISE_CATALOG[0])];
  }
  state.franchises = state.franchises.map((record, index) => {
    const profile = FRANCHISE_CATALOG.find((franchise) => franchise.id === record.id) || FRANCHISE_CATALOG[index];
    return profile ? { ...profile, ...record, data: record.data || null } : null;
  }).filter(Boolean).slice(0, FRANCHISE_CATALOG.length);
  if (!state.franchises.some((franchise) => franchise.id === state.activeFranchiseId)) {
    state.activeFranchiseId = state.franchises[0].id;
  }
  if (!Number.isFinite(state.reputation)) state.reputation = 50;
  if (!Array.isArray(state.queues) || state.queues.length === 0) state.queues = [newQueue()];
  state.queues = state.queues.slice(0, MAX_QUEUES);
  let manualQueueFound = false;
  state.queues.forEach((q) => {
    q.manual = q.manual === true && !manualQueueFound;
    if (q.manual) manualQueueFound = true;
    if (!Array.isArray(q.customers)) q.customers = [];
    q.customers.forEach((c) => {
      c.patience = 1;
      if (!c.maxPatience) c.maxPatience = patienceMax();
    });
    if (!Number.isFinite(q.nextSpawnAt) || q.nextSpawnAt < Date.now() - 10000 || q.nextSpawnAt > Date.now() + 60000) {
      q.nextSpawnAt = Date.now() + 1500;
    }
    q.closed = false;
  });
  // El evento activo no se conserva al cargar: se reinicia y el banner queda oculto
  state.activeEvent = null;
  if (!state.nextRushAt) scheduleRush();
  if (!state.nextEventAt) scheduleEvent();
  if (!state.stats) state.stats = { salesHistory: [], lastSaleTime: Date.now() };
  if (!Array.isArray(state.stats.salesHistory)) state.stats.salesHistory = [];
}

function load() {
  try {
    const currentSave = localStorage.getItem(SAVE_KEY);
    const raw = currentSave || localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return;
    sanitizeLoaded(JSON.parse(raw));
    offlineGains();
    saveActiveFranchise();
    if (!currentSave) save();
  } catch (e) {
    console.warn("No se pudo cargar la partida", e);
  }
}

function helpersRate() {
  if (state.queues.every((q) => q.manual)) return 0;
  return HELPERS.reduce((s, h) => s + (state.helpers[h.id] || 0) / h.interval, 0) * helperSpeedMult();
}

function avgOrderValue() {
  const unlocked = FRUITS.slice(0, state.fruitsUnlocked);
  const avg = unlocked.reduce((s, f) => s + f.value, 0) / unlocked.length;
  return avg * 2 * cartMult() * priceMult();
}

function offlineGains() {
  if (!state.lastSeen) return;
  const elapsed = Math.min(MAX_OFFLINE_SECONDS, (Date.now() - state.lastSeen) / 1000);
  if (elapsed < 60) return;
  const gain = helpersRate() * elapsed * 0.5 * avgOrderValue();
  if (gain < 1) return;
  state.money += gain;
  state.totalEarned += gain;
  state.lifetimeEarned += gain;
  const message = `💤 ${activeFranchise()?.name || "Tu tienda"} ganó ${fmt(gain)} monedas mientras no estabas`;
  if (document.readyState === "complete") toast(message);
  else pendingToasts.push(message);
}

function saveActiveFranchise() {
  const franchise = activeFranchise();
  if (!franchise) return;
  franchise.data = Object.fromEntries(STORE_FIELDS.map((field) => [field, JSON.parse(JSON.stringify(state[field]))]));
}

function activateFranchise(franchise) {
  const fresh = defaultState();
  const data = franchise.data || Object.fromEntries(STORE_FIELDS.map((field) => [field, fresh[field]]));
  STORE_FIELDS.forEach((field) => { state[field] = JSON.parse(JSON.stringify(data[field])); });
  state.lastSeen = Number.isFinite(state.lastSeen) ? state.lastSeen : Date.now();
  if (!state.queues.length) state.queues = [newQueue()];
  state.queues.forEach((queue) => { queue.closed = false; });
  if (!state.nextRushAt) scheduleRush();
  if (!state.nextEventAt) scheduleEvent();
  offlineGains();
  state.lastSeen = Date.now();
  franchise.data = Object.fromEntries(STORE_FIELDS.map((field) => [field, JSON.parse(JSON.stringify(state[field]))]));
}

function franchiseRequirement(profile) {
  const checks = [
    state.money >= profile.cost,
    state.reputation >= profile.reputation,
    !profile.helper || (state.helpers[profile.helper] || 0) >= profile.helperCount,
    !profile.sales || state.totalSales >= profile.sales,
  ];
  return checks.every(Boolean);
}

function openNextFranchise() {
  const profile = FRANCHISE_CATALOG[state.franchises.length];
  if (!profile || !franchiseRequirement(profile)) return;
  state.money -= profile.cost;
  state.lastSeen = Date.now();
  saveActiveFranchise();
  const franchise = emptyStoreRecord(profile);
  state.franchises.push(franchise);
  state.activeFranchiseId = franchise.id;
  activateFranchise(franchise);
  state.money = profile.starterCash;
  lastTick = Date.now();
  sfx("buy");
  toast(`${profile.emoji} ¡Abrió ${profile.name}!`);
  rebuildAll();
  save();
  checkAchievements(false);
}

function switchFranchise(id) {
  if (id === state.activeFranchiseId) return;
  const target = state.franchises.find((franchise) => franchise.id === id);
  if (!target) return;
  state.lastSeen = Date.now();
  saveActiveFranchise();
  state.activeFranchiseId = target.id;
  activateFranchise(target);
  lastTick = Date.now();
  custKey = null;
  rebuildAll();
  save();
  toast(`${target.emoji} ${target.name}`);
}

/* ==================== Guardar / cargar desde disco ==================== */

function exportSave() {
  save();
  const payload = {
    game: "fruta-rush",
    version: 4,
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
  toast("💾 Partida descargada");
}

function importSave(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const loaded = data && data.state ? data.state : data;
      if (!loaded || typeof loaded.money !== "number") throw new Error("formato inválido");
      sanitizeLoaded(loaded);
      offlineGains();
      saveActiveFranchise();
      rebuildAll();
      save();
      toast("📂 Partida cargada");
    } catch (e) {
      console.warn("Archivo no válido", e);
      toast("❌ Archivo no válido");
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
const franchiseListEl = $("franchise-list");
const franchiseCountEl = $("franchise-count");
const rushBannerEl = $("rush-banner");
const rushTimerEl = $("rush-timer");
const eventBannerEl = $("event-banner");
const eventTextEl = $("event-text");
const eventTimerEl = $("event-timer");
const eventInfoBtn = $("event-info-btn");
const eventDescEl = $("event-desc");
const basketsEl = $("baskets");
const bagEl = $("bag");
const bagContentsEl = $("bag-contents");
const bagCountEl = $("bag-count");
const customersEl = $("customers");
const shopBarEl = $("shop-bar");
const helpersEl = $("helpers");
const achievementsEl = $("achievements");
const statsEl = $("stats");
const toastsEl = $("toasts");
const floatersEl = $("floaters");
const exportEl = $("export");
const importEl = $("import");
const loadFileEl = $("load-file");
const muteEl = $("mute");
const resetEl = $("reset");
const helpBtnEl = $("help-btn");
const helpModalEl = $("help-modal");
const helpCloseEl = $("help-close");

/* ==================== Toasts y animaciones ==================== */

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  toastsEl.appendChild(el);
  setTimeout(() => {
    el.classList.add("fade-out");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function spawnFloater(x, y, text) {
  const s = document.createElement("span");
  s.textContent = text;
  s.style.left = x + (Math.random() * 30 - 15) + "px";
  s.style.top = y - 10 + "px";
  floatersEl.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

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
    const specialEmoji = { zumo: "🥤", macedonia: "🥗", pastel: "🍰", zumoDoble: "🧃" }[order.special] || "✨";
    chips.unshift(`<span class="order-chip special">${specialEmoji}</span>`);
  }
  return chips.join("");
}

const queueCollapsed = {};
// Inicializar todas las colas como desplegadas
for (let i = 0; i < MAX_QUEUES; i++) queueCollapsed[i] = false;

function toggleManualQueue(qi) {
  const reserve = !state.queues[qi].manual;
  state.queues.forEach((q, index) => {
    const manual = reserve && index === qi;
    if (Boolean(q.manual) !== manual) {
      q.customers.forEach((c) => { c.maxPatience *= manual ? MANUAL_PATIENCE : 1 / MANUAL_PATIENCE; });
    }
    q.manual = manual;
  });
  for (const [key, assignment] of Object.entries(state.helperAssignments)) {
    if (assignment && state.queues[assignment.queueIndex]?.manual) delete state.helperAssignments[key];
  }
  buildCustomers(true);
  save();
}

function buildCustomers(force) {
  const key = state.queues.map((q) => q.customers.length + (q.closed ? "c" : "o")).join("|") + "#" + state.queues.length + "#cap" + state.queueCapacity;
  if (!force && key === custKey) return;
  custKey = key;
  customersEl.innerHTML = "";
  state._custEls = [];

  state.queues.forEach((q, qi) => {
    const slot = document.createElement("div");
    slot.className = "queue-slot" + (q.closed ? " closed" : "") + (q.manual ? " manual-queue" : "");

    // Encabezado plegable (siempre visible)
    const header = document.createElement("div");
    header.className = "queue-header";
    const count = q.customers.length;
    const isCollapsed = queueCollapsed[qi] || false;
    header.innerHTML = `
      <span class="queue-title">COLA ${qi + 1}</span>
      <span class="queue-count">${q.closed ? "" : count + "/" + state.queueCapacity + " 👥"}</span>
      <button type="button" class="queue-mode" aria-pressed="${Boolean(q.manual)}" aria-label="Cambiar cola ${qi + 1} a modo ${q.manual ? "automático" : "manual"}">Cambiar a ${q.manual ? "automático" : "manual"}</button>
      <span class="queue-arrow">${isCollapsed ? "▶" : "▼"}</span>
    `;
    header.querySelector(".queue-mode").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleManualQueue(qi);
    });
    header.addEventListener("click", (e) => {
      e.stopPropagation();
      queueCollapsed[qi] = !queueCollapsed[qi];
      buildCustomers(true);
    });
    slot.appendChild(header);

    const hint = document.createElement("p");
    hint.className = "queue-mode-status" + (q.manual ? " queue-manual-hint" : "");
    hint.textContent = q.manual ? "Modo manual · solo atiendes tú" : "Modo automático · disponible para el personal";
    slot.appendChild(hint);

    // Cuerpo plegable
    const body = document.createElement("div");
    body.className = "queue-body" + (isCollapsed ? " collapsed" : "");

    if (q.closed) {
      const closed = document.createElement("div");
      closed.className = "queue-closed";
      closed.textContent = "🔧 Cerrada";
      body.appendChild(closed);
    } else {
      // Renderizar siempre queueCapacity huecos para evitar rebotes de layout
      for (let si = 0; si < state.queueCapacity; si++) {
        const c = q.customers[si];
        if (c) {
          const card = document.createElement("div");
          card.className = "customer" + (c.vip ? " vip" : "") + (si === 0 ? " first" : "");
          card.innerHTML = `
            <div class="face">${c.face}</div>
            <div style="flex:1">
              <div class="order">${orderChipsHTML(c.order)}</div>
              <div class="patience"><div class="patience-fill"></div></div>
              <div class="serving" hidden>
                <span class="serving-emoji">👤</span>
                <div class="serving-bar"><div class="serving-fill"></div></div>
              </div>
            </div>`;
          card.addEventListener("click", () => deliver(qi, si));
          body.appendChild(card);
          if (!state._custEls[qi]) state._custEls[qi] = [];
          state._custEls[qi][si] = {
            card,
            fill: card.querySelector(".patience-fill"),
            faceEl: card.querySelector(".face"),
            serving: card.querySelector(".serving"),
            servingEmoji: card.querySelector(".serving-emoji"),
            servingFill: card.querySelector(".serving-fill"),
          };
        } else {
          // Hueco vacío
          const empty = document.createElement("div");
          empty.className = "customer empty-slot";
          empty.innerHTML = `<div class="face empty-face"></div><div style="flex:1"><div class="order empty-order">Hueco libre</div></div>`;
          body.appendChild(empty);
          if (!state._custEls[qi]) state._custEls[qi] = [];
          state._custEls[qi][si] = null;
        }
      }
    }
    slot.appendChild(body);
    customersEl.appendChild(slot);
  });
}

function getServingAssignment(qi, customerId) {
  for (const key of Object.keys(state.helperAssignments)) {
    const a = state.helperAssignments[key];
    if (a && a.queueIndex === qi && a.customerId === customerId) return a;
  }
  return null;
}

function updateCustomers() {
  const now = Date.now();
  customersEl.querySelectorAll(".queue-manual-hint").forEach((hint) => {
    hint.textContent = `Modo manual · solo atiendes tú · próxima propina +${Math.round(manualTip(state.streak + 1) * 100)}% · más paciencia`;
  });
  state.queues.forEach((q, qi) => {
    if (!state._custEls[qi]) return;
    // Recorrer todos los huecos de la cola (incluidos los vacíos)
    for (let si = 0; si < state.queueCapacity; si++) {
      const els = state._custEls[qi][si];
      const c = q.customers[si];
      if (!els || !c) continue;
      const pct = Math.max(0, c.patience * 100);
      els.fill.style.width = pct + "%";
      els.fill.style.background = pct > 50 ? "var(--green)" : pct > 25 ? "var(--orange)" : "var(--danger)";
      els.faceEl.textContent = c.patience > 0.5 ? c.face : c.patience > 0.25 ? "😐" : "😠";

      // Indicador de qué empleado está atendiendo a este cliente
      const a = getServingAssignment(qi, c.id);
      if (a && els.serving) {
        const helper = HELPERS.find((h) => h.id === a.helperId);
        const serviceTime = (helper ? helper.interval : 1) * 1000 / helperSpeedMult();
        const progress = Math.min(1, Math.max(0, (now - a.startedAt) / serviceTime));
        els.serving.hidden = false;
        els.servingEmoji.textContent = a.helperEmoji || (helper ? helper.emoji : "👤");
        els.serving.title = a.helperName || (helper ? helper.name : "Empleado");
        els.servingFill.style.width = (progress * 100) + "%";
      } else if (els.serving) {
        els.serving.hidden = true;
      }
    }
  });
}

/* ==================== Ventas ==================== */

function completeSale(qi, ci, manual, helperId) {
  const q = state.queues[qi];
  if (!q || !q.customers[ci]) return 0;
  const c = q.customers[ci];

  let value = orderValue(c.order) * cartMult() * priceMult() * eventPriceMult();
  if (c.vip) value *= VIP_MULT;
  if (manual) {
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    value *= streakMult();
  }
  // Penalización del experto
  if (helperId && helperId.startsWith("experto") && Math.random() < 0.1) {
    value *= 0.9;
  }
  value = Math.round(value);

  state.money += value;
  state.totalEarned += value;
  state.lifetimeEarned += value;
  state.reputation = Math.min(100, state.reputation + (manual ? 1.5 : 0.3));
  state.totalSales++;
  state.salesToday++;
  if (c.vip) state.vipsServed++;

  // Stats para velocidad
  const now = Date.now();
  state.stats.salesHistory.push(now);
  state.stats.salesHistory = state.stats.salesHistory.filter(t => now - t < 60000);
  state.stats.lastSaleTime = now;

  q.customers.splice(ci, 1);
  if (q.customers.length === 0) {
    q.nextSpawnAt = now + spawnDelay();
  }

  // Liberar asignación del helper
  if (helperId) {
    delete state.helperAssignments[helperId];
  }

  checkDay();
  checkAchievements(false);
  return value;
}

function deliver(qi, ci) {
  const q = state.queues[qi];
  if (!q || !q.customers[ci]) return;
  if (q.closed) {
    toast("🔧 Esta cola está cerrada");
    return;
  }

  if (state.bag.length === 0) {
    toast("🛍️ La bolsa está vacía");
    return;
  }

  if (bagMatches(q.customers[ci].order)) {
    const els = state._custEls[qi] && state._custEls[qi][ci];
    const targetCard = els && els.card;
    const rect = targetCard && targetCard.getBoundingClientRect();
    const value = completeSale(qi, ci, true, null);
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
    state.reputation = Math.max(0, state.reputation - 0.1);
    q.customers[ci].patience = Math.max(0.05, q.customers[ci].patience - 0.2);
    sfx("error");
    toast("❌ Ese no es su pedido");
  }
  updateDynamic();
}

function autoServeOne(helperKey, helper) {
  // Encontrar el cliente más antiguo que no esté siendo atendido (en cualquier posición de la cola)
  let bestQueue = -1;
  let bestCustomerId = null;
  let bestTime = Infinity;

  state.queues.forEach((q, qi) => {
    if (q.closed || q.manual || q.customers.length === 0) return;
    q.customers.forEach((c) => {
      if (c.spawnedAt < bestTime) {
        // Verificar que otro helper no esté atendiendo a este cliente
        const isBeingServed = Object.entries(state.helperAssignments)
          .some(([hid, assignment]) => hid !== helperKey && assignment && assignment.queueIndex === qi && assignment.customerId === c.id);
        if (!isBeingServed) {
          bestTime = c.spawnedAt;
          bestQueue = qi;
          bestCustomerId = c.id;
        }
      }
    });
  });

  if (bestQueue < 0) return false;

  // Asignar el helper a este cliente
  state.helperAssignments[helperKey] = {
    queueIndex: bestQueue,
    customerId: bestCustomerId,
    startedAt: Date.now(),
    helperId: helper.id,
    helperEmoji: helper.emoji,
    helperName: helper.name,
  };
  return true;
}

function checkDay() {
  if (state.salesToday < DAY_GOAL) return;
  const bonus = Math.round(20 * state.day * priceMult());
  state.money += bonus;
  state.totalEarned += bonus;
  state.lifetimeEarned += bonus;
  state.day++;
  state.salesToday = 0;
  toast(`☀️ ¡Día ${state.day - 1} completado! Bonus: +${fmt(bonus)} 🪙`);
}

/* ==================== Hora punta ==================== */

function scheduleRush() {
  state.nextRushAt = Date.now() + 90000 + Math.random() * 150000;
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
    toast("🕐 ¡Hora punta! Clientes x3");
    checkAchievements(false);
  }
}

/* ==================== Eventos aleatorios ==================== */

function scheduleEvent() {
  state.nextEventAt = Date.now() + 60000 + Math.random() * 120000;
}

function maybeEvent(now) {
  if (state.activeEvent) {
    if (now >= state.eventUntil) {
      state.activeEvent = null;
      eventBannerEl.hidden = true;
      eventDescEl.hidden = true;
      scheduleEvent();
    } else {
      eventBannerEl.hidden = false;
      eventTimerEl.textContent = Math.ceil((state.eventUntil - now) / 1000);
      const ev = EVENTS.find((e) => e.id === state.activeEvent);
      if (ev) {
        eventTextEl.textContent = `${ev.emoji} ${ev.name}`;
        eventBannerEl.className = ev.type === "good" ? "good" : "bad";
        eventDescEl.textContent = ev.desc;
      }
    }
    return;
  }
  if (now >= state.nextEventAt) {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    state.eventsSeen++;
    sfx("event");
    toast(`${ev.emoji} ${ev.name}: ${ev.desc}`);

    // Los eventos con duración muestran banner con texto + cuenta atrás; los instantáneos (tip) no
    if (ev.duration > 0) {
      state.activeEvent = ev.id;
      state.eventUntil = now + ev.duration;
      eventBannerEl.hidden = false;
      eventBannerEl.className = ev.type === "good" ? "good" : "bad";
      eventTextEl.textContent = `${ev.emoji} ${ev.name}`;
      eventTimerEl.textContent = Math.ceil(ev.duration / 1000);
      eventDescEl.textContent = ev.desc;
      eventDescEl.hidden = true;
    }

    // Efectos inmediatos
    if (ev.id === "tip") {
      state.money += 500;
      state.totalEarned += 500;
      state.lifetimeEarned += 500;
      scheduleEvent();
    }
    if (ev.id === "break") {
      const openQueues = state.queues.map((q, i) => ({ q, i })).filter(x => !x.q.closed);
      if (openQueues.length > 1) {
        const toClose = openQueues[Math.floor(Math.random() * openQueues.length)];
        toClose.q.closed = true;
        setTimeout(() => {
          toClose.q.closed = false;
          buildCustomers(true);
          toast("🔧 Cola reparada");
        }, ev.duration);
      }
    }
    checkAchievements(false);
    buildCustomers(true);
  }
}

/* ==================== Barra de compras ==================== */

function buildFranchisePanel() {
  franchiseListEl.innerHTML = "";
  state.franchises.forEach((franchise) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `franchise-card ${franchise.style}`;
    button.dataset.franchiseId = franchise.id;
    button.innerHTML = `
      <span class="franchise-card-top"><span class="franchise-icon">${franchise.emoji}</span><span class="franchise-name">${franchise.name}</span><span class="franchise-active" hidden>ACTIVA</span></span>
      <span class="franchise-district">${franchise.district} · ${franchiseTrait(franchise)}</span>
      <span class="franchise-stats"><span><strong data-money>0</strong> 🪙</span><span>⭐ <strong data-reputation>50</strong></span></span>`;
    button.addEventListener("click", () => switchFranchise(franchise.id));
    franchiseListEl.appendChild(button);
  });

  const next = FRANCHISE_CATALOG[state.franchises.length];
  if (next) {
    const card = document.createElement("article");
    card.className = `franchise-card franchise-locked ${next.style}`;
    card.innerHTML = `
      <div class="franchise-card-top"><span class="franchise-icon">🔒</span><span class="franchise-name">${next.name}</span></div>
      <p class="franchise-district">${next.district} · ${franchiseTrait(next)}</p>
      <p class="franchise-requirements" data-requirements></p>
      <button class="franchise-open" data-open-franchise>🌱 Abrir tienda</button>`;
    card.querySelector("[data-open-franchise]").addEventListener("click", openNextFranchise);
    franchiseListEl.appendChild(card);
  }
  updateFranchisePanel();
}

function franchiseTrait(franchise) {
  if (franchise.id === "barrio") return "clientes pacientes";
  if (franchise.id === "centro") return "más afluencia";
  return "más clientes VIP y pedidos variados";
}

function updateFranchisePanel() {
  franchiseCountEl.textContent = `${state.franchises.length}/${FRANCHISE_CATALOG.length} abiertas`;
  franchiseListEl.querySelectorAll("[data-franchise-id]").forEach((button) => {
    const franchise = state.franchises.find((item) => item.id === button.dataset.franchiseId);
    if (!franchise) return;
    const data = franchise.id === state.activeFranchiseId ? state : franchise.data || {};
    button.classList.toggle("active", franchise.id === state.activeFranchiseId);
    button.setAttribute("aria-pressed", String(franchise.id === state.activeFranchiseId));
    button.querySelector("[data-money]").textContent = fmt(data.money || 0);
    button.querySelector("[data-reputation]").textContent = String(Math.round(data.reputation ?? 50));
    button.querySelector(".franchise-active").hidden = franchise.id !== state.activeFranchiseId;
  });

  const next = FRANCHISE_CATALOG[state.franchises.length];
  const card = franchiseListEl.querySelector(".franchise-locked");
  if (!next || !card) return;
  const requirementParts = [`${fmt(next.cost)} 🪙`, `Reputación ${next.reputation}`];
  if (next.helper) {
    const helper = HELPERS.find((item) => item.id === next.helper);
    requirementParts.push(`${helper.name} x${next.helperCount}`);
  }
  if (next.sales) requirementParts.push(`${next.sales} ventas de la cadena`);
  card.querySelector("[data-requirements]").textContent = requirementParts.join(" · ");
  card.querySelector("[data-open-franchise]").disabled = !franchiseRequirement(next);
}

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
       <div class="desc">Vale ${nf.value} 🪙</div></div>
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
    <div class="desc">+2 bolsa, +10% ventas, pedidos más grandes</div></div>
    ${cartMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-cart">${fmt(CART_COSTS[state.cartLevel])} 🪙</button>`}`);
  if (!cartMaxed) cartCard.querySelector("#buy-cart").addEventListener("click", buyCart);

  // Cola
  const queueMaxed = state.queues.length >= MAX_QUEUES;
  const queueCard = shopCard(`
    <div class="big">👥</div>
    <div class="info"><div class="name">Colas: ${state.queues.length}/${MAX_QUEUES}</div>
    <div class="desc">Atiende más clientes a la vez</div></div>
    ${queueMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-queue">${fmt(QUEUE_COSTS[state.queues.length - 1])} 🪙</button>`}`);
  if (!queueMaxed) queueCard.querySelector("#buy-queue").addEventListener("click", buyQueue);

  // Capacidad de cola
  const queueCapMaxed = state.queueCapacity >= MAX_QUEUE_CAP;
  const queueCapCard = shopCard(`
    <div class="big">📏</div>
    <div class="info"><div class="name">Tamaño de cola: ${state.queueCapacity}/${MAX_QUEUE_CAP}</div>
    <div class="desc">Más clientes por cola</div></div>
    ${queueCapMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-queue-cap">${fmt(QUEUE_CAP_COSTS[state.queueCapacity - 2])} </button>`}`);
  if (!queueCapMaxed) queueCapCard.querySelector("#buy-queue-cap").addEventListener("click", buyQueueCap);

  // Licuadora
  const blenderCard = shopCard(`
    <div class="big">🥤</div>
    <div class="info"><div class="name">Licuadora</div>
    <div class="desc">Zumos (x3) y macedonias (x2.5)</div></div>
    ${state.blender ? `<div class="owned">✔</div>` : `<button id="buy-blender">${fmt(BLENDER_COST)} 🪙</button>`}`);
  if (!state.blender) blenderCard.querySelector("#buy-blender").addEventListener("click", buyBlender);

  // Horno
  const ovenCard = shopCard(`
    <div class="big">🍰</div>
    <div class="info"><div class="name">Horno</div>
    <div class="desc">Pasteles de fruta (x4 valor)</div></div>
    ${state.oven ? `<div class="owned">✔</div>` : `<button id="buy-oven">${fmt(OVEN_COST)} 🪙</button>`}`);
  if (!state.oven) ovenCard.querySelector("#buy-oven").addEventListener("click", buyOven);

  // Exprimidor
  const juicerCard = shopCard(`
    <div class="big">🧃</div>
    <div class="info"><div class="name">Exprimidor</div>
    <div class="desc">Zumos dobles premium (x5 valor)</div></div>
    ${state.juicer ? `<div class="owned">✔</div>` : `<button id="buy-juicer">${fmt(JUICER_COST)} 🪙</button>`}`);
  if (!state.juicer) juicerCard.querySelector("#buy-juicer").addEventListener("click", buyJuicer);

  // Decoración
  const decoMaxed = state.decoLevel >= DECO_MAX;
  const decoCard = shopCard(`
    <div class="big">🪴</div>
    <div class="info"><div class="name">Decoración Nv. ${state.decoLevel}</div>
    <div class="desc">+10% paciencia y +5% llegada por nivel</div></div>
    ${decoMaxed ? `<div class="owned">MAX</div>` : `<button id="buy-deco">${fmt(decoCost())} 🪙</button>`}`);
  if (!decoMaxed) decoCard.querySelector("#buy-deco").addEventListener("click", buyDeco);

}

function updateShopBar() {
  const nf = nextFruit();
  const bf = $("buy-fruit");
  if (bf && nf) bf.disabled = state.money < nf.unlockCost;
  const bc = $("buy-cart");
  if (bc) bc.disabled = state.money < CART_COSTS[state.cartLevel];
  const bq = $("buy-queue");
  if (bq) bq.disabled = state.money < QUEUE_COSTS[state.queues.length - 1];
  const bqc = $("buy-queue-cap");
  if (bqc) bqc.disabled = state.money < QUEUE_CAP_COSTS[state.queueCapacity - 2];
  const bb = $("buy-blender");
  if (bb) bb.disabled = state.money < BLENDER_COST;
  const bo = $("buy-oven");
  if (bo) bo.disabled = state.money < OVEN_COST;
  const bj = $("buy-juicer");
  if (bj) bj.disabled = state.money < JUICER_COST;
  const bd = $("buy-deco");
  if (bd) bd.disabled = state.money < decoCost();
}

function buyFruit() {
  const nf = nextFruit();
  if (!nf || state.money < nf.unlockCost) return;
  state.money -= nf.unlockCost;
  state.fruitsUnlocked++;
  sfx("buy");
  toast(`${nf.emoji} ¡${nf.name} desbloqueada!`);
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
  toast(`🛒 Carretilla Nv. ${state.cartLevel}`);
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
  queueCollapsed[state.queues.length - 1] = false;
  sfx("buy");
  toast("👥 ¡Nueva cola!");
  buildShopBar();
  buildCustomers(true);
  updateDynamic();
  checkAchievements(false);
}

function buyQueueCap() {
  if (state.queueCapacity >= MAX_QUEUE_CAP) return;
  const cost = QUEUE_CAP_COSTS[state.queueCapacity - 2];
  if (state.money < cost) return;
  state.money -= cost;
  state.queueCapacity++;
  sfx("buy");
  toast(`📏 ¡Tamaño de cola aumentado a ${state.queueCapacity}!`);
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
  toast("🥤 ¡Licuadora comprada!");
  buildShopBar();
  updateDynamic();
  checkAchievements(false);
}

function buyOven() {
  if (state.oven || state.money < OVEN_COST) return;
  state.money -= OVEN_COST;
  state.oven = true;
  sfx("buy");
  toast("🍰 ¡Horno comprado!");
  buildShopBar();
  updateDynamic();
  checkAchievements(false);
}

function buyJuicer() {
  if (state.juicer || state.money < JUICER_COST) return;
  state.money -= JUICER_COST;
  state.juicer = true;
  sfx("buy");
  toast("🧃 ¡Exprimidor comprado!");
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
  toast(`🪴 Decoración Nv. ${state.decoLevel}`);
  buildShopBar();
  updateDynamic();
  checkAchievements(false);
}

/* ==================== Personal ==================== */

function buildHelpers() {
  helpersEl.innerHTML = "";

  // Índice del último ayudante desbloqueado
  let lastUnlocked = -1;
  HELPERS.forEach((h, i) => { if (isHelperUnlocked(h)) lastUnlocked = i; });

  HELPERS.forEach((h, i) => {
    const unlocked = isHelperUnlocked(h);
    // Solo se muestra el siguiente nivel al desbloqueado (como misterio); el resto se oculta
    const showMystery = !unlocked && i === lastUnlocked + 1;
    if (!unlocked && !showMystery) {
      h._els = null;
      return;
    }

    const card = document.createElement("div");
    card.className = "helper-card" + (unlocked ? "" : " locked");

    if (unlocked) {
      card.innerHTML = `
        <div class="emoji">${h.emoji}</div>
        <div class="info">
          <div class="name">${h.name}</div>
          <div class="desc">${h.desc}</div>
        </div>
        <div class="owned" data-owned>x0</div>
        <button data-helper="${h.id}"></button>`;
      helpersEl.appendChild(card);
      h._els = { owned: card.querySelector("[data-owned]"), btn: card.querySelector("button"), card };
    } else {
      card.innerHTML = `
        <div class="emoji">🔒</div>
        <div class="info">
          <div class="name">??????</div>
          <div class="desc">Contrata más personal para desbloquear</div>
        </div>`;
      helpersEl.appendChild(card);
      h._els = { card };
    }
  });
}

function updateHelpers() {
  for (const h of HELPERS) {
    if (!h._els || !h._els.owned) continue;
    h._els.owned.textContent = "x" + (state.helpers[h.id] || 0);
    const cost = helperCost(h);
    h._els.btn.textContent = fmt(cost) + " 🪙";
    h._els.btn.disabled = state.money < cost;
  }
}

function buyHelper(id) {
  const h = HELPERS.find((x) => x.id === id);
  if (!h || !isHelperUnlocked(h)) return;
  const cost = helperCost(h);
  if (state.money < cost) return;
  state.money -= cost;
  state.helpers[id] = (state.helpers[id] || 0) + 1;
  sfx("buy");
  toast(`${h.emoji} ¡${h.name} contratado!`);
  updateHelpers();
  buildHelpers();
  checkAchievements(false);
}

/* ==================== Estadísticas ==================== */

function getSalesPerMinute() {
  const now = Date.now();
  if (!state.stats || !Array.isArray(state.stats.salesHistory)) state.stats = { salesHistory: [], lastSaleTime: now };
  state.stats.salesHistory = state.stats.salesHistory.filter(t => now - t < 60000);
  return state.stats.salesHistory.length;
}

function getBonifications() {
  const bonuses = [];
  if (state.cartLevel > 0) bonuses.push(`🛒 Carretilla: +${state.cartLevel * 10}% ventas`);
  if (state.decoLevel > 0) bonuses.push(`🪴 Decoración: +${state.decoLevel * 10}% paciencia`);
  if (state.blender) bonuses.push(`🥤 Licuadora: pedidos x2.5-3`);
  if (state.oven) bonuses.push(`🍰 Horno: pasteles x4`);
  if (state.juicer) bonuses.push(`🧃 Exprimidor: zumos x5`);
  return bonuses;
}

function buildStats() {
  statsEl.innerHTML = "";

  const stats = [
    { label: "Total vendido", value: fmt(state.lifetimeEarned) + " 🪙" },
    { label: "Ventas totales", value: state.totalSales },
    { label: "Velocidad", value: getSalesPerMinute() + " clientes/min" },
    { label: "Mejor racha", value: state.bestStreak },
    { label: "Clientes enfadados", value: state.angry },
    { label: "VIPs atendidos", value: state.vipsServed },
    { label: "Días de esta tienda", value: state.day },
    { label: "Franquicias", value: state.franchises.length },
    { label: "Reputación de esta tienda", value: Math.round(state.reputation) + "/100" },
  ];

  stats.forEach(s => {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `<span class="stat-label">${s.label}</span><span class="stat-value">${s.value}</span>`;
    statsEl.appendChild(row);
  });

  const bonuses = getBonifications();
  if (bonuses.length > 0) {
    const bonusTitle = document.createElement("div");
    bonusTitle.className = "stat-title";
    bonusTitle.textContent = "Bonificaciones activas";
    statsEl.appendChild(bonusTitle);

    bonuses.forEach(b => {
      const row = document.createElement("div");
      row.className = "stat-row bonus";
      row.textContent = b;
      statsEl.appendChild(row);
    });
  }
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
    if (!silent) toast(`🏆 ${a.name}`);
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

  updateFranchisePanel();
  updateCustomers();
  updateShopBar();
  updateHelpers();
  buildStats();
}

function tick() {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  let customersChanged = false;

  // Aparición y paciencia de clientes
  for (const q of state.queues) {
    if (q.closed) continue;

    // Spawn de clientes
    if (!Number.isFinite(q.nextSpawnAt)) q.nextSpawnAt = now + 1500;
    if (now >= q.nextSpawnAt && q.customers.length < state.queueCapacity) {
      const customer = makeCustomer();
      if (q.manual) customer.maxPatience *= MANUAL_PATIENCE;
      q.customers.push(customer);
      customersChanged = true;
      q.nextSpawnAt = now + spawnDelay();
      if (q.customers.length === 1 && !document.hidden) sfx("bell");
    }

    // Paciencia
    for (let i = q.customers.length - 1; i >= 0; i--) {
      const c = q.customers[i];
      c.patience -= dt / c.maxPatience;
      if (c.patience <= 0) {
        q.customers.splice(i, 1);
        state.angry++;
        state.reputation = Math.max(0, state.reputation - 0.5);
        state.streak = 0;
        customersChanged = true;
        sfx("angry");
      }
    }

    // Seguridad: si la cola queda vacía y nextSpawnAt es pasado, reprogramar
    if (q.customers.length === 0 && q.nextSpawnAt <= now) {
      q.nextSpawnAt = now + spawnDelay();
    }
  }

  // Personal automático - cada empleado atiende a una persona
  for (const h of HELPERS) {
    const count = state.helpers[h.id] || 0;
    if (count === 0) continue;

    // Para cada empleado de este tipo
    for (let i = 0; i < count; i++) {
      const helperKey = h.id + "_" + i;
      const assignment = state.helperAssignments[helperKey];

      if (assignment) {
        if (state.queues[assignment.queueIndex]?.manual) {
          delete state.helperAssignments[helperKey];
          continue;
        }
        // Verificar si terminó de atender
        const elapsed = now - assignment.startedAt;
        const serviceTime = h.interval * 1000 / helperSpeedMult();
        if (elapsed >= serviceTime) {
          const q = state.queues[assignment.queueIndex];
          const ci = q ? q.customers.findIndex((c) => c.id === assignment.customerId) : -1;
          if (q && ci >= 0) {
            completeSale(assignment.queueIndex, ci, false, helperKey);
            customersChanged = true;
          } else {
            delete state.helperAssignments[helperKey];
          }
        }
      } else {
        // Intentar asignar a un cliente
        autoServeOne(helperKey, h);
      }
    }
  }

  maybeRush(now);
  maybeEvent(now);
  if (customersChanged) buildCustomers(true);
  updateDynamic();
}

/* ==================== Reconstrucción ==================== */

function rebuildAll() {
  custKey = null;
  buildFranchisePanel();
  buildBaskets();
  renderBag();
  buildCustomers(true);
  buildShopBar();
  buildHelpers();
  buildAchievements();
  buildStats();
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
  loadFileEl.value = "";
});

muteEl.addEventListener("click", () => {
  state.muted = !state.muted;
  muteEl.textContent = state.muted ? "🔇" : "🔊";
  toast(state.muted ? "🔇 Sonido off" : "🔊 Sonido on");
});

resetEl.addEventListener("click", () => {
  if (!confirm("¿Borrar partida y empezar de cero?")) return;
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LEGACY_SAVE_KEY);
  state = defaultState();
  scheduleRush();
  scheduleEvent();
  rebuildAll();
  toast("Partida reiniciada 🍎");
});

helpBtnEl.addEventListener("click", () => {
  helpModalEl.hidden = false;
});

helpCloseEl.addEventListener("click", () => {
  helpModalEl.hidden = true;
});

helpModalEl.addEventListener("click", (e) => {
  if (e.target === helpModalEl) helpModalEl.hidden = true;
});

// Botón de información del banner de eventos
if (eventInfoBtn) {
  eventInfoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    eventDescEl.hidden = !eventDescEl.hidden;
  });
}

// Plegar/desplegar secciones de estadísticas y logros
document.querySelectorAll("h2.collapsible").forEach((h) => {
  h.addEventListener("click", () => {
    const body = document.getElementById(h.dataset.target);
    const collapsed = body.classList.toggle("collapsed");
    const arrow = h.querySelector(".arrow");
    if (arrow) arrow.textContent = collapsed ? "▶" : "▼";
    h.setAttribute("aria-expanded", String(!collapsed));
  });
});

window.addEventListener("beforeunload", save);

/* ==================== Inicio ==================== */

load();
if (!state.nextRushAt) scheduleRush();
if (!state.nextEventAt) scheduleEvent();
lastTick = Date.now();

rebuildAll();
checkAchievements(true);
muteEl.textContent = state.muted ? "🔇" : "🔊";

for (const t of pendingToasts) toast(t);

setInterval(tick, TICK_MS);
setInterval(save, 10000);
