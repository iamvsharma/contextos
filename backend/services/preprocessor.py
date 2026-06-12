import re
import spacy
from typing import Any
from nlp.emoji_utils import analyze_emojis, replace_emojis_with_text
from nlp.slang import SLANG_MAP
from textblob import TextBlob

nlp = None


def get_nlp():
    global nlp
    if nlp is None:
        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            import subprocess, sys

            subprocess.check_call(
                [sys.executable, "-m", "spacy", "download", "en_core_web_sm"]
            )
            nlp = spacy.load("en_core_web_sm")
    return nlp


STOPWORDS = set(
    [
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "shall", "can", "need", "dare",
        "ought", "used", "it", "its", "my", "your", "his", "her", "its",
        "our", "their", "i", "you", "he", "she", "we", "they", "me", "him",
        "us", "them", "this", "that", "these", "those", "what", "which",
        "who", "whom", "whose", "when", "where", "why", "how", "all", "each",
        "every", "both", "few", "more", "most", "other", "some", "such",
        "no", "nor", "not", "only", "own", "same", "so", "than", "too",
        "very", "just", "because", "as", "until", "while", "if", "else",
        "about", "above", "after", "again", "against", "any", "before",
        "between", "below", "down", "during", "into", "off", "once", "out",
        "over", "then", "under", "up", "upon",
    ]
)

MENTION_PATTERN = re.compile(r"@\w+")
HASHTAG_PATTERN = re.compile(r"#\w+")
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+|\S+\.\S+")
PUNCTUATION_PATTERN = re.compile(r"[!\"#$%&'()*+,\-./:;<=>?@[\\\]\^_`{|}~“”’‘—…]")


def step_lowercase(text: str) -> str:
    return text.lower()


def step_remove_punctuation(text: str) -> str:
    return PUNCTUATION_PATTERN.sub("", text)


def step_remove_stopwords(text: str) -> str:
    return " ".join(w for w in text.split() if w.lower() not in STOPWORDS)


def step_tokenize(text: str) -> tuple[str, list[str]]:
    tokens = text.split()
    return text, tokens


def step_lemmatize(text: str) -> str:
    doc = get_nlp()(text)
    return " ".join(t.lemma_ for t in doc)


def step_remove_numbers(text: str) -> str:
    return re.sub(r"\d+", "", text)


def step_normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def step_stem_porter(text: str) -> str:
    doc = get_nlp()(text)
    stems = []
    for t in doc:
        w = t.text.lower()
        if len(w) > 4:
            if w.endswith("ing"):
                w = w[:-3]
            elif w.endswith("ly"):
                w = w[:-2]
            elif w.endswith("ed"):
                w = w[:-2]
            elif w.endswith("es"):
                w = w[:-1]
            elif w.endswith("s") and not w.endswith("ss"):
                w = w[:-1]
        stems.append(w)
    return " ".join(stems)


def step_handle_emojis(text: str) -> str:
    return replace_emojis_with_text(text)


def step_normalize_slang(text: str) -> str:
    words = text.split()
    normalized = [SLANG_MAP.get(w.lower(), w) for w in words]
    return " ".join(normalized)


def step_remove_mentions(text: str) -> str:
    return MENTION_PATTERN.sub("", text).strip()


def step_remove_hashtags(text: str) -> str:
    return HASHTAG_PATTERN.sub("", text).strip()


def step_remove_urls(text: str) -> str:
    return URL_PATTERN.sub("", text).strip()


