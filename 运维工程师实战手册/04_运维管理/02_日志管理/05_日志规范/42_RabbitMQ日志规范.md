# RabbitMQ日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 应用日志(rabbit.log)
记录RabbitMQ服务器的运行状态和事件。

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

### 1.2 连接日志(rabbit_connection.log)
记录客户端连接的管理信息。

1. 连接事件
   - 连接建立
   - 连接断开
   - 连接异常

2. 认证事件
   - 认证成功
   - 认证失败
   - 权限验证

### 1.3 通道日志(rabbit_channel.log)
记录通道操作和状态。

1. 通道事件
   - 通道创建
   - 通道关闭
   - 通道异常

2. 流控事件
   - 流控开启
   - 流控关闭
   - 流控阈值

### 1.4 队列日志(rabbit_queue.log)
记录队列操作和状态。

1. 队列事件
   - 队列创建/删除
   - 队列绑定
   - 队列状态

2. 消息事件
   - 消息发布
   - 消息消费
   - 消息确认

## 二、字段说明
### 2.1 基础日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21 10:00:00.123"

level:
  description: 日志级别
  type: string
  values: [debug, info, warning, error]
  required: true
  example: "info"

module:
  description: 模块名称
  type: string
  required: true
  example: "rabbit_connection"

pid:
  description: 进程ID
  type: integer
  required: true
  example: 1234

message:
  description: 日志消息
  type: string
  required: true
  example: "Connection established"
```

### 2.2 连接日志字段
```yaml
connection_id:
  description: 连接ID
  type: string
  required: true
  example: "127.0.0.1:12345 -> 127.0.0.1:5672"

client_properties:
  description: 客户端属性
  type: object
  required: true
  example: {
    "product": "RabbitMQ",
    "version": "3.9.0",
    "platform": "Java",
    "client": "client_name"
  }

vhost:
  description: 虚拟主机
  type: string
  required: true
  example: "/"

user:
  description: 用户名
  type: string
  required: true
  example: "guest"

protocol:
  description: 协议版本
  type: string
  required: true
  example: "AMQP 0-9-1"
```

### 2.3 通道日志字段
```yaml
channel_id:
  description: 通道ID
  type: integer
  required: true
  example: 1

connection_id:
  description: 所属连接ID
  type: string
  required: true
  example: "127.0.0.1:12345 -> 127.0.0.1:5672"

flow_state:
  description: 流控状态
  type: string
  values: [active, idle]
  required: false
  example: "active"

prefetch_count:
  description: 预取数量
  type: integer
  required: false
  example: 100

consumer_count:
  description: 消费者数量
  type: integer
  required: false
  example: 10
```

### 2.4 队列日志字段
```yaml
queue_name:
  description: 队列名称
  type: string
  required: true
  example: "test_queue"

vhost:
  description: 虚拟主机
  type: string
  required: true
  example: "/"

durable:
  description: 持久化标志
  type: boolean
  required: true
  example: true

auto_delete:
  description: 自动删除标志
  type: boolean
  required: true
  example: false

arguments:
  description: 队列参数
  type: object
  required: false
  example: {
    "x-message-ttl": 60000,
    "x-dead-letter-exchange": "dlx"
  }

messages:
  description: 消息数量
  type: integer
  required: false
  example: 1000

consumers:
  description: 消费者数量
  type: integer
  required: false
  example: 5
```

## 三、日志格式
### 3.1 标准日志格式
```
timestamp [level] module <pid> - message
```

### 3.2 JSON日志格式
```json
{
  "timestamp": "2024-03-21 10:00:00.123",
  "level": "info",
  "module": "rabbit_connection",
  "pid": 1234,
  "message": "Connection established",
  "connection_id": "127.0.0.1:12345 -> 127.0.0.1:5672",
  "vhost": "/",
  "user": "guest"
}
```

### 3.3 连接日志格式
```json
{
  "timestamp": "2024-03-21 10:00:00.123",
  "level": "info",
  "module": "rabbit_connection",
  "pid": 1234,
  "connection_id": "127.0.0.1:12345 -> 127.0.0.1:5672",
  "client_properties": {
    "product": "RabbitMQ",
    "version": "3.9.0",
    "platform": "Java",
    "client": "client_name"
  },
  "vhost": "/",
  "user": "guest",
  "protocol": "AMQP 0-9-1",
  "ssl": false,
  "peer_cert_subject": null,
  "peer_cert_issuer": null
}
```

## 四、配置示例
### 4.1 日志配置
```ini
# rabbitmq.conf

# 日志目标配置
log.file = true
log.file.level = info
log.file.rotation.date = $D0
log.file.rotation.size = 10485760
log.file.rotation.count = 10

# 日志文件路径
log.file.path = /var/log/rabbitmq/rabbit.log
log.connection.file = /var/log/rabbitmq/rabbit_connection.log
log.channel.file = /var/log/rabbitmq/rabbit_channel.log
log.queue.file = /var/log/rabbitmq/rabbit_queue.log

