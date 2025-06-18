// commanders/brenard.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.brenard = {
    name: "Brenard, Ginger Sculptor",
    baseStats: "1/4",
    primaryTokens: ['food', 'golem'],
    trackingLabels: ['FOOD', 'GOLEMS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE FOOD', action: 'createFoodToken', class: 'primary-btn' },
        { text: 'FOOD → GOLEM', action: 'foodToGolem', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "FOOD MAKER", description: "CREATURES\nMAKE FOOD" },
        { cost: 2, name: "ANIMATOR", description: "2, SAC FOOD\nCREATE GOLEM" },
        { cost: 0, name: "GROWING", description: "GOLEMS GET\nBIGGER" }
    ],
    
    // Track Golem power/toughness
    golemSize: 1, // Base size, grows with more golems
    
    // Brenard-specific functions
    createFoodToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.food.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Food → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} Food token`);
        }
        updateDisplay();
    },
    
    foodToGolem: function() {
        // Brenard's ability: {2}, Sacrifice a Food: Create a 1/1 colorless Golem artifact creature token. When that token enters the battlefield, each Golem you control gets +1/+1 until end of turn.
        const availableFood = gameState.tokenCounts.food.untapped + gameState.tokenCounts.food.tapped;
        
        if (availableFood > 0) {
            // Sacrifice a food
            if (gameState.tokenCounts.food.untapped > 0) {
                gameState.tokenCounts.food.untapped -= 1;
            } else {
                gameState.tokenCounts.food.tapped -= 1;
            }
            
            // Create golem
            const baseTokens = 1;
            const finalTokens = applyTokenMultipliers(baseTokens);
            gameState.tokenCounts.golem.untapped += finalTokens;
            
            // Each golem gets +1/+1 until end of turn
            const golemCount = gameState.tokenCounts.golem.untapped + gameState.tokenCounts.golem.tapped;
            
            addToHistory(`Sacrifice Food → ${finalTokens} Golem, all ${golemCount} Golems get +1/+1`);
            updateDisplay();
        } else {
            addToHistory(`No Food tokens to sacrifice`);
        }
    },
    
    // Whenever a nontoken creature enters, create Food
    onCreatureEnters: function() {
        this.createFoodToken();
        addToHistory(`Creature enters → Food token created`);
    },
    
    // Calculate Golem power (they get bigger with more Golems)
    getGolemPower: function() {
        const golemCount = gameState.tokenCounts.golem.untapped + gameState.tokenCounts.golem.tapped;
        return Math.max(1, golemCount); // Each golem is at least 1/1, but gets bigger
    },
    
    calculateGolemDamage: function() {
        const golemCount = gameState.tokenCounts.golem.untapped + gameState.tokenCounts.golem.tapped;
        const golemPower = this.getGolemPower();
        const totalGolemDamage = golemCount * golemPower;
        const brenardPower = 1 + gameState.commanderCounters;
        
        addToHistory(`Combat: ${golemCount} Golems (${golemPower}/${golemPower} each = ${totalGolemDamage} dmg) + Brenard (${brenardPower} dmg) = ${totalGolemDamage + brenardPower} total`);
        return totalGolemDamage + brenardPower;
    },
    
    // Sacrifice food for value
    sacrificeFoodForLife: function() {
        const availableFood = gameState.tokenCounts.food.untapped + gameState.tokenCounts.food.tapped;
        
        if (availableFood > 0) {
            if (gameState.tokenCounts.food.untapped > 0) {
                gameState.tokenCounts.food.untapped -= 1;
            } else {
                gameState.tokenCounts.food.tapped -= 1;
            }
            
            addToHistory(`Sacrifice Food → gain 3 life`);
            updateDisplay();
        }
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.food.untapped + gameState.tokenCounts.food.tapped; // FOOD
            case 1: return gameState.tokenCounts.golem.untapped + gameState.tokenCounts.golem.tapped; // GOLEMS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};