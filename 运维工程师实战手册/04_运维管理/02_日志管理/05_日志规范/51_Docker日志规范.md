# Docker日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 守护进程日志(daemon.log)
记录Docker守护进程的运行状态和事件。

1. 系统事件
   - 启动/关闭事件
   - 配置加载
   - 状态变更

2. 错误日志
   - 系统错误
   - 网络错误
   - 存储错误

3. 警告信息
   - 性能警告
   - 资源警告
   - 配置警告

### 1.2 容器日志(container.log)
记录容器的标准输出和标准错误。

1. 应用日志
   - 标准输出
   - 标准错误
   - 应用事件

2. 运行日志
   - 启动/停止
   - 健康检查
   - 资源使用

### 1.3 服务日志(service.log)
记录Docker Swarm服务的运行状态。

1. 服务事件
   - 服务创建/更新
   - 任务调度
   - 扩缩容

2. 节点事件
   - 节点加入/离开
   - 节点状态
   - 资源分配

### 1.4 构建日志(build.log)
记录镜像构建过程。

1. 构建事件
   - 层构建
   - 缓存使用
   - 指令执行

2. 推送事件
   - 镜像推送
   - 层传输
   - 认证信息

## 二、字段说明
### 2.1 守护进程日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: RFC3339Nano
  required: true
  example: "2024-03-21T10:00:00.123456789Z"

level:
  description: 日志级别
  type: string
  values: [debug, info, warn, error, fatal]
  required: true
  example: "info"

msg:
  description: 日志消息
  type: string
  required: true
  example: "starting containerd"

module:
  description: 模块名称
  type: string
  required: true
  example: "daemon"

error:
  description: 错误信息
  type: string
  required: false
  example: "connection refused"
```

### 2.2 容器日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: RFC3339Nano
  required: true
  example: "2024-03-21T10:00:00.123456789Z"

container_id:
  description: 容器ID
  type: string
  required: true
  example: "abc123def456"

container_name:
  description: 容器名称
  type: string
  required: true
  example: "web-1"

image:
  description: 镜像名称
  type: string
  required: true
  example: "nginx:1.21"

stream:
  description: 输出流
  type: string
  values: [stdout, stderr]
  required: true
  example: "stdout"

log:
  description: 日志内容
  type: string
  required: true
  example: "Server is running on port 80"
```

### 2.3 服务日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: RFC3339Nano
  required: true
  example: "2024-03-21T10:00:00.123456789Z"

service_id:
  description: 服务ID
  type: string
  required: true
  example: "web_service"

service_name:
  description: 服务名称
  type: string
  required: true
  example: "web"

node_id:
  description: 节点ID
  type: string
  required: true
  example: "node1"

event:
  description: 事件类型
  type: string
  required: true
  example: "service.create"

status:
  description: 状态信息
  type: string
  required: true
  example: "running"
```

## 三、日志格式
### 3.1 JSON格式
```json
{
  "timestamp": "2024-03-21T10:00:00.123456789Z",
  "level": "info",
  "msg": "starting containerd",
  "module": "daemon",
  "error": null
}
```

### 3.2 容器日志格式
```json
{
  "timestamp": "2024-03-21T10:00:00.123456789Z",
  "container_id": "abc123def456",
  "container_name": "web-1",
  "image": "nginx:1.21",
  "stream": "stdout",
  "log": "Server is running on port 80"
}
```

### 3.3 服务日志格式
```json
{
  "timestamp": "2024-03-21T10:00:00.123456789Z",
  "service_id": "web_service",
  "service_name": "web",
  "node_id": "node1",
  "event": "service.create",
  "status": "running"
}
```

## 四、配置示例
### 4.1 守护进程配置
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production_status",
    "env": "os,customer"
  },
  "debug": true,
  "log-level": "info"
}
```

### 4.2 容器日志配置
```yaml
version: '3.8'
services:
  web:
    image: nginx:1.21
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
        labels: "production_status"
        env: "os,customer"
        tag: "{{.ImageName}}/{{.Name}}/{{.ID}}"
```

