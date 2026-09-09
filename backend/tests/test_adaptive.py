"""Integration tests verifying Part 2 Assessment & Adaptive Learning Engine."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_token(email: str = "student@physiosmart.edu", password: str = "Password123!") -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_list_assessments():
    token = get_auth_token()
    res = client.get("/api/v1/assessments/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assessments = res.json()
    assert len(assessments) >= 1
    assert "Biomechanics Diagnostic" in assessments[0]["title"]


def test_start_assessment_masks_correct_answer():
    token = get_auth_token()
    list_res = client.get("/api/v1/assessments/", headers={"Authorization": f"Bearer {token}"})
    assessment_id = list_res.json()[0]["id"]

    start_res = client.get(f"/api/v1/assessments/{assessment_id}/start", headers={"Authorization": f"Bearer {token}"})
    assert start_res.status_code == 200
    data = start_res.json()
    assert data["total_questions"] >= 5
    assert len(data["questions"]) >= 5

    # Check question structure and verify correct_answer is NOT leaked to student
    first_q = data["questions"][0]
    assert "question_text" in first_q
    assert "options" in first_q
    assert "correct_answer" not in first_q
    for opt in first_q["options"]:
        assert "is_correct" not in opt


def test_submit_assessment_calculates_topic_performance_and_generates_study_plan():
    token = get_auth_token()
    list_res = client.get("/api/v1/assessments/", headers={"Authorization": f"Bearer {token}"})
    assessment_id = list_res.json()[0]["id"]

    start_res = client.get(f"/api/v1/assessments/{assessment_id}/start", headers={"Authorization": f"Bearer {token}"})
    questions = start_res.json()["questions"]

    # Submit answers: answer 1st question with correct option, 2nd with incorrect, etc.
    answers = []
    for idx, q in enumerate(questions):
        # Pick first option for all (some will be correct, some incorrect)
        opt_text = q["options"][0]["option_text"]
        answers.append({
            "question_id": q["id"],
            "selected_option_text": opt_text,
            "time_taken_seconds": 15
        })

    submit_res = client.post(
        f"/api/v1/assessments/{assessment_id}/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={"answers": answers}
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert "total_questions" in result
    assert "accuracy_percentage" in result
    assert len(result["topic_performances"]) >= 1
    assert result["study_plan_id"] is not None


def test_adaptive_gaps_and_revision_endpoints():
    token = get_auth_token()

    # Check learning gaps
    gaps_res = client.get("/api/v1/adaptive/gaps", headers={"Authorization": f"Bearer {token}"})
    assert gaps_res.status_code == 200
    gaps = gaps_res.json()
    assert isinstance(gaps, list)

    # Check revision due
    rev_res = client.get("/api/v1/adaptive/revision-due", headers={"Authorization": f"Bearer {token}"})
    assert rev_res.status_code == 200
    assert isinstance(rev_res.json(), list)

    # Check active study plan
    plan_res = client.get("/api/v1/study-plans/active", headers={"Authorization": f"Bearer {token}"})
    assert plan_res.status_code == 200
    plan = plan_res.json()
    assert plan is not None
    assert len(plan["items"]) > 0


def test_progress_subject_summaries():
    token = get_auth_token()
    res = client.get("/api/v1/progress/subjects", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    anatomy = next((s for s in data if s["subject_code"] == "ANAT101"), None)
    assert anatomy is not None
    assert "average_mastery" in anatomy
