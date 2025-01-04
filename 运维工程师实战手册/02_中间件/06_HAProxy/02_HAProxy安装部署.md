# HAProxy安装部署

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、环境准备

### 1.1 系统要求
1. 操作系统
   - CentOS 7/8
   - Ubuntu 18.04/20.04
   - Debian 10/11

2. 硬件要求
   - CPU: 2核心以上
   - 内存: 2GB以上
   - 磁盘: 20GB以上
   - 网卡: 千兆网卡

3. 网络要求
   - 固定IP地址
   - 防火墙开放相关端口
   - DNS正确配置

4. 依赖包
```bash
# CentOS
yum install -y gcc openssl-devel pcre-devel systemd-devel make

# Ubuntu/Debian
apt-get install -y gcc libssl-dev libpcre3-dev libsystemd-dev make
```

### 1.2 版本选择
1. LTS版本(推荐)
   - 2.6.x: 最新LTS版本
   - 2.4.x: 上一个LTS版本
   - 特点: 稳定性好,bug修复及时

2. 最新版本
   - 2.8.x: 最新开发版本
   - 特点: 功能新,但可能存在稳定性问题

3. 版本特性对比
| 版本 | 特性 | 适用场景 |
|-----|------|----------|
| 2.6 | HTTP/2, 多线程, Layer 7重试 | 生产环境 |
| 2.4 | SSL/TLS增强, 多进程 | 稳定性要求高 |
| 2.8 | QUIC, HTTP/3 | 测试环境 |

## 二、安装方法

### 2.1 包管理器安装
1. CentOS
```bash
# 添加源
yum install -y epel-release

# 安装HAProxy
yum install -y haproxy

# 启动服务
systemctl enable haproxy
systemctl start haproxy
```

2. Ubuntu/Debian
```bash
# 更新源
apt-get update

# 安装HAProxy
apt-get install -y haproxy

# 启动服务
systemctl enable haproxy
systemctl start haproxy
```

### 2.2 源码编译安装
1. 下载源码
```bash
# 下载源码
wget https://www.haproxy.org/download/2.6/src/haproxy-2.6.14.tar.gz

# 解压
tar xf haproxy-2.6.14.tar.gz
cd haproxy-2.6.14
```

2. 编译安装
```bash
# 编译
make TARGET=linux-glibc \
  USE_OPENSSL=1 \
  USE_PCRE=1 \
  USE_SYSTEMD=1 \
  USE_ZLIB=1 \
  EXTRA_OBJS="contrib/prometheus-exporter/service-prometheus.o"

# 安装
make install

# 创建配置目录
mkdir -p /etc/haproxy
mkdir -p /var/lib/haproxy

# 创建用户
useradd -r haproxy

# 复制配置文件
cp examples/haproxy.cfg /etc/haproxy/
```

3. 创建systemd服务
```bash
cat > /etc/systemd/system/haproxy.service << EOF
[Unit]
Description=HAProxy Load Balancer
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
Environment="CONFIG=/etc/haproxy/haproxy.cfg" "PIDFILE=/run/haproxy.pid"
ExecStartPre=/usr/local/sbin/haproxy -f \$CONFIG -c
ExecStart=/usr/local/sbin/haproxy -Ws -f \$CONFIG -p \$PIDFILE
ExecReload=/usr/local/sbin/haproxy -Ws -f \$CONFIG -p \$PIDFILE -sf \$MAINPID
ExecStop=/bin/kill -SIGTERM \$MAINPID
PrivateTmp=true
RuntimeDirectory=haproxy

[Install]
WantedBy=multi-user.target
EOF

# 重载systemd
systemctl daemon-reload

# 启动服务
systemctl enable haproxy
systemctl start haproxy
```

### 2.3 Docker安装
1. 拉取镜像
```bash
docker pull haproxy:2.6
```

2. 准备配置文件
```bash
mkdir -p /etc/haproxy
cat > /etc/haproxy/haproxy.cfg << EOF
global
    maxconn 4096
    user haproxy
    group haproxy
    daemon

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend http-in
    bind *:80
    default_backend servers

backend servers
    balance roundrobin
    server server1 127.0.0.1:8080 check
    server server2 127.0.0.1:8081 check
EOF
```

3. 运行容器
```bash
docker run -d \
  --name haproxy \
  --restart always \
  -p 80:80 \
  -p 8404:8404 \
  -v /etc/haproxy:/usr/local/etc/haproxy:ro \
  haproxy:2.6
```