# 日志分类配置
log.connection.level = info
log.channel.level = info
log.queue.level = info
```

### 4.2 高级配置
```ini
# 日志格式配置
log.file.formatter.time_format = "%Y-%m-%d %H:%M:%S.%3n"
log.file.formatter = json

# 日志过滤配置
log.file.level.connection = info
log.file.level.channel = info
log.file.level.queue = info
log.file.level.federation = warning
log.file.level.mirroring = info

# 控制台输出配置
log.console = true
log.console.level = info

# Syslog配置
log.syslog = false
log.syslog.identity = rabbitmq
log.syslog.facility = daemon
```

### 4.3 监控配置
```ini
# 管理插件配置
management.rates_mode = detailed
management.sample_retention_policies.global.minute = 5
management.sample_retention_policies.global.hour = 60
management.sample_retention_policies.global.day = 1200
management.sample_retention_policies.basic.minute = 5
management.sample_retention_policies.detailed.10 = 5

# 事件记录配置
event_dispatch_stats = true
delegate_count = 16
```

## 五、日志样例
### 5.1 应用日志
1. 启动日志
   ```
   2024-03-21 10:00:00.123 [info] rabbit_connection <1234> - Starting RabbitMQ 3.9.0
   2024-03-21 10:00:00.234 [info] rabbit_connection <1234> - Using AMQP 0-9-1
   2024-03-21 10:00:00.345 [info] rabbit_connection <1234> - Node 'rabbit@localhost' is running
   ```

2. 错误日志
   ```
   2024-03-21 10:01:00.123 [error] rabbit_connection <1234> - Failed to connect to database
   2024-03-21 10:01:00.234 [error] rabbit_connection <1234> - Memory threshold exceeded
   2024-03-21 10:01:00.345 [error] rabbit_connection <1234> - Disk free space below threshold
   ```

### 5.2 连接日志
1. 连接建立
   ```json
   {
     "timestamp": "2024-03-21 10:02:00.123",
     "level": "info",
     "module": "rabbit_connection",
     "pid": 1234,
     "connection_id": "127.0.0.1:12345 -> 127.0.0.1:5672",
     "event": "connection_created",
     "client_properties": {
       "product": "RabbitMQ",
       "version": "3.9.0",
       "platform": "Java",
       "client": "client_name"
     },
     "vhost": "/",
     "user": "guest",
       "protocol": "AMQP 0-9-1",
       "ssl": false
   }
   ```

2. 连接关闭
   ```json
   {
     "timestamp": "2024-03-21 10:02:01.234",
     "level": "info",
     "module": "rabbit_connection",
     "pid": 1234,
     "connection_id": "127.0.0.1:12345 -> 127.0.0.1:5672",
     "event": "connection_closed",
     "reason": "client closed connection",
     "duration": 3600
   }
   ```

### 5.3 通道日志
1. 通道创建
   ```json
   {
     "timestamp": "2024-03-21 10:03:00.123",
     "level": "info",
     "module": "rabbit_channel",
     "pid": 1234,
     "connection_id": "127.0.0.1:12345 -> 127.0.0.1:5672",
     "channel_id": 1,
     "event": "channel_created",
     "vhost": "/",
     "user": "guest",
     "prefetch_count": 100
   }
   ```

2. 流控事件
   ```json
   {
     "timestamp": "2024-03-21 10:03:01.234",
     "level": "warning",
     "module": "rabbit_channel",
     "pid": 1234,
     "connection_id": "127.0.0.1:12345 -> 127.0.0.1:5672",
     "channel_id": 1,
     "event": "flow_control",
     "state": "active",
     "reason": "memory threshold exceeded"
   }
   ```

### 5.4 队列日志
1. 队列创建
   ```json
   {
     "timestamp": "2024-03-21 10:04:00.123",
     "level": "info",
     "module": "rabbit_queue",
     "pid": 1234,
     "event": "queue_declared",
     "queue_name": "test_queue",
     "vhost": "/",
     "durable": true,
     "auto_delete": false,
     "arguments": {
       "x-message-ttl": 60000,
       "x-dead-letter-exchange": "dlx"
     }
   }
   ```

2. 队列状态
   ```json
   {
     "timestamp": "2024-03-21 10:04:01.234",
     "level": "info",
     "module": "rabbit_queue",
     "pid": 1234,
     "event": "queue_stats",
     "queue_name": "test_queue",
     "vhost": "/",
     "messages": 1000,
     "messages_ready": 900,
     "messages_unacknowledged": 100,
     "consumers": 5,
     "memory": 1048576,
     "state": "running"
   }
   ```

## 相关文档
- [Kafka日志规范](26_Kafka日志规范.md)
- [Redis日志规范](24_Redis日志规范.md)
- [Elasticsearch日志规范](25_Elasticsearch日志规范.md)

## 更新记录
- 2024-03-21: 创建RabbitMQ日志规范文档 