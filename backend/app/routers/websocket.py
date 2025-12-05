import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from ..websocket_manager import manager
from ..services.game_service import game_service
from ..models import Team, Role

router = APIRouter()


@router.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    """WebSocket endpoint for game communication."""
    player_id = str(uuid.uuid4())

    # Check if game exists
    game = game_service.get_game(game_id)
    if not game:
        await websocket.close(code=4004, reason="Game not found")
        return

    await manager.connect(websocket, game_id, player_id)

    try:
        # Send initial player ID
        await manager.send_personal_message({
            "type": "connected",
            "payload": {"playerId": player_id}
        }, websocket)

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            payload = message.get("payload", {})

            if msg_type == "join_game":
                player_name = payload.get("player_name", "Anonymous")
                player = game_service.add_player(game_id, player_id, player_name)

                if player:
                    # Broadcast updated game state to all players
                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)

                    await manager.broadcast_to_game(game_id, {
                        "type": "player_joined",
                        "payload": {"player": player.model_dump()}
                    }, exclude=websocket)

            elif msg_type == "assign_role":
                team = Team(payload.get("team"))
                role = Role(payload.get("role"))

                success = game_service.assign_role(game_id, player_id, team, role)

                if success:
                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)
                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": "Could not assign role. It may already be taken."}
                    }, websocket)

            elif msg_type == "start_game":
                success = game_service.start_game(game_id)

                if success:
                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)

                    await manager.broadcast_to_game(game_id, {
                        "type": "game_started",
                        "payload": {}
                    })
                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": "Cannot start game. Need at least one spymaster per team."}
                    }, websocket)

            elif msg_type == "give_clue":
                word = payload.get("word", "").strip()
                number = int(payload.get("number", 0))

                if not word or number < 0:
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": "Invalid clue format"}
                    }, websocket)
                    continue

                success = game_service.give_clue(game_id, player_id, word, number)

                if success:
                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)

                    await manager.broadcast_to_game(game_id, {
                        "type": "clue_given",
                        "payload": {
                            "word": word.upper(),
                            "number": number
                        }
                    })
                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": "Cannot give clue. Not your turn or already gave a clue."}
                    }, websocket)

            elif msg_type == "reveal_card":
                position = int(payload.get("position", -1))
                result = game_service.reveal_card(game_id, player_id, position)

                if result["success"]:
                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)

                    await manager.broadcast_to_game(game_id, {
                        "type": "card_revealed",
                        "payload": {
                            "position": position,
                            "card": result["card"]
                        }
                    })

                    if result["game_over"]:
                        await manager.broadcast_to_game(game_id, {
                            "type": "game_over",
                            "payload": {
                                "winner": result["winner"],
                                "reason": result["reason"]
                            }
                        })
                    elif result["turn_ended"]:
                        await manager.broadcast_to_game(game_id, {
                            "type": "turn_ended",
                            "payload": {}
                        })
                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": result.get("error", "Cannot reveal card")}
                    }, websocket)

            elif msg_type == "end_turn":
                success = game_service.end_turn(game_id, player_id)

                if success:
                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)

                    await manager.broadcast_to_game(game_id, {
                        "type": "turn_ended",
                        "payload": {}
                    })
                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "payload": {"message": "Cannot end turn"}
                    }, websocket)

            elif msg_type == "reset_game":
                # Reset to lobby state with same players
                game = game_service.get_game(game_id)
                if game:
                    # Create new game with same ID
                    game_service.delete_game(game_id)
                    new_game = game_service.create_game()
                    # Reassign game ID (hacky but works for prototype)
                    game_service.games[game_id] = new_game
                    game_service.games[game_id].id = game_id
                    del game_service.games[new_game.id]

                    await manager.broadcast_to_game(game_id, {
                        "type": "game_reset",
                        "payload": {}
                    })

                    game_state = game_service.get_game_state(game_id)
                    await manager.broadcast_game_state(game_id, game_state, game_service)

    except WebSocketDisconnect:
        info = manager.disconnect(websocket)
        if info:
            game_id, player_id = info
            game_service.remove_player(game_id, player_id)

            # Notify other players
            game_state = game_service.get_game_state(game_id)
            if game_state:
                await manager.broadcast_game_state(game_id, game_state, game_service)
                await manager.broadcast_to_game(game_id, {
                    "type": "player_left",
                    "payload": {"playerId": player_id}
                })

            # Clean up empty games
            if manager.get_connection_count(game_id) == 0:
                game_service.delete_game(game_id)
