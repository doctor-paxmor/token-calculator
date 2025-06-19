// js/tokenLogic.js - Token calculations and multiplier logic with isolated commander states

function applyTokenMultipliers(baseAmount) {
    if (baseAmount === 0) return 0;
    
    let multiplier = 1;
    
    // Effects that double ALL tokens
    if (document.getElementById('doublingSeasons').checked) multiplier *= 2;
    if (document.getElementById('mondrak').checked) multiplier *= 2;
    if (document.getElementById('primalVigor').checked) multiplier *= 2;
    if (document.getElementById('adrixNev').checked) multiplier *= 2; // Simplified - first time per turn
    
    // Effects that double CREATURE tokens (most tokens are creatures)
    if (document.getElementById('parallelLives').checked) multiplier *= 2;
    if (document.getElementById('anointedProcession').checked) multiplier *= 2;
    
    // Ojer Taq triples instead of doubles
    if (document.getElementById('ojerTaq').checked) multiplier *= 3;
    
    return baseAmount * multiplier;
}

function toggleModifier(id) {
    const checkbox = document.getElementById(id);
    checkbox.checked = !checkbox.checked;
    
    // Update display to show new modifier status
    updateDisplay();
    
    // Add to history which modifier was toggled
    const modifierNames = {
        'doublingSeasons': 'Doubling Season',
        'parallelLives': 'Parallel Lives', 
        'mondrak': 'Mondrak',
        'anointedProcession': 'Anointed Procession',
        'primalVigor': 'Primal Vigor',
        'adrixNev': 'Adrix & Nev',
        'ojerTaq': 'Ojer Taq'
    };
    
    const action = checkbox.checked ? 'ON' : 'OFF';
    addToHistory(`${modifierNames[id]} ${action}`);
}

// Calculate token power/toughness based on type
function getTokenStats(tokenType) {
    const tokenStats = {
        'hare': { power: 1, toughness: 1 },
        'cat': { power: 2, toughness: 2 },
        'dog': { power: 3, toughness: 1 },
        'saproling': { power: 1, toughness: 1 },
        'soldier': { power: 1, toughness: 1 },
        'beast': { power: 3, toughness: 3 },
        'spirit': { power: 1, toughness: 1 },
        'astartes': { power: 2, toughness: 2 },
        'myr': { power: 2, toughness: 1 },
        'golem': { power: 1, toughness: 1 }, // Grows with more golems
        'squirrel': { power: 1, toughness: 1 },
        'treasure': { power: 0, toughness: 0 }, // Artifacts
        'food': { power: 0, toughness: 0 }, // Artifacts
        'generic': { power: 1, toughness: 1 },
        'goblin': { power: 1, toughness: 1 }
    };
    
    return tokenStats[tokenType] || { power: 1, toughness: 1 };
}

// Calculate total combat damage potential
function calculateTotalCombatDamage() {
    let totalDamage = 0;
    const tokenCounts = getTokenCounts();
    
    Object.entries(tokenCounts).forEach(([tokenType, counts]) => {
        const tokenCount = counts.untapped + counts.tapped;
        if (tokenCount > 0) {
            const stats = getTokenStats(tokenType);
            totalDamage += tokenCount * stats.power;
        }
    });
    
    // Add commander damage
    const commanderPower = getCommanderPower();
    totalDamage += commanderPower;
    
    return totalDamage;
}

function getCommanderPower() {
    const config = gameState.currentCommanderConfig;
    const currentState = getCurrentCommanderState();
    if (!config || !currentState) return 0;
    
    const baseStats = config.baseStats.split('/');
    const basePower = parseInt(baseStats[0]);
    return basePower + currentState.commanderCounters;
}

