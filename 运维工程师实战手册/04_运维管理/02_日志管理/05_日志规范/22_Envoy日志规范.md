# Envoy日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、概述
本文档规定了Envoy代理的日志规范要求,包括访问日志、追踪日志等的格式规范、配置方法和最佳实践。

## 二、日志分类及字段说明

### 2.1 访问日志字段
```yaml
start_time:
  description: 请求开始时间
  type: string
  format: [%Y-%m-%dT%H:%M:%S.%fZ]
  required: true
  example: "2024-03-21T10:00:00.123Z"

method:
  description: HTTP方法
  type: string
  required: true
  example: "GET"

path:
  description: 请求路径
  type: string
  required: true
  example: "/api/v1/users"

protocol:
  description: 协议版本
  type: string
  required: true
  example: "HTTP/1.1"

response_code:
  description: 响应状态码
  type: integer
  required: true
  example: 200

response_flags:
  description: 响应标志
  type: string
  required: true
  example: "-"

response_code_details:
  description: 响应状态详情
  type: string
  required: true
  example: "via_upstream"

connection_termination_details:
  description: 连接终止详情
  type: string
  required: false
  example: "connection_termination_details"

upstream_cluster:
  description: 上游集群
  type: string
  required: true
  example: "service_cluster"

upstream_host:
  description: 上游主机
  type: string
  required: true
  example: "10.0.0.1:8080"

upstream_local_address:
  description: 上游本地地址
  type: string
  required: true
  example: "10.0.0.2:54321"

downstream_remote_address:
  description: 下游远程地址
  type: string
  required: true
  example: "192.168.1.100:54321"

downstream_local_address:
  description: 下游本地地址
  type: string
  required: true
  example: "192.168.1.1:80"

request_id:
  description: 请求ID
  type: string
  required: true
  example: "123e4567-e89b-12d3-a456-426614174000"

user_agent:
  description: 用户代理
  type: string
  required: false
  example: "Mozilla/5.0"

request_headers:
  description: 请求头
  type: object
  required: false
  example: 
    host: "example.com"
    x-forwarded-for: "192.168.1.100"

response_headers:
  description: 响应头
  type: object
  required: false
  example:
    content-type: "application/json"
    content-length: "1234"

response_body:
  description: 响应体
  type: string
  required: false
  example: "{\"status\":\"success\"}"

response_trailers:
  description: 响应尾部
  type: object
  required: false
  example:
    grpc-status: "0"
    grpc-message: "OK"

upstream_service_time:
  description: 上游服务时间(ms)
  type: integer
  required: true
  example: 123

bytes_received:
  description: 接收字节数
  type: integer
  required: true
  example: 1234

bytes_sent:
  description: 发送字节数
  type: integer
  required: true
  example: 5678

duration:
  description: 请求处理时间(ms)
  type: integer
  required: true
  example: 125

upstream_request_attempt_count:
  description: 上游请求尝试次数
  type: integer
  required: true
  example: 1

route_name:
  description: 路由名称
  type: string
  required: false
  example: "api_route"

virtual_cluster_name:
  description: 虚拟集群名称
  type: string
  required: false
  example: "api_cluster"

rate_limit_status:
  description: 限流状态
  type: string
  required: false
  example: "OK"

requested_server_name:
  description: 请求的服务器名称
  type: string
  required: false
  example: "example.com"

dynamic_metadata:
  description: 动态元数据
  type: object
  required: false
  example:
    filter:
      key: "value"
```

### 2.2 追踪日志字段
```yaml
trace_id:
  description: 追踪ID
  type: string
  required: true
  example: "123e4567-e89b-12d3-a456-426614174000"

span_id:
  description: 跨度ID
  type: string
  required: true
  example: "abcdef0123456789"

parent_span_id:
  description: 父跨度ID
  type: string
  required: false
  example: "9876543210fedcba"

operation_name:
  description: 操作名称
  type: string
  required: true
  example: "ingress"

start_time:
  description: 开始时间
  type: string
  format: [%Y-%m-%dT%H:%M:%S.%fZ]
  required: true
  example: "2024-03-21T10:00:00.123Z"

end_time:
  description: 结束时间
  type: string
  format: [%Y-%m-%dT%H:%M:%S.%fZ]
  required: true
  example: "2024-03-21T10:00:00.234Z"

duration:
  description: 持续时间(ms)
  type: integer
  required: true
  example: 111

tags:
  description: 标签
  type: object
  required: false
  example:
    http.method: "GET"
    http.status_code: "200"

logs:
  description: 日志事件
  type: array
  required: false
  example:
    - timestamp: "2024-03-21T10:00:00.123Z"
      fields:
        event: "start"
    - timestamp: "2024-03-21T10:00:00.234Z"
      fields:
        event: "end"
```

