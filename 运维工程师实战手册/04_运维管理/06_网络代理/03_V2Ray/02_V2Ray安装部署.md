# V2Ray安装部署

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 环境要求

### 1.1 系统要求
- 操作系统: Linux/Windows/macOS
- 内存: 最低128MB
- CPU: 不低于x86/ARM
- 磁盘空间: 最少50MB

### 1.2 网络要求
- 开放端口: 根据配置自定义
- 网络协议: TCP/UDP支持
- 带宽建议: ≥1Mbps
- 公网IP或域名(可选)

### 1.3 依赖组件
- systemd (Linux)
- curl/wget
- unzip/tar
- ca-certificates

## 2. 安装步骤

### 2.1 Linux系统安装

#### 2.1.1 官方脚本安装
```bash
# 下载安装脚本
curl -O https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh

# 安装V2Ray
bash install-release.sh

# 验证安装
systemctl status v2ray
```

#### 2.1.2 手动安装
```bash
# 下载V2Ray
wget https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-linux-64.zip

# 解压文件
unzip v2ray-linux-64.zip -d /usr/local/v2ray/

# 创建配置目录
mkdir -p /usr/local/etc/v2ray/

# 复制配置文件
cp /usr/local/v2ray/config.json /usr/local/etc/v2ray/

# 创建systemd服务
cat > /etc/systemd/system/v2ray.service << EOF
[Unit]
Description=V2Ray Service
Documentation=https://www.v2fly.org/
After=network.target nss-lookup.target

[Service]
User=nobody
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/v2ray/v2ray -config /usr/local/etc/v2ray/config.json
Restart=on-failure
RestartPreventExitStatus=23

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl enable v2ray
systemctl start v2ray
```

### 2.2 Windows系统安装

#### 2.2.1 图形界面安装
1. 下载V2RayN
   - 访问官方GitHub发布页
   - 下载最新版本zip包
   - 解压到指定目录

2. 配置步骤
   - 运行v2rayN.exe
   - 导入或配置服务器信息
   - 设置系统代理

#### 2.2.2 命令行安装
```powershell
# 下载V2Ray
Invoke-WebRequest -Uri "https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-windows-64.zip" -OutFile "v2ray.zip"

# 解压文件
Expand-Archive v2ray.zip -DestinationPath C:\v2ray

# 创建配置文件
Copy-Item C:\v2ray\config.json.example C:\v2ray\config.json

# 启动服务
Start-Process C:\v2ray\v2ray.exe -ArgumentList "-config C:\v2ray\config.json"
```

### 2.3 macOS系统安装

#### 2.3.1 Homebrew安装
```bash
# 安装V2Ray
brew install v2ray

# 启动服务
brew services start v2ray
```

#### 2.3.2 手动安装
```bash
# 下载V2Ray
curl -L -o v2ray-macos.zip https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-macos-64.zip

# 解压文件
unzip v2ray-macos.zip -d /usr/local/v2ray/

# 创建配置目录
mkdir -p /usr/local/etc/v2ray/

# 复制配置文件
cp /usr/local/v2ray/config.json /usr/local/etc/v2ray/

# 启动服务
/usr/local/v2ray/v2ray -config /usr/local/etc/v2ray/config.json
```

## 3. 配置示例

### 3.1 服务端配置
```json
{
  "inbounds": [{
    "port": 10086,
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
          "alterId": 0
        }
      ]
    }
  }],
  "outbounds": [{
    "protocol": "freedom",
    "settings": {}
  }]
}
```

### 3.2 客户端配置
```json
{
  "inbounds": [{
    "port": 1080,
    "protocol": "socks",
    "sniffing": {
      "enabled": true,
      "destOverride": ["http", "tls"]
    },
    "settings": {
      "auth": "noauth"
    }
  }],
  "outbounds": [{
    "protocol": "vmess",
    "settings": {
      "vnext": [{
        "address": "server.com",
        "port": 10086,
        "users": [{
          "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
          "alterId": 0
        }]
      }]
    }
  }]
}
```

## 4. 服务管理

### 4.1 Linux服务管理
```bash
# 启动服务
systemctl start v2ray

# 停止服务
systemctl stop v2ray

# 重启服务
systemctl restart v2ray

# 查看状态
systemctl status v2ray

# 设置开机启动
systemctl enable v2ray

# 取消开机启动
systemctl disable v2ray
```

### 4.2 日志查看
```bash
# 查看系统日志
journalctl -u v2ray

# 实时查看日志
journalctl -u v2ray -f

# 查看错误日志
journalctl -u v2ray -p err
```

## 5. 验证测试

### 5.1 服务状态检查
```bash
# 检查进程
ps aux | grep v2ray

# 检查端口
netstat -tulpn | grep v2ray

# 检查配置
/usr/local/bin/v2ray test -config /usr/local/etc/v2ray/config.json
```

### 5.2 连接测试
```bash
# 使用curl测试
curl -x socks5://127.0.0.1:1080 http://www.google.com

# 使用wget测试
wget -e "https_proxy=http://127.0.0.1:1080" https://www.google.com
```

## 6. 故障排查

### 6.1 常见问题
1. 服务无法启动
   - 检查配置文件语法
   - 检查端口占用
   - 检查权限设置
   - 查看错误日志

2. 连接失败
   - 检查网络连接
   - 验证服务器地址
   - 确认端口开放
   - 检查防火墙设置

### 6.2 排查命令
```bash
# 检查配置文件
v2ray test -config /usr/local/etc/v2ray/config.json

# 检查端口占用
lsof -i :端口号

# 检查防火墙规则
iptables -L -n | grep 端口号

# DNS解析测试
dig 域名
```

## 7. 相关文档
- [V2Ray基础架构](01_V2Ray基础架构.md)
- [V2Ray配置详解](03_V2Ray配置详解.md)
- [V2Ray运维手册](04_V2Ray运维手册.md)
- [V2Ray最佳实践](05_V2Ray最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善安装部署说明 