import datetime
import random
import uvicorn
import io
import PyPDF2
from docx import Document
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

# ==========================================
# APP INITIALIZATION & CORS SETUP
# ==========================================
app = FastAPI(title="Academic Integrity Risk Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://academic-integrity-api.vercel.app", # Specific Vercel URL
    ],
    allow_origin_regex=r"https://.*\.vercel\.app", # All Vercel preview environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================
class AnalyzeRequest(BaseModel):
    student_id: str
    essay_text: str
    grade: float
    submitted_at: str
    deadline: str
    assignment_id: str

class AnalyzeResponse(BaseModel):
    risk_score: float
    confidence: str
    shap_breakdown: Dict[str, float]
    natural_language_reason: str
    top_signals: List[str]
    flagged: bool

class StudentSummary(BaseModel):
    student_id: str
    name: str
    assignment: str
    risk_score: float
    confidence: str
    flagged: bool

class SubmissionHistory(BaseModel):
    assignment_id: str
    submitted_at: str
    risk_score: float
    flagged: bool
    shap_breakdown: Optional[Dict[str, float]] = None

class StudentDetail(BaseModel):
    student_id: str
    name: str
    submissions: List[SubmissionHistory]
    latest_shap_breakdown: Dict[str, float]
    latest_natural_language_reason: str

class DashboardStats(BaseModel):
    total_students: int
    flagged_count: int
    high_risk_count: int
    avg_risk_score: float

# ==========================================
# DUMMY DATA GENERATION
# ==========================================
students_db = {}
names = [
    "Alice Smith", "Bob Johnson", "Charlie Davis", "Diana Evans", "Evan Wright", 
    "Fiona Hill", "George Baker", "Hannah Clark", "Ian Lewis", "Julia King"
]

def generate_dummy_data():
    base_time = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    for i, name in enumerate(names):
        student_id = f"STU{1000 + i}"
        submissions = []
        # Simulate ~30% of students having a recent high-risk submission
        is_high_risk_student = (i % 3 == 0)
        
        for j in range(5):
            assign_id = f"HW{j+1}"
            sub_time = base_time + datetime.timedelta(days=j*7 + random.uniform(0.1, 1.5))
            
            # Latest assignment for flagged students will have anomalies
            if is_high_risk_student and j == 4:
                risk = random.uniform(85.0, 98.0)
                flagged = True
                shap = {
                    "avg_sentence_length": 25.4,
                    "time_spent_mins": -15.2,
                    "type_token_ratio": 12.1
                }
            else:
                risk = random.uniform(5.0, 35.0)
                flagged = False
                shap = {
                    "avg_sentence_length": 1.2,
                    "time_spent_mins": -0.5,
                    "type_token_ratio": 0.8
                }
                
            submissions.append({
                "assignment_id": assign_id,
                "submitted_at": sub_time.isoformat() + "Z",
                "risk_score": float(risk),
                "flagged": flagged,
                "shap_breakdown": shap
            })
            
        students_db[student_id] = {
            "name": name,
            "submissions": submissions
        }

# Generate data on startup
generate_dummy_data()

# ==========================================
# API ROUTES
# ==========================================
@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_submission(req: AnalyzeRequest):
    """
    Real-time analysis endpoint. In production, this would call 
    the IsolationForest and Stylometry components directly.
    """
    # Dummy logic to trigger an anomaly based on arbitrary conditions
    is_anomalous = len(req.essay_text) > 500 and req.grade >= 95.0
    
    risk_score = random.uniform(85.0, 99.0) if is_anomalous else random.uniform(10.0, 35.0)
    flagged = risk_score > 75.0
    
    shap_breakdown = {
        "avg_sentence_length": random.uniform(15.0, 30.0) if is_anomalous else random.uniform(0.1, 2.0),
        "flesch_reading_ease": random.uniform(10.0, 20.0) if is_anomalous else random.uniform(-1.0, 1.0),
        "timing_z_score": random.uniform(5.0, 10.0) if is_anomalous else random.uniform(0.1, 0.5)
    }
    
    top_signals = ["Writing style deviation", "Vocabulary richness anomaly"] if is_anomalous else []
    
    reason = (
        "The submission exhibits anomalous characteristics. Student's writing style deviated "
        "significantly from their baseline. Submission timing was irregular compared to normal patterns."
    ) if is_anomalous else "No significant risk factors detected. The submission aligns with typical baseline patterns."
    
    return AnalyzeResponse(
        risk_score=risk_score,
        confidence="High" if risk_score > 85.0 else "Normal",
        shap_breakdown=shap_breakdown,
        natural_language_reason=reason,
        top_signals=top_signals,
        flagged=flagged
    )

def extract_pdf_text(content: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(content))
    return " ".join(page.extract_text() for page in reader.pages)

