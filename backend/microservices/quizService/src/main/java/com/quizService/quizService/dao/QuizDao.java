package com.quizService.quizService.dao;

import com.quizService.quizService.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizDao extends JpaRepository<Quiz,Integer> {
    List<Quiz> findByCreatedByOrderByCreatedDateDesc(String createdBy);
}
