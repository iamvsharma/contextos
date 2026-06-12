from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.preprocessor import PreprocessorService
from services.dataset_service import DatasetService
from models.database import get_db, get_pipelines_collection
import os
import uuid

router = APIRouter()
preprocessor = PreprocessorService()
dataset_service = DatasetService(upload_dir="uploads")

# -- Request/Response Models --

class StepConfig(BaseModel):
    type: str
    enabled: bool = True
    config: Optional[dict] = None

class PipelineConfigRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    steps: list[StepConfig]
    language: str = "English"
    outputFormat: str = "Plain Text"
    preserveCase: bool = False
    removeAccents: bool = False
    handleEmojis: bool = True
    normalizeWhitespace: bool = True

class PreprocessRequest(BaseModel):
    text: str
    steps: list[StepConfig]

class PreprocessStepResult(BaseModel):
    step: str
    input: str
    output: str
    tokens: Optional[list[str]] = None

class PreprocessResponse(BaseModel):
    results: list[PreprocessStepResult]

class InsightsRequest(BaseModel):
    text: str
    steps: list[StepConfig]

class InsightsResponse(BaseModel):
    originalTokens: int
    processedTokens: int
    uniqueWords: int
    noiseRemovedPercent: float
    emojiCount: int
    emojiSentiments: dict[str, float]
    sentimentBefore: dict
    sentimentAfter: dict
    topWords: list[dict]

class SocialAnalyzeRequest(BaseModel):
    text: str

class SocialAnalyzeResponse(BaseModel):
    mentionCount: int
    hashtagCount: int
    urlCount: int
    emojiCount: int
    emojiList: list[dict]

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

# -- Routes --

@router.post("/preprocess", response_model=PreprocessResponse)
async def preprocess_text(req: PreprocessRequest):
    try:
        results = preprocessor.process_pipeline(req.text, [s.model_dump() for s in req.steps])
        return PreprocessResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insights", response_model=InsightsResponse)
async def get_insights(req: InsightsRequest):
    try:
        report = preprocessor.generate_insights(req.text, [s.model_dump() for s in req.steps])
        return InsightsResponse(**report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/social/analyze", response_model=SocialAnalyzeResponse)
async def analyze_social(req: SocialAnalyzeRequest):
    try:
        features = preprocessor.analyze_social(req.text)
        return SocialAnalyzeResponse(**features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@router.post("/dataset/config/{file_id}")
async def update_dataset_config(file_id: str, req: DatasetConfigRequest):
    try:
        success = await dataset_service.update_dataset_config(file_id, req.model_dump())
        if not success:
            raise HTTPException(status_code=404, detail="Dataset not found or config unchanged")
        return {"status": "success", "file_id": file_id}
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

@router.get("/pipeline")
async def get_pipeline():
    try:
        coll = await get_pipelines_collection()
        doc = await coll.find_one({"id": "active-pipeline"})
        if not doc:
            return {
                "name": "My Awesome Pipeline",
                "description": "A pipeline for clean and normalized text ready for NLP tasks.",
                "steps": [
                    {"type": "lowercase", "enabled": True},
                    {"type": "remove_urls", "enabled": True},
                    {"type": "handle_emojis", "enabled": True},
                    {"type": "remove_punctuation", "enabled": True},
                    {"type": "tokenize", "enabled": True}
                ],
                "language": "English",
                "outputFormat": "Plain Text",
                "preserveCase": False,
                "removeAccents": False,
                "handleEmojis": True,
                "normalizeWhitespace": True
            }
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pipeline")
async def save_pipeline(req: PipelineConfigRequest):
    try:
        coll = await get_pipelines_collection()
        data = req.model_dump()
        data["id"] = "active-pipeline"
        await coll.update_one({"id": "active-pipeline"}, {"$set": data}, upsert=True)
        return {"status": "success", "message": "Pipeline saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
