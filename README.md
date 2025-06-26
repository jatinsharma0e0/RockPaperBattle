# Rock Paper Battle

A modern HTML5 + JavaScript game featuring Rock, Paper, Scissors with multiple game modes and features.

## Game Modes

- **Endless Mode**: Play continuously against AI with persistent score tracking.
- **Best of 5**: Battle the AI in a best-of-five match format.
- **Speed Mode**: Time-limited gameplay with 3-second turns.

## Features

### Phase 1 (Completed)
- Base game structure
- Endless mode gameplay
- Basic UI with responsive design
- Local storage for game progress
- Theme toggle (Day mode)

### Phase 2 (Completed)
- Best of 5 game mode
- Navigation buttons (Back, Reset)
- Sound effects with toggle
- Improved UI feedback

### Phase 3 (Completed)
- Achievements system with notifications
- Game statistics tracking
- Stats dashboard with visualizations
- Win streak tracking
- Data persistence and reset options

### Phase 4 (Completed)
- Multiple theme options (Day, Night, Retro, Neon)
- Player profile with custom name and avatar
- Secret "Fire" move unlock (after 10 wins)
- Settings screen with tabs for profile, theme, sound, and data management
- First-run experience with profile setup

### Phase 5 (Completed)
- AI Personality Modes (🤖 Random, 😏 Cheeky, 🧠 Predictive)
- Idle animations and ambient sound when inactive
- Enhanced sound management with separate ambient controls
- AI mode statistics tracking
- Responsive visual indicators for different AI personalities

### Phase 6 (Completed)
- Speed Mode with 3-second time limit per move
- Bonus Rounds with special rules
  - 🎯 Double Points: Win for double score
  - 🔁 Reverse Rules: Rock beats Paper, Paper beats Scissors, Scissors beats Rock
  - 🎲 Chaos Mode: Randomly shuffled move labels
- Enhanced visual feedback:
  - Confetti animation for wins
  - Shake effect on losses
  - Glow effect on draws
- Game settings tab with toggles for Speed and Bonus features

### Phase 7 (Completed)
- Accessibility improvements:
  - ARIA attributes and semantic HTML
  - Keyboard navigation support
  - High contrast mode
  - Reduced motion option
  - System preference detection
- Performance optimization:
  - Asset preloading system
  - Loading screen with progress bar
  - FPS counter and performance metrics
  - Optimized animations and transitions
- Data management:
  - Export/import game data as JSON
  - Data schema versioning
  - Improved localStorage handling
- UI Polish:
  - Improved animations and transitions
  - Enhanced focus states for better navigation
  - Loading screen with visual feedback
  - Better error handling and fallbacks

## Themes

Choose from four unique visual themes:
- 🌞 **Day**: Light and clean default theme
- 🌙 **Night**: Dark theme for low-light environments
- 🎮 **Retro**: 8-bit pixel style with vibrant colors
- 💡 **Neon**: Futuristic theme with glowing elements

## Accessibility

Rock Paper Battle includes several accessibility features:
- **High Contrast Mode**: Enhanced color contrast for better visibility
- **Reduced Motion**: Minimizes animations for users sensitive to motion
- **Keyboard Navigation**: Full keyboard support for all game actions
- **ARIA Support**: Screen reader compatibility with semantic HTML
- **System Preference Detection**: Automatically matches OS accessibility settings

## Secret Move

Unlock the special "Fire" move after winning 10 games:
- 🔥 Fire beats Scissors and Paper
- Rock beats Fire
- Paper loses to Fire
- Scissors lose to Fire

## AI Personalities

- 🤖 **Random**: The default AI that picks moves randomly.
- 😏 **Cheeky**: This AI mimics your last move 40% of the time.
- 🧠 **Predictive**: Analyzes your patterns and tries to counter your most-used moves.

## Bonus Rounds

Special rounds with unique rules that occur randomly:
- 🎯 **Double Points**: Win this round for twice the points!
- 🔁 **Reverse Rules**: All win conditions are flipped (except for Fire)
- 🎲 **Chaos Mode**: Move labels are shuffled - can you figure out which is which?

## Achievements

Unlock these achievements as you play:
- 🥉 **3 Wins in a Row**: Win three games consecutively
- 🥇 **Flawless Victory**: Win a Best of 5 match without losing any rounds
- 📊 **10 Total Rounds Played**: Play a total of 10 rounds across any mode

## Technical Details

- Modular JavaScript architecture
- Local storage for game persistence
- No external dependencies
- Responsive design for all devices
- Asset preloading system
- Accessibility support
- Performance optimization

## Audio Credits

Place audio files in the `assets/audio` directory with the following names:
- click.mp3
- win.mp3
- lose.mp3
- draw.mp3
- game-start.mp3
- game-win.mp3
- game-lose.mp3
- game-draw.mp3
- countdown.mp3 (for Speed Mode)
- tick.mp3 (for Speed Mode warning)
- time-up.mp3 (for Speed Mode timeout)
- bonus-round.mp3 (for Bonus Round announcement)
- chaos.mp3 (for Chaos Mode activation)

For ambient sounds, place files in `assets/audio/ambient`:
- wind.mp3
- hum.mp3
- lo-fi-loop.mp3

## How to Play

1. Choose a game mode from the landing page
2. Select Rock (✊), Paper (✋), Scissors (✌️), or Fire (🔥)
3. See the result and your updated score
4. Continue playing or return to the menu
5. Check your stats and achievements anytime
6. Try different AI personalities in settings
7. Enable Speed Mode for a timed challenge
8. Watch for surprise Bonus Rounds with special rules!

## Development

To add new features, follow the modular structure:
- Game modes go in `js/game/`
- Features go in `js/features/`
- Settings go in `js/settings/`
- Utilities go in `js/utils/`

## Deployment

The game can be deployed on any static hosting platform:
- GitHub Pages
- Netlify
- Vercel
- Any web server that can serve static files

No build process is required - just upload the files to your web server.

## Browser Support

Tested and compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome) 