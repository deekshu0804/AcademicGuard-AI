import string
import spacy
from typing import TypedDict
import textstat

# Load spaCy model
# Ensure the model is downloaded first: `python -m spacy download en_core_web_sm`
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise OSError(
        "spaCy model 'en_core_web_sm' not found. "
        "Please install it using: python -m spacy download en_core_web_sm"
    )

class StylometryFeatures(TypedDict):
    avg_sentence_length: float
    type_token_ratio: float
    avg_word_length: float
    punctuation_density: float
    passive_voice_rate: float
    noun_ratio: float
    verb_ratio: float
    adj_ratio: float
    flesch_reading_ease: float
    stopword_ratio: float

def extract_stylometry_features(text: str) -> StylometryFeatures:
    """
    Extracts stylometric features from a given text for academic integrity detection.
    
    Args:
        text (str): The student's essay text.
        
    Returns:
        StylometryFeatures: A typed dictionary containing float feature values,
                            normalized between 0 and 1 where possible.
                            
    Edge cases handled:
        - Empty text or whitespace-only text returns 0.0 for all features.
        - Single sentence text is handled naturally by the sentence splitter.
        - Non-English characters are mostly ignored or processed as unknown by spaCy, 
          but textstat handles strings smoothly.
          
    Examples:
        >>> text = "The essay was written by the student. It is very good!"
        >>> features = extract_stylometry_features(text)
        >>> isinstance(features, dict)
        True
        >>> 'type_token_ratio' in features
        True
    """
    default_features: StylometryFeatures = {
        "avg_sentence_length": 0.0,
        "type_token_ratio": 0.0,
        "avg_word_length": 0.0,
        "punctuation_density": 0.0,
        "passive_voice_rate": 0.0,
        "noun_ratio": 0.0,
        "verb_ratio": 0.0,
        "adj_ratio": 0.0,
        "flesch_reading_ease": 0.0,
        "stopword_ratio": 0.0,
    }
    
    if not text or not text.strip():
        return default_features
        
    doc = nlp(text)
    
    sentences = list(doc.sents)
    num_sentences = len(sentences)
    if num_sentences == 0:
        return default_features
        
    # Extract actual words (ignoring punctuation and spaces)
    words = [token.text for token in doc if not token.is_punct and not token.is_space]
    num_words = len(words)
    
    if num_words == 0:
        # Text only has punctuation/spaces
        chars = len(text)
        punct_count = sum(1 for char in text if char in string.punctuation)
        default_features["punctuation_density"] = punct_count / chars if chars > 0 else 0.0
        return default_features

    # 1. Calculate basic counts
    unique_words = set([w.lower() for w in words])
    num_chars_in_words = sum(len(w) for w in words)
    punct_count = sum(1 for char in text if char in string.punctuation)
    total_chars = len(text)
    
    # 2. SpaCy POS & Stopword counts
    num_nouns = sum(1 for token in doc if token.pos_ in ["NOUN", "PROPN"])
    num_verbs = sum(1 for token in doc if token.pos_ == "VERB")
    num_adjs = sum(1 for token in doc if token.pos_ == "ADJ")
    num_stopwords = sum(1 for token in doc if token.is_stop)
    
    # 3. Passive voice detection
    # A simple heuristic using dependency parsing: 'auxpass' or 'nsubjpass'
    passive_sentences = 0
    for sent in sentences:
        is_passive = any(token.dep_ in ['auxpass', 'nsubjpass'] for token in sent)
        if is_passive:
            passive_sentences += 1
            
    # 4. Calculate and normalize features (0.0 to 1.0)
    
    # avg_sentence_length: max 50 words per sentence for soft normalization
    raw_avg_sent_len = num_words / num_sentences
    norm_avg_sent_len = min(raw_avg_sent_len / 50.0, 1.0) 
    
    # type_token_ratio: naturally between 0 and 1
    type_token_ratio = len(unique_words) / num_words
    
    # avg_word_length: max 15 chars per word for soft normalization
    raw_avg_word_len = num_chars_in_words / num_words
    norm_avg_word_len = min(raw_avg_word_len / 15.0, 1.0)
    
    # punctuation_density: naturally between 0 and 1
    punctuation_density = punct_count / total_chars if total_chars > 0 else 0.0
    
    # passive_voice_rate: naturally between 0 and 1
    passive_voice_rate = passive_sentences / num_sentences
    
    # POS tag ratios: naturally between 0 and 1
    noun_ratio = num_nouns / num_words
    verb_ratio = num_verbs / num_words
    adj_ratio = num_adjs / num_words
    stopword_ratio = num_stopwords / num_words
    
    # flesch_reading_ease: 0-100 scale normally.
    fre_score = textstat.flesch_reading_ease(text)
    # Clamp between 0 and 100, then normalize to 0-1
    norm_fre_score = max(0.0, min(fre_score, 100.0)) / 100.0
    
    return {
        "avg_sentence_length": float(norm_avg_sent_len),
        "type_token_ratio": float(type_token_ratio),
        "avg_word_length": float(norm_avg_word_len),
        "punctuation_density": float(punctuation_density),
        "passive_voice_rate": float(passive_voice_rate),
        "noun_ratio": float(noun_ratio),
        "verb_ratio": float(verb_ratio),
        "adj_ratio": float(adj_ratio),
        "flesch_reading_ease": float(norm_fre_score),
        "stopword_ratio": float(stopword_ratio),
    }

# ==========================================
# UNIT TESTS
# ==========================================
"""
if __name__ == "__main__":
    import unittest

    class TestStylometryExtractor(unittest.TestCase):
        def test_empty_string(self):
            features = extract_stylometry_features("")
            self.assertEqual(features["avg_sentence_length"], 0.0)
            self.assertEqual(features["type_token_ratio"], 0.0)

        def test_whitespace_only(self):
            features = extract_stylometry_features("   ")
            self.assertEqual(features["avg_sentence_length"], 0.0)

        def test_single_sentence(self):
            text = "This is a simple sentence."
            features = extract_stylometry_features(text)
            self.assertGreater(features["type_token_ratio"], 0.0)
            self.assertGreater(features["noun_ratio"], 0.0)
            self.assertGreater(features["flesch_reading_ease"], 0.0)

        def test_passive_voice(self):
            text = "The essay was written by the student."
            features = extract_stylometry_features(text)
            self.assertEqual(features["passive_voice_rate"], 1.0)
            
        def test_complex_text(self):
            text = "The quick brown fox jumps over the lazy dog. It was seen by everyone. 速度!"
            features = extract_stylometry_features(text)
            self.assertGreater(features["stopword_ratio"], 0.0)
            self.assertGreater(features["punctuation_density"], 0.0)
            
        def test_punctuation_only(self):
            text = "!?."
            features = extract_stylometry_features(text)
            self.assertEqual(features["punctuation_density"], 1.0)
            self.assertEqual(features["avg_word_length"], 0.0)

    # Run tests if executed as script
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
"""
