package com.materialService.material_service.controller;

import com.materialService.material_service.model.LectureMaterial;
import com.materialService.material_service.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("materials")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    /**
     * POST /materials/upload
     * Upload a file + metadata (multipart). Only accessible by TEACHER role (enforced in API Gateway).
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LectureMaterial> uploadMaterial(
            @RequestPart("file") MultipartFile file,
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart("category") String category,
            @RequestHeader("username") String teacherUsername) {
        try {
            LectureMaterial saved = materialService.uploadMaterial(file, title, description, category, teacherUsername);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IOException e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    /**
     * GET /materials/teacher/{teacherId}
     * Get all materials uploaded by a specific teacher (by username).
     */
    @GetMapping("/teacher/{teacherUsername}")
    public ResponseEntity<List<LectureMaterial>> getMaterialsByTeacher(
            @PathVariable String teacherUsername) {
        return new ResponseEntity<>(materialService.getMaterialsByTeacher(teacherUsername), HttpStatus.OK);
    }

    /**
     * GET /materials/my
     * Get all materials uploaded by the currently authenticated teacher.
     */
    @GetMapping("/my")
    public ResponseEntity<List<LectureMaterial>> getMyMaterials(
            @RequestHeader("username") String teacherUsername) {
        return new ResponseEntity<>(materialService.getMaterialsByTeacher(teacherUsername), HttpStatus.OK);
    }

    /**
     * GET /materials/{id}
     * Get material by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LectureMaterial> getMaterialById(@PathVariable Integer id) {
        return materialService.getMaterialById(id)
                .map(m -> new ResponseEntity<>(m, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /materials/category/{category}
     * Get materials by course category.
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LectureMaterial>> getMaterialsByCategory(
            @PathVariable String category) {
        return new ResponseEntity<>(materialService.getMaterialsByCategory(category), HttpStatus.OK);
    }

    /**
     * DELETE /materials/{id}
     * Delete a material. Only the owning teacher can delete (enforced in service layer).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaterial(
            @PathVariable Integer id,
            @RequestHeader("username") String teacherUsername) {
        try {
            materialService.deleteMaterial(id, teacherUsername);
            return new ResponseEntity<>("Material deleted successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Access denied or material not found", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * PUT /materials/{id}/transcript
     * Add or update transcript text for a material.
     */
    @PutMapping("/{id}/transcript")
    public ResponseEntity<LectureMaterial> updateTranscript(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            @RequestHeader("username") String teacherUsername) {
        String transcript = body.get("transcript");
        try {
            LectureMaterial updated = materialService.updateTranscript(id, transcript, teacherUsername);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}
