import random
from typing import List

from ..utils.word_lists import WORDS


class WordService:
    """Service for managing word selection."""

    @staticmethod
    def get_random_words(count: int = 25) -> List[str]:
        """Select random words for a game board."""
        return random.sample(WORDS, count)
