# Prometheus实践指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. Prometheus基础

### 1.1 核心概念
1. 基本功能
   - 时序数据库
   - 数据采集
   - 查询语言
   - 告警管理

2. 主要特点
   - 多维数据模型
   - 灵活的查询语言
   - 无依赖存储
   - 高效的采集机制

### 1.2 数据模型
1. 指标类型
   - Counter(计数器)
   - Gauge(仪表盘)
   - Histogram(直方图)
   - Summary(摘要)

2. 标签系统
   - 键值对标签
   - 多维度查询
   - 动态过滤
   - 灵活聚合

### 1.3 架构组件
- Prometheus Server
  - 时序数据库
  - 数据采集
  - 查询引擎
- Alertmanager
  - 告警管理
  - 告警路由
  - 告警抑制
- Exporters
  - node_exporter
  - blackbox_exporter
  - mysql_exporter
- Push Gateway
  - 短生命周期任务
  - 批处理任务
  - 防火墙后的任务

## 2. 部署配置

### 2.1 基础部署
```yaml
# docker-compose.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
    ports:
      - "9090:9090"

  alertmanager:
    image: prom/alertmanager:latest
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
    ports:
      - "9093:9093"

volumes:
  prometheus_data:
```

### 2.2 Kubernetes部署
```yaml
# prometheus-operator-values.yaml
prometheus:
  prometheusSpec:
    retention: 15d
    resources:
      requests:
        memory: "2Gi"
        cpu: "500m"
      limits:
        memory: "4Gi"
        cpu: "1000m"
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: standard
          resources:
            requests:
              storage: 50Gi

alertmanager:
  alertmanagerSpec:
    retention: 120h
    resources:
      requests:
        memory: "500Mi"
        cpu: "200m"
      limits:
        memory: "1Gi"
        cpu: "500m"
```

### 2.3 基础配置
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s
  external_labels:
    monitor: 'my-monitor'

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

storage:
  tsdb:
    path: /data/prometheus
    retention.time: 15d
    retention.size: 50GB
```

## 3. 数据采集配置

### 3.1 静态配置
```yaml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']

  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

### 3.2 服务发现
```yaml
scrape_configs:
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - source_labels: [__meta_kubernetes_node_name]
        target_label: node

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

## 4. 查询与告警

### 4.1 PromQL查询
1. 基础查询
```promql
# 查询HTTP请求总数
http_requests_total

# 按状态码统计请求数
sum(http_requests_total) by (status_code)

# 计算5分钟内的请求率
rate(http_requests_total[5m])

# 查询CPU使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

2. 高级查询
```promql
# 聚合查询
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (pod)

# 范围查询
http_requests_total{status=~"5.."}

# 数学运算
(node_memory_MemTotal_bytes - node_memory_MemFree_bytes) 
  / node_memory_MemTotal_bytes * 100
```

### 4.2 告警规则
```yaml
groups:
- name: node_alerts
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High CPU usage on {{ $labels.instance }}
      description: CPU usage is above 80% for 5 minutes

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High memory usage on {{ $labels.instance }}
```

### 4.3 告警通知
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'default-receiver'

receivers:
- name: 'default-receiver'
  email_configs:
  - to: 'team@example.com'
    from: 'alertmanager@example.com'
    smarthost: smtp.example.com:587
    auth_username: 'alertmanager'
    auth_password: 'password'
```

## 5. 集成方案

### 5.1 Grafana集成
```yaml
# grafana-datasource.yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      timeInterval: "5s"
      queryTimeout: "30s"
```

### 5.2 AlertManager集成
```yaml
# alertmanager.yml
route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'web.hook'
receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://127.0.0.1:5001/'
```

## 6. 性能优化

### 6.1 存储优化
- 合理设置数据保留时间
- 使用本地SSD存储
- 优化TSDB块大小
- 实施数据压缩策略

### 6.2 查询优化
- 避免高基数查询
- 使用记录规则预计算
- 优化标签设计
- 合理使用聚合

### 6.3 资源配置
- CPU资源调优
- 内存限制设置
- 磁盘IOPS优化
- 网络带宽配置

## 7. 运维管理

### 7.1 监控策略
1. 监控范围
   - 系统监控
   - 应用监控
   - 业务监控
   - 日志监控

2. 告警策略
   - 告警级别
   - 告警阈值
   - 告警渠道
   - 告警升级

### 7.2 备份恢复
- 快照备份
- 增量备份
- 数据恢复
- 配置备份

### 7.3 问题处理
- 采集失败
- 数据丢失
- 告警异常
- 性能问题

## 参考资料
1. Prometheus官方文档
2. Prometheus最佳实践指南
3. PromQL查询语言文档
4. Grafana集成指南 