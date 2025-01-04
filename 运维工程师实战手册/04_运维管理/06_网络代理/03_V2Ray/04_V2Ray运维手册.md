# V2Ray运维手册

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. 日常运维

### 1.1 服务管理
1. 启动服务
   ```bash
   systemctl start v2ray
   ```

2. 停止服务
   ```bash
   systemctl stop v2ray
   ```

3. 重启服务
   ```bash
   systemctl restart v2ray
   ```

4. 查看状态
   ```bash
   systemctl status v2ray
   ```

### 1.2 日志管理
1. 查看实时日志
   ```bash
   journalctl -u v2ray -f
   ```

2. 查看错误日志
   ```bash
   journalctl -u v2ray -p err
   ```

3. 日志轮转配置
   ```bash
   cat > /etc/logrotate.d/v2ray << EOF
   /var/log/v2ray/*.log {
       daily
       rotate 7
       missingok
       notifempty
       compress
       delaycompress
       create 0640 v2ray v2ray
   }
   EOF
   ```

### 1.3 配置管理
1. 配置文件检查
   ```bash
   v2ray test -config /usr/local/etc/v2ray/config.json
   ```

2. 配置文件备份
   ```bash
   cp /usr/local/etc/v2ray/config.json /usr/local/etc/v2ray/config.json.bak
   ```

3. 配置文件恢复
   ```bash
   cp /usr/local/etc/v2ray/config.json.bak /usr/local/etc/v2ray/config.json
   ```

## 2. 监控管理

### 2.1 系统监控
1. 进程监控
   ```bash
   ps aux | grep v2ray
   ```

2. 端口监控
   ```bash
   netstat -tulpn | grep v2ray
   ```

3. 资源监控
   ```bash
   # CPU使用率
   top -p $(pgrep v2ray)

   # 内存使用
   free -h

   # 磁盘使用
   df -h
   ```

### 2.2 流量监控
1. 流量统计
   ```bash
   v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats 'pattern: "" reset: false'
   ```

2. 连接统计
   ```bash
   netstat -anp | grep v2ray | wc -l
   ```

3. 带宽监控
   ```bash
   iftop -i eth0
   ```

## 3. 安全管理

### 3.1 权限管理
1. 文件权限
   ```bash
   # 配置文件权限
   chmod 644 /usr/local/etc/v2ray/config.json
   chown v2ray:v2ray /usr/local/etc/v2ray/config.json

   # 日志文件权限
   chmod 644 /var/log/v2ray/*.log
   chown v2ray:v2ray /var/log/v2ray/*.log
   ```

2. 进程权限
   ```bash
   # 查看进程权限
   ps aux | grep v2ray

   # 修改进程用户
   vim /etc/systemd/system/v2ray.service
   ```

### 3.2 防火墙管理
1. UFW配置
   ```bash
   # 开放端口
   ufw allow 10086/tcp

   # 删除规则
   ufw delete allow 10086/tcp

   # 查看规则
   ufw status
   ```

2. iptables配置
   ```bash
   # 开放端口
   iptables -A INPUT -p tcp --dport 10086 -j ACCEPT

   # 删除规则
   iptables -D INPUT -p tcp --dport 10086 -j ACCEPT

   # 查看规则
   iptables -L -n
   ```

## 4. 备份恢复

### 4.1 配置备份
1. 手动备份
   ```bash
   # 备份配置
   tar -czf v2ray_config_$(date +%Y%m%d).tar.gz /usr/local/etc/v2ray/

   # 备份证书
   tar -czf v2ray_certs_$(date +%Y%m%d).tar.gz /path/to/certs/
   ```

2. 自动备份脚本
   ```bash
   #!/bin/bash
   BACKUP_DIR="/backup/v2ray"
   DATE=$(date +%Y%m%d)

   # 创建备份目录
   mkdir -p $BACKUP_DIR

   # 备份配置文件
   tar -czf $BACKUP_DIR/v2ray_config_$DATE.tar.gz /usr/local/etc/v2ray/

   # 备份证书文件
   tar -czf $BACKUP_DIR/v2ray_certs_$DATE.tar.gz /path/to/certs/

   # 删除7天前的备份
   find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
   ```

