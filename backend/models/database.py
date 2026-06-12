from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/nlp-preprocessor")

client: AsyncIOMotorClient | None = None
db = None


async def connect_db():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client.get_database()
    return db


async def close_db():
    global client
    if client:
        client.close()
        client = None


async def get_db():
    if db is None:
        return await connect_db()
    return db


# Collections
async def get_pipelines_collection():
    database = await get_db()
    return database.pipelines


async def get_jobs_collection():
    database = await get_db()
    return database.jobs


async def get_history_collection():
    database = await get_db()
    return database.history
