// Enhanced Regular Calculator Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log("Regular calculator script loaded successfully!");
    
    // Get calculator elements
    const regularCalcBtn = document.getElementById('regularCalcBtn');
    const bridgeCalcBtn = document.getElementById('bridgeCalcBtn');
    const currencyCalcBtnFromReg = document.getElementById('currencyCalcBtnFromReg');
    const regularCalcDisplay = document.getElementById('regularCalcDisplay');
    const expressionDisplay = document.getElementById('expressionDisplay');
    
    // Currency calculator buttons
    const currencyCalcBtn = document.getElementById('currencyCalcBtn');
    const bridgeCalcBtnFromCurr = document.getElementById('bridgeCalcBtnFromCurr');
    const regularCalcBtnFromCurr = document.getElementById('regularCalcBtnFromCurr');
    
    // Regular Calculator state variables
    let currentInput = '0';
    let previousInput = null;
    let currentOperator = null;
    let waitingForOperand = false;
    let calculationPerformed = false;
    let expressionString = '';
    
    // Set up calculator switching
    if (regularCalcBtn) {
        regularCalcBtn.addEventListener('click', function() {
            switchToRegularCalculator();
        });
    }
    
    if (bridgeCalcBtn) {
        bridgeCalcBtn.addEventListener('click', function() {
            switchToBridgeCalculator();
        });
    }
    
    if (currencyCalcBtnFromReg) {
        currencyCalcBtnFromReg.addEventListener('click', function() {
            switchToCurrencyCalculator();
        });
    }
    
    if (currencyCalcBtn) {
        currencyCalcBtn.addEventListener('click', function() {
            switchToCurrencyCalculator();
        });
    }
    
    if (bridgeCalcBtnFromCurr) {
        bridgeCalcBtnFromCurr.addEventListener('click', function() {
            switchToBridgeCalculator();
        });
    }
    
    if (regularCalcBtnFromCurr) {
        regularCalcBtnFromCurr.addEventListener('click', function() {
            switchToRegularCalculator();
        });
    }
    
    // Add calculator button functionality
    const calcButtons = document.querySelectorAll('#regular-calculator .calc-key');
    calcButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleButtonClick(button);
        });
    });
    
    // Add keyboard support
    document.addEventListener('keydown', function(event) {
        // Only process keys when regular calculator is visible
        if (document.getElementById('regular-calculator').style.display === 'block') {
            handleKeyPress(event);
        }
    });
    
    // Button click handler
    function handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        if (value) {
            inputDigit(value);
        } else if (action) {
            switch (action) {
                case 'clear':
                    clearCalculator();
                    break;
                case 'ce':
                    clearEntry();
                    break;
                case 'backspace':
                    backspace();
                    break;
                case 'operator':
                    handleOperator(button.textContent);
                    break;
                case 'percent':
                    percent();
                    break;
                case 'sqrt':
                    squareRoot();
                    break;
                case 'calculate':
                    calculate(true);
                    break;
            }
        }
    }
    
    // Keyboard press handler
    function handleKeyPress(event) {
        const key = event.key;
        
        // Digits
        if (/^[0-9]$/.test(key)) {
            event.preventDefault();
            inputDigit(key);
        } 
        // Decimal point
        else if (key === '.') {
            event.preventDefault();
            inputDigit('.');
        }
        // Operators
        else if (key === '+' || key === '-' || key === '*' || key === '/') {
            event.preventDefault();
            const operatorMap = {
                '+': '+',
                '-': '-',
                '*': '×',
                '/': '÷'
            };
            handleOperator(operatorMap[key]);
        }
        // Calculate
        else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calculate(true);
        }
        // Clear
        else if (key === 'Escape') {
            event.preventDefault();
            clearCalculator();
        }
        // Backspace
        else if (key === 'Backspace') {
            event.preventDefault();
            backspace();
        }
        // Percent
        else if (key === '%') {
            event.preventDefault();
            percent();
        }
    }
    
    // Input a digit
    function inputDigit(digit) {
        // If we just performed a calculation and start a new input
        if (calculationPerformed) {
            expressionString = '';
            currentInput = '0';
            calculationPerformed = false;
        }
        
        // If we're waiting for an operand, clear the current input for new number
        if (waitingForOperand) {
            currentInput = '0';
            waitingForOperand = false;
        }
        
        // Handle decimal point
        if (digit === '.') {
            // If we don't already have a decimal point
            if (!currentInput.includes('.')) {
                currentInput += '.';
            }
        } else {
            // If current input is just '0', replace it
            if (currentInput === '0') {
                currentInput = digit;
            } else {
                // Otherwise append the digit
                currentInput += digit;
            }
        }
        
        updateDisplay();
    }
    
    // Handle operators
    function handleOperator(operator) {
        const inputValue = parseFloat(currentInput);
        
        // If we already have a pending operation but user enters a new one
        if (currentOperator && !waitingForOperand) {
            // Update expression first before calculating
            expressionString += currentInput;
            updateExpressionDisplay();
            
            // Perform the pending operation
            calculate(false); // false means don't update expression with equals
        } else {
            // Otherwise just save the current input as previous
            previousInput = inputValue;
            
            // Start or update expression display
            if (expressionString === '' || calculationPerformed) {
                expressionString = inputValue + ' ' + operator + ' ';
            } else {
                expressionString += inputValue + ' ' + operator + ' ';
            }
            updateExpressionDisplay();
        }
        
        // Save the operator and start waiting for next operand
        currentOperator = operator;
        waitingForOperand = true;
        calculationPerformed = false;
    }
    
    // Calculate the result
    function calculate(showEquals = true) {
        // We need both inputs and an operator to calculate
        if (previousInput === null || currentOperator === null) {
            return;
        }
        
        const inputValue = parseFloat(currentInput);
        let result;
        
        // Add to expression display if we're showing equals
        if (showEquals) {
            expressionString += currentInput + ' = ';
        }
        updateExpressionDisplay();
        
        // Perform the calculation based on the operator
        switch (currentOperator) {
            case '+':
                result = previousInput + inputValue;
                break;
            case '-':
                result = previousInput - inputValue;
                break;
            case '×':
                result = previousInput * inputValue;
                break;
            case '÷':
                if (inputValue === 0) {
                    // Handle division by zero
                    currentInput = 'Error';
                    currentOperator = null;
                    previousInput = null;
                    updateDisplay();
                    return;
                }
                result = previousInput / inputValue;
                break;
        }
        
        // Format and update the result
        currentInput = formatResult(result);
        currentOperator = null;
        previousInput = result; // Store result as previous input for continued operations
        if (showEquals) {
            calculationPerformed = true;
        }
        updateDisplay();
    }
    
    // Format the result to avoid very long decimals
    function formatResult(number) {
        // Convert to string for examination
        const numStr = number.toString();
        
        // If it's an integer or already in scientific notation, just return it
        if (Number.isInteger(number) || numStr.includes('e')) {
            return numStr;
        }
        
        // For very large or very small numbers, use scientific notation
        if (Math.abs(number) > 1e10 || (Math.abs(number) < 1e-7 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // For long decimals, limit to reasonable precision
        if (numStr.split('.')[1] && numStr.split('.')[1].length > 10) {
            return number.toFixed(10);
        }
        
        return numStr;
    }
    
    // Clear calculator
    function clearCalculator() {
        currentInput = '0';
        previousInput = null;
        currentOperator = null;
        waitingForOperand = false;
        calculationPerformed = false;
        expressionString = '';
        updateDisplay();
        updateExpressionDisplay();
    }
    
    // Clear Entry (CE) - clears only current entry
    function clearEntry() {
        currentInput = '0';
        updateDisplay();
    }
    
    // Backspace function
    function backspace() {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }
    
    // Percent function
    function percent() {
        const value = parseFloat(currentInput);
        
        if (!isNaN(value)) {
            if (previousInput !== null) {
                // If in the middle of a calculation, calculate percentage of previous value
                currentInput = (previousInput * value / 100).toString();
            } else {
                // Otherwise just convert to percentage
                currentInput = (value / 100).toString();
            }
            updateDisplay();
        }
    }
    
    // Square root function
    function squareRoot() {
        const value = parseFloat(currentInput);
        
        if (!isNaN(value)) {
            if (value < 0) {
                currentInput = 'Error';
            } else {
                currentInput = Math.sqrt(value).toString();
                expressionString = '√(' + value + ') = ';
                updateExpressionDisplay();
            }
            updateDisplay();
        }
    }
    
    // Update the display
    function updateDisplay() {
        regularCalcDisplay.textContent = currentInput;
    }
    
    // Update the expression display
    function updateExpressionDisplay() {
        if (expressionDisplay) {
            expressionDisplay.textContent = expressionString;
        }
    }
    
    // Helper functions for calculator switching
    function switchToBridgeCalculator() {
        document.getElementById('bridge-calculator').style.display = 'block';
        document.getElementById('regular-calculator').style.display = 'none';
        document.getElementById('currency-calculator').style.display = 'none';
    }
    
    function switchToRegularCalculator() {
        document.getElementById('bridge-calculator').style.display = 'none';
        document.getElementById('regular-calculator').style.display = 'block';
        document.getElementById('currency-calculator').style.display = 'none';
    }
    
    function switchToCurrencyCalculator() {
        document.getElementById('bridge-calculator').style.display = 'none';
        document.getElementById('regular-calculator').style.display = 'none';
        document.getElementById('currency-calculator').style.display = 'block';
    }
});