## 三、日志格式

### 3.1 访问日志格式
1. 文本格式
```
[%START_TIME%] "%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%" %RESPONSE_CODE% %RESPONSE_FLAGS% %RESPONSE_CODE_DETAILS% %CONNECTION_TERMINATION_DETAILS% "%UPSTREAM_TRANSPORT_FAILURE_REASON%" %BYTES_RECEIVED% %BYTES_SENT% %DURATION% %RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)% "%REQ(X-FORWARDED-FOR)%" "%REQ(USER-AGENT)%" "%REQ(X-REQUEST-ID)%" "%REQ(:AUTHORITY)%" "%UPSTREAM_HOST%" "%UPSTREAM_CLUSTER%" "%UPSTREAM_LOCAL_ADDRESS%" "%DOWNSTREAM_LOCAL_ADDRESS%" "%DOWNSTREAM_REMOTE_ADDRESS%" "%REQ(X-ENVOY-ATTEMPT-COUNT)%"
```

2. JSON格式
```json
{
  "start_time": "%START_TIME%",
  "method": "%REQ(:METHOD)%",
  "path": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
  "protocol": "%PROTOCOL%",
  "response_code": "%RESPONSE_CODE%",
  "response_flags": "%RESPONSE_FLAGS%",
  "response_code_details": "%RESPONSE_CODE_DETAILS%",
  "connection_termination_details": "%CONNECTION_TERMINATION_DETAILS%",
  "upstream_transport_failure_reason": "%UPSTREAM_TRANSPORT_FAILURE_REASON%",
  "bytes_received": "%BYTES_RECEIVED%",
  "bytes_sent": "%BYTES_SENT%",
  "duration": "%DURATION%",
  "upstream_service_time": "%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%",
  "x_forwarded_for": "%REQ(X-FORWARDED-FOR)%",
  "user_agent": "%REQ(USER-AGENT)%",
  "request_id": "%REQ(X-REQUEST-ID)%",
  "authority": "%REQ(:AUTHORITY)%",
  "upstream_host": "%UPSTREAM_HOST%",
  "upstream_cluster": "%UPSTREAM_CLUSTER%",
  "upstream_local_address": "%UPSTREAM_LOCAL_ADDRESS%",
  "downstream_local_address": "%DOWNSTREAM_LOCAL_ADDRESS%",
  "downstream_remote_address": "%DOWNSTREAM_REMOTE_ADDRESS%",
  "attempt_count": "%REQ(X-ENVOY-ATTEMPT-COUNT)%"
}
```

### 3.2 追踪日志格式
```json
{
  "trace_id": "%TRACE_ID%",
  "span_id": "%SPAN_ID%",
  "parent_span_id": "%PARENT_SPAN_ID%",
  "operation_name": "%OPERATION_NAME%",
  "start_time": "%START_TIME%",
  "end_time": "%END_TIME%",
  "duration": "%DURATION%",
  "tags": {
    "http.method": "%REQ(:METHOD)%",
    "http.url": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
    "http.status_code": "%RESPONSE_CODE%"
  }
}
```

## 四、日志配置

