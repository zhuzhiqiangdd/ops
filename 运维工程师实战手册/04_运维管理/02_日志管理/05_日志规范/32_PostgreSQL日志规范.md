# PostgreSQL日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 服务器日志(postgresql.log)
记录数据库服务器的运行状态和错误信息。

1. 系统事件
   - 启动/关闭事件
   - 配置加载
   - 系统状态变更

2. 错误信息
   - 系统错误
   - 连接错误
   - 权限错误

3. 警告信息
   - 性能警告
   - 资源警告
   - 配置警告

### 1.2 查询日志
记录数据库查询执行情况。

1. 慢查询日志
   - 执行时间
   - 资源使用
   - SQL语句

2. 语句日志
   - DDL语句
   - DML语句
   - 事务操作

### 1.3 WAL日志
记录数据库的写前日志。

1. 事务日志
   - 事务开始/提交
   - 回滚操作
   - 检查点

2. 数据修改
   - 插入操作
   - 更新操作
   - 删除操作

### 1.4 统计信息日志
记录数据库性能和统计信息。

1. 性能统计
   - 查询统计
   - 缓存统计
   - IO统计

2. 资源使用
   - CPU使用
   - 内存使用
   - 磁盘使用

## 二、字段说明
### 2.1 服务器日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: YYYY-MM-DD HH:mm:ss.mmm TZ
  required: true
  example: "2024-03-21 10:00:00.123 CST"

process_id:
  description: 进程ID
  type: integer
  required: true
  example: 1234

user_name:
  description: 用户名
  type: string
  required: false
  example: "postgres"

database_name:
  description: 数据库名
  type: string
  required: false
  example: "myapp"

connection_info:
  description: 连接信息
  type: string
  format: "host:port"
  required: false
  example: "[local]:5432"

session_id:
  description: 会话ID
  type: string
  required: false
  example: "6437.1234"

line_number:
  description: 代码行号
  type: integer
  required: false
  example: 123

command_tag:
  description: 命令标签
  type: string
  required: false
  example: "SELECT"

session_start:
  description: 会话开始时间
  type: string
  format: YYYY-MM-DD HH:mm:ss TZ
  required: false
  example: "2024-03-21 10:00:00 CST"

virtual_transaction_id:
  description: 虚拟事务ID
  type: string
  required: false
  example: "2/16532"

transaction_id:
  description: 事务ID
  type: integer
  required: false
  example: 1234567

error_severity:
  description: 错误级别
  type: string
  values: [DEBUG, INFO, NOTICE, WARNING, ERROR, LOG, FATAL, PANIC]
  required: true
  example: "ERROR"

message:
  description: 日志消息
  type: string
  required: true
  example: "database system is ready to accept connections"

hint:
  description: 错误提示
  type: string
  required: false
  example: "Consider increasing maintenance_work_mem."

detail:
  description: 详细信息
  type: string
  required: false
  example: "Key (id)=(1) already exists."

context:
  description: 上下文信息
  type: string
  required: false
  example: "while executing command on remote server"
```

### 2.2 查询日志字段
```yaml
duration:
  description: 查询执行时间
  type: float
  unit: milliseconds
  required: true
  example: 1234.567

statement:
  description: SQL语句
  type: string
  required: true
  example: "SELECT * FROM users WHERE id = 1"

parameters:
  description: 预处理参数
  type: array
  required: false
  example: ["1", "john"]

plan:
  description: 执行计划
  type: string
  required: false
  example: "Seq Scan on users"

planning_time:
  description: 计划生成时间
  type: float
  unit: milliseconds
  required: false
  example: 0.123

execution_time:
  description: 执行时间
  type: float
  unit: milliseconds
  required: false
  example: 1.234

rows:
  description: 影响行数
  type: integer
  required: false
  example: 1000
```

## 三、日志格式
### 3.1 标准日志格式
```
%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h %m
```

### 3.2 CSV日志格式
```
log_destination = 'csvlog'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

### 3.3 扩展日志格式
```
%m [%p] [%v] [%x] [%q] %t %u@%d %r %a %h %l %s
```

### 3.4 JSON日志格式
```json
{
  "timestamp": "2024-03-21 10:00:00.123 CST",
  "user": "postgres",
  "database": "myapp",
  "process_id": 1234,
  "connection_from": "[local]",
  "session_id": "6437.1234",
  "session_line_num": 123,
  "command_tag": "SELECT",
  "session_start_time": "2024-03-21 10:00:00 CST",
  "virtual_transaction_id": "2/16532",
  "transaction_id": 1234567,
  "error_severity": "ERROR",
  "message": "relation \"users\" does not exist",
  "hint": "Create the table first.",
  "detail": "Table was dropped.",
  "context": "while executing SELECT statement",
  "statement": "SELECT * FROM users",
  "duration": 1234.567,
  "planning_time": 0.123,
  "execution_time": 1.234,
  "rows": 0
}
```

