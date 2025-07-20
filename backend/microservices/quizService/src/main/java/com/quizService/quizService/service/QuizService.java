package com.quizService.quizService.service;


import com.quizService.quizService.dao.QuizDao;
import com.quizService.quizService.dto.QuizDto;
import com.quizService.quizService.dto.QuizQuestionResponse;
import com.quizService.quizService.dto.QuizResponseSubmit;
import com.quizService.quizService.feign.QuizInterface;
import com.quizService.quizService.model.Quiz;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    QuizDao quizDao;

    @Autowired
    QuizInterface quizInterface;

    public String createQuiz(QuizDto quizDto) {

        List<Integer> questions = quizInterface.getQuestionsForQuiz(quizDto.getCategoryName(),quizDto.getNumQuestions()).getBody();

        Quiz quiz = new Quiz();
        quiz.setTitle(quizDto.getTitle());
        quiz.setQuestionIds(questions);

        quizDao.save(quiz);

        return "Success";
    }

    public List<QuizQuestionResponse> getQuizQuestions(Integer id) {
        Optional<Quiz> quiz = quizDao.findById(id);
        List<Integer> questionIds = quiz.get().getQuestionIds();


        return quizInterface.getQuestionFromId(questionIds).getBody();
    }

    public Integer calculateResult(List<QuizResponseSubmit> quizResponseSubmit, Integer id) {
        return quizInterface.getScore(quizResponseSubmit).getBody();
    }
}
