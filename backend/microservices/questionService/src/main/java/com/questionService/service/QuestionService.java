package com.questionService.service;

import com.questionService.dao.QuestionDao;
import com.questionService.dto.QuizQuestionResponse;
import com.questionService.dto.QuizResponseSubmit;
import com.questionService.dto.QuizStudentQuestion;
import com.questionService.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public String addQuestion(List<Question> questions) {
        questions.stream()
                .forEach(q -> questionDao.save(q));
        return "Questions Added Successfully";
    }

    public Question updateQuestion(Question question, Integer id) {
        Optional<Question> existingQuestion = questionDao.findById(id);

        Question q = existingQuestion.get();
        return null;

    }

    public List<Integer> getQuestionsForQuiz(String categoryName, Integer numQuestions) {
        List<Integer> questions = questionDao.findRandomQuestionsByCategory(categoryName,numQuestions);
        return questions;
    }

    public List<QuizQuestionResponse> getQuestionFromId(List<Integer> questionIds) {
        List<Question> questions = questionIds.stream()
                .map(questionDao::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());

        return questions.stream()
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

    public Integer getScore(List<QuizResponseSubmit> quizResponseSubmit) {
        int right = 0;

//        for(QuizResponseSubmit response : quizResponseSubmit){
//            Question question = questionDao.findById(response.getId()).get();
//            if(response.getResponse().equals(question.getRightAnswer())) right++;
//        }

        right = (int) quizResponseSubmit.stream()
                .filter(response -> {
                    Optional<Question> question = questionDao.findById(response.getId());
                    return question.isPresent() &&
                            response.getResponse().equalsIgnoreCase(question.get().getRightAnswer());
                })
                .count();

        return right;
    }

    public List<QuizStudentQuestion> getQuestionForStudentResponse(List<Integer> questionIds) {
        List<Question> questions = questionIds.stream()
                .map(questionDao::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());

        return questions.stream()
                .map(question -> new QuizStudentQuestion(
                        question.getId(),
                        question.getQuestionTitle(),
                        question.getOption1(),
                        question.getOption2(),
                        question.getOption3(),
                        question.getOption4(),
                        question.getRightAnswer()
                ))
                .collect(Collectors.toList());
    }
}
