# Windows系统安全加固指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅已完成]

## 1. 账号安全

### 1.1 密码策略
1. 本地安全策略配置
```powershell
# 打开本地安全策略
secpol.msc

# 配置密码策略
密码必须符合复杂性要求: 启用
密码长度最小值: 12个字符
密码最长使用期限: 90天
密码最短使用期限: 1天
强制密码历史: 24个密码
```

2. 组策略配置
```powershell
# 打开组策略编辑器
gpedit.msc

# 配置路径
计算机配置 -> Windows 设置 -> 安全设置 -> 账户策略 -> 密码策略
```

### 1.2 账户管理
1. 禁用来宾账户
```powershell
# 使用命令行禁用来宾账户
net user guest /active:no

# 使用PowerShell禁用来宾账户
Disable-LocalUser -Name "Guest"
```

2. 重命名管理员账户
```powershell
# 重命名Administrator账户
wmic useraccount where name='Administrator' call rename name='Admin_Secure'
```

## 2. 系统服务

### 2.1 服务管理
1. 禁用不必要的服务
```powershell
# 查看所有服务
Get-Service

# 禁用服务示例
Stop-Service -Name "服务名称"
Set-Service -Name "服务名称" -StartupType Disabled

# 常见需要禁用的服务
- Remote Registry
- Print Spooler (非打印服务器)
- Telnet
- FTP Server
```

2. 配置服务权限
```powershell
# 使用sc命令配置服务权限
sc sdset 服务名称 D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)
```

### 2.2 远程访问
1. 远程桌面配置
```powershell
# 启用网络级别身份验证
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "UserAuthentication" -Value 1

# 配置远程桌面端口
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -name "PortNumber" -Value 3389
```

2. 防火墙规则
```powershell
# 配置远程桌面防火墙规则
New-NetFirewallRule -DisplayName "RDP" -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Allow -Profile Domain,Private
```

## 3. 系统安全

### 3.1 文件系统
1. NTFS权限配置
```powershell
# 设置文件权限
icacls "C:\sensitive_data" /inheritance:d
icacls "C:\sensitive_data" /grant:r "Administrators:(OI)(CI)F"
icacls "C:\sensitive_data" /grant:r "SYSTEM:(OI)(CI)F"
```

2. 共享配置
```powershell
# 查看现有共享
Get-SmbShare

# 配置共享权限
New-SmbShare -Name "SecureShare" -Path "D:\SecureData" -FullAccess "Domain\Admins" -ReadAccess "Domain\Users"
```

### 3.2 注册表安全
1. 关键注册表权限
```powershell
# 设置注册表权限
$acl = Get-Acl HKLM:\SOFTWARE\Restricted
$rule = New-Object System.Security.AccessControl.RegistryAccessRule("Everyone","ReadKey","Allow")
$acl.SetAccessRule($rule)
$acl | Set-Acl HKLM:\SOFTWARE\Restricted
```

2. 注册表审计
```powershell
# 启用注册表审计
auditpol /set /subcategory:"Registry" /success:enable /failure:enable
```

## 4. 网络安全

### 4.1 防火墙配置
1. 基本配置
```powershell
# 启用防火墙
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# 配置默认规则
Set-NetFirewallProfile -DefaultInboundAction Block -DefaultOutboundAction Allow
```

2. 高级规则
```powershell
# 创建入站规则
New-NetFirewallRule -DisplayName "Block Telnet" -Direction Inbound -Protocol TCP -LocalPort 23 -Action Block

# 创建出站规则
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Outbound -Protocol TCP -RemotePort 443 -Action Allow
```

### 4.2 网络协议
1. SMB配置
```powershell
# 禁用SMBv1
Set-SmbServerConfiguration -EnableSMB1Protocol $false
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" SMB1 -Type DWORD -Value 0

# 启用SMB签名
Set-SmbServerConfiguration -RequireSecuritySignature $true
```

2. IPSec策略
```powershell
# 创建IPSec规则
New-NetIPsecRule -DisplayName "Secure Traffic" -Protocol TCP -Mode Transport -LocalAddress Any -RemoteAddress Any -RequireEncryption $true
```

## 5. 审计与日志

### 5.1 事件审计
1. 审计策略配置
```powershell
# 配置审计策略
auditpol /set /category:"System","Logon/Logoff","Object Access" /success:enable /failure:enable

# 查看审计配置
auditpol /get /category:*
```

2. 事件日志配置
```powershell
# 配置事件日志大小
wevtutil sl Security /ms:1073741824
wevtutil sl System /ms:1073741824
wevtutil sl Application /ms:1073741824
```

### 5.2 日志管理
1. 日志收集
```powershell
# 导出事件日志
wevtutil epl Security C:\logs\security.evtx
wevtutil epl System C:\logs\system.evtx
```

2. 日志转发
```powershell
# 配置日志转发
wecutil qc /q

# 创建订阅
wecutil cs subscription.xml
```

## 6. 系统加固

### 6.1 系统更新
1. Windows Update配置
```powershell
# 配置自动更新
$AutoUpdate = (New-Object -com "Microsoft.Update.AutoUpdate").Settings
$AutoUpdate.NotificationLevel = 4
$AutoUpdate.Save()
```

2. WSUS配置
```powershell
# 配置WSUS服务器
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" /v WUServer /t REG_SZ /d "http://wsus.domain.com:8530" /f
```

### 6.2 安全功能
1. UAC配置
```powershell
# 设置UAC级别
Set-ItemProperty -Path REGISTRY::HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System -Name ConsentPromptBehaviorAdmin -Value 2
```

2. BitLocker配置
```powershell
# 启用BitLocker
Enable-BitLocker -MountPoint "C:" -EncryptionMethod Aes256 -UsedSpaceOnly -RecoveryPasswordProtector
```

## 7. 应用安全

### 7.1 应用控制
1. AppLocker策略
```powershell
# 创建AppLocker规则
New-AppLockerPolicy -RuleType Path -RuleNamePattern "Block Programs" -Path "C:\Program Files\*" -User Everyone -Action Deny
```

2. 软件限制
```powershell
# 配置软件限制策略
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Safer\CodeIdentifiers"
New-Item -Path $path -Force
Set-ItemProperty -Path $path -Name "DefaultLevel" -Value 262144
```

### 7.2 浏览器安全
1. Internet Explorer配置
```powershell
# 设置安全区域
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3" -Name "1806" -Value 0
```

2. Edge策略
```powershell
# 配置Edge策略
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v "AutofillCreditCardEnabled" /t REG_DWORD /d 0 /f
```

## 8. 监控与响应

### 8.1 性能监控
1. 性能计数器
```powershell
# 创建性能计数器收集
logman create counter SystemMonitor -o "C:\PerfLogs\SystemMonitor.blg" -f bincirc -v mmddhhmm -max 100 -c "\Processor(_Total)\% Processor Time" "\Memory\Available MBytes"
```

2. 资源监控
```powershell
# 启用资源监控
perfmon /res
```

### 8.2 安全监控
1. Sysmon配置
```powershell
# 安装Sysmon
sysmon.exe -i sysmonconfig.xml

# 更新配置
sysmon.exe -c sysmonconfig.xml
```

2. 安全中心配置
```powershell
# 配置Windows Defender
Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -SubmitSamplesConsent 2
```

## 参考资料
1. Microsoft Security Baseline
2. CIS Windows Benchmarks
3. NIST Windows Security Guide
4. NSA Windows Security Guidance 