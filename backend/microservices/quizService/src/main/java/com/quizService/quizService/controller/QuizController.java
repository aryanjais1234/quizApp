package com.quizService.quizService.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizService.quizService.dto.*;
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
    public ResponseEntity<String> createQuiz(@RequestBody QuizDto quizDto, @RequestHeader("username") String username){
        Integer quizId = quizService.createQuiz(quizDto, username);
        return new ResponseEntity<>("Quiz created with ID: " + quizId, HttpStatus.OK);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<QuizQuestionResponse>> getQuizQuestions(@PathVariable Integer id){
        return new ResponseEntity<>(quizService.getQuizQuestions(id),HttpStatus.OK);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@RequestBody List<QuizResponseSubmit> quizResponseSubmit, 
                                            @PathVariable Integer id, 
                                            @RequestHeader("username") String username){
        try {
            System.out.println("Received JSON: " + new ObjectMapper().writeValueAsString(quizResponseSubmit));
            return new ResponseEntity<>(quizService.calculateResult(quizResponseSubmit, id, username), HttpStatus.OK);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("teacher/quizzes")
    public ResponseEntity<List<TeacherQuizDto>> getTeacherQuizzes(@RequestHeader("username") String username) {
        return new ResponseEntity<>(quizService.getTeacherQuizzes(username), HttpStatus.OK);
    }

    @GetMapping("student/history")
    public ResponseEntity<List<StudentQuizHistoryDto>> getStudentQuizHistory(@RequestHeader("username") String username) {
        return new ResponseEntity<>(quizService.getStudentQuizHistory(username), HttpStatus.OK);
    }

    @GetMapping("analytics/{quizId}")
    public ResponseEntity<String> getQuizAnalytics(@PathVariable Integer quizId) {
        // Placeholder for analytics endpoint
        return new ResponseEntity<>("Analytics for quiz " + quizId, HttpStatus.OK);
    }
}
