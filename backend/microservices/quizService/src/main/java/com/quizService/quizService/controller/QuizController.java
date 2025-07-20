package com.quizService.quizService.controller;

import com.quizService.quizService.dto.QuizQuestionResponse;
import com.quizService.quizService.dto.QuizResponseSubmit;
import com.quizService.quizService.dto.QuizDto;
import com.quizService.quizService.service.QuizService;
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
    public ResponseEntity<String> createQuiz(@RequestBody QuizDto quizDto){
        return new ResponseEntity<>(quizService.createQuiz(quizDto), HttpStatus.OK);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<QuizQuestionResponse>> getQuizQuestions(@PathVariable Integer id){
        return new ResponseEntity<>(quizService.getQuizQuestions(id),HttpStatus.OK);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@RequestBody List<QuizResponseSubmit> quizResponseSubmit, @PathVariable Integer id){
        return new ResponseEntity<>(quizService.calculateResult(quizResponseSubmit,id),HttpStatus.OK);
    }
    
}
