# API网关实践指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 基础概念

### 1.1 API网关定义
- 统一接入层：集中管理API请求
- 路由转发：请求分发到后端服务
- 协议转换：支持多种协议转换
- 安全防护：统一的安全控制

### 1.2 核心功能
- 请求路由
- 负载均衡
- 认证鉴权
- 限流熔断
- 协议转换
- 日志监控

## 2. 主流实现方案

### 2.1 Spring Cloud Gateway
```yaml
# gateway-config.yaml
spring:
  cloud:
    gateway:
      routes:
      - id: user_service
        uri: lb://user-service
        predicates:
        - Path=/api/users/**
        filters:
        - StripPrefix=1
        - name: CircuitBreaker
          args:
            name: userServiceBreaker
            fallbackUri: forward:/fallback
      - id: order_service
        uri: lb://order-service
        predicates:
        - Path=/api/orders/**
        filters:
        - StripPrefix=1
        - name: RequestRateLimiter
          args:
            redis-rate-limiter.replenishRate: 10
            redis-rate-limiter.burstCapacity: 20
```

### 2.2 Kong网关
```yaml
# kong.yaml
_format_version: "2.1"
_transform: true

services:
- name: user-service
  url: http://user-service:8080
  routes:
  - name: user-route
    paths:
    - /api/users
    strip_path: true
  plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: local
  - name: key-auth
    config:
      key_names:
      - apikey

- name: order-service
  url: http://order-service:8080
  routes:
  - name: order-route
    paths:
    - /api/orders
    strip_path: true
```

## 3. 路由配置

### 3.1 基础路由
```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: basic_route
        uri: http://localhost:8080
        predicates:
        - Path=/api/**
        filters:
        - StripPrefix=1
```

### 3.2 动态路由
```java
@Configuration
public class DynamicRouteConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("path_route", r -> r
                .path("/api/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .addRequestHeader("X-Request-Source", "Gateway"))
                .uri("lb://backend-service"))
            .build();
    }
}
```

## 4. 过滤器实现

### 4.1 全局过滤器
```java
@Component
public class GlobalAuthFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
}
```

### 4.2 自定义过滤器
```java
public class CustomGatewayFilter implements GatewayFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        exchange.getRequest().mutate()
            .header("X-Custom-Header", "CustomValue")
            .build();
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
```

## 5. 安全配置

### 5.1 认证配置
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://auth-server/.well-known/jwks.json
```

### 5.2 跨域配置
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "https://example.com"
            allowedMethods:
            - GET
            - POST
            allowedHeaders: "*"
            maxAge: 3600
```

## 6. 高可用配置

### 6.1 集群部署
```yaml
# gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: api-gateway:latest
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
```

### 6.2 负载均衡
```yaml
# gateway-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: api-gateway
```

## 7. 监控运维

### 7.1 监控指标
```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: ${spring.application.name}
```

### 7.2 日志配置
```yaml
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    reactor.netty: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## 8. 最佳实践

### 8.1 路由配置
- 合理规划路由规则
- 实现动态路由更新
- 配置路由重试机制
- 设置超时时间

### 8.2 安全防护
- 实施认证鉴权
- 配置跨域策略
- 防止SQL注入
- 限制请求大小

### 8.3 性能优化
- 启用响应缓存
- 配置连接池
- 优化路由匹配
- 启用压缩

## 9. 常见问题

### 9.1 性能问题
- 路由延迟高
- 内存占用大
- 连接数过多
- CPU使用率高

### 9.2 配置问题
- 路由不生效
- 跨域配置错误
- 认证失败
- 限流不准确

## 参考资料
1. Spring Cloud Gateway文档
2. Kong网关文档
3. API网关最佳实践
4. 微服务安全架构 