//debugger;
'use strict';

var nurseController = angular.module('nurseApp.controllers', []);


nurseController.controller('sidebarCtrl',['$scope','$rootScope','$stateParams','$element','$compile','$state','deviceService','diagramService','ConfigureMoldService',
    function($scope,$rootScope,$stateParams,$element,$compile,$state,deviceService,diagramService,ConfigureMoldService){
        $scope.$watch('PathType',function(newValue,oldValue,$rootScope){
            if($rootScope.PathType == "device"){
                createDeviceSidebar();
                $scope.parentIndex = 0;
                $scope.childIndex = 0;
            }else{
                if(localStorage.getItem("versions") != "IView"){
                    deviceService.getAllDevicesType();
                    return;
                }
                var PathType = localStorage.getItem("pathType");
                if(PathType == "device"){
                    createDeviceSidebar();
                    defaultSelect();
                }else
                    $scope.showSidebar = false;
            }
        });
        //生成组态页面列表
        function createDeviceSidebar(){
            deviceService.GetShowConfigureMold().then(function(data){
                $scope.DeviceSidebar = parseSidebar(data);
            });
            $scope.showSidebar = true;
        }
        //配置化
        function parseSidebar(data){
            if(data){
                data.forEach(function(item){
                    //绑定默认跳转链接
                    var url = '#/device/9999/diagram';
                    if(item.configUrl == undefined || item.configUrl == ''){
                        if(item.parts.length > 0)
                            url = item.parts[0].configUrl;
                    }else
                        url = item.configUrl;
                    item.configUrl = url;
                });
            }
            return data;
        }
        //点击加载当前组态页面下的所有设备页面
        $scope.loadDeviceChild = function($event,parts,index){
            //选中状态
            $scope.lineClick('parent',index);

            $("#side-menu .sub-li .device-ul").remove();
            if(parts && parts.length >= 2){
                $scope.DeviceParts = parts;
                var newUl = "<ul class='device-ul'>" +
                            "   <li class='device-li {{getActive(\"child\",$index)}}' ng-repeat='part in DeviceParts' ng-click='changeDevice(part.configUrl,part.deviceId,part.parentId,$index)'>" +
                            "       <span>{{part.configName}}</a>"+
                            "   </li>"+
                            "</ul>";
                $compile(newUl)($scope).appendTo($event.target.parentNode);
            }
        };

        //点击选中事件
        $scope.lineClick = function(type,index){
            if(type == "parent"){
                $scope.parentIndex = index;
                $scope.childIndex = 0;
            }
            if(type == "child")
                $scope.childIndex = index;

            localStorage.setItem("ParentIndex",$scope.parentIndex);
            localStorage.setItem("ChildIndex",$scope.childIndex);
        };
        $scope.getActive = function(type,index){
            if(type == "parent")
                return $scope.parentIndex == index ? 'active' : '';
            if(type == "child")
                return $scope.childIndex == index ? 'active' : '';
        };
        //默认选中状态
        function defaultSelect(){
            var parentIndex = localStorage.getItem("ParentIndex");
            if(parentIndex != null){
                $scope.parentIndex = parentIndex;
            }

            var childIndex = localStorage.getItem("ChildIndex");
            if(childIndex != null){
                $scope.childIndex = childIndex;
            }
        }

        //选中设备
        $scope.changeDevice = function(url,value,parentId,index) {
            $scope.lineClick('child',index);

            $scope.isShowView = true;
            window.location = url;
            if(url.indexOf(".table") != -1){
                $stateParams.deviceBaseTypeId = url.replace(/[^0-9]/ig,'')+".table";
            }else if(!isNaN(url.replace(/[^0-9]/ig,'')))
                $stateParams.deviceBaseTypeId = url.replace(/[^0-9]/ig,'');
            if(value == '0')
                value = $stateParams.deviceBaseTypeId;

            setDiagramView(value,parentId);
            sessionStorage.setItem("currDeviceId",value);
        };
        function setDiagramView(devId,parentId) {
            $scope.select.selectedDeviceId = parseInt(devId);

            var param = $stateParams.deviceBaseTypeId + '.' + devId;
            if($stateParams.deviceBaseTypeId.indexOf(".table") != -1)
                param = 'table.' + devId;

            var cfg = {};
            diagramService.getDiagramConfig(param).then(function(data) {
                if (data){
                    cfg.diagram = data;

                    cfg.diagram.deviceBaseTypeId = $stateParams.deviceBaseTypeId;
                    cfg.diagram.deviceId = devId;
                    cfg.diagram.parentId = parentId;
                    $state.go($stateParams.diagramview, cfg);
                }
            });
        }
    }
]);

nurseController.controller('kpiCtrl',['$scope','$stateParams','$element','KpiService','KpiLayout','$http',
    function($scope,$stateParams,$element,KpiService,KpiLayout,$http){
        var charType = new Array();

        //加载HTML
        function initHtml(){
            $http.get("data/KPI"+$stateParams.id+".html").success(function(data) {
                $element.html(data);
                setTdHeight();
                setTdWidth();
                init();
                getKpiData($stateParams.id);
            });
        }
        initHtml();

        //加载画布的id
        function init(){
            $element.find("table tr").each(function(){
                $(this).children("td").each(function(){
                    var charId = $(this).text();
                    if(charId != 'GTCHART'){
                        charType.push(charId);
                        if (charId.indexOf("[") != -1)
                            charId = charId.split("[")[0];
                        var div = "<div class='charts_div'><a class='charts_a' id='" + charId + "'></a></div>";
                        $(this).html(div);
                    }
                });
            });
        }

        //获取数据
        function getKpiData(kpiNo){
            KpiService.GetKPISqlDatas(kpiNo).then(function(data){
                loadHtmlLayout(data);
            });
        }
        //加载KPI布局
        function loadHtmlLayout(data){
            var sysStyle = localStorage.getItem("systemStyle");

            var color = "#FFFFFF";
            if(sysStyle == "White") color = "#464952";

            $element.find("table tr").each(function(){
                $(this).children("td").each(function(){
                    var charId = $(this).children("div").children("a").attr("id");
                    var thisDid = $(this);
                    data.forEach(function(item){
                        if(item.ID == charId){
                            if(item.BagType == "Label"){
                                thisDid.html('<h3 style="width:100%; height:100%; font-size:23px; text-align:center; font-weight:400; '+color+'" id="'+charId+'">'+item.Text+'</h3>');
                            }else if(item.Charts.ChartType == "Table"){
                                thisDid.html('<div style="height:100%;width:100%;overflow:auto;" class="charts_div" id="'+charId+'"><div class="table_div">'+
                                    LayoutTable(item)
                                +'</div></div>');
                            }else{
                                var rootDiv = document.createElement("div");
                                rootDiv.setAttribute("class","charts_div");
                                var newA = document.createElement("a");
                                newA.setAttribute("id",charId);
                                newA.setAttribute("class","charts_a");
                                rootDiv.appendChild(newA);

                                getOption(item);
                            }
                        }
                    });
                });
            });
        }

        //布局表格
        function LayoutTable(data){
            if(data.Charts == undefined || data.ChartData == undefined || data.ChartData.Line1 == undefined) return;
            var columns = parseInt(data.Charts.Length);
            var count = data.ChartData.Line1.length;
            //Title
            var title = "<div style='text-align:center;'><h3>"+data.Text+"</h3></div>";
            //THead
            var thead = "<thead><tr class='charts_table_thead_tr'>";
            for(var j = 1;j <= columns;j++){
                thead += "<th>"+eval("data.Charts.Line"+j)+"</th>";
            }
            thead += "</tr></thead>";
            //TBody
            var tbody = "<tbody>";
            for(var i = 0;i < count;i++){
                tbody += "<tr>";
                for(var j = 1;j <= columns;j++){
                    tbody += "<td>"+eval("data.ChartData.Line"+j+"["+i+"]")+"</td>";
                }
                tbody += "</tr>";
            }
            tbody += "</tbody>";
            //Table
            var table = "<table width='100%' height='90%' class='datatable body_transparent charts_table' border='1'>"+thead+tbody+"</table>";
            return title+table;
        }

        var index = 0;
        function getOption(data){
            var sysStyle = localStorage.getItem("systemStyle");
            var colorArr = ["#068cfd","#1dc0c5","#fc794f","#3a546d"];

            if(data.Charts.ChartType == "Bar" || data.Charts.ChartType == "Line"){//柱形图和则线图
                $http.get("data/LineOrBarCharts.json").success(function(datas) {
                    if(index > 3) index = 0;
                    var value = $("#"+data.ID)[0];
                    var myOption = echarts.init(value);
                    var option = datas;
                    if(sysStyle == "White"){
                        option.title.textStyle.color = "#464952";
                        option.legend.textStyle.color = "#464952";
                        option.xAxis[0].axisLabel.textStyle.color = "#464952";
                        option.yAxis[0].axisLabel.textStyle.color = "#464952";
                    }

                    option.color = [colorArr[index]];
                    option.title.text = data.Text;
                    option.yAxis[0].name = data.Charts.Line1;
                    option.xAxis[0].name = data.Charts.Line2;
                    option.yAxis[0].min = 0;
                    option.yAxis[0].max = "auto";
                    option.grid.x = 60;
                    option.grid.y = 50;
                    option.grid.x2 = 60;
                    option.grid.y2 = 30;

                    var series = {
                        name : data.Charts.Line1,
                        type : data.Charts.ChartType == "Bar" ? "bar":"line",
                        data : [],
                        itemStyle : {normal: {areaStyle: {
                            color :  (function (){
                                var zrColor = zrender.tool.color;
                                return zrColor.getLinearGradient(
                                    0, 200, 0, 400,
                                    [[0, colorArr[index]],[0.1, 'rgba(255, 255, 255, 0)']]
                                )
                            })()
                        }}}
                    };
                    option.series.push(series);
                    //刷新数据的代码
                    option.xAxis[0].data = data.ChartData.Line1;
                    option.series[0].data = eval(data.ChartData.Line2);
                    myOption.setOption(option,true);
                    index ++;
                });
            }else if(data.Charts.ChartType == "Pie"){//饼图
                $http.get("data/PieCharts.json").success(function(datas){
                    var value = $("#"+data.ID)[0];
                    var myOption = echarts.init(value);
                    var option = datas;
                    if(sysStyle == "White")
                        option.title.textStyle.color = "#464952";

                    option.title.text = data.Text;
                    option.series[0].radius = [110,"70%"];
                    //option.series[0].name = data.Charts.Line1;
                    //刷新数据的代码
                    var cfg = [];
                    var count = data.ChartData.Line1.length;
                    for(var i = 0;i < count;i++){
                        var cfgs = {};
                        cfgs.name = eval("data.ChartData.Line1["+i+"]");
                        cfgs.value = eval("data.ChartData.Line2["+i+"]");
                        cfg.push(cfgs);
                    }
                    option.series[0].data = cfg;
                    myOption.setOption(option,true);
                });
            }
        }

        //设置td的高度
        function setTdHeight(){
            var bodyHeight = $(document.body).height();
            var trColHeight = 0;
            $("tr").each(function () {
                if (!!$(this).attr('style'))//获得由style属性的高
                    trColHeight += $(this).height();
            });
            var resultHeight = bodyHeight - trColHeight;//去除后的页面高度
            var tdHeight = resultHeight / parseInt($("#layouttable").attr("visiblerowcount"))-60;
            $("tr").each(function () {
                if (!!$(this).attr('style'))
                    return true;
                $(this).children("td").each(function () {
                    var realHeight = parseInt($(this).attr("visiblerowcount")) * tdHeight;
                    $(this).height(realHeight);
                });
            });
        }
        function setTdWidth(){
            var trWidth = $("#page-wrapper").width();
            $('td').each(function(){
                var charId = $(this).html();
                if(window.location.href.indexOf("KPI//3")){
                    if(charId=='AnalysisModel1'){
                        $(this).width(trWidth*0.38);
                    }
                    if(charId=="AnalysisChart1"){
                        $(this).width(trWidth*0.58);
                    }
                }
            });
        }
    }
]) ;

nurseController.controller('deviceInfoCtrl', ['$scope', 'alarmService', '$stateParams','$rootScope','activeDeviceService', 'activeSignalService', '$interval', '$modal', 'balert','ConfigureMoldService','$location','deviceService','ImageManageService','uploadService',
    function($scope, alarmService, $stateParams,$rootScope, activeDeviceService, activeSignalService,$interval, $modal,  balert, ConfigureMoldService,$location,deviceService,ImageManageService,uploadService) {

        $scope.sigs = [];
        $scope.tableFixedHeader = {
            className : 'container-fluid',
            scrollTop : 200,
            clientHeight : 999,
            top : 105 //MDC版本是98
        };
        var stop;
        var remarkDialog;

        $(function(){
            var referrer = sessionStorage.getItem("referrer");
            if(referrer.indexOf("device") > -1 || referrer.indexOf("device") > -1)
                $(".container-fluid.device-info").css("padding-left","160px");
            else
                $(".container-fluid.device-info").css("padding-left","23px");
        });

        function initFunction(){
            activeDeviceService.getActiveDevices().then(function(data) {
                $scope.devices = data;
                var dev = undefined;
                data.forEach(function(item) {
                    if(item.id == $stateParams.deviceId)
                        dev = item;
                });

                if(dev == undefined) return;

                if (dev.status === "Alarm") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Alarm;//"告警中"
                if (dev.status === "Normal") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Normal;//"正常运行"
                if (dev.status === "Disconnect") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Disconnect;//"已中断"

                dev.colorClass = function() {
                    if (dev.status === "Alarm") return "text-danger";
                    if (dev.status === "Normal") return "text-success";
                    if (dev.status === "Disconnect") return "text-muted";
                };

                dev.iconClass = function() {
                    if (dev.status === "Alarm") return "fa fa-bell";
                    if (dev.status === "Normal") return "fa fa-check";
                    if (dev.status === "Disconnect") return "fa fa-times";
                };

                $scope.device = dev;
            });

            activeSignalService.getActiveSignalByDevice($stateParams.deviceId).then(function(data) {
                if($scope.device && $scope.device.status != undefined && $scope.device.status == "Disconnect"){//设备状态为中断时，所有的信号状态都为中断
                    data.forEach(function(item){
                        item.alarmSeverity = -255;
                    });
                }
                $scope.sigs = data;
            });

            alarmService.getAlarmsByDeviceId($stateParams.deviceId).then(function(data) {
                $scope.alarms = data;
            });
        }

        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            initFunction();

            stop = $interval(function() {
                initFunction();
            }, 3000);
        };

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
            $rootScope.parentId = undefined;
        });

        $scope.getStatusLabel = function(status) {
            if (status == 255)
                return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Normal;//"正常"
            else if(status == -255)
                return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Disconnect;//"已中断"
            else if(parseInt(status) >= 0 && parseInt(status) <= 3)
                return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Alarm;//"告警"
            else
                return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Loading;//"加载中"
        };

        $scope.getStatusTextClass = function(preClass, status) {
            if (status == 255)
                return preClass + " text-success";
            else if(status >= 0 && status <= 3)
                return preClass + " text-danger";
            else
                return "text-muted";
        };

        $scope.getStatusIconClass = function(status) {
            if (status == 255)
                return "fa fa-check";
            else if(status >= 0 && status <= 3)
                return "fa fa-bell";
            else
                return "fa fa-times";
        };

        $scope.beginEndAlarm = function(uniqueId) {

            $scope.selectedAlarmUniqueId = uniqueId;
            //alert($scope.selectedAlarmUniqueId);

            remarkDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/alarmRemarkDialog.html',
                show: false
            });

            remarkDialog.$promise.then(remarkDialog.show);
        };

        $scope.endEndAlarm = function(note) {
            if(note == undefined || note == ""){
                balert.show('danger',$scope.languageJson.RoomHome.AlarmTitle.EndAlarm.ReasonError,3000);//'理由不能为空！'
                return;
            }
            var logonId = localStorage.getItem("username");
            var param = "'" + $scope.selectedAlarmUniqueId + "'|" + logonId + "|" + note;

            alarmService.endAlarm(param).then(function(data) {
                remarkDialog.hide();
            });
        };

        $scope.pushBut = function(){
            window.location.href = sessionStorage.getItem("referrer");
            /*var href = window.location.href;
            if(href.indexOf("index.html") > -1 || href.indexOf("/#/") > -1)
                window.location.href='/index.html';
            else
                window.location.href='mdc.html#/mdcoverall';*/
        };

        $scope.start();

        //region 多设备详情 (本身+隐藏)
        //加载设备列表
        function loadDeviceList(){
            $scope.deviceList = [];
            if($rootScope.parentId == undefined) return;
            ConfigureMoldService.GetPartEquipments($rootScope.parentId).then(function(data){
                $scope.deviceList = parseVisibleDevices(data);
            });
            $scope.selectedDeviceId = $stateParams.deviceId;
        }
        loadDeviceList();
        //加载设备本身和隐藏的设备
        function parseVisibleDevices(data){
            var arr = [];
            if(data){
                data.forEach(function(dev){
                    if(dev.equipmentId == $stateParams.deviceId || dev.visible == "false")
                        arr.push(dev);
                });
            }
            if(arr.length <= 1)
                $scope.visibleDeviceView = false;
            else
                $scope.visibleDeviceView = true;
            return arr;
        }
        //显示更多的设备列表
        $scope.isShowView = true;
        $scope.showViewClick = function () {
            $scope.isShowView = !$scope.isShowView;
        };

        $scope.changeDevice = function(deviceId){
            $stateParams.deviceId = deviceId;
            $scope.isShowView = true;
            initFunction();
        };
        //endregion

        //region 设备信息
        //设备信息页
        var deviceInfoDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/deviceInfoBox.html',
            show: false
        });
        $scope.showDeviceInfoClick = function(){
            deviceService.getDeviceInfo($stateParams.deviceId).then(function(data){
                if(data && data.length > 0){
                    $scope.DeviceInfo = data[0];
                }
            });

            deviceInfoDlg.$promise.then(deviceInfoDlg.show);
        };

        //编辑设备信息
        var editDeviceInfoDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/editDeviceInfoBox.html',
            show: false
        });
        $scope.editDeviceInfoClick = function(){
            //$scope.DeviceInfo
            $scope.file = undefined;
            editDeviceInfoDlg.$promise.then(editDeviceInfoDlg.show);
        };
        $scope.modifyDeviceInfoClk = function(){
            if($scope.file && $scope.file.size > 512000){
                //图片大小不能大于500k
                balert.show("danger",$scope.languageJson.Header.User.Interface.LogoHint,3000);
                return;
            }

            if($scope.file){
                uploadService.uploadFile($scope.file).then(function(data) {
                    $scope.DeviceInfo.ImagesPath = data;
                    modifyDeviceInfo($scope.DeviceInfo);
                });
            }else{
                modifyDeviceInfo($scope.DeviceInfo);
            }
        };
        function modifyDeviceInfo(info){
            var prompt = $scope.languageJson.DeviceInfo.Prompt;
            deviceService.ModifyDeviceInfo(info).then(function(data){
                if(data == "OK"){
                    balert.show('success', prompt.Succeed, 3000);//'修改设备信息成功！'
                    editDeviceInfoDlg.hide();
                }else
                    balert.show('success', prompt.Failure, 3000);//'修改设备信息失败！'
            });
        }
        //图片预览
        $scope.$on("fileSelected",function(event, msg) {
            $scope.file = msg;
        });
        function initPreviewImages(){
            $scope.ImageFiles = undefined;
            var showImgFileDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/showImgFile.html',
                show: false
            });
            $scope.showImgFile = function(){
                $scope.imgFiles = {
                    catalog : "img/diagram",
                    imageFile : undefined
                };
                showImgFileDlg.$promise.then(showImgFileDlg.show);

                $scope.changeCatalog($scope.imgFiles.catalog);
            };
            $scope.changeCatalog = function(catalog){
                ImageManageService.LoadImagesByPath(catalog).then(function(data){
                    $scope.ImageFiles = data;
                });
            };
            $scope.clickImage = function(imageFile,$event){
                $scope.imgFiles.imageFile = imageFile;
                $($event.currentTarget).parent().find('div').removeClass("select-image");
                $($event.currentTarget).addClass("select-image");
            };
            $scope.selectImageFile = function(){
                if($scope.imgFiles == undefined || $scope.imgFiles.imageFile == undefined){
                    //'请选择图片。'
                    balert.show('danger', $scope.languageJson.Configuration.LocalImage.SelectError,3000);
                    return;
                }
                $scope.DeviceInfo.ImagesPath = $scope.imgFiles.imageFile;
                showImgFileDlg.hide();
            };
        }
        initPreviewImages();

        //设备操作记录页
        var deviceRecordDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/deviceRecordBox.html',
            show: false
        });
        $scope.showDeviceRecordClick = function(){
            //$stateParams.deviceId
            deviceService.getDeviceRecord($stateParams.deviceId).then(function(data){
                $scope.DeviceRecords = data;
            });
            deviceRecordDlg.$promise.then(deviceRecordDlg.show);
        };
        //endregion
    }
]);

nurseController.controller('deviceStatusCtrl', ['$scope', '$state', '$location', 'activeDeviceService','$interval',

    function($scope, $state, $location, activeDeviceService, $interval) {
        $scope.devices = [];

        var stop;

        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            activeDeviceService.getActiveDevices().then(function(data) {
                $scope.devices = data;
            });

            stop = $interval(function() {
                activeDeviceService.getActiveDevices().then(function(data) {
                    $scope.devices = data;
                });

            }, 3000);
        };

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });

        $scope.gotoDevice = function(deviceId) {
            sessionStorage.setItem("referrer",window.location.href);
            $location.url('/deviceInfo/' + deviceId);
            // $state.go("deviceInfo", {
            //     id: deviceId
            // });
        };

        $scope.getStatusLabel = function(status) {
            if (status === "Alarm") return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Alarm;//"告警中"
            if (status === "Normal") return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Normal;//"正常运行"
            if (status === "Disconnect") return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Disconnect;//"已中断"
        };

        $scope.getStatusTextClass = function(preClass, status) {
            if (status === "Alarm") return preClass + " " + "text-danger";
            if (status === "Normal") return preClass + " " + "text-success";
            if (status === "Disconnect") return preClass + " " + "text-muted";
        };
        $scope.getStatusIconClass = function(status) {
            if (status === "Alarm") return "fa fa-bell  fa-lg";
            if (status === "Normal") return "fa fa-check  fa-lg";
            if (status === "Disconnect") return "fa fa-times  fa-lg";
        };

        $scope.start();
    }
]);

nurseController.controller('hisDataRecordCtrl', ['$scope', '$http', '$modal', '$filter', 'NgTableParams', 'hisDataService', 'Exporter','balert',
    function($scope, $http, $modal, $filter, NgTableParams, hisDataService, Exporter, balert) {
        (function () {
            if ($scope.languageJson == undefined)
                $scope.languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));

            $scope.params = {};
            $scope.params.startDate = new Date();
            $scope.params.endDate = new Date();

            //$scope.params.startDate = getAlreadyTime(7);
            //$scope.startTime = $scope.params.startDate.getFromFormat('yyyy-mm-dd');
            $scope.endTime = $scope.params.endDate.getFromFormat('yyyy-mm-dd');

            $scope.localLang = {
                selectAll: $scope.languageJson.SignalRecord.Selected.All,
                selectNone: $scope.languageJson.SignalRecord.Selected.UnAll,
                reset: $scope.languageJson.SignalRecord.Selected.Cancel,
                search: $scope.languageJson.SignalRecord.Selected.Filter,
                nothingSelected: $scope.languageJson.SignalRecord.Selected.Null
            };/*"全选" / "全不选" / "撤销" / "搜索" / "无内容..."*/

            $scope.onSelectAll = function () {
                //"全选查询会非常慢，请不要使用"
                //alert($scope.languageJson.SignalRecord.AllSelectPrompt);
                balert.show('success', $scope.languageJson.SignalRecord.AllSelectPrompt, 3000);
            };
            hisDataService.getAllSignalParas().then(function (data) {
                $scope.allsigs = data;
            });

            $scope.selectedsigs = [];

            $scope.valueFormat = function (fv, precision) {
                if (!precision) return fv;
                var dp = precision.indexOf(".");
                if (dp < 0) return fv;
                var fc = precision.length - dp - 1;
                return fv.toFixed(fc).toString();
            };

            $http.get("partials/hisLineChart.json").success(function (data) {
                var sysStyle = localStorage.getItem("systemStyle");
                var opt = data;
                if (sysStyle == "White") {
                    opt.title.textStyle.color = "#464952";
                    opt.legend.itemStyle.color = "#464952";
                }

                //中英文赋值
                opt.title.text = $scope.languageJson.SignalRecord.Table.HisCurve;
                opt.xAxis.title.text = "<b>"+$scope.languageJson.SignalRecord.Table.Time+"</b>";
                opt.yAxis.title.text = "<b>"+$scope.languageJson.SignalRecord.Table.Value+"</b>";

                opt.tooltip = {
                    formatter: function () {
                        var tooltip = "";
                        var index = this.series.data.indexOf(this.point);
                        var cfg = this.series.options.data[index];

                        tooltip = tooltip + "<b>";
                        tooltip = tooltip + this.series.name;
                        tooltip = tooltip + "</b><br>";
                        tooltip = tooltip + $scope.languageJson.SignalRecord.Table.Time + ":";//时间
                        tooltip = tooltip + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', new Date(this.x));
                        tooltip = tooltip + "<br>";
                        tooltip = tooltip + $scope.languageJson.SignalRecord.Table.Value + ":";//采集值
                        tooltip = tooltip + $scope.valueFormat(this.y, cfg[4]);
                        tooltip = tooltip + " ";
                        tooltip = tooltip + cfg[2];
                        tooltip = tooltip + "<br>";
                        tooltip = tooltip + $scope.languageJson.SignalRecord.Table.Meaning + ":";//含义
                        tooltip = tooltip + cfg[3];
                        return tooltip;
                    }
                };
                opt.title.text = $scope.languageJson.SignalRecord.Table.HisCurve;
                opt.xAxis.title.text = $scope.languageJson.SignalRecord.Table.Time;
                opt.yAxis.title.text = $scope.languageJson.SignalRecord.Table.Value;

                $scope.chartData = opt;
            });

            //iView 触屏控件
            if(localStorage.getItem("versions") == "IView")
                initTimeControl();
        })();

        function initTimeControl(){
            if(sessionStorage.getItem("SelectTimeType") == undefined)
                sessionStorage.setItem("SelectTimeType","Month");
            $scope.SelectTimeType = sessionStorage.getItem("SelectTimeType");

            $scope.SelectTime = {
                startDate : getAlreadyTime(30).getFromFormat('yyyy-mm-dd'),
                endDate : $scope.endTime
            };

            var calendar1 = new datePicker();
            calendar1.init({
                'trigger': '#TimeControl1', /*按钮选择器，用于触发弹出插件*/
                'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':'1970-1-1',/*最小日期*/
                'maxDate':$scope.endTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                    var theSelectData=calendar1.value;
                    $scope.params.startDate = new Date(theSelectData);
                    $scope.params.endDate = new Date($scope.SelectTime.endDate);
                    $scope.query();
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });
            var calendar2 = new datePicker();
            calendar2.init({
                'trigger': '#TimeControl2', /*按钮选择器，用于触发弹出插件*/
                'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':'1970-1-1',/*最小日期*/
                'maxDate':$scope.endTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                    var theSelectData=calendar2.value;
                    $scope.params.startDate = new Date($scope.SelectTime.startDate);
                    $scope.params.endDate = new Date(theSelectData);
                    $scope.query();
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });
        }

        $scope.changeTimeType = function(type){
            sessionStorage.setItem("SelectTimeType",type);
        };

        function getAlreadyTime(day) {
            var date = new Date();
            date.setDate(date.getDate() - day);
            return date;
        }
        function getAlreadyTimeByMonth(month){
            var date = new Date();
            date.setMonth(date.getMonth() - month);
            date.setDate(1);
            return date;
        }

        function getExportList(data) {
            var arr = [];
            arr.push({
                signal: $scope.languageJson.SignalRecord.Table.Name,
                value: $scope.languageJson.SignalRecord.Table.Value,
                time: $scope.languageJson.SignalRecord.Table.Time
            });/*"信号" / "值" / "采集时间"*/

            var darr = _.map(data, function (value, key, list) {
                return {
                    signal: _.property("name")(value),
                    value: _.property("floatValue")(value),
                    time: _.property("sampleTime")(value)
                };
            });

            return arr.concat(darr);
        }

        function showCurve(arr) {

            //group by name
            var curveGroup = _.groupBy(arr, 'name');
            //console.log(arr);

            var getCurveType = function (arr) {
                var curvetype = "spline";

                if (arr.length > 0) {
                    if (arr[0].signalCategory == "2")
                        curvetype = "line";
                }

                return curvetype;
            };

            var getStepState = function (curvetype) {
                if (curvetype === "line")
                    return "center";
                return false;
            };

            //update curve
            var series = [];
            for (var prop in curveGroup) {

                var dataArray = [];
                var propValue = _.property(prop)(curveGroup);

                dataArray = _.map(propValue, function (item, key) {
                    var da = [];
                    da.push(
                        parseInt(item.timeStamp),
                        parseFloat(item.floatValue),
                        item.unit,
                        item.meanings,
                        item.showPrecision
                    );
                    return da;
                });

                var line = {
                    name: prop,
                    type: getCurveType(propValue),
                    data: dataArray,
                    step: getStepState(getCurveType(propValue))
                };
                series.push(line);
            }
            //console.log(angular.toJson(series, true));
            while ($scope.chartData && $scope.chartData.series.length > 0) {
                try {
                    $scope.chartData.series[0].remove(true);
                } catch (e) {
                    //$scope.chartData.series.slice(0,1);
                    $scope.chartData.series = [];
                }
            }

            series.forEach(function (item) {
                try {
                    $scope.chartData.addSeries({
                        name: item.name,
                        type: item.type,
                        step: item.step,
                        data: item.data
                    }, false);
                } catch (e) {
                    var cfg = {};
                    cfg.name = item.name;
                    cfg.type = item.type;
                    cfg.step = item.step;
                    cfg.data = item.data;
                    $scope.chartData.series.push(cfg);
                }
            });
            //$scope.chart.series = series;

            try {
                $scope.chartData.redraw();
            } catch (e) {
            }
        }

        $scope.exportToHtml = function () {
            Exporter.toXls($scope.exportData);
        };

        var validateInput = function () {
            var ids = _.pluck($scope.selectedsigs, "id");

            if (!ids) return false;
            if (ids.length === 0) return false;
            if (!$scope.params.startDate) return false;
            if (!$scope.params.endDate) return false;
            return true;
        };

        $scope.query = function () {

            if (!validateInput()) {
                //"输入参数不正确"
                //alert($scope.languageJson.SignalRecord.ErrorInput);
                balert.show('danger', $scope.languageJson.SignalRecord.ErrorInput, 3000);
                return;
            }

            $scope.loading = true;
            /*if ($scope.tableParams) {
                $scope.tableParams.reload();
            } else {*/
            $scope.tableParams = new NgTableParams({}, {
                getData: function ($defer, params) {

                    var ids = _.pluck($scope.selectedsigs, "id");

                    return hisDataService.getHisData(ids, $scope.params.startDate, $scope.params.endDate).then(function (data) {

                        var retData = params.filter() ?
                            $filter('filter')(data, params.filter()) : data;

                        $scope.loading = false;
                        if (data.length == 0) {
                            //"没有查到数据，更改选择条件再试试？"
                            //alert($scope.languageJson.SignalRecord.ErrorNotData);
                            balert.show('danger', $scope.languageJson.SignalRecord.ErrorNotData, 3000);
                            return;
                        }
                        showCurve(retData);
                        $scope.exportData = getExportList(retData);
                        //console.log($scope.exportData);

                        params.total(retData.length); // recal. page nav controls

                        var ret = retData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                        return ret;
                        //return retData;
                    });
                }
            });
            //}
        };


        $scope.$watch("rangeValues", function (newVal, oldVal) {
            if (newVal === oldVal) return;
            //$scope.params.startDate = getAlreadyTime(newVal);
            $scope.params.startDate = getAlreadyTimeByMonth(12 - newVal);
            $scope.startTime = $scope.params.startDate.getFromFormat('yyyy-mm-dd');
            if (oldVal) $scope.query();
        });

        $("body").click(function(){
            var oldStatus = $(".checkboxLayer").is(':hidden');
            setTimeout(function(){
                var newStatus = $(".checkboxLayer").is(':hidden');
                if(oldStatus == false && newStatus == true)
                    if(validateInput())
                        $scope.query();
            },300);
        });
    }
]);

nurseController.controller('hisAlarmRecordCtrl', ['$scope','$rootScope' , '$modal', '$filter', 'NgTableParams', 'hisAlarmService', 'Exporter','TemplateService','equipmentService',
    function($scope,$rootScope , $modal, $filter, NgTableParams, hisAlarmService, Exporter, TemplateService,equipmentService) {
        $('#datetimepicker').datetimepicker({
            format: 'MM/dd/yyyy hh:mm',
            language: 'en'
        });

        //分页对象定义
        $scope.filter = {
            isQuery : false
        };
        $scope.tableParams = {
            currentPage:1,//当前页面
            itemsPerPage:10,//显示条数
            pagesLength:10,
            totalItems:0,//总条数
            hint:{
                the:$scope.languageJson.Paging.The,
                page:$scope.languageJson.Paging.Page,
                articel:$scope.languageJson.Paging.Articel,
                eachPage:$scope.languageJson.Paging.EachPage,
                total:$scope.languageJson.Paging.Total,
                noData:$scope.languageJson.Paging.NoData
            },
            list:[],//数据集
            perPageOptions:[10, 20, 30, 40, 50],//显示条数组
            onChange:function(newValue,oldValue){
                if(newValue == undefined) return;
                var version = localStorage.getItem("versions");
                if(version != "IView")
                    defaultSelect();
                else
                    iviewSelect();
            }
        };

        function defaultSelect(){
            if($scope.filter.isQuery == false) return;
            $scope.loading = true;
            var param = $scope.filter.content;//筛选条件
            if(param == undefined) param = "";
            var index = ($scope.tableParams.currentPage - 1) * $scope.tableParams.itemsPerPage;//开始下标
            var size = $scope.tableParams.itemsPerPage;//显示条数

            //分页查询
            hisAlarmService.likeLimitHisAlarms(index,size,$scope.params.startDate,$scope.params.endDate,param).then(function(data){
                $scope.tableParams.list = data;
            });
            //数据总条数
            hisAlarmService.likeHisAlarmsTotals($scope.params.startDate,$scope.params.endDate,param).then(function(data){
                $scope.tableParams.totalItems = data;
                $rootScope.$emit('resultTotal',{});
                $scope.loading = false;
            });
        }

        function iviewSelect(){
            $scope.loading = true;
            var index = ($scope.tableParams.currentPage - 1) * $scope.tableParams.itemsPerPage;//开始下标
            var size = $scope.tableParams.itemsPerPage;//显示条数

            //分页查询
            hisAlarmService.newLikeLimitHisAlarms(index,size,$scope.params.startDate,$scope.params.endDate,$scope.SelectEquipments,$scope.levelFilter,$scope.cancelFilter).then(function(data){
                $scope.tableParams.list = data;
            });
            //数据总条数
            hisAlarmService.newLikeHisAlarmsTotals($scope.params.startDate,$scope.params.endDate,$scope.SelectEquipments,$scope.levelFilter,$scope.cancelFilter).then(function(data){
                $scope.tableParams.totalItems = data;
                $rootScope.$emit('resultTotal',{});
                $scope.loading = false;
            });
        }

        (function() {
            $scope.params = {};
            $scope.params.startDate = new Date();
            $scope.params.endDate = new Date();

            $scope.endTime = $scope.params.endDate.getFromFormat('yyyy-mm-dd');

            $scope.Filtrate = {
                Level : "",
                EquipmentName : ""
            };

            /*TemplateService.GetDataItemByEntryId("23").then(function(data){
                $scope.EventSeverity = data;
            });*/

            equipmentService.getAllEquipment().then(function(data){
                $scope.Equipments = data;//EquipmentName

                loadDropdownFunction();
            });


            //iView 触屏控件
            if(localStorage.getItem("versions") == "IView")
                initTimeControl();
        })();

        function initTimeControl(){
            if(sessionStorage.getItem("SelectTimeType") == undefined)
                sessionStorage.setItem("SelectTimeType","Month");
            $scope.SelectTimeType = sessionStorage.getItem("SelectTimeType");

            $scope.SelectTime = {
                startDate : getAlreadyTime(30).getFromFormat('yyyy-mm-dd'),
                endDate : $scope.endTime
            };

            var calendar1 = new datePicker();
            calendar1.init({
                'trigger': '#TimeControl1', /*按钮选择器，用于触发弹出插件*/
                'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':'1970-1-1',/*最小日期*/
                'maxDate':$scope.endTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                    var theSelectData=calendar1.value;
                    $scope.params.startDate = new Date(theSelectData);
                    $scope.params.endDate = new Date($scope.SelectTime.endDate);
                    $scope.tableParams.onChange("",undefined);
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });
            var calendar2 = new datePicker();
            calendar2.init({
                'trigger': '#TimeControl2', /*按钮选择器，用于触发弹出插件*/
                'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':'1970-1-1',/*最小日期*/
                'maxDate':$scope.endTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                    var theSelectData=calendar2.value;
                    $scope.params.startDate = new Date($scope.SelectTime.startDate);
                    $scope.params.endDate = new Date(theSelectData);
                    $scope.tableParams.onChange("",undefined);
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });
        }

        $scope.changeTimeType = function(type){
            sessionStorage.setItem("SelectTimeType",type);
        };

        //加载多选下拉框
        function loadDropdownFunction(){
            $scope.levelFilter = {};
            $scope.levelFilter.levelTip = true;
            $scope.levelFilter.levelCommon = true;
            $scope.levelFilter.levelImportant = true;
            $scope.levelFilter.levelUrgent = true;
            $scope.cancelFilter = {};
            $scope.cancelFilter.unconfirmed = true;
            $scope.cancelFilter.confirmed = true;

            var dataJson = parseSelectList($scope.Equipments,true);//JSON.parse(data);

            $('.dropdown-mul-1').dropdown({
                data:  dataJson,
                limitCount: 2000,
                multipleMode: 'label',
                choice: function(sel, event) {
                    //console.log(sel, this);
                    if(sel.length == dataJson.length)
                        $scope.SelectEquipments = undefined;
                    else
                        $scope.SelectEquipments = sel;
                },
                del : function(){}
            });
        };

        function parseSelectList(data,is){
            var arr = [];
            if(data){
                data.forEach(function(item){
                    var cfg = {
                        "selected" : is,
                        "name":item.EquipmentName,
                        "id":item.EquipmentId
                    };
                    arr.push(cfg);
                });
            }
            return arr;
        }

        function getExportList(data) {

            var resArray = [];

            resArray.push({
                alarmContent : $scope.languageJson.AlarmRecord.Content,
                startTime : $scope.languageJson.AlarmRecord.StartTime,
                endTime : $scope.languageJson.AlarmRecord.EndTime
            });/*"告警内容" / "开始时间" / "结束时间"*/

            data.forEach(function(element, index) {
                var alarm = {};
                alarm.alarmContent = element.alarmContent+" "+element.remark;
                alarm.startTime = element.startTime;
                alarm.endTime = element.endTime;
                resArray.push(alarm);
            });

            return resArray;
        }

        $scope.exportToHtml = function() {
            $scope.loading = true;
            hisAlarmService.getHisAlarms($scope.params.startDate, $scope.params.endDate).then(function(data) {
                $scope.exportAlarms = getExportList(data);
                Exporter.toXls($scope.exportAlarms);
                $scope.loading = false;
            });
        };


        $scope.query = function() {
            $scope.filter.isQuery = true;
            $scope.tableParams.onChange("",undefined);
        };

        $scope.$watch("rangeValues",function(newVal,oldVal){
            if(newVal === oldVal) return;
            //$scope.params.startDate = getAlreadyTime(newVal);
            $scope.params.startDate = getAlreadyTimeByMonth(12 - newVal);
            $scope.startTime = $scope.params.startDate.getFromFormat('yyyy-mm-dd');
            if(localStorage.getItem("versions") == "IView")
                $scope.tableParams.onChange("",undefined);
            else
                $scope.query();
        });

        function getAlreadyTime(day){
            var date = new Date();
            date.setDate(date.getDate() - day);
            return date;
        }

        function getAlreadyTimeByMonth(month){
            var date = new Date();
            date.setMonth(date.getMonth() - month);
            date.setDate(1);
            return date;
        }

        $scope.FiltrateChange = function(level,equipmentName){
            $scope.filter.content = level+" "+equipmentName;
        };

        $scope.checkTest = function(type){
            if(type == 'levelUrgent')
                $scope.levelFilter.levelUrgent = !$scope.levelFilter.levelUrgent;
            else if(type == 'levelImportant')
                $scope.levelFilter.levelImportant = !$scope.levelFilter.levelImportant;
            else if(type == 'levelCommon')
                $scope.levelFilter.levelCommon = !$scope.levelFilter.levelCommon;
            else if(type == 'levelTip')
                $scope.levelFilter.levelTip = !$scope.levelFilter.levelTip;
            else if(type == 'unconfirmed')
                $scope.cancelFilter.unconfirmed = !$scope.cancelFilter.unconfirmed;
            else if(type == 'confirmed')
                $scope.cancelFilter.confirmed = !$scope.cancelFilter.confirmed;

            $scope.tableParams.onChange("",undefined);
        };

        $scope.updateLevelFilter = function() {
            setTimeout(function(){
                $scope.tableParams.onChange("",undefined);
            },300);
        };

        $("body").click(function(){
            var oldStatus = $(".dropdown-main").is(':hidden');
            setTimeout(function(){
                var newStatus = $(".dropdown-main").is(':hidden');
                if(oldStatus == false && newStatus == true)
                    $scope.tableParams.onChange("",undefined);
            },300);
        });
    }
]);

nurseController.controller('hisCardsRecordCtrl', ['$scope', '$rootScope', '$modal', '$filter', 'NgTableParams', 'hisCardsService', 'Exporter',
    function($scope, $rootScope, $modal, $filter, NgTableParams, hisCardsService, Exporter) {
        //分页对象定义
        $scope.filter = {
            isQuery : false
        };
        $scope.tableParams = {
            currentPage:1,//当前页面
            itemsPerPage:10,//显示条数
            pagesLength:10,
            totalItems:0,//总条数
            hint:{
                the:$scope.languageJson.Paging.The,
                page:$scope.languageJson.Paging.Page,
                articel:$scope.languageJson.Paging.Articel,
                eachPage:$scope.languageJson.Paging.EachPage,
                total:$scope.languageJson.Paging.Total,
                noData:$scope.languageJson.Paging.NoData
            },
            list:[],//数据集
            perPageOptions:[10, 20, 30, 40, 50],//显示条数组
            onChange:function(newValue,oldValue){
                if(newValue == undefined) return;
                if($scope.filter.isQuery == false) return;
                $scope.loading = true;
                var param = $scope.filter.DoorNo+"|"+$scope.filter.DoorName+"|"+$scope.filter.CardCode+"|"+
                    $scope.filter.CardName+"|"+$scope.filter.CardUserName+"|"+$scope.filter.ValidName+"|"+$scope.filter.ItemAlias;//筛选条件
                param = param.replace(/undefined/g,"");
                var index = ($scope.tableParams.currentPage - 1) * $scope.tableParams.itemsPerPage;//开始下标
                var size = $scope.tableParams.itemsPerPage;//显示条数
                //分页查询
                hisCardsService.likeHisCards(index,size,$scope.params.startDate,$scope.params.endDate,param).then(function(data){
                    $scope.tableParams.list = data;
                });
                //数据总条数
                hisCardsService.likeHisCardTotals($scope.params.startDate,$scope.params.endDate,param).then(function(data){
                    $scope.tableParams.totalItems = data;
                    $rootScope.$emit('resultTotal',{});
                    $scope.loading = false;
                });
            }
        };

        (function() {
            $scope.params = {};
            $scope.params.startDate = new Date();
            $scope.params.endDate = new Date();
        })();
        //排序
        $scope.sortingOrder = undefined;
        $scope.reverse = false;
        $scope.SortBy = function(newSortingOrder){
            if ($scope.sortingOrder == newSortingOrder){
                $scope.reverse = !$scope.reverse;
            }
            $scope.sortingOrder = newSortingOrder;
            // 遍历
            $('th i').each(function(){
                // 删除其他箭头样式
                $(this).removeClass("fa-chevron-down");
                $(this).removeClass("fa-chevron-up");
            });
            if ($scope.reverse){
                $('th.'+newSortingOrder+' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            }else{
                $('th.'+newSortingOrder+' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            }

        };
        function getExportList(data) {

            var resArray = [];
            var table = $scope.languageJson.CardsRecord.Table;
            resArray.push({
                DoorNo : table.DoorNo,
                DoorName : table.DoorName,
                CardCode:table.CardCode,
                CardName:table.CardName,
                CardUserName:table.Cardholder,
                RecordTime:table.SwipeCardTime,
                ValidName:table.SwipeCardSign
            });/*"门号" / "门名称" / "卡号" / "卡名称" / "持卡人" / "刷卡时间" / "刷卡标志"*/

            data.forEach(function(element, index) {
                var Cards = {};
                Cards.DoorNo = element.DoorNo;
                Cards.DoorName = element.DoorName;
                Cards.CardCode = element.CardCode;
                Cards.CardName=element.CardName;
                Cards.CardUserName=element.CardUserName;
                Cards.RecordTime=element.RecordTime;
                if($scope.languageJson.Language == 'Chinese')
                    Cards.ValidName=element.ValidName;
                else
                    Cards.ValidName=element.ItemAlias;
                resArray.push(Cards);
            });

            return resArray;
        }

        $scope.exportToHtml = function() {
            hisCardsService.getHisCards($scope.params.startDate, $scope.params.endDate).then(function(data) {
                Exporter.toXls(getExportList(data));
            });
        };

        $scope.query = function() {
            $scope.filter.isQuery = true;
            $scope.tableParams.onChange("",undefined);
        };
    }
]);

nurseController.controller('videoCameraCtrl',['$scope','$element','$modal','balert','CameraService',
    function($scope,$element,$modal,balert,CameraService){
        //初始化变量
        (function(){
            $scope.video = {};
            $scope.video.eName = "";
            $scope.video.videoType = "1";
            $scope.video.ipAddress = "";
            $scope.video.ePort = "80";
            $scope.video.eChanNum = "1";
            $scope.video.userName = "";
            $scope.video.userPwd = "";
            $scope.video.Number = "1";
            $scope.video.IpOrNvr = true;

            $scope.camera = {};
            $scope.camera.cVideoName = "";
            $scope.camera.cName = "Camera";
            $scope.camera.cChanNum = "1";
        })();
        var init = function (){
            CameraService.loadVideoEquipment().then(function(data){
                $scope.videoCamera = "";
                if(data === "]") return;
                $scope.videoCamera = eval(data);
                if(window.ActiveXObject || "ActiveXObject" in window){
                    $scope.videoCamera.filter(function(data){
                        if(data.VideoType==1){
                            data.faStyle = "fa-video-camera";
                            data.show = false;
                        }else{
                            data.faStyle = "fa-inbox";
                            data.show = true;
                        }
                    });
                }else {
                    $scope.videoCamera.forEach(function (data) {
                        if (data.VideoType == 1) {
                            data.faStyle = "fa-video-camera";
                            data.show = false;
                        } else {
                            data.faStyle = "fa-inbox";
                            data.show = true;
                        }
                    });
                }
            });
        };
        $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
        // show info
        $scope.videoClick = function(data){
            var sysStyle = localStorage.getItem("systemStyle");
            if(sysStyle == "White"){
                $(".videoDiv").css("color","#464952");
                $(".cameraDiv").css("color","#464952");
            }else{
                $(".videoDiv").css("color","#fff");
                $(".cameraDiv").css("color","#fff");
            }

            $("#video"+ data.EquipmentId).css("color","#247AFA");

            $("#VideoCamera-video").show();
            $("#VideoCamera-camera").hide();
            $scope.eId = data.EquipmentId;
            $scope.eName = data.EquipmentName;
            $scope.videoType = data.VideoType;
            $scope.ipAddress = data.IpAddress;
            $scope.ePort = data.Port;
            $scope.eChanNum = data.ChanNum;
            $scope.userName = data.UserName;
            $scope.userPwd = data.UserPwd;
            if(data.VideoType == 1 ) $scope.IpOrNvr = true;
            else $scope.IpOrNvr = false;
            $scope.Number = data.Cameras.length;//个数……
        };

        $scope.cameraClick = function(data){
            var sysStyle = localStorage.getItem("systemStyle");
            if(sysStyle == "White"){
                $(".videoDiv").css("color","#464952");
                $(".cameraDiv").css("color","#464952");
            }else {
                $(".videoDiv").css("color", "#fff");
                $(".cameraDiv").css("color", "#fff");
            }
            $("#camera"+ data.CameraId).css("color","#247AFA");

            $("#VideoCamera-video").hide();
            $("#VideoCamera-camera").show();
            $scope.cId = data.CameraId;
            $scope.cName = data.CameraName;
            $scope.cChanNum = data.ChanNum;

            var video = $scope.videoCamera.forEach(function(item){
                return item.Cameras.forEach(function(items){
                    if(items.CameraId == data.CameraId){
                        return item;
                    }
                });
            });
            /*if(video.VideoType == 1) $scope.updataHide = true;
            else $scope.updataHide = false;*/
        };

        var addVideoDialog = $modal({
            scope:$scope,
            templateUrl:'partials/addVideo.html',
            show:false
        });
        var addCameraDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/addCamera.html',
            show: false
        });
        // init data
        $scope.addVideoBtn = function(){
            $scope.video.videoType = "1";
            $scope.video.ipAddress = "192.168.2.64";
            $scope.video.ePort = "80";
            $scope.video.eChanNum = "1";
            $scope.video.userName = "admin";
            $scope.video.userPwd = "gt123456";
            $scope.video.Number = "1";
            $scope.video.IpOrNvr = false;
            $scope.video.openType = 'video';
            getPartNum($scope.video.videoType);

            CameraService.saveVideoEquipment($scope.video.eName,$scope.video.videoType,$scope.video.ipAddress,$scope.video.ePort,
                    $scope.video.eChanNum,$scope.video.userName,$scope.video.userPwd,$scope.video.Number).then(function(data){
                $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                if(data!="OK"){
                    balert.show('danger',data,3000);//danger || success
                }
            });
        };
        function getPartNum(videoType){
            var num = 1;
            var videos = $scope.videoCamera;
            if(videos != undefined){
                for(var i=0;i<videos.length;i++) {
                    num ++;
                }
            }

            var name = $scope.languageJson.Video.Camera;/*"IP摄像头"*/
            if(videoType == 2) name = $scope.languageJson.Video.DVR;/*"硬盘录像机"*/
            $scope.video.eName = name+num+"#";
        }
        $scope.addCameraBtn = function(){
            $scope.camera.cVideoName = "";
            $scope.camera.cChanNum = "1";
            $scope.camera.cName = "";
            addCameraDialog.$promise.then(addCameraDialog.show);
        };
        function getNewPart(eqId){
            var  num=1;
            var cameras=$scope.videoCamera;
            if(cameras == undefined) return;
            for(var i=0;i<cameras.length;i++) {
                if(cameras[i].EquipmentId == eqId){
                    num = cameras[i].Cameras.length + 1;
                }
            }
            $scope.camera.cName = "Camera"+num;
            $scope.camera.cChanNum = num;
            return num;
        }
        $scope.cameraChange = function(eqId){
            getNewPart(eqId);
        };
        $scope.changeVideoTypeByVideoName = function(videoType){
            getPartNum(videoType);
            if(videoType == 1){
                $scope.video.IpOrNvr = false;
                $scope.video.Number = 1;
            } else {
                $scope.video.IpOrNvr = true;
                $scope.video.Number = 2;
            }
        };
        $scope.changeVideoTypeByEName = function(videoType){
            var reg = /\d+/g;
            var str = $scope.eName;
            var num = str.match(reg);
            var name = $scope.languageJson.Video.Camera;/*"IP摄像头"*/
            if(videoType == 2) name = $scope.languageJson.Video.DVR;/*"硬盘录像机"*/
            $scope.eName = name+num+"#";
            if(videoType == 1){
                $scope.IpOrNvr = true;
                $scope.Number = 1;
            } else {
                var length = "";
                $scope.videoCamera.forEach(function(item){
                    if(item.EquipmentId == $scope.eId)
                        length = item.Cameras.length;
                });
                $scope.IpOrNvr = false;
                $scope.Number = length;
            }
        };


        // add data
        $scope.saveAisleTable = function(){
            if($scope.video.eName == "" || $scope.video.eName == undefined){
                balert.show('danger',$scope.languageJson.Video.Device,3000);/*'请输入视频设备名称！'*/
                return;
            }
            if($scope.video.videoType == "" || $scope.video.videoType == undefined){
                balert.show('danger',$scope.languageJson.Video.DeviceType,3000);/*'请输入视频设备类型'*/
                return;
            }
            if($scope.video.ipAddress == "" || $scope.video.ipAddress == undefined){
                balert.show('danger',$scope.languageJson.Video.DeviceAddress,3000);/*'请输入视频设备地址！'*/
                return;
            }
            if($scope.video.ePort == "" || $scope.video.ePort == undefined){
                balert.show('danger',$scope.languageJson.Video.DeviceAddress,3000);/*'请输入视频设备端口号！'*/
                return;
            }
            if($scope.video.eChanNum == "" || $scope.video.eChanNum == undefined){
                balert.show('danger',$scope.languageJson.Video.Chann,3000);/*'请输入视频设备频道号！'*/
                return;
            }
            if($scope.video.userName == "" || $scope.video.userName == undefined){
                balert.show('danger',$scope.languageJson.Video.UserNames,3000);/*'请输入用户名！'*/
                return;
            }
            if($scope.video.userPwd == "" || $scope.video.userPwd == undefined){
                balert.show('danger',$scope.languageJson.Video.Passwords,3000);/*'请输入密码！'*/
                return;
            }
            if($scope.video.Number == "" || $scope.video.Number == undefined){
                balert.show('danger',$scope.languageJson.Video.Monitoring,3000);/*'请输入监控点个数！'*/
                return;
            }
            CameraService.saveVideoEquipment($scope.video.eName,$scope.video.videoType,$scope.video.ipAddress,$scope.video.ePort,
                $scope.video.eChanNum,$scope.video.userName,$scope.video.userPwd,$scope.video.Number).then(function(data){
                    $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                    if(data!="OK"){
                        balert.show('danger',data,3000);//danger || success
                    }
            });
            addVideoDialog.hide();
        };
        $scope.addCameraClick = function(){
            if($scope.camera.cVideoName =="" || $scope.camera.cVideoName == undefined){
                balert.show('danger',$scope.languageJson.Video.TheVideo,3000);/*'请选择视频的设备！'*/
                return;
            }
            if($scope.camera.cName =="" || $scope.camera.cName == undefined){
                balert.show('danger',$scope.languageJson.Video.MonitoringPoint,3000);/*'请输入监控点名称！'*/
                return;
            }
            if($scope.camera.cChanNum =="" || $scope.camera.cChanNum == undefined){
                balert.show('danger',$scope.languageJson.Video.Chel,3000);/*'请输入监控点通道号！'*/
                return;
            }
            CameraService.saveCamera($scope.camera.cVideoName,$scope.camera.cName,$scope.camera.cChanNum).then(function(data){
                $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                if(data!="OK")
                    balert.show('danger',data,3000);//danger || success
            });
            addCameraDialog.hide();
        };
        //update data
        $scope.updVideoClick = function(){
            if($scope.eId == "" || $scope.eId == undefined){
                balert.show('danger',$scope.languageJson.Video.OnLeft,3000);/*'请在左边的设备列表中选择修改的设备！'*/
                return;
            }
            if($scope.eName == "" || $scope.eName == undefined){
                balert.show('danger',$scope.languageJson.Video.DeviceName,3000);/*'请输入视频设备名称！'*/
                return;
            }
            if($scope.videoType == "" || $scope.videoType == undefined){
                balert.show('danger',$scope.languageJson.Video.DeviceTypes,3000);/*'请选择视频设备类型！'*/
                return;
            }
            if($scope.ipAddress == "" || $scope.ipAddress == undefined){
                balert.show('danger',$scope.languageJson.Video.DeviceAdd,3000);/*'请输入视频设备地址！'*/
                return;
            }
            if($scope.ePort == "" || $scope.ePort == undefined){
                balert.show('danger',$scope.languageJson.Video.PortNum,3000);/*'请输入视频设备端口号！'*/
                return;
            }
            if($scope.eChanNum == "" || $scope.eChanNum == undefined){
                balert.show('danger',$scope.languageJson.Video.Chann,3000);/*'请输入视频设备频道号！'*/
                return;
            }
            if($scope.userName == "" || $scope.userName == undefined){
                balert.show('danger',$scope.languageJson.Video.Channels,3000);/*'请输入用户名！'*/
                return;
            }
            if($scope.userPwd == "" || $scope.userPwd == undefined){
                balert.show('danger',$scope.languageJson.Video.Yourpassword,3000);/*'请输入密码！'*/
                return;
            }
            if($scope.Number == "" || $scope.Number == undefined){
                balert.show('danger',$scope.languageJson.Video.NumberOf,3000);/*'请输入监控点个数！'*/
                return;
            }
            CameraService.updateVideoEquipment($scope.eId,$scope.eName,$scope.videoType,$scope.ipAddress,
                    $scope.ePort,$scope.eChanNum,$scope.userName,$scope.userPwd).then(function(data){
                    var cameraArr
                    $scope.videoCamera.forEach(function(item){
                        if(item.EquipmentId == $scope.eId)
                            cameraArr = item.Cameras;
                    });
                    var result = (cameraArr.length-$scope.Number);
                    if(result>0){//删除监控点
                        var index = cameraArr.length-1;
                        for(var i=0;i<result;i++){
                            CameraService.deleteCamera(cameraArr[index].CameraId).then(function(data){});
                            index --;
                        }
                    }else if(result<0){//新增监控点
                        for(var i=cameraArr.length;i<$scope.Number;i++){
                            var name = "Camera"+(i+1);
                            var charNum = i+1;
                            CameraService.saveCamera($scope.eId,name,charNum).then(function(data){});
                        }
                    }
                    if(data=="OK"){
                        balert.show('success',$scope.languageJson.Video.Successfully,3000);//danger || success/*'修改成功！'*/
                        $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                    }
                    else
                        balert.show('danger',data,3000);//danger || success
            });
        };
        $scope.updCameraClick = function(){
            if($scope.cId =="" || $scope.cId == undefined){
                balert.show('danger',$scope.languageJson.Video.Modifiedce,3000);/*'请在左边的设备列表中选择修改的设备！'*/
                return;
            }
            if($scope.cName =="" || $scope.cName == undefined){
                balert.show('danger',$scope.languageJson.Video.Ofthe,3000);/*'请输入监控点名称！'*/
                return;
            }
            if($scope.cChanNum =="" || $scope.cChanNum == undefined){
                balert.show('danger',$scope.languageJson.Video.Enterthe,3000);/*'请输入监控点通道号！'*/
                return;
            }
            CameraService.updateCamera($scope.cId,$scope.cName,$scope.cChanNum).then(function(data){
                if(data=="OK"){
                    balert.show('success',$scope.languageJson.Video.Successfully,3000);//danger || success/*'修改成功！'*/
                    $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                }
                else
                    balert.show('danger',data,3000);//danger || success
            });
        };
        //delete data
        $scope.delVideoClick = function(){
            if($scope.eId == "" || $scope.eId == undefined){
                balert.show('danger',$scope.languageJson.Video.Deleted,3000);/*'请在左边的设备列表中选择删除的设备！'*/
                return;
            }
            CameraService.deleteVideoEquipment($scope.eId).then(function(data){
                if(data=="OK"){
                    balert.show('success',$scope.languageJson.Video.Eleted,3000);//danger || success/*'删除成功！'*/
                    $scope.eId = "";
                    $scope.eName = "";
                    $scope.videoType = "";
                    $scope.ipAddress = "";
                    $scope.ePort = "";
                    $scope.eChanNum = "";
                    $scope.userName = "";
                    $scope.userPwd = "";
                    $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                }
                else
                    balert.show('danger',data,3000);//danger || success
            });
        };
        $scope.delCameraClick = function(){
            if($scope.cId =="" || $scope.cId == undefined){
                balert.show('danger',$scope.languageJson.Video.Deleted,3000);//danger || success/*'请在左边的设备列表中选择删除的设备！'*/
                return;
            }
            CameraService.deleteCamera($scope.cId).then(function(data){
                if(data=="OK"){
                    balert.show('success',$scope.languageJson.Video.Eleted,3000);//danger || success/*'删除成功！'*/
                    $scope.cId = "";
                    $scope.cName = "";
                    $scope.cChanNum = "";
                    $scope.$watch('videoCamera + videoCamera.Cameras', init,true);
                }
                else
                    balert.show('danger',data,3000);//danger || success
            });
        }
    }]
);

nurseController.controller('videoCtrl', ['$scope','$rootScope','$interval','balert','CameraService',
    function($scope,$rootScope,$interval,balert,CameraService){
        CameraService.getAllVideoEquipment().then(function(data){
            $scope.cameratree = eval(data);
        });
        //$scope.cameratree = [{name:'视频1',ip:'192.168.2.144',username:'admin',pwd:'gt123456',port:'80',channelno:'1'}];
         init();
        function init() {
            initStyleImages();


             var is = JudgeBrowser();
            if(is == false) return;
             var width=$("#cameraPlugin").width();
             var height=$("#cameraPlugin").height()-35;
              $("#cameraPlugin").height(height);
             // 检查插件是否已经安装过
             if (-1==WebVideoCtrl.I_CheckPluginInstall()) {
                 $("#cameraPlugin").html(" <a href='files/WebComponents.exe'  target='_black'> {{languageJson.Videos.Title}}</a>");/*您还未安装过插件，单击该连接下载安装！*/
                 return;
             }
             WebVideoCtrl.I_InitPlugin(width+32, height, {
                 iWndowType: 2,
                 cbSelWnd: function (xmlDoc) {
                     g_iWndIndex = $(xmlDoc).find("SelectWnd").eq(0).text();
                 }
             });
             WebVideoCtrl.I_InsertOBJECTPlugin("cameraPlugin");
         }

         function initStyleImages(){
             var sysStyle = localStorage.getItem("systemStyle");
             if(sysStyle == "White"){
                 $(".ptz_left_up").attr("src","img/video/ptz_left_up_White.png");
                 $(".ptz_up").attr("src","img/video/ptz_up_White.png");
                 $(".ptz_right_up").attr("src","img/video/ptz_right_up_White.png");
                 $(".ptz_left").attr("src","img/video/ptz_left_White.png");
                 $(".ptz_auto").attr("src","img/video/ptz_auto_White.png");
                 $(".ptz_right").attr("src","img/video/ptz_right_White.png");
                 $(".ptz_left_down").attr("src","img/video/ptz_left_down_White.png");
                 $(".ptz_down").attr("src","img/video/ptz_down_White.png");
                 $(".ptz_right_down").attr("src","img/video/ptz_right_down_White.png");
             }
         }

        $scope.loginplayview = function(video,camera) {
            $(".camera_color").css("color","#fff");
            if(video.videoType == '2'){
                $("#camera"+ camera.cameraId).css("color","red");
            }else{
                $("#video"+ camera.equipmentId).css("color","red");
            }
            balert.show("success",$scope.languageJson.Videos.Loading);/*加载中*/
            WebVideoCtrl.I_Logout(video.ipAddress);
            try{
                var szDeviceIdentify = video.ipAddress + "_" + video.port;

                video.iChannelID = parseInt(camera.chanNum);
                var iRet = WebVideoCtrl.I_Login(video.ipAddress, 1, video.port, video.userName, video.userPwd, {
                    success: function (xmlDoc) {
                        playview(video);
                        balert.close(this);
                    },
                    error: function (status, xmlDoc) {
                        balert.show('danger',szDeviceIdentify + $scope.languageJson.Videos.Failed,3000);/*" 登录失败！"*/
                    }
                });

                if (-1 == iRet) {
                    balert.show('danger',szDeviceIdentify + $scope.languageJson.Videos.Already,3000);/*" 已登录过！"*/
                }
            }catch (e){
                balert.show('danger', $scope.languageJson.Videos.Does,3000);/* '不支持当前浏览器'*/
            }
        };

        // start view
        function playview(video) {
            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
                szDeviceIdentify = video.ipAddress+"_"+video.port,
                iRtspPort = 554,
                iChannelID = video.iChannelID,
                bZeroChannel = false;

            var iStreamType = 1;//码流；1为主码流；2为子码流；3为第三码流；4为转码流

            if (null == szDeviceIdentify) {
                return;
            }

            var startRealPlay = function () {
                WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
                    iRtspPort: iRtspPort,
                    iStreamType: iStreamType,
                    iChannelID: iChannelID,
                    bZeroChannel: bZeroChannel,
                    success: function () {

                    },
                    error: function (status, xmlDoc) {
                        if (403 === status) {
                            balert.show('danger', $scope.languageJson.Videos.Websocket,3000);/*"设备不支持Websocket取流！"*/
                        } else {
                            balert.show('danger', $scope.languageJson.Videos.Start,3000);/*"开始预览失败！"*/
                        }
                    }
                });
            };

            if (oWndInfo != null) {// 已经在播放了，先停止
                WebVideoCtrl.I_Stop({
                    success: function () {
                        startRealPlay();
                    }
                });
            } else {
                startRealPlay();
            }
        }

        // window split
        $scope.changeWndNum=function(iType) {
                if (-1==WebVideoCtrl.I_CheckPluginInstall()) return;
                iType = parseInt(iType, 10);
                WebVideoCtrl.I_ChangeWndNum(iType);

            };

        var g_iWndIndex = 0;
        var g_bPTZAuto = false;
        $scope.mouseDownPTZControl=function(iPTZIndex) {
            if(-1==WebVideoCtrl.I_CheckPluginInstall()) return;
            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
                bZeroChannel = true,
                iPTZSpeed =1,
                bStop = false;

            if (bZeroChannel)  return;// 零通道不支持云台
            if (oWndInfo != null) {
                if (9 == iPTZIndex && g_bPTZAuto) {
                    iPTZSpeed = 0;// 自动开启后，速度置为0可以关闭自动
                    bStop = true;
                }
                else {
                    g_bPTZAuto = false;
                    bStop = false;
                }
                WebVideoCtrl.I_PTZControl(iPTZIndex, bStop, {
                    iPTZSpeed: iPTZSpeed,
                    success: function (xmlDoc) {
                        if (9 == iPTZIndex) {
                            g_bPTZAuto = !g_bPTZAuto;
                        }
                    },
                    error: function () {}
                });
            }
        };

        // 方向PTZ停止
        $scope.mouseUpPTZControl=function() {
            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
            if (oWndInfo != null) {
                WebVideoCtrl.I_PTZControl(1, true, {
                    success: function (xmlDoc) {},
                    error: function () {}
                });
                }
            };

        $scope.fullscreen=function(){
            if(-1==WebVideoCtrl.I_CheckPluginInstall()) return;
            WebVideoCtrl.I_FullScreen(true)
         };

        $scope.capturePic=function() {
            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
            if (oWndInfo != null) {
                   var szPicName = oWndInfo.szIP + "_" + new Date().getTime(),
                    iRet = WebVideoCtrl.I_CapturePic(szPicName);
                if (0 == iRet) {
                   var cfg=WebVideoCtrl.I_GetLocalCfg();
                    var path= $(cfg).find("CapturePath").eq(0).text()+"\\"+szPicName;
                    balert.show('success', $scope.languageJson.Videos.Capture +path+ $scope.languageJson.Videos.Under ,10000);/* '抓图成功！文件存储在：'+path+".bmp下"*/
                } else {
                    balert.show('danger', $scope.languageJson.Videos.Fetching,3500);/*'抓图失败！'*/
                }

            }
        };

        $scope.stopplay=function(){
            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
                szInfo = "";
            if (oWndInfo != null) {
                var iRet = WebVideoCtrl.I_Stop();
            }
        };

        $scope.zoom3D=function() {

            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
            if (oWndInfo != null) {
                var iRet = WebVideoCtrl.I_Enable3DZoom();
            }
        };



            // 开始回放
        $scope.playback = function(ip,channelno,starttime,endtime) {
                var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
                    iRet = -1;
                if ("" == ip) return;
                // 已经在播放了，先停止
                if (oWndInfo != null) WebVideoCtrl.I_Stop();

                iRet = WebVideoCtrl.I_StartPlayback(ip, {
                    iChannelID: channelno,
                    szStartTime: starttime,
                    szEndTime: endtime
                });
                if (iRet != 0) balert.show('danger',$scope.languageJson.Videos.Playback,2500);/*'回放失败！'*/
            };


        $scope.stopplayback = function() {
            var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
            if (oWndInfo != null) {
                var iRet = WebVideoCtrl.I_Stop();
                if (iRet != 0) balert.show('success', $scope.languageJson.Videos.Stop,2500);/*'停止回放成功！'*/
            }
        };


        function JudgeBrowser(){
            var NV = {};
            var UA =  navigator.userAgent.toLowerCase();
            NV.name = (UA.indexOf("chrome")>0)?'chrome':'unkonw';
            NV.version = (NV.name=='chrome')?UA.match(/chrome\/([\d.]+)/)[1]:'0';
            var isIe = "ActiveXObject" in window;
            if(isIe) return true;
            if(NV.name === 'chrome' && parseInt(NV.version) <= 42) return true;//64bit chrome v34
            balert.show('danger', $scope.languageJson.Videos.Browsing ,3000);/*"视频浏览不支持当前浏览器或版本，请使用IE或者Chrome v42以下的浏览器！"*/
            return false;
        }

    }
]);




nurseController.controller('userCtrl', ['$scope', '$rootScope', '$modal', 'userService','uploadService','balert','deviceService',
    function($scope, $rootScope, $modal, userService,uploadService,balert,deviceService) {

        var changePasswordDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/changePassword.html',
            show: false
        });

        var changeHomeDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/changeHome.html',
            show: false
        });

        var permissionManageDlg = undefined;
        var accountInfoDlg = undefined;

        //region 界面设置
        $scope.changeHome = function(){
            $scope.file = undefined;
            $scope.file2 = undefined;
            changeHomeDialog.$promise.then(changeHomeDialog.show);
            $scope.user.title = localStorage.getItem("userTitle");

            userService.getQRCode().then(function(data){
                var split = data.split("|");
                $scope.QRCode = {
                    title : split[0],
                    image : split.length >= 2 ? split[1] : ""
                };
            });
        };
        $scope.$on("fileSelected",function(event, msg) {
            $scope.file = msg;
        });
        $scope.$on("fileSelected2",function(event, msg) {
            $scope.file2 = msg;
        });

        $scope.updateHome = function(){
            if($scope.file && $scope.file.size > 512000){
                //图片大小不能大于500k
                balert.show("danger",$scope.languageJson.Header.User.Interface.LogoHint,3000);
                return;
            }
            if($scope.user.title == ""){
                //标题不能为空
                balert.show("danger",$scope.languageJson.Header.User.Interface.TitleError,3000);
                return;
            }

            userService.updateHome("userTitle",$scope.user.title).then(function(data){
                if(data == "OK"){
                    if($scope.file){
                        uploadService.uploadFile($scope.file).then(function(data) {
                            userService.updateHome("userLogo",data).then(function(resData){
                                if (resData == "OK") {
                                    getTitleAndLogo();
                                    //设置成功
                                    balert.show("success",$scope.languageJson.Header.User.Interface.Succeed,3000);
                                    changeHomeDialog.hide();
                                }else
                                    balert.show("danger",$scope.languageJson.Header.User.Interface.Error,3000);//设置失败
                            });
                        });
                    }else{
                        getTitleAndLogo();
                        //设置成功
                        balert.show("success",$scope.languageJson.Header.User.Interface.Succeed,3000);
                        changeHomeDialog.hide();
                    }
                }else
                    balert.show("danger",$scope.languageJson.Header.User.Interface.Error,3000);//设置失败
            });


            if($scope.file2 && $scope.file2.size > 512000){
                //图片大小不能大于500k
                balert.show("danger",$scope.languageJson.Header.User.Interface.LogoHint,3000);
                return;
            }
            if($scope.file2){
                uploadService.uploadFile($scope.file2).then(function(data) {
                    userService.setQRCode($scope.QRCode.title,data).then(function(data){
                        var d = data;
                    });
                });
            }else{
                userService.setQRCode($scope.QRCode.title,$scope.QRCode.image).then(function(data){
                    var d = data;
                });
            }
        };

        function getTitleAndLogo(){
            userService.getTitleAndLogo().then(function(datas){
                var userTitle = datas.split("|")[0];
                var userLogo = datas.split("|")[1];
                localStorage.setItem("userTitle",userTitle);
                localStorage.setItem("userLogo",userLogo);
                $(document).attr("title",userTitle);
                $(".logotitle").text(userTitle);
                $(".logo").attr("src",userLogo);
            });
        };

        $scope.ResetQRCode = function(){
            $scope.QRCode = {
                title : '',
                image : ''
            };
        };

        (function() {
            $scope.user = {};

            //登录记录
            function loginRecord(){
                var loginDate = localStorage.getItem("LastLoginDate");
                if(loginDate == "null"){
                    $scope.user = {
                        userName : localStorage.getItem("username")
                    };
                    changePasswordDialog.$promise.then(changePasswordDialog.show);
                    localStorage.removeItem("LastLoginDate");
                }else if(loginDate != null){
                    var loginIP = localStorage.getItem("LastLoginIP");
                    if(loginIP != null && loginIP != "null"){
                        var split = [loginDate,loginIP];
                        balert.loginShow('success',split,10000);
                    }
                    localStorage.removeItem("LastLoginDate");
                }
            }
            loginRecord();
        })();


        $scope.changePassword = function() {
            changePasswordDialog.$promise.then(changePasswordDialog.show);

            $scope.user.userName = localStorage.getItem("username");
            $scope.user.oldPwd = undefined;
            $scope.user.newPwd = undefined;
            $scope.user.newPwd2 = undefined;
        };

        $scope.updatePassword = function() {

            $scope.user.info = undefined;

            if ($scope.user.oldPwd === undefined ||
                $scope.user.newPwd === undefined ||
                $scope.user.newPwd2 === undefined) {
                balert.show("danger", $scope.languageJson.Header.User.Password.CurrPweError, 3000);//请输入完整
                return;
            }

            //输入验证
            var info =  inputValidation($scope.user.newPwd);
            if(info != undefined){
                var prompt = $scope.languageJson.Login.Prompt;
                if(info == "OutRange")
                    balert.show("danger", prompt.OutRange, 3000);
                else if(info == "SameCharacter")
                    balert.show("danger", prompt.SameCharacter, 3000);
                else if(info == "AllNumbers")
                    balert.show("danger", prompt.AllNumbers, 3000);
                else if(info == "ContinuousCharacter")
                    balert.show("danger", prompt.ContinuousCharacter, 3000);
                return;
            }

            if ($scope.user.newPwd !== $scope.user.newPwd2) {
                balert.show("danger", $scope.languageJson.Header.User.Password.AgninNewPwdError, 3000);//新密码两次输入不匹配，请重新输入
                return;
            }

            userService.updatePassword($scope.user.userName ,$scope.user.oldPwd, $scope.user.newPwd).then(function(data) {
                if (data == "OK") {
                    balert.show("success",$scope.languageJson.Header.User.Password.Succeed,3000);//"密码修改成功"
                    changePasswordDialog.hide();
                } else {
                    var prompt = $scope.languageJson.Login.Prompt;
                    if (data == "Parameter Error")
                        balert.show("danger", prompt.ParameterError, 3000);//"参数错误！"
                    else if (data == "Current Password Incorrect")
                        balert.show("danger", prompt.PasswordError, 3000);//"当前密码不正确！"
                    else if (data == "DataBase Connection Failed")
                        balert.show("danger", prompt.DataBaseFailed, 3000);//"数据库连接失败！"
                    else if (data == "Modify Failed")
                        balert.show("danger", prompt.ModifyFailed, 3000);//"修改异常！"
                }
            });

            $scope.user = {};
        };

        function inputValidation(password){
            var info = undefined;

            if(password.length < 6 || password.length > 16){
                info = "OutRange";//密码长度6-16位数
            }
            var re = /(\w)*(\w)\2{2}(\w)*/g;
            if(re.test(password)){
                info = "SameCharacter";//不能连续三个相同的字符
            }
            re = /[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*/g;
            if(!re.test(password)){
                info = "AllNumbers";//不能全是数字
            }
            if(!LxStr(password)){
                info = "ContinuousCharacter";//不能连续的数字
            }
            return info;
        }
        //验证 是否是连续字符
        function LxStr(str){
            var arr = str.split('');
            var flag = true;
            for (var i = 1; i < arr.length-1; i++) {
                //如果不是数字则跳过当前循环，继续下一轮循环
                if(isNaN(arr[i-1])){
                    continue;
                }
                var firstIndex = arr[i-1];
                var secondIndex = arr[i];
                var thirdIndex = arr[i+1];
                thirdIndex - secondIndex == 1;
                secondIndex - firstIndex==1;
                if((thirdIndex - secondIndex == 1)&&(secondIndex - firstIndex==1)){
                    flag =  false;
                }

            }
            return flag;
        }

        $scope.exit = function() {
            $('.page-load').show();
            $('#wrapper').hide();
            
            var token = localStorage.getItem("token");
            userService.logout(token).then(function(data) {
                if (data === "OK") {
                    $(window.location).attr("href", "index.html");
                }
            });
        };
        var showAboutDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/showAbout.html',
            show: false
        });
        $scope.showAbout = function(){
            showAboutDialog.$promise.then(showAboutDialog.show);
            setTimeout(function(){
                $("#aboutTitle").text(localStorage.getItem("userTitle"));
                $("#aboutLogo").attr("src",localStorage.getItem("userLogo"));
            },1);

            $scope.QRCode = {image : ''};
            userService.getQRCode().then(function(data){
                var split = data.split("|");
                $scope.QRCode = {
                    title : split[0],
                    image : split.length >= 2 ? split[1] : ""
                };
            });
        };
        //endregion

        //region 头功能页面跳转
        $scope.topFunClk = function(type){
            var href = "";
            $scope.configUrl = undefined;
            if(type == "home") {
                getConfigurePath(0);

                $rootScope.PathType = type;
                $scope.PathType = type;
                localStorage.setItem("pathType",type);
                return;
            }
            if(type == "device") {
                getConfigurePath(1);

                $rootScope.PathType = type;
                $scope.PathType = type;
                localStorage.setItem("pathType",type);
                return;
            }
            if(type == "alarm")
                href = "#/alarm/0";
            if(type == "alarmrecord")
                href = "#/kpi/5";//"#/alarmrecord";
            if(type == "pki")
                href = "#/kpi/5";
            if(type == "setting")
                href = "#/setting";

            window.location.href = href;

            $rootScope.PathType = type;
            $scope.PathType = type;
            localStorage.setItem("pathType",type);
        };
        //根据类型获取第一个和第二个组态页面连接
        function getConfigurePath(index){
            deviceService.GetShowConfigureMold().then(function(data){
                if(data){
                    for(var i = 0;i < data.length; i ++){
                        if(i == index){
                            $scope.configUrl = '#/device/9999/diagram';
                            if(data[i].configUrl == undefined || data[i].configUrl == ''){
                                if(data[i].parts.length > 0)
                                    window.location.href = data[i].parts[0].configUrl;
                                else
                                    window.location.href = '#/device/9999/diagram';
                            }else
                                window.location.href = data[i].configUrl;
                        }
                    }
                }
            });
        }
        //默认选中
        function defaultSelect(){
            $scope.PathType = localStorage.getItem("pathType");
        }
        defaultSelect();
        //endregion

        //region *************************** 权限管理 Start ********************************/
        function parsePermission(data){
            var cfg = [];
            var nick = $scope.languageJson.Account.Nickname;
            data.forEach(function(item){
                if(item.userId > -2){
                    if(item.isAdmin == "true" || item.isAdmin == true)
                        item.permission = nick.Administrator;/*"系统管理员"*/
                    else
                        item.permission = nick.Operator;/*"操作员"*/
                    cfg.push(item);
                }
            });
            return cfg;
        };

        function initPerm(){
            userService.getAllAccount().then(function(data){
                $scope.Accounts = parsePermission(data);
            });
        };

        $scope.permissionManage = function(){
            initPerm();
            permissionManageDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/permissionManage.html',
                show: false
            });
            permissionManageDlg.$promise.then(permissionManageDlg.show);
        };

        $scope.addAccountClk = function(){
            $scope.Account = {};
            $scope.Account.title = $scope.languageJson.Account.Add;/*"新增"*/
            $scope.Account.isAdmin = "false";
            accountInfoDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/accountInfo.html',
                show: false
            });
            accountInfoDlg.$promise.then(accountInfoDlg.show);
        };

        $scope.updAccountClk = function(acc){
            $scope.Account = acc;
            $scope.Account.title = $scope.languageJson.Account.Modify;/*"修改"*/
            accountInfoDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/accountInfo.html',
                show: false
            });
            accountInfoDlg.$promise.then(accountInfoDlg.show);
        };

        function isChina(s){
            var patrn=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            if(!patrn.exec(s)){
                return false;
            }else{
                return true;
            }
        }

        $scope.saveAccountClk = function(){
            if($scope.Account.userName == undefined || $scope.Account.userName == ""){
                balert.show('danger',$scope.languageJson.Username.Title,3000);/*'昵称不能为空!'*/
                return;
            }
            if($scope.Account.logonId == undefined || $scope.Account.logonId == ""){
                balert.show('danger',$scope.languageJson.Username.Empty,3000);/*'账户名不能为空!'*/
                return;
            }
            if(isChina($scope.Account.logonId)){
                balert.show('danger',$scope.languageJson.Username.Chinese,3000);/*'账户名不能有中文字符!'*/
                return;
            }
            var is = false;
            $scope.Accounts.forEach(function(item){
                if(item.logonId == $scope.Account.logonId && item.userId != $scope.Account.userId)
                    is = true;
            });
            if(is){
                balert.show('danger',$scope.languageJson.Username.Already,3000);/*'账户名已存在!'*/
                return;
            }
            if($scope.Account.password == undefined || $scope.Account.password == ""){
                balert.show('danger',$scope.languageJson.Username.Password,3000);/*'密码不能为空!'*/
                return;
            }

            /*"新增"*/
            if($scope.Account.title == $scope.languageJson.Account.Add){
                userService.insertAccount($scope.Account).then(function(data){
                    if(data == "OK"){
                        initPerm();
                        accountInfoDlg.hide();
                        balert.show('success',$scope.languageJson.Username.Added,3000);/*'新增成功!'*/
                    }else
                        balert.show('danger',$scope.languageJson.Username.New,3000);/*'新增失败!'*/
                });
            }else if($scope.Account.title == $scope.languageJson.Account.Modify){/*"修改"*/
                userService.updateAccount($scope.Account).then(function(data){
                    if(data == "OK"){
                        initPerm();
                        accountInfoDlg.hide();
                        balert.show('success',$scope.languageJson.Username.Modified,3000);/*'修改成功!'*/
                    }else
                        balert.show('danger',$scope.languageJson.Username.Fail ,3000);/*'修改失败!'*/
                });
            }
        };

        $scope.delAccountClk = function(userId){
            userService.deleteAccount(userId).then(function(data){
                if(data == "OK"){
                    initPerm();
                    balert.show('success',$scope.languageJson.Username.Deleted,3000);/*'删除成功!'*/
                }else
                    balert.show('danger',$scope.languageJson.Username.Delete,3000);/*'删除失败!'*/
            });
        };
        //endregion *************************** 权限管理 End ********************************/
    }
]);


nurseController.controller('diagramCtrl', ['$scope', '$stateParams', '$compile', '$interval', '$modal', 'diagramService', 'uploadService','$window','global','$location','balert', 'equipmentTemplateService', 'baseTypeService', '$http','ImageManageService',
    function($scope, $stateParams, $compile, $interval, $modal, diagramService, uploadService,$window,global,$location,balert,equipmentTemplateService,baseTypeService ,$http,ImageManageService) {

        /*(function(){
            var url = $location.absUrl();
            //选择性隐藏“新增环境量”按钮
            var index = url.lastIndexOf("1004");
            if(index>0) $scope.imagesShow = true;
            else $scope.imagesShow = false;

            //选择性隐藏“新增摄像头”按钮
            if(url.substring(url.substring(0,url.lastIndexOf("/")).lastIndexOf("/")+1,url.substring(0,url.lastIndexOf("/")).length) == 1201
                || index>0) $scope.cameraShow = true;
            else $scope.cameraShow = false;

            //选择性隐藏“新增信号量”按钮
            if(url.substring(url.substring(0,url.lastIndexOf("/")).lastIndexOf("/")+1,url.substring(0,url.lastIndexOf("/")).length) != 1201
                && index < 0)$scope.signalShow = true;
            else $scope.signalShow = false;

            //initTitle();
        })();*/

        function initTitle(){
            setTimeout(function(){
                $("#Radio").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Radio+"</h5>");
                $("#Checkbox").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Checkbox+"</h5>");
                $("#Copy").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Copy+"</h5>");
                $("#Paste").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Paste+"</h5>");
                $("#Delete").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Delete+"</h5>");
                $("#HideEdit").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.HideEdit+"</h5>");
                $("#TopAlign").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.TopAlign+"</h5>");
                $("#BottomAlign").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.BottomAlign+"</h5>");
                $("#LeftAlign").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.LeftAlign+"</h5>");
                $("#RightAlign").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.RightAlign+"</h5>");
                $("#SameHeight").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.SameHeight+"</h5>");
                $("#SameWidth").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.SameWidth+"</h5>");
                $("#VerticalDistance").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.VerticalDistance+"</h5>");
                $("#HorizontalDistance").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.HorizontalDistance+"</h5>");
                $("#UpperLevel").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.UpperLevel+"</h5>");
                $("#NextLevel").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.NextLevel+"</h5>");
                $("#Topping").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Topping+"</h5>");
                //$("#Bottom").attr("data-original-title","<h5>"+$scope.languageJson.ConfigOperate.Bottom+"</h5>");
            },500);
        }


        $(window).resize(function(){
            $scope.$apply(function(){

                $(".ng-scope .panel-primary").each(function(){
                    var id= $(this).attr("partid");
                    if(!$scope.diagram.parts) return true;
                    var part=_.findWhere($scope.diagram.parts,{id:id});
                    if(!part) return true;
                    var newsize=global.getcurrentsize(part.left,part.top,part.width,part.height);
                    var arr=newsize.split(',');
                    $(this).css({
                        left: arr[0] + "px",
                        top: arr[1] + "px",
                        width:arr[2] + "px",
                        height:arr[3] + "px"
                    });
                });


            });
        });

        var stop;
        $scope.diagram = $stateParams.diagram;

        function updatePageSetting() {
            if ($scope.diagram) {
                var containerDiv = document.getElementById("diagramControl");
                containerDiv.style.backgroundImage = "url('" + $scope.diagram.page.bgImage + "')";

                $scope.resetParts();
            }
        };

        $scope.resetParts=function() {
            if($scope.diagram != undefined && $scope.diagram.deviceBaseTypeId.indexOf("table") != -1){
                $('#table-config').remove();
                $("#diagram").css("height","0px");
                var style = "style='width: 100%; height:100%;'";
                var sum = CreateTable($scope.diagram,"",style);
                sum = "<div id='table-config'>" + sum + "</div>";
                var containerDiv = document.getElementById("diagramControl");
                $compile(sum)($scope).appendTo(containerDiv);
            }else{
                $('[partid]').remove();
                var sum = _.reduce($scope.diagram.parts, function(memo, part) {
                    var ps = "<" + part.type + " partid='" + part.id + "'></" + part.type + ">";
                    return memo + ps;
                }, "");

                var containerDiv = document.getElementById("diagramControl");
                $compile(sum)($scope).appendTo(containerDiv);
            }
        };

        var pageSettingDlg = undefined;
        $scope.setPage = function() {

            pageSettingDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/diagramPageSetting.html',
                show: false
            });

            pageSettingDlg.$promise.then(pageSettingDlg.show);
        };

        $scope.$on("fileSelected",function(event, msg) {
                $scope.file = msg;
        });
        $scope.$on("fileSelected2",function(event, msg) {
                $scope.file2 = msg;
        });

        $scope.upload = function() {
            var file = $scope.file;

            if (file === undefined) return;
            if(file.size > 500000){
                //'图片大小不能超过500K'
                balert.show('danger',$scope.languageJson.Configuration.Page.UploadError,3000);
                return;
            }

            uploadService.uploadFile($scope.file).then(function(data) {
                uploadService.deleteUploadFile($scope.diagram.page.bgImage);
                $scope.diagram.page.bgImage = data;
                updatePageSetting();

                pageSettingDlg.hide();
            });
        };

        var editTableDiagramDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/editTableDiagram.html',
            show: false
        });
        $scope.changeEditState = function() {
            if($scope.diagram != undefined && $scope.diagram.deviceBaseTypeId.indexOf("table") != -1){
                if($scope.diagram.table && $scope.diagram.table.tr && $scope.diagram.table.tr[0].td[0]){
                    $scope.choiceTable = deepCopy($scope.diagram.table.tr[0].td[0]);
                    $scope.location = {trIndex:0,tdIndex:0};
                }
                editTableDiagramDlg.$promise.then(editTableDiagramDlg.show);
                return;
            }
            if($scope.diagram == undefined)
                $scope.diagram = {edit : false};
            $scope.diagram.edit = !$scope.diagram.edit;

            if ($scope.diagram == null || $scope.diagram.edit === true) {
                $scope.stop();
                if($scope.languageJson.Language == 'Chinese'){
                    $(".pull-right .is-show-ul").show().animate({'width':'132px'}, 2000);
                    $(".pull-right .is-show-ul li").css('width','125px');
                    $(".pull-right .is-show-div").show().animate({'right':'152px'}, 2000);
                }else{
                    $(".pull-right .is-show-ul").show().animate({'width':'180px'}, 2000);
                    $(".pull-right .is-show-ul li").css('width','180px');
                    $(".pull-right .is-show-div").show().animate({'right':'207px'}, 2000);
                }
                document.oncontextmenu = function(){return false};
                initConfigEditorFunction();

                initViewCanvas(true);
            } else {
                diagramService.saveDiagram($scope.diagram);
                $scope.start();

                if($scope.selArray){
                    for(var i =0;i < $scope.selArray.length;i++){
                        $scope.selArray[i].classList.remove("seled");
                    }
                    $scope.selArray = [];
                }
                $(".pull-right .is-show-ul").animate({'width':'0px'}, 2000, function(){ $(this).hide(); });
                $(".pull-right .is-show-div").animate({'right':'0px'}, 2300, function(){  });
                document.oncontextmenu = function(){return true};

                initViewCanvas(false);
            }
        };

        function initViewCanvas(is){
            if(localStorage.getItem("versions") == "IView"){
                var width = diagramService.GetScreenWidth();
                $(".iview-canvas .canvas-body").css("width",width+"px");
                $(".iview-canvas .canvas-body .canvas-config").css("width",(width - 150)+"px");
            }
            if(is){
                if(window.navigator.userAgent.indexOf("Windows") != -1)
                    $(".iview-canvas").show();
            }else{
                $(".iview-canvas").hide();
            }
        }
        $scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
            if(newValue == false || newValue == "false")
                $(".iview-canvas").hide();
        });

        var showImgFileDlg = undefined;
        $scope.imgFilePath = undefined;
        $scope.showImgFile = function(){
            $scope.imgFiles = {
                catalog : "img/diagram",
                imageFile : undefined
            };
            showImgFileDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/showImgFile.html',
                show: false
            });
            showImgFileDlg.$promise.then(showImgFileDlg.show);

            $scope.changeCatalog($scope.imgFiles.catalog);
        };

        $scope.changeCatalog = function(catalog){
            ImageManageService.LoadImagesByPath(catalog).then(function(data){
                $scope.ImageFiles = data;
            });
        };

        $scope.clickImage = function(imageFile,$event){
            $scope.imgFiles.imageFile = imageFile;
            $($event.currentTarget).parent().find('div').removeClass("select-image");
            $($event.currentTarget).addClass("select-image");
        };

        $scope.selectImageFile = function(){
            if($scope.imgFiles == undefined || $scope.imgFiles.imageFile == undefined){
                //'请选择图片。'
                balert.show('danger', $scope.languageJson.Configuration.LocalImage.SelectError,3000);
                return;
            }
            $scope.imgFilePath = $scope.imgFiles.imageFile;
            showImgFileDlg.hide();
        };

        $scope.replace = function(){
            $scope.diagram.page.bgImage = $scope.imgFilePath;
            updatePageSetting();
            pageSettingDlg.hide();
        };
        /************************** 组态编辑 Start ****************************************/
        function initConfigEditorFunction(){
            // 组态选择
            $scope.isSelect = false;
            $scope.hideEdit = false;
            $scope.isLock = true;
            $(".editor_lock").removeClass("true");
            $(".editor_lock").addClass("true");
            $(".editor_lock").attr("disabled","true");
            sessionStorage.setItem("isLock","true");

            $scope.select = function(){
                $scope.isSelect = !$scope.isSelect;
            };

            var startX = 0, startY = 0;
            var retcLeft = "0px", retcTop = "0px", retcHeight = "0px", retcWidth = "0px";
            $scope.selList = [];
            document.onmousedown = function(e){
                if($scope.isLock) return;
                var isSelect = false;
                if(e.path == undefined) return;
                e.path.forEach(function(item){
                    if(item.id == "editor_config" || item.id == "editor_menu"){
                        isSelect = true;
                        if(item.id == "editor_config") $scope.selectStart = false;
                    }
                });
                if(isSelect == true) return;
                if($scope.diagram == null || !$scope.diagram.edit || (e.which != 3 && $scope.selectStart != true)) return;
                try{
                    //获取所有可选集合
                    $scope.selList = [];
                    var fileNodes = document.getElementById("page-wrapper").getElementsByTagName("div");
                    for(var i=0;i<fileNodes.length;i++){
                        var isPartid = fileNodes[i].attributes["partid"];
                        if(isPartid){
                            $scope.selList.push(fileNodes[i]);
                        }
                    }

                    $scope.isSelect = true;
                    var evt = window.event || e;
                    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                    var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                    startX = evt.clientX + scrollLeft;
                    startY = evt.clientY + scrollTop;

                    var selDiv = document.createElement("div");
                    selDiv.id = "selectDiv";
                    selDiv.className = "selectDiv";
                    selDiv.style.marginLeft = startX + "px";
                    selDiv.style.marginTop = startY + "px";
                    selDiv.style.zIndex = 9999;
                    document.body.appendChild(selDiv);

                    clearEventBubble(evt);
                    document.onmousemove = function(e){
                        evt = window.event || e;
                        if($scope.isSelect){
                            try{
                                //if(e.which != 3) return;
                                $scope.selDiagram = [];

                                var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                                var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                                retcLeft = (startX - evt.clientX - scrollLeft > 0 ? evt.clientX + scrollLeft : startX) + "px";
                                retcTop = (startY - evt.clientY - scrollTop > 0 ? evt.clientY + scrollTop : startY) + "px";
                                retcHeight = Math.abs(startY - evt.clientY - scrollTop) + "px";
                                retcWidth = Math.abs(startX - evt.clientX - scrollLeft) + "px";

                                var selDiv = getEle("selectDiv");
                                if(!selDiv) return;
                                selDiv.style.marginLeft = retcLeft;
                                selDiv.style.marginTop = retcTop;
                                selDiv.style.width = retcWidth;
                                selDiv.style.height = retcHeight;
                                //----------------关键算法---------------------//
                                var _l = selDiv.offsetLeft, _t = selDiv.offsetTop;
                                var _w = selDiv.offsetWidth, _h = selDiv.offsetHeight;

                                for(var i =0;i < $scope.selList.length;i++){
                                    var wl = $scope.selList[i].offsetWidth + $scope.selList[i].offsetLeft;
                                    var ht = $scope.selList[i].offsetHeight + $scope.selList[i].offsetTop;
                                    if(wl > _l && ht > _t && wl < _l + _w && ht < _t + _h){
                                        if($scope.selList[i].className.indexOf("seled") == -1){
                                            $scope.selList[i].className = $scope.selList[i].className + " seled";
                                        }
                                    }else{
                                        if($scope.selList[i].className.indexOf("seled") != -1){
                                            $scope.selList[i].classList.remove("seled");
                                        }
                                    }
                                }
                            }catch(e){
                                //alert(e);
                            }
                        }
                        clearEventBubble(evt);
                    };

                    document.onmouseup = function(e){
                        try{
                            if(getEle("selectDiv")) document.body.removeChild(getEle("selectDiv"));
                            if(getEle("selectDiv")) document.body.removeChild(getEle("selectDiv"));
                            //选中的组态集合
                            $scope.selArray = [];
                            for(var i =0;i < $scope.selList.length;i++){
                                if($scope.selList[i].className.indexOf("seled") != -1)
                                    $scope.selArray.push($scope.selList[i]);
                            }
                            $scope.selDiagram = getSelectArray($scope.selArray);
                            $scope.isSelect = false;
                        }catch(e){
                            //alert(e);
                        }
                    };

                }catch(e){
                    //alert(e);
                }
            };

            function getSelectArray(selDiagram){
                var diagrams = [];
                selDiagram.forEach(function(item){
                    $scope.diagram.parts.forEach(function(part){
                        if(part.id == item.getAttribute("partid"))
                            diagrams.push(part);
                    });
                });
                return diagrams;
            };

            function clearEventBubble(evt){
                if(evt.stopPropagation)
                    evt.stopPropagation();
                else evt.cancelBubble=true;
                if(evt.preventDefault)
                    evt.preventDefault();
                else evt.returnValue=false;
            }

            function getEle(id){
                return document.getElementById(id);
            }

            //单选/框选
            $scope.select = function(type){
                if(type == "one"){
                    $scope.selectStart = false;
                }else{
                    $scope.selectStart = true;
                }
            };

            //复制
            var pasteNumber = 1;
            $scope.copy = function(){
                $scope.copyDiagram = $scope.selDiagram;
                pasteNumber = 1;
            };

            //粘贴
            $scope.paste = function(){
                if($scope.copyDiagram){
                    var copys = $scope.copyDiagram;
                    for(var i = 0;i<copys.length;i++){
                        var cfg = {};
                        var typename = copys[i].id.replace(/[0-9]/ig,'');
                        cfg.id = typename + getPartNum(typename);
                        cfg.type = copys[i].type;
                        cfg.top = copys[i].top + pasteNumber*10;
                        cfg.left = copys[i].left + pasteNumber*10;
                        cfg.width = copys[i].width;
                        cfg.height = copys[i].height;
                        cfg.zindex = copys[i].zindex;
                        if(copys[i].binding)
                            cfg.binding = copys[i].binding;
                        cfg.options = copys[i].options;
                        $scope.diagram.parts.push(cfg);
                        $scope.resetParts();
                    }
                    pasteNumber += 1;
                }
            };

            //删除
            $scope.remove = function(){
                for(var i = 0;i < $scope.selDiagram.length;i++){
                    for(var j = 0; j < $scope.diagram.parts.length;j++){
                        if($scope.diagram.parts[j].id == $scope.selDiagram[i].id){
                            $scope.diagram.parts.splice(j, 1);
                            break;
                        }
                    }
                };
                $scope.resetParts();
            };

            function getPartNum(typename){
                var num = 1;
                var cparts = $scope.diagram.parts;
                for(var i=0;i<cparts.length;i++){
                    if(cparts[i].id.indexOf(typename) == -1) continue;

                    var partnum = parseInt(cparts[i].id.replace(typename,''));
                    if(partnum >= num){
                        num = partnum+1;
                    }
                }
                return num;
            }

            //对齐 上 | 下 | 左 | 右
            $scope.align = function(type){
                var max = 0;
                if(type == "up" || type == "left") max = 9999;
                $scope.selDiagram.forEach(function(part){
                    if(type == "up"){
                        if(part.top < max) max = part.top;
                    }
                    if(type == "down"){
                        if((part.top + part.height) > max) max = part.top + part.height;
                    }
                    if(type == "left"){
                        if(part.left < max) max = part.left;
                    }
                    if(type == "right"){
                        if((part.left + part.width) > max) max = part.left + part.width;
                    }
                });

                $scope.selDiagram.forEach(function(part){
                    if(type == "up"){
                        part.top = max;
                    }
                    if(type == "down"){// top + height => max - height = top
                        part.top = max - part.height;
                    }
                    if(type == "left"){
                        part.left = max;
                    }
                    if(type == "right"){// left + width => max - width = left
                        part.left = max - part.width;
                    }
                });
                $scope.resetParts();
            };

            //等高 / 等宽
            $scope.same = function(type){
                var max = 0;
                $scope.selDiagram.forEach(function(part){
                    if(type == "height"){
                        if(part.height > max) max = part.height;
                    }
                    if(type == "width"){
                        if(part.width > max) max = part.width;
                    }
                });

                $scope.selDiagram.forEach(function(part){
                    if(type == "height"){
                        part.height = max;
                    }
                    if(type == "width"){
                        part.width = max;
                    }
                });
                $scope.resetParts();
            };

            //等间距 垂直 / 水平
            var InputBoxDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/inputBox.html',
                show: false
            });
            var spaceType = "";
            $scope.space = function(type){
                InputBoxDialog.$promise.then(InputBoxDialog.show);
                $scope.message = "请输入等间距,单位:px";
                $scope.inputValue = 0;
                spaceType = type;
            };

            $scope.changeValue = function(value){
                $scope.inputValue = value;
            };

            $scope.ok = function(){
                var value = $scope.inputValue;
                for(var i = 0;i < $scope.selDiagram.length - 1;i++){
                    for(var j = ($scope.selDiagram.length - 2);j >= i;j--){
                        if(spaceType == "vertical" && ($scope.selDiagram[j].top > $scope.selDiagram[j+1].top)){
                            var temp = $scope.selDiagram[j];
                            $scope.selDiagram[j] = $scope.selDiagram[j+1];
                            $scope.selDiagram[j+1] = temp;
                        }
                        if(spaceType == "level" && ($scope.selDiagram[j].left > $scope.selDiagram[j+1].left)){
                            var temp = $scope.selDiagram[j];
                            $scope.selDiagram[j] = $scope.selDiagram[j+1];
                            $scope.selDiagram[j+1] = temp;
                        }
                    }
                }

                for(var i = 1; i < $scope.selDiagram.length; i++){
                    if(spaceType == "vertical"){
                        $scope.selDiagram[i].top = $scope.selDiagram[i-1].top + $scope.selDiagram[i-1].height + parseInt($scope.inputValue);
                    }
                    if(spaceType == "level")
                        $scope.selDiagram[i].left = $scope.selDiagram[i-1].left + $scope.selDiagram[i-1].width + parseInt($scope.inputValue);
                }
                $scope.resetParts();
                InputBoxDialog.hide();
            };

            $scope.cancel = function(){
                InputBoxDialog.hide();
            };

            //移动 上 | 下 | 左 | 右
            $scope.move = function(type,value){
                if(!$scope.selDiagram || !$scope.selArray) return;
                $scope.selDiagram.forEach(function(part){
                    if(type == "up"){
                        part.top -= value;
                    }
                    if(type == "down"){
                        part.top += value;
                    }
                    if(type == "left"){
                        part.left -= value;
                    }
                    if(type == "right"){
                        part.left += value;
                    }
                });
                $scope.selArray.forEach(function(item){
                    if(type == "up"){
                        item.style.top  = item.offsetTop-value+'px';
                    }
                    if(type == "down"){
                        item.style.top  = item.offsetTop+value+'px';
                    }
                    if(type == "left"){
                        item.style.left = item.offsetLeft-value+'px';
                    }
                    if(type == "right"){
                        item.style.left = item.offsetLeft+value+'px';
                    }
                });
            };

            //鼠标点击事件
            document.onclick = function(e){
                if($scope.isLock) return;
                if($scope.diagram == null || $scope.diagram.edit != true) return;
                var es = window.event || e;

                var parent = es.target.parentNode;
                if(parent.attributes && parent.attributes["partid"]){//组态元素
                    $scope.selArray = [];
                    var fileNodes = document.getElementById("page-wrapper").getElementsByTagName("div");
                    if(es.ctrlKey){//按下Ctrl键
                        if(parent.className.indexOf("seled") == -1){
                            parent.className = parent.className + " seled";
                        }else if(parent.className.indexOf("seled") != -1){
                            parent.classList.remove("seled");
                        }
                        for(var i =0;i < fileNodes.length;i++){
                            if(fileNodes[i].className.indexOf("seled") != -1)
                                $scope.selArray.push(fileNodes[i]);
                        }
                    }else{
                        for(var i =0;i < fileNodes.length;i++){
                            fileNodes[i].classList.remove("seled");
                        }
                        if(parent.className.indexOf("seled") == -1){
                            parent.className = parent.className + " seled";
                            $scope.selArray.push(parent);
                        }
                    }
                    $scope.selDiagram = getSelectArray($scope.selArray);
                }
            };

            //键盘按键事件
            document.onkeydown = function(e){
                if($scope.isLock) return;
                if($scope.diagram == null || $scope.diagram.edit != true) return;
                var keyCode = window.event?e.keyCode:e.which;
                var es = window.event || e;
                /*if(es.ctrlKey){
                    if (keyCode == 67){
                        $scope.copy();
                    }
                    if (keyCode == 86){
                        $scope.paste();
                    }
                }*/
                if (keyCode == 46) {
                    $scope.remove();
                }
                if (keyCode == 37) {
                    $scope.move('left');
                }
                if (keyCode == 39){
                    $scope.move('right');
                }
                if (keyCode == 38){
                    $scope.move('up');
                }
                if (keyCode == 40){
                    $scope.move('down');
                }
            };

            $scope.z_index = function(expr){
                if(!$scope.selDiagram || !$scope.selArray) return;
                $scope.selDiagram.forEach(function(part){
                    if(part.zindex == undefined || part.zindex == "")
                        part.zindex = 1;
                    if(expr.indexOf("=") > -1)
                        eval("part.zindex "+expr);
                    else if(eval("part.zindex "+expr+" >= 0"))
                        eval("part.zindex = part.zindex "+expr);
                    if(parseInt(part.zindex) >= 998)
                        part.zindex = 998;
                });
                $scope.selArray.forEach(function(item){
                    if(item.style.zIndex == undefined || item.style.zIndex == "")
                        item.style.zIndex = 1;
                    if(expr.indexOf("=") > -1)
                        eval("item.style.zIndex "+expr);
                    else if(eval("parseInt(item.style.zIndex) "+expr+" >= 0"))
                        eval("item.style.zIndex = parseInt(item.style.zIndex) "+expr);
                    if(parseInt(item.style.zIndex) >= 998)
                        item.style.zIndex = 998;
                });
            };

            //组态锁定
            $scope.Lock = function(){
                $scope.isLock = !$scope.isLock;
                if($scope.isLock) {
                    $(".editor_lock").attr("disabled", "true");
                    $(".editor_lock").addClass("true");
                    sessionStorage.setItem("isLock","true");
                }else{
                    $(".editor_lock").removeAttr("disabled");
                    $(".editor_lock").removeClass("true");
                    sessionStorage.setItem("isLock","false");
                }
            };


            /*** 圆盘 ***/
            $scope.wheelMode = "move";
            $scope.multiplying = "1";
            //移动组态模式
            $scope.moveWheel = function(){
                $scope.wheelMode = "move";
                $scope.multiplying = "1";

                $(".key-table .fa-arrow-up").show();
                $(".key-table .fa-arrow-left").show();
                $(".key-table .fa-arrow-right").show();
                $(".key-table .fa-arrow-down").show();

                $(".key-title label").html($scope.languageJson.ConfigOperate.Distance);/*"距离:"*/
                $(".key-title div").show();
            };
            //拉伸组态模式
            $scope.stretchWheel = function(){
                $scope.wheelMode = "stretch";
                $scope.multiplying = "1";

                $(".key-table .fa-arrow-up").show();
                $(".key-table .fa-arrow-left").show();
                $(".key-table .fa-arrow-right").show();
                $(".key-table .fa-arrow-down").show();

                $(".key-title label").html($scope.languageJson.ConfigOperate.Size);/*"大小:"*/
                $(".key-title div").show();
            };
            //选择组态模式
            $scope.selectWheel = function(){
                $scope.wheelMode = "select";

                $(".key-table .fa-arrow-up").hide();
                $(".key-table .fa-arrow-left").show();
                $(".key-table .fa-arrow-right").show();
                $(".key-table .fa-arrow-down").hide();

                $(".key-title label").html("");
                $(".key-title div").hide();
            };

            //圆盘箭头
            $scope.wheelArrow = function(type){
                if($scope.wheelMode == "move")//移动
                    $scope.move(type,parseInt($scope.multiplying));
                else if($scope.wheelMode == "stretch")//拉伸
                    stretch(type,parseInt($scope.multiplying));
                else
                    select(type);
            };

            //拉伸组态
            function stretch(type,value){
                if($scope.isLock) return;
                if($scope.diagram == null || $scope.diagram.edit != true) return;
                if($scope.selDiagram == undefined || $scope.selDiagram.length <= 0) return;

                $scope.selDiagram.forEach(function(part){
                    if(type == "right")
                        part.width += value;
                    if(type == "left")
                        part.width -= value;

                    if(type == "down")
                        part.height += value;
                    if(type == "up")
                        part.height -= value;
                });
                $scope.resetParts();
            }

            //选择组态
            var index = 0;
            function select(type){
                if($scope.isLock) return;
                if($scope.diagram == null || $scope.diagram.edit != true) return;

                $scope.selArray = [];
                //获取所有div
                var fileNodes = document.getElementById("page-wrapper").getElementsByTagName("div");

                //筛选组态控件集合
                var nodeArr = [];
                for(var i =0;i < fileNodes.length;i++){
                    if(fileNodes[i].attributes && fileNodes[i].attributes["partid"]) {
                        nodeArr.push(fileNodes[i]);
                        fileNodes[i].classList.remove("seled");
                    }
                }

                //添加样式
                nodeArr[index].className = nodeArr[index].className + " seled";
                $scope.selArray.push(nodeArr[index]);

                $scope.selDiagram = getSelectArray($scope.selArray);

                if(type == "right") index++;
                else index--;
                if(index >= nodeArr.length) index = 0;
                else if(index < 0) index = nodeArr.length - 1;
            }

            //键盘浮动
            $scope.floatMode = "left";
            $scope.FloatWheel = function(){
                if($scope.floatMode == "left"){
                    $scope.floatMode = 'right';

                    $(".key-wheel").removeClass("right");
                    $(".key-wheel").addClass("left");
                }else{
                    $scope.floatMode = 'left';

                    $(".key-wheel").removeClass("left");
                    $(".key-wheel").addClass("right");
                }
            };
        };

        /************************** 组态编辑 End ****************************************/

        /************************** 导入导出组态 Start ****************************************/
        function initUploadFunction(){
            $scope.file = undefined,$scope.file2 = undefined;
            if($scope.diagram){
                uploadService.GetNowJsonPath($scope.diagram).then(function(data){
                    $scope.DownloadNowPage = data;
                });
            }
            uploadService.GetAllJsonTemplates().then(function(data){
                $scope.JsonTemplates = parseJsonTemplate(data);
            });
            uploadService.GetAllJsonInstances().then(function(data){
                $scope.JsonInstances = data;
            });

            function parseJsonTemplate(data){
                var ConfigurationType = $scope.languageJson.ConfigurationType;
                var Export = $scope.languageJson.Configuration.ConfigurationPage.Export;
                data.forEach(function(item){
                    if($scope.languageJson.Language != "Chinese") {
                        if (item.id == "201") item.name = $scope.languageJson.ConfigurationType.CT201;
                        else if (item.id == "301") item.name = ConfigurationType.CT301;
                        else if (item.id == "401") item.name = ConfigurationType.CT401;
                        else if (item.id == "402") item.name = ConfigurationType.CT402;
                        else if (item.id == "501") item.name = ConfigurationType.CT501;
                        else if (item.id == "702") item.name = ConfigurationType.CT702;
                        else if (item.id == "1001") item.name = ConfigurationType.CT1001;
                        else if (item.id == "1004") item.name = ConfigurationType.CT1004;
                        else if (item.id == "1006") item.name = ConfigurationType.CT1006;
                        else if (item.id == "1101") item.name = ConfigurationType.CT1101;
                        else if (item.id == "1201") item.name = ConfigurationType.CT1201;
                        else if (item.id == "1501") item.name = ConfigurationType.CT1501;
                        else if (item.id == "2001") item.name = ConfigurationType.CT2001;
                    }
                    if(item.name == "8888") item.name = Export.Topology;//"拓扑图"
                    else if(item.name == "8889") item.name = Export.MDC;//"MDC统计";
                    else if(item.name == "9999") item.name = Export.Blank;//"空白页面";
                    else if(item.name == "9999.table") item.name = Export.Table;//"表格页面";
                });
                return data;
            }

            $scope.UploadNowPage = function(path){
                var Import = $scope.languageJson.Configuration.ConfigurationPage.Import;
                if(path == "instances"){
                    if($scope.file == undefined){
                        //'请选择文件!'
                        balert.show('danger',Import.SelectError,3000);
                        return;
                    }
                    uploadService.UploadDiagramsJson(path,$scope.diagram,$scope.file).then(function(data){
                        //'上传成功!Path:'
                        balert.show('success',Import.Succeed+''+data,10000);
                        downloadUploadPageDlg.hide();
                        window.location.reload();
                    });
                }else{
                    if($scope.file2 == undefined){
                        //'请选择文件!'
                        balert.show('danger',Import.SelectError,3000);
                        return;
                    }
                    uploadService.UploadDiagramsJson(path,$scope.diagram,$scope.file2).then(function(data){
                        //'上传成功!Path:'
                        balert.show('success',Import.Succeed+''+data,10000);
                        downloadUploadPageDlg.hide();
                    });
                }
            };

            $scope.DownloadPage = function(path){
                var Export = $scope.languageJson.Configuration.ConfigurationPage.Export;
                if(path == undefined || path == ""){
                    //'请选择文件!'
                    balert.show('danger',Export.SelectError,3000);
                    return;
                }
                uploadService.DownloadDiagramsJson(path,"").then(function(data){
                    if(data != "ERROR"){
                        //'下载成功!Path:'
                        balert.show('success',Export.Succeed+''+data,10000);
                        downloadUploadPageDlg.hide();
                    }else{
                        //'下载失败!'
                        balert.show('danger',Export.Error,3000);
                    }
                });
            };

            $scope.DeleteInstancesJson = function(){
                var Restore = $scope.languageJson.Configuration.ConfigurationPage.Restore;
                if($scope.DownloadNowPage == "" || $scope.DownloadNowPage == undefined
                    ||$scope.DownloadNowPage.indexOf("instances") == -1){
                    //'当前组态就是原始组态，无法还原!'
                    balert.show('danger',Restore.RestoreError,3000);
                    return;
                }
                uploadService.DeleteInstancesJson($scope.DownloadNowPage).then(function(data){
                    if(data == "OK"){
                        //'还原成功!'
                        balert.show('success',Restore.Succeed,3000);
                        downloadUploadPageDlg.hide();
                        window.location.reload();
                    }else
                        balert.show('danger',Restore.Error+''+data,3000);//'还原失败!ERROR:'
                });
            };

            $scope.CopyJsonClick = function(page){
                var Reference = $scope.languageJson.Configuration.ConfigurationPage.Reference;
                if($scope.diagram.deviceId == undefined || $scope.diagram.deviceId == ""){
                    //'当前页面不是设备组态页面！'
                    balert.show('danger',Reference.PageError,3000);
                    return;
                }
                if(page == undefined || page == ""){
                    //'请选择引用的设备！'
                    balert.show('danger',Reference.ReferenceError,3000);
                    return;
                }
                uploadService.CopyJsonInstance(page,$scope.diagram.deviceId).then(function(data){
                    if(data == "OK"){
                        //'引用成功!'
                        balert.show('success',Reference.Succeed,3000);
                        downloadUploadPageDlg.hide();
                        window.location.reload();
                    }
                });
            };
        };

        var downloadUploadPageDlg = undefined;
        $scope.downloadUploadPage = function(){
            initUploadFunction();
            downloadUploadPageDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/downloadUploadPage.html',
                show: false
            });
            downloadUploadPageDlg.$promise.then(downloadUploadPageDlg.show);
            setTimeout(function(){
                $(".tooltip-options a").attr("data-original-title","<h5>"+$scope.languageJson.Configuration.ConfigurationPage.Reference.ReferencePrompt+"</h5>");
            },500);
        };

        /************************** 导入导出组态 End ****************************************/

        /************************** 表格组态 Start ******************************************/
        function deepCopy(obj){
            var newObj = obj.constructor === Array ? []:{};
            newObj.constructor = obj.constructor;
            if(typeof obj !== "object"){
                return ;
            } else if(window.JSON){
                //若需要考虑特殊的数据类型，如正则，函数等，需把这个else if去掉即可
                newObj = JSON.parse(JSON.stringify(obj));
            } else {
                for(var prop in obj){
                    if(obj[prop].constructor === RegExp ||obj[prop].constructor === Date){
                        newObj[prop] = obj[prop];
                    } else if(typeof obj[prop] === 'object'){
                        //递归
                        newObj[prop] = deepCopy(obj[prop]);
                    } else {
                        newObj[prop] = obj[prop];
                    }
                }
            }
            return newObj;
        }

        //生成表格
        function CreateTable(data, cls, sty){
            var sum = "<table class='body_transparent "+cls+"' "+sty+">";
            if(data.table){
                if(data.table.tr){
                    var trIndex = 0;
                    data.table.tr.forEach(function(trs){
                        var tr = "<tr>";
                        if(trs.td){
                            var type = trs.type;
                            var per = parseFloat(100/trs.td.length);
                            var width = "style='width: "+per+"%;'";/*vertical-align: top;*/
                            var tdIndex = 0;
                            trs.td.forEach(function(tds){
                                if(type == "table"){
                                    var tc = "";
                                    var ts = "";
                                    var tn = "";
                                    if(tds.style)
                                        tc = tds.style;
                                    if(tds.colspan && tds.rowspan)
                                        tn = " colspan='"+tds.colspan+"' rowspan='"+tds.rowspan+"' ";
                                    if(tds.fontSize)
                                        ts = "style='width: 100%; vertical-align: middle; text-align: "+tds.textAlign+"; font-size: "+tds.fontSize+
                                            "px; font-weight: "+tds.fontWeight+"; color: "+tds.fontColor+"; background-color: "+tds.backColor+"'";

                                    var title = "";
                                    if(tds.title != undefined && tds.title != "")
                                        title = "<div style='font-size: "+tds.fontSize+"px; font-weight: "+tds.fontWeight+"'>"+tds.title+"</div>";

                                    tr += "<td "+tn+" "+width+" class='"+tc+"'>"+title+CreateTable(tds , tc, ts)+"</td>";
                                }else{
                                    /*if(tdIndex == 0){
                                        if(trIndex >= 1)
                                            tr += "<td>"+(trIndex)+"</td>";
                                        else if(trIndex == 0)
                                            tr += "<td></td>";
                                    }*/
                                    if(type == "title")
                                        tr += "<td>"+tds.value+"</td>";
                                    else
                                        tr += "<td class='pointer {{resultSignalStatus(\""+tds.value+"\")}}' "+resultClickInfo(tds.value)+">{{getCurrentValue('"+tds.value+"')}}</td>";
                                    tdIndex++;
                                }
                            });
                            trIndex ++;
                        }
                        sum += tr + "</tr>";
                    });
                }
            }
            sum += "</table>";
            return sum;
        };

        function resultClickInfo(value){
            var split = value.split(".");
            if(split.length != 2) return "";
            return "ng-click=\"showHistoryChart(\'"+split[0]+"\',\'"+split[1]+"\',\'\')\"";
        }

        $scope.resultSignalStatus = function(value){
            var split = value.split(".");
            if(split.length != 2) return "";
            var className = "";
            if($scope.binddata){
                $scope.binddata.forEach(function(item){
                    if(item.deviceId == split[0] && item.baseTypeId == split[1]){
                        if(item.alarmSeverity == -255)
                            className = " disconnect-border ";
                        else if(parseInt(item.alarmSeverity) >= 0 && parseInt(item.alarmSeverity) <= 3)
                            className = " alarm-border ";
                    }
                });
            }
            return className;
        };

        //根据value=DeviceId.BaseTypeId获取实时值
        $scope.getCurrentValue = function(value){
            var split = value.split(".");
            if(split.length != 2) return value;
            var currentValue = "Loading...";
            if($scope.binddata){
                $scope.binddata.forEach(function(item){
                    if(item.deviceId == split[0] && item.baseTypeId == split[1]){
                        if(item.currentValue == "")
                            currentValue = " --- ";
                        else
                            currentValue = item.currentValue;
                    }
                });
            }
            return currentValue;
        };

        $scope.choiceTableClick = function(parts, trIndex){
            $scope.choiceTable = deepCopy(parts);
            $scope.location = {trIndex:trIndex,tdIndex:parts.index};
        };

        //保存表格为json
        $scope.saveTable = function(){
            diagramService.saveDiagram($scope.diagram);
            $scope.resetParts();
            editTableDiagramDlg.hide();
        };

        var inputMultiBoxDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/inputMultiBox.html',
            show: false
        });
        $scope.cancel = function(){
            inputMultiBoxDlg.hide();
        };
        //重置表格
        $scope.resetTable = function(){
            var input = $scope.languageJson.InputBox;
            $scope.inputList = [
                {message:input.RowNumber,inputValue:2},
                {message:input.ColNumber,inputValue:2}
            ];/*"表格 行数:" / "表格 列数:"*/
            inputMultiBoxDlg.$promise.then(inputMultiBoxDlg.show);

            $scope.ok = function(){
                if($scope.inputList[0].inputValue == "" || $scope.inputList[1].inputValue == ""){
                    balert.show('danger',input.NotValue,3000);//'请输入表格行数和列数!'
                    return;
                }
                if(parseInt($scope.inputList[0].inputValue) < 1 || parseInt($scope.inputList[1].inputValue) < 1){
                    balert.show('danger',input.ErrorValue,3000);//'表格行数和列数不能小于1!'
                    return;
                }

                $scope.diagram.table = getTableFormat(parseInt($scope.inputList[0].inputValue),parseInt($scope.inputList[1].inputValue));

                $scope.choiceTable = undefined;
                inputMultiBoxDlg.hide();
            };
        };

        function getTableFormat(rows, cols){
            var table = {
                tr:[]
            };

            for(var i = 0; i < rows;i ++){
                var tr = {
                    type:"table",
                    td:[]
                };
                for(var j = 0;j < cols;j ++){
                    tr.td.push({
                        table:{
                            tr:[]
                        },
                        "colspan": 1,
                        "rowspan": 1,
                        "style": "",
                        "backColor": "",
                        "fontSize": 16,
                        "fontColor": "rgb(255, 255, 255)",
                        "fontWeight": "bold",
                        "textAlign": "center"
                    });
                }
                table.tr.push(tr);
            }
            return table;
        };

        //跨行 跨列
        $scope.colRowSpan = function(parts){
            var input = $scope.languageJson.InputBox;
            if(parts == undefined){
                balert.show('danger',input.SelectPrompt,3000);//'请选择表格，或者重置表格!'
                return;
            }
            $scope.inputList = [
                {message:input.Rowspan,inputValue:parts.rowspan},
                {message:input.Colspan,inputValue:parts.colspan}
            ];/*"单元格 跨行数:" / "单元格 跨列数:"*/
            inputMultiBoxDlg.$promise.then(inputMultiBoxDlg.show);

            $scope.ok = function(){
                if($scope.inputList[0].inputValue == "" || $scope.inputList[1].inputValue == ""){
                    balert.show('danger',input.NotValue,3000);//'请输入单元格跨行数和跨列数!'
                    return;
                }
                if(parseInt($scope.inputList[0].inputValue) < 1 || parseInt($scope.inputList[1].inputValue) < 1){
                    balert.show('danger',input.ErrorValue,3000);//'单元格跨行数和跨列数不能小于1!'
                    return;
                }

                if($scope.diagram.table.tr){
                    $scope.diagram.table.tr.forEach(function(tr){
                        if(tr.index == $scope.location.trIndex && tr.td){
                            tr.td.forEach(function(td){
                                if(td.index == $scope.location.tdIndex){
                                    td.rowspan = parseInt($scope.inputList[0].inputValue);
                                    td.colspan = parseInt($scope.inputList[1].inputValue);
                                }
                            });
                        }
                    });
                }
                inputMultiBoxDlg.hide();
            };
        };

        //删除单元格
        $scope.deleteCells = function(parts){
            if(parts == undefined){
                balert.show('danger',$scope.languageJson.InputBox.SelectPrompt,3000);//'请选择表格，或者重置表格!'
                return;
            }
            if($scope.diagram.table.tr){
                $scope.diagram.table.tr.forEach(function(tr){
                    if(tr.index == $scope.location.trIndex && tr.td){
                        tr.td.forEach(function(td){
                            if(td.index == $scope.location.tdIndex){
                                tr.td.splice($.inArray(td,tr.td),1);
                                $scope.choiceTable = undefined;
                            }
                        });
                    }
                });
            }
        };

        var bindingTableSignalDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/bindingTableSignal.html',
            show: false
        });
        //绑定信号
        $scope.bindingSignal = function(parts){
            if(parts == undefined){
                balert.show('danger',$scope.languageJson.InputBox.SelectPrompt,3000);//'请选择表格，或者重置表格!'
                return;
            }

            bindingTableSignalDlg.$promise.then(bindingTableSignalDlg.show);
        };

        //保存表格配置
        $scope.saveBindingSignal = function(){
            $scope.diagram.table.tr[$scope.location.trIndex].td[$scope.location.tdIndex] = $scope.choiceTable;
            $scope.choiceTable = undefined;
            bindingTableSignalDlg.hide();
        };

        //绑定/删除单个信号值
        var bindingDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/bindingDlg.html',
            show: false
        });
        $scope.inputSignalClick = function(tr,td){
            if(tr.type == "title") return;
            var dbs = getDeviceIdAndBaseTypeId(tr.index,td.index);
            $scope.Topology = {
                DeviceId : dbs[0]
            };
            //加载设备列表
            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                $scope.deviceList = parseDeviceList(data);
                if($scope.deviceList) $scope.changeDevice($scope.Topology.DeviceId);
            });
            $scope.bindTitle = $scope.languageJson.TableConfigEdit.TableSignal;//"表格信号"
            bindingDlg.$promise.then(bindingDlg.show);

            //重写方法
            $scope.ok = function(){
                if($scope.Topology.DeviceId == undefined || $scope.data.selecteds == undefined){
                    balert.show('danger',$scope.languageJson.TableConfigEdit.SelectPromt,3000);//'请选择信号!'
                    return;
                }
                var obj = angular.fromJson($scope.data.selecteds[0]);
                saveSignalText(tr.index, td.index,$scope.Topology.DeviceId+"."+obj.baseTypeId);
                bindingDlg.hide();
            };

            $scope.deleteBind = function(){
                saveSignalText(tr.index, td.index,"");
                bindingDlg.hide();
            };

            $scope.changeDevice = function(id){
                baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                    $scope.data.devices = data;
                });
            };
        };

        function parseDeviceList(data){
            if(data){
                var arr = [];
                data.forEach(function(item){
                    arr.push({
                        equipmentId : item.id,
                        configName : item.name
                    });
                });
                return arr;
            }
            return [];
        };

        function saveSignalText(trIndex,tdIndex,value){
            if($scope.choiceTable.table.tr){
                $scope.choiceTable.table.tr.forEach(function(tr){
                    if(tr.td && tr.index == trIndex){
                        tr.td.forEach(function(td){
                            if(td.index == tdIndex){
                                td.value = value;
                            }
                        });
                    }
                });
            }
        };

        //遍历表格的td，获取[deviceId,baseTypeId]集合
        function getDeviceIdAndBaseTypeId (trIndex,tdIndex){
            if($scope.choiceTable.table.tr){
                var arr = [];
                $scope.choiceTable.table.tr.forEach(function(tr){
                    if(tr.td && tr.index == trIndex){
                        tr.td.forEach(function(td){
                            if(td.index == tdIndex){
                                if(td.value.indexOf(".") != -1)
                                    arr = td.value.split(".");
                            }
                        });
                    }
                });
                return arr;
            }
            return [];
        };

        //编辑标题列数
        $scope.updRowNumberClick = function(){
            var input = $scope.languageJson.InputBox;
            $scope.inputList = [
                {message:input.ColNumber,inputValue:2}//"表格 列数:"
            ];
            inputMultiBoxDlg.$promise.then(inputMultiBoxDlg.show);

            $scope.ok = function(){
                if($scope.inputList == undefined || $scope.inputList[0].inputValue <= 0){
                    balert.show('danger',input.ErrorValue,3000);//'请输入表格列数，并且不能小于0!'
                    return;
                }
                var is = false;
                if($scope.choiceTable.table.tr){
                    $scope.choiceTable.table.tr.forEach(function(tr){
                        if(tr.type == "title") is = true;
                        var result = tr.td.length - parseInt($scope.inputList[0].inputValue);
                        if(result > 0){
                            var value = parseInt($scope.inputList[0].inputValue);
                            for(var i = 0;i < result; i ++){
                                tr.td.splice(value, 1);
                            }
                        }else if(result < 0){
                            for(var i = 0;i < -result; i ++){
                                tr.td.push({
                                    value:""
                                });
                            }
                        }
                    });
                }
                if(!is){
                    var tr = {
                        "type":"title",
                        "td": []
                    };
                    for(var i = 0;i < parseInt($scope.inputList[0].inputValue); i ++){
                        tr.td.push({
                            value:""
                        });
                    }
                    $scope.choiceTable.table.tr.splice(0,0,tr);
                }
                inputMultiBoxDlg.hide();
            };
        };

        //删除行
        $scope.delColsClick = function(tr){
            if($scope.choiceTable.table.tr){
                $scope.choiceTable.table.tr.forEach(function(item){
                    if(item.index == tr.index){
                        $scope.choiceTable.table.tr.splice($.inArray(item,$scope.choiceTable.table.tr),1);
                    }
                });
            }
        };

        //添加一行信号
        var bindingMultiSignalDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/bindingMultiSignal.html',
            show: false
        });
        $scope.addColsClick = function(){
            var bindSignal = $scope.languageJson.BindSignalBox;
            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                if(data && $scope.multi == undefined){
                    $scope.multi = {
                        type : 1,
                        selectedLabel : bindSignal.List,
                        availableLabel : bindSignal.Selected,
                        deviceId : data[0].id,
                        devices : data,
                        multiLabel : bindSignal.Batch,
                        submitLabel : bindSignal.Add
                    };
                }/*"信号列表" / "已选择" / "批量修改" / "保存"*/
                if(data) $scope.changeDevice($scope.multi.deviceId);
            });
            bindingMultiSignalDlg.$promise.then(bindingMultiSignalDlg.show);
            //重写方法
            $scope.changeDevice = function(id){
                baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                    $scope.multi.selected = data;
                });
                $scope.multi.selectedVisible = false;
                $scope.multi.availableVisible = true;
            };

            $scope.ok = function(){
                if($scope.multi.type == 1){
                    if($scope.multi.available == undefined || $scope.multi.available.length == 0){
                        balert.show('danger',bindSignal.SelectPrompt,3000);//'请勾选信号!'
                        return;
                    }
                    var tr = {
                        type : "signal",
                        td : []
                    };
                    $scope.multi.available.forEach(function(item){
                        tr.td.push({
                            value : item.value
                        });
                    });
                    $scope.choiceTable.table.tr.push(tr);
                }else{
                    if($scope.choiceTable.table.tr){
                        var count = $scope.choiceTable.table.tr[0].td.length;
                        var tr = {
                            type : "signal",
                            td : []
                        };
                        for(var i = 0;i < count;i ++){
                            tr.td.push({
                                value : ""
                            });
                        }
                        $scope.choiceTable.table.tr.push(tr);
                    }
                }
                bindingMultiSignalDlg.hide();
            };
        };

        $scope.getCheckbox = function(visible){
            if(visible == true || visible == 'true')
                return "√";
            else
                return "X";
        };

        //勾选 选择列表的数据
        $scope.checkboxSelected = function(signal){
            if($scope.multi.available == undefined) $scope.multi.available = [];
            if(signal.visible == true){
                signal.visible = false;
                $scope.multi.available.splice($.inArray(signal,$scope.multi.available),1);
            }else{
                signal.visible = true;
                $scope.multi.available.push(getAvailable(signal));
            }
        };

        function getAvailable(signal){
            var obj = {
                value : signal.deviceBaseTypeId +"."+signal.baseTypeId,
                visible : true
            };
            if($scope.multi.devices){
                $scope.multi.devices.forEach(function(item){
                    if(item.id == signal.deviceBaseTypeId){
                        obj.name = item.name+" . "+signal.name;
                    }
                });
            }
            return obj;
        }

        //全选 选择列表的数据
        $scope.allSelected = function(){
            if($scope.multi.selectedVisible == true) $scope.multi.selectedVisible = false;
            else $scope.multi.selectedVisible = true;

            if($scope.multi.available == undefined) $scope.multi.available = [];
            $scope.multi.selected.forEach(function(signal){
                if($scope.multi.selectedVisible){//全选
                    if(!signal.visible) $scope.multi.available.push(getAvailable(signal));
                }else{
                    $scope.multi.available.splice($.inArray(signal,$scope.multi.available),1);
                }
                signal.visible = $scope.multi.selectedVisible;
            });
        };

        //勾选 已选择列表的数据
        $scope.checkboxAvailable = function(signal){
            var dbs = signal.value.split(".");
            if($scope.multi.deviceId == dbs[0] && $scope.multi.selected){
                $scope.multi.selected.forEach(function(item){
                    if(item.baseTypeId == dbs[1]){
                        item.visible = false;
                    }
                });
            }
            $scope.multi.available.splice($.inArray(signal,$scope.multi.available),1);
        };

        //全去选 已选择列表的数据
        $scope.allAvailable = function(){
            if($scope.multi.available){
                $scope.multi.available.forEach(function(signal){
                    var dbs = signal.value.split(".");
                    $scope.multi.selected.forEach(function(item){
                        if(item.deviceBaseTypeId == dbs[0] && item.baseTypeId == dbs[1]){
                            item.visible = false;
                        }
                    });
                });
                $scope.multi.available = [];
                $scope.multi.availableVisible = true;
                $scope.multi.selectedVisible = false;
            }
        };

        //批处理  修改已选信号的设备编号
        $scope.changeBatchDevice = function(id){
            //$scope.multi.available  value:DiviceId.BaseTypeId  name:BaseTypeName
            var diviceName = "";
            if($scope.multi.devices){
                $scope.multi.devices.forEach(function(item){
                    if(item.id == id){
                        diviceName = item.name;
                    }
                });
            }

            baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                if(data){
                    data.forEach(function(item){
                        if($scope.multi.available){
                            $scope.multi.available.forEach(function(ava){
                                var dbs = ava.value.split(".");
                                if(item.baseTypeId == dbs[1]){
                                    ava.value = id+"."+dbs[1];
                                    ava.name = diviceName+" . "+item.name;
                                }
                            });
                        }
                    });
                }
            });
        };

        /************************** 表格组态 End ******************************************/

        /**************************  信号历史曲线表 Start  **********************************/
        var setHistoryPueDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/historyPueCharts.html',
            show: false
        });
        $scope.showHistoryChart = function(deviceId,baseTypeId,deviceName){
            var hisCurve = $scope.languageJson.Configuration.HisCurveBox;
            diagramService.GetSignalHistoryChart(deviceId,baseTypeId).then(function(data){
                if(data == undefined || data.datas.length == 0){
                    //"没有历史数据，请点击其他信号试试"
                    balert.show("danger", hisCurve.NotData,3000);
                    return;
                }
                if(data.category == 1){//模拟量
                    $scope.historyTitle = deviceName+" "+hisCurve.Title;//历史曲线
                    setHistoryPueDlg.$promise.then(setHistoryPueDlg.show);
                }

                $http.get("data/LineOrBarCharts.json").success(function(json) {
                    var sysStyle = localStorage.getItem("systemStyle");
                    var opt = data;
                    if(sysStyle == "White"){
                        json.title.textStyle.color = "#464952";
                        json.legend.textStyle.color = "#464952";
                        json.xAxis[0].axisLabel.textStyle.color = "#464952";
                        json.yAxis[0].axisLabel.textStyle.color = "#464952";
                    }

                    if(data.category == 1){
                        optionAnalogSignal(json,opt);//模拟量
                    }else{
                        //optionSwitchSignal(json,data);//开关量
                        //"开关量一天最大值没有意义，请点击其他信号试试"
                        balert.show("danger",hisCurve.SwitchPrompt,3000);
                        return;
                    }
                });
            });
        };

        function optionAnalogSignal(json,data){
            var chartOption = {};
            var ChartCfg = {
                ChartType : 'line',
                Y1Name : data.name+"("+data.unit+")"
            };

            var opt = json;
            opt.yAxis[0].name = ChartCfg.Y1Name;
            opt.yAxis[0].min = "auto";
            opt.yAxis[0].max = "auto";

            var series = {
                name : ChartCfg.Y1Name,
                type : ChartCfg.ChartType,
                data : [],
                itemStyle : {normal: {areaStyle: {type: "default"}}},
                markPoint : {
                    data : [
                        {type : "max", name: $scope.languageJson.Configuration.MaxVal},
                        {type : "min", name: $scope.languageJson.Configuration.MinVal}
                    ]
                }//"最大值" / "最小值"
            };

            opt.series.push(series);
            chartOption = opt;

            chartOption.series[0].data = data.datas;
            chartOption.xAxis[0].data = data.dates;
            chartOption.grid.y = 40;

            echarts.init($("#HistoryPue")[0]).setOption(chartOption, true);
        };

        function optionSwitchSignal(json,data){
            var chartOption = {};
            var ChartCfg = {
                ChartType : 'line',
                Y1Name : data.name
            };

            var opt = json;
            opt.yAxis[0].name = ChartCfg.Y1Name;
            opt.yAxis[0].min = "auto";
            opt.yAxis[0].max = data.yAxis != "" && data.yAxis.length > 0 ? data.yAxis.length : "auto";
            opt.yAxis[0].axisLabel.formatter = function (value) {
                var texts = [];
                if(data.yAxis != ""){
                    data.yAxis.forEach(function(item){
                        if(value == item.val)
                            texts.push(item.text);
                    });
                }
                return texts;
            };

            var series = {
                name : ChartCfg.Y1Name,
                type : ChartCfg.ChartType,
                data : [],
                itemStyle : {normal: {areaStyle: {type: "default"}}},
                markPoint : {
                    data : [
                        {type : "max", name: $scope.languageJson.Configuration.MaxVal},
                        {type : "min", name: $scope.languageJson.Configuration.MinVal}
                    ]
                }//"最大值" / "最小值"
            };

            opt.series.push(series);
            chartOption = opt;

            chartOption.series[0].data = data.datas;
            chartOption.xAxis[0].data = data.dates;
            chartOption.grid.x = 80;

            echarts.init($("#HistoryPue")[0]).setOption(chartOption, true);
        };
        /**************************  信号历史曲线表 End  **********************************/

        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            if ($scope.diagram) {
                diagramService.updateBindingData($scope.diagram).then(function(data) {
                    $scope.binddata = data;
                });
            }
            stop = $interval(function() {
                if ($scope.diagram) {
                    diagramService.updateBindingData($scope.diagram).then(function(data) {
                        $scope.binddata = data;
                    });
                }
            }, 3000);
        };

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
            if($scope.diagram)$scope.diagram.edit = false;
        });

        updatePageSetting();
        $scope.start();
    }
]);


nurseController.controller('diagramTabCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'deviceService', 'diagramService','ConfigureMoldService','$location','balert','$interval','alarmService',
    function($scope, $rootScope, $state, $stateParams, deviceService, diagramService,ConfigureMoldService,$location,balert,$interval,alarmService) {

        $scope.select = {};

        function setDiagramView(devId,parentId) {

            $scope.select.selectedDeviceId = parseInt(devId);

            var param = $stateParams.deviceBaseTypeId + '.' + devId;
            if($stateParams.deviceBaseTypeId.indexOf(".table") != -1)
                param = 'table.' + devId;

            var cfg = {};
            diagramService.getDiagramConfig(param).then(function(data) {
                if (data)
                {
                    cfg.diagram = data;

                    cfg.diagram.deviceBaseTypeId = $stateParams.deviceBaseTypeId;
                    cfg.diagram.deviceId = devId;
                    cfg.diagram.parentId = parentId;
                    $state.go($stateParams.diagramview, cfg);
                }
            });
        }

        /******************** 隐藏显示设备列表 Start *************************/
        $scope.isShowView = true;
        $scope.showViewClick = function(){
            $scope.isShowView = !$scope.isShowView;
        };

        function startOverflow(){
            $scope.startOverflow = false;
            if(localStorage.getItem("versions") == "IView"){
                if($scope.devices && $scope.devices.length > 6)
                    $scope.startOverflow = true;
            }else{
                if($scope.devices && $scope.devices.length > 8)
                    $scope.startOverflow = true;
            }
        }
        /******************** 隐藏显示设备列表 End *************************/

        $scope.changeDevice = function(url,value,parentId) {
            $scope.isShowView = true;
            $scope.stop();
            $scope.start();
            window.location = url;
            if(url.indexOf(".table") != -1){
                $stateParams.deviceBaseTypeId = url.replace(/[^0-9]/ig,'')+".table";
            }else if(!isNaN(url.replace(/[^0-9]/ig,'')))
                $stateParams.deviceBaseTypeId = url.replace(/[^0-9]/ig,'');
            if(value == '0')
                value = $stateParams.deviceBaseTypeId;

            setDiagramView(value,parentId);
            sessionStorage.setItem("currDeviceId",value);
        };

        function initPartConfigures(){
            var ver = localStorage.getItem("versions");
            var home = localStorage.getItem("loginHome");
            if(ver == "IView") {
                home = home == undefined ? "#/adevice/8890/adiagram" : home;
                localStorage.setItem("viewHome", "iview.html"+home);
            }else {
                home = home == undefined ? "#/adevice/1004/adiagram" : home;
                localStorage.setItem("viewHome", "iview.html"+home);
            }

            ConfigureMoldService.ParamConfigureMold($stateParams).then(function(data){
                $scope.devices = data;

                var index = -1;
                for(var i=0;i<data.length;i++){
                    if(sessionStorage.getItem("currDeviceId") === data[i].deviceId)
                        index = i;
                }


                //当前设备编号不存在，默认为第一个设备编号
                if(sessionStorage.getItem("currDeviceId") === undefined
                    || sessionStorage.getItem("currDeviceId") === null
                    || index === -1){
                    if($scope.devices.length > 0 && $scope.devices[0].deviceId > 0)
                        sessionStorage.setItem("currDeviceId",$scope.devices[0].deviceId);
                    else
                        sessionStorage.setItem("currDeviceId",$stateParams.deviceBaseTypeId);
                }

                if ($scope.devices.length > 0){
                    if($stateParams.deviceBaseTypeId != "" && $stateParams.deviceBaseTypeId != undefined){
                        $stateParams.deviceBaseTypeId = getDeviceBaseTypeId($scope.devices);

                        setDiagramView(sessionStorage.getItem("currDeviceId"),$scope.devices[0].parentId);
                    }else{
                        sessionStorage.setItem("currDeviceId",$stateParams.diagram.deviceId);
                        $stateParams.deviceBaseTypeId = getDeviceBaseTypeId($scope.devices);

                        setDiagramView(sessionStorage.getItem("currDeviceId"),$scope.devices[0].parentId);
                    }
                }
                //是否启用箭头
                startOverflow();
            });

        };
        initPartConfigures();

        function getDeviceBaseTypeId(devices){
            if(devices){
                var url = "";
                devices.forEach(function(item){
                    if(item.deviceId == sessionStorage.getItem("currDeviceId")){
                        url = item.configUrl;
                    }
                });
                if(url.indexOf("table") != -1)
                    return url.replace(/[^0-9]/ig,'')+".table";
                else
                    return url.replace(/[^0-9]/ig,'');
            }
            return undefined;
        }

        $scope.clickDeviceInfo = function(){
            if(!$stateParams.diagram || $stateParams.diagram.deviceBaseTypeId == $stateParams.diagram.deviceId || $stateParams.diagram.deviceId == undefined){
                balert.show('danger',$scope.languageJson.Configuration.DetailsPrompt,3000);/*'该页面不是设备页面!'*/
                return;
            }
            sessionStorage.setItem("referrer",window.location.href);
            $rootScope.parentId = $stateParams.diagram.parentId;
            $location.path('/deviceInfo/' + $stateParams.diagram.deviceId);
        };

        //加载遍历标签
        function loadSpan(data){
            $(".view-alarmCount").each(function(key,val){
                if(val.attributes["deviceid"]){
                    var deviceId = val.attributes["deviceid"].nodeValue;
                    var count = getAlarmCount(data,deviceId);
                    if(val){
                        if(count <= 0)
                            val.style = "display: none;";
                        else{
                            val.innerHTML = count;
                            val.style = "display: block;";
                        }
                    }
                }
            });
        }
        function getAlarmCount(data,deviceId){
            var count = 0;
            if(data){
                data.forEach(function(item){
                    if(item.deviceId === deviceId)
                        count ++;
                });
            }
            return count;
        }

        var stop;
        $scope.start = function() {
            stop = $interval(function() {
                if($scope.isShowFeature("PageAlarmHint")){
                    alarmService.updateActiveAlarmList().then(function(data) {
                        loadSpan(data);
                    });
                }
            },3000);
        };
        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        $scope.start();
    }
]);

nurseController.controller('homeCtrl', ['$scope', '$interval', 'alarmService',
    function($scope, $interval, alarmService) {

        var stop;
        /*$scope.curveData = [{
            y: "2006",
            a: 100,
            b: 90
        }, {
            y: "2007",
            a: 75,
            b: 65
        }, {
            y: "2008",
            a: 50,
            b: 40
        }, {
            y: "2009",
            a: 75,
            b: 65
        }, {
            y: "2010",
            a: 50,
            b: 40
        }, {
            y: "2011",
            a: 75,
            b: 65
        }, {
            y: "2012",
            a: 100,
            b: 90
        }];*/

        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {
                alarmService.updateAlarmCountByLevel($scope);
            }, 3000);
        };

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });

        $scope.start();
    }
]);

nurseController.controller('activeAlarmTableCtrl', [
    '$scope', '$filter', '$stateParams', '$modal', 'NgTableParams', 'alarmService', 'Exporter','$interval','$location',
    function($scope, $filter, $stateParams, $modal, NgTableParams, alarmService, Exporter, $interval,$location
        ) {
        var remarkDialog,simulateAlarmDlg;

        var stop;

        (function() {
            $scope.levelFilter = {};
            $scope.levelFilter.levelTip = false;
            $scope.levelFilter.levelCommon = false;
            $scope.levelFilter.levelImportant = false;
            $scope.levelFilter.levelUrgent = false;


            switch ($stateParams.alarmLevel) {
                case 0:
                    $scope.levelFilter.levelTip = true;
                    $scope.levelFilter.levelCommon = true;
                    $scope.levelFilter.levelImportant = true;
                    $scope.levelFilter.levelUrgent = true;
                    break;
                case 1:
                    $scope.levelFilter.levelTip = true;
                    break;
                case 2:
                    $scope.levelFilter.levelCommon = true;
                    break;
                case 3:
                    $scope.levelFilter.levelImportant = true;
                    break;
                case 4:
                    $scope.levelFilter.levelUrgent = true;
                    break;
                default:
                    break;
            }

            //reset to avoid next visit miss choice
            $stateParams.alarmLevel = 0;

            $scope.clickDeviceInfo = function(deviceId){
                sessionStorage.setItem("referrer",window.location.href);
                $location.path('/deviceInfo/' + deviceId);
            };

            //系统类型
            if(localStorage.getItem("systemName") == "Windows")
                $(".active-alarm-export").show();
        })();

        $scope.updateLevelFilter = function() {
            $scope.tableParams.reload();
        };

        $scope.checkTest = function(type){
            if(type == 'levelUrgent')
                $scope.levelFilter.levelUrgent = !$scope.levelFilter.levelUrgent;
            else if(type == 'levelImportant')
                $scope.levelFilter.levelImportant = !$scope.levelFilter.levelImportant;
            else if(type == 'levelCommon')
                $scope.levelFilter.levelCommon = !$scope.levelFilter.levelCommon;
            else if(type == 'levelTip')
                $scope.levelFilter.levelTip = !$scope.levelFilter.levelTip;

            $scope.tableParams.reload();
        };

        $scope.beginEndAlarm = function(uniqueId) {

            $scope.selectedAlarmUniqueId = uniqueId;
            //alert($scope.selectedAlarmUniqueId);

            remarkDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/alarmRemarkDialog.html',
                show: false
            });

            remarkDialog.$promise.then(remarkDialog.show);
        };

        $scope.endEndAlarm = function(note) {

            var logonId = localStorage.getItem("username");
            var param = "'" + $scope.selectedAlarmUniqueId + "'|" + logonId + "|" + note;

            alarmService.endAlarm(param).then(function(data) {
                $scope.tableParams.reload();
                remarkDialog.hide();
            });
        };

        $scope.filterLevelAlarms = function(data) {

            var farr = [];

            if ($scope.levelFilter.levelTip) farr.push(0);
            if ($scope.levelFilter.levelCommon) farr.push(1);
            if ($scope.levelFilter.levelImportant) farr.push(2);
            if ($scope.levelFilter.levelUrgent) farr.push(3);

            var ret = _.filter(data, function(alarm) {
                return _.contains(farr, parseInt(alarm.alarmLevel));
            });

            return ret;
        };

        function getExportList(data) {

            var resArray = [];

            resArray.push({
                startTime:$scope.languageJson.Alarm.StartTime,
                alarmContent:$scope.languageJson.Alarm.Content
            });/*"开始时间" "内容"*/

            data.forEach(function(element, index) {
                var alarm = {};
                alarm.startTime = element.startTime;
                alarm.alarmContent = element.alarmContent;
                resArray.push(alarm);
            });

            return resArray;
        }

        $scope.exportToHtml = function() {
            Exporter.toXls($scope.exportAlarms);
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            getData: function($defer, params) {
                // ajax request to api
                return alarmService.updateActiveAlarmList().then(function(data) {

                    var retData = params.filter() ?
                        $filter('filter')(data, params.filter()) : data;

                    var dat = $scope.filterLevelAlarms(retData);
                    $scope.exportAlarms = getExportList(dat);

                    params.total(dat.length); // recal. page nav controls

                    //当前页面大于最大页面数时，自动跳转到后一页
                    var totalPage = parseInt(params.total() / params.count()) + 1;
                    if(params.total() > 0 && params.page() > 1){
                        if(params.page() > totalPage){
                            params.page(totalPage);
                        }
                    }

                    //return dat;
                    var ret = dat.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    return ret;
                    //$defer.resolve(ret);
                });
            }
        });


        /***********************  模拟告警 Start **********************************/

        $scope.simulateAlarmClick = function(){
            simulateAlarmDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/simulateAlarm.html',
                show: false
            });
            simulateAlarmDlg.$promise.then(simulateAlarmDlg.show);
        };

        /***********************  模拟告警 End **********************************/

        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {
                $scope.tableParams.reload();
            }, 3000);
        };

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });

        $scope.start();
    }
]);


nurseController.controller( 'ConfigCtrl', ['$scope','$modal','stationService','monitorUnitService','equipmentTemplateService','equipmentService','portService','samplerUnitService','employeeService', 'balert','deviceService', 'notifyService','TemplateService','$compile','ConfigureMoldService','baseTypeService','$location','uploadService','bconfirm',
    function($scope, $modal, stationService, monitorUnitService, equipmentTemplateService, equipmentService,portService,samplerUnitService,employeeService, balert,deviceService, notifyService,TemplateService,$compile,ConfigureMoldService,baseTypeService,$location,uploadService,bconfirm) {

    //初始函数
    (function() {
        //配置分页基本参数
        $scope.paginationConf = {
            currentPage: 1,
            itemsPerPage: 10,
            pagesLength: 10,
            totalItems: 0,
            equipments: [],
            perPageOptions: [10, 20, 30, 40, 50],
            onChange: function(){
            }
        };

        $scope.equipmentItems = -1;

        //中心
        $scope.center = {};
        $scope.center.centerId = -1;
        $scope.center.centerIP = "";
        $scope.center.centerPort = -1;
        $scope.center.centerDSIP = "";
        $scope.center.Enable = false;

        //局站
        $scope.station = {};
        $scope.stationId = -1;
        $scope.station.stationName = "";
        $scope.station.contactId = -1;
        $scope.station.remark = "";
        $scope.station.employee = {};

        //监控单元
        $scope.monitorUnit = {};
        $scope.monitorUnit.MonitorUnitId = -1;

        //模板
        $scope.equipmentTemplate = {};
        $scope.equipmentTemplate.EquipmentTemplateId = -1;
        $scope.equipmentTemplate.EquipmentTemplateName = "";

        //设备
        $scope.equipment = {};
        $scope.equipment.EquipmentId = -1;
        $scope.equipment.EquipmentName = "";
        $scope.equipment.EquipmentType = -1;
        $scope.equipment.StationIArrayListd = -1;
        $scope.equipment.EquipmentTemplateId = -1;
        $scope.equipment.SamplerUnitId = -1;
        $scope.equipment.MonitorUnitId = -1;

        //端口
        $scope.portFlag = 0;
        $scope.port = {};
        $scope.port.PortId = -1;
        $scope.port.MonitorUnitId = -1;
        $scope.port.PortNo = -1;
        $scope.port.PortType = 0;
        $scope.port.Setting = "9600,n,8,1";
        $scope.port.PortTypeVar = {};

        //采集单元
        $scope.samplerUnit = {};
        $scope.samplerUnit.SamplerUnitId = -1;
        $scope.samplerUnit.PortId = -1;
        $scope.samplerUnit.MonitorUnitId = -1;
        $scope.samplerUnit.Address = 1;
        $scope.samplerUnit.DllPath = "";
        $scope.samplerUnit.SamplerId = -1;
        $scope.samplerUnit.SamplerType = -1;
        $scope.samplerUnit.SamplerUnitName = "";

        //获取端口类型
        notifyService.getDataItems("39").then(function(data) {
            var result = data;
            if(result == "fail to get dataItems")
            {
                alert($scope.languageJson.Config.Failed.Title);/*获取端口类型失败，请检查连接是否正常!*/
            }
            else
            {
                $scope.portTypes = parsePortTypes(data);
            }
        });

        //进入局站管理页面后，判断局站是否进行初始化，如果没有初始化，初始化局站
        stationService.initStationInfo().then(function(data) {
            var result = data;
            if(result == "fail to init station info")
            {
                balert.show('danger',$scope.languageJson.Config.Failed.Initialization,3000);/*'初始化局站失败，请检查连接是否正常!'*/
            }
            else
            {
                //获取局站数据
                stationService.getStationInfo().then(function(data) {
                    var result = data;
                    if(result == "fail to get station info")
                    {
                        balert.show('danger',$scope.languageJson.Config.Failed.Station,3000);/*'获取局站信息失败，请检查连接是否正常!'*/
                    }
                    else
                    {
                        getStation(result);

                        //获取中心配置
                        stationService.getCenterInfo().then(function(data) {
                            var result = data;
                            if(result == "fail to get center info")
                            {
                                balert.show('danger',$scope.languageJson.Config.Failed.Center,3000);/*'获取中心信息失败，请检查连接是否正常!'*/
                            }
                            else
                            {
                                getCenter(result);
                            }
                        });

                        //获取监控单元数据
                        monitorUnitService.getMonitorUnit($scope.stationId).then(function(data) {
                            $scope.monitorUnit = getMonitorUnit(data);
                        });

                        //获取人员信息
                        employeeService.getAllEmployees().then(function(data) {
                            $scope.employees = parseEmployees(data);

                            for(var i=0; i< $scope.employees.length; i++)
                            {
                                if($scope.employees[i].EmployeeId == $scope.station.contactId)
                                {
                                    $scope.station.employee = $scope.employees[i];
                                    break;
                                }
                            }
                        });
                    }
                });
            }
        });

        $scope.selectEvent = {};
        //初始化 模板列表
        equipmentTemplateService.getAllEquipmentTemplate().then(function(data) {
            $scope.equipmentTemplates = parseEquipmentTemplate(data);
            if($scope.equipmentTemplates[0])
                $scope.selectEvent.EquipmentTemplateId = $scope.equipmentTemplates[0].EquipmentTemplateId;
        });

        //初始化等级信息
        $scope.selectEventSever = {};
        TemplateService.getAllEventSeverity().then(function(data) {
            $scope.equipmentEvent = data;
            $scope.selectEventSever.EventSeverity = $scope.equipmentEvent[0].EventSeverity;
        });


        $scope.Template = {
            EquipmentCategory : [],
            Property : []
        };
        $scope.Signal = {
            SignalCategory : [],
            SignalType : [],
            ChannelType : [],
            DataType : []
        };
        $scope.Event = {
            EventCategory : [],
            StartType : [],
            EndType : [],
            EventSeverity : []
        };
        $scope.Control = {
            ControlCategory : [],
            ControlSeverity : [],
            CommandType : [],
            ControlType : [],
            DataType : []
        };
        $scope.seleBaseType={};
        function initTemplateDataItem(){
            TemplateService.GetDataItemByEntryId("7").then(function(data){
                $scope.Template.EquipmentCategory = data;
            });
            TemplateService.GetDataItemByEntryId("9").then(function(data){
                $scope.Template.Property = data;
            });
            TemplateService.GetEquipmentBaseType().then(function(data){
                $scope.Template.EquipmentBaseType = data;
            });
            TemplateService.GetDataItemByEntryId("17").then(function(data){
                $scope.Signal.SignalCategory = data;
            });
            TemplateService.GetDataItemByEntryId("18").then(function(data){
                $scope.Signal.SignalType = data;
            });
            TemplateService.GetDataItemByEntryId("22").then(function(data){
                $scope.Signal.ChannelType = data;
            });
            TemplateService.GetDataItemByEntryId("70").then(function(data){
                $scope.Signal.DataType = data;
            });

            TemplateService.GetDataItemByEntryId("24").then(function(data){
                $scope.Event.EventCategory = data;
            });
            TemplateService.GetDataItemByEntryId("25").then(function(data){
                $scope.Event.StartType = data;
            });
            TemplateService.GetDataItemByEntryId("26").then(function(data){
                $scope.Event.EndType = data;
            });
            TemplateService.GetDataItemByEntryId("23").then(function(data){
                $scope.Event.EventSeverity = data;
            });

            TemplateService.GetDataItemByEntryId("31").then(function(data){
                $scope.Control.ControlCategory = data;
            });
            TemplateService.GetDataItemByEntryId("28").then(function(data){
                $scope.Control.ControlSeverity = data;
            });
            TemplateService.GetDataItemByEntryId("32").then(function(data){
                $scope.Control.CommandType = data;
            });
            TemplateService.GetDataItemByEntryId("68").then(function(data){
                $scope.Control.ControlType = data;
            });
            TemplateService.GetDataItemByEntryId("70").then(function(data){
                $scope.Control.DataType = data;
            });
        };
        initTemplateDataItem();
    })();

    function parseEquipmentTemplate(data){
        if(data){
            data.forEach(function(item){
                if(item.SoName != undefined && item.SoName.indexOf(".") != -1){
                    var index = item.SoName.indexOf(".");
                    item.SoName = item.SoName.substring(0,index)+".so";
                }
            });
        }
        return data;
    }
    /******************************************    设备管理部分    ***************************************************/
    var addEquipmentDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/addEquipment.html',
        show: false
    });

    var templateDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/selectTemplate.html',
        show: false
    });

    var ioTemplateDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/selectIOTemplate.html',
        show: false
    });

    var updEquipmentDlg = $modal({
        scope: $scope,
        templateUrl: 'partials/updEquipment.html',
        show: false
    });

    var shieldEventDlg = $modal({
        scope: $scope,
        templateUrl: 'partials/eventShieldStatus.html',
        show: false
    });

    var templateListDlg = $modal({
        scope: $scope,
        templateUrl: 'partials/equipmentTemplates.html',
        show: false
    });

    $scope.addEquipmentClick = function() {

        //增加设备前初始化
        $scope.equipmentTemplate = {};
        $scope.equipment = {};
        $scope.port = {};
        $scope.samplerUnit = {};
        $scope.portType = undefined;
        $scope.portFlag = 0;

        addEquipmentDialog.$promise.then(addEquipmentDialog.show);
    };

    $scope.addIOEquipmentClick = function() {

        //增加设备前初始化
        $scope.equipmentTemplate = {};
        $scope.equipment = {};
        $scope.port = {};
        $scope.samplerUnit = {};

        //判断是否存在IO设备
        equipmentService.getIOEquipments($scope.stationId).then(function(data){
            //返回IO设备个数
            var result = data;
            if(result == "fail to get io equipments"){
                /*查看IO设备是否存在失败，请检查数据库连接是否正常*/
                balert.show('danger',$scope.languageJson.Config.Config.Check,3000);
            }else{
                var ioEquipments = data.length;
                if(ioEquipments > 0)
                {
                    balert.show('danger',$scope.languageJson.Config.Config.Already,3000);/*已存在IO设备，不允许重复增加!*/
                }
                else
                {
                    //插入IO设备
                    /*请确认是否增加IO设备?*/
                    bconfirm.show($scope,$scope.languageJson.Config.Config.Pease).then(function(data){
                        if(data){
                            InsertIOEquipment();
                        }
                    });
                }
            }
        });
    };

    //配置 => 配置管理 => 设备信息管理
    $scope.reLoadEquipmentConfigClick = function () {
        /*请确认是否执行配置生效?*/
        bconfirm.show($scope,$scope.languageJson.Config.Config.Whether).then(function(data){
            if(data){
                $scope.loading = true;
                equipmentService.reLoadEquipment($scope.stationId, $scope.station.stationName).then(function(data){
                    //删除完成后，返回设备个数
                    var result = data;
                    if(result == "fail to reload equipment")
                    {
                        balert.show('danger',$scope.languageJson.Config.Config.Sails,3000);/*执行配置生效失败，请检查连接是否正常！*/
                    }
                    else
                    {
                        balert.show('success',$scope.languageJson.Config.Config.Configuration,3000);/*'执行配置生效成功！'*/
                        $("#side-menu .sub-li").remove();
                        deviceService.getAllDevicesType().then();
                    }
                    $scope.loading = false;
                });
                //生成备份文件
                equipmentService.CreateConfigManager().then(function(data){});
            }
        });
    };

    $scope.viewEquipmentClick = function(id) {
        $scope.selectedEquipmentId = id;
        alert($scope.selectedEquipmentId);
    };

    $scope.removeEquipmentClick = function(id, name ,samplerUnitId) {
        $scope.selectedEquipmentId = id;
        $scope.selectedEquipmentName = name;

        bconfirm.show($scope,$scope.languageJson.Config.Confirms.Title + $scope.selectedEquipmentId + ")" + $scope.selectedEquipmentName + "?").then(function(data){
            if(data){
                equipmentService.deleteEquipment($scope.stationId, $scope.selectedEquipmentId, samplerUnitId).then(function(data) {
                    //删除完成后，返回设备个数
                    var result = data;
                    if(result == "fail to delete equipment")
                    {
                        balert.show('danger',$scope.languageJson.Config.Confirms.Deleting,3000);/*'删除设备失败，请检查连接是否正常!'*/
                    }
                    else
                    {
                        $scope.equipmentItems = parseInt(data);
                        $scope.paginationConf.totalItems = $scope.equipmentItems;
                        balert.show('success',$scope.languageJson.Config.Confirms.Successfully,3000);/*'删除设备成功!'*/
                    }
                });
            }
        });
    };

    function getEquipmentTemplateNameById(etid){
        var etname = "";
        if($scope.equipmentTemplates){
            $scope.equipmentTemplates.forEach(function(item){
                if(item.EquipmentTemplateId == etid)
                    etname = item.EquipmentTemplateName;
            });
        }
        return etname;
    }

    $scope.updateEquipmentClick = function(data){
        //var e = $scope.paginationConf.equipments;
        $scope.equipment = data;

        $scope.equipment.EquipmentTemplateName = getEquipmentTemplateNameById($scope.equipment.EquipmentTemplateId);
        portService.getDefaultPort(data.MonitorUnitId,data.PortNo).then(function(port){
            if(port.length > 0) {

                $scope.equipment.Setting = port[0].Setting;
                $scope.equipment.PortId = port[0].PortId;
                $scope.equipment.PortType = port[0].PortType;

                //是否有其他同端口的设备
                var isExist = isOtherPortExist(data.EquipmentId,port[0].PortNo);
                if(isExist) $scope.equipment.readonly = true;
                else $scope.equipment.readonly = false;

                samplerUnitService.getDefaultSamplerUnit(data.EquipmentTemplateId, port[0].PortId, port[0].PortNo, data.MonitorUnitId).then(function(unit) {
                    if(unit.length > 0) {
                        $scope.samplerUnit = unit[0];
                    }
                });
            }
        });
        updEquipmentDlg.$promise.then(updEquipmentDlg.show);
    };

    function isOtherPortExist(equipment,portNo){
        var is = false;
        if($scope.paginationConf && $scope.paginationConf.equipments){
            $scope.paginationConf.equipments.forEach(function(item){
                if(item.PortNo == portNo){
                    if(item.EquipmentId != equipment)
                        is = true;
                }
            });
        }
        return is;
    }

    $scope.changePortNo = function(newValue, oldValue){
        if(newValue == undefined || newValue == oldValue) return;
        portService.getDefaultPort($scope.equipment.MonitorUnitId, newValue).then(function(port){
            if(port.length > 0){
                $scope.equipment.Setting = port[0].Setting;
                $scope.equipment.PortId = port[0].PortId;
                $scope.equipment.PortType = port[0].PortType;

                if(port[0].PortId != -1) $scope.equipment.readonly = true;
                else $scope.equipment.readonly = false;

                samplerUnitService.getDefaultSamplerUnit($scope.equipment.EquipmentTemplateId, port[0].PortId, port[0].PortNo, $scope.equipment.MonitorUnitId).then(function(unit) {
                    if(unit.length > 0) {
                        $scope.samplerUnit = unit[0];
                        $scope.equipment.Address = unit[0].Address;
                    }
                });
            }
        });
    };

    $scope.updClick = function(){
        if($scope.equipment.EquipmentId == "" || $scope.equipment.EquipmentName == "" || $scope.equipment.PortNo == ""
            || $scope.equipment.PortType == "" || $scope.equipment.Setting == "" || $scope.equipment.Address == ""){
            balert.show('danger',$scope.languageJson.Config.Confirms.Device,3000);/*'设备信息均不能为空!'*/
            return;
        }
        equipmentService.checkEquipmentConfig($scope.equipment.EquipmentId,$scope.equipment.EquipmentName,
            $scope.equipment.PortNo,$scope.equipment.Address).then(function(result){
            if(result == "OK"){
                //添加端口
                portService.getInsertPort($scope.equipment).then(function(portId) {
                    if (portId == "fail to get insert port") {
                        balert.show('danger',$scope.languageJson.Config.Config.Failed,3000);/*'插入端口失败，请检查连接是否正常!'*/
                        return;
                    }else{
                        //添加采集单元
                        $scope.samplerUnit.PortId = parseInt(portId);
                        $scope.samplerUnit.Address = $scope.equipment.Address;
                        //修改so库
                        if($scope.equipment.DllPath != $scope.samplerUnit.DllPath){
                            $scope.samplerUnit.SamplerUnitId = -1;
                            $scope.samplerUnit.DllPath = $scope.equipment.DllPath;
                        }
                        samplerUnitService.getInsertSamplerUnit($scope.samplerUnit).then(function(units) {
                            if (units == "fail to get insert samplerUnit") {
                                balert.show('danger',$scope.languageJson.Config.Config.Connection,3000);/*'插入采集单元失败，请检查连接是否正常!'*/
                                return;
                            }else{
                                $scope.equipment.SamplerUnitId = parseInt(units);
                                //修改设备
                                equipmentService.updateEquipment($scope.equipment.EquipmentId,$scope.equipment.EquipmentName,$scope.equipment.Vendor,$scope.equipment.SamplerUnitId).then(function(data){
                                    if(data == "OK"){
                                        balert.show('success',$scope.languageJson.Config.Confirms.Modify,3000);/*'修改设备成功!'*/
                                        updEquipmentDlg.hide();
                                    }else{
                                        balert.show('danger',$scope.languageJson.Config.Confirms.Modifying,3000);/*'修改设备失败!'*/
                                    }
                                });
                            }
                        });
                    }
                });
            }else if(result == "Name Exists"){
                balert.show('danger',$scope.languageJson.Config.Confirms.Exists,3000);/*'设备名称已存在!'*/
                return;
            }else if(result == "Address Exists"){
                balert.show('danger',$scope.languageJson.Config.Confirms.Port,3000);/*'同端口的地址不能重复!'*/
                return;
            }
        });
    };

    //显示设备摸列表
    $scope.showTemplateListClick = function(templateId){
        if($scope.equipmentTemplates){
            $scope.equipmentTemplates.forEach(function(item){
                if(item.EquipmentTemplateId == templateId) {
                    $scope.Rebinding = item;

                    $scope.Rebinding.CategoryName = getCategoryName($scope.Rebinding.EquipmentCategory);
                    $scope.Rebinding.PropertyName = getPropertyName($scope.Rebinding.Property);
                }
            });
        }
        templateListDlg.$promise.then(templateListDlg.show);
    };
    $scope.changeRebinding = function(obj){
        $scope.Rebinding = angular.fromJson(obj);

        $scope.Rebinding.CategoryName = getCategoryName($scope.Rebinding.EquipmentCategory);
        $scope.Rebinding.PropertyName = getPropertyName($scope.Rebinding.Property);
    };
    function getCategoryName(category){
        var name = category;
        if($scope.Template.EquipmentCategory){
            $scope.Template.EquipmentCategory.forEach(function(item){
                if(item.ItemId == category){
                    if($scope.languageJson.Language == "English")
                        name = item.ItemAlias;
                    else
                        name = item.ItemValue;
                }
            });
        }
        return name;
    }
    function getPropertyName(property){
        var result = "";
        var name = "";
        var pros = property.split("/");
        if(pros){
            pros.forEach(function(pro){
                if($scope.Template.Property){
                    $scope.Template.Property.forEach(function(item){
                        if(pro == item.ItemId){
                            if($scope.languageJson.Language == "English")
                                name = item.ItemAlias;
                            else
                                name = item.ItemValue;
                        }
                    });
                }
                if(result == "")
                    result = name;
                else
                    result += "/"+name;
            });
        }
        return result;
    }

    //重新绑定模板
    $scope.rebindingClick = function(){
        var equipmentId = $scope.equipment.EquipmentId;
        var equipmentTemplateId = $scope.Rebinding.EquipmentTemplateId;
        $scope.equipment.DllPath = $scope.Rebinding.SoName;

        equipmentService.RebindingEquipmentTemplate(equipmentId,equipmentTemplateId).then(function(data){
            if(data == "OK"){
                balert.show('success',$scope.languageJson.Config.Confirms.Modify,3000);/*'修改设备成功!'*/
                $scope.equipment.EquipmentTemplateId = $scope.Rebinding.EquipmentTemplateId;
                $scope.equipment.EquipmentTemplateName = $scope.Rebinding.EquipmentTemplateName;
                templateListDlg.hide();
            }else{
                balert.show('danger',"["+data+"]"+$scope.languageJson.Config.Confirms.Modifying,3000);/*'修改设备失败!'*/
            }
        });
    };
    /******************************************   设备管理部分完成  **************************************************/

    /******************************************    局站管理部分    ***************************************************/
    $scope.saveStationConfigClick = function() {
        if ($scope.station.stationName === undefined ||
            $scope.station.contactId == -1) {
            //'局站信息不完整，请检查是否输入完整!'
            balert.show('danger',$scope.languageJson.Config.Stations.Input,3000);
            return;
        }
        $scope.loading = true;
        stationService.updateStationInfo($scope.stationId, $scope.station.stationName, $scope.station.contactId, $scope.station.remark).then(function(data) {
            if (data == "OK") {
                equipmentService.ReLoadFSU().then(function(data){
                    $scope.loading = false;
                    balert.show('success',$scope.languageJson.Config.Stations.Successfully,3000);//'保存局站配置成功！'
                });

            } else {
                //'保存局站配置失败！'
                balert.show('danger',$scope.languageJson.Config.Stations.Failed,3000);
            }
        });
    };

    $scope.resetStationConfigClick = function() {
        $scope.station = {};
    };

    function getStation(data) {

        data.forEach(function(element, index) {
            $scope.stationId = element.StationId;
            $scope.station.stationName = element.StationName;
            $scope.station.contactId = element.ContactId;
            $scope.station.remark = element.Description;
        });
    }

    function getMonitorUnit(data) {
        var mu = {};

        data.forEach(function(element, index) {
            mu.MonitorUnitId = element.MonitorUnitId;
        });

        return mu;
    }

    $scope.contactManChange = function(EmployeeId) {

        $scope.station.contactId = EmployeeId;
    };

    //解析Employee数据
    function parseEmployees(data) {

        var dataArray = [];

        data.forEach(function(element, index) {
            var employee = {};
            employee.EmployeeId = element.EmployeeId;
            employee.EmployeeName = element.EmployeeName;
            employee.Mobile = element.Mobile;
            employee.Email = element.Email;
            dataArray.push(employee);
        });

        return dataArray;
    }

    /******************************************   局站管理部分完成  **************************************************/

    /******************************************    增加设备部分    ***************************************************/

    $scope.selectTemplateClick = function() {

        equipmentTemplateService.getAllEquipmentTemplate().then(function(data) {
            $scope.equipmentTemplates = data;

            //初始化
            $scope.equipmentTemplate = {};
            $scope.equipment = {};
            $scope.port = {};
            $scope.samplerUnit = {};
            $scope.portFlag = 0;

            templateDialog.$promise.then(templateDialog.show);
        });

    };

    $scope.addClick = function() {
        //增加设备前校验输入是否正确
        //判断是否输入完成
        if($scope.equipment.EquipmentName == undefined)
        {
            balert.show('danger',$scope.languageJson.Config.Config.Enter,3000);/*请输入设备名称!*/
            return;
        }
        //检查名称长度是否超长
        if ($scope.equipment.EquipmentName.length > 128)
        {
            balert.show('danger',$scope.languageJson.Config.Config.Allowed,3000);/*设备名称长度不允许超过128位!*/
            return;
        }
        //检查端口、采集单元信息是否输入正确
        if (!PortAndSPUnitValidate($scope.monitorUnit.MonitorUnitId))
        {
            return;
        }
        //基本串口：检查串口号最大4
        /*if($scope.port.PortType == 1 && $scope.port.PortNo > 10)
        {
            balert.show('danger','串口类型，串口号不能超过10!',3000);
            return;
        }*/
        //虚拟端口：106端口只能配置成IO设备
        var isPortNo = false;
        if($scope.port.PortNo==106)
        {
            if($scope.equipment.EquipmentType!=1004){
                balert.show('danger',$scope.languageJson.Config.Config.Ports,3000);/*'106端口只能配置成IO设备!'*/
                return;
            }
        }
        //终端服务端口：已存在100端口,开放端口设置
        if($scope.port.PortType == 6){
            if($scope.port.PortNo < 100 || $scope.port.PortNo >= 201){
                balert.show('danger',$scope.languageJson.Config.Config.Network,3000);/*'网口的端口号只能在100-200之间!'*/
                return;
            }
        }
        //非基本串口，不可重复端口号
        if(parseInt($scope.port.PortType) != 1 && parseInt($scope.port.PortType) != 6){
            $scope.paginationConf.equipments.forEach(function(item,index){
                if(item.PortNo==$scope.port.PortNo){
                    isPortNo = true;
                }
            });
            if(isPortNo){
                balert.show('danger',$scope.languageJson.Config.Config.Repeated,3000);/*'端口已存在，不能重复!'*/
                return;
            }
        }

        //判断设备是否重名、端口的地址是否重复
        equipmentService.checkEquipmentConfig(0,$scope.equipment.EquipmentName,$scope.port.PortNo,$scope.samplerUnit.Address).then(function(result){
            if(result == "OK"){
                //新增设备
                AddEquipment($scope.monitorUnit.MonitorUnitId);
            }else if(result == "Name Exists"){
                balert.show('danger',$scope.languageJson.Config.Config.Exists,3000);/*'设备名称已存在!'*/
                return;
            }else if(result == "Address Exists"){
                balert.show('danger',$scope.languageJson.Config.Config.Script,3000);/*'同端口的地址不能重复!'*/
                return;
            }else{
                balert.show('danger',$scope.languageJson.Config.Config.Wrong,3000);/*'脚本错误，请尝试其他端口!'*/
                return;
            }
        });

        //判断设备是否重名
        /*equipmentService.getSameNameEquipment($scope.monitorUnit.MonitorUnitId, $scope.equipment.EquipmentName).then(function(data) {
            if (data == "Yes") {
                //有重名设备
                balert.show('danger','设备名称不允许相同，请重新输入!',3000);
            }
            else{
                //新增设备
                AddEquipment($scope.monitorUnit.MonitorUnitId);
            }
        });*/
    };

    function AddEquipment(monitorUnitId) {

        //增加端口
        portService.getInsertPort($scope.port).then(function(data) {
            if (data == "fail to get insert port") {
                //插入失败
                balert.show('danger',$scope.languageJson.Config.Config.Failed,3000);/*'插入端口失败，请检查连接是否正常!'*/
                return;
            }
            else{
                //插入成功，返回portId
                $scope.samplerUnit.PortId = parseInt(data);
                samplerUnitService.getInsertSamplerUnit($scope.samplerUnit).then(function(data) {
                    if (data == "fail to get insert samplerUnit") {
                        //插入失败
                        balert.show('danger',$scope.languageJson.Config.Config.Connection,3000);/*'插入采集单元失败，请检查连接是否正常!'*/
                        return;
                    }
                    else{
                        //插入成功，返回samplerUnitId
                        $scope.equipment.SamplerUnitId = parseInt(data);
                        $scope.equipment.StationId = $scope.stationId;
                        $scope.equipment.EquipmentTemplateId = $scope.equipmentTemplate.EquipmentTemplateId;
                        $scope.equipment.MonitorUnitId = $scope.monitorUnit.MonitorUnitId;

                        equipmentService.getInsertEquipment($scope.equipment).then(function(data) {
                            if (data == "fail to get insert equipment") {
                                //插入失败
                                balert.show('danger',$scope.languageJson.Config.Config.Faileds,3000);/*'插入设备失败，请检查连接是否正常!'*/
                                return;
                            }
                            else{
                                $scope.equipmentItems = parseInt(data);
                                $scope.paginationConf.totalItems = $scope.equipmentItems;

                                balert.show('success',$scope.languageJson.Config.Config.Equipments,3000);/*'增加设备成功!'*/
                                addEquipmentDialog.hide();
                            }
                        });
                    }
                });
            }
        });
    }

    //新增设备前校验端口和采集单元设置
    function PortAndSPUnitValidate(monitorUnitId) {

        if ($scope.port.PortNo == "" || $scope.port.PortNo == undefined)
        {
            balert.show('danger',$scope.languageJson.Config.Port.Title,3000);/*'请输入端口号'*/
            return false;
        }
         if (isNaN($scope.port.PortNo))
         {
            balert.show('danger',$scope.languageJson.Config.Port.Entered,3000);/*'端口号输入有误!'*/
            return false;
         }
         if ($scope.port.PortType == undefined)
         {
             balert.show('danger',$scope.languageJson.Config.Port.Select,3000);/*'请选择端口类型'*/
             return false;
         }
        if ($scope.port.Setting == "" || $scope.port.Setting == undefined)
        {
            balert.show('danger',$scope.languageJson.Config.Port.Communication,3000);/*'请输入通讯参数'*/
            return false;
        }
        if ($scope.samplerUnit.Address == "" || $scope.samplerUnit.Address == undefined)
        {
            balert.show('danger',$scope.languageJson.Config.Port.Address,3000);/*'请输入地址'*/
            return false;
        }
        if (isNaN($scope.samplerUnit.Address))
        {
            balert.show('danger',$scope.languageJson.Config.Port.Incorrectly,3000);/*'地址输入有误!'*/
            return false;
        }
        if ($scope.samplerUnit.DllPath == "" || $scope.samplerUnit.DllPath == undefined)
        {
            balert.show('danger',$scope.languageJson.Config.Port.SO,3000);/*'请输入SO库名!'*/
            return false;
        }

        return true;
    }

    $scope.portTypeChange = function(portTypeId) {
        //portTypeId => 1：串口、SNMP口：3、虚拟端口：5、网口：6、简单逻辑口：19

        $scope.port.PortType = portTypeId;
        var isPortNo = false;
        //SNMP端口
        if(portTypeId == 3){
            $(".address-text").html("");
            $(".address-input").hide();
        }else{
            $(".address-text").html($scope.languageJson.Config.Equipment.Address);
            $(".address-input").show();
        }

        //端口不重复
        if(portTypeId == 3 || portTypeId == 6 || portTypeId == 19){
            var nextNo = 1;
            if($scope.paginationConf && $scope.paginationConf.equipments){
                $scope.paginationConf.equipments.forEach(function(item){
                    if(item.PortNo != 106 && parseInt(item.PortNo) > nextNo)
                        nextNo = parseInt(item.PortNo);
                });
            }

            if($scope.port.PortNo < 100){
                if(portTypeId != 19){
                    if(nextNo == 105)
                        $scope.port.PortNo = 107;
                    else if(nextNo >= 100)
                        $scope.port.PortNo = nextNo + 1;
                    else
                        $scope.port.PortNo = 100;
                }else{
                    if(nextNo > 200)
                        $scope.port.PortNo = nextNo + 1;
                    else
                        $scope.port.PortNo = 201;
                }
            }
        }

        //通讯参数文本  与  IP参数文本  切换
        if(portTypeId != 1 && portTypeId != 5) {
            $(".param-text").html($scope.languageJson.Config.Equipment.IPParameters);
        }else
            $(".param-text").html($scope.languageJson.Config.Equipment.Parameters);
        //通讯参数值
        if(portTypeId == 1){//串口
            $scope.port.Setting = "9600,n,8,1";
        }else if(portTypeId == 3 || portTypeId == 6 || portTypeId == 19){//SNMP口：3、网口：6、简单逻辑口：19
            $scope.port.Setting = "127.0.0.1:7070";
        }else if(portTypeId == 5){//虚拟口
            $scope.port.Setting = "comm_io_dev.so";
        }
    };

    //调用获取模板个数
    /*function getEquipments(newValue, oldValue) {
        if(newValue != undefined && newValue != -1) {
            equipmentService.getAllEquipment().then(function (data) {
                $scope.paginationConf.equipments = data;
                $scope.paginationConf.totalItems = data.length;
            });
        }
    };

    $scope.$watch(function() {

        var newValue = $scope.equipmentItems;
        return newValue;

    }, getEquipments);*/

    /******************************************   增加设备部分完成  **************************************************/

    /******************************************   增加IO设备部分   ***************************************************/
    function InsertIOEquipment() {

        //第一步：获取IO模板
        equipmentTemplateService.getIOEquipmentTemplates().then(function(data) {

            var ioEquipmentTemplateId = -1;
            var result = data;

            if(result == "fail to get io equipmentTemplates")
            {
                balert.show('danger',$scope.languageJson.Config.Port.Failed,3000);/*'获取IO模板失败，请检查数据库连接是否正常!'*/
                return;
            }
            else {
                //获取IO模板成功
                $scope.ioEquipmentTemplates = data;

                //第二步：获取IO模板ID
                if ($scope.ioEquipmentTemplates.length <= 0) {
                    //没有IO模板
                    balert.show('danger',$scope.languageJson.Config.Port.Entereds, 3000);/*'没有找到IO模板，请在协议管理中增加IO模板!'*/
                    return;
                }
                else if ($scope.ioEquipmentTemplates.length > 1) {
                    //存在多个IO模板，需要弹出对话框供用户选择
                    $scope.selectedIOEquipmentTemplateId = -1;

                    ioTemplateDialog.$promise.then(ioTemplateDialog.show);
                    return;
                }
                else {
                    ioEquipmentTemplateId = $scope.ioEquipmentTemplates[0].EquipmentTemplateId;
                }
            }

            //第三步：增加IO设备
            AddIOEquipment(ioEquipmentTemplateId);
        });
    }

    function AddIOEquipment(equipmentTemplateId){
        //获取所选模板
        equipmentTemplateService.getEquipmentTemplate(equipmentTemplateId).then(function(data) {
            $scope.equipmentTemplate = getEquipmentTemplate(data);

            //获取默认端口
            portService.getDefaultPort($scope.monitorUnit.MonitorUnitId, 106).then(function(data) {
                $scope.port = getPort(data);

                //获取默认采集单元
                samplerUnitService.getDefaultSamplerUnit($scope.equipmentTemplate.EquipmentTemplateId, $scope.port.PortId, $scope.port.PortNo, $scope.monitorUnit.MonitorUnitId).then(function(data) {
                    $scope.samplerUnit = getSamplerUnit(data);

                    //获取默认设备
                    equipmentService.getDefaultEquipment($scope.monitorUnit.MonitorUnitId, $scope.equipmentTemplate.EquipmentTemplateId).then(function(data) {
                        $scope.equipment = getEquipment(data);

                        AddEquipment($scope.monitorUnit.MonitorUnitId);
                    });
                });
            });
        });
    }

    $scope.selectIOEquipmentTemplateId = function(equipmentTemplateId) {
        $scope.selectedIOTemplateId = equipmentTemplateId;
    };

    $scope.selectIO = function() {

        if($scope.selectedIOTemplateId == undefined)
        {
            balert.show('danger',$scope.languageJson.Select.Please,3000);/*请选择模板!*/
            return;
        }

        AddIOEquipment($scope.selectedIOTemplateId);

        ioTemplateDialog.hide();
    };

    /****************************************  增加IO设备部分完成   **************************************************/

    /****************************************  增加自检测设备 Start   **************************************************/
    var hostEquipmentDlg = $modal({
        scope: $scope,
        templateUrl: 'partials/selectHostTemplate.html',
        show: false
    });
    //添加自诊断设备按钮
    $scope.addHostEquipmentClick = function(){
        equipmentService.getHostEquipments($scope.stationId).then(function(data){
            var result = data;
            if(result == "fail to get io equipments"){
                /*查看自诊断设备是否存在失败，请检查数据库连接是否正常*/
                balert.show('danger',$scope.languageJson.Config.AddHost.GetErrorPrompt,3000);
            }else{
                var equipments = data.length;
                if(equipments > 0)
                {
                    balert.show('danger',$scope.languageJson.Config.AddHost.ExistPrompt,3000);/*已存在自诊断设备，不允许重复增加!*/
                }
                else
                {
                    //插入IO设备
                    /*请确认是否增加自诊断设备?*/
                    bconfirm.show($scope,$scope.languageJson.Config.AddHost.SelectPrompt).then(function(data){
                        if(data){
                            InsertHostEquipment();
                        }
                    });
                }
            }
        });
    };

    function InsertHostEquipment() {

        //第一步：获取IO模板
        equipmentTemplateService.getHostEquipmentTemplates().then(function(data) {

            var hostEquipmentTemplateId = -1;
            var result = data;

            if(result == "fail to get io equipmentTemplates")
            {
                balert.show('danger',$scope.languageJson.Config.Port.Failed,3000);/*'获取IO模板失败，请检查数据库连接是否正常!'*/
                return;
            }else {
                //获取自诊断模板成功
                $scope.hostEquipmentTemplates = data;

                //第二步：获取自诊断模板ID
                if ($scope.hostEquipmentTemplates.length <= 0) {
                    //没有自诊断模板
                    balert.show('danger',$scope.languageJson.Config.AddHost.NoExistPrompt, 3000);/*'没有找到自诊断模板，请在协议管理中增加自诊断模板!'*/
                    return;
                }else if ($scope.hostEquipmentTemplates.length > 1) {
                    //存在多个自诊断模板，需要弹出对话框供用户选择
                    $scope.selectedHostTemplateId = undefined;

                    hostEquipmentDlg.$promise.then(hostEquipmentDlg.show);
                    return;
                }else {
                    hostEquipmentTemplateId = $scope.hostEquipmentTemplates[0].EquipmentTemplateId;
                }
            }

            //第三步：增加自诊断设备
            AddHostEquipment(hostEquipmentTemplateId);
        });
    }

    $scope.selectHostEquipmentTemplateId = function(equipmentTemplateId) {
        $scope.selectedHostTemplateId = equipmentTemplateId;
    };

    $scope.selectHost = function() {

        if($scope.selectedHostTemplateId == undefined)
        {
            balert.show('danger',$scope.languageJson.Select.Please,3000);/*请选择模板!*/
            return;
        }

        AddHostEquipment($scope.selectedHostTemplateId);

        hostEquipmentDlg.hide();
    };

    function AddHostEquipment(equipmentTemplateId){
        //获取所选模板
        equipmentTemplateService.getEquipmentTemplate(equipmentTemplateId).then(function(data) {
            $scope.equipmentTemplate = getEquipmentTemplate(data);

            //获取默认端口
            portService.getDefaultPort($scope.monitorUnit.MonitorUnitId, 31).then(function(data) {
                $scope.port = getPort(data);

                //获取默认采集单元
                samplerUnitService.getDefaultSamplerUnit($scope.equipmentTemplate.EquipmentTemplateId, $scope.port.PortId, $scope.port.PortNo, $scope.monitorUnit.MonitorUnitId).then(function(data) {
                    $scope.samplerUnit = getSamplerUnit(data);

                    //获取默认设备
                    equipmentService.getDefaultEquipment($scope.monitorUnit.MonitorUnitId, $scope.equipmentTemplate.EquipmentTemplateId).then(function(data) {
                        $scope.equipment = getEquipment(data);

                        AddEquipment($scope.monitorUnit.MonitorUnitId);
                    });
                });
            });
        });
    }
    /****************************************  增加自检测设备 End   **************************************************/

    /******************************************    端口变化部分    ***************************************************/
    //解析端口类型数据
    function parsePortTypes(data) {

        var dataArray = [];
        var lan = $scope.languageJson.Language;
        data.forEach(function(element, index) {
            //if (element.ItemId == 1 || element.ItemId == 5 || element.ItemId == 6)
            if (element.ItemId == 1 ||  element.ItemId == 5 ||  element.ItemId == 6 || element.ItemId == 3 || element.ItemId == 19)
            {
                //只保留串口和网口
                var portType = {};
                portType.PortTypeId = element.ItemId;
                if(lan == "Chinese")
                    portType.PortTypeValue = element.ItemValue;
                else
                    portType.PortTypeValue = element.ItemAlias;
                dataArray.push(portType);
            }
        });

        return dataArray;
    }


    //侦听端口修改
    function portNoChanged(newValue, oldValue) {

        if($scope.portFlag == 1 && oldValue != undefined && newValue != "")
        {
            //1、判断端口输入是否正确
            if (isNaN($scope.port.PortNo))
            {
                balert.show('danger',$scope.languageJson.Config.Port.Port,3000);/*'端口号输入有误!'*/
                return;
            }

            //2、获取端口Id，判断是否已存在端口
            portService.getDefaultPort($scope.monitorUnit.MonitorUnitId, $scope.port.PortNo).then(function(data) {
                $scope.port = getPort(data);

                for(var i=0; i< $scope.portTypes.length; i++)
                {
                    if($scope.portTypes[i].PortTypeId == $scope.port.PortType)
                    {
                        $scope.port.PortTypeVar = $scope.portTypes[i];
                        break;
                    }
                }
                //获取默认采集单元
                samplerUnitService.getDefaultSamplerUnit($scope.equipmentTemplate.EquipmentTemplateId, $scope.port.PortId, $scope.port.PortNo, $scope.monitorUnit.MonitorUnitId).then(function(data) {
                    $scope.samplerUnit = getSamplerUnit(data);
                });
            });
        }
    };

    $scope.$watch(function() {

        var newValue = $scope.port.PortNo;
        return newValue;

    }, portNoChanged);


    //侦听端口修改
    $scope.$watch(function() {
        var newValue = $scope.equipment.PortNo;
        return newValue;
    }, $scope.changePortNo);
    /******************************************   端口变化部分完成  **************************************************/

    /******************************************    选择协议部分    ***************************************************/

    $scope.selectEquipmentTemplateId = function(equipmentTemplateId) {
        $scope.selectedTemplateId = equipmentTemplateId;
    };

    $scope.select = function() {

        if($scope.selectedTemplateId == undefined)
        {
            balert.show('danger',$scope.languageJson.Select.Please,3000);/*请选择模板!*/
            return;
        }

        //获取所选模板
        equipmentTemplateService.getEquipmentTemplate($scope.selectedTemplateId).then(function(data) {
            $scope.equipmentTemplate = getEquipmentTemplate(data);

            //获取默认设备名
            equipmentService.getDefaultEquipment($scope.monitorUnit.MonitorUnitId, $scope.equipmentTemplate.EquipmentTemplateId).then(function(data) {
                $scope.equipment = getEquipment(data);
            });

            //获取默认端口
            portService.getDefaultPort($scope.monitorUnit.MonitorUnitId, 1).then(function(data) {
                $scope.port = getPort(data);
                $scope.portFlag = 1;

                for(var i=0; i< $scope.portTypes.length; i++)
                {
                    if($scope.portTypes[i].PortTypeId == $scope.port.PortType)
                    {
                        $scope.port.PortTypeVar = $scope.portTypes[i];
                        break;
                    }
                }
                //获取默认采集单元
                samplerUnitService.getDefaultSamplerUnit($scope.equipmentTemplate.EquipmentTemplateId, $scope.port.PortId, $scope.port.PortNo, $scope.monitorUnit.MonitorUnitId).then(function(data) {
                    $scope.samplerUnit = getSamplerUnit(data);
                });
            });
        });

        $scope.selectedTemplateId = undefined;
        templateDialog.hide();
    };

    function getEquipmentTemplate(data) {
        var template = {};

        data.forEach(function(element, index) {
            template.EquipmentTemplateId = element.EquipmentTemplateId;
            template.EquipmentTemplateName = element.EquipmentTemplateName;
        });

        return template;
    }

    function getEquipment(data) {
        var equipment = {};

        data.forEach(function(element, index) {
            equipment.EquipmentId = element.EquipmentId;
            equipment.EquipmentName = element.EquipmentName;
            equipment.EquipmentType = element.EquipmentType;
        });

        return equipment;
    }

    function getPort(data) {
        var port = {};

        data.forEach(function(element, index) {
            port.PortId = element.PortId;
            port.MonitorUnitId = element.MonitorUnitId;
            port.PortName = element.PortName;
            port.PortNo = element.PortNo;
            port.PortType = element.PortType;
            port.Setting = element.Setting;
        });

        return port;
    }

    function getSamplerUnit(data) {
        var samplerUnit = {};

        data.forEach(function(element, index) {
            samplerUnit.SamplerUnitId = element.SamplerUnitId;
            samplerUnit.PortId = element.PortId;
            samplerUnit.MonitorUnitId = element.MonitorUnitId;
            samplerUnit.Address = element.Address;
            samplerUnit.DllPath = element.DllPath;
            samplerUnit.SamplerId = element.SamplerId;
            samplerUnit.SamplerType = element.SamplerType;
            samplerUnit.SamplerUnitName = element.SamplerUnitName;
        });

        return samplerUnit;
    }

    /******************************************   选择协议部分完成  **************************************************/


    /****************************************   中心信息管理部分开始  ************************************************/

    $scope.saveCenterConfigClick = function() {
        if ($scope.center.centerIP === undefined || $scope.center.centerDSIP === undefined ||
            $scope.center.centerPort == -1 || $scope.center.centerPort == undefined) {
            balert.show('danger',$scope.languageJson.Config.Room.The,3000);/*中心信息不完整，请检查是否输入完整!*/
            return;
        }
        $scope.loading = true;
        stationService.updateCenterInfo($scope.center.centerId, $scope.center.centerIP, $scope.center.centerPort, $scope.center.centerDSIP, $scope.center.Enable).then(function(data) {
            if (data == "OK") {
                equipmentService.ReLoadFSU().then(function(data){
                    $scope.loading = false;
                    balert.show('success',$scope.languageJson.Config.Room.Center,3000);/*'保存中心配置成功！'*/
                });
            } else {
                balert.show('danger',$scope.languageJson.Config.Room.Saves,3000);/*'保存中心配置失败！'*/
            }
        });
    };

    $scope.resetCenterConfigClick = function() {
        $scope.center = {};
    };

    $scope.selectEnable = function() {
        var a = $scope.center.Enable;
    };

    function getCenter(data) {

        data.forEach(function(element, index) {
            $scope.center.centerId = element.CenterId;
            $scope.center.centerIP = element.CenterIP;
            $scope.center.centerDSIP = element.CenterDSIP;
            $scope.center.centerPort = element.CenterPort;
            if(element.Enable == "true")
            {
                $scope.center.Enable = true;
            }
            else
            {
                $scope.center.Enable = false;
            }

        });
    }

    /****************************************   中心信息管理部分完成  ************************************************/

    /****************************************   模板管理 Start  ************************************************/
    //事件
    $scope.event={};

    var SignalSetterDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/SignalSetter.html',
        show: false
    });
    var EventSetterDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/EventSetter.html',
        show: false
    });
    var ControlSetterDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/ControlSetter.html',
        show: false
    });
    var ConfirmBoxDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/confirmBox.html',
        show: false
    });
    var BindingMeaningsDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/bindingMeanings.html',
        show: false
    });
    var BindingConditionDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/bindingCondition.html',
        show: false
    });
    var  ModifyTemplateDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/ModifyTemplate.html',
        show: false
    });
    var SignalBasetypeDialog=$modal({
        scope: $scope,
        templateUrl: 'partials/SignalBasetype.html',
        show: false
    });
    var EventBasetypeDialog=$modal({
        scope: $scope,
        templateUrl: 'partials/EventBasetype.html',
        show: false
    });
    var ControlBasetypeDialog=$modal({
        scope: $scope,
        templateUrl: 'partials/ControlBasetype.html',
        show: false
    });
    //排序
    $scope.sortingOrder = undefined;
    $scope.reverse = false;
    $scope.SortBy = function(newSortingOrder){
        if ($scope.sortingOrder == newSortingOrder){
            $scope.reverse = !$scope.reverse;
        }
        $scope.sortingOrder = newSortingOrder;
        // 遍历
        $('th i').each(function(){
            // 删除其他箭头样式
            $(this).removeClass("fa-chevron-down");
            $(this).removeClass("fa-chevron-up");
        });
        if ($scope.reverse){
            $('th.'+newSortingOrder+' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }else{
            $('th.'+newSortingOrder+' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        }

    };
    $scope.SortByChannelNo = function(newSortingOrder){
        $scope.SignalList.forEach(function(item){
            if(parseInt(item.ChannelNo) < 10 && parseInt(item.ChannelNo) > 0)
                item.No = "1000"+item.ChannelNo;
            else if(parseInt(item.ChannelNo) < 100 && parseInt(item.ChannelNo) > 0)
                item.No = "100"+item.ChannelNo;
            else if(parseInt(item.ChannelNo) < 1000 && parseInt(item.ChannelNo) > 0)
                item.No = "10"+item.ChannelNo;
            else if(parseInt(item.ChannelNo) < 10000 && parseInt(item.ChannelNo) > 0)
                item.No = "1"+item.ChannelNo;
            else
                item.No = item.ChannelNo;
        });
        $scope.reverse = !$scope.reverse;
        $scope.sortingOrder = "No";
        // 遍历
        $('th i').each(function(){
            // 删除其他箭头样式
            $(this).removeClass("fa-chevron-down");
            $(this).removeClass("fa-chevron-up");
        });
        if ($scope.reverse){
            $('th.'+newSortingOrder+' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }else{
            $('th.'+newSortingOrder+' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        }
    };

    //修改模版
    $scope.UpdateEquipmentTemplateClick = function(){
        $scope.equipmentTemplates.forEach(function(item){
            if(item.EquipmentTemplateId == $scope.selectEvent.EquipmentTemplateId){
                $scope.UpdateTemplate = item;
                ModifyTemplateDialog.$promise.then(ModifyTemplateDialog.show);
                checkoutProperty($scope.UpdateTemplate.Property);
                return;
            }
        });
    };

    function checkoutProperty(data){
        var d = data.split("/");
        if(data)
            $scope.UpdateTemplate.Property = data;
        else
            $scope.UpdateTemplate.Property = "";
        if($scope.Template.Property)
            $scope.Template.Property.forEach(function(item){
                item.isChecked = false;
                var str = [];
                d.forEach(function(pro){
                    if(pro == item.ItemId){
                        item.isChecked = true;
                    }
                });
            });
    };

    $scope.ClickProperty = function(id){
        if($scope.Template.Property)
            $scope.Template.Property.forEach(function(item){
                if(item.ItemId == id){
                    if(!item.isChecked){
                        item.isChecked = true;
                        $scope.UpdateTemplate.Property = sortProperty($scope.UpdateTemplate.Property,id,true);
                    }else{
                        item.isChecked = false;
                        $scope.UpdateTemplate.Property = sortProperty($scope.UpdateTemplate.Property,id,false);
                    }
                }
            });
    };

    //region 导出协议模板
    $scope.ExportProtocol = function(templateId){
        $scope.loading = true;
        TemplateService.ExportProtocol(templateId).then(function(data){
            console.log(data);
            $scope.loading = false;
        });
    };
    //endregion

    //排序
    function sortProperty(str,pro,isAdd){
        var result = "";
        if(isAdd){//添加
            if(str == "" || str == undefined) result = pro;
            else{
                str = str+"/"+pro;
                var arr = str.split("/");
                arr = arr.sort();
                for(var i = 0;i < arr.length;i++){
                    if(result == "")
                        result += arr[i];
                    else
                        result += "/"+arr[i];
                }
            }
        }else{//删除
            var arr = str.split("/");
            for(var i = 0;i < arr.length;i++){
                if(arr[i] == pro) continue;
                if(result == "")
                    result += arr[i];
                else
                    result += "/"+arr[i];
            }
        }
        return result;
    };

    //设备模板属性
    $scope.isShowProperty = false;
    $scope.showProperty = function(){
        //$("#myProperty").show();
        $("#myProperty").css("display","block");
        $scope.isShowProperty = true;
    };
    $(function() {
        $(document).click(function(e){
            var myDiv = $("#myProperty");
            if(myDiv.css("display") == "block" && $scope.isShowProperty == false){
                //$("#myProperty").hide();
                $("#myProperty").css("display","none");
            }
            $scope.isShowProperty = false;
        });
    });

    $scope.SaveEquipmentTemplate=function(){
        var is = false;
        $scope.equipmentTemplates.forEach(function(item){
            if($scope.UpdateTemplate.EquipmentTemplateId != item.EquipmentTemplateId &&
                $scope.UpdateTemplate.EquipmentTemplateName == item.EquipmentTemplateName){
                is = true;
            }
        });
        if(is){
            balert.show('danger',$scope.languageJson.Config.Templatenames.Title,3000);/*'模板名称不能相同！'*/
            return;
        }
        if($scope.UpdateTemplate.EquipmentTemplateName== "" || $scope.UpdateTemplate.EquipmentTemplateName==undefined){
            balert.show('danger',$scope.languageJson.Config.Templatenames.Cannot,3000);/*'模板名称不能为空！'*/
            return;
        }
        if($scope.UpdateTemplate.EquipmentCategory== "" || $scope.UpdateTemplate.EquipmentCategory==undefined){
            balert.show('danger',$scope.languageJson.Config.Templatenames.Type,3000);/*'类型不能为空！'*/
            return;
        }
        if($scope.UpdateTemplate.EquipmentBaseType== "" || $scope.UpdateTemplate.EquipmentBaseType==undefined){
            balert.show('danger',$scope.languageJson.Config.Templatenames.Empty,3000);/*'设备基类不能为空！'*/
            return;
        }

        TemplateService.SaveEquipmentTemplate($scope.UpdateTemplate).then(function(data){
            if(data=="SUCCESS"){
                balert.show('success',$scope.languageJson.Config.Templatenames.Successfully,3000);/*'修改成功！'*/
                ModifyTemplateDialog.hide();
            }
            else
                balert.show('danger',$scope.languageJson.Config.Templatenames.Fail,3000);/*'修改失败！'*/
        });
    };
    //获取事件信息
    $scope.selectEventClick= function(){
        document.querySelector("#rollBtn").style.display = "block";
        if($scope.selectEvent.EquipmentTemplateId == undefined){
            balert.show('danger',$scope.languageJson.Config.Templatenames.Please,3000);/*'请选择设备模板!'*/
            return;
        }

        //遍历选中的模板设备编号
        $scope.equipmentTemplates.forEach(function(item){
            if(item.EquipmentTemplateId == $scope.selectEvent.EquipmentTemplateId)
                $scope.selectEvent.EquipmentBaseType = item.EquipmentBaseType;
        });

        TemplateService.GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(data){
            TemplateService.GetSignalMeaningsByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(datas){
                $scope.SignalMeaningsList = datas;
                $scope.SignalList = parseSignalList(data,datas);

                GetEventByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);

                GetControlByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
            });
        });
    };
    //查询信号
    function GetSignalByEquipmentTemplateId(EquipmentTemplateId){
        TemplateService.GetSignalByEquipmentTemplateId(EquipmentTemplateId).then(function(data){
            TemplateService.GetSignalMeaningsByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(datas){
                $scope.SignalMeaningsList = datas;
                $scope.SignalList = parseSignalList(data,datas);
            });
        });
    };
    //查询事件
    function GetEventByEquipmentTemplateId(EquipmentTemplateId){
        TemplateService.GetEventByEquipmentTemplateId(EquipmentTemplateId).then(function(data){
            TemplateService.GetEventConditionByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(datas){
                $scope.EventConditionList = datas;
                $scope.EventList = parseEventList(data,datas);
            });
        });
    };
    //查询控制
    function GetControlByEquipmentTemplateId(EquipmentTemplateId){
        TemplateService.GetControlByEquipmentTemplateId(EquipmentTemplateId).then(function(data){
            TemplateService.GetControlMeaningsByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(datas){
                $scope.ControlMeaningsList = datas;
                $scope.ControlList = parseControlList(data,datas);
            });
        });
    };

    function parseSignalList(data,datas){
        data.forEach(function(item){
            $scope.Signal.SignalCategory.forEach(function(es){
                if(item.SignalCategory == es.ItemId){
                    item.SignalCategoryName = getLanguageItem(es);
                }
            });
            $scope.Signal.ChannelType.forEach(function(es){
                if(item.ChannelType == es.ItemId){
                    item.ChannelTypeName = getLanguageItem(es);
                }
            });
            $scope.Signal.DataType.forEach(function(es){
                if(item.DataType == es.ItemId){
                    item.DataTypeName = getLanguageItem(es);
                }
            });
            if(item.Enable == 'true' || item.Visible == 'true') item.IsOpen = true;
            else item.IsOpen = false;

            if(datas){
                item.DataMeanings = [];
                datas.forEach(function(sm){
                    if(item.SignalId == sm.SignalId){
                        if(item.Meanings == undefined){
                            item.Meanings = sm.Meanings;
                        }else{
                            item.Meanings += "/"+sm.Meanings;
                        }
                        item.DataMeanings.push(sm);
                    }
                });
            }
        });
        return data;
    };

    function parseEventList(data,datas){
        data.forEach(function(item){
            $scope.Event.EventCategory.forEach(function(es){
                if(item.EventCategory == es.ItemId){
                    item.EventCategoryName = getLanguageItem(es);
                }
            });
            $scope.Event.StartType.forEach(function(es){
                if(item.StartType == es.ItemId){
                    item.StartTypeName = getLanguageItem(es);
                }
            });
            $scope.Event.EndType.forEach(function(es){
                if(item.EndType == es.ItemId){
                    item.EndTypeName = getLanguageItem(es);
                }
            });
            if(item.Enable == 'true' || item.Visible == 'true') item.IsOpen = true;
            else item.IsOpen = false;

            if(datas){
                item.EventCondition = [];
                datas.forEach(function(ec){
                    if(item.EventId == ec.EventId){
                        if(item.EventSeverity == undefined){
                            item.EventSeverity = ec.EventSeverity;
                            item.EventSeverityName = getEventSeverityName(ec.EventSeverity);
                            item.Meanings = ec.EventConditionId;
                        }else{
                            item.EventSeverity += "/"+ec.EventSeverity;
                            item.EventSeverityName += "/"+getEventSeverityName(ec.EventSeverity);
                            item.Meanings += "/"+ec.EventConditionId;
                        }
                        item.EventCondition.push(ec);
                    }
                });
            }

            if($scope.SignalList){
                $scope.SignalList.forEach(function(s){
                    if(item.SignalId == s.SignalId){
                        item.SignalName = s.SignalName;
                    }
                });
            }

            if(item.Enable == "true" || item.Enable == true)
                item.Shield = false;
            else
                item.Shield = true;
        });
        return data;
    };

    function getEventSeverityName(severity){
        var name = "";
        if($scope.Event.EventSeverity){
            $scope.Event.EventSeverity.forEach(function(item){
                if(item.ItemId == severity){
                    if($scope.languageJson.Language == "English")
                        name = item.ItemAlias;
                    else
                        name = item.ItemValue;
                }
            });
        }
        return name;
    }

    function parseControlList(data,datas){
        data.forEach(function(item){
            $scope.Control.ControlCategory.forEach(function(es){
                if(item.ControlCategory == es.ItemId){
                    item.ControlCategoryName = getLanguageItem(es);
                }
            });
            $scope.Control.ControlSeverity.forEach(function(es){
                if(item.ControlSeverity == es.ItemId){
                    item.ControlSeverityName = getLanguageItem(es);
                }
            });
            $scope.Control.CommandType.forEach(function(es){
                if(item.CommandType == es.ItemId){
                    item.CommandTypeName = getLanguageItem(es);
                }
            });
            $scope.Control.ControlType.forEach(function(es){
                if(item.ControlType == es.ItemId){
                    item.ControlTypeName = getLanguageItem(es);
                }
            });
            $scope.Control.DataType.forEach(function(es){
                if(item.DataType == es.ItemId){
                    item.DataTypeName = getLanguageItem(es);
                }
            });
            if(item.Enable == 'true' || item.Visible == 'true') item.IsOpen = true;
            else item.IsOpen = false;

            if(datas){
                item.DataMeanings = [];
                datas.forEach(function(cm){
                    if(item.ControlId == cm.ControlId){
                        if(item.Meanings == undefined){
                            item.Meanings = cm.Meanings;
                        }else{
                            item.Meanings += "/"+cm.Meanings;
                        }
                        item.DataMeanings.push(cm);
                    }
                });
            }

            if($scope.SignalList){
                $scope.SignalList.forEach(function(s){
                    if(item.SignalId == s.SignalId){
                        item.SignalName = s.SignalName;
                    }
                });
            }
        });
        return data;
    }

    function getLanguageItem(item){
        if($scope.languageJson == undefined)
            $scope.languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
        var lan = $scope.languageJson.Language;
        if(lan == 'English') return item.ItemAlias
        else return item.ItemValue
    }

    $scope.AKeyGeneration = function(){
        $scope.ConfirmBox = {
            type : "BatchBaseTypeId"
        };
        $scope.message = $scope.languageJson.Config.Templatenames.Generated;/*是否批量生成模板信号基类编号?*/
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };
    $scope.ok = function(){
        if($scope.ConfirmBox == undefined) return;
        if($scope.ConfirmBox.type  == "BatchBaseTypeId"){
            TemplateService.BatchBaseTypeId($scope.selectEvent.EquipmentTemplateId).then(function(ret){
                GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.Templatenames.Batch,3000);/*'批处理完成!'*/
            });
        }else if($scope.ConfirmBox.type  == "DeleteSignal"){
            TemplateService.DeleteSignal($scope.ConfirmBox.equipmentTemplateId,$scope.ConfirmBox.id).then(function(ret){
                GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'删除成功!'*/
            });
        }else if($scope.ConfirmBox.type  == "DeleteEvent"){
            TemplateService.DeleteEvent($scope.ConfirmBox.equipmentTemplateId,$scope.ConfirmBox.id).then(function(ret){
                GetEventByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'删除成功!'*/
            });
        }else if($scope.ConfirmBox.type  == "DeleteControl"){
            TemplateService.DeleteControl($scope.ConfirmBox.equipmentTemplateId,$scope.ConfirmBox.id).then(function(ret){
                GetControlByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'删除成功!'*/
            });
        }else if($scope.ConfirmBox.type  == "DeleteSignalBaseDic"){
            TemplateService.DeleteBaseDic("SignalBaseDic",$scope.ConfirmBox.id).then(function(data){
                balert.show('success',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'删除成功!'*/
                $scope.CheckedEquipmentBaseType();
            });
        }else if($scope.ConfirmBox.type  == "DeleteEventBaseDic"){
            TemplateService.DeleteBaseDic("EventBaseDic",$scope.ConfirmBox.id).then(function(data){
                balert.show('success',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'删除成功!'*/
                $scope.CheckedEventEquipmentBaseType();
            });
        }else if($scope.ConfirmBox.type  == "DeleteCommandBaseDic"){
            TemplateService.DeleteBaseDic("CommandBaseDic",$scope.ConfirmBox.id).then(function(data){
                balert.show('success',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'删除成功!'*/
                $scope.CheckedControlEquipmentBaseType();
            });
        }
        ConfirmBoxDialog.hide();
    };
    $scope.cancel = function(){
        ConfirmBoxDialog.hide();
    };

    $scope.AddSignal = function(){
        if($scope.selectEvent.EquipmentBaseType != undefined &&
            (parseInt($scope.selectEvent.EquipmentBaseType) >= 1100 && parseInt($scope.selectEvent.EquipmentBaseType) < 1200))
            $scope.ChargeShow = true;
        else
            $scope.ChargeShow = false;

        $scope.btnName = $scope.languageJson.Config.Signal.News;/*新增*/
        TemplateService.GetNextSignalId($scope.selectEvent.EquipmentTemplateId,'Signal').then(function(data){
            $scope.Signals = {
                EquipmentTemplateId : $scope.selectEvent.EquipmentTemplateId,
                SignalId : parseInt(data)+1,
                SignalName : $scope.languageJson.Config.Config.Newsignal,
                SignalType : '2',
                ChannelNo : '-2',
                ChannelType : '1',
                DataType : '0',
                SignalCategory : '1',
                ShowPrecision : '0',
                Enable : true,
                Visible : true,
                BaseTypeId : '',
                Expression : '',
                Unit : '',
                StoreInterval : '',
                AbsValueThreshold : '',
                PercentThreshold : '',
                StaticsPeriod : '',
                ChargeStoreInterVal : '',
                ChargeAbsValue : '',
                IsBaseNameExt : "display:none;"
            };/*'新信号'*/
            $scope.CategoryHide = false;
            SignalSetterDialog.$promise.then(SignalSetterDialog.show);
            setTimeout(function(){
                $("#Inspect-Hint").attr("data-original-title","<h5>"+$scope.languageJson.Config.Signal.Accuracys+"</h5>");
            },500);
        });
        if($scope.SignalList == undefined){
            TemplateService.GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(data){
                TemplateService.GetSignalMeaningsByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(datas){
                    $scope.SignalMeaningsList = datas;
                    $scope.SignalList = parseSignalList(data,datas);
                });
            });
        }
    };

    $scope.ChangeCategory = function(cate){
        if(cate == 1){//模拟量，SignalId最后一位为1
            if($scope.btnName == $scope.languageJson.Config.Signal.News)/*"新增"*/
                if($scope.Signals.SignalId % 10 == 0){
                    $scope.Signals.SignalId += 1;
                }
            $scope.CategoryHide = false;
        }else if(cate == 2){//开关量，SignalId最后一位为0
            if($scope.btnName == $scope.languageJson.Config.Signal.News)/*"新增"*/
                if($scope.Signals.SignalId % 10 == 1){
                    $scope.Signals.SignalId -= 1;
                }
            $scope.CategoryHide = true;
        }else
            $scope.CategoryHide = false;
    };

    var oldNo;
    $scope.ChangeSignalType = function(type){
        if(type == 2){
            oldNo = $scope.Signals.ChannelNo;
            if($scope.Signals.SignalId == -3)
                $scope.Signals.ChannelNo = -3;
            else
                $scope.Signals.ChannelNo = -2;
        }else{
            var is = false;
            $scope.SignalList.forEach(function(item){
                if(item.SignalId == $scope.Signals.SignalId){
                    is = true;
                    $scope.Signals.ChannelNo = oldNo;
                }
            });
            if(!is){
                TemplateService.GetMaxChannelNo($scope.selectEvent.EquipmentTemplateId).then(function(data){
                    $scope.Signals.ChannelNo = parseInt(data) + 1;
                });
            }
        }
    };

    $scope.ChangeNumber = function(text){
        var ret = /^\-?\d*(\.\d+)?$/;
        if(!ret.test(text)){
            balert.show('danger',$scope.languageJson.Config.Templatenames.Deleted,3000);/*'不能输入字符!'*/
        }
    };
    $scope.updateSignalClick = function(data){
        if($scope.selectEvent.EquipmentBaseType != undefined &&
            (parseInt($scope.selectEvent.EquipmentBaseType) >= 1100 && parseInt($scope.selectEvent.EquipmentBaseType) < 1200))
            $scope.ChargeShow = true;
        else
            $scope.ChargeShow = false;

        $scope.btnName = $scope.languageJson.Config.Config.Modify/*"修改"*/;
        $scope.Signals = data;
        if(data.Enable == 'true') $scope.Signals.Enable = true;
        if(data.Visible == 'true') $scope.Signals.Visible = true;
        $scope.ChangeCategory($scope.Signals.SignalCategory);
        SignalSetterDialog.$promise.then(SignalSetterDialog.show);
    };

    $scope.CheckExpression = function(id){
        var textDom = document.getElementById(id);
        if (textDom.selectionStart || textDom.selectionStart == '0') {
            $scope.startPos = textDom.selectionStart;
            $scope.endPos = textDom.selectionEnd;
            $scope.scrollTop = textDom.scrollTop;
        }
    };

    $scope.ClickSignalsLi = function(symbol){
        if($scope.Signals.Expression == undefined)
            $scope.Signals.Expression = "";

        var textDom = document.getElementById("SignalExpression");
        var addStr = symbol;

        if (textDom.selectionStart || textDom.selectionStart == '0') {
            $scope.Signals.Expression = $scope.Signals.Expression.substring(0,$scope.startPos)+addStr+
                $scope.Signals.Expression.substring($scope.endPos);
            textDom.focus();
            textDom.selectionStart = $scope.startPos + addStr.length;
            textDom.selectionEnd = $scope.startPos + addStr.length;
            textDom.scrollTop = $scope.scrollTop;
        }else {
            $scope.Signals.Expression += addStr;
            textDom.focus();
        }
    };

    $scope.ChangeSignalExpression = function(SignalId){
        var str = "[-1,"+SignalId+"]";
        $scope.ClickSignalsLi(str);
    };

    $scope.ClickEventsLi = function(symbol){
        if($scope.Events.StartExpression == undefined)
            $scope.Events.StartExpression = "";

        var textDom = document.getElementById("EventExpression");
        var addStr = symbol;

        if (textDom.selectionStart || textDom.selectionStart == '0') {
            $scope.Events.StartExpression = $scope.Events.StartExpression.substring(0,$scope.startPos)+addStr+
                $scope.Events.StartExpression.substring($scope.endPos);
            textDom.focus();
            textDom.selectionStart = $scope.startPos + addStr.length;
            textDom.selectionEnd = $scope.startPos + addStr.length;
            textDom.scrollTop = $scope.scrollTop;
        }else {
            $scope.Events.StartExpression += addStr;
            textDom.focus();
        }
    };

    $scope.saveSignal = function(){
        if($scope.Signals.SignalName == "" || $scope.Signals.SignalName == undefined){
            balert.show('danger',$scope.languageJson.Config.SignalName.Title,3000);/*'信号名称不能为空!'*/
            return;
        }

        if($scope.SignalList && $scope.Signals.BaseTypeId != "" && $scope.Signals.BaseTypeId != undefined){
            var is = false;
            $scope.SignalList.forEach(function(item){
                if(item.SignalId != $scope.Signals.SignalId && item.BaseTypeId == $scope.Signals.BaseTypeId)
                    is = true;
            });
            if(is){
                balert.show('danger',$scope.languageJson.Config.SignalName.Repeated,3000);/*'基类编号不能重复!'*/
                return;
            }
        }
        if($scope.Signals.ChannelNo == "" || $scope.Signals.ChannelNo == undefined){
            balert.show('danger',$scope.languageJson.Config.SignalName.Channel,3000);/*'通道号不能为空!'*/
            return;
        }
        if($scope.Signals.ShowPrecision == "" || $scope.Signals.ShowPrecision == undefined){
            balert.show('danger',$scope.languageJson.Config.SignalName.Accuracy,3000);/*'精确率不能为空!'*/
            return;
        }
        if($scope.Signals.SignalType == 2){
            if($scope.Signals.SignalId == -3){
                if($scope.Signals.ChannelNo != -3){
                    balert.show('danger',$scope.languageJson.Config.SignalName.Status,3000);/*'通讯状态信号通道号只能为-3!'*/
                    return;
                }
            }else if($scope.Signals.ChannelNo != -2){
                balert.show('danger',$scope.languageJson.Config.SignalName.Virtual,3000);/*'虚拟信号通道号只能为-2!'*/
                return;
            }
        }
        if($scope.Signals.SignalType != 2 && $scope.Signals.ChannelNo < 0){
            balert.show('danger',$scope.languageJson.Config.SignalName.Acquisition,3000);/*'采集信号/常量信号通道号不能为负数!'*/
            return;
        }
        var ret = /^\-?\d*(\.\d+)?$/;
        if(!ret.test($scope.Signals.StoreInterval) || !ret.test($scope.Signals.AbsValueThreshold) ||
                !ret.test($scope.Signals.PercentThreshold) || !ret.test($scope.Signals.ChargeStoreInterVal)){
            balert.show('danger',$scope.languageJson.Config.SignalName.Storage,3000);/*'存储周期/百分比阀值/绝对值阀值/统计周期不能输入字符!'*/
            return;
        }
        if($scope.Signals.StoreInterval < 0 || $scope.Signals.PercentThreshold < 0 ||
                $scope.Signals.ChargeStoreInterVal < 0 ){
            balert.show('danger',$scope.languageJson.Config.SignalName.Storagcycle,3000);/*'存储周期/百分比阀值/统计周期不能小于零!'*/
            return;
        }
        if($scope.Signals.SignalType != 2 || $scope.Signals.ChannelNo != -2){
            if($scope.SignalList){
                var is = false;
                $scope.SignalList.forEach(function(item){
                    if(item.ChannelNo == $scope.Signals.ChannelNo && item.SignalId != $scope.Signals.SignalId){
                        is = true;
                    }
                });
                if(is){
                    balert.show('danger',$scope.languageJson.Config.SignalName.Repeateds,3000);/*'通道号不能重复!'*/
                    TemplateService.GetMaxChannelNo($scope.selectEvent.EquipmentTemplateId).then(function(data){
                        $scope.Signals.ChannelNo = parseInt(data) + 1;
                    });
                    return;
                }
            }
        }

        if($scope.btnName == $scope.languageJson.Config.Config.Modify){/*"修改"*/
            TemplateService.SaveSignal($scope.Signals).then(function(ret){
                GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.SignalName.Successfully,3000);/*'修改成功!'*/
                SignalSetterDialog.hide();
            });
        }else{
            TemplateService.AddSignal($scope.Signals).then(function(ret){
                GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.SignalName.Added,3000);/*'新增成功!'*/
                SignalSetterDialog.hide();
            });
        }
    };

    $scope.deleteSignalClick = function(data){
        $scope.ConfirmBox = {
            type : "DeleteSignal",
            equipmentTemplateId : data.EquipmentTemplateId,
            id : data.SignalId
        };
        $scope.message = $scope.languageJson.Config.SignalName.Confirm+data.SignalName+$scope.languageJson.Config.SignalName.Data;
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };

    $scope.GenerateBaseTypeId = function(){
        if($scope.Signals.BaseTypeId == undefined || $scope.Signals.BaseTypeId == ""){
            TemplateService.GetMaxBaseTypeByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(data){
                var baseType = data;
                if($scope.Signals.SignalId == -3){
                    $scope.Signals.BaseTypeId = baseType+"999001";
                }else{
                    var MaxBaseTypeId = 0;
                    $scope.SignalList.forEach(function(item){
                        if(item.SignalId !=-3 && item.BaseTypeId > MaxBaseTypeId){
                            MaxBaseTypeId = item.BaseTypeId;
                        }
                    });
                    if(MaxBaseTypeId == 0){
                        $scope.Signals.BaseTypeId = baseType+"301001";
                    }else{
                        var MaxBaseType = parseInt(parseInt(MaxBaseTypeId)/1000);
                        $scope.Signals.BaseTypeId = (MaxBaseType+1)+"001";
                    }
                }
            });
        }
    };

    /*================================新增基类事件开始=========================================*/
    $scope.SignalBaseTypeId = function(){
        $scope.Signals.StartNum = 2;
        $scope.Signals.EndNum = "";
        if($scope.Signals.BaseTypeId == undefined || $scope.Signals.BaseTypeId == "")
            $scope.Signals.IsBaseNameExt = "display:none;";
        TemplateService.GetEquipmentBaseTypeById($scope.Signals.EquipmentTemplateId).then(function(data){
            $scope.Signals.EquipmentBaseType = data;
            $scope.CheckedEquipmentBaseType();
            SignalBasetypeDialog.$promise.then(SignalBasetypeDialog.show);
        });
    };

    $scope.CheckedEquipmentBaseType = function(){
        if($scope.Signals.EquipmentBaseType){
            TemplateService.GetBaseDicByBaseType("SignalBaseDic",$scope.Signals.EquipmentBaseType).then(function(data){
                $scope.Template.BaseDic = data;
                if($scope.Signals.BaseTypeId)
                    $scope.CheckedBaseTypeId($scope.Signals.BaseTypeId);
            });
        }
    };

    $scope.CheckedBaseTypeId = function(baseTypeId){
        $scope.Signals.IsBaseNameExt = "display:none;";
        $scope.Signals.IsSystem = "display:none;";
        $scope.Template.BaseDic.forEach(function(item){
            if(item.BaseTypeId == baseTypeId) {
                $scope.Signals.BaseNameExt = item.BaseNameExt;
                if(item.IsSystem == "false")
                    $scope.Signals.IsSystem = "display:block;";
                if(item.BaseNameExt != undefined && item.BaseNameExt != "")
                    $scope.Signals.IsBaseNameExt = "display:block;";
            }
        });
    };

    $scope.create = function(){
        if($scope.Signals.BaseTypeId == "" || $scope.Signals.BaseTypeId == undefined){
            balert.show('danger',$scope.languageJson.Config.Signalbase.Title,3000);/*'请选择基类信号!'*/
            return;
        }
        if($scope.Signals.BaseNameExt != "" && $scope.Signals.BaseNameExt != undefined ){
            if($scope.Signals.StartNum == "" || $scope.Signals.StartNum == undefined){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Starting,3000);/*'开始序号不能为空!'*/
                return;
            }
            if($scope.Signals.EndNum != "" && $scope.Signals.EndNum != undefined){
                if(parseInt($scope.Signals.EndNum) <= parseInt($scope.Signals.StartNum)){
                    balert.show('danger',$scope.languageJson.Config.Signalbase.Must,3000);/*'结束序号必须大于开始序号!'*/
                    return;
                }
            }
            if(isNaN($scope.Signals.StartNum) || ($scope.Signals.EndNum != "" && isNaN($scope.Signals.EndNum))){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Numbers,3000);/*'开始序号和结束序号只能是数值!'*/
                return;
            }
        }
        var num = parseInt(parseInt($scope.Signals.BaseTypeId)/100);
        var isBaseTypeId = false;
        $scope.Template.BaseDic.forEach(function(item){
            if(item.BaseTypeId.indexOf(num) == 0){
                var no = parseInt(item.BaseTypeId)%100;
                if($scope.Signals.EndNum == undefined || $scope.Signals.EndNum == ""){
                    if(no == $scope.Signals.StartNum){
                        balert.show('danger',$scope.languageJson.Config.Signalbase.Add,3000);/*'新增基类信号已存在!'*/
                        isBaseTypeId = true;
                    }
                }else{
                    if(no >= parseInt($scope.Signals.StartNum) && no <= parseInt($scope.Signals.EndNum)){
                        balert.show('danger',$scope.languageJson.Config.Signalbase.Serial,3000);/*'新增序号区间有已存在的基类信号!'*/
                        isBaseTypeId = true;
                    }
                }
            }
        });
        if(isBaseTypeId) return;
        TemplateService.InsertBaseType("TBL_SignalBaseDic",$scope.Signals.EquipmentBaseType,$scope.Signals.BaseTypeId,$scope.Signals.StartNum,$scope.Signals.EndNum).then(function(data){
           if(data){
               balert.show('success',$scope.languageJson.Config.Signalbase.Successfully,3000);/*'新增成功!'*/
               $scope.CheckedEquipmentBaseType();
           }else{
               balert.show('danger',$scope.languageJson.Config.Signalbase.New,3000);/*'新增失败!'*/
           }
        });
    };

    $scope.confirmed = function(){
        if($scope.Signals.BaseTypeId == "" || $scope.Signals.BaseTypeId == undefined)
            SignalBasetypeDialog.hide();
        else if($scope.SignalList){
            var is = false;
            $scope.SignalList.forEach(function(item){
                if(item.SignalId != $scope.Signals.SignalId && item.BaseTypeId == $scope.Signals.BaseTypeId)
                    is = true;
            });
            if(is){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Repeated,3000);/*'基类编号不能重复!'*/
            }else
                SignalBasetypeDialog.hide();
        }
    };
    $scope.clear = function(){
        $scope.Signals.BaseTypeId = "";
        SignalBasetypeDialog.hide();
    };

    $scope.removeSignalBaseDic = function(){
        $scope.ConfirmBox = {
            type : "DeleteSignalBaseDic",
            equipmentTemplateId : undefined,
            id : $scope.Signals.BaseTypeId
        };
        $scope.message = $scope.languageJson.Config.Signalbase.Class;/*确定删除此基类信号吗?*/
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };
    /*================================新增基类信号结束=========================================*/
    /*================================新增基类事件开始=========================================*/
    $scope.EventBaseTypeId = function(data){
        $scope.Events.EventConditionId = data.EventConditionId;
        $scope.Events.BaseTypeId = data.BaseTypeId;
        $scope.Events.StartNum = 2;
        $scope.Events.EndNum = "";
        TemplateService.GetEquipmentBaseTypeById($scope.Events.EquipmentTemplateId).then(function(data){
            $scope.Events.EquipmentBaseType = data;
            $scope.CheckedEventEquipmentBaseType();
            EventBasetypeDialog.$promise.then(EventBasetypeDialog.show);
        });
    };
    $scope.CheckedEventEquipmentBaseType = function(){
        if($scope.Events.EquipmentBaseType){
            TemplateService.GetBaseDicByBaseType("EventBaseDic",$scope.Events.EquipmentBaseType).then(function(data){
                $scope.Template.EventBaseDic = data;
                $scope.CheckedEventBaseTypeId($scope.Events.BaseTypeId);
            });
        }
    };
    $scope.CheckedEventBaseTypeId = function(baseTypeId){
        $scope.Events.IsBaseNameExt = "display:none;";
        $scope.Events.IsSystem = "display:none;";
        $scope.Template.EventBaseDic.forEach(function(item){
            if(item.BaseTypeId == baseTypeId) {
                $scope.Events.BaseNameExt = item.BaseNameExt;
                if(item.IsSystem == "false")
                    $scope.Events.IsSystem = "display:block;";
                if(item.BaseNameExt != undefined && item.BaseNameExt != "")
                    $scope.Events.IsBaseNameExt = "display:block;";
            }
        });
    };

    $scope.createEvent = function(){
        if($scope.Events.BaseTypeId == "" || $scope.Events.BaseTypeId == undefined){
            balert.show('danger',$scope.languageJson.Config.Signalbase.Title,3000);/*'请选择基类事件!'*/
            return;
        }
        if($scope.Events.BaseNameExt != "" && $scope.Events.BaseNameExt != undefined ){
            if($scope.Events.StartNum == "" || $scope.Events.StartNum == undefined){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Starting,3000);/*'开始序号不能为空!'*/
                return;
            }
            if($scope.Events.EndNum != "" && $scope.Events.EndNum != undefined){
                if($scope.Events.EndNum <=$scope.Events.StartNum){
                    balert.show('danger',$scope.languageJson.Config.Signalbase.Must,3000);/*'结束序号必须大于开始序号!*/
                    return;
                }
            }
            if(isNaN($scope.Events.StartNum) || ($scope.Events.EndNum != "" && isNaN($scope.Events.EndNum))){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Numbers,3000);/*开始序号和结束序号只能是数值!*/
                return;
            }
        }
        var num = parseInt(parseInt($scope.Events.BaseTypeId)/100);
        var isBaseTypeId = false;
        $scope.Template.EventBaseDic.forEach(function(item){
            if(item.BaseTypeId.indexOf(num) == 0){
                var no = parseInt(item.BaseTypeId)%100;
                if($scope.Events.EndNum == undefined || $scope.Events.EndNum == ""){
                    if(no == $scope.Events.StartNum){
                        balert.show('danger',$scope.languageJson.Config.Signalbase.Add,3000);/*新增基类信号已存在!*/
                        isBaseTypeId = true;
                    }
                }else{
                    if(no >= parseInt($scope.Events.StartNum) && no <= parseInt($scope.Events.EndNum)){
                        balert.show('danger',$scope.languageJson.Config.Signalbase.Serial,3000);/*新增序号区间有已存在的基类信号!*/
                        isBaseTypeId = true;
                    }
                }
            }
        });
        if(isBaseTypeId) return;
        TemplateService.InsertBaseType("TBL_EventBaseDic",$scope.Events.EquipmentBaseType,$scope.Events.BaseTypeId,$scope.Events.StartNum,$scope.Events.EndNum).then(function(data){
            if(data){
                balert.show('success',$scope.languageJson.Config.Signalbase.Successfully,3000);/*新增成功!*/
                $scope.CheckedEventEquipmentBaseType();
            }else{
                balert.show('danger',$scope.languageJson.Config.Signalbase.New,3000);/*新增失败!*/
            }
        });
    };
    $scope.confirmedEvents = function(){
        $scope.EventCondition.forEach(function(item){
            if($scope.Events.EventConditionId == item.EventConditionId)
                item.BaseTypeId = $scope.Events.BaseTypeId;
        });
        EventBasetypeDialog.hide();
    };
    $scope.clearEvents = function(){
        $scope.Events.BaseTypeId = "";
        EventBasetypeDialog.hide();
    };

    $scope.removeEventBaseDic = function(){
        $scope.ConfirmBox = {
            type : "DeleteEventBaseDic",
            equipmentTemplateId : undefined,
            id : $scope.Events.BaseTypeId
        };
        $scope.message = $scope.languageJson.Config.Signalbase.Class;/*确定删除此基类信号吗?*/
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };
    /*================================新增基类事件结束=========================================*/
    /*================================新增基类控制开始=========================================*/
    $scope.ControlBaseTypeId = function(data){
            $scope.Controls.StartNum = 2;
            $scope.Controls.EndNum = "";
            TemplateService.GetEquipmentBaseTypeById($scope.Controls.EquipmentTemplateId).then(function(data){
            $scope.Controls.EquipmentBaseType = data;
            if($scope.Controls.BaseTypeId=="" || $scope.Controls.BaseTypeId==undefined )
                $scope.Controls.IsBaseNameExt = "display:none;";
            $scope.CheckedControlEquipmentBaseType();
            ControlBasetypeDialog.$promise.then(ControlBasetypeDialog.show);
        });
    };
    $scope.CheckedControlEquipmentBaseType = function(){
        if($scope.Controls.EquipmentBaseType){
            TemplateService.GetBaseDicByBaseType("CommandBaseDic",$scope.Controls.EquipmentBaseType).then(function(data){
                $scope.Template.ControlBaseDic = data;
                if($scope.Controls.BaseTypeId)
                    $scope.CheckedControlBaseTypeId($scope.Controls.BaseTypeId);
            });
        }
    };
    $scope.CheckedControlBaseTypeId = function(baseTypeId){
        $scope.Controls.IsBaseNameExt = "display:none;";
        $scope.Controls.IsSystem = "display:none;";
        $scope.Template.ControlBaseDic.forEach(function(item){
            if(item.BaseTypeId == baseTypeId) {
                $scope.Controls.BaseNameExt = item.BaseNameExt;
                if(item.IsSystem == "false")
                    $scope.Controls.IsSystem = "display:block;";
                if(item.BaseNameExt != undefined && item.BaseNameExt != "")
                    $scope.Controls.IsBaseNameExt = "display:block;";
            }
        });
    };

    $scope.createControl = function(){
        if($scope.Controls.BaseTypeId == "" || $scope.Controls.BaseTypeId == undefined){
            balert.show('danger',$scope.languageJson.Config.Signalbase.Base,3000);/*'请选择基类事件!'*/
            return;
        }
        if($scope.Controls.BaseNameExt != "" && $scope.Controls.BaseNameExt != undefined ){
            if($scope.Controls.StartNum == "" || $scope.Controls.StartNum == undefined){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Starting,3000);/*'开始序号不能为空!'*/
                return;
            }
            if($scope.Controls.EndNum != "" && $scope.Controls.EndNum != undefined){
                if($scope.Controls.EndNum <=$scope.Controls.StartNum){
                    balert.show('danger',$scope.languageJson.Config.Signalbase.Must,3000);/*'结束序号必须大于开始序号!'*/
                    return;
                }
            }
            if(isNaN($scope.Controls.StartNum) || ($scope.Controls.EndNum != "" && isNaN($scope.Controls.EndNum))){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Numbers,3000);/*'开始序号和结束序号只能是数值!'*/
                return;
            }
        }
        var num = parseInt(parseInt($scope.Controls.BaseTypeId)/100);
        var isBaseTypeId = false;
        $scope.Template.ControlBaseDic.forEach(function(item){
            if(item.BaseTypeId.indexOf(num) == 0){
                var no = parseInt(item.BaseTypeId)%100;
                if($scope.Controls.EndNum == undefined || $scope.Controls.EndNum == ""){
                    if(no == $scope.Events.StartNum){
                        balert.show('danger',$scope.languageJson.Config.Signalbase.Add,3000);/*'新增基类信号已存在!'*/
                        isBaseTypeId = true;
                    }
                }else{
                    if(no >= parseInt($scope.Controls.StartNum) && no <= parseInt($scope.Controls.EndNum)){
                        balert.show('danger',$scope.languageJson.Config.Signalbase.Serial,3000);/*'新增序号区间有已存在的基类信号!'*/
                        isBaseTypeId = true;
                    }
                }
            }
        });
        if(isBaseTypeId) return;
        TemplateService.InsertBaseType("TBL_CommandBaseDic",$scope.Controls.EquipmentBaseType,$scope.Controls.BaseTypeId,$scope.Controls.StartNum,$scope.Controls.EndNum).then(function(data){
            if(data){
                balert.show('success',$scope.languageJson.Config.Signalbase.Successfully,3000);/*'新增成功!'*/
                $scope.CheckedControlEquipmentBaseType();
            }else{
                balert.show('danger',$scope.languageJson.Config.Signalbase.New,3000);/*'新增失败!'*/
            }
        });
    };
    $scope.confirmedControls = function(){
        if($scope.ControlList){
            var is = false;
            $scope.ControlList.forEach(function(item){
                if(item.ControlId != $scope.Controls.ControlId && item.BaseTypeId == $scope.Controls.BaseTypeId)
                    is = true;
            });
            if(is){
                balert.show('danger',$scope.languageJson.Config.Signalbase.Repeated,3000);/*'基类编号不能重复!'*/
            }else
                ControlBasetypeDialog.hide();
        }
    };
    $scope.clearControls = function(){
        $scope.Controls.BaseTypeId = "";
        ControlBasetypeDialog.hide();
    };

    $scope.removeControlBaseDic = function(){
        $scope.ConfirmBox = {
            type : "DeleteCommandBaseDic",
            equipmentTemplateId : undefined,
            id : $scope.Controls.BaseTypeId
        };
        $scope.message = $scope.languageJson.Config.Signalbase.Class;/*"确定删除此基类信号吗?"*/
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };
    /*================================新增基类控制结束=========================================*/

    $scope.BindingMeanings = function(type,data){
        if(type == 'Signal'){
            $scope.title = $scope.languageJson.Config.ControlSignal.Title;/*"信号"*/
            $scope.DataMeanings = getSignalMeanings(data);
        }else{
            $scope.title = $scope.languageJson.Config.ControlSignal.Control;/*"控制"*/
            $scope.DataMeanings = getControlMeanings(data);
        }
        BindingMeaningsDialog.$promise.then(BindingMeaningsDialog.show);
    };

    function getSignalMeanings(data){
        var obj = [];
        if(data.DataMeanings){
            data.DataMeanings.forEach(function(item){
                var cfg = {};
                if(item.StateValue == undefined)
                    cfg.Value = item.Value;
                else
                    cfg.Value = item.StateValue;
                cfg.Meanings = item.Meanings;
                obj.push(cfg);
            });
        }
        obj.EquipmentTemplateId = data.EquipmentTemplateId;
        if(obj.EquipmentTemplateId == undefined) obj.EquipmentTemplateId = $scope.selectEvent.EquipmentTemplateId;
        obj.Id = data.SignalId;
        return obj;
    };

    function getControlMeanings(data){
        var obj = [];
        if(data.DataMeanings){
            data.DataMeanings.forEach(function(item){
                var cfg = {};
                if(item.ParameterValue == undefined) cfg.Value = item.Value;
                else cfg.Value = item.ParameterValue;
                cfg.Meanings = item.Meanings;
                obj.push(cfg);
            });
        }
        obj.EquipmentTemplateId = data.EquipmentTemplateId;
        if(obj.EquipmentTemplateId == undefined) obj.EquipmentTemplateId = $scope.selectEvent.EquipmentTemplateId;
        obj.Id = data.ControlId;
        return obj;
    };

    $scope.addMeaningsCol = function(){
        var value = -1;
        $scope.DataMeanings.forEach(function(item){
            if(item.Value > value){
                value = item.Value;
            }
        });
        value ++;
        var cfg = {
            Value : value,
            Meanings : $scope.languageJson.Config.Meaning
        };/*'含义'*/
        $scope.DataMeanings.push(cfg);
    };

    $scope.saveMeanings = function(){
        if($scope.title == $scope.languageJson.Config.ControlSignal.Title){/*"信号"*/
            TemplateService.SaveSignalMeanings($scope.DataMeanings).then(function(data){
                balert.show('success',$scope.languageJson.Config.ControlSignal.Successful,3000);/*'处理成功!'*/
                parseSignalMeanings($scope.DataMeanings);
            });
        }else{
            TemplateService.SaveControlMeanings($scope.DataMeanings).then(function(data){
                balert.show('success',$scope.languageJson.Config.ControlSignal.Successful,3000);/*'处理成功!'*/
                parseControlMeanings($scope.DataMeanings);
            });
        }
        BindingMeaningsDialog.hide();
    };

    function parseSignalMeanings(data){
        $scope.Signals.Meanings = undefined;
        $scope.Signals.DataMeanings = [];
        data.forEach(function(sm){
            if($scope.Signals.Meanings == undefined){
                $scope.Signals.Meanings = sm.Meanings;
            }else{
                $scope.Signals.Meanings += "/"+sm.Meanings;
            }
            $scope.Signals.DataMeanings.push(sm);
        });
        if($scope.Signals.DataMeanings.EquipmentTemplateId == undefined)
            $scope.Signals.DataMeanings.EquipmentTemplateId = $scope.selectEvent.EquipmentTemplateId;
        $scope.Signals.DataMeanings.Id = $scope.Signals.SignalId;
    };

    function parseControlMeanings(data){
        $scope.Controls.Meanings = undefined;
        $scope.Controls.DataMeanings = [];
        data.forEach(function(sm){
            if($scope.Controls.Meanings == undefined){
                $scope.Controls.Meanings = sm.Meanings;
            }else{
                $scope.Controls.Meanings += "/"+sm.Meanings;
            }
            $scope.Controls.DataMeanings.push(sm);
        });
        if($scope.Controls.DataMeanings.EquipmentTemplateId == undefined)
            $scope.Controls.DataMeanings.EquipmentTemplateId = $scope.selectEvent.EquipmentTemplateId;
        $scope.Controls.DataMeanings.Id = $scope.Controls.ControlId;
    };

    $scope.deleteMeaningsClick = function($index){
        $scope.DataMeanings.splice($index,1);
    };

    $scope.AddEvent = function(){
        $scope.btnName = $scope.languageJson.Config.ControlSignal.New/*"新增"*/;
        TemplateService.GetNextSignalId($scope.selectEvent.EquipmentTemplateId,'Event').then(function(data){
            $scope.Events = {
                EquipmentTemplateId : $scope.selectEvent.EquipmentTemplateId,
                EventId : parseInt(data),
                EventName : $scope.languageJson.Config.Details.NewName,
                EventCategory : '2',
                StartType : '1',
                EndType : '3',
                Enable : true,
                Visible : true,
                IsBaseNameExt : "display:none;"
            };/*'新事件'*/
            EventSetterDialog.$promise.then(EventSetterDialog.show);
        });
        if($scope.SignalList == undefined){
            TemplateService.GetSignalByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(data){
                TemplateService.GetSignalMeaningsByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId).then(function(datas){
                    $scope.SignalMeaningsList = datas;
                    $scope.SignalList = parseSignalList(data,datas);
                });
            });
        }
    };

    //信号屏蔽状态
    $scope.ShieldEvent = function(){
        $scope.ShieldTemplate = getEquipmentTemplateById($scope.selectEvent.EquipmentTemplateId);

        shieldEventDlg.$promise.then(shieldEventDlg.show);
    };

    //根据模板编号获取模板对象
    function getEquipmentTemplateById(id){
        var obj = {};
        if($scope.equipmentTemplates){
            $scope.equipmentTemplates.forEach(function(item){
                if(item.EquipmentTemplateId == id)
                    obj = item;
            });
        }
        if($scope.EventList){
            obj.Shield = true;
            $scope.EventList.forEach(function(item){
                if(item.Shield == false)
                    obj.Shield = false;
            });
        }
        return obj;
    }

    // 屏蔽/启用所有事件
    $scope.checkShieldAll = function(equipmentTemplateId,shieldName,isShield){
        if(shieldName !== undefined){
            eval(shieldName+" = !"+shieldName);
        }
        isShield = !isShield;
        TemplateService.ShieldEnableEvent(equipmentTemplateId,"",isShield).then(function(data){
            console.log("ShieldEnableEvent:"+data);
            if($scope.EventList){
                $scope.EventList.forEach(function(item){
                    item.Shield = isShield;
                });
            }
        });
    };

    // 屏蔽/启用指定事件
    $scope.checkShieldEvent = function(row,isShield){
        if(isShield == undefined){
            row.Shield = !row.Shield;
            isShield = row.Shield;
        }else
            isShield = !isShield;
        TemplateService.ShieldEnableEvent($scope.ShieldTemplate.EquipmentTemplateId,row.EventId,isShield).then(function(data){
            console.log("ShieldEnableEvent:"+data);
        });
    };

    //保存按钮，提示点击"配置生效"
    $scope.ShieldEventSave = function(){
        balert.show('success',$scope.languageJson.Config.ShieldEventBox.Prompt.succeed,3000);/*保存成功，请点击'配置生效'按钮！*/
        shieldEventDlg.hide();
    };


    $scope.ChangeRelateEventSignal = function(signalId){
        if($scope.Events.StartExpression == undefined)
            $scope.Events.StartExpression = '';
        $scope.Events.StartExpression += "[-1,"+signalId+"]";
        $scope.SignalList.forEach(function(item){
            if(item.SignalId == signalId)
                $scope.Events.EventName = item.SignalName+$scope.languageJson.Config.Details.Suffix;/*"事件"*/
        });
    };

    $scope.updateEventClick=function(data){
        $scope.btnName = $scope.languageJson.Config.ControlSignal.Modify;/*"修改"*/
        $scope.Events = data;
        if(data.Enable == 'true') $scope.Events.Enable = true;
        if(data.Visible == 'true') $scope.Events.Visible = true;
        EventSetterDialog.$promise.then(EventSetterDialog.show);
    };

    $scope.BindingCondition = function(data){
        $scope.EventCondition = data.EventCondition;
        if($scope.EventCondition == undefined)
            $scope.EventCondition = [];
        $scope.EventCondition.EquipmentTemplateId = data.EquipmentTemplateId;
        $scope.EventCondition.EventId = data.EventId;
        BindingConditionDialog.$promise.then(BindingConditionDialog.show);
    };

    $scope.addConditionCol = function(){
        var number = -1;
        if($scope.EventCondition){
            $scope.EventCondition.forEach(function(item){
                if(item.EventConditionId > number) number = item.EventConditionId;
            });
        }
        var cfg = {
            EventConditionId : ++number,
            EventSeverity : '1',
            StartOperation : '=',
            StartCompareValue : '0',
            StartDelay : '0',
            Meanings : $scope.Events.EventName
        };
        if($scope.Events.EventCondition && $scope.Events.EventCondition.length > 0)
            cfg.BaseTypeId = $scope.Events.EventCondition[0].BaseTypeId;
        $scope.EventCondition.push(cfg);
    };

    $scope.deleteConditionClick = function($index){
        $scope.EventCondition.splice($index,1);
    };

    $scope.saveCondition = function(){
        $scope.Events.Meanings = undefined;
        TemplateService.SaveCondition($scope.EventCondition).then(function(data){
            $scope.EventCondition.forEach(function(ec){
                if($scope.Events.Meanings == undefined){
                    $scope.Events.Meanings = ec.EventConditionId;
                }else{
                    $scope.Events.Meanings += "/"+ec.EventConditionId;
                }
            });
            $scope.Events.EventCondition = $scope.EventCondition;
            balert.show('success',$scope.languageJson.Config.ControlSignal.Successful,3000);/*'处理成功!'*/
            BindingConditionDialog.hide();
        });
    };

    $scope.saveEvent = function(){
        if($scope.Events.EventName == undefined || $scope.Events.EventName == ''){
            balert.show('danger',$scope.languageJson.Config.ControlSignal.Empty,3000);/*'事件名称不能为空!'*/
            return;
        }
        if($scope.btnName == $scope.languageJson.Config.ControlSignal.New){/*'新增'*/
            TemplateService.AddEvent($scope.Events).then(function(data){
                GetEventByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.ControlSignal.Added,3000);/*'新增成功!'*/
            });
        }else{
            TemplateService.SaveEvent($scope.Events).then(function(data){
                GetEventByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',$scope.languageJson.Config.ControlSignal.Modified,3000);/*'修改成功!'*/
            });
        }
        EventSetterDialog.hide();
    };

    $scope.AddControl = function(){
        $scope.btnName = $scope.languageJson.Config.Setting.New/*"新增"*/;
        TemplateService.GetNextSignalId($scope.selectEvent.EquipmentTemplateId,'Control').then(function(data){
            $scope.Controls = {
                EquipmentTemplateId : $scope.selectEvent.EquipmentTemplateId,
                ControlId : parseInt(data),
                ControlName : $scope.languageJson.Config.Con.NewName,
                ControlCategory : '1',
                ControlSeverity : '1',
                ControlType : '1',
                DataType : '0',
                CmdToken : '',
                CommandType : '1',
                MaxValue : '0.0',
                MinValue : '0.0',
                Meanings : '',
                Enable : true,
                Visible : true,
                BaseTypeId : ''
            };/*'新控制'*/
            ControlSetterDialog.$promise.then(ControlSetterDialog.show);
        });
    };

    $scope.updateControlClick = function(data){
        $scope.btnName = $scope.languageJson.Config.ControlSignal.Modify;/*"修改"*/
        $scope.Controls = data;
        if(data.Enable == 'true') $scope.Controls.Enable = true;
        if(data.Visible == 'true') $scope.Controls.Visible = true;
        ControlSetterDialog.$promise.then(ControlSetterDialog.show);
    };

    $scope.ChangeRelateControlSignal = function(signalId){
        $scope.SignalList.forEach(function(item){
            if(item.SignalId == signalId)
                $scope.Controls.ControlName = item.SignalName+$scope.languageJson.Config.ControlSignal.Suffix;/*"控制"*/
        });
    };

    $scope.saveControl = function(){
        var controlSignal = $scope.languageJson.Config.ControlSignal;
        if($scope.Controls.ControlName == "" || $scope.Controls.ControlName == undefined){
            balert.show('danger',controlSignal.Controls,3000);/*'控制名称不能为空!'*/
            return;
        }
        if($scope.btnName == controlSignal.Modify){/*"修改"*/
            TemplateService.SaveControl($scope.Controls).then(function(ret){
                GetControlByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',controlSignal.Modified,3000);/*'修改成功!'*/
                ControlSetterDialog.hide();
            });
        }else{
            TemplateService.AddControl($scope.Controls).then(function(ret){
                GetControlByEquipmentTemplateId($scope.selectEvent.EquipmentTemplateId);
                balert.show('success',controlSignal.Added,3000);/*'新增成功!'*/
                ControlSetterDialog.hide();
            });
        }
    };

    $scope.deleteControlClick = function(data){
        $scope.ConfirmBox = {
            type : "DeleteControl",
            equipmentTemplateId : data.EquipmentTemplateId,
            id : data.ControlId
        };
        $scope.message = $scope.languageJson.Config.SignalName.Confirm+data.ControlName+$scope.languageJson.Config.SignalName.Data;//"确定删除“" / 控制的数据
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };


    $scope.deleteEventClick = function(data){
        $scope.ConfirmBox = {
            type : "DeleteEvent",
            equipmentTemplateId : data.EquipmentTemplateId,
            id : data.EventId
        };
        $scope.message = $scope.languageJson.Config.SignalName.Confirm+data.EventName+$scope.languageJson.Config.SignalName.Data;//"确定删除" / 事件的数据
        ConfirmBoxDialog.$promise.then(ConfirmBoxDialog.show);
    };

    $scope.severityChange = function(eventId,severity){
        $scope.EventList.forEach(function(item){
            if(eventId == item.EventId){
                if(item.EventSeverity == es.ItemId){
                    item.SeverityName = es.ItemValue;
                }
            }
        });
    };

    /****************************************   模板管理 End  ************************************************/
}]);

nurseController.controller( 'EmployeeCtrl', ['$scope','$modal','employeeService', 'balert','bconfirm', function($scope, $modal, employeeService, balert,bconfirm) {

    //初始函数
    (function() {

        //人员信息
        $scope.employeeInfo ={};
        $scope.employeeInfo.EmployeeName = "";
        $scope.employeeInfo.Mobile = "";
        $scope.employeeInfo.Email = "";

        //获取人员信息
        employeeService.getAllEmployees().then(function(data) {
            $scope.employees = parseEmployees(data);
            if($scope.station){
                for(var i=0; i< $scope.employees.length; i++)
                {
                    if($scope.employees[i].EmployeeId == $scope.station.contactId)
                    {
                        $scope.station.employee = $scope.employees[i];
                        break;
                    }
                }
            }
        });
    })();


    /******************************************    人员管理部分    ***************************************************/
    //解析Employee数据
    function parseEmployees(data) {

        var dataArray = [];

        data.forEach(function(element, index) {
            var employee = {};
            employee.EmployeeId = element.EmployeeId;
            employee.EmployeeName = element.EmployeeName;
            employee.Mobile = element.Mobile;
            employee.Email = element.Email;
            dataArray.push(employee);
        });

        return dataArray;
    }

    $scope.removeEmployee = function(id, name) {
        $scope.selectedEmployeeId = id;
        $scope.selectedEmployeeName = name;

        var person = $scope.languageJson.Person;
        //删除过滤器前确认是否删除
        /*"请确认是否删除 [ID:" ",名称:" "] 人员?"*/
        bconfirm.show($scope,person.DeleteConfirm1 + $scope.selectedEmployeeId + person.DeleteConfirm2 + $scope.selectedEmployeeName + person.DeleteConfirm3).then(function(data){
            if(data){
                employeeService.deleteEmployee($scope.selectedEmployeeId).then(function(data) {
                    var result = data;
                    if(result == "fail to delete employee")
                    {
                        /*'删除人员失败，请检查连接是否正常!'*/
                        balert.show('danger',person.FailDeleteEmployee,3000);
                    }
                    else if(result == "system employee")
                    {
                        /*'该人员为局站管理员，无法删除!'*/
                        balert.show('danger',person.SystemEmployee,3000);
                    }
                    else
                    {
                        employeeService.getAllEmployees().then(function(data) {
                            $scope.employees = parseEmployees(data);
                            balert.show('success',person.DeleteSuccess,3000);/*'删除人员成功!'*/
                        });
                    }
                });
            }
        });
    };

    var addEmployeeDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/addEmployee.html',
        show: false
    });

    $scope.addEmployee = function() {

        $scope.employeeInfo.EmployeeName = "";
        $scope.employeeInfo.Mobile = "";
        $scope.employeeInfo.Email = "";

        addEmployeeDialog.$promise.then(addEmployeeDialog.show);
    };

    $scope.add = function() {

        if ($scope.employeeInfo.EmployeeName == "" || $scope.employeeInfo.EmployeeName == undefined)
        {
            balert.show('danger',$scope.languageJson.Person.Enter,3000);/*'请输入新增人员名字'*/
            return;
        }

        if ($scope.employeeInfo.Mobile == "" || $scope.employeeInfo.Mobile == undefined)
        {
            balert.show('danger',$scope.languageJson.Person.PhoneNumber,3000);/*'请输入手机号码'*/
            return;
        }

        if (isNaN($scope.employeeInfo.Mobile))
        {
            balert.show('danger',$scope.languageJson.Person.Incorrectly,3000);/*'手机号码输入有误!'*/
            return;
        }

        if ($scope.employeeInfo.Email == undefined)
            $scope.employeeInfo.Email = "";

        employeeService.insertEmployee($scope.employeeInfo.EmployeeName, $scope.employeeInfo.Mobile,$scope.employeeInfo.Email).then(function(data) {
            var result = data;
            if(result == "fail to insert employee")
            {
                balert.show('danger',$scope.languageJson.Person.Increase,3000);/*'增加人员失败，请检查数据库连接是否正常!'*/
            }
            else if(result == "repeat employee")
            {
                balert.show('danger',$scope.languageJson.Person.Already,3000);/*'该人员名字已存在，请重新输入!'*/
            }
            else
            {
                employeeService.getAllEmployees().then(function(data) {
                    $scope.employees = parseEmployees(data);
                    balert.show('success',$scope.languageJson.Person.Success,3000);/*'增加人员成功!'*/
                    addEmployeeDialog.hide();
                });
            }
        });
    };
    /******************************************   人员管理部分完成  **************************************************/
}]);

nurseController.controller( 'ProtocolCtrl', ['$scope','$modal', 'NgTableParams','equipmentTemplateService','uploadService', 'zipFileService', 'balert', 'bconfirm', function($scope, $modal, NgTableParams, equipmentTemplateService, uploadService, zipFileService, balert, bconfirm) {

    (function() {
        $scope.equipmentTemplateItems = -1;

        //配置分页基本参数
        $scope.paginationPro = {
            currentPage: 1,
            itemsPerPage: 10,
            pagesLength: 10,
            totalItems: 0,
            equipmentTemplates: [],
            perPageOptions: [10, 20, 30, 40, 50],
            onChange: function(){
            }
        };
    })();

    var addProtocolDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/addProtocol.html',
        show: false
    });

    $scope.addProtocol = function() {
        addProtocolDialog.$promise.then(addProtocolDialog.show);
        $scope.file = undefined;
    };

    $scope.viewProtocol = function(id) {
        $scope.selectedProtocolId = id;
    };

    $scope.removeProtocol = function(id, name) {
        $scope.selectedProtocolId = id;
        $scope.selectedProtocolName = name;

        //删除模板前判断是否被使用，如果正在使用则不允许删除
        equipmentTemplateService.getLoadEquipmentTemplateNums($scope.selectedProtocolId).then(function(data) {
            var prompt = $scope.languageJson.Agreement.Prompt;
            //删除完成后，返回模板个数
            var result = data;
            if(result == "fail to get load equipmenttemplate nums")
            {
                /*'获取被引用模板个数失败，请检查数据库连接!'*/
                balert.show('danger',prompt.FailGetLoadEquipmentTemplateNums,3000);
                return;
            }
            else
            {
                var counts = parseInt(data);
                if (counts > 0)
                {
                    /*'当前协议已被设备引用，不允许删除！'*/
                    balert.show('danger',prompt.UsingEquipmentTemplate,3000);
                    return;
                }
            }

            /*请确认是否删除模板：*/
            bconfirm.show($scope,prompt.DeleteConfirm+"(" + $scope.selectedProtocolId + ")" + $scope.selectedProtocolName + "?").then(function(data){
                if(data){
                    equipmentTemplateService.deleteEquipmentTemplate($scope.selectedProtocolId).then(function(data) {
                        //删除完成后，返回模板个数
                        var result = data;
                        if(result == "fail to delete equipmenttemplate")
                        {
                            /*'删除协议失败，请检查连接是否正常!'*/
                            balert.show('danger',prompt.FailDeleteEquipmentTemplate,3000);
                        }
                        else
                        {
                            $scope.equipmentTemplateItems = parseInt(data);
                            $scope.paginationPro.totalItems = $scope.equipmentTemplateItems;
                            balert.show('success',prompt.DeleteSuccess,3000);/*'删除协议成功!'*/
                        }
                    });
                }
            });
        });

    };

    $scope.$on("fileSelected",
        function(event, msg) {
            $scope.file = msg;
        });

    $scope.addProtocolFile = function() {
        $scope.loading = true;
        var file = $scope.file;

        if (file === undefined) return;

        addProtocolDialog.hide();
        uploadService.uploadFile($scope.file).then(function(data) {
            var prompt = $scope.languageJson.Agreement.Prompt;
            $scope.protocolFile = data;
            //上传文件成功，开始解压文件
            zipFileService.decompressionFile($scope.protocolFile).then(function(data) {

                $scope.unZipPath = data;

                if ($scope.unZipPath == "fail to decompression file") {
                    /*'解压文件失败，请检查上传文件是否有效zip文件!'*/
                    balert.show('danger',prompt.FailDecompressionFile,3000);
                }
                else{
                    //删除文件
                    uploadService.deleteUploadFile($scope.protocolFile);

                    //创建模板
                    equipmentTemplateService.createEquipmentTemplate($scope.unZipPath).then(function(data) {
                        //删除文件夹(为防止该文件夹后续还有用，暂时先不删除文件夹)
                        //uploadService.deleteUploadDirectory($scope.unZipPath);

                        //增加完成后，返回模板个数
                        var result = data;
                        $scope.loading = false;
                        if(result == "fail to create equipmenttemplate")
                        {
                            /*'增加协议文件失败，请检查协议格式是否正确!'*/
                            balert.show('danger',prompt.FailCreateEquipmenttemplate,3000);
                            addProtocolDialog.$promise.then(addProtocolDialog.show);
                        }
                        else if(result == "equipmenttemplate already exist")
                        {
                            /*'增加协议已存在，请重新选择协议!'*/
                            balert.show('danger',prompt.EquipmenttemplateAlreadyExist,3000);
                            addProtocolDialog.$promise.then(addProtocolDialog.show);
                        }
                        else
                        {
                            $scope.equipmentTemplateItems = parseInt(data);
                            $scope.paginationPro.totalItems = $scope.equipmentTemplateItems;
                            balert.show('success',prompt.Success,3000);/*'增加协议文件成功!'*/
                        }
                    });
                }
            });

        });
    };

    //调用获取模板个数
    /*function getEquipmentTemplates(newValue, oldValue) {
     if(newValue != undefined && newValue != -1) {
     equipmentTemplateService.getAllEquipmentTemplate().then(function (data) {
     $scope.paginationPro.equipmentTemplates = data;
     $scope.paginationPro.totalItems = data.length;
     });
     }
     };

     $scope.$watch(function() {

     var newValue = $scope.equipmentTemplateItems;
     return newValue;

     }, getEquipmentTemplates);*/
}]);

nurseController.controller( 'NotifyCtrl', ['$scope','$modal', 'NgTableParams','notifyService','employeeService', 'equipmentService', 'portService', 'balert','EmailService','netWorkPhoneService','bconfirm', function($scope, $modal, NgTableParams, notifyService, employeeService, equipmentService, portService, balert,EmailService,netWorkPhoneService,bconfirm) {

    (function() {
        $scope.eventNotifyRules = {};

        $scope.allSelected ={};
        $scope.allSelected.EquipmentSelected = false;
        $scope.allSelected.EventCategorySelected = false;
        $scope.allSelected.EventSeveritySelected = false;
        $scope.allSelected.EmployeeSelected = false;

        $scope.equipments = {};
        $scope.eventSeveritys = {};
        $scope.eventStates = {};
        $scope.employees = {};

        $scope.eventNotifyRuleInfo ={};
        $scope.eventNotifyRuleInfo.Description = "";

        $scope.eventNotifyRule ={};
        $scope.eventNotifyRule.NotifyID = -1;
        $scope.eventNotifyRule.Description = "";
        $scope.eventNotifyRule.NotifyMode = 1;
        $scope.eventNotifyRule.Receiver = "";
        $scope.eventNotifyRule.NotifyEventType = "";
        $scope.eventNotifyRule.NotifyEventLevel = "";
        $scope.eventNotifyRule.NotifyEquipID = "";

        $scope.smsPort = {};
        $scope.smsPort.PortNo = 1;
        $scope.smsPort.BaudRate = "";
        $scope.smsPort.SmsType = 1;

        $scope.NetWorkPhone = {};
        //获取告警过滤器
        notifyService.getAllEventNotifyRules().then(function (data) {
            $scope.eventNotifyRules = data;
            $scope.eventNotifyRuleItems = data.length;
        });

        //获取事件状态
        notifyService.getDataItems("69").then(function(data) {
            var result = data;
            if(result == "fail to get dataItems")
            {
                alert($scope.languageJson.AlarmNotice.EditorCtrl.Event.Title);/*获取事件状态失败，请检查连接是否正常!*/
            }
            else
            {
                //小机房目前只需要事件开始、事件结束两个状态
                var dataArray = [];
                data.forEach(function(item,index){
                    if(item.ItemId <= 2){
                        dataArray.push(item);
                    }
                });
                $scope.eventStates = parseDataItems(dataArray);
            }
        });

        //获取事件等级
        notifyService.getDataItems("23").then(function(data) {
            var result = data;
            if(result == "fail to get dataItems")
            {
                alert($scope.languageJson.AlarmNotice.EditorCtrl.Event.Connection);/*获取事件等级失败，请检查连接是否正常!*/
            }
            else
            {
                $scope.eventSeveritys = parseDataItems(data);
            }
        });

        //获取设备
        equipmentService.getAllEquipment().then(function(data) {
            var result = data;
            if(result == "fail to get all equipments")
            {
                alert($scope.languageJson.AlarmNotice.EditorCtrl.Event.Checkif);/*获取设备失败，请检查连接是否正常!*/
            }
            else
            {
                $scope.equipments = parseEquipments(data);
            }
        });

        //获取人员信息
        employeeService.getAllEmployees().then(function(data) {
            var result = data;
            if(result == "fail to get all employees")
            {
                alert($scope.languageJson.AlarmNotice.EditorCtrl.Event.Recipient);/*获取接收者失败，请检查连接是否正常!*/
            }
            else
            {
                $scope.employees = parseEmployees(data);
            }
        });
    })();

    //解析DataItems数据
    function parseDataItems(data) {

        var dataArray = [];

        data.forEach(function(element, index) {
            var dataItem = {};
            dataItem.Selected = false;
            dataItem.ItemId = element.ItemId;
            if($scope.languageJson.Language == 'English'){
                dataItem.ItemValue = element.ItemAlias;
                dataItem.Display = "[" + element.ItemId + "," + element.ItemAlias + "]";
            }else{
                dataItem.ItemValue = element.ItemValue;
                dataItem.Display = "[" + element.ItemId + "," + element.ItemValue + "]";
            }
            dataArray.push(dataItem);
        });

        return dataArray;
    }

    //解析Employee数据
    function parseEmployees(data) {

        var dataArray = [];

        data.forEach(function(element, index) {
            var employee = {};
            employee.Selected = false;
            employee.EmployeeId = element.EmployeeId;
            employee.EmployeeName = element.EmployeeName;
            employee.Mobile = element.Mobile;
            employee.Email = element.Email;
            dataArray.push(employee);
        });

        return dataArray;
    }

    function parseEquipments(data) {

        var dataArray = [];

        data.forEach(function(element, index) {
            var equipment = {};
            equipment.Selected = false;
            equipment.EquipmentId = element.EquipmentId;
            equipment.EquipmentName = element.EquipmentName;
            equipment.Display = "[" + element.EquipmentId + "," + element.EquipmentName + "]";
            dataArray.push(equipment);
        });

        return dataArray;
    }

    function parseEventNotifyRule(data) {
        var eventNotifyRule = {};

        data.forEach(function(element, index) {

            eventNotifyRule.NotifyID = element.NotifyID;
            eventNotifyRule.Description = element.Description;
            eventNotifyRule.NotifyMode = element.NotifyMode;
            eventNotifyRule.Receiver = element.Receiver;
            eventNotifyRule.NotifyEventType = element.NotifyEventType;
            eventNotifyRule.NotifyEventLevel = element.NotifyEventLevel;
            eventNotifyRule.NotifyEquipID = element.NotifyEquipID;
        });

        return eventNotifyRule;
    }

    function parseNotifyReceiver(data){
        var receivers = data.split(";");
        var dataArray = [];

        for(var i=0; i< receivers.length; i++)
        {
            var notifyReceiver = {};
            var receiver = receivers[i].split("|");
            notifyReceiver.ReceiverName = receiver[0];
            notifyReceiver.ReceiverMobile = receiver[1];

            dataArray.push(notifyReceiver);
        }

        return dataArray;
    }

    function parseNotifyValue(data){
        var values = data.split(",");
        var dataArray = [];

        for(var i=0; i< values.length; i++)
        {
            var notifyValue = {};
            notifyValue.Value = values[i];

            dataArray.push(notifyValue);
        }

        return dataArray;
    }
    //过滤器个数变化
     function getEventNotifyRules(newValue, oldValue) {
         if(newValue != undefined && oldValue != undefined) {
             notifyService.getAllEventNotifyRules().then(function (data) {
                 $scope.eventNotifyRules = data;
             });
         }
     };

     $scope.$watch(function() {

         var newValue = $scope.eventNotifyRuleItems;
         return newValue;

     }, getEventNotifyRules);

    var setSMSPortDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/setSMSPort.html',
        show: false
    });

    var addEventFilterDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/addEventFilter.html',
        show: false
    });

    var inputEventFilterInfoDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/inputEventFilterInfo.html',
        show: false
    });

    $scope.set = function() {

        if ($scope.smsPort.PortNo == "" || $scope.smsPort.PortNo == undefined)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Serial.Title,3000);/*'请输入串口号'*/
            return;
        }

        if ($scope.smsPort.BaudRate == "" || $scope.smsPort.BaudRate == undefined)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Serial.Parameters,3000);/*'请输入串口参数'*/
            return;
        }

        if ($scope.smsPort.SmsType == "" || $scope.smsPort.SmsType == undefined)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Serial.SMS,3000);/*'请输入SMS类型'*/
            return;
        }

        //插入串口参数
        portService.getInsertSmsPort($scope.smsPort).then(function (data) {
            if (data != "OK") {
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Serial.Ifthe,3000);/*'串口参数设置失败，请检查连接是否正常!'*/
                return;
            }

            balert.show('success',$scope.languageJson.AlarmNotice.EditorCtrl.Serial.Port,3000);/*'串口参数设置成功!'*/
            setSMSPortDialog.hide();

        });
    };

    function getSmsPort(data) {
        var smsPort = {};

        data.forEach(function(element, index) {
            smsPort.PortNo = element.PortNo;
            smsPort.BaudRate = element.BaudRate;
            smsPort.SmsType = element.SmsType;
        });

        return smsPort;
    }

    $scope.setSMSPort = function() {

        //查看端口参数
        portService.getDefaultSmsPort().then(function(data) {
            $scope.smsPort = getSmsPort(data);

            setSMSPortDialog.$promise.then(setSMSPortDialog.show);
        });
    };

    $scope.addEventFilter = function() {

        //每次增加前重新获取接收者
        employeeService.getAllEmployees().then(function(data) {
            var result = data;
            if(result == "fail to get all employees")
            {
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Serial.Failed,3000);/*'获取接收者失败，请检查连接是否正常!'*/
            }
            else
            {
                $scope.employees = parseMobileEmployees(data);

                $scope.bViewEventFilter = false;
                $scope.btnName = $scope.languageJson.AlarmNotice.Adds;
                $scope.addEventFilterTitle = $scope.languageJson.AlarmNotice.EditorCtrl.Serial.Filter;/*"增加短信过滤器"*/

                initAddDatas();
                addEventFilterDialog.$promise.then(addEventFilterDialog.show);
            }
        });
    };

    //解析筛选手机用户
    function parseMobileEmployees(data){
        var dataArray = [];

        data.forEach(function(element, index) {
            if(element.Mobile != undefined && element.Mobile != ""){
                var employee = {};
                employee.Selected = false;
                employee.EmployeeId = element.EmployeeId;
                employee.EmployeeName = element.EmployeeName;
                employee.Mobile = element.Mobile;
                employee.Email = element.Email;
                dataArray.push(employee);
            }
        });

        return dataArray;
    }

    $scope.viewEventFilter = function(NotifyID) {

        $scope.bViewEventFilter = true;
        $scope.btnName = $scope.languageJson.AlarmNotice.Determine;
        $scope.addEventFilterTitle = $scope.languageJson.AlarmNotice.EditorCtrl.Serial.View;/*"查看过滤器"*/

        initViewDatas(NotifyID);
    };

    $scope.addEventFilterInfo = function() {
        if(!$scope.bViewEventFilter) {
            var bMiss = IsMissSelected();
            if (bMiss) {
                return;
            }

            $scope.eventNotifyRuleInfo.Description = "";

            inputEventFilterInfoDialog.$promise.then(inputEventFilterInfoDialog.show);
        }
        else{
            addEventFilterDialog.hide();
        }
    };

    /******************************************   增加声光告警配置开始  **************************************************/

    var addSLAlarmFilterDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/addSLAlarmFilter.html',
        show: false
    });

    $scope.addSLAlarmFilter = function() {

        //每次增加前重新获取接收者
        employeeService.getDOEmployees().then(function(data) {
            var result = data;
            if(result == "fail to get all employees")
            {
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Dport.Title,3000);/*'获取DO口配置失败，请检查连接是否正常!'*/
            }
            else
            {
                $scope.employees = parseEmployees(data);

                $scope.bViewEventFilter = false;
                $scope.btnName = $scope.languageJson.AlarmNotice.EditorCtrl.Dport.Add;/*增加*/
                $scope.addEventFilterTitle =$scope.languageJson.AlarmNotice.EditorCtrl.Dport.Filter;/*增加声光过滤器*/

                initAddDatas();
                addSLAlarmFilterDialog.$promise.then(addSLAlarmFilterDialog.show);
            }
        });
    };

    $scope.selectDO = function(EmployeeId) {

        for(var i=0; i< $scope.employees.length; i++)
        {
            if($scope.employees[i].EmployeeId == EmployeeId)
            {
                $scope.employees[i].Selected = true;
            }
            else
            {
                $scope.employees[i].Selected = false;
            }
        }
    };

    $scope.addSLAlarmFilterInfo = function() {
        if(!$scope.bViewEventFilter) {
            var bMiss = IsSLAlarmMissSelected();
            if (bMiss) {
                return;
            }

            $scope.eventNotifyRuleInfo.Description = "";

            inputEventFilterInfoDialog.$promise.then(inputEventFilterInfoDialog.show);
        }
        else{
            addSLAlarmFilterDialog.hide();
        }
    };

    //重新初始化数据数据
    function IsSLAlarmMissSelected() {

        //判断是否遗漏
        var bFlag = true;
        for(var i=0; i< $scope.eventStates.length; i++)
        {
            if($scope.eventStates[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            alert($scope.languageJson.AlarmNotice.EditorCtrl.Dport.Ofevent);/*事件状态没有选择，请至少选择一项!*/
            return true;
        }

        bFlag = true;
        for(var i=0; i< $scope.eventSeveritys.length; i++)
        {
            if($scope.eventSeveritys[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            alert($scope.languageJson.AlarmNotice.EditorCtrl.Dport.Event);/*"事件等级没有选择，请至少选择一项!"*/
            return true;
        }

        bFlag = true;
        for(var i=0; i< $scope.equipments.length; i++)
        {
            if($scope.equipments[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            alert($scope.languageJson.AlarmNotice.EditorCtrl.Dport.Device);/*"设备没有选择，请至少选择一项!"*/
            return true;
        }

        bFlag = true;
        for(var i=0; i< $scope.employees.length; i++)
        {
            if($scope.employees[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            alert($scope.languageJson.AlarmNotice.EditorCtrl.Dport.DO);/*"DO口配置没有选择，请至少选择一项!"*/
            return true;
        }

        return false;
    }


    /******************************************   增加声光告警配置完成  **************************************************/

    $scope.add = function() {

        if ($scope.eventNotifyRuleInfo.Description == "" || $scope.eventNotifyRuleInfo.Description == undefined)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Title,3000);/*'请输入过滤器名称'*/
            return;
        }
        var bool = false;
        $scope.eventNotifyRules.forEach(function(item){
            if(item.Description == $scope.eventNotifyRuleInfo.Description){
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Name,3000);/*'过滤器名称重复，请重新输入！'*/
                bool = true;
            }
        });
        if(bool) return;

        //插入过滤器
        notifyService.setEventNotifyRule($scope.eventNotifyRuleInfo.Description, 1,  $scope.employees,  $scope.eventStates, $scope.eventSeveritys, $scope.equipments).then(function (data) {
            if (data != "OK") {
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Increase,3000);/*'增加过滤器初始化失败，请检查连接是否正常!'*/
                return;
            }

            notifyService.getAllEventNotifyRules().then(function (data) {
                $scope.eventNotifyRules = data;

                inputEventFilterInfoDialog.hide();
                addEventFilterDialog.hide();
                addSLAlarmFilterDialog.hide();
                addMailFilterDialog.hide();
            });
        });
    };

    $scope.removeEventFilter = function(id, name) {
        $scope.selectedNotifyID = id;
        $scope.selectedNotifyName = name;

        //删除过滤器前确认是否删除
        /*请确认是否删除过滤器：*/
        bconfirm.show($scope,$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Confirm + $scope.selectedNotifyID + "]" + $scope.selectedNotifyName + "?").then(function(data){
            if(data){
                notifyService.deleteEventNotifyRule($scope.selectedNotifyID).then(function(data) {
                    //删除完成后，返回模板个数
                    var result = data;
                    if(result == "fail to delete eventFilter")
                    {
                        balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Failed,3000);/*删除过滤器失败，请检查连接是否正常!*/
                    }
                    else
                    {
                        notifyService.getAllEventNotifyRules().then(function (data) {
                            $scope.eventNotifyRules = data;

                            balert.show('success',$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Deleting,3000);/*'删除过滤器成功!'*/
                        });
                    }
                });
            }
        });
    };

    //重新初始化数据数据
    function initAddDatas() {

        $scope.allSelected ={};
        $scope.allSelected.EventStateSelected = false;
        $scope.allSelected.EventSeveritySelected = false;
        $scope.allSelected.EquipmentSelected = false;
        $scope.allSelected.EmployeeSelected = false;

        for(var i=0; i< $scope.equipments.length; i++)
        {
            $scope.equipments[i].Selected = false;
        }

        for(var i=0; i< $scope.eventSeveritys.length; i++)
        {
            $scope.eventSeveritys[i].Selected = false;
        }

        for(var i=0; i< $scope.eventStates.length; i++)
        {
            $scope.eventStates[i].Selected = false;
        }
    }

    //重新初始化数据数据
    function initViewDatas(NotifyID) {

        $scope.allSelected ={};
        $scope.allSelected.EquipmentSelected = false;
        $scope.allSelected.EventSeveritySelected = false;
        $scope.allSelected.EventStateSelected = false;
        $scope.allSelected.EmployeeSelected = false;

        notifyService.getEventNotifyRule(NotifyID).then(function (data) {
            if (data == "fail to get eventNotifyRule") {
                alert($scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Obtained);/*获取告警通知过滤失败，请检查连接是否正常!*/
                return false;
            }

            $scope.eventNotifyRule =parseEventNotifyRule(data);

            //判断接收者选择情况
            var bSelected = true;
            var notifyReceivers = parseNotifyReceiver($scope.eventNotifyRule.Receiver);

            //判断是声光告警还是短信告警
            var type = 0;       //0表示短信告警、1表示声光告警
            for(var j=0; j<notifyReceivers.length; j++)
            {
                var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
                if(notifyReceivers[j].ReceiverMobile.indexOf("88888888") > -1)
                {
                    type = 1;
                    break;
                }else if(reg.test(notifyReceivers[j].ReceiverMobile)){
                    type = 2;
                    break;
                }
            }

            if(type == 1)
            {
                //如果查看声光告警
                //获取人员信息
                employeeService.getDOEmployees().then(function(data) {
                    var result = data;
                    if(result == "fail to get all employees")
                    {
                        alert($scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.DO);/*获取DO配置失败，请检查连接是否正常!*/
                    }
                    else
                    {
                        $scope.employees = parseEmployees(data);

                        for(var i=0; i< $scope.employees.length; i++)
                        {
                            $scope.employees[i].Selected = false;
                            for(var j=0; j<notifyReceivers.length; j++)
                            {
                                if($scope.employees[i].EmployeeName == notifyReceivers[j].ReceiverName
                                    && $scope.employees[i].Mobile == notifyReceivers[j].ReceiverMobile)
                                {
                                    $scope.employees[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.employees[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EmployeeSelected = true;
                        }

                        //判断事件状态选择情况
                        bSelected = true;
                        var notifyEventType = parseNotifyValue($scope.eventNotifyRule.NotifyEventType);
                        for(var i=0; i< $scope.eventStates.length; i++)
                        {
                            $scope.eventStates[i].Selected = false;
                            for(var j=0; j<notifyEventType.length; j++)
                            {
                                if($scope.eventStates[i].ItemId == notifyEventType[j].Value)
                                {
                                    $scope.eventStates[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.eventStates[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EventStateSelected = true;
                        }

                        //判断告警等级选择情况
                        bSelected = true;
                        var notifyEventLevel = parseNotifyValue($scope.eventNotifyRule.NotifyEventLevel);
                        for(var i=0; i< $scope.eventSeveritys.length; i++)
                        {
                            $scope.eventSeveritys[i].Selected = false;
                            for(var j=0; j<notifyEventLevel.length; j++)
                            {
                                if($scope.eventSeveritys[i].ItemId == notifyEventLevel[j].Value)
                                {
                                    $scope.eventSeveritys[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.eventSeveritys[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EventSeveritySelected = true;
                        }

                        //判断设备选择情况
                        bSelected = true;
                        var notifyEquipmentId = parseNotifyValue($scope.eventNotifyRule.NotifyEquipID);
                        for(var i=0; i< $scope.equipments.length; i++)
                        {
                            $scope.equipments[i].Selected = false;
                            for(var j=0; j<notifyEquipmentId.length; j++)
                            {
                                if($scope.equipments[i].EquipmentId == notifyEquipmentId[j].Value)
                                {
                                    $scope.equipments[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.equipments[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EquipmentSelected = true;
                        }

                        addSLAlarmFilterDialog.$promise.then(addSLAlarmFilterDialog.show);
                    }
                });
            }
            else{
                //如果查看短信告警
                //获取人员信息
                employeeService.getAllEmployees().then(function(data) {
                    var result = data;
                    if(result == "fail to get all employees")
                    {
                        alert($scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Connection);/*"获取接收者失败，请检查连接是否正常!"*/
                    }
                    else
                    {
                        if(type == 2) //邮箱过滤
                            $scope.employees = parseMails(data);
                        else
                            $scope.employees = parseEmployees(data);

                        for(var i=0; i< $scope.employees.length; i++)
                        {
                            $scope.employees[i].Selected = false;
                            for(var j=0; j<notifyReceivers.length; j++)
                            {
                                if($scope.employees[i].EmployeeName == notifyReceivers[j].ReceiverName
                                    && $scope.employees[i].Mobile == notifyReceivers[j].ReceiverMobile)
                                {
                                    $scope.employees[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.employees[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EmployeeSelected = true;
                        }

                        //判断事件状态选择情况
                        bSelected = true;
                        var notifyEventType = parseNotifyValue($scope.eventNotifyRule.NotifyEventType);
                        for(var i=0; i< $scope.eventStates.length; i++)
                        {
                            $scope.eventStates[i].Selected = false;
                            for(var j=0; j<notifyEventType.length; j++)
                            {
                                if($scope.eventStates[i].ItemId == notifyEventType[j].Value)
                                {
                                    $scope.eventStates[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.eventStates[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EventStateSelected = true;
                        }

                        //判断告警等级选择情况
                        bSelected = true;
                        var notifyEventLevel = parseNotifyValue($scope.eventNotifyRule.NotifyEventLevel);
                        for(var i=0; i< $scope.eventSeveritys.length; i++)
                        {
                            $scope.eventSeveritys[i].Selected = false;
                            for(var j=0; j<notifyEventLevel.length; j++)
                            {
                                if($scope.eventSeveritys[i].ItemId == notifyEventLevel[j].Value)
                                {
                                    $scope.eventSeveritys[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.eventSeveritys[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EventSeveritySelected = true;
                        }

                        //判断设备选择情况
                        bSelected = true;
                        var notifyEquipmentId = parseNotifyValue($scope.eventNotifyRule.NotifyEquipID);
                        for(var i=0; i< $scope.equipments.length; i++)
                        {
                            $scope.equipments[i].Selected = false;
                            for(var j=0; j<notifyEquipmentId.length; j++)
                            {
                                if($scope.equipments[i].EquipmentId == notifyEquipmentId[j].Value)
                                {
                                    $scope.equipments[i].Selected = true;
                                    break;
                                }
                            }

                            if(!$scope.equipments[i].Selected)
                            {
                                bSelected = false;
                            }
                        }

                        if(bSelected)
                        {
                            $scope.allSelected.EquipmentSelected = true;
                        }

                        if(type == 2) //邮箱过滤
                            addMailFilterDialog.$promise.then(addMailFilterDialog.show);
                        else
                            addEventFilterDialog.$promise.then(addEventFilterDialog.show);
                    }
                });
            }

            return true;
        });
    }

    $scope.selectAllEquipment = function() {

        if($scope.allSelected.EquipmentSelected)
        {
            //选择全选
            $scope.equipments.forEach(function(item) {
                item.Selected = true;
            });
        }
        else
        {
            //选择全不选
            $scope.equipments.forEach(function(item) {
                item.Selected = false;
            });
        }
    };

    $scope.selectEquipment = function() {
        var bSelected = true;

        for(var i=0; i< $scope.equipments.length; i++)
        {
            if(!$scope.equipments[i].Selected)
            {
                bSelected = false;
                break;
            }
        }

        if(!bSelected)
        {
            $scope.allSelected.EquipmentSelected = false;
        }
        else
        {
            $scope.allSelected.EquipmentSelected = true;
        }
    };

    $scope.selectAllEventSeverity = function() {

        if($scope.allSelected.EventSeveritySelected)
        {
            //选择全选
            $scope.eventSeveritys.forEach(function(item) {
                item.Selected = true;
            });
        }
        else
        {
            //选择全不选
            $scope.eventSeveritys.forEach(function(item) {
                item.Selected = false;
            });
        }
    };

    $scope.selectEventSeverity = function() {
        var bSelected = true;

        for(var i=0; i< $scope.eventSeveritys.length; i++)
        {
            if(!$scope.eventSeveritys[i].Selected)
            {
                bSelected = false;
                break;
            }
        }

        if(!bSelected)
        {
            $scope.allSelected.EventSeveritySelected = false;
        }
        else
        {
            $scope.allSelected.EventSeveritySelected = true;
        }
    };

    $scope.selectAllEventState = function() {

        if($scope.allSelected.EventStateSelected)
        {
            //选择全选
            $scope.eventStates.forEach(function(item) {
                item.Selected = true;
            });
        }
        else
        {
            //选择全不选
            $scope.eventStates.forEach(function(item) {
                item.Selected = false;
            });
        }
    };

    $scope.selectEventState = function() {
        var bSelected = true;

        for(var i=0; i< $scope.eventStates.length; i++)
        {
            if(!$scope.eventStates[i].Selected)
            {
                bSelected = false;
                break;
            }
        }

        if(!bSelected)
        {
            $scope.allSelected.EventStateSelected = false;
        }
        else
        {
            $scope.allSelected.EventStateSelected = true;
        }
    };

    $scope.selectAllEmployee = function() {

        if($scope.allSelected.EmployeeSelected)
        {
            //选择全选
            $scope.employees.forEach(function(item) {
                item.Selected = true;
            });
        }
        else
        {
            //选择全不选
            $scope.employees.forEach(function(item) {
                item.Selected = false;
            });
        }
    };

    $scope.selectEmployee = function() {
        var bSelected = true;

        for(var i=0; i< $scope.employees.length; i++)
        {
            if(!$scope.employees[i].Selected)
            {
                bSelected = false;
                break;
            }
        }

        if(!bSelected)
        {
            $scope.allSelected.EmployeeSelected = false;
        }
        else
        {
            $scope.allSelected.EmployeeSelected = true;
        }
    };


    /******************************************   邮箱告警过滤  start **************************************************/
    var addMailFilterDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/addMailFilter.html',
        show: false
    });
    var setMailTimingDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/setMailTiming.html',
        show: false
    });

    $scope.addMailFilter = function(){
        //每次增加前重新获取接收者
        employeeService.getAllEmployees().then(function(data) {
            var result = data;
            if(result == "fail to get all employees")
            {
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Duplicated.Connection,3000);/*获取接收者失败，请检查连接是否正常!*/
            }
            else
            {
                $scope.employees = parseMails(data);

                $scope.bViewEventFilter = false;
                $scope.addEventFilterTitle = $scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Title;/*"新增邮箱过滤器";*/
                $scope.btnName = $scope.languageJson.AlarmNotice.Adds;

                initAddDatas();
                addMailFilterDialog.$promise.then(addMailFilterDialog.show);
            }
        });
    };

    $scope.addMailFilterInfo = function(){
        if(!$scope.bViewEventFilter) {
            var bMiss = IsMissSelected();
            if (bMiss) {
                return;
            }

            $scope.eventNotifyRuleInfo.Description = "";

            inputEventFilterInfoDialog.$promise.then(inputEventFilterInfoDialog.show);
        }
        else{
            addSLAlarmFilterDialog.hide();
        }
    };

    //解析Employee数据
    function parseMails(data) {

        var dataArray = [];

        data.forEach(function(element, index) {
            if(element.Email != undefined && element.Email != ""){
                var employee = {};
                employee.Selected = false;
                employee.EmployeeId = element.EmployeeId;
                employee.EmployeeName = element.EmployeeName;
                employee.Mobile = element.Email;
                dataArray.push(employee);
            }
        });

        return dataArray;
    }

    $scope.mailTim = {
        isMonth : false,
        isWeek : false,
        isTime : false
    };
    $scope.setMailTiming = function(){
        EmailService.getMailDict().then(function(data){
            parseMailDict(data);
        });
        EmailService.GetEmailAccount().then(function(data){
            $scope.EmailAccount = data;
        });

        setMailTimingDialog.$promise.then(setMailTimingDialog.show);
    };

    function parseMailDict(data){
        $scope.mailTim.type = data.Type;
        $scope.mailTim.day = data.Data.day;
        $scope.mailTim.week = data.Data.week;
        $scope.mailTim.hour = data.Data.hour;
        $scope.mailTim.minute = data.Data.minute;

        $scope.changeMail(data.Type);
    }

    $scope.changeMail = function(type){
        $scope.mailTim.isTime = false;
        $scope.mailTim.isMonth = false;
        $scope.mailTim.isWeek = false;

        if(type != 'all'){
            $scope.mailTim.isTime = true;
        }
        if(type == 'month'){
            $scope.mailTim.isMonth = true;
        }else if(type == 'week'){
            $scope.mailTim.isWeek = true;
        }
    };

    $scope.setMailDict = function(){
        if($scope.mailTim.type != "all"){
            if($scope.mailTim.type == "month"){
                if(($scope.mailTim.day == undefined || $scope.mailTim.day == "") ||
                    ($scope.mailTim.day < 1 || $scope.mailTim.day > 31) || isNaN($scope.mailTim.day)){
                    balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Date,3000);/*'日期不合法！'*/
                    return;
                }
            }
            if($scope.mailTim.type == "week"){
                if(($scope.mailTim.week == undefined || $scope.mailTim.week == "") ||
                    ($scope.mailTim.week < 1 || $scope.mailTim.week > 7) || isNaN($scope.mailTim.week)){
                    balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Legal,3000);/*'星期数不合法！'*/
                    return;
                }
            }
            var hour = parseInt($scope.mailTim.hour);
            if(($scope.mailTim.hour == undefined || $scope.mailTim.hour == "") ||
                (hour < 0 || hour > 23) || isNaN($scope.mailTim.hour)){
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Hours,3000);/*'小时数不合法！'*/
                return;
            }
            var minute = parseInt($scope.mailTim.minute);
            if(($scope.mailTim.minute == undefined || $scope.mailTim.minute == "") ||
                (minute < 0 || minute > 59) || isNaN($scope.mailTim.minute)){
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Minutes,3000);/*'分钟数不合法！'*/
                return;
            }
        }
        EmailService.setMailDict($scope.mailTim,$scope.EmailAccount).then(function(data){
            if(data == "OK"){
                balert.show('success',$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Successfully,3000);/*'修改成功！'*/
                setMailTimingDialog.hide();
            }else{
                balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Fail,3000);/*'修改失败！'*/
            }
        });
    };
    $scope.FaEye = "fa-eye-slash";
    $scope.isShowPwd = function(){
        if($scope.FaEye == "fa-eye"){
            $scope.FaEye = "fa-eye-slash";
            $("#Pwd2").hide();
            $("#Pwd1").show();
        }else{
            $scope.FaEye = "fa-eye";
            $("#Pwd1").hide();
            $("#Pwd2").show();
        }
    };
    /******************************************   邮箱告警过滤  ent **************************************************/

    /******************************************   电话短信设置  start **************************************************/
    var setNetWorkPhoneDialog = $modal({
        scope: $scope,
        templateUrl: 'partials/setNetWorkPhone.html',
        show: false
    });


    $scope.setNetWorkPhone = function(){
        setNetWorkPhoneDialog.$promise.then(setNetWorkPhoneDialog.show);
        netWorkPhoneService.getNetPhoneInfo().then(function(data){
            $scope.NetWorkPhone = data[0];
            $scope.NetWorkPhone.netIp = data[0].npIp;
            $scope.NetWorkPhone.netPort = data[0].npPort;
            $scope.NetWorkPhone.netType = data[0].type;
            $scope.NetWorkPhone.textFormat = data[0].textFormat;

            $scope.changeWorkPhone(data[0].timeType);
        });
    };

    $scope.changeWorkPhone = function(type){
        $scope.NetWorkPhone.isTime = false;
        $scope.NetWorkPhone.isMonth = false;
        $scope.NetWorkPhone.isWeek = false;

        if(type != 'real'){
            $scope.NetWorkPhone.isTime = true;
        }
        if(type == 'month'){
            $scope.NetWorkPhone.isMonth = true;
        }else if(type == 'week'){
            $scope.NetWorkPhone.isWeek = true;
        }
    }

    $scope.NetWorkPhone.textFormat = "";
    $scope.changeNetContentPart = function(netContent){
        $scope.NetWorkPhone.textFormat += netContent+ " ";
    };
    $scope.setNetWorkPhoneButton = function(){
        if(checkNetWorkPhoneField()){
            var timeRegularly = parseTimeRegularly($scope.NetWorkPhone);
            var fieldContent = $scope.NetWorkPhone.netIp+"|"+$scope.NetWorkPhone.netPort+"|"+$scope.NetWorkPhone.netType+"|"+
                $scope.NetWorkPhone.textFormat+"|"+$scope.NetWorkPhone.enable+"|"+$scope.NetWorkPhone.timeType+"|"+timeRegularly;
            netWorkPhoneService.setNetPhone(fieldContent).then(function(data){
                if(data == "OK"){
                    balert.show("success",$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Setup,3000);/*"设置成功"*/
                    setNetWorkPhoneDialog.hide();
                }else{
                    balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Mailbox.Failed,3000);/*"设置失败"*/
                }
            });
        }
    };

    function checkNetWorkPhoneField(){
        var obj = $scope.NetWorkPhone;
        if(obj.timeType != "real"){
            if(obj.timeType == "week"){
                if(obj.week < 1 || obj.week > 7){
                    balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.Title,1500);/*"时间格式不正切，一周只有7天。"*/
                    return false;
                }
            }
            if(obj.timeType == "month"){
                if(obj.day == "" || obj.day < 1 || obj.day > 31){
                    balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.January,1500);/*"时间格式不正切，一月只有31天。"*/
                    return false;
                }
            }
            if(obj.hour == "" || obj.hour < 0 || obj.hour > 24){
                balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.Day,1500);/*"时间格式不正切，一天只有24小时。"*/
                return false;
            }
            if(obj.minute == "" || obj.minute < 0 || obj.minute > 60){
                balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.Minutes,1500);/*"时间格式不正切，一小时只有60分钟。"*/
                return false;
            }
        }

        var fieldName = "IP|Port";
        var fieldContent = obj.netIp+"|"+obj.netPort;
        if(obj.netIp == undefined || obj.netIp == ""
            || obj.netPort == undefined || obj.netPort == ""
            || obj.netType == undefined || obj.netType == ""
            || obj.textFormat == undefined || obj.textFormat == ""){
                balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.Please,1500);/*"请填写完整信息"*/
                return false;
        }else {
            return regCheck(fieldName,fieldContent);
        }
    }

    function regCheck(fieldName,fieldContent){
        var flagIp = true;
        var flagPort = true;
        var netIp = fieldName.split("|")[0];
        var netPort = fieldName.split("|")[1];
        var ipContent = fieldContent.split("|")[0];
        var portContent = fieldContent.split("|")[1];
        if(netIp == "IP"){
            var ipSplit = ipContent.split(".");
            if(ipSplit.length == 4){
                for (var i = 0;i<ipSplit.length;i++){
                    if(!isNaN(ipSplit[i])){
                        var temp = parseInt(ipSplit[i]);
                        if(temp < 0 || temp > 255){
                            flagIp = false;
                            balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.IP,1500);/*"IP设置错误"*/
                            break;
                        }
                    }else{
                        flagIp = false;
                        balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.IP,1500);/*"IP设置错误"*/
                    }
                }
            }else{
                flagIp = false;
                balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.IP,1500);/*"IP设置错误"*/
            }
        }
        if(netPort == "Port"){
            if(!isNaN(portContent)){
                var temp = parseInt(fieldContent);
                if(temp < 0 || temp > 65535){
                    flagPort = false;
                    balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.Port,1500);/*"端口设置错误"*/
                }
            }else{
                flagPort = false;
                balert.show("danger",$scope.languageJson.AlarmNotice.EditorCtrl.Week.Port,1500);/*"端口设置错误"*/
            }
        }
        return flagIp && flagPort;
    }

    function parseTimeRegularly(obj){
        var result = "";
        if(obj.timeType != "real"){
            if(obj.timeType == "week"){
                result = obj.week+" ";
            }
            if(obj.timeType == "month"){
                result = obj.day+" ";
            }
            result += obj.hour+":"+obj.minute;
        }
        return result;
    }

    /******************************************   电话短信设置  end **************************************************/

    //重新初始化数据数据
    function IsMissSelected() {

        //判断是否遗漏
        var bFlag = true;
        for(var i=0; i< $scope.eventStates.length; i++)
        {
            if($scope.eventStates[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Week.There,3000);/*'事件状态没有选择，请至少选择一项!'*/
            return true;
        }

        bFlag = true;
        for(var i=0; i< $scope.eventSeveritys.length; i++)
        {
            if($scope.eventSeveritys[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Week.Level,3000);/*'事件等级没有选择，请至少选择一项!'*/
            return true;
        }

        bFlag = true;
        for(var i=0; i< $scope.equipments.length; i++)
        {
            if($scope.equipments[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Week.One,3000);/*'设备没有选择，请至少选择一项!'*/
            return true;
        }

        bFlag = true;
        for(var i=0; i< $scope.employees.length; i++)
        {
            if($scope.employees[i].Selected)
            {
                bFlag = false;
                break;
            }
        }
        if(bFlag)
        {
            balert.show('danger',$scope.languageJson.AlarmNotice.EditorCtrl.Week.Recipient,3000);/*'接收者没有选择，请至少选择一项!'*/
            return true;
        }

        return false;
    }
}]);

nurseController.controller('editorCtrl', ['$scope', '$http', '$modal', '$q', '$timeout', 'arenaService','uploadService',
    function($scope, $http, $modal, $q, $timeout, arenaService, uploadService){
   
    var options = {};

    options.shell = {};
    options.shell.$scope = $scope;
    options.shell.$modal = $modal;
    options.shell.$q = $q;
    options.shell.$http = $http;
    options.shell.$srv = arenaService;
    options.shell.$upload = uploadService;
        var s = $scope.languageJson.Room3D.Title;
    function cancelBubble(e) {
     var evt = e ? e:window.event;
     if (evt.stopPropagation)    evt.stopPropagation();
     if (evt.cancelBubble!=null) evt.cancelBubble = true;
    }

    $timeout(function() {
      $('#titleInput,#angleInput,#aboveInput,#moldSelect').keyup(function(event) {
        cancelBubble(event);
      });

      $scope.bn = Bench.create("graphContainer",options)
      arenaService.getConfig("demo").then(function(data){
        if (data) $scope.bn.load(data);
      });
    }, 1000);

    $scope.$on(
      "$destroy",
      function handleDestroyEvent() {
        if ($scope.bn) $scope.bn.dispose();
      }
    ); 
}]);

nurseController.controller('viewerCtrl', ['$scope', '$http', '$interval', 'arenaService','$location', 
    function($scope, $http, $interval, arenaService, $location){
   
  var options ={};
    options.shell = {};
    options.shell.$interval = $interval;
    options.shell.url = "http://google.com";
    options.shell.$srv = arenaService;
    options.shell.$location = $location;

    arenaService.getConfig("demo").then(function(data){
      if (data)
        $scope.ar = Arena.create("view3D",data, options);
      else
        $scope.ar = Arena.create("view3D", options);
    });

    $scope.$on(
      "$destroy",
      function handleDestroyEvent() {
        if ($scope.ar) $scope.ar.dispose();
      }
    );
}]);

nurseController.controller('systemSettingCtrl',['$scope','$modal','$http','$state','$stateParams','TimerService','IpService','balert','MdcAlarmService','MdcConfigService','$window','$location','$rootScope','equipmentTemplateService','baseTypeService','TemplateService','$interval','alarmService','SystemSetting','HistoryDataClear','ConfigureMoldService','uploadService','deviceService', 'userService','languageService','diagramService','bconfirm','$compile','Exporter','zipFileService','base64',
    function($scope,$modal,$http,$state,$stateParams,TimerService,IpService,balert,MdcAlarmService,MdcConfigService,$window,$location,$rootScope,equipmentTemplateService,baseTypeService,TemplateService,$interval,alarmService,SystemSetting,HistoryDataClear,ConfigureMoldService,uploadService,deviceService, userService,languageService,diagramService,bconfirm,$compile,Exporter,zipFileService,base64){

        var ipSettingDialog = null;
        var configMdcDialog = null;
        var bindDeviceDialog = null;
        var showPollingDialog = null;

        //系统名称
        $(document).attr("title",localStorage.getItem("userTitle"));
        $(".logotitle").text(localStorage.getItem("userTitle"));
        $(".logo").attr("src",localStorage.getItem("userLogo"));

        $interval(function(){
            initAlarmNumber();
        },3000);

// ###########################################  登入长时间未操作 START  #########################################

        initLoginOut();
        function initLoginOut() {
            var lastTime = new Date().getTime();    //最后一次操作时间
            var currentTime = new Date().getTime(); //当前时间
            var timeOut = localStorage.getItem("logoutTime"); //超时时间
            timeOut = parseFloat(timeOut)*60*1000;
            console.log("timeOut:"+timeOut);
            if(!isNaN(timeOut) && timeOut > 1000){
                if(localStorage.getItem("RunTimeOut") == null)//解决启动多个线程
                    localStorage.setItem("RunTimeOut","true");
            }else{
                localStorage.setItem("RunTimeOut","false");
            }

            /* 鼠标移动事件 */
            $(document).mouseover(function(){
                lastTime = new Date().getTime(); //更新操作时间
            });
            /* 鼠标点击事件 */
            $(document).click(function(){
                lastTime = new Date().getTime(); //更新操作时间
            });
            /* 键盘点击事件 */
            $(document).keypress(function(){
                lastTime = new Date().getTime(); //更新操作时间
            });

            //是否超时
            function loginOut(){
                currentTime = new Date().getTime(); //更新当前时间
                console.log("Now Date:"+new Date()+",CurrentTime:"+currentTime+", LastTime:"+lastTime+", => "+(currentTime - lastTime));
                if(currentTime - lastTime > timeOut){ //判断是否超时
                    $scope.exit();
                    console.log("LoginOut! Now Date:"+new Date());
                }
            }

            /* 定时器  间隔1秒检测是否长时间未操作页面  */
            if(localStorage.getItem("RunTimeOut") == "true") {//解决刷新页面启动多个线程
                //localStorage.setItem("RunTimeOut","false");
                window.setInterval(loginOut, 10000);
            }
        };

        //退出
        $scope.exit = function () {
            $(".loading-bg span").html("Exiting...");
            $('.page-load').show();
            $('#wrapper').hide();

            var token = localStorage.getItem("token");
            userService.logout(token).then(function (data) {
                if (data === "OK") {
                    $(window.location).attr("href", "login.html");
                }
            });
        };
// ###########################################  登入长时间未操作 END  #########################################
        function initAlarmNumber(){
            alarmService.updateActiveAlarmList().then(function(data) {
                if(data.length > 0){
                    $scope.alarmCount = data.length;
                    if($scope.alarmCount >= 100)
                        $scope.alarmCount = "99+";
                    $("#alarmCount").show();
                }else{
                    $("#alarmCount").hide();
                }
                if($scope.isShowFeature("PageAlarmHint"))
                    diagramAlarmCount(data);
            });
        }
        initAlarmNumber();

        function diagramAlarmCount(data){
            var arr = $(".diagram-alarmCount");
            if(arr.length > 0){
                arr.each(function(key,val){
                    if(val.attributes["deviceid"]){
                        var deviceId = val.attributes["deviceid"].nodeValue;
                        var count = getAlarmCountByDeviceId(data,deviceId);
                        if(count === 0)
                            val.style = "display: none;";
                        else{
                            val.innerHTML = count;
                            val.style = "display: block;";
                        }
                    }
                });
            }
        }
        function getAlarmCountByDeviceId(data,deviceId){
            var count = 0;
            if(data == "") return count;
            if(data){
                data.forEach(function(item){
                   if(deviceId.indexOf(item.deviceId) > -1)
                       count ++;
                });
            }
            return count;
        }

        //region 首页跳转
        $scope.homePageClk = function(){
            var viewHome = localStorage.getItem("viewHome");
            if(viewHome != undefined){
                window.location.href = viewHome;
            }else{
                var ver = localStorage.getItem("versions");
                var home = localStorage.getItem("loginHome");
                if(ver == "IView") {
                    home = home == undefined ? "#/adevice/8890/adiagram" : home;
                    window.location.href = "iview.html"+home;
                }else{
                    home = home == undefined ? "#/adevice/1004/diagram" : home;
                    window.location.href = "index.html"+home;
                }
            }
        };
        //endregion

        //region **************************  嵌入板块 Start  **********************************************/
        $(function() {
            function initView(){
                var width = diagramService.GetScreenWidth();
                $("html").css("width",width+"px");
            };
            //initView();
        });
        //超链接组态 返回按钮
        $scope.ReturnButton = function(){
            //javascript:history.back(-1);//返回上一次记录
            $("#return-button").hide();//隐藏按钮
            var dia = sessionStorage.getItem("LinkPath");
            var split = dia.split("|");
            setDiagramView(split[0],split[1],split[2]);

            function setDiagramView(devId,parentId,devBaseType) {
                var param = devBaseType + '.' + devId;
                if(devBaseType.indexOf(".table") != -1)
                    param = 'table.' + devId;

                var cfg = {};
                diagramService.getDiagramConfig(param).then(function(data) {
                    if (data)
                    {
                        cfg.diagram = data;

                        cfg.diagram.deviceBaseTypeId = devBaseType;
                        cfg.diagram.deviceId = devId;
                        cfg.diagram.parentId = parentId;
                        $state.go($stateParams.diagramview, cfg);
                    }
                });
            };
        };
        //endregion

        //region **************************  中英文切换 Start  **********************************************/
        function getLanguage(){
            $scope.languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));

            languageService.GetLanguage().then(function(data){
                var file = "data/language/ch.json";
                if(data == "English")
                    file = "data/language/en.json";
                $http.get(file).success(function(data) {
                    $scope.languageJson = data;
                    sessionStorage.setItem('languageJson', angular.toJson($scope.languageJson));
                    $(".fullscreen a").attr("title",$scope.languageJson.Configuration.FullScreen);
                });
            });
        };
        getLanguage();
        //endregion

        //region ********************************** 小机房/微模块 Start ******************************************/
        function loadHomePath(){
            userService.needLogin().then(function (data) {
                if(data != undefined && data != "TRUE"){
                    var result = data.split("|");
                    localStorage.setItem("versions",result[0]);
                    localStorage.setItem("isAdmin",result[1]);
                    localStorage.setItem("needLogin","false");
                    localStorage.setItem("loginHome",result[2]);
                    localStorage.setItem("systemStyle",result[3]);
                    localStorage.setItem("username",result[4]);

                    setSystemStyle();
                }

                var viewHome = localStorage.getItem("viewHome");
                if(viewHome != undefined){
                    $scope.href = viewHome;
                    var ver = localStorage.getItem("versions");
                    if(ver == "Room")
                        $scope.isRoom = true;
                    else
                        $scope.isRoom = false;
                }else{
                    var ver = localStorage.getItem("versions");
                    if(ver == "Room"){
                        $scope.href = "index.html#/adevice/1004/adiagram";
                        $scope.isRoom = true;
                    }else if(ver == "2D"){
                        $scope.href = "index.html#/mdcalarm";
                        $scope.isRoom = false;
                    }else if(ver == "IView"){
                        $scope.href = "iview.html#/adevice/8890/adiagram";
                        $scope.isRoom = false;
                    }
                }

                var loginHome = localStorage.getItem("loginHome");
                if(loginHome){
                    if(ver == "IView")
                        $scope.href = "iview.html" +loginHome;
                    else
                        $scope.href = "index.html" +loginHome;
                }

                if(localStorage.getItem("isAdmin") == "true")
                    $scope.isAdminRole = true;
                else
                    $scope.isAdminRole = false;

                if(localStorage.getItem("needLogin") == "true")
                    $scope.isNeedLogin = true;
                else
                    $scope.isNeedLogin = false;
            });

            userService.getTitleAndLogo().then(function(datas){
                var userTitle = datas.split("|")[0];
                var userLogo = datas.split("|")[1];
                localStorage.setItem("userTitle",userTitle);
                localStorage.setItem("userLogo",userLogo);
                $(document).attr("title",userTitle);
                $(".logotitle").text(userTitle);
                $(".logo").attr("src",userLogo);
            });
            setSystemStyle();

            setSystemName();
        };
        loadHomePath();

        function setSystemStyle(){
            var style = localStorage.getItem("systemStyle");
            var random = parseInt(10000*Math.random());
            if(style != undefined && style != "Blue")
                $("#StyleLink").attr("href", "css/"+style+"Style.css?v=" + random);
            else
                $("#VersionLink").attr("href","css/versions2.css?v="+random);

            $(".loginbody").addClass("body_bg");
        };

        function setSystemName(){
            if(window.navigator.userAgent.indexOf("Windows") != -1) {
                localStorage.setItem("systemName", "Windows");
                $scope.SystemName = "Windows";
            }else {
                localStorage.setItem("systemName", "Linux");
                $scope.SystemName = "Linux";
            }
        };
        //endregion

        //region ********************************** 巡检功能 Start *****************************************/
        var stop,stopHeart;
        var index = 0;
        $scope.Polling = [];
        $scope.start = function() {
            if($scope.index != undefined && $scope.index != -1)
                index = $scope.index + 1;
            stop = $interval(function() {
                if($scope.Polling && $scope.Polling.length > 0){
                    if(index >= $scope.Polling.length) index = 0;
                    var href = $scope.Polling[index];
                    window.location.href = href;
                    index ++;

                    $("#side-menu li a").each(function(){
                        if($(this).attr("href") == href)
                            $(this).addClass("active");
                        else
                            $(this).removeClass("active");
                    });
                }

            }, 10000);

            //发送心跳
            SystemSetting.BrowserHeartbeat("Heartbeat").then();
            stopHeart = $interval(function(){
                SystemSetting.BrowserHeartbeat("Heartbeat").then();
            },30*1000);
        };
        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
            if (angular.isDefined(stopHeart)) {
                $interval.cancel(stopHeart);
                stopHeart = undefined;
            }
        };
        $scope.getCheckbox = function(visible){
            if(visible == true || visible == 'true')
                return "√";
            else
                return "X";
        };
        $scope.clickPolling = function(){
            $scope.Polling = [];
            $scope.modality=[];
            if($scope.PollingIsChecked == true)
                $scope.PollingIsChecked = false;
            else
                $scope.PollingIsChecked = true;

            if($scope.PollingIsChecked == true){
                var href = window.location.href;
                var index = -1,is = true;
                $("#side-menu li a").each(function(){
                    if($(this).parent().attr("class") != "ng-hide"){
                        $scope.Polling.push($(this).attr("href"));
                        if(is) index ++;
                        if(href.indexOf($(this).attr("href")) > 0) is = false;
                    }
                });
                $scope.index = index;
                $scope.start();
            }else{
                $scope.stop();
            }
        };
        //endregion

        //region 默认加载
        $scope.select = {};
        MdcAlarmService.GetMdcNames().then(function(data){
            $scope.mdcNames = data;

            if(data.length == 0) return;
            if(sessionStorage.getItem("currMdcId") == undefined)
                $scope.MDCId = data[0].id;
            else
                $scope.MDCId = sessionStorage.getItem("currMdcId");

            var index = -1;
            for(var i=0;i<data.length;i++){
                if(sessionStorage.getItem("currMdcId") === data[i].id)
                    index = i;
            }
            //当前设备编号不存在，默认为第一个设备编号
            if(sessionStorage.getItem("currMdcId") === undefined
                || sessionStorage.getItem("currMdcId") === null
                || index === -1)
                sessionStorage.setItem("currMdcId",$scope.mdcNames[0].id);

            setDiagramView(sessionStorage.getItem("currMdcId"));
        });
        $scope.changeDevice = function(type,mdcId){
            $scope.MDCId = mdcId;
            //单个MDC,多个后可扩展
            if(type == '3D') {
                $location.path("/mdc.html#/");
            }
            else if(type == '2D') {
                $rootScope.$emit("MdcAlarmInit",{});
                $location.path("/mdcalarm");
            }
            else if(type == 'temperature') {
                $rootScope.$emit("MdcTemperatureInit",{});
                $location.path("/temperature");
            }
            else if(type == 'mdcpower'){
                $rootScope.$emit("MdcPowerInit",{});
                $location.path("/mdcpower");
            }
            else if(type == 'mdctemp') {
                $rootScope.$emit("MdcTempInit",{});
                $location.path("/mdctemp");
            }

            setDiagramView(mdcId);
            sessionStorage.setItem("currMdcId",mdcId);

            //$window.location.reload();//刷新页面
        };
        function setDiagramView(mdcId) {
            $scope.select.selectedMdcId = parseInt(mdcId);
        };

        $scope.FullScreen = function(){
            if(sessionStorage.getItem("FullScreen") == "true" ||
                sessionStorage.getItem("FullScreen") == undefined){
                var de = document.documentElement;
                if (de.requestFullscreen) {
                    de.requestFullscreen();
                } else if (de.mozRequestFullScreen) {
                    de.mozRequestFullScreen();
                } else if (de.webkitRequestFullScreen) {
                    de.webkitRequestFullScreen();
                } else if(de.msRequestFullscreen){
                    de.msRequestFullscreen();
                }
                sessionStorage.setItem("FullScreen","false");
            }else{
                var de = document;
                if (de.exitFullscreen) {
                    de.exitFullscreen();
                } else if (de.mozCancelFullScreen) {
                    de.mozCancelFullScreen();
                } else if (de.webkitCancelFullScreen) {
                    de.webkitCancelFullScreen();
                } else if(de.msExitFullscreen){
                    de.msExitFullscreen();
                }
                sessionStorage.setItem("FullScreen","true");
            }
        };

        $scope.ipSettingClick = function(){
            ipSettingDialog = $modal({
                scope:$scope,
                templateUrl:'partials/ipSetting.html',
                show:false
            });
            ipSettingDialog.$promise.then(ipSettingDialog.show);
            //查询 IP、子网掩码、默认网关
            IpService.GetSystemIp().then(function(data){
                var arr = data.split("|");
                if(arr.length != 3){
                    //不支持当前系统！
                    balert.show('danger',$scope.languageJson.Header.Advanced.Ip.NotSystem,3000);
                    return;
                }
                $scope.newIp = arr[0];
                $scope.netmask = arr[1];
                $scope.defaultGw = arr[2];
            });
        };
        $scope.ipSave = function(){
            var newIp = $("#newIp").val();
            var netmask = $("#netmask").val();
            var defaultGw = $("#defaultGw").val();
            var regIp = /^(?!^0(\.0){3}$)(?!^255(\.255){3}$)((25[0-5])|(2[0-4]\d)|(1\d{2})|(\d{2})|(\d))(\.((25[0-5])|(2[0-4]\d)|(1\d{2})|(\d{2})|(\d))){3}$/;
            if(!regIp.test(newIp)){
                //IP格式不正确，请重新输入！
                balert.show('danger',$scope.languageJson.Header.Advanced.Ip.IpFormatError,3000);
                return;
            }
            if(!regIp.test(netmask)){
                //掩码格式不正确，请重新输入！
                balert.show('danger',$scope.languageJson.Header.Advanced.Ip.MaskFormatError,3000);
                return;
            }
            if(!regIp.test(defaultGw)){
                //网关格式不正确，请重新输入！
                balert.show('danger',$scope.languageJson.Header.Advanced.Ip.GatewayFormatError,3000);
                return;
            }
            //修改IP后请稍等，3秒后将自动跳转页面，你确定要修改吗？
            bconfirm.show($scope,$scope.languageJson.Header.Advanced.Ip.Confirm).then(function(data){
                if(data){
                    IpService.SaveIp(newIp,netmask,defaultGw).then(function(data){
                        if(data === "NotLinuxSystem"){
                            //不支持当前系统！
                            balert.show('danger',$scope.languageJson.Header.Advanced.Ip.NotSystem,3000);
                        }/*else{
                        ipSettingDialog.hide();
                        setInterval(function(){
                            balert.show('success','修改Ip成功！',3000);
                            window.location.href = "http://"+newIp+"/login.html";
                        },1000);
                    }*/
                    });
                    setInterval(function(){
                        ipSettingDialog.hide();
                        //修改Ip成功！
                        balert.show('success',$scope.languageJson.Header.Advanced.Ip.Succeed,3000);
                        window.location.href = "/login.html";
                    },3000);
                }
            });
        };

        $scope.showPollingClick = function(){
            showPollingDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/showPolling.html',
                show: false
            });
            showPollingDialog.$promise.then(showPollingDialog.show);
            setTimeout(function(){
                $("#Inspect-Hint").attr("data-original-title","<h5>"+$scope.languageJson.Header.Advanced.Polling.InspectHint+"</h5>");
            },500);
            $scope.getCheckbox = function(visible){
                if(visible == true || visible == 'true')
                    return "√";
                else
                    return "X";
            };
        };
        //endregion

        //region **************************************** 清理数据 Start ****************************************/
        var historyDataClearDlg = undefined,historyDataInfoDlg = undefined;
        $scope.historyDataClearClick = function(){
            historyDataClearDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/historyDataClear.html',
                show: false
            });
            historyDataClearDlg.$promise.then(historyDataClearDlg.show);

            HistoryDataClear.GetAllIntervalClearData().then(function(data){
                $scope.ClearTasks = parseClearData(data);
            });
        };

        function parseClearData(data){
            var miss = $scope.languageJson.MissionName.Mission;
            data.forEach(function(item){
                if(item.status == 0)
                    item.statusName = miss.Close;/*"关闭"*/
                else
                    item.statusName = miss.Start;/*"启动"*/
            });
            return data;
        };

        $scope.addClearTasksClk = function(){
            $scope.ClearTask = {
                title : $scope.languageJson.MissionName.Add,
                status : 1,
                delay : 43200,
                period : 86400,
                storageDays : 30
            };/*'新增'*/
            historyDataInfoDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/historyDataInfo.html',
                show: false
            });
            historyDataInfoDlg.$promise.then(historyDataInfoDlg.show);
        };

        $scope.updClearTasksClk = function(data){
            $scope.ClearTask = data;
            $scope.ClearTask.title = $scope.languageJson.MissionName.Modify;
            historyDataInfoDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/historyDataInfo.html',
                show: false
            });/*"修改"*/
            historyDataInfoDlg.$promise.then(historyDataInfoDlg.show);
        };

        $scope.saveClearTaskClk = function(){
            if($scope.ClearTask.name == undefined || $scope.ClearTask.name == ""){
                balert.show('danger',$scope.languageJson.Task.Title,3000);/*'任务名称不能为空，请重新输入！'*/
                return;
            }
            if($scope.ClearTask.clearObject == undefined || $scope.ClearTask.clearObject == ""){
                balert.show('danger',$scope.languageJson.Task.Cleanup,3000);/*'清理对象不能为空，请重新输入！'*/
                return;
            }
            if($scope.ClearTask.delay == undefined || $scope.ClearTask.delay == ""){
                balert.show('danger',$scope.languageJson.Task.Empty,3000);/*'任务延时不能为空，请重新输入！'*/
                return;
            }
            if($scope.ClearTask.period == undefined || $scope.ClearTask.period == ""){
                balert.show('danger',$scope.languageJson.Task.Period,3000);/*'定时周期不能为空，请重新输入！'*/
                return;
            }
            if($scope.ClearTask.storageDays == undefined || $scope.ClearTask.storageDays == ""){
                balert.show('danger',$scope.languageJson.Task.Storage,3000);/*'存储天数不能为空，请重新输入！'*/
                return;
            }
            if($scope.ClearTask.storageCols == undefined || $scope.ClearTask.storageCols == ""){
                balert.show('danger',$scope.languageJson.Task.Associated,3000);/*'存储天数不能为空，请重新输入！'*/
                return;
            }

            /*"新增"*/
            if($scope.ClearTask.title == $scope.languageJson.MissionName.Add){
                HistoryDataClear.InsertIntervalClearData($scope.ClearTask).then(function(data){
                    if(data == "OK"){
                        balert.show('success',$scope.languageJson.Task.New.Newly,3000);/*'新增成功，生效需要重启系统！'*/
                        historyDataInfoDlg.hide();
                        HistoryDataClear.GetAllIntervalClearData().then(function(data){
                            $scope.ClearTasks = parseClearData(data);
                        });
                    }else
                        balert.show('danger',$scope.languageJson.Task.New.Title,3000);/*'新增失败！'*/
                });
            }else{
                HistoryDataClear.UpdateIntervalClearData($scope.ClearTask).then(function(data){
                    if(data == "OK"){
                        balert.show('success',$scope.languageJson.Task.New.Modification,3000);/*'修改成功，生效需要重启系统！'*/
                        historyDataInfoDlg.hide();
                        HistoryDataClear.GetAllIntervalClearData().then(function(data){
                            $scope.ClearTasks = parseClearData(data);
                        });
                    }else
                        balert.show('danger',$scope.languageJson.Task.New.Fail,3000);/*'修改失败！'*/
                });
            }
        };

        var confirmBoxDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/confirmBox.html',
            show: false
        });
        $scope.delClearTasksClk = function(id){
            $scope.message = $scope.languageJson.Task.Confirm;/*"确定删除吗？"*/
            confirmBoxDlg.$promise.then(confirmBoxDlg.show);

            $scope.ok = function(){
                HistoryDataClear.DeleteIntervalClearData(id).then(function(data){
                    if(data == "OK"){
                        balert.show('success',$scope.languageJson.Task.New.System,3000);/*'删除成功，生效需要重启系统！'*/
                        confirmBoxDlg.hide();
                        HistoryDataClear.GetAllIntervalClearData().then(function(data){
                            $scope.ClearTasks = parseClearData(data);
                        });
                    }else
                        balert.show('danger',$scope.languageJson.Task.New.Delete,3000);/*'删除失败！'*/
                });
            }

            $scope.cancel = function(){
                confirmBoxDlg.hide();
            }
        };

        $scope.resetClearTasksClk = function(){
            //"请确认是否执行任务生效?"
            bconfirm.show($scope,$scope.languageJson.Task.New.Deletion).then(function(data){
                if(data){
                    HistoryDataClear.ResetIntervalClearData().then(function(data){
                        //'任务生效成功！'
                        balert.show('success',$scope.languageJson.Task.New.Mission,3000);
                        historyDataClearDlg.hide();
                    });
                }
            });
        };
        //endregion

        //region **************************************** 系统设置 Start *************************************/
        var systemSettingDlg = null,inputPasswordDlg = null;
        $scope.systemSettingClick = function(){
            systemSettingDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/systemSetting.html',
                show: false
            });
            systemSettingDlg.$promise.then(systemSettingDlg.show);
        };

        $scope.systemControlClick = function(control){
            $scope.systemControl = control;
            $scope.account = {
                loginId : localStorage.getItem("username")
            };
            inputPasswordDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/inputPassword.html',
                show: false
            });
            inputPasswordDlg.$promise.then(inputPasswordDlg.show);
            //重写点击事件
            $scope.keyDownControl = function(event){
                if(event.which === 13){
                    $scope.ok();
                }
            };
            //重写ok函数
            $scope.ok = function(){
                if($scope.account.password == undefined || $scope.account.password ==""){
                    //请输入密码！
                    balert.show('danger',$scope.languageJson.Header.Advanced.System.InputPrompt,3000);
                    return;
                }
                userService.changePassword($scope.account.loginId,$scope.account.password).then(function(res){
                    if(res == "OK"){
                        if($scope.systemControl == "shutdown"){
                            //关机中...请拔电源！
                            alert($scope.languageJson.Header.Advanced.System.ShutdownPrompt);
                            SystemSetting.Shutdown($scope.account.loginId,$scope.account.password).then(function(data){});
                            $(window.location).attr("href", "login.html");
                        }else if($scope.systemControl == "reboot"){
                            //重启成中...稍等2分钟！
                            alert($scope.languageJson.Header.Advanced.System.RestartPrompt);
                            SystemSetting.Reboot($scope.account.loginId,$scope.account.password).then(function(data){});
                            $(window.location).attr("href", "login.html");
                        }else{
                            //重置Telnet/FTP
                            SystemSetting.Reset($scope.account.loginId,$scope.account.password).then(function(data){});
                            //'恢复完成！'
                            balert.show('success',$scope.languageJson.Header.Advanced.System.ResetSucceed,3000);
                            inputPasswordDlg.hide();
                            systemSettingDlg.hide();
                        }
                    }else {
                        //密码错误！
                        balert.show('danger', $scope.languageJson.Header.Advanced.System.InputError, 3000);
                    }
                });
            };
        };
        //endregion

        //region ************************************  MDC配置 Start  *************************************/
        $scope.initConfigMdc = function(){
            TemplateService.GetDataItemByEntryId("202").then(function(data){
                $scope.MdcTypes = data;
            });
        };

        $scope.configMdc = {
            devices : []
        };
        $scope.showConfigMdc = function(){
            $scope.initConfigMdc();
            configMdcDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/addConfigMDC.html',
                show: false
            });
            MdcConfigService.GetMdcConfigInfo().then(function(data){
                $scope.configMdc = parseConfigMdc(data[0]);
            });
            configMdcDialog.$promise.then(configMdcDialog.show);
        };
        function parseConfigMdc(data){
            var con = data;
            if(con == undefined || con.length == 0){
                con = {
                    cabinetNumber : 24,
                    cabinetUHeight : 42,
                    lineNumber : 1,
                    type : 2,
                    clickName : $scope.languageJson.MDC.Enter
                };/*"进入"*/
                return con;
            }
            if(data.line2PhaseAVoltageDeviceId != 'null' && data.line2PhaseAVoltageDeviceId != '' ||
                data.line2PhaseBVoltageDeviceId != 'null' && data.line2PhaseBVoltageDeviceId != '' ||
                data.line2PhaseCVoltageDeviceId != 'null' && data.line2PhaseCVoltageDeviceId != '')
                con.lineNumber = 2;
            else
                con.lineNumber = 1;

            con.clickName = $scope.languageJson.MDC.Enter;/*"进入"*/
            if(data.powerConsumptionDeviceId != 'null' && data.powerConsumptionDeviceId != '')
                con.powerConsumption = data.powerConsumptionDeviceId+"-"+data.powerConsumptionSignalId;
            if(data.powerConsumptionDeviceId != 'null' && data.powerConsumptionDeviceId != '')
                con.powerConsumptionName = data.powerConsumptionDeviceId+"-"+data.powerConsumptionSignalId;

            if(data.line1PhaseAVoltageDeviceId != 'null' && data.line1PhaseAVoltageDeviceId != ''){
                con.line1PhaseAVoltage = data.line1PhaseAVoltageDeviceId+"-"+data.line1PhaseAVoltageSignalId;
                con.line1PhaseACurrent = data.line1PhaseACurrentDeviceId+"-"+data.line1PhaseACurrentSignalId;
            }
            if(data.line1PhaseBVoltageDeviceId != 'null' && data.line1PhaseBVoltageDeviceId != ''){
                con.line1PhaseBVoltage = data.line1PhaseBVoltageDeviceId+"-"+data.line1PhaseBVoltageSignalId;
                con.line1PhaseBCurrent = data.line1PhaseBCurrentDeviceId+"-"+data.line1PhaseBCurrentSignalId;
            }
            if(data.line1PhaseCVoltageDeviceId != 'null' && data.line1PhaseCVoltageDeviceId != ''){
                con.line1PhaseCVoltage = data.line1PhaseCVoltageDeviceId+"-"+data.line1PhaseCVoltageSignalId;
                con.line1PhaseCCurrent = data.line1PhaseCCurrentDeviceId+"-"+data.line1PhaseCCurrentSignalId;
            }
            if(data.lineNumber == 1) return con;
            if(data.line2PhaseAVoltageDeviceId != 'null' && data.line2PhaseAVoltageDeviceId != ''){
                con.line2PhaseAVoltage = data.line2PhaseAVoltageDeviceId+"-"+data.line2PhaseAVoltageSignalId;
                con.line2PhaseACurrent = data.line2PhaseACurrentDeviceId+"-"+data.line2PhaseACurrentSignalId;
            }
            if(data.line2PhaseBVoltageDeviceId != 'null' && data.line2PhaseBVoltageDeviceId != ''){
                con.line2PhaseBVoltage = data.line2PhaseBVoltageDeviceId+"-"+data.line2PhaseBVoltageSignalId;
                con.line2PhaseBCurrent = data.line2PhaseBCurrentDeviceId+"-"+data.line2PhaseBCurrentSignalId;
            }
            if(data.line2PhaseCVoltageDeviceId != 'null' && data.line2PhaseCVoltageDeviceId != ''){
                con.line2PhaseCVoltage = data.line2PhaseCVoltageDeviceId+"-"+data.line2PhaseCVoltageSignalId;
                con.line2PhaseCCurrent = data.line2PhaseCCurrentDeviceId+"-"+data.line2PhaseCCurrentSignalId;
            }
            return con;
        }

        $scope.saveConfigMdcClick = function(){
            $rootScope.$emit("MdcInfo",$scope.configMdc.id);
            //;"进入"
            if($scope.configMdc.clickName == $scope.languageJson.MDC.Enter){
                window.location.href = "#/configMDC";
                configMdcDialog.hide();
                return;
            }
            if(checkConfigMdc($scope.configMdc)) return;
            MdcConfigService.SetMdcConfigInfo($scope.configMdc).then(function(data){
                if(data == "SUCCESS"){
                    balert.show('success',$scope.languageJson.MDC.Thetotal.Title,3000);/*'保存成功！'*/
                    configMdcDialog.hide();
                    window.location.href = "#/configMDC";
                }else{
                    balert.show('danger',$scope.languageJson.MDC.Thetotal.Save,3000);/*'保存失败！'*/
                }
            });
        };
        function checkConfigMdc(data){
            if($scope.configMdc.type == 0){
                if($scope.configMdc.cabinetNumber != 1){
                    balert.show('danger',$scope.languageJson.MDC.Thetotal.Cabinets,3000);/*'机柜总数只能为1！'*/
                    return true;
                }
            }else if($scope.configMdc.type == 1){
                if($scope.configMdc.cabinetNumber == undefined ||
                    $scope.configMdc.cabinetNumber < 2){
                    balert.show('danger',$scope.languageJson.MDC.Thetotal.Cannot,3000);/*'机柜总数不能小于2！'*/
                    return true;
                }
            }else{
                if($scope.configMdc.cabinetNumber == undefined ||
                    $scope.configMdc.cabinetNumber < 8 || $scope.configMdc.cabinetNumber%2 == 1){
                    balert.show('danger',$scope.languageJson.MDC.Thetotal.Needs,3000);/*'机柜总数需要大于8，并且为偶数！'*/
                    return true;
                }
            }
            if($scope.configMdc.cabinetUHeight == undefined || $scope.configMdc.cabinetUHeight <= 0){
                balert.show('danger',$scope.languageJson.MDC.Thetotal.Height,3000);/*'机柜U高需要大于零！'*/
                return true;
            }
            if($scope.configMdc.name == undefined || $scope.configMdc.name == ""){
                balert.show('danger',$scope.languageJson.MDC.Thetotal.MDC,3000);/*'MDC名称不能为空！'*/
                return true;
            }
            return false;
        }
        $scope.bindDevice = function(title,baseType,id,value){
            /*"新增" "修改"*/
            //if($scope.configMdc.clickName != $scope.languageJson.MDC.Add)
            $scope.configMdc.clickName = $scope.languageJson.MDC.Modify;

            $scope.bindTitle = title;
            bindDeviceDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/bindDevice.html',
                show: false
            });
            $scope.isControlBox = false;

            $scope.configMdc.bindBtnId = id;
            equipmentTemplateService.GetEquipmentTemplatesByBaseType(baseType).then(function(data){
                $scope.configMdc.devices = data;
                if($scope.configMdc.deviceId == undefined || $scope.configMdc.deviceId == ""){
                    $scope.configMdc.deviceId = data[0].id;
                    $scope.configMdc.signalId = undefined;
                }
                if(value != undefined && value != "" && value != "-"){
                    var v = value.split("-");
                    $scope.configMdc.deviceId = v[0];
                    $scope.configMdc.signalId = v[1];
                }
                $scope.changeDevice($scope.configMdc.deviceId);
            });

            bindDeviceDialog.$promise.then(bindDeviceDialog.show);
        };
        $scope.changeDevice = function(id){
            baseTypeService.GetSinalByEquipmentId(id).then(function(data){
                $scope.configMdc.signals = data;
            });
        };
        $scope.saveBindDevice = function(){
            setInputValue($scope.configMdc.bindBtnId,$scope.configMdc.deviceId+"-"+$scope.configMdc.signalId);
            bindDeviceDialog.hide();
        };
        $scope.deleteBindDevice = function(){
            setInputValue($scope.configMdc.bindBtnId,"");
            bindDeviceDialog.hide();
        };
        function setInputValue(id,value){
            if(id == "PwrCon") $scope.configMdc.powerConsumption = value;
            else if(id == "Line1PhaseAV") $scope.configMdc.line1PhaseAVoltage = value;
            else if(id == "Line1PhaseBV") $scope.configMdc.line1PhaseBVoltage = value;
            else if(id == "Line1PhaseCV") $scope.configMdc.line1PhaseCVoltage = value;
            else if(id == "Line1PhaseAC") $scope.configMdc.line1PhaseACurrent = value;
            else if(id == "Line1PhaseBC") $scope.configMdc.line1PhaseBCurrent = value;
            else if(id == "Line1PhaseCC") $scope.configMdc.line1PhaseCCurrent = value;
            else if(id == "Line2PhaseAV") $scope.configMdc.line2PhaseAVoltage = value;
            else if(id == "Line2PhaseBV") $scope.configMdc.line2PhaseBVoltage = value;
            else if(id == "Line2PhaseCV") $scope.configMdc.line2PhaseCVoltage = value;
            else if(id == "Line2PhaseAC") $scope.configMdc.line2PhaseACurrent = value;
            else if(id == "Line2PhaseBC") $scope.configMdc.line2PhaseBCurrent = value;
            else if(id == "Line2PhaseCC") $scope.configMdc.line2PhaseCCurrent = value;
        }
        $scope.click = function(){
            /*"修改"*/
            //if($scope.configMdc.clickName != "新增")
                $scope.configMdc.clickName = $scope.languageJson.MDC.Modify;
        };
        //endregion

        //region ***********************************  功能栏是否显示加载 Start ***************************/
        //告警提示音
        function saveWarningTone(){
            if($scope.FeatureConfig != undefined){
                var isShow = false;
                $scope.FeatureConfig.forEach(function(item){
                    if(item.name == "WarningTone")
                        localStorage.setItem("WarningTone",$scope.isShowFeature("WarningTone"));
                });
            }
        };

        function loadFeatureConfig(){
            SystemSetting.LoadFeatureConfig().then(function(data){
                $scope.FeatureConfig = data;
                saveWarningTone();
            });
        };
        loadFeatureConfig();

        $scope.isShowFeature = function(name){
            if($scope.FeatureConfig != undefined){
                var isShow = false;
                $scope.FeatureConfig.forEach(function(item){
                    if(item.name == name)
                        isShow = item.isShow;
                });
                if(isShow == "true" || isShow == true)
                    return true;
                else
                    return false;
            }
        };
        //endregion

        //region ***********************************  组态页面配置 Start ***************************/
        //组态页面配置
        var configureMoldDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/configureMold.html',
            show: false
        });
        var updConfigureMoldDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/updConfigureMold.html',
            show: false
        });

        function loadConfigureMold(){
            ConfigureMoldService.GetAllConfigureMold().then(function(data){
                $scope.ConfigureMolds = data;
            });
            equipmentTemplateService.getAllEquipmentTemplate().then(function(data){
                $scope.EquipmentTemplates = data;
            });
            uploadService.GetAllJsonTemplates().then(function(data){
                $scope.JsonTemplates = parseJsonTemplate(data);
            });

            function parseJsonTemplate(data){
                data.forEach(function(item){
                    if($scope.languageJson.Language != "Chinese") {
                        if (item.id == "201") item.name = $scope.languageJson.ConfigurationType.CT201;
                        else if (item.id == "301") item.name = $scope.languageJson.ConfigurationType.CT301;
                        else if (item.id == "401") item.name = $scope.languageJson.ConfigurationType.CT401;
                        else if (item.id == "402") item.name = $scope.languageJson.ConfigurationType.CT402;
                        else if (item.id == "501") item.name = $scope.languageJson.ConfigurationType.CT501;
                        else if (item.id == "702") item.name = $scope.languageJson.ConfigurationType.CT702;
                        else if (item.id == "1001") item.name = $scope.languageJson.ConfigurationType.CT1001;
                        else if (item.id == "1004") item.name = $scope.languageJson.ConfigurationType.CT1004;
                        else if (item.id == "1006") item.name = $scope.languageJson.ConfigurationType.CT1006;
                        else if (item.id == "1101") item.name = $scope.languageJson.ConfigurationType.CT1101;
                        else if (item.id == "1201") item.name = $scope.languageJson.ConfigurationType.CT1201;
                        else if (item.id == "1501") item.name = $scope.languageJson.ConfigurationType.CT1501;
                        else if (item.id == "2001") item.name = $scope.languageJson.ConfigurationType.CT2001;
                    }
                    if(item.name == "8888") item.name = $scope.languageJson.Configuration.ConfigurationPage.Export.Topology;//"拓扑图"
                    else if(item.name == "8889") item.name = $scope.languageJson.Configuration.ConfigurationPage.Export.MDC;//"MDC统计";
                    //else if(item.name == "8890") item.name = $scope.languageJson.Configuration.ConfigurationPage.Export.IView;//"iView首页";
                    else if(item.name == "9999") item.name = $scope.languageJson.Configuration.ConfigurationPage.Export.Blank;//"空白页面";
                    else if(item.name == "9999.table") item.name = $scope.languageJson.Configuration.ConfigurationPage.Export.Table;//"表格页面";
                });
                return data;
            }

            $scope.getCheckbox = function(visible){
                if(visible == true || visible == 'true')
                    return "√";
                else
                    return "X";
            };
        };

        $scope.configureMold = function(){
            loadConfigureMold();
            configureMoldDialog.$promise.then(configureMoldDialog.show);
        };

        $scope.updateConfigureMoleClick = function(cm,isShow){
            $scope.ConfigureMold = cm;
            baseTypeService.getDeviceList().then(function(data){
                $scope.ConfigureMold.Equipments = data;
            });
            $scope.IsShowJson = isShow;
            if($scope.ConfigureMold && $scope.ConfigureMold.configUrl){
                if($scope.ConfigureMold.configUrl.indexOf(".table") != -1)
                    $scope.ConfigureMold.ConfigureType = "Table";
                else if($scope.ConfigureMold.configUrl.indexOf("structure") != -1)
                    $scope.ConfigureMold.ConfigureType = "Static";
                else
                    $scope.ConfigureMold.ConfigureType = "Default";
            }else
                $scope.ConfigureMold.ConfigureType = "Default";

            updConfigureMoldDialog.$promise.then(updConfigureMoldDialog.show);
        };

        $scope.isShowFontChart = false;
        $scope.showShowFontChart = function(){
            $("#myFontChart").show();
            $scope.isShowFontChart = true;
        };
        $(function() {
            $(document).click(function(e){
                var myDiv = $("#myFontChart");
                if(myDiv.css("display") == "block" && $scope.isShowFontChart == false){
                    $("#myFontChart").hide();
                }
                $scope.isShowFontChart = false;
            });
        });

        $scope.updConfigureMold = function(){
            var prompt = $scope.languageJson.ConfigureMold.Prompt;
            if($scope.ConfigureMold.configName == undefined || $scope.ConfigureMold.configName == ""){
                balert.show('danger',prompt.NotTitle,3000);/*'标题不能为空!'*/
                return;
            }
            if($scope.ConfigureMold.displayIndex == undefined || $scope.ConfigureMold.displayIndex == ""){
                balert.show('danger',prompt.NotOrder,3000);/*'显示顺序不能为空!'*/
                return;
            }
            if(($scope.ConfigureMold.parentId == undefined || $scope.ConfigureMold.parentId == "") && $scope.ConfigureMold.visible == "true"){
                if($scope.ConfigureMold.configUrl.indexOf("#/device/") > -1 || $scope.ConfigureMold.configUrl.indexOf("#/adevice/") > -1){
                    balert.show('danger',prompt.ParentNotConfigUrl,3000);/*'父节点路径不能为组态路径!'*/
                    return;
                }
            }
            ConfigureMoldService.UpdateConfigureMold($scope.ConfigureMold).then(function(data){
                if(data == "OK"){
                    ConfigureMoldService.GetAllConfigureMold().then(function(datas){
                        $scope.ConfigureMolds = datas;
                        balert.show('success',prompt.Success,3000);/*'修改成功!'*/
                        updConfigureMoldDialog.hide();
                    });
                }else
                    balert.show('danger',prompt.Failure,3000);/*'修改失败!'*/
            });
        };

        $scope.clickVisible = function(cm){
            if(cm.visible == 'true')
                cm.visible = 'false';
            else
                cm.visible = 'true';
        };

        $scope.clickTableJson = function(isTable){
            if(isTable == 'true'){
                $scope.IsTableJson = 'false';
                $scope.ConfigureMold.configUrl = $scope.ConfigureMold.configUrl.replace(/.table/ig,'');
            }else{
                $scope.IsTableJson = 'true';
                var url = $scope.ConfigureMold.configUrl;
                var index = url.indexOf("/diagram");
                $scope.ConfigureMold.configUrl = url.substring(0,index)+".table/diagram";
            }
        };

        $scope.changeEquipment = function(equipmentId){
            if($scope.EquipmentTemplates){
                to:for(var i = 0; i < $scope.ConfigureMold.Equipments.length;i++){
                    if($scope.ConfigureMold.Equipments[i].EquipmentId == equipmentId){
                        var equipmentTemplateId = $scope.ConfigureMold.Equipments[i].EquipmentTemplateId;
                        $scope.ConfigureMold.configName = $scope.ConfigureMold.Equipments[i].EquipmentName;
                        for(var j = 0;j < $scope.EquipmentTemplates.length;j ++){
                            if(equipmentTemplateId == $scope.EquipmentTemplates[j].EquipmentTemplateId){
                                var baseType = $scope.EquipmentTemplates[j].EquipmentBaseType;
                                $scope.ConfigureMold.configUrl = "#/device/"+baseType+"/diagram";
                                break to;
                            }
                        }
                    }
                }
            }
        };

        $scope.insertConfigureMoldClick = function(configId){
            ConfigureMoldService.InsertConfigureMold(configId).then(function(datas){
                ConfigureMoldService.GetAllConfigureMold().then(function(data){
                    $scope.ConfigureMolds = data;
                });
            });
        };

        $scope.removeConfigureMoldClick = function(configId){
            ConfigureMoldService.DeleteConfigureMold(configId).then(function(datas){
                ConfigureMoldService.GetAllConfigureMold().then(function(data){
                    $scope.ConfigureMolds = data;
                });
            });
        };

        $scope.sortClick = function(direction,configId){
            ConfigureMoldService.SortConfigureMold(direction,configId).then(function(datas){
                ConfigureMoldService.GetAllConfigureMold().then(function(data){
                    $scope.ConfigureMolds = data;
                });
            });
        };

        $scope.checkClick = function(configId,visible){
            if(visible == 'true')
                visible = 'false';
            else
                visible = 'true';
            ConfigureMoldService.VisibleConfigureMold(configId,visible).then(function(datas){
                ConfigureMoldService.GetAllConfigureMold().then(function(data){
                    $scope.ConfigureMolds = data;
                });
            });
        };

        $scope.saveConfigureMold = function(){
            for(var i = 0;i < $scope.ConfigureMolds.length;i++){
                if($scope.ConfigureMolds[i].visible == "true" && ($scope.ConfigureMolds[i].configUrl == undefined || $scope.ConfigureMolds[i].configUrl == "")){
                    if($scope.ConfigureMolds[i].parts == "" || $scope.ConfigureMolds[i].parts.length == 0){
                        /*'父节点无子节点路径不能为空!'*/
                        balert.show('danger',$scope.languageJson.ConfigureMold.Prompt.ParentNotUrl,3000);
                        return;
                    }
                }
            }
            configureMoldDialog.hide();
            if(localStorage.getItem("versions") != "IView"){
                $("#side-menu .sub-li").remove();
                deviceService.getAllDevicesType().then();
                return;
            }
        };

        //region 生成静态页面 与 链接
        $scope.generateStaticFrame = function(config){
            var baseType = config.equipmentBaseType;
            if(baseType == undefined || baseType == "")
                baseType = config.baseTypeId;

            var param = baseType+"."+config.deviceId+"|"+screen.width+"*"+screen.height+"|"+window.innerWidth+"*"+window.innerHeight;

            diagramService.GenerateStaticPage(param).then(function(data) {
                if(config.configUrl.indexOf("adevice") > -1)
                    config.configUrl = "#/astructure/"+data;
                else
                    config.configUrl = "#/structure/"+data;
            });
        };
        //endregion

        //region 组态类型切换
        $scope.changeMoldType = function(type){
            if(type == "Default"){
                $scope.ConfigureMold.configUrl = getConfigUrl($scope.ConfigureMold.equipmentBaseType);
            }else if(type == "Table"){
                $scope.ConfigureMold.configUrl = getConfigTableUrl();
            }else if(type == "Static"){
                $scope.generateStaticFrame($scope.ConfigureMold);
            }
        };
        //获取组态路径
        function getConfigUrl(baseType){
            var url = $scope.ConfigureMold.configUrl;
            if(url.indexOf(".table") != -1){//组态表格页面转为组态页面
                return url.replace(/.table/ig,'');
            }else{//静态页面转为组态页面
                if(baseType == undefined || baseType == ""){
                    var index = url.lastIndexOf("/");
                    baseType = url.substring(index+1);
                }

                if(url.indexOf("astructure") > -1)
                    return "#/adevice/"+baseType+"/adiagram";
                else
                    return "#/device/"+baseType+"/diagram";
            }
        }
        //获取表格组态路径
        function getConfigTableUrl(){
            var url = $scope.ConfigureMold.configUrl;
            if(url.indexOf("device") != -1){//组态页面转为组态表格
                if(url.indexOf("adevice") != -1){
                    var index = url.indexOf("/adiagram");
                    return url.substring(0,index)+".table/adiagram";
                }else{
                    var index = url.indexOf("/diagram");
                    return url.substring(0,index)+".table/diagram";
                }
            }else{//静态页面转为组态表格
                var baseType = $scope.ConfigureMold.equipmentBaseType;
                if(baseType == undefined || baseType == ""){
                    var index = url.lastIndexOf("/");
                    baseType = url.substring(index+1);
                }

                if(url.indexOf("astructure") != 1)
                    return "#/adevice/"+baseType+".table/adiagram";
                else
                    return "#/device/"+baseType+".table/diagram";
            }
            return url;
        }
        //endregion

        //region 导出、导入组态
        //region 导出组态
        $scope.ExportAllClk = function(){
            var prompt = $scope.languageJson.ConfigureMold.Prompt;
            $scope.loading = true;
            ConfigureMoldService.ExportAllConfiguration().then(function(data){
                if(data == "NoValidData"){
                    balert.show('danger',prompt.NoValidData,3000);
                    return;
                }else if(data == "Error"){
                    balert.show('danger',prompt.ExportError,3000);
                    return;
                }else
                    Exporter.toFile("/upload/"+data,data);
                $scope.loading = false;
            });
        };
        $scope.ExportClk = function(configId){
            var prompt = $scope.languageJson.ConfigureMold.Prompt;
            $scope.loading = true;
            ConfigureMoldService.ExportCurrentConfiguration(configId).then(function(data){
                if(data == "NoValidData"){
                    balert.show('danger',prompt.NoValidData,3000);
                    return;
                }else if(data == "Error"){
                    balert.show('danger',prompt.ExportError,3000);
                    return;
                }else
                    Exporter.toFile("/upload/"+data,data);
                $scope.loading = false;
            });
        };
        //endregion

        //region 导入组态
        var importAllConfigureDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/importAllConfigure.html',
            show: false
        });
        var importConfigureDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/importConfigure.html',
            show: false
        });
        $scope.$on("fileSelected",function(event, msg) {
            $scope.file = msg;
        });
        $scope.ImportAllClk = function(){
            loadJsonInfo();
            importAllConfigureDlg.$promise.then(importAllConfigureDlg.show);
        };
        $scope.ImportClk = function(cfgMold){
            loadCurrentJsonInfo(undefined,cfgMold);

            importConfigureDlg.$promise.then(importConfigureDlg.show);
        };
        //上传、解压后删除zip
        $scope.uploadClk = function(){
            var prompt = $scope.languageJson.Agreement.Prompt;
            if($scope.file == undefined) return;
            uploadService.uploadFile($scope.file).then(function(data) {
                zipFileService.decompressionFile(data).then(function(path){
                    if ($scope.unZipPath == "fail to decompression file") {
                        /*'解压文件失败，请检查上传文件是否有效zip文件!'*/
                        balert.show('danger',prompt.FailDecompressionFile,3000);
                    }else{
                        //删除压缩包
                        uploadService.deleteUploadFile(data);
                        loadJsonInfo(path);
                    }
                });
            });
        };

        function loadJsonInfo(path){
            baseTypeService.getDeviceList().then(function(data){
                if($scope.ConfigureMold == undefined) $scope.ConfigureMold = {};
                $scope.ConfigureMold.Equipments = data;
            });
            if(path == undefined) path = "upload/configure/config.json";
            $scope.showConfigureTable = false;
            $http.get(path).success(function(data) {
                $scope.showConfigureTable = true;
                $scope.ConfigureCfg = parseConfigureCfg(data);
            });
        }
        function loadCurrentJsonInfo(path,cfgMold){
            baseTypeService.getDeviceList().then(function(data){
                if($scope.ConfigureMold == undefined) $scope.ConfigureMold = {};
                $scope.ConfigureMold.Equipments = data;
            });
            if(path == undefined) path = "upload/configure/config.json";
            $scope.showConfigureTable = false;
            $http.get(path).success(function(data) {
                $scope.showConfigureTable = true;
                $scope.ConfigureCfg = parseConfigureCfg(data);
                if($scope.ConfigureCfg){
                    $scope.CurrentCfg = angular.copy($scope.ConfigureCfg[0]);
                    $scope.changeConfigureDevice($scope.CurrentCfg,cfgMold);
                }
            });
        }
        //初始化新组态配置对象
        function parseConfigureCfg(cfg){
            if(cfg){
                cfg.forEach(function(item){
                    item.NewDeviceId = "";
                    item.NewDeviceName = "";
                    item.NewParents = [];
                    item.NewParentId = "";
                    item.NewBaseTypeId = item.BaseTypeId;
                    item.NewUrl = "";
                    item.NewOtherDevice = parseOtherDevice(item.OtherDevice);
                });
            }
            return cfg;
        }
        function parseOtherDevice(devices){
            var arr = [];
            if(devices){
                devices.forEach(function(dev){
                    arr.push({
                        DeviceId : ""
                    });
                });
            }
            return arr;
        }
        //组态路径类型值改变事件
        $scope.changeConfigureType = function(newUrl,type){
            var url = "";

            var id = newUrl.replace(/[^0-9]/ig,"");
            if(type == "adevice"){//组态首页
                url = "#/adevice/"+id+"/adiagram";
            }else if(type == "device"){//组态
                url = "#/device/"+id+"/diagram";
            }else if(type == "astructure"){//非组态首页
                url = "#/astructure/"+id;
            }else if(type == "structure"){//非组态
                url = "#/structure/"+id;
            }
            return url;
        };
        //组态设备值改变事件
        $scope.changeAllConfigureDevice = function(cfg,deviceId){
            cfg.NewParents = getParents(deviceId);
            var is = false;
            if($scope.ConfigureMold.Equipments){
                $scope.ConfigureMold.Equipments.forEach(function(item){
                    if(item.EquipmentId == deviceId){
                        cfg.NewDeviceId = item.EquipmentId;
                        cfg.NewDeviceName = item.EquipmentName;
                        cfg.NewParentId = defaultSelectParent(item.EquipmentId);
                        is = true;
                    }
                });
            }
            //改变非组态链接
            var ch = cfg.Url.replace(/[0-9]/ig,"");
            cfg.NewUrl = ch+cfg.NewDeviceId;
            return cfg;
        };
        $scope.changeConfigureDevice = function(cfg,cfgMold){
            cfg.NewParents = getParents(cfgMold.deviceId);
            var is = false;
            if($scope.ConfigureMold.Equipments){
                $scope.ConfigureMold.Equipments.forEach(function(item){
                    if(item.EquipmentId == cfgMold.deviceId){
                       cfg.NewDeviceId = item.EquipmentId;
                       cfg.NewDeviceName = item.EquipmentName;
                       cfg.NewParentId = defaultSelectParent(item.EquipmentId);
                       cfg.NewUrl = cfgMold.configUrl;
                       is = true;
                    }
                });
            }
            if(!is){
                cfg.NewDeviceId = cfgMold.deviceId;
                cfg.NewDeviceName = cfgMold.configName;
                cfg.NewParentId = defaultSelectParent(cfgMold.deviceId);
                cfg.NewUrl = cfgMold.configUrl;
            }
            return cfg;
        };
        //获取设备的父级集合
        function getParents(deviceId){
            var parents = [];
            if($scope.ConfigureMolds){
                $scope.ConfigureMolds.forEach(function(parent){
                    parents.push({
                        ParentId: parent.configId,
                        ParentName: parent.configName
                    });
                });
            }
            return parents;
        }
        function defaultSelectParent(deviceId){
            var parentId = undefined;
            if($scope.ConfigureMolds){
                $scope.ConfigureMolds.forEach(function(parent){
                    if(parent.parts){
                        parent.parts.forEach(function(part){
                            if(part.deviceId == deviceId){
                                parentId = parent.configId;
                            }
                        });
                    }
                });
            }
            return parentId;
        }

        //提交上传的组态配置
        $scope.submitAllConfigure = function(){
            //OldDeviceId|OldBaseTypeId#NewDeviceId|NewDeviceName|NewParentId|NewBaseTypeId|NewUrl|OldOtherDeviceId1>NewOtherDeviceId1.OldOtherDeviceId2>NewOtherDeviceId2&
            var param = getAllConfigParameter();
            $scope.loading = true;
            ConfigureMoldService.ImportAllConfiguration(param).then(function(data){
                if(data == "OK"){
                    importAllConfigureDlg.hide();

                    balert.show('success',$scope.languageJson.ImportConfigure.Prompt.Success,3000);
                }else{
                    balert.show('danger',$scope.languageJson.ImportConfigure.Prompt.Failed,3000);
                }
                $scope.loading = false;
            });
        };
        $scope.submitConfigure = function(){
            var param = getConfigParameter();
            $scope.loading = true;
            ConfigureMoldService.ImportAllConfiguration(param).then(function(data){
                if(data == "OK"){
                    importConfigureDlg.hide();
                    $scope.ConfigureMold.equipmentId = $scope.CurrentCfg.NewDeviceId;
                    $scope.ConfigureMold.parentId = $scope.CurrentCfg.NewParentId;
                    $scope.ConfigureMold.configUrl = $scope.CurrentCfg.NewUrl;

                    balert.show('success',$scope.languageJson.ImportConfigure.Prompt.Success,3000);
                }else{
                    balert.show('danger',$scope.languageJson.ImportConfigure.Prompt.Failed,3000);
                }
                $scope.loading = false;
            });
        };
        //拼接上传的组态配置参数
        function getAllConfigParameter(){
            var param = "";
            if($scope.ConfigureCfg){
                $scope.ConfigureCfg.forEach(function(cfg){
                    if(cfg.NewDeviceId != "" && cfg.NewParentId != ""){
                        param += base64.encode(cfg.DeviceId+"|"+cfg.BaseTypeId)+"#"+base64.encode(cfg.NewDeviceId+"|"+cfg.NewDeviceName+"|"+
                            cfg.NewParentId+"|"+cfg.NewBaseTypeId+"|"+cfg.NewUrl+"|"+getOtherDeviceParameter(cfg.OtherDevice,cfg.NewOtherDevice))+"&";
                    }
                });
            }
            return param;
        };
        function getConfigParameter(){
            var param = "";
            if($scope.CurrentCfg){
                var cfg = $scope.CurrentCfg;
                param += base64.encode(cfg.DeviceId+"|"+cfg.BaseTypeId)+"#"+base64.encode(cfg.NewDeviceId+"|"+cfg.NewDeviceName+"|"+
                    cfg.NewParentId+"|"+cfg.NewBaseTypeId+"|"+cfg.NewUrl+"|"+getOtherDeviceParameter(cfg.OtherDevice,cfg.NewOtherDevice))+"&";
            }
            return param;
        }
        function getOtherDeviceParameter(oldDevice,newDevice){
            var param = "";
            if(newDevice){
                for(var i = 0; i < newDevice.length; i++){
                    if(newDevice[i] != ""){
                        param += oldDevice[i].DeviceId+">"+newDevice[i].DeviceId+".";
                    }
                }
            }
            return param;
        }

        //选择单个上传的组态
        $scope.changeConfigureCfg = function(cfg){
            var cfg = angular.fromJson(cfg);
            $scope.CurrentCfg.DeviceId = cfg.DeviceId;
            $scope.CurrentCfg.DeviceName = cfg.DeviceName;
            $scope.CurrentCfg.ParentId = cfg.ParentId;
            $scope.CurrentCfg.Url = cfg.Url;
            if(cfg.Url.indexOf("structure/") > -1){
                var ch = cfg.Url.replace(/[0-9]/ig,"");
                $scope.CurrentCfg.NewUrl = ch+$scope.CurrentCfg.NewDeviceId;
            }else{
                $scope.CurrentCfg.NewUrl = cfg.Url;
            }
            $scope.CurrentCfg.OtherDevice = cfg.OtherDevice;
            $scope.CurrentCfg.NewOtherDevice = parseOtherDevice(cfg.OtherDevice);


            return $scope.CurrentCfg;
        };
        //endregion
        //endregion
        //endregion ***********************************  组态页面配置 End ***************************/

        //region **************************  帮助说明 Start  ********************************************/
        var helpNotesDlg = null,fullImageDlg = null;
        $scope.helpNotesClk = function(path,page){
            $scope.helpNotes = getHelpNotesByPath(path,page);
            helpNotesDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/helpNotes.html',
                show: false
            });
            helpNotesDlg.$promise.then(helpNotesDlg.show);
        };

        //登录后检查是否弹出导航页面
        function initHelp(){
            if(localStorage.getItem("showHelp") == "true"){
                SystemSetting.IsFactorStatFileExist().then(function(data){
                    if(data == "true"){
                        //$scope.helpNotesClk("00",1);
                        localStorage.setItem("showHelp",false);
                    }
                });
                localStorage.setItem("showHelp",false);
            }
        }
        initHelp();

        $scope.helpHeadClk = function(path){
            $scope.helpNotes = getHelpNotesByPath(path,1);
            $scope.src = $scope.helpNotes.src;
        };

        // 导航对象
        function getHelpNotesByPath(path,page){
            var src = "../img/help/ch/"+path+"/"+page+".png";
            if($scope.languageJson.Language == "English")
                src = "../img/help/en/"+path+"/"+page+".png";
            var obj = {
                path : path,
                page : page,
                src : src
            };
            $scope.src = obj.src;
            if(path == "00"){
                obj.title = $scope.languageJson.Header.Advanced.Notes.Path00;//首页导航
                obj.total = 1;
            }else if(path == "01"){
                obj.title = $scope.languageJson.Header.Advanced.Notes.Path01;//配置设备
                obj.total = 4;
            }else if(path == "02"){
                obj.title = $scope.languageJson.Header.Advanced.Notes.Path02;//配置设备模板
                obj.total = 3;
            }else if(path == "03"){
                obj.title = $scope.languageJson.Header.Advanced.Notes.Path03;//配置告警联动
                obj.total = 1;
            }else if(path == "04"){
                obj.title = $scope.languageJson.Header.Advanced.Notes.Path04;//配置告警通知
                obj.total = 4;
            }

            return obj;
        }

        // 获取文件名称和起始页
        function getPathByOper(helpNotes,oper){
            var obj = {
                path : helpNotes.path,
                page : parseInt(helpNotes.page)
            };
            if(oper == "+1"){
                if(parseInt(helpNotes.total) >= (obj.page + 1)){
                    obj.page = obj.page + 1;
                    return obj;
                }
            }else if(oper == "-1"){
                if(1 <= (obj.page - 1)){
                    obj.page = obj.page - 1;
                    return obj;
                }
            }

            var paths = ["00","01","02","03","04"];
            var index = -1;
            for(var i = 0;i < paths.length;i++){
                if(paths[i] == obj.path){
                    index = i;
                    break;
                }
            }
            if(oper == "+1"){
                if(index == paths.length - 1)
                    obj.path = paths[0];
                else
                    obj.path = paths[index + 1];
                obj.page = 1;
            }else if(oper == "-1"){
                if(index == 0)
                    obj.path = paths[paths.length - 1];
                else
                    obj.path = paths[index - 1];
                obj.page = getHelpNotesByPath(obj.path,1).total;
            }

            return obj;
        }

        $scope.fullImage = function(){
            fullImageDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/fullImage.html',
                show: false
            });
            fullImageDlg.$promise.then(fullImageDlg.show);
        };

        //上一页
        $scope.lastPage = function(){
            if($scope.helpNotes == undefined)
                $scope.helpNotes = getHelpNotesByPath("00",1);

            var page = getPathByOper($scope.helpNotes,"-1");
            $scope.helpNotes = getHelpNotesByPath(page.path,page.page);
        };

        //下一页
        $scope.nextPage = function(){
            if($scope.helpNotes == undefined)
                $scope.helpNotes = getHelpNotesByPath("00",1);

            var page = getPathByOper($scope.helpNotes,"+1");
            $scope.helpNotes = getHelpNotesByPath(page.path,page.page);

        };
        //endregion
    }
]);

nurseController.controller('MDCAlarmCtrl', ['$scope', '$http', '$interval','diagramService', '$state', '$stateParams','$modal','MdcAlarmService','CameraService','alarmService','balert','$rootScope','$compile','activeSignalService','activeDeviceService','MdcConfigService','employeeService','EventService','RtspVideoService','$location','$sce','devcontrolService',
    function($scope, $http, $interval,diagramService, $state, $stateParams,$modal,MdcAlarmService,CameraService,alarmService,balert,$rootScope,$compile,activeSignalService,activeDeviceService,MdcConfigService,employeeService,EventService,RtspVideoService,$location,$sce,devcontrolService){

    //enum of status: 
    //default: not bind data or not monitored, or reserved 蓝
    //disable: communication fail, can not get status 灰
    //normal: no alarm running 绿
    //alarm: emergency alarm 红
    //因为我们四级告警颜色，在这里过多覆盖了。所以告警只用一种颜色标识。
    
    //实现思路：
    //1 后台配置好配置，设备ID及信号ID全部固定（如果是MDC可以做到）
    //2 前台的画面内容根据MDC及配置定制，我给了这个例子，还是很容易的
    //3 前台根据需求，直接请求后台的所有设备的状态（使用总览接口）
    //4 前台请求门禁状态，直接请求实时数据。
    //5 根据柜子和设备的配置关系，将这些值转换为$scope.status
    
    //
    // 所以，先确定MDC配置，然后定制这个界面工作内容还是比较简单
    // 类似温度或配电原理也是一样。
    // 所示，这是一个根据配置定死的定制界面。因为MDC的配置固定优势，
    // 开发起来可以直接就上，简单直接。没必要做成通用功能
    // 只要一个开发完，第二个型号的MDC开发调整也很快。
    //$scope.MDCId = '100000001';

    (function(){
        $scope.clickDeviceInfo = function(deviceId){
            sessionStorage.setItem("referrer",window.location.href);
            $location.path('/deviceInfo/' + deviceId);
        };
    })();

    $scope.cabinetTemp = {};
    $scope.cabinetName = {};
    $scope.FilterData = {};
    //安防监控
    $scope.MdcAlarmInit = function(colNum,uHeight,type){

        $scope.status = [];
        $scope.cabinetData = [];
        $scope.camera = [];
        $scope.video = {};
        $scope.cameraId = undefined;
        $scope.cabinetUHeight = uHeight;

        $scope.currentStage = 'monitor';

        //动态加载table
        //var colNum = 32;
        var td = "";
        $("#mdc-alarm-tr1").children('td').remove();//清空所有的td
        $("#mdc-alarm-tr2").children('td').remove();//清空所有的td
        if(type == 1){
            $scope.MdcWidth = (100/16*parseInt(colNum));

            for(var i = 1;i <= colNum; i++){
                td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body {{mdcStyle.cabinet"+i+"}}\" ng-click=\"clk('cabinet"+i+"')\"><div></div></div></td>";
                var $td = $compile(td)($scope);
                $("#mdc-alarm-tr2").append($td);
            }
            $(".water").css("height","39vh");//下排水浸线位置样式
        }else{
            $scope.MdcWidth = (100/16*(parseInt(colNum)/2));
            for(var i = 1;i <= colNum; i++){
                if(i <= colNum/2) {
                    td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body {{mdcStyle.cabinet"+i+"}}\" ng-click=\"clk('cabinet"+i+"')\"><div></div></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr2").append($td);
                }else{
                     td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title top\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body {{mdcStyle.cabinet"+i+"}}\" ng-click=\"clk('cabinet"+i+"')\"><div></div></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr1").append($td);
                }
            }
        }
        initAisleDevice();

        if(!$scope.MDCId) return;
        MdcAlarmService.getCabinetList($scope.MDCId).then(function(data){
            Array.prototype.push.apply($scope.status, data);
            diagramService.updateCabinetData($scope.status).then(function(data) {
                $scope.cabinetData = data;
            });
            getCabinetsName();
            $scope.CorrectStyle();
        });
        MdcAlarmService.getGetOtherSignal($scope.MDCId).then(function(data){
            Array.prototype.push.apply($scope.status, data);
            diagramService.updateCabinetData($scope.status).then(function(data) {
                $scope.cabinetData = data;
            });
            alarmService.updateActiveAlarmList().then(function(data) {
                if(data.length > 0){
                    $("#mdcAlarmTable").removeClass("normal");
                    $("#mdcAlarmTable").addClass("alarm");
                    $("#mdcAlarmTable > div").html(data.length);
                    $("#mdcAlarmTable > div").addClass("tableTop");
                }else{
                    $("#mdcAlarmTable").removeClass("alarm");
                    $("#mdcAlarmTable").addClass("normal");
                    $("#mdcAlarmTable > div").html("");
                    $("#mdcAlarmTable > div").removeClass("tableTop");
                }
            });
            $scope.CorrectStyle();
        });

        //机柜名称
        function getCabinetsName(){
            if($scope.status){
                $scope.status.forEach(function(item){
                    if(item.cabinetId.indexOf("cabinet") > -1){
                        eval("$scope.cabinetName." + item.cabinetId + " = item.cabinetName");
                    }
                });
            }
        };

        employeeService.getAllEmployees().then(function(data){
            $scope.employees = data;
        });

        //初始化冷通道的环境量
        function initAisleDevice(){
            MdcConfigService.GetAisleDeviceLocation().then(function(data){
                $scope.AisleDeviceLocations = data;
                //get Environment
                MdcConfigService.GetOtherSignal().then(function(datas){
                    $scope.Environments = datas;
                    createAisleDevice(data,datas);
                });
            });
        };
        function createAisleDevice(data,datas){
            $("#AisleTable").find("tr").remove();//清空所有的td
            for(var i = 1;i <= 3;i ++){
                var tr = "<tr>";
                for(var j = 1;j <= 7;j++){
                    var aisles = GetAisleDeviceByLocation(data,i,j);
                    var td = "";
                    if(j <= 3)
                        td = "<td align='left'>"+CreateAisleInfo(aisles,datas,'left')+"</td>";
                    else if(j == 4)
                        td = "<td align='center'><div style='width: fit-content;'>"+CreateAisleInfo(aisles,datas,'left')+"</div></td>";
                    else
                        td = "<td align='right'>"+CreateAisleInfo(aisles,datas,'right')+"</td>";
                    tr += td;
                }
                tr += "</tr>";
                var $tr = $compile(tr)($scope);
                $("#AisleTable").append($tr);
            }
        };
        function GetAisleDeviceByLocation(data,row,col){
            if(data){
                var obj = [];
                data.forEach(function(item){
                    if(item.TableRow == row && item.TableCol == col)
                        obj.push(item);
                });
                return obj;
            }else
                return undefined;
        };
        function GetEnvironment(datas,aisle){
            if(datas){
                var obj = undefined;
                datas.forEach(function(item){
                    if(item.Id == aisle.TableId)
                        obj = item;
                });
                return obj;
            }else
                return undefined;
        }
        function CreateAisleInfo(aisles,envs,align){
            if(aisles == undefined || aisles.length == 0) return "";
            var div = "";
            aisles.forEach(function(aisle){
                if(aisle.DeviceType == "video"){//摄像头
                    div += "<div class=\"camera camera_"+align+" style='float:"+align+";' cameraNormal\" ng-click=\"openAisleTable('"+aisle.TableRow+"','"+aisle.TableCol+"')\" ng-show=\"currentStage == 'monitor'\"></div>";
                }else if(aisle.DeviceType == "infrared"){//红外
                    var env = GetEnvironment(envs,aisle);
                    div += "<div id=\"infrared"+env.Site+"\" style=\"visibility:hidden;float:"+align+";\" class=\"infrared infrared"+env.Site+" {{mdcStyle.infrared"+env.Site+"}}\" ng-show=\"currentStage == 'monitor'\"></div>";
                }else if(aisle.DeviceType == "smoke"){//烟感
                    var env = GetEnvironment(envs,aisle);
                    div += "<div id=\"smoke"+env.Site+"\" style=\"visibility:hidden;float:"+align+";\" class=\"smoke smoke"+env.Site+" {{mdcStyle.smoke"+env.Site+"}}\" ng-show=\"currentStage == 'monitor'\"></div>";
                }else if(aisle.DeviceType == "rtspVideo"){
                    div += "<div class=\"camera camera_"+align+" style='float:"+align+";' cameraNormal\" ng-click=\"openAisleTable('"+aisle.TableRow+"','"+aisle.TableCol+"')\" ng-show=\"currentStage == 'monitor'\"></div>";
                }
            });
            return div;
        }
    };

    //能耗分布
    $scope.MdcPowerInit = function(colNum,type) {
        $scope.status = [];
        //动态加载
        //var colNum = 32;
        var td = "";
        $("#mdc-alarm-tr1").children('td').remove();//清空所有的td
        $("#mdc-alarm-tr2").children('td').remove();//清空所有的td
        if(type == 0 || type == 1){
            $scope.MdcWidth = (100/16*parseInt(colNum));
            for(var i = 1;i <= colNum; i++){
                td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body normal\" ng-click=\"clk('cabinet"+i+"')\"><div></div><img/></div></td>";
                var $td = $compile(td)($scope);
                $("#mdc-alarm-tr2").append($td);
            }
        }else{
            $scope.MdcWidth = (100/16*(parseInt(colNum)/2));
            for(var i = 1;i <= colNum; i++){
                if(i <= colNum/2) {
                    td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body normal gradient\" ng-click=\"clk('cabinet"+i+"')\"><div></div><img/></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr2").append($td);
                }else {
                    td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title top\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body normal gradient\" ng-click=\"clk('cabinet"+i+"')\"><div></div><img/></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr1").append($td);
                }
            }
        }

        if(!$scope.MDCId) return;
        MdcAlarmService.getCabinetPowerInfo($scope.MDCId).then(function (data) {
            Array.prototype.push.apply($scope.status , data);
            diagramService.updatePowerData($scope.MDCId, $scope.status).then(function (data) {
                $scope.powerData = data;
            });
        });
        MdcAlarmService.getGetOtherSignal($scope.MDCId).then(function(data){
            Array.prototype.push.apply($scope.status, data);
            $scope.CorrectStyle();
        });

    };

    //温度分布
    $scope.MdcTemperatureInit = function(colNum,type) {
        //动态加载
        var td = "";
        $("#mdc-alarm-tr1").children('td').remove();//清空所有的td
        $("#mdc-alarm-tr2").children('td').remove();//清空所有的td
        if(type == 0 || type == 1){
            $scope.MdcWidth = (100/16*parseInt(colNum));
            for(var i = 1;i <= colNum; i++){
                td = "<td class=\"thermal button cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body\" ng-click=\"clk('cabinet"+i+"')\"><span class=\"temp1 {{CabinetTHFontColor.cabinet"+i+"[2]}}\">{{cabinetTemp.cabinet"+i+"[2]}}</span><span class=\"temp2 {{CabinetTHFontColor.cabinet"+i+"[1]}}\">{{cabinetTemp.cabinet"+i+"[1]}}</span><span class=\"temp3 {{CabinetTHFontColor.cabinet"+i+"[0]}}\">{{cabinetTemp.cabinet"+i+"[0]}}</span></div></td>";
                var $td = $compile(td)($scope);
                $("#mdc-alarm-tr2").append($td);
            }
        }else{
            $scope.MdcWidth = (100/16*(parseInt(colNum)/2));
            for(var i = 1;i <= colNum; i++){
                if(i <= colNum/2){
                    td = "<td class=\"thermal button cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body\" ng-click=\"clk('cabinet"+i+"')\"><span class=\"temp1 {{CabinetTHFontColor.cabinet"+i+"[2]}}\">{{cabinetTemp.cabinet"+i+"[2]}}</span><span class=\"temp2 {{CabinetTHFontColor.cabinet"+i+"[1]}}\">{{cabinetTemp.cabinet"+i+"[1]}}</span><span class=\"temp3 {{CabinetTHFontColor.cabinet"+i+"[0]}}\">{{cabinetTemp.cabinet"+i+"[0]}}</span></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr2").append($td);
                }else{
                    td = "<td class=\"thermal button cabinet"+i+"\"><div class=\"cabinet-title top\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body\" ng-click=\"clk('cabinet"+i+"')\"><span class=\"temp1 {{CabinetTHFontColor.cabinet"+i+"[2]}}\">{{cabinetTemp.cabinet"+i+"[2]}}</span><span class=\"temp2 {{CabinetTHFontColor.cabinet"+i+"[1]}}\">{{cabinetTemp.cabinet"+i+"[1]}}</span><span class=\"temp3 {{CabinetTHFontColor.cabinet"+i+"[0]}}\">{{cabinetTemp.cabinet"+i+"[0]}}</span></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr1").append($td);
                }
            }
        }

        if(!$scope.MDCId) return;
        MdcAlarmService.GetTemperature($scope.MDCId).then(function (data) {
            $scope.temps.lists = data;
            diagramService.UpdateTemperature(data).then(function (data) {
                $scope.temps.lists = data;
                $scope.getCabinetsTemp();
            });
        });
        activeSignalService.getAisleThermalHumidity($scope.MDCId).then(function(data){
            $scope.thermalHumidity = parseThermalHumidity(data);
            $scope.getAisleThermalHumidity = data;
            initAisleThermalHumidity(data);
        });
        EventService.GetEquipmentTemplateEvents("1006|1004").then(function(datas){
            $scope.EquipmentTemplateEvents = datas;
            getTHFontColor();
            getCabinetTHFontColor();
        });
        $scope.CorrectStyle();

        //初始化通道温度设备
        function initAisleThermalHumidity(aths){
            MdcConfigService.GetAisleDeviceLocation().then(function(data){
                $scope.AisleDeviceLocations = data;
                createAisleDevice(data,aths);
            });
        };
        function createAisleDevice(data,aths){
            $("#AisleTable").find("tr").remove();//清空所有的td
            for(var i = 1;i <= 3;i ++){
                var tr = "<tr>";
                for(var j = 1;j <= 7;j++){
                    var aisles = GetAisleDeviceByLocation(data,i,j);
                    var td = "";
                    if(j <= 3)
                        td = "<td align='left'>"+CreateAisleInfo(aisles,aths,'left')+"</td>";
                    else if(j == 4)
                        td = "<td align='center'>"+CreateAisleInfo(aisles,aths,'left')+"</td>";
                    else
                        td = "<td align='right'>"+CreateAisleInfo(aisles,aths,'right')+"</td>";
                    tr += td;
                }
                tr += "</tr>";
                var $tr = $compile(tr)($scope);
                $("#AisleTable").append($tr);
            }
        };
        function GetAisleDeviceByLocation(data,row,col){
            if(data){
                var obj = [];
                data.forEach(function(item){
                    if(item.TableRow == row && item.TableCol == col)
                        obj.push(item);
                });
                return obj;
            }else
                return undefined;
        };
        function GetThermalHumidity(data,aisle){
            if(data){
                var obj = undefined;
                data.forEach(function(item){
                    if(item.id == aisle.TableId)
                        obj = item;
                });
                return obj;
            }else
                return undefined;
        };
        function CreateAisleInfo(aisles,aths){
            if(aisles == undefined || aisles.length == 0) return "";
            var div = "";
            aisles.forEach(function(aisle){
                if(aisle.DeviceType == "thermalHumidity"){//温湿度
                    var ths = GetThermalHumidity(aths,aisle);
                    div += "<div id=\"thermalHumidity"+ths.site+"\" class=\"thermalHumidity_2\" style=\"width: 15vh;margin-right: 2vh;\" ng-show=\"currentStage == 'thermal'\">"+
                        "<div ng-show=\"thermalHumidity.thermal"+ths.site+"\">"+
                        "<div class=\"thermal_2 normal {{THFontColor.thermal"+ths.site+"}}\">{{thermalHumidity.thermal"+ths.site+"}}</div>"+
                        "</div>"+
                        "<div ng-show=\"thermalHumidity.humidity"+ths.site+"\">"+
                        "<div class=\"humidity_2 normal {{THFontColor.humidity"+ths.site+"}}\">{{thermalHumidity.humidity"+ths.site+"}}</div>"+
                        "</div>"+
                        "</div>";
                }
            });
            return div;
        };
    };

    //空间管理
    $scope.MdcSpaceInit = function(colNum,uHeight,type){
        var td = "";
        $("#mdc-alarm-tr1").children('td').remove();//清空所有的td
        $("#mdc-alarm-tr2").children('td').remove();//清空所有的td
        if(type == 1){
            $scope.MdcWidth = (100/16*parseInt(colNum));

            for(var i = 1;i <= colNum; i++){
                td = "<td class=\"button thermal cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body\" ng-click=\"clk('cabinet"+i+"')\">" +
                    "<div ng-repeat=\"device in SpaceCabinet.cabinet"+i+"\" style=\"margin-top: {{device.divMarginTop}}vh;height:{{device.divHeight}}vh;cursor: pointer;\" " +
                    "class=\"rackDevice text-center\"></div></div></td>";
                var $td = $compile(td)($scope);
                $("#mdc-alarm-tr2").append($td);
            }
        }else{
            $scope.MdcWidth = (100/16*(parseInt(colNum)/2));
            for(var i = 1;i <= colNum; i++){
                if(i <= colNum/2) {
                    td = "<td class=\"button thermal cabinet"+i+"\"><div class=\"cabinet-title bottom\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body\" ng-click=\"clk('cabinet"+i+"')\">" +
                        "<div ng-repeat=\"device in SpaceCabinet.cabinet"+i+"\" style=\"margin-top: {{device.divMarginTop}}vh;height:{{device.divHeight}}vh;cursor: pointer;\" " +
                        "class=\"rackDevice text-center\"></div></div></td>";//getSpaceCabinets('cabinet"+i+"')
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr2").append($td);
                }else{
                    td = "<td class=\"button thermal cabinet"+i+"\"><div class=\"cabinet-title top\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body\" ng-click=\"clk('cabinet"+i+"')\">" +
                        "<div ng-repeat=\"device in SpaceCabinet.cabinet"+i+"\" style=\"margin-top: {{device.divMarginTop}}vh;height:{{device.divHeight}}vh;cursor: pointer;\" " +
                        "class=\"rackDevice text-center\"></div></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr1").append($td);
                }
            }
        }
        getSpaceCabinets(uHeight);
        $scope.CorrectStyle();
    };

    //获取微模块机柜数
    MdcConfigService.GetMdcConfigInfo().then(function(data){
        data.forEach(function(item){
            if(item.id == $scope.MDCId){
                $scope.cabinetNumber = parseInt(item.cabinetNumber);
                $scope.MdcAlarmInit(item.cabinetNumber,item.cabinetUHeight,item.type);
            }
        });
    });

    $rootScope.$on("MdcAlarmInit",function(){
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcAlarmInit(item.cabinetNumber,item.cabinetUHeight,item.type);
                }
            });
        });
    });

    CameraService.loadVideoEquipment().then(function(data){
        if(data === "]" || data === undefined) return;
        $scope.camera = eval(data);
    });
    var monitorStop;
    $scope.monitorStart = function() {
        if (angular.isDefined(monitorStop)) return;

        getFousActiveAlarm();

        monitorStop = $interval(function() {
            if ($scope.status) {
                diagramService.updateCabinetData($scope.status).then(function(data) {
                    $scope.cabinetData = data;
                });
                $scope.CorrectStyle();
            }
            alarmService.updateActiveAlarmList().then(function(data) {
                if(data.length > 0){
                    $("#mdcAlarmTable").removeClass("normal");
                    $("#mdcAlarmTable").addClass("alarm");
                    $("#mdcAlarmTable > div").html(data.length);
                    $("#mdcAlarmTable > div").addClass("tableTop");
                }else{
                    $("#mdcAlarmTable").removeClass("alarm");
                    $("#mdcAlarmTable").addClass("normal");
                    $("#mdcAlarmTable > div").html("");
                    $("#mdcAlarmTable > div").removeClass("tableTop");
                }
            });
            getFousActiveAlarm();
        }, 3000);
    };
    $scope.monitorStop = function() {
        if (angular.isDefined(monitorStop)) {
            $interval.cancel(monitorStop);
            monitorStop = undefined;
        }
    };

    $scope.$watch('cabinetData', function(newValue, oldValue, scope) {
        if($scope.status === undefined) return;
        $scope.status.forEach(function(item){
            var value = _.findWhere(scope.cabinetData, {
                cabinetId: item.cabinetId
            });
            if(value != undefined){
                item.cabinetStatus = value.cabinetStatus;
                item.connectState = value.connectState;
            }
        });
        funFilt();
    });

    //get correct color
    $scope.CorrectStyle = function(){
        $scope.mdcStyle = {
            skyFalling1 : "normal"
        };
        var exist = false;
        if($scope.status){
            if($scope.currentStage == "monitor" || $scope.currentStage == undefined){
                $scope.status.forEach(function(item){
                    if(item.cabinetId.indexOf("cabinet")>-1){
                        $("." + item.cabinetId + " .cabinet-body").addClass(item.cabinetType);
                        if(item.connectState == 0 || item.connectState == 2)
                            $("." + item.cabinetId + " .cabinet-body > div").css('background','rgba(0, 0, 0, 0.59)');
                        else
                            $("." + item.cabinetId + " .cabinet-body > div").css('background','rgba(0, 0, 0, 0)');
                    }
                    eval("$scope.mdcStyle."+item.cabinetId+" = item.cabinetStatus");
                });
            }else if($scope.currentStage == "power"){/** 加载机柜功率百分比 */
                for(var i = 1;i <= $scope.cabinetNumber;i++){
                    $scope.status.forEach(function(item){
                        if(item.cabinetId == ("cabinet"+i)){
                            var percentage = parseFloat(parseFloat(item.power)/parseFloat(item.ratedPower))*100;
                            if(item.cabinetName === "" || item.cabinetName === undefined || percentage === Infinity || isNaN(percentage))
                                percentage = 0;
                            setProgressBar(item.cabinetId,item.cabinetName,percentage.toFixed(0),item.cabinetType);
                            exist = true;
                        }
                    });
                    if(!exist){
                        setProgressBar("cabinet"+i,'',0,'');
                        $(".cabinet" + i + " .cabinet-body > img").removeAttr('src');
                        $(".cabinet" + i + " .cabinet-body > img").removeClass('logoImg');
                    }
                    exist = false;
                }
            }
        }
    };

    var deviceInfoDialog = $modal({
        scope: $scope,
        templateUrl: '/partials/mdcdeviceinfo.html',
        show: false
    });
    $scope.clk = function(id){
        if($scope.status === undefined) return;
        $scope.cabinet = {};
        $scope.cabinetId = undefined;
        $scope.status.forEach(function(item){
            if(item.cabinetId === id){
                $scope.cabinet.description = item.description;

                deviceInfoDialog.$promise.then(deviceInfoDialog.show);
                $scope.cabinetStart();//开始机柜定时

                if(item.cabinetType == "RACK"){
                    $("#div1").show();
                    //设备信号列表
                    $("#div2").css("max-height","315px");
                }

                //计算U位
                $scope.rackTotalUHeight = $scope.cabinetUHeight;//机柜的默认总U高
                $scope.rackDomTotalHeight = 724;//机柜DOM的像素高度
                var uPixelHeight = parseFloat($scope.rackDomTotalHeight / $scope.rackTotalUHeight);
                $scope.cabinet.devices = [];
                $scope.activeDevice = {};
                var ids = item.equipmentId.split(',');
                var baseTypes = item.equipmentBaseType.split(',');
                var names = item.equipmentName.split(',');
                var indexs = item.uIndex.split(',');
                var heighs = item.uHeight.split(',');
                var tmpSensorsArray = [];

                for(var i = 0;i<ids.length;i++){
                    if(heighs[i] <= 0) continue;
                    var dev = {};
                    dev.id = ids[i];
                    dev.baseType = baseTypes[i];
                    dev.name = names[i];
                    dev.height = heighs[i];
                    dev.index = indexs[i];
                    tmpSensorsArray.push(dev);
                }
                if(item.cabinetType == "RACK" && tmpSensorsArray.length == 0){
                    var dec = {};
                    dec.divHeight = parseInt($scope.cabinetUHeight) * uPixelHeight;
                    dec.divMarginTop = 0;
                    tmpSensorsArray.push(dec);
                }else{
                    for(var i = 0; i < tmpSensorsArray.length; i++){
                        tmpSensorsArray[i].divHeight = parseInt(tmpSensorsArray[i].height) * uPixelHeight;
                        if (i == 0) {
                            tmpSensorsArray[i].divMarginTop = ($scope.rackTotalUHeight - parseInt(tmpSensorsArray[i].index) - parseInt(tmpSensorsArray[i].height)) * uPixelHeight;
                        } else {
                            tmpSensorsArray[i].divMarginTop = (parseInt(tmpSensorsArray[i - 1].index) - parseInt(tmpSensorsArray[i].height) - parseInt(tmpSensorsArray[i].index)) * uPixelHeight;
                        }
                    }
                }
                $scope.getStatusLabel = function (status) {
                    if(parseInt(status) >= 0 && parseInt(status) <= 3)
                        return $scope.languageJson.MDCHome.RackBox.Data.Alarm;//"告警"
                    else if (status == 255)
                        return $scope.languageJson.MDCHome.RackBox.Data.Normal;//"正常"
                    else if (status == -255)
                        return $scope.languageJson.MDCHome.RackBox.Data.Disconnect;//"已中断"
                    else
                        return $scope.languageJson.MDCHome.RackBox.Data.Loading;//"加载中"
                };
                $scope.getStatusIconClass = function (status) {
                    if (status == 255)
                        return "fa fa-check";
                    else if (status == -255 || status == 0)
                        return "fa fa-times";
                    else
                        return "fa fa-bell fa-fw alarmLevel" + status;
                };

                $scope.cabinet.devices = tmpSensorsArray;

                $scope.cabinet.name = item.cabinetName.replace(/[<br/>]/g,"");
                if($scope.cabinet && $scope.cabinet.devices.length > 0){
                    $scope.panelTitle = $scope.cabinet.devices[0].name;
                    $scope.selectedId = $scope.cabinet.devices[0].id;
                    $scope.deviceBaseTypeId = $scope.cabinet.devices[0].baseType;
                    //获得信号列表
                    if($scope.selectedId)
                        activeSignalService.getActiveSignalByDevice($scope.selectedId).then(function (data) {
                            deviceActiveSignals(data);
                        });
                    else
                        $scope.deviceActiveSignals = [];
                }
                //获得机柜信息
                if(!$scope.MDCId) return;
                $scope.cabinetId = item.cabinetId;
                activeSignalService.getCabinetInfoById($scope.MDCId,item.cabinetId).then(function(data){
                    $scope.cabinet.ratedPower = data.ratedPower;
                    $scope.cabinet.activePower = data.activePower;
                    $scope.cabinetTopTemperature = data.cabinetTopTemperature == 0 ? undefined : data.cabinetTopTemperature;
                    $scope.cabinetMiddleTemperature = data.cabinetMiddleTemperature == 0 ? undefined : data.cabinetMiddleTemperature;
                    $scope.cabinetBottomTemperature = data.cabinetBottomTemperature == 0 ? undefined : data.cabinetBottomTemperature;
                });

                var cid = item.cabinetId.replace(/[^0-9]/ig,'');
                $scope.CabinetAsset = {};
                //获得资产信息
                MdcConfigService.GetCabinetAssetInfo(cid,$scope.MDCId).then(function(data){
                    if(data){
                        $scope.CabinetAsset = parseCabinetAssets(data);
                    }
                });
            }
        });
    };
    
    function parseCabinetAssets(data){
        var arr = [];
        data.forEach(function(item){
            if(item.assetCode != ""){
                if(item.status == "0" || item.status == 0) item.status = $scope.languageJson.MDCHome.RackBox.Assets.Demolition;//"下架"
                else if(item.status == "1" || item.status == 1) item.status = $scope.languageJson.MDCHome.RackBox.Assets.Putaway;//"上架"
                arr.push(item);
            }
        });
        return arr;
    };

    $scope.selectDevice = function(device) {
        if(device.id == "" || device.id == undefined){
            $scope.deviceActiveSignals = [];
        }else{
            activeSignalService.getActiveSignalByDevice(device.id).then(function (data) {
                deviceActiveSignals(data);
            });
        }
        $scope.panelTitle = device.name;
        $scope.selectedId = device.id;
        $scope.deviceBaseTypeId = device.baseType;
    };

    function deviceActiveSignals(data){
        activeDeviceService.getActiveDevices().then(function (devices) {
            var dev = undefined;
            devices.forEach(function (item) {
                if(item.id == $scope.selectedId)
                    dev = item;
            });

            if(dev == undefined) return;

            if (dev.status === "Alarm") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Alarm;//"告警中";
            if (dev.status === "Normal") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Normal;//"正常运行";
            if (dev.status === "Disconnect") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Disconnect;//"已中断";

            dev.colorClass = function () {
                if (dev.status === "Alarm") return "text-danger";
                if (dev.status === "Normal") return "text-success";
                if (dev.status === "Disconnect") return "text-muted";
            };

            dev.iconClass = function () {
                if (dev.status === "Alarm") return "fa fa-bell";
                if (dev.status === "Normal") return "fa fa-check";
                if (dev.status === "Disconnect") return "fa fa-times";
            };

            $scope.activeDevice = dev;
            if ($scope.activeDevice.status != undefined && $scope.activeDevice.status == "Disconnect"){//设备状态为中断时，所有的信号状态都为中断
                data.forEach(function (item) {
                    item.alarmSeverity = -255;
                });
            }
            $scope.deviceActiveSignals = data;
        });
    }

    $scope.skipDevice = function(id,baseType){
        if(id == undefined || id == "" || baseType == undefined || baseType == "")  return;
        deviceInfoDialog.hide();
        var cfg = {};
        cfg.diagram = {};
        cfg.diagram.page = {};

        cfg.diagram.deviceBaseTypeId = baseType;
        cfg.diagram.deviceId = id;
        cfg.diagram.page.bgImage = "img/bg.jpg";

        $stateParams.deviceBaseTypeId = baseType;
        $stateParams.diagramview = 'device.diagram';
        $state.go($stateParams.diagramview, cfg);
    };

    /** 资产信息 **/
    $scope.hideDivClick = function(id,$event){
        var event = $($event.target).children("i");
        var dom = $('#'+id);
        var dis = dom.css('display');
        if(dis == 'block'){
            dom.hide();
            event.removeClass("fa-chevron-down");
            event.addClass("fa-chevron-right");
            //设备信号列表
            $("#div2").css("max-height","690px");
        }else{
            dom.show();
            event.removeClass("fa-chevron-right");
            event.addClass("fa-chevron-down");
            //设备信号列表
            $("#div2").css("max-height","315px");
        }
    };

    /** 显示/隐藏不告警信号设备 */
    $scope.filtering = function(){
        if(sessionStorage.getItem("filtering"+$scope.MDCId) === "false")
            sessionStorage.setItem("filtering"+$scope.MDCId,"true");
        else
            sessionStorage.setItem("filtering"+$scope.MDCId,"false");
        funFilt();
    };
    function funFilt(){
        if(sessionStorage.getItem("filtering"+$scope.MDCId) === null)
            sessionStorage.setItem("filtering"+$scope.MDCId,"true");
        if($scope.status === undefined) return;
        $scope.status.forEach(function(item){
            if(item.cabinetStatus === "normal"){
                if(item.cabinetId.indexOf("water")>-1 ||
                        item.cabinetId.indexOf("smoke")>-1 ||
                        item.cabinetId.indexOf("infrared")>-1 ||
                        item.cabinetId.indexOf("skyFalling")>-1){
                    if(item.PhaseACurrentDeviceId == undefined || item.PhaseACurrentDeviceId == ""){
                        HideByCabinetId(item.cabinetId);
                    }else{
                        if(sessionStorage.getItem("filtering"+$scope.MDCId) === "true"){
                            HideByCabinetId(item.cabinetId);
                        }
                        if(sessionStorage.getItem("filtering"+$scope.MDCId) === "false"){
                            ShowByCabinetId(item.cabinetId);
                        }
                    }
                }
            }else{
                if(item.cabinetId.indexOf("water")>-1 ||
                        item.cabinetId.indexOf("smoke")>-1 ||
                        item.cabinetId.indexOf("infrared")>-1){
                    eval("$scope.mdcStyle."+item.cabinetId+" = 'alarm'");
                    ShowByCabinetId(item.cabinetId);
                }else if(item.cabinetId.indexOf("door")>-1 || item.cabinetId.indexOf("skyFalling")>-1){
                    eval("$scope.mdcStyle."+item.cabinetId+" = 'alarm'");
                }
            }
        });
        if(sessionStorage.getItem("filtering"+$scope.MDCId) === "true"){
            $("#mdcFiltering").removeClass("filteringShow");
            $("#mdcFiltering").addClass("filteringHide");
        }
        if(sessionStorage.getItem("filtering"+$scope.MDCId) === "false"){
            $("#mdcFiltering").removeClass("filteringHide");
            $("#mdcFiltering").addClass("filteringShow");
        }
    }

    function ShowByCabinetId(cabinetId){
        $("#"+cabinetId).css("visibility","visible");
    }

    function HideByCabinetId(cabinetId){
        $("#"+cabinetId).css("visibility","hidden");
    }

    var alarmTableDialog = $modal({
        scope:$scope,
        templateUrl:'partials/MDCAlarmTable.html',
        show:false
    });
    $scope.alarmTable = function(){
        $stateParams.alarmLevel = 0;//告警等级默认为0
        alarmTableDialog.$promise.then(alarmTableDialog.show);
    };
    //视频
    var setDlg;
    $scope.optionCamera = function(cameraId){
        setDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/cameradialog.html',
            show: false
        });
        $scope.cameraId = cameraId;
        setDlg.$promise.then(setDlg.show);
        preview(cameraId);
        JudgeBrowser();
    };
    $scope.fullscreen=function(){
        if(-1==WebVideoCtrl.I_CheckPluginInstall()) return;
        WebVideoCtrl.I_FullScreen(true)
    };
    var addVideoDialog = $modal({
        scope:$scope,
        templateUrl:'partials/addVideo.html',
        show:false
    });

    $scope.cameraClick = function(){
        if($scope.camera == undefined || $scope.camera.length == 0){
            CameraService.loadVideoEquipment().then(function(data){
                if(data === "]" || data === undefined) return;
                $scope.camera = eval(data);
                showVideo();
            });
        }else{
            showVideo();
        }
    };

    function showVideo(){
        $scope.camera.forEach(function(item){
            if($scope.cameraId === item.EquipmentId){
                if(item.VideoType == '2'){
                    $scope.showChanNum = true;
                }else{
                    $scope.showChanNum = false;
                }
                $scope.video.eId = item.EquipmentId;
                $scope.video.eName = item.EquipmentName;
                $scope.video.ipAddress = item.IpAddress;
                $scope.video.ePort = item.Port;
                $scope.video.videoType = item.VideoType;
                $scope.video.eChanNum = item.ChanNum;
                $scope.video.userName = item.UserName;
                $scope.video.userPwd = item.UserPwd;
                $scope.video.IpOrNvr = true;
                setDlg.hide();
                addVideoDialog.$promise.then(addVideoDialog.show);

                $scope.changeVideoTypeByVideoName = function(videoType){
                    if(videoType == 1){
                        $scope.video.eChanNum = "1";
                        $scope.showChanNum = false;
                        $("#Video_ChanNum").addClass("ng-hide");
                    } else {
                        $scope.showChanNum = true;
                        $("#Video_ChanNum").removeClass("ng-hide");
                    }
                };
            }
        });
    }

    //update data
    $scope.addVideoClick = function(){
        if($scope.video.eName == "" || $scope.video.eName == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Name,3000);/*请输入视频设备名称！*/
            return;
        }
        if($scope.video.ipAddress == "" || $scope.video.ipAddress == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Address,3000);/*请输入视频设备地址！*/
            return;
        }
        if($scope.video.ePort == "" || $scope.video.ePort == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Port,3000);/*请输入视频设备端口号！*/
            return;
        }
        if($scope.video.eChanNum == "" || $scope.video.eChanNum == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Channel,3000);/*请输入视频设备频道号！*/
            return;
        }
        if($scope.video.userName == "" || $scope.video.userName == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.User,3000);/*请输入用户名！*/
            return;
        }
        if($scope.video.userPwd == "" || $scope.video.userPwd == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Password,3000);/*请输入密码！*/
            return;
        }
        CameraService.updateVideoEquipment($scope.video.eId,$scope.video.eName,$scope.video.videoType,$scope.video.ipAddress,
            $scope.video.ePort,$scope.video.eChanNum,$scope.video.userName,$scope.video.userPwd).then(function(data){
                var cameraArr = undefined;
                $scope.camera.forEach(function(item){
                    if(item.EquipmentId == $scope.video.eId)
                        cameraArr = item.Cameras;
                });
                var result = (cameraArr.length-$scope.video.Number);
                if(result>0){//删除监控点
                    var index = cameraArr.length-1;
                    for(var i=0;i<result;i++){
                        CameraService.deleteCamera(cameraArr[index].CameraId).then(function(data){});
                        index --;
                    }
                }else if(result<0){//新增监控点
                    for(var i=cameraArr.length;i<$scope.video.Number;i++){
                        var name = "Camera"+(i+1);
                        var charNum = i+1;
                        CameraService.saveCamera($scope.video.eId,name,charNum).then(function(data){});
                    }
                }

                if(data=="OK"){
                    balert.show('success',$scope.languageJson.MDC.Starting.Successfully,3000);//danger || success '修改成功！'
                    addVideoDialog.hide();
                    //查询新的数据存储
                    CameraService.loadVideoEquipment().then(function(data){
                        if(data === "]" || data === undefined) return;
                        $scope.camera = eval(data);
                        //获取摄像头IP状态
                        $scope.camera.forEach(function(item){
                            MdcAlarmService.GetIPStatus(item.IpAddress).then(function(data){
                                if(data == "true") eval("$scope.camera"+item.EquipmentId+"_img = 'cameraNormal'");
                                else  eval("$scope.camera"+item.EquipmentId+"_img = 'cameraDisconnect'");
                            });
                        });
                    });
                }
                else
                    balert.show('danger',$scope.languageJson.MDC.Starting.Fail,3000);//danger || success data
        });
        if ($scope.camera && $scope.camera.length > 0) {
            $scope.camera.forEach(function(item){
                MdcAlarmService.GetIPStatus(item.IpAddress).then(function(data){
                    if(data == "true") eval("$scope.camera"+item.EquipmentId+"_img = 'cameraNormal'");
                    else  eval("$scope.camera"+item.EquipmentId+"_img = 'cameraDisconnect'");
                });
            });
        }
    };

    function preview(cameraId){
        if($scope.camera == undefined || $scope.camera.length == 0){
            CameraService.loadVideoEquipment().then(function(data){
                if(data === "]" || data === undefined) return;
                $scope.camera = eval(data);
                $scope.camera.forEach(function(item){
                    if(cameraId === item.EquipmentId){
                        $scope.src="partials/camerapreview.html?ip="+item.IpAddress
                            +"&port="+item.Port+"&user="+item.UserName+"&pwd="+item.UserPwd+"&channo="+item.ChanNum;
                    }
                });
            });
        }else{
            $scope.camera.forEach(function(item){
                if(cameraId === item.EquipmentId){
                    $scope.src="partials/camerapreview.html?ip="+item.IpAddress
                        +"&port="+item.Port+"&user="+item.UserName+"&pwd="+item.UserPwd+"&channo="+item.ChanNum;
                }
            });
        }
    }

    var cameraStop;
    $scope.cameraStart = function(){
        if (angular.isDefined(cameraStop)) return;
        CameraService.loadVideoEquipment().then(function(data){
            if(data === "]" || data === undefined) return;
            $scope.camera = eval(data);
            $scope.camera.forEach(function(item){
                MdcAlarmService.GetIPStatus(item.IpAddress).then(function(data){
                    if(data == "true") eval("$scope.camera"+item.EquipmentId+"_img = 'cameraNormal'");
                    else  eval("$scope.camera"+item.EquipmentId+"_img = 'cameraDisconnect'");
                });
            });
        });

        cameraStop = $interval(function() {
            if ($scope.camera && $scope.camera.length > 0) {
                $scope.camera.forEach(function(item){
                    MdcAlarmService.GetIPStatus(item.IpAddress).then(function(data){
                        if(data == "true") eval("$scope.camera"+item.EquipmentId+"_img = 'cameraNormal'");
                        else  eval("$scope.camera"+item.EquipmentId+"_img = 'cameraDisconnect'");
                    });
                });
            }
        }, 60000);
    };

    $scope.cameraStop = function() {
        if (angular.isDefined(cameraStop)) {
            $interval.cancel(cameraStop);
            cameraStop = undefined;
        }
    };

        //淡入淡出
    $scope.cabinetMouseenter = function(){
        $(".device"+" > td > div.cabinet-title").fadeIn(2000);
    };
    $scope.cabinetMouseleave = function(){
        $(".device"+" > td > div.cabinet-title").fadeOut(2000);
    };

    function JudgeBrowser(){
        var NV = {};
        var UA =  navigator.userAgent.toLowerCase();
        NV.name = (UA.indexOf("chrome")>0)?'chrome':'unkonw';
        NV.version = (NV.name=='chrome')?UA.match(/chrome\/([\d.]+)/)[1]:'0';
        var isIe = "ActiveXObject" in window;
        if(isIe) return;//IE
        NV.bit = (UA.indexOf("x64")>0)?64:32;
        if(NV.name === 'chrome' && parseInt(NV.version) <= 42) return;//64bit chrome v34
        balert.show('danger',$scope.languageJson.Videos.Browsing,3000);/*"视频浏览不支持当前浏览器或版本，请使用IE或者Chrome v42以下的浏览器！"*/
    }
    $scope.changeVideoTypeByVideoName = function(videoType){
        if(videoType == 1){
            $scope.video.IpOrNvr = true;
            $scope.video.Number = 1;
        } else {
            $scope.video.IpOrNvr = false;
            var length = undefined;
            $scope.camera.forEach(function(item){
                if(item.EquipmentId == $scope.cameraId)
                    length = item.Cameras.length;
            });
            $scope.video.Number = length;
        }
    };

    $scope.getTitle = function(device){
        if(device.name == undefined) return "";
        var position = "";
        if(device.height == 1 || device.height == "1"){
            position = parseInt(device.index)+1;
        }else{
            position = (parseInt(device.index)+1)+"-"+(parseInt(device.index)+parseInt(device.height));
        }
        return "<h5> U:["+position+"]</h5>";
        //return "<h5> 开始U位:"+device.index+" U高:"+device.height+"</h5>";
    };


    /****************************  功能菜单 Start ******************************************/
    $(".MdcMenu table tr td").click('click',function (e){
        $(".MdcMenu table tr").children("td").each(function(){$(this).removeClass("selected")});
        $(this).addClass("selected");
    });

    //安全监控 --------------------------------------------------------------------------
    $scope.stageMonitor = function(){
        //开启定时，关闭定时
        $scope.monitorStart();
        $scope.powerStop();
        $scope.thermalStop();

        $scope.currentStage = "monitor";
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcAlarmInit(item.cabinetNumber,item.cabinetUHeight,item.type);
                }
            });
        });
    };

    //获取前4条告警
    function getFousActiveAlarm(){
        alarmService.updateActiveAlarmList().then(function(data){
            $scope.FilterData.AlarmList = parseAlarmList(data);
            $scope.FilterData.Legend = data.length > 99 ? "99+" : data.length;
        });
    }

    //只获取最多4条告警，与字符串过长处理
    function parseAlarmList(data){
        var arr = [];
        for(var i = 0; i < data.length && i < 4;i++){
            if(data[i].alarmContent.length > 40){
                var l = data[i].alarmContent.length;
                data[i].alarmContent = data[i].alarmContent.substring(0,40) +"...";
            }
            arr.push(data[i]);
        }
        return arr;
    }

    var remarkDialog = null;
    $scope.beginEndAlarm = function(uniqueId) {
        $scope.selectedAlarmUniqueId = uniqueId;
        remarkDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/alarmRemarkDialog.html',
            show: false
        });
        remarkDialog.$promise.then(remarkDialog.show);
    };

    $scope.endEndAlarm = function(note) {
        var logonId = localStorage.getItem("username");
        var param = "'" + $scope.selectedAlarmUniqueId + "'|" + logonId + "|" + note;
        alarmService.endAlarm(param).then(function(data) {
            getFousActiveAlarm();
            remarkDialog.hide();
        });
    };

    //能耗分布 --------------------------------------------------------------------------
    var powerStop;
    $scope.temps = {};
    $scope.powerStart = function(){
        if (angular.isDefined(powerStop)) return;
        powerStop = $interval(function() {
            if ($scope.status) {
                diagramService.updatePowerData($scope.MDCId,$scope.status).then(function(data) {
                    $scope.powerData = data;
                });
                $scope.CorrectStyle();
            }
        },3000);
    };
    $scope.powerStop = function(){
        if (angular.isDefined(powerStop)) {
            $interval.cancel(powerStop);
            powerStop = undefined;
        }
    };

    $scope.$watch('powerData', function(newValue, oldValue, scope) {
        if($scope.status === undefined) return;
        $scope.status.forEach(function(item){
            var value = _.findWhere(scope.powerData, {
                cabinetId: item.cabinetId
            });
            if(value != undefined)
                item.power = value.power;
            var percentage = (parseFloat(item.power)/parseFloat(item.ratedPower))*100;
            setProgressBar(item.cabinetId,item.cabinetName,percentage.toFixed(0),item.cabinetType);
        });
    });
    function setProgressBar(progressId,name,percentage,cabinetType) {
        var cover = 100-percentage;
        $("." + progressId + " .cabinet-body > div").css("height", String(cover) + "%");
        if(percentage == 0 || percentage == "NaN" || percentage == "Infinity") $("." + progressId + " .cabinet-body > div").html("");
        else $("." + progressId + " .cabinet-body > div").html(String(percentage) + "%");
        //$("." + progressId + " .cabinet-body").addClass('gradient');
        $("." + progressId + " .cabinet-body > img").attr({src : getImgSrc(cabinetType),class: 'logoImg'});
        //$("." + progressId + " .cabinet-title").html(name);
    }
    function getImgSrc(type){
        var sysStyle = localStorage.getItem("systemStyle");

        if(type === 'UPS') {
            if(sysStyle == "White")
                return "../img/mdc/ups_White.png";
            return "../img/mdc/ups.png";
        }if(type === 'RACK') {
            if(sysStyle == "White")
                return "../img/mdc/rack_White.png";
            return "../img/mdc/rack.png";
        }if(type === 'AC') {
            if(sysStyle == "White")
                return "../img/mdc/ac_White.png";
            return "../img/mdc/ac.png";
        }if(type === 'UNUSE') {
            if(sysStyle == "White")
                return "../img/mdc/unuse_White.png";
            return "../img/mdc/unuse.png";
        }if(type === 'CELL') {
            if(sysStyle == "White")
                return "../img/mdc/cell_White.png";
            return "../img/mdc/cell.png";
        }if(type === 'RECTIFIER') {
            if(sysStyle == "White")
                return "../img/mdc/rectifier_White.png";
            return "../img/mdc/rectifier.png";
        }if(type === 'HVDC') {
            if(sysStyle == "White")
                return "../img/mdc/hvdc_White.png";
            return "../img/mdc/hvdc.png";
        }
    }

    $scope.stagePower = function(){
        $scope.powerStart();
        $scope.monitorStop();
        $scope.thermalStop();

        $scope.currentStage = "power";
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcPowerInit(parseInt(item.cabinetNumber),item.type);
                }
            });
        });
    };

    //温度分布 --------------------------------------------------------------------------
    var thermalStop;
    $scope.thermalStart = function() {
        if (angular.isDefined(thermalStop)) return;

        thermalStop = $interval(function() {
            if ($scope.temps.lists) {
                diagramService.UpdateTemperature($scope.temps.lists).then(function(data){
                    $scope.temps.lists = data;
                });
                $scope.getCabinetsTemp();
            }
            if($scope.MDCId){
                activeSignalService.getAisleThermalHumidity($scope.MDCId).then(function(data){
                    $scope.thermalHumidity = parseThermalHumidity(data);
                });
            }
            getTHFontColor();
            getCabinetTHFontColor();
        }, 3000);
    };
    $scope.thermalStop = function() {
        if (angular.isDefined(thermalStop)) {
            $interval.cancel(thermalStop);
            thermalStop = undefined;
        }
    };

    $scope.getCabinetsTemp = function(){
        if($scope.temps.lists){
            $scope.temps.lists.forEach(function(list){
                var str = list.temps.slideName.split("-");//机柜01-1
                var num = parseInt(str[0].replace(/[^0-9]/ig,""));
                if(eval("$scope.cabinetTemp.cabinet"+num+" == undefined"))
                    eval("$scope.cabinetTemp.cabinet"+num+" = ['','','']");
                eval("$scope.cabinetTemp.cabinet"+num+"["+(parseInt(str[1])-1)+"] = list.temps.val+' ℃'");
            });
        }
    };

    function parseThermalHumidity(data){
        var cfg = {};
        if(!data) return cfg;
        data.forEach(function(th){
            eval("cfg.thermal"+th.site+"='"+th.tValue+ "'");
            eval("cfg.humidity"+th.site+"='"+th.hValue+"'");
        });
        return cfg;
    };

    function getTHFontColor(){
        if($scope.EquipmentTemplateEvents == undefined || $scope.EquipmentTemplateEvents.length == 0) return;
        if($scope.getAisleThermalHumidity == undefined || $scope.getAisleThermalHumidity.length == 0) return;
        var data = $scope.getAisleThermalHumidity;
        var datas = $scope.EquipmentTemplateEvents;
        var value = "";
        $scope.THFontColor = {};
        data.forEach(function(item){
            datas.forEach(function(items){
                if(item.tSignalId == items.signalId){
                    if(isExistDevice(items.equipments,item.tDeviceId)){
                        if(item.tValue != undefined && item.tValue != ""){
                            if(items.startOperation == "=") items.startOperation = "==";
                            eval("value = parseFloat($scope.thermalHumidity.thermal"+item.site+".replace(/[^0-9.]/ig,''))");
                            if(eval(value+" "+items.startOperation+" "+items.startCompareValue)){
                                eval("$scope.THFontColor.thermal"+item.site+" = 'alarmLevel"+items.eventSeverity+"'");
                            }
                        }
                    }
                }
                if(item.hSignalId == items.signalId){
                    if(isExistDevice(items.equipments,item.hDeviceId)){
                        if(item.hValue != undefined && item.hValue != ""){
                            if(items.startOperation == "=") items.startOperation = "==";
                            eval("value = parseFloat($scope.thermalHumidity.humidity"+item.site+".replace(/[^0-9.]/ig,''))");
                            if(eval(value+" "+items.startOperation+" "+items.startCompareValue)){
                                eval("$scope.THFontColor.humidity"+item.site+" = 'alarmLevel"+items.eventSeverity+"'");
                            }
                        }
                    }
                }
            });
        });
    };

    function getCabinetTHFontColor(){
        $scope.CabinetTHFontColor = {};
        if($scope.EquipmentTemplateEvents == undefined || $scope.EquipmentTemplateEvents.length == 0) return;
        if($scope.temps.lists == undefined || $scope.temps.lists.length == 0) return;
        var data = $scope.temps.lists;
        var datas = $scope.EquipmentTemplateEvents;
        var value = "";
        data.forEach(function(item){
            datas.forEach(function(items){
                if(item.temps.deviceId == items.equipments || item.temps.signalId == items.signalId){
                    var str = item.temps.slideName.split("-");//机柜01-1
                    var num = parseInt(str[0].replace(/[^0-9]/ig,""));
                    if(items.startOperation == "=") items.startOperation = "==";
                    if(eval("$scope.cabinetTemp.cabinet"+num+" != undefined && $scope.cabinetTemp.cabinet"+num+".length > 0")){
                        eval("value = $scope.cabinetTemp.cabinet"+num+"["+(parseInt(str[1])-1)+"].replace(/[^0-9.]/ig,'')");
                        if(eval(value+" "+items.startOperation+" "+items.startCompareValue)){
                            if(eval("$scope.CabinetTHFontColor.cabinet"+num+" == undefined"))
                                eval("$scope.CabinetTHFontColor.cabinet"+num+" = ['','','']");
                            eval("$scope.CabinetTHFontColor.cabinet"+num+"["+(parseInt(str[1])-1)+"] = 'alarmLevel"+items.eventSeverity+"'");
                        }
                    }
                }
            });
        });
    };

    function isExistDevice(arr,deviceId){
        for(var i = 0;i < arr.length;i++){
            if(arr[i] == deviceId) return true;
        }
        return false;
    };

    $scope.stageThermal = function(){
        $scope.thermalStart();
        $scope.powerStop();
        $scope.monitorStop();

        $scope.currentStage = "thermal";
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcTemperatureInit(parseInt(item.cabinetNumber),item.type);
                }
            });
        });
    };

    //空间管理 --------------------------------------------------------------------------
    function getSpaceCabinets(uHeight){
        $scope.SpaceCabinet = {};
        if($scope.status){
            $scope.status.forEach(function(item){
                var tmpSensorsArray = [];
                if(item.cabinetId.indexOf("cabinet") > -1){
                    //计算U位
                    var rackTotalUHeight = uHeight;//机柜的默认总U高
                    var rackDomTotalHeight = 11.5;//机柜DOM的像素高度
                    var uPixelHeight = parseFloat(rackDomTotalHeight / rackTotalUHeight);
                    tmpSensorsArray.cabinetId = item.cabinetId;

                    var ids = item.equipmentId.split(',');
                    var baseTypes = item.equipmentBaseType.split(',');
                    var names = item.equipmentName.split(',');
                    var indexs = item.uIndex.split(',');
                    var heighs = item.uHeight.split(',');
                    //获取所有占用了空间的机柜
                    for(var i = 0;i<ids.length;i++){
                        if(heighs[i] <= 0) continue;
                        var dev = {};
                        dev.id = ids[i];
                        dev.baseType = baseTypes[i];
                        dev.name = names[i];
                        dev.height = heighs[i];
                        dev.index = indexs[i];
                        tmpSensorsArray.push(dev);
                    }
                    //设置机柜中设备位置
                    for(var i = 0; i < tmpSensorsArray.length; i++){
                        tmpSensorsArray[i].divHeight = parseInt(tmpSensorsArray[i].height) * uPixelHeight;
                        if (i == 0) {
                            tmpSensorsArray[i].divMarginTop = (rackTotalUHeight - parseInt(tmpSensorsArray[i].index) - parseInt(tmpSensorsArray[i].height)) * uPixelHeight;
                        } else {
                            tmpSensorsArray[i].divMarginTop = (parseInt(tmpSensorsArray[i - 1].index) - parseInt(tmpSensorsArray[i].height) - parseInt(tmpSensorsArray[i].index)) * uPixelHeight;
                        }
                    }
                    if(tmpSensorsArray.length > 0)
                        eval("$scope.SpaceCabinet."+item.cabinetId+"=tmpSensorsArray");
                    else
                        eval("$scope.SpaceCabinet."+item.cabinetId+"=[]");
                }
            });
        }
    };

    $scope.stageSpace = function(){
        $scope.powerStop();
        $scope.monitorStop();
        $scope.thermalStop();

        $scope.currentStage = "space";
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.MdcSpaceInit(item.cabinetNumber,item.cabinetUHeight,item.type);
                    $scope.uHeight = item.cabinetUHeight;
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                }
            });
        });
    };
    /****************************  功能菜单 End ******************************************/

    // 机会弹出框 定时
    var cabinetStop;
    $scope.cabinetStart = function(){
        if (angular.isDefined(cabinetStop)) return;
        cabinetStop = $interval(function() {
            if(deviceInfoDialog.$isShown == true){
                if($scope.selectedId){
                    //获得信号列表
                    activeSignalService.getActiveSignalByDevice($scope.selectedId).then(function (data) {
                        deviceActiveSignals(data);
                    });
                }
                //获得机柜信息
                if($scope.MDCId && $scope.cabinetId){
                    activeSignalService.getCabinetInfoById($scope.MDCId,$scope.cabinetId).then(function(data){
                        $scope.cabinet.ratedPower = data.ratedPower;
                        $scope.cabinet.activePower = data.activePower;
                        $scope.cabinetTopTemperature = data.cabinetTopTemperature == 0 ? undefined : data.cabinetTopTemperature;
                        $scope.cabinetMiddleTemperature = data.cabinetMiddleTemperature == 0 ? undefined : data.cabinetMiddleTemperature;
                        $scope.cabinetBottomTemperature = data.cabinetBottomTemperature == 0 ? undefined : data.cabinetBottomTemperature;
                    });
                }
            }
        },3000);
    };
    $scope.cabinetStop = function(){
        if (angular.isDefined(cabinetStop)) {
            $interval.cancel(cabinetStop);
            cabinetStop = undefined;
        }
    };

    $scope.mouseEnterDevice = function(){
        $(function () { $(".rackDevice").tooltip({html : true });});
    };

    /*********************************  冷通道配置 Start ************************************************/
    function GetAisleDeviceLocation(){
        MdcConfigService.GetAisleDeviceLocation().then(function(data){
            $scope.AisleDeviceLocations = data;
        });
    }

    function GetRtspVideo(){
        RtspVideoService.GetRtspVideo().then(function(data){
            $scope.RtspVideos = data;
        });
    }
    GetAisleDeviceLocation();
    GetRtspVideo();

    $scope.openAisleTable = function(rows,cols){
        if($scope.AisleDeviceLocations == undefined){
            balert.show('danger','请先配置！',3000);
            return;
        }

        $scope.AisleDeviceLocations.forEach(function(item){
            if(item.TableRow == rows && item.TableCol == cols){
                if(item.DeviceType == "rtspVideo")
                    openRtspVideo(item.TableId);
                else if(item.DeviceType == "video")
                    $scope.optionCamera(item.TableId);
            }
        });
    };

    var showRtspVideoDialog = $modal({
        scope: $scope,
        templateUrl: '/partials/showRtspVideo.html',
        show: false
    });
    function openRtspVideo(tableId){
        showRtspVideoDialog.$promise.then(showRtspVideoDialog.show);
        $scope.RtspVideos.forEach(function(rv){
            if(tableId == rv.Id){
                var rtspUrl = $sce.trustAsResourceUrl(rv.Path);
                setTimeout(function(){
                    $("#myPlayer").attr("src",rtspUrl);
                    var player = new EZUIPlayer('myPlayer');
                },1);
            }
        });
    };
    /*********************************  冷通道配置 End ************************************************/

    /*** 微模块控制 ***/
    var controlPasswordDlg = $modal({
        scope: $scope,
        templateUrl: 'partials/controlauthorizesetter.html',
        show: false
    });
    $scope.mdcControlClk = function(name){
        MdcConfigService.GetMdcControlByName("",name).then(function(data){
            if(data.length > 0){
                $scope.controlinfo = data[0];
                if(data[0].password != ""){
                    $scope.controlinfo.isShow = true;
                    $scope.controlinfo.isPwd = true;
                    controlPasswordDlg.$promise.then(controlPasswordDlg.show);
                }else {
                    $scope.controlinfo.isPwd = false;
                    $scope.sendcontrol();
                }
            }
        });
    };

    $scope.sendcontrol = function(){
        var alert = $scope.languageJson.Configuration.RemoteControl.Alert;
        if($scope.controlinfo.isPwd == true && $scope.controlinfo.userpwd != $scope.controlinfo.password){
            balert.show('danger', alert.PasswordError,3000);//'密码不正确，请重新输入！'
            return;
        }
        var paras = $scope.controlinfo;
        var userName = localStorage.getItem("username");
        devcontrolService.senddevcontrol(paras.equipmentId,paras.baseTypeId,paras.parameterValues,userName).then(function(data){
            if(data == "success") {
                balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
                controlPasswordDlg.hide();
            }else
                balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
        });
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.monitorStop();
        $scope.powerStop();
        $scope.thermalStop();
        $scope.cabinetStop();
        $scope.cameraStop();
    });
    $scope.monitorStart();
    $scope.cameraStart();
}]);

nurseController.controller('MDCTempCtrl', ['$scope',  '$interval', 'MdcAlarmService', 'diagramService','$rootScope','$compile','MdcConfigService',
    function($scope, $interval ,MdcAlarmService,diagramService,$rootScope,$compile,MdcConfigService){

    // 颜色#FF00FF格式转为Array(255,0,255)
    function color2rgb(color)
    {
     var r = parseInt(color.substr(1, 2), 16);
     var g = parseInt(color.substr(3, 2), 16);
     var b = parseInt(color.substr(5, 2), 16);
     return new Array(r, g, b);
    }

    // 颜色Array(255,0,255)格式转为#FF00FF
    function rgb2color(rgb)
    {
     var s = "#";
     for (var i = 0; i < 3; i++)
     {
      var c = Math.round(rgb[i]).toString(16);
      if (c.length == 1)
       c = '0' + c;
      s += c;
     }
     return s.toUpperCase();
    }

    function getHeatMapColor(value)
    {
        var resultColor = [];
        var color = [ [0,0,1], [0,1,0], [1,1,0], [1,0,0] ];
     
        var idx1;        // |-- Our desired color will be between these two indexes in "color".
        var idx2;        // |
        var fractBetween = 0;  // Fraction between "idx1" and "idx2" where our value is.
     
        if(value <= 0)      {  idx1 = idx2 = 0; }    // accounts for an input <=0
        else if(value >= 1)  {  idx1 = idx2 = 3; }    // accounts for an input >=0
        else
        {
            value = value * 3;                      // Will multiply value by 3.
            idx1  = Math.floor(value);                  // Our desired color will be after this index.
            idx2  = idx1+1;                        // ... and before this index (inclusive).
            fractBetween = value - idx1;    // Distance between the two indexes (0-1).
        }

        resultColor.push(((color[idx2][2] - color[idx1][2])*fractBetween + color[idx1][2]) * 255);//blue
        resultColor.push(((color[idx2][1] - color[idx1][1])*fractBetween + color[idx1][1]) * 255);//green
        resultColor.push(((color[idx2][0] - color[idx1][0])*fractBetween + color[idx1][0]) * 255);//red

      return resultColor
    }

    // 生成渐变
    function gradient(fromValue,toValue,step)
    {
        var colorDictionary = [];
        var valStep = (toValue - fromValue) / step;

        for (var N = 0; N <= step; N++)
        {
            var colorItem = {};
            colorItem.value = fromValue + valStep * N;
            colorItem.color = rgb2color(getHeatMapColor(N/step));
            colorDictionary.push(colorItem);
        }

        return colorDictionary;     
    }

    //get correct color
    $scope.colorDic = gradient(38,18,20);

    // var mockRacks = function(){
    //     var resArray = [];

    //     for(var i=0;i<8;i++){
    //         var rack = {name:"服务器机架00" + i};
    //         rack.servers =[];

    //         for(var j=0;j<42;j++){
    //             var srv = {};
    //             srv.pos = j +1;
    //             srv.temp = rgb2color(getHeatMapColor(Math.random()));
    //             rack.servers.push(srv);
    //         }
    //         resArray.push(rack);
    //     }

    //     return resArray;
    // };

    // $interval(function() {
    //     $scope.tempRacks = mockRacks();
    // }, 2000);

    //$scope.MDCId = '100000001';
    $scope.temp = [];
    $scope.topOption = {
        panel:{ width: 960, height:160},
        sensors:[{x:20,y:40,val:1}]
    };
    $scope.bottomOption = {
        panel:{ width: 960, height:160},
        sensors:[{x:20,y:40,val:1}]
    };


    var stop;
    $scope.MdcTempInit = function(colNum,type){
        //动态加载
        //var colNum = 32;
        $scope.MdcType = type;
        if(type == 1 || type == 0) $scope.isHide = true;
        else  $scope.isHide = false;
        var td = "";
        $("#mdc-temp-tr1").children('div').remove();//清空所有的div子集
        $("#mdc-temp-tr2").children('div').remove();//清空所有的div子集
        for(var i = 1;i <= colNum; i++){
            td = "<div style=\"float:left;display:inline-block;padding:0px;border:thin solid white;width:80px;height:160px;margin:0;\"></div>";
            var $td = $compile(td)($scope);
            if(type == 0 || type == 1){
                $("#mdc-temp-tr1").append($td);
            }else{
                if(i <= colNum/2)
                    $("#mdc-temp-tr2").append($td);
                else
                    $("#mdc-temp-tr1").append($td);
            }
        }
        //设置panel的宽度
        $scope.topOption.panel.width = 80*colNum/2;
        $scope.bottomOption.panel.width = 80*colNum/2;
        if(type == 1){
            $scope.topOption.panel.width = 80*colNum;
            $scope.bottomOption.panel.width = 0;
        }
        $("#r1").css({width:$scope.topOption.panel.width+"px",overflow: "hidden"});
        $("#r2").css({width:$scope.bottomOption.panel.width+"px",overflow: "hidden"});


        if(!$scope.MDCId) return;
        MdcAlarmService.getCabinetTemp($scope.MDCId).then(function(data){
            $scope.temp = data;
            if ($scope.temp) {
                $scope.loading = true;
                diagramService.updateTempData($scope.temp).then(function(data) {
                    if($scope.MdcType == 0 || $scope.MdcType == 1){
                        $scope.topOption.sensors = data.topRank;
                        if($scope.topOption.sensors.length > 0)
                            ThermalMap.create("#r1",$scope.topOption);
                    }else{
                        $scope.topOption.sensors = data.topRank;
                        if($scope.topOption.sensors.length > 0)
                            ThermalMap.create("#r2",$scope.topOption);

                        $scope.bottomOption.sensors = data.bottomRank;
                        if($scope.bottomOption.sensors.length > 0)
                            ThermalMap.create("#r1", $scope.bottomOption);
                    }
                    $scope.loading = false;
                });
            }
        });
        //全屏
        $(".fullscreen a").attr("title",$scope.languageJson.Configuration.FullScreen);
    };

    //获取微模块机柜数
    MdcConfigService.GetMdcConfigInfo().then(function(data){
        data.forEach(function(item){
            if(item.id == $scope.MDCId){
                $scope.cabinetNumber = parseInt(item.cabinetNumber);
                $scope.MdcTempInit(parseInt(item.cabinetNumber),item.type);
            }
        });
    });

    $rootScope.$on("MdcTempInit",function(){
        $scope.loading = true;
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcTempInit(parseInt(item.cabinetNumber),item.type);
                }
            });
        });
    });

    $scope.start = function() {
        $scope.loading = true;
        if (angular.isDefined(stop)) return;
        stop = $interval(function() {
            if ($scope.temp) {
                $scope.loading = true;
                diagramService.updateTempData($scope.temp).then(function(data) {
                    if($scope.MdcType == 0 || $scope.MdcType == 1){
                        $scope.topOption.sensors = data.topRank;
                        if($scope.topOption.sensors.length > 0)
                            ThermalMap.create("#r1",$scope.topOption);
                    }else{
                        $scope.topOption.sensors = data.topRank;
                        if($scope.topOption.sensors.length > 0)
                            ThermalMap.create("#r2",$scope.topOption);

                        $scope.bottomOption.sensors = data.bottomRank;
                        if($scope.bottomOption.sensors.length > 0)
                            ThermalMap.create("#r1", $scope.bottomOption);
                    }
                    $scope.loading = false;
                });
            }
        }, 10000);
    };
    $scope.stop = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stop();
    });
    $scope.start();
    if($scope.MdcType != 0 || $scope.MdcType != 1){
        if($scope.topOption.sensors.length > 0)
            ThermalMap.create("#r2",$scope.topOption);
    }
    if($scope.bottomOption.sensors.length > 0)
        ThermalMap.create("#r1", $scope.bottomOption);
}]);

nurseController.controller('MDCPowerCtrl', ['$scope', '$http', '$interval','MdcAlarmService','diagramService','$rootScope','$compile','MdcConfigService',
    function($scope, $http, $interval,MdcAlarmService,diagramService,$rootScope,$compile,MdcConfigService){

        //$scope.MDCId = '100000001';
        $scope.powerData = {};
        var stop;

        //这个status是后台计算的结果。
        <!-- id：机柜编号  name：机柜名称  I:电流  V：电压  Pe：额定功率 -->
        $scope.MdcPowerInit = function(colNum,type) {
            //动态加载
            //var colNum = 32;
            var td = "";
            $("#mdc-power-tr1").children('td').remove();//清空所有的td
            $("#mdc-power-tr2").children('td').remove();//清空所有的td
            if(type == 0 || type == 1){
                $scope.MdcWidth = "width:"+(100/16*parseInt(colNum))+"%;";
                for(var i = 1;i <= colNum; i++){
                    td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\"></div><div class=\"cabinet-body normal {{sc('cabinet"+i+"')}}\"><div></div><img/></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-power-tr2").append($td);
                }
            }else{
                $scope.MdcWidth = "width:"+(100/16*(parseInt(colNum)/2))+"%;";
                for(var i = 1;i <= colNum; i++){
                    if(i <= colNum/2) {
                        td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\"></div><div class=\"cabinet-body normal {{sc('cabinet"+i+"')}}\"><div></div><img/></div></td>";
                        var $td = $compile(td)($scope);
                        $("#mdc-power-tr2").append($td);
                    }else {
                        td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title top\"></div><div class=\"cabinet-body normal {{sc('cabinet"+i+"')}}\"><div></div><img/></div></td>";
                        var $td = $compile(td)($scope);
                        $("#mdc-power-tr1").append($td);
                    }
                }
            }

            if(!$scope.MDCId) return;
            MdcAlarmService.getCabinetPowerInfo($scope.MDCId).then(function (data) {
                $scope.status = data;
                diagramService.updatePowerData($scope.MDCId, $scope.status).then(function (data) {
                    $scope.powerData = data;
                });
            });
        };

        //获取微模块机柜数
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcPowerInit(parseInt(item.cabinetNumber),item.type);
                }
            });
        });

        $rootScope.$on("MdcPowerInit",function(){
            MdcConfigService.GetMdcConfigInfo().then(function(data){
                data.forEach(function(item){
                    if(item.id == $scope.MDCId){
                        $scope.cabinetNumber = parseInt(item.cabinetNumber);
                        $scope.MdcPowerInit(parseInt(item.cabinetNumber),item.type);
                    }
                });
            });
        });

        $scope.start = function() {
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {
                if ($scope.status) {
                    diagramService.updatePowerData($scope.MDCId,$scope.status).then(function(data) {
                        $scope.powerData = data;
                    });
                }
                MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function(data){
                    $scope.updatePage(data);
                });
            }, 3000);
        };
        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$watch('powerData', function(newValue, oldValue, scope) {
            if($scope.status === undefined) return;
            $scope.status.forEach(function(item){
                var value = _.findWhere(scope.powerData, {
                    cabinetId: item.cabinetId
                });
                if(value != undefined)
                    item.power = value.power;
                var percentage = (parseFloat(item.power)/parseFloat(item.ratedPower))*100;
                setProgressBar(item.cabinetId,item.cabinetName,percentage.toFixed(0),item.cabinetType);
            });
        });


        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });
        $scope.start();

        function setProgressBar(progressId,name,percentage,cabinetType) {
            var cover = 100-percentage;
            $("." + progressId + " .cabinet-body > div").css("height", String(cover) + "%");
            if(percentage == 0) $("." + progressId + " .cabinet-body > div").html("");
            else $("." + progressId + " .cabinet-body > div").html(String(percentage) + "%");
            $("." + progressId + " .cabinet-body").addClass('gradient');
            $("." + progressId + " .cabinet-body > img").attr({src : getImgSrc(cabinetType),class: 'logoImg'});
            $("." + progressId + " .cabinet-title").html(name);
        }
        function getImgSrc(type){
            if(type === 'UPS')
                return "../img/mdc/ups.png";
            if(type === 'RACK')
                return "../img/mdc/rack.png";
            if(type === 'AC')
                return "../img/mdc/ac.png";
            if(type === 'UNUSE')
                return "../img/mdc/unuse.png";
            if(type === 'CELL')
                return "../img/mdc/cell.png";
            if(type === 'RECTIFIER')
                return "../img/mdc/rectifier.png";
            if(type === 'HVDC')
                return "../img/mdc/hvdc.png";
        }
        /** 加载机柜功率百分比 */
        $scope.sc = function(cabinetNo){
            var exist = false;
            if($scope.status){
                $scope.status.forEach(function(item){
                    if(item.cabinetId == cabinetNo){
                        var percentage = parseFloat(parseFloat(item.power)/parseFloat(item.ratedPower))*100;
                        if(item.cabinetName === "" || item.cabinetName === undefined || percentage === Infinity || isNaN(percentage))
                            percentage = 0;
                        setProgressBar(cabinetNo,item.cabinetName,percentage.toFixed(0),item.cabinetType);
                        exist = true;
                    }
                });
            }
            if(!exist){
                setProgressBar(cabinetNo,'',0,'');
                $("." + cabinetNo + " .cabinet-body > img").removeAttr('src');
                $("." + cabinetNo + " .cabinet-body > img").removeClass('logoImg');
            }
        };


        /* 更新图表数据 */
        $scope.updatePage = function (data) {
            if($scope.MDCPower){
                data.tags.mPue = $scope.MDCPower.tags.mPue;
                data.tags.itLoad = $scope.MDCPower.tags.itLoad;
                data.tags.totalPower = $scope.MDCPower.tags.totalPower;

                if (data.series.mPue && data.tags.mPue) {
                    data.tags.mPue.series[0].data = data.series.mPue.data;
                    var xAxis = [];
                    data.xAxis.mPue.data.forEach(function(item){
                        var index = item.indexOf("-");
                        if(index > 0)
                            xAxis.push(item.substring(index+1));
                    });
                    data.tags.mPue.xAxis[0].data = xAxis;
                }
                if (data.series.itLoad && data.tags.itLoad) {
                    data.tags.itLoad.series[0].data = data.series.itLoad.data;
                }
                if (data.series.totalPower && data.tags.totalPower) {
                    var per = data.series.totalPower.data[0].value / data.maxPower;
                    data.tags.totalPower.series[0].axisLine.lineStyle.color[0][0] = per;
                    data.tags.totalPower.series[0].data = data.series.totalPower.data;
                    data.tags.totalPower.series[0].data[0].value = per;
                }
            }
            $scope.MDCPower = data;
            if (mPue && itLoad && totalPower && data.tags && data.tags.mPue && data.tags.itLoad && data.tags.totalPower) {
                mPue.setOption(data.tags.mPue, true);
                itLoad.setOption(data.tags.itLoad, true);
                totalPower.setOption(data.tags.totalPower, true);
            }
        };

        $(function(){
            $scope.MDCPower = {};
            $scope.MDCPower.tags = {};
            $scope.MDCPower.tags.mPue = undefined;
            $scope.MDCPower.tags.itLoad = undefined;
            $scope.MDCPower.tags.totalPower = undefined;
            if(!$scope.MDCId) return;
            init();
            MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function(data){
                $scope.updatePage(data);
            });
        });

        //淡入淡出
        $scope.cabinetMouseenter = function(){
            $(".device"+" > td > div.cabinet-title").fadeIn(2000);
        };
        $scope.cabinetMouseleave = function(){
            $(".device"+" > td > div.cabinet-title").fadeOut(2000);
        };
        var mPue;
        var itLoad;
        var totalPower;
        function init(){
            /** 历史mPUE */
            mPue = echarts.init($("#mPue")[0]);
            var optionMPue =  {
                color:["#5246AC"],
                backgroundColor:"#1F2A3C",
                grid:{
                    x:150,
                    y:20,
                    x2:20,
                    y2:30,
                    borderWidth:0
                },
                tooltip : {
                    trigger: 'axis'
                },
                calculable : false,
                xAxis : [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: {
                                fontSize: 14,
                                color: '#fff'
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        type : 'category',
                        boundaryGap : false,
                        data : ['1-1','1-2','1-3','1-4','1-5']
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel: {
                            show: true,
                            textStyle: {
                                fontSize: 14,
                                color: '#fff'
                            }
                        },
                        min:1,
                        max:1.5,
                        splitLine: {
                            show: false
                        }
                    }
                ],
                series : [
                    {
                        name:'mPUE',
                        type:'line',
                        itemStyle: {normal: {areaStyle: {type: 'default'}}},
                        data:[1.2,2.3,0.8,0.5,1.5]
                    }
                ]
            };
            mPue.setOption(optionMPue,true);
            if($scope.MDCPower) {
                $scope.MDCPower.tags.mPue = optionMPue;
            }
            /* IT负载 */
            itLoad = echarts.init($("#itLoad")[0]);
            var itLoadOption = {
                color:['#9D22CA', '#126DC6'],
                tooltip : {
                    trigger: 'item',
                    formatter: "{b} : {c} kW({d}%)"
                },
                series : [
                    {
                        type:'pie',
                        radius : ['50%', '70%'],
                        itemStyle : {
                            normal : {
                                label : {
                                    show : false
                                },
                                labelLine : {
                                    show : false
                                }
                            },
                            emphasis : {
                                label : {
                                    show : true,
                                    position : 'center',
                                    textStyle : {
                                        fontSize : '20',
                                        fontWeight : 'bold'
                                    }
                                }
                            }
                        },
                        data:[
                            {value:255, name:'其他耗能'},
                            {value:310, name:'IT负载'}
                        ]
                    }
                ]
            };
            itLoad.setOption(itLoadOption,true);
            if($scope.MDCPower) {
                $scope.MDCPower.tags.itLoad = itLoadOption;
            }
            /* 总功率 */
            totalPower = echarts.init($("#totalPower")[0]);
            var totalPowerOption = {
                "toolbox": {
                    "show": false,
                    "feature": {
                        "mark": {
                            "show": true
                        },
                        "restore": {
                            "show": true
                        },
                        "saveAsImage": {
                            "show": true
                        }
                    }
                },
                "series": [{
                    "name": "指标",
                    "type": "gauge",
                    "startAngle": 180, //总的360，设置180就是半圆
                    "endAngle": 0,
                    "max":1,
                    "center": ["70%", "70%"], //整体的位置设置
                    "radius": 110,
                    "axisLine": {
                        "lineStyle": {
                            "width": 16, //柱子的宽度
                            "color": [[0.46, "#2d99e2"], [1, "#dce3ec"]] //0.298是百分比的比例值（小数），还有对应两个颜色值
                        }
                    },
                    "axisTick": {
                        "show": false
                    },
                    "axisLabel": {
                        "show": false
                    },
                    "splitLine": {
                        "show": false
                    },
                    "pointer": {
                        "width": 8, //指针的宽度
                        "length": "80%", //指针长度，按照半圆半径的百分比
                        "color": "#2d99e2"
                    },
                    "title": {
                        "show": true,
                        "offsetCenter": [0, "25%"], //标题位置设置
                        "textStyle": { //标题样式设置
                            "color": "#FFFFFF",
                            "fontSize": 20,
                            "fontFamily": "微软雅黑",
                            "fontWeight": "bold"
                        }
                    },
                    "detail": {
                        "show": false
                    },
                    "data": [{ //显示数据
                        "value": 230,
                        "name": "功率 230W"
                    }]
                }]
            };
            totalPower.setOption(totalPowerOption, true);
            if ($scope.MDCPower) {
                $scope.MDCPower.tags.totalPower = totalPowerOption;
            }
        }
    }]);

nurseController.controller('TemperatureCtrl',['$scope','$modal','MdcAlarmService','diagramService','$interval','$rootScope','$compile','MdcConfigService',
    function($scope,$modal,MdcAlarmService,diagramService,$interval,$rootScope,$compile,MdcConfigService){
        var stop;
        $scope.temps = {};
        $scope.temps.count = 16;
        //$scope.MDCId = '100000001';
        $scope.MdcTemperatureInit = function(colNum,type) {
            //动态加载
            //var colNum = 32;
            var td = "";
            $("#temperature-tr1").children('td').remove();//清空所有的td
            $("#temperature-tr2").children('td').remove();//清空所有的td
            if(type == 0 || type == 1){
                $scope.MdcWidth = "width:"+(100/16*parseInt(colNum))+"%;";
                for(var i = 1;i <= colNum; i++){
                    td = "<td class=\"cabinet"+i+"\"><div class=\"cabinet-title top\"></div><div class=\"cabinet-body\" ><span class=\"temp1\">{{temp('"+i+"','3')}}</span><span class=\"temp2\">{{temp('"+i+"','2')}}</span><span class=\"temp3\">{{temp('"+i+"','1')}}</span></div></td>";
                    var $td = $compile(td)($scope);
                    $("#temperature-tr1").append($td);
                }
            }else{
                $scope.MdcWidth = "width:"+(100/16*(parseInt(colNum)/2))+"%;";
                for(var i = 1;i <= colNum; i++){
                    td = "<td class=\"cabinet"+i+"\"><div class=\"cabinet-title top\"></div><div class=\"cabinet-body\" ><span class=\"temp1\">{{temp('"+i+"','3')}}</span><span class=\"temp2\">{{temp('"+i+"','2')}}</span><span class=\"temp3\">{{temp('"+i+"','1')}}</span></div></td>";
                    var $td = $compile(td)($scope);
                    if(i <= colNum/2)
                        $("#temperature-tr2").append($td);
                    else
                        $("#temperature-tr1").append($td);
                }
            }

            if(!$scope.MDCId) return;
            MdcAlarmService.GetTemperature($scope.MDCId).then(function (data) {
                $scope.temps.lists = data;
                diagramService.UpdateTemperature(data).then(function (data) {
                    $scope.temps.lists = data;
                });
            });
        };

        //获取微模块机柜数
        MdcConfigService.GetMdcConfigInfo().then(function(data){
            data.forEach(function(item){
                if(item.id == $scope.MDCId){
                    $scope.cabinetNumber = parseInt(item.cabinetNumber);
                    $scope.MdcTemperatureInit(parseInt(item.cabinetNumber),item.type);
                }
            });
        });

        $rootScope.$on("MdcTemperatureInit",function(){
            MdcConfigService.GetMdcConfigInfo().then(function(data){
                data.forEach(function(item){
                    if(item.id == $scope.MDCId){
                        $scope.cabinetNumber = parseInt(item.cabinetNumber);
                        $scope.MdcTemperatureInit(parseInt(item.cabinetNumber),item.type);
                    }
                });
            });
        });

        $scope.temp = function(id,index){
            var v = "";
            if($scope.temps.lists){
                $scope.temps.lists.forEach(function(list){
                    var str = list.temps.slideName.split("-");
                    var num = parseInt(str[0].replace(/[^0-9]/ig,""));
                    if(id == num){
                        if(str[1] == index){
                            v = list.temps.val+"℃";
                            return v;
                        }
                    }
                });
            }
            return v;
        };

        $scope.start = function() {
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {
                if ($scope.temps.lists) {
                    diagramService.UpdateTemperature($scope.temps.lists).then(function(data){
                        $scope.temps.lists = data;
                    });
                }
            }, 3000);
        };
        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });
        $scope.start();
    }
]);


nurseController.controller('MDCOverviewCtrl', ['$scope',  '$interval', '$modal','MdcAlarmService','alarmService','activeSignalService','CameraService','balert','activeDeviceService','MdcConfigService','employeeService',
    function($scope, $interval, $modal, MdcAlarmService, alarmService, activeSignalService,CameraService,balert,activeDeviceService,MdcConfigService,employeeService){

    var remarkDialog, deviceInfoDialog;
    $scope.mdc = {};

    var rulerCalc = {
        color2rgb:function(color)
        {
            var r = parseInt(color.substr(1, 2), 16);
            var g = parseInt(color.substr(3, 2), 16);
            var b = parseInt(color.substr(5, 2), 16);
            return new Array(r, g, b);
        },
        rgb2color:function (rgb)
        {
            var s = "#";
            for (var i = 0; i < 3; i++)
            {
                var c = Math.round(rgb[i]).toString(16);
                if (c.length == 1)
                    c = '0' + c;
                    s += c;
            }
            return s.toUpperCase();
        },
        getHeatMapColor: function(value)
        {
            var resultColor = [];
            var color = [ [0,0,1], [0,1,0], [1,1,0], [1,0,0] ];
        
            var idx1;        // |-- Our desired color will be between these two indexes in "color".
            var idx2;        // |
            var fractBetween = 0;  // Fraction between "idx1" and "idx2" where our value is.
        
            if(value <= 0)      {  idx1 = idx2 = 0; }    // accounts for an input <=0
            else if(value >= 1)  {  idx1 = idx2 = 3; }    // accounts for an input >=0
            else
            {
                value = value * 3;                      // Will multiply value by 3.
                idx1  = Math.floor(value);                  // Our desired color will be after this index.
                idx2  = idx1+1;                        // ... and before this index (inclusive).
                fractBetween = value - idx1;    // Distance between the two indexes (0-1).
            }

            resultColor.push(((color[idx2][2] - color[idx1][2])*fractBetween + color[idx1][2]) * 255);//blue
            resultColor.push(((color[idx2][1] - color[idx1][1])*fractBetween + color[idx1][1]) * 255);//green
            resultColor.push(((color[idx2][0] - color[idx1][0])*fractBetween + color[idx1][0]) * 255);//red

        return resultColor
    },
    gradient: function(fromValue,toValue,step)
    {
        var colorDictionary = [];
        var valStep = (toValue - fromValue) / step;

        for (var N = 0; N <= step; N++)
        {
            var colorItem = {};
            colorItem.value = fromValue + valStep * N;
            colorItem.color = this.rgb2color(this.getHeatMapColor(N/step));
            colorDictionary.push(colorItem);
        }

        return colorDictionary;     
    }
    };

    //get correct color
    $scope.colorDic = rulerCalc.gradient(38,18,20);

    employeeService.getAllEmployees().then(function(data){
        $scope.employees = data;
    });

    function initLoad(){
        $scope.partmount = function(){$scope.mdc.effect.partmount();};
        $scope.smoking = function(){ $scope.mdc.effect.smoking(24); };
        $scope.redalert = function(){ $scope.mdc.effect.invading(); };
        $scope.leaking = function(){
            $scope.mdc.effect.waterLeakingA(24);
            $scope.mdc.effect.waterLeakingB(24);
        };
        $scope.openceiling = function(){ $scope.mdc.effect.skyLightfalling(true); };
        $scope.opendoor = function(){ $scope.mdc.effect.dooropening(); };
        $scope.rackAlarm = function(){ $scope.mdc.effect.shining(); };
        $scope.cruising = function(){ $scope.mdc.effect.cruising(); };
        $scope.stagePower = function(){
            $("#tempIndicator").hide();
            $scope.mdc.stage.switch('power');
            $scope.currentStage = "power";
        };
        $scope.stageSpace = function(){
            $("#tempIndicator").hide();
            $scope.mdc.stage.switch('space');
            $scope.currentStage = "space";
        };
        $scope.stageThermal = function(){
            $("#tempIndicator").show();
            $scope.mdc.stage.switch('thermal');
            $scope.currentStage = "thermal";
        };
        $scope.stageMonitor = function(){
            $("#tempIndicator").hide();
            $scope.mdc.stage.switch('monitor');
            $scope.currentStage = "monitor";
        };
    }

    MdcConfigService.GetMdcConfigInfo().then(function(data){
        var mdcInfo = data[0];
        MdcAlarmService.getCabinetList(mdcInfo.id).then(function(cabinets){
            var option = parseOption(mdcInfo,cabinets);
            $scope.mdc = MDC.create("mdc1",option);
            initLoad();
            BindMouseClick();
            $scope.stageMonitor();
        });
    });

    function parseOption(mdcInfo,cabinets){
        var option = {
            name : mdcInfo.name,
            number : mdcInfo.cabinetNumber,
            type : mdcInfo.type,
            rowRacks : []
        };
        if(cabinets){
            cabinets.forEach(function(item){
                var obj = {
                    site : getNumber(item.cabinetId),
                    name : item.cabinetName,
                    type : item.cabinetType,
                    side : item.side
                };
                option.rowRacks.push(obj);
            });
        }
        return option;
    }

    function getNumber(name){
        var str = name.replace(/[^0-9]/ig, "");
        return str;
    }


    var $modalScope = $scope.$new(false);

    $modalScope.ok = function (){
        this.$hide();
    };
    var setDlg;

    function BindMouseClick(){
        $scope.mdc.event.onMouseClick = function(part) {
            //视频监控
            if(part.category == "camera"){
                var cameraId = 0;
                if(part.id == "camera1") cameraId = 3;
                if(part.id == "camera2") cameraId = 4;
                setDlg = $modal({
                    scope: $scope,
                    templateUrl: 'partials/cameradialog.html',
                    show: false
                });
                $scope.cameraId = cameraId;
                setDlg.$promise.then(setDlg.show);
                preview(cameraId);
                JudgeBrowser();
                return;
            }

            if(part.info === undefined) return;

            $modalScope.part = part;
            $modalScope.servers = [];
            $modalScope.deviceActiveSignals = [];
            $modalScope.cabinet = {};
            $modalScope.cabinetTopTemperature = "--";//机柜150cm高温度(℃)
            $modalScope.cabinetMiddleTemperature = "--";//机柜100cm高温度(℃)
            $modalScope.cabinetBottomTemperature = "--";//机柜50cm高温度(℃)
            $modalScope.rackTotalUHeight = parseInt($scope.rackTotalUHeight);
            $modalScope.rackDomTotalHeight = 724;//机柜DOM的像素高度
            $modalScope.panelTitle = "";
            $modalScope.activeDevice = {};

            $modalScope.getStatusLabel = function (status) {
                if (status == 255)
                    return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Normal;//"正常"
                else if(status == -255)
                    return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Disconnect;//"已中断"
                else if(parseInt(status) >= 0 && parseInt(status) <= 3)
                    return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Alarm;//"告警"
                else
                    return $scope.languageJson.RoomHome.AlarmTitle.DataTable.Loading;//"加载中"
                /*if (status == 255)
                    return "正常";
                else if (status == -255)
                    return "已中断";
                else
                    return "告警";*/
            };

            //$modalScope.getStatusTextClass = function (status) {
            //    if (status == 255)
            //        return "text-success";
            //    else if (status == -255)
            //        return "text-muted";
            //    else
            //        return "text-danger";
            //};

            $modalScope.getStatusIconClass = function (status) {
                if (status == 255)
                    return "fa fa-check";
                else if (status == -255)
                    return "fa fa-times";
                else
                    return "fa fa-bell fa-fw alarmLevel" + status;
            };


            $modalScope.selectDevice = function(device) {
                $modalScope.deviceActiveSignals = [];
                getActiveSignalsByDeviceId(device.id);
                $modalScope.panelTitle = device.name;
                $modalScope.selectedId = device.id;
            };


            getCabinetActiveTemps(part.id);
            $modalScope.partId = part.id;

            deviceInfoDialog = $modal({
                scope: $modalScope,
                templateUrl: '/partials/mdcdeviceinfo.html',
                show: false
            });
            deviceInfoDialog.$promise.then(function() {
                deviceInfoDialog.show();
                if ($modalScope.cabinet.devices && $modalScope.cabinet.devices.length > 0) {
                    $modalScope.selectDevice($modalScope.cabinet.devices[0]);
                }else
                    $modalScope.deviceActiveSignals = [];

                if(part.info && part.info.type == "RACK"){
                    $("#div1").show();
                    //设备信号列表
                    $("#div2").css("max-height","315px");
                }

                if(part.info && part.info.id){
                    var cid = part.info.id.replace(/[^0-9]/ig,'');
                    $scope.CabinetAsset = {};
                    MdcConfigService.GetCabinetAssetInfo(cid,$scope.MDCId).then(function(data){
                        if(data){
                            $scope.CabinetAsset = data;
                            $scope.employees.forEach(function(item){
                                if(item.EmployeeId == data.employeeId)
                                    $scope.CabinetAsset.employeeName = item.EmployeeName+"("+item.Mobile+")";
                            });
                        }
                    });
                }
            });
        };
    }

    $scope.hideDivClick = function(id,$event){
        var event = $($event.target).children("i");
        var dom = $('#'+id);
        var dis = dom.css('display');
        if(dis == 'block'){
            dom.hide();
            event.removeClass("fa-chevron-down");
            event.addClass("fa-chevron-right");
            //设备信号列表
            $("#div2").css("max-height","690px");
        }else{
            dom.show();
            event.removeClass("fa-chevron-right");
            event.addClass("fa-chevron-down");
            //设备信号列表
            $("#div2").css("max-height","315px");
        }
    };

    $scope.beginEndAlarm = function(uniqueId) {
        $scope.selectedAlarmUniqueId = uniqueId;

        remarkDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/alarmRemarkDialog.html',
            show: false
        });

        remarkDialog.$promise.then(function () {
            remarkDialog.show();
            //以下代码为了解决文本框失去焦点的问题
            setTimeout(function () {
                //remarkDialog.$element[0].children[0].children[0].children[1].children[0].focus();
                //angular.element(document).find("textarea").focus();
                angular.element("textarea").focus();
            }, 100);
        });

    };

    $scope.endEndAlarm = function(note) {

        var logonId = localStorage.getItem("username");
        var param = "'" + $scope.selectedAlarmUniqueId + "'|" + logonId + "|" + note;

        alarmService.endAlarm(param).then(function() {
            remarkDialog.hide();
        });
    };

    $scope.MDCPower = {};
    $scope.MDCAlarm = {};
    $scope.MDCCabinets = {};

    //获取设备的实时信号值
    function getActiveSignalsByDeviceId(deviceId){
        activeSignalService.getActiveSignalByDevice(deviceId).then(function (data) {

            activeDeviceService.getActiveDevices().then(function (devices) {
                var dev = undefined;
                devices.forEach(function (item) {
                    if(item.id == deviceId)
                        dev = item;
                });

                if(dev == undefined) return;

                if (dev.status === "Alarm") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Alarm;//"告警中";
                if (dev.status === "Normal") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Normal;//"正常运行";
                if (dev.status === "Disconnect") dev.info = $scope.languageJson.RoomHome.AlarmTitle.DataTable.Disconnect;//"已中断";

                dev.colorClass = function () {
                    if (dev.status === "Alarm") return "text-danger";
                    if (dev.status === "Normal") return "text-success";
                    if (dev.status === "Disconnect") return "text-muted";
                };

                dev.iconClass = function () {
                    if (dev.status === "Alarm") return "fa fa-bell";
                    if (dev.status === "Normal") return "fa fa-check";
                    if (dev.status === "Disconnect") return "fa fa-times";
                };

                $modalScope.activeDevice = dev;

                if ($modalScope.activeDevice.status != undefined && $modalScope.activeDevice.status == "Disconnect") {//设备状态为中断时，所有的信号状态都为中断
                    data.forEach(function (item) {
                        item.alarmSeverity = -255;
                    });
                }

                $modalScope.deviceActiveSignals = data;
            });
        });
    }

    //获取机柜的实时温度
    function getCabinetActiveTemps(partId){
        if($scope.MDCCabinets){
            $scope.MDCCabinets.forEach(function (item) {
                if (item.id == partId) {
                    var tmpSensorsArray = _.sortBy(item.tempSensors, 'y');
                    if (tmpSensorsArray.length > 0) {
                        tmpSensorsArray.forEach(function(tmp){
                            if(tmp.val >= 0 && tmp.val <= 1){
                                if(tmp.y >= 150){
                                    $modalScope.cabinetTopTemperature = (1 - tmp.val) * 20 + 18;//机柜150cm高温度(℃)
                                }else if(tmp.y >= 100){
                                    $modalScope.cabinetMiddleTemperature = (1 - tmp.val) * 20 + 18;//机柜100cm高温度(℃)
                                }else{
                                    $modalScope.cabinetBottomTemperature = (1 - tmp.val) * 20 + 18;//机柜50cm高温度(℃)
                                }
                            }
                        });
                    }
                    //uPixelHeight代表1U在界面上显示多少像素的高度
                    var uPixelHeight = parseFloat($modalScope.rackDomTotalHeight / $modalScope.rackTotalUHeight);
                    var tmpDeviceArray = _.sortBy(item.devices, 'uIndex');
                    //对于U高为0的设备，在机柜弹出框中不显示
                    tmpDeviceArray = _.filter(tmpDeviceArray, function (tmpDevice) {
                        return tmpDevice.uHigh > 0;
                    });
                    for (var i = 0; i < tmpDeviceArray.length; i++) {
                        tmpDeviceArray[i].divHeight = tmpDeviceArray[i].uHigh * uPixelHeight;
                        if (i == 0) {
                            tmpDeviceArray[i].divMarginTop = ($modalScope.rackTotalUHeight - tmpDeviceArray[i].uIndex - tmpDeviceArray[i].uHigh) * uPixelHeight;
                        } else {
                            tmpDeviceArray[i].divMarginTop = (tmpDeviceArray[i - 1].uIndex - tmpDeviceArray[i].uHigh - tmpDeviceArray[i].uIndex) * uPixelHeight;
                        }
                    }
                    item.devices = tmpDeviceArray;
                    $modalScope.cabinet = item;
                }
            });
        }
    }

    var stop;
    $scope.start = function() {
        if (angular.isDefined(stop)) return;

        MdcConfigService.GetMdcConfigInfo().then(function(data){
            if(data.length > 0){
                $scope.rackTotalUHeight = data[0].cabinetUHeight;//机柜高度
                $scope.rackCabinetNumber = data[0].cabinetNumber;//机柜数
                if(sessionStorage.getItem("MdcId") == undefined || $scope.MDCId == undefined){
                    sessionStorage.setItem("MdcId",data[0].id);
                    $scope.MDCId = data[0].id;
                }
            }
        });

        stop = $interval(function() {
            MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function (data) {
                data.eLoad = parseFloat(data.eLoad).toFixed(1);
                $scope.MDCPower = data;
            });
            alarmService.updateActiveAlarmList().then(function (data) {
                //get the latest 5 alarms
                $scope.MDCAlarm = data.slice(0, 5);
            });
            MdcAlarmService.GetMDCAlarmInfo($scope.MDCId).then(function (data) {
                $scope.MDCCabinets = data.cabinets;
                if ($scope.mdc) $scope.mdc.updateData(data);
            });

            if(deviceInfoDialog != undefined && deviceInfoDialog.$isShown == true){//机柜弹出框显示
                if($modalScope.selectedId != undefined){//设备实时值
                    getActiveSignalsByDeviceId($modalScope.selectedId);
                }
                if($scope.MDCCabinets != undefined && $modalScope.partId != undefined){
                    getCabinetActiveTemps($modalScope.partId);
                }
            }
        }, 5000);
    };
    $scope.stop = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stop();
        if ($scope.mdc) $scope.mdc.dispose();
    });
    $scope.start();

    CameraService.loadVideoEquipment().then(function(data){
        if(data === "]" || data === undefined) return;
        $scope.camera = eval(data);
    });
    function preview(cameraId){
        $scope.camera.forEach(function(item){
            if(cameraId == item.EquipmentId){
                $scope.src="partials/camerapreview.html?ip="+item.IpAddress
                    +"&port="+item.Port+"&user="+item.UserName+"&pwd="+item.UserPwd+"&channo="+item.ChanNum;
            }
        });
    }
    function JudgeBrowser(){
        var NV = {};
        var UA =  navigator.userAgent.toLowerCase();
        NV.name = (UA.indexOf("chrome")>0)?'chrome':'unkonw';
        NV.version = (NV.name=='chrome')?UA.match(/chrome\/([\d.]+)/)[1]:'0';
        var isIe = "ActiveXObject" in window;
        if(isIe) return;//IE
        NV.bit = (UA.indexOf("x64")>0)?64:32;
        if(NV.name === 'chrome' && parseInt(NV.version) <= 42) return;//64bit chrome v34
        balert.show('danger',$scope.languageJson.Videos.Browsing,3000);/*"视频浏览不支持当前浏览器或版本，请使用IE或者Chrome v42以下的浏览器！"*/
    }
    var addVideoDialog = $modal({
        scope:$scope,
        templateUrl:'partials/addVideo.html',
        show:false
    });
    $scope.video = {};
    $scope.cameraClick = function(){
        setDlg.hide();
        $scope.camera.forEach(function(item){
            if($scope.cameraId == item.EquipmentId){
                $scope.video.eId = item.EquipmentId;
                $scope.video.eName = item.EquipmentName;
                $scope.video.videoType = 1;
                $scope.video.ipAddress = item.IpAddress;
                $scope.video.ePort = item.Port;
                $scope.video.eChanNum = item.ChanNum;
                $scope.video.userName = item.UserName;
                $scope.video.userPwd = item.UserPwd;
                $scope.video.Number = 1;
                $scope.video.IpOrNvr = true;
            }
        });
        addVideoDialog.$promise.then(addVideoDialog.show);
    };
    $scope.clickInput = function ($event) {
        setTimeout(function () {
            $($event.target).focus();
        }, 100);
    };
    //update data
    $scope.addVideoClick = function(){
        if($scope.video.eName == "" || $scope.video.eName == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Name,3000);/*请输入视频设备名称！*/
            return;
        }
        if($scope.video.ipAddress == "" || $scope.video.ipAddress == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Address,3000);/*请输入视频设备地址！*/
            return;
        }
        if($scope.video.ePort == "" || $scope.video.ePort == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Port,3000);/*请输入视频设备端口号！*/
            return;
        }
        if($scope.video.eChanNum == "" || $scope.video.eChanNum == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Channel,3000);/*请输入视频设备频道号！*/
            return;
        }
        if($scope.video.userName == "" || $scope.video.userName == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.User,3000);/*请输入用户名！*/
            return;
        }
        if($scope.video.userPwd == "" || $scope.video.userPwd == undefined){
            balert.show('danger',$scope.languageJson.MDC.Starting.Password,3000);/*请输入密码！*/
            return;
        }
        CameraService.updateVideoEquipment($scope.video.eId,$scope.video.eName,$scope.video.videoType,$scope.video.ipAddress,
            $scope.video.ePort,$scope.video.eChanNum,$scope.video.userName,$scope.video.userPwd).then(function(data){
            var cameraArr = undefined;
            $scope.camera.forEach(function(item){
                if(item.EquipmentId == $scope.video.eId)
                    cameraArr = item.Cameras;
            });
            var result = (cameraArr.length-$scope.video.Number);
            if(result>0){//删除监控点
                var index = cameraArr.length-1;
                for(var i=0;i<result;i++){
                    CameraService.deleteCamera(cameraArr[index].CameraId).then(function(data){});
                    index --;
                }
            }else if(result<0){//新增监控点
                for(var i=cameraArr.length;i<$scope.video.Number;i++){
                    var name = "Camera"+(i+1);
                    var charNum = i+1;
                    CameraService.saveCamera($scope.video.eId,name,charNum).then(function(data){});
                }
            }

            if(data=="OK"){
                balert.show('success',$scope.languageJson.MDC.Starting.Successfully,3000);//danger || success '修改成功！'
                addVideoDialog.hide();
                //查询新的数据存储
                CameraService.loadVideoEquipment().then(function(data){
                    if(data === "]" || data === undefined) return;
                    $scope.camera = eval(data);
                });
            }
            else
                balert.show('danger',$scope.languageJson.MDC.Starting.Fail,3000);//danger || success data
        });
    };
    //setTimeout(function(){
    //    $scope.stageMonitor();
    //    $scope.mdc.updateData(demoresponse);
    //}, 1000);
    //
    //setTimeout(function(){
    //    $scope.mdc.updateData(demoresponse1);
    //}, 5000);
}]);

nurseController.controller('MDCPUECtrl', ['$scope',  '$interval','MdcAlarmService',
    function($scope, $interval ,MdcAlarmService){
     
    Highcharts.setOptions({
        timezoneOffset: -8
    });

    $scope.chartData = {
        credits: {
            enabled: false
        },
        title: {
            text: '',
            style: {display: 'none'}
        },
        subtitle: {
            text: '',
            style: {display: 'none'}
        },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    millisecond: '%H:%M:%S.%L',
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%m-%d',
                    week: '%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                lineWidth: 0,
                minorGridLineWidth: 0
            },
            tooltip: {
                dateTimeLabelFormats: {
                    millisecond: '%H:%M:%S.%L',
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%Y-%m-%d',
                    week: '%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                }
            },
            yAxis: {
                title: {
                    text: ''
                }, 
                style: {display: 'none'},
                gridLineColor: 'transparent'
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series: [{
                type: 'area',
                name: '历史mPUE',
                data: [
                    [Date.UTC(2017,5,2),1.16],
                    [Date.UTC(2017,5,3),1.26],
                    [Date.UTC(2017,5,4),1.32],
                    [Date.UTC(2017,5,5),1.51],
                    [Date.UTC(2017,5,6),1.32],
                    [Date.UTC(2017,5,7),1.41],
                    [Date.UTC(2017,5,8),1.29],
                    [Date.UTC(2017,5,9),1.30],
                    [Date.UTC(2017,5,10),1.41],
                    [Date.UTC(2017,5,11),1.31]
                ]
            }]
        };
    //$scope.chartPUE.redraw();

    if($scope.MDCId)
    MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function(data){
        updatePage(data);
    });
    var stop;
    $scope.start = function() {
        if (angular.isDefined(stop)) return;
        stop = $interval(function() {
            if($scope.MDCId == undefined) return;
            MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function(data){
                updatePage(data);
            });
        }, 5000);
    };
    $scope.stop = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stop();
    });
    $scope.start();

    var updatePage = function(data){
        var options = [];
        var series = data.series.mPue.data;
        var xAxis = data.xAxis.mPue.data;
        for(var i = 0;i < series.length;i++){
            var obj = [];
            obj[0] = Date.parse(new Date(xAxis[i]));
            obj[1] = parseFloat(series[i]);
            options.push(obj);
        }
        $scope.chartData.series[0].data = options;
    };
}]);

nurseController.controller('MDCITLoadCtrl', ['$scope',  '$interval', 'MdcAlarmService',
    function($scope, $interval ,MdcAlarmService){

    if($scope.MDCId)
    MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function(data){
        $scope.itLoad = data.eLoad;
    });

    var stop;
    $scope.start = function() {
        if (angular.isDefined(stop)) return;
        stop = $interval(function() {
            if($scope.MDCId == undefined) return;
            MdcAlarmService.getPowerKpiDetail($scope.MDCId).then(function(data){
                $scope.itLoad = data.eLoad;
            });
        }, 5000);
    };
    $scope.stop = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stop();
    });
    $scope.start();
}]);

nurseController.controller('DoorConfigCtrl',['$scope','$interval','DoorService','$modal','TimeGroupService','balert','CardService','employeeService','$filter','TemplateService','bconfirm',
    function($scope,$interval,DoorService,$modal,TimeGroupService,balert,CardService,employeeService,$filter,TemplateService,bconfirm){
        var DoorManageDialog,ControlDoorDialog,AddCardDialog,
            CardSetterDialog;

        $scope.SpeedDoorCard = {
            endTime : "2099-01-01",
            description : "",
            doorList : []
        };

        $scope.DoorManage = {
            doorList: [],
            door:[],
            timeGroup:[],
            timeGroupSpan:[],
            activeControl:{}
        };
        $scope.CardManage = {
            cardList : [],
            addCard : {},
            updCard : {}
        };
        $scope.DoorCardManage={
            doorCardList:[],
            addDoorCard:{},
            updateTime:{}
        };
        $scope.DataManage = {
            DataItem : {}
        };
        $scope.checks = [
            {id:"0"},{id:"1"},{id:"2"},{id:"3"},{id:"4"},{id:"5"},
            {id:"6"},{id:"7"},{id:"8"},{id:"9"},{id:"10"},{id:"11"},
            {id:"12"},{id:"13"},{id:"14"},{id:"15"},{id:"16"},{id:"17"},
            {id:"18"},{id:"19"},{id:"20"},{id:"21"},{id:"22"},{id:"23"}
        ];
        $scope.Infrareds={};

        (function() {
            $scope.paginationCard = {
                currentPage: 1,
                itemsPerPage: 10,
                pagesLength: 10,
                totalItems: 0,
                cardList: [],
                parameter: "0||0",
                perPageOptions: [10, 20, 30, 40, 50],
                onChange: function(){
                }
            };
            $scope.paginationDoorCard = {
                currentPage: 1,
                itemsPerPage: 10,
                pagesLength: 10,
                totalItems: 0,
                doorCardList: [],
                parameter: "0|0|9999-01-01||||",
                perPageOptions: [10, 20, 30, 40, 50],
                onChange: function(){
                }
            };

            DoorService.getGetDoorListByDoorName("").then(function(data){
                $scope.DoorManage.doorList = data;
            });
            CardService.getCardDataItem().then(function(data){
                $scope.CardManage.cardDataItem = addFirstDataItem(data);
            });
            CardService.getCardDataItem().then(function(data){
                $scope.CardManage.addCard.cardDataItem = data;

                $scope.SpeedDoorCard.cardCategory = data.CardCategory[0].ItemId;
            });
            employeeService.getAllEmployees().then(function(data){
                $scope.CardManage.addCard.employee = data;
            });
            TimeGroupService.getTimeGroupType().then(function(data){
                var di = {
                    timeGroupId : "0",
                    timeGroupName : $scope.languageJson.Card.SelectAll
                };/*"-- 全部 --"*/
                data.splice(0,0,di);
                $scope.DoorCardManage.TimeGroup = data;
            });
            TimeGroupService.getTimeGroupType().then(function(data){
                $scope.DoorCardManage.addDoorCard.TimeGroup = data;
                $scope.TimeGroupFilter = paramInitTimeGroup(data);
            });
            DoorService.getInfraredList().then(function(data) {
                $scope.ItemInfrareds = data;
            });

            //卡号类型
            TemplateService.GetDataItemByEntryId("200").then(function(data){
                $scope.CardTypes = data;
            });
            $scope.initSpeedAddDoorCard = function(){
                $scope.SpeedDoorCard = {
                    cardType : '1',
                    cardCode : '',
                    cardName : '',
                    userId : undefined,
                    cardCategory : '1',
                    timeGroup : '99999999',
                    openPassWord : '0000',
                    endTime : '2099-01-01',
                    description : ''
                };
                $scope.DoorManage.doorList.forEach(function(item){
                    item.isCheck = false;
                });
                $scope.isAllCheck = false;
            };
            $scope.initSpeedAddDoorCard();

            function paramInitTimeGroup(data){
                var arr = [];
                data.forEach(function(item){
                    if(item.timeGroupId == 99999999)
                        arr.push(item);
                });
                return arr;
            }

            //门控制类型集
            DoorService.GetDoorControls().then(function(data){
                $scope.DoorControls = data;
            });
        })();
        var addFirstDataItem = function(data){
            var item = data;
            var di = {
                ItemId : "0",
                ItemValue : $scope.languageJson.Card.SelectAll,
                ItemAlias : $scope.languageJson.Card.SelectAll
            };/*"-- 全部 --"*/
            item.CardCategory.splice(0,0,di);
            item.CardType.splice(0,0,di);

            return item;
        };
        /********************* start 快捷加卡 ***********************/

        $scope.checkedDoor = function($event){
            $scope.DoorManage.doorList.forEach(function(item){
                item.isCheck = $event.target.checked;
            });
        };
        $scope.getCheckbox = function(visible){
            if(visible == true || visible == 'true')
                return "√";
            else
                return "X";
        };

        $scope.checkedPwd = function($event){
            $scope.isShowPwd = $event.target.checked;
        };

        $scope.SpeedAddDoorCardClick = function(){
            if($scope.SpeedDoorCard.cardCode == "" || $scope.SpeedDoorCard.cardCode == undefined){
                balert.show('danger',$scope.languageJson.Access.TheCard,3000);/*'卡号不能为空！'*/
                return;
            }
            if($scope.SpeedDoorCard.cardName == "" || $scope.SpeedDoorCard.cardName == undefined){
                balert.show('danger',$scope.languageJson.Access.CardName,3000);/*'卡名称不能为空！'*/
                return;
            }
            if($scope.SpeedDoorCard.userId == "" || $scope.SpeedDoorCard.userId == undefined){
                balert.show('danger',$scope.languageJson.Access.Cardholders,3000);/*'持卡人不能为空！'*/
                return;
            }
            if($scope.SpeedDoorCard.endTime == "" || $scope.SpeedDoorCard.endTime == undefined){
                balert.show('danger',$scope.languageJson.Access.Effective,3000);/*'有效结束时间不能为空！'*/
                return;
            }
            var isCheck = false;
            $scope.SpeedDoorCard.doorList = [];
            $scope.DoorManage.doorList.forEach(function(item){
                if(item.isCheck){
                    isCheck = item.isCheck;
                    $scope.SpeedDoorCard.doorList.push(item);
                }
            });
            if(!isCheck){
                balert.show('danger',$scope.languageJson.Access.Controls,3000);/*'门禁设备不能为空！'*/
                return;
            }

            var endTime = $filter('date')($scope.SpeedDoorCard.endTime, 'yyyyMMdd');

            DoorService.speedAddDoorCard($scope.SpeedDoorCard,endTime).then(function(data){
                if(data == "SUCCEED") {
                    CardService.getLimitCard(($scope.paginationCard.currentPage - 1) * $scope.paginationCard.itemsPerPage,
                            $scope.paginationCard.itemsPerPage,$scope.paginationCard.parameter).then(function(data) {
                        $scope.paginationCard.cardList = fromCardList(data);

                        $scope.SpeedDoorCard.cardCode = "";
                        $scope.SpeedDoorCard.cardName = "";
                    });
                    balert.show('success', $scope.languageJson.Access.Waiting, 3000);/*'命令已下发，等待设备反馈！'*/
                }else
                    balert.show('danger',$scope.languageJson.Access.TheCommand+data,3000);/*'命令下发失败！原因：'*/
            });
        };

        //by函数接受一个成员名字符串做为参数
        var by = function(name){
            return function(o, p){
                var a, b;
                if (typeof o === "object" && typeof p === "object" && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return 0;
                    }
                    if (typeof a === typeof b) {
                        return a < b ? -1 : 1;
                    }
                    return typeof a < typeof b ? -1 : 1;
                }
            }
        };

        function fromCardList(data){
            if($scope.CardManage.cardDataItem){
                data.forEach(function(cs){
                    $scope.CardManage.cardDataItem.Users.forEach(function(cdu){
                        if(cs.userId == cdu.EmployeeId)
                            cs.userName = cdu.EmployeeName;
                    });
                    $scope.CardManage.cardDataItem.CardType.forEach(function(cdt){
                        if(cs.cardType == cdt.ItemId){
                            if($scope.languageJson.Language == 'English')
                                cs.cardTypeName = cdt.ItemAlias;
                            else
                                cs.cardTypeName = cdt.ItemValue;
                        }
                    });
                    $scope.CardManage.cardDataItem.CardCategory.forEach(function(cdc){
                        if(cs.cardCategory == cdc.ItemId){
                            if($scope.languageJson.Language == 'English')
                                cs.cardCategoryName = cdc.ItemAlias;
                            else
                                cs.cardCategoryName = cdc.ItemValue;
                        }
                    });
                    $scope.CardManage.cardDataItem.DoorCard.sort(by("doorId"));
                    $scope.CardManage.cardDataItem.DoorCard.forEach(function(cdd){
                        if(cs.cardId == cdd.cardId){
                            if(cs.doorList == undefined)
                                cs.doorList = cdd.doorId;
                            else
                                cs.doorList += "/"+cdd.doorId;
                        }
                    });
                });
            }
            return data;
        };

        $scope.cardCodeChange = function(){
            $scope.SpeedDoorCard.cardName = $scope.SpeedDoorCard.cardCode;
        };

        $scope.getCardCode = function(){
            if($scope.selectedEquipmentId == undefined || $scope.selectedEquipmentId == ''){
                balert.show('danger',$scope.languageJson.Access.Please,3000);/*'请选择门！'*/
                return;
            }
            DoorService.GetCardCode( $scope.selectedEquipmentId,'1001132001&1001305001').then(function(data) {
                if(data.indexOf("(") > -1)
                    $scope.SpeedDoorCard.cardCode = data.substring(0,data.indexOf("("));
                else
                    $scope.SpeedDoorCard.cardCode = data;
                $scope.cardCodeChange();
            });
        };

        $scope.filterTimeGroupByDoor = function(deviceId){
            var isBoth = false;
            if($scope.DoorManage.doorList){
                $scope.DoorManage.doorList.forEach(function(item){
                    //item.category 4:单门  5:多门
                    if(item.equipmentId == deviceId && item.category == 5)
                        isBoth = true;
                });
            }

            $scope.TimeGroupFilter = [];
            if(isBoth){//只留timeGroupId为99999999和[1-4]的时限组
                if($scope.DoorCardManage.addDoorCard.TimeGroup){
                    $scope.DoorCardManage.addDoorCard.TimeGroup.forEach(function(item){
                        if(item.timeGroupId == 99999999)
                            $scope.TimeGroupFilter.push(item);
                        if(item.timeGroupId >= 1 && item.timeGroupId <= 4)
                            $scope.TimeGroupFilter.push(item);
                    });
                }
            }else{
                $scope.TimeGroupFilter = $scope.DoorCardManage.addDoorCard.TimeGroup;
            }
        };
        /********************* end 快捷加卡 ***********************/

        /****************  门管理  ***************/
        $scope.selectDoorByNameClick = function(){
            if($scope.doorName == undefined) $scope.doorName = "";
            DoorService.getGetDoorListByDoorName($scope.doorName).then(function(data){
                $scope.DoorManage.doorList = data;
            });
        };

        $scope.selectDoorByIdClick = function(doorId){
            DoorManageDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/DoorManage.html',
                show: false
            });
            DoorManageDialog.$promise.then(DoorManageDialog.show);

            DoorService.getGetDoorByDoorId(doorId).then(function(data){
                $scope.DoorManage.door = data;
                $scope.DoorManage.door.passwords = data.password;
            });
        };

        $scope.checkTimeGroup = function($event,data){
            data.isCheck = $event.target.checked;
        };

        $scope.saveDoorManageClick = function(){
            if($scope.DoorManage.door.doorName == ""){
                balert.show('danger',$scope.languageJson.Access.Empty,3000);/*'门禁名称不能为空！'*/
                return;
            }
            if(isNaN($scope.DoorManage.door.password)){
                balert.show('danger',$scope.languageJson.Access.Access,3000);/*'门禁密码类型为数值'*/
                return;
            }
            /*if($scope.DoorManage.door.doorNo == ""){
                balert.show('danger','门编号不能为空',3000);
                return;
            }*/
            if($scope.DoorManage.door.password != $scope.DoorManage.door.passwords){
                balert.show('danger',$scope.languageJson.Access.Two,3000);/*'两次密码输入不相同'*/
                return;
            }
            /*if($scope.DoorManage.door.openDelay < 0 || $scope.DoorManage.door.openDelay > 255){
                balert.show('danger','门延时时间取值在0值255之间',3000);
                return;
            }*/
            if($scope.DoorManage.door.password == "") $scope.DoorManage.door.password = "0000";
            DoorService.updateDoor($scope.DoorManage.door).then(function(data){
                if(data == "SUCCEED"){
                    if($scope.doorName == undefined) $scope.doorName = "";
                    DoorService.getGetDoorListByDoorName($scope.doorName).then(function(data){
                        $scope.DoorManage.doorList = data;
                    });

                    balert.show('success',$scope.languageJson.Access.Modification,3000);/*'修改成功，等待设备反馈！'*/
                    DoorManageDialog.hide();
                }else
                    balert.show('danger',$scope.languageJson.Access.Edit,3000);/*'修改失败！'*/
            });
        };

        $scope.controlDoorClick = function(data){
            ControlDoorDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/controlDoor.html',
                show: false
            });
            ControlDoorDialog.$promise.then(ControlDoorDialog.show);
            $scope.DoorManage.activeControl.stationId = data.stationId;
            $scope.DoorManage.activeControl.equipmentId = data.equipmentId;
            if(data.encryption == 1)
                $scope.DoorManage.activeControl.isAllCheck = true;
            else
                $scope.DoorManage.activeControl.isAllCheck = false;
        };

        $scope.checkedEncryption = function($event){
            var command = "";
            if($event.target.checked)
                command = "encryption&1";
            else
                command = "encryption&0";

            var prompt = $scope.languageJson.ControlBox.Prompt;
            DoorService.activeControlDoor($scope.DoorManage.activeControl.stationId,
                $scope.DoorManage.activeControl.equipmentId,command).then(function(data){
                if(data == "SUCCEED"){
                    DoorService.getGetDoorListByDoorName("").then(function(data){
                        $scope.DoorManage.doorList = data;
                    });
                    balert.show('success',prompt.Success,3000);/*'命令已下发，等待设备反馈！'*/
                    ControlDoorDialog.hide();
                }else
                    balert.show('danger',prompt.Failed,3000);/*'命令下发失败！'*/
            });
        };

        $scope.activeControlDoor = function(command){
            var prompt = $scope.languageJson.ControlBox.Prompt;

            DoorService.activeControlDoor($scope.DoorManage.activeControl.stationId,
                    $scope.DoorManage.activeControl.equipmentId,command).then(function(data){
                if(data == "SUCCEED"){
                    balert.show('success',prompt.Success,3000);/*'命令已下发，等待设备反馈！'*/
                    ControlDoorDialog.hide();
                }else if(data == "Timing Not Exist"){
                    balert.show('danger',prompt.TimingNotExist,3000);/*'门禁的校时没有基类编号！'*/
                }else if(data == "RemoveAllCard Not Exist"){
                    balert.show('danger',prompt.RemoveAllCardNotExist,3000);/*'门禁的删除所有卡没有基类编号！'*/
                }else if(data == "Encryption Not Exist"){
                    balert.show('danger',prompt.EncryptionNotExist,3000);/*'门禁的刷卡加密没有基类编号！'*/
                }else if(data == "AccessTimeSetting Not Exist"){
                    balert.show('danger',prompt.AccessTimeSettingNotExist,3000);/*'门禁的设置时间组没有基类编号！'*/
                }else
                    balert.show('danger',prompt.Failed,3000);/*'命令下发失败！'*/
            });
        };

        /******************  卡管理  ***************/
        $scope.loadCard = function(){
            CardService.getCardDataItem().then(function(data){
                $scope.CardManage.cardDataItem = addFirstDataItem(data);
            });

            CardService.getLimitCard(($scope.paginationCard.currentPage - 1) * $scope.paginationCard.itemsPerPage,
                $scope.paginationCard.itemsPerPage,$scope.paginationCard.parameter).then(function(data) {
                $scope.paginationCard.cardList = fromCardList(data);
            });

            $scope.selectCard = {
                cardCategory : "0",
                cardName:"",
                cardType:"0"
            };
        };

        var getCardName = function(data){
            data.forEach(function(item){
                $scope.CardManage.cardDataItem.CardGroup.forEach(function(cdi){
                    if(item.cardGroup == cdi.ItemId)
                        item.cardGroupName = cdi.ItemValue;
                });
                $scope.CardManage.cardDataItem.CardCategory.forEach(function(cdi){
                    if(item.cardCategory == cdi.ItemId)
                        item.cardCategoryName = cdi.ItemValue;
                });
                $scope.CardManage.cardDataItem.CardStatus.forEach(function(cdi){
                    if(item.cardStatus == cdi.ItemId)
                        item.cardStatusName = cdi.ItemValue;
                });
            });
        };

        $scope.selectCardClick = function(){
            $scope.paginationCard.parameter=$scope.selectCard.cardCategory+"|"+$scope.selectCard.cardName+"|"+$scope.selectCard.cardType;

            CardService.getCardDataItem().then(function(data){
                $scope.CardManage.cardDataItem = addFirstDataItem(data);
                CardService.getLimitCard(($scope.paginationCard.currentPage - 1) * $scope.paginationCard.itemsPerPage,
                        $scope.paginationCard.itemsPerPage,$scope.paginationCard.parameter).then(function(datas) {
                    $scope.paginationCard.cardList = fromCardList(datas);
                });
            });
        };

        var nowtime = function(){
            var mydate = new Date();
            var str = "" + mydate.getFullYear()+"-";
            var mm = mydate.getMonth()+1;
            if(mydate.getMonth()>9){
                str += mm+"-";
            }
            else{
                str += "0" + mm+"-";
            }
            if(mydate.getDate()>9){
                str += mydate.getDate();
            }
            else{
                str += "0" + mydate.getDate();
            }
            return str;
        };

        $scope.updateCardClick = function(cardId,cardStatus){
            $scope.CardManage.updCard.cardStatus = cardStatus;
            CardSetterDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/cardSetter.html',
                show: false
            });
            CardSetterDialog.$promise.then(CardSetterDialog.show);

            CardService.getCardByCardId(cardId).then(function(data){
                $scope.CardManage.updCard = data;

                $scope.DoorManage.doorList.forEach(function(dl){
                    var is = false;
                    dl.password = "";
                    dl.timeGroupId = undefined;
                    data.doors.forEach(function(item){
                        if(item.doorId == dl.doorId){
                            is = true;
                            dl.password = item.password;
                            dl.timeGroupId = item.timeGroupId;
                        }
                    });
                    dl.isCheck = is;
                });
            });
        };

        $scope.updateCard = function(){
            var prompt = $scope.languageJson.CardBox.Prompt;
            if($scope.CardManage.updCard.cardName == ""){
                balert.show('danger',prompt.NotCard,3000);/*'卡名称不能为空！'*/
                return;
            }
            if($scope.CardManage.updCard.timeGroup == "" || $scope.CardManage.updCard.timeGroup == undefined){
                balert.show('danger',prompt.NotTimeGroup,3000);/*'时段限制不能为空！'*/
                return;
            }
            var isCheck = false,isTimeGroup = false;
            $scope.CardManage.updCard.doors = [];
            $scope.DoorManage.doorList.forEach(function(item){
                if(item.isCheck){
                    isCheck = item.isCheck;
                    $scope.CardManage.updCard.doors.push(item);
                    if(item.timeGroupId == undefined){
                        isTimeGroup = true;
                    }
                }
            });
            if(isTimeGroup){
                balert.show('danger',prompt.NotTimeGroups,3000);/*'时段不能为空！'*/
                return;
            }
            if(!isCheck){
                balert.show('danger',prompt.NotDoor,3000);/*'门禁设备不能为空！'*/
                return;
            }
            if($scope.CardManage.updCard.endTime == ""){
                balert.show('danger',prompt.NotEndTime,3000);/*'有效结束时间不能为空！'*/
                return;
            }
            if($scope.CardManage.updCard.cardStatus == 3){
                /*"卡作废将不能再次启用，是否继续?"*/
                var con = confirm(prompt.ObsoleteConfirm);
                if(con == false) return;
            }
            $scope.CardManage.updCard.endTime = $filter('date')($scope.CardManage.updCard.endTime, 'yyyy-MM-dd');
            CardService.updateCard($scope.CardManage.updCard).then(function(data){
                if(data == "SUCCEED"){
                    CardService.getLimitCard(($scope.paginationCard.currentPage - 1) * $scope.paginationCard.itemsPerPage,
                            $scope.paginationCard.itemsPerPage,$scope.paginationCard.parameter).then(function(data) {
                        $scope.paginationCard.cardList = fromCardList(data);
                    });
                    balert.show('success',prompt.Success,3000);/*'修改成功，等待设备反馈！'*/
                    CardSetterDialog.hide();
                }else
                    balert.show('danger',prompt.Failed,3000);/*'修改失败！'*/
            });
        };
        $scope.deleteCardClick = function(cardId){
            var prompt = $scope.languageJson.Card.Prompt;
            /*"删除选中卡数据，是否继续?"*/
            bconfirm.show($scope,prompt.Confirm).then(function(data){
                if(data){
                    CardService.deleteCard(cardId).then(function(data){
                        if(data == "SUCCEED"){
                            $scope.paginationCard.parameter=$scope.selectCard.cardCategory+"|"+$scope.selectCard.cardName+"|"+$scope.selectCard.cardType;

                            CardService.getCardNums($scope.paginationCard.parameter).then(function(datas) {
                                $scope.paginationCard.totalItems = datas;

                                CardService.getLimitCard(($scope.paginationCard.currentPage - 1) * $scope.paginationCard.itemsPerPage,
                                    $scope.paginationCard.itemsPerPage,$scope.paginationCard.parameter).then(function(data) {
                                    $scope.paginationCard.cardList = fromCardList(data);
                                });
                            });
                            balert.show('success',prompt.Success,3000);/*'删除成功！'*/
                        }else
                            balert.show('danger',prompt.Failed,3000);/*'删除失败！'*/
                    });
                }
            });
        };

        /**************  数据维护  ***************/
        $scope.loadData = function(){
            $scope.DataManage = {
                addName : "",
                timeGroupId : "",
                updName : "",
                DataItem : {
                    insName : "",
                    updName : "",
                    cardGroup : "0"
                }
            };

            TimeGroupService.getTimeGroupList().then(function(data){
                $scope.DoorManage.timeGroup = data;
            });
        };

        $scope.loadCardGroup = function(id){
            $scope.DataManage.DataItem.dataItems = [];
            $scope.DataManage.entryId = id;
            if(id == 75){
                $scope.CardManage.addCard.cardDataItem.CardGroup.forEach(function(item){
                    $scope.DataManage.DataItem.dataItems.push(item);
                });
            }
        };

        $scope.showCardGroupInfo = function(data){
            $scope.DataManage.DataItem.itemId = data.ItemId;
            $scope.DataManage.DataItem.updName = data.ItemValue;
        };

        $scope.showTimeGroup = function(data){
            if(data.timeGroupSpan)
                for(var j = 0;j<data.timeGroupSpan.length;j++){
                    var tsc = data.timeGroupSpan[j].timeSpanChar.split("");
                    var checks = [];
                    for(var i = 0;i<tsc.length;i++){
                        var check = {};
                        check.id = i;
                        if(tsc[i] == '1')
                            check.isCheck = true;
                        else
                            check.isCheck = false;
                        checks.push(check);
                    }
                    data.timeGroupSpan[j].checks = checks;
                }
            $scope.DataManage.timeGroupSpan = data.timeGroupSpan;

            AllowTime(data.timeGroupSpan);
            $scope.DataManage.timeGroupId = data.timeGroupId;
            $scope.DataManage.updName = data.timeGroupName;

            if(data.timeGroupId == 99999999)
                $scope.isHide = "disable";
            else
                $scope.isHide = "";

            /*$scope.checks = [
                {id:"0"},{id:"1"},{id:"2"},{id:"3"},{id:"4"},{id:"5"},
                {id:"6"},{id:"7"},{id:"8"},{id:"9"},{id:"10"},{id:"11"},
                {id:"12"},{id:"13"},{id:"14"},{id:"15"},{id:"16"},{id:"17"},
                {id:"18"},{id:"19"},{id:"20"},{id:"21"},{id:"22"},{id:"23"}
            ];*/
        };

        function AllowTime(data){
            var prompt = $scope.languageJson.Advance.Prompt;
            // timeSpanChar:000000001111111111100000
            var str = data[0].timeSpanChar;
            var count = 0;
            var last = 0;
            $scope.DataManage.allowTime = [];
            while(true){
                var cfg = {};
                var min = str.indexOf("1");
                if(min == -1){
                    balert.show('danger',prompt.NotTime,3000);/*'准进时段不可为空！'*/
                    $scope.DataManage.nullError = true;
                    break;
                }
                str = str.substring(min);
                var max = str.indexOf("0");
                if(max == -1)
                    max = str.length;
                str = str.substring(max);

                count ++;
                if(count > 6){
                    balert.show('danger',prompt.Max6,3000);/*'准进时段不可超过6组！'*/
                    $scope.DataManage.exceedError = true;
                }else
                    $scope.DataManage.exceedError = false;
                cfg.count = count;
                if(count == 1){
                    cfg.time = min+":00 - "+(min - 1 + max)+":59";
                    last = (min + max);
                }else{
                    cfg.time = (last+min)+":00 - "+((last+min) - 1 + max)+":59";
                    last = ((last+min) + max);
                }

                $scope.DataManage.allowTime.push(cfg);
                if(str.indexOf("1") == -1)
                    break;
            }
        };

        $scope.clickTimeGroup = function(){
            var timeGroupSpan = $scope.DataManage.timeGroupSpan;
            timeGroupSpan.forEach(function(item){
                item.timeSpanChar = checkListJoinString(item.checks);
            });
            AllowTime(timeGroupSpan);
        };

        var loadDataItem = function(){
            $scope.DataManage.DataItem.insName = "";
            $scope.DataManage.DataItem.dataItems = [];

            CardService.getCardDataItem().then(function(data){
                $scope.CardManage.addCard.cardDataItem = data;
            });
            CardService.getCardDataItem().then(function(data){
                $scope.CardManage.addCard.cardDataItem = data;
                $scope.CardManage.addCard.cardDataItem.CardGroup.forEach(function(item){
                    $scope.DataManage.DataItem.dataItems.push(item);
                });
            });
        };

        $scope.insertTimeGroupClick = function(){
            if($scope.DoorManage.timeGroup.length > 16){
                balert.show('danger',$scope.languageJson.Access.Group,3000);/*'准进时间组不允许超过17组！'*/
                return;
            }
            if($scope.DataManage.addName == "" || $scope.DataManage.addName == undefined){
                balert.show('danger',$scope.languageJson.Access.NewName,3000);/*'新增名称不能为空！'*/
                return;
            }
            TimeGroupService.insertTimeGroup($scope.DataManage.addName).then(function(data){
                if(data == "SUCCEED"){
                    TimeGroupService.getTimeGroupList().then(function(data){
                        $scope.DoorManage.timeGroup = data;

                        $scope.DataManage.addName = "";

                        TimeGroupService.getTimeGroupType().then(function(data){
                            $scope.DoorCardManage.addDoorCard.TimeGroup = data;
                        });
                    });
                    balert.show('success',$scope.languageJson.Access.Success,3000);/*'新增成功！'*/
                }else
                    balert.show('danger',$scope.languageJson.Access.Newfailed,3000);/*'新增失败,编号超过限制！'*/
            });
        };

        $scope.updateTimeGroupClick = function(){
            if($scope.DataManage.updName == undefined || $scope.DataManage.updName == ""){
                balert.show('danger',$scope.languageJson.Access.TimeGroup,3000);/*'请选择时间组！'*/
                return;
            }
            if($scope.DataManage.nullError == true){
                balert.show('danger',$scope.languageJson.Access.Admission,3000);/*'准进时段不可为空！'*/
                return;
            }
            if($scope.DataManage.exceedError == true){
                balert.show('danger',$scope.languageJson.Access.Period,3000);/*'准进时段不可超过6组！'*/
                return;
            }

            var timeGroupSpan = $scope.DataManage.timeGroupSpan;
            timeGroupSpan.forEach(function(item){
                item.timeSpanChar = checkListJoinString(item.checks);
            });
            var timeGroupId = $scope.DataManage.timeGroupId;
            var timeGroupName = $scope.DataManage.updName;

            TimeGroupService.updateTimeGroup(timeGroupId,timeGroupName,timeGroupSpan).then(function(data){
                if(data == "SUCCEED"){
                    TimeGroupService.getTimeGroupList().then(function(data){
                        $scope.DoorManage.timeGroup = data;
                    });
                    balert.show('success',$scope.languageJson.Access.Saved,3000);/*'保存成功，等待设备反馈！'*/
                }else
                    balert.show('danger',$scope.languageJson.Access.Thereason+data,3000);/*'保存失败！原因：'*/
            });
        };

        var checkListJoinString = function(checks){
            var timeSpanChar = "";

            checks.forEach(function(item){
                if(item.isCheck == true)
                    timeSpanChar += "1";
                else
                    timeSpanChar += "0";
            });

            return timeSpanChar;
        };

        $scope.deleteTimeGroupClick = function(timeGroupId){
            TimeGroupService.deleteTimeGroup(timeGroupId).then(function(data){
                if(data == "SUCCEED"){
                    TimeGroupService.getTimeGroupList().then(function(data){
                        $scope.DoorManage.timeGroup = data;

                        $scope.DataManage.timeGroupSpan = [];
                        $scope.DataManage.updName = "";
                    });
                    balert.show('success',$scope.languageJson.Access.Successfull,3000);/*'删除成功！'*/
                }else
                    balert.show('danger',$scope.languageJson.Access.Failedto,3000);/*'删除失败！'*/
            });
        };

        $scope.checkedRows = function(index,$event){
            $scope.DataManage.timeGroupSpan.forEach(function(item){
                if(item.week == index){
                    item.checks.forEach(function(row){
                        row.isCheck = $event.target.checked;
                    });
                    return;
                }
            });
        };
        $scope.checkedCols = function(index,$event){
            $scope.DataManage.timeGroupSpan.forEach(function(item){
                for(var i = 0;i<item.checks.length;i++){
                    if(i == index){
                        item.checks[i].isCheck = $event.target.checked;
                        break;
                    }
                }
            });
        };

        $scope.$watch("tab",function(){
            if($scope.tab != 4){
                $scope.DataManage.timeGroupSpan = [];
                $scope.DataManage.DataItem.dataItems = [];
            }
        });

    }
]);

nurseController.controller('ConfigMdcCtrl',['$scope', '$http', '$interval','$compile','$modal','base64','MdcAlarmService','MdcConfigService','balert','$rootScope','equipmentTemplateService','baseTypeService','CameraService','stationService','equipmentService','employeeService','RtspVideoService','bconfirm',
    function($scope, $http, $interval,$compile,$modal,base64,MdcAlarmService,MdcConfigService,balert,$rootScope,equipmentTemplateService,baseTypeService,CameraService,stationService,equipmentService,employeeService,RtspVideoService,bconfirm){
        var bindDeviceDialog,addVideoDialog,addCabinetDialog,bindEventDialog,addCabinetDeviceDialog,showAssetDialog,bindAisleDeviceDialog = null;
        $scope.cabinet = {
            equipment : [],
            otherEvent : []
        };
        $(function(){
            //动态加载table
            var initTable = function(colNum,type){
                var td = "";
                $("#mdc-alarm-tr1").children('td').remove();//清空所有的td
                $("#mdc-alarm-tr2").children('td').remove();//清空所有的td
                if(type == 0 || type == 1){
                    //$scope.MdcWidth = "width:"+(100/16*parseInt(colNum))+"%;";
                    $scope.MdcWidth = (100/16*parseInt(colNum));
                    for(var i = 1;i <= colNum; i++){
                        td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\"></div>" +
                            "<div class=\"cabinet-body {{sc('cabinet"+i+"')}}\" ng-click=\"cabinetClk('cabinet"+i+"')\"><div></div></div></td>";
                        var $td = $compile(td)($scope);
                        $("#mdc-alarm-tr2").append($td);
                    }
                }else{
                    $scope.MdcWidth = "width:"+(100/16*(parseInt(colNum)/2))+"%;";
                    for(var i = 1;i <= colNum; i++){
                        if(i <= colNum/2) {
                            td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\"></div>" +
                                "<div class=\"cabinet-body {{sc('cabinet"+i+"')}}\" ng-click=\"cabinetClk('cabinet"+i+"')\"><div></div></div></td>";
                            var $td = $compile(td)($scope);
                            $("#mdc-alarm-tr2").append($td);
                        }else {
                            td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title top\"></div>" +
                                "<div class=\"cabinet-body {{sc('cabinet"+i+"')}}\" ng-click=\"cabinetClk('cabinet"+i+"')\"><div></div></div></td>";
                            var $td = $compile(td)($scope);
                            $("#mdc-alarm-tr1").append($td);
                        }
                    }
                }
            };
            //初始化MDC的配置
            var init = function(mdcId){
                MdcConfigService.GetMdcConfigInfo().then(function(data){
                    if(mdcId == null || mdcId == undefined){
                        if(data.length > 0)
                            initTable(data[0].cabinetNumber,data[0].type);
                    }else{
                        for(var i = 0;i<data.length;i++){
                            if(data[i].id == mdcId){
                                $scope.configMdc.mdcs = data[i];
                                $scope.configMdc.titleName = data[i].name;
                                initTable(data[i].cabinetNumber,data[i].type);
                                break;
                            }
                        }
                    }
                });

                sessionStorage.setItem("MdcId",mdcId);

                MdcAlarmService.getCabinetList(mdcId).then(function(data){
                    $scope.cabinets = data;
                });
                MdcConfigService.GetOtherEvents(mdcId).then(function(data){
                    $scope.otherEvents = data;
                });
                MdcAlarmService.getGetOtherSignal(mdcId).then(function(data){
                    $scope.otherSignals = parseOtherSignal(data);
                });
                MdcAlarmService.getCabinetTemp(mdcId).then(function(data){
                    $scope.temperatures = data;
                });
                //all Event
                MdcConfigService.GetAllEvents().then(function(data){
                    $scope.events = data;
                });
                CameraService.loadVideoEquipment().then(function(data){
                    if(data === "]" || data === undefined) return;
                    $scope.cameras = eval(data);
                });
                //get Environment
                MdcConfigService.GetOtherSignal().then(function(data){
                    $scope.Environments = data;
                });
            };

            //第一次进入或刷新页面
            if(sessionStorage.getItem("MdcId") == undefined || sessionStorage.getItem("MdcId") == "undefined" || sessionStorage.getItem("MdcId") == 'null'){
                MdcConfigService.GetMdcConfigInfo().then(function(data){
                    if(data.length == 0){
                        balert.show('danger',$scope.languageJson.Micromodule.AddMdc,3000);/*"请新增微模块！"*/
                    }else{
                        $scope.configMdc = data[0];
                        init($scope.configMdc.id);
                        sessionStorage.setItem("CabinetUHeight",$scope.configMdc.cabinetUHeight);
                        sessionStorage.setItem("CabinetNumber",$scope.configMdc.cabinetNumber);
                    }
                });
            }else{
                init(sessionStorage.getItem("MdcId"));
            }
            //第二次从配置页面进入
            $rootScope.$on('MdcInfo', function(event,data){
                init(data);
            });

            if($scope.configMdc.cabinetUHeight == undefined || $scope.configMdc.cabinetUHeight == ''){
                $scope.configMdc.cabinetUHeight = sessionStorage.getItem("CabinetUHeight");
                $scope.configMdc.cabinetNumber = sessionStorage.getItem("CabinetNumber");
                $scope.configMdc.id = sessionStorage.getItem("MdcId");
            }

            //获取站点信息
            stationService.getStationInfo().then(function(data){
                $scope.Stations = data;
            });

            //通道温湿度列表
            MdcConfigService.GetAllAisleThermalHumidity(sessionStorage.getItem("MdcId")).then(function(data){
                $scope.aisleThermalHumidity = data;
            });

        });

        /******************************** 冷通道设备 Start ***********************************/

        function GetAisleDeviceLocation(){
            MdcConfigService.GetAisleDeviceLocation().then(function(data){
                $scope.AisleDeviceLocations = data;
                CreateAisleTable(data);
            });
        }

        function CreateAisleTable(data){
            //$("#AisleTable").children('tr').remove();//清空所有的td
            $("#AisleTable").find("tr").remove();//清空所有的td
            for(var i = 1;i <= 3;i ++){
                var tr = "<tr>";
                for(var j = 1;j <= 7;j++){
                    var aisles = GetAisleDeviceByLocation(data,i,j);
                    var td = "";
                    if(j <= 3)
                        td = "<td align='left' ng-click='aisleClick("+i+","+j+")'>"+CreateAisleInfo(aisles,'left')+"</td>";
                    else if(j == 4)
                        td = "<td align='center' ng-click='aisleClick("+i+","+j+")'><div style='width: fit-content;'>"+CreateAisleInfo(aisles,'left')+"</div></td>";
                    else
                        td = "<td align='right' ng-click='aisleClick("+i+","+j+")'>"+CreateAisleInfo(aisles,'right')+"</td>";
                    tr += td;
                }
                tr += "</tr>";
                var $tr = $compile(tr)($scope);
                $("#AisleTable").append($tr);
            }
        }

        function GetAisleDeviceByLocation(data,row,col){
            if(data){
                var obj = [];
                data.forEach(function(item){
                    if(item.TableRow == row && item.TableCol == col)
                        obj.push(item);
                });
                return obj;
            }else
                return undefined;
        }

        function CreateAisleInfo(aisles,align){
            if(aisles == undefined || aisles.length == 0) return "";
            var div = "";
            aisles.forEach(function(aisle){
                if(aisle.DeviceType == "video"){//摄像头
                    div += "<div class='camera' style='float: "+align+";' ng-click='editAisleTable(\""+aisle.Id+"\",\"\")'></div>";
                }else if(aisle.DeviceType == "skyFalling"){//天窗
                    div += "<div class=\"skyFalling normal\" style='float: "+align+";' ng-click=\"editAisleTable('"+aisle.Id+"','')\"></div>";
                }else if(aisle.DeviceType == "thermalHumidity"){//温湿度
                    div += "<div class=\"thermalHumidity\" style='width: 10vh;height: 5vh;float: "+align+";'>"+
                                "<div class=\"thermal normal\" style='float: left;' ng-click=\"editAisleTable('"+aisle.Id+"','Thermal')\"></div>"+
                                "<div class=\"humidity normal\" style='float: left;' ng-click=\"editAisleTable('"+aisle.Id+"','Humidity')\"></div>"+
                            "</div>";
                }else if(aisle.DeviceType == "infrared"){//红外
                    div += "<div class=\"infrared normal\" style='float: "+align+";' ng-click=\"editAisleTable('"+aisle.Id+"','')\"></div>";
                }else if(aisle.DeviceType == "smoke"){//烟感
                    div += "<div class=\"smoke normal\" style='float: "+align+";' ng-click=\"editAisleTable('"+aisle.Id+"','')\"></div>";
                }else if(aisle.DeviceType == "rtspVideo"){
                    div += "<div class='camera' style='float: "+align+";' ng-click='editAisleTable(\""+aisle.Id+"\",\"\")'></div>";
                }
            });
            return div;
        }

        function GetRtspVideo(){
            RtspVideoService.GetRtspVideo().then(function(data){
                $scope.RtspVideos = data;
            });
        }

        GetAisleDeviceLocation();
        GetRtspVideo();

        $scope.aisleClick = function(row,col){
            if($scope.hideAisleClick){
                $scope.hideAisleClick = false;
                return;
            }
            $scope.AisleTable = {
                Rows : row,
                Cols : col
            };
            $scope.showAisleDevice("","");
        };
        /******************************** 冷通道设备 End ***********************************/

        var showAisleDeviceDialog = $modal({
            scope:$scope,
            templateUrl:'partials/showAisleDevice.html',
            show:false
        });

        $scope.showAisleDevice = function(Id,Type){
            showAisleDeviceDialog.$promise.then(showAisleDeviceDialog.show);

            if($scope.AisleTable == undefined) $scope.AisleTable = {};

            $scope.AisleTable.TableId = Id;
            $scope.AisleTable.Type = Type;
            loadAisleDevice(Type);
        };

        function loadAisleDevice(Type){
            var lists = [];
            if(Type == "rtspVideo"){
                if(addVideoDialog != null && addVideoDialog != undefined)
                    addVideoDialog.hide();

                if($scope.RtspVideos){
                    $scope.RtspVideos.forEach(function(item){
                        var data = {};
                        data.id = item.Id;
                        data.name = item.VideoName;
                        lists.push(data);
                    });
                }
            }else if(Type == "video"){//视频
                if(addVideoDialog != null && addVideoDialog != undefined)
                    addVideoDialog.hide();

                if($scope.cameras){
                    $scope.cameras.forEach(function(item){
                        var data = {};
                        data.id = item.EquipmentId;
                        data.name = item.EquipmentName;
                        lists.push(data);
                    });
                }
            }else if(Type == "thermal" || Type == "humidity"){//温湿度
                if(bindAisleDeviceDialog != null && bindAisleDeviceDialog != undefined)
                    bindAisleDeviceDialog.hide();

                if($scope.aisleThermalHumidity){
                    $scope.aisleThermalHumidity.forEach(function(item){
                        var data = {};
                        if(Type == "thermal"){
                            data.id = item.tDeviceId+"-"+item.tSignalId+"-"+item.site;
                            data.name = $scope.languageJson.MDC.Temperature2+item.site;/*"温度"*/
                        }else{
                            data.id = item.hDeviceId+"-"+item.hSignalId+"-"+item.site;
                            data.name = $scope.languageJson.MDC.Humiditys2+item.site;/*"湿度"*/
                        }
                        lists.push(data);
                    });
                }
            }else if(Type == "smoke" || Type == "infrared" || Type == "skyFalling"){//烟感 红外 天窗
                if(bindAisleDeviceDialog != null && bindAisleDeviceDialog != undefined)
                    bindAisleDeviceDialog.hide();

                if($scope.Environments){
                    $scope.Environments.forEach(function(item){
                        var data = {};
                        data.id = item.EquipmentId+"-"+item.SignalId+"-"+item.Site;
                        if(Type == "skyFalling" && item.Type == "skyFalling"){
                            data.name = $scope.languageJson.MDC.Skylight+item.Site;/*"天窗"*/
                            lists.push(data);
                        }else if(Type == "smoke" && item.Type == "smoke"){
                            data.name = $scope.languageJson.MDC.Smoke+item.Site;/*"烟感"*/
                            lists.push(data);
                        }else if(Type == "infrared" && item.Type == "infrared"){
                            data.name = $scope.languageJson.MDC.Infrared+item.Site;/*"红外"*/
                            lists.push(data);
                        }
                    });
                }
            }
            if($scope.AisleTable == undefined) $scope.AisleTable = {};
            $scope.AisleTable.Type = Type;
            $scope.AisleTable.devices = lists;
        }

        $scope.getInto = function(){
            if($scope.AisleTable.Type == undefined || $scope.AisleTable.TableId == undefined) return;

            if($scope.AisleTable.Type == "rtspVideo"){
                selectOpenSoftware($scope.AisleTable.TableId);
            }else if($scope.AisleTable.Type == "video"){
                $scope.cameraClk($scope.AisleTable.TableId);
            }else if($scope.AisleTable.Type == "thermal" || $scope.AisleTable.Type == "humidity"){
                var Site = "";
                if($scope.AisleTable.TableId == ""){
                    Site = getNextSite($scope.AisleTable.devices);
                }else{
                    var split = $scope.AisleTable.TableId.split("-");
                    $scope.configMdc.deviceId = split[0];
                    $scope.configMdc.signalId = split[1];
                    Site = split[2];
                }

                var Type = "Thermal";
                var title = $scope.languageJson.MDC.Humidity+Site+$scope.languageJson.MDC.Temperature;/*"温湿度"+Site+"-温度";*/
                if($scope.AisleTable.Type == "humidity"){
                    Type = "Humidity";
                    title = $scope.languageJson.MDC.Humidity+Site+$scope.languageJson.MDC.Humiditys;/*"温湿度"+Site+"-湿度";*/
                }

                $scope.THSignalClk(title,'1004|1006',Type,Site);
            }else if($scope.AisleTable.Type == "smoke" || $scope.AisleTable.Type == "infrared"
                || $scope.AisleTable.Type == "skyFalling"){
                var Site = "";
                var value = "";
                if($scope.AisleTable.TableId == ""){
                    Site = getNextSite($scope.AisleTable.devices);
                }
                else{
                    var split = $scope.AisleTable.TableId.split("-");
                    value = split[0]+"-"+split[1];
                    Site = split[2];
                }

                var id = $scope.AisleTable.Type+""+Site;
                var title = "";
                if($scope.AisleTable.Type == "skyFalling") title = $scope.languageJson.MDC.Skylight;/*"天窗"*/
                else if($scope.AisleTable.Type == "infrared") title = $scope.languageJson.MDC.Infrared+Site;/*"红外"*/
                else if($scope.AisleTable.Type == "smoke") title = $scope.languageJson.MDC.Smoke+Site;/*"烟感"*/

                $scope.aisleSignalClk(title,'1004',id,value);
                $scope.showEditAisle = true;
            }
            showAisleDeviceDialog.hide();
        };

        function getNextSite(data){
            if(data){
                var is = false,num = 0;
                data.forEach(function(item){
                    var split = item.id.split("-");
                    if(split.length > 1){
                        if(num < parseInt(split[2]))
                            num = parseInt(split[2]);
                    }
                });
                num += 1;
                if(!is) return num;
            }else
                return 1;
        }

        $scope.editAisleTable = function(Id,Type){
            $scope.hideAisleClick = true;
            if($scope.AisleDeviceLocations == undefined)
                GetAisleDeviceLocation();

            var is = true;
            $scope.AisleDeviceLocations.forEach(function(item){
                if(item.Id == Id){
                    if(item.DeviceType == "rtspVideo"){
                        is = false;
                        selectOpenSoftware(item.TableId);
                    }else if(item.DeviceType == "video"){
                        is = false;
                        $scope.cameraClk(item.TableId);
                    }else if(item.DeviceType == "thermalHumidity")
                        is = GetThermalHumidityById(item.TableId,Type);
                    else
                        is = GetOtherSignalById(item.TableId);
                    $scope.showEditAisle = true;

                    $scope.AisleTable = {
                        Id : item.Id,
                        Rows : item.TableRow,
                        Cols : item.TableCol,
                        TableId : item.TableId,
                        Type : item.DeviceType
                    };
                    if(item.DeviceType == "thermalHumidity")
                        $scope.AisleTable.Type = Type == "Thermal" ? "thermal" : "humidity";

                    if(is) $scope.showAisleDevice("","");
                }
            });
            if(is) $scope.showAisleDevice("","");
        };

        function GetOtherSignalById(Id){
            if($scope.Environments){
                var is = true;
                $scope.Environments.forEach(function(item){
                    if(item.Id == Id){
                        is = false;
                        var title = "";
                        if(item.Type == "skyFalling") title = $scope.languageJson.MDC.Skylight;/*"天窗"*/
                        else if(item.Type == "infrared") title = $scope.languageJson.MDC.Infrared+item.Site;/*"红外"*/
                        else if(item.Type == "smoke") title = $scope.languageJson.MDC.Smoke+item.Site;/*"烟感"*/
                        var id = item.Type+""+item.Site;
                        var value = item.EquipmentId+"-"+item.SignalId;
                        $scope.aisleSignalClk(title,'1004',id,value);
                    }
                });
                return is;
            }
        }

        function GetThermalHumidityById(Id,Type){
            if($scope.aisleThermalHumidity && $scope.aisleThermalHumidity.length > 0){
                var is = true;
                $scope.aisleThermalHumidity.forEach(function(item){
                    if(item.id == Id){
                        is = false;
                        var title = "";
                        if(Type == "Thermal") title = $scope.languageJson.MDC.Humidity +item.site+$scope.languageJson.MDC.Temperature;/*"温湿度"+item.site+"-温度";*/
                        else title = $scope.languageJson.MDC.Humidity +item.site+$scope.languageJson.MDC.Humiditys;/*"温湿度"+item.site+"-湿度";*/
                        $scope.THSignalClk(title,'1004|1006',Type,item.site);
                    }
                });
                return is;
            }else{
                MdcConfigService.GetAllAisleThermalHumidity(sessionStorage.getItem("MdcId")).then(function(data){
                    $scope.aisleThermalHumidity = data;
                });
            }
        }

        $scope.changeAisleTableType = function(type){
            loadAisleDevice(type);
        };

        $scope.saveAisleTable = function(){
            if($scope.AisleTable.Type == "rtspVideo")
                saveRtspVideo();
            else if($scope.AisleTable.Type == "video")
                addVideoClick();
            else
                saveOtherSignal();
        };

        $scope.deleteAisleTable = function(){
            if($scope.AisleTable.Id == "" || $scope.AisleTable.Id == undefined){
                balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Title,3000);/*"未获取到删除对象！"*/
                return;
            }
            MdcConfigService.DelAisleDeviceLocation($scope.AisleTable.Id).then(function(data){
                if(data == "OK"){
                    //重新加载表格
                    GetAisleDeviceLocation();
                    //重新加载环境设备
                    MdcConfigService.GetOtherSignal().then(function(data){
                        $scope.Environments = data;
                    });
                    //重新加载通道温湿度列表
                    MdcConfigService.GetAllAisleThermalHumidity(sessionStorage.getItem("MdcId")).then(function(data){
                        $scope.aisleThermalHumidity = data;
                    });
                    if(bindAisleDeviceDialog != null && bindAisleDeviceDialog != undefined) bindAisleDeviceDialog.hide();
                    if(addVideoDialog != null && addVideoDialog != undefined) addVideoDialog.hide();
                    balert.show('success',$scope.languageJson.MDC.Equipment.Object.Success,3000);/*'删除成功！'*/
                }else
                    balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Failed,3000);/*'删除失败！'*/
            });
        };

        function selectOpenSoftware(tableId){
            $scope.video = {
                filePath : "",
                openType : "rtspVideo"
            };
            $scope.showChanNum = false;

            if($scope.RtspVideos == undefined)
                GetRtspVideo();
            $scope.RtspVideos.forEach(function(os){
                if(tableId == os.Id){
                    $scope.video.Id = os.Id
                    $scope.video.Path = os.Path;
                    $scope.video.VideoName = os.VideoName;
                }
            });

            addVideoDialog = $modal({
                scope:$scope,
                templateUrl:'partials/addVideo.html',
                show:false
            });
            addVideoDialog.$promise.then(addVideoDialog.show);
        };

        function saveRtspVideo(){
            if($scope.video.VideoName == "" || $scope.video.VideoName == undefined){
                balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Enter,3000);/*'请输入摄像机名称！'*/
                return;
            }
            if($scope.video.Path == "" || $scope.video.Path == undefined){
                balert.show('danger',$scope.languageJson.MDC.Equipment.Object.RTMP,3000);/*'请输入RTMP播放地址！'*/
                return;
            }
            var req = $scope.AisleTable.Id+"|rtspVideo|"+$scope.AisleTable.Rows+"|"+$scope.AisleTable.Cols+"|"+$scope.video.Id+"|"+$scope.video.Path+"|"+$scope.video.VideoName;
            MdcConfigService.SetAisleDeviceLocation(req).then(function(data){
                if(data == "OK"){
                    GetAisleDeviceLocation();
                    GetRtspVideo();
                    balert.show('success',$scope.languageJson.MDC.Equipment.Object.Modified,3000);/*'修改成功！'*/
                    addVideoDialog.hide();
                }else
                    balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Fail,3000);/*'修改失败！'*/
            });
        };

        //给机柜添加样式
        $scope.sc = function(obj) {
            var exist = false;
            var ret = "normal";
            if($scope.cabinets){
                $scope.cabinets.forEach(function(item){
                    if(item.cabinetId === obj){
                        if(obj.indexOf("cabinet")>-1){
                            $("." + obj + " .cabinet-title").html(item.cabinetName);
                            $("." + obj + " .cabinet-body").addClass(item.cabinetType);
                            if(item.connectState == 0 || item.connectState == 2)
                                $("." + obj + " .cabinet-body > div").css('background','rgba(0, 0, 0, 0.59)');
                            else
                                $("." + obj + " .cabinet-body > div").css('background','rgba(0, 0, 0, 0)');
                        }
                        ret = item.cabinetStatus;
                        exist = true;
                    }
                });
            }
            if(!exist){
                if(obj.indexOf("cabinet")>-1) {
                    $("." + obj + " .cabinet-title").html('');
                    $("." + obj + " .cabinet-body").removeClass("UPS").removeClass("RACK").removeClass("AC").removeClass("UNUSE")
                        .removeClass("CELL").removeClass("RECTIFIER").removeClass("HVDC");
                    $("." + obj + " .cabinet-body > div").css('background','rgba(0, 0, 0, 0)');
                }
            }
            return ret;
        };
        //淡入淡出
        $scope.cabinetMouseenter = function(){
            $(".device"+" > td > div.cabinet-title").fadeIn(2000);
        };
        $scope.cabinetMouseleave = function(){
            $(".device"+" > td > div.cabinet-title").fadeOut(2000);
        };

        $scope.signalClk = function(title,baseType,id,value){
            //只有门设备才有控制
            if(id.indexOf("door") != -1)
                $scope.isControlBox = true;
            else
                $scope.isControlBox = false;

            bindDeviceDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/bindDevice.html',
                show: false
            });
            bindDeviceDialog.$promise.then(bindDeviceDialog.show);
            $scope.bindTitle = title;
            $scope.cabinet.bindBtnId = id;
            equipmentTemplateService.GetEquipmentTemplatesByBaseType(baseType).then(function(data){
                $scope.configMdc.devices = data;
                if($scope.configMdc.deviceId == undefined || $scope.configMdc.deviceId == ""){
                    $scope.configMdc.deviceId = data[0].id;
                    $scope.configMdc.signalId = undefined;
                }
                if(value != undefined && value != "" && value != "-"){
                    var v = value.split("-");
                    $scope.configMdc.deviceId = v[0];
                    $scope.configMdc.signalId = v[1];
                }else{
                    balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Unbound,3000);/*"未绑定信号！"*/
                    $scope.configMdc.signalId = undefined;
                }
                $scope.changeDevice($scope.configMdc.deviceId);
            });
        };

        $scope.aisleSignalClk = function(title,baseType,id,value){
            $scope.showEditAisle = false;
            bindAisleDeviceDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/bindAisleDevice.html',
                show: false
            });
            bindAisleDeviceDialog.$promise.then(bindAisleDeviceDialog.show);
            $scope.bindTitle = title;
            $scope.cabinet.bindBtnId = id;
            equipmentTemplateService.GetEquipmentTemplatesByBaseType(baseType).then(function(data){
                $scope.configMdc.devices = data;
                if($scope.configMdc.deviceId == undefined || $scope.configMdc.deviceId == ""){
                    $scope.configMdc.deviceId = data[0].id;
                    $scope.configMdc.signalId = undefined;
                }
                if(value != undefined && value != "" && value != "-"){
                    var v = value.split("-");
                    $scope.configMdc.deviceId = v[0];
                    $scope.configMdc.signalId = v[1];
                }else{
                    balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Unbound,3000);/*"未绑定信号！"*/
                    $scope.configMdc.signalId = undefined;
                }
                $scope.changeDevice($scope.configMdc.deviceId);
            });
        };

        $scope.THSignalClk = function(title,baseType,type,index){
            bindAisleDeviceDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/bindAisleDevice.html',
                show: false
            });
            bindAisleDeviceDialog.$promise.then(bindAisleDeviceDialog.show);
            $scope.bindTitle = title;
            $scope.cabinet.bindBtnId = type+"_"+index;
            equipmentTemplateService.GetEquipmentTemplatesByBaseType(baseType).then(function(data){
                $scope.configMdc.devices = data;
                if($scope.configMdc.deviceId == undefined || $scope.configMdc.deviceId == ""){
                    $scope.configMdc.deviceId = data[0].id;
                    $scope.configMdc.signalId = undefined;
                }

                if($scope.aisleThermalHumidity){
                    assignThermalHumidity(type,index);
                }else{
                    MdcConfigService.GetAllAisleThermalHumidity(sessionStorage.getItem("MdcId")).then(function(data){
                        $scope.aisleThermalHumidity = data;
                        assignThermalHumidity(type,index);
                    });
                }
            });
        };

        function assignThermalHumidity(type,index){
            var i = -1;
            $scope.aisleThermalHumidity.forEach(function(ath){
                if(ath.site == index){
                    i = index;
                    var deviceId = '',signalId = '';
                    if(type == "Thermal"){
                        deviceId = ath.tDeviceId;
                        signalId = ath.tSignalId;
                    }
                    if(type == "Humidity"){
                        deviceId = ath.hDeviceId;
                        signalId = ath.hSignalId;
                    }
                    if(deviceId == '' || signalId == ''){
                        balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Unbound,3000);/*"未绑定信号！"*/
                        $scope.configMdc.signalId = undefined;
                    }else{
                        $scope.configMdc.deviceId = deviceId;
                        $scope.configMdc.signalId = signalId;
                    }
                    $scope.changeDevice($scope.configMdc.deviceId);
                }
            });

            if(i == -1){
                balert.show('danger',$scope.languageJson.MDC.Equipment.Object.Unbound,3000);/*"未绑定信号！"*/
                $scope.configMdc.signalId = undefined;
                $scope.changeDevice($scope.configMdc.deviceId);
            }
        }

        $scope.cameraClk = function(id){
            addVideoDialog = $modal({
                scope:$scope,
                templateUrl:'partials/addVideo.html',
                show:false
            });
            $scope.video = {};
            var is = true;
            if($scope.cameras){
                $scope.cameras.forEach(function(item){
                    if(item.EquipmentId == id){
                        $scope.video.eId = item.EquipmentId;
                        $scope.video.eName = item.EquipmentName;
                        $scope.video.videoType = item.VideoType;
                        $scope.video.ipAddress = item.IpAddress;
                        $scope.video.ePort = item.Port;
                        $scope.video.eChanNum = item.ChanNum;
                        $scope.video.userName = item.UserName;
                        $scope.video.userPwd = item.UserPwd;
                        $scope.video.Number = 1;
                        if(item.VideoType == 2) $scope.showChanNum = true;
                        else $scope.showChanNum = false;
                        is = false;
                    }
                });
            }
            if(is){
                $scope.video = {
                    eId : "",
                    eName : "video",
                    videoType : "1",
                    ipAddress : "192.168.1.64",
                    ePort : "80",
                    eChanNum : "1",
                    userName : "admin",
                    userPwd : "",
                    Number : "1"
                }
            }
            $scope.video.openType = "video";

            addVideoDialog.$promise.then(addVideoDialog.show);
        };
        $scope.changeVideoTypeByVideoName = function(videoType){
            if(videoType == 1){
                $scope.video.eChanNum = "1";
                $scope.showChanNum = false;
                $("#Video_ChanNum").addClass("ng-hide");
            } else {
                $scope.showChanNum = true;
                $("#Video_ChanNum").removeClass("ng-hide");
            }
        };

        $scope.cabinetClk = function(id){
            $scope.TitleName = $scope.languageJson.MDC.Micromodules.Title+id.replace("cabinet","");/*"机柜"*/

            $scope.cabinet = {
                cabinetId : id
            };
            var isCabinet = false;
            $scope.cabinets.forEach(function(item){
                if(item.cabinetId == id){
                    $scope.cabinet = parseCabinet(item);
                    isCabinet = true;
                }
            });
            MdcConfigService.GetCabinetTypeDataItem('201').then(function(data){
                $scope.cabinetTypeDataItem = data;

                if(!isCabinet){
                    $scope.cabinet.cabinetType = data[0].ItemAlias;
                    $scope.changeType($scope.cabinet.cabinetType);
                }
            });

            addCabinetDialog = $modal({
                scope:$scope,
                templateUrl:'partials/addCabinet.html',
                show:false
            });
            addCabinetDialog.$promise.then(addCabinetDialog.show);
        };

        $scope.changeType = function(cabinetType){
            var number = 1;
            $scope.cabinets.forEach(function(item){
                if(item.cabinetType == cabinetType) number ++;
            });
            $scope.cabinetTypeDataItem.forEach(function(item){
                if(item.ItemAlias == cabinetType){
                    if($scope.languageJson.Language == 'English')
                        $scope.cabinet.name = item.ItemAlias+" "+number;
                    else
                        $scope.cabinet.name = item.ItemValue+""+number;
                }
            });
        };

        var parseCabinet = function(data){
            var cfg = data;

            if(data.cabinetName.indexOf("<br/>") != -1)
                cfg.name = data.cabinetName.replace(/<br\/>/g,'');
            else
                cfg.name = data.cabinetName;

            //配电
            if(data.PhaseAVoltageDeviceId != "")cfg.phaseAVoltage = data.PhaseAVoltageDeviceId+"-"+data.PhaseAVoltageSignalId;
            if(data.PhaseBVoltageDeviceId != "")cfg.phaseBVoltage = data.PhaseBVoltageDeviceId+"-"+data.PhaseBVoltageSignalId;
            if(data.PhaseCVoltageDeviceId != "")cfg.phaseCVoltage = data.PhaseCVoltageDeviceId+"-"+data.PhaseCVoltageSignalId;
            if(data.PhaseACurrentDeviceId != "")cfg.phaseACurrent = data.PhaseACurrentDeviceId+"-"+data.PhaseACurrentSignalId;
            if(data.PhaseBCurrentDeviceId != "")cfg.phaseBCurrent = data.PhaseBCurrentDeviceId+"-"+data.PhaseBCurrentSignalId;
            if(data.PhaseCCurrentDeviceId != "")cfg.phaseCCurrent = data.PhaseCCurrentDeviceId+"-"+data.PhaseCCurrentSignalId;
            //温度设备
            if($scope.temperatures){
                $scope.temperatures.forEach(function(item){
                    var id = "cabinet"+(parseInt(item.cabinetId)%100);
                    if(id == data.cabinetId){
                        if(item.y == 50) cfg.thermalSensors1 = item.deviceId + "-" + item.signalId;
                        if(item.y == 100) cfg.thermalSensors2 = item.deviceId + "-" + item.signalId;
                        if(item.y == 150) cfg.thermalSensors3 = item.deviceId + "-" + item.signalId;
                    }
                });
            }

            //机柜设备
            cfg.equipment = [];
            if(data.equipmentName != "" || data.equipmentId != ""){
                var ids = data.equipmentId.split(",");
                var names = data.equipmentName.split(",");
                var indexs = data.uIndex.split(",");
                var heights = data.uHeight.split(",");
                for(var i = 0;i < names.length; i++){
                    var equipment = {};
                    equipment.id = ids.length > i ? ids[i] : "";
                    equipment.name = names[i];
                    equipment.index = indexs[i];
                    equipment.height = heights[i];
                    if(heights[i] == 0)
                        equipment.space = $scope.languageJson.MDC.NoPosition;/*"不占U位"*/
                    else
                        equipment.space = "["+indexs[i]+","+(parseInt(indexs[i])+parseInt(heights[i]))+"]";
                    cfg.equipment.push(equipment);
                }
            }

            //其他告警
            cfg.otherEvent = [];
            if($scope.otherEvents){
                $scope.otherEvents.forEach(function(item){
                    var id = "cabinet"+(parseInt(item.cabinetId)%100);
                    if(id == data.cabinetId){
                        cfg.otherEvent.push(item);
                    }
                });
            }
            return cfg;
        };


        var parseOtherSignal = function(data){
            var cfg = [];
            data.forEach(function(item){
                eval("cfg."+item.cabinetId+" = item.PhaseACurrentDeviceId +'-'+ item.PhaseACurrentSignalId");
            });
            return cfg;
        };

        $scope.bindDevice = function(title,baseType,id,value){
            $scope.isControlBox = false;
            bindDeviceDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/bindDevice.html',
                show: false
            });
            bindDeviceDialog.$promise.then(bindDeviceDialog.show);
            $scope.bindTitle = title;
            $scope.cabinet.bindBtnId = id;
            $scope.configMdc.signals = [];
            equipmentTemplateService.GetEquipmentTemplatesByBaseType(baseType).then(function(data){
                $scope.configMdc.devices = data;
                if($scope.configMdc.deviceId == undefined || $scope.configMdc.deviceId == ""){
                    $scope.configMdc.deviceId = data[0].id;
                    $scope.configMdc.signalId = undefined;
                }
                if(value != undefined && value != "" && value != "-"){
                    var v = value.split("-");
                    $scope.configMdc.deviceId = v[0];
                    $scope.configMdc.signalId = v[1];
                }
                var is = false;
                $scope.configMdc.devices.forEach(function(item){
                    if(item.id == $scope.configMdc.deviceId){
                        is = true;
                    }
                });
                if(!is) $scope.configMdc.deviceId = data[0].id;
                $scope.changeDevice($scope.configMdc.deviceId);
            });
        };
        $scope.changeDevice = function(id){
            baseTypeService.GetSinalByEquipmentId(id).then(function(data){
                $scope.configMdc.signals = data;
            });
        };
        $scope.saveBindDevice = function(){
            var id = $scope.cabinet.bindBtnId;
            if($scope.configMdc.signalId == undefined){
                balert.show('danger',$scope.languageJson.MDC.Prompt.SelectSignal,3000);/*"未绑定信号！"*/
                return;
            }
            SetOtherSignal(id,$scope.configMdc.deviceId,$scope.configMdc.signalId);
            setInputValue(id,$scope.configMdc.deviceId,$scope.configMdc.signalId);
            bindDeviceDialog.hide();
        };

        function saveOtherSignal(){
            var prompt = $scope.languageJson.MDC.Prompt;
            if($scope.configMdc.signalId == undefined){
                balert.show('danger',prompt.SelectSignal,3000);/*"未绑定信号！"*/
                return;
            }

            var mdcId = sessionStorage.getItem("MdcId");
            var req = $scope.AisleTable.Id+"|"+$scope.AisleTable.Type+"|"+$scope.AisleTable.Rows+"|"+$scope.AisleTable.Cols+
                "|"+mdcId+"|"+$scope.cabinet.bindBtnId+"|"+$scope.configMdc.deviceId+"|"+$scope.configMdc.signalId;
            MdcConfigService.SetAisleDeviceLocation(req).then(function(data){
                if(data == "OK"){
                    //重新加载表格
                    GetAisleDeviceLocation();
                    //重新加载环境设备
                    MdcConfigService.GetOtherSignal().then(function(data){
                        $scope.Environments = data;
                    });
                    //重新加载通道温湿度列表
                    MdcConfigService.GetAllAisleThermalHumidity(sessionStorage.getItem("MdcId")).then(function(data){
                        $scope.aisleThermalHumidity = data;
                    });
                    balert.show('success',prompt.Success,3000);/*'修改成功！'*/
                    bindAisleDeviceDialog.hide();
                }else
                    balert.show('danger',prompt.Failed,3000);/*'修改失败！'*/
            });
            setInputValue($scope.cabinet.bindBtnId,$scope.configMdc.deviceId,$scope.configMdc.signalId);
        };

        $scope.deleteBindDevice = function(){
            var id = $scope.cabinet.bindBtnId;
            SetOtherSignal(id,"","");
            setInputValue(id,"","");
            bindDeviceDialog.hide();
        };
        function SetOtherSignal(id,deviceId,signalId){
            var prompt = $scope.languageJson.MDC.Prompt;
            //修改MDC环境量配置
            if(id.indexOf("water") > -1 || id.indexOf("skyFalling") > -1 || id.indexOf("smoke") > -1 ||
                id.indexOf("infrared") > -1 || id.indexOf("door") > -1){
                var mdcId = sessionStorage.getItem("MdcId");
                var q = mdcId+"|"+id+"|"+deviceId+"|"+signalId;
                if(deviceId == "" || signalId == "") q = mdcId+"|"+id;
                MdcConfigService.SetOtherSignal(q).then(function(data){
                    $scope.otherSignals = parseOtherSignal(data);
                    balert.show('success',prompt.Success,3000);/*'修改成功！'*/
                });
            }

            //通道温湿度
            if(id.indexOf("Thermal") > -1 || id.indexOf("Humidity") > -1){
                var mdcId = sessionStorage.getItem("MdcId");
                var q = mdcId+"|"+id+"|"+deviceId+"|"+signalId;
                MdcConfigService.SetAisleThermalHumidity(q).then(function(data){
                    $scope.aisleThermalHumidity = data;
                    balert.show('success',prompt.Success,3000);/*'修改成功！'*/
                });
            }

        };
        function setInputValue(id,deviceId,signalId){
            if(deviceId == "" || deviceId == undefined)
                eval("$scope.cabinet."+id+" = ''");
            else
                eval("$scope.cabinet."+id+" = '"+deviceId+"'+'-'+'"+signalId+"'");
        };
        $scope.addAlarmClick = function(){
            bindEventDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/bindEvent.html',
                show: false
            });
            bindEventDialog.$promise.then(bindEventDialog.show);
            $scope.bindTitle = "新增告警";
            $scope.cabinet.bindBtnId = "NewAlarm";
            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                $scope.configMdc.devices = parseGetOtherAlarm(data);
                if($scope.configMdc.deviceId == undefined || $scope.configMdc.deviceId == ""){
                    $scope.configMdc.deviceId = $scope.configMdc.devices[0].id;
                    $scope.configMdc.signalId = undefined;
                }
                var is = false;
                $scope.configMdc.devices.forEach(function(item){
                    if(item.id == $scope.configMdc.deviceId){
                        is = true;
                    }
                });
                if(!is) $scope.configMdc.deviceId = data[0].id;
                $scope.changeEventDevice($scope.configMdc.deviceId);
            });
        };
        function parseGetOtherAlarm(data){
            if($scope.cabinet.equipment){
                $scope.cabinet.equipment.forEach(function(item){
                    data.forEach(function(i){
                        if(item.id == i.id)
                            data.splice($.inArray(i,data),1);
                    });
                });
            }
            return data;
        };
        $scope.changeEventDevice = function(id){
            $scope.configMdc.signals = [];
            if($scope.events){
                $scope.events.forEach(function(item){
                    if(item.deviceId == id){
                        $scope.deviceName = item.deviceName;
                        $scope.configMdc.signals.push(item);
                    }
                });
            }
            if($scope.cabinet.otherEvent && $scope.configMdc.signals){
                $scope.cabinet.otherEvent.forEach(function(item){
                    $scope.configMdc.signals.forEach(function(ss){
                        if(item.deviceId == id && item.signalId == ss.signalId){
                            $scope.configMdc.signals.splice($.inArray(ss,$scope.configMdc.signals),1);
                        }
                    });
                });
            }
        };
        $scope.saveBindEventDevice = function(){
            if($scope.configMdc.deviceId == undefined || $scope.configMdc.signalId == undefined){
                balert.show('danger',$scope.languageJson.MDC.Prompt.SelectAlarm,3000);/*"请选择告警！"*/
                return;
            }
            var signalName = "";
            $scope.configMdc.signals.forEach(function(item){
                if(item.signalId == $scope.configMdc.signalId){
                    signalName = item.signalName;
                }
            });

            var cfg = {
                deviceId : $scope.configMdc.deviceId,
                deviceName : $scope.deviceName,
                signalId : $scope.configMdc.signalId,
                signalName : signalName
            };
            if($scope.cabinet.otherEvent == undefined)
                $scope.cabinet.otherEvent = [];
            $scope.cabinet.otherEvent.push(cfg);
            bindEventDialog.hide();
        };

        $scope.addDeviceClick = function(){
            $scope.configMdc.deviceName = undefined;
            addCabinetDeviceDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/addCabinetDevice.html',
                show: false
            });
            addCabinetDeviceDialog.$promise.then(addCabinetDeviceDialog.show);
            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                $scope.configMdc.devices = parseGetCabinetDevice(data);
                $scope.configMdc.deviceId = $scope.configMdc.devices[0].id;
            });
            countStartBit();
            $scope.configMdc.UIndex = parseInt($scope.configMdc.indexStart);
            $scope.configMdc.UHeight = parseInt($scope.configMdc.cabinetUHeight) - parseInt($scope.configMdc.useHeight);
        };

        function parseGetCabinetDevice(data){
            if($scope.cabinet.equipment){
                $scope.cabinet.equipment.forEach(function(item){
                    data.forEach(function(i){
                        if(item.id == i.id)
                            data.splice($.inArray(i,data),1);
                    });
                });
            }
            return data;
        };

        function countStartBit(){
            $scope.configMdc.Message = "";
            $scope.section = {
                value1 : "",
                value2 : ""
            };
            if($scope.cabinet.equipment && $scope.cabinet.equipment.length > 0){
                var max = 0,min = 999,use = 0;
                $scope.cabinet.equipment.forEach(function(item){
                    var space = item.space.indexOf(",") == -1 ? "[0,0]" : item.space;
                    var x = space.indexOf(",");
                    var y = space.indexOf("]");
                    var s = parseInt(space.substring(x+1,y));
                    if(s > max) max = s;
                    var q = parseInt(space.substring(1,x));
                    if(q < min) min = q;
                    use += (s - q);
                });
                $scope.configMdc.indexStart = max;
                $scope.configMdc.useHeight = use;
            }else{
                $scope.configMdc.indexStart = 0;
                $scope.configMdc.useHeight = 0;
            }
            if($scope.configMdc.indexStart > $scope.configMdc.cabinetUHeight){
                $scope.configMdc.indexStart = $scope.configMdc.cabinetUHeight
            }
            if(parseInt($scope.configMdc.indexStart) <= (parseInt($scope.configMdc.cabinetUHeight) - 1))
                $scope.section.value2 = "["+parseInt($scope.configMdc.indexStart)+","+parseInt(parseInt($scope.configMdc.cabinetUHeight) - 1)+"]";

            if(min > 0 && min < 999){
                $scope.section.value1 = "[0,"+(min-1)+"]";
                $scope.configMdc.indexStart = 0;
            }
        };

        function verdictSection(value){
            var meet = false;
            var start = parseInt($scope.configMdc.UIndex);
            var end = parseInt($scope.configMdc.UHeight);
            var index = value.indexOf(",");//[0,10]  [20,41]
            var min = parseInt(value.substring(1,index));
            var max = parseInt(value.substring(index+1,value.length-1)) + 1;
            var val = (max - min - (start - min));//剩余空间
            if(start >= min && end <= val)
                meet = true;
            return meet;
        }

        $scope.addCabinetDevice = function(){
            if(parseInt($scope.configMdc.UHeight) >= 0){
                var MaxUHeight = parseInt($scope.configMdc.cabinetUHeight);
                var start = parseInt($scope.configMdc.UIndex);
                var end = parseInt($scope.configMdc.UHeight);
                var meet = false;
                if($scope.section.value1 != ""){
                    meet = verdictSection($scope.section.value1);
                }
                if(meet == false && $scope.section.value2 != ""){
                    meet = verdictSection($scope.section.value2);
                }
                if(meet == false){
                    var is = false;
                    if($scope.cabinet.equipment){
                        $scope.cabinet.equipment.forEach(function(item){
                            var index = item.space.indexOf(",");
                            var min = parseInt(item.space.substring(1,index));
                            var max = parseInt(item.space.substring(index+1,item.space.length-1));
                            if(start >= min && start < max)//当前开始U位 在已添加的设备取值范围
                                is = true;
                            if((start + end) > min && (start + end) < max)//当前设备取值范围 在已添加的设备取值范围
                                is = true;
                        });
                    }
                    var use = MaxUHeight - $scope.configMdc.useHeight;
                    if(is == false && end <= use)//U高小于剩余空间
                        meet = true;
                }
                if(meet == false){
                    balert.show('danger',$scope.languageJson.MDC.Starting.Title,3000);/*"开始U位和设备U高不符合取值区间！"*/
                    return;
                }
                if((start + end) > MaxUHeight){
                    balert.show('danger',$scope.languageJson.MDC.Starting.Start,3000);/*"开始U位加设备U高不能超过机柜高度！"*/
                    return;
                }
                if(start < 0){
                    balert.show('danger',$scope.languageJson.MDC.Starting.Negative,3000);/*"开始U位不能为负数！"*/
                    return;
                }
            }else{
                balert.show('danger',$scope.languageJson.MDC.Starting.Nega,3000);/*"设备U高不能为负数！"*/
                return;
            }

            if($scope.configMdc.deviceId == "" && ($scope.configMdc.deviceName == undefined || $scope.configMdc.deviceName == "")){
                balert.show('danger',$scope.languageJson.MDC.Starting.Devices,3000);/*"非监控设备，需要输入设备名称！"*/
                return;
            }
            var cfg = {};
            $scope.configMdc.UIndex =  ($scope.configMdc.UIndex == undefined || $scope.configMdc.UIndex == "")
                ? 0 : $scope.configMdc.UIndex;
            $scope.configMdc.UHeight = ($scope.configMdc.UHeight == undefined || $scope.configMdc.UHeight == "")
                ? 0 : $scope.configMdc.UHeight;
            cfg.index = $scope.configMdc.UIndex;
            cfg.height = $scope.configMdc.UHeight;
            if($scope.configMdc.UHeight == 0){
                cfg.space = $scope.languageJson.MDC.NoPosition;/*"不占U位";*/
            }else{
                cfg.space = "["+$scope.configMdc.UIndex+","+
                    (parseInt($scope.configMdc.UIndex)+parseInt($scope.configMdc.UHeight))+"]"
            }

            if($scope.configMdc.deviceId != ""){
                cfg.id = $scope.configMdc.deviceId;
                $scope.configMdc.devices.forEach(function(item){
                    if(item.id == $scope.configMdc.deviceId){
                        cfg.name = item.name;
                    }
                });
            }else{
                cfg.id = "";
                cfg.name = $scope.configMdc.deviceName;
            }

            if($scope.cabinet.equipment == undefined)
                $scope.cabinet.equipment = [];
            $scope.cabinet.equipment.push(cfg);
            addCabinetDeviceDialog.hide();
        };

        $scope.removeCabinetDeviceClick = function(data){
            $scope.cabinet.equipment.splice($.inArray(data,$scope.cabinet.equipment),1);
        };

        $scope.removeOtherEventClick = function(data){
            $scope.cabinet.otherEvent.splice($.inArray(data,$scope.cabinet.otherEvent),1);
        };

        $scope.addConfigMdcClick = function(){
            var type = $scope.configMdc.mdcs.type;
            if($scope.cabinet.name == undefined || $scope.cabinet.name == ""){
                balert.show('danger',$scope.languageJson.MDC.Starting.Empty,3000);/*"机柜名称不能为空！"*/
                return;
            }
            if($scope.cabinets){
                var cabinetId = $scope.cabinet.cabinetId;
                var name = $scope.cabinet.name;
                var isName = false;
                $scope.cabinets.forEach(function(item){
                    if(item.cabinetId != cabinetId && item.cabinetName == name)
                        isName = true;
                });
                if(isName){
                    balert.show('danger',$scope.languageJson.MDC.Starting.Repeated,3000);/*"机柜名称不能重复！"*/
                    return;
                }
            }


            var count1 = 0,count2 = 0,count3 = 0;
            if($scope.cabinet.phaseAVoltage != undefined && $scope.cabinet.phaseAVoltage != ""){
                count1 ++;
            }
            if($scope.cabinet.phaseACurrent != undefined && $scope.cabinet.phaseACurrent != ""){
                count1 ++;
            }
            if($scope.cabinet.phaseBVoltage != undefined && $scope.cabinet.phaseBVoltage != ""){
                count2 ++;
            }
            if($scope.cabinet.phaseBCurrent != undefined && $scope.cabinet.phaseBCurrent != ""){
                count2 ++;
            }
            if($scope.cabinet.phaseCVoltage != undefined && $scope.cabinet.phaseCVoltage != ""){
                count3 ++;
            }
            if($scope.cabinet.phaseCCurrent != undefined && $scope.cabinet.phaseCCurrent != ""){
                count3 ++;
            }
            if((count1 != 0 && count1 != 2) || (count2 != 0 && count2 !=2) || (count3 != 0 && count3 != 2)){
                balert.show('danger',$scope.languageJson.MDC.Starting.Improve,3000);/*请完善机柜电流、电压信息！"*/
                return;
            }
            //实时电压电流不为空时，额定电压电流也不能为空
            /*if(count1 > 0 || count2 > 0 || count3 > 0){
                if(parseFloat($scope.cabinet.ratedVoltage) == 0 || parseFloat($scope.cabinet.ratedCurrent) == 0){
                    balert.show('danger',"实时电压电流不为空，额定电压电流就不能为空！",3000);
                    return;
                }
            }*/
            //机柜信息
            var cabinet = $scope.cabinet;
            cabinet.cabinetNo = $scope.cabinet.cabinetId.replace(/[^0-9]/ig,'');
            cabinet.mdcId = $scope.configMdc.id;
            cabinet.cabinetNumber = $scope.configMdc.cabinetNumber;

            //机柜基本信息
            MdcConfigService.InitCabinet(cabinet,type).then(function(data){
                if(data == "ERROR"){
                    balert.show('danger',$scope.languageJson.MDC.Starting.Operation,3000);/*"操作失败！"*/
                    return;
                }
                cabinet.cabinetId = data;
                //机柜温度
                MdcConfigService.InitCabinetThermalSensors(cabinet).then(function(data){
                    $scope.temperatures = data;
                });
                //机柜设备
                MdcConfigService.UpdateCabinetDevice(cabinet).then(function(data){
                    $scope.cabinets = data;
                });
                //其他告警
                MdcConfigService.UpdateOtherEvent(cabinet).then(function(data){
                    $scope.otherEvents = data;
                });
            });

            balert.show('success',$scope.languageJson.MDC.Starting.Successful,3000);/*"操作成功！"*/
            addCabinetDialog.hide();
        };

        function addVideoClick(){
            if($scope.video.eName == "" || $scope.video.eName == undefined){
                balert.show('danger',$scope.languageJson.MDC.Starting.Name,3000);/*请输入视频设备名称！*/
                return;
            }
            if($scope.video.ipAddress == "" || $scope.video.ipAddress == undefined){
                balert.show('danger',$scope.languageJson.MDC.Starting.Address,3000);/*请输入视频设备地址！*/
                return;
            }
            if($scope.video.ePort == "" || $scope.video.ePort == undefined){
                balert.show('danger',$scope.languageJson.MDC.Starting.Port,3000);/*请输入视频设备端口号！*/
                return;
            }
            if($scope.video.eChanNum == "" || $scope.video.eChanNum == undefined){
                balert.show('danger',$scope.languageJson.MDC.Starting.Channel,3000);/*请输入视频设备频道号！*/
                return;
            }
            if($scope.video.userName == "" || $scope.video.userName == undefined){
                balert.show('danger',$scope.languageJson.MDC.Starting.User,3000);/*请输入用户名！*/
                return;
            }
            if($scope.video.userPwd == "" || $scope.video.userPwd == undefined){
                balert.show('danger',$scope.languageJson.MDC.Starting.Password,3000);/*请输入密码！*/
                return;
            }
            var req = $scope.AisleTable.Id+"|video|"+$scope.AisleTable.Rows+"|"+$scope.AisleTable.Cols+"|"+$scope.video.eId+"|"+$scope.video.eName+"|"+$scope.video.videoType+"|"+$scope.video.ipAddress+"|"+
                $scope.video.ePort+"|"+$scope.video.eChanNum+"|"+$scope.video.userName+"|"+$scope.video.userPwd+"|"+$scope.video.Number;
            MdcConfigService.SetAisleDeviceLocation(req).then(function(data){
                //initVideoCamera();
                if(data == "OK"){
                    GetAisleDeviceLocation();
                    CameraService.loadVideoEquipment().then(function(data){
                        if(data === "]" || data === undefined) return;
                        $scope.cameras = eval(data);
                    });
                    balert.show('success',$scope.languageJson.MDC.Starting.Successfully,3000);/*'修改成功！'*/
                    addVideoDialog.hide();
                }else
                    balert.show('danger',$scope.languageJson.MDC.Starting.Fail,3000);/*'修改失败！'*/
            });
        };
        //新增或者删除监控点
        function initVideoCamera(){
            var cameraArr = undefined;
            $scope.cameras.forEach(function(item){
                if(item.EquipmentId == $scope.video.eId)
                    cameraArr = item.Cameras;
            });
            var result = (cameraArr.length-$scope.video.Number);
            if(result>0){//删除监控点
                var index = cameraArr.length-1;
                for(var i=0;i<result;i++){
                    CameraService.deleteCamera(cameraArr[index].CameraId).then(function(data){});
                    index --;
                }
            }else if(result<0){//新增监控点
                for(var i=cameraArr.length;i<$scope.video.Number;i++){
                    var name = "Camera"+(i+1);
                    var charNum = i+1;
                    CameraService.saveCamera($scope.video.eId,name,charNum).then(function(data){});
                }
            }
        }

        //配置生效
        $scope.reLoadEquipmentConfigClick = function () {
            /*"请确认是否执行配置生效?"*/
            bconfirm.show($scope,$scope.languageJson.MDC.Starting.Whether).then(function(data){
                if(data){
                    $scope.loading = true;
                    MdcAlarmService.ReLoadMdcConfig().then(function(data){
                        balert.show('success',$scope.languageJson.MDC.Starting.Configuration,3000);/*'执行配置生效成功！'*/
                        $scope.loading = false;
                    });
                }
            });
        };

        /**************************************** 资产信息 Start *****************************************/
        $scope.showAssetClick = function(){
            $scope.CabinetAsset = {};
            var date = new Date();
            $scope.CabinetAsset.date = date.getFullYear() + "-" +  (date.getMonth() + 1) + "-" +  date.getDate() +
                " "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

            $scope.CabinetAsset.cabinetId = $scope.cabinet.cabinetId.replace(/[^0-9]/ig,'');
            $scope.CabinetAsset.mdcId = sessionStorage.getItem("MdcId");

            showAssetDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/showAssetInfo.html',
                show: false
            });
            showAssetDialog.$promise.then(showAssetDialog.show);
            employeeService.getAllEmployees().then(function(data){
                $scope.employees = data;
                MdcConfigService.GetCabinetAssetInfo($scope.CabinetAsset.cabinetId,$scope.CabinetAsset.mdcId).then(function(data){
                    if(data){
                        $scope.CabinetAsset = data;
                    }
                });
            });
        };

        $scope.assetSave = function(){
            var regTime = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/;
            if(!isNaN($scope.CabinetAsset.date))//时间类型换为字符串类型
                $scope.CabinetAsset.date = $scope.CabinetAsset.date.getFromFormat('yyyy-mm-dd hh:ii:ss');

            if(!regTime.test($scope.CabinetAsset.date)){
                balert.show('danger','时间格式不正确，请重新输入！',3000);
                return;
            }
            MdcConfigService.UpdateCabinetAsset($scope.CabinetAsset).then(function(data){
                if(data == "OK"){
                    balert.show('success','保存成功！',3000);
                    showAssetDialog.hide();
                }else{
                    balert.show('danger','保存失败，请重新输入！',3000);
                }
            });
        };
        /**************************************** 资产信息 End *******************************************/
        $scope.hideDivClick = function(id,$event){
            var event = $($event.target).children("i");
            var dom = $('#'+id);
            var dis = dom.css('display');
            if(dis == 'block'){
                dom.hide();
                event.removeClass("fa-chevron-down");
                event.addClass("fa-chevron-right");
            }else{
                dom.show();
                event.removeClass("fa-chevron-right");
                event.addClass("fa-chevron-down");
            }
        };

        /**************************************** 通道设备添加控制 Start *****************************************/
        var controlDlg = $modal({
            scope:$scope,
            templateUrl:'partials/settingMdcControl.html',
            show:false
        });
        $scope.settingMdcControl = function(name){
            $scope.control = {
                controlName : name
            };
            MdcConfigService.GetMdcControlByName("",name).then(function(datas){
                if(datas.length > 0){
                    $scope.control = parseMdcControl(datas);
                }

                equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                    $scope.control.devices = data;
                });
            });
            controlDlg.$promise.then(controlDlg.show);
        };

        function parseMdcControl(data){
            var cfg = {
                controlName : data[0].controlName,
                deviceId : data[0].equipmentId,
                baseTypeId : data[0].baseTypeId,
                value : data[0].parameterValues,
                password : data[0].password
            };
            baseTypeService.getAllControlBaseDevice(cfg.deviceId,0).then(function(data){
                $scope.control.controls = data;
                if(data){
                    var con = {};
                    data.forEach(function(item){
                        if(item.BaseTypeId == cfg.baseTypeId)
                            con = item;
                    });
                    $scope.changeControlControl(cfg.deviceId,con);
                }
            });

            if(cfg.password != undefined && cfg.password != "")
                cfg.isControlCheck = true;

            return cfg;
        }

        //根据设备加载控制列表
        $scope.changeControlDevice = function(deviceId){
            baseTypeService.getAllControlBaseDevice(deviceId,0).then(function(data){
                $scope.control.controls = data;
                $scope.control.value = undefined;
            });
        };

        //根据控制加载控制值
        $scope.changeControlControl = function(deviceId,data){
            var control = angular.fromJson(data);
            $scope.control.baseTypeId = control.BaseTypeId;
            $scope.control.CommandType = control.CommandType;

            if(control.CommandType == 1){
                $scope.control.prompt = "["+control.MinValue+","+control.MaxValue+"]";
            }else if(control.CommandType == 2){
                baseTypeService.getControlTypeBaseTypeId(deviceId+"|"+control.BaseTypeId).then(function(data){
                    $scope.control.values = data;
                });
            }
        };

        $scope.getCheckbox = function(visible){
            if(visible == true || visible == 'true')
                return "√";
            else
                return "X";
        };

        $scope.saveMdcControl = function(){
            if($scope.control.value == undefined || $scope.control.value == ""){
                /* 请选择控制！ */
                balert.show('danger',$scope.languageJson.MDC.ControlBox.SelectPrompt,3000);
                return;
            }
            if($scope.control.isControlCheck == true &&
                ($scope.control.password == undefined || $scope.control.password == "")){
                /* 请输入密码！ */
                balert.show('danger',$scope.languageJson.MDC.ControlBox.PasswordPrompt,3000);
                return;
            }

            if($scope.control.isControlCheck == false)
                $scope.control.password = "";

            MdcConfigService.SettingMdcControl("",$scope.control.controlName,$scope.control.deviceId,
                $scope.control.baseTypeId,$scope.control.value,$scope.control.password).then(function(data){
                balert.show('success',$scope.languageJson.MDC.ControlBox.SuccessPrompt,3000);
                controlDlg.hide();
            });
        };

        $scope.deleteMdcControl = function(name){
            MdcConfigService.RemoveMdcControl("",name).then(function(data){});
        };
        /**************************************** 通道设备添加控制 End ****************************************/
}]);

/********************************************资产管理 Start ********************************************/
nurseController.controller('assetsManagerCtrl',['$scope','$rootScope' , '$http','$modal','balert','equipmentService','assetsManagerService','Exporter','base64','bconfirm',
    function($scope,$rootScope ,$http,$modal,balert,equipmentService,assetsManagerService,Exporter,base64,bconfirm) {
        $scope.allEquipmentList = {};
        $scope.assetsId = {};

        //分页对象定义
        $scope.filter = {};
        $scope.assetsManagerData = {
            currentPage:1,
            itemsPerPage:10,
            pagesLength:10,
            totalItems:0,
            list:[],
            perPageOptions:[10, 20, 30, 40, 50],
            onChange:function(newValue,oldValue){
                if(newValue == undefined) return;
                var index = ($scope.assetsManagerData.currentPage - 1) * $scope.assetsManagerData.itemsPerPage;
                var size = $scope.assetsManagerData.itemsPerPage;
                var param = $scope.filter.assetsCode+'&'+$scope.filter.assetsName+'&'+$scope.filter.assetType+'&'+$scope.filter.assetStyle+'&'+$scope.filter.equipmentId+
                    '&'+$scope.filter.vendor+'&'+$scope.filter.usedDate+'&'+$scope.filter.responsible+'&'+$scope.filter.position+'&'+$scope.filter.status;
                param = param.replace(/undefined/g,"");
                assetsManagerService.LikeLimitAssetsInfo(index,size,param).then(function(data){
                    $scope.assetsManagerData.list = convertNumber2CN(data);
                });
                assetsManagerService.GetLikeAssetsTotals(param).then(function(data){
                    $scope.assetsManagerData.totalItems = data;
                    $rootScope.$emit('resultTotal',{});
                });
            }
        };
        function selectFunction(){
            $scope.assetsManagerData.onChange("","");
        };

        $(function(){
            equipmentService.getAllEquipment().then(function(data){
                if(data.length != 0){
                    $scope.allEquipmentList = data;

                    $scope.assetsManagerData.onChange();
                }
            });
            //MDC的U高
            assetsManagerService.selectCabinetUHeightByName().then(function(retData){
                $scope.mdcUheight = retData;
            });
            //机柜列表
            assetsManagerService.getCabinetInfo().then(function(item){
                $scope.cabinetInfo = item;
            });

            $scope.Test = {};
            $scope.Test.show = function(){
                return "Hello Word!";
            };
        });

        var addAssetsManagerClickDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/addAssetsManager.html',
            show: false
        });
        var uPositionClickDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/uPosition.html',
            show: false
        });
        var editAssetsManagerClickDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/editAssetsManager.html',
            show: false
        });
        $scope.addAssetsManagerClick = function(){
            $scope.addAssetsRowData = {
                assetType : "动环设备",
                equipmentId : "",
                status : "上架",
                position : "",
                usedDate : new Date()
            };
            addAssetsManagerClickDialog.$promise.then(addAssetsManagerClickDialog.show);
        };
        $scope.bindPosition = function(obj,position){
            $scope.cab = {
                obj : obj,
                cabName : "",
                UIndex : "0",
                UHeight : "42"
            };
            if(position != undefined && position.indexOf(" ") != -1 && position.indexOf("[") != -1 && position.indexOf("]") != -1 && position.indexOf("-")!=-1){
                var temp = position.split(" ");
                if(/\[\d+-\d+\]/.test(temp[2])){
                    var uTemp = temp[2].split("-");
                    var ustart = parseInt(uTemp[0].match(/\d+/)[0]);
                    var uheight = parseInt(uTemp[1].match(/\d+/)[0]);
                    $scope.cab.UIndex = ustart;
                    $scope.cab.UHeight = uheight - ustart;
                    $scope.cab.cabName = temp[0];
                }
            }
            uPositionClickDialog.$promise.then(uPositionClickDialog.show);
        };
        $scope.changeEquipment = function(changeFlag,data){
            $scope.allEquipmentList.forEach(function(equipmentItem){
                if("add" === changeFlag){
                    if(equipmentItem.EquipmentId === data){
                        $scope.addAssetsRowData.assetsName = equipmentItem.EquipmentName;
                        $scope.addAssetsRowData.vendor = equipmentItem.Vendor;
                        $scope.addAssetsRowData.EquipmentStyle = equipmentItem.assetStyle;
                    }else {
                        if(data == ""){
                            $scope.addAssetsRowData.assetsName = "";
                            $scope.addAssetsRowData.vendor = "";
                            $scope.addAssetsRowData.EquipmentStyle ="";
                        }
                    }
                }else{
                    if(equipmentItem.EquipmentId === data){
                        $scope.editAssetsRowData.assetsName = equipmentItem.EquipmentName;
                        $scope.editAssetsRowData.vendor = equipmentItem.Vendor;
                        $scope.editAssetsRowData.EquipmentStyle = equipmentItem.assetStyle;
                    }else {
                        if(data == ""){
                            $scope.editAssetsRowData.assetsName = "";
                            $scope.editAssetsRowData.vendor = "";
                            $scope.editAssetsRowData.EquipmentStyle ="";
                        }
                    }
                }
            })
        };
        $scope.saveAddAssetsManagerClick = function(){
            var prompt = $scope.languageJson.AssetBox.Prompt;
            if($scope.addAssetsRowData.assetsCode == undefined || $scope.addAssetsRowData.assetsCode == ""){
                balert.show("danger", prompt.AssetCodeEmpty, 3000);/*"资产编码不能为空！"*/
                return;
            }

            var is = false;
            $scope.assetsManagerData.list.forEach(function(item){
                if(item.assetsId != $scope.addAssetsRowData.assetsId && item.assetsCode == $scope.addAssetsRowData.assetsCode){
                    balert.show("danger", prompt.AssetCodeRepeated, 3000);/*"资产编码不能重复！"*/
                    is = true;
                }
            });
            if(is) return;

            if($scope.addAssetsRowData.assetsName == undefined || $scope.addAssetsRowData.assetsName == ""){
                balert.show("danger", prompt.AssetNameEmpty, 3000);/*"资产名称不能为空！"*/
                return;
            }
            var temp = filterAssetsData($scope.addAssetsRowData);
            assetsManagerService.addNewAssets(temp).then(function (retData) {
                if ("addAssetsInfo Error" === retData) {
                    balert.show("danger", prompt.Failure, 3000);/*"增加失败"*/
                }else if("getOneCode" === retData){
                    balert.show("danger", prompt.AssetCodeExists, 3000);/*"资产编码已存在,请重新填写"*/
                }else{
                    $scope.assetsManagerData.onChange();
                    balert.show("success", prompt.Success, 3000);/*"增加成功！"*/
                    selectFunction();
                    addAssetsManagerClickDialog.hide();
                }
            });
        };
        $scope.importMDCAssetsClick = function(){
            assetsManagerService.importMDCAssets().then(function (retData) {
                if(retData.length > 0){
                    $scope.assetsManagerData.onChange("1 10 {}",undefined);
                    //$scope.assetsManagerData.list = convertNumber2CN(retData);
                    //"导入成功！"
                    balert.show("success", $scope.languageJson.AssetPage.Prompt.Success, 2500);
                }
            })
        };
        $scope.exportToHtml = function() {
            assetsManagerService.loadAllAssetsInfo().then(function(data){
                Exporter.toXls(getExportList(convertNumber2CN(data)));
            });
        };
        $scope.editAssetsManagerClick = function(data){
            $scope.editAssetsRowData = data;
            editAssetsManagerClickDialog.$promise.then(editAssetsManagerClickDialog.show);
        };
        $scope.saveBindPosition = function(){
            var prompt = $scope.languageJson.UPositionBox.Prompt;

            if($scope.cab.cabName == undefined || $scope.cab.cabName == ""){
                balert.show("danger",prompt.PleaseSelect,3000);/*"请选择设备在那个机柜！"*/
                return;
            }
            if(isNaN($scope.cab.UIndex) || parseInt($scope.cab.UIndex) < 0 || parseInt($scope.cab.UIndex) > $scope.mdcUheight){
                balert.show("danger",prompt.UStartNotLegal,3000);/*"开始U位不合法！"*/
                return;
            }
            if(isNaN($scope.cab.UHeight) || parseInt($scope.cab.UHeight) < 1 || (parseInt($scope.cab.UIndex)+parseInt($scope.cab.UHeight)) > parseInt($scope.mdcUheight)){
                balert.show("danger",prompt.UHeightNotLegal,3000);/*"U高不合法！"*/
                return;
            }
            var cont = $scope.cab.cabName +" U:["+$scope.cab.UIndex+"-"+
                (parseInt($scope.cab.UIndex)+parseInt($scope.cab.UHeight))+"]";
            eval("$scope."+$scope.cab.obj+" = cont");
            uPositionClickDialog.hide();
        };
        $scope.saveEditAssetsManagerClick = function(){
            var prompt = $scope.languageJson.AssetBox.Prompt;
            if($scope.editAssetsRowData.assetsCode == undefined || $scope.editAssetsRowData.assetsCode == ""){
                balert.show("danger", prompt.AssetCodeEmpty, 3000);/*"资产编码不能为空！"*/
                return;
            }

            var is = false;
            $scope.assetsManagerData.list.forEach(function(item){
                if(item.assetsId != $scope.editAssetsRowData.assetsId && item.assetsCode == $scope.editAssetsRowData.assetsCode){
                    balert.show("danger", prompt.AssetCodeRepeated, 3000);/*"资产编码不能重复！"*/
                    is = true;
                }
            });
            if(is) return;

            if($scope.editAssetsRowData.assetsName == undefined || $scope.editAssetsRowData.assetsName == ""){
                balert.show("danger", prompt.AssetNameEmpty, 3000);/*"资产名称不能为空！"*/
                return;
            }
            /*if($scope.editAssetsRowData.position == undefined || $scope.editAssetsRowData.position == ""){
                balert.show("danger", prompt."设备位置不能为空！", 3000);
                return;
            }*/
            var temp = filterAssetsData($scope.editAssetsRowData);
            assetsManagerService.editAssetsData(temp).then(function (retData) {
                if ("editAssets Error" === retData) {
                    balert.show("danger", prompt.Failure, 3000);/*"修改失败"*/
                } else if("getOtherCode" === retData){
                    balert.show("danger", prompt.AssetCodeExists, 3000);/*"资产编码已存在,请重新填写"*/
                }else{
                    $scope.assetsManagerData.onChange();
                    balert.show("success", prompt.Success, 2500);/*"修改成功"*/
                    selectFunction();
                    editAssetsManagerClickDialog.hide();
                }
            });
        };
        $scope.removeAssetsManagerClick = function(id){
            var prompt = $scope.languageJson.AssetPage.Prompt;
            //"确定删除此条资产信息吗？"
            bconfirm.show($scope,prompt.DeletePrompt).then(function(data){
                if(data){
                    assetsManagerService.delAssets(id).then(function(data){
                        if("delAssetsByAssetsId Error" !== data){
                            $scope.assetsManagerData.onChange();
                            balert.show("success",prompt.DeleteSuccess,2500);//"删除成功"
                            selectFunction();
                        }else{
                            //"此资产信息无法删除或系统无法找到此资产信息"
                            balert.show("danger",prompt.UnablePrompt,3000);
                        }
                    })
                }
            });
        };
        function getExportList(data) {

            var resArray = [];

            var asset = $scope.languageJson.AssetPage.AssetList;
            resArray.push({
                assetsCode : asset.AssetCode,
                assetsName : asset.AssetName,
                assetType:asset.AssetType,
                assetStyle:asset.AssetStyle,
                equipmentName:asset.Device,
                vendor:asset.Vendor,
                usedDate:asset.UsedDate,
                responsible:asset.Responsible,
                position:asset.Position,
                status:asset.Status
            });/*"资产编码" / "资产名称" / "资产类型" / "资产型号" / "设备" / "资产厂家"
                / "投产时间" / "联系人" / "位置" / "状态"*/

            var status = $scope.languageJson.AssetBox.Status;
            data.forEach(function(element, index) {
                var assets = {};
                assets.assetsCode = element.assetsCode;
                assets.assetsName = element.assetsName;
                assets.assetType = element.assetType;
                assets.assetStyle=element.assetStyle;
                assets.equipmentName=element.equipmentName == undefined ? "" : element.equipmentName;
                assets.vendor=element.vendor;
                assets.usedDate=element.usedDate;
                assets.responsible=element.responsible;
                assets.position=element.position;
                if(element.status == 1) assets.status = status.Putaway;/*"上架"*/
                else assets.status = status.Demolition;/*"下架"*/
                resArray.push(assets);
            });

            return resArray;
        };
        function convertNumber2CN(data){
            if($scope.languageJson == undefined)
                $scope.languageJson =  angular.fromJson(sessionStorage.getItem("languageJson"));

            var status = $scope.languageJson.AssetBox.Status;
            data.forEach(function(item){
                if(JSON.stringify($scope.allEquipmentList) !== "{}"){
                    $scope.allEquipmentList.forEach(function(equipmentItem){
                        if(item.equipmentId === equipmentItem.EquipmentId){
                            item.equipmentName = equipmentItem.EquipmentName;
                        }
                    });
                }
                if(item.status == 1) item.statusMeaning = status.Putaway;/*"上架"*/
                else item.statusMeaning = status.Demolition;/*"下架"*/
            });
            return data;
        };
        function filterAssetsData(data){
            var result = base64.encode(new Date(data.usedDate).getFromFormat('yyyy-mm-dd hh:ii:ss'))+"|"+
                data.assetType+"|"+data.assetStyle+"|"+data.equipmentId+"|"+data.vendor+"|"+
                data.status+"|"+data.responsible+"|"+data.description+"|"+data.assetsId+"|"+
                data.assetsName+"|"+base64.encode(data.position)+"|"+base64.encode(data.assetsCode);
            return base64.encode(result);
        };
    }
]);
/********************************************资产管理 End ********************************************/

nurseController.controller('AlarmLinkageCtrl',['$scope', '$http', '$interval','$compile','$modal','AlarmLinkageService','TemplateService','equipmentTemplateService','baseTypeService','balert','stationService','equipmentService','bconfirm',
    function($scope, $http, $interval,$compile,$modal,AlarmLinkageService,TemplateService,equipmentTemplateService,baseTypeService,balert,stationService,equipmentService,bconfirm){
        var addAlarmLinkageDialog = null,updAlarmLinkageDialog = null;
        $scope.AlarmLinkage = {};

        $(function(){

            AlarmLinkageService.GetAllAlarmLinkage().then(function(list){
                TemplateService.GetDataItemByEntryId('101').then(function(data){
                    $scope.TriggerTypes = data;
                    $scope.AlarmLinkages = fromAlarmLinkages(list);
                });
            });

            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data) {
                $scope.Devices = data;
            });

            stationService.getStationInfo().then(function(data){
                $scope.Stations = data;
            });
        });

        var by = function(name){
            return function(o, p){
                var a, b;
                if (typeof o === "object" && typeof p === "object" && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return 0;
                    }
                    if (typeof a === typeof b) {
                        return a < b ? -1 : 1;
                    }
                    return typeof a < typeof b ? -1 : 1;
                }
            }
        };

        function fromAlarmLinkages(data){
            data.forEach(function(item){
                var actionList = "";
                if(item.controlLogActions){
                    item.controlLogActions.sort(by("actionId"));
                    item.controlLogActions.forEach(function(cla){
                        if(actionList == "")
                            actionList = cla.actionId;
                        else
                            actionList += "/"+cla.actionId;
                    });
                    item.actionList = actionList;
                }
                $scope.TriggerTypes.forEach(function(tt){
                    if(item.triggerType == tt.ItemId){
                        item.triggerTypeName = tt.ItemValue;
                    }
                });
            });
            return data;
        };

        //新增按钮
        $scope.addAlarmLinkageClick = function(){
            if($scope.Devices && $scope.Devices.length > 0){
                $scope.AlarmLinkage = {
                    actionName : "",
                    triggerType : $scope.TriggerTypes[0].ItemId,
                    devicesId : $scope.Devices[0].id,
                    claDevicesId : $scope.Devices[0].id,
                    startExpression : "",
                    controlLogActions : [],
                    description : "",
                    listType : 0
                };
                $scope.changeDevice($scope.Devices[0].id);
                $scope.changeDeviceTemplate($scope.Devices[0].id);
            }
            addAlarmLinkageDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/addAlarmLinkage.html',
                show: false
            });
            addAlarmLinkageDialog.$promise.then(addAlarmLinkageDialog.show);
        };

        $scope.changeDevice = function(id) {
            if($scope.AlarmLinkage.listType == 0 || $scope.AlarmLinkage.listType == undefined){
                baseTypeService.GetSinalByEquipmentId(id).then(function(data) {
                    $scope.Signals = data;
                });
                $scope.AlarmLinkage.signalId = undefined;
            }else{
                AlarmLinkageService.GetEventExperByETId(id).then(function(data){
                    $scope.Events = data;
                });
                $scope.AlarmLinkage.eventId = undefined;
            }
        };

        $scope.changeListType = function(type){
            if(type == 0){
                baseTypeService.GetSinalByEquipmentId($scope.AlarmLinkage.devicesId).then(function(data) {
                    $scope.Signals = data;
                });
                $scope.AlarmLinkage.signalId = undefined;
            }else{
                AlarmLinkageService.GetEventExperByETId($scope.AlarmLinkage.devicesId).then(function(data){
                    $scope.Events = data;
                });
                $scope.AlarmLinkage.Value = undefined;
            }
        };

        $scope.changeSignal = function(i,id){
            $scope.Signals.forEach(function(item){
                if(item.signalId == id){
                    var symbol = "["+$scope.AlarmLinkage.devicesId+","+id+"]";
                    $scope.ClickLi(i,symbol);
                }
            });
        };

        $scope.changeEvent = function(id,value){
            if(value != undefined || value != ""){
                var obj = angular.fromJson(value);
                var symbol = "{"+obj.EquipmentId+","+obj.EventId+","+obj.EventConditionId+"}";
                $scope.ClickLi(id,symbol);
            }
        };

        $scope.ClickLi = function(id,symbol){
            if($scope.AlarmLinkage.startExpression == undefined)
                $scope.AlarmLinkage.startExpression = "";

            var textDom = document.getElementById(id);
            var addStr = symbol;

            if (textDom.selectionStart || textDom.selectionStart == '0') {
                $scope.AlarmLinkage.startExpression = $scope.AlarmLinkage.startExpression.substring(0,$scope.startPos)+addStr+
                    $scope.AlarmLinkage.startExpression.substring($scope.endPos);
                textDom.focus();
                textDom.selectionStart = $scope.startPos + addStr.length;
                textDom.selectionEnd = $scope.startPos + addStr.length;
                textDom.scrollTop = $scope.scrollTop;
            }else {
                $scope.AlarmLinkage.startExpression += addStr;
                textDom.focus();
            }
        };

        $scope.changeDeviceTemplate = function(id){
            $scope.AllControlMeanings = [];
            $scope.Controls = [];
            $scope.ControlMeanings = [];
            $scope.ControlValue = "";
            var TemplateId = 0;
            $scope.Devices.forEach(function(item){
                if(item.id == id) TemplateId = item.equipmentTemplateId;
            });
            TemplateService.GetRemoteControlByEquipmentTemplateId(TemplateId).then(function(data){
                $scope.Controls = data;
                if($scope.Controls.length >0 ){
                    $scope.AlarmLinkage.control = $scope.Controls[0];
                    TemplateService.GetControlMeaningsByEquipmentTemplateId(TemplateId).then(function(data){
                        $scope.AllControlMeanings = data;
                        $scope.changeControl($scope.Controls[0]);
                    });
                }
            });
            $scope.AlarmLinkage.controlValue = undefined;
        };

        $scope.changeControl = function(data){
            var con = angular.fromJson(data);
            if(con.CommandType == 2){
                var obj = [];
                $scope.AllControlMeanings.forEach(function(item){
                    if(item.ControlId == con.ControlId)
                        obj.push(item);
                });
                $scope.ControlMeanings = obj;
            }else{
                $scope.MaxValue = con.MaxValue;
                $scope.MinValue = con.MinValue;
            }
            $scope.CommandType = con.CommandType;
            $scope.AlarmLinkage.controlValue = undefined;
        };

        //添加遥控到控制列表
        $scope.changeControlValue = function(id){
            if(id == undefined) return;
            if($scope.AlarmLinkage.controlLogActions == undefined || $scope.AlarmLinkage.controlLogActions == "")
                $scope.AlarmLinkage.controlLogActions = [];
            var fig = {};
            $scope.Devices.forEach(function(item){
                if(item.id == $scope.AlarmLinkage.claDevicesId){
                    fig.equipmentId = item.id;
                    fig.equipmentName = item.name;
                }
            });
            $scope.Controls.forEach(function(item){
                var con = angular.fromJson($scope.AlarmLinkage.control);
                if(item.ControlId == con.ControlId){
                    fig.controlId = item.ControlId;
                    fig.controlName = item.ControlName;
                }
            });
            $scope.ControlMeanings.forEach(function(item){
                if(item.ParameterValue == id){
                    fig.actionValue = item.ParameterValue;
                    fig.actionMeanings = item.Meanings;
                }
            });
            var is = false;
            $scope.AlarmLinkage.controlLogActions.forEach(function(item){
                if(item.equipmentId == fig.equipmentId && item.controlId == fig.controlId &&
                    item.actionValue == fig.actionValue) is = true;
            });
            if(!is)
                $scope.AlarmLinkage.controlLogActions.push(fig);
        };

        //添加遥调到控制列表
        $scope.addControlValue = function(controlValue){
            var prompt = $scope.languageJson.Linkage.Prompt;
            if(controlValue == undefined || controlValue == ""){
                balert.show('danger',prompt.NotControlValue,3000);/*"控制值不能为空！"*/
                return;
            }
            if(!(parseFloat(controlValue) >= parseFloat($scope.MinValue) && parseFloat(controlValue) <= parseFloat($scope.MaxValue))){
                /*控制值的取值范围是*/
                balert.show('danger',prompt.ControlValueRange+":["+$scope.MinValue+"-"+$scope.MaxValue+"]",3000);
                return;
            }
            if($scope.AlarmLinkage.controlLogActions == undefined || $scope.AlarmLinkage.controlLogActions == "")
                $scope.AlarmLinkage.controlLogActions = [];
            var fig = {};
            $scope.Devices.forEach(function(item){
                if(item.id == $scope.AlarmLinkage.claDevicesId){
                    fig.equipmentId = item.id;
                    fig.equipmentName = item.name;
                }
            });
            $scope.Controls.forEach(function(item){
                var con = angular.fromJson($scope.AlarmLinkage.control);
                if(item.ControlId == con.ControlId){
                    fig.controlId = item.ControlId;
                    fig.controlName = item.ControlName;
                }
            });
            fig.actionValue = controlValue;
            fig.actionMeanings = controlValue;

            var is = false;
            $scope.AlarmLinkage.controlLogActions.forEach(function(item){
                if(item.equipmentId == fig.equipmentId && item.controlId == fig.controlId &&
                    item.actionValue == fig.actionValue) is = true;
            });
            if(!is)
                $scope.AlarmLinkage.controlLogActions.push(fig);
        };

        $scope.deleteMeaningsClick = function($index){
            $scope.AlarmLinkage.controlLogActions.splice($index,1);
        };

        $scope.addAlarmLinkage = function(){
            if($scope.AlarmLinkage.actionName == undefined || $scope.AlarmLinkage.actionName == ""){
                balert.show('danger',$scope.languageJson.Linkage.Alarm.Empty,3000);/*告警联动名称不能为空！*/
                return;
            }
            if($scope.AlarmLinkage.startExpression == undefined || $scope.AlarmLinkage.startExpression == ""){
                balert.show('danger',$scope.languageJson.Linkage.Alarm.Expre,3000);/*触发表达式不能为空！*/
                return;
            }
            AlarmLinkageService.InsertAlarmLinkage($scope.AlarmLinkage).then(function(data){
                if(data == "OK"){
                    AlarmLinkageService.GetAllAlarmLinkage().then(function(list){
                        TemplateService.GetDataItemByEntryId('101').then(function(data){
                            $scope.TriggerTypes = data;
                            $scope.AlarmLinkages = fromAlarmLinkages(list);
                        });
                    });
                    balert.show('success',$scope.languageJson.Linkage.Alarm.Ifs,3000);/*新增成功,点击“配置生效”启动！*/
                    addAlarmLinkageDialog.hide();
                }else
                    balert.show('danger',$scope.languageJson.Linkage.Alarm.News,3000);/*新增失败！*/
            });
        };

        //查询按钮
        $scope.updateAlarmLinkageClick = function(data){
            $scope.AlarmLinkage = fromUpdAlarmLinkage(data);
            $scope.AlarmLinkage.devicesId = $scope.Devices[0].id;
            $scope.AlarmLinkage.claDevicesId = $scope.Devices[0].id;
            $scope.AlarmLinkage.listType = 0;
            $scope.changeDevice($scope.Devices[0].id);
            $scope.changeDeviceTemplate($scope.Devices[0].id);
            updAlarmLinkageDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/updAlarmLinkage.html',
                show: false
            });
            updAlarmLinkageDialog.$promise.then(updAlarmLinkageDialog.show);
        };

        function fromUpdAlarmLinkage(datas){
            if(datas.controlLogActions == undefined || datas.controlLogActions == "") return datas;
            datas.controlLogActions.forEach(function(cla){
                var TemplateId = 0;
                if($scope.Devices)
                    $scope.Devices.forEach(function(item){
                        if(item.id == cla.equipmentId){
                            cla.equipmentName = item.name;
                            TemplateId = item.equipmentTemplateId;
                        }
                    });

                TemplateService.GetControlByEquipmentTemplateId(TemplateId).then(function(data){
                    $scope.Controls = data;
                    $scope.Controls.forEach(function(item){
                        if(item.ControlId == cla.controlId)
                            cla.controlName = item.ControlName;
                    });
                });
                TemplateService.GetControlMeaningsByEquipmentTemplateId(TemplateId).then(function(data){
                    $scope.AllControlMeanings = data;
                    $scope.AllControlMeanings.forEach(function(item){
                        if(item.ControlId == cla.controlId && item.ParameterValue == cla.actionValue)
                            cla.actionMeanings = item.Meanings;
                    });
                    if(cla.actionMeanings == undefined || cla.actionMeanings == "")
                        cla.actionMeanings = cla.actionValue;
                });
            });
            return datas;
        }

        $scope.updAlarmLinkage = function(){
            if($scope.AlarmLinkage.actionName == undefined || $scope.AlarmLinkage.actionName == ""){
                //"告警联动名称不能为空！"
                balert.show('danger',$scope.languageJson.Linkage.Alarm.Empty,3000);
                return;
            }
            if($scope.AlarmLinkage.startExpression == undefined || $scope.AlarmLinkage.startExpression == ""){
                //"触发表达式不能为空！"
                balert.show('danger',$scope.languageJson.Linkage.Alarm.Expre,3000);
                return;
            }
            AlarmLinkageService.UpdateAlarmLinkage($scope.AlarmLinkage).then(function(data){
                if(data == "OK"){
                    AlarmLinkageService.GetAllAlarmLinkage().then(function(list){
                        TemplateService.GetDataItemByEntryId('101').then(function(data){
                            $scope.TriggerTypes = data;
                            $scope.AlarmLinkages = fromAlarmLinkages(list);
                        });
                    });
                    //"修改成功,点击“配置生效”启动！"
                    balert.show('success',$scope.languageJson.Linkage.Alarm.If,3000);
                    updAlarmLinkageDialog.hide();
                }else
                    balert.show('danger',$scope.languageJson.Linkage.Alarm.Fail,3000);//"修改失败！"
            });
        };

        //删除按钮
        $scope.removeAlarmLinkageClick = function(data){
            var prompt = $scope.languageJson.Linkage.Prompt;
            AlarmLinkageService.DeleteAlarmLinkage(data.logActionId).then(function(data){
                if(data == "OK"){
                    AlarmLinkageService.GetAllAlarmLinkage().then(function(list){
                        TemplateService.GetDataItemByEntryId('101').then(function(data){
                            $scope.TriggerTypes = data;
                            $scope.AlarmLinkages = fromAlarmLinkages(list);
                        });
                    });
                    balert.show('success',prompt.Success,3000);/*"删除成功,点击“配置生效”启动！"*/
                }else
                    balert.show('danger',prompt.Failed,3000);/*"删除失败！"*/
            });
        };

        //配置生效
        $scope.reLoadEquipmentConfigClick = function () {
            /*请确认是否执行配置生效?*/
            bconfirm.show($scope,$scope.languageJson.Linkage.Alarm.Whether).then(function(data){
                if(data){
                    $scope.loading = true;
                    equipmentService.reLoadEquipment($scope.Stations[0].StationId, $scope.Stations[0].StationName).then(function(data){
                        //删除完成后，返回设备个数
                        var result = data;
                        if(result == "fail to reload equipment")
                        {
                            balert.show('danger',$scope.languageJson.Linkage.Alarm.The,3000);/*"执行配置生效失败，请检查连接是否正常！"*/
                        }
                        else
                        {
                            balert.show('success',$scope.languageJson.Linkage.Alarm.Takes,3000);/*'执行配置生效成功！'*/
                        }
                        $scope.loading = false;
                    });
                }
            });
        };

        $scope.CheckExpression = function(id){
            var textDom = document.getElementById(id);
            if (textDom.selectionStart || textDom.selectionStart == '0') {
                $scope.startPos = textDom.selectionStart;
                $scope.endPos = textDom.selectionEnd;
                $scope.scrollTop = textDom.scrollTop;
            }
        };

        $scope.ClickSignalsLi = function(symbol){
            if($scope.Signals.Expression == undefined)
                $scope.Signals.Expression = "";

            var textDom = document.getElementById("SignalExpression");
            var addStr = symbol;

            if (textDom.selectionStart || textDom.selectionStart == '0') {
                $scope.Signals.Expression = $scope.Signals.Expression.substring(0,$scope.startPos)+addStr+
                    $scope.Signals.Expression.substring($scope.endPos);
                textDom.focus();
                textDom.selectionStart = $scope.startPos + addStr.length;
                textDom.selectionEnd = $scope.startPos + addStr.length;
                textDom.scrollTop = $scope.scrollTop;
            }else {
                $scope.Signals.Expression += addStr;
                textDom.focus();
            }
        };
    }
]);


nurseController.controller('LoginCtrl',['$scope', '$http', 'LicenseService', 'uploadService', 'userService', '$modal', '$interval','languageService','SystemSetting','balert',
    function($scope, $http, LicenseService, uploadService, userService, $modal, $interval,languageService,SystemSetting,balert){

        function initCheckoutLicense(){

            var href = $(window.location).attr("href");
            if(href.indexOf("login.html") == -1){
                LicenseService.CheckoutLicense().then(function(data){
                    if(data.IsShow == false || data.IsShow == "false"){
                        $("#btnLicense").hide();
                    }else{
                        //linux系统隐藏注册按钮
                        if(window.navigator.userAgent.indexOf("Windows") == -1)
                            $("#btnLicense").hide();
                        else {
                            $("#btnLicense").show();
                            $("#btnLicense span").html(data.Remain);
                        }
                        //试用期为0天时，退出登录
                        if(data.Remain == 0){
                            $scope.LicenseExit();
                        }
                    }
                });
            }
        }

        $(function(){
            //语言切换
            languageService.GetLoginLanguageJson().then(function(data){
                $scope.languageJson = data;
                //License
                $("#btnLicense").html(data.Login.Probation);
                initCheckoutLicense();
            });


            $scope.LicenseExit = function() {
                var token = localStorage.getItem("token");
                userService.logout(token).then(function(data) {
                    if (data === "OK") {
                        $(window.location).attr("href", "login.html");
                    }
                });
            };

            $scope.show = function(){
                $("#License_Body").show();
                $scope.file = undefined;
            };

            var showLicenseBoxDialog = undefined;
            $scope.showLicenseBox = function(){
                showLicenseBoxDialog = $modal({
                    scope: $scope,
                    templateUrl: 'partials/showLicenseBox.html',
                    show: false
                });
                showLicenseBoxDialog.$promise.then(showLicenseBoxDialog.show);
            };

            $scope.hide = function(){
                $("#License_Body").hide();
            };

            $scope.generateInfo = function(){
                if($scope.languageJson == undefined)
                    $scope.languageJson = angular.fromJson(sessionStorage.getItem("languageJson"));

                LicenseService.GenerateInfoFile().then(function(data){
                    if(data == "SUCCEED"){
                        alert($scope.languageJson.Login.License.GenerateSucceed);
                    }else {
                        alert($scope.languageJson.Login.License.GenerateError);
                    }
                });
            };

            //type=file选择文件后触发的函数
            $scope.$on("fileSelected",function(event, msg) {
                    $scope.file = msg;
                });

            $scope.uploadLicense = function(){
                if($scope.languageJson == undefined)
                    $scope.languageJson = angular.fromJson(sessionStorage.getItem("languageJson"));

                if($scope.file == undefined) return;
                uploadService.uploadFile($scope.file).then(function(data) {
                    LicenseService.UploadLicenseFile(data).then(function(result){
                        if(result == "SUCCEED"){
                            alert($scope.languageJson.Login.License.Succeed);//"注册文件成功，欢迎使用！"
                            location.reload();
                        }else
                            alert($scope.languageJson.Login.License.GenerateError);//"注册文件失败！"
                    });
                });
            };
        });

        var stop,stopHeart;
        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            initCheckoutLicense();

            stop = $interval(function() {
                initCheckoutLicense();
            }, 1000*3600);

            //发送心跳包
            SystemSetting.BrowserHeartbeat("Heartbeat").then();
            stopHeart = $interval(function() {
                SystemSetting.BrowserHeartbeat("Heartbeat").then();
            }, 1000*30);
        };
        $scope.start();

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
            if (angular.isDefined(stopHeart)) {
                $interval.cancel(stopHeart);
                stopHeart = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });
    }
]);


nurseController.controller('userOperationLogCtrl',['$scope', '$rootScope', '$modal', '$filter', 'UserOperationLogService', 'Exporter','userService',
    function($scope, $rootScope, $modal, $filter, UserOperationLogService, Exporter,userService){
        //分页对象定义
        $scope.filter = {
            isQuery : false
        };
        $scope.tableParams = {
            currentPage:1,//当前页面
            itemsPerPage:10,//显示条数
            pagesLength:10,
            totalItems:0,//总条数
            hint:{
                the:$scope.languageJson.Paging.The,
                page:$scope.languageJson.Paging.Page,
                articel:$scope.languageJson.Paging.Articel,
                eachPage:$scope.languageJson.Paging.EachPage,
                total:$scope.languageJson.Paging.Total,
                noData:$scope.languageJson.Paging.NoData
            },
            list:[],//数据集
            perPageOptions:[10, 20, 30, 40, 50],//显示条数组
            onChange:function(newValue,oldValue){
                if(newValue == undefined) return;
                if($scope.filter.isQuery == false) return;
                $scope.loading = true;
                var param = $scope.filter.logonId+"|"+$scope.filter.ip+"|"+$scope.filter.content;//筛选条件
                param = param.replace(/undefined/g,"");
                var index = ($scope.tableParams.currentPage - 1) * $scope.tableParams.itemsPerPage;//开始下标
                var size = $scope.tableParams.itemsPerPage;//显示条数
                //分页查询
                UserOperationLogService.getLikeUserOperationLog(index,size,$scope.params.startDate,$scope.params.endDate,param).then(function(data){
                    $scope.tableParams.list = data;
                });
                //数据总条数
                UserOperationLogService.GetUserOperationLogTotal($scope.params.startDate,$scope.params.endDate,param).then(function(data){
                    $scope.tableParams.totalItems = data;
                    $rootScope.$emit('resultTotal',{});
                    $scope.loading = false;
                });
            }
        };

        //初始化时间
        (function() {
            $scope.params = {};
            $scope.params.startDate = new Date();
            $scope.params.endDate = new Date();

            $scope.endTime = $scope.params.endDate.getFromFormat('yyyy-mm-dd');

            userService.getAllAccount().then(function(data){
                $scope.AccountIds = [];
                if(data){
                    data.forEach(function(item){
                        if(item.userId > -2)
                            $scope.AccountIds.push(item);
                    });
                }
            });

            UserOperationLogService.GetOperationType().then(function(data){
                $scope.ContentTypes = data;
            });

            //iView 触屏控件
            if(localStorage.getItem("versions") == "IView")
                initTimeControl();
        })();

        function initTimeControl(){
            if(sessionStorage.getItem("SelectTimeType") == undefined)
                sessionStorage.setItem("SelectTimeType","Month");
            $scope.SelectTimeType = sessionStorage.getItem("SelectTimeType");

            $scope.SelectTime = {
                startDate : getAlreadyTime(30).getFromFormat('yyyy-mm-dd'),
                endDate : $scope.endTime
            };

            var calendar1 = new datePicker();
            calendar1.init({
                'trigger': '#TimeControl1', /*按钮选择器，用于触发弹出插件*/
                'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':'1970-1-1',/*最小日期*/
                'maxDate':$scope.endTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                    var theSelectData=calendar1.value;
                    $scope.params.startDate = new Date(theSelectData);
                    $scope.params.endDate = new Date($scope.SelectTime.endDate);
                    $scope.tableParams.onChange("",undefined);
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });
            var calendar2 = new datePicker();
            calendar2.init({
                'trigger': '#TimeControl2', /*按钮选择器，用于触发弹出插件*/
                'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':'1970-1-1',/*最小日期*/
                'maxDate':$scope.endTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                    var theSelectData=calendar2.value;
                    $scope.params.startDate = new Date($scope.SelectTime.startDate);
                    $scope.params.endDate = new Date(theSelectData);
                    $scope.tableParams.onChange("",undefined);
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });
        }
        $scope.changeTimeType = function(type){
            sessionStorage.setItem("SelectTimeType",type);
        };

        //查询
        $scope.query = function() {
            $scope.filter.isQuery = true;
            $scope.tableParams.onChange("",undefined);
        };

        //导出
        function getExportList(data) {
            var resArray = [];

            var table = $scope.languageJson.OperationRecord.Table;
            resArray.push({
                logonId : table.LoginName,
                ip : "IP",
                content:table.Content,
                starTime:table.Time
            });/*"登录名" / "内容" / "时间"*/

            data.forEach(function(ele, index) {
                var obj = {};
                obj.logonId = ele.logonId;
                obj.ip = ele.ip;
                obj.content = ele.content;
                obj.starTime = ele.starTime;
                resArray.push(obj);
            });

            return resArray;
        }

        $scope.exportToHtml = function() {
            UserOperationLogService.getUserOperationLog($scope.params.startDate, $scope.params.endDate).then(function(data) {
                Exporter.toXls(getExportList(data));
            });
        };

        $scope.$watch("rangeValues",function(newVal,oldVal){
            if(newVal === oldVal) return;
            //$scope.params.startDate = getAlreadyTime(newVal);
            $scope.params.startDate = getAlreadyTimeByMonth(12 - newVal);
            $scope.startTime = $scope.params.startDate.getFromFormat('yyyy-mm-dd');
            $scope.query();
        });

        function getAlreadyTime(day){
            var date = new Date();
            date.setDate(date.getDate() - day);
            return date;
        }

        function getAlreadyTimeByMonth(month){
            var date = new Date();
            date.setMonth(date.getMonth() - month);
            date.setDate(1);
            return date;
        }
    }
]);


nurseController.controller('assetRackManagerCtrl',['$scope','$rootScope' , '$http','$modal', '$interval', 'balert', 'assetRackManagerService','equipmentTemplateService','MdcAlarmService','Exporter',
    function($scope,$rootScope ,$http,$modal,$interval,balert,assetRackManagerService,equipmentTemplateService,MdcAlarmService,Exporter){
        var addCabinetRackDlg = null,updCabinetRackDlg = null,rackControlDialog = null,confirmBoxDlg = null,showRackAllAssetsDlg = null,showAssetsLogDlg = null;

        confirmBoxDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/confirmBox.html',
            show: false
        });

        $(function(){
            SelectAllRack();
            assetRackManagerService.SelectAllCabinet().then(function(data){
                $scope.cabinets = data;
            });
            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                $scope.devices = data;
            });
            assetRackManagerService.GetIpAddress().then(function(data){
                $scope.ipAddress = data;
                if(data){
                    $scope.newRack = {
                        ip : data[0].IP,
                        port : 502
                    }
                }
            });
        });

        function SelectAllRack(){
            if($scope.languageJson == undefined)
                $scope.languageJson = angular.fromJson(sessionStorage.getItem("languageJson"));
            var meaning = $scope.languageJson.AssetRackPage.AssetList.Meaning;
            assetRackManagerService.SelectAllRack().then(function(data){
                $scope.cabinetRacks = parseCabinetRacks(data);
            });
            function parseCabinetRacks(data){
                if(data){
                    data.forEach(function(item){
                        item.RackInfo = item.RackIP+":"+item.RackPort;
                        item.ServerInfo = item.ServerIP+":"+item.ServerPort;
                        if(item.Status == 0) item.StatusMeaning = meaning.Connecting;/*"连接ing..."*/
                        else if(item.Status == 1) item.StatusMeaning = meaning.Normal;/*"正常"*/
                        else if(item.Status == 4) item.StatusMeaning = meaning.Stop;/*"关闭监听"*/
                        else item.StatusMeaning = meaning.Alarm;/*"告警"*/
                    });
                }
                return data;
            };
        };

        /*****  添加机架 Start *******************************************************/
        $scope.addCabinetRackClick = function(){
            addCabinetRackDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/addCabinetRack.html',
                show: false
            });
            addCabinetRackDlg.$promise.then(addCabinetRackDlg.show);
            $scope.newRack = {
                ip : $scope.ipAddress[0].IP,
                port : 502,
                cabinetId : ""
            }
        };

        $scope.addCabinetRack = function(){
            var prompt = $scope.languageJson.AssetRackBox.Prompt;
            if($scope.newRack.cabinetId === undefined || $scope.newRack.cabinetId == ""){
                balert.show('danger',prompt.SelectCabinet,3000);/*"请选择关联机柜！"*/
                return;
            }
            if($scope.newRack.ip === undefined || $scope.newRack.ip == ""){
                balert.show('danger',prompt.SelectIP,3000);/*"请选择服务器IP地址！"*/
                return;
            }
            if($scope.newRack.port === undefined || $scope.newRack.port == ""){
                balert.show('danger',prompt.EnterPort,3000);/*"请输入服务器端口！"*/
                return;
            }
            assetRackManagerService.addCabinetRack($scope.newRack.cabinetId,$scope.newRack.ip,$scope.newRack.port).then(function(data){
                if(data == "OK"){
                    balert.show('success',prompt.Success,3000);/*"添加成功！"*/
                    SelectAllRack();
                    addCabinetRackDlg.hide();
                }else
                    balert.show('success',prompt.Failed,3000);/*"添加失败，请检查配置！"*/
            });
        };
        /*****  添加机架 End *******************************************************/

        /*****  控制机架 Start *******************************************************/
        $scope.rackControlClick = function(){
            rackControlDialog = $modal({
                scope: $scope,
                templateUrl: 'partials/rackControl.html',
                show: false
            });
            rackControlDialog.$promise.then(rackControlDialog.show);
        };

        $scope.controlClick = function(){
            assetRackManagerService.ControlRack("").then(function(data){
                balert.show('success',data,3000);
            });
        };
        /*****  控制机架 End *******************************************************/

        //排序
        $scope.sortingOrder = undefined;
        $scope.reverse = false;
        $scope.SortBy = function(newSortingOrder){
            if ($scope.sortingOrder == newSortingOrder){
                $scope.reverse = !$scope.reverse;
            }
            $scope.sortingOrder = newSortingOrder;
            // 遍历
            $('th i').each(function(){
                // 删除其他箭头样式
                $(this).removeClass("fa-chevron-down");
                $(this).removeClass("fa-chevron-up");
            });
            if ($scope.reverse){
                $('th.'+newSortingOrder+' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            }else{
                $('th.'+newSortingOrder+' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            }

        };

        /*****  删除机架 Start *******************************************************/
        $scope.removeAssetsRackManagerClick = function(CabinetId){
            var prompt = $scope.languageJson.AssetRackPage.Prompt;
            $scope.message = prompt.ConfirmRemove;/*"确定删除资产机架吗？"*/
            confirmBoxDlg.$promise.then(confirmBoxDlg.show);

            $scope.ok = function(){
                assetRackManagerService.deleteCabinetRack(CabinetId).then(function(data){
                    if(data == "Succeed"){
                        balert.show('success',prompt.RemoveSuccess,3000);/*"删除成功！"*/
                        confirmBoxDlg.hide();
                        SelectAllRack();
                    }else if(data == "ServerNotExistence"){
                        balert.show('success',prompt.RemoveRackSuccess,3000);/*"删除没有启动服务的机架成功！"*/
                        confirmBoxDlg.hide();
                    }else
                        balert.show('danger',prompt.RemoveFailure,3000);/*"删除失败！"*/
                });
            };
        };

        $scope.cancel = function(){
            confirmBoxDlg.hide();
        };
        /*****  删除机架 End *******************************************************/

        /*****  修改机架 Start *******************************************************/
        $scope.updateAssetsRackManagerClick = function(data){
            $scope.newRack = data;
            updCabinetRackDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/updCabinetRack.html',
                show: false
            });
            updCabinetRackDlg.$promise.then(updCabinetRackDlg.show);
        };

        $scope.checkClick = function(visible){
            if(visible == 1){
                $scope.newRack.Monitoring = 0;
            }else{
                $scope.newRack.Monitoring = 1;
            }
        };

        $scope.getCheckbox = function(visible){
            if(visible == 1 || visible == '1')
                return "√";
            else
                return "X";
        };

        $scope.saveCabinetRack = function(){
            var prompt = $scope.languageJson.AssetRackBox.Prompt;
            if($scope.newRack.CabinetId === undefined || $scope.newRack.CabinetId == ""){
                balert.show('danger',prompt.SelectCabinet,3000);/*"请选择关联机柜！"*/
                return;
            }
            if($scope.newRack.ServerIP === undefined || $scope.newRack.ServerIP == ""){
                balert.show('danger',prompt.SelectIP,3000);/*"请选择服务器IP地址！"*/
                return;
            }
            if($scope.newRack.ServerPort === undefined || $scope.newRack.ServerPort == ""){
                balert.show('danger',prompt.EnterPort,3000);/*"请输入服务器端口！"*/
                return;
            }
            assetRackManagerService.updateCabinetRack($scope.newRack).then(function(data){
                if(data == "Succeed"){
                    balert.show('success',prompt.Success,3000);/*"修改成功！"*/
                    updCabinetRackDlg.hide();
                    SelectAllRack();
                }else if(data == "ParameterError"){
                    balert.show('danger',prompt.Failed,3000);/*"失败，请检查配置！"*/
                    updCabinetRackDlg.hide();
                }else
                    balert.show('danger',prompt.Failure,3000);/*"修改失败！"*/
            });
        };
        //强制结束告警
        $scope.forcedEndAlarm = function(cabinetId){
            assetRackManagerService.forcedEndAlarm(cabinetId).then(function(data){
                /*"操作成功！"*/
                balert.show('success',$scope.languageJson.AssetRackBox.Prompt.ForcedSuccess,3000);
                if(updCabinetRackDlg != null) updCabinetRackDlg.hide();
                if(showRackAllAssetsDlg != null) showRackAllAssetsDlg.hide();
            });
        };
        /*****  修改机架 End *******************************************************/


        /*****  显示机柜的所有资产设备 Start *******************************************************/
        $scope.showAssetsRackManagerClick = function(cabinetId,cabinetName,statusMeaning,totalSpace,surplusSpace){
            $scope.rackTitle = cabinetName+" ";
            $scope.currRack = {
                statusMeaning : statusMeaning,
                surplusSpace : surplusSpace,
                totalSpace : totalSpace
            };
            showRackAllAssetsDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/showRackAssets.html',
                show: false
            });
            assetRackManagerService.SelectAssetsManager(cabinetId).then(function(data){
                loadCabinet(data,totalSpace);
            });
        };

        function loadCabinet(data,totalSpace){
            if(data == undefined || data.length == 0){
                //"该机架没有资产信息！"
                balert.show('danger',$scope.languageJson.AssetRackDevice.Prompt.NotAssetInfo,3000);
                return;
            }
            //计算U位
            $scope.rackTotalUHeight = parseInt(totalSpace);//机柜的默认总U高
            $scope.rackDomTotalHeight = 724;//机柜DOM的像素高度
            var uPixelHeight = parseFloat($scope.rackDomTotalHeight / $scope.rackTotalUHeight);
            $scope.cabinet = { devices : []};

            if(data){
                for(var i = 0;i < data.length; i ++){
                    data[i].divHeight = parseInt(data[i].uHeight) * uPixelHeight;
                    if (i == 0) {
                        data[i].divMarginTop = ($scope.rackTotalUHeight - parseInt(data[i].uIndex) - parseInt(data[i].uHeight)) * uPixelHeight;
                    } else {
                        data[i].divMarginTop = (parseInt(data[i - 1].uIndex) - parseInt(data[i].uHeight) - parseInt(data[i].uIndex)) * uPixelHeight;
                    }
                }
            }

            $scope.cabinet.devices = data;
            $scope.selectAssets(data[0]);

            showRackAllAssetsDlg.$promise.then(showRackAllAssetsDlg.show);
        };
        $scope.mouseEnterDevice = function(){
            $(function () { $(".rackDevice").tooltip({html : true });});
        };
        $scope.getTitle = function(assets){
            if(assets.assetsName == undefined) return "";
            var position = "";
            if(assets.uHeight == 1 || assets.uHeight == "1"){
                position = parseInt(assets.uIndex)+1;
            }else{
                position = (parseInt(assets.uIndex)+1)+"-"+(parseInt(assets.uIndex)+parseInt(assets.uHeight));
            }
            return "<h5> U:["+position+"]</h5>";
        };

        $scope.selectAssets = function(assets){
            var meaning = $scope.languageJson.AssetRackDevice.Meaning;
            $scope.newAssets = {};
            if(assets.status == 1 || assets.status == "1") assets.statusMeaning = meaning.Putaway;/*"上架"*/
            else assets.statusMeaning = meaning.Demolition;/*"下架"*/
            $scope.selectAssetsId = assets.assetsId;
            $scope.panelTitle = assets.assetsName+" ";
            $scope.newAssets = assets;
        };

        $scope.changeDevice = function(deviceId){
            if($scope.devices){
                $scope.devices.forEach(function(item){
                    if(item.id == deviceId)
                        $scope.newAssets.assetsName = item.name;
                });
            }
        };

        //修改设备资产信息
        $scope.saveAssetsManagerClick = function(assets){
            var prompt = $scope.languageJson.AssetRackDevice.Prompt;
            assetRackManagerService.UpdateAssetsManager(assets).then(function(data){
                if(data == "Succeed"){
                    balert.show('success',prompt.ModifySuccess,3000);/*"修改成功！"*/
                    assetRackManagerService.SelectAssetsManager(assets.cabinetId).then(function(datas){
                        loadCabinet(datas,$scope.currRack.totalSpace);
                    });
                }else
                    balert.show('danger',prompt.ModifyFailure,3000);/*"修改失败！"*/
            });
        };

        //删除设备资产信息
        $scope.delAssetsManagerClick = function(cabinetId,uIndex,uHeight){
            var prompt = $scope.languageJson.AssetRackDevice.Prompt;
            $scope.message = prompt.ConfirmDelete;/*"确定下架(删除)资产吗？"*/
            confirmBoxDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/confirmBox.html',
                show: false
            });
            confirmBoxDlg.$promise.then(confirmBoxDlg.show);

            $scope.ok = function(){
                assetRackManagerService.DeleteAssetsManager(cabinetId,uIndex,uHeight).then(function(data){
                    if(data == "Succeed"){
                        balert.show('success',prompt.DemoSuccess,3000);/*"下架成功！"*/
                        assetRackManagerService.SelectAssetsManager(cabinetId).then(function(datas){
                            loadCabinet(datas,$scope.currRack.totalSpace);
                        });
                        $scope.currRack.surplusSpace -= parseInt(uHeight);
                        confirmBoxDlg.hide();
                    }else
                        balert.show('danger',prompt.DemoFailure,3000);/*"下架失败！"*/
                });
            };
        };

        //配置生效
        $scope.reLoadEquipmentConfigClick = function () {
            var prompt = $scope.languageJson.AssetRackPage.Prompt;
            $scope.message = prompt.ConfirmSync;/*"请确认是否将修改的数据同步到微模块?"*/
            confirmBoxDlg.$promise.then(confirmBoxDlg.show);

            $scope.ok = function(){
                $scope.loading = true;
                MdcAlarmService.ReLoadMdcConfig().then(function(data){
                    balert.show('success',prompt.SyncSuccess,3000);/*'同步成功！'*/
                    $scope.loading = false;
                    confirmBoxDlg.hide();
                });
            };
        };
        /*****  显示机柜的所有资产设备 End *******************************************************/

        /*****  显示资产日志 End *******************************************************/
        $scope.showAssetsLogClick = function () {
            $scope.log = {
                StartDate : new Date(),
                EndDate : new Date()
            };
            showAssetsLogDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/showAssetsLog.html',
                show: false
            });
            showAssetsLogDlg.$promise.then(showAssetsLogDlg.show);
        };

        $scope.queryAssetsManager = function(startDate,endDate){
            $scope.loading = true;
            assetRackManagerService.QueryAssetsManagerLog(startDate,endDate).then(function(data){
                $scope.log.AssetsManagerLog = data;
                $scope.loading = false;
            });
        };

        $scope.exportToHtml = function() {
            $scope.loading = true;
            var exporter = getExportList($scope.log.AssetsManagerLog);
            Exporter.toXls(exporter);
            $scope.loading = false;
        };

        function getExportList(data) {
            var resArray = [];
            resArray.push({
                Content : $scope.languageJson.AssetRecord.Content,
                Date : $scope.languageJson.AssetRecord.Time
            });/*"资产内容" / "时间"*/

            data.forEach(function(element, index) {
                var ass = {};
                ass.Content = element.Content;
                ass.Date = element.Date;
                resArray.push(ass);
            });

            return resArray;
        };
        /*********************  定时  **************************************/
        var stop;
        $scope.start = function() {
            if (angular.isDefined(stop)) return;
            stop = $interval(function() {
                SelectAllRack();
            }, 5000);
        };
        $scope.start();

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.stop();
        });
    }
]);


nurseController.controller('OtherModuleCtrl',['$scope', '$http', '$interval', '$modal', 'Exporter', 'balert', 'otherModuleService', 'uploadService', 'zipFileService', 'equipmentTemplateService','equipmentService',
    function($scope, $http, $interval, $modal, Exporter, balert, otherModuleService, uploadService, zipFileService, equipmentTemplateService,equipmentService){
        var modifyConfigDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/modifyModuleConfig.html',
            show: false
        });
        var uploadZipFileDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/uploadZipFile.html',
            show: false
        });
        var cmbModifyConfigDlg =  $modal({
            scope: $scope,
            templateUrl: 'partials/chinamobileModuleConfig.html',
            show: false
        });
        var cmbDeviceConfigDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/chinamobileDeviceInfo.html',
            show: false
        });
        var createFSUIDDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/createFSUID.html',
            show: false
        });
        var createCmbDeviceIDDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/createCmbDeviceID.html',
            show: false
        });
        var cubModifyConfigDlg =  $modal({
            scope: $scope,
            templateUrl: 'partials/chinaunicomModuleConfig.html',
            show: false
        });
        var cubDeviceConfigDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/chinaunicomDeviceInfo.html',
            show: false
        });
        var createCubDeviceIDDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/createCubDeviceID.html',
            show: false
        });

        var mc = $scope.languageJson.OtherModule.ModifyConfigBox;
        $scope.snmpTypes = [
            {type:401,name:"[401,"+mc.T401+"]"},
            {type:701,name:"[701,"+mc.T701+"]"},
            {type:1001,name:"[1001,"+mc.T1001+"]"},
            {type:1006,name:"[1006,"+mc.T1006+"]"},
            {type:1004,name:"[1004,"+mc.T1004+"]"},
            {type:1101,name:"[1101,"+mc.T1101+"]"},
            {type:1501,name:"[1501,"+mc.T1501+"]"}
        ];/*开关电源 / 普通空调 / 智能门禁 / 智能温湿度 / 环境设备 / 蓄电池 / 交流电表*/
        function inint(){
            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                $scope.devices = data;
            });

            $http.get("../data/module/Mobile_B_Interface.json").success(function(data) {
                $scope.BInterfaceMobileTypes = data;
            });
            $http.get("../data/module/Unicom_B_Interface.json").success(function(data) {
                $scope.BInterfaceUnicomTypes = data;
            });

            $scope.moduleType = "bInterface_chinamobile";

            //是否隐藏导出按钮
            isShowExportButton();
        };
        inint();

        function isShowExportButton(){
            var name = "unknown";
            var userAgent = window.navigator.userAgent;
            if (userAgent.indexOf("Windows")!= -1){
                name = "Windows";
            }else if (userAgent.indexOf("X11") != -1 || userAgent.indexOf("Linux") != -1){
                name = "Linux";
            }
            if(name == "Linux")
                $(".export-button").hide();
        }
        /********** 修改模块 Start *************/
        $scope.modifyConfigClick = function(type){
            $scope.loading = true;
            var param = "Snmp";
            var prompt = $scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt;
            if(type == "snmp"){
                param = "Snmp";
                $scope.addIpInfo = {
                    ip : "192.168.100.100",
                    port : "162"
                };
            }else if(type == "bInterface_chinamobile") {//移动B接口
                $scope.moduleType = type;
                param = "Chinamobile";
            }else if(type == "bInterface_chinaunicom"){//联通B接口
                $scope.moduleType = type;
                param = "Chinaunicom";
            }

            otherModuleService.LoadOtherModuleConfig(param).then(function(data){
                $scope.loading = false;
                if(data.Error == undefined){
                    if(param == "Snmp") {
                        $scope.SnmpInfo = data;
                        modifyConfigDlg.$promise.then(modifyConfigDlg.show);
                    }else if(param == "Chinamobile") {
                        $scope.Chinamobile = data;
                        cmbModifyConfigDlg.$promise.then(cmbModifyConfigDlg.show);
                    }else {
                        $scope.Chinaunicom = data;
                        cubModifyConfigDlg.$promise.then(cubModifyConfigDlg.show);
                    }
                }else{
                    if(data.Error == "Not OtherModule!")
                        balert.show('danger',prompt.NotDataBaseConfig,3000);/*"数据库配置不正确！"*/
                    if(data.Error == "File Not Exist!")
                        balert.show('danger',prompt.NotConfigFile,3000);/*"模块文件不存在！"*/
                }
            });
        };

        //添加IP
        $scope.addIpInfoClick = function(ip,port){
            if(ip == undefined || ip == "") return;
            if(port == undefined || port == "") return;

            var is = false;
            if($scope.SnmpInfo.IPS){
                $scope.SnmpInfo.IPS.forEach(function(item){
                    if(item.IP == ip && item.port == port)
                        is = true;
                });
                if(is){
                    //'已存在!'
                    balert.show('danger',$scope.languageJson.OtherModule.ModifyConfigBox.Prompt.Existed,3000);
                    return;
                }
            }

            var ipInfo = {
                IP : ip,
                port : port
            };
            if($scope.SnmpInfo.IPS == undefined) $scope.SnmpInfo.IPS = [];

            $scope.SnmpInfo.IPS.push(ipInfo);
        };

        $scope.changeDevice = function(id,snmpType){
            if($scope.devices){
                var baseTypeId = "";
                $scope.devices.forEach(function(item){
                    if(item.id == id){
                        baseTypeId = item.baseTypeId;
                        $scope.deviceName = item.name;
                    }
                });

                if($scope.snmpTypes){
                    var is = false;
                    $scope.snmpTypes.forEach(function(item){
                        if(item.type == baseTypeId)
                            is = true;
                    });
                    if(is) return baseTypeId;
                }
            }
            return snmpType;
        };

        $scope.addDeviceInfoClick = function(id,type){
            if(id == undefined || id == "") return;
            if(type == undefined || type == "") return;
            var is = false;
            if($scope.deviceInfos){
                $scope.deviceInfos.forEach(function(item){
                    if(item.id == id)
                        is = true;
                });
                if(is){
                    //'已存在!'
                    balert.show('danger',$scope.languageJson.OtherModule.ModifyConfigBox.Prompt.Existed,3000);
                    return;
                }
            }

            var deviceInfo = {
                id : id,
                name : $scope.deviceName,
                type : type
            };
            $scope.deviceInfos.push(deviceInfo);

            $scope.deviceInfos = sortObj($scope.deviceInfos,"type");
        };

        $scope.changeBDevice = function(device){
            var obj = angular.fromJson(device);
            var baseType = ""+obj.baseTypeId;
            if(baseType.length < 4){
                baseType = "0"+baseType;
            }

            if($scope.moduleType == "bInterface_chinamobile"){
                //中国移动
                var code = "";
                if($scope.BInterfaceMobileTypes){
                    $scope.BInterfaceMobileTypes.forEach(function(item){
                        if(item.BaseType.indexOf(baseType) != -1)
                            code = item.Type+"00001000001";
                    });
                }

                if($scope.deviceInfos){
                    $scope.deviceInfos.forEach(function(item){
                        if(item.code == code){
                            code = (parseInt(code)+1)+"";
                            if(code.length < 15)
                                code = "0"+code;
                        }
                    });
                }
                return code;
            }else{
                //中国联通
                var code = "";
                if($scope.BInterfaceUnicomTypes){
                    $scope.BInterfaceUnicomTypes.forEach(function(item){
                        if(item.BaseType.indexOf(baseType) != -1)
                            code = item.Type+"01";
                    });
                }

                if($scope.deviceInfos){
                    $scope.deviceInfos.forEach(function(item){
                        if(item.code == code){
                            var type = code.substring(0,3);
                            var num = parseInt(code.substring(3))+1;
                            if(num < 10)
                                num = "0"+num;
                            code = type+num;
                        }
                    });
                }
                return code;
            }
        };

        $scope.addBDeviceInfoClick = function(code,device){
            if(code == undefined || code == "") return;
            if(device == undefined || device == "") return;
            var obj = angular.fromJson(device);// id  , name

            var is = false;
            if($scope.deviceInfos){
                $scope.deviceInfos.forEach(function(item){
                    if(item.id == obj.id || item.code == code) is = true;
                });
                if(is){
                    //'已存在!'
                    balert.show('danger',$scope.languageJson.OtherModule.ModifyConfigBox.Prompt.Existed,3000);
                    return $scope.bCode;
                }
            }

            var deviceInfo = {
                code : code,
                id : obj.id,
                name : obj.name
            };
            $scope.deviceInfos.push(deviceInfo);
        };

        //排序
        function sortObj(array, key) {
            return array.sort(function(a, b) {
                var x = parseInt(a[key]);
                var y = parseInt(b[key]);
                return x - y;
            });
        }

        //删除 arr：集合  obj：删除的对象
        $scope.delInfoClick = function(arr, obj){
            arr.splice($.inArray(obj,arr),1);
        };


        $scope.saveSnmpConfigClick = function(){
            var prompt = $scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt;

            if(!inputSnmpValidation(prompt)) return;
            otherModuleService.ModifyOtherModuleConfig("Snmp",$scope.SnmpInfo).then(function(data){
                if(data == "OK") {
                    balert.show('success', prompt.Success+""+prompt.Restart, 3000);/*'修改成功！重启机器生效！'*/
                    modifyConfigDlg.hide();
                }else
                    balert.show('danger', prompt.Error+data, 3000);/*'修改失败！原因：'*/
            });
        };
        function inputSnmpValidation(prompt){
            if($scope.SnmpInfo == undefined || $scope.SnmpInfo.sysObjectID == undefined || $scope.SnmpInfo.sysObjectID == ""){
                balert.show('danger', prompt.NotSystemID, 3000);/*'系统对象编号不能为空！'*/
                return false;
            }
            if($scope.SnmpInfo.IPS == undefined || $scope.SnmpInfo.IPS.length == 0){
                balert.show('danger', prompt.NotIP, 3000);/*'授权IP不能为空！'*/
                return false;
            }
            return true;
        }
        /********** 修改模块 End *************/

        /************************** 移动B接口 Start  *******************************/
        //生成FSUID
        $scope.createFSUIDClick = function(){
            var time = new Date().Format("yyyyMMdd");
            $scope.FSUID = {
                Id : "00",
                Date : time,
                Code : "0001"
            };
            if($scope.Chinamobile.FSUID != undefined && $scope.Chinamobile.FSUID.length > 12){
                var length = $scope.Chinamobile.FSUID.length;
                var count = length - 12;
                $scope.FSUID.Id = $scope.Chinamobile.FSUID.substring(0,count);
                count = length - 4;
                $scope.FSUID.Code = $scope.Chinamobile.FSUID.substring(count);
            }
            createFSUIDDlg.$promise.then(createFSUIDDlg.show);
        };
        $scope.createFSUID = function(){
            if($scope.Chinamobile == undefined) $scope.Chinamobile = {};

            $scope.Chinamobile.FSUID = ""+$scope.FSUID.Id+$scope.FSUID.Date+$scope.FSUID.Code;
            createFSUIDDlg.hide();
        };

        //站点内容修改，统一修改集合的站点内容
        $scope.changeStation = function(type,value){
            if($scope.Chinamobile.Devices){
                $scope.Chinamobile.Devices.forEach(function(item){
                    eval("item."+type+"=\""+value+"\"");
                });
            }
        };

        //新增移动设备
        $scope.addDeviceClick = function(){
            $scope.CmbDeviceType = "insert";
            $scope.CmbDevice = {
                equipId : "",
                deviceId : "",
                deviceName : "",
                model : "",
                brand : "",
                ratedCapacity : "",
                version : "",
                beginRunTime : "",
                devDescribe : "",
                siteID : $scope.Chinamobile.siteID,
                siteName : $scope.Chinamobile.siteName,
                roomId : $scope.Chinamobile.roomId,
                roomName : $scope.Chinamobile.roomName
            };
            cmbDeviceConfigDlg.$promise.then(cmbDeviceConfigDlg.show);
        };
        //修改移动设备
        $scope.modifyDeviceClick = function(data){
            $scope.CmbDeviceType = "modify";
            $scope.CmbDevice = data;
            cmbDeviceConfigDlg.$promise.then(cmbDeviceConfigDlg.show);
        };

        //选择关联设备自动生成DeviceId
        $scope.changeCmbDevice = function(deviceId){
            var code = "";
            var device = getDeviceById(deviceId);
            if($scope.BInterfaceMobileTypes != undefined && device != undefined){
                var baseType = device.baseTypeId;
                $scope.BInterfaceMobileTypes.forEach(function(item){
                    if(item.BaseType.indexOf(baseType) != -1)
                        code = item.Type;
                });
            }

            if($scope.CmbDevice == undefined) $scope.CmbDevice = {};
            $scope.CmbDevice.deviceName = device.name;

            if($scope.CmbDevice.deviceId != undefined && $scope.CmbDevice.deviceId.length >= 15){
                var oldId = $scope.CmbDevice.deviceId;
                $scope.CmbDevice.deviceId = code+oldId.substring(4);
            }else
                $scope.CmbDevice.deviceId = code+"00001000001";
        };
        //生成DeviceId
        $scope.createCmbDeviceIDClick = function(){
            if($scope.CmbDevice.equipId == undefined || $scope.CmbDevice.equipId == ""){
                /*'建议先选择关联设备'*/
                balert.show('danger',$scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt.SelectDevice,3000);
                $scope.DeviceID = {
                    TypeCode : "",
                    ResCode : "00",
                    SysCode : "001",
                    DevCode : "000001"
                };
            }else{
                //获取设备类型编码
                var TypeCode = getDeviceTypeCode($scope.CmbDevice.equipId);

                $scope.DeviceID = {
                    TypeCode : TypeCode,
                    ResCode : "00",
                    SysCode : "001",
                    DevCode : "000001"
                };
            }
            createCmbDeviceIDDlg.$promise.then(createCmbDeviceIDDlg.show);
        };
        function getDeviceTypeCode(deviceId){
            var code = "";
            var device = getDeviceById(deviceId);
            var baseType = device == undefined ? "" : device.baseTypeId;
            if($scope.BInterfaceMobileTypes){
                $scope.BInterfaceMobileTypes.forEach(function(item){
                    if(item.BaseType.indexOf(baseType) != -1)
                        code = item.Type;
                });
            }
            return code;
        }
        function getDeviceById(deviceId){
            var result = undefined;
            if($scope.devices){
                $scope.devices.forEach(function(item){
                    if(item.id == deviceId)
                        result = item;
                });
            }
            return result;
        };
        $scope.createCmbDeviceID = function(){
            if($scope.CmbDevice == undefined) $scope.CmbDevice = {};

            $scope.CmbDevice.deviceId = ""+$scope.DeviceID.TypeCode+$scope.DeviceID.ResCode+$scope.DeviceID.SysCode+$scope.DeviceID.DevCode;
            createCmbDeviceIDDlg.hide();
        };

        //保存/新增 移动设备
        $scope.saveCmbDeviceConfig = function(){
            if(!inputCmbDeviceValidation()) return;
            if($scope.CmbDeviceType == "insert"){
                if($scope.Chinamobile.Devices == undefined) $scope.Chinamobile.Devices = [];
                $scope.Chinamobile.Devices.push($scope.CmbDevice);
            }

            cmbDeviceConfigDlg.hide();
        };
        function inputCmbDeviceValidation(){
            var prompt = $scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt;
            if($scope.CmbDevice == undefined || $scope.CmbDevice.equipId == undefined || $scope.CmbDevice.equipId == ""){
                /*'关联设备不能为空！'*/
                balert.show('danger', prompt.NotSelectDevice, 3000);
                return false;
            }
            if($scope.CmbDevice.deviceId == undefined || $scope.CmbDevice.deviceId == ""){
                /*'设备编号不能为空！'*/
                balert.show('danger', prompt.NotDeviceCode, 3000);
                return false;
            }
            if($scope.CmbDevice.deviceName == undefined || $scope.CmbDevice.deviceName == ""){
                /*'设备名称不能为空！'*/
                balert.show('danger', prompt.NotDeviceName, 3000);
                return false;
            }
            return true;
        }

        //保存FSUINFO
        $scope.saveChinamobileModuleConfig = function(){
            var prompt = $scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt;

            if(!inputChinamobileValidation(prompt)) return;
            otherModuleService.ModifyOtherModuleConfig("Chinamobile",$scope.Chinamobile).then(function(data){
                if(data == "OK") {
                    balert.show('success', prompt.Success, 3000);/*'修改成功！'*/
                    cmbModifyConfigDlg.hide();
                }else
                    balert.show('danger', prompt.Error+data, 3000);/*'修改失败！原因：'*/
            });
        };
        function inputChinamobileValidation(prompt){
            if($scope.Chinamobile == undefined || $scope.Chinamobile.FSUID == undefined || $scope.Chinamobile.FSUID == ""){
                balert.show('danger', prompt.NotFSUID, 3000);/*'FSUID不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.FSUPort == undefined || $scope.Chinamobile.FSUPort == ""){
                balert.show('danger', prompt.NotFSUPort, 3000);/*'FSU端口不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.SCIP == undefined || $scope.Chinamobile.SCIP == ""){
                balert.show('danger', prompt.NotSCIP, 3000);/*'SCIP不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.SCPort == undefined || $scope.Chinamobile.SCPort == ""){
                balert.show('danger', prompt.NotSCPort, 3000);/*'SC端口不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.SCURLSuffix == undefined || $scope.Chinamobile.SCURLSuffix == ""){
                balert.show('danger', prompt.NotSCURL, 3000);/*'SC地址不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.loginUser == undefined || $scope.Chinamobile.loginUser == ""){
                balert.show('danger', prompt.NotLoginUser, 3000);/*'注册用户名不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.loginPwd == undefined || $scope.Chinamobile.loginPwd == ""){
                balert.show('danger', prompt.NotLoginPwd, 3000);/*'注册密码不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.FTPUser == undefined || $scope.Chinamobile.FTPUser == ""){
                balert.show('danger', prompt.NotFTPUser, 3000);/*'FTP用户名不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.FTPPwd == undefined || $scope.Chinamobile.FTPPwd == ""){
                balert.show('danger', prompt.NotFTPPwd, 3000);/*'FTP密码不能为空！'*/
                return false;
            }
            if($scope.Chinamobile.loginUser == "root" || $scope.Chinamobile.FTPUser == "root"){
                balert.show('danger', prompt.CanAccount, 3000);/*'不能使用root账户'*/
                return false;
            }
            return true;
        }

        //下载移动B接口XML配置文件
        $scope.downloadConfigClick = function(){
            // 移动 = "/cmbspace/Config/devices_[0-9]*.xml"
            Exporter.toXml("/cmbspace/Config/devices_[0-9]*.xml","UTF-8");
        };
        /************************** 移动B接口 End  *******************************/

        /************************** 联通B接口 Start  *******************************/
        //新增联通设备
        $scope.addCubDeviceClick = function(){
            $scope.CubDeviceType = "insert";
            $scope.CubDevice = {
                equipId : "",
                deviceId : "",
                deviceRId : "",
                deviceName : ""
            };
            cubDeviceConfigDlg.$promise.then(cubDeviceConfigDlg.show);
        };
        //修改联通设备
        $scope.modifyCubDeviceClick = function(data){
            $scope.CubDeviceType = "modify";
            $scope.CubDevice = data;
            cubDeviceConfigDlg.$promise.then(cubDeviceConfigDlg.show);
        };
        //新增 / 修改 通讯设备
        $scope.saveCubDeviceConfig = function(){
            if(!inputCubDeviceValidation()) return;

            if($scope.CubDeviceType == "insert"){
                if($scope.Chinaunicom.Devices){
                    $scope.Chinaunicom.Devices.push($scope.CubDevice);
                }
            }
            cubDeviceConfigDlg.hide();
        };
        function inputCubDeviceValidation(){
            var prompt = $scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt;
            if($scope.CubDevice == undefined || $scope.CubDevice.equipId == undefined || $scope.CubDevice.equipId == ""){
                /*'关联设备不能为空！'*/
                balert.show('danger', prompt.NotSelectDevice, 3000);
                return false;
            }
            if($scope.CubDevice.deviceId == undefined || $scope.CubDevice.deviceId == ""){
                /*'设备编号不能为空！'*/
                balert.show('danger', prompt.NotDeviceCode, 3000);
                return false;
            }
            if($scope.CubDevice.deviceName == undefined || $scope.CubDevice.deviceName == ""){
                /*'设备名称不能为空！'*/
                balert.show('danger', prompt.NotDeviceName, 3000);
                return false;
            }
            return true;
        }

        //生成FSUID 为本机MAC
        $scope.createCubFSUIDClick = function(){
            otherModuleService.GetChinaunicomFSUID().then(function(data){
                if($scope.Chinaunicom == undefined) $scope.Chinaunicom = {};
                $scope.Chinaunicom.FSUID = data;
                $scope.Chinaunicom.FSURID = data;
            });
        };

        //选择关联设备
        $scope.changeCubDevice = function(deviceId){
            var device = getDeviceById(deviceId);
            var code = getCubDeviceTypeCode(deviceId);

            var index = getCubDeviceTypeNumber(deviceId);

            $scope.CubDevice.deviceId = code+index;
            $scope.CubDevice.deviceRId = code+index;
            $scope.CubDevice.deviceName = device.name;
        };

        //生成DeviceID
        $scope.createCubDeviceIDClick = function(){
            if($scope.CubDevice.equipId == undefined || $scope.CubDevice.equipId == ""){
                /*'建议先选择关联设备'*/
                balert.show('danger',$scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt.SelectDevice,3000);

                $scope.DeviceID = {
                    Code : "",
                    Number : "01"
                };
            }else{
                //获取设备类型编码
                var Code = getCubDeviceTypeCode($scope.CubDevice.equipId);
                var index = getCubDeviceTypeNumber($scope.CubDevice.equipId);

                $scope.DeviceID = {
                    Code : Code,
                    Number : index
                };
            }
            createCubDeviceIDDlg.$promise.then(createCubDeviceIDDlg.show);
        };
        function getCubDeviceTypeCode(deviceId){
            var code = "";
            var device = getDeviceById(deviceId);
            var baseType = device == undefined ? "" : device.baseTypeId;
            if($scope.BInterfaceUnicomTypes){
                $scope.BInterfaceUnicomTypes.forEach(function(item){
                    if(item.BaseType.indexOf(baseType) != -1)
                        code = item.Type;
                });
            }
            return code;
        }
        function getCubDeviceTypeNumber(deviceId){
            var code = getCubDeviceTypeCode(deviceId);
            var index = 1;
            if($scope.Chinaunicom.Devices){
                $scope.Chinaunicom.Devices.forEach(function(item){
                    if(item.equipId != deviceId){
                        var type = item.deviceId.substr(0,3);
                        if(type == code) index++;
                    }
                });
            }
            if(index < 10)
                index = "0"+index;
            return index;
        }
        $scope.createCubDeviceID = function(){
            $scope.CubDevice.deviceId = $scope.DeviceID.Code + $scope.DeviceID.Number;
            $scope.CubDevice.deviceRId = $scope.CubDevice.deviceId;
            createCubDeviceIDDlg.hide();
        };

        //修改配置
        $scope.saveChinaunicomModuleConfig = function(){
            var prompt = $scope.languageJson.OtherModule.ChinamobileCfgBox.Prompt;
            if(!inputChinaunicomValidatio(prompt)) return;
            otherModuleService.ModifyOtherModuleConfig("Chinaunicom",$scope.Chinaunicom).then(function(data){
                if(data == "OK") {
                    balert.show('success', prompt.Success, 3000);/*'修改成功！'*/
                    cubModifyConfigDlg.hide();
                }else
                    balert.show('danger', prompt.Error+data, 3000);/*'修改失败！原因：'*/
            });
        };
        function inputChinaunicomValidatio(prompt){
            if($scope.Chinaunicom == undefined || $scope.Chinaunicom.FSUID == undefined || $scope.Chinaunicom.FSUID == ""){
                balert.show('danger', prompt.NotFSUID, 3000);/*'FSUID不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.FSURID == undefined || $scope.Chinaunicom.FSURID == ""){
                balert.show('danger', prompt.NotFSURID, 3000);/*'FSU资管ID不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.SCIP == undefined || $scope.Chinaunicom.SCIP == ""){
                balert.show('danger', prompt.NotSCIP, 3000);/*'SCIP不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.SCPort == undefined || $scope.Chinaunicom.SCPort == ""){
                balert.show('danger', prompt.NotSCPort, 3000);/*'SC端口不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.loginUser == undefined || $scope.Chinaunicom.loginUser == ""){
                balert.show('danger', prompt.NotLoginUser, 3000);/*'注册用户名不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.loginPwd == undefined || $scope.Chinaunicom.loginPwd == ""){
                balert.show('danger', prompt.NotLoginPwd, 3000);/*'注册密码不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.FTPUser == undefined || $scope.Chinaunicom.FTPUser == ""){
                balert.show('danger', prompt.NotFTPUser, 3000);/*'FTP用户名不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.FTPPwd == undefined || $scope.Chinaunicom.FTPPwd == ""){
                balert.show('danger', prompt.NotFTPPwd, 3000);/*'FTP密码不能为空！'*/
                return false;
            }
            if($scope.Chinaunicom.loginUser == "root" || $scope.Chinaunicom.FTPUser == "root"){
                balert.show('danger', prompt.CanAccount, 3000);/*'不能使用root账户'*/
                return false;
            }
            return true;
        }
        /************************** 联通B接口 End  *******************************/

        /********** 打印配置 Start *************/
        $scope.printConfigClick = function(type,id){
            $scope.loading = true;
            otherModuleService.PrintConfig(type).then(function(data){
                data.forEach(function(item){
                    // 接收服务端的实时日志并添加到HTML页面中
                    $("#"+id+" div").append(item.content+"<br/>");
                });
                $scope.loading = false;
                // 滚动条滚动到最低部
                $("#"+id).scrollTop($("#"+id+" div").height() - $("#"+id).height());
            });
        };
        /********** 打印配置 End *************/

        /********** 检测模块 *************/
        $scope.detectionConfigClick = function(type){
            var prompt = $scope.languageJson.OtherModule.DetectionConfigBox;
            $scope.loading = true;
            otherModuleService.DetectionConfig(type).then(function(data){
                $scope.loading = false;
                if(data == "OK")
                    balert.show('success',prompt.Succeed,3000);//'模块一切正常！'
                else if(data == "Not Type")
                    balert.show('danger',prompt.NotType,10000);//'未定义模块！'
                else
                    balert.show('danger',prompt.OtherError+data,10000);//'模块缺失：'
            });
        };

        /*************  重启模块  ***********************/
        $scope.restartConfigClick = function(type){
            var prompt = $scope.languageJson.OtherModule.RestartConfigBox;
            $scope.loading = true;
            if(type == "snmp"){
                equipmentService.ReLoadFSU().then(function(data){
                    balert.show('success',prompt.Succeed,3000);//重启成功！
                    $scope.loading = false;
                });
            }else{
                otherModuleService.RestartConfig(type).then(function(data){
                    if(data == "OK")
                        balert.show('success',prompt.Succeed,3000);//重启成功！
                    else
                        balert.show('danger',prompt.Error,10000);//重启失败，进程不存在！
                    $scope.loading = false;
                });
            }
        };

        /********** 上传模块 Start *************/
        //[暂停开发]上传模块配置
        $scope.uploadConfigClick = function(type){
            uploadZipFileDlg.$promise.then(uploadZipFileDlg.show);
            $scope.file = undefined;
            $scope.moduleType = type;
        };

        //type=file选择文件后触发的函数
        $scope.$on("fileSelected",function(event, msg) {
            $scope.file = msg;
        });

        $scope.uploadZipFile = function(){
            if($scope.file == undefined) return;
            $scope.loading = true;
            //上传文件，返回上传后的路径
            uploadService.uploadFile($scope.file).then(function(data){
                var path = data;
                //根据路径解压文件，返回解压后的文件夹目录
                zipFileService.decompressionFile(path).then(function(data) {
                    var zipPath = data;
                    if (zipPath == "fail to decompression file") {
                        balert.show('danger','解压文件失败，请检查上传文件是否有效zip文件!',3000);
                        $scope.loading = false;
                        return;
                    }
                    //删除上传文件
                    uploadService.deleteUploadFile(path);

                    //删除原目录文件、将上传文件复制到指定目录
                    otherModuleService.UploadConfig($scope.moduleType,zipPath).then(function(data){

                        //删除文件夹
                        //uploadService.deleteUploadDirectory(zipPath);

                        uploadZipFileDlg.hide();
                        $scope.loading = false;
                    });

                });
            });
        };
        /********** 上传模块 End *************/

        //报文 开始打印/关闭打印
        $scope.switchCheckClick = function(status,type,id){
            if(type == undefined || type == "") {
                $scope.switchStatus = false;
                return;
            }
            var parm = status ? "true" : "false";
            otherModuleService.SwitchCheck(parm,type).then(function(data){
               if(data == "true" || data == true) $scope.start(id);
               else $scope.stop();
            });
        };

        $scope.IssuedCmdClick = function(type,id,cmd){
            if(cmd == undefined || cmd == "") return;

            $scope.loading = true;
            var cmdLine = cmd;
            if(type.indexOf("bInterface") != -1)
                cmdLine = "/home/app/samp/"+cmd;

            otherModuleService.ReturnCmdContent(cmdLine,type).then(function(data){
                data.forEach(function(item){
                    // 接收服务端的实时日志并添加到HTML页面中
                    $("#"+id+" div").append(item.content+"<br/>");
                });
                // 滚动条滚动到最低部
                $("#"+id).scrollTop($("#"+id+" div").height() - $("#"+id).height());
                $scope.loading = false;
            });
        };

        $scope.addLogClick = function(){
            otherModuleService.AddLogContent().then();
        };

        //清空报文
        $scope.clearLogClick = function(id){
            $("#"+id).html("");
        };

        //导出报文
        $scope.exportLogClick = function(id){
            $scope.loading = true;
            //var exporter = getExportList($scope.log.AssetsManagerLog);
            Exporter.toTxt($("#"+id).html());
            $scope.loading = false;
        };


        $scope.changeModuleType = function(status){
            if(status){
                otherModuleService.SwitchCheck("false","").then(function(data){});
                $scope.stop();
                $scope.switchStatus = false;
            }
        };
        /*********************  定时  **************************************/
        var stop;
        $scope.start = function(id) {
            if (angular.isDefined(stop)) return;
            stop = $interval(function() {
                printMessage(id);
            }, 1000);
        };

        function printMessage(id){
            //var id = type+"-log-container";
            otherModuleService.GetLogContent().then(function(data){
                if(data == "" || data == undefined) return;
                data.forEach(function(item){
                    // 接收服务端的实时日志并添加到HTML页面中
                    $("#"+id+" div").append(item.content+"<br/>");
                });
                // 滚动条滚动到最低部
                $("#"+id).scrollTop($("#"+id+" div").height() - $("#"+id).height());
            });
        }

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.stop();
            otherModuleService.SwitchCheck("false","").then(function(data){});
        });
    }
]);


nurseController.controller('MdcSignalRecordCtrl', ['$scope', '$compile', '$modal', '$http', '$rootScope', 'diagramService', 'balert', 'MdcConfigService', 'MdcAlarmService', 'hisAlarmService', 'mdcHisDataService', 'baseTypeService', 'ConfigureMoldService', 'hisDataService', 'hisCardsService',
    function($scope, $compile, $modal, $http, $rootScope, diagramService, balert, MdcConfigService, MdcAlarmService, hisAlarmService, mdcHisDataService, baseTypeService, ConfigureMoldService, hisDataService, hisCardsService){

        $(function() {
            MdcConfigService.GetMdcConfigInfo().then(function(data){
                $scope.mdcConfigs = data;
                if(data.length > 0){
                    $scope.MDCId = data[0].id;
                    MdcInit(data[0].cabinetNumber,data[0].cabinetUHeight,data[0].type);
                }
            });

            $scope.Topology = {};
            $scope.data = {};
            ConfigureMoldService.GetPartEquipments("").then(function(data){
                $scope.deviceList = data;
            });

            //刷卡记录
            $scope.params = {};
            $scope.params.startDate = getAlreadyTime(3);
            $scope.params.endDate = new Date();
        });

        //刷卡记录 分页对象
        $scope.tableParams = {
            currentPage:1,//当前页面
            itemsPerPage:10,//显示条数
            pagesLength:10,
            totalItems:0,//总条数
            hint:{
                the:$scope.languageJson.Paging.The,
                page:$scope.languageJson.Paging.Page,
                articel:$scope.languageJson.Paging.Articel,
                eachPage:$scope.languageJson.Paging.EachPage,
                total:$scope.languageJson.Paging.Total,
                noData:$scope.languageJson.Paging.NoData
            },
            list:[],//数据集
            perPageOptions:[10, 20, 30, 40, 50],//显示条数组
            onChange:function(newValue,oldValue){
                if(newValue == undefined || newValue != "HisCard") return;
                $scope.loading = true;
                var param = "||||||";//筛选条件
                var index = ($scope.tableParams.currentPage - 1) * $scope.tableParams.itemsPerPage;//开始下标
                var size = $scope.tableParams.itemsPerPage;//显示条数
                //分页查询
                hisCardsService.likeHisCards(index,size,$scope.params.startDate,$scope.params.endDate,param).then(function(data){
                    $scope.tableParams.list = data;
                });
                //数据总条数
                hisCardsService.likeHisCardTotals($scope.params.startDate,$scope.params.endDate,param).then(function(data){
                    $scope.tableParams.totalItems = data;
                    $rootScope.$emit('resultTotal',{});
                    $scope.loading = false;
                });
            }
        };

        $scope.cabinetName = {};
        $scope.mdcStyle = {};
        //加载机柜
        function MdcInit(colNum,uHeight,type){

            $scope.status = [];
            $scope.cabinetData = [];
            $scope.cabinetUHeight = uHeight;

            //动态加载table
            //var colNum = 32;
            var td = "";
            $("#mdc-alarm-tr1").children('td').remove();//清空所有的td
            $("#mdc-alarm-tr2").children('td').remove();//清空所有的td
            if(type == 1){
                $scope.MdcWidth = (100/16*parseInt(colNum));

                for(var i = 1;i <= colNum; i++){
                    td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\" style=\"display: block;\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body {{mdcStyle.cabinet"+i+"}} normal\" ng-click=\"devicesClk('Rack','cabinet"+i+"')\"></div></td>";
                    var $td = $compile(td)($scope);
                    $("#mdc-alarm-tr2").append($td);
                }
                $(".water").css("height","39vh");//下排水浸线位置样式
            }else{
                $scope.MdcWidth = (100/16*(parseInt(colNum)/2));
                for(var i = 1;i <= colNum; i++){
                    if(i <= colNum/2) {
                        td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title bottom\" style=\"display: block;\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body {{mdcStyle.cabinet"+i+"}} normal\" ng-click=\"devicesClk('Rack','cabinet"+i+"')\"></div></td>";
                        var $td = $compile(td)($scope);
                        $("#mdc-alarm-tr2").append($td);
                    }else{
                        td = "<td class=\"button cabinet"+i+"\"><div class=\"cabinet-title top\" style=\"display: block;\">{{cabinetName.cabinet"+i+"}}</div><div class=\"cabinet-body {{mdcStyle.cabinet"+i+"}} normal\" ng-click=\"devicesClk('Rack','cabinet"+i+"')\"></div></td>";
                        var $td = $compile(td)($scope);
                        $("#mdc-alarm-tr1").append($td);
                    }
                }
            }

            //加载机柜名称和图标
            loadCabinetList();

            //加载冷通道环境
            loadAisleDevice();
        };
        //加载机柜名称和图标
        function loadCabinetList(){
            if(!$scope.MDCId) return;
            MdcAlarmService.getCabinetList($scope.MDCId).then(function(data){
                $scope.mdcCabintList = data;
                getCabinetsName(data);
                loadCabinetInfo(data);
            });
            //机柜名称
            function getCabinetsName(data){
                if(data){
                    data.forEach(function(item){
                        if(item.cabinetId.indexOf("cabinet") > -1){
                            eval("$scope.cabinetName." + item.cabinetId + " = item.cabinetName");
                        }
                    });
                }
            }
            //加载机柜信息
            function loadCabinetInfo(data){
                if(data){
                    data.forEach(function(item){
                        if(item.cabinetId.indexOf("cabinet") > -1){
                            eval("$scope.mdcStyle." + item.cabinetId + " = item.cabinetType");
                        }
                    });
                }
            }
        }
        //加载冷通道环境
        function loadAisleDevice(){
            MdcConfigService.GetAllAisleDeviceList().then(function(data){
                $scope.otherSignalList = data;
                CreateAisleTable(data);
            });

            function CreateAisleTable(data){
                $("#AisleTable").find("tr").remove();//清空所有的td
                for(var i = 1;i <= 3;i ++){
                    var tr = "<tr>";
                    for(var j = 1;j <= 7;j++){
                        var aisles = GetAisleDeviceByLocation(data,i,j);
                        var td = "";
                        if(j <= 3)
                            td = "<td align='left'>"+CreateAisleInfo(aisles,'left')+"</td>";
                        else if(j == 4)
                            td = "<td align='center'><div style='width: fit-content;'>"+CreateAisleInfo(aisles,'left')+"</div></td>";
                        else
                            td = "<td align='right'>"+CreateAisleInfo(aisles,'right')+"</td>";
                        tr += td;
                    }
                    tr += "</tr>";
                    var $tr = $compile(tr)($scope);
                    $("#AisleTable").append($tr);
                }
            }
            function GetAisleDeviceByLocation(data,row,col){
                if(data){
                    var obj = [];
                    data.forEach(function(item){
                        if(item.TableRow == row && item.TableCol == col)
                            obj.push(item);
                    });
                    return obj;
                }else
                    return undefined;
            }

            function CreateAisleInfo(aisles,align){
                if(aisles == undefined || aisles.length == 0) return "";
                var div = "";
                aisles.forEach(function(aisle){
                    if(aisle.DeviceType == "skyFalling"){//天窗
                        div += "<div class=\"skyFalling normal\" style='float: "+align+";' ng-click=\"editAisleTable('"+aisle.Id+"','')\"></div>";
                    }else if(aisle.DeviceType == "thermalHumidity"){//温湿度
                        div += "<div class=\"thermalHumidity\" style='width: 10vh;height: 5vh;float: "+align+";'>"+
                            "<div class=\"thermal normal\" style='float: left;' ng-click=\"editAisleTable('"+aisle.Id+"','Thermal')\"></div>"+
                            "<div class=\"humidity normal\" style='float: left;' ng-click=\"editAisleTable('"+aisle.Id+"','Humidity')\"></div>"+
                            "</div>";
                    }else if(aisle.DeviceType == "infrared"){//红外
                        div += "<div class=\"infrared normal\" style='float: "+align+";' ng-click=\"editAisleTable('"+aisle.Id+"','')\"></div>";
                    }else if(aisle.DeviceType == "smoke"){//烟感
                        div += "<div class=\"smoke normal\" style='float: "+align+";' ng-click=\"editAisleTable('"+aisle.Id+"','')\"></div>";
                    }
                });
                return div;
            }
        }

        //右边设备列表模态框
        var devicesDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/mdcDeviceListBox.html',
            animation: 'am-fade-and-slide-right',
            show: false
        });
        $scope.devicesClk = function(type,id){
            if(type == "Rack"){//机柜  id:cabinet1...
                $scope.cabinetInfo = getCabinetDeviceList(id);
                $scope.cabinetInfo.type = "Rack";
            }else if(type == "Door"){//门  id:door1...
                $scope.cabinetInfo = getDeviceListByType("door");
                $scope.cabinetInfo.type = "Door";
            }else{//环境量 id - 水浸:water1、烟感:smoke1、红外:infrared1、天窗:skyFalling1、温湿度:thermalHumidity1
                $scope.cabinetInfo = getDeviceListByType("water|smoke|infrared|skyFalling|thermalHumidity");
                $scope.cabinetInfo.type = "Environment";
            }
            if($scope.cabinetInfo.devices.length > 0)
                devicesDlg.$promise.then(devicesDlg.show);
        };

        //根据机柜编号获取机柜的设备列表
        function getCabinetDeviceList(id){
            var cfg = {};
            if($scope.mdcCabintList){
                $scope.mdcCabintList.forEach(function(item){
                    if(item.cabinetId == id){
                        cfg.name = item.cabinetName;
                        cfg.devices = [];

                        var idArr = item.equipmentId.split(",");
                        var nameArr = item.equipmentName.split(",");
                        for(var i = 0; i < idArr.length; i++){
                            if(idArr[i] == "") continue;

                            cfg.devices.push({
                                id : idArr[i],
                                name : nameArr[i]
                            });
                        }
                    }
                });
            }
            return cfg;
        }

        //根据设备类型获取同类型设备列表
        function getDeviceListByType(type){
            var cfg = {};
            if($scope.otherSignalList){
                if(type == "door")//门禁设备
                    cfg.name = $scope.languageJson.MdcSignalRecord.DeviceBox.DoorDevice;
                else//环境设备
                    cfg.name = $scope.languageJson.MdcSignalRecord.DeviceBox.EnvironmentDevice;
                cfg.devices = [];

                var split = type.split("|");
                if(split.length == 1){
                    $scope.otherSignalList.forEach(function(item){
                        cfg.devices = pushDeviceList(cfg.devices,type,item);
                    });
                }else{
                    $scope.otherSignalList.forEach(function(item){
                        split.forEach(function(sp){
                            cfg.devices = pushDeviceList(cfg.devices,sp,item);
                        });
                    });
                }
            }
            return cfg;
        }
        function pushDeviceList(list,type,value){
            if(list == undefined) list = [];
            //判断是否合类型
            if(value.DeviceType == type){
                //去掉集合中重复的
                var is = false;
                list.forEach(function(item){
                    if(item.id == value.DeviceId)
                        is = true;
                });
                if(is) return list;

                list.push({
                    id : value.DeviceId,
                    name : value.DeviceName
                });
            }
            return list;
        }

        //根据设备编号加载历史告警和历史数据
        $scope.showDeviceRecord = function(id,isAll,type){
            $scope.isShowRoot = true;//隐藏微模块，显示历史数据页面
            sessionStorage.setItem("showHisRecord","true");
            if(type == "Door")//表格还是曲线图
                $scope.isTable = true;
            else
                $scope.isTable = false;

            $scope.ChartDevices = id;
            if(id.length == undefined){
                $scope.ChartDevices = [];
                $scope.ChartDevices.push(id);
            }
            $scope.selectQuery = {
                deviceId : -1,
                alarmType : "total",
                alarmNumber : 20,
                signalDays : 3
            };
            $scope.selectDeviceIdList = parseDeviceId(id);// 多个设备 list[n].id为设备编号

            //历史告警
            getHistoryAlarmByDevice();
            if(type == "Door"){//刷卡记录
                getCardsRecord();
            }else{//历史信号
                getHistorySignalByDevice();
            }
            devicesDlg.hide();
        };

        function parseDeviceId(ids){
            var result = "";
            if(ids){
                if(ids.length > 0){
                    ids.forEach(function(item){
                        if(result == "")
                            result += item.id;
                        else
                            result += "-"+item.id;
                    });

                    $scope.selectQuery.deviceId = ids[0].id;
                }else{
                    result = ids.id;

                    $scope.selectQuery.deviceId = ids.id;
                }
            }
            return result;
        }

        $scope.returnTable = function(){
            sessionStorage.setItem("showHisRecord","false");
            $scope.isShowRoot = false;//隐藏微模块，显示历史数据页面
        };

        //选择设备
        $scope.chartDeviceClk = function(id){
            if($scope.selectQuery == undefined) $scope.selectQuery = [];
            $scope.selectQuery.deviceId = id;

            getHistorySignalByDevice();
        };

        //设置图表参数
        var settingChartDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/settingChart.html',
            show: false
        });
        $scope.settingChartParam = function(deviceId){
            /*  重写 Start */
            $scope.confirm = function(){
                settingChartDlg.hide();
                getHistorySignalByDevice();
            };
            /*  重写 End */

            $scope.HisChartConfigs = [];
            mdcHisDataService.GetMdcChartMap(deviceId).then(function(data){
                $scope.HisChartConfigs = data;
            });
            settingChartDlg.$promise.then(settingChartDlg.show);
        };

        //设置图表信号
        var settingChartSignalDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/settingChartSignal.html',
            show: false
        });
        $scope.addChartSignal = function(){
            $scope.ChartSignals = {
                DeviceId : $scope.selectQuery.deviceId,
                ChartType : "line",
                Max : "auto",
                Min : "0",
                Series : []
            };
            settingChartSignalDlg.$promise.then(settingChartSignalDlg.show);
        };
        $scope.settingChartSignal = function(data){
            $scope.ChartSignals = angular.fromJson(data);
            settingChartSignalDlg.$promise.then(settingChartSignalDlg.show);
        };

        //删除图表
        $scope.removeChartClick = function(chartMapId){
            mdcHisDataService.RemoveDeviceChartMap(chartMapId).then(function(datas){
                if(datas == "OK"){
                    //"删除成功！"
                    balert.show('success',$scope.languageJson.MdcSignalRecord.Prompt.DeleteSucceed,3000);

                    mdcHisDataService.GetMdcChartMap($scope.selectQuery.deviceId).then(function(data){
                        $scope.HisChartConfigs = data;
                    });
                }else
                    balert.show('danger',$scope.languageJson.MdcSignalRecord.Prompt.DeleteFailure,3000);//'删除失败!'
            });
        };

        //新增信号
        var bindingDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/bindingDlg.html',
            show: false
        });
        $scope.addSignalClick = function(){
            //  重写方法 Start ----------------------------------------
            $scope.changeDevice = function(id){
                baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                    $scope.data.devices = data;
                });
            };
            $scope.ok = function(){
                if($scope.data.selecteds == undefined) return;

                var signal = angular.fromJson($scope.data.selecteds[0]);

                var cfg = {
                    Name : signal.baseTypeName,
                    DeviceId : $scope.Topology.DeviceId,
                    BaseTypeId : signal.baseTypeId
                };
                $scope.ChartSignals.Series.push(cfg);
                bindingDlg.hide();
            };
            $scope.deleteBind = function(){
                bindingDlg.hide();
            };
            //  重写方法 End ----------------------------------------

            $scope.Topology.DeviceId = $scope.ChartSignals.DeviceId;
            $scope.changeDevice($scope.Topology.DeviceId);
            bindingDlg.$promise.then(bindingDlg.show);
        };

        //删除信号
        $scope.removeSignalClick = function($index){
            $scope.ChartSignals.Series.splice($index,1);
        };

        //新增/修改微模块设备图表
        $scope.saveChartSignalClick = function(){
            var prompt = $scope.languageJson.MdcSignalRecord.Prompt;
            if($scope.ChartSignals.Max == undefined || $scope.ChartSignals.Max == ""){
                balert.show('danger',prompt.NoMax,3000);//'最大值不能为空!'
                return;
            }
            if($scope.ChartSignals.Min == undefined || $scope.ChartSignals.Min == ""){
                balert.show('danger',prompt.NoMin,3000);//'最小值不能为空!'
                return;
            }
            if($scope.ChartSignals.Series == undefined || $scope.ChartSignals.Series.length == 0){
                balert.show('danger',prompt.NoSignalList,3000);//'信号列表不能为空!'
                return;
            }
            mdcHisDataService.InitDeviceChartMap($scope.ChartSignals).then(function(data){
                if(data.indexOf("OK") != -1){
                    var charMapId = data.split("|")[1];
                    mdcHisDataService.InitChartSignalMap(charMapId,$scope.ChartSignals.Series).then(function(datas){
                        if(datas == "OK"){
                            balert.show('success',prompt.InitSucceed,3000);//"新增/修改成功！"
                            settingChartSignalDlg.hide();

                            mdcHisDataService.GetMdcChartMap($scope.ChartSignals.DeviceId).then(function(data){
                                $scope.HisChartConfigs = data;
                            });
                        }else
                            balert.show('danger',prompt.InitFailure,3000);//'信号列表添加/修改失败!'
                    });
                }else
                    balert.show('danger',prompt.InitChartFailure,3000);//'曲线图添加/修改失败!'
            });
        };

        //查询历史告警
        $scope.queryHisAlarm = function(type,num){
            if($scope.selectQuery == undefined) $scope.selectQuery = {};
            $scope.selectQuery.alarmType = type;
            $scope.selectQuery.alarmNumber = num;

            getHistoryAlarmByDevice();
        };
        function getHistoryAlarmByDevice(){
            $scope.loading = true;
            $scope.isNoAlarm = false;
            $scope.HisAlarms = [];
            hisAlarmService.GetHistoryAlarmByDevice($scope.selectDeviceIdList,$scope.selectQuery.alarmType,
                $scope.selectQuery.alarmNumber).then(function(data){
                $scope.HisAlarms = parseHisAlarms(data);
                if(data.length == 0) $scope.isNoAlarm = true;
                $scope.loading = false;
            });
        }
        function parseHisAlarms(data){
            var prompt = $scope.languageJson.MdcSignalRecord.HisAlarm;
            if(data){
                data.forEach(function(item){
                    if(item.cancelUserName != "")
                        item.Status = prompt.Cancel;//"已结束/已确定"
                    else
                        item.Status = prompt.NoCancel;//"已结束/未确定"
                });
            }
            return data;
        }

        //查询历史数据
        $scope.queryHisData = function(day){
            if($scope.selectQuery == undefined) $scope.selectQuery = {};
            $scope.selectQuery.signalDays = day;

            if($scope.isTable == true) {
                getCardsRecord();
            }else
                getHistorySignalByDevice();
        };
        function getHistorySignalByDevice(){
            $scope.loading = true;
            $scope.isNoHisData = false;
            hisDataService.GetHistorySignalByDevice($scope.selectQuery.deviceId,$scope.selectQuery.signalDays).then(function(data){
                $scope.HisSignals = data;

                if(data.length ==0 || data[0].Series.length == 0)
                    $scope.isNoHisData = true;

                if($scope.HisSignals){
                    $scope.HisSignals.forEach(function(item){
                        loadLineChart(".chart"+item.ChartMapId,item.ChartType,item);
                    });
                    $scope.loading = false;
                }
            });
        }
        function getCardsRecord(){
            $scope.params.startDate = getAlreadyTime($scope.selectQuery.signalDays);
            $scope.tableParams.onChange("HisCard");
        }

        // 加载Chart图表 cla:class样式名称,chartTYpe:图表类型
        function loadLineChart(cla,chartType,cfg){
            //字体颜色
            var fontColor = "#FFFFFF";//"#FFFFFF":白色、"#464952":黑色
            if(localStorage.getItem("systemStyle") == "White")// Blue/White
                fontColor = "#464952";

            cfg.FontColor = fontColor;
            if(chartType == "line")
                getLineCharts(cla,cfg);
        }

        function getLineCharts(cla,cfg){
            $http.get("data/LineOrBarCharts.json").success(function(data) {
                //设置字体颜色
                data.title.textStyle.color = cfg.FontColor;
                data.legend.textStyle.color = cfg.FontColor;
                data.xAxis[0].axisLabel.textStyle.color = cfg.FontColor;
                data.yAxis[0].axisLabel.textStyle.color = cfg.FontColor;

                //Y轴名称
                if(cfg.Y1Name == "false")
                    data.yAxis[0].show = false;
                else
                    data.yAxis[0].name = cfg.Y1Name;
                //Y轴最大值、最小值
                data.yAxis[0].min = cfg.Min;
                data.yAxis[0].max = cfg.Max == "" ? "auto" : cfg.Max;

                //标题
                data.title.text = cfg.Title;

                //位置
                data.grid.y = 50;

                //数据列
                if(cfg.Series){
                    cfg.Series.forEach(function(item){
                        //数据值
                        var series = {
                            name : item.Name,
                            type : cfg.ChartType,
                            data : item.Data,
                            markPoint : {
                                data : [
                                    {type : "max", name: $scope.languageJson.Configuration.ActiveChartControl.Function.MaxVal},
                                    {type : "min", name: $scope.languageJson.Configuration.ActiveChartControl.Function.MinVal}
                                ]
                            }
                        };//"最大值" / "最小值"

                        data.series.push(series);
                        //帅选
                        data.legend.data.push(item.Name);
                    });
                }

                //X轴列名
                data.xAxis[0].data = cfg.Data;

                var s = angular.toJson(data);

                try {
                    var chartObj = $(cla)[0];
                    var chartInit = echarts.init(chartObj);
                    window.onresize = chartInit.resize(); //使第一个图表适应
                    chartInit.setOption(data, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                return data;
            });
        }

        function getAlreadyTime(day) {
            var date = new Date();
            date.setDate(date.getDate() - day);
            return date;
        }
    }
]);

//64节温场
nurseController.controller('NodeTempCtrl',['$scope','$http','$modal','equipmentTemplateService','balert','diagramService','$interval','activeSignalService','ImageManageService','uploadService',
    function($scope,$http,$modal,equipmentTemplateService,balert,diagramService,$interval,activeSignalService,ImageManageService,uploadService){
        $(function(){
            //显示大于24的值
            $scope.visibleTemp = false;
            $scope.location = {
                multiplying : "1",
                offsetTop : 0,
                offsetLeft : 0
            };

            loadNodeTempConfig();

            equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data){
                $scope.devices = data;
            });
        });

        //读取温场配置
        function loadNodeTempConfig(){
            $http.get("data/nodeTemperature/config.json").success(function(data){
                $scope.nodeTempConfig = data;
                if(data && data.configs && data.configs.length > 0){
                    $scope.selectDeviceId = data.configs[0].deviceId;

                    loadTempConfig(data.configs[0]);
                }
            });
        }
        //读取温场温度配置
        function loadTempConfig(config){
            $http.get("data/nodeTemperature/"+config.json).success(function(data){
                $scope.tempOption = parseTempOption(data);

                var rowCount = 8,colCount = 8;
                if($scope.tempOption.tr.length > 0){
                    rowCount = $scope.tempOption.tr.length;
                    colCount = $scope.tempOption.tr[0].td.length;

                    /*$scope.tdWidth = (960 - 40 - 2)/config.totalRow;
                    $scope.tdHeight = (480 - 40 - 2)/config.totalCol;*/
                }
                setTempImg(data,rowCount,colCount);

                loadActiveSignal();
            });
        }
        function parseTempOption(data){
            var option = {
                img : data.img,
                top : data.top,
                left : data.left,
                tr : []
            };
            if(data.tr){
                data.tr.forEach(function(tr){
                    if(tr.td){
                        var tds = [];
                        tr.td.forEach(function(td){
                            if(td.check == "check")
                                tds.push(td);
                        });
                        if(tds.length > 0)
                            option.tr.push({td:tds});
                    }
                });
            }
            return option;
        }
        //设置温场图
        function setTempImg(option,rowCount,colCount){
            var otherPoints = getOtherPoints(option,-1,-1);
            var startEndPoint = getStartAndEndPoint(otherPoints);
            //计算温场框形状
            var width = 480;
            var height = 480;
            option.top = parseInt(option.top) * 2;
            option.left = parseInt(option.left) * 2;
            if(startEndPoint.length == 2){
                var widthSize = (startEndPoint[1].tdIndex - startEndPoint[0].tdIndex) + 1;
                var heightSize = (startEndPoint[1].trIndex - startEndPoint[0].trIndex) + 1;
                if(widthSize != heightSize){//长方形
                    var per = 480 / heightSize;
                    width = widthSize * per;

                    if(width > 960){
                        per = 960 / widthSize;
                        height = heightSize * per;
                        width = 960;
                    }
                }
            }
            $scope.tempPic = {
                width : width + "px",
                height : height + "px",
                top : option.top + "px",
                left : option.left + "px"
            };

            $scope.tdWidth = (width - 2)/colCount;
            $scope.tdHeight = (height - 2)/rowCount;
        }

        //根据设备编号加载温场温度配置
        $scope.loadNodeTemp = function(deviceId){
            $scope.selectDeviceId = deviceId;
            if($scope.nodeTempConfig && $scope.nodeTempConfig.configs){
                $scope.nodeTempConfig.configs.forEach(function(item){
                    if(item.deviceId == deviceId)
                        loadTempConfig(item);
                });
            }
        };

        function getHeatMapColor(value){
            var resultColor = [];
            var color = [ [0,0,1], [0,1,0], [1,1,0], [1,0,0] ];

            var idx1;        // |-- Our desired color will be between these two indexes in "color".
            var idx2;        // |
            var fractBetween = 0;  // Fraction between "idx1" and "idx2" where our value is.

            if(value <= 0)      {  idx1 = idx2 = 0; }    // accounts for an input <=0
            else if(value >= 1)  {  idx1 = idx2 = 3; }    // accounts for an input >=0
            else
            {
                value = value * 3;                      // Will multiply value by 3.
                idx1  = Math.floor(value);                  // Our desired color will be after this index.
                idx2  = idx1+1;                        // ... and before this index (inclusive).
                fractBetween = value - idx1;    // Distance between the two indexes (0-1).
            }

            resultColor.push(((color[idx2][2] - color[idx1][2])*fractBetween + color[idx1][2]) * 255);//blue
            resultColor.push(((color[idx2][1] - color[idx1][1])*fractBetween + color[idx1][1]) * 255);//green
            resultColor.push(((color[idx2][0] - color[idx1][0])*fractBetween + color[idx1][0]) * 255);//red

            return resultColor
        }
        // 颜色Array(255,0,255)格式转为#FF00FF
        function rgb2color(rgb){
            var s = "#";
            for (var i = 0; i < 3; i++)
            {
                var c = Math.round(rgb[i]).toString(16);
                if (c.length == 1)
                    c = '0' + c;
                s += c;
            }
            return s.toUpperCase();
        }
        // 颜色Array(255,0,255)格式转为rgba(255,0,255,1)
        function rgbaColor(rgb,opacity){
            return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+opacity+")";
        }
        // 生成渐变
        function gradient(fromValue,toValue,step){
            var colorDictionary = [];
            var valStep = (toValue - fromValue) / step;

            for (var N = 0; N <= step; N++)
            {
                var colorItem = {};
                colorItem.value = fromValue + valStep * N;
                colorItem.color = rgbaColor(getHeatMapColor(N/step),0.6);//rgb2color(getHeatMapColor(N/step));
                colorDictionary.push(colorItem);
            }

            return colorDictionary;
        }
        //获取温度卡尺
        $scope.colorDic = gradient(34,18,16);
        //根据温度获取单元格背景色和文本颜色
        $scope.getColor = function(value){
            if(value > 34) return "background-color:rgba(255,0,0,0.6);";
            if(value < 18) return "background-color:rgba(0,0,255,0.6);";
            var intVal = parseInt(value);
            if($scope.colorDic){
                var color = "";
                $scope.colorDic.forEach(function(item){
                    if(item.value == intVal)
                        color = item.color;
                });
                if(value > 24)
                    return "background-color:"+color+";";
                else
                    return "background-color:"+color+";";
            }
        };

        //编辑
        var modifyDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/modifyNodeTemperature.html',
            show: false
        });
        $scope.nodeTempEditClk = function(){
            //modifyDlg.$promise.then(modifyDlg.show);
            $("#node-view").hide();
            $("#node-edit").show();
        };
        //保存
        $scope.saveNodeTemperature = function(){
            var prompt = $scope.languageJson.NodeTemperature.Prompt;
            diagramService.SaveNodeTemperature("config.json",$scope.nodeTempConfig).then(function(data){
                if(data == "OK"){
                    balert.show('success',prompt.Success,3000);/*'修改成功！'*/
                    //modifyDlg.hide();
                    $('#node-view').show();
                    $('#node-edit').hide();
                    loadNodeTempConfig();
                }else{
                    if(data == "IOError")
                        balert.show('danger',prompt.IOError,3000);/*'修改失败！写入文件异常！'*/
                    else if(data == "Error")
                        balert.show('danger',prompt.Error,3000);/*'修改失败！文件路径不正确！'*/
                    else if(data == "ParamError")
                        balert.show('danger',prompt.ParamError,3000);/*'修改失败！参数异常！'*/
                }
            });
        };

        //新增温场
        var addDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/addTemperature.html',
            show: false
        });
        $scope.addTemperature = function(){
            $scope.tempConfig = {
                title : "温场",
                deviceId : "",
                totalRow : 8,
                totalCol : 8,
                json : ""
            };
            //addDlg.$promise.then(addDlg.show);
            $(".add-temperature").show();
        };

        //保存温场
        $scope.saveTemperature = function(){
            var prompt = $scope.languageJson.NodeTemperature.Prompt;
            if($scope.tempConfig.title == "" || $scope.tempConfig.deviceId == "" ||
                $scope.tempConfig.totalRow == "" || $scope.tempConfig.totalCol == "" ||
                $scope.tempConfig.json == ""){
                balert.show('danger',prompt.NotParam,3000);/*'所有参数均不能为空！'*/
                return;
            }

            if($scope.nodeTempConfig.configs == undefined)
                $scope.nodeTempConfig.configs = [];

            $scope.nodeTempConfig.configs.push($scope.tempConfig);
            //addDlg.hide();
            $(".add-temperature").hide();
        };

        //删除温场
        $scope.removeTemperature = function(arr, obj){
            arr.splice($.inArray(obj,arr),1);
        };

        function loadActiveSignal(){
            if($scope.selectDeviceId == undefined) return;

            activeSignalService.getActiveSignalByDevice($scope.selectDeviceId).then(function(data) {
                $scope.signals = data;
                setTemperatureValue();
            });
        }
        function setTemperatureValue(){
            //baseTypeId floatValue
            if($scope.tempOption){
                if($scope.tempOption.tr){
                    $scope.tempOption.tr.forEach(function(tr){
                        if(tr.td){
                            tr.td.forEach(function(td){
                                td.value = getSignalValue(td.baseTypeId);
                                td.color = $scope.getColor(td.value);
                            });
                        }
                    });
                }
            }
        }
        function getSignalValue(baseTypeId){
            var floatValue = 0;
            if($scope.signals){
                $scope.signals.forEach(function(sig){
                    if(sig.baseTypeId == baseTypeId)
                        floatValue = parseInt(sig.floatValue);
                });
            }
            return floatValue;
        }

        /******* 框选测点  Start **********************************/
        $scope.choosePointClk = function(){
            if($scope.tempConfig.json == undefined || $scope.tempConfig.json == ""){
                balert.show('danger','请选择设备！',3000);
                return;
            }
            $(".Test-Box-Choose").show();
            $(".Test-Img-Temp").hide();

            $http.get("data/nodeTemperature/"+$scope.tempConfig.json).success(function(data){
                $scope.editTempOption = data;
            }).error(function(err){
                console.log("choosePointClk:"+err);
                $http.get("data/nodeTemperature/temp.json").success(function(data){
                    $scope.editTempOption = data;
                });
            });
        };
        //全选/全不选
        $scope.allChoosePoint = function(check){
            if($scope.editTempOption.tr){
                var trs = $scope.editTempOption.tr;
                for(var i = 0;i < trs.length; i ++) {
                    if (trs[i].td) {
                        var tds = trs[i].td;
                        for (var j = 0; j < tds.length; j++) {
                            tds[j].check = check;
                        }
                    }
                }
            }
        };
        $scope.changeDevice = function(deviceId){
            $scope.tempConfig.json = deviceId+".json";
        };
        //生成测点JSON
        $scope.createPointJson = function(){
            var prompt = $scope.languageJson.NodeTemperature.Prompt;
            diagramService.SaveNodeTemperature($scope.tempConfig.json,$scope.editTempOption).then(function(data){
                if(data == "OK"){
                    $scope.locationTempClk();
                }else{
                    if(data == "IOError")
                        balert.show('danger',prompt.IOError,3000);/*'修改失败！写入文件异常！'*/
                    else if(data == "Error")
                        balert.show('danger',prompt.Error,3000);/*'修改失败！文件路径不正确！'*/
                    else if(data == "ParamError")
                        balert.show('danger',prompt.ParamError,3000);/*'修改失败！参数异常！'*/
                }
            });
        };
        $scope.createLocationJson = function(){
            $scope.editTempOption.top = $scope.location.offsetTop;
            $scope.editTempOption.left = $scope.location.offsetLeft;

            var prompt = $scope.languageJson.NodeTemperature.Prompt;
            diagramService.SaveNodeTemperature($scope.tempConfig.json,$scope.editTempOption).then(function(data){
                if(data == "OK"){
                    balert.show('success',prompt.Success,3000);/*'修改成功！'*/
                    $(".Test-Img-Temp").hide();
                    $scope.saveTemperature();
                }else{
                    if(data == "IOError")
                        balert.show('danger',prompt.IOError,3000);/*'修改失败！写入文件异常！'*/
                    else if(data == "Error")
                        balert.show('danger',prompt.Error,3000);/*'修改失败！文件路径不正确！'*/
                    else if(data == "ParamError")
                        balert.show('danger',prompt.ParamError,3000);/*'修改失败！参数异常！'*/
                }
            });
        };

        $scope.checkPoint = function(td,parentIndex,index){
            if(td.check == undefined || td.check == "")
                td.check = "check";
            else
                td.check = "";

            if(td.check == "check"){
                // td = editTempOption.tr[parentIndex].td[index]
                boxChoosePoint(parentIndex,index);
            }
        };
        //框选点
        function boxChoosePoint(parentIndex,index){
            //1、获取除了该点是否存在其他被选中的点
            var otherPoints = getOtherPoints($scope.editTempOption,parentIndex,index);
            var currentPoint = {
                trIndex : parentIndex,
                tdIndex : index
            };
            if(otherPoints.length == 1){
                //1.2、有一个其他点，框选中间点
                choosePonits(otherPoints[0],currentPoint);
            }else if(otherPoints.length > 2){
                //1.4、获取最左上角的点 和 最右下角的点
                var startEndPoint = getStartAndEndPoint(otherPoints);
                //1.3、有两个其他点，去掉最近的点，框选中间点
                var otherPoint = uncheckPoint(startEndPoint,currentPoint);
                choosePonits(otherPoint,currentPoint);
            }
            //var allPoints = getOtherPoints($scope.editTempOption,-1,-1);
        }
        //获取其他点 集合
        function getOtherPoints(option,parentIndex,index){
            var points = [];
            if(option.tr){
                var trs = option.tr;
                for(var i = 0;i < trs.length; i ++){
                    if(trs[i].td){
                        var tds = trs[i].td;
                        for(var j = 0; j < tds.length; j++){
                            if(tds[j].check == "check"){
                                if(i == parentIndex && j == index){
                                    //自己
                                }else{
                                    points.push({
                                        trIndex : i,
                                        tdIndex : j
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return points;
        }
        //去掉最近的点选择状态
        function uncheckPoint(otherPoints,currentPoint){
            var nearest = getNearestPoint(otherPoints,currentPoint);

            if($scope.editTempOption)
                $scope.editTempOption.tr[nearest.trIndex].td[nearest.tdIndex].check = "";

            //删除其中一个点
            otherPoints.splice($.inArray(nearest,otherPoints),1);

            return otherPoints[0];
        }
        //获取最近的点
        function getNearestPoint(otherPoints,current){
            var cfg = {};

            var sort = sortPonit(otherPoints[0],otherPoints[1]);

            if(sort[0].trIndex == sort[1].trIndex){
                if(current.trIndex <= sort[0].trIndex &&
                    current.trIndex <= sort[1].trIndex){
                    //新点在上边
                    return sort[0];
                }else{
                    return sort[1];
                }
            }else{
                if(current.tdIndex <= sort[0].tdIndex &&
                    current.tdIndex <= sort[1].tdIndex){
                    //新点在左边
                    return sort[0];
                }else{
                    return sort[1];
                }
            }
            return cfg;
        }
        //根据位置分类两点
        function sortPonit(point1,point2){
            var cfg = [];
            //不同一列，分左右
            if(point1.tdIndex < point2.tdIndex){
                cfg.push(point1);
                cfg.push(point2);
            }else if(point1.tdIndex > point2.tdIndex){
                cfg.push(point2);
                cfg.push(point1);
            }else{
                //同一列，分上下
                if(point1.trIndex < point2.trIndex){
                    cfg.push(point1);
                    cfg.push(point2);
                }else{
                    cfg.push(point2);
                    cfg.push(point1);
                }
            }
            return cfg;
        }
        //框选两点中间的点
        function choosePonits(otherPoint,currentPoint){
            var points = sortPonit(otherPoint,currentPoint);

            var trs = $scope.editTempOption.tr;
            for(var i = 0;i < trs.length;i++){
                var tds = trs[i].td;
                for(var j = 0;j < tds.length;j++){
                    if((i >= points[0].trIndex && i <= points[1].trIndex) &&
                        (j >= points[0].tdIndex && j <= points[1].tdIndex)){
                        tds[j].check = "check";
                    }else{
                        tds[j].check = "";
                    }
                }
            }
        }
        //获取开始和结束的两个点
        function getStartAndEndPoint(otherPoints){
            var cfg = [{trIndex:7,tdIndex:7},{trIndex:0,tdIndex:0}];
            otherPoints.forEach(function(point){
                var sum = point.trIndex + point.tdIndex;
                var min = cfg[0].trIndex + cfg[0].tdIndex;
                var max = cfg[1].trIndex + cfg[1].tdIndex;
                if(sum < min)
                    cfg[0] = point;
                if(sum > max)
                    cfg[1] = point;
            });
            return cfg;
        }
        /******* 框选测点  End ***********************************/

        /*******  机柜图与温场 Start  *********************************/
        $scope.locationTempClk = function(){
            if($scope.tempConfig.json == undefined || $scope.tempConfig.json == ""){
                balert.show('danger','请选择设备！',3000);
                return;
            }
            $(".Test-Box-Choose").hide();
            $(".Test-Img-Temp").show();

            $http.get("data/nodeTemperature/"+$scope.tempConfig.json).success(function(data){
                $scope.editTempOption = data;
                setTempBoxSize();
            }).error(function(err){
                console.log("choosePointClk:"+err);
                $http.get("data/nodeTemperature/temp.json").success(function(data){
                    $scope.editTempOption = data;
                    setTempBoxSize();
                });
            });
        };
        function setTempBoxSize(){
            $scope.location.offsetTop = $scope.editTempOption.top;
            $scope.location.offsetLeft = $scope.editTempOption.left;

            var otherPoints = getOtherPoints($scope.editTempOption,-1,-1);
            var startEndPoint = getStartAndEndPoint(otherPoints);
            //计算温场框形状
            var width = 240;
            var height = 240;
            if(startEndPoint.length == 2){
                var widthSize = (startEndPoint[1].tdIndex - startEndPoint[0].tdIndex) + 1;
                var heightSize = (startEndPoint[1].trIndex - startEndPoint[0].trIndex) + 1;
                if(widthSize != heightSize){//长方形
                    var per = 240 / heightSize;
                    width = widthSize * per;

                    if(width > 480){
                        per = 480 / widthSize;
                        height = heightSize * per;
                        width = 480;
                    }

                    $(".edit-temp").css({"width":+width+"px","height":height+"px"});
                    $(".edit-temp-modal").css({"top":$scope.editTempOption.top+"px","left":$scope.editTempOption.left+"px"});
                    return;
                }
            }
            $(".edit-temp").css({"width": +width + "px", "height": height + "px"});
            $(".edit-temp-modal").css({"top":$scope.editTempOption.top+"px","left":$scope.editTempOption.left+"px"});
        }

        //机柜图片 本地图片
        var showImgFileDlg = undefined;
        $scope.showImgFile = function(){
            $scope.imgFiles = {
                catalog : "img/diagram",
                imageFile : undefined
            };
            showImgFileDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/showImgFile.html',
                show: false
            });
            showImgFileDlg.$promise.then(showImgFileDlg.show);

            $scope.changeCatalog($scope.imgFiles.catalog);
        };
        $scope.changeCatalog = function(catalog){
            ImageManageService.LoadImagesByPath(catalog).then(function(data){
                $scope.ImageFiles = data;
            });
        };
        $scope.clickImage = function(imageFile,$event){
            $scope.imgFiles.imageFile = imageFile;
            $($event.currentTarget).parent().find('div').removeClass("select-image");
            $($event.currentTarget).addClass("select-image");
        };
        $scope.selectImageFile = function(){
            if($scope.imgFiles == undefined || $scope.imgFiles.imageFile == undefined){
                //'请选择图片。'
                balert.show('danger', $scope.languageJson.Configuration.RemoteControl.Alert.SelectImage,3000);
                return;
            }
            $scope.editTempOption.img = $scope.imgFiles.imageFile;
            showImgFileDlg.hide();
        };

        //上传图片
        //type=file选择文件后触发的函数
        $scope.$on("fileSelected",function(event, msg) {
            $scope.file = msg;
        });
        $scope.file = undefined;
        $scope.uploadRackImg = function(){
            if($scope.file == undefined) return;
            if($scope.file.size > 512000){
                //'新增图片不能大于500K！'
                balert.show('danger', $scope.languageJson.Configuration.TopologyControl.ImageSizePrompt,3000);
                return;
            }

            uploadService.uploadFile($scope.file).then(function(data) {
                $scope.editTempOption.img = data;
            });
        };

        //鼠标松开后获取移动位置
        $(".edit-temp .edit-temp-modal").mouseup(function(){
            var dom = $(".edit-temp .edit-temp-modal")[0];
            //offsetTop offsetLeft
            $scope.location.offsetTop = dom.offsetTop;
            $scope.location.offsetLeft = dom.offsetLeft;
        });
        //小键盘移动位置
        $scope.wheelArrow = function(type){
            var dom = $(".edit-temp .edit-temp-modal")[0];
            if(type == "up")
                dom.style.top = (dom.offsetTop - parseInt($scope.location.multiplying))+"px";
            else if(type == "down")
                dom.style.top = (dom.offsetTop + parseInt($scope.location.multiplying))+"px";
            else if(type == "left")
                dom.style.left = (dom.offsetLeft - parseInt($scope.location.multiplying))+"px";
            else
                dom.style.left = (dom.offsetLeft + parseInt($scope.location.multiplying))+"px";

            $scope.location.offsetTop = dom.offsetTop;
            $scope.location.offsetLeft = dom.offsetLeft;
        };
        /*******  机柜图与温场 End  *********************************/

        var stop = undefined;
        $scope.start = function() {
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {
                loadActiveSignal();
            }, 2000);
        };
        $scope.start();

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.stop();
        });
    }
]);

// 设置页面
nurseController.controller('settingCtrl', ['$scope', '$modal', 'balert', 'bconfirm', 'IpService', 'userService', 'SystemSetting', 'TemplateService', 'equipmentTemplateService', 'equipmentService','uploadService',
    function ($scope, $modal, balert, bconfirm, IpService, userService, SystemSetting, TemplateService, equipmentTemplateService, equipmentService,uploadService) {
        //切换页面
        $scope.setIsShow = function (name) {
            if (name == "ThresholdSet")
                $scope.isThresholdSet = true;
            else
                $scope.isThresholdSet = false;
            if (name == "ChangePassword")
                $scope.isChangePassword = true;
            else
                $scope.isChangePassword = false;
            if (name == "IPSetting")
                $scope.isIPSetting = true;
            else
                $scope.isIPSetting = false;
            if (name == "ShowAbout")
                $scope.isShowAbout = true;
            else
                $scope.isShowAbout = false;
            if (name == "TimeSetting")
                $scope.isTimeSetting = true;
            else
                $scope.isTimeSetting = false;
            if (name == "SystemSetting")
                $scope.isSystemSetting = true;
            else
                $scope.isSystemSetting = false;
            if (name == "HomeSetting") {
                $scope.isHomeSetting = true;
                $(".setting-option").addClass("home-setting");
            }else{
                $scope.isHomeSetting = false;
                $(".setting-option").removeClass("home-setting");
            }
            if(name == "ConfigureMold")
                $scope.isConfigureMold = true;
            else
                $scope.isConfigureMold = false;
        };
        //region **************************** 封装输入密码 Start **************************************/
            //封装加密函数
        var inputPasswordDlg = null;
        $scope.showPasswordBox = function () {
            $scope.account = {
                loginId: localStorage.getItem("username")
            };
            inputPasswordDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/inputPassword.html',
                show: false
            });
            inputPasswordDlg.$promise.then(inputPasswordDlg.show);
        };
        $scope.overwriteOK = function (fun) {
            //重写点击事件
            $scope.keyDownControl = function (event) {
                if (event.which === 13) {
                    $scope.ok();
                }
            };
            $scope.ok = function () {
                if ($scope.account.password == undefined || $scope.account.password == "") {
                    //请输入密码！
                    balert.show('danger', $scope.languageJson.Header.Advanced.System.InputPrompt, 3000);
                    return;
                }
                userService.changePassword($scope.account.loginId, $scope.account.password).then(function (res) {
                    if (res == "OK") {
                        fun();
                        inputPasswordDlg.hide();
                    } else {
                        //密码错误！
                        balert.show('danger', $scope.languageJson.Header.Advanced.System.InputError, 3000);
                    }
                });
            };
        };
        //endregion **************************** 封装输入密码  End  **************************************/

        //region ****************************** 设置首页 Start **********************************/
        $scope.homeSettingClick = function (path) {
            $scope.setIsShow("HomeSetting");
            $scope.includePath = path;
        };
        //endregion ****************************** 设置首页  End  **********************************/

        //region ****************************** IP设置 Start **********************************/
        $scope.ipSettingClick = function (path) {
            $scope.setIsShow("IPSetting");
            $scope.includePath = path;
            //查询 IP、子网掩码、默认网关
            IpService.GetSystemIp().then(function (data) {
                var arr = data.split("|");
                if (arr.length != 3) {
                    //不支持当前系统！
                    balert.show('danger', $scope.languageJson.Header.Advanced.Ip.NotSystem, 3000);
                    return;
                }
                $scope.newIp = arr[0];
                $scope.netmask = arr[1];
                $scope.defaultGw = arr[2];
            });
        };
        $scope.ipSave = function () {
            var newIp = $("#newIp").val();
            var netmask = $("#netmask").val();
            var defaultGw = $("#defaultGw").val();
            var regIp = /^(?!^0(\.0){3}$)(?!^255(\.255){3}$)((25[0-5])|(2[0-4]\d)|(1\d{2})|(\d{2})|(\d))(\.((25[0-5])|(2[0-4]\d)|(1\d{2})|(\d{2})|(\d))){3}$/;
            if (!regIp.test(newIp)) {
                //IP格式不正确，请重新输入！
                balert.show('danger', $scope.languageJson.Header.Advanced.Ip.IpFormatError, 3000);
                return;
            }
            if (!regIp.test(netmask)) {
                //掩码格式不正确，请重新输入！
                balert.show('danger', $scope.languageJson.Header.Advanced.Ip.MaskFormatError, 3000);
                return;
            }
            if (!regIp.test(defaultGw)) {
                //网关格式不正确，请重新输入！
                balert.show('danger', $scope.languageJson.Header.Advanced.Ip.GatewayFormatError, 3000);
                return;
            }
            //修改IP后请稍等，3秒后将自动跳转页面，你确定要修改吗？
            bconfirm.show($scope, $scope.languageJson.Header.Advanced.Ip.Confirm).then(function (data) {
                if (data) {
                    IpService.SaveIp(newIp, netmask, defaultGw).then(function (data) {
                        if (data === "NotLinuxSystem") {
                            //不支持当前系统！
                            balert.show('danger', $scope.languageJson.Header.Advanced.Ip.NotSystem, 3000);
                        }
                    });
                    setInterval(function () {
                        //修改Ip成功！
                        balert.show('success', $scope.languageJson.Header.Advanced.Ip.Succeed, 3000);
                        window.location.href = "/login.html";
                    }, 3000);
                }
            });
        };
        //endregion ****************************** IP设置  End  **********************************/

        //region **************************************** 系统设置 Start *************************************/
        $scope.systemSettingClick = function (path) {
            $scope.setIsShow("SystemSetting");
            $scope.includePath = path;
        };

        $scope.systemControlClick = function (control) {
            $scope.systemControl = control;
            $scope.showPasswordBox();

            //重写ok函数
            $scope.overwriteOK(function () {
                if ($scope.systemControl == "shutdown") {
                    //关机中...请拔电源！
                    SystemSetting.Shutdown($scope.account.loginId, $scope.account.password).then(function (data) {
                    });
                    $(window.location).attr("href", "login.html");
                } else if ($scope.systemControl == "reboot") {
                    //重启成中...稍等2分钟！
                    SystemSetting.Reboot($scope.account.loginId, $scope.account.password).then(function (data) {
                    });
                    $(window.location).attr("href", "login.html");
                } else {
                    //重置Telnet/FTP
                    SystemSetting.Reset($scope.account.loginId, $scope.account.password).then(function (data) {
                    });
                    //'恢复完成！'
                    balert.show('success', $scope.languageJson.Header.Advanced.System.ResetSucceed, 3000);
                    $scope.cancel();
                }
            });
        };
        //endregion **************************************** 系统设置 END **************************************/

        //region **************************************** 修改密码 Start *************************************/
        $scope.changePassword = function (path) {
            $scope.setIsShow("ChangePassword");
            $scope.includePath = path;
            $scope.user = {};
            $scope.user.userName = localStorage.getItem("username");
            $scope.user.oldPwd = undefined;
            $scope.user.newPwd = undefined;
            $scope.user.newPwd2 = undefined;
        };

        $scope.updatePassword = function () {

            $scope.user.info = undefined;

            if ($scope.user.oldPwd === undefined ||
                $scope.user.newPwd === undefined ||
                $scope.user.newPwd2 === undefined) {
                balert.show("danger", $scope.languageJson.Header.User.Password.CurrPweError, 3000);//请输入完整
                return;
            }
            //输入验证
            var info =  inputValidation($scope.user.newPwd);
            if(info != undefined){
                var prompt = $scope.languageJson.Login.Prompt;
                if(info == "OutRange")
                    balert.show("danger", prompt.OutRange, 3000);
                else if(info == "SameCharacter")
                    balert.show("danger", prompt.SameCharacter, 3000);
                else if(info == "AllNumbers")
                    balert.show("danger", prompt.AllNumbers, 3000);
                else if(info == "ContinuousCharacter")
                    balert.show("danger", prompt.ContinuousCharacter, 3000);
                return;
            }

            if ($scope.user.newPwd !== $scope.user.newPwd2) {
                balert.show("danger", $scope.languageJson.Header.User.Password.AgninNewPwdError, 3000);//新密码两次输入不匹配，请重新输入
                return;
            }

            userService.updatePassword($scope.user.userName, $scope.user.oldPwd, $scope.user.newPwd).then(function (data) {
                if (data == "OK") {
                    balert.show("success", $scope.languageJson.Header.User.Password.Succeed, 3000);//"密码修改成功"
                    //$(window.location).attr("href", "login.html");
                } else {
                    var prompt = $scope.languageJson.Login.Prompt;
                    if (data == "Parameter Error")
                        balert.show("danger", prompt.ParameterError, 3000);//"参数错误！"
                    else if (data == "Current Password Incorrect")
                        balert.show("danger", prompt.PasswordError, 3000);//"当前密码不正确！"
                    else if (data == "DataBase Connection Failed")
                        balert.show("danger", prompt.DataBaseFailed, 3000);//"数据库连接失败！"
                    else if (data == "Modify Failed")
                        balert.show("danger", prompt.ModifyFailed, 3000);//"修改异常！"
                }
            });

            $scope.user = {};
        };

        function inputValidation(password){
            var info = undefined;

            if(password.length < 6 || password.length > 16){
                info = "OutRange";//密码长度6-16位数
            }
            var re = /(\w)*(\w)\2{2}(\w)*/g;
            if(re.test(password)){
                info = "SameCharacter";//不能连续三个相同的字符
            }
            re = /[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*/g;
            if(!re.test(password)){
                info = "AllNumbers";//不能全是数字
            }
            if(!LxStr(password)){
                info = "ContinuousCharacter";//不能连续的数字
            }
            return info;
        }
        //验证 是否是连续字符
        function LxStr(str){
            var arr = str.split('');
            var flag = true;
            for (var i = 1; i < arr.length-1; i++) {
                //如果不是数字则跳过当前循环，继续下一轮循环
                if(isNaN(arr[i-1])){
                    continue;
                }
                var firstIndex = arr[i-1];
                var secondIndex = arr[i];
                var thirdIndex = arr[i+1];
                thirdIndex - secondIndex == 1;
                secondIndex - firstIndex==1;
                if((thirdIndex - secondIndex == 1)&&(secondIndex - firstIndex==1)){
                    flag =  false;
                }

            }

            return flag;
        }
        //endregion **************************************** 修改密码 End *************************************/

        //region **************************************** 关于 Start *************************************/
        $scope.showAbout = function (path) {
            $scope.includePath = path;
            $scope.setIsShow("ShowAbout");

            setTimeout(function () {
                $("#aboutTitle").text(localStorage.getItem("userTitle"));
                $("#aboutLogo").attr("src", localStorage.getItem("userLogo"));
                settingStyle();
            }, 1);

            $scope.QRCode = {image: ''};
            userService.getQRCode().then(function (data) {
                var split = data.split("|");
                $scope.QRCode = {
                    title: split[0],
                    image: split.length >= 2 ? split[1] : ""
                };
            });
        };
        //endregion **************************************** 关于 End *************************************/

        //region *************************** 权限管理 Start ********************************/
        function parsePermission(data) {
            var cfg = [];
            var nick = $scope.languageJson.Account.Nickname;
            data.forEach(function (item) {
                if (item.userId > -2) {
                    if (item.isAdmin == "true" || item.isAdmin == true)
                        item.permission = nick.Administrator;/*"系统管理员"*/
                    else
                        item.permission = nick.Operator;/*"操作员"*/
                    cfg.push(item);
                }
            });
            return cfg;
        };

        function initPerm() {
            userService.getAllAccount().then(function (data) {
                $scope.Accounts = parsePermission(data);
            });
            var date = new Date();
            var year = date.getFullYear();
            $scope.minDate = year+"-01-01";
            $scope.maxDate = (year+10)+"-12-31";
        };
        var permissionManageDlg = undefined, accountInfoDlg = undefined;
        $scope.permissionManage = function () {
            initPerm();
            permissionManageDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/permissionManage.html',
                show: false
            });
            permissionManageDlg.$promise.then(permissionManageDlg.show);
        };

        $scope.addAccountClk = function () {
            $scope.Account = {};
            $scope.Account.title = $scope.languageJson.Account.Add;/*"新增"*/
            $scope.Account.isAdmin = "false";
            var date = new Date();
            var year = date.getFullYear();
            $scope.Account.validTime = (year+1)+"-"+(date.getMonth()+1)+"-"+date.getDate();
            accountInfoDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/accountInfo.html',
                show: false
            });
            accountInfoDlg.$promise.then(accountInfoDlg.show);
        };

        $scope.updAccountClk = function (acc) {
            $scope.Account = acc;
            $scope.Account.title = $scope.languageJson.Account.Modify;/*"修改"*/
            $scope.Account.oldPassword = acc.password;//存储加密的原密码
            accountInfoDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/accountInfo.html',
                show: false
            });
            accountInfoDlg.$promise.then(accountInfoDlg.show);
        };

        function isChina(s) {
            var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            if (!patrn.exec(s)) {
                return false;
            } else {
                return true;
            }
        }

        $scope.saveAccountClk = function () {
            if ($scope.Account.userName == undefined || $scope.Account.userName == "") {
                balert.show('danger', $scope.languageJson.Username.Title, 3000);/*'昵称不能为空!'*/
                return;
            }
            if ($scope.Account.logonId == undefined || $scope.Account.logonId == "") {
                balert.show('danger', $scope.languageJson.Username.Empty, 3000);/*'账户名不能为空!'*/
                return;
            }
            if (isChina($scope.Account.logonId)) {
                balert.show('danger', $scope.languageJson.Username.Chinese, 3000);/*'账户名不能有中文字符!'*/
                return;
            }
            var is = false;
            $scope.Accounts.forEach(function (item) {
                if (item.logonId == $scope.Account.logonId && item.userId != $scope.Account.userId)
                    is = true;
            });
            if (is) {
                balert.show('danger', $scope.languageJson.Username.Already, 3000);/*'账户名已存在!'*/
                return;
            }
            /*"新增"*/
            if ($scope.Account.title == $scope.languageJson.Account.Add && ($scope.Account.password == undefined || $scope.Account.password == "")) {
                balert.show('danger', $scope.languageJson.Username.Password, 3000);/*'密码不能为空!'*/
                return;
            }

            /*"新增"*/
            if ($scope.Account.title == $scope.languageJson.Account.Add) {
                userService.insertAccount($scope.Account).then(function (data) {
                    if (data == "OK") {
                        initPerm();
                        accountInfoDlg.hide();
                        balert.show('success', $scope.languageJson.Username.Added, 3000);/*'新增成功!'*/
                    } else
                        balert.show('danger', $scope.languageJson.Username.New, 3000);/*'新增失败!'*/
                });
            } else if ($scope.Account.title == $scope.languageJson.Account.Modify) {/*"修改"*/
                userService.updateAccount($scope.Account).then(function (data) {
                    if (data == "OK") {
                        initPerm();
                        accountInfoDlg.hide();
                        balert.show('success', $scope.languageJson.Username.Modified, 3000);/*'修改成功!'*/
                    } else
                        balert.show('danger', $scope.languageJson.Username.Fail, 3000);/*'修改失败!'*/
                });
            }
        };

        $scope.delAccountClk = function (userId) {
            userService.deleteAccount(userId).then(function (data) {
                if (data == "OK") {
                    initPerm();
                    balert.show('success', $scope.languageJson.Username.Deleted, 3000);/*'删除成功!'*/
                } else
                    balert.show('danger', $scope.languageJson.Username.Delete, 3000);/*'删除失败!'*/
            });
        };

        //是否显示修改按钮
        $scope.isShowButton = function(curr){
            //1、不显示locked为true的列
            if(curr.locked == "true" || curr.locked == true) return false;
            //2、当前列isAdmin为false显示
            if(curr.isAdmin == "false" || curr.isAdmin == false) return true;
            //3、不显示当前用户的列
            var userName = localStorage.getItem("username");
            if(curr.logonId == userName) return false;
            //4、当前用户locked为true显示其他管理员为false的列，否则隐藏
            var currAccount = undefined;
            if($scope.Accounts){
                $scope.Accounts.forEach(function(item){
                    if(item.logonId == userName)
                        currAccount = item;//获取当前登录的账户信息
                });
            }
            if(currAccount.locked != "true" && currAccount.locked != true){
                if(currAccount.isAdmin == "true" || currAccount.isAdmin == true) return false;
            }
            return true;
        };
        //endregion *************************** 权限管理 End ********************************/

        //region *************************** 退出 Start ********************************/
        $scope.exit = function () {
            $(".loading-bg span").html("Exiting...");
            $('.page-load').show();
            $('#wrapper').hide();

            var token = localStorage.getItem("token");
            userService.logout(token).then(function (data) {
                if (data === "OK") {
                    $(window.location).attr("href", "login.html");
                }
            });
        };

        //endregion *************************** 退出 End ********************************/

        //region ************************* 阀值设置 Start *********************/
        //加载设备模板
        function loadTemplate() {
            $scope.loading = true;
            equipmentTemplateService.getAllEquipmentTemplate().then(function (data) {
                $scope.equipmentTemplates = data;
                if ($scope.equipmentTemplates[0]) {
                    $scope.selectTemplateId = $scope.equipmentTemplates[0].EquipmentTemplateId;
                    loadTemplateEvent($scope.selectTemplateId);
                }
            });
        }

        //加载模板事件
        function loadTemplateEvent(templateId) {
            TemplateService.GetEventByEquipmentTemplateId(templateId).then(function (data) {
                TemplateService.GetEventConditionByEquipmentTemplateId(templateId).then(function (datas) {
                    $scope.EventConditions = parseEventCondition(data, datas);
                    $scope.loading = false;
                });
            });
        }

        function parseEventCondition(events, conditions) {
            var arr = [];
            if (events && conditions) {
                events.forEach(function (event) {
                    conditions.forEach(function (cond) {
                        if (event.EventId == cond.EventId) {
                            var cfg = {
                                EventId: event.EventId,
                                EventName: event.EventName,
                                EventSeverity: parseSeverity(cond.EventSeverity),
                                StartOperation: cond.StartOperation,
                                StartCompareValue: cond.StartCompareValue,
                                Meanings: cond.Meanings
                            };
                            arr.push(cfg);
                        }
                    });
                });
            }
            return arr;
        }

        function parseSeverity(level) {
            if (level == 0 || level == "0")
                return $scope.languageJson.AlarmRecord.PAlarm;//"提示"
            else if (level == 1 || level == "1")
                return $scope.languageJson.AlarmRecord.GAlarm;//"一般"
            else if (level == 2 || level == "2")
                return $scope.languageJson.AlarmRecord.IAlarm;//"重要"
            else if (level == 3 || level == "3")
                return $scope.languageJson.AlarmRecord.EAlarm;//"紧急"
        }

        $scope.isThresholdSetting = function (path) {
            $scope.setIsShow('ThresholdSet');
            $scope.includePath = path;

            setTimeout(function () {
                loadTemplate();
            }, 300);
        };

        $scope.isShowView = true;
        $scope.showViewClick = function () {
            $scope.isShowView = !$scope.isShowView;
        };

        $scope.selectTemplate = function (templateId) {
            $scope.loading = true;
            $scope.selectTemplateId = templateId;
            loadTemplateEvent(templateId);
        };

        //修改告警阀值 并 配置生效
        $scope.thresholdSetting = function () {
            //修改告警阀值
            var param = parseThresholdParam();
            if (param == "NaN") {
                //'存在异常参数！'
                balert.show('danger', $scope.languageJson.ThresholdSettings.Prompt.ExceptionParameter, 3000);
                return;
            }
            if (param.split("+")[1] == "") {
                //'未修改任何阀值！'
                balert.show('danger', $scope.languageJson.ThresholdSettings.Prompt.NoChangeValue, 3000);
                return;
            }

            $scope.showPasswordBox();

            $scope.overwriteOK(function () {
                $scope.loading = true;
                TemplateService.BatchModifyCondition(param).then(function (data) {
                    if (data == "OK") {
                        //配置生效
                        equipmentService.ReLoadFSU().then(function () {
                            //'修改成功，请等待配置生效！'
                            balert.show('success', $scope.languageJson.ThresholdSettings.Prompt.Succeed, 5000);
                            $scope.loading = false;
                        });
                    } else {
                        //'修改失败！'
                        balert.show('danger', $scope.languageJson.ThresholdSettings.Prompt.Failure, 3000);
                        $scope.loading = false;
                    }
                });
            });
        };

        //阀值设置的参数
        function parseThresholdParam() {
            // requestParams => TeamplateId+EventId1=CompareValue1|EventId2=CompareValue2|...

            var arr = [];
            var info = undefined;
            $(".threshold-setting table tbody tr td.value").each(function () {
                var id = $(this).find('input[type="hidden"]')[0].value;
                var val = $(this).find('input[type="text"]')[0].value;
                if (isNaN(val)) info = "NaN";
                if (val.indexOf(".") == (val.length - 1)) info = "NaN";
                if ($scope.EventConditions) {
                    $scope.EventConditions.forEach(function (cond) {
                        if (cond.EventId == id && cond.StartCompareValue != val)
                            arr.push(id + "=" + val);
                    });
                }
            });

            if (info != undefined) return info;

            var param = $scope.selectTemplateId + "+";
            arr.forEach(function (item) {
                param += item + "|";
            });
            return param;
        }

        //endregion ************************* 阀值设置 End *********************/

        //region ************************* 界面设置 Start **********************************/
        var changeHomeDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/changeHome.html',
            show: false
        });
        $scope.user = {};

        $scope.changeHome = function(){
            $scope.file = undefined;
            $scope.file2 = undefined;
            changeHomeDialog.$promise.then(changeHomeDialog.show);
            $scope.user.title = localStorage.getItem("userTitle");

            userService.getQRCode().then(function(data){
                var split = data.split("|");
                $scope.QRCode = {
                    title : split[0],
                    image : split.length >= 2 ? split[1] : ""
                };
            });
        };
        $scope.$on("fileSelected",function(event, msg) {
            $scope.file = msg;
        });
        $scope.$on("fileSelected2",function(event, msg) {
            $scope.file2 = msg;
        });

        $scope.updateHome = function(){
            if($scope.file && $scope.file.size > 512000){
                //图片大小不能大于500k
                balert.show("danger",$scope.languageJson.Header.User.Interface.LogoHint,3000);
                return;
            }
            if($scope.user.title == ""){
                //标题不能为空
                balert.show("danger",$scope.languageJson.Header.User.Interface.TitleError,3000);
                return;
            }
            userService.updateHome("userTitle",$scope.user.title).then(function(data){
                if(data == "OK"){
                    if($scope.file){
                        uploadService.uploadFile($scope.file).then(function(data) {
                            userService.updateHome("userLogo",data).then(function(resData){
                                if (resData == "OK") {
                                    getTitleAndLogo();
                                    //设置成功
                                    balert.show("success",$scope.languageJson.Header.User.Interface.Succeed,3000);
                                    changeHomeDialog.hide();
                                }else
                                    balert.show("danger",$scope.languageJson.Header.User.Interface.Error,3000);//设置失败
                            });
                        });
                    }else{
                        getTitleAndLogo();
                        //设置成功
                        balert.show("success",$scope.languageJson.Header.User.Interface.Succeed,3000);
                        changeHomeDialog.hide();
                    }
                }else
                    balert.show("danger",$scope.languageJson.Header.User.Interface.Error,3000);//设置失败
            });


            if($scope.file2 && $scope.file2.size > 512000){
                //图片大小不能大于500k
                balert.show("danger",$scope.languageJson.Header.User.Interface.LogoHint,3000);
                return;
            }
            if($scope.file2){
                uploadService.uploadFile($scope.file2).then(function(data) {
                    userService.setQRCode($scope.QRCode.title,data).then(function(data){
                        var d = data;
                    });
                });
            }else{
                userService.setQRCode($scope.QRCode.title,$scope.QRCode.image).then(function(data){
                    var d = data;
                });
            }
        };

        //更改登录界面
        var changeLoginDialog = $modal({
            scope: $scope,
            templateUrl: 'partials/changeLogin.html',
            show: false
        });
        $scope.login = {};

        $scope.changeLogin = function(){
            $scope.file = undefined;
            $scope.file2 = undefined;
            changeLoginDialog.$promise.then(changeLoginDialog.show);
        };
        $scope.updateLogin = function(){
            console.log(1)
            if($scope.user.title == ""){
                //标题不能为空
                balert.show("danger",$scope.languageJson.Header.User.Interface.TitleError,3000);
                return;
            }
            //上传第一张图片,也就是登录页背景图片
            uploadService.uploadFile($scope.file).then(function(data1){
                //上传第二张图片,也就是登录框背景图片
                uploadService.uploadFile($scope.file2).then(function(data2){
                    let paramsL = {
                        pageBg:data1,
                        infoBg:data2,
                        modalPosition:$scope.login.modalPosition
                    }
                    userService.settingLogin(paramsL).then(function(data){
                        var d= data;
                    });
                })
            })
        }

        function getTitleAndLogo(){
            userService.getTitleAndLogo().then(function(datas){
                var userTitle = datas.split("|")[0];
                var userLogo = datas.split("|")[1];
                localStorage.setItem("userTitle",userTitle);
                localStorage.setItem("userLogo",userLogo);
                $(document).attr("title",userTitle);
                $(".logotitle").text(userTitle);
                $(".logo").attr("src",userLogo);
            });
        };

        $scope.ResetQRCode = function(){
            $scope.QRCode = {
                title : '',
                image : ''
            };
        };
        //endregion ************************* 界面设置 End **********************************/

        //region ********************** 镶嵌页面 ************************
        $scope.includePathClick = function(name,path){
            $scope.setIsShow(name);
            $scope.includePath = path;
            setTimeout(function () {
                settingStyle();
            }, 1);
        };
        //修改为适合的风格
        function settingStyle(){
            $(".modal").css({
                "position":"unset",
                "display":"block"
            });
            $(".modal .modal-dialog").css({
                "width":"100%",
                "margin":"0px"
            });
            $(".modal .modal-header").hide();
        }
        //endregion

        //默认选中
        if (localStorage.getItem("isAdmin") == "true") {
            $scope.homeSettingClick('partials/include/homeSetting.html');
        } else {
            $scope.ipSettingClick('partials/include/ipSetting.html');
        }
    }
]);

nurseController.controller('structureCtrl',['$scope','$stateParams','$http','$compile','global','$interval','diagramService','ConfigureMoldService','$state','$timeout','activeDeviceService','$modal','userService','devcontrolService','balert','$rootScope','$location','CameraService','alarmService','Exporter','base64',
    function($scope,$stateParams,$http,$compile,global,$interval,diagramService,ConfigureMoldService,$state,$timeout,activeDeviceService,$modal,userService,devcontrolService,balert,$rootScope,$location,CameraService,alarmService,Exporter,base64){
        //region -------------- 静态框架 -------------------
        $scope.Structures = [];
        //生成HTML
        function initHtml(){
            $http.get("partials/templates/"+$stateParams.deviceBaseTypeId+".html").success(function(data) {
                var html = $compile(data)($scope);
                $("#root-structure")[0].appendChild(html[0]);
            });

            initPartConfigures();
        }
        initHtml();

        function initPartConfigures() {
            var ver = localStorage.getItem("versions");
            var home = localStorage.getItem("loginHome");
            if (ver == "IView") {
                home = home == undefined ? "#/astructure/8890" : home;
                localStorage.setItem("viewHome", "iview.html"+home);
            }else {
                home = home == undefined ? "#/astructure/1004" : home;
                localStorage.setItem("viewHome", "iview.html"+home);
            }

            ConfigureMoldService.GetStructureDevice($stateParams).then(function(data){
                $scope.devices = parseStructureDevices(data);
                if($scope.devices.length > 0)
                    setDiagramView($stateParams.deviceBaseTypeId,$scope.devices[0].parentId);
            });
        }
        //跳过不可见的设备
        function parseStructureDevices(data){
            var arr = [];
            if(data){
                data.forEach(function(item){
                    if(item.visible != false && item.visible != "false")
                        arr.push(item);
                });
            }
            return arr;
        }
        //加载组态视图
        function setDiagramView(devId,parentId) {
            $scope.select.selectedDeviceId = parseInt(devId);

            var param = $stateParams.deviceBaseTypeId + '.' + devId;

            var cfg = {};
            diagramService.getDiagramConfig(param).then(function(data) {
                if (data){
                    cfg.diagram = data;

                    cfg.diagram.deviceBaseTypeId = $stateParams.deviceBaseTypeId+"";
                    cfg.diagram.deviceId = devId+"";
                    $scope.diagram = cfg.diagram;
                    if(parentId != undefined)
                        $scope.diagram.parentId = parentId;
                    $stateParams.diagramview = 'structure';
                    $state.go($stateParams.diagramview, cfg);
                }
            });

            //$timeout / setTimeout
            $timeout(function () {
                initPosition();
                //默认初始化失败，0.2s后再初始化一次
                if($scope.isInitDefault == false)
                    initDefault();
            },200);

            //region 移动标签位置
            function initPosition(){
                if($scope.diagram && $scope.diagram.parts){
                    $scope.diagram.parts.forEach(function(part){
                        var cfg = $scope.GetMovePart(part);

                        var dom = $("div[partid='"+part.id+"']");
                        dom.css("left",cfg.left);
                        dom.css("top",cfg.top);
                        dom.css("width",cfg.width);
                        dom.css("height",cfg.height);
                    });
                }

                var dom = $("div[partid]");
                if(dom){
                    for(var i = 0; i < dom.length; i++){
                        var cfg = {
                            left : removePx($(dom[i]).css("left")),
                            top : removePx($(dom[i]).css("top")),
                            width : removePx($(dom[i]).css("width")),
                            height : removePx($(dom[i]).css("height"))
                        };
                        cfg = $scope.GetMovePart(cfg);
                    }
                    //给信号量列表添加默认值( 移动后再初始化 )
                    initDefault();
                }
            }
            //去掉"px" return float
            function removePx(val){
                return parseFloat(val.replace("px"));
            }
            //endregion
        }
        //选择设备
        $scope.changeDevice = function(url,value) {
            window.location = url;
            sessionStorage.setItem("currDeviceId",value);
        };

        //nWidth:DIV宽度 nHeight:DIV高度  raw:默认大小
        function getChartPercent(nWidth,nHeight,raw){
            if(nWidth > nHeight){
                return nHeight/raw;
            }else{
                return nWidth/raw;
            }
        }
        //初始化尺寸
        function initSizeFunction(){
            var sideMenuWidth = 200;
            var topBarHeight = 54;
            var screenDefaultWidth = 1280;
            var screenDefaultHeight = 1024;
            var bootstrapCollapseScreenWidth = 768;

            function initSize(){
                var ver = localStorage.getItem("versions");
                if(ver == "IView"){
                    sideMenuWidth = 150;
                    topBarHeight = 102;
                    bootstrapCollapseScreenWidth = 768;
                    screenDefaultHeight = 1080 - topBarHeight;
                    screenDefaultWidth = getIViewScreenWidth() - sideMenuWidth;
                    if(screen.width > 1280){
                        sideMenuWidth = sideMenuWidth + (getBlankWidth() / 2);
                    }else{
                        //微调偏差
                        screenDefaultHeight -= 70;
                        screenDefaultWidth += 30;
                    }
                }
            }

            function getRealScreenWidth() {
                return screen.width;
                //return window.innerWidth;
            }

            function getRealScreenHeight() {
                return screen.height;
                //return window.innerHeight;
            }

            function getRealX(relativeX) {
                var rX = parseFloat(relativeX);
                return (rX / screenDefaultWidth) * getRealScreenWidth();
            }

            function getRealY(relativeY) {
                var rY = parseFloat(relativeY);
                return (rY / screenDefaultHeight) * getRealScreenHeight();
            }

            function posX(relativeX) {
                var rX = getRealX(relativeX);

                if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
                    return rX + sideMenuWidth;
                } else {
                    return rX;
                }
            }

            function posY(relativeY) {
                var rY = getRealY(relativeY);

                return rY + topBarHeight;
            }
            //宽屏模式，IView宽屏
            function getIViewScreenWidth(){
                if(screen.width <= 1280) return screen.width;
                var height = window.innerHeight;
                var per = height / 800;
                var width = per * 1280;
                return width;
            }
            //宽屏模式，两边空白宽度
            function getBlankWidth(){
                return window.innerWidth - getIViewScreenWidth();
            }

            $scope.GetMovePart = function(cfg){
                if (cfg == undefined) return cfg;
                initSize();

                cfg = {
                    left: posX(cfg.left) + "px",
                    top: posY(cfg.top) + "px",
                    width: getRealX(cfg.width) + "px",
                    height: getRealY(cfg.height) + "px",
                    value : "0.0"
                };
                return cfg;
            };
        }
        initSizeFunction();
        //endregion

        //region -------------- 动态数据 -------------------
        function initBinding(){
            diagramService.updateBindingData($scope.diagram).then(function(data) {
                $scope.binddata = data;
            });

            //设备的实时状态
            activeDeviceService.getActiveDevices().then(function(data) {
                $scope.activeDevices = data;
            });
        }
        //$scope.diagram加载后初始化
        $scope.isInitDefault = false;
        function initDefault(){
            if ($scope.diagram) {
                diagramService.updateBindingData($scope.diagram).then(function(data) {
                    $scope.binddata = data;
                    parseSignalPart($scope.binddata);//信号量
                });
                initAlarmListPart();//实时告警
                initTablePart();//表格
                initPercentPart();//仪表联控
                initChartPart();//实时图表
                initHistoryChartPart();//历史图表
                initControlPart();//控制-数值控制

                $scope.isInitDefault = true;
            }
        }

        //region 实时值
        $scope.$watch('binddata', function(newValue, oldValue, $scope) {
            parseSignalPart(newValue);//信号量
            if($scope.diagram && newValue){
                $scope.diagram.parts.forEach(function(item){
                    parseChartPart(item);//实时图表-曲线图、柱形图
                    parseHistoryChartPart(item);//历史图表
                    var value = _.findWhere(newValue, {partId: item.id});
                    if(value !== undefined){
                        if(item.type == "labelpart") {
                            parseLabelPart(value,item);
                        }else if(item.type == "piechartpart"){//实时图表
                            var chartType = global.getpara("ChartType",item.options);
                            if(chartType == "newGauge"){//新仪表盘
                                parseNewGaugeChartPart(value,item);
                            }else if(chartType == "gauge"){//仪表盘
                                parseGaugeChartPart(value,item);
                            }else if(chartType == "pie"){//饼图
                                parsePieChartPart(value,item);
                            }
                        }else if(item.type == "imagesignalpart"){//环境量
                            parseImageSignalPart(value,item);
                        }else if(item.type == "devicestatuspart"){//设备状态
                            parseDeviceStatusPart(value,item);
                        }else if(item.type == "topologyspart"){//拓扑图
                            parseTopographyPart(value,item);
                        }else if(item.type == "virtualsignalpart"){//模拟量
                            parseVirtualSignalPart(value,item);
                        }else if(item.type == "percentpart"){//仪表联控
                            parsePercentPart(value,item);
                        }
                    }
                });
            }
        });
        //根据PartId获取对象
        function getPart(partId){
            var obj = undefined;
            if($scope.Structures){
                $scope.Structures.forEach(function(item){
                    if(item.partId == partId)
                        obj = item;
                });
            }
            return obj;
        }
        //遍历根据PartId
        function getPartConfigById(diagram, id) {
            var found = _.find(diagram.parts, function(part) {
                return part.id === id;
            });

            return found;
        }
        //遍历根据Type
        function getPartConfigByType(diagram, type) {
            var found = _.find(diagram.parts, function(part) {
                return part.type === type;
            });

            return found;
        }
        //endregion

        //region 文本
        function parseLabelPart(value,item){
            if(item.binding == "BS:0") return;
            var dom = $("div[partid='"+item.id+"']");

            dom.find(".panel-body td").text(value.currentValue);
        }
        //endregion

        //region 摄像头
        var cameraDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/cameradialog.html',
            show: false
        });
        $scope.showCamera = function(param){
            var split = param.split("_");
            if(split.length != 2) return;

            cameraDlg.$promise.then(cameraDlg.show);
            initCamera(param);
        };
        //加载摄像头配置
        function initCamera(cameraid){
            var camera = {};
            CameraService.getCamera(cameraid).then(function(data) {
                if(data=="") return;
                camera = eval( "(" + data + ")" );
                preview(camera);
            });
        }
        //预览摄像头
        function preview(camera){
            var ip = camera.ip,
                port = camera.port,
                username = camera.username,
                pwd = camera.userpwd,
                channelno = camera.channum;
            $scope.src="partials/camerapreview.html?ip="+ip+"&port="+port+"&user="+username+"&pwd="+pwd+"&channo="+channelno;
        }
        //endregion

        //region 环境量
        function parseImageSignalPart(value,item){
            //信号图片
            //alarmSeverity = 255:正常  0-3:告警 -255:通讯异常
            var severity = "normal";
            var level = parseInt(value.alarmSeverity);
            if(level >=0 && level <= 3) severity = "alarm";
            var elem = $("div[partid='"+item.id+"']");
            var img = global.getpara("Img",item.options);
            if(severity == "normal"){
                elem.find('.diagram-sigimg-img').css({"background-image": "url('" +img + "')"});
            }else{
                var tempimg = img.split('.');
                var alarmimg = tempimg[0]+".gif";
                elem.find('.diagram-sigimg-img').css({"background-image": "url('" +alarmimg + "')"});
            }
            //信号值与背景色
            if(value.alarmSeverity == 255 || value.alarmSeverity == "255"){
                elem.find('.diagram-sigimg-value').removeClass("signal-value-disconnect");
                elem.find('.diagram-sigimg-value').removeClass("signal-value-alarm");
                elem.find('.diagram-sigimg-value').addClass("signal-value-normal");
            }else if(value.alarmSeverity == -255 || value.alarmSeverity == "-255" || value.alarmSeverity === ''){
                elem.find('.diagram-sigimg-value').removeClass("signal-value-normal");
                elem.find('.diagram-sigimg-value').removeClass("signal-value-alarm");
                elem.find('.diagram-sigimg-value').addClass("signal-value-disconnect");
                if(value.currentValue == "")
                    value.currentValue = $scope.languageJson.Loading+"...";//加载中
            }else{// 0 提示  、  1 一般  、 2 重要 、 3 紧急 告警
                elem.find('.diagram-sigimg-value').removeClass("signal-value-normal");
                elem.find('.diagram-sigimg-value').removeClass("signal-value-disconnect");
                elem.find('.diagram-sigimg-value').addClass("signal-value-alarm");
            }
            elem.find(".diagram-sigimg-value").text(value.currentValue);
        }
        //endregion

        //region 信号量
        function parseSignalPart(newValue){
            var array = [];
            _.find(newValue, function(data) {
                if(data.partId.indexOf("signalgroup") > -1 && data.signalName != ""){
                    //region 修改显示名称
                    var item = getPartConfigById($scope.diagram,data.partId);
                    if(item){
                        var displayNames = global.getpara("DisplayName",item.options);
                        var displays = displayNames.split("-");
                        if(displays){
                            displays.forEach(function(dis){
                                if(dis.indexOf(".") > -1){
                                    var dev = dis.split(".");
                                    if(data.baseTypeId == dev[0])
                                        data.baseTypeName = dev[1];
                                }
                            });
                        }
                    }

                    //该设备状态
                    var is = false;
                    if($scope.activeDevices){
                        $scope.activeDevices.forEach(function(dev){
                            if(dev.status == "Disconnect" && data.deviceId == dev.id)
                                is = true;//通讯中断
                        });
                    }

                    //信号列表
                    if(data.alarmSeverity == 255){
                        if(is)	data.className = "signal-value-disconnect";
                        else data.className = "signal-value-normal";
                    }else if(data.alarmSeverity == -255 || value.alarmSeverity === ''){
                        data.className = "signal-value-disconnect";
                        if(data.currentValue == "")
                            data.currentValue = $scope.languageJson.Loading+"...";//加载中...
                    }else data.className = "signal-value-alarm";

                    array.push(data);
                }
            });
            
            if(array.length == 0) return;
            $scope.signalList = array;
        }
        //endregion

        //region 设备状态
        function parseDeviceStatusPart(value,item){
            var elem = $("div[partid='"+item.id+"']");

            if(value.currentValue == "Disconnect"){//灰色 横杆
                elem.find('.status-value i')[0].className = "fa fa-minus-circle alarmLevel9";
            }else if(value.currentValue == "Alarm"){//红色 感叹号
                elem.find('.status-value i')[0].className = "fa fa-exclamation-circle alarmLevel3";
            }else if(value.currentValue == "Normal"){//绿色 勾
                elem.find('.status-value i')[0].className = "fa fa-check-circle alarmLevel0";
            }
        }
        //endregion

        //region 实时告警
        $scope.levelFilter = {
            levelUrgent : true,
            levelImportant : true,
            levelCommon : true,
            levelTip : true
        };
        function initAlarmListPart(){
            var cfg = getPartConfigByType($scope.diagram,"alarmlistpart");
            if(cfg != undefined) $scope.alarmStart();
        }
        //筛选告警
        $scope.checkTest = function(type){
            if(type == 'levelUrgent')
                $scope.levelFilter.levelUrgent = !$scope.levelFilter.levelUrgent;
            else if(type == 'levelImportant')
                $scope.levelFilter.levelImportant = !$scope.levelFilter.levelImportant;
            else if(type == 'levelCommon')
                $scope.levelFilter.levelCommon = !$scope.levelFilter.levelCommon;
            else if(type == 'levelTip')
                $scope.levelFilter.levelTip = !$scope.levelFilter.levelTip;

            loadActiveAlarm();
        };
        //获取实时告警列表
        function loadActiveAlarm(){
            alarmService.updateActiveAlarmList().then(function(data) {
                $scope.ActiveAlarm = filterLevelAlarms(data);
            });
        }
        function filterLevelAlarms (data) {
            var farr = [];

            if ($scope.levelFilter.levelTip) farr.push(0);
            if ($scope.levelFilter.levelCommon) farr.push(1);
            if ($scope.levelFilter.levelImportant) farr.push(2);
            if ($scope.levelFilter.levelUrgent) farr.push(3);

            var ret = _.filter(data, function(alarm) {
                return _.contains(farr, parseInt(alarm.alarmLevel));
            });

            return ret;
        };
        //定时
        var alarmStop = undefined;
        $scope.alarmStart = function() {
            if (angular.isDefined(alarmStop)) return;
            loadActiveAlarm();
            alarmStop = $interval(function() {
                loadActiveAlarm();
            }, 3000);
        };
        $scope.alarmStop = function() {
            if (angular.isDefined(alarmStop)) {
                $interval.cancel(alarmStop);
                alarmStop = undefined;
            }
        };
        $scope.$on('$destroy', function() {
            $scope.alarmStop();
        });
        //endregion

        //region 模拟量
        function parseVirtualSignalPart(value,item){
            //类型
            var category = global.getpara("Category",item.options);
            //单位或含义
            var result = "";
            if(category == 1)
                result = global.getpara("Unit",item.options);
            else
                result = global.getpara("Meanings",item.options);
            //数据背景样式
            var dataBackground = global.getpara("DataBackground",item.options);
            var elem = $("div[partid='"+item.id+"']");
            if(dataBackground == "2"){
                if(value.alarmSeverity == "-255" || value.alarmSeverity == ""){
                    elem.find('.diagram-sigimg-value').removeClass("signal-value-normal");
                    elem.find('.diagram-sigimg-value').removeClass("signal-value-alarm");
                    elem.find('.diagram-sigimg-value').addClass("signal-value-disconnect");
                }else if(value.alarmSeverity == "255"){
                    elem.find('.diagram-sigimg-value').removeClass("signal-value-disconnect");
                    elem.find('.diagram-sigimg-value').removeClass("signal-value-alarm");
                    elem.find('.diagram-sigimg-value').addClass("signal-value-normal");
                }else{
                    elem.find('.diagram-sigimg-value').removeClass("signal-value-disconnect");
                    elem.find('.diagram-sigimg-value').removeClass("signal-value-normal");
                    elem.find('.diagram-sigimg-value').addClass("signal-value-alarm");
                }
            }else
                elem.find('.diagram-sigimg-value').addClass("diagram-sigimg-value-Transparency");

            //赋值
            var obj = getPart(value.partId);
            if(obj == undefined){
                $scope.Structures.push({
                    partId : value.partId,
                    value : value.currentValue+" "+result
                });
            }else
                obj.value = value.currentValue+" "+result;
        }
        //endregion

        //region 拓扑图
        function parseTopographyPart(value,item){
            var imgUpFile = global.getpara("imgUpFile",item.options);
            var upValue = global.getpara("upValue",item.options);
            var imgOpenFile = global.getpara("imgOpenFile",item.options);
            var openValue = global.getpara("openValue",item.options);

            var dom = $("div[partid='"+item.id+"']");
            var img = imgOpenFile;
            //闭合
            if(upValue == ""){
                if(parseFloat(value.floatValue) != parseFloat(openValue))
                    img = imgUpFile;
            }else{
                if(parseFloat(value.floatValue) == parseFloat(upValue))
                    img = imgUpFile;
            }
            //切换图片
            dom.find('.topology-img').css({
                "background-image": "url('" +img + "')"
            });
        }
        //endregion

        //region 仪表联控
        function initPercentPart(){
            $scope.diagram.parts.forEach(function(item){
                if(item.type == "percentpart"){
                    loadPercentPart(item);
                }
            });
        }
        function loadPercentPart(item){
            var elem = $("div[partid='"+item.id+"']");
            var chartObj = elem.find('.pie')[0];
            if(chartObj == undefined) return;
            var echart = echarts.init(chartObj);
            //百分比集合
            var percents = global.getpara("Percents",item.options);
            percents = parsePercentArr(percents);
            var unit = global.getpara("Unit",item.options);
            //自适应
            var per = getChartPercent(chartObj.clientWidth,chartObj.clientHeight,300);
            //修改字体大小
            var fontSize = per*26 > 20 ? 20 : per*26;
            elem.find('.percent-title').css("fontSize",fontSize+"px");
            //仪表盘
            var sysStyle = localStorage.getItem("systemStyle");
            $http.get("data/GaugeCharts.json").success(function(data){
                var option = data;
                //白色风格字体改为黑色
                if(sysStyle == "White")
                    option.title.textStyle.color = "#464952";
                //仪表盘
                option.series[0].min = 0.5;
                option.series[0].max = (percents == undefined ? 10 : percents.length) + 0.5;
                option.series[0].splitNumber = (percents == undefined ? 10 : percents.length)*2;
                option.series[0].axisLine.lineStyle.color = createColor(percents);
                option.series[0].radius = per*210;
                option.series[0].axisLine.lineStyle.width = per*30;
                option.series[0].axisLabel = {
                    formatter: function(v){
                        if((v+'').indexOf(".") > -1) return '';
                        else return v;
                    },
                    textStyle: {
                        fontSize: per*20
                    }
                };
                option.series[0].pointer.width = per*12;
                option.series[0].title.textStyle.fontSize = per*30;
                //赋值
                option.series[0].data[0].value = "0.0";
                option.series[0].data[0].name = "0.0 "+unit;
                //生成图像
                try {
                    window.onresize = echart.resize(); //使第一个图表适应
                    echart.setOption(option, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                //全局变量中查找是否已存在
                var obj = getPart(item.id);
                if(obj == undefined){
                    $scope.Structures.push({
                        partId : item.id,
                        percents : percents,
                        unit : unit,
                        chartOption : option,
                        echart : echart
                    });
                }else{
                    obj.percents = percents;
                    obj.unit = unit;
                    obj.chartOption = option;
                    obj.echart = echart;
                }
            });
        }
        //赋值
        function parsePercentPart(value,item){
            var obj = getPart(item.id);
            if(obj == undefined || obj.chartOption == undefined || obj.chartOption.series == undefined) return;

            var cfg =  meetConditions(value.currentValue,obj.percents);
            //赋值
            obj.chartOption.series[0].data[0].value = cfg.index;
            obj.chartOption.series[0].data[0].name = value.currentValue+" "+obj.unit;
            //生成图像
            try {
                window.onresize = obj.echart.resize(); //使第一个图表适应
                obj.echart.setOption(obj.chartOption, true);
            }catch(e){
                console.log("EChart Error:"+e.message);
            }
        }
        //获取Options中分段集合
        function parsePercentArr(percents){
            var objs = percents.split(";");
            var arr = [];
            if(objs){
                var index = 1;
                objs.forEach(function(item){
                    var obj = item.split("&");
                    var cfg = {
                        percent : parseFloat(obj[0]),
                        color : obj[1],
                        index : index
                    };
                    cfg = parseSection(cfg,obj[2]);
                    arr.push(cfg);
                    index ++;
                });
            }
            return arr;
        }
        function parseSection(cfg,section){
            var minSymbol = "";
            var minValue = "";
            var maxSymbol = "";
            var maxValue = "";
            if(section.indexOf("-∞") != -1){
                minSymbol = undefined;
            }else{
                if(section.indexOf("(") != -1){
                    minSymbol = ">";
                    minValue = parseFloat(section.substring(section.indexOf("(")+1,section.indexOf(",")));
                }else if(section.indexOf("[") != -1){
                    minSymbol = ">=";
                    minValue = parseFloat(section.substring(section.indexOf("[")+1,section.indexOf(",")));
                }
            }

            if(section.indexOf("+∞") != -1){
                maxSymbol = undefined;
            }else{
                if(section.indexOf(")") != -1){
                    maxSymbol = "<";
                    maxValue = parseFloat(section.substring(section.indexOf(",")+1,section.indexOf(")")));
                }else if(section.indexOf("]") != -1){
                    maxSymbol = "<=";
                    maxValue = parseFloat(section.substring(section.indexOf(",")+1,section.indexOf("]")));
                }
            }

            cfg.minSymbol = minSymbol;
            cfg.minValue = minValue;
            cfg.maxSymbol = maxSymbol;
            cfg.maxValue = maxValue;
            return cfg;
        }
        function createColor(percents){
            var color = [[0.2,"#59cd82"],[0.8,"#f7e140"],[1,"#f44b36"]];
            if(percents){
                color = [];
                percents.forEach(function(item){
                    var obj = [parseFloat(item.percent)/100,item.color];

                    color.push(obj);
                });
            }
            return color;
        }
        //当前值满足那个条件
        function meetConditions(value,percents){
            var cfg = {};
            if(percents){
                percents.forEach(function(per){
                    if(per.minSymbol != undefined){ // minSymbol 不为空 maxSymbol 可能为空
                        if(per.maxSymbol != undefined){
                            if(eval(value+per.minSymbol+per.minValue+" && "+value+per.maxSymbol+per.maxValue))
                                cfg = per;
                        }else{
                            if(eval(value+per.minSymbol+per.minValue))
                                cfg = per;
                        }
                    }else{// minSymbol 为空 maxSymbol 必然不为空
                        if(eval(value+per.maxSymbol+per.maxValue))
                            cfg = per;
                    }
                });
            }
            return cfg;
        }
        //endregion

        //region 实时图表
        //初始化EChart
        function initChartPart(){
            $scope.diagram.parts.forEach(function(item){
                if(item.type == "piechartpart"){
                    loadChartPart(item);
                }
            });
        }
        function loadChartPart(item){
            var elem = $("div[partid='"+item.id+"']");
            var chartobj = elem.find('.pie')[0];
            if(chartobj == undefined) return;
            var per = getChartPercent(chartobj.clientWidth,chartobj.clientHeight,300);
            var piechart = echarts.init(chartobj);
            var ChartCfg = {};
            ChartCfg.DataType = global.getpara("DataType",item.options);
            ChartCfg.LineColor = global.getpara("LineColor",item.options);
            ChartCfg.Y1Name = global.getpara("Y1Name",item.options);
            ChartCfg.Y1Min = global.getpara("Y1Min",item.options);
            ChartCfg.Y1Max = global.getpara("Y1Max",item.options);
            ChartCfg.Background = global.getpara("Background",item.options);
            ChartCfg.ChartType = global.getpara("ChartType",item.options);
            //iView屏隐藏导出按钮
            if(window.navigator.userAgent.indexOf("Windows") == -1)
                elem.find(".export-button").hide();

            if(ChartCfg.ChartType == "line")//曲线图
                initLineChartPart(piechart,ChartCfg,item);
            else if(ChartCfg.ChartType == "bar")//柱形图
                initBarChartPart(piechart,ChartCfg,item);
            else if(ChartCfg.ChartType == "gauge")//仪表盘
                initGaugeChartPart(piechart,ChartCfg,item,per,elem);
            else if(ChartCfg.ChartType == "pie") {//饼图
                ChartCfg.PieColor = global.getpara("PieColor",item.options);
                ChartCfg.PieValueType = global.getpara("PieValueType",item.options);
                ChartCfg.Unit = global.getpara("Unit",item.options);
                ChartCfg.Meaning = global.getpara("Meaning",item.options);
                initPieChartPart(piechart, ChartCfg, item, per);
            }else if(ChartCfg.ChartType == "newGauge")//新仪表盘
                initNewGaugeChartPart(item);
        }
        //region 获取实时值集合
        function parseChartPart(item){
            if(item.type == "piechartpart"){
                var chartType = global.getpara("ChartType",item.options);
                if(chartType == "line" || chartType == "bar"){
                    //获取数据集合
                    var list = getBaseTypes(item.binding);
                    var opt = [];
                    list.forEach(function(dom){
                        var value = _.findWhere($scope.binddata, {partId: item.id,deviceId:dom.deviceId,baseTypeId:dom.baseTypeId});
                        if(value == undefined || value.currentValue == undefined || value.currentValue == "") return;
                        opt.push(value);
                    });
                    if(chartType == "line"){//曲线图
                        parseLineChartPart(item,opt);
                    }else if(chartType == "bar"){//柱形图
                        parseBarChartPart(item,opt);
                    }
                }
            }
        }
        //获取基类集合
        function getBaseTypes(data){
            var list = [];
            var datas = data.split("&");
            for(var i = 0;i < datas.length;i++){
                if(global.getpara("BS",datas[i]) == -1) continue;
                var obj = {};
                obj.deviceId = global.getpara("DI",datas[i]);
                obj.baseTypeId = global.getpara("BS",datas[i]);
                list.push(obj);
            }
            return list;
        }
        //获取饼图含义
        function parsePieMeaning(meaning){
            if(meaning == undefined) return;
            var meanings = [];
            //meaning => 0.正常/1.异常
            var split1 = meaning.split("/");
            if(split1){
                split1.forEach(function(item){
                    var split2 = item.split(".");
                    var cfg = {
                        value : parseInt(split2[0]),
                        meaning : split2[1]
                    };
                    meanings.push(cfg);
                });
            }
            return meanings;
        }
        //endregion

        //region 曲线图
        function initLineChartPart(piechart,ChartCfg,item){
            var sysStyle = localStorage.getItem("systemStyle");
            $http.get("data/LineOrBarCharts.json").success(function(data) {
                var opt = data;
                //字体颜色
                if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
                    opt.title.textStyle.color = "#464952";
                    opt.legend.textStyle.color = "#464952";
                    opt.xAxis[0].axisLabel.textStyle.color = "#464952";
                    opt.yAxis[0].axisLabel.textStyle.color = "#464952";
                }
                //隐藏Y轴
                if(ChartCfg.Y1Name == "false")
                    opt.yAxis[0].show = false;
                else
                    opt.yAxis[0].name = ChartCfg.Y1Name;
                //最大值最小值
                opt.yAxis[0].min = ChartCfg.Y1Min;
                opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;
                //曲线颜色
                var colorArr = ["rgba(255, 127, 80, 0.6)","rgba(135, 206, 250, 0.6)","rgba(193, 35, 43, 0.6)","rgba(252, 206, 16, 0.6)","rgba(155, 202, 99, 0.6)"];
                //图表
                var arr = item.binding.split("&");
                var index = 0;
                for(var i = 1;i < arr.length;i++){
                    if(arr[i].indexOf("BS") == -1) continue;

                    var series = {
                        name : '',
                        type : 'line',
                        data : [],
                        /*itemStyle : {normal: {areaStyle: {
                                    color :  (function (){
                                        var zrColor = zrender.tool.color;
                                        return zrColor.getLinearGradient(
                                            0, 200, 0, 400,
                                            [[0, colorArr[index]],[0.1, 'rgba(255, 127, 80, 0)']]
                                        )
                                    })()
                                }}},*/
                        markPoint : {
                            data : [
                                {type : "max", name: $scope.languageJson.Configuration.ActiveChartControl.Function.MaxVal},
                                {type : "min", name: $scope.languageJson.Configuration.ActiveChartControl.Function.MinVal}
                            ]
                        }
                    };//"最大值" / "最小值"
                    index ++;
                    if(index >= colorArr.length) index = 0;
                    opt.series.push(series);
                }


                //默认值
                opt.xAxis[0].data[0]= ["加载中......"];

                try {
                    window.onresize = piechart.resize(); //使第一个图表适应
                    piechart.setOption(opt, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                //全局变量中查找是否已存在
                var obj = getPart(item.id);
                if(obj == undefined){
                    $scope.Structures.push({
                        partId : item.id,
                        chartOption : opt,
                        piechart : piechart
                    });
                }else{
                    obj.chartOption = opt;
                    obj.piechart = piechart;
                }
            });
        }
        function parseLineChartPart(item,opt){
            var obj = getPart(item.id);
            if(obj == undefined || obj.chartOption == undefined || obj.chartOption.series == undefined) return;

            if(opt.length > 0){
                obj.chartOption.yAxis[0].axisLabel.formatter = '{value}';
            }

            var legendData = [];
            var maxSize = 0;
            for(var i = 0;i < obj.chartOption.series.length;i++){
                var cfg = angular.fromJson(opt[i].currentValue);
                obj.chartOption.series[i].data = cfg.data;
                obj.chartOption.series[i].name = opt[i].deviceName + ' ' + opt[i].baseTypeName;
                legendData.push(opt[i].deviceName+' '+opt[i].baseTypeName);

                if(cfg.date.length > maxSize){
                    maxSize = cfg.date.length;
                    obj.chartOption.xAxis[0].data = cfg.date;
                }
            }
            obj.chartOption.legend.data = legendData;

            obj.chartOption.tooltip = {
                trigger: 'axis',
                formatter: function(params) {
                    var result = $scope.languageJson.Configuration.ActiveChartControl.Chart.Time+' : '+params[0].name + '<br/>';
                    for(var i = 0;i < params.length;i++){
                        result += opt[i].deviceName+' '+opt[i].baseTypeName  + ' : ' + params[i].value + ' ' + opt[i].unit + '<br/>';
                    }
                    return result;
                }
            };//采集时间

            try {
                window.onresize = obj.piechart.resize(); //使第一个图表适应
                obj.piechart.setOption(obj.chartOption, true);
            }catch(e){
                console.log("EChart Error:"+e.message);
            }
        }
        //endregion

        //region 柱形图
        function initBarChartPart(piechart,ChartCfg,item){
            var sysStyle = localStorage.getItem("systemStyle");
            $http.get("data/BarCharts.json").success(function(data){
                var opt = data;
                //字体颜色
                if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
                    opt.title.textStyle.color = "#464952";
                    opt.xAxis[0].axisLabel.textStyle.color = "#464952";
                    opt.yAxis[0].axisLabel.textStyle.color = "#464952";
                }
                //隐藏Y轴或者Y轴赋值
                if(ChartCfg.Y1Name == "false")
                    opt.yAxis[0].show = false;
                else
                    opt.yAxis[0].name = ChartCfg.Y1Name;
                //最大值最小值
                opt.yAxis[0].min = ChartCfg.Y1Min;
                opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;

                opt.series[0].itemStyle.normal.color = function(params) {
                    // build a color map as your need.
                    var index = params.dataIndex;
                    var colorList = angular.fromJson(ChartCfg.LineColor);
                    if(index >= colorList.length)
                        index = index % colorList.length;

                    return colorList[index];
                };
                opt.xAxis[0].data = ['Loaging...'];
                opt.series[0].data = [1];

                try {
                    window.onresize = piechart.resize(); //使第一个图表适应
                    piechart.setOption(opt, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                //全局变量中查找是否已存在
                var obj = getPart(item.id);
                if(obj == undefined){
                    $scope.Structures.push({
                        partId : item.id,
                        chartOption : opt,
                        piechart : piechart
                    });
                }else{
                    obj.chartOption = opt;
                    obj.piechart = piechart;
                }
            });
        }
        function parseBarChartPart(item,opt){
            if(opt.length == 0) return;
            var obj = getPart(item.id);
            if(obj == undefined || obj.chartOption == undefined) return;

            var names = [];
            var datas = [];
            opt.forEach(function(item){
                var cfg = angular.fromJson(item.currentValue);
                names.push(cfg.date[0]);
                datas.push(cfg.data[0]);
            });

            obj.chartOption.xAxis[0].data = names;
            obj.chartOption.series[0].data = datas;

            try {
                window.onresize = obj.piechart.resize(); //使第一个图表适应
                obj.piechart.setOption(obj.chartOption, true);
            }catch(e){
                console.log("EChart Error:"+e.message);
            }
        }
        //endregion

        //region 仪表盘
        function initGaugeChartPart(piechart,ChartCfg,item,per,elem){
            var sysStyle = localStorage.getItem("systemStyle");
            $http.get("data/GaugeCharts.json").success(function(data){
                var opt = data;
                //字体颜色
                if(sysStyle == "White" && ChartCfg.Background != "gray_bg") {
                    opt.title.textStyle.color = "#464952";
                }

                opt.series[0].name = ChartCfg.Y1Name;
                opt.series[0].min = parseFloat(ChartCfg.Y1Min);
                opt.series[0].max = parseFloat(ChartCfg.Y1Max);
                opt.series[0].axisLine.lineStyle.color = eval(ChartCfg.LineColor);
                //微模块PUE
                if(ChartCfg.DataType == 2){
                    opt.series[0].axisLabel.formatter = function (value, index) {
                        return value.toFixed(2);
                    };
                }
                //跳转字体、圆心等大小
                opt.series[0].radius = per*210;
                opt.series[0].axisLine.lineStyle.width = per*30;
                opt.series[0].axisLabel.textStyle.fontSize = per*20;
                opt.series[0].pointer.width = per*12;
                opt.series[0].title.textStyle.fontSize = per*30;
                //默认值
                opt.series[0].data[0].value = 0;
                opt.series[0].data[0].name = '';
                //AVG位置
                if(ChartCfg.DataType == 7){
                    opt.series[0].center = ["65%", "70%"];
                    opt.series[0].radius =  per*170;
                    elem.find(".avg-max-min .value").css("font-size",per*30+"px");
                    elem.find(".avg-max-min .name").css("font-size",per*15+"px");
                }
                try {
                    window.onresize = piechart.resize(); //使第一个图表适应
                    piechart.setOption(opt, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                //全局变量中查找是否已存在
                var obj = getPart(item.id);
                if(obj == undefined){
                    $scope.Structures.push({
                        partId : item.id,
                        chartOption : opt,
                        piechart : piechart
                    });
                }else{
                    obj.chartOption = opt;
                    obj.piechart = piechart;
                }
            });
        }
        function parseGaugeChartPart(value,item){
            var obj = getPart(item.id);
            if(obj == undefined || obj.chartOption == undefined) return;

            var dataType = global.getpara("DataType",item.options);
            if(dataType == 1){//实时信号
                obj.chartOption.series[0].data[0].value = value.floatValue;
                obj.chartOption.series[0].data[0].name = value.signalName +" = "+value.currentValue;
            }else if(dataType == 2){//MDC PUE
                obj.chartOption.series[0].data[0].value = value.floatValue;
                obj.chartOption.series[0].data[0].name = "PUE = "+value.floatValue;
            }else if(dataType == 3){//MDC 功率
                obj.chartOption.series[0].data[0].value = value.floatValue;
                obj.chartOption.series[0].data[0].name = $scope.languageJson.Configuration.ActiveChartControl.Chart.Power+" = "+value.floatValue+" kW";
            }else if(dataType == 6){//表达式
                var Y1Name = global.getpara("Y1Name",item.options);
                var cfg = angular.fromJson(value.currentValue);
                obj.chartOption.series[0].data[0].value = cfg.value;
                if(Y1Name != undefined && Y1Name != "")
                    obj.chartOption.series[0].data[0].name = Y1Name+" = "+cfg.value;
                else
                    obj.chartOption.series[0].data[0].name = cfg.value;
            }else if(dataType == 7){//平均值、最大值、最小值
                var elem = $("div[partid='"+item.id+"']");

                var cfg = angular.fromJson(value.currentValue);
                obj.chartOption.series[0].data[0].value = cfg.avg;
                obj.chartOption.series[0].data[0].name = "AVG = "+cfg.avg+" "+cfg.unit;

                elem.find('.max .value').html(cfg.max+" "+cfg.unit);
                elem.find('.min .value').html(cfg.min+" "+cfg.unit);
            }else
                return;
            try {
                window.onresize = obj.piechart.resize(); //使第一个图表适应
                obj.piechart.setOption(obj.chartOption, true);
            }catch(e){
                console.log("EChart Error:"+e.message);
            }
        }
        //endregion

        //region 饼图
        function initPieChartPart(piechart,ChartCfg,item,per){
            var sysStyle = localStorage.getItem("systemStyle");
            $http.get("data/PercentPieCharts.json").success(function(data){
                var opt = data;
                //字体颜色
                if(sysStyle == "White" && ChartCfg.Background != "gray_bg") {
                    opt.title.textStyle.color = "#464952";
                    opt.series[0].data[0].itemStyle.normal.label.textStyle.color = "#464952";
                    opt.series[0].data[1].itemStyle.normal.label.textStyle.color = "#464952";
                }
                //提示信息
                if(ChartCfg.PieValueType == "val") {
                    if(ChartCfg.Unit == undefined || ChartCfg.Unit == "")
                        opt.series[0].data[1].name = "";
                    else
                        opt.series[0].data[1].name = $scope.languageJson.Configuration.ActiveChartControl.Chart.Unit + ChartCfg.Unit;/*"Unit:"*/
                }else if(ChartCfg.PieValueType == "sw"){
                    opt.series[0].data[1].name = "";
                }else
                    opt.series[0].data[1].name = $scope.languageJson.Configuration.ActiveChartControl.Chart.Used;//"已使用" / ChartCfg.Y1Name;
                //调整
                opt.series[0].radius = [per*110,"55%"];
                opt.series[0].itemStyle.normal.label.textStyle.fontSize = per*40;
                opt.series[0].data[1].itemStyle.normal.label.textStyle.fontSize = per*20;
                if(ChartCfg.PieColor && ChartCfg.PieColor != "")
                    opt.color[1] = ChartCfg.PieColor;
                opt.title.textStyle.fontSize = per*30;
                //默认值
                opt.series[0].data[0].value = 1;
                opt.series[0].data[0].name = '';
                opt.series[0].data[1].value = 0;

                try {
                    window.onresize = piechart.resize(); //使第一个图表适应
                    piechart.setOption(opt, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                //全局变量中查找是否已存在
                var obj = getPart(item.id);
                if(obj == undefined){
                    $scope.Structures.push({
                        partId : item.id,
                        chartOption : opt,
                        piechart : piechart
                    });
                }else{
                    obj.chartOption = opt;
                    obj.piechart = piechart;
                }
            });
        }
        function parsePieChartPart(value,item){
            var cfg = angular.fromJson(value.currentValue);
            var obj = getPart(item.id);
            if(obj == undefined || obj.chartOption == undefined) return;
            //获取Options数据
            var PieValueType = global.getpara("PieValueType",item.options);
            var Y1Name = global.getpara("Y1Name",item.options);
            var Meaning = global.getpara("Meaning",item.options);
            var meanings = parsePieMeaning(Meaning);

            obj.chartOption.series[0].data[0].value = cfg.other;
            obj.chartOption.series[0].data[1].value = cfg.usage;
            if(PieValueType == "val"){
                obj.chartOption.series[0].itemStyle.normal.label.formatter = cfg.value;
                if(Y1Name != "")
                    obj.chartOption.title.text = Y1Name;
            }else if(PieValueType == "sw"){
                var m = getMeaningByValue(cfg.value,meanings);
                obj.chartOption.series[0].data[0].name = m;
                obj.chartOption.title.text = Y1Name;
            }else{
                obj.chartOption.series[0].itemStyle.normal.label.formatter = cfg.usage+' %';
                if(Y1Name != "")
                    obj.chartOption.title.text = Y1Name+" = "+cfg.value;
            }

            try {
                window.onresize = obj.piechart.resize(); //使第一个图表适应
                obj.piechart.setOption(obj.chartOption, true);
            }catch(e){
                console.log("EChart Error:"+e.message);
            }
        }
        function getMeaningByValue(value,meanings){
            var meaning = "";
            if(meanings){
                meanings.forEach(function(item){
                    if(item.value == value) meaning = item.meaning;
                });
            }
            return meaning;
        }
        //endregion

        //region 新仪表盘
        function initNewGaugeChartPart(part){
            var circle = loadPieChart(part.id,part,0);

            $scope.Structures.push({
                partId : part.id,
                circle : circle
            });
        }
        //生成图表框架
        function loadPieChart(partid,part,value){
            var elem = $('[partid='+partid+']');
            //微调
            var body = elem.find('.panel-body')[0];
            var per = getChartPercent(body.clientWidth,body.clientHeight,300);
            var size = per * 300;
            var radius = per * 100;
            var small = per * 20;
            var fine2 = 5 * per;
            var fontSize = per*42;
            //画布大小
            var circleGauge = elem.find('.new_gauge')[0];
            circleGauge.width = size;
            circleGauge.height = size;
            circleGauge.style.backgroundSize = size+'px';//背景图大小
            //仪表盘外的div
            var cirRoot = elem.find('.circle')[0];
            cirRoot.style.width = size + "px";
            cirRoot.style.fontSize = fontSize + "px";
            //实时值
            var cirVal = elem.find('.circle-value')[0];
            var cirName = elem.find('.circle-name')[0];
            var title = global.getpara("Title",part.options);
            if(title == "")
                cirVal.style.top = (size / 2) + "px";
            else
                cirVal.style.top = ((size / 2) + 34) + "px";
            //实时值宽度
            cirVal.style.width = size + "px";
            cirName.style.width = size + "px";
            cirVal.style.lineHeight = fontSize + "px";
            cirName.style.lineHeight = fontSize + "px";

            //设置圆环进度条的参数
            var circle = CircleProcess(circleGauge,{
                "size":"incomplete",
                "radius": radius,
                "percent": 0,
                "backgroundCircle":{
                    "show":false
                },
                "percentCircle":{
                    "show":false
                },
                "endSmallCircle":{
                    "show": true,
                    "borderColor": "#21b7fc",
                    "borderRadius": small,
                    "color": "#FFFFFF",
                    "radius": small-fine2
                },
                "processText":{
                    "show":false
                }
            });

            var min = parseFloat(global.getpara("Y1Min",part.options));
            var max = global.getpara("Y1Max",part.options) == "auto" ? 100 : parseFloat(global.getpara("Y1Max",part.options));
            var section = max - min;
            var per = (value / section) * 100;
            circle.option.percent = per > 100 ? 100 : per;

            return circle;
        }

        function parseNewGaugeChartPart(value,item){
            var reg = /(-?\d+)\.?\d+/g;
            var currentValue = "0.0";
            try{
                currentValue = value.currentValue.match(reg)[0];
            }catch (e) {
                currentValue = "0.0";
            }

            var obj = getPart(value.partId);
            if(obj == undefined){
                $scope.Structures.push({
                    partId : value.partId,
                    value : currentValue,
                    options : item.options
                });
            }else{
                obj.value = currentValue;
                obj.options = item.options;

                runCircle(obj);
            }
        }
        //圆点仪表盘
        function runCircle(obj){
            if(obj.circle == undefined) return;
            var min = parseFloat(global.getpara("Y1Min",obj.options));
            var max = global.getpara("Y1Max",obj.options) == "auto" ? 100 : parseFloat(global.getpara("Y1Max",obj.options));
            var section = max - min;
            var per = (obj.value / section) * 100;

            obj.circle.option.percent = per > 100 ? 100 : per;
            obj.circle.run();
        }
        //endregion
        //endregion
        
        //region 历史图表
        //region 初始化历史图表的EChart框架
        function initHistoryChartPart(){
            $scope.diagram.parts.forEach(function(item){
                if(item.type == "hspiechartspart"){
                    loadHistoryChartPart(item);
                }
            });
        }
        function loadHistoryChartPart(item){
            //组态对象
            var elem = $("div[partid='"+item.id+"']");
            var chartobj = elem.find('.pieChart')[0];
            var piechart = echarts.init(chartobj);
            //iView屏隐藏导出按钮
            if(window.navigator.userAgent.indexOf("Windows") == -1)
                elem.find(".export-button").hide();
            //配置信息
            var ChartCfg = {
                ChartType : global.getpara("ChartType",item.options),
                DataType : global.getpara("DataType",item.options),
                Background : global.getpara("Background",item.options),
                SingleBiaxial : global.getpara("SingleBiaxial",item.options),
                Y1Name : global.getpara("Y1Name",item.options),
                Y1Min : global.getpara("Y1Min",item.options),
                Y1Max : global.getpara("Y1Max",item.options),
                Y2Name : global.getpara("Y2Name",item.options),
                Y2Min : global.getpara("Y2Min",item.options),
                Y2Max : global.getpara("Y2Max",item.options)
            };
            //标题字体大小
            var per = getChartPercent(chartobj.clientWidth,chartobj.clientHeight,300);
            var fontSize = per*26 > 20 ? 20 : per*26;
            elem.find(".title").css("fontSize",fontSize+"px");

            var sysStyle = localStorage.getItem("systemStyle");
            var arr = item.binding.split("&");
            if(ChartCfg.SingleBiaxial == 1){//单轴历史曲线
                loadDefaultHistoryChartPart(item,ChartCfg,sysStyle,piechart,arr);
            }else{//双轴历史曲线
                loadHyperbolaHistoryChartPart(item,ChartCfg,sysStyle,piechart,arr);
            }
        }
        //  单轴历时曲线
        function loadDefaultHistoryChartPart(item,ChartCfg,sysStyle,piechart,arr){
            $http.get("data/LineOrBarCharts.json").success(function(data) {
                var opt = data;
                //字体颜色
                if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
                    opt.title.textStyle.color = "#464952";
                    opt.legend.textStyle.color = "#464952";
                    opt.xAxis[0].axisLabel.textStyle.color = "#464952";
                    opt.yAxis[0].axisLabel.textStyle.color = "#464952";
                }
                //隐藏Y轴
                if(ChartCfg.Y1Name == "false")
                    opt.yAxis[0].show = false;
                else
                    opt.yAxis[0].name = ChartCfg.Y1Name;
                //ECharts值
                opt.yAxis[0].min = ChartCfg.Y1Min;
                opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;
                for(var i = 0;i < arr.length;i ++) {
                    if(arr.length > 1 && arr[i].indexOf("BS") == -1) continue;

                    var ser = ChartCfg.DataType == 1 ? arr[i].split("|") : "BS:PUE".split("|");
                    for (var j = 0; j < ser.length; j++) {
                        if(ser[j].indexOf("BS") == -1) continue;
                        var series = {
                            name: '',
                            type: ChartCfg.ChartType,
                            data: [],
                            markPoint: {
                                data: [
                                    {type: "max", name: "最大值"},
                                    {type: "min", name: "最小值"}
                                ]
                            }
                        };

                        opt.series.push(series);
                    }
                    //默认值
                    opt.xAxis[0].data[0] = ["加载中......"];
                    try {
                        window.onresize = piechart.resize(); //使第一个图表适应
                        piechart.setOption(opt, true);
                    }catch(e){
                        console.log("EChart Error:"+e.message);
                    }
                    //全局变量中查找是否已存在
                    var obj = getPart(item.id);
                    if (obj == undefined) {
                        $scope.Structures.push({
                            partId: item.id,
                            chartOption: opt,
                            piechart: piechart
                        });
                    } else {
                        obj.chartOption = opt;
                        obj.piechart = piechart;
                    }
                }
            });
        }
        //  双轴历史曲线
        function loadHyperbolaHistoryChartPart(item,ChartCfg,sysStyle,piechart,arr){
            $http.get("data/HyperbolaCharts.json").success(function(data) {
                var opt = data;
                //字体颜色
                if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
                    opt.title.textStyle.color = "#464952";
                    opt.legend.textStyle.color = "#464952";
                    opt.xAxis[0].axisLabel.textStyle.color = "#464952";
                    opt.yAxis[0].axisLabel.textStyle.color = "#464952";
                    opt.yAxis[1].axisLabel.textStyle.color = "#464952";
                }
                //提示格式
                opt.tooltip.formatter = function(params) {
                    return params[0].name + '<br/>'
                        + params[0].seriesName + ' : ' + params[0].value+'<br/>'
                        + params[1].seriesName + ' : ' + params[1].value;
                };
                //隐藏Y轴
                if(ChartCfg.Y1Name == "false")
                    opt.yAxis[0].show = false;
                else
                    opt.yAxis[0].name = ChartCfg.Y1Name;
                if(ChartCfg.Y2Name == "false")
                    opt.yAxis[1].show = false;
                else
                    opt.yAxis[1].name = ChartCfg.Y2Name;
                //赋值
                opt.yAxis[0].min = ChartCfg.Y1Min;
                opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;
                opt.yAxis[1].min = ChartCfg.Y2Min;
                opt.yAxis[1].max = ChartCfg.Y2Max == "" ? "auto" : ChartCfg.Y2Max;
                opt.legend.data = [ChartCfg.Y1Name,ChartCfg.Y2Name];

                var ser1 = arr[1].split("|");
                for(var i = 0;i < ser1.length;i++){
                    if(ser1[i].indexOf("BS") == -1) continue;
                    var series = {
                        name : '',
                        type : ChartCfg.ChartType,
                        data : [],
                        markPoint : {
                            data : [
                                {type : "max", name: "最大值"},
                                {type : "min", name: "最小值"}
                            ]
                        }
                    };
                    opt.series.push(series);
                }
                var ser2 = arr[2].split("|");
                for(var i = 0;i < ser2.length;i++){
                    if(ser2[i].indexOf("BS") == -1) continue;
                    var series = {
                        name : '',
                        type : ChartCfg.ChartType,
                        yAxisIndex:1,
                        data : [],
                        markPoint : {
                            data : [
                                {type : "max", name: "最大值"},
                                {type : "min", name: "最小值"}
                            ]
                        }
                    };
                    opt.series.push(series);
                }

                //默认值
                opt.xAxis[0].data[0]= ["加载中......"];

                try {
                    window.onresize = piechart.resize(); //使第一个图表适应
                    piechart.setOption(opt, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
                //全局变量中查找是否已存在
                var obj = getPart(item.id);
                if (obj == undefined) {
                    $scope.Structures.push({
                        partId: item.id,
                        chartOption: opt,
                        piechart: piechart
                    });
                } else {
                    obj.chartOption = opt;
                    obj.piechart = piechart;
                }
            });
        }
        //endregion

        //region 历史图表EChart赋值
        function parseHistoryChartPart(item){
            if(item.type == "hspiechartspart"){
                var obj = getPart(item.id);
                if(obj == undefined) return;

                var arr = item.binding.split("&");
                var list = [];
                for(var i = 0 ; i < arr.length;i++){
                    if(arr[i].indexOf("BS") == -1) continue;
                    var sig = {};
                    sig.deviceId = global.getpara("DI",arr[i]);
                    sig.baseTypeId = global.getpara("BS",arr[i]);
                    list.push(sig);
                }

                var opt = [];
                var dates = [];
                var DataType = global.getpara("DataType",item.options);
                if(DataType == 1){//非PUE
                    var legendData = [];
                    list.forEach(function(devs){
                        var value = _.findWhere($scope.binddata, {partId: item.id,deviceId:devs.deviceId,baseTypeId:devs.baseTypeId});
                        if(value == undefined || value.currentValue == undefined) return;
                        var cfg = {};
                        var data = angular.fromJson(value.currentValue);
                        cfg.signalName = value.deviceName +" "+value.signalName;
                        cfg.datas = data.datas;
                        legendData.push(cfg.signalName);

                        dates = data.dates;
                        opt.push(cfg);
                    });
                    opt.legend = {
                        data : legendData
                    };
                }else{//PUE历史曲线
                    var value = _.findWhere($scope.binddata, {partId: item.id});
                    if(value == undefined || value.currentValue == undefined) return;
                    var cfg = {};
                    var data = angular.fromJson(value.currentValue);
                    cfg.signalName = "PUE";
                    cfg.datas = data.datas;
                    dates = data.dates;
                    opt.push(cfg);
                }


                var j = 0;
                for(var i = 0; i < obj.chartOption.series.length;i++){
                    if(obj.chartOption.series[i].name == undefined || opt.length <= j) continue;
                    obj.chartOption.series[i].name = opt[j].signalName;
                    obj.chartOption.series[i].data = opt[j].datas;
                    if(opt.legend != undefined && opt.legend.data.length > 0)
                        obj.chartOption.legend.data = opt.legend.data;
                    j ++;
                }
                obj.chartOption.xAxis[0].data = dates;

                try{
                    window.onresize = obj.piechart.resize(); //使第一个图表适应
                    obj.piechart.setOption(obj.chartOption, true);
                }catch(e){
                    console.log("EChart Error:"+e.message);
                }
            }
        }
        //endregion
        //endregion

        //region 控制
        var controlDlg = $modal({
            scope: $scope,
            templateUrl: 'partials/controlauthorizesetter.html',
            show: false
        });
        //region 数值控制  当前控制值
        function initControlPart(){
            $scope.diagram.parts.forEach(function(item){
                if(item.type == "controlpart"){
                    loadControlPart(item);
                }
            });
        }
        function loadControlPart(item){
            var styleType = global.getpara("StyleType",item.options);
            if(styleType == 'DataControl'){
                var elem = $("div[partid='"+item.id+"']");
                //设备编号与基类编号
                var deviceId = global.getpara("DeviceId",item.options);
                deviceId = deviceId == "" ? $stateParams.deviceBaseTypeId : deviceId;
                var baseTypeId = global.getpara('BS',item.binding);
                //控制类型
                var commdanType = global.getpara('CommdanType',item.options);
                diagramService.GetControlValueByBaseType(deviceId,baseTypeId).then(function(data){
                    if(commdanType == 1){
                        elem.find(".control-name").text(data.name);
                        elem.find(".control-value").val(data.value);
                        elem.find(".control-meaning").hide();
                    }else{
                        elem.find(".control-name").text(data.name);
                        var values = global.getpara('Values',item.options);
                        var obj = getMeaningByValue(values,data.value);
                        elem.find(".control-value").hide();
                        elem.find(".control-value").val(obj.value);
                        elem.find(".control-meaning").val(obj.name);
                    }
                });
            }
        }
        function getMeaningByValue(vals,val){
            var res = {value:0,name:"NotData"};
            var split1 = vals.split(";");
            var index = 0;
            if(split1){
                split1.forEach(function(item){
                    var split2 = item.split(".");
                    if(index == 0)	res = {value:split2[0],name:split2[1]};

                    if(parseInt(split2[0]) == parseInt(val))
                        res = {value:split2[0],name:split2[1]};
                    index ++;
                });
            }
            return res;
        }
        //减值
        $scope.MinusValue = function(partId){
            var elem = $("div[partid='"+partId+"']");//标签对象
            var item = getPartConfigById($scope.diagram,partId);//配置对象
            if(item == undefined) return;
            //控制类型 1遥调 、2遥控
            var commdanType = global.getpara('CommdanType',item.options);
            if(commdanType == 1){
                //获取当前值
                var val = elem.find(".control-value").val();
                //获取配置最小值
                var min = global.getpara("Min",item.options);
                if(parseFloat(val) <= parseFloat(min)) return;
                val = parseFloat(val) - 0.5;
                elem.find(".control-value").val(val);
                elem.find(".control-value").css("color","#5eb75e");
            }else{
                var values = global.getpara('Values',item.options);
                var obj = getControlValueArr(values);
                var val = elem.find(".control-index").val();
                //下标不能小于0
                val = parseInt(val)-1;
                if(val < 0) val = obj.length - 1;
                elem.find(".control-value").val(obj[val].value);
                elem.find(".control-meaning").val(obj[val].name);
                elem.find(".control-meaning").css("color","#5eb75e");
                //赋值
                elem.find(".control-index").val(val);
            }
        };
        //增值
        $scope.PlusValue = function(partId){
            var elem = $("div[partid='"+partId+"']");//标签对象
            var item = getPartConfigById($scope.diagram,partId);//配置对象
            if(item == undefined) return;
            //控制类型 1遥调 、2遥控
            var commdanType = global.getpara('CommdanType',item.options);
            if(commdanType == 1){
                var val = elem.find(".control-value").val();
                var max = global.getpara("Max",item.options);
                if(parseFloat(val)  >= parseFloat(max)) return;
                if((val+"").indexOf(".5") == -1){
                    val = Math.round(parseFloat(val)) + 0.5;
                }else {
                    val = parseFloat(val) +0.5;
                }
                elem.find(".control-value").val(val);
                elem.find(".control-value").css("color","#5eb75e");
            }else{
                var values = global.getpara('Values',item.options);
                var obj = getControlValueArr(values);
                var val = elem.find(".control-index").val();
                //下标不能大于集合
                val = parseInt(val)+1;
                if(val >= obj.length) val = 0;
                elem.find(".control-value").val(obj[val].value);
                elem.find(".control-meaning").val(obj[val].name);
                elem.find(".control-meaning").css("color","#5eb75e");
                //赋值
                elem.find(".control-index").val(val);
            }
        };
        //获取控制值集合
        function getControlValueArr(values){
            var split = values.split(";");
            var arr = [];
            if(split && split.length > 0){
                split.forEach(function(sp){
                    var split2 = sp.split(".");
                    if(split2.length == 2){
                        var val = split2[0];
                        var mes = split2[1];
                        arr.push({
                            value: val,
                            name : mes
                        })
                    }
                });
            };
            return arr;
        }

        //确定输入
        $scope.TransparentControl = function(partId){
            var elem = $("div[partid='"+partId+"']");//标签对象
            var val = elem.find(".control-value").val();//当值控制值
            var item = getPartConfigById($scope.diagram,partId);//配置对象
            //设备编号与基类编号
            var deviceId = global.getpara("DeviceId",item.options);
            deviceId = deviceId == "" ? $stateParams.deviceBaseTypeId : deviceId;
            var baseTypeId = global.getpara('BS',item.binding);
            //密码类型
            var pwdType = global.getpara('PwdType',item.options);
            if(pwdType == "NoPassword"){//无密码
                distributedControl(deviceId,baseTypeId,val,undefined);
            }else{
                $scope.controlinfo = {
                    isPwd : true,
                    isShow : true,
                    pwdType : pwdType,
                    Pwd : global.getpara('Pwd',item.options),
                    deviceid : deviceId,
                    controlid : baseTypeId,
                    optionType : val,
                    commdanType : 1
                };
                controlDlg.$promise.then(controlDlg.show);
            }
            //下发控制后字体颜色
            var sysStyle = localStorage.getItem("systemStyle");
            if(sysStyle == "White"){
                elem.find(".control-value").css("color","#464952");
                elem.find(".control-meaning").css("color","#464952");
            }else{
                elem.find(".control-value").css("color","#EBF3FF");
                elem.find(".control-meaning").css("color","#EBF3FF");
            }
        };
        //endregion
        $scope.validateauthority = function(partid){
            var config = getPartConfigById($scope.diagram,partid);
            $scope.controlinfo = {};
            //控制类型  1:遥调  2:遥控  3:控制联动
            $scope.controlinfo.commdanType = global.getpara('CommdanType',config.options);
            //样式类型  ImageButton:图片按钮  DataControl:数值控制
            $scope.controlinfo.styleType = global.getpara('StyleType',config.options);
            //密码类型  NoPassword:无密码  LoginPassword:登录密码  SharePassword:公共密码
            $scope.controlinfo.pwdType = global.getpara('PwdType',config.options);
            //设备编号与基类编号
            var deviceid = global.getpara('DeviceId',config.options);
            $scope.controlinfo.deviceid = (deviceid == "" ? $stateParams.deviceBaseTypeId : deviceid);
            $scope.controlinfo.controlid = global.getpara('BS',config.binding);
            //公共密码
            $scope.controlinfo.Pwd = global.getpara('Pwd',config.options);
            if($scope.controlinfo.commdanType == 1){//遥调
                if($scope.controlinfo.pwdType == "NoPassword")//无密码
                    $scope.controlinfo.isPwd = false;
                else//需要密码
                    $scope.controlinfo.isPwd = true;
                $scope.controlinfo.isShow = false;//显示遥调输入框
                //控制值 取值区间
                $scope.controlinfo.min = global.getpara("Min",config.options);
                $scope.controlinfo.max = global.getpara("Max",config.options);
                $scope.controlinfo.optionType = $scope.controlinfo.min;//控制值 默认为最小值
                $scope.controlinfo.optionValue = $scope.controlinfo.optionType;//控制的滑动尺标

                controlDlg.$promise.then(controlDlg.show);
            }else if($scope.controlinfo.commdanType == 2){//遥控
                if($scope.controlinfo.pwdType == "NoPassword")//无密码
                    directControl(config);
                else{
                    $scope.controlinfo.isPwd = true;//显示密码输入框
                    $scope.controlinfo.isShow = true;//隐藏遥调输入框
                    $scope.controlinfo.ctlValue = global.getpara("Ctlvalue",config.options);//控制值

                    controlDlg.$promise.then(controlDlg.show);
                }
            }else{//控制联动
                $scope.controlinfo.linkage = angular.fromJson(global.getpara("Linkage",config.options));

                if($scope.controlinfo.pwdType == "NoPassword") {//无密码
                    distributedLinkageControl()
                }else{//需要密码
                    $scope.controlinfo.isPwd = true;//显示密码输入框
                    $scope.controlinfo.isShow = true;//隐藏遥调输入框

                    controlDlg.$promise.then(controlDlg.show);
                }
            }
        };
        //无须密码直接下发
        function directControl(config){
            //密码类型
            var passwordType = global.getpara('PwdType',config.options);
            if(passwordType == "NoPassword"){//无密码
                var ControlType = global.getpara('CommdanType',config.options);
                if(ControlType == 2){//遥控
                    //参数
                    var deviceId = global.getpara('DeviceId',config.options);
                    deviceId = (deviceId == "" ? $scope.diagram.deviceId : deviceId);
                    var baseTypeId = global.getpara('BS',config.binding);
                    var value = global.getpara("Ctlvalue",config.options);
                    distributedControl(deviceId,baseTypeId,value);
                    return true;
                }
            }
            return false;
        }
        //下发控制
        function distributedControl(deviceId,baseTypeId,controlValue){
            var alert = $scope.languageJson.Configuration.RemoteControl.Alert;
            var userName = localStorage.getItem("username");
            devcontrolService.senddevcontrol(deviceId,baseTypeId,controlValue,userName).then(function(data){
                if(data == "success")
                    balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
                else
                    balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
            });
        }
        //下发联动控制
        function distributedLinkageControl(){
            var alert = $scope.languageJson.Configuration.RemoteControl.Alert;
            var userName = localStorage.getItem("username");

            devcontrolService.sendControlLinkage($scope.controlinfo.linkage, userName).then(function (data) {
                if(data == "success") {
                    balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
                    controlDlg.hide();
                }else
                    balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
            });
        }
        $scope.changeTest = function(value){
            $scope.controlinfo.optionValue = value;
        };
        $scope.changeValue = function(value){
            $scope.controlinfo.optionType = value;
        };
        //下发控制
        $scope.sendcontrol = function(){
            var alert = $scope.languageJson.Configuration.RemoteControl.Alert;
            //公共密码
            if($scope.controlinfo.pwdType == "SharePassword"){
                if($scope.controlinfo.userpwd != undefined && base64.encode($scope.controlinfo.userpwd) == $scope.controlinfo.Pwd)
                    sendDeviceControl(alert);
                else
                    balert.show('danger', alert.PasswordError,3000);//'密码不正确，请重新输入！'
            }
            //登录密码
            if($scope.controlinfo.pwdType == "LoginPassword"){
                userService.changePassword(localStorage.getItem("username"),$scope.controlinfo.userpwd).then(function(data){
                    if(data == "OK")
                        sendDeviceControl(alert);
                    else
                        balert.show('danger', alert.PasswordError,3000);//'密码不正确，请重新输入！'
                });
            }
            //无密码
            if($scope.controlinfo.pwdType == "NoPassword"){
                sendDeviceControl(alert);
            }
        };
        function sendDeviceControl(alert){
            var paras = $scope.controlinfo;
            if($scope.controlinfo.commdanType == 1){//遥调
                distributedControl(paras.deviceid,paras.controlid,paras.optionType);
            }else if($scope.controlinfo.commdanType == 2){//遥控
                paras.optionType = $scope.controlinfo.ctlValue;
                distributedControl(paras.deviceid,paras.controlid,paras.optionType);
            }else if($scope.controlinfo.commdanType == 3){//控制联动
                distributedLinkageControl();
            }
            $scope.controlinfo.userpwd = "";
            controlDlg.hide();
        }
        //endregion

        //region 表格
        function initTablePart(){
            $scope.diagram.parts.forEach(function(item){
                if(item.type == "tablepart"){
                    loadTable(item);
                }
            });
        }
        function loadTable(item){
            var head = global.getpara("Head",item.options);
            var rowsdata = global.getpara("Rows",item.options);

            var elem = $("div[partid='"+item.id+"']");

            var headarry = head.split(',');
            var rows = rowsdata.split('&');
            var tempvar = "";
            var result = "";
            var tr = "<tr class='ng-table-sort-header'>@</tr>";
            var str = "";
            for(var i=0;i<headarry.length;i++){
                tempvar+="<td>"+headarry[i]+"</td>"
                str += headarry[i];
            }
            if(str != "")
                result=tr.replace("@",tempvar);
            tr="<tr>@</tr>";
            for(var i=0;i<rows.length;i++){
                if(rows.length == 1 && rows[0] == "") break;
                tempvar="";
                var tds=rows[i].split(',');
                for(var j=0;j<tds.length;j++) {
                    if (tds[j].indexOf('{') == -1)
                        tempvar += "<td>" + tds[j] + "</td>";
                    else
                        tempvar += "<td class='pointer "+resultColorClass(tds[j])+"'>" + getBindValue(tds[j],item.id) + "</td>";
                }
                result+=tr.replace('@',tempvar);
            }
            var containerDiv = elem.find('.table');
            $compile(result)($scope).appendTo(containerDiv);
        }

        function getBindValue(signalbind,currpartid){
            var signal=signalbind.replace('{','').replace('}','').split(':');
            var baseTypeId = signal[1];
            return "{{tableValue('"+currpartid+"','"+baseTypeId+"')}}";
        }

        $scope.tableValue = function(partId,baseTypeId){
            var value=_.findWhere($scope.binddata, {partId:partId,baseTypeId:baseTypeId});
            if(value==undefined) return "loading..." ;
            return value.currentValue == undefined ? "" : value.currentValue;
        };

        function resultColorClass(signalbind){
            var signal=signalbind.replace('{','').replace('}','').split(':');
            var baseTypeId = signal[1];
            return "{{colorClass(\""+currpartid+"\",\""+baseTypeId+"\")}}";
        }
        $scope.colorClass = function(partId,baseTypeId){
            var value=_.findWhere(scope.binddata, {partId:partId,baseTypeId:baseTypeId});
            if(value==undefined) return "" ;
            if(parseInt(value.alarmSeverity) >= 0 && parseInt(value.alarmSeverity) <= 3 )
                return "alarmLevel3";
            else
                return "";
        };
        //endregion

        //region 根据PartId获取实时值
        $scope.getCurrentValue = function(partId){
            var obj = getPart(partId);
            if(obj == undefined)
                return "";
            else
                return obj.value;
        };
        //endregion

        //region 导出
        $scope.clickExport = function(partid,type){
            var chart = [];
            $scope.binddata.forEach(function(item){
                if(item.partId == partid && item.currentValue != $scope.languageJson.Loading+"...")//加载中
                    chart.push(item);
            });
            if(chart.length == 0) return;

            var item = getPartConfigById($scope.diagram,partid);

            var exportData = [];
            if(type == "piechartpart")
                exportData = getPieChatsExport(item,chart);
            else if(type == "hspiechartspart")
                exportData = getHistoryPieChatsExport(item,chart);

            if(exportData.length == 0) return;
            Exporter.toXls(exportData);
        };
        function getPieChatsExport(item,data) {
            var arr = [];

            var chartType = global.getpara("ChartType",item.options);//图表类型
            if(chartType == "line"){//曲线图
                arr.push({
                    name : $scope.languageJson.Configuration.ActiveChartControl.Chart.Name,
                    data : $scope.languageJson.Configuration.ActiveChartControl.Chart.Value,
                    date : $scope.languageJson.Configuration.ActiveChartControl.Chart.Time
                });//"名称" / "值" / "时间"
                for(var i = 0;i < data.length;i++){
                    var currValue = angular.fromJson(data[i].currentValue);
                    for(var j = 0;j < currValue.data.length;j ++){
                        var cfg = {};
                        cfg.name = data[i].deviceName+' '+data[i].baseTypeName;
                        cfg.data = currValue.data[j];
                        cfg.date = currValue.date[j];
                        arr.push(cfg);
                    }
                };
                return arr;
            }else
                if(chartType == "bar"){//柱形图
                arr.push({
                    name : $scope.languageJson.Configuration.ActiveChartControl.Chart.Name,
                    data : $scope.languageJson.Configuration.ActiveChartControl.Chart.Value
                });//"名称" / "值"
                for(var i = 0;i < data.length;i++){
                    var cfg = {};
                    cfg.name = data[i].deviceName+' '+data[i].baseTypeName;
                    cfg.data = data[i].floatValue;
                    arr.push(cfg);
                };
                return arr;
            }else
                if(chartType == "pie"){//饼图
                var chartArr = $scope.languageJson.Configuration.ActiveChartControl.Chart;
                arr.push({
                    name : chartArr.DataName,
                    data : chartArr.Data
                });// "数据名称" / "数据"

                var dataType = global.getpara("DataType",item.options);//数据类型
                for(var i = 0;i < data.length;i++){
                    var cfg = {};
                    if(dataType == 4){//MDC剩余空间
                        cfg.name = chartArr.Space;//"空间容量";
                        var value = angular.fromJson(data[i].currentValue);
                        cfg.data = value.usage+" %( "+value.value+" )";
                    }else if(dataType == 5){//IT负载
                        cfg.name = chartArr.Load;//"负载容量";
                        var value = angular.fromJson(data[i].currentValue);
                        cfg.data = value.usage+" %( "+value.value+" )";
                    }else if(dataType == 6){
                        cfg.name = global.getpara("Y1Name",item.options);//轴名称
                        var valueType = global.getpara("PieValueType",item.options);//值类型
                        if(valueType == "per"){//百分比
                            var value = angular.fromJson(data[i].currentValue);
                            cfg.data = value.usage+" %( "+value.value+" )";
                        }else if(valueType == "val"){//模拟量
                            var unit = global.getpara("Unit",item.options);//单位
                            var value = angular.fromJson(data[i].currentValue);
                            cfg.data = value.value+" "+unit;
                        }else if(valueType == "sw"){//开关量
                            var Meaning = global.getpara("Meaning",item.options);//含义
                            var meanings = parsePieMeaning(Meaning);
                            var value = angular.fromJson(data[i].currentValue);
                            var val = getMeaningByValue(value.value,meanings);
                            cfg.data = val+"( "+value.value+" )";
                        }
                    }
                    arr.push(cfg);
                }
                return arr;
            }else
                if(chartType == "gauge" || chartType == "newGauge"){//仪表盘 || 新仪表盘
                    var chartArr = $scope.languageJson.Configuration.ActiveChartControl.Chart;
                    arr.push({
                        name : chartArr.DataName,
                        data : chartArr.Data
                    });// "数据名称" / "数据"

                    var dataType = global.getpara("DataType",item.options);//数据类型
                    for(var i = 0;i < data.length;i++) {
                        var cfg = {};
                        if (dataType == 1) {//实时值
                            cfg.name = data[i].deviceName+" "+data[i].signalName;
                            cfg.data = data[i].currentValue;
                        }else if (dataType == 2){//PUE
                            cfg.name = "PUE";
                            cfg.data = data[i].currentValue;
                        }else if(dataType == 3){//MDC功率
                            cfg.name = chartArr.Power;//功率
                            cfg.data = data[i].currentValue;
                        }else if(dataType == 6){//表达式
                            cfg.name = global.getpara("Y1Name",item.options);//轴名称
                            var value = angular.fromJson(data[i].currentValue);
                            cfg.data = value.value;
                        }else if(dataType == 7){//平均值、最大值、最小值
                            var name = global.getpara("Y1Name",item.options);//轴名称
                            var value = angular.fromJson(data[i].currentValue);
                            arr.push({
                                name : name +" "+chartArr.Max,
                                data : value.max+" "+value.unit
                            });
                            arr.push({
                                name : name +" "+chartArr.Min,
                                data : value.min+" "+value.unit
                            });
                            cfg.name = name +" "+chartArr.Avg;
                            cfg.data = value.avg+" "+value.unit;
                        }
                        arr.push(cfg);
                    }
                    return arr;
                }
            return arr;
        }
        function getHistoryPieChatsExport(item,data) {
            var arr = [];
            arr.push({
                name : $scope.languageJson.Configuration.ActiveChartControl.Chart.Name,
                data : $scope.languageJson.Configuration.ActiveChartControl.Chart.Value,
                date : $scope.languageJson.Configuration.ActiveChartControl.Chart.Time
            });//"名称" / "值" / "时间"

            for(var i = 0;i < data.length;i++){
                var value = angular.fromJson(data[i].currentValue);
                for(var j = 0; j < value.datas.length;j++){
                    var cfg = {};
                    if(data[i].signalName == "")
                        cfg.name = "PUE";
                    else
                        cfg.name = data[i].deviceName +' '+ data[i].signalName;
                    cfg.data = value.datas[j];
                    cfg.date = value.dates[j];
                    arr.push(cfg);
                }
            }

            return arr;
        }
        //endregion

        //region 定时函数
        var stop = undefined;
        $scope.start = function() {
            // Don't start a new if we are already started
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {
                initBinding();
            }, 3000);
        };
        $scope.start();

        $scope.stop = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stop();
        });
        //endregion
        //endregion

        //region -------------- 设备详情 -------------------
        $scope.DeviceInfoClk = function(){
            if($scope.diagram == undefined || $scope.diagram.parentId == undefined){
                balert.show('danger',$scope.languageJson.Configuration.DetailsPrompt,3000);/*'该页面不是设备页面!'*/
                return;
            }
            $rootScope.parentId = $scope.diagram.parentId;
            sessionStorage.setItem("referrer",window.location.href);
            $location.path('/deviceInfo/' + $scope.diagram.deviceId);
        };
        //endregion
    }
]);