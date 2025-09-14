import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateQuiz from "./pages/CreateQuiz";
import AdvancedQuizCreator from "./pages/AdvancedQuizCreator";
import TakeQuiz from "./pages/TakeQuiz";
import SubmitQuiz from "./pages/SubmitQuiz";
import AddQuestion from "./pages/AddQuestion";
import ViewQuestions from "./pages/ViewQuestions";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Header from "./components/Header";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/advanced-quiz-creator" element={<AdvancedQuizCreator />} />
          <Route path="/take-quiz" element={<TakeQuiz />} />
          <Route path="/submit-quiz/:id" element={<SubmitQuiz />} />
          <Route path="/add-question" element={<AddQuestion />} />
          <Route path="/view-questions" element={<ViewQuestions />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
