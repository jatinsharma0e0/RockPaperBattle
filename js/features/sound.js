/**
 * Sound module for Rock Paper Battle
 * Handles sound effects and sound toggling
 */

import { getData, setData } from '../settings/storage.js';

// Sound file paths
const SOUNDS = {
    click: 'assets/audio/click.mp3',
    win: 'assets/audio/win.mp3',
    lose: 'assets/audio/lose.mp3',
    draw: 'assets/audio/draw.mp3',
    gameStart: 'assets/audio/game-start.mp3',
    gameWin: 'assets/audio/game-win.mp3',
    gameLose: 'assets/audio/game-lose.mp3',
    gameDraw: 'assets/audio/game-draw.mp3'
};

// Audio elements cache
const audioElements = {};

/**
 * Initializes the sound system
 */
export function init() {
    // Preload audio files
    preloadSounds();
    
    // Set up sound toggle button
    setupSoundToggle();
}

/**
 * Preloads sound files for faster playback
 */
function preloadSounds() {
    for (const [key, path] of Object.entries(SOUNDS)) {
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        audioElements[key] = audio;
    }
}

/**
 * Sets up the sound toggle button
 */
function setupSoundToggle() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (!soundToggleBtn) return;
    
    // Set initial state
    updateSoundToggleButton();
    
    // Add click event
    soundToggleBtn.addEventListener('click', toggleSound);
}

/**
 * Updates the sound toggle button appearance based on current state
 */
export function updateSoundToggleButton() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (!soundToggleBtn) return;
    
    const soundEnabled = getData('soundEnabled');
    
    // Update button text/icon
    if (soundEnabled) {
        soundToggleBtn.innerHTML = '🔊';
        soundToggleBtn.setAttribute('title', 'Sound On');
    } else {
        soundToggleBtn.innerHTML = '🔇';
        soundToggleBtn.setAttribute('title', 'Sound Off');
    }
}

/**
 * Toggles sound on/off
 */
export function toggleSound() {
    const currentState = getData('soundEnabled');
    const newState = !currentState;
    
    // Update localStorage
    setData('soundEnabled', newState);
    
    // Update button
    updateSoundToggleButton();
    
    // Play feedback sound if turning on
    if (newState) {
        play('click');
    }
}

/**
 * Plays a sound effect
 * @param {string} soundName - The name of the sound to play
 */
export function play(soundName) {
    // Check if sound is enabled
    const soundEnabled = getData('soundEnabled');
    if (!soundEnabled) return;
    
    // Check if sound exists
    if (!audioElements[soundName]) {
        console.error(`Sound "${soundName}" not found`);
        return;
    }
    
    try {
        // Clone the audio to allow overlapping sounds
        const soundToPlay = audioElements[soundName].cloneNode();
        soundToPlay.volume = 0.5; // Set volume to 50%
        soundToPlay.play();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

export default {
    init,
    play,
    toggleSound,
    updateSoundToggleButton
}; 