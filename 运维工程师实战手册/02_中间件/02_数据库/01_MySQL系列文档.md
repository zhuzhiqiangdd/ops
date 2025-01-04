# MySQL系列文档

## 1. 基础信息
### 文档信息
- 版本: v1.0.0
- 更新时间: 2024-03-21
- 状态: [🏗️进行中]
- 作者: System Admin

### 修订历史
| 版本 | 日期 | 描述 | 作者 |
|-----|------|-----|-----|
| v1.0.0 | 2024-03-21 | 初始版本 | System Admin |

### 目标读者
- 数据库管理员
- 系统运维工程师
- 应用开发人员
- 架构设计师

### 前置知识
- Linux系统基础
- SQL语言基础
- 存储系统基础
- 网络基础知识

## 2. MySQL概述
### 核心特性
1. 基础功能
   - 事务处理
   - 存储过程
   - 触发器
   - 视图
   - 复制
   - 分区

2. 高级特性
   - InnoDB存储引擎
   - 主从复制
   - 组复制
   - 分区表
   - 全文索引
   - XA事务

### 应用场景
1. OLTP系统
   - 在线交易处理
   - 用户管理系统
   - 订单系统
   - CRM系统

2. 数据仓库
   - 数据分析
   - 报表系统
   - 日志分析
   - 数据挖掘

## 3. 安装部署
### 包管理器安装
```bash
# Ubuntu/Debian
apt update
apt install mysql-server mysql-client

# CentOS/RHEL
yum install mysql-server mysql-client

# 启动服务
systemctl start mysql
systemctl enable mysql
```

### 源码编译安装
```bash
# 安装依赖
apt install build-essential cmake libncurses5-dev bison libssl-dev

# 下载源码
wget https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.36.tar.gz
tar xzf mysql-8.0.36.tar.gz
cd mysql-8.0.36

# 配置编译选项
cmake . \
    -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
    -DMYSQL_DATADIR=/data/mysql \
    -DSYSCONFDIR=/etc \
    -DWITH_INNOBASE_STORAGE_ENGINE=1 \
    -DWITH_PARTITION_STORAGE_ENGINE=1 \
    -DWITH_FEDERATED_STORAGE_ENGINE=1 \
    -DWITH_BLACKHOLE_STORAGE_ENGINE=1 \
    -DWITH_MYISAM_STORAGE_ENGINE=1 \
    -DENABLED_LOCAL_INFILE=1 \
    -DWITH_SSL=system \
    -DWITH_ZLIB=system \
    -DDEFAULT_CHARSET=utf8mb4 \
    -DDEFAULT_COLLATION=utf8mb4_general_ci

# 编译安装
make
make install
```

### 初始化配置
```bash
# 创建MySQL用户和组
groupadd mysql
useradd -r -g mysql -s /bin/false mysql

# 创建数据目录
mkdir -p /data/mysql
chown -R mysql:mysql /data/mysql

# 初始化数据库
mysqld --initialize --user=mysql --basedir=/usr/local/mysql --datadir=/data/mysql

# 配置systemd服务
cat > /etc/systemd/system/mysql.service << EOF
[Unit]
Description=MySQL Server
After=network.target

[Service]
Type=forking
User=mysql
Group=mysql
ExecStart=/usr/local/mysql/bin/mysqld --daemonize
ExecStop=/usr/local/mysql/bin/mysqladmin shutdown
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl daemon-reload
systemctl start mysql
systemctl enable mysql
```

## 4. 基础配置
### 主配置文件
```ini
# /etc/mysql/mysql.cnf
[mysqld]
# 基础配置
user = mysql
pid-file = /var/run/mysqld/mysqld.pid
socket = /var/run/mysqld/mysqld.sock
port = 3306
basedir = /usr/local/mysql
datadir = /data/mysql
tmpdir = /tmp
bind-address = 0.0.0.0

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
init_connect = 'SET NAMES utf8mb4'

# InnoDB配置
innodb_buffer_pool_size = 4G
innodb_log_file_size = 1G
innodb_log_buffer_size = 16M
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# 连接配置
max_connections = 1000
max_connect_errors = 1000
wait_timeout = 600
interactive_timeout = 600

# 日志配置
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_bin = /var/log/mysql/mysql-bin
binlog_format = ROW
expire_logs_days = 7

# 复制配置
server-id = 1
gtid_mode = ON
enforce_gtid_consistency = ON
```

