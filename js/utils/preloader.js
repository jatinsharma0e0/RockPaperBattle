/**
 * Asset Preloader for Rock Paper Battle
 * Handles efficient loading of images, audio, and other assets
 */

import { getData } from '../settings/storage.js';

// Assets to preload
const ASSETS = {
    // Audio files
    audio: [
        'click.wav',
        'win.wav',
        'lose.wav',
        'draw.wav',
        'gameStart.wav',
        'gameWin.wav',
        'gameLose.wav',
        'gameDraw.wav',
        'countdown.wav',
        'tick.wav',
        'timeUp.wav',
        'bonusRound.wav',
        'chaos.wav'
    ],
    
    // Ambient audio
    ambientAudio: [
        'wind.wav',
        'hum.wav',
        'lo-fi-loop.wav'
    ],
    
    // Images
    images: [
        'logo.webp'
    ],
    
    // Icons
    icons: [
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'favicon.svg',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png'
    ]
};

// Cache for loaded assets
const assetsCache = {
    audio: {},
    images: {},
    icons: {}
};

let totalAssets = 0;
let loadedAssets = 0;
let isLoading = false;
let onProgressCallback = null;
let onCompleteCallback = null;

/**
 * Get current audio style setting from storage
 * @returns {string} Current audio style ('retro' or 'modern')
 */
function getAudioStyle() {
    return getData('audioStyle') || 'retro';
}

/**
 * Preload all game assets
 * @param {Function} onProgress - Callback for progress updates (receives percentage 0-100)
 * @param {Function} onComplete - Callback when all assets are loaded
 */
export function preloadAssets(onProgress = null, onComplete = null) {
    if (isLoading) return;
    
    isLoading = true;
    onProgressCallback = onProgress;
    onCompleteCallback = onComplete;
    
    // Calculate total assets
    totalAssets = ASSETS.audio.length + ASSETS.ambientAudio.length + ASSETS.images.length + ASSETS.icons.length;
    loadedAssets = 0;
    
    // Preload regular audio
    ASSETS.audio.forEach(file => {
        preloadAudio(file);
    });
    
    // Preload ambient audio
    ASSETS.ambientAudio.forEach(file => {
        preloadAudio(file, true);
    });
    
    // Preload images
    ASSETS.images.forEach(file => {
        preloadImage(file);
    });
    
    // Preload icons
    ASSETS.icons.forEach(file => {
        preloadIcon(file);
    });
}

/**
 * Preload an audio file
 * @param {string} file - The audio file name
 * @param {boolean} isAmbient - Whether this is an ambient audio file
 */
function preloadAudio(file, isAmbient = false) {
    const audioStyle = getAudioStyle();
    const path = isAmbient 
        ? `assets/audio/${audioStyle}/ambient/${file}` 
        : `assets/audio/${audioStyle}/${file}`;
    
    const audio = new Audio(path);
    
    // Add load event listener
    audio.addEventListener('canplaythrough', () => {
        assetLoaded(file);
    }, { once: true });
    
    // Add error event listener
    audio.addEventListener('error', () => {
        console.warn(`Failed to load audio file: ${file}`);
        assetLoaded(file); // Still count as loaded to avoid hanging
    }, { once: true });
    
    // Start loading
    audio.load();
    
    // Add to cache
    const key = isAmbient ? `ambient_${file.split('.')[0]}` : file.split('.')[0];
    assetsCache.audio[key] = audio;
}

/**
 * Preload an image file
 * @param {string} file - The image file name
 */
function preloadImage(file) {
    const img = new Image();
    
    // Add load event listener
    img.onload = () => {
        assetLoaded(file);
    };
    
    // Add error event listener
    img.onerror = () => {
        console.warn(`Failed to load image file: ${file}`);
        assetLoaded(file); // Still count as loaded to avoid hanging
    };
    
    // Start loading
    img.src = `assets/images/${file}`;
    
    // Add to cache
    const key = file.split('.')[0];
    assetsCache.images[key] = img;
}

/**
 * Preload an icon file
 * @param {string} file - The icon file name
 */
function preloadIcon(file) {
    const img = new Image();
    
    // Add load event listener
    img.onload = () => {
        assetLoaded(file);
    };
    
    // Add error event listener
    img.onerror = () => {
        console.warn(`Failed to load icon file: ${file}`);
        assetLoaded(file); // Still count as loaded to avoid hanging
    };
    
    // Start loading
    img.src = `assets/icons/${file}`;
    
    // Add to cache
    const key = file.split('.')[0];
    assetsCache.icons[key] = img;
}

/**
 * Handle a loaded asset
 * @param {string} assetName - The name of the loaded asset
 */
function assetLoaded(assetName) {
    loadedAssets++;
    
    // Calculate progress
    const progress = Math.floor((loadedAssets / totalAssets) * 100);
    
    // Call progress callback if available
    if (onProgressCallback && typeof onProgressCallback === 'function') {
        onProgressCallback(progress);
    }
    
    // Check if all assets are loaded
    if (loadedAssets >= totalAssets) {
        isLoading = false;
        
        // Call complete callback if available
        if (onCompleteCallback && typeof onCompleteCallback === 'function') {
            onCompleteCallback();
        }
    }
}

/**
 * Check if a specific audio file is cached
 * @param {string} key - The audio key
 * @param {boolean} isAmbient - Whether this is an ambient audio file
 * @returns {boolean} Whether the audio is cached
 */
export function isAudioCached(key, isAmbient = false) {
    const fullKey = isAmbient ? `ambient_${key}` : key;
    return !!assetsCache.audio[fullKey];
}

/**
 * Get a cached audio element
 * @param {string} key - The audio key
 * @param {boolean} isAmbient - Whether this is an ambient audio file
 * @returns {HTMLAudioElement|null} The cached audio element or null
 */
export function getAudio(key, isAmbient = false) {
    const fullKey = isAmbient ? `ambient_${key}` : key;
    return assetsCache.audio[fullKey] || null;
}

/**
 * Get a cached image element
 * @param {string} key - The image key
 * @returns {HTMLImageElement|null} The cached image element or null
 */
export function getImage(key) {
    return assetsCache.images[key] || null;
}

/**
 * Get a cached icon element
 * @param {string} key - The icon key
 * @returns {HTMLImageElement|null} The cached icon element or null
 */
export function getIcon(key) {
    return assetsCache.icons[key] || null;
}

/**
 * Clear audio cache and reload audio files (for when audio style changes)
 */
export function reloadAudioAssets() {
    // Clear audio cache
    assetsCache.audio = {};
    
    // Reload regular audio
    ASSETS.audio.forEach(file => {
        preloadAudio(file);
    });
    
    // Reload ambient audio
    ASSETS.ambientAudio.forEach(file => {
        preloadAudio(file, true);
    });
}

export default {
    preloadAssets,
    isAudioCached,
    getAudio,
    getImage,
    getIcon,
    reloadAudioAssets
}; 