/**
 * Stats module for Rock Paper Battle
 * Handles displaying statistics and tracking records
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';

/**
 * Initialize the stats system
 */
export function init() {
    // Initialize stats in localStorage if they don't exist
    const stats = getData('stats');
    if (!stats) {
        setData('stats', {
            wins: 0,
            losses: 0,
            draws: 0,
            longestWinStreak: 0,
            bestMode: ''
        });
    }
}

/**
 * Update the longest win streak if the current streak is longer
 * @param {number} currentStreak - The current win streak
 */
export function updateLongestWinStreak(currentStreak) {
    const stats = getData('stats');
    if (currentStreak > stats.longestWinStreak) {
        stats.longestWinStreak = currentStreak;
        setData('stats', stats);
    }
}

/**
 * Update the most played mode based on total rounds
 * @param {string} mode - The game mode played
 */
export function updateBestMode(mode) {
    // Currently just tracks the last mode played
    // In the future could track counts for each mode
    const stats = getData('stats');
    stats.bestMode = mode;
    setData('stats', stats);
}

/**
 * Render the stats on the stats screen
 */
export function renderStats() {
    const stats = getData('stats') || {
        wins: 0,
        losses: 0,
        draws: 0,
        longestWinStreak: 0,
        bestMode: 'None'
    };
    
    // Get elements
    const winsElement = document.getElementById('stats-wins');
    const lossesElement = document.getElementById('stats-losses');
    const drawsElement = document.getElementById('stats-draws');
    const streakElement = document.getElementById('stats-streak');
    const bestModeElement = document.getElementById('stats-best-mode');
    
    const winRateElement = document.getElementById('stats-win-rate');
    const totalGamesElement = document.getElementById('stats-total-games');
    
    // Update text content
    if (winsElement) winsElement.textContent = stats.wins;
    if (lossesElement) lossesElement.textContent = stats.losses;
    if (drawsElement) drawsElement.textContent = stats.draws;
    if (streakElement) streakElement.textContent = stats.longestWinStreak;
    if (bestModeElement) bestModeElement.textContent = stats.bestMode || 'None';
    
    // Calculate additional stats
    const totalGames = stats.wins + stats.losses + stats.draws;
    const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
    
    if (winRateElement) winRateElement.textContent = `${winRate}%`;
    if (totalGamesElement) totalGamesElement.textContent = totalGames;
    
    // Update progress bars
    updateStatBars(stats, totalGames);
}

/**
 * Update the visual progress bars in the stats screen
 * @param {Object} stats - The stats object
 * @param {number} totalGames - Total games played
 */
function updateStatBars(stats, totalGames) {
    // Get bar elements
    const winsBar = document.getElementById('stats-wins-bar');
    const lossesBar = document.getElementById('stats-losses-bar');
    const drawsBar = document.getElementById('stats-draws-bar');
    
    if (!winsBar || !lossesBar || !drawsBar) return;
    
    // Calculate percentages (minimum 2% for visibility even at zero)
    const winsPercent = totalGames > 0 ? Math.max(2, (stats.wins / totalGames) * 100) : 2;
    const lossesPercent = totalGames > 0 ? Math.max(2, (stats.losses / totalGames) * 100) : 2;
    const drawsPercent = totalGames > 0 ? Math.max(2, (stats.draws / totalGames) * 100) : 2;
    
    // Update bar widths
    winsBar.style.width = `${winsPercent}%`;
    lossesBar.style.width = `${lossesPercent}%`;
    drawsBar.style.width = `${drawsPercent}%`;
}

/**
 * Reset all stats
 */
export function resetStats() {
    // Reset stats in localStorage
    setData('stats', {
        wins: 0,
        losses: 0,
        draws: 0,
        longestWinStreak: 0,
        bestMode: ''
    });
    
    // Re-render stats
    renderStats();
    
    // Play sound
    sound.play('click');
}

/**
 * Show the stats screen
 */
export function showStats() {
    // Hide all sections
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    // Show stats screen
    const statsScreen = document.getElementById('stats-screen');
    statsScreen.classList.remove('hidden');
    
    // Render stats
    renderStats();
    
    // Play sound
    sound.play('click');
}

/**
 * Hide the stats screen and return to the landing page
 */
export function hideStats() {
    // Hide stats screen
    document.getElementById('stats-screen').classList.add('hidden');
    
    // Show landing page
    document.getElementById('landing-page').classList.remove('hidden');
    
    // Play sound
    sound.play('click');
}

export default {
    init,
    updateLongestWinStreak,
    updateBestMode,
    renderStats,
    resetStats,
    showStats,
    hideStats
}; 