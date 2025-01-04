# Kubernetes基础

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅]已完成

## 1. Kubernetes概述

### 1.1 基本概念
1. **什么是Kubernetes**
   - 容器编排平台
   - 自动化部署
   - 弹性伸缩
   - 容器管理

2. **核心功能**
   - 服务发现和负载均衡
   - 存储编排
   - 自动部署和回滚
   - 自动装箱计算
   - 自我修复
   - 密钥和配置管理

### 1.2 架构组件
1. **控制平面组件**
   - kube-apiserver
   - etcd
   - kube-scheduler
   - kube-controller-manager
   - cloud-controller-manager

2. **工作节点组件**
   - kubelet
   - kube-proxy
   - 容器运行时

## 2. 核心概念

### 2.1 工作负载资源
1. **Pod**
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: nginx-pod
   spec:
     containers:
     - name: nginx
       image: nginx:1.14.2
       ports:
       - containerPort: 80
   ```

2. **Deployment**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nginx-deployment
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nginx
     template:
       metadata:
         labels:
           app: nginx
       spec:
         containers:
         - name: nginx
           image: nginx:1.14.2
   ```

### 2.2 服务和网络
1. **Service**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nginx-service
   spec:
     selector:
       app: nginx
     ports:
     - port: 80
       targetPort: 80
     type: ClusterIP
   ```

2. **Ingress**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: nginx-ingress
   spec:
     rules:
     - host: example.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: nginx-service
               port:
                 number: 80
   ```

## 3. 存储管理

### 3.1 持久化存储
1. **PersistentVolume**
   ```yaml
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: pv-volume
   spec:
     capacity:
       storage: 10Gi
     accessModes:
       - ReadWriteOnce
     hostPath:
       path: "/mnt/data"
   ```

2. **PersistentVolumeClaim**
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: pv-claim
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 10Gi
   ```

### 3.2 配置管理
1. **ConfigMap**
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: app-config
   data:
     app.properties: |
       key1=value1
       key2=value2
   ```

2. **Secret**
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: app-secret
   type: Opaque
   data:
     username: dXNlcm5hbWU=
     password: cGFzc3dvcmQ=
   ```

## 4. 安全管理

### 4.1 认证和授权
1. **ServiceAccount**
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: app-sa
   ```

2. **RBAC配置**
   ```yaml
   apiVersion: rbac.authorization.k8s.io/v1
   kind: Role
   metadata:
     name: pod-reader
   rules:
   - apiGroups: [""]
     resources: ["pods"]
     verbs: ["get", "list", "watch"]
   ```

### 4.2 网络策略
1. **NetworkPolicy**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: default-deny
   spec:
     podSelector: {}
     policyTypes:
     - Ingress
     - Egress
   ```

## 5. 集群管理

### 5.1 节点管理
1. **节点维护**
   ```bash
   # 标记节点不可调度
   kubectl cordon node-1
   
   # 驱逐节点上的Pod
   kubectl drain node-1
   
   # 恢复节点调度
   kubectl uncordon node-1
   ```

2. **节点标签**
   ```bash
   # 添加标签
   kubectl label nodes node-1 env=prod
   
   # 删除标签
   kubectl label nodes node-1 env-
   ```

### 5.2 监控和日志
1. **资源监控**
   ```bash
   # 查看节点资源
   kubectl top nodes
   
   # 查看Pod资源
   kubectl top pods
   ```

2. **日志查看**
   ```bash
   # 查看Pod日志
   kubectl logs pod-name
   
   # 查看容器日志
   kubectl logs pod-name -c container-name
   ```

## 6. 应用管理

### 6.1 应用部署
1. **滚动更新**
   ```bash
   # 更新镜像
   kubectl set image deployment/nginx nginx=nginx:1.15
   
   # 查看更新状态
   kubectl rollout status deployment/nginx
   ```

2. **回滚操作**
   ```bash
   # 查看历史版本
   kubectl rollout history deployment/nginx
   
   # 回滚到上一版本
   kubectl rollout undo deployment/nginx
   ```

### 6.2 扩缩容
1. **手动扩缩容**
   ```bash
   # 扩容
   kubectl scale deployment nginx --replicas=5
   
   # 缩容
   kubectl scale deployment nginx --replicas=3
   ```

2. **自动扩缩容**
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: nginx-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: nginx
     minReplicas: 1
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 50
   ```

## 7. 故障排查

### 7.1 常见问题
1. **Pod问题**
   ```bash
   # 查看Pod状态
   kubectl describe pod pod-name
   
   # 查看Pod日志
   kubectl logs pod-name
   ```

2. **节点问题**
   ```bash
   # 查看节点状态
   kubectl describe node node-name
   
   # 查看节点日志
   journalctl -u kubelet
   ```

### 7.2 调试技巧
1. **临时容器**
   ```bash
   # 创建调试容器
   kubectl debug -it pod-name --image=busybox
   
   # 进入容器调试
   kubectl exec -it pod-name -- /bin/sh
   ```

2. **网络调试**
   ```bash
   # 测试网络连通性
   kubectl run test-pod --image=busybox -- sleep 3600
   kubectl exec -it test-pod -- ping service-name
   ```

## 8. 参考资料
1. [Kubernetes官方文档](https://kubernetes.io/docs/)
2. [Kubernetes最佳实践](https://kubernetes.io/docs/concepts/configuration/overview/)
3. [Kubernetes故障排查](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/)
4. [Kubernetes安全指南](https://kubernetes.io/docs/concepts/security/) 