from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException, UploadFile, File, Form, Depends, Request
from supabase import Client
from fastapi import APIRouter
from core.config import supabase_clt

router = APIRouter()


def get_supabase() -> Client:
    return supabase_clt


async def get_current_user(request: Request, supabase: Client = Depends(get_supabase)):
    try:
        # Get the session from cookies
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )

        # Set the session for Supabase client
        supabase.auth.set_session(access_token, refresh_token)

        # Get the current user from Supabase auth
        user_response = supabase.auth.get_user()

        if user_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )

        return user_response.user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


@router.post("/", status_code=201)
async def create_game(
    request: Request,
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    current_user=Depends(get_current_user),  # Now using the actual dependency
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

        # Set session for storage operations
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")
        if access_token:
            supabase_clt.auth.set_session(access_token, refresh_token)

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
            "user_id": current_user.id,  # Use the actual user ID from auth
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
