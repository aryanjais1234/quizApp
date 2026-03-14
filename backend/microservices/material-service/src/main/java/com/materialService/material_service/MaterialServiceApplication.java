package com.materialService.material_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MaterialServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaterialServiceApplication.class, args);
    }
}
