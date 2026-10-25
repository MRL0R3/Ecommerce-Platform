# Multi-stage build for Eureka server.
# Context must be repo root so Maven can resolve the parent POM.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY common-lib ./common-lib
COPY eureka-server ./eureka-server
COPY config-server ./config-server
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY product-service ./product-service
COPY inventory-service ./inventory-service
COPY order-service ./order-service
RUN mvn -pl eureka-server -am package -DskipTests -q

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /workspace/eureka-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
