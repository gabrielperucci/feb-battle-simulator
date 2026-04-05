const stats = {
    attack:     "Attack",
    precision:  "Precision",
    critChance: "Crit. chance",
    critDamage: "Crit. damages",
    armor:      "Armor",
    dodge:      "Dodge",
    health:     "Health",
    loot:       "Loot",
    hunger:     "Hunger",
    companies:  "Companies",
    management: "Management",
    entrepreneurship: "Entrepreneurship",
    energy:     "Energy",
    production: "Production"
};

const calculateStats = {
    attack:     (lvl) => 100 + (lvl * 25),
    precision:  (lvl) => 50 + (lvl * 5),
    critChance: (lvl) => 10 + (lvl * 5),
    critDamage: (lvl) => 100 + (lvl * 20),
    armor:      (lvl) => 0 + (lvl * 6),
    dodge:      (lvl) => 0 + (lvl * 4),
    health:     (lvl) => 100 + (lvl * 10),
    loot:       (lvl) => 5 + (lvl * 2),
    hunger:     (lvl) => 4 + lvl,
    companies:  (lvl) => 2 + lvl,
    management: (lvl) => 4 + (2 * lvl),
    entrepreneurship: (lvl) => 30 + (lvl * 5),
    energy:     (lvl) => 30 + (lvl * 10),
    production: (lvl) => 10 + (lvl * 3)
};

const buffs = {
    pill: 60,
    ammo: {
        light: 10,
        ammo:  20,
        heavy: 40,
    },
    food: {
        bread: 10,
        steak: 15,
        fish:  20
    }
};

const bonuses = {
    // Default
    countryOrder: 15,
    muOrder: 15,
    muHeadquarters: 20,
    
    // Type-specific
    ally: 10,
    swornEnemy: 10,
    patriotic: 10,
    
    // Ethics fanatic
    fanaticMilitarist: 15,
    fanaticIsolationist: 15,
    fanaticPacifist: 15,
    fanaticDiplomatic: 15,
    
    // Ethics basic
    militarist: 5,
    isolationist: 5,
    pacifist: 5,
    diplomatic: 5
}

const MAX_SKILL_LEVEL = 10;
const MIN_SKILL_LEVEL = 0;

const rarityCostsDefaults = {
    gray: 1.5,
    green: 5,
    blue: 20,
    purple: 57,
    yellow: 160,
    red: 440
};

const scrapPerRarity = {
    gray: 2,
    green: 6,
    blue: 18,
    purple: 54,
    yellow: 162,
    red: 486
};

let state = {
    featureFlags: {
        skillsResetted: false
    },
    level: 10,
    militaryRankBonus: 10,
    usedSkillPoints: 0,
    totalSkillPoints: 40,
    skills: {
        attack: 0,
        precision: 0,
        critChance: 0,
        critDamage: 0,
        armor: 0,
        dodge: 0,
        health: 0,
        loot: 0,
        hunger: 0,
        companies: 0,
        management: 0,
        entrepreneurship: 0,
        energy: 0,
        production: 0
    },
    buffs: {
        pill: true,
        ammo: "ammo",
        food: "steak"
    },
    armors: {
        helmet: 30,
        chest: 15,
        pants: 15,
        boots: 15,
        gloves: 15
    },
    weapon: {
        primary: 90,
        secondary: 15
    },
    equipmentCosts: {
        weapon: 30,
        helmet: 30,
        chest: 30,
        pants: 30,
        boots: 30,
        gloves: 30
    },
    buffCosts: {
        pill: 22.00,
        lightAmmo: 0.12,
        ammo: 0.46,
        heavyAmmo: 1.94,
        bread: 0.90,
        steak: 2.00,
        fish: 4.50
    },
    weaponRarityCosts: { gray: 2, green: 6, blue: 20, purple: 70, yellow: 200, red: 600 },
    armorRarityCosts: { gray: 2, green: 6, blue: 20, purple: 70, yellow: 200, red: 600 },
    battleType: 'attack',
    bonuses: {
        countryOrderToggle: false,
        muOrderToggle: false,
        muHeadquartersToggle: false,
        ally: false,
        swornEnemy: false,
        patriotic: false,
        resistance: 0,
        base: 0,
        bunker: 0,
        fanaticMilitarist: false,
        fanaticIsolationist: false,
        fanaticPacifist: false,
        fanaticDiplomatic: false,
        militarist: false,
        isolationist: false,
        pacifist: false,
        diplomatic: false,
        direct: 0
    },
    battle: {
        rounds: 3,
        roundDuration: 8,
        type: "single",
        multiBattleCount: 10000,
        showCombatLog: false,
        weaponDurabilityLimit: false,
        armorDurabilityLimit: false,
        bountyEnabled: false,
        bountyPerKDamage: 0.5,
        prePillPhaseEnabled: false,
        prePillPhaseHours: 6
    },
    scrapBalance: 0,
    multiStage: {
        enabled: false,
        loadouts: [
            {
                name: "Loadout A",
                weapon: { primary: 40, secondary: 5 },
                armors: { helmet: 5, chest: 5, pants: 5, boots: 5, gloves: 5 },
                ammo: null,
                pill: false,
                equipmentCosts: { weapon: 2, helmet: 2, chest: 2, pants: 2, boots: 2, gloves: 2 }
            }
        ],
        stages: [
            { loadoutIndex: 0, phase: "prePill" }
        ]
    }
};

function toggleBuff(type) {
    const element = document.getElementById('buffPill');
    const statsBox = document.getElementById('buffPillStatsBox');
    if (state.buffs.pill) {
        state.buffs.pill = false;
        element.classList.remove('active');
        element.classList.remove('buff-rarity-purple');
        statsBox.classList.remove('buff-stats-rarity-purple');
    } else {
        state.buffs.pill = true;
        element.classList.add('active');
        element.classList.add('buff-rarity-purple');
        statsBox.classList.add('buff-stats-rarity-purple');
    }
    updateCurrentStatsDisplay();
}

function toggleAmmo(type) {
    document.getElementById('buffLight').classList.remove('active', 'buff-rarity-green');
    document.getElementById('buffLightStatsBox').classList.remove('buff-stats-rarity-green');
    document.getElementById('buffAmmo').classList.remove('active', 'buff-rarity-blue');
    document.getElementById('buffAmmoStatsBox').classList.remove('buff-stats-rarity-blue');
    document.getElementById('buffHeavy').classList.remove('active', 'buff-rarity-purple');
    document.getElementById('buffHeavyStatsBox').classList.remove('buff-stats-rarity-purple');

    if (state.buffs.ammo === type) {
        state.buffs.ammo = null;
    } else {
        state.buffs.ammo = type;
        const element = document.getElementById(`buff${type.charAt(0).toUpperCase() + type.slice(1)}`);
        const statsBox = document.getElementById(`buff${type.charAt(0).toUpperCase() + type.slice(1)}StatsBox`);
        element.classList.add('active');
        
        if (type === 'light') {
            element.classList.add('buff-rarity-green');
            statsBox.classList.add('buff-stats-rarity-green');
        } else if (type === 'ammo') {
            element.classList.add('buff-rarity-blue');
            statsBox.classList.add('buff-stats-rarity-blue');
        } else if (type === 'heavy') {
            element.classList.add('buff-rarity-purple');
            statsBox.classList.add('buff-stats-rarity-purple');
        }
    }
    updateCurrentStatsDisplay();
}

function toggleFood(type) {
    document.getElementById('buffBread').classList.remove('active', 'buff-rarity-green');
    document.getElementById('buffBreadStatsBox').classList.remove('buff-stats-rarity-green');
    document.getElementById('buffSteak').classList.remove('active', 'buff-rarity-blue');
    document.getElementById('buffSteakStatsBox').classList.remove('buff-stats-rarity-blue');
    document.getElementById('buffFish').classList.remove('active', 'buff-rarity-purple');
    document.getElementById('buffFishStatsBox').classList.remove('buff-stats-rarity-purple');

    if (state.buffs.food === type) {
        state.buffs.food = null;
    } else {
        state.buffs.food = type;
        const element = document.getElementById(`buff${type.charAt(0).toUpperCase() + type.slice(1)}`);
        const statsBox = document.getElementById(`buff${type.charAt(0).toUpperCase() + type.slice(1)}StatsBox`);
        element.classList.add('active');
        
        if (type === 'bread') {
            element.classList.add('buff-rarity-green');
            statsBox.classList.add('buff-stats-rarity-green');
        } else if (type === 'steak') {
            element.classList.add('buff-rarity-blue');
            statsBox.classList.add('buff-stats-rarity-blue');
        } else if (type === 'fish') {
            element.classList.add('buff-rarity-purple');
            statsBox.classList.add('buff-stats-rarity-purple');
        }
    }
    updateCurrentStatsDisplay();
}

