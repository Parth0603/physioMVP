"""Question & Assessment service."""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.models.question import Question, QuestionOption
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.repositories.domain import question_repo, topic_repo


class QuestionService:
    @staticmethod
    def list_questions(
        db: Session, skip: int = 0, limit: int = 100, topic_id: Optional[int] = None
    ) -> List[Question]:
        return question_repo.list_all(db, skip=skip, limit=limit, topic_id=topic_id)

    @staticmethod
    def list_questions_by_topic(db: Session, topic_id: int) -> List[Question]:
        return question_repo.get_by_topic(db, topic_id)

    @staticmethod
    def create_question(db: Session, data: QuestionCreate) -> Question:
        topic = topic_repo.get(db, data.topic_id)
        if not topic:
            raise EntityNotFoundException("Topic", data.topic_id)

        question = Question(
            topic_id=data.topic_id,
            question_text=data.question_text,
            question_type=data.question_type,
            difficulty_level=data.difficulty_level,
            explanation=data.explanation,
            correct_answer=data.correct_answer,
            is_verified=data.is_verified,
        )
        db.add(question)
        db.commit()
        db.refresh(question)

        if data.options:
            for opt in data.options:
                option = QuestionOption(
                    question_id=question.id,
                    option_text=opt.option_text,
                    is_correct=opt.is_correct,
                )
                db.add(option)
            db.commit()
            db.refresh(question)

        return question

    @staticmethod
    def get_question_by_id(db: Session, question_id: int) -> Question:
        question = question_repo.get_with_options(db, question_id)
        if not question:
            raise EntityNotFoundException("Question", question_id)
        return question

    @staticmethod
    def update_question(db: Session, question_id: int, data: QuestionUpdate) -> Question:
        question = question_repo.get(db, question_id)
        if not question:
            raise EntityNotFoundException("Question", question_id)
        return question_repo.update(db, question, data.dict(exclude_unset=True))

    @staticmethod
    def delete_question(db: Session, question_id: int) -> None:
        question = question_repo.get(db, question_id)
        if not question:
            raise EntityNotFoundException("Question", question_id)
        question_repo.remove(db, question_id)


question_service = QuestionService()
