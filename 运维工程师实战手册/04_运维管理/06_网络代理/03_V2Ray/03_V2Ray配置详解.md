# V2Ray配置详解

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 配置文件结构

### 1.1 基本结构
```json
{
  "log": {},
  "api": {},
  "dns": {},
  "routing": {},
  "policy": {},
  "inbounds": [],
  "outbounds": [],
  "transport": {},
  "stats": {},
  "reverse": {}
}
```

### 1.2 配置项说明
1. log: 日志配置
2. api: API配置
3. dns: DNS配置
4. routing: 路由配置
5. policy: 策略配置
6. inbounds: 入站配置
7. outbounds: 出站配置
8. transport: 传输配置
9. stats: 统计配置
10. reverse: 反向代理配置

## 2. 日志配置

### 2.1 基本配置
```json
{
  "log": {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "warning"
  }
}
```

### 2.2 日志级别
- debug: 调试信息
- info: 一般信息
- warning: 警告信息
- error: 错误信息
- none: 不记录日志

## 3. 入站配置

### 3.1 VMess协议
```json
{
  "inbounds": [{
    "port": 10086,
    "protocol": "vmess",
    "settings": {
      "clients": [{
        "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
        "alterId": 0,
        "email": "user@example.com"
      }]
    },
    "streamSettings": {
      "network": "tcp"
    }
  }]
}
```

### 3.2 VLESS协议
```json
{
  "inbounds": [{
    "port": 443,
    "protocol": "vless",
    "settings": {
      "clients": [{
        "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
        "flow": "xtls-rprx-direct"
      }],
      "decryption": "none",
      "fallbacks": []
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

### 3.3 Shadowsocks协议
```json
{
  "inbounds": [{
    "port": 8388,
    "protocol": "shadowsocks",
    "settings": {
      "method": "aes-256-gcm",
      "password": "your_password",
      "network": "tcp,udp"
    }
  }]
}
```

### 3.4 Trojan协议
```json
{
  "inbounds": [{
    "port": 443,
    "protocol": "trojan",
    "settings": {
      "clients": [{
        "password": "your_password"
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "tls",
      "tlsSettings": {
        "certificates": [{
          "certificateFile": "/path/to/fullchain.crt",
          "keyFile": "/path/to/private.key"
        }]
      }
    }
  }]
}
```

## 4. 出站配置

### 4.1 直连配置
```json
{
  "outbounds": [{
    "protocol": "freedom",
    "settings": {}
  }]
}
```

### 4.2 代理配置
```json
{
  "outbounds": [{
    "protocol": "vmess",
    "settings": {
      "vnext": [{
        "address": "example.com",
        "port": 443,
        "users": [{
          "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
          "alterId": 0,
          "security": "auto"
        }]
      }]
    },
    "streamSettings": {
      "network": "ws",
      "security": "tls",
      "wsSettings": {
        "path": "/ws"
      }
    }
  }]
}
```

### 4.3 黑洞配置
```json
{
  "outbounds": [{
    "protocol": "blackhole",
    "settings": {}
  }]
}
```

## 5. 路由配置

### 5.1 基本路由
```json
{
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [{
      "type": "field",
      "domain": ["geosite:category-ads"],
      "outboundTag": "block"
    }]
  }
}
```

### 5.2 高级路由
```json
{
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
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
        "domain": ["geosite:category-ads"],
        "outboundTag": "block"
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

## 6. 传输配置

### 6.1 TCP配置
```json
{
  "streamSettings": {
    "network": "tcp",
    "tcpSettings": {
      "header": {
        "type": "http",
        "request": {
          "version": "1.1",
          "method": "GET",
          "path": ["/"],
          "headers": {
            "Host": ["www.example.com"]
          }
        }
      }
    }
  }
}
```

### 6.2 WebSocket配置
```json
{
  "streamSettings": {
    "network": "ws",
    "wsSettings": {
      "path": "/ws",
      "headers": {
        "Host": "www.example.com"
      }
    }
  }
}
```

### 6.3 HTTP/2配置
```json
{
  "streamSettings": {
    "network": "http",
    "httpSettings": {
      "path": "/",
      "host": ["www.example.com"]
    }
  }
}
```

### 6.4 QUIC配置
```json
{
  "streamSettings": {
    "network": "quic",
    "quicSettings": {
      "security": "none",
      "key": "",
      "header": {
        "type": "none"
      }
    }
  }
}
```

## 7. DNS配置

### 7.1 基本DNS
```json
{
  "dns": {
    "servers": [
      "1.1.1.1",
      "8.8.8.8",
      "localhost"
    ]
  }
}
```

### 7.2 高级DNS
```json
{
  "dns": {
    "hosts": {
      "domain:example.com": "1.2.3.4"
    },
    "servers": [
      {
        "address": "1.1.1.1",
        "port": 53,
        "domains": [
          "geosite:geolocation-!cn"
        ]
      },
      {
        "address": "223.5.5.5",
        "port": 53,
        "domains": [
          "geosite:cn"
        ]
      }
    ]
  }
}
```

## 8. 策略配置

### 8.1 系统策略
```json
{
  "policy": {
    "system": {
      "statsInboundUplink": true,
      "statsInboundDownlink": true,
      "statsOutboundUplink": true,
      "statsOutboundDownlink": true
    }
  }
}
```

### 8.2 级别策略
```json
{
  "policy": {
    "levels": {
      "0": {
        "handshake": 4,
        "connIdle": 300,
        "uplinkOnly": 2,
        "downlinkOnly": 5,
        "statsUserUplink": true,
        "statsUserDownlink": true,
        "bufferSize": 10240
      }
    }
  }
}
```

## 9. 统计配置

### 9.1 启用统计
```json
{
  "stats": {},
  "api": {
    "tag": "api",
    "services": [
      "StatsService"
    ]
  },
  "policy": {
    "system": {
      "statsInboundUplink": true,
      "statsInboundDownlink": true
    }
  },
  "inbounds": [
    {
      "tag": "api",
      "port": 10085,
      "listen": "127.0.0.1",
      "protocol": "dokodemo-door",
      "settings": {
        "address": "127.0.0.1"
      }
    }
  ]
}
```

## 10. 相关文档
- [V2Ray基础架构](01_V2Ray基础架构.md)
- [V2Ray安装部署](02_V2Ray安装部署.md)
- [V2Ray运维手册](04_V2Ray运维手册.md)
- [V2Ray最佳实践](05_V2Ray最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善配置说明 