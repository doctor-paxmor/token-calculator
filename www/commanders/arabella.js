// commanders/arabella.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.arabella = {
    name: "Arabella, Abandoned Doll",
    baseStats: "1/3",
    primaryTokens: ['spirit'],
    trackingLabels: ['SPIRITS', 'DAMAGE DEALT', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE SPIRIT', action: 'createSpiritToken', class: 'primary-btn' },
        { text: 'TRIGGER DAMAGE', action: 'triggerCombatDamage', class: 'danger-btn' }
    ],
    abilities: [
        { cost: 0, name: "LIFELINK", description: "PASSIVE\nLIFELINK" },
        { cost: 0, name: "COMBAT DMG", description: "DAMAGE\nTO EACH OPP" },
        { cost: 0, name: "1 POWER", description: "ONLY 1\nPOWER MATTERS" }
    ],
    
    // Track total damage dealt to opponents
    damageDealtToOpponents: 0,
    
    // Arabella-specific functions
    createSpiritToken: function() {
        // Create 1/1 white Spirit creature token with flying
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.spirit.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Spirit → +${finalTokens} 1/1 flying Spirits (modified)`);
        } else {
            addToHistory(`+${finalTokens} 1/1 flying Spirit token`);
        }
        updateDisplay();
    },
    
    triggerCombatDamage: function() {
        // Arabella's ability: Whenever one or more creatures you control with power 1 deal combat damage to a player, each opponent loses 1 life and you gain 1 life.
        const powerOneCreatures = this.countPowerOneCreatures();
        
        if (powerOneCreatures > 0) {
            // Each opponent loses 1 life (simplified to track total damage)
            this.damageDealtToOpponents += 3; // Assuming 3 opponents in EDH
            
            addToHistory(`${powerOneCreatures} power-1 creatures deal damage → each opponent loses 1 life, you gain 1 life`);
            updateDisplay();
        } else {
            addToHistory(`No power-1 creatures to trigger Arabella`);
        }
    },
    
    countPowerOneCreatures: function() {
        // Count creatures with power 1 (most tokens, plus Arabella herself)
        const spiritCount = gameState.tokenCounts.spirit.untapped + gameState.tokenCounts.spirit.tapped;
        const arabellaPower = 1 + gameState.commanderCounters;
        
        let powerOneCount = spiritCount; // Spirits are 1/1
        
        // Add Arabella if she has power 1
        if (arabellaPower === 1) {
            powerOneCount += 1;
        }
        
        return powerOneCount;
    },
    
    // Combat math with Arabella's ability
    calculateCombatValue: function() {
        const powerOneCreatures = this.countPowerOneCreatures();
        const spiritCount = gameState.tokenCounts.spirit.untapped + gameState.tokenCounts.spirit.tapped;
        const arabellaPower = 1 + gameState.commanderCounters;
        
        // Direct combat damage
        const combatDamage = spiritCount + arabellaPower; // Spirits deal 1 each, Arabella deals her power
        
        // Arabella's triggered ability damage (if any power-1 creatures connect)
        const triggeredDamage = powerOneCreatures > 0 ? 3 : 0; // 1 life loss per opponent
        
        const totalValue = combatDamage + triggeredDamage;
        
        addToHistory(`Combat Value: ${spiritCount} Spirits + Arabella (${arabellaPower}) = ${combatDamage} combat damage`);
        if (triggeredDamage > 0) {
            addToHistory(`+ Triggered ability: ${powerOneCreatures} power-1 creatures → ${triggeredDamage} life loss to opponents`);
        }
        
        return totalValue;
    },
    
    // Lifelink calculation
    calculateLifegain: function() {
        const spiritCount = gameState.tokenCounts.spirit.untapped + gameState.tokenCounts.spirit.tapped;
        const arabellaPower = 1 + gameState.commanderCounters;
        
        // Only Arabella has lifelink
        const lifelinkGain = arabellaPower;
        
        // Plus triggered ability gain if power-1 creatures deal damage
        const powerOneCreatures = this.countPowerOneCreatures();
        const triggeredGain = powerOneCreatures > 0 ? 1 : 0;
        
        const totalGain = lifelinkGain + triggeredGain;
        
        addToHistory(`Life gained: Arabella lifelink (${lifelinkGain}) + triggered ability (${triggeredGain}) = ${totalGain} life`);
        return totalGain;
    },
    
    // Create multiple spirits at once
    createSpiritSwarm: function(amount = 3) {
        for (let i = 0; i < amount; i++) {
            this.createSpiritToken();
        }
        addToHistory(`Created ${amount} Spirit tokens for swarm`);
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.spirit.untapped + gameState.tokenCounts.spirit.tapped; // SPIRITS
            case 1: return this.damageDealtToOpponents; // DAMAGE DEALT
            case 2: return getTotalUntapped(); // UNTAPPED  
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};