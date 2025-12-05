from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.game_service import game_service

router = APIRouter(prefix="/api/games", tags=["games"])


class CreateGameResponse(BaseModel):
    game_id: str


class JoinGameRequest(BaseModel):
    player_name: str


@router.post("", response_model=CreateGameResponse)
async def create_game():
    """Create a new game."""
    game = game_service.create_game()
    return CreateGameResponse(game_id=game.id)


@router.get("/{game_id}")
async def get_game(game_id: str):
    """Get game state."""
    game_state = game_service.get_game_state(game_id)
    if not game_state:
        raise HTTPException(status_code=404, detail="Game not found")
    return game_state


@router.get("/{game_id}/exists")
async def check_game_exists(game_id: str):
    """Check if a game exists."""
    game = game_service.get_game(game_id)
    return {"exists": game is not None}
