const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Mock Web Worker globals
global.self = global;
global.postMessage = () => {};

const {
    evalPhaseGear, evaluate, calcHP,
    RARITY_COSTS, SCRAP_PER_RARITY,
    WEAPON_PRIMARY, WEAPON_SECONDARY,
    HELMET_STAT, CHEST_STAT, PANTS_STAT, BOOTS_STAT, GLOVES_STAT,
    AMMO_COST_HIT, FOOD_COST
} = require('./optimizer.js');

const baseCfg = {
    battleBonusPct: 0,
    militaryRankBonus: 0,
    prePillHours: 6,
    roundDuration: 8,
    coinPerScrap: 0,
    buffCosts: { pill: 35 },
    level: 10,
    phase: 'burst'
};

// ── Helper ──────────────────────────────────────────────────────────────────
function near(a, b, eps = 0.5) {
    assert.ok(Math.abs(a - b) < eps, `Expected ~${b}, got ${a} (diff ${Math.abs(a - b)})`);
}

// ── 1. Single phase cost with known inputs ──────────────────────────────────
describe('evalPhaseGear - single phase cost', () => {
    it('gray gear, no buffs, HP=100', () => {
        const skills = [0,0,0,0,0,0,0,0];
        const gear   = [0,0,0,0,0,0]; // all gray
        const r = evalPhaseGear(skills, gear, 0, baseCfg, false, 100, 0, 0);

        // atk = 100 + 0 + 30 = 130
        assert.ok(r.damage > 0, 'damage should be positive');
        assert.ok(r.nHits > 0, 'nHits should be positive');
        assert.ok(r.cost > 0, 'cost should be positive');
        assert.ok(r.gearCost > 0, 'gearCost should be positive');

        // wDurToPay = nHits (no carry-over)
        const expectedWCost = (r.nHits / 100) * RARITY_COSTS[0];
        near(r.cost - r.nHits * AMMO_COST_HIT[0], r.gearCost, 0.01);
    });

    it('red gear costs more than gray', () => {
        const skills = [0,0,0,0,0,0,0,0];
        const gray = evalPhaseGear(skills, [0,0,0,0,0,0], 0, baseCfg, false, 100, 0, 0);
        const red  = evalPhaseGear(skills, [5,5,5,5,5,5], 0, baseCfg, false, 100, 0, 0);

        assert.ok(red.cost > gray.cost, 'red gear should cost more than gray');
        assert.ok(red.damage > gray.damage, 'red gear should do more damage');
    });
});

// ── 2. Carry-over reduces cost ──────────────────────────────────────────────
describe('evalPhaseGear - carry-over', () => {
    it('initWDur=50 reduces weapon cost', () => {
        const skills = [5,5,5,5,5,5,5,5];
        const gear   = [3,3,3,3,3,3]; // purple

        const fresh    = evalPhaseGear(skills, gear, 0, baseCfg, true, 200, 0, 0);
        const carryW50 = evalPhaseGear(skills, gear, 0, baseCfg, true, 200, 50, 0);

        assert.ok(carryW50.cost < fresh.cost, `carry-over should reduce cost: ${carryW50.cost} < ${fresh.cost}`);
        // Savings should be about 50/100 * RARITY_COSTS[3] = 0.5 * 57 = 28.5
        const expectedSaving = (50 / 100) * RARITY_COSTS[3];
        near(fresh.cost - carryW50.cost, expectedSaving, 1);
    });

    it('initADur=50 reduces armor cost', () => {
        const skills = [5,5,5,5,5,5,5,5];
        const gear   = [3,3,3,3,3,3];

        const fresh    = evalPhaseGear(skills, gear, 0, baseCfg, true, 200, 0, 0);
        const carryA50 = evalPhaseGear(skills, gear, 0, baseCfg, true, 200, 0, 50);

        assert.ok(carryA50.cost < fresh.cost, 'armor carry-over should reduce cost');
    });

    it('wDurRemaining is correct', () => {
        const skills = [0,0,0,0,0,0,0,0];
        const gear   = [0,0,0,0,0,0];
        const r = evalPhaseGear(skills, gear, 0, baseCfg, false, 100, 0, 0);

        // With nHits ~12, remaining should be 100 - (12 % 100) ≈ 88
        assert.ok(r.wDurRemaining >= 0 && r.wDurRemaining <= 100,
            `wDurRemaining should be 0-100, got ${r.wDurRemaining}`);
    });

    it('high carry-over can make cost zero', () => {
        const skills = [0,0,0,0,0,0,0,0];
        const gear   = [0,0,0,0,0,0];
        // nHits will be ~12, so 100 carry-over covers everything
        const r = evalPhaseGear(skills, gear, 0, baseCfg, false, 100, 100, 100);

        near(r.gearCost, 0, 0.01);
    });
});

