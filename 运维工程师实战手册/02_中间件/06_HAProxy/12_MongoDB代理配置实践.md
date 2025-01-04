# HAProxy代理MongoDB最佳实践指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 常见问题分析

### 1.1 连接断开问题
在使用HAProxy代理MongoDB服务时，后端Java服务经常出现连接断开的情况，主要有以下几个原因：

1. 超时设置不合理
   - client超时设置过短（默认客户端超时可能只有几分钟）
   - server超时设置过短（需要匹配MongoDB的默认30分钟超时）
   - tunnel超时设置不当（影响长连接保持）

2. TCP Keepalive配置不当
   - keepalive参数未开启（导致空闲连接被防火墙关闭）
   - 探测间隔时间不合理（太长导致连接状态不准确）
   - 重试次数设置过低（容易误判连接状态）

3. 连接池配置问题
   - 连接池大小设置不当（影响并发处理能力）
   - 连接存活时间过短（导致频繁创建新连接）
   - 连接复用策略不合理（影响性能和稳定性）

4. 健康检查配置不当
   - 检查间隔过长（无法及时发现问题）
   - 重试次数过少（容易误判服务状态）
   - 检查超时时间不合理（影响判断准确性）

5. 系统参数优化
   - 最大文件描述符限制（影响最大连接数）
   - TCP连接队列大小（影响新连接处理）
   - 网络缓冲区大小（影响传输性能）

## 2. 完整配置示例

### 2.1 系统参数优化
```bash
# /etc/sysctl.conf
# TCP连接优化
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl = 15

# 连接队列优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# TIME_WAIT优化
net.ipv4.tcp_max_tw_buckets = 262144
net.ipv4.tcp_tw_reuse = 1
```

### 2.2 HAProxy完整配置
```bash
global
    log 127.0.0.1 local0 info
    maxconn 100000
    # 系统参数优化
    ulimit-n 65535
    
    # TCP keepalive全局配置
    tune.tcp.keepalive-time 300     # keepalive探测时间
    tune.tcp.keepalive-probes 3     # 探测次数
    tune.tcp.keepalive-intvl 15     # 探测间隔

defaults
    mode tcp
    log global
    option tcplog
    option dontlognull
    # MongoDB默认连接超时是30分钟,需要调整HAProxy超时参数
    timeout connect 5s
    timeout client 30m    # 增加客户端超时
    timeout server 30m    # 增加服务器端超时

frontend mongo-front
    bind *:27017
    default_backend mongo-servers
    
    # 连接限制
    maxconn 50000
    
    # 速率限制（防止连接风暴）
    stick-table type ip size 100k expire 30s store conn_rate(3s)
    tcp-request connection track-sc1 src
    tcp-request connection reject if { sc1_conn_rate gt 100 }

backend mongo-servers
    mode tcp
    balance roundrobin
    
    # 健康检查配置
    option tcp-check
    tcp-check connect
    tcp-check send PING\r\n
    tcp-check expect string PONG
    
    # TCP keepalive
    option tcpka
    
    # 连接限制
    maxconn 3000
    queue 200 timeout 5s
    
    # 服务器配置（包含详细的健康检查参数）
    server mongo1 192.168.1.101:27017 check inter 3s fall 3 rise 2 maxconn 1500
    server mongo2 192.168.1.102:27017 check inter 3s fall 3 rise 2 maxconn 1500 backup
    
    # 重试设置
    retries 2
    option redispatch
```

### 2.3 Java应用配置
```java
// MongoDB连接参数优化
MongoClientOptions options = MongoClientOptions.builder()
    .connectTimeout(30000)                // 连接超时时间
    .socketTimeout(30000)                 // Socket超时时间
    .serverSelectionTimeout(30000)        // 服务器选择超时时间
    .maxConnectionIdleTime(300000)        // 最大空闲时间
    .heartbeatFrequency(10000)           // 心跳频率
    .minHeartbeatFrequency(500)          // 最小心跳频率
    .heartbeatConnectTimeout(20000)       // 心跳连接超时
    .heartbeatSocketTimeout(20000)        // 心跳Socket超时
    .maxConnectionLifeTime(3600000)       // 最大连接生命周期
    .build();

// 连接池配置优化
MongoClientOptions options = MongoClientOptions.builder()
    .minConnectionsPerHost(10)            // 每个主机最小连接数
    .connectionsPerHost(100)              // 每个主机最大连接数
    .threadsAllowedToBlockForConnectionMultiplier(5)  // 线程阻塞倍数
    .maxWaitTime(120000)                  // 最大等待时间
    .maxConnectionLifeTime(3600000)       // 最大连接生命周期
    .build();

// 创建MongoClient时使用配置
MongoClient mongoClient = new MongoClient(Arrays.asList(
    new ServerAddress("haproxy1:27017"),
    new ServerAddress("haproxy2:27017")  // HAProxy高可用地址
), options);
```

## 3. 关键配置说明

