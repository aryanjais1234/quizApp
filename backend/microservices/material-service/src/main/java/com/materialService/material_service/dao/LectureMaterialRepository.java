package com.materialService.material_service.dao;

import com.materialService.material_service.model.LectureMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LectureMaterialRepository extends JpaRepository<LectureMaterial, Integer> {

    List<LectureMaterial> findByTeacherUsername(String teacherUsername);

    List<LectureMaterial> findByCategory(String category);
}
