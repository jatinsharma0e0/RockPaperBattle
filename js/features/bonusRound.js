/**
 * Bonus Round module for Rock Paper Battle
 * Handles special game rounds with unique rules
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';
import * as ui from '../ui.js';

// Configuration
const BONUS_ROUND_CHANCE = 0.2; // 20% chance for bonus round (1 in 5)

// Bonus round types
const BONUS_TYPES = {
    DOUBLE_POINTS: 'double-points',
    REVERSE_RULES: 'reverse-rules',
    CHAOS_MODE: 'chaos-mode'
};

// State
let isBonusEnabled = true;
let currentBonusType = null;
let originalMoveButtons = {}; // Store original button labels for chaos mode

/**
 * Initialize the bonus round system
 */
export function init() {
    // Load bonus round setting from localStorage
    const bonusEnabled = getData('bonusEnabled');
    if (bonusEnabled !== undefined) {
        isBonusEnabled = bonusEnabled;
    } else {
        // Default to enabled
        setData('bonusEnabled', true);
    }
}

/**
 * Check if bonus rounds are enabled
 * @returns {boolean} Whether bonus rounds are enabled
 */
export function isEnabled() {
    return isBonusEnabled;
}

/**
 * Set whether bonus rounds are enabled
 * @param {boolean} enabled - Whether to enable bonus rounds
 */
export function setEnabled(enabled) {
    isBonusEnabled = enabled;
    setData('bonusEnabled', enabled);
}

/**
 * Toggle bonus rounds on/off
 * @returns {boolean} The new bonus rounds state
 */
export function toggle() {
    isBonusEnabled = !isBonusEnabled;
    setData('bonusEnabled', isBonusEnabled);
    return isBonusEnabled;
}

/**
 * Check if the current round should be a bonus round
 * @returns {boolean} Whether this is a bonus round
 */
export function shouldActivateBonusRound() {
    // If bonus rounds are disabled, never activate
    if (!isBonusEnabled) return false;
    
    return Math.random() < BONUS_ROUND_CHANCE;
}

/**
 * Activate a random bonus round
 * @returns {string} The type of bonus round activated
 */
export function activateRandomBonusRound() {
    // If already in a bonus round, end it first
    if (currentBonusType) {
        endBonusRound();
    }
    
    // Get all bonus types
    const bonusTypes = Object.values(BONUS_TYPES);
    
    // Select a random bonus type
    const randomIndex = Math.floor(Math.random() * bonusTypes.length);
    const selectedBonus = bonusTypes[randomIndex];
    
    // Activate the selected bonus round
    activateBonusRound(selectedBonus);
    
    return selectedBonus;
}

/**
 * Activate a specific bonus round
 * @param {string} bonusType - The type of bonus round to activate
 */
export function activateBonusRound(bonusType) {
    if (!Object.values(BONUS_TYPES).includes(bonusType)) {
        console.error(`Invalid bonus type: ${bonusType}`);
        return;
    }
    
    // Set current bonus type
    currentBonusType = bonusType;
    
    // Apply bonus round effects
    applyBonusRoundEffects(bonusType);
    
    // Show bonus round notification
    showBonusRoundNotification(bonusType);
    
    // Play bonus round sound
    sound.play('bonusRound');
}

/**
 * Apply the effects of a bonus round
 * @param {string} bonusType - The type of bonus round
 */
function applyBonusRoundEffects(bonusType) {
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        // Add bonus-round class to game area
        gameArea.classList.add('bonus-round');
        
        // Add specific bonus type class
        gameArea.classList.add(bonusType);
    }
    
    // Apply specific effects based on type
    switch (bonusType) {
        case BONUS_TYPES.CHAOS_MODE:
            applyChaosMode();
            break;
    }
}

/**
 * Apply chaos mode effects (swap move button labels)
 */
function applyChaosMode() {
    const moveButtons = document.querySelectorAll('.move-btn:not(.hidden)');
    if (moveButtons.length < 2) return;
    
    // Store original button data
    originalMoveButtons = {};
    moveButtons.forEach(button => {
        const move = button.getAttribute('data-move');
        originalMoveButtons[move] = button.textContent;
    });
    
    // Create array of moves and shuffle it
    const moves = Array.from(moveButtons).map(btn => btn.getAttribute('data-move'));
    const labels = Array.from(moveButtons).map(btn => btn.textContent);
    
    // Shuffle labels
    for (let i = labels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    
    // Apply shuffled labels
    moveButtons.forEach((button, index) => {
        button.textContent = labels[index];
        button.classList.add('chaos-mode-btn');
    });
    
    // Play chaos sound
    sound.play('chaos');
}

/**
 * End the current bonus round
 */
export function endBonusRound() {
    if (!currentBonusType) return;
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        // Remove bonus-round classes
        gameArea.classList.remove('bonus-round');
        gameArea.classList.remove(currentBonusType);
    }
    
    // Clean up specific bonus round effects
    switch (currentBonusType) {
        case BONUS_TYPES.CHAOS_MODE:
            cleanupChaosMode();
            break;
    }
    
    // Reset current bonus type
    currentBonusType = null;
}

