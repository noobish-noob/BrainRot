// --- HARDCODED API KEY (FOR NEWS) ---
const apiKey = 'pub_7f7d8e3f4a7a4c23a323542f32f27e94'; 

// --- PAGINATION STATE & CONSTANTS (FOR NEWS) ---
const HEADLINES_PER_PAGE = 5;
let newsAppState = {
    currentArticles: [],
    currentIndex: 0,
    // Default country is India
    countryCode: 'in', 
    countryName: 'India'
};

// MAPPING: API Country Code (lowercase) to Display Name (Country + Flag)
const countryMap = {
    'au': '🇦🇺 Australia',
    'br': '🇧🇷 Brazil',
    'ca': '🇨🇦 Canada',
    'cn': '🇨🇳 China',
    'de': '🇩🇪 Germany',
    'fr': '🇫🇷 France', 
    'gb': '🇬🇧 United Kingdom',
    'in': '🇮🇳 India',
    'jp': '🇯🇵 Japan',
    'us': '🇺🇸 United States',
};

// --- DUMMY DATA FOR NEWS PLACEHOLDER ---
const dummyArticles = new Array(20).fill(0).map((_, i) => ({
    title: `Headline ${i + 1}: Important News Event from ${countryMap['in'].split(' ')[1]}`,
    description: `This is a placeholder description for news article number ${i + 1}. It simulates a trending story about technology or finance.`,
    url: '#',
    source: 'Brain Rot Wire',
    date: '2025-11-16'
}));
// ------------------------------------

// --- TRIVIA STATE & CONSTANTS ---
let triviaAppState = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    isQuizActive: false,
    timer: null
};
const TRIVIA_API_URL = "https://opentdb.com/api.php?amount=10&type=multiple"; 
// ------------------------------------

// --- MEME STATE & CONSTANTS ---
const MEME_API_URL = "https://meme-api.com/gimme/"; 
const MEME_SUBREDDITS = {
    'memes': 'All',
    'indiameme': '🇮🇳 Indian Memes', 
    'MalayalamMemes': '💚 Malayalam Memes' 
};
let memeAppState = {
    selectedSubreddit: 'memes' // Default to general memes
};
// ------------------------------------

// --- STOCKS CONSTANTS & STATE ---
const ALPHA_VANTAGE_API_KEY = '3N8PE82Y2T5DFULO'; 
const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query?';
let stockChartInstance = null; // To hold the Chart.js instance for destruction
// ------------------------------------


// DOM elements
const headlineList = document.getElementById('headline-list');
const tabButtons = document.querySelectorAll('.tab-button');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreButton = document.getElementById('load-more-button');
const newsView = document.getElementById('news-view');
const triviaView = document.getElementById('trivia-view');

// NEWS SELECTOR
const countrySelect = document.getElementById('country-select');

// MEME ELEMENTS
const memesView = document.getElementById('memes-view');
const memeTitleEl = document.getElementById('meme-title');
const memeImageEl = document.getElementById('meme-image');
const nextMemeButton = document.getElementById('next-meme-button');
const memeErrorEl = document.getElementById('meme-error');
const memeFilterSelect = document.getElementById('meme-filter-select'); 

// TRIVIA ELEMENTS
const triviaInfo = document.getElementById('trivia-info');
const startQuizButton = document.getElementById('start-quiz-button');
const triviaQuestionCard = document.getElementById('trivia-question-card');
const triviaQuestionEl = document.getElementById('trivia-question');
const triviaOptions = document.getElementById('trivia-options');
const nextQuestionButton = document.getElementById('next-question-button');
const currentScoreEl = document.getElementById('current-score');

// STOCKS ELEMENTS
const stocksView = document.getElementById('stocks-view');
const stockSearchInput = document.getElementById('stock-search-input');
const stockSearchButton = document.getElementById('stock-search-button');
const stockResults = document.getElementById('stock-results');
const stockStatus = document.getElementById('stock-status');
const stockAutocompleteResults = document.getElementById('stock-autocomplete-results');


