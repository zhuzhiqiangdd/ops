# Redis系列文档

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
- 系统运维工程师
- 开发工程师
- 架构设计师
- 数据库管理员

### 前置知识
- Linux系统基础
- 网络基础知识
- 内存管理基础
- 数据结构基础

## 2. Redis概述
### 核心特性
1. 数据类型
   - String（字符串）
     - 计数器
     - 分布式锁
     - 缓存对象
   - Hash（哈希表）
     - 用户信息
     - 商品属性
     - 配置信息
   - List（列表）
     - 消息队列
     - 最新动态
     - 关注列表
   - Set（集合）
     - 用户标签
     - 好友关系
     - 黑名单
   - Sorted Set（有序集合）
     - 排行榜
     - 优先级队列
     - 延迟队列
   - Bitmap（位图）
     - 用户在线状态
     - 签到记录
     - 布隆过滤器
   - HyperLogLog
     - UV统计
     - 独立访客
   - Stream
     - 消息队列
     - 事件流
     - 日志处理

2. 高级功能
   - 发布/订阅
     - 实时消息
     - 聊天系统
   - 事务支持
     - MULTI/EXEC
     - WATCH/UNWATCH
   - Lua脚本
     - 原子操作
     - 业务逻辑
   - 持久化
     - RDB快照
     - AOF日志
   - 主从复制
     - 读写分离
     - 数据备份
   - 哨兵模式
     - 高可用
     - 自动故障转移
   - 集群模式
     - 分片存储
     - 负载均衡

### 应用场景
1. 缓存系统
   - 数据缓存
     - 热点数据
     - 接口结果
     - 页面片段
   - 会话缓存
     - 用户会话
     - 登录状态
     - 权限信息
   - 页面缓存
     - 全页缓存
     - 部分缓存
   - API结果缓存
     - 接口响应
     - 计算结果

2. 计数器系统
   - 访问统计
     - PV/UV统计
     - 接口调用量
   - 用户在线数
     - 实时在线
     - 峰值统计
   - 实时计数器
     - 点赞数
     - 评论数
   - 限流器
     - 接口限流
     - 访问频率控制

3. 消息队列
   - 简单队列
     - 任务队列
     - 消息通知
   - 延迟队列
     - 定时任务
     - 延迟处理
   - 优先级队列
     - 重要消息优先
     - 任务优先级
   - 发布订阅
     - 实时通知
     - 消息广播

4. 实时系统
   - 实时排行榜
     - 游戏排名
     - 热门商品
   - 实时分析
     - 用户行为
     - 系统监控
   - 实时统计
     - 访问量
     - 交易量
   - 实时推送
     - 消息推送
     - 状态更新

## 3. 安装部署
### 包管理器安装
```bash
# Ubuntu/Debian
apt update
apt install redis-server

# CentOS/RHEL
yum install epel-release
yum install redis

# 启动服务
systemctl start redis
systemctl enable redis
```

### 源码编译安装
```bash
# 安装依赖
apt install build-essential tcl

# 下载源码
wget https://download.redis.io/releases/redis-7.2.4.tar.gz
tar xzf redis-7.2.4.tar.gz
cd redis-7.2.4

# 编译安装
make
make test
make install

# 创建配置目录
mkdir -p /etc/redis
mkdir -p /var/lib/redis
mkdir -p /var/log/redis

# 复制配置文件
cp redis.conf /etc/redis/

# 创建systemd服务
cat > /etc/systemd/system/redis.service << EOF
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
Type=notify
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always
User=redis
Group=redis

[Install]
WantedBy=multi-user.target
EOF

# 创建用户和组
groupadd redis
useradd -r -g redis -s /bin/false redis

# 设置权限
chown -R redis:redis /var/lib/redis
chown -R redis:redis /var/log/redis
chmod 750 /var/lib/redis
chmod 750 /var/log/redis

# 启动服务
systemctl daemon-reload
systemctl start redis
systemctl enable redis
```

## 4. 基础配置
### 主配置文件
```ini
# /etc/redis/redis.conf

# 网络配置
bind 127.0.0.1
port 6379
protected-mode yes
tcp-backlog 511
timeout 0
tcp-keepalive 300

# 基础配置
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16

# 安全配置
requirepass your_strong_password
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""

# 内存配置
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# 持久化配置
dir /var/lib/redis
dbfilename dump.rdb
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 复制配置
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
replica-priority 100

# 集群配置
cluster-enabled no
cluster-config-file nodes-6379.conf
cluster-node-timeout 15000
```

### 安全配置
```bash
# 生成强密码
openssl rand -base64 32

# 配置防火墙
firewall-cmd --permanent --add-port=6379/tcp
firewall-cmd --reload

# 禁用危险命令
redis-cli
> CONFIG SET requirepass "your_strong_password"
> RENAME-COMMAND FLUSHALL ""
> RENAME-COMMAND FLUSHDB ""
> RENAME-COMMAND CONFIG ""
```

