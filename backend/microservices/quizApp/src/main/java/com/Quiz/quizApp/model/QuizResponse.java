package com.Quiz.quizApp.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class QuizResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer quizId;
    private Integer studentId;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime submittedAt;
    private String studentName; // Cache student name for easier querying
    
    // Additional fields for analytics
    private String category;
    private String quizTitle;
    private Double percentage;
}