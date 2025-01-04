# Ansible Playbook编写指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [🏗️进行中]

## 1. 概述
本文档主要介绍Ansible Playbook的编写方法和最佳实践。

## 2. Playbook基础
### 2.1 基本结构
```yaml
---
- name: Web服务器配置
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    max_clients: 200
  
  tasks:
    - name: 安装nginx
      apt:
        name: nginx
        state: present
    
    - name: 启动nginx服务
      service:
        name: nginx
        state: started
        enabled: yes
```

### 2.2 多个Play
```yaml
---
- name: 配置Web服务器
  hosts: webservers
  tasks:
    - name: 安装nginx
      apt:
        name: nginx
        state: present

- name: 配置数据库服务器
  hosts: dbservers
  tasks:
    - name: 安装MySQL
      apt:
        name: mysql-server
        state: present
```

## 3. 变量使用
### 3.1 变量定义
```yaml
vars:
  mysql_port: 3306
  mysql_user: admin
  mysql_databases:
    - name: blog
      encoding: utf8mb4
    - name: shop
      encoding: utf8mb4

vars_files:
  - vars/database.yml
  - vars/webserver.yml
```

### 3.2 变量使用
```yaml
tasks:
  - name: 配置MySQL端口
    template:
      src: my.cnf.j2
      dest: /etc/mysql/my.cnf
    vars:
      port: "{{ mysql_port }}"
      
  - name: 创建数据库
    mysql_db:
      name: "{{ item.name }}"
      encoding: "{{ item.encoding }}"
      state: present
    loop: "{{ mysql_databases }}"
```

## 4. 条件和循环
### 4.1 条件语句
```yaml
tasks:
  - name: 安装Apache
    apt:
      name: apache2
      state: present
    when: ansible_distribution == 'Ubuntu'

  - name: 安装httpd
    yum:
      name: httpd
      state: present
    when: ansible_distribution == 'CentOS'
```

### 4.2 循环语句
```yaml
tasks:
  - name: 创建用户
    user:
      name: "{{ item }}"
      state: present
    loop:
      - alice
      - bob
      - charlie

  - name: 安装多个包
    apt:
      name: "{{ item }}"
      state: present
    loop:
      - nginx
      - php-fpm
      - mysql-server
```

## 5. 处理器和通知
### 5.1 处理器定义
```yaml
handlers:
  - name: 重启nginx
    service:
      name: nginx
      state: restarted
      
  - name: 重载配置
    service:
      name: nginx
      state: reloaded
```

### 5.2 通知处理器
```yaml
tasks:
  - name: 复制nginx配置
    copy:
      src: nginx.conf
      dest: /etc/nginx/nginx.conf
    notify:
      - 重载配置
      
  - name: 更新SSL证书
    copy:
      src: ssl/
      dest: /etc/nginx/ssl/
    notify:
      - 重启nginx
```

## 6. 角色使用
### 6.1 角色结构
```
roles/
  webserver/
    tasks/
      main.yml
    handlers/
      main.yml
    templates/
      nginx.conf.j2
    files/
      ssl/
    vars/
      main.yml
    defaults/
      main.yml
    meta/
      main.yml
```

### 6.2 角色调用
```yaml
---
- hosts: webservers
  roles:
    - common
    - { role: webserver, tags: ['web'] }
    - { role: database, when: is_db_server }
```

## 7. 模板使用
### 7.1 Jinja2模板
```jinja
# nginx.conf.j2
server {
    listen {{ http_port }};
    server_name {{ server_name }};
    
    {% for domain in allowed_domains %}
    server_name {{ domain }};
    {% endfor %}
    
    location / {
        root {{ web_root }};
        index index.html;
    }
}
```

### 7.2 模板使用
```yaml
tasks:
  - name: 生成nginx配置
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/sites-available/default
    vars:
      http_port: 80
      server_name: example.com
      allowed_domains:
        - www.example.com
        - api.example.com
      web_root: /var/www/html
```

## 8. 错误处理
### 8.1 忽略错误
```yaml
tasks:
  - name: 尝试停止服务
    service:
      name: myapp
      state: stopped
    ignore_errors: yes
```

### 8.2 错误处理策略
```yaml
- hosts: webservers
  any_errors_fatal: true
  max_fail_percentage: 30
  tasks:
    - name: 危险操作
      command: /critical/operation.sh
      failed_when: "'ERROR' in command_result.stderr"
```

## 9. 调试技巧
### 9.1 Debug模块
```yaml
tasks:
  - name: 显示变量
    debug:
      var: mysql_port
      
  - name: 显示消息
    debug:
      msg: "当前环境: {{ env }}"
```

### 9.2 Verbose模式
```bash
# 运行时使用-v参数
ansible-playbook playbook.yml -v
ansible-playbook playbook.yml -vv
ansible-playbook playbook.yml -vvv
```

## 10. 最佳实践
### 10.1 命名规范
- 使用有意义的名称
- 保持一致的命名风格
- 使用小写和下划线
- 避免特殊字符

### 10.2 目录结构
```
project/
├── ansible.cfg
├── inventory/
│   ├── production
│   └── staging
├── group_vars/
│   ├── all.yml
│   └── webservers.yml
├── host_vars/
│   └── web1.yml
├── roles/
│   ├── common/
│   └── webserver/
└── site.yml
```

## 11. 参考资料
1. [Ansible Playbook文档](https://docs.ansible.com/ansible/latest/user_guide/playbooks.html)
2. [Ansible最佳实践](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
3. [Ansible示例](https://github.com/ansible/ansible-examples) 