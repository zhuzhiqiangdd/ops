# VPN 服务部署指南

## 1. VPN 基础概念

### 1.1 VPN 类型
1. 远程访问 VPN
   - OpenVPN
   - L2TP/IPSec
   - PPTP
   - SSTP

2. 站点到站点 VPN
   - IPSec VPN
   - GRE over IPSec
   - DMVPN

### 1.2 VPN 协议
1. 隧道协议
   - PPTP
   - L2TP
   - GRE
   - IPSec

2. 加密协议
   - SSL/TLS
   - IPSec
   - MPPE
   - AES

## 2. OpenVPN 部署

### 2.1 服务器安装
```bash
# RHEL/CentOS
yum install epel-release
yum install openvpn easy-rsa

# Debian/Ubuntu
apt update
apt install openvpn easy-rsa
```

### 2.2 证书配置
```bash
# 初始化 PKI
mkdir -p /etc/openvpn/easy-rsa
cp -r /usr/share/easy-rsa/* /etc/openvpn/easy-rsa/
cd /etc/openvpn/easy-rsa

# 配置变量
cat > vars << EOF
export KEY_COUNTRY="CN"
export KEY_PROVINCE="Beijing"
export KEY_CITY="Beijing"
export KEY_ORG="Example"
export KEY_EMAIL="admin@example.com"
export KEY_CN="OpenVPN-Server"
export KEY_NAME="server"
export KEY_OU="IT"
EOF

# 初始化 PKI
./easyrsa init-pki
./easyrsa build-ca
./easyrsa build-server-full server nopass
./easyrsa build-client-full client1 nopass
./easyrsa gen-dh
```

### 2.3 服务器配置
```bash
# 创建配置文件
cat > /etc/openvpn/server.conf << EOF
port 1194
proto udp
dev tun
ca /etc/openvpn/easy-rsa/pki/ca.crt
cert /etc/openvpn/easy-rsa/pki/issued/server.crt
key /etc/openvpn/easy-rsa/pki/private/server.key
dh /etc/openvpn/easy-rsa/pki/dh.pem
server 10.8.0.0 255.255.255.0
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"
keepalive 10 120
cipher AES-256-CBC
auth SHA256
comp-lzo
user nobody
group nobody
persist-key
persist-tun
status /var/log/openvpn/openvpn-status.log
log-append /var/log/openvpn/openvpn.log
verb 3
EOF

# 创建日志目录
mkdir -p /var/log/openvpn
chown nobody:nobody /var/log/openvpn
```

### 2.4 客户端配置
```bash
# 创建客户端配置模板
cat > /etc/openvpn/client.ovpn << EOF
client
dev tun
proto udp
remote your_server_ip 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client.crt
key client.key
remote-cert-tls server
cipher AES-256-CBC
auth SHA256
comp-lzo
verb 3
EOF

# 打包客户端配置
cd /etc/openvpn/easy-rsa/pki
mkdir -p /tmp/client1
cp ca.crt /tmp/client1/
cp issued/client1.crt /tmp/client1/client.crt
cp private/client1.key /tmp/client1/client.key
cp /etc/openvpn/client.ovpn /tmp/client1/
cd /tmp
tar czf client1.tar.gz client1/
```

## 3. IPSec VPN 部署

### 3.1 服务器安装
```bash
# RHEL/CentOS
yum install libreswan

# Debian/Ubuntu
apt install strongswan
```

### 3.2 基本配置
```bash
# Libreswan 配置
cat > /etc/ipsec.d/myvpn.conf << EOF
conn myhost-to-mynet
    authby=secret
    auto=start
    left=%defaultroute
    leftid=@host.example.com
    leftsubnet=192.168.1.0/24
    right=192.168.2.1
    rightsubnet=192.168.2.0/24
    ike=aes256-sha2;modp2048
    phase2alg=aes256-sha2;modp2048
    keyingtries=%forever
EOF

# 配置预共享密钥
cat > /etc/ipsec.d/myhost-to-mynet.secrets << EOF
@host.example.com 192.168.2.1: PSK "your_preshared_key"
EOF
```

### 3.3 L2TP/IPSec 配置
```bash
# 安装 xl2tpd
yum install xl2tpd  # RHEL/CentOS
apt install xl2tpd  # Debian/Ubuntu

# xl2tpd 配置
cat > /etc/xl2tpd/xl2tpd.conf << EOF
[global]
ipsec saref = yes
listen-addr = your_server_ip
port = 1701

[lns default]
ip range = 192.168.3.100-192.168.3.199
local ip = 192.168.3.1
require chap = yes
refuse pap = yes
require authentication = yes
name = L2TPServer
ppp debug = yes
pppoptfile = /etc/ppp/options.xl2tpd
length bit = yes
EOF

# PPP 配置
cat > /etc/ppp/options.xl2tpd << EOF
ipcp-accept-local
ipcp-accept-remote
ms-dns 8.8.8.8
ms-dns 8.8.4.4
noccp
auth
crtscts
idle 1800
mtu 1410
mru 1410
nodefaultroute
debug
lock
proxyarp
connect-delay 5000
EOF
```

