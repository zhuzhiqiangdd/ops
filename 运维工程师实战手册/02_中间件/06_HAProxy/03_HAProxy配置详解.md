# HAProxy配置详解

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、配置结构

### 1.1 配置文件结构
```haproxy
# 全局配置段
global
    # 全局参数

# 默认配置段
defaults
    # 默认参数

# 监听配置段
frontend <name>
    # 前端配置

# 后端配置段
backend <name>
    # 后端配置

# 监听+后端配置段
listen <name>
    # 完整配置
```

### 1.2 配置加载顺序
1. 配置文件加载顺序
   - global段: 最先加载
   - defaults段: 其次加载
   - frontend/backend/listen段: 最后加载

2. 配置继承关系
   - defaults段配置会被frontend/backend继承
   - frontend/backend可覆盖defaults配置
   - listen段可完全独立配置

## 二、全局配置(global)

### 2.1 进程管理
```haproxy
global
    # 守护进程运行
    daemon

    # 主进程PID文件
    pidfile /var/run/haproxy.pid

    # 最大连接数
    maxconn 100000

    # 运行用户/组
    user haproxy
    group haproxy

    # 多进程模式
    nbproc 4
    cpu-map 1 0
    cpu-map 2 1
    cpu-map 3 2
    cpu-map 4 3
```

### 2.2 性能优化
```haproxy
global
    # 每个进程的最大连接数
    maxconnrate 10000

    # 每个进程的最大会话率
    maxsessrate 10000

    # 每个进程的最大SSL会话数
    maxsslconn 40000

    # SSL缓存大小
    tune.ssl.cachesize 20000

    # 最大SSL握手并发数
    tune.ssl.maxrecord 16384

    # 启用多线程
    nbthread 8
```

### 2.3 安全配置
```haproxy
global
    # SSL密码套件
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11

    # chroot目录
    chroot /var/lib/haproxy

    # 禁用UNIX权限检查
    insecure-fork-wanted

    # 设置ulimit
    ulimit-n 200000
```

### 2.4 监控配置
```haproxy
global
    # 统计接口
    stats socket /var/lib/haproxy/stats mode 600 level admin

    # 日志配置
    log 127.0.0.1 local0 info
    log 127.0.0.1 local1 notice

    # 调试级别
    debug
```

## 三、默认配置(defaults)

### 3.1 基础配置
```haproxy
defaults
    # 运行模式(tcp/http)
    mode http

    # 日志格式
    log global
    option httplog

    # 超时设置
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
```

### 3.2 连接优化
```haproxy
defaults
    # 保持连接
    option http-keep-alive

    # 关闭无用连接
    option http-server-close

    # 启用压缩
    compression algo gzip
    compression type text/html text/plain text/css

    # 重试配置
    retries 3
    option redispatch
```

### 3.3 健康检查
```haproxy
defaults
    # 启用健康检查
    option httpchk GET /health
    http-check expect status 200

    # 检查间隔
    default-server inter 2s fall 3 rise 2
```

## 四、前端配置(frontend)

### 4.1 基础配置
```haproxy
frontend web-front
    # 绑定端口
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/

    # 默认后端
    default_backend web-back

    # 最大连接数
    maxconn 50000
```

### 4.2 请求处理
```haproxy
frontend web-front
    # 添加请求头
    option forwardfor
    http-request set-header X-Forwarded-Port %[dst_port]
    http-request add-header X-Forwarded-Proto https if { ssl_fc }

    # 删除请求头
    http-request del-header X-Forwarded-For

    # URL重写
    http-request set-path %[path,regsub(^/old/,/new/)]
```

### 4.3 访问控制
```haproxy
frontend web-front
    # IP白名单
    acl whitelist src 192.168.1.0/24
    http-request allow if whitelist

    # IP黑名单
    acl blacklist src 10.0.0.0/8
    http-request deny if blacklist

    # 速率限制
    stick-table type ip size 100k expire 30s store conn_rate(3s)
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_conn_rate(0) gt 10 }
```

### 4.4 SSL配置
```haproxy
frontend web-front
    # SSL证书
    bind *:443 ssl crt /etc/haproxy/certs/combined.pem

    # HSTS配置
    http-response set-header Strict-Transport-Security max-age=31536000

    # 重定向HTTPS
    redirect scheme https code 301 if !{ ssl_fc }
```

## 五、后端配置(backend)

### 5.1 基础配置
```haproxy
backend web-back
    # 负载均衡算法
    balance roundrobin

    # 服务器定义
    server web1 192.168.1.101:80 check
    server web2 192.168.1.102:80 check backup

    # 权重设置
    server web3 192.168.1.103:80 check weight 2
```

### 5.2 健康检查
```haproxy
backend web-back
    # HTTP检查
    option httpchk GET /health
    http-check expect status 200

    # TCP检查
    option tcp-check
    tcp-check connect
    tcp-check send PING\r\n
    tcp-check expect string +PONG

    # 自定义检查
    external-check command /usr/bin/check-script
```