### 4.2 配置恢复
1. 恢复配置
   ```bash
   # 解压配置
   tar -xzf v2ray_config_20240321.tar.gz -C /

   # 检查配置
   v2ray test -config /usr/local/etc/v2ray/config.json

   # 重启服务
   systemctl restart v2ray
   ```

2. 恢复证书
   ```bash
   # 解压证书
   tar -xzf v2ray_certs_20240321.tar.gz -C /

   # 检查权限
   chmod 644 /path/to/certs/*
   chown v2ray:v2ray /path/to/certs/*

   # 重启服务
   systemctl restart v2ray
   ```

## 5. 故障处理

### 5.1 常见故障
1. 服务无法启动
   - 检查配置文件语法
   - 检查端口占用
   - 检查系统资源
   - 查看错误日志

2. 连接失败
   - 检查网络连接
   - 验证服务状态
   - 确认防火墙规则
   - 测试端口可用性

3. 性能问题
   - 检查系统负载
   - 监控内存使用
   - 分析网络带宽
   - 优化配置参数

### 5.2 排查流程
1. 服务状态检查
   ```bash
   # 检查服务状态
   systemctl status v2ray

   # 查看错误日志
   journalctl -u v2ray -p err

   # 检查配置文件
   v2ray test -config /usr/local/etc/v2ray/config.json
   ```

2. 网络连接检查
   ```bash
   # 检查端口监听
   netstat -tulpn | grep v2ray

   # 测试端口连接
   telnet localhost 10086

   # 检查防火墙规则
   iptables -L -n | grep 10086
   ```

3. 性能分析
   ```bash
   # CPU使用率
   top -p $(pgrep v2ray)

   # 内存使用
   free -h

   # 网络连接数
   netstat -anp | grep v2ray | wc -l
   ```

## 6. 优化建议

### 6.1 系统优化
1. 内核参数优化
   ```bash
   cat >> /etc/sysctl.conf << EOF
   # 最大文件描述符
   fs.file-max = 1000000

   # TCP连接优化
   net.ipv4.tcp_max_tw_buckets = 6000
   net.ipv4.tcp_sack = 1
   net.ipv4.tcp_window_scaling = 1
   net.ipv4.tcp_rmem = 4096 87380 4194304
   net.ipv4.tcp_wmem = 4096 16384 4194304

   # 连接队列优化
   net.core.somaxconn = 32768
   net.core.netdev_max_backlog = 32768
   net.ipv4.tcp_max_syn_backlog = 16384
   net.ipv4.tcp_max_tw_buckets = 6000
   EOF

   # 应用参数
   sysctl -p
   ```

2. 资源限制优化
   ```bash
   cat >> /etc/security/limits.conf << EOF
   * soft nofile 1000000
   * hard nofile 1000000
   * soft nproc 65535
   * hard nproc 65535
   EOF
   ```

### 6.2 服务优化
1. 日志优化
   ```json
   {
     "log": {
       "loglevel": "warning",
       "access": "/var/log/v2ray/access.log",
       "error": "/var/log/v2ray/error.log"
     }
   }
   ```

2. 连接优化
   ```json
   {
     "policy": {
       "levels": {
         "0": {
           "handshake": 4,
           "connIdle": 300,
           "uplinkOnly": 2,
           "downlinkOnly": 5,
           "bufferSize": 10240
         }
       }
     }
   }
   ```

## 7. 相关文档
- [V2Ray基础架构](01_V2Ray基础架构.md)
- [V2Ray安装部署](02_V2Ray安装部署.md)
- [V2Ray配置详解](03_V2Ray配置详解.md)
- [V2Ray最佳实践](05_V2Ray最佳实践.md)

## 更新记录
- 2024-03-21: 创建文档
- 2024-03-21: 完善运维说明 