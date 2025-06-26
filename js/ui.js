/**
 * UI module for Rock Paper Battle
 * Handles DOM interactions and rendering
 */

import { getMoveEmoji } from './game/logic.js';

// DOM element selectors
const elements = {
    // Sections
    landingPage: document.getElementById('landing-page'),
    gameScreen: document.getElementById('game-screen'),
    resultsScreen: document.getElementById('results-screen'),
    
    // Buttons
    endlessModeBtn: document.getElementById('endless-mode-btn'),
    bestOf5Btn: document.getElementById('best-of-5-btn'),
    backToMenuBtn: document.getElementById('back-to-menu'),
    backToMenuResultBtn: document.getElementById('back-to-menu-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    moveButtons: document.querySelectorAll('.move-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    resetScoresBtn: document.getElementById('reset-scores'),
    soundToggleBtn: document.getElementById('sound-toggle'),
    
    // Game elements
    playerScore: document.getElementById('player-score'),
    aiScore: document.getElementById('ai-score'),
    playerMoveDisplay: document.getElementById('player-move-display'),
    aiMoveDisplay: document.getElementById('ai-move-display'),
    
    // Result elements
    resultTitle: document.getElementById('result-title'),
    resultMessage: document.getElementById('result-message'),
    playerMoveResult: document.getElementById('player-move'),
    aiMoveResult: document.getElementById('ai-move')
};

/**
 * Shows a specific section and hides others
 * @param {string} sectionId - The ID of the section to show ('landing-page', 'game-screen', or 'results-screen')
 */
export function showSection(sectionId) {
    // Hide all sections
    elements.landingPage.classList.add('hidden');
    elements.gameScreen.classList.add('hidden');
    elements.resultsScreen.classList.add('hidden');
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    } else {
        console.error('Invalid section ID:', sectionId);
    }
}

/**
 * Updates the score display
 * @param {number} playerScore - Player's score
 * @param {number} aiScore - AI's score
 */
export function updateScore(playerScore, aiScore) {
    elements.playerScore.textContent = playerScore;
    elements.aiScore.textContent = aiScore;
}

/**
 * Displays the player and AI moves
 * @param {string} playerMove - Player's move
 * @param {string} aiMove - AI's move
 */
export function displayMoves(playerMove, aiMove) {
    elements.playerMoveDisplay.textContent = getMoveEmoji(playerMove);
    elements.aiMoveDisplay.textContent = getMoveEmoji(aiMove);
}

/**
 * Shows the result of a round
 * @param {string} result - The result ('win', 'lose', or 'draw')
 * @param {string} message - The result message
 * @param {string} playerMove - Player's move
 * @param {string} aiMove - AI's move
 */
export function showResult(result, message, playerMove, aiMove) {
    // Set result title based on outcome
    let title;
    let messageClass;
    
    switch (result) {
        case 'win':
            title = 'You Win!';
            messageClass = 'win';
            break;
        case 'lose':
            title = 'You Lose!';
            messageClass = 'lose';
            break;
        case 'draw':
            title = "It's a Draw!";
            messageClass = 'draw';
            break;
        default:
            title = 'Game Result';
            messageClass = '';
    }
    
    // Update elements
    elements.resultTitle.textContent = title;
    elements.resultMessage.textContent = message;
    elements.resultMessage.className = `result-message ${messageClass}`;
    elements.playerMoveResult.textContent = getMoveEmoji(playerMove);
    elements.aiMoveResult.textContent = getMoveEmoji(aiMove);
    
    // Show the results screen
    showSection('results-screen');
}

/**
 * Adds event listeners to UI elements
 * @param {Object} handlers - Object containing event handler functions
 */
export function setupEventListeners(handlers) {
    // Game mode selection
    if (handlers.startEndlessMode && elements.endlessModeBtn) {
        elements.endlessModeBtn.addEventListener('click', handlers.startEndlessMode);
    }
    
    // Navigation
    if (handlers.backToMenu) {
        if (elements.backToMenuBtn) {
            elements.backToMenuBtn.addEventListener('click', handlers.backToMenu);
        }
        if (elements.backToMenuResultBtn) {
            elements.backToMenuResultBtn.addEventListener('click', handlers.backToMenu);
        }
    }
    
    // Play again
    if (handlers.playAgain && elements.playAgainBtn) {
        elements.playAgainBtn.addEventListener('click', handlers.playAgain);
    }
    
    // Move selection
    if (handlers.makeMove && elements.moveButtons) {
        elements.moveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const move = button.getAttribute('data-move');
                handlers.makeMove(move);
            });
        });
    }
    
    // Theme toggle
    if (handlers.toggleTheme && elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', handlers.toggleTheme);
    }
    
    // Reset scores
    if (handlers.resetScores && elements.resetScoresBtn) {
        elements.resetScoresBtn.addEventListener('click', handlers.resetScores);
    }
}

export default {
    elements,
    showSection,
    updateScore,
    displayMoves,
    showResult,
    setupEventListeners
}; 