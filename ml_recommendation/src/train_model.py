
import pandas as pd
import joblib

from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline


# 1. Define project paths
BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = BASE_DIR / "dataset" / "colleges.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "college_model.pkl"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# 2. Load dataset
print("Loading college dataset...")

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}"
    )

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Total colleges:", len(df))


# 3. Validate required columns
required_columns = [
    "college_id",
    "college_name",
    "state",
    "city",
    "college_type",
    "courses",
    "annual_fees",
    "nirf_rank",
    "placement_average",
    "placement_highest",
    "accreditation",
    "facilities"
]

missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing columns: {missing_columns}"
    )

if df.empty:
    raise ValueError("Dataset is empty!")

if df["college_id"].duplicated().any():
    raise ValueError("Duplicate college IDs found!")


# 4. Clean text columns
text_columns = [
    "courses",
    "facilities"
]

categorical_columns = [
    "state",
    "college_type",
    "accreditation"
]

numeric_columns = [
    "annual_fees",
    "nirf_rank",
    "placement_average",
    "placement_highest"
]

for col in text_columns + categorical_columns:
    df[col] = (
        df[col]
        .fillna("")
        .astype(str)
        .str.strip()
    )

for col in numeric_columns:
    df[col] = pd.to_numeric(
        df[col], errors="coerce"
    )

if df[numeric_columns].isna().all().any():
    raise ValueError(
        "At least one numeric column contains no valid values."
    )

print("Data cleaning completed!")


# 5. Create preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        (
            "courses",
            TfidfVectorizer(),
            "courses"
        ),
        (
            "facilities",
            TfidfVectorizer(),
            "facilities"
        ),
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_columns
        ),
        (
            "numeric",
            Pipeline([
                (
                    "imputer",
                    SimpleImputer(strategy="median")
                ),
                (
                    "scaler",
                    StandardScaler()
                )
            ]),
            numeric_columns
        )
    ]
)


# 6. Convert college data into numerical features
print("Processing college features...")

college_features = preprocessor.fit_transform(df)

print("Feature processing completed!")


# 7. Save the model and dataset
model_data = {
    "preprocessor": preprocessor,
    "college_features": college_features,
    "colleges": df
}

joblib.dump(model_data, MODEL_PATH)

print("--------------------------------")
print("MODEL TRAINING COMPLETED!")
print("Total colleges:", len(df))
print("Feature count:", college_features.shape[1])
print("Saved model:", MODEL_PATH)
print("--------------------------------")
