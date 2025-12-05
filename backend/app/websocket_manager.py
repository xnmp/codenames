from typing import Dict, Set
from fastapi import WebSocket
import json

from .models.player import Role


class ConnectionManager:
    """Manages WebSocket connections for game rooms."""

    def __init__(self):
        # game_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # websocket -> (game_id, player_id)
        self.connection_info: Dict[WebSocket, tuple[str, str]] = {}

    async def connect(self, websocket: WebSocket, game_id: str, player_id: str):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = set()
        self.active_connections[game_id].add(websocket)
        self.connection_info[websocket] = (game_id, player_id)

    def disconnect(self, websocket: WebSocket) -> tuple[str, str] | None:
        """Remove a WebSocket connection and return (game_id, player_id)."""
        if websocket in self.connection_info:
            game_id, player_id = self.connection_info[websocket]
            if game_id in self.active_connections:
                self.active_connections[game_id].discard(websocket)
                if not self.active_connections[game_id]:
                    del self.active_connections[game_id]
            del self.connection_info[websocket]
            return (game_id, player_id)
        return None

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        await websocket.send_text(json.dumps(message))

    async def broadcast_to_game(self, game_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast a message to all connections in a game room."""
        if game_id in self.active_connections:
            for connection in self.active_connections[game_id]:
                if connection != exclude:
                    try:
                        await connection.send_text(json.dumps(message))
                    except Exception:
                        pass

    async def broadcast_game_state(self, game_id: str, game_state: dict, game_service):
        """Broadcast game state to all players, with role-appropriate views."""
        if game_id not in self.active_connections:
            return

        game = game_service.games.get(game_id)
        if not game:
            return

        # Create a list of connections to iterate over (avoid modification during iteration)
        connections = list(self.active_connections[game_id])

        for connection in connections:
            if connection not in self.connection_info:
                continue

            _, player_id = self.connection_info[connection]
            player = game.players.get(player_id)
            is_spymaster = player is not None and player.role == Role.SPYMASTER

            # Build fresh state dict for each player to avoid any shared references
            player_state = {
                "id": game_state["id"],
                "state": game_state["state"],
                "players": game_state["players"],
                "currentTeam": game_state.get("currentTeam"),
                "startingTeam": game_state.get("startingTeam"),
                "currentClue": game_state.get("currentClue"),
                "guessesRemaining": game_state.get("guessesRemaining", 0),
                "winner": game_state.get("winner"),
                "redRemaining": game_state.get("redRemaining", 0),
                "blueRemaining": game_state.get("blueRemaining", 0),
                "clueHistory": game_state.get("clueHistory", []),
                "cards": game.get_cards_for_role(is_spymaster),
            }

            try:
                await connection.send_text(json.dumps({
                    "type": "game_state",
                    "payload": player_state
                }))
            except Exception:
                pass

    def get_connection_count(self, game_id: str) -> int:
        """Get the number of connections in a game room."""
        return len(self.active_connections.get(game_id, set()))


manager = ConnectionManager()
