# Cache Dependencies

## Option 1: Caffeine Cache (Recommended)

Add to `pom.xml`:

```xml
<!-- Caffeine Cache -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>3.1.8</version>
</dependency>

<!-- Spring Boot Caffeine Cache Support -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

## Option 2: Simple In-Memory Cache (Current Implementation)

Uses `ConcurrentHashMap` with scheduled cleanup - no additional dependencies required.

## Installation

If you want to use Caffeine (better performance and features):

```bash
# Add dependencies to pom.xml, then:
mvn clean install
```

The current implementation uses a simple ConcurrentHashMap-based cache that works out of the box.
