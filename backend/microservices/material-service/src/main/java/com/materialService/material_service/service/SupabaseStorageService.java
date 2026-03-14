package com.materialService.material_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseServiceKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Uploads a file to Supabase Storage and returns the public URL.
     */
    public String uploadFile(MultipartFile file, String teacherUsername) throws IOException {
        String uniqueFileName = teacherUsername + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + uniqueFileName;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseServiceKey);
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream"
        ));
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + uniqueFileName;
    }

    /**
     * Deletes a file from Supabase Storage given its public URL.
     */
    public void deleteFile(String fileUrl) {
        String prefix = supabaseUrl + "/storage/v1/object/public/" + bucket + "/";
        if (!fileUrl.startsWith(prefix)) {
            return;
        }
        String filePath = fileUrl.substring(prefix.length());
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseServiceKey);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
    }
}
