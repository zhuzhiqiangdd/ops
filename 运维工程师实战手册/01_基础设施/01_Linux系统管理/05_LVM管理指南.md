# LVM 管理指南

## 1. LVM 基础概念

### 1.1 什么是 LVM
LVM（Logical Volume Management）是 Linux 环境下对磁盘分区进行管理的一种机制，它在物理硬盘和文件系统之间添加了一个逻辑层，提供了一个更具灵活性的磁盘管理方法。

### 1.2 LVM 的核心组件
1. 物理卷（Physical Volume，PV）
   - 可以是硬盘分区或整个硬盘
   - 是 LVM 的基本存储块
   - 使用 pvcreate 命令创建

2. 卷组（Volume Group，VG）
   - 由一个或多个物理卷组成
   - 是 LVM 中的存储池
   - 使用 vgcreate 命令创建

3. 逻辑卷（Logical Volume，LV）
   - 从卷组中分配空间
   - 相当于传统的分区
   - 使用 lvcreate 命令创建

## 2. LVM 配置步骤

### 2.1 准备物理卷
```bash
# 查看可用磁盘
fdisk -l

# 创建物理卷
pvcreate /dev/sdb
pvcreate /dev/sdc

# 查看物理卷信息
pvdisplay
pvs
```

### 2.2 创建卷组
```bash
# 创建卷组
vgcreate vg_data /dev/sdb /dev/sdc

# 查看卷组信息
vgdisplay
vgs
```

### 2.3 创建逻辑卷
```bash
# 创建逻辑卷
lvcreate -L 100G -n lv_data vg_data

# 查看逻辑卷信息
lvdisplay
lvs
```

### 2.4 格式化和挂载
```bash
# 格式化逻辑卷
mkfs.xfs /dev/vg_data/lv_data

# 创建挂载点并挂载
mkdir /data
mount /dev/vg_data/lv_data /data

# 添加到 fstab 实现开机自动挂载
echo "/dev/vg_data/lv_data /data xfs defaults 0 0" >> /etc/fstab
```

## 3. LVM 管理操作

### 3.1 扩展逻辑卷
```bash
# 扩展逻辑卷
lvextend -L +50G /dev/vg_data/lv_data

# 调整文件系统大小
xfs_growfs /data  # 对于 XFS 文件系统
resize2fs /dev/vg_data/lv_data  # 对于 EXT4 文件系统
```

### 3.2 缩减逻辑卷
```bash
# 注意：XFS 文件系统不支持缩减
# 对于 EXT4 文件系统：
umount /data
e2fsck -f /dev/vg_data/lv_data
resize2fs /dev/vg_data/lv_data 20G
lvreduce -L 20G /dev/vg_data/lv_data
mount /dev/vg_data/lv_data /data
```

### 3.3 移除 LVM 组件
```bash
# 卸载文件系统
umount /data

# 移除逻辑卷
lvremove /dev/vg_data/lv_data

# 移除卷组
vgremove vg_data

# 移除物理卷
pvremove /dev/sdb /dev/sdc
```

## 4. LVM 快照管理

### 4.1 创建快照
```bash
# 创建快照
lvcreate -L 1G -s -n snap_data /dev/vg_data/lv_data

# 查看快照信息
lvs -o +devices,snap_percent
```

### 4.2 恢复快照
```bash
# 恢复快照
lvconvert --merge /dev/vg_data/snap_data
```

## 5. LVM 最佳实践

### 5.1 容量规划
- 为卷组预留足够的扩展空间
- 考虑快照所需的空间
- 监控卷组和逻辑卷的使用情况

### 5.2 性能优化
- 使用条带化提高性能
- 合理设置 PE 大小
- 避免过度使用快照

### 5.3 备份策略
- 定期备份 LVM 配置
- 使用快照进行一致性备份
- 保持备份文档的更新

## 6. 故障排查

### 6.1 常见问题
1. 空间不足
2. 快照满载
3. 设备丢失

### 6.2 修复步骤
1. 检查系统日志
2. 使用 lvmdump 收集信息
3. 执行 vgcfgrestore 恢复配置

## 7. 监控和维护

### 7.1 监控指标
- 卷组空间使用率
- 逻辑卷空间使用率
- 快照空间使用率
- I/O 性能指标

### 7.2 日常维护
- 定期检查空间使用情况
- 清理不需要的快照
- 更新 LVM 工具和配置

## 8. 安全注意事项

### 8.1 访问控制
- 限制 LVM 命令的使用权限
- 实施适当的文件系统权限
- 记录 LVM 操作日志

### 8.2 数据保护
- 使用 RAID 提供冗余保护
- 实施定期备份策略
- 测试恢复程序
``` 