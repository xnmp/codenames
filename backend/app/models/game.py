from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from .card import Card
from .player import Player, Team


class GameState(str, Enum):
    LOBBY = "lobby"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class Clue(BaseModel):
    word: str
    number: int
    team: Team


class Game(BaseModel):
    id: str
    state: GameState = GameState.LOBBY
    cards: List[Card] = Field(default_factory=list)
    players: Dict[str, Player] = Field(default_factory=dict)
    current_team: Optional[Team] = None
    starting_team: Optional[Team] = None
    current_clue: Optional[Clue] = None
    guesses_remaining: int = 0
    winner: Optional[Team] = None
    clue_history: List[Clue] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_cards_for_role(self, is_spymaster: bool) -> List[dict]:
        """Return cards with type hidden for operatives (unrevealed cards)."""
        result = []
        for card in self.cards:
            card_dict = card.model_dump()
            if not is_spymaster and not card.revealed:
                card_dict["type"] = None
            result.append(card_dict)
        return result

    def count_remaining(self, team: Team) -> int:
        """Count remaining unrevealed cards for a team."""
        return sum(1 for card in self.cards if card.type.value == team.value and not card.revealed)
