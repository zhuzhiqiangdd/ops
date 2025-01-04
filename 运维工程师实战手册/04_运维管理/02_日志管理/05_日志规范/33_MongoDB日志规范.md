# MongoDB日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 系统日志(mongod.log)
记录MongoDB服务器的运行状态和错误信息。

1. 启动日志
   - 服务启动/关闭
   - 配置加载
   - 初始化过程

2. 系统事件
   - 连接事件
   - 认证事件
   - 复制集事件

3. 错误日志
   - 系统错误
   - 网络错误
   - 存储错误

### 1.2 操作日志(oplog)
记录数据库的写操作。

1. 数据操作
   - 插入操作
   - 更新操作
   - 删除操作

2. 管理操作
   - 索引操作
   - 集合操作
   - 数据库操作

### 1.3 审计日志(audit.log)
记录数据库的访问和操作审计信息。

1. 认证事件
   - 登录尝试
   - 权限验证
   - 角色变更

2. 操作事件
   - 数据访问
   - 命令执行
   - 配置修改

### 1.4 诊断日志
记录数据库性能和诊断信息。

1. 性能日志
   - 慢查询
   - 资源使用
   - 连接统计

2. 诊断信息
   - 内存使用
   - 存储状态
   - 网络状态

## 二、字段说明
### 2.1 系统日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: ISO-8601
  required: true
  example: "2024-03-21T10:00:00.123+0800"

severity:
  description: 日志级别
  type: string
  values: [F, E, W, I, D1-D5]
  required: true
  example: "I"

component:
  description: 组件名称
  type: string
  required: true
  example: "NETWORK"

context:
  description: 上下文
  type: string
  required: true
  example: "conn123"

message:
  description: 日志消息
  type: string
  required: true
  example: "connection accepted from 127.0.0.1:12345"

id:
  description: 日志ID
  type: integer
  required: false
  example: 12345

attributes:
  description: 附加属性
  type: object
  required: false
  example: {"client": "127.0.0.1:12345", "protocol": "op_msg"}
```

### 2.2 操作日志字段
```yaml
ts:
  description: 操作时间戳
  type: timestamp
  required: true
  example: Timestamp(1616293200, 1)

op:
  description: 操作类型
  type: string
  values: [i, u, d, c, n]
  required: true
  example: "i"

ns:
  description: 命名空间
  type: string
  required: true
  example: "myapp.users"

o:
  description: 操作文档
  type: object
  required: true
  example: {"_id": 1, "name": "john"}

o2:
  description: 更新条件
  type: object
  required: false
  example: {"_id": 1}

ui:
  description: 会话ID
  type: uuid
  required: false
  example: "123e4567-e89b-12d3-a456-426614174000"

wall:
  description: 操作耗时
  type: integer
  unit: milliseconds
  required: false
  example: 123
```

### 2.3 审计日志字段
```yaml
atype:
  description: 审计事件类型
  type: string
  required: true
  example: "authenticate"

ts:
  description: 事件时间
  type: date
  format: ISO-8601
  required: true
  example: "2024-03-21T10:00:00.123Z"

local:
  description: 本地信息
  type: object
  required: true
  example: {"ip": "127.0.0.1", "port": 27017}

remote:
  description: 远程信息
  type: object
  required: true
  example: {"ip": "192.168.1.100", "port": 12345}

users:
  description: 用户信息
  type: array
  required: false
  example: [{"user": "admin", "db": "admin"}]

roles:
  description: 角色信息
  type: array
  required: false
  example: [{"role": "readWrite", "db": "myapp"}]

param:
  description: 事件参数
  type: object
  required: false
  example: {"command": "find", "ns": "myapp.users"}

result:
  description: 事件结果
  type: integer
  required: true
  example: 0
```

## 三、日志格式
### 3.1 系统日志格式
1. 标准格式
   ```
   timestamp severity component [context] message
   ```

2. JSON格式
   ```json
   {
     "t": {"$date": "2024-03-21T10:00:00.123+0800"},
     "s": "I",
     "c": "NETWORK",
     "ctx": "conn123",
     "id": 12345,
     "msg": "connection accepted",
     "attr": {
       "client": "127.0.0.1:12345",
       "protocol": "op_msg"
     }
   }
   ```

### 3.2 审计日志格式
```json
{
  "atype": "authenticate",
  "ts": {"$date": "2024-03-21T10:00:00.123Z"},
  "local": {"ip": "127.0.0.1", "port": 27017},
  "remote": {"ip": "192.168.1.100", "port": 12345},
  "users": [{"user": "admin", "db": "admin"}],
  "roles": [{"role": "readWrite", "db": "myapp"}],
  "param": {"mechanism": "SCRAM-SHA-256"},
  "result": 0
}
```

## 四、配置示例
### 4.1 系统日志配置
```yaml
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  logRotate: reopen
  timeStampFormat: iso8601-local
  component:
    accessControl:
      verbosity: 1
    command:
      verbosity: 1
    network:
      verbosity: 1
    query:
      verbosity: 1
    replication:
      verbosity: 1
    storage:
      verbosity: 1
    write:
      verbosity: 1
