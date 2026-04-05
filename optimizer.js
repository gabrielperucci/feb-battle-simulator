'use strict';

// ── Gear stat tables (representative value per rarity 0–5) ──────────────────
const WEAPON_PRIMARY   = [30,  55,  80,  115, 155, 260]; // faca/pistola/fuzil/sniper/tank/jato (ponto médio)
const WEAPON_SECONDARY = [3,   8,   13,  18,  30,  45 ];
const HELMET_STAT      = [8,   23,  40,  80,  100, 135]; // (1-15)(16-30)(31-50)(71-90)(91-110)(121-150)
const CHEST_STAT       = [3,   8,   13,  25,  43,  63 ]; // (1-5)(6-10)(11-15)(21-30)(36-50)(56-70)
const PANTS_STAT       = [3,   8,   13,  25,  43,  63 ]; // (1-5)(6-10)(11-15)(21-30)(36-50)(56-70)
const BOOTS_STAT       = [3,   8,   13,  23,  35,  55 ]; // (1-5)(6-10)(11-15)(21-25)(31-40)(51-60)
const GLOVES_STAT      = [3,   8,   13,  23,  35,  55 ]; // (1-5)(6-10)(11-15)(21-25)(31-40)(51-60)
const RARITY_COSTS     = [1.5, 5,   20,  57,  160, 440 ];
const SCRAP_PER_RARITY = [2,   6,   18,  54,  162, 486 ];
const RARITY_NAMES     = ['Cinza','Verde','Azul','Roxo','Amarelo','Vermelho'];

const AMMO_BONUS       = [0,  10,  20,  40 ];
const AMMO_COST_HIT    = [0,  0.12, 0.46, 1.94];
const FOOD_BONUS       = [0,  10,  15,  20 ];
const FOOD_COST        = [0,  0.90, 2.00, 4.50];
const FOOD_NAMES       = ['Sem comida','Pão','Bife','Peixe'];
const AMMO_NAMES       = ['Sem munição','Leve','Munição','Pesada'];

// ── Individual encoding ──────────────────────────────────────────────────────
//
// Single-phase (phase != 'all')  →  16 variables:
//   [0-7]  skills (atk,prc,cc,cd,arm,ddg,hp,hunger)  0-10 each, sum ≤ level*4
//   [8-13] gear   (wR,helmR,chestR,pantsR,bootsR,glovR)  0-5 each
//   [14]   ammoIdx  0-3
//   [15]   foodIdx  0-3
//
// All-phases  →  28 variables:
//   [0-7]   skills (shared)
//   [8-13]  prePill  gear
//   [14-19] burst    gear
//   [20-25] sustained gear
//   [26]    ammoIdx (shared)  0-3
//   [27]    foodIdx (shared)  0-3

function indSize(phase) { return phase === 'all' ? 28 : 16; }

