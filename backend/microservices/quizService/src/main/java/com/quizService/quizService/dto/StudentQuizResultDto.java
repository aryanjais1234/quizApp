package com.quizService.quizService.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentQuizResultDto {
    private Integer submissionId;

    private Integer quizId;
    private String username;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime dateTaken;
    private String timeSpent;
    private List<StudentResponseQuestionAns> responses;
}
