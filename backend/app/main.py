from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api.routes import router

app = FastAPI(
    title="Federal Reserve & Economic Indicator Tracker API",
    description="API for fetching economic indicators from FRED and other sources",
    version="1.0.0"
)

# this part is configuring CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development reasons - restriction in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Economic Indicator Tracker API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)