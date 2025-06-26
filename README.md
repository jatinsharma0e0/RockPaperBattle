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

### Coming Soon
- Achievements system
- Player avatars
- Special moves
- Advanced AI modes
- Additional themes

## Technical Details

- Modular JavaScript architecture
- Local storage for game persistence
- No external dependencies
- Responsive design for all devices

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

## How to Play

1. Choose a game mode from the landing page
2. Select Rock (✊), Paper (✋), or Scissors (✌️)
3. See the result and your updated score
4. Continue playing or return to the menu

## Development

To add new features, follow the modular structure:
- Game modes go in `js/game/`
- Features go in `js/features/`
- Settings go in `js/settings/` 