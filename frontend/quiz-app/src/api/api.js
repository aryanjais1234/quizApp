import axios from 'axios';

const quizBase = "http://localhost:8765/quiz";
const questionBase = "http://localhost:8765/questionservice/question";

// Pass token manually instead of using localStorage
const getAuthHeaders = (token) =>
  token ? { Authorization: `Bearer ${eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9TVFVERU5UIiwic3ViIjoic3R1ZGVudDEiLCJpYXQiOjE3NTMzMDE1NDgsImV4cCI6MTc1MzMzNzU0OH0.BVSD9r1ElspVDoRczwgRxQLpnhFRffzwt2oIjnAdUoo}` } : {};

// ---------------------- QUIZ APIs ----------------------

export const createQuiz = (data, token) =>
  axios.post(`${quizBase}/create`, data, {
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json"
    }
  });

export const getQuizQuestions = (id, token) =>
  axios.get(`${quizBase}/get/${id}`, {
    headers: getAuthHeaders(token)
  });

export const submitQuiz = (id, data, token) => {
  const endpoint = `${quizBase}/submit/${id}`;
  const payload = data.map(item => ({
    id: item.questionId,
    response: item.response
  }));

  console.log("🔻 Submitting Quiz");
  console.log("➡️ Endpoint:", endpoint);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  return axios.post(endpoint, payload, {
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    console.log("✅ Quiz Score:", res.data);
    return res.data;
  })
  .catch(err => {
    console.error("❌ Submit Error:", err.response?.data || err.message);
    throw err;
  });
};

// ---------------------- QUESTION APIs ----------------------

export const getAllQuestions = (token) =>
  axios.get(`${questionBase}/allQuestions`, {
    headers: getAuthHeaders(token)
  });

export const addQuestion = (data, token) =>
  axios.post(`${questionBase}/add`, data, {
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json"
    }
  });

export const generateQuiz = (category, numQuestions, token) =>
  axios.get(`${questionBase}/generate?categoryName=${category}&numQuestions=${numQuestions}`, {
    headers: getAuthHeaders(token)
  });

export const getQuestionsByIds = (ids, token) =>
  axios.post(`${questionBase}/getQuestions`, ids, {
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json"
    }
  });
