# MySQL日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、概述
本文档规定了MySQL数据库各类日志的规范要求,包括错误日志、通用查询日志、慢查询日志、二进制日志等。

## 二、日志分类及字段说明

### 2.1 错误日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21T10:00:00.123Z"

level:
  description: 日志级别
  type: string
  required: true
  enum: [ERROR, WARNING, NOTE]
  example: "ERROR"

subsystem:
  description: 子系统
  type: string
  required: true
  example: "InnoDB"

message:
  description: 错误消息
  type: string
  required: true
  example: "Table 'test.users' doesn't exist"

thread_id:
  description: 线程ID
  type: integer
  required: false
  example: 12345
```

### 2.2 通用查询日志字段
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
      example: "root"
    host:
      description: 用户主机
      type: string
      required: true
      example: "localhost"
    ip:
      description: 用户IP地址
      type: string
      required: true
      example: "192.168.1.100"

command:
  description: SQL命令
  type: string
  required: true
  example: "SELECT * FROM users WHERE id = 1"

thread_id:
  description: 线程ID
  type: integer
  required: true
  example: 12345

connection_id:
  description: 连接ID
  type: integer
  required: true
  example: 67890

db:
  description: 数据库名
  type: string
  required: false
  example: "myapp"
```

### 2.3 慢查询日志字段
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
      example: "root"
    host:
      description: 用户主机
      type: string
      required: true
      example: "localhost"
    ip:
      description: 用户IP地址
      type: string
      required: true
      example: "192.168.1.100"

query_time:
  description: 查询执行时间(秒)
  type: float
  required: true
  example: 10.123456

lock_time:
  description: 锁等待时间(秒)
  type: float
  required: true
  example: 0.000123

rows_sent:
  description: 返回行数
  type: integer
  required: true
  example: 1000

rows_examined:
  description: 扫描行数
  type: integer
  required: true
  example: 10000

db:
  description: 数据库名
  type: string
  required: true
  example: "myapp"

sql:
  description: SQL语句
  type: string
  required: true
  example: "SELECT * FROM users WHERE status = 'active'"

thread_id:
  description: 线程ID
  type: integer
  required: true
  example: 12345

connection_id:
  description: 连接ID
  type: integer
  required: true
  example: 67890
```

### 2.4 二进制日志字段
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
      example: "root"
    host:
      description: 用户主机
      type: string
      required: true
      example: "localhost"
    ip:
      description: 用户IP地址
      type: string
      required: true
      example: "192.168.1.100"

event_type:
  description: 事件类型
  type: string
  required: true
  enum: [QUERY, ROTATE, FORMAT_DESCRIPTION, TABLE_MAP, WRITE_ROWS, UPDATE_ROWS, DELETE_ROWS]
  example: "QUERY"

server_id:
  description: 服务器ID
  type: integer
  required: true
  example: 1

position:
  description: 事件位置
  type: integer
  required: true
  example: 1234

event_size:
  description: 事件大小(字节)
  type: integer
  required: true
  example: 456

sql:
  description: SQL语句(仅QUERY事件)
  type: string
  required: false
  example: "INSERT INTO users (name) VALUES ('test')"
```

## 三、日志格式

### 3.1 错误日志格式
```
[TIMESTAMP] [LEVEL] [SUBSYSTEM] [Message]
```

### 3.2 通用查询日志格式
```
TIMESTAMP    THREAD_ID    USER[HOST]    DB    COMMAND    SQL
```

### 3.3 慢查询日志格式
```
# Time: TIMESTAMP
# User@Host: USER[USER] @ HOST [IP]
# Query_time: QUERY_TIME  Lock_time: LOCK_TIME  Rows_sent: ROWS_SENT  Rows_examined: ROWS_EXAMINED
# Thread_id: THREAD_ID    Connection_id: CONNECTION_ID    DB: DB
SET timestamp=UNIX_TIMESTAMP;
SQL;
```

### 3.4 二进制日志格式
二进制格式,需要使用mysqlbinlog工具解析。

## 四、日志配置

