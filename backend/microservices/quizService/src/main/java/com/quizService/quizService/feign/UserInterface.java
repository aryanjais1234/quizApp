package com.quizService.quizService.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserInterface {
    @GetMapping("/auth/username/{userName}")
    public ResponseEntity<Integer> getUserId(@PathVariable String userName);
}
