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
import json
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.academic import Subject, Unit, Topic, DifficultyLevel
from app.models.content import Content, ContentType
from app.models.question import Question, QuestionOption, QuestionType
from app.models.clinical_case import ClinicalCase
from app.models.viva import VivaQuestion
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

        # =========================================================================
        # PART 3: CONCEPT CONTENT, VIVA QUESTIONS & CLINICAL CASES
        # =========================================================================
        print("Seeding Part 3: Concept Learning Content...")
        def add_content(topic_id, title, c_type, body, ref=""):
            exists = db.query(Content).filter(Content.title == title).first()
            if not exists:
                c = Content(
                    topic_id=topic_id,
                    title=title,
                    content_type=c_type,
                    content_body=body,
                    reference=ref,
                    is_verified=True,
                )
                db.add(c)
                db.commit()

        add_content(
            topic_rotator.id,
            "Rotator Cuff Functional Anatomy & Scapulohumeral Rhythm",
            ContentType.CONCEPT,
            "The rotator cuff consists of Supraspinatus, Infraspinatus, Teres Minor, and Subscapularis (SITS).\n\n"
            "• Supraspinatus initiates abduction (0-15°) and pulls the humeral head into the glenoid.\n"
            "• Infraspinatus & Teres Minor dynamically externally rotate and exert inferior glide.\n"
            "• Subscapularis internally rotates and anteriorly stabilizes the humeral head.\n\n"
            "Force Coupling: The primary action of the cuff is not pure movement generation, but dynamic glenohumeral compression countering the upward shear force of the deltoid.",
            "Kisner & Colby: Therapeutic Exercise - Foundations and Techniques, 7th Ed."
        )

        add_content(
            topic_rotator.id,
            "Clinical Guidelines: Subacromial Impingement Rehabilitation Protocol",
            ContentType.CLINICAL_GUIDELINE,
            "Phase 1: Protection & Pain Relief (Weeks 0-2)\n"
            "• Relative rest, avoid active elevation above 90°.\n"
            "• Cryotherapy & postural education (retract scapulae).\n"
            "• Submaximal isometric rotator cuff exercises at neutral.\n\n"
            "Phase 2: Dynamic Strengthening (Weeks 2-6)\n"
            "• Scapular upward rotator strengthening (Serratus anterior, Lower trapezius).\n"
            "• Elastic band external & internal rotation with towel roll under armpit.\n"
            "• Neuromuscular control & rhythmic stabilization.",
            "American Physical Therapy Association (APTA) Clinical Practice Guidelines"
        )

        add_content(
            topic_brachial.id,
            "Topographical Organization & Pathology of the Brachial Plexus",
            ContentType.CONCEPT,
            "The brachial plexus is formed by anterior rami of C5-T1:\n"
            "• Roots (5): C5, C6, C7, C8, T1\n"
            "• Trunks (3): Upper (C5-C6), Middle (C7), Lower (C8-T1)\n"
            "• Divisions (6): 3 Anterior (flexor), 3 Posterior (extensor)\n"
            "• Cords (3): Lateral, Posterior, Medial (named relative to axillary artery)\n"
            "• Terminal branches: Musculocutaneous, Axillary, Radial, Median, Ulnar.\n\n"
            "Clinical Tractions: Erb-Duchenne palsy involves C5-C6 avulsion causing waiter's tip deformity. Klumpke palsy involves C8-T1 avulsion resulting in claw hand deformity.",
            "Magee: Orthopedic Physical Assessment, 6th Ed."
        )

        add_content(
            topic_knee.id,
            "Knee Joint Kinematics & The Screw-Home Mechanism",
            ContentType.CONCEPT,
            "The knee joint is a bicondylar synovial joint reinforced by key static restraints:\n"
            "• ACL: Resists anterior tibial translation and internal tibial rotation.\n"
            "• PCL: Resists posterior tibial translation in flexion.\n"
            "• MCL & LCL: Counter valgus and varus stress, respectively.\n\n"
            "Screw-Home Mechanism:\n"
            "During terminal 15-20° of extension in open chain, the tibia externally rotates on the fixed femur. In closed chain, the femur internally rotates on the fixed tibia. Popliteus muscle laterally rotates femur to unlock the knee for flexion initiation.",
            "Norkin & Levangie: Joint Structure and Function, 5th Ed."
        )

        add_content(
            topic_sliding.id,
            "Biophysical Mechanics of the Sliding Filament Theory",
            ContentType.CONCEPT,
            "Muscle contraction operates via cyclic interaction between thin actin and thick myosin filaments:\n"
            "1. Action potential propagates down T-tubules triggering Ca2+ release from sarcoplasmic reticulum.\n"
            "2. Ca2+ binds Troponin-C, producing allosteric shift in Tropomyosin to uncover myosin binding sites.\n"
            "3. Myosin head binds actin, releases inorganic phosphate, and performs the 45° Power Stroke.\n"
            "4. A new ATP binds myosin to break cross-bridge; ATP hydrolysis by myosin ATPase re-cocks the head.",
            "Guyton and Hall Textbook of Medical Physiology, 14th Ed."
        )

        print("Seeding Part 3: Viva Voce Questions...")
        def add_viva(topic_id, q_text, concepts, model_ans, explanation, diff=DifficultyLevel.BEGINNER):
            exists = db.query(VivaQuestion).filter(VivaQuestion.question_text == q_text).first()
            if not exists:
                v = VivaQuestion(
                    topic_id=topic_id,
                    question_text=q_text,
                    expected_concepts=json.dumps(concepts),
                    model_answer=model_ans,
                    explanation=explanation,
                    difficulty_level=diff,
                    is_verified=True,
                )
                db.add(v)
                db.commit()

        add_viva(
            topic_rotator.id,
            "Explain the dynamic stabilization mechanism of the rotator cuff force couple during shoulder abduction.",
            ["Supraspinatus initiates abduction", "Inferior force couple counters deltoid shear", "Humeral head depression in glenoid fossa", "Concentric compression against glenoid labrum"],
            "During arm elevation, the powerful deltoid generates an upward vertical shear force. The inferior rotator cuff (infraspinatus, teres minor, subscapularis) produces a downward force couple that depresses and centers the humeral head inside the shallow glenoid fossa, creating a stable fulcrum and preventing subacromial impingement.",
            "Focus on the force couple balance between the deltoid and inferior cuff muscles.",
            DifficultyLevel.INTERMEDIATE
        )

        add_viva(
            topic_rotator.id,
            "How would you clinically differentiate between Supraspinatus Tendinopathy and Subacromial Bursitis?",
            ["Painful arc between 70 and 120 degrees", "Resisted isometric abduction test pain", "Passive movement pain free in tendinopathy without compression", "Tenderness over greater tubercle"],
            "Supraspinatus tendinopathy typically demonstrates localized tenderness over the greater tubercle, painful arc, and sharp pain during resisted isometric abduction (Empty Can test). In subacromial bursitis, pain is more diffuse over the lateral deltoid and passive non-contractile compression produces severe distress without muscle contraction.",
            "Differentiating contractile vs non-contractile tissue via Cyriax selective tissue tension.",
            DifficultyLevel.INTERMEDIATE
        )

        add_viva(
            topic_brachial.id,
            "Describe the clinical signs, pathomechanics, and physical deformity in Erb-Duchenne Palsy.",
            ["Traction of upper trunk C5 and C6 roots", "Paralysis of abductors and external rotators", "Arm adducted, internally rotated, and forearm pronated", "Waiter's tip deformity"],
            "Erb's palsy is caused by downward traction on the shoulder or lateral neck stretching during difficult delivery or trauma, tearing C5-C6 nerve roots. Because abductors, external rotators, and forearm supinators are paralyzed while antagonists remain unopposed, the upper limb adopts the classic 'waiter's tip' posture (adducted, medially rotated, extended, pronated).",
            "Key roots are C5 and C6 involving suprascapular, axillary, and musculocutaneous nerves.",
            DifficultyLevel.BEGINNER
        )

        add_viva(
            topic_knee.id,
            "Explain why the Lachman test is clinically superior to the Anterior Drawer test for evaluating an acute ACL tear.",
            ["Performed at 20 to 30 degrees of knee flexion", "Eliminates protective hamstring muscle guarding", "Minimizes posterior horn meniscal wedge resistance", "Direct anterior tibial translation"],
            "The Lachman test is performed at 20-30° of flexion, which eliminates the secondary stabilizing effect of the posterior horn of the medial meniscus and reduces protective hamstring spasm that occurs at 90° in acute swollen knees. This makes Lachman significantly more sensitive and specific (95%+) than the anterior drawer test.",
            "Biomechanics of ligamentous orientation at 30° vs 90° flexion.",
            DifficultyLevel.INTERMEDIATE
        )

        add_viva(
            topic_sliding.id,
            "What is the dual physiological role of ATP in the actin-myosin cross-bridge cycle and rigor mortis?",
            ["ATP hydrolysis energizes and cocks myosin head", "Binding of new ATP molecule triggers cross-bridge detachment", "Absence of ATP prevents detachment causing rigor mortis", "ATP fuels sarcoplasmic reticulum calcium pump"],
            "ATP has two critical roles: 1) Hydrolysis of ATP into ADP + Pi by myosin ATPase re-cocks the myosin head into high-energy conformation for the power stroke. 2) The subsequent binding of a fresh ATP molecule is obligatory to break the actin-myosin bond. When cellular ATP is depleted post-mortem, myosin heads remain irreversibly locked to actin, resulting in rigor mortis.",
            "Cross-bridge dissociation requires ATP binding; re-energizing requires hydrolysis.",
            DifficultyLevel.INTERMEDIATE
        )

        print("Seeding Part 3: Clinical Reasoning Cases...")
        def add_case(topic_id, title, desc, age, gender, complaint, symptoms, hist, findings, hypo, assess, mgmt, concepts, diff=DifficultyLevel.INTERMEDIATE):
            exists = db.query(ClinicalCase).filter(ClinicalCase.title == title).first()
            if not exists:
                c = ClinicalCase(
                    topic_id=topic_id,
                    title=title,
                    case_description=desc,
                    patient_age=age,
                    patient_gender=gender,
                    chief_complaint=complaint,
                    symptoms=symptoms,
                    medical_history=hist,
                    assessment_findings=findings,
                    expected_hypothesis=hypo,
                    expected_assessments=assess,
                    expected_management=mgmt,
                    key_concepts=json.dumps(concepts),
                    difficulty_level=diff,
                    is_verified=True,
                )
                db.add(c)
                db.commit()

        add_case(
            topic_rotator.id,
            "Case #1: Chronic Shoulder Pain & Painful Arc in an Overhead Badminton Athlete",
            "A 42-year-old amateur badminton athlete presents with persistent right anterolateral shoulder discomfort that has worsened over 3 months, particularly during overhead smashes and night sleeping on the affected side.",
            42,
            "Male",
            "Aching pain in right anterolateral shoulder during overhead movements and night sleeping.",
            "Mid-range elevation pain, localized warmth, difficulty lifting arm above head, weakness with overhead tasks.",
            "No prior shoulder surgery or fracture. Desk-bound software engineer with weekend competitive racket sports.",
            "Active ROM: Painful arc between 70° and 120°. Passive ROM full with end-range impingement pain. Neer test positive, Hawkins-Kennedy test positive. Empty Can test reproduces lateral shoulder pain with mild weakness (4/5).",
            "Subacromial impingement syndrome with supraspinatus tendinopathy",
            "Neer test; Hawkins-Kennedy test; Empty Can test (Jobe's); Scapular dyskinesis evaluation; Cervical spine screen",
            "Relative rest & avoidance of aggravating overhead elevation; Cryotherapy for acute flare-ups; Isometric rotator cuff strengthening; Scapular stabilization exercises (Serratus anterior, lower trapezius); Postural ergonomic modification",
            ["Subacromial impingement", "Supraspinatus tendinopathy", "Painful arc syndrome", "Neer test", "Hawkins-Kennedy", "Rotator cuff strengthening", "Scapular stabilization"]
        )

        add_case(
            topic_knee.id,
            "Case #2: Acute Non-Contact Deceleration Knee 'Pop' with Hemarthrosis in a Football Player",
            "A 24-year-old collegiate football player experiences a sudden deceleration, pivot, and hyperextension injury on a turf field. He reports hearing a loud 'pop' inside the right knee followed by immediate collapse and inability to continue play.",
            24,
            "Male",
            "Severe right knee pain, rapid joint swelling, and giving-way sensation upon weight bearing.",
            "Rapid joint effusion within 2 hours, inability to bear weight without crutches, sensation of knee 'slipping'.",
            "Unremarkable. No prior knee ligamentous or meniscal injury.",
            "Gross joint effusion (hemarthrosis positive). Lachman test positive with soft mushy end-point and >6mm anterior tibial translation. Anterior drawer test positive. McMurray test negative. Varus and valgus stress tests stable at 0° and 30°.",
            "Acute Anterior Cruciate Ligament (ACL) high-grade or complete rupture",
            "Lachman test; Pivot-Shift test; Knee MRI study; Joint effusion ballottement; Hamstring and quadriceps girth comparison",
            "Immediate RICE protocol (Rest, Ice, Compression, Elevation); Hinged knee brace in extension for ambulation; Early quadriceps isometric sets and straight leg raises; Active-assisted knee flexion to 90°; Referral for orthopedic surgical consultation",
            ["ACL tear", "Anterior Cruciate Ligament rupture", "Hemarthrosis", "Lachman test", "Pivot shift", "RICE protocol", "Quadriceps activation", "Early range of motion"]
        )

        add_case(
            topic_brachial.id,
            "Case #3: Upper Limb Weakness Following a High-Velocity Motorcycle Traction Fall",
            "A 28-year-old motorcyclist suffered a shoulder impact with forceful lateral neck deviation to the opposite side. Post-trauma, he is unable to lift the right arm away from his side or bend his elbow.",
            28,
            "Male",
            "Complete inability to lift right shoulder or bend the right elbow.",
            "Loss of shoulder abduction, loss of elbow flexion, numbness over the lateral shoulder deltoid region and radial forearm.",
            "Emergency department X-ray cleared cervical fracture. Clavicle contusion noted.",
            "Right upper limb hangs limp in adduction and internal rotation with forearm extended and pronated ('waiter's tip' posture). Deltoid, supraspinatus, infraspinatus, and biceps brachii strength is 0/5. Biceps jerk absent. Sensory loss over C5-C6 dermatomes.",
            "Upper Trunk Brachial Plexus Traction Injury (Erb's Palsy pattern, C5-C6 lesion)",
            "Electromyography (EMG) and Nerve Conduction Velocity (NCV) studies; Brachial plexus MRI; Manual Muscle Testing (MMT) baseline; Sensory dermatomal mapping",
            "Supportive arm sling to prevent inferior glenohumeral subluxation; Daily gentle passive ROM to shoulder, elbow, and wrist to prevent contractures; Electrical stimulation to denervated muscle bellies; Patient education on skin protection over anesthetic zones",
            ["Erb's palsy", "Upper trunk brachial plexus lesion", "C5 and C6 nerve roots", "Waiter's tip deformity", "Passive ROM maintenance", "Subluxation prevention sling", "Electrical stimulation"]
        )

        print("Database seeding completed successfully for Part 3!")
    finally:
        db.close()



if __name__ == "__main__":
    seed_database()
