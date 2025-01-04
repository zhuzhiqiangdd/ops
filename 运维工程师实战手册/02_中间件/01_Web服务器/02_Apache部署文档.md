# Apache部署文档

## 文档信息
- 版本: v1.0.0
- 更新时间: 2024-03-21
- 状态: [🏗️进行中]
- 作者: System Admin

## 修订历史
| 版本 | 日期 | 描述 | 作者 |
|-----|------|-----|-----|
| v1.0.0 | 2024-03-21 | 初始版本 | System Admin |

## 文档说明
### 目标读者
- 系统管理员
- Web运维工程师
- 应用开发人员
- 架构设计师

### 前置知识
- Linux系统基础
- Web服务基础
- 网络协议基础
- 安全基础知识

## Apache概述
### 主要特性
1. 基础功能
   - HTTP/HTTPS服务
   - 虚拟主机支持
   - 模块化架构
   - 访问控制

2. 高级特性
   - 多处理模块(MPM)
   - SSL/TLS支持
   - URL重写
   - 反向代理

### 应用场景
1. Web服务
   - 静态网站托管
   - 动态内容处理
   - 虚拟主机服务
   - 开发测试环境

2. 应用服务
   - PHP应用托管
   - Python应用托管
   - Java应用代理
   - WebDAV服务

## 安装部署
### 包管理器安装
```bash
# Ubuntu/Debian
apt update
apt install apache2

# CentOS/RHEL
yum install httpd

# 启动服务
# Ubuntu/Debian
systemctl start apache2
systemctl enable apache2

# CentOS/RHEL
systemctl start httpd
systemctl enable httpd
```

### 源码编译安装
```bash
# 安装依赖
apt install build-essential libapr1-dev libaprutil1-dev libpcre3-dev libssl-dev

# 下载源码
wget https://downloads.apache.org/httpd/httpd-2.4.58.tar.gz
tar xzf httpd-2.4.58.tar.gz
cd httpd-2.4.58

# 配置编译选项
./configure \
    --prefix=/usr/local/apache2 \
    --enable-ssl \
    --enable-so \
    --enable-rewrite \
    --enable-proxy \
    --enable-proxy-http \
    --with-mpm=event

# 编译安装
make
make install
```

## 基础配置
### 主配置文件
```apache
# /etc/apache2/apache2.conf 或 /etc/httpd/conf/httpd.conf
# 基础配置
ServerRoot "/etc/apache2"
Listen 80
ServerAdmin webmaster@localhost
ServerName localhost

# MPM配置
<IfModule mpm_prefork_module>
    StartServers          5
    MinSpareServers       5
    MaxSpareServers      10
    MaxRequestWorkers    150
    MaxConnectionsPerChild   0
</IfModule>

# 模块加载
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# 目录配置
<Directory />
    Options None
    AllowOverride None
    Require all denied
</Directory>

<Directory /var/www/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# 日志配置
LogFormat "%h %l %u %t \"%r\" %>s %b" common
LogFormat "%v:%p %h %l %u %t \"%r\" %>s %b" vhost_common

ErrorLog ${APACHE_LOG_DIR}/error.log
CustomLog ${APACHE_LOG_DIR}/access.log combined
```

### 虚拟主机配置
```apache
# /etc/apache2/sites-available/example.com.conf
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com
    
    # 日志配置
    ErrorLog ${APACHE_LOG_DIR}/example.com-error.log
    CustomLog ${APACHE_LOG_DIR}/example.com-access.log combined
    
    # 目录配置
    <Directory /var/www/example.com>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
    </Directory>
    
    # PHP配置
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
</VirtualHost>
```

## 高级配置
### SSL配置
```apache
# SSL虚拟主机配置
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/example.com
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/example.com.crt
    SSLCertificateKeyFile /etc/ssl/private/example.com.key
    SSLCertificateChainFile /etc/ssl/certs/chain.crt
    
    # 现代SSL配置
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder on
    SSLCompression off
    
    # HSTS配置
    Header always set Strict-Transport-Security "max-age=63072000"
</VirtualHost>
```

### 反向代理配置
```apache
# 反向代理配置
<VirtualHost *:80>
    ServerName proxy.example.com
    
    ProxyRequests Off
    ProxyPreserveHost On
    
    <Proxy *>
        Require all granted
    </Proxy>
    
    ProxyPass / http://backend.example.com:8080/
    ProxyPassReverse / http://backend.example.com:8080/
    
    # 设置代理头
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
</VirtualHost>
```

