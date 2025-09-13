import axios from 'axios';

// Base API configuration matching backend gateway
const API_BASE = "http://localhost:8765";
const quizBase = `${API_BASE}/quiz/`;
const questionBase = `${API_BASE}/question`;
const authBase = `${API_BASE}/auth`;

// Create axios instance with interceptors for auth
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (credentials) => 
  axios.post(`${authBase}/login`, credentials);

export const register = (userData) => 
  axios.post(`${authBase}/register`, userData);

// Quiz APIs - matching backend endpoints
export const createQuiz = (data) => {
  // Backend expects: { categoryName, numQuestions, title }
  return apiClient.post(`${quizBase}/create`, data);
};

export const getQuizQuestions = (id) => 
  apiClient.get(`${quizBase}/get/${id}`);

export const submitQuiz = (id, data) => {
  const endpoint = `${quizBase}/submit/${id}`;
  const payload = data.map(item => ({
    id: item.questionId,
    response: item.response
  }));

  console.log("🔻 Submitting Quiz");
  console.log("➡️ Endpoint:", endpoint);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  return apiClient.post(endpoint, payload)
    .then(res => {
      console.log("✅ Quiz Score:", res.data);
      return res.data;
    })
    .catch(err => {
      console.error("❌ Submit Error:", err.response?.data || err.message);
      throw err;
    });
};

// Question APIs - matching backend endpoints
export const getAllQuestions = () => 
  apiClient.get(`${questionBase}/allQuestions`);

export const getQuestionsByCategory = (category) => 
  apiClient.get(`${questionBase}/category/${category}`);

export const addQuestions = (questionsArray) => 
  apiClient.post(`${questionBase}/addMultiple`, questionsArray);

export const getQuestionsByIds = (ids) => 
  apiClient.post(`${questionBase}/getQuestions`, ids);

export const getScore = (responses) => 
  apiClient.post(`${questionBase}/getScore`, responses);
