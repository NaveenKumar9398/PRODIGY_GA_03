# Text Generation Using Markov Chains

A beginner-friendly project that implements a basic **Markov Chain** to generate random text based on a source document. This project includes both a command-line interface (CLI) version and an interactive web interface.

This codebase is structured specifically for educational purposes, such as a Generative AI internship assignment (Task-03).

---

## Table of Contents
1. [What is a Markov Chain?](#what-is-a-markov-chain)
2. [How the Project Works](#how-the-project-works)
3. [Project Structure](#project-structure)
4. [How to Run the CLI Version](#how-to-run-the-cli-version)
5. [How to Run the Web Version (New!)](#how-to-run-the-web-version)
6. [Future Enhancements](#future-enhancements)

---

## What is a Markov Chain?

A **Markov Chain** is a mathematical system that undergoes transitions from one state to another according to certain probabilistic rules. The defining characteristic of a Markov Chain is the **Markov Property**:
> *The probability of transitioning to any future state depends only on the current state, and not on the sequence of events that preceded it.*

In the context of text generation:
- Each **state** is a word in our text.
- The **transitions** are the probabilities of one word following another.
- For example, in the sentence: *"I love machine learning and I love artificial intelligence"*, the word `"love"` is followed by `"machine"` once and `"artificial"` once. If our current state is `"love"`, there is a 50% chance the next word will be `"machine"` and a 50% chance it will be `"artificial"`.

---

## How the Project Works

This program builds a **first-order (1-gram) Markov Chain** from a training text. Here is the step-by-step breakdown:

1. **Load Text**: The program reads training text (loaded from a file in Python, or editable in the browser).
2. **Tokenization (Splitting)**: It splits the raw text into a list of words using whitespace. Punctuation marks are kept attached to the words so that the generated text naturally includes commas, periods, and sentence boundaries.
3. **Build the Chain**: It constructs a dictionary (the transition table) where:
   - **Keys** are the unique words found in the text.
   - **Values** are lists containing all the words that immediately followed that key word in the source text.
4. **Interactive Prompts / Inputs**: The user inputs a starting word and the number of words to generate.
5. **Text Generation**:
   - The program searches for the starting word (using a case-insensitive lookup that strips outer punctuation for better usability).
   - If not found, it prints a friendly error message alongside suggestions of words that *do* exist in the text.
   - It then starts a loop: picking a random word from the current word's transition list, appending it to the output, and updating the current state to this new word.
   - If a word has no following transitions (like the last word in the text), the program gracefully recovers by choosing a random word from the text to continue generation.

---

## Project Structure

```text
TextGeneration/
├── data.txt          # Sample source text containing paragraphs on AI and ML
├── markov.py         # Main Python CLI script containing the Markov Chain logic
├── README.md         # Documentation explaining the project
└── web/              # Interactive Web Interface (HTML/CSS/JS)
    ├── index.html    # Web page layout & interface elements
    ├── style.css     # Premium dark mode stylesheet with glowing animations
    └── app.js        # JavaScript implementation of Markov Chain & animations
```

---

## How to Run the CLI Version

### Prerequisites
- Python 3.x installed on your system.
- No external libraries are needed! Only Python standard libraries (`random`, `os`, and `string`) are used.

### Execution

1. Open your terminal, command prompt, or PowerShell.
2. Navigate to the project directory:
   ```bash
   cd TextGeneration
   ```
3. Run the script:
   ```bash
   python markov.py
   ```
4. Follow the interactive prompts in your console.

---

## How to Run the Web Version

The web version features a premium glassmorphic dark-theme UI matching the internship color palette. It includes:
* **Interactive Statistics**: Real-time calculations of total words, unique words, and transitions.
* **Corpus Editor**: Paste and edit any training text to update the model in real time.
* **Markov Chain Explorer**: Select any word to inspect its transition probability distribution.
* **Typing Animation**: Watch the text generate word-by-word.

### Quick Start
You do **not** need a web server or installations to run it:
1. Open the file explorer on your computer.
2. Navigate to `TextGeneration/web/`.
3. Double-click [index.html](file:///c:/Users/ellan/OneDrive/Desktop/infotech/TextGeneration/web/index.html) to open it in Google Chrome, Microsoft Edge, or any modern web browser.

*Note: The website is self-contained and loads sample text automatically if opened locally.*

---

## Future Enhancements

To make this model more advanced, you could:
1. **Implement Higher-Order Markov Chains**: Instead of predicting the next word based on *one* current word, predict it based on a sequence of two or more words (n-grams) for more coherent and structured output.
2. **Text Cleaning**: Strip out all punctuation before building the chain, then add a sentence-capitalization post-processing step.
3. **Interactive Graph Visualizer**: Use a library like `vis.js` or `d3.js` to draw a visual node network of the states and transitions.
