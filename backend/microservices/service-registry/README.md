# 📡 Service Registry — Eureka Discovery Server

Spring Cloud Netflix Eureka Server that provides service discovery and registration for all QuizApp microservices. Enables dynamic routing, load balancing, and health monitoring across the platform.

**Service Type:** 🔍 Infrastructure — Service Discovery

---

## Architecture Overview

```
                    ┌─────────────────────────┐
                    │   Eureka Server (8761)   │
                    │   Service Discovery      │
                    └───────────┬─────────────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
   API Gateway  User Svc   Question Svc  Quiz Svc  Material Svc
    (8765)       (8091)      (8086)       (8081)     (8082)
```

Every microservice registers itself with Eureka on startup. The API Gateway queries Eureka to discover healthy instances and routes traffic accordingly.

---

## Features

- **Service registration & deregistration** — microservices register on startup and deregister on shutdown
- **Health check monitoring** — periodic heartbeats ensure only healthy instances receive traffic
- **Dashboard UI** — built-in web console at [http://localhost:8761](http://localhost:8761) showing all registered services
- **Dynamic service discovery** — the API Gateway resolves service locations at runtime via Eureka
- **No database required** — all registry state is held in memory (infrastructure-only service)

---

## Entity

None — this is a pure infrastructure service with no domain entities or database.

---

## Configuration

### `application.yml`

```yaml
spring:
  application:
    name: service-registry

server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    fetch-registry: false
    register-with-eureka: false
```

| Property                              | Value              | Description                                      |
|---------------------------------------|--------------------|--------------------------------------------------|
| `server.port`                         | `8761`             | Default Eureka port                              |
| `spring.application.name`             | `service-registry` | Service name in the ecosystem                    |
| `eureka.instance.hostname`            | `localhost`        | Hostname advertised to clients                   |
| `eureka.client.fetch-registry`        | `false`            | Server does not fetch the registry from itself   |
| `eureka.client.register-with-eureka`  | `false`            | Server does not register itself as a client      |

---

## Tech Stack

| Technology                          | Purpose                   |
|-------------------------------------|---------------------------|
| Spring Boot 3.5.3                   | Application framework     |
| Spring Cloud Netflix Eureka Server  | Service discovery server  |
| Java 17                             | Runtime                   |
| Maven                               | Build & dependency mgmt   |

---

## How to Run

### Local

```bash
cd backend/microservices/service-registry
mvn spring-boot:run
```

The Eureka dashboard will be available at [http://localhost:8761](http://localhost:8761).

### Docker

The service is included in the project's `docker-compose.yml`:

```bash
docker-compose up --build service-registry
```

### Access

| URL                        | Description            |
|----------------------------|------------------------|
| http://localhost:8761      | Eureka Dashboard UI    |
| http://localhost:8761/eureka/apps | REST API — all registered apps |

---

## Project Structure

```
service-registry/
├── src/main/java/com/Service/service_registry/
│   └── ServiceRegistryApplication.java    ← @EnableEurekaServer
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml
```

---

## Service Registration Flow

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Microservice │         │  Eureka Server   │         │  API Gateway │
│  (e.g. Quiz) │         │     (8761)       │         │   (8765)     │
└──────┬───────┘         └────────┬─────────┘         └──────┬───────┘
       │                          │                          │
       │  1. POST /eureka/apps    │                          │
       │  ───────────────────►    │                          │
       │  (register on startup)   │                          │
       │                          │                          │
       │  2. Heartbeat (30s)      │                          │
       │  ───────────────────►    │                          │
       │  (renew lease)           │                          │
       │                          │                          │
       │                          │  3. GET /eureka/apps     │
       │                          │  ◄───────────────────    │
       │                          │  (fetch registry)        │
       │                          │                          │
       │                          │  4. Return instances     │
       │                          │  ───────────────────►    │
       │                          │                          │
       │                          │          5. Route request to healthy instance
       │  ◄──────────────────────────────────────────────    │
       │  (load-balanced traffic)                            │
       │                          │                          │
       │  6. DELETE /eureka/apps  │                          │
       │  ───────────────────►    │                          │
       │  (deregister on shutdown)│                          │
       └──────────────────────────┴──────────────────────────┘
```

1. **Startup** — each microservice sends a registration request to Eureka with its host, port, and health URL.
2. **Heartbeat** — registered services send a heartbeat every 30 seconds; Eureka evicts instances that miss renewals.
3. **Discovery** — the API Gateway periodically fetches the service registry to learn available instances.
4. **Routing** — the gateway uses the registry to load-balance incoming requests across healthy instances.
5. **Shutdown** — services send a deregistration request so they are removed from the registry immediately.

---

## Service Registration

All QuizApp microservices register with Eureka by including the `spring-cloud-starter-netflix-eureka-client` dependency and setting `eureka.client.service-url.defaultZone=http://service-registry:8761/eureka` in their configuration. The API Gateway uses Eureka service names (e.g., `QUIZ-SERVICE`, `USER-SERVICE`) to route and load-balance requests.
