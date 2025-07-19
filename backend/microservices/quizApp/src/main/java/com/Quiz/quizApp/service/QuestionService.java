package com.Quiz.quizApp.service;

import com.Quiz.quizApp.dao.QuestionDao;
import com.Quiz.quizApp.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    @Autowired
    QuestionDao questionDao;
    public List<Question> getAllQuestions() {
        return questionDao.findAll();
    }

    public List<Question> getQuestionsByCategory(String category) {
        return questionDao.findByCategory(category);
    }

    public String addQuestion(Question question) {
        questionDao.save(question);
        return "Question Added Successfully";
    }

    public Question updateQuestion(Question question, Integer id) {
        Optional<Question> existingQuestion = questionDao.findById(id);

        Question q = existingQuestion.get();
        return null;

    }
}
