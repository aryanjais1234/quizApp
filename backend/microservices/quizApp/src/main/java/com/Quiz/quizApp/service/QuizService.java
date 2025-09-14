package com.Quiz.quizApp.service;

import com.Quiz.quizApp.dao.QuestionDao;
import com.Quiz.quizApp.dao.QuizDao;
import com.Quiz.quizApp.dao.QuizResponseDao;
import com.Quiz.quizApp.dao.UserRepository;
import com.Quiz.quizApp.dto.QuizQuestionResponse;
import com.Quiz.quizApp.dto.QuizResponseSubmit;
import com.Quiz.quizApp.dto.TeacherQuizResponse;
import com.Quiz.quizApp.model.Question;
import com.Quiz.quizApp.model.Quiz;
import com.Quiz.quizApp.model.QuizResponse;
import com.Quiz.quizApp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    QuizDao quizDao;

    @Autowired
    QuestionDao questionDao;

    @Autowired
    QuizResponseDao quizResponseDao;

    @Autowired
    UserRepository userRepository;

    public String createQuiz(String category, Integer numQ, String title, Integer teacherId) {
        List<Question> questions = questionDao.findRandomQuestionsByCategory(category, numQ);

        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);
        quiz.setTeacherId(teacherId);
        quiz.setCategoryName(category);
        quiz.setNumQuestions(numQ);
        quiz.setCreatedDate(LocalDateTime.now());

        Quiz savedQuiz = quizDao.save(quiz);
        return savedQuiz.getId().toString();
    }

    public List<QuizQuestionResponse> getQuizQuestions(Integer id) {
        Optional<Quiz> quiz = quizDao.findById(id);

        return quiz.get().getQuestions().stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }

    private QuizQuestionResponse mapToQuestionResponse(Question question){
        return new QuizQuestionResponse(
                question.getId(),
                question.getQuestionTitle(),
                question.getOption1(),
                question.getOption2(),
                question.getOption3(),
                question.getOption4()
        );
    }

    public Integer calculateResult(List<QuizResponseSubmit> quizResponseSubmit, Integer quizId, Integer studentId, String username) {
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (!quizOpt.isPresent()) {
            throw new RuntimeException("Quiz not found");
        }
        
        Quiz quiz = quizOpt.get();
        List<Question> questions = quiz.getQuestions();
        int right = 0;

        // Calculate score
        right = (int) quizResponseSubmit.stream()
                .filter(response -> questions.stream()
                        .anyMatch(q -> q.getId().equals(response.getId()) &&
                                q.getRightAnswer().equals(response.getResponse())))
                .count();

        // Create QuizResponse record
        QuizResponse quizResponse = new QuizResponse();
        quizResponse.setQuizId(quizId);
        quizResponse.setStudentId(studentId);
        quizResponse.setScore(right);
        quizResponse.setTotalQuestions(questions.size());
        quizResponse.setSubmittedAt(LocalDateTime.now());
        quizResponse.setStudentName(username);
        quizResponse.setCategory(quiz.getCategoryName());
        quizResponse.setQuizTitle(quiz.getTitle());
        quizResponse.setPercentage((double) right / questions.size() * 100);

        quizResponseDao.save(quizResponse);

        return right;
    }

    public List<TeacherQuizResponse> getTeacherQuizzes(Integer teacherId) {
        List<Quiz> quizzes = quizDao.findByTeacherIdOrderByCreatedDateDesc(teacherId);
        return quizzes.stream().map(quiz -> {
            List<QuizResponse> responses = quizResponseDao.findByQuizIdOrderBySubmittedAtDesc(quiz.getId());
            return new TeacherQuizResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getCategoryName(),
                quiz.getNumQuestions(),
                quiz.getCreatedDate(),
                responses.size()
            );
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getQuizAnalytics(Integer quizId, Integer teacherId) {
        // Verify quiz belongs to teacher
        Optional<Quiz> quizOpt = quizDao.findById(quizId);
        if (!quizOpt.isPresent() || !quizOpt.get().getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Quiz not found or unauthorized");
        }

        Quiz quiz = quizOpt.get();
        List<QuizResponse> responses = quizResponseDao.findByQuizIdOrderBySubmittedAtDesc(quizId);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("quiz", quiz);
        analytics.put("attempts", responses);

        return analytics;
    }

    public List<QuizResponse> getStudentQuizHistory(Integer studentId) {
        return quizResponseDao.findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    public QuizResponse getQuizResultDetails(Integer quizId, Integer studentId) {
        List<QuizResponse> responses = quizResponseDao.findByQuizIdOrderBySubmittedAtDesc(quizId);
        return responses.stream()
                .filter(response -> response.getStudentId().equals(studentId))
                .findFirst()
                .orElse(null);
    }
}
