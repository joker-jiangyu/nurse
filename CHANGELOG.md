# Change Log
所有重要的改动都要在这个文档中加以记录。

## [Unreleased]

### Changed


### Fixed


### Deprecated
- 历史曲线表仍有测试数据，正式发布前需去掉

## [3.3.4] - 2020-04-09
### Modify
- iView 设置页面优化


## [3.3.3] - 2020-04-03
### Modify
- 组态页面引用，隐藏导入导出
- 重启添加清理脚本
- 告警分布整合到历史记录中
- iView版本首页与设备列表页分离


## [3.3.2] - 2020-04-01
### Added
- 异常登录限制
### Modify
- 登录记住密码优化
- B接口-联通配置文件优化
- 提示框位置优化
- 协议包导出优化
- 修改完mainconfig.xml配置后重新加载最新的配置
- 表格组态 告警时信号值变色

## [3.3.1] - 2020-03-21
### Added
- 组态包导出，入口：配置 => 组态管理
### Modify
- 模板管理：导出协议完整版 导出协议模板xml与so


## [3.2.2] - 2020-02-27
### Added
- 设备信息功能，入口：组态页面的设备详情，右下角i号



## [3.2.1] - 2020-01-19
### Added
- 模板管理：导出协议 v0.5 导出协议模板xml
### Modify
- 组态转非组态页面优化


## [3.2.0]  - 2020-01-15
### Added
- 组态转静态页面功能


## [3.1.5] - 2019-12-24
- 将定制项目有用的功能整合到标准版中
### Added
- 添加更适合触屏的设置页面
- 游客权限添加告警阀值设置功能
### Modify
- 时间控件优化
- 触屏样式优化
- 确定弹出框模态化


## [3.1.2] - 2019-12-11
### Added
- 刷新遮蔽页面，解决刷新页面加载丑问题
### Modify
- alarm提示框样式优化
- U盘升级iView状态页面
- 配置栏在管理员和游客不同权限不同选择
- 优化64节温场


## [3.1.1] - 2019-12-07
### Modify
- iView虚拟键盘优化： 弹出键盘优化
- iVIew虚机键盘优化： 多出输入框添加虚拟键盘
- 设备详情优化： 固定表头
- 64节温场优化： 添加机柜图和温场定位配置功能
- 实时告警组态优化： 将时间放到第二行，优化在iView上时间换行问题



## [3.1.0] - 2019-11-28
### Added
- 64节温场
### Modify
- 优化组态页上面设备栏选择效果
- 历史图表组态添加平均值、最大值和最小值选择
- 解决告警联动翻译问题
- 解决时间加载异常问题



## [3.0.3] - 2019-11-22
### Added
- 实时告警组态
### Modify
- 修改License生效条件，为删除factor_stat文件生效
- 解决海康威视实时预览有时候404问题
- 解决删除协议时删除掉SO问题
- 解决修改标题失败问题，分离mainconfig.xml的DataHandlerConfig
- 优化虚拟组态计算公式
- 优化iView历史数据查询



## [3.0.2] - 2019-11-14
### Modify
- 接口配置-移动B接口配置化
- 接口配置-联通B接口配置化
- 接口配置-SNMP接口配置化


## [3.0.1] - 2019-11-08
### Added
- 免登陆，mainconfig.xml的<loginPassword>输入正确密码
- 实时图表组态：新仪表盘



## [2.11.7] - 2019-10-29
### Added
- 根据“自诊断设备”的硬盘占用率清理系统文件和数据库数据
- 微模块历史数据组态页
### Fixed
- 解决iView环境license注册问题


## [2.11.6] - 2019-10-18
### Fixed
- 解决：46的1、“类型”框大小；3、在屏上隐藏“导出”按钮
- 解决：48优化配置管理，新增设备的端口类型选择和修改设备重新绑定设备模板
- 解决：49新增协议的“通讯状态”事件没有基类编号问题
- 解决：51实时告警页面，最后一页优化
- 解决：53组态编辑框的删除按钮样式
- 告警通知筛选接收者列表
- 添加一键添加自诊断设备



## [2.11.5] - 2019-10-09
### Added
- 组态-实时图表 ADD:平均值、最大值、最小值
- 组态-实时组态 ADD:风格
- 组态 - ADD:3D MDC
### Fixed
- [组态]优化组态缓存
- 1、去掉柱形图帅选；2、解决实时图表组态选择设备问题
- 优化组态-超链接
- 组态-实时图表 柱形图：隐藏Y轴、添加柱子颜色配置
- 组态-历史图表 优化Y轴
- MDC历史数据 Demo 解决加载异常问题
- 历史告警记录，没有数据时，提示“Not Data”,英文版改用“No data”,中文版改用“没有数据”
- 模板管理相关样式优化
- 遥控遥调组态的密码选择，无密码、登录密码和共用密码


## [2.11.4] - 2019-09-27
- [文本组态]优化信号选择状态
- [MDC配置]机柜温湿度存储过程优化
- [风格切换]优化切换图片不存在问题
- [实时图表]添加柱形图图表
- [历史告警]优化iView历史告警查询
- [组态]添加信号状态 & [表格页面]信号通讯异常灰色、告警红色变化
- [超链接组态]添加组态页面跳转&返回按钮
- [配置-模板管理]屏蔽事件
- [MDC配置-门控制]添加环境设备的控制功能



