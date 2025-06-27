/**
 * Data Manager for Rock Paper Battle
 * Handles data export, import, and validation
 */

import { getData, setData, clearAllData } from '../settings/storage.js';

// Schema version for data validation
const SCHEMA_VERSION = '1.0';

/**
 * Export all game data to a JSON file
 * @returns {boolean} Whether the export was successful
 */
export function exportGameData() {
    try {
        // Get all game data in a structured format
        const gameData = gatherGameData();
        
        // Add metadata
        gameData.metadata = {
            version: SCHEMA_VERSION,
            exportDate: new Date().toISOString(),
            game: 'RockPaperBattle'
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(gameData, null, 2);
        
        // Create a blob for better file handling
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a download link using URL.createObjectURL
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `rock-paper-battle-save-${formatDate(new Date())}.json`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Failed to export game data:', error);
        return false;
    }
}

/**
 * Gather game data into a structured format
 * @returns {Object} Structured game data
 */
function gatherGameData() {
    // Get the main data from storage
    const mainData = getData();
    
    // Structure the data into logical sections
    return {
        settings: {
            soundEnabled: mainData.soundEnabled || false,
            soundVolume: mainData.soundVolume || 0.5,
            ambientEnabled: mainData.ambientEnabled || false,
            ambientVolume: mainData.ambientVolume || 0.3,
            audioStyle: mainData.audioStyle || 'retro',
            theme: mainData.theme || 'day',
            highContrast: mainData.highContrast || false,
            reducedMotion: mainData.reducedMotion || false
        },
        profile: mainData.profile || {
            name: 'Player',
            avatar: '👤'
        },
        stats: mainData.stats || {
            wins: 0,
            losses: 0,
            draws: 0,
            longestWinStreak: 0,
            bestMode: ''
        },
        achievements: mainData.achievements || {},
        game: {
            currentWinStreak: mainData.currentWinStreak || 0,
            unlocks: mainData.unlocks || {},
            bonusRoundsEnabled: mainData.bonusRoundsEnabled || true,
            speedModeEnabled: mainData.speedModeEnabled || false
        },
        // Include any other game data that might be stored
        other: getAllOtherGameData()
    };
}

/**
 * Get any additional game data from localStorage that's not in the main data
 * @returns {Object} Additional game data
 */
function getAllOtherGameData() {
    const otherData = {};
    
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    
    // Filter keys that belong to our game but aren't in the main data structure
    keys.forEach(key => {
        if (key.startsWith('RockPaperBattle_') || key === 'hasRunBefore') {
            try {
                otherData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                otherData[key] = localStorage.getItem(key);
            }
        }
    });
    
    return otherData;
}

/**
 * Format a date for the filename
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Import game data from a JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Result of the import operation
 */
export function importGameData(file) {
    return new Promise((resolve, reject) => {
        // Check if file is provided
        if (!file) {
            reject({ success: false, message: 'No file provided' });
            return;
        }
        
        // Check file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            reject({ success: false, message: 'Invalid file type. Please select a JSON file' });
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                // Parse JSON data
                const importedData = JSON.parse(event.target.result);
                
                // Validate the imported data
                const validation = validateImportedData(importedData);
                if (!validation.valid) {
                    reject({ success: false, message: validation.message });
                    return;
                }
                
                // Clear existing data if needed
                if (confirm('This will replace your current game data. Continue?')) {
                    applyImportedData(importedData);
                    resolve({ 
                        success: true, 
                        message: 'Game data imported successfully!',
                        stats: countImportedItems(importedData)
                    });
                } else {
                    reject({ success: false, message: 'Import cancelled by user' });
                }
            } catch (error) {
                reject({ success: false, message: `Failed to import data: ${error.message}` });
            }
        };
        
        reader.onerror = () => {
            reject({ success: false, message: 'Error reading file' });
        };
        
        // Read the file
        reader.readAsText(file);
    });
}

/**
 * Validate the imported data
 * @param {Object} data - The imported data
 * @returns {Object} Validation result
 */
