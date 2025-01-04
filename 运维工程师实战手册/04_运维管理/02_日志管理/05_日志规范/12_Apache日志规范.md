# Apache日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、概述
本文档规定了Apache HTTP Server的日志规范要求,包括访问日志、错误日志、模块日志等的格式规范、配置方法和最佳实践。

## 二、日志分类及字段说明

### 2.1 访问日志字段
```yaml
time:
  description: 请求时间
  type: string
  format: [%d/%b/%Y:%H:%M:%S %z]
  required: true
  example: "21/Mar/2024:10:00:00 +0800"

remote_host:
  description: 客户端主机名或IP地址
  type: string
  required: true
  example: "192.168.1.100"

remote_logname:
  description: 远程登录名
  type: string
  required: false
  example: "-"

remote_user:
  description: 远程用户名
  type: string
  required: false
  example: "john"

request_line:
  description: 请求行
  type: string
  required: true
  example: "GET /index.html HTTP/1.1"

status:
  description: HTTP状态码
  type: integer
  required: true
  example: 200

bytes_sent:
  description: 发送的字节数
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

request_time:
  description: 请求处理时间(微秒)
  type: integer
  required: false
  example: 123456

server_name:
  description: 服务器名称
  type: string
  required: false
  example: "www.example.com"

server_port:
  description: 服务器端口
  type: integer
  required: false
  example: 80

remote_port:
  description: 客户端端口
  type: integer
  required: false
  example: 54321

request_protocol:
  description: 请求协议
  type: string
  required: false
  example: "HTTP/1.1"

request_method:
  description: 请求方法
  type: string
  required: false
  example: "GET"

request_uri:
  description: 请求URI
  type: string
  required: false
  example: "/index.html"

query_string:
  description: 查询字符串
  type: string
  required: false
  example: "id=1&name=test"

ssl_protocol:
  description: SSL协议版本
  type: string
  required: false
  example: "TLSv1.2"

ssl_cipher:
  description: SSL加密套件
  type: string
  required: false
  example: "ECDHE-RSA-AES256-GCM-SHA384"

connection_status:
  description: 连接状态
  type: string
  required: false
  example: "X" # X=连接终止前中止,+=保持连接,空=关闭连接
```

### 2.2 错误日志字段
```yaml
time:
  description: 错误发生时间
  type: string
  format: [%a %b %d %H:%M:%S %Y]
  required: true
  example: "Thu Mar 21 10:00:00 2024"

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

client:
  description: 客户端地址
  type: string
  required: false
  example: "192.168.1.100"

module:
  description: 模块名称
  type: string
  required: false
  example: "core"

message:
  description: 错误消息
  type: string
  required: true
  example: "File does not exist: /var/www/html/favicon.ico"
```

## 三、日志格式

### 3.1 访问日志格式
1. 通用格式(Common Log Format)
```apache
LogFormat "%h %l %u %t \"%r\" %>s %b" common
```

2. 组合格式(Combined Log Format)
```apache
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
```

3. 扩展格式(Extended Log Format)
```apache
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\" %D %v %p %{remote}p \"%{Host}i\" %P %T %k" extended
```

4. JSON格式
```apache
LogFormat "{ \"time\": \"%t\", \"remote_host\": \"%h\", \"remote_logname\": \"%l\", \"remote_user\": \"%u\", \"request\": \"%r\", \"status\": %>s, \"bytes_sent\": %b, \"referer\": \"%{Referer}i\", \"user_agent\": \"%{User-Agent}i\", \"request_time\": %D, \"server_name\": \"%v\", \"server_port\": %p }" json
```

### 3.2 错误日志格式
```
[%t] [%l] [pid %P:tid %T] [client %a] %F: %E: [%m] %M
```

## 四、日志配置

