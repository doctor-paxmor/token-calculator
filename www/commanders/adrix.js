// commanders/adrix.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.adrix = {
    name: "Adrix and Nev, Twincasters",
    baseStats: "2/2", 
    primaryTokens: ['generic'],
    trackingLabels: ['TOKENS', 'DOUBLED', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE TOKEN', action: 'createGenericToken', class: 'primary-btn' },
        { text: 'TRIGGER DOUBLING', action: 'triggerDoubling', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "WARD 2", description: "PASSIVE\nWARD 2" },
        { cost: 0, name: "DOUBLING", description: "FIRST TIME\nDOUBLE TOKENS" },
        { cost: 0, name: "PROTECTION", description: "COUNTERS\nCOST +2" }
    ],
    
    // Track if we've used the doubling this turn
    doublingUsedThisTurn: false,
    
    // Adrix and Nev specific functions
    createGenericToken: function() {
        const baseTokens = 1;
        let finalTokens = applyTokenMultipliers(baseTokens);
        
        // Adrix and Nev's ability: first time each turn, double token creation
        if (!this.doublingUsedThisTurn) {
            finalTokens *= 2;
            this.doublingUsedThisTurn = true;
        }
        
        gameState.tokenCounts.generic.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            const doubleText = this.doublingUsedThisTurn ? " (Twincasters doubling)" : "";
            addToHistory(`+${baseTokens} Token → +${finalTokens}${doubleText}`);
        } else {
            addToHistory(`+${finalTokens} Token`);
        }
        updateDisplay();
    },
    
    triggerDoubling: function() {
        // Force trigger the doubling ability with existing tokens
        const currentTokens = getTotalTokens();
        if (currentTokens > 0 && !this.doublingUsedThisTurn) {
            // Double all existing tokens (simplified version)
            Object.keys(gameState.tokenCounts).forEach(tokenType => {
                const existing = gameState.tokenCounts[tokenType].untapped + gameState.tokenCounts[tokenType].tapped;
                if (existing > 0) {
                    gameState.tokenCounts[tokenType].untapped += existing;
                }
            });
            
            this.doublingUsedThisTurn = true;
            addToHistory(`Twincasters: Doubled ${currentTokens} tokens`);
            updateDisplay();
        } else if (this.doublingUsedThisTurn) {
            addToHistory(`Twincasters doubling already used this turn`);
        } else {
            addToHistory(`No tokens to double`);
        }
    },
    
    // Reset doubling at start of turn (would need turn tracking)
    newTurn: function() {
        this.doublingUsedThisTurn = false;
        addToHistory(`New turn: Twincasters doubling ready`);
    },
    
    // Ward 2 ability helper
    wardProtection: function() {
        addToHistory(`Ward 2: Spells/abilities targeting Adrix cost 2 more`);
    },
    
    // Token creation with Adrix doubling
    onTokenCreate: function(tokenType, baseAmount) {
        let finalAmount = baseAmount;
        
        // Apply Adrix doubling if available
        if (!this.doublingUsedThisTurn) {
            finalAmount *= 2;
            this.doublingUsedThisTurn = true;
            return {
                amount: finalAmount,
                message: `Twincasters: ${baseAmount} → ${finalAmount} (doubled)`
            };
        }
        
        return {
            amount: finalAmount,
            message: null
        };
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return getTotalTokens(); // TOKENS
            case 1: return this.doublingUsedThisTurn ? 1 : 0; // DOUBLED (1 if used, 0 if available)
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};