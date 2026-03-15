package com.materialService.material_service.service;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "supabase")
@Component
@Getter
@Setter
public class SupabaseConfig {

    private String url;
    private String serviceKey;
    private String bucket;
}