## [2.11.3] - 2019-09-12
- [组态页面配置]删除设备后并删除设备分类的父级
- 遥调的数值控制，编辑框的值最好取关联信号的值，取不到再按现在的逻辑第一次加0.5，以后加1
- 【图表组态】加载慢
- 实时图表控制的格式
- [文本组态]添加信号选择状态



## [2.11.2] - 2019-08-30
### Added
- [组态]添加小键盘，方便在屏上移动、拉伸、选择组态
- [iView]内置浏览器看门狗
### Fixed
- [组态]“系统概况->冷通道折线图”中，绑定信号选择时，有两个本机IO
- [组态]实时图表控制的格式，单位
- [组态]给所有组态输入框添加了虚拟键盘
- [告警弹出框]白色风格优化


## [2.11.1] - 2019-08-23
### Fixed
- 放大虚拟键盘
- 修改获取IP方式，添加IView的兼容


## [2.11.0] - 2019-08-15
### Added
- [系统风格]实现风格切换



## [2.10.2] - 2019-08-01
### Added
- [门禁记录]保留最后一次刷卡记录
### Fixed
- [修改设备]显示关联的模板
- [邮件告警]发件时间 时差
- [移动B接口]优化配置文件


## [2.10.0] - 2019-07-31
### Added
- [iView 3.0]移植Linux平板开发
- [关于]添加二维码图
- [MainConfig.XML]添加免登陆功能
### Fixed
- [配置]解决修改设备配置影响同端口设备问题
- [自动备份还原配置]具体请看EquipmentProvider.java


## [2.9.2] - 2019-06-29
### Added
- [组态]仪表盘联控：以仪表盘显示数据变化，并下发控制
### Fixed
- [组态]虚拟组态：添加更多样式选择


## [2.9.1] - 2019-06-13
### Added
- [组态]能量柱组态：根据表达式显示百分比，并根据值下发控制


## [2.8.8] - 2019-06-03
### Added
- [B接口]集成中国联通B接口
- [系统操作]恢复访问账户
### Fixed
- [B接口]优化B接口功能


## [2.8.6] - 2019-05-29
### Added
- [B接口]打印配置内容
### Fixed
- [B接口]解决读写中文乱码问题


## [2.8.5] - 2019-05-28
### Added 
- [B接口]移动B接口配置和报文

## [2.8.2] - 2019-05-09
### Fixed
- [协议管理]添加删除协议时so是否在其他协议中存在判断
- [数据管理]添加删除提示
- [MDC系统概况]MDC首页，中间的安全监控等，修改数量时修改最右边的圆角样式
- [资产管理]优化一键生成的位置信息
- [组态页面]优化页面跳转，解决空组态页面


## [2.8.0] - 2019-4-26
### Added 
- [中英文]添加中英文页面切换功能


## [2.7.1] - 2019-04-13
### Added
- [遥控遥调组态]添加控制联动功能，实现群控/延迟控制


## [2.7.0] - 2019-03-22
### Added
- [机架资产管理]高级配置 => 资产机架管理
- 1、目前功能：读取数码人资产条上报的资产信息，与拆除后的下架信息
			

## [2.6.2] - 2019-03-18
### Added
- [信号历史图表]点击“信号”组态、“表格”组态和表格页面的信号，弹出信号的7天历史曲线

### Fixed
- [历史信号缓存]原取一天的平均值，现在为一天的最大值，觉得比较有意义
- [系统操作]关机和重启后退出到登录页面
	
	
## [2.6.1] - 2019-02-22
### Added
- [萤石云视频]使用萤石云服务器平台直接实时预览摄像头
- 1、 特点：摄像头部署在萤石云服务器上(改服务器使用萤石云的服务器，不是我们自己的)和网速有关
- 2、 入口：配置 => MDC配置 => 点击摄像头(或冷通道方格) => 设备类型为“萤石云直播”,新增 => RTMP输入：rtmp://rtmp.open.ys7.com/openlive/e6e0a477c0ca45b29638d27364da1c5f.hd(该rtmp是公司的摄像头部署到外网的直播连接) => 保存
- [表格组态]新开发一个表格页面的组态
- 1、 入口：高级配置 => 组态页面配置 => 选择“子节点”，修改 => 勾选“表格化” => 保存，最后到组态页面

### Fixed
- [组态]表格组态，添加无边框的风格
- [微调]logo的样式
		

## [2.6.0] - 2019-01-16
### Added
- [数码人资产条]资产柜开发(暂停，等待需求明确再启动)
		
		
## [2.5.4] - 2018-12-29
### Fixed
- Web连接java的连接数超过100条重启采集器（解决连接数超过100无法登陆Nurse问题）
- [门禁管理]门禁返回判断
- [门禁管理]门控制，不在门规制表里，默认CmdToken,Value
- [门禁管理]门禁添加门控制类型
- [门禁管理]解决TBL_DoorCard的CardId为-1的问题
- [门禁管理][门禁]加卡，不关联的门不下发时间组命令


