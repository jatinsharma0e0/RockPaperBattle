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
        soundToggle.checked = sound.isSoundEnabled();
        soundToggle.addEventListener('change', () => {
            sound.setSoundEnabled(soundToggle.checked);
            if (soundToggle.checked) {
                sound.play('click');
            }
        });
    }
    
    // Volume slider
    const volumeSlider = document.getElementById('sound-volume');
    if (volumeSlider) {
        volumeSlider.value = sound.getVolume() * 100;
        volumeSlider.addEventListener('input', () => {
            sound.setVolume(volumeSlider.value / 100);
        });
    }
    
    // Test sound button
    const testSoundBtn = document.getElementById('test-sound-btn');
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', () => {
            sound.play('win');
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
 * Switch between settings tabs
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update tab button states
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
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
    showSettings
}; 