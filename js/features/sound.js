/**
 * Sound module for Rock Paper Battle
 * Handles sound effects, ambient sound, and audio settings
 */

import { getData, setData } from '../settings/storage.js';

// Sound state
let soundEnabled = true;
let ambientEnabled = true;
let volume = 0.5;
let ambientVolume = 0.3;

// Audio elements cache
const audioCache = {};
let currentAmbientAudio = null;
let ambientFadeInterval = null;

// Available ambient sounds
const AMBIENT_SOUNDS = [
    'wind',
    'hum',
    'lo-fi-loop'
];

/**
 * Initialize the sound system
 */
export function init() {
    // Load sound settings from localStorage
    const savedSoundEnabled = getData('soundEnabled');
    if (savedSoundEnabled !== null) {
        soundEnabled = savedSoundEnabled;
    }
    
    const savedAmbientEnabled = getData('ambientEnabled');
    if (savedAmbientEnabled !== null) {
        ambientEnabled = savedAmbientEnabled;
    }
    
    const savedVolume = getData('soundVolume');
    if (savedVolume !== null) {
        volume = savedVolume;
    }
    
    const savedAmbientVolume = getData('ambientVolume');
    if (savedAmbientVolume !== null) {
        ambientVolume = savedAmbientVolume;
    }
    
    // Update the sound toggle button
    updateSoundToggleButton();
    
    // Preload common sounds
    preloadSound('click');
    preloadSound('win');
    preloadSound('lose');
    preloadSound('draw');
    
    // Preload ambient sounds
    preloadAmbientSounds();
}

/**
 * Preload ambient sound files
 */
function preloadAmbientSounds() {
    AMBIENT_SOUNDS.forEach(soundName => {
        const audio = new Audio(`assets/audio/ambient/${soundName}.mp3`);
        audio.load();
        audioCache[`ambient_${soundName}`] = audio;
    });
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
    } else {
        // Stop ambient if sound is toggled off
        stopAmbient();
    }
}

/**
 * Toggle ambient sound on/off
 */
export function toggleAmbient() {
    ambientEnabled = !ambientEnabled;
    
    // Save to localStorage
    setData('ambientEnabled', ambientEnabled);
    
    // Stop ambient if disabled
    if (!ambientEnabled && currentAmbientAudio) {
        stopAmbient();
    }
    
    return ambientEnabled;
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
    
    // If sound is disabled, stop ambient too
    if (!soundEnabled) {
        stopAmbient();
    }
}

/**
 * Set whether ambient sound is enabled
 * @param {boolean} enabled - Whether ambient sound should be enabled
 */