## [2.5.3] - 2018-12-21
### Fixed
- [配置生效]添加加载中
- [MDC]冷通道样式优化
- 异常处理
- 解决门禁反馈处理异常
		
		
## [2.5.2] - 2018-12-07
### Fixed
- [MDC配置]通道设备配置化
- [系统概况]动态加载通道设备
- [组态]虚拟组态添加含义


## [2.5.1] - 2018-11-19
### Fixed
- [备份配置]备份上传的图片；备份MainConfig.xml
	
	
## [2.4.3] - 2018-11-10
### Fixed
- [组态页面配置]隐藏也会在设备列表中
- [组态]优化虚拟组态


## [2.4.2] - 2018-11-02
### Added
- [操作记录]用户操作日志；历史 => 操作记录（添加了TBL_UserOperationLog表）
### Fixed
- [配置]备份备注优化
- [配置文件mainconfig.xml]添加告警提示音替换(true：语音播报；false：语音提示)
		
		
## [2.4.1] - 2018-10-26
### Fixed
- [系统概况]环境量显示
- [MDC配置]机柜U位管理
- [网络电话]添加定时保平安功能（修改了TBL_NetworkPhone表结构）
- [告警通知]样式优化
- [表达式]添加AND和OR选项
### Added
- [导航]添加导航指引功能；告警配置=>导航
- [系统操作]添加关机和重启功能；关机：关闭MySQL和Nurse的服务，不断电十分钟后重启；重启：就是reboot
		
		
## [2.4.0] - 2018-10-19
### Fixed
- [刷卡记录]添加打印查库时间日志
- [门禁规制]门禁控制根据门禁规制的格式
- [License]优化
- [门禁管理]门管理添加删除所有时间组和卡
- [门禁管理-时限管理]优化双门单门时限下发
- [门禁管理-门管理]添加删除所有时间组
- [告警联动]解决触发表达式的长度问题


## [2.3.4] - 2018-09-30
### Fixed
- [MDC系统概况]优化机柜的资产信息
- [资产管理]资产编号为唯一键
- [资产管理]修改资产编码生成规则
- [资产管理]分页、筛选优化；导出Xls优化
- [页面时间]一小时定时校准页面时间
- [门禁管理]根据单双门筛选时段限制
- [门禁管理]优化快捷加卡读取卡号
- \#IN3LO:【资产管理】导出，文件格式错误
- \#IN3JV:【系统概况】安全监控页面，“环境量”开关关闭，当有烟感、水浸告警时，由非告警刷成告警态 


## [2.3.3] - 2018-09-22
### Fixed
- [视频回放]升级海康插件，回放栏可拖拉回放，时间精确完成（不会再延长5分钟的回放）
- [License]导出文件优化，解决“Nurse配置工具”备份的项目导出注册文件错误问题
- [资产管理]一键生成优化，添加所有设备表的设备
- [资产管理]资产图表，优化三张图表的生成规则
- [协议管理]解决协议中存在_A8的文件，当.zip包中的的so文件忘了去掉_A8，系统自动去掉
- [TableCfg.xml备份]升级备份的配置文件，完善备份表
- [MDC配置]完善机柜U位校验
### Issues
- \#IMXY2:【配置管理】新增设备，网口类型，端口号不能修改
- \#IMXY7:【MDC配置】第一次进入MDC配置时，点击温度，湿度，提示未绑定
- \#IMK54:【MDC配置】新增机柜设备，关于U高和起始位的计算限制
- \#IMK4O:【时间】当前时间显示不准
- \#IMK1Q:【系统概况】温度分布，偶尔柜子背景红色

## [2.3.2] - 2018-09-14
### Added
- [MDC配置]支持Chrome下浏览海康视频【暂停】
### Fixed
- [告警信息]添加设备编号，点击“主页”的告警信息跳转设备详情页
- [MDC配置]机柜中无监控设备异常问题
- [视频预览]升级
- 1、 升级和解决插件冲突问题  
- 2、 使用安装包里面的Chrome v35版本可以看视频，需要金陵多测试，问题不大可能用在以后有视频的项目中。
- [资产管理]将入口放到“高级配置”，“一键导入”将所有MDC和设备表的设备导入。
### Issues
- \#IMOMZ:【资产管理】“导出”的位置和风格，与历史信号，刷卡记录，告警记录不一致
- \#IMK16:【刷卡记录】在某种情况下，门禁刷卡记录表查询不出记录
- \#IMQHC:【资产管理】投产时间不要时分秒，只要年月日就可以了
- \#IMQHI:【资产分布】资产分布感觉要重整一下，以适应新的方案变化。如果做成图表
	
## [2.3.1] - 2018-08-31
### Fixed
- [KPI]缓存优化，右上角"图表"功能的图表进行缓存优化，解决加载慢问题。
- [组态]优化默认组态
- [资产管理]重新编译；优化时间格式，去掉最后的.0
- [告警联动]解决修改问题
- [MDC配置]优化样式
- [License]优化Nurs的License代码
		 
