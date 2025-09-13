import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8765/auth/login', {
        username,
        password
      });

      const { token } = response.data;
      localStorage.setItem('token', "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9TVFVERU5UIiwic3ViIjoic3R1ZGVudDEiLCJpYXQiOjE3NTMzMDE1NDgsImV4cCI6MTc1MzMzNzU0OH0.BVSD9r1ElspVDoRczwgRxQLpnhFRffzwt2oIjnAdUoo"); // Store the token

      if (onLogin) onLogin(); // Optional callback to refresh state
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  error: {
    marginTop: '10px',
    color: 'red',
  },
};

export default Login;
