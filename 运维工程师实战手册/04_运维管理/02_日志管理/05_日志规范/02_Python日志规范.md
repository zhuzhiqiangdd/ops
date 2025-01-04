# Python日志规范

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

1. Web请求日志
   - 请求信息
   - 响应信息
   - 性能指标

2. API调用日志
   - 接口调用
   - 参数信息
   - 响应结果

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
  type: str
  format: "YYYY-MM-DD'T'HH:mm:ss.SSSZ"
  required: true
  example: "2024-03-21T10:00:00.123+0800"

level:
  description: 日志级别
  type: str
  values: [DEBUG, INFO, WARNING, ERROR, CRITICAL]
  required: true
  example: "INFO"

name:
  description: 日志记录器名称
  type: str
  required: true
  example: "myapp.services.user_service"

message:
  description: 日志消息
  type: str
  required: true
  example: "用户登录成功"

process:
  description: 进程ID
  type: int
  required: true
  example: 1234

thread:
  description: 线程ID
  type: int
  required: true
  example: 5678
```

### 2.2 追踪字段
```yaml
trace_id:
  description: 追踪标识
  type: str
  required: true
  example: "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c"

span_id:
  description: 跨度标识
  type: str
  required: true
  example: "1a2b3c4d5e6f"

parent_id:
  description: 父跨度标识
  type: str
  required: false
  example: "0a1b2c3d4e5f"

request_id:
  description: 请求标识
  type: str
  required: false
  example: "REQ-20240321-001"
```

### 2.3 上下文字段
```yaml
module:
  description: 模块名
  type: str
  required: true
  example: "user_service"

function:
  description: 函数名
  type: str
  required: true
  example: "login_user"

line:
  description: 行号
  type: int
  required: true
  example: 123

file:
  description: 源文件
  type: str
  required: false
  example: "user_service.py"
```

### 2.4 业务字段
```yaml
user_id:
  description: 用户标识
  type: str
  required: false
  example: "U123456"

operation:
  description: 操作类型
  type: str
  required: false
  example: "LOGIN" | "LOGOUT" | "CREATE"

result:
  description: 操作结果
  type: str
  required: false
  example: "SUCCESS" | "FAILURE"

details:
  description: 详细信息
  type: dict
  required: false
  example: {"reason": "密码错误", "attempts": 3}
