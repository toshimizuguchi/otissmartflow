# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copia arquivos do projeto
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Compila o JAR
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Define porta fixa 8080 para o Render reconhecer imediatamente
EXPOSE 8080

# Executa fixando porta 8080 e limitando memória com folga para o plano Free (512MB)
ENTRYPOINT ["java", "-Xmx280m", "-Xms128m", "-XX:+UseSerialGC", "-Dserver.port=8080", "-jar", "app.jar"]
