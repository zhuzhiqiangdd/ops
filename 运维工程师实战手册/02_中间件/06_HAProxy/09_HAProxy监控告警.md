# HAProxy监控告警

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、监控指标

### 1.1 基础指标
1. 系统指标
```plaintext
# 系统级别指标
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- 进程状态
```

2. HAProxy进程指标
```plaintext
# 进程指标
- 进程数量
- 进程CPU使用率
- 进程内存使用率
- 进程文件描述符数量
- 进程运行时间
```

### 1.2 性能指标
1. 连接指标
```plaintext
# 连接统计
- 当前连接数
- 每秒新建连接数
- 最大连接数
- 排队连接数
- 连接错误数
```

2. 会话指标
```plaintext
# 会话统计
- 当前会话数
- 每秒新建会话数
- 会话重用率
- 会话超时数
- SSL会话数
```

3. 请求指标
```plaintext
# 请求统计
- 每秒请求数(QPS)
- 请求延迟
- 请求错误数
- 请求拒绝数
- 请求重试数
```

### 1.3 后端指标
1. 服务器状态
```plaintext
# 后端服务器状态
- UP状态服务器数
- DOWN状态服务器数
- 维护状态服务器数
- 健康检查失败次数
- 服务器响应时间
```

2. 负载均衡指标
```plaintext
# 负载均衡统计
- 后端连接数分布
- 后端响应时间分布
- 后端错误率分布
- 会话保持命中率
- 重试请求分布
```

## 二、监控方案

### 2.1 Stats监控
1. Stats配置
```haproxy
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats auth admin:password
    stats admin if TRUE
    
    # 访问控制
    acl internal_net src 192.168.0.0/16
    http-request deny if !internal_net
```

2. Stats指标
```plaintext
# 可用指标
- pxname: 代理名称
- svname: 服务名称
- qcur: 当前队列请求数
- qmax: 最大队列请求数
- scur: 当前会话数
- smax: 最大会话数
- slim: 会话限制数
- stot: 总会话数
- bin: 收到的字节数
- bout: 发送的字节数
- dreq: 请求拒绝数
- dresp: 响应拒绝数
- ereq: 请求错误数
- econ: 连接错误数
- eresp: 响应错误数
- status: 后端状态
```

### 2.2 Prometheus监控
1. Exporter配置
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'haproxy'
    static_configs:
      - targets: ['haproxy:9101']
    metrics_path: '/metrics'
    scheme: 'http'
