package com.quizService.quizService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherQuizDto {
    private Integer id;
    private String title;
    private String categoryName;
    private Integer numQuestions;
    private LocalDateTime createdDate;
    private Long attemptCount;
}