### 4.1 访问日志配置
```apache
# httpd.conf

# 定义日志格式
LogFormat "%h %l %u %t \"%r\" %>s %b" common
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\" %D %v %p %{remote}p" extended
LogFormat "{ \"time\": \"%t\", \"remote_host\": \"%h\" }" json

# 全局访问日志
CustomLog "/var/log/apache2/access.log" combined
CustomLog "/var/log/apache2/access.json.log" json

# 虚拟主机配置
<VirtualHost *:80>
    ServerName example.com
    CustomLog "/var/log/apache2/example.com-access.log" combined
    CustomLog "/var/log/apache2/example.com-access.json.log" json

    # 特定目录配置
    <Directory "/var/www/html/api">
        CustomLog "/var/log/apache2/example.com-api-access.log" extended
    </Directory>

    # 条件日志
    SetEnvIf Request_URI "^/health$" dontlog
    CustomLog "/var/log/apache2/example.com-filtered-access.log" combined env=!dontlog
</VirtualHost>
```

### 4.2 错误日志配置
```apache
# httpd.conf

# 全局错误日志
ErrorLog "/var/log/apache2/error.log"
LogLevel warn

# 虚拟主机错误日志
<VirtualHost *:80>
    ServerName example.com
    ErrorLog "/var/log/apache2/example.com-error.log"
    LogLevel warn

    # 模块日志级别
    LogLevel info mod_rewrite:trace3
    LogLevel debug ssl:warn
</VirtualHost>
```

### 4.3 日志轮转配置
1. logrotate配置
```bash
# /etc/logrotate.d/apache2
/var/log/apache2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 www-data adm
    sharedscripts
    postrotate
        if /etc/init.d/apache2 status > /dev/null ; then
            /etc/init.d/apache2 reload > /dev/null
        fi
    endscript
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then
            run-parts /etc/logrotate.d/httpd-prerotate
        fi
    endscript
}
```

2. 自动清理脚本
```bash
#!/bin/bash
# /usr/local/sbin/apache-log-cleanup.sh

# 日志目录
LOG_PATH="/var/log/apache2"
# 备份目录
BACKUP_PATH="/data/backup/apache2/logs"
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

# 重新加载Apache使其重新打开日志文件
/etc/init.d/apache2 reload

# 删除过期日志
find ${BACKUP_PATH} -type d -mtime +${SAVE_DAYS} -exec rm -rf {} \;
```

3. 定时任务配置
```bash
# crontab -e
0 0 * * * /usr/local/sbin/apache-log-cleanup.sh
```

## 五、日志示例

### 5.1 访问日志示例
1. 通用格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234
```

2. 组合格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"
```

3. 扩展格式
```
192.168.1.100 - john [21/Mar/2024:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0" 123456 www.example.com 80 54321
```

4. JSON格式
```json
{
    "time": "[21/Mar/2024:10:00:00 +0800]",
    "remote_host": "192.168.1.100",
    "remote_logname": "-",
    "remote_user": "john",
    "request": "GET /index.html HTTP/1.1",
    "status": 200,
    "bytes_sent": 1234,
    "referer": "https://example.com",
    "user_agent": "Mozilla/5.0",
    "request_time": 123456,
    "server_name": "www.example.com",
    "server_port": 80
}
```

### 5.2 错误日志示例
```
[Thu Mar 21 10:00:00 2024] [error] [pid 1234:tid 5678] [client 192.168.1.100] File does not exist: /var/www/html/favicon.ico
[Thu Mar 21 10:00:01 2024] [warn] [pid 1234:tid 5678] [client 192.168.1.100] mod_rewrite: maximum number of internal redirects reached
```

## 六、最佳实践

### 6.1 访问日志最佳实践
1. 日志格式选择
   - 使用JSON格式便于解析
   - 记录必要的字段信息
   - 避免重复记录
   - 考虑磁盘空间使用

2. 日志配置优化
   - 按虚拟主机分开记录
   - 使用条件日志过滤
   - 配置缓冲写入
   - 定期轮转和清理

3. 性能优化
   - 使用异步日志模块
   - 合理设置缓冲大小
   - 避免过多的日志写入
   - 使用管道日志程序

