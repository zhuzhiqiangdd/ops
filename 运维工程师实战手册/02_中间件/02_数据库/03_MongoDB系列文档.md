# MongoDB系列文档

## 1. 基础信息
### 文档信息
- 版本: v1.0.0
- 更新时间: 2024-03-21
- 状态: [🏗️进行中]
- 作者: System Admin

### 修订历史
| 版本 | 日期 | 描述 | 作者 |
|-----|------|-----|-----|
| v1.0.0 | 2024-03-21 | 初始版本 | System Admin |

### 目标读者
- 数据库管理员
- 系统运维工程师
- 应用开发人员
- 架构设计师

### 前置知识
- Linux系统基础
- NoSQL数据库概念
- JSON数据格式
- 网络基础知识

## 2. MongoDB概述
### 核心特性
1. 文档数据库
   - JSON风格BSON文档
   - 动态模式
   - 复杂数据结构
   - 原生JSON支持

2. 高性能
   - 内存映射存储引擎
   - 索引支持
   - 聚合管道
   - 水平扩展

3. 高可用性
   - 复制集
   - 自动故障转移
   - 自动选举
   - 数据冗余

4. 水平扩展
   - 分片集群
   - 自动数据分布
   - 负载均衡
   - 跨数据中心部署

### 应用场景
1. 大数据应用
   - 日志系统
   - 数据分析
   - 实时统计
   - 物联网数据

2. 内容管理
   - CMS系统
   - 产品目录
   - 文档管理
   - 多媒体存储

3. 社交应用
   - 用户信息
   - 社交关系
   - 消息系统
   - 实时通知

4. 位置服务
   - 地理信息
   - 位置跟踪
   - 移动应用
   - 导航系统

## 3. 安装部署
### 包管理器安装
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# CentOS/RHEL
cat > /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
yum install -y mongodb-org

# 启动服务
systemctl start mongod
systemctl enable mongod
```

### 源码编译安装
```bash
# 安装依赖
apt install -y build-essential libssl-dev libcurl4-openssl-dev python3

# 下载源码
wget https://fastdl.mongodb.org/src/mongodb-src-r7.0.5.tar.gz
tar xzf mongodb-src-r7.0.5.tar.gz
cd mongodb-src-r7.0.5

# 编译安装
python3 buildscripts/scons.py install --prefix=/usr/local/mongodb

# 创建必要目录
mkdir -p /data/db
mkdir -p /var/log/mongodb
mkdir -p /etc/mongodb

# 创建用户
useradd -r -s /bin/false mongodb
chown -R mongodb:mongodb /data/db /var/log/mongodb

# 创建配置文件
cat > /etc/mongodb/mongod.conf << EOF
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
storage:
  dbPath: /data/db
net:
  bindIp: 127.0.0.1
  port: 27017
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
security:
  authorization: enabled
EOF

# 创建systemd服务
cat > /etc/systemd/system/mongod.service << EOF
[Unit]
Description=MongoDB Database Server
Documentation=https://docs.mongodb.org/manual
After=network.target

[Service]
User=mongodb
Group=mongodb
Environment="OPTIONS=-f /etc/mongodb/mongod.conf"
ExecStart=/usr/local/mongodb/bin/mongod \$OPTIONS
ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb
ExecStartPre=/usr/bin/chown mongodb:mongodb /var/run/mongodb
ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb
PermissionsStartOnly=true
PIDFile=/var/run/mongodb/mongod.pid
Type=forking
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=64000
# processes/threads
LimitNPROC=64000
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false
# Recommended limits for mongod as specified in
# https://docs.mongodb.com/manual/reference/ulimit/#recommended-ulimit-settings

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl daemon-reload
systemctl start mongod
systemctl enable mongod
```

## 4. 基础配置
### 主配置文件
```yaml
# /etc/mongodb/mongod.conf

# 系统日志配置
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  logRotate: reopen
  verbosity: 0

# 存储配置
storage:
  dbPath: /data/db
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

