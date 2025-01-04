# Java日志规范

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅] 已完成

## 一、日志分类
### 1.1 应用日志
记录应用运行时的各种状态和事件。

1. 业务日志
   - 业务操作日志
   - 业务状态变更
   - 关键流程节点

2. 系统日志
   - 应用启动/关闭
   - 配置加载/更新
   - 系统状态变更

3. 调试日志
   - 方法调用
   - 参数信息
   - 执行过程

### 1.2 访问日志
记录外部请求的处理情况。

1. HTTP请求日志
   - 请求信息
   - 响应信息
   - 性能指标

2. RPC调用日志
   - 服务调用
   - 接口访问
   - 调用追踪

### 1.3 错误日志
记录系统运行中的异常和错误。

1. 异常日志
   - 业务异常
   - 系统异常
   - 第三方异常

2. 错误日志
   - 参数错误
   - 状态错误
   - 逻辑错误

### 1.4 性能日志
记录系统性能相关的指标。

1. 方法性能
   - 执行时间
   - 资源消耗
   - 调用次数

2. 系统性能
   - CPU使用率
   - 内存使用
   - 线程状态

## 二、字段说明
### 2.1 基础字段
```yaml
timestamp:
  description: 日志时间
  type: String
  format: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
  required: true
  example: "2024-03-21T10:00:00.123+08:00"

level:
  description: 日志级别
  type: String
  values: [TRACE, DEBUG, INFO, WARN, ERROR, FATAL]
  required: true
  example: "INFO"

thread:
  description: 线程名称
  type: String
  required: true
  example: "main" | "http-nio-8080-exec-1"

logger:
  description: 日志记录器名称
  type: String
  required: true
  example: "com.example.service.UserService"

message:
  description: 日志消息
  type: String
  required: true
  example: "用户登录成功"
```

### 2.2 追踪字段
```yaml
trace_id:
  description: 追踪标识
  type: String
  required: true
  example: "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c"

span_id:
  description: 跨度标识
  type: String
  required: true
  example: "1a2b3c4d5e6f"

parent_id:
  description: 父跨度标识
  type: String
  required: false
  example: "0a1b2c3d4e5f"

request_id:
  description: 请求标识
  type: String
  required: false
  example: "REQ-20240321-001"
```

### 2.3 上下文字段
```yaml
class:
  description: 类名
  type: String
  required: true
  example: "UserService"

method:
  description: 方法名
  type: String
  required: true
  example: "login"

line:
  description: 行号
  type: Integer
  required: true
  example: 123

file:
  description: 源文件
  type: String
  required: false
  example: "UserService.java"
```

### 2.4 业务字段
```yaml
user_id:
  description: 用户标识
  type: String
  required: false
  example: "U123456"

operation:
  description: 操作类型
  type: String
  required: false
  example: "LOGIN" | "LOGOUT" | "CREATE"

result:
  description: 操作结果
  type: String
  required: false
  example: "SUCCESS" | "FAILURE"

details:
  description: 详细信息
  type: Object
  required: false
  example: {"reason": "密码错误", "attempts": 3}
```

## 三、日志格式
### 3.1 文本格式
1. 标准格式
   ```
   %d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|%msg%n
   ```

2. 详细格式
   ```
   %d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|%class{36}.%method:%line|%msg%n
   ```

3. 追踪格式
   ```
   %d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|[%X{trace_id},%X{span_id}]|%msg%n
   ```

### 3.2 JSON格式
```json
{
  "timestamp": "2024-03-21T10:00:00.123+08:00",
  "level": "INFO",
  "thread": "main",
  "logger": "com.example.service.UserService",
  "class": "UserService",
  "method": "login",
  "line": 123,
  "trace_id": "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
  "span_id": "1a2b3c4d5e6f",
  "message": "用户登录成功",
  "context": {
    "user_id": "U123456",
    "operation": "LOGIN",
    "result": "SUCCESS"
  }
}
```

## 四、配置示例
### 4.1 Logback配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 属性定义 -->
    <property name="LOG_PATH" value="/var/log/app"/>
    <property name="APP_NAME" value="user-service"/>
    
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|%msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>
    
    <!-- JSON格式文件输出 -->
    <appender name="FILE_JSON" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.json</file>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdcKeyName>trace_id</includeMdcKeyName>
            <includeMdcKeyName>span_id</includeMdcKeyName>
            <includeMdcKeyName>user_id</includeMdcKeyName>
            <customFields>{"app":"${APP_NAME}"}</customFields>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.json</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>
    
    <!-- 错误日志单独输出 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-error.log</file>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
        <encoder>
            <pattern>%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|%class{36}.%method:%line|%msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-error-%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>
    
    <!-- 异步输出 -->
    <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <discardingThreshold>0</discardingThreshold>
        <queueSize>512</queueSize>
        <appender-ref ref="FILE_JSON"/>
    </appender>
    
    <!-- 日志级别 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>
    
    <!-- 包级别设置 -->
    <logger name="com.example" level="DEBUG"/>
