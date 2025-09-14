package com.userService.user_service.dao;

import com.userService.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    // Add this method to src/main/java/com/userService/user_service/dao/UserRepository.java
    boolean existsByUsername(String username);

}
