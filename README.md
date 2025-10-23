# Diamond Hunt Game - Enhanced Edition

A feature-rich browser-based gambling game where players try to find diamonds while avoiding bombs in a customizable grid. Test your luck, manage your risk, and climb the leaderboard!

## Features

### Core Gameplay
- **Multiple Grid Sizes**: Choose from 4x4 (16 cells), 5x5 (25 cells), or 6x6 (36 cells)
- **Customizable Bombs**: Adjust bomb count (2-14 depending on grid size) to control risk/reward
- **Dynamic Multipliers**: Higher risk = higher potential rewards
- **Progressive Winnings**: Each revealed diamond increases your potential payout by 20%
- **Cash Out System**: Secure your winnings anytime or push for the maximum payout

### Difficulty Levels
- **Easy**: 4x4 grid with 2 bombs - Perfect for beginners
- **Medium**: 5x5 grid with 5 bombs - Balanced gameplay
- **Hard**: 6x6 grid with 8 bombs - High stakes
- **Extreme**: 6x6 grid with 12 bombs - Only for the brave!
- **Custom**: Configure your own settings

### Power-Ups System
Earn and use special abilities to gain an edge:
- **🔍 Scanner**: Reveals how many bombs are adjacent to a selected cell
- **✨ 2x Multiplier**: Doubles your winnings for the current game
- **🛡️ Safe Zone**: Automatically reveals one safe diamond cell

Power-ups are randomly awarded (10% chance) when starting a new game.

### Statistics & Tracking
- **Games Played**: Total number of games
- **Win Rate**: Percentage of games won
- **Win Streak**: Current and best winning streaks
- **Best Win**: Highest profit from a single game
- **Recent Games History**: View your last 5 games with detailed stats
- **Top 10 Leaderboard**: Track your highest-profit wins

### Enhanced Features
- **LocalStorage Persistence**: Your credits, stats, and power-ups are saved automatically
- **Sound Effects**: Audio feedback for diamonds, bombs, cash-outs, and power-ups (toggle on/off)
- **Haptic Feedback**: Vibration support for mobile devices
- **Visual Feedback**: Animated messages for game events
- **Confirmation Dialog**: Prevents accidental cash-outs
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Beautiful UI**: Modern gradient design with smooth animations

## How to Play

### Basic Gameplay
1. **Set Your Difficulty**: Choose a preset difficulty or customize your own
2. **Place Your Bet**: Enter an amount (must not exceed your available credits)
3. **Configure Risk**: Adjust grid size and bomb count if using custom mode
4. **Start Game**: Click "Start New Game"
5. **Reveal Cells**: Click cells to reveal diamonds (💎) or bombs (💣)
6. **Make Decisions**:
   - Find a diamond: Keep going or cash out
   - Hit a bomb: Game over, bet lost
   - Reveal all diamonds: Auto win with maximum payout!

### Power-Up Usage
- **Scanner**: Click the power-up, then click any unrevealed cell to see adjacent bomb count
- **2x Multiplier**: Click to activate before revealing cells
- **Safe Zone**: Click to instantly reveal a random safe cell

### Winning Strategies
- **Conservative**: Cash out early with small but consistent profits
- **Aggressive**: Reveal more diamonds for exponentially higher payouts
- **Balanced**: Use power-ups strategically to minimize risk
- **High Risk**: Play with maximum bombs for massive multipliers

## Multiplier Calculation

The game uses a sophisticated multiplier system:

```
Base Multiplier = 1 / (Safe Cells ÷ Total Cells)
Bomb Multiplier = 1.5^(Bombs - 1)
Final Multiplier = Base × Bomb × (1 + Diamonds Revealed × 0.2)
```

**Examples**:
- 4x4 grid, 2 bombs: ~2.3x base multiplier
- 5x5 grid, 5 bombs: ~4.8x base multiplier
- 6x6 grid, 8 bombs: ~8.2x base multiplier
- 6x6 grid, 12 bombs: ~18.5x base multiplier

Each diamond revealed adds +20% to your multiplier!

## Technical Details

### Technologies Used
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage API
- **Audio**: Web Audio API for sound generation
- **Animations**: CSS3 keyframes and transitions
- **Responsive**: CSS Grid and Flexbox

### Browser Compatibility
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓
- Mobile browsers ✓

### Dependencies
**None!** This is a completely standalone game with zero external libraries or frameworks.

### File Structure
```
Daimond_finder/
├── index.html          # Main HTML structure (139 lines)
├── game.js            # Game logic and mechanics (669 lines)
├── styles.css         # Styling and animations (678 lines)
└── README.md          # This file
```

### Total Lines of Code: ~1,486

## Setup & Installation

### Quick Start
Simply open `index.html` in any modern web browser. No build process, no npm install, no configuration needed!

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to directory
cd Daimond_finder

# Open in browser (or use a local server)
open index.html
# OR
python -m http.server 8000
# Then visit http://localhost:8000
```

## Game Statistics

Your progress is automatically saved in your browser's localStorage:
- Credits balance
- All-time statistics
- Game history (last 10 games)
- Top 10 high scores
- Power-up inventory
- Sound preference

### Reset Progress
To reset your saved data, open browser console and run:
```javascript
localStorage.removeItem('diamondHuntSave');
localStorage.removeItem('soundEnabled');
location.reload();
```

## Tips & Tricks

1. **Start Small**: Begin with Easy mode to understand the mechanics
2. **Manage Bankroll**: Never bet more than 10% of your credits on high-risk games
3. **Use Power-Ups Wisely**: Save Scanners for critical decisions
4. **Know When to Cash Out**: A 2x-3x profit is better than losing everything
5. **Track Patterns**: Use the statistics panel to understand your playing style
6. **Master Custom Mode**: Create your own risk/reward balance once you're experienced

## Credits & Acknowledgments

Original concept developed and enhanced with comprehensive features including:
- Advanced statistics tracking
- Power-up system
- Difficulty presets
- Sound effects
- Persistent storage
- Mobile optimization

## License

This project is open source and available for educational purposes.

## Support

For issues, suggestions, or contributions, please open an issue in the repository.

---

**Have fun and may the odds be ever in your favor!** 💎
