# HAProxy故障处理

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、常见故障

### 1.1 启动故障
1. 配置错误
```plaintext
# 故障现象
- 服务无法启动
- 配置检查失败
- 日志报错配置相关错误

# 排查方法
1. 检查配置文件语法
   haproxy -c -f /etc/haproxy/haproxy.cfg

2. 检查配置文件权限
   ls -l /etc/haproxy/haproxy.cfg

3. 检查错误日志
   tail -f /var/log/haproxy/error.log

# 解决方案
1. 修复配置语法错误
2. 调整文件权限
3. 重启服务验证
```

2. 端口冲突
```plaintext
# 故障现象
- 服务启动失败
- 端口已被占用
- 日志报错端口相关错误

# 排查方法
1. 检查端口占用
   netstat -tlnp | grep <port>
   lsof -i :<port>

2. 检查进程状态
   ps aux | grep haproxy

# 解决方案
1. 停止占用端口的进程
2. 修改HAProxy配置使用其他端口
3. 重启服务验证
```

### 1.2 连接故障
1. 连接超时
```plaintext
# 故障现象
- 客户端连接超时
- 后端连接超时
- 响应时间过长

# 排查方法
1. 检查网络连通性
   ping <backend_server>
   telnet <backend_server> <port>

2. 检查超时配置
   grep timeout /etc/haproxy/haproxy.cfg

3. 检查后端服务状态
   echo "show servers state" | socat stdio /var/run/haproxy.sock

# 解决方案
1. 调整超时参数
   timeout connect 5s
   timeout client 30s
   timeout server 30s

2. 优化网络配置
3. 检查后端服务性能
```

2. 连接拒绝
```plaintext
# 故障现象
- 连接被拒绝
- ACL规则阻止
- SSL握手失败

# 排查方法
1. 检查ACL规则
   grep 'acl' /etc/haproxy/haproxy.cfg

2. 检查SSL配置
   openssl s_client -connect <host>:<port>

3. 检查访问日志
   tail -f /var/log/haproxy/access.log

# 解决方案
1. 调整ACL规则
2. 修复SSL配置
3. 检查证书有效性
```

### 1.3 性能故障
1. 高负载
```plaintext
# 故障现象
- CPU使用率高
- 内存使用率高
- 响应延迟大

# 排查方法
1. 检查系统负载
   top
   vmstat 1
   iostat -x 1

2. 检查连接状态
   netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'

3. 检查HAProxy统计
   echo "show stat" | socat stdio /var/run/haproxy.sock

# 解决方案
1. 调整进程数
   nbproc 4
   nbthread 4

2. 优化系统参数
   net.core.somaxconn = 65536
   net.ipv4.tcp_max_syn_backlog = 65536

3. 考虑扩容
```

2. 内存泄漏
```plaintext
# 故障现象
- 内存持续增长
- 服务不稳定
- OOM Kill

# 排查方法
1. 监控内存使用
   free -m
   ps aux | grep haproxy

2. 检查系统日志
   dmesg | grep -i kill
   journalctl -xe

# 解决方案
1. 升级HAProxy版本
2. 调整内存限制
3. 定期重启服务
```

## 二、故障预防

### 2.1 配置检查
1. 启动前检查
```bash
#!/bin/bash
# 配置检查脚本

# 检查配置文件语法
haproxy -c -f /etc/haproxy/haproxy.cfg

# 检查配置文件权限
check_permissions() {
    local config_file="/etc/haproxy/haproxy.cfg"
    if [ ! -r "$config_file" ]; then
        echo "Error: Cannot read config file"
        exit 1
    fi
}

# 检查必要目录
check_directories() {
    local dirs=("/var/log/haproxy" "/run/haproxy")
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            chown haproxy:haproxy "$dir"
        fi
    done
}

# 检查证书
check_certificates() {
    local cert_dir="/etc/haproxy/certs"
    if [ -d "$cert_dir" ]; then
        for cert in "$cert_dir"/*.pem; do
            openssl x509 -in "$cert" -noout -checkend 2592000 || \
                echo "Warning: Certificate $cert will expire soon"
        done
    fi
}

# 主函数
main() {
    check_permissions
    check_directories
    check_certificates
}

main
```

