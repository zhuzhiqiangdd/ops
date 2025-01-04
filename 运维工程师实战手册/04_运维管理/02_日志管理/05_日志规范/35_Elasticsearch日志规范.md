# Elasticsearch日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 集群日志
记录Elasticsearch集群的运行状态和事件。

1. 节点事件
   - 节点启动/关闭
   - 节点加入/离开
   - 节点状态变更

2. 集群事件
   - 集群状态变更
   - 分片分配
   - 主节点选举

3. 索引事件
   - 索引创建/删除
   - 分片迁移
   - 索引恢复

### 1.2 搜索日志
记录搜索和查询操作。

1. 查询日志
   - 查询语句
   - 执行时间
   - 命中结果

2. 聚合日志
   - 聚合操作
   - 计算耗时
   - 内存使用

### 1.3 索引日志
记录索引和文档操作。

1. 文档操作
   - 创建/更新
   - 删除
   - 批量操作

2. 索引操作
   - 映射更新
   - 设置更新
   - 别名管理

### 1.4 系统日志
记录系统级别的运行信息。

1. JVM日志
   - GC日志
   - 内存使用
   - 线程状态

2. 系统资源
   - CPU使用
   - 磁盘IO
   - 网络状态

## 二、字段说明
### 2.1 基础日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21T10:00:00,123Z"

level:
  description: 日志级别
  type: string
  values: [TRACE, DEBUG, INFO, WARN, ERROR]
  required: true
  example: "INFO"

component:
  description: 组件名称
  type: string
  required: true
  example: "cluster.service"

node_name:
  description: 节点名称
  type: string
  required: true
  example: "node-1"

cluster_name:
  description: 集群名称
  type: string
  required: true
  example: "production"

message:
  description: 日志消息
  type: string
  required: true
  example: "started"
```

### 2.2 慢查询日志字段
```yaml
took:
  description: 查询耗时
  type: integer
  unit: milliseconds
  required: true
  example: 1234

types:
  description: 文档类型
  type: array
  required: false
  example: ["_doc"]

total_shards:
  description: 总分片数
  type: integer
  required: true
  example: 5

successful_shards:
  description: 成功分片数
  type: integer
  required: true
  example: 5

indices:
  description: 查询索引
  type: array
  required: true
  example: ["logs-*"]

search_type:
  description: 搜索类型
  type: string
  required: true
  example: "QUERY_THEN_FETCH"

total_hits:
  description: 命中总数
  type: integer
  required: true
  example: 1000

source:
  description: 查询源
  type: object
  required: true
  example: {
    "query": {
      "match": {
        "message": "error"
      }
    }
  }
```

### 2.3 系统监控字段
```yaml
jvm:
  description: JVM信息
  type: object
  required: true
  example: {
    "heap_used_percent": 65,
    "heap_used_in_bytes": 1073741824,
    "heap_max_in_bytes": 2147483648
  }

os:
  description: 操作系统信息
  type: object
  required: true
  example: {
    "cpu_percent": 50,
    "load_average": [1.0, 0.8, 0.5],
    "mem": {
      "total_in_bytes": 8589934592,
      "free_in_bytes": 4294967296,
      "used_in_bytes": 4294967296
    }
  }

process:
  description: 进程信息
  type: object
  required: true
  example: {
    "cpu": {
      "percent": 10
    },
    "open_file_descriptors": 1000,
    "max_file_descriptors": 10000
  }

indices:
  description: 索引统计
  type: object
  required: true
  example: {
    "count": 100,
    "docs": {
      "count": 1000000,
      "deleted": 1000
    },
    "store": {
      "size_in_bytes": 10737418240
    }
  }
