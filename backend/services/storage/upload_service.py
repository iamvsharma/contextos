from .minio_client import minio_client
import uuid, io

async def upload(file):
    file_id = str(uuid.uuid4())
    object_name = f"{file_id}_{file.filename}"

    contents = await file.read()

    minio_client.put_object(
        "datasets",
        object_name,
        io.BytesIO(contents),
        len(contents),
        content_type=file.content_type
    )

    file_url = f"http://localhost:9000/datasets/{object_name}"

    return {
        "file_id": file_id,
        "file_url": file_url,
        "file_name": file.filename,
        "raw_bytes": contents  # pass forward (important)
    }