// Token interaction helpers
function sacrificeTokensOfType(tokenType, amount) {
    const tokenCounts = getTokenCounts();
    const available = tokenCounts[tokenType].untapped + tokenCounts[tokenType].tapped;
    const toSacrifice = Math.min(amount, available);
    
    if (toSacrifice > 0) {
        let remaining = toSacrifice;
        
        // Remove from untapped first
        const fromUntapped = Math.min(remaining, tokenCounts[tokenType].untapped);
        tokenCounts[tokenType].untapped -= fromUntapped;
        remaining -= fromUntapped;
        
        // Then from tapped if needed
        if (remaining > 0) {
            tokenCounts[tokenType].tapped -= remaining;
        }
        
        updateDisplay();
    }
    
    return toSacrifice;
}

function createTokensOfType(tokenType, amount) {
    const finalAmount = applyTokenMultipliers(amount);
    const tokenCounts = getTokenCounts();
    tokenCounts[tokenType].untapped += finalAmount;
    
    // Check for commander-specific triggers
    const config = gameState.currentCommanderConfig;
    if (config && typeof config.onTokensEnter === 'function') {
        config.onTokensEnter(finalAmount);
    }
    
    updateDisplay();
    return finalAmount;
}

// Anthem and buff calculations
function applyAnthemEffects() {
    const config = gameState.currentCommanderConfig;
    if (!config) return { bonus: 0, effects: [] };
    
    // Commander-specific anthem calculations
    if (typeof config.getAnthemLevel === 'function') {
        return config.getAnthemLevel();
    }
    
    return { bonus: 0, effects: [] };
}

// Token conversion utilities
function convertAllTokensToType(targetType) {
    const totalTokens = getTotalTokens();
    if (totalTokens === 0) return 0;
    
    const untappedRatio = getTotalUntapped() / totalTokens;
    const tokenCounts = getTokenCounts();
    
    // Clear all current tokens
    Object.keys(tokenCounts).forEach(type => {
        tokenCounts[type].untapped = 0;
        tokenCounts[type].tapped = 0;
    });
    
    // Convert to target type
    const newUntapped = Math.ceil(totalTokens * untappedRatio);
    const newTapped = totalTokens - newUntapped;
    
    tokenCounts[targetType].untapped = newUntapped;
    tokenCounts[targetType].tapped = newTapped;
    
    updateDisplay();
    return totalTokens;
}

// Life gain calculations (for commanders like Trostani)
function calculateLifeGainFromTokens() {
    let totalLifeGain = 0;
    const tokenCounts = getTokenCounts();
    
    Object.entries(tokenCounts).forEach(([tokenType, counts]) => {
        const tokenCount = counts.untapped + counts.tapped;
        if (tokenCount > 0) {
            const stats = getTokenStats(tokenType);
            totalLifeGain += tokenCount * stats.toughness;
        }
    });
    
    return totalLifeGain;
}

// Special token abilities
function populateLargestToken() {
    let largestType = null;
    let largestPowerToughness = 0;
    const tokenCounts = getTokenCounts();
    
    Object.keys(tokenCounts).forEach(tokenType => {
        const count = tokenCounts[tokenType].untapped + tokenCounts[tokenType].tapped;
        if (count > 0) {
            const stats = getTokenStats(tokenType);
            const total = stats.power + stats.toughness;
            if (total > largestPowerToughness) {
                largestPowerToughness = total;
                largestType = tokenType;
            }
        }
    });
    
    if (largestType) {
        const finalTokens = applyTokenMultipliers(1);
        tokenCounts[largestType].untapped += finalTokens;
        updateDisplay();
        return { type: largestType, amount: finalTokens };
    }
    
    return null;
}

// Doubling effects
function doubleAllTokens() {
    let totalDoubled = 0;
    const tokenCounts = getTokenCounts();
    
    Object.keys(tokenCounts).forEach(tokenType => {
        const existing = tokenCounts[tokenType].untapped + tokenCounts[tokenType].tapped;
        if (existing > 0) {
            tokenCounts[tokenType].untapped += existing;
            totalDoubled += existing;
        }
    });
    
    updateDisplay();
    return totalDoubled;
}