// === UTILITY FUNCTIONS ===

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function displayNewsMessage(message, type = 'info') {
    const color = type === 'error' ? 'text-red-600' : 'text-yellow-600';
    const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';

    headlineList.innerHTML = `
        <div class="text-center p-6 ${bgColor} rounded-xl">
            <p class="font-semibold ${color}">${message}</p>
        </div>
    `;
    loadMoreContainer.classList.add('hidden');
}

/**
 * Creates a debounced version of a function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


// === NEWS LOGIC ===

/**
 * Simulates fetching news and initializes the state.
 * @param {string} countryCode - The country code for news.
 */
function fetchNews(countryCode) {
    displayNewsMessage(`Loading news for ${countryCode.toUpperCase()}...`);
    
    // Simulate API call delay
    setTimeout(() => {
        // Using dummy data regardless of country for simplicity
        newsAppState.currentArticles = dummyArticles;
        newsAppState.currentIndex = 0;
        renderHeadlines(true); // Render the first page
    }, 500);
}

/**
 * Renders the news headlines for the current page.
 * @param {boolean} reset - True if clearing the list and starting from the beginning.
 */
function renderHeadlines(reset = true) {
    const start = newsAppState.currentIndex;
    const end = start + HEADLINES_PER_PAGE;
    // Slice only the articles for the current page
    const articlesToShow = newsAppState.currentArticles.slice(start, end);

    if (reset) {
        headlineList.innerHTML = '';
        // If there are no articles after a fetch (simulated or real)
        if (newsAppState.currentArticles.length === 0) {
             displayNewsMessage("No headlines found for this country.");
             newsAppState.currentIndex = 0;
             return;
        }
    }
    
    // Check if there are articles to show for this page
    if (articlesToShow.length === 0) {
        updateLoadMoreButton(); // Hides the button
        return;
    }

    // Generate HTML for the new set of articles
    const newHeadlinesHtml = articlesToShow.map(article => `
        <div class="p-4 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${article.title}</h3>
            <p class="text-gray-600 text-sm mb-3">${article.description || 'No description available.'}</p>
            <a href="${article.url}" target="_blank" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Read more →</a>
            <p class="text-xs text-gray-400 mt-2">Source: ${article.source} - ${article.date}</p>
        </div>
    `).join('');

    // Append new headlines
    headlineList.insertAdjacentHTML('beforeend', newHeadlinesHtml);

    // Update state
    newsAppState.currentIndex = end;
    updateLoadMoreButton();

    // --- FIX: Auto-scroll to newly loaded headlines ---
    // Scroll only if this was a "Load More" action (i.e., not a reset/initial load)
    if (!reset) {
        // Scroll to the loadMoreContainer element, which is right after the newly loaded content
        loadMoreContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function populateCountrySelector() {
    countrySelect.innerHTML = Object.entries(countryMap).map(([key, value]) => 
        `<option value="${key}" ${key === newsAppState.countryCode ? 'selected' : ''}>${value}</option>`
    ).join('');
}
function handleCountryChange(event) {
    newsAppState.countryCode = event.target.value;
    newsAppState.currentIndex = 0;
    fetchNews(newsAppState.countryCode);
}
function updateLoadMoreButton() {
    // Show button only if there are more articles to load
    if (newsAppState.currentIndex < newsAppState.currentArticles.length) {
        loadMoreContainer.classList.remove('hidden');
    } else {
        loadMoreContainer.classList.add('hidden');
    }
}


// === MEME LOGIC (Placeholder Functions) ===
function populateMemeSelector() {
    memeFilterSelect.innerHTML = Object.entries(MEME_SUBREDDITS).map(([key, value]) => 
        `<option value="${key}">${value}</option>`
    ).join('');
}
async function fetchRandomMeme() {
    memeImageEl.classList.add('hidden');
    memeErrorEl.classList.add('hidden');
    memeTitleEl.textContent = `Fetching meme from r/${memeAppState.selectedSubreddit}...`;
    nextMemeButton.disabled = true;
    nextMemeButton.textContent = 'Loading...';

    const url = `${MEME_API_URL}${memeAppState.selectedSubreddit}?count=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.meme && data.meme.length > 0) {
            const meme = data.meme[0];
            memeTitleEl.textContent = decodeHTMLEntities(meme.title);
            memeImageEl.src = meme.url;
            memeImageEl.alt = meme.title;
            memeImageEl.onload = () => {
                memeImageEl.classList.remove('hidden');
                nextMemeButton.disabled = false;
                nextMemeButton.textContent = 'Get New Meme';
            };
            memeImageEl.onerror = () => {
                memeErrorEl.textContent = "Failed to load meme image.";
                memeErrorEl.classList.remove('hidden');
                memeTitleEl.textContent = "Image Load Error";
                nextMemeButton.disabled = false;
                nextMemeButton.textContent = 'Get New Meme';
            };
        } else {
            memeErrorEl.textContent = `No meme found for r/${memeAppState.selectedSubreddit}.`;
            memeErrorEl.classList.remove('hidden');
            memeTitleEl.textContent = "No Meme Found";
            nextMemeButton.disabled = false;
            nextMemeButton.textContent = 'Get New Meme';
        }

    } catch (error) {
        memeErrorEl.textContent = "Network error fetching meme.";
        memeErrorEl.classList.remove('hidden');
        memeTitleEl.textContent = "Meme Error";
        nextMemeButton.disabled = false;
        nextMemeButton.textContent = 'Get New Meme';
        console.error("Meme fetch error:", error);
    }
}
function handleMemeFilterChange(event) {
    memeAppState.selectedSubreddit = event.target.value;
    fetchRandomMeme();
}


// === TRIVIA LOGIC (Placeholder Functions) ===
function startQuiz() {
    triviaAppState.isQuizActive = true;
    startQuizButton.classList.add('hidden');
    triviaQuestionCard.classList.remove('hidden');
    triviaInfo.textContent = 'Fetching questions...';
    // Dummy logic for a simple quiz flow
    triviaInfo.textContent = 'Quiz started (Placeholder)';
    triviaQuestionEl.textContent = 'What is 1 + 1?';
    triviaOptions.innerHTML = `
        <button class="answer-button p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-indigo-50" onclick="alert('Correct!'); nextQuestion();">2</button>
        <button class="answer-button p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-indigo-50" onclick="alert('Incorrect!'); nextQuestion();">3</button>
        <button class="answer-button p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-indigo-50" onclick="alert('Incorrect!'); nextQuestion();">4</button>
        <button class="answer-button p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-indigo-50" onclick="alert('Incorrect!'); nextQuestion();">5</button>
    `;
    nextQuestionButton.classList.remove('hidden');
}
function nextQuestion() {
    triviaAppState.score += 1;
    currentScoreEl.textContent = `Score: ${triviaAppState.score}`;
    // Dummy logic to end quiz
    triviaInfo.textContent = 'Quiz finished. Click Start Quiz to begin again.';
    triviaQuestionEl.textContent = '';
    triviaOptions.innerHTML = `<p class="text-center">Quiz finished.</p>`;
    nextQuestionButton.classList.add('hidden');
    startQuizButton.classList.remove('hidden');
    triviaAppState.isQuizActive = false;
}


// === STOCKS LOGIC ===

/**
 * Determines the currency symbol based on the stock's region.
 * @param {string} region - The region string from Alpha Vantage (e.g., 'India/Bombay Stock Exchange').
 * @returns {string} The currency symbol.
 */
function getCurrencySymbol(region) {
    // Check for common Indian exchange names
    if (region && (region.includes('India') || region.includes('BSE') || region.includes('NSE'))) {
        return '₹'; // Indian Rupee
    }
    return '$'; // Default to US Dollar
}

/**
 * Searches for stock ticker symbols based on user input for autocomplete.
 * @param {string} keywords - The company name or symbol fragment.
 */
async function fetchAutocompleteSuggestions(keywords) {
    stockAutocompleteResults.innerHTML = '';
    
    if (keywords.length < 2) {
        stockAutocompleteResults.classList.add('hidden');
        return;
    }

    const url = `${ALPHA_VANTAGE_URL}function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data["Error Message"] || !data.bestMatches || data.bestMatches.length === 0) {
            stockAutocompleteResults.classList.add('hidden');
            return;
        }

        data.bestMatches.slice(0, 5).forEach(match => {
            const symbol = match['1. symbol'];
            const name = match['2. name'];
            const region = match['4. region'];
            
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `<span class="font-bold text-indigo-600">${symbol}</span> - ${name} (${region})`;
            
            item.addEventListener('click', () => {
                // 1. Set the input value
                stockSearchInput.value = symbol;
                // 2. Clear and hide suggestions
                stockAutocompleteResults.innerHTML = '';
                stockAutocompleteResults.classList.add('hidden');
                // 3. Immediately fetch the stock quote, passing the region
                fetchStockQuote(symbol, region);
            });
            
            stockAutocompleteResults.appendChild(item);
        });

        stockAutocompleteResults.classList.remove('hidden');

    } catch (error) {
        console.error("Alpha Vantage Autocomplete failed:", error);
        stockAutocompleteResults.innerHTML = '<div class="p-2 text-red-500">Error fetching suggestions.</div>';
        stockAutocompleteResults.classList.remove('hidden');
    }
}