### 5.3 会话保持
```haproxy
backend web-back
    # 源IP哈希
    balance source

    # Cookie会话保持
    cookie SERVERID insert indirect nocache

    # 动态Cookie
    dynamic-cookie-key "MySecret"

    # 服务器配置
    server web1 192.168.1.101:80 check cookie s1
    server web2 192.168.1.102:80 check cookie s2
```

### 5.4 高级特性
```haproxy
backend web-back
    # 重试配置
    retries 2
    option redispatch

    # 慢启动
    server web1 192.168.1.101:80 check slowstart 60s

    # 连接限制
    maxconn 1000

    # 队列设置
    queue 200 timeout 5s
```

## 六、监听配置(listen)

### 6.1 统计页面
```haproxy
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats auth admin:admin
    stats admin if TRUE
```

### 6.2 TCP服务
```haproxy
listen mysql
    bind *:3306
    mode tcp
    option mysql-check user haproxy
    balance roundrobin
    server mysql1 192.168.1.101:3306 check
    server mysql2 192.168.1.102:3306 check backup
```

### 6.3 HTTP服务
```haproxy
listen web
    bind *:80
    mode http
    balance roundrobin
    option httpchk
    http-check send meth GET uri /health
    http-check expect status 200
    server web1 192.168.1.101:80 check
    server web2 192.168.1.102:80 check
```

## 七、高级配置

### 7.1 错误处理
```haproxy
frontend web-front
    # 自定义错误页
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http

    # 错误重定向
    errorloc 503 /error_pages/503.html
```

### 7.2 动态配置
```haproxy
frontend web-front
    # 动态更新ACL
    acl invalid_src src_ip_reputation -2
    http-request deny if invalid_src

    # 动态黑名单
    stick-table type ip size 100k expire 30s store gpc0
    acl abuse sc0_gpc0_rate() gt 10
    http-request track-sc0 src
    http-request deny if abuse
```

### 7.3 Lua脚本
```haproxy
global
    lua-load /etc/haproxy/scripts/auth.lua

frontend web-front
    # 调用Lua函数
    http-request lua.auth
```

### 7.4 API网关
```haproxy
frontend api-gateway
    bind *:8000
    mode http
    
    # 路由规则
    acl is_user path_beg /api/user
    acl is_order path_beg /api/order
    
    # 转发规则
    use_backend user-service if is_user
    use_backend order-service if is_order
```

## 八、配置示例

### 8.1 Web负载均衡
```haproxy
global
    maxconn 100000
    daemon
    user haproxy
    group haproxy

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull
    option http-server-close
    option forwardfor except 127.0.0.0/8

frontend web-front
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/combined.pem
    
    # HTTPS重定向
    redirect scheme https if !{ ssl_fc }
    
    # 请求头处理
    option forwardfor
    http-request set-header X-Forwarded-Proto https if { ssl_fc }
    
    # ACL规则
    acl host_www hdr(host) -i www.example.com
    acl host_api hdr(host) -i api.example.com
    
    # 后端选择
    use_backend www-back if host_www
    use_backend api-back if host_api
    default_backend www-back

backend www-back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    cookie SERVERID insert indirect nocache
    server web1 192.168.1.101:80 check cookie s1
    server web2 192.168.1.102:80 check cookie s2

backend api-back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server api1 192.168.1.103:8080 check
    server api2 192.168.1.104:8080 check

listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats auth admin:admin
    stats admin if TRUE
```

### 8.2 数据库负载均衡
```haproxy
global
    maxconn 100000
    daemon
    user haproxy
    group haproxy

defaults
    mode tcp
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option tcplog

listen mysql-cluster
    bind *:3306
    mode tcp
    option mysql-check user haproxy
    balance roundrobin
    server mysql1 192.168.1.101:3306 check weight 1 maxconn 3000
    server mysql2 192.168.1.102:3306 check weight 1 maxconn 3000
    server mysql3 192.168.1.103:3306 check backup
```

### 8.3 微服务网关
```haproxy
global
    maxconn 100000
    daemon
    user haproxy
    group haproxy

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull

frontend api-gateway
    bind *:8000
    
    # JWT验证
    acl auth_ok var(txn.auth_ok) -m bool
    http-request lua.check_jwt
    http-request deny unless auth_ok
    
    # 服务路由
    acl is_user path_beg /api/user
    acl is_order path_beg /api/order
    acl is_product path_beg /api/product
    
    use_backend user-service if is_user
    use_backend order-service if is_order
    use_backend product-service if is_product

backend user-service
    balance roundrobin
    option httpchk GET /health
    server user1 192.168.1.101:8001 check
    server user2 192.168.1.102:8001 check

backend order-service
    balance roundrobin
    option httpchk GET /health
    server order1 192.168.1.103:8002 check
    server order2 192.168.1.104:8002 check

backend product-service
    balance roundrobin
    option httpchk GET /health
    server product1 192.168.1.105:8003 check
    server product2 192.168.1.106:8003 check
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy安装部署](02_HAProxy安装部署.md)
- [HAProxy日志规范](../../02_日志管理/05_日志规范/21_HAProxy日志规范.md)

## 更新记录
- 2024-03-21: 创建文档 