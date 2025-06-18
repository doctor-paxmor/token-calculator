// js/core.js - Core game logic and commander system

// Global game state
let gameState = {
    tokenCounts: {
        hare: { untapped: 0, tapped: 0 },
        cat: { untapped: 0, tapped: 0 },
        dog: { untapped: 0, tapped: 0 },
        saproling: { untapped: 0, tapped: 0 },
        soldier: { untapped: 0, tapped: 0 },
        beast: { untapped: 0, tapped: 0 },
        spirit: { untapped: 0, tapped: 0 },
        astartes: { untapped: 0, tapped: 0 },
        myr: { untapped: 0, tapped: 0 },
        golem: { untapped: 0, tapped: 0 },
        squirrel: { untapped: 0, tapped: 0 },
        treasure: { untapped: 0, tapped: 0 },
        food: { untapped: 0, tapped: 0 },
        generic: { untapped: 0, tapped: 0 }
    },
    hareCount: 0,
    availableMana: 0,
    cardsDrawn: 0,
    commanderCounters: 0,
    commanderHasTrample: false,
    currentCommander: null,
    currentCommanderConfig: null,
    history: []
};

// Commander registry
window.CommanderConfigs = {};
let availableCommanders = [];

// Load available commanders from the commanders/ folder
async function loadAvailableCommanders() {
    const commanderList = [
        'baylen', 'chatterfang', 'caesar', 'marneus', 'jetmir', 
        'adrix', 'jinnie', 'brenard', 'arabella', 'brudiclad', 'trostani'
    ];
    
    const select = document.getElementById('commanderSelect');
    select.innerHTML = '<option value="">Select Commander...</option>';
    
    for (const commanderId of commanderList) {
        try {
            // Dynamically load commander script
            await loadCommanderScript(commanderId);
            
            if (window.CommanderConfigs[commanderId]) {
                availableCommanders.push(commanderId);
                const option = document.createElement('option');
                option.value = commanderId;
                option.textContent = window.CommanderConfigs[commanderId].name;
                select.appendChild(option);
            }
        } catch (error) {
            console.warn(`Failed to load commander ${commanderId}:`, error);
        }
    }
    
    // Set default commander
    if (availableCommanders.length > 0) {
        gameState.currentCommander = availableCommanders[0];
        select.value = gameState.currentCommander;
        await applyCommanderConfig();
    }
}

// Dynamically load a commander script
function loadCommanderScript(commanderId) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `commanders/${commanderId}.js`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Apply the current commander's configuration
async function applyCommanderConfig() {
    const config = window.CommanderConfigs[gameState.currentCommander];
    if (!config) return;
    
    gameState.currentCommanderConfig = config;
    
    // Update UI elements
    updateMainActionButtons();
    updateAbilityButtons();
    updateStatusLabels();
    updateCommanderInfo();
    updateDisplay();
    
    addToHistory(`Commander: ${config.name}`);
}

// Change commander when dropdown selection changes
async function changeCommander() {
    const select = document.getElementById('commanderSelect');
    const newCommander = select.value;
    
    if (newCommander && newCommander !== gameState.currentCommander) {
        gameState.currentCommander = newCommander;
        gameState.commanderCounters = 0;
        gameState.commanderHasTrample = false;
        
        await applyCommanderConfig();
    }
}

// Helper functions for token management
function getTotalTokens() {
    let total = 0;
    Object.values(gameState.tokenCounts).forEach(tokenType => {
        total += tokenType.untapped + tokenType.tapped;
    });
    return total;
}

function getTotalUntapped() {
    let total = 0;
    Object.values(gameState.tokenCounts).forEach(tokenType => {
        total += tokenType.untapped;
    });
    return total;
}

function getTotalTapped() {
    let total = 0;
    Object.values(gameState.tokenCounts).forEach(tokenType => {
        total += tokenType.tapped;
    });
    return total;
}

function addToHistory(action) {
    gameState.history.push(action);
    if (gameState.history.length > 15) {
        gameState.history.shift();
    }
    updateHistoryDisplay();
}

// Token manipulation functions
function addTokensDirect(amount) {
    const config = gameState.currentCommanderConfig;
    if (!config) return;
    
    const multipliedAmount = applyTokenMultipliers(amount);
    const primaryToken = config.primaryTokens[0];
    
    gameState.tokenCounts[primaryToken].untapped += multipliedAmount;
    
    if (multipliedAmount !== amount) {
        addToHistory(`+${amount} → +${multipliedAmount} (modified)`);
    } else {
        addToHistory(`+${amount}`);
    }
    updateDisplay();
}

function removeTokens(amount) {
    const totalTokens = getTotalTokens();
    const toRemove = Math.min(amount, totalTokens);
    let remaining = toRemove;
    
    Object.keys(gameState.tokenCounts).forEach(tokenType => {
        if (remaining <= 0) return;
        
        const tokenData = gameState.tokenCounts[tokenType];
        const untappedToRemove = Math.min(remaining, tokenData.untapped);
        tokenData.untapped -= untappedToRemove;
        remaining -= untappedToRemove;
        
        if (remaining > 0) {
            const tappedToRemove = Math.min(remaining, tokenData.tapped);
            tokenData.tapped -= tappedToRemove;
            remaining -= tappedToRemove;
        }
    });
    
    if (toRemove > 0) {
        addToHistory(`-${toRemove}`);
    }
    updateDisplay();
}

function tapTokens(amount) {
    let remaining = amount;
    
    Object.keys(gameState.tokenCounts).forEach(tokenType => {
        if (remaining <= 0) return;
        
        const tokenData = gameState.tokenCounts[tokenType];
        const toTap = Math.min(remaining, tokenData.untapped);
        
        if (toTap > 0) {
            tokenData.untapped -= toTap;
            tokenData.tapped += toTap;
            remaining -= toTap;
        }
    });
    
    const tapped = amount - remaining;
    if (tapped > 0) {
        addToHistory(`Tap ${tapped}`);
        updateDisplay();
    }
}