/**
 * Fetches the latest global quote for a given stock ticker and renders the results.
 * @param {string} ticker - The stock ticker symbol (e.g., 'AAPL').
 * @param {string} region - The stock's region/exchange (e.g., 'India/Bombay Stock Exchange').
 */
async function fetchStockQuote(ticker, region = 'Unknown') {
    // Hide autocomplete results
    stockAutocompleteResults.classList.add('hidden');
    stockAutocompleteResults.innerHTML = '';

    // Destroy previous chart instance before rendering new content
    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    // Set loading status
    stockStatus.textContent = `Fetching latest quote for ${ticker}...`;
    stockResults.innerHTML = '';
    stockResults.appendChild(stockStatus);

    // Get currency symbol based on the region provided
    const currencySymbol = getCurrencySymbol(region); 

    // FUNCTION: GLOBAL_QUOTE
    const url = `${ALPHA_VANTAGE_URL}function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check for error messages from API
        if (data["Error Message"]) {
            stockStatus.textContent = `API Error: ${data["Error Message"]}. Check console for details.`;
            return;
        }
        
        const quote = data["Global Quote"];

        if (quote && quote["05. price"] && quote["05. price"] !== "0.0000") {
            const symbol = quote["01. symbol"];
            const price = parseFloat(quote["05. price"]).toFixed(2);
            const open = parseFloat(quote["02. open"]).toFixed(2);
            const high = parseFloat(quote["03. high"]).toFixed(2);
            const low = parseFloat(quote["04. low"]).toFixed(2);
            const change = parseFloat(quote["09. change"]);
            const changePercent = parseFloat(quote["10. change percent"].replace('%', '')).toFixed(2);
            
            const changeSign = change >= 0 ? 'text-green-600' : 'text-red-600';
            const changeArrow = change >= 0 ? '▲' : '▼';
            
            // Clear status and render results
            stockResults.innerHTML = ''; 

            const resultHtml = `
                <div class="text-left w-full space-y-3">
                    <h3 class="text-3xl font-extrabold text-gray-900">${symbol} <span class="text-sm font-semibold text-gray-500">(${region})</span></h3>
                    <p class="text-xl font-bold text-gray-700">Latest Price: <span class="text-indigo-600">${currencySymbol}${price}</span></p>
                    
                    <p class="text-xl font-bold ${changeSign}">
                        ${changeArrow} ${change.toFixed(2)} (${changePercent}%)
                    </p>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-gray-200">
                        <p><strong>Open:</strong> ${currencySymbol}${open}</p>
                        <p><strong>High:</strong> ${currencySymbol}${high}</p>
                        <p><strong>Low:</strong> ${currencySymbol}${low}</p>
                        <p><strong>Volume:</strong> ${quote["06. volume"]}</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">Last Refreshed: ${quote["07. latest trading day"]}</p>
                </div>
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">Past 30 Days Trend</h4>
                    <div class="relative h-64">
                        <canvas id="stock-chart"></canvas>
                        <p id="chart-status" class="absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-white bg-opacity-70">Loading chart data...</p>
                    </div>
                </div>
            `;
            stockResults.innerHTML = resultHtml;

            // --- Initiate Chart Fetch ---
            fetchStockChartData(ticker);

        } else {
            stockStatus.textContent = `Could not retrieve live quote for ticker: ${ticker}. Please verify the symbol.`;
        }
    } catch (error) {
        console.error("Alpha Vantage Global Quote failed:", error);
        stockStatus.textContent = "Network error fetching stock quote.";
    }
}

/**
 * Fetches the last 30 days of daily time series data for the chart.
 * @param {string} ticker - The stock ticker symbol.
 */
async function fetchStockChartData(ticker) {
    const chartStatusEl = document.getElementById('chart-status');
    // Using 'compact' to get the latest 100 data points (we only need 30)
    const url = `${ALPHA_VANTAGE_URL}function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data["Error Message"] || data["Note"]) {
            chartStatusEl.textContent = "Chart not available (API limit reached or data error).";
            return;
        }

        const timeSeriesKey = "Time Series (Daily)";
        const timeSeries = data[timeSeriesKey];

        if (!timeSeries) {
            chartStatusEl.textContent = "Historical data not found for this ticker.";
            return;
        }

        const dates = [];
        const closingPrices = [];

        // Get the last 30 days of data
        const entries = Object.entries(timeSeries).slice(0, 30);
        
        // Populate arrays in reverse order to display oldest data on the left
        entries.reverse().forEach(([date, data]) => {
            dates.push(date);
            closingPrices.push(parseFloat(data["4. close"]));
        });

        chartStatusEl.classList.add('hidden'); // Hide status message
        renderStockChart(ticker, dates, closingPrices);

    } catch (error) {
        console.error("Alpha Vantage Chart failed:", error);
        chartStatusEl.textContent = "Network error fetching chart data.";
    }
}