// ── Helpers ──────────────────────────────────────────────────────────────────
function clampInt(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

function repairSkills(ind, level, pinned) {
    const budget = level * 4;
    for (let i = 0; i < 8; i++) {
        ind[i] = (pinned && pinned.skills && pinned.skills[i] !== undefined)
            ? pinned.skills[i]
            : clampInt(ind[i], 0, 10);
    }
    let total = 0;
    for (let i = 0; i < 8; i++) total += ind[i];

    // Trim over-budget (modify free skills only)
    for (let iter = 0; iter < 200 && total > budget; iter++) {
        const cands = [];
        for (let i = 0; i < 8; i++) {
            if ((!pinned || !pinned.skills || pinned.skills[i] === undefined) && ind[i] > 0) cands.push(i);
        }
        if (!cands.length) break;
        ind[cands[Math.floor(Math.random() * cands.length)]]--;
        total--;
    }
    // Fill to budget — skills are free, unused budget is always suboptimal
    for (let iter = 0; iter < 200 && total < budget; iter++) {
        const cands = [];
        for (let i = 0; i < 8; i++) {
            if ((!pinned || !pinned.skills || pinned.skills[i] === undefined) && ind[i] < 10) cands.push(i);
        }
        if (!cands.length) break;
        ind[cands[Math.floor(Math.random() * cands.length)]]++;
        total++;
    }
}

function applyPinned(ind, pinned, phase) {
    if (!pinned) return;
    if (pinned.skills) {
        for (let i = 0; i < 8; i++) {
            if (pinned.skills[i] !== undefined) ind[i] = pinned.skills[i];
        }
    }
    const gearKeys = ['wR','helmR','chestR','pantsR','bootsR','glovR'];
    if (pinned.gear) {
        if (phase === 'all') {
            // pin same gear to all three phase slots
            [8, 14, 20].forEach(off => {
                gearKeys.forEach((k, j) => {
                    if (pinned.gear[k] !== undefined) ind[off + j] = pinned.gear[k];
                });
            });
        } else {
            gearKeys.forEach((k, j) => {
                if (pinned.gear[k] !== undefined) ind[8 + j] = pinned.gear[k];
            });
        }
    }
    const ammoOff = phase === 'all' ? 26 : 14;
    const foodOff = phase === 'all' ? 27 : 15;
    if (pinned.ammoIdx !== undefined) ind[ammoOff] = pinned.ammoIdx;
    if (pinned.foodIdx !== undefined) ind[foodOff] = pinned.foodIdx;
}

function randomInd(level, pinned, phase) {
    const n   = indSize(phase);
    const ind = new Array(n).fill(0);

    // Skills: start from pinned baseline, fill rest randomly up to budget
    let usedByPinned = 0;
    if (pinned && pinned.skills) {
        for (let i = 0; i < 8; i++) {
            if (pinned.skills[i] !== undefined) { ind[i] = pinned.skills[i]; usedByPinned += ind[i]; }
        }
    }
    const freeSkills = [];
    for (let i = 0; i < 8; i++) {
        if (!pinned || !pinned.skills || pinned.skills[i] === undefined) freeSkills.push(i);
    }
    // shuffle
    for (let i = freeSkills.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [freeSkills[i], freeSkills[j]] = [freeSkills[j], freeSkills[i]];
    }
    let remaining = level * 4 - usedByPinned;
    for (const i of freeSkills) {
        if (remaining <= 0) break;
        ind[i] = Math.floor(Math.random() * (Math.min(10, remaining) + 1));
        remaining -= ind[i];
    }

    // Gear slots
    const gearSlots = phase === 'all' ? 3 : 1;
    for (let s = 0; s < gearSlots; s++) {
        const off = 8 + s * 6;
        for (let j = 0; j < 6; j++) ind[off + j] = Math.floor(Math.random() * 6);
    }
    const ammoOff = phase === 'all' ? 26 : 14;
    const foodOff = phase === 'all' ? 27 : 15;
    ind[ammoOff] = Math.floor(Math.random() * 4);
    ind[foodOff] = Math.floor(Math.random() * 4);

    applyPinned(ind, pinned, phase);
    repairSkills(ind, level, pinned);
    return ind;
}

// ── Core simulation (expected value, no RNG) ─────────────────────────────────
function calcHP(skills, foodIdx, hours, isRecovery, roundDuration) {
    const baseHP = 100 + skills[6] * 10;
    const hunger = 4 + skills[7];
    const foodPct = FOOD_BONUS[foodIdx];
    if (isRecovery) {
        const h   = Math.floor(baseHP * 0.1 * hours);
        const hng = Math.floor(hunger * 0.1 * hours);
        return h + Math.floor(baseHP * foodPct / 100) * hng;
    }
    return baseHP + Math.floor(baseHP * foodPct / 100) * hunger;
}

// gear = [wR, helmR, chestR, pantsR, bootsR, glovR]
function evalPhaseGear(skills, gear, ammoIdx, cfg, usePill, hp, initWDur, initADur) {
    const [wR, helmR, chestR, pantsR, bootsR, glovR] = gear;

    // ─ Offense ─
    let atk = 100 + skills[0] * 25 + WEAPON_PRIMARY[wR];
    if (cfg.battleBonusPct > 0) atk *= (1 + cfg.battleBonusPct / 100);
    if (usePill) atk *= 1.6;
    if (ammoIdx > 0) atk *= (1 + AMMO_BONUS[ammoIdx] / 100);
    if (cfg.militaryRankBonus > 0) atk *= (1 + cfg.militaryRankBonus / 100);

    let hitChance = 50 + skills[1] * 5 + GLOVES_STAT[glovR];
    if (hitChance > 100) { atk += (hitChance - 100) * 4; hitChance = 100; }

    let critChance = 10 + skills[2] * 5 + WEAPON_SECONDARY[wR];
    let critOverflow = 0;
    if (critChance > 100) { critOverflow = (critChance - 100) * 4; critChance = 100; }
    const critDmgPct = 100 + skills[3] * 20 + HELMET_STAT[helmR] + critOverflow;

    const hc = hitChance / 100;
    const cc = critChance / 100;
    const eDmg = hc * (cc * atk * (1 + critDmgPct / 100) + (1 - cc) * atk) + (1 - hc) * atk / 2;

    // ─ Defense ─
    const dodgeTotal  = skills[5] * 4 + BOOTS_STAT[bootsR];
    const dodgeFrac   = dodgeTotal / (dodgeTotal + 40);
    const armorTotal  = skills[4] * 6 + CHEST_STAT[chestR] + PANTS_STAT[pantsR];
    const dmgPerRound = (1 - dodgeFrac) * 10 * (1 - armorTotal / (armorTotal + 40));
    const nHits       = dmgPerRound > 0 ? hp / dmgPerRound : 500;

    // ─ Durability consumed ─
    const aDurUsed = nHits * (1 - dodgeFrac);

    // Total durability needed vs free carry-over from previous phase
    // initWDur/initADur = free durability remaining from previous phase (0 = fresh, must pay all)
    const wDurToPay = Math.max(0, nHits - initWDur);       // weapon dur that needs payment
    const aDurToPay = Math.max(0, aDurUsed - initADur);    // armor dur that needs payment

    // Gross cost (matches simulation display)
    const wCost  = (wDurToPay / 100) * RARITY_COSTS[wR];
    const helmC  = (aDurToPay / 100) * RARITY_COSTS[helmR];
    const chestC = (aDurToPay / 100) * RARITY_COSTS[chestR];
    const pantsC = (aDurToPay / 100) * RARITY_COSTS[pantsR];
    const bootsC = (aDurToPay / 100) * RARITY_COSTS[bootsR];
    const glovC  = (aDurToPay / 100) * RARITY_COSTS[glovR];

    // Scrap gains (subtracted for net cost used in optimization)
    const cps = cfg.coinPerScrap || 0;
    const scrapGain = cps > 0 ? (
        (wDurToPay / 100) * SCRAP_PER_RARITY[wR] * cps +
        (aDurToPay / 100) * (SCRAP_PER_RARITY[helmR] + SCRAP_PER_RARITY[chestR] + SCRAP_PER_RARITY[pantsR] + SCRAP_PER_RARITY[bootsR] + SCRAP_PER_RARITY[glovR]) * cps
    ) : 0;
    const ammoC  = nHits * AMMO_COST_HIT[ammoIdx];
    const pillC  = usePill ? (cfg.buffCosts ? cfg.buffCosts.pill : 35) : 0;

    const wDurRemaining = nHits <= initWDur ? (initWDur - nHits) : (100 - ((nHits - initWDur) % 100)) % 100;
    const aDurRemaining = aDurUsed <= initADur ? (initADur - aDurUsed) : (100 - ((aDurUsed - initADur) % 100)) % 100;

    // Equipment cost = weapons + armor + food only (what you actually buy)
    const gearCost = wCost + helmC + chestC + pantsC + bootsC + glovC;
    // Full cost including consumables (ammo, pill)
    const grossCost = gearCost + ammoC + pillC;
    const damage = eDmg * nHits;

    // Guard against NaN (can crash NSGA-II)
    if (isNaN(damage) || isNaN(grossCost)) {
        return { damage: 0, cost: 99999, netCost: 99999, nHits: 0, wDurRemaining: 0, aDurRemaining: 0, stats: {} };
    }

    return {
        damage,
        cost:      grossCost,           // full cost (matches simulation "Custo Total")
        gearCost,                       // equipment only (weapons + armor, for budget filtering)
        netCost:   grossCost - scrapGain, // net cost after scrap gains (used for NSGA-II)
        nHits,
        wDurRemaining,
        aDurRemaining,
        stats: {
            atk:            Math.round(atk),
            rawHitChance:   Math.round(50 + skills[1] * 5 + GLOVES_STAT[glovR]),
            hitChance:      Math.round(hitChance),
            precOverflow:   Math.max(0, Math.round(50 + skills[1] * 5 + GLOVES_STAT[glovR]) - 100),
            precOverflowAtk:Math.max(0, Math.round(50 + skills[1] * 5 + GLOVES_STAT[glovR]) - 100) * 4,
            critChance:     Math.round(critChance),
            critDmgPct:     Math.round(critDmgPct),
            armorPct:       Math.round(armorTotal / (armorTotal + 40) * 100),
            dodgePct:       Math.round(dodgeFrac * 100),
            hp:             Math.round(hp),
            dmgPerRound:    +dmgPerRound.toFixed(2),
            eDmgPerHit:     +eDmg.toFixed(1),
            nHits:          +nHits.toFixed(1),
            wDurUsed:       +nHits.toFixed(1),
            aDurUsed:       +aDurUsed.toFixed(1)
        }
    };
}

function evaluate(ind, cfg) {
    const ph     = cfg.phase || 'burst';
    const rd     = cfg.roundDuration || 8;
    const skills = ind.slice(0, 8);
    const ammoOff = ph === 'all' ? 26 : 14;
    const foodOff = ph === 'all' ? 27 : 15;
    const ammoIdx = ind[ammoOff];
    const foodIdx = ind[foodOff];

    let totalDmg = 0, totalCost = 0, totalNetCost = 0, totalGearCost = 0;

    if (ph === 'all') {
        const gearPre   = ind.slice(8,  14);
        const gearBurst = ind.slice(14, 20);
        const gearSust  = ind.slice(20, 26);

        // Each phase uses fresh armor, but weapons carry over if same rarity
        function sameWeapon(a, b) { return a[0] === b[0]; }

        const hpPre = calcHP(skills, foodIdx, cfg.prePillHours || 6, true, rd);
        const rPre  = evalPhaseGear(skills, gearPre, ammoIdx, cfg, false, hpPre, 0, 0);
        totalDmg += rPre.damage; totalCost += rPre.cost; totalNetCost += rPre.netCost; totalGearCost += rPre.gearCost;

        // Weapon carry-over: if same rarity, leftover dur transfers to next phase
        const wCarryToBurst = sameWeapon(gearPre, gearBurst) ? rPre.wDurRemaining : 0;
        const hpBurst = calcHP(skills, foodIdx, 0, false, rd);
        const rBurst  = evalPhaseGear(skills, gearBurst, ammoIdx, cfg, true, hpBurst, wCarryToBurst, 0);
        totalDmg += rBurst.damage; totalCost += rBurst.cost; totalNetCost += rBurst.netCost; totalGearCost += rBurst.gearCost;

        const wCarryToSust = sameWeapon(gearBurst, gearSust) ? rBurst.wDurRemaining : 0;
        const hpSust = calcHP(skills, foodIdx, rd, true, rd);
        const rSust  = evalPhaseGear(skills, gearSust, ammoIdx, cfg, true, hpSust, wCarryToSust, 0);
        totalDmg += rSust.damage; totalCost += rSust.cost; totalNetCost += rSust.netCost; totalGearCost += rSust.gearCost;
    } else {
        const gear = ind.slice(8, 14);

        if (ph === 'prePill') {
            const hp = calcHP(skills, foodIdx, cfg.prePillHours || 6, true, rd);
            const r  = evalPhaseGear(skills, gear, ammoIdx, cfg, false, hp, 0, 0);
            totalDmg += r.damage; totalCost += r.cost; totalNetCost += r.netCost; totalGearCost += r.gearCost;
        } else if (ph === 'burst') {
            const hp = calcHP(skills, foodIdx, 0, false, rd);
            const r  = evalPhaseGear(skills, gear, ammoIdx, cfg, true, hp, 0, 0);
            totalDmg += r.damage; totalCost += r.cost; totalNetCost += r.netCost; totalGearCost += r.gearCost;
        } else if (ph === 'sustained') {
            const hp = calcHP(skills, foodIdx, rd, true, rd);
            const r  = evalPhaseGear(skills, gear, ammoIdx, cfg, true, hp, 0, 0);
            totalDmg += r.damage; totalCost += r.cost; totalNetCost += r.netCost; totalGearCost += r.gearCost;
        }
    }

    // Food consumed once per battle day — counts as gear cost (you buy it)
    const foodC = FOOD_COST[foodIdx];
    totalCost += foodC;
    totalNetCost += foodC;
    totalGearCost += foodC;
    return { damage: totalDmg, cost: totalCost, netCost: totalNetCost, gearCost: totalGearCost };
}

// ── NSGA-II ──────────────────────────────────────────────────────────────────
function dominates(a, b) {
    return a.damage >= b.damage && a.netCost <= b.netCost &&
           (a.damage > b.damage || a.netCost < b.netCost);
}

function nonDominatedSort(pop) {
    const n    = pop.length;
    const S    = Array.from({length: n}, () => []);
    const nDom = new Int32Array(n);
    const fronts = [[]];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            if (dominates(pop[i], pop[j]))      S[i].push(j);
            else if (dominates(pop[j], pop[i])) nDom[i]++;
        }
        if (nDom[i] === 0) fronts[0].push(i);
    }
    let fi = 0;
    while (fronts[fi].length > 0) {
        const next = [];
        for (const i of fronts[fi]) for (const j of S[i]) { if (--nDom[j] === 0) next.push(j); }
        fronts.push(next);
        fi++;
    }
    fronts.pop();
    return fronts;
}

