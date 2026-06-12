import axios from 'axios';
import { mockStats, mockStudents, mockStudentDetail, MOCK_AI_RESULT, MOCK_HUMAN_RESULT } from '../utils/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

export const fetchDashboardStats = async () => {
  try {
    const { data } = await apiClient.get('/api/dashboard/stats');
    return data;
  } catch {
    console.warn("API offline, using mock stats");
    return mockStats;
  }
};

export const fetchStudents = async () => {
  try {
    const { data } = await apiClient.get('/api/students');
    return data;
  } catch {
    console.warn("API offline, using mock students");
    return mockStudents;
  }
};

export const fetchStudentDetail = async (studentId) => {
  try {
    const { data } = await apiClient.get(`/api/student/${studentId}`);
    return data;
  } catch {
    console.warn(`API offline, using mock detail for ${studentId}`);
    return mockStudentDetail;
  }
};

export const analyzeDocument = async (formData) => {
  try {
    const { data } = await apiClient.post('/api/analyze-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch {
    console.warn("API offline, using mock single analysis");
    return new Promise(resolve => setTimeout(() => resolve(formData.get('doc_type') === 'ai' ? MOCK_AI_RESULT : MOCK_HUMAN_RESULT), 2000));
  }
};

export const analyzeComparison = async (formData) => {
  try {
    const { data } = await apiClient.post('/api/analyze-comparison', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch {
    console.warn("API offline, using mock comparison analysis");
    return new Promise(resolve => setTimeout(() => resolve({
      document_a: MOCK_AI_RESULT,
      document_b: MOCK_HUMAN_RESULT,
      divergence_score: 87,
      forensic_conclusion: "Documents show 87% stylistic divergence. Document A matches AI generation patterns (GPT-style) with 94% confidence. Document B shows authentic human writing with natural inconsistencies and personal voice."
    }), 2000));
  }
};