## [2.3.0] - 2018-08-27
### Fixed
- [FSU更新]添加电池存储和统计存储 修正snmp上报bug
1. 需要替换/home/app/samp/fsu和/home/app/samp/SO/snmp_agent.so文件，需要先删除原问题在替换。
- [资产管理]Nurse v2.3.0版本，基本资产管理信息。
- [备份配置]点击“配置生效”自动备份当前的配置到/home/app/web/web/upload/目录中，格式和使用“Nurse导入导出工具”相同，复制出来可以只在在“Nurse导入导出工具”中使用。
### Issues
- [模板管理-信号管理]基类不重复判断，添加跳过空值状态。
- [告警联动]信号筛选添加通讯状态

## [2.2.0] - 2018-08-17
### Fixed
- 添加License功能，未注册前能使用45天，注册后可以永久使用，注册文件同个机器可以重复使用(刷库注册消失后，可以再次导入之前的注册文件)
- 1、 点击登录页面右下角"生成机器码"(NurseInfo.key)，交给开发人员(也就是我)
- 2、 开发人员(也就是我)会发你一个注册文件(NurseLicense.key)，导入"注册码"
- [MDC配置]机柜名称不能重复
- [配置 - 模板管理]信号与控制的基类不允许重复
- [组态页面]设备列表样式(隐藏IE浏览器会出现的滚动条)
- [组态页面配置]删除父节点并删除该节点的子节点
- [MDC配置]实时电压电流不为空时，额定电压电流也不能为空

## [2.1.0] - 2018-08-10
### Issues
- 解决语音播报问题；测试重点：语速、语调与离线状态
### Fixed
- [组态编辑器]添加左键框选功能
- v2.1.0界面升级

## [2.0.3] - 2018-07-27
### Fixed
- [MDC配置]修改机柜设备关系表，添加非监控设备
- [组态编辑器]修改需要右击一次才能操作的问题；问题原因是左键选中的组态并没有添加到"编辑组态集"中导致，编辑功能无法操作这个组态
- [邮件通知]历史数据过滤优化；原来定时告警是将所有查询的历史事件发送出去，现在添加了过滤，只将满足告警通知过滤器中的事件发送出去
- [数据管理]数据管理表，将告警操作表存储区间改为半年，其他的都为一年
- [登录页面]添加记住用户名功能
- [历史-历史数据]解决导出失败与列表不显示问题
- [告警语音播报]解决已经出现过的告警出现告警弹出框问题(解决刷屏问题)
- [启动服务]解决启动Nurse前期CPU居高不下问题；将原来缓存历史数据的定时10s开始改为90s开始
- [KPI]改为[图表]并优化加载效率
- 配置相关页面的标题添加位置前缀；如：配置 > 配置管理
- [MDC配置]添加提示信息；有人提示进入MDC配置页面之后不知道机柜可以点
- [系统概况]添加告警弹屏功能，显示前4条告警
- [系统概况](未完成)机柜弹出框优化资产信息；这个功能等资产管理出来后才完善，现在还是半成品
		
## [2.0.2] - 2018-07-20
### Issues
- \#ILA4M:【实时数据图表】折线显示了一个突变0值，实际是没有0值的
- \#IL4UY:【模板管理】电池放电时的存储周期和阀值，也要放进来进行编辑
- \#ILA4I:【表格控件】点击已经绑定好的信号，最好高亮显示绑定信号的名称
- \#ILDKR:【3D】水浸告警，显示的位置错了，2D是正确的
- \#ILDLY:【3D】实时数据不能实时刷新
- \#IL1TL:【3D】告警声音没有，切回2D可以 
- \#ILEPK:【系统概况】温度分布，最左边的温湿度没有按照精度要求显示
- \#ILEPR:【配电拓扑】新增一个拓扑，置于了拓扑图的底图之后，选不中，需要移开底图才能选中设置，比较麻烦
- \#ILEQU:【配电拓扑】绑定信号的几个问题
### Fixed
- [修改IP]通过关闭、重启Nurse线程实现重启服务
- [系统概况]CPU优化大概...
- [mainconfig.xml配置]优化显示的功能
- [图片]"图片组态"与"拓扑图组态"可选择本地图片
- [拓扑图组态]优化组态，去掉图片旋转
- [数据管理]任务生效按钮
- [系统概况-温度分布]添加机柜温度告警变色


## [2.0.1] - 2018-07-13
### Fixed
- [拓扑图组态]添加断开和闭合控制值
- [数据库脚本]数据管理：添加刷卡记录表，默认关闭
- [配置生效]在配置管理-局站信息管理、配置管理-中心信息管理、配置管理-模板管理添加配置生效按钮
- [设备信息管理]添加通道地址判断与修改功能
- [遥控遥调组态]允许User用户远程控制
- [告警联动]添加遥调控制
- [组态页面管理]组态选择8888添加中文名称"拓扑图"、9999为"空白页面"
- [模板管理-信号管理]添加后备的电池存储周期与绝对值阀值
- [数据库脚本]缓存历史数据存储过程，优化遍历的历史数据表，最多遍历相近的两张表。
- [实时图表组态]折线图实时值取最新的7条数据
- [导入导出组态]改名为[组态页面管理]添加复制其他组态页面引用到当前页面功能
- [温场]解决只有一排配置了温度，显示异常问题
- [系统概况]解决机柜温度位置显示错误；原本只配置中-温度，出现两个温度，顶-温度的值是中-温度的。
- [系统概况-空间管理]分辨率缩小后蓝色div溢出问题
### Issues
- 【历史图表控件】双轴，字有干涉，看不清 #IL1T9
- 【配电】配电拓扑的问题 #IKVOK
- 【权限管理】以user账户登录，发现有些权限不合理 #IKVO7
- 【模板管理】电池放电时的存储周期和阀值，也要放进来进行编辑


