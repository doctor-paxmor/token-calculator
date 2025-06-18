// commanders/marneus.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.marneus = {
    name: "Marneus Calgar",
    baseStats: "5/5",
    primaryTokens: ['astartes'],
    artPath: "assets/art/marneus.jpg",
    trackingLabels: ['ASTARTES', 'CARDS DRAWN', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CREATE ASTARTES', action: 'createAstartesTokens', class: 'primary-btn' },
        { text: 'TRIGGER TOKENS', action: 'triggerTokenEntry', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "DOUBLE STRIKE", description: "PASSIVE\nDOUBLE STRIKE" },
        { cost: 0, name: "TACTICIAN", description: "TOKENS→\nDRAW CARD" },
        { cost: 6, name: "CHAPTER", description: "6 MANA\n2 ASTARTES" }
    ],
    
    // Marneus-specific functions
    createAstartesTokens: function() {
        // Chapter Master ability: Create two 2/2 white Astartes Warrior creature tokens with vigilance
        const baseTokens = 2;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.astartes.untapped += finalTokens;
        
        // Master Tactician - draw a card when tokens enter
        gameState.cardsDrawn += 1;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`Chapter Master: +${baseTokens} → +${finalTokens} Astartes, draw 1 card`);
        } else {
            addToHistory(`Chapter Master: +${finalTokens} Astartes with vigilance, draw 1 card`);
        }
        updateDisplay();
    },
    
    triggerTokenEntry: function() {
        // Simulate tokens entering from other sources to trigger card draw
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.astartes.untapped += finalTokens;
        gameState.cardsDrawn += 1;
        
        addToHistory(`Token entry: +${finalTokens} Astartes, draw 1 card`);
        updateDisplay();
    },
    
    // Master Tactician passive ability
    onTokensEnter: function(amount) {
        // Whenever one or more tokens enter, draw a card
        gameState.cardsDrawn += 1;
        return "Master Tactician: Draw 1 card";
    },
    
    // Astartes have vigilance, so they don't tap to attack
    astartesAttack: function() {
        const astartesCount = gameState.tokenCounts.astartes.untapped + gameState.tokenCounts.astartes.tapped;
        if (astartesCount > 0) {
            // Astartes have vigilance, so they can attack without tapping
            addToHistory(`${astartesCount} Astartes attack (vigilance - don't tap)`);
        }
    },
    
    // Double strike combat math helper
    calculateCombatDamage: function() {
        const astartesCount = gameState.tokenCounts.astartes.untapped + gameState.tokenCounts.astartes.tapped;
        const marneusWithCounters = 5 + gameState.commanderCounters;
        
        // Each 2/2 Astartes deals 2 damage, Marneus deals damage twice (double strike)
        const totalDamage = (astartesCount * 2) + (marneusWithCounters * 2);
        
        addToHistory(`Combat: ${astartesCount} Astartes (${astartesCount * 2} dmg) + Marneus double strike (${marneusWithCounters * 2} dmg) = ${totalDamage} total`);
        return totalDamage;
    },
    
    // Status display customization
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.astartes.untapped + gameState.tokenCounts.astartes.tapped; // ASTARTES
            case 1: return gameState.cardsDrawn; // CARDS DRAWN
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};