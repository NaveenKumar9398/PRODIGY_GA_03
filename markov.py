import random
import os
import string

def load_text(filename):
    """
    Reads the contents of a text file.
    
    Parameters:
    filename (str): The path to the text file.
    
    Returns:
    str: The raw text content of the file, or None if the file doesn't exist.
    """
    if not os.path.exists(filename):
        print(f"Error: The file '{filename}' was not found.")
        print("Please ensure that data.txt is in the same directory as this script.")
        return None
    
    with open(filename, 'r', encoding='utf-8') as file:
        return file.read()

def clean_and_split_text(text):
    """
    Splits the text into individual words using whitespace.
    We keep the punctuation attached to the words so that the generated text
    retains a natural sentence structure with periods and commas.
    
    Parameters:
    text (str): The raw text to process.
    
    Returns:
    list: A list of words from the text.
    """
    words = text.split()
    return words

def build_markov_chain(words):
    """
    Builds a first-order Markov Chain.
    A Markov Chain maps each word to a list of all words that follow it.
    
    Parameters:
    words (list): The list of words to process.
    
    Returns:
    dict: The Markov Chain dictionary.
    """
    chain = {}
    
    for i in range(len(words) - 1):
        current_word = words[i]
        next_word = words[i + 1]
        
        # Corrected indentation here (aligned with 8 spaces)
        if current_word not in chain:
            chain[current_word] = []
        
        chain[current_word].append(next_word)
        
    return chain

def find_starting_word(chain, start_word):
    """
    Finds a starting word in the Markov Chain keys, ignoring case and outer punctuation.
    This makes the program more user-friendly and robust to input variations.
    
    Parameters:
    chain (dict): The Markov Chain dictionary.
    start_word (str): The user's input starting word.
    
    Returns:
    str: The exact matching key from the chain, or None if no match is found.
    """
    clean_input = start_word.strip(string.punctuation).lower()

    for key in chain.keys():
        clean_key = key.strip(string.punctuation).lower()
        if clean_key == clean_input:
            return key
            
    return None

def generate_text(chain, start_word, num_words):
    """
    Generates a sequence of random text based on the Markov Chain.
    
    Parameters:
    chain (dict): The Markov Chain dictionary.
    start_word (str): The user's starting word.
    num_words (int): Total number of words to generate.
    
    Returns:
    str: The generated text, or None if the starting word is invalid.
    """
    matched_start_word = find_starting_word(chain, start_word)
    
    if not matched_start_word:
        print(f"\n[Error] The starting word '{start_word}' was not found in the source text.")
        print("Please try again with a word that exists in data.txt.")

        available_words = list(chain.keys())
        suggestions = random.sample(available_words, min(8, len(available_words)))
        clean_suggestions = [w.strip(string.punctuation) for w in suggestions]
        print(f"Suggestions: {', '.join(clean_suggestions)}")
        return None

    current_word = matched_start_word
    output = [current_word]
    
    for _ in range(num_words - 1):
        if current_word in chain and chain[current_word]:
            next_word = random.choice(chain[current_word])
            output.append(next_word)
            current_word = next_word
        else:
            current_word = random.choice(list(chain.keys()))
            output.append(current_word)
            
    return " ".join(output)

def main():
    print("=" * 60)
    print("      Text Generation Using Markov Chains - Simple Demo")
    print("=" * 60)
    
    filename = "data.txt"
    text = load_text(filename)
    if text is None:
        return
    words = clean_and_split_text(text)
    if not words:
        print("Error: The text file is empty.")
        return
        
    print(f"[*] Loaded {len(words)} words from '{filename}'.")
    
    chain = build_markov_chain(words)
    print(f"[*] Successfully built Markov Chain with {len(chain)} unique words.")
    print("-" * 60)
    
    start_word = input("Enter a starting word: ").strip()
    while True:
        num_words_input = input("Enter the number of words to generate: ").strip()
        try:
            num_words = int(num_words_input)
            if num_words <= 0:
                print("Please enter a positive integer greater than 0.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter a valid integer (e.g., 20, 50).")
            
    generated_story = generate_text(chain, start_word, num_words)

    if generated_story:
        print("\n" + "=" * 60)
        print("GENERATED TEXT:")
        print("=" * 60)
        print(generated_story)
        print("=" * 60)

if __name__ == "__main__":
    main()
