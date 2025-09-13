import { useState } from "react";
import { createQuiz } from "../api/api";
import { useAuth } from "../context/AuthContext";

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    categoryName: "",
    numQuestions: 1,
    title: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numQuestions' ? parseInt(value) : value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setMessage("Please login to create a quiz.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await createQuiz(formData);
      setMessage(`✅ Quiz created successfully! Quiz ID: ${response.data}`);
      setFormData({
        categoryName: "",
        numQuestions: 1,
        title: ""
      });
    } catch (error) {
      console.error("Create quiz error:", error);
      setMessage(`❌ Failed to create quiz: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Create a Quiz</h2>
        <p>Please <a href="/login">login</a> to create a quiz.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Create a Quiz</h2>
      <form onSubmit={handleCreate}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Quiz Title:</label>
          <input 
            type="text"
            name="title"
            value={formData.title} 
            onChange={handleChange}
            placeholder="Enter quiz title" 
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Category:</label>
          <select
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="">Select a category</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Number of Questions:</label>
          <input 
            type="number" 
            name="numQuestions"
            value={formData.numQuestions} 
            onChange={handleChange}
            min="1"
            max="20"
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;