### 3.1 超时配置
1. HAProxy超时设置
   - `timeout connect 5s`: 连接超时，建议5-10秒
   - `timeout client 30m`: 客户端超时，匹配MongoDB默认30分钟
   - `timeout server 30m`: 服务器超时，匹配MongoDB默认30分钟

2. Java客户端超时设置
   - `connectTimeout`: 建议30秒
   - `socketTimeout`: 建议30-60秒
   - `maxConnectionIdleTime`: 建议5-10分钟

### 3.2 连接保持配置
1. HAProxy keepalive设置
   - `option tcpka`: 启用TCP keepalive
   - `tune.tcp.keepalive-time`: 建议300秒
   - `tune.tcp.keepalive-probes`: 建议3次
   - `tune.tcp.keepalive-intvl`: 建议15秒

2. 系统层面keepalive设置
   - `net.ipv4.tcp_keepalive_time`: 建议300秒
   - `net.ipv4.tcp_keepalive_probes`: 建议3次
   - `net.ipv4.tcp_keepalive_intvl`: 建议15秒

### 3.3 连接限制配置
1. HAProxy连接限制
   - 全局最大连接：`maxconn 100000`
   - 前端最大连接：`maxconn 50000`
   - 后端最大连接：`maxconn 3000`
   - 单服务器最大连接：`maxconn 1500`

2. Java连接池限制
   - 最小连接数：`minConnectionsPerHost 10`
   - 最大连接数：`connectionsPerHost 100`
   - 连接生命周期：`maxConnectionLifeTime 3600000`

## 4. 性能优化建议

### 4.1 系统层面优化
1. 文件描述符限制
   ```bash
   # /etc/security/limits.conf
   * soft nofile 65535
   * hard nofile 65535
   ```

2. 网络参数优化
   ```bash
   # /etc/sysctl.conf
   net.core.rmem_max = 16777216
   net.core.wmem_max = 16777216
   net.ipv4.tcp_rmem = 4096 87380 16777216
   net.ipv4.tcp_wmem = 4096 65536 16777216
   ```

### 4.2 HAProxy优化
1. 工作进程优化
   ```bash
   global
       nbproc 4                    # 工作进程数
       cpu-map 1 0
       cpu-map 2 1
       cpu-map 3 2
       cpu-map 4 3
   ```

2. 缓冲区优化
   ```bash
   global
       tune.bufsize 32768          # 缓冲区大小
       tune.maxrewrite 1024        # 重写缓冲区大小
   ```

## 5. 问题排查方法

### 5.1 连接断开排查
1. 检查HAProxy日志
   ```bash
   tail -f /var/log/haproxy.log | grep "mongo"
   ```

2. 检查MongoDB连接日志
   ```bash
   tail -f /var/log/mongodb/mongod.log | grep "connection"
   ```

3. 检查Java应用日志
   ```bash
   grep "MongoDB" application.log
   ```

### 5.2 性能问题排查
1. HAProxy状态检查
   ```bash
   echo "show stat" | socat stdio unix:/var/run/haproxy.sock
   ```

2. 连接数监控
   ```bash
   watch 'echo "show stat" | socat stdio unix:/var/run/haproxy.sock | cut -d "," -f 1,2,4,5,7,8'
   ```

### 5.3 网络问题排查
1. TCP连接状态检查
   ```bash
   netstat -n | awk '/27017/ {print $6}' | sort | uniq -c
   ```

2. 连接跟踪
   ```bash
   tcpdump -i any port 27017 -w mongo.pcap
   ```

## 6. 监控告警配置

### 6.1 关键指标
1. HAProxy指标
   - 当前连接数
   - 会话率
   - 重试次数
   - 后端服务器状态

2. MongoDB指标
   - 连接数
   - 操作延迟
   - 错误率
   - 复制延迟

### 6.2 告警阈值
1. 连接相关
   - 连接数超过80%最大值
   - 连接失败率超过1%
   - 重试次数突增

2. 性能相关
   - 响应时间超过500ms
   - 错误率超过0.1%
   - 队列长度持续增长

## 7. 最佳实践总结

1. 配置优化
   - 确保各层超时时间协调一致
   - 启用并优化TCP keepalive
   - 合理设置连接限制
   - 实现精确的健康检查

2. 高可用配置
   - 配置HAProxy多实例
   - 使用Keepalived实现故障转移
   - 实现MongoDB副本集
   - 合理设置备份服务器

3. 监控运维
   - 实时监控关键指标
   - 设置合理的告警阈值
   - 建立故障响应机制
   - 定期进行压力测试

4. 安全防护
   - 限制连接速率
   - 启用访问控制
   - 配置SSL/TLS加密
   - 实施网络隔离

## 8. 相关文档
- [HAProxy官方文档](http://www.haproxy.org/#docs)
- [MongoDB官方文档](https://docs.mongodb.com/)
- [Java MongoDB驱动文档](https://mongodb.github.io/mongo-java-driver/)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善配置示例和最佳实践建议
- 2024-03-21: 补充生产环境实战经验 