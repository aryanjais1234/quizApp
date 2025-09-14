package com.quizService.quizService.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuizDto {
    String categoryName;
    Integer numQuestions;
    String title;
    List<Integer> questionIds; // For custom quiz creation with specific questions
}
