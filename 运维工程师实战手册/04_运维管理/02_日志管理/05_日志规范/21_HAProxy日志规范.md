# HAProxy日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、概述
本文档规定了HAProxy的日志规范要求,包括访问日志、错误日志等的格式规范、配置方法和最佳实践。

## 二、日志分类及字段说明

### 2.1 访问日志字段
```yaml
time:
  description: 请求时间
  type: string
  format: [%d/%b/%Y:%H:%M:%S.%ms]
  required: true
  example: "21/Mar/2024:10:00:00.123"

process_name:
  description: 进程名称
  type: string
  required: true
  example: "haproxy"

pid:
  description: 进程ID
  type: integer
  required: true
  example: 1234

frontend_name:
  description: 前端名称
  type: string
  required: true
  example: "http-in"

backend_name:
  description: 后端名称
  type: string
  required: true
  example: "app-backend"

server_name:
  description: 服务器名称
  type: string
  required: true
  example: "app-server1"

tq:
  description: 排队等待时间(毫秒)
  type: integer
  required: true
  example: 0

tw:
  description: 建立连接等待时间(毫秒)
  type: integer
  required: true
  example: 1

tc:
  description: 连接建立时间(毫秒)
  type: integer
  required: true
  example: 2

tr:
  description: 服务器响应时间(毫秒)
  type: integer
  required: true
  example: 123

tt:
  description: 总处理时间(毫秒)
  type: integer
  required: true
  example: 126

status_code:
  description: HTTP状态码
  type: integer
  required: true
  example: 200

bytes_read:
  description: 读取字节数
  type: integer
  required: true
  example: 1234

captured_request_cookie:
  description: 捕获的请求Cookie
  type: string
  required: false
  example: "session=abc123"

captured_response_cookie:
  description: 捕获的响应Cookie
  type: string
  required: false
  example: "session=abc123"

termination_state:
  description: 连接终止状态
  type: string
  required: true
  example: "----"

actconn:
  description: 当前活动连接数
  type: integer
  required: true
  example: 10

feconn:
  description: 前端当前连接数
  type: integer
  required: true
  example: 5

beconn:
  description: 后端当前连接数
  type: integer
  required: true
  example: 3

srv_conn:
  description: 服务器当前连接数
  type: integer
  required: true
  example: 2

retries:
  description: 重试次数
  type: integer
  required: true
  example: 0

srv_queue:
  description: 服务器队列数
  type: integer
  required: true
  example: 0

backend_queue:
  description: 后端队列数
  type: integer
  required: true
  example: 0

captured_request_headers:
  description: 捕获的请求头
  type: array
  required: false
  example: ["X-Forwarded-For: 192.168.1.100"]

captured_response_headers:
  description: 捕获的响应头
  type: array
  required: false
  example: ["Content-Type: application/json"]

http_request:
  description: HTTP请求行
  type: string
  required: true
  example: "GET /index.html HTTP/1.1"

client_ip:
  description: 客户端IP
  type: string
  required: true
  example: "192.168.1.100"

client_port:
  description: 客户端端口
  type: integer
  required: true
  example: 54321
```

### 2.2 错误日志字段
```yaml
time:
  description: 错误发生时间
  type: string
  format: [%d/%b/%Y:%H:%M:%S.%ms]
  required: true
  example: "21/Mar/2024:10:00:00.123"

process_name:
  description: 进程名称
  type: string
  required: true
  example: "haproxy"

pid:
  description: 进程ID
  type: integer
  required: true
  example: 1234

message:
  description: 错误消息
  type: string
  required: true
  example: "Server app-server1 is DOWN, reason: Layer4 connection problem"

severity:
  description: 错误级别
  type: string
  required: true
  enum: [emerg, alert, crit, err, warning, notice, info, debug]
  example: "err"
```

## 三、日志格式

### 3.1 访问日志格式
1. 默认格式
```
%T [%t] %f %b/%s %Tw/%Tc/%Tt %B %ts %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r
```

2. 详细格式
```
%ci:%cp [%t] %ft %b/%s %Tq/%Tw/%Tc/%Tr/%Tt %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r %[capture.req.hdr(0)] %[capture.res.hdr(0)]
```

3. HTTP格式
```
%ci:%cp [%tr] %ft %b/%s %TR/%Tw/%Tc/%Tr/%Ta %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs "%HM %[capture.req.uri] %HV"
```

4. TCP格式
```
%ci:%cp [%t] %ft %b/%s %Tw/%Tc/%Tt %B %ts %ac/%fc/%bc/%sc/%rc %sq/%bq
```