```

### 2.3 审计日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21T10:00:00.123Z"

user:
  description: 用户信息
  type: object
  required: true
  properties:
    name:
      description: 用户名
      type: string
      required: true
      example: "elastic"
    roles:
      description: 用户角色列表
      type: array
      required: true
      example: ["superuser", "kibana_admin"]
    realm:
      description: 认证域
      type: string
      required: true
      example: "native"
    authentication_type:
      description: 认证类型
      type: string
      required: true
      example: "realm"
    token:
      description: 认证令牌类型
      type: string
      required: false
      example: "api_key"

event:
  description: 事件类型
  type: string
  required: true
  example: "authentication_success"

request:
  description: 请求信息
  type: object
  required: true
  properties:
    method:
      description: HTTP方法
      type: string
      required: true
      example: "GET"
    path:
      description: 请求路径
      type: string
      required: true
      example: "/_cluster/health"
    headers:
      description: 请求头
      type: object
      required: false
      example: {
        "Authorization": "ApiKey ...",
        "User-Agent": "curl/7.68.0"
      }
    body:
      description: 请求体
      type: string
      required: false
      example: "{\"query\": {\"match_all\": {}}}"

response:
  description: 响应信息
  type: object
  required: true
  properties:
    status:
      description: HTTP状态码
      type: integer
      required: true
      example: 200
    error:
      description: 错误信息
      type: string
      required: false
      example: "cluster_block_exception"

source:
  description: 来源信息
  type: object
  required: true
  properties:
    address:
      description: 客户端地址
      type: string
      required: true
      example: "192.168.1.100"
    port:
      description: 客户端端口
      type: integer
      required: true
      example: 12345
    host:
      description: 客户端主机名
      type: string
      required: false
      example: "client.example.com"

node:
  description: 节点信息
  type: object
  required: true
  properties:
    name:
      description: 节点名称
      type: string
      required: true
      example: "node-1"
    host:
      description: 节点主机名
      type: string
      required: true
      example: "es-node-1.example.com"
    id:
      description: 节点ID
      type: string
      required: true
      example: "abc123def456"
```

## 三、日志格式
### 3.1 标准日志格式
```
[timestamp][level][component][node_name] message
```

### 3.2 JSON日志格式
```json
{
  "@timestamp": "2024-03-21T10:00:00,123Z",
  "level": "INFO",
  "component": "cluster.service",
  "node_name": "node-1",
  "cluster_name": "production",
  "message": "started",
  "node.id": "abc123",
  "cluster.uuid": "xyz789"
}
```

### 3.3 慢查询日志格式
```json
{
  "@timestamp": "2024-03-21T10:00:00,123Z",
  "took": 1234,
  "timed_out": false,
  "total_shards": 5,
  "successful_shards": 5,
  "indices": ["logs-*"],
  "search_type": "QUERY_THEN_FETCH",
  "total_hits": 1000,
  "source": {
    "query": {
      "match": {
        "message": "error"
      }
    }
  }
}
```

## 四、日志配置

### 4.1 日志配置文件
1. elasticsearch.yml配置
```yaml
# 集群名称
cluster.name: production

# 节点名称
node.name: node-1

# 日志基础配置
path.logs: /var/log/elasticsearch   # 日志目录
path.data: /var/lib/elasticsearch   # 数据目录

# 日志级别配置
logger.level: INFO                  # 全局日志级别
logger.action.level: DEBUG          # Action日志级别
logger.org.elasticsearch.level: INFO # ES日志级别
logger.org.elasticsearch.discovery.level: DEBUG  # 发现模块日志级别
logger.org.elasticsearch.cluster.service.level: DEBUG  # 集群服务日志级别
logger.org.elasticsearch.indices.level: DEBUG   # 索引操作日志级别
logger.org.elasticsearch.transport.level: DEBUG # 传输层日志级别

# 慢日志配置
index.search.slowlog.threshold.query.warn: 10s   # 查询慢日志警告阈值
index.search.slowlog.threshold.query.info: 5s    # 查询慢日志信息阈值
index.search.slowlog.threshold.fetch.warn: 1s    # 获取慢日志警告阈值
index.search.slowlog.threshold.fetch.info: 500ms # 获取慢日志信息阈值
index.indexing.slowlog.threshold.index.warn: 10s # 索引慢日志警告阈值
index.indexing.slowlog.threshold.index.info: 5s  # 索引慢日志信息阈值

# GC日志配置
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log:utctime,pid,tags:filecount=32,filesize=64m

# 审计日志配置
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include: ["authentication_success", "authentication_failure", "access_denied", "connection_denied"]
xpack.security.audit.logfile.events.exclude: ["system_access_granted"]
xpack.security.audit.logfile.emit_request_body: true
```