## [2.0.0] - 2018-07-06
### Fixed
- 优化TBL_Door的门名称的命名规则
- [数据管理]优化数据管理功能，添加历史油机表和历史电池表到配置中，并添加当数据库占磁盘80%及以上强制执行关闭状态的配置与清理所有数据库日志
- [实时图表组态]解决同设备不同信号无法区分问题
- [组态页面配置]将'组态页面配置'入口放到告警配置中
- [权限管理]优化User权限
- [数据管理]优化数据管理-历史控制
- [拓扑图组态]优化拓扑图组态
- ajax传递参数非空判断
- [MDC]优化MDC走廊温湿度对齐问题
- [系统概况-温度分布]温度告警时，文本颜色根据告警等级变色
- [MDC配置]机柜绑定信号，初始化为空
- [3D MDC]解决图片按钮挡住问题
- [2D MDC系统概况]优化空间管理
- [表格组态]优化背景色
- [历史图表组态]值为每天的平均值
### Issues
- \#IKVOH:【过滤器】过滤器有些不合理
- \#IKVKT:【组态配置页面】新增智能电表、开关电源、UH31和APL_UPS，APL_UPS自动组态配置的父节点位置错了
- \#IKVJC:【数据管理】增加电池表，油机表，控制表的数据删除管理，另外空间到80%也要触发清理
- \#IKVC6:【权限管理】登录账户的密码，管理员无权修改
- \#IKVC8:【权限管理】账户角色改为“系统管理员”“操作员”比较好
- \#IKVBY:【权限管理】新建一个账户“张三”，密码“123”，以“张三”登录，失败；Eddy:不支持中文字符，已经添加判断。
- \#IKWTN【MDC配置】配置红外、烟感关联后，退出MDC配置，再次进入，点烟感或红外，提示“未绑定信号”
- \#IKYCL:【温场】多出一截，显得不专业
- \#IKYB5:【系统概况】MDC呈现中几个元素的位置问题
		
## [1.8.0] - 2018-06-29
### Fixed
- [协议管理]添加协议，已存在相同协议文件夹名时，删除原来的重命名文件夹，在解压文件；解决文件夹重命名时覆盖原文件失败问题。
- [配置管理]删除设备时并删除Cabinet_Device_Map表同设备编号的数据。
- [设备组态配置]优化页面加载相同路径错文件和配置显示相同序号时缺少问题。
- 解决配置的复选框的勾选不清楚问题；选中为√，否则为X。
- [设备详情]设备组态页面=> (右下角)设备详情：原信号列表加载是定时3秒后去读缓存的，现在已修改为已进入页面就去读取缓存。
### Added
- [组态]添加导入导出组态页面功能。
		
## [1.7.5] - 2018-06-22
### Added
- [历史数据管理]JOB清除数据库数据界面化
- [门禁管理-维护管理-门管理-控制]多门纽贝尔刷卡是否需要密码。
### Fixed
- [组态]实时信号图表，允许选择多设备的信号
- [设备组态分类]添加设备时，绑定默认设备组态子集；删除设备时，删除该设备子集。
- [设备组态分类]父节点路径不能为组态的#/device/目录，父节点没有子节点路径不能为空。
- [组态]实时信号图表，X轴改为采集时间轴。
- 解决 #IKH16:【V1.6.0】组态页面配置，新增父节点，图标没地方产生。
- [设备组态分类]跳转链接添加缺省组态链接。
- [组态]优化实时图表组态，表达式添加支持仪表盘。
		
		
## [1.7.0] - 2018-06-08
### Added
- 用户-权限管理；管理员：可配置和远程控制；用户：只能浏览
### Fixed
- 优化告警联动；告警联动的表达式光标定位
- 实现弹出框移动
- [组态]远程控制；管理员权限才能发送命令，遥控：取消输入密码与选择含义；遥调：取消输入密码。
- 功能模块显示；在mainconfig.xml中配置，重启Nurse服务生效。
	
	​	
## [1.6.5] - 2018-05-31
### Fixed
- 修改TBL_Door的DoorID生成规则为时间戳。解决同步配置到GTWeb时出现同步异常。
- 解决#IJWWE:【V1.5.07】MDC机柜温度信号配置，"低部"改成“底部”含义更好一些
- 解决MDC配置，删除不掉最后一个设备问题
- 配置管理-新增设备-端口 添加虚拟端口与优化SNMP口配置
- [组态]设备状态组态优化，允许多个设备状态集中判断，显示顺序：中断 > 告警 > 正常
### Added
- [组态]新增实时信号图表组态
- [组态]新增历史信号图表组态
		
