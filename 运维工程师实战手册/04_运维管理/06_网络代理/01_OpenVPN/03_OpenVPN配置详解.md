# OpenVPN配置详解

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 服务器配置详解

### 1.1 基础配置参数
```bash
# 基本网络设置
port 1194                  # 监听端口
proto udp                  # 协议类型(udp/tcp)
dev tun                    # 虚拟网卡类型(tun/tap)

# 证书配置
ca ca.crt                  # CA证书路径
cert server.crt           # 服务器证书路径
key server.key           # 服务器私钥路径
dh dh.pem                # DH参数文件

# 网络配置
server 10.8.0.0 255.255.255.0  # VPN子网配置
ifconfig-pool-persist ipp.txt   # IP地址池持久化文件

# DNS配置
push "redirect-gateway def1 bypass-dhcp"  # 强制所有流量经过VPN
push "dhcp-option DNS 8.8.8.8"           # 推送DNS服务器
push "dhcp-option DNS 8.8.4.4"           # 备用DNS服务器
```

### 1.2 高级配置参数
```bash
# 性能优化
keepalive 10 120          # 存活检测间隔和超时时间
max-clients 100           # 最大客户端数量
sndbuf 393216            # 发送缓冲区大小
rcvbuf 393216            # 接收缓冲区大小

# 安全配置
tls-auth ta.key 0         # TLS认证密钥
cipher AES-256-GCM        # 加密算法
auth SHA256               # 认证算法
tls-version-min 1.2       # 最低TLS版本

# 权限配置
user nobody              # 运行用户
group nobody             # 运行用户组
persist-key              # 重启后保持密钥
persist-tun              # 重启后保持tun设备

# 日志配置
status openvpn-status.log  # 状态日志文件
log-append openvpn.log     # 运行日志文件
verb 3                     # 日志级别(0-9)
```

### 1.3 路由配置
```bash
# 客户端互访配置
client-to-client          # 允许客户端之间通信

# 路由推送
push "route 192.168.10.0 255.255.255.0"  # 推送内部网络路由
push "route 192.168.20.0 255.255.255.0"  # 推送其他网段路由

# 流量控制
push "topology subnet"    # 网络拓扑模式
```

## 2. 客户端配置详解

### 2.1 Linux客户端配置
```bash
client                    # 客户端模式
dev tun                   # 虚拟网卡类型
proto udp                 # 协议类型
remote vpn.example.com 1194  # 服务器地址和端口

# 认证配置
ca ca.crt                 # CA证书
cert client.crt           # 客户端证书
key client.key            # 客户端私钥
tls-auth ta.key 1         # TLS认证密钥

# 连接选项
resolv-retry infinite     # DNS解析重试
nobind                    # 不绑定本地端口
persist-key              # 保持密钥
persist-tun              # 保持tun设备
```

### 2.2 Windows客户端配置
```bash
# 基本配置
client
dev tun
proto udp
remote vpn.example.com 1194

# Windows特定配置
block-outside-dns        # 阻止非VPN DNS请求
register-dns            # 注册DNS
```

### 2.3 移动客户端配置
```bash
# 移动设备优化
fast-io                  # 快速IO模式
sndbuf 0                 # 自动调整发送缓冲区
rcvbuf 0                 # 自动调整接收缓冲区
```

## 3. 认证配置详解

### 3.1 证书认证配置
```bash
# 服务器端
tls-server               # TLS服务器模式
ca ca.crt               # CA证书
cert server.crt         # 服务器证书
key server.key          # 服务器私钥
dh dh.pem              # DH参数

# 客户端
tls-client              # TLS客户端模式
remote-cert-tls server  # 验证服务器证书
```

### 3.2 用户名密码认证
```bash
# 服务器端
auth-user-pass-verify /etc/openvpn/checkpsw.sh via-env
script-security 3
username-as-common-name
verify-client-cert require

# 客户端
auth-user-pass          # 启用用户名密码认证
```

### 3.3 双因素认证配置
```bash
# 服务器端配置
plugin /usr/lib/openvpn/plugins/openvpn-plugin-auth-pam.so login
verify-client-cert require

# 客户端配置
auth-user-pass
auth-nocache
```

## 4. 网络配置详解

### 4.1 网络模式配置
```bash
# TUN模式（三层）
dev tun
topology subnet
server 10.8.0.0 255.255.255.0

# TAP模式（二层）
dev tap
server-bridge 192.168.1.1 255.255.255.0 192.168.1.128 192.168.1.254
```

### 4.2 路由配置
```bash
# 服务器端路由推送
push "route 192.168.0.0 255.255.0.0"    # 推送路由
push "redirect-gateway def1"             # 重定向默认网关

# 客户端特定路由
route 10.0.0.0 255.0.0.0                # 添加特定路由
route-nopull                            # 不接受服务器推送的路由
```

### 4.3 防火墙配置
```bash
# 服务器端
push "block-outside-dns"                # 阻止外部DNS
push "dhcp-option DOMAIN example.com"   # 设置搜索域

# 客户端
pull-filter ignore "route"              # 过滤特定推送选项
```

## 5. 性能优化配置

### 5.1 传输优化
```bash
# 缓冲区优化
sndbuf 0                               # 发送缓冲区
rcvbuf 0                               # 接收缓冲区
tcp-queue-limit 128                    # TCP队列限制

# 压缩配置
compress lz4-v2                        # 启用LZ4压缩
push "compress lz4-v2"                 # 推送压缩配置
```

### 5.2 多线程优化
```bash
# 服务器端
multihome                             # 多网卡支持
max-routes-per-client 1000            # 每个客户端最大路由数
max-clients 100                       # 最大客户端数
```

### 5.3 连接优化
```bash
# 连接稳定性
keepalive 10 60                       # 存活检测
ping-timer-rem                        # 精确计时
persist-tun                          # 保持隧道
persist-key                          # 保持密钥
```

## 6. 日志配置详解

### 6.1 基本日志配置
```bash
# 日志文件配置
log-append /var/log/openvpn.log       # 追加日志
status /var/log/openvpn-status.log 30 # 状态日志，每30秒更新

# 日志级别
verb 3                               # 标准日志级别
mute 20                             # 重复消息数限制
```

### 6.2 高级日志配置
```bash
# 详细日志
verb 4                              # 详细日志级别
log-pid                            # 记录进程ID
machine-readable-output            # 机器可读输出

# 审计日志
audit-log /var/log/openvpn-audit.log # 审计日志
```

## 7. 相关文档
- [OpenVPN基础架构](01_OpenVPN基础架构.md)
- [OpenVPN安装部署](02_OpenVPN安装部署.md)
- [OpenVPN运维手册](04_OpenVPN运维手册.md)
- [OpenVPN最佳实践](05_OpenVPN最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善配置详解 