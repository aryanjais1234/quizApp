package com.Quiz.quizApp.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String title;
    private Integer teacherId; // Map quiz to teacher
    private String categoryName; // Store category name
    private Integer numQuestions; // Store number of questions
    private LocalDateTime createdDate; // Store creation date

    @ManyToMany
    private List<Question> questions;
}
