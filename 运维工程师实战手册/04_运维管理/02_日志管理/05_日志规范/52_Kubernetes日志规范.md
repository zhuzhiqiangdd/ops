# Kubernetes日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 组件日志
记录Kubernetes核心组件的运行状态。

1. API Server日志
   - 请求处理
   - 认证授权
   - API操作

2. Controller Manager日志
   - 控制器状态
   - 资源调节
   - 生命周期管理

3. Scheduler日志
   - 调度决策
   - 资源分配
   - 节点选择

4. Kubelet日志
   - 容器生命周期
   - 卷管理
   - 健康检查

### 1.2 应用日志
记录在Kubernetes中运行的应用程序日志。

1. 容器日志
   - 标准输出
   - 标准错误
   - 应用事件

2. Pod日志
   - 初始化容器
   - 主容器
   - 边车容器

### 1.3 审计日志
记录集群操作的审计信息。

1. API审计
   - 请求信息
   - 用户身份
   - 操作结果

2. 安全审计
   - 认证事件
   - 授权检查
   - 策略违规

### 1.4 事件日志
记录集群中的各类事件。

1. 系统事件
   - 节点事件
   - 组件事件
   - 资源事件

2. 应用事件
   - Pod事件
   - 服务事件
   - 存储事件

## 二、字段说明
### 2.1 组件日志字段
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

component:
  description: 组件名称
  type: string
  required: true
  example: "kube-apiserver"

msg:
  description: 日志消息
  type: string
  required: true
  example: "Starting API Server"

source_file:
  description: 源文件
  type: string
  required: false
  example: "apiserver.go:123"

error:
  description: 错误信息
  type: string
  required: false
  example: "connection refused"
```

### 2.2 应用日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: RFC3339Nano
  required: true
  example: "2024-03-21T10:00:00.123456789Z"

namespace:
  description: 命名空间
  type: string
  required: true
  example: "default"

pod_name:
  description: Pod名称
  type: string
  required: true
  example: "web-5d4d7c8f9b-2n9vk"

container_name:
  description: 容器名称
  type: string
  required: true
  example: "nginx"

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

### 2.3 审计日志字段
```yaml
timestamp:
  description: 日志时间
  type: string
  format: RFC3339Nano
  required: true
  example: "2024-03-21T10:00:00.123456789Z"

level:
  description: 审计级别
  type: string
  values: [None, Metadata, Request, RequestResponse]
  required: true
  example: "RequestResponse"

user:
  description: 用户信息
  type: object
  required: true
  example: {
    "username": "admin",
    "groups": ["system:masters"],
    "uid": "1234"
  }

verb:
  description: HTTP方法
  type: string
  required: true
  example: "POST"

resource:
  description: 资源类型
  type: string
  required: true
  example: "pods"

namespace:
  description: 命名空间
  type: string
  required: false
  example: "default"

request_uri:
  description: 请求URI
  type: string
  required: true
  example: "/api/v1/namespaces/default/pods"

response_code:
  description: 响应代码
  type: integer
  required: true
  example: 201
```

## 三、日志格式
### 3.1 组件日志格式
```
I0321 10:00:00.123456 1234 apiserver.go:123] Starting API Server
```

### 3.2 JSON格式
```json
{
  "timestamp": "2024-03-21T10:00:00.123456789Z",
  "level": "info",
  "component": "kube-apiserver",
  "msg": "Starting API Server",
  "source_file": "apiserver.go:123",
  "error": null
}
```

### 3.3 审计日志格式
```json
{
  "kind": "Event",
  "apiVersion": "audit.k8s.io/v1",
  "level": "RequestResponse",
  "auditID": "1234-5678-90ab-cdef",
  "stage": "ResponseComplete",
  "requestURI": "/api/v1/namespaces/default/pods",
  "verb": "create",
  "user": {
    "username": "admin",
    "groups": ["system:masters"]
  },
  "sourceIPs": ["192.168.1.100"],
  "userAgent": "kubectl/v1.26.0",
  "objectRef": {
    "resource": "pods",
    "namespace": "default",
    "name": "web-1",
    "apiVersion": "v1"
  },
  "responseStatus": {
    "code": 201
  },
  "requestReceivedTimestamp": "2024-03-21T10:00:00.123456Z",
  "stageTimestamp": "2024-03-21T10:00:00.234567Z"
}
```

## 四、配置示例
### 4.1 组件日志配置
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - name: kube-apiserver
    command:
    - kube-apiserver
    - --v=2
    - --log-dir=/var/log/kubernetes
    - --log-file=/var/log/kubernetes/kube-apiserver.log
    - --log-file-max-size=100
    - --log-file-max-backups=5
    - --logtostderr=false
    - --alsologtostderr=true
```

