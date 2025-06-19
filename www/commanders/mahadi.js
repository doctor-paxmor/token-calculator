// commanders/mahadi.js - Updated for isolated commander states
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.mahadi = {
    name: "Mahadi, Emporium Master",
    baseStats: "3/3",
    primaryTokens: ['treasure'],
    artPath: "assets/art/mahadi.jpg",
    showCounters: false, // Don't show +1/+1 counters for Mahadi
    trackingLabels: ['TREASURES', 'DEATHS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATURE DIED', action: 'addDeadCreature', class: 'primary-btn' },
        { text: 'END STEP TRIGGER', action: 'endStepTrigger', class: 'success-btn' }
    ],
    abilities: [
        // Mahadi has no activated abilities - just triggered ability at end step
    ],
    
    // Mahadi-specific functions
    createTreasureToken: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Create single Treasure token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.treasure.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Treasure → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} Treasure token`);
        }
        updateDisplay();
    },
    
    endStepTrigger: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Mahadi's ability: At beginning of your end step, create a Treasure for each creature that died this turn
        if (currentState.creaturesDeadThisTurn > 0) {
            const baseTokens = currentState.creaturesDeadThisTurn;
            const finalTokens = applyTokenMultipliers(baseTokens);
            
            currentState.tokenCounts.treasure.untapped += finalTokens;
            
            addToHistory(`End step: ${currentState.creaturesDeadThisTurn} creatures died → +${finalTokens} Treasures`);
            
            // Reset death count for next turn
            currentState.creaturesDeadThisTurn = 0;
        } else {
            addToHistory(`End step: No creatures died this turn`);
        }
        updateDisplay();
    },
    
    // Quick buttons for common death counts
    creaturesDeadCount: function(amount) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        currentState.creaturesDeadThisTurn = amount;
        addToHistory(`Set creatures died this turn: ${amount}`);
        updateDisplay();
    },
    
    // Add to death count - this is the main function for the "CREATURE DIED" button
    addDeadCreature: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        currentState.creaturesDeadThisTurn += 1;
        addToHistory(`Creature died (+1 death, ${currentState.creaturesDeadThisTurn} total this turn)`);
        updateDisplay();
    },
    
    // Create multiple treasures at once (for big board wipes)
    createMultipleTreasures: function(amount) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        const finalTokens = applyTokenMultipliers(amount);
        currentState.tokenCounts.treasure.untapped += finalTokens;
        addToHistory(`+${finalTokens} Treasure tokens`);
        updateDisplay();
    },
    
    // Calculate mana available from treasures
    calculateAvailableMana: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const treasureCount = currentState.tokenCounts.treasure.untapped + currentState.tokenCounts.treasure.tapped;
        addToHistory(`Available mana from treasures: ${treasureCount} (can be any color)`);
        return treasureCount;
    },
    
    // New turn reset
    newTurn: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        currentState.creaturesDeadThisTurn = 0;
        addToHistory(`New turn: Reset creatures died count`);
        updateDisplay();
    },
    
    // Status display customization
    getStatusValue: function(index) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        switch(index) {
            case 0: return currentState.tokenCounts.treasure.untapped + currentState.tokenCounts.treasure.tapped; // TREASURES
            case 1: return currentState.creaturesDeadThisTurn; // DEATHS (this turn)
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    },
    
    // Commander info display - removed as requested
    getCommanderDisplayInfo: function() {
        return null; // Don't display extra commander info
    }
};