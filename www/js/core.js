// js/core.js - Core game logic and commander system with app close warning and isolated commander states

// Global game state
let gameState = {
    // Per-commander token states
    commanderStates: {},
    
    // Current session data
    currentCommander: null,
    currentCommanderConfig: null,
    history: []
};

// Default token structure for new commanders
const defaultTokenCounts = {
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
    generic: { untapped: 0, tapped: 0 },
    goblin: { untapped: 0, tapped: 0 }
};

// Get current commander's state, creating if needed
function getCurrentCommanderState() {
    if (!gameState.currentCommander) return null;
    
    if (!gameState.commanderStates[gameState.currentCommander]) {
        gameState.commanderStates[gameState.currentCommander] = {
            tokenCounts: JSON.parse(JSON.stringify(defaultTokenCounts)),
            hareCount: 0,
            availableMana: 0,
            cardsDrawn: 0,
            commanderCounters: 0,
            commanderHasTrample: false,
            goblinCreatures: 0, // For Krenko
            modifierStates: {},
            // Commander-specific data for Adrix
            onBattlefield: false,
            // Commander-specific data for Mahadi
            creaturesDeadThisTurn: 0
        };
    }
    
    return gameState.commanderStates[gameState.currentCommander];
}

// Helper function to get token counts for current commander
function getTokenCounts() {
    const state = getCurrentCommanderState();
    return state ? state.tokenCounts : defaultTokenCounts;
}

// App state management
let hasUnsavedData = false;
let closeWarningEnabled = true;
let isAppInitialized = false;

// State persistence functions
function saveGameState() {
    try {
        const stateToSave = {
            commanderStates: gameState.commanderStates,
            currentCommander: gameState.currentCommander,
            history: gameState.history,
            timestamp: Date.now()
        };
        
        // Also save modifier states for current commander
        const currentState = getCurrentCommanderState();
        if (currentState) {
            const modifierIds = ['doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession', 'primalVigor', 'adrixNev', 'ojerTaq'];
            modifierIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    currentState.modifierStates[id] = element.checked;
                }
            });
        }
        
        localStorage.setItem('mtg_calculator_state', JSON.stringify(stateToSave));
        console.log('Game state saved');
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

function loadGameState() {
    try {
        const savedState = localStorage.getItem('mtg_calculator_state');
        
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Check if saved state is recent (within last 24 hours)
            const saveAge = Date.now() - (parsedState.timestamp || 0);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (saveAge < maxAge) {
                // Restore game state
                gameState.commanderStates = parsedState.commanderStates || {};
                gameState.currentCommander = parsedState.currentCommander;
                gameState.history = parsedState.history || [];
                
                console.log('Game state restored');
                return true;
            } else {
                // Clear old state
                localStorage.removeItem('mtg_calculator_state');
            }
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
    }
    return false;
}

function clearSavedState() {
    try {
        localStorage.removeItem('mtg_calculator_state');
        console.log('Saved state cleared');
    } catch (error) {
        console.error('Failed to clear saved state:', error);
    }
}

// Apply modifier states for current commander
function applyModifierStates() {
    const currentState = getCurrentCommanderState();
    if (!currentState || !currentState.modifierStates) return;
    
    const modifierIds = ['doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession', 'primalVigor', 'adrixNev', 'ojerTaq'];
    const toggleIds = ['doublingToggle', 'parallelToggle', 'mondrakToggle', 'anointedToggle', 'primalToggle', 'adrixToggle', 'ojerToggle'];
    
    modifierIds.forEach((id, index) => {
        const element = document.getElementById(id);
        const toggle = document.getElementById(toggleIds[index]);
        const savedState = currentState.modifierStates[id];
        
        if (element && savedState !== undefined) {
            element.checked = savedState;
            if (toggle) {
                toggle.classList.toggle('active', savedState);
            }
        }
    });
}

// Track when user has meaningful data that would be lost
function updateUnsavedDataStatus() {
    const totalTokens = getTotalTokens();
    const hasModifiers = document.querySelectorAll('.toggle-btn.active').length > 0;
    const currentState = getCurrentCommanderState();
    const hasCounters = currentState ? currentState.commanderCounters > 0 : false;
    const hasHistory = gameState.history.length > 1; // More than just commander selection
    
    hasUnsavedData = totalTokens > 0 || hasModifiers || hasCounters || hasHistory;
    
    // Auto-save when there's data to preserve
    if (hasUnsavedData) {
        saveGameState();
    }
}

