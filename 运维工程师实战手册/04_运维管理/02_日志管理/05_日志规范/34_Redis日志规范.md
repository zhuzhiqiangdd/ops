# Redis日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 服务器日志(redis.log)
记录Redis服务器的运行状态和错误信息。

1. 系统事件
   - 启动/关闭事件
   - 配置加载
   - 状态变更

2. 错误日志
   - 系统错误
   - 内存错误
   - 网络错误

3. 警告信息
   - 内存警告
   - 性能警告
   - 配置警告

### 1.2 慢查询日志
记录执行时间超过阈值的命令。

1. 命令信息
   - 执行时间
   - 命令内容
   - 参数列表

2. 上下文信息
   - 客户端信息
   - 数据库编号
   - 执行时间戳

### 1.3 监控日志
记录Redis服务器的监控信息。

1. 性能监控
   - 命令执行
   - 内存使用
   - 连接状态

2. 复制监控
   - 主从同步
   - 复制延迟
   - 复制错误

## 二、字段说明
### 2.1 服务器日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: "DD MMM HH:mm:ss.SSS"
  required: true
  example: "21 Mar 10:00:00.123"

pid:
  description: 进程ID
  type: integer
  required: true
  example: 1234

role:
  description: 服务器角色
  type: string
  values: [master, slave]
  required: false
  example: "master"

level:
  description: 日志级别
  type: string
  values: [debug, verbose, notice, warning]
  required: true
  example: "notice"

component:
  description: 组件名称
  type: string
  required: false
  example: "server"

message:
  description: 日志消息
  type: string
  required: true
  example: "Server started, Redis version 6.2.0"
```

### 2.2 慢查询日志字段
```yaml
timestamp:
  description: 执行时间戳
  type: integer
  unit: unix_timestamp
  required: true
  example: 1616293200

duration:
  description: 执行时间
  type: float
  unit: microseconds
  required: true
  example: 1234.567

database:
  description: 数据库编号
  type: integer
  required: true
  example: 0

client:
  description: 客户端信息
  type: string
  format: "ip:port"
  required: true
  example: "192.168.1.100:12345"

command:
  description: 执行命令
  type: string
  required: true
  example: "KEYS *"

arguments:
  description: 命令参数
  type: array
  required: false
  example: ["pattern*"]
```

### 2.3 监控日志字段
```yaml
used_memory:
  description: 使用内存
  type: integer
  unit: bytes
  required: true
  example: 1048576

used_memory_rss:
  description: 系统分配内存
  type: integer
  unit: bytes
  required: true
  example: 2097152

connected_clients:
  description: 连接客户端数
  type: integer
  required: true
  example: 100

total_commands_processed:
  description: 处理命令总数
  type: integer
  required: true
  example: 1000000

keyspace_hits:
  description: 键命中次数
  type: integer
  required: true
  example: 900000

keyspace_misses:
  description: 键未命中次数
  type: integer
  required: true
  example: 100000

evicted_keys:
  description: 驱逐键数量
  type: integer
  required: true
  example: 1000

expired_keys:
  description: 过期键数量
  type: integer
  required: true
  example: 2000
```

## 三、日志格式
### 3.1 服务器日志格式
```
timestamp pid:role:level component message
```

### 3.2 慢查询日志格式
```
timestamp [duration] [database] [client] command [arguments]
```

### 3.3 监控日志格式
```
# Memory
used_memory:1048576
used_memory_human:1.00M
used_memory_rss:2097152
used_memory_rss_human:2.00M
used_memory_peak:3145728
used_memory_peak_human:3.00M

# Stats
total_connections_received:1000
total_commands_processed:1000000
instantaneous_ops_per_sec:1000
total_net_input_bytes:1000000
total_net_output_bytes:2000000
instantaneous_input_kbps:1000.00
instantaneous_output_kbps:2000.00

# Clients
connected_clients:100
client_longest_output_list:0
client_biggest_input_buf:0
blocked_clients:0

# Keys
expired_keys:2000
evicted_keys:1000
keyspace_hits:900000
keyspace_misses:100000
```

## 四、配置示例
### 4.1 服务器日志配置
```ini
# redis.conf

# 日志级别
loglevel notice

# 日志文件路径
logfile /var/log/redis/redis.log

# 是否记录详细信息
debug-no-timestamp no
```

### 4.2 慢查询日志配置
```ini
# redis.conf

# 慢查询日志配置
slowlog-log-slower-than 10000
slowlog-max-len 128
```

### 4.3 监控配置
```ini
# redis.conf

# 延迟监控
latency-monitor-threshold 100

# 内存采样
maxmemory-samples 5

# 事件通知
notify-keyspace-events "KEA"
```

## 五、日志样例
### 5.1 服务器日志
1. 启动日志
   ```
   21 Mar 10:00:00.123 * 1234:M 21 Mar 2024 10:00:00.123 # Server started, Redis version=6.2.0, bits=64, commit=00000000, modified=0, pid=1234, just started
   21 Mar 10:00:00.234 * 1234:M 21 Mar 2024 10:00:00.234 # Configuration loaded
   21 Mar 10:00:00.345 * 1234:M 21 Mar 2024 10:00:00.345 * Ready to accept connections
   ```

2. 错误日志
   ```
   21 Mar 10:01:00.123 # 1234:M 21 Mar 2024 10:01:00.123 # Error accepting client connection: Too many open files
   21 Mar 10:01:00.234 # 1234:M 21 Mar 2024 10:01:00.234 # Out of memory allocating 16384 bytes!
   21 Mar 10:01:00.345 # 1234:M 21 Mar 2024 10:01:00.345 # Client closed connection
   ```

### 5.2 慢查询日志
```
1) 1) (integer) 1616293200
   2) (integer) 1234567
   3) (integer) 0
   4) 1) "KEYS"
      2) "user:*"

2) 1) (integer) 1616293201
   2) (integer) 2345678
   3) (integer) 0
   4) 1) "SMEMBERS"
      2) "large:set"

3) 1) (integer) 1616293202
   2) (integer) 3456789
   3) (integer) 0
   4) 1) "ZRANGE"
      2) "sorted:set"
      3) "0"
      4) "-1"
      5) "WITHSCORES"
```

### 5.3 监控日志
1. 内存监控
   ```
   # Memory
   used_memory:1048576
   used_memory_human:1.00M
   used_memory_rss:2097152
   used_memory_rss_human:2.00M
   used_memory_peak:3145728
   used_memory_peak_human:3.00M
   used_memory_lua:37888
   mem_fragmentation_ratio:2.00
   mem_allocator:jemalloc-5.1.0
   ```

2. 性能监控
   ```
   # Stats
   total_connections_received:1000
   total_commands_processed:1000000
   instantaneous_ops_per_sec:1000
   rejected_connections:0
   sync_full:0
   sync_partial_ok:0
   sync_partial_err:0
   expired_keys:2000
   evicted_keys:1000
   keyspace_hits:900000
   keyspace_misses:100000
   pubsub_channels:0
   pubsub_patterns:0
   latest_fork_usec:1000
   ```

3. 客户端监控
   ```
   # Clients
   connected_clients:100
   client_longest_output_list:0
   client_biggest_input_buf:0
   blocked_clients:0
   tracking_clients:0
   clients_in_timeout_table:0
   ```

## 相关文档
- [MySQL日志规范](21_MySQL日志规范.md)
- [PostgreSQL日志规范](22_PostgreSQL日志规范.md)
- [MongoDB日志规范](23_MongoDB日志规范.md)

## 更新记录
- 2024-03-21: 创建Redis日志规范文档 