import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import SubmitQuiz from "./pages/SubmitQuiz";
import AddQuestion from "./pages/AddQuestion";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/take-quiz" element={<TakeQuiz />} />
        <Route path="/submit-quiz/:id" element={<SubmitQuiz />} />
        <Route path="/add-question" element={<AddQuestion />} />
      </Routes>
    </Router>
  );
}

export default App;