2. 运行时检查
```bash
#!/bin/bash
# 运行时检查脚本

# 检查进程状态
check_process() {
    if ! pgrep haproxy > /dev/null; then
        echo "Error: HAProxy process not running"
        exit 1
    fi
}

# 检查端口状态
check_ports() {
    local ports=(80 443 8404)
    for port in "${ports[@]}"; do
        if ! netstat -tlnp | grep -q ":$port"; then
            echo "Warning: Port $port not listening"
        fi
    done
}

# 检查后端状态
check_backends() {
    echo "show servers state" | socat stdio /var/run/haproxy.sock | \
        awk '$6 != "2" {print "Warning: Server",$2,"in backend",$1,"is not UP"}'
}

# 检查资源使用
check_resources() {
    # CPU使用率
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "Warning: High CPU usage: $cpu_usage%"
    fi
    
    # 内存使用率
    local mem_usage=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    if (( $(echo "$mem_usage > 80" | bc -l) )); then
        echo "Warning: High memory usage: $mem_usage%"
    fi
}

# 主函数
main() {
    check_process
    check_ports
    check_backends
    check_resources
}

main
```

### 2.2 性能优化
1. 系统优化
```bash
#!/bin/bash
# 系统优化脚本

# 内核参数优化
optimize_kernel() {
    cat > /etc/sysctl.d/99-haproxy.conf << EOF
# 网络优化
net.ipv4.tcp_max_syn_backlog = 65536
net.core.somaxconn = 65536
net.ipv4.tcp_max_tw_buckets = 1440000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl = 15

# 内存优化
net.ipv4.tcp_mem = 94500000 915000000 927000000
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 87380 16777216
EOF

    sysctl -p /etc/sysctl.d/99-haproxy.conf
}

# 资源限制优化
optimize_limits() {
    cat > /etc/security/limits.d/haproxy.conf << EOF
haproxy soft nofile 65536
haproxy hard nofile 65536
haproxy soft nproc 65536
haproxy hard nproc 65536
EOF
}

# 主函数
main() {
    optimize_kernel
    optimize_limits
}

main
```

2. HAProxy优化
```haproxy
# HAProxy性能优化配置

global
    # 进程优化
    nbproc 4
    nbthread 4
    cpu-map auto:1/1-4 0-3
    
    # 连接优化
    maxconn 100000
    maxsslconn 40000
    
    # SSL优化
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
    tune.ssl.default-dh-param 2048
    tune.ssl.cachesize 20000
    tune.ssl.lifetime 300

defaults
    # 模式设置
    mode http
    
    # 超时优化
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    timeout http-keep-alive 60s
    timeout http-request 10s
    timeout queue 5s
    
    # 连接优化
    option http-server-close
    option http-pretend-keepalive
    
    # 缓冲优化
    tune.bufsize 32768
    tune.maxrewrite 1024
    tune.rcvbuf.client 32768
    tune.rcvbuf.server 32768
    tune.sndbuf.client 32768
    tune.sndbuf.server 32768
```

## 三、故障恢复

### 3.1 备份恢复
1. 配置备份
```bash
#!/bin/bash
# 配置备份脚本

# 变量定义
BACKUP_DIR="/backup/haproxy"
CONFIG_DIR="/etc/haproxy"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
backup_config() {
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份配置文件
    tar czf "$BACKUP_DIR/haproxy_config_$DATE.tar.gz" "$CONFIG_DIR"
    
    # 保留30天备份
    find "$BACKUP_DIR" -name "haproxy_config_*.tar.gz" -mtime +30 -delete
}

# 恢复配置
restore_config() {
    local backup_file="$1"
    if [ -f "$backup_file" ]; then
        # 停止服务
        systemctl stop haproxy
        
        # 备份当前配置
        mv "$CONFIG_DIR" "${CONFIG_DIR}_old_$DATE"
        
        # 恢复配置
        tar xzf "$backup_file" -C /
        
        # 检查配置
        if haproxy -c -f "$CONFIG_DIR/haproxy.cfg"; then
            systemctl start haproxy
            echo "Configuration restored successfully"
        else
            # 恢复失败,回滚
            rm -rf "$CONFIG_DIR"
            mv "${CONFIG_DIR}_old_$DATE" "$CONFIG_DIR"
            systemctl start haproxy
            echo "Configuration restore failed, rolled back"
        fi
    else
        echo "Backup file not found"
    fi
}

# 主函数
main() {
    case "$1" in
        backup)
            backup_config
            ;;
        restore)
            if [ -z "$2" ]; then
                echo "Usage: $0 restore <backup_file>"
                exit 1
            fi
            restore_config "$2"
            ;;
        *)
            echo "Usage: $0 {backup|restore <backup_file>}"
            exit 1
            ;;
    esac
}

main "$@"
```

