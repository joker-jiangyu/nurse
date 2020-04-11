//debugger;

(function() {
    getLogoAndTitle();
	if (!window.JSON) {
		window.JSON = {
			parse: function(sJSON) {
				return eval('(' + sJSON + ')');
			},
			stringify: (function() {
				var toString = Object.prototype.toString;
				var isArray = Array.isArray || function(a) {
					return toString.call(a) === '[object Array]';
				};
				var escMap = {
					'"': '\\"',
					'\\': '\\\\',
					'\b': '\\b',
					'\f': '\\f',
					'\n': '\\n',
					'\r': '\\r',
					'\t': '\\t'
				};
				var escFunc = function(m) {
					return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
				};
				var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
				return function stringify(value) {
					if (value === null) {
						return 'null';
					} else if (typeof value === 'number') {
						return isFinite(value) ? value.toString() : 'null';
					} else if (typeof value === 'boolean') {
						return value.toString();
					} else if (typeof value === 'object') {
						if (typeof value.toJSON === 'function') {
							return stringify(value.toJSON());
						} else if (isArray(value)) {
							var res = '[';
							for (var i = 0; i < value.length; i++)
								res += (i ? ', ' : '') + stringify(value[i]);
							return res + ']';
						} else if (toString.call(value) === '[object Object]') {
							var tmp = [];
							for (var k in value) {
								if (value.hasOwnProperty(k))
									tmp.push(stringify(k) + ': ' + stringify(value[k]));
							}
							return '{' + tmp.join(', ') + '}';
						}
					}
					return '"' + value.toString().replace(escRE, escFunc) + '"';
				};
			})()
		};
	}

	$(".input-group input").on('keydown', function (e) {
		var key = e.which;
		if (key == 13) {
			e.preventDefault();
			$("#btnLogin").click();
		}
	});

	$('#LoginId').click(function(event){
		if($("#LoginId").get(0).checked){
			var username = $("#username").val();
			var pwd = $("#pwd").val();
			if(username != "" && pwd != "")
				sessionStorage.setItem("UserNameAndPwd",username+"|"+baseEncode(username +"|"+pwd));
		}else{
			$("#pwd").val("");
			sessionStorage.setItem("UserNameAndPwd","");
		}
	});

	$("#btnLogin").click(function(event) {
		$("#showtime").remove();

        if(Remain == 0 || Remain == "0"){
			var language = JSON.parse(sessionStorage.getItem("languageJson"));
            $("#errText").text(language.Login.License.Prompt);/*"试用期结束，请点击右下角注册！"*/
            return;
        }

		var dataObj = {};
		var dataAarray = [];
		var username = $("#username").val();
		var pwd = $("#pwd").val();

		var dataValue = baseEncode(username +"|"+pwd);

		if($("#LoginId").get(0).checked){
			var split = ["",""];
			if(sessionStorage.getItem("UserNameAndPwd") != undefined)
				split = sessionStorage.getItem("UserNameAndPwd").split("|");
			//存储的用户名和密码与记录的用户名和密码相同
			if(username == split[0] && pwd == split[1]){
				dataValue = split[1];
				sessionStorage.setItem("UserNameAndPwd",username+"|"+dataValue);
			}else
				sessionStorage.setItem("UserNameAndPwd",username+"|"+baseEncode(username +"|"+pwd));
		}

		dataAarray.push({
			K: "user.login",
			V: dataValue
		});

		dataObj.data = dataAarray;

		var encoded = JSON.stringify(dataObj);

		$.post('/data', encoded, function(data, textStatus, xhr) {
			var resObj = JSON.parse(data);
			var res = resObj[0].V;

			if (res.indexOf("OK") != -1){
				var result = res.split("|");
				localStorage.setItem("username",username);
				localStorage.setItem("token",result[1]);
                localStorage.setItem("versions",result[2]);
                localStorage.setItem("isAdmin",result[3]);
				localStorage.setItem("needLogin","true");
                var loginHome = result[4];
				localStorage.setItem("systemStyle",result[5]);
				//上一次登入记录
				localStorage.setItem("LastLoginDate",result[6]);
				localStorage.setItem("LastLoginIP",result[7]);
				//自动登出时间
				localStorage.setItem("logoutTime",result[8]);

                localStorage.setItem("showHelp",true);
                if(loginHome && isNaN(loginHome)){
					if(result[2] == "IView")
						$(window.location).attr("href", "iview.html" + loginHome);
					else
						$(window.location).attr("href", "index.html" + loginHome);

					localStorage.setItem("loginHome",loginHome);
				}else{
					if(result[2] == "Room")
						$(window.location).attr("href", "index.html#/adevice/1004/adiagram");
					else if(result[2] == "2D")
						$(window.location).attr("href", "index.html#/mdcalarm");
					else if(result[2] == "3D")
						$(window.location).attr("href", "mdc.html");
					else
						$(window.location).attr("href", "iview.html#/adevice/8890/adiagram");
				}

			}else{
				var prompt = languageLogin.Prompt;

				var maxError = 0;
				if(res.indexOf("|") > -1) {
					var split = res.split("|");
					res = split[0];
					maxError = split[1];
				}

                if(res == "Password Error"){//密码错误
                    result = prompt.PasswordError;//"密码错误";
					initLoginLimit(maxError,languageLogin.Limit);
                }else if(res == "Username And Password Not Entered"){//未输入帐户和密码
                    result = prompt.NotEntered;//"未输入用户名和密码";
                }else if(res == "Enter Username And Password Error"){//输入帐户和密码错误
                    result = prompt.EnterError;//"输入的用户名和密码错误";
                }else if(res == "DataBase Connection Failed"){//数据库连接失败
                    result = prompt.DataBaseFailed;//"数据库连接失败";
                }else if(res == "Overdue"){
                    result = prompt.Overdue;//"用户已过期";
                }
				$("#errText").text(result);
			}
		});
        //删除Cookie
        setCookie('activeText',event.currentTarget.outerText,-1);
        function setCookie(c_name,value,expiredays)
        {
            var exdate=new Date();
            exdate.setDate(exdate.getDate()+expiredays);
            document.cookie=c_name+ "=" +escape(value)+
                ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
        }
	});

	//region 登录限制
	// login页面初始化 或 点击登入 密码错误 时执行此函数
	function initLoginLimit(maxError,limit){
		if(limit == undefined)
			limit = JSON.parse(sessionStorage.getItem('languageJson')).Login.Limit;

		//如果maxError 为 undefined则表示为 login 页面初始化
		if(maxError == undefined){
			var dataObj = {};
			var dataArray = [];
			dataArray.push({
				K: "user.getMaxError",
				V:""
			});
			dataObj.data = dataArray;

			var encoded = JSON.stringify(dataObj);
			$.post('/data', encoded, function(data, textStatus, xhr) {
				var numError = JSON.parse(data)
				var str = numError[0].V;
				if(str == undefined || str == "null") return;
				maxError = str;
				timeTransition(maxError,limit.Abnormal,limit.Unlock);
			});
			return;
		}
		timeTransition(maxError,limit.Abnormal,limit.Unlock);
	}
	// 时间转换
	function timeTransition(maxError,abnormal,unlock) {
		abnormal = abnormal.replace(/\[Count\]/ig, maxError);
		switch (parseInt(maxError)) {
			case 5:
				var endTime = new Date(new Date().getTime()+1000*60);
				jqueryAlert({
					'content' : '<div style="font-size: 30px">'+ abnormal+
						'<div id="showtime"></div> </div>',
					'closeTime' : 1000*60,
					'modal'        : true,
					'minWidth'     : '450'
				});
				break;
			case 6:
				var endTime = new Date(new Date().getTime()+1000*60*5);
				jqueryAlert({
					'content' : '<div style="font-size: 30px">' + abnormal+
						'<div id="showtime"></div></div> ',
					'closeTime' : 1000*60*5,
					'modal'        : true,
					'minWidth'     : '450'
				});
				break;
			case 7:
				var endTime = new Date(new Date().getTime()+1000*60*15);
				jqueryAlert({
					'content' : '<div style="font-size: 30px">' + abnormal+
						'<div id="showtime"></div></div> ',
					'closeTime' : 1000*60*15,
					'modal'        : true,
					'minWidth'     : '450'
				});
				break;
			case 8:
				var endTime = new Date(new Date().getTime()+1000*60*30);

				jqueryAlert({
					'content' : '<div style="font-size: 30px">' + abnormal+
						'<div id="showtime"></div></div> ',
					'closeTime' : 1000*60*30,
					'modal'        : true,
					'minWidth'     : '450'
				});
				break;
			case 9:
				var endTime = new Date(new Date().getTime()+1000*60*60);
				jqueryAlert({
					'content' : '<div style="font-size: 30px">' + abnormal+
						'<div id="showtime"></div> </div>',
					'closeTime' : 1000*60*60,
					'modal'        : true,
					'minWidth'     : '450'
				});
				break;
			case 10:
				var endTime = "永久";
				jqueryAlert({
					'content' : ' <div style="font-size: 30px">' + abnormal+
						'<div id="showtime"></div> </div>',
					'closeTime' : 1000*5,
					'modal'        : true,
					'minWidth'     : '450'
				});
				break;
		}

		//若 numError为5或以上则每秒都执行一次该方法
		if(maxError >= 5){
			//延迟一秒执行自己
			var interval = setInterval(function(){
				var bool= countTime(endTime,unlock);
				if(bool == true){
					clearInterval(interval);
				}
			},1000);
		}

	}

	function countTime(endTime,unlock) {
		if("永久"== endTime)return;
		//开始时间
		var nowDate = new Date();
		//结束时间
		//相差的总秒数
		var totalSeconds = parseInt((endTime - nowDate) / 1000);

		//取模（余数）
		var modulo = totalSeconds % (60 * 60 * 24);
		modulo = modulo % (60 * 60);
		//分钟
		var minutes = Math.floor(modulo / 60);
		//秒
		var seconds = modulo % 60;

		if( minutes <= 0 && seconds <= 0){
			return true;
		}
		//输出到页面
		unlock = unlock.replace(/\[m\]/ig, minutes);
		unlock = unlock.replace(/\[s\]/ig, seconds);
		//$("#showtime").html("解锁倒计时:"  + minutes + "分钟" + seconds + "秒");
		$("#showtime").html(unlock);

	}
	//endregion

    function getLogoAndTitle(){
        var dataObj = {};
        var dataArray = [];
        dataArray.push({
            K: "user.getTitleAndLogo",
            V: baseEncode("userTitle|userLogo")
        });
        dataObj.data = dataArray;

        var encoded = JSON.stringify(dataObj);
        $.post('/data', encoded, function(data, textStatus, xhr) {
            var resObj = JSON.parse(data);
            var res = resObj[0].V;
            var userTitle = res.split("|")[0];
            var userLogo = res.split("|")[1];
            localStorage.clear();
            localStorage.setItem("userTitle",userTitle);
            localStorage.setItem("userLogo",userLogo);
            $(document).attr("title",userTitle);
            $(".logotitle").text(userTitle);
            $(".logo").attr("src",userLogo);
        });

        if(sessionStorage.getItem("UserNameAndPwd") != undefined && sessionStorage.getItem("UserNameAndPwd")!= ""){
			var unap = sessionStorage.getItem("UserNameAndPwd").split("|");
            $("#username").val(unap[0]);
			$("#pwd").val(unap[1]);
            $("#LoginId").get(0).checked = true;
        }
    }


    function baseEncode(str){
		var c1, c2, c3;
		var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var i = 0;
		var len= str.length;
		var string = '';

		while (i < len){
			c1 = str.charCodeAt(i++) & 0xff;
			if (i == len){
				string += base64EncodeChars.charAt(c1 >> 2);
				string += base64EncodeChars.charAt((c1 & 0x3) << 4);
				string += "==";
				break;
			}
			c2 = str.charCodeAt(i++);
			if (i == len){
				string += base64EncodeChars.charAt(c1 >> 2);
				string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				string += base64EncodeChars.charAt((c2 & 0xF) << 2);
				string += "=";
				break;
			}
			c3 = str.charCodeAt(i++);
			string += base64EncodeChars.charAt(c1 >> 2);
			string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
			string += base64EncodeChars.charAt(c3 & 0x3F)
		}
		return string;
	}

    function getCookie(c_name){
        if (document.cookie.length>0)
        {
            c_start=document.cookie.indexOf(c_name + "=");
            if (c_start!=-1)
            {
                c_start=c_start + c_name.length+1;
                c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) c_end=document.cookie.length;
                return unescape(document.cookie.substring(c_start,c_end));
            }
        }
        return ""
    }

    var Remain = 999;
    function checkoutLicense() {
        var dataObj = {};
        var dataAarray = [];
        dataAarray.push({
            K: "license.CheckoutLicense",
            V: ""
        });

        dataObj.data = dataAarray;

        var encoded = JSON.stringify(dataObj);

        $.post('/data', encoded, function(data, textStatus, xhr){
            var resObj = JSON.parse(data);
            resObj = JSON.parse(resObj[0].V);
            if(resObj.IsShow == false || resObj.IsShow == "false"){
                $("#btnLicense").hide();
            }else{
				//linux系统隐藏注册按钮
				if(window.navigator.userAgent.indexOf("Windows") == -1)
					$("#btnLicense").hide();
				else {
					$("#btnLicense").show();
					$("#btnLicense span").html(resObj.Remain);
				}
                Remain = resObj.Remain;
            }
        });
    }

	var languageLogin = undefined;
    //中英文切换
	function getLanguage(){
		var dataObj = {};
		var dataAarray = [];
		dataAarray.push({
			K: "language.GetLoginLanguageJson",
			V: ""
		});
		dataObj.data = dataAarray;

		var encoded = JSON.stringify(dataObj);
		$.post('/data', encoded, function(data, textStatus, xhr){
			var resObj = JSON.parse(data);
			var json = JSON.parse(resObj[0].V);

			languageLogin = json.Login;
			parseValue(json);

			setLanguageSession(json.Language);
		});
	}
	getLanguage();

	function parseValue(json){
		//登录
		$("#username").attr("placeholder",json.Login.UserName);
		$("#pwd").attr("placeholder",json.Login.Password);
		$("#hint").html(json.Login.Hint);
		$("#btnLogin").html(json.Login.Login);
		$("#btnLicense").html(json.Login.Probation);
		//风格
		$("#ui-style").html(json.Login.Style.Title);
		$("#ui-blue").html(json.Login.Style.SkyBlue);
		$("#ui-white").html(json.Login.Style.TechnologyWhite);
		//语言
		$("#language").val(json.Language);
		//License
		$("#Register-License").html(json.Login.License.Title);
		$(".Generate-License").html(json.Login.License.GenerateLicense);
		$("#Upload-License").html(json.Login.License.UploadLicense);
		$("#Upload-License-Button").html(json.Login.License.UploadLicenseButton);

		checkoutLicense();
	}

	$("#language").change(function(){
		var language = $('#language option:selected').val();

		var dataObj = {};
		var dataAarray = [];
		dataAarray.push({
			K: "language.SetLanguage",
			V: language
		});
		dataObj.data = dataAarray;

		var encoded = JSON.stringify(dataObj);
		$.post('/data', encoded, function(data, textStatus, xhr){
			var resObj = JSON.parse(data);
			var json = JSON.parse(resObj[0].V);
			parseValue(json);

			setLanguageSession(json.Language);
		});
	});

	//存储中英文到Session
	function setLanguageSession(language){
		var url = undefined;
		if(language == "Chinese") url = "../data/language/ch.json";
		else url = "../data/language/en.json";
		$.getJSON(url,function(data){
			sessionStorage.setItem('languageJson.language', data.Language);
			sessionStorage.setItem("languageJson",JSON.stringify(data));

			initLoginLimit(undefined,data.Login.Limit);
		});
	}

	//是否需要登录
	function needLogin(){
		var dataObj = {};
		var dataAarray = [];
		dataAarray.push({
			K: "user.needLogin",
			V: ""
		});
		dataObj.data = dataAarray;

		var encoded = JSON.stringify(dataObj);
		$.post('/data', encoded, function(data, textStatus, xhr){
			var resObj = JSON.parse(data);
			var res = resObj[0].V;
			if(res != "TRUE"){
				var result = res.split("|");
				localStorage.setItem("versions",result[0]);
				localStorage.setItem("isAdmin",result[1]);
				localStorage.setItem("needLogin","false");
				localStorage.setItem("systemStyle",result[3]);
				localStorage.setItem("username",result[4]);
				var loginHome = result[2];

				localStorage.setItem("showHelp",true);
				if(loginHome && isNaN(loginHome)){
					$(window.location).attr("href", "index.html"+loginHome);
					localStorage.setItem("loginHome",loginHome);
				}else{
					if(result[0] == "Room")
						$(window.location).attr("href", "index.html#/adevice/1004/adiagram");
					else if(result[0] == "2D")
						$(window.location).attr("href", "index.html#/mdcalarm");
					else if(result[0] == "3D")
						$(window.location).attr("href", "mdc.html");
					else
						$(window.location).attr("href", "iview.html#/adevice/8890/adiagram");
				}
			}
		});
	}
	needLogin();

	/* 风格切换 */
	$("#systemStyle").change(function(){
		var oldStyle = $('#systemStyle option:selected').val();

		var dataObj = {};
		var dataAarray = [];
		dataAarray.push({
			K: "systemStyle.SetSystemStyle",
			V: oldStyle
		});
		dataObj.data = dataAarray;

		var encoded = JSON.stringify(dataObj);
		$.post('/data', encoded, function(data, textStatus, xhr){
			var resObj = JSON.parse(data);
			var newStyle = resObj[0].V;

			setStyle(newStyle);

			location.reload();
		});
	});

	function setStyle(style){
		//系统风格
		$("#systemStyle").val(style);

		var random = parseInt(10000*Math.random());
		if(style != "Blue")
			$("#StyleLink").attr("href", "css/"+style+"Style.css?v=" + random);
		else
			$("#VersionLink").attr("href","css/versions2.css?v="+random);

        $(".loginbody").addClass("Body-Background");
        $(".login-bg").addClass("Login-Background");
	}

	function getSystemStyle(){
		var dataObj = {};
		var dataAarray = [];
		dataAarray.push({
			K: "systemStyle.GetSystemStyle",
			V: ""
		});
		dataObj.data = dataAarray;

		var encoded = JSON.stringify(dataObj);
		$.post('/data', encoded, function(data, textStatus, xhr){
			var resObj = JSON.parse(data);
			var newStyle = resObj[0].V;

			setStyle(newStyle);
		});
	}
	getSystemStyle();
})();