// Show confirmation dialog
function showCloseConfirmation() {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'closeConfirmationOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;
        
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: var(--bg-card);
            border: 1px solid var(--border-strong);
            border-radius: 12px;
            padding: 24px;
            max-width: 320px;
            margin: 20px;
            box-shadow: var(--shadow-lg);
            text-align: center;
            animation: scaleUp 0.3s ease;
        `;
        
        dialog.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
                    Exit Calculator?
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.4;">
                    Your game state has been saved automatically. You can return to continue where you left off.
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="confirmClose" style="
                    background: var(--red-muted);
                    border: 1px solid var(--red-muted);
                    color: var(--text-primary);
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                ">Exit</button>
                <button id="cancelClose" style="
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-muted);
                    color: var(--text-primary);
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                ">Stay</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Add hover effects
        const confirmBtn = document.getElementById('confirmClose');
        const cancelBtn = document.getElementById('cancelClose');
        
        confirmBtn.onmouseover = () => confirmBtn.style.background = 'var(--red-active)';
        confirmBtn.onmouseout = () => confirmBtn.style.background = 'var(--red-muted)';
        
        cancelBtn.onmouseover = () => cancelBtn.style.background = 'var(--bg-card)';
        cancelBtn.onmouseout = () => cancelBtn.style.background = 'var(--bg-tertiary)';
        
        // Add event listeners
        confirmBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        
        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        };
        
        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escapeHandler);
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve(false);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    });
}

// Handle app close/navigation away
async function handleAppClose(event) {
    if (!closeWarningEnabled) return true;
    
    updateUnsavedDataStatus();
    
    if (hasUnsavedData) {
        event.preventDefault();
        event.returnValue = ''; // Required for some browsers
        
        // For mobile apps using Capacitor
        if (window.Capacitor) {
            const shouldClose = await showCloseConfirmation();
            if (shouldClose) {
                closeWarningEnabled = false; // Prevent double confirmation
                try {
                    const { App } = window.Capacitor.Plugins;
                    if (App) {
                        App.exitApp();
                    }
                } catch (error) {
                    window.close();
                }
            }
            return false;
        }
        
        return 'Your game state will be saved. Exit calculator?';
    }
    
    return true;
}

// Initialize close warning listeners
function initializeCloseWarning() {
    // Web browsers
    window.addEventListener('beforeunload', handleAppClose);
    
    // Capacitor mobile apps - handle back button properly
    if (window.Capacitor) {
        // Wait for device to be ready
        document.addEventListener('deviceready', () => {
            setupCapacitorListeners();
        });
        
        // Also try immediate setup in case deviceready already fired
        if (window.Capacitor.Plugins) {
            setupCapacitorListeners();
        }
    }
}

function setupCapacitorListeners() {
    try {
        const { App } = window.Capacitor.Plugins;
        if (App) {
            // Handle back button
            App.addListener('backButton', async (info) => {
                console.log('Back button pressed, can go back:', info.canGoBack);
                
                updateUnsavedDataStatus();
                
                if (hasUnsavedData && closeWarningEnabled) {
                    const shouldClose = await showCloseConfirmation();
                    if (shouldClose) {
                        closeWarningEnabled = false;
                        saveGameState(); // Ensure state is saved before exit
                        App.exitApp();
                    }
                } else {
                    App.exitApp();
                }
            });
            
            // Handle app state changes (backgrounding/foregrounding)
            App.addListener('appStateChange', async ({ isActive }) => {
                if (isActive) {
                    console.log('App became active');
                    // App came to foreground - could reload state here if needed
                } else {
                    console.log('App became inactive');
                    // App going to background - save state
                    updateUnsavedDataStatus();
                    if (hasUnsavedData) {
                        saveGameState();
                    }
                }
            });
            
            // Handle app pause/resume
            App.addListener('pause', () => {
                console.log('App paused');
                updateUnsavedDataStatus();
                if (hasUnsavedData) {
                    saveGameState();
                }
            });
            
            App.addListener('resume', () => {
                console.log('App resumed');
                // Could check for state updates here
            });
            
            console.log('Capacitor app listeners initialized');
        }
    } catch (error) {
        console.log('App plugin not available:', error);
    }
}

// Commander registry
window.CommanderConfigs = {};
let availableCommanders = [];

// Load available commanders from the commanders/ folder
async function loadAvailableCommanders() {
    const commanderList = [
        'adrix', 'baylen',
        'chatterfang', 'jinnie', 'krenko-mob', 'mahadi', 'rinseri'
    ];

    const select = document.getElementById('commanderSelect');
    select.innerHTML = '<option value="">Choose your commander...</option>';

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

    // Try to restore saved state first
    const stateRestored = loadGameState();
    
    if (stateRestored && gameState.currentCommander) {
        // Set the restored commander
        select.value = gameState.currentCommander;
        await applyCommanderConfig();
        applyModifierStates();
        
        // Show restoration message
        if (gameState.history.length === 0) {
            addToHistory("State restored");
        }
    } else {
        // Set default commander if no state was restored
        if (availableCommanders.length > 0) {
            gameState.currentCommander = availableCommanders[0];
            select.value = gameState.currentCommander;
            await applyCommanderConfig();
        }
    }

    // Trigger custom dropdown update if it exists
    if (typeof populateCustomDropdown === 'function') {
        populateCustomDropdown();
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

    // Ensure commander state exists
    getCurrentCommanderState();

    // Clear modifier toggles before applying new commander's states
    const modifierIds = ['doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession', 'primalVigor', 'adrixNev', 'ojerTaq'];
    const toggleIds = ['doublingToggle', 'parallelToggle', 'mondrakToggle', 'anointedToggle', 'primalToggle', 'adrixToggle', 'ojerToggle'];
    
    modifierIds.forEach(id => document.getElementById(id).checked = false);
    toggleIds.forEach(id => document.getElementById(id).classList.remove('active'));

    // Update UI elements
    updateMainActionButtons();
    updateAbilityButtons();
    updateStatusLabels();
    updateCommanderInfo();
    updateCommanderArt();
    updateDisplay();

    if (!isAppInitialized) {
        addToHistory(`Commander: ${config.name}`);
    }
}

// Change commander when dropdown selection changes
async function changeCommander() {
    const select = document.getElementById('commanderSelect');
    const newCommander = select.value;

    if (newCommander && newCommander !== gameState.currentCommander) {
        // Save current commander's modifier states before switching
        const currentState = getCurrentCommanderState();
        if (currentState) {
            const modifierIds = ['doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession', 'primalVigor', 'adrixNev', 'ojerTaq'];
            modifierIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    currentState.modifierStates[id] = element.checked;
                }
            });
        }

        // Switch to new commander
        gameState.currentCommander = newCommander;
        await applyCommanderConfig();
        
        // Apply the new commander's modifier states
        applyModifierStates();
        
        updateUnsavedDataStatus();
    }
}

// Helper functions for token management - now use current commander's state
function getTotalTokens() {
    let total = 0;
    const tokenCounts = getTokenCounts();
    Object.values(tokenCounts).forEach(tokenType => {
        total += tokenType.untapped + tokenType.tapped;
    });
    return total;
}

function getTotalUntapped() {
    let total = 0;
    const tokenCounts = getTokenCounts();
    Object.values(tokenCounts).forEach(tokenType => {
        total += tokenType.untapped;
    });
    return total;
}

function getTotalTapped() {
    let total = 0;
    const tokenCounts = getTokenCounts();
    Object.values(tokenCounts).forEach(tokenType => {
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
    updateUnsavedDataStatus(); // Update unsaved data status when history changes
}

// Token manipulation functions - now use current commander's state
function addTokensDirect(amount) {
    const config = gameState.currentCommanderConfig;
    if (!config) return;

    const multipliedAmount = applyTokenMultipliers(amount);
    const primaryToken = config.primaryTokens[0];
    const tokenCounts = getTokenCounts();

    tokenCounts[primaryToken].untapped += multipliedAmount;

    if (multipliedAmount !== amount) {
        addToHistory(`+${amount} → +${multipliedAmount} (modified)`);
    } else {
        addToHistory(`+${amount}`);
    }
    updateDisplay();
    updateUnsavedDataStatus();

    // Auto-initialize Adrix toggle on load
    if (config.name === "Adrix and Nev, Twincasters") {
        setTimeout(() => {
            if (typeof config.updateToggleDisplay === 'function') {
                config.updateToggleDisplay();
            }
        }, 100);
    }
}

function removeTokens(amount) {
    const totalTokens = getTotalTokens();
    const toRemove = Math.min(amount, totalTokens);
    let remaining = toRemove;
    const tokenCounts = getTokenCounts();

    Object.keys(tokenCounts).forEach(tokenType => {
        if (remaining <= 0) return;

        const tokenData = tokenCounts[tokenType];
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
    updateUnsavedDataStatus();
}

function tapTokens(amount) {
    let remaining = amount;
    const tokenCounts = getTokenCounts();

    Object.keys(tokenCounts).forEach(tokenType => {
        if (remaining <= 0) return;

        const tokenData = tokenCounts[tokenType];
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
        updateUnsavedDataStatus();
    }
}

function untapTokens(amount) {
    let remaining = amount;
    const tokenCounts = getTokenCounts();

    Object.keys(tokenCounts).forEach(tokenType => {
        if (remaining <= 0) return;

        const tokenData = tokenCounts[tokenType];
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
        updateUnsavedDataStatus();
    }
}

function tapAll() {
    let totalTapped = 0;
    const tokenCounts = getTokenCounts();

    Object.keys(tokenCounts).forEach(tokenType => {
        const tokenData = tokenCounts[tokenType];
        totalTapped += tokenData.untapped;
        tokenData.tapped += tokenData.untapped;
        tokenData.untapped = 0;
    });

    if (totalTapped > 0) {
        addToHistory(`Tap ${totalTapped}`);
    }
    updateDisplay();
    updateUnsavedDataStatus();
}

function untapAll() {
    let totalUntapped = 0;
    const tokenCounts = getTokenCounts();

    Object.keys(tokenCounts).forEach(tokenType => {
        const tokenData = tokenCounts[tokenType];
        totalUntapped += tokenData.tapped;
        tokenData.untapped += tokenData.tapped;
        tokenData.tapped = 0;
    });

    if (totalUntapped > 0) {
        addToHistory(`Untap ${totalUntapped}`);
    }
    updateDisplay();
    updateUnsavedDataStatus();
}

function resetBattlefield() {
    const currentCommander = gameState.currentCommander;

    // Reset current commander's state only
    if (currentCommander && gameState.commanderStates[currentCommander]) {
        gameState.commanderStates[currentCommander] = {
            tokenCounts: JSON.parse(JSON.stringify(defaultTokenCounts)),
            hareCount: 0,
            availableMana: 0,
            cardsDrawn: 0,
            commanderCounters: 0,
            commanderHasTrample: false,
            goblinCreatures: 0,
            modifierStates: {},
            onBattlefield: false,
            creaturesDeadThisTurn: 0
        };
    }

    // Reset modifier toggles
    const modifierIds = ['doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession', 'primalVigor', 'adrixNev', 'ojerTaq'];
    const toggleIds = ['doublingToggle', 'parallelToggle', 'mondrakToggle', 'anointedToggle', 'primalToggle', 'adrixToggle', 'ojerToggle'];

    modifierIds.forEach(id => document.getElementById(id).checked = false);
    toggleIds.forEach(id => document.getElementById(id).classList.remove('active'));

    // Reset only current commander's history
    gameState.history = [];

    updateDisplay();
    addToHistory("Reset");
    updateUnsavedDataStatus();
}

// Initialize the app
async function initializeApp() {
    // Initialize close warning system
    initializeCloseWarning();
    
    // Lock to portrait orientation
    try {
        const { ScreenOrientation } = window.Capacitor.Plugins;
        if (ScreenOrientation) {
            await ScreenOrientation.lock({ orientation: 'portrait' });
        }
    } catch (error) {
        console.log('Screen orientation lock not available:', error);
    }
    
    updateDisplay();
    updateHistoryDisplay();
    setTimeout(initializeAds, 2000);
    
    isAppInitialized = true;
}

// Add the missing UI update functions that were in ui.js
function updateMainActionButtons() {
    const config = gameState.currentCommanderConfig;
    if (!config || !config.mainActions) return;
    
    const buttonRow = document.getElementById('mainActionRow');
    if (!buttonRow) return;
    
    buttonRow.innerHTML = '';
    
    // Dynamic layout based on number of buttons
    const buttonCount = config.mainActions.length;
    
    if (buttonCount === 1) {
        buttonRow.style.gridTemplateColumns = '1fr';
    } else if (buttonCount === 2) {
        buttonRow.style.gridTemplateColumns = '1fr 1fr';
    } else if (buttonCount === 3) {
        buttonRow.style.gridTemplateColumns = '1fr 1fr 1fr';
    } else {
        buttonRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(80px, 1fr))';
    }
    
    buttonRow.style.gap = '6px';
    
    config.mainActions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.className = `btn ${action.class}`;
        button.onclick = () => {
            if (typeof config[action.action] === 'function') {
                config[action.action]();
            } else if (typeof window[action.action] === 'function') {
                window[action.action]();
            } else {
                console.warn(`Action function ${action.action} not found`);
            }
        };
        buttonRow.appendChild(button);
    });
}

function updateAbilityButtons() {
    const config = gameState.currentCommanderConfig;
    if (!config || !config.abilities) return;
    
    const abilityRow = document.getElementById('abilityRow');
    if (!abilityRow) return;
    
    abilityRow.innerHTML = '';
    
    config.abilities.forEach((ability, index) => {
        if (index < 3) { // Limit to 3 abilities for layout
            const button = document.createElement('button');
            button.className = 'btn purple-btn';
            button.innerHTML = ability.description;
            
            // Set up ability-specific click handlers
            button.onclick = () => {
                handleAbilityClick(ability, index);
            };
            
            // Disable button based on requirements
            if (ability.cost > 0 && typeof ability.cost === 'number') {
                button.disabled = getTotalUntapped() < ability.cost;
            }
            
            abilityRow.appendChild(button);
        }
    });
    
    // Fill remaining slots with empty buttons if needed
    while (abilityRow.children.length < 3) {
        const emptyButton = document.createElement('button');
        emptyButton.className = 'btn purple-btn';
        emptyButton.style.display = 'none';
        abilityRow.appendChild(emptyButton);
    }
}

function handleAbilityClick(ability, index) {
    const config = gameState.currentCommanderConfig;
    
    // Try commander-specific ability handlers first
    const abilityName = ability.name.toLowerCase().replace(/[^a-z]/g, '');
    const handlerName = `use${ability.name.replace(/[^a-zA-Z]/g, '')}Ability`;
    
    if (typeof config[handlerName] === 'function') {
        config[handlerName]();
    } else if (typeof window[handlerName] === 'function') {
        window[handlerName]();
    } else {
        // Generic ability handlers
        switch(abilityName) {
            case 'mana':
                useManaAbility();
                break;
            case 'draw':
                useDrawAbility();
                break;
            case 'pump':
            case '33':
                usePumpAbility();
                break;
            case 'togglezone':
                toggleCommandZone();
                break;
            default:
                addToHistory(`Used ${ability.name} ability`);
        }
    }
}

function updateStatusLabels() {
    const config = gameState.currentCommanderConfig;
    if (!config || !config.trackingLabels) return;
    
    config.trackingLabels.forEach((label, index) => {
        const statusElement = document.querySelector(`#status${index}`);
        if (statusElement) {
            const statusLabel = statusElement.parentElement.querySelector('.status-label');
            if (statusLabel) {
                statusLabel.textContent = label;
            }
        }
    });
}

