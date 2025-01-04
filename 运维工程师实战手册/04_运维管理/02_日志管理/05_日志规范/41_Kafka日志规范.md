# Kafka日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 服务器日志(server.log)
记录Kafka服务器的运行状态和事件。

1. 系统事件
   - 启动/关闭事件
   - 配置加载
   - 状态变更

2. 错误日志
   - 系统错误
   - 网络错误
   - 存储错误

3. 警告信息
   - 性能警告
   - 资源警告
   - 配置警告

### 1.2 控制器日志(controller.log)
记录Kafka控制器的操作和状态。

1. 控制器事件
   - 控制器选举
   - Broker变更
   - 分区重分配

2. 主题管理
   - 主题创建/删除
   - 分区变更
   - 副本管理

### 1.3 状态变更日志(state-change.log)
记录Kafka集群的状态变更。

1. Broker状态
   - Broker上线/下线
   - Leader选举
   - ISR变更

2. 分区状态
   - 分区分配
   - 副本同步
   - Leader变更

### 1.4 请求日志(request.log)
记录客户端请求处理情况。

1. 生产请求
   - 消息发送
   - 批量提交
   - 确认机制

2. 消费请求
   - 消息获取
   - 提交位移
   - 消费组管理

## 二、字段说明
### 2.1 服务器日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21 10:00:00,123"

level:
  description: 日志级别
  type: string
  values: [TRACE, DEBUG, INFO, WARN, ERROR, FATAL]
  required: true
  example: "INFO"

logger:
  description: 日志记录器
  type: string
  required: true
  example: "kafka.server.KafkaServer"

message:
  description: 日志消息
  type: string
  required: true
  example: "Starting Kafka Server"

broker_id:
  description: Broker ID
  type: integer
  required: true
  example: 0

thread:
  description: 线程信息
  type: string
  required: true
  example: "kafka-server-start-thread"
```

### 2.2 控制器日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21 10:00:00,123"

level:
  description: 日志级别
  type: string
  values: [TRACE, DEBUG, INFO, WARN, ERROR, FATAL]
  required: true
  example: "INFO"

controller_id:
  description: 控制器ID
  type: integer
  required: true
  example: 0

event_type:
  description: 事件类型
  type: string
  required: true
  example: "ControllerChange"

topic:
  description: 主题名称
  type: string
  required: false
  example: "test-topic"

partition:
  description: 分区号
  type: integer
  required: false
  example: 0

broker_set:
  description: Broker集合
  type: array
  required: false
  example: [0, 1, 2]
```

### 2.3 请求日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21 10:00:00,123"

client_id:
  description: 客户端ID
  type: string
  required: true
  example: "producer-1"

request_type:
  description: 请求类型
  type: string
  required: true
  example: "Produce"

request_size:
  description: 请求大小
  type: integer
  unit: bytes
  required: true
  example: 1024

response_size:
  description: 响应大小
  type: integer
  unit: bytes
  required: true
  example: 100

total_time_ms:
  description: 总处理时间
  type: integer
  unit: milliseconds
  required: true
  example: 10

remote_ip:
  description: 客户端IP
  type: string
  required: true
  example: "192.168.1.100"

error_code:
  description: 错误代码
  type: integer
  required: false
  example: 0
```

## 三、日志格式
### 3.1 标准日志格式
```
[timestamp] level logger (thread) - message
```

### 3.2 JSON日志格式
```json
{
  "timestamp": "2024-03-21 10:00:00,123",
  "level": "INFO",
  "logger": "kafka.server.KafkaServer",
  "thread": "kafka-server-start-thread",
  "broker_id": 0,
  "message": "Starting Kafka Server"
}
```

### 3.3 请求日志格式
```json
{
  "timestamp": "2024-03-21 10:00:00,123",
  "client_id": "producer-1",
  "request_type": "Produce",
  "request_size": 1024,
  "response_size": 100,
  "total_time_ms": 10,
  "remote_ip": "192.168.1.100",
  "error_code": 0
}
```

## 四、配置示例
### 4.1 服务器日志配置
```properties
# config/log4j.properties

# 根日志配置
log4j.rootLogger=INFO, stdout, kafkaAppender

# 控制台输出
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=[%d] %p %m (%c)%n

# Kafka服务器日志
log4j.appender.kafkaAppender=org.apache.log4j.DailyRollingFileAppender
log4j.appender.kafkaAppender.File=${kafka.logs.dir}/server.log
log4j.appender.kafkaAppender.DatePattern='.'yyyy-MM-dd-HH
log4j.appender.kafkaAppender.layout=org.apache.log4j.PatternLayout
log4j.appender.kafkaAppender.layout.ConversionPattern=[%d] %p %m (%c)%n

# 控制器日志
log4j.appender.controllerAppender=org.apache.log4j.DailyRollingFileAppender
log4j.appender.controllerAppender.File=${kafka.logs.dir}/controller.log
log4j.appender.controllerAppender.DatePattern='.'yyyy-MM-dd-HH
log4j.appender.controllerAppender.layout=org.apache.log4j.PatternLayout
log4j.appender.controllerAppender.layout.ConversionPattern=[%d] %p %m (%c)%n

