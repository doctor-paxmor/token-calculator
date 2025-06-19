// commanders/adrix.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.adrix = {
    name: "Adrix and Nev, Twincasters",
    baseStats: "2/2", 
    primaryTokens: ['generic'],
    artPath: "assets/art/adrix.jpg",
    showCounters: false,
    trackingLabels: ['TOKENS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE TOKEN', action: 'createGenericToken', class: 'primary-btn' },
        { text: 'ON BATTLEFIELD', action: 'toggleCommandZone', class: 'toggle-switch-special' }
    ],
    abilities: [],
    
    // Track if Adrix and Nev are on the battlefield
    onBattlefield: false,
    
    // CREATE TOKEN function
    createGenericToken: function() {
        const baseTokens = 1;
        let finalTokens = applyTokenMultipliers(baseTokens);
        
        // Adrix and Nev's ability: double token creation (only if on battlefield)
        if (this.onBattlefield) {
            finalTokens *= 2;
            addToHistory(`+${baseTokens} Token → +${finalTokens} (Twincasters doubled)`);
        } else {
            addToHistory(`+${finalTokens} Token`);
        }
        
        gameState.tokenCounts.generic.untapped += finalTokens;
        updateDisplay();
    },
    
    // Toggle between command zone and battlefield
    toggleCommandZone: function() {
        this.onBattlefield = !this.onBattlefield;
        addToHistory(this.onBattlefield ? `Adrix and Nev: On battlefield` : `Adrix and Nev: In command zone`);
        updateMainActionButtons(); // Refresh the UI
        updateDisplay();
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return getTotalTokens(); // TOKENS
            case 1: return getTotalUntapped(); // UNTAPPED
            case 2: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};