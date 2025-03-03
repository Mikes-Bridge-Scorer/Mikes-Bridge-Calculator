class RegularCalculator {
  constructor() {
    this.display = document.getElementById('calc-display');
    this.keys = document.querySelectorAll('.calc-key');
    this.previousValue = 0;
    this.currentValue = '';
    this.operator = null;
    this.resetInput = false;
    
    this.init();
  }
  
  init() {
    this.keys.forEach(key => {
      key.addEventListener('click', () => this.handleKeyPress(key));
    });
  }
  
  handleKeyPress(key) {
    const type = key.dataset.action;
    const value = key.dataset.value;
    
    if (value) {
      this.inputDigit(value);
    } else if (type === 'operator') {
      this.handleOperator(key.textContent);
    } else if (type === 'clear') {
      this.clear();
    } else if (type === 'backspace') {
      this.backspace();
    } else if (type === 'calculate') {
      this.calculate();
    }
  }
  
  inputDigit(digit) {
    if (this.resetInput) {
      this.currentValue = '';
      this.resetInput = false;
    }
    this.currentValue += digit;
    this.updateDisplay();
  }
  
  handleOperator(operator) {
    const inputValue = parseFloat(this.currentValue);
    
    if (this.operator && !this.resetInput) {
      this.calculate();
    } else if (!this.previousValue && !isNaN(inputValue)) {
      this.previousValue = inputValue;
    }
    
    this.operator = operator;
    this.resetInput = true;
  }
  
  calculate() {
    const inputValue = parseFloat(this.currentValue);
    let result = 0;
    
    if (isNaN(inputValue)) return;
    
    switch (this.operator) {
      case '+':
        result = this.previousValue + inputValue;
        break;
      case '-':
        result = this.previousValue - inputValue;
        break;
      case '×':
        result = this.previousValue * inputValue;
        break;
      case '÷':
        result = this.previousValue / inputValue;
        break;
      case '%':
        result = this.previousValue % inputValue;
        break;
      default:
        return;
    }
    
    this.currentValue = result.toString();
    this.previousValue = result;
    this.operator = null;
    this.updateDisplay();
    this.resetInput = true;
  }
  
  clear() {
    this.currentValue = '';
    this.previousValue = 0;
    this.operator = null;
    this.resetInput = false;
    this.updateDisplay();
  }
  
  backspace() {
    this.currentValue = this.currentValue.slice(0, -1);
    this.updateDisplay();
  }
  
  updateDisplay() {
    this.display.value = this.currentValue || '0';
  }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RegularCalculator();
  
  // Tab switching functionality
  const bridgeTab = document.getElementById('bridge-tab');
  const regularTab = document.getElementById('regular-tab');
  const bridgeCalc = document.getElementById('bridge-calculator');
  const regularCalc = document.getElementById('regular-calculator');
  
  bridgeTab.addEventListener('click', () => {
    bridgeTab.classList.add('active');
    regularTab.classList.remove('active');
    bridgeCalc.classList.add('active');
    regularCalc.classList.remove('active');
  });
  
  regularTab.addEventListener('click', () => {
    regularTab.classList.add('active');
    bridgeTab.classList.remove('active');
    regularCalc.classList.add('active');
    bridgeCalc.classList.remove('active');
  });
});