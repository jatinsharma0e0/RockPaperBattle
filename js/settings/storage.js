/**
 * Storage module for Rock Paper Battle
 * Handles localStorage operations
 */

// Local storage key
const STORAGE_KEY = 'rock-paper-battle';

// Default data structure
const DEFAULT_DATA = {
    theme: 'day',
    soundEnabled: true,
    soundVolume: 0.5,
    stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        longestWinStreak: 0,
        bestMode: ''
    },
    achievements: {
        winStreak3: false,
        flawlessVictory: false,
        roundsPlayed10: false
    },
    profile: {
        name: 'Player',
        avatar: '👤'
    },
    unlocks: {
        secretMoveUnlocked: false,
        secretMoveRevealed: false
    },
    currentWinStreak: 0
};

// Cache for data
let dataCache = null;

/**
 * Get all game data from localStorage
 * @returns {Object} The game data
 */
export function getData(key = null) {
    if (!dataCache) {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            dataCache = storedData ? JSON.parse(storedData) : { ...DEFAULT_DATA };
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            dataCache = { ...DEFAULT_DATA };
        }
    }
    
    // Return specific key or all data
    if (key) {
        return dataCache[key];
    }
    
    return dataCache;
}

/**
 * Save data to localStorage
 * @param {string} key - The key to save under
 * @param {*} value - The value to save
 */
export function setData(key, value) {
    // Get current data
    const data = getData();
    
    // Update data
    data[key] = value;
    
    // Save to localStorage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // Update cache
        dataCache = data;
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

/**
 * Update a specific stat
 * @param {string} statName - The name of the stat to update ('wins', 'losses', or 'draws')
 */
export function updateStat(statName) {
    if (!['wins', 'losses', 'draws'].includes(statName)) {
        console.error(`Invalid stat name: ${statName}`);
        return;
    }
    
    // Get current stats
    const stats = getData('stats') || {};
    
    // Increment the stat
    stats[statName] = (stats[statName] || 0) + 1;
    
    // Save updated stats
    setData('stats', stats);
}

/**
 * Clear all game data from localStorage
 */
export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        dataCache = { ...DEFAULT_DATA };
    } catch (error) {
        console.error('Error clearing data from localStorage:', error);
    }
}

export default {
    getData,
    setData,
    updateStat,
    clearAllData
}; 