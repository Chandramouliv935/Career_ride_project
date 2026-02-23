from resume_builder import router as resume_router
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
from bs4 import BeautifulSoup
from typing import Optional
import re
import string
import joblib
import os

app = FastAPI()
app.include_router(resume_router, prefix="/api")
# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# 1. Load Model
# -----------------------------
print("Loading custom ML models...")
try:
    # Use absolute paths relative to the script file
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "models", "fake_job_model.pkl")
    vectorizer_path = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")
    
    print(f"Loading models from: {model_path}")

    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    model = None
    vectorizer = None

# ----------------------------
# 2. Rule Engine & Cleaning
# ----------------------------
SCAM_KEYWORDS = [
    "registration fee",
    "processing fee",
    "earn money fast",
    "whatsapp only",
    "telegram only",
    "send bank details",
    "investment required"
]

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\d+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text)
    return text

def rule_score(text):
    score = 0
    text_clean = clean_text(text)
    for keyword in SCAM_KEYWORDS:
        if keyword in text_clean:
            score += 1
    return score

class JobRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

def extract_text_from_url(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        # specific scam sites might have invalid SSL, so verify=False is useful here
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer", "header", "iframe"]):
            tag.decompose()

        text = soup.get_text(separator=" ")
        return " ".join(text.split())[:10000], None
    except requests.exceptions.Timeout:
        return None, "Connection timed out. The website is too slow or blocking requests."
    except requests.exceptions.ConnectionError:
        return None, "Website unreachable. invalid URL or the site is offline (common for scam sites)."
    except Exception as e:
        print(f"Extraction error: {e}")
        return None, f"Error accessing website: {str(e)}"

def validate_url(url):
    if "linkedin.com/jobs/search" in url:
        return "invalid_search"
    return "valid"

@app.post("/api/detect")
async def detect_job(request: JobRequest):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Models not loaded on server.")

    content = ""
    if request.url:
        if validate_url(request.url) == "invalid_search":
            raise HTTPException(status_code=400, detail="Please provide a direct job posting link, not a search page.")
        
        print(f"Extracting from URL: {request.url}")
        content, error_msg = extract_text_from_url(request.url)
        if not content:
            raise HTTPException(status_code=400, detail=f"Could not extract content: {error_msg}")
    elif request.text:
        content = request.text
    else:
        raise HTTPException(status_code=400, detail="Either text or url must be provided")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content is empty")
    
    try:
        cleaned_content = clean_text(content)
        tfidf_text = vectorizer.transform([cleaned_content])
        
        # ML Prediction
        probability = float(model.predict_proba(tfidf_text)[0][1])
        
        # Rule Score
        rules = int(rule_score(cleaned_content))
        
        # Final Decision Logic (Combine ML + Rules)
        final_risk = float(probability + (rules * 0.1))
        is_fake = bool(final_risk > 0.5)
        
        return {
            "is_fake": is_fake,
            "confidence": round(probability * 100, 2),
            "risk_score": rules,
            "final_risk": round(final_risk, 4),
            "message": "⚠️ Likely Fake Job" if is_fake else "✅ Likely Legitimate Job"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
