# Grafana实践指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. Grafana基础

### 1.1 核心概念
1. 基本功能
   - 数据可视化
   - 仪表盘管理
   - 告警配置
   - 用户管理

2. 主要特点
   - 多数据源支持
   - 丰富的可视化组件
   - 灵活的面板配置
   - 强大的查询编辑器

### 1.2 架构组件
- 数据源管理
  - Prometheus
  - Elasticsearch
  - MySQL
  - InfluxDB
- 仪表盘管理
  - 面板配置
  - 变量管理
  - 权限控制
- 告警系统
  - 告警规则
  - 通知渠道
  - 告警历史

## 2. 部署配置

### 2.1 基础部署
```yaml
# docker-compose.yml
version: '3'
services:
  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"

volumes:
  grafana_data:
```

### 2.2 Kubernetes部署
```yaml
# grafana-values.yaml
grafana:
  persistence:
    enabled: true
    size: 10Gi
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "200m"
  adminPassword: admin
  ingress:
    enabled: true
    hosts:
      - grafana.example.com
```

### 2.3 基础配置
```ini
# grafana.ini
[server]
protocol = http
http_port = 3000
domain = localhost

[security]
admin_user = admin
admin_password = admin
disable_gravatar = true

[auth]
disable_login_form = false
disable_signout_menu = false

[users]
allow_sign_up = false
auto_assign_org = true
auto_assign_org_role = Viewer
```

## 3. 数据源配置

### 3.1 Prometheus数据源
```yaml
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

### 3.2 Elasticsearch数据源
```yaml
apiVersion: 1
datasources:
  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: "[logstash-]YYYY.MM.DD"
    jsonData:
      esVersion: 7.0.0
      timeField: "@timestamp"
      interval: Daily
```

## 4. 仪表盘配置

### 4.1 基础面板
1. Graph面板
```json
{
  "type": "graph",
  "title": "CPU Usage",
  "gridPos": {
    "h": 8,
    "w": 12,
    "x": 0,
    "y": 0
  },
  "targets": [
    {
      "expr": "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)",
      "legendFormat": "{{instance}}"
    }
  ]
}
```

2. Stat面板
```json
{
  "type": "stat",
  "title": "Memory Usage",
  "gridPos": {
    "h": 4,
    "w": 6,
    "x": 12,
    "y": 0
  },
  "targets": [
    {
      "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
      "legendFormat": "Memory Usage"
    }
  ]
}
```

### 4.2 变量配置
```json
{
  "templating": {
    "list": [
      {
        "name": "node",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(node_cpu_seconds_total, instance)",
        "refresh": 2,
        "sort": 1
      }
    ]
  }
}
```

## 5. 告警配置

### 5.1 告警规则
```yaml
apiVersion: 1
groups:
  - name: example
    folder: General
    interval: 1m
    rules:
    - title: High CPU Usage
      condition: B
      data:
      - refId: A
        datasourceUid: prometheus
        model:
          expr: '100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'
      - refId: B
        datasourceUid: __expr__
        model:
          conditions:
          - evaluator:
              params:
              - 80
              type: gt
            operator:
              type: and
            query:
              params:
              - A
            reducer:
              type: last
            type: query
```

### 5.2 通知渠道
```yaml
apiVersion: 1
notifiers:
  - name: Email
    type: email
    uid: email
    settings:
      addresses: team@example.com
    secureSettings:
      password: ""
```

## 6. 性能优化

### 6.1 仪表盘优化
- 合理设置刷新间隔
- 优化查询语句
- 使用变量过滤
- 面板缓存配置

### 6.2 资源配置
- 内存限制设置
- 数据库优化
- 会话管理
- 缓存策略

## 7. 运维管理

### 7.1 用户管理
1. 权限控制
   - 用户角色
   - 组织管理
   - 仪表盘权限
   - API密钥管理

2. 审计日志
   - 用户操作
   - 系统变更
   - 告警历史
   - 登录记录

### 7.2 备份恢复
- 配置备份
- 仪表盘导出
- 数据源备份
- 用户数据备份

## 参考资料
1. Grafana官方文档
2. Grafana最佳实践指南
3. Grafana Dashboard参考
4. Grafana告警配置指南 