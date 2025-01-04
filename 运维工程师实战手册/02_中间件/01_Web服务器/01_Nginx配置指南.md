# Nginx配置指南

## 文档信息
- 版本: v1.0.0
- 更新时间: 2024-03-21
- 状态: [🏗️进行中]
- 作者: System Admin

## 修订历史
| 版本 | 日期 | 描述 | 作者 |
|-----|------|-----|-----|
| v1.0.0 | 2024-03-21 | 初始版本 | System Admin |

## 文档说明
### 目标读者
- 系统管理员
- Web运维工程师
- 应用开发人员
- 架构设计师

### 前置知识
- Linux系统基础
- Web服务基础
- 网络协议基础
- 安全基础知识

## Nginx概述
### 主要特性
1. 基础功能
   - HTTP服务器
   - 反向代理
   - 负载均衡
   - 缓存服务

2. 高级特性
   - HTTP/2支持
   - gRPC支持
   - WebSocket支持
   - SSL/TLS支持

### 应用场景
1. Web服务
   - 静态资源服务
   - 动态内容代理
   - 虚拟主机托管
   - 安全防护层

2. 反向代理
   - 负载均衡
   - 内容缓存
   - SSL终结
   - 访问控制

## 安装部署
### 包管理器安装
```bash
# Ubuntu/Debian
apt update
apt install nginx

# CentOS/RHEL
yum install epel-release
yum install nginx

# 验证安装
nginx -v
nginx -t
```

### 源码编译安装
```bash
# 安装依赖
apt install build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev libssl-dev

# 下载源码
wget https://nginx.org/download/nginx-1.24.0.tar.gz
tar xzf nginx-1.24.0.tar.gz
cd nginx-1.24.0

# 配置编译选项
./configure \
    --prefix=/usr/local/nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module

# 编译安装
make
make install
```

## 基础配置
### 主配置文件
```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/conf.d/*.conf;
}
```

### 虚拟主机配置
```nginx
# /etc/nginx/conf.d/example.com.conf
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;

    # 日志配置
    access_log /var/log/nginx/example.com.access.log;
    error_log /var/log/nginx/example.com.error.log;

    # 默认页面
    index index.html index.htm;

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # PHP处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 高级配置
### SSL配置
```nginx
# SSL配置示例
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS配置
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

### 反向代理配置
```nginx
# 反向代理配置
upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    keepalive 32;
}

server {
    listen 80;
    server_name proxy.example.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 负载均衡配置
```nginx
# 负载均衡配置
upstream backend {
    # 轮询方式
    server backend1.example.com;
    server backend2.example.com;

    # 权重方式
    server backend3.example.com weight=3;
    server backend4.example.com weight=2;

    # IP哈希
    ip_hash;
    server backend5.example.com;
    server backend6.example.com;

    # 最少连接
    least_conn;
    server backend7.example.com;
    server backend8.example.com;
}
```

## 性能优化
### 系统优化
```bash
# 系统限制优化
# /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_tw_buckets = 1440000
net.ipv4.ip_local_port_range = 1024 65000
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
```

### Nginx优化
```nginx
# 工作进程优化
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;

# 事件模块优化
events {
    use epoll;
    worker_connections 65535;
    multi_accept on;
    accept_mutex off;
}

# HTTP优化
http {
    # 开启gzip压缩
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/xml
        text/css
        text/plain
        text/xml;

    # 缓冲区优化
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;

    # 超时设置
    client_header_timeout 3m;
    client_body_timeout 3m;
    send_timeout 3m;
    keepalive_timeout 65;
    keepalive_requests 100;
}
```

## 缓存配置
### 代理缓存
```nginx
# 缓存配置
http {
    # 缓存区域定义
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

    server {
        location / {
            proxy_cache my_cache;
            proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
            proxy_cache_valid 200 60m;
            proxy_cache_valid 404 1m;
            proxy_cache_key $scheme$request_method$host$request_uri;
            proxy_cache_min_uses 1;
            proxy_cache_bypass $http_cache_control;
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

### 静态文件缓存
```nginx
# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
    access_log off;
    log_not_found off;
    tcp_nodelay off;
    open_file_cache max=3000 inactive=120s;
    open_file_cache_valid 45s;
    open_file_cache_min_uses 2;
    open_file_cache_errors off;
}
```

## 安全配置
### 基础安全配置
```nginx
# 安全相关配置
server {
    # 隐藏版本号
    server_tokens off;

    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;

    # XSS防护
    add_header X-XSS-Protection "1; mode=block" always;

    # 禁止嗅探MIME类型
    add_header X-Content-Type-Options "nosniff" always;

    # CSP策略
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # 限制请求方法
    if ($request_method !~ ^(GET|HEAD|POST)$) {
        return 444;
    }

    # 防止SQL注入
    location ~* \.(php|asp|aspx|jsp)$ {
        return 403;
    }
}
```

### DDoS防护
```nginx
# DDoS防护配置
http {
    # 限制连接数
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    limit_conn conn_limit_per_ip 10;

    # 限制请求率
    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;
    
    server {
        location / {
            limit_req zone=req_limit_per_ip burst=20 nodelay;
            limit_conn conn_limit_per_ip 10;
        }
    }
}
```

## 监控和日志
### 状态监控
```nginx
# 状态监控配置
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### 日志配置
```nginx
# 日志格式定义
log_format detailed '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time '
                    '$pipe $connection $connection_requests';

# 访问日志配置
access_log /var/log/nginx/detailed.log detailed buffer=32k flush=5s;

# 错误日志配置
error_log /var/log/nginx/error.log warn;
```

## 故障排查
### 常见问题
1. 502 Bad Gateway
   - 检查上游服务器状态
   - 检查FastCGI配置
   - 检查防火墙设置
   - 查看错误日志

2. 504 Gateway Timeout
   - 检查上游服务器响应时间
   - 调整超时设置
   - 检查网络连接
   - 优化上游服务性能

3. 性能问题
   - 检查系统资源使用
   - 分析访问日志
   - 检查缓存配置
   - 优化Nginx配置

### 故障排查命令
```bash
# 检查配置语法
nginx -t

# 检查模块列表
nginx -V

# 重新加载配置
nginx -s reload

# 查看进程状态
ps aux | grep nginx

# 查看连接状态
netstat -anp | grep nginx

# 查看日志实时输出
tail -f /var/log/nginx/error.log

# 分析访问日志
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -n 10
```

## 最佳实践
1. 配置管理
   - 使用版本控制管理配置
   - 定期备份配置文件
   - 测试环境验证配置
   - 保持配置简洁清晰

2. 性能优化
   - 启用压缩和缓存
   - 优化静态文件处理
   - 合理配置缓冲区
   - 监控性能指标

3. 安全加固
   - 及时更新版本
   - 配置访问控制
   - 启用SSL/TLS
   - 定期安全审计

4. 运维管理
   - 实施监控告警
   - 做好日志管理
   - 制定备份策略
   - 建立应急预案

## 参考资料
- [Nginx官方文档](https://nginx.org/en/docs/)
- [Nginx安全配置指南](https://www.nginx.com/resources/wiki/start/topics/examples/full/)
- [Nginx性能优化指南](https://www.nginx.com/blog/tuning-nginx/)
- [Mozilla SSL配置生成器](https://ssl-config.mozilla.org/)

## 相关文档
- [Linux基础命令](../01_Linux系统管理/01_基础命令.md)
- [网络服务配置](../02_网络服务/01_基础服务配置.md)
- [安全加固指南](../02_网络服务/03_安全服务实施.md) 