// commanders/adrix.js - Updated for isolated commander states
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.adrix = {
    name: "Adrix and Nev, Twincasters",
    baseStats: "2/2", 
    primaryTokens: ['generic'],
    artPath: "assets/art/adrix.jpg",
    showCounters: false,
    trackingLabels: ['TOKENS', 'BATTLEFIELD', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE TOKEN', action: 'createGenericToken', class: 'primary-btn' }
    ],
    abilities: [
        { cost: 0, name: "TOGGLE ZONE", description: "TOGGLE\nZONE" }
    ],
    
    // CREATE TOKEN function
    createGenericToken: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        const baseTokens = 1;
        let finalTokens = applyTokenMultipliers(baseTokens);
        
        // Adrix and Nev's ability: double token creation (only if on battlefield)
        if (currentState.onBattlefield) {
            finalTokens *= 2;
            addToHistory(`+${baseTokens} Token → +${finalTokens} (Twincasters doubled)`);
        } else {
            addToHistory(`+${finalTokens} Token`);
        }
        
        currentState.tokenCounts.generic.untapped += finalTokens;
        updateDisplay();
    },
    
    // Toggle between command zone and battlefield
    toggleCommandZone: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        currentState.onBattlefield = !currentState.onBattlefield;
        addToHistory(currentState.onBattlefield ? `Adrix and Nev: On battlefield` : `Adrix and Nev: In command zone`);
        updateMainActionButtons(); // Refresh the UI
        updateDisplay();
    },
    
    // Handle the toggle zone ability button
    useToggleZoneAbility: function() {
        this.toggleCommandZone();
    },
    getStatusValue: function(index) {
        const currentState = getCurrentCommanderState();
        switch(index) {
            case 0: return getTotalTokens(); // TOKENS
            case 1: return currentState ? (currentState.onBattlefield ? 1 : 0) : 0; // BATTLEFIELD
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};