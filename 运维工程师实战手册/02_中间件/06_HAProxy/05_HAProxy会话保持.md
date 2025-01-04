# HAProxy会话保持

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、会话保持概述

### 1.1 基本概念
1. 会话保持定义
   - 将同一用户的请求转发到同一后端服务器
   - 保证业务会话的完整性
   - 维持用户状态的连续性

2. 应用场景
   - 有状态应用
   - 分布式会话
   - 用户认证系统
   - 购物车系统

3. 实现方式
   - Cookie方式
   - IP Hash方式
   - URL Hash方式
   - RDP Cookie方式

### 1.2 选择策略
1. 场景因素
   - 应用类型
   - 会话要求
   - 客户端特征
   - 网络环境

2. 性能考虑
   - 服务器负载
   - 会话分布
   - 扩展性要求
   - 容错能力

## 二、Cookie会话保持

### 2.1 基于Cookie的会话保持
1. 工作原理
   - HAProxy插入Cookie
   - 客户端保存Cookie
   - 后续请求携带Cookie
   - 根据Cookie转发

2. 配置方式
```haproxy
backend web-servers
    # 插入Cookie
    cookie SERVERID insert indirect nocache
    
    # 服务器配置
    server web1 192.168.1.101:80 cookie s1 check
    server web2 192.168.1.102:80 cookie s2 check
```

3. Cookie选项
```haproxy
backend web-servers
    # 基本配置
    cookie JSESSIONID prefix
    
    # 高级选项
    cookie SERVERID insert indirect nocache httponly secure
    
    # 动态Cookie
    dynamic-cookie-key "MySecret"
```

### 2.2 Cookie属性设置
1. 基本属性
```haproxy
backend web-servers
    cookie SERVERID insert
    cookie SERVERID insert indirect
    cookie SERVERID insert nocache
    cookie SERVERID insert postonly
```

2. 安全属性
```haproxy
backend web-servers
    # HTTP Only
    cookie SERVERID insert httponly
    
    # Secure
    cookie SERVERID insert secure
    
    # SameSite
    cookie SERVERID insert samesite=strict
```

3. 域名属性
```haproxy
backend web-servers
    # 域名设置
    cookie SERVERID domain .example.com
    
    # 路径设置
    cookie SERVERID path /
```

## 三、IP Hash会话保持

### 3.1 基于源IP的会话保持
1. 工作原理
   - 计算源IP哈希值
   - 根据哈希值选择服务器
   - 相同IP固定转发
   - 支持一致性哈希

2. 基本配置
```haproxy
backend web-servers
    # 源IP哈希
    balance source
    
    # 服务器配置
    server web1 192.168.1.101:80 check
    server web2 192.168.1.102:80 check
```

3. 高级配置
```haproxy
backend web-servers
    # 一致性哈希
    balance source
    hash-type consistent
    
    # 哈希参数
    hash-balance-factor 100
    hash-balance-source user_addr
```

### 3.2 IP Hash优化
1. 哈希算法选择
```haproxy
backend web-servers
    # 一致性哈希
    balance source
    hash-type consistent
    
    # map-based哈希
    hash-type map-based
```

2. 权重设置
```haproxy
backend web-servers
    balance source
    hash-type consistent
    server web1 192.168.1.101:80 weight 100
    server web2 192.168.1.102:80 weight 200
```

## 四、URL Hash会话保持

### 4.1 基于URL的会话保持
1. 工作原理
   - 计算URL哈希值
   - 根据哈希值选择服务器
   - 相同URL固定转发
   - 适合缓存场景

2. 基本配置
```haproxy
backend web-servers
    # URI哈希
    balance uri
    
    # 服务器配置
    server web1 192.168.1.101:80 check
    server web2 192.168.1.102:80 check
```

3. 高级配置
```haproxy
backend web-servers
    # URL参数哈希
    balance url_param userid
    
    # 哈希长度
    balance uri len 10
    
    # 一致性哈希
    hash-type consistent
```

### 4.2 URL Hash应用
1. 静态资源缓存
```haproxy
backend static-servers
    balance uri
    hash-type consistent
    server cache1 192.168.1.101:80 check
    server cache2 192.168.1.102:80 check
```

2. 动态参数路由
```haproxy
backend app-servers
    balance url_param userid check_post 64
    hash-type consistent
    server app1 192.168.1.103:8080 check
    server app2 192.168.1.104:8080 check
```

## 五、RDP Cookie会话保持

### 5.1 RDP协议会话保持
1. 工作原理
   - 解析RDP Cookie
   - 根据Cookie选择服务器
   - 适用远程桌面服务

2. 基本配置
```haproxy
backend rdp-servers
    balance rdp-cookie
    server rdp1 192.168.1.101:3389 check
    server rdp2 192.168.1.102:3389 check
```

3. 高级配置
```haproxy
backend rdp-servers
    # RDP Cookie名称
    balance rdp-cookie MSTSHASH
    
    # 连接设置
    timeout server 3h
    timeout client 3h
```

### 5.2 RDP会话优化
1. 连接优化
```haproxy
backend rdp-servers
    # 会话超时
    timeout tunnel 3h
    
    # TCP设置
    option tcplog
    option tcp-check
```

2. 健康检查
```haproxy
backend rdp-servers
    option tcp-check
    tcp-check connect port 3389
    tcp-check expect string "RFB"
```

## 六、高级会话保持

### 6.1 多级会话保持
1. 配置示例
```haproxy
backend web-servers
    # Cookie + IP Hash
    cookie SERVERID insert indirect nocache
    balance source
    hash-type consistent
    
    server web1 192.168.1.101:80 cookie s1 check
    server web2 192.168.1.102:80 cookie s2 check
```

2. 应用场景
   - 复杂应用架构
   - 多层负载均衡
   - 混合会话要求

### 6.2 动态会话保持
1. 配置示例
```haproxy
backend web-servers
    # 动态Cookie
    cookie SERVERID insert indirect nocache
    dynamic-cookie-key "MySecret"
    
    # 动态权重
    server web1 192.168.1.101:80 cookie s1 weight 100
    server web2 192.168.1.102:80 cookie s2 weight 100 slowstart 60s
```

2. 应用场景
   - 动态扩缩容
   - 灰度发布
   - 服务预热

### 6.3 会话持久化
1. 配置示例
```haproxy
backend web-servers
    # Stick Table配置
    stick-table type string len 32 size 100k expire 30m
    stick store-response res.cook(JSESSIONID)
    stick match req.cook(JSESSIONID)
    
    # 服务器配置
    server web1 192.168.1.101:80 check
    server web2 192.168.1.102:80 check
```

2. 应用场景
   - 会话数据持久化
   - 故障恢复
   - 会话迁移

## 七、监控与维护

### 7.1 会话监控
1. 统计信息
```haproxy
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats show-legends
    stats admin if TRUE
```

2. 关键指标
   - 会话数量
   - 会话分布
   - 会话时长
   - 会话失效率

### 7.2 故障处理
1. Cookie问题
```haproxy
backend web-servers
    # Cookie调试
    option httpchk
    http-check expect status 200
    
    # 会话保持失效处理
    option redispatch
    retries 3
```

2. 服务器故障
```haproxy
backend web-servers
    # 故障转移
    option redispatch
    retries 3
    
    # 备份服务器
    server backup1 192.168.1.103:80 backup
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy负载均衡算法](04_HAProxy负载均衡算法.md)

## 更新记录
- 2024-03-21: 创建文档 