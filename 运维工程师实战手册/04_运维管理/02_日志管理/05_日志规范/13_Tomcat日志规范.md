# Tomcat日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、概述
本文档规定了Tomcat服务器的日志规范要求,包括catalina日志、访问日志、GC日志等的格式规范、配置方法和最佳实践。

## 二、日志分类及字段说明

### 2.1 Catalina日志字段
```yaml
time:
  description: 日志时间
  type: string
  format: [yyyy-MM-dd HH:mm:ss,SSS]
  required: true
  example: "2024-03-21 10:00:00,123"

level:
  description: 日志级别
  type: string
  required: true
  enum: [SEVERE, WARNING, INFO, CONFIG, FINE, FINER, FINEST]
  example: "INFO"

thread:
  description: 线程名称
  type: string
  required: true
  example: "http-nio-8080-exec-1"

source:
  description: 日志来源
  type: string
  required: true
  example: "org.apache.catalina.core.StandardEngine"

message:
  description: 日志消息
  type: string
  required: true
  example: "Starting Servlet Engine"

exception:
  description: 异常堆栈
  type: string
  required: false
  example: "java.lang.NullPointerException: ..."
```

### 2.2 访问日志字段
```yaml
remote_host:
  description: 客户端主机名或IP地址
  type: string
  required: true
  example: "192.168.1.100"

remote_user:
  description: 远程用户名
  type: string
  required: false
  example: "john"

time:
  description: 请求时间
  type: string
  format: [dd/MMM/yyyy:HH:mm:ss Z]
  required: true
  example: "21/Mar/2024:10:00:00 +0800"

request_line:
  description: 请求行
  type: string
  required: true
  example: "GET /app/index.jsp HTTP/1.1"

status:
  description: HTTP状态码
  type: integer
  required: true
  example: 200

bytes:
  description: 响应字节数
  type: integer
  required: true
  example: 1234

referer:
  description: 请求来源页面
  type: string
  required: false
  example: "https://example.com"

user_agent:
  description: 用户代理标识
  type: string
  required: false
  example: "Mozilla/5.0"

session_id:
  description: 会话ID
  type: string
  required: false
  example: "5E78D7AB23C"

processing_time:
  description: 请求处理时间(毫秒)
  type: integer
  required: false
  example: 123

thread_name:
  description: 处理线程名称
  type: string
  required: false
  example: "http-nio-8080-exec-1"

request_id:
  description: 请求ID
  type: string
  required: false
  example: "req-123-456"
```

### 2.3 GC日志字段
```yaml
time:
  description: GC发生时间
  type: string
  format: [yyyy-MM-dd'T'HH:mm:ss.SSS]
  required: true
  example: "2024-03-21T10:00:00.123"

gc_type:
  description: GC类型
  type: string
  required: true
  example: "Full GC"

gc_cause:
  description: GC原因
  type: string
  required: true
  example: "System.gc()"

heap_before:
  description: GC前堆内存使用
  type: string
  required: true
  example: "100M->80M"

heap_after:
  description: GC后堆内存使用
  type: string
  required: true
  example: "80M->60M"

gc_time:
  description: GC耗时
  type: string
  required: true
  example: "0.0123456 secs"
```

## 三、日志格式

### 3.1 Catalina日志格式
1. 标准格式
```
%d{yyyy-MM-dd HH:mm:ss,SSS} %-5p [%t] %c - %m%n
```

2. 扩展格式
```
%d{yyyy-MM-dd HH:mm:ss,SSS} %-5p [%t] %c{1} [%X{requestId}] [%X{userId}] - %m%n
```

3. JSON格式
```
{
  "timestamp":"%d{yyyy-MM-dd HH:mm:ss,SSS}",
  "level":"%-5p",
  "thread":"%t",
  "logger":"%c",
  "requestId":"%X{requestId}",
  "userId":"%X{userId}",
  "message":"%m"
}%n
```

### 3.2 访问日志格式
1. 通用格式
```
%h %l %u %t "%r" %s %b
```

