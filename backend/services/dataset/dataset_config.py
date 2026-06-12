def update_config(dataset_id, config):
    db.datasets.update_one(
        {"file_id": dataset_id},
        {"$set": {
            "config": config,
            "status": "configured"
        }}
    )