2. log4j2.properties配置
```properties
# 日志格式配置
appender.console.type = Console
appender.console.name = console
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n

appender.rolling.type = RollingFile
appender.rolling.name = rolling
appender.rolling.fileName = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}.log
appender.rolling.filePattern = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.log.gz
appender.rolling.layout.type = PatternLayout
appender.rolling.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n
appender.rolling.policies.type = Policies
appender.rolling.policies.time.type = TimeBasedTriggeringPolicy
appender.rolling.policies.time.interval = 1
appender.rolling.policies.time.modulate = true
appender.rolling.policies.size.type = SizeBasedTriggeringPolicy
appender.rolling.policies.size.size = 256MB
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.max = 30

# 慢日志配置
appender.index_search_slowlog_rolling.type = RollingFile
appender.index_search_slowlog_rolling.name = index_search_slowlog_rolling
appender.index_search_slowlog_rolling.fileName = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}_index_search_slowlog.log
appender.index_search_slowlog_rolling.filePattern = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}_index_search_slowlog-%d{yyyy-MM-dd}.log
appender.index_search_slowlog_rolling.layout.type = PatternLayout
appender.index_search_slowlog_rolling.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n
appender.index_search_slowlog_rolling.policies.type = Policies
appender.index_search_slowlog_rolling.policies.time.type = TimeBasedTriggeringPolicy
appender.index_search_slowlog_rolling.policies.time.interval = 1
appender.index_search_slowlog_rolling.policies.time.modulate = true
appender.index_search_slowlog_rolling.strategy.type = DefaultRolloverStrategy
appender.index_search_slowlog_rolling.strategy.max = 30

# 审计日志配置
appender.audit_rolling.type = RollingFile
appender.audit_rolling.name = audit_rolling
appender.audit_rolling.fileName = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}_audit.log
appender.audit_rolling.filePattern = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}_audit-%d{yyyy-MM-dd}.log
appender.audit_rolling.layout.type = PatternLayout
appender.audit_rolling.layout.pattern = [%d{ISO8601}] %m%n
appender.audit_rolling.policies.type = Policies
appender.audit_rolling.policies.time.type = TimeBasedTriggeringPolicy
appender.audit_rolling.policies.time.interval = 1
appender.audit_rolling.policies.time.modulate = true
appender.audit_rolling.strategy.type = DefaultRolloverStrategy
appender.audit_rolling.strategy.max = 30

# 日志级别配置
rootLogger.level = info
rootLogger.appenderRef.console.ref = console
rootLogger.appenderRef.rolling.ref = rolling

logger.index_search_slowlog.name = index.search.slowlog
logger.index_search_slowlog.level = trace
logger.index_search_slowlog.appenderRef.index_search_slowlog_rolling.ref = index_search_slowlog_rolling
logger.index_search_slowlog.additivity = false

logger.audit.name = org.elasticsearch.xpack.security.audit.logfile.LoggingAuditTrail
logger.audit.level = info
logger.audit.appenderRef.audit_rolling.ref = audit_rolling
logger.audit.additivity = false
```

### 4.2 日志轮转配置
1. 使用logrotate配置
```bash
# /etc/logrotate.d/elasticsearch
/var/log/elasticsearch/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 elasticsearch elasticsearch
    dateext
    dateformat -%Y%m%d
    copytruncate
}
```

