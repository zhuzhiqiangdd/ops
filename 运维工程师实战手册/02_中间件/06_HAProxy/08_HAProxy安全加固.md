# HAProxy安全加固

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、基础安全配置

### 1.1 系统加固
1. 系统优化
```bash
# 内核参数优化
cat >> /etc/sysctl.conf << EOF
# 网络安全
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 81920
net.ipv4.tcp_synack_retries = 3
net.ipv4.tcp_syn_retries = 3

# 连接优化
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl = 15

# 资源限制
fs.file-max = 1048576
net.core.somaxconn = 65535
EOF

# 应用配置
sysctl -p
```

2. 权限控制
```bash
# 创建专用用户
useradd -r -s /sbin/nologin haproxy

# 目录权限
chown -R haproxy:haproxy /etc/haproxy
chmod 700 /etc/haproxy
chmod 600 /etc/haproxy/haproxy.cfg

# 日志权限
chown -R haproxy:haproxy /var/log/haproxy
chmod 700 /var/log/haproxy
```

### 1.2 运行安全
1. 基础配置
```haproxy
global
    # 用户权限
    user haproxy
    group haproxy
    
    # chroot限制
    chroot /var/lib/haproxy
    
    # 进程安全
    daemon
    nbproc 4
    cpu-map auto:1/1-4 0-3
```

2. 资源限制
```haproxy
global
    # 最大连接数
    maxconn 100000
    
    # ulimit设置
    ulimit-n 200000
    
    # 进程数量
    nbproc 4
    nbthread 4
```

## 二、访问控制

### 2.1 IP限制
1. 白名单配置
```haproxy
frontend http-in
    # IP白名单
    acl whitelist src 192.168.1.0/24 10.0.0.0/8
    tcp-request connection reject if !whitelist
```

2. 黑名单配置
```haproxy
frontend http-in
    # IP黑名单
    acl blacklist src 1.2.3.4 5.6.7.8
    tcp-request connection reject if blacklist
```

### 2.2 访问控制
1. 路径限制
```haproxy
frontend http-in
    # 敏感路径控制
    acl restricted_path path_beg /admin /api/admin
    acl internal_net src 192.168.1.0/24
    http-request deny if restricted_path !internal_net
```

2. 请求方法限制
```haproxy
frontend http-in
    # 允许的HTTP方法
    acl allowed_methods method GET HEAD POST
    http-request deny if !allowed_methods
```

## 三、DDoS防护

### 3.1 连接控制
1. 连接限制
```haproxy
frontend http-in
    # 连接追踪
    stick-table type ip size 100k expire 30s store conn_cur,conn_rate(3s),http_req_rate(10s)
    
    # 连接限制
    tcp-request connection track-sc1 src
    tcp-request connection reject if { sc1_conn_cur gt 100 }
    tcp-request connection reject if { sc1_conn_rate gt 20 }
```

2. 请求限制
```haproxy
frontend http-in
    # HTTP请求限制
    tcp-request content track-sc2 src
    tcp-request content reject if { sc2_http_req_rate gt 100 }
```

### 3.2 队列保护
1. 队列设置
```haproxy
frontend http-in
    # 队列控制
    maxconn 50000
    backlog 10000
    
    # 超时设置
    timeout client 5s
    timeout http-request 5s
```

2. 慢速攻击防护
```haproxy
frontend http-in
    # 请求速率控制
    timeout http-request 5s
    timeout client-fin 5s
    
    # TCP选项
    option http-buffer-request
    option tcplog
```

## 四、传输安全

### 4.1 SSL/TLS配置
1. 协议限制
```haproxy
global
    # SSL配置
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384
```

2. HTTPS配置
```haproxy
frontend https-in
    # HTTPS设置
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem
    
    # HSTS
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### 4.2 HTTP安全
1. 安全头部
```haproxy
frontend http-in
    # 安全响应头
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff
    http-response set-header X-XSS-Protection "1; mode=block"
    http-response set-header Content-Security-Policy "default-src 'self'"
    
    # 删除敏感头部
    http-request del-header Server
    http-request del-header X-Powered-By
