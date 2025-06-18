// commanders/jinnie.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.jinnie = {
    name: "Jinnie Fay, Jetmir's Second",
    baseStats: "3/3",
    primaryTokens: ['cat', 'dog'], 
    artPath: "assets/art/jinnie.jpg",
    trackingLabels: ['CATS', 'DOGS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE CAT TOKEN', action: 'createCatToken', class: 'primary-btn' },
        { text: 'CREATE DOG TOKEN', action: 'createDogToken', class: 'success-btn' }
    ],
    abilities: [
        // Jinnie has no activated abilities - just static replacement effect
    ],
    
    // Jinnie Fay specific functions
    createCatToken: function() {
        // Create 2/2 Cat token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.cat.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Cat → +${finalTokens} 2/2 Cats (modified)`);
        } else {
            addToHistory(`+${finalTokens} 2/2 Cat token`);
        }
        updateDisplay();
    },
    
    createDogToken: function() {
        // Create 3/1 Dog token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.dog.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Dog → +${finalTokens} 3/1 Dogs (modified)`);
        } else {
            addToHistory(`+${finalTokens} 3/1 Dog token`);
        }
        updateDisplay();
    },
    
    // Create multiple cats at once (for when replacing larger token creation)
    createMultipleCats: function(amount) {
        const finalTokens = applyTokenMultipliers(amount);
        gameState.tokenCounts.cat.untapped += finalTokens;
        addToHistory(`+${finalTokens} 2/2 Cat tokens (Jinnie replacement)`);
        updateDisplay();
    },
    
    // Create multiple dogs at once (for when replacing larger token creation)
    createMultipleDogs: function(amount) {
        const finalTokens = applyTokenMultipliers(amount);
        gameState.tokenCounts.dog.untapped += finalTokens;
        addToHistory(`+${finalTokens} 3/1 Dog tokens (Jinnie replacement)`);
        updateDisplay();
    },
    
    // Calculate total combat damage potential
    calculateCombatDamage: function() {
        const catCount = gameState.tokenCounts.cat.untapped + gameState.tokenCounts.cat.tapped;
        const dogCount = gameState.tokenCounts.dog.untapped + gameState.tokenCounts.dog.tapped;
        const jinniePower = 3 + gameState.commanderCounters;
        
        // Cats are 2/2, Dogs are 3/1
        const catDamage = catCount * 2;
        const dogDamage = dogCount * 3;
        const totalDamage = catDamage + dogDamage + jinniePower;
        
        addToHistory(`Combat: ${catCount} Cats (${catDamage}) + ${dogCount} Dogs (${dogDamage}) + Jinnie (${jinniePower}) = ${totalDamage} damage`);
        return totalDamage;
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.cat.untapped + gameState.tokenCounts.cat.tapped; // CATS
            case 1: return gameState.tokenCounts.dog.untapped + gameState.tokenCounts.dog.tapped; // DOGS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};