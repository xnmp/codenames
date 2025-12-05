# Codenames

A multiplayer Codenames game built with React, FastAPI, and WebSockets.

## Features

- Real-time multiplayer gameplay using WebSockets
- Two teams (Red and Blue) with Spymasters and Operatives
- Classic Codenames rules: 25-word grid, clue giving, and word guessing
- Responsive design with TailwindCSS

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, React Router
- **Backend**: FastAPI, Python 3.11+, WebSockets, Pydantic
- **Real-time**: WebSocket protocol for bidirectional communication

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000` and will proxy API/WebSocket requests to the backend.

## How to Play

1. **Create a Game**: Click "Create New Game" on the home page
2. **Share the Code**: Share the 6-letter game code with your friends
3. **Join Teams**: Each player joins a team (Red or Blue) and selects a role:
   - **Spymaster**: Gives one-word clues to help teammates guess words
   - **Operative**: Guesses words based on the Spymaster's clues
4. **Start the Game**: Once each team has at least one Spymaster, start the game
5. **Gameplay**:
   - Spymasters see the key (which words belong to which team)
   - On your turn, the Spymaster gives a one-word clue and a number
   - Operatives guess words that match the clue
   - Correct guesses let you continue; wrong guesses end your turn
   - Avoid the Assassin card (instant loss!)
6. **Win**: First team to reveal all their words wins!

## Project Structure

```
codenames/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── websocket_manager.py # WebSocket handling
│   │   ├── models/              # Pydantic models
│   │   ├── services/            # Game logic
│   │   ├── routers/             # API routes
│   │   └── utils/               # Word lists
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # Game context
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # WebSocket service
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Constants
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## API Endpoints

### REST
- `POST /api/games` - Create a new game
- `GET /api/games/{game_id}` - Get game state
- `GET /api/games/{game_id}/exists` - Check if game exists

### WebSocket
- `WS /ws/{game_id}` - Connect to game room

## License

MIT
