# Docker架构

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. Docker整体架构

### 1.1 架构概述
1. **C/S架构**
   - Docker Client（客户端）
   - Docker Daemon（服务端）
   - Docker Registry（镜像仓库）

2. **核心组件**
   ```
   Docker CLI ─── REST API ─── Docker Daemon
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
               Container      Image Builder    Network
                Manager         Manager        Manager
   ```

### 1.2 通信机制
1. **API通信**
   ```bash
   # Unix Socket
   /var/run/docker.sock
   
   # TCP端口
   tcp://localhost:2375 (未加密)
   tcp://localhost:2376 (TLS加密)
   ```

2. **远程访问**
   ```bash
   # 配置远程访问
   -H tcp://0.0.0.0:2375
   -H unix:///var/run/docker.sock
   ```

## 2. Docker引擎

### 2.1 组件构成
1. **Docker守护进程**
   - 容器生命周期管理
   - 镜像管理
   - 网络管理
   - 存储管理

2. **containerd**
   ```
   Docker Daemon
        │
   containerd
        │
   containerd-shim
        │
    runc/kata
   ```

### 2.2 运行时
1. **OCI运行时**
   - runc（默认运行时）
   - kata-runtime（安全容器）
   - gVisor（Google沙箱）

2. **运行时配置**
   ```json
   {
     "default-runtime": "runc",
     "runtimes": {
       "kata": {
         "path": "/usr/bin/kata-runtime"
       }
     }
   }
   ```

## 3. 镜像管理

### 3.1 镜像架构
1. **镜像层次**
   ```
   应用层
    │
   依赖层
    │
   系统层
    │
   基础层
   ```

2. **联合文件系统**
   - overlay2
   - devicemapper
   - btrfs
   - aufs

### 3.2 镜像构建
1. **BuildKit**
   ```bash
   # 启用BuildKit
   export DOCKER_BUILDKIT=1
   
   # 并行构建
   docker buildx build .
   ```

2. **缓存机制**
   ```dockerfile
   # 使用缓存挂载
   RUN --mount=type=cache,target=/var/cache/apt \
       apt-get update && apt-get install -y package
   ```

## 4. 容器运行时

### 4.1 容器生命周期
1. **状态转换**
   ```
   created → running → paused
      ↓         ↓
   stopped    restarting
   ```

2. **资源隔离**
   ```bash
   # Namespace隔离
   - PID Namespace
   - Network Namespace
   - Mount Namespace
   - UTS Namespace
   - IPC Namespace
   - User Namespace
   ```

### 4.2 资源控制
1. **Cgroups管理**
   ```bash
   # CPU限制
   --cpu-shares
   --cpu-period
   --cpu-quota
   
   # 内存限制
   --memory
   --memory-swap
   ```

2. **资源配额**
   ```bash
   # 磁盘配额
   --storage-opt size=10G
   
   # IO限制
   --device-read-bps
   --device-write-bps
   ```

## 5. 网络架构

### 5.1 网络模型
1. **CNM模型**
   ```
   Network Sandbox
        │
   Network Endpoint
        │
   Network
   ```

2. **网络驱动**
   - bridge
   - host
   - overlay
   - macvlan
   - none

### 5.2 网络实现
1. **网络命名空间**
   ```bash
   # 创建网络命名空间
   ip netns add container1
   
   # 配置veth对
   ip link add veth0 type veth peer name veth1
   ```

2. **网络控制**
   ```bash
   # 端口映射
   -p 8080:80
   
   # 网络连接
   --network=container:web
   ```

## 6. 存储架构

### 6.1 存储驱动
1. **驱动类型**
   ```json
   {
     "storage-driver": "overlay2",
     "storage-opts": [
       "overlay2.override_kernel_check=true"
     ]
   }
   ```

2. **数据持久化**
   ```bash
   # 数据卷
   docker volume create mydata
   
   # 绑定挂载
   -v /host/path:/container/path
   ```

### 6.2 数据管理
1. **卷管理**
   ```bash
   # 创建命名卷
   docker volume create --driver local \
     --opt type=none \
     --opt device=/path/on/host \
     --opt o=bind \
     myvolume
   ```

2. **数据备份**
   ```bash
   # 备份数据卷
   docker run --rm -v mydata:/data \
     -v $(pwd):/backup \
     alpine tar czf /backup/data.tar.gz /data
   ```

## 7. 安全架构

### 7.1 安全特性
1. **内核安全**
   - Seccomp
   - AppArmor
   - SELinux
   - Capabilities

2. **访问控制**
   ```json
   {
     "userns-remap": "default",
     "no-new-privileges": true,
     "seccomp-profile": "/etc/docker/seccomp.json"
   }
   ```

### 7.2 认证授权
1. **TLS配置**
   ```bash
   # 生成证书
   docker-machine create \
     --engine-tls \
     --engine-tls-ca-cert ca.pem \
     --engine-tls-cert cert.pem \
     --engine-tls-key key.pem \
     secure-docker
   ```

2. **访问控制**
   ```json
   {
     "authorization-plugins": ["authz-broker"],
     "tls": true,
     "tlscacert": "/etc/docker/ca.pem",
     "tlscert": "/etc/docker/cert.pem",
     "tlskey": "/etc/docker/key.pem",
     "tlsverify": true
   }
   ```

## 8. 参考资料
1. [Docker架构说明](https://docs.docker.com/get-started/overview/)
2. [容器运行时规范](https://github.com/opencontainers/runtime-spec)
3. [Docker安全](https://docs.docker.com/engine/security/)
4. [存储驱动文档](https://docs.docker.com/storage/storagedriver/)
