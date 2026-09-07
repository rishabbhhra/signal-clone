import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.config import settings
from app.models import User
from app.auth import get_current_user

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    # Determine extension and unique filename
    ext = Path(file.filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    target_path = settings.UPLOAD_DIR / unique_name

    # Save file
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    file_size = target_path.stat().st_size

    # Check if image
    is_image = ext in [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]
    is_audio = ext in [".mp3", ".wav", ".ogg", ".webm", ".m4a"]

    message_type = "image" if is_image else ("voice" if is_audio else "file")

    return {
        "file_url": f"/uploads/{unique_name}",
        "file_name": file.filename,
        "file_size": file_size,
        "message_type": message_type,
    }
