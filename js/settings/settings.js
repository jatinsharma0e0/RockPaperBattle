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
        console.log('Sound toggle initialized:', soundToggle.checked);
        
        // Add change event listener
        soundToggle.addEventListener('change', () => {
            console.log('Sound toggle changed to:', soundToggle.checked);
            sound.setSoundEnabled(soundToggle.checked);
            if (soundToggle.checked) {
                sound.play('click');
            }
        });
        
        // Add click event listener as a fallback
        soundToggle.parentElement.addEventListener('click', (e) => {
            if (e.target !== soundToggle) {
                soundToggle.checked = !soundToggle.checked;
                console.log('Sound toggle clicked (parent):', soundToggle.checked);
                sound.setSoundEnabled(soundToggle.checked);
                if (soundToggle.checked) {
                    sound.play('click');
                }
            }
        });
    }
    
    // Sound volume slider
    const soundVolumeSlider = document.getElementById('sound-volume');
    if (soundVolumeSlider) {
        // Set initial value
        soundVolumeSlider.value = sound.getVolume() * 100;
        
        // Add input event listener for real-time updates
        soundVolumeSlider.addEventListener('input', () => {
            const newVolume = soundVolumeSlider.value / 100;
            sound.setVolume(newVolume);
            
            // Play a test sound when adjusting to hear the change
            if (sound.isSoundEnabled() && soundVolumeSlider.value > 0) {
                sound.play('tick');
            }
        });
    }
    
    // Ambient sound toggle
    const ambientToggle = document.getElementById('ambient-toggle-setting');
    if (ambientToggle) {
        // Set initial value
        ambientToggle.checked = sound.isAmbientEnabled();
        console.log('Ambient toggle initialized:', ambientToggle.checked);
        
        // Add change event listener
        ambientToggle.addEventListener('change', () => {
            console.log('Ambient toggle changed to:', ambientToggle.checked);
            sound.setAmbientEnabled(ambientToggle.checked);
            
            // Start or stop ambient sound based on toggle state
            if (ambientToggle.checked) {
                sound.playAmbient();
                sound.play('click');
            } else {
                sound.stopAmbient();
                sound.play('click');
            }
        });
        
        // Add click event listener as a fallback
        ambientToggle.parentElement.addEventListener('click', (e) => {
            if (e.target !== ambientToggle) {
                ambientToggle.checked = !ambientToggle.checked;
                console.log('Ambient toggle clicked (parent):', ambientToggle.checked);
                sound.setAmbientEnabled(ambientToggle.checked);
                
                if (ambientToggle.checked) {
                    sound.playAmbient();
                    sound.play('click');
                } else {
                    sound.stopAmbient();
                    sound.play('click');
                }
            }
        });
    }
    
    // Ambient volume slider
    const ambientVolumeSlider = document.getElementById('ambient-volume');
    if (ambientVolumeSlider) {
        // Set initial value
        ambientVolumeSlider.value = sound.getAmbientVolume() * 100;
        
        // Add input event listener for real-time updates
        ambientVolumeSlider.addEventListener('input', () => {
            const newVolume = ambientVolumeSlider.value / 100;
            sound.setAmbientVolume(newVolume);
            
            // If ambient is playing, the volume change will be applied immediately
            // by the setAmbientVolume function
            
            // Play a sound to acknowledge the change
            if (sound.isSoundEnabled() && ambientVolumeSlider.value > 0) {
                sound.play('tick');
            }
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
                sound.play('click');
            }
        });
        
        soundStyleModern.addEventListener('change', () => {
            if (soundStyleModern.checked) {
                sound.setAudioStyle('modern');
                sound.play('click');
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
    
    // AI difficulty selector
    const aiDifficultySelect = document.getElementById('ai-difficulty-select');
    if (aiDifficultySelect) {
        // Set initial value
        aiDifficultySelect.value = aiModes.getCurrentDifficulty();
        
        // Update description based on current selection
        updateAiDifficultyDescription(aiDifficultySelect.value);
        
        // Add change event listener
        aiDifficultySelect.addEventListener('change', () => {
            const selectedDifficulty = aiDifficultySelect.value;
            aiModes.setDifficulty(selectedDifficulty);
            updateAiDifficultyDescription(selectedDifficulty);
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
        
        // We don't need to add event handlers here since they're already set up in accessibility.js
        // This prevents duplicate event handlers that cause double toggling
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
        // Set initial value
        reducedMotionToggle.checked = accessibility.isReducedMotion();
        
        // We don't need to add event handlers here since they're already set up in accessibility.js
        // This prevents duplicate event handlers that cause double toggling
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
 * Update the AI difficulty description based on the selected difficulty
 * @param {string} difficulty - The selected AI difficulty
 */
function updateAiDifficultyDescription(difficulty) {
    const descriptionContainer = document.getElementById('ai-difficulty-description');
    let title = '';
    let description = '';
    
    switch (difficulty) {
        case 'easy':
            title = "Noobron";
            description = "Chill, always makes mistakes. Great for beginners or casual play.";
            break;
        case 'medium':
            title = "Median Mind";
            description = "Keeps things fair. A balanced challenge for most players.";
            break;
        case 'hard':
            title = "Mindbreaker";
            description = "Forces you to think harder. A serious challenge for experienced players!";
            break;
        case 'impossible':
            title = "Impossible";
            description = "Impossible to Beat. Only for those seeking the ultimate challenge!";
            break;
        default:
            title = "Median Mind";
            description = "Keeps things fair. A balanced challenge for most players.";
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
    updateAiDifficultyDescription
}; 