function selectBattleType(type) {
    state.battleType = type;
    document.querySelectorAll('.battle-type-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(type + 'Tab').classList.add('active');
    updateBonusAvailability();
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function toggleDefaultBonus(bonusKey) {
    const toggleKey = bonusKey + 'Toggle';
    const element = document.getElementById(toggleKey);
    state.bonuses[toggleKey] = !state.bonuses[toggleKey];
    if (state.bonuses[toggleKey]) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function hasMilitaristEthics() {
    return state.bonuses.fanaticMilitarist || state.bonuses.militarist;
}

function toggleTypeBonus(bonusKey) {
    const element = document.getElementById(bonusKey + 'Toggle');
    
    if (element.classList.contains('disabled')) {
        return;
    }
    
    state.bonuses[bonusKey] = !state.bonuses[bonusKey];
    
    if (state.bonuses[bonusKey]) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
    
    // Mutual exclusivity: Ally <-> Patriotic, Ally <-> Resistance 30%, Ally <-> Fanatic Isolationist, Patriotic <-> Resistance 15%
    if (bonusKey === 'ally' && state.bonuses[bonusKey]) {
        if (state.bonuses.patriotic) {
            state.bonuses.patriotic = false;
            document.getElementById('patrioticToggle').classList.remove('active');
        }
        // Fanatic Isolationist is mutually exclusive with Ally
        if (state.bonuses.fanaticIsolationist) {
            state.bonuses.fanaticIsolationist = false;
            document.getElementById('fanaticSelect').value = 'none';
        }
        // Resistance 30% is mutually exclusive with Ally
        if (state.bonuses.resistance >= 30) {
            state.bonuses.resistance = 0;
            document.getElementById('resistanceSelect').value = 0;
        }
    } else if (bonusKey === 'swornEnemy' && state.bonuses[bonusKey]) {
        // Fanatic Diplomatic is mutually exclusive with Sworn Enemy
        if (state.bonuses.fanaticDiplomatic) {
            state.bonuses.fanaticDiplomatic = false;
            document.getElementById('fanaticSelect').value = 'none';
        }
    } else if (bonusKey === 'patriotic' && state.bonuses[bonusKey]) {
        if (state.bonuses.ally) {
            state.bonuses.ally = false;
            document.getElementById('allyToggle').classList.remove('active');
        }
        // Diplomatic is mutually exclusive with Patriotic
        if (state.bonuses.fanaticDiplomatic) {
            state.bonuses.fanaticDiplomatic = false;
            document.getElementById('fanaticSelect').value = 'none';
        }
        if (state.bonuses.diplomatic) {
            state.bonuses.diplomatic = false;
            document.getElementById('basicSelect').value = 'none';
        }
        // Resistance 15% is mutually exclusive with Patriotic
        if (state.bonuses.resistance == 15) {
            state.bonuses.resistance = 0;
            document.getElementById('resistanceSelect').value = 0;
        }
    }
    
    updateBonusAvailability();
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function selectBaseBonus(value) {
    if (state.battleType !== 'attack') {
        document.getElementById('baseSelect').value = state.bonuses.base;
        return;
    }
    state.bonuses.base = value;
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function selectBunkerBonus(value) {
    if (state.battleType !== 'defend') {
        document.getElementById('bunkerSelect').value = state.bonuses.bunker;
        return;
    }
    state.bonuses.bunker = value;
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function selectResistance(value) {
    if (state.battleType !== 'revolt') {
        document.getElementById('resistanceSelect').value = state.bonuses.resistance;
        return;
    }
    state.bonuses.resistance = value;
    
    // Resistance 15% requires Ally, mutually exclusive with Patriotic
    if (value == 15) {
        if (!state.bonuses.ally) {
            state.bonuses.ally = true;
            document.getElementById('allyToggle').classList.add('active');
        }
        if (state.bonuses.patriotic) {
            state.bonuses.patriotic = false;
            document.getElementById('patrioticToggle').classList.remove('active');
        }
    }
    // Resistance 30% requires Patriotic, mutually exclusive with Ally
    if (value == 30) {
        if (!state.bonuses.patriotic) {
            state.bonuses.patriotic = true;
            document.getElementById('patrioticToggle').classList.add('active');
        }
        if (state.bonuses.ally) {
            state.bonuses.ally = false;
            document.getElementById('allyToggle').classList.remove('active');
        }
    }
    
    updateBonusAvailability();
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function selectFanaticEthics(value) {
    const fanaticBonuses = ['fanaticMilitarist', 'fanaticIsolationist', 'fanaticPacifist', 'fanaticDiplomatic'];
    fanaticBonuses.forEach(key => { state.bonuses[key] = false; });
    
    if (value !== 'none') {
        state.bonuses[value] = true;
        if (value === 'fanaticDiplomatic') {
            // Auto-enable Ally, auto-disable Sworn Enemy and Patriotic
            if (state.bonuses.swornEnemy) {
                state.bonuses.swornEnemy = false;
                document.getElementById('swornEnemyToggle').classList.remove('active');
            }
            if (state.bonuses.patriotic) {
                state.bonuses.patriotic = false;
                document.getElementById('patrioticToggle').classList.remove('active');
            }
            if (!state.bonuses.ally) {
                toggleTypeBonus('ally');
            }
        } else if (value === 'fanaticIsolationist') {
            // Auto-enable Sworn Enemy, auto-disable Ally (mutually exclusive)
            if (state.bonuses.ally) {
                state.bonuses.ally = false;
                document.getElementById('allyToggle').classList.remove('active');
            }
            if (!state.bonuses.swornEnemy) {
                toggleTypeBonus('swornEnemy');
            }
        }
    }
    updateBonusAvailability();
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function selectBasicEthics(value) {
    const basicBonuses = ['militarist', 'isolationist', 'pacifist', 'diplomatic'];
    basicBonuses.forEach(key => { state.bonuses[key] = false; });
    
    if (value !== 'none') {
        state.bonuses[value] = true;
        if (value === 'diplomatic') {
            // Auto-enable Ally, auto-disable Patriotic
            if (state.bonuses.patriotic) {
                state.bonuses.patriotic = false;
                document.getElementById('patrioticToggle').classList.remove('active');
            }
            if (!state.bonuses.ally) {
                toggleTypeBonus('ally');
            }
        } else if (value === 'isolationist') {
            // Auto-enable Sworn Enemy
            if (!state.bonuses.swornEnemy) {
                toggleTypeBonus('swornEnemy');
            }
        }
    }
    updateBonusAvailability();
    updateTotalBonus();
    updateCurrentStatsDisplay();
}

function updateBonusAvailability() {
    const type = state.battleType;
    
    const baseSelect = document.getElementById('baseSelect');
    baseSelect.disabled = (type !== 'attack');
    if (type !== 'attack' && state.bonuses.base > 0) {
        state.bonuses.base = 0;
        baseSelect.value = 0;
    }
    
    const bunkerSelect = document.getElementById('bunkerSelect');
    bunkerSelect.disabled = (type !== 'defend');
    if (type !== 'defend' && state.bonuses.bunker > 0) {
        state.bonuses.bunker = 0;
        bunkerSelect.value = 0;
    }
    
    const resistanceSelect = document.getElementById('resistanceSelect');
    resistanceSelect.disabled = (type !== 'revolt');
    if (type !== 'revolt' && state.bonuses.resistance > 0) {
        state.bonuses.resistance = 0;
        resistanceSelect.value = 0;
    }
    
    // Determine if Sworn Enemy / Ally are blocked by current state
    const swornEnemyBlocked = state.bonuses.fanaticDiplomatic;
    const allyBlocked = state.bonuses.patriotic || state.bonuses.resistance >= 30 || state.bonuses.fanaticIsolationist;
    
    const fanaticSelect = document.getElementById('fanaticSelect');
    Array.from(fanaticSelect.options).forEach(opt => {
        if (opt.value === 'fanaticMilitarist') {
            opt.disabled = (type !== 'attack' && type !== 'revolt');
        } else if (opt.value === 'fanaticPacifist') {
            opt.disabled = (type !== 'defend');
        } else if (opt.value === 'fanaticIsolationist') {
            // Requires Sworn Enemy - blocked when Sworn Enemy is impossible
            opt.disabled = swornEnemyBlocked;
        } else if (opt.value === 'fanaticDiplomatic') {
            // Requires Ally - blocked when Ally is impossible
            opt.disabled = allyBlocked;
        }
    });
    if (fanaticSelect.value !== 'none' && fanaticSelect.options[fanaticSelect.selectedIndex].disabled) {
        const fanaticBonuses = ['fanaticMilitarist', 'fanaticIsolationist', 'fanaticPacifist', 'fanaticDiplomatic'];
        fanaticBonuses.forEach(key => { state.bonuses[key] = false; });
        fanaticSelect.value = 'none';
    }
    
    const basicSelect = document.getElementById('basicSelect');
    Array.from(basicSelect.options).forEach(opt => {
        if (opt.value === 'militarist') {
            opt.disabled = (type !== 'attack' && type !== 'revolt');
        } else if (opt.value === 'pacifist') {
            opt.disabled = (type !== 'defend');
        } else if (opt.value === 'isolationist') {
            // Requires Sworn Enemy - blocked when Sworn Enemy is impossible
            opt.disabled = swornEnemyBlocked;
        } else if (opt.value === 'diplomatic') {
            // Requires Ally - blocked when Ally is impossible
            opt.disabled = allyBlocked;
        }
    });
    if (basicSelect.value !== 'none' && basicSelect.options[basicSelect.selectedIndex].disabled) {
        const basicBonuses = ['militarist', 'isolationist', 'pacifist', 'diplomatic'];
        basicBonuses.forEach(key => { state.bonuses[key] = false; });
        basicSelect.value = 'none';
    }
    
    const allyEl = document.getElementById('allyToggle');
    const patrioticEl = document.getElementById('patrioticToggle');
    
    if (state.bonuses.patriotic || state.bonuses.resistance >= 30 || state.bonuses.fanaticIsolationist) {
        allyEl.classList.add('disabled');
        if (state.bonuses.ally && state.bonuses.resistance >= 30) {
            state.bonuses.ally = false;
            allyEl.classList.remove('active');
        }
    } else {
        allyEl.classList.remove('disabled');
    }
    
    const swornEnemyEl = document.getElementById('swornEnemyToggle');
    if (state.bonuses.fanaticDiplomatic) {
        swornEnemyEl.classList.add('disabled');
    } else {
        swornEnemyEl.classList.remove('disabled');
    }
    
    if (state.bonuses.ally || state.bonuses.resistance == 15 || state.bonuses.fanaticDiplomatic || state.bonuses.diplomatic) {
        patrioticEl.classList.add('disabled');
        if (state.bonuses.patriotic && state.bonuses.resistance == 15) {
            state.bonuses.patriotic = false;
            patrioticEl.classList.remove('active');
        }
    } else {
        patrioticEl.classList.remove('disabled');
    }
    
    // Resistance 15% requires Ally - if Ally got cleared, reset resistance
    // Resistance 30% requires Patriotic - if Patriotic got cleared, reset resistance
    if ((state.bonuses.resistance == 15 && !state.bonuses.ally) ||
        (state.bonuses.resistance >= 30 && !state.bonuses.patriotic)) {
        state.bonuses.resistance = 0;
        document.getElementById('resistanceSelect').value = 0;
    }
}

function calculateTotalBonus() {
    let total = 0;
    
    total += state.bonuses.countryOrderToggle ? bonuses.countryOrder : 0;
    total += state.bonuses.muOrderToggle ? bonuses.muOrder : 0;
    total += state.bonuses.muHeadquartersToggle ? bonuses.muHeadquarters : 0;
    
    total += state.bonuses.ally ? bonuses.ally : 0;
    total += state.bonuses.swornEnemy ? bonuses.swornEnemy : 0;
    total += state.bonuses.patriotic ? bonuses.patriotic : 0;
    total += state.bonuses.base;
    total += state.bonuses.bunker;
    total += state.bonuses.resistance;
    
    total += state.bonuses.fanaticMilitarist ? bonuses.fanaticMilitarist : 0;
    total += state.bonuses.fanaticIsolationist ? bonuses.fanaticIsolationist : 0;
    total += state.bonuses.fanaticPacifist ? bonuses.fanaticPacifist : 0;
    total += state.bonuses.fanaticDiplomatic ? bonuses.fanaticDiplomatic : 0;
    
    total += state.bonuses.militarist ? bonuses.militarist : 0;
    total += state.bonuses.isolationist ? bonuses.isolationist : 0;
    total += state.bonuses.pacifist ? bonuses.pacifist : 0;
    total += state.bonuses.diplomatic ? bonuses.diplomatic : 0;
    
    return total;
}

function updateTotalBonus() {
    const total = calculateTotalBonus();
    document.getElementById('totalBonusValue').textContent = total + '%';
}

function setBattleBonusDirect(value) {
    value = Math.max(0, Math.min(300, isNaN(value) ? 0 : value));
    state.bonuses.direct = value;
    const el = document.getElementById('battle-bonus-direct');
    if (el) el.value = value;
    updateCurrentStatsDisplay();
    saveState();
}

function randomPercentage() {
    return Math.floor(Math.random() * 100); 
}

function applyPercentage(value, percentage) {
    return value + ((value * percentage) / 100)
}

function randomizeAttackDamage(baseAttack) {
    let generate = Math.random() * 10;
    let change = Math.floor(generate);
    let last = generate.toString().charAt(generate.toString().length - 1);
    change = parseInt(last) % 2 == 0 ? change : -change;
    return applyPercentage(baseAttack, change);
}

function determineDamage(set) {
    let skillAttack = calculateStats.attack(set.skills.attack);
    let weaponAttack = set.weapon.primary
    let dmg = randomizeAttackDamage(skillAttack + weaponAttack);

    let bonus = 0;

    if (set.bonuses.direct && set.bonuses.direct > 0) {
        bonus = set.bonuses.direct;
    } else {
        bonus += set.bonuses.countryOrderToggle ? bonuses.countryOrder : 0;
        bonus += set.bonuses.muOrderToggle ? bonuses.muOrder : 0;
        bonus += set.bonuses.muHeadquartersToggle ? bonuses.muHeadquarters : 0;
        bonus += set.bonuses.ally ? bonuses.ally : 0;
        bonus += set.bonuses.swornEnemy ? bonuses.swornEnemy : 0;
        bonus += set.bonuses.patriotic ? bonuses.patriotic : 0;
        bonus += set.bonuses.base;
        bonus += set.bonuses.bunker;
        bonus += set.bonuses.resistance;
        bonus += set.bonuses.fanaticMilitarist ? bonuses.fanaticMilitarist : 0;
        bonus += set.bonuses.fanaticIsolationist ? bonuses.fanaticIsolationist : 0;
        bonus += set.bonuses.fanaticPacifist ? bonuses.fanaticPacifist : 0;
        bonus += set.bonuses.fanaticDiplomatic ? bonuses.fanaticDiplomatic : 0;
        bonus += set.bonuses.militarist ? bonuses.militarist : 0;
        bonus += set.bonuses.isolationist ? bonuses.isolationist : 0;
        bonus += set.bonuses.pacifist ? bonuses.pacifist : 0;
        bonus += set.bonuses.diplomatic ? bonuses.diplomatic : 0;
    }

    dmg = applyPercentage(dmg, bonus);
    
    // Apply pill, ammo, and military rank bonuses multiplicatively (in order)
    if (set.buffs.pill) {
        dmg = applyPercentage(dmg, buffs.pill);
    }
    if (set.buffs.ammo) {
        dmg = applyPercentage(dmg, buffs.ammo[set.buffs.ammo]);
    }
    if (set.militaryRankBonus && set.militaryRankBonus > 0) {
        dmg = applyPercentage(dmg, set.militaryRankBonus);
    }

    let missRng = randomPercentage();
    let hitChance = calculateStats.precision(set.skills.precision) + set.armors.gloves;

    // Precision overflow: each point above 100% converts to +4 attack
    if (hitChance > 100) {
        let precisionOverflow = hitChance - 100;
        dmg += precisionOverflow * 4;
        hitChance = 100;
    }

    if (missRng > hitChance) {
        return {
            damageState: "Miss",
            damage: Math.floor(dmg / 2)
        };
    }

    let critRng = randomPercentage();
    let critChance = calculateStats.critChance(set.skills.critChance) + set.weapon.secondary;

    // Crit chance overflow: each point above 100% converts to +4 crit damage
    let critOverflowBonus = 0;
    if (critChance > 100) {
        critOverflowBonus = (critChance - 100) * 4;
        critChance = 100;
    }

    if (critChance > critRng) {
        let crit = calculateStats.critDamage(set.skills.critDamage) + set.armors.helmet + critOverflowBonus;
        return {
            damageState: "Crit",
            damage: Math.floor(applyPercentage(dmg, crit))
        };
    }

    return {
        damageState: "",
        damage: Math.floor(dmg)
    };
}

function determineHealth(set, currentHealth) {
    let dodgeRng = randomPercentage();
    let dodgeTotal = calculateStats.dodge(set.skills.dodge) + set.armors.boots;
    let dodgeChance = (dodgeTotal / (dodgeTotal + 40)) * 100;

    if (dodgeChance > dodgeRng) {
        return {
            healthState: "Dodged",
            newHealth: currentHealth
        };
    }

    let armorTotal = calculateStats.armor(set.skills.armor) + set.armors.chest + set.armors.pants;
    let armorReduction = armorTotal / (armorTotal + 40);
    let reduction = 10 * (1 - armorReduction);

    return {
        healthState: "",
        newHealth: currentHealth - reduction
    };
}

function getInitialHealth(set) {
    let baseHealth = calculateStats.health(set.skills.health);
    let health = baseHealth;
    let hunger = calculateStats.hunger(set.skills.hunger);

    if (set.buffs.food) {
        health += Math.floor(baseHealth * buffs.food[set.buffs.food] / 100) * hunger;
    }

    return health;
}

function getRecoveredHealth(set) {
    let baseHealth = calculateStats.health(set.skills.health);
    let health = Math.floor(baseHealth * 0.1 * state.battle.roundDuration);
    let hunger = Math.floor(calculateStats.hunger(set.skills.hunger) * 0.1 * state.battle.roundDuration);

    if (set.buffs.food) {
        health += Math.floor(baseHealth * buffs.food[set.buffs.food] / 100) * hunger;
    }

    return health;
}

function getPrePillPhaseHealth(set) {
    const hours = state.battle.prePillPhaseHours || 6;
    let baseHealth = calculateStats.health(set.skills.health);
    let health = Math.floor(baseHealth * 0.1 * hours);
    let hunger = Math.floor(calculateStats.hunger(set.skills.hunger) * 0.1 * hours);

    if (set.buffs.food) {
        health += Math.floor(baseHealth * buffs.food[set.buffs.food] / 100) * hunger;
    }

    return health;
}

function leftPadTwo(num) {
    return num < 10 ? `0${num}` : num.toString();
}

function leftPadThree(num) {
    if (num < 10) {
        return `00${num}`;
    } else if (num < 100) {
        return `0${num}`;
    } else {
        return num;
    }
}

function simulateBattle(set, health, initialWeaponDurability = 100, initialArmorDurability = 100) {
    let hits = [];
    let weaponDurability = initialWeaponDurability;
    let armorDurability = initialArmorDurability;
    
    while (true) {
        let {damageState, damage} = determineDamage(set);
        let {healthState, newHealth} = determineHealth(set, health);

        hits.push({
            damageState: damageState,
            damage: damage,
            healthState: healthState,
            currentHealth: health
        })

        weaponDurability -= 1;
        
        if (healthState !== "Dodged") {
            armorDurability -= 1;
        }
        
        if (set.battle.weaponDurabilityLimit && weaponDurability <= 0) {
            break;
        } else if (set.battle.armorDurabilityLimit && armorDurability <= 0) {
            break;
        }
        
        if (newHealth <= 0) {
            break;
        } else {
            health = newHealth;
        }
    }

    return {
        hits: hits,
        weaponDurabilityLost: initialWeaponDurability - weaponDurability,
        armorDurabilityLost: initialArmorDurability - armorDurability,
        remainingWeaponDurability: weaponDurability,
        remainingArmorDurability: armorDurability
    };
}

function buildSetFromLoadout(loadout, weapon) {
    const resolvedWeapon = weapon || loadout.weapon || { primary: 90, secondary: 15 };
    return {
        skills: state.skills,
        weapon: resolvedWeapon,
        armors: loadout.armors,
        buffs: {
            pill: loadout.pill,
            ammo: loadout.ammo,
            food: loadout.food !== undefined && loadout.food !== null ? loadout.food : state.buffs.food
        },
        bonuses: state.bonuses,
        militaryRankBonus: state.militaryRankBonus,
        battle: state.battle,
        equipmentCosts: loadout.equipmentCosts
    };
}

function getDefaultLoadout() {
    return {
        name: "",
        weapon: { primary: 40, secondary: 5 },
        armors: { helmet: 5, chest: 5, pants: 5, boots: 5, gloves: 5 },
        ammo: null,
        food: null,
        pill: false,
        phases: ['prePill'],
        equipmentCosts: { weapon: 2, helmet: 2, chest: 2, pants: 2, boots: 2, gloves: 2 }
    };
}

function getDefaultWeapon() {
    return { name: '', primary: 40, secondary: 5, cost: 2, phases: ['prePill'] };
}

function getItemPhases(item) {
    if (Array.isArray(item.phases)) return item.phases;
    if (item.phase) return [item.phase];
    return ['prePill'];
}

function getLoadoutRarity(loadout) {
    return getRarityFromStats('helmet', loadout.armors.helmet);
}

function getLoadoutSummaryText(loadout, index) {
    const name = loadout.name || String.fromCharCode(65 + index);
    const ammoMap = { light: 'ammo.light', ammo: 'ammo.ammo', heavy: 'ammo.heavy' };
    const ammoLabel = loadout.ammo ? t(ammoMap[loadout.ammo] || 'ammo.none') : t('ammo.none');
    const pillLabel = loadout.pill ? t('buff.pill') : '';
    return `${name}: ${t('equip.helmet')} ${loadout.armors.helmet}% | ${ammoLabel}${pillLabel ? ' | ' + pillLabel : ''}`;
}

function runMultiStageSimulation() {
    document.getElementById('simulation-hint').style.display = 'none';
    const button = document.getElementById('runSimButton');
    button.disabled = true;
    setTimeout(() => { button.disabled = false; }, 200);

    const simType = document.querySelector('input[name="simType"]:checked').value;
    state.battle.type = simType;
    let battleCount = parseInt(document.getElementById('battleCount').value) || 10000;
    battleCount = Math.min(battleCount, 10000);
    state.battle.multiBattleCount = battleCount;
    saveState();

    const allWeapons  = state.multiStage.weapons || [];
    const allLoadouts = state.multiStage.loadouts;
    // Always run multiple iterations for realistic averages (min 10k)
    const iterations  = Math.max(battleCount, 10000);

    const PHASES = ['prePill', 'burst', 'sustained'];

    // For each phase, get which item indices appear in it (by global index)
    const phaseWeaponIdxs  = {};
    const phaseLoadoutIdxs = {};
    PHASES.forEach(ph => {
        phaseWeaponIdxs[ph]  = allWeapons.map((w, i) => getItemPhases(w).includes(ph) ? i : -1).filter(i => i >= 0);
        phaseLoadoutIdxs[ph] = allLoadouts.map((l, i) => getItemPhases(l).includes(ph) ? i : -1).filter(i => i >= 0);
    });

    // Per-phase per-item accumulators (indexed by position within phase)
    const phaseAccum = {};
    PHASES.forEach(ph => {
        const nW = phaseWeaponIdxs[ph].length;
        const nL = phaseLoadoutIdxs[ph].length;
        phaseAccum[ph] = {
            totalDamage: 0, minBatchDamage: Infinity, maxBatchDamage: 0,
            totalHits: 0, totalMiss: 0, totalCrit: 0, totalDodge: 0, maxSingleHit: 0,
            weaponDurUsed:   new Array(nW).fill(0),
            armorDurUsed:    new Array(nL).fill(0),
            weaponDurStart:  new Array(nW).fill(0), // starting durability this phase (for display)
            armorDurStart:   new Array(nL).fill(0)
        };
    });

    for (let iter = 0; iter < iterations; iter++) {
        // Track remaining durability per global item index for carry-over across phases
        const weaponCarry  = new Array(allWeapons.length).fill(100);
        const loadoutCarry = new Array(allLoadouts.length).fill(100);

        PHASES.forEach(ph => {
            const wIdxs = phaseWeaponIdxs[ph];
            const lIdxs = phaseLoadoutIdxs[ph];
            if (wIdxs.length === 0 || lIdxs.length === 0) return;

            const pWeapons  = wIdxs.map(i => allWeapons[i]);
            const pLoadouts = lIdxs.map(i => allLoadouts[i]);

            // Starting durabilities from carry-over (same item used in prior phase)
            const startWDur = wIdxs.map(i => weaponCarry[i]);
            const startLDur = lIdxs.map(i => loadoutCarry[i]);

            const firstSet = buildSetFromLoadout(pLoadouts[0], pWeapons[0]);
            let phaseHealth;
            if (ph === 'prePill') {
                phaseHealth = getPrePillPhaseHealth({ ...firstSet, buffs: { ...firstSet.buffs, pill: false } });
            } else if (ph === 'burst') {
                phaseHealth = getInitialHealth(firstSet);
            } else {
                phaseHealth = getRecoveredHealth(firstSet);
            }

            let wPos = 0, lPos = 0;
            let wDur = startWDur[0], lDur = startLDur[0];
            const iterWeaponDurUsed = new Array(pWeapons.length).fill(0);
            const iterArmorDurUsed  = new Array(pLoadouts.length).fill(0);
            const finalWDur = [...startWDur];
            const finalLDur = [...startLDur];
            let batchDamage = 0;

            while (wPos < pWeapons.length && lPos < pLoadouts.length && phaseHealth > 0) {
                const weapon  = pWeapons[wPos];
                const loadout = pLoadouts[lPos];
                const set = buildSetFromLoadout(loadout, weapon);
                const simSet = { ...set, battle: { ...set.battle, weaponDurabilityLimit: true, armorDurabilityLimit: true } };
                if (ph === 'prePill') simSet.buffs = { ...simSet.buffs, pill: false };

                const result = simulateBattle(simSet, phaseHealth, wDur, lDur);

                iterWeaponDurUsed[wPos] += result.weaponDurabilityLost;
                iterArmorDurUsed[lPos]  += result.armorDurabilityLost;
                wDur -= result.weaponDurabilityLost;
                lDur -= result.armorDurabilityLost;
                finalWDur[wPos] = Math.max(0, wDur);
                finalLDur[lPos] = Math.max(0, lDur);

                const stageDmg = result.hits.reduce((a, h) => a + h.damage, 0);
                batchDamage += stageDmg;
                phaseAccum[ph].totalHits  += result.hits.length;
                phaseAccum[ph].totalMiss  += result.hits.filter(h => h.damageState === 'Miss').length;
                phaseAccum[ph].totalCrit  += result.hits.filter(h => h.damageState === 'Crit').length;
                phaseAccum[ph].totalDodge += result.hits.filter(h => h.healthState === 'Dodged').length;
                result.hits.forEach(h => { if (h.damage > phaseAccum[ph].maxSingleHit) phaseAccum[ph].maxSingleHit = h.damage; });

                let hAfter = phaseHealth;
                result.hits.forEach(hit => {
                    if (hit.healthState !== 'Dodged') {
                        const at = calculateStats.armor(set.skills.armor) + set.armors.chest + set.armors.pants;
                        hAfter -= 10 * (1 - at / (at + 40));
                    }
                });
                phaseHealth = Math.max(0, hAfter);

                if (wDur <= 0) { wPos++; if (wPos < pWeapons.length) wDur = startWDur[wPos]; }
                if (lDur <= 0) { lPos++; if (lPos < pLoadouts.length) lDur = startLDur[lPos]; }
            }

            phaseAccum[ph].totalDamage += batchDamage;
            if (batchDamage < phaseAccum[ph].minBatchDamage) phaseAccum[ph].minBatchDamage = batchDamage;
            if (batchDamage > phaseAccum[ph].maxBatchDamage) phaseAccum[ph].maxBatchDamage = batchDamage;
            iterWeaponDurUsed.forEach((d, j) => { phaseAccum[ph].weaponDurUsed[j] += d; });
            iterArmorDurUsed.forEach((d, j)  => { phaseAccum[ph].armorDurUsed[j]  += d; });
            startWDur.forEach((s, j) => { phaseAccum[ph].weaponDurStart[j] += s; });
            startLDur.forEach((s, j) => { phaseAccum[ph].armorDurStart[j]  += s; });

            // Write back carry-over: remaining durability after this phase per global item index
            wIdxs.forEach((wi, j) => { weaponCarry[wi]  = finalWDur[j]; });
            lIdxs.forEach((li, j) => { loadoutCarry[li] = finalLDur[j]; });

        });
    }

    const divisor = iterations;

    const phaseResults = PHASES.map(ph => {
        const wIdxs    = phaseWeaponIdxs[ph];
        const lIdxs    = phaseLoadoutIdxs[ph];
        const acc      = phaseAccum[ph];
        const pWeapons  = wIdxs.map(i => allWeapons[i]);
        const pLoadouts = lIdxs.map(i => allLoadouts[i]);
        if (pWeapons.length === 0 && pLoadouts.length === 0) return null;

        const avgHits = acc.totalHits / divisor;
        return {
            phase:        ph,
            totalDamage:  Math.floor(acc.totalDamage / divisor),
            minDamage:    acc.minBatchDamage === Infinity ? 0 : Math.floor(acc.minBatchDamage),
            maxDamage:    Math.floor(acc.maxBatchDamage),
            hits:         Math.floor(avgHits),
            miss:         Math.floor(acc.totalMiss  / divisor),
            crit:         Math.floor(acc.totalCrit  / divisor),
            dodge:        Math.floor(acc.totalDodge / divisor),
            avgHitDamage: avgHits > 0 ? Math.floor((acc.totalDamage / divisor) / avgHits) : 0,
            maxSingleHit: Math.floor(acc.maxSingleHit),
            weaponResults: pWeapons.map((w, j) => {
                const used  = acc.weaponDurUsed[j]  / divisor;
                const start = acc.weaponDurStart[j] / divisor;
                return { weapon: w, globalIndex: wIdxs[j], durabilityUsed: used, startingDurability: start, remaining: Math.max(0, start - used) };
            }),
            loadoutResults: pLoadouts.map((l, j) => {
                const used  = acc.armorDurUsed[j]  / divisor;
                const start = acc.armorDurStart[j] / divisor;
                return { loadout: l, globalIndex: lIdxs[j], durabilityUsed: used, startingDurability: start, remaining: Math.max(0, start - used) };
            })
        };
    }).filter(Boolean);

    document.getElementById('damageSummary').innerHTML = renderMultiStageSummary(phaseResults);
    document.getElementById('damageSummary').style.display = 'block';
    document.getElementById('hitLog').style.display = 'none';
}

function updateScrapBalance(val) {
    state.scrapBalance = parseFloat(val) || 0;
    saveState();
}

function renderScrapCalculator(phaseResults, totalScrapsFromBattle) {
    const rarityOrder  = ['gray', 'green', 'blue', 'purple', 'yellow', 'red'];
    const rarityLabels = { gray:'Cinza', green:'Verde', blue:'Azul', purple:'Roxo', yellow:'Amarelo (Tank)', red:'Vermelho (Jato)' };
    const rarityColors = { gray:'#aaa', green:'#4caf50', blue:'#2196f3', purple:'#9c27b0', yellow:'#ffeb3b', red:'var(--accent-red)' };

    const coinPerScrap   = parseFloat(document.getElementById('coinPerScrap').value) || 0.3;
    const totalFromBattle = Math.round(totalScrapsFromBattle);
    const balance        = Math.max(0, state.scrapBalance || 0);
    const combined       = balance + totalFromBattle;

    // Per-phase scrap breakdown
    const phaseScrapRows = phaseResults.map(p => {
        const phLabel = { prePill: t('phase.prePill'), burst: t('phase.burst'), sustained: t('phase.sustained') }[p.phase];
        let phScraps = 0;
        p.weaponResults.forEach(wr => {
            const r = getRarityFromStats('weapon', wr.weapon.primary, wr.weapon.secondary);
            phScraps += (wr.durabilityUsed / 100) * scrapPerRarity[r];
        });
        p.loadoutResults.forEach(lr => {
            ['helmet','chest','pants','boots','gloves'].forEach(piece => {
                const r = getRarityFromStats(piece, lr.loadout.armors[piece]);
                phScraps += (lr.durabilityUsed / 100) * scrapPerRarity[r];
            });
        });
        return { label: phLabel, scraps: Math.round(phScraps) };
    }).filter(r => r.scraps > 0);

    const phaseBreakdown = phaseScrapRows.map(r =>
        `<div class="scrap-phase-row"><span class="scrap-phase-label">${r.label}</span><span class="scrap-phase-val">+${r.scraps}</span></div>`
    ).join('');

    // Crafting comparison table: scraps needed vs cc cost vs savings
    const craftTable = rarityOrder.slice(1).map(r => {
        const scrapsNeeded = scrapPerRarity[r];
        const ccCost       = state.weaponRarityCosts[r] || 0;
        const scrapValue   = scrapsNeeded * coinPerScrap;
        const saving       = ccCost - scrapValue;
        const canCraft     = Math.floor(combined / scrapsNeeded);
        const afterCraft   = combined - (canCraft > 0 ? scrapsNeeded : 0); // cost of 1
        return `
        <tr class="scrap-table-row">
            <td><span class="scrap-craft-dot" style="background:${rarityColors[r]}"></span>${rarityLabels[r]}</td>
            <td class="scrap-td-num">${scrapsNeeded}</td>
            <td class="scrap-td-num">${ccCost}cc</td>
            <td class="scrap-td-num" style="color:var(--accent-amber)">${scrapValue.toFixed(1)}cc</td>
            <td class="scrap-td-num ${saving > 0 ? 'scrap-saving' : 'scrap-nosaving'}">${saving > 0 ? '-'+saving.toFixed(1) : '+'+Math.abs(saving).toFixed(1)}cc</td>
            <td class="scrap-td-num">${canCraft > 0 ? `<span class="scrap-can-craft">${canCraft}x</span>` : '—'}</td>
        </tr>`;
    }).join('');

    return `
    <div class="summary-card summary-card-full">
        <div class="summary-card-header">
            <span>Calculadora de Scraps</span>
            <div class="scrap-balance-input-row">
                <span class="scrap-balance-label">Saldo atual de scraps:</span>
                <input type="number" class="scrap-balance-input" value="${balance}" min="0" step="1"
                    onchange="updateScrapBalance(this.value)" oninput="updateScrapBalance(this.value)">
            </div>
        </div>
        <div class="summary-card-body scrap-calc-body">
            <div class="scrap-col scrap-col-left">
                <div class="scrap-section-label">Gerado nesta batalha</div>
                ${phaseBreakdown || '<span class="scrap-empty">Sem scraps nesta batalha</span>'}
                <div class="scrap-total-row"><span>Desta batalha</span><span class="scrap-phase-val">+${totalFromBattle}</span></div>
                ${balance > 0 ? `<div class="scrap-total-row"><span>Saldo atual</span><span class="scrap-phase-val">${balance}</span></div>` : ''}
                <div class="scrap-total-row" style="font-weight:700"><span>Total disponível</span><span class="scrap-total-val">${combined}</span></div>
                <div class="scrap-total-row scrap-cc-val"><span>Valor em cc</span><span>≈ ${(combined * coinPerScrap).toFixed(2)}cc</span></div>
            </div>
            <div class="scrap-col scrap-col-right" style="overflow-x:auto">
                <div class="scrap-section-label">Comparativo: craftar vs comprar (com ${combined} scraps disponíveis)</div>
                <table class="scrap-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Scraps</th>
                            <th>Comprar</th>
                            <th>Craftar</th>
                            <th>Economia</th>
                            <th>Qtd.</th>
                        </tr>
                    </thead>
                    <tbody>${craftTable}</tbody>
                </table>
                <div class="scrap-note">Economia = comprar cc − custo em scraps · Qtd. = quantos você pode craftar com o total disponível</div>
            </div>
        </div>
    </div>`;
}

function renderMultiStageSummary(phaseResults) {
    const phaseLabels = { prePill: t('phase.prePill'), burst: t('phase.burst'), sustained: t('phase.sustained') };
    const phaseColorVar = { prePill: 'var(--accent-red)', burst: 'var(--accent-amber)', sustained: 'var(--accent-green)' };

    const totalDamage    = phaseResults.reduce((a, p) => a + p.totalDamage, 0);
    const totalHits      = phaseResults.reduce((a, p) => a + p.hits,        0);
    const totalMiss      = phaseResults.reduce((a, p) => a + p.miss,        0);
    const totalCrit      = phaseResults.reduce((a, p) => a + p.crit,        0);
    const totalDodge     = phaseResults.reduce((a, p) => a + p.dodge,       0);
    const totalMin       = phaseResults.reduce((a, p) => a + p.minDamage,   0);
    const totalMax       = phaseResults.reduce((a, p) => a + p.maxDamage,   0);
    const overallAvgHit  = totalHits > 0 ? Math.floor(totalDamage / totalHits) : 0;
    const overallMaxHit  = phaseResults.reduce((a, p) => Math.max(a, p.maxSingleHit), 0);

    // Damage rows per phase
    const phaseRows = phaseResults.map(p => `
        <div class="summary-stat">
            <span class="stat-label" style="color:${phaseColorVar[p.phase]}">${phaseLabels[p.phase]}</span>
            <span class="stat-value">${formatDamage(p.totalDamage)}</span>
        </div>
        ${p.minDamage !== p.maxDamage ? `<div class="summary-stat summary-stat-sub">
            <span class="stat-label">Min / Max</span>
            <span class="stat-value"><span class="dmg-min">${formatDamage(p.minDamage)}</span> / <span class="dmg-max">${formatDamage(p.maxDamage)}</span></span>
        </div>` : ''}
    `).join('');

    // Durability remaining section
    // Bar = consumed relative to what was AVAILABLE at start of this phase
    function durRow(label, used, start, isWeapon) {
        const remAbs  = Math.max(0, Math.round(start - used));
        const usedPct = start > 0 ? Math.min(100, Math.round((used / start) * 100)) : 0;
        const remPct  = start > 0 ? Math.round((remAbs / start) * 100) : 0;
        // carry-over tag: if start < 100, this item entered with reduced durability
        const carryTag = Math.round(start) < 100 ? `<span class="dur-carry-tag">▸${Math.round(start)}%</span>` : '';
        const cls = isWeapon ? 'dur-bar-weapon' : 'dur-bar-armor';
        return `<div class="dur-item-row">
            <span class="dur-item-label">${label}${carryTag}</span>
            <div class="dur-bar-track"><div class="dur-bar-fill ${cls}" style="width:${usedPct}%"></div></div>
            <span class="dur-item-pct ${remAbs > 0 ? 'dur-ok' : 'dur-depleted'}">${remPct}% ${t('stats.remaining')}</span>
        </div>`;
    }

    const durRows = phaseResults.map(p => {
        const phColor = phaseColorVar[p.phase];
        const wRows = p.weaponResults.map(wr =>
            durRow(`${t('equip.weapon')} ${wr.weapon.name || '?'}`, wr.durabilityUsed, wr.startingDurability, true)
        ).join('');
        const lRows = p.loadoutResults.map(lr =>
            durRow(`${t('stats.armor')} ${lr.loadout.name || '?'}`, lr.durabilityUsed, lr.startingDurability, false)
        ).join('');
        return `<div class="dur-phase-label" style="color:${phColor}">${phaseLabels[p.phase]}</div>${wRows}${lRows}`;
    }).join('<div class="summary-divider"></div>');

    // Cost calculation
    let totalCostOnly = 0;
    let costRows = '';

    phaseResults.forEach(p => {
        const pLabel = phaseLabels[p.phase];

        p.weaponResults.forEach(wr => {
            const wCost = (wr.durabilityUsed / 100) * (wr.weapon.cost || 0);
            totalCostOnly += wCost;
            if (wCost > 0) costRows += `<div class="cost-row">
                <span class="cost-label">Arma ${wr.weapon.name||'?'} (${pLabel})</span>
                <span class="cost-value cost-negative">-${wCost.toFixed(2)}cc</span>
            </div>`;
        });

        p.loadoutResults.forEach(lr => {
            const ec = lr.loadout.equipmentCosts || {};
            const armorCostTotal = (ec.helmet||0) + (ec.chest||0) + (ec.pants||0) + (ec.boots||0) + (ec.gloves||0);
            const armorCost = (lr.durabilityUsed / 100) * armorCostTotal;

            let ammoCost = 0;
            if (lr.loadout.ammo) {
                let perHit = 0;
                if (lr.loadout.ammo === 'light') perHit = state.buffCosts.lightAmmo;
                else if (lr.loadout.ammo === 'ammo') perHit = state.buffCosts.ammo;
                else if (lr.loadout.ammo === 'heavy') perHit = state.buffCosts.heavyAmmo;
                ammoCost = (p.hits / Math.max(1, p.loadoutResults.length)) * perHit;
            }

            const pillCost = lr.loadout.pill ? state.buffCosts.pill : 0;
            const lCost = armorCost + ammoCost + pillCost;
            totalCostOnly += lCost;

            if (lCost > 0) costRows += `<div class="cost-row">
                <span class="cost-label">${t('stats.armor')} ${lr.loadout.name||'?'} (${pLabel})</span>
                <span class="cost-value cost-negative">-${lCost.toFixed(2)}cc</span>
            </div>`;
        });
    });

    // Food cost (global)
    let foodCost = 0;
    if (state.buffs.food) {
        const currentHunger = calculateStats.hunger(state.skills.hunger);
        const totalFoodConsumed = currentHunger * (1 + 0.1 * state.battle.roundDuration);
        let perFood = 0;
        if (state.buffs.food === 'bread') perFood = state.buffCosts.bread;
        else if (state.buffs.food === 'steak') perFood = state.buffCosts.steak;
        else if (state.buffs.food === 'fish') perFood = state.buffCosts.fish;
        foodCost = totalFoodConsumed * perFood;
        totalCostOnly += foodCost;
    }

    // Bounty
    let bountyGained = 0;
    if (state.battle.bountyEnabled) {
        bountyGained = (totalDamage / 1000) * state.battle.bountyPerKDamage;
    }

    // Cases — probability-based: each accurate hit has loot% chance for case1, loot/100% for case2
    const lootChance = calculateStats.loot(state.skills.loot);
    const accurateHits = totalHits - totalMiss;
    const case1Count = accurateHits * (lootChance / 100);          // expected case1 drops
    const case2Count = accurateHits * (lootChance / 10000);        // expected case2 drops (rare)
    const caseGainsEnabled = document.getElementById('caseGainsEnabled').checked;
    const coinPerCase  = parseFloat(document.getElementById('coinPerCase').value) || 4;
    const coinPerCase2 = parseFloat(document.getElementById('coinPerCase2').value) || 33;
    const gainsFromCases = caseGainsEnabled ? (case1Count * coinPerCase + case2Count * coinPerCase2) : 0;

    // Scraps
    const scrapGainsEnabled = document.getElementById('scrapGainsEnabled').checked;
    const coinPerScrap = parseFloat(document.getElementById('coinPerScrap').value) || 0.3;
    let totalScraps = 0;
    if (scrapGainsEnabled) {
        phaseResults.forEach(p => {
            p.weaponResults.forEach(wr => {
                const wRarity = getRarityFromStats('weapon', wr.weapon.primary, wr.weapon.secondary);
                totalScraps += (wr.durabilityUsed / 100) * scrapPerRarity[wRarity];
            });
            p.loadoutResults.forEach(lr => {
                ['helmet', 'chest', 'pants', 'boots', 'gloves'].forEach(piece => {
                    const aRarity = getRarityFromStats(piece, lr.loadout.armors[piece]);
                    totalScraps += (lr.durabilityUsed / 100) * scrapPerRarity[aRarity];
                });
            });
        });
    }
    const gainsFromScraps = totalScraps * coinPerScrap;
    const totalCost = totalCostOnly - bountyGained - gainsFromCases - gainsFromScraps;

    return `
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-card-header"><span>Combat Stats</span></div>
                <div class="summary-card-body">
                    <div class="summary-stat-main">
                        <span class="stat-label">${t('stats.totalDamage')}</span>
                        <span class="stat-value-large">${formatDamage(totalDamage)}</span>
                    </div>
                    ${totalMin !== totalMax ? `<div class="summary-stat summary-stat-sub">
                        <span class="stat-label">Min / Max Total</span>
                        <span class="stat-value"><span class="dmg-min">${formatDamage(totalMin)}</span> / <span class="dmg-max">${formatDamage(totalMax)}</span></span>
                    </div>` : ''}
                    <div class="summary-divider"></div>
                    ${phaseRows}
                    <div class="summary-divider"></div>
                    <div class="summary-stat">
                        <span class="stat-label" style="font-weight:600;font-size:13px">Total Hits</span>
                        <span class="stat-value" style="font-weight:600;font-size:13px">${totalHits}</span>
                    </div>
                    <div class="summary-stat"><span class="stat-label">Misses</span><span class="stat-value">${totalMiss}</span></div>
                    <div class="summary-stat"><span class="stat-label">Crits</span><span class="stat-value">${totalCrit}</span></div>
                    <div class="summary-stat"><span class="stat-label">Dodges</span><span class="stat-value">${totalDodge}</span></div>
                    <div class="summary-divider"></div>
                    <div class="summary-stat"><span class="stat-label">${t('stats.avgHit')}</span><span class="stat-value" style="color:var(--accent-amber)">${formatDamage(overallAvgHit)}</span></div>
                    <div class="summary-stat"><span class="stat-label">${t('stats.maxHit')}</span><span class="stat-value" style="color:var(--accent-green)">${formatDamage(overallMaxHit)}</span></div>
                    <div class="summary-divider"></div>
                    <div class="summary-stat">
                        <span class="stat-label">${t('stats.costPer1k')}</span>
                        <span class="stat-value cost-negative">-${totalDamage > 0 ? (totalCostOnly / (totalDamage / 1000)).toFixed(2) : '0.00'}cc</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">${t('stats.costPer1kNet')}</span>
                        <span class="stat-value ${totalCost >= 0 ? 'cost-negative' : 'cost-bounty'}">${totalCost >= 0 ? '-' : '+'}${totalDamage > 0 ? Math.abs(totalCost / (totalDamage / 1000)).toFixed(2) : '0.00'}cc</span>
                    </div>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-card-header"><span>${t('stats.durabilityRemaining')}</span></div>
                <div class="summary-card-body">
                    ${durRows}
                </div>
            </div>

            <div class="summary-card summary-card-full">
                <div class="summary-card-header"><span>${t('stats.battleCost')}</span></div>
                <div class="summary-card-body">
                    ${costRows}
                    ${foodCost > 0 ? `<div class="cost-row"><span class="cost-label">Comida</span><span class="cost-value cost-negative">-${foodCost.toFixed(2)}cc</span></div>` : ''}
                    <div class="cost-row">
                        <span class="cost-label" style="font-weight:600;font-size:13px">${t('stats.totalCost')}</span>
                        <span class="cost-value cost-negative" style="font-weight:600;font-size:13px">-${totalCostOnly.toFixed(2)}cc</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="cost-row"><span class="cost-label">📦 Case (${case1Count.toFixed(1)} × ${coinPerCase}cc)</span><span class="cost-value cost-bounty">+${(case1Count * coinPerCase).toFixed(2)}cc</span></div>
                    <div class="cost-row"><span class="cost-label">📦 Case Rara (${case2Count.toFixed(2)} × ${coinPerCase2}cc)</span><span class="cost-value cost-bounty">+${(case2Count * coinPerCase2).toFixed(2)}cc</span></div>
                    <div class="cost-row"><span class="cost-label">Ganho de Scraps (${Math.round(totalScraps)})</span><span class="cost-value cost-bounty">+${gainsFromScraps.toFixed(2)}cc</span></div>
                    <div class="cost-row"><span class="cost-label">Bounty</span><span class="cost-value cost-bounty">+${bountyGained.toFixed(2)}cc</span></div>
                    <div class="cost-row cost-total">
                        <span class="cost-label">Saldo Líquido</span>
                        <span class="cost-value">${totalCost > 0 ? '-' : '+'}${Math.abs(totalCost).toFixed(2)}cc</span>
                    </div>
                </div>
            </div>

            ${renderScrapCalculator(phaseResults, totalScraps)}
        </div>
    `;
}

let buildSnapshot = "";
let currentBuildName = "";

function isBuildDirty() {
    if (!currentBuildName || !buildSnapshot) return false;
    return JSON.stringify(state) !== buildSnapshot;
}

function saveBuildSnapshot() {
    buildSnapshot = JSON.stringify(state);
}

function saveState() {
    localStorage.setObject("warera-state", state);
}

function getBuilds() {
    return localStorage.getObject("warera-builds") || {};
}

function setBuilds(builds) {
    localStorage.setObject("warera-builds", builds);
}

function saveCurrentBuildName() {
    localStorage.setItem("warera-current-build", currentBuildName);
}

function updateBuildDirtyIndicator() {
    if (!currentBuildName) return;
    const select = document.getElementById('buildsSelect');
    for (const option of select.options) {
        if (option.value === currentBuildName) {
            option.textContent = isBuildDirty() ? currentBuildName + " *" : currentBuildName;
            break;
        }
    }
}

function populateBuildsDropdown() {
    const select = document.getElementById('buildsSelect');
    const builds = getBuilds();

    select.innerHTML = '<option value="">-- Select Build --</option>';

    Object.keys(builds).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    if (builds[currentBuildName]) {
        select.value = currentBuildName;
        updateBuildDirtyIndicator();
    } else {
        currentBuildName = "";
        saveCurrentBuildName();
    }
}

function onBuildSelect(selectEl) {
    const name = selectEl.value;
    const previousName = currentBuildName;

    if (!name) {
        currentBuildName = "";
        saveCurrentBuildName();
        return;
    }

    if (isBuildDirty()) {
        if (!confirm("You have unsaved changes. Switch build anyway?")) {
            selectEl.value = previousName;
            return;
        }
    }

    loadBuild(name);
}

function loadBuild(name) {
    const builds = getBuilds();
    if (!builds[name]) return;

    state = JSON.parse(JSON.stringify(builds[name]));
    localStorage.setObject("warera-state", state);
    currentBuildName = name;
    saveCurrentBuildName();
    init();
    saveBuildSnapshot();
    document.getElementById('buildsSelect').value = name;
}

function createBuild() {
    const name = prompt("Enter a name for this build:");
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    const builds = getBuilds();

    if (builds[trimmed]) {
        if (!confirm('Build "' + trimmed + '" already exists. Overwrite it?')) return;
    }

    builds[trimmed] = JSON.parse(JSON.stringify(state));
    setBuilds(builds);
    currentBuildName = trimmed;
    saveCurrentBuildName();
    saveBuildSnapshot();
    populateBuildsDropdown();
}

function saveBuild() {
    const select = document.getElementById('buildsSelect');
    const name = select.value;

    if (!name) {
        createBuild();
        return;
    }

    const builds = getBuilds();
    builds[name] = JSON.parse(JSON.stringify(state));
    setBuilds(builds);
    saveBuildSnapshot();
    updateBuildDirtyIndicator();
}

function deleteBuild() {
    const select = document.getElementById('buildsSelect');
    const name = select.value;

    if (!name) {
        alert("Please select a build to delete.");
        return;
    }

    if (!confirm('Delete build "' + name + '"? This cannot be undone.')) return;

    const builds = getBuilds();
    delete builds[name];
    setBuilds(builds);
    if (currentBuildName === name) {
        currentBuildName = "";
        saveCurrentBuildName();
        buildSnapshot = "";
    }
    populateBuildsDropdown();
}

function switchTab(tabName) {
    const configureTab = document.getElementById('configureTab');
    const compareTab   = document.getElementById('compareTab');
    const optimizerTab = document.getElementById('optimizerTab');
    const tabs = document.querySelectorAll('.main-tab');

    tabs.forEach(tab => tab.classList.remove('active'));

    const buildsBar  = document.getElementById('buildsBar');
    const compareBar = document.getElementById('compareBar');

    configureTab.style.display = 'none';
    compareTab.style.display   = 'none';
    optimizerTab.style.display = 'none';
    buildsBar.style.display    = 'none';
    compareBar.style.display   = 'none';

    if (tabName === 'compare') {
        compareTab.style.display = 'block';
        compareBar.style.display = '';
        tabs[1].classList.add('active');
        populateCompareDropdowns();
    } else if (tabName === 'optimizer') {
        optimizerTab.style.display = 'block';
        tabs[2].classList.add('active');
    } else {
        configureTab.style.display = '';
        buildsBar.style.display    = '';
        tabs[0].classList.add('active');
    }
}

function populateCompareDropdowns() {
    const select1 = document.getElementById('compareSelect1');
    const select2 = document.getElementById('compareSelect2');
    const builds = getBuilds();
    const names = Object.keys(builds).sort();

    const prev1 = select1.value;
    const prev2 = select2.value;

    const options = '<option value="">-- Select --</option>' +
        names.map(name => `<option value="${name.replace(/"/g, '&quot;')}">${name}</option>`).join('');

    select1.innerHTML = options;
    select2.innerHTML = options;

    if (prev1 && names.includes(prev1)) select1.value = prev1;
    if (prev2 && names.includes(prev2)) select2.value = prev2;
}

function runComparison() {
    const name1 = document.getElementById('compareSelect1').value;
    const name2 = document.getElementById('compareSelect2').value;

    if (!name1 || !name2) {
        alert("Please select two builds to compare.");
        return;
    }

    const builds = getBuilds();
    const originalState = JSON.parse(JSON.stringify(state));
    const resultsContainer = document.getElementById('compareResults');
    resultsContainer.innerHTML = '';

    [name1, name2].forEach(name => {
        const buildState = builds[name];
        if (!buildState) return;

        state = JSON.parse(JSON.stringify(buildState));
        const summaryHtml = simulateForState(state);

        const column = document.createElement('div');
        column.className = 'compare-column';
        column.innerHTML = `
            <h3 class="compare-column-name">${name}</h3>
            <div class="damage-summary" style="display: block;">${summaryHtml}</div>
        `;
        resultsContainer.appendChild(column);
    });

    state = originalState;
}

function renderSingleCombatLog(hits) {
    let output = [];

    hits.forEach((hit, i) => {
        let dmgExtra = "        ";
        if (hit.damageState != "") {
            dmgExtra = hit.damage >= 1000 ? `(${hit.damageState}) ` : ` (${hit.damageState}) `;
        }

        let healthExtra = "";
        if (hit.healthState != "") {
            healthExtra = `(${hit.healthState})`;
        }

        output.push(`[Hit ${leftPadTwo(i + 1)}] - Damage: ${hit.damage} ${dmgExtra}- Health: ${hit.currentHealth.toFixed(1)} ${healthExtra}\n`);
    });

    return output.join('');
}

function renderCombatLog(allPrePillHits, allBurstHits, allSustainedHits) {
    if (state.battle.type === 'single') {
        let log = "";
        if (allPrePillHits.length > 0) {
            const hours = state.battle.prePillPhaseHours || 6;
            log += `[Pre-pill Hourly Phase (${hours} hours)]\n\n` + renderSingleCombatLog(allPrePillHits[0]) + "\n";
        }
        log += "[Initial Burst Phase]\n\n" +
            renderSingleCombatLog(allBurstHits[0]) +
            `\n[Sustained Phase]\n\n` +
            renderSingleCombatLog(allSustainedHits[0]);
        return log;
    } else {
        return "";
    }
}

function renderBattleSummary(concatPrePillHits, concatBurstHits, concatSustainedHits, weaponDurabilityLost, armorDurabilityLost) {
    let result = {};

    if (state.battle.type === 'single') {
        const prePillDamage = concatPrePillHits.reduce((acc, cur) => acc + cur.damage, 0);
        const burstDamage = concatBurstHits.reduce((acc, cur) => acc + cur.damage, 0);
        const sustainedDamage = concatSustainedHits.reduce((acc, cur) => acc + cur.damage, 0);
        const totalDamage = prePillDamage + burstDamage + sustainedDamage;
        const allHits = concatPrePillHits.concat(concatBurstHits).concat(concatSustainedHits);
        const hits = allHits.length;
        const miss = allHits.filter(hit => hit.damageState === "Miss").length;
        const crit = allHits.filter(hit => hit.damageState === "Crit").length;
        const dodge = allHits.filter(hit => hit.healthState === "Dodged").length;
        result = {totalDamage, prePillDamage, burstDamage, sustainedDamage, hits, miss, crit, dodge};
    } else {
        const allHits = concatPrePillHits.concat(concatBurstHits).concat(concatSustainedHits);
        const damage = allHits.reduce((acc, cur) => acc + cur.damage, 0);
        const totalDamage = Math.floor(damage / state.battle.multiBattleCount);
        const prePill = concatPrePillHits.reduce((acc, cur) => acc + cur.damage, 0);
        const prePillDamage = Math.floor(prePill / state.battle.multiBattleCount);
        const burst = concatBurstHits.reduce((acc, cur) => acc + cur.damage, 0);
        const burstDamage = Math.floor(burst / state.battle.multiBattleCount);
        const sustained = concatSustainedHits.reduce((acc, cur) => acc + cur.damage, 0);
        const sustainedDamage = Math.floor(sustained / state.battle.multiBattleCount);
        const hits = Math.floor(allHits.length / state.battle.multiBattleCount);
        const miss = Math.floor(allHits.filter(hit => hit.damageState === "Miss").length / state.battle.multiBattleCount);
        const crit = Math.floor(allHits.filter(hit => hit.damageState === "Crit").length / state.battle.multiBattleCount);
        const dodge = Math.floor(allHits.filter(hit => hit.healthState === "Dodged").length / state.battle.multiBattleCount);
        result = {totalDamage, prePillDamage, burstDamage, sustainedDamage, hits, miss, crit, dodge};
    }

    // Calculate equipment costs
    const weaponCost = state.equipmentCosts.weapon;
    const armorCosts = state.equipmentCosts.helmet + state.equipmentCosts.chest + 
                       state.equipmentCosts.pants + state.equipmentCosts.boots + 
                       state.equipmentCosts.gloves;
    
    const weaponCostTotal = (weaponDurabilityLost / 100) * weaponCost;
    const armorCostTotal = (armorDurabilityLost / 100) * armorCosts;
    
    // Calculate buff costs
    let buffCostTotal = 0;
    let buffCostItems = [];
    
    // Pill cost (one-time per battle)
    if (state.buffs.pill) {
        const pillCost = parseFloat(document.getElementById('pillCost').value) || state.buffCosts.pill;
        buffCostTotal += pillCost;
        buffCostItems.push({label: 'Pill', cost: pillCost});
    }
    
    // Ammo cost (per hit)
    if (state.buffs.ammo) {
        let ammoCost = 0;
        if (state.buffs.ammo === 'light') {
            ammoCost = parseFloat(document.getElementById('lightAmmoCost').value) || state.buffCosts.lightAmmo;
        } else if (state.buffs.ammo === 'ammo') {
            ammoCost = parseFloat(document.getElementById('ammoCost').value) || state.buffCosts.ammo;
        } else if (state.buffs.ammo === 'heavy') {
            ammoCost = parseFloat(document.getElementById('heavyAmmoCost').value) || state.buffCosts.heavyAmmo;
        }
        const ammoTotal = result.hits * ammoCost;
        buffCostTotal += ammoTotal;
        buffCostItems.push({label: 'Ammo', cost: ammoTotal});
    }
    
    // Food cost (based on hunger consumption)
    if (state.buffs.food) {
        const currentHunger = calculateStats.hunger(state.skills.hunger);
        const totalFoodConsumed = currentHunger * (1 + 0.1 * state.battle.roundDuration);
        
        let foodCost = 0;
        if (state.buffs.food === 'bread') {
            foodCost = parseFloat(document.getElementById('breadCost').value) || state.buffCosts.bread;
        } else if (state.buffs.food === 'steak') {
            foodCost = parseFloat(document.getElementById('steakCost').value) || state.buffCosts.steak;
        } else if (state.buffs.food === 'fish') {
            foodCost = parseFloat(document.getElementById('fishCost').value) || state.buffCosts.fish;
        }
        const foodTotal = totalFoodConsumed * foodCost;
        buffCostTotal += foodTotal;
        buffCostItems.push({label: 'Food', cost: foodTotal});
    }
    
    // Calculate bounty gained
    let bountyGained = 0;
    const bountyPerK = parseFloat(document.getElementById('bountyPerKDamage').value) || state.battle.bountyPerKDamage;
    if (state.battle.bountyEnabled) {
        bountyGained = (result.totalDamage / 1000) * bountyPerK;
    }
    
    // Calculate case gains — probability-based per accurate hit
    const lootChance = calculateStats.loot(state.skills.loot);
    const accurateHitsSingle = result.hits - result.misses;
    const case1CountSingle = accurateHitsSingle * (lootChance / 100);
    const case2CountSingle = accurateHitsSingle * (lootChance / 10000);
    const caseGainsEnabled = document.getElementById('caseGainsEnabled').checked;
    const coinPerCase  = parseFloat(document.getElementById('coinPerCase').value) || 4;
    const coinPerCase2 = parseFloat(document.getElementById('coinPerCase2').value) || 33;
    const gainsFromCases = caseGainsEnabled ? (case1CountSingle * coinPerCase + case2CountSingle * coinPerCase2) : 0;
    
    // Calculate scrap gains
    const scrapGainsEnabled = document.getElementById('scrapGainsEnabled').checked;
    const coinPerScrap = parseFloat(document.getElementById('coinPerScrap').value) || 1;
    
    let totalScraps = 0;
    let weaponScraps = 0;
    let armorScraps = 0;
    
    if (scrapGainsEnabled) {
        // Calculate weapon scraps
        const weaponRarity = getRarityFromStats('weapon', state.weapon.primary, state.weapon.secondary);
        const weaponScrapsPerFull = scrapPerRarity[weaponRarity];
        weaponScraps = (weaponDurabilityLost / 100) * weaponScrapsPerFull;
        
        // Calculate armor scraps (average across all armor pieces)
        const helmetRarity = getRarityFromStats('helmet', state.armors.helmet);
        const chestRarity = getRarityFromStats('chest', state.armors.chest);
        const pantsRarity = getRarityFromStats('pants', state.armors.pants);
        const bootsRarity = getRarityFromStats('boots', state.armors.boots);
        const glovesRarity = getRarityFromStats('gloves', state.armors.gloves);
        
        const helmetScraps = (armorDurabilityLost / 100) * scrapPerRarity[helmetRarity];
        const chestScraps = (armorDurabilityLost / 100) * scrapPerRarity[chestRarity];
        const pantsScraps = (armorDurabilityLost / 100) * scrapPerRarity[pantsRarity];
        const bootsScraps = (armorDurabilityLost / 100) * scrapPerRarity[bootsRarity];
        const glovesScraps = (armorDurabilityLost / 100) * scrapPerRarity[glovesRarity];
        
        armorScraps = helmetScraps + chestScraps + pantsScraps + bootsScraps + glovesScraps;
        totalScraps = weaponScraps + armorScraps;
    }
    
    const gainsFromScraps = totalScraps * coinPerScrap;
    
    const totalCostOnly = weaponCostTotal + armorCostTotal + buffCostTotal;
    const totalCost = totalCostOnly - bountyGained - gainsFromCases - gainsFromScraps;
    
    const buffCostRows = buffCostItems.map(item =>
        `<div class="cost-row"><span class="cost-label">${item.label}</span><span class="cost-value cost-negative">-${item.cost.toFixed(2)}cc</span></div>`
    ).join('');

    return `
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-card-header">
                    <span>Combat Stats</span>
                </div>
                <div class="summary-card-body">
                    <div class="summary-stat-main">
                        <span class="stat-label">Total Damage</span>
                        <span class="stat-value-large">${formatDamage(result.totalDamage)}</span>
                    </div>
                    ${result.prePillDamage > 0 ? `<div class="summary-stat">
                        <span class="stat-label">Pre-pill Hourly Phase</span>
                        <span class="stat-value">${formatDamage(result.prePillDamage)}</span>
                    </div>` : ''}
                    <div class="summary-stat">
                        <span class="stat-label">Initial Burst Phase</span>
                        <span class="stat-value">${formatDamage(result.burstDamage)}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Sustained Phase</span>
                        <span class="stat-value">${formatDamage(result.sustainedDamage)}</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-stat">
                        <span class="stat-label" style="font-weight: 600; font-size: 13px;">Total Hits</span>
                        <span class="stat-value" style="font-weight: 600; font-size: 13px;">${result.hits}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Misses</span>
                        <span class="stat-value">${result.miss}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Crits</span>
                        <span class="stat-value">${result.crit}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Dodges</span>
                        <span class="stat-value">${result.dodge}</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-stat">
                        <span class="stat-label">Cost Per 1K Damage</span>
                        <span class="stat-value cost-negative">-${(totalCostOnly / (result.totalDamage / 1000)).toFixed(2)}cc</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Cost Per 1K Damage (Net)</span>
                        <span class="stat-value ${totalCost >= 0 ? 'cost-negative' : 'cost-bounty'}">${totalCost >= 0 ? '-' : '+'}${Math.abs(totalCost / (result.totalDamage / 1000)).toFixed(2)}cc</span>
                    </div>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="summary-card-header">
                    <span>Battle Cost</span>
                </div>
                <div class="summary-card-body">
                    <div class="cost-row">
                        <span class="cost-label">Weapon (${weaponDurabilityLost}% Durability)</span>
                        <span class="cost-value cost-negative">-${weaponCostTotal.toFixed(2)}cc</span>
                    </div>
                    <div class="cost-row">
                        <span class="cost-label">Armor (${armorDurabilityLost}% Durability)</span>
                        <span class="cost-value cost-negative">-${armorCostTotal.toFixed(2)}cc</span>
                    </div>
                    ${buffCostRows}
                    <div class="cost-row">
                        <span class="cost-label" style="font-weight: 600; font-size: 13px;">Total Cost</span>
                        <span class="cost-value cost-negative" style="font-weight: 600; font-size: 13px;">-${totalCostOnly.toFixed(2)}cc</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="cost-row">
                        <span class="cost-label">Cases From Hits</span>
                        <span class="cost-value">${casesFromHits} cases</span>
                    </div>
                    <div class="cost-row">
                        <span class="cost-label">Cases From Ranking (Estimated)</span>
                        <span class="cost-value">${casesFromRanking} cases</span>
                    </div>
                    <div class="cost-row">
                        <span class="cost-label">Case Gains</span>
                        <span class="cost-value cost-bounty">+${gainsFromCases.toFixed(2)}cc</span>
                    </div>
                    <div class="cost-row">
                        <span class="cost-label">Scrap Gains (${Math.round(totalScraps)} scraps)</span>
                        <span class="cost-value cost-bounty">+${gainsFromScraps.toFixed(2)}cc</span>
                    </div>
                    <div class="cost-row">
                        <span class="cost-label">Bounty Gains</span>
                        <span class="cost-value cost-bounty">+${bountyGained.toFixed(2)}cc</span>
                    </div>
                    <div class="cost-row cost-total">
                        <span class="cost-label">Net Balance</span>
                        <span class="cost-value">${totalCost > 0 ? '-' : '+'}${Math.abs(totalCost).toFixed(2)}cc</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function simulateForState(set) {
    const simType = set.battle.type || 'single';
    const battleCount = set.battle.multiBattleCount || 10000;

    if (simType === 'single') {
        let prePillResult = null;
        let initialWeaponDurability = 100;
        let initialArmorDurability = 100;

        if (set.battle.prePillPhaseEnabled) {
            const prePillHealth = getPrePillPhaseHealth(set);
            const setWithoutPill = {...set, buffs: {...set.buffs, pill: false}};
            prePillResult = simulateBattle(setWithoutPill, prePillHealth, 100, 100);
            initialWeaponDurability = prePillResult.remainingWeaponDurability;
            initialArmorDurability = prePillResult.remainingArmorDurability;
        }

        const initialHealth = getInitialHealth(set);
        const burstResult = simulateBattle(set, initialHealth, initialWeaponDurability, initialArmorDurability);
        const recoveredHealth = getRecoveredHealth(set);
        const sustainedResult = simulateBattle(set, recoveredHealth, burstResult.remainingWeaponDurability, burstResult.remainingArmorDurability);

        const totalWeaponDurabilityLost = (prePillResult?.weaponDurabilityLost || 0) + burstResult.weaponDurabilityLost + sustainedResult.weaponDurabilityLost;
        const totalArmorDurabilityLost = (prePillResult?.armorDurabilityLost || 0) + burstResult.armorDurabilityLost + sustainedResult.armorDurabilityLost;

        return renderBattleSummary(
            prePillResult?.hits || [],
            burstResult.hits,
            sustainedResult.hits,
            totalWeaponDurabilityLost,
            totalArmorDurabilityLost
        );
    } else {
        const allPrePillHits = [];
        const allBurstHits = [];
        const allSustainedHits = [];
        let totalWeaponDurabilityLost = 0;
        let totalArmorDurabilityLost = 0;

        for (let i = 0; i < battleCount; i++) {
            let prePillResult = null;
            let initialWeaponDurability = 100;
            let initialArmorDurability = 100;

            if (set.battle.prePillPhaseEnabled) {
                const prePillHealth = getPrePillPhaseHealth(set);
                const setWithoutPill = {...set, buffs: {...set.buffs, pill: false}};
                prePillResult = simulateBattle(setWithoutPill, prePillHealth, 100, 100);
                initialWeaponDurability = prePillResult.remainingWeaponDurability;
                initialArmorDurability = prePillResult.remainingArmorDurability;
                allPrePillHits.push(...prePillResult.hits);
            }

            const initialHealth = getInitialHealth(set);
            const burstResult = simulateBattle(set, initialHealth, initialWeaponDurability, initialArmorDurability);
            const recoveredHealth = getRecoveredHealth(set);
            const sustainedResult = simulateBattle(set, recoveredHealth, burstResult.remainingWeaponDurability, burstResult.remainingArmorDurability);

            allBurstHits.push(...burstResult.hits);
            allSustainedHits.push(...sustainedResult.hits);
            totalWeaponDurabilityLost += (prePillResult?.weaponDurabilityLost || 0) + burstResult.weaponDurabilityLost + sustainedResult.weaponDurabilityLost;
            totalArmorDurabilityLost += (prePillResult?.armorDurabilityLost || 0) + burstResult.armorDurabilityLost + sustainedResult.armorDurabilityLost;
        }

        const avgWeaponDurabilityLost = Math.floor(totalWeaponDurabilityLost / battleCount);
        const avgArmorDurabilityLost = Math.floor(totalArmorDurabilityLost / battleCount);

        return renderBattleSummary(
            allPrePillHits,
            allBurstHits,
            allSustainedHits,
            avgWeaponDurabilityLost,
            avgArmorDurabilityLost
        );
    }
}

function runSimulation() {
    // Multi-stage is always enabled
    runMultiStageSimulation();
    return;
    // Legacy single-stage path (kept for compatibility, unreachable)
    if (false && state.multiStage && state.multiStage.enabled) {
        runMultiStageSimulation();
        return;
    }

    document.getElementById('simulation-hint').style.display = 'none';
    const button = document.getElementById('runSimButton');
    button.disabled = true;

    setTimeout(() => {
        button.disabled = false;
    }, 200);

    const simType = document.querySelector('input[name="simType"]:checked').value;
    state.battle.type = simType;

    let battleCount = parseInt(document.getElementById('battleCount').value) || 10000;
    battleCount = battleCount > 10000 ? 10000 : battleCount;
    state.battle.multiBattleCount = battleCount;

    saveState();
    const set = state;

    if (simType === 'single') {
        let prePillResult = null;
        let initialWeaponDurability = 100;
        let initialArmorDurability = 100;
        
        // Pre-pill phase if enabled
        if (state.battle.prePillPhaseEnabled) {
            const prePillHealth = getPrePillPhaseHealth(set);
            const setWithoutPill = {...set, buffs: {...set.buffs, pill: false}};
            prePillResult = simulateBattle(setWithoutPill, prePillHealth, 100, 100);
            initialWeaponDurability = prePillResult.remainingWeaponDurability;
            initialArmorDurability = prePillResult.remainingArmorDurability;
        }
        
        const initialHealth = getInitialHealth(set);
        const burstResult = simulateBattle(set, initialHealth, initialWeaponDurability, initialArmorDurability);
        const recoveredHealth = getRecoveredHealth(set);
        const sustainedResult = simulateBattle(set, recoveredHealth, burstResult.remainingWeaponDurability, burstResult.remainingArmorDurability);

        const totalWeaponDurabilityLost = (prePillResult?.weaponDurabilityLost || 0) + burstResult.weaponDurabilityLost + sustainedResult.weaponDurabilityLost;
        const totalArmorDurabilityLost = (prePillResult?.armorDurabilityLost || 0) + burstResult.armorDurabilityLost + sustainedResult.armorDurabilityLost;

        document.getElementById('damageSummary').innerHTML = renderBattleSummary(
            prePillResult?.hits || [],
            burstResult.hits, 
            sustainedResult.hits, 
            totalWeaponDurabilityLost, 
            totalArmorDurabilityLost
        );
        document.getElementById('hitLog').textContent = renderCombatLog(
            prePillResult ? [prePillResult.hits] : [], 
            [burstResult.hits], 
            [sustainedResult.hits]
        );
    } else {
        const allPrePillHits = [];
        const allBurstHits = [];
        const allSustainedHits = [];
        const damagePerBattle = [];
        let totalWeaponDurabilityLost = 0;
        let totalArmorDurabilityLost = 0;

        for (let i = 0; i < battleCount; i++) {
            let prePillResult = null;
            let initialWeaponDurability = 100;
            let initialArmorDurability = 100;
            
            // Pre-pill phase if enabled
            if (state.battle.prePillPhaseEnabled) {
                const prePillHealth = getPrePillPhaseHealth(set);
                const setWithoutPill = {...set, buffs: {...set.buffs, pill: false}};
                prePillResult = simulateBattle(setWithoutPill, prePillHealth, 100, 100);
                initialWeaponDurability = prePillResult.remainingWeaponDurability;
                initialArmorDurability = prePillResult.remainingArmorDurability;
                allPrePillHits.push(...prePillResult.hits);
            }
            
            const initialHealth = getInitialHealth(set);
            const burstResult = simulateBattle(set, initialHealth, initialWeaponDurability, initialArmorDurability);
            const recoveredHealth = getRecoveredHealth(set);
            const sustainedResult = simulateBattle(set, recoveredHealth, burstResult.remainingWeaponDurability, burstResult.remainingArmorDurability);
            
            allBurstHits.push(...burstResult.hits);
            allSustainedHits.push(...sustainedResult.hits);
            totalWeaponDurabilityLost += (prePillResult?.weaponDurabilityLost || 0) + burstResult.weaponDurabilityLost + sustainedResult.weaponDurabilityLost;
            totalArmorDurabilityLost += (prePillResult?.armorDurabilityLost || 0) + burstResult.armorDurabilityLost + sustainedResult.armorDurabilityLost;
            
            const prePillDamage = prePillResult ? prePillResult.hits.reduce((acc, cur) => acc + cur.damage, 0) : 0;
            const totalDamage = prePillDamage +
                                burstResult.hits.reduce((acc, cur) => acc + cur.damage, 0) +
                                sustainedResult.hits.reduce((acc, cur) => acc + cur.damage, 0);
            damagePerBattle.push(totalDamage);
        }

        const avgWeaponDurabilityLost = Math.floor(totalWeaponDurabilityLost / battleCount);
        const avgArmorDurabilityLost = Math.floor(totalArmorDurabilityLost / battleCount);

        const log = damagePerBattle.map((dmg, i) => `[Battle ${i + 1}] - Damage: ${dmg}`).join('\n');
        document.getElementById('damageSummary').innerHTML = renderBattleSummary(
            allPrePillHits,
            allBurstHits, 
            allSustainedHits, 
            avgWeaponDurabilityLost, 
            avgArmorDurabilityLost
        );
        document.getElementById('hitLog').textContent = log;
    }
        
    document.getElementById('damageSummary').style.display = 'block';

    if (state.battle.showCombatLog) {
        document.getElementById('hitLog').style.display = 'block';
    } else {
        document.getElementById('hitLog').style.display = 'none';
    }
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    let value = this.getItem(key);
    return value && JSON.parse(value);
}

function resetSkills() {
    state.usedSkillPoints = 0;
    state.totalSkillPoints = 0;
    state.level = 0;
    
    state.skills = {
        attack: 0,
        precision: 0,
        critChance: 0,
        critDamage: 0,
        armor: 0,
        dodge: 0,
        health: 0,
        hunger: 0,
        companies: 0,
        loot: 0,
        entrepreneurship: 0,
        energy: 0,
        production: 0,
        management: 0
    };

    document.getElementById('attack-value').textContent = state.skills.attack;
    document.getElementById('precision-value').textContent = state.skills.precision;
    document.getElementById('critChance-value').textContent = state.skills.critChance;
    document.getElementById('critDamage-value').textContent = state.skills.critDamage;
    document.getElementById('armor-value').textContent = state.skills.armor;
    document.getElementById('dodge-value').textContent = state.skills.dodge;
    document.getElementById('health-value').textContent = state.skills.health;
    document.getElementById('hunger-value').textContent = state.skills.hunger;
    document.getElementById('companies-value').textContent = state.skills.companies;
    document.getElementById('loot-value').textContent = state.skills.loot;
    document.getElementById('entrepreneurship-value').textContent = state.skills.entrepreneurship;
    document.getElementById('energy-value').textContent = state.skills.energy;
    document.getElementById('production-value').textContent = state.skills.production;
    document.getElementById('management-value').textContent = state.skills.management;
    updateSkillBonuses();
    renderSkills();
    saveState();
}

function formatDamage(damage) {
    if (damage >= 1000000) {
        return (damage / 1000000).toFixed(3).replace(/\.?0+$/, '') + 'M';
    } else if (damage >= 1000) {
        return (damage / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
    }
    return damage.toString();
}

function getRarityFromStats(itemType, value1, value2) {
    if (itemType === 'weapon') {
        const attack = value1 || 0;
        const crit = value2 || 0;
        if (attack >= 221 && crit >= 41) return 'red';
        else if (attack >= 141 && crit >= 26) return 'yellow';
        else if (attack >= 101 && crit >= 16) return 'purple';
        else if (attack >= 71  && crit >= 11) return 'blue';
        else if (attack >= 51  && crit >= 6)  return 'green';
        else return 'gray';
    } else if (itemType === 'helmet') {
        const v = value1 || 0;
        if (v >= 121) return 'red';
        else if (v >= 91) return 'yellow';
        else if (v >= 71) return 'purple';
        else if (v >= 31) return 'blue';
        else if (v >= 16) return 'green';
        else return 'gray';
    } else if (itemType === 'chest' || itemType === 'pants') {
        const v = value1 || 0;
        if (v >= 56) return 'red';
        else if (v >= 36) return 'yellow';
        else if (v >= 21) return 'purple';
        else if (v >= 11) return 'blue';
        else if (v >= 6)  return 'green';
        else return 'gray';
    } else {
        // boots, gloves
        const v = value1 || 0;
        if (v >= 51) return 'red';
        else if (v >= 31) return 'yellow';
        else if (v >= 21) return 'purple';
        else if (v >= 11) return 'blue';
        else if (v >= 6)  return 'green';
        else return 'gray';
    }
}

function init() {
    default_bonuses = state.bonuses;
    default_flags = state.featureFlags;
    default_battle = state.battle;
    // Always load latest state (includes unsaved changes)
    const savedState = localStorage.getObject("warera-state");
    if (savedState) {
        state = savedState;
    }
    console.log("Initial state:");
    console.dir(state);

    if (state.skills.companies === undefined || state.skills.companies === null) {
        state.skills.companies = 0;
    }

    if (state.skills.loot === undefined || state.skills.loot === null) {
        state.skills.loot = 0;
    }

    if (state.skills.entrepreneurship === undefined || state.skills.entrepreneurship === null) {
        state.skills.entrepreneurship = 0;
    }

    if (state.skills.energy === undefined || state.skills.energy === null) {
        state.skills.energy = 0;
    }

    if (state.skills.production === undefined || state.skills.production === null) {
        state.skills.production = 0;
    }

    if (state.skills.management === undefined || state.skills.management === null) {
        state.skills.management = 0;
    }

    if (state.militaryRankBonus === undefined || state.militaryRankBonus === null) {
        state.militaryRankBonus = 10;
    }

    if (!state.bonuses) {
        state.bonuses = default_bonuses;
    }

    if (!state.featureFlags) {
        state.featureFlags = default_flags;
    }

    if (!state.featureFlags.skillsResetted) {
        state.featureFlags.skillsResetted = true;
        resetSkills();
    }

    if (!state.battle) {
        state.battle = default_battle;
    } else if (state.battle.roundDuration != 8) {
        state.battle.roundDuration = 8;
    } else if (state.battle.weaponDurabilityLimit === null || state.battle.weaponDurabilityLimit === undefined) {
        state.battle.weaponDurabilityLimit = false;
    } else if (state.battle.armorDurabilityLimit === null || state.battle.armorDurabilityLimit === undefined) {
        state.battle.armorDurabilityLimit = false;
    }
    
    if (state.battle.bountyEnabled === null || state.battle.bountyEnabled === undefined) {
        state.battle.bountyEnabled = false;
    }
    
    if (state.battle.bountyPerKDamage === null || state.battle.bountyPerKDamage === undefined) {
        state.battle.bountyPerKDamage = 0.5;
    }
    
    if (state.battle.caseGainsEnabled === null || state.battle.caseGainsEnabled === undefined) {
        state.battle.caseGainsEnabled = false;
    }
    
    if (state.battle.coinPerCase === null || state.battle.coinPerCase === undefined) {
        state.battle.coinPerCase = 4;
    }
    if (state.battle.coinPerCase2 === null || state.battle.coinPerCase2 === undefined) {
        state.battle.coinPerCase2 = 33;
    }
    
    if (state.battle.scrapGainsEnabled === null || state.battle.scrapGainsEnabled === undefined) {
        state.battle.scrapGainsEnabled = true;
    }
    
    if (state.battle.coinPerScrap === null || state.battle.coinPerScrap === undefined) {
        state.battle.coinPerScrap = 0.3;
    }

    // Multi-stage migration
    if (!state.multiStage) {
        state.multiStage = {
            enabled: true,
            loadouts: [getDefaultLoadout()],
            stages: [{ loadoutIndex: 0, phase: "prePill" }]
        };
    }
    // Always enable multi-stage
    state.multiStage.enabled = true;
    document.getElementById('multiStageEnabled').checked = true;
    document.getElementById('multiStageSection').style.display = '';

    // Weapons pool migration (Change 2)
    if (!state.multiStage.weapons) {
        state.multiStage.weapons = state.multiStage.loadouts.map(function(loadout, i) {
            return {
                name: loadout.name || String.fromCharCode(65 + i),
                primary: loadout.weapon ? loadout.weapon.primary : 90,
                secondary: loadout.weapon ? loadout.weapon.secondary : 15,
                cost: loadout.equipmentCosts ? (loadout.equipmentCosts.weapon || 30) : 30,
                phase: 'prePill'
            };
        });
        state.multiStage.stages.forEach(function(stage, s) {
            if (stage.weaponIndex === undefined) {
                stage.weaponIndex = Math.min(stage.loadoutIndex, state.multiStage.weapons.length - 1);
            }
        });
    }

    // Phase migration: ensure all weapons and loadouts have a phases array
    state.multiStage.weapons.forEach(function(w) {
        if (!Array.isArray(w.phases)) w.phases = w.phase ? [w.phase] : ['prePill'];
        delete w.phase;
    });
    state.multiStage.loadouts.forEach(function(l) {
        if (!Array.isArray(l.phases)) l.phases = l.phase ? [l.phase] : ['prePill'];
        delete l.phase;
    });
    if (state.scrapBalance === undefined) state.scrapBalance = 0;

    renderMultiStageUI();

    if (state.buffs.pill) {
        document.getElementById('buffPill').classList.add('active', 'buff-rarity-purple');
        document.getElementById('buffPillStatsBox').classList.add('buff-stats-rarity-purple');
    } else {
        document.getElementById('buffPill').classList.remove('active', 'buff-rarity-purple');
        document.getElementById('buffPillStatsBox').classList.remove('buff-stats-rarity-purple');
    }

    if (state.buffs.ammo === 'heavy') {
        document.getElementById('buffHeavy').classList.add('active', 'buff-rarity-purple');
        document.getElementById('buffHeavyStatsBox').classList.add('buff-stats-rarity-purple');
    } else {
        document.getElementById('buffHeavy').classList.remove('active', 'buff-rarity-purple');
        document.getElementById('buffHeavyStatsBox').classList.remove('buff-stats-rarity-purple');
    }
    
    if (state.buffs.ammo === 'ammo') {
        document.getElementById('buffAmmo').classList.add('active', 'buff-rarity-blue');
        document.getElementById('buffAmmoStatsBox').classList.add('buff-stats-rarity-blue');
    } else {
        document.getElementById('buffAmmo').classList.remove('active', 'buff-rarity-blue');
        document.getElementById('buffAmmoStatsBox').classList.remove('buff-stats-rarity-blue');
    }

    if (state.buffs.ammo === 'light') {
        document.getElementById('buffLight').classList.add('active', 'buff-rarity-green');
        document.getElementById('buffLightStatsBox').classList.add('buff-stats-rarity-green');
    } else {
        document.getElementById('buffLight').classList.remove('active', 'buff-rarity-green');
        document.getElementById('buffLightStatsBox').classList.remove('buff-stats-rarity-green');
    }

    if (state.buffs.food === 'bread') {
        document.getElementById('buffBread').classList.add('active', 'buff-rarity-green');
        document.getElementById('buffBreadStatsBox').classList.add('buff-stats-rarity-green');
    } else {
        document.getElementById('buffBread').classList.remove('active', 'buff-rarity-green');
        document.getElementById('buffBreadStatsBox').classList.remove('buff-stats-rarity-green');
    }

    if (state.buffs.food === 'fish') {
        document.getElementById('buffFish').classList.add('active', 'buff-rarity-purple');
        document.getElementById('buffFishStatsBox').classList.add('buff-stats-rarity-purple');
    } else {
        document.getElementById('buffFish').classList.remove('active', 'buff-rarity-purple');
        document.getElementById('buffFishStatsBox').classList.remove('buff-stats-rarity-purple');
    }

    if (state.buffs.food === 'steak') {
        document.getElementById('buffSteak').classList.add('active', 'buff-rarity-blue');
        document.getElementById('buffSteakStatsBox').classList.add('buff-stats-rarity-blue');
    } else {
        document.getElementById('buffSteak').classList.remove('active', 'buff-rarity-blue');
        document.getElementById('buffSteakStatsBox').classList.remove('buff-stats-rarity-blue');
    }

    if (state.battle.type === 'single') {
        document.getElementById('singleSim').checked = true;
    } else {
        document.getElementById('multipleSim').checked = true;
    }

    if (state.battle.showCombatLog) {
        document.getElementById('hitLog').style.display = 'block';
        document.getElementById('showCombatLog').checked = true;
    } else {
        document.getElementById('hitLog').style.display = 'none';
        document.getElementById('showCombatLog').checked = false;
    }

    document.getElementById('weaponDurabilityLimit').checked = state.battle.weaponDurabilityLimit || false;
    document.getElementById('armorDurabilityLimit').checked = state.battle.armorDurabilityLimit || false;
    document.getElementById('bountyEnabled').checked = state.battle.bountyEnabled || false;
    document.getElementById('prePillPhaseEnabled').checked = state.battle.prePillPhaseEnabled || false;
    document.getElementById('prePillPhaseHours').value = state.battle.prePillPhaseHours || 6;
    document.getElementById('bountyPerKDamage').value = state.battle.bountyPerKDamage || 0.5;
    document.getElementById('caseGainsEnabled').checked = state.battle.caseGainsEnabled || false;
    document.getElementById('coinPerCase').value = state.battle.coinPerCase || 4;
    document.getElementById('coinPerCase2').value = state.battle.coinPerCase2 || 33;
    document.getElementById('scrapGainsEnabled').checked = state.battle.scrapGainsEnabled !== undefined ? state.battle.scrapGainsEnabled : true;
    document.getElementById('coinPerScrap').value = state.battle.coinPerScrap || 0.3;
    document.getElementById('damageSummary').style.display = 'none';
    document.getElementById('level-value').textContent = state.level;
    if (document.getElementById('level-input')) document.getElementById('level-input').value = state.level;
    document.getElementById('military-rank-bonus').value = state.militaryRankBonus || 10;
    document.getElementById('attack-value').textContent = state.skills.attack;
    document.getElementById('precision-value').textContent = state.skills.precision;
    document.getElementById('critChance-value').textContent = state.skills.critChance;
    document.getElementById('critDamage-value').textContent = state.skills.critDamage;
    document.getElementById('armor-value').textContent = state.skills.armor;
    document.getElementById('dodge-value').textContent = state.skills.dodge;
    document.getElementById('health-value').textContent = state.skills.health;
    document.getElementById('hunger-value').textContent = state.skills.hunger;
    document.getElementById('companies-value').textContent = state.skills.companies;
    document.getElementById('loot-value').textContent = state.skills.loot;
    document.getElementById('management-value').textContent = state.skills.management;
    document.getElementById('entrepreneurship-value').textContent = state.skills.entrepreneurship;
    document.getElementById('energy-value').textContent = state.skills.energy;
    document.getElementById('production-value').textContent = state.skills.production;
    document.getElementById('helmet').value = state.armors.helmet;
    document.getElementById('chest').value = state.armors.chest;
    document.getElementById('pants').value = state.armors.pants;
    document.getElementById('boots').value = state.armors.boots;
    document.getElementById('gloves').value = state.armors.gloves;
    document.getElementById('primaryWeapon').value = state.weapon.primary;
    document.getElementById('secondaryWeapon').value = state.weapon.secondary;
    
    // Initialize equipment costs if not present
    if (!state.equipmentCosts) {
        state.equipmentCosts = {
            weapon: 30,
            helmet: 30,
            chest: 30,
            pants: 30,
            boots: 30,
            gloves: 30
        };
    }
    
    // Always sync rarity costs to current defaults (overrides stale localStorage values)
    state.weaponRarityCosts = { ...rarityCostsDefaults };
    state.armorRarityCosts  = { ...rarityCostsDefaults };

    // Always calculate costs based on current equipment stats and saved rarity costs
    const weaponRarity = getRarityFromStats('weapon', state.weapon.primary, state.weapon.secondary);
    state.equipmentCosts.weapon = state.weaponRarityCosts[weaponRarity];

    const helmetRarity = getRarityFromStats('helmet', state.armors.helmet);
    state.equipmentCosts.helmet = state.armorRarityCosts[helmetRarity];

    // Other armors (chest, pants, boots, gloves)
    const armorPieces = ['chest', 'pants', 'boots', 'gloves'];
    armorPieces.forEach(piece => {
        const rarity = getRarityFromStats(piece, state.armors[piece]);
        state.equipmentCosts[piece] = state.armorRarityCosts[rarity];
    });

    // Hidden cost inputs kept for JS compat
    const wcEl = document.getElementById('weaponCost'); if (wcEl) wcEl.value = state.equipmentCosts.weapon;
    const hcEl = document.getElementById('helmetCost'); if (hcEl) hcEl.value = state.equipmentCosts.helmet;
    const ccEl = document.getElementById('chestCost'); if (ccEl) ccEl.value = state.equipmentCosts.chest;
    const pcEl = document.getElementById('pantsCost'); if (pcEl) pcEl.value = state.equipmentCosts.pants;
    const bcEl = document.getElementById('bootsCost'); if (bcEl) bcEl.value = state.equipmentCosts.boots;
    const gcEl = document.getElementById('glovesCost'); if (gcEl) gcEl.value = state.equipmentCosts.gloves;

    // Initialize buff costs if not present
    if (!state.buffCosts) {
        state.buffCosts = {
            pill: 22.00,
            lightAmmo: 0.12,
            ammo: 0.46,
            heavyAmmo: 1.94,
            bread: 0.90,
            steak: 2.00,
            fish: 4.50
        };
    }
    
    document.getElementById('pillCost').value = state.buffCosts.pill;
    document.getElementById('lightAmmoCost').value = state.buffCosts.lightAmmo;
    document.getElementById('ammoCost').value = state.buffCosts.ammo;
    document.getElementById('heavyAmmoCost').value = state.buffCosts.heavyAmmo;
    document.getElementById('breadCost').value = state.buffCosts.bread;
    document.getElementById('steakCost').value = state.buffCosts.steak;
    document.getElementById('fishCost').value = state.buffCosts.fish;
    
    // Initialize battle type
    if (!state.battleType) state.battleType = 'attack';
    document.querySelectorAll('.battle-type-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(state.battleType + 'Tab').classList.add('active');

    // Initialize default bonus toggles
    ['countryOrder', 'muOrder', 'muHeadquarters'].forEach(key => {
        const toggleKey = key + 'Toggle';
        if (!state.bonuses.hasOwnProperty(toggleKey)) state.bonuses[toggleKey] = false;
        const element = document.getElementById(toggleKey);
        if (state.bonuses[toggleKey]) { element.classList.add('active'); }
        else { element.classList.remove('active'); }
    });

    // Initialize type-specific bonus toggles
    ['ally', 'swornEnemy', 'patriotic'].forEach(key => {
        if (!state.bonuses.hasOwnProperty(key)) state.bonuses[key] = false;
        const element = document.getElementById(key + 'Toggle');
        if (state.bonuses[key]) { element.classList.add('active'); }
        else { element.classList.remove('active'); }
    });

    // Initialize base dropdown
    if (!state.bonuses.hasOwnProperty('base')) state.bonuses.base = 0;
    document.getElementById('baseSelect').value = state.bonuses.base;

    // Initialize bunker dropdown
    if (!state.bonuses.hasOwnProperty('bunker')) state.bonuses.bunker = 0;
    document.getElementById('bunkerSelect').value = state.bonuses.bunker;

    // Initialize resistance dropdown
    if (!state.bonuses.hasOwnProperty('resistance')) state.bonuses.resistance = 0;
    document.getElementById('resistanceSelect').value = state.bonuses.resistance;

    // Initialize fanatic ethics dropdown
    const fanaticBonuses = ['fanaticMilitarist', 'fanaticIsolationist', 'fanaticPacifist', 'fanaticDiplomatic'];
    let activeFanatic = 'none';
    fanaticBonuses.forEach(key => {
        if (!state.bonuses.hasOwnProperty(key)) state.bonuses[key] = false;
        if (state.bonuses[key]) activeFanatic = key;
    });
    document.getElementById('fanaticSelect').value = activeFanatic;

    // Initialize basic ethics dropdown
    const basicBonuses = ['militarist', 'isolationist', 'pacifist', 'diplomatic'];
    let activeBasic = 'none';
    basicBonuses.forEach(key => {
        if (!state.bonuses.hasOwnProperty(key)) state.bonuses[key] = false;
        if (state.bonuses[key]) activeBasic = key;
    });
    document.getElementById('basicSelect').value = activeBasic;

    updateBonusAvailability();

    // Migrate: ensure direct bonus field exists
    if (!state.bonuses.hasOwnProperty('direct')) state.bonuses.direct = 0;
    const battleBonusEl = document.getElementById('battle-bonus-direct');
    if (battleBonusEl) battleBonusEl.value = state.bonuses.direct;

    // Migrate: ensure food field exists on all loadouts
    state.multiStage.loadouts.forEach(loadout => {
        if (!loadout.hasOwnProperty('food')) loadout.food = null;
        if (!loadout.hasOwnProperty('equipmentCosts')) {
            loadout.equipmentCosts = { weapon: 2, helmet: 2, chest: 2, pants: 2, boots: 2, gloves: 2 };
        }
    });

    updateSkillBonuses();
    renderSkills();
    updateTotalBonus();
    updateCurrentStatsDisplay();

    ["weapon", "helmet", "chest", "pants", "boots", "gloves"]
      .map((type) => updateEquipmentRarity(type));

    currentBuildName = localStorage.getItem("warera-current-build") || "";
    saveBuildSnapshot();
    populateBuildsDropdown();
}

document.addEventListener('DOMContentLoaded', function() {
    init();
    // Auto-save every 30 seconds to protect against crashes/refreshes
    setInterval(() => { try { saveState(); } catch(e) {} }, 30000);
    // Save on page unload (refresh, close, navigate away)
    window.addEventListener('beforeunload', () => { try { saveState(); } catch(e) {} });
    // Restore saved language
    const savedLang = localStorage.getItem('warera-lang') || 'pt';
    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = savedLang;
    setLanguage(savedLang);
    document.addEventListener('click', () => setTimeout(updateBuildDirtyIndicator, 50));
    document.addEventListener('input', () => setTimeout(updateBuildDirtyIndicator, 50));
});

document.getElementById('showCombatLog').addEventListener("change", (event) => {
    state.battle.showCombatLog = event.target.checked;
});

document.getElementById('weaponDurabilityLimit').addEventListener("change", (event) => {
    if (event.target.checked) {
        document.getElementById('armorDurabilityLimit').checked = false;
        state.battle.armorDurabilityLimit = false;
        state.battle.weaponDurabilityLimit = true;
    } else {
        state.battle.weaponDurabilityLimit = false;
    }
});

document.getElementById('armorDurabilityLimit').addEventListener("change", (event) => {
    if (event.target.checked) {
        document.getElementById('weaponDurabilityLimit').checked = false;
        state.battle.weaponDurabilityLimit = false;
        state.battle.armorDurabilityLimit = true;
    } else {
        state.battle.armorDurabilityLimit = false;
    }
});

document.getElementById('prePillPhaseEnabled').addEventListener("change", (event) => {
    state.battle.prePillPhaseEnabled = event.target.checked;
});

document.getElementById('prePillPhaseHours').addEventListener("change", (event) => {
    let value = parseFloat(event.target.value) || 6;
    value = Math.max(0, Math.min(16, value)); // Limit between 0-16 hours
    state.battle.prePillPhaseHours = value;
    document.getElementById('prePillPhaseHours').value = value;
    updateHealthTrail();
});

document.getElementById('primaryWeapon').addEventListener("change", (event) => {
    state.weapon.primary = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

document.getElementById('secondaryWeapon').addEventListener("change", (event) => {
    state.weapon.secondary = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

document.getElementById('helmet').addEventListener("change", (event) => {
    state.armors.helmet = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

document.getElementById('chest').addEventListener("change", (event) => {
    state.armors.chest = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

document.getElementById('pants').addEventListener("change", (event) => {
    state.armors.pants = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

document.getElementById('boots').addEventListener("change", (event) => {
    state.armors.boots = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

document.getElementById('gloves').addEventListener("change", (event) => {
    state.armors.gloves = parseInt(event.target.value) || 0;
    updateCurrentStatsDisplay();
});

function handleEquipmentCostChange(itemType, newCost) {
    state.equipmentCosts[itemType] = newCost;

    // Determine rarity of this equipment piece
    let rarity;
    if (itemType === 'weapon') {
        rarity = getRarityFromStats('weapon', state.weapon.primary, state.weapon.secondary);
        state.weaponRarityCosts[rarity] = newCost;
    } else {
        const statValue = state.armors[itemType];
        rarity = getRarityFromStats(itemType, statValue);
        state.armorRarityCosts[rarity] = newCost;

        // Propagate to all other armor pieces with the same rarity
        const armorPieces = ['helmet', 'chest', 'pants', 'boots', 'gloves'];
        armorPieces.forEach(piece => {
            if (piece === itemType) return;
            const pieceRarity = getRarityFromStats(piece, state.armors[piece]);
            if (pieceRarity === rarity) {
                state.equipmentCosts[piece] = newCost;
                document.getElementById(piece + 'Cost').value = newCost;
            }
        });
    }

    saveState();
}

document.getElementById('weaponCost').addEventListener("change", (event) => {
    handleEquipmentCostChange('weapon', parseInt(event.target.value) || 0);
});

document.getElementById('helmetCost').addEventListener("change", (event) => {
    handleEquipmentCostChange('helmet', parseInt(event.target.value) || 0);
});

document.getElementById('chestCost').addEventListener("change", (event) => {
    handleEquipmentCostChange('chest', parseInt(event.target.value) || 0);
});

document.getElementById('pantsCost').addEventListener("change", (event) => {
    handleEquipmentCostChange('pants', parseInt(event.target.value) || 0);
});

document.getElementById('bootsCost').addEventListener("change", (event) => {
    handleEquipmentCostChange('boots', parseInt(event.target.value) || 0);
});

document.getElementById('glovesCost').addEventListener("change", (event) => {
    handleEquipmentCostChange('gloves', parseInt(event.target.value) || 0);
});

document.getElementById('pillCost').addEventListener("change", (event) => {
    state.buffCosts.pill = parseFloat(event.target.value) || 0;
});

document.getElementById('lightAmmoCost').addEventListener("change", (event) => {
    state.buffCosts.lightAmmo = parseFloat(event.target.value) || 0;
});

document.getElementById('ammoCost').addEventListener("change", (event) => {
    state.buffCosts.ammo = parseFloat(event.target.value) || 0;
});

document.getElementById('heavyAmmoCost').addEventListener("change", (event) => {
    state.buffCosts.heavyAmmo = parseFloat(event.target.value) || 0;
});

document.getElementById('breadCost').addEventListener("change", (event) => {
    state.buffCosts.bread = parseFloat(event.target.value) || 0;
});

document.getElementById('steakCost').addEventListener("change", (event) => {
    state.buffCosts.steak = parseFloat(event.target.value) || 0;
});

document.getElementById('fishCost').addEventListener("change", (event) => {
    state.buffCosts.fish = parseFloat(event.target.value) || 0;
});

document.getElementById('bountyEnabled').addEventListener("change", (event) => {
    state.battle.bountyEnabled = event.target.checked;
});

document.getElementById('caseGainsEnabled').addEventListener("change", (event) => {
    state.battle.caseGainsEnabled = event.target.checked;
});

document.getElementById('coinPerCase').addEventListener("input", (event) => {
    state.battle.coinPerCase = parseFloat(event.target.value) || 4;
});

document.getElementById('coinPerCase2').addEventListener("input", (event) => {
    state.battle.coinPerCase2 = parseFloat(event.target.value) || 33;
});

document.getElementById('scrapGainsEnabled').addEventListener("change", (event) => {
    state.battle.scrapGainsEnabled = event.target.checked;
});

document.getElementById('coinPerScrap').addEventListener("input", (event) => {
    state.battle.coinPerScrap = parseFloat(event.target.value) || 0.3;
});

document.getElementById('bountyPerKDamage').addEventListener("change", (event) => {
    let value = parseFloat(event.target.value) || 0.5;
    if (value < 0) value = 0;
    if (value > 2) value = 2;
    event.target.value = value;
    state.battle.bountyPerKDamage = value;
});

// Old bonus event listeners removed - now handled by onclick/onchange in HTML

function changeSkill(skillName, change) {
    const currentLevel = state.skills[skillName];
    const newLevel = currentLevel + change;
    const stagingLevel = change === 1
        ? state.usedSkillPoints + newLevel
        : state.usedSkillPoints - newLevel - 1;

    if (stagingLevel > state.totalSkillPoints && change === 1) {
        return;
    } else if (newLevel < MIN_SKILL_LEVEL || newLevel > MAX_SKILL_LEVEL) {
        return;
    }

    state.usedSkillPoints = stagingLevel;
    state.skills[skillName] = newLevel;
    renderSkills();
    updateCurrentStatsDisplay();

    const valueElement = document.getElementById(skillName + '-value');
    if (valueElement) {
        valueElement.textContent = newLevel;
    }
    
    updateSkillBonuses();
    
    const skillItem = valueElement.closest('.skill-item');
    skillItem.classList.add('skill-updated');
    setTimeout(() => {
        skillItem.classList.remove('skill-updated');
    }, 200);
}

const feedbackCSS = `
.skill-updated {
    background: rgba(200, 21, 42, 0.15) !important;
    transform: scale(1.03);
    transition: all 0.2s ease;
}
`;

if (!document.getElementById('skill-feedback-css')) {
    const style = document.createElement('style');
    style.id = 'skill-feedback-css';
    style.textContent = feedbackCSS;
    document.head.appendChild(style);
}

function renderSkills() {
    document.getElementById('level-value').textContent = `Level ${state.level}`;
    const levelInput = document.getElementById('level-input');
    if (levelInput) levelInput.value = state.level;
    const freePoints = state.totalSkillPoints - state.usedSkillPoints;
    document.getElementById('skill-points-value').textContent =
        `${freePoints} / ${state.totalSkillPoints}`;

    const lvlMinusBtn = document.getElementById('level-minus-btn');
    if (lvlMinusBtn) lvlMinusBtn.disabled = freePoints < 4 || state.level <= 0;

    const fightSkills = ['attack','precision','critChance','critDamage','armor','dodge','health','hunger','loot'];
    const ecoSkills = ['entrepreneurship','energy','production','companies','management'];
    const skillCost = (lvl) => lvl * (lvl + 1) / 2;
    const fightTotal = fightSkills.reduce((s, k) => s + skillCost(state.skills[k]), 0);
    const ecoTotal = ecoSkills.reduce((s, k) => s + skillCost(state.skills[k]), 0);
    const total = state.totalSkillPoints;
    const usedTotal = fightTotal + ecoTotal;
    const fightPct = usedTotal > 0 ? Math.round(fightTotal / usedTotal * 100) : 0;
    const ecoPct = usedTotal > 0 ? 100 - fightPct : 0;
    document.getElementById('fight-skills-summary').textContent = `- ${fightTotal}/${total} (${fightPct}%)`;
    document.getElementById('eco-skills-summary').textContent = `- ${ecoTotal}/${total} (${ecoPct}%)`;

    updateSkillBonuses();
}

function updateSkillBonuses() {
    document.getElementById('attack-bonus').textContent = calculateStats.attack(state.skills.attack);
    document.getElementById('precision-bonus').textContent = calculateStats.precision(state.skills.precision);
    document.getElementById('critChance-bonus').textContent = calculateStats.critChance(state.skills.critChance);
    document.getElementById('critDamage-bonus').textContent = calculateStats.critDamage(state.skills.critDamage);
    document.getElementById('armor-bonus').textContent = calculateStats.armor(state.skills.armor);
    document.getElementById('dodge-bonus').textContent = calculateStats.dodge(state.skills.dodge);
    document.getElementById('health-bonus').textContent = calculateStats.health(state.skills.health);
    document.getElementById('hunger-bonus').textContent = calculateStats.hunger(state.skills.hunger);
    document.getElementById('loot-bonus').textContent = calculateStats.loot(state.skills.loot);
    document.getElementById('companies-bonus').textContent = calculateStats.companies(state.skills.companies);
    document.getElementById('management-bonus').textContent = calculateStats.management(state.skills.management);
    document.getElementById('entrepreneurship-bonus').textContent = calculateStats.entrepreneurship(state.skills.entrepreneurship);
    document.getElementById('energy-bonus').textContent = calculateStats.energy(state.skills.energy);
    document.getElementById('production-bonus').textContent = calculateStats.production(state.skills.production);
}

function changeLevel(change) {
    if (change == -1) {
        const freePoints = state.totalSkillPoints - state.usedSkillPoints;
        if (state.level <= 0 || freePoints < 4) return;
    }
    state.level = state.level + change;
    state.totalSkillPoints = state.level * 4;
    document.getElementById('level-value').textContent = state.level;
    renderSkills();
}

function setLevel(value) {
    value = parseInt(value) || 0;
    if (value < 0) value = 0;
    state.level = value;
    state.totalSkillPoints = state.level * 4;
    renderSkills();
    saveState();
}

function changeMilitaryRankBonus(value) {
    // Ensure value is within 0-100 range
    value = Math.max(0, Math.min(100, value));
    value = Math.round(value * 10) / 10; // Round to 1 decimal place
    
    state.militaryRankBonus = value;
    document.getElementById('military-rank-bonus').value = value;
    
    updateStatTooltips();
    updateCurrentStatsDisplay();
}

function updateEquipmentRarity(itemType) {
    const rarityColors = {
        gray: 'rgba(150, 150, 150, 0.3)',
        green: 'rgba(76, 175, 80, 0.35)',
        blue: 'rgba(33, 150, 243, 0.35)',
        purple: 'rgba(156, 39, 176, 0.35)',
        yellow: 'rgba(255, 235, 59, 0.35)',
        red: 'rgba(244, 67, 54, 0.35)'
    };

    const rarityColorsDark = {
        gray: 'rgba(150, 150, 150, 0.15)',
        green: 'rgba(76, 175, 80, 0.20)',
        blue: 'rgba(33, 150, 243, 0.20)',
        purple: 'rgba(156, 39, 176, 0.20)',
        yellow: 'rgba(255, 235, 59, 0.20)',
        red: 'rgba(244, 67, 54, 0.20)'
    };

    const rarityCostColorsDarker = {
        gray: 'rgba(150, 150, 150, 0.05)',
        green: 'rgba(76, 175, 80, 0.08)',
        blue: 'rgba(33, 150, 243, 0.08)',
        purple: 'rgba(156, 39, 176, 0.08)',
        yellow: 'rgba(255, 235, 59, 0.08)',
        red: 'rgba(244, 67, 54, 0.08)'
    };

    let rarity = 'gray';
    let itemElement;
    let statsBoxElement;
    let costBoxElement;

    if (itemType === 'weapon') {
        const attack = parseInt(document.getElementById('primaryWeapon').value) || 0;
        const crit = parseInt(document.getElementById('secondaryWeapon').value) || 0;
        rarity = getRarityFromStats('weapon', attack, crit);

        const rarityToWeapon = { gray: 'knife', green: 'gun', blue: 'rifle', purple: 'sniper', yellow: 'tank', red: 'jet' };
        const weaponImgEl = document.getElementById('weaponImg');
        if (weaponImgEl) weaponImgEl.src = 'assets/' + rarityToWeapon[rarity] + '.png';

        itemElement = document.getElementById('weaponItem');
        statsBoxElement = document.getElementById('weaponStatsBox');
        costBoxElement = document.getElementById('weaponCostBox');
    } else if (itemType === 'helmet') {
        const value = parseInt(document.getElementById('helmet').value) || 0;
        rarity = getRarityFromStats('helmet', value);
        
        itemElement = document.getElementById('helmetItem');
        statsBoxElement = document.getElementById('helmetStatsBox');
        costBoxElement = document.getElementById('helmetCostBox');
    } else {
        // Other armors (chest, pants, boots, gloves)
        const value = parseInt(document.getElementById(itemType).value) || 0;
        rarity = getRarityFromStats(itemType, value);
        
        itemElement = document.getElementById(itemType + 'Item');
        statsBoxElement = document.getElementById(itemType + 'StatsBox');
        costBoxElement = document.getElementById(itemType + 'CostBox');
    }

    if (itemElement) {
        itemElement.style.backgroundColor = rarityColors[rarity];
    }
    
    if (statsBoxElement) {
        statsBoxElement.style.backgroundColor = rarityColorsDark[rarity];
    }

    if (costBoxElement) {
        costBoxElement.style.backgroundColor = rarityCostColorsDarker[rarity];
    }

    // Update cost based on rarity (weapon and armor tracked separately)
    const costMap = itemType === 'weapon' ? state.weaponRarityCosts : state.armorRarityCosts;
    const cost = costMap[rarity];
    const costInput = document.getElementById(itemType + 'Cost');
    if (costInput) {
        costInput.value = cost;
        state.equipmentCosts[itemType] = cost;
    }
    saveState();
}

function calculateCurrentStats() {
    // Use first loadout's weapon (from weapons pool) and armors
    const w0 = state.multiStage && state.multiStage.loadouts ? state.multiStage.loadouts[0] : null;
    const weaponPool = state.multiStage && state.multiStage.weapons;
    const weapon = (weaponPool && weaponPool.length > 0) ? weaponPool[0] : (w0 ? w0.weapon : state.weapon);
    const armors = w0 ? w0.armors : state.armors;

    const wprimary = weapon ? weapon.primary : state.weapon.primary;
    const wsecondary = weapon ? weapon.secondary : state.weapon.secondary;

    const baseAttack = calculateStats.attack(state.skills.attack) + wprimary;
    const precision = calculateStats.precision(state.skills.precision) + (armors ? armors.gloves : state.armors.gloves);

    // Precision overflow bonus
    let precisionOverflowAttack = 0;
    if (precision > 100) {
        precisionOverflowAttack = (precision - 100) * 4;
    }

    let finalAttack = baseAttack + precisionOverflowAttack;
    if (state.buffs.pill) {
        finalAttack = applyPercentage(finalAttack, buffs.pill);
    }
    if (state.buffs.ammo) {
        finalAttack = applyPercentage(finalAttack, buffs.ammo[state.buffs.ammo]);
    }
    if (state.militaryRankBonus && state.militaryRankBonus > 0) {
        finalAttack = applyPercentage(finalAttack, state.militaryRankBonus);
    }

    const critChance = calculateStats.critChance(state.skills.critChance) + wsecondary;
    const critDamage = calculateStats.critDamage(state.skills.critDamage) + (armors ? armors.helmet : state.armors.helmet);
    const armorTotal = calculateStats.armor(state.skills.armor) + (armors ? armors.chest : state.armors.chest) + (armors ? armors.pants : state.armors.pants);
    const armorPercent = (armorTotal / (armorTotal + 40)) * 100;
    const dodgeTotal = calculateStats.dodge(state.skills.dodge) + (armors ? armors.boots : state.armors.boots);
    const dodgePercent = (dodgeTotal / (dodgeTotal + 40)) * 100;
    const health = getInitialHealth(state);
    const hunger = calculateStats.hunger(state.skills.hunger);

    // Crit chance overflow bonus
    let critChanceOverflowDamage = 0;
    if (critChance > 100) {
        critChanceOverflowDamage = (critChance - 100) * 4;
    }

    return {
        attack: finalAttack,
        precision: precision,
        critChance: critChance,
        critDamage: critDamage + critChanceOverflowDamage,
        armor: armorPercent,
        dodge: dodgePercent,
        health: health,
        hunger: hunger,
        precisionOverflowAttack: precisionOverflowAttack,
        critChanceOverflowDamage: critChanceOverflowDamage
    };
}

function updateCurrentStatsDisplay() {
    const stats = calculateCurrentStats();

    document.getElementById('currentAttack').textContent = Math.floor(stats.attack);
    document.getElementById('currentPrecision').textContent = Math.min(stats.precision, 100) + '%';
    document.getElementById('currentCritChance').textContent = Math.min(stats.critChance, 100) + '%';
    document.getElementById('currentCritDamage').textContent = stats.critDamage + '%';
    document.getElementById('currentArmor').textContent = stats.armor.toFixed(1) + '%';
    document.getElementById('currentDodge').textContent = stats.dodge.toFixed(1) + '%';

    updateStatTooltips();
    updateHealthTrail();
}

function updateHealthTrail() {
    const container = document.getElementById('healthTrail');
    if (!container) return;

    const baseHP = calculateStats.health(state.skills.health);
    const hungerCap = calculateStats.hunger(state.skills.hunger);
    const hpPerHour = baseHP * 0.1;
    const hungerPerHour = hungerCap * 0.1;
    const prePillHours = state.battle.prePillPhaseHours || 6;

    // Food: read from first loadout
    const loadout0 = state.multiStage && state.multiStage.loadouts && state.multiStage.loadouts[0];
    const food = (loadout0 && loadout0.food) ? loadout0.food : (state.buffs ? state.buffs.food : null);
    const foodBonus = food ? buffs.food[food] : 0;
    const foodHpPerUnit = food ? Math.floor(baseHP * foodBonus / 100) : 0;
    const foodLabelMap = { bread: 'food.bread', steak: 'food.steak', fish: 'food.fish' };
    const foodLabel = food ? t(foodLabelMap[food] || 'food.none') : null;

    // Full HP (with food)
    const fullHp = baseHP + foodHpPerUnit * hungerCap;

    // At pill time
    const hpBaseAtPill = Math.min(Math.floor(hpPerHour * prePillHours), baseHP);
    const hungerAtPill = Math.min(Math.floor(hungerPerHour * prePillHours), hungerCap);
    const foodHpAtPill = foodHpPerUnit * hungerAtPill;
    const totalHpAtPill = hpBaseAtPill + foodHpAtPill;
    const hpPctAtPill = fullHp > 0 ? Math.round((totalHpAtPill / fullHp) * 100) : 0;
    const hungerPctAtPill = hungerCap > 0 ? Math.round((hungerAtPill / hungerCap) * 100) : 0;

    const hoursToFull = 10; // baseHP / (baseHP * 0.1) = 10 always
    const hoursFromPillToFull = Math.max(0, hoursToFull - prePillHours);

    // Helpers
    function hpBar(baseHp, foodHp, maxHp) {
        const bw = maxHp > 0 ? Math.round((baseHp / maxHp) * 100) : 0;
        const fw = maxHp > 0 ? Math.round((foodHp / maxHp) * 100) : 0;
        return `<div class="ht-bar-track">
            <div class="ht-bar-base" style="width:${bw}%"></div>
            ${foodHp > 0 ? `<div class="ht-bar-food" style="width:${fw}%"></div>` : ''}
        </div>`;
    }

    function hungerDots(current, cap) {
        const maxDots = Math.min(cap, 12);
        let html = '';
        for (let i = 0; i < maxDots; i++) {
            html += `<span class="ht-dot${i < current ? ' ht-dot-filled' : ''}"></span>`;
        }
        if (cap > 12) html += `<span class="ht-step-note">+${cap - 12}</span>`;
        return `<div class="ht-dots">${html}</div>`;
    }

    const pillReached = prePillHours >= hoursToFull;

    // Sustained phase energy budget (8h regen from zero)
    const sustainHours = state.battle.roundDuration || 8;
    const hpBaseSustain = Math.min(Math.floor(hpPerHour * sustainHours), baseHP);
    const hungerSustain = Math.min(Math.floor(hungerPerHour * sustainHours), hungerCap);
    const foodHpSustain = foodHpPerUnit * hungerSustain;
    const totalHpSustain = hpBaseSustain + foodHpSustain;

    const legendFood = foodLabel ? `<span class="ht-legend-item"><span class="ht-legend-dot" style="background:var(--accent-amber)"></span>${foodLabel}</span>` : '';

    container.innerHTML = `
    <div class="ht-header">
        ${t('hp.recovery')}
        <span class="ht-regen-rate">+${hpPerHour.toFixed(1)} ${t('hp.hpHr')} · ${hungerPerHour.toFixed(1)} ${t('hp.hungerHr')}</span>
    </div>
    <div class="ht-legend">
        <span class="ht-legend-item"><span class="ht-legend-dot" style="background:var(--accent-red)"></span>${t('hp.hpBase')} (${baseHP})</span>
        ${legendFood}
        <span class="ht-legend-item"><span class="ht-legend-dot" style="background:rgba(180,180,180,0.4);border:1px solid rgba(220,220,220,0.6)"></span>${t('hp.hungerRecovered')}</span>
    </div>
    <div class="ht-timeline">

        <div class="ht-step">
            <div class="ht-step-label">0h <span class="ht-tag ht-tag-neutral">${t('hp.zeroed')}</span></div>
            ${hpBar(baseHP, foodHpPerUnit * hungerCap, fullHp)}
            ${hungerDots(hungerCap, hungerCap)}
            <div class="ht-step-nums">${fullHp} / ${fullHp} HP (${t('hp.potential')}) &nbsp;·&nbsp; ${hungerCap} / ${hungerCap} ${t('hp.hunger')}</div>
            <div class="ht-step-note">${t('hp.exitedZeroed')}</div>
        </div>

        <div class="ht-energy-budget" style="border-color:rgba(120,120,120,0.3);background:rgba(120,120,120,0.05);margin-bottom:8px;">
            <div class="ht-budget-label" style="color:var(--text-secondary)">${t('hp.maxPotential')}</div>
            <div class="ht-budget-val">${fullHp} <span class="ht-budget-unit">${t('hp.hpWhenFull')}</span></div>
            <div class="ht-budget-note">${baseHP} ${t('hp.hpBase2')}${foodHpPerUnit > 0 ? ` + ${foodHpPerUnit * hungerCap} ${t('hp.of')} ${foodLabel} (${hungerCap} ${t('hp.hunger')})` : ''}</div>
        </div>

        <div class="ht-connector">
            <span class="ht-connector-line"></span>
            <span class="ht-connector-label">${t('hp.recovering')} ${hpPerHour.toFixed(1)} ${t('hp.hpHr')}${foodHpPerUnit > 0 ? ` + ${foodLabel}` : ''}…</span>
        </div>

        <div class="ht-step ht-step-pill">
            <div class="ht-step-label">${prePillHours}h <span class="ht-tag ht-tag-pill">${t('hp.takePill')}</span></div>
            ${hpBar(hpBaseAtPill, foodHpAtPill, fullHp)}
            ${hungerDots(hungerAtPill, hungerCap)}
            <div class="ht-step-nums">${totalHpAtPill} / ${fullHp} HP (${hpPctAtPill}%) &nbsp;·&nbsp; ${hungerAtPill} / ${hungerCap} ${t('hp.hunger')} (${hungerPctAtPill}%)</div>
            ${foodHpAtPill > 0 ? `<div class="ht-step-note">${hpBaseAtPill} ${t('hp.hpBase2')} + <span class="ht-food-val">${foodHpAtPill} ${t('hp.of')} ${foodLabel}</span> (${hungerAtPill} ${t('hp.foodUnits')})</div>` : ''}
            ${hoursFromPillToFull > 0
                ? `<div class="ht-step-note">${t('hp.hoursToFull', hoursFromPillToFull)}</div>`
                : `<div class="ht-step-note">${t('hp.alreadyFull')}</div>`}
        </div>

        <div class="ht-energy-budget ht-energy-burst">
            <div class="ht-budget-label">${t('hp.energyBurst')}</div>
            <div class="ht-budget-val">${totalHpAtPill} <span class="ht-budget-unit">${t('hp.hpToSpend')}</span></div>
            <div class="ht-budget-note">${hpPctAtPill}% ${t('hp.ofMax')}${pillReached ? ` — ${t('hp.alreadyFullShort')}` : ` — ${fullHp - totalHpAtPill} ${t('hp.notRecovered')}`}</div>
        </div>

        <div class="ht-connector">
            <span class="ht-connector-line"></span>
            <span class="ht-connector-label">${t('hp.burstZeroRecovering', hpPerHour.toFixed(1), sustainHours)}</span>
        </div>

        <div class="ht-step">
            <div class="ht-step-label">${prePillHours + sustainHours}h <span class="ht-tag ht-tag-neutral">${t('hp.sustained')}</span></div>
            ${hpBar(hpBaseSustain, foodHpSustain, fullHp)}
            ${hungerDots(hungerSustain, hungerCap)}
            <div class="ht-step-nums">${totalHpSustain} / ${fullHp} HP (${Math.round(totalHpSustain / fullHp * 100)}%) &nbsp;·&nbsp; ${hungerSustain} / ${hungerCap} ${t('hp.hunger')}</div>
            ${totalHpSustain < fullHp
                ? `<div class="ht-step-note">${t('hp.stillToRecover', fullHp - totalHpSustain)}</div>`
                : `<div class="ht-step-note">${t('hp.willBeFullAt', sustainHours)}</div>`}
        </div>

        <div class="ht-energy-budget ht-energy-sust">
            <div class="ht-budget-label">${t('hp.energySustained')}</div>
            <div class="ht-budget-val">${totalHpSustain} <span class="ht-budget-unit">${t('hp.hpToSpend')}</span></div>
            <div class="ht-budget-note">${hpBaseSustain} ${t('hp.hpBase2')}${foodHpSustain > 0 ? ` + ${foodHpSustain} ${t('hp.of')} ${foodLabel} (${hungerSustain} ${t('hp.hunger')})` : ''} · ${t('hp.recoveredAfterBurst', sustainHours)}</div>
        </div>

    </div>`;
}

function updateStatTooltips() {
    // Use first loadout's weapon and armors (from weapons pool for weapon)
    const w0 = state.multiStage && state.multiStage.loadouts ? state.multiStage.loadouts[0] : null;
    const weaponPool = state.multiStage && state.multiStage.weapons;
    const weapon = (weaponPool && weaponPool.length > 0) ? weaponPool[0] : (w0 ? w0.weapon : state.weapon);
    const armors = w0 ? w0.armors : state.armors;

    const attackSkill = calculateStats.attack(state.skills.attack);
    const weaponAttack = weapon ? weapon.primary : state.weapon.primary;
    const baseAttack = attackSkill + weaponAttack;

    const pillBonus = state.buffs.pill ? buffs.pill : 0;
    const ammoBonus = state.buffs.ammo ? buffs.ammo[state.buffs.ammo] : 0;
    const rankBonus = (state.militaryRankBonus && state.militaryRankBonus > 0) ? state.militaryRankBonus : 0;

    // Precision overflow
    const precisionSkill = calculateStats.precision(state.skills.precision);
    const precisionGloves = armors ? armors.gloves : state.armors.gloves;
    const totalPrecision = precisionSkill + precisionGloves;
    const precisionOverflow = totalPrecision > 100 ? totalPrecision - 100 : 0;
    const precisionOverflowAttack = precisionOverflow * 4;

    let finalAttack = baseAttack + precisionOverflowAttack;
    if (pillBonus > 0) finalAttack = applyPercentage(finalAttack, pillBonus);
    if (ammoBonus > 0) finalAttack = applyPercentage(finalAttack, ammoBonus);
    if (rankBonus > 0) finalAttack = applyPercentage(finalAttack, rankBonus);
    finalAttack = Math.floor(finalAttack);

    document.getElementById('tooltip-attack').innerHTML = `
        <div class="tt-title">ATK <span class="tt-total-val">${finalAttack}</span></div>
        <div class="tt-rows">
            <div class="tt-row"><span>Skill</span><span>+${attackSkill}</span></div>
            <div class="tt-row"><span>Weapon</span><span>+${weaponAttack}</span></div>
            ${precisionOverflowAttack > 0 ? `<div class="tt-row tt-special"><span>Precision overflow</span><span>+${precisionOverflowAttack}</span></div>` : ''}
            ${pillBonus > 0 ? `<div class="tt-row tt-special"><span>Pill</span><span>+${pillBonus}%</span></div>` : ''}
            ${ammoBonus > 0 ? `<div class="tt-row tt-special"><span>Ammo</span><span>+${ammoBonus}%</span></div>` : ''}
            ${rankBonus > 0 ? `<div class="tt-row tt-special"><span>Rank</span><span>+${rankBonus}%</span></div>` : ''}
        </div>
    `;

    document.getElementById('tooltip-precision').innerHTML = `
        <div class="tt-title">PRC <span class="tt-total-val">${Math.min(totalPrecision, 100)}%</span></div>
        ${totalPrecision > 100 ? '<div class="tt-desc">Overflow converts to +4 attack per point.</div>' : ''}
        <div class="tt-rows">
            <div class="tt-row"><span>Skill</span><span>+${precisionSkill}%</span></div>
            <div class="tt-row"><span>Gloves</span><span>+${precisionGloves}%</span></div>
            <div class="tt-row tt-total"><span>Effective</span><span>${Math.min(totalPrecision, 100)}%</span></div>
        </div>
    `;

    const critChanceSkill = calculateStats.critChance(state.skills.critChance);
    const critChanceWeapon = weapon ? weapon.secondary : state.weapon.secondary;
    const totalCritChance = critChanceSkill + critChanceWeapon;
    const critChanceOverflow = totalCritChance > 100 ? totalCritChance - 100 : 0;
    const critChanceOverflowDamage = critChanceOverflow * 4;

    document.getElementById('tooltip-critChance').innerHTML = `
        <div class="tt-title">CC <span class="tt-total-val">${Math.min(totalCritChance, 100)}%</span></div>
        ${totalCritChance > 100 ? '<div class="tt-desc">Overflow converts to +4 crit dmg per point.</div>' : ''}
        <div class="tt-rows">
            <div class="tt-row"><span>Skill</span><span>+${critChanceSkill}%</span></div>
            <div class="tt-row"><span>Weapon</span><span>+${critChanceWeapon}%</span></div>
            <div class="tt-row tt-total"><span>Effective</span><span>${Math.min(totalCritChance, 100)}%</span></div>
        </div>
    `;

    const critDamageSkill = calculateStats.critDamage(state.skills.critDamage);
    const critDamageHelmet = armors ? armors.helmet : state.armors.helmet;
    const totalCritDamage = critDamageSkill + critDamageHelmet + critChanceOverflowDamage;

    document.getElementById('tooltip-critDamage').innerHTML = `
        <div class="tt-title">CD <span class="tt-total-val">${totalCritDamage}%</span></div>
        <div class="tt-rows">
            <div class="tt-row"><span>Skill</span><span>+${critDamageSkill}%</span></div>
            <div class="tt-row"><span>Helmet</span><span>+${critDamageHelmet}%</span></div>
            ${critChanceOverflowDamage > 0 ? `<div class="tt-row tt-special"><span>CC overflow</span><span>+${critChanceOverflowDamage}%</span></div>` : ''}
            <div class="tt-row tt-total"><span>Total</span><span>${totalCritDamage}%</span></div>
        </div>
    `;

    const armorSkill = calculateStats.armor(state.skills.armor);
    const armorChest = armors ? armors.chest : state.armors.chest;
    const armorPants = armors ? armors.pants : state.armors.pants;
    const armorTotal = armorSkill + armorChest + armorPants;
    const armorPercent = ((armorTotal / (armorTotal + 40)) * 100).toFixed(1);

    document.getElementById('tooltip-armor').innerHTML = `
        <div class="tt-title">ARM <span class="tt-total-val">${armorPercent}%</span></div>
        <div class="tt-desc">Damage reduction: N/(N+40)</div>
        <div class="tt-rows">
            <div class="tt-row"><span>Skill</span><span>+${armorSkill}pts</span></div>
            <div class="tt-row"><span>Chest</span><span>+${armorChest}%</span></div>
            <div class="tt-row"><span>Pants</span><span>+${armorPants}%</span></div>
            <div class="tt-row tt-separator"><span>Total pts</span><span>${armorTotal}</span></div>
            <div class="tt-row tt-total"><span>Reduction</span><span>${armorPercent}%</span></div>
        </div>
    `;

    const dodgeSkill = calculateStats.dodge(state.skills.dodge);
    const dodgeBoots = armors ? armors.boots : state.armors.boots;
    const dodgeTotal = dodgeSkill + dodgeBoots;
    const dodgePercent = ((dodgeTotal / (dodgeTotal + 40)) * 100).toFixed(1);

    document.getElementById('tooltip-dodge').innerHTML = `
        <div class="tt-title">DDG <span class="tt-total-val">${dodgePercent}%</span></div>
        <div class="tt-desc">Dodge chance: N/(N+40)</div>
        <div class="tt-rows">
            <div class="tt-row"><span>Skill</span><span>+${dodgeSkill}pts</span></div>
            <div class="tt-row"><span>Boots</span><span>+${dodgeBoots}%</span></div>
            <div class="tt-row tt-separator"><span>Total pts</span><span>${dodgeTotal}</span></div>
            <div class="tt-row tt-total"><span>Effective</span><span>${dodgePercent}%</span></div>
        </div>
    `;
}

// ==================== Skill Popover ====================

const skillNames = {
    attack: 'ATTACK', precision: 'PRECISION', critChance: 'CRIT CHANCE',
    critDamage: 'CRIT DAMAGE', armor: 'ARMOR', dodge: 'DODGE',
    health: 'HEALTH', hunger: 'HUNGER', loot: 'LOOT',
    companies: 'COMPANIES', entrepreneurship: 'ENTREPRENEURSHIP',
    energy: 'ENERGY', production: 'PRODUCTION', management: 'MANAGEMENT'
};

let activePopoverSkill = null;

function openSkillPopover(skill, cardEl) {
    activePopoverSkill = skill;
    const popover = document.getElementById('skillPopover');
    const freePoints = state.totalSkillPoints - state.usedSkillPoints;

    document.getElementById('popoverSkillName').textContent = skillNames[skill] || skill.toUpperCase();
    document.getElementById('popoverCurrentBonus').textContent = calculateStats[skill](state.skills[skill]);
    document.getElementById('popoverInput').value = state.skills[skill];
    document.getElementById('popoverFree').textContent = `Free points: ${freePoints} / ${state.totalSkillPoints}`;
    document.getElementById('popoverPreview').textContent = '';
    document.getElementById('popoverPreview').style.color = 'var(--accent-green)';

    const rect = cardEl.getBoundingClientRect();
    popover.style.display = 'block';
    let left = rect.left;
    let top = rect.bottom + 8;
    if (left + 210 > window.innerWidth) left = window.innerWidth - 215;
    if (top + 260 > window.innerHeight) top = rect.top - 265;
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';

    document.getElementById('popoverInput').focus();
    document.getElementById('popoverInput').select();
}

function previewSkillPopover() {
    if (!activePopoverSkill) return;
    const input = document.getElementById('popoverInput');
    const newLevel = Math.max(0, parseInt(input.value) || 0);
    const bonus = calculateStats[activePopoverSkill](newLevel);
    document.getElementById('popoverCurrentBonus').textContent = bonus;
    const skillCost = (lvl) => lvl * (lvl + 1) / 2;
    const oldCost = skillCost(state.skills[activePopoverSkill]);
    const newCost = skillCost(newLevel);
    const costDiff = newCost - oldCost;
    const freePoints = state.totalSkillPoints - state.usedSkillPoints;
    if (costDiff > freePoints) {
        document.getElementById('popoverPreview').textContent = `Not enough points (need ${costDiff}, have ${freePoints})`;
        document.getElementById('popoverPreview').style.color = 'var(--accent-red)';
    } else {
        document.getElementById('popoverPreview').textContent = costDiff >= 0 ? `Cost: ${costDiff} pts` : `Refund: ${Math.abs(costDiff)} pts`;
        document.getElementById('popoverPreview').style.color = 'var(--accent-green)';
    }
}

function applySkillPopover() {
    if (!activePopoverSkill) return;
    const input = document.getElementById('popoverInput');
    let newLevel = Math.max(0, parseInt(input.value) || 0);
    setSkillLevel(activePopoverSkill, newLevel);
    const freePoints = state.totalSkillPoints - state.usedSkillPoints;
    document.getElementById('popoverFree').textContent = `Free points: ${freePoints} / ${state.totalSkillPoints}`;
    document.getElementById('popoverPreview').textContent = '';
    closeSkillPopover();
}

function closeSkillPopover() {
    const popover = document.getElementById('skillPopover');
    if (popover) popover.style.display = 'none';
    activePopoverSkill = null;
}

function setSkillLevel(skill, newLevel) {
    const skillCost = (lvl) => lvl * (lvl + 1) / 2;
    const oldCost = skillCost(state.skills[skill] || 0);
    const newCost = skillCost(Math.max(0, newLevel));
    const costDiff = newCost - oldCost;
    const freePoints = state.totalSkillPoints - state.usedSkillPoints;

    if (costDiff > freePoints) {
        let maxLevel = state.skills[skill];
        while (skillCost(maxLevel + 1) - oldCost <= freePoints) maxLevel++;
        newLevel = maxLevel;
    }
    newLevel = Math.max(0, newLevel);

    state.skills[skill] = newLevel;

    const allSkills = ['attack','precision','critChance','critDamage','armor','dodge','health','hunger','loot','companies','entrepreneurship','energy','production','management'];
    state.usedSkillPoints = allSkills.reduce((s, k) => s + skillCost(state.skills[k] || 0), 0);

    const valueEl = document.getElementById(skill + '-value');
    if (valueEl) valueEl.textContent = newLevel;

    updateSkillBonuses();
    renderSkills();
    updateCurrentStatsDisplay();
    saveState();
}

document.addEventListener('click', function(e) {
    const popover = document.getElementById('skillPopover');
    if (popover && popover.style.display !== 'none') {
        if (!popover.contains(e.target) && !e.target.closest('.skill-item')) {
            closeSkillPopover();
        }
    }
});

// ==================== Multi-Stage UI ====================

let expandedLoadoutIndex = -1;
let dragWeaponFrom = null;
let dragLoadoutFrom = null;

function toggleMultiStage(enabled) {
    state.multiStage.enabled = true; // always on
    document.getElementById('multiStageSection').style.display = '';

    // Disable pre-pill checkbox when multi-stage active
    document.getElementById('prePillPhaseEnabled').disabled = true;

    renderMultiStageUI();
    saveState();
}

function renderMultiStageUI() {
    renderWeaponList();
    renderLoadoutList();
    renderStagePipeline();
}

function renderWeaponList() {
    const container = document.getElementById('weaponList');
    if (!container) return;
    const weapons = state.multiStage.weapons;
    if (!weapons) return;
    const rarityColors = { gray:'rgba(150,150,150,0.3)', green:'rgba(76,175,80,0.35)', blue:'rgba(33,150,243,0.35)', purple:'rgba(156,39,176,0.35)', yellow:'rgba(255,235,59,0.35)', red:'rgba(244,67,54,0.35)' };
    const rarityColorsDark = { gray:'rgba(150,150,150,0.15)', green:'rgba(76,175,80,0.20)', blue:'rgba(33,150,243,0.20)', purple:'rgba(156,39,176,0.20)', yellow:'rgba(255,235,59,0.20)', red:'rgba(244,67,54,0.20)' };
    const rarityCostDark = { gray:'rgba(150,150,150,0.05)', green:'rgba(76,175,80,0.08)', blue:'rgba(33,150,243,0.08)', purple:'rgba(156,39,176,0.08)', yellow:'rgba(255,235,59,0.08)', red:'rgba(244,67,54,0.08)' };
    const rarityToWeapon = { gray:'knife', green:'gun', blue:'rifle', purple:'sniper', yellow:'tank', red:'jet' };

    container.innerHTML = weapons.map((weapon, i) => {
        const rarity = getRarityFromStats('weapon', weapon.primary, weapon.secondary);
        const imgSrc = 'assets/' + rarityToWeapon[rarity] + '.png';
        const bg = rarityColors[rarity];
        const bgDark = rarityColorsDark[rarity];
        const bgCost = rarityCostDark[rarity];
        const letter = weapon.name || String.fromCharCode(65 + i);
        const wPhases = getItemPhases(weapon);
        return `
        <div class="ms-weapon-card" id="ms-wcard-${i}" draggable="true"
            ondragstart="onWeaponDragStart(event,${i})" ondragover="onWeaponDragOver(event,${i})"
            ondrop="onWeaponDrop(event,${i})" ondragend="onWeaponDragEnd(event)"
            style="background:${bg}">
            <div class="ms-weapon-card-header">
                <div class="ms-drag-handle" title="Arrastar">⠿</div>
                <img class="equip-img ms-weapon-img" id="ms-wimg-${i}" src="${imgSrc}" alt="Weapon">
                <input type="text" class="ms-input ms-input-wname" value="${letter}" placeholder="A" onchange="updateWeaponField(${i},'name',this.value)">
            </div>
            <div class="ms-card-actions">
                <button class="ms-action-btn ms-action-dup" onclick="duplicateWeapon(${i})" title="Duplicar">⧉</button>
                ${weapons.length > 1 ? `<button class="ms-action-btn ms-action-del" onclick="removeWeapon(${i})" title="Excluir">✕</button>` : ''}
            </div>
            <div class="ms-phase-row">
                <button class="ms-phase-btn ms-phase-btn-pre ${wPhases.includes('prePill')?'ms-phase-active':''}" onclick="toggleWeaponPhase(${i},'prePill')">Pré</button>
                <button class="ms-phase-btn ms-phase-btn-burst ${wPhases.includes('burst')?'ms-phase-active':''}" onclick="toggleWeaponPhase(${i},'burst')">Burst</button>
                <button class="ms-phase-btn ms-phase-btn-sust ${wPhases.includes('sustained')?'ms-phase-active':''}" onclick="toggleWeaponPhase(${i},'sustained')">Sust.</button>
            </div>
            <div class="ms-weapon-stats" id="ms-wstats-${i}" style="background:${bgDark}">
                <div class="equipment-compact-stats">
                    <div class="equipment-stat">
                        <span class="stat-label">Atk</span>
                        <input type="number" class="equipment-compact-input equipment-compact-input-no-suffix" value="${weapon.primary}" min="20" max="280" onchange="updateWeaponField(${i},'primary',parseInt(this.value))">
                    </div>
                    <div class="equipment-stat">
                        <span class="stat-label">Crit</span>
                        <div class="input-with-suffix">
                            <input type="number" class="equipment-compact-input equipment-compact-input-weapon-crit" value="${weapon.secondary}" min="1" max="40" onchange="updateWeaponField(${i},'secondary',parseInt(this.value))">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ms-weapon-cost" id="ms-wcost-${i}" style="background:${bgCost}">
                <div class="input-with-suffix">
                    <input type="number" class="equipment-compact-input" value="${weapon.cost || 0}" min="0" onchange="updateWeaponField(${i},'cost',parseFloat(this.value))">
                    <span class="input-suffix">cc</span>
                </div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML += `<button class="ms-add-btn" onclick="addWeapon()">+ Add Weapon</button>`;
}

function updateWeaponField(index, field, value) {
    state.multiStage.weapons[index][field] = value;
    if (field === 'primary' || field === 'secondary') updateWeaponRarity(index);
    renderStagePipeline();
    saveState();
}

function updateWeaponRarity(index) {
    const weapon = state.multiStage.weapons[index];
    const rarity = getRarityFromStats('weapon', weapon.primary, weapon.secondary);
    const rarityColors = { gray:'rgba(150,150,150,0.3)', green:'rgba(76,175,80,0.35)', blue:'rgba(33,150,243,0.35)', purple:'rgba(156,39,176,0.35)', yellow:'rgba(255,235,59,0.35)', red:'rgba(244,67,54,0.35)' };
    const rarityColorsDark = { gray:'rgba(150,150,150,0.15)', green:'rgba(76,175,80,0.20)', blue:'rgba(33,150,243,0.20)', purple:'rgba(156,39,176,0.20)', yellow:'rgba(255,235,59,0.20)', red:'rgba(244,67,54,0.20)' };
    const rarityCostDark = { gray:'rgba(150,150,150,0.05)', green:'rgba(76,175,80,0.08)', blue:'rgba(33,150,243,0.08)', purple:'rgba(156,39,176,0.08)', yellow:'rgba(255,235,59,0.08)', red:'rgba(244,67,54,0.08)' };
    const rarityToWeapon = { gray:'knife', green:'gun', blue:'rifle', purple:'sniper', yellow:'tank', red:'jet' };
    const cardEl = document.getElementById('ms-wcard-' + index);
    const statsEl = document.getElementById('ms-wstats-' + index);
    const costEl = document.getElementById('ms-wcost-' + index);
    const imgEl = document.getElementById('ms-wimg-' + index);
    if (cardEl) cardEl.style.background = rarityColors[rarity];
    if (statsEl) statsEl.style.background = rarityColorsDark[rarity];
    if (costEl) costEl.style.background = rarityCostDark[rarity];
    if (imgEl) imgEl.src = 'assets/' + rarityToWeapon[rarity] + '.png';
    const newCost = state.weaponRarityCosts[rarity];
    state.multiStage.weapons[index].cost = newCost;
    const costBox = document.getElementById('ms-wcost-' + index);
    if (costBox) { const inp = costBox.querySelector('input'); if (inp) inp.value = newCost; }
}

function toggleWeaponPhase(index, phase) {
    const w = state.multiStage.weapons[index];
    if (!Array.isArray(w.phases)) w.phases = [];
    const idx = w.phases.indexOf(phase);
    if (idx >= 0) {
        if (w.phases.length === 1) return; // must keep at least one
        w.phases.splice(idx, 1);
    } else {
        w.phases.push(phase);
    }
    renderMultiStageUI();
    saveState();
}

function toggleLoadoutPhase(index, phase) {
    const l = state.multiStage.loadouts[index];
    if (!Array.isArray(l.phases)) l.phases = [];
    const idx = l.phases.indexOf(phase);
    if (idx >= 0) {
        if (l.phases.length === 1) return;
        l.phases.splice(idx, 1);
    } else {
        l.phases.push(phase);
    }
    renderMultiStageUI();
    saveState();
}

function duplicateWeapon(index) {
    const orig = state.multiStage.weapons[index];
    const copy = JSON.parse(JSON.stringify(orig));
    copy.name = (copy.name || String.fromCharCode(65 + index)) + '2';
    state.multiStage.weapons.splice(index + 1, 0, copy);
    renderWeaponList();
    renderStagePipeline();
    saveState();
}

function onWeaponDragStart(e, index) {
    dragWeaponFrom = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.closest('.ms-weapon-card').classList.add('ms-dragging');
}

function onWeaponDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.ms-weapon-card').forEach(el => el.classList.remove('ms-drag-over'));
    const card = e.currentTarget.closest('.ms-weapon-card');
    if (card) card.classList.add('ms-drag-over');
}

function onWeaponDrop(e, index) {
    e.preventDefault();
    document.querySelectorAll('.ms-weapon-card').forEach(el => el.classList.remove('ms-drag-over', 'ms-dragging'));
    if (dragWeaponFrom === null || dragWeaponFrom === index) { dragWeaponFrom = null; return; }
    const moved = state.multiStage.weapons.splice(dragWeaponFrom, 1)[0];
    state.multiStage.weapons.splice(index, 0, moved);
    dragWeaponFrom = null;
    renderWeaponList();
    renderStagePipeline();
    saveState();
}

function onWeaponDragEnd(e) {
    document.querySelectorAll('.ms-weapon-card').forEach(el => el.classList.remove('ms-drag-over', 'ms-dragging'));
    dragWeaponFrom = null;
}

function addWeapon() {
    const newWeapon = getDefaultWeapon();
    newWeapon.name = String.fromCharCode(65 + state.multiStage.weapons.length);
    state.multiStage.weapons.push(newWeapon);
    renderWeaponList();
    renderStagePipeline();
    saveState();
}

function removeWeapon(index) {
    if (state.multiStage.weapons.length <= 1) return;
    state.multiStage.weapons.splice(index, 1);
    state.multiStage.stages.forEach(function(s) {
        if (s.weaponIndex >= state.multiStage.weapons.length) s.weaponIndex = state.multiStage.weapons.length - 1;
        else if (s.weaponIndex === index) s.weaponIndex = 0;
        else if (s.weaponIndex > index) s.weaponIndex--;
    });
    renderWeaponList();
    renderStagePipeline();
    saveState();
}

function renderLoadoutList() {
    const container = document.getElementById('loadoutList');
    const loadouts = state.multiStage.loadouts;

    const rarityColors = {
        gray:'rgba(150,150,150,0.3)', green:'rgba(76,175,80,0.35)',
        blue:'rgba(33,150,243,0.35)', purple:'rgba(156,39,176,0.35)',
        yellow:'rgba(255,235,59,0.35)', red:'rgba(244,67,54,0.35)'
    };
    const rarityColorsDark = {
        gray:'rgba(150,150,150,0.15)', green:'rgba(76,175,80,0.20)',
        blue:'rgba(33,150,243,0.20)', purple:'rgba(156,39,176,0.20)',
        yellow:'rgba(255,235,59,0.20)', red:'rgba(244,67,54,0.20)'
    };
    const rarityCostDark = {
        gray:'rgba(150,150,150,0.05)', green:'rgba(76,175,80,0.08)',
        blue:'rgba(33,150,243,0.08)', purple:'rgba(156,39,176,0.08)',
        yellow:'rgba(255,235,59,0.08)', red:'rgba(244,67,54,0.08)'
    };
    const rarityToWeapon = { gray:'knife', green:'gun', blue:'rifle', purple:'sniper', yellow:'tank', red:'jet' };

    function equipCard(i, loadout, itemType) {
        const costs = loadout.equipmentCosts || {};
        const cost = costs[itemType] !== undefined ? costs[itemType] : 0;
        let rarity, imgSrc, label, statsHtml;

        if (itemType === 'weapon') {
            rarity = getRarityFromStats('weapon', loadout.weapon.primary, loadout.weapon.secondary);
            imgSrc = 'assets/' + rarityToWeapon[rarity] + '.png';
            label = 'Weapon';
            statsHtml = `<div class="equipment-compact-stats">
                    <div class="equipment-stat">
                        <span class="stat-label">Atk</span>
                        <input type="number" class="equipment-compact-input equipment-compact-input-no-suffix" value="${loadout.weapon.primary}" min="20" max="280" onchange="updateMsLoadoutGear(${i},'weapon.primary',parseInt(this.value))">
                    </div>
                    <div class="equipment-stat">
                        <span class="stat-label">Crit</span>
                        <div class="input-with-suffix">
                            <input type="number" class="equipment-compact-input equipment-compact-input-weapon-crit" value="${loadout.weapon.secondary}" min="1" max="40" onchange="updateMsLoadoutGear(${i},'weapon.secondary',parseInt(this.value))">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                </div>`;
        } else if (itemType === 'helmet') {
            rarity = getRarityFromStats('helmet', loadout.armors.helmet);
            imgSrc = 'assets/helmet.png'; label = 'Helmet';
            statsHtml = `<div class="equipment-compact-stats"><div class="equipment-stat-single"><div class="stat-name"><span class="stat-label">Crit Dmg</span></div><div class="stat-input-wrapper"><div class="input-with-suffix"><input type="number" class="equipment-compact-input" value="${loadout.armors.helmet}" min="1" max="80" onchange="updateMsLoadoutGear(${i},'armors.helmet',parseInt(this.value))"><span class="input-suffix">%</span></div></div></div></div>`;
        } else if (itemType === 'chest') {
            rarity = getRarityFromStats('chest', loadout.armors.chest);
            imgSrc = 'assets/chest.png'; label = 'Chest';
            statsHtml = `<div class="equipment-compact-stats"><div class="equipment-stat-single"><div class="stat-name"><span class="stat-label">Armor</span></div><div class="stat-input-wrapper"><div class="input-with-suffix"><input type="number" class="equipment-compact-input" value="${loadout.armors.chest}" min="1" max="60" onchange="updateMsLoadoutGear(${i},'armors.chest',parseInt(this.value))"><span class="input-suffix">%</span></div></div></div></div>`;
        } else if (itemType === 'pants') {
            rarity = getRarityFromStats('pants', loadout.armors.pants);
            imgSrc = 'assets/pants.png'; label = 'Pants';
            statsHtml = `<div class="equipment-compact-stats"><div class="equipment-stat-single"><div class="stat-name"><span class="stat-label">Armor</span></div><div class="stat-input-wrapper"><div class="input-with-suffix"><input type="number" class="equipment-compact-input" value="${loadout.armors.pants}" min="1" max="60" onchange="updateMsLoadoutGear(${i},'armors.pants',parseInt(this.value))"><span class="input-suffix">%</span></div></div></div></div>`;
        } else if (itemType === 'boots') {
            rarity = getRarityFromStats('boots', loadout.armors.boots);
            imgSrc = 'assets/boots.png'; label = 'Boots';
            statsHtml = `<div class="equipment-compact-stats"><div class="equipment-stat-single"><div class="stat-name"><span class="stat-label">Dodge</span></div><div class="stat-input-wrapper"><div class="input-with-suffix"><input type="number" class="equipment-compact-input" value="${loadout.armors.boots}" min="1" max="40" onchange="updateMsLoadoutGear(${i},'armors.boots',parseInt(this.value))"><span class="input-suffix">%</span></div></div></div></div>`;
        } else if (itemType === 'gloves') {
            rarity = getRarityFromStats('gloves', loadout.armors.gloves);
            imgSrc = 'assets/gloves.png'; label = 'Gloves';
            statsHtml = `<div class="equipment-compact-stats"><div class="equipment-stat-single"><div class="stat-name"><span class="stat-label">Precision</span></div><div class="stat-input-wrapper"><div class="input-with-suffix"><input type="number" class="equipment-compact-input" value="${loadout.armors.gloves}" min="1" max="40" onchange="updateMsLoadoutGear(${i},'armors.gloves',parseInt(this.value))"><span class="input-suffix">%</span></div></div></div></div>`;
        }

        const bg = rarityColors[rarity];
        const bgDark = rarityColorsDark[rarity];
        const bgCost = rarityCostDark[rarity];

        return `<div class="equipment-compact-item" id="ms-${itemType}-item-${i}" style="background:${bg}">
                <div class="equipment-header">
                    <img class="equip-img" src="${imgSrc}" alt="${label}">
                    <div class="equipment-compact-label">${label}</div>
                </div>
                <div class="equipment-stats-box" id="ms-${itemType}-stats-${i}" style="background:${bgDark}">
                    ${statsHtml}
                </div>
                <div class="equipment-cost-box" id="ms-${itemType}-cost-${i}" style="background:${bgCost}">
                    <div class="input-with-suffix">
                        <input type="number" class="equipment-compact-input" value="${cost}" min="0" onchange="updateLoadoutCost(${i},'${itemType}',parseFloat(this.value))">
                        <span class="input-suffix">cc</span>
                    </div>
                </div>
            </div>`;
    }

    container.innerHTML = loadouts.map((loadout, i) => {
        const isExpanded = expandedLoadoutIndex === i;
        const rarity = getLoadoutRarity(loadout);
        const summary = getLoadoutSummaryText(loadout, i);
        const letter = loadout.name || String.fromCharCode(65 + i);

        const ammoOptions = [
            { value: '', label: 'None' },
            { value: 'light', label: 'Light' },
            { value: 'ammo', label: 'Ammo' },
            { value: 'heavy', label: 'Heavy' }
        ];
        const foodOptions = [
            { value: '', label: 'None' },
            { value: 'bread', label: 'Bread' },
            { value: 'steak', label: 'Steak' },
            { value: 'fish', label: 'Fish' }
        ];

        const ammoButtons = ammoOptions.map(opt => {
            const active = (loadout.ammo || '') === opt.value;
            return `<button class="ms-ammo-btn ${active ? 'ms-ammo-active' : ''}" onclick="updateLoadoutAmmo(${i}, '${opt.value}')">${opt.label}</button>`;
        }).join('');

        const foodButtons = foodOptions.map(opt => {
            const active = (loadout.food || '') === opt.value;
            return `<button class="ms-ammo-btn ${active ? 'ms-ammo-active' : ''}" onclick="updateLoadoutFood(${i}, '${opt.value}')">${opt.label}</button>`;
        }).join('');

        const pillOnActive = loadout.pill ? 'ms-ammo-active' : '';
        const pillOffActive = !loadout.pill ? 'ms-ammo-active' : '';

        const lPhases = getItemPhases(loadout);
        return `
            <div class="ms-loadout-item ms-rarity-${rarity}" draggable="true"
                ondragstart="onLoadoutDragStart(event,${i})" ondragover="onLoadoutDragOver(event,${i})"
                ondrop="onLoadoutDrop(event,${i})" ondragend="onLoadoutDragEnd(event)">
                <div class="ms-loadout-header" onclick="toggleLoadoutExpand(${i})">
                    <span class="ms-drag-handle ms-drag-handle-inline" onclick="event.stopPropagation()" title="Arrastar">⠿</span>
                    <span class="ms-loadout-arrow">${isExpanded ? '▼' : '▶'}</span>
                    <span class="ms-loadout-summary">${summary}</span>
                    <div class="ms-phase-row ms-phase-row-inline" onclick="event.stopPropagation()">
                        <button class="ms-phase-btn ms-phase-btn-pre ${lPhases.includes('prePill')?'ms-phase-active':''}" onclick="toggleLoadoutPhase(${i},'prePill')">Pré</button>
                        <button class="ms-phase-btn ms-phase-btn-burst ${lPhases.includes('burst')?'ms-phase-active':''}" onclick="toggleLoadoutPhase(${i},'burst')">Burst</button>
                        <button class="ms-phase-btn ms-phase-btn-sust ${lPhases.includes('sustained')?'ms-phase-active':''}" onclick="toggleLoadoutPhase(${i},'sustained')">Sust.</button>
                    </div>
                    <div class="ms-loadout-actions" onclick="event.stopPropagation()">
                        <button class="ms-action-btn ms-action-dup" onclick="duplicateLoadout(${i})" title="Duplicar">⧉</button>
                        ${loadouts.length > 1 ? `<button class="ms-action-btn ms-action-del" onclick="removeLoadout(${i})" title="Excluir">✕</button>` : ''}
                    </div>
                </div>
                ${isExpanded ? `
                <div class="ms-loadout-editor">
                    <div class="ms-editor-row">
                        <label class="ms-label">Name</label>
                        <input type="text" class="ms-input ms-input-name" value="${letter}" onchange="updateLoadoutName(${i}, this.value)" placeholder="A">
                    </div>
                    <div class="ms-sub-header">ARMOR</div>
                    <div class="equipment-compact-grid">
                        ${equipCard(i, loadout, 'helmet')}
                        ${equipCard(i, loadout, 'chest')}
                        ${equipCard(i, loadout, 'pants')}
                        ${equipCard(i, loadout, 'boots')}
                        ${equipCard(i, loadout, 'gloves')}
                    </div>
                    <div class="ms-sub-header">CONSUMABLES</div>
                    <div class="ms-consumables-row">
                        <div class="ms-consump-group">
                            <span class="ms-label">Pill</span>
                            <div class="ms-ammo-group">
                                <button class="ms-ammo-btn ${pillOnActive}" onclick="updateLoadoutField(${i},'pill',true)">On</button>
                                <button class="ms-ammo-btn ${pillOffActive}" onclick="updateLoadoutField(${i},'pill',false)">Off</button>
                            </div>
                        </div>
                        <div class="ms-consump-group">
                            <span class="ms-label">Ammo</span>
                            <div class="ms-ammo-group">${ammoButtons}</div>
                        </div>
                        <div class="ms-consump-group">
                            <span class="ms-label">Food</span>
                            <div class="ms-ammo-group">${foodButtons}</div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML += `<button class="ms-add-btn" onclick="addLoadout()">+ Add Loadout</button>`;
}

function renderStagePipeline() {
    const container = document.getElementById('stagePipeline');
    if (!container) return;
    const loadouts = state.multiStage.loadouts;
    const weapons = state.multiStage.weapons || [];

    const phases = [
        { key: 'prePill',   label: t('phase.prePill'),   desc: t('phase.prePill.desc'), cls: 'ms-phase-pre' },
        { key: 'burst',     label: t('phase.burst'),     desc: t('phase.burst.desc'),   cls: 'ms-phase-burst' },
        { key: 'sustained', label: t('phase.sustained'), desc: t('phase.sustained.desc'), cls: 'ms-phase-sust' }
    ];

    container.innerHTML = phases.map(ph => {
        const phWeapons  = weapons.filter(w  => getItemPhases(w).includes(ph.key));
        const phLoadouts = loadouts.filter(l => getItemPhases(l).includes(ph.key));

        const weaponTags = phWeapons.length
            ? phWeapons.map(w => `<span class="ms-phase-tag ms-phase-tag-weapon">${w.name || '?'}</span>`).join('')
            : `<span class="ms-phase-tag ms-phase-tag-empty">${t('phase.noWeapon')}</span>`;

        const loadoutTags = phLoadouts.length
            ? phLoadouts.map(l => `<span class="ms-phase-tag ms-phase-tag-loadout">${l.name || '?'}</span>`).join('')
            : `<span class="ms-phase-tag ms-phase-tag-empty">${t('phase.noArmor')}</span>`;

        const warn = (phWeapons.length === 0 || phLoadouts.length === 0) && (phWeapons.length + phLoadouts.length > 0)
            ? `<span class="ms-phase-warn">${t('phase.incomplete')}</span>` : '';

        return `
        <div class="ms-phase-block ${ph.cls}">
            <div class="ms-phase-block-title">
                <span class="ms-phase-block-label">${ph.label}</span>
                <span class="ms-phase-block-desc">${ph.desc}</span>
                ${warn}
            </div>
            <div class="ms-phase-block-body">
                <div class="ms-phase-block-row">
                    <span class="ms-phase-block-rowlabel">${t('phase.weapons')}</span>
                    <div class="ms-phase-tags">${weaponTags}</div>
                </div>
                <div class="ms-phase-block-row">
                    <span class="ms-phase-block-rowlabel">${t('phase.armors')}</span>
                    <div class="ms-phase-tags">${loadoutTags}</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function toggleLoadoutExpand(index) {
    expandedLoadoutIndex = expandedLoadoutIndex === index ? -1 : index;
    renderLoadoutList();
}

function duplicateLoadout(index) {
    const orig = state.multiStage.loadouts[index];
    const copy = JSON.parse(JSON.stringify(orig));
    copy.name = (copy.name || String.fromCharCode(65 + index)) + '2';
    state.multiStage.loadouts.splice(index + 1, 0, copy);
    expandedLoadoutIndex = -1;
    renderMultiStageUI();
    saveState();
}

function onLoadoutDragStart(e, index) {
    dragLoadoutFrom = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.closest('.ms-loadout-item').classList.add('ms-dragging');
}

function onLoadoutDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.ms-loadout-item').forEach(el => el.classList.remove('ms-drag-over'));
    const item = e.currentTarget.closest('.ms-loadout-item');
    if (item) item.classList.add('ms-drag-over');
}

function onLoadoutDrop(e, index) {
    e.preventDefault();
    document.querySelectorAll('.ms-loadout-item').forEach(el => el.classList.remove('ms-drag-over', 'ms-dragging'));
    if (dragLoadoutFrom === null || dragLoadoutFrom === index) { dragLoadoutFrom = null; return; }
    const moved = state.multiStage.loadouts.splice(dragLoadoutFrom, 1)[0];
    state.multiStage.loadouts.splice(index, 0, moved);
    dragLoadoutFrom = null;
    expandedLoadoutIndex = -1;
    renderMultiStageUI();
    saveState();
}

function onLoadoutDragEnd(e) {
    document.querySelectorAll('.ms-loadout-item').forEach(el => el.classList.remove('ms-drag-over', 'ms-dragging'));
    dragLoadoutFrom = null;
}

function addLoadout() {
    const newLoadout = getDefaultLoadout();
    newLoadout.name = String.fromCharCode(65 + state.multiStage.loadouts.length);
    state.multiStage.loadouts.push(newLoadout);
    expandedLoadoutIndex = state.multiStage.loadouts.length - 1;
    renderMultiStageUI();
    saveState();
}

function removeLoadout(index) {
    if (state.multiStage.loadouts.length <= 1) return;
    state.multiStage.loadouts.splice(index, 1);

    // Fix stage references
    state.multiStage.stages = state.multiStage.stages.filter(s => s.loadoutIndex !== index);
    state.multiStage.stages.forEach(s => {
        if (s.loadoutIndex > index) s.loadoutIndex--;
    });
    if (state.multiStage.stages.length === 0) {
        state.multiStage.stages.push({ loadoutIndex: 0, phase: 'burst' });
    }

    if (expandedLoadoutIndex >= state.multiStage.loadouts.length) {
        expandedLoadoutIndex = state.multiStage.loadouts.length - 1;
    }
    renderMultiStageUI();
    saveState();
}

function updateLoadoutName(index, value) {
    state.multiStage.loadouts[index].name = value.trim();
    renderStagePipeline();
    saveState();
}

function updateLoadoutField(index, field, value) {
    const loadout = state.multiStage.loadouts[index];
    const parts = field.split('.');
    if (parts.length === 2) {
        loadout[parts[0]][parts[1]] = value;
    } else {
        loadout[field] = value;
    }

    // Recalculate equipment costs based on rarity
    const weaponRarity = getRarityFromStats('weapon', loadout.weapon.primary, loadout.weapon.secondary);
    loadout.equipmentCosts.weapon = state.weaponRarityCosts[weaponRarity];
    ['helmet', 'chest', 'pants', 'boots', 'gloves'].forEach(piece => {
        const rarity = getRarityFromStats(piece, loadout.armors[piece]);
        loadout.equipmentCosts[piece] = state.armorRarityCosts[rarity];
    });

    renderLoadoutList();
    saveState();
}

function updateLoadoutAmmo(index, value) {
    state.multiStage.loadouts[index].ammo = value || null;
    renderLoadoutList();
    saveState();
}

function updateLoadoutFood(index, value) {
    state.multiStage.loadouts[index].food = value || null;
    renderLoadoutList();
    saveState();
}

function updateMsLoadoutGear(index, field, value) {
    const loadout = state.multiStage.loadouts[index];
    const parts = field.split('.');
    if (parts.length === 2) {
        loadout[parts[0]][parts[1]] = value;
    } else {
        loadout[field] = value;
    }

    let itemType;
    if (field.startsWith('weapon')) itemType = 'weapon';
    else if (field.includes('helmet')) itemType = 'helmet';
    else if (field.includes('chest')) itemType = 'chest';
    else if (field.includes('pants')) itemType = 'pants';
    else if (field.includes('boots')) itemType = 'boots';
    else if (field.includes('gloves')) itemType = 'gloves';

    if (itemType && loadout.equipmentCosts) {
        const costMap = itemType === 'weapon' ? state.weaponRarityCosts : state.armorRarityCosts;
        let rarity;
        if (itemType === 'weapon') {
            rarity = getRarityFromStats('weapon', loadout.weapon.primary, loadout.weapon.secondary);
        } else {
            rarity = getRarityFromStats(itemType, loadout.armors[itemType]);
        }
        const newCost = costMap[rarity];
        loadout.equipmentCosts[itemType] = newCost;
        const costBox = document.getElementById('ms-' + itemType + '-cost-' + index);
        if (costBox) {
            const costInput = costBox.querySelector('input');
            if (costInput) costInput.value = newCost;
        }
        updateMsEquipRarity(index, itemType);
    }
    saveState();
}

function updateMsEquipRarity(index, itemType) {
    const loadout = state.multiStage.loadouts[index];
    const rarityColors = {
        gray:'rgba(150,150,150,0.3)', green:'rgba(76,175,80,0.35)',
        blue:'rgba(33,150,243,0.35)', purple:'rgba(156,39,176,0.35)',
        yellow:'rgba(255,235,59,0.35)', red:'rgba(244,67,54,0.35)'
    };
    const rarityColorsDark = {
        gray:'rgba(150,150,150,0.15)', green:'rgba(76,175,80,0.20)',
        blue:'rgba(33,150,243,0.20)', purple:'rgba(156,39,176,0.20)',
        yellow:'rgba(255,235,59,0.20)', red:'rgba(244,67,54,0.20)'
    };
    const rarityCostDark = {
        gray:'rgba(150,150,150,0.05)', green:'rgba(76,175,80,0.08)',
        blue:'rgba(33,150,243,0.08)', purple:'rgba(156,39,176,0.08)',
        yellow:'rgba(255,235,59,0.08)', red:'rgba(244,67,54,0.08)'
    };

    let rarity;
    if (itemType === 'weapon') {
        rarity = getRarityFromStats('weapon', loadout.weapon.primary, loadout.weapon.secondary);
        const rarityToWeapon = { gray:'knife', green:'gun', blue:'rifle', purple:'sniper', yellow:'tank', red:'jet' };
        const itemEl = document.getElementById('ms-weapon-item-' + index);
        if (itemEl) {
            const img = itemEl.querySelector('.equip-img');
            if (img) img.src = 'assets/' + rarityToWeapon[rarity] + '.png';
        }
    } else {
        rarity = getRarityFromStats(itemType, loadout.armors[itemType]);
    }

    const itemEl = document.getElementById('ms-' + itemType + '-item-' + index);
    const statsEl = document.getElementById('ms-' + itemType + '-stats-' + index);
    const costEl = document.getElementById('ms-' + itemType + '-cost-' + index);
    if (itemEl) itemEl.style.background = rarityColors[rarity];
    if (statsEl) statsEl.style.background = rarityColorsDark[rarity];
    if (costEl) costEl.style.background = rarityCostDark[rarity];
}

function updateLoadoutCost(index, piece, value) {
    const loadout = state.multiStage.loadouts[index];
    if (!loadout.equipmentCosts) loadout.equipmentCosts = {};
    loadout.equipmentCosts[piece] = value;
    saveState();
}

function addStage() {
    if (state.multiStage.stages.length >= 5) return;
    state.multiStage.stages.push({
        loadoutIndex: 0,
        phase: 'burst'
    });
    renderStagePipeline();
    saveState();
}

function removeStage(index) {
    if (state.multiStage.stages.length <= 1) return;
    state.multiStage.stages.splice(index, 1);
    renderStagePipeline();
    saveState();
}

function updateStage(index, field, value) {
    state.multiStage.stages[index][field] = value;
    saveState();
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZER UI
// ─────────────────────────────────────────────────────────────────────────────
let _optimizerWorker = null;
let _optMode = 'damage'; // 'damage' | 'budget'

function setOptMode(mode) {
    _optMode = mode;
    document.getElementById('optModeA').classList.toggle('active', mode === 'damage');
    document.getElementById('optModeB').classList.toggle('active', mode === 'budget');
    document.getElementById('optTargetRow').style.display = mode === 'damage' ? '' : 'none';
    document.getElementById('optBudgetRow').style.display = mode === 'budget' ? '' : 'none';
}

function _buildPinnedFromState() {
    const pinned = {};

    // Skills are always locked to current state — optimizer only varies gear/ammo/food
    const sk = state.skills;
    pinned.skills = {
        0: sk.attack     || 0,
        1: sk.precision  || 0,
        2: sk.critChance || 0,
        3: sk.critDamage || 0,
        4: sk.armor      || 0,
        5: sk.dodge      || 0,
        6: sk.health     || 0,
        7: sk.hunger     || 0
    };

    const pinGear = document.getElementById('optPinGear').checked;
    if (pinGear) {
        // read gear from first multi-stage loadout if available, else current state
        const rarityIndexMap = { gray:0, green:1, blue:2, purple:3, yellow:4, red:5 };
        const ldt = state.multiStage && state.multiStage.loadouts && state.multiStage.loadouts[0];
        const w = ldt ? ldt.weapon : state.weapon;
        const a = ldt ? ldt.armors : state.armors;
        const wR = rarityIndexMap[getRarityFromStats('weapon', w.primary, w.secondary)] || 0;
        pinned.gear = {
            wR,
            helmR:  rarityIndexMap[getRarityFromStats('helmet', a.helmet)] || 0,
            chestR: rarityIndexMap[getRarityFromStats('chest',  a.chest)]  || 0,
            pantsR: rarityIndexMap[getRarityFromStats('pants',  a.pants)]  || 0,
            bootsR: rarityIndexMap[getRarityFromStats('boots',  a.boots)]  || 0,
            glovR:  rarityIndexMap[getRarityFromStats('gloves', a.gloves)] || 0
        };
    }
    return pinned;
}

function runOptimizer() {
    if (_optimizerWorker) { _optimizerWorker.terminate(); _optimizerWorker = null; }

    const speedMap = {
        fast:     { popSize: 150, nGen: 100 },
        normal:   { popSize: 300, nGen: 200 },
        thorough: { popSize: 500, nGen: 400 },
        ultra:    { popSize: 800, nGen: 600 }
    };
    const speed = document.getElementById('optSpeed').value;
    const { popSize, nGen } = speedMap[speed] || speedMap.normal;

    const cfg = {
        level:            state.level || 10,
        militaryRankBonus: state.militaryRankBonus || 0,
        battleBonusPct:   state.bonuses ? (state.bonuses.direct || 0) : 0,
        prePillHours:     state.battle ? (state.battle.prePillPhaseHours || 6) : 6,
        roundDuration:    state.battle ? (state.battle.roundDuration || 8) : 8,
        phase:            document.getElementById('optPhase').value,
        mode:             _optMode,
        targetDamage:     parseFloat(document.getElementById('optTargetDamage').value) || 500000,
        budgetCap:        parseFloat(document.getElementById('optBudgetCap').value) || 100,
        buffCosts:        { ...state.buffCosts },
        coinPerScrap:     parseFloat(document.getElementById('coinPerScrap')?.value) || 0,
        pinned:           _buildPinnedFromState(),
        popSize,
        nGen
    };

    // UI: running state
    const runBtn = document.getElementById('optRunBtn');
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Calculando…';
    document.getElementById('optProgressWrap').style.display = '';
    document.getElementById('optProgressFill').style.width = '0%';
    document.getElementById('optProgressLabel').textContent = '0%';
    document.getElementById('optResults').innerHTML = `<div class="opt-hint">${t('opt.running')}</div>`;

    _optimizerWorker = new Worker('optimizer.js');
    _optimizerWorker.onmessage = function(e) {
        const { type, pct, pareto, message } = e.data;
        if (type === 'progress') {
            document.getElementById('optProgressFill').style.width = pct + '%';
            document.getElementById('optProgressLabel').textContent = pct + '%';
        } else if (type === 'result') {
            runBtn.disabled = false;
            runBtn.textContent = '▶ EXECUTAR';
            renderOptimizerResults(pareto, cfg);
            _optimizerWorker = null;
        } else if (type === 'error') {
            runBtn.disabled = false;
            runBtn.textContent = t('opt.run');
            document.getElementById('optResults').innerHTML = `<div class="opt-hint opt-error">${t('opt.error', message)}</div>`;
            _optimizerWorker = null;
        }
    };
    _optimizerWorker.postMessage({ type: 'start', config: cfg });
}

function renderOptimizerResults(pareto, cfg) {
    const mode = cfg.mode;
    const fmt = n => n >= 1e6
        ? (n / 1e6).toFixed(2) + 'M'
        : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : Math.round(n).toString();

    // Filter based on mode
    let candidates = pareto;
    if (mode === 'damage') {
        candidates = pareto.filter(b => b.damage >= cfg.targetDamage);
        if (candidates.length === 0) {
            // show closest to target
            candidates = [...pareto].sort((a, b) => Math.abs(a.damage - cfg.targetDamage) - Math.abs(b.damage - cfg.targetDamage)).slice(0, 5);
        } else {
            candidates.sort((a, b) => a.gearCost - b.gearCost); // cheapest gear first
        }
    } else {
        // Budget mode: filter by gear cost (weapons + armor + food only, no ammo/pill)
        candidates = pareto.filter(b => b.gearCost <= cfg.budgetCap);
        if (candidates.length === 0) {
            candidates = [...pareto].sort((a, b) => a.gearCost - b.gearCost).slice(0, 5);
        } else {
            candidates.sort((a, b) => b.damage - a.damage); // most damage first
        }
    }
    const top = candidates.slice(0, 7);

    const rarityColors = { Cinza:'#aaa', Verde:'#4caf50', Azul:'#2196f3', Roxo:'#9c27b0', Amarelo:'#ffeb3b', Vermelho:'var(--accent-red)' };

    const rarityDot = (rarity) => `<span class="opt-rarity-dot" style="background:${rarityColors[rarity] || '#aaa'}"></span>`;

    const gearBlock = (g, label) => `
        ${label ? `<div class="opt-phase-gear-label">${label}</div>` : ''}
        <div class="opt-gear-row">${rarityDot(g.weapon.rarity)}<span class="opt-gear-label">${t('equip.weapon')}</span><span class="opt-gear-val"><b>${g.weapon.rarity}</b></span></div>
        <div class="opt-gear-row">${rarityDot(g.helmet.rarity)}<span class="opt-gear-label">${t('equip.helmet')}</span><span class="opt-gear-val"><b>${g.helmet.rarity}</b></span></div>
        <div class="opt-gear-row">${rarityDot(g.chest.rarity)}<span class="opt-gear-label">${t('equip.chest')}</span><span class="opt-gear-val"><b>${g.chest.rarity}</b></span></div>
        <div class="opt-gear-row">${rarityDot(g.pants.rarity)}<span class="opt-gear-label">${t('equip.pants')}</span><span class="opt-gear-val"><b>${g.pants.rarity}</b></span></div>
        <div class="opt-gear-row">${rarityDot(g.boots.rarity)}<span class="opt-gear-label">${t('equip.boots')}</span><span class="opt-gear-val"><b>${g.boots.rarity}</b></span></div>
        <div class="opt-gear-row">${rarityDot(g.gloves.rarity)}<span class="opt-gear-label">${t('equip.gloves')}</span><span class="opt-gear-val"><b>${g.gloves.rarity}</b></span></div>`;

    const cards = top.map((b, i) => {
        const skillBudget = cfg.level * 4;
        const usedSP = b.ind.slice(0, 8).reduce((a, v) => a + v, 0);
        const skillLabels = ['ATK','PRC','CC','CD','ARM','DDG','HP','HNG'];
        const skillPills = b.ind.slice(0, 8).map((v, si) =>
            v > 0 ? `<span class="opt-skill-pill">${skillLabels[si]}<b>${v}</b></span>` : ''
        ).join('');

        const gearSection = b.multiPhase
            ? `<div class="opt-multiphase-gear">
                   <div class="opt-phase-section">${gearBlock(b.gearPrePill, t('phase.prePill'))}</div>
                   <div class="opt-phase-section">${gearBlock(b.gearBurst, t('phase.burst'))}</div>
                   <div class="opt-phase-section">${gearBlock(b.gearSustained, t('phase.sustained'))}</div>
               </div>`
            : `<div class="opt-gear-list">${gearBlock(b.gear, '')}</div>`;

        // Build stats debug block
        const statsBlock = (s, label) => {
            if (!s) return '';
            const precLine = s.rawHitChance > 100
                ? `<span>${t('opt.stat.rawPrec')}</span><span>${s.rawHitChance}% → <span style="color:var(--accent-amber)">${t('opt.stat.precOverflow', s.precOverflowAtk)}</span></span>`
                : `<span>${t('opt.stat.precision')}</span><span>${s.rawHitChance}%</span>`;
            return `<div class="opt-stats-block">
                ${label ? `<div class="opt-stats-label">${label}</div>` : ''}
                <div class="opt-stats-grid">
                    <span>${t('opt.stat.atkFinal')}</span><span>${s.atk}</span>
                    ${precLine}
                    <span>${t('opt.stat.critChance')}</span><span>${s.critChance}%</span>
                    <span>${t('opt.stat.critDmg')}</span><span>${s.critDmgPct}%</span>
                    <span>${t('opt.stat.armor')}</span><span>${s.armorPct}%</span>
                    <span>${t('opt.stat.dodge')}</span><span>${s.dodgePct}%</span>
                    <span>${t('opt.stat.hpAvailable')}</span><span>${s.hp}</span>
                    <span>${t('opt.stat.dmgPerHit')}</span><span>${s.dmgPerRound}</span>
                    <span>${t('opt.stat.numAttacks')}</span><span>${s.nHits}</span>
                    <span>${t('opt.stat.dmgPerAttack')}</span><span>${s.eDmgPerHit}</span>
                    <span>${t('opt.stat.weaponDur')}</span><span>${s.wDurUsed}%</span>
                    <span>${t('opt.stat.armorDur')}</span><span>${s.aDurUsed.toFixed(1)}%</span>
                    <span>${t('opt.stat.phaseCost')}</span><span>${s.cost}cc</span>
                    <span>${t('opt.stat.phaseDmg')}</span><span>${fmt(s.damage)}</span>
                </div>
            </div>`;
        };

        let statsSection = '';
        if (b.phaseStats) {
            if (b.multiPhase) {
                statsSection = `<details class="opt-stats-details"><summary>${t('opt.viewStats')}</summary>
                    ${statsBlock(b.phaseStats.prePill, t('phase.prePill'))}
                    ${statsBlock(b.phaseStats.burst, t('phase.burst'))}
                    ${statsBlock(b.phaseStats.sustained, t('phase.sustained'))}
                </details>`;
            } else {
                const ph = Object.keys(b.phaseStats)[0];
                statsSection = `<details class="opt-stats-details"><summary>${t('opt.viewStats')}</summary>
                    ${statsBlock(b.phaseStats[ph], '')}
                </details>`;
            }
        }

        return `
        <div class="opt-result-card ${i === 0 ? 'opt-card-best' : ''}">
            <div class="opt-card-header">
                <span class="opt-card-rank">#${i + 1}${i === 0 ? ' ★' : ''}</span>
                <span class="opt-card-damage">${fmt(b.damage)} dano</span>
                <span class="opt-card-cost">${b.gearCost.toFixed(1)}cc</span>
                <button class="opt-apply-btn" onclick="applyOptimizerBuild(${i})">Aplicar</button>
            </div>
            <div class="opt-card-body">
                <div class="opt-skills-row">${skillPills || '<span class="opt-hint-sm">Sem skills de combate</span>'}</div>
                <div class="opt-sp-note">${usedSP}/${skillBudget} pts usados</div>
                ${gearSection}
                <div class="opt-buffs-row">
                    <span class="opt-buff-pill">🔹 ${b.ammo}</span>
                    <span class="opt-buff-pill">🍖 ${b.food}</span>
                </div>
                ${statsSection}
            </div>
        </div>`;
    }).join('');

    const modeInfo = mode === 'damage'
        ? `<div class="opt-result-info">${t('opt.buildsAboveDmg', fmt(cfg.targetDamage))}</div>`
        : `<div class="opt-result-info">${t('opt.buildsUnderBudget', cfg.budgetCap)}</div>`;

    document.getElementById('optResults').innerHTML = modeInfo + cards;
    // store results for applyOptimizerBuild
    window._optLastResults = top;
}

function applyOptimizerBuild(index) {
    if (!window._optLastResults || !window._optLastResults[index]) return;
    const b = window._optLastResults[index];

    // ── Skills ────────────────────────────────────────────────────────────────
    state.skills.attack     = b.skills.attack;
    state.skills.precision  = b.skills.precision;
    state.skills.critChance = b.skills.critChance;
    state.skills.critDamage = b.skills.critDamage;
    state.skills.armor      = b.skills.armor;
    state.skills.dodge      = b.skills.dodge;
    state.skills.health     = b.skills.health;
    state.skills.hunger     = b.skills.hunger;
    state.usedSkillPoints   = b.ind.slice(0, 8).reduce((a, v) => a + v, 0);

    // Update skill value labels in the left panel
    document.getElementById('attack-value').textContent     = b.skills.attack;
    document.getElementById('precision-value').textContent  = b.skills.precision;
    document.getElementById('critChance-value').textContent = b.skills.critChance;
    document.getElementById('critDamage-value').textContent = b.skills.critDamage;
    document.getElementById('armor-value').textContent      = b.skills.armor;
    document.getElementById('dodge-value').textContent      = b.skills.dodge;
    document.getElementById('health-value').textContent     = b.skills.health;
    document.getElementById('hunger-value').textContent     = b.skills.hunger;
    renderSkills();

    // ── Gear helpers ──────────────────────────────────────────────────────────
    const ammoKeyMap = ['', 'light', 'ammo', 'heavy'];
    const foodKeyMap = [null, 'bread', 'steak', 'fish'];
    const rarityMap  = { Cinza:'gray', Verde:'green', Azul:'blue', Roxo:'purple', Amarelo:'yellow', Vermelho:'red' };
    const wCosts     = state.weaponRarityCosts || rarityCostsDefaults;
    const aCosts     = state.armorRarityCosts  || rarityCostsDefaults;

    function applyGearToLoadout(ldt, g) {
        if (!ldt) return;
        ldt.weapon = ldt.weapon || {};
        ldt.armors = ldt.armors || {};
        ldt.equipmentCosts = ldt.equipmentCosts || {};
        ldt.weapon.primary   = g.weapon.primary;
        ldt.weapon.secondary = g.weapon.secondary;
        ldt.armors.helmet = g.helmet.stat;
        ldt.armors.chest  = g.chest.stat;
        ldt.armors.pants  = g.pants.stat;
        ldt.armors.boots  = g.boots.stat;
        ldt.armors.gloves = g.gloves.stat;
        ldt.equipmentCosts.weapon = wCosts[rarityMap[g.weapon.rarity] || 'gray'] || g.weapon.cost;
        ldt.equipmentCosts.helmet = aCosts[rarityMap[g.helmet.rarity] || 'gray'] || g.helmet.cost;
        ldt.equipmentCosts.chest  = aCosts[rarityMap[g.chest.rarity]  || 'gray'] || g.chest.cost;
        ldt.equipmentCosts.pants  = aCosts[rarityMap[g.pants.rarity]  || 'gray'] || g.pants.cost;
        ldt.equipmentCosts.boots  = aCosts[rarityMap[g.boots.rarity]  || 'gray'] || g.boots.cost;
        ldt.equipmentCosts.gloves = aCosts[rarityMap[g.gloves.rarity] || 'gray'] || g.gloves.cost;
        ldt.ammo = ammoKeyMap[b.ammoIdx] || null;
        ldt.food = foodKeyMap[b.foodIdx] || null;
    }

    function setWeapon(wl, idx, phases, g) {
        while (wl.length <= idx) wl.push(JSON.parse(JSON.stringify(getDefaultWeapon())));
        wl[idx].phases    = phases;
        wl[idx].primary   = g.weapon.primary;
        wl[idx].secondary = g.weapon.secondary;
        wl[idx].cost      = wCosts[rarityMap[g.weapon.rarity] || 'gray'] || g.weapon.cost;
    }

    // ── Ensure weapons array exists ────────────────────────────────────────────
    if (!state.multiStage.weapons) {
        state.multiStage.weapons = state.multiStage.loadouts.map((loadout, i) => ({
            name: loadout.name || String.fromCharCode(65 + i),
            primary:   loadout.weapon ? loadout.weapon.primary   : 40,
            secondary: loadout.weapon ? loadout.weapon.secondary : 5,
            cost:      loadout.equipmentCosts ? loadout.equipmentCosts.weapon : 2,
            phases:    ['prePill']
        }));
    }

    const ldts = state.multiStage.loadouts;
    const wl   = state.multiStage.weapons;

    // Helper: number of weapons needed for a phase based on nHits
    function weaponCount(phaseKey) {
        const ps = b.phaseStats && b.phaseStats[phaseKey];
        return ps ? Math.max(1, Math.ceil(ps.nHits / 100)) : 1;
    }

    // Short rarity label for weapon names
    const rarityLabel = { Cinza:'Cin', Verde:'Vrd', Azul:'Azl', Roxo:'Rxo', Amarelo:'Aml', Vermelho:'Verm' };

    if (b.multiPhase) {
        const phaseGear = [
            { key: 'prePill',   gear: b.gearPrePill,   pill: false },
            { key: 'burst',     gear: b.gearBurst,     pill: true  },
            { key: 'sustained', gear: b.gearSustained, pill: true  }
        ];

        // --- Weapons: per phase, with shared boundary weapon when consecutive phases use same rarity ---
        // First pass: compute carry-over per phase using optimizer stats
        const phaseNHits = phaseGear.map(pg => {
            const ps = b.phaseStats && b.phaseStats[pg.key];
            return ps ? ps.nHits : 100;
        });
        // wDurRemaining[i] = weapon durability left after phase i
        const wDurAfter = [];
        for (let pi = 0; pi < phaseGear.length; pi++) {
            const hits = phaseNHits[pi];
            // Carry-over from previous phase if same weapon rarity
            const carryIn = (pi > 0 && phaseGear[pi].gear.weapon.idx === phaseGear[pi-1].gear.weapon.idx)
                ? wDurAfter[pi-1] : 0;
            // Remaining after consuming hits: first use carryIn, then fresh 100-dur weapons
            const afterCarry = hits - carryIn;
            if (afterCarry <= 0) {
                wDurAfter[pi] = carryIn - hits; // didn't even need a new weapon
            } else {
                wDurAfter[pi] = (100 - (afterCarry % 100)) % 100;
            }
        }

        // Second pass: create weapon entries
        wl.length = 0;
        for (let pi = 0; pi < phaseGear.length; pi++) {
            const pg    = phaseGear[pi];
            const hits  = phaseNHits[pi];
            const lbl   = rarityLabel[pg.gear.weapon.rarity] || pg.gear.weapon.rarity;
            const wCost = wCosts[rarityMap[pg.gear.weapon.rarity] || 'gray'] || pg.gear.weapon.cost;

            // Carry-over from previous phase?
            const prevSame = (pi > 0 && phaseGear[pi].gear.weapon.idx === phaseGear[pi-1].gear.weapon.idx);
            const carryIn  = prevSame ? wDurAfter[pi-1] : 0;

            // How many NEW weapons this phase needs (carry-over provides free hits)
            const hitsToPayFor = Math.max(0, hits - carryIn);
            const n = hitsToPayFor > 0 ? Math.ceil(hitsToPayFor / 100) : 0;

            // Check if next phase uses same rarity → last weapon becomes boundary
            const nextPg = phaseGear[pi + 1];
            const shareWithNext = nextPg && nextPg.gear.weapon.idx === pg.gear.weapon.idx;

            for (let k = 0; k < n; k++) {
                const isLast = (k === n - 1);
                const phases = [pg.key];
                if (isLast && shareWithNext) {
                    phases.push(nextPg.key);
                }
                wl.push({
                    name:      `${lbl} ${k + 1}/${n}`,
                    primary:   pg.gear.weapon.primary,
                    secondary: pg.gear.weapon.secondary,
                    cost:      wCost,
                    phases
                });
            }

            // If no new weapons but carry-over covers everything, the boundary weapon
            // from previous phase already has this phase in its phases[] — no extra needed
        }

        // --- Loadouts: per phase, with carry-over when same or superior armor set ---
        // armorMatch: true if next phase armor is same or lower rarity (can reuse current)
        function armorCanCarry(gCur, gNext) {
            return gCur.helmet.idx >= gNext.helmet.idx &&
                   gCur.chest.idx  >= gNext.chest.idx  &&
                   gCur.pants.idx  >= gNext.pants.idx  &&
                   gCur.boots.idx  >= gNext.boots.idx  &&
                   gCur.gloves.idx >= gNext.gloves.idx;
        }

        // Compute armor dur used per phase (aDurUsed from stats)
        const phaseADur = phaseGear.map(pg => {
            const ps = b.phaseStats && b.phaseStats[pg.key];
            return ps ? ps.aDurUsed : 100;
        });

        // Carry-over tracking for armor
        const aDurAfter = [];
        for (let pi = 0; pi < phaseGear.length; pi++) {
            const durUsed = phaseADur[pi];
            const prevCanCarry = (pi > 0 && armorCanCarry(phaseGear[pi-1].gear, phaseGear[pi].gear));
            const carryIn = prevCanCarry ? Math.max(0, aDurAfter[pi-1]) : 0;

            // If carry-over covers the dur needed, no new loadout required
            aDurAfter[pi] = carryIn > 0 ? (carryIn - durUsed) : (100 - durUsed);
        }

        ldts.length = 0;
        for (let pi = 0; pi < phaseGear.length; pi++) {
            const pg = phaseGear[pi];
            const prevCanCarry = (pi > 0 && armorCanCarry(phaseGear[pi-1].gear, phaseGear[pi].gear));
            const carryIn = prevCanCarry ? Math.max(0, aDurAfter[pi-1] + phaseADur[pi]) : 0;

            // If previous phase left enough durability (>1%), skip creating a new loadout
            // The boundary loadout from previous phase already covers this phase
            if (prevCanCarry && carryIn > 1) {
                // Already covered by previous phase's shared loadout — no new loadout needed
                continue;
            }

            const ldt = JSON.parse(JSON.stringify(getDefaultLoadout()));
            applyGearToLoadout(ldt, pg.gear);
            ldt.phases = [pg.key];
            ldt.pill   = pg.pill;

            // Check if next phase can reuse this armor → share the loadout
            const nextPg = phaseGear[pi + 1];
            if (nextPg && armorCanCarry(pg.gear, nextPg.gear) && aDurAfter[pi] > 1) {
                ldt.phases.push(nextPg.key);
                if (nextPg.pill) ldt.pill = true;
            }

            ldts.push(ldt);
        }
        // Safety: ensure at least 1 loadout exists
        if (ldts.length === 0) {
            const ldt = JSON.parse(JSON.stringify(getDefaultLoadout()));
            applyGearToLoadout(ldt, phaseGear[0].gear);
            ldt.phases = ['prePill', 'burst', 'sustained'];
            ldt.pill = true;
            ldts.push(ldt);
        }
    } else {
        applyGearToLoadout(ldts[0], b.gear);
        // Determine phase from phaseStats key
        const ph = (b.phaseStats && Object.keys(b.phaseStats)[0]) || (wl[0] && wl[0].phases && wl[0].phases[0]) || 'burst';
        ldts[0].phases = [ph];
        ldts[0].pill   = ph !== 'prePill';
        ldts.splice(1);
        const n   = weaponCount(ph);
        const lbl = rarityLabel[b.gear.weapon.rarity] || b.gear.weapon.rarity;
        wl.length = 0;
        for (let k = 0; k < n; k++) {
            wl.push({
                name:      `${lbl} ${k + 1}/${n}`,
                primary:   b.gear.weapon.primary,
                secondary: b.gear.weapon.secondary,
                cost:      wCosts[rarityMap[b.gear.weapon.rarity] || 'gray'] || b.gear.weapon.cost,
                phases:    [ph]
            });
        }
    }

    // Sync legacy weapon/armor state (used by calculateCurrentStats)
    const refGear = b.multiPhase ? b.gearBurst : b.gear;
    state.weapon.primary   = refGear.weapon.primary;
    state.weapon.secondary = refGear.weapon.secondary;
    state.armors.helmet = refGear.helmet.stat;
    state.armors.chest  = refGear.chest.stat;
    state.armors.pants  = refGear.pants.stat;
    state.armors.boots  = refGear.boots.stat;
    state.armors.gloves = refGear.gloves.stat;

    saveState();
    updateCurrentStatsDisplay();
    renderMultiStageUI();
    switchTab('configure');
}
