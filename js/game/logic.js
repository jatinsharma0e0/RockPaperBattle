/**
 * Game Logic module for Rock Paper Battle
 * Contains core game rules and utilities
 */

// Valid moves in the game
export const MOVES = ['rock', 'paper', 'scissors'];

// Move emoji representations
export const MOVE_EMOJIS = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

/**
 * Determines the result of a round based on player and AI moves
 * @param {string} playerMove - Player's move ('rock', 'paper', or 'scissors')
 * @param {string} aiMove - AI's move ('rock', 'paper', or 'scissors')
 * @returns {string} - Result: 'win', 'lose', or 'draw'
 */
export function determineWinner(playerMove, aiMove) {
    // Validate moves
    if (!MOVES.includes(playerMove) || !MOVES.includes(aiMove)) {
        console.error('Invalid move provided:', playerMove, aiMove);
        return null;
    }
    
    // Draw case
    if (playerMove === aiMove) {
        return 'draw';
    }
    
    // Win cases for player
    if (
        (playerMove === 'rock' && aiMove === 'scissors') ||
        (playerMove === 'paper' && aiMove === 'rock') ||
        (playerMove === 'scissors' && aiMove === 'paper')
    ) {
        return 'win';
    }
    
    // All other cases are losses
    return 'lose';
}

/**
 * Generates a random move for the AI
 * @returns {string} - Random move ('rock', 'paper', or 'scissors')
 */
export function getRandomMove() {
    const randomIndex = Math.floor(Math.random() * MOVES.length);
    return MOVES[randomIndex];
}

/**
 * Gets the emoji representation of a move
 * @param {string} move - The move ('rock', 'paper', or 'scissors')
 * @returns {string} - Emoji representing the move
 */
export function getMoveEmoji(move) {
    return MOVE_EMOJIS[move] || '❓';
}

/**
 * Gets a descriptive message for the game result
 * @param {string} result - The result ('win', 'lose', or 'draw')
 * @param {string} playerMove - Player's move
 * @param {string} aiMove - AI's move
 * @returns {string} - Descriptive message about the result
 */
export function getResultMessage(result, playerMove, aiMove) {
    const playerEmoji = getMoveEmoji(playerMove);
    const aiEmoji = getMoveEmoji(aiMove);
    
    switch (result) {
        case 'win':
            return `You win! ${playerEmoji} beats ${aiEmoji}`;
        case 'lose':
            return `You lose! ${aiEmoji} beats ${playerEmoji}`;
        case 'draw':
            return `It's a draw! Both chose ${playerEmoji}`;
        default:
            return 'Invalid result';
    }
}

export default {
    MOVES,
    MOVE_EMOJIS,
    determineWinner,
    getRandomMove,
    getMoveEmoji,
    getResultMessage
}; 