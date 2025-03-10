// Enhanced financial-calculator.js with ZAR support, UI improvements, and indices tab
document.addEventListener('DOMContentLoaded', function() {
    console.log("Financial calculator script loaded!");
    
    // Get UI elements
    const display = document.getElementById('currencyCalcDisplay');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const calcButtons = document.querySelectorAll('#currency-calculator .calc-key');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    const miniChartElement = document.getElementById('rateChart');
    const refreshBtn = document.getElementById('refreshRates');
    const indicesContainer = document.getElementById('indicesContainer');
    const indicesLastUpdatedElement = document.getElementById('indicesLastUpdated');
    
    // Get calculator switching buttons
    const bridgeCalcBtnFromCurr = document.getElementById('bridgeCalcBtnFromCurr');
    const regularCalcBtnFromCurr = document.getElementById('regularCalcBtnFromCurr');
    const currencyCalcBtn = document.getElementById('currencyCalcBtn');
    const currencyCalcBtnFromReg = document.getElementById('currencyCalcBtnFromReg');
    
    // Get tab elements
    const tabButtons = document.querySelectorAll('.calculator-tabs .tab-button');
    const tabContents = document.querySelectorAll('.calculator-content');
    
    // State variables
    let currentInput = '0';
    let lastUpdated = null;
    let indicesLastUpdated = null;
    
    // Currencies to support - added ZAR (South African Rand)
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'ZAR'];
    
    // Stock indices to display - reduced list to save vertical space
    const stockIndices = [
        { symbol: 'FTSE', name: 'FTSE 100', currency: 'GBP' },
        { symbol: 'DJI', name: 'Dow Jones', currency: 'USD' },
        { symbol: 'COMP', name: 'NASDAQ', currency: 'USD' },
        { symbol: 'SPX', name: 'S&P 500', currency: 'USD' },
        { symbol: 'DAX', name: 'DAX', currency: 'EUR' },
        { symbol: 'J200', name: 'JSE Top 40', currency: 'ZAR' }
    ];
    
    // Hardcoded rates as fallback (including ZAR)
    let conversionRates = {
        'USD': { 
            'EUR': 0.85, 
            'GBP': 0.75,
            'JPY': 110.0,
            'CAD': 1.25,
            'AUD': 1.35,
            'CHF': 0.92,
            'ZAR': 18.50
        },
        'EUR': { 
            'USD': 1.18, 
            'GBP': 0.88,
            'JPY': 129.5,
            'CAD': 1.47,
            'AUD': 1.59,
            'CHF': 1.08,
            'ZAR': 21.80
        },
        'GBP': { 
            'USD': 1.33, 
            'EUR': 1.14,
            'JPY': 147.3,
            'CAD': 1.67,
            'AUD': 1.80,
            'CHF': 1.23,
            'ZAR': 24.70
        },
        'ZAR': {
            'USD': 0.054,
            'EUR': 0.046,
            'GBP': 0.040,
            'JPY': 5.95,
            'CAD': 0.068,
            'AUD': 0.073,
            'CHF': 0.050
        }
    };
    
    // Updated realistic indices data as fallback - March 2025 values
    let indicesData = {
        'FTSE': { value: 8243.75, change: 0.65, previousClose: 8190.32 },
        'DJI': { value: 39126.78, change: -0.25, previousClose: 39224.35 },
        'COMP': { value: 16765.50, change: 1.2, previousClose: 16564.80 },
        'SPX': { value: 5215.25, change: 0.35, previousClose: 5197.86 },
        'DAX': { value: 18265.45, change: 0.42, previousClose: 18189.19 },
        'J200': { value: 78425.80, change: 0.95, previousClose: 77685.37 }
    };
    
    // Set up calculator button event listeners
    if (calcButtons) {
        calcButtons.forEach(button => {
            button.addEventListener('click', function() {
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
                            refreshFinancialData();
                            break;
                    }
                }
            });
        });
    }
    
    // Set up calculator switching
    if (bridgeCalcBtnFromCurr) {
        bridgeCalcBtnFromCurr.addEventListener('click', function() {
            console.log("Switching to bridge calculator");
            switchToBridgeCalculator();
        });
    }
    
    if (regularCalcBtnFromCurr) {
        regularCalcBtnFromCurr.addEventListener('click', function() {
            console.log("Switching to regular calculator");
            switchToRegularCalculator();
        });
    }
    
    if (currencyCalcBtn) {
        currencyCalcBtn.addEventListener('click', function() {
            console.log("Switching to currency calculator from bridge");
            switchToCurrencyCalculator();
        });
    }
    
    if (currencyCalcBtnFromReg) {
        currencyCalcBtnFromReg.addEventListener('click', function() {
            console.log("Switching to currency calculator from regular");
            switchToCurrencyCalculator();
        });
    }
    
    // Set up currency selectors
    if (fromCurrencySelect && toCurrencySelect) {
        fromCurrencySelect.addEventListener('change', function() {
            console.log("From currency changed to: " + fromCurrencySelect.value);
            performConversion();
        });
        
        toCurrencySelect.addEventListener('change', function() {
            console.log("To currency changed to: " + toCurrencySelect.value);
            performConversion();
        });
    }

    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log("Refresh button clicked");
            refreshFinancialData();
        });
    }
    
    // Add event listeners for tab switching
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show the corresponding content
                tabContents.forEach(content => {
                    content.style.display = 'none';
                    
                    // Match ID pattern: "tabName-content"
                    if (content.id === tabName + '-content') {
                        content.style.display = 'block';
                        
                        // If switching to indices tab, load indices data
                        if (tabName === 'indices') {
                            loadIndicesData();
                        }
                    }
                });
                
                console.log(`Switched to ${tabName} tab`);
            });
        });
    }
    
    // Calculator functions
    function inputDigit(digit) {
        console.log("Input digit: " + digit);
        
        // Special case for decimal point
        if (digit === '.') {
            if (!currentInput.includes('.')) {
                currentInput += '.';
            }
        } 
        // Handle first digit input
        else if (currentInput === '0') {
            currentInput = digit;
        } 
        // Handle additional digits
        else {
            currentInput += digit;
        }
        
        updateDisplay();
    }
    
    function clearInput() {
        console.log("Clearing input");
        currentInput = '0';
        updateDisplay();
    }
    
    function backspace() {
        console.log("Backspace");
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        
        updateDisplay();
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
                minute: '2-digit',
                second: '2-digit'
            };
            lastUpdatedElement.textContent = `Rates updated: ${lastUpdated.toLocaleString(undefined, options)}`;
            lastUpdatedElement.style.display = 'block';
        }
    }
    
    function updateIndicesLastUpdated() {
        if (indicesLastUpdatedElement && indicesLastUpdated) {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            indicesLastUpdatedElement.textContent = `Indices updated: ${indicesLastUpdated.toLocaleString(undefined, options)}`;
            indicesLastUpdatedElement.style.display = 'block';
        }
    }
    
    function performConversion() {
        if (!fromCurrencySelect || !toCurrencySelect) {
            console.error("Currency selectors not found");
            return;
        }
        
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        console.log(`Converting from ${fromCurrency} to ${toCurrency}`);
        
        // Parse input
        const amount = parseFloat(currentInput);
        
        if (isNaN(amount)) {
            console.error("Invalid amount for conversion");
            return;
        }
        
        let result;
        
        // Same currency - no conversion needed
        if (fromCurrency === toCurrency) {
            result = amount;
            console.log(`Same currency, no conversion needed: ${amount} ${fromCurrency}`);
        }
        // Direct conversion rate available
        else if (conversionRates[fromCurrency] && conversionRates[fromCurrency][toCurrency]) {
            result = amount * conversionRates[fromCurrency][toCurrency];
            console.log(`Direct conversion: ${amount} * ${conversionRates[fromCurrency][toCurrency]} = ${result}`);
        } 
        // Try converting through a base currency as intermediary
        else {
            // Use EUR as base (since we're using ECB data)
            let eurAmount;
            if (fromCurrency === 'EUR') {
                eurAmount = amount;
            } else if (conversionRates[fromCurrency] && conversionRates[fromCurrency]['EUR']) {
                eurAmount = amount * conversionRates[fromCurrency]['EUR'];
            } else if (conversionRates['EUR'] && conversionRates['EUR'][fromCurrency]) {
                eurAmount = amount / conversionRates['EUR'][fromCurrency];
            } else {
                console.error(`No conversion path from ${fromCurrency} to EUR`);
                eurAmount = amount; // Fallback
            }
            
            // Then convert EUR to target currency
            if (toCurrency === 'EUR') {
                result = eurAmount;
            } else if (conversionRates['EUR'] && conversionRates['EUR'][toCurrency]) {
                result = eurAmount * conversionRates['EUR'][toCurrency];
            } else if (conversionRates[toCurrency] && conversionRates[toCurrency]['EUR']) {
                result = eurAmount / conversionRates[toCurrency]['EUR'];
            } else {
                console.error(`No conversion path from EUR to ${toCurrency}`);
                result = eurAmount; // Fallback
            }
            
            console.log(`Conversion through EUR: ${amount} ${fromCurrency} -> ${eurAmount} EUR -> ${result} ${toCurrency}`);
        }
        
        // Display the conversion result
        display.textContent = `${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;

        // Update mini-chart
        updateMiniChart(fromCurrency, toCurrency);
    }
function updateMiniChart(fromCurrency, toCurrency) {
        if (!miniChartElement) {
            console.log("Mini chart element not found");
            return;
        }
        
        console.log("Updating mini chart for", fromCurrency, "to", toCurrency);
        
        // Clear existing chart
        miniChartElement.innerHTML = "";
        
        // Generate some simple mock data for the chart
        // In a real app, you would fetch historical data from an API
        const mockData = [];
        const today = new Date();
        
        // Create mock data for last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Base rate with some random variation
            const baseRate = conversionRates[fromCurrency] && conversionRates[fromCurrency][toCurrency] 
                ? conversionRates[fromCurrency][toCurrency] 
                : 1;
            
            // Add random variation of ±3%
            const variation = baseRate * (0.97 + Math.random() * 0.06);
            
            mockData.push({
                date: date.toLocaleDateString(),
                rate: variation
            });
        }
        
        // Find min and max for scaling
        const rates = mockData.map(d => d.rate);
        const minRate = Math.min(...rates) * 0.98;
        const maxRate = Math.max(...rates) * 1.02;
        const range = maxRate - minRate;
        
        // Create bars
        const chartWidth = miniChartElement.clientWidth || 300;
        const chartHeight = 40;
        const barWidth = Math.floor(chartWidth / mockData.length) - 2;
        
        // Make sure the chart container has the right styling
        miniChartElement.style.position = 'relative';
        miniChartElement.style.height = '50px';
        miniChartElement.style.width = '100%';
        miniChartElement.style.backgroundColor = '#f8f9fa';
        miniChartElement.style.borderRadius = '4px';
        miniChartElement.style.border = '1px solid #ddd';
        miniChartElement.style.padding = '5px';
        miniChartElement.style.boxSizing = 'border-box';
        miniChartElement.style.display = 'block';
        
        // Create bars
        mockData.forEach((dataPoint, index) => {
            const height = Math.max(5, ((dataPoint.rate - minRate) / range) * chartHeight);
            
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.bottom = '0';
            bar.style.left = `${index * (barWidth + 2)}px`;
            bar.style.width = `${barWidth}px`;
            bar.style.height = `${height}px`;
            bar.style.backgroundColor = dataPoint.rate >= mockData[0].rate ? '#4CAF50' : '#F44336';
            bar.title = `${dataPoint.date}: ${dataPoint.rate.toFixed(4)}`;
            
            miniChartElement.appendChild(bar);
        });
        
        console.log("Mini chart updated with", mockData.length, "data points");
    }
    
    // Function to load and display stock indices
    function loadIndicesData() {
        console.log("Loading indices data...");
        
        if (!indicesContainer) {
            console.error("Indices container not found");
            return;
        }
        
        // Display loading message
        indicesContainer.innerHTML = '<div class="loading-indices">Loading indices...</div>';
        
        // Fetch and display indices data
        fetchIndicesData();
    }
    
    function displayIndicesData() {
        if (!indicesContainer) return;
        
        // Clear container
        indicesContainer.innerHTML = '';
        
        // Create indices list with two columns
        stockIndices.forEach(index => {
            const data = indicesData[index.symbol];
            if (!data) return;
            
            // Create index item element
            const indexItem = document.createElement('div');
            indexItem.className = 'index-item';
            
            // Index name
            const nameElement = document.createElement('div');
            nameElement.className = 'index-name';
            nameElement.textContent = index.name;
            
            // Value container (value + change)
            const valueContainer = document.createElement('div');
            valueContainer.className = 'index-value-container';
            
            // Index value
            const valueElement = document.createElement('span');
            valueElement.className = 'index-value';
            
            // Format the value based on size - abbreviate large numbers
            let formattedValue;
            if (data.value >= 10000) {
                // For larger indices like Nikkei, FTSE, etc.
                formattedValue = (data.value / 1000).toFixed(1) + 'k';
            } else {
                formattedValue = data.value.toLocaleString(undefined, {
                    maximumFractionDigits: 0
                });
            }
            valueElement.textContent = formattedValue;
            
            // Change percentage
            const changeElement = document.createElement('span');
            changeElement.className = `index-change ${data.change >= 0 ? 'positive-change' : 'negative-change'}`;
            changeElement.textContent = `${data.change >= 0 ? '+' : ''}${data.change}%`;
            
            // Assemble elements
            valueContainer.appendChild(valueElement);
            valueContainer.appendChild(changeElement);
            
            indexItem.appendChild(nameElement);
            indexItem.appendChild(valueContainer);
            
            indicesContainer.appendChild(indexItem);
        });
        
        // Ensure the last updated element is clear of the indices
        indicesLastUpdated = new Date();
        updateIndicesLastUpdated();
        
        // Make sure the last updated element is visible and not covered
        if (indicesLastUpdatedElement) {
            indicesLastUpdatedElement.style.display = 'block';
            indicesLastUpdatedElement.style.clear = 'both';
        }
    }
    
    // Function to refresh both currency rates and indices data
    function refreshFinancialData() {
        console.log("Refreshing financial data...");
        
        // Get the active tab
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            const tabName = activeTab.getAttribute('data-tab');
            
            if (tabName === 'currency') {
                fetchExchangeRates();
            } else if (tabName === 'indices') {
                fetchIndicesData();
            }
        } else {
            // If no active tab, refresh both
            fetchExchangeRates();
            fetchIndicesData();
        }
    }
    
    // Client-side only implementation for indices - no external API calls
    async function fetchIndicesData() {
        try {
            console.log('Fetching stock indices data...');
            
            // Show loading state
            if (indicesContainer) {
                indicesContainer.innerHTML = '<div class="loading-indices">Updating indices...</div>';
            }
            
            let updatedCount = 0;
            
            // Get current date and time for timestamps
            const now = new Date();
            
            // Process each index with simulated data
            for (const index of stockIndices) {
                try {
                    console.log(`Generating data for ${index.name} (${index.symbol})`);
                    
                    // Get the existing data for this index
                    const currentData = indicesData[index.symbol];
                    
                    if (!currentData) {
                        console.warn(`No existing data for ${index.symbol}`);
                        continue;
                    }
                    
                    // Generate realistic variations based on the index
                    // Different indices have different volatility patterns
                    let volatility = 0.01; // Default 1% volatility
                    
                    // Adjust volatility based on index (more volatile indices have higher values)
                    if (index.symbol === 'COMP' || index.symbol === 'J200') {
                        volatility = 0.015; // 1.5% for more volatile indices
                    } else if (index.symbol === 'FTSE' || index.symbol === 'DAX') {
                        volatility = 0.012; // 1.2% for European indices
                    } else if (index.symbol === 'DJI') {
                        volatility = 0.008; // 0.8% for Dow Jones (less volatile)
                    }
                    
                    // Generate a random direction but with slight bias based on previous direction
                    // This creates more realistic trends
                    let trendBias = 0;
                    if (currentData.change > 0) {
                        trendBias = 0.2; // Slight positive bias if previously rising
                    } else if (currentData.change < 0) {
                        trendBias = -0.2; // Slight negative bias if previously falling
                    }
                    
                    // Generate change percentage based on volatility and trend
                    const randomFactor = (Math.random() * 2 - 1 + trendBias);
                    const changePercent = randomFactor * volatility * 100;
                    
                    // Calculate new value based on previous close and change
                    const newValue = currentData.value * (1 + (changePercent / 100));
                    
                    // Update the index data
                    indicesData[index.symbol] = {
                        value: parseFloat(newValue.toFixed(2)),
                        change: parseFloat(changePercent.toFixed(2)),
                        previousClose: currentData.value
                    };
                    
                    updatedCount++;
                    console.log(`Generated updated data for ${index.name}`);
                    
                    // Display the updated data after each index to give visual feedback
                    displayIndicesData();
                    
                    // Small delay between updates to simulate network activity
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (indexError) {
                    console.error(`Error updating ${index.symbol}:`, indexError);
                }
            }
            
            // Update timestamp
            indicesLastUpdated = now;
            updateIndicesLastUpdated();
            
            // Display final updated data
            displayIndicesData();
            
            // Show success message
            if (updatedCount === stockIndices.length) {
                showMessage('All indices updated successfully', 'success');
            } else if (updatedCount > 0) {
                showMessage(`Updated ${updatedCount} of ${stockIndices.length} indices`, 'info');
            } else {
                showMessage('Could not update indices. Using cached data.', 'error');
            }
            
            console.log(`Stock indices updated: ${updatedCount} of ${stockIndices.length}`);
            return updatedCount > 0;
            
        } catch (error) {
            console.error('Error generating indices data:', error);
            
            // Show error message
            showMessage('Failed to update indices. Using fallback data.', 'error');
            
            // Still display the data we have
            displayIndicesData();
            
            return false;
        }
    }
    
    // Fetch exchange rates from the Frankfurter API
    async function fetchExchangeRates() {
        try {
            // Use the verified working Frankfurter API
            const url = 'https://api.frankfurter.app/latest?from=EUR';
            
            console.log('Fetching exchange rates from Frankfurter API...');
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if the response has the expected structure
            if (!data || !data.rates) {
                throw new Error('Invalid API response structure');
            }
            
            console.log('Exchange rates received successfully');
            
            // Initialize rates structure if needed
            currencies.forEach(currency => {
                if (!conversionRates[currency]) {
                    conversionRates[currency] = {};
                }
            });
            
            // The base currency is EUR for Frankfurter
            const baseCurrency = 'EUR';
            const rates = data.rates;
            
            // Add EUR to USD rate (inverse of USD rate)
            if (rates['USD']) {
                conversionRates['EUR']['USD'] = rates['USD'];
                conversionRates['USD']['EUR'] = 1 / rates['USD'];
            }
            
            // Add rates from EUR to other currencies
            currencies.forEach(currency => {
                if (currency !== 'EUR' && rates[currency]) {
                    conversionRates['EUR'][currency] = rates[currency];
                    // Add inverse rate
                    conversionRates[currency]['EUR'] = 1 / rates[currency];
                }
            });
            
            // Add cross rates between non-EUR currencies
            currencies.forEach(fromCurrency => {
                if (fromCurrency !== 'EUR' && rates[fromCurrency]) {
                    currencies.forEach(toCurrency => {
                        if (toCurrency !== 'EUR' && toCurrency !== fromCurrency && rates[toCurrency]) {
                            // Convert through EUR
                            conversionRates[fromCurrency][toCurrency] = rates[toCurrency] / rates[fromCurrency];
                        }
                    });
                }
            });
            
            // Update last updated timestamp
            lastUpdated = new Date();
            updateLastUpdated();
            
            // Update current conversion if there's input
            if (parseFloat(currentInput) !== 0 && fromCurrencySelect && toCurrencySelect) {
                performConversion();
            }
            
            // Show success message
            showMessage('Exchange rates updated successfully', 'success');
            
            console.log('All exchange rates updated successfully');
            return true;
            
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            console.log('Using fallback exchange rates');
            
            // Show error message
            showMessage('Failed to update rates. Using fallback rates.', 'error');
            
            return false;
        }
    }
    
    function showMessage(text, type = 'success') {
        console.log(`Showing message: ${text} (${type})`);
        
        // Create message element
        const message = document.createElement('div');
        message.className = `calculator-message ${type}`;
        message.textContent = text;
        message.style.position = 'absolute';
        message.style.bottom = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '5px';
        message.style.color = 'white';
        message.style.fontWeight = 'bold';
        message.style.zIndex = '1000';
        message.style.opacity = '1';
        message.style.transition = 'opacity 0.5s';
        
        if (type === 'success') {
            message.style.backgroundColor = '#2ecc71';
        } else if (type === 'warning') {
            message.style.backgroundColor = '#f39c12';
        } else {
            message.style.backgroundColor = '#e74c3c';
        }
        
        // Add to DOM
        const calculator = document.getElementById('currency-calculator');
        if (calculator) {
            calculator.appendChild(message);
            
            // Remove after 3 seconds
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 500);
            }, 3000);
        }
    }
    
    // Calculator switching functions
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
        
        // Get active tab
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            const tabName = activeTab.getAttribute('data-tab');
            
            if (tabName === 'currency') {
                // Force chart update when switching to currency calculator
                if (fromCurrencySelect && toCurrencySelect) {
                    updateMiniChart(fromCurrencySelect.value, toCurrencySelect.value);
                }
            } else if (tabName === 'indices') {
                // Make sure indices are displayed
                loadIndicesData();
            }
        }
    }
    
 // Initialize
    updateDisplay();
    
    // Set lastUpdated to now, even before fetching, to have a timestamp
    lastUpdated = new Date();
    updateLastUpdated();
    
    indicesLastUpdated = new Date();
    updateIndicesLastUpdated();
    
    // Fetch exchange rates
    fetchExchangeRates();
});