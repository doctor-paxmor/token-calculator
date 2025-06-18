// js/ui.js - UI update and display management

function updateDisplay() {
    updateStatusDisplay();
    updateMainDisplay();
    updateModifierToggles();
    updateAbilityButtons();
}

function updateMainDisplay() {
    const totalTokens = getTotalTokens();
    document.getElementById('mainNumber').textContent = totalTokens;
}

function updateStatusDisplay() {
    const config = gameState.currentCommanderConfig;
    if (!config) return;
    
    const labels = config.trackingLabels || ['TOKENS', 'VALUE', 'UNTAPPED', 'TAPPED'];
    
    // Update status labels and values
    for (let i = 0; i < 4; i++) {
        const statusCell = document.querySelector(`#status${i}`);
        const statusLabel = statusCell.parentElement.querySelector('.status-label');
        
        statusLabel.textContent = labels[i] || '';
        
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
        
        statusCell.textContent = value;
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
    
    config.mainActions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.className = `btn ${action.class}`;
        button.onclick = () => {
            if (typeof window[action.action] === 'function') {
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
    const baseStats = config.baseStats;
    const counters = gameState.commanderCounters;
    const trample = gameState.commanderHasTrample ? 'Yes' : 'No';
    
    commanderInfo.innerHTML = `
        <span>${config.name.split(',')[0]}: ${baseStats}</span>
        <span>+${counters}/+${counters}</span>
        <span>Trample: ${trample}</span>
    `;
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