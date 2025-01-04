# OpenTelemetry实践指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. OpenTelemetry概述

### 1.1 核心功能
- 分布式追踪
- 指标收集
- 日志管理
- 上下文传播
- 自动检测
- 多语言支持

### 1.2 架构组件
- API
- SDK
- Collector
- Exporters
- Processors
- Receivers

## 2. 部署配置

### 2.1 Collector部署
```yaml
# otel-collector-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector
spec:
  replicas: 2
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      containers:
      - name: otel-collector
        image: otel/opentelemetry-collector:latest
        ports:
        - containerPort: 4317 # OTLP gRPC
        - containerPort: 4318 # OTLP HTTP
        - containerPort: 8888 # Prometheus metrics
        volumeMounts:
        - name: config
          mountPath: /conf
        resources:
          limits:
            cpu: 1
            memory: 2Gi
          requests:
            cpu: 200m
            memory: 400Mi
      volumes:
      - name: config
        configMap:
          name: otel-collector-config
```

### 2.2 Collector配置
```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 1500
  resourcedetection:
    detectors: [env, system]
    timeout: 10s

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  logging:
    loglevel: debug
  jaeger:
    endpoint: jaeger-collector:14250
    tls:
      insecure: true
  elasticsearch:
    endpoints: ["http://elasticsearch:9200"]

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [jaeger]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [elasticsearch]
```

## 3. 应用集成

### 3.1 Java应用集成
```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-api</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-sdk</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

```java
// Tracer配置
OpenTelemetrySdk sdk = OpenTelemetrySdk.builder()
    .setTracerProvider(
        SdkTracerProvider.builder()
            .addSpanProcessor(BatchSpanProcessor.builder(
                OtlpGrpcSpanExporter.builder()
                    .setEndpoint("http://localhost:4317")
                    .build())
                .build())
            .build())
    .build();

Tracer tracer = sdk.getTracer("instrumentation-library-name", "1.0.0");

// 创建Span
Span span = tracer.spanBuilder("my-span").startSpan();
try (Scope scope = span.makeCurrent()) {
    // 业务逻辑
} finally {
    span.end();
}
```

### 3.2 Python应用集成
```python
# requirements.txt
opentelemetry-api
opentelemetry-sdk
opentelemetry-instrumentation
opentelemetry-exporter-otlp

# app.py
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# 配置Tracer
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# 配置Exporter
otlp_exporter = OTLPSpanExporter(
    endpoint="localhost:4317",
    insecure=True
)
span_processor = BatchSpanProcessor(otlp_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# 使用Tracer
with tracer.start_as_current_span("my-operation") as span:
    span.set_attribute("operation.value", 123)
    # 业务逻辑
```

## 4. 自动检测

### 4.1 Java自动检测
```bash
# 启动参数
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=my-service \
     -Dotel.traces.exporter=otlp \
     -Dotel.metrics.exporter=otlp \
     -Dotel.logs.exporter=otlp \
     -Dotel.exporter.otlp.endpoint=http://localhost:4317 \
     -jar my-application.jar
```

### 4.2 Python自动检测
```python
# 安装自动检测包
pip install opentelemetry-instrumentation-flask
pip install opentelemetry-instrumentation-requests

# 配置自动检测
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()
```

## 5. 数据导出配置

### 5.1 Prometheus导出
```yaml
# prometheus-config.yaml
scrape_configs:
  - job_name: 'otel-collector'
    scrape_interval: 10s
    static_configs:
      - targets: ['otel-collector:8889']
```

### 5.2 Jaeger导出
```yaml
# jaeger-config.yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: jaeger
spec:
  strategy: production
  collector:
    options:
      collector.otlp.enabled: true
```

## 6. 最佳实践

### 6.1 采样策略
- 基于速率采样
- 基于优先级采样
- 基于规则采样
- 自适应采样

### 6.2 性能优化
- 批处理配置
- 内存限制
- 缓冲设置
- 并发控制

### 6.3 高可用配置
- 多副本部署
- 负载均衡
- 故障转移
- 资源隔离

## 7. 监控与运维

### 7.1 健康检查
- Collector状态
- Pipeline状态
- 资源使用
- 延迟监控

### 7.2 故障排查
- 日志分析
- 指标监控
- 链路分析
- 性能分析

## 8. 扩展开发

### 8.1 自定义Processor
```go
type customProcessor struct {
    nextConsumer consumer.Traces
}

func (p *customProcessor) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
    // 自定义处理逻辑
    return p.nextConsumer.ConsumeTraces(ctx, td)
}
```

### 8.2 自定义Exporter
```go
type customExporter struct {
    client *http.Client
}

func (e *customExporter) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
    // 自定义导出逻辑
    return nil
}
```

## 参考资料
1. OpenTelemetry官方文档
2. OpenTelemetry Collector文档
3. OpenTelemetry自动检测指南
4. 分布式追踪最佳实践 