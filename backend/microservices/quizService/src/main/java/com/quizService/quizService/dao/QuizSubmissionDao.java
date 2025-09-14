package com.quizService.quizService.dao;

    import com.quizService.quizService.dto.StudentQuizResultDto;
    import com.quizService.quizService.model.QuizSubmission;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.data.jpa.repository.Query;
    import org.springframework.data.repository.query.Param;
    import org.springframework.stereotype.Repository;

    import java.util.List;
    import java.util.Optional;

    @Repository
    public interface QuizSubmissionDao extends JpaRepository<QuizSubmission, Integer> {

        List<QuizSubmission> findByUsernameOrderByDateTakenDesc(String username);

        List<QuizSubmission> findByQuizId(Integer quizId);

        @Query("SELECT COUNT(qs) FROM QuizSubmission qs WHERE qs.quizId = :quizId")
        Long countSubmissionsByQuizId(@Param("quizId") Integer quizId);

        // Latest submission for a quiz (by dateTaken)
        Optional<QuizSubmission> findFirstByQuizIdOrderByDateTakenDesc(Integer quizId);
    }