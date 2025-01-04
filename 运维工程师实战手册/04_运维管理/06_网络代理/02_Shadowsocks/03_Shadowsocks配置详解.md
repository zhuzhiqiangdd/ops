# Shadowsocks配置详解

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 配置文件结构

### 1.1 基本结构
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "local_address": "127.0.0.1",
  "local_port": 1080,
  "password": "your_password",
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": true,
  "workers": 1
}
```

### 1.2 配置项说明
1. server: 服务器地址
2. server_port: 服务器端口
3. local_address: 本地监听地址
4. local_port: 本地监听端口
5. password: 连接密码
6. timeout: 超时时间
7. method: 加密方法
8. fast_open: TCP快速打开
9. workers: 工作进程数

## 2. 服务端配置

### 2.1 基本配置
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": true,
  "workers": 1
}
```

### 2.2 多端口配置
```json
{
  "server": "0.0.0.0",
  "port_password": {
    "8381": "password1",
    "8382": "password2",
    "8383": "password3"
  },
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": true,
  "workers": 1
}
```

### 2.3 多用户配置
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
  "workers": 1
}
```

## 3. 客户端配置

### 3.1 基本配置
```json
{
  "server": "server_ip",
  "server_port": 8388,
  "local_address": "127.0.0.1",
  "local_port": 1080,
  "password": "your_password",
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": true
}
```

### 3.2 PAC配置
```json
{
  "server": "server_ip",
  "server_port": 8388,
  "local_address": "127.0.0.1",
  "local_port": 1080,
  "password": "your_password",
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": true,
  "pac": "/path/to/pac/file",
  "pac_update": true,
  "pac_url": "https://example.com/pac.txt"
}
```

### 3.3 多服务器配置
```json
{
  "server_password": [
    ["server1", 8381, "password1"],
    ["server2", 8382, "password2"],
    ["server3", 8383, "password3"]
  ],
  "local_address": "127.0.0.1",
  "local_port": 1080,
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": true
}
```

## 4. 加密配置

### 4.1 支持的加密方法
1. AEAD加密
   - aes-256-gcm
   - aes-192-gcm
   - aes-128-gcm
   - chacha20-ietf-poly1305
   - xchacha20-ietf-poly1305

2. 流加密
   - aes-256-cfb
   - aes-192-cfb
   - aes-128-cfb
   - chacha20-ietf
   - rc4-md5

### 4.2 加密配置示例
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "timeout": 300,
  "fast_open": true,
  "workers": 1,
  "prefer_ipv6": false,
  "no_delay": true
}
```

## 5. 插件配置

### 5.1 simple-obfs插件
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "plugin": "obfs-server",
  "plugin_opts": "obfs=http;obfs-host=www.example.com"
}
```

### 5.2 v2ray-plugin插件
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "plugin": "v2ray-plugin",
  "plugin_opts": "server;tls;host=example.com;path=/ws"
}
```

## 6. 高级配置

### 6.1 TCP优化
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "timeout": 300,
  "fast_open": true,
  "no_delay": true,
  "reuse_port": true,
  "mptcp": true
}
```

### 6.2 UDP转发
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "mode": "tcp_and_udp",
  "timeout": 300,
  "fast_open": true,
  "workers": 1
}
```

### 6.3 DNS配置
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "dns_server": ["8.8.8.8", "8.8.4.4"],
  "tunnel_address": "8.8.8.8:53",
  "timeout": 300
}
```

## 7. 管理配置

### 7.1 Manager API配置
```json
{
  "server": "0.0.0.0",
  "manager_address": "127.0.0.1",
  "manager_port": 6001,
  "password": "your_password",
  "method": "aes-256-gcm",
  "timeout": 300,
  "fast_open": true,
  "workers": 1
}
```

### 7.2 统计配置
```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your_password",
  "method": "aes-256-gcm",
  "timeout": 300,
  "fast_open": true,
  "workers": 1,
  "stat_callback": "/path/to/callback",
  "stat_interval": 10
}
```

## 8. 相关文档
- [Shadowsocks基础架构](01_Shadowsocks基础架构.md)
- [Shadowsocks安装部署](02_Shadowsocks安装部署.md)
- [Shadowsocks运维手册](04_Shadowsocks运维手册.md)
- [Shadowsocks最佳实践](05_Shadowsocks最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善配置说明 