2. 自动清理脚本
```bash
#!/bin/bash
# /usr/local/sbin/es-log-cleanup.sh

# 日志目录
LOG_PATH="/var/log/elasticsearch"
# 日志保留天数
SAVE_DAYS=30

# 删除过期日志
find ${LOG_PATH} -name "*.log.*" -type f -mtime +${SAVE_DAYS} -exec rm -f {} \;
find ${LOG_PATH} -name "*.gz" -type f -mtime +${SAVE_DAYS} -exec rm -f {} \;

# 检查日志目录大小
LOG_SIZE=$(du -s ${LOG_PATH} | cut -f1)
MAX_SIZE=$((50*1024*1024))  # 50GB

if [ ${LOG_SIZE} -gt ${MAX_SIZE} ]; then
    echo "Warning: Elasticsearch log directory size exceeds 50GB"
    # 可以添加告警通知
fi
```

3. 配置定时任务
```bash
# crontab -e
0 0 * * * /usr/local/sbin/es-log-cleanup.sh
```

### 4.3 日志监控配置
1. 监控指标
```yaml
# Elasticsearch日志监控
- alert: ElasticsearchLogSize
  expr: node_filesystem_avail_bytes{mountpoint="/var/log/elasticsearch"} / node_filesystem_size_bytes{mountpoint="/var/log/elasticsearch"} * 100 < 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Elasticsearch log directory space low
    description: Less than 10% disk space available for Elasticsearch logs

- alert: ElasticsearchSlowQuerySpike
  expr: rate(elasticsearch_index_search_slowlog_total[5m]) > 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Elasticsearch slow query spike
    description: High rate of slow queries detected

- alert: ElasticsearchAuditLogFailure
  expr: rate(elasticsearch_audit_log_write_failures_total[5m]) > 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: Elasticsearch audit log failures
    description: Audit log write failures detected
```

## 五、日志样例
### 5.1 集群日志
1. 节点启动
   ```
   [2024-03-21T10:00:00,123Z][INFO ][cluster.service    ][node-1] Master node [node-1] (abc123) elected
   [2024-03-21T10:00:00,234Z][INFO ][node              ][node-1] [node-1] initialized
   [2024-03-21T10:00:00,345Z][INFO ][transport         ][node-1] publish_address {127.0.0.1:9300}, bound_addresses {[::1]:9300}, {127.0.0.1:9300}
   ```

2. 集群状态
   ```
   [2024-03-21T10:01:00,123Z][INFO ][cluster.service    ][node-1] added {{node-2}{xyz789}{127.0.0.1:9301}}, reason: join
   [2024-03-21T10:01:00,234Z][INFO ][cluster.routing    ][node-1] updating number_of_replicas to [1] for indices [logs-2024.03.21]
   [2024-03-21T10:01:00,345Z][INFO ][cluster.health     ][node-1] Cluster health status changed from [YELLOW] to [GREEN]
   ```

### 5.2 搜索日志
1. 慢查询
   ```json
   {
     "@timestamp": "2024-03-21T10:02:00,123Z",
     "type": "index_search_slowlog",
     "level": "WARN",
     "component": "index.search.slowlog",
     "cluster_name": "production",
     "node_name": "node-1",
     "index_name": "logs-2024.03.21",
     "shard_id": 0,
     "took": 5123,
     "took_millis": 5123,
     "total_hits": 1000,
     "stats": [""],
     "search_type": "QUERY_THEN_FETCH",
     "total_shards": 5,
     "source": {
       "query": {
         "bool": {
           "must": [
             {
               "match": {
                 "message": "error"
               }
             },
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
       "sort": [
         {
           "@timestamp": {
             "order": "desc"
           }
         }
       ],
       "size": 100
     }
   }
   ```

2. 聚合查询
   ```json
   {
     "@timestamp": "2024-03-21T10:02:01,234Z",
     "type": "index_search_slowlog",
     "level": "INFO",
     "component": "index.search.slowlog",
     "cluster_name": "production",
     "node_name": "node-1",
     "index_name": "logs-2024.03.21",
     "shard_id": 0,
     "took": 3456,
     "took_millis": 3456,
     "total_hits": 10000,
     "stats": [""],
     "search_type": "QUERY_THEN_FETCH",
     "total_shards": 5,
     "source": {
       "size": 0,
       "aggs": {
         "error_types": {
           "terms": {
             "field": "error.type",
             "size": 10
           },
           "aggs": {
             "error_count": {
               "date_histogram": {
                 "field": "@timestamp",
                 "interval": "1h"
               }
             }
           }
         }
       }
     }
   }
   ```

