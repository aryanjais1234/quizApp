package com.quizService.quizService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuizHistoryDto {
    private Integer id;
    private Integer quizId;
    private String title;
    private String category;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime dateTaken;
    private String timeSpent;
    private String status; // "completed"
}