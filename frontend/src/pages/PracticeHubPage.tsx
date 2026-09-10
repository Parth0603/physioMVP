import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  HelpCircle, 
  Stethoscope, 
  ArrowRight, 
  Loader2, 
  BookOpen,
  Filter
} from 'lucide-react';
import { academicService } from '../services/academicService';
import { clinicalCaseService } from '../services/clinicalCaseService';
import { Subject, Unit, Topic, ClinicalCase } from '../types';

export const PracticeHubPage: React.FC = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Active tab: 'all' | 'mcq' | 'viva' | 'case'
  const [activeTab, setActiveTab] = useState<'all' | 'mcq' | 'viva' | 'case'>('all');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [subList, cases] = await Promise.all([
          academicService.getSubjects(),
          clinicalCaseService.getCases(),
        ]);
        setSubjects(subList);
        setClinicalCases(cases);
        if (subList.length > 0) {
          setSelectedSubjectId(subList[0].id);
        }
      } catch (err) {
        console.error('Failed to load practice hub initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // When subject changes, fetch units
  useEffect(() => {
    if (!selectedSubjectId) return;
    const fetchUnits = async () => {
      try {
        const uList = await academicService.getUnitsBySubject(selectedSubjectId);
        setUnits(uList);
        if (uList.length > 0) {
          setSelectedUnitId(uList[0].id);
        } else {
          setSelectedUnitId(null);
          setTopics([]);
        }
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };
    fetchUnits();
  }, [selectedSubjectId]);

  // When unit changes, fetch topics
  useEffect(() => {
    if (!selectedUnitId) {
      setTopics([]);
      return;
    }
    const fetchTopics = async () => {
      try {
        const tList = await academicService.getTopicsByUnit(selectedUnitId);
        setTopics(tList);
      } catch (err) {
        console.error('Failed to fetch topics:', err);
      }
    };
    fetchTopics();
  }, [selectedUnitId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-stone-600 font-medium">Loading Practice & Clinical Case Repository...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-[#0d3834] text-white rounded-2xl p-6 sm:p-10 shadow-sm border border-stone-200">
        <div className="max-w-3xl space-y-3">
          <div className="inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-teal-800 text-teal-200">
            Practice & Case Arena
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#faf7f2]">
            Practice, Viva & Clinical Reasoning
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Consolidate your academic knowledge through rigorous multiple choice questions, viva voce simulations, and real physiotherapy clinical cases.
          </p>
        </div>
      </div>

      {/* Mode Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'mcq', label: 'MCQ Practice' },
            { id: 'viva', label: 'Viva Simulator' },
            { id: 'case', label: 'Clinical Cases' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0d3834] text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <select
            value={selectedSubjectId || ''}
            onChange={(e) => setSelectedSubjectId(parseInt(e.target.value, 10))}
            className="text-xs font-semibold bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-1 focus:ring-teal-600"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {units.length > 0 && (
            <select
              value={selectedUnitId || ''}
              onChange={(e) => setSelectedUnitId(parseInt(e.target.value, 10))}
              className="text-xs font-semibold bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-1 focus:ring-teal-600 max-w-[200px] truncate"
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Clinical Cases Section (if tab is 'all' or 'case') */}
      {(activeTab === 'all' || activeTab === 'case') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-700" />
              Clinical Reasoning Patient Cases
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {clinicalCases.length} Curated Cases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clinicalCases.map(c => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                      Patient Simulation
                    </span>
                    <span className="text-xs text-stone-500">
                      Age: {c.patient_age || 45} | {c.patient_gender || 'M/F'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 group-hover:text-[#0d3834] transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {c.chief_complaint ? `Chief Complaint: ${c.chief_complaint}. ` : ''}
                    {c.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-400">
                    5-Stage Reasoning Protocol
                  </span>
                  <button
                    onClick={() => navigate(`/practice/case/${c.id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d3834] text-white rounded-lg text-xs font-semibold hover:bg-[#124b46] transition-colors"
                  >
                    Solve Case
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Practice Items (MCQ & Viva) */}
      {(activeTab === 'all' || activeTab === 'mcq' || activeTab === 'viva') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              Topic Practice & Viva Simulator
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {topics.length} Topics in Current Unit
            </span>
          </div>

          {topics.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-stone-500 text-sm">
              No topics found in the selected unit. Please select another subject or unit above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map(t => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Topic Module
                    </span>
                    <h3 className="text-base font-bold text-stone-900">
                      {t.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {t.description || 'Core syllabus topic practice and viva evaluation.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    {(activeTab === 'all' || activeTab === 'mcq') && (
                      <button
                        onClick={() => navigate(`/practice/mcq/${t.id}`)}
                        className="w-full py-2 px-3 rounded-lg border border-teal-200 bg-teal-50 text-teal-900 text-xs font-semibold hover:bg-teal-100 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          Practice MCQs
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {(activeTab === 'all' || activeTab === 'viva') && (
                      <button
                        onClick={() => navigate(`/practice/viva/${t.id}`)}
                        className="w-full py-2 px-3 rounded-lg border border-stone-200 bg-[#faf7f2] text-stone-800 text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
                          Start Viva Voce
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/learn/${t.id}`)}
                      className="w-full py-1.5 text-center text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      Read Concept Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
