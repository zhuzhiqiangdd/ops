# OpenVPN运维手册

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 日常运维操作

### 1.1 服务管理
```bash
# 启动服务
systemctl start openvpn@server

# 停止服务
systemctl stop openvpn@server

# 重启服务
systemctl restart openvpn@server

# 查看服务状态
systemctl status openvpn@server

# 设置开机自启
systemctl enable openvpn@server
```

### 1.2 证书管理
```bash
# 查看证书有效期
openssl x509 -in /etc/openvpn/server/server.crt -noout -dates

# 吊销客户端证书
cd /etc/openvpn/easy-rsa/
./easyrsa revoke client1
./easyrsa gen-crl

# 更新CRL
cp pki/crl.pem /etc/openvpn/server/

# 创建新客户端证书
./easyrsa build-client-full client2 nopass
```

### 1.3 用户管理
```bash
# 添加用户
echo "username1,password1" >> /etc/openvpn/psw-file

# 删除用户
sed -i '/username1/d' /etc/openvpn/psw-file

# 修改密码
sed -i 's/username1,old_password/username1,new_password/' /etc/openvpn/psw-file
```

## 2. 备份与恢复

### 2.1 配置备份
```bash
# 备份整个配置目录
tar czf openvpn-config-$(date +%Y%m%d).tar.gz /etc/openvpn/

# 备份证书
tar czf openvpn-certs-$(date +%Y%m%d).tar.gz /etc/openvpn/easy-rsa/pki/

# 备份用户数据
cp /etc/openvpn/psw-file /backup/psw-file-$(date +%Y%m%d)
```

### 2.2 配置恢复
```bash
# 恢复配置目录
tar xzf openvpn-config-20240321.tar.gz -C /

# 恢复证书
tar xzf openvpn-certs-20240321.tar.gz -C /

# 恢复用户数据
cp /backup/psw-file-20240321 /etc/openvpn/psw-file
```

## 3. 日志管理

### 3.1 日志轮转配置
```bash
# /etc/logrotate.d/openvpn
/var/log/openvpn/*.log {
    weekly
    rotate 52
    compress
    delaycompress
    notifempty
    missingok
    create 640 nobody nobody
    postrotate
        /bin/systemctl reload openvpn@server > /dev/null 2>&1 || true
    endscript
}
```

### 3.2 日志分析
```bash
# 查看连接日志
grep "client connected" /var/log/openvpn/openvpn.log

# 查看认证失败
grep "AUTH_FAILED" /var/log/openvpn/openvpn.log

# 查看IP分配
grep "pool returned" /var/log/openvpn/openvpn.log

# 统计连接数
grep "client connected" /var/log/openvpn/openvpn.log | wc -l
```

## 4. 网络管理

### 4.1 网络诊断
```bash
# 检查监听端口
netstat -lnup | grep openvpn

# 检查路由表
ip route show table all

# 检查iptables规则
iptables -L -n -v | grep -i openvpn

# 检查网络接口
ip addr show tun0
```

### 4.2 流量控制
```bash
# 限制带宽
tc qdisc add dev tun0 root tbf rate 1mbit burst 32kbit latency 400ms

# 查看流量统计
iptables -L -n -v | grep -i openvpn
```

## 5. 性能管理

### 5.1 资源监控
```bash
# 查看CPU使用
top -p $(pgrep openvpn)

# 查看内存使用
ps -o pid,ppid,%mem,rss,cmd -p $(pgrep openvpn)

# 查看文件描述符
lsof -p $(pgrep openvpn)

# 查看网络连接
netstat -anp | grep openvpn
```

### 5.2 性能优化
```bash
# 系统参数优化
cat >> /etc/sysctl.conf << EOF
net.ipv4.ip_forward = 1
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
EOF

sysctl -p
```

## 6. 安全管理

### 6.1 证书维护
1. 定期更新证书
```bash
# 检查证书过期时间
for cert in /etc/openvpn/easy-rsa/pki/issued/*.crt; do
    echo "$cert:"
    openssl x509 -in "$cert" -noout -dates
done
```

2. 证书吊销
```bash
# 吊销证书
./easyrsa revoke client1
./easyrsa gen-crl
cp pki/crl.pem /etc/openvpn/server/
```

### 6.2 访问控制
```bash
# 添加IP限制
iptables -A INPUT -p udp --dport 1194 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p udp --dport 1194 -j DROP

# 保存规则
iptables-save > /etc/iptables/rules.v4
```

## 7. 故障处理

### 7.1 常见问题排查
1. 连接失败
```bash
# 检查服务状态
systemctl status openvpn@server

# 检查端口
netstat -lnup | grep 1194

# 检查日志
tail -f /var/log/openvpn/openvpn.log
```

2. 认证问题
```bash
# 检查证书
openssl verify -CAfile /etc/openvpn/server/ca.crt /etc/openvpn/server/server.crt

# 检查权限
ls -l /etc/openvpn/server/
```

### 7.2 性能问题排查
```bash
# CPU使用率高
top -H -p $(pgrep openvpn)

# 内存泄漏
watch -n 1 'ps -o pid,ppid,%mem,rss,cmd -p $(pgrep openvpn)'

# 网络延迟
ping -c 10 10.8.0.1
```

## 8. 维护计划

### 8.1 日常维护
1. 每日任务
   - 检查服务状态
   - 查看错误日志
   - 监控连接数

2. 每周任务
   - 分析日志文件
   - 检查证书状态
   - 备份配置文件

3. 每月任务
   - 更新CRL
   - 清理过期证书
   - 系统性能优化

### 8.2 应急预案
1. 服务中断
   - 检查系统日志
   - 重启服务
   - 切换备用节点

2. 安全事件
   - 吊销可疑证书
   - 更新防火墙规则
   - 通知相关用户

## 9. 相关文档
- [OpenVPN基础架构](01_OpenVPN基础架构.md)
- [OpenVPN配置详解](03_OpenVPN配置详解.md)
- [OpenVPN最佳实践](05_OpenVPN最佳实践.md)
- [OpenVPN故障处理](10_OpenVPN故障处理.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善运维操作指南 