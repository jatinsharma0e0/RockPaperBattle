/**
 * Secret Move module for Rock Paper Battle
 * Handles the Fire move unlock and functionality
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';

// Secret move unlock condition
const WINS_REQUIRED = 10;

// Secret move state
let isSecretMoveUnlocked = false;

/**
 * Initialize the secret move system
 */
export function init() {
    // Check if secret move is already unlocked in localStorage
    const unlocks = getData('unlocks') || {};
    isSecretMoveUnlocked = unlocks.secretMoveUnlocked || false;
    
    // Check if player meets the unlock condition
    checkUnlockCondition();
    
    // Update UI based on unlock status
    updateSecretMoveUI();
}

/**
 * Check if the player meets the unlock condition
 */
function checkUnlockCondition() {
    // If already unlocked, no need to check
    if (isSecretMoveUnlocked) return;
    
    // Get player stats
    const stats = getData('stats') || {};
    const wins = stats.wins || 0;
    
    // Check if player has enough wins
    if (wins >= WINS_REQUIRED) {
        unlockSecretMove();
    }
}

/**
 * Unlock the secret move
 */
function unlockSecretMove() {
    // Set unlock state
    isSecretMoveUnlocked = true;
    
    // Save to localStorage
    const unlocks = getData('unlocks') || {};
    unlocks.secretMoveUnlocked = true;
    setData('unlocks', unlocks);
    
    // Update UI
    updateSecretMoveUI();
    
    // Show unlock notification after a delay
    setTimeout(showUnlockNotification, 1000);
}

/**
 * Update the secret move UI elements
 */
function updateSecretMoveUI() {
    const fireButton = document.getElementById('fire-move-btn');
    
    if (fireButton) {
        if (isSecretMoveUnlocked) {
            // Show the button
            fireButton.classList.remove('hidden');
            
            // Add reveal animation if it's newly unlocked
            const unlocks = getData('unlocks') || {};
            if (unlocks.secretMoveUnlocked && !unlocks.secretMoveRevealed) {
                fireButton.classList.add('fire-reveal');
                
                // Mark as revealed
                unlocks.secretMoveRevealed = true;
                setData('unlocks', unlocks);
                
                // Add glow effect
                setTimeout(() => {
                    fireButton.classList.add('fire-glow');
                    
                    // Remove glow after a while
                    setTimeout(() => {
                        fireButton.classList.remove('fire-glow');
                    }, 5000);
                }, 1000);
            }
        } else {
            // Hide the button
            fireButton.classList.add('hidden');
        }
    }
}

/**
 * Show a notification when the secret move is unlocked
 */
function showUnlockNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    // Create content
    notification.innerHTML = `
        <div class="achievement-icon">🔥</div>
        <div class="achievement-content">
            <h3>New Move Unlocked!</h3>
            <p class="achievement-name">Fire Move</p>
            <p class="achievement-description">You've unlocked the secret Fire move!</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Play unlock sound
    sound.play('win');
    
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
    }, 5000);
}

/**
 * Check if the secret move is unlocked
 * @returns {boolean} Whether the secret move is unlocked
 */
export function isUnlocked() {
    return isSecretMoveUnlocked;
}

/**
 * Force unlock the secret move (for testing or admin purposes)
 */
export function forceUnlock() {
    unlockSecretMove();
}

/**
 * Reset the secret move unlock status
 */
export function resetUnlock() {
    isSecretMoveUnlocked = false;
    
    const unlocks = getData('unlocks') || {};
    unlocks.secretMoveUnlocked = false;
    unlocks.secretMoveRevealed = false;
    setData('unlocks', unlocks);
    
    updateSecretMoveUI();
}

export default {
    init,
    isUnlocked,
    forceUnlock,
    resetUnlock
}; 