function untapTokens(amount) {
    let remaining = amount;
    
    Object.keys(gameState.tokenCounts).forEach(tokenType => {
        if (remaining <= 0) return;
        
        const tokenData = gameState.tokenCounts[tokenType];
        const toUntap = Math.min(remaining, tokenData.tapped);
        
        if (toUntap > 0) {
            tokenData.tapped -= toUntap;
            tokenData.untapped += toUntap;
            remaining -= toUntap;
        }
    });
    
    const untapped = amount - remaining;
    if (untapped > 0) {
        addToHistory(`Untap ${untapped}`);
        updateDisplay();
    }
}

function tapAll() {
    let totalTapped = 0;
    
    Object.keys(gameState.tokenCounts).forEach(tokenType => {
        const tokenData = gameState.tokenCounts[tokenType];
        totalTapped += tokenData.untapped;
        tokenData.tapped += tokenData.untapped;
        tokenData.untapped = 0;
    });
    
    if (totalTapped > 0) {
        addToHistory(`Tap ${totalTapped}`);
    }
    updateDisplay();
}

function untapAll() {
    let totalUntapped = 0;
    
    Object.keys(gameState.tokenCounts).forEach(tokenType => {
        const tokenData = gameState.tokenCounts[tokenType];
        totalUntapped += tokenData.tapped;
        tokenData.untapped += tokenData.tapped;
        tokenData.tapped = 0;
    });
    
    if (totalUntapped > 0) {
        addToHistory(`Untap ${totalUntapped}`);
    }
    updateDisplay();
}

function resetBattlefield() {
    const currentCommander = gameState.currentCommander;
    
    gameState = {
        tokenCounts: {
            hare: { untapped: 0, tapped: 0 },
            cat: { untapped: 0, tapped: 0 },
            dog: { untapped: 0, tapped: 0 },
            saproling: { untapped: 0, tapped: 0 },
            soldier: { untapped: 0, tapped: 0 },
            beast: { untapped: 0, tapped: 0 },
            spirit: { untapped: 0, tapped: 0 },
            astartes: { untapped: 0, tapped: 0 },
            myr: { untapped: 0, tapped: 0 },
            golem: { untapped: 0, tapped: 0 },
            squirrel: { untapped: 0, tapped: 0 },
            treasure: { untapped: 0, tapped: 0 },
            food: { untapped: 0, tapped: 0 },
            generic: { untapped: 0, tapped: 0 }
        },
        hareCount: 0,
        availableMana: 0,
        cardsDrawn: 0,
        commanderCounters: 0,
        commanderHasTrample: false,
        currentCommander: currentCommander,
        currentCommanderConfig: gameState.currentCommanderConfig,
        history: []
    };
    
    // Reset modifier toggles
    const modifierIds = ['doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession', 'primalVigor', 'adrixNev', 'ojerTaq'];
    const toggleIds = ['doublingToggle', 'parallelToggle', 'mondrakToggle', 'anointedToggle', 'primalToggle', 'adrixToggle', 'ojerToggle'];
    
    modifierIds.forEach(id => document.getElementById(id).checked = false);
    toggleIds.forEach(id => document.getElementById(id).classList.remove('active'));
    
    updateDisplay();
    addToHistory("Reset");
}

// Initialize the app
function initializeApp() {
    updateDisplay();
    updateHistoryDisplay();
    setTimeout(initializeAds, 2000);
}

// Commander-specific function delegation
function delegateToCommander(functionName, ...args) {
    const config = gameState.currentCommanderConfig;
    if (config && typeof config[functionName] === 'function') {
        return config[functionName](...args);
    }
    console.warn(`Function ${functionName} not found for commander ${gameState.currentCommander}`);
}

// Global function wrappers that delegate to current commander
function playHareApparent() { delegateToCommander('playHareApparent'); }
function removeHare() { delegateToCommander('removeHare'); }
function createCatToken() { delegateToCommander('createCatToken'); }
function createDogToken() { delegateToCommander('createDogToken'); }
function createSaproling() { delegateToCommander('createSaproling'); }
function createSoldierToken() { delegateToCommander('createSoldierToken'); }
function createBeastToken() { delegateToCommander('createBeastToken'); }
function createGenericToken() { delegateToCommander('createGenericToken'); }
function createSquirrelToken() { delegateToCommander('createSquirrelToken'); }
function createTreasureToken() { delegateToCommander('createTreasureToken'); }
function createMyrToken() { delegateToCommander('createMyrToken'); }
function createFoodToken() { delegateToCommander('createFoodToken'); }
function createSpiritToken() { delegateToCommander('createSpiritToken'); }
function createAstartesTokens() { delegateToCommander('createAstartesTokens'); }

// Special abilities
function populate() { delegateToCommander('populate'); }
function copyAllTokens() { delegateToCommander('copyAllTokens'); }
function attackAndSacrifice() { delegateToCommander('attackAndSacrifice'); }
function triggerDoubling() { delegateToCommander('triggerDoubling'); }
function foodToGolem() { delegateToCommander('foodToGolem'); }
function convertAllTokens() { delegateToCommander('convertAllTokens'); }
function triggerCombatDamage() { delegateToCommander('triggerCombatDamage'); }
function triggerTokenEntry() { delegateToCommander('triggerTokenEntry'); }

// Baylen abilities
function useManaAbility() { delegateToCommander('useManaAbility'); }
function useDrawAbility() { delegateToCommander('useDrawAbility'); }
function usePumpAbility() { delegateToCommander('usePumpAbility'); }