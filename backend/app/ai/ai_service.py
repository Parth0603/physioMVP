"""High-level AI Service orchestrator.

Coordinates with repository layer to retrieve grounded knowledge base content
before delegating to the underlying AI provider.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.ai.base import AIProvider
from app.ai.gemini_provider import gemini_provider
from app.repositories.domain import content_repo


class AIService:
    def __init__(self, provider: AIProvider = gemini_provider):
        self.provider = provider

    def explain_topic(self, db: Session, topic_id: int, topic_name: str, student_level: str = "beginner") -> Dict[str, Any]:
        """Retrieve verified content for this topic and request grounded explanation from AI provider."""
        verified_contents = content_repo.get_verified_by_topic(db, topic_id)
        context = "\n\n".join([c.content_body for c in verified_contents])
        return self.provider.generate_explanation(topic_name, context, student_level)

    def generate_diagnostic_questions(self, db: Session, topic_id: int, topic_name: str) -> List[Dict[str, Any]]:
        verified_contents = content_repo.get_verified_by_topic(db, topic_id)
        context = "\n\n".join([c.content_body for c in verified_contents])
        return self.provider.generate_questions(topic_name, context, "intermediate")


ai_service = AIService()
