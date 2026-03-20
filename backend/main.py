from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import data

app = FastAPI(title="Econo Engine API", description="Econometric analysis platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data.router)

@app.get("/")
def read_root():
    return {"message": "Econo Engine API is running"}
