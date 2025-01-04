# HAProxy最佳实践

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、架构设计

### 1.1 部署架构
1. 单机部署
```plaintext
Client -> HAProxy -> Backend Servers
```

2. 双机热备
```plaintext
           -> HAProxy Master
Client -> Keepalived
           -> HAProxy Backup
```

3. 集群部署
```plaintext
                -> HAProxy Node1
Client -> DNS/LB -> HAProxy Node2
                -> HAProxy Node3
```

### 1.2 网络规划
1. 网络分区
```plaintext
# 网络规划示例
DMZ区: 192.168.1.0/24
  - HAProxy VIP: 192.168.1.10
  - HAProxy Node1: 192.168.1.11
  - HAProxy Node2: 192.168.1.12

应用区: 192.168.2.0/24
  - Web Server1: 192.168.2.101
  - Web Server2: 192.168.2.102
  - Web Server3: 192.168.2.103

管理区: 192.168.3.0/24
  - 监控服务器: 192.168.3.10
  - 日志服务器: 192.168.3.11
```

2. 端口规划
```plaintext
# 端口分配
80: HTTP服务
443: HTTPS服务
8404: Stats页面
9000-9100: 应用服务端口
```

## 二、配置最佳实践

### 2.1 基础配置
1. 全局配置
```haproxy
global
    # 运行身份
    user haproxy
    group haproxy
    
    # 进程管理
    daemon
    nbproc 4
    cpu-map auto:1/1-4 0-3
    
    # 资源限制
    maxconn 100000
    ulimit-n 200000
    
    # 日志配置
    log 127.0.0.1 local0 info
    log 127.0.0.1 local1 notice
    
    # SSL配置
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
    tune.ssl.default-dh-param 2048
```

2. 默认配置
```haproxy
defaults
    # 模式设置
    mode http
    
    # 日志格式
    option httplog
    log global
    
    # 超时设置
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    
    # 连接优化
    option http-keep-alive
    option forwardfor
    
    # 健康检查
    option httpchk
    default-server inter 3s fall 3 rise 2
```

### 2.2 前端配置
1. HTTP前端
```haproxy
frontend http-in
    bind *:80
    
    # 基础设置
    mode http
    maxconn 50000
    
    # 请求处理
    option forwardfor
    option http-server-close
    
    # 安全设置
    http-request deny if { src -f /etc/haproxy/blacklist.acl }
    
    # 路由规则
    acl host_api hdr(host) -i api.example.com
    acl host_www hdr(host) -i www.example.com
    
    use_backend api-servers if host_api
    use_backend www-servers if host_www
    default_backend www-servers
```

2. HTTPS前端
```haproxy
frontend https-in
    bind *:443 ssl crt /etc/haproxy/certs/
    
    # SSL设置
    http-response set-header Strict-Transport-Security "max-age=31536000"
    
    # 请求处理
    option forwardfor
    option http-server-close
    
    # 路由规则
    acl host_api hdr(host) -i api.example.com
    acl host_www hdr(host) -i www.example.com
    
    use_backend api-servers if host_api
    use_backend www-servers if host_www
    default_backend www-servers
```

### 2.3 后端配置
1. Web后端
```haproxy
backend www-servers
    # 负载均衡
    balance roundrobin
    
    # 健康检查
    option httpchk GET /health HTTP/1.1\r\nHost:\ www.example.com
    http-check expect status 200
    
    # 会话保持
    cookie SERVERID insert indirect nocache
    
    # 服务器配置
    server web1 192.168.2.101:80 check cookie s1 weight 100
    server web2 192.168.2.102:80 check cookie s2 weight 100
    server web3 192.168.2.103:80 check cookie s3 weight 100 backup
```

2. API后端
```haproxy
backend api-servers
    # 负载均衡
    balance leastconn
    
    # 健康检查
    option httpchk GET /health
    http-check expect status 200
    
    # 重试设置
    retries 2
    option redispatch
    
    # 服务器配置
    server api1 192.168.2.201:8080 check maxconn 3000
    server api2 192.168.2.202:8080 check maxconn 3000
```

## 三、性能优化

### 3.1 系统优化
1. 内核参数
```bash
# /etc/sysctl.conf
# 网络优化
net.ipv4.tcp_max_syn_backlog = 65536
net.core.somaxconn = 65536
net.ipv4.tcp_max_tw_buckets = 1440000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl = 15

# 内存优化
net.ipv4.tcp_mem = 94500000 915000000 927000000
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 87380 16777216
```

