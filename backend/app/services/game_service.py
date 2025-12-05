import random
import string
from typing import Dict, Optional

from ..models import Card, CardType, Game, GameState, Player, Team, Role, Clue
from .word_service import WordService


class GameService:
    """Service for managing game logic."""

    def __init__(self):
        self.games: Dict[str, Game] = {}

    def _generate_game_id(self) -> str:
        """Generate a unique 6-character game ID."""
        while True:
            game_id = ''.join(random.choices(string.ascii_uppercase, k=6))
            if game_id not in self.games:
                return game_id

    def create_game(self) -> Game:
        """Create a new game in lobby state."""
        game_id = self._generate_game_id()
        game = Game(id=game_id)
        self.games[game_id] = game
        return game

    def get_game(self, game_id: str) -> Optional[Game]:
        """Get a game by ID."""
        return self.games.get(game_id)

    def add_player(self, game_id: str, player_id: str, player_name: str) -> Optional[Player]:
        """Add a player to a game."""
        game = self.get_game(game_id)
        if not game:
            return None

        if player_id in game.players:
            return game.players[player_id]

        player = Player(id=player_id, name=player_name)
        game.players[player_id] = player
        return player

    def remove_player(self, game_id: str, player_id: str) -> bool:
        """Remove a player from a game."""
        game = self.get_game(game_id)
        if game and player_id in game.players:
            del game.players[player_id]
            return True
        return False

    def assign_role(self, game_id: str, player_id: str, team: Team, role: Role) -> bool:
        """Assign a team and role to a player."""
        game = self.get_game(game_id)
        if not game or player_id not in game.players:
            return False

        if game.state != GameState.LOBBY:
            return False

        # Check if spymaster role is already taken for this team
        if role == Role.SPYMASTER:
            for p in game.players.values():
                if p.id != player_id and p.team == team and p.role == Role.SPYMASTER:
                    return False

        player = game.players[player_id]
        player.team = team
        player.role = role
        return True

    def start_game(self, game_id: str) -> bool:
        """Initialize and start the game."""
        game = self.get_game(game_id)
        if not game or game.state != GameState.LOBBY:
            return False

        # Validate: need at least one spymaster per team
        red_spymaster = any(
            p.team == Team.RED and p.role == Role.SPYMASTER
            for p in game.players.values()
        )
        blue_spymaster = any(
            p.team == Team.BLUE and p.role == Role.SPYMASTER
            for p in game.players.values()
        )

        if not red_spymaster or not blue_spymaster:
            return False

        # Initialize board
        words = WordService.get_random_words(25)

        # Randomly determine starting team (starting team gets 9 cards)
        starting_team = random.choice([Team.RED, Team.BLUE])
        game.starting_team = starting_team
        game.current_team = starting_team

        # Create card type distribution
        # Starting team: 9, Other team: 8, Neutral: 7, Assassin: 1
        card_types = []
        if starting_team == Team.RED:
            card_types = [CardType.RED] * 9 + [CardType.BLUE] * 8
        else:
            card_types = [CardType.BLUE] * 9 + [CardType.RED] * 8

        card_types += [CardType.NEUTRAL] * 7 + [CardType.ASSASSIN]
        random.shuffle(card_types)

        # Create cards
        game.cards = [
            Card(word=words[i], type=card_types[i], position=i)
            for i in range(25)
        ]

        game.state = GameState.IN_PROGRESS
        return True

    def give_clue(self, game_id: str, player_id: str, word: str, number: int) -> bool:
        """Spymaster gives a clue."""
        game = self.get_game(game_id)
        if not game or game.state != GameState.IN_PROGRESS:
            return False

        player = game.players.get(player_id)
        if not player or player.role != Role.SPYMASTER:
            return False

        if player.team != game.current_team:
            return False

        if game.current_clue is not None:
            return False  # Already gave a clue this turn

        clue = Clue(word=word.upper(), number=number, team=game.current_team)
        game.current_clue = clue
        game.clue_history.append(clue)
        game.guesses_remaining = number + 1  # Can guess number + 1 times

        return True

    def reveal_card(self, game_id: str, player_id: str, position: int) -> dict:
        """Operative reveals a card. Returns result with card info and game state changes."""
        game = self.get_game(game_id)
        if not game or game.state != GameState.IN_PROGRESS:
            return {"success": False, "error": "Game not in progress"}

        player = game.players.get(player_id)
        if not player or player.role != Role.OPERATIVE:
            return {"success": False, "error": "Only operatives can guess"}

        if player.team != game.current_team:
            return {"success": False, "error": "Not your team's turn"}

        if game.current_clue is None:
            return {"success": False, "error": "Wait for spymaster clue"}

        if game.guesses_remaining <= 0:
            return {"success": False, "error": "No guesses remaining"}

        if position < 0 or position >= 25:
            return {"success": False, "error": "Invalid card position"}

        card = game.cards[position]
        if card.revealed:
            return {"success": False, "error": "Card already revealed"}

        # Reveal the card
        card.revealed = True
        game.guesses_remaining -= 1

        result = {
            "success": True,
            "card": card.model_dump(),
            "turn_ended": False,
            "game_over": False,
            "winner": None,
            "reason": None
        }

        # Check for assassin
        if card.type == CardType.ASSASSIN:
            game.state = GameState.FINISHED
            game.winner = Team.BLUE if game.current_team == Team.RED else Team.RED
            result["game_over"] = True
            result["winner"] = game.winner.value
            result["reason"] = "assassin"
            return result

        # Check for win condition
        red_remaining = game.count_remaining(Team.RED)
        blue_remaining = game.count_remaining(Team.BLUE)

        if red_remaining == 0:
            game.state = GameState.FINISHED
            game.winner = Team.RED
            result["game_over"] = True
            result["winner"] = Team.RED.value
            result["reason"] = "all_cards_revealed"
            return result

        if blue_remaining == 0:
            game.state = GameState.FINISHED
            game.winner = Team.BLUE
            result["game_over"] = True
            result["winner"] = Team.BLUE.value
            result["reason"] = "all_cards_revealed"
            return result

        # Check if turn should end
        if card.type.value != game.current_team.value:
            # Wrong card - turn ends
            result["turn_ended"] = True
            self._end_turn(game)
        elif game.guesses_remaining <= 0:
            # No more guesses
            result["turn_ended"] = True
            self._end_turn(game)

        return result

    def end_turn(self, game_id: str, player_id: str) -> bool:
        """Operative voluntarily ends their turn."""
        game = self.get_game(game_id)
        if not game or game.state != GameState.IN_PROGRESS:
            return False

        player = game.players.get(player_id)
        if not player or player.team != game.current_team:
            return False

        if game.current_clue is None:
            return False

        self._end_turn(game)
        return True

    def _end_turn(self, game: Game):
        """Internal method to switch turns."""
        game.current_team = Team.BLUE if game.current_team == Team.RED else Team.RED
        game.current_clue = None
        game.guesses_remaining = 0

    def get_game_state(self, game_id: str) -> Optional[dict]:
        """Get serializable game state."""
        game = self.get_game(game_id)
        if not game:
            return None

        return {
            "id": game.id,
            "state": game.state.value,
            "cards": [card.model_dump() for card in game.cards],
            "players": {pid: p.model_dump() for pid, p in game.players.items()},
            "currentTeam": game.current_team.value if game.current_team else None,
            "startingTeam": game.starting_team.value if game.starting_team else None,
            "currentClue": game.current_clue.model_dump() if game.current_clue else None,
            "guessesRemaining": game.guesses_remaining,
            "winner": game.winner.value if game.winner else None,
            "redRemaining": game.count_remaining(Team.RED) if game.cards else 0,
            "blueRemaining": game.count_remaining(Team.BLUE) if game.cards else 0,
            "clueHistory": [c.model_dump() for c in game.clue_history]
        }

    def delete_game(self, game_id: str) -> bool:
        """Delete a game."""
        if game_id in self.games:
            del self.games[game_id]
            return True
        return False


# Singleton instance
game_service = GameService()
