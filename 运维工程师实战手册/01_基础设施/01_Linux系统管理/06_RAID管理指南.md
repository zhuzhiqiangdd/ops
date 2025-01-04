# RAID 管理指南

## 1. RAID 基础概念

### 1.1 什么是 RAID
RAID（Redundant Array of Independent Disks）是一种将多个硬盘组合起来形成一个逻辑存储单元的技术，用于提供数据冗余或提高性能。

### 1.2 RAID 级别说明
1. RAID 0（条带化）
   - 至少需要2块硬盘
   - 数据被分散存储在所有磁盘上
   - 提供最佳性能但无冗余
   - 适用于对性能要求高但数据安全性要求低的场景

2. RAID 1（镜像）
   - 至少需要2块硬盘
   - 数据完全镜像到另一块磁盘
   - 提供完整的数据冗余
   - 适用于对数据安全性要求高的场景

3. RAID 5
   - 至少需要3块硬盘
   - 使用奇偶校验提供冗余
   - 平衡了性能和冗余
   - 适用于大多数生产环境

4. RAID 6
   - 至少需要4块硬盘
   - 使用双重奇偶校验
   - 可以承受两块磁盘同时故障
   - 适用于对数据安全性要求极高的场景

5. RAID 10
   - 至少需要4块硬盘
   - RAID 1和RAID 0的组合
   - 提供高性能和高可靠性
   - 适用于关键业务系统

## 2. 软件 RAID 配置

### 2.1 准备工作
```bash
# 安装必要工具
apt-get install mdadm  # Debian/Ubuntu
yum install mdadm      # RHEL/CentOS

# 查看可用磁盘
fdisk -l
```

### 2.2 创建 RAID
```bash
# 创建 RAID 5
mdadm --create /dev/md0 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd

# 创建 RAID 1
mdadm --create /dev/md1 --level=1 --raid-devices=2 /dev/sde /dev/sdf

# 查看 RAID 状态
mdadm --detail /dev/md0
cat /proc/mdstat
```

### 2.3 格式化和挂载
```bash
# 格式化
mkfs.xfs /dev/md0

# 创建挂载点并挂载
mkdir /data
mount /dev/md0 /data

# 添加到 fstab
echo "/dev/md0 /data xfs defaults 0 0" >> /etc/fstab
```

### 2.4 保存 RAID 配置
```bash
# 保存配置
mdadm --detail --scan >> /etc/mdadm/mdadm.conf
update-initramfs -u
```

## 3. RAID 管理操作

### 3.1 监控 RAID 状态
```bash
# 查看所有 RAID 状态
mdadm --detail /dev/md0
cat /proc/mdstat

# 检查 RAID 一致性
echo check > /sys/block/md0/md/sync_action
```

### 3.2 添加备用磁盘
```bash
# 添加热备盘
mdadm /dev/md0 --add /dev/sdg

# 查看是否添加成功
mdadm --detail /dev/md0
```

### 3.3 更换故障磁盘
```bash
# 标记磁盘为故障
mdadm /dev/md0 --fail /dev/sdb

# 移除故障磁盘
mdadm /dev/md0 --remove /dev/sdb

# 添加新磁盘
mdadm /dev/md0 --add /dev/sdh
```

### 3.4 停止和删除 RAID
```bash
# 卸载文件系统
umount /data

# 停止 RAID
mdadm --stop /dev/md0

# 删除 RAID 标记
mdadm --zero-superblock /dev/sdb /dev/sdc /dev/sdd
```

## 4. RAID 性能优化

### 4.1 条带大小选择
- 根据工作负载类型选择合适的条带大小
- 小文件操作：较小的条带大小
- 大文件操作：较大的条带大小

### 4.2 读写性能优化
```bash
# 调整读取预读大小
blockdev --setra 4096 /dev/md0

# 设置 RAID 重建速度
echo 100000 > /proc/sys/dev/raid/speed_limit_min
echo 200000 > /proc/sys/dev/raid/speed_limit_max
```

## 5. RAID 监控和维护

### 5.1 设置监控
```bash
# 配置邮件通知
echo MAILADDR root@localhost > /etc/mdadm/mdadm.conf

# 启动监控服务
systemctl enable mdadm
systemctl start mdadm
```

### 5.2 定期检查
```bash
# 创建检查脚本
cat > /usr/local/bin/raid_check.sh << 'EOF'
#!/bin/bash
mdadm --detail /dev/md0 | grep -i state
cat /proc/mdstat
EOF
chmod +x /usr/local/bin/raid_check.sh

# 添加到 crontab
echo "0 0 * * * /usr/local/bin/raid_check.sh" >> /etc/crontab
```

## 6. RAID 故障排查

### 6.1 常见问题
1. 磁盘故障
2. 重建失败
3. 性能下降
4. 配置丢失

### 6.2 故障处理步骤
1. 检查系统日志
   ```bash
   journalctl -u mdadm
   ```

2. 检查 RAID 状态
   ```bash
   mdadm --detail /dev/md0
   cat /proc/mdstat
   ```

3. 检查硬盘状态
   ```bash
   smartctl -a /dev/sdb
   ```

## 7. RAID 备份策略

### 7.1 配置备份
```bash
# 备份 RAID 配置
cp /etc/mdadm/mdadm.conf /etc/mdadm/mdadm.conf.bak

# 导出 RAID 信息
mdadm --detail --scan > /root/raid_config.txt
```

### 7.2 数据备份
- 使用快照进行备份
- 实施定期备份计划
- 测试备份恢复流程

## 8. 安全注意事项

### 8.1 访问控制
- 限制 RAID 管理命令的使用权限
- 实施适当的文件系统权限
- 记录 RAID 操作日志

### 8.2 数据保护
- 定期检查 RAID 状态
- 保持充足的备用磁盘
- 实施完整的备份策略
``` 