### 4.3 服务日志配置
```yaml
version: '3.8'
services:
  web:
    image: nginx:1.21
    deploy:
      mode: replicated
      replicas: 3
    logging:
      driver: "gelf"
      options:
        gelf-address: "udp://localhost:12201"
        tag: "{{.Name}}/{{.ID}}"
        labels: "com.docker.swarm.service.name,com.docker.swarm.service.id"
```

### 4.4 日志驱动配置
```yaml
# 支持的日志驱动
logging:
  # JSON文件驱动
  json-file:
    max-size: "10m"
    max-file: 3
    compress: "true"
    labels: "production_status"
    env: "os,customer"

  # Syslog驱动
  syslog:
    syslog-address: "tcp://localhost:514"
    syslog-facility: "daemon"
    syslog-tls-skip-verify: "true"
    tag: "{{.Name}}/{{.ID}}"

  # Graylog驱动
  gelf:
    gelf-address: "udp://localhost:12201"
    gelf-compression-type: "none"
    tag: "{{.Name}}/{{.ID}}"

  # Fluentd驱动
  fluentd:
    fluentd-address: "localhost:24224"
    fluentd-async: "true"
    tag: "{{.Name}}/{{.ID}}"
```

## 五、日志样例
### 5.1 守护进程日志
1. 启动日志
   ```json
   {
     "timestamp": "2024-03-21T10:00:00.123456789Z",
     "level": "info",
     "msg": "Starting up",
     "module": "daemon",
     "version": "24.0.0",
     "commit": "abc123def",
     "os": "linux",
     "arch": "amd64"
   }
   ```

2. 错误日志
   ```json
   {
     "timestamp": "2024-03-21T10:01:00.123456789Z",
     "level": "error",
     "msg": "Failed to start container",
     "module": "daemon",
     "error": "no such image",
     "container_id": "abc123def456",
     "image": "nginx:latest"
   }
   ```

### 5.2 容器日志
1. 应用输出
   ```json
   {
     "timestamp": "2024-03-21T10:02:00.123456789Z",
     "container_id": "abc123def456",
     "container_name": "web-1",
     "image": "nginx:1.21",
     "stream": "stdout",
     "log": "2024/03/21 10:02:00 [notice] 1#1: start worker process 1"
   }
   ```

2. 错误输出
   ```json
   {
     "timestamp": "2024-03-21T10:02:01.123456789Z",
     "container_id": "abc123def456",
     "container_name": "web-1",
     "image": "nginx:1.21",
     "stream": "stderr",
     "log": "2024/03/21 10:02:01 [error] 1#1: *1 open() \"/usr/share/nginx/html/index.html\" failed (2: No such file or directory)"
   }
   ```

### 5.3 服务日志
1. 服务创建
   ```json
   {
     "timestamp": "2024-03-21T10:03:00.123456789Z",
     "service_id": "web_service",
     "service_name": "web",
     "node_id": "node1",
     "event": "service.create",
     "status": "created",
     "replicas": 3,
     "image": "nginx:1.21"
   }
   ```

2. 任务状态
   ```json
   {
     "timestamp": "2024-03-21T10:03:01.123456789Z",
     "service_id": "web_service",
     "service_name": "web",
     "node_id": "node1",
     "task_id": "task1",
     "event": "task.start",
     "status": "running",
     "container_id": "abc123def456"
   }
   ```

### 5.4 构建日志
```json
{
  "timestamp": "2024-03-21T10:04:00.123456789Z",
  "level": "info",
  "msg": "Building stage 1/3",
  "module": "builder",
  "stage": 1,
  "total_stages": 3,
  "instruction": "FROM nginx:1.21",
  "duration": 1.234
}
```

## 相关文档
- [Kubernetes日志规范](29_Kubernetes日志规范.md)
- [容器运行时日志规范](30_容器运行时日志规范.md)
- [容器监控日志规范](31_容器监控日志规范.md)

## 更新记录
- 2024-03-21: 创建Docker日志规范文档 