5. JSON格式
```
{
    "timestamp":"%t",
    "frontend_name":"%f",
    "backend_name":"%b",
    "server_name":"%s",
    "tq":%Tq,
    "tw":%Tw,
    "tc":%Tc,
    "tr":%Tr,
    "tt":%Tt,
    "status_code":%ST,
    "bytes_read":%B,
    "captured_request_cookie":"%CC",
    "captured_response_cookie":"%CS",
    "termination_state":"%ts",
    "actconn":%ac,
    "feconn":%fc,
    "beconn":%bc,
    "srv_conn":%sc,
    "retries":%rc,
    "srv_queue":%sq,
    "backend_queue":%bq,
    "captured_request_headers":[%hr],
    "captured_response_headers":[%hs],
    "http_request":"%r",
    "client_ip":"%ci",
    "client_port":%cp
}
```

### 3.2 错误日志格式
```
%t [%p] %s %m
```

## 四、日志配置

### 4.1 全局配置
```haproxy
global
    log 127.0.0.1 local0 info
    log 127.0.0.1 local1 notice
    
    # 日志格式定义
    log-format "%ci:%cp [%tr] %ft %b/%s %TR/%Tw/%Tc/%Tr/%Ta %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs \"%HM %[capture.req.uri] %HV\""
    
    # 启用详细日志
    option httplog
    option dontlognull
    option dontlog-normal
    
    # 日志缓冲设置
    log-buffer-size 32768
    log-tag haproxy
```

### 4.2 前端配置
```haproxy
frontend http-in
    bind *:80
    mode http
    
    # 前端日志配置
    log global
    option httplog
    
    # 捕获请求头
    capture request header Host len 32
    capture request header User-Agent len 128
    capture request header X-Forwarded-For len 64
    
    # 捕获响应头
    capture response header Content-Length len 10
    capture response header Content-Type len 64
    
    # 定义访问控制列表
    acl is_health path /health
    
    # 不记录健康检查日志
    http-request silent-drop if is_health
    
    default_backend app-backend
```

### 4.3 后端配置
```haproxy
backend app-backend
    mode http
    balance roundrobin
    
    # 后端日志配置
    log global
    option httplog
    
    # 服务器健康检查
    option httpchk GET /health
    http-check expect status 200
    
    # 后端服务器
    server app1 192.168.1.101:8080 check inter 2000 rise 2 fall 3
    server app2 192.168.1.102:8080 check inter 2000 rise 2 fall 3
```

### 4.4 rsyslog配置
```bash
# /etc/rsyslog.d/haproxy.conf

# HAProxy日志设施
local0.* /var/log/haproxy/access.log
local1.* /var/log/haproxy/error.log

# 创建日志目录
if $programname == 'haproxy' then {
    set $.logpath = "/var/log/haproxy";
    action(type="omfile" file=`echo $$.logpath`"/access.log" template="RSYSLOG_TraditionalFileFormat")
    stop
}
```

### 4.5 日志轮转配置
```bash
# /etc/logrotate.d/haproxy
/var/log/haproxy/*.log {
    daily
    rotate 30
    missingok
    notifempty
    compress
    delaycompress
    postrotate
        /usr/bin/systemctl reload rsyslog >/dev/null 2>&1 || true
    endscript
}
```

## 五、日志示例

### 5.1 访问日志示例
1. 默认格式
```
192.168.1.100:54321 [21/Mar/2024:10:00:00.123] http-in app-backend/app1 0/1/2/123/126 200 1234 - - ---- 10/5/3/2/0 0/0 "GET /index.html HTTP/1.1"
```

2. 详细格式
```
192.168.1.100:54321 [21/Mar/2024:10:00:00.123] http-in app-backend/app1 0/1/2/123/126 200 1234 session=abc123 session=abc123 ---- 10/5/3/2/0 0/0 "GET /index.html HTTP/1.1" "Mozilla/5.0" "application/json"
```

3. JSON格式
```json
{
    "timestamp": "21/Mar/2024:10:00:00.123",
    "frontend_name": "http-in",
    "backend_name": "app-backend",
    "server_name": "app1",
    "tq": 0,
    "tw": 1,
    "tc": 2,
    "tr": 123,
    "tt": 126,
    "status_code": 200,
    "bytes_read": 1234,
    "captured_request_cookie": "session=abc123",
    "captured_response_cookie": "session=abc123",
    "termination_state": "----",
    "actconn": 10,
    "feconn": 5,
    "beconn": 3,
    "srv_conn": 2,
    "retries": 0,
    "srv_queue": 0,
    "backend_queue": 0,
    "captured_request_headers": ["User-Agent: Mozilla/5.0"],
    "captured_response_headers": ["Content-Type: application/json"],
    "http_request": "GET /index.html HTTP/1.1",
    "client_ip": "192.168.1.100",
    "client_port": 54321
}
```

