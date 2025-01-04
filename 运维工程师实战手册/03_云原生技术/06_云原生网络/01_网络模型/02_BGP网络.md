# BGP网络

## 1. 基本概念

### 1.1 什么是BGP网络
BGP (Border Gateway Protocol) 是一种外部网关协议，在云原生环境中用于容器网络的路由分发。主要特点：
- 路由可扩展性
- 高效的路由传播
- 灵活的路由策略
- 无需封装开销

### 1.2 应用场景
1. 数据中心网络
   - Pod网络互联
   - 跨集群通信
   - 多数据中心互联
   - 混合云连接

2. 边缘计算
   - 边缘节点接入
   - 就近访问
   - 流量优化
   - 故障隔离

## 2. 工作原理

### 2.1 BGP协议
1. 协议特性
   - AS自治系统
   - NEXT_HOP属性
   - 路由聚合
   - 路由过滤

2. 路由传播
```
Router1(AS 65001) <-> Router2(AS 65002) <-> Router3(AS 65003)
     |                    |                    |
   Pod网络1            Pod网络2             Pod网络3
```

### 2.2 路由处理
1. 路由建立
```
Pod创建 -> 生成路由 -> BGP通告 -> 邻居学习 -> 路由安装
```

2. 路由更新
```
Pod变更 -> 路由撤销 -> BGP撤销 -> 邻居更新 -> 路由刷新
```

## 3. 配置管理

### 3.1 BGP配置
1. FRR配置
```bash
# BGP配置文件
router bgp 65001
 bgp router-id 192.168.1.1
 neighbor 192.168.1.2 remote-as 65002
 network 10.244.0.0/24
 
# 启用BGP服务
systemctl enable frr
systemctl start frr
```

2. Calico配置
```yaml
apiVersion: projectcalico.org/v3
kind: BGPConfiguration
metadata:
  name: default
spec:
  logSeverityScreen: Info
  nodeToNodeMeshEnabled: true
  asNumber: 65001
```

### 3.2 节点配置
1. BGP Peer配置
```yaml
apiVersion: projectcalico.org/v3
kind: BGPPeer
metadata:
  name: bgppeer-global
spec:
  peerIP: 192.168.1.1
  asNumber: 65001
```

2. 路由反射器
```yaml
apiVersion: projectcalico.org/v3
kind: BGPConfiguration
metadata:
  name: default
spec:
  serviceClusterIPs:
  - cidr: 10.96.0.0/12
  communities:
  - name: bgp-rr
    value: 65001:1
```

## 4. 路由管理

### 4.1 路由策略
1. 路由过滤
```yaml
apiVersion: projectcalico.org/v3
kind: BGPFilter
metadata:
  name: reject-specific-routes
spec:
  exportV4:
    - action: Reject
      prefix: "10.0.0.0/24"
  importV4:
    - action: Accept
      prefix: "0.0.0.0/0"
```

2. 路由聚合
```yaml
apiVersion: projectcalico.org/v3
kind: BGPConfiguration
metadata:
  name: default
spec:
  prefixAdvertisements:
  - cidr: 10.244.0.0/16
    communities:
    - 65001:100
```

### 4.2 路由监控
1. 查看路由
```bash
# 查看BGP邻居
calicoctl node status

# 查看路由表
ip route show

# 查看BGP路由
vtysh -c 'show ip bgp'
```

2. 路由调试
```bash
# 开启BGP调试
vtysh -c 'debug bgp updates'

# 查看日志
tail -f /var/log/frr/bgpd.log
```

## 5. 性能优化

### 5.1 网络优化
1. TCP优化
```bash
# 调整TCP参数
sysctl -w net.ipv4.tcp_keepalive_time=60
sysctl -w net.ipv4.tcp_keepalive_intvl=10
sysctl -w net.ipv4.tcp_keepalive_probes=6
```

2. BGP优化
```bash
# 调整BGP定时器
router bgp 65001
 timers bgp 10 30
 neighbor 192.168.1.2 timers connect 10
```

### 5.2 路由优化
1. 路由聚合
   - 合理规划网段
   - 启用路由聚合
   - 控制路由条目
   - 减少路由更新

2. 会话优化
   - 使用路由反射器
   - 控制邻居数量
   - 优化更新间隔
   - 启用认证机制

## 6. 故障处理

### 6.1 常见问题
1. 连接问题
   - BGP会话断开
   - 路由黑洞
   - 路由震荡
   - 路由环路

2. 性能问题
   - 路由收敛慢
   - CPU使用高
   - 内存占用大
   - 网络延迟高

### 6.2 排查方法
1. 会话诊断
```bash
# 检查BGP状态
vtysh -c 'show ip bgp summary'

# 检查邻居状态
vtysh -c 'show ip bgp neighbors'

# 检查路由详情
vtysh -c 'show ip bgp 10.244.0.0/24'
```

2. 网络诊断
```bash
# 检查网络连通性
ping -c 3 192.168.1.2

# 检查TCP连接
netstat -anp | grep 179

# 抓包分析
tcpdump -i any tcp port 179 -nn
``` 