# Kafka系列文档

## 文档信息
- 版本: v1.0.0
- 更新时间: 2024-03-21
- 状态: [🏗️进行中]
- 作者: System Admin

## 修订历史
| 版本 | 日期 | 描述 | 作者 |
|-----|------|-----|-----|
| v1.0.0 | 2024-03-21 | 初始版本 | System Admin |

## 文档说明
### 目标读者
- 系统管理员
- 运维工程师
- 开发人员
- 架构设计师

### 前置知识
- 消息队列基础概念
- Linux系统基础
- 网络协议基础
- 分布式系统基础

## Kafka概述
### 基础概念
1. 核心组件
   - Broker（代理服务器）
   - Topic（主题）
   - Partition（分区）
   - Producer（生产者）
   - Consumer（消费者）
   - Consumer Group（消费者组）
   - ZooKeeper（协调服务）

2. 特性优势
   - 高吞吐量
   - 低延迟
   - 可扩展性
   - 持久性
   - 容错性
   - 高并发

### 工作原理
1. 消息存储
   - 分区机制
   - 日志存储
   - 分段文件
   - 索引机制

2. 消息传递
   - 生产者发送
   - 分区分配
   - 消费者拉取
   - 偏移量管理

3. 复制机制
   - Leader选举
   - Follower同步
   - ISR机制
   - 副本管理

## 安装部署
### 环境准备
```bash
# 安装Java
apt update
apt install -y openjdk-11-jdk

# 下载Kafka
wget https://downloads.apache.org/kafka/3.6.1/kafka_2.13-3.6.1.tgz
tar -xzf kafka_2.13-3.6.1.tgz
mv kafka_2.13-3.6.1 /opt/kafka

# 创建数据目录
mkdir -p /data/kafka/logs
mkdir -p /data/zookeeper
```

### 基础配置
```bash
# server.properties
broker.id=0
listeners=PLAINTEXT://:9092
advertised.listeners=PLAINTEXT://your.host.name:9092
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
log.dirs=/data/kafka/logs
num.partitions=1
num.recovery.threads.per.data.dir=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
zookeeper.connect=localhost:2181
zookeeper.connection.timeout.ms=18000
```

### 集群部署
```bash
# 多broker配置
# broker1
broker.id=1
listeners=PLAINTEXT://:9092
log.dirs=/data/kafka/logs-1

# broker2
broker.id=2
listeners=PLAINTEXT://:9093
log.dirs=/data/kafka/logs-2

# broker3
broker.id=3
listeners=PLAINTEXT://:9094
log.dirs=/data/kafka/logs-3
```

## 运维管理
### 主题管理
```bash
# 创建主题
kafka-topics.sh --create --bootstrap-server localhost:9092 \
    --replication-factor 3 --partitions 3 --topic test

# 查看主题
kafka-topics.sh --list --bootstrap-server localhost:9092

# 查看主题详情
kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic test

# 删除主题
kafka-topics.sh --delete --bootstrap-server localhost:9092 --topic test
```

### 消费者管理
```bash
# 查看消费者组
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# 查看消费者组详情
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --describe --group my-group

# 重置偏移量
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group my-group --reset-offsets --to-earliest --execute --topic test
```

### 性能测试
```bash
# 生产者性能测试
kafka-producer-perf-test.sh --topic test \
    --num-records 1000000 --record-size 1000 \
    --throughput 100000 --producer-props bootstrap.servers=localhost:9092

# 消费者性能测试
kafka-consumer-perf-test.sh --bootstrap-server localhost:9092 \
    --topic test --fetch-size 1048576 --messages 1000000
```

## 监控管理
### 系统监控
1. JMX指标
   - 系统资源
   - GC状态
   - 线程状态
   - 内存使用

2. Broker指标
   - 消息流入率
   - 消息流出率
   - 活跃连接数
   - 请求处理时间

3. Topic指标
   - 消息数量
   - 分区数量
   - 副本状态
   - 同步延迟

### 日志管理
```bash
# 服务器日志
/data/kafka/logs/server.log

# 控制器日志
/data/kafka/logs/controller.log

# 状态变更日志
/data/kafka/logs/state-change.log

# 日志清理
find /data/kafka/logs -name "*.log" -mtime +7 -delete
```

