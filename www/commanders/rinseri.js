// commanders/rinseri.js - Updated for isolated commander states
window.CommanderConfigs = window.CommanderConfigs || {};
window.CommanderConfigs.rinseri = {
    name: "Rin and Seri, Inseparable",
    baseStats: "4/4",
    primaryTokens: ['cat', 'dog'],
    artPath: "assets/art/rin.jpg",
    showCounters: false, // Don't show +1/+1 counters for Rin and Seri
    trackingLabels: ['CATS', 'DOGS', 'UNTAPPED', 'TAPPED'],
    mainActions: [
        { text: 'CAST DOG SPELL', action: 'castDogSpell', class: 'primary-btn' },
        { text: 'CAST CAT SPELL', action: 'castCatSpell', class: 'success-btn' }
    ],
    abilities: [
        { cost: 3, name: "DAMAGE & LIFE", description: "RGW + TAP\nDAMAGE/LIFE" }
    ],
    
    // Rin and Seri specific functions
    castDogSpell: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Whenever you cast a Dog spell, create a 1/1 green Cat creature token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.cat.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`Cast Dog spell → +${baseTokens} Cat → +${finalTokens} (modified)`);
        } else {
            addToHistory(`Cast Dog spell → +${finalTokens} 1/1 green Cat`);
        }
        updateDisplay();
    },
    
    castCatSpell: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        // Whenever you cast a Cat spell, create a 1/1 white Dog creature token
        const baseTokens = 1;
        const finalTokens = applyTokenMultipliers(baseTokens);
        
        currentState.tokenCounts.dog.untapped += finalTokens;
        
        if (finalTokens !== baseTokens) {
            addToHistory(`Cast Cat spell → +${baseTokens} Dog → +${finalTokens} (modified)`);
        } else {
            addToHistory(`Cast Cat spell → +${finalTokens} 1/1 white Dog`);
        }
        updateDisplay();
    },
    
    // Activated ability: {R}{G}{W}, {T}: Deal damage equal to Dogs, gain life equal to Cats
    useDamageLifeAbility: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return;
        
        const dogCount = currentState.tokenCounts.dog.untapped + currentState.tokenCounts.dog.tapped;
        const catCount = currentState.tokenCounts.cat.untapped + currentState.tokenCounts.cat.tapped;
        
        if (dogCount > 0 || catCount > 0) {
            let result = [];
            if (dogCount > 0) result.push(`${dogCount} damage`);
            if (catCount > 0) result.push(`gain ${catCount} life`);
            
            addToHistory(`Rin & Seri activated: ${result.join(', ')}`);
        } else {
            addToHistory(`Rin & Seri activated: No Dogs or Cats`);
        }
        updateDisplay();
    },
    
    // Calculate total combat damage potential
    calculateCombatDamage: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const catCount = currentState.tokenCounts.cat.untapped + currentState.tokenCounts.cat.tapped;
        const dogCount = currentState.tokenCounts.dog.untapped + currentState.tokenCounts.dog.tapped;
        const rinSeriPower = 4 + currentState.commanderCounters;
        
        // Cats are 1/1, Dogs are 1/1
        const catDamage = catCount * 1;
        const dogDamage = dogCount * 1;
        const totalDamage = catDamage + dogDamage + rinSeriPower;
        
        addToHistory(`Combat: ${catCount} Cats + ${dogCount} Dogs + Rin & Seri (${rinSeriPower}) = ${totalDamage} damage`);
        return totalDamage;
    },
    
    // Quick reference for activated ability
    checkActivatedAbility: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return { damage: 0, life: 0 };
        
        const dogCount = currentState.tokenCounts.dog.untapped + currentState.tokenCounts.dog.tapped;
        const catCount = currentState.tokenCounts.cat.untapped + currentState.tokenCounts.cat.tapped;
        
        addToHistory(`Current: ${dogCount} Dogs (damage), ${catCount} Cats (life gain)`);
        return { damage: dogCount, life: catCount };
    },
    
    // Status display customization
    getStatusValue: function(index) {
        const currentState = getCurrentCommanderState();
        if (!currentState) return 0;
        
        const tokenCounts = currentState.tokenCounts;
        
        switch(index) {
            case 0: return tokenCounts.cat.untapped + tokenCounts.cat.tapped; // CATS
            case 1: return tokenCounts.dog.untapped + tokenCounts.dog.tapped; // DOGS
            case 2: return getTotalUntapped(); // UNTAPPED
            case 3: return getTotalTapped(); // TAPPED
            default: return 0;
        }
    },
    
    // Commander info display
    getCommanderDisplayInfo: function() {
        const currentState = getCurrentCommanderState();
        if (!currentState) return '';
        
        const catCount = currentState.tokenCounts.cat.untapped + currentState.tokenCounts.cat.tapped;
        const dogCount = currentState.tokenCounts.dog.untapped + currentState.tokenCounts.dog.tapped;
        return `
            <span>Rin & Seri: 4/4</span>
            <span>Damage: ${dogCount}</span>
            <span>Life: ${catCount}</span>
        `;
    }
};