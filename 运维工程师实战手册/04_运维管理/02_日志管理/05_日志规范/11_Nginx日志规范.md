# Nginx日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、概述
本文档规定了Nginx服务器的访问日志和错误日志的规范要求,包括日志格式、字段说明、配置方法等。

## 二、日志分类及字段说明

### 2.1 访问日志字段
```yaml
time_local:
  description: 本地时间
  type: string
  format: dd/MMM/yyyy:HH:mm:ss Z
  required: true
  example: "21/Mar/2024:10:00:00 +0800"

time_iso8601:
  description: ISO 8601格式时间
  type: string
  format: ISO-8601
  required: false
  example: "2024-03-21T10:00:00+08:00"

remote_addr:
  description: 客户端IP地址
  type: string
  required: true
  example: "192.168.1.100"

http_x_forwarded_for:
  description: 代理链上的客户端IP地址列表
  type: string
  required: false
  example: "10.0.0.1, 10.0.0.2"

http_x_real_ip:
  description: 真实客户端IP地址
  type: string
  required: false
  example: "10.0.0.1"

remote_user:
  description: HTTP基础认证用户名
  type: string
  required: false
  example: "john"

request:
  description: 完整的原始请求行
  type: string
  required: true
  example: "GET /api/users HTTP/1.1"

request_method:
  description: HTTP请求方法
  type: string
  required: true
  enum: [GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH]
  example: "GET"

request_uri:
  description: 请求URI(包含参数)
  type: string
  required: true
  example: "/api/users?id=1"

uri:
  description: 请求URI(不包含参数)
  type: string
  required: true
  example: "/api/users"

query_string:
  description: 请求参数
  type: string
  required: false
  example: "id=1&name=test"

server_protocol:
  description: 服务器协议版本
  type: string
  required: true
  example: "HTTP/1.1"

status:
  description: HTTP响应状态码
  type: integer
  required: true
  example: 200

body_bytes_sent:
  description: 发送给客户端的字节数
  type: integer
  required: true
  example: 1234

request_length:
  description: 请求的字节数
  type: integer
  required: true
  example: 567

http_referer:
  description: 请求来源页面
  type: string
  required: false
  example: "https://example.com/page"

http_user_agent:
  description: 用户代理标识
  type: string
  required: false
  example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

http_host:
  description: 请求的主机名
  type: string
  required: true
  example: "api.example.com"

server_name:
  description: 匹配上的服务器名
  type: string
  required: true
  example: "api.example.com"

request_time:
  description: 请求处理时间(秒)
  type: float
  required: true
  example: 0.123

upstream_response_time:
  description: 上游服务器响应时间(秒)
  type: float
  required: false
  example: 0.100

upstream_addr:
  description: 上游服务器地址
  type: string
  required: false
  example: "10.0.0.10:8080"

upstream_status:
  description: 上游服务器响应状态码
  type: integer
  required: false
  example: 200

ssl_protocol:
  description: SSL协议版本
  type: string
  required: false
  example: "TLSv1.2"

ssl_cipher:
  description: SSL加密算法
  type: string
  required: false
  example: "ECDHE-RSA-AES256-GCM-SHA384"

gzip_ratio:
  description: Gzip压缩比率
  type: float
  required: false
  example: 2.5
```

### 2.2 错误日志字段
```yaml
time:
  description: 错误发生时间
  type: string
  format: yyyy/MM/dd HH:mm:ss
  required: true
  example: "2024/03/21 10:00:00"

level:
  description: 错误级别
  type: string
  required: true
  enum: [emerg, alert, crit, error, warn, notice, info, debug]
  example: "error"

pid:
  description: 进程ID
  type: integer
  required: true
  example: 1234

tid:
  description: 线程ID
  type: integer
  required: true
  example: 5678

connection:
  description: 连接ID
  type: integer
  required: true
  example: 9012

message:
  description: 错误消息
  type: string
  required: true
  example: "upstream timed out"

client:
  description: 客户端信息
  type: string
  required: false
  example: "192.168.1.100"

server:
  description: 服务器信息
  type: string
  required: false
  example: "example.com"

request:
  description: 请求信息
  type: string
  required: false
  example: "GET /api/users HTTP/1.1"

upstream:
  description: 上游服务器信息
  type: string
  required: false
  example: "upstream_server:8080"

host:
  description: 主机名
  type: string
  required: false
  example: "api.example.com"
```

