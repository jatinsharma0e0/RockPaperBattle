/**
 * Sound module for Rock Paper Battle
 * Handles sound effects and audio settings
 */

import { getData, setData } from '../settings/storage.js';

// Sound state
let soundEnabled = true;
let volume = 0.5;

// Audio elements cache
const audioCache = {};

/**
 * Initialize the sound system
 */
export function init() {
    // Load sound settings from localStorage
    const savedSoundEnabled = getData('soundEnabled');
    if (savedSoundEnabled !== null) {
        soundEnabled = savedSoundEnabled;
    }
    
    const savedVolume = getData('soundVolume');
    if (savedVolume !== null) {
        volume = savedVolume;
    }
    
    // Update the sound toggle button
    updateSoundToggleButton();
    
    // Preload common sounds
    preloadSound('click');
    preloadSound('win');
    preloadSound('lose');
    preloadSound('draw');
}

/**
 * Update the sound toggle button based on current state
 */
function updateSoundToggleButton() {
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        soundToggle.title = soundEnabled ? 'Sound On' : 'Sound Off';
    }
}

/**
 * Toggle sound on/off
 */
export function toggleSound() {
    soundEnabled = !soundEnabled;
    
    // Save to localStorage
    setData('soundEnabled', soundEnabled);
    
    // Update UI
    updateSoundToggleButton();
    
    // Play a sound if enabled
    if (soundEnabled) {
        play('click');
    }
}

/**
 * Set whether sound is enabled
 * @param {boolean} enabled - Whether sound should be enabled
 */
export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    
    // Save to localStorage
    setData('soundEnabled', soundEnabled);
    
    // Update UI
    updateSoundToggleButton();
}

/**
 * Check if sound is enabled
 * @returns {boolean} Whether sound is enabled
 */
export function isSoundEnabled() {
    return soundEnabled;
}

/**
 * Set the volume level
 * @param {number} level - Volume level between 0 and 1
 */
export function setVolume(level) {
    // Ensure volume is between 0 and 1
    volume = Math.max(0, Math.min(1, level));
    
    // Save to localStorage
    setData('soundVolume', volume);
}

/**
 * Get the current volume level
 * @returns {number} The current volume level between 0 and 1
 */
export function getVolume() {
    return volume;
}

/**
 * Preload a sound for faster playback
 * @param {string} soundName - The name of the sound to preload
 */
function preloadSound(soundName) {
    if (audioCache[soundName]) return;
    
    const audio = new Audio(`assets/audio/${soundName}.mp3`);
    audio.load();
    audioCache[soundName] = audio;
}

/**
 * Play a sound effect
 * @param {string} soundName - The name of the sound to play
 */
export function play(soundName) {
    if (!soundEnabled) return;
    
    try {
        let audio = audioCache[soundName];
        
        // If not cached, create a new audio element
        if (!audio) {
            audio = new Audio(`assets/audio/${soundName}.mp3`);
            audioCache[soundName] = audio;
        }
        
        // Reset the audio to the beginning if it's already playing
        audio.pause();
        audio.currentTime = 0;
        
        // Set the volume
        audio.volume = volume;
        
        // Play the sound
        audio.play().catch(error => {
            console.warn(`Failed to play sound "${soundName}":`, error);
        });
    } catch (error) {
        console.error(`Error playing sound "${soundName}":`, error);
    }
}

export default {
    init,
    toggleSound,
    setSoundEnabled,
    isSoundEnabled,
    setVolume,
    getVolume,
    play
}; 