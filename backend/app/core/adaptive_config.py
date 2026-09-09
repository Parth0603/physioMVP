"""Centralized configuration for the deterministic adaptive learning engine.

All mastery bands, priority thresholds, spaced revision intervals,
and study plan generation parameters are defined here to avoid hardcoding.
"""
from typing import Dict, List


class AdaptiveConfig:
    # Mastery Score Classification Bands (0-100 scale)
    MASTERY_STRONG_MIN = 80.0
    MASTERY_MODERATE_MIN = 60.0
    MASTERY_NEEDS_IMPROVEMENT_MIN = 40.0
    # < 40.0 is considered Weak / Critical Gap

    # Priority Engine Thresholds
    PRIORITY_HIGH_THRESHOLD = 40.0       # Mastery < 40% -> Priority 1 (High)
    PRIORITY_MEDIUM_THRESHOLD = 60.0     # 40% <= Mastery < 60% -> Priority 2 (Medium)
    PRIORITY_LOW_THRESHOLD = 80.0        # 60% <= Mastery < 80% -> Priority 3 (Low)
    # >= 80% -> Priority 4 (Mastered/Maintenance)

    # Spaced Repetition Scheduling Intervals (in days)
    # Weak: 1 day -> 3 days -> 7 days
    # Moderate: 3 days -> 7 days -> 14 days
    # Strong: 7 days -> 14 days -> 30 days
    SPACED_INTERVALS: Dict[str, List[int]] = {
        "weak": [1, 3, 7],
        "needs_improvement": [2, 5, 10],
        "moderate": [3, 7, 14],
        "strong": [7, 14, 30],
    }

    # Study Plan Daily Generation Parameters
    MAX_DAILY_PLAN_ITEMS = 4
    DEFAULT_CONCEPT_MINUTES = 25
    DEFAULT_PRACTICE_MINUTES = 20

    @classmethod
    def get_mastery_band(cls, score: float) -> str:
        if score >= cls.MASTERY_STRONG_MIN:
            return "strong"
        elif score >= cls.MASTERY_MODERATE_MIN:
            return "moderate"
        elif score >= cls.MASTERY_NEEDS_IMPROVEMENT_MIN:
            return "needs_improvement"
        else:
            return "weak"

    @classmethod
    def get_priority_level(cls, score: float, difficulty: str = "beginner") -> int:
        """Calculate numeric priority (1=High, 2=Medium, 3=Low, 4=Maintenance)."""
        if score < cls.PRIORITY_HIGH_THRESHOLD:
            return 1
        elif score < cls.PRIORITY_MEDIUM_THRESHOLD:
            # If intermediate/advanced topic is below 60%, elevate to high priority
            return 1 if difficulty in ["intermediate", "advanced"] else 2
        elif score < cls.PRIORITY_LOW_THRESHOLD:
            return 3
        else:
            return 4


adaptive_config = AdaptiveConfig()