### 5.2 错误日志示例
```
Mar 21 10:00:00 haproxy[1234]: Server app-backend/app1 is DOWN, reason: Layer4 connection problem
Mar 21 10:00:01 haproxy[1234]: Server app-backend/app2 is UP
```

## 六、最佳实践

### 6.1 日志配置最佳实践
1. 日志级别设置
   - 生产环境使用info级别
   - 开发环境可用debug级别
   - 按功能分开记录
   - 定期检查错误日志

2. 日志内容优化
   - 记录必要的字段
   - 避免重复信息
   - 使用JSON格式
   - 注意敏感信息

3. 性能优化
   - 使用本地rsyslog
   - 启用日志缓冲
   - 避免记录无用信息
   - 合理设置轮转策略

4. 安全考虑
   - 限制日志访问权限
   - 保护敏感信息
   - 定期备份日志
   - 监控异常访问

### 6.2 监控告警最佳实践
1. 错误监控
   - 服务器状态变化
   - 连接失败次数
   - 重试次数
   - 队列积压

2. 性能监控
   - 响应时间
   - 并发连接数
   - 队列长度
   - 会话数量

3. 安全监控
   - 异常访问
   - 拒绝连接
   - 认证失败
   - SSL错误

### 6.3 问题排查最佳实践
1. 连接问题
   - 检查后端状态
   - 分析响应时间
   - 查看连接数
   - 检查超时设置

2. 性能问题
   - 分析响应时间
   - 检查队列长度
   - 监控资源使用
   - 优化配置参数

3. 配置问题
   - 验证配置语法
   - 检查日志设置
   - 确认监听端口
   - 测试后端服务

## 七、监控告警

### 7.1 监控指标
1. 基础指标
   - 请求数量
   - 错误率
   - 响应时间
   - 并发连接数

2. 后端指标
   - 服务器状态
   - 响应时间
   - 重试次数
   - 队列长度

3. 性能指标
   - CPU使用率
   - 内存使用率
   - 网络流量
   - 磁盘IO

### 7.2 告警规则
1. 错误告警
```yaml
- alert: HAProxyHighError5xxRate
  expr: sum(rate(haproxy_http_responses_total{code=~"5.."}[5m])) / sum(rate(haproxy_http_responses_total[5m])) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: High HTTP 5xx error rate
    description: More than 5% of all requests are resulting in 5xx errors

- alert: HAProxyServerDown
  expr: haproxy_server_up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: HAProxy server down
    description: HAProxy server {{ $labels.server }} is down in backend {{ $labels.backend }}
```

2. 性能告警
```yaml
- alert: HAProxyHighResponseTime
  expr: haproxy_server_response_time_average_seconds > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High response time
    description: Average response time is above 1 second

- alert: HAProxyHighQueueLength
  expr: haproxy_backend_current_queue > 100
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High queue length
    description: More than 100 requests in queue
```

3. 容量告警
```yaml
- alert: HAProxyHighConnectionUsage
  expr: haproxy_frontend_current_sessions / haproxy_frontend_limit_sessions > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High connection usage
    description: More than 80% of connection slots are used
```

## 八、故障排查

### 8.1 常见问题
1. 连接问题
   - 后端服务不可用
   - 连接超时
   - 连接拒绝
   - SSL错误

2. 性能问题
   - 响应时间过长
   - 队列堆积
   - 连接数过高
   - 资源不足

3. 配置问题
   - 配置语法错误
   - 路由配置错误
   - 健康检查失败
   - 日志配置错误

### 8.2 排查方法
1. 日志分析
   - 查看错误日志
   - 分析访问日志
   - 检查系统日志
   - 分析统计信息

2. 状态检查
   - 查看统计页面
   - 检查后端状态
   - 监控连接数
   - 分析队列长度

3. 网络检查
   - 测试连接性
   - 检查防火墙
   - 验证DNS解析
   - 测试端口状态

### 8.3 解决方案
1. 连接问题
   - 重启后端服务
   - 调整超时设置
   - 修复SSL配置
   - 检查网络连接

2. 性能问题
   - 增加后端服务器
   - 优化配置参数
   - 调整队列大小
   - 限制连接数

3. 配置问题
   - 修正配置语法
   - 更新路由规则
   - 调整健康检查
   - 优化日志设置

## 相关文档
- [Nginx日志规范](11_Nginx日志规范.md)
- [Apache日志规范](12_Apache日志规范.md)
- [日志收集方案](../02_日志收集方案.md)
- [日志分析工具](../03_日志分析工具.md)

## 更新记录
- 2024-03-21: 创建HAProxy日志规范文档 