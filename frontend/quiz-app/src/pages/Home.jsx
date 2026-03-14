import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";

const DashboardCard = ({ icon, iconColor = "purple", title, description, onClick, variant }) => (
  <div
    className={`${styles["home__card"]} ${variant ? styles[`home__card--${variant}`] : ""}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
  >
    <div className={`${styles["home__card-icon"]} ${styles[`home__card-icon--${iconColor}`]}`}>
      {icon}
    </div>
    <h3 className={styles["home__card-title"]}>{title}</h3>
    <p className={styles["home__card-desc"]}>{description}</p>
    <span className={styles["home__card-arrow"]}>→</span>
  </div>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const teacherQuizCards = [
    {
      icon: "📊",
      iconColor: "purple",
      title: "My Quizzes",
      description: "View and manage all your created quizzes",
      path: "/teacher-dashboard",
    },
    {
      icon: "⚡",
      iconColor: "blue",
      title: "Quick Create",
      description: "Create a quiz instantly with random questions",
      path: "/create-quiz",
    },
    {
      icon: "🎯",
      iconColor: "orange",
      title: "Custom Quiz",
      description: "Hand-pick specific questions for your quiz",
      path: "/advanced-quiz-creator",
    },
    {
      icon: "📝",
      iconColor: "green",
      title: "Question Bank",
      description: "Browse and manage all your questions",
      path: "/view-questions",
    },
    {
      icon: "✏️",
      iconColor: "blue",
      title: "Add Question",
      description: "Create new questions for your question bank",
      path: "/add-question",
    },
  ];

  const teacherMaterialCards = [
    {
      icon: "📚",
      iconColor: "teal",
      title: "My Materials",
      description: "Browse and manage your lecture materials",
      path: "/teacher-materials",
      variant: "materials",
    },
    {
      icon: "⬆️",
      iconColor: "green",
      title: "Upload Material",
      description: "Share lecture notes, PDFs, or transcripts",
      path: "/upload-material",
      variant: "materials",
    },
  ];

  const teacherCards = [...teacherQuizCards, ...teacherMaterialCards];

  const studentCards = [
    {
      icon: "📊",
      iconColor: "purple",
      title: "My Dashboard",
      description: "View your quiz history and progress",
      path: "/student-dashboard",
    },
    {
      icon: "🎯",
      iconColor: "blue",
      title: "Take Quiz",
      description: "Start a new quiz challenge",
      path: "/take-quiz",
    },
  ];

  const activeCards = user?.role === "ROLE_TEACHER" ? teacherCards : studentCards;

  return (
    <div className={styles["page-home"]}>
      {/* Hero Section */}
      <div className={styles["home__hero"]}>
        <div className={styles["home__hero-inner"]}>
          {!isAuthenticated() && (
            <div className={styles["home__hero-badge"]}>
              ✨ Modern Quiz Platform
            </div>
          )}
          <h1 className={styles["home__hero-title"]}>
            {isAuthenticated()
              ? `Welcome back, ${user?.username}! 👋`
              : "Create. Learn. Excel."}
          </h1>
          <p className={styles["home__hero-subtitle"]}>
            {isAuthenticated()
              ? user?.role === "ROLE_TEACHER"
                ? "Manage your quizzes, question bank, and learning materials from one place."
                : "Track your progress, take quizzes, and improve your skills."
              : "A powerful platform for teachers to create engaging quizzes and for students to learn effectively."}
          </p>
          {!isAuthenticated() && (
            <div className={styles["home__hero-actions"]}>
              <button
                className={`${styles["home__hero-btn"]} ${styles["home__hero-btn--primary"]}`}
                onClick={() => navigate("/login")}
              >
                Get Started →
              </button>
              <button
                className={`${styles["home__hero-btn"]} ${styles["home__hero-btn--outline"]}`}
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Authenticated Dashboard */}
      {isAuthenticated() && (
        <div>
          {user?.role === "ROLE_TEACHER" ? (
            <>
              <div className={styles["home__section"]}>
                <h2 className={styles["home__section-title"]}>📋 Quiz Management</h2>
                <div className={styles["home__grid"]}>
                  {teacherQuizCards.map((card) => (
                    <DashboardCard
                      key={card.path}
                      {...card}
                      onClick={() => navigate(card.path)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles["home__section"]}>
                <h2 className={styles["home__section-title"]}>📚 Learning Materials</h2>
                <div className={styles["home__grid"]}>
                  {teacherMaterialCards.map((card) => (
                    <DashboardCard
                      key={card.path}
                      {...card}
                      onClick={() => navigate(card.path)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles["home__section"]}>
              <h2 className={styles["home__section-title"]}>🚀 Quick Access</h2>
              <div className={styles["home__grid"]}>
                {activeCards.map((card) => (
                  <DashboardCard
                    key={card.path}
                    {...card}
                    onClick={() => navigate(card.path)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unauthenticated Features */}
      {!isAuthenticated() && (
        <div className={styles["home__features"]}>
          <div className={styles["home__feature"]}>
            <div className={styles["home__feature-icon"]}>👨‍🏫</div>
            <h3 className={styles["home__feature-title"]}>For Teachers</h3>
            <p className={styles["home__feature-desc"]}>
              Create quizzes, manage a question bank, upload lecture materials, and track student progress — all in one place.
            </p>
          </div>
          <div className={styles["home__feature"]}>
            <div className={styles["home__feature-icon"]}>👨‍🎓</div>
            <h3 className={styles["home__feature-title"]}>For Students</h3>
            <p className={styles["home__feature-desc"]}>
              Take quizzes, review your results, and monitor your learning journey with detailed performance analytics.
            </p>
          </div>
          <div className={styles["home__feature"]}>
            <div className={styles["home__feature-icon"]}>📈</div>
            <h3 className={styles["home__feature-title"]}>Track Progress</h3>
            <p className={styles["home__feature-desc"]}>
              Detailed analytics and insights help identify strengths and areas for improvement over time.
            </p>
          </div>
          <div className={styles["home__feature"]}>
            <div className={styles["home__feature-icon"]}>📚</div>
            <h3 className={styles["home__feature-title"]}>Rich Materials</h3>
            <p className={styles["home__feature-desc"]}>
              Teachers can share PDFs, videos, and transcripts. Students access materials linked to their quizzes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
