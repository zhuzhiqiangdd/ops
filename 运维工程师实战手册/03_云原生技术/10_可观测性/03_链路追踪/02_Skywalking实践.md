# SkyWalking追踪系统

## 1. 基本概念

### 1.1 SkyWalking简介
1. 核心功能
   - 分布式追踪
   - 性能指标
   - 应用拓扑
   - 告警分析

2. 主要特点
   - 低侵入性
   - 高性能
   - 多语言支持
   - 可视化强大

### 1.2 追踪模型
1. 基础概念
   - Trace(追踪)
   - Segment(片段)
   - Span(跨度)
   - Tag(标签)

2. 数据模型
   - Service(服务)
   - Instance(实例)
   - Endpoint(端点)
   - Database(数据库)

## 2. 架构设计

### 2.1 核心组件
1. Agent
   - 数据采集
   - 上下文传递
   - 采样控制
   - 插件扩展

2. OAP Server
   - 数据接收
   - 数据分析
   - 数据存储
   - 查询服务

3. UI
   - 拓扑图
   - 追踪详情
   - 性能指标
   - 告警管理

### 2.2 部署架构
1. 单节点部署
```yaml
version: '3'
services:
  elasticsearch:
    image: elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
      
  oap:
    image: apache/skywalking-oap-server:9.0.0
    environment:
      - SW_STORAGE=elasticsearch
      - SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200
    depends_on:
      - elasticsearch
      
  ui:
    image: apache/skywalking-ui:9.0.0
    environment:
      - SW_OAP_ADDRESS=http://oap:12800
    ports:
      - "8080:8080"
    depends_on:
      - oap
```

2. 集群部署
```yaml
version: '3'
services:
  elasticsearch-1:
    image: elasticsearch:7.17.0
    environment:
      - node.name=es01
      - cluster.name=es-cluster
      - discovery.seed_hosts=elasticsearch-2,elasticsearch-3
      
  elasticsearch-2:
    image: elasticsearch:7.17.0
    environment:
      - node.name=es02
      - cluster.name=es-cluster
      - discovery.seed_hosts=elasticsearch-1,elasticsearch-3
      
  oap-1:
    image: apache/skywalking-oap-server:9.0.0
    environment:
      - SW_CLUSTER=kubernetes
      - SW_CLUSTER_K8S_NAMESPACE=default
      - SW_STORAGE=elasticsearch
      
  oap-2:
    image: apache/skywalking-oap-server:9.0.0
    environment:
      - SW_CLUSTER=kubernetes
      - SW_CLUSTER_K8S_NAMESPACE=default
      - SW_STORAGE=elasticsearch
```

## 3. 配置管理

### 3.1 Agent配置
1. Java Agent配置
```properties
# agent.config
agent.service_name=${SW_AGENT_NAME:Your_ApplicationName}
collector.backend_service=${SW_AGENT_COLLECTOR_BACKEND_SERVICES:127.0.0.1:11800}
agent.sample_n_per_3_secs=${SW_AGENT_SAMPLE:1}
agent.authentication=${SW_AGENT_AUTHENTICATION:}
```

2. 采样配置
```properties
# sampling.config
agent.sample_n_per_3_secs=1
agent.trace_segment_ref_limit_per_span=500
agent.ignore_suffix=.jpg,.jpeg,.js,.css,.png,.bmp,.gif,.ico,.mp3,.mp4,.html,.svg
```

### 3.2 服务配置
1. OAP配置
```yaml
core:
  default:
    restHost: 0.0.0.0
    restPort: 12800
    gRPCHost: 0.0.0.0
    gRPCPort: 11800
    
storage:
  elasticsearch:
    nameSpace: ${SW_NAMESPACE:""}
    clusterNodes: ${SW_STORAGE_ES_CLUSTER_NODES:localhost:9200}
    protocol: ${SW_STORAGE_ES_HTTP_PROTOCOL:"http"}
```

2. UI配置
```yaml
server:
  port: 8080

collector:
  path: /graphql
  ribbon:
    ReadTimeout: 10000
    listOfServers: 127.0.0.1:12800

security:
  user:
    admin:
      password: admin
```

## 4. 功能使用

### 4.1 追踪分析
1. 追踪查询
```graphql
query queryTraces($condition: TraceQueryCondition) {
  traces(condition: $condition) {
    data {
      key
      duration
      start
      isError
      traceIds
    }
  }
}
```

2. 性能分析
```graphql
query queryServiceInstanceMetrics($duration: Duration!) {
  instanceMetrics: getServiceInstanceMetrics(duration: $duration) {
    values {
      id
      value
    }
  }
}
```

### 4.2 告警配置
1. 规则配置
```yaml
rules:
  service_resp_time_rule:
    metrics-name: service_resp_time
    op: ">"
    threshold: 1000
    period: 10
    count: 3
    silence-period: 5
    message: Response time of service {name} is more than 1000ms
```

2. Webhook配置
```yaml
webhooks:
  - url: http://127.0.0.1:8090/notify/warning
    headers:
      Content-Type: application/json
    json:
      text: "Service {{ .name }} has been triggered an alarm, value is {{ .value }}"
```

## 5. 最佳实践

### 5.1 性能优化
1. 采样策略
   - 采样率设置
   - 过滤规则
   - 采集粒度
   - 数据压缩

2. 存储优化
   - 索引优化
   - 分片策略
   - 清理策略
   - 压缩策略

### 5.2 运维建议
1. 监控管理
   - 系统监控
   - 性能监控
   - 资源监控
   - 告警配置

2. 问题处理
   - 数据延迟
   - 查询超时
   - 存储容量
   - 性能问题 