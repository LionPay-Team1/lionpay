FROM gradle:9.2-jdk25-alpine AS build
WORKDIR /app

# Copy gradle definition files first for caching
COPY lionpay-auth/gradlew lionpay-auth/gradlew.bat ./
COPY lionpay-auth/gradle/ ./gradle/
COPY lionpay-auth/build.gradle lionpay-auth/settings.gradle ./

# Grant execution permission
RUN chmod +x gradlew

# Download dependencies (cached as long as dependencies don't change)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY lionpay-auth/src/ ./src/

# Build the jar
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/app.jar app.jar
COPY lionpay-auth/otel-agent/lib/opentelemetry-javaagent.jar opentelemetry-javaagent.jar
ENTRYPOINT ["java", "-javaagent:opentelemetry-javaagent.jar", "-jar", "app.jar"]