2. 组合格式
```
%h %l %u %t "%r" %s %b "%{Referer}i" "%{User-Agent}i"
```

3. 扩展格式
```
%h %l %u %t "%r" %s %b "%{Referer}i" "%{User-Agent}i" %S %D %I "%{X-Forwarded-For}i"
```

4. JSON格式
```
{
  "host":"%h",
  "timestamp":"%t",
  "request":"%r",
  "status":"%s",
  "bytes":"%b",
  "referer":"%{Referer}i",
  "userAgent":"%{User-Agent}i",
  "sessionId":"%S",
  "processingTime":"%D",
  "threadName":"%I",
  "xForwardedFor":"%{X-Forwarded-For}i"
}
```

### 3.3 GC日志格式
```
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -Xloggc:/path/to/gc.log
```

## 四、日志配置

### 4.1 Catalina日志配置
1. logging.properties配置
```properties
# 根日志配置
handlers = 1catalina.org.apache.juli.AsyncFileHandler, 2localhost.org.apache.juli.AsyncFileHandler, 3manager.org.apache.juli.AsyncFileHandler, 4host-manager.org.apache.juli.AsyncFileHandler, java.util.logging.ConsoleHandler

.handlers = 1catalina.org.apache.juli.AsyncFileHandler, java.util.logging.ConsoleHandler

# Catalina日志
1catalina.org.apache.juli.AsyncFileHandler.level = FINE
1catalina.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
1catalina.org.apache.juli.AsyncFileHandler.prefix = catalina.
1catalina.org.apache.juli.AsyncFileHandler.maxDays = 90
1catalina.org.apache.juli.AsyncFileHandler.encoding = UTF-8

# Localhost日志
2localhost.org.apache.juli.AsyncFileHandler.level = FINE
2localhost.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
2localhost.org.apache.juli.AsyncFileHandler.prefix = localhost.
2localhost.org.apache.juli.AsyncFileHandler.maxDays = 90
2localhost.org.apache.juli.AsyncFileHandler.encoding = UTF-8

# Manager日志
3manager.org.apache.juli.AsyncFileHandler.level = FINE
3manager.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
3manager.org.apache.juli.AsyncFileHandler.prefix = manager.
3manager.org.apache.juli.AsyncFileHandler.maxDays = 90
3manager.org.apache.juli.AsyncFileHandler.encoding = UTF-8

# Host Manager日志
4host-manager.org.apache.juli.AsyncFileHandler.level = FINE
4host-manager.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
4host-manager.org.apache.juli.AsyncFileHandler.prefix = host-manager.
4host-manager.org.apache.juli.AsyncFileHandler.maxDays = 90
4host-manager.org.apache.juli.AsyncFileHandler.encoding = UTF-8

# 控制台输出
java.util.logging.ConsoleHandler.level = FINE
java.util.logging.ConsoleHandler.formatter = org.apache.juli.OneLineFormatter
java.util.logging.ConsoleHandler.encoding = UTF-8
```

2. log4j2.xml配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Properties>
        <Property name="baseDir">${sys:catalina.base}/logs</Property>
        <Property name="pattern">%d{yyyy-MM-dd HH:mm:ss,SSS} %-5p [%t] %c{1} [%X{requestId}] [%X{userId}] - %m%n</Property>
    </Properties>
    
    <Appenders>
        <RollingFile name="Catalina" fileName="${baseDir}/catalina.log" filePattern="${baseDir}/catalina.%d{yyyy-MM-dd}.log">
            <PatternLayout pattern="${pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
                <SizeBasedTriggeringPolicy size="100 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>
        
        <RollingFile name="Localhost" fileName="${baseDir}/localhost.log" filePattern="${baseDir}/localhost.%d{yyyy-MM-dd}.log">
            <PatternLayout pattern="${pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
                <SizeBasedTriggeringPolicy size="100 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>
        
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="${pattern}"/>
        </Console>
    </Appenders>
    
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Catalina"/>
            <AppenderRef ref="Console"/>
        </Root>
        
        <Logger name="org.apache.catalina" level="info" additivity="false">
            <AppenderRef ref="Catalina"/>
        </Logger>
        
        <Logger name="org.apache.tomcat" level="info" additivity="false">
            <AppenderRef ref="Catalina"/>
        </Logger>
        
        <Logger name="org.apache.jasper" level="info" additivity="false">
            <AppenderRef ref="Localhost"/>
        </Logger>
    </Loggers>
