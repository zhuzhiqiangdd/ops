# HAProxy负载均衡算法

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、负载均衡算法概述

### 1.1 算法分类
1. 静态算法
   - roundrobin: 轮询
   - static-rr: 加权轮询
   - first: 第一台可用服务器

2. 动态算法
   - leastconn: 最少连接
   - source: 源IP哈希
   - uri: URI哈希
   - url_param: URL参数哈希
   - hdr: HTTP头哈希

3. 高级算法
   - random: 随机
   - rdp-cookie: RDP cookie
   - consistent_hash: 一致性哈希

### 1.2 算法选择建议
1. 场景建议
   - HTTP短连接: roundrobin
   - TCP长连接: leastconn
   - 会话保持: source/cookie
   - 缓存命中: uri/url_param
   - 动态伸缩: consistent_hash

2. 性能考虑
   - CPU消耗: roundrobin < leastconn < uri < consistent_hash
   - 内存消耗: roundrobin < leastconn < uri < consistent_hash
   - 负载均衡: roundrobin ≈ leastconn > uri > source

## 二、基础算法详解

### 2.1 轮询(roundrobin)
1. 算法原理
   - 按顺序轮流将请求分发到后端服务器
   - 支持权重设置
   - 动态调整权重

2. 配置示例
```haproxy
backend web-servers
    balance roundrobin
    server web1 192.168.1.101:80 weight 1
    server web2 192.168.1.102:80 weight 2
    server web3 192.168.1.103:80 weight 1
```

3. 适用场景
   - HTTP短连接
   - 服务器性能相近
   - 请求处理时间稳定

### 2.2 加权轮询(static-rr)
1. 算法原理
   - 类似roundrobin
   - 权重固定不变
   - 性能更高

2. 配置示例
```haproxy
backend web-servers
    balance static-rr
    server web1 192.168.1.101:80 weight 100
    server web2 192.168.1.102:80 weight 200
    server web3 192.168.1.103:80 weight 100
```

3. 适用场景
   - 服务器性能差异固定
   - 高性能要求
   - 配置不常变更

### 2.3 最少连接(leastconn)
1. 算法原理
   - 优先分配给当前连接数最少的服务器
   - 考虑服务器权重
   - 动态计算负载

2. 配置示例
```haproxy
backend web-servers
    balance leastconn
    server web1 192.168.1.101:80 maxconn 1000
    server web2 192.168.1.102:80 maxconn 2000
    server web3 192.168.1.103:80 maxconn 1000
```

3. 适用场景
   - TCP长连接
   - 请求处理时间变化大
   - 动态负载均衡

## 三、动态算法详解

### 3.1 源IP哈希(source)
1. 算法原理
   - 根据源IP计算哈希值
   - 相同IP请求发往相同服务器
   - 用于无cookie的会话保持

2. 配置示例
```haproxy
backend web-servers
    balance source
    hash-type consistent
    server web1 192.168.1.101:80
    server web2 192.168.1.102:80
    server web3 192.168.1.103:80
```

3. 适用场景
   - 无cookie环境
   - 需要会话保持
   - 客户端IP相对固定

### 3.2 URI哈希(uri)
1. 算法原理
   - 根据URI计算哈希值
   - 相同URI请求发往相同服务器
   - 用于内容缓存

2. 配置示例
```haproxy
backend web-servers
    balance uri
    hash-type consistent
    server web1 192.168.1.101:80
    server web2 192.168.1.102:80
    server web3 192.168.1.103:80
```

3. 适用场景
   - CDN缓存
   - 静态资源服务
   - 内容分发

### 3.3 URL参数哈希(url_param)
1. 算法原理
   - 根据URL参数计算哈希值
   - 支持指定参数名
   - 用于应用层会话保持

2. 配置示例
```haproxy
backend web-servers
    balance url_param userid
    hash-type consistent
    server web1 192.168.1.101:80
    server web2 192.168.1.102:80
    server web3 192.168.1.103:80
```

