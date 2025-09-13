import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import SubmitQuiz from "./pages/SubmitQuiz";
import AddQuestion from "./pages/AddQuestion";
import Header from "./components/Header";
import Login from "./pages/Login"; // 🔹 Add your Login component here

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
        <Route path="/take-quiz" element={<TakeQuiz />} />
        <Route path="/submit-quiz/:id" element={<ProtectedRoute><SubmitQuiz /></ProtectedRoute>} />
        <Route path="/add-question" element={<ProtectedRoute><AddQuestion /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
