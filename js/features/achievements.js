/**
 * Achievements module for Rock Paper Battle
 * Handles tracking and unlocking achievements
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';

// Achievement definitions
const ACHIEVEMENTS = {
    winStreak3: {
        id: 'winStreak3',
        name: '3 Wins in a Row',
        description: 'Win 3 games in a row',
        icon: '🥉'
    },
    flawlessVictory: {
        id: 'flawlessVictory',
        name: 'Flawless Victory',
        description: 'Win all rounds in a Best of 5 match',
        icon: '🥇'
    },
    roundsPlayed10: {
        id: 'roundsPlayed10',
        name: '10 Total Rounds Played',
        description: 'Play 10 or more rounds',
        icon: '📊'
    }
};

// Current win streak tracker
let currentWinStreak = 0;

/**
 * Initialize the achievements system
 */
export function init() {
    // Initialize achievements in localStorage if they don't exist
    const achievements = getData('achievements');
    if (!achievements) {
        setData('achievements', {
            winStreak3: false,
            flawlessVictory: false,
            roundsPlayed10: false
        });
    }
    
    // Load current win streak from localStorage or start at 0
    currentWinStreak = getData('currentWinStreak') || 0;
}

/**
 * Update achievements based on game result
 * @param {string} result - The game result ('win', 'lose', or 'draw')
 * @param {Object} gameState - The current game state object
 * @param {string} gameMode - The current game mode ('endless' or 'bestOf5')
 */
export function checkAchievements(result, gameState = {}, gameMode = 'endless') {
    // Update win streak
    if (result === 'win') {
        currentWinStreak++;
    } else if (result === 'lose') {
        currentWinStreak = 0;
    }
    
    // Save current win streak
    setData('currentWinStreak', currentWinStreak);
    
    // Check for 3 wins in a row
    if (currentWinStreak >= 3) {
        unlockAchievement('winStreak3');
    }
    
    // Check for flawless victory in Best of 5
    if (gameMode === 'bestOf5' && gameState.gameOver && 
        gameState.playerScore >= 3 && gameState.aiScore === 0) {
        unlockAchievement('flawlessVictory');
    }
    
    // Check for 10 total rounds played
    const stats = getData('stats');
    const totalRounds = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);
    if (totalRounds >= 10) {
        unlockAchievement('roundsPlayed10');
    }
}

/**
 * Unlock an achievement and display a notification
 * @param {string} achievementId - The ID of the achievement to unlock
 */
function unlockAchievement(achievementId) {
    // Check if achievement exists
    if (!ACHIEVEMENTS[achievementId]) {
        console.error(`Achievement "${achievementId}" does not exist`);
        return;
    }
    
    // Get current achievements
    const achievements = getData('achievements');
    
    // Check if already unlocked
    if (achievements[achievementId]) {
        return; // Already unlocked
    }
    
    // Unlock the achievement
    achievements[achievementId] = true;
    setData('achievements', achievements);
    
    // Play achievement sound
    sound.play('win');
    
    // Display notification
    showAchievementNotification(ACHIEVEMENTS[achievementId]);
}

/**
 * Show a toast notification for unlocked achievement
 * @param {Object} achievement - The achievement object
 */
function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    // Create content
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <h3>Achievement Unlocked!</h3>
            <p class="achievement-name">${achievement.name}</p>
            <p class="achievement-description">${achievement.description}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add show class for animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after a delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

/**
 * Get all achievements with their unlock status
 * @returns {Array} Array of achievement objects with unlock status
 */
export function getAllAchievements() {
    const achievements = getData('achievements') || {};
    
    return Object.values(ACHIEVEMENTS).map(achievement => {
        return {
            ...achievement,
            unlocked: achievements[achievement.id] || false
        };
    });
}

/**
 * Reset all achievements
 */
export function resetAchievements() {
    setData('achievements', {
        winStreak3: false,
        flawlessVictory: false,
        roundsPlayed10: false
    });
    
    // Reset current win streak
    currentWinStreak = 0;
    setData('currentWinStreak', 0);
}

export default {
    init,
    checkAchievements,
    getAllAchievements,
    resetAchievements
}; 