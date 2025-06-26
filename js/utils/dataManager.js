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
        // Get all game data
        const gameData = getAllGameData();
        
        // Add metadata
        gameData.metadata = {
            version: SCHEMA_VERSION,
            exportDate: new Date().toISOString(),
            game: 'RockPaperBattle'
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(gameData, null, 2);
        
        // Create a data URL
        const dataUrl = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUrl);
        downloadLink.setAttribute('download', `rock-paper-battle-save-${formatDate(new Date())}.json`);
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        return true;
    } catch (error) {
        console.error('Failed to export game data:', error);
        return false;
    }
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
 * Get all game data from localStorage
 * @returns {Object} All game data
 */
function getAllGameData() {
    const data = {};
    
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    
    // Filter keys that belong to our game
    keys.forEach(key => {
        if (key.startsWith('RockPaperBattle_') || key === 'hasRunBefore') {
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                data[key] = localStorage.getItem(key);
            }
        }
    });
    
    return data;
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
    
    // Apply imported data
    Object.entries(importedData).forEach(([key, value]) => {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to import key ${key}:`, error);
        }
    });
}

/**
 * Count the items in the imported data
 * @param {Object} importedData - The imported data
 * @returns {Object} Statistical information about the imported data
 */
function countImportedItems(importedData) {
    // Count statistics, achievements, etc.
    const stats = {
        totalItems: Object.keys(importedData).length - 1, // Exclude metadata
        achievements: 0,
        stats: false,
        profile: false
    };
    
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
    
    return stats;
}

export default {
    exportGameData,
    importGameData
}; 