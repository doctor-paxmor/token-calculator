// commanders/jinnie.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.jinnie = {
    name: "Jinnie Fay, Jetmir's Second",
    baseStats: "3/3",
    primaryTokens: ['cat', 'dog'], 
    trackingLabels: ['CATS', 'DOGS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE CAT TOKEN', action: 'createCatToken', class: 'primary-btn' },
        { text: 'CREATE DOG TOKEN', action: 'createDogToken', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "REPLACE", description: "PASSIVE\nREPLACE TOKENS" },
        { cost: 0, name: "CAT/DOG", description: "CHOICE\nCAT OR DOG" },
        { cost: 0, name: "HASTE", description: "DOGS GET\nHASTE" }
    ],
    
    // Jinnie Fay specific functions
    createCatToken: function() {
        // Create 2/2 Cat token with haste
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
        // Create 3/1 Dog token with haste  
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.dog.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Dog → +${finalTokens} 3/1 Dogs with haste (modified)`);
        } else {
            addToHistory(`+${finalTokens} 3/1 Dog token with haste`);
        }
        updateDisplay();
    },
    
    // Jinnie's replacement effect for non-creature tokens
    replaceTokens: function(tokenType, amount, choiceType = 'cat') {
        // Instead of creating the original token, create cats or dogs
        if (tokenType !== 'cat' && tokenType !== 'dog') {
            if (choiceType === 'cat') {
                gameState.tokenCounts.cat.untapped += amount;
                addToHistory(`Replaced ${amount} ${tokenType} tokens with ${amount} 2/2 Cat tokens`);
            } else {
                gameState.tokenCounts.dog.untapped += amount;
                addToHistory(`Replaced ${amount} ${tokenType} tokens with ${amount} 3/1 Dog tokens with haste`);
            }
            updateDisplay();
            return true;
        }
        return false;
    },
    
    // Create treasure but replace with cats/dogs
    createTreasureAsCats: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        // Instead of treasures, create cats
        gameState.tokenCounts.cat.untapped += finalTokens;
        addToHistory(`Treasure → ${finalTokens} 2/2 Cat tokens (Jinnie replacement)`);
        updateDisplay();
    },
    
    createTreasureAsDogs: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        // Instead of treasures, create dogs
        gameState.tokenCounts.dog.untapped += finalTokens;
        addToHistory(`Treasure → ${finalTokens} 3/1 Dog tokens with haste (Jinnie replacement)`);
        updateDisplay();
    },
    
    // Calculate combat damage
    calculateCombatDamage: function() {
        const catCount = gameState.tokenCounts.cat.untapped + gameState.tokenCounts.cat.tapped;
        const dogCount = gameState.tokenCounts.dog.untapped + gameState.tokenCounts.dog.tapped;
        const jinniePower = 3 + gameState.commanderCounters;
        
        // Cats are 2/2, Dogs are 3/1
        const catDamage = catCount * 2;
        const dogDamage = dogCount * 3;
        const totalDamage = catDamage + dogDamage + jinniePower;
        
        addToHistory(`Combat: ${catCount} Cats (${catDamage} dmg) + ${dogCount} Dogs (${dogDamage} dmg) + Jinnie (${jinniePower} dmg) = ${totalDamage} total`);
        return totalDamage;
    },
    
    // Token choice interface (simplified)
    showTokenChoice: function(amount, sourceType) {
        // In a real implementation, this would show a modal
        // For now, default to cats
        this.replaceTokens(sourceType, amount, 'cat');
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