package com.quizService.quizService.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class QuizResponseSubmit {
    private Integer id;
    private String response;
}