function crowdingDistance(front, pop) {
    const m = front.length;
    for (const i of front) pop[i].crowding = 0;
    if (m <= 2) { for (const i of front) pop[i].crowding = Infinity; return; }
    for (let obj = 0; obj < 2; obj++) {
        const key = obj === 0 ? 'damage' : 'netCost';
        const sorted = [...front].sort((a, b) => pop[a][key] - pop[b][key]);
        pop[sorted[0]].crowding = Infinity;
        pop[sorted[m - 1]].crowding = Infinity;
        const range = pop[sorted[m - 1]][key] - pop[sorted[0]][key];
        if (range === 0) continue;
        for (let k = 1; k < m - 1; k++) {
            pop[sorted[k]].crowding += (pop[sorted[k + 1]][key] - pop[sorted[k - 1]][key]) / range;
        }
    }
}

function tournamentSelect(pop) {
    const a = pop[Math.floor(Math.random() * pop.length)];
    const b = pop[Math.floor(Math.random() * pop.length)];
    if (a.rank !== b.rank) return a.rank < b.rank ? a : b;
    return a.crowding >= b.crowding ? a : b;
}

function crossover(p1, p2, level, pinned, phase) {
    const child = p1.ind.map((v, i) => Math.random() < 0.5 ? v : p2.ind[i]);
    repairSkills(child, level, pinned);
    applyPinned(child, pinned, phase);
    return child;
}

