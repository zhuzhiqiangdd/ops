# Loki日志系统

## 1. 基本概念

### 1.1 Loki简介
1. 核心功能
   - 日志聚合
   - 标签索引
   - 日志查询
   - 告警管理

2. 主要特点
   - 轻量级架构
   - 高效存储
   - 成本低廉
   - Prometheus集成

### 1.2 数据模型
1. 标签系统
   - 键值对标签
   - 动态标签
   - 静态标签
   - 系统标签

2. 日志流
   - 流标识
   - 时间序列
   - 数据压缩
   - 数据索引

## 2. 架构设计

### 2.1 核心组件
1. Distributor
   - 请求处理
   - 数据验证
   - 负载均衡
   - 数据分发

2. Ingester
   - 数据写入
   - 内存缓存
   - 数据压缩
   - 数据持久化

3. Querier
   - 查询处理
   - 数据聚合
   - 结果返回
   - 缓存管理

### 2.2 部署架构
1. 单节点部署
```yaml
version: '3'
services:
  loki:
    image: grafana/loki:2.4.0
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    
  promtail:
    image: grafana/promtail:2.4.0
    volumes:
      - /var/log:/var/log
    command: -config.file=/etc/promtail/config.yml
```

2. 集群部署
```yaml
version: '3'
services:
  loki-1:
    image: grafana/loki:2.4.0
    command: -config.file=/etc/loki/config.yaml
    ports:
      - "3100:3100"
      
  loki-2:
    image: grafana/loki:2.4.0
    command: -config.file=/etc/loki/config.yaml
    
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## 3. 配置管理

### 3.1 Loki配置
1. 基础配置
```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb:
    directory: /tmp/loki/index

  filesystem:
    directory: /tmp/loki/chunks
```

2. 存储配置
```yaml
storage_config:
  aws:
    s3: s3://access_key:secret_access_key@region/bucket_name
    dynamodb:
      dynamodb_url: dynamodb://access_key:secret_access_key@region

schema_config:
  configs:
    - from: 2020-05-15
      store: aws
      object_store: s3
      schema: v11
      index:
        prefix: index_
        period: 24h
```

### 3.2 Promtail配置
1. 采集配置
```yaml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log
```

2. 处理配置
```yaml
scrape_configs:
  - job_name: system
    pipeline_stages:
      - regex:
          expression: '(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (?P<level>\w+) (?P<message>.*)'
      - labels:
          level:
      - timestamp:
          source: timestamp
          format: '2006-01-02 15:04:05'
```

## 4. 查询与告警

### 4.1 LogQL查询
1. 基础查询
```logql
# 查询包含error的日志
{app="myapp"} |= "error"

# 按日志级别过滤
{app="myapp"} | json | level="error"

# 统计错误数量
count_over_time({app="myapp"} |= "error" [1h])

# 提取字段
{app="myapp"} | json | line_format "{{.message}}"
```

2. 高级查询
```logql
# 正则匹配
{app="myapp"} |~ "error.*timeout"

# 标签过滤
{app="myapp", environment="prod"}

# 聚合查询
sum(rate({app="myapp"} |= "error" [5m])) by (job)

# 多条件查询
{app="myapp"} |= "error" != "timeout" | json | status_code>=500
```

### 4.2 告警规则
1. 告警配置
```yaml
groups:
  - name: loki_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate({app="myapp"} |= "error" [5m])) by (job)
          > 0.1
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
```

2. 通知配置
```yaml
alertmanager_config:
  receivers:
    - name: 'email'
      email_configs:
        - to: 'team@example.com'
          from: 'loki@example.com'
          smarthost: 'smtp.example.com:587'
          auth_username: 'loki'
          auth_password: 'password'
```

## 5. 最佳实践

### 5.1 性能优化
1. 采集优化
   - 标签设计
   - 过滤规则
   - 采集频率
   - 数据压缩

2. 查询优化
   - 索引利用
   - 查询范围
   - 缓存使用
   - 并发控制

### 5.2 运维建议
1. 监控管理
   - 系统监控
   - 性能监控
   - 资源监控
   - 告警配置

2. 问题处理
   - 数据延迟
   - 查询超时
   - 存储问题
   - 性能问题 