### 5.3 系统监控
1. JVM监控
   ```json
   {
     "@timestamp": "2024-03-21T10:03:00,123Z",
     "type": "node_stats",
     "node_name": "node-1",
     "jvm": {
       "timestamp": 1616293380123,
       "uptime_in_millis": 86400000,
       "mem": {
         "heap_used_in_bytes": 1073741824,
         "heap_used_percent": 65,
         "heap_committed_in_bytes": 2147483648,
         "heap_max_in_bytes": 2147483648,
         "non_heap_used_in_bytes": 268435456,
         "non_heap_committed_in_bytes": 536870912
       },
       "threads": {
         "count": 100,
         "peak_count": 150
       },
       "gc": {
         "collectors": {
           "young": {
             "collection_count": 1000,
             "collection_time_in_millis": 50000
           },
           "old": {
             "collection_count": 100,
             "collection_time_in_millis": 30000
           }
         }
       }
     }
   }
   ```

2. 系统资源
   ```json
   {
     "@timestamp": "2024-03-21T10:03:01,234Z",
     "type": "node_stats",
     "node_name": "node-1",
     "os": {
       "timestamp": 1616293381234,
       "cpu": {
         "percent": 50,
         "load_average": {
           "1m": 1.0,
           "5m": 0.8,
           "15m": 0.5
         }
       },
       "mem": {
         "total_in_bytes": 8589934592,
         "free_in_bytes": 4294967296,
         "used_in_bytes": 4294967296,
         "free_percent": 50,
         "used_percent": 50
       },
       "swap": {
         "total_in_bytes": 4294967296,
         "free_in_bytes": 3221225472,
         "used_in_bytes": 1073741824
       }
     },
     "process": {
       "timestamp": 1616293381234,
       "open_file_descriptors": 1000,
       "max_file_descriptors": 10000,
       "cpu": {
         "percent": 10,
         "total_in_millis": 500000
       },
       "mem": {
         "total_virtual_in_bytes": 5368709120
       }
     }
   }
   ```

### 5.3 审计日志
1. 认证成功
```json
{
  "timestamp": "2024-03-21T10:00:00.123Z",
  "user": {
    "name": "elastic",
    "roles": ["superuser", "kibana_admin"],
    "realm": "native",
    "authentication_type": "realm",
    "token": "api_key"
  },
  "event": "authentication_success",
  "request": {
    "method": "GET",
    "path": "/_cluster/health",
    "headers": {
      "Authorization": "ApiKey ...",
      "User-Agent": "curl/7.68.0"
    }
  },
  "response": {
    "status": 200
  },
  "source": {
    "address": "192.168.1.100",
    "port": 12345,
    "host": "client.example.com"
  },
  "node": {
    "name": "node-1",
    "host": "es-node-1.example.com",
    "id": "abc123def456"
  }
}
```

2. 认证失败
```json
{
  "timestamp": "2024-03-21T10:01:00.123Z",
  "user": {
    "name": "unknown",
    "realm": "native",
    "authentication_type": "basic"
  },
  "event": "authentication_failed",
  "request": {
    "method": "GET",
    "path": "/_cluster/health",
    "headers": {
      "Authorization": "Basic ...",
      "User-Agent": "curl/7.68.0"
    }
  },
  "response": {
    "status": 401,
    "error": "invalid_credentials"
  },
  "source": {
    "address": "192.168.1.200",
    "port": 54321,
    "host": "unknown-client.example.com"
  },
  "node": {
    "name": "node-1",
    "host": "es-node-1.example.com",
    "id": "abc123def456"
  }
}
```

## 相关文档
- [MySQL日志规范](21_MySQL日志规范.md)
- [MongoDB日志规范](23_MongoDB日志规范.md)
- [Redis日志规范](24_Redis日志规范.md)

## 更新记录
- 2024-03-21: 创建Elasticsearch日志规范文档 