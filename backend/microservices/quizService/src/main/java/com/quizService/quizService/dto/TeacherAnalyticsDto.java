package com.quizService.quizService.dto;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

//@Data
//@AllArgsConstructor
//@NoArgsConstructor
public class TeacherAnalyticsDto {
    private Integer quizId;
    private Integer totalNoOfStudents;
    // humare pass hoga ek student id os uske multiple student responses

}