### 4.2 应用日志配置
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    env:
    - name: LOG_LEVEL
      value: "info"
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  volumes:
  - name: logs
    emptyDir: {}
```

### 4.3 审计日志配置
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - name: kube-apiserver
    command:
    - kube-apiserver
    - --audit-log-path=/var/log/kubernetes/audit.log
    - --audit-log-maxage=30
    - --audit-log-maxbackup=10
    - --audit-log-maxsize=100
    - --audit-policy-file=/etc/kubernetes/audit-policy.yaml
    volumeMounts:
    - name: audit-policy
      mountPath: /etc/kubernetes/audit-policy.yaml
      readOnly: true
  volumes:
  - name: audit-policy
    hostPath:
      path: /etc/kubernetes/audit-policy.yaml
      type: File
```

### 4.4 审计策略配置
```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
# 记录Pod操作的完整信息
- level: RequestResponse
  resources:
  - group: ""
    resources: ["pods"]

# 记录ConfigMap和Secret的元数据
- level: Metadata
  resources:
  - group: ""
    resources: ["configmaps", "secrets"]

# 记录其他资源的基本信息
- level: Request
  resources:
  - group: ""
    resources: ["services"]
  - group: "apps"
    resources: ["deployments", "statefulsets"]

# 忽略系统组件的健康检查
- level: None
  users: ["system:kube-proxy"]
  verbs: ["watch"]
  resources:
  - group: ""
    resources: ["endpoints", "services", "services/status"]
```

## 五、日志样例
### 5.1 组件日志
1. API Server日志
   ```
   I0321 10:00:00.123456 1234 apiserver.go:123] Starting API Server
   I0321 10:00:00.234567 1234 secure_serving.go:123] Serving securely on 0.0.0.0:6443
   E0321 10:00:01.345678 1234 handler.go:123] Failed to authenticate: invalid bearer token
   ```

2. Controller Manager日志
   ```
   I0321 10:01:00.123456 1234 deployment_controller.go:123] Processing deployment default/web
   I0321 10:01:00.234567 1234 replica_set.go:123] Creating ReplicaSet for deployment default/web
   W0321 10:01:01.345678 1234 controller_utils.go:123] Retrying failed creation of ReplicaSet
   ```

### 5.2 应用日志
1. 容器标准输出
   ```json
   {
     "timestamp": "2024-03-21T10:02:00.123456789Z",
     "namespace": "default",
     "pod_name": "web-5d4d7c8f9b-2n9vk",
     "container_name": "nginx",
     "stream": "stdout",
     "log": "2024/03/21 10:02:00 [notice] 1#1: start worker process 1"
   }
   ```

2. 容器标准错误
   ```json
   {
     "timestamp": "2024-03-21T10:02:01.123456789Z",
     "namespace": "default",
     "pod_name": "web-5d4d7c8f9b-2n9vk",
     "container_name": "nginx",
     "stream": "stderr",
     "log": "2024/03/21 10:02:01 [error] 1#1: *1 open() \"/usr/share/nginx/html/index.html\" failed (2: No such file or directory)"
   }
   ```

