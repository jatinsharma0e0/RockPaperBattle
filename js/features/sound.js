/**
 * Sound module for Rock Paper Battle
 * Handles sound effects and music
 */

import { getData, setData } from '../settings/storage.js';
import * as preloader from '../utils/preloader.js';

// Configuration
const SOUNDS = {
    click: 'click.wav',
    win: 'win.wav',
    lose: 'lose.wav',
    draw: 'draw.wav',
    gameStart: 'gameStart.wav',
    gameWin: 'gameWin.wav',
    gameLose: 'gameLose.wav',
    gameDraw: 'gameDraw.wav',
    countdown: 'countdown.wav',
    tick: 'tick.wav',
    timeUp: 'timeUp.wav',
    bonusRound: 'bonusRound.wav',
    chaos: 'chaos.wav',
};

const AMBIENT_SOUNDS = {
    wind: 'wind.wav',
    hum: 'hum.wav',
    lofi: 'lo-fi-loop.wav'
};

// State
let soundEnabled = true;
let ambientEnabled = true;
let volume = 0.5;
let ambientVolume = 0.3;
let currentAmbient = null;
let audioStyle = 'retro'; // Default audio style

/**
 * Initialize sound settings
 */
export function init() {
    // Load settings from localStorage
    soundEnabled = getData('soundEnabled') !== false; // Default to true
    ambientEnabled = getData('ambientEnabled') !== false; // Default to true
    
    // Get audio style setting
    audioStyle = getData('audioStyle') || 'retro';
    
    // Get volume settings
    const savedVolume = getData('soundVolume');
    if (savedVolume !== undefined) {
        volume = savedVolume;
    }
    
    const savedAmbientVolume = getData('ambientVolume');
    if (savedAmbientVolume !== undefined) {
        ambientVolume = savedAmbientVolume;
    }
    
    // Update sound button state
    updateSoundButtonState();
}

/**
 * Update the sound button appearance based on current state
 */
function updateSoundButtonState() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (soundToggleBtn) {
        soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
        soundToggleBtn.title = soundEnabled ? 'Sound On (Click to Mute)' : 'Sound Off (Click to Unmute)';
    }
}

/**
 * Play a sound effect
 * @param {string} soundName - The name of the sound to play
 */
export function play(soundName) {
    if (!soundEnabled) return;
    
    const soundFile = SOUNDS[soundName];
    if (!soundFile) return;
    
    // Try to get from preloaded cache first
    let audio;
    if (preloader.isAudioCached(soundName)) {
        audio = preloader.getAudio(soundName);
        if (audio) {
            audio = audio.cloneNode();
        }
    }
    
    // Fall back to creating new Audio
    if (!audio) {
        audio = new Audio(`./audio/${audioStyle}/${soundFile}`);
    }
    
    audio.volume = volume;
    audio.play().catch(e => console.warn('Error playing sound:', e));
}

/**
 * Play ambient sound
 * @param {string} ambientName - Optional name of ambient sound to play
 */
export function playAmbient(ambientName = 'lofi') {
    if (!ambientEnabled) return;
    
    // Stop any currently playing ambient sound
    stopAmbient();
    
    const soundFile = AMBIENT_SOUNDS[ambientName];
    if (!soundFile) return;
    
    // Try to get from preloaded cache first
    if (preloader.isAudioCached(ambientName, true)) {
        currentAmbient = preloader.getAudio(ambientName, true);
    } else {
        // Fall back to creating new Audio
        currentAmbient = new Audio(`./audio/${audioStyle}/ambient/${soundFile}`);
    }
    
    if (currentAmbient) {
        currentAmbient.volume = ambientVolume;
        currentAmbient.loop = true;
        currentAmbient.play().catch(e => console.warn('Error playing ambient sound:', e));
    }
}

/**
 * Stop the ambient sound
 */
export function stopAmbient() {
    if (currentAmbient) {
        currentAmbient.pause();
        currentAmbient.currentTime = 0;
        currentAmbient = null;
    }
}

/**
 * Toggle sound on/off
 */
export function toggleSound() {
    soundEnabled = !soundEnabled;
    setData('soundEnabled', soundEnabled);
    updateSoundButtonState();
    
    if (soundEnabled) {
        play('click');
    }
}

/**
 * Set sound enabled/disabled
 * @param {boolean} enabled - Whether sound should be enabled
 */
export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    setData('soundEnabled', enabled);
    updateSoundButtonState();
}

/**
 * Check if sound is enabled
 * @returns {boolean} Whether sound is enabled
 */
export function isSoundEnabled() {
    return soundEnabled;
}

/**
 * Set ambient sound enabled/disabled
 * @param {boolean} enabled - Whether ambient sound should be enabled
 */
export function setAmbientEnabled(enabled) {
    ambientEnabled = enabled;
    setData('ambientEnabled', enabled);
    
    if (!enabled) {
        stopAmbient();
    }
}

/**
 * Check if ambient sound is enabled
 * @returns {boolean} Whether ambient sound is enabled
 */
export function isAmbientEnabled() {
    return ambientEnabled;
}

/**
 * Set the volume level
 * @param {number} level - Volume level (0.0 to 1.0)
 */
export function setVolume(level) {
    volume = Math.max(0, Math.min(1, level));
    setData('soundVolume', volume);
}

/**
 * Get current volume level
 * @returns {number} Current volume level (0.0 to 1.0)
 */
export function getVolume() {
    return volume;
}

/**
 * Set the ambient volume level
 * @param {number} level - Volume level (0.0 to 1.0)
 */
export function setAmbientVolume(level) {
    ambientVolume = Math.max(0, Math.min(1, level));
    setData('ambientVolume', ambientVolume);
    
    if (currentAmbient) {
        currentAmbient.volume = ambientVolume;
    }
}

/**
 * Get current ambient volume level
 * @returns {number} Current ambient volume level (0.0 to 1.0)
 */
export function getAmbientVolume() {
    return ambientVolume;
}

/**
 * Set audio style (modern or retro)
 * @param {string} style - The audio style ('modern' or 'retro')
 */
export function setAudioStyle(style) {
    if (style !== 'modern' && style !== 'retro') {
        return;
    }
    
    audioStyle = style;
    setData('audioStyle', audioStyle);
    
    // Reload audio assets
    preloader.reloadAudioAssets();
}

/**
 * Get current audio style
 * @returns {string} Current audio style ('modern' or 'retro')
 */
export function getAudioStyle() {
    return audioStyle;
}

export default {
    init,
    play,
    playAmbient,
    stopAmbient,
    toggleSound,
    setSoundEnabled,
    isSoundEnabled,
    setAmbientEnabled,
    isAmbientEnabled,
    setVolume,
    getVolume,
    setAmbientVolume,
    getAmbientVolume,
    setAudioStyle,
    getAudioStyle
}; 