function validateImportedData(data) {
    // Check if data has metadata
    if (!data.metadata) {
        return { valid: false, message: 'Invalid save file: Missing metadata' };
    }
    
    // Check if it's from the right game
    if (data.metadata.game !== 'RockPaperBattle') {
        return { valid: false, message: 'Invalid save file: Not a Rock Paper Battle save file' };
    }
    
    // Check schema version
    const importedVersion = data.metadata.version || '0';
    if (!isCompatibleVersion(importedVersion)) {
        return { 
            valid: false, 
            message: `Incompatible save file version: ${importedVersion} (current: ${SCHEMA_VERSION})`
        };
    }
    
    // Check if the file has any game data (either in structured or legacy format)
    if (!data.settings && !data.profile && !data.stats && 
        !data.achievements && !data.game && !data.other && 
        Object.keys(data).length <= 1) { // Only metadata
        return {
            valid: false,
            message: 'Invalid save file: No game data found'
        };
    }
    
    return { valid: true };
}

/**
 * Check if the imported version is compatible with the current version
 * @param {string} importedVersion - The version from the imported data
 * @returns {boolean} Whether the versions are compatible
 */
function isCompatibleVersion(importedVersion) {
    // For now, we only check if major version matches
    const currentMajor = SCHEMA_VERSION.split('.')[0];
    const importedMajor = importedVersion.split('.')[0];
    
    return currentMajor === importedMajor;
}

/**
 * Apply imported data to localStorage
 * @param {Object} importedData - The validated imported data
 */
function applyImportedData(importedData) {
    // Remove metadata
    delete importedData.metadata;
    
    // Clear existing data
    clearAllData();
    
    // Check if the data is in the structured format
    if (importedData.settings || importedData.profile || importedData.stats) {
        // This is the new structured format
        const structuredData = {
            // Extract and merge all sections
            ...importedData.settings,
            profile: importedData.profile,
            stats: importedData.stats,
            achievements: importedData.achievements,
            unlocks: importedData.game?.unlocks,
            currentWinStreak: importedData.game?.currentWinStreak,
            bonusRoundsEnabled: importedData.game?.bonusRoundsEnabled,
            speedModeEnabled: importedData.game?.speedModeEnabled,
            // Add any other fields that should be in the main data structure
        };
        
        // Save the structured data
        Object.entries(structuredData).forEach(([key, value]) => {
            setData(key, value);
        });
        
        // Handle any additional data from the 'other' section
        if (importedData.other) {
            Object.entries(importedData.other).forEach(([key, value]) => {
                try {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                } catch (error) {
                    console.error(`Failed to import key ${key}:`, error);
                }
            });
        }
    } else {
        // Legacy format - apply directly to localStorage
        Object.entries(importedData).forEach(([key, value]) => {
            try {
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            } catch (error) {
                console.error(`Failed to import key ${key}:`, error);
            }
        });
    }
}

/**
 * Count the items in the imported data
 * @param {Object} importedData - The imported data
 * @returns {Object} Statistical information about the imported data
 */
function countImportedItems(importedData) {
    // Count statistics, achievements, etc.
    const stats = {
        totalItems: 0,
        achievements: 0,
        stats: false,
        profile: false
    };
    
    // Check if using new structured format
    if (importedData.settings || importedData.profile || importedData.stats) {
        // Count structured items
        stats.totalItems = Object.keys(importedData).length - 1; // Exclude metadata
        
        // Check for achievements
        if (importedData.achievements) {
            stats.achievements = Object.values(importedData.achievements)
                .filter(a => a === true || a.unlocked === true).length;
        }
        
        // Check for game stats
        if (importedData.stats) {
            stats.stats = true;
        }
        
        // Check for profile data
        if (importedData.profile) {
            stats.profile = true;
        }
    } else {
        // Legacy format
        stats.totalItems = Object.keys(importedData).length - 1; // Exclude metadata
        
        // Check for achievements
        if (importedData.RockPaperBattle_achievements) {
            const achievementData = importedData.RockPaperBattle_achievements;
            stats.achievements = Object.values(achievementData).filter(a => a.unlocked).length;
        }
        
        // Check for game stats
        if (importedData.RockPaperBattle_stats) {
            stats.stats = true;
        }
        
        // Check for profile data
        if (importedData.RockPaperBattle_profile) {
            stats.profile = true;
        }
    }
    
    return stats;
}

export default {
    exportGameData,
    importGameData
}; 