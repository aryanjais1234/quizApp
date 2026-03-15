package com.materialService.material_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Autowired
    private SupabaseConfig config;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Uploads a file to Supabase Storage and returns the public URL.
     */
    public String uploadFile(MultipartFile file, String teacherUsername) throws IOException {
        String uniqueFileName = teacherUsername + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        String uploadUrl = config.getUrl() + "/storage/v1/object/" + config.getBucket() + "/" + uniqueFileName;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + config.getServiceKey());
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream"
        ));
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

        return config.getUrl() + "/storage/v1/object/public/" + config.getBucket() + "/" + uniqueFileName;
    }

    /**
     * Deletes a file from Supabase Storage given its public URL.
     */
    public void deleteFile(String fileUrl) {
        String prefix = config.getUrl() + "/storage/v1/object/public/" + config.getBucket() + "/";
        if (!fileUrl.startsWith(prefix)) {
            return;
        }
        String filePath = fileUrl.substring(prefix.length());
        String deleteUrl = config.getUrl() + "/storage/v1/object/" + config.getBucket() + "/" + filePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + config.getServiceKey());

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
    }
}
