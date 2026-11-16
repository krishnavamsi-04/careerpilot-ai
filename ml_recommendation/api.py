
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from src.recommend import recommend_colleges

app = FastAPI(
    title="CareerPilot College Recommendation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentPreferences(BaseModel):
    branch: str
    state: Optional[str] = None
    college_type: Optional[str] = None
    budget: Optional[float] = None
    top_n: int = Field(default=10, ge=1, le=50)


@app.get("/")
def home():
    return {
        "message": "CareerPilot College Recommendation API is running"
    }


@app.post("/recommend")
def get_recommendations(preferences: StudentPreferences):
    try:
        recommendations = recommend_colleges(
            branch=preferences.branch,
            state=preferences.state,
            college_type=preferences.college_type,
            budget=preferences.budget,
            top_n=preferences.top_n
        )

        return {
            "success": True,
            "total": len(recommendations),
            "recommendations": recommendations
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
