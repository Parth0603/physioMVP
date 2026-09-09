"""Seed script to populate initial demonstration dataset for PHYSIO-SMART.

Populates:
- Demo Users: Student, Faculty, Admin
- BPT Subjects: Anatomy, Physiology, Exercise Therapy, Electrotherapy
- Units & Topics with difficulty ratings
- Verified knowledge base content
- Sample practice questions with MCQ options
- Demo progress record for student
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
from app.models.progress import StudentProgress
from app.models.study_plan import StudyPlan, StudyPlanItem, PlanStatus, PlanItemStatus


def seed_database():
    print("Initializing tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "student@physiosmart.edu").first():
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding Users...")
        # 1. Users & Profiles
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
        db.add(faculty_user)
        db.add(admin_user)
        db.commit()
        db.refresh(faculty_user)
        db.refresh(admin_user)

        print("Seeding Subjects, Units, and Topics...")
        # 2. Anatomy
        anatomy = Subject(
            name="Human Anatomy",
            code="ANAT101",
            description="Detailed study of musculoskeletal, neurovascular, and visceral structures essential for clinical assessment and manual therapeutics.",
            academic_year=1,
            semester=1,
            is_active=True,
        )
        db.add(anatomy)
        db.commit()
        db.refresh(anatomy)

        unit_upper = Unit(
            subject_id=anatomy.id,
            name="Unit 1: Upper Limb Anatomy & Biomechanics",
            description="Osteology, myology, and articular kinematics of the shoulder, arm, forearm, and hand.",
            order_index=1,
        )
        unit_lower = Unit(
            subject_id=anatomy.id,
            name="Unit 2: Lower Limb Osteology & Arthrology",
            description="Pelvic girdle, hip joint, knee complex, and ankle-foot mechanics.",
            order_index=2,
        )
        db.add_all([unit_upper, unit_lower])
        db.commit()
        db.refresh(unit_upper)
        db.refresh(unit_lower)

        # Topics for Upper Limb
        topic_rotator = Topic(
            unit_id=unit_upper.id,
            name="Rotator Cuff Muscles & Shoulder Stability",
            description="Supraspinatus, Infraspinatus, Teres Minor, and Subscapularis: origin, insertion, innervation, and force-couple stabilization.",
            order_index=1,
            difficulty_level=DifficultyLevel.BEGINNER,
            is_active=True,
        )
        topic_brachial = Topic(
            unit_id=unit_upper.id,
            name="Brachial Plexus Organization & Injuries",
            description="Roots, trunks, divisions, cords, branches, and clinical lesions (Erb's and Klumpke's palsies).",
            order_index=2,
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            is_active=True,
        )
        # Topic for Lower Limb
        topic_knee = Topic(
            unit_id=unit_lower.id,
            name="Knee Joint Complex & Ligamentous Restraints",
            description="Cruciate ligaments (ACL/PCL), collateral ligaments (MCL/LCL), menisci, and screw-home mechanism.",
            order_index=1,
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            is_active=True,
        )
        db.add_all([topic_rotator, topic_brachial, topic_knee])
        db.commit()
        db.refresh(topic_rotator)
        db.refresh(topic_brachial)
        db.refresh(topic_knee)

        # 3. Physiology
        physio = Subject(
            name="Human Physiology",
            code="PHYS102",
            description="Physiological foundations of neuromuscular transmission, cardiorespiratory response to exercise, and tissue healing.",
            academic_year=1,
            semester=1,
            is_active=True,
        )
        db.add(physio)
        db.commit()
        db.refresh(physio)

        unit_neuro = Unit(
            subject_id=physio.id,
            name="Unit 1: Neuromuscular Physiology",
            description="Action potentials, synaptic transmission, and excitation-contraction coupling.",
            order_index=1,
        )
        db.add(unit_neuro)
        db.commit()
        db.refresh(unit_neuro)

        topic_sliding = Topic(
            unit_id=unit_neuro.id,
            name="Sliding Filament Theory of Muscle Contraction",
            description="Actin-myosin cross-bridge cycle, ATP hydrolysis, role of Calcium and Troponin-Tropomyosin complex.",
            order_index=1,
            difficulty_level=DifficultyLevel.BEGINNER,
            is_active=True,
        )
        db.add(topic_sliding)
        db.commit()
        db.refresh(topic_sliding)

        # 4. Exercise Therapy
        ex_therapy = Subject(
            name="Exercise Therapy Foundation",
            code="EXTH103",
            description="Mechanical principles of therapeutic movement, ROM, stretching, resistance, and joint mobilization.",
            academic_year=1,
            semester=2,
            is_active=True,
        )
        db.add(ex_therapy)
        db.commit()

        # 5. Electrotherapy
        electro = Subject(
            name="Electrotherapy Principles",
            code="ELEC104",
            description="Biophysical foundations of low, medium, and high frequency electrical currents, ultrasound, and thermal modalities.",
            academic_year=1,
            semester=2,
            is_active=True,
        )
        db.add(electro)
        db.commit()

        print("Seeding Knowledge Base Content...")
        # Curated Content for Rotator Cuff
        content1 = Content(
            topic_id=topic_rotator.id,
            title="SITS Functional Anatomy & Dynamic Stabilization",
            content_type=ContentType.CONCEPT,
            content_body="""The rotator cuff comprises four dynamic stabilizers (SITS):
