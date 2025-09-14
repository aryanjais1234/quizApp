package com.Quiz.quizApp.controller;

import com.Quiz.quizApp.config.JwtUtil;
import com.Quiz.quizApp.dao.UserRepository;
import com.Quiz.quizApp.dto.QuizQuestionResponse;
import com.Quiz.quizApp.dto.QuizResponseSubmit;
import com.Quiz.quizApp.dto.TeacherQuizResponse;
import com.Quiz.quizApp.model.QuizResponse;
import com.Quiz.quizApp.model.User;
import com.Quiz.quizApp.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("quiz")
public class QuizController {

    @Autowired
    QuizService quizService;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    UserRepository userRepository;

    @PostMapping("create")
    public ResponseEntity<String> createQuiz(@RequestParam String category, @RequestParam Integer numQ, 
                                             @RequestParam String title, HttpServletRequest request){
        // Extract user ID from token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Integer teacherId = jwtUtil.extractUserId(token);
            return new ResponseEntity<>(quizService.createQuiz(category, numQ, title, teacherId), HttpStatus.OK);
        }
        return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<QuizQuestionResponse>> getQuizQuestions(@PathVariable Integer id){
        return new ResponseEntity<>(quizService.getQuizQuestions(id),HttpStatus.OK);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@RequestBody List<QuizResponseSubmit> quizResponseSubmit, 
                                              @PathVariable Integer id, HttpServletRequest request){
        // Extract user ID from token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Integer studentId = jwtUtil.extractUserId(token);
            String username = jwtUtil.extractUsername(token);
            return new ResponseEntity<>(quizService.calculateResult(quizResponseSubmit, id, studentId, username), HttpStatus.OK);
        }
        return new ResponseEntity<>(0, HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("teacher/quizzes")
    public ResponseEntity<List<TeacherQuizResponse>> getTeacherQuizzes(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Integer teacherId = jwtUtil.extractUserId(token);
            return new ResponseEntity<>(quizService.getTeacherQuizzes(teacherId), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("analytics/{quizId}")
    public ResponseEntity<Object> getQuizAnalytics(@PathVariable Integer quizId, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Integer teacherId = jwtUtil.extractUserId(token);
            return new ResponseEntity<>(quizService.getQuizAnalytics(quizId, teacherId), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("student/history")
    public ResponseEntity<List<QuizResponse>> getStudentQuizHistory(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Integer studentId = jwtUtil.extractUserId(token);
            return new ResponseEntity<>(quizService.getStudentQuizHistory(studentId), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("student/result/{quizId}")
    public ResponseEntity<QuizResponse> getQuizResultDetails(@PathVariable Integer quizId, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Integer studentId = jwtUtil.extractUserId(token);
            return new ResponseEntity<>(quizService.getQuizResultDetails(quizId, studentId), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
