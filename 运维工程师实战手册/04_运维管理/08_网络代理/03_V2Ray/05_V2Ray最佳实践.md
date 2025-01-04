# V2Ray最佳实践

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 架构设计最佳实践

### 1.1 部署架构
1. 单节点部署
   - 适用场景：个人使用、小规模团队
   - 配置要求：1核2G起步
   - 带宽建议：≥1Mbps
   - 安全要求：基本安全防护

2. 集群部署
   - 适用场景：企业应用、大规模用户
   - 配置要求：2核4G以上
   - 带宽建议：≥10Mbps
   - 安全要求：高级安全防护

3. CDN加速
   - 使用WebSocket协议
   - 配置TLS加密
   - 启用HTTP/2支持
   - 域名合法性验证

### 1.2 协议选择
1. VMess协议
   - 默认推荐协议
   - 安全性较高
   - 性能开销中等
   - 兼容性好

2. VLESS协议
   - 更轻量级
   - 性能更优
   - 配置灵活
   - 需要配合TLS

3. Trojan协议
   - 伪装性好
   - 性能较高
   - 配置简单
   - 必须使用TLS

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
1. 官方脚本安装
   ```bash
   # 下载安装脚本
   curl -O https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh

   # 安装V2Ray
   bash install-release.sh
   ```

2. Docker安装
   ```bash
   # 拉取镜像
   docker pull v2fly/v2fly-core

   # 运行容器
   docker run -d \
     --name v2ray \
     --restart always \
     -v /etc/v2ray:/etc/v2ray \
     -p 10086:10086 \
     v2fly/v2fly-core
   ```

## 3. 配置最佳实践

### 3.1 基础配置
1. 日志配置
   ```json
   {
     "log": {
       "loglevel": "warning",
       "access": "/var/log/v2ray/access.log",
       "error": "/var/log/v2ray/error.log"
     }
   }
   ```

2. 入站配置
   ```json
   {
     "inbounds": [{
       "port": 443,
       "protocol": "vless",
       "settings": {
         "clients": [{
           "id": "uuid",
           "flow": "xtls-rprx-direct"
         }],
         "decryption": "none",
         "fallbacks": [{
           "dest": 80
         }]
       },
       "streamSettings": {
         "network": "tcp",
         "security": "xtls",
         "xtlsSettings": {
           "alpn": ["http/1.1"],
           "certificates": [{
             "certificateFile": "/path/to/fullchain.crt",
             "keyFile": "/path/to/private.key"
           }]
         }
       }
     }]
   }
   ```

3. 路由配置
   ```json
   {
     "routing": {
       "domainStrategy": "IPIfNonMatch",
       "rules": [
         {
           "type": "field",
           "domain": ["geosite:category-ads"],
           "outboundTag": "block"
         },
         {
           "type": "field",
           "domain": ["geosite:cn"],
           "outboundTag": "direct"
         },
         {
           "type": "field",
           "ip": ["geoip:cn"],
           "outboundTag": "direct"
         },
         {
           "type": "field",
           "protocol": ["bittorrent"],
           "outboundTag": "block"
         }
       ]
     }
   }
   ```

### 3.2 高级配置
1. 多协议复用
   ```json
   {
     "inbounds": [
       {
         "port": 443,
         "protocol": "vless",
         "settings": {
           "clients": [{"id": "uuid"}],
           "decryption": "none",
           "fallbacks": [
             {"dest": "/dev/shm/h1.sock", "xver": 1},
             {"alpn": "h2", "dest": "/dev/shm/h2.sock", "xver": 1}
           ]
         },
         "streamSettings": {
           "network": "tcp",
           "security": "tls"
         }
       },
       {
         "port": 80,
         "protocol": "vmess",
         "settings": {
           "clients": [{"id": "uuid"}]
         },
         "streamSettings": {
           "network": "ws",
           "wsSettings": {
             "path": "/ws"
           }
         }
       }
     ]
   }
   ```

2. 动态端口
   ```json
   {
     "inbounds": [{
       "port": 10000-20000,
       "protocol": "vmess",
       "settings": {
         "clients": [{"id": "uuid"}],
         "detour": {
           "to": "dynamicPort"
         }
       }
     }],
     "inboundDetour": [{
       "protocol": "vmess",
       "port": "10000-20000",
       "tag": "dynamicPort",
       "settings": {},
       "allocate": {
         "strategy": "random",
         "concurrency": 3,
         "refresh": 5
       }
     }]
   }
   ```

## 4. 安全最佳实践

### 4.1 TLS配置
1. 证书配置
   - 使用Let's Encrypt免费证书
   - 定期自动更新证书
   - 使用强加密套件
   - 启用OCSP Stapling

2. 安全参数
   ```json
   {
     "streamSettings": {
       "security": "tls",
       "tlsSettings": {
         "alpn": ["h2", "http/1.1"],
         "certificates": [{
           "certificateFile": "/path/to/fullchain.crt",
           "keyFile": "/path/to/private.key"
         }],
         "minVersion": "1.2",
         "cipherSuites": "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
       }
     }
   }
   ```

### 4.2 访问控制
1. IP限制
   ```json
   {
     "routing": {
       "rules": [{
         "type": "field",
         "ip": ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
         "outboundTag": "block"
       }]
     }
   }
   ```

2. 协议限制
   ```json
   {
     "routing": {
       "rules": [{
         "type": "field",
         "protocol": ["bittorrent"],
         "outboundTag": "block"
       }]
     }
   }
   ```

## 5. 性能优化最佳实践

### 5.1 系统优化
1. 内核参数
   ```bash
   # TCP Fast Open
   echo 3 > /proc/sys/net/ipv4/tcp_fastopen

   # TCP BBR
   echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
   echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
   sysctl -p
   ```

2. 资源限制
   ```bash
   # 最大文件描述符
   ulimit -n 1000000
   ```

### 5.2 应用优化
1. 缓冲区设置
   ```json
   {
     "policy": {
       "levels": {
         "0": {
           "handshake": 4,
           "connIdle": 300,
           "uplinkOnly": 2,
           "downlinkOnly": 5,
           "bufferSize": 512
         }
       }
     }
   }
   ```

2. 并发优化
   ```json
   {
     "policy": {
       "system": {
         "statsInboundUplink": false,
         "statsInboundDownlink": false,
         "statsOutboundUplink": false,
         "statsOutboundDownlink": false
       }
     }
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
- [V2Ray基础架构](01_V2Ray基础架构.md)
- [V2Ray安装部署](02_V2Ray安装部署.md)
- [V2Ray配置详解](03_V2Ray配置详解.md)
- [V2Ray运维手册](04_V2Ray运维手册.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善最佳实践说明 