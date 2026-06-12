from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.dataset.upload_service import upload_service

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile):
    return await upload_service.upload(file)