1. **Supraspinatus**: Initiates humeral abduction (first 15°) and pulls the humeral head into the glenoid fossa.
2. **Infraspinatus**: Primary external rotator with the arm by the side; counters superior translation forces from deltoid.
3. **Teres Minor**: Assists in external rotation and provides posterior inferior stability during elevation.
4. **Subscapularis**: Substantial anterior stabilizer and internal rotator; prevents anterior humeral translation.

**Clinical Biomechanics Insight**: 
The rotator cuff acts as a dynamic force couple with the deltoid. While the deltoid exerts an upward shear force on the humeral head, the infraspinatus, subscapularis, and teres minor produce an inferior and medial compressive vector, seating the humeral head centered within the glenoid fossa during arm elevation.""",
            difficulty_level=DifficultyLevel.BEGINNER,
            reference="BD Chaurasia's Human Anatomy - Regional & Applied: Volume 1 (Upper Limb & Thorax)",
            is_verified=True,
        )

        content2 = Content(
            topic_id=topic_rotator.id,
            title="Clinical Practice Guidelines: Rotator Cuff Impingement & Tendinopathy",
            content_type=ContentType.CLINICAL_GUIDELINE,
            content_body="""### Subjective & Objective Examination:
- **Painful Arc**: Patient typically experiences sharp lateral shoulder pain between 60° and 120° of active abduction.
- **Diagnostic Special Tests**: 
  - *Neer Impingement Test*: Passive elevation in internal rotation compresses supraspinatus against anterior acromion.
  - *Hawkins-Kennedy Test*: Passive internal rotation at 90° flexion impinges tendon against coracoacromial ligament.
  - *Empty Can (Jobe) Test*: Assesses supraspinatus isolation and tears.

### Conservative Physiotherapy Management:
1. **Acute Phase**: Relative rest from aggravating overhead activities, cryotherapy for reactive tendon pain, isometric cuff setting at neutral.
2. **Subacute Restoration**: Scapulothoracic re-education (serratus anterior and lower trapezius activation) to restore upward rotation.
3. **Strengthening**: High-load slow resistance (HSR) protocol for eccentric-concentric strengthening of rotator cuff and periscapular stabilizers.""",
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            reference="Magee Orthopedic Physical Assessment (7th Ed.) & British Journal of Sports Medicine (BJSM Guidelines)",
            is_verified=True,
        )

        # Curated Content for Sliding Filament
        content3 = Content(
            topic_id=topic_sliding.id,
            title="Excitation-Contraction Coupling & Cross-Bridge Cycle",
            content_type=ContentType.CONCEPT,
            content_body="""The sliding filament model describes how muscle fibers generate tension and contract:
1. **Action Potential**: Propagates down the motor neuron terminal, releasing Acetylcholine (ACh) into the synaptic cleft.
2. **T-Tubule Depolarization**: Depolarization reaches the sarcoplasmic reticulum (SR), triggering Calcium release through ryanodine receptors.
3. **Troponin Binding**: Calcium binds to Troponin C, shifting Tropomyosin away from actin's myosin-binding sites.
4. **Power Stroke**: Myosin heads bind actin forming cross-bridges. ADP + Pi release produces conformational tilting of the myosin head (power stroke), sliding the thin filament toward the M-line.
5. **Detachment**: New ATP binds myosin, detaching it from actin. ATP hydrolysis re-cocks the head for the next cycle.""",
            difficulty_level=DifficultyLevel.BEGINNER,
            reference="Guyton and Hall Textbook of Medical Physiology (14th Ed.)",
            is_verified=True,
        )
        db.add_all([content1, content2, content3])
        db.commit()

        print("Seeding Practice Questions...")
        q1 = Question(
            topic_id=topic_rotator.id,
            question_text="A 42-year-old badminton player presents with shoulder pain during overhead smashes. Active abduction exhibits pain specifically between 70° and 110°. Which test specifically isolates and stresses the supraspinatus tendon?",
            question_type=QuestionType.MCQ,
            difficulty_level=DifficultyLevel.BEGINNER,
            explanation="The Jobe (Empty Can) test positions the shoulder in 90° abduction and 30° horizontal advection with full internal rotation ('thumbs down'), which isolates supraspinatus tension against downward resistance.",
            correct_answer="Jobe (Empty Can) Test",
            is_verified=True,
        )
        db.add(q1)
        db.commit()
        db.refresh(q1)

        opt1 = QuestionOption(question_id=q1.id, option_text="Hawkins-Kennedy Test", is_correct=False)
        opt2 = QuestionOption(question_id=q1.id, option_text="Jobe (Empty Can) Test", is_correct=True)
        opt3 = QuestionOption(question_id=q1.id, option_text="Speed's Test", is_correct=False)
        opt4 = QuestionOption(question_id=q1.id, option_text="Yergason's Test", is_correct=False)
        db.add_all([opt1, opt2, opt3, opt4])
        db.commit()

        print("Seeding Demo Student Progress...")
        demo_prog = StudentProgress(
            student_id=student_user.id,
            topic_id=topic_rotator.id,
            mastery_score=68.5,
            attempts=3,
            correct_attempts=2,
            confidence_score=0.75,
        )
        db.add(demo_prog)
        db.commit()

        print("Database seed completed successfully!")
        print(f"Demo Users:")
        print(f"  Student: student@physiosmart.edu / Password123!")
        print(f"  Faculty: faculty@physiosmart.edu / FacultyPass123!")
        print(f"  Admin:   admin@physiosmart.edu   / AdminPass123!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
