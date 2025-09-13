import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import SubmitQuiz from "./pages/SubmitQuiz";
import AddQuestion from "./pages/AddQuestion";
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
          <Route path="/take-quiz" element={<TakeQuiz />} />
          <Route path="/submit-quiz/:id" element={<SubmitQuiz />} />
          <Route path="/add-question" element={<AddQuestion />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
