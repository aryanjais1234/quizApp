package com.quizService.quizService.model;

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
    private String categoryName;
    private String createdBy; // Username of the teacher who created the quiz
    private Integer userId;
    private LocalDateTime createdDate;

    @ElementCollection
    private List<Integer> questionIds;
    
    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }
}
