// js/ui.js - UI update and display management

// Global reference for custom dropdown population
function populateCustomDropdown() {
    const dropdown = document.getElementById('customSelectDropdown');
    const valueDisplay = document.getElementById('customSelectValue');
    const originalSelect = document.getElementById('commanderSelect');
    
    if (!dropdown || !originalSelect) return;

    dropdown.innerHTML = '';
    
    // Only add actual commander options (NO placeholder option)
    originalSelect.querySelectorAll('option[value]:not([value=""])').forEach(option => {
        const customOption = document.createElement('div');
        customOption.className = 'custom-select-option';
        customOption.textContent = option.textContent;
        customOption.onclick = () => selectCustomOption(option.value, option.textContent);
        
        if (option.value === gameState.currentCommander) {
            customOption.classList.add('selected');
            valueDisplay.textContent = option.textContent;
        }
        
        dropdown.appendChild(customOption);
    });
}

function selectCustomOption(value, text) {
    const valueDisplay = document.getElementById('customSelectValue');
    const originalSelect = document.getElementById('commanderSelect');
    const customSelect = document.getElementById('commanderCustomSelect');
    const backdrop = document.getElementById('dropdownBackdrop');
    
    valueDisplay.textContent = text;
    originalSelect.value = value;
    
    // Close dropdown and backdrop
    customSelect.classList.remove('open');
    backdrop.classList.remove('active');
    
    // Update game state if commander changed
    if (value !== gameState.currentCommander) {
        gameState.currentCommander = value;
        gameState.commanderCounters = 0;
        gameState.commanderHasTrample = false;
        applyCommanderConfig();
        
        // Update custom dropdown to show selection
        populateCustomDropdown();
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
    document.getElementById('mainNumber').textContent = totalTokens;
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
        const statusCell = document.querySelector(`#status${i}`).parentElement;
        const statusLabel = statusCell.querySelector('.status-label');
        const statusNumber = statusCell.querySelector(`#status${i}`);
        
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

function updateMainActionButtons() {
    const config = gameState.currentCommanderConfig;
    if (!config || !config.mainActions) return;
    
    const buttonRow = document.getElementById('mainActionRow');
    buttonRow.innerHTML = '';
    
    // Special handling for Adrix and Nev
    if (config.name === "Adrix and Nev, Twincasters") {
        buttonRow.style.gridTemplateColumns = '1fr 0.8fr';
        buttonRow.style.gap = '8px';
        
        // Create CREATE TOKEN button
        const createBtn = document.createElement('button');
        createBtn.textContent = 'CREATE TOKEN';
        createBtn.className = 'btn primary-btn';
        createBtn.onclick = () => config.createGenericToken();
        buttonRow.appendChild(createBtn);
        
        // Create toggle switch button
        const toggleBtn = document.createElement('button');
        toggleBtn.onclick = () => config.toggleCommandZone();
        toggleBtn.style.cssText = `
            position: relative;
            background: #2d2d2d !important;
            border: 1px solid #404040 !important;
            border-radius: 6px !important;
            height: 48px !important;
            overflow: hidden;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 100%;
            font-weight: 500;
            font-size: 12px;
            transition: all 0.15s ease;
        `;
        toggleBtn.innerHTML = `
            <div style="
                position: absolute;
                top: 2px;
                ${config.onBattlefield ? 'right: 2px;' : 'left: 2px;'}
                width: calc(50% - 4px);
                height: calc(100% - 4px);
                background: ${config.onBattlefield ? '#107c10' : '#888'};
                border-radius: 4px;
                transition: all 0.3s ease;
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 500;
                color: white;
                text-align: center;
                line-height: 1.2;
            ">${config.onBattlefield ? 'ON<br>BATTLEFIELD' : 'IN COMMAND<br>ZONE'}</div>
        `;
        buttonRow.appendChild(toggleBtn);
        
    } else {
        // Dynamic layout based on number of buttons
        const buttonCount = config.mainActions.length;
        
        if (buttonCount === 1) {
            buttonRow.style.gridTemplateColumns = '1fr';
        } else if (buttonCount === 2) {
            buttonRow.style.gridTemplateColumns = '1fr 1fr';
        } else if (buttonCount === 3) {
            buttonRow.style.gridTemplateColumns = '1fr 1fr 1fr';
        } else {
            // Fallback for 4+ buttons
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
}

// Global function to handle command zone toggling for current commander
function toggleCurrentCommanderZone() {
    const config = gameState.currentCommanderConfig;
    if (config && typeof config.toggleCommandZone === 'function') {
        config.toggleCommandZone();
    }
}

function updateAbilityButtons() {
    const config = gameState.currentCommanderConfig;
    if (!config || !config.abilities) return;
    
    const abilityRow = document.getElementById('abilityRow');
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
            default:
                addToHistory(`Used ${ability.name} ability`);
        }
    }
}

function updateCommanderInfo() {
    const config = gameState.currentCommanderConfig;
    if (!config) return;
    
    const commanderInfo = document.getElementById('commanderInfo');
    
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

function updateStatusLabels() {
    const config = gameState.currentCommanderConfig;
    if (!config || !config.trackingLabels) return;
    
    config.trackingLabels.forEach((label, index) => {
        const statusLabel = document.querySelector(`#status${index}`).parentElement.querySelector('.status-label');
        if (statusLabel) {
            statusLabel.textContent = label;
        }
    });
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('historyLog');
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

// Loading states
function showLoading(message = 'Loading...') {
    const mainActionRow = document.getElementById('mainActionRow');
    const abilityRow = document.getElementById('abilityRow');
    
    mainActionRow.innerHTML = `<button class="btn primary-btn">${message}</button>`;
    abilityRow.innerHTML = `<button class="btn purple-btn">${message}</button>`;
}

function hideLoading() {
    updateMainActionButtons();
    updateAbilityButtons();
}

// Error handling for UI
function showError(message) {
    addToHistory(`Error: ${message}`);
    console.error(message);
}

// Animation helpers
function animateTokenChange(element, newValue) {
    if (!element) return;
    
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
    }, 100);
}

// Mobile-specific UI adjustments
function adjustForMobile() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

// Event listeners for responsive design
window.addEventListener('resize', adjustForMobile);
window.addEventListener('orientationchange', () => {
    setTimeout(adjustForMobile, 100);
});

// AdMob integration (preserved from original)
let adDismissed = false;
let appStartTime = Date.now();

function dismissAd() {
    adDismissed = true;
    document.getElementById('adBanner').classList.remove('visible');
    
    try {
        const { AdMob } = window.Capacitor.Plugins;
        if (AdMob) {
            AdMob.hideBanner();
        }
    } catch (error) {
        console.log('Error hiding AdMob banner:', error);
    }
    
    console.log('Ad dismissed by user');
}

function showAdBanner() {
    if (!adDismissed) {
        document.getElementById('adBanner').classList.add('visible');
    }
}

async function initializeAds() {
    console.log('initializeAds called');
    
    const timeUsed = Date.now() - appStartTime;
    const oneMinute = 60 * 1000;
    
    if (timeUsed < oneMinute) {
        console.log('Waiting before showing ads...');
        setTimeout(initializeAds, oneMinute - timeUsed);
        return;
    }

    if (adDismissed) {
        console.log('Ads dismissed by user');
        return;
    }

    try {
        const { AdMob } = window.Capacitor.Plugins;
        console.log('AdMob plugin:', AdMob);
        
        if (AdMob) {
            console.log('AdMob found, initializing...');
            await AdMob.initialize({
                initializeForTesting: true
            });
            await loadBannerAd();
        } else {
            console.log('AdMob plugin not found');
        }
    } catch (error) {
        console.log('AdMob error:', error);
    }
}

async function loadBannerAd() {
    try {
        const { AdMob } = window.Capacitor.Plugins;
        await AdMob.showBanner({
            position: 'BOTTOM_CENTER',
            size: 'BANNER'
        });
        console.log('Banner ad loaded');
        showAdBanner();
    } catch (error) {
        console.log('Banner ad error:', error);
    }
}

// Add CSS rule for hiding commander info
const style = document.createElement('style');
style.textContent = `
    .commander-info.hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Haptic feedback settings
let hapticEnabled = localStorage.getItem('hapticEnabled') !== 'false'; // Default on
let lastHapticTime = 0;

function toggleHapticFeedback() {
    hapticEnabled = !hapticEnabled;
    localStorage.setItem('hapticEnabled', hapticEnabled);
    
    const toggle = document.getElementById('hapticToggle');
    if (toggle) {
        toggle.classList.toggle('active', hapticEnabled);
        toggle.textContent = hapticEnabled ? 'HAPTIC\nON' : 'HAPTIC\nOFF';
    }
    
    addToHistory(`Haptic feedback ${hapticEnabled ? 'ON' : 'OFF'}`);
}

// Haptic feedback for all buttons and dropdown - wait for device ready
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        let shouldVibrate = false;
        
        // Check for standard elements
        if (e.target.matches('.btn') || 
            e.target.matches('.custom-select-trigger') || 
            e.target.matches('.custom-select-option')) {
            shouldVibrate = true;
        }
        
        // Special check for Adrix toggle slider (check if clicked element or its parent has the toggle function)
        if (e.target.onclick && e.target.onclick.toString().includes('toggleCommandZone')) {
            shouldVibrate = true;
        }
        if (e.target.parentElement && e.target.parentElement.onclick && 
            e.target.parentElement.onclick.toString().includes('toggleCommandZone')) {
            shouldVibrate = true;
        }
        
        // Fallback: any click in mainActionRow
        if (e.target.closest('#mainActionRow')) {
            shouldVibrate = true;
        }
        
        if (shouldVibrate) {
            // Only trigger haptic if enabled and enough time has passed (throttle)
            const now = Date.now();
            if (hapticEnabled && (now - lastHapticTime > 50)) {
                lastHapticTime = now;
                try {
                    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
                        // Try the weakest vibration with shortest duration
                        window.Capacitor.Plugins.Haptics.vibrate({ duration: 10 });
                    }
                } catch (error) {
                    // Silently fail if haptics not available
                }
            }
        }
    });
});