## 5. 数据类型和命令
### String类型
```bash
# 基本操作
SET key value [EX seconds] [PX milliseconds] [NX|XX]
GET key
DEL key
EXISTS key
EXPIRE key seconds

# 计数操作
INCR key
INCRBY key increment
DECR key
DECRBY key decrement

# 批量操作
MSET key1 value1 key2 value2
MGET key1 key2
MSETNX key1 value1 key2 value2

# 位操作
SETBIT key offset value
GETBIT key offset
BITCOUNT key [start end]
BITOP operation destkey key [key ...]
```

### Hash类型
```bash
# 基本操作
HSET key field value
HGET key field
HDEL key field [field ...]
HEXISTS key field

# 批量操作
HMSET key field1 value1 field2 value2
HMGET key field1 field2
HGETALL key

# 计数操作
HINCRBY key field increment
HINCRBYFLOAT key field increment

# 其他操作
HKEYS key
HVALS key
HLEN key
HSCAN key cursor [MATCH pattern] [COUNT count]
```

### List类型
```bash
# 基本操作
LPUSH key value [value ...]
RPUSH key value [value ...]
LPOP key
RPOP key
LLEN key

# 范围操作
LRANGE key start stop
LTRIM key start stop
LINDEX key index
LSET key index value

# 阻塞操作
BLPOP key [key ...] timeout
BRPOP key [key ...] timeout
BRPOPLPUSH source destination timeout

# 其他操作
LINSERT key BEFORE|AFTER pivot value
LREM key count value
```

### Set类型
```bash
# 基本操作
SADD key member [member ...]
SREM key member [member ...]
SISMEMBER key member
SCARD key

# 集合操作
SUNION key [key ...]
SINTER key [key ...]
SDIFF key [key ...]
SUNIONSTORE destination key [key ...]
SINTERSTORE destination key [key ...]
SDIFFSTORE destination key [key ...]

# 随机操作
SRANDMEMBER key [count]
SPOP key [count]

# 其他操作
SMEMBERS key
SSCAN key cursor [MATCH pattern] [COUNT count]
```

### Sorted Set类型
```bash
# 基本操作
ZADD key [NX|XX] [CH] [INCR] score member [score member ...]
ZREM key member [member ...]
ZSCORE key member
ZCARD key

# 范围操作
ZRANGE key start stop [WITHSCORES]
ZREVRANGE key start stop [WITHSCORES]
ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]
ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]

# 计数操作
ZINCRBY key increment member
ZCOUNT key min max
ZRANK key member
ZREVRANK key member

# 集合操作
ZUNIONSTORE destination numkeys key [key ...] [WEIGHTS weight] [AGGREGATE SUM|MIN|MAX]
ZINTERSTORE destination numkeys key [key ...] [WEIGHTS weight] [AGGREGATE SUM|MIN|MAX]

# 其他操作
ZSCAN key cursor [MATCH pattern] [COUNT count]
ZRANGEBYLEX key min max [LIMIT offset count]
```

### Bitmap操作
```bash
# 基本操作
SETBIT key offset value
GETBIT key offset
BITCOUNT key [start end]

# 位运算
BITOP AND|OR|XOR|NOT destkey key [key ...]
BITPOS key bit [start] [end]

# 示例：用户签到
# 设置用户1在2024-03-21签到
SETBIT user:sign:1:202403 21 1

# 获取用户1在2024-03-21是否签到
GETBIT user:sign:1:202403 21

# 获取用户1在2024-03月份签到次数
BITCOUNT user:sign:1:202403
```

### HyperLogLog操作
```bash
# 基本操作
PFADD key element [element ...]
PFCOUNT key [key ...]
PFMERGE destkey sourcekey [sourcekey ...]

# 示例：UV统计
# 记录用户访问
PFADD page:uv:20240321 user1 user2 user3

# 获取UV数量
PFCOUNT page:uv:20240321

# 合并多天UV
PFMERGE page:uv:202403 page:uv:20240321 page:uv:20240322
```

### Stream操作
```bash
# 基本操作
XADD key [MAXLEN [~] count] ID field value [field value ...]
XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]
XRANGE key start end [COUNT count]
XREVRANGE key end start [COUNT count]

# 消费组操作
XGROUP CREATE key groupname id-or-$
XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] [NOACK] STREAMS key [key ...] ID [ID ...]
XACK key group ID [ID ...]
XPENDING key group [start end count] [consumer]

# 示例：消息队列
# 生产消息
XADD mystream * message "hello" timestamp "1616299460000"

# 消费消息
XREAD COUNT 1 STREAMS mystream 0

# 创建消费组
XGROUP CREATE mystream mygroup $

# 消费组读取
XREADGROUP GROUP mygroup consumer1 COUNT 1 STREAMS mystream >
```

