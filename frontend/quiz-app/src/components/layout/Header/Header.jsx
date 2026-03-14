import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './Header.module.scss';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    if (role === 'ROLE_TEACHER') return 'Teacher';
    if (role === 'ROLE_STUDENT') return 'Student';
    return '';
  };

  // Navigation links per role
  const teacherLinks = [
    { to: '/teacher-dashboard', label: 'My Quizzes', icon: '📊' },
    { to: '/create-quiz', label: 'Quick Quiz', icon: '⚡' },
    { to: '/advanced-quiz-creator', label: 'Custom Quiz', icon: '🎯' },
    { to: '/view-questions', label: 'Question Bank', icon: '📝' },
    { to: '/add-question', label: 'Add Question', icon: '➕' },
    { to: '/teacher-materials', label: 'Materials', icon: '📚' },
    { to: '/upload-material', label: 'Upload Material', icon: '⬆️' },
  ];

  const studentLinks = [
    { to: '/take-quiz', label: 'Take Quiz', icon: '🎯' },
    { to: '/student-dashboard', label: 'My Dashboard', icon: '📊' },
  ];

  const activeLinks = user?.role === 'ROLE_TEACHER' ? teacherLinks : studentLinks;

  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar__inner']}>
        {/* Left: Brand + Nav Links */}
        <div className={styles['navbar__left']}>
          <Link to="/" className={styles['navbar__brand']} onClick={() => setMobileOpen(false)}>
            <span className={styles['navbar__brand-icon']}>🎓</span>
            <span className={styles['navbar__brand-text']}>QuizApp</span>
          </Link>

          {isAuthenticated() && (
            <div className={styles['navbar__links']}>
              {activeLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${styles['navbar__link']} ${isActive(link.to) ? styles['navbar__link--active'] : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Auth / User */}
        <div className={styles['navbar__right']}>
          {isAuthenticated() ? (
            <>
              <div className={styles['navbar__user']}>
                <div className={styles['navbar__user-avatar']}>
                  {getInitials(user?.username)}
                </div>
                <div>
                  <div className={styles['navbar__user-name']}>{user?.username}</div>
                  <div className={styles['navbar__user-role']}>{getRoleLabel(user?.role)}</div>
                </div>
              </div>
              <button className={styles['navbar__logout']} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className={styles['navbar__auth']}>
              <Link to="/login" className={`${styles['navbar__auth-link']} ${styles['navbar__auth-link--login']}`}>
                Login
              </Link>
              <Link to="/register" className={`${styles['navbar__auth-link']} ${styles['navbar__auth-link--register']}`}>
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated() && (
            <button
              className={styles['navbar__menu-toggle']}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isAuthenticated() && (
        <div className={`${styles['navbar__mobile-menu']} ${mobileOpen ? styles['navbar__mobile-menu--open'] : ''}`}>
          {activeLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles['navbar__mobile-link']}
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Header;
