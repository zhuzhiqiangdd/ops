# HAProxy健康检查

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、健康检查概述

### 1.1 基本概念
1. 健康检查定义
   - 定期检测后端服务器状态
   - 自动剔除故障服务器
   - 自动恢复正常服务器
   - 保证服务高可用

2. 检查类型
   - TCP检查
   - HTTP检查
   - MySQL检查
   - LDAP检查
   - SSL检查
   - 自定义检查

3. 检查状态
   - UP: 服务正常
   - DOWN: 服务异常
   - NOLB: 不参与负载均衡
   - MAINT: 维护状态
   - DRAIN: 正在清空连接

### 1.2 检查机制
1. 检查周期
   - 检查间隔时间
   - 连续失败次数
   - 恢复成功次数
   - 超时时间

2. 状态转换
   - UP -> DOWN: 连续失败
   - DOWN -> UP: 连续成功
   - MAINT: 手动设置
   - DRAIN: 优雅下线

## 二、TCP健康检查

### 2.1 基本配置
1. 配置示例
```haproxy
backend tcp-servers
    # 启用TCP检查
    option tcp-check
    
    # 服务器配置
    server srv1 192.168.1.101:80 check
    server srv2 192.168.1.102:80 check
```

2. 检查参数
```haproxy
backend tcp-servers
    # 检查间隔
    default-server inter 2s fall 3 rise 2
    
    # 超时设置
    timeout connect 5s
    timeout check 5s
```

### 2.2 高级配置
1. 自定义TCP检查
```haproxy
backend tcp-servers
    option tcp-check
    tcp-check connect
    tcp-check send PING\r\n
    tcp-check expect string +PONG
    tcp-check send QUIT\r\n
    tcp-check expect string +OK
```

2. SSL检查
```haproxy
backend ssl-servers
    option ssl-hello-chk
    server srv1 192.168.1.101:443 check ssl verify none
```

## 三、HTTP健康检查

### 3.1 基本配置
1. 配置示例
```haproxy
backend http-servers
    # 启用HTTP检查
    option httpchk
    http-check expect status 200
    
    # 服务器配置
    server web1 192.168.1.101:80 check
    server web2 192.168.1.102:80 check
```

2. 检查参数
```haproxy
backend http-servers
    # 检查方法和路径
    option httpchk GET /health
    
    # 检查间隔
    default-server inter 2s fall 3 rise 2
```

### 3.2 高级配置
1. 自定义HTTP检查
```haproxy
backend http-servers
    # 请求方法和路径
    option httpchk HEAD /health HTTP/1.1
    
    # 请求头
    http-check send-state
    http-check set-header Host www.example.com
    http-check set-header X-Custom-Header custom_value
    
    # 响应验证
    http-check expect status 200
    http-check expect ! string "Error"
    http-check expect rstring "^OK"
```

2. 多条件检查
```haproxy
backend http-servers
    option httpchk
    http-check expect status 200
    http-check expect ! string "Error"
    http-check expect rstring "^OK"
    http-check expect min-recv 50
```

## 四、数据库健康检查

### 4.1 MySQL检查
1. 基本配置
```haproxy
backend mysql-servers
    # MySQL检查
    option mysql-check user haproxy
    
    # 服务器配置
    server db1 192.168.1.101:3306 check
    server db2 192.168.1.102:3306 check
```

2. 高级配置
```haproxy
backend mysql-servers
    # 自定义检查
    option tcp-check
    tcp-check connect
    tcp-check send-binary 01
    tcp-check expect binary 0000000200
```

### 4.2 Redis检查
1. 基本配置
```haproxy
backend redis-servers
    # Redis检查
    option tcp-check
    tcp-check connect
    tcp-check send PING\r\n
    tcp-check expect string +PONG
    
    # 服务器配置
    server redis1 192.168.1.101:6379 check
    server redis2 192.168.1.102:6379 check
```

2. 高级配置
```haproxy
backend redis-servers
    # 密码认证
    tcp-check connect
    tcp-check send AUTH\ mypassword\r\n
    tcp-check expect string +OK
    tcp-check send PING\r\n
    tcp-check expect string +PONG
```

## 五、自定义健康检查

### 5.1 外部检查
1. 基本配置
```haproxy
backend custom-servers
    # 外部检查程序
    external-check command /usr/bin/check-script
    external-check path /etc/haproxy/scripts
    
    # 服务器配置
    server srv1 192.168.1.101:80 check
```

2. 检查脚本
```bash
#!/bin/bash
# /etc/haproxy/scripts/check-script

# 检查逻辑
curl -s http://${HOST}:${PORT}/health > /dev/null
exit $?
```

### 5.2 Agent检查
1. 基本配置
```haproxy
backend agent-servers
    # Agent检查
    option agent-check
    agent-check agent-addr 192.168.1.101
    agent-check agent-port 6789
    
    # 服务器配置
    server srv1 192.168.1.101:80 check agent-addr 192.168.1.101 agent-port 6789
```

2. Agent实现
```python
#!/usr/bin/env python3
import socket

def health_check():
    # 实现健康检查逻辑
    return True

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('0.0.0.0', 6789))
    sock.listen(1)
    
    while True:
        conn, addr = sock.accept()
        if health_check():
            conn.send(b"up\n")
        else:
            conn.send(b"down\n")
        conn.close()

if __name__ == '__main__':
    main()
```

## 六、监控与维护

### 6.1 状态监控
1. 统计信息
```haproxy
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if TRUE
```

2. 关键指标
   - 检查状态
   - 失败次数
   - 响应时间
   - 状态变更时间

### 6.2 故障处理
1. 手动维护
```haproxy
backend web-servers
    # 维护模式
    server web1 192.168.1.101:80 check maintenance
    
    # 优雅下线
    server web2 192.168.1.102:80 check drain
```

2. 自动恢复
```haproxy
backend web-servers
    # 自动恢复参数
    default-server inter 2s fall 3 rise 2 slowstart 60s
    
    # 重试设置
    option redispatch
    retries 3
```

## 七、最佳实践

### 7.1 检查策略
1. 基本原则
   - 选择合适的检查类型
   - 设置合理的检查间隔
   - 配置适当的重试次数
   - 实现优雅的故障转移

2. 配置示例
```haproxy
backend web-servers
    # 健康检查配置
    option httpchk GET /health HTTP/1.1
    http-check expect status 200
    
    # 检查参数
    default-server inter 2s fall 3 rise 2
    
    # 服务器配置
    server web1 192.168.1.101:80 check weight 100
    server web2 192.168.1.102:80 check backup
```

### 7.2 性能优化
1. 检查优化
```haproxy
backend web-servers
    # 检查间隔
    default-server inter 2s fall 3 rise 2
    
    # 并发检查
    server web1 192.168.1.101:80 check port 8080
    server web2 192.168.1.102:80 check port 8080
```

2. 负载控制
```haproxy
backend web-servers
    # 连接控制
    maxconn 10000
    
    # 队列设置
    queue 200 timeout 5s
    
    # 重试设置
    retries 2
    option redispatch
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy负载均衡算法](04_HAProxy负载均衡算法.md)

## 更新记录
- 2024-03-21: 创建文档 