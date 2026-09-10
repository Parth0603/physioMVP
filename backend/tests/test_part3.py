"""Integration tests verifying Part 3: Learning, MCQ Practice, Viva Voce & Clinical Reasoning."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_token(email: str = "student@physiosmart.edu", password: str = "Password123!") -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


def test_mark_topic_reviewed():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get topics
    sub_res = client.get("/api/v1/subjects/", headers=headers)
    assert sub_res.status_code == 200
    topic_id = sub_res.json()[0]["units"][0]["topics"][0]["id"]

    res = client.post(f"/api/v1/topics/{topic_id}/mark-reviewed", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["topic_id"] == topic_id
    assert data["mastery_level"] >= 25.0


def test_topic_mcq_practice_and_submission():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get topic with questions
    sub_res = client.get("/api/v1/subjects/", headers=headers)
    topic_id = sub_res.json()[0]["units"][0]["topics"][0]["id"]

    mcq_res = client.get(f"/api/v1/practice/mcq/{topic_id}", headers=headers)
    assert mcq_res.status_code == 200
    questions = mcq_res.json()
    assert isinstance(questions, list)
    assert len(questions) > 0

    # Submit practice answers
    answers = []
    for q in questions:
        opt_id = q["options"][0]["id"] if q.get("options") else None
        answers.append({"question_id": q["id"], "selected_option_id": opt_id})

    sub_post = client.post(
        f"/api/v1/practice/mcq/{topic_id}/submit",
        json={"answers": answers},
        headers=headers,
    )
    assert sub_post.status_code == 200
    result = sub_post.json()
    assert "accuracy" in result
    assert "performance_band" in result
    assert "recommended_action" in result
    assert result["total_questions"] == len(questions)


def test_viva_questions_and_evaluation():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Retrieve viva questions for topic 1
    viva_res = client.get("/api/v1/viva/topic/1", headers=headers)
    assert viva_res.status_code == 200
    questions = viva_res.json()
    assert isinstance(questions, list)
    assert len(questions) >= 1
    q = questions[0]
    question_id = q["id"]

    # Evaluate answer with relevant physiological concepts
    answer_payload = {
        "student_answer": "The rotator cuff provides dynamic glenohumeral stabilization and centers the humeral head during abduction."
    }
    eval_res = client.post(f"/api/v1/viva/{question_id}/evaluate", json=answer_payload, headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["score"] > 0
    assert len(eval_data["key_concepts_identified"]) > 0
    assert "feedback" in eval_data
    assert "model_answer" in eval_data


def test_clinical_reasoning_case_flow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # List clinical cases
    cases_res = client.get("/api/v1/clinical-cases/", headers=headers)
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) >= 1
    case_id = cases[0]["id"]

    # Fetch individual case
    case_detail = client.get(f"/api/v1/clinical-cases/{case_id}", headers=headers)
    assert case_detail.status_code == 200
    c = case_detail.json()
    assert "chief_complaint" in c
    assert "symptoms" in c
    assert "assessment_findings" in c

    # Submit 3-stage clinical reasoning
    submission = {
        "hypothesis": "Subacromial impingement syndrome and rotator cuff tendinopathy of the supraspinatus.",
        "assessments": "Neer impingement test, Hawkins-Kennedy test, and Empty Can supraspinatus test.",
        "management": "Relative rest from overhead sports, cryotherapy, scapular stabilization, and isometric rotator cuff strengthening."
    }
    sub_res = client.post(f"/api/v1/clinical-cases/{case_id}/submit", json=submission, headers=headers)
    assert sub_res.status_code == 200
    result = sub_res.json()
    assert result["overall_score"] > 50
    assert "hypothesis_feedback" in result
    assert "assessment_feedback" in result
    assert "management_feedback" in result
    assert len(result["hypothesis_feedback"]["points_identified"]) > 0
    assert len(result["assessment_feedback"]["points_identified"]) > 0
    assert len(result["management_feedback"]["points_identified"]) > 0
    assert "learning_recommendation" in result


def test_assessment_latest_result_fallback():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Check that latest-result endpoint works for browser refresh / back resilience
    list_res = client.get("/api/v1/assessments/", headers=headers)
    assessment_id = list_res.json()[0]["id"]

    res = client.get(f"/api/v1/assessments/{assessment_id}/latest-result", headers=headers)
    assert res.status_code in (200, 404)
    if res.status_code == 200:
        data = res.json()
        assert "total_questions" in data
        assert "accuracy_percentage" in data
