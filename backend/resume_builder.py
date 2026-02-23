from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import ListFlowable, ListItem
from reportlab.platypus import Preformatted
from reportlab.platypus import Spacer
import os
import json

router = APIRouter()

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/optimize-resume")
async def optimize_resume(request: ResumeRequest):

    if groq_client is None:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    prompt = f"""
You are an expert ATS resume optimizer. 
Return ONLY a JSON object with this structure:
{{
  "optimized_resume": "Rewrite the resume fully. Use \\n for newlines within the string. Escape all double quotes.",
  "matched_skills": ["List", "of", "skills"],
  "missing_skills": ["List", "of", "missing"],
  "ats_score_estimate": 85,
  "skill_gap_roadmap": ["Step 1", "Step 2", "Step 3", "Step 4"]
}}

RESUME:
{request.resume_text}

JOB DESCRIPTION:
{request.job_description}
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # Lower temperature for more consistent JSON
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()
        data = json.loads(content)

        # 🔥 Generate PDF
        pdf_path = "optimized_resume.pdf"
        # Ensure we delete old one if exists to avoid permission issues
        if os.path.exists(pdf_path):
            try: os.remove(pdf_path)
            except: pass

        doc = SimpleDocTemplate(pdf_path)
        elements = []

        styles = getSampleStyleSheet()
        # Custom style for the resume content to handle newlines
        resume_style = ParagraphStyle(
            'ResumeStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            spaceAfter=10,
            whiteSpace='pre-wrap'
        )

        elements.append(Paragraph("Optimized Resume", styles["Heading1"]))
        elements.append(Spacer(1, 0.3 * inch))

        # Split by newline and add as paragraphs to handle the text better than Preformatted
        resume_text = data.get("optimized_resume", "")
        for line in resume_text.split('\n'):
            if line.strip():
                elements.append(Paragraph(line, resume_style))
            else:
                elements.append(Spacer(1, 0.1 * inch))

        doc.build(elements)

        return {
            "optimized_resume": data.get("optimized_resume", ""),
            "matched_skills": data.get("matched_skills", []),
            "missing_skills": data.get("missing_skills", []),
            "ats_score_estimate": data.get("ats_score_estimate", 0),
            "skill_gap_roadmap": data.get("skill_gap_roadmap", []),
            "pdf_download_url": "/api/download-resume"
        }

    except json.JSONDecodeError as je:
        print(f"JSON Decode Error: {je}")
        print(f"Content that failed: {content}")
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(je)}")
    except Exception as e:
        print(f"General Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download-resume")
async def download_resume():
    from fastapi.responses import FileResponse
    return FileResponse("optimized_resume.pdf", media_type="application/pdf", filename="optimized_resume.pdf")
