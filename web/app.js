// Fallback text if data.txt fails to load (CORS block on file:// protocol)
const DEFAULT_CORPUS = `Artificial Intelligence, or AI, is a broad field of computer science dedicated to building smart machines capable of performing tasks that typically require human intelligence. From voice assistants like Siri and Alexa to self-driving cars and complex algorithmic trading systems, AI is rapidly transforming the way we live and work. At its core, the goal of Artificial Intelligence is to create systems that can learn, reason, solve problems, and make decisions autonomously.

Machine Learning, or ML, is a specific subset of Artificial Intelligence that focuses on the development of algorithms that allow computers to learn from and make predictions or decisions based on data. Instead of being explicitly programmed to perform a task, a Machine Learning model is trained on a large dataset, enabling it to identify patterns and improve its performance over time. This approach has revolutionized fields such as computer vision, natural language processing, and predictive analytics.

The relationship between Artificial Intelligence and Machine Learning is fundamental to modern technology. While AI represents the broader vision of creating intelligent machines, Machine Learning provides the practical tools and techniques to achieve this vision. As algorithms become more sophisticated and data becomes more abundant, the capabilities of AI and ML will continue to expand, driving innovation across every industry on the planet.`;

// Punctuation characters to strip for clean lookup
const PUNCTUATION_REGEX = /^[^\w]+|[^\w]+$/g; 

// Application State
let corpusWords = [];
let markovChain = {};
let wordSuggestions = [];

// DOM Elements
const corpusInput = document.getElementById('corpus-input');
const totalWordsStat = document.getElementById('stat-total-words');
const uniqueWordsStat = document.getElementById('stat-unique-words');
const transitionsStat = document.getElementById('stat-transitions');
const startWordInput = document.getElementById('start-word');
const randomStartBtn = document.getElementById('btn-random-start');
const suggestionChips = document.getElementById('suggestion-chips');
const wordCountSlider = document.getElementById('word-count');
const wordCountVal = document.getElementById('word-count-val');
const generateBtn = document.getElementById('btn-generate');
const copyBtn = document.getElementById('btn-copy');
const generationOutput = document.getElementById('generation-output');
const explorerSelect = document.getElementById('explorer-word-select');
const explorerResults = document.getElementById('explorer-results');

// Initial Load Setup
window.addEventListener('DOMContentLoaded', async () => {
    // Populate slider initial value
    wordCountVal.textContent = wordCountSlider.value;
    
    // Try to load text from the parent directory's data.txt
    try {
        const response = await fetch('../data.txt');
        if (response.ok) {
            const text = await response.text();
            corpusInput.value = text.trim();
        } else {
            corpusInput.value = DEFAULT_CORPUS;
        }
    } catch (e) {
        // Fallback if local fetch fails (e.g. running via file:// protocol)
        corpusInput.value = DEFAULT_CORPUS;
    }
    
    // Build initial model
    processTextAndBuildChain();
    
    // Select a random start word to pre-populate the input
    setRandomStartWord();
});

// Event Listeners
corpusInput.addEventListener('input', processTextAndBuildChain);

wordCountSlider.addEventListener('input', (e) => {
    wordCountVal.textContent = e.target.value;
});

randomStartBtn.addEventListener('click', setRandomStartWord);

generateBtn.addEventListener('click', handleGeneration);

copyBtn.addEventListener('click', copyToClipboard);

explorerSelect.addEventListener('change', handleExplorerChange);

// Core Markov Logic
function processTextAndBuildChain() {
    const text = corpusInput.value;
    
    // Tokenization: Split by whitespace
    corpusWords = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Calculate total tokens
    totalWordsStat.textContent = corpusWords.length;
    
    // Reset/Build Markov Chain
    markovChain = {};
    let totalTransitions = 0;
    
    for (let i = 0; i < corpusWords.length - 1; i++) {
        const currentWord = corpusWords[i];
        const nextWord = corpusWords[i + 1];
        
        if (!markovChain[currentWord]) {
            markovChain[currentWord] = [];
        }
        
        markovChain[currentWord].push(nextWord);
        totalTransitions++;
    }
    
    // Update Stats UI
    const uniqueKeys = Object.keys(markovChain);
    uniqueWordsStat.textContent = uniqueKeys.length;
    transitionsStat.textContent = totalTransitions;
    
    // Update interface helper lists
    updateExplorerDropdown(uniqueKeys);
    updateSuggestionChips(uniqueKeys);
}

// UI Helpers
function updateSuggestionChips(uniqueKeys) {
    suggestionChips.innerHTML = '';
    
    if (uniqueKeys.length === 0) return;
    
    // Shuffle and pick 5 random keys
    const shuffled = [...uniqueKeys].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    selected.forEach(word => {
        // Clean surrounding punctuation for the chip visual
        const cleanWord = word.replace(PUNCTUATION_REGEX, '');
        if (!cleanWord) return;
        
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = cleanWord;
        chip.addEventListener('click', () => {
            startWordInput.value = cleanWord;
            // Visual pulse effect on the input
            startWordInput.focus();
            startWordInput.style.borderColor = 'var(--accent-yellow)';
            setTimeout(() => {
                startWordInput.style.borderColor = '';
            }, 300);
        });
        suggestionChips.appendChild(chip);
    });
}

