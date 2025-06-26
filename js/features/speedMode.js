/**
 * Speed Mode module for Rock Paper Battle
 * Handles time-limited gameplay mechanics
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';
import { getRandomMove } from './aiModes.js';

// Configuration
const DEFAULT_TIME_LIMIT = 3000; // 3 seconds in milliseconds
const TIMER_UPDATE_INTERVAL = 50; // Update timer bar every 50ms
const WARNING_THRESHOLD = 1000; // Start warning (red color, sound) at 1 second left

// State
let isSpeedModeEnabled = false;
let currentTimer = null;
let timerUpdateInterval = null;
let currentTimeLeft = 0;
let timerCallback = null;
let timerElement = null;
let isTimerRunning = false;

/**
 * Initialize the speed mode system
 */
export function init() {
    // Load speed mode setting from localStorage
    const speedModeEnabled = getData('speedMode');
    if (speedModeEnabled !== undefined) {
        isSpeedModeEnabled = speedModeEnabled;
    } else {
        // Default to disabled
        setData('speedMode', false);
        isSpeedModeEnabled = false;
    }
    
    // Create timer element if it doesn't exist
    createTimerElement();
}

/**
 * Create the timer UI element
 */
function createTimerElement() {
    // Check if element already exists
    if (document.getElementById('speed-timer')) {
        timerElement = document.getElementById('speed-timer');
        return;
    }
    
    // Create timer container
    const timerContainer = document.createElement('div');
    timerContainer.id = 'speed-timer-container';
    timerContainer.className = 'speed-timer-container hidden';
    
    // Create timer bar
    timerElement = document.createElement('div');
    timerElement.id = 'speed-timer';
    timerElement.className = 'speed-timer';
    
    // Add to container
    timerContainer.appendChild(timerElement);
    
    // Add to game screen
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        // Insert after game header
        const gameHeader = gameScreen.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.insertAdjacentElement('afterend', timerContainer);
        } else {
            // Fallback: insert at beginning
            gameScreen.insertAdjacentElement('afterbegin', timerContainer);
        }
    } else {
        // Fallback: add to body
        document.body.appendChild(timerContainer);
    }
}

/**
 * Check if speed mode is enabled
 * @returns {boolean} Whether speed mode is enabled
 */
export function isEnabled() {
    return isSpeedModeEnabled;
}

/**
 * Set whether speed mode is enabled
 * @param {boolean} enabled - Whether to enable speed mode
 */
export function setEnabled(enabled) {
    isSpeedModeEnabled = enabled;
    setData('speedMode', enabled);
}

/**
 * Toggle speed mode on/off
 * @returns {boolean} The new speed mode state
 */
export function toggle() {
    isSpeedModeEnabled = !isSpeedModeEnabled;
    setData('speedMode', isSpeedModeEnabled);
    return isSpeedModeEnabled;
}

/**
 * Start the speed mode timer
 * @param {number} timeLimit - Optional time limit in milliseconds
 * @param {Function} onTimeUp - Callback to execute when time runs out
 * @returns {boolean} Whether the timer was successfully started
 */
export function startTimer(timeLimit = DEFAULT_TIME_LIMIT, onTimeUp = null) {
    // If speed mode is disabled or timer is already running, do nothing
    if (!isSpeedModeEnabled || isTimerRunning) {
        return false;
    }
    
    // Set up state
    timerCallback = onTimeUp;
    currentTimeLeft = timeLimit;
    isTimerRunning = true;
    
    // Show timer container
    const timerContainer = document.getElementById('speed-timer-container');
    if (timerContainer) {
        timerContainer.classList.remove('hidden');
    }
    
    // Reset timer appearance
    if (timerElement) {
        timerElement.style.width = '100%';
        timerElement.classList.remove('warning');
    }
    
    // Clear any existing timers
    stopTimer();
    
    // Start countdown
    currentTimer = setTimeout(() => {
        timeUp();
    }, timeLimit);
    
    // Start visual update interval
    timerUpdateInterval = setInterval(() => {
        updateTimerVisual();
    }, TIMER_UPDATE_INTERVAL);
    
    // Play start sound
    sound.play('countdown');
    
    return true;
}

/**
 * Stop the speed mode timer
 */
export function stopTimer() {
    // Clear countdown timer
    if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
    }
    
    // Clear update interval
    if (timerUpdateInterval) {
        clearInterval(timerUpdateInterval);
        timerUpdateInterval = null;
    }
    
    // Reset state
    isTimerRunning = false;
    
    // Hide timer container
    const timerContainer = document.getElementById('speed-timer-container');
    if (timerContainer) {
        timerContainer.classList.add('hidden');
    }
}

/**
 * Handle time running out
 */
function timeUp() {
    // Play time up sound
    sound.play('timeUp');
    
    // Execute callback if provided
    if (timerCallback && typeof timerCallback === 'function') {
        timerCallback();
    }
    
    // Stop the timer
    stopTimer();
}

/**
 * Update the visual timer bar
 */
function updateTimerVisual() {
    if (!timerElement || !isTimerRunning) return;
    
    // Update time left
    currentTimeLeft -= TIMER_UPDATE_INTERVAL;
    if (currentTimeLeft < 0) currentTimeLeft = 0;
    
    // Calculate percentage
    const percentage = (currentTimeLeft / DEFAULT_TIME_LIMIT) * 100;
    timerElement.style.width = `${percentage}%`;
    
    // Add warning class when time is running low
    if (currentTimeLeft <= WARNING_THRESHOLD && !timerElement.classList.contains('warning')) {
        timerElement.classList.add('warning');
        
        // Play warning tick sound
        sound.play('tick');
    }
}

/**
 * Get a random move for when time runs out
 * @param {Array} availableMoves - List of available moves
 * @returns {string} A randomly selected move
 */
export function getTimeoutMove(availableMoves) {
    return getRandomMove(availableMoves);
}

export default {
    init,
    isEnabled,
    setEnabled,
    toggle,
    startTimer,
    stopTimer,
    getTimeoutMove
}; 