### 安全配置
```bash
# 运行安全配置向导
mysql_secure_installation

# 创建管理用户
mysql -u root -p
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

# 配置防火墙
firewall-cmd --permanent --add-port=3306/tcp
firewall-cmd --reload
```

## 5. 用户权限管理
[移动并整合现有的用户权限管理相关内容]

## 6. 数据库管理工具
[移动并整合现有的管理工具内容]

## 7. 备份与恢复
[移动并整合现有的备份恢复内容]

## 8. 主从复制
[移动并整合现有的主从复制内容]

## 9. 性能优化
### 系统优化
```bash
# /etc/sysctl.conf
# 文件系统优化
fs.file-max = 1000000
fs.aio-max-nr = 1048576

# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_tw_reuse = 1

# 内存优化
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 30
```

### InnoDB优化
```ini
# InnoDB缓冲池优化
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4

# 日志优化
innodb_log_file_size = 1G
innodb_log_buffer_size = 16M
innodb_flush_log_at_trx_commit = 2

# IO优化
innodb_flush_method = O_DIRECT
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_read_io_threads = 8
innodb_write_io_threads = 8

# 并发优化
innodb_thread_concurrency = 0
innodb_lock_wait_timeout = 50
innodb_deadlock_detect = ON
```

### 查询优化
```sql
-- 索引优化
CREATE INDEX idx_name ON users(name);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_created_at ON orders(created_at);

-- 分区优化
CREATE TABLE sales (
    id INT,
    amount DECIMAL(10,2),
    sale_date DATE
)
PARTITION BY RANGE (YEAR(sale_date)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025)
);

-- 查询优化
EXPLAIN SELECT * FROM users WHERE name = 'John';
EXPLAIN SELECT * FROM orders WHERE created_at > '2024-01-01';
```

### 查询优化进阶
```sql
-- 子查询优化
-- 使用JOIN代替IN子查询
SELECT a.* FROM table_a a
INNER JOIN table_b b ON a.id = b.a_id
WHERE b.status = 'active';

-- 替代方案
SELECT a.* FROM table_a a
WHERE EXISTS (
    SELECT 1 FROM table_b b 
    WHERE b.a_id = a.id 
    AND b.status = 'active'
);

-- 分页优化
-- 传统分页可能在数据量大时性能差
SELECT * FROM large_table LIMIT 1000000, 10;

-- 使用主键优化
SELECT * FROM large_table 
WHERE id > (SELECT id FROM large_table LIMIT 1000000, 1)
LIMIT 10;

-- 使用覆盖索引
SELECT id, name FROM users 
WHERE status = 'active'
AND created_at > '2024-01-01'
ORDER BY created_at DESC;

-- 避免SELECT *
SELECT id, username, email 
FROM users 
WHERE status = 'active';

-- 使用UNION ALL代替UNION
SELECT * FROM table_2023
UNION ALL
SELECT * FROM table_2024;
```

### 索引优化进阶
```sql
-- 复合索引最左前缀原则
CREATE INDEX idx_name_age_city ON users(name, age, city);

-- 可以使用的查询
SELECT * FROM users WHERE name = 'John';
SELECT * FROM users WHERE name = 'John' AND age = 25;
SELECT * FROM users WHERE name = 'John' AND age = 25 AND city = 'New York';

-- 无法使用索引的查询
SELECT * FROM users WHERE age = 25;
SELECT * FROM users WHERE city = 'New York';
SELECT * FROM users WHERE age = 25 AND city = 'New York';

-- 前缀索引
CREATE INDEX idx_email ON users(email(20));

-- 降序索引
CREATE INDEX idx_created_at_desc ON orders (created_at DESC);

-- 函数索引
CREATE INDEX idx_lower_email ON users((LOWER(email)));

-- 部分索引
CREATE INDEX idx_status ON orders(status) WHERE status != 'deleted';
```

### 锁优化
```sql
-- 查看当前锁状态
SHOW ENGINE INNODB STATUS\G
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- 设置锁等待超时
SET innodb_lock_wait_timeout = 50;

-- 死锁检测
SET innodb_deadlock_detect = ON;

-- 使用乐观锁
UPDATE products 
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 1;

-- 使用行级锁
SELECT * FROM products WHERE id = 1 FOR UPDATE;
SELECT * FROM products WHERE id = 1 LOCK IN SHARE MODE;
```