## 三、日志格式

### 3.1 访问日志格式
```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

log_format detailed '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time $pipe '
                    '$upstream_addr $upstream_status $request_length '
                    '$upstream_cache_status $upstream_http_content_type';

log_format json_combined escape=json '{'
    '"time_local":"$time_local",'
    '"remote_addr":"$remote_addr",'
    '"remote_user":"$remote_user",'
    '"request":"$request",'
    '"status": "$status",'
    '"body_bytes_sent":"$body_bytes_sent",'
    '"request_time":"$request_time",'
    '"http_referrer":"$http_referer",'
    '"http_user_agent":"$http_user_agent",'
    '"http_x_forwarded_for":"$http_x_forwarded_for",'
    '"http_host":"$http_host",'
    '"server_name":"$server_name",'
    '"request_uri":"$request_uri",'
    '"upstream_addr":"$upstream_addr",'
    '"upstream_status":"$upstream_status",'
    '"upstream_response_time":"$upstream_response_time"'
    '}';
```

### 3.2 错误日志格式
```
yyyy/MM/dd HH:mm:ss [level] pid#tid: *connection message, client: client_ip, server: server_name, request: "request_line", upstream: "upstream_address", host: "hostname"
```

## 四、日志配置

### 4.1 访问日志配置
```nginx
# nginx.conf
http {
    # 定义日志格式
    log_format main '...';
    log_format detailed '...';
    log_format json_combined escape=json '{...}';

    # 默认访问日志配置
    access_log /var/log/nginx/access.log main;
    access_log /var/log/nginx/access.json.log json_combined;

    # 特定虚拟主机配置
    server {
        listen 80;
        server_name example.com;
        
        # 虚拟主机访问日志
        access_log /var/log/nginx/example.com.access.log detailed;
        access_log /var/log/nginx/example.com.access.json.log json_combined;

        # 特定location的访问日志
        location /api/ {
            access_log /var/log/nginx/example.com.api.access.log detailed;
        }

        # 禁用特定location的访问日志
        location /health {
            access_log off;
        }
    }
}
```

### 4.2 错误日志配置
```nginx
# nginx.conf

# 主错误日志
error_log /var/log/nginx/error.log error;

http {
    # HTTP模块错误日志
    error_log /var/log/nginx/http.error.log error;

    server {
        # 虚拟主机错误日志
        error_log /var/log/nginx/example.com.error.log error;
    }
}
```

## 五、日志示例

### 5.1 访问日志示例
1. 标准格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0" "-"
```

2. 详细格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0" "-" 0.123 0.100 . 10.0.0.10:8080 200 567 - application/json
```

3. JSON格式
```json
{
    "time_local": "21/Mar/2024:10:00:00 +0800",
    "remote_addr": "192.168.1.100",
    "remote_user": "john",
    "request": "GET /api/users HTTP/1.1",
    "status": "200",
    "body_bytes_sent": "1234",
    "request_time": "0.123",
    "http_referrer": "https://example.com",
    "http_user_agent": "Mozilla/5.0",
    "http_x_forwarded_for": "-",
    "http_host": "api.example.com",
    "server_name": "api.example.com",
    "request_uri": "/api/users",
    "upstream_addr": "10.0.0.10:8080",
    "upstream_status": "200",
    "upstream_response_time": "0.100"
}
```

### 5.2 错误日志示例
```
2024/03/21 10:00:00 [error] 1234#5678: *9012 upstream timed out, client: 192.168.1.100, server: example.com, request: "GET /api/users HTTP/1.1", upstream: "http://10.0.0.10:8080/users", host: "api.example.com"
2024/03/21 10:00:01 [warn] 1234#5678: *9013 open() "/usr/share/nginx/html/favicon.ico" failed (2: No such file or directory), client: 192.168.1.101, server: example.com, request: "GET /favicon.ico HTTP/1.1", host: "www.example.com"
```

## 六、最佳实践

