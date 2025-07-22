package com.Service.api_gateway.security;

import com.Service.api_gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.cloud.gateway.filter.GatewayFilter;

import java.util.Objects;


@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    @Autowired
    private RestTemplate template;

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthFilter(){
        super(Config.class);
        System.out.println("AuthenticationFilter triggered for: ");
    }



    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            System.out.println("AuthenticationFilter triggered for: " + exchange.getRequest().getPath());
            if(validator.isSecured.test(exchange.getRequest())){
                // header contains token or not
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)){
                    throw new RuntimeException("Missing authorization header");
                }
                String authHeader = Objects.requireNonNull(exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION)).get(0);

                if(authHeader!=null && authHeader.startsWith("Bearer ")){
                    authHeader = authHeader.substring(7);
                }
                try {
                    // REST call to AUTH Service
//                    template.getForObject("http://USER-SERVICE//validate?token"+authHeader, String.class);
                    jwtUtil.validateToken(authHeader);
                }catch (Exception e){
                    throw new RuntimeException("Unauthorized access");
                }
            }
            return chain.filter(exchange);
        });
    }

    public static class Config{

    }


}

