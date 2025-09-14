package com.Quiz.quizApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherQuizResponse {
    private Integer id;
    private String title;
    private String categoryName;
    private Integer numQuestions;
    private LocalDateTime createdDate;
    private Integer attemptCount;
}