// ── 3. Multi-phase: weapon carry-over when same rarity ──────────────────────
describe('evaluate - multi-phase weapon carry-over', () => {
    it('same weapon rarity across phases → carry-over reduces cost', () => {
        // All phases use purple weapon
        const ind = [
            5,5,5,5,5,5,5,5,
            3,3,3,3,3,3,       // prePill: purple
            3,3,3,3,3,3,       // burst: purple (same weapon → carry-over)
            3,3,3,3,3,3,       // sustained: purple (same weapon → carry-over)
            0, 0
        ];

        const cfgAll = { ...baseCfg, phase: 'all' };
        const rAll = evaluate(ind, cfgAll);

        // Compare with NO carry-over (3 fully independent phases)
        const skills = [5,5,5,5,5,5,5,5];
        const gear   = [3,3,3,3,3,3];
        const hpPre   = calcHP(skills, 0, 6, true, 8);
        const hpBurst = calcHP(skills, 0, 0, false, 8);
        const hpSust  = calcHP(skills, 0, 8, true, 8);
        const rPre = evalPhaseGear(skills, gear, 0, cfgAll, false, hpPre,  0, 0);
        const rBur = evalPhaseGear(skills, gear, 0, cfgAll, true,  hpBurst, 0, 0);
        const rSus = evalPhaseGear(skills, gear, 0, cfgAll, true,  hpSust,  0, 0);
        const noCarryTotal = rPre.cost + rBur.cost + rSus.cost + FOOD_COST[0];

        assert.ok(rAll.cost < noCarryTotal,
            `carry-over cost ${rAll.cost.toFixed(2)} should be < independent ${noCarryTotal.toFixed(2)}`);
    });

    it('different weapon rarity → no weapon carry-over', () => {
        const ind = [
            5,5,5,5,5,5,5,5,
            1,3,3,3,3,3,       // prePill: green weapon
            3,3,3,3,3,3,       // burst: purple weapon (different!)
            5,3,3,3,3,3,       // sustained: red weapon (different!)
            0, 0
        ];

        const cfgAll = { ...baseCfg, phase: 'all' };
        const r = evaluate(ind, cfgAll);

        // Cost should equal sum of independent phases (no carry-over)
        const skills = [5,5,5,5,5,5,5,5];
        const rPre = evalPhaseGear(skills, [1,3,3,3,3,3], 0, cfgAll, false, calcHP(skills,0,6,true,8), 0, 0);
        const rBur = evalPhaseGear(skills, [3,3,3,3,3,3], 0, cfgAll, true,  calcHP(skills,0,0,false,8), 0, 0);
        const rSus = evalPhaseGear(skills, [5,3,3,3,3,3], 0, cfgAll, true,  calcHP(skills,0,8,true,8), 0, 0);
        const manualTotal = rPre.cost + rBur.cost + rSus.cost + FOOD_COST[0];

        near(r.cost, manualTotal, 0.01);
    });

    it('different gear per phase produces valid results', () => {
        const ind = [
            5,5,5,5,5,5,5,5,
            1,1,1,1,1,1,       // prePill: green
            3,3,3,3,3,3,       // burst: purple
            5,5,5,5,5,5,       // sustained: red
            2, 2
        ];

        const cfgAll = { ...baseCfg, phase: 'all' };
        const r = evaluate(ind, cfgAll);
        assert.ok(r.cost > 0);
        assert.ok(r.damage > 0);
        assert.ok(r.gearCost > 0);
        assert.ok(r.gearCost <= r.cost);
    });
});

