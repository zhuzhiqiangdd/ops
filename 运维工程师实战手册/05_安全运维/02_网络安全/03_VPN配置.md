# VPN配置指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅已完成]

## 1. OpenVPN配置

### 1.1 服务器配置
1. 安装配置
```bash
# 安装OpenVPN
yum install -y epel-release
yum install -y openvpn easy-rsa

# 初始化PKI
cp -r /usr/share/easy-rsa/3.0/* /etc/openvpn/easy-rsa/
cd /etc/openvpn/easy-rsa/
./easyrsa init-pki
./easyrsa build-ca
./easyrsa build-server-full server nopass
./easyrsa build-client-full client1 nopass
./easyrsa gen-dh
```

2. 服务器配置文件
```conf
# /etc/openvpn/server.conf
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
```

### 1.2 客户端配置
1. 客户端配置文件
```conf
# client.ovpn
client
dev tun
proto udp
remote vpn.example.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client1.crt
key client1.key
remote-cert-tls server
cipher AES-256-CBC
auth SHA256
comp-lzo
verb 3
```

2. 证书分发
```bash
# 打包客户端配置
cd /etc/openvpn/easy-rsa/pki/
tar czf client1.tar.gz ca.crt issued/client1.crt private/client1.key

# 安全传输配置文件
scp client1.tar.gz user@client:/path/to/vpn/
```

## 2. IPSec/IKEv2配置

### 2.1 StrongSwan安装
1. 基础安装
```bash
# 安装StrongSwan
yum install -y strongswan

# 生成证书
strongswan pki --gen --type rsa --size 4096 --outform pem > /etc/strongswan/ipsec.d/private/server-root-key.pem
chmod 600 /etc/strongswan/ipsec.d/private/server-root-key.pem

strongswan pki --self --ca --lifetime 3650 \
    --in /etc/strongswan/ipsec.d/private/server-root-key.pem \
    --type rsa --dn "CN=VPN root CA" --outform pem \
    > /etc/strongswan/ipsec.d/cacerts/server-root-ca.pem
```

2. 服务器配置
```conf
# /etc/strongswan/ipsec.conf
config setup
    charondebug="ike 2, knl 2, cfg 2"
    uniqueids=no

conn %default
    ikelifetime=60m
    keylife=20m
    rekeymargin=3m
    keyingtries=1
    keyexchange=ikev2
    authby=secret

conn ikev2-vpn
    left=%any
    leftsubnet=0.0.0.0/0
    leftcert=server-cert.pem
    leftid=@server.example.com
    right=%any
    rightauth=eap-mschapv2
    rightsourceip=10.10.10.0/24
    rightdns=8.8.8.8,8.8.4.4
    auto=add
```

### 2.2 客户端配置
1. Windows客户端
```powershell
# 导入证书
Import-Certificate -FilePath "client-cert.p12" -CertStoreLocation Cert:\LocalMachine\My

# 创建VPN连接
Add-VpnConnection -Name "IKEv2 VPN" -ServerAddress "vpn.example.com" `
    -TunnelType IKEv2 -AuthenticationMethod Certificate `
    -EncryptionLevel Required
```

2. iOS/macOS配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>IKEv2</key>
            <dict>
                <key>RemoteAddress</key>
                <string>vpn.example.com</string>
                <key>AuthenticationMethod</key>
                <string>Certificate</string>
            </dict>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>VPN Configuration</string>
    <key>PayloadIdentifier</key>
    <string>com.example.vpn</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>...</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
```

## 3. WireGuard配置

### 3.1 服务器配置
1. 安装设置
```bash
# 安装WireGuard
yum install -y epel-release elrepo-release
yum install -y kmod-wireguard wireguard-tools

# 生成密钥
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key
chmod 600 /etc/wireguard/server_private.key
```

2. 接口配置
```ini
# /etc/wireguard/wg0.conf
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = <server_private_key>
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <client1_public_key>
AllowedIPs = 10.0.0.2/32
```

### 3.2 客户端配置
1. Linux客户端
```ini
# /etc/wireguard/wg0.conf
[Interface]
Address = 10.0.0.2/24
PrivateKey = <client_private_key>
DNS = 8.8.8.8

[Peer]
PublicKey = <server_public_key>
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

2. 移动客户端
```bash
# 生成二维码配置
qrencode -t ansiutf8 < client.conf
```

## 4. 高可用配置

### 4.1 负载均衡
1. HAProxy配置
```conf
# /etc/haproxy/haproxy.cfg
frontend vpn_frontend
    bind *:1194
    mode tcp
    default_backend vpn_backend

backend vpn_backend
    mode tcp
    balance roundrobin
    server vpn1 10.0.0.1:1194 check
    server vpn2 10.0.0.2:1194 check
```

2. Keepalived配置
```conf
# /etc/keepalived/keepalived.conf
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    authentication {
        auth_type PASS
        auth_pass secret
    }
    virtual_ipaddress {
        192.168.1.100
    }
}
```

### 4.2 监控配置
1. Prometheus监控
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'vpn_monitoring'
    static_configs:
      - targets: ['localhost:9176']

# 告警规则
groups:
- name: vpn_alerts
  rules:
  - alert: VPNDown
    expr: vpn_up == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: VPN service is down
```

2. Grafana仪表板
```json
{
  "dashboard": {
    "id": null,
    "title": "VPN Monitoring",
    "panels": [
      {
        "title": "Connected Clients",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "vpn_connected_clients",
            "legendFormat": "{{instance}}"
          }
        ]
      }
    ]
  }
}
```

## 5. 安全加固

### 5.1 系统加固
1. 系统配置
```bash
# 启用IP转发
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

# 配置防火墙
firewall-cmd --permanent --add-port=1194/udp
firewall-cmd --permanent --add-masquerade
firewall-cmd --reload
```

2. 证书管理
```bash
# 证书吊销
./easyrsa revoke client1
./easyrsa gen-crl
cp pki/crl.pem /etc/openvpn/

# 配置CRL
echo "crl-verify crl.pem" >> /etc/openvpn/server.conf
```

### 5.2 审计日志
1. 日志配置
```bash
# rsyslog配置
cat << EOF > /etc/rsyslog.d/openvpn.conf
if $programname == 'openvpn' then /var/log/openvpn/audit.log
& stop
EOF

# 日志轮转
cat << EOF > /etc/logrotate.d/openvpn
/var/log/openvpn/*.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
```

2. 日志分析
```python
#!/usr/bin/env python3
import re
import sys

def analyze_log(logfile):
    connection_pattern = r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*client (\d+\.\d+\.\d+\.\d+):(\d+) connected'
    
    with open(logfile, 'r') as f:
        for line in f:
            match = re.search(connection_pattern, line)
            if match:
                timestamp, ip, port = match.groups()
                print(f"Connection from {ip}:{port} at {timestamp}")

if __name__ == '__main__':
    analyze_log(sys.argv[1])
```

## 参考资料
1. OpenVPN Documentation
2. StrongSwan Documentation
3. WireGuard Documentation
4. HAProxy Documentation
5. VPN Security Best Practices 