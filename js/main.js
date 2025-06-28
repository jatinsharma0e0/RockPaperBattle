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
import * as accessibility from './features/accessibility.js';
import { getData, setData } from './settings/storage.js';
import * as preloader from './utils/preloader.js';
import * as dataManager from './utils/dataManager.js';
import * as performance from './utils/performance.js';

// Current game mode
let currentGameMode = null;

/**
 * Initializes the game
 */
function init() {
    // Start the preloader
    startPreloader();
}

/**
 * Start the asset preloader
 */
function startPreloader() {
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    
    // Start preloading assets
    preloader.preloadAssets(
        // Progress callback
        (progress) => {
            if (loadingBar) {
                loadingBar.style.width = `${progress}%`;
            }
            if (loadingText) {
                loadingText.textContent = `Loading game assets: ${progress}%`;
            }
        },
        // Completion callback
        () => {
            if (loadingText) {
                loadingText.textContent = 'Ready to play!';
            }
            // Small delay before hiding the loading screen
            setTimeout(initializeGame, 500);
        }
    );
}

/**
 * Initialize the game after assets are loaded
 */
function initializeGame() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
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
    accessibility.init();
    
    // Initialize performance monitor (disabled by default)
    performance.init(false);
    
    // Set up event handlers
    setupEventHandlers();
    
    // Initialize data if needed
    initializeData();
    
    // Check if this is the first time running the game
    checkFirstRun();
    
    // Set up visual effects
    setupVisualEffects();
    
    // Add keyboard controls
    setupKeyboardNavigation();
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
            // Set the game mode in speedMode
            speedMode.setGameMode('endless');
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
            
            // End any active bonus round
            bonusRound.endBonusRound();
            
            // Stop speed timer if active
            speedMode.stopTimer();
            
            // Reset game mode
            currentGameMode = null;
            speedMode.setGameMode(null);
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
            // Set the game mode in speedMode
            speedMode.setGameMode('bestOf5');
            bestOf5.initBestOf5Mode();
            sound.play('click');
            stats.updateBestMode('Best of 5');
            
            // Explicitly hide the speed mode banner
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
    
    // FPS Monitor toggle
    const fpsToggle = document.getElementById('fps-toggle');
    if (fpsToggle) {
        fpsToggle.addEventListener('change', () => {
            performance.toggle();
            sound.play('click');
        });
    }
    
    // Data export button
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            dataManager.exportGameData();
            sound.play('click');
        });
    }
    
    // Data import input
    const importDataFile = document.getElementById('import-data-file');
    if (importDataFile) {
        importDataFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                dataManager.importGameData(file)
                    .then((result) => {
                        alert(`Import successful! Imported ${result.stats.totalItems} items including ${result.stats.achievements} achievements.`);
                        // Reload the page to apply changes
                        window.location.reload();
                    })
                    .catch((error) => {
                        alert(`Import failed: ${error.message}`);
                    });
            }
        });
    }
    
    // Add event listeners to reset idle timer
    document.addEventListener('click', idle.resetIdleTimer);
    document.addEventListener('mousemove', idle.resetIdleTimer);
    document.addEventListener('keydown', idle.resetIdleTimer);
}

/**
 * Set up keyboard navigation for accessibility
 */
function setupKeyboardNavigation() {
    // Handle keyboard navigation for move buttons
    document.addEventListener('keydown', (event) => {
        // Only handle keyboard navigation when game screen is active
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && !gameScreen.classList.contains('hidden')) {
            // Enter or Space to select focused move
            if ((event.key === 'Enter' || event.key === ' ') && document.activeElement.classList.contains('move-btn')) {
                event.preventDefault();
                const move = document.activeElement.getAttribute('data-move');
                if (move) {
                    // Stop speed timer if active
                    speedMode.stopTimer();
                    
                    // Make the move
                    if (currentGameMode === 'endless') {
                        endless.handlePlayerMove(move);
                    } else if (currentGameMode === 'bestOf5') {
                        bestOf5.handlePlayerMove(move);
                    }
                    
                    // Reset idle timer on move
                    idle.resetIdleTimer();
                }
            }
        }
        
        // Handle tab navigation for avatar and theme selectors
        if (event.key === 'Enter' || event.key === ' ') {
            if (document.activeElement.classList.contains('avatar-option')) {
                event.preventDefault();
                const avatarValue = document.activeElement.getAttribute('data-avatar');
                if (avatarValue) {
                    // Select this avatar
                    avatar.selectAvatar(avatarValue);
                }
            }
            
            if (document.activeElement.classList.contains('theme-option')) {
                event.preventDefault();
                const themeValue = document.activeElement.getAttribute('data-theme');
                if (themeValue) {
                    // Select this theme
                    theme.setTheme(themeValue);
                }
            }
        }
    });
}

/**
 * Set up visual effects for win/loss/draw animations
 */
function setupVisualEffects() {
    // Create a global function to show win animation with confetti
    window.showWinAnimation = function() {
        // Skip if reduced motion is enabled
        if (accessibility.isReducedMotion()) return;
        
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
        if (!element || accessibility.isReducedMotion()) return;
        
        // Add shake effect class
        element.classList.add('shake-effect');
        
        // Remove class after animation completes
        setTimeout(() => {
            element.classList.remove('shake-effect');
        }, 500);
    };
    
    // Function to show draw animation (glow)
    window.showDrawAnimation = function(element) {
        if (!element || accessibility.isReducedMotion()) return;
        
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
        achievementItem.setAttribute('role', 'listitem');
        
        const unlockStatus = achievement.unlocked ? 'Unlocked' : 'Locked';
        achievementItem.setAttribute('aria-label', `${achievement.name} - ${unlockStatus} - ${achievement.description}`);
        
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
 * Performs cleanup before page unload
 */
function cleanup() {
    // Clean up speed mode resources
    speedMode.cleanup();
    
    // Stop any sounds
    sound.stopAmbient();
}

// Initialize the game when DOM is loaded
window.addEventListener('DOMContentLoaded', init);

// Add cleanup event
window.addEventListener('beforeunload', cleanup);

// Initialize immediately if document is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
} 