## [1.6.0] - 2018-05-15
### Fixed
- [MDC配置]修改不需要绑定MDC能耗即可配置MDC基本框架
- [2D MDC]2D MDC的安防、配电、温场整合成一个页面
- [2D MDC]添加了3个冷通道温湿度
- 同组态分类的子列表可以跨设备选择信号，详情请看“组态页面分类配置.docx”。
- 1、如“配电”中有UPS、配电柜；那么组态应该可以选在两个设备的信号加载在一个页面。
- [MDC配置]解决32个机柜第15个机柜就开始Side为B问题。
- [FSU]解决直接拔掉端子后通讯异常不出现问题。
### Added	
- [告警通知 -> 网络电话模块设置]TCP/IP方式实现 短信与语音 推送，测试可联系我们这边提供一个外置的短信模块。
- [配置管理 -> 设备信息管理 -> 组态页面配置]添加组态页面栏修改和添加功能
- 1、 添加左边组态页面分类
- 1.1、 组态页面配置=>新增父节点=>修改=>标题&文本图标&跳转链接(无子节点)
- 2、 组态页面添加设备或者子页面
- 2.1、添加设备页面：组态页面配置=>新增子节点=>选择子节点=>修改=>绑定设备
- 2.2、添加其他页面：组态页面配置=>新增子节点=>选择子节点=>修改=>修改标题&跳转链接

	​			
## [1.5.07] - 2018-04-27
### Added
- 用户 => 界面设置 ： 修改标题名称和LOGO
- 修改组态右击编辑方法与添加组态编辑方法
- 配电图 页面
### Fixed
- 组态页面IE 11全屏功能兼容
- 删除协议时，解决设备模板ProtocolCode相同异常问题(.sql文件中的存储过程)


## [1.5.06] - 2018-04-20
### Fixed
- 环境量组态添加声光类型
- 优化模板管理-事件管理-条件:基类编号非空判断
- 解决 设备状态组态 设备加载问题
- 设置IP后注册SDog
### Issues
- GTWeb同步Nurse同步工具
- SNMP北向同步工具
		
## [1.5.05] - 2018-04-13
### Fixed
- 选择模板模态窗口添加滚动条 
- 模板管理模态窗口添加会指针
- MDC根据摄像头类型显示通道号
- 配置管理->信号管理->添加信号表达式选择
- 告警联动->新增/修改优化控制队列选择
### Issues
- \#IIU86:【V1.5.04】门禁刷卡记录查询导出的问题
- \#IIU88:【V1.5.04】门禁刷卡记录查询结果的问题
### Added
- MDC机柜资产信息
		
		
## [1.5.04] - 2018-04-04
### Fixed
- mainconfig.xml中添加showBaseType标识设备的信号加载是否根据BaseTypeId
- 添加'高级配置'功能栏，放置不常用的配置(将校时、修改IP和巡检放到 高级配置)
- 修改d_init.sql文件的导入错误问题(赵，整合的脚本注释后没加空格，刷脚本报错，已修改)
- [SQL]修改根据设备添加门存储过程，根据BaseTypeId为1001390001信号的Expression值为最大门号值
- 整合包中的FSU是支持刷卡记录的
- 整合包中的SDOG是解决了Run灯不亮问题，但是新问题是会一直重启。。。(已经回信驼铃让他解决了)
		
		
## [1.5.03] - 2018-03-30
### Fixed
- [组态]拓扑图组态，修改信号列为开关量的信号列(原来是事件列)
- [视频]回放时，解决第二个摄像头回放第一个摄像头内容问题
- [SQL]添加了IT服务柜的TBL_SignalBaseDic、TBL_EventBaseDic和TBL_CommandBaseDIc脚本(麻烦JL看一下是否有遗留、错误)
- [门禁]岭南已解决码云上的门禁问题，新协议在压缩包中
		
			
## [1.5.02] - 2018-03-16
### Added
- 在mainconfig.xml的loginPage属性配置小机房与微模块版本切换功能
- [MDC配置]添加微模块类型				
### Fixed
- [系统概况]机柜弹出框功率计算错误问题
- [MDC配置]定义微模块-新增机柜设备：添加默认开始U位和默认U高
- [MDC配置]微模块的三相电压电流允许只输入A相


