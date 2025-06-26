/**
 * AI Modes module for Rock Paper Battle
 * Handles different AI personalities and move selection strategies
 */

import { getData, setData } from '../settings/storage.js';

// Available AI modes
const AI_MODES = {
    RANDOM: 'random',
    CHEEKY: 'cheeky',
    PREDICTIVE: 'predictive'
};

// Default mode
let currentMode = AI_MODES.RANDOM;

// Player move history for AI analysis
const moveHistory = {
    rock: 0,
    paper: 0,
    scissors: 0,
    fire: 0
};

// Last player move for cheeky AI
let lastPlayerMove = null;

/**
 * Initialize the AI system
 */
export function init() {
    // Load AI mode from localStorage
    const savedMode = getData('aiMode');
    if (savedMode && Object.values(AI_MODES).includes(savedMode)) {
        currentMode = savedMode;
    } else {
        // Set default mode
        setData('aiMode', AI_MODES.RANDOM);
    }
    
    // Reset move history
    resetMoveHistory();
}

/**
 * Reset the player move history
 */
export function resetMoveHistory() {
    moveHistory.rock = 0;
    moveHistory.paper = 0;
    moveHistory.scissors = 0;
    moveHistory.fire = 0;
    lastPlayerMove = null;
}

/**
 * Record a player move for AI analysis
 * @param {string} move - The player's move
 */
export function recordPlayerMove(move) {
    if (moveHistory[move] !== undefined) {
        moveHistory[move]++;
        lastPlayerMove = move;
    }
}

/**
 * Get the AI's move based on the current AI mode
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - The AI's selected move
 */
export function getComputerMove(availableMoves) {
    switch (currentMode) {
        case AI_MODES.CHEEKY:
            return getCheekyMove(availableMoves);
        case AI_MODES.PREDICTIVE:
            return getPredictiveMove(availableMoves);
        case AI_MODES.RANDOM:
        default:
            return getRandomMove(availableMoves);
    }
}

/**
 * Get a random move for the AI
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - A random move
 */
function getRandomMove(availableMoves) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

/**
 * Get a move for the cheeky AI
 * Mimics player's last move 40% of the time
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - The AI's selected move
 */
function getCheekyMove(availableMoves) {
    // If we have a last player move and it's available to the AI
    if (lastPlayerMove && availableMoves.includes(lastPlayerMove)) {
        // 40% chance to mimic
        if (Math.random() < 0.4) {
            return lastPlayerMove;
        }
    }
    
    // Otherwise choose randomly
    return getRandomMove(availableMoves);
}

/**
 * Get a move for the predictive AI
 * Tries to counter the player's most used move
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - The AI's selected move
 */
function getPredictiveMove(availableMoves) {
    // Find the most used move
    let mostUsedMove = 'rock'; // Default
    let highestCount = 0;
    
    for (const [move, count] of Object.entries(moveHistory)) {
        if (count > highestCount) {
            highestCount = count;
            mostUsedMove = move;
        }
    }
    
    // If no moves recorded yet or total moves below threshold, use random
    const totalMoves = Object.values(moveHistory).reduce((sum, count) => sum + count, 0);
    if (totalMoves < 3) {
        return getRandomMove(availableMoves);
    }
    
    // Choose the counter to most used move
    let counterMove;
    
    switch (mostUsedMove) {
        case 'rock':
            counterMove = 'paper';
            break;
        case 'paper':
            counterMove = 'scissors';
            break;
        case 'scissors':
            counterMove = 'rock';
            break;
        case 'fire':
            counterMove = 'rock';
            break;
        default:
            counterMove = 'rock';
    }
    
    // If counter move is not available, choose random
    if (!availableMoves.includes(counterMove)) {
        return getRandomMove(availableMoves);
    }
    
    return counterMove;
}

/**
 * Set the AI mode
 * @param {string} mode - The AI mode to set
 */
export function setAiMode(mode) {
    if (Object.values(AI_MODES).includes(mode)) {
        currentMode = mode;
        setData('aiMode', mode);
        resetMoveHistory(); // Reset history when changing modes
    } else {
        console.error(`Invalid AI mode: ${mode}`);
    }
}

/**
 * Get the current AI mode
 * @returns {string} - The current AI mode
 */
export function getCurrentMode() {
    return currentMode;
}

/**
 * Get the AI mode display name
 * @returns {string} - The display name for the current AI mode
 */
export function getCurrentModeDisplayName() {
    switch (currentMode) {
        case AI_MODES.CHEEKY:
            return 'Cheeky';
        case AI_MODES.PREDICTIVE:
            return 'Predictive';
        case AI_MODES.RANDOM:
        default:
            return 'Random';
    }
}

/**
 * Get the AI mode emoji icon
 * @returns {string} - The emoji for the current AI mode
 */
export function getCurrentModeEmoji() {
    switch (currentMode) {
        case AI_MODES.CHEEKY:
            return '😏';
        case AI_MODES.PREDICTIVE:
            return '🧠';
        case AI_MODES.RANDOM:
        default:
            return '🤖';
    }
}

/**
 * Get all available AI modes with their details
 * @returns {Array} - Array of AI mode objects
 */
export function getAllModes() {
    return [
        {
            id: AI_MODES.RANDOM,
            name: 'Random',
            description: 'Picks moves randomly',
            emoji: '🤖'
        },
        {
            id: AI_MODES.CHEEKY,
            name: 'Cheeky',
            description: 'Sometimes copies your last move',
            emoji: '😏'
        },
        {
            id: AI_MODES.PREDICTIVE,
            name: 'Predictive',
            description: 'Analyzes your patterns',
            emoji: '🧠'
        }
    ];
}

export default {
    init,
    getAllModes,
    getComputerMove,
    setAiMode,
    getCurrentMode,
    getCurrentModeDisplayName,
    getCurrentModeEmoji,
    recordPlayerMove,
    resetMoveHistory,
    AI_MODES
}; 