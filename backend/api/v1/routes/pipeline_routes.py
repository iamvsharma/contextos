from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from services.preprocessor import PreprocessorService
from models.database import get_pipelines_collection

router = APIRouter()
preprocessor = PreprocessorService()

class StepConfig(BaseModel):
    type: str
    enabled: bool = True
    config: Optional[dict] = None

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
