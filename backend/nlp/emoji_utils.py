import emoji
import re

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "\U00002600-\U000026FF"
    "\U0000FE00-\U0000FE0F"
    "\U0000200D"
    "]+",
    re.UNICODE,
)

EMOJI_SENTIMENT: dict[str, str] = {
    "😀": "positive",
    "😁": "positive",
    "😂": "positive",
    "🤣": "positive",
    "😃": "positive",
    "😄": "positive",
    "😅": "positive",
    "😆": "positive",
    "😉": "positive",
    "😊": "positive",
    "😋": "positive",
    "😎": "positive",
    "😍": "positive",
    "🥰": "positive",
    "😘": "positive",
    "😜": "positive",
    "🤗": "positive",
    "🤩": "positive",
    "🎉": "positive",
    "🎊": "positive",
    "💪": "positive",
    "🔥": "positive",
    "❤️": "positive",
    "💕": "positive",
    "✨": "positive",
    "🌟": "positive",
    "😡": "negative",
    "😠": "negative",
    "🤬": "negative",
    "😤": "negative",
    "😢": "negative",
    "😭": "negative",
    "😞": "negative",
    "😔": "negative",
    "😩": "negative",
    "😫": "negative",
    "😒": "negative",
    "🙄": "negative",
    "😏": "negative",
    "💀": "negative",
    "👎": "negative",
    "😈": "negative",
    "🤮": "negative",
    "😱": "negative",
    "😨": "negative",
    "😰": "negative",
    "🥺": "neutral",
    "😐": "neutral",
    "😶": "neutral",
    "🤔": "neutral",
    "🙃": "neutral",
    "😴": "neutral",
    "🤷": "neutral",
    "🤨": "neutral",
    "😮": "neutral",
    "😲": "neutral",
    "🤭": "neutral",
    "😬": "neutral",
}

EMOJI_MEANINGS: dict[str, str] = {
    "😀": "grinning face",
    "😁": "beaming face with smiling eyes",
    "😂": "face with tears of joy",
    "🤣": "rolling on the floor laughing",
    "😃": "grinning face with big eyes",
    "😄": "grinning face with smiling eyes",
    "😅": "grinning face with sweat",
    "😆": "grinning squinting face",
    "😉": "winking face",
    "😊": "smiling face with smiling eyes",
    "😋": "face savoring food",
    "😎": "smiling face with sunglasses",
    "😍": "smiling face with heart-eyes",
    "🥰": "smiling face with hearts",
    "😘": "face blowing a kiss",
    "😜": "winking face with tongue",
    "🤗": "hugging face",
    "🤩": "star-struck",
    "🎉": "party popper",
    "🎊": "confetti ball",
    "💪": "flexed biceps",
    "🔥": "fire",
    "❤️": "red heart",
    "💕": "two hearts",
    "✨": "sparkles",
    "🌟": "glowing star",
    "😡": "pouting face",
    "😠": "angry face",
    "🤬": "face with medical mask",
    "😤": "face with steam from nose",
    "😢": "crying face",
    "😭": "loudly crying face",
    "😞": "disappointed face",
    "😔": "pensive face",
    "😩": "weary face",
    "😫": "tired face",
    "😒": "unamused face",
    "🙄": "face with rolling eyes",
    "😏": "smirking face",
    "💀": "skull",
    "👎": "thumbs down",
    "😈": "smiling face with horns",
    "🤮": "face vomiting",
    "😱": "face screaming in fear",
    "😨": "fearful face",
    "😰": "anxious face with sweat",
    "🥺": "pleading face",
    "😐": "neutral face",
    "😶": "face without mouth",
    "🤔": "thinking face",
    "🙃": "upside-down face",
    "😴": "sleeping face",
    "🤷": "shrugging",
    "🤨": "face with raised eyebrow",
    "😮": "face with open mouth",
    "😲": "astonished face",
    "🤭": "face with hand over mouth",
    "😬": "grimacing face",
}


def analyze_emojis(text: str) -> dict:
    found_emojis = EMOJI_PATTERN.findall(text)
    emoji_count = len(found_emojis)
    emoji_list = []

    for emoji_char in found_emojis:
        meaning = EMOJI_MEANINGS.get(emoji_char, "unknown emoji")
        sentiment = EMOJI_SENTIMENT.get(emoji_char, "neutral")
        emoji_list.append(
            {"emoji": emoji_char, "meaning": meaning, "sentiment": sentiment}
        )

    return {"emojiCount": emoji_count, "emojiList": emoji_list}


def replace_emojis_with_text(text: str) -> str:
    def replacer(match):
        emoji_char = match.group(0)
        meaning = EMOJI_MEANINGS.get(emoji_char, "")
        if meaning:
            return f" {meaning} "
        return " "

    result = EMOJI_PATTERN.sub(replacer, text)
    result = re.sub(r"\s+", " ", result).strip()
    return result
