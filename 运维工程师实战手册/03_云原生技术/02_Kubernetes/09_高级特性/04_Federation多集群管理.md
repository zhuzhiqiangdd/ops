# Kubernetes Federation多集群管理指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅已完成]

## 1. Federation概述
Federation允许管理多个Kubernetes集群，提供跨集群的资源管理、服务发现和负载均衡能力。

## 2. 架构设计
### 2.1 核心组件
1. Federation API Server
2. Federation Controller Manager
3. Federation etcd
4. kubefed CLI工具

### 2.2 部署架构
```yaml
apiVersion: core.kubefed.io/v1beta1
kind: KubeFedConfig
metadata:
  name: kubefed
  namespace: kube-federation-system
spec:
  scope: Namespaced
  controllerDuration:
    availableDelay: 20s
    unavailableDelay: 60s
  leaderElect:
    resourceLock: configmaps
    leaseDuration: 15s
    renewDeadline: 10s
    retryPeriod: 5s
  featureGates:
  - name: PushReconciler
    enabled: true
  - name: SchedulerPreferences
    enabled: true
```

## 3. 集群注册
### 3.1 主机集群配置
```yaml
apiVersion: core.kubefed.io/v1beta1
kind: KubeFedCluster
metadata:
  name: cluster1
  namespace: kube-federation-system
spec:
  apiEndpoint: https://cluster1.example.com
  secretRef:
    name: cluster1-secret
  caBundle: <base64-encoded-ca-cert>
```

### 3.2 成员集群加入
```bash
# 使用kubefed加入集群
kubefed join cluster2 --cluster-context cluster2 \
    --host-cluster-context host-cluster \
    --v=2

# 验证集群状态
kubectl -n kube-federation-system get kubefedclusters
```

## 4. 资源联邦
### 4.1 联邦类型配置
```yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedTypeConfig
metadata:
  name: deployments.apps
spec:
  federatedType:
    group: types.kubefed.io
    kind: FederatedDeployment
    pluralName: federateddeployments
    scope: Namespaced
    version: v1beta1
  propagation: Enabled
  targetType:
    group: apps
    kind: Deployment
    pluralName: deployments
    scope: Namespaced
    version: v1
```

### 4.2 联邦资源示例
```yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedDeployment
metadata:
  name: test-deployment
  namespace: test-namespace
spec:
  template:
    metadata:
      labels:
        app: nginx
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
          - image: nginx:1.17
            name: nginx
  placement:
    clusters:
    - name: cluster1
    - name: cluster2
  overrides:
  - clusterName: cluster1
    clusterOverrides:
    - path: "/spec/replicas"
      value: 2
```

## 5. 服务发现
### 5.1 DNS配置
```yaml
apiVersion: multiclusterdns.kubefed.io/v1alpha1
kind: Domain
metadata:
  name: example.com
  namespace: kube-federation-system
spec:
  domain: example.com
```

### 5.2 服务注册
```yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedService
metadata:
  name: test-service
  namespace: test-namespace
spec:
  template:
    metadata:
      labels:
        app: nginx
    spec:
      ports:
      - port: 80
        targetPort: 80
      selector:
        app: nginx
  placement:
    clusters:
    - name: cluster1
    - name: cluster2
```

## 6. 负载均衡
### 6.1 跨集群负载均衡
```yaml
apiVersion: scheduling.kubefed.io/v1alpha1
kind: ReplicaSchedulingPreference
metadata:
  name: test-deployment
  namespace: test-namespace
spec:
  targetKind: FederatedDeployment
  totalReplicas: 9
  clusters:
    cluster1:
      minReplicas: 2
      maxReplicas: 4
      weight: 2
    cluster2:
      minReplicas: 2
      maxReplicas: 4
      weight: 1
```

### 6.2 策略配置
```yaml
apiVersion: scheduling.kubefed.io/v1alpha1
kind: ReplicaSchedulingStrategy
metadata:
  name: test-strategy
spec:
  spreadPolicy:
    spreadByField: region
    weightedFields:
    - name: zone
      weight: 2
    - name: rack
      weight: 1
```

## 7. 多集群网络
### 7.1 服务网格集成
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: cross-cluster-service
spec:
  hosts:
  - service.test-namespace.svc.cluster.local
  location: MESH_INTERNAL
  ports:
  - number: 80
    name: http
    protocol: HTTP
  resolution: DNS
  endpoints:
  - address: service.cluster1
    ports:
      http: 80
  - address: service.cluster2
    ports:
      http: 80
```

### 7.2 网络策略
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: federation-policy
spec:
  podSelector:
    matchLabels:
      app: nginx
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          federation: enabled
```

## 8. 监控与日志
### 8.1 联邦监控
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: federation-monitor
spec:
  selector:
    matchLabels:
      kubefed: enabled
  endpoints:
  - port: metrics
    interval: 30s
  namespaceSelector:
    matchNames:
    - kube-federation-system
```

### 8.2 日志聚合
```yaml
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
  name: federation-logs
spec:
  globalOutputRefs:
    - federation-elasticsearch
  match:
    - select:
        labels:
          app.kubernetes.io/name: kubefed
```

## 9. 灾难恢复
### 9.1 备份配置
```yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: federation-backup
  namespace: velero
spec:
  includedNamespaces:
  - kube-federation-system
  includedResources:
  - kubefedclusters
  - federatedtypeconfigs
  ttl: 720h0m0s
```

### 9.2 恢复流程
```yaml
apiVersion: velero.io/v1
kind: Restore
metadata:
  name: federation-restore
  namespace: velero
spec:
  backupName: federation-backup
  includedNamespaces:
  - kube-federation-system
  restorePVs: true
```

## 10. 最佳实践
1. 合理规划集群拓扑
2. 实施资源配额管理
3. 配置适当的备份策略
4. 实现监控告警
5. 做好网络规划
6. 保持版本一致性
7. 实施变更管理
8. 定期演练恢复流程

## 11. 故障排查
### 11.1 常见问题
```bash
# 检查Federation控制器状态
kubectl -n kube-federation-system get pods

# 查看Federation事件
kubectl -n kube-federation-system get events

# 检查集群健康状态
kubefed check
```

### 11.2 日志分析
```bash
# 查看控制器日志
kubectl -n kube-federation-system logs \
    deployment/kubefed-controller-manager

# 查看API服务器日志
kubectl -n kube-federation-system logs \
    deployment/kubefed-apiserver
```

## 参考资料
1. Kubernetes Federation文档
2. 多集群管理最佳实践
3. Federation架构设计 