### 告警配置
1. 系统告警
   - CPU使用率
   - 内存使用率
   - 磁盘使用率
   - 网络状态

2. 业务告警
   - 消息堆积
   - 消费延迟
   - 副本同步
   - 分区状态

## 性能优化
### 系统优化
1. 操作系统优化
   ```bash
   # 文件描述符
   ulimit -n 100000
   
   # 虚拟内存
   vm.swappiness=1
   
   # 网络参数
   net.core.wmem_max=16777216
   net.core.rmem_max=16777216
   ```

2. JVM优化
   ```bash
   KAFKA_HEAP_OPTS="-Xms6g -Xmx6g"
   KAFKA_JVM_PERFORMANCE_OPTS="-server -XX:+UseG1GC"
   ```

### Broker优化
1. 吞吐量优化
   ```properties
   # 网络线程数
   num.network.threads=8
   
   # IO线程数
   num.io.threads=16
   
   # 发送缓冲区
   socket.send.buffer.bytes=1048576
   
   # 接收缓冲区
   socket.receive.buffer.bytes=1048576
   ```

2. 存储优化
   ```properties
   # 日志分段大小
   log.segment.bytes=1073741824
   
   # 日志保留时间
   log.retention.hours=168
   
   # 日志清理策略
   log.cleanup.policy=delete
   ```

### 生产者优化
```properties
# 批量大小
batch.size=16384

# 延迟时间
linger.ms=5

# 压缩类型
compression.type=lz4

# 缓冲区大小
buffer.memory=33554432
```

### 消费者优化
```properties
# 拉取大小
fetch.min.bytes=1024

# 最大拉取字节数
max.partition.fetch.bytes=1048576

# 提交间隔
auto.commit.interval.ms=5000

# 心跳间隔
heartbeat.interval.ms=3000
```

## 故障处理
### 常见问题
1. Broker故障
   - 进程崩溃
   - 磁盘故障
   - 网络故障
   - 资源耗尽

2. 集群问题
   - 副本不同步
   - Leader选举失败
   - 分区不平衡
   - ZooKeeper连接问题

3. 性能问题
   - 消息堆积
   - 延迟过高
   - 吞吐量下降
   - GC问题

### 故障排查
```bash
# 检查服务状态
jps | grep Kafka
netstat -nltp | grep 9092

# 检查日志
tail -f /data/kafka/logs/server.log

# 检查分区状态
kafka-topics.sh --describe --bootstrap-server localhost:9092

# 检查消费状态
kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092
```

### 恢复方案
1. Broker恢复
   ```bash
   # 重启服务
   kafka-server-stop.sh
   kafka-server-start.sh -daemon /opt/kafka/config/server.properties
   
   # 重新分配分区
   kafka-reassign-partitions.sh --execute
   ```

2. 数据恢复
   ```bash
   # 备份数据
   tar -czf kafka-logs-backup.tar.gz /data/kafka/logs
   
   # 恢复数据
   tar -xzf kafka-logs-backup.tar.gz -C /data/kafka/
   ```

## 最佳实践
1. 架构设计
   - 合理规划集群
   - 实施高可用方案
   - 做好容量规划
   - 制定备份策略

2. 安全加固
   - 启用SSL/TLS
   - 实施认证授权
   - 网络隔离
   - 监控审计

3. 性能调优
   - 优化系统参数
   - 合理分配资源
   - 监控关键指标
   - 及时处理告警

4. 运维管理
   - 自动化部署
   - 监控告警
   - 日志管理
   - 定期维护

## 参考资料
- [Kafka官方文档](https://kafka.apache.org/documentation/)
- [Kafka设计与实现](https://kafka.apache.org/documentation/#design)
- [Kafka运维指南](https://kafka.apache.org/documentation/#operations)
- [Kafka最佳实践](https://kafka.apache.org/documentation/#bestpractices)

## 相关文档
- [Linux基础命令](../../01_Linux系统管理/01_基础命令.md)
- [ZooKeeper文档](../05_分布式协调/01_ZooKeeper文档.md)
- [RabbitMQ文档](./01_RabbitMQ文档.md)
``` 