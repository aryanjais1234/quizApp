import { useState } from "react";
import { createQuiz, generateQuiz } from "../api/api";

const CreateQuiz = () => {
  const [category, setCategory] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    const { data: questionIds } = await generateQuiz(category, numQuestions);
    const quizDto = {
      title: `${category} Quiz`,
      questionIds
    };
    const response = await createQuiz(quizDto);
    setMessage(response.data);
  };

  return (
    <div>
      <h2>Create a Quiz</h2>
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} />
      <button onClick={handleCreate}>Create Quiz</button>
      <p>{message}</p>
    </div>
  );
};
export default CreateQuiz;