4. Docker Compose部署
```yaml
version: '3'
services:
  haproxy:
    image: haproxy:2.6
    container_name: haproxy
    restart: always
    ports:
      - "80:80"
      - "8404:8404"
    volumes:
      - /etc/haproxy:/usr/local/etc/haproxy:ro
    networks:
      - proxy-network

networks:
  proxy-network:
    driver: bridge
```

## 三、基础配置

### 3.1 目录结构
```
/etc/haproxy/
├── haproxy.cfg          # 主配置文件
├── errors/              # 错误页面
├── maps/               # 映射文件
├── certs/              # SSL证书
└── lua/                # Lua脚本
```

### 3.2 初始配置
```haproxy
global
    maxconn 100000
    daemon
    user haproxy
    group haproxy
    stats socket /var/lib/haproxy/stats mode 600 level admin
    log 127.0.0.1 local0 info
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    log global
    option httplog
    option dontlognull
    option http-server-close
    option forwardfor except 127.0.0.0/8

frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats auth admin:admin
    stats admin if TRUE

frontend http-in
    bind *:80
    default_backend web-backend

backend web-backend
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server web1 192.168.1.101:8080 check
    server web2 192.168.1.102:80 check
```

### 3.3 日志配置
1. rsyslog配置
```bash
# /etc/rsyslog.d/haproxy.conf
local0.* /var/log/haproxy/haproxy.log
```

2. logrotate配置
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

## 四、验证测试

### 4.1 配置检查
```bash
# 检查配置语法
haproxy -c -f /etc/haproxy/haproxy.cfg

# 检查服务状态
systemctl status haproxy

# 检查端口监听
ss -tnlp | grep haproxy

# 检查日志
tail -f /var/log/haproxy/haproxy.log
```

### 4.2 功能测试
1. HTTP测试
```bash
# 测试HTTP访问
curl -I http://localhost

# 测试统计页面
curl -u admin:admin http://localhost:8404/stats
```

2. 健康检查测试
```bash
# 查看后端状态
echo "show servers state" | socat stdio /var/lib/haproxy/stats

# 查看统计信息
echo "show stat" | socat stdio /var/lib/haproxy/stats
```

3. 性能测试
```bash
# 安装ab工具
yum install -y httpd-tools

# 执行测试
ab -n 100000 -c 100 http://localhost/
```

### 4.3 监控检查
1. Prometheus指标
```bash
# 检查指标输出
curl http://localhost:8404/metrics
```

2. 统计信息
```bash
# 查看详细统计
echo "show info" | socat stdio /var/lib/haproxy/stats
```

## 五、常见问题

### 5.1 启动问题
1. 端口冲突
```bash
# 检查端口占用
ss -tnlp | grep :80

# 修改配置或关闭冲突服务
systemctl stop nginx
```

2. 配置错误
```bash
# 检查语法
haproxy -c -f /etc/haproxy/haproxy.cfg

# 查看详细日志
journalctl -u haproxy -n 100
```

3. 权限问题
```bash
# 检查文件权限
ls -l /etc/haproxy/haproxy.cfg

# 修正权限
chown -R haproxy:haproxy /etc/haproxy
chmod 644 /etc/haproxy/haproxy.cfg
```

### 5.2 连接问题
1. 后端无响应
```bash
# 检查后端健康状态
echo "show servers state" | socat stdio /var/lib/haproxy/stats

# 测试后端连接
curl -I http://backend-server
```

2. SSL证书问题
```bash
# 检查证书配置
openssl x509 -in /etc/haproxy/certs/server.pem -text -noout

# 验证证书链
openssl verify -CAfile /etc/haproxy/certs/ca.pem /etc/haproxy/certs/server.pem
```

### 5.3 性能问题
1. 连接数限制
```bash
# 检查系统限制
ulimit -n

# 修改限制
cat >> /etc/security/limits.conf << EOF
haproxy soft nofile 65536
haproxy hard nofile 65536
EOF
```

2. 内存问题
```bash
# 检查内存使用
ps aux | grep haproxy
free -m

# 调整配置
vim /etc/haproxy/haproxy.cfg
# maxconn 50000
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy日志规范](../../02_日志管理/05_日志规范/21_HAProxy日志规范.md)

## 更新记录
- 2024-03-21: 创建文档 