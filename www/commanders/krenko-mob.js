// commanders/krenko-mob.js - Updated for isolated commander states
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs['krenko-mob'] = {
    name: "Krenko, Mob Boss",
    baseStats: "3/3",
    primaryTokens: ['goblin'],
    artPath: "assets/art/krenko-mb.jpg",
    showCounters: false, // Don't show +1/+1 counters for Krenko
    trackingLabels: ['GOBLINS', 'GOBLIN TOKENS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'ADD GOBLIN', action: 'addGoblinCreature', class: 'primary-btn' },
        { text: 'REMOVE GOBLIN', action: 'removeGoblinCreature', class: 'danger-btn' },
        { text: 'KRENKO ABILITY', action: 'useKrenkoAbility', class: 'success-btn' }
    ],
    abilities: [
        { cost: 'T', name: "MOB BOSS", description: "TAP\nX GOBLINS" }
    ],
    
    // Add goblin token type to current state if it doesn't exist
    initializeTokenType: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        if (!currentState.tokenCounts.goblin) {
            currentState.tokenCounts.goblin = { untapped: 0, tapped: 0 };
        }
        if (currentState.goblinCreatures === undefined) {
            currentState.goblinCreatures = 0; // Start with 0, player adds as needed
        }
    },
    
    // Krenko-specific functions
    createGoblinToken: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Create single 1/1 red Goblin token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.goblin.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Goblin token → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} 1/1 red Goblin token`);
        }
        updateDisplay();
    },
    
    addGoblinCreature: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Add a non-token Goblin creature to the battlefield
        currentState.goblinCreatures += 1;
        
        addToHistory(`+1 Goblin creature (${currentState.goblinCreatures} total Goblins)`);
        updateDisplay();
    },
    
    removeGoblinCreature: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Remove a non-token Goblin creature
        if (currentState.goblinCreatures > 0) {
            currentState.goblinCreatures -= 1;
            addToHistory(`-1 Goblin creature (${currentState.goblinCreatures} Goblins remaining)`);
        } else {
            addToHistory(`No Goblin creatures to remove`);
        }
        updateDisplay();
    },
    
    // Krenko's activated ability: {T}: Create X 1/1 red Goblin creature tokens, where X is the number of Goblins you control
    useKrenkoAbility: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // X = ALL Goblins you control (creatures + tokens + Krenko himself)
        const goblinTokens = currentState.tokenCounts.goblin.untapped + currentState.tokenCounts.goblin.tapped;
        const totalGoblinsControlled = currentState.goblinCreatures + goblinTokens + 1; // +1 for Krenko
        
        const baseTokens = totalGoblinsControlled;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.goblin.untapped += finalTokens;
        
        addToHistory(`Krenko: ${totalGoblinsControlled} Goblins controlled → +${finalTokens} new Goblin tokens`);
        updateDisplay();
    },
    
    // Create multiple goblins at once (for other spells/effects)
    createMultipleGoblins: function(amount) {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        const finalTokens = applyTokenMultipliers(amount);
        currentState.tokenCounts.goblin.untapped += finalTokens;
        addToHistory(`+${finalTokens} 1/1 red Goblin tokens`);
        updateDisplay();
    },
    
    // Calculate total combat damage potential
    calculateCombatDamage: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const goblinCount = currentState.tokenCounts.goblin.untapped + currentState.tokenCounts.goblin.tapped;
        const krenkoPower = 3 + currentState.commanderCounters;
        
        // Goblins are 1/1, Krenko is 3/3 (plus counters)
        const goblinDamage = goblinCount * 1;
        const totalDamage = goblinDamage + krenkoPower;
        
        addToHistory(`Combat: ${goblinCount} Goblins (${goblinDamage}) + Krenko (${krenkoPower}) = ${totalDamage} damage`);
        return totalDamage;
    },
    
    // Quick reference for Krenko's ability potential
    checkKrenkoAbility: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const currentGoblins = currentState.tokenCounts.goblin.untapped + currentState.tokenCounts.goblin.tapped + 1; // +1 for Krenko
        const potentialTokens = applyTokenMultipliers(currentGoblins);
        
        addToHistory(`Krenko can create: ${potentialTokens} Goblins (${currentGoblins} current Goblins)`);
        return potentialTokens;
    },
    
    // Goblin tribal synergy - count ALL Goblins (tokens + creatures)
    getTotalGoblins: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const goblinTokens = currentState.tokenCounts.goblin.untapped + currentState.tokenCounts.goblin.tapped;
        return goblinTokens + currentState.goblinCreatures;
    },
    
    // Status display customization
    getStatusValue: function(index) {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        switch(index) {
            case 0: return currentState.goblinCreatures; // GOBLINS (manual creature counter)
            case 1: return currentState.tokenCounts.goblin.untapped + currentState.tokenCounts.goblin.tapped; // GOBLIN TOKENS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    },
    
    // Commander info display
    getCommanderDisplayInfo: function() {
        this.initializeTokenType();
        const currentState = getCurrentCommanderState();
        if (!currentState) return '';
        
        const goblinCreatures = currentState.goblinCreatures;
        const goblinTokens = currentState.tokenCounts.goblin.untapped + currentState.tokenCounts.goblin.tapped;
        const totalControlled = goblinCreatures + goblinTokens + 1; // +1 for Krenko
        const potentialTokens = applyTokenMultipliers(totalControlled);
        
        return `
            <span>Krenko: 3/3</span>
            <span>Total Goblins: ${totalControlled}</span>
            <span>Next tap: +${potentialTokens} tokens</span>
        `;
    }
};