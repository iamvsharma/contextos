from fastapi import APIRouter
from api.v1.routes.health import router as health_router
from api.v1.routes.pipeline_routes import router as pipeline_router
from api.v1.routes.dataset_routes import router as dataset_router

router = APIRouter()

router.include_router(health_router, tags=["Health"])
router.include_router(pipeline_router, tags=["Pipeline"])
router.include_router(dataset_router, tags=["Dataset"])