### 4.1 访问日志配置
```yaml
static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 10000
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_http
          access_log:
          - name: envoy.access_loggers.file
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
              path: "/var/log/envoy/access.log"
              format: "[%START_TIME%] \"%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%\" %RESPONSE_CODE% %RESPONSE_FLAGS% %BYTES_RECEIVED% %BYTES_SENT% %DURATION% %RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)% \"%REQ(X-FORWARDED-FOR)%\" \"%REQ(USER-AGENT)%\" \"%REQ(X-REQUEST-ID)%\" \"%REQ(:AUTHORITY)%\" \"%UPSTREAM_HOST%\"\n"
          
          - name: envoy.access_loggers.file
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
              path: "/var/log/envoy/access.json.log"
              json_format:
                start_time: "%START_TIME%"
                method: "%REQ(:METHOD)%"
                path: "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%"
                protocol: "%PROTOCOL%"
                response_code: "%RESPONSE_CODE%"
                response_flags: "%RESPONSE_FLAGS%"
                bytes_received: "%BYTES_RECEIVED%"
                bytes_sent: "%BYTES_SENT%"
                duration: "%DURATION%"
                upstream_service_time: "%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%"
                x_forwarded_for: "%REQ(X-FORWARDED-FOR)%"
                user_agent: "%REQ(USER-AGENT)%"
                request_id: "%REQ(X-REQUEST-ID)%"
                authority: "%REQ(:AUTHORITY)%"
                upstream_host: "%UPSTREAM_HOST%"
```

### 4.2 追踪配置
```yaml
static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 10000
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          generate_request_id: true
          tracing:
            provider:
              name: envoy.tracers.zipkin
              typed_config:
                "@type": type.googleapis.com/envoy.config.trace.v3.ZipkinConfig
                collector_cluster: zipkin
                collector_endpoint: "/api/v2/spans"
                shared_span_context: true
            random_sampling:
              value: 100.0
```

### 4.3 日志轮转配置
```bash
# /etc/logrotate.d/envoy
/var/log/envoy/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 envoy envoy
    sharedscripts
    postrotate
        /bin/kill -USR1 $(cat /var/run/envoy.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
```

## 五、日志示例

### 5.1 访问日志示例
1. 文本格式
```
[2024-03-21T10:00:00.123Z] "GET /api/v1/users HTTP/1.1" 200 - - - "-" 1234 5678 125 123 "192.168.1.100" "Mozilla/5.0" "123e4567-e89b-12d3-a456-426614174000" "example.com" "10.0.0.1:8080" "service_cluster" "10.0.0.2:54321" "192.168.1.1:80" "192.168.1.100:54321" "1"
```

2. JSON格式
```json
{
  "start_time": "2024-03-21T10:00:00.123Z",
  "method": "GET",
  "path": "/api/v1/users",
  "protocol": "HTTP/1.1",
  "response_code": 200,
  "response_flags": "-",
  "bytes_received": 1234,
  "bytes_sent": 5678,
  "duration": 125,
  "upstream_service_time": 123,
  "x_forwarded_for": "192.168.1.100",
  "user_agent": "Mozilla/5.0",
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "authority": "example.com",
  "upstream_host": "10.0.0.1:8080",
  "upstream_cluster": "service_cluster",
  "upstream_local_address": "10.0.0.2:54321",
  "downstream_local_address": "192.168.1.1:80",
  "downstream_remote_address": "192.168.1.100:54321",
  "attempt_count": "1"
}
```

### 5.2 追踪日志示例
```json
{
  "trace_id": "123e4567-e89b-12d3-a456-426614174000",
  "span_id": "abcdef0123456789",
  "parent_span_id": "9876543210fedcba",
  "operation_name": "ingress",
  "start_time": "2024-03-21T10:00:00.123Z",
  "end_time": "2024-03-21T10:00:00.234Z",
  "duration": 111,
  "tags": {
    "http.method": "GET",
    "http.url": "/api/v1/users",
    "http.status_code": "200"
  },
  "logs": [
    {
      "timestamp": "2024-03-21T10:00:00.123Z",
      "fields": {
        "event": "start"
      }
    },
    {
      "timestamp": "2024-03-21T10:00:00.234Z",
      "fields": {
        "event": "end"
      }
    }
  ]
}
```

## 六、最佳实践

### 6.1 日志配置最佳实践
1. 日志格式选择
   - 使用JSON格式便于解析
   - 记录必要的字段信息
   - 避免重复记录
   - 考虑磁盘空间使用

2. 日志内容优化
   - 记录关键请求信息
   - 包含追踪标识
   - 记录上下游信息
   - 注意敏感信息保护

3. 性能优化
   - 使用异步日志
   - 启用日志缓冲
   - 合理设置采样率
   - 定期清理日志

4. 安全考虑
   - 限制日志访问权限
   - 加密敏感信息
   - 定期备份日志
   - 监控异常访问

