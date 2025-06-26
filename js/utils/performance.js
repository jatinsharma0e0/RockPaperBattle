/**
 * Performance Monitor for Rock Paper Battle
 * Tracks FPS and other performance metrics in development mode
 */

// Configuration
const UPDATE_INTERVAL = 1000; // Update every second
const SAMPLE_SIZE = 60; // Keep up to 60 samples (1 minute)

// State
let isEnabled = false;
let fpsMonitor = null;
let fpsDisplay = null;
let lastFrameTime = 0;
let frameCounter = 0;
let fpsSamples = [];
let averageFps = 0;
let minFps = Infinity;
let maxFps = 0;

/**
 * Initialize the performance monitor
 * @param {boolean} enabled - Whether to enable the monitor initially
 */
export function init(enabled = false) {
    isEnabled = enabled;
    
    // Create FPS display if needed
    createFpsDisplay();
    
    // Start monitoring if enabled
    if (isEnabled) {
        startMonitoring();
    }
}

/**
 * Create the FPS display element
 */
function createFpsDisplay() {
    // Check if element already exists
    if (document.getElementById('fps-display')) {
        fpsDisplay = document.getElementById('fps-display');
        return;
    }
    
    // Create the display element
    fpsDisplay = document.createElement('div');
    fpsDisplay.id = 'fps-display';
    fpsDisplay.className = isEnabled ? 'fps-display' : 'fps-display hidden';
    fpsDisplay.innerHTML = `
        <div class="fps-current">FPS: --</div>
        <div class="fps-avg">Avg: --</div>
        <div class="fps-range">Min: -- | Max: --</div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .fps-display {
            position: fixed;
            top: 0;
            right: 0;
            background-color: rgba(0, 0, 0, 0.7);
            color: #00ff00;
            padding: 5px 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            border-bottom-left-radius: 5px;
        }
        
        .fps-display.hidden {
            display: none;
        }
        
        .fps-current {
            font-weight: bold;
        }
        
        .fps-avg, .fps-range {
            font-size: 10px;
            opacity: 0.8;
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
    document.body.appendChild(fpsDisplay);
}

/**
 * Start performance monitoring
 */
function startMonitoring() {
    // Show the display
    if (fpsDisplay) {
        fpsDisplay.classList.remove('hidden');
    }
    
    // Reset values
    frameCounter = 0;
    fpsSamples = [];
    lastFrameTime = performance.now();
    minFps = Infinity;
    maxFps = 0;
    
    // Start the update loop
    cancelAnimationFrame(fpsMonitor);
    fpsMonitor = requestAnimationFrame(monitorFrame);
    
    // Start the reporting loop
    setInterval(updateFpsDisplay, UPDATE_INTERVAL);
}

/**
 * Monitor each frame
 * @param {number} timestamp - The current timestamp
 */
function monitorFrame(timestamp) {
    // Increment frame counter
    frameCounter++;
    
    // Request next frame
    fpsMonitor = requestAnimationFrame(monitorFrame);
}

/**
 * Update the FPS display
 */
function updateFpsDisplay() {
    if (!isEnabled || !fpsDisplay) return;
    
    // Calculate FPS
    const now = performance.now();
    const elapsed = now - lastFrameTime;
    const currentFps = Math.round((frameCounter * 1000) / elapsed);
    
    // Update samples
    fpsSamples.push(currentFps);
    if (fpsSamples.length > SAMPLE_SIZE) {
        fpsSamples.shift();
    }
    
    // Calculate statistics
    averageFps = Math.round(fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length);
    minFps = Math.min(minFps, currentFps);
    maxFps = Math.max(maxFps, currentFps);
    
    // Update display
    fpsDisplay.querySelector('.fps-current').textContent = `FPS: ${currentFps}`;
    fpsDisplay.querySelector('.fps-avg').textContent = `Avg: ${averageFps}`;
    fpsDisplay.querySelector('.fps-range').textContent = `Min: ${minFps} | Max: ${maxFps}`;
    
    // Reset frame counter
    frameCounter = 0;
    lastFrameTime = now;
    
    // Update color based on performance
    if (currentFps < 30) {
        fpsDisplay.style.color = '#ff0000'; // Red for low FPS
    } else if (currentFps < 50) {
        fpsDisplay.style.color = '#ffff00'; // Yellow for medium FPS
    } else {
        fpsDisplay.style.color = '#00ff00'; // Green for good FPS
    }
}

/**
 * Toggle the performance monitor on or off
 * @returns {boolean} The new state
 */
export function toggle() {
    isEnabled = !isEnabled;
    
    if (isEnabled) {
        startMonitoring();
    } else {
        // Hide the display
        if (fpsDisplay) {
            fpsDisplay.classList.add('hidden');
        }
        
        // Stop the monitor
        cancelAnimationFrame(fpsMonitor);
    }
    
    return isEnabled;
}

/**
 * Get the current performance metrics
 * @returns {Object} Performance metrics
 */
export function getMetrics() {
    return {
        currentFps: fpsSamples[fpsSamples.length - 1] || 0,
        averageFps,
        minFps: minFps === Infinity ? 0 : minFps,
        maxFps
    };
}

export default {
    init,
    toggle,
    getMetrics
}; 