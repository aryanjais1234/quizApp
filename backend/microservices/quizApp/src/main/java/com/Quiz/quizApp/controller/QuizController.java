package com.Quiz.quizApp.controller;

import com.Quiz.quizApp.dto.QuizQuestionResponse;
import com.Quiz.quizApp.model.Question;
import com.Quiz.quizApp.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("quiz")
public class QuizController {

    @Autowired
    QuizService quizService;

    @PostMapping("create")
    public ResponseEntity<String> createQuiz(@RequestParam String category, @RequestParam Integer numQ, @RequestParam String title){
        return new ResponseEntity<>(quizService.createQuiz(category,numQ,title), HttpStatus.OK);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<QuizQuestionResponse>> getQuizQuestions(@PathVariable Integer id){
        return new ResponseEntity<>(quizService.getQuizQuestions(id),HttpStatus.OK);
    }

    
}