# 网络配置
net:
  bindIp: 127.0.0.1
  port: 27017
  maxIncomingConnections: 65536
  wireObjectCheck: true
  ipv6: false

# 安全配置
security:
  authorization: enabled
  javascriptEnabled: false
  keyFile: /etc/mongodb/keyfile

# 进程管理
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid
  timeZoneInfo: /usr/share/zoneinfo

# 复制集配置
replication:
  replSetName: rs0
  oplogSizeMB: 10240

# 分片配置
sharding:
  clusterRole: shardsvr

# 操作配置
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

### 安全配置
```bash
# 创建管理员用户
mongosh admin --eval '
  db.createUser({
    user: "admin",
    pwd: "your_strong_password",
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" },
      { role: "dbAdminAnyDatabase", db: "admin" },
      { role: "clusterAdmin", db: "admin" }
    ]
  })
'

# 创建应用用户
mongosh admin -u admin -p your_strong_password --eval '
  db.createUser({
    user: "appuser",
    pwd: "app_password",
    roles: [
      { role: "readWrite", db: "myapp" }
    ]
  })
'

# 生成密钥文件
openssl rand -base64 756 > /etc/mongodb/keyfile
chmod 400 /etc/mongodb/keyfile
chown mongodb:mongodb /etc/mongodb/keyfile

# 配置防火墙
firewall-cmd --permanent --add-port=27017/tcp
firewall-cmd --reload
```

## 5. 数据库操作
### 基本操作
```javascript
// 数据库操作
show dbs                     // 显示所有数据库
use mydb                     // 切换/创建数据库
db.dropDatabase()            // 删除数据库
db.stats()                   // 查看数据库状态

// 集合操作
show collections             // 显示所有集合
db.createCollection("users") // 创建集合
db.users.drop()             // 删除集合
db.users.stats()            // 查看集合状态

// 文档操作
// 插入文档
db.users.insertOne({
  name: "John",
  age: 30,
  email: "john@example.com"
})

// 批量插入
db.users.insertMany([
  { name: "Alice", age: 25 },
  { name: "Bob", age: 35 }
])

// 查询文档
db.users.find()                    // 查询所有
db.users.find({ age: { $gt: 30 }}) // 条件查询
db.users.findOne({ name: "John" }) // 查询单个

// 更新文档
db.users.updateOne(
  { name: "John" },
  { $set: { age: 31 }}
)

// 批量更新
db.users.updateMany(
  { age: { $lt: 30 }},
  { $inc: { age: 1 }}
)

// 删除文档
db.users.deleteOne({ name: "John" })
db.users.deleteMany({ age: { $lt: 25 }})
```

### 高级查询
```javascript
// 复杂条件查询
db.users.find({
  $and: [
    { age: { $gte: 20, $lte: 30 }},
    { "address.city": "New York" }
  ]
})

// 正则表达式查询
db.users.find({
  name: { $regex: /^J.*/, $options: 'i' }
})

// 数组查询
db.users.find({
  tags: { $all: ["developer", "mongodb"] }
})

// 嵌套文档查询
db.users.find({
  "address.city": "New York",
  "address.state": "NY"
})

// 投影查询
db.users.find(
  { age: { $gt: 30 }},
  { name: 1, email: 1, _id: 0 }
)

// 排序
db.users.find().sort({ age: -1, name: 1 })

// 分页
db.users.find().skip(10).limit(10)

// 聚合查询
db.orders.aggregate([
  { $match: { status: "completed" }},
  { $group: {
      _id: "$userId",
      total: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  },
  { $sort: { total: -1 }}
])

// 地理空间查询
db.places.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-73.9667, 40.78]
      },
      $maxDistance: 1000
    }
  }
})
```

### 索引管理
```javascript
// 创建索引
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ name: 1, age: -1 })

// 创建地理空间索引
db.places.createIndex({ location: "2dsphere" })

// 创建文本索引
db.articles.createIndex({ content: "text" })

// 查看索引
db.users.getIndexes()

// 删除索引
db.users.dropIndex("email_1")

// 重建索引
db.users.reIndex()

// 索引使用分析
db.users.find({ email: "john@example.com" }).explain("executionStats")
```

