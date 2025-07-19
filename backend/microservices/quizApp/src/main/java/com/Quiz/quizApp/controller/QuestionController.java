package com.Quiz.quizApp.controller;

import com.Quiz.quizApp.model.Question;
import com.Quiz.quizApp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("question")
public class QuestionController {

    @Autowired
    QuestionService questionService;

    @GetMapping("allQuestions")
    public ResponseEntity<List<Question>> getAllQuestion(){
        try{
            return new ResponseEntity<>(questionService.getAllQuestions(), HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
        }
        return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);
    }

    @GetMapping("category/{category}")
    public ResponseEntity<Object> getQuestionByCategory(@PathVariable String category){
        try{
        return ResponseEntity.ok().body(questionService.getQuestionsByCategory(category));
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body(new Object());
    }

    @PostMapping("add")
    public String addQuestion(@RequestBody Question question){
        return questionService.addQuestion(question);
    }

    @PutMapping("update/{id}")
    public Question updateQuestion(@RequestBody Question question, @PathVariable Integer id){
        return questionService.updateQuestion(question,id);
    }
}
