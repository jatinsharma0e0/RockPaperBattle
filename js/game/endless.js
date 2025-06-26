/**
 * Endless Mode module for Rock Paper Battle
 * Handles the endless gameplay mode against AI
 */

import { determineWinner, getRandomMove, getResultMessage } from './logic.js';
import * as ui from '../ui.js';
import { getData, updateStat } from '../settings/storage.js';

// Game state for Endless Mode
const gameState = {
    playerScore: 0,
    aiScore: 0,
    currentRound: 0,
    lastPlayerMove: null,
    lastAiMove: null,
    lastResult: null
};

/**
 * Initializes the Endless Mode game
 */
export function initEndlessMode() {
    // Reset game state
    resetGameState();
    
    // Load previous scores from localStorage if available
    const stats = getData('stats');
    if (stats) {
        ui.updateScore(stats.wins, stats.losses);
    } else {
        ui.updateScore(0, 0);
    }
    
    // Show the game screen
    ui.showSection('game-screen');
}

/**
 * Resets the game state for a new game
 */
function resetGameState() {
    gameState.currentRound = 0;
    gameState.lastPlayerMove = null;
    gameState.lastAiMove = null;
    gameState.lastResult = null;
    
    // Reset the move displays
    ui.displayMoves('', '');
}

/**
 * Handles player move selection
 * @param {string} playerMove - The player's selected move
 */
export function handlePlayerMove(playerMove) {
    // Generate AI move
    const aiMove = getRandomMove();
    
    // Determine the winner
    const result = determineWinner(playerMove, aiMove);
    
    // Update game state
    gameState.lastPlayerMove = playerMove;
    gameState.lastAiMove = aiMove;
    gameState.lastResult = result;
    gameState.currentRound++;
    
    // Display moves
    ui.displayMoves(playerMove, aiMove);
    
    // Update scores and localStorage
    updateScores(result);
    
    // Get result message
    const resultMessage = getResultMessage(result, playerMove, aiMove);
    
    // Show result after a short delay
    setTimeout(() => {
        ui.showResult(result, resultMessage, playerMove, aiMove);
    }, 1000);
}

/**
 * Updates scores based on the round result
 * @param {string} result - The result of the round ('win', 'lose', or 'draw')
 */
function updateScores(result) {
    // Update localStorage stats
    updateStat(result === 'win' ? 'wins' : result === 'lose' ? 'losses' : 'draws');
    
    // Get updated stats
    const stats = getData('stats');
    
    // Update UI
    ui.updateScore(stats.wins, stats.losses);
}

/**
 * Returns to the main menu
 */
export function returnToMenu() {
    ui.showSection('landing-page');
}

/**
 * Continues the game after showing results
 */
export function continueGame() {
    ui.showSection('game-screen');
}

export default {
    initEndlessMode,
    handlePlayerMove,
    returnToMenu,
    continueGame
}; 