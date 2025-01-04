# Tomcat优化指南

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
- Java应用运维人员
- 系统管理员
- 性能优化工程师
- 应用开发人员

### 前置知识
- Java基础知识
- Tomcat架构原理
- Linux系统基础
- JVM调优经验

## Tomcat概述
### 核心组件
1. 基础组件
   - Connector（连接器）
   - Container（容器）
   - Engine（引擎）
   - Host（虚拟主机）
   - Context（应用上下文）

2. 功能组件
   - Manager（会话管理）
   - Loader（类加载器）
   - Pipeline（管道）
   - Valve（阀门）

### 工作原理
1. 请求处理流程
   ```
   Client Request
        ↓
   Connector (HTTP/AJP)
        ↓
   Engine
        ↓
   Host
        ↓
   Context
        ↓
   Servlet
   ```

2. 线程模型
   - Acceptor线程
   - Poller线程
   - Worker线程池

## 安装配置
### JDK配置
```bash
# 安装JDK
apt install openjdk-11-jdk

# 配置JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

### Tomcat安装
```bash
# 下载Tomcat
wget https://downloads.apache.org/tomcat/tomcat-9/v9.0.85/bin/apache-tomcat-9.0.85.tar.gz
tar xzf apache-tomcat-9.0.85.tar.gz
mv apache-tomcat-9.0.85 /usr/local/tomcat9

# 创建用户
useradd -r -m -U -d /usr/local/tomcat9 -s /bin/false tomcat

# 设置权限
chown -R tomcat:tomcat /usr/local/tomcat9
chmod -R 750 /usr/local/tomcat9
```

### 系统服务配置
```ini
# /etc/systemd/system/tomcat.service
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
Environment=JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
Environment=CATALINA_PID=/usr/local/tomcat9/temp/tomcat.pid
Environment=CATALINA_HOME=/usr/local/tomcat9
Environment=CATALINA_BASE=/usr/local/tomcat9

ExecStart=/usr/local/tomcat9/bin/startup.sh
ExecStop=/usr/local/tomcat9/bin/shutdown.sh

User=tomcat
Group=tomcat
UMask=0007
RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
```

## JVM优化
### 内存配置
```bash
# bin/setenv.sh
JAVA_OPTS="$JAVA_OPTS \
    -server \
    -Xms2048m \
    -Xmx2048m \
    -XX:MetaspaceSize=256m \
    -XX:MaxMetaspaceSize=512m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/var/log/tomcat/heapdump.hprof"
```

### GC优化
```bash
# GC配置
JAVA_OPTS="$JAVA_OPTS \
    -XX:+UseG1GC \
    -XX:G1HeapRegionSize=32m \
    -XX:+UseGCLogFileRotation \
    -XX:NumberOfGCLogFiles=10 \
    -XX:GCLogFileSize=100M \
    -Xloggc:/var/log/tomcat/gc.log \
    -XX:+PrintGCDetails \
    -XX:+PrintGCDateStamps \
    -XX:+PrintGCTimeStamps \
    -XX:+PrintHeapAtGC \
    -XX:+PrintTenuringDistribution"
```

## 连接器优化
### HTTP连接器配置
```xml
<!-- conf/server.xml -->
<Connector port="8080" 
           protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="500"
           minSpareThreads="20"
           maxConnections="10000"
           acceptCount="100"
           connectionTimeout="20000"
           enableLookups="false"
           maxHttpHeaderSize="8192"
           compression="on"
           compressionMinSize="2048"
           noCompressionUserAgents="gozilla, traviata"
           compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json"
           URIEncoding="UTF-8"/>
```

### AJP连接器配置
```xml
<Connector port="8009" 
           protocol="AJP/1.3"
           maxThreads="200"
           enableLookups="false"
           redirectPort="8443"
           secretRequired="false"
           address="0.0.0.0"/>
```

## 线程池优化
### 线程池配置
```xml
<!-- conf/server.xml -->
<Executor name="tomcatThreadPool" 
          namePrefix="catalina-exec-"
          maxThreads="500"
          minSpareThreads="20"
          maxQueueSize="100"
          prestartminSpareThreads="true"/>

<Connector port="8080" 
           executor="tomcatThreadPool"
           protocol="org.apache.coyote.http11.Http11NioProtocol"/>
```

### 参数说明
1. 线程池参数
   - maxThreads：最大线程数
   - minSpareThreads：最小空闲线程
   - maxQueueSize：等待队列大小
   - prestartminSpareThreads：预启动线程

2. 调优建议
   - maxThreads = ((CPU核心数 * 2) + 1)
   - minSpareThreads = CPU核心数
   - maxQueueSize = maxThreads * 2

## 应用优化
### 应用配置
```xml
<!-- conf/context.xml -->
<Context>
    <!-- 禁用WebSocket会话空闲超时 -->
    <Manager className="org.apache.catalina.session.StandardManager"
             sessionIdLength="32"
             maxInactiveInterval="3600"/>
    
    <!-- 配置资源池 -->
    <Resource name="jdbc/TestDB"
              auth="Container"
              type="javax.sql.DataSource"
              maxTotal="100"
              maxIdle="30"
              maxWaitMillis="10000"
              username="dbuser"
              password="dbpass"
              driverClassName="com.mysql.jdbc.Driver"
              url="jdbc:mysql://localhost:3306/testdb"/>