### 5.3 审计日志
1. Pod创建事件
   ```json
   {
     "kind": "Event",
     "apiVersion": "audit.k8s.io/v1",
     "level": "RequestResponse",
     "auditID": "1234-5678-90ab-cdef",
     "stage": "ResponseComplete",
     "requestURI": "/api/v1/namespaces/default/pods",
     "verb": "create",
     "user": {
       "username": "admin",
       "groups": ["system:masters"]
     },
     "sourceIPs": ["192.168.1.100"],
     "userAgent": "kubectl/v1.26.0",
     "objectRef": {
       "resource": "pods",
       "namespace": "default",
       "name": "web-1",
       "apiVersion": "v1"
     },
     "responseStatus": {
       "code": 201
     },
     "requestObject": {
       "kind": "Pod",
       "apiVersion": "v1",
       "metadata": {
         "name": "web-1",
         "namespace": "default"
       },
       "spec": {
         "containers": [
           {
             "name": "nginx",
             "image": "nginx:1.21"
           }
         ]
       }
     },
     "responseObject": {
       "kind": "Pod",
       "apiVersion": "v1",
       "metadata": {
         "name": "web-1",
         "namespace": "default",
         "uid": "1234-5678-90ab-cdef",
         "creationTimestamp": "2024-03-21T10:00:00Z"
       },
       "spec": {
         "containers": [
           {
             "name": "nginx",
             "image": "nginx:1.21"
           }
         ]
       },
       "status": {
         "phase": "Pending"
       }
     },
     "requestReceivedTimestamp": "2024-03-21T10:00:00.123456Z",
     "stageTimestamp": "2024-03-21T10:00:00.234567Z"
   }
   ```

2. 认证失败事件
   ```json
   {
     "kind": "Event",
     "apiVersion": "audit.k8s.io/v1",
     "level": "Metadata",
     "auditID": "9876-5432-fedc-ba09",
     "stage": "ResponseComplete",
     "requestURI": "/api/v1/namespaces/default/pods",
     "verb": "list",
     "user": {
       "username": "system:anonymous",
       "groups": ["system:unauthenticated"]
     },
     "sourceIPs": ["192.168.1.200"],
     "userAgent": "curl/7.68.0",
     "responseStatus": {
       "code": 401,
       "reason": "Unauthorized",
       "message": "invalid bearer token"
     },
     "requestReceivedTimestamp": "2024-03-21T10:01:00.123456Z",
     "stageTimestamp": "2024-03-21T10:01:00.234567Z"
   }
   ```

### 5.4 事件日志
1. Pod调度事件
   ```json
   {
     "kind": "Event",
     "apiVersion": "v1",
     "metadata": {
       "name": "web-1.1234567890abcdef",
       "namespace": "default"
     },
     "involvedObject": {
       "kind": "Pod",
       "namespace": "default",
       "name": "web-1",
       "uid": "1234-5678-90ab-cdef"
     },
     "reason": "Scheduled",
     "message": "Successfully assigned default/web-1 to node-1",
     "source": {
       "component": "default-scheduler"
     },
     "firstTimestamp": "2024-03-21T10:00:00Z",
     "lastTimestamp": "2024-03-21T10:00:00Z",
     "count": 1,
     "type": "Normal"
   }
   ```

2. 容器启动事件
   ```json
   {
     "kind": "Event",
     "apiVersion": "v1",
     "metadata": {
       "name": "web-1.234567890abcdef1",
       "namespace": "default"
     },
     "involvedObject": {
       "kind": "Pod",
       "namespace": "default",
       "name": "web-1",
       "uid": "1234-5678-90ab-cdef"
     },
     "reason": "Started",
     "message": "Started container nginx",
     "source": {
       "component": "kubelet",
       "host": "node-1"
     },
     "firstTimestamp": "2024-03-21T10:00:10Z",
     "lastTimestamp": "2024-03-21T10:00:10Z",
     "count": 1,
     "type": "Normal"
   }
   ```

## 相关文档
- [Docker日志规范](28_Docker日志规范.md)
- [容器运行时日志规范](30_容器运行时日志规范.md)
- [容器监控日志规范](31_容器监控日志规范.md)

## 更新记录
- 2024-03-21: 创建Kubernetes日志规范文档 