</Configuration>
```

### 4.2 访问日志配置
1. server.xml配置
```xml
<Valve className="org.apache.catalina.valves.AccessLogValve" 
    directory="logs"
    prefix="localhost_access_log"
    suffix=".txt"
    pattern="%h %l %u %t &quot;%r&quot; %s %b &quot;%{Referer}i&quot; &quot;%{User-Agent}i&quot; %S %D %I"
    fileDateFormat="yyyy-MM-dd"
    rotatable="true"
    renameOnRotate="true"
    buffered="true"
    maxDays="90"
    encoding="UTF-8"/>
```

2. JSON格式配置
```xml
<Valve className="org.apache.catalina.valves.AccessLogValve"
    directory="logs"
    prefix="localhost_access_log"
    suffix=".json"
    pattern="{ &quot;host&quot;:&quot;%h&quot;, &quot;timestamp&quot;:&quot;%t&quot;, &quot;request&quot;:&quot;%r&quot;, &quot;status&quot;:%s, &quot;bytes&quot;:%b, &quot;referer&quot;:&quot;%{Referer}i&quot;, &quot;userAgent&quot;:&quot;%{User-Agent}i&quot;, &quot;sessionId&quot;:&quot;%S&quot;, &quot;processingTime&quot;:%D, &quot;threadName&quot;:&quot;%I&quot; }"
    fileDateFormat="yyyy-MM-dd"
    rotatable="true"
    renameOnRotate="true"
    buffered="true"
    maxDays="90"
    encoding="UTF-8"/>
```

### 4.3 GC日志配置
1. JVM参数配置
```bash
JAVA_OPTS="$JAVA_OPTS \
    -XX:+PrintGCDetails \
    -XX:+PrintGCDateStamps \
    -XX:+PrintGCTimeStamps \
    -XX:+PrintHeapAtGC \
    -XX:+PrintTenuringDistribution \
    -XX:+PrintGCApplicationStoppedTime \
    -XX:+PrintGCApplicationConcurrentTime \
    -Xloggc:/path/to/gc.log \
    -XX:+UseGCLogFileRotation \
    -XX:NumberOfGCLogFiles=10 \
    -XX:GCLogFileSize=100M"
```

### 4.4 日志轮转配置
1. logrotate配置
```bash
# /etc/logrotate.d/tomcat
/path/to/tomcat/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 tomcat tomcat
    sharedscripts
    postrotate
        if [ -f /path/to/tomcat/bin/shutdown.sh ]; then
            /path/to/tomcat/bin/shutdown.sh
            sleep 5
            /path/to/tomcat/bin/startup.sh
        fi
    endscript
}
```

2. 自动清理脚本
```bash
#!/bin/bash
# /usr/local/sbin/tomcat-log-cleanup.sh

# 日志目录
LOG_PATH="/path/to/tomcat/logs"
# 备份目录
BACKUP_PATH="/data/backup/tomcat/logs"
# 日志保留天数
SAVE_DAYS=30
# 时间戳
YESTERDAY=$(date -d "yesterday" +%Y%m%d)

# 创建备份目录
mkdir -p ${BACKUP_PATH}/${YESTERDAY}

# 移动并压缩日志
cd ${LOG_PATH}
for log_file in *.log *.txt; do
    if [ -f ${log_file} ]; then
        mv ${log_file} ${BACKUP_PATH}/${YESTERDAY}/${log_file}.${YESTERDAY}
        gzip ${BACKUP_PATH}/${YESTERDAY}/${log_file}.${YESTERDAY}
    fi
