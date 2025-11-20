from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException, UploadFile, File, Form, Depends, Request
from supabase import Client
from fastapi import APIRouter
from core.config import supabase_clt
from typing import List, Optional

router = APIRouter()


def get_supabase() -> Client:
    return supabase_clt


@router.get("/", response_model=List[dict])
async def get_all_games(
    limit: Optional[int] = 100,
    offset: Optional[int] = 0
):
    """
    Get all created games with pagination
    """
    try:
        # Get games from database with pagination
        response = (supabase_clt.table("games")
                    .select("*")
                    .order("created_at", desc=True)
                    .range(offset, offset + limit - 1)
                    .execute())

        if hasattr(response, 'error') and response.error:
            raise HTTPException(
                status_code=500,
                detail="Napaka pri pridobivanju iger iz podatkovne baze."
            )

        games = response.data

        # Get public URLs for all images
        storage_client = supabase_clt.storage.from_("game-images")

        for game in games:
            if game.get("path"):
                public_url = storage_client.get_public_url(game["path"])
                game["image_url"] = public_url

        return games

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{game_id}")
async def get_game_by_id(game_id: str):
    """
    Get a specific game by ID
    """
    try:
        response = (supabase_clt.table("games")
                    .select("*")
                    .eq("id", game_id)
                    .execute())

        if hasattr(response, 'error') and response.error:
            raise HTTPException(
                status_code=500,
                detail="Napaka pri pridobivanju igre iz podatkovne baze."
            )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Igra ni bila najdena."
            )

        game = response.data[0]

        # Get public URL for the image
        if game.get("path"):
            storage_client = supabase_clt.storage.from_("game-images")
            public_url = storage_client.get_public_url(game["path"])
            game["image_url"] = public_url

        # Try to fetch the creator's email (if available) and include it
        try:
            user_id = game.get("user_id")
            if user_id is not None:
                user_resp = supabase_clt.table("users").select(
                    "email").eq("id", user_id).limit(1).execute()
                if getattr(user_resp, "data", None):
                    user_row = user_resp.data[0]
                    if user_row and user_row.get("email"):
                        game["user_email"] = user_row.get("email")
        except Exception:
            # Don't fail the whole request if fetching user info fails
            pass

        return game

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

# Your existing create_game endpoint remains the same


@router.post("/", status_code=201)
async def create_game(
    request: Request,
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    title: str = Form(...),
    user_id: str = Form(...),
):
    try:
        # Validate file extension
        if not image.filename or "." not in image.filename:
            raise HTTPException(
                status_code=400,
                detail="Nepodprta oblika datoteke. Prosimo naložite slikovno datoteko."
            )

        file_extension = image.filename.split(".")[-1].lower()
        allowed_extensions = {"jpg", "jpeg", "png", "gif", "webp", "bmp"}

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Nepodprta oblika datoteke. Dovoljene oblike: {', '.join(allowed_extensions)}"
            )

        # Generate unique filename
        file_name = f"{uuid4()}.{file_extension}"
        storage_path = f"games/{file_name}"

        # Read file bytes
        file_bytes = await image.read()
        if not file_bytes:
            raise HTTPException(
                status_code=400, detail="Prejeta slika je prazna. Poskusite znova."
            )

        # Upload to Supabase storage
        storage_client = supabase_clt.storage.from_("game-images")

        upload_response = storage_client.upload(
            path=storage_path,
            file=file_bytes,
            file_options={
                "content-type": image.content_type or "image/jpeg",
                "upsert": False,
            },
        )

        if hasattr(upload_response, 'error') and upload_response.error:
            message = getattr(upload_response.error, "message",
                              str(upload_response.error))
            raise HTTPException(
                status_code=500,
                detail=f"Napaka pri nalaganju slike: {message}",
            )

        # Get public URL
        public_url_response = storage_client.get_public_url(storage_path)
        image_url = public_url_response

        # Prepare game data for database
        now = datetime.utcnow().isoformat()
        game_payload = {
            "user_id": user_id,
            "title": title,
            "lat": latitude,
            "lon": longitude,
            "path": storage_path,
            "created_at": now,
        }

        # Insert into database
        insert_response = supabase_clt.table(
            "games").insert(game_payload).execute()

        if hasattr(insert_response, 'error') and insert_response.error:
            raise HTTPException(
                status_code=500,
                detail="Vstavljanje igre v podatkovno bazo ni uspelo.",
            )

        # Return the created game data
        return {
            "status": "success",
            "game": {
                **insert_response.data[0],
                "image_url": image_url
            }
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance between two lat/lon points in meters using Haversine formula."""
    from math import radians, sin, cos, sqrt, atan2

    R = 6371000.0  # Earth radius in meters
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)

    a = sin(dphi / 2.0) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2.0) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


class CheckLocationRequest(BaseModel):
    latitude: float
    longitude: float


@router.post("/{game_id}/check")
async def check_game_location(game_id: str, payload: CheckLocationRequest):
    """Check how close provided coordinates are to the stored game location.

    Returns distance in meters.
    """
    try:
        # Fetch game
        response = (supabase_clt.table("games").select(
            "*").eq("id", game_id).execute())
        if hasattr(response, "error") and response.error:
            raise HTTPException(
                status_code=500, detail="Napaka pri pridobivanju igre iz podatkovne baze.")

        if not response.data:
            raise HTTPException(
                status_code=404, detail="Igra ni bila najdena.")

        game = response.data[0]

        # Expect fields named lat and lon (or latitude/longitude fallback)
        try:
            game_lat = float(game.get("lat") if game.get(
                "lat") is not None else game.get("latitude"))
            game_lon = float(game.get("lon") if game.get(
                "lon") is not None else game.get("longitude"))
        except Exception:
            raise HTTPException(
                status_code=400, detail="Igra nima veljavnih koordinat.")

        distance_m = haversine_distance(game_lat, game_lon, float(
            payload.latitude), float(payload.longitude))

        return {"distance_meters": distance_m, "game_lat": game_lat, "game_lon": game_lon}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
