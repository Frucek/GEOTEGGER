from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from api import game
from api import auth, game

app = FastAPI(title="Geotagger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(game.router, prefix="/games", tags=["Games"])


@app.get("/")
def root():
    return {"message": "Welcome to Geotagger API"}