2. 状态恢复
```bash
#!/bin/bash
# 状态恢复脚本

# 变量定义
SOCKET="/var/run/haproxy.sock"
TIMEOUT=30

# 检查服务状态
check_service() {
    if ! systemctl is-active haproxy > /dev/null; then
        echo "HAProxy service is not running"
        return 1
    fi
    return 0
}

# 恢复后端服务器
recover_server() {
    local backend="$1"
    local server="$2"
    
    echo "set server $backend/$server state ready" | \
        socat stdio "$SOCKET"
}

# 恢复所有DOWN状态服务器
recover_all_servers() {
    # 获取所有DOWN状态服务器
    echo "show servers state" | socat stdio "$SOCKET" | \
        awk '$6 != "2"' | while read -r line; do
        backend=$(echo "$line" | awk '{print $1}')
        server=$(echo "$line" | awk '{print $2}')
        recover_server "$backend" "$server"
    done
}

# 等待服务就绪
wait_ready() {
    local count=0
    while [ $count -lt $TIMEOUT ]; do
        if check_service; then
            return 0
        fi
        count=$((count + 1))
        sleep 1
    done
    return 1
}

# 主函数
main() {
    # 检查服务
    if ! check_service; then
        echo "Starting HAProxy service..."
        systemctl start haproxy
        
        if ! wait_ready; then
            echo "Failed to start HAProxy service"
            exit 1
        fi
    fi
    
    # 恢复服务器状态
    recover_all_servers
    
    echo "Recovery completed"
}

main
```

### 3.2 应急处理
1. 紧急处理脚本
```bash
#!/bin/bash
# 紧急处理脚本

# 变量定义
CONFIG="/etc/haproxy/haproxy.cfg"
BACKUP_CONFIG="/etc/haproxy/haproxy.cfg.emergency"
LOG_FILE="/var/log/haproxy/emergency.log"

# 日志函数
log() {
    local level="$1"
    local message="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
}

# 紧急配置切换
emergency_config() {
    # 备份当前配置
    cp "$CONFIG" "$BACKUP_CONFIG"
    
    # 创建紧急配置
    cat > "$CONFIG" << EOF
global
    daemon
    maxconn 20000
    
defaults
    mode http
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    
frontend emergency
    bind *:80
    default_backend emergency_backend
    
backend emergency_backend
    server emergency1 127.0.0.1:8080 check
EOF

    # 重启服务
    systemctl restart haproxy
    log "INFO" "Switched to emergency configuration"
}

# 紧急模式恢复
recover_config() {
    if [ -f "$BACKUP_CONFIG" ]; then
        mv "$BACKUP_CONFIG" "$CONFIG"
        systemctl restart haproxy
        log "INFO" "Recovered from emergency configuration"
    else
        log "ERROR" "Backup configuration not found"
        return 1
    fi
}

# 连接数限制
limit_connections() {
    local max_conn="$1"
    sed -i "s/maxconn .*/maxconn $max_conn/" "$CONFIG"
    systemctl reload haproxy
    log "INFO" "Limited maximum connections to $max_conn"
}

# 禁用后端服务器
disable_server() {
    local backend="$1"
    local server="$2"
    echo "disable server $backend/$server" | \
        socat stdio /var/run/haproxy.sock
    log "INFO" "Disabled server $server in backend $backend"
}

# 主函数
main() {
    case "$1" in
        emergency)
            emergency_config
            ;;
        recover)
            recover_config
            ;;
        limit)
            if [ -z "$2" ]; then
                echo "Usage: $0 limit <max_connections>"
                exit 1
            fi
            limit_connections "$2"
            ;;
        disable)
            if [ -z "$2" ] || [ -z "$3" ]; then
                echo "Usage: $0 disable <backend> <server>"
                exit 1
            fi
            disable_server "$2" "$3"
            ;;
        *)
            echo "Usage: $0 {emergency|recover|limit <max_connections>|disable <backend> <server>}"
            exit 1
            ;;
    esac
}

main "$@"
```

2. 故障恢复流程
```plaintext
1. 故障确认
   - 确认故障范围
   - 评估故障影响
   - 确定故障等级

2. 应急响应
   - 启动应急预案
   - 通知相关人员
   - 准备恢复资源

3. 故障处理
   - 执行应急措施
   - 监控处理效果
   - 记录处理过程

4. 服务恢复
   - 验证服务状态
   - 恢复正常配置
   - 确认服务稳定

5. 后续跟踪
   - 分析故障原因
   - 总结处理经验
   - 改进防范措施
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy监控告警](09_HAProxy监控告警.md)

## 更新记录
- 2024-03-21: 创建文档 