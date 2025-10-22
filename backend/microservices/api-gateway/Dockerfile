# Stage 1: Build
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/api-gateway-0.0.1-SNAPSHOT.jar app.jar

# ENV variables for DB connection
#ENV SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/questionDB
#ENV SPRING_DATASOURCE_USERNAME=postgres
#ENV SPRING_DATASOURCE_PASSWORD=aryan

EXPOSE 8765
ENTRYPOINT ["java", "-jar", "app.jar"]