/**
 * Clean up chaos mode effects
 */
function cleanupChaosMode() {
    const moveButtons = document.querySelectorAll('.move-btn');
    
    // Restore original button labels
    moveButtons.forEach(button => {
        const move = button.getAttribute('data-move');
        if (originalMoveButtons[move]) {
            button.textContent = originalMoveButtons[move];
        }
        button.classList.remove('chaos-mode-btn');
    });
    
    // Clear stored original buttons
    originalMoveButtons = {};
}

/**
 * Show a notification about the bonus round
 * @param {string} bonusType - The type of bonus round
 */
function showBonusRoundNotification(bonusType) {
    let title, description, icon;
    
    switch (bonusType) {
        case BONUS_TYPES.DOUBLE_POINTS:
            title = "Double Points Round!";
            description = "Win this round to earn double points!";
            icon = "🎯";
            break;
        case BONUS_TYPES.REVERSE_RULES:
            title = "Reverse Rules!";
            description = "The rules are reversed! Rock beats Paper, Paper beats Scissors, Scissors beats Rock!";
            icon = "🔁";
            break;
        case BONUS_TYPES.CHAOS_MODE:
            title = "Chaos Mode!";
            description = "Move labels are scrambled! Choose wisely!";
            icon = "🎲";
            break;
        default:
            title = "Bonus Round!";
            description = "Special rules apply this round!";
            icon = "🎁";
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'bonus-notification';
    notification.innerHTML = `
        <div class="bonus-notification-icon">${icon}</div>
        <div class="bonus-notification-content">
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add show class for animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after a delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 4000);
}

/**
 * Get the current bonus round type
 * @returns {string|null} The current bonus round type or null if no bonus round
 */
export function getCurrentBonusType() {
    return currentBonusType;
}

/**
 * Modify the game result based on bonus round rules
 * @param {string} result - The original result ('win', 'lose', or 'draw')
 * @param {string} playerMove - The player's move
 * @param {string} aiMove - The AI's move
 * @returns {string} The modified result
 */
export function modifyResult(result, playerMove, aiMove) {
    if (!currentBonusType) return result;
    
    switch (currentBonusType) {
        case BONUS_TYPES.REVERSE_RULES:
            return modifyResultForReverseRules(result, playerMove, aiMove);
        default:
            return result;
    }
}

/**
 * Modify the game result for reverse rules bonus round
 * @param {string} result - The original result
 * @param {string} playerMove - The player's move
 * @param {string} aiMove - The AI's move
 * @returns {string} The modified result
 */
function modifyResultForReverseRules(result, playerMove, aiMove) {
    // If it's a draw, keep it a draw
    if (playerMove === aiMove) return 'draw';
    
    // Reversed rules:
    // - Rock beats Paper (instead of Paper beats Rock)
    // - Paper beats Scissors (instead of Scissors beats Paper) 
    // - Scissors beats Rock (instead of Rock beats Scissors)
    // - Fire still beats Paper and Scissors, and Rock still beats Fire
    
    if (
        (playerMove === 'rock' && aiMove === 'paper') ||
        (playerMove === 'paper' && aiMove === 'scissors') ||
        (playerMove === 'scissors' && aiMove === 'rock')
    ) {
        return 'win';
    }
    
    if (
        (playerMove === 'paper' && aiMove === 'rock') ||
        (playerMove === 'scissors' && aiMove === 'paper') ||
        (playerMove === 'rock' && aiMove === 'scissors')
    ) {
        return 'lose';
    }
    
    // For Fire, keep the regular rules
    if (playerMove === 'fire') {
        if (aiMove === 'scissors' || aiMove === 'paper') {
            return 'win';
        }
        if (aiMove === 'rock') {
            return 'lose';
        }
    }
    
    if (aiMove === 'fire') {
        if (playerMove === 'scissors' || playerMove === 'paper') {
            return 'lose';
        }
        if (playerMove === 'rock') {
            return 'win';
        }
    }
    
    // Fallback to original result
    return result;
}

/**
 * Get the score multiplier for the current bonus round
 * @returns {number} The score multiplier (1 for normal, 2 for double points, etc.)
 */
export function getScoreMultiplier() {
    if (currentBonusType === BONUS_TYPES.DOUBLE_POINTS) {
        return 2;
    }
    return 1;
}

export default {
    init,
    isEnabled,
    setEnabled,
    toggle,
    shouldActivateBonusRound,
    activateRandomBonusRound,
    activateBonusRound,
    endBonusRound,
    getCurrentBonusType,
    modifyResult,
    getScoreMultiplier,
    BONUS_TYPES
}; 