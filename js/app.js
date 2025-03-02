// Main application logic for Bridge Scoring Calculator
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the calculator
    const BridgeCalculator = {
        // DOM Elements
        elements: {
            contractDisplay: document.getElementById('contractDisplay'),
            contractStateDisplay: document.getElementById('contractStateDisplay'),
            resultDisplay: document.getElementById('resultDisplay'),
            vulnerableToggle: document.getElementById('vulnerableToggle'),
            calculateBtn: document.getElementById('calculateBtn'),
            clearBtn: document.getElementById('clearBtn'),
            newContractBtn: document.getElementById('newContractBtn'),
            breakdownBtn: document.getElementById('breakdownBtn'),
            breakdownModal: document.getElementById('breakdownModal'),
            breakdownContent: document.getElementById('breakdownContent'),
            closeModal: document.querySelector('.close')
        },
        
        // Calculator state
        state: {
            level: null,
            suit: null,
            tricks: null, 
            vulnerable: false,
            doubled: 'none', // 'none', 'doubled', or 'redoubled'
            scorer: BridgeScoring.createScorer(),
            contractSelected: false
        },
        
        // Initialize the calculator
        init() {
            this.bindEvents();
            this.clearCalculator(true); // true for initial setup
        },
        
        // Bind all event listeners
        bindEvents() {
            // Level buttons
            document.querySelectorAll('.btn.level').forEach(button => {
                button.addEventListener('click', () => {
                    this.setLevel(parseInt(button.dataset.level));
                });
            });
            
            // Suit buttons
            document.querySelectorAll('.btn.suit').forEach(button => {
                button.addEventListener('click', () => {
                    this.setSuit(button.dataset.suit);
                });
            });
            
            // Trick buttons
            document.querySelectorAll('.btn.trick').forEach(button => {
                button.addEventListener('click', () => {
                    this.setTricks(button.dataset.trick);
                });
            });
            
            // Contract state buttons (doubled/redoubled)
            document.querySelectorAll('.btn.contract-state').forEach(button => {
                button.addEventListener('click', () => {
                    this.setContractState(button.dataset.state);
                });
            });
            
            // Vulnerable toggle
            this.elements.vulnerableToggle.addEventListener('change', () => {
                this.state.vulnerable = this.elements.vulnerableToggle.checked;
                this.updateContractDisplay();
                this.calculate();
            });
            
            // Calculate button
            this.elements.calculateBtn.addEventListener('click', () => {
                this.calculate();
            });
            
            // Clear button
            this.elements.clearBtn.addEventListener('click', () => {
                this.clearCalculator();
            });
            
            // New Contract button
            this.elements.newContractBtn.addEventListener('click', () => {
                this.newContract();
            });
            
            // Breakdown button
            this.elements.breakdownBtn.addEventListener('click', () => {
                this.showBreakdown();
            });
            
            // Close modal
            this.elements.closeModal.addEventListener('click', () => {
                this.elements.breakdownModal.style.display = 'none';
            });
            
            // Click outside modal to close
            window.addEventListener('click', (event) => {
                if (event.target === this.elements.breakdownModal) {
                    this.elements.breakdownModal.style.display = 'none';
                }
            });
        },
        
        // Set contract level
        setLevel(level) {
            this.clearSelection('.btn.level');
            this.state.level = level;
            document.querySelector(`.btn.level[data-level="${level}"]`).classList.add('selected');
            this.updateContractDisplay();
            this.calculate();
        },
        
        // Set contract suit
        setSuit(suit) {
            this.clearSelection('.btn.suit');
            this.state.suit = suit;
            document.querySelector(`.btn.suit[data-suit="${suit}"]`).classList.add('selected');
            this.updateContractDisplay();
            this.calculate();
        },
        
        // Set tricks made/down
        setTricks(trickChange) {
            // Check if contract has been selected
            if (!this.state.level || !this.state.suit) {
                return; // Cannot set tricks without a contract
            }
            
            // If already selected, deselect
            const trickButton = document.querySelector(`.btn.trick[data-trick="${trickChange}"]`);
            if (trickButton.classList.contains('selected')) {
                trickButton.classList.remove('selected');
                // Reset to making exactly (contractTricks)
                this.state.tricks = this.state.level + 6;
            } else {
                this.clearSelection('.btn.trick');
                const contractTricks = this.state.level + 6;
                
                if (trickChange.startsWith("-")) {
                    // Going down
                    const undertricks = parseInt(trickChange.replace('-', ''));
                    this.state.tricks = contractTricks - undertricks;
                } else {
                    // Making with overtricks
                    const overtricks = parseInt(trickChange.replace('+', ''));
                    this.state.tricks = contractTricks + overtricks;
                }
                
                trickButton.classList.add('selected');
            }
            
            this.updateContractDisplay();
            this.calculate();
        },
        
        // Set contract state (doubled/redoubled)
        setContractState(state) {
            // Check if contract has been selected
            if (!this.state.level || !this.state.suit) {
                return; // Cannot set doubled state without a contract
            }
            
            // If already selected, deselect
            const stateButton = document.querySelector(`.btn.contract-state[data-state="${state}"]`);
            if (stateButton.classList.contains('selected')) {
                stateButton.classList.remove('selected');
                this.state.doubled = 'none';
            } else {
                this.clearSelection('.btn.contract-state');
                this.state.doubled = state;
                stateButton.classList.add('selected');
            }
            
            this.updateContractDisplay();
            this.calculate();
        },
        
        // Clear selection from buttons of a certain type
        clearSelection(selector) {
            document.querySelectorAll(`${selector}.selected`).forEach(button => {
                button.classList.remove('selected');
            });
        },
        
        // Update the contract display
        updateContractDisplay() {
            if (!this.state.level || !this.state.suit) {
                this.elements.contractDisplay.textContent = '';
                this.elements.contractStateDisplay.textContent = '';
                return;
            }
            
            let suitSymbol = this.state.suit;
            
            // Replace suit letters with symbols for display
            if (suitSymbol === 'C') suitSymbol = '♣';
            else if (suitSymbol === 'D') suitSymbol = '♦';
            else if (suitSymbol === 'H') suitSymbol = '♥';
            else if (suitSymbol === 'S') suitSymbol = '♠';
            
            this.elements.contractDisplay.textContent = `${this.state.level}${suitSymbol}`;
            
            // Update contract state display (tricks, vulnerable, doubled status)
            let contractStateText = '';
            
            // Add tricks if different from making exactly
            if (this.state.tricks !== null) {
                const contractTricks = this.state.level + 6;
                if (this.state.tricks > contractTricks) {
                    contractStateText += `+${this.state.tricks - contractTricks} `;
                } else if (this.state.tricks < contractTricks) {
                    contractStateText += `${this.state.tricks - contractTricks} `;
                }
            }
            
            // Add vulnerable status
            if (this.state.vulnerable) {
                contractStateText += 'Vul ';
            }
            
            // Add doubled/redoubled status
            if (this.state.doubled === 'doubled') {
                contractStateText += 'X';
            } else if (this.state.doubled === 'redoubled') {
                contractStateText += 'XX';
            }
            
            this.elements.contractStateDisplay.textContent = contractStateText;
        },
        
        // Calculate the score
        calculate() {
            try {
                // Check if we have enough information to calculate
                if (!this.state.level || !this.state.suit) {
                    this.elements.resultDisplay.textContent = '';
                    return;
                }
                
                // Ensure tricks is set if level and suit are selected
                if (this.state.tricks === null) {
                    this.state.tricks = this.state.level + 6; // Default to making exactly
                }
                
                const contractTricks = this.state.level + 6;
                const isDoubled = this.state.doubled === 'doubled';
                const isRedoubled = this.state.doubled === 'redoubled';
                
                const score = this.state.scorer.calculateScore(
                    this.state.level,
                    this.state.suit,
                    this.state.tricks,
                    this.state.vulnerable,
                    isDoubled,
                    isRedoubled
                );
                
                this.elements.resultDisplay.textContent = score;
                
                // Add color to the score - green for positive, red for negative
                if (score >= 0) {
                    this.elements.resultDisplay.style.color = '#27ae60';
                } else {
                    this.elements.resultDisplay.style.color = '#e74c3c';
                }
            } catch (error) {
                console.error('Calculation error:', error);
                this.elements.resultDisplay.textContent = 'Error';
                this.elements.resultDisplay.style.color = '#e74c3c';
            }
        },
        
        // Clear the calculator state
        clearCalculator(isInitial = false) {
            // Reset state
            this.state.level = null;
            this.state.suit = null;
            this.state.tricks = null;
            this.state.doubled = 'none';
            this.state.vulnerable = false;
            this.state.contractSelected = false;
            
            // Reset UI
            this.clearSelection('.btn.selected');
            this.elements.vulnerableToggle.checked = false;
            
            // Clear displays
            this.elements.contractDisplay.textContent = '';
            this.elements.contractStateDisplay.textContent = '';
            this.elements.resultDisplay.textContent = '';
            
            // Only log if not initial setup
            if (!isInitial) {
                console.log("Calculator cleared");
            }
        },
        
        // New Contract button
        newContract() {
            if (!this.state.level || !this.state.suit) {
                return; // No contract to reset
            }
            
            // Clear trick selection
            this.clearSelection('.btn.trick');
            
            // Reset tricks to contract level
            this.state.tricks = this.state.level + 6;
            
            // Update display
            this.updateContractDisplay();
            this.elements.resultDisplay.textContent = '';
        },
        
        // Show score breakdown
        showBreakdown() {
            // Check if we have enough information for a breakdown
            if (!this.state.level || !this.state.suit) {
                alert("Please select a complete contract first");
                return;
            }
            
            // Ensure tricks is set if level and suit are selected
            if (this.state.tricks === null) {
                this.state.tricks = this.state.level + 6; // Default to making exactly
            }
            
            // Make sure score is calculated
            this.calculate();
            
            const breakdown = this.state.scorer.getBreakdown();
            const contractTricks = this.state.level + 6;
            
            let content = '';
            
            if (this.state.tricks >= contractTricks) {
                // Making the contract
                content += `<div>Contract: ${this.state.level}${this.state.suit} ${this.state.doubled !== 'none' ? (this.state.doubled === 'doubled' ? 'X' : 'XX') : ''}</div>`;
                content += `<div>Vulnerable: ${this.state.vulnerable ? 'Yes' : 'No'}</div>`;
                content += `<div>Tricks: ${this.state.tricks}/${contractTricks}</div>`;
                content += `<div>Trick Score: ${breakdown.trickScore}</div>`;
                
                if (breakdown.overtrickScore > 0) {
                    content += `<div>Overtrick Score: ${breakdown.overtrickScore}</div>`;
                }
                
                if (breakdown.doubledBonus > 0) {
                    content += `<div>Insult Bonus: ${breakdown.doubledBonus}</div>`;
                }
                
                content += `<div>Game/Part Score: ${breakdown.bonusScore}</div>`;
                
                if (breakdown.slamBonus > 0) {
                    content += `<div>Slam Bonus: ${breakdown.slamBonus}</div>`;
                }
                
                const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
                content += `<div>Total: ${total}</div>`;
            } else {
                // Going down
                content += `<div>Contract: ${this.state.level}${this.state.suit} ${this.state.doubled !== 'none' ? (this.state.doubled === 'doubled' ? 'X' : 'XX') : ''}</div>`;
                content += `<div>Vulnerable: ${this.state.vulnerable ? 'Yes' : 'No'}</div>`;
                content += `<div>Tricks: ${this.state.tricks}/${contractTricks}</div>`;
                content += `<div>Down: ${contractTricks - this.state.tricks}</div>`;
                content += `<div>Total: ${this.elements.resultDisplay.textContent}</div>`;
            }
            
            this.elements.breakdownContent.innerHTML = content;
            this.elements.breakdownModal.style.display = 'block';
        }
    };
    
    // Initialize the calculator
    BridgeCalculator.init();
});