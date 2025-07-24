# Rock Paper Battle

## Overview
A modern HTML5 + JavaScript game featuring Rock, Paper, Scissors with multiple game modes, achievements, and AI opponents. The project includes responsive design, accessibility features, and various themes.

## Project Architecture
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Backend**: Express.js server for production, simple Node.js server for development
- **Build Tool**: Vite for development and building
- **Deployment**: Configured for both Replit and Vercel

## Recent Changes
- **2025-07-24**: Successfully migrated from Replit Agent to standard Replit environment
  - Created Python server wrapper for Replit compatibility
  - Fixed Express.js version conflicts (downgraded to v4.18.2)
  - Updated workflow configuration to use port 5000
  - Maintained client/server separation for security
  - Created comprehensive README.md with screenshots
  - All features working: game modes, AI, themes, stats, achievements

## User Preferences
- Prefers simple deployment process
- Wants compatibility with Replit environment
- Values security and proper architectural separation

## Key Features
- Multiple game modes (Endless, Best of 5)
- AI opponents with different difficulty levels
- Achievement system and statistics tracking
- Multiple themes (Day, Night, Retro, Neon)
- Accessibility features and responsive design
- Sound effects and animations

## Technical Details
- Uses local storage for game data persistence
- Client-side game logic with clean separation
- Express.js serves static files from dist directory
- Vite handles build process and development server