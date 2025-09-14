package com.quizService.quizService.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "quiz_submission")
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer submissionId;

    private Integer quizId;
    private String username;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime dateTaken;
    private String timeSpent;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode responsesJson;

    @PrePersist
    public void prePersist() {
        if (dateTaken == null) {
            dateTaken = LocalDateTime.now();
        }
    }
}