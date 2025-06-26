/**
 * Game Logic module for Rock Paper Battle
 * Handles core game mechanics
 */

// Possible moves
const MOVES = ['rock', 'paper', 'scissors', 'fire'];

// Move emojis for display
const MOVE_EMOJIS = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️',
    fire: '🔥'
};

/**
 * Determines the winner of a round
 * @param {string} playerMove - The player's move
 * @param {string} aiMove - The AI's move
 * @returns {string} - 'win', 'lose', or 'draw'
 */
export function determineWinner(playerMove, aiMove) {
    // Same move = draw
    if (playerMove === aiMove) {
        return 'draw';
    }
    
    // Standard Rock-Paper-Scissors rules
    if (
        (playerMove === 'rock' && aiMove === 'scissors') ||
        (playerMove === 'paper' && aiMove === 'rock') ||
        (playerMove === 'scissors' && aiMove === 'paper')
    ) {
        return 'win';
    }
    
    // Fire move rules
    if (playerMove === 'fire') {
        // Fire beats scissors and paper
        if (aiMove === 'scissors' || aiMove === 'paper') {
            return 'win';
        }
        // Rock beats fire
        return 'lose';
    }
    
    if (aiMove === 'fire') {
        // Fire beats scissors and paper
        if (playerMove === 'scissors' || playerMove === 'paper') {
            return 'lose';
        }
        // Rock beats fire
        return 'win';
    }
    
    // Player loses in all other cases
    return 'lose';
}

/**
 * Gets the emoji for a move
 * @param {string} move - The move
 * @returns {string} - The emoji for the move
 */
export function getMoveEmoji(move) {
    return MOVE_EMOJIS[move] || '❓';
}

/**
 * Generates a result message based on the round outcome
 * @param {string} result - The result ('win', 'lose', or 'draw')
 * @param {string} playerMove - The player's move
 * @param {string} aiMove - The AI's move
 * @returns {string} - The result message
 */
export function getResultMessage(result, playerMove, aiMove) {
    const playerEmoji = getMoveEmoji(playerMove);
    const aiEmoji = getMoveEmoji(aiMove);
    
    if (result === 'win') {
        if (playerMove === 'fire' && (aiMove === 'scissors' || aiMove === 'paper')) {
            return `${playerEmoji} Fire burns ${aiEmoji}! You win!`;
        }
        if (playerMove === 'rock' && aiMove === 'fire') {
            return `${playerEmoji} Rock smothers ${aiEmoji}! You win!`;
        }
        return `${playerEmoji} beats ${aiEmoji}! You win!`;
    } else if (result === 'lose') {
        if (aiMove === 'fire' && (playerMove === 'scissors' || playerMove === 'paper')) {
            return `${aiEmoji} Fire burns ${playerEmoji}! You lose!`;
        }
        if (aiMove === 'rock' && playerMove === 'fire') {
            return `${aiEmoji} Rock smothers ${playerEmoji}! You lose!`;
        }
        return `${aiEmoji} beats ${playerEmoji}! You lose!`;
    } else {
        return `${playerEmoji} ties with ${aiEmoji}! It's a draw!`;
    }
}

export default {
    determineWinner,
    getMoveEmoji,
    getResultMessage
}; 