function updateExplorerDropdown(uniqueKeys) {
    // Keep current selected value if still valid
    const currentVal = explorerSelect.value;
    
    explorerSelect.innerHTML = '<option value="">Select a word...</option>';
    
    // Sort unique keys alphabetically
    const sortedKeys = [...uniqueKeys].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    sortedKeys.forEach(word => {
        const option = document.createElement('option');
        option.value = word;
        option.textContent = word;
        if (word === currentVal) {
            option.selected = true;
        }
        explorerSelect.appendChild(option);
    });
    
    // If the previous selection is no longer valid, reset explorer outputs
    if (!markovChain[currentVal]) {
        explorerResults.innerHTML = '<p class="empty-state">Choose a word above to see transition probabilities.</p>';
    }
}

function setRandomStartWord() {
    const keys = Object.keys(markovChain);
    if (keys.length === 0) return;
    
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    // Clean punctuation
    const cleanWord = randomKey.replace(PUNCTUATION_REGEX, '');
    startWordInput.value = cleanWord || randomKey;
}

// Transition probability calculator for the Explorer Panel
function handleExplorerChange(e) {
    const selectedWord = e.target.value;
    
    if (!selectedWord || !markovChain[selectedWord]) {
        explorerResults.innerHTML = '<p class="empty-state">Choose a word above to see transition probabilities.</p>';
        return;
    }
    
    const followers = markovChain[selectedWord];
    const totalFollowers = followers.length;
    
    // Count frequencies of each next word
    const frequencies = {};
    followers.forEach(word => {
        frequencies[word] = (frequencies[word] || 0) + 1;
    });
    
    // Convert to sorted array of objects
    const sortedTransitions = Object.keys(frequencies).map(word => {
        return {
            word: word,
            count: frequencies[word],
            probability: ((frequencies[word] / totalFollowers) * 100).toFixed(1)
        };
    }).sort((a, b) => b.count - a.count); // sort descending by count
    
    // Render
    explorerResults.innerHTML = '';
    sortedTransitions.forEach(item => {
        const row = document.createElement('div');
        row.className = 'transition-row';
        
        row.innerHTML = `
            <span class="transition-word">${item.word}</span>
            <div class="transition-stats">
                <span class="transition-count">${item.count}x</span>
                <span class="transition-probability">${item.probability}%</span>
            </div>
        `;
        explorerResults.appendChild(row);
    });
}

// Text Generation Algorithm (with word-by-word visual animation)
let typingInterval = null;

function handleGeneration() {
    // Clear any active typing animation
    if (typingInterval) {
        clearInterval(typingInterval);
    }
    
    const startWordInputVal = startWordInput.value.trim();
    const wordsToGenerate = parseInt(wordCountSlider.value, 10);
    
    if (!startWordInputVal) {
        showError("Please enter a starting word!");
        return;
    }
    
    const keys = Object.keys(markovChain);
    if (keys.length === 0) {
        showError("The training corpus is empty or too short. Please add more text.");
        return;
    }
    
    // Clean input start word for lookup
    const cleanInput = startWordInputVal.replace(PUNCTUATION_REGEX, '').toLowerCase();
    
    // Find matching key in the chain (case-insensitive and punctuation-robust)
    let matchedKey = null;
    for (let key of keys) {
        const cleanKey = key.replace(PUNCTUATION_REGEX, '').toLowerCase();
        if (cleanKey === cleanInput) {
            matchedKey = key;
            break;
        }
    }
    
    if (!matchedKey) {
        // Build suggestions list
        const suggestions = keys.slice(0, 8).map(k => k.replace(PUNCTUATION_REGEX, '')).filter(Boolean);
        showError(`Starting word "${startWordInputVal}" was not found in the text.<br>Suggestions: ${suggestions.join(', ')}`);
        return;
    }
    
    // Generate words array using Markov Chain
    const generatedWords = [matchedKey];
    let currentWord = matchedKey;
    
    for (let i = 0; i < wordsToGenerate - 1; i++) {
        const followers = markovChain[currentWord];
        
        if (followers && followers.length > 0) {
            // Pick follower randomly
            const nextWord = followers[Math.floor(Math.random() * followers.length)];
            generatedWords.push(nextWord);
            currentWord = nextWord;
        } else {
            // If hit a dead end, pick a random key from the chain to continue
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            generatedWords.push(randomKey);
            currentWord = randomKey;
        }
    }
    
    // Animation Rendering
    generationOutput.innerHTML = '';
    generationOutput.classList.remove('empty');
    
    let wordIndex = 0;
    
    // Render word by word with typing effect
    typingInterval = setInterval(() => {
        if (wordIndex < generatedWords.length) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-span';
            wordSpan.textContent = generatedWords[wordIndex];
            generationOutput.appendChild(wordSpan);
            
            // Auto scroll to bottom of output container
            generationOutput.scrollTop = generationOutput.scrollHeight;
            
            wordIndex++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
        }
    }, 45); // 45ms per word for fluid typing speed
}

function showError(message) {
    generationOutput.innerHTML = `<span style="color: var(--accent-yellow); font-weight: 500;">[Error] ${message}</span>`;
    generationOutput.classList.remove('empty');
    generationOutput.scrollTop = 0;
}

function copyToClipboard() {
    // Extract text from output spans
    const spans = generationOutput.querySelectorAll('.word-span');
    let text = '';
    
    if (spans.length > 0) {
        text = Array.from(spans).map(span => span.textContent).join(' ');
    } else {
        // Fallback for empty state or error text
        text = generationOutput.textContent.trim();
        if (text === "Your generated text will appear here...") {
            return;
        }
    }
    
    navigator.clipboard.writeText(text).then(() => {
        // Success indicator
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.style.borderColor = 'var(--accent-cyan)';
        copyBtn.style.color = 'var(--accent-cyan)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
        }, 1500);
    });
}