```

### 4.2 审计日志配置
```yaml
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.log
  filter: '{
    atype: {
      $in: [
        "authenticate",
        "createCollection",
        "dropCollection",
        "createIndex",
        "dropIndex",
        "createUser",
        "dropUser",
        "dropAllUsersFromDatabase",
        "updateUser",
        "grantRolesToUser",
        "revokeRolesFromUser",
        "createRole",
        "updateRole",
        "dropRole",
        "dropAllRolesFromDatabase",
        "grantRolesToRole",
        "revokeRolesFromRole",
        "grantPrivilegesToRole",
        "revokePrivilegesFromRole"
      ]
    }
  }'
```

### 4.3 诊断日志配置
```yaml
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
  slowOpSampleRate: 1.0

diagnosticDataCollectionDirectoryPath: /var/log/mongodb/diagnostic

setParameter:
  logLevel: 1
  logComponentVerbosity: '{
    "accessControl": 1,
    "command": 1,
    "control": 1,
    "geo": 1,
    "index": 1,
    "network": 1,
    "query": 1,
    "replication": 1,
    "sharding": 1,
    "storage": 1,
    "write": 1
  }'
```

## 五、日志样例
### 5.1 系统日志
1. 启动日志
   ```
   2024-03-21T10:00:00.123+0800 I CONTROL  [initandlisten] MongoDB starting : pid=1234 port=27017 dbpath=/var/lib/mongodb 64-bit host=mongodb-server
   2024-03-21T10:00:00.234+0800 I CONTROL  [initandlisten] db version v4.4.0
   2024-03-21T10:00:00.345+0800 I CONTROL  [initandlisten] git version: 563487e100c4215e2dce98d0af2a6a5a2d67c5cf
   2024-03-21T10:00:00.456+0800 I NETWORK  [initandlisten] waiting for connections on port 27017
   ```

2. 连接日志
   ```
   2024-03-21T10:01:00.123+0800 I NETWORK  [conn123] received client metadata from 192.168.1.100:12345 conn123: { driver: { name: "mongosh", version: "1.0.0" }, os: { type: "Linux", name: "Ubuntu", architecture: "x86_64", version: "20.04" } }
   2024-03-21T10:01:00.234+0800 I ACCESS   [conn123] Successfully authenticated as user "admin" on "admin" from client 192.168.1.100:12345
   ```

### 5.2 操作日志
1. 插入操作
   ```json
   {
     "ts": {"$timestamp": {"t": 1616293200, "i": 1}},
     "op": "i",
     "ns": "myapp.users",
     "o": {
       "_id": {"$oid": "507f1f77bcf86cd799439011"},
       "name": "john",
       "email": "john@example.com",
       "created_at": {"$date": "2024-03-21T10:00:00.123Z"}
     }
   }
   ```

2. 更新操作
   ```json
   {
     "ts": {"$timestamp": {"t": 1616293201, "i": 1}},
     "op": "u",
     "ns": "myapp.users",
     "o": {
       "$set": {
         "email": "john.doe@example.com",
         "updated_at": {"$date": "2024-03-21T10:01:00.123Z"}
       }
     },
     "o2": {
       "_id": {"$oid": "507f1f77bcf86cd799439011"}
     }
   }
   ```

### 5.3 审计日志
1. 认证事件
   ```json
   {
     "atype": "authenticate",
     "ts": {"$date": "2024-03-21T10:00:00.123Z"},
     "local": {"ip": "127.0.0.1", "port": 27017},
     "remote": {"ip": "192.168.1.100", "port": 12345},
     "users": [{"user": "admin", "db": "admin"}],
     "roles": [{"role": "root", "db": "admin"}],
     "param": {
       "user": "admin",
       "db": "admin",
       "mechanism": "SCRAM-SHA-256"
     },
     "result": 0
   }
   ```

2. 操作事件
   ```json
   {
     "atype": "createCollection",
     "ts": {"$date": "2024-03-21T10:01:00.123Z"},
     "local": {"ip": "127.0.0.1", "port": 27017},
     "remote": {"ip": "192.168.1.100", "port": 12345},
     "users": [{"user": "admin", "db": "admin"}],
     "roles": [{"role": "readWrite", "db": "myapp"}],
     "param": {
       "ns": "myapp.users",
       "options": {
         "capped": false,
         "autoIndexId": true
       }
     },
     "result": 0
   }
   ```

### 5.4 诊断日志
1. 慢查询日志
   ```
   2024-03-21T10:02:00.123+0800 I COMMAND  [conn123] command myapp.users command: find { find: "users", filter: { status: "active" }, sort: { created_at: -1 } } planSummary: COLLSCAN keysExamined:0 docsExamined:10000 cursorExhausted:1 numYields:78 nreturned:100 reslen:20 locks:{ Global: { acquireCount: { r: 79 } }, Database: { acquireCount: { r: 79 } }, Collection: { acquireCount: { r: 79 } } } protocol:op_msg 1234ms
   ```

2. 连接统计
   ```
   2024-03-21T10:03:00.123+0800 I NETWORK  [conn] connections accepted: 1000 active: 100 current: 50 available: 950
   ```

## 相关文档
- [MySQL日志规范](21_MySQL日志规范.md)
- [PostgreSQL日志规范](22_PostgreSQL日志规范.md)
- [Redis日志规范](24_Redis日志规范.md)

## 更新记录
- 2024-03-21: 创建MongoDB日志规范文档 