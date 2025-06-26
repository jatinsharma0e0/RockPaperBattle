/**
 * Main entry point for Rock Paper Battle
 * Initializes the game and handles section switching
 */

import * as ui from './ui.js';
import * as endless from './game/endless.js';
import { getData, setData } from './settings/storage.js';

/**
 * Initializes the game
 */
function init() {
    // Show the landing page by default
    ui.showSection('landing-page');
    
    // Initialize theme
    initTheme();
    
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
        startEndlessMode: () => endless.initEndlessMode(),
        
        // Navigation
        backToMenu: () => endless.returnToMenu(),
        
        // Play again
        playAgain: () => endless.continueGame(),
        
        // Move selection
        makeMove: (move) => endless.handlePlayerMove(move),
        
        // Theme toggle
        toggleTheme: toggleTheme
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