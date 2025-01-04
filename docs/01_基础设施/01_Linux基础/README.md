# Linux 基础教程

## Linux 系统简介

Linux 是一个开源的操作系统内核，由 Linus Torvalds 在1991年首次发布。它是目前最广泛使用的服务器操作系统之一。

### 主要发行版

- **RedHat 系列**
  - Red Hat Enterprise Linux (RHEL)
  - CentOS
  - Fedora

- **Debian 系列**
  - Debian
  - Ubuntu
  - Linux Mint

- **其他发行版**
  - SUSE Linux Enterprise
  - openSUSE
  - Arch Linux

## 文件系统结构

Linux 采用树形目录结构，主要目录及其用途如下：

```bash
/           # 根目录
├── bin     # 基本命令
├── boot    # 启动文件
├── dev     # 设备文件
├── etc     # 配置文件
├── home    # 用户目录
├── lib     # 系统库文件
├── media   # 可移动设备挂载点
├── mnt     # 临时挂载点
├── opt     # 可选应用程序
├── proc    # 进程信息
├── root    # root用户目录
├── sbin    # 系统管理命令
├── srv     # 服务数据目录
├── tmp     # 临时文件
├── usr     # 用户程序
└── var     # 可变数据
```

## 基本操作

### 文件管理

```bash
# 文件操作示例
touch file.txt              # 创建空文件
echo "Hello" > file.txt     # 写入内容
cat file.txt               # 查看文件内容
cp file.txt backup.txt     # 复制文件
mv file.txt new.txt        # 重命名/移动文件
rm file.txt               # 删除文件

# 目录操作示例
mkdir docs                # 创建目录
cd docs                  # 进入目录
pwd                     # 显示当前目录
ls -la                  # 列出所有文件（包括隐藏文件）
rmdir docs              # 删除空目录
rm -rf docs             # 强制删除目录及其内容
```

### 权限管理

Linux 文件权限分为读(r)、写(w)、执行(x)三种，分别用数字4、2、1表示：

```bash
# 权限示例
chmod 755 script.sh      # 设置权限为 rwxr-xr-x
chmod u+x script.sh      # 给所有者添加执行权限
chown user:group file    # 更改文件所有者和组
```

权限解释：
```
rwxr-xr-x = 755
rwx = 7 (所有者)
r-x = 5 (组)
r-x = 5 (其他)
```

### 进程管理

```bash
# 进程管理示例
ps aux                  # 显示所有进程
top                     # 动态显示进程信息
kill -9 PID            # 强制终止进程
killall process_name    # 终止指定名称的所有进程
nohup command &         # 后台运行命令
```

### 系统信息

```bash
# 系统信息查看
uname -a                # 显示系统信息
cat /etc/os-release    # 显示发行版信息
uptime                 # 显示系统运行时间
free -h                # 显示内存使用情况
df -h                  # 显示磁盘使用情况
```

## 常用工具

### 文本处理

```bash
# 文本处理工具
grep "pattern" file     # 搜索文本
sed 's/old/new/g' file # 替换文本
awk '{print $1}' file  # 处理文本
sort file              # 排序
uniq                   # 去重
wc -l file            # 统计行数
```

### 网络工具

```bash
# 网络命令
ping host             # 测试网络连接
curl url             # 发送 HTTP 请求
wget url            # 下载文件
netstat -tunlp      # 显示网络连接
ifconfig            # 显示网络接口
ip addr            # 显示 IP 地址
```

### 压缩解压

```bash
# 压缩命令
tar -czf file.tar.gz dir/   # 压缩目录
tar -xzf file.tar.gz       # 解压文件
zip -r file.zip dir/       # ZIP压缩
unzip file.zip            # ZIP解压
gzip file                # GZIP压缩
gunzip file.gz           # GZIP解压
```

## 实用技巧

### 命令历史

```bash
history              # 显示命令历史
!n                  # 执行历史记录中的第n条命令
!!                  # 执行上一条命令
ctrl + r            # 搜索历史命令
```

### 快捷键

- `Ctrl + C`: 中断当前命令
- `Ctrl + Z`: 暂停当前命令
- `Ctrl + D`: 退出当前终端
- `Ctrl + L`: 清屏
- `Ctrl + A`: 光标移到行首
- `Ctrl + E`: 光标移到行尾
- `Ctrl + U`: 删除光标前的所有字符
- `Ctrl + K`: 删除光标后的所有字符

## 练习任务

1. 文件操作练习
   ```bash
   # 创建目录结构
   mkdir -p project/{src,docs,test}
   
   # 创建文件
   touch project/src/{main.py,utils.py}
   
   # 写入内容
   echo "print('Hello World')" > project/src/main.py
   
   # 复制文件
   cp project/src/main.py project/test/
   ```

2. 权限管理练习
   ```bash
   # 创建脚本
   echo "#!/bin/bash" > script.sh
   echo "echo 'Hello World'" >> script.sh
   
   # 设置权限
   chmod 755 script.sh
   
   # 执行脚本
   ./script.sh
   ```

3. 进程管理练习
   ```bash
   # 后台运行进程
   sleep 100 &
   
   # 查看进程
   ps aux | grep sleep
   
   # 终止进程
   kill %1
   ```

<Vssue title="Linux基础教程" /> 