3. 适用场景
   - 应用层会话保持
   - 参数化路由
   - 用户分组访问

## 四、高级算法详解

### 4.1 一致性哈希(consistent_hash)
1. 算法原理
   - 构建哈希环
   - 虚拟节点分散
   - 最小化重新分布

2. 配置示例
```haproxy
backend web-servers
    balance consistent_hash
    hash-type consistent sdbm
    hash-balance-factor 100
    server web1 192.168.1.101:80
    server web2 192.168.1.102:80
    server web3 192.168.1.103:80
```

3. 适用场景
   - 动态扩缩容
   - 缓存集群
   - 分布式存储

### 4.2 随机算法(random)
1. 算法原理
   - 随机选择后端服务器
   - 支持权重设置
   - 简单高效

2. 配置示例
```haproxy
backend web-servers
    balance random
    server web1 192.168.1.101:80 weight 1
    server web2 192.168.1.102:80 weight 2
    server web3 192.168.1.103:80 weight 1
```

3. 适用场景
   - 简单负载均衡
   - 测试环境
   - 性能要求不高

## 五、算法组合应用

### 5.1 多级负载均衡
1. 配置示例
```haproxy
frontend web-front
    bind *:80
    default_backend static-servers

backend static-servers
    balance uri
    server static1 192.168.1.101:80
    server static2 192.168.1.102:80

backend dynamic-servers
    balance leastconn
    server app1 192.168.1.103:8080
    server app2 192.168.1.104:8080
```

2. 应用场景
   - 静态资源URI哈希
   - 动态请求最少连接
   - 分层负载均衡

### 5.2 会话保持方案
1. Cookie + 轮询
```haproxy
backend web-servers
    balance roundrobin
    cookie SERVERID insert indirect nocache
    server web1 192.168.1.101:80 cookie s1
    server web2 192.168.1.102:80 cookie s2
```

2. IP哈希 + 一致性哈希
```haproxy
backend web-servers
    balance source
    hash-type consistent
    server web1 192.168.1.101:80
    server web2 192.168.1.102:80
```

### 5.3 动态权重调整
1. 配置示例
```haproxy
backend web-servers
    balance roundrobin
    dynamic-cookie-key "MySecret"
    server web1 192.168.1.101:80 weight 100
    server web2 192.168.1.102:80 weight 100 slowstart 60s
```

2. 应用场景
   - 服务器预热
   - 动态扩容
   - 故障恢复

## 六、性能优化建议

### 6.1 算法选择优化
1. 连接类型
   - 短连接: roundrobin/static-rr
   - 长连接: leastconn
   - 会话保持: source/cookie

2. 服务类型
   - 静态资源: uri
   - 动态请求: leastconn
   - 数据库: source

3. 扩展性要求
   - 频繁扩缩容: consistent_hash
   - 固定规模: roundrobin
   - 动态伸缩: leastconn

### 6.2 参数优化
1. 连接控制
```haproxy
backend web-servers
    # 最大连接数
    maxconn 10000
    
    # 队列大小
    queue 200
    
    # 重试次数
    retries 3
    
    # 连接超时
    timeout connect 5s
    timeout server 30s
```

2. 健康检查
```haproxy
backend web-servers
    # 检查间隔
    default-server inter 2s fall 3 rise 2
    
    # 检查类型
    option httpchk GET /health
    http-check expect status 200
```

### 6.3 监控指标
1. 关键指标
   - 当前连接数
   - 会话率
   - 响应时间
   - 错误率
   - 队列长度

2. 监控配置
```haproxy
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats show-legends
    stats show-node
```

## 相关文档
- [HAProxy基础架构](01_HAProxy基础架构.md)
- [HAProxy配置详解](03_HAProxy配置详解.md)
- [HAProxy会话保持](05_HAProxy会话保持.md)

## 更新记录
- 2024-03-21: 创建文档 