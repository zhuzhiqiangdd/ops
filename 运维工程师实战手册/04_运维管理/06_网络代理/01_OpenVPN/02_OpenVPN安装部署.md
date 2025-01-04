# OpenVPN安装部署指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 环境要求

### 1.1 系统要求
- 操作系统：CentOS 7/8, Ubuntu 18.04/20.04
- CPU：至少2核
- 内存：至少2GB
- 磁盘：至少20GB
- 网络：公网IP或端口转发

### 1.2 软件依赖
- OpenSSL >= 1.1.1
- Easy-RSA >= 3.0
- iptables/nftables
- Linux内核版本 >= 3.10

### 1.3 网络要求
- 开放UDP 1194端口（默认）
- 支持TUN/TAP设备
- 允许IP转发
- 防火墙配置正确

## 2. 安装步骤

### 2.1 CentOS 7/8安装
```bash
# 安装EPEL仓库
yum install epel-release -y

# 安装OpenVPN和Easy-RSA
yum install openvpn easy-rsa -y

# 创建配置目录
mkdir -p /etc/openvpn/server/
mkdir -p /etc/openvpn/client/
```

### 2.2 Ubuntu安装
```bash
# 更新软件包
apt update

# 安装OpenVPN和Easy-RSA
apt install openvpn easy-rsa -y

# 创建配置目录
mkdir -p /etc/openvpn/server/
mkdir -p /etc/openvpn/client/
```

## 3. 证书配置

### 3.1 初始化PKI
```bash
# 复制Easy-RSA模板
cp -r /usr/share/easy-rsa/ /etc/openvpn/
cd /etc/openvpn/easy-rsa/

# 初始化PKI
./easyrsa init-pki

# 创建CA证书
./easyrsa build-ca nopass

# 创建服务器证书
./easyrsa build-server-full server nopass

# 创建DH参数
./easyrsa gen-dh

# 创建TLS-Auth密钥
openvpn --genkey --secret ta.key
```

### 3.2 创建客户端证书
```bash
# 创建客户端证书
./easyrsa build-client-full client1 nopass

# 复制证书文件
cp pki/ca.crt /etc/openvpn/client/
cp pki/issued/client1.crt /etc/openvpn/client/
cp pki/private/client1.key /etc/openvpn/client/
```

## 4. 服务器配置

### 4.1 基本配置
```bash
# 复制示例配置
cp /usr/share/doc/openvpn/sample/sample-config-files/server.conf /etc/openvpn/server/

# 编辑服务器配置
cat > /etc/openvpn/server/server.conf << EOF
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh.pem
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"
keepalive 10 120
tls-auth ta.key 0
cipher AES-256-GCM
auth SHA256
user nobody
group nobody
persist-key
persist-tun
status openvpn-status.log
verb 3
EOF
```

### 4.2 系统配置
```bash
# 启用IP转发
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl -p

# 配置防火墙规则
firewall-cmd --permanent --add-service=openvpn
firewall-cmd --permanent --add-masquerade
firewall-cmd --reload
```

## 5. 客户端配置

### 5.1 生成客户端配置
```bash
cat > /etc/openvpn/client/client.ovpn << EOF
client
dev tun
proto udp
remote YOUR_SERVER_IP 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
<ca>
$(cat /etc/openvpn/client/ca.crt)
</ca>
<cert>
$(cat /etc/openvpn/client/client1.crt)
</cert>
<key>
$(cat /etc/openvpn/client/client1.key)
</key>
<tls-auth>
$(cat /etc/openvpn/easy-rsa/ta.key)
</tls-auth>
key-direction 1
EOF
```

### 5.2 分发客户端配置
- 使用安全的方式传输配置文件
- 可以使用SCP或HTTPS下载
- 避免明文传输证书

## 6. 服务管理

### 6.1 启动服务
```bash
# 启动OpenVPN服务
systemctl start openvpn@server

# 设置开机自启
systemctl enable openvpn@server

# 检查服务状态
systemctl status openvpn@server
```

### 6.2 日志查看
```bash
# 查看系统日志
journalctl -u openvpn@server

# 查看OpenVPN状态日志
cat /etc/openvpn/server/openvpn-status.log
```

## 7. 验证测试

### 7.1 服务器端验证
```bash
# 检查监听端口
netstat -lnup | grep openvpn

# 检查TUN接口
ip addr show tun0

# 检查路由表
ip route | grep tun0
```

### 7.2 客户端测试
```bash
# 连接测试
openvpn --config client.ovpn

# IP地址验证
ip addr show tun0

# 连通性测试
ping 8.8.8.8
```

## 8. 故障排除

### 8.1 常见问题
1. 连接超时
   - 检查防火墙配置
   - 验证端口开放状态
   - 确认网络连通性

2. 认证失败
   - 检查证书配置
   - 验证证书有效性
   - 确认时间同步

3. 路由问题
   - 检查IP转发
   - 验证路由表
   - 确认NAT配置

### 8.2 日志分析
```bash
# 开启详细日志
verb 4

# 查看实时日志
tail -f /var/log/openvpn.log

# 分析连接问题
grep "Connection reset" /var/log/openvpn.log
```

## 9. 相关文档
- [OpenVPN基础架构](01_OpenVPN基础架构.md)
- [OpenVPN配置详解](03_OpenVPN配置详解.md)
- [OpenVPN运维手册](04_OpenVPN运维手册.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善安装部署步骤 