### 分区表优化
```sql
-- 范围分区
CREATE TABLE sales (
    id INT NOT NULL,
    amount DECIMAL(10,2),
    sale_date DATE
)
PARTITION BY RANGE (YEAR(sale_date)) (
    PARTITION p_2022 VALUES LESS THAN (2023),
    PARTITION p_2023 VALUES LESS THAN (2024),
    PARTITION p_2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- LIST分区
CREATE TABLE users (
    id INT NOT NULL,
    name VARCHAR(30),
    region VARCHAR(10)
)
PARTITION BY LIST COLUMNS(region) (
    PARTITION p_east VALUES IN ('east', 'east-1', 'east-2'),
    PARTITION p_west VALUES IN ('west', 'west-1', 'west-2'),
    PARTITION p_north VALUES IN ('north', 'north-1', 'north-2'),
    PARTITION p_south VALUES IN ('south', 'south-1', 'south-2')
);

-- HASH分区
CREATE TABLE orders (
    id INT NOT NULL,
    order_date DATE,
    customer_id INT
)
PARTITION BY HASH(customer_id)
PARTITIONS 4;

-- 管理分区
ALTER TABLE sales DROP PARTITION p_2022;
ALTER TABLE sales ADD PARTITION (
    PARTITION p_2025 VALUES LESS THAN (2026)
);
```

### 事务管理
### 事务隔离级别
```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 事务示例
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- 使用保存点
START TRANSACTION;
INSERT INTO orders (customer_id, amount) VALUES (1, 100);
SAVEPOINT order_created;
INSERT INTO order_items (order_id, product_id, quantity) VALUES (LAST_INSERT_ID(), 1, 2);
-- 如果出错，回滚到保存点
ROLLBACK TO order_created;
COMMIT;
```

### 并发控制
```sql
-- 乐观锁实现
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    stock INT,
    version INT,
    INDEX idx_version (version)
);

-- 更新库存
UPDATE products 
SET stock = stock - 1,
    version = version + 1
WHERE id = 1 
AND version = 1
AND stock > 0;

-- 悲观锁实现
START TRANSACTION;
SELECT * FROM products 
WHERE id = 1 
FOR UPDATE;
-- 执行业务逻辑
UPDATE products 
SET stock = stock - 1 
WHERE id = 1;
COMMIT;
```

## 10. 事务管理
[移动并整合现有的事务管理内容]

## 11. 监控告警
[移动并整合现有的监控告警内容]

## 12. 运维管理
[移动并整合现有的运维管理内容]

## 13. 最佳实践
[移动并整合现有的最佳实践内容]

## 14. 参考资料
[保持现有的参考资料内容]

## 相关文档
- [Redis系列文档](./02_Redis系列文档.md)
- [MongoDB系列文档](./03_MongoDB系列文档.md)

## MySQL主从复制详解
### 复制原理
```text
1. 主库写入数据，生成binlog
2. 从库IO线程读取主库binlog，写入relay log
3. 从库SQL线程读取relay log，重放SQL语句
4. 从库应用变更，完成数据同步

复制类型：
- 异步复制：默认模式，主库不等待从库响应
- 半同步复制：主库等待至少一个从库接收日志
- 组复制：多主模式，事务提交需要多数派确认
```

### 主从配置详解
```ini
# 主库配置
binlog-do-db=db1
binlog-do-db=db2
binlog-ignore-db=db3

# 从库配置
replicate-do-db=db1
replicate-do-db=db2
replicate-ignore-db=db3
```

### 主从搭建步骤
```bash
# 1. 主库配置
# 创建复制用户
mysql> CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
mysql> GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
mysql> FLUSH PRIVILEGES;

# 查看主库状态
mysql> SHOW MASTER STATUS\G
*************************** 1. row ***************************
             File: mysql-bin.000003
         Position: 73
     Binlog_Do_DB: 
 Binlog_Ignore_DB: 
Executed_Gtid_Set: 3E11FA47-71CA-11E1-9E33-C80AA9429562:1-5

# 2. 从库配置
# 使用GTID配置复制
mysql> CHANGE MASTER TO
    MASTER_HOST='master_host',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_AUTO_POSITION=1;

# 不使用GTID的配置方式
mysql> CHANGE MASTER TO
    MASTER_HOST='master_host',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000003',
    MASTER_LOG_POS=73;

# 启动从库复制
mysql> START SLAVE;

# 查看从库状态
mysql> SHOW SLAVE STATUS\G
```

