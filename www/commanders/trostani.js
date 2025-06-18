// commanders/trostani.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.trostani = {
    name: "Trostani, Selesnya's Voice",
    baseStats: "2/5",
    primaryTokens: ['saproling'],
    trackingLabels: ['SAPROLINGS', 'LIFE GAINED', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE SAPROLING', action: 'createSaproling', class: 'primary-btn' },
        { text: 'POPULATE', action: 'populate', class: 'success-btn' }
    ],
    abilities: [
        { cost: 3, name: "TOKEN", description: "3 MANA\nCREATE TOKEN" },
        { cost: 0, name: "LIFEGAIN", description: "AUTO\nGAIN LIFE" },
        { cost: 4, name: "POPULATE", description: "4 MANA\nPOPULATE" }
    ],
    
    // Track life gained
    lifeGained: 0,
    
    // Trostani-specific functions
    createSaproling: function() {
        // {3}{G}{W}: Create a 1/1 green Saproling creature token.
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.saproling.untapped += finalTokens;
        
        // Trostani gains life equal to new creature's toughness
        const lifeGain = finalTokens * 1; // Saprolings are 1/1
        this.lifeGained += lifeGain;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Saproling → +${finalTokens} (modified), gain ${lifeGain} life`);
        } else {
            addToHistory(`+${finalTokens} 1/1 Saproling, gain ${lifeGain} life`);
        }
        updateDisplay();
    },
    
    populate: function() {
        // {4}: Populate (Create a token that's a copy of a creature token you control.)
        const largestToken = this.findLargestToken();
        
        if (largestToken) {
            const baseTokens = 1;
            const finalTokens = applyTokenMultipliers(baseTokens);
            
            gameState.tokenCounts[largestToken.type].untapped += finalTokens;
            
            // Gain life equal to the populated creature's toughness
            const lifeGain = finalTokens * largestToken.toughness;
            this.lifeGained += lifeGain;
            
            addToHistory(`Populate: +${finalTokens} ${largestToken.type} copy, gain ${lifeGain} life`);
            updateDisplay();
        } else {
            addToHistory(`No tokens to populate`);
        }
    },
    
    findLargestToken: function() {
        // Find the biggest token to copy (by total power+toughness)
        const tokenTypes = [
            { type: 'saproling', power: 1, toughness: 1 },
            { type: 'cat', power: 2, toughness: 2 },
            { type: 'dog', power: 3, toughness: 1 },
            { type: 'soldier', power: 1, toughness: 1 },
            { type: 'beast', power: 3, toughness: 3 },
            { type: 'spirit', power: 1, toughness: 1 },
            { type: 'astartes', power: 2, toughness: 2 },
            { type: 'generic', power: 1, toughness: 1 }
        ];
        
        let largest = null;
        let largestValue = 0;
        
        tokenTypes.forEach(token => {
            const count = gameState.tokenCounts[token.type].untapped + gameState.tokenCounts[token.type].tapped;
            if (count > 0) {
                const value = token.power + token.toughness;
                if (value > largestValue) {
                    largestValue = value;
                    largest = token;
                }
            }
        });
        
        return largest;
    },
    
    // Whenever a creature enters, gain life equal to its toughness
    onCreatureEnters: function(power, toughness) {
        this.lifeGained += toughness;
        addToHistory(`Creature enters → gain ${toughness} life`);
        updateDisplay();
    },
    
    // Create a big token for value
    createLargeToken: function() {
        // Simulate creating a larger creature token (like from other spells)
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.beast.untapped += finalTokens; // 3/3 Beast
        
        const lifeGain = finalTokens * 3; // Beast toughness
        this.lifeGained += lifeGain;
        
        addToHistory(`+${finalTokens} 3/3 Beast token, gain ${lifeGain} life`);
        updateDisplay();
    },
    
    // Calculate total board value
    calculateBoardValue: function() {
        const saprolingCount = gameState.tokenCounts.saproling.untapped + gameState.tokenCounts.saproling.tapped;
        const otherTokens = getTotalTokens() - saprolingCount;
        const trostaniPower = 2 + gameState.commanderCounters;
        
        const totalPower = saprolingCount + (otherTokens * 2) + trostaniPower; // Estimate
        const totalLife = this.lifeGained;
        
        addToHistory(`Board: ${saprolingCount} Saprolings + ${otherTokens} other tokens + Trostani (${trostaniPower}) = ~${totalPower} power, ${totalLife} life gained`);
        return { power: totalPower, life: totalLife };
    },
    
    // Mass populate
    massPopulate: function() {
        const tokenTypes = Object.keys(gameState.tokenCounts);
        let populatedCount = 0;
        
        tokenTypes.forEach(tokenType => {
            const count = gameState.tokenCounts[tokenType].untapped + gameState.tokenCounts[tokenType].tapped;
            if (count > 0) {
                gameState.tokenCounts[tokenType].untapped += count;
                populatedCount += count;
            }
        });
        
        if (populatedCount > 0) {
            this.lifeGained += populatedCount; // Simplified life gain
            addToHistory(`Mass populate: doubled all tokens (${populatedCount}), gain ${populatedCount} life`);
            updateDisplay();
        }
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.saproling.untapped + gameState.tokenCounts.saproling.tapped; // SAPROLINGS
            case 1: return this.lifeGained; // LIFE GAINED
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};