function updateCommanderInfo() {
    const config = gameState.currentCommanderConfig;
    if (!config) return;
    
    const commanderInfo = document.getElementById('commanderInfo');
    if (!commanderInfo) return;
    
    // Only show commander info if explicitly enabled
    if (config.showCommanderInfo === true) {
        // Show the element
        commanderInfo.parentElement.style.display = 'block';
        commanderInfo.classList.remove('hidden');
        
        // Check if commander has custom display info function
        if (typeof config.getCommanderDisplayInfo === 'function') {
            // Use commander-specific display info
            const displayInfo = config.getCommanderDisplayInfo();
            commanderInfo.innerHTML = displayInfo;
        } else {
            // Fallback to basic display (name and stats only)
            commanderInfo.innerHTML = `
                <span>${config.name}: ${config.baseStats}</span>
            `;
        }
    } else {
        // Hide the entire container
        commanderInfo.parentElement.style.display = 'none';
        commanderInfo.innerHTML = '';
    }
}

function updateCommanderArt() {
    const config = gameState.currentCommanderConfig;
    const artImg = document.getElementById('commanderArt');
    
    if (!artImg) return; // Art element doesn't exist yet
    
    if (config && config.artPath) {
        artImg.src = config.artPath;
        artImg.style.display = 'block';
        artImg.onerror = function() {
            // Hide image if it fails to load
            this.style.display = 'none';
            console.log(`Commander art not found: ${config.artPath}`);
        };
    } else {
        artImg.style.display = 'none';
    }
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('historyLog');
    if (!historyDiv) return;
    
    if (gameState.history.length === 0) {
        historyDiv.innerHTML = '<div style="color: #333;">History</div>';
    } else {
        historyDiv.innerHTML = gameState.history
            .slice(-10)
            .map(entry => `<div style="margin-bottom: 1px;">${entry}</div>`)
            .join('');
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }
}

