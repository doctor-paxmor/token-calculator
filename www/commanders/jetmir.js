// commanders/jetmir.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.jetmir = {
    name: "Jetmir, Nexus of Revels", 
    baseStats: "5/4",
    primaryTokens: ['cat', 'dog', 'bird'],
    trackingLabels: ['CREATURES', 'ANTHEM LEVEL', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE CAT', action: 'createCatToken', class: 'primary-btn' },
        { text: 'CREATE DOG', action: 'createDogToken', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "ANTHEM", description: "PASSIVE\nCREATURE BUFF" },
        { cost: 0, name: "SCALING", description: "MORE CREATURES\nBIGGER BONUS" },
        { cost: 0, name: "TRAMPLE", description: "9+ CREATURES\nTRAMPLE" }
    ],
    
    // Jetmir-specific functions
    createCatToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.cat.untapped += finalTokens;
        
        const anthemLevel = this.getAnthemLevel();
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Cat → +${finalTokens} (modified) [Anthem: ${anthemLevel}]`);
        } else {
            addToHistory(`+${finalTokens} Cat [Anthem: ${anthemLevel}]`);
        }
        updateDisplay();
    },
    
    createDogToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.dog.untapped += finalTokens;
        
        const anthemLevel = this.getAnthemLevel();
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Dog → +${finalTokens} (modified) [Anthem: ${anthemLevel}]`);
        } else {
            addToHistory(`+${finalTokens} Dog [Anthem: ${anthemLevel}]`);
        }
        updateDisplay();
    },
    
    // Jetmir's anthem ability calculation
    getAnthemLevel: function() {
        const totalCreatures = getTotalTokens() + 1; // +1 for Jetmir himself
        
        if (totalCreatures >= 9) {
            return "+3/+0, vigilance, trample";
        } else if (totalCreatures >= 6) {
            return "+2/+0, vigilance";
        } else if (totalCreatures >= 3) {
            return "+1/+0";
        } else {
            return "No bonus";
        }
    },
    
    getAnthemNumeric: function() {
        const totalCreatures = getTotalTokens() + 1;
        
        if (totalCreatures >= 9) {
            return 3; // +3/+0
        } else if (totalCreatures >= 6) {
            return 2; // +2/+0
        } else if (totalCreatures >= 3) {
            return 1; // +1/+0
        } else {
            return 0;
        }
    },
    
    // Calculate total combat damage with anthem
    calculateCombatDamage: function() {
        const totalCreatures = getTotalTokens() + 1;
        const anthemBonus = this.getAnthemNumeric();
        
        // Assume most tokens are 1/1, some might be 2/2
        const estimatedBasePower = getTotalTokens(); // Simplified: each token = 1 base power
        const jetmirPower = 5 + gameState.commanderCounters;
        
        const totalDamage = estimatedBasePower + (getTotalTokens() * anthemBonus) + jetmirPower;
        
        addToHistory(`Combat: ${getTotalTokens()} tokens + Jetmir (${jetmirPower}) with ${anthemBonus > 0 ? '+' + anthemBonus + '/+0 anthem' : 'no anthem'} = ~${totalDamage} damage`);
        return totalDamage;
    },
    
    anthemEffect: function() {
        const level = this.getAnthemLevel();
        addToHistory(`Jetmir anthem: ${level}`);
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return getTotalTokens() + 1; // CREATURES (including Jetmir)
            case 1: return this.getAnthemNumeric(); // ANTHEM LEVEL
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};