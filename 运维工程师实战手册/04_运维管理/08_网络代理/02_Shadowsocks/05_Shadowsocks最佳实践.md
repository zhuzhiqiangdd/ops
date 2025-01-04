# Shadowsocks最佳实践

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 架构设计最佳实践

### 1.1 部署架构
1. 单节点部署
   - 适用场景：个人使用、小规模团队
   - 配置要求：1核1G起步
   - 带宽建议：≥1Mbps
   - 安全要求：基本安全防护

2. 集群部署
   - 适用场景：企业应用、大规模用户
   - 配置要求：2核2G以上
   - 带宽建议：≥10Mbps
   - 安全要求：高级安全防护

3. 负载均衡
   - 使用HAProxy/Nginx
   - 配置健康检查
   - 启用会话保持
   - 实现故障转移

### 1.2 网络架构
1. 直连模式
   ```
   [客户端] --- SS加密通道 --- [SS服务器] --- [目标网站]
   ```

2. 中继模式
   ```
   [客户端] --- SS加密通道 --- [SS中继] --- SS加密通道 --- [SS服务器] --- [目标网站]
   ```

3. 混淆模式
   ```
   [客户端] --- 混淆 --- SS加密通道 --- [SS服务器] --- [目标网站]
   ```

## 2. 安装部署最佳实践

### 2.1 系统选择
1. Linux系统
   - 推荐：Ubuntu 20.04/22.04 LTS
   - 内核：5.4或更高版本
   - 文件系统：ext4
   - 时区：UTC

2. 系统优化
   ```bash
   # 系统参数优化
   cat >> /etc/sysctl.conf << EOF
   fs.file-max = 1000000
   net.core.rmem_max = 67108864
   net.core.wmem_max = 67108864
   net.core.netdev_max_backlog = 250000
   net.core.somaxconn = 32768
   net.ipv4.tcp_syncookies = 1
   net.ipv4.tcp_tw_reuse = 1
   net.ipv4.tcp_fin_timeout = 30
   net.ipv4.tcp_keepalive_time = 1200
   net.ipv4.ip_local_port_range = 10000 65000
   net.ipv4.tcp_max_syn_backlog = 8192
   net.ipv4.tcp_max_tw_buckets = 5000
   net.ipv4.tcp_fastopen = 3
   net.ipv4.tcp_rmem = 4096 87380 67108864
   net.ipv4.tcp_wmem = 4096 65536 67108864
   net.ipv4.tcp_mtu_probing = 1
   EOF

   sysctl -p
   ```

### 2.2 安装方式
1. 包管理器安装
   ```bash
   # Ubuntu/Debian
   apt update
   apt install python3-pip
   pip3 install shadowsocks
   ```

2. Docker安装
   ```bash
   # 拉取镜像
   docker pull shadowsocks/shadowsocks-libev

   # 运行容器
   docker run -d \
     --name ss-server \
     --restart always \
     --network host \
     shadowsocks/shadowsocks-libev \
     ss-server -s 0.0.0.0 \
     -p 8388 \
     -k your_password \
     -m aes-256-gcm \
     -t 300 \
     -d "8.8.8.8,8.8.4.4" \
     --fast-open
   ```

## 3. 配置最佳实践

### 3.1 基础配置
1. 服务端配置
   ```json
   {
     "server": "0.0.0.0",
     "server_port": 8388,
     "password": "use_strong_password",
     "timeout": 300,
     "method": "aes-256-gcm",
     "fast_open": true,
     "workers": 2,
     "no_delay": true,
     "reuse_port": true,
     "nameserver": "8.8.8.8"
   }
   ```

2. 客户端配置
   ```json
   {
     "server": "server_ip",
     "server_port": 8388,
     "local_address": "127.0.0.1",
     "local_port": 1080,
     "password": "use_strong_password",
     "timeout": 300,
     "method": "aes-256-gcm",
     "fast_open": true,
     "no_delay": true
   }
   ```

