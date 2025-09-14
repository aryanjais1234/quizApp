package com.quizService.quizService.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizService.quizService.dao.QuizDao;
import com.quizService.quizService.dao.QuizSubmissionDao;
import com.quizService.quizService.dto.*;
import com.quizService.quizService.feign.QuizInterface;
import com.quizService.quizService.feign.UserInterface;
import com.quizService.quizService.model.Quiz;
import com.quizService.quizService.model.QuizSubmission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    QuizDao quizDao;

    @Autowired
    QuizSubmissionDao quizSubmissionDao;

    @Autowired
    QuizInterface quizInterface;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    UserInterface userInterface;

    public Integer createQuiz(QuizDto quizDto, String username) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDto.getTitle());
        quiz.setCategoryName(quizDto.getCategoryName());
        quiz.setCreatedBy(username);
        Integer userId = userInterface.getUserId(username).getBody();
        quiz.setUserId(userId);

        List<Integer> questions = new ArrayList<>();
        if (quizDto.getQuestionIds() != null && !quizDto.getQuestionIds().isEmpty()) {
            // Custom quiz with specific questions
            System.out.println("Custom quiz creation with questions: " + quizDto.getQuestionIds());
            questions = quizDto.getQuestionIds();
        } else {
            // Random quiz generation
            questions = quizInterface.getQuestionsForQuiz(quizDto.getCategoryName(), quizDto.getNumQuestions()).getBody();
        }

        quiz.setQuestionIds(questions);
        quizDao.save(quiz);

        return quiz.getId();
    }

    public List<QuizQuestionResponse> getQuizQuestions(Integer id) {
        Optional<Quiz> quiz = quizDao.findById(id);
        List<Integer> questionIds = quiz.get().getQuestionIds();

        return quizInterface.getQuestionFromId(questionIds).getBody();
    }

    public Integer calculateResult(List<QuizResponseSubmit> quizResponseSubmit, Integer id, String username) {
        Integer score = quizInterface.getScore(quizResponseSubmit).getBody();

        // Save quiz submission
        QuizSubmission submission = new QuizSubmission();
        submission.setQuizId(id);
        submission.setUsername(username);
        submission.setScore(score);
        submission.setTotalQuestions(quizResponseSubmit.size());
        submission.setTimeSpent("N/A"); // Can be enhanced to track actual time
        JsonNode responses = objectMapper.valueToTree(quizResponseSubmit);
        submission.setResponsesJson(responses);
        try {
            System.out.println("Received JSON: " + new ObjectMapper().writeValueAsString(quizResponseSubmit));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        quizSubmissionDao.save(submission);

        return score;
    }

    public List<TeacherQuizDto> getTeacherQuizzes(String username) {
        List<Quiz> quizzes = quizDao.findByCreatedByOrderByCreatedDateDesc(username);

        return quizzes.stream().map(quiz -> {
            Long attemptCount = quizSubmissionDao.countSubmissionsByQuizId(quiz.getId());
            return new TeacherQuizDto(
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getCategoryName(),
                    quiz.getQuestionIds().size(),
                    quiz.getCreatedDate(),
                    attemptCount
            );
        }).collect(Collectors.toList());
    }

    public List<StudentQuizHistoryDto> getStudentQuizHistory(String username) {
        List<QuizSubmission> submissions = quizSubmissionDao.findByUsernameOrderByDateTakenDesc(username);

        return submissions.stream().map(submission -> {
            Optional<Quiz> quiz = quizDao.findById(submission.getQuizId());
            return new StudentQuizHistoryDto(
                    submission.getSubmissionId(),
                    submission.getQuizId(),
                    quiz.map(Quiz::getTitle).orElse("Unknown Quiz"),
                    quiz.map(Quiz::getCategoryName).orElse("Unknown"),
                    submission.getScore(),
                    submission.getTotalQuestions(),
                    submission.getDateTaken(),
                    submission.getTimeSpent(),
                    "completed"
            );
        }).collect(Collectors.toList());
    }

    public StudentQuizResultDto getStudentQuizResults(Integer responseId) {
        Optional<QuizSubmission> submissionOpt = quizSubmissionDao.findById(responseId);
        StudentQuizResultDto studentQuizResultDto = new StudentQuizResultDto();
        if (submissionOpt.isPresent()) {
            QuizSubmission submission = submissionOpt.get();
            List<QuizResponseSubmit> responses;
            try {
                responses = objectMapper.readValue(
                        new ObjectMapper().writeValueAsString(submission.getResponsesJson()),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, QuizResponseSubmit.class)
                );
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
            List<Integer> questionIds = responses.stream()
                    .map(QuizResponseSubmit::getId)
                    .collect(Collectors.toList());
            List<String> studentResponses = responses.stream()
                    .map(QuizResponseSubmit::getResponse)
                    .collect(Collectors.toList());
            List<QuizQuestionStudentResponse> questions = quizInterface.getQuestionFromIdForResponse(questionIds).getBody();


            studentQuizResultDto.setSubmissionId(submission.getSubmissionId());
            studentQuizResultDto.setQuizId(submission.getQuizId());
            studentQuizResultDto.setUsername(submission.getUsername());
            studentQuizResultDto.setScore(submission.getScore());
            studentQuizResultDto.setTotalQuestions(submission.getTotalQuestions());
            studentQuizResultDto.setDateTaken(submission.getDateTaken());
            studentQuizResultDto.setTimeSpent(submission.getTimeSpent());
            List<StudentResponseQuestionAns> studentResponseQuestionAns = new ArrayList<>();
            for (int i = 0; i < questions.size(); i++) {
                StudentResponseQuestionAns srqa = getStudentResponseQuestionAns(questions, i, studentResponses);
                studentResponseQuestionAns.add(srqa);
            }
            studentQuizResultDto.setResponses(studentResponseQuestionAns);
        }
        return studentQuizResultDto;
    }

    private static StudentResponseQuestionAns getStudentResponseQuestionAns(List<QuizQuestionStudentResponse> questions, int i, List<String> studentResponses) {
        StudentResponseQuestionAns srqa = new StudentResponseQuestionAns();
        srqa.setQuestionId(questions.get(i).getId());
        srqa.setQuestionTitle(questions.get(i).getQuestionTitle());
        srqa.setOption1(questions.get(i).getOption1());
        srqa.setOption2(questions.get(i).getOption2());
        srqa.setOption3(questions.get(i).getOption3());
        srqa.setOption4(questions.get(i).getOption4());
        srqa.setRightAnswer(questions.get(i).getRightAnswer());
        srqa.setStudentResponse(studentResponses.get(i));
        srqa.setIsCorrect(srqa.getRightAnswer().equalsIgnoreCase(srqa.getStudentResponse()));
        return srqa;
    }

    public List<StudentQuizResultDto> getQuizAnalytics(Integer quizId) {
        // Future enhancement: Implement analytics logic here
//        ResponseEntity<Integer> userId = userInterface.getUserId(username);
//        System.out.println("User ID: " + userId.getBody());
        List<QuizSubmission> studentQuizResults = null;
        try {
            studentQuizResults = quizSubmissionDao.findByQuizId(quizId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        System.out.println("Student Quiz Results: " + studentQuizResults);
        List<StudentQuizResultDto> listStudentQuizResults = new ArrayList<>();
        for(QuizSubmission submission : studentQuizResults){
            StudentQuizResultDto studentQuizResultDto = getStudentQuizResults(submission.getSubmissionId());
            listStudentQuizResults.add(studentQuizResultDto);
        }
        return listStudentQuizResults;
    }
}