# 状态变更日志
log4j.appender.stateChangeAppender=org.apache.log4j.DailyRollingFileAppender
log4j.appender.stateChangeAppender.File=${kafka.logs.dir}/state-change.log
log4j.appender.stateChangeAppender.DatePattern='.'yyyy-MM-dd-HH
log4j.appender.stateChangeAppender.layout=org.apache.log4j.PatternLayout
log4j.appender.stateChangeAppender.layout.ConversionPattern=[%d] %p %m (%c)%n

# 请求日志
log4j.appender.requestAppender=org.apache.log4j.DailyRollingFileAppender
log4j.appender.requestAppender.File=${kafka.logs.dir}/request.log
log4j.appender.requestAppender.DatePattern='.'yyyy-MM-dd-HH
log4j.appender.requestAppender.layout=org.apache.log4j.PatternLayout
log4j.appender.requestAppender.layout.ConversionPattern=[%d] %p %m (%c)%n
```

### 4.2 日志级别配置
```properties
# 组件日志级别
log4j.logger.kafka=INFO
log4j.logger.kafka.controller=TRACE
log4j.logger.kafka.log.LogCleaner=INFO
log4j.logger.kafka.request.logger=WARN
log4j.logger.kafka.network.Processor=INFO
log4j.logger.kafka.server.KafkaApis=INFO
log4j.logger.kafka.coordinator.group=INFO
log4j.logger.kafka.log.LogManager=INFO
log4j.logger.kafka.cluster.Partition=INFO
```

### 4.3 监控配置
```properties
# JMX配置
kafka.metrics.polling.interval.secs=10
kafka.metrics.reporters=kafka.metrics.KafkaCSVMetricsReporter
kafka.csv.metrics.dir=/var/log/kafka/metrics
kafka.csv.metrics.reporter.enabled=true

# 请求日志采样
request.logger.sample.enable=true
request.logger.sample.rate=0.1
```

## 五、日志样例
### 5.1 服务器日志
1. 启动日志
   ```
   [2024-03-21 10:00:00,123] INFO Starting Kafka Server (kafka.server.KafkaServer)
   [2024-03-21 10:00:00,234] INFO Cluster ID = abc123 (kafka.server.KafkaServer)
   [2024-03-21 10:00:00,345] INFO broker.id = 0 (kafka.server.KafkaServer)
   [2024-03-21 10:00:00,456] INFO [SocketServer] Started socket server acceptors and processors (kafka.network.SocketServer)
   ```

2. 错误日志
   ```
   [2024-03-21 10:01:00,123] ERROR [ReplicaManager] Error processing fetch request (kafka.server.ReplicaManager)
   [2024-03-21 10:01:00,234] ERROR [KafkaApi] Error processing produce request (kafka.server.KafkaApis)
   [2024-03-21 10:01:00,345] ERROR [LogManager] Error recovering log for topic-partition test-topic-0 (kafka.log.LogManager)
   ```

### 5.2 控制器日志
1. 控制器选举
   ```
   [2024-03-21 10:02:00,123] INFO [Controller 0] Broker 0 was elected as the controller (kafka.controller.KafkaController)
   [2024-03-21 10:02:00,234] INFO [Controller 0] Starting preferred replica leader election for partitions [] (kafka.controller.KafkaController)
   [2024-03-21 10:02:00,345] INFO [Controller 0] Starting replica reassignment (kafka.controller.KafkaController)
   ```

2. 主题管理
   ```
   [2024-03-21 10:02:01,123] INFO [Controller 0] New topic creation: test-topic-1 with 3 partitions and replication factor 3 (kafka.controller.KafkaController)
   [2024-03-21 10:02:01,234] INFO [Controller 0] Topic deletion: test-topic-2 (kafka.controller.KafkaController)
   [2024-03-21 10:02:01,345] INFO [Controller 0] Updated partition assignment for test-topic-1 (kafka.controller.KafkaController)
   ```

### 5.3 请求日志
1. 生产请求
   ```json
   {
     "timestamp": "2024-03-21 10:03:00,123",
     "client_id": "producer-1",
     "request_type": "Produce",
     "request_size": 1024,
     "response_size": 100,
     "total_time_ms": 10,
     "remote_ip": "192.168.1.100",
     "topic": "test-topic",
     "partition": 0,
     "message_count": 100,
     "error_code": 0
   }
   ```

2. 消费请求
   ```json
   {
     "timestamp": "2024-03-21 10:03:01,234",
     "client_id": "consumer-1",
     "request_type": "Fetch",
     "request_size": 512,
     "response_size": 2048,
     "total_time_ms": 20,
     "remote_ip": "192.168.1.101",
     "topic": "test-topic",
     "partition": 0,
     "offset": 1000,
     "max_bytes": 1048576,
     "error_code": 0
   }
   ```

### 5.4 状态变更日志
```
[2024-03-21 10:04:00,123] INFO [State Change] Broker 1 is now available (state.change.logger)
[2024-03-21 10:04:00,234] INFO [State Change] New leader elected for partition test-topic-0: broker 1 (state.change.logger)
[2024-03-21 10:04:00,345] INFO [State Change] ISR changed for partition test-topic-0: [1,2,3] (state.change.logger)
```

## 相关文档
- [RabbitMQ日志规范](27_RabbitMQ日志规范.md)
- [Redis日志规范](24_Redis日志规范.md)
- [Elasticsearch日志规范](25_Elasticsearch日志规范.md)

## 更新记录
- 2024-03-21: 创建Kafka日志规范文档 