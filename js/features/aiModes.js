/**
 * AI Modes module for Rock Paper Battle
 * Handles different difficulty levels and strategic gameplay
 */

import { getData, setData } from '../settings/storage.js';

// AI Difficulty levels
const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    IMPOSSIBLE: 'impossible'
};

// Default settings
let currentDifficulty = DIFFICULTY_LEVELS.MEDIUM;

// Player move history for AI analysis
const moveHistory = {
    rock: 0,
    paper: 0,
    scissors: 0,
    fire: 0
};

// Sequence-based pattern tracking (last 10 moves)
const playerMoveSequence = [];
const MAX_SEQUENCE_LENGTH = 10;

// Pattern analysis data
const patternFrequency = {
    'rock-rock': 0,
    'rock-paper': 0,
    'rock-scissors': 0,
    'paper-rock': 0,
    'paper-paper': 0,
    'paper-scissors': 0,
    'scissors-rock': 0,
    'scissors-paper': 0,
    'scissors-scissors': 0
};

// Last player move for analysis
let lastPlayerMove = null;
// Current player move for impossible mode
let currentPlayerMove = null;

// AI performance tracking
const aiStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    lastOutcomes: [] // Last 5 game outcomes
};

/**
 * Initialize the AI system
 */
export function init() {
    // Load difficulty from localStorage
    const savedDifficulty = getData('aiDifficulty');
    if (savedDifficulty && Object.values(DIFFICULTY_LEVELS).includes(savedDifficulty)) {
        currentDifficulty = savedDifficulty;
    } else {
        // Set default difficulty
        setData('aiDifficulty', DIFFICULTY_LEVELS.MEDIUM);
    }
    
    // Handle legacy AI mode data
    const legacyMode = getData('aiMode');
    if (legacyMode) {
        // Convert legacy mode to difficulty if needed
        switch (legacyMode) {
            case 'random':
                setData('aiDifficulty', DIFFICULTY_LEVELS.EASY);
                currentDifficulty = DIFFICULTY_LEVELS.EASY;
                break;
            case 'predictive':
                setData('aiDifficulty', DIFFICULTY_LEVELS.HARD);
                currentDifficulty = DIFFICULTY_LEVELS.HARD;
                break;
            default:
                // Default to medium for other modes
                setData('aiDifficulty', DIFFICULTY_LEVELS.MEDIUM);
                currentDifficulty = DIFFICULTY_LEVELS.MEDIUM;
        }
        
        // Remove legacy data
        localStorage.removeItem('aiMode');
    }
    
    // Reset move history and patterns
    resetMoveHistory();
}

/**
 * Reset the player move history and pattern data
 */
export function resetMoveHistory() {
    // Reset frequency counters
    moveHistory.rock = 0;
    moveHistory.paper = 0;
    moveHistory.scissors = 0;
    moveHistory.fire = 0;
    
    // Reset sequence
    playerMoveSequence.length = 0;
    
    // Reset patterns
    Object.keys(patternFrequency).forEach(key => {
        patternFrequency[key] = 0;
    });
    
    // Reset tracking variables
    lastPlayerMove = null;
    currentPlayerMove = null;
    
    // Reset AI stats
    aiStats.lastOutcomes = [];
}

/**
 * Record a player move for AI analysis
 * @param {string} move - The player's move
 */
export function recordPlayerMove(move) {
    // Store current move for impossible mode
    currentPlayerMove = move;
    
    // Update frequency counters
    if (moveHistory[move] !== undefined) {
        moveHistory[move]++;
    }
    
    // Update sequence
    playerMoveSequence.push(move);
    if (playerMoveSequence.length > MAX_SEQUENCE_LENGTH) {
        playerMoveSequence.shift(); // Keep only the last MAX_SEQUENCE_LENGTH moves
    }
    
    // Update pattern data if we have at least 2 moves
    if (lastPlayerMove && move) {
        const pattern = `${lastPlayerMove}-${move}`;
        if (patternFrequency[pattern] !== undefined) {
            patternFrequency[pattern]++;
        }
    }
    
    // Update last move
    lastPlayerMove = move;
}

/**
 * Record game outcome for AI adaptation
 * @param {string} outcome - 'win', 'loss', or 'draw' from AI perspective
 */
export function recordGameOutcome(outcome) {
    if (outcome === 'win') {
        aiStats.wins++;
    } else if (outcome === 'loss') {
        aiStats.losses++;
    } else if (outcome === 'draw') {
        aiStats.draws++;
    }
    
    // Keep track of recent outcomes for adaptive strategy
    aiStats.lastOutcomes.unshift(outcome);
    if (aiStats.lastOutcomes.length > 5) {
        aiStats.lastOutcomes.pop();
    }
}

/**
 * Get the AI's move based on the current difficulty
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - The AI's selected move
 */
