package com.Quiz.quizApp.service;

import com.Quiz.quizApp.dao.QuestionDao;
import com.Quiz.quizApp.dao.QuizDao;
import com.Quiz.quizApp.dto.QuizQuestionResponse;
import com.Quiz.quizApp.dto.QuizResponseSubmit;
import com.Quiz.quizApp.model.Question;
import com.Quiz.quizApp.model.Quiz;
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
    QuestionDao questionDao;

    public String createQuiz(String category, Integer numQ, String title) {

        List<Question> questions = questionDao.findRandomQuestionsByCategory(category,numQ);

        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);

        quizDao.save(quiz);

        return "Success";
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

    public Integer calculateResult(List<QuizResponseSubmit> quizResponseSubmit, Integer id) {
        Optional<Quiz> quiz = quizDao.findById(id);
        List<Question> questions = quiz.get().getQuestions();
        int right = 0;

//        for (QuizResponseSubmit response : quizResponseSubmit) {
//            for (Question q : questions) {
//                if (q.getId().equals(response.getId()) && q.getRightAnswer().equals(response.getResponse()))
//                    right++;
//            }
//        }
        right = (int) quizResponseSubmit.stream()
                .filter(response -> questions.stream()
                        .anyMatch(q -> q.getId().equals(response.getId()) &&
                                q.getRightAnswer().equals(response.getResponse())))
                .count();
        return right;
    }
}
