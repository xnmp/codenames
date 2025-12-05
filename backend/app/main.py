from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import game_router, websocket_router

app = FastAPI(
    title="Codenames API",
    description="Backend API for the Codenames multiplayer game",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game_router)
app.include_router(websocket_router)


@app.get("/")
async def root():
    return {"message": "Codenames API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
