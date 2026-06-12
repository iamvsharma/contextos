from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "nlp_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
)

celery_app.conf.update(
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(bind=True, max_retries=3)
def process_dataset_task(self, job_id: str, filepath: str, column: str, steps: list[dict]):
    from services.dataset_service import DatasetService
    from services.preprocessor import STEP_FUNCTIONS
    import pandas as pd
    import os

    try:
        if filepath.endswith(".csv"):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_json(filepath)

        total = len(df)
        results = []

        for idx, row in df.iterrows():
            text = str(row[column])
            current = text
            for step in steps:
                if not step.get("enabled", True):
                    continue
                func = STEP_FUNCTIONS.get(step.get("type", ""))
                if func:
                    if step["type"] == "tokenize":
                        current, _ = func(current)
                    else:
                        current = func(current)

            row_dict = row.to_dict()
            row_dict[f"{column}_processed"] = current
            results.append(row_dict)
            self.update_state(state="PROGRESS", meta={"current": idx + 1, "total": total})

        result_path = os.path.join(os.path.dirname(filepath), f"{job_id}_result.csv")
        pd.DataFrame(results).to_csv(result_path, index=False)

        return {"status": "completed", "result_path": result_path, "total": total}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