## 6. 持久化配置
### RDB配置
```ini
# redis.conf
# RDB保存策略
save 900 1      # 900秒内有1个键被修改则触发保存
save 300 10     # 300秒内有10个键被修改则触发保存
save 60 10000   # 60秒内有10000个键被修改则触发保存

# RDB文件名
dbfilename dump.rdb

# RDB文件保存路径
dir /var/lib/redis

# 是否压缩RDB文件
rdbcompression yes

# 是否进行RDB文件校验
rdbchecksum yes

# bgsave发生错误时是否停止写入
stop-writes-on-bgsave-error yes
```

### AOF配置
```ini
# redis.conf
# 是否开启AOF
appendonly yes

# AOF文件名
appendfilename "appendonly.aof"

# AOF同步策略
# always: 每个写命令都同步
# everysec: 每秒同步一次
# no: 由操作系统决定何时同步
appendfsync everysec

# AOF重写配置
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 加载AOF时是否忽略最后一条可能存在问题的指令
aof-load-truncated yes

# 是否开启混合持久化
aof-use-rdb-preamble yes
```

## 7. 主从复制
### 主从配置
```ini
# 主节点配置
bind 192.168.1.10
port 6379
requirepass master_password
masterauth replica_password

# 从节点配置
bind 192.168.1.11
port 6379
requirepass replica_password
masterauth master_password
replicaof 192.168.1.10 6379

# 复制相关参数
repl-diskless-sync yes
repl-diskless-sync-delay 5
repl-timeout 60
```

### 哨兵配置
```ini
# sentinel.conf
port 26379
sentinel monitor mymaster 192.168.1.10 6379 2
sentinel auth-pass mymaster master_password
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1

# 哨兵通知脚本
sentinel notification-script mymaster /var/redis/notify.sh

# 故障转移脚本
sentinel client-reconfig-script mymaster /var/redis/failover.sh
```

### 集群配置
```bash
# 创建集群配置文件
port 6379
cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 15000
cluster-replica-validity-factor 10
cluster-migration-barrier 1
cluster-require-full-coverage yes

# 创建集群
redis-cli --cluster create \
    192.168.1.10:6379 \
    192.168.1.11:6379 \
    192.168.1.12:6379 \
    192.168.1.13:6379 \
    192.168.1.14:6379 \
    192.168.1.15:6379 \
    --cluster-replicas 1

# 集群管理命令
# 查看集群信息
redis-cli -c -h 192.168.1.10 -p 6379 cluster info

# 查看节点信息
redis-cli -c -h 192.168.1.10 -p 6379 cluster nodes

# 添加节点
redis-cli --cluster add-node new_host:new_port existing_host:existing_port

# 删除节点
redis-cli --cluster del-node host:port node_id
```

## 8. 性能优化
### 系统优化
```bash
# /etc/sysctl.conf
# 内存管理
vm.overcommit_memory = 1
vm.swappiness = 0

# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_tw_reuse = 1

# 文件描述符
fs.file-max = 1000000

# 透明大页
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```

### Redis配置优化
```ini
# redis.conf
# 内存管理
maxmemory 4gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# 持久化优化
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
appendonly yes
appendfsync everysec
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 网络优化
tcp-backlog 65535
tcp-keepalive 300
timeout 0

# 其他优化
activerehashing yes
hz 10
```

### 客户端优化
```python
# Python示例
from redis import Redis
from redis.connection import ConnectionPool

# 使用连接池
pool = ConnectionPool(
    host='localhost',
    port=6379,
    db=0,
    password='your_password',
    max_connections=100,
    decode_responses=True
)

redis = Redis(connection_pool=pool)

# 使用管道
pipe = redis.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
pipe.execute()
```

### 数据结构优化
```bash
# 1. 大key优化
# 查找大key
redis-cli --bigkeys

# 拆分大key示例
# 将大hash拆分成多个小hash
HSET user:1:profile name "John" age "30"
HSET user:1:settings theme "dark" lang "en"

# 将大list拆分成多个小list
LPUSH list:1:0 item1 item2 item3
LPUSH list:1:1 item4 item5 item6

# 2. 热key优化
# 使用本地缓存
# 使用读写分离
# 使用key复制

# 3. key过期优化
# 避免同时过期
SET key1 value1 EX 3600
SET key2 value2 EX 3610
SET key3 value3 EX 3620

# 4. 压缩优化
# 使用整数编码
HSET user:visits day1 1 day2 2 day3 3

# 使用位图优化
SETBIT user:online:20240321 1 1
SETBIT user:online:20240321 2 1
```

