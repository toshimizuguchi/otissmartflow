# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copia dependências e código-fonte
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Garante permissão de execução e compila
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia o jar gerado
COPY --from=build /app/target/*.jar app.jar

# Spring Boot lê automaticamente a variável PORT injetada pelo Render
EXPOSE 8080 10000

# Execução com shell para respeitar as variáveis de ambiente e otimização de memória RAM
ENTRYPOINT ["sh", "-c", "java -Xmx350m -Xms200m -XX:+UseSerialGC -Dserver.port=${PORT:-8080} -jar app.jar"]
