# Overlay网络

## 1. 基本概念

### 1.1 什么是Overlay网络
Overlay网络是一种网络虚拟化技术，它通过在现有的物理网络（Underlay）之上构建虚拟网络层，使得容器和Pod可以跨主机通信。主要特点包括：
- 网络隔离
- 跨主机通信
- 动态配置
- 灵活扩展

### 1.2 常见实现方案
1. VXLAN (Virtual Extensible LAN)
   - 大规模网络分段
   - MAC地址学习
   - 支持多播和单播
   - 封装效率高

2. IPIP
   - 简单直接
   - 性能开销小
   - IP层封装
   - 点对点通信

3. GRE (Generic Routing Encapsulation)
   - 协议无关
   - 支持多种封装
   - 隧道传输
   - 安全性好

## 2. 工作原理

### 2.1 网络封装
1. VXLAN封装
```
原始数据包
    |
    v
添加VXLAN头(VNI)
    |
    v
添加UDP头(端口8472)
    |
    v
添加IP头(物理网络)
    |
    v
添加以太网头
```

2. 数据流转
```
容器1 -> veth -> 网桥 -> VTEP -> 物理网络 -> VTEP -> 网桥 -> veth -> 容器2
```

### 2.2 网络寻址
1. VTEP发现
   - 多播发现
   - 控制平面学习
   - 手动配置

2. MAC学习
   - 本地学习
   - 远程学习
   - 表项同步

## 3. 配置管理

### 3.1 网络配置
1. VXLAN配置
```bash
# 创建VXLAN接口
ip link add vxlan0 type vxlan \
    id 100 \
    dstport 4789 \
    local 192.168.1.10 \
    dev eth0

# 启用接口
ip link set vxlan0 up

# 添加FDB表项
bridge fdb append 00:00:00:00:00:00 dev vxlan0 dst 192.168.1.20
```

2. IPIP配置
```bash
# 创建IPIP隧道
ip tunnel add ipip0 mode ipip \
    local 192.168.1.10 \
    remote 192.168.1.20

# 配置IP地址
ip addr add 10.0.0.1/24 dev ipip0

# 启用接口
ip link set ipip0 up
```

### 3.2 路由配置
1. 主机路由
```bash
# 添加overlay网络路由
ip route add 10.244.0.0/16 dev vxlan0

# 添加远程主机路由
ip route add 10.244.1.0/24 via 192.168.1.20
```

2. 容器路由
```bash
# 容器默认路由
ip route add default via 10.244.0.1

# 跨主机路由
ip route add 10.244.1.0/24 via 10.244.0.1
```

## 4. 性能优化

### 4.1 网络优化
1. MTU优化
```bash
# 设置VXLAN MTU
ip link set vxlan0 mtu 1450

# 设置容器MTU
ip link set eth0 mtu 1450
```

2. 队列优化
```bash
# 设置队列长度
ip link set vxlan0 txqueuelen 1000

# 设置多队列
ethtool -L vxlan0 combined 4
```

### 4.2 内核优化
1. 网络参数
```bash
# 开启GRO
ethtool -K eth0 gro on

# 开启GSO
ethtool -K eth0 gso on

# 调整网络缓冲区
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216
```

2. 转发优化
```bash
# 开启IP转发
sysctl -w net.ipv4.ip_forward=1

# 优化转发路径
sysctl -w net.ipv4.conf.all.rp_filter=0
sysctl -w net.ipv4.conf.default.rp_filter=0
```

## 5. 故障排查

### 5.1 常见问题
1. 连通性问题
   - VTEP配置检查
   - 路由表验证
   - MTU配置确认
   - 防火墙规则检查

2. 性能问题
   - 网络延迟
   - 丢包分析
   - CPU使用率
   - 内存占用

### 5.2 调试工具
1. 网络诊断
```bash
# 查看VXLAN接口
ip -d link show vxlan0

# 查看FDB表
bridge fdb show dev vxlan0

# 抓包分析
tcpdump -i vxlan0 -nn

# 连通性测试
ping -I vxlan0 10.244.1.2
```

2. 性能分析
```bash
# 网络性能测试
iperf3 -c 10.244.1.2 -i 1

# 延迟测试
mtr 10.244.1.2

# 系统负载
top -n 1
``` 