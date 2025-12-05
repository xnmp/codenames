from enum import Enum
from pydantic import BaseModel


class CardType(str, Enum):
    RED = "red"
    BLUE = "blue"
    NEUTRAL = "neutral"
    ASSASSIN = "assassin"


class Card(BaseModel):
    word: str
    type: CardType
    revealed: bool = False
    position: int  # 0-24