## [1.5.01] - 2018-03-09
### Fixed
- [MDC2D]优化MDC2D温场
- [MDC2D]优化MDC机柜
- [组态]优化信号组态
- \#IH48W:【V1.3.1】告警语音播报问题
- [组态]优化信号组态，通讯中断背景色为灰色
- [MDC配置]添加配置生效按钮
- [MDC配置]给机柜弹出框添加机柜几标题
- [门禁管理-时限管理]时组修改乱问题
- [门禁管理-时限管理]时组修改乱问题
- [组态]优化虚拟组态；允许函数中添加函数[待续]
- [门禁管理-快捷加卡]快捷加卡，获取卡号
- [组态]门禁组态添加刷卡人姓名
- [告警通知-邮箱配置]添加提示，授权码即是密码
- 解决邮件发送失败问题
- [告警通知]邮箱配置，非数字判断
- [模板管理-修改]修改模板，属性多选问题
- \#IC9WD:设备删除后数据库配置相关的数据并没删除
- [系统概况]机柜弹出框的温度获取错问题
- [模板管理]解决信号修改失败问题
### Added
- [模板管理-基类信号/基类事件/基类控制]添加删除用户新增的基类
		
		
## [1.5.0] - 2018-02-10
### Fixed
- [门禁管理-卡管理]优化删除卡/修改卡代码，解决TBL_DoorCard的数据混乱问题。
- \#IHHJ3:【V1.3.13】时限管理，当时特权时，不允许修改时段，也不保存，也不下发时间组命令
- \#IHS2B:【V1.3.16】修改卡的界面，几个问题
- \#IHS25:【V1.3.16】时间组，新增时间组后，不必立即下发命令
- \#IHS1O:【V1.3.16】修改卡授权时，要和新增卡时一致
- [门禁管理-时限管理]特权时间组禁止修改
- \#IHR4Y:【V1.3.16】删除卡，tbl_card中已经没有被删除的卡了，但页面刷新始终有这张卡（点查询按钮），除非切换其他非门禁页面再切回
- [MDC配置]机柜资源管理
- [门禁管理-时限管理]特权时间组不下发42命令
- 优化虚拟组态，允许直接在表达式后添加字符(单位)[待续]
- [协议管理]删除协议同时删除so库
- [门禁管理-时限管理]修改时组，时段超过24段问题。
- [门禁管理-卡管理]修改卡，关联门失败问题。
### Added
- 图表组态(包含饼图、柱形图、折线图)[待续]
		
## [1.3.16] - 2018-02-02
### Issues		
- \#IHHIG:【V1.3.13】门信息修改，显示“修改成功，等待设备反馈”，不要这个提示，修改门信息是不下发控制命令的。修改成功后，界面自动更新，不需要提示
- \#IHHID:【V1.3.13】门信息修改
- \#IHHIA:【V1.3.13】门管理显示，增加一列，显示门禁控制器，显示门号而不是门ID
- \#IHHJJ:【V1.3.13】加卡界面的一些问题，请参加下图
- \#IHHTY:【V1.3.13】告警联动，遥调暂不支持
- \#IHHTZ:【V1.3.13】告警联动，点“配置生效”，提示不准确，应该是“配置管理->配置生效”
- \#IHHU4:【V1.3.13】告警联动，界面显示没有按照ActionId大小顺序来显示
- 告警联动与MDC配置表达式支持的运算符
- [MDC配置]解决烟感配置不上问题
- \#IHHJD:【V1.3.13】时段修改保存下发后，没有在tbl_doortimegroup中绑定关联关系
- \#IHN8N:[门禁管理]门禁卡授权新思路
- 删除协议模板，并删除so库文件
### Added
- [模板管理]事件、控制添加基类绑定
		
## [1.3.15] - 2018-01-16
### Fixed
- [FSU]解决多个IT服务器设备，显示同个设备信息问题。替换新的FSU
### Added
- [组态]UPS拓扑图
- [模板管理]信号绑定基类功能(未完成，ZW)

## [1.3.14] - 2018-01-24
### Fixed
- [门禁管理]时限，时间段问题。
- [组态]全屏按钮问题。
- [设备配置]开放端口:简单逻辑控制口。(配置IT服务器设备的指定端口)
- [MDC配置]机柜其他事件混乱问题。
### Added	
- Nurse加入看门狗，替换/home/app/samp/sdog文件(先替换好所有的文件，使用reboot -f重启机子或断电重启)
- 1、nurse服务停止十分后，sdog将重启nurse
- 2、telnet到A8使用“netstat -anp|grep udp”查看，upd的端口看到以下信息说明启动成功
				
## [1.3.13] - 2018-01-19
### Fixed
- [门禁管理]重新编写下发命令的格式。详情请看“Nurse门禁开发流程功能介绍v4.0”
- [门禁管理]修改TBL_Card表结构，添加CardType卡号类型。
- [门禁管理]新增CardType卡号类型默认值。
- [人员管理]修改用户ID生成规则，1-9999
- 2D与3D的跳转
- [组态]设备列图标
- [MDC&邮箱通知]修改MDC和邮箱通知的序号脚本
- [MDC配置]U高变了，页面机柜弹出框，溢出。


## [1.3.12] - 2018-01-12
### Added
- [告警联动]配置=>告警联动，需刷SQL脚本。
- 门禁刷卡记录与卡号，需要替换FSU
		