### 复制监控和维护
```sql
-- 查看主从延迟
mysql> SHOW SLAVE STATUS\G
# 关注 Seconds_Behind_Master 字段

-- 查看复制错误
mysql> SHOW SLAVE STATUS\G
# 关注 Last_IO_Error 和 Last_SQL_Error 字段

-- 监控复制线程
SELECT * FROM performance_schema.replication_connection_status;
SELECT * FROM performance_schema.replication_applier_status_by_worker;

-- 跳过复制错误
-- 跳过一个事件
mysql> SET GLOBAL sql_slave_skip_counter = 1;
mysql> START SLAVE;

-- 使用GTID时跳过事务
mysql> SET GTID_NEXT='MASTER_UUID:N';
mysql> BEGIN; COMMIT;
mysql> SET GTID_NEXT='AUTOMATIC';

-- 重置从库
mysql> STOP SLAVE;
mysql> RESET SLAVE ALL;

-- 重新搭建主从
mysql> CHANGE MASTER TO ...;
mysql> START SLAVE;
```

### 复制故障处理
```bash
# 1. 主从数据不一致
# 使用pt-table-checksum检查
pt-table-checksum --nocheck-replication-filters \
    --no-check-binlog-format \
    --databases=your_db \
    --tables=your_table \
    h=master,u=root,p=password

# 使用pt-table-sync修复
pt-table-sync --execute \
    h=master,u=root,p=password \
    h=slave,u=root,p=password \
    --databases=your_db \
    --tables=your_table

# 2. 从库复制延迟
# 检查慢查询
mysql> SHOW VARIABLES LIKE '%slow%';
mysql> SHOW GLOBAL STATUS LIKE '%slow%';

# 优化从库配置
innodb_flush_log_at_trx_commit = 2
sync_binlog = 0
innodb_buffer_pool_size = 4G

# 3. 主库空间不足
# 清理二进制日志
mysql> PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);
# 或者指定日志文件
mysql> PURGE BINARY LOGS TO 'mysql-bin.000010';
```

## MySQL管理工具详解
### mysqladmin
```bash
# 基本语法
mysqladmin [options] command [command-options] [command-arg]

# 常用命令示例
# 检查服务器状态
mysqladmin -u root -p status

# 显示详细状态
mysqladmin -u root -p extended-status

# 显示服务器变量
mysqladmin -u root -p variables

# 显示进程列表
mysqladmin -u root -p processlist

# 刷新权限
mysqladmin -u root -p flush-privileges

# 重载日志文件
mysqladmin -u root -p flush-logs

# 检查服务器是否可用
mysqladmin -u root -p ping

# 关闭服务器
mysqladmin -u root -p shutdown

# 修改root密码
mysqladmin -u root -p'oldpassword' password 'newpassword'

# 创建/删除数据库
mysqladmin -u root -p create dbname
mysqladmin -u root -p drop dbname

# 监控服务器状态
mysqladmin -u root -p -i 1 status
# -i 参数指定刷新间隔（秒）

# 查看版本信息
mysqladmin -u root -p version

# 调试命令
mysqladmin -u root -p debug

# 查看InnoDB状态
mysqladmin -u root -p extended-status | grep -i innodb
```

