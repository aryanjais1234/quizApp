package com.quizService.quizService.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class QuizSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer quizId;
    private String username; // User who took the quiz
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime dateTaken;
    private String timeSpent; // Time taken to complete quiz
    
    @PrePersist
    public void prePersist() {
        if (dateTaken == null) {
            dateTaken = LocalDateTime.now();
        }
    }
}