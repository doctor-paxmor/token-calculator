// commanders/caesar.js
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.caesar = {
    name: "Caesar, Legion's Emperor",
    baseStats: "4/4",
    primaryTokens: ['soldier'],
    trackingLabels: ['SOLDIERS', 'SACRIFICED', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'ATTACK & SACRIFICE', action: 'attackAndSacrifice', class: 'primary-btn' },
        { text: 'CREATE SOLDIER', action: 'createSoldierToken', class: 'success-btn' }
    ],
    abilities: [
        { cost: 0, name: "ON ATTACK", description: "ATTACK\nSACRIFICE" },
        { cost: 0, name: "CHOOSE 2", description: "MODAL\nCHOOSE 2" },
        { cost: 0, name: "DAMAGE", description: "DIRECT\nDAMAGE" }
    ],
    
    // Caesar-specific functions
    attackAndSacrifice: function() {
        const availableCreatures = getTotalTokens();
        if (availableCreatures > 0) {
            // Sacrifice a creature
            removeTokens(1);
            
            // Show modal choice interface (simplified - auto-choose best options)
            const tokenCount = getTotalTokens();
            
            // Create two attacking soldiers
            const baseTokens = 2;
            const finalTokens = applyTokenMultipliers(baseTokens);
            gameState.tokenCounts.soldier.tapped += finalTokens; // They enter tapped and attacking
            
            // Draw a card and lose 1 life
            gameState.cardsDrawn += 1;
            
            addToHistory(`Attack: Sacrificed 1, created ${finalTokens} attacking Soldiers, drew 1 card`);
            updateDisplay();
        } else {
            addToHistory(`Caesar attacks (no creatures to sacrifice)`);
        }
    },
    
    createSoldierToken: function() {
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        gameState.tokenCounts.soldier.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`+${baseTokens} Soldier → +${finalTokens} (modified)`);
        } else {
            addToHistory(`+${finalTokens} Soldier`);
        }
        updateDisplay();
    },
    
    dealDamageToOpponent: function() {
        const tokenCount = getTotalTokens();
        if (tokenCount > 0) {
            addToHistory(`Caesar deals ${tokenCount} damage to opponent`);
        }
    },
    
    // Caesar's triggered ability choices
    chooseTwo: function() {
        const choices = [
            'Create two 1/1 red and white Soldier tokens with haste that are tapped and attacking',
            'Draw a card and lose 1 life', 
            'Caesar deals damage equal to creature tokens to target opponent'
        ];
        
        // For automation, choose the first two options
        this.createAttackingSoldiers();
        this.drawCardLoseLife();
    },
    
    createAttackingSoldiers: function() {
        const baseTokens = 2;
        const finalTokens = applyTokenMultipliers(baseTokens);
        gameState.tokenCounts.soldier.tapped += finalTokens;
        return `+${finalTokens} attacking Soldiers`;
    },
    
    drawCardLoseLife: function() {
        gameState.cardsDrawn += 1;
        return `Draw 1 card, lose 1 life`;
    },
    
    // Status display customization  
    getStatusValue: function(index) {
        switch(index) {
            case 0: return gameState.tokenCounts.soldier.untapped + gameState.tokenCounts.soldier.tapped; // SOLDIERS
            case 1: return gameState.cardsDrawn; // SACRIFICED (reusing for cards drawn)
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    }
};