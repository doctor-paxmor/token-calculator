// commanders/brudiclad.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.brudiclad = {
    name: "Brudiclad, Telchor Engineer",
    baseStats: "4/4",
    primaryTokens: ['myr', 'treasure'],
    trackingLabels: ['MYRS', 'TREASURES', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE MYR', action: 'createMyrToken', class: 'primary-btn' },
        { text: 'CONVERT TOKENS', action: 'convertAllTokens', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "MYR MAKER", description: "UPKEEP\nCREATE MYR" },
        { cost: 0, name: "CONVERTER", description: "ATTACK\nCONVERT ALL" },
        { cost: 0, name: "ARTIFACT", description: "ARTIFACT\nCREATURE" }
    ],
    
    // Track what tokens were converted to
    lastConversionTarget: 'myr',
    conversionsThisTurn: 0,
    
    // Brudiclad-specific functions
    createMyrToken: function() {
        // Create 2/1 blue Myr artifact creature token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.myr.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Myr → +${finalTokens} 2/1 artifact Myrs (modified)`);
        } else {
            addToHistory(`+${finalTokens} 2/1 blue Myr artifact creature token`);
        }
        updateDisplay();
    },
    
    convertAllTokens: function() {
        // Brudiclad's ability: Whenever Brudiclad attacks, for each kind of token you control, you may create a token that's a copy of that token. If you do, all tokens you control become copies of that token.
        
        const tokenTypes = this.getAvailableTokenTypes();
        
        if (tokenTypes.length === 0) {
            addToHistory(`No tokens to convert`);
            return;
        }
        
        // For simplicity, choose the most powerful token type to convert to
        const targetType = this.chooseBestTokenType(tokenTypes);
        const totalTokens = getTotalTokens();
        
        if (totalTokens > 0) {
            // Clear all current tokens
            Object.keys(gameState.tokenCounts).forEach(type => {
                gameState.tokenCounts[type].untapped = 0;
                gameState.tokenCounts[type].tapped = 0;
            });
            
            // Convert all to target type (keep tapped/untapped ratio)
            const untappedRatio = getTotalUntapped() / totalTokens;
            const newUntapped = Math.ceil(totalTokens * untappedRatio);
            const newTapped = totalTokens - newUntapped;
            
            gameState.tokenCounts[targetType].untapped = newUntapped;
            gameState.tokenCounts[targetType].tapped = newTapped;
            
            this.lastConversionTarget = targetType;
            this.conversionsThisTurn += 1;
            
            addToHistory(`Brudiclad attacks → all ${totalTokens} tokens become ${targetType}s`);
            updateDisplay();
        }
    },
    
    getAvailableTokenTypes: function() {
        const types = [];
        Object.keys(gameState.tokenCounts).forEach(type => {
            const count = gameState.tokenCounts[type].untapped + gameState.tokenCounts[type].tapped;
            if (count > 0) {
                types.push(type);
            }
        });
        return types;
    },
    
    chooseBestTokenType: function(tokenTypes) {
        // Choose the token type with highest power or most value
        const tokenValues = {
            'myr': 2,        // 2/1
            'beast': 6,      // 3/3 = 6 total stats
            'astartes': 4,   // 2/2 = 4 total stats
            'cat': 4,        // 2/2 = 4 total stats  
            'dog': 4,        // 3/1 = 4 total stats
            'soldier': 2,    // 1/1 = 2 total stats
            'spirit': 2,     // 1/1 = 2 total stats
            'saproling': 2,  // 1/1 = 2 total stats
            'treasure': 0,   // Artifacts, not creatures
            'food': 0,       // Artifacts, not creatures
            'generic': 2     // Assume 1/1 = 2 total stats
        };
        
        let bestType = tokenTypes[0];
        let bestValue = tokenValues[bestType] || 1;
        
        tokenTypes.forEach(type => {
            const value = tokenValues[type] || 1;
            if (value > bestValue) {
                bestValue = value;
                bestType = type;
            }
        });
        
        return bestType;
    },
    
    // Upkeep trigger - create Myr
    upkeepTrigger: function() {
        this.createMyrToken();
        addToHistory(`Upkeep: Brudiclad creates 2/1 Myr token`);
    },
    
    // Create treasure tokens (common in artifact decks)
    createTreasureToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.treasure.untapped += finalTokens;
        
        addToHistory(`+${finalTokens} Treasure token`);
        updateDisplay();
    },
    
    // Calculate combat damage after conversion
    calculateConvertedDamage: function() {
        const tokenCounts = Object.entries(gameState.tokenCounts)
            .map(([type, counts]) => ({ type, count: counts.untapped + counts.tapped }))
            .filter(({count}) => count > 0);
        
        if (tokenCounts.length === 0) {
            return 0;
        }
        
        // Estimate damage based on token types
        const powerValues = {
            'myr': 2, 'beast': 3, 'astartes': 2, 'cat': 2, 'dog': 3,
            'soldier': 1, 'spirit': 1, 'saproling': 1, 'generic': 1
        };
        
        let totalDamage = 0;
        tokenCounts.forEach(({type, count}) => {
            const power = powerValues[type] || 1;
            totalDamage += count * power;
        });
        
        const brudicladPower = 4 + gameState.commanderCounters;
        totalDamage += brudicladPower;
        
        addToHistory(`Combat: Token army + Brudiclad (${brudicladPower}) = ${totalDamage} total damage`);
        return totalDamage;
    },
    
    // Reset for new turn
    newTurn: function() {
        this.conversionsThisTurn = 0;
        this.upkeepTrigger();
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.myr.untapped + gameState.tokenCounts.myr.tapped; // MYRS
            case 1: return gameState.tokenCounts.treasure.untapped + gameState.tokenCounts.treasure.tapped; // TREASURES
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};