## 6. 复制集配置
### 复制集架构
```yaml
# 主节点配置
replication:
  replSetName: rs0
net:
  bindIp: 192.168.1.10
security:
  keyFile: /etc/mongodb/keyfile

# 从节点配置
replication:
  replSetName: rs0
net:
  bindIp: 192.168.1.11
security:
  keyFile: /etc/mongodb/keyfile

# 仲裁节点配置
replication:
  replSetName: rs0
net:
  bindIp: 192.168.1.12
security:
  keyFile: /etc/mongodb/keyfile
```

### 复制集初始化
```javascript
// 初始化复制集
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "192.168.1.10:27017" },
    { _id: 1, host: "192.168.1.11:27017" },
    { _id: 2, host: "192.168.1.12:27017", arbiterOnly: true }
  ]
})

// 查看复制集状态
rs.status()

// 添加节点
rs.add("192.168.1.13:27017")

// 添加仲裁节点
rs.addArb("192.168.1.14:27017")

// 删除节点
rs.remove("192.168.1.13:27017")

// 配置优先级
cfg = rs.conf()
cfg.members[0].priority = 2
cfg.members[1].priority = 1
rs.reconfig(cfg)
```

## 7. 分片集群
### 配置服务器
```yaml
# 配置服务器配置
sharding:
  clusterRole: configsvr
replication:
  replSetName: configReplSet
net:
  bindIp: 192.168.1.20
  port: 27019
```

### 分片服务器
```yaml
# 分片服务器配置
sharding:
  clusterRole: shardsvr
replication:
  replSetName: shard1
net:
  bindIp: 192.168.1.30
  port: 27018
```

### 路由服务器
```yaml
# 路由服务器配置
sharding:
  configDB: configReplSet/192.168.1.20:27019
net:
  bindIp: 192.168.1.40
  port: 27017
```

### 分片集群初始化
```javascript
// 初始化配置服务器复制集
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [
    { _id: 0, host: "192.168.1.20:27019" }
  ]
})

// 初始化分片服务器复制集
rs.initiate({
  _id: "shard1",
  members: [
    { _id: 0, host: "192.168.1.30:27018" }
  ]
})

// 添加分片
mongosh --port 27017
sh.addShard("shard1/192.168.1.30:27018")

// 启用数据库分片
sh.enableSharding("mydb")

// 对集合进行分片
sh.shardCollection("mydb.users", { userId: "hashed" })
```

## 8. 性能优化
### 系统优化
```bash
# /etc/sysctl.conf
# 文件系统优化
fs.file-max = 98000
vm.swappiness = 1
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_tw_reuse = 1

# 内存优化
vm.zone_reclaim_mode = 0
```

### MongoDB配置优化
```yaml
# mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

net:
  maxIncomingConnections: 65536

replication:
  oplogSizeMB: 10240
```

### 查询优化
```javascript
// 创建合适的索引
db.users.createIndex({ email: 1 })
db.users.createIndex({ age: 1, name: 1 })

// 使用覆盖索引
db.users.find(
  { age: { $gt: 30 }},
  { name: 1, age: 1, _id: 0 }
).hint({ age: 1, name: 1 })

// 限制结果集大小
db.users.find().limit(100)

// 使用投影
db.users.find({}, { name: 1, email: 1 })

// 避免大型跳过
db.users.find().skip(1000000) // 不推荐
// 使用范围查询替代
db.users.find({ _id: { $gt: lastId }}).limit(10)

// 使用聚合管道优化
db.orders.aggregate([
  { $match: { status: "completed" }},
  { $group: {
      _id: "$userId",
      total: { $sum: "$amount" }
    }
  },
  { $sort: { total: -1 }},
  { $limit: 10 }
])
```

## 9. 监控管理
### 性能监控
```javascript
// 服务器状态
db.serverStatus()

// 数据库状态
db.stats()

// 集合状态
db.users.stats()

// 复制集状态
rs.status()

// 分片状态
sh.status()

// 当前操作
db.currentOp()

// 慢查询分析
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().pretty()
```