4. 安全考虑
   - 限制日志访问权限
   - 保护敏感信息
   - 定期备份日志
   - 监控异常访问

### 6.2 错误日志最佳实践
1. 日志级别设置
   - 生产环境使用warn级别
   - 开发环境可用debug级别
   - 按模块设置不同级别
   - 定期检查错误日志

2. 日志内容优化
   - 记录完整错误信息
   - 包含上下文信息
   - 便于问题定位
   - 关注重要错误

3. 日志管理
   - 定期清理旧日志
   - 实施日志轮转
   - 监控日志大小
   - 备份重要日志

4. 问题诊断
   - 设置适当的日志级别
   - 使用rewrite日志
   - 配置ssl日志
   - 记录mod_security日志

## 七、监控告警

### 7.1 监控指标
1. 基础指标
   - 请求数量
   - 错误率
   - 响应时间
   - 并发连接数

2. 错误指标
   - 404错误数
   - 500错误数
   - 超时错误数
   - 拒绝连接数

3. 性能指标
   - CPU使用率
   - 内存使用率
   - 磁盘IO
   - 网络流量

### 7.2 告警规则
1. 错误告警
```yaml
- alert: ApacheHighError5xxRate
  expr: sum(rate(apache_http_requests_total{status=~"5.."}[5m])) / sum(rate(apache_http_requests_total[5m])) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: High HTTP 5xx error rate
    description: More than 5% of all requests are resulting in 5xx errors

- alert: ApacheHighError4xxRate
  expr: sum(rate(apache_http_requests_total{status=~"4.."}[5m])) / sum(rate(apache_http_requests_total[5m])) > 0.20
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High HTTP 4xx error rate
    description: More than 20% of all requests are resulting in 4xx errors
```

2. 性能告警
```yaml
- alert: ApacheHighResponseTime
  expr: apache_http_request_duration_seconds{quantile="0.9"} > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High response time
    description: 90th percentile of response time is above 1 second

- alert: ApacheHighLoad
  expr: apache_cpuload > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High CPU load
    description: Apache CPU load is above 80%
```

3. 日志告警
```yaml
- alert: ApacheLogSize
  expr: node_filesystem_avail_bytes{mountpoint="/var/log/apache2"} / node_filesystem_size_bytes{mountpoint="/var/log/apache2"} * 100 < 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: Apache log directory space low
    description: Less than 10% disk space available for Apache logs
```

## 八、故障排查

### 8.1 常见问题
1. 访问日志问题
   - 日志不写入
   - 日志格式错误
   - 日志权限问题
   - 磁盘空间不足

2. 错误日志问题
   - 日志级别不当
   - 错误信息不完整
   - 日志文件损坏
   - 日志写入失败

3. 性能问题
   - 日志写入延迟
   - 日志量过大
   - IO瓶颈
   - 内存占用高

### 8.2 排查方法
1. 日志检查
   - 查看日志内容
   - 检查日志权限
   - 验证日志格式
   - 分析错误信息

2. 配置检查
   - 检查配置文件
   - 验证语法正确
   - 确认日志路径
   - 检查模块配置

3. 系统检查
   - 检查磁盘空间
   - 监控系统负载
   - 查看进程状态
   - 分析资源使用

### 8.3 解决方案
1. 日志问题
   - 调整日志级别
   - 修正配置错误
   - 清理过期日志
   - 修复权限问题

2. 性能问题
   - 优化日志配置
   - 启用异步写入
   - 增加缓冲大小
   - 实施日志轮转

3. 系统问题
   - 扩展磁盘空间
   - 优化系统配置
   - 升级硬件资源
   - 实施负载均衡

## 相关文档
- [Nginx日志规范](11_Nginx日志规范.md)
- [Tomcat日志规范](13_Tomcat日志规范.md)
- [日志收集方案](../02_日志收集方案.md)
- [日志分析工具](../03_日志分析工具.md)

## 更新记录
- 2024-03-21: 创建Apache日志规范文档 