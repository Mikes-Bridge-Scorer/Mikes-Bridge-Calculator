// Enhanced financial-calculator.js - Now with cryptocurrency support
document.addEventListener('DOMContentLoaded', function() {
    console.log("Enhanced financial calculator with crypto support loaded!");
    
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
    
    // Enhanced list with cryptocurrencies
    const currencies = [
        // Major Cryptocurrencies (top section)
        { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '🪙', type: 'crypto' },
        { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '🔷', type: 'crypto' },
        { code: 'BNB', name: 'Binance Coin', symbol: 'BNB', flag: '🟡', type: 'crypto' },
        { code: 'XRP', name: 'Ripple', symbol: 'XRP', flag: '🌊', type: 'crypto' },
        { code: 'ADA', name: 'Cardano', symbol: 'ADA', flag: '🔵', type: 'crypto' },
        { code: 'SOL', name: 'Solana', symbol: 'SOL', flag: '🟣', type: 'crypto' },
        { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', flag: '🐕', type: 'crypto' },
        { code: 'DOT', name: 'Polkadot', symbol: 'DOT', flag: '⚫', type: 'crypto' },
        { code: 'AVAX', name: 'Avalanche', symbol: 'AVAX', flag: '🔺', type: 'crypto' },
        { code: 'MATIC', name: 'Polygon', symbol: 'MATIC', flag: '🟣', type: 'crypto' },
        { code: 'LTC', name: 'Litecoin', symbol: 'Ł', flag: '⚡', type: 'crypto' },
        { code: 'LINK', name: 'Chainlink', symbol: 'LINK', flag: '🔗', type: 'crypto' },
        
        // Separator for UI
        { code: 'SEPARATOR', name: '────── Traditional Currencies ──────', type: 'separator' },
        
        // Major fiat currencies
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', type: 'fiat' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', type: 'fiat' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', type: 'fiat' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', type: 'fiat' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', type: 'fiat' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', type: 'fiat' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', type: 'fiat' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', type: 'fiat' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', type: 'fiat' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', type: 'fiat' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', type: 'fiat' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', type: 'fiat' },
        
        // European currencies
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', type: 'fiat' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', type: 'fiat' },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', type: 'fiat' },
        { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', type: 'fiat' },
        { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', type: 'fiat' },
        { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', type: 'fiat' },
        
        // Americas
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', type: 'fiat' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', type: 'fiat' },
        { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷', type: 'fiat' },
        
        // Asia Pacific
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', type: 'fiat' },
        { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', type: 'fiat' },
        { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', type: 'fiat' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', type: 'fiat' },
        
        // Others
        { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', type: 'fiat' },
        { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱', type: 'fiat' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', type: 'fiat' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', type: 'fiat' }
    ];
    
    // Enhanced conversion rates structure
    let conversionRates = {};
    
    // Initialize conversion rates with crypto support
    function initializeRates() {
        currencies.forEach(currency => {
            if (currency.type !== 'separator') {
                conversionRates[currency.code] = {};
            }
        });
        
        // Realistic fallback rates (relative to USD for both fiat and crypto)
        const fallbackRates = {
            // Crypto rates (in USD)
            'BTC': 43250.00, 'ETH': 2650.00, 'BNB': 310.50, 'XRP': 0.52,
            'ADA': 0.38, 'SOL': 98.50, 'DOGE': 0.072, 'DOT': 5.85,
            'AVAX': 24.80, 'MATIC': 0.73, 'LTC': 72.50, 'LINK': 14.25,
            
            // Fiat rates (relative to USD)
            'EUR': 0.9259, 'GBP': 0.7968, 'JPY': 149.12, 'CHF': 0.8987,
            'CAD': 1.3542, 'AUD': 1.5125, 'NZD': 1.6485, 'CNY': 7.2456,
            'KRW': 1305.25, 'SGD': 1.3524, 'HKD': 7.8456, 'NOK': 10.6235,
            'SEK': 10.4562, 'DKK': 6.8945, 'PLN': 4.0125, 'CZK': 22.5641,
            'HUF': 359.25, 'MXN': 17.0254, 'BRL': 4.9856, 'ARS': 365.25,
            'INR': 83.1254, 'IDR': 15485.25, 'MYR': 4.6825, 'THB': 35.6254,
            'ZAR': 18.7546, 'ILS': 3.6254, 'AED': 3.6725, 'TRY': 29.1254
        };
        
        // Create conversion matrix
        currencies.forEach(fromCurr => {
            if (fromCurr.type === 'separator') return;
            
            currencies.forEach(toCurr => {
                if (toCurr.type === 'separator') return;
                
                if (fromCurr.code === toCurr.code) {
                    conversionRates[fromCurr.code][toCurr.code] = 1.0;
                } else if (fromCurr.code === 'USD') {
                    conversionRates[fromCurr.code][toCurr.code] = fallbackRates[toCurr.code] || 1.0;
                } else if (toCurr.code === 'USD') {
                    conversionRates[fromCurr.code][toCurr.code] = 1.0 / (fallbackRates[fromCurr.code] || 1.0);
                } else {
                    // Cross rate through USD
                    const fromToUsd = 1.0 / (fallbackRates[fromCurr.code] || 1.0);
                    const usdToTo = fallbackRates[toCurr.code] || 1.0;
                    conversionRates[fromCurr.code][toCurr.code] = fromToUsd * usdToTo;
                }
            });
        });
    }
    
    // Enhanced currency selector population with crypto section
    function populateCurrencySelectors() {
        console.log('Populating currency selectors with crypto support...');
        
        if (!fromCurrencySelect || !toCurrencySelect) {
            console.error('Currency select elements not found!');
            return;
        }
        
        // Clear existing options
        fromCurrencySelect.innerHTML = '';
        toCurrencySelect.innerHTML = '';
        
        // Add currency options with sections
        currencies.forEach(currency => {
            if (currency.type === 'separator') {
                // Add separator option (disabled)
                const fromSeparator = document.createElement('option');
                fromSeparator.disabled = true;
                fromSeparator.textContent = currency.name;
                fromCurrencySelect.appendChild(fromSeparator);
                
                const toSeparator = document.createElement('option');
                toSeparator.disabled = true;
                toSeparator.textContent = currency.name;
                toCurrencySelect.appendChild(toSeparator);
            } else {
                const fromOption = document.createElement('option');
                fromOption.value = currency.code;
                
                // Enhanced formatting with type indicator
                if (currency.type === 'crypto') {
                    fromOption.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
                    fromOption.style.fontWeight = 'bold';
                    fromOption.style.color = '#f39c12';
                } else {
                    fromOption.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
                }
                
                fromCurrencySelect.appendChild(fromOption);
                
                const toOption = document.createElement('option');
                toOption.value = currency.code;
                
                if (currency.type === 'crypto') {
                    toOption.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
                    toOption.style.fontWeight = 'bold';
                    toOption.style.color = '#f39c12';
                } else {
                    toOption.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
                }
                
                toCurrencySelect.appendChild(toOption);
            }
        });
        
        // Set default selections - Bitcoin to USD for demo
        fromCurrencySelect.value = 'BTC';
        toCurrencySelect.value = 'USD';
        
        console.log('Currency selectors populated with crypto support');
        
        // Trigger initial conversion
        performConversion();
    }
    
    // Enhanced API fetching with crypto support
    async function refreshExchangeRates() {
        try {
            showMessage('Updating exchange rates (including crypto)...', 'info');
            
            // Fetch both fiat and crypto rates
            const [fiatResponse, cryptoResponse] = await Promise.allSettled([
                fetch('https://api.frankfurter.app/latest?from=USD'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,cardano,solana,dogecoin,polkadot,avalanche-2,matic-network,litecoin,chainlink&vs_currencies=usd')
            ]);
            
            // Process fiat rates
            if (fiatResponse.status === 'fulfilled' && fiatResponse.value.ok) {
                const fiatData = await fiatResponse.value.json();
                
                if (fiatData && fiatData.rates) {
                    // Update USD-based fiat rates
                    const usdRates = fiatData.rates;
                    
                    currencies.forEach(currency => {
                        if (currency.type === 'fiat' && currency.code !== 'USD') {
                            if (usdRates[currency.code]) {
                                conversionRates['USD'][currency.code] = usdRates[currency.code];
                                conversionRates[currency.code]['USD'] = 1 / usdRates[currency.code];
                            }
                        }
                    });
                }
            }
            
            // Process crypto rates
            if (cryptoResponse.status === 'fulfilled' && cryptoResponse.value.ok) {
                const cryptoData = await cryptoResponse.value.json();
                
                // Mapping CoinGecko IDs to our currency codes
                const cryptoMapping = {
                    'bitcoin': 'BTC',
                    'ethereum': 'ETH',
                    'binancecoin': 'BNB',
                    'ripple': 'XRP',
                    'cardano': 'ADA',
                    'solana': 'SOL',
                    'dogecoin': 'DOGE',
                    'polkadot': 'DOT',
                    'avalanche-2': 'AVAX',
                    'matic-network': 'MATIC',
                    'litecoin': 'LTC',
                    'chainlink': 'LINK'
                };
                
                // Update crypto rates (all relative to USD)
                Object.entries(cryptoMapping).forEach(([coinId, currencyCode]) => {
                    if (cryptoData[coinId] && cryptoData[coinId].usd) {
                        const usdPrice = cryptoData[coinId].usd;
                        conversionRates[currencyCode]['USD'] = usdPrice;
                        conversionRates['USD'][currencyCode] = 1 / usdPrice;
                    }
                });
            }
            
            // Recalculate cross rates
            currencies.forEach(fromCurr => {
                if (fromCurr.type === 'separator') return;
                
                currencies.forEach(toCurr => {
                    if (toCurr.type === 'separator') return;
                    
                    if (fromCurr.code !== toCurr.code && 
                        fromCurr.code !== 'USD' && 
                        toCurr.code !== 'USD') {
                        
                        const fromToUsd = conversionRates[fromCurr.code]['USD'];
                        const usdToTo = conversionRates['USD'][toCurr.code];
                        
                        if (fromToUsd && usdToTo) {
                            conversionRates[fromCurr.code][toCurr.code] = fromToUsd * usdToTo;
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
    
    // Enhanced chart with crypto styling
    function updateEnhancedChart(fromCurrency, toCurrency) {
        if (!miniChartElement) return;
        
        miniChartElement.innerHTML = '';
        
        // Check if either currency is crypto for special styling
        const fromCrypto = currencies.find(c => c.code === fromCurrency && c.type === 'crypto');
        const toCrypto = currencies.find(c => c.code === toCurrency && c.type === 'crypto');
        const isCryptoChart = fromCrypto || toCrypto;
        
        // Generate chart data with higher volatility for crypto
        const days = 30;
        const baseRate = currentExchangeRate;
        chartData = [];
        
        let previousRate = baseRate * (0.95 + Math.random() * 0.1);
        const volatilityMultiplier = isCryptoChart ? 3 : 1; // Higher volatility for crypto
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // More volatile random walk for crypto
            const change = (Math.random() - 0.5) * 0.05 * volatilityMultiplier;
            const meanReversion = (baseRate - previousRate) * 0.05;
            
            previousRate = previousRate * (1 + change + meanReversion);
            
            chartData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rate: previousRate,
                change: change
            });
        }
        
        // Create SVG chart with crypto-specific styling
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '60');
        svg.setAttribute('viewBox', '0 0 280 60');
        svg.style.backgroundColor = isCryptoChart ? '#1a1a2e' : '#f8f9fa';
        svg.style.borderRadius = '6px';
        svg.style.border = isCryptoChart ? '1px solid #f39c12' : '1px solid #dee2e6';
        
        // Calculate chart dimensions
        const margin = { top: 5, right: 10, bottom: 15, left: 10 };
        const chartWidth = 280 - margin.left - margin.right;
        const chartHeight = 60 - margin.top - margin.bottom;
        
        // Find min/max for scaling
        const rates = chartData.map(d => d.rate);
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const rateRange = maxRate - minRate || 0.01;
        
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
        
        // Add main line with crypto-specific color
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', isCryptoChart ? '#f39c12' : '#3498db');
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
        rateLabel.setAttribute('fill', isCryptoChart ? '#f39c12' : '#2c3e50');
        
        // Format rate display based on value
        let displayRate;
        if (currentExchangeRate > 1000) {
            displayRate = currentExchangeRate.toLocaleString(undefined, {maximumFractionDigits: 0});
        } else if (currentExchangeRate > 1) {
            displayRate = currentExchangeRate.toFixed(2);
        } else {
            displayRate = currentExchangeRate.toFixed(6);
        }
        
        rateLabel.textContent = displayRate;
        svg.appendChild(rateLabel);
        
        miniChartElement.appendChild(svg);
    }
    
    // Enhanced conversion display with crypto formatting
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
        
        // Enhanced display with appropriate precision for crypto
        if (display) {
            if (amount === 1) {
                let rateDisplay;
                if (currentExchangeRate > 1000) {
                    rateDisplay = currentExchangeRate.toLocaleString(undefined, {maximumFractionDigits: 0});
                } else if (currentExchangeRate > 1) {
                    rateDisplay = currentExchangeRate.toFixed(4);
                } else {
                    rateDisplay = currentExchangeRate.toFixed(8);
                }
                display.textContent = `1 ${fromCurrency} = ${rateDisplay} ${toCurrency}`;
            } else {
                let resultDisplay;
                if (result > 1000) {
                    resultDisplay = result.toLocaleString(undefined, {maximumFractionDigits: 2});
                } else if (result > 1) {
                    resultDisplay = result.toFixed(4);
                } else {
                    resultDisplay = result.toFixed(8);
                }
                display.textContent = `${fromSymbol}${amount.toLocaleString()} = ${toSymbol}${resultDisplay}`;
            }
            
            // Add crypto indicator styling
            if ((fromCurr && fromCurr.type === 'crypto') || (toCurr && toCurr.type === 'crypto')) {
                display.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
                display.style.webkitBackgroundClip = 'text';
                display.style.webkitTextFillColor = 'transparent';
                display.style.fontWeight = 'bold';
            } else {
                display.style.background = 'none';
                display.style.webkitTextFillColor = 'initial';
                display.style.color = '#2c3e50';
                display.style.fontWeight = 'normal';
            }
        }
        
        // Update chart
        updateEnhancedChart(fromCurrency, toCurrency);
    }
    
    // Rest of the functions remain the same...
    // [Include all the remaining functions from the original code]
    
    // Set up calculator button event listeners
    if (calcButtons && calcButtons.length > 0) {
        calcButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
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
    console.log('Starting crypto-enhanced initialization...');
    initializeRates();
    populateCurrencySelectors();
    updateDisplay();
    lastUpdated = new Date();
    updateLastUpdated();
    
    // Fetch rates on load with delay for mobile
    setTimeout(() => {
        refreshExchangeRates();
    }, 500);
    
    console.log('Crypto-enhanced currency calculator initialization complete');
}
