/**
 * Avatar module for Rock Paper Battle
 * Handles player profile and avatar selection
 */

import { getData, setData } from '../settings/storage.js';
import * as sound from './sound.js';

// Default profile
const DEFAULT_PROFILE = {
    name: 'Player',
    avatar: '👤'
};

// Current profile
let currentProfile = { ...DEFAULT_PROFILE };

/**
 * Initialize the avatar system
 */
export function init() {
    // Load profile from localStorage
    const savedProfile = getData('profile');
    if (savedProfile) {
        currentProfile = savedProfile;
    } else {
        // Save default profile if none exists
        setData('profile', DEFAULT_PROFILE);
    }
    
    // Update UI with profile info
    updateProfileDisplay();
}

/**
 * Set up avatar selector event listeners
 */
export function setupAvatarSelectors() {
    // Get all avatar option elements
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    // Add click event listeners
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            const avatar = option.getAttribute('data-avatar');
            if (avatar) {
                selectAvatar(avatar);
                updateActiveAvatarOption(avatar);
                sound.play('click');
            }
        });
    });
    
    // Set up name input
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
        nameInput.value = currentProfile.name;
    }
    
    // Set up save button
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfile);
    }
    
    // Mark the current avatar as active
    updateActiveAvatarOption(currentProfile.avatar);
}

/**
 * Update the active avatar option in the UI
 * @param {string} avatar - The avatar to mark as active
 */
function updateActiveAvatarOption(avatar) {
    // Remove selected class from all options
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to the selected avatar
    const activeOption = document.querySelector(`.avatar-option[data-avatar="${avatar}"]`);
    if (activeOption) {
        activeOption.classList.add('selected');
        activeOption.classList.add('avatar-highlight');
        
        // Remove highlight animation after it completes
        setTimeout(() => {
            activeOption.classList.remove('avatar-highlight');
        }, 500);
    }
}

/**
 * Select an avatar
 * @param {string} avatar - The avatar emoji to select
 */
function selectAvatar(avatar) {
    currentProfile.avatar = avatar;
}

/**
 * Save the profile
 */
function saveProfile() {
    // Get name from input
    const nameInput = document.getElementById('player-name-input');
    if (nameInput && nameInput.value.trim()) {
        currentProfile.name = nameInput.value.trim();
    }
    
    // Save to localStorage
    setData('profile', currentProfile);
    
    // Update UI
    updateProfileDisplay();
    
    // Play sound
    sound.play('win');
    
    // Show success message
    showSaveSuccess();
}

/**
 * Show a success message when profile is saved
 */
function showSaveSuccess() {
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.disabled = true;
        
        // Restore original text after delay
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }, 1500);
    }
}

/**
 * Update all UI elements that display profile info
 */
function updateProfileDisplay() {
    // Update landing page profile
    const playerAvatar = document.getElementById('player-avatar');
    const playerName = document.getElementById('player-name');
    
    if (playerAvatar) playerAvatar.textContent = currentProfile.avatar;
    if (playerName) playerName.textContent = currentProfile.name;
    
    // Update game screen profile
    const gamePlayerAvatar = document.getElementById('game-player-avatar');
    const gamePlayerName = document.getElementById('game-player-name');
    
    if (gamePlayerAvatar) gamePlayerAvatar.textContent = currentProfile.avatar;
    if (gamePlayerName) gamePlayerName.textContent = currentProfile.name;
}

/**
 * Get the current profile
 * @returns {Object} The current profile
 */
export function getCurrentProfile() {
    return { ...currentProfile };
}

/**
 * Reset the profile to default
 */
export function resetProfile() {
    currentProfile = { ...DEFAULT_PROFILE };
    setData('profile', currentProfile);
    updateProfileDisplay();
}

export default {
    init,
    setupAvatarSelectors,
    getCurrentProfile,
    resetProfile
}; 