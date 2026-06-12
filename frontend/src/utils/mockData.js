export const MOCK_STUDENTS = [
  { student_id: "STU-001", name: "Alice Johnson",   assignment: "Midterm Essay",    risk_score: 12.5, risk_level: "LOW",      primary_vector: "Verified Clean",    confidence: 0.91 },
  { student_id: "STU-002", name: "Bob Smith",       assignment: "Midterm Essay",    risk_score: 85.2, risk_level: "HIGH",     primary_vector: "Baseline Deviation",confidence: 0.94 },
  { student_id: "STU-003", name: "Charlie Davis",   assignment: "Midterm Essay",    risk_score: 45.0, risk_level: "MEDIUM",   primary_vector: "Style Shift",       confidence: 0.78 },
  { student_id: "STU-004", name: "Diana Prince",    assignment: "Midterm Essay",    risk_score: 92.1, risk_level: "CRITICAL", primary_vector: "Baseline Deviation",confidence: 0.97 },
  { student_id: "STU-005", name: "Evan Wright",     assignment: "HW5",             risk_score: 25.6, risk_level: "LOW",      primary_vector: "Verified Clean",    confidence: 0.88 },
  { student_id: "STU-006", name: "Fiona Hill",      assignment: "HW5",             risk_score: 31.2, risk_level: "LOW",      primary_vector: "Verified Clean",    confidence: 0.85 },
  { student_id: "STU-007", name: "George Baker",    assignment: "HW5",             risk_score: 85.3, risk_level: "HIGH",     primary_vector: "Baseline Deviation",confidence: 0.92 },
  { student_id: "STU-008", name: "Hannah Clark",    assignment: "Research Paper",   risk_score: 30.6, risk_level: "LOW",      primary_vector: "Verified Clean",    confidence: 0.87 },
  { student_id: "STU-009", name: "Ian Lewis",       assignment: "Research Paper",   risk_score: 17.8, risk_level: "LOW",      primary_vector: "Verified Clean",    confidence: 0.90 },
  { student_id: "STU-010", name: "Julia King",      assignment: "HW5",             risk_score: 91.6, risk_level: "CRITICAL", primary_vector: "Baseline Deviation",confidence: 0.96 },
  { student_id: "STU-011", name: "Kevin Nash",      assignment: "Final Project",    risk_score: 67.4, risk_level: "MEDIUM",   primary_vector: "Vocab Expansion",   confidence: 0.81 },
  { student_id: "STU-012", name: "Laura Chen",      assignment: "Final Project",    risk_score: 78.9, risk_level: "HIGH",     primary_vector: "Style Distance",    confidence: 0.89 },
  { student_id: "STU-013", name: "Marcus Reed",     assignment: "Research Paper",   risk_score: 55.3, risk_level: "MEDIUM",   primary_vector: "Timing Anomaly",    confidence: 0.76 },
  { student_id: "STU-014", name: "Nina Patel",      assignment: "Final Project",    risk_score: 88.7, risk_level: "HIGH",     primary_vector: "Baseline Deviation",confidence: 0.93 },
  { student_id: "STU-015", name: "Oscar Flynn",     assignment: "Midterm Essay",    risk_score: 42.1, risk_level: "MEDIUM",   primary_vector: "POS Shift",         confidence: 0.79 },
];

export const mockStudents = MOCK_STUDENTS;

const totalMonitored = MOCK_STUDENTS.length;
const flaggedActivity = MOCK_STUDENTS.filter(s => s.risk_score > 40).length;
const highRisk = MOCK_STUDENTS.filter(s => s.risk_score > 70).length;
const avgRisk = parseFloat((MOCK_STUDENTS.reduce((a,b) => a + b.risk_score, 0) / MOCK_STUDENTS.length).toFixed(1));

export const mockStats = {
  total_students: totalMonitored,
  flagged_count: flaggedActivity,
  high_risk_count: highRisk,
  avg_risk_score: avgRisk
};

