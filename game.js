class DiamondHuntGame {
    constructor() {
        this.gridSize = 4;
        this.totalCells = this.gridSize * this.gridSize;
        this.credits = 1000;
        this.currentBet = 0;
        this.bombs = 2;
        this.gameActive = false;
        this.grid = [];
        this.revealedDiamonds = 0;
        
        // DOM elements
        this.gridElement = document.getElementById('game-grid');
        this.creditsElement = document.getElementById('credits');
        this.betInput = document.getElementById('bet');
        this.bombsInput = document.getElementById('bombs');
        this.startButton = document.getElementById('start-game');
        this.cashOutButton = document.getElementById('cash-out');
        this.multiplierElement = document.getElementById('multiplier');
        this.currentBetElement = document.getElementById('current-bet');
        this.potentialWinElement = document.getElementById('potential-win');
        
        // Event listeners
        this.startButton.addEventListener('click', () => this.startNewGame());
        this.bombsInput.addEventListener('change', () => this.updateMultiplier());
        this.cashOutButton.addEventListener('click', () => this.cashOut());
        
        // Initialize the game
        this.updateCreditsDisplay();
        this.updateMultiplier();
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
        
        if (betAmount > this.credits) {
            alert('Insufficient credits!');
            return;
        }
        
        if (this.bombs < 2 || this.bombs > 5) {
            alert('Number of bombs must be between 2 and 5!');
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
        this.generateGrid();
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
        if (!this.gameActive) return;
        
        const cellType = this.grid[index];
        cell.classList.add('revealed');
        
        if (cellType === 'bomb') {
            cell.classList.add('bomb');
            this.createFireEffect(cell);
            this.endGame(false);
        } else {
            cell.classList.add('diamond');
            this.revealedDiamonds++;
            this.updatePotentialWin();
            this.cashOutButton.disabled = false;
            this.checkWinCondition();
        }
    }
    
    updatePotentialWin() {
        const multiplier = this.calculateMultiplier();
        const progressMultiplier = 1 + (this.revealedDiamonds * 0.2);
        const potentialWin = Math.floor(this.currentBet * multiplier * progressMultiplier);
        this.potentialWinElement.textContent = potentialWin;
        return potentialWin;
    }
    
    cashOut() {
        if (!this.gameActive) return;
        
        const winnings = this.updatePotentialWin();
        const profit = winnings - this.currentBet;
        this.credits += winnings;
        this.updateCreditsDisplay();
        this.gameActive = false;
        this.cashOutButton.disabled = true;
        
        // Create fireworks if there's a profit
        if (profit > 0) {
            const rect = this.gridElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.createFireworks(centerX, centerY), i * 300);
            }
        }
        
        // Reveal all cells
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            cell.classList.add('revealed');
            if (this.grid[index] === 'bomb') {
                cell.classList.add('bomb');
            } else {
                cell.classList.add('diamond');
            }
        });
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
        if (won) {
            const winnings = this.updatePotentialWin();
            this.credits += winnings;
            this.updateCreditsDisplay();
            
            // Create fireworks for a win
            const rect = this.gridElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.createFireworks(centerX, centerY), i * 200);
            }
        }
        
        // Reveal all cells
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            cell.classList.add('revealed');
            if (this.grid[index] === 'bomb') {
                cell.classList.add('bomb');
                if (!won) {
                    this.createFireEffect(cell);
                }
            } else {
                cell.classList.add('diamond');
            }
        });
    }
    
    calculateMultiplier() {
        // Calculate multiplier dynamically based on probability
        const totalCells = this.totalCells;
        const bombs = this.bombs;
        const safeCells = totalCells - bombs;
        
        // Base multiplier calculation using probability
        // The more bombs, the higher the risk and thus higher multiplier
        const probability = safeCells / totalCells;
        const baseMultiplier = 1 / probability;
        
        // Add additional multiplier based on bomb count to make it more rewarding
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
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new DiamondHuntGame();
});