2. 资源限制
```bash
# /etc/security/limits.conf
haproxy soft nofile 65536
haproxy hard nofile 65536
haproxy soft nproc 65536
haproxy hard nproc 65536
```

### 3.2 HAProxy优化
1. 连接优化
```haproxy
global
    # 最大连接数
    maxconn 100000
    
    # 多进程配置
    nbproc 4
    nbthread 4
    cpu-map auto:1/1-4 0-3
    
    # SSL优化
    tune.ssl.default-dh-param 2048
    tune.ssl.cachesize 20000
    tune.ssl.maxrecord 1400

defaults
    # 超时优化
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    timeout http-keep-alive 60s
    timeout http-request 10s
    timeout queue 5s
    
    # 连接优化
    option http-server-close
    option http-pretend-keepalive
```

2. 压缩优化
```haproxy
frontend http-in
    # 启用压缩
    compression algo gzip
    compression type text/html text/plain text/css application/javascript
    
    # 压缩条件
    acl compress_type req.hdr(Content-Type) -m sub text
    acl compress_size res.len gt 1024
    compression offload if compress_type compress_size
```

## 四、安全实践

### 4.1 访问控制
1. IP限制
```haproxy
frontend http-in
    # 加载ACL
    acl whitelist src -f /etc/haproxy/whitelist.acl
    acl blacklist src -f /etc/haproxy/blacklist.acl
    
    # 访问控制
    tcp-request connection reject if blacklist
    tcp-request connection accept if whitelist
    tcp-request connection reject if !whitelist
```

2. 请求控制
```haproxy
frontend http-in
    # 请求方法限制
    acl allowed_methods method GET HEAD POST
    http-request deny if !allowed_methods
    
    # 路径限制
    acl restricted_path path_beg /admin /api/admin
    acl internal_net src 192.168.0.0/16
    http-request deny if restricted_path !internal_net
```

### 4.2 SSL安全
1. 证书配置
```haproxy
frontend https-in
    # 证书配置
    bind *:443 ssl crt /etc/haproxy/certs/combined.pem alpn h2,http/1.1
    
    # HSTS
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # 安全头部
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff
    http-response set-header X-XSS-Protection "1; mode=block"
```

2. SSL优化
```haproxy
global
    # SSL配置
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
    
    # SSL性能
    tune.ssl.default-dh-param 2048
    tune.ssl.cachesize 20000
    tune.ssl.lifetime 300
```

## 五、运维实践

### 5.1 监控实践
1. 监控配置
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

2. 日志配置
```haproxy
global
    # 日志配置
    log 127.0.0.1 local0 info
    log 127.0.0.1 local1 notice
    
defaults
    # 日志格式
    option httplog
    log global
    
    # 自定义格式
    log-format "%ci:%cp [%tr] %ft %b/%s %TR/%Tw/%Tc/%Tr/%Ta %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r"
```

### 5.2 备份实践
1. 配置备份
```bash
#!/bin/bash
# 配置备份
BACKUP_DIR="/backup/haproxy"
DATE=$(date +%Y%m%d)

# 创建备份
mkdir -p $BACKUP_DIR
cp -r /etc/haproxy $BACKUP_DIR/haproxy-$DATE
tar czf $BACKUP_DIR/haproxy-$DATE.tar.gz $BACKUP_DIR/haproxy-$DATE

# 保留30天
find $BACKUP_DIR -name "haproxy-*.tar.gz" -mtime +30 -delete
```

2. 证书备份
```bash
#!/bin/bash
# 证书备份
CERT_DIR="/etc/haproxy/certs"
BACKUP_DIR="/backup/certs"
DATE=$(date +%Y%m%d)

# 创建备份
mkdir -p $BACKUP_DIR
cp -r $CERT_DIR $BACKUP_DIR/certs-$DATE
tar czf $BACKUP_DIR/certs-$DATE.tar.gz $BACKUP_DIR/certs-$DATE

# 保留90天
find $BACKUP_DIR -name "certs-*.tar.gz" -mtime +90 -delete
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy监控告警](09_HAProxy监控告警.md)

## 更新记录
- 2024-03-21: 创建文档 