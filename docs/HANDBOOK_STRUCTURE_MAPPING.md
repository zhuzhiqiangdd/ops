# 《运维工程师实战手册》中英文目录文件名映射及导航标题

本文档定义了《运维工程师实战手册》 (未来英文根目录为 `ops_handbook/`) 内容的原始中文路径/文件名到规划的英文路径/文件名的映射关系，以及期望在最终网站上显示的中文导航标题。

**目标**：
1.  解决文件系统对中文路径/文件名的兼容性问题，所有实际文件和目录将使用英文名。
2.  确保最终生成的网站导航菜单和侧边栏对用户友好，显示为中文。

**映射表说明**：
-   **原始中文路径/文件名**: 当前 `运维工程师实战手册/` 下的路径和文件名。
-   **规划的英文路径/文件名**: 对应到 `ops_handbook/` 根目录下的英文路径和文件名。路径分隔符使用 `/`。
-   **期望的中文导航/页面标题**: 在网站上实际显示给用户的中文名称。通常与原始中文名一致，但可能根据导航的简洁性进行微调。
-   **层级**: 表示目录或文件在结构中的深度，便于理解。
-   **备注**: 其他说明。

---

## 映射表

| 层级 | 原始中文路径/文件名                                     | 规划的英文路径/文件名 (基于 `ops_handbook/`)             | 期望的中文导航/页面标题     | 备注                                                           |
|------|---------------------------------------------------------|-------------------------------------------------------|---------------------------|----------------------------------------------------------------|
| 0    | 运维工程师实战手册/                                       | `ops_handbook/`                                       | 运维工程师实战手册          | 网站内容的根目录                                                 |
| 1    | 01_基础设施/                                            | `01_infrastructure/`                                  | 01_基础设施                 |                                                                |
| 2    |  L README.md                                            |  L `README.md`                                        | 基础设施概览                | (此README.md为新建)                                            |
| 2    |  L 01_Linux系统管理/                                    |  L `01_linux_system_management/`                       | 01_Linux系统管理          |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | Linux系统管理概览         | (此README.md为新建)                                            |
| 3    |     L 01_基础命令.md                                    |     L `01_basic_commands.md`                          | 01_基础命令               |                                                                |
| 3    |     L 02_系统与权限管理.md                                |     L `02_system_and_permission_management.md`          | 02_系统与权限管理         |                                                                |
| 3    |     L 03_服务管理与配置.md                                |     L `03_service_management_and_configuration.md`      | 03_服务管理与配置         |                                                                |
| 3    |     L 03_进程管理.md (注意与上一个编号重复，需确认)         |     L `03a_process_management.md`                     | 03a_进程管理              | 英文名用`03a`区分，中文标题也对应调整，或与贡献者确认正确编号 |
| 3    |     L 04_性能监控与优化.md                                |     L `04_performance_monitoring_and_optimization.md` | 04_性能监控与优化         |                                                                |
| 3    |     L 04_文件系统管理.md (注意与上一个编号重复，需确认)       |     L `04a_filesystem_management.md`                  | 04a_文件系统管理          | 英文名用`04a`区分，中文标题也对应调整，或与贡献者确认正确编号 |
| 3    |     L 05_LVM管理指南.md                                 |     L `05_lvm_management_guide.md`                    | 05_LVM管理指南            |                                                                |
| 3    |     L 05_存储管理.md (注意与上一个编号重复，需确认)           |     L `05a_storage_management.md`                     | 05a_存储管理              | 英文名用`05a`区分，中文标题也对应调整，或与贡献者确认正确编号 |
| 3    |     L 06_RAID管理指南.md                                |     L `06_raid_management_guide.md`                   | 06_RAID管理指南           |                                                                |
| 3    |     L 07_日志管理指南.md                                |     L `07_log_management_guide.md`                    | 07_日志管理指南           |                                                                |
| 3    |     L 09_软件包管理指南.md                                |     L `09_package_management_guide.md`                | 09_软件包管理指南         |                                                                |
| 2    |  L 02_网络服务与安全/                                    |  L `02_network_services_and_security/`               | 02_网络服务与安全         |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 网络服务与安全概览        | (此README.md为新建)                                            |
| 3    |     L 01_基础服务配置.md                                |     L `01_basic_service_configuration.md`             | 01_基础服务配置           |                                                                |
| 3    |     L 02_代理服务部署.md                                |     L `02_proxy_service_deployment.md`                | 02_代理服务部署           |                                                                |
| 3    |     L 03_路由配置说明.md                                |     L `03_routing_configuration.md`                   | 03_路由配置说明           |                                                                |
| 3    |     L 04_防火墙配置.md                                  |     L `04_firewall_configuration.md`                  | 04_防火墙配置             |                                                                |
| 3    |     L 05_VPN服务部署.md                                 |     L `05_vpn_service_deployment.md`                  | 05_VPN服务部署            |                                                                |
| 2    |  L 03_存储系统/                                          |  L `03_storage_systems/`                             | 03_存储系统               |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 存储系统概览              | (此README.md为新建)                                            |
| 3    |     L 01_存储方案设计.md                                |     L `01_storage_solution_design.md`                 | 01_存储方案设计           |                                                                |
| 3    |     L 02_备份系统实施.md                                |     L `02_backup_system_implementation.md`            | 02_备份系统实施           |                                                                |
| 3    |     L 03_存储管理最佳实践.md                                |     L `03_storage_management_best_practices.md`       | 03_存储管理最佳实践       |                                                                |
| 3    |     L 04_存储性能优化.md                                |     L `04_storage_performance_optimization.md`        | 04_存储性能优化           |                                                                |
| 3    |     L 05_备份恢复方案.md                                |     L `05_backup_and_recovery_solutions.md`           | 05_备份恢复方案           |                                                                |
| 2    |  L 04_虚拟化技术/                                        |  L `04_virtualization_technology/`                   | 04_虚拟化技术             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 虚拟化技术概览            | (此README.md为新建)                                            |
| 3    |     L 03_虚拟化网络.md (原始编号为03，前面缺少01,02)        |     L `03_virtual_network.md`                         | 03_虚拟化网络             | 建议检查是否有01,02                                          |
| 3    |     L 04_存储虚拟化.md                                  |     L `04_storage_virtualization.md`                  | 04_存储虚拟化             |                                                                |
| 3    |     L 05_虚拟化性能优化.md                                |     L `05_virtualization_performance_optimization.md` | 05_虚拟化性能优化         |                                                                |
| 3    |     L 05_资源调度.md (注意与上一个编号重复，需确认)           |     L `05a_resource_scheduling.md`                    | 05a_资源调度              | 英文名用`05a`区分，中文标题也对应调整                               |
| 1    | 02_中间件/                                              | `02_middleware/`                                      | 02_中间件                 |                                                                |
| 2    |  L README.md                                            |  L `README.md`                                        | 中间件概览                | (此README.md为新建)                                            |
| 2    |  L 01_Web服务器/                                        |  L `01_web_servers/`                                   | 01_Web服务器              |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | Web服务器概览             | (此README.md为新建)                                            |
| 3    |     L 01_Nginx配置指南.md                               |     L `01_nginx_configuration_guide.md`               | 01_Nginx配置指南          |                                                                |
| 3    |     L 02_Apache部署文档.md                              |     L `02_apache_deployment_guide.md`                 | 02_Apache部署文档         |                                                                |
| 3    |     L 03_Tomcat优化指南.md                              |     L `03_tomcat_optimization_guide.md`               | 03_Tomcat优化指南         |                                                                |
| 2    |  L 02_数据库/                                           |  L `02_databases/`                                     | 02_数据库                 |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 数据库概览                | (此README.md为新建)                                            |
| 3    |     L 01_MySQL系列文档.md                               |     L `01_mysql_series.md`                            | 01_MySQL系列文档          |                                                                |
| 3    |     L 02_Redis系列文档.md                               |     L `02_redis_series.md`                            | 02_Redis系列文档          |                                                                |
| 3    |     L 03_MongoDB系列文档.md                             |     L `03_mongodb_series.md`                          | 03_MongoDB系列文档        |                                                                |
| 2    |  L 03_消息队列/                                         |  L `03_message_queues/`                                | 03_消息队列               |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 消息队列概览              | (此README.md为新建)                                            |
| 3    |     L 01_RabbitMQ文档.md                                |     L `01_rabbitmq_overview.md`                       | 01_RabbitMQ文档           |                                                                |
| 3    |     L 01_RabbitMQ/                                      |     L `01a_rabbitmq_details/`                         | 01a_RabbitMQ详情          | 目录，对应原 `01_RabbitMQ/`，英文名加后缀区分同级同名文件        |
| 4    |        L README.md                                      |        L `README.md`                                  | RabbitMQ详情概览          | (此README.md为新建)                                            |
| 4    |        L 02_集群部署.md                                 |        L `02_cluster_deployment.md`                   | 02_集群部署               |                                                                |
| 4    |        L 03_运维管理.md                                 |        L `03_operations_management.md`                | 03_运维管理               |                                                                |
| 3    |     L 02_Kafka文档.md                                   |     L `02_kafka_overview.md`                          | 02_Kafka文档              |                                                                |
| 2    |  L 04_搜索引擎/                                         |  L `04_search_engines/`                                | 04_搜索引擎               |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 搜索引擎概览              | (此README.md为新建)                                            |
| 3    |     L 01_Elasticsearch部署.md                           |     L `01_elasticsearch_deployment.md`                | 01_Elasticsearch部署      |                                                                |
| 3    |     L 02_Elasticsearch优化.md                           |     L `02_elasticsearch_optimization.md`              | 02_Elasticsearch优化      |                                                                |
| 3    |     L 03_Solr部署配置.md                                |     L `03_solr_deployment_configuration.md`           | 03_Solr部署配置           |                                                                |
| 3    |     L 04_搜索引擎选型.md                                |     L `04_search_engine_selection.md`                 | 04_搜索引擎选型           |                                                                |
| 2    |  L 06_HAProxy/  (缺少05)                                |  L `06_haproxy/`                                       | 06_HAProxy                | 建议检查是否有05的内容                                           |
| 3    |     L README.md                                         |     L `README.md`                                     | HAProxy概览               | (此README.md为新建)                                            |
| 3    |     L 01_HAProxy基础架构.md                             |     L `01_haproxy_basic_architecture.md`              | 01_HAProxy基础架构        |                                                                |
| 3    |     L 02_HAProxy安装部署.md                             |     L `02_haproxy_installation_deployment.md`         | 02_HAProxy安装部署        |                                                                |
| 3    |     L 03_HAProxy配置详解.md                             |     L `03_haproxy_configuration_details.md`           | 03_HAProxy配置详解        |                                                                |
| 3    |     L 04_HAProxy负载均衡算法.md                           |     L `04_haproxy_load_balancing_algorithms.md`       | 04_HAProxy负载均衡算法    |                                                                |
| 3    |     L 05_HAProxy会话保持.md                             |     L `05_haproxy_session_persistence.md`             | 05_HAProxy会话保持        |                                                                |
| 3    |     L 06_HAProxy健康检查.md                             |     L `06_haproxy_health_checks.md`                   | 06_HAProxy健康检查        |                                                                |
| 3    |     L 07_HAProxy_SSL配置.md                             |     L `07_haproxy_ssl_configuration.md`               | 07_HAProxy SSL配置       |                                                                |
| 3    |     L 08_HAProxy安全加固.md                             |     L `08_haproxy_security_hardening.md`              | 08_HAProxy安全加固        |                                                                |
| 3    |     L 09_HAProxy监控告警.md                             |     L `09_haproxy_monitoring_alerting.md`             | 09_HAProxy监控告警        |                                                                |
| 3    |     L 10_HAProxy故障处理.md                             |     L `10_haproxy_troubleshooting.md`                 | 10_HAProxy故障处理        |                                                                |
| 3    |     L 11_HAProxy最佳实践.md                             |     L `11_haproxy_best_practices.md`                  | 11_HAProxy最佳实践        |                                                                |
| 3    |     L 12_MongoDB代理配置实践.md                         |     L `12_mongodb_proxy_configuration_practice.md`    | 12_MongoDB代理配置实践    |                                                                |
| 1    | 03_云原生技术/                                          | `03_cloud_native/`                                    | 03_云原生技术             | 使用之前规划的 `03_cloud_native`                                 |
| 2    |  L README.md                                            |  L `README.md`                                        | 云原生技术概览            | (此README.md为新建)                                            |
| 2    |  L 01_容器技术/                                         |  L `01_container_technologies/`                        | 01_容器技术               |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 容器技术概览              | (此README.md为新建)                                            |
| 3    |     L 01_基础概念/                                      |     L `01_basic_concepts/`                            | 01_基础概念               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 基础概念概览              | (此README.md为新建)                                            |
| 4    |        L 01_容器基础.md                                 |        L `01_container_basics.md`                     | 01_容器基础               |                                                                |
| 4    |        L 01_容器基础概念.md                             |        L `01a_container_fundamental_concepts.md`      | 01a_容器基础概念          | 与上一个文件编号相同，英文名用`a`区分，或考虑合并内容                 |
| 4    |        L 02_Docker架构.md                               |        L `02_docker_architecture.md`                  | 02_Docker架构             |                                                                |
| 4    |        L 03_容器运行时.md                               |        L `03_container_runtimes.md`                   | 03_容器运行时             |                                                                |
| 3    |     L 02_运行时管理/                                    |     L `02_runtime_management/`                        | 02_运行时管理             |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 运行时管理概览            | (此README.md为新建)                                            |
| 4    |        L 01_容器生命周期.md                             |        L `01_container_lifecycle.md`                  | 01_容器生命周期           |                                                                |
| 4    |        L 02_资源限制.md                                 |        L `02_resource_limits.md`                      | 02_资源限制               |                                                                |
| 4    |        L 03_运行时安全.md                               |        L `03_runtime_security.md`                     | 03_运行时安全             |                                                                |
| 3    |     L 03_镜像管理/                                      |     L `03_image_management/`                          | 03_镜像管理               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 镜像管理概览              | (此README.md为新建)                                            |
| 4    |        L 01_镜像基础.md                                 |        L `01_image_basics.md`                         | 01_镜像基础               |                                                                |
| 4    |        L 02_镜像构建.md                                 |        L `02_image_building.md`                       | 02_镜像构建               |                                                                |
| 4    |        L 03_镜像仓库.md                                 |        L `03_image_registries.md`                     | 03_镜像仓库               |                                                                |
| 4    |        L 04_最佳实践.md                                 |        L `04_best_practices.md`                       | 04_最佳实践               |                                                                |
| 3    |     L 04_存储管理/ (容器技术下)                           |     L `04_storage_management_ct/`                     | 04_存储管理 (容器)        | 区分于K8s的存储管理，加后缀_ct (container_technology)             |
| 4    |        L README.md                                      |        L `README.md`                                  | 存储管理概览 (容器)       | (此README.md为新建)                                            |
| 4    |        L 01_存储基础.md                                 |        L `01_storage_basics.md`                       | 01_存储基础               |                                                                |
| 4    |        L 02_存储配置.md                                 |        L `02_storage_configuration.md`                | 02_存储配置               |                                                                |
| 4    |        L 03_存储安全.md                                 |        L `03_storage_security.md`                     | 03_存储安全               |                                                                |
| 4    |        L 04_性能优化.md                                 |        L `04_performance_optimization.md`             | 04_性能优化               |                                                                |
| 4    |        L 05_故障排查.md                                 |        L `05_troubleshooting.md`                      | 05_故障排查               |                                                                |
| 3    |     L 04_网络管理/ (容器技术下，注意与上面存储管理的编号重复) |     L `04a_network_management_ct/`                    | 04a_网络管理 (容器)       | 英文名用`a`和后缀`_ct`区分                                        |
| 4    |        L README.md                                      |        L `README.md`                                  | 网络管理概览 (容器)       | (此README.md为新建)                                            |
| 4    |        L 01_网络基础.md                                 |        L `01_network_basics.md`                       | 01_网络基础               |                                                                |
| 4    |        L 02_网络实现.md                                 |        L `02_network_implementation.md`               | 02_网络实现               |                                                                |
| 4    |        L 03_网络安全.md                                 |        L `03_network_security.md`                     | 03_网络安全               |                                                                |
| 4    |        L 04_性能优化.md                                 |        L `04_performance_optimization.md`             | 04_性能优化               | (文件名与存储管理下的重复，但路径不同)                               |
| 4    |        L 05_故障排查.md                                 |        L `05_troubleshooting.md`                      | 05_故障排查               | (文件名与存储管理下的重复，但路径不同)                               |
| 4    |        L 06_网络监控.md                                 |        L `06_network_monitoring.md`                   | 06_网络监控               |                                                                |
| 3    |     L 06_安全管理/ (容器技术下，缺少05)                   |     L `06_security_management_ct/`                    | 06_安全管理 (容器)        | 后缀`_ct`，建议检查是否有05                                      |
| 4    |        L README.md                                      |        L `README.md`                                  | 安全管理概览 (容器)       | (此README.md为新建)                                            |
| 4    |        L 01_安全基础.md                                 |        L `01_security_basics.md`                      | 01_安全基础               |                                                                |
| 4    |        L 02_安全配置.md                                 |        L `02_security_configuration.md`               | 02_安全配置               |                                                                |
| 4    |        L 03_安全审计.md                                 |        L `03_security_auditing.md`                    | 03_安全审计               |                                                                |
| 4    |        L 04_安全加固.md                                 |        L `04_security_hardening.md`                   | 04_安全加固               |                                                                |
| 4    |        L 05_安全基线.md                                 |        L `05_security_baselines.md`                   | 05_安全基线               |                                                                |
| 4    |        L 06_应急响应.md                                 |        L `06_incident_response.md`                    | 06_应急响应               |                                                                |
| 4    |        L 07_安全合规.md                                 |        L `07_security_compliance.md`                  | 07_安全合规               |                                                                |
| 3    |     L 07_运维管理/ (容器技术下)                           |     L `07_operations_management_ct/`                  | 07_运维管理 (容器)        | 后缀`_ct`                                                        |
| 4    |        L README.md                                      |        L `README.md`                                  | 运维管理概览 (容器)       | (此README.md为新建)                                            |
| 4    |        L 01_日志管理.md                                 |        L `01_log_management.md`                       | 01_日志管理               |                                                                |
| 4    |        L 02_监控告警.md                                 |        L `02_monitoring_and_alerting.md`              | 02_监控告警               |                                                                |
| 4    |        L 03_备份恢复.md                                 |        L `03_backup_and_recovery.md`                  | 03_备份恢复               |                                                                |
| 2    |  L 02_Kubernetes/                                       |  L `02_kubernetes/`                                    | 02_Kubernetes             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | Kubernetes概览            | (此README.md为新建)                                            |
| 3    |     L 01_集群部署/                                      |     L `01_cluster_deployment/`                        | 01_集群部署               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 集群部署概览              | (此README.md为新建)                                            |
| 4    |        L 01_Kubernetes基础.md                           |        L `01_kubernetes_basics.md`                    | 01_Kubernetes基础         |                                                                |
| 4    |        L 01_环境准备.md                                 |        L `01a_environment_preparation.md`             | 01a_环境准备              | 编号重复，英文名加`a`                                            |
| 4    |        L 02_集群安装.md                                 |        L `02_cluster_installation.md`                 | 02_集群安装               |                                                                |
| 4    |        L 03_集群配置.md                                 |        L `03_cluster_configuration.md`                | 03_集群配置               |                                                                |
| 3    |     L 02_核心概念/                                      |     L `02_core_concepts/`                             | 02_核心概念               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 核心概念概览              | (此README.md为新建)                                            |
| 4    |        L 01_基础概念.md                                 |        L `01_basic_concepts.md`                       | 01_基础概念               |                                                                |
| 4    |        L 02_概念详解.md                                 |        L `02_detailed_concepts.md`                    | 02_概念详解               |                                                                |
| 4    |        L 03_组件详解.md                                 |        L `03_component_details.md`                    | 03_组件详解               |                                                                |
| 3    |     L 03_资源管理/                                      |     L `03_resource_management/`                       | 03_资源管理               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 资源管理概览              | (此README.md为新建)                                            |
| 4    |        L 01_资源管理基础.md                               |        L `01_resource_management_basics.md`           | 01_资源管理基础           |                                                                |
| 4    |        L 02_应用部署.md                                 |        L `02_application_deployment.md`               | 02_应用部署               |                                                                |
| 4    |        L 03_工作负载管理.md                               |        L `03_workload_management.md`                  | 03_工作负载管理           |                                                                |
| 4    |        L 04_集群运维.md                                 |        L `04_cluster_operations.md`                   | 04_集群运维               |                                                                |
| 3    |     L 04_配置管理/                                      |     L `04_configuration_management_k8s/`              | 04_配置管理 (K8s)       | 加后缀 `_k8s` 区分                                               |
| 4    |        L README.md                                      |        L `README.md`                                  | 配置管理概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_ConfigMap配置管理.md                          |        L `01_configmap_management.md`                 | 01_ConfigMap配置管理      |                                                                |
| 4    |        L 02_环境变量配置.md                               |        L `02_environment_variable_configuration.md`     | 02_环境变量配置           |                                                                |
| 4    |        L 03_Secret管理.md                               |        L `03_secret_management.md`                      | 03_Secret管理             |                                                                |
| 3    |     L 05_网络方案/                                      |     L `05_networking_solutions_k8s/`                  | 05_网络方案 (K8s)       | 加后缀 `_k8s`                                                    |
| 4    |        L README.md                                      |        L `README.md`                                  | 网络方案概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_网络基础.md                                 |        L `01_network_basics.md`                       | 01_网络基础               |                                                                |
| 4    |        L 02_CNI插件配置.md                              |        L `02_cni_plugin_configuration.md`               | 02_CNI插件配置            |                                                                |
| 4    |        L 03_Service服务.md                              |        L `03_service_discovery.md`                    | 03_Service服务            |                                                                |
| 4    |        L 04_Ingress配置.md                              |        L `04_ingress_configuration.md`                  | 04_Ingress配置            |                                                                |
| 4    |        L 05_网络策略.md                                 |        L `05_network_policies.md`                     | 05_网络策略               |                                                                |
| 3    |     L 06_存储方案/                                      |     L `06_storage_solutions_k8s/`                     | 06_存储方案 (K8s)       | 加后缀 `_k8s`                                                    |
| 4    |        L README.md                                      |        L `README.md`                                  | 存储方案概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_存储概述.md                                 |        L `01_storage_overview.md`                     | 01_存储概述               |                                                                |
| 4    |        L 01_存储配置.md                                 |        L `01a_storage_configuration.md`                 | 01a_存储配置              | 编号重复，英文名加`a`                                            |
| 4    |        L 02_存储类配置指南.md                             |        L `02_storageclass_configuration_guide.md`     | 02_存储类配置指南         |                                                                |
| 3    |     L 07_安全配置/                                      |     L `07_security_configuration_k8s/`                | 07_安全配置 (K8s)       | 加后缀 `_k8s`                                                    |
| 4    |        L README.md                                      |        L `README.md`                                  | 安全配置概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_安全架构概述.md                               |        L `01_security_architecture_overview.md`         | 01_安全架构概述           |                                                                |
| 4    |        L 02_认证与授权配置.md                             |        L `02_authentication_authorization_config.md`  | 02_认证与授权配置         |                                                                |
| 4    |        L 03_加密与密钥管理.md                             |        L `03_encryption_key_management.md`            | 03_加密与密钥管理         |                                                                |
| 4    |        L 04_容器运行时安全.md                             |        L `04_container_runtime_security.md`           | 04_容器运行时安全         |                                                                |
| 3    |     L 08_运维管理/ (Kubernetes下)                         |     L `08_operations_management_k8s/`                 | 08_运维管理 (K8s)       |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 运维管理概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_集群运维管理.md                               |        L `01_cluster_operations_management.md`        | 01_集群运维管理           |                                                                |
| 4    |        L 02_应用发布管理.md                               |        L `02_application_release_management.md`       | 02_应用发布管理           |                                                                |
| 4    |        L 03_监控与告警.md                               |        L `03_monitoring_and_alerting.md`              | 03_监控与告警             |                                                                |
| 4    |        L 04_日志管理.md                                 |        L `04_log_management.md`                       | 04_日志管理               |                                                                |
| 3    |     L 09_高级特性/                                      |     L `09_advanced_features_k8s/`                     | 09_高级特性 (K8s)       | 加后缀 `_k8s`                                                    |
| 4    |        L README.md                                      |        L `README.md`                                  | 高级特性概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_自定义资源与控制器.md                         |        L `01_custom_resources_controllers.md`         | 01_自定义资源与控制器     |                                                                |
| 4    |        L 02_服务网格集成.md                               |        L `02_service_mesh_integration.md`             | 02_服务网格集成           |                                                                |
| 4    |        L 03_扩展调度器.md                                 |        L `03_extending_scheduler.md`                  | 03_扩展调度器             |                                                                |
| 4    |        L 04_Federation多集群管理.md                       |        L `04_federation_multi_cluster_management.md`  | 04_Federation多集群管理   |                                                                |
| 3    |     L 10_服务网格/ (Kubernetes下)                         |     L `10_service_mesh_k8s/`                          | 10_服务网格 (K8s)       |  区分于顶层的服务网格分类                                          |
| 4    |        L README.md                                      |        L `README.md`                                  | 服务网格概览 (K8s)      | (此README.md为新建)                                            |
| 4    |        L 01_Istio/                                      |        L `01_istio/`                                    | 01_Istio                  |                                                                |
| 5    |           L README.md                                   |           L `README.md`                               | Istio概览                 | (此README.md为新建)                                            |
| 5    |           L 01_基础概念.md                                |           L `01_basic_concepts.md`                    | 01_基础概念               |                                                                |
| 5    |           L 02_安装部署.md                                |           L `02_installation_deployment.md`           | 02_安装部署               |                                                                |
| 5    |           L 03_流量管理.md                                |           L `03_traffic_management.md`                | 03_流量管理               |                                                                |
| 5    |           L 04_可观测性.md                                |           L `04_observability.md`                     | 04_可观测性               |                                                                |
| 5    |           L 05_核心组件.md                                |           L `05_core_components.md`                   | 05_核心组件               |                                                                |
| 5    |           L 06_安全管理.md                                |           L `06_security_management.md`               | 06_安全管理               |                                                                |
| 4    |        L 02_可观测性/ (K8s服务网格下)                     |        L `02_observability_k8s_sm/`                  | 02_可观测性 (K8s服务网格) |                                                                |
| 5    |           L README.md                                   |           L `README.md`                               | 可观测性概览 (K8s服务网格)| (此README.md为新建)                                            |
| 5    |           L 01_监控指标.md                                |           L `01_monitoring_metrics.md`                | 01_监控指标               |                                                                |
| 5    |           L 02_分布式追踪.md                                |           L `02_distributed_tracing.md`               | 02_分布式追踪             |                                                                |
| 2    |  L 03_服务网格/ (顶层)                                  |  L `03_service_mesh_general/`                        | 03_服务网格 (通用)        |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 服务网格概览 (通用)       | (此README.md为新建)                                            |
| 3    |     L 01_核心架构/                                      |     L `01_core_architecture/`                         | 01_核心架构               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 核心架构概览              | (此README.md为新建)                                            |
| 4    |        L 01_服务网格架构.md                             |        L `01_service_mesh_architecture.md`            | 01_服务网格架构           |                                                                |
| 4    |        L 01_架构概述.md                                 |        L `01a_architecture_overview.md`               | 01a_架构概述              | 编号重复                                                         |
| 4    |        L 02_数据平面.md                                 |        L `02_data_plane.md`                           | 02_数据平面               |                                                                |
| 4    |        L 03_控制平面.md                                 |        L `03_control_plane.md`                        | 03_控制平面               |                                                                |
| 3    |     L 02_流量管理/                                      |     L `02_traffic_management/`                        | 02_流量管理               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 流量管理概览              | (此README.md为新建)                                            |
| 4    |        L 01_流量控制.md                                 |        L `01_traffic_control.md`                      | 01_流量控制               |                                                                |
| 4    |        L 02_负载均衡.md                                 |        L `02_load_balancing.md`                       | 02_负载均衡               |                                                                |
| 4    |        L 03_故障处理.md                                 |        L `03_fault_handling.md`                       | 03_故障处理               |                                                                |
| 3    |     L 03_安全管理/                                      |     L `03_security_management_smg/`                   | 03_安全管理 (服务网格)    | 后缀 `_smg` (service_mesh_general)                               |
| 4    |        L README.md                                      |        L `README.md`                                  | 安全管理概览 (服务网格)   | (此README.md为新建)                                            |
| 4    |        L 01_认证授权.md                                 |        L `01_authentication_authorization.md`         | 01_认证授权               |                                                                |
| 4    |        L 01_认证管理.md                                 |        L `01a_authentication_management.md`           | 01a_认证管理              | 编号重复                                                         |
| 4    |        L 02_授权管理.md                                 |        L `02_authorization_management.md`             | 02_授权管理               |                                                                |
| 4    |        L 02_策略控制.md                                 |        L `02a_policy_control.md`                      | 02a_策略控制              | 编号重复                                                         |
| 4    |        L 03_密钥管理.md                                 |        L `03_key_management.md`                       | 03_密钥管理               |                                                                |
| 3    |     L 04_可观测性/                                      |     L `04_observability_smg/`                         | 04_可观测性 (服务网格)    | 后缀 `_smg`                                                      |
| 4    |        L README.md                                      |        L `README.md`                                  | 可观测性概览 (服务网格)   | (此README.md为新建)                                            |
| 4    |        L 01_监控指标.md                                 |        L `01_monitoring_metrics.md`                   | 01_监控指标               |                                                                |
| 4    |        L 02_日志管理.md                                 |        L `02_log_management.md`                       | 02_日志管理               |                                                                |
| 4    |        L 03_分布式追踪.md                               |        L `03_distributed_tracing.md`                  | 03_分布式追踪             |                                                                |
| 4    |        L 03_链路追踪.md                                 |        L `03a_link_tracing.md`                        | 03a_链路追踪              | 编号重复                                                         |
| 2    |  L 04_微服务架构/                                       |  L `04_microservices_architecture/`                  | 04_微服务架构             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 微服务架构概览            | (此README.md为新建)                                            |
| 3    |     L 01_微服务基础.md                                  |     L `01_microservices_basics.md`                    | 01_微服务基础             |                                                                |
| 3    |     L 01_服务治理/                                      |     L `01a_service_governance/`                       | 01a_服务治理              | 编号重复，目录                                                     |
| 4    |        L README.md                                      |        L `README.md`                                  | 服务治理概览              | (此README.md为新建)                                            |
| 4    |        L 01_服务注册与发现.md                             |        L `01_service_registration_discovery.md`       | 01_服务注册与发现         |                                                                |
| 4    |        L 02_配置中心实践.md                               |        L `02_config_center_practices.md`              | 02_配置中心实践           |                                                                |
| 4    |        L 03_服务熔断与限流.md                             |        L `03_circuit_breaking_rate_limiting.md`       | 03_服务熔断与限流         |                                                                |
| 4    |        L 04_API网关实践.md                                |        L `04_api_gateway_practices.md`                | 04_API网关实践            |                                                                |
| 4    |        L 05_服务监控实践.md                               |        L `05_service_monitoring_practices.md`         | 05_服务监控实践           |                                                                |
| 4    |        L 06_服务日志实践.md                               |        L `06_service_logging_practices.md`            | 06_服务日志实践           |                                                                |
| 4    |        L 07_链路追踪实践.md                               |        L `07_distributed_tracing_practices.md`        | 07_链路追踪实践           |                                                                |
| 4    |        L 08_服务测试实践.md                               |        L `08_service_testing_practices.md`            | 08_服务测试实践           |                                                                |
| 4    |        L 09_服务部署实践.md                               |        L `09_service_deployment_practices.md`         | 09_服务部署实践           |                                                                |
| 4    |        L 10_服务安全实践.md                               |        L `10_service_security_practices.md`           | 10_服务安全实践           |                                                                |
| 2    |  L 05_云原生存储/                                       |  L `05_cloud_native_storage/`                        | 05_云原生存储             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 云原生存储概览            | (此README.md为新建)                                            |
| 3    |     L 01_Ceph/                                          |     L `01_ceph/`                                        | 01_Ceph                   |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | Ceph概览                  | (此README.md为新建)                                            |
| 4    |        L 01_架构设计.md                                 |        L `01_architecture_design.md`                  | 01_架构设计               |                                                                |
| 4    |        L 02_部署配置.md                                 |        L `02_deployment_configuration.md`             | 02_部署配置               |                                                                |
| 4    |        L 03_运维管理.md                                 |        L `03_operations_management.md`                | 03_运维管理               |                                                                |
| 3    |     L 02_Rook/                                          |     L `02_rook/`                                        | 02_Rook                   |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | Rook概览                  | (此README.md为新建)                                            |
| 4    |        L 01_存储编排.md                                 |        L `01_storage_orchestration.md`                | 01_存储编排               |                                                                |
| 4    |        L 02_存储管理.md                                 |        L `02_storage_management.md`                   | 02_存储管理               |                                                                |
| 4    |        L 03_灾备方案.md                                 |        L `03_disaster_recovery_solutions.md`          | 03_灾备方案               |                                                                |
| 3    |     L 03_OpenEBS/                                       |     L `03_openebs/`                                     | 03_OpenEBS                |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | OpenEBS概览               | (此README.md为新建)                                            |
| 4    |        L 01_本地存储.md                                 |        L `01_local_storage.md`                        | 01_本地存储               |                                                                |
| 4    |        L 02_分布式存储.md                               |        L `02_distributed_storage.md`                  | 02_分布式存储             |                                                                |
| 4    |        L 03_快照备份.md                                 |        L `03_snapshot_backup.md`                      | 03_快照备份               |                                                                |
| 2    |  L 06_云原生网络/                                       |  L `06_cloud_native_networking/`                     | 06_云原生网络             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 云原生网络概览            | (此README.md为新建)                                            |
| 3    |     L 01_网络模型/                                      |     L `01_network_models/`                            | 01_网络模型               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 网络模型概览              | (此README.md为新建)                                            |
| 4    |        L 01_Overlay网络.md                              |        L `01_overlay_networks.md`                     | 01_Overlay网络            |                                                                |
| 4    |        L 02_BGP网络.md                                  |        L `02_bgp_networks.md`                         | 02_BGP网络                |                                                                |
| 4    |        L 03_混合模式.md                                 |        L `03_hybrid_modes.md`                         | 03_混合模式               |                                                                |
| 3    |     L 02_网络组件/                                      |     L `02_network_components/`                        | 02_网络组件               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 网络组件概览              | (此README.md为新建)                                            |
| 4    |        L 01_Calico.md                                   |        L `01_calico.md`                               | 01_Calico                 |                                                                |
| 4    |        L 02_Cilium.md                                   |        L `02_cilium.md`                               | 02_Cilium                 |                                                                |
| 4    |        L 03_Flannel.md                                  |        L `03_flannel.md`                              | 03_Flannel                |                                                                |
| 3    |     L 03_网络策略/                                      |     L `03_network_policies_cn/`                       | 03_网络策略 (云原生)      | 后缀 `_cn` (cloud_native)                                        |
| 4    |        L README.md                                      |        L `README.md`                                  | 网络策略概览 (云原生)     | (此README.md为新建)                                            |
| 4    |        L 01_访问控制.md                                 |        L `01_access_control.md`                       | 01_访问控制               |                                                                |
| 4    |        L 02_流量管理.md                                 |        L `02_traffic_management.md`                   | 02_流量管理               |                                                                |
| 4    |        L 03_安全防护.md                                 |        L `03_security_protection.md`                  | 03_安全防护               |                                                                |
| 2    |  L 07_云原生安全/                                       |  L `07_cloud_native_security/`                       | 07_云原生安全             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 云原生安全概览            | (此README.md为新建)                                            |
| 3    |     L 01_基础设施安全/                                  |     L `01_infrastructure_security/`                   | 01_基础设施安全           |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 基础设施安全概览          | (此README.md为新建)                                            |
| 4    |        L 01_容器安全.md                                 |        L `01_container_security.md`                   | 01_容器安全               |                                                                |
| 4    |        L 02_集群安全.md                                 |        L `02_cluster_security.md`                     | 02_集群安全               |                                                                |
| 4    |        L 03_网络安全.md                                 |        L `03_network_security.md`                     | 03_网络安全               |                                                                |
| 3    |     L 02_应用安全/                                      |     L `02_application_security_cn/`                   | 02_应用安全 (云原生)      | 后缀 `_cn`                                                       |
| 4    |        L README.md                                      |        L `README.md`                                  | 应用安全概览 (云原生)     | (此README.md为新建)                                            |
| 4    |        L 01_镜像安全.md                                 |        L `01_image_security.md`                       | 01_镜像安全               |                                                                |
| 4    |        L 02_运行时安全.md                               |        L `02_runtime_security.md`                     | 02_运行时安全             |                                                                |
| 4    |        L 03_数据安全.md                                 |        L `03_data_security.md`                        | 03_数据安全               |                                                                |
| 3    |     L 03_安全运维/                                      |     L `03_security_operations_cn/`                    | 03_安全运维 (云原生)      | 后缀 `_cn`                                                       |
| 4    |        L README.md                                      |        L `README.md`                                  | 安全运维概览 (云原生)     | (此README.md为新建)                                            |
| 4    |        L 01_安全监控.md                                 |        L `01_security_monitoring.md`                  | 01_安全监控               |                                                                |
| 4    |        L 02_漏洞管理.md                                 |        L `02_vulnerability_management.md`             | 02_漏洞管理               |                                                                |
| 4    |        L 03_应急响应.md                                 |        L `03_incident_response.md`                    | 03_应急响应               |                                                                |
| 2    |  L 08_云原生应用/                                       |  L `08_cloud_native_applications/`                   | 08_云原生应用             |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 云原生应用概览            | (此README.md为新建)                                            |
| 3    |     L 01_应用编排/                                      |     L `01_application_orchestration/`                 | 01_应用编排               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 应用编排概览              | (此README.md为新建)                                            |
| 4    |        L 01_工作负载.md                                 |        L `01_workloads.md`                            | 01_工作负载               |                                                                |
| 4    |        L 02_应用配置.md                                 |        L `02_application_configuration.md`            | 02_应用配置               |                                                                |
| 4    |        L 03_发布策略.md                                 |        L `03_release_strategies.md`                   | 03_发布策略               |                                                                |
| 3    |     L 02_应用管理/                                      |     L `02_application_management_cn/`                 | 02_应用管理 (云原生)      | 后缀 `_cn`                                                       |
| 4    |        L README.md                                      |        L `README.md`                                  | 应用管理概览 (云原生)     | (此README.md为新建)                                            |
| 4    |        L 01_弹性伸缩.md                                 |        L `01_elastic_scaling.md`                      | 01_弹性伸缩               |                                                                |
| 4    |        L 02_资源管理.md                                 |        L `02_resource_management.md`                  | 02_资源管理               |                                                                |
| 4    |        L 03_健康检查.md                                 |        L `03_health_checks.md`                        | 03_健康检查               |                                                                |
| 2    |  L 09_DevOps实践/                                       |  L `09_devops_practices_cn/`                         | 09_DevOps实践 (云原生)    | 后缀 `_cn`                                                       |
| 3    |     L README.md                                         |     L `README.md`                                     | DevOps实践概览 (云原生)   | (此README.md为新建)                                            |
| 3    |     L 01_持续集成/                                      |     L `01_continuous_integration/`                    | 01_持续集成               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 持续集成概览              | (此README.md为新建)                                            |
| 4    |        L 01_Jenkins.md                                  |        L `01_jenkins.md`                              | 01_Jenkins                |                                                                |
| 4    |        L 02_GitLab_CI.md                                |        L `02_gitlab_ci.md`                            | 02_GitLab CI              |                                                                |
| 4    |        L 03_流水线管理.md                               |        L `03_pipeline_management.md`                  | 03_流水线管理             |                                                                |
| 3    |     L 02_持续部署/                                      |     L `02_continuous_deployment/`                     | 02_持续部署               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 持续部署概览              | (此README.md为新建)                                            |
| 4    |        L 01_ArgoCD.md                                   |        L `01_argocd.md`                               | 01_ArgoCD                 |                                                                |
| 4    |        L 02_Flux.md                                     |        L `02_flux.md`                                 | 02_Flux                   |                                                                |
| 4    |        L 03_发布策略.md                                 |        L `03_release_strategies.md`                   | 03_发布策略               | (文件名与应用编排下的重复，但路径不同)                                 |
| 3    |     L 03_自动化测试/                                    |     L `03_automated_testing/`                         | 03_自动化测试             |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 自动化测试概览            | (此README.md为新建)                                            |
| 4    |        L 01_单元测试.md                                 |        L `01_unit_testing.md`                         | 01_单元测试               |                                                                |
| 4    |        L 02_集成测试.md                                 |        L `02_integration_testing.md`                  | 02_集成测试               |                                                                |
| 4    |        L 03_端到端测试.md                               |        L `03_end_to_end_testing.md`                   | 03_端到端测试             |                                                                |
| 2    |  L 10_可观测性/ (顶层)                                  |  L `10_observability_general/`                       | 10_可观测性 (通用)        |                                                                |
| 3    |     L README.md                                         |     L `README.md`                                     | 可观测性概览 (通用)       | (此README.md为新建)                                            |
| 3    |     L 01_监控系统/                                      |     L `01_monitoring_systems/`                        | 01_监控系统               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 监控系统概览              | (此README.md为新建)                                            |
| 4    |        L 01_监控系统概述.md                             |        L `01_monitoring_systems_overview.md`          | 01_监控系统概述           |                                                                |
| 4    |        L 02_Prometheus实践.md                           |        L `02_prometheus_practices.md`                 | 02_Prometheus实践         |                                                                |
| 4    |        L 03_Grafana实践.md                              |        L `03_grafana_practices.md`                    | 03_Grafana实践            |                                                                |
| 4    |        L 04_告警管理实践.md                             |        L `04_alert_management_practices.md`           | 04_告警管理实践           |                                                                |
| 3    |     L 02_日志管理/                                      |     L `02_log_management_general/`                    | 02_日志管理 (通用)        | 后缀 `_general`                                                  |
| 4    |        L README.md                                      |        L `README.md`                                  | 日志管理概览 (通用)       | (此README.md为新建)                                            |
| 4    |        L 01_ELK平台实践.md                              |        L `01_elk_platform_practices.md`               | 01_ELK平台实践            |                                                                |
| 4    |        L 02_Loki实践.md                                 |        L `02_loki_practices.md`                       | 02_Loki实践               |                                                                |
| 3    |     L 03_系统集成/ (顶层可观测性下)                       |     L `03_system_integration_obs/`                    | 03_系统集成 (可观测性)    | 后缀 `_obs`                                                      |
| 4    |        L README.md                                      |        L `README.md`                                  | 系统集成概览 (可观测性)   | (此README.md为新建)                                            |
| 4    |        L 01_监控系统集成方案.md                           |        L `01_monitoring_system_integration_solutions.md`| 01_监控系统集成方案       |                                                                |
| 3    |     L 03_链路追踪/ (顶层可观测性下, 与上一个编号重复)        |     L `03a_distributed_tracing_general/`              | 03a_链路追踪 (通用)       | 英文名加`a`，后缀`_general`                                       |
| 4    |        L README.md                                      |        L `README.md`                                  | 链路追踪概览 (通用)       | (此README.md为新建)                                            |
| 4    |        L 01_链路追踪概述.md                             |        L `01_distributed_tracing_overview.md`         | 01_链路追踪概述           |                                                                |
| 4    |        L 02_Skywalking实践.md                           |        L `02_skywalking_practices.md`                 | 02_Skywalking实践         |                                                                |
| 4    |        L 03_性能分析.md                                 |        L `03_performance_analysis.md`                 | 03_性能分析               |                                                                |
| 3    |     L 04_告警系统/                                      |     L `04_alerting_systems/`                          | 04_告警系统               |                                                                |
| 4    |        L README.md                                      |        L `README.md`                                  | 告警系统概览              | (此README.md为新建)                                            |
| 4    |        L 01_Alertmanager实践.md                         |        L `01_alertmanager_practices.md`               | 01_Alertmanager实践       |                                                                |
| 4    |        L 02_Grafana告警实践.md                          |        L `02_grafana_alerting_practices.md`           | 02_Grafana告警实践        |                                                                |
| 3    |     L 05_系统集成/ (顶层可观测性下, 又一个05)             |     L `05a_system_integration_general_obs/`           | 05a_系统集成 (通用可观测性)| 英文名加`a`和后缀                                                  |
| 4    |        L README.md                                      |        L `README.md`                                  | 系统集成概览 (通用)       | (此README.md为新建)                                            |
| 4    |        L 01_系统集成概述.md                             |        L `01_system_integration_overview.md`          | 01_系统集成概述           |                                                                |
| 4    |        L 02_OpenTelemetry实践.md                        |        L `02_opentelemetry_practices.md`              | 02_OpenTelemetry实践      |                                                                |
| 4    |        L 03_可视化集成.md                               |        L `03_visualization_integration.md`            | 03_可视化集成             |                                                                |

---
*(后续将继续添加 `04_运维管理`, `05_安全运维`)*

**待处理项（基于以上初步映射）：**
-   **编号重复问题**：多处出现，已通过加后缀 `a`, `_ct`, `_k8s`, `_smg`, `_cn`, `_general`, `_obs` 等方式在英文名中尝试区分，并建议贡献者未来确认或修正原始编号。
-   **路径规划中的歧义和重复**：例如“服务网格”和“可观测性”在Kubernetes下有，在顶层也有，已通过后缀区分。一些特定技术（如日志管理、安全管理）在不同主分类下都有，也通过后缀区分了其上下文。
-   **不连续编号**：多个模块中存在编号跳跃，已在备注中提及。
-   **README.md的创建**：继续为每个规划的英文目录层级添加 `README.md`。

我将继续填充这个映射表。这是一个迭代的过程。在我完成整个映射表的初稿后，我会再向您同步。
这个文件的创建本身是我计划的一部分。
>>>>>>> REPLACE
