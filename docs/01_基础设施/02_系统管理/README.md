# 系统管理

## 用户管理

### 用户操作

```bash
# 创建用户
useradd username
useradd -m -s /bin/bash username  # 创建用户并指定shell

# 设置密码
passwd username

# 修改用户
usermod -aG sudo username  # 添加到sudo组
usermod -s /bin/bash username  # 修改shell

# 删除用户
userdel username
userdel -r username  # 同时删除用户目录
```

### 组管理

```bash
# 创建组
groupadd groupname

# 修改组
groupmod -n new_name old_name

# 删除组
groupdel groupname

# 查看组
groups username  # 查看用户所属组
cat /etc/group  # 查看所有组
```

## 服务管理

### Systemd 服务

```bash
# 服务操作
systemctl start service_name   # 启动服务
systemctl stop service_name    # 停止服务
systemctl restart service_name # 重启服务
systemctl status service_name  # 查看服务状态

# 服务启动项
systemctl enable service_name  # 设置开机启动
systemctl disable service_name # 禁止开机启动
systemctl is-enabled service_name # 查看是否开机启动
```

### 服务配置示例

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myapp
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## 日志管理

### 系统日志

```bash
# 查看系统日志
journalctl                    # 查看所有日志
journalctl -u service_name    # 查看指定服务的日志
journalctl -f                 # 实时查看日志
journalctl --since "1 hour ago" # 查看最近一小时的日志
```

### 应用日志

常见日志位置：
```bash
/var/log/syslog      # 系统日志
/var/log/auth.log    # 认证日志
/var/log/kern.log    # 内核日志
/var/log/apache2/    # Apache日志
/var/log/nginx/      # Nginx日志
```

### 日志轮转

```bash
# /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 myapp myapp
    postrotate
        systemctl reload myapp
    endscript
}
```

## 任务调度

### Cron 任务

```bash
# 编辑crontab
crontab -e

# crontab格式
# 分 时 日 月 周 命令
0 2 * * * /scripts/backup.sh  # 每天2点执行
*/15 * * * * /scripts/check.sh # 每15分钟执行
0 0 * * 0 /scripts/weekly.sh  # 每周日0点执行
```

### 系统定时任务

```bash
# /etc/cron.d/myapp
# 分 时 日 月 周 用户 命令
0 4 * * * root /usr/local/bin/backup.sh
```

## 性能监控

### 系统资源监控

```bash
# CPU监控
top
htop
mpstat

# 内存监控
free -h
vmstat
slabtop

# 磁盘监控
iostat
iotop
df -h
du -sh /*
```

### 网络监控

```bash
# 网络流量
iftop
nethogs
iptraf-ng

# 连接状态
netstat -tunlp
ss -tunlp
lsof -i
```

## 系统优化

### 系统参数优化

```bash
# /etc/sysctl.conf
# 最大文件描述符
fs.file-max = 655350

# TCP连接参数
net.ipv4.tcp_max_syn_backlog = 8192
net.core.somaxconn = 32768

# 虚拟内存参数
vm.swappiness = 10
```

### 资源限制

```bash
# /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
```

## 备份策略

### 数据备份

```bash
#!/bin/bash
# backup.sh

# 备份目录
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d)

# 创建备份
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /data/

# 保留最近30天的备份
find $BACKUP_DIR -name "data_*.tar.gz" -mtime +30 -delete
```

### 数据恢复

```bash
#!/bin/bash
# restore.sh

# 解压备份
tar -xzf backup.tar.gz -C /restore/

# 恢复权限
chown -R user:group /restore/
chmod -R 755 /restore/
```

## 安全加固

### 基本安全配置

```bash
# SSH安全
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
Port 2222

# 防火墙配置
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 禁用不必要的服务
systemctl disable telnet
systemctl disable rsh
```

### 安全审计

```bash
# 查看登录记录
last
lastb  # 失败的登录

# 查看认证日志
tail -f /var/log/auth.log

# 查看系统日志
tail -f /var/log/syslog
```

## 故障排查

### 常见问题排查

1. CPU负载高
```bash
# 查看进程CPU使用率
top
ps aux --sort=-%cpu

# 查看系统负载
uptime
cat /proc/loadavg
```

2. 内存使用高
```bash
# 查看内存使用
free -h
ps aux --sort=-%mem

# 查看内存详情
vmstat 1
```

3. 磁盘空间不足
```bash
# 查看磁盘使用
df -h
du -sh /*

# 查找大文件
find / -type f -size +100M
```

4. 网络连接问题
```bash
# 检查网络连接
ping gateway
traceroute hostname

# 查看网络状态
netstat -tunlp
ss -tunlp
```

<Vssue title="系统管理" /> 