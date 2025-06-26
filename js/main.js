/**
 * Main entry point for Rock Paper Battle
 * Initializes the game and handles section switching
 */

import * as ui from './ui.js';
import * as endless from './game/endless.js';
import * as bestOf5 from './game/bestOf5.js';
import * as sound from './features/sound.js';
import * as achievements from './features/achievements.js';
import * as stats from './features/stats.js';
import { getData, setData } from './settings/storage.js';

// Current game mode
let currentGameMode = null;

/**
 * Initializes the game
 */
function init() {
    // Show the landing page by default
    ui.showSection('landing-page');
    
    // Initialize theme
    initTheme();
    
    // Initialize sound
    sound.init();
    
    // Initialize achievements
    achievements.init();
    
    // Initialize stats
    stats.init();
    
    // Set up event handlers
    setupEventHandlers();
    
    // Initialize data if needed
    initializeData();
}

/**
 * Sets up event handlers for UI elements
 */
function setupEventHandlers() {
    // Set up UI event listeners
    ui.setupEventListeners({
        // Game mode selection
        startEndlessMode: () => {
            currentGameMode = 'endless';
            endless.initEndlessMode();
            sound.play('click');
            stats.updateBestMode('Endless');
        },
        
        // Navigation
        backToMenu: () => {
            if (currentGameMode === 'endless') {
                endless.returnToMenu();
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.returnToMenu();
            }
        },
        
        // Play again
        playAgain: () => {
            if (currentGameMode === 'endless') {
                endless.continueGame();
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.continueGame();
            }
        },
        
        // Move selection
        makeMove: (move) => {
            if (currentGameMode === 'endless') {
                endless.handlePlayerMove(move);
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.handlePlayerMove(move);
            }
        },
        
        // Theme toggle
        toggleTheme: toggleTheme
    });
    
    // Best of 5 mode button
    const bestOf5Btn = document.getElementById('best-of-5-btn');
    if (bestOf5Btn) {
        bestOf5Btn.addEventListener('click', () => {
            currentGameMode = 'bestOf5';
            bestOf5.initBestOf5Mode();
            sound.play('click');
            stats.updateBestMode('Best of 5');
        });
    }
    
    // Reset scores button
    const resetScoresBtn = document.getElementById('reset-scores');
    if (resetScoresBtn) {
        resetScoresBtn.addEventListener('click', () => {
            if (currentGameMode === 'endless') {
                endless.resetScores();
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.resetScores();
            }
        });
    }
    
    // Sound toggle button
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', sound.toggleSound);
    }
    
    // Stats button
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            renderAchievements();
            stats.showStats();
        });
    }
    
    // Back from stats button
    const backFromStatsBtn = document.getElementById('back-from-stats');
    if (backFromStatsBtn) {
        backFromStatsBtn.addEventListener('click', stats.hideStats);
    }
    
    // Reset stats button
    const resetStatsBtn = document.getElementById('reset-stats-btn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all stats and achievements?')) {
                stats.resetStats();
                achievements.resetAchievements();
                renderAchievements();
                sound.play('click');
            }
        });
    }
}

/**
 * Renders the achievements list in the stats screen
 */
function renderAchievements() {
    const achievementsContainer = document.getElementById('achievements-list');
    if (!achievementsContainer) return;
    
    // Get all achievements with unlock status
    const allAchievements = achievements.getAllAchievements();
    
    // Clear the container
    achievementsContainer.innerHTML = '';
    
    // Add each achievement
    allAchievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        achievementItem.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
        `;
        
        achievementsContainer.appendChild(achievementItem);
    });
}

/**
 * Initializes the theme based on localStorage
 */
function initTheme() {
    const theme = getData('theme') || 'day';
    document.body.setAttribute('data-theme', theme);
}

/**
 * Toggles between day and night themes
 */
function toggleTheme() {
    const currentTheme = getData('theme') || 'day';
    const newTheme = currentTheme === 'day' ? 'night' : 'day';
    
    // Update localStorage
    setData('theme', newTheme);
    
    // Update body attribute
    document.body.setAttribute('data-theme', newTheme);
    
    // Play sound
    sound.play('click');
}

/**
 * Initializes game data if it doesn't exist
 */
function initializeData() {
    // This will initialize default data if none exists
    getData();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init); 