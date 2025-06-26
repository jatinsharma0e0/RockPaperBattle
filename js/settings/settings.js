/**
 * Settings module for Rock Paper Battle
 * Handles the settings screen functionality
 */

import { getData, setData, clearAllData } from './storage.js';
import * as sound from '../features/sound.js';
import * as theme from '../features/theme.js';
import * as avatar from '../features/avatar.js';
import * as achievements from '../features/achievements.js';
import * as stats from '../features/stats.js';
import * as secretMove from '../features/secretMove.js';
import * as aiModes from '../features/aiModes.js';
import * as speedMode from '../features/speedMode.js';
import * as bonusRound from '../features/bonusRound.js';
import * as accessibility from '../features/accessibility.js';
import * as performance from '../utils/performance.js';
import * as preloader from '../utils/preloader.js';

/**
 * Initialize the settings screen
 */
export function init() {
    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up event listeners for the settings screen
 */
function setupEventListeners() {
    // Back button
    const backBtn = document.getElementById('back-from-settings');
    if (backBtn) {
        backBtn.addEventListener('click', hideSettings);
    }
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId);
                sound.play('click');
                
                // Update tab ARIA attributes
                tabButtons.forEach(btn => {
                    btn.setAttribute('aria-selected', btn === button);
                });
            }
        });
    });
    
    // Theme selectors
    theme.setupThemeSelectors();
    
    // Avatar selectors
    avatar.setupAvatarSelectors();
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle-setting');
    if (soundToggle) {
        // Set initial value
        soundToggle.checked = sound.isSoundEnabled();
        
        // Add change event listener
        soundToggle.addEventListener('change', () => {
            sound.setSoundEnabled(soundToggle.checked);
            sound.play('click');
        });
    }
    
    // Sound volume slider
    const soundVolumeSlider = document.getElementById('sound-volume');
    if (soundVolumeSlider) {
        soundVolumeSlider.value = sound.getVolume() * 100;
        soundVolumeSlider.addEventListener('input', () => {
            sound.setVolume(soundVolumeSlider.value / 100);
        });
    }
    
    // Ambient sound toggle
    const ambientToggle = document.getElementById('ambient-toggle-setting');
    if (ambientToggle) {
        // Set initial value
        ambientToggle.checked = sound.isAmbientEnabled();
        
        // Add change event listener
        ambientToggle.addEventListener('change', () => {
            sound.setAmbientEnabled(ambientToggle.checked);
            sound.play('click');
        });
    }
    
    // Ambient volume slider
    const ambientVolumeSlider = document.getElementById('ambient-volume');
    if (ambientVolumeSlider) {
        ambientVolumeSlider.value = sound.getAmbientVolume() * 100;
        ambientVolumeSlider.addEventListener('input', () => {
            sound.setAmbientVolume(ambientVolumeSlider.value / 100);
        });
    }
    
    // Sound style selector
    const soundStyleRetro = document.getElementById('sound-style-retro');
    const soundStyleModern = document.getElementById('sound-style-modern');
    
    if (soundStyleRetro && soundStyleModern) {
        // Set initial values based on current setting
        const currentStyle = sound.getAudioStyle();
        soundStyleRetro.checked = currentStyle === 'retro';
        soundStyleModern.checked = currentStyle === 'modern';
        
        // Add change event listeners
        soundStyleRetro.addEventListener('change', () => {
            if (soundStyleRetro.checked) {
                sound.setAudioStyle('retro');
                // Reload audio assets with new style
                preloader.reloadAudioAssets();
            }
        });
        
        soundStyleModern.addEventListener('change', () => {
            if (soundStyleModern.checked) {
                sound.setAudioStyle('modern');
                // Reload audio assets with new style
                preloader.reloadAudioAssets();
            }
        });
    }
    
    // Test sound button
    const testSoundBtn = document.getElementById('test-sound-btn');
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', () => {
            sound.play('win');
        });
    }
    
    // AI mode selector
    const aiModeSelect = document.getElementById('ai-mode-select');
    if (aiModeSelect) {
        // Set initial value
        aiModeSelect.value = aiModes.getCurrentMode();
        
        // Update description based on current selection
        updateAiModeDescription(aiModes.getCurrentMode());
        
        // Add change event listener
        aiModeSelect.addEventListener('change', () => {
            const selectedMode = aiModeSelect.value;
            aiModes.setAiMode(selectedMode);
            updateAiModeDescription(selectedMode);
            sound.play('click');
        });
    }
    
    // Speed mode toggle
    const speedModeToggle = document.getElementById('speed-mode-toggle');
    if (speedModeToggle) {
        // Set initial value
        speedModeToggle.checked = speedMode.isEnabled();
        
        // Add change event listener
        speedModeToggle.addEventListener('change', () => {
            speedMode.setEnabled(speedModeToggle.checked);
            sound.play('click');
            updateGameBanner();
        });
    }
    
    // Bonus rounds toggle
    const bonusRoundsToggle = document.getElementById('bonus-rounds-toggle');
    if (bonusRoundsToggle) {
        // Set initial value
        bonusRoundsToggle.checked = bonusRound.isEnabled();
        
        // Add change event listener
        bonusRoundsToggle.addEventListener('change', () => {
            bonusRound.setEnabled(bonusRoundsToggle.checked);
            sound.play('click');
        });
    }
    
    // FPS toggle
    const fpsToggle = document.getElementById('fps-toggle');
    if (fpsToggle) {
        // Add change event listener
        fpsToggle.addEventListener('change', () => {
            performance.toggle();
            sound.play('click');
        });
    }
    
    // High contrast toggle
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
        // Set initial value
        highContrastToggle.checked = accessibility.isHighContrast();
        
        // Add change event listener
        highContrastToggle.addEventListener('change', () => {
            accessibility.toggleHighContrast();
            sound.play('click');
        });
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
        // Set initial value
        reducedMotionToggle.checked = accessibility.isReducedMotion();
        
        // Add change event listener
        reducedMotionToggle.addEventListener('change', () => {
            accessibility.toggleReducedMotion();
            sound.play('click');
        });
    }
    
    // Reset stats button
    const resetStatsBtn = document.getElementById('reset-stats-settings-btn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your statistics?')) {
                stats.resetStats();
                sound.play('click');
            }
        });
    }
    
    // Reset achievements button
    const resetAchievementsBtn = document.getElementById('reset-achievements-btn');
    if (resetAchievementsBtn) {
        resetAchievementsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your achievements?')) {
                achievements.resetAchievements();
                secretMove.resetUnlock();
                sound.play('click');
            }
        });
    }
    
    // Delete all data button
    const deleteAllDataBtn = document.getElementById('delete-all-data-btn');
    if (deleteAllDataBtn) {
        deleteAllDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL game data? This cannot be undone.')) {
                clearAllData();
                avatar.resetProfile();
                achievements.resetAchievements();
                stats.resetStats();
                secretMove.resetUnlock();
                theme.setTheme('day');
                sound.setSoundEnabled(true);
                sound.play('click');
                
                // Show confirmation
                alert('All data has been deleted. The game will now reload.');
                window.location.reload();
            }
        });
    }
}

