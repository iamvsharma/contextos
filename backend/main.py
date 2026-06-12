from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="NLP Preprocessor API",
    description="Production-grade NLP text preprocessing API with pipeline, dataset, social media, and insights endpoints.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "service": "NLP Preprocessor API",
        "version": "1.0.0",
        "endpoints": {
            "preprocess": "/api/preprocess",
            "insights": "/api/insights",
            "social_analyze": "/api/social/analyze",
            "dataset_upload": "/api/dataset/upload",
            "dataset_process": "/api/dataset/process",
            "dataset_status": "/api/dataset/status/{job_id}",
            "dataset_download": "/api/dataset/download/{job_id}",
        },
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
