import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Stethoscope, 
  User, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Loader2, 
  RotateCcw,
  BookOpen,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { clinicalCaseService } from '../services/clinicalCaseService';
import { ClinicalCase, ClinicalCaseResult } from '../types';

export const ClinicalCasePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-stage student answers
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [hypothesisAnswer, setHypothesisAnswer] = useState('');
  const [assessmentAnswer, setAssessmentAnswer] = useState('');
  const [managementAnswer, setManagementAnswer] = useState('');

  // Result state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ClinicalCaseResult | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      if (!caseId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await clinicalCaseService.getCase(parseInt(caseId, 10));
        setClinicalCase(data);
      } catch (err: any) {
        console.error('Failed to load clinical case:', err);
        setError(err?.response?.data?.detail || 'Unable to load clinical case.');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId]);

  const handleSubmitCase = async () => {
    if (!caseId) return;
    try {
      setSubmitting(true);
      const res = await clinicalCaseService.submitCaseReasoning(parseInt(caseId, 10), {
        hypothesis_answer: hypothesisAnswer,
        assessment_answer: assessmentAnswer,
        management_answer: managementAnswer,
      });
      setResult(res);
      setActiveStage(5); // Jump to feedback summary
    } catch (err: any) {
      console.error('Failed to submit clinical reasoning:', err);
      alert(err?.response?.data?.detail || 'Error submitting case reasoning.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setHypothesisAnswer('');
    setAssessmentAnswer('');
    setManagementAnswer('');
    setResult(null);
    setActiveStage(1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-stone-600 font-medium">Loading clinical case profile...</p>
      </div>
    );
  }

  if (error || !clinicalCase) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <Stethoscope className="w-12 h-12 text-teal-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-800">
            {error ? 'Case Loading Error' : 'Case Not Found'}
          </h2>
          <p className="text-stone-600 text-sm">
            {error || 'The requested clinical reasoning case could not be located.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate('/practice')}
              className="px-4 py-2 bg-[#0d3834] text-white rounded-lg text-sm font-medium hover:bg-[#124b46]"
            >
              Browse All Practice Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#0d3834] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full">
          <Stethoscope className="w-3.5 h-3.5" />
          Clinical Reasoning Flow
        </div>
      </div>

      {/* Case Header */}
      <div className="bg-[#0d3834] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200 bg-teal-900/60 px-2.5 py-1 rounded-md">
              Physiotherapy Clinical Simulation
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#faf7f2] mt-2">
              {clinicalCase.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-stone-200">
            <div>
              <span className="text-teal-300 block">Patient Age</span>
              <span className="font-bold text-white text-sm">
                {clinicalCase.patient_age || 45} yrs
              </span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="text-teal-300 block">Gender</span>
              <span className="font-bold text-white text-sm">
                {clinicalCase.patient_gender || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Stepper Tabs */}
      <div className="bg-white rounded-xl p-2 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-1">
        {[
          { num: 1, label: 'Patient Profile' },
          { num: 2, label: 'Form Hypothesis' },
          { num: 3, label: 'Assessment' },
          { num: 4, label: 'Management' },
          { num: 5, label: 'Feedback', disabled: !result },
        ].map(stage => {
          const isCurrent = activeStage === stage.num;
          return (
            <button
              key={stage.num}
              onClick={() => setActiveStage(stage.num as any)}
              disabled={stage.disabled}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isCurrent
                  ? 'bg-[#0d3834] text-white shadow-sm'
                  : stage.disabled
                  ? 'text-stone-300 cursor-not-allowed'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-teal-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {stage.num}
              </span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* STAGE 1: PATIENT PROFILE & FINDINGS */}
      {activeStage === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Patient Case Presentation
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Carefully review the patient history, symptoms, and objective physical findings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chief Complaint & Symptoms */}
            <div className="p-5 rounded-xl bg-[#faf7f2] border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0d3834] uppercase tracking-wider">
                <Activity className="w-4 h-4 text-teal-600" />
                Chief Complaint & Symptoms
              </div>
              <div>
                <span className="text-xs text-stone-500 block">Chief Complaint:</span>
                <p className="text-sm font-semibold text-stone-900">
                  {clinicalCase.chief_complaint || 'Shoulder pain during overhead reach'}
                </p>
              </div>
              <div>
                <span className="text-xs text-stone-500 block">Symptom Characteristics:</span>
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                  {clinicalCase.symptoms || clinicalCase.description}
                </p>
              </div>
            </div>

            {/* Medical History & Findings */}
            <div className="p-5 rounded-xl bg-[#faf7f2] border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0d3834] uppercase tracking-wider">
                <FileText className="w-4 h-4 text-teal-600" />
                History & Objective Findings
              </div>
              <div>
                <span className="text-xs text-stone-500 block">Relevant History:</span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {clinicalCase.medical_history || 'Recreational badminton player; sudden exacerbation 3 weeks ago.'}
                </p>
              </div>
              <div>
                <span className="text-xs text-stone-500 block">Initial Physical Assessment:</span>
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                  {clinicalCase.assessment_findings || 'Painful arc between 70°-120° of abduction.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              onClick={() => setActiveStage(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d3834] text-white rounded-xl text-sm font-semibold hover:bg-[#124b46] transition-colors"
            >
              Next: Form Hypothesis
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: FORM HYPOTHESIS */}
      {activeStage === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Clinical Step 1 of 3
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">
              Formulate Diagnostic Hypothesis
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Based on the symptoms and history, what is the most likely clinical condition or dysfunction?
            </p>
          </div>

          <textarea
            rows={5}
            value={hypothesisAnswer}
            onChange={(e) => setHypothesisAnswer(e.target.value)}
            placeholder="E.g., Subacromial Impingement Syndrome with supraspinatus tendinopathy..."
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm text-stone-900 bg-[#faf7f2] placeholder-stone-400"
          />

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setActiveStage(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Patient Profile
            </button>
            <button
              onClick={() => setActiveStage(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d3834] text-white rounded-xl text-sm font-semibold hover:bg-[#124b46]"
            >
              Next: Select Assessments
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: SELECT ASSESSMENTS */}
      {activeStage === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Clinical Step 2 of 3
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">
              Select Assessment & Special Tests
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              What specific physical examination tests or differential evaluations would you perform to confirm your hypothesis?
            </p>
          </div>

          <textarea
            rows={5}
            value={assessmentAnswer}
            onChange={(e) => setAssessmentAnswer(e.target.value)}
            placeholder="E.g., Neer's test, Hawkins-Kennedy impingement test, Empty Can test for supraspinatus..."
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm text-stone-900 bg-[#faf7f2] placeholder-stone-400"
          />

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setActiveStage(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Hypothesis
            </button>
            <button
              onClick={() => setActiveStage(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d3834] text-white rounded-xl text-sm font-semibold hover:bg-[#124b46]"
            >
              Next: Plan Management
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: MANAGEMENT PLAN */}
      {activeStage === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Clinical Step 3 of 3
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">
              Initial Physiotherapy Management Protocol
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              What is your immediate treatment strategy, pain relief measures, and therapeutic exercise prescription?
            </p>
          </div>

          <textarea
            rows={5}
            value={managementAnswer}
            onChange={(e) => setManagementAnswer(e.target.value)}
            placeholder="E.g., Relative rest, cryotherapy for acute pain, isometric rotator cuff strengthening, scapular stabilization..."
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm text-stone-900 bg-[#faf7f2] placeholder-stone-400"
          />

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setActiveStage(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Assessments
            </button>
            <button
              onClick={handleSubmitCase}
              disabled={submitting || (!hypothesisAnswer && !assessmentAnswer && !managementAnswer)}
              className="inline-flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluating Reasoning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Case Solution
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: COMPREHENSIVE FEEDBACK */}
      {activeStage === 5 && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Performance Card */}
          <div className="bg-[#0d3834] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                  Evaluation Summary
                </span>
                <h2 className="text-2xl font-bold text-[#faf7f2] mt-1">
                  Clinical Reasoning Assessment
                </h2>
              </div>
              <div className="flex items-center gap-3 bg-black/20 px-5 py-3 rounded-xl border border-white/10 self-start sm:self-auto">
                <span className="text-xs text-teal-200">Reasoning Score:</span>
                <span className="text-2xl font-black text-white">
                  {result.total_score}
                </span>
                <span className="text-xs text-teal-300">/ {result.max_score}</span>
              </div>
            </div>
          </div>

          {/* Personalized Recommendation */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-teal-900">Clinical Recommendation</h4>
              <p className="text-sm text-teal-800 mt-1">{result.learning_recommendation}</p>
            </div>
          </div>

          {/* Stage Breakdowns */}
          <div className="grid grid-cols-1 gap-6">
            {/* 1. Hypothesis Feedback */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  1. Diagnostic Hypothesis Feedback
                </h3>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                  {result.hypothesis_feedback.score} / {result.hypothesis_feedback.max_score} pts
                </span>
              </div>
              <p className="text-xs text-stone-600">{result.hypothesis_feedback.feedback}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identified Points
                  </span>
                  {result.hypothesis_feedback.points_identified.length > 0 ? (
                    <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                      {result.hypothesis_feedback.points_identified.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-stone-400 italic">None matched</span>
                  )}
                </div>

                <div className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Suggested Key Points
                  </span>
                  <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                    {(result.hypothesis_feedback.expected_points || []).map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Assessment Feedback */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  2. Assessment & Examination Feedback
                </h3>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                  {result.assessment_feedback.score} / {result.assessment_feedback.max_score || 30} pts
                </span>
              </div>
              <p className="text-xs text-stone-600">{result.assessment_feedback.feedback}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identified Points
                  </span>
                  {result.assessment_feedback.points_identified.length > 0 ? (
                    <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                      {result.assessment_feedback.points_identified.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-stone-400 italic">None matched</span>
                  )}
                </div>

                <div className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Expected Protocols
                  </span>
                  <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                    {(result.assessment_feedback.expected_points || []).map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Management Feedback */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  3. Management Protocol Feedback
                </h3>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                  {result.management_feedback.score} / {result.management_feedback.max_score || 35} pts
                </span>
              </div>
              <p className="text-xs text-stone-600">{result.management_feedback.feedback}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identified Points
                  </span>
                  {result.management_feedback.points_identified.length > 0 ? (
                    <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                      {result.management_feedback.points_identified.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-stone-400 italic">None matched</span>
                  )}
                </div>

                <div className="text-xs p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Expected Protocols
                  </span>
                  <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                    {(result.management_feedback.expected_points || []).map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Case
            </button>

            <button
              onClick={() => navigate('/study-plan')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d3834] text-white rounded-lg text-sm font-semibold hover:bg-[#124b46]"
            >
              Back to Study Plan
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
