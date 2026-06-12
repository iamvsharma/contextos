from app.db.mongo import db
from .dataset_summary import generate_summary

def create_dataset(upload_data):
    summary = generate_summary(upload_data["raw_bytes"])

    dataset_doc = {
        "file_id": upload_data["file_id"],
        "file_name": upload_data["file_name"],
        "file_url": upload_data["file_url"],
        "summary": summary,
        "status": "uploaded"
    }

    db.datasets.insert_one(dataset_doc)

    return dataset_doc