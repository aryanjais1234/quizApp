package com.quizService.quizService.service;


import com.quizService.quizService.dao.QuizDao;
import com.quizService.quizService.dao.QuizSubmissionDao;
import com.quizService.quizService.dto.*;
import com.quizService.quizService.feign.QuizInterface;
import com.quizService.quizService.model.Quiz;
import com.quizService.quizService.model.QuizSubmission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    QuizDao quizDao;

    @Autowired
    QuizSubmissionDao quizSubmissionDao;

    @Autowired
    QuizInterface quizInterface;

    public Integer createQuiz(QuizDto quizDto, String username) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDto.getTitle());
        quiz.setCategoryName(quizDto.getCategoryName());
        quiz.setCreatedBy(username);

        List<Integer> questions;
        if (quizDto.getQuestionIds() != null && !quizDto.getQuestionIds().isEmpty()) {
            // Custom quiz with specific questions
            questions = quizDto.getQuestionIds();
        } else {
            // Random quiz generation
            questions = quizInterface.getQuestionsForQuiz(quizDto.getCategoryName(), quizDto.getNumQuestions()).getBody();
        }
        
        quiz.setQuestionIds(questions);
        quizDao.save(quiz);

        return quiz.getId();
    }

    public List<QuizQuestionResponse> getQuizQuestions(Integer id) {
        Optional<Quiz> quiz = quizDao.findById(id);
        List<Integer> questionIds = quiz.get().getQuestionIds();

        return quizInterface.getQuestionFromId(questionIds).getBody();
    }

    public Integer calculateResult(List<QuizResponseSubmit> quizResponseSubmit, Integer id, String username) {
        Integer score = quizInterface.getScore(quizResponseSubmit).getBody();
        
        // Save quiz submission
        QuizSubmission submission = new QuizSubmission();
        submission.setQuizId(id);
        submission.setUsername(username);
        submission.setScore(score);
        submission.setTotalQuestions(quizResponseSubmit.size());
        submission.setTimeSpent("N/A"); // Can be enhanced to track actual time
        
        quizSubmissionDao.save(submission);
        
        return score;
    }

    public List<TeacherQuizDto> getTeacherQuizzes(String username) {
        List<Quiz> quizzes = quizDao.findByCreatedByOrderByCreatedDateDesc(username);
        
        return quizzes.stream().map(quiz -> {
            Long attemptCount = quizSubmissionDao.countSubmissionsByQuizId(quiz.getId());
            return new TeacherQuizDto(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getCategoryName(),
                quiz.getQuestionIds().size(),
                quiz.getCreatedDate(),
                attemptCount
            );
        }).collect(Collectors.toList());
    }

    public List<StudentQuizHistoryDto> getStudentQuizHistory(String username) {
        List<QuizSubmission> submissions = quizSubmissionDao.findByUsernameOrderByDateTakenDesc(username);
        
        return submissions.stream().map(submission -> {
            Optional<Quiz> quiz = quizDao.findById(submission.getQuizId());
            return new StudentQuizHistoryDto(
                submission.getId(),
                submission.getQuizId(),
                quiz.map(Quiz::getTitle).orElse("Unknown Quiz"),
                quiz.map(Quiz::getCategoryName).orElse("Unknown"),
                submission.getScore(),
                submission.getTotalQuestions(),
                submission.getDateTaken(),
                submission.getTimeSpent(),
                "completed"
            );
        }).collect(Collectors.toList());
    }
}
