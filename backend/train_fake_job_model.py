import pandas as pd
import re
import string
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from imblearn.over_sampling import SMOTE
import joblib
import os

# ----------------------------
# 1. Load Dataset
# ----------------------------
dataset_path = "fake_job_postings.csv"
if not os.path.exists(dataset_path):
    # Try one level up if run from backend folder
    dataset_path = os.path.join("..", "fake_job_postings.csv")

print(f"Loading dataset from: {dataset_path}")
df = pd.read_csv(dataset_path)

# Combine important columns
df["text"] = (
    df["title"].fillna("") + " " +
    df["company_profile"].fillna("") + " " +
    df["description"].fillna("") + " " +
    df["requirements"].fillna("")
)

# ----------------------------
# 2. Clean Text
# ----------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\d+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text)
    return text

print("Cleaning text...")
df["text"] = df["text"].apply(clean_text)

# ----------------------------
# 3. Train Test Split
# ----------------------------
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    df["text"],
    df["fraudulent"],
    test_size=0.2,
    random_state=42
)

# ----------------------------
# 4. TF-IDF
# ----------------------------
print("Vectorizing...")
vectorizer = TfidfVectorizer(
    max_features=10000,
    stop_words="english"
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# ----------------------------
# 5. Handle Imbalance
# ----------------------------
print("Handling imbalance with SMOTE...")
smote = SMOTE()
X_train_bal, y_train_bal = smote.fit_resample(X_train_tfidf, y_train)

# ----------------------------
# 6. Train Model
# ----------------------------
print("Training Logistic Regression model...")
model = LogisticRegression(max_iter=1000, class_weight="balanced")
model.fit(X_train_bal, y_train_bal)

# ----------------------------
# 7. Evaluate
# ----------------------------
y_pred = model.predict(X_test_tfidf)
print("\nModel Evaluation:")
print(classification_report(y_test, y_pred))

# ----------------------------
# 8. Save Model
# ----------------------------
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/fake_job_model.pkl")
joblib.dump(vectorizer, "models/tfidf_vectorizer.pkl")

print("\nModel saved successfully in 'backend/models/'.")
