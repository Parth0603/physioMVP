"""Seed script to populate demonstration dataset for PHYSIO-SMART.

Populates:
- Demo Users: Student, Faculty, Admin
- BPT Subjects: Anatomy, Physiology, Exercise Therapy, Electrotherapy
- Units & Topics with difficulty ratings
- Verified knowledge base content
- Authentic topic-balanced clinical MCQs with option sets and detailed explanations
- Diagnostic Assessments
- Initial student progress and attempts
"""
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.academic import Subject, Unit, Topic, DifficultyLevel
from app.models.content import Content, ContentType
from app.models.question import Question, QuestionOption, QuestionType
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentType
from app.models.progress import StudentProgress
from app.models.study_plan import StudyPlan, StudyPlanItem, PlanStatus, PlanItemStatus


def seed_database():
    print("Initializing tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if users already seeded
        student_user = db.query(User).filter(User.email == "student@physiosmart.edu").first()
        if not student_user:
            print("Seeding Users...")
            student_user = User(
                name="Aarav Sharma",
                email="student@physiosmart.edu",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.STUDENT,
                is_active=True,
            )
            db.add(student_user)
            db.commit()
            db.refresh(student_user)

            student_profile = StudentProfile(
                user_id=student_user.id,
                institution="Apex Institute of Physiotherapy & Allied Sciences",
                course="Bachelor of Physiotherapy (BPT)",
                academic_year=1,
                semester=1,
            )
            db.add(student_profile)

            faculty_user = User(
                name="Dr. Sunita Deshmukh, MPT",
                email="faculty@physiosmart.edu",
                password_hash=get_password_hash("FacultyPass123!"),
                role=UserRole.FACULTY,
                is_active=True,
            )
            admin_user = User(
                name="Admin System",
                email="admin@physiosmart.edu",
                password_hash=get_password_hash("AdminPass123!"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add_all([faculty_user, admin_user])
            db.commit()

        # Check / Seed Academic Hierarchy
        anatomy = db.query(Subject).filter(Subject.code == "ANAT101").first()
        if not anatomy:
            print("Seeding Subjects & Units...")
            anatomy = Subject(
                name="Human Anatomy",
                code="ANAT101",
                description="Musculoskeletal, neurovascular, and arthrological structures essential for physical assessment and manual therapeutics.",
                academic_year=1,
                semester=1,
                is_active=True,
            )
            physio = Subject(
                name="Human Physiology",
                code="PHYS102",
                description="Neuromuscular transmission, cardiorespiratory kinetics, and tissue repair biology.",
                academic_year=1,
                semester=1,
                is_active=True,
            )
            ex_therapy = Subject(
                name="Exercise Therapy Foundation",
                code="EXTH103",
                description="Biomechanics of therapeutic movement, ROM, and manual resistance techniques.",
                academic_year=1,
                semester=2,
                is_active=True,
            )
            electro = Subject(
                name="Electrotherapy Principles",
                code="ELEC104",
                description="Biophysical foundations of low, medium, and high frequency therapeutic currents.",
                academic_year=1,
                semester=2,
                is_active=True,
            )
            db.add_all([anatomy, physio, ex_therapy, electro])
            db.commit()
            db.refresh(anatomy)
            db.refresh(physio)

            unit_upper = Unit(
                subject_id=anatomy.id,
                name="Unit 1: Upper Limb Anatomy & Biomechanics",
                description="Kinematics, arthrology, and innervation of shoulder, arm, and forearm.",
                order_index=1,
            )
            unit_lower = Unit(
                subject_id=anatomy.id,
                name="Unit 2: Lower Limb Osteology & Arthrology",
                description="Pelvic girdle, hip joint, knee complex, and ankle mechanics.",
                order_index=2,
            )
            unit_neuro = Unit(
                subject_id=physio.id,
                name="Unit 1: Neuromuscular Physiology",
                description="Excitation-contraction coupling and motor unit recruitment.",
                order_index=1,
            )
            db.add_all([unit_upper, unit_lower, unit_neuro])
            db.commit()
            db.refresh(unit_upper)
            db.refresh(unit_lower)
            db.refresh(unit_neuro)

            topic_rotator = Topic(
                unit_id=unit_upper.id,
                name="Rotator Cuff Muscles & Shoulder Stability",
                description="Supraspinatus, Infraspinatus, Teres Minor, Subscapularis: force couples and stabilization.",
                order_index=1,
                difficulty_level=DifficultyLevel.BEGINNER,
                is_active=True,
            )
            topic_brachial = Topic(
                unit_id=unit_upper.id,
                name="Brachial Plexus Organization & Injuries",
                description="Roots, trunks, divisions, terminal cords, Erb's and Klumpke's lesions.",
                order_index=2,
                difficulty_level=DifficultyLevel.INTERMEDIATE,
                is_active=True,
            )
            topic_knee = Topic(
                unit_id=unit_lower.id,
                name="Knee Joint Complex & Ligamentous Restraints",
                description="Cruciate ligaments (ACL/PCL), collaterals, menisci, and screw-home mechanism.",
                order_index=1,
                difficulty_level=DifficultyLevel.INTERMEDIATE,
                is_active=True,
            )
            topic_sliding = Topic(
                unit_id=unit_neuro.id,
                name="Sliding Filament Theory of Muscle Contraction",
                description="Cross-bridge cycle, Calcium release, ATP binding and detachment.",
                order_index=1,
                difficulty_level=DifficultyLevel.BEGINNER,
                is_active=True,
            )
            db.add_all([topic_rotator, topic_brachial, topic_knee, topic_sliding])
            db.commit()

        # Re-fetch topics
        topic_rotator = db.query(Topic).filter(Topic.name.like("%Rotator Cuff%")).first()
        topic_brachial = db.query(Topic).filter(Topic.name.like("%Brachial Plexus%")).first()
        topic_knee = db.query(Topic).filter(Topic.name.like("%Knee Joint%")).first()
        topic_sliding = db.query(Topic).filter(Topic.name.like("%Sliding Filament%")).first()

        print("Seeding Topic-Balanced Questions for Assessments...")
        # Helper to create question + options
        def add_mcq(topic_id, text, correct, wrong_list, explanation, difficulty=DifficultyLevel.BEGINNER):
            # Check if exists
            existing = db.query(Question).filter(Question.question_text == text).first()
            if existing:
                return existing

            q = Question(
                topic_id=topic_id,
                question_text=text,
                question_type=QuestionType.MCQ,
                difficulty_level=difficulty,
                explanation=explanation,
                correct_answer=correct,
                is_verified=True,
            )
            db.add(q)
            db.commit()
            db.refresh(q)

            opts = [QuestionOption(question_id=q.id, option_text=correct, is_correct=True)]
            for w in wrong_list:
                opts.append(QuestionOption(question_id=q.id, option_text=w, is_correct=False))
            db.add_all(opts)
            db.commit()
            return q

        # --- Questions for Rotator Cuff ---
        q1 = add_mcq(
            topic_rotator.id,
            "Which muscle of the rotator cuff initiates the first 15 degrees of shoulder abduction?",
            "Supraspinatus",
            ["Infraspinatus", "Teres Minor", "Subscapularis"],
            "Supraspinatus initiates the first 15° of glenohumeral abduction before the deltoid becomes mechanically advantageous.",
            DifficultyLevel.BEGINNER,
        )
        q2 = add_mcq(
            topic_rotator.id,
            "During arm elevation, which force couple counters the upward shear force of the deltoid?",
            "Infraspinatus, Subscapularis, and Teres Minor",
            ["Pectoralis major and latissimus dorsi", "Biceps brachii and coracobrachialis", "Trapezius and levator scapulae"],
            "The inferior rotator cuff (infraspinatus, subscapularis, teres minor) exerts a downward and medial compressive force seating the humeral head.",
            DifficultyLevel.INTERMEDIATE,
        )
        q3 = add_mcq(
            topic_rotator.id,
            "A patient presents with sharp anterolateral shoulder pain during active abduction between 70° and 120°. What clinical sign is this?",
            "Painful Arc Syndrome",
            ["Frozen Shoulder sign", "Sulcus sign", "Apprehension sign"],
            "A painful arc between 60°-120° suggests subacromial impingement of the supraspinatus tendon.",
            DifficultyLevel.BEGINNER,
        )

        # --- Questions for Brachial Plexus ---
        q4 = add_mcq(
            topic_brachial.id,
            "Erb-Duchenne palsy results from traction injury to which nerve roots of the brachial plexus?",
            "C5 and C6 roots",
            ["C8 and T1 roots", "C7 and C8 roots", "T1 and T2 roots"],
            "Erb's palsy involves upper trunk (C5-C6) avulsion, causing characteristic 'waiter's tip' deformity.",
            DifficultyLevel.INTERMEDIATE,
        )
        q5 = add_mcq(
            topic_brachial.id,
            "Which nerve originating from the posterior cord innervates the triceps brachii and wrist extensors?",
            "Radial nerve",
            ["Median nerve", "Ulnar nerve", "Axillary nerve"],
            "The radial nerve is the main terminal branch of the posterior cord (C5-T1).",
            DifficultyLevel.BEGINNER,
        )
        q6 = add_mcq(
            topic_brachial.id,
            "Klumpke's paralysis typically causes what clinical deformity in the hand?",
            "Claw hand (intrinsic minus hand)",
            ["Wrist drop", "Ape thumb deformity", "Bishop's hand"],
            "Injury to C8-T1 leads to paralysis of intrinsic hand muscles, producing claw hand deformity.",
            DifficultyLevel.INTERMEDIATE,
        )

        # --- Questions for Knee Joint ---
        q7 = add_mcq(
            topic_knee.id,
            "Which special clinical test is most sensitive and specific for diagnosing an acute Anterior Cruciate Ligament (ACL) rupture?",
            "Lachman Test",
            ["Anterior Drawer Test", "McMurray Test", "Apley Grind Test"],
            "The Lachman test performed at 20-30° flexion eliminates hamstring stabilization, making it superior to anterior drawer.",
            DifficultyLevel.INTERMEDIATE,
        )
        q8 = add_mcq(
            topic_knee.id,
            "The 'screw-home' mechanism of the knee joint involves which terminal movement in closed kinetic chain extension?",
            "Internal rotation of the femur on fixed tibia",
            ["External rotation of the femur on fixed tibia", "Pure sagittal gliding without rotation", "Lateral tilt of the patella"],
            "In weight-bearing closed chain extension, the femur medially rotates on the tibia during the terminal 5° to lock the knee.",
            DifficultyLevel.ADVANCED,
        )

        # --- Questions for Sliding Filament ---
        q9 = add_mcq(
            topic_sliding.id,
            "What critical ion binds to Troponin C to expose actin binding sites during muscle excitation-contraction coupling?",
            "Calcium (Ca2+)",
            ["Sodium (Na+)", "Potassium (K+)", "Magnesium (Mg2+)"],
            "Calcium released from the sarcoplasmic reticulum binds Troponin C, shifting tropomyosin away from myosin-binding sites.",
            DifficultyLevel.BEGINNER,
        )
        q10 = add_mcq(
            topic_sliding.id,
            "What causes detachment of the myosin cross-bridge head from actin at the conclusion of the power stroke?",
            "Binding of a new ATP molecule to myosin",
            ["Hydrolysis of ADP to AMP", "Efflux of calcium from the sarcoplasm", "Release of inorganic phosphate"],
            "ATP binding triggers allosteric detachment. In the absence of ATP, rigor mortis occurs.",
            DifficultyLevel.INTERMEDIATE,
        )

        # Seed Predefined Diagnostic Assessment
        diag_assessment = db.query(Assessment).filter(Assessment.title.like("%Upper Limb & Joint Biomechanics%")).first()
        if not diag_assessment:
            print("Seeding Anatomy Diagnostic Assessment...")
            diag_assessment = Assessment(
                title="BPT Year 1: Upper Limb & Joint Biomechanics Diagnostic",
                description="Comprehensive topic-balanced diagnostic test assessing Rotator Cuff, Brachial Plexus, Knee Ligament arthrology, and Muscle Mechanics.",
                subject_id=anatomy.id,
                assessment_type=AssessmentType.DIAGNOSTIC,
                duration_minutes=25,
                is_active=True,
            )
            db.add(diag_assessment)
            db.commit()
            db.refresh(diag_assessment)

            question_pool = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10]
            for idx, q_item in enumerate(question_pool, start=1):
                aq = AssessmentQuestion(
                    assessment_id=diag_assessment.id,
                    question_id=q_item.id,
                    order_index=idx,
                )
                db.add(aq)
            db.commit()

        print("Database seeding completed successfully for Part 2!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
