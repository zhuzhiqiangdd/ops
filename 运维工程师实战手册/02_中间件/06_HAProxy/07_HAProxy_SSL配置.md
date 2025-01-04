# HAProxy SSL配置

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、SSL基础配置

### 1.1 证书准备
1. 证书类型
   - 单域名证书
   - 多域名证书
   - 泛域名证书
   - 自签名证书

2. 证书格式
```bash
# PEM格式证书(推荐)
cat domain.crt domain.key > domain.pem

# PKCS12格式转换
openssl pkcs12 -in domain.p12 -out domain.pem -nodes

# 证书链合并
cat domain.crt intermediate.crt root.crt > fullchain.pem
```

3. 证书存放
```bash
# 创建证书目录
mkdir -p /etc/haproxy/certs
chmod 700 /etc/haproxy/certs

# 存放证书
cp domain.pem /etc/haproxy/certs/
chmod 600 /etc/haproxy/certs/*.pem
```

### 1.2 基础配置
1. 全局配置
```haproxy
global
    # SSL默认配置
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384
    
    # SSL引擎配置
    ssl-engine rdrand
    ssl-mode-async
    nbthread 4
```

2. 前端配置
```haproxy
frontend https-in
    # 绑定SSL端口
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem
    
    # 模式设置
    mode http
    option httplog
    
    # 默认后端
    default_backend web-backend
```

## 二、高级SSL配置

### 2.1 多证书支持
1. 多域名证书
```haproxy
frontend https-in
    # 多证书绑定
    bind *:443 ssl crt /etc/haproxy/certs/
    
    # SNI路由
    use_backend %[ssl_fc_sni,lower,map(/etc/haproxy/maps/domains.map)]
```

2. 域名映射
```bash
# /etc/haproxy/maps/domains.map
example.com web-backend
api.example.com api-backend
*.example.com default-backend
```

### 2.2 SSL参数优化
1. 密码套件配置
```haproxy
frontend https-in
    # 自定义密码套件
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256 no-sslv3 no-tlsv10 no-tlsv11
    
    # ECDH参数
    ssl-dh-param-file /etc/haproxy/dhparams.pem
```

2. 会话缓存
```haproxy
global
    # 缓存大小
    tune.ssl.cachesize 20000
    
    # 超时时间
    tune.ssl.lifetime 300
    
    # 会话ID上下文
    tune.ssl.ctx-cache-size 1000
```

### 2.3 证书热更新
1. 配置方式
```haproxy
global
    # Unix Socket配置
    stats socket /var/lib/haproxy/stats mode 600 level admin
```

2. 更新命令
```bash
# 查看证书
echo "show ssl cert" | socat stdio /var/lib/haproxy/stats

# 更新证书
echo "set ssl cert /etc/haproxy/certs/domain.pem" | socat stdio /var/lib/haproxy/stats
```

## 三、安全加固配置

### 3.1 HTTPS重定向
1. HTTP重定向
```haproxy
frontend http-in
    bind *:80
    mode http
    
    # 强制HTTPS
    redirect scheme https code 301 if !{ ssl_fc }
```

2. HSTS配置
```haproxy
frontend https-in
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem
    
    # HSTS设置
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### 3.2 证书安全
1. OCSP Stapling
```haproxy
global
    # OCSP配置
    ssl-server-verify required
    ssl-default-server-options ssl-min-ver TLSv1.2
    
frontend https-in
    # 启用OCSP
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem ca-file /etc/haproxy/certs/ca.pem verify required crt-ignore-err all
```

2. 证书验证
```haproxy
frontend https-in
    # 客户端证书验证
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem ca-file /etc/haproxy/certs/ca.pem verify optional crt-ignore-err all
    
    # 验证设置
    acl valid_cert ssl_c_verify 0
    http-request deny unless valid_cert
```

### 3.3 安全头部
1. 安全响应头
```haproxy
frontend https-in
    # 安全头部
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff
    http-response set-header X-XSS-Protection "1; mode=block"
    http-response set-header Content-Security-Policy "default-src 'self'"
```

2. 自定义头部
```haproxy
frontend https-in
    # 删除敏感头部
    http-request del-header Server
    http-request del-header X-Powered-By
    
    # 添加自定义头部
    http-response set-header X-Custom-Header "HAProxy"
```

## 四、性能优化

### 4.1 SSL引擎优化
1. 硬件加速
```haproxy
global
    # 启用SSL硬件加速
    ssl-engine rdrand
    
    # 异步模式
    ssl-mode-async
    
    # 多线程
    nbthread 4
```

2. 会话复用
```haproxy
global
    # 会话缓存
    tune.ssl.cachesize 20000
    tune.ssl.lifetime 300
    
    # 会话票证
    tune.ssl.ticketkey.filename /etc/haproxy/ticket.key
    tune.ssl.ticketkey.period 600
```

### 4.2 连接优化
1. 连接设置
```haproxy
frontend https-in
    # 最大连接数
    maxconn 50000
    
    # 超时设置
    timeout client 30s
    timeout http-keep-alive 10s
```

2. 队列控制
```haproxy
frontend https-in
    # 队列设置
    maxconn 50000
    backlog 10000
    
    # 速率限制
    stick-table type ip size 100k expire 30s store conn_rate(3s)
    tcp-request connection track-sc1 src
    tcp-request connection reject if { sc1_conn_rate gt 10 }
```

## 五、监控与维护

### 5.1 SSL监控
1. 统计信息
```haproxy
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if TRUE
```

2. 日志配置
```haproxy
frontend https-in
    # 日志格式
    option httplog
    log-format "%ci:%cp [%tr] %ft %b/%s %TR/%Tw/%Tc/%Tr/%Ta %ST %B %CC %CS %tsc %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r %sslv %sslc"
```

### 5.2 证书维护
1. 证书更新
```bash
#!/bin/bash
# 更新证书
certbot renew --deploy-hook "cat /etc/letsencrypt/live/domain.com/fullchain.pem /etc/letsencrypt/live/domain.com/privkey.pem > /etc/haproxy/certs/domain.pem && systemctl reload haproxy"
```

2. 证书监控
```bash
#!/bin/bash
# 检查证书过期
for cert in /etc/haproxy/certs/*.pem; do
    expiry=$(openssl x509 -in $cert -noout -enddate | cut -d= -f2)
    expiry_epoch=$(date -d "$expiry" +%s)
    now_epoch=$(date +%s)
    days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))
    if [ $days_left -lt 30 ]; then
        echo "Certificate $cert will expire in $days_left days"
    fi
done
```

## 六、最佳实践

### 6.1 配置建议
1. 安全配置
```haproxy
global
    # SSL安全设置
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384
    
    # 性能优化
    tune.ssl.cachesize 20000
    tune.ssl.lifetime 300
    ssl-mode-async
    nbthread 4

frontend https-in
    bind *:443 ssl crt /etc/haproxy/certs/domain.pem
    
    # 安全头部
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    http-response set-header X-Frame-Options SAMEORIGIN
    http-response set-header X-Content-Type-Options nosniff
    http-response set-header X-XSS-Protection "1; mode=block"
    
    # 性能设置
    option http-keep-alive
    timeout http-keep-alive 10s
```

2. 维护建议
   - 定期更新证书
   - 监控证书状态
   - 配置自动更新
   - 保持日志记录
   - 定期安全审计

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy安全加固](08_HAProxy安全加固.md)

## 更新记录
- 2024-03-21: 创建文档 