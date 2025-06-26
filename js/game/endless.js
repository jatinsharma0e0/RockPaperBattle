/**
 * Endless Mode module for Rock Paper Battle
 * Handles the endless gameplay mode against AI
 */

import { determineWinner, getRandomMove, getResultMessage } from './logic.js';
import * as ui from '../ui.js';
import { getData, setData, updateStat } from '../settings/storage.js';
import * as sound from '../features/sound.js';
import * as achievements from '../features/achievements.js';
import * as stats from '../features/stats.js';
import * as secretMove from '../features/secretMove.js';

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
    
    // Update UI to show Endless mode
    document.querySelector('#game-screen h2').textContent = 'Endless Mode';
    
    // Load previous scores from localStorage if available
    const storedStats = getData('stats');
    if (storedStats) {
        ui.updateScore(storedStats.wins, storedStats.losses);
    } else {
        ui.updateScore(0, 0);
    }
    
    // Show the game screen
    ui.showSection('game-screen');
    
    // Play start sound
    sound.play('gameStart');
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
    // Generate AI move - include fire move if player has unlocked it
    const includeFireMove = secretMove.isUnlocked();
    const aiMove = getRandomMove(includeFireMove);
    
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
    
    // Play appropriate sound
    if (result === 'win') {
        sound.play('win');
    } else if (result === 'lose') {
        sound.play('lose');
    } else {
        sound.play('draw');
    }
    
    // Check achievements
    achievements.checkAchievements(result, gameState, 'endless');
    
    // Check if secret move should be unlocked
    if (!secretMove.isUnlocked()) {
        secretMove.init();
    }
    
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
    const storedStats = getData('stats');
    
    // Update UI
    ui.updateScore(storedStats.wins, storedStats.losses);
    
    // Update win streak tracking
    if (result === 'win') {
        // Get current win streak
        const currentWinStreak = getData('currentWinStreak') || 0;
        
        // Update longest win streak if needed
        stats.updateLongestWinStreak(currentWinStreak);
    }
}

/**
 * Returns to the main menu
 */
export function returnToMenu() {
    sound.play('click');
    ui.showSection('landing-page');
}

/**
 * Continues the game after showing results
 */
export function continueGame() {
    sound.play('click');
    ui.showSection('game-screen');
}

/**
 * Resets the current game scores
 */
export function resetScores() {
    // Reset wins and losses in localStorage
    const data = getData();
    data.stats.wins = 0;
    data.stats.losses = 0;
    data.stats.draws = 0;
    setData('stats', data.stats);
    
    // Update UI
    ui.updateScore(0, 0);
    
    // Reset game state
    resetGameState();
    
    // Reset current win streak
    setData('currentWinStreak', 0);
    
    // Play sound
    sound.play('click');
}

export default {
    initEndlessMode,
    handlePlayerMove,
    returnToMenu,
    continueGame,
    resetScores
}; 