done

# 重启Tomcat使其重新打开日志文件
/path/to/tomcat/bin/shutdown.sh
sleep 5
/path/to/tomcat/bin/startup.sh

# 删除过期日志
find ${BACKUP_PATH} -type d -mtime +${SAVE_DAYS} -exec rm -rf {} \;
```

3. 定时任务配置
```bash
# crontab -e
0 0 * * * /usr/local/sbin/tomcat-log-cleanup.sh
```

## 五、日志示例

### 5.1 Catalina日志示例
1. 标准格式
```
2024-03-21 10:00:00,123 INFO [main] org.apache.catalina.startup.VersionLoggerListener - Server version name:   Apache Tomcat/9.0.54
2024-03-21 10:00:00,234 INFO [main] org.apache.catalina.core.StandardService - Starting service [Catalina]
2024-03-21 10:00:00,345 ERROR [http-nio-8080-exec-1] org.apache.catalina.core.StandardWrapperValve - Servlet.service() for servlet [jsp] threw exception
java.lang.NullPointerException: null
    at org.apache.jsp.index_jsp._jspService(index_jsp.java:142)
    at org.apache.jasper.runtime.HttpJspBase.service(HttpJspBase.java:70)
```

2. JSON格式
```json
{
    "timestamp": "2024-03-21 10:00:00,123",
    "level": "INFO",
    "thread": "main",
    "logger": "org.apache.catalina.startup.VersionLoggerListener",
    "requestId": "req-123-456",
    "userId": "user-789",
    "message": "Server version name:   Apache Tomcat/9.0.54"
}
```

### 5.2 访问日志示例
1. 通用格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /app/index.jsp HTTP/1.1" 200 1234
```

2. 组合格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /app/index.jsp HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"
```

3. JSON格式
```json
{
    "host": "192.168.1.100",
    "timestamp": "[21/Mar/2024:10:00:00 +0800]",
    "request": "GET /app/index.jsp HTTP/1.1",
    "status": 200,
    "bytes": 1234,
    "referer": "https://example.com",
    "userAgent": "Mozilla/5.0",
    "sessionId": "5E78D7AB23C",
    "processingTime": 123,
    "threadName": "http-nio-8080-exec-1"
}
```

### 5.3 GC日志示例
```
2024-03-21T10:00:00.123+0800: [GC (Allocation Failure) [PSYoungGen: 100M->20M(120M)] 200M->180M(500M), 0.0123456 secs] [Times: user=0.01 sys=0.00, real=0.01 secs]
2024-03-21T10:00:01.234+0800: [Full GC (System.gc()) [PSYoungGen: 20M->0M(120M)] [ParOldGen: 180M->150M(380M)] 200M->150M(500M), [Metaspace: 30M->30M(100M)], 0.0234567 secs] [Times: user=0.02 sys=0.00, real=0.02 secs]
```

## 六、最佳实践

### 6.1 Catalina日志最佳实践
1. 日志级别设置
   - 生产环境使用INFO级别
   - 开发环境可用FINE级别
   - 按包名设置不同级别
   - 定期检查错误日志

2. 日志内容优化
   - 记录完整错误信息
   - 包含上下文信息
   - 使用MDC记录请求ID
   - 避免敏感信息泄露

3. 性能优化
   - 使用异步日志处理
   - 合理设置缓冲大小
   - 避免过多日志输出
   - 定期清理日志文件

4. 安全考虑
   - 限制日志访问权限
   - 加密敏感信息
   - 定期备份日志
   - 监控异常访问

### 6.2 访问日志最佳实践
1. 日志格式选择
   - 使用JSON格式便于解析
   - 记录必要的字段信息
   - 包含请求处理时间
   - 记录会话信息

2. 日志配置优化
   - 按应用分开记录
   - 启用缓冲写入
   - 配置日志轮转
   - 设置最大保留时间

3. 性能优化
   - 使用异步Valve
   - 合理设置缓冲大小
   - 避免记录静态资源
   - 定期清理日志

4. 监控分析
   - 监控请求量变化
   - 分析响应时间
   - 统计错误率
   - 检测异常访问

### 6.3 GC日志最佳实践
1. 日志配置
   - 启用详细GC日志
   - 配置日志轮转
   - 设置合适的文件大小
   - 保留足够的历史记录

2. 性能优化
   - 监控GC频率
   - 分析GC原因
   - 优化JVM参数
   - 定期清理日志

3. 监控告警
   - 监控GC时间
   - 监控内存使用
   - 设置告警阈值
   - 及时处理问题

## 七、监控告警

### 7.1 监控指标
1. 基础指标
   - 请求数量
   - 错误率
   - 响应时间
   - 并发连接数

2. JVM指标
   - 堆内存使用
   - GC频率和时间
   - 线程数量
   - CPU使用率

3. 应用指标
   - 活动会话数
   - 请求队列长度
   - 数据库连接数
   - 缓存命中率

### 7.2 告警规则
1. 错误告警
```yaml
- alert: TomcatHighError5xxRate
  expr: sum(rate(tomcat_servlet_error_total{status=~"5.."}[5m])) / sum(rate(tomcat_servlet_request_total[5m])) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: High HTTP 5xx error rate
    description: More than 5% of all requests are resulting in 5xx errors

