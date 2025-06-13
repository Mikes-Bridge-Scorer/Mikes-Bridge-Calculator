// Enhanced financial-calculator.js - Fixed for mobile compatibility
document.addEventListener('DOMContentLoaded', function() {
    console.log("Enhanced financial calculator script loaded!");
    
    // Wait a bit longer for all elements to be ready on mobile
    setTimeout(initializeCurrencyCalculator, 100);
});

function initializeCurrencyCalculator() {
    // Get UI elements with error checking
    const display = document.getElementById('currencyCalcDisplay');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const calcButtons = document.querySelectorAll('#currency-calculator .calc-key');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    const miniChartElement = document.getElementById('rateChart');
    const refreshBtn = document.getElementById('refreshRates');
    
    // Debug: Check if elements exist
    console.log('Currency selects found:', {
        fromSelect: !!fromCurrencySelect,
        toSelect: !!toCurrencySelect,
        display: !!display
    });
    
    // Get calculator switching buttons
    const bridgeCalcBtnFromCurr = document.getElementById('bridgeCalcBtnFromCurr');
    const regularCalcBtnFromCurr = document.getElementById('regularCalcBtnFromCurr');
    const currencyCalcBtn = document.getElementById('currencyCalcBtn');
    const currencyCalcBtnFromReg = document.getElementById('currencyCalcBtnFromReg');
    
    // State variables
    let currentInput = '0';
    let lastUpdated = null;
    let currentExchangeRate = 1;
    let chartData = [];
    
    // Comprehensive list of world currencies - simplified for mobile
    const currencies = [
        // Major currencies first
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
        
        // European currencies
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
        { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
        { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
        { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
        { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
        
        // Americas
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
        { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
        { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
        
        // Asia Pacific
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
        { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
        { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
        { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
        
        // Other major currencies
        { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
        { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' }
    ];
    
    // Enhanced conversion rates structure
    let conversionRates = {};
    
    // Initialize conversion rates
    function initializeRates() {
        currencies.forEach(currency => {
            conversionRates[currency.code] = {};
        });
        
        // Set realistic fallback rates (relative to EUR)
        const fallbackRates = {
            'USD': 1.08, 'GBP': 0.86, 'JPY': 161.0, 'CHF': 0.97, 'CAD': 1.46,
            'AUD': 1.64, 'NZD': 1.78, 'CNY': 7.82, 'KRW': 1420.0, 'SGD': 1.46,
            'HKD': 8.45, 'NOK': 11.45, 'SEK': 11.25, 'DKK': 7.46, 'PLN': 4.32,
            'CZK': 24.68, 'HUF': 396.0, 'RON': 4.97, 'MXN': 18.45, 'BRL': 5.42,
            'ARS': 850.0, 'CLP': 920.0, 'INR': 89.65, 'IDR': 16750.0, 'MYR': 4.86,
            'THB': 38.45, 'PHP': 60.25, 'ZAR': 19.85, 'ILS': 3.96, 'AED': 3.97,
            'TRY': 34.85
        };
        
        // Create conversion matrix
        currencies.forEach(fromCurr => {
            currencies.forEach(toCurr => {
                if (fromCurr.code === toCurr.code) {
                    conversionRates[fromCurr.code][toCurr.code] = 1.0;
                } else if (fromCurr.code === 'EUR') {
                    conversionRates[fromCurr.code][toCurr.code] = fallbackRates[toCurr.code] || 1.0;
                } else if (toCurr.code === 'EUR') {
                    conversionRates[fromCurr.code][toCurr.code] = 1.0 / (fallbackRates[fromCurr.code] || 1.0);
                } else {
                    // Cross rate through EUR
                    const fromToEur = 1.0 / (fallbackRates[fromCurr.code] || 1.0);
                    const eurToTo = fallbackRates[toCurr.code] || 1.0;
                    conversionRates[fromCurr.code][toCurr.code] = fromToEur * eurToTo;
                }
            });
        });
    }
    
    // Populate currency selectors with mobile-friendly formatting
    function populateCurrencySelectors() {
        console.log('Attempting to populate currency selectors...');
        
        if (!fromCurrencySelect || !toCurrencySelect) {
            console.error('Currency select elements not found!');
            return;
        }
        
        // Clear existing options
        fromCurrencySelect.innerHTML = '';
        toCurrencySelect.innerHTML = '';
        
        // Add currency options with mobile-friendly format
        currencies.forEach(currency => {
            const fromOption = document.createElement('option');
            fromOption.value = currency.code;
            // Use shorter format for mobile
            fromOption.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
            fromCurrencySelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = currency.code;
            toOption.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
            toCurrencySelect.appendChild(toOption);
        });
        
        // Set default selections
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
        
        console.log('Currency selectors populated successfully');
        console.log('From options count:', fromCurrencySelect.options.length);
        console.log('To options count:', toCurrencySelect.options.length);
        
        // Force a style update for mobile
        fromCurrencySelect.style.display = 'block';
        toCurrencySelect.style.display = 'block';
        
        // Trigger initial conversion
        performConversion();
    }
    
    // Set up calculator button event listeners
    if (calcButtons && calcButtons.length > 0) {
        calcButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent any default behavior
                
                const value = button.dataset.value;
                const action = button.dataset.action;
                
                if (value) {
                    inputDigit(value);
                } else if (action) {
                    switch(action) {
                        case 'clear':
                            clearInput();
                            break;
                        case 'backspace':
                            backspace();
                            break;
                        case 'convert':
                            performConversion();
                            break;
                        case 'refresh':
                            refreshExchangeRates();
                            break;
                    }
                }
            });
        });
    }
    
    // Set up calculator switching with null checks
    if (bridgeCalcBtnFromCurr) {
        bridgeCalcBtnFromCurr.addEventListener('click', switchToBridgeCalculator);
    }
    
    if (regularCalcBtnFromCurr) {
        regularCalcBtnFromCurr.addEventListener('click', switchToRegularCalculator);
    }
    
    if (currencyCalcBtn) {
        currencyCalcBtn.addEventListener('click', switchToCurrencyCalculator);
    }
    
    if (currencyCalcBtnFromReg) {
        currencyCalcBtnFromReg.addEventListener('click', switchToCurrencyCalculator);
    }
    
    // Set up currency selectors with error handling
    if (fromCurrencySelect) {
        fromCurrencySelect.addEventListener('change', performConversion);
    }
    
    if (toCurrencySelect) {
        toCurrencySelect.addEventListener('change', performConversion);
    }

    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshExchangeRates);
    }
    
    // Calculator functions
    function inputDigit(digit) {
        if (digit === '.') {
            if (!currentInput.includes('.')) {
                currentInput += '.';
            }
        } else if (currentInput === '0') {
            currentInput = digit;
        } else {
            currentInput += digit;
        }
        updateDisplay();
        performConversion();
    }
    
    function clearInput() {
        currentInput = '0';
        updateDisplay();
        performConversion();
    }
    
    function backspace() {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
        performConversion();
    }
    
    function updateDisplay() {
        if (display) {
            display.textContent = currentInput;
        }
    }
    
    function updateLastUpdated() {
        if (lastUpdatedElement && lastUpdated) {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            lastUpdatedElement.textContent = `Rates updated: ${lastUpdated.toLocaleString(undefined, options)}`;
        }
    }
    
    function performConversion() {
        if (!fromCurrencySelect || !toCurrencySelect) {
            console.error('Currency selects not available for conversion');
            return;
        }
        
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const amount = parseFloat(currentInput);
        
        if (isNaN(amount)) return;
        
        let result;
        
        if (fromCurrency === toCurrency) {
            result = amount;
            currentExchangeRate = 1;
        } else if (conversionRates[fromCurrency] && conversionRates[fromCurrency][toCurrency]) {
            currentExchangeRate = conversionRates[fromCurrency][toCurrency];
            result = amount * currentExchangeRate;
        } else {
            result = amount;
            currentExchangeRate = 1;
        }
        
        // Get currency info
        const fromCurr = currencies.find(c => c.code === fromCurrency);
        const toCurr = currencies.find(c => c.code === toCurrency);
        
        const fromSymbol = fromCurr ? fromCurr.symbol : '';
        const toSymbol = toCurr ? toCurr.symbol : '';
        
        // Display conversion with mobile-friendly formatting
        if (display) {
            if (amount === 1) {
                display.textContent = `1 ${fromCurrency} = ${result.toFixed(4)} ${toCurrency}`;
            } else {
                display.textContent = `${fromSymbol}${amount.toLocaleString()} = ${toSymbol}${result.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
            }
        }
        
        // Update chart
        updateEnhancedChart(fromCurrency, toCurrency);
    }
    
    function updateEnhancedChart(fromCurrency, toCurrency) {
        if (!miniChartElement) return;
        
        miniChartElement.innerHTML = '';
        
        // Generate simplified chart for mobile
        const days = 30;
        const baseRate = currentExchangeRate;
        chartData = [];
        
        // Create realistic price movement
        let previousRate = baseRate * (0.98 + Math.random() * 0.04);
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Random walk with mean reversion
            const change = (Math.random() - 0.5) * 0.02;
            const meanReversion = (baseRate - previousRate) * 0.1;
            
            previousRate = previousRate * (1 + change + meanReversion);
            
            chartData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rate: previousRate,
                change: change
            });
        }
        
        // Create simplified SVG chart for mobile
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '60');
        svg.setAttribute('viewBox', '0 0 280 60');
        svg.style.backgroundColor = '#f8f9fa';
        svg.style.borderRadius = '6px';
        svg.style.border = '1px solid #dee2e6';
        
        // Calculate chart dimensions
        const margin = { top: 5, right: 10, bottom: 15, left: 10 };
        const chartWidth = 280 - margin.left - margin.right;
        const chartHeight = 60 - margin.top - margin.bottom;
        
        // Find min/max for scaling
        const rates = chartData.map(d => d.rate);
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const rateRange = maxRate - minRate || 0.01; // Avoid division by zero
        
        // Create scales
        const xScale = (index) => margin.left + (index * chartWidth) / (chartData.length - 1);
        const yScale = (rate) => margin.top + chartHeight - ((rate - minRate) / rateRange) * chartHeight;
        
        // Create line path
        let pathData = '';
        chartData.forEach((point, index) => {
            const x = xScale(index);
            const y = yScale(point.rate);
            pathData += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });
        
        // Add main line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        
        // Add current rate label
        const rateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rateLabel.setAttribute('x', '270');
        rateLabel.setAttribute('y', '15');
        rateLabel.setAttribute('text-anchor', 'end');
        rateLabel.setAttribute('font-size', '10');
        rateLabel.setAttribute('font-weight', 'bold');
        rateLabel.setAttribute('fill', '#2c3e50');
        rateLabel.textContent = currentExchangeRate.toFixed(4);
        svg.appendChild(rateLabel);
        
        miniChartElement.appendChild(svg);
    }
    
    // Fetch exchange rates from API
    async function refreshExchangeRates() {
        try {
            showMessage('Updating exchange rates...', 'info');
            
            const response = await fetch('https://api.frankfurter.app/latest?from=EUR');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.rates) {
                throw new Error('Invalid API response');
            }
            
            // Update rates from EUR base
            const eurRates = data.rates;
            
            // Clear existing rates
            initializeRates();
            
            // Update EUR-based rates
            currencies.forEach(currency => {
                if (currency.code === 'EUR') return;
                
                if (eurRates[currency.code]) {
                    conversionRates['EUR'][currency.code] = eurRates[currency.code];
                    conversionRates[currency.code]['EUR'] = 1 / eurRates[currency.code];
                }
            });
            
            // Calculate cross rates
            currencies.forEach(fromCurr => {
                currencies.forEach(toCurr => {
                    if (fromCurr.code !== toCurr.code && fromCurr.code !== 'EUR' && toCurr.code !== 'EUR') {
                        if (eurRates[fromCurr.code] && eurRates[toCurr.code]) {
                            conversionRates[fromCurr.code][toCurr.code] = eurRates[toCurr.code] / eurRates[fromCurr.code];
                        }
                    }
                });
            });
            
            lastUpdated = new Date();
            updateLastUpdated();
            performConversion();
            
            showMessage('Exchange rates updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            showMessage('Failed to update rates. Using cached data.', 'error');
        }
    }
    
    function showMessage(text, type = 'success') {
        // Remove any existing messages first
        const existingMessages = document.querySelectorAll('.calculator-message');
        existingMessages.forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `calculator-message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            padding: 8px 16px; border-radius: 5px; color: white; font-weight: bold;
            z-index: 1000; opacity: 1; transition: opacity 0.5s; font-size: 14px;
            background-color: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 500);
        }, 3000);
    }
    
    // Calculator switching functions
    function switchToBridgeCalculator() {
        const bridgeCalc = document.getElementById('bridge-calculator');
        const regularCalc = document.getElementById('regular-calculator');
        const currencyCalc = document.getElementById('currency-calculator');
        
        if (bridgeCalc) bridgeCalc.style.display = 'block';
        if (regularCalc) regularCalc.style.display = 'none';
        if (currencyCalc) currencyCalc.style.display = 'none';
    }
    
    function switchToRegularCalculator() {
        const bridgeCalc = document.getElementById('bridge-calculator');
        const regularCalc = document.getElementById('regular-calculator');
        const currencyCalc = document.getElementById('currency-calculator');
        
        if (bridgeCalc) bridgeCalc.style.display = 'none';
        if (regularCalc) regularCalc.style.display = 'block';
        if (currencyCalc) currencyCalc.style.display = 'none';
    }
    
    function switchToCurrencyCalculator() {
        const bridgeCalc = document.getElementById('bridge-calculator');
        const regularCalc = document.getElementById('regular-calculator');
        const currencyCalc = document.getElementById('currency-calculator');
        
        if (bridgeCalc) bridgeCalc.style.display = 'none';
        if (regularCalc) regularCalc.style.display = 'none';
        if (currencyCalc) {
            currencyCalc.style.display = 'block';
            // Refresh display when switching
            setTimeout(() => {
                performConversion();
            }, 100);
        }
    }
    
    // Initialize everything
    console.log('Starting initialization...');
    initializeRates();
    populateCurrencySelectors();
    updateDisplay();
    lastUpdated = new Date();
    updateLastUpdated();
    
    // Fetch rates on load with delay for mobile
    setTimeout(() => {
        refreshExchangeRates();
    }, 500);
    
    console.log('Currency calculator initialization complete');
}
