import { useLocation, useParams } from "react-router-dom";
import { submitQuiz } from "../api/api";
import { useEffect, useState } from "react";

const SubmitQuiz = () => {
  const { id } = useParams();
  const location = useLocation();
  const [score, setScore] = useState(null);

  useEffect(() => {
    submitQuiz(id, location.state).then((res) => setScore(res.data));
  }, [id, location]);

  return (
    <div>
      <h2>Your Score: {score} / {location.state.length}</h2>
    </div>
  );
};
export default SubmitQuiz;
