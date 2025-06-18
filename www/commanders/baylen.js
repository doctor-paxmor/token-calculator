// commanders/baylen.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.baylen = {
    name: "Baylen, the Haymaker",
    baseStats: "4/3",
    primaryTokens: ['hare'],
    artPath: "assets/art/baylen.jpg",
    trackingLabels: ['HARES', 'TOKENS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'PLAY HARE APPARENT', action: 'playHareApparent', class: 'primary-btn' },
        { text: 'REMOVE HARE APPARENT', action: 'removeHare', class: 'danger-btn' }
    ],
    abilities: [
        { cost: 2, name: "+1 MANA", description: "TAP 2\n+1 MANA" },
        { cost: 3, name: "DRAW", description: "TAP 3\nDRAW" },
        { cost: 4, name: "+3/+3", description: "TAP 4\n+3/+3" }
    ],
    
    // Baylen-specific functions
    playHareApparent: function() {
        const baseTokens = gameState.hareCount; // Number of other Hares already in play
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.hare.untapped += finalTokens;
        gameState.hareCount += 1;
        
        if (baseTokens === 0) {
            addToHistory(`Hare #${gameState.hareCount} → no tokens (first Hare)`);
        } else if (finalTokens !== baseTokens) {
            addToHistory(`Hare #${gameState.hareCount} → ${baseTokens} × modifiers = ${finalTokens}`);
        } else {
            addToHistory(`Hare #${gameState.hareCount} → +${finalTokens}`);
        }
        
        updateDisplay();
    },

    removeHare: function() {
        if (gameState.hareCount > 0) {
            gameState.hareCount -= 1;
            addToHistory(`-1 Hare`);
            updateDisplay();
        }
    },

    useManaAbility: function() {
        if (getTotalUntapped() >= 2) {
            tapTokens(2);
            gameState.availableMana += 1;
            addToHistory(`+1 mana (${gameState.availableMana} total)`);
            updateDisplay();
        }
    },

    useDrawAbility: function() {
        if (getTotalUntapped() >= 3) {
            tapTokens(3);
            gameState.cardsDrawn += 1;
            addToHistory(`Draw card (${gameState.cardsDrawn} total)`);
            updateDisplay();
        }
    },

    usePumpAbility: function() {
        if (getTotalUntapped() >= 4) {
            tapTokens(4);
            
            let countersToAdd = 3;
            // Effects that double counters placed on permanents
            if (document.getElementById('doublingSeasons').checked) {
                countersToAdd *= 2;
            }
            if (document.getElementById('primalVigor').checked) {
                countersToAdd *= 2;
            }
            
            gameState.commanderCounters += countersToAdd;
            gameState.commanderHasTrample = true;
            
            if (countersToAdd === 3) {
                addToHistory(`Baylen gets +3/+3 and trample`);
            } else {
                const modifiers = [];
                if (document.getElementById('doublingSeasons').checked) modifiers.push('DS');
                if (document.getElementById('primalVigor').checked) modifiers.push('PV');
                addToHistory(`Baylen gets +3/+3 → +${countersToAdd}/+${countersToAdd} and trample (${modifiers.join('+')})`);
            }
            updateDisplay();
        }
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.hareCount; // HARES
            case 1: return getTotalTokens(); // TOKENS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};