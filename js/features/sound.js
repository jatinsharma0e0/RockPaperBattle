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

// Audio caches for both styles
const retroSounds = {};
const modernSounds = {};
const retroAmbient = {};
const modernAmbient = {};

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
    if (savedVolume !== undefined && savedVolume !== null) {
        volume = parseFloat(savedVolume);
    }
    
    const savedAmbientVolume = getData('ambientVolume');
    if (savedAmbientVolume !== undefined && savedAmbientVolume !== null) {
        ambientVolume = parseFloat(savedAmbientVolume);
    }
    
    // Update sound button state
    updateSoundButtonState();
    
    // Preload all sounds for both styles to eliminate delay
    preloadAllSounds();
    
    // Start ambient sound if enabled AND global sound is enabled
    if (soundEnabled && ambientEnabled) {
        // Small delay to avoid audio conflicts during page load
        setTimeout(() => {
            playAmbient();
        }, 1000);
    }
    
    console.log('Sound settings initialized:', { 
        soundEnabled, 
        ambientEnabled, 
        volume, 
        ambientVolume, 
        audioStyle 
    });
}

/**
 * Preload all sounds for both retro and modern styles
 */
function preloadAllSounds() {
    // Preload regular sounds for both styles
    Object.entries(SOUNDS).forEach(([key, file]) => {
        // Retro sounds
        retroSounds[key] = new Audio(`./audio/retro/${file}`);
        retroSounds[key].load();
        
        // Modern sounds
        modernSounds[key] = new Audio(`./audio/modern/${file}`);
        modernSounds[key].load();
    });
    
    // Preload ambient sounds for both styles
    Object.entries(AMBIENT_SOUNDS).forEach(([key, file]) => {
        // Retro ambient
        retroAmbient[key] = new Audio(`./audio/retro/ambient/${file}`);
        retroAmbient[key].loop = true;
        retroAmbient[key].load();
        
        // Modern ambient
        modernAmbient[key] = new Audio(`./audio/modern/ambient/${file}`);
        modernAmbient[key].loop = true;
        modernAmbient[key].load();
    });
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
    
    // Get the appropriate sound from our preloaded cache
    const soundCache = audioStyle === 'retro' ? retroSounds : modernSounds;
    const sound = soundCache[soundName];
    
    if (!sound) return;
    
    // Clone the audio to allow overlapping sounds
    const audioToPlay = sound.cloneNode();
    
    // Apply current volume setting
    audioToPlay.volume = volume;
    
    // Play immediately (should be no delay since it's preloaded)
    audioToPlay.play().catch(e => console.warn('Error playing sound:', e));
}

/**
 * Play ambient sound
 * @param {string} ambientName - Optional name of ambient sound to play
 */
export function playAmbient(ambientName = 'lofi') {
    // Don't play ambient if either global sound or ambient sound is disabled
    if (!soundEnabled || !ambientEnabled) return;
    
    // Stop any currently playing ambient sound
    stopAmbient();
    
    // Get the appropriate ambient sound from our preloaded cache
    const ambientCache = audioStyle === 'retro' ? retroAmbient : modernAmbient;
    currentAmbient = ambientCache[ambientName];
    
    if (!currentAmbient) return;
    
    // Clone to avoid affecting the cached version
    currentAmbient = currentAmbient.cloneNode();
    
    // Apply current ambient volume setting
    currentAmbient.volume = ambientVolume;
    currentAmbient.loop = true;
    
    // Play the ambient sound
    currentAmbient.play().catch(e => console.warn('Error playing ambient sound:', e));
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
    
    // If sound is disabled, stop ambient sounds too
    if (!soundEnabled) {
        stopAmbient();
    } else {
        // If sound was re-enabled and ambient is enabled, restart ambient
        play('click');
        if (ambientEnabled) {
            playAmbient();
        }
    }
}

/**
 * Set sound enabled/disabled
 * @param {boolean} enabled - Whether sound should be enabled
 */
export function setSoundEnabled(enabled) {
    console.log('setSoundEnabled called with:', enabled);
    soundEnabled = enabled;
    setData('soundEnabled', enabled);
    updateSoundButtonState();
    
    // If sound is disabled, ensure ambient is stopped too
    if (!enabled) {
        stopAmbient();
    } else if (ambientEnabled) {
        // If sound was enabled and ambient is enabled, restart ambient
        playAmbient();
    }
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
    console.log('setAmbientEnabled called with:', enabled);
    ambientEnabled = enabled;
    setData('ambientEnabled', enabled);
    
    if (!enabled) {
        stopAmbient();
    } else if (soundEnabled) {
        // Only start ambient if global sound is also enabled
        playAmbient();
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
    
    // Update volume of currently playing ambient sound if any
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
    
    // If ambient is playing, restart it with the new style
    const wasAmbientPlaying = currentAmbient !== null;
    if (wasAmbientPlaying) {
        const ambientName = getCurrentAmbientName();
        stopAmbient();
        if (soundEnabled && ambientEnabled) {
            playAmbient(ambientName);
        }
    }
}

/**
 * Get the name of the currently playing ambient sound
 * @returns {string} Name of the current ambient sound or 'lofi' as default
 */
function getCurrentAmbientName() {
    if (!currentAmbient) return 'lofi';
    
    // Try to determine which ambient sound is playing by checking the src
    for (const [name, file] of Object.entries(AMBIENT_SOUNDS)) {
        if (currentAmbient.src.includes(file)) {
            return name;
        }
    }
    
    return 'lofi';
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