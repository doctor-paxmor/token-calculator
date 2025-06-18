// commanders/chatterfang.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.chatterfang = {
    name: "Chatterfang, Squirrel General",
    baseStats: "3/3",
    primaryTokens: ['squirrel', 'treasure'],
    artPath: "assets/art/chatterfang.jpg",
    trackingLabels: ['SQUIRRELS', 'TREASURES', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE SQUIRREL', action: 'createSquirrelToken', class: 'primary-btn' },
        { text: 'CREATE TREASURE', action: 'createTreasureToken', class: 'success-btn' }
    ],
    abilities: [
        { cost: 'X', name: "SACRIFICE", description: "X, SAC X\n+X/-X" },
        { cost: 0, name: "FORESTWALK", description: "PASSIVE\nFORESTWALK" },
        { cost: 0, name: "DOUBLER", description: "PASSIVE\nDOUBLE TOKENS" }
    ],
    
    // Commander-specific token generation functions
    createSquirrelToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.squirrel.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Squirrel → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} Squirrel`);
        }
        updateDisplay();
    },
    
    createTreasureToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        // With Chatterfang, creating treasures also creates squirrels
        gameState.tokenCounts.treasure.untapped += finalTokens;
        gameState.tokenCounts.squirrel.untapped += finalTokens;
        
        addToHistory(`+${finalTokens} Treasure +${finalTokens} Squirrel`);
        updateDisplay();
    },
    
    sacrificeSquirrels: function(amount) {
        const available = gameState.tokenCounts.squirrel.untapped + gameState.tokenCounts.squirrel.tapped;
        const toSacrifice = Math.min(amount, available);
        
        if (toSacrifice > 0) {
            // Remove from untapped first, then tapped
            let remaining = toSacrifice;
            const fromUntapped = Math.min(remaining, gameState.tokenCounts.squirrel.untapped);
            gameState.tokenCounts.squirrel.untapped -= fromUntapped;
            remaining -= fromUntapped;
            
            if (remaining > 0) {
                gameState.tokenCounts.squirrel.tapped -= remaining;
            }
            
            addToHistory(`Sacrifice ${toSacrifice} squirrels for +${toSacrifice}/-${toSacrifice}`);
            updateDisplay();
        }
        return toSacrifice;
    },
    
    // Special ability handlers
    onTokenCreated: function(tokenType, amount) {
        // Chatterfang's replacement effect - whenever tokens are created, also create squirrels
        if (tokenType !== 'squirrel') {
            gameState.tokenCounts.squirrel.untapped += amount;
            return `Also created ${amount} Squirrel${amount > 1 ? 's' : ''}`;
        }
        return null;
    }
};