## 四、配置示例
### 4.1 基础配置
```ini
# postgresql.conf

# 日志目标
log_destination = 'stderr'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 10MB

# 日志内容
log_min_messages = warning
log_min_error_statement = error
log_min_duration_statement = 1000  # 记录执行时间超过1秒的查询

# 日志格式
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_timezone = 'PRC'
```

### 4.2 高级配置
```ini
# postgresql.conf

# 详细日志配置
log_checkpoints = on
log_connections = on
log_disconnections = on
log_duration = on
log_error_verbosity = verbose
log_hostname = on
log_line_prefix = '%m [%p] [%v] [%x] [%q] %t %u@%d %r %a %h %l %s'
log_lock_waits = on
log_statement = 'all'
log_temp_files = 0
log_autovacuum_min_duration = 0

# 慢查询日志
log_min_duration_statement = 100  # 记录执行时间超过100ms的查询
auto_explain.log_min_duration = 100
auto_explain.log_analyze = true
auto_explain.log_buffers = true
auto_explain.log_timing = true
auto_explain.log_triggers = true
auto_explain.log_verbose = true
auto_explain.log_nested_statements = true

# 统计信息收集
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all
track_activity_query_size = 2048

# WAL日志
wal_level = logical
archive_mode = on
archive_command = 'test ! -f /mnt/archive/%f && cp %p /mnt/archive/%f'
```

## 五、日志样例
### 5.1 服务器日志
1. 启动日志
   ```
   2024-03-21 10:00:00.123 CST [1234] LOG:  database system is starting up
   2024-03-21 10:00:01.234 CST [1234] LOG:  database system was shut down at 2024-03-21 09:59:59 CST
   2024-03-21 10:00:02.345 CST [1234] LOG:  database system is ready to accept connections
   ```

2. 错误日志
   ```
   2024-03-21 10:01:00.123 CST [1234] ERROR:  relation "users" does not exist at character 15
   2024-03-21 10:01:00.123 CST [1234] STATEMENT:  SELECT * FROM users
   2024-03-21 10:01:01.234 CST [1234] ERROR:  duplicate key value violates unique constraint "users_pkey"
   2024-03-21 10:01:01.234 CST [1234] DETAIL:  Key (id)=(1) already exists.
   2024-03-21 10:01:01.234 CST [1234] STATEMENT:  INSERT INTO users (id, name) VALUES (1, 'john')
   ```

### 5.2 查询日志
1. 慢查询日志
   ```
   2024-03-21 10:02:00.123 CST [1234] LOG:  duration: 1234.567 ms  statement: SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.status = 'active'
   2024-03-21 10:02:00.123 CST [1234] DETAIL:  parameters: $1 = 'active'
   2024-03-21 10:02:00.123 CST [1234] CONTEXT:  while executing query
   ```

2. 执行计划日志
   ```
   2024-03-21 10:02:01.234 CST [1234] LOG:  execute <unnamed>: SELECT * FROM users WHERE id = $1
   2024-03-21 10:02:01.234 CST [1234] DETAIL:  parameters: $1 = '1'
   2024-03-21 10:02:01.234 CST [1234] LOG:  duration: 0.123 ms  plan:
	Query Text: SELECT * FROM users WHERE id = $1
	Index Scan using users_pkey on users  (cost=0.15..8.17 rows=1 width=72)
	  Index Cond: (id = 1)
   ```

### 5.3 统计信息日志
```
2024-03-21 10:03:00.123 CST [1234] LOG:  checkpoint starting: time
2024-03-21 10:03:00.234 CST [1234] LOG:  checkpoint complete: wrote 1234 buffers (7.5%); 0 WAL file(s) added, 0 removed, 1 recycled; write=1.234 s, sync=0.567 s, total=2.345 s
2024-03-21 10:03:01.345 CST [1234] LOG:  autovacuum launcher started
2024-03-21 10:03:02.456 CST [1234] LOG:  automatic vacuum of table "myapp.users": index scans: 1
	pages: 0 removed, 100 remain, 0 skipped due to pins, 0 skipped frozen
	tuples: 1000 removed, 10000 remain, 0 are dead but not yet removable
	buffer usage: 1000 hits, 100 misses, 50 dirtied
	avg read rate: 1.234 MB/s, avg write rate: 0.567 MB/s
	system usage: CPU: user: 0.12 s, system: 0.03 s, elapsed: 1.23 s
```

### 5.4 WAL日志
```
2024-03-21 10:04:00.123 CST [1234] LOG:  archive command succeeded with archived WAL file "000000010000000000000001"
2024-03-21 10:04:01.234 CST [1234] LOG:  archive command succeeded with archived WAL file "000000010000000000000002"
2024-03-21 10:04:02.345 CST [1234] LOG:  archive command succeeded with archived WAL file "000000010000000000000003"
```

## 相关文档
- [MySQL日志规范](21_MySQL日志规范.md)
- [MongoDB日志规范](23_MongoDB日志规范.md)
- [Redis日志规范](24_Redis日志规范.md)

## 更新记录
- 2024-03-21: 创建PostgreSQL日志规范文档 