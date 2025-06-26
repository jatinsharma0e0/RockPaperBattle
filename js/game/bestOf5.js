/**
 * Best of 5 Mode module for Rock Paper Battle
 * Handles the best of 5 gameplay mode against AI
 */

import { determineWinner, getRandomMove, getResultMessage } from './logic.js';
import * as ui from '../ui.js';
import { getData, setData, updateStat } from '../settings/storage.js';
import * as sound from '../features/sound.js';
import * as achievements from '../features/achievements.js';
import * as stats from '../features/stats.js';

// Game state for Best of 5 Mode
const gameState = {
    playerScore: 0,
    aiScore: 0,
    currentRound: 0,
    maxRounds: 5,
    lastPlayerMove: null,
    lastAiMove: null,
    lastResult: null,
    gameOver: false
};

/**
 * Initializes the Best of 5 Mode game
 */
export function initBestOf5Mode() {
    // Reset game state
    resetGameState();
    
    // Update UI to show Best of 5 mode
    document.querySelector('#game-screen h2').textContent = 'Best of 5';
    
    // Show the game screen
    ui.showSection('game-screen');
    
    // Play start sound
    sound.play('gameStart');
}

/**
 * Resets the game state for a new game
 */
function resetGameState() {
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.currentRound = 0;
    gameState.lastPlayerMove = null;
    gameState.lastAiMove = null;
    gameState.lastResult = null;
    gameState.gameOver = false;
    
    // Reset the move displays
    ui.displayMoves('', '');
    
    // Update score display
    updateScoreDisplay();
}

/**
 * Updates the score display
 */
function updateScoreDisplay() {
    ui.updateScore(gameState.playerScore, gameState.aiScore);
}

/**
 * Handles player move selection
 * @param {string} playerMove - The player's selected move
 */
export function handlePlayerMove(playerMove) {
    // Don't allow moves if game is over
    if (gameState.gameOver) return;
    
    // Generate AI move
    const aiMove = getRandomMove();
    
    // Determine the winner
    const result = determineWinner(playerMove, aiMove);
    
    // Update game state
    gameState.lastPlayerMove = playerMove;
    gameState.lastAiMove = aiMove;
    gameState.lastResult = result;
    gameState.currentRound++;
    
    // Update scores
    if (result === 'win') {
        gameState.playerScore++;
        sound.play('win');
    } else if (result === 'lose') {
        gameState.aiScore++;
        sound.play('lose');
    } else {
        sound.play('draw');
    }
    
    // Update score display
    updateScoreDisplay();
    
    // Display moves
    ui.displayMoves(playerMove, aiMove);
    
    // Get result message
    const resultMessage = getResultMessage(result, playerMove, aiMove);
    
    // Check if game is over
    const isGameOver = checkGameOver();
    
    // Check achievements
    achievements.checkAchievements(result, gameState, 'bestOf5');
    
    // Show result after a short delay
    setTimeout(() => {
        if (isGameOver) {
            showFinalResult();
        } else {
            ui.showResult(result, resultMessage, playerMove, aiMove);
        }
    }, 1000);
    
    // Update localStorage stats
    updateStat(result === 'win' ? 'wins' : result === 'lose' ? 'losses' : 'draws');
    
    // Update win streak tracking
    if (result === 'win') {
        // Get current win streak
        const currentWinStreak = getData('currentWinStreak') || 0;
        
        // Update longest win streak if needed
        stats.updateLongestWinStreak(currentWinStreak);
    }
}

/**
 * Checks if the game is over (one player reached 3 wins or all 5 rounds played)
 * @returns {boolean} - Whether the game is over
 */
function checkGameOver() {
    // Game is over if either player reaches 3 wins or all 5 rounds are played
    if (gameState.playerScore >= 3 || gameState.aiScore >= 3 || gameState.currentRound >= gameState.maxRounds) {
        gameState.gameOver = true;
        return true;
    }
    return false;
}

/**
 * Shows the final result of the Best of 5 game
 */
function showFinalResult() {
    const playerWon = gameState.playerScore > gameState.aiScore;
    const isDraw = gameState.playerScore === gameState.aiScore;
    
    let title, message, resultClass;
    
    if (isDraw) {
        title = "It's a Draw!";
        message = `Final Score: ${gameState.playerScore}-${gameState.aiScore}`;
        resultClass = 'draw';
        sound.play('gameDraw');
    } else if (playerWon) {
        title = "You Win the Match!";
        message = `Final Score: ${gameState.playerScore}-${gameState.aiScore}`;
        resultClass = 'win';
        sound.play('gameWin');
        
        // Update best mode in stats
        stats.updateBestMode('Best of 5');
        
        // Check for flawless victory achievement
        if (gameState.aiScore === 0) {
            achievements.checkAchievements('win', gameState, 'bestOf5');
        }
    } else {
        title = "You Lose the Match!";
        message = `Final Score: ${gameState.playerScore}-${gameState.aiScore}`;
        resultClass = 'lose';
        sound.play('gameLose');
    }
    
    // Update elements
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${resultClass}`;
    
    // Show the results screen
    ui.showSection('results-screen');
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
    
    if (gameState.gameOver) {
        // If game is over, start a new game
        resetGameState();
    }
    
    ui.showSection('game-screen');
}

/**
 * Resets the current game scores
 */
export function resetScores() {
    resetGameState();
    sound.play('click');
}

export default {
    initBestOf5Mode,
    handlePlayerMove,
    returnToMenu,
    continueGame,
    resetScores
}; 