### 4.1 错误日志配置
```ini
[mysqld]
log_error = /var/log/mysql/error.log
log_error_verbosity = 3  # 1=ERROR, 2=ERROR+WARNING, 3=ERROR+WARNING+NOTE
```

### 4.2 通用查询日志配置
```ini
[mysqld]
general_log = 1
general_log_file = /var/log/mysql/query.log
```

### 4.3 慢查询日志配置
```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 10.0
log_queries_not_using_indexes = 1
min_examined_row_limit = 1000
```

### 4.4 二进制日志配置
```ini
[mysqld]
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 14
max_binlog_size = 100M
binlog_format = ROW
```

## 五、日志示例

### 5.1 错误日志示例
```
2024-03-21T10:00:00.123Z [ERROR] [InnoDB] Table 'test.users' doesn't exist
2024-03-21T10:00:01.234Z [WARNING] [Server] IP address '192.168.1.100' could not be resolved
```

### 5.2 通用查询日志示例
```
2024-03-21T10:00:00.123Z    12345   root[192.168.1.100]    myapp    Query    SELECT * FROM users WHERE id = 1
2024-03-21T10:00:01.234Z    12346   app_user[192.168.1.101]    myapp    Query    INSERT INTO logs (message) VALUES ('test')
```

### 5.3 慢查询日志示例
```
# Time: 2024-03-21T10:00:00.123Z
# User@Host: root[root] @ localhost [192.168.1.100]
# Query_time: 10.123456  Lock_time: 0.000123  Rows_sent: 1000  Rows_examined: 10000
# Thread_id: 12345    Connection_id: 67890    DB: myapp
SET timestamp=1679385600;
SELECT * FROM users WHERE status = 'active';

# Time: 2024-03-21T10:01:00.234Z
# User@Host: app_user[app_user] @ app-server [192.168.1.101]
# Query_time: 5.234567  Lock_time: 0.000456  Rows_sent: 500  Rows_examined: 5000
# Thread_id: 12346    Connection_id: 67891    DB: myapp
SET timestamp=1679385660;
SELECT u.*, p.* FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.status = 'active';
```

### 5.4 二进制日志示例(使用mysqlbinlog解析后)
```
# at 1234
#240321 10:00:00 server id 1  end_log_pos 1456  Query   thread_id=12345    exec_time=0    error_code=0
SET TIMESTAMP=1679385600;
INSERT INTO users (name) VALUES ('test');

# at 1456
#240321 10:01:00 server id 1  end_log_pos 1678  Query   thread_id=12346    exec_time=0    error_code=0
SET TIMESTAMP=1679385660;
UPDATE users SET status = 'inactive' WHERE id = 1;
```

## 六、最佳实践

### 6.1 错误日志最佳实践
1. 始终启用错误日志
2. 设置适当的日志级别
3. 定期检查错误日志
4. 配置日志轮转

### 6.2 通用查询日志最佳实践
1. 仅在开发环境或问题排查时启用
2. 注意磁盘空间使用
3. 配置日志轮转
4. 定期清理旧日志

### 6.3 慢查询日志最佳实践
1. 在生产环境中启用
2. 设置合理的阈值
3. 定期分析慢查询
4. 优化问题SQL

### 6.4 二进制日志最佳实践
1. 在生产环境中启用
2. 设置合理的过期时间
3. 定期备份
4. 监控空间使用

## 七、监控告警

### 7.1 需要监控的指标
1. 错误日志数量
2. 慢查询数量
3. 二进制日志空间使用
4. 日志文件大小

### 7.2 告警规则
1. 错误日志
```yaml
- alert: MySQLErrorLogSpike
  expr: rate(mysql_error_log_count[5m]) > 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: MySQL error log spike detected
```

2. 慢查询
```yaml
- alert: MySQLSlowQuerySpike
  expr: rate(mysql_slow_queries[5m]) > 100
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: MySQL slow query spike detected
```

3. 二进制日志空间
```yaml
- alert: MySQLBinlogSpaceUsage
  expr: mysql_binlog_space_usage_bytes > 10737418240  # 10GB
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: MySQL binlog space usage high
``` 