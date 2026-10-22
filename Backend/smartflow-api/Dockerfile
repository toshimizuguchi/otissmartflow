# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copia dependências e código-fonte
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Dá permissão de execução ao mvnw e compila gerando o .jar
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Runtime stage (imagem enxuta)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia apenas o .jar compilado
COPY --from=build /app/target/*.jar app.jar

# Render atribui dinamicamente a porta através da variável $PORT
ENV PORT=8080
EXPOSE 8080

# Flags de memória otimizadas para caber com folga no plano Free (512MB RAM) do Render
ENTRYPOINT ["java", "-Xmx350m", "-Xms200m", "-XX:+UseSerialGC", "-Dserver.port=${PORT}", "-jar", "app.jar"]