function mutate(ind, level, pinned, phase) {
    const child = [...ind];
    const n = child.length;
    const i = Math.floor(Math.random() * n);
    if (i < 8) {
        child[i] = Math.floor(Math.random() * 11);
    } else if (i < n - 2) {
        child[i] = Math.floor(Math.random() * 6); // gear
    } else {
        child[i] = Math.floor(Math.random() * 4); // ammo/food
    }
    repairSkills(child, level, pinned);
    applyPinned(child, pinned, phase);
    return child;
}

function nsga2(cfg) {
    const { popSize = 200, nGen = 150, level = 10, pinned = null } = cfg;
    const phase = cfg.phase || 'burst';

    let pop = [];
    for (let i = 0; i < popSize; i++) {
        const ind = randomInd(level, pinned, phase);
        const ev = evaluate(ind, cfg);
        pop.push({ ind, damage: ev.damage, cost: ev.cost, netCost: ev.netCost, gearCost: ev.gearCost, rank: 0, crowding: 0 });
    }

    for (let gen = 0; gen < nGen; gen++) {
        const fronts = nonDominatedSort(pop);
        fronts.forEach((front, r) => {
            front.forEach(i => { pop[i].rank = r; });
            crowdingDistance(front, pop);
        });

        const offspring = [];
        while (offspring.length < popSize) {
            const p1 = tournamentSelect(pop);
            const p2 = tournamentSelect(pop);
            let childInd = Math.random() < 0.9
                ? crossover(p1, p2, level, pinned, phase)
                : [...p1.ind];
            if (Math.random() < 0.35) childInd = mutate(childInd, level, pinned, phase);
            const ev = evaluate(childInd, cfg);
            offspring.push({ ind: childInd, damage: ev.damage, cost: ev.cost, netCost: ev.netCost, gearCost: ev.gearCost, rank: 0, crowding: 0 });
        }

        const combined = [...pop, ...offspring];
        const allFronts = nonDominatedSort(combined);
        allFronts.forEach((front, r) => {
            front.forEach(i => { combined[i].rank = r; });
            crowdingDistance(front, combined);
        });

        const newPop = [];
        for (const front of allFronts) {
            if (newPop.length + front.length <= popSize) {
                front.forEach(i => newPop.push(combined[i]));
            } else {
                const needed = popSize - newPop.length;
                [...front].sort((a, b) => combined[b].crowding - combined[a].crowding)
                          .slice(0, needed)
                          .forEach(i => newPop.push(combined[i]));
                break;
            }
        }
        pop = newPop;

        if (gen % 5 === 0) postMessage({ type: 'progress', pct: Math.round((gen / nGen) * 100) });
    }

    postMessage({ type: 'progress', pct: 100 });

    const pareto = pop.filter(p => p.rank === 0);
    pareto.sort((a, b) => b.damage - a.damage);
    return pareto.map(p => buildResult(p, phase, cfg));
}

