# Rock Paper Battle

A modern HTML5 + JavaScript game featuring Rock, Paper, Scissors with multiple game modes and features.

## Game Modes

- **Endless Mode**: Play continuously against AI with persistent score tracking.
- **Best of 5**: Battle the AI in a best-of-five match format.

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

### Coming Soon
- Bonus rounds with special rewards
- Speed mode with time constraints
- Multiplayer options
- More themes and avatars

## Themes

Choose from four unique visual themes:
- 🌞 **Day**: Light and clean default theme
- 🌙 **Night**: Dark theme for low-light environments
- 🎮 **Retro**: 8-bit pixel style with vibrant colors
- 💡 **Neon**: Futuristic theme with glowing elements

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
- Idle detection and ambient sound system

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

For ambient sounds, place files in `assets/audio/ambient`:
- wind.mp3
- hum.mp3
- lo-fi-loop.mp3

## How to Play

1. Choose a game mode from the landing page
2. Select Rock (✊), Paper (✋), or Scissors (✌️)
3. See the result and your updated score
4. Continue playing or return to the menu
5. Check your stats and achievements anytime
6. Unlock the secret Fire (🔥) move after 10 wins!
7. Try different AI personalities in settings

## Development

To add new features, follow the modular structure:
- Game modes go in `js/game/`
- Features go in `js/features/`
- Settings go in `js/settings/` 