import axios from 'axios';

const quizBase = "http://localhost:8765/quiz-service/quiz";
const questionBase = "http://localhost:8765/questionservice/question";

export const createQuiz = (data) => axios.post(`${quizBase}/create`, data);
export const getQuizQuestions = (id) => axios.get(`${quizBase}/get/${id}`);
export const submitQuiz = (id, data) => {
  const endpoint = `${quizBase}/submit/${id}`;
  const payload = data.map(item => ({
    id: item.questionId,        // ✅ Mapping questionId to id
    response: item.response
  }));

  console.log("🔻 Submitting Quiz");
  console.log("➡️ Endpoint:", endpoint);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  return axios.post(endpoint, payload, {
    headers: {
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


// console.log("Submitting quiz:", JSON.stringify(data, null, 2));
// submitQuiz(id, data)
//   .then(res => console.log("Quiz Score:", res.data))
//   .catch(err => console.error("Submit Error:", err.response?.data || err.message));


export const getAllQuestions = () => axios.get(`${questionBase}/allQuestions`);
export const addQuestion = (data) => axios.post(`${questionBase}/add`, data);
export const generateQuiz = (category, numQuestions) =>
  axios.get(`${questionBase}/generate?categoryName=${category}&numQuestions=${numQuestions}`);
export const getQuestionsByIds = (ids) => axios.post(`${questionBase}/getQuestions`, ids);