### 命令优化
```bash
# 1. 避免使用危险命令
# 禁用KEYS命令
rename-command KEYS ""

# 使用SCAN替代KEYS
SCAN 0 MATCH "user:*" COUNT 100

# 2. 批量操作优化
# 使用MGET/MSET
MSET key1 value1 key2 value2 key3 value3
MGET key1 key2 key3

# 使用pipeline
redis-cli -r 100000 -n 0 ping > /dev/null

# 3. 事务优化
MULTI
SET key1 value1
SET key2 value2
EXEC

# 4. Lua脚本优化
redis-cli --eval myscript.lua key1 key2 , arg1 arg2
```

### 监控优化
```bash
# 1. 性能监控
# 使用INFO命令
redis-cli info

# 监控内存使用
redis-cli info memory

# 监控客户端连接
redis-cli info clients

# 监控命令统计
redis-cli info commandstats

# 2. 慢查询监控
# 配置慢查询
slowlog-log-slower-than 10000
slowlog-max-len 128

# 查看慢查询
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET

# 3. 延迟监控
# 使用latency监控工具
redis-cli --latency
redis-cli --latency-history
redis-cli --latency-dist

# 4. 网络监控
# 查看连接状态
CLIENT LIST
CLIENT KILL ip:port
```

## 9. 运维管理
### 日常运维
```bash
# 1. 数据备份
# 手动触发RDB
SAVE
BGSAVE

# 自动备份脚本
#!/bin/bash
BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d)
REDIS_PASSWORD="your_password"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 触发RDB备份
redis-cli -a $REDIS_PASSWORD SAVE

# 复制RDB文件
cp /var/lib/redis/dump.rdb $BACKUP_DIR/$DATE/

# 清理旧备份
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

# 2. 日志管理
# 查看日志
tail -f /var/log/redis/redis.log

# 日志轮转
logrotate /etc/logrotate.d/redis

# 3. 版本升级
# 检查版本
redis-cli info server

# 升级步骤
systemctl stop redis
apt update
apt install redis-server
systemctl start redis
```

### 故障处理
```bash
# 1. 内存问题
# 查看内存使用
INFO memory

# 清理过期键
SCAN 0 COUNT 100 TYPE string
DEL key1 key2 key3

# 2. CPU问题
# 查看CPU使用
top -p $(pidof redis-server)

# 查找耗CPU命令
redis-cli monitor

# 3. 网络问题
# 检查连接数
netstat -an | grep 6379 | wc -l

# 检查网络延迟
redis-cli --latency

# 4. 磁盘问题
# 检查磁盘空间
df -h

# 清理RDB/AOF文件
rm -f /var/lib/redis/dump.rdb.*
```

## 10. 安全加固
### 访问控制
```bash
# 1. 密码认证
requirepass your_strong_password

# 2. 禁用危险命令
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command KEYS ""

# 3. 网络访问控制
bind 127.0.0.1 192.168.1.100
protected-mode yes

# 4. SSL/TLS配置
tls-port 6380
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
tls-ca-cert-file /path/to/ca.crt
```

### 系统加固
```bash
# 1. 文件权限
chown redis:redis /etc/redis/redis.conf
chmod 600 /etc/redis/redis.conf

# 2. 内核参数
sysctl -w net.core.somaxconn=65535
sysctl -w vm.overcommit_memory=1

# 3. 资源限制
ulimit -n 65535

# 4. SELinux配置
semanage port -a -t redis_port_t -p tcp 6379
```

## 11. 最佳实践
### 开发规范
1. 键命名规范
   - 使用冒号分隔
   - 使用业务前缀
   - 避免特殊字符
   - 控制长度

2. 数据结构选择
   - String: 简单KV、计数器
   - Hash: 对象属性、配置信息
   - List: 消息队列、最新列表
   - Set: 标签、关系
   - Sorted Set: 排行榜、优先级队列

3. 过期策略
   - 设置合理的过期时间
   - 避免同时过期
   - 定期清理
   - 内存淘汰策略

4. 事务处理
   - 合理使用MULTI/EXEC
   - 注意WATCH使用
   - 避免长事务
   - 错误处理

### 运维规范
1. 监控指标
   - 内存使用率
   - CPU使用率
   - 连接数
   - 命令执行
   - 网络流量
   - 慢查询

2. 备份策略
   - 定时备份
   - 多副本保存
   - 异地备份
   - 备份验证

3. 高可用方案
   - 主从复制
   - 哨兵监控
   - 集群部署
   - 故障转移

4. 安全管理
   - 访问控制
   - 网络隔离
   - 数据加密
   - 审计日志

## 相关文档
- [MySQL系列文档](./01_MySQL系列文档.md)
- [MongoDB系列文档](./03_MongoDB系列文档.md)

## 参考资料
1. [Redis官方文档](https://redis.io/documentation)
2. [Redis命令参考](https://redis.io/commands)
3. [Redis最佳实践](https://redis.io/topics/best-practices)
4. [Redis安全指南](https://redis.io/topics/security) 