### 6.2 追踪最佳实践
1. 采样策略
   - 根据流量设置采样率
   - 关键请求全采样
   - 错误请求全采样
   - 定期调整采样率

2. 标签管理
   - 定义统一的标签
   - 记录关键信息
   - 避免冗余标签
   - 控制标签数量

3. 性能优化
   - 合理设置缓冲区
   - 异步发送追踪数据
   - 控制追踪数据大小
   - 监控追踪系统负载

### 6.3 监控告警最佳实践
1. 错误监控
   - 监控错误率
   - 监控响应码
   - 监控超时请求
   - 监控重试次数

2. 性能监控
   - 监控响应时间
   - 监控并发连接
   - 监控资源使用
   - 监控队列长度

3. 容量监控
   - 监控日志大小
   - 监控磁盘使用
   - 监控网络流量
   - 监控系统负载

## 七、监控告警

### 7.1 监控指标
1. 基础指标
   - 请求数量
   - 错误率
   - 响应时间
   - 并发连接数

2. 性能指标
   - CPU使用率
   - 内存使用率
   - 磁盘IO
   - 网络流量

3. 追踪指标
   - 采样率
   - 追踪成功率
   - 追踪延迟
   - 追踪数据大小

### 7.2 告警规则
1. 错误告警
```yaml
- alert: EnvoyHighError5xxRate
  expr: sum(rate(envoy_cluster_upstream_rq_xx{response_code_class="5"}[5m])) / sum(rate(envoy_cluster_upstream_rq_total[5m])) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: High HTTP 5xx error rate
    description: More than 5% of all requests are resulting in 5xx errors

- alert: EnvoyHighError4xxRate
  expr: sum(rate(envoy_cluster_upstream_rq_xx{response_code_class="4"}[5m])) / sum(rate(envoy_cluster_upstream_rq_total[5m])) > 0.20
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High HTTP 4xx error rate
    description: More than 20% of all requests are resulting in 4xx errors
```

2. 性能告警
```yaml
- alert: EnvoyHighResponseTime
  expr: histogram_quantile(0.95, sum(rate(envoy_cluster_upstream_rq_time_bucket[5m])) by (le)) > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High response time
    description: 95th percentile of response time is above 1 second

- alert: EnvoyHighRetryRate
  expr: sum(rate(envoy_cluster_upstream_rq_retry[5m])) / sum(rate(envoy_cluster_upstream_rq[5m])) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High retry rate
    description: More than 10% of requests are being retried
```

3. 资源告警
```yaml
- alert: EnvoyHighMemoryUsage
  expr: process_resident_memory_bytes{job="envoy"} / process_resident_memory_bytes{job="envoy"}[5m] offset 5m > 0.9
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High memory usage
    description: Envoy memory usage has increased by more than 90% in the last 5 minutes
```

## 八、故障排查

### 8.1 常见问题
1. 连接问题
   - 连接超时
   - 连接重置
   - TLS错误
   - 路由错误

2. 性能问题
   - 响应延迟
   - 内存泄漏
   - CPU过高
   - 队列积压

3. 配置问题
   - 配置错误
   - 路由冲突
   - 证书问题
   - 限流设置

### 8.2 排查方法
1. 日志分析
   - 查看访问日志
   - 分析追踪数据
   - 检查错误日志
   - 分析监控指标

2. 配置检查
   - 验证配置文件
   - 检查路由规则
   - 确认监听器
   - 测试后端服务

3. 性能分析
   - 监控资源使用
   - 分析请求延迟
   - 检查连接数
   - 查看队列状态

### 8.3 解决方案
1. 连接问题
   - 调整超时设置
   - 修复TLS配置
   - 更新路由规则
   - 检查网络连接

2. 性能问题
   - 优化配置参数
   - 增加资源配额
   - 启用缓存
   - 实施限流

3. 配置问题
   - 修正配置错误
   - 解决路由冲突
   - 更新证书
   - 调整限流策略

## 相关文档
- [HAProxy日志规范](31_HAProxy日志规范.md)
- [Nginx日志规范](11_Nginx日志规范.md)
- [日志收集方案](../02_日志收集方案.md)
- [日志分析工具](../03_日志分析工具.md)

## 更新记录
- 2024-03-21: 创建Envoy日志规范文档 