function gearInfo(gear) {
    const [wR, helmR, chestR, pantsR, bootsR, glovR] = gear;
    return {
        weapon:  { primary: WEAPON_PRIMARY[wR],  secondary: WEAPON_SECONDARY[wR], rarity: RARITY_NAMES[wR],  cost: RARITY_COSTS[wR],  idx: wR  },
        helmet:  { stat: HELMET_STAT[helmR],  rarity: RARITY_NAMES[helmR],  cost: RARITY_COSTS[helmR],  idx: helmR  },
        chest:   { stat: CHEST_STAT[chestR],  rarity: RARITY_NAMES[chestR], cost: RARITY_COSTS[chestR], idx: chestR },
        pants:   { stat: PANTS_STAT[pantsR],  rarity: RARITY_NAMES[pantsR], cost: RARITY_COSTS[pantsR], idx: pantsR },
        boots:   { stat: BOOTS_STAT[bootsR],  rarity: RARITY_NAMES[bootsR], cost: RARITY_COSTS[bootsR], idx: bootsR },
        gloves:  { stat: GLOVES_STAT[glovR],  rarity: RARITY_NAMES[glovR],  cost: RARITY_COSTS[glovR],  idx: glovR  }
    };
}

function buildResult(p, phase, cfg) {
    const ammoOff = phase === 'all' ? 26 : 14;
    const foodOff = phase === 'all' ? 27 : 15;
    const skills  = p.ind.slice(0, 8);
    const ammoIdx = p.ind[ammoOff];
    const foodIdx = p.ind[foodOff];
    const rd      = cfg.roundDuration || 8;

    const base = {
        ind:      p.ind,
        damage:   p.damage,
        cost:     p.cost,
        gearCost: p.gearCost,
        skills: {
            attack: p.ind[0], precision: p.ind[1], critChance: p.ind[2], critDamage: p.ind[3],
            armor:  p.ind[4], dodge:     p.ind[5], health:     p.ind[6], hunger:     p.ind[7]
        },
        ammo:     AMMO_NAMES[ammoIdx],
        food:     FOOD_NAMES[foodIdx],
        ammoIdx,
        foodIdx,
        multiPhase: phase === 'all'
    };

    if (phase === 'all') {
        const hpPre   = calcHP(skills, foodIdx, cfg.prePillHours || 6, true, rd);
        const hpBurst = calcHP(skills, foodIdx, 0, false, rd);
        const hpSust  = calcHP(skills, foodIdx, rd, true, rd);
        const gPre   = p.ind.slice(8, 14), gBurst = p.ind.slice(14, 20), gSust = p.ind.slice(20, 26);
        function sameW(a, b) { return a[0] === b[0]; }
        const rPre   = evalPhaseGear(skills, gPre,   ammoIdx, cfg, false, hpPre, 0, 0);
        const rBurst = evalPhaseGear(skills, gBurst, ammoIdx, cfg, true,  hpBurst,
            sameW(gPre, gBurst) ? rPre.wDurRemaining : 0, 0);
        const rSust  = evalPhaseGear(skills, gSust,  ammoIdx, cfg, true,  hpSust,
            sameW(gBurst, gSust) ? rBurst.wDurRemaining : 0, 0);
        base.gearPrePill   = gearInfo(p.ind.slice(8,  14));
        base.gearBurst     = gearInfo(p.ind.slice(14, 20));
        base.gearSustained = gearInfo(p.ind.slice(20, 26));
        base.phaseStats = {
            prePill:   { ...rPre.stats,   damage: Math.round(rPre.damage),   cost: +rPre.cost.toFixed(1) },
            burst:     { ...rBurst.stats, damage: Math.round(rBurst.damage), cost: +rBurst.cost.toFixed(1) },
            sustained: { ...rSust.stats,  damage: Math.round(rSust.damage),  cost: +rSust.cost.toFixed(1) }
        };
    } else {
        const gear = p.ind.slice(8, 14);
        let hp, usePill;
        if (phase === 'prePill')   { hp = calcHP(skills, foodIdx, cfg.prePillHours || 6, true, rd); usePill = false; }
        else if (phase === 'burst'){ hp = calcHP(skills, foodIdx, 0, false, rd); usePill = true; }
        else                       { hp = calcHP(skills, foodIdx, rd, true, rd); usePill = true; }
        const r = evalPhaseGear(skills, gear, ammoIdx, cfg, usePill, hp, 0, 0);
        base.gear      = gearInfo(gear);
        base.phaseStats = { [phase]: { ...r.stats, damage: Math.round(r.damage), cost: +r.cost.toFixed(1) } };
    }
    return base;
}

// ── Message handler ──────────────────────────────────────────────────────────
if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
    self.onmessage = function (e) {
        if (e.data.type === 'start') {
            try {
                const pareto = nsga2(e.data.config);
                postMessage({ type: 'result', pareto });
            } catch (err) {
                postMessage({ type: 'error', message: err.message });
            }
        }
    };
}

// ── Node.js exports for testing ─────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        evalPhaseGear, evaluate, calcHP, buildResult, gearInfo,
        WEAPON_PRIMARY, WEAPON_SECONDARY,
        HELMET_STAT, CHEST_STAT, PANTS_STAT, BOOTS_STAT, GLOVES_STAT,
        RARITY_COSTS, SCRAP_PER_RARITY, RARITY_NAMES,
        AMMO_BONUS, AMMO_COST_HIT, FOOD_BONUS, FOOD_COST, FOOD_NAMES, AMMO_NAMES
    };
}
