"""Abstract AI Provider interface.

All AI interactions (Gemini or future LLMs) must conform to this interface.
Business logic must never make direct HTTP calls to AI APIs.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional


class AIProvider(ABC):
    @abstractmethod
    def generate_explanation(
        self, topic_name: str, retrieved_context: str, student_level: str
    ) -> Dict[str, Any]:
        """Generate a tailored explanation based ONLY on verified retrieved content."""
        pass

    @abstractmethod
    def generate_questions(
        self, topic_name: str, retrieved_context: str, difficulty: str, count: int = 3
    ) -> List[Dict[str, Any]]:
        """Generate targeted diagnostic/practice questions strictly grounded in context."""
        pass

    @abstractmethod
    def analyze_performance(
        self, student_attempts: List[Dict[str, Any]], topic_masteries: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Perform clinical knowledge gap analysis on student attempts."""
        pass

    @abstractmethod
    def generate_recommendation(
        self, gap_analysis: Dict[str, Any], available_topics: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate next study plan recommendations."""
        pass
