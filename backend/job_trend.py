from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tavily import TavilyClient
from groq import Groq
from typing import Dict
from dotenv import load_dotenv
import json
import os

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

tavily = TavilyClient(api_key=TAVILY_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)


@app.get("/market-intelligence")
def market_intelligence(
    query: str = "Software Engineer",
    location: str = "India"
) -> Dict:

    if not TAVILY_API_KEY or not GROQ_API_KEY:
        return {"error": "API keys not set properly in .env"}

    search_query = f"Trending {query} jobs in {location} with salary and skills demand"
    print(f"DEBUG: Searching Tavily for: {search_query}")

    try:
        tavily_response = tavily.search(
            query=search_query,
            search_depth="basic",
            max_results=5
        )

        results = tavily_response.get("results", [])
        print(f"DEBUG: Tavily found {len(results)} results")

        raw_content = "\n".join(
            result.get("content", "") for result in results
        )

    except Exception as e:
        print(f"Tavily Error: {e}")
        return {"error": "Tavily search failed", "details": str(e)}

    if not raw_content:
        return {"error": "No search content found"}

    print("DEBUG: Sending data to Groq model...")

    prompt = f"""
You are a job market intelligence analyst.

Return ONLY valid JSON in this format:

{{
  "total_jobs_estimate": "",
  "top_trending_roles": [],
  "trending_skills": [],
  "remote_demand_percentage_estimate": 0,
  "salary_range_summary": "",
  "market_growth_indicator": ""
}}

DATA:
{raw_content}
"""

    try:
        llm_response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",   # ✅ Correct working model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        content = llm_response.choices[0].message.content.strip()

        # Remove markdown if model adds it
        if content.startswith("```"):
            content = content.split("```")[1].strip()

        structured_output = json.loads(content)

    except json.JSONDecodeError:
        print("JSON parsing failed. Returning raw LLM output.")
        return {
            "error": "LLM returned invalid JSON",
            "raw_response": content
        }

    except Exception as e:
        print(f"Groq Error: {e}")
        return {"error": "Groq API failed", "details": str(e)}

    return {
        "query": query,
        "location": location,
        "market_analysis": structured_output
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
