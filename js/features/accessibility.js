/**
 * Accessibility module for Rock Paper Battle
 * Handles high contrast mode, reduced motion, and other accessibility features
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';

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
    
    // Log initial state
    console.log('Accessibility initialized:', {
        highContrast: isHighContrastEnabled,
        reducedMotion: isReducedMotionEnabled
    });
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
        
        // Single event handler for the checkbox
        highContrastToggle.addEventListener('change', (e) => {
            // Stop propagation to prevent parent click handler from firing
            e.stopPropagation();
            toggleHighContrast();
        });
        
        // Add click event listener to the parent toggle switch (for better touch/click support)
        const toggleParent = highContrastToggle.parentElement;
        if (toggleParent && toggleParent.classList.contains('toggle-switch')) {
            toggleParent.addEventListener('click', (e) => {
                // Only toggle if the click wasn't on the checkbox itself
                // This prevents double-toggling since the checkbox has its own change event
                if (e.target !== highContrastToggle) {
                    e.preventDefault(); // Prevent default to avoid any other handlers
                    e.stopPropagation(); // Stop event from bubbling up
                    
                    // Manually toggle the checkbox state
                    highContrastToggle.checked = !highContrastToggle.checked;
                    toggleHighContrast();
                }
            });
        }
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
        reducedMotionToggle.checked = isReducedMotionEnabled;
        
        // Single event handler for the checkbox
        reducedMotionToggle.addEventListener('change', (e) => {
            // Stop propagation to prevent parent click handler from firing
            e.stopPropagation();
            toggleReducedMotion();
        });
        
        // Add click event listener to the parent toggle switch (for better touch/click support)
        const toggleParent = reducedMotionToggle.parentElement;
        if (toggleParent && toggleParent.classList.contains('toggle-switch')) {
            toggleParent.addEventListener('click', (e) => {
                // Only toggle if the click wasn't on the checkbox itself
                if (e.target !== reducedMotionToggle) {
                    e.preventDefault(); // Prevent default to avoid any other handlers
                    e.stopPropagation(); // Stop event from bubbling up
                    
                    // Manually toggle the checkbox state
                    reducedMotionToggle.checked = !reducedMotionToggle.checked;
                    toggleReducedMotion();
                }
            });
        }
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
    // Use requestAnimationFrame to ensure DOM updates are synchronized
    requestAnimationFrame(() => {
        // Apply high contrast
        if (isHighContrastEnabled) {
            document.body.classList.add(HIGH_CONTRAST_CLASS);
            console.log('Applied high contrast class to body');
        } else {
            document.body.classList.remove(HIGH_CONTRAST_CLASS);
            console.log('Removed high contrast class from body');
        }
        
        // Apply reduced motion
        if (isReducedMotionEnabled) {
            document.body.classList.add(REDUCED_MOTION_CLASS);
        } else {
            document.body.classList.remove(REDUCED_MOTION_CLASS);
        }
        
        // Log current state for debugging
        console.log('Current accessibility settings:', {
            highContrast: isHighContrastEnabled,
            reducedMotion: isReducedMotionEnabled,
            bodyClasses: document.body.className
        });
    });
}

/**
 * Toggle high contrast mode
 * @returns {boolean} The new state
 */
export function toggleHighContrast() {
    isHighContrastEnabled = !isHighContrastEnabled;
    setData('highContrast', isHighContrastEnabled);
    applyAccessibilitySettings();
    
    console.log('High contrast toggled to:', isHighContrastEnabled);
    
    // Update toggle if it exists
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
        highContrastToggle.checked = isHighContrastEnabled;
    }
    
    // Play sound
    if (sound && sound.play) {
        sound.play('click');
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
    
    // Play sound
    if (sound && sound.play) {
        sound.play('click');
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