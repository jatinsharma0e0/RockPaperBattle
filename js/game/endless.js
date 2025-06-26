/**
 * Endless Mode module for Rock Paper Battle
 * Handles the endless gameplay mode against AI
 */

import { determineWinner, getMoveEmoji, getResultMessage } from './logic.js';
import * as ui from '../ui.js';
import { getData, setData, updateStat } from '../settings/storage.js';
import * as sound from '../features/sound.js';
import * as achievements from '../features/achievements.js';
import * as stats from '../features/stats.js';
import * as secretMove from '../features/secretMove.js';
import * as aiModes from '../features/aiModes.js';

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
    
    // Update AI mode indicator
    updateAiModeIndicator();
    
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
 * Update the AI mode indicator in the UI
 */
function updateAiModeIndicator() {
    const aiModeIndicator = document.getElementById('ai-mode-indicator');
    if (aiModeIndicator) {
        // Clear existing classes
        aiModeIndicator.className = 'ai-mode-indicator';
        
        // Set emoji based on current AI mode
        aiModeIndicator.textContent = aiModes.getCurrentModeEmoji();
        
        // Add animation class based on AI mode
        const currentMode = aiModes.getCurrentMode();
        if (currentMode === 'random') {
            aiModeIndicator.classList.add('ai-random-indicator');
        } else if (currentMode === 'cheeky') {
            aiModeIndicator.classList.add('ai-cheeky-indicator');
        } else if (currentMode === 'predictive') {
            aiModeIndicator.classList.add('ai-predictive-indicator');
        }
        
        // Set tooltip
        aiModeIndicator.title = `${aiModes.getCurrentModeDisplayName()} AI Mode`;
    }
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
    
    // Reset AI move history
    aiModes.resetMoveHistory();
}

/**
 * Handles player move selection
 * @param {string} playerMove - The player's selected move
 */
export function handlePlayerMove(playerMove) {
    // Record the player's move for AI analysis
    aiModes.recordPlayerMove(playerMove);
    
    // Generate AI move - include fire move if player has unlocked it
    const includeFireMove = secretMove.isUnlocked();
    const availableMoves = includeFireMove ? ['rock', 'paper', 'scissors', 'fire'] : ['rock', 'paper', 'scissors'];
    
    // Get AI move based on current AI mode
    const aiMove = aiModes.getComputerMove(availableMoves);
    
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
    
    // Update best AI mode stats
    updateBestAiMode(result);
}

/**
 * Updates the best AI mode statistics
 * @param {string} result - The result of the round ('win', 'lose', or 'draw')
 */
function updateBestAiMode(result) {
    if (result !== 'win') return; // Only track wins
    
    const currentMode = aiModes.getCurrentMode();
    const aiStats = getData('aiStats') || {
        random: { wins: 0 },
        cheeky: { wins: 0 },
        predictive: { wins: 0 }
    };
    
    // Increment win count for current mode
    if (!aiStats[currentMode]) {
        aiStats[currentMode] = { wins: 0 };
    }
    aiStats[currentMode].wins = (aiStats[currentMode].wins || 0) + 1;
    
    // Save updated stats
    setData('aiStats', aiStats);
    
    // Update UI in stats screen if needed
    const bestModeElement = document.getElementById('stats-best-ai-mode');
    if (bestModeElement) {
        // Find the mode with the most wins
        let bestMode = 'random';
        let highestWins = 0;
        
        for (const [mode, stats] of Object.entries(aiStats)) {
            if (stats.wins > highestWins) {
                highestWins = stats.wins;
                bestMode = mode;
            }
        }
        
        // Display the best mode with emoji
        let bestModeDisplay = 'Random';
        let bestModeEmoji = '🤖';
        
        switch (bestMode) {
            case 'cheeky':
                bestModeDisplay = 'Cheeky';
                bestModeEmoji = '😏';
                break;
            case 'predictive':
                bestModeDisplay = 'Predictive';
                bestModeEmoji = '🧠';
                break;
            default:
                bestModeDisplay = 'Random';
                bestModeEmoji = '🤖';
                break;
        }
        
        bestModeElement.textContent = `${bestModeEmoji} ${bestModeDisplay}`;
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