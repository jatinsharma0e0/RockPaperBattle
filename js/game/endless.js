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
import * as speedMode from '../features/speedMode.js';
import * as bonusRound from '../features/bonusRound.js';

// Game state for Endless Mode
const gameState = {
    playerScore: 0,
    aiScore: 0,
    currentRound: 0,
    lastPlayerMove: null,
    lastAiMove: null,
    lastResult: null,
    bonusRoundActive: false,
    bonusType: null,
    timeoutMove: null
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
    
    // If speed mode is enabled, start the timer
    if (speedMode.isEnabled()) {
        startSpeedModeTimer();
    }
}

/**
 * Starts the speed mode timer
 */
function startSpeedModeTimer() {
    // Only start the timer if speed mode is enabled
    if (!speedMode.isEnabled()) return;
    
    // Start the timer
    speedMode.startTimer(3000, () => {
        // When time is up, make a random move
        const includeFireMove = secretMove.isUnlocked();
        const availableMoves = includeFireMove ? ['rock', 'paper', 'scissors', 'fire'] : ['rock', 'paper', 'scissors'];
        const timeoutMove = speedMode.getTimeoutMove(availableMoves);
        
        // Store the timeout move in game state
        gameState.timeoutMove = timeoutMove;
        
        // Handle the move
        handlePlayerMove(timeoutMove, true);
    });
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
    gameState.bonusRoundActive = false;
    gameState.bonusType = null;
    gameState.timeoutMove = null;
    
    // Reset the move displays
    ui.displayMoves('', '');
    
    // Reset AI move history
    aiModes.resetMoveHistory();
    
    // End any active bonus round
    bonusRound.endBonusRound();
}

/**
 * Handles player move selection
 * @param {string} playerMove - The player's selected move
 * @param {boolean} isTimeoutMove - Whether this is an auto-selected move due to timeout
 */
export function handlePlayerMove(playerMove, isTimeoutMove = false) {
    // Record the player's move for AI analysis
    aiModes.recordPlayerMove(playerMove);
    
    // Check if we should activate a bonus round
    if (!gameState.bonusRoundActive && bonusRound.isEnabled() && bonusRound.shouldActivateBonusRound()) {
        gameState.bonusRoundActive = true;
        gameState.bonusType = bonusRound.activateRandomBonusRound();
    }
    
    // Generate AI move - include fire move if player has unlocked it
    const includeFireMove = secretMove.isUnlocked();
    const availableMoves = includeFireMove ? ['rock', 'paper', 'scissors', 'fire'] : ['rock', 'paper', 'scissors'];
    
    // Get AI move based on current AI mode
    const aiMove = aiModes.getComputerMove(availableMoves);
    
    // Determine the winner (apply bonus round rules if active)
    let result = determineWinner(playerMove, aiMove);
    
    // If this is a bonus round, modify the result according to its rules
    if (gameState.bonusRoundActive) {
        result = bonusRound.modifyResult(result, playerMove, aiMove);
    }
    
    // Update game state
    gameState.lastPlayerMove = playerMove;
    gameState.lastAiMove = aiMove;
    gameState.lastResult = result;
    gameState.currentRound++;
    
    // Display moves
    ui.displayMoves(playerMove, aiMove);
    
    // Update scores and localStorage
    updateScores(result, isTimeoutMove);
    
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
    
    // Apply win/loss/draw animations
    applyResultAnimations(result);
    
    // Show result after a short delay
    setTimeout(() => {
        ui.showResult(result, resultMessage, playerMove, aiMove);
        
        // End the bonus round after the result is shown
        if (gameState.bonusRoundActive) {
            bonusRound.endBonusRound();
            gameState.bonusRoundActive = false;
            gameState.bonusType = null;
        }
    }, 1000);
}

/**
 * Apply win/loss/draw animations to game elements
 * @param {string} result - The result of the round ('win', 'lose', or 'draw')
 */
function applyResultAnimations(result) {
    const playerMoveDisplay = document.getElementById('player-move-display');
    const aiMoveDisplay = document.getElementById('ai-move-display');
    
    switch (result) {
        case 'win':
            // Show confetti for win
            if (window.showWinAnimation) {
                window.showWinAnimation();
            }
            break;
        case 'lose':
            // Show shake animation for loss
            if (window.showLossAnimation && playerMoveDisplay) {
                window.showLossAnimation(playerMoveDisplay);
            }
            break;
        case 'draw':
            // Show glow effect for draw
            if (window.showDrawAnimation && playerMoveDisplay && aiMoveDisplay) {
                window.showDrawAnimation(playerMoveDisplay);
                window.showDrawAnimation(aiMoveDisplay);
            }
            break;
    }
}

/**
 * Updates scores based on the round result
 * @param {string} result - The result of the round ('win', 'lose', or 'draw')
 * @param {boolean} isTimeoutMove - Whether this is an auto-selected move due to timeout
 */
function updateScores(result, isTimeoutMove) {
    // Check for score multiplier from bonus round
    const scoreMultiplier = gameState.bonusRoundActive ? bonusRound.getScoreMultiplier() : 1;
    
    // If this is a timeout move and the result is a loss, add a timeout penalty
    if (isTimeoutMove && result !== 'win') {
        result = 'lose'; // Force a loss for timeout
    }
    
    // Update localStorage stats with appropriate multiplier
    if (result === 'win') {
        for (let i = 0; i < scoreMultiplier; i++) {
            updateStat('wins');
        }
    } else if (result === 'lose') {
        updateStat('losses');
    } else {
        updateStat('draws');
    }
    
    // Update bonus rounds won stat
    if (gameState.bonusRoundActive && result === 'win') {
        updateBonusRoundStats();
    }
    
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
 * Updates the bonus rounds won statistic
 */
function updateBonusRoundStats() {
    // Get current bonus rounds won
    const bonusRoundsWon = getData('bonusRoundsWon') || 0;
    
    // Increment and save
    setData('bonusRoundsWon', bonusRoundsWon + 1);
    
    // Update UI in stats screen if it exists
    const bonusRoundsElement = document.getElementById('stats-bonus-rounds');
    if (bonusRoundsElement) {
        bonusRoundsElement.textContent = bonusRoundsWon + 1;
    }
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
    
    // Stop any speed mode timer
    speedMode.stopTimer();
}

/**
 * Continues the game after showing results
 */
export function continueGame() {
    sound.play('click');
    ui.showSection('game-screen');
    
    // If speed mode is enabled, start the timer
    if (speedMode.isEnabled()) {
        startSpeedModeTimer();
    }
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
    
    // If speed mode is enabled, restart the timer
    if (speedMode.isEnabled()) {
        startSpeedModeTimer();
    }
}

export default {
    initEndlessMode,
    handlePlayerMove,
    returnToMenu,
    continueGame,
    resetScores
}; 