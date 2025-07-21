import { Link } from 'react-router-dom';

const Header = () => (
  <nav style={{ padding: '1rem', background: '#282c34', color: 'white' }}>
    <Link to="/" style={{ marginRight: 10, color: 'white' }}>Home</Link>
    <Link to="/create-quiz" style={{ marginRight: 10, color: 'white' }}>Create Quiz</Link>
    <Link to="/add-question" style={{ color: 'white' }}>Add Question</Link>
  </nav>
);
export default Header;
