// commanders/adrix.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.adrix = {
    name: "Adrix and Nev, Twincasters",
    baseStats: "2/2", 
    primaryTokens: ['generic'],
    artPath: "assets/art/adrix.jpg",
    showCounters: false, // Don't show +1/+1 counters and trample for this commander
    trackingLabels: ['TOKENS', 'TOTAL', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE TOKEN', action: 'createGenericToken', class: 'primary-btn' },
        { text: 'IN COMMAND ZONE', action: 'toggleCommandZone', class: 'warning-btn' }
    ],
    abilities: [
        // Adrix and Nev have no activated abilities - just Ward 2 and doubling trigger
    ],
    
    // Track if Adrix and Nev are on the battlefield
    onBattlefield: true,
    
    // Adrix and Nev specific functions
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
        
        // Update the button text and class in mainActions
        this.mainActions[1].text = this.onBattlefield ? 'ON BATTLEFIELD' : 'IN COMMAND ZONE';
        this.mainActions[1].class = this.onBattlefield ? 'success-btn' : 'warning-btn';
        
        addToHistory(this.onBattlefield ? `Adrix and Nev: On battlefield` : `Adrix and Nev: In command zone`);
        
        // Update the main actions to reflect the new state
        updateMainActionButtons();
        updateDisplay();
    },
    
    // Create multiple tokens at once (useful for replacing other token effects)
    createMultipleTokens: function(amount) {
        let finalTokens = applyTokenMultipliers(amount);
        
        // Apply Adrix doubling if on battlefield
        if (this.onBattlefield) {
            finalTokens *= 2;
            addToHistory(`+${amount} Tokens → +${finalTokens} (Twincasters doubled)`);
        } else {
            addToHistory(`+${finalTokens} Tokens`);
        }
        
        gameState.tokenCounts.generic.untapped += finalTokens;
        updateDisplay();
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return getTotalTokens(); // TOKENS
            case 1: return calculateTotalCombatDamage(); // VALUE (combat damage potential)
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};