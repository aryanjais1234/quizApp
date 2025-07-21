import "./AddQuestion.css";
import { useState } from "react";
import { addQuestion } from "../api/api";

const AddQuestion = () => {
  const [question, setQuestion] = useState({
    questionTitle: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
    category: "",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await addQuestion(question);
    setMsg(res.data);
  };

  return (
    <div className="centre-container">
      <div className="form-box">
        <h2>Add New Question</h2>
        {[
          "questionTitle",
          "option1",
          "option2",
          "option3",
          "option4",
          "correctAnswer",
          "category",
        ].map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace(/([A-Z])/g, " $1").trim()}
            value={question[key]}
            onChange={handleChange}
          />
        ))}
        <button onClick={handleSubmit}>Add</button>
        {msg && <p className="message">{msg}</p>}
      </div>
    </div>
  );
};

export default AddQuestion;