```

2. 告警规则
```yaml
# haproxy_alerts.yml
groups:
- name: haproxy_alerts
  rules:
  # 实例存活告警
  - alert: HAProxyDown
    expr: up{job="haproxy"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "HAProxy实例宕机"
      description: "HAProxy实例{{ $labels.instance }}已停止运行"

  # 后端服务器告警
  - alert: HAProxyBackendDown
    expr: haproxy_backend_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "HAProxy后端服务器宕机"
      description: "后端服务器{{ $labels.backend }}已宕机"

  # 连接数告警
  - alert: HAProxyHighConnections
    expr: haproxy_frontend_current_sessions / haproxy_frontend_limit_sessions > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "HAProxy连接数过高"
      description: "前端{{ $labels.frontend }}连接数超过80%"

  # 响应时间告警
  - alert: HAProxySlowResponse
    expr: haproxy_backend_response_time_average_seconds > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "HAProxy响应时间过长"
      description: "后端{{ $labels.backend }}平均响应时间超过1秒"

  # 错误率告警
  - alert: HAProxyHighErrorRate
    expr: rate(haproxy_backend_response_errors_total[5m]) / rate(haproxy_backend_responses_total[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "HAProxy错误率过高"
      description: "后端{{ $labels.backend }}错误率超过5%"
```

### 2.3 Grafana监控
1. 仪表盘配置
```json
{
  "dashboard": {
    "title": "HAProxy监控面板",
    "panels": [
      {
        "title": "连接状态",
        "type": "graph",
        "targets": [
          {
            "expr": "haproxy_frontend_current_sessions",
            "legendFormat": "{{frontend}}"
          }
        ]
      },
      {
        "title": "后端状态",
        "type": "graph",
        "targets": [
          {
            "expr": "haproxy_backend_up",
            "legendFormat": "{{backend}}"
          }
        ]
      },
      {
        "title": "请求统计",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(haproxy_frontend_requests_total[5m])",
            "legendFormat": "{{frontend}}"
          }
        ]
      }
    ]
  }
}
```

2. 告警通知
```yaml
# alertmanager.yml
receivers:
- name: 'ops-team'
  email_configs:
  - to: 'ops@example.com'
    send_resolved: true
  webhook_configs:
  - url: 'http://alert-gateway:8080/notify'
    send_resolved: true

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'ops-team'
```

## 三、日志监控

### 3.1 日志配置
1. rsyslog配置
```conf
# /etc/rsyslog.d/haproxy.conf
local0.* /var/log/haproxy/haproxy.log
local1.* /var/log/haproxy/admin.log

# 日志轮转
$template HAProxyDateFormat,"/var/log/haproxy/%$YEAR%/%$MONTH%/%$DAY%/haproxy.log"
local0.* ?HAProxyDateFormat
```

2. logrotate配置
```conf
# /etc/logrotate.d/haproxy
/var/log/haproxy/*.log {
    daily
    rotate 30
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /bin/kill -HUP `cat /var/run/syslogd.pid 2> /dev/null` 2> /dev/null || true
    endscript
}
```

### 3.2 日志分析
1. 日志格式
```haproxy
# 自定义日志格式
log-format "%ci:%cp [%tr] %ft %b/%s %TR/%Tw/%Tc/%Tr/%Ta %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r"

# 字段说明
%ci: 客户端IP
%cp: 客户端端口
%tr: 请求处理时间
%ft: 前端名称
%b: 后端名称
%s: 服务器名称
%TR: 总请求时间
%Tw: 排队等待时间
%Tc: 连接建立时间
%Tr: 服务器响应时间
%Ta: 活动时间
%ST: 状态码
%B: 字节数
%CC: 客户端连接数
%CS: 服务器连接数
%tsc: 终止状态码
%ac: 活动连接数
%fc: 前端连接数
%bc: 后端连接数
%sc: 服务器连接数
%rc: 重试次数
%sq: 服务器队列数
%bq: 后端队列数
%hr: HTTP请求
%hs: HTTP状态码
%r: 完整HTTP请求
```

2. 日志解析脚本
```python
#!/usr/bin/env python3
import re
import json
from datetime import datetime

def parse_haproxy_log(log_line):
    # 日志解析正则
    pattern = r'(?P<client_ip>[\d.]+):(?P<client_port>\d+) \[(?P<time>[^\]]+)\] (?P<frontend>[^ ]+) (?P<backend>[^/]+)/(?P<server>[^ ]+) (?P<tr>[^/]+)/(?P<tw>[^/]+)/(?P<tc>[^/]+)/(?P<tr2>[^/]+)/(?P<ta>[^ ]+) (?P<status>\d+) (?P<bytes>\d+) (?P<cc>[^ ]+) (?P<cs>[^ ]+) (?P<tsc>[^ ]+) (?P<ac>[^/]+)/(?P<fc>[^/]+)/(?P<bc>[^/]+)/(?P<sc>[^/]+)/(?P<rc>[^ ]+) (?P<sq>[^/]+)/(?P<bq>[^ ]+) (?P<hr>[^ ]+) (?P<hs>[^ ]+) (?P<request>.+)'
    
    match = re.match(pattern, log_line)
    if match:
        return match.groupdict()
    return None

def analyze_logs(log_file):
    stats = {
        'total_requests': 0,
        'status_codes': {},
        'response_times': [],
        'errors': [],
        'top_ips': {}
    }
    
    with open(log_file, 'r') as f:
        for line in f:
            log_data = parse_haproxy_log(line)
            if log_data:
                stats['total_requests'] += 1
                
                # 状态码统计
                status = log_data['status']
                stats['status_codes'][status] = stats['status_codes'].get(status, 0) + 1
                
                # 响应时间统计
                tr = float(log_data['tr'])
                stats['response_times'].append(tr)
                
                # 错误统计
                if int(status) >= 400:
                    stats['errors'].append({
                        'time': log_data['time'],
                        'status': status,
                        'request': log_data['request']
                    })
                
                # IP统计
                client_ip = log_data['client_ip']
                stats['top_ips'][client_ip] = stats['top_ips'].get(client_ip, 0) + 1
    
    return stats

def generate_report(stats):
    report = {
        'summary': {
            'total_requests': stats['total_requests'],
            'avg_response_time': sum(stats['response_times']) / len(stats['response_times']),
            'error_rate': len(stats['errors']) / stats['total_requests'] * 100
        },
        'status_distribution': stats['status_codes'],
        'top_10_ips': dict(sorted(stats['top_ips'].items(), key=lambda x: x[1], reverse=True)[:10]),
        'recent_errors': stats['errors'][-10:]
    }
    
    return json.dumps(report, indent=2)

if __name__ == '__main__':
    log_file = '/var/log/haproxy/haproxy.log'
    stats = analyze_logs(log_file)
    report = generate_report(stats)
    print(report)
```

## 四、告警处理

### 4.1 告警级别
1. 告警定义
```yaml
# 告警级别定义
告警级别:
  critical:
    描述: 严重告警,需要立即处理
    处理时间: 15分钟内
    通知方式: 电话+短信+邮件
    升级策略: 15分钟未处理自动升级

  warning:
    描述: 警告告警,需要及时处理
    处理时间: 30分钟内
    通知方式: 短信+邮件
    升级策略: 30分钟未处理升级为critical

  info:
    描述: 提示告警,需要关注
    处理时间: 4小时内
    通知方式: 邮件
    升级策略: 4小时未处理升级为warning
```

2. 告警阈值
```yaml
# 告警阈值定义
阈值配置:
  系统层:
    CPU使用率: 
      warning: 70%
      critical: 90%
    内存使用率:
      warning: 80%
      critical: 90%
    磁盘使用率:
      warning: 80%
      critical: 90%

  HAProxy层:
    连接数使用率:
      warning: 80%
      critical: 90%
    后端服务器可用率:
      warning: 70%
      critical: 50%
    错误率:
      warning: 5%
      critical: 10%
    响应时间:
      warning: 1s
      critical: 3s
```

### 4.2 告警处理
1. 处理流程
```plaintext
告警产生
  ↓
告警分级
  ↓
告警通知
  ↓
问题处理
  ↓
结果反馈
  ↓
告警关闭
```

2. 处理预案
```yaml
# 常见告警处理预案
HAProxyDown:
  原因分析:
    - 进程异常退出
    - 系统资源不足
    - 配置文件错误
  处理步骤:
    1. 检查进程状态
    2. 查看错误日志
    3. 尝试重启服务
    4. 分析根本原因

BackendDown:
  原因分析:
    - 后端服务异常
    - 网络连接问题
    - 健康检查失败
  处理步骤:
    1. 检查后端服务状态
    2. 验证网络连通性
    3. 查看健康检查日志
    4. 切换备用节点

HighConnections:
  原因分析:
    - 流量突增
    - 连接未及时释放
    - 资源配置不足
  处理步骤:
    1. 分析流量来源
    2. 检查连接状态
    3. 优化配置参数
    4. 考虑扩容

SlowResponse:
  原因分析:
    - 后端服务响应慢
    - 网络延迟高
    - 系统资源不足
  处理步骤:
    1. 定位慢请求
    2. 分析响应时间
    3. 优化后端服务
    4. 调整超时配置
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy最佳实践](11_HAProxy最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档 