```

2. XSS防护
```haproxy
frontend http-in
    # XSS过滤
    http-request deny if { req.hdr(content-type) -i -m sub "<script" }
    http-request deny if { req.hdr(content-type) -i -m sub "javascript" }
```

## 五、日志安全

### 5.1 日志配置
1. 基础配置
```haproxy
global
    # 日志设置
    log 127.0.0.1 local0 info
    log 127.0.0.1 local1 notice
    
frontend http-in
    # 访问日志
    option httplog
    log global
    
    # 自定义格式
    log-format "%ci:%cp [%tr] %ft %b/%s %TR/%Tw/%Tc/%Tr/%Ta %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r"
```

2. 日志轮转
```bash
# /etc/logrotate.d/haproxy
/var/log/haproxy/*.log {
    daily
    rotate 30
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /bin/kill -HUP $(cat /var/run/syslogd.pid 2> /dev/null) 2> /dev/null || true
    endscript
}
```

### 5.2 审计日志
1. 关键事件记录
```haproxy
frontend http-in
    # 捕获HTTP头部
    capture request header Host len 100
    capture request header User-Agent len 200
    capture request header Referer len 200
    
    # 记录Cookie
    capture cookie JSESSIONID len 32
```

2. 错误日志
```haproxy
global
    # 错误日志
    log 127.0.0.1 local0 info
    
    # 调试级别
    debug
    
frontend http-in
    # 错误捕获
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http
```

## 六、监控告警

### 6.1 状态监控
1. 统计页面
```haproxy
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats auth admin:password
    stats admin if TRUE
```

2. 健康检查
```haproxy
backend web-servers
    # 健康检查
    option httpchk GET /health HTTP/1.1\r\nHost:\ example.com
    http-check expect status 200
    
    # 检查间隔
    default-server inter 2s fall 3 rise 2
```

### 6.2 告警设置
1. 错误告警
```bash
#!/bin/bash
# 监控HAProxy日志
tail -f /var/log/haproxy/error.log | while read line
do
    if echo "$line" | grep -q "ERROR"
    then
        # 发送告警
        curl -X POST "https://alert-api/send" -d "message=$line"
    fi
done
```

2. 性能告警
```bash
#!/bin/bash
# 检查连接数
CONN=$(echo "show stat" | socat stdio /var/lib/haproxy/stats | grep "frontend" | cut -d, -f5)
if [ $CONN -gt 90000 ]
then
    # 发送告警
    curl -X POST "https://alert-api/send" -d "message=High connection: $CONN"
fi
```

## 七、安全维护

### 7.1 更新维护
1. 版本更新
```bash
# 检查版本
haproxy -v

# 更新软件
yum update haproxy
apt update && apt upgrade haproxy
```

2. 配置更新
```bash
# 检查配置
haproxy -c -f /etc/haproxy/haproxy.cfg

# 平滑重启
systemctl reload haproxy
```

### 7.2 安全检查
1. 配置检查
```bash
#!/bin/bash
# 检查配置文件权限
check_perm() {
    if [ $(stat -c %a /etc/haproxy/haproxy.cfg) -ne 600 ]
    then
        echo "Warning: haproxy.cfg permissions are not secure"
    fi
}

# 检查SSL证书
check_ssl() {
    for cert in /etc/haproxy/certs/*.pem
    do
        openssl x509 -in $cert -noout -checkend 2592000 || echo "Warning: $cert will expire soon"
    done
}

# 执行检查
check_perm
check_ssl
```

2. 安全扫描
```bash
# 端口扫描
nmap -sS -sV -p- localhost

# SSL检查
sslyze --regular example.com:443

# 配置检查
cipherscan example.com:443
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy_SSL配置](07_HAProxy_SSL配置.md)

## 更新记录
- 2024-03-21: 创建文档 