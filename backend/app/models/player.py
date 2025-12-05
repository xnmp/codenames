from enum import Enum
from typing import Optional
from pydantic import BaseModel


class Role(str, Enum):
    SPYMASTER = "spymaster"
    OPERATIVE = "operative"


class Team(str, Enum):
    RED = "red"
    BLUE = "blue"


class Player(BaseModel):
    id: str
    name: str
    team: Optional[Team] = None
    role: Optional[Role] = None
