package com.Quiz.quizApp.service;

import com.Quiz.quizApp.dao.QuestionDao;
import com.Quiz.quizApp.dao.QuizDao;
import com.Quiz.quizApp.model.Question;
import com.Quiz.quizApp.model.Quiz;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