function updateDisplay() {
    updateStatusDisplay();
    updateMainDisplay();
    updateModifierToggles();
    updateAbilityButtons();
    updateCommanderInfo();
    updateCommanderArt();
}

function updateMainDisplay() {
    const totalTokens = getTotalTokens();
    const mainNumber = document.getElementById('mainNumber');
    if (mainNumber) {
        mainNumber.textContent = totalTokens;
    }
}

function updateStatusDisplay() {
    const config = gameState.currentCommanderConfig;
    if (!config) return;
    
    const labels = config.trackingLabels || ['TOKENS', 'VALUE', 'UNTAPPED', 'TAPPED'];
    
    // Count valid labels (non-empty)
    const validLabels = labels.filter(label => label && label.trim() !== '');
    const validCount = validLabels.length;
    
    // Get the status grid container
    const statusGrid = document.querySelector('.status-grid');
    if (!statusGrid) return;
    
    // Update grid layout based on number of valid labels
    if (validCount === 3) {
        statusGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
    } else if (validCount === 2) {
        statusGrid.style.gridTemplateColumns = '1fr 1fr';
    } else if (validCount === 1) {
        statusGrid.style.gridTemplateColumns = '1fr';
    } else {
        statusGrid.style.gridTemplateColumns = 'repeat(4, 1fr)'; // Default 4 columns
    }
    
    // Update status labels and values
    for (let i = 0; i < 4; i++) {
        const statusNumber = document.querySelector(`#status${i}`);
        if (!statusNumber) continue;
        
        const statusCell = statusNumber.parentElement;
        const statusLabel = statusCell.querySelector('.status-label');
        
        if (i < validCount && labels[i] && labels[i].trim() !== '') {
            // Show this cell
            statusCell.style.display = 'block';
            statusLabel.textContent = labels[i];
            
            let value = 0;
            if (typeof config.getStatusValue === 'function') {
                value = config.getStatusValue(i);
            } else {
                // Default status values
                switch(i) {
                    case 0: value = getTotalTokens(); break;
                    case 1: value = calculateTotalCombatDamage(); break;
                    case 2: value = getTotalUntapped(); break;
                    case 3: value = getTotalTapped(); break;
                }
            }
            
            statusNumber.textContent = value;
        } else {
            // Hide this cell
            statusCell.style.display = 'none';
        }
    }
}

