/**
 * Asset Preloader for Rock Paper Battle
 * Handles efficient loading of images and icons
 */

import { getData } from '../settings/storage.js';

// Assets to preload
const ASSETS = {
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
    images: {},
    icons: {}
};

let totalAssets = 0;
let loadedAssets = 0;
let isLoading = false;
let onProgressCallback = null;
let onCompleteCallback = null;

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
    totalAssets = ASSETS.images.length + ASSETS.icons.length;
    loadedAssets = 0;
    
    // Preload images
    ASSETS.images.forEach(file => {
        preloadImage(file);
    });
    
    // Preload icons
    ASSETS.icons.forEach(file => {
        preloadIcon(file);
    });
    
    // If there are no assets to load, complete immediately
    if (totalAssets === 0) {
        isLoading = false;
        if (onCompleteCallback && typeof onCompleteCallback === 'function') {
            onCompleteCallback();
        }
    }
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
    img.src = `./images/${file}`;
    
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
    img.src = `./icons/${file}`;
    
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

export default {
    preloadAssets,
    getImage,
    getIcon
}; 