def extract_docx_text(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    return " ".join(para.text for para in doc.paragraphs)

def extract_all_features(text: str):
    # Dummy feature extraction for the new endpoints
    return {"text_length": len(text)}

def explain_with_shap(features):
    return {
        "style_distance": random.uniform(10.0, 35.0),
        "vocab_richness_jump": random.uniform(5.0, 25.0),
        "sentence_uniformity": random.uniform(5.0, 20.0),
        "personal_voice_markers": random.uniform(-20.0, -5.0),
        "passive_voice_rate": random.uniform(0.0, 15.0)
    }

def get_radar_data(features):
    return [
        {"metric": "Style Score", "value": random.randint(20, 95)},
        {"metric": "Vocab Richness", "value": random.randint(20, 95)},
        {"metric": "Consistency", "value": random.randint(20, 95)},
        {"metric": "Personal Voice", "value": random.randint(20, 95)},
        {"metric": "Timing Pattern", "value": random.randint(20, 95)},
        {"metric": "Submission Norm", "value": random.randint(20, 95)}
    ]

async def analyze_document_internal(file: UploadFile, doc_type: str):
    content = await file.read()
    if file.filename.endswith('.pdf'):
        text = extract_pdf_text(content)
    elif file.filename.endswith('.docx'):
        text = extract_docx_text(content)
    else:
        text = content.decode('utf-8', errors='ignore')
        
    features = extract_all_features(text)
    is_anomalous = len(text) > 500 or doc_type == "ai"
    
    risk_score = random.uniform(80.0, 98.0) if is_anomalous else random.uniform(10.0, 30.0)
    shap_values = explain_with_shap(features)
    nl_explanation = "This document exhibits strong indicators of AI-generated content." if is_anomalous else "This document shows authentic human writing patterns."
    
    return {
        "filename": file.filename,
        "risk_score": risk_score,
        "confidence": 0.94 if is_anomalous else 0.91,
        "risk_level": "CRITICAL" if risk_score > 70 else "LOW",
        "shap_contributions": [{"feature": k.replace('_', ' ').title(), "value": v} for k, v in shap_values.items()],
        "nl_explanation": nl_explanation,
        "recommended_action": "Schedule oral examination." if is_anomalous else "No action required.",
        "radar_data": get_radar_data(features),
        "doc_type": doc_type,
        "processing_time": f"{random.uniform(1.5, 2.5):.1f}s"
    }

@app.post("/api/analyze-document")
async def analyze_document(file: UploadFile = File(...), doc_type: str = Form(...)):
    return await analyze_document_internal(file, doc_type)

@app.post("/api/analyze-comparison")
async def analyze_comparison(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
):
    result_a = await analyze_document_internal(file_a, "ai")
    result_b = await analyze_document_internal(file_b, "human")
    
    divergence = random.uniform(70.0, 95.0)
    forensic_conclusion = f"Documents show {divergence:.0f}% stylistic divergence. Document A matches AI generation patterns."
    
    return {
        "document_a": result_a,
        "document_b": result_b,
        "divergence_score": divergence,
        "forensic_conclusion": forensic_conclusion
    }

@app.get("/api/students", response_model=List[StudentSummary])
def get_students():
    result = []
    for sid, data in students_db.items():
        latest_sub = data["submissions"][-1]
        risk = latest_sub["risk_score"]
        result.append(StudentSummary(
            student_id=sid,
            name=data["name"],
            assignment=latest_sub["assignment_id"],
            risk_score=risk,
            confidence="High" if risk > 80.0 else "Normal",
            flagged=latest_sub["flagged"]
        ))
    # Sort with highest risk first
    result.sort(key=lambda x: x.risk_score, reverse=True)
    return result

@app.get("/api/student/{student_id}", response_model=StudentDetail)
def get_student(student_id: str):
    if student_id not in students_db:
        raise HTTPException(status_code=404, detail="Student not found")
        
    data = students_db[student_id]
    latest_sub = data["submissions"][-1]
    
    history = [SubmissionHistory(**sub) for sub in data["submissions"]]
    
    reason = (
        "Anomalous patterns detected. Significant deviations observed in writing "
        "complexity and timing behavior compared to student history."
    ) if latest_sub["flagged"] else "Normal submission behavior. Consistent with student baseline."
    
    return StudentDetail(
        student_id=student_id,
        name=data["name"],
        submissions=history,
        latest_shap_breakdown=latest_sub["shap_breakdown"],
        latest_natural_language_reason=reason
    )

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_stats():
    total = len(students_db)
    flagged = sum(1 for data in students_db.values() if data["submissions"][-1]["flagged"])
    high_risk = sum(1 for data in students_db.values() if data["submissions"][-1]["risk_score"] >= 80.0)
    
    all_scores = [data["submissions"][-1]["risk_score"] for data in students_db.values()]
    avg_score = sum(all_scores) / total if total > 0 else 0.0
    
    return DashboardStats(
        total_students=total,
        flagged_count=flagged,
        high_risk_count=high_risk,
        avg_risk_score=avg_score
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