function updateModifierToggles() {
    const toggles = [
        'doublingToggle', 'parallelToggle', 'mondrakToggle', 'anointedToggle',
        'primalToggle', 'adrixToggle', 'ojerToggle'
    ];
    const checkboxes = [
        'doublingSeasons', 'parallelLives', 'mondrak', 'anointedProcession',
        'primalVigor', 'adrixNev', 'ojerTaq'
    ];
    
    toggles.forEach((toggleId, index) => {
        const toggle = document.getElementById(toggleId);
        const checkbox = document.getElementById(checkboxes[index]);
        if (toggle && checkbox) {
            toggle.classList.toggle('active', checkbox.checked);
        }
    });
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
function createGoblinToken() { delegateToCommander('createGoblinToken'); }

// Commander-specific function wrappers
function addDeadCreature() { delegateToCommander('addDeadCreature'); }
function endStepTrigger() { delegateToCommander('endStepTrigger'); }
function addGoblinCreature() { delegateToCommander('addGoblinCreature'); }
function removeGoblinCreature() { delegateToCommander('removeGoblinCreature'); }
function useKrenkoAbility() { delegateToCommander('useKrenkoAbility'); }
function castDogSpell() { delegateToCommander('castDogSpell'); }
function castCatSpell() { delegateToCommander('castCatSpell'); }
function useDamageLifeAbility() { delegateToCommander('useDamageLifeAbility'); }
function createMultipleCats() { delegateToCommander('createMultipleCats'); }
function createMultipleDogs() { delegateToCommander('createMultipleDogs'); }
function toggleCommandZone() { delegateToCommander('toggleCommandZone'); }

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