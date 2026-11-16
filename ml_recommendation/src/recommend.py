
from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "college_model.pkl"

# Load the saved preprocessing model and college data
saved_data = joblib.load(MODEL_PATH)

preprocessor = saved_data["preprocessor"]
college_features = saved_data["college_features"]
colleges = saved_data["colleges"]


def recommend_colleges(
    branch,
    state=None,
    college_type=None,
    budget=None,
    top_n=10
):
    results = colleges.copy()

    # 1. Filter colleges by budget
    if budget is not None:
        results = results[
            results["annual_fees"].notna()
            & (results["annual_fees"] <= budget)
        ]

    if results.empty:
        return []

    # 2. Create a student preference profile
    student = pd.DataFrame([{
        "courses": str(branch),
        "facilities": "",
        "state": state if state else "",
        "college_type": college_type if college_type else "",
        "accreditation": "",
        "annual_fees": None,
        "nirf_rank": None,
        "placement_average": None,
        "placement_highest": None
    }])

    # 3. Convert student preferences into model features
    student_features = preprocessor.transform(student)

    # 4. Calculate similarity against colleges
    similarities = cosine_similarity(
        student_features,
        college_features
    )[0]

    # 5. Keep only colleges that passed the budget filter
    results["match_score"] = similarities
    results = results.loc[results.index.isin(results.index)]

    # Sort by similarity score
    results = results.sort_values(
        by="match_score",
        ascending=False
    ).head(top_n)

    # 6. Return recommendation details
    recommendations = []

    for _, college in results.iterrows():
        recommendations.append({
            "college_id": college["college_id"],
            "college_name": college["college_name"],
            "state": college["state"],
            "city": college["city"],
            "courses": college["courses"],
            "annual_fees": college["annual_fees"],
            "placement_average": college["placement_average"],
            "match_score": round(
                float(college["match_score"]) * 100, 2
            )
        })

    return recommendations


# Test the recommendation system
if __name__ == "__main__":
    recommendations = recommend_colleges(
        branch="Computer Science",
        state="Andhra Pradesh",
        college_type="Private",
        budget=200000,
        top_n=10
    )

    for college in recommendations:
        print(college)