/**
 * Renders the line chart using Chart.js.
 * @param {string} ticker - The stock ticker symbol.
 * @param {string[]} dates - Array of dates for the x-axis.
 * @param {number[]} prices - Array of closing prices for the y-axis.
 */
function renderStockChart(ticker, dates, prices) {
    const ctx = document.getElementById('stock-chart');

    // Destroy existing chart instance if it exists (cleanup)
    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    // Determine line color based on overall change (first price vs. last price in the series)
    const lineColor = prices[prices.length - 1] >= prices[0] ? '#10b981' : '#ef4444'; // Green or Red

    stockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${ticker} Closing Price`,
                data: prices,
                borderColor: lineColor,
                backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light indigo fill
                borderWidth: 2,
                pointRadius: 0, // Hide points
                tension: 0.2, // Smooth line
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price'
                    }
                },
                x: {
                    // Only show first, middle, and last date for cleanliness
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                }
            }
        }
    });
}

/**
 * Main handler for the stock search button click.
 */
async function handleStockSearch() {
    const query = stockSearchInput.value.trim();
    if (!query) {
        stockStatus.textContent = "Please enter a company name or ticker symbol.";
        stockResults.innerHTML = '';
        stockResults.appendChild(stockStatus);
        return;
    }

    // 1. Search for the ticker symbol and its region/exchange info
    const symbolSearchUrl = `${ALPHA_VANTAGE_URL}function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    stockStatus.textContent = `Searching for ticker and exchange for "${query}"...`;
    stockResults.innerHTML = '';
    stockResults.appendChild(stockStatus);

    try {
        const response = await fetch(symbolSearchUrl);
        const data = await response.json();

        if (data.bestMatches && data.bestMatches.length > 0) {
            const bestMatch = data.bestMatches[0];
            const ticker = bestMatch['1. symbol'];
            const region = bestMatch['4. region'];
            
            // 2. Update the input field with the precise ticker
            stockSearchInput.value = ticker; 
            
            // 3. Fetch the quote and chart using the found ticker and region
            await fetchStockQuote(ticker, region); 
        } else {
            stockStatus.textContent = `No stock symbol found for "${query}". Please try a different query.`;
        }

    } catch (error) {
        console.error("Alpha Vantage Search failed in handleStockSearch:", error);
        stockStatus.textContent = "Network error during stock symbol lookup.";
    }
}