## [1.3.11] - 2018-01-5
### Issues
- \#IGZGT:【V1.3.1】MDC配置：新增机柜设备，按钮名称应该是“保存”
- \#IH0FI:【V1.3.1】模板管理：新增/修改信号测点，易用性的一些问题
- \#IH0FD:【V1.3.1】模板管理：新增信号的一些问题
- \#IGZH7:【V1.3.1】MDC配置：柜子类型不能选“高压直流”
- \#IGZJD:【V1.3.1】MDC配置：传感器绑定失败
- \#IGZIY:【V1.3.1】MDC配置：新增机柜设备，U位起始和U位高计算有点乱
- \#IH2RM:【V1.3.1】模板管理：事件条件设置，开始延时，如果为空不填，保存失败，Console打印异常
- \#IGZWF:【V1.3.1】机柜设备页面，问题在截图中描述 
- \#IGZH4:【V1.3.1】这个页面是否可以做成实时刷新？
- \#IGZIE:【V1.3.1】MDC配置：新增告警时，先选“温度01告警”，并存，然后再同时选中“温度02告警”“温度03告警”，保存，此时就多出了一条不知道的告警
- \#IGZIQ:【V1.3.1】MDC配置：新增机柜设备，原来有一个UPS设备，高度是35U，现在需要将它修改为42U，先删除，再增加，点保存，发现U高还是35
- \#IGZGU:【V1.3.1】MDC配置：输入电压电流信号，显示范围小，截断了，加长一点
### Added
- [组态]添加虚拟量组态
### Fixed
- [邮件告警设置]解决查看密码按钮
- [MDC配置]添加信号过滤
- [MDC配置]非空判断
- [配置管理]将端口设置网口的端口号设置为COM100-COM200
- 删除信号列表缓存中多余的信号
- 当连接网络数超过100，重启Nurse进程
- [SQL]服务器EquipmentBaseType
- [门禁管理]添加门禁命令下发通知代码
- [门禁管理]门管理修改布防，撤防修改以及新增卡后卡管理页面及时刷新
- [组态]给组态和设备详情页，数据未上来时添加加载中字样。
- [设备详细]设备详细显示所有可见信号
- 优化定时移除控制命令代码
- [模板管理]添加基类列




## [1.3.1] - 2017-12-15
### Added
- 组态页面的信号列表过滤功能
### Fixed
- MDC配置的数据库数据存储方式
- 解决MDC配置的1-10机柜添加失败问题
- 邮箱定时的数据库数据存储方式
- 优化添加协议模板时，设备通讯状态BaseTypeId为NULL问题
- 邮箱定时，分别发送当前告警与历史告警


## [1.3.0] - 2017-12-07
### Added
- 模板管理 功能

## [1.2.8] - 2017以前
### Added
- MDC配置

## [1.2.7] - 2017以前
### Added
- 门禁管理

## [0.2.2] - 2016-06-27
### Won't Fix
- 曲线信息框缩小不正常（放大没问题）因为我们分辨率是固定的，可以考虑不做修改。
- 曲线表查询日期不启作用，这时模拟数据，正式要取消，只是因为数据没打通，为了看效果保留。
- 曲线表编辑框，这是显示曲线对应数据记录的地方，因为没有真正数据，所以没有看到。有数据就好
- 曲线表excel问题，目前没数据。有数据我们再测
- 右侧墙壁参数最好能够显示出来，这是围墙，围墙是地板的一个属性，所以不能单独选中围墙，要在页面的地板选项中选择
- 3D物体高度是设置的，2D配置无法直观看出效果，只有3D配置可解决这个问题。

### Fixed
- 默认打包无版本号，改为在console中显示
- 修改默认页面为空的情况，可以允许跳转到登录，登录增加数据库出错提示。  
- 经常出错是因为没有异常处理，已经增加
- 点三个点自动完成墙的绘制
- 设置不能看到底部，设置最小和最远距离限制
- setHex错误加捕获
- 切换异常处理

## [0.2.1] - 2016-05-04
### Added
- KPI：历史警告报表
- KPI：资产分布
- WEB3D的DEMO机房配置

### Fixed
- 解决3D整合问题
- Server端BasePath 文件Web相对路径独立函数，解决其他文件路径错问题

### Removed
- 删除Config无用JS文件及目录
- 清理文件目录

### 添加引用
如果要增加第三方引用，一定要使用maven repository，不允许放lib目录硬引用（pom文件目前无法管理） 

## [0.2.2] - 2016-06-12
### Fixed
- 视频、KPI、3D
- 优化视频回放功能 
- 修改KPI BUG（加载KPI错误）
- 美化3D配置

### Added
- 增加视频配置功能
- 修改KPI 
- 样式BUG

## [0.2.0] - 2016-04-12
### Added
- WEB3D代码合并

### Removed
- 删除Config无用JS文件及目录
- 清理文件目录

## [0.1.1] - 2016-02-19
### Added
- 能新增Label控件、图片控件
- 摄像头控件添加能预览
- 信号列表框能编辑名称。

### Removed
- 删除Label、图片控件

### Security
- 用户管理增加心跳机制

## [0.1.0] - 2016-01-09
### Added
- 采集配置工具合并
- 海康web视频支持

## [0.0.3] - 2015-12-09
### Added
- 历史数据曲线报表
- 告警记录报表
- 更改密码
- 单用户登录

### Changed
- 界面主题从“bootstrap 默认风格”更改为自定义黑色主题，不可恢复。

## [0.0.2] - 2015-11-10
### Added
- 组态显示框架及控件
- 组态配置工具及控件

## [0.0.1] - 2015-10-31
### Added

- 实时数据刷新
- 活动告警管理
- 基础框架