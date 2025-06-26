/**
 * Storage module for Rock Paper Battle
 * Handles localStorage operations
 */

// Default game data structure
const DEFAULT_DATA = {
    name: "PlayerOne",
    avatar: "robot",
    theme: "day",
    soundEnabled: true,
    achievements: {
        winStreak3: false,
        flawlessVictory: false,
        roundsPlayed10: false
    },
    stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        longestWinStreak: 0,
        bestMode: ""
    },
    unlocks: {
        secretMoveUnlocked: false
    },
    aiMode: "random"
};

// Key used for localStorage
const STORAGE_KEY = 'rockPaperBattle';

/**
 * Get data from localStorage
 * @param {string} key - Optional specific key to retrieve from storage
 * @returns {Object} - The stored data or a specific value if key is provided
 */
export function getData(key = null) {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const data = storedData ? JSON.parse(storedData) : DEFAULT_DATA;
    
    // If no data exists yet, initialize it
    if (!storedData) {
        setData(data);
    }
    
    // Return specific key if requested
    if (key) {
        // Handle nested keys with dot notation (e.g., 'stats.wins')
        if (key.includes('.')) {
            const keys = key.split('.');
            let value = data;
            
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return null; // Key path doesn't exist
                }
            }
            
            return value;
        }
        
        return key in data ? data[key] : null;
    }
    
    return data;
}

/**
 * Save data to localStorage
 * @param {Object|string} dataOrKey - Data object to save or key to update
 * @param {*} value - Value to set if dataOrKey is a key string
 */
export function setData(dataOrKey, value = null) {
    // If first param is a string, update just that key
    if (typeof dataOrKey === 'string') {
        const data = getData();
        
        // Handle nested keys with dot notation
        if (dataOrKey.includes('.')) {
            const keys = dataOrKey.split('.');
            let currentObj = data;
            
            // Navigate to the right nested object
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!(key in currentObj)) {
                    currentObj[key] = {};
                }
                currentObj = currentObj[key];
            }
            
            // Set the value on the final key
            currentObj[keys[keys.length - 1]] = value;
        } else {
            // Simple key update
            data[dataOrKey] = value;
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
        // Save entire data object
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataOrKey));
    }
}

/**
 * Update stats in localStorage
 * @param {string} type - Type of stat to update ('wins', 'losses', or 'draws')
 * @param {number} amount - Amount to increment (default: 1)
 */
export function updateStat(type, amount = 1) {
    if (!['wins', 'losses', 'draws'].includes(type)) {
        console.error('Invalid stat type:', type);
        return;
    }
    
    const currentValue = getData(`stats.${type}`) || 0;
    setData(`stats.${type}`, currentValue + amount);
}

export default {
    getData,
    setData,
    updateStat
}; 