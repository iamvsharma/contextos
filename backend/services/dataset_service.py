import os
import json
import uuid
import pandas as pd
import io
import datetime
from typing import Any, Optional
from services.preprocessor import STEP_FUNCTIONS
from services.storage.minio_client import minio_client
from models.database import get_db

class DatasetService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        self.jobs: dict[str, dict[str, Any]] = {}
        os.makedirs(upload_dir, exist_ok=True)

    async def list_datasets(self) -> list[dict[str, Any]]:
        db = await get_db()
        # Check if there are any default datasets, if not, seed them
        count = await db.datasets.count_documents({})
        if count == 0:
            try:
                await self.seed_default_datasets()
            except Exception as e:
                print(f"Error seeding default datasets: {e}")
                
        cursor = db.datasets.find({})
        datasets = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            datasets.append(doc)
        return datasets

    async def seed_default_datasets(self):
        # 1. Customer Reviews CSV
        csv1 = (
            "review_id,review_text,rating,category\n"
            '1,"This product is absolutely amazing! 😍 I love it so much. #great",5,Electronics\n'
            '2,"Worst purchase ever!!! 😡 Very disappointed with the quality.",1,Clothing\n'
            '3,"Good value for money. The product does what it says.",4,Home\n'
            '4,"Not bad, but could be better. Delivery was late though.",3,Electronics\n'
            '5,"Excellent quality 👍 highly recommended to everyone.",5,Home\n'
        ).encode("utf-8")
        await self._process_and_save_dataset(
            "default-customer-reviews", 
            "Customer_Reviews.csv", 
            csv1, 
            "text/csv", 
            is_default=True,
            description="Customer feedback and ratings dataset for testing Sentiment Analysis and text preprocessing.",
            tags=["sentiment", "feedback", "reviews"],
            category="E-commerce"
        )

        # 2. Twitter Data JSON
        json2 = json.dumps([
            {"tweet_id": 1, "tweet_text": "Loving the new design of TextPrep Pro! 🚀 #nlp #textcleaning", "likes": 42},
            {"tweet_id": 2, "tweet_text": "Why is data cleaning so tedious? Ugh. 😭", "likes": 12},
            {"tweet_id": 3, "tweet_text": "Check out this new NLP preprocessor. Pretty neat. www.textprep.pro", "likes": 25}
        ]).encode("utf-8")
        await self._process_and_save_dataset(
            "default-twitter-data", 
            "Twitter_Data.json", 
            json2, 
            "application/json", 
            is_default=True,
            description="Live Twitter updates containing popular hashtags, emoji usages, and counts of likes.",
            tags=["social media", "tweets", "emojis"],
            category="Social Media"
        )

        # 3. Reddit Comments CSV
        csv3 = (
            "comment_id,comment_text,ups,subreddit\n"
            '1,"I think NLP models really benefit from clean datasets. Just my 2 cents.",15,r/machinelearning\n'
            '2,"This preprocessing tool makes it so easy to remove emojis and links.",8,r/dataengineering\n'
            '3,"Can someone suggest a good lemmatizer for python?",3,r/learnpython\n'
        ).encode("utf-8")
        await self._process_and_save_dataset(
            "default-reddit-comments", 
            "Reddit_Comments.csv", 
            csv3, 
            "text/csv", 
            is_default=True,
            description="Subreddit conversations dataset containing comments, scores, and subreddit designations.",
            tags=["comments", "reddit", "discussion"],
            category="Social Media"
        )

    async def get_dataset(self, file_id: str) -> Optional[dict[str, Any]]:
        db = await get_db()
        doc = await db.datasets.find_one({"file_id": file_id})
        if doc:
            doc["_id"] = str(doc["_id"])
            return doc
        return None

    async def save_upload(self, file) -> dict[str, Any]:
        file_id = str(uuid.uuid4())
        contents = await file.read()
        return await self._process_and_save_dataset(
            file_id, file.filename, contents, file.content_type or "application/octet-stream"
        )

    async def _process_and_save_dataset(
        self, 
        file_id: str, 
        filename: str, 
        contents: bytes, 
        content_type: str, 
        is_default: bool = False,
        description: str = "",
        tags: list[str] = None,
        category: str = ""
    ) -> dict[str, Any]:
        ext = os.path.splitext(filename)[1].lower()
        object_name = f"{file_id}{ext}"
        
        # Upload to MinIO
        minio_client.put_object(
            "datasets",
            object_name,
            io.BytesIO(contents),
            len(contents),
            content_type=content_type
        )
        
        file_url = f"http://localhost:9000/datasets/{object_name}"
        
        # Calculate summary/metadata
        try:
            if ext == ".csv":
                df = pd.read_csv(io.BytesIO(contents))
            elif ext == ".json":
                df = pd.read_json(io.BytesIO(contents))
            else:
                lines = contents.decode("utf-8", errors="ignore").splitlines()
                df = pd.DataFrame(lines, columns=["text"])
        except Exception as e:
            df = pd.DataFrame([{"error": f"Failed to parse file: {str(e)}"}])

        # Generate summary & Column Statistics
        missing_counts = df.isnull().sum().to_dict()
        total_cells = df.size
        total_missing = df.isnull().sum().sum()
        missing_percent = round((total_missing / total_cells * 100), 2) if total_cells > 0 else 0.0
        
        columns = [str(col) for col in df.columns]
        
        columns_metadata = {}
        for col in df.columns:
            col_str = str(col)
            null_cnt = int(df[col].isnull().sum())
            uniq_cnt = int(df[col].nunique())
            dt = str(df[col].dtype)
            
            meta = {
                "data_type": dt,
                "null_count": null_cnt,
                "unique_count": uniq_cnt,
            }
            
            if pd.api.types.is_numeric_dtype(df[col]):
                try:
                    col_clean = df[col].dropna()
                    if not col_clean.empty:
                        meta["min"] = round(float(col_clean.min()), 4)
                        meta["max"] = round(float(col_clean.max()), 4)
                        meta["mean"] = round(float(col_clean.mean()), 4)
                except Exception:
                    pass
            
            columns_metadata[col_str] = meta

        # Prepare head rows for preview
        sample_rows = df.head(10).fillna("").to_dict(orient="records")
        clean_samples = []
        for r in sample_rows:
            clean_row = {}
            for k, v in r.items():
                if pd.isna(v):
                    clean_row[k] = ""
                elif isinstance(v, (int, float)):
                    clean_row[k] = v
                else:
                    clean_row[k] = str(v)
            clean_samples.append(clean_row)

        size_mb = round(len(contents) / (1024 * 1024), 2)
        if size_mb == 0.0:
            size_mb = 0.01  # Minimum display size for default files

        summary = {
            "rows": len(df),
            "columns": columns,
            "columns_metadata": columns_metadata,
            "missing_values_percent": f"{missing_percent}%",
            "missing_values_by_column": {str(k): int(v) for k, v in missing_counts.items()},
            "file_size": f"{size_mb} MB" if size_mb >= 0.01 else "<0.01 MB",
            "encoding": "UTF-8",
            "sample_preview": clean_samples
        }

        dataset_doc = {
            "file_id": file_id,
            "file_name": filename,
            "file_url": file_url,
            "object_name": object_name,
            "summary": summary,
            "status": "uploaded",
            "is_default": is_default,
            "uploaded_by": "System" if is_default else "Karan",
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "description": description,
            "tags": tags or [],
            "category": category,
            "config": {
                "selected_column": columns[0] if columns else "",
                "header_row": True,
                "data_type_detect": True,
                "remove_empty": True,
                "remove_duplicates": False,
                "row_limit": ""
            }
        }
        
        # Insert into MongoDB
        db = await get_db()
        await db.datasets.update_one(
            {"file_id": file_id},
            {"$set": dataset_doc},
            upsert=True
        )
        
        # Fetch updated or inserted doc to ensure _id conversion is clean
        doc = await db.datasets.find_one({"file_id": file_id})
        if doc:
            doc["_id"] = str(doc["_id"])
            return doc
            
        dataset_doc["_id"] = file_id
        return dataset_doc


    async def update_dataset_config(self, file_id: str, config: dict[str, Any]) -> bool:
        db = await get_db()
        result = await db.datasets.update_one(
            {"file_id": file_id},
            {"$set": {
                "config": config,
                "status": "configured"
            }}
        )
        return result.modified_count > 0

    async def update_dataset_metadata(self, file_id: str, description: str, tags: list[str], category: str) -> bool:
        db = await get_db()
        result = await db.datasets.update_one(
            {"file_id": file_id},
            {"$set": {
                "description": description,
                "tags": tags,
                "category": category
            }}
        )
        return result.modified_count > 0

    async def delete_dataset(self, file_id: str) -> bool:
        db = await get_db()
        dataset = await db.datasets.find_one({"file_id": file_id})
        if not dataset:
            return False
        
        # Remove main file from MinIO
        try:
            object_name = dataset.get("object_name")
            if object_name:
                minio_client.remove_object("datasets", object_name)
        except Exception as e:
            print(f"Error removing object from MinIO: {e}")
            
        # Also remove processed file if exists
        processed_file_id = dataset.get("processed_file_id")
        if processed_file_id:
            try:
                processed_dataset = await db.datasets.find_one({"file_id": processed_file_id})
                if processed_dataset:
                    minio_client.remove_object("datasets", processed_dataset["object_name"])
                    await db.datasets.delete_one({"file_id": processed_file_id})
            except Exception as e:
                print(f"Error removing processed object: {e}")

        # Delete from MongoDB
        result = await db.datasets.delete_one({"file_id": file_id})
        return result.deleted_count > 0

    async def process_dataset(
        self, file_id: str, column: str, steps: list[dict[str, Any]]
    ) -> dict[str, Any]:
        job_id = file_id
        self.jobs[job_id] = {"id": job_id, "status": "processing", "progress": 0}

        try:
            db = await get_db()
            dataset = await db.datasets.find_one({"file_id": file_id})
            if not dataset:
                raise ValueError("Dataset not found")
            
            object_name = dataset["object_name"]
            
            response = minio_client.get_object("datasets", object_name)
            contents = response.read()
            
            ext = os.path.splitext(dataset["file_name"])[1].lower()
            if ext == ".csv":
                df = pd.read_csv(io.BytesIO(contents))
            elif ext == ".json":
                df = pd.read_json(io.BytesIO(contents))
            else:
                lines = contents.decode("utf-8", errors="ignore").splitlines()
                df = pd.DataFrame(lines, columns=["text"])

            if column not in df.columns:
                raise ValueError(f"Column '{column}' not found in dataset")

            if dataset.get("config", {}).get("row_limit", ""):
                try:
                    limit = int(dataset["config"]["row_limit"])
                    df = df.head(limit)
                except ValueError:
                    pass

            if dataset.get("config", {}).get("remove_duplicates", False):
                df = df.drop_duplicates(subset=[column])

            total = len(df)
            results = []

            for idx, row in df.iterrows():
                text = str(row[column])
                if dataset.get("config", {}).get("remove_empty", True) and not text.strip():
                    continue

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

                if total > 0 and idx % max(1, total // 20) == 0:
                    self.jobs[job_id]["progress"] = int((idx + 1) / total * 100)

            result_df = pd.DataFrame(results)
            result_csv_bytes = result_df.to_csv(index=False).encode('utf-8')
            
            result_object_name = f"processed_{job_id}.csv"
            minio_client.put_object(
                "datasets",
                result_object_name,
                io.BytesIO(result_csv_bytes),
                len(result_csv_bytes),
                content_type="text/csv"
            )

            result_url = f"http://localhost:9000/datasets/{result_object_name}"
            
            processed_dataset_doc = {
                "file_id": f"processed_{job_id}",
                "file_name": f"processed_{dataset['file_name']}",
                "file_url": result_url,
                "object_name": result_object_name,
                "status": "processed",
                "parent_id": file_id
            }
            await db.datasets.insert_one(processed_dataset_doc)

            await db.datasets.update_one(
                {"file_id": file_id},
                {"$set": {"status": "processed", "processed_file_id": f"processed_{job_id}"}}
            )

            self.jobs[job_id] = {
                "id": job_id,
                "status": "completed",
                "progress": 100,
                "result": results[:50],
                "result_url": result_url
            }

        except Exception as e:
            self.jobs[job_id] = {
                "id": job_id,
                "status": "failed",
                "error": str(e),
                "progress": 0,
            }

        return self.jobs[job_id]

    def get_job(self, job_id: str) -> Optional[dict[str, Any]]:
        return self.jobs.get(job_id)