```

## 三、日志格式
### 3.1 文本格式
1. 标准格式
   ```python
   "%(asctime)s|%(levelname)s|%(name)s|%(message)s"
   ```

2. 详细格式
   ```python
   "%(asctime)s|%(levelname)s|%(process)d|%(threadName)s|%(name)s|%(module)s:%(lineno)d|%(message)s"
   ```

3. 追踪格式
   ```python
   "%(asctime)s|%(levelname)s|%(name)s|[%(trace_id)s,%(span_id)s]|%(message)s"
   ```

### 3.2 JSON格式
```json
{
  "timestamp": "2024-03-21T10:00:00.123+0800",
  "level": "INFO",
  "name": "myapp.services.user_service",
  "module": "user_service",
  "function": "login_user",
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
### 4.1 基础配置
```python
import logging
import logging.config
import json
from datetime import datetime
from pythonjsonlogger import jsonlogger

# 日志配置
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s|%(levelname)s|%(name)s|%(message)s',
            'datefmt': '%Y-%m-%dT%H:%M:%S.%f%z'
        },
        'detailed': {
            'format': '%(asctime)s|%(levelname)s|%(process)d|%(threadName)s|%(name)s|%(module)s:%(lineno)d|%(message)s',
            'datefmt': '%Y-%m-%dT%H:%M:%S.%f%z'
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
            'datefmt': '%Y-%m-%dT%H:%M:%S.%f%z'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
            'level': 'INFO'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'app.log',
            'formatter': 'detailed',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'level': 'DEBUG'
        },
        'json_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'app.json',
            'formatter': 'json',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'level': 'INFO'
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'error.log',
            'formatter': 'detailed',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'level': 'ERROR'
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file', 'json_file', 'error_file'],
            'level': 'INFO',
            'propagate': True
        },
        'myapp': {
            'handlers': ['console', 'file', 'json_file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False
        }
    }
}

# 应用配置
logging.config.dictConfig(LOGGING_CONFIG)
```

### 4.2 高级配置
```python
import logging
import logging.config
from datetime import datetime
import json
import traceback
from contextvars import ContextVar
from typing import Optional, Dict, Any

# 上下文变量
trace_id: ContextVar[str] = ContextVar('trace_id', default='')
span_id: ContextVar[str] = ContextVar('span_id', default='')
user_id: ContextVar[str] = ContextVar('user_id', default='')

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        
        # 添加时间戳
        log_record['timestamp'] = datetime.utcnow().isoformat()
        
        # 添加日志级别
        log_record['level'] = record.levelname
        
        # 添加上下文信息
        log_record['trace_id'] = trace_id.get()
        log_record['span_id'] = span_id.get()
        log_record['user_id'] = user_id.get()
        
        # 添加异常信息
        if record.exc_info:
            log_record['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'stack_trace': traceback.format_exception(*record.exc_info)
            }

class ContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # 添加上下文属性
        record.trace_id = trace_id.get()
        record.span_id = span_id.get()
        record.user_id = user_id.get()
        return True

# 日志装饰器
def log_function(logger: logging.Logger):
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                elapsed = (datetime.now() - start_time).total_seconds() * 1000
                logger.info(f"函数执行完成: {func.__name__}, 耗时: {elapsed:.2f}ms",
                          extra={
                              'function': func.__name__,
                              'execution_time': elapsed,
                              'success': True
                          })
                return result
            except Exception as e:
                elapsed = (datetime.now() - start_time).total_seconds() * 1000
                logger.error(f"函数执行异常: {func.__name__}, 耗时: {elapsed:.2f}ms",
                           exc_info=True,
                           extra={
                               'function': func.__name__,
                               'execution_time': elapsed,
                               'success': False
                           })
                raise
        return wrapper
    return decorator
```

## 五、日志样例
### 5.1 标准日志
1. 文本格式
   ```
   2024-03-21T10:00:00.123+0800|INFO|myapp.services.user_service|用户登录成功
   2024-03-21T10:00:01.234+0800|DEBUG|myapp.services.user_service|用户参数验证通过: {"username": "john", "login_type": "PASSWORD"}
   2024-03-21T10:00:02.345+0800|INFO|myapp.services.user_service|创建用户会话: SESSION-001
   ```

2. JSON格式
   ```json
   {
     "timestamp": "2024-03-21T10:00:00.123+0800",
     "level": "INFO",
     "name": "myapp.services.user_service",
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
   2024-03-21T10:01:00.123+0800|ERROR|myapp.services.user_service|用户登录失败
   Traceback (most recent call last):
     File "user_service.py", line 123, in validate_credentials
       raise ValueError("用户名或密码错误")
   ValueError: 用户名或密码错误
   ```

2. JSON格式
   ```json
   {
     "timestamp": "2024-03-21T10:01:00.123+0800",
     "level": "ERROR",
     "name": "myapp.services.user_service",
     "message": "用户登录失败",
     "trace_id": "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
     "span_id": "1a2b3c4d5e6f",
     "exception": {
       "type": "ValueError",
       "message": "用户名或密码错误",
       "stack_trace": [
         "  File \"user_service.py\", line 123, in validate_credentials\n",
         "    raise ValueError(\"用户名或密码错误\")\n",
         "ValueError: 用户名或密码错误\n"
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
   2024-03-21T10:02:00.123+0800|INFO|myapp.services.user_service|函数执行完成: login_user, 耗时: 150.45ms
   ```

2. JSON格式
   ```json
   {
     "timestamp": "2024-03-21T10:02:00.123+0800",
     "level": "INFO",
     "name": "myapp.services.user_service",
     "message": "函数执行完成",
     "trace_id": "4a7b9c12-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
     "span_id": "1a2b3c4d5e6f",
     "performance": {
       "function": "login_user",
       "execution_time": 150.45,
       "time_unit": "ms",
       "metrics": {
         "db_time": 50.12,
         "cache_time": 10.33,
         "business_time": 90.00
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
- [Java日志规范](01_Java日志规范.md)
- [Go日志规范](03_Go日志规范.md)
- [Node.js日志规范](04_NodeJS日志规范.md)

## 更新记录
- 2024-03-21: 创建Python日志规范文档 