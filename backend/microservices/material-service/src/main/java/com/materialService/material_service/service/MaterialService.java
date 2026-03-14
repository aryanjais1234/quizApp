package com.materialService.material_service.service;

import com.materialService.material_service.dao.LectureMaterialRepository;
import com.materialService.material_service.model.LectureMaterial;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    @Autowired
    private LectureMaterialRepository repository;

    @Autowired
    private SupabaseStorageService storageService;

    public LectureMaterial uploadMaterial(MultipartFile file,
                                          String title,
                                          String description,
                                          String category,
                                          String teacherUsername) throws IOException {
        String fileUrl = storageService.uploadFile(file, teacherUsername);

        LectureMaterial material = new LectureMaterial();
        material.setTitle(title);
        material.setDescription(description);
        material.setCategory(category);
        material.setTeacherUsername(teacherUsername);
        material.setFileUrl(fileUrl);
        material.setFileName(file.getOriginalFilename());
        material.setFileType(file.getContentType());
        material.setFileSize(file.getSize());
        material.setUploadedAt(LocalDateTime.now());

        return repository.save(material);
    }

    public List<LectureMaterial> getMaterialsByTeacher(String teacherUsername) {
        return repository.findByTeacherUsername(teacherUsername);
    }

    public Optional<LectureMaterial> getMaterialById(Integer id) {
        return repository.findById(id);
    }

    public List<LectureMaterial> getMaterialsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public void deleteMaterial(Integer id, String teacherUsername) {
        LectureMaterial material = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));

        if (!material.getTeacherUsername().equals(teacherUsername)) {
            throw new RuntimeException("Access denied: You can only delete your own materials");
        }

        storageService.deleteFile(material.getFileUrl());
        repository.deleteById(id);
    }

    public LectureMaterial updateTranscript(Integer id, String transcript, String teacherUsername) {
        LectureMaterial material = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));

        if (!material.getTeacherUsername().equals(teacherUsername)) {
            throw new RuntimeException("Access denied: You can only update your own materials");
        }

        material.setTranscript(transcript);
        return repository.save(material);
    }
}
