package com.Quiz.quizApp.dao;

import com.Quiz.quizApp.model.QuizResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizResponseDao extends JpaRepository<QuizResponse, Integer> {
    
    @Query("SELECT qr FROM QuizResponse qr WHERE qr.studentId = :studentId ORDER BY qr.submittedAt DESC")
    List<QuizResponse> findByStudentIdOrderBySubmittedAtDesc(@Param("studentId") Integer studentId);
    
    @Query("SELECT qr FROM QuizResponse qr WHERE qr.quizId = :quizId ORDER BY qr.submittedAt DESC")
    List<QuizResponse> findByQuizIdOrderBySubmittedAtDesc(@Param("quizId") Integer quizId);
}