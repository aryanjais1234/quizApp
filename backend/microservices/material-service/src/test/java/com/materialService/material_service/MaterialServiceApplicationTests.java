package com.materialService.material_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "eureka.client.enabled=false",
        "supabase.url=https://test.supabase.co",
        "supabase.service-key=test-key",
        "supabase.bucket=test-bucket"
})
class MaterialServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
