# Linux系统安全加固指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅已完成]

## 1. 账号安全

### 1.1 密码策略
1. 配置密码复杂度
```bash
# 编辑PAM配置文件
vi /etc/pam.d/system-auth

# 添加如下配置
password requisite pam_pwquality.so retry=3 minlen=12 dcredit=-1 ucredit=-1 ocredit=-1 lcredit=-1
```

2. 设置密码过期策略
```bash
# 编辑密码时效配置
vi /etc/login.defs

# 设置以下参数
PASS_MAX_DAYS   90  # 密码最长有效期
PASS_MIN_DAYS   7   # 两次修改密码的最小间隔
PASS_WARN_AGE   7   # 密码过期前警告天数
```

### 1.2 登录安全
1. 限制root远程登录
```bash
# 编辑SSH配置文件
vi /etc/ssh/sshd_config

# 设置以下参数
PermitRootLogin no
```

2. 配置登录失败锁定
```bash
# 编辑PAM配置
vi /etc/pam.d/sshd

# 添加如下配置
auth required pam_tally2.so deny=5 unlock_time=300 even_deny_root root_unlock_time=300
```

## 2. 文件系统安全

### 2.1 文件权限
1. 重要目录权限设置
```bash
# 设置关键目录权限
chmod 750 /etc/init.d
chmod 700 /etc/rc.d/init.d
chmod 644 /etc/passwd
chmod 000 /etc/shadow
chmod 644 /etc/group
chmod 000 /etc/gshadow
```

2. SUID/SGID控制
```bash
# 查找SUID文件
find / -perm -4000 -type f -exec ls -l {} \;

# 查找SGID文件
find / -perm -2000 -type f -exec ls -l {} \;

# 取消不必要的SUID权限
chmod u-s /path/to/file
```

### 2.2 磁盘分区
```bash
# 建议的分区方案
/boot     100MB-200MB
/         20GB-50GB
/var      10GB-30GB
/tmp      5GB-10GB
/home     根据需求
swap      物理内存的1-2倍
```

## 3. 服务安全

### 3.1 系统服务
1. 禁用不必要的服务
```bash
# 查看所有服务
systemctl list-unit-files

# 禁用不需要的服务
systemctl disable telnet.service
systemctl disable rsh.service
systemctl disable rlogin.service
systemctl disable rexec.service
```

2. 配置防火墙
```bash
# 启用防火墙
systemctl enable firewalld
systemctl start firewalld

# 配置基本规则
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### 3.2 网络安全
1. TCP Wrappers配置
```bash
# 编辑hosts.allow
vi /etc/hosts.allow
# 添加允许的IP
sshd: 192.168.1.0/24

# 编辑hosts.deny
vi /etc/hosts.deny
# 拒绝所有
ALL: ALL
```

2. 内核参数优化
```bash
# 编辑sysctl配置
vi /etc/sysctl.conf

# 添加安全配置
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
```

## 4. 审计与日志

### 4.1 审计配置
1. 启用审计服务
```bash
# 安装审计服务
yum install audit

# 启用服务
systemctl enable auditd
systemctl start auditd
```

2. 配置审计规则
```bash
# 编辑审计规则
vi /etc/audit/rules.d/audit.rules

# 添加规则示例
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /var/log/lastlog -p wa -k login
```

### 4.2 日志管理
1. 配置rsyslog
```bash
# 编辑rsyslog配置
vi /etc/rsyslog.conf

# 添加关键日志配置
auth,authpriv.*                 /var/log/auth.log
kern.*                         /var/log/kern.log
daemon.*                       /var/log/daemon.log
syslog.*                      /var/log/syslog
```

2. 日志轮转
```bash
# 编辑logrotate配置
vi /etc/logrotate.d/syslog

# 配置示例
/var/log/syslog
{
    rotate 7
    daily
    missingok
    notifempty
    delaycompress
    compress
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}
```

## 5. 系统监控

### 5.1 资源监控
1. 配置系统资源限制
```bash
# 编辑limits.conf
vi /etc/security/limits.conf

# 添加限制配置
*               soft    nproc           2048
*               hard    nproc           4096
*               soft    nofile          4096
*               hard    nofile          8192
```

2. 进程监控
```bash
# 安装监控工具
yum install sysstat

# 配置定时任务
crontab -e

# 添加监控任务
*/10 * * * * /usr/lib64/sa/sa1 1 1
0 * * * * /usr/lib64/sa/sa2 -A
```

### 5.2 入侵检测
1. 安装AIDE
```bash
# 安装AIDE
yum install aide

# 初始化数据库
aide --init
mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz

# 配置定期检查
crontab -e
0 5 * * * /usr/sbin/aide --check
```

## 6. 安全补丁

### 6.1 系统更新
1. 配置自动更新
```bash
# 安装自动更新工具
yum install yum-cron

# 配置自动更新
vi /etc/yum/yum-cron.conf

# 设置以下参数
download_updates = yes
apply_updates = yes
```

2. 更新策略
```bash
# 手动更新命令
yum check-update
yum update -y

# 只更新安全补丁
yum update --security
```

## 7. 应急响应

### 7.1 应急工具
1. 必备工具清单
```bash
# 系统工具
ps, top, netstat, lsof, strace

# 网络工具
tcpdump, wireshark, nmap

# 文件工具
find, grep, dd

# 内存工具
free, vmstat, swapon
```

2. 应急脚本示例
```bash
#!/bin/bash
# 系统应急信息收集脚本

echo "=== System Info ==="
uname -a
uptime

echo "=== Process Info ==="
ps aux --sort=-%cpu | head -10

echo "=== Network Info ==="
netstat -antup

echo "=== Login Info ==="
last | head -10

echo "=== File Change Info ==="
find /etc -mtime -1 -type f
```

### 7.2 应急预案
1. 入侵处置流程
   - 保存现场
   - 断开网络
   - 收集证据
   - 系统恢复
   - 加固防御
   - 总结报告

2. 系统备份策略
```bash
# 创建系统快照
tar -czf /backup/system-$(date +%Y%m%d).tar.gz /etc /var/log

# 数据库备份
mysqldump -u root -p --all-databases > /backup/mysql-$(date +%Y%m%d).sql
```

## 参考资料
1. CIS Benchmarks
2. NIST Security Guidelines
3. Linux Security Guide
4. DISA STIG 