### 备份恢复
```bash
# 备份数据库
mongodump --uri="mongodb://user:pass@host:port/db" --out=/backup/mongodb/$(date +%Y%m%d)

# 恢复数据库
mongorestore --uri="mongodb://user:pass@host:port/db" /backup/mongodb/20240321

# 导出集合
mongoexport --uri="mongodb://user:pass@host:port/db" --collection=users --out=users.json

# 导入集合
mongoimport --uri="mongodb://user:pass@host:port/db" --collection=users --file=users.json

# 创建备份脚本
cat > /usr/local/bin/mongodb-backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d)
MONGODB_URI="mongodb://user:pass@host:port"

# 创建备份目录
mkdir -p \$BACKUP_DIR/\$DATE

# 执行备份
mongodump --uri=\$MONGODB_URI --out=\$BACKUP_DIR/\$DATE

# 压缩备份
cd \$BACKUP_DIR
tar czf \$DATE.tar.gz \$DATE
rm -rf \$DATE

# 清理旧备份
find \$BACKUP_DIR -type f -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/mongodb-backup.sh
```

## 10. 安全加固
### 访问控制
```javascript
// 创建用户管理员
db.createUser({
  user: "admin",
  pwd: "strong_password",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

// 创建数据库用户
db.createUser({
  user: "appuser",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "myapp" }
  ]
})

// 创建备份用户
db.createUser({
  user: "backup",
  pwd: "backup_password",
  roles: [
    { role: "backup", db: "admin" }
  ]
})

// 修改用户密码
db.changeUserPassword("appuser", "new_password")

// 更新用户角色
db.updateUser("appuser", {
  roles: [
    { role: "readWrite", db: "myapp" },
    { role: "read", db: "analytics" }
  ]
})

// 删除用户
db.dropUser("appuser")
```

### 网络安全
```yaml
# mongod.conf
net:
  bindIp: 127.0.0.1,192.168.1.100
  port: 27017
  ssl:
    mode: requireSSL
    PEMKeyFile: /etc/mongodb/server.pem
    CAFile: /etc/mongodb/ca.pem

security:
  authorization: enabled
  javascriptEnabled: false
  keyFile: /etc/mongodb/keyfile
```

### 审计配置
```yaml
# mongod.conf
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.log
  filter: '{ atype: { $in: ["authenticate", "createUser", "dropUser", "createRole", "dropRole"] } }'
```

## 11. 最佳实践
### 开发规范
1. 文档设计
   - 避免过深嵌套
   - 控制文档大小
   - 合理使用数组
   - 规范字段命名

2. 查询优化
   - 创建合适索引
   - 避免大型跳过
   - 使用投影限制
   - 批量操作优化

3. 数据建模
   - 嵌入vs引用
   - 一对多关系
   - 多对多关系
   - 树形结构

4. 版本控制
   - 模式版本管理
   - 数据迁移策略
   - 向后兼容
   - 平滑升级

### 运维规范
1. 监控指标
   - 系统资源
   - 数据库状态
   - 慢查询分析
   - 连接管理

2. 备份策略
   - 定时备份
   - 增量备份
   - 备份验证
   - 恢复演练

3. 安全管理
   - 访问控制
   - 网络安全
   - 审计日志
   - 漏洞修复

4. 容量规划
   - 存储容量
   - 性能容量
   - 扩展策略
   - 资源预留

## 相关文档
- [MySQL系列文档](./01_MySQL系列文档.md)
- [Redis系列文档](./02_Redis系列文档.md)

## 参考资料
1. [MongoDB官方文档](https://docs.mongodb.com/)
2. [MongoDB最佳实践](https://docs.mongodb.com/manual/core/security-best-practices/)
3. [MongoDB运维实战](https://docs.mongodb.com/manual/administration/)
4. [MongoDB性能优化](https://docs.mongodb.com/manual/core/query-optimization/) 