### 6.1 访问日志最佳实践
1. 使用JSON格式便于解析
2. 记录足够的字段信息
3. 配置日志轮转
4. 对无用请求禁用日志
5. 使用缓冲写入
6. 定期归档和压缩

### 6.2 错误日志最佳实践
1. 设置合适的日志级别
2. 记录详细的错误信息
3. 配置日志轮转
4. 定期检查错误日志
5. 设置告警阈值
6. 及时处理错误

### 6.3 日志轮转配置
1. 使用logrotate配置
```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily                   # 每天轮转
    missingok              # 如果日志文件不存在,不报错
    rotate 30              # 保留30天的日志
    compress               # 压缩轮转后的日志
    delaycompress          # 延迟压缩,下次轮转时压缩
    notifempty            # 日志为空时不轮转
    create 0640 nginx adm  # 创建新日志文件的权限
    sharedscripts         # 所有日志共用一个脚本
    postrotate            # 轮转后执行的脚本
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

2. 自动轮转脚本
```bash
#!/bin/bash
# /usr/local/sbin/nginx-log-rotate.sh

# 日志目录
LOG_PATH="/var/log/nginx"
# 备份目录
BACKUP_PATH="/data/backup/nginx/logs"
# 日志保留天数
SAVE_DAYS=30
# 时间戳
YESTERDAY=$(date -d "yesterday" +%Y%m%d)

# 创建备份目录
mkdir -p ${BACKUP_PATH}/${YESTERDAY}

# 移动并压缩日志
cd ${LOG_PATH}
for log_file in *.log; do
    if [ -f ${log_file} ]; then
        mv ${log_file} ${BACKUP_PATH}/${YESTERDAY}/${log_file}.${YESTERDAY}
        gzip ${BACKUP_PATH}/${YESTERDAY}/${log_file}.${YESTERDAY}
    fi
done

# 向Nginx发送USR1信号,重新打开日志文件
kill -USR1 $(cat /var/run/nginx.pid)

# 删除过期日志
find ${BACKUP_PATH} -type d -mtime +${SAVE_DAYS} -exec rm -rf {} \;
```

3. 配置定时任务
```bash
# crontab -e
0 0 * * * /usr/local/sbin/nginx-log-rotate.sh
```

4. 日志轮转监控
```yaml
- alert: NginxLogRotateFailed
  expr: nginx_log_rotate_status != 0
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: Nginx log rotation failed
    description: Nginx log rotation has failed on {{ $labels.instance }}

- alert: NginxLogBackupSpace
  expr: node_filesystem_avail_bytes{mountpoint="/data/backup/nginx"} / node_filesystem_size_bytes{mountpoint="/data/backup/nginx"} * 100 < 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Nginx log backup space low
    description: Less than 10% disk space available for Nginx log backups
```

## 七、监控告警

### 7.1 需要监控的指标
1. HTTP状态码分布
2. 请求响应时间
3. 错误日志数量
4. 日志文件大小
5. 磁盘使用情况

### 7.2 告警规则
1. HTTP 5xx错误
```yaml
- alert: NginxHighError5xxRate
  expr: sum(rate(nginx_http_requests_total{status=~"5.."}[5m])) / sum(rate(nginx_http_requests_total[5m])) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: High HTTP 5xx error rate
    description: More than 5% of all requests are resulting in 5xx errors
```

2. 响应时间过高
```yaml
- alert: NginxHighResponseTime
  expr: histogram_quantile(0.95, sum(rate(nginx_http_request_duration_seconds_bucket[5m])) by (le)) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High response time
    description: 95th percentile of response time is above 1 second
```

3. 错误日志数量激增
```yaml
- alert: NginxErrorLogSpike
  expr: rate(nginx_error_log_total[5m]) > 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Nginx error log spike
    description: Error log entries are being generated at a high rate
```

4. 磁盘空间不足
```yaml
- alert: NginxLogsDiskSpace
  expr: node_filesystem_avail_bytes{mountpoint="/var/log/nginx"} / node_filesystem_size_bytes{mountpoint="/var/log/nginx"} * 100 < 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Nginx logs disk space low
    description: Less than 10% disk space available for Nginx logs
``` 