export const mockStudentDetail = {
  student_id: "STU-004",
  name: "Diana Prince",
  confidence: "High",
  submissions: [
    { assignment_id: "Draft 1", risk_score: 20, flagged: false },
    { assignment_id: "Draft 2", risk_score: 25, flagged: false },
    { assignment_id: "Final", risk_score: 92.1, flagged: true }
  ],
  latest_shap_breakdown: {
    "flesch_reading_ease": 1.5,
    "passive_voice_rate": 0.8,
    "sentence_complexity": -0.2,
    "vocabulary_richness": 2.1,
    "timing_anomaly": 1.1
  },
  latest_natural_language_reason: "Student's vocabulary richness deviated significantly from their baseline, and the submission occurred 4 hours past their usual operational window."
};

export const MOCK_AI_RESULT = {
  risk_score: 91,
  confidence: 0.94,
  risk_level: "CRITICAL",
  processing_time: "2.3s",
  shap_contributions: [
    { feature: "Style Distance",       value: 31  },
    { feature: "Vocab Richness Jump",  value: 22  },
    { feature: "Sentence Uniformity",  value: 19  },
    { feature: "Personal Voice",       value: -14 },
    { feature: "Passive Voice Rate",   value: 11  },
    { feature: "Readability Jump",     value: 8   },
  ],
  nl_explanation: "This document exhibits strong indicators of AI-generated content. Writing style deviates 72% from human baseline patterns. Vocabulary richness is atypically high with unnaturally uniform sentence structure — a hallmark of large language model output.",
  recommended_action: "Schedule oral examination immediately. Request handwritten sample for stylometric comparison. Do not grade until authenticity is confirmed.",
  radar_data: [
    { metric: "Style Score",    docA: 95, docB: 28 },
    { metric: "Vocab Richness", docA: 88, docB: 45 },
    { metric: "Consistency",    docA: 92, docB: 30 },
    { metric: "Personal Voice", docA: 12, docB: 85 },
    { metric: "Timing Pattern", docA: 58, docB: 80 },
    { metric: "Sub. Norm",      docA: 52, docB: 82 },
  ]
};

export const MOCK_HUMAN_RESULT = {
  risk_score: 23,
  confidence: 0.91,
  risk_level: "LOW",
  processing_time: "2.1s",
  shap_contributions: [
    { feature: "Style Distance",       value: -18 },
    { feature: "Vocab Richness Jump",  value: 5   },
    { feature: "Sentence Uniformity",  value: -22 },
    { feature: "Personal Voice",       value: 28  },
    { feature: "Passive Voice Rate",   value: -12 },
    { feature: "Readability Jump",     value: 3   },
  ],
  nl_explanation: "This document shows authentic human writing patterns. Natural stylistic inconsistencies, strong personal voice markers, and varied sentence structure all align with this student's historical baseline. No anomalies detected.",
  recommended_action: "No action required. Document appears to be authentic student work. File for records.",
  radar_data: [
    { metric: "Style Score",    docA: 95, docB: 28 },
    { metric: "Vocab Richness", docA: 88, docB: 45 },
    { metric: "Consistency",    docA: 92, docB: 30 },
    { metric: "Personal Voice", docA: 12, docB: 85 },
    { metric: "Timing Pattern", docA: 58, docB: 80 },
    { metric: "Sub. Norm",      docA: 52, docB: 82 },
  ]
};

export const MOCK_COMPARISON = {
  document_a: MOCK_AI_RESULT,
  document_b: MOCK_HUMAN_RESULT,
  divergence_score: 87,
  forensic_conclusion: "Documents show 87% stylistic divergence. Document A matches AI generation patterns (GPT-4 style) with 94% confidence — uniform syntax, elevated vocabulary, and absence of personal voice markers. Document B demonstrates authentic human authorship with natural variation and consistent baseline alignment."
};
