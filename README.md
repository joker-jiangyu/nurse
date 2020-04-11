## 项目指南



### 环境
JDK：1.8以上(java8)，不能用1.9 (Java9)  
IDE：默认使用Eclipse  或 IntelliJ IDEA

### 运行
当直接下载代码，用eclipse打开运行前，第一次请先执行命令：

> clean package

软件的各种资源文件（组态，配置，网页）需要能在开发状态和打包状态下都能正确取到。所以，增加了BasePath类来判断环境是开发还是运行状态来进行基准目录的修正。  

开发状态：软件的运行目录为：nurse\target\classes  
运行状态：软件的运行目录为：nurse当前目录  

因为，当你从git上下载代码后，没有target目录，所以必需先打包一次，才能正确访问组态画面等资源文件。   
如果你需要修改测试资源文件，请每次执行打包命令，否则和IDE的内容不同步  

之后，执行NurseApp作为应用启动，就可以看到程序正常运行。

### 打包
目前的项目是Maven工程，建立run config, 设置nurse为工作目录，Goals内容如下：  

> clean package

也可以直接右键运行Run As的Maven Build，也可以直接运行。  

打包后将在target目录产生nurse-1.0.1目录，所有执行所需要的文件都已经放好在这个目录下，将这个目录拷贝到任何目录都可以运行。


