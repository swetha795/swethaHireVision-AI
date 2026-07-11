"""
Resume parsing + NLP-based analysis.
Extracts text from PDF/DOCX and evaluates skills, experience, ATS score,
and keyword match against a target role using lightweight rule-based NLP
(keyword/regex matching) so it runs without heavy model downloads.
"""
import re
import PyPDF2
import docx

# Skill keyword bank - extend this list as needed
SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "node.js", "node",
    "express", "mongodb", "sql", "mysql", "postgresql", "html", "css",
    "tailwind", "git", "github", "docker", "kubernetes", "aws", "azure",
    "machine learning", "deep learning", "tensorflow", "pytorch", "opencv",
    "nlp", "data analysis", "pandas", "numpy", "flask", "django", "rest api",
    "graphql", "c++", "c#", "redux", "next.js", "firebase", "linux", "agile",
]

# Keywords commonly expected per role, used for keyword-match scoring
ROLE_KEYWORDS = {
    "software engineer": ["data structures", "algorithms", "system design", "git", "api", "sql", "oop"],
    "frontend developer": ["react", "javascript", "css", "html", "responsive", "redux", "ui/ux"],
    "backend developer": ["node.js", "express", "database", "api", "sql", "authentication", "server"],
    "data analyst": ["sql", "excel", "pandas", "visualization", "statistics", "python", "dashboard"],
    "full stack developer": ["react", "node.js", "mongodb", "api", "javascript", "git", "database"],
}


def extract_text(file_path):
    """Extract raw text from a PDF or DOCX file."""
    ext = file_path.lower().rsplit(".", 1)[-1]
    text = ""

    if ext == "pdf":
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
    elif ext in ("doc", "docx"):
        document = docx.Document(file_path)
        text = "\n".join(p.text for p in document.paragraphs)
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or DOCX.")

    return text


def analyze_resume(raw_text, target_role):
    text_lower = raw_text.lower()

    # 1. Skill extraction
    found_skills = sorted({kw for kw in SKILL_KEYWORDS if kw in text_lower})

    # 2. Experience estimation (looks for patterns like "3 years", "2+ yrs")
    exp_matches = re.findall(r"(\d+)\+?\s*(?:years|yrs)", text_lower)
    experience_years = max([int(x) for x in exp_matches], default=0)

    # 3. Keyword match against target role
    role_key = target_role.lower().strip()
    expected_keywords = ROLE_KEYWORDS.get(role_key, ROLE_KEYWORDS["software engineer"])
    matched = [kw for kw in expected_keywords if kw in text_lower]
    keyword_match = round((len(matched) / len(expected_keywords)) * 100) if expected_keywords else 0

    # 4. ATS score - simple weighted heuristic based on structure + content signals
    ats_score = 40  # baseline
    if len(found_skills) >= 5:
        ats_score += 20
    elif len(found_skills) >= 2:
        ats_score += 10
    if re.search(r"education|b\.?tech|bachelor|university|college", text_lower):
        ats_score += 10
    if re.search(r"project|experience|internship", text_lower):
        ats_score += 15
    if re.search(r"@[\w.-]+\.\w+", raw_text):  # has an email
        ats_score += 5
    if keyword_match >= 50:
        ats_score += 10
    ats_score = min(100, ats_score)

    # 5. Strengths & improvement areas
    strengths = []
    improvements = []

    if len(found_skills) >= 5:
        strengths.append(f"Strong, diverse technical skill set ({len(found_skills)} relevant skills found).")
    else:
        improvements.append("Add more relevant technical skills and tools you've worked with.")

    if experience_years > 0:
        strengths.append(f"Clearly states {experience_years}+ years of relevant experience.")
    else:
        improvements.append("Quantify your experience (e.g. '2 years', 'built X in Y months').")

    if keyword_match >= 60:
        strengths.append(f"Resume aligns well with '{target_role}' role requirements.")
    else:
        improvements.append(f"Tailor resume keywords more closely to the '{target_role}' role.")

    if not re.search(r"project", text_lower):
        improvements.append("Include specific projects with measurable outcomes.")

    if not strengths:
        strengths.append("Resume successfully parsed; consider adding more detail to strengthen it.")

    return {
        "skills": found_skills,
        "detectedRole": target_role,
        "experienceYears": experience_years,
        "atsScore": ats_score,
        "keywordMatch": keyword_match,
        "strengths": strengths,
        "improvementAreas": improvements,
    }
