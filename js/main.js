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
import * as theme from './features/theme.js';
import * as avatar from './features/avatar.js';
import * as secretMove from './features/secretMove.js';
import * as aiModes from './features/aiModes.js';
import * as idle from './features/idle.js';
import * as speedMode from './features/speedMode.js';
import * as bonusRound from './features/bonusRound.js';
import * as settings from './settings/settings.js';
import { getData, setData } from './settings/storage.js';

// Current game mode
let currentGameMode = null;

/**
 * Initializes the game
 */
function init() {
    // Show the landing page by default
    ui.showSection('landing-page');
    
    // Initialize features
    sound.init();
    theme.init();
    avatar.init();
    achievements.init();
    stats.init();
    secretMove.init();
    aiModes.init();
    idle.init();
    speedMode.init();
    bonusRound.init();
    settings.init();
    
    // Set up event handlers
    setupEventHandlers();
    
    // Initialize data if needed
    initializeData();
    
    // Check if this is the first time running the game
    checkFirstRun();
    
    // Set up visual effects
    setupVisualEffects();
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
            
            // Update game info banner
            settings.updateGameBanner();
        },
        
        // Navigation
        backToMenu: () => {
            if (currentGameMode === 'endless') {
                endless.returnToMenu();
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.returnToMenu();
            }
            
            // End any active bonus round
            bonusRound.endBonusRound();
            
            // Stop speed timer if active
            speedMode.stopTimer();
        },
        
        // Play again
        playAgain: () => {
            if (currentGameMode === 'endless') {
                endless.continueGame();
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.continueGame();
            }
            
            // End any active bonus round
            bonusRound.endBonusRound();
        },
        
        // Move selection
        makeMove: (move) => {
            // Stop speed timer if active
            speedMode.stopTimer();
            
            if (currentGameMode === 'endless') {
                endless.handlePlayerMove(move);
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.handlePlayerMove(move);
            }
            
            // Reset idle timer on move
            idle.resetIdleTimer();
        }
    });
    
    // Best of 5 mode button
    const bestOf5Btn = document.getElementById('best-of-5-btn');
    if (bestOf5Btn) {
        bestOf5Btn.addEventListener('click', () => {
            currentGameMode = 'bestOf5';
            bestOf5.initBestOf5Mode();
            sound.play('click');
            stats.updateBestMode('Best of 5');
            
            // Speed mode is disabled for Best of 5
            const banner = document.getElementById('game-info-banner');
            if (banner) {
                banner.classList.add('hidden');
            }
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
            
            // End any active bonus round
            bonusRound.endBonusRound();
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
                secretMove.resetUnlock();
                renderAchievements();
                sound.play('click');
            }
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', settings.showSettings);
    }
    
    // Fire move button (secret move)
    const fireMoveBtn = document.getElementById('fire-move-btn');
    if (fireMoveBtn) {
        fireMoveBtn.addEventListener('click', () => {
            // Stop speed timer if active
            speedMode.stopTimer();
            
            const move = fireMoveBtn.getAttribute('data-move');
            if (currentGameMode === 'endless') {
                endless.handlePlayerMove(move);
            } else if (currentGameMode === 'bestOf5') {
                bestOf5.handlePlayerMove(move);
            }
            
            // Reset idle timer on move
            idle.resetIdleTimer();
        });
    }
    
    // Add event listeners to reset idle timer
    document.addEventListener('click', idle.resetIdleTimer);
    document.addEventListener('mousemove', idle.resetIdleTimer);
    document.addEventListener('keydown', idle.resetIdleTimer);
}

/**
 * Set up visual effects for win/loss/draw animations
 */
function setupVisualEffects() {
    // Create a global function to show win animation with confetti
    window.showWinAnimation = function() {
        // Create confetti pieces
        const confettiContainer = document.querySelector('.confetti-container');
        if (!confettiContainer) return;
        
        // Clear any existing confetti
        confettiContainer.innerHTML = '';
        
        // Colors for confetti
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 50}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Add random rotation and movement
            confetti.style.setProperty('--confetti-dx', `${(Math.random() - 0.5) * 300}px`);
            confetti.style.setProperty('--confetti-rotate', `${Math.random() * 360}deg`);
            
            // Add to container
            confettiContainer.appendChild(confetti);
        }
        
        // Clean up confetti after animation completes
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 2000);
    };
    
    // Function to show loss animation (shake)
    window.showLossAnimation = function(element) {
        if (!element) return;
        
        // Add shake effect class
        element.classList.add('shake-effect');
        
        // Remove class after animation completes
        setTimeout(() => {
            element.classList.remove('shake-effect');
        }, 500);
    };
    
    // Function to show draw animation (glow)
    window.showDrawAnimation = function(element) {
        if (!element) return;
        
        // Add draw effect class
        element.classList.add('draw-effect');
        
        // Remove class after animation completes
        setTimeout(() => {
            element.classList.remove('draw-effect');
        }, 1000);
    };
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
 * Initializes game data if it doesn't exist
 */
function initializeData() {
    // This will initialize default data if none exists
    getData();
}

/**
 * Checks if this is the first time running the game
 */
function checkFirstRun() {
    const hasRunBefore = getData('hasRunBefore');
    
    if (!hasRunBefore) {
        // Mark as having run before
        setData('hasRunBefore', true);
        
        // Show settings to set up profile on first run
        setTimeout(() => {
            settings.showSettings();
        }, 1000);
    }
}

/**
 * Cleanup function when the page is unloading
 */
function cleanup() {
    // Clean up idle detection
    idle.cleanup();
    
    // Stop speed timer if active
    speedMode.stopTimer();
    
    // End any active bonus round
    bonusRound.endBonusRound();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init); 

// Clean up when the page is unloaded
window.addEventListener('beforeunload', cleanup); 