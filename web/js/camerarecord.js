var cameraApp= angular.module('cameraApp',[]);

cameraApp.controller('cameraCtrl',function($http,$scope,$rootScope,$timeout){
    $scope.channelIDs = 1;//频道号 默认为1
    $scope.optMemory;//当前选择的存储配置
    $scope.videotape;//录像设备
    $(document).ready(function () {
        if($scope.languageJson == undefined)
            $scope.languageJson =  angular.fromJson(sessionStorage.getItem("languageJson"));
        var title = $scope.languageJson.Playback.Title;
        var voides = JudgeBrowsers();
        initvideoplugin(voides);
        inittree(voides);
        initVideotape();
        inittimeline();
        initdatetimepicker();
        setSystemStyle();
    });
    function initvideoplugin(voides) {
        if(voides != true) return;

        if (-1==WebVideoCtrl.I_CheckPluginInstall()) {
            $("#camera-plugin").innerHTML="<a href='files/WebComponentsKit.exe'  target='_black'> 您还未安装过插件，单击该连接下载安装！</a>";
            return;
        }
        var width=$("#camera-plugin").width();
        var height=$("#camera-plugin").height();
        WebVideoCtrl.I_InitPlugin(width, height, {
            iWndowType: 2,
            cbSelWnd: function (xmlDoc) {
                g_iWndIndex = $(xmlDoc).find("SelectWnd").eq(0).text();
            }
        });
        WebVideoCtrl.I_InsertOBJECTPlugin("camera-plugin");
    }
    function inittree(voides){
        var dataObj={};
        var dataArray = [];
        dataArray.push({
            K: 'videoEquipment.getAllPlayback',
            V: 'NA'
        });
        dataObj.data = dataArray;

        var result = [];//返回的数据
        $http({
            method: 'POST',
            url: '/data',
            data: dataObj,
            headers: {
                'Content-Type': 'text/plain'
            }
        }).then(function(response) {
                var obj = eval(response.data);
                if (angular.isArray(obj) & obj.length > 0 & obj[0].V!="]") {
                    result = eval(obj[0].V);
                    $scope.reocrdequipmen = result;
                    if(voides != true) return;
                    $scope.optMemory = result[0];//存放第一个存储设备数据
                    for(var i=0;i<result.length;i++){
                        var szIP = result[i].ip,
                            szPort = result[i].port,
                            szUsername = result[i].username,
                            szPassword = result[i].pwd,
                            szID = result[i].id;
                        WebVideoCtrl.I_Logout(szIP);
                        var iRet = WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
                            success: function (xmlDoc) {
                                setTimeout(function(){
                                    clickGetDigitalChannelInfo(szIP,$("#requipment"+szID));
                                },500);
                            },
                            error: function () {
                               // alert("请检测设备是否连接成功！");
                            }
                        });
                    }
                }
        });
    }
    function JudgeBrowsers(){
        var NV = {};
        var UA =  navigator.userAgent.toLowerCase();
        NV.name = (UA.indexOf("chrome")>0)?'chrome':'unkonw';
        NV.version = (NV.name=='chrome')?UA.match(/chrome\/([\d.]+)/)[1]:'0';
        var isIe = "ActiveXObject" in window;
        if(isIe) return true;
        if(NV.name === 'chrome' && parseInt(NV.version) <= 42) return true;//64bit chrome v34
    }

    function setSystemStyle(){
        var style = localStorage.getItem("systemStyle");
        var random = parseInt(10000*Math.random());
        if(style != undefined && style != "Blue")
            $("#Camera_StyleLink").attr("href", "../css/"+style+"Style.css?v=" + random);
        else
            $("#Camera_VersionLink").attr("href","../css/versions2.css?v="+random);

        $(".loginbody").addClass("body_bg");
    };


    function initVideotape(){
        var dataObj={};
        var dataArray = [];
        dataArray.push({
            K: 'videoEquipment.getAllMonitor',
            V: 'NA'
        });
        dataObj.data = dataArray;

        var result = [];//返回的数据
        $http({
            method: 'POST',
            url: '/data',
            data: dataObj,
            headers: {
                'Content-Type': 'text/plain'
            }
        }).then(function(response) {
                var obj = eval(response.data);
                if (angular.isArray(obj) & obj.length > 0) {
                    result = angular.fromJson(obj[0].V);//eval(V);
                    $scope.videotape = result;
                }
            });
    }
    function clickGetDigitalChannelInfo(ip,obj) {
        var szIP =ip, iAnalogChannelNum = 0;
        if ("" == szIP) return;
        // 模拟通道
        WebVideoCtrl.I_GetAnalogChannelInfo(szIP, {
            async: false,
            success: function (xmlDoc) {
                iAnalogChannelNum = $(xmlDoc).find("VideoInputChannel").length;
            }
        });

        var results = new Array();
        // 数字通道
        WebVideoCtrl.I_GetDigitalChannelInfo(szIP, {
            async: false,
            success: function (xmlDoc) {
                var oChannels = $(xmlDoc).find("InputProxyChannelStatus");
                $.each(oChannels, function () {
                    var values = {};
                    values.id = parseInt($(this).find("id").eq(0).text());
                    values.ipAddress = $(this).find("ipAddress").eq(0).text();
                    values.srcInputPort = $(this).find("srcInputPort").eq(0).text();
                    values.managePortNo = $(this).find("managePortNo").eq(0).text();
                    values.online = $(this).find("online").eq(0).text();
                    values.name= $(this).find("name").eq(0).text();
                    values.proxyProtocol = $(this).find("proxyProtocol").eq(0).text();
                    results.push(values);
                });

                $scope.reocrdequipmens = results;
                $scope.$apply();
            },
            error: function () {
                console.log(szIP + " 没有数字通道！");
            }
        });
    }
    function inittimeline(){
        var tld = "timeline";
        var tg1 = $("#placement").timeline({
            "min_zoom":1,
            "max_zoom":50,
            "show_centerline":true,
            "show_footer":true,
            "display_zoom_level":true,
            "event_modal":{type:"full"},
            "event_overflow":"scroll",
            "data_source":"#mylife"
        });

        /*setTimeout(function(){
            initrecordplay();
        },500);*/
    }
    function initrecordplay(){
        $("#mylife >.timeglider-event-spanning").on('click',function(){
            var starttime=$(this).attr("starttime");
            $("#currentdate").text(starttime);
        });
    }

    function initdatetimepicker(){
        $('.form_time').datetimepicker({

            weekStart: 1,
            todayBtn:  1,
            autoclose: 1,
            todayHighlight: 1,
            minView: 0,
            maxView: 1,
            forceParse: 0
        });/*language:  'zh-CN',*/
        var date = new Date();
        var starttime = date.getFullYear() + "-" +  (date.getMonth() + 1) + "-" +  date.getDate() + " 00:00:00";
        $("#starttime").val(starttime);
        $("#endtime").val(getNowFormatDate());
    }
    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        return currentdate;
    }
    $scope.setcurrentrecord = function(ip,par,obj){
        $scope.currentip=ip;
        $(".tree li").css("color","#fff");
        $("#"+ par.id+"_"+obj.id).css("color","#9E1F24");
        $scope.channelIDs = obj.id;
    };
    function searchrecord(iType){
        var xmlDoc = WebVideoCtrl.I_GetLocalCfg();
        var szStartTime=$("#starttime").val(),
            szEndTime=$("#endtime").val(),
            szIP = $scope.optMemory.ip,//"192.168.2.144",
            iChannelID = $scope.channelIDs,
            bZeroChannel =false;

        if ("" == szIP) return;
        if (bZeroChannel) return;
        // 首次搜索
        if (0 == iType) iSearchTimes = 0;
        WebVideoCtrl.I_RecordSearch(szIP, iChannelID, szStartTime, szEndTime, {
            iSearchPos: iSearchTimes * 40,
            success: function (xmlDoc) {
                if("MORE" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                    for(var i = 0, nLen = $(xmlDoc).find("searchMatchItem").length; i < nLen; i++) {
                        var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
                        if(szPlaybackURI.indexOf("name=") < 0) break;
                        var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
                        var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
                        szStartTime = szStartTime.replace("T", " ").replace("Z", "");
                        szEndTime =  szEndTime.replace("T", " ").replace("Z", "");
                        if(isstart)
                        {
                            videostarttime = szStartTime;
                            isstart = false;
                        }
                        recorddt += "<tr><td>"+szStartTime+"</td><td>"+szEndTime+"</td><td>ho</td><td>10</td><td></td></tr>";
                    }
                    iSearchTimes++;
                    searchrecord(1);// 继续搜索
                } else if ("OK" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                    var iLength = $(xmlDoc).find("searchMatchItem").length;
                    for(var i = 0; i < iLength; i++) {
                        var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
                        if(szPlaybackURI.indexOf("name=") < 0) break;
                        var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
                        var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
                        szStartTime = szStartTime.replace("T", " ").replace("Z", "");
                        szEndTime =  szEndTime.replace("T", " ").replace("Z", "");
                        recorddt += "<tr><td>"+szStartTime+"</td><td>"+szEndTime+"</td><td>ho</td><td>10</td><td></td></tr>";
                    }

                    var result = getinlinedata.replace("@data",recorddt);
                    result = result.replace("@videostarttime",videostarttime);

                    while($("#mylife").html()!==undefined){
                        $("#mylife").remove();
                    }

                    $("#timelinedata").children().remove();
                    $("#timelinedata").html(result);
                    inittimeline();
                } else if("NO MATCHES" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                    setTimeout(function() {
                        //alert(szIP + " 没有录像文件！");
                    }, 50);
                }
            },
            error: function () {
                //alert(szIP + " 搜索录像文件失败！");
            }
        });
    }

    function loginvideo(ip,port,username,pwd,channelno) {
        WebVideoCtrl.I_Logout(ip);
        var iRet = WebVideoCtrl.I_Login(ip, 1, port, username, pwd, {
            success: function (xmlDoc) {
                recorddt="";
                searchrecord(0);
            }
        });
    }
    $scope.fullscreen = function(){
        if(-1==WebVideoCtrl.I_CheckPluginInstall()) return;
        WebVideoCtrl.I_FullScreen(true)
    };

    $scope.getequipmentchannel = function(ip,port,username,pwd,channelno,obj) {
        WebVideoCtrl.I_Logout(ip);
        var iRet = WebVideoCtrl.I_Login(ip, 1, port, username, pwd, {
            success: function (xmlDoc) {
                clickGetDigitalChannelInfo(ip,obj);
            }
        });
    };
    $scope.optMemoryEquipment = function(prar){
        $scope.optMemory = prar;
    };
    $scope.changeWndNum = function(iType) {
        if (-1==WebVideoCtrl.I_CheckPluginInstall()) return;
        iType = parseInt(iType, 10);
        WebVideoCtrl.I_ChangeWndNum(iType);
    };
    var iSearchTimes = 0;
    var recorddt,getinlinedata,videostarttime,isstart=true;
    $scope.search = function(iType){
        videostarttime = getNowFormatDate();
        isstart=true;
        getinlinedata = "  <table style='display: none;' class='timeline-table' id='mylife' focus_date='@videostarttime'  size_importance='false' initial_zoom='6'>";
        getinlinedata +="<tr><th class='tg-startdate'></th><th class='tg-enddate'></th><th class='tg-date_limit'></th><th class='tg-importance'></th><th class='tg-title'></th></tr>@data</table>";
        loginvideo($scope.optMemory.ip,$scope.optMemory.port,$scope.optMemory.username,$scope.optMemory.pwd,iType);
    };

    $scope.getUrlParameter = function(name){
        var url = location.href;
        var parameters = url.substr(url.indexOf("?")+1);
        var paramItems = parameters.split("&");
        var paramName;
        var paramValue = "";
        for(i in paramItems)
        {
            paramName = paramItems[i].split("=")[0];
            paramValue = paramItems[i].split("=")[1];
            if(paramName.toLowerCase() == name.toLowerCase())
            {
                return(paramValue);
            }
        }
        return "";
    };

    //将时间转为yyyy-MM-dd HH:mm:ss格式字符串
    function getFormatDate(date) {
        date = new Date(date.getTime() - 1000*60*5 - 1000*26);
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + hour + seperator2 + minutes
            + seperator2 + seconds;
        return currentdate;
    }

    function getCurrentDate(){
        var curr = $("#currentdate").text();
        var str = curr;
        var index1 = curr.indexOf(":")-2;
        var index2 = curr.indexOf(":");
        var e = curr.substring(index1,index2);
        var str1 = curr.substring(0,index1);
        var str2 = curr.substring(index2);
        if(e == "24" || e == "00"){
            str = str1+"12"+str2;
        }else if(e == "12"){
            str = str1+"00"+str2;
        }
        return str;
    }
    //开始播放
    $scope.clickStartPlay=function(){
        var myTbody = document.getElementById("timelinedata").firstElementChild.lastElementChild;
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
            szDeviceIdentify = $scope.optMemory.ip,
            iRtspPort = 554,
            iStreamType = 1,//码流；1为主码流；2为子码流；3为第三码流；4为转码流
            bZeroChannel = false,
            iChannelID = $scope.channelIDs,//1
            szStartTime = myTbody.rows[1].cells[0].innerHTML,
            szEndTime = myTbody.rows[myTbody.rows.length-1].cells[1].innerHTML,
            bChecked = false,
            szPlayTime = getCurrentDate();
        //将时间转为yyyy-MM-dd HH:mm:ss格式
        szPlayTime = getFormatDate(new Date(Date.parse(szPlayTime.replace(/-/g,   "/"))));

        //实现选择时间段回放
        var dateStart = new Date(Date.parse(szStartTime.replace(/-/g,   "/")));
        var datePlay = new Date(Date.parse(szPlayTime.replace(/-/g,   "/")));
        var dateEnd = new Date(Date.parse(szEndTime.replace(/-/g,   "/")));
        if(datePlay>dateStart && datePlay<dateEnd){//当选择时间在查询时间段，则从选择时间段开始播放，否则从查询时间段开始播放
            szStartTime = szPlayTime;
        }

        if (null == szDeviceIdentify) {
            return;
        }

        if (bZeroChannel) {// 零通道不支持回放
            return;
        }

        var startPlayback = function () {
            if (bChecked) {// 启用转码回放
                var oTransCodeParam = {
                    TransFrameRate: "14",// 0：全帧率，5：1，6：2，7：4，8：6，9：8，10：10，11：12，12：16，14：15，15：18，13：20，16：22
                    TransResolution: "1",// 255：Auto，3：4CIF，2：QCIF，1：CIF
                    TransBitrate: "19"// 2：32K，3：48K，4：64K，5：80K，6：96K，7：128K，8：160K，9：192K，10：224K，11：256K，12：320K，13：384K，14：448K，15：512K，16：640K，17：768K，18：896K，19：1024K，20：1280K，21：1536K，22：1792K，23：2048K，24：3072K，25：4096K，26：8192K
                };
                WebVideoCtrl.I_StartPlayback(szDeviceIdentify, {
                    iRtspPort: iRtspPort,
                    iStreamType: iStreamType,
                    iChannelID: iChannelID,
                    szStartTime: szStartTime,
                    szEndTime: szEndTime,
                    oTransCodeParam: oTransCodeParam,
                    success: function () {

                    },
                    error: function (status, xmlDoc) {
                        if (403 === status) {
                            alert("设备不支持Websocket取流！");
                        } else {
                            alert("开始回放失败！");
                        }
                    }
                });
            } else {
                WebVideoCtrl.I_StartPlayback(szDeviceIdentify, {
                    iRtspPort: iRtspPort,
                    iStreamType: iStreamType,
                    iChannelID: iChannelID,
                    szStartTime: szStartTime,
                    szEndTime: szEndTime,
                    success: function () {

                    },
                    error: function (status, xmlDoc) {
                        if (403 === status) {
                            alert("设备不支持Websocket取流！");
                        } else {
                            alert("开始回放失败！");
                        }
                    }
                });
            }
        };

        if (oWndInfo != null) {// 已经在播放了，先停止
            WebVideoCtrl.I_Stop({
                success: function () {
                    startPlayback();
                }
            });
        } else {
            startPlayback();
        }

    };
    //停止播放
    $scope.clickStopPlay = function(){
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
        if (oWndInfo != null) {
            var iRet = WebVideoCtrl.I_Stop();
        }
    };
    //倒放
    $scope.clickReversePlay = function(){
        var myTbody = document.getElementById("timelinedata").firstElementChild.lastElementChild;
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
            szDeviceIdentify = $scope.optMemory.ip+"_"+$scope.optMemory.port,
            iRtspPort = 554,
            iStreamType = 1,
            bZeroChannel = false,
            iChannelID = $scope.channelIDs,//1,
            szStartTime = myTbody.rows[1].cells[0].innerHTML,
            szEndTime = myTbody.rows[myTbody.rows.length-1].cells[1].innerHTML;

        if (null == szDeviceIdentify) {
            return;
        }

        if (bZeroChannel) {// 零通道不支持倒放
            return;
        }

        var reversePlayback = function () {
            var iRet = WebVideoCtrl.I_ReversePlayback(szDeviceIdentify, {
                iRtspPort: iRtspPort,
                iStreamType: iStreamType,
                iChannelID: iChannelID,
                szStartTime: szStartTime,
                szEndTime: szEndTime
            });

            if (0 == iRet) {
                // "开始倒放成功！";
            } else {
                alert("开始倒放失败！");
            }
        };

        if (oWndInfo != null) {// 已经在播放了，先停止
            WebVideoCtrl.I_Stop({
                success: function () {
                    reversePlayback();
                }
            });
        } else {
            reversePlayback();
        }
    };
    //单帧
    $scope.clickFrame = function(){
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

        if (oWndInfo != null) {
            WebVideoCtrl.I_Frame({
                success: function () {
                    // "单帧播放成功！";
                },
                error: function () {
                    alert("单帧播放失败！");
                }
            });
        }
    };
    // 慢放
    $scope.clickPlaySlow = function() {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

        if (oWndInfo != null) {
            WebVideoCtrl.I_PlaySlow({
                success: function () {
                    //"慢放成功！";
                },
                error: function () {
                    alert("慢放失败！");
                }
            });
        }
    };
    // 快放
    $scope.clickPlayFast= function() {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

        if (oWndInfo != null) {
            WebVideoCtrl.I_PlayFast({
                success: function () {
                    //"快放成功！";
                },
                error: function () {
                    alert("快放失败！");
                }
            });
        }
    };
});