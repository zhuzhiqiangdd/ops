# Shadowsocks安装部署

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 环境要求

### 1.1 系统要求
- 操作系统: Linux/Windows/macOS
- 内存: 最低64MB
- CPU: 不低于x86/ARM
- 磁盘空间: 最少10MB

### 1.2 网络要求
- 开放端口: 根据配置自定义
- 网络协议: TCP/UDP支持
- 带宽建议: ≥1Mbps
- 公网IP(必需)

### 1.3 依赖组件
- Python 3.x
- pip包管理器
- OpenSSL
- libsodium

## 2. 安装步骤

### 2.1 Linux系统安装

#### 2.1.1 包管理器安装
```bash
# CentOS/RHEL
yum install epel-release
yum install python3-pip
pip3 install shadowsocks

# Ubuntu/Debian
apt update
apt install python3-pip
pip3 install shadowsocks
```

#### 2.1.2 源码安装
```bash
# 安装依赖
apt install python3 python3-pip python3-setuptools
apt install build-essential autoconf libtool libssl-dev libpcre3-dev asciidoc xmlto

# 下载源码
git clone https://github.com/shadowsocks/shadowsocks.git
cd shadowsocks

# 安装
python3 setup.py install
```

#### 2.1.3 Docker安装
```bash
# 拉取镜像
docker pull shadowsocks/shadowsocks-libev

# 运行容器
docker run -d \
  --name ss-server \
  -p 8388:8388 \
  -p 8388:8388/udp \
  shadowsocks/shadowsocks-libev \
  ss-server -s 0.0.0.0 \
  -p 8388 \
  -k your_password \
  -m aes-256-gcm
```

### 2.2 Windows系统安装

#### 2.2.1 图形界面安装
1. 下载Shadowsocks-Windows
   - 访问GitHub发布页
   - 下载最新版本zip包
   - 解压到指定目录

2. 配置步骤
   - 运行Shadowsocks.exe
   - 配置服务器信息
   - 启用系统代理

#### 2.2.2 命令行安装
```powershell
# 安装Python
choco install python

# 安装Shadowsocks
pip install shadowsocks
```

### 2.3 macOS系统安装

#### 2.3.1 Homebrew安装
```bash
# 安装Shadowsocks
brew install shadowsocks-libev

# 启动服务
brew services start shadowsocks-libev
```

#### 2.3.2 源码安装
```bash
# 安装依赖
brew install python3

# 安装Shadowsocks
pip3 install shadowsocks
```

## 3. 配置示例

### 3.1 服务端配置
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

### 3.2 客户端配置
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

### 3.3 多用户配置
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

## 4. 服务管理

### 4.1 Linux服务管理
1. 创建systemd服务
```bash
cat > /etc/systemd/system/shadowsocks.service << EOF
[Unit]
Description=Shadowsocks Server
After=network.target

[Service]
Type=simple
User=nobody
ExecStart=/usr/local/bin/ssserver -c /etc/shadowsocks/config.json
Restart=on-abort

[Install]
WantedBy=multi-user.target
EOF
```

2. 服务操作
```bash
# 启动服务
systemctl start shadowsocks

# 停止服务
systemctl stop shadowsocks

# 重启服务
systemctl restart shadowsocks

# 查看状态
systemctl status shadowsocks

# 设置开机启动
systemctl enable shadowsocks
```

### 4.2 日志管理
```bash
# 查看系统日志
journalctl -u shadowsocks

# 实时查看日志
journalctl -u shadowsocks -f

# 查看错误日志
journalctl -u shadowsocks -p err
```

## 5. 验证测试

### 5.1 服务状态检查
```bash
# 检查进程
ps aux | grep ssserver

# 检查端口
netstat -tulpn | grep ssserver

# 检查配置
ssserver -c /etc/shadowsocks/config.json --test
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
ssserver -c /etc/shadowsocks/config.json --test

# 检查端口占用
lsof -i :端口号

# 检查防火墙规则
iptables -L -n | grep 端口号

# DNS解析测试
dig 域名
```

## 7. 相关文档
- [Shadowsocks基础架构](01_Shadowsocks基础架构.md)
- [Shadowsocks配置详解](03_Shadowsocks配置详解.md)
- [Shadowsocks运维手册](04_Shadowsocks运维手册.md)
- [Shadowsocks最佳实践](05_Shadowsocks最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善安装部署说明 