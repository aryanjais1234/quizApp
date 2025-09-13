import "./AddQuestion.css";
import { useState } from "react";
import { addQuestions } from "../api/api";
import { useAuth } from "../context/AuthContext";

const AddQuestion = () => {
  const [question, setQuestion] = useState({
    questionTitle: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    rightAnswer: "",
    difficultylevel: "Easy",
    category: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  const handleChange = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setMsg("Please login to add questions.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // Backend expects an array of questions for addMultiple endpoint
      const questionsArray = [question];
      const response = await addQuestions(questionsArray);
      setMsg(`✅ Question added successfully! ${response.data}`);
      
      // Reset form
      setQuestion({
        questionTitle: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        rightAnswer: "",
        difficultylevel: "Easy",
        category: "",
      });
    } catch (error) {
      console.error("Add question error:", error);
      setMsg(`❌ Failed to add question: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="centre-container">
        <div className="form-box">
          <h2>Add New Question</h2>
          <p>Please <a href="/login">login</a> to add questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="centre-container">
      <div className="form-box">
        <h2>Add New Question</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="questionTitle"
            placeholder="Question Title"
            value={question.questionTitle}
            onChange={handleChange}
            required
          />
          
          <input
            name="option1"
            placeholder="Option 1"
            value={question.option1}
            onChange={handleChange}
            required
          />
          
          <input
            name="option2"
            placeholder="Option 2"
            value={question.option2}
            onChange={handleChange}
            required
          />
          
          <input
            name="option3"
            placeholder="Option 3"
            value={question.option3}
            onChange={handleChange}
            required
          />
          
          <input
            name="option4"
            placeholder="Option 4"
            value={question.option4}
            onChange={handleChange}
            required
          />
          
          <input
            name="rightAnswer"
            placeholder="Right Answer (exact match to one of the options)"
            value={question.rightAnswer}
            onChange={handleChange}
            required
          />
          
          <select
            name="difficultylevel"
            value={question.difficultylevel}
            onChange={handleChange}
            required
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <select
            name="category"
            value={question.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="JAVA">Java</option>
            <option value="PYTHON">Python</option>
            <option value="JAVASCRIPT">JavaScript</option>
          </select>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Question'}
          </button>
        </form>
        
        {msg && <p className="message">{msg}</p>}
      </div>
    </div>
  );
};

export default AddQuestion;
