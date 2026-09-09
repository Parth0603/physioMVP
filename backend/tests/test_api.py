"""Backend test suite verifying Authentication, RBAC, Academic hierarchy, and Content."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "student@physiosmart.edu", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"
    assert data["email"] == "student@physiosmart.edu"


def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "student@physiosmart.edu", "password": "WrongPassword!"},
    )
    assert response.status_code == 401


def test_rbac_admin_route_blocked_for_student():
    # 1. Login as student
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "student@physiosmart.edu", "password": "Password123!"},
    )
    student_token = login_res.json()["access_token"]

    # 2. Attempt to create a subject (admin only)
    create_res = client.post(
        "/api/v1/subjects/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "name": "Biomechanics",
            "code": "BIOM105",
            "description": "Kinesiology",
            "academic_year": 1,
            "semester": 2,
        },
    )
    assert create_res.status_code == 403


def test_admin_can_create_and_delete_subject():
    # 1. Login as admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@physiosmart.edu", "password": "AdminPass123!"},
    )
    admin_token = login_res.json()["access_token"]

    # 2. Admin creates subject
    create_res = client.post(
        "/api/v1/subjects/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Biomechanics & Kinesiology",
            "code": "BIOM105",
            "description": "Study of mechanical forces on human body",
            "academic_year": 1,
            "semester": 2,
        },
    )
    assert create_res.status_code == 201
    subj_data = create_res.json()
    subject_id = subj_data["id"]

    # 3. Clean up by deleting
    del_res = client.delete(
        f"/api/v1/subjects/{subject_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_res.status_code == 204


def test_get_subjects_and_hierarchy():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "student@physiosmart.edu", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/subjects/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    subjects = response.json()
    assert len(subjects) >= 4
    anatomy = next(s for s in subjects if s["code"] == "ANAT101")
    assert len(anatomy["units"]) >= 2
