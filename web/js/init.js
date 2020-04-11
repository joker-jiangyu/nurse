//debugger;
//Loads the correct sidebar on window load,
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }


        // height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        // height = height - topOffset;
        // if (height < 1) height = 1;
        // if (height > topOffset) {
        //     $("#page-wrapper").css("min-height", (height) + "px");
        // }


    });

    //左边组态栏 选中样式
    $(".sidebar ul li a").click(function(event) {
        $(".navbar-static-top ul li a").removeClass('active');

        $(".sidebar ul li a").removeClass('active');
        $(event.currentTarget).addClass('active');
    });

    $(".sidebar ul li a:first").addClass('active');



    /*$(".fullscreen").bind("click",function() {
        var element = $("#diagramControl")[0];
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.msRequestFullscreen){
            element.msRequestFullscreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen();
        }
    });*/

    //-----heat beat-----
    var heatbeat=setInterval(function(){
        var dataObj = {};
        var dataAarray = [];
        var token = localStorage.getItem("token");
        dataAarray.push({
            K: "user.isLogin",
            V: token
        });
        dataObj.data = dataAarray;
        var encoded = JSON.stringify(dataObj);

        $.post('/data', encoded, function(data, textStatus, xhr) {
            var resObj = JSON.parse(data);
            var res = resObj[0].V;
            if (res.indexOf("TRUE") == -1) {
                clearInterval(heatbeat);
                $(window.location).attr("href", "login.html");
            }

        });
    },20000);


    //-----alarm notification-----
    var  pop;
    if(localStorage.getItem("lastalarmtime")==null)
        localStorage.setItem("lastalarmtime","1970-1-1");
    setInterval(function(){
        var dataObj = {};
        var dataAarray = [];
        dataAarray.push({
            K: "activeAlarm.lastedAlarm",
            V: ""
        });
        dataObj.data = dataAarray;
        var encoded = JSON.stringify(dataObj);

        $.post('/data', encoded, function(data, textStatus, xhr) {
            var resObj = JSON.parse(data);
            var res = resObj[0].V;
            if(res==="") return;
            var result = JSON.parse(res);
            var alarm = result.ret[0];
            if(alarm===undefined) return;

            var lastalarmtime =Date.parse(localStorage.getItem("lastalarmtime"));
            var currenttime = Date.parse(alarm.startTime);
            if(currenttime>(lastalarmtime+30000)) {
                pop = new Pop(alarm.alarmLevelName, alarm.alarmContent, alarm.startTime, "#/alarm/0");
                localStorage.setItem("lastalarmtime",alarm.startTime);

                if(localStorage.getItem("WarningTone") == "true"){
                    //语音播报功能，如：告警开始 XX设备 XX告警
                    jQuerySpeech(alarm.alarmContent);
                }else{
                    //语音提示功能，如：一级告警开始
                    alarmMusic(alarm.alarmLevel);
                }

            }
        });
    },3000);

    function alarmMusic(alarmLevel){
        //音频告警
        var audio = document.getElementById("abMusic");
        var url = "";
        if(alarmLevel == 3){
            url = "Sounds/EventSeverity3.wav";
        }else if(alarmLevel == 2){
            url = "Sounds/EventSeverity2.wav";
        }else if(alarmLevel == 1){
            url = "Sounds/EventSeverity1.wav";
        }else if(alarmLevel == 0){
            url = "Sounds/EventSeverity0.wav";
        }
        audio.setAttribute("src",url);
        audio.play();
    }

    function jQuerySpeech(content){
        try{
            //捕获点击事件
            var index = content.indexOf("[");
            if(index > -1) content = content.substring(0,(index-1));
            content = content.replace(/[A-Za-z]/g, function(i){return i+" ";});
            content = content.replace(/[~!@#$%^&*\[\]]/g, "");

            var ttsDiv = document.getElementById('bdtts_div_id');
            var ttsAudio = document.getElementById('tts_autio_id');

            // 这样就可实现播放内容的替换了
            ttsDiv.removeChild(ttsAudio);
            var au1 = '<audio id="tts_autio_id" autoplay="autoplay">';
            var sss = '<source id="tts_source_id" src="http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=3&text='+content+'" type="audio/mpeg">';
            var eee = '<embed id="tts_embed_id" height="0" width="0" src="">';
            var au2 = '</audio>';
            ttsDiv.innerHTML = au1 + sss + eee + au2;

            ttsAudio = document.getElementById('tts_autio_id');

            ttsAudio.play();
            /*
                &spd    选填    语速，取值0-9，默认为5中语速
                &pit    选填    音调，取值0-9，默认为5中语调
                &vol    选填    音量，取值0-15，默认为5中音量
                &per    选填    发音人选择, 0为普通女声，1为普通男生，3为情感合成-度逍遥，4为情感合成-度丫丫，默认为普通女声
            */
        }catch (e){}
    };
});
