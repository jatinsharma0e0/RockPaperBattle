/**
 * Accessibility module for Rock Paper Battle
 * Handles high contrast mode, reduced motion, and other accessibility features
 */

import { getData, setData } from '../settings/storage.js';

// Configuration
const HIGH_CONTRAST_CLASS = 'high-contrast';
const REDUCED_MOTION_CLASS = 'reduced-motion';

// State
let isHighContrastEnabled = false;
let isReducedMotionEnabled = false;

/**
 * Initialize the accessibility features
 */
export function init() {
    // Check user's prefers-reduced-motion setting
    checkSystemPreferences();
    
    // Load saved settings
    loadSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply initial settings
    applyAccessibilitySettings();
}

/**
 * Check user's system preferences for accessibility
 */
function checkSystemPreferences() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        isReducedMotionEnabled = true;
        setData('reducedMotion', true);
    }
    
    // Check if user prefers high contrast
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    if (prefersHighContrast) {
        isHighContrastEnabled = true;
        setData('highContrast', true);
    }
}

/**
 * Load accessibility settings from storage
 */
function loadSettings() {
    // Load high contrast setting
    const highContrast = getData('highContrast');
    if (highContrast !== undefined) {
        isHighContrastEnabled = highContrast;
    }
    
    // Load reduced motion setting
    const reducedMotion = getData('reducedMotion');
    if (reducedMotion !== undefined) {
        isReducedMotionEnabled = reducedMotion;
    }
}

/**
 * Set up event listeners for accessibility controls
 */
function setupEventListeners() {
    // High contrast toggle
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
        highContrastToggle.checked = isHighContrastEnabled;
        highContrastToggle.addEventListener('change', () => {
            toggleHighContrast();
        });
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
        reducedMotionToggle.checked = isReducedMotionEnabled;
        reducedMotionToggle.addEventListener('change', () => {
            toggleReducedMotion();
        });
    }
    
    // Listen for system preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
            enableReducedMotion(true);
        }
    });
    
    window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
        if (e.matches) {
            enableHighContrast(true);
        }
    });
}

/**
 * Apply accessibility settings to the document
 */
function applyAccessibilitySettings() {
    // Apply high contrast
    if (isHighContrastEnabled) {
        document.body.classList.add(HIGH_CONTRAST_CLASS);
    } else {
        document.body.classList.remove(HIGH_CONTRAST_CLASS);
    }
    
    // Apply reduced motion
    if (isReducedMotionEnabled) {
        document.body.classList.add(REDUCED_MOTION_CLASS);
    } else {
        document.body.classList.remove(REDUCED_MOTION_CLASS);
    }
}

/**
 * Toggle high contrast mode
 * @returns {boolean} The new state
 */
export function toggleHighContrast() {
    isHighContrastEnabled = !isHighContrastEnabled;
    setData('highContrast', isHighContrastEnabled);
    applyAccessibilitySettings();
    
    // Update toggle if it exists
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
        highContrastToggle.checked = isHighContrastEnabled;
    }
    
    return isHighContrastEnabled;
}

/**
 * Toggle reduced motion mode
 * @returns {boolean} The new state
 */
export function toggleReducedMotion() {
    isReducedMotionEnabled = !isReducedMotionEnabled;
    setData('reducedMotion', isReducedMotionEnabled);
    applyAccessibilitySettings();
    
    // Update toggle if it exists
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
        reducedMotionToggle.checked = isReducedMotionEnabled;
    }
    
    return isReducedMotionEnabled;
}

/**
 * Enable or disable high contrast mode
 * @param {boolean} enable - Whether to enable high contrast
 */
export function enableHighContrast(enable) {
    isHighContrastEnabled = enable;
    setData('highContrast', enable);
    applyAccessibilitySettings();
    
    // Update toggle if it exists
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
        highContrastToggle.checked = enable;
    }
}

/**
 * Enable or disable reduced motion mode
 * @param {boolean} enable - Whether to enable reduced motion
 */
export function enableReducedMotion(enable) {
    isReducedMotionEnabled = enable;
    setData('reducedMotion', enable);
    applyAccessibilitySettings();
    
    // Update toggle if it exists
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
        reducedMotionToggle.checked = enable;
    }
}

/**
 * Check if high contrast mode is enabled
 * @returns {boolean} Whether high contrast is enabled
 */
export function isHighContrast() {
    return isHighContrastEnabled;
}

/**
 * Check if reduced motion mode is enabled
 * @returns {boolean} Whether reduced motion is enabled
 */
export function isReducedMotion() {
    return isReducedMotionEnabled;
}

export default {
    init,
    toggleHighContrast,
    toggleReducedMotion,
    enableHighContrast,
    enableReducedMotion,
    isHighContrast,
    isReducedMotion
}; 