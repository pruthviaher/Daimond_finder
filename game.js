class DiamondHuntGame {
    constructor() {
        // Load saved data or use defaults
        this.loadGameData();

        this.currentBet = 0;
        this.bombs = 2;
        this.gameActive = false;
        this.grid = [];
        this.revealedDiamonds = 0;
        this.powerUps = {
            scanner: 0,
            multiplier2x: 0,
            safeZone: 0
        };
        this.activePowerUp = null;

        // DOM elements
        this.gridElement = document.getElementById('game-grid');
        this.creditsElement = document.getElementById('credits');
        this.betInput = document.getElementById('bet');
        this.bombsInput = document.getElementById('bombs');
        this.gridSizeSelect = document.getElementById('grid-size');
        this.difficultySelect = document.getElementById('difficulty');
        this.startButton = document.getElementById('start-game');
        this.cashOutButton = document.getElementById('cash-out');
        this.multiplierElement = document.getElementById('multiplier');
        this.currentBetElement = document.getElementById('current-bet');
        this.potentialWinElement = document.getElementById('potential-win');
        this.soundToggleInput = document.getElementById('sound-toggle');
        this.hapticToggleInput = document.getElementById('haptic-toggle');
        this.soundBtn = document.getElementById('sound-btn');

        // Statistics elements
        this.gamesPlayedElement = document.getElementById('games-played');
        this.winRateElement = document.getElementById('win-rate');
        this.winStreakElement = document.getElementById('win-streak');
        this.bestWinElement = document.getElementById('best-win');

        // Power-up buttons
        this.scannerBtn = document.getElementById('use-scanner');
        this.multiplier2xBtn = document.getElementById('use-2x');
        this.safeZoneBtn = document.getElementById('use-safe-zone');

        // Modal elements
        this.statsModal = document.getElementById('stats-modal');
        this.settingsModal = document.getElementById('settings-modal');

        // Initialize sound effects
        this.sounds = {
            diamond: this.createSound([523.25, 659.25], 0.1, 'sine'),
            bomb: this.createSound([100, 50], 0.3, 'sawtooth'),
            cashout: this.createSound([440, 554.37, 659.25], 0.2, 'sine'),
            powerup: this.createSound([880, 1046.5], 0.15, 'triangle')
        };
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.hapticEnabled = localStorage.getItem('hapticEnabled') !== 'false';

        // Event listeners
        this.startButton.addEventListener('click', () => this.startNewGame());
        this.bombsInput.addEventListener('change', () => this.updateMultiplier());
        this.gridSizeSelect.addEventListener('change', () => {
            this.updateGridSize();
            this.updateMultiplier();
        });
        this.difficultySelect.addEventListener('change', () => this.applyDifficulty());
        this.cashOutButton.addEventListener('click', () => this.confirmCashOut());

        // Settings toggles
        this.soundToggleInput.addEventListener('change', () => this.toggleSound());
        this.hapticToggleInput.addEventListener('change', () => this.toggleHaptic());

        // Power-up event listeners
        this.scannerBtn.addEventListener('click', () => this.activatePowerUp('scanner'));
        this.multiplier2xBtn.addEventListener('click', () => this.activatePowerUp('multiplier2x'));
        this.safeZoneBtn.addEventListener('click', () => this.activatePowerUp('safeZone'));

        // Modal event listeners
        document.getElementById('stats-btn').addEventListener('click', () => this.openModal('stats-modal'));
        document.getElementById('settings-btn').addEventListener('click', () => this.openModal('settings-modal'));
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.dataset.modal));
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal.id);
            });
        });
        document.getElementById('reset-progress').addEventListener('click', () => this.resetProgress());

        // Initialize the game
        this.updateGridSize();
        this.updateCreditsDisplay();
        this.updateStatistics();
        this.updateMultiplier();
        this.updateLeaderboard();
        this.updateGameHistory();
        this.updatePowerUpDisplay();
        this.updateSoundBtn();
        this.soundToggleInput.checked = this.soundEnabled;
        this.hapticToggleInput.checked = this.hapticEnabled;
    }

    loadGameData() {
        const saved = localStorage.getItem('diamondHuntSave');
        if (saved) {
            const data = JSON.parse(saved);
            this.credits = data.credits || 1000;
            this.stats = data.stats || {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                currentStreak: 0,
                bestStreak: 0,
                bestWin: 0,
                totalWinnings: 0
            };
            this.gameHistory = data.gameHistory || [];
            this.leaderboard = data.leaderboard || [];
            this.powerUps = data.powerUps || { scanner: 1, multiplier2x: 1, safeZone: 1 };
        } else {
            this.credits = 1000;
            this.stats = {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                currentStreak: 0,
                bestStreak: 0,
                bestWin: 0,
                totalWinnings: 0
            };
            this.gameHistory = [];
            this.leaderboard = [];
            this.powerUps = { scanner: 1, multiplier2x: 1, safeZone: 1 };
        }
        this.gridSize = 4;
        this.totalCells = this.gridSize * this.gridSize;
    }

    saveGameData() {
        const data = {
            credits: this.credits,
            stats: this.stats,
            gameHistory: this.gameHistory.slice(-10), // Keep last 10 games
            leaderboard: this.leaderboard.slice(0, 10), // Keep top 10
            powerUps: this.powerUps
        };
        localStorage.setItem('diamondHuntSave', JSON.stringify(data));
    }

    updateGridSize() {
        const size = parseInt(this.gridSizeSelect.value);
        this.gridSize = Math.sqrt(size);
        this.totalCells = size;

        // Adjust grid display columns
        this.gridElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        // Adjust max bombs based on grid size
        const maxBombs = Math.floor(this.totalCells * 0.4);
        this.bombsInput.max = maxBombs;
        if (parseInt(this.bombsInput.value) > maxBombs) {
            this.bombsInput.value = Math.min(5, maxBombs);
        }
    }

    applyDifficulty() {
        const difficulty = this.difficultySelect.value;
        const presets = {
            easy: { gridSize: 16, bombs: 2 },
            medium: { gridSize: 25, bombs: 5 },
            hard: { gridSize: 36, bombs: 8 },
            extreme: { gridSize: 36, bombs: 12 }
        };

        if (difficulty !== 'custom') {
            const preset = presets[difficulty];
            this.gridSizeSelect.value = preset.gridSize;
            this.bombsInput.value = preset.bombs;
            this.updateGridSize();
            this.updateMultiplier();
        }
    }

    createSound(frequencies, duration, type = 'sine') {
        return { frequencies, duration, type };
    }

    playSound(sound) {
        if (!this.soundEnabled || !sound) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

        sound.frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.connect(gainNode);
            oscillator.start(audioContext.currentTime + (index * 0.05));
            oscillator.stop(audioContext.currentTime + sound.duration);
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    toggleSound() {
        this.soundEnabled = this.soundToggleInput.checked;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        this.updateSoundBtn();
    }

    toggleHaptic() {
        this.hapticEnabled = this.hapticToggleInput.checked;
        localStorage.setItem('hapticEnabled', this.hapticEnabled);
    }

    updateSoundBtn() {
        this.soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.soundBtn.title = this.soundEnabled ? 'Sound On' : 'Sound Off';
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('diamondHuntSave');
            localStorage.removeItem('soundEnabled');
            localStorage.removeItem('hapticEnabled');
            location.reload();
        }
    }

    triggerHaptic(intensity = 'medium') {
        if (this.hapticEnabled && navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 50
            };
            navigator.vibrate(patterns[intensity] || 20);
        }
    }

    activatePowerUp(type) {
        if (!this.gameActive || this.powerUps[type] <= 0) return;

        this.activePowerUp = type;
        this.powerUps[type]--;
        this.updatePowerUpDisplay();
        this.playSound(this.sounds.powerup);
        this.triggerHaptic('medium');

        if (type === 'scanner') {
            this.showMessage('Click a cell to scan adjacent cells!', 'info');
        } else if (type === 'multiplier2x') {
            this.showMessage('2x Multiplier activated for this game!', 'success');
        } else if (type === 'safeZone') {
            this.revealSafeCell();
        }
    }

    revealSafeCell() {
        const cells = document.querySelectorAll('.grid-cell:not(.revealed)');
        const safeCells = Array.from(cells).filter((cell, index) => {
            const cellIndex = Array.from(this.gridElement.children).indexOf(cell);
            return this.grid[cellIndex] === 'diamond';
        });

        if (safeCells.length > 0) {
            const randomSafe = safeCells[Math.floor(Math.random() * safeCells.length)];
            const index = Array.from(this.gridElement.children).indexOf(randomSafe);
            this.revealCell(index, randomSafe);
            this.activePowerUp = null;
            this.showMessage('Safe cell revealed!', 'success');
        }
    }

    scanAdjacentCells(index) {
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        const adjacent = [];

        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
                    adjacent.push(newRow * this.gridSize + newCol);
                }
            }
        }

        let bombCount = 0;
        adjacent.forEach(idx => {
            if (this.grid[idx] === 'bomb') bombCount++;
        });

        this.showMessage(`Scanner: ${bombCount} bomb(s) nearby!`, bombCount > 0 ? 'warning' : 'success');
        this.activePowerUp = null;
    }

    updatePowerUpDisplay() {
        document.getElementById('scanner-count').textContent = this.powerUps.scanner;
        document.getElementById('2x-count').textContent = this.powerUps.multiplier2x;
        document.getElementById('safe-zone-count').textContent = this.powerUps.safeZone;

        this.scannerBtn.disabled = this.powerUps.scanner <= 0 || !this.gameActive;
        this.multiplier2xBtn.disabled = this.powerUps.multiplier2x <= 0 || !this.gameActive;
        this.safeZoneBtn.disabled = this.powerUps.safeZone <= 0 || !this.gameActive;
    }

    showMessage(text, type = 'info') {
        const messageDiv = document.getElementById('game-message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    createFireworks(x, y) {
        const colors = ['#ff0', '#f0f', '#0ff', '#0f0'];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'fireworks';
                firework.style.left = `${x + (Math.random() * 100 - 50)}px`;
                firework.style.top = `${y + (Math.random() * 100 - 50)}px`;
                firework.style.background = colors[Math.floor(Math.random() * colors.length)];
                document.body.appendChild(firework);
                setTimeout(() => firework.remove(), 800);
            }, i * 200);
        }
    }

    createFireEffect(element) {
        const fire = document.createElement('div');
        fire.className = 'fire';
        element.appendChild(fire);
        setTimeout(() => fire.remove(), 500);
    }

    startNewGame() {
        const betAmount = parseInt(this.betInput.value);
        this.bombs = parseInt(this.bombsInput.value);

        // Enhanced validation
        if (betAmount < 1) {
            this.showMessage('Bet must be at least 1 credit!', 'error');
            return;
        }

        if (betAmount > this.credits) {
            this.showMessage(`Insufficient credits! You have ${this.credits} credits.`, 'error');
            return;
        }

        const maxBombs = Math.floor(this.totalCells * 0.4);
        if (this.bombs < 2 || this.bombs > maxBombs) {
            this.showMessage(`Number of bombs must be between 2 and ${maxBombs}!`, 'error');
            return;
        }

        this.currentBet = betAmount;
        this.credits -= betAmount;
        this.gameActive = true;
        this.revealedDiamonds = 0;
        this.cashOutButton.disabled = true;
        this.updateCreditsDisplay();
        this.currentBetElement.textContent = this.currentBet;
        this.updatePotentialWin();
        this.updatePowerUpDisplay();
        this.generateGrid();

        // Award random power-up on game start (10% chance)
        if (Math.random() < 0.1) {
            const types = ['scanner', 'multiplier2x', 'safeZone'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            this.powerUps[randomType]++;
            this.updatePowerUpDisplay();
            this.showMessage(`Bonus! Received 1 ${randomType} power-up!`, 'success');
        }
    }

    generateGrid() {
        this.gridElement.innerHTML = '';
        this.grid = new Array(this.totalCells).fill('empty');

        // Place bombs
        let bombsPlaced = 0;
        while (bombsPlaced < this.bombs) {
            const position = Math.floor(Math.random() * this.totalCells);
            if (this.grid[position] === 'empty') {
                this.grid[position] = 'bomb';
                bombsPlaced++;
            }
        }

        // Place diamonds in remaining cells
        for (let i = 0; i < this.totalCells; i++) {
            if (this.grid[i] === 'empty') {
                this.grid[i] = 'diamond';
            }
        }

        // Create grid cells
        for (let i = 0; i < this.totalCells; i++) {
            const cell = document.createElement('button');
            cell.className = 'grid-cell';
            cell.addEventListener('click', () => this.revealCell(i, cell));
            this.gridElement.appendChild(cell);
        }
    }

    revealCell(index, cell) {
        if (!this.gameActive || cell.classList.contains('revealed')) return;

        // Handle scanner power-up
        if (this.activePowerUp === 'scanner') {
            this.scanAdjacentCells(index);
            this.saveGameData();
            return;
        }

        const cellType = this.grid[index];
        cell.classList.add('revealed');
        this.triggerHaptic('light');

        if (cellType === 'bomb') {
            cell.classList.add('bomb');
            this.createFireEffect(cell);
            this.playSound(this.sounds.bomb);
            this.triggerHaptic('heavy');
            this.endGame(false);
        } else {
            cell.classList.add('diamond');
            this.revealedDiamonds++;
            this.playSound(this.sounds.diamond);
            this.updatePotentialWin();
            this.cashOutButton.disabled = false;
            this.checkWinCondition();
        }
    }

    updatePotentialWin() {
        let multiplier = this.calculateMultiplier();

        // Apply 2x multiplier power-up if active
        if (this.activePowerUp === 'multiplier2x') {
            multiplier *= 2;
        }

        const progressMultiplier = 1 + (this.revealedDiamonds * 0.2);
        const potentialWin = Math.floor(this.currentBet * multiplier * progressMultiplier);
        this.potentialWinElement.textContent = potentialWin;
        return potentialWin;
    }

    confirmCashOut() {
        if (!this.gameActive) return;

        const winnings = this.updatePotentialWin();
        const profit = winnings - this.currentBet;

        if (confirm(`Cash out for ${winnings} credits (${profit >= 0 ? '+' : ''}${profit} profit)?`)) {
            this.cashOut();
        }
    }

    cashOut() {
        if (!this.gameActive) return;

        const winnings = this.updatePotentialWin();
        const profit = winnings - this.currentBet;
        this.credits += winnings;
        this.updateCreditsDisplay();
        this.gameActive = false;
        this.cashOutButton.disabled = true;

        this.playSound(this.sounds.cashout);
        this.triggerHaptic('medium');

        // Update statistics for cash out
        this.recordGame(true, profit, 'cashout');

        // Create fireworks if there's a profit
        if (profit > 0) {
            const rect = this.gridElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.createFireworks(centerX, centerY), i * 300);
            }
            this.showMessage(`Cashed out! +${profit} credits`, 'success');
        }

        // Reveal all cells
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('revealed');
                if (this.grid[index] === 'bomb') {
                    cell.classList.add('bomb');
                } else {
                    cell.classList.add('diamond');
                }
            }
        });

        this.updatePowerUpDisplay();
    }

    checkWinCondition() {
        const revealedCells = document.querySelectorAll('.grid-cell.revealed').length;
        const safeCells = this.totalCells - this.bombs;

        if (revealedCells === safeCells) {
            this.endGame(true);
        }
    }

    endGame(won) {
        this.gameActive = false;
        this.cashOutButton.disabled = true;
        let winnings = 0;
        let profit = -this.currentBet;

        if (won) {
            winnings = this.updatePotentialWin();
            profit = winnings - this.currentBet;
            this.credits += winnings;
            this.updateCreditsDisplay();

            this.playSound(this.sounds.cashout);
            this.triggerHaptic('heavy');

            // Create fireworks for a win
            const rect = this.gridElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.createFireworks(centerX, centerY), i * 200);
            }

            this.showMessage(`YOU WIN! +${profit} credits`, 'success');
        } else {
            this.showMessage(`GAME OVER! -${this.currentBet} credits`, 'error');
        }

        // Record game result
        this.recordGame(won, profit, won ? 'win' : 'loss');

        // Reveal all cells
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('revealed');
                if (this.grid[index] === 'bomb') {
                    cell.classList.add('bomb');
                    if (!won) {
                        this.createFireEffect(cell);
                    }
                } else {
                    cell.classList.add('diamond');
                }
            }
        });

        this.updatePowerUpDisplay();
    }

    recordGame(won, profit, result) {
        this.stats.gamesPlayed++;

        if (won) {
            this.stats.wins++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.bestStreak) {
                this.stats.bestStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.losses++;
            this.stats.currentStreak = 0;
        }

        if (profit > this.stats.bestWin) {
            this.stats.bestWin = profit;
        }

        this.stats.totalWinnings += profit;

        // Add to game history
        this.gameHistory.unshift({
            date: new Date().toLocaleString(),
            bet: this.currentBet,
            result: result,
            profit: profit,
            gridSize: this.totalCells,
            bombs: this.bombs
        });

        // Update leaderboard if it's a high score
        if (profit > 0) {
            this.leaderboard.push({
                date: new Date().toLocaleString(),
                profit: profit,
                bet: this.currentBet,
                multiplier: (profit / this.currentBet).toFixed(2)
            });
            this.leaderboard.sort((a, b) => b.profit - a.profit);
            this.leaderboard = this.leaderboard.slice(0, 10);
        }

        this.updateStatistics();
        this.updateGameHistory();
        this.updateLeaderboard();
        this.saveGameData();
    }

    updateStatistics() {
        this.gamesPlayedElement.textContent = this.stats.gamesPlayed;
        const winRate = this.stats.gamesPlayed > 0
            ? ((this.stats.wins / this.stats.gamesPlayed) * 100).toFixed(1)
            : '0.0';
        this.winRateElement.textContent = `${winRate}%`;
        this.winStreakElement.textContent = `${this.stats.currentStreak} (Best: ${this.stats.bestStreak})`;
        this.bestWinElement.textContent = this.stats.bestWin;
    }

    updateGameHistory() {
        const historyElement = document.getElementById('game-history');
        historyElement.innerHTML = '';

        const recentGames = this.gameHistory.slice(0, 5);
        if (recentGames.length === 0) {
            historyElement.innerHTML = '<p class="empty-state">No games played yet</p>';
            return;
        }

        recentGames.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = `history-item ${game.result}`;
            gameDiv.innerHTML = `
                <span class="history-result">${game.result.toUpperCase()}</span>
                <span class="history-details">Bet: ${game.bet} | ${game.profit >= 0 ? '+' : ''}${game.profit}</span>
                <span class="history-grid">${game.gridSize} cells, ${game.bombs} bombs</span>
            `;
            historyElement.appendChild(gameDiv);
        });
    }

    updateLeaderboard() {
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = '';

        if (this.leaderboard.length === 0) {
            leaderboardElement.innerHTML = '<p class="empty-state">No high scores yet</p>';
            return;
        }

        this.leaderboard.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'leaderboard-item';
            entryDiv.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-profit">+${entry.profit}</span>
                <span class="leaderboard-details">Bet: ${entry.bet} (${entry.multiplier}x)</span>
            `;
            leaderboardElement.appendChild(entryDiv);
        });
    }

    calculateMultiplier() {
        // Calculate multiplier dynamically based on probability
        const totalCells = this.totalCells;
        const bombs = this.bombs;
        const safeCells = totalCells - bombs;

        // Base multiplier calculation using probability
        const probability = safeCells / totalCells;
        const baseMultiplier = 1 / probability;

        // Add additional multiplier based on bomb count
        const bombMultiplier = Math.pow(1.5, bombs - 1);

        // Combine both factors and round to 1 decimal place
        return Math.round((baseMultiplier * bombMultiplier) * 10) / 10;
    }

    updateMultiplier() {
        const multiplier = this.calculateMultiplier();
        this.multiplierElement.textContent = multiplier.toFixed(1) + 'x';
    }

    updateCreditsDisplay() {
        this.creditsElement.textContent = this.credits;
        this.saveGameData();
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new DiamondHuntGame();
});