def step_remove_special_characters(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", "", text)


STEP_FUNCTIONS = {
    "lowercase": step_lowercase,
    "remove_punctuation": step_remove_punctuation,
    "remove_stopwords": step_remove_stopwords,
    "tokenize": step_tokenize,
    "lemmatize": step_lemmatize,
    "handle_emojis": step_handle_emojis,
    "normalize_slang": step_normalize_slang,
    "remove_mentions": step_remove_mentions,
    "remove_hashtags": step_remove_hashtags,
    "remove_urls": step_remove_urls,
    "remove_numbers": step_remove_numbers,
    "normalize_whitespace": step_normalize_whitespace,
    "stem_porter": step_stem_porter,
    "remove_special_characters": step_remove_special_characters,
}

STEP_LABELS = {
    "lowercase": "Lowercase",
    "remove_punctuation": "Remove Punctuation",
    "remove_stopwords": "Remove Stopwords",
    "tokenize": "Tokenization",
    "lemmatize": "Lemmatization (WordNet)",
    "handle_emojis": "Emoji Handling",
    "normalize_slang": "Slang Normalization",
    "remove_mentions": "Remove Mentions",
    "remove_hashtags": "Remove Hashtags",
    "remove_urls": "Remove URLs",
    "remove_numbers": "Remove Numbers",
    "normalize_whitespace": "Normalize Whitespace",
    "stem_porter": "Stemming (Porter)",
    "remove_special_characters": "Remove Special Characters",
}


class PreprocessorService:
    def process_pipeline(
        self, text: str, steps: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        results = []
        current = text

        for step in steps:
            step_type = step.get("type", "")
            enabled = step.get("enabled", True)
            if not enabled:
                continue

            func = STEP_FUNCTIONS.get(step_type)
            if func is None:
                continue

            step_input = current
            result = func(current)

            if step_type == "tokenize":
                transformed, tokens = result
                current = transformed
                results.append(
                    {
                        "step": STEP_LABELS.get(step_type, step_type),
                        "input": step_input,
                        "output": current,
                        "tokens": tokens,
                    }
                )
            else:
                current = result
                results.append(
                    {
                        "step": STEP_LABELS.get(step_type, step_type),
                        "input": step_input,
                        "output": current,
                    }
                )

        return results

    def generate_insights(
        self, text: str, steps: list[dict[str, Any]]
    ) -> dict[str, Any]:
        original_tokens = len(text.split())
        original_unique = len(set(text.lower().split()))

        blob_before = TextBlob(text)
        sentiment_before = {
            "label": "positive" if blob_before.sentiment.polarity > 0 else "negative",
            "score": blob_before.sentiment.polarity,
        }

        processed = text
        for step in steps:
            if not step.get("enabled", True):
                continue
            func = STEP_FUNCTIONS.get(step.get("type", ""))
            if func:
                if step["type"] == "tokenize":
                    processed, _ = func(processed)
                else:
                    processed = func(processed)

        processed_tokens = len(processed.split()) if processed.strip() else 0
        processed_unique = len(set(processed.lower().split()))
        noise_removed = (
            round((1 - processed_tokens / max(original_tokens, 1)) * 100, 1)
            if original_tokens > 0
            else 0
        )

        blob_after = TextBlob(processed)
        sentiment_after = {
            "label": "positive" if blob_after.sentiment.polarity > 0 else "negative",
            "score": blob_after.sentiment.polarity,
        }

        emoji_analysis = analyze_emojis(text)
        emoji_counts: dict[str, float] = {}
        for e in emoji_analysis.get("emojiList", []):
            sent = e.get("sentiment", "neutral")
            emoji_counts[sent] = emoji_counts.get(sent, 0) + 1

        word_freq: dict[str, int] = {}
        for w in processed.lower().split():
            if w not in STOPWORDS and len(w) > 1:
                word_freq[w] = word_freq.get(w, 0) + 1
        top_words = sorted(word_freq.items(), key=lambda x: -x[1])[:10]

        return {
            "originalTokens": original_tokens,
            "processedTokens": processed_tokens,
            "uniqueWords": processed_unique,
            "noiseRemovedPercent": noise_removed,
            "emojiCount": emoji_analysis.get("emojiCount", 0),
            "emojiSentiments": emoji_counts,
            "sentimentBefore": sentiment_before,
            "sentimentAfter": sentiment_after,
            "topWords": [{"word": w, "count": c} for w, c in top_words],
        }

    def analyze_social(self, text: str) -> dict[str, Any]:
        mentions = MENTION_PATTERN.findall(text)
        hashtags = HASHTAG_PATTERN.findall(text)
        urls = URL_PATTERN.findall(text)

        emoji_result = analyze_emojis(text)

        return {
            "mentionCount": len(mentions),
            "hashtagCount": len(hashtags),
            "urlCount": len(urls),
            "emojiCount": emoji_result.get("emojiCount", 0),
            "emojiList": emoji_result.get("emojiList", []),
        }
