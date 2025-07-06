---
title: 基础命令
sidebar_label: 01_基础命令
---

# Linux 基础命令

本页介绍Linux系统中最常用的一些基础命令。熟练掌握这些命令是进行有效系统管理的第一步。

## 文件和目录操作

### `ls` - 列出目录内容
-   `ls`: 列出当前目录内容。
-   `ls -l`: 列出详细信息（长格式）。
-   `ls -a`: 列出所有文件，包括隐藏文件。
-   `ls -lh`: 以人类可读的格式显示文件大小。

### `cd` - 切换目录
-   `cd /path/to/directory`: 切换到指定目录。
-   `cd ..`: 切换到上级目录。
-   `cd ~` 或 `cd`: 切换到当前用户的主目录。

### `pwd` - 显示当前工作目录
-   `pwd`: 打印当前工作目录的绝对路径。

### `mkdir` - 创建目录
-   `mkdir directory_name`: 创建一个新目录。
-   `mkdir -p /path/to/new_directory`: 递归创建目录，如果父目录不存在则一并创建。

### `rmdir` - 删除空目录
-   `rmdir directory_name`: 删除一个空目录。

### `rm` - 删除文件或目录
-   `rm file_name`: 删除一个文件（会提示确认）。
-   `rm -f file_name`: 强制删除文件，不提示。
-   `rm -r directory_name`: 递归删除目录及其内容（危险操作，慎用！）。
-   `rm -rf directory_name`: 强制递归删除目录及其内容（极度危险操作，务必小心！）。

### `cp` - 复制文件或目录
-   `cp source_file destination_file`: 复制文件。
-   `cp -r source_directory destination_directory`: 递归复制目录。

### `mv` - 移动或重命名文件/目录
-   `mv old_name new_name`: 重命名文件或目录。
-   `mv source_file_or_directory destination_directory/`: 移动文件或目录到指定位置。

## 查看文件内容

### `cat` - 查看文件全部内容
-   `cat file_name`: 将文件内容输出到标准输出。

### `less` - 分页查看文件内容
-   `less file_name`: 允许上下翻页查看文件内容。按 `q` 退出。

### `head` - 查看文件头部内容
-   `head file_name`: 默认显示文件的前10行。
-   `head -n 20 file_name`: 显示文件的前20行。

### `tail` - 查看文件尾部内容
-   `tail file_name`: 默认显示文件的后10行。
-   `tail -n 20 file_name`: 显示文件的后20行。
-   `tail -f file_name`: 实时跟踪文件的新增内容（常用于查看日志）。

## 文本处理 (简单示例)

### `grep` - 文本搜索
-   `grep "pattern" file_name`: 在文件中搜索包含指定模式的行。
-   `grep -i "pattern" file_name`: 忽略大小写搜索。
-   `grep -r "pattern" directory/`: 递归搜索目录。

---
*更多命令和详细用法将在后续章节介绍。*
