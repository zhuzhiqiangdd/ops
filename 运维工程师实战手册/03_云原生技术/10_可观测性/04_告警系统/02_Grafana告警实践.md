# Grafana告警系统

## 1. 基本概念

### 1.1 Grafana告警简介
1. 核心功能
   - 告警规则
   - 告警通知
   - 告警历史
   - 告警分组

2. 主要特点
   - 可视化配置
   - 多数据源
   - 灵活通知
   - 统一管理

### 1.2 告警模型
1. 基础概念
   - Alert Rule(告警规则)
   - Notification(通知)
   - Contact Point(联系点)
   - Alert Group(告警组)

2. 数据流转
   - 数据采集
   - 规则评估
   - 告警触发
   - 通知发送

## 2. 架构设计

### 2.1 核心组件
1. Alert Rule Engine
   - 规则管理
   - 数据查询
   - 条件评估
   - 状态维护

2. Notification System
   - 通知管理
   - 模板渲染
   - 通道分发
   - 历史记录

3. Contact Points
   - Email
   - Webhook
   - Slack
   - 钉钉/企业微信

### 2.2 部署架构
1. 单机部署
```yaml
version: '3'
services:
  grafana:
    image: grafana/grafana:8.4.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_UNIFIED_ALERTING_ENABLED=true
    volumes:
      - grafana-data:/var/lib/grafana
```

2. 高可用部署
```yaml
version: '3'
services:
  grafana-1:
    image: grafana/grafana:8.4.0
    environment:
      - GF_SERVER_ROOT_URL=http://grafana-1:3000
      - GF_UNIFIED_ALERTING_HA_PEERS=grafana-2:9094,grafana-3:9094
    ports:
      - "3000:3000"
      
  grafana-2:
    image: grafana/grafana:8.4.0
    environment:
      - GF_SERVER_ROOT_URL=http://grafana-2:3000
      - GF_UNIFIED_ALERTING_HA_PEERS=grafana-1:9094,grafana-3:9094
      
  grafana-3:
    image: grafana/grafana:8.4.0
    environment:
      - GF_SERVER_ROOT_URL=http://grafana-3:3000
      - GF_UNIFIED_ALERTING_HA_PEERS=grafana-1:9094,grafana-2:9094
```

## 3. 配置管理

### 3.1 告警规则
1. 基础规则
```json
{
  "name": "High CPU Usage",
  "type": "alerting",
  "conditions": [
    {
      "type": "query",
      "query": {
        "params": ["A", "5m", "now"]
      },
      "reducer": {
        "type": "avg",
        "params": []
      },
      "evaluator": {
        "type": "gt",
        "params": [80]
      }
    }
  ],
  "noDataState": "no_data",
  "executionErrorState": "alerting"
}
```

2. 高级规则
```json
{
  "name": "Service Health",
  "type": "alerting",
  "conditions": [
    {
      "type": "query",
      "query": {
        "params": ["A", "5m", "now"]
      },
      "reducer": {
        "type": "last",
        "params": []
      },
      "evaluator": {
        "type": "range",
        "params": [0, 0.9]
      }
    }
  ],
  "notifications": [
    {
      "uid": "team-a-email"
    }
  ],
  "message": "Service health is below 90%"
}
```

### 3.2 通知配置
1. Email配置
```yaml
apiVersion: 1
contactPoints:
  - name: email
    receivers:
      - type: email
        settings:
          addresses: team@example.com
        disableResolveMessage: false
```

2. Webhook配置
```yaml
apiVersion: 1
contactPoints:
  - name: webhook
    receivers:
      - type: webhook
        settings:
          url: http://example.com/webhook
          httpMethod: POST
          maxAlerts: 10
```

## 4. 告警管理

### 4.1 告警模板
1. 通知模板
```html
{{ define "email.message" }}
告警名称: {{ .Alert.Name }}
告警级别: {{ .Alert.Labels.severity }}
告警状态: {{ .Alert.State }}
告警详情: {{ .Alert.Annotations.description }}
开始时间: {{ .Alert.StartsAt }}
{{ end }}
```

2. 自定义模板
```html
{{ define "custom.message" }}
<h1>告警通知</h1>
<table>
  <tr>
    <td>告警名称</td>
    <td>{{ .Alert.Name }}</td>
  </tr>
  <tr>
    <td>告警级别</td>
    <td>{{ .Alert.Labels.severity }}</td>
  </tr>
  <tr>
    <td>告警详情</td>
    <td>{{ .Alert.Annotations.description }}</td>
  </tr>
</table>
{{ end }}
```

### 4.2 告警策略
1. 分组策略
```yaml
groups:
  - name: example
    folder: Server Alerts
    interval: 1m
    rules:
      - title: High Memory Usage
        condition: A
        data:
          - refId: A
            datasourceUid: prometheus
            model:
              expr: 'avg(node_memory_used_bytes / node_memory_total_bytes) * 100'
```

2. 通知策略
```yaml
policies:
  - orgId: 1
    receiver: team-a
    group_by: ['alertname', 'cluster', 'service']
    repeat_interval: 4h
    routes:
      - receiver: 'team-b'
        matchers:
          - severity = 'critical'
```

## 5. 最佳实践

### 5.1 规则优化
1. 规则设计
   - 合理阈值
   - 评估周期
   - 持续时间
   - 恢复条件

2. 分组管理
   - 业务分组
   - 级别分组
   - 团队分组
   - 区域分组

### 5.2 运维建议
1. 监控管理
   - 规则监控
   - 性能监控
   - 通知监控
   - 历史记录

2. 问题处理
   - 误报处理
   - 漏报处理
   - 延迟处理
   - 恢复确认 