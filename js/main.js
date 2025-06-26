/**
 * Main entry point for Rock Paper Battle
 * Initializes the game and handles section switching
 */

import * as ui from './ui.js';
import * as endless from './game/endless.js';
import * as bestOf5 from './game/bestOf5.js';
import * as sound from './features/sound.js';
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