### 3.2 高级配置
1. 多用户配置
   ```json
   {
     "server": "0.0.0.0",
     "port_password": {
       "8381": {
         "password": "password1",
         "method": "aes-256-gcm"
       },
       "8382": {
         "password": "password2",
         "method": "chacha20-ietf-poly1305"
       }
     },
     "timeout": 300,
     "fast_open": true,
     "workers": 4
   }
   ```

2. 插件配置
   ```json
   {
     "server": "0.0.0.0",
     "server_port": 8388,
     "password": "your_password",
     "method": "aes-256-gcm",
     "plugin": "v2ray-plugin",
     "plugin_opts": "server;tls;host=example.com;path=/ws",
     "timeout": 300,
     "workers": 2
   }
   ```

## 4. 安全最佳实践

### 4.1 加密配置
1. 推荐加密方法
   - aes-256-gcm
   - chacha20-ietf-poly1305
   - xchacha20-ietf-poly1305

2. 密码策略
   - 长度：≥16字符
   - 包含：大小写字母、数字、特殊字符
   - 定期更换
   - 避免重复使用

### 4.2 防护配置
1. 防火墙配置
   ```bash
   # 仅开放必要端口
   iptables -A INPUT -p tcp --dport 8388 -j ACCEPT
   iptables -A INPUT -p udp --dport 8388 -j ACCEPT

   # 限制连接数
   iptables -A INPUT -p tcp --dport 8388 -m connlimit --connlimit-above 100 -j DROP

   # 限制并发连接
   iptables -A INPUT -p tcp --dport 8388 -m state --state NEW -m recent --set
   iptables -A INPUT -p tcp --dport 8388 -m state --state NEW -m recent --update --seconds 60 --hitcount 10 -j DROP
   ```

2. 系统安全
   ```bash
   # 禁用密码登录
   sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

   # 修改SSH端口
   sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

   # 限制root登录
   sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
   ```

## 5. 性能优化最佳实践

### 5.1 系统优化
1. TCP优化
   ```bash
   # TCP BBR
   echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
   echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
   sysctl -p

   # TCP Fast Open
   echo 3 > /proc/sys/net/ipv4/tcp_fastopen
   ```

2. 资源限制
   ```bash
   # 最大文件描述符
   ulimit -n 1000000

   # 进程数限制
   ulimit -u 65535
   ```

### 5.2 应用优化
1. 多进程配置
   ```json
   {
     "server": "0.0.0.0",
     "server_port": 8388,
     "password": "your_password",
     "method": "aes-256-gcm",
     "timeout": 300,
     "workers": 4,
     "fast_open": true,
     "reuse_port": true,
     "no_delay": true
   }
   ```

2. 内存优化
   ```json
   {
     "server": "0.0.0.0",
     "server_port": 8388,
     "password": "your_password",
     "method": "chacha20-ietf-poly1305",
     "timeout": 300,
     "fast_open": true,
     "workers": 2,
     "no_delay": true,
     "reuse_port": true,
     "mptcp": true
   }
   ```

## 6. 监控告警最佳实践

### 6.1 监控指标
1. 系统指标
   - CPU使用率
   - 内存使用
   - 磁盘IO
   - 网络带宽

2. 服务指标
   - 连接数
   - 流量统计
   - 延迟情况
   - 错误率

### 6.2 告警配置
1. 资源告警
   - CPU > 80%
   - 内存 > 80%
   - 磁盘使用 > 85%
   - 带宽使用 > 90%

2. 服务告警
   - 服务不可用
   - 连接数异常
   - 错误率超标
   - 延迟过高

## 7. 相关文档
- [Shadowsocks基础架构](01_Shadowsocks基础架构.md)
- [Shadowsocks安装部署](02_Shadowsocks安装部署.md)
- [Shadowsocks配置详解](03_Shadowsocks配置详解.md)
- [Shadowsocks运维手册](04_Shadowsocks运维手册.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善最佳实践说明 