/**
 * Update the game info banner based on current settings
 */
export function updateGameBanner() {
    const banner = document.getElementById('game-info-banner');
    const bannerText = document.getElementById('game-info-text');
    const bannerIcon = document.querySelector('.game-info-banner-icon');
    
    if (!banner || !bannerText || !bannerIcon) return;
    
    // Check if speed mode is enabled
    if (speedMode.isEnabled()) {
        banner.classList.remove('hidden');
        banner.classList.add('speed-mode');
        bannerText.textContent = 'Speed Mode Active';
        bannerIcon.textContent = '⚡';
    } else {
        banner.classList.add('hidden');
    }
}

/**
 * Update the AI mode description based on the selected mode
 * @param {string} mode - The selected AI mode
 */
function updateAiModeDescription(mode) {
    const descriptionContainer = document.getElementById('ai-mode-description');
    let title = '';
    let description = '';
    
    switch (mode) {
        case 'cheeky':
            title = "Cheeky Mode";
            description = "This AI sometimes copies your last move (40% chance).";
            break;
        case 'predictive':
            title = "Predictive Mode";
            description = "This AI analyzes your moves and tries to counter your most used choices.";
            break;
        case 'random':
        default:
            title = "Random Mode";
            description = "AI picks a move randomly each turn.";
            break;
    }
    
    if (descriptionContainer) {
        descriptionContainer.innerHTML = `
            <h4>${title}</h4>
            <p>${description}</p>
        `;
    }
}

/**
 * Switch between settings tabs
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-hidden', 'false');
    }
    
    // Update tab button states
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
        }
    });
}

/**
 * Show the settings screen
 */
export function showSettings() {
    // Hide all sections
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('stats-screen').classList.add('hidden');
    
    // Show settings screen
    const settingsScreen = document.getElementById('settings-screen');
    settingsScreen.classList.remove('hidden');
    
    // Default to the profile tab
    switchTab('profile');
    
    // Play sound
    sound.play('click');
}

/**
 * Hide the settings screen and return to the landing page
 */
function hideSettings() {
    // Hide settings screen
    document.getElementById('settings-screen').classList.add('hidden');
    
    // Show landing page
    document.getElementById('landing-page').classList.remove('hidden');
    
    // Play sound
    sound.play('click');
}

export default {
    init,
    showSettings,
    updateGameBanner
}; 