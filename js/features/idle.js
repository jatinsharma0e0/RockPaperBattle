/**
 * Idle module for Rock Paper Battle
 * Handles idle detection, animations, and ambient sound
 */

import * as sound from './sound.js';
import { getData } from '../settings/storage.js';

// Configuration
const IDLE_TIMEOUT = 7000; // 7 seconds timeout
const IDLE_CHECK_INTERVAL = 1000; // Check every second

// State
let idleTimer = null;
let isIdle = false;
let lastActivity = Date.now();

// Elements that will be animated
let animatedElements = [];
const defaultAnimatedSelectors = ['.move-btn', '.player-choice', '.ai-choice'];

/**
 * Initialize the idle detection system
 */
export function init() {
    // Set up event listeners for user activity
    setupActivityListeners();
    
    // Start the idle check timer
    startIdleCheck();
}

/**
 * Set up event listeners to detect user activity
 */
function setupActivityListeners() {
    // Mouse movement
    document.addEventListener('mousemove', resetIdleTimer);
    
    // Clicks
    document.addEventListener('click', resetIdleTimer);
    
    // Key presses
    document.addEventListener('keydown', resetIdleTimer);
    
    // Touch events for mobile
    document.addEventListener('touchstart', resetIdleTimer);
    document.addEventListener('touchmove', resetIdleTimer);
}

/**
 * Start the idle check timer
 */
function startIdleCheck() {
    // Clear any existing timer
    if (idleTimer) {
        clearInterval(idleTimer);
    }
    
    // Set up a new timer to check for idle state
    idleTimer = setInterval(checkIdleState, IDLE_CHECK_INTERVAL);
}

/**
 * Reset the idle timer when activity is detected
 */
export function resetIdleTimer() {
    lastActivity = Date.now();
    
    // If we were idle, we're not anymore
    if (isIdle) {
        exitIdleState();
    }
}

/**
 * Check if the user is idle
 */
function checkIdleState() {
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivity;
    
    // If idle timeout reached and not already in idle state
    if (timeElapsed >= IDLE_TIMEOUT && !isIdle) {
        enterIdleState();
    }
}

/**
 * Enter the idle state
 */
function enterIdleState() {
    isIdle = true;
    
    // Find elements to animate
    findElementsToAnimate();
    
    // Add idle animations
    addIdleAnimations();
    
    // Start ambient sound if enabled
    const ambientEnabled = getData('ambientEnabled');
    if (ambientEnabled !== false) {
        sound.playAmbient();
    }
}

/**
 * Exit the idle state
 */
function exitIdleState() {
    isIdle = false;
    
    // Remove idle animations
    removeIdleAnimations();
    
    // Stop ambient sound
    sound.stopAmbient();
}

/**
 * Find elements to apply idle animations to
 */
function findElementsToAnimate() {
    // Reset the array
    animatedElements = [];
    
    // Get all relevant elements
    defaultAnimatedSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Only add visible elements
            if (element.offsetParent !== null) { // Check if element is visible
                animatedElements.push(element);
            }
        });
    });
    
    // Add the current section background
    const currentSection = document.querySelector('section:not(.hidden)');
    if (currentSection) {
        animatedElements.push(currentSection);
    }
}

/**
 * Add idle animations to elements
 */
function addIdleAnimations() {
    animatedElements.forEach((element, index) => {
        // Skip if already has idle animation
        if (element.classList.contains('idle-animation')) return;
        
        // Determine which animation to apply based on element type
        if (element.classList.contains('move-btn')) {
            element.classList.add('idle-animation', 'idle-pulse');
            
            // Stagger the animations
            element.style.animationDelay = `${index * 0.2}s`;
        } 
        else if (element.classList.contains('player-choice') || 
                 element.classList.contains('ai-choice')) {
            element.classList.add('idle-animation', 'idle-glow');
        }
        else if (element.tagName.toLowerCase() === 'section') {
            element.classList.add('idle-animation', 'idle-background');
        }
    });
    
    // Add idle class to body for potential global effects
    document.body.classList.add('idle');
}

/**
 * Remove idle animations from elements
 */
function removeIdleAnimations() {
    // Remove from tracked elements
    animatedElements.forEach(element => {
        element.classList.remove('idle-animation', 'idle-pulse', 'idle-glow', 'idle-background');
        element.style.animationDelay = '';
    });
    
    // Remove from all elements (in case we missed any)
    const allIdleElements = document.querySelectorAll('.idle-animation');
    allIdleElements.forEach(element => {
        element.classList.remove('idle-animation', 'idle-pulse', 'idle-glow', 'idle-background');
        element.style.animationDelay = '';
    });
    
    // Remove idle class from body
    document.body.classList.remove('idle');
    
    // Clear the array
    animatedElements = [];
}

/**
 * Cleanup function to stop idle detection
 */
export function cleanup() {
    // Clear the interval
    if (idleTimer) {
        clearInterval(idleTimer);
        idleTimer = null;
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', resetIdleTimer);
    document.removeEventListener('click', resetIdleTimer);
    document.removeEventListener('keydown', resetIdleTimer);
    document.removeEventListener('touchstart', resetIdleTimer);
    document.removeEventListener('touchmove', resetIdleTimer);
    
    // Make sure we exit idle state
    if (isIdle) {
        exitIdleState();
    }
}

export default {
    init,
    cleanup,
    resetIdleTimer
}; 