### 3.4 防火墙配置
```bash
# IPSec 端口
firewall-cmd --permanent --add-port=500/udp
firewall-cmd --permanent --add-port=4500/udp

# L2TP 端口
firewall-cmd --permanent --add-port=1701/udp

# ESP 协议
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 0 -p esp -j ACCEPT

# 转发规则
firewall-cmd --permanent --direct --add-rule ipv4 filter FORWARD 0 \
    -i ppp+ -j ACCEPT
firewall-cmd --permanent --direct --add-rule ipv4 filter FORWARD 0 \
    -o ppp+ -j ACCEPT

firewall-cmd --reload
```

## 4. 高可用配置

### 4.1 OpenVPN 高可用
```bash
# 安装 Keepalived
yum install keepalived

# Keepalived 配置
cat > /etc/keepalived/keepalived.conf << EOF
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass your_password
    }
    virtual_ipaddress {
        10.0.0.100
    }
}

virtual_server 10.0.0.100 1194 {
    delay_loop 6
    lb_algo rr
    lb_kind NAT
    persistence_timeout 50
    protocol UDP

    real_server 10.0.0.1 1194 {
        weight 1
        UDP_CHECK {
            connect_timeout 3
            retry 3
        }
    }
}
EOF
```

### 4.2 IPSec 高可用
```bash
# StrongSwan 集群配置
cat > /etc/strongswan.d/charon.conf << EOF
charon {
    load_modular = yes
    plugins {
        ha {
            # Enable HA module
            enable = yes
            # Local node address
            local = 10.0.0.1
            # Remote node address
            remote = 10.0.0.2
            # Secret key for sync messages
            secret = your_secret_key
            # Virtual IP
            fifo_interface = yes
        }
    }
}
EOF
```

## 5. 监控与维护

### 5.1 OpenVPN 监控
```bash
# 状态监控脚本
cat > /usr/local/bin/openvpn_monitor.sh << EOF
#!/bin/bash

LOG_FILE="/var/log/openvpn_monitor.log"
ALERT_EMAIL="admin@example.com"

# 检查服务状态
check_service() {
    if ! systemctl is-active --quiet openvpn@server; then
        echo "[$(date)] OpenVPN service is down!" >> $LOG_FILE
        echo "OpenVPN service is down!" | mail -s "VPN Alert" $ALERT_EMAIL
    fi
}

# 检查连接数
check_connections() {
    CONN_COUNT=$(cat /var/log/openvpn/openvpn-status.log | grep CLIENT_LIST | wc -l)
    if [ $CONN_COUNT -gt 100 ]; then
        echo "[$(date)] Too many connections: $CONN_COUNT" >> $LOG_FILE
        echo "High VPN connection count: $CONN_COUNT" | mail -s "VPN Alert" $ALERT_EMAIL
    fi
}

# 主循环
while true; do
    check_service
    check_connections
    sleep 300
done
EOF

chmod +x /usr/local/bin/openvpn_monitor.sh
```

### 5.2 IPSec 监控
```bash
# 状态监控脚本
cat > /usr/local/bin/ipsec_monitor.sh << EOF
#!/bin/bash

LOG_FILE="/var/log/ipsec_monitor.log"
ALERT_EMAIL="admin@example.com"

# 检查服务状态
check_service() {
    if ! systemctl is-active --quiet ipsec; then
        echo "[$(date)] IPSec service is down!" >> $LOG_FILE
        echo "IPSec service is down!" | mail -s "VPN Alert" $ALERT_EMAIL
    fi
}

# 检查隧道状态
check_tunnels() {
    TUNNEL_COUNT=$(ipsec whack --status | grep "up" | wc -l)
    if [ $TUNNEL_COUNT -eq 0 ]; then
        echo "[$(date)] No active IPSec tunnels!" >> $LOG_FILE
        echo "No active IPSec tunnels!" | mail -s "VPN Alert" $ALERT_EMAIL
    fi
}

# 主循环
while true; do
    check_service
    check_tunnels
    sleep 300
done
EOF

chmod +x /usr/local/bin/ipsec_monitor.sh
```

## 6. 故障排查

### 6.1 OpenVPN 故障排查
```bash
# 检查服务状态
systemctl status openvpn@server

# 检查日志
tail -f /var/log/openvpn/openvpn.log

# 检查网络连接
netstat -anp | grep openvpn

# 检查路由表
ip route show

# 检查证书
openssl verify -CAfile /etc/openvpn/easy-rsa/pki/ca.crt \
    /etc/openvpn/easy-rsa/pki/issued/server.crt
```

### 6.2 IPSec 故障排查
```bash
# 检查服务状态
systemctl status ipsec

# 检查隧道状态
ipsec whack --status

# 检查日志
tail -f /var/log/pluto.log

# 检查连接
ipsec whack --trafficstatus

# 调试模式
ipsec whack --debug-all
```

## 7. 安全加固