export function getComputerMove(availableMoves) {
    // Apply difficulty
    switch (currentDifficulty) {
        case DIFFICULTY_LEVELS.EASY:
            // Easy is always random
            return getRandomMove(availableMoves);
            
        case DIFFICULTY_LEVELS.MEDIUM:
            // Medium uses 50% strategic, 50% random
            if (Math.random() < 0.5) {
                return getStrategicMove(availableMoves);
            } else {
                return getRandomMove(availableMoves);
            }
            
        case DIFFICULTY_LEVELS.HARD:
            // Hard is fully strategic
            return getStrategicMove(availableMoves);
            
        case DIFFICULTY_LEVELS.IMPOSSIBLE:
            // Impossible always wins if possible
            return getImpossibleMove(availableMoves);
            
        default:
            return getRandomMove(availableMoves);
    }
}

/**
 * Get a strategic move based on pattern analysis
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - The AI's selected move
 */
function getStrategicMove(availableMoves) {
    // If we don't have enough moves yet, use random
    const totalMoves = playerMoveSequence.length;
    if (totalMoves < 3) {
        return getRandomMove(availableMoves);
    }
    
    // Try pattern prediction first (30% chance)
    if (Math.random() < 0.3 && lastPlayerMove) {
        // Find the most likely next move based on patterns
        let highestFrequency = 0;
        let mostLikelyNextMove = null;
        
        Object.keys(patternFrequency).forEach(pattern => {
            if (pattern.startsWith(lastPlayerMove + '-') && patternFrequency[pattern] > highestFrequency) {
                highestFrequency = patternFrequency[pattern];
                mostLikelyNextMove = pattern.split('-')[1]; // The second part of the pattern
            }
        });
        
        if (mostLikelyNextMove && highestFrequency > 1) {
            const counter = getCounterMove(mostLikelyNextMove);
            if (availableMoves.includes(counter)) {
                return counter;
            }
        }
    }
    
    // Try frequency-based prediction (40% chance)
    if (Math.random() < 0.4) {
        // Find the most used move
        let mostUsedMove = 'rock'; // Default
        let highestCount = 0;
        
        for (const [move, count] of Object.entries(moveHistory)) {
            if (count > highestCount) {
                highestCount = count;
                mostUsedMove = move;
            }
        }
        
        // Choose the counter to most used move
        const counterMove = getCounterMove(mostUsedMove);
        
        // If counter move is available, use it
        if (availableMoves.includes(counterMove)) {
            return counterMove;
        }
    }
    
    // Try sequence-based prediction (30% chance)
    if (Math.random() < 0.3 && playerMoveSequence.length >= 3) {
        // Look at the last 3 moves to predict a pattern
        const lastThree = playerMoveSequence.slice(-3);
        
        // Simple pattern: if player used the same move twice in a row, they might use it again
        if (lastThree[1] === lastThree[2]) {
            const counter = getCounterMove(lastThree[2]);
            if (availableMoves.includes(counter)) {
                return counter;
            }
        }
        
        // Alternating pattern: if player is alternating between two moves
        if (lastThree[0] === lastThree[2] && lastThree[0] !== lastThree[1]) {
            const counter = getCounterMove(lastThree[0]);
            if (availableMoves.includes(counter)) {
                return counter;
            }
        }
    }
    
    // If all prediction methods fail or aren't triggered, use random
    return getRandomMove(availableMoves);
}

/**
 * Get a move for the impossible AI that always counters the player's move
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - The AI's selected move
 */
function getImpossibleMove(availableMoves) {
    // If we know the current player move, counter it directly
    if (currentPlayerMove && moveHistory[currentPlayerMove] !== undefined) {
        const counterMove = getCounterMove(currentPlayerMove);
        
        // If counter move is available, use it
        if (availableMoves.includes(counterMove)) {
            return counterMove;
        }
    }
    
    // If we can't counter directly, fall back to strategic
    return getStrategicMove(availableMoves);
}

/**
 * Get a random move for the AI
 * @param {Array} availableMoves - The moves available to the AI
 * @returns {string} - A random move
 */
export function getRandomMove(availableMoves) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

/**
 * Get the counter move that beats the given move
 * @param {string} move - The move to counter
 * @returns {string} - The counter move
 */
function getCounterMove(move) {
    switch (move) {
        case 'rock':
            return 'paper';
        case 'paper':
            return 'scissors';
        case 'scissors':
            return 'rock';
        case 'fire':
            return 'rock'; // Assuming rock counters fire
        default:
            return 'rock';
    }
}

/**
 * Set the AI difficulty level
 * @param {string} difficulty - The difficulty level to set
 */
export function setDifficulty(difficulty) {
    if (Object.values(DIFFICULTY_LEVELS).includes(difficulty)) {
        currentDifficulty = difficulty;
        setData('aiDifficulty', difficulty);
        resetMoveHistory(); // Reset history when changing difficulty
    } else {
        console.error(`Invalid AI difficulty: ${difficulty}`);
    }
}