// Debounced version of the autocomplete fetch function
const debouncedFetchSuggestions = debounce(fetchAutocompleteSuggestions, 300);


// === EVENT LISTENERS & INITIALIZATION ===

// 1. Tab switching
function switchRegion(event) {
    const selectedButton = event.currentTarget;
    const contentArea = selectedButton.getAttribute('data-content');

    // Update button styles
    tabButtons.forEach(button => {
        button.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
        button.classList.add('text-gray-600', 'hover:bg-indigo-50', 'hover:text-indigo-600');
    });
    selectedButton.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
    selectedButton.classList.remove('text-gray-600', 'hover:bg-indigo-50', 'hover:text-indigo-600');

    // Hide all views
    newsView.classList.add('hidden');
    memesView.classList.add('hidden');
    triviaView.classList.add('hidden');
    stocksView.classList.add('hidden'); 

    // Show the selected view and fetch data
    if (contentArea === 'news') {
        newsView.classList.remove('hidden');
        // Fetch news for the currently selected dropdown country if no articles are loaded
        if (newsAppState.currentArticles.length === 0 || newsAppState.currentIndex === 0) {
            fetchNews(countrySelect.value);
        } else {
            updateLoadMoreButton();
        }
    } else if (contentArea === 'stocks') {
        stocksView.classList.remove('hidden');
        // Reset stock status message
        stockStatus.textContent = "Enter a company name or ticker symbol above to find its stock price.";
        stockResults.innerHTML = '';
        stockResults.appendChild(stockStatus); 
        // Hide autocomplete when switching back
        stockAutocompleteResults.classList.add('hidden');
        // Destroy existing chart instance when leaving/entering the stock view
        if (stockChartInstance) {
            stockChartInstance.destroy();
            stockChartInstance = null;
        }
    }
    else if (contentArea === 'memes') {
        memesView.classList.remove('hidden');
        // Fetch a meme using the currently selected filter
        fetchRandomMeme(); 
    } else if (contentArea === 'trivia') {
        triviaView.classList.remove('hidden');
        if (!triviaAppState.isQuizActive) {
            triviaInfo.textContent = "Click \"Start Quiz\" to begin!";
            startQuizButton.classList.remove('hidden');
            triviaQuestionCard.classList.add('hidden');
            currentScoreEl.textContent = `Score: 0`;
        }
    }
}

