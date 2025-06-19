// commanders/chatterfang.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.chatterfang = {
    name: "Chatterfang, Squirrel General",
    baseStats: "3/3",
    primaryTokens: ['squirrel'],
    artPath: "assets/art/chatterfang.jpg",
    trackingLabels: ['SQUIRRELS', 'OTHER TOKENS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE SQUIRREL', action: 'createSquirrelToken', class: 'primary-btn' }
    ],
    abilities: [
        { cost: 0, name: "FORESTWALK", description: "PASSIVE\nFORESTWALK" },
        { cost: 0, name: "REPLACEMENT", description: "PASSIVE\n+SQUIRRELS" },
        { cost: 'B', name: "PUMP", description: "B, SAC X\n+X/-X" }
    ],
    
    // Commander-specific token generation functions
    createSquirrelToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.squirrel.untapped += finalTokens;
        
        // Chatterfang's replacement effect triggers - add squirrels for the tokens created
        gameState.tokenCounts.squirrel.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Squirrel → +${finalTokens} + ${finalTokens} more (replacement)`);
        } else {
            addToHistory(`+${finalTokens} Squirrel + ${finalTokens} more (replacement effect)`);
        }
        updateDisplay();
    },
    
    // Special ability handlers - Chatterfang's replacement effect
    onTokenCreated: function(tokenType, amount) {
        // Chatterfang's replacement effect - whenever tokens are created, also create squirrels
        if (tokenType !== 'squirrel') {
            gameState.tokenCounts.squirrel.untapped += amount;
            return `Also created ${amount} Squirrel${amount > 1 ? 's' : ''} (Chatterfang)`;
        }
        return null;
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.squirrel.untapped + gameState.tokenCounts.squirrel.tapped; // SQUIRRELS
            case 1: return getTotalTokens() - (gameState.tokenCounts.squirrel.untapped + gameState.tokenCounts.squirrel.tapped); // OTHER TOKENS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};