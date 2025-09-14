package com.Quiz.quizApp.dao;

import com.Quiz.quizApp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizDao extends JpaRepository<Quiz,Integer> {
    
    @Query("SELECT q FROM Quiz q WHERE q.teacherId = :teacherId ORDER BY q.createdDate DESC")
    List<Quiz> findByTeacherIdOrderByCreatedDateDesc(@Param("teacherId") Integer teacherId);
}