// 2. News Load More
loadMoreButton.addEventListener('click', () => renderHeadlines(false));

// 3. News Country Change
countrySelect.addEventListener('change', handleCountryChange);

// 4. Meme Controls
nextMemeButton.addEventListener('click', fetchRandomMeme);
memeFilterSelect.addEventListener('change', handleMemeFilterChange); 

// 5. Trivia Controls
startQuizButton.addEventListener('click', startQuiz);
nextQuestionButton.addEventListener('click', () => {
    clearTimeout(triviaAppState.timer); 
    nextQuestion();
});

// 6. Stocks Controls (Search Button)
stockSearchButton.addEventListener('click', handleStockSearch);

// 7. Stocks Controls (Autocomplete Input)
stockSearchInput.addEventListener('input', (event) => {
    const keywords = event.target.value.trim();
    debouncedFetchSuggestions(keywords);
});

// 8. Stocks Controls (Outside Click to Hide Autocomplete)
document.addEventListener('click', (event) => {
    if (!stockAutocompleteResults.contains(event.target) && event.target !== stockSearchInput) {
        stockAutocompleteResults.classList.add('hidden');
    }
});

// 9. Initial load
tabButtons.forEach(button => {
    button.addEventListener('click', switchRegion);
});

function initializeApp() {
    // Populate selectors
    populateCountrySelector();
    populateMemeSelector(); 
    
    // Set the default active style for the News tab
    const newsButton = document.getElementById('tab-news');
    if (newsButton) {
        newsButton.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
        newsButton.classList.remove('text-gray-600', 'hover:bg-indigo-50', 'hover:text-indigo-600');
    }
    
    // Load news for the default country ('in')
    fetchNews(newsAppState.countryCode);
}

window.onload = initializeApp;
