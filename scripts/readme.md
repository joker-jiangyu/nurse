## 基础信息
脚本存放的基础目录为：\scripts  
脚本为Mysql格式，编码为:UTF8-无BOM  
Mysql版本：V5.1.5

## 文件命名
文件名全部小写在, 以英文单字母表明查看和执行的顺序。  
必需要按照顺序刷入数据库脚本。

> scripts/a_table.sql

数据库表的脚本

> scripts/b_procedure.sql

数据库存储过程的脚本

> scripts/c_view.sql

数据库视图的脚本

> scripts/d_init.sql

数据库初始化数据的脚本

> scripts/e_changes.sql

数据库权限的脚本

> scripts/f_permission.sql

暂没有合并的临时脚本，内有的代码需特殊说明，未来期望取消这个文件


## 建库
### 1 建数据库
首先安装mysql  
其次安装navicat premium 访问mysql  
输入数据库，选择字符集为utf-8  
![数据库新建对话框](http://git.oschina.net/uploads/images/2016/0331/080403_6fe72212_721614.png "navicat 新建数据库")  
点确定后，建立数据库

### 2 打脚本  
打开查询功能，按abcd的顺序加入数据库脚本，点击运行  
![打开数据脚本](http://git.oschina.net/uploads/images/2016/0331/080714_94c2f456_721614.png "打开数据脚本")

或者直接在数据库上点击右键运行SQL文件也可以。   
目前建议打入a-f脚本用来做测试，未来只需要a-d脚本就够了。

## 更新机制

## 日志
1 更改目录及文件名,原有内容全部保留  
2 合并changes到a-d文件中
3 更新readme.txt 为md文件，git网站自动可显示帮助