### 7.1 OpenVPN 安全加固
```bash
# 加强 TLS 安全
cat >> /etc/openvpn/server.conf << EOF
tls-auth ta.key 0
tls-version-min 1.2
tls-cipher TLS-ECDHE-RSA-WITH-AES-256-GCM-SHA384
EOF

# 生成 TLS 认证密钥
openvpn --genkey --secret /etc/openvpn/ta.key

# 禁用不安全的加密算法
cat >> /etc/openvpn/server.conf << EOF
ncp-ciphers AES-256-GCM:AES-256-CBC
EOF
```

### 7.2 IPSec 安全加固
```bash
# 加强 IKE 配置
cat >> /etc/ipsec.conf << EOF
conn %default
    keyexchange=ikev2
    ike=aes256gcm16-sha384-ecp384!
    esp=aes256gcm16-sha384!
    dpdaction=restart
    dpddelay=30
    dpdtimeout=120
EOF

# 配置证书认证
cat >> /etc/ipsec.conf << EOF
    authby=rsasig
    leftcert=server.cert.pem
    rightcert=client.cert.pem
EOF
```

## 8. 自动化部署

### 8.1 Ansible 部署
```yaml
# vpn_deploy.yml
---
- hosts: vpn_servers
  tasks:
    - name: Install OpenVPN
      yum:
        name: openvpn
        state: present
      when: ansible_os_family == "RedHat"

    - name: Copy OpenVPN config
      template:
        src: server.conf.j2
        dest: /etc/openvpn/server.conf
      notify: restart openvpn

    - name: Generate certificates
      script: generate_certs.sh
      args:
        creates: /etc/openvpn/easy-rsa/pki/ca.crt

    - name: Start OpenVPN
      service:
        name: openvpn@server
        state: started
        enabled: yes

  handlers:
    - name: restart openvpn
      service:
        name: openvpn@server
        state: restarted
```

### 8.2 自动化证书管理
```bash
#!/bin/bash
# cert_manager.sh

# 配置变量
EASYRSA_DIR="/etc/openvpn/easy-rsa"
CLIENT_DIR="/etc/openvpn/clients"
TEMPLATE="/etc/openvpn/client.ovpn"

# 创建客户端证书
create_client() {
    local CLIENT=$1
    cd $EASYRSA_DIR
    ./easyrsa build-client-full $CLIENT nopass
    
    # 创建配置包
    mkdir -p $CLIENT_DIR/$CLIENT
    cp pki/ca.crt $CLIENT_DIR/$CLIENT/
    cp pki/issued/$CLIENT.crt $CLIENT_DIR/$CLIENT/
    cp pki/private/$CLIENT.key $CLIENT_DIR/$CLIENT/
    cp $TEMPLATE $CLIENT_DIR/$CLIENT/
    
    cd $CLIENT_DIR
    tar czf $CLIENT.tar.gz $CLIENT/
    rm -rf $CLIENT/
}

# 吊销客户端证书
revoke_client() {
    local CLIENT=$1
    cd $EASYRSA_DIR
    ./easyrsa revoke $CLIENT
    ./easyrsa gen-crl
    cp pki/crl.pem /etc/openvpn/
}

# 使用示例
case "$1" in
    create)
        create_client $2
        ;;
    revoke)
        revoke_client $2
        ;;
    *)
        echo "Usage: $0 {create|revoke} client_name"
        exit 1
        ;;
esac
```

## 9. 性能优化

### 9.1 OpenVPN 优化
```bash
# 系统参数优化
cat >> /etc/sysctl.conf << EOF
net.ipv4.ip_forward = 1
net.core.rmem_max = 4194304
net.core.wmem_max = 4194304
net.ipv4.tcp_rmem = 4096 87380 4194304
net.ipv4.tcp_wmem = 4096 87380 4194304
EOF

sysctl -p

# OpenVPN 参数优化
cat >> /etc/openvpn/server.conf << EOF
sndbuf 0
rcvbuf 0
txqueuelen 1000
tcp-queue-limit 128
push "sndbuf 0"
push "rcvbuf 0"
EOF
```

### 9.2 IPSec 优化
```bash
# 系统参数优化
cat >> /etc/sysctl.conf << EOF
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_keepalive_probes = 5
EOF

sysctl -p

# IPSec 参数优化
cat >> /etc/ipsec.conf << EOF
    replay_window = 128
    compress = yes
    mobike = yes
EOF
```

## 10. 最佳实践

### 10.1 部署建议
1. 网络规划
   - 合理分配 IP 地址段
   - 避免地址冲突
   - 预留扩展空间
   - 考虑高可用需求

2. 安全考虑
   - 使用强加密算法
   - 定期更新证书
   - 启用双因素认证
   - 限制访问范围

### 10.2 运维建议
1. 日常维护
   - 定期备份配置
   - 监控服务状态
   - 更新系统补丁
   - 检查安全日志

2. 应急处理
   - 准备应急方案
   - 建立快速恢复机制
   - 保持配置文档更新
   - 定期演练切换
``` 