// ── 5. Durability remaining edge cases ──────────────────────────────────────
describe('durability remaining', () => {
    it('nHits < initWDur → positive remaining', () => {
        const skills = [0,0,0,0,0,0,0,0];
        const gear   = [0,0,0,0,0,0];
        // ~12 hits with HP=100, carry-over 50
        const r = evalPhaseGear(skills, gear, 0, baseCfg, false, 100, 50, 50);
        assert.ok(r.wDurRemaining > 0, `should have weapon dur remaining: ${r.wDurRemaining}`);
        assert.ok(r.aDurRemaining > 0, `should have armor dur remaining: ${r.aDurRemaining}`);
    });

    it('remaining is between 0 and 100', () => {
        const skills = [10,10,10,10,0,0,10,10];
        const gear   = [5,5,5,5,5,5]; // red, lots of hits
        const r = evalPhaseGear(skills, gear, 3, baseCfg, true, 500, 0, 0);
        assert.ok(r.wDurRemaining >= 0 && r.wDurRemaining <= 100,
            `wDurRemaining=${r.wDurRemaining}`);
        assert.ok(r.aDurRemaining >= 0 && r.aDurRemaining <= 100,
            `aDurRemaining=${r.aDurRemaining}`);
    });
});

// ── 6. gearCost excludes ammo and pill ──────────────────────────────────────
describe('gearCost vs cost', () => {
    it('gearCost excludes ammo cost', () => {
        const skills = [5,5,5,5,5,5,5,5];
        const gear   = [3,3,3,3,3,3];

        const noAmmo   = evalPhaseGear(skills, gear, 0, baseCfg, false, 200, 0, 0);
        const withAmmo = evalPhaseGear(skills, gear, 3, baseCfg, false, 200, 0, 0); // heavy ammo

        assert.ok(withAmmo.cost > noAmmo.cost, 'ammo should increase total cost');
        // gearCost should be the same (ammo not included in gearCost)
        near(withAmmo.gearCost, noAmmo.gearCost, 1);
    });

    it('gearCost excludes pill cost', () => {
        const skills = [5,5,5,5,5,5,5,5];
        const gear   = [3,3,3,3,3,3];

        const noPill   = evalPhaseGear(skills, gear, 0, baseCfg, false, 200, 0, 0);
        const withPill = evalPhaseGear(skills, gear, 0, baseCfg, true,  200, 0, 0);

        assert.ok(withPill.cost > noPill.cost, 'pill should increase total cost');
        near(withPill.gearCost, noPill.gearCost, 1);
    });

    it('evaluate gearCost < cost when ammo+pill are used', () => {
        const ind = [5,5,5,5,5,5,5,5, 3,3,3,3,3,3, 3, 2]; // 16 vars, heavy ammo, steak
        const cfg = { ...baseCfg, phase: 'burst' };
        const r = evaluate(ind, cfg);

        assert.ok(r.gearCost <= r.cost, `gearCost ${r.gearCost} should be <= cost ${r.cost}`);
    });
});

// ── 7. Each phase independent — no cross-phase dependency ───────────────────
describe('phases are independent', () => {
    it('changing one phase gear does not affect other phases', () => {
        const indA = [
            5,5,5,5,5,5,5,5,
            3,3,3,3,3,3,     // prePill: purple
            3,3,3,3,3,3,     // burst: purple
            3,3,3,3,3,3,     // sustained: purple
            0, 0
        ];
        const indB = [
            5,5,5,5,5,5,5,5,
            1,1,1,1,1,1,     // prePill: green (different)
            3,3,3,3,3,3,     // burst: purple (same)
            3,3,3,3,3,3,     // sustained: purple (same)
            0, 0
        ];

        const cfgAll = { ...baseCfg, phase: 'all' };
        const rA = evaluate(indA, cfgAll);
        const rB = evaluate(indB, cfgAll);

        // Different prePill gear → different total, but both valid
        assert.ok(rA.cost > 0);
        assert.ok(rB.cost > 0);
        assert.ok(rA.cost !== rB.cost, 'different gear should produce different costs');
    });
});

// ── 8. NaN guard ────────────────────────────────────────────────────────────
describe('NaN guard', () => {
    it('does not produce NaN with zero HP', () => {
        const skills = [0,0,0,0,0,0,0,0];
        const gear   = [0,0,0,0,0,0];
        const r = evalPhaseGear(skills, gear, 0, baseCfg, false, 0, 0, 0);
        assert.ok(!isNaN(r.damage), 'damage should not be NaN');
        assert.ok(!isNaN(r.cost), 'cost should not be NaN');
    });
});
