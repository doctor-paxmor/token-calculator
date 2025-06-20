// commanders/none.js - Blank commander for generic token tracking
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.none = {
    name: "No Commander Selected",
    baseStats: "0/0",
    primaryTokens: ['generic'],
    artPath: "assets/art/icon.jpg",
    showCommanderInfo: false, // Don't show commander info section
    trackingLabels: ['TOKENS', 'POWER', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE TOKEN', action: 'createGenericToken', class: 'primary-btn' }
    ],
    abilities: [
        // No special abilities for blank commander
    ],
    
    // Basic token creation function
    createGenericToken: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Create single 1/1 token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.generic.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Token → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} 1/1 Token`);
        }
        updateDisplay();
    },
    
    // Status display customization
    getStatusValue: function(index) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        switch(index) {
            case 0: return getTotalTokens(); // TOKENS
            case 1: return getTotalTokens(); // POWER (assuming 1/1 tokens)
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};