### mysqldump
```bash
# 基本语法
mysqldump [options] database [tables]
mysqldump [options] --databases [options] DB1 [DB2 DB3...]
mysqldump [options] --all-databases [options]

# 1. 完整备份
# 备份所有数据库
mysqldump -u root -p \
    --all-databases \
    --single-transaction \
    --master-data=2 \
    --triggers \
    --routines \
    --events \
    --set-gtid-purged=OFF \
    > full_backup_$(date +%Y%m%d).sql

# 2. 单库备份
mysqldump -u root -p \
    --databases dbname \
    --single-transaction \
    --master-data=2 \
    --triggers \
    --routines \
    --events \
    > dbname_backup_$(date +%Y%m%d).sql

# 3. 单表备份
mysqldump -u root -p \
    dbname tablename \
    --single-transaction \
    --master-data=2 \
    > tablename_backup_$(date +%Y%m%d).sql

# 4. 只备份表结构
mysqldump -u root -p \
    --no-data \
    --databases dbname \
    > dbname_schema_$(date +%Y%m%d).sql

# 5. 只备份数据
mysqldump -u root -p \
    --no-create-info \
    --databases dbname \
    > dbname_data_$(date +%Y%m%d).sql

# 6. 条件备份
mysqldump -u root -p \
    dbname tablename \
    --where="create_time > '2024-01-01'" \
    > partial_backup_$(date +%Y%m%d).sql

# 7. 压缩备份
mysqldump -u root -p \
    --all-databases \
    --single-transaction \
    | gzip > backup_$(date +%Y%m%d).sql.gz

# 8. 远程备份
mysqldump -h remote_host -u root -p \
    --databases dbname \
    --single-transaction \
    > remote_backup_$(date +%Y%m%d).sql

# 9. 并行备份
mysqldump -u root -p \
    --all-databases \
    --single-transaction \
    --parallel=4 \
    > parallel_backup_$(date +%Y%m%d).sql

# 重要参数说明
--single-transaction    # 保证一致性备份
--master-data=2        # 记录binlog位置（注释形式）
--flush-logs           # 刷新日志
--triggers             # 包含触发器
--routines            # 包含存储过程和函数
--events              # 包含事件
--set-gtid-purged=OFF # 不清除GTID信息
--hex-blob            # 二进制数据使用十六进制
--complete-insert     # 使用完整的INSERT语句
--extended-insert     # 使用多行INSERT语句（默认）
--quick               # 逐行读取，避免内存不足
--compress            # 压缩客户端和服务器之间的数据
```

### 备份脚本示例
```bash
#!/bin/bash
# MySQL备份脚本

# 配置信息
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d)
MYSQL_USER="backup"
MYSQL_PASS="password"
MYSQL_HOST="localhost"
RETENTION_DAYS=7
LOG_FILE="/var/log/mysql/backup.log"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# 备份函数
do_backup() {
    local start_time=$(date +%s)
    
    # 完整备份
    log "开始完整备份..."
    mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASS \
        --all-databases \
        --single-transaction \
        --master-data=2 \
        --triggers \
        --routines \
        --events \
        --set-gtid-purged=OFF \
        | gzip > $BACKUP_DIR/$DATE/full_backup.sql.gz
    
    if [ $? -eq 0 ]; then
        log "完整备份成功"
    else
        log "完整备份失败"
        return 1
    fi
    
    # 只备份结构
    log "开始备份数据库结构..."
    mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASS \
        --all-databases \
        --no-data \
        | gzip > $BACKUP_DIR/$DATE/schema_backup.sql.gz
    
    # 备份二进制日志
    log "开始备份二进制日志..."
    mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASS \
        -e "FLUSH BINARY LOGS;"
    
    # 计算备份时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log "备份完成，耗时: $duration 秒"
    
    # 记录备份信息
    echo "Backup completed at $(date)" > $BACKUP_DIR/$DATE/backup_info.txt
    echo "Backup size: $(du -sh $BACKUP_DIR/$DATE | cut -f1)" >> $BACKUP_DIR/$DATE/backup_info.txt
    mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASS \
        -e "SHOW MASTER STATUS\G" >> $BACKUP_DIR/$DATE/backup_info.txt
}

# 清理旧备份
cleanup_old_backups() {
    log "开始清理旧备份..."
    find $BACKUP_DIR -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
    log "清理完成"
}

# 检查备份文件
check_backup() {
    log "开始检查备份文件..."
    local backup_file="$BACKUP_DIR/$DATE/full_backup.sql.gz"
    
    # 检查文件是否存在
    if [ ! -f $backup_file ]; then
        log "备份文件不存在: $backup_file"
        return 1
    fi
    
    # 检查文件大小
    local file_size=$(stat -f%z "$backup_file")
    if [ $file_size -lt 1024 ]; then
        log "备份文件大小异常: $file_size bytes"
        return 1
    fi
    
    # 测试解压
    gzip -t $backup_file
    if [ $? -ne 0 ]; then
        log "备份文件损坏"
        return 1
    fi
    
    log "备份文件检查通过"
    return 0
}

# 主函数
main() {
    log "===== 开始MySQL备份 ====="
    
    # 检查MySQL服务是否可用
    mysqladmin -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASS ping
    if [ $? -ne 0 ]; then
        log "无法连接MySQL服务器"
        exit 1
    fi
    
    # 执行备份
    do_backup
    if [ $? -eq 0 ]; then
        # 检查备份
        check_backup
        if [ $? -eq 0 ]; then
            # 清理旧备份
            cleanup_old_backups
        fi
    fi
    
    log "===== MySQL备份结束 ====="
}

# 执行主函数
main 