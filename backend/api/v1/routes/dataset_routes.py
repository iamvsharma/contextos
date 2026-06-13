from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from services.dataset_service import DatasetService
from models.database import get_db

router = APIRouter()
dataset_service = DatasetService(upload_dir="uploads")

class StepConfig(BaseModel):
    type: str
    enabled: bool = True
    config: Optional[dict] = None

class DatasetConfigRequest(BaseModel):
    selected_column: str
    header_row: bool
    data_type_detect: bool
    remove_empty: bool
    remove_duplicates: bool
    row_limit: Optional[str] = ""

class DatasetProcessRequest(BaseModel):
    file_id: str
    column: str
    steps: list[StepConfig]

@router.get("/dataset/list")
async def list_datasets():
    try:
        return await dataset_service.list_datasets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".csv", ".json"):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported")
    try:
        dataset = await dataset_service.save_upload(file)
        return dataset
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DatasetMetadataRequest(BaseModel):
    description: Optional[str] = ""
    tags: list[str] = []
    category: Optional[str] = ""

@router.post("/dataset/config/{file_id}")
async def update_dataset_config(file_id: str, req: DatasetConfigRequest):
    try:
        success = await dataset_service.update_dataset_config(file_id, req.model_dump())
        if not success:
            raise HTTPException(status_code=404, detail="Dataset not found or config unchanged")
        return {"status": "success", "file_id": file_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dataset/metadata/{file_id}")
async def update_dataset_metadata(file_id: str, req: DatasetMetadataRequest):
    try:
        success = await dataset_service.update_dataset_metadata(file_id, req.description, req.tags, req.category)
        if not success:
            # Upsert fallback if no modification (e.g. if the doc exists but values are identical)
            return {"status": "success", "file_id": file_id, "modified": False}
        return {"status": "success", "file_id": file_id, "modified": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dataset/process")
async def process_dataset(req: DatasetProcessRequest):
    try:
        job = await dataset_service.process_dataset(req.file_id, req.column, [s.model_dump() for s in req.steps])
        return {"jobId": job["id"], "status": job["status"], "result": job.get("result", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dataset/status/{job_id}")
async def dataset_status(job_id: str):
    job = dataset_service.get_job(job_id)
    if not job:
        # Fallback to check database status
        doc = await dataset_service.get_dataset(job_id)
        if doc:
            return {"id": job_id, "status": doc.get("status", "unknown")}
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/dataset/download/{file_id}")
async def download_dataset(file_id: str):
    try:
        from fastapi.responses import StreamingResponse
        from services.storage.minio_client import minio_client
        
        db = await get_db()
        dataset = await db.datasets.find_one({"file_id": file_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        object_name = dataset["object_name"]
        
        # Get object from MinIO
        response = minio_client.get_object("datasets", object_name)
        
        # Stream the object back to client
        def iter_file():
            yield from response.stream(32 * 1024)
            
        return StreamingResponse(
            iter_file(),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={dataset['file_name']}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/dataset/{file_id}")
async def delete_dataset(file_id: str):
    try:
        success = await dataset_service.delete_dataset(file_id)
        if not success:
            raise HTTPException(status_code=404, detail="Dataset not found")
        return {"status": "success", "message": "Dataset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