</configuration>
```

### 4.2 Log4j2配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Properties>
        <Property name="LOG_PATH">/var/log/app</Property>
        <Property name="APP_NAME">user-service</Property>
    </Properties>
    
    <Appenders>
        <!-- 控制台输出 -->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|%msg%n"/>
        </Console>
        
        <!-- JSON格式文件输出 -->
        <RollingFile name="JsonFile" fileName="${LOG_PATH}/${APP_NAME}.json"
                     filePattern="${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.json">
            <JsonLayout complete="false" compact="true" eventEol="true">
                <KeyValuePair key="timestamp" value="$${date:yyyy-MM-dd'T'HH:mm:ss.SSSXXX}"/>
            </JsonLayout>
            <Policies>
                <TimeBasedTriggeringPolicy/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>
        
        <!-- 错误日志输出 -->
        <RollingFile name="ErrorFile" fileName="${LOG_PATH}/${APP_NAME}-error.log"
                     filePattern="${LOG_PATH}/${APP_NAME}-error-%d{yyyy-MM-dd}.log">
            <PatternLayout pattern="%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX}|%-5level|%thread|%logger{36}|%class{36}.%method:%line|%msg%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>
    </Appenders>
    
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="JsonFile"/>
        </Root>
        
        <Logger name="com.example" level="debug" additivity="false">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="JsonFile"/>
        </Logger>
        
        <Logger name="ERROR_LOGGER" level="error" additivity="false">
            <AppenderRef ref="ErrorFile"/>
        </Logger>
    </Loggers>
</Configuration>
```

## 五、日志样例
### 5.1 标准日志
1. 文本格式
   ```
   2024-03-21T10:00:00.123+08:00|INFO |main|com.example.service.UserService|用户登录成功
   2024-03-21T10:00:01.234+08:00|DEBUG|main|com.example.service.UserService|用户参数验证通过: {"username": "john", "loginType": "PASSWORD"}
   2024-03-21T10:00:02.345+08:00|INFO |main|com.example.service.UserService|创建用户会话: SESSION-001
   ```

2. JSON格式
   ```json
   {
     "timestamp": "2024-03-21T10:00:00.123+08:00",
     "level": "INFO",
     "thread": "main",
     "logger": "com.example.service.UserService",
     "message": "用户登录成功",
     "trace_id": "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
     "span_id": "1a2b3c4d5e6f",
     "context": {
       "user_id": "U123456",
       "operation": "LOGIN",
       "result": "SUCCESS",
       "details": {
         "login_type": "PASSWORD",
         "client_ip": "192.168.1.100"
       }
     }
   }
   ```

### 5.2 错误日志
1. 异常堆栈
   ```
   2024-03-21T10:01:00.123+08:00|ERROR|main|com.example.service.UserService|用户登录失败
   java.lang.IllegalArgumentException: 用户名或密码错误
       at com.example.service.UserService.validateCredentials(UserService.java:123)
       at com.example.service.UserService.login(UserService.java:45)
       at com.example.controller.UserController.login(UserController.java:30)
   ```

2. JSON格式
   ```json
   {
     "timestamp": "2024-03-21T10:01:00.123+08:00",
     "level": "ERROR",
     "thread": "main",
     "logger": "com.example.service.UserService",
     "message": "用户登录失败",
     "trace_id": "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
     "span_id": "1a2b3c4d5e6f",
     "exception": {
       "class": "java.lang.IllegalArgumentException",
       "message": "用户名或密码错误",
       "stack_trace": [
         "com.example.service.UserService.validateCredentials(UserService.java:123)",
         "com.example.service.UserService.login(UserService.java:45)",
         "com.example.controller.UserController.login(UserController.java:30)"
       ]
     },
     "context": {
       "user_id": "U123456",
       "operation": "LOGIN",
       "result": "FAILURE",
       "details": {
         "error_code": "AUTH001",
         "error_type": "VALIDATION_ERROR",
         "attempts": 3
       }
     }
   }
   ```

### 5.3 性能日志
1. 方法执行
   ```
   2024-03-21T10:02:00.123+08:00|INFO |main|com.example.service.UserService|方法执行完成: login, 耗时: 150ms
   ```

2. JSON格式
   ```json
   {
     "timestamp": "2024-03-21T10:02:00.123+08:00",
     "level": "INFO",
     "thread": "main",
     "logger": "com.example.service.UserService",
     "message": "方法执行完成",
     "trace_id": "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
     "span_id": "1a2b3c4d5e6f",
     "performance": {
       "method": "login",
       "execution_time": 150,
       "time_unit": "ms",
       "metrics": {
         "db_time": 50,
         "cache_time": 10,
         "business_time": 90
       },
       "resources": {
         "thread_count": 10,
         "memory_used": "256MB",
         "cpu_time": "100ms"
       }
     }
   }
   ```

## 相关文档
- [Python日志规范](02_Python日志规范.md)
- [Go日志规范](03_Go日志规范.md)
- [Node.js日志规范](04_NodeJS日志规范.md)

## 更新记录
- 2024-03-21: 创建Java日志规范文档 