/**
 * Theme module for Rock Paper Battle
 * Handles theme switching and management
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';

// Available themes
const THEMES = ['day', 'night', 'retro', 'neon'];

// Current theme
let currentTheme = 'day';

/**
 * Initialize the theme system
 */
export function init() {
    // Load theme from localStorage
    const savedTheme = getData('theme');
    if (savedTheme && THEMES.includes(savedTheme)) {
        currentTheme = savedTheme;
    }
    
    // Apply the theme
    applyTheme(currentTheme);
}

/**
 * Set up theme selector event listeners
 */
export function setupThemeSelectors() {
    // Get all theme option elements
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Add click event listeners
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            if (theme && THEMES.includes(theme)) {
                setTheme(theme);
                updateActiveThemeOption(theme);
                sound.play('click');
            }
        });
    });
    
    // Mark the current theme as active
    updateActiveThemeOption(currentTheme);
}

/**
 * Update the active theme option in the UI
 * @param {string} theme - The theme to mark as active
 */
function updateActiveThemeOption(theme) {
    // Remove active class from all options
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to the selected theme
    const activeOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
}

/**
 * Set the theme
 * @param {string} theme - The theme to set
 */
export function setTheme(theme) {
    if (!THEMES.includes(theme)) {
        console.error(`Theme "${theme}" is not valid`);
        return;
    }
    
    // Update current theme
    currentTheme = theme;
    
    // Save to localStorage
    setData('theme', theme);
    
    // Apply the theme
    applyTheme(theme);
}

/**
 * Apply the theme to the document
 * @param {string} theme - The theme to apply
 */
function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove(...THEMES.map(t => `theme-${t}`));
    
    // Add the new theme class
    document.body.classList.add(`theme-${theme}`);
}

/**
 * Get the current theme
 * @returns {string} The current theme
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Toggle between day and night themes
 * Legacy support for the old theme toggle
 */
export function toggleDayNight() {
    const newTheme = currentTheme === 'day' ? 'night' : 'day';
    setTheme(newTheme);
    sound.play('click');
}

export default {
    init,
    setTheme,
    getCurrentTheme,
    setupThemeSelectors,
    toggleDayNight
}; 