</Context>
```

### 性能优化
```xml
<!-- web.xml -->
<servlet>
    <servlet-name>default</servlet-name>
    <servlet-class>org.apache.catalina.servlets.DefaultServlet</servlet-class>
    <init-param>
        <param-name>debug</param-name>
        <param-value>0</param-value>
    </init-param>
    <init-param>
        <param-name>listings</param-name>
        <param-value>false</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>
```

## 安全优化
### 基础安全
```xml
<!-- conf/server.xml -->
<Connector port="8080"
           protocol="org.apache.coyote.http11.Http11NioProtocol"
           server="Apache"  <!-- 隐藏版本信息 -->
           xpoweredBy="false"/>

<!-- conf/web.xml -->
<security-constraint>
    <web-resource-collection>
        <web-resource-name>Restricted Access</web-resource-name>
        <url-pattern>/manager/*</url-pattern>
    </web-resource-collection>
    <auth-constraint>
        <role-name>manager-gui</role-name>
    </auth-constraint>
</security-constraint>
```

### SSL配置
```xml
<Connector port="8443"
           protocol="org.apache.coyote.http11.Http11NioProtocol"
           SSLEnabled="true"
           maxThreads="150"
           scheme="https"
           secure="true"
           keystoreFile="/path/to/keystore"
           keystorePass="password"
           clientAuth="false"
           sslProtocol="TLS"
           sslEnabledProtocols="TLSv1.2,TLSv1.3"
           ciphers="TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256"/>
```

## 监控管理
### JMX监控
```bash
# bin/setenv.sh
JAVA_OPTS="$JAVA_OPTS \
    -Dcom.sun.management.jmxremote \
    -Dcom.sun.management.jmxremote.port=8999 \
    -Dcom.sun.management.jmxremote.ssl=false \
    -Dcom.sun.management.jmxremote.authenticate=true \
    -Dcom.sun.management.jmxremote.password.file=/usr/local/tomcat9/conf/jmxremote.password \
    -Dcom.sun.management.jmxremote.access.file=/usr/local/tomcat9/conf/jmxremote.access"
```

### 日志配置
```xml
<!-- conf/logging.properties -->
handlers = 1catalina.org.apache.juli.AsyncFileHandler, \
          2localhost.org.apache.juli.AsyncFileHandler, \
          3manager.org.apache.juli.AsyncFileHandler, \
          java.util.logging.ConsoleHandler

.handlers = 1catalina.org.apache.juli.AsyncFileHandler

1catalina.org.apache.juli.AsyncFileHandler.level = FINE
1catalina.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
1catalina.org.apache.juli.AsyncFileHandler.prefix = catalina.
1catalina.org.apache.juli.AsyncFileHandler.maxDays = 90
1catalina.org.apache.juli.AsyncFileHandler.encoding = UTF-8
```

## 性能监控
### 监控指标
1. JVM指标
   - 堆内存使用率
   - GC频率和时间
   - 线程数量
   - CPU使用率

2. Tomcat指标
   - 请求处理时间
   - 连接数量
   - 线程池状态
   - 会话数量

### 监控工具
```bash
# 使用jstat监控GC
jstat -gcutil $PID 1000

# 使用jmap导出堆内存
jmap -dump:format=b,file=/tmp/heap.bin $PID

# 使用jstack查看线程状态
jstack -l $PID > /tmp/thread.dump
```

## 故障处理
### 常见问题
1. 内存问题
   - 内存泄漏
   - OOM异常
   - GC问题
   - 堆栈溢出

2. 性能问题
   - 响应慢
   - CPU高
   - 连接数满
   - 线程阻塞

### 问题排查
```bash
# 内存分析
jmap -heap $PID
jmap -histo:live $PID

# 线程分析
jstack $PID
top -Hp $PID

# GC分析
jstat -gcutil $PID 1000
```

## 最佳实践
### 优化建议
1. JVM优化
   - 合理设置内存大小
   - 选择适合的GC算法
   - 开启GC日志
   - 设置OOM dump

2. 应用优化
   - 使用连接池
   - 优化JDBC查询
   - 合理设置缓存
   - 避免内存泄漏

3. 配置优化
   - 调整线程池大小
   - 优化连接器参数
   - 启用压缩
   - 配置安全选项

### 运维建议
1. 监控告警
   - 设置监控指标
   - 配置告警阈值
   - 建立告警机制
   - 定期检查日志

2. 定期维护
   - 版本升级
   - 日志清理
   - 配置备份
   - 性能测试

## 参考资料
- [Tomcat官方文档](https://tomcat.apache.org/tomcat-9.0-doc/index.html)
- [Tomcat性能优化](https://tomcat.apache.org/tomcat-9.0-doc/config/http.html)
- [JVM调优指南](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/)

## 相关文档
- [Nginx配置指南](./01_Nginx配置指南.md)
- [Apache部署文档](./02_Apache部署文档.md) 