/**
 * Get the current AI difficulty level
 * @returns {string} - The current difficulty level
 */
export function getCurrentDifficulty() {
    return currentDifficulty;
}

/**
 * Get the AI difficulty display name
 * @returns {string} - The display name for the current difficulty
 */
export function getCurrentDifficultyDisplayName() {
    switch (currentDifficulty) {
        case DIFFICULTY_LEVELS.EASY:
            return 'Noobron';
        case DIFFICULTY_LEVELS.MEDIUM:
            return 'Median Mind';
        case DIFFICULTY_LEVELS.HARD:
            return 'Mindbreaker';
        case DIFFICULTY_LEVELS.IMPOSSIBLE:
            return 'Impossible';
        default:
            return 'Median Mind';
    }
}

/**
 * Get the AI difficulty emoji icon
 * @returns {string} - The emoji for the current difficulty
 */
export function getCurrentDifficultyEmoji() {
    switch (currentDifficulty) {
        case DIFFICULTY_LEVELS.EASY:
            return '😊';
        case DIFFICULTY_LEVELS.MEDIUM:
            return '😐';
        case DIFFICULTY_LEVELS.HARD:
            return '😈';
        case DIFFICULTY_LEVELS.IMPOSSIBLE:
            return '👹';
        default:
            return '😐';
    }
}

/**
 * Get all available difficulty levels with their details
 * @returns {Array} - Array of difficulty level objects
 */
export function getAllDifficultyLevels() {
    return [
        {
            id: DIFFICULTY_LEVELS.EASY,
            name: 'Noobron',
            description: 'Chill, always makes mistakes',
            emoji: '😊'
        },
        {
            id: DIFFICULTY_LEVELS.MEDIUM,
            name: 'Median Mind',
            description: 'Keeps things fair',
            emoji: '😐'
        },
        {
            id: DIFFICULTY_LEVELS.HARD,
            name: 'Mindbreaker',
            description: 'Forces you to think harder',
            emoji: '😈'
        },
        {
            id: DIFFICULTY_LEVELS.IMPOSSIBLE,
            name: 'Impossible',
            description: 'Impossible to Beat',
            emoji: '👹'
        }
    ];
}

/**
 * Get the AI avatar based on the current difficulty
 * @returns {string} - The avatar emoji for the current difficulty
 */
export function getCurrentDifficultyAvatar() {
    switch (currentDifficulty) {
        case DIFFICULTY_LEVELS.EASY:
            return '🤓'; // Nerd face for Noobron
        case DIFFICULTY_LEVELS.MEDIUM:
            return '🤖'; // Robot for Median Mind
        case DIFFICULTY_LEVELS.HARD:
            return '👾'; // Alien monster for Mindbreaker
        case DIFFICULTY_LEVELS.IMPOSSIBLE:
            return '👹'; // Ogre for Impossible
        default:
            return '🤖';
    }
}

/**
 * Update the AI difficulty indicator in the UI
 * This function should be called from the game mode files
 */
export function updateAiIndicators() {
    // Update difficulty indicator
    const aiDifficultyIndicator = document.getElementById('ai-difficulty-indicator');
    if (aiDifficultyIndicator) {
        // Clear existing classes
        aiDifficultyIndicator.className = 'ai-difficulty-indicator';
        
        // Set emoji based on current difficulty
        aiDifficultyIndicator.textContent = getCurrentDifficultyEmoji();
        
        // Add class based on difficulty
        aiDifficultyIndicator.classList.add(`ai-${getCurrentDifficulty()}-difficulty`);
        
        // Set tooltip
        aiDifficultyIndicator.title = `${getCurrentDifficultyDisplayName()} Difficulty`;
    }
    
    // Update AI avatar
    const aiAvatar = document.getElementById('ai-avatar');
    if (aiAvatar) {
        aiAvatar.textContent = getCurrentDifficultyAvatar();
        aiAvatar.title = getCurrentDifficultyDisplayName();
    }
    
    // For backward compatibility, also update the mode indicator if it exists
    const aiModeIndicator = document.getElementById('ai-mode-indicator');
    if (aiModeIndicator) {
        // Hide the mode indicator since we're not using it anymore
        aiModeIndicator.style.display = 'none';
    }
}

export default {
    init,
    getAllDifficultyLevels,
    getComputerMove,
    getRandomMove,
    setDifficulty,
    getCurrentDifficulty,
    getCurrentDifficultyDisplayName,
    getCurrentDifficultyEmoji,
    getCurrentDifficultyAvatar,
    recordPlayerMove,
    recordGameOutcome,
    resetMoveHistory,
    updateAiIndicators,
    DIFFICULTY_LEVELS
}; 