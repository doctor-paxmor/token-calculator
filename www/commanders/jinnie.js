// commanders/jinnie.js - Updated for isolated commander states
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
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Create 2/2 Cat token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.cat.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Cat → +${finalTokens} 2/2 Cats (modified)`);
        } else {
            addToHistory(`+${finalTokens} 2/2 Cat token`);
        }
        updateDisplay();
    },
    
    createDogToken: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Create 3/1 Dog token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.dog.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Dog → +${finalTokens} 3/1 Dogs (modified)`);
        } else {
            addToHistory(`+${finalTokens} 3/1 Dog token`);
        }
        updateDisplay();
    },
    
    // Create multiple cats at once (for when replacing larger token creation)
    createMultipleCats: function(amount) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        const finalTokens = applyTokenMultipliers(amount);
        currentState.tokenCounts.cat.untapped += finalTokens;
        addToHistory(`+${finalTokens} 2/2 Cat tokens (Jinnie replacement)`);
        updateDisplay();
    },
    
    // Create multiple dogs at once (for when replacing larger token creation)
    createMultipleDogs: function(amount) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        const finalTokens = applyTokenMultipliers(amount);
        currentState.tokenCounts.dog.untapped += finalTokens;
        addToHistory(`+${finalTokens} 3/1 Dog tokens (Jinnie replacement)`);
        updateDisplay();
    },
    
    // Calculate total combat damage potential
    calculateCombatDamage: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const catCount = currentState.tokenCounts.cat.untapped + currentState.tokenCounts.cat.tapped;
        const dogCount = currentState.tokenCounts.dog.untapped + currentState.tokenCounts.dog.tapped;
        const jinniePower = 3 + currentState.commanderCounters;
        
        // Cats are 2/2, Dogs are 3/1
        const catDamage = catCount * 2;
        const dogDamage = dogCount * 3;
        const totalDamage = catDamage + dogDamage + jinniePower;
        
        addToHistory(`Combat: ${catCount} Cats (${catDamage}) + ${dogCount} Dogs (${dogDamage}) + Jinnie (${jinniePower}) = ${totalDamage} damage`);
        return totalDamage;
    },
    
    // Status display customization
    getStatusValue: function(index) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const tokenCounts = currentState.tokenCounts;
        
        switch(index) {
            case 0: return tokenCounts.cat.untapped + tokenCounts.cat.tapped; // CATS
            case 1: return tokenCounts.dog.untapped + tokenCounts.dog.tapped; // DOGS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};