## 性能优化
### MPM优化
```apache
# Event MPM配置
<IfModule mpm_event_module>
    StartServers             3
    MinSpareThreads         75
    MaxSpareThreads        250
    ThreadLimit            64
    ThreadsPerChild        25
    MaxRequestWorkers     400
    MaxConnectionsPerChild   0
</IfModule>

# Worker MPM配置
<IfModule mpm_worker_module>
    StartServers             3
    MinSpareThreads         75
    MaxSpareThreads        250
    ThreadsPerChild         25
    MaxRequestWorkers      400
    MaxConnectionsPerChild   0
</IfModule>
```

### 缓存优化
```apache
# 模块加载
LoadModule cache_module modules/mod_cache.so
LoadModule cache_disk_module modules/mod_cache_disk.so

# 缓存配置
CacheRoot /var/cache/apache2/mod_cache_disk
CacheEnable disk /
CacheDirLevels 2
CacheDirLength 1
CacheDefaultExpire 3600
CacheMaxExpire 86400
CacheLastModifiedFactor 0.5
CacheIgnoreHeaders Set-Cookie
```

## 安全配置
### 基础安全
```apache
# 隐藏版本信息
ServerTokens Prod
ServerSignature Off

# 禁用目录浏览
Options -Indexes

# 限制HTTP方法
<Location />
    <LimitExcept GET POST HEAD>
        Require all denied
    </LimitExcept>
</Location>

# 防止点击劫持
Header always append X-Frame-Options SAMEORIGIN
```

### 访问控制
```apache
# IP访问控制
<Directory /var/www/admin>
    Require ip 192.168.1.0/24
</Directory>

# 基本认证
<Directory /var/www/private>
    AuthType Basic
    AuthName "Restricted Access"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Directory>

# ModSecurity配置
<IfModule security2_module>
    SecRuleEngine On
    SecRequestBodyAccess On
    SecRule REQUEST_HEADERS:Content-Type "text/xml" \
         "id:1,phase:1,t:none,t:lowercase,pass,nolog,ctl:requestBodyProcessor=XML"
</IfModule>
```

## 监控管理
### 状态监控
```apache
# 开启状态页
<Location /server-status>
    SetHandler server-status
    Require ip 127.0.0.1
</Location>

# 开启信息页
<Location /server-info>
    SetHandler server-info
    Require ip 127.0.0.1
</Location>
```

### 日志管理
```apache
# 自定义日志格式
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
LogFormat "%h %l %u %t \"%r\" %>s %b" common
LogFormat "%{Referer}i -> %U" referer
LogFormat "%{User-agent}i" agent

# 日志轮转配置
# /etc/logrotate.d/apache2
/var/log/apache2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 root adm
    sharedscripts
    postrotate
        if /etc/init.d/apache2 status > /dev/null ; then
            /etc/init.d/apache2 reload > /dev/null
        fi
    endscript
}
```

## 故障处理
### 常见问题
1. 启动问题
   - 端口冲突
   - 配置语法错误
   - 权限问题
   - 模块缺失

2. 性能问题
   - 连接数过高
   - 内存使用过多
   - 响应时间长
   - CPU使用率高

### 故障排查
```bash
# 检查配置
apache2ctl -t
httpd -t

# 检查模块
apache2ctl -M
httpd -M

# 检查进程
ps aux | grep apache2
ps aux | grep httpd

# 检查日志
tail -f /var/log/apache2/error.log
tail -f /var/log/httpd/error_log
```

## 最佳实践
### 部署建议
1. 目录结构
   ```
   /etc/apache2/
   ├── apache2.conf
   ├── mods-available/
   ├── mods-enabled/
   ├── sites-available/
   └── sites-enabled/
   ```

2. 安全建议
   - 及时更新版本
   - 最小权限原则
   - 启用SSL/TLS
   - 配置访问控制
   - 启用安全模块

3. 性能建议
   - 选择合适的MPM
   - 优化配置参数
   - 启用缓存机制
   - 合理使用模块
   - 监控系统资源

## 参考资料
- [Apache官方文档](https://httpd.apache.org/docs/)
- [Apache安全指南](https://httpd.apache.org/docs/2.4/misc/security_tips.html)
- [Apache性能调优](https://httpd.apache.org/docs/2.4/misc/perf-tuning.html)

## 相关文档
- [Nginx配置指南](./01_Nginx配置指南.md)
- [Tomcat优化指南](./03_Tomcat优化指南.md) 