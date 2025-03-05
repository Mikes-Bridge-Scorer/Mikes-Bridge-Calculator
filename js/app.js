// Main application logic for Bridge Scoring Calculator
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const contractDisplay = document.getElementById('contractDisplay');
    const contractStateDisplay = document.getElementById('contractStateDisplay');
    const resultDisplay = document.getElementById('resultDisplay');
    const vulnerableToggle = document.getElementById('vulnerableToggle');
    const clearBtn = document.getElementById('clearBtn');
    const breakdownBtn = document.getElementById('breakdownBtn');
    const breakdownModal = document.getElementById('breakdownModal');
    const breakdownContent = document.getElementById('breakdownContent');
    const closeModal = document.querySelector('.close');
    
    // Calculator switcher buttons
    const regularCalcBtn = document.getElementById('regularCalcBtn');
    const currencyCalcBtn = document.getElementById('currencyCalcBtn');
    const bridgeCalcBtnFromCurr = document.getElementById('bridgeCalcBtnFromCurr');
    const regularCalcBtnFromCurr = document.getElementById('regularCalcBtnFromCurr');
    
    // State variables
    let currentLevel = null;
    let currentSuit = null;
    let currentTricks = null;
    let isVulnerable = false;
    let doubledState = 'none'; // 'none', 'doubled', or 'redoubled'
    let scorer = BridgeScoring.createScorer();
    
    // Initialize
    init();
    
    function init() {
        bindEvents();
        clearCalculator(true);
        console.log("Bridge calculator app initialized");
    }
    
    function bindEvents() {
        // Level buttons
        document.querySelectorAll('.btn.level').forEach(button => {
            button.addEventListener('click', () => {
                setLevel(parseInt(button.dataset.level));
            });
        });
        
        // Suit buttons
        document.querySelectorAll('.btn.suit').forEach(button => {
            button.addEventListener('click', () => {
                setSuit(button.dataset.suit);
            });
        });
        
        // Trick buttons
        document.querySelectorAll('.btn.trick').forEach(button => {
            button.addEventListener('click', () => {
                setTricks(button.dataset.trick);
            });
        });
        
        // Contract state buttons (doubled/redoubled)
        document.querySelectorAll('.btn.contract-state').forEach(button => {
            button.addEventListener('click', () => {
                setContractState(button.dataset.state);
            });
        });
        
        // Vulnerable toggle
        vulnerableToggle.addEventListener('change', () => {
            isVulnerable = vulnerableToggle.checked;
            updateDisplay();
            calculate();
        });
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            clearCalculator();
        });
        
        // Breakdown button
        breakdownBtn.addEventListener('click', () => {
            showBreakdown();
        });
        
        // Close modal
        closeModal.addEventListener('click', () => {
            breakdownModal.style.display = 'none';
        });
        
        // Click outside modal to close
        window.addEventListener('click', (event) => {
            if (event.target === breakdownModal) {
                breakdownModal.style.display = 'none';
            }
        });
        
        // Calculator switcher buttons
        if (regularCalcBtn) {
            console.log("Regular calculator button found:", !!regularCalcBtn);
            regularCalcBtn.addEventListener('click', () => {
                console.log("Adding click event to 123 button");
                switchToRegularCalculator();
            });
        }
        
        if (currencyCalcBtn) {
            currencyCalcBtn.addEventListener('click', () => {
                switchToCurrencyCalculator();
            });
        }
        
        // Bind bridge and regular calculator buttons from currency calculator if they exist
        if (bridgeCalcBtnFromCurr) {
            bridgeCalcBtnFromCurr.addEventListener('click', () => {
                switchToBridgeCalculator();
            });
        }
        
        if (regularCalcBtnFromCurr) {
            regularCalcBtnFromCurr.addEventListener('click', () => {
                switchToRegularCalculator();
            });
        }
    }
    
    function setLevel(level) {
        clearSelection('.btn.level');
        currentLevel = level;
        document.querySelector(`.btn.level[data-level="${level}"]`).classList.add('selected');
        updateDisplay();
        calculate();
    }
    
    function setSuit(suit) {
        clearSelection('.btn.suit');
        currentSuit = suit;
        document.querySelector(`.btn.suit[data-suit="${suit}"]`).classList.add('selected');
        updateDisplay();
        calculate();
    }
    
    function setTricks(trickChange) {
        if (!currentLevel || !currentSuit) return;
        
        const trickButton = document.querySelector(`.btn.trick[data-trick="${trickChange}"]`);
        if (trickButton.classList.contains('selected')) {
            trickButton.classList.remove('selected');
            currentTricks = currentLevel + 6;
        } else {
            clearSelection('.btn.trick');
            const contractTricks = currentLevel + 6;
            
            if (trickChange.startsWith('-')) {
                const undertricks = parseInt(trickChange.slice(1));
                currentTricks = contractTricks - undertricks;
            } else {
                const overtricks = parseInt(trickChange.slice(1));
                currentTricks = contractTricks + overtricks;
            }
            
            trickButton.classList.add('selected');
        }
        
        updateDisplay();
        calculate();
    }
    
    function setContractState(state) {
        if (!currentLevel || !currentSuit) return;
        
        const stateButton = document.querySelector(`.btn.contract-state[data-state="${state}"]`);
        if (stateButton.classList.contains('selected')) {
            stateButton.classList.remove('selected');
            doubledState = 'none';
        } else {
            clearSelection('.btn.contract-state');
            doubledState = state;
            stateButton.classList.add('selected');
        }
        
        updateDisplay();
        calculate();
    }
    
    function clearSelection(selector) {
        document.querySelectorAll(`${selector}.selected`).forEach(button => {
            button.classList.remove('selected');
        });
    }
    
    function updateDisplay() {
        if (!currentLevel || !currentSuit) {
            contractDisplay.textContent = '';
            contractStateDisplay.textContent = '';
            return;
        }
        
        let suitSymbol = currentSuit;
        
        if (suitSymbol === 'C') suitSymbol = '♣';
        else if (suitSymbol === 'D') suitSymbol = '♦';
        else if (suitSymbol === 'H') suitSymbol = '♥';
        else if (suitSymbol === 'S') suitSymbol = '♠';
        
        contractDisplay.textContent = `${currentLevel}${suitSymbol}`;
        
        let stateText = '';
        
        if (currentTricks !== null) {
            const contractTricks = currentLevel + 6;
            if (currentTricks > contractTricks) {
                stateText += `+${currentTricks - contractTricks} `;
            } else if (currentTricks < contractTricks) {
                stateText += `${currentTricks - contractTricks} `;
            }
        }
        
        if (isVulnerable) {
            stateText += 'Vul ';
        }
        
        if (doubledState === 'doubled') {
            stateText += 'X';
        } else if (doubledState === 'redoubled') {
            stateText += 'XX';
        }
        
        contractStateDisplay.textContent = stateText;
    }
    
    function calculate() {
        try {
            if (!currentLevel || !currentSuit) {
                resultDisplay.textContent = '';
                return;
            }
            
            if (currentTricks === null) {
                currentTricks = currentLevel + 6;
            }
            
            const score = scorer.calculateScore(
                currentLevel,
                currentSuit,
                currentTricks,
                isVulnerable,
                doubledState === 'doubled',
                doubledState === 'redoubled'
            );
            
            resultDisplay.textContent = score;
            
            if (score >= 0) {
                resultDisplay.style.color = '#27ae60';
            } else {
                resultDisplay.style.color = '#e74c3c';
            }
        } catch (error) {
            console.error('Calculation error:', error);
            resultDisplay.textContent = 'Error';
            resultDisplay.style.color = '#e74c3c';
        }
    }
    
    function clearCalculator(isInitial = false) {
        currentLevel = null;
        currentSuit = null;
        currentTricks = null;
        doubledState = 'none';
        isVulnerable = false;
        
        clearSelection('.btn.selected');
        vulnerableToggle.checked = false;
        
        contractDisplay.textContent = '';
        contractStateDisplay.textContent = '';
        resultDisplay.textContent = '';
        
        if (!isInitial) {
            console.log("Calculator cleared");
        }
    }
    
    function showBreakdown() {
        if (!currentLevel || !currentSuit) {
            alert("Please select a complete contract first");
            return;
        }
        
        if (currentTricks === null) {
            currentTricks = currentLevel + 6;
        }
        
        calculate();
        
        const breakdown = scorer.getBreakdown();
        const contractTricks = currentLevel + 6;
        
        let content = '';
        
        if (currentTricks >= contractTricks) {
            content += `<div>Contract: ${currentLevel}${currentSuit} ${doubledState !== 'none' ? (doubledState === 'doubled' ? 'X' : 'XX') : ''}</div>`;
            content += `<div>Vulnerable: ${isVulnerable ? 'Yes' : 'No'}</div>`;
            content += `<div>Tricks: ${currentTricks}/${contractTricks}</div>`;
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
            content += `<div>Contract: ${currentLevel}${currentSuit} ${doubledState !== 'none' ? (doubledState === 'doubled' ? 'X' : 'XX') : ''}</div>`;
            content += `<div>Vulnerable: ${isVulnerable ? 'Yes' : 'No'}</div>`;
            content += `<div>Tricks: ${currentTricks}/${contractTricks}</div>`;
            content += `<div>Down: ${contractTricks - currentTricks}</div>`;
            content += `<div>Total: ${resultDisplay.textContent}</div>`;
        }
        
        breakdownContent.innerHTML = content;
        breakdownModal.style.display = 'block';
    }
    
    // Calculator switching functions
    function switchToRegularCalculator() {
        document.getElementById('bridge-calculator').style.display = 'none';
        document.getElementById('regular-calculator').style.display = 'block';
        if (document.getElementById('currency-calculator')) {
            document.getElementById('currency-calculator').style.display = 'none';
        }
        console.log("Switching to regular calculator");
    }
    
    function switchToCurrencyCalculator() {
        document.getElementById('bridge-calculator').style.display = 'none';
        document.getElementById('regular-calculator').style.display = 'none';
        if (document.getElementById('currency-calculator')) {
            document.getElementById('currency-calculator').style.display = 'block';
        } else {
            alert("Currency calculator coming soon!");
        }
    }
    
    function switchToBridgeCalculator() {
        document.getElementById('regular-calculator').style.display = 'none';
        if (document.getElementById('currency-calculator')) {
            document.getElementById('currency-calculator').style.display = 'none';
        }
        document.getElementById('bridge-calculator').style.display = 'block';
    }
    
    // You can test calculator switching directly in the console
    console.log("You can test calculator switching directly in the console by running:");
    console.log("document.getElementById('bridge-calculator').style.display = 'none';");
    console.log("document.getElementById('regular-calculator').style.display = 'block';");
});