export function setAmbientEnabled(enabled) {
    ambientEnabled = enabled;
    
    // Save to localStorage
    setData('ambientEnabled', ambientEnabled);
    
    // If ambient is disabled, stop it
    if (!ambientEnabled && currentAmbientAudio) {
        stopAmbient();
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
 * Check if ambient sound is enabled
 * @returns {boolean} Whether ambient sound is enabled
 */
export function isAmbientEnabled() {
    return ambientEnabled;
}

/**
 * Set the volume level for sound effects
 * @param {number} level - Volume level between 0 and 1
 */
export function setVolume(level) {
    // Ensure volume is between 0 and 1
    volume = Math.max(0, Math.min(1, level));
    
    // Save to localStorage
    setData('soundVolume', volume);
}

/**
 * Set the volume level for ambient sounds
 * @param {number} level - Volume level between 0 and 1
 */
export function setAmbientVolume(level) {
    // Ensure volume is between 0 and 1
    ambientVolume = Math.max(0, Math.min(1, level));
    
    // Save to localStorage
    setData('ambientVolume', ambientVolume);
    
    // Update current ambient audio if playing
    if (currentAmbientAudio) {
        currentAmbientAudio.volume = ambientVolume;
    }
}

/**
 * Get the current volume level for sound effects
 * @returns {number} The current volume level between 0 and 1
 */
export function getVolume() {
    return volume;
}

/**
 * Get the current volume level for ambient sounds
 * @returns {number} The current volume level between 0 and 1
 */
export function getAmbientVolume() {
    return ambientVolume;
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

/**
 * Play ambient sound with fade-in effect
 * @param {string} ambientName - Optional specific ambient sound to play
 */
export function playAmbient(ambientName = null) {
    // If sound is disabled or ambient is disabled, do nothing
    if (!soundEnabled || !ambientEnabled) return;
    
    // Stop any current ambient sound first
    stopAmbient();
    
    try {
        // Choose an ambient sound if none specified
        if (!ambientName) {
            const index = Math.floor(Math.random() * AMBIENT_SOUNDS.length);
            ambientName = AMBIENT_SOUNDS[index];
        }
        
        // Get or create audio element
        let audio = audioCache[`ambient_${ambientName}`];
        if (!audio) {
            audio = new Audio(`assets/audio/ambient/${ambientName}.mp3`);
            audio.load();
            audioCache[`ambient_${ambientName}`] = audio;
        }
        
        // Set up audio properties
        audio.loop = true;
        audio.volume = 0; // Start silent for fade-in
        
        // Start playing
        const playPromise = audio.play();
        
        // Set current ambient audio
        currentAmbientAudio = audio;
        
        // Fade in
        if (playPromise !== undefined) {
            playPromise.then(() => {
                fadeInAmbient();
            }).catch(error => {
                console.warn(`Failed to play ambient sound "${ambientName}":`, error);
                currentAmbientAudio = null;
            });
        } else {
            fadeInAmbient();
        }
    } catch (error) {
        console.error(`Error playing ambient sound:`, error);
        currentAmbientAudio = null;
    }
}

/**
 * Fade in the ambient sound
 */
function fadeInAmbient() {
    if (!currentAmbientAudio) return;
    
    // Clear any existing fade interval
    if (ambientFadeInterval) {
        clearInterval(ambientFadeInterval);
    }
    
    // Set up fade-in
    let currentVol = 0;
    const fadeStep = 0.02; // Adjust for faster/slower fade
    
    ambientFadeInterval = setInterval(() => {
        if (currentVol < ambientVolume) {
            currentVol = Math.min(ambientVolume, currentVol + fadeStep);
            if (currentAmbientAudio) {
                currentAmbientAudio.volume = currentVol;
            }
        } else {
            if (ambientFadeInterval) {
                clearInterval(ambientFadeInterval);
                ambientFadeInterval = null;
            }
        }
    }, 100);
}

/**
 * Stop ambient sound with fade-out effect
 */
export function stopAmbient() {
    if (!currentAmbientAudio) return;
    
    // Clear any existing fade interval
    if (ambientFadeInterval) {
        clearInterval(ambientFadeInterval);
    }
    
    // Set up fade-out
    let currentVol = currentAmbientAudio.volume;
    const fadeStep = 0.05; // Adjust for faster/slower fade
    const audioToFade = currentAmbientAudio;
    
    ambientFadeInterval = setInterval(() => {
        if (currentVol > 0) {
            currentVol = Math.max(0, currentVol - fadeStep);
            audioToFade.volume = currentVol;
        } else {
            // Stop the audio
            audioToFade.pause();
            audioToFade.currentTime = 0;
            
            // Clear the interval
            clearInterval(ambientFadeInterval);
            ambientFadeInterval = null;
            
            // Clear reference if this is still the current ambient
            if (currentAmbientAudio === audioToFade) {
                currentAmbientAudio = null;
            }
        }
    }, 50);
}

export default {
    init,
    play,
    toggleSound,
    toggleAmbient,
    setSoundEnabled,
    setAmbientEnabled,
    isSoundEnabled,
    isAmbientEnabled,
    setVolume,
    setAmbientVolume,
    getVolume,
    getAmbientVolume,
    playAmbient,
    stopAmbient
}; 