- alert: TomcatHighError4xxRate
  expr: sum(rate(tomcat_servlet_error_total{status=~"4.."}[5m])) / sum(rate(tomcat_servlet_request_total[5m])) > 0.20
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High HTTP 4xx error rate
    description: More than 20% of all requests are resulting in 4xx errors
```

2. 性能告警
```yaml
- alert: TomcatHighResponseTime
  expr: tomcat_servlet_processing_time{quantile="0.9"} > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High response time
    description: 90th percentile of response time is above 1 second

- alert: TomcatHighThreadUsage
  expr: tomcat_threads_current / tomcat_threads_max > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High thread usage
    description: Thread pool usage is above 80%
```

3. JVM告警
```yaml
- alert: TomcatHighMemoryUsage
  expr: jvm_memory_used_bytes / jvm_memory_max_bytes > 0.9
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High memory usage
    description: JVM memory usage is above 90%

- alert: TomcatFrequentGC
  expr: rate(jvm_gc_collection_seconds_count[5m]) > 5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Frequent GC
    description: More than 5 GC collections per minute
```

## 八、故障排查

### 8.1 常见问题
1. 启动问题
   - 端口冲突
   - 内存不足
   - 权限问题
   - 配置错误

2. 运行问题
   - 内存泄漏
   - 线程死锁
   - 连接泄漏
   - 响应超时

3. 日志问题
   - 日志写入失败
   - 日志文件损坏
   - 磁盘空间不足
   - 日志丢失

### 8.2 排查方法
1. 日志分析
   - 查看catalina日志
   - 分析访问日志
   - 检查GC日志
   - 分析堆转储

2. 性能分析
   - 使用JProfiler
   - 分析线程转储
   - 监控系统资源
   - 检查数据库连接

3. 系统检查
   - 检查磁盘空间
   - 监控系统负载
   - 查看网络连接
   - 分析系统日志

### 8.3 解决方案
1. 启动问题
   - 修改端口配置
   - 调整内存参数
   - 修复权限问题
   - 检查配置文件

2. 运行问题
   - 修复内存泄漏
   - 解决死锁问题
   - 优化连接池
   - 调整超时设置

3. 日志问题
   - 检查日志权限
   - 修复日志配置
   - 清理磁盘空间
   - 实施日志备份

## 相关文档
- [Apache日志规范](12_Apache日志规范.md)
- [Nginx日志规范](11_Nginx日志规范.md)
- [日志收集方案](../02_日志收集方案.md)
- [日志分析工具](../03_日志分析工具.md)

## 更新记录
- 2024-03-21: 创建Tomcat日志规范文档 