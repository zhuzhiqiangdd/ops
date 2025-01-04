# ELK平台实践指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. ELK架构概述

### 1.1 核心组件
- Elasticsearch
  - 数据存储和检索
  - 分布式搜索引擎
  - 数据分析引擎
- Logstash
  - 日志收集
  - 数据转换
  - 数据过滤
- Kibana
  - 数据可视化
  - 日志分析
  - 仪表板管理
- Beats
  - Filebeat (日志文件)
  - Metricbeat (指标数据)
  - Packetbeat (网络数据)
  - Heartbeat (可用性监控)

### 1.2 数据流向
1. 数据采集
   - Beats采集
   - Logstash输入
   - 应用直接写入
2. 数据处理
   - 格式转换
   - 字段提取
   - 数据过滤
3. 数据存储
   - 索引管理
   - 数据分片
   - 副本策略
4. 数据分析
   - 数据查询
   - 数据聚合
   - 可视化展示

## 2. 部署配置

### 2.1 基础部署
```yaml
# docker-compose.yml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.17.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    environment:
      LS_JAVA_OPTS: "-Xmx256m -Xms256m"

volumes:
  elasticsearch-data:
```

### 2.2 Kubernetes部署
```yaml
# elastic-operator-values.yaml
elasticsearch:
  version: 7.17.0
  nodeSets:
  - name: master
    count: 3
    config:
      node.roles: ["master"]
    podTemplate:
      spec:
        containers:
        - name: elasticsearch
          resources:
            requests:
              memory: 2Gi
              cpu: 1
            limits:
              memory: 4Gi
              cpu: 2

  - name: data
    count: 3
    config:
      node.roles: ["data"]
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 100Gi

kibana:
  version: 7.17.0
  count: 1
  http:
    tls:
      selfSignedCertificate:
        disabled: true
```

## 3. 数据采集配置

### 3.1 Filebeat配置
```yaml
# filebeat.yml
filebeat.inputs:
- type: container
  paths:
    - /var/lib/docker/containers/*/*.log
  processors:
    - add_kubernetes_metadata:
        host: ${NODE_NAME}
        matchers:
        - logs_path:
            logs_path: "/var/lib/docker/containers/"

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"
```

### 3.2 Logstash配置
```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
  date {
    match => [ "timestamp" , "dd/MMM/yyyy:HH:mm:ss Z" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logstash-%{+YYYY.MM.dd}"
  }
}
```

## 4. 索引管理

### 4.1 索引生命周期
```json
PUT _ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "30d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {}
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### 4.2 索引模板
```json
PUT _template/logs_template
{
  "index_patterns": ["logs-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.lifecycle.name": "logs_policy",
    "index.lifecycle.rollover_alias": "logs"
  },
  "mappings": {
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "message": {
        "type": "text"
      },
      "level": {
        "type": "keyword"
      }
    }
  }
}
```

## 5. 查询和可视化

### 5.1 Elasticsearch查询
```json
GET logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "level": "error"
          }
        }
      ],
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-1h",
              "lte": "now"
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "error_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "5m"
      }
    }
  }
}
```

### 5.2 Kibana配置
```yaml
# kibana.yml
server.name: kibana
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://elasticsearch:9200"]
monitoring.ui.container.elasticsearch.enabled: true
```

## 6. 性能优化

### 6.1 Elasticsearch优化
- JVM堆大小配置
- 分片策略优化
- 缓存配置调优
- 写入性能优化

### 6.2 Logstash优化
- 管道配置优化
- 过滤器性能调优
- 批处理配置
- 内存使用优化

### 6.3 系统优化
- 文件描述符限制
- 虚拟内存设置
- 磁盘I/O优化
- 网络配置优化

## 7. 运维管理

### 7.1 集群管理
- 节点管理
- 分片管理
- 索引管理
- 备份恢复

### 7.2 监控告警
- 集群健康监控
- 性能指标监控
- 资源使用监控
- 日志异常告警

## 参考资料
1. Elasticsearch官方文档
2. Logstash配置指南
3. Kibana用户手册
4. ELK Stack最佳实践 