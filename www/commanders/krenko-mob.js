// commanders/krenko-mob.js
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
    
    // Add goblin token type to game state if it doesn't exist
    initializeTokenType: function() {
        if (!gameState.tokenCounts.goblin) {
            gameState.tokenCounts.goblin = { untapped: 0, tapped: 0 };
        }
        if (gameState.goblinCreatures === undefined) {
            gameState.goblinCreatures = 0; // Start with 0, player adds as needed
        }
    },
    
    // Krenko-specific functions
    createGoblinToken: function() {
        this.initializeTokenType();
        
        // Create single 1/1 red Goblin token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.goblin.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Goblin token → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} 1/1 red Goblin token`);
        }
        updateDisplay();
    },
    
    addGoblinCreature: function() {
        this.initializeTokenType();
        
        // Add a non-token Goblin creature to the battlefield
        gameState.goblinCreatures += 1;
        
        addToHistory(`+1 Goblin creature (${gameState.goblinCreatures} total Goblins)`);
        updateDisplay();
    },
    
    removeGoblinCreature: function() {
        this.initializeTokenType();
        
        // Remove a non-token Goblin creature
        if (gameState.goblinCreatures > 0) {
            gameState.goblinCreatures -= 1;
            addToHistory(`-1 Goblin creature (${gameState.goblinCreatures} Goblins remaining)`);
        } else {
            addToHistory(`No Goblin creatures to remove`);
        }
        updateDisplay();
    },
    
    // Krenko's activated ability: {T}: Create X 1/1 red Goblin creature tokens, where X is the number of Goblins you control
    useKrenkoAbility: function() {
        this.initializeTokenType();
        
        // X = ALL Goblins you control (creatures + tokens + Krenko himself)
        const goblinTokens = gameState.tokenCounts.goblin.untapped + gameState.tokenCounts.goblin.tapped;
        const totalGoblinsControlled = gameState.goblinCreatures + goblinTokens + 1; // +1 for Krenko
        
        const baseTokens = totalGoblinsControlled;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.goblin.untapped += finalTokens;
        
        addToHistory(`Krenko: ${totalGoblinsControlled} Goblins controlled → +${finalTokens} new Goblin tokens`);
        updateDisplay();
    },
    
    // Create multiple goblins at once (for other spells/effects)
    createMultipleGoblins: function(amount) {
        this.initializeTokenType();
        
        const finalTokens = applyTokenMultipliers(amount);
        gameState.tokenCounts.goblin.untapped += finalTokens;
        addToHistory(`+${finalTokens} 1/1 red Goblin tokens`);
        updateDisplay();
    },
    
    // Calculate total combat damage potential
    calculateCombatDamage: function() {
        this.initializeTokenType();
        
        const goblinCount = gameState.tokenCounts.goblin.untapped + gameState.tokenCounts.goblin.tapped;
        const krenkoPower = 3 + gameState.commanderCounters;
        
        // Goblins are 1/1, Krenko is 3/3 (plus counters)
        const goblinDamage = goblinCount * 1;
        const totalDamage = goblinDamage + krenkoPower;
        
        addToHistory(`Combat: ${goblinCount} Goblins (${goblinDamage}) + Krenko (${krenkoPower}) = ${totalDamage} damage`);
        return totalDamage;
    },
    
    // Quick reference for Krenko's ability potential
    checkKrenkoAbility: function() {
        this.initializeTokenType();
        
        const currentGoblins = gameState.tokenCounts.goblin.untapped + gameState.tokenCounts.goblin.tapped + 1; // +1 for Krenko
        const potentialTokens = applyTokenMultipliers(currentGoblins);
        
        addToHistory(`Krenko can create: ${potentialTokens} Goblins (${currentGoblins} current Goblins)`);
        return potentialTokens;
    },
    
    // Goblin tribal synergy - count ALL Goblins (tokens + creatures)
    getTotalGoblins: function() {
        this.initializeTokenType();
        const goblinTokens = gameState.tokenCounts.goblin.untapped + gameState.tokenCounts.goblin.tapped;
        return goblinTokens + gameState.goblinCreatures;
    },
    
    // Status display customization
    getStatusValue: function(index) {
        this.initializeTokenType();
        
        switch(index) {
            case 0: return gameState.goblinCreatures; // GOBLINS (manual creature counter)
            case 1: return gameState.tokenCounts.goblin.untapped + gameState.tokenCounts.goblin.tapped; // GOBLIN TOKENS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    },
    
    // Commander info display
    getCommanderDisplayInfo: function() {
        this.initializeTokenType();
        
        const goblinCreatures = gameState.goblinCreatures;
        const goblinTokens = gameState.tokenCounts.goblin.untapped + gameState.tokenCounts.goblin.tapped;
        const totalControlled = goblinCreatures + goblinTokens + 1; // +1 for Krenko
        const potentialTokens = applyTokenMultipliers(totalControlled);
        
        return `
            <span>Krenko: 3/3</span>
            <span>Total Goblins: ${totalControlled}</span>
            <span>Next tap: +${potentialTokens} tokens</span>
        `;
    }
};