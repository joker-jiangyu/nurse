//debugger;
'use strict';

var nurseService = angular.module('nurseApp.services', []);

nurseService.service('activeSignalService', ['$q', 'porterService',
	function($q, porterService) {

		this.getActiveSignalByDevice = function(deviceId) {
			var deferred = $q.defer();

			porterService.requestOne("activeSignal.getActiveSignalByDevice",deviceId.toString()).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);
				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get active signal');
			});

			return deferred.promise;
		};
		this.getCabinetInfoById = function(mdcId,cabinetId){
            var deferred = $q.defer();
			var p = mdcId + "|" + cabinetId ;
            porterService.requestOne("activeSignal.getCabinetInfoById",p).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get active signal');
            });

            return deferred.promise;
		};
        this.getAisleThermalHumidity = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne("activeSignal.getAisleThermalHumidity",mdcId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get active signal');
            });

            return deferred.promise;
        };
	}
]);

nurseService.service('hisDataService', ['$q', 'porterService',
	function($q, porterService) {

		Date.prototype.getFromFormat = function(format) {
			var yyyy = this.getFullYear().toString();
			format = format.replace(/yyyy/g, yyyy);
			var mm = (this.getMonth() + 1).toString();
			format = format.replace(/mm/g, (mm[1] ? mm : "0" + mm[0]));
			var dd = this.getDate().toString();
			format = format.replace(/dd/g, (dd[1] ? dd : "0" + dd[0]));
			var hh = this.getHours().toString();
			format = format.replace(/hh/g, (hh[1] ? hh : "0" + hh[0]));
			var ii = this.getMinutes().toString();
			format = format.replace(/ii/g, (ii[1] ? ii : "0" + ii[0]));
			var ss = this.getSeconds().toString();
			format = format.replace(/ss/g, (ss[1] ? ss : "0" + ss[0]));
			return format;
		};

		this.getHisData = function(ids, startTime, endTime) {
			var deferred = $q.defer();

			var qs = startTime.getFromFormat('yyyy-mm-dd hh:ii:ss') + "|" + endTime.getFromFormat('yyyy-mm-dd hh:ii:ss');
			var ps = ids.join(",") + "|" + qs;

			porterService.requestOne("hisData.getHisDatas", ps).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);
				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get his data');
			});
			return deferred.promise;
		};

		this.getAllSignalParas = function() {
			var deferred = $q.defer();

			porterService.requestOne("hisData.getAllSignalParas").then(function(data) {
				var ret = angular.fromJson(data);
				deferred.resolve(ret);
			}, function(data) {
				deferred.reject('unable to get signal Paras');
			});

			return deferred.promise;
		};

        this.GetHistorySignalByDevice = function(deviceId,days) {
            var deferred = $q.defer();

            porterService.requestOne("hisData.GetHistorySignalByDevice",deviceId+"|"+days).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                if(ret.ret){
                    ret.ret.forEach(function(item){
                        item.Series = angular.fromJson(item.Series);
                        if(item.Series){
                            for(var i = 0; i < item.Series.length;i ++){
                                item.Series[i] = angular.fromJson(item.Series[i]);
                                item.Series[i].Data = angular.fromJson(item.Series[i].Data);
                            }
                        }
                        if(item.Data){
                            item.Data = angular.fromJson(item.Data);
                        }
                    });
                }
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get signal Paras');
            });

            return deferred.promise;
        };
	}
]);

nurseService.service('devcontrolService', ['$q', 'porterService','balert',
	function($q, porterService,balert) {

		this.senddevcontrol = function(deviceid,controlid,ctrvalue,userName) {
			var deferred = $q.defer();
			var ps=deviceid+"|"+controlid+"|"+ctrvalue+"|"+userName;

			porterService.requestOne("devControl.sendControl", ps).then(function(data) {
				if (data === undefined) return;
                /*var str = data.split('|');
				balert.show(str[0],str[1],3000);*/
				//var ret = angular.fromJson(data);
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('send control failed');
			});
			return deferred.promise;
		};
        this.sendControlLinkage = function(data,userName) {
            var deferred = $q.defer();
            var param = "";
            if(data){
                data.forEach(function(item){
                    if(param.length > 0)param += "&";
                    param += item.delay+"|"+item.equipmentId+"|"+item.baseTypeId+"|"+item.controlValue;
                });
            }
            var ps = userName+"+"+param;

            porterService.requestOne("devControl.sendControlLinkage", ps).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('send control failed');
            });
            return deferred.promise;
        };
	}
]);




nurseService.service('userService', ['$q', 'porterService', 'base64',
	function($q, porterService, base64) {
        this.changePassword = function(loginId,password) {
            var deferred = $q.defer();

            porterService.requestOne("user.changePassword",base64.encode(loginId+"|"+password)).then(function(data) {

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to check login status');
            });

            return deferred.promise;
        };

		this.isLogin = function(token) {
			var deferred = $q.defer();

			porterService.requestOne("user.isLogin",token).then(function(data) {

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to check login status');
			});

			return deferred.promise;
		};

		this.logout = function(token) {
			var deferred = $q.defer();

			porterService.requestOne("user.logout",token).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to logout');
			});

			return deferred.promise;
		};

        this.getTitleAndLogo = function(){
            var deferred = $q.defer();
            var q = base64.encode("userTitle|userLogo");
            porterService.requestOne("user.getTitleAndLogo",q).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to updateHome');
            });

            return deferred.promise;
        };

        this.updateHome = function(label,content) {

            var deferred = $q.defer();
            var p = label + "|"+content;

            porterService.requestOne("user.editTitleAndLogo", p).then(function(data) {
                deferred.resolve(data);
                console.log(data);
            }, function(data) {
                deferred.reject('unable to updateHome');
            });

            return deferred.promise;
        };

		this.updatePassword = function(userName, oldPwd, newPwd) {

			//var userName = localStorage.getItem("username");
			var deferred = $q.defer();
			var p = userName + "|" + oldPwd + "|" + newPwd;

			porterService.requestOne("user.updatePassword", p).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to updatePassword');
			});

			return deferred.promise;
		};

        this.getAllAccount = function(){
            var deferred = $q.defer();
            porterService.requestOne("user.getAllAccount").then(function(data) {
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to getAllAccount');
            });

            return deferred.promise;
        };

        this.updateAccount = function(acc){
            var deferred = $q.defer();
            var q = base64.encode(acc.userId+"|"+acc.userName+"|"+acc.logonId+"|"+acc.isRemote+"|"+acc.validTime+"|"+acc.password+"|"+acc.oldPassword);
            porterService.requestOne("user.updateAccount",q).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to getAllAccount');
            });

            return deferred.promise;
        };

        this.insertAccount = function(acc){
            var deferred = $q.defer();
            var q = base64.encode(acc.userName+"|"+acc.logonId+"|"+acc.password+"|"+acc.isRemote+"|"+acc.validTime);
            porterService.requestOne("user.insertAccount",q).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to getAllAccount');
            });

            return deferred.promise;
        };

        this.deleteAccount = function(userId){
            var deferred = $q.defer();
            porterService.requestOne("user.deleteAccount",userId).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to getAllAccount');
            });

            return deferred.promise;
        };

        this.getQRCode = function(){
            var deferred = $q.defer();
            porterService.requestOne("user.getQRCode").then(function(data) {
                var res = base64.decode(data);
                deferred.resolve(res);
            }, function(data) {
                deferred.reject('unable to getQRCode');
            });
            return deferred.promise;
        };

        this.setQRCode = function(title,image){
            var deferred = $q.defer();
            var p = base64.encode(title+"|"+image)
            porterService.requestOne("user.setQRCode",p).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to setQRCode');
            });
            return deferred.promise;
        };

        this.needLogin = function(){
            var deferred = $q.defer();
            porterService.requestOne("user.needLogin").then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to getQRCode');
            });
            return deferred.promise;
        };

        this.settingLogin = function (content) {
            var deferred = $q.defer();
            var p = angular.toJson(content);

            porterService.requestOne("user.settingLogin", p).then(function(data) {
                deferred.resolve(data);
                console.log(data);
            }, function(data) {
                deferred.reject('unable to updateLogin');
            });

            return deferred.promise;
        }
}
]);

nurseService.service('baseTypeService', ['$q', 'porterService',
	function($q, porterService) {
		this.getSignalBaseTypesByDeviceType = function(deviceId) {
			var deferred = $q.defer();
            var signals = [];
            var signal = {};
			porterService.requestOne("basetype.getSignalBaseTypeByDeviceBaseType", deviceId).then(function(data) {
				var ret = angular.fromJson(data);
				var d = angular.fromJson(ret.ret);
                d.forEach(function(item){
                    signal = item;
                    signal.name = item.baseTypeName;
                    signals.push(signal);
                });
				deferred.resolve(signals);
			}, function(data) {
				deferred.reject('unable to get signal basetype');
			});

			return deferred.promise;
		};
        //"视频概况"特用的函数
        this.getSignalBaseTypes = function(){
          var deferred = $q.defer();
            porterService.requestOne("basetype.getSignalBaseType").then(function(data){
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get signal basetype');
            });
            return deferred.promise;
        };
        //仪表盘信号量
        this.getGaugeSignalBaseType = function(deviceId){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getGaugeSignalBaseType",deviceId).then(function(data){
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get gauge signal basetype');
            });
            return deferred.promise;
        };
        //开闭按钮
        this.getAllControlBaseDevice = function(deviceId,optType){
            var deferred = $q.defer();
            var q = deviceId+"|"+optType;
            porterService.requestOne("basetype.getAllControlBaseDevice",q).then(function(data){
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get control');
            });
            return deferred.promise;
        };
        // 开闭绑定值
        this.getControlTypeBaseTypeId = function(baseTypeId){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getControlTypeBaseTypeId",baseTypeId).then(function(data){
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get control');
            });
            return deferred.promise;
        };
        //加载所有的设备信息
        this.getDeviceList = function(){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getDeviceList").then(function(data){
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get control');
            });
            return deferred.promise;
        };

        this.GetSinalByEquipmentId = function(id){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getSignalByEquipmentId",id).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get control');
            });
            return deferred.promise;
        };
        this.getControlList=function(){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getControlList").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get all getControlList');
            });
            return deferred.promise;
        }

        this.GetEventsByDeviceId = function(deviceId){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getEventsByDeviceId",deviceId).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to GetEventsByDeviceId');
            });
            return deferred.promise;
        };

        this.getSignalSwitchByDeviceId = function(EquipmentTemplateId){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getSignalSwitchByDeviceId",EquipmentTemplateId).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to GetEventsByDeviceId');
            });
            return deferred.promise;
        };

        this.GetSignalMeaningsByDIdSId = function(EquipmentId,SignalId){
            var deferred = $q.defer();
            porterService.requestOne("basetype.GetSignalMeaningsByDIdSId",EquipmentId+"|"+SignalId).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to GetSignalMeaningsByDIdSId');
            });
            return deferred.promise;
        };

        this.GetConfigMoldDevices = function(){
            var deferred = $q.defer();
            porterService.requestOne("basetype.getConfigMoldDevices").then(function(data){
                var ret = angular.fromJson(data);
                var d = angular.fromJson(ret.ret);
                deferred.resolve(d);
            },function(data){
                deferred.reject('unable to get control');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('TimerService', ['$q', 'porterService',
	function($q, porterService) {
		this.getSystemTime = function() {
			var deferred = $q.defer();

			porterService.requestOne("time.getSystemTime").then(function(data) {
				var ret = angular.fromJson(data);
				deferred.resolve(ret);
			}, function(data) {
				deferred.reject('unable to get system time');
			});

			return deferred.promise;
		};
        this.DateTimeTiming = function(dateTime){
            var deferred = $q.defer();
            porterService.requestOne("time.dateTimeTiming",dateTime).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get system time');
            });
            return deferred.promise;
        }
	}
]);

nurseService.service('IpService',['$q','porterService',
    function($q,porterService){
        this.GetSystemIp = function(){
            var deferred = $q.defer();

            porterService.requestOne("ipSetting.getSystemIp").then(function(data){
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get system ip');
            });
            return deferred.promise;
        };

        this.SaveIp = function(ip,netmask,defaultGw){
            var deferred = $q.defer();

            var q = ip + "|" + netmask + "|" + defaultGw;
            porterService.requestOne("ipSetting.saveIp",q).then(function(data){
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get setting ip');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('uploadService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.uploadFile = function(file) {

			var deferred = $q.defer();

			var reader = new FileReader();
			//读取文件
			reader.readAsDataURL(file);
			//读取成功
			reader.addEventListener('load', function(e) {
				var str = this.result;
				var req = {
					name: base64.encode(file.name),
					file: str
				};
				var reqstr = angular.toJson(req);

				porterService.requestOne("upload.saveFile", reqstr).then(function(data) {
					deferred.resolve(data);
				}, function(data) {
					deferred.reject('unable to save file');
				});
			});

			return deferred.promise;
		};

		this.deleteUploadFile = function(filename) {
			var deferred = $q.defer();

			porterService.requestOne("upload.deleteFile", base64.encode(filename)).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to delete file');
			});

			return deferred.promise;
		};

		this.deleteUploadDirectory = function(path) {
			var deferred = $q.defer();

			porterService.requestOne("upload.deleteDirectory", base64.encode(path)).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to delete Directory');
			});

			return deferred.promise;
		};

        this.GetAllJsonTemplates = function(){
            var deferred = $q.defer();
            porterService.requestOne("upload.GetAllJsonTemplates").then(function(data) {
                if (data === undefined) return;
                data = base64.decode(data);
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };

        this.GetNowJsonPath = function(diagram){
            var deferred = $q.defer();
            var q = diagram.deviceId+"|"+diagram.deviceBaseTypeId;
            porterService.requestOne("upload.GetNowJsonPath",q).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };

        function downloadURI(uri, name) {
            var link = document.createElement("a");
            link.download = name;
            link.target = "_blank";

            // Construct the uri
            link.href = uri;
            document.body.appendChild(link);
            link.click();

            // Cleanup the DOM
            document.body.removeChild(link);
        }

        this.DownloadDiagramsJson = function(path,folder){
            var deferred = $q.defer();
            porterService.requestOne("upload.DownloadDiagramsJson",path+"|"+folder).then(function(data) {
                if (data === undefined) return;
                data = data.replace("\\","/");
                var fileName = data.substring(data.lastIndexOf("/")+1);
                downloadURI("/upload/"+fileName,"/upload/"+fileName);
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };

        this.UploadDiagramsJson = function(path,diagram,file){
            var deferred = $q.defer();

            var reader = new FileReader();
            //读取文件
            reader.readAsDataURL(file);
            //读取成功
            reader.addEventListener('load', function(e) {
                var str = this.result;
                var req = {
                    name: base64.encode(file.name),
                    file: str
                };
                var reqstr = angular.toJson(req);

                var deviceId = undefined;
                if(diagram.deviceId != undefined)
                    deviceId = diagram.deviceId;
                else
                    deviceId = diagram.deviceBaseTypeId;

                porterService.requestOne("upload.UploadDiagramsJson", path+"|"+deviceId+"|"+reqstr).then(function(data) {
                    deferred.resolve(data);
                }, function(data) {
                    deferred.reject('unable to save file');
                });
            });

            return deferred.promise;
        };

        this.DeleteInstancesJson = function(path){
            var deferred = $q.defer();
            porterService.requestOne("upload.DeleteInstancesJson",path).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };

        this.GetAllJsonInstances = function(){
            var deferred = $q.defer();
            porterService.requestOne("upload.GetAllJsonInstances").then(function(data) {
                if (data === undefined) return;
                data = base64.decode(data);
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };

        this.CopyJsonInstance = function(page,deviceId){
            var deferred = $q.defer();
            var q = base64.encode(page+"|"+deviceId);
            porterService.requestOne("upload.CopyJsonInstance",q).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };
    }
]);

nurseService.factory('Exporter', ['$timeout', 'ExcelFileService', function($timeout, ExcelFileService) {

	function toHtmlFormatString(arr) {

		var template = "<!DOCTYPE html><html lang=\"en\"><head>" +
			"<meta charset=\"utf-8\"><title></title></head>" +
			"<body><table><tbody>#</tbody></table></body></html>";

		var data = _.reduce(arr, function(memo, el) {

			var row = '<tr>';
			for (var p in el) {
				// 方法
				if (typeof(el[p]) !== "function") {
					var cell = "<td>";
					cell = cell + el[p] + "</td>";
					row = row + cell;
				}

			}

			row = row + "</tr>";

			return memo + row + '\n';
		}, '');

		data = template.replace('#', data);

		return data;
	}

	function toCsvFormatString(arr) {

		var csvContent = "data:text/csv;charset=gb2312,\ufeff";
		if (window.navigator.msSaveOrOpenBlob) {
			csvContent = "\ufeff";
		}


		var data = _.reduce(arr, function(memo, el) {
			var row = '';
			for (var p in el) {
				if (typeof(el[p]) !== "function") {
					var cell = "";
					cell = cell + el[p] + ",";
					row = row + cell;
				}
			}
			return memo + row + '\n';
		}, '');

		data = csvContent + data;

		return data;
	}

	function downloadURI(uri, name) {
	  // var link = document.createElement("a");
	  // link.download = name;
	  // link.href = uri;
	  // link.click();
	    // Construct the a element
	    var link = document.createElement("a");
	    link.download = name;
	    link.target = "_blank";

	    // Construct the uri
	    link.href = uri;
	    document.body.appendChild(link);
	    link.click();

	    // Cleanup the DOM
	    document.body.removeChild(link);
	    // delete link;
	}


	return {
		toHtml: function(arr) {

			var data = toCsvFormatString(arr);
			if (window.navigator.msSaveOrOpenBlob) {
				// if browser is IE
				var blob = new Blob([decodeURIComponent(encodeURI(data))], {
					type: "text/csv;charset=gb2312;"
				});
				navigator.msSaveBlob(blob, 'export.csv');
			}else{
				var encodedUri = encodeURI(data);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "export.csv");

				document.body.appendChild(link);
				link.click();
			}
		},
		toXls: function(arr){
			// request server to generate excel if sucess, save uri
			var data = _.reduce(arr, function(memo, el) {
				var row = '';
				for (var p in el) {
					if (typeof(el[p]) !== "function") {
						var cell = "";
						cell = cell + el[p] + ",";
						row = row + cell;
					}
				}
				return memo + row + '\n';
			}, '');

			ExcelFileService.GetFile(data).then(function(){
				downloadURI("/upload/data.xls","/upload/data.xls");
			});
		},
        toTxt:function(str){
		    str = str.replace(/<br\s*\/?>/g, "\n").trim();
            str = str.replace(/&lt;/g, "<");
            str = str.replace(/&gt;/g, ">");
            ExcelFileService.GetText(str).then(function(){
                downloadURI("/upload/data.log","/upload/data.log");
            });
        },
        toXml : function(url,encode){
            ExcelFileService.GetXml(url,encode).then(function(fileName){
                if(fileName == "Error") return;
                downloadURI("/upload/"+fileName,fileName);
            });
        },
        toFile : function(uri, name){
            downloadURI(uri, name);
        }
	};
}]);


nurseService.service('ExcelFileService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.GetFile = function(arrayString) {
			var deferred = $q.defer();
			//base64.encode(
			porterService.requestOne("exportExcel.getExcel", arrayString).then(function(data) {
				if (data == "OK")
					deferred.resolve(data);
				else
					deferred.reject('unable to get excel file');	
			}, function(data) {
				deferred.reject('unable to get excel file');
			});

			return deferred.promise;
		};
        this.GetText = function(arrayString) {
            var deferred = $q.defer();
            //base64.encode(
            porterService.requestOne("exportExcel.getText", arrayString).then(function(data) {
                if (data == "OK")
                    deferred.resolve(data);
                else
                    deferred.reject('unable to get excel file');
            }, function(data) {
                deferred.reject('unable to get excel file');
            });

            return deferred.promise;
        };
        this.GetXml = function(url,encode) {
            var deferred = $q.defer();
            //base64.encode(
            porterService.requestOne("exportExcel.getXml", base64.encode(url+"|"+encode)).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get excel file');
            });

            return deferred.promise;
        };
	}
]);

nurseService.factory('porterService', ['$http', 'base64', function($http, base64) {
	var self = {};

	self.requestOne = function(cmdName, param) {
		var dataObj = {};

		var dataAarray = [];

		var p;
		if (param === undefined)
			p = "NA";
		else
			p = param;

		dataAarray.push({
			K: cmdName,
			V: p
		});

		dataObj.data = dataAarray;

		var reqString = base64.encode(angular.toJson(dataObj));

		return $http({
			method: 'POST',
			url: '/data',
			data: dataObj,
			headers: {
				'Content-Type': 'text/plain'
			}
		}).then(function(response) {

			var obj = eval(response.data);
			if (angular.isArray(obj) & obj.length > 0) {
				return obj[0].V;
			}

			return undefined;
		});
	};

	return self;
}]);


nurseService.factory('global', [function() {
	var Global = {};
	Global.getpara=function(name,paras){

			var reg = new RegExp("(^|\|)" + name + ":([^\|]*)(\||$)", "i");
			var r =paras.match(reg);
			if (r != null) return (r[2]); return "";
		};
	Global.getcurrentsize=function(eleX,eleY,elewidth,eleheight) {
            var sideMenuWidth = 200;
            var topBarHeight = 54;
            var screenDefaultWidth = 1280;
            var screenDefaultHeight = 1024;
            var bootstrapCollapseScreenWidth = 768;

			function getRealScreenWidth() {
				//return screen.width;
				return window.innerWidth;
			}

			function getRealScreenHeight() {
				//return screen.height;
				return window.innerHeight;
			}

			function getRealX(relativeX) {
				var rX = parseFloat(relativeX);
				return (rX / screenDefaultWidth) * getRealScreenWidth();
			}

			function getDefaultX(absoluteX) {
				var rX = parseFloat(absoluteX);
				return (rX / getRealScreenWidth()) * screenDefaultWidth;
			}

			function getRealY(relativeY) {
				var rY = parseFloat(relativeY);
				return (rY / screenDefaultHeight) * getRealScreenHeight();
			}

			function getDefaultY(absoluteY) {
				var rY = parseFloat(absoluteY);
				return (rY / getRealScreenHeight()) * screenDefaultHeight;
			}

			function posX(relativeX) {
				var rX = getRealX(relativeX);

				if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
					return rX + sideMenuWidth;
				} else {
					return rX;
				}
			}
			function fromPosX(absoluteX) {
				var rX = parseFloat(absoluteX);

				if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
					rX = rX - sideMenuWidth;
				}

				return getDefaultX(rX);
			}

			function posY(relativeY) {
				var rY = getRealY(relativeY);

				return rY + topBarHeight;
			}

			function fromPosY(absoluteY) {
				var rY = parseFloat(absoluteY) - topBarHeight;

				return getDefaultY(rY);
			}
			var reuslt=posX(eleX)+","+ posY(eleY)+","+getRealX(elewidth)+","+getRealY(eleheight);
			return reuslt;
		};
	return Global;

}]);





//angular.module('globalAlert',['ng'])
//.value("alerts",[]) //如果不写这个，那么下面的$rootScope.alerts = []就只能是显示一个了
nurseService.factory('balert',['$rootScope','$timeout',function($rootScope,$timeout){
		var Balert =[];
	$rootScope.alerts=[];
	Balert.show=function (type, msg, time) {
        if(type == 'danger')
            type = 'error';
        if(time == undefined)
            time = 3000;

        spop({
            template: msg,
            style: type,
            autoclose: time
        });

	    /*var width = "width:"+$("body").width()+"px";

        $rootScope.alerts.push({'type': type, 'msg': msg,'close':function(){
            Balert.close(this);
        },'width':width});
		if(time){
			$timeout(function(){
				$rootScope.alerts = [];
			},time);
		}*/
	};
    Balert.loginShow=function (type, msg, time) {
        if(type == 'danger')
            type = 'error';
        if(time == undefined)
            time = 3000;

        spop({
            template: '<h2 style="font-size:24px" class="spop-title">上次登入记录</h2><h3 style="font-size:22px" class="spop-title">IP地址：'+msg[1]+'</h3><h3 style="font-size:22px" align="right" class="spop-title">'+msg[0]+'</h3>',
            position  : 'bottom-left',
            style: type,
            autoclose: time
        });
    };

        /*var width = "width:"+$("body").width()+"px";

        $rootScope.alerts.push({'type': type, 'msg': msg,'close':function(){
            Balert.close(this);
        },'width':width});
        if(time){
            $timeout(function(){
                $rootScope.alerts = [];
            },time);
        }*/
	Balert.close = function(alert){
		//$rootScope.alerts.splice($rootScope.alerts.indexOf(alert),1);
	};

	return Balert;


}]);

/*
* 确定弹出框
* bconfirm.show($scope,"显示的内容").then(function(data){  return true/false; });
* */
nurseService.factory('bconfirm',['$modal','$q',
    function($modal,$q){
        var self = {};

        self.show = function($scope,message){
            var deferred = $q.defer();

            $scope.message = message;
            var confirmBoxDlg = $modal({
                scope: $scope,
                templateUrl: 'partials/confirmBox.html',
                show: false
            });
            confirmBoxDlg.$promise.then(confirmBoxDlg.show);

            setTimeout(function(){
                $(".Confirm_Box").focus();

                $(".Confirm_Box").on('keydown', function (e) {
                    var key = e.which;
                    if (key == 13) {
                        $scope.ok();
                    }
                });
            },100);

            $scope.ok = function(){
                confirmBoxDlg.hide();
                deferred.resolve(true);
            };

            $scope.cancel = function(){
                confirmBoxDlg.hide();
                deferred.resolve(false);
            };

            return deferred.promise;
        };

        return self;
    }
]);



nurseService.factory('base64', [function() {
	var Base64 = {

		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		encode: function(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = Base64._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

			return output;
		},


		decode: function(input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}

			}

			output = Base64._utf8_decode(output);

			return output;

		},

		_utf8_encode: function(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		},

		_utf8_decode: function(utftext) {
			var string = "";
			var i = 0;
			var c = 0,c1 = 0,c2 = 0,c3 =0;

			while (i < utftext.length) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		}
	};

	return Base64;

}]);


nurseService.factory('alarmService', ['$q', 'porterService', 'base64',
	function($q, porterService, base64) {
		var self = {};

		self.updateAlarmCountByLevel = function($scope) {

			porterService.requestOne("activeAlarm.alarmCountByLevel").then(function(data) {
				if (data === undefined) return;

				var ret = angular.fromJson(data);
				$scope.alarmCount = ret;
			});
		};

		self.endAlarm = function(param) {
			var deferred = $q.defer();

			porterService.requestOne("activeAlarm.endAlarm", base64.encode(param)).then(function(data) {
				if (data === undefined) return;
				deferred.resolve(data);

			}, function(data) {
				deferred.reject('unable to end Alarm');
			});

			return deferred.promise;
		};

		self.updateActiveAlarmList = function() {
			var deferred = $q.defer();

			porterService.requestOne("activeAlarm.allAlarmList").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get alarm list');
			});
			return deferred.promise;
		};

		self.getAlarmsByDeviceId = function(deviceId) {
			var deferred = $q.defer();

			porterService.requestOne("activeAlarm.getAlarmsByDevice", deviceId.toString()).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get alarm list');
			});
			return deferred.promise;
		};

		self.updateHomeCurveData = function(signalIds) {
			var deferred = $q.defer();
			var p = signalIds.join(',');

			porterService.requestOne("activeAlarm.allAlarmList").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get alarm list');
			});
			return deferred.promise;
		};

		return self;
	}
]);

nurseService.factory('hisAlarmService', ['$q', 'porterService', 'base64',
	function($q, porterService, base64) {
		var self = {};

		Date.prototype.getFromFormat = function(format) {
			var yyyy = this.getFullYear().toString();
			format = format.replace(/yyyy/g, yyyy)
			var mm = (this.getMonth() + 1).toString();
			format = format.replace(/mm/g, (mm[1] ? mm : "0" + mm[0]));
			var dd = this.getDate().toString();
			format = format.replace(/dd/g, (dd[1] ? dd : "0" + dd[0]));
			var hh = this.getHours().toString();
			format = format.replace(/hh/g, (hh[1] ? hh : "0" + hh[0]));
			var ii = this.getMinutes().toString();
			format = format.replace(/ii/g, (ii[1] ? ii : "0" + ii[0]));
			var ss = this.getSeconds().toString();
			format = format.replace(/ss/g, (ss[1] ? ss : "0" + ss[0]));
			return format;
		};

		self.getHisAlarms = function(startTime, endTime) {
			var deferred = $q.defer();

			var qs = startTime.getFromFormat('yyyy-mm-dd hh:ii:ss') + "|" + endTime.getFromFormat('yyyy-mm-dd hh:ii:ss');

			porterService.requestOne("hisAlarm.getHisAlarms", qs).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get his alarm');
			});
			return deferred.promise;
		};

        self.likeLimitHisAlarms = function(index,size,startTime, endTime,content) {
            var deferred = $q.defer();

            var qs = index+"|"+size+"|"+startTime.getFromFormat('yyyy-mm-dd hh:ii:ss') + "|" + endTime.getFromFormat('yyyy-mm-dd hh:ii:ss')+"|"+content;

            porterService.requestOne("hisAlarm.likeLimitHisAlarms", base64.encode(qs)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        self.likeHisAlarmsTotals = function(startTime, endTime,content) {
            var deferred = $q.defer();

            var qs = startTime.getFromFormat('yyyy-mm-dd hh:ii:ss') + "|" + endTime.getFromFormat('yyyy-mm-dd hh:ii:ss')+"|"+content;

            porterService.requestOne("hisAlarm.likeHisAlarmsTotals", base64.encode(qs)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        self.newLikeLimitHisAlarms = function(index, size, startTime, endTime, equipments, levels, cancel){
            var deferred = $q.defer();

            var qs = index+"|"+size+"|"+startTime.getFromFormat('yyyy-mm-dd hh:ii:ss') + "|" + endTime.getFromFormat('yyyy-mm-dd hh:ii:ss')
                +"|"+parseEquipments(equipments)+"|"+parseLevels(levels)+"|"+parseCancel(cancel);

            porterService.requestOne("hisAlarm.newLikeLimitHisAlarms", base64.encode(qs)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        self.newLikeHisAlarmsTotals = function(startTime, endTime,equipments, levels, cancel) {
            var deferred = $q.defer();

            var qs = startTime.getFromFormat('yyyy-mm-dd hh:ii:ss') + "|" + endTime.getFromFormat('yyyy-mm-dd hh:ii:ss')
                +"|"+parseEquipments(equipments)+"|"+parseLevels(levels)+"|"+parseCancel(cancel);

            porterService.requestOne("hisAlarm.newLikeHisAlarmsTotals", base64.encode(qs)).then(function(data) {
                if (data === undefined)
                    deferred.resolve("0");
                else
                    deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        function parseEquipments(datas){
            var res = "";
            if(datas){
                var index = 0;
                datas.forEach(function(item){
                    res = parseResult(res,item);
                    index ++;
                });
            }
            return res;
        }

        function parseLevels(datas){
            var res = "";
            if(datas){
                var index = 0;
                if(datas.levelTip == true || datas.levelTip == "true"){
                    res = parseResult(res,0);
                    index ++;
                }
                if(datas.levelCommon == true || datas.levelCommon == "true"){
                    res = parseResult(res,1);
                    index ++;
                }
                if(datas.levelImportant == true || datas.levelImportant == "true"){
                    res = parseResult(res,2);
                    index ++;
                }
                if(datas.levelUrgent == true || datas.levelUrgent == "true"){
                    res = parseResult(res,3);
                    index ++;
                }
                if(index == 4)
                    res = "";
            }
            return res;
        }

        function parseResult(str,val){
            if(str.length == 0)
                str = val;
            else
                str += "&"+val;
            return str;
        }

        function parseCancel(data){
            var res = "";
            if(data){
                var index = 0;
                if(data.unconfirmed == true || data.unconfirmed == "true") {
                    res = "unconfirmed";
                    index ++;
                }
                if(data.confirmed == true || data.confirmed == "true") {
                    res = "confirmed";
                    index ++;
                }
                if(index == 2)
                    res = "";
            }
            return res;
        }

        self.GetHistoryAlarmByDevice = function(ids,type,number) {
            var deferred = $q.defer();

            var qs = ids+"|"+type+"|"+number;

            porterService.requestOne("hisAlarm.GetHistoryAlarmByDevice", qs).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };
		return self;
	}
]);

nurseService.factory('activeDeviceService', ['$q', 'porterService', function($q, porterService) {
	var self = {};

	self.getActiveDevices = function() {

		var deferred = $q.defer();

		porterService.requestOne("activeDevice.getActiveDevices").then(function(data) {
			if (data === undefined) return;
			var ret = angular.fromJson(data);

			deferred.resolve(ret.ret);
		}, function(data) {
			deferred.reject('unable to get activeDevice list');
		});

		return deferred.promise;
	};

	return self;
}]);

nurseService.factory('deviceService', ['$q', 'porterService','base64', function($q, porterService,base64) {
	var self = {};

	self.getDevicesByType = function(dom) {
        var baseTypeId = "";
        if(dom.deviceBaseTypeId != "" && dom.deviceBaseTypeId != undefined)
            baseTypeId = dom.deviceBaseTypeId;
        else if(dom.diagram.deviceBaseTypeId != "" && dom.diagram.deviceBaseTypeId != undefined)
            baseTypeId = dom.diagram.deviceBaseTypeId;
		var deferred = $q.defer();

		porterService.requestOne("device.getDevicesByType", baseTypeId).then(function(data) {
			if (data === undefined) return;
			var ret = angular.fromJson(data);

			deferred.resolve(ret.ret);
		}, function(data) {
			deferred.reject('unable to get device list');
		});

		return deferred.promise;
	};

    self.getAllDevicesType = function(){
        var deferred = $q.defer();
        porterService.requestOne("configureMold.GetShowConfigureMold").then(function(data){
            if(data == undefined) return;
            var ret = angular.fromJson(data);
            ret.ret.forEach(function(item){
                if(item.parts != "")
                    item.parts = angular.fromJson(item.parts);
                if(item.visible == 'true'){
                    var url = '#/device/9999/diagram';
                    if(item.configUrl == undefined || item.configUrl == ''){
                        if(item.parts.length > 0)
                            url = item.parts[0].configUrl;
                    }else
                        url = item.configUrl;

                    addDevicesType(item.fontChart,url,item.configName,getDeviceList(item.parts),item.configId);
                }
            });
            //左边组态栏 选中样式
            $(".sidebar ul li a").click(function(event) {
                $(".navbar-static-top ul li a").removeClass('active');

                $(".sidebar ul li a").removeClass('active');
                $(event.currentTarget).addClass('active');
                setCookie('activeText',event.currentTarget.outerText,365);
            });
            //头部功能栏 选中样式
            $(".navbar-static-top ul li a.dropdown-toggle").click(function(event){
                $(".sidebar ul li a").removeClass('active');

                $(".navbar-static-top ul li a").removeClass('active');
                $(event.currentTarget).addClass('active');

                var text = event.currentTarget.outerText.split("\n")[0];
                setCookie('activeText',text,365);
            });
            clickActive();
            deferred.resolve(ret.ret);
        },function(data){
            deferred.reject("unable to get device list");
        });
        return deferred.promise;
    };

    function addDevicesType(cla,url,eName,devices,configId){
        var newLi = document.createElement("li");
        newLi.setAttribute("class","sub-li");
        newLi.setAttribute("configid",configId);
        var newA = document.createElement("a");
        newA.setAttribute("href",url);

        var version = localStorage.getItem("versions");
        if(version == "IView")
            newA.innerHTML = "<div class='div-img'><i class='fa "+cla+" fa-3x fa-fw'></i></div> "+eName;
        else
            newA.innerHTML = "<div class='div-img'><i class='fa "+cla+" fa-lg fa-fw'></i></div> "+eName;
        //newA.setAttribute("onclick","initPartConfigures()");
        //newA.innerHTML = "<div class='div-img'><img src='..\\img\\MenuBar\\"+cla+".png'/></div> "+eName;
        /*+"<span class='ng-binding diagram-alarmCount' deviceid='"+devices+"'></span>"*/
        newLi.appendChild(newA);
        var newSpan = document.createElement("span");
        newSpan.setAttribute("class","ng-binding diagram-alarmCount");
        //newSpan.setAttribute("deviceid",devices);
        newLi.appendChild(newSpan);

        document.getElementById("side-menu").appendChild(newLi);
    }
    function clickActive(){
        var activeText = getCookie('activeText');
        $(".sidebar ul li a").removeClass('active');
        if(activeText == undefined)
            $(".sidebar ul li a:first").addClass('active');
        else{
            $('#side-menu li a').each(function(){
                if($(this)[0].innerText == activeText){
                    $(this).addClass('active');
                }
            });
            $(".navbar-static-top ul li a samp.dropdown-title").each(function(){
                if($(this)[0].innerText == activeText){
                    $(this).parent().addClass('active');
                }
            });
        }
    }

    function getDeviceList(parts){
        var list = "";
        if(parts){
            parts.forEach(function(item){
                if(item.equipmentId != undefined && item.equipmentId != ""){
                    if(list == "") list = item.equipmentId;
                    else list += ","+item.equipmentId;
                }
            });
        }
        return list;
    }

    function getCookie(c_name){
        if (document.cookie.length>0)
        {
            var c_start=document.cookie.indexOf(c_name + "=");
            if (c_start!=-1)
            {
                c_start=c_start + c_name.length+1;
                var c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) c_end=document.cookie.length;
                return unescape(document.cookie.substring(c_start,c_end));
            }
        }
        return undefined;
    }
    function setCookie(c_name,value,expiredays){
        var exdate=new Date();
        exdate.setDate(exdate.getDate()+expiredays);
        document.cookie=c_name+ "=" +escape(value)+
            ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
    }

    self.getDeviceInfo = function(id) {
        var deferred = $q.defer();

        porterService.requestOne("device.GetDeviceInfo", id+"").then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);

            deferred.resolve(ret.ret);
        }, function(data) {
            deferred.reject('unable to get device info');
        });

        return deferred.promise;
    };

    self.getDeviceRecord = function(id) {
        var deferred = $q.defer();

        porterService.requestOne("device.GetDeviceRecord", id+"").then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);

            deferred.resolve(ret.ret);
        }, function(data) {
            deferred.reject('unable to get device info');
        });

        return deferred.promise;
    };

    self.ModifyDeviceInfo = function(info) {
        var deferred = $q.defer();
        var UserName = localStorage.getItem("username");
        var p = info.EquipmentId+"|"+info.EquipmentModel+"|"+info.EquipmentVersion+"|"+info.ImagesPath+"|"+
            info.UsedDate+"|"+info.WarrantyPeriod+"|"+info.MaintenanceTime+"|"+info.ConfigSetting+"|"+
            info.PatchName+"|"+info.PatchVersion+"|"+info.DigitalSignature+"|"+info.Location+"|"+
            info.Comment+"|"+info.EquipmentSN+"|"+info.InstallTime+"|"+UserName;

        porterService.requestOne("device.ModifyDeviceInfo", base64.encode(p)).then(function(data) {
            if (data === undefined) return;

            deferred.resolve(data);
        }, function(data) {
            deferred.reject('unable to modify device info');
        });

        return deferred.promise;
    };


    self.GetShowConfigureMold = function(){
        var deferred = $q.defer();
        porterService.requestOne("configureMold.GetShowConfigureMold").then(function(data){
            if(data == undefined) return;
            var ret = angular.fromJson(data);
            ret.ret.forEach(function(item) {
                if (item.parts != "")
                    item.parts = angular.fromJson(item.parts);
            });
            deferred.resolve(ret.ret);
        },function(data){
            deferred.reject("unable to get device list");
        });
        return deferred.promise;
    };
	return self;
}]);

nurseService.service('diagramService', ['$q', 'porterService','base64', function($q, porterService,base64) {

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

	function getDefaultX(absoluteX) {
		var rX = parseFloat(absoluteX);
		return (rX / getRealScreenWidth()) * screenDefaultWidth;
	}

	function getRealY(relativeY) {
		var rY = parseFloat(relativeY);
		return (rY / screenDefaultHeight) * getRealScreenHeight();
	}

	function getDefaultY(absoluteY) {
		var rY = parseFloat(absoluteY);
		return (rY / getRealScreenHeight()) * screenDefaultHeight;
	}

	function posX(relativeX) {
		var rX = getRealX(relativeX);

		if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
			return rX + sideMenuWidth;
		} else {
			return rX;
		}
	}

	function fromPosX(absoluteX) {
		var rX = parseFloat(absoluteX);

		if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
			rX = rX - sideMenuWidth;
		}

		return getDefaultX(rX);
	}

	function posY(relativeY) {
		var rY = getRealY(relativeY);

		return rY + topBarHeight;
	}

	function fromPosY(absoluteY) {
		var rY = parseFloat(absoluteY) - topBarHeight;

		return getDefaultY(rY);
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

	function getPartConfig(diagram, id) {
		var found = _.find(diagram.parts, function(part) {
			return part.id === id;
		});

		return found;
	}

	this.initPart = function(scope, elem, attrs) {
        initSize();
		if (scope.diagram === null) return;

		var cfg = getPartConfig(scope.diagram, attrs.partid);
        if(cfg == undefined) return cfg;
		elem.css({
			position: 'absolute',
			left: posX(cfg.left) + "px",
			top: posY(cfg.top) + "px",
			width: getRealX(cfg.width) + "px",
			height: getRealY(cfg.height) + "px",
			'z-index':cfg.zindex
		});
		return cfg;
	};

	this.updateEditStatus = function(elem, editStatus) {
		if (!editStatus) {
			elem.find(".panel-heading")[0].style.visibility = "hidden";
			elem.find(".panel").removeClass('panel-primary');
			elem.removeClass('panel');
		} else {
			elem.find(".panel-heading")[0].style.visibility = "visible";
			elem.addClass('panel');
			elem.find(".panel").addClass('panel-primary');
		}

	};

	this.getDiagramConfig = function(param) {

		var deferred = $q.defer();

		porterService.requestOne("diagram.getDiagramConfig", param).then(function(data) {
			if (data === undefined) return;
			var ret = angular.fromJson(data);
			var deret = base64.decode(ret.ret);
			var cfg = angular.fromJson(deret);

			deferred.resolve(cfg);
		}, function(data) {
			deferred.reject('unable to get diagram config');
		});

		return deferred.promise;
	};

	function getBinding(diagram) {

		var res = {};
		res.deviceBaseTypeId = diagram.deviceBaseTypeId;
		res.deviceId = diagram.deviceId;

        if(diagram.parts && diagram.parts.length > 0){
            diagram.parts.forEach(function(part){
                if (part.binding !== undefined) {
                    if(res.binding == undefined)
                        res.binding = part.id + "$" + part.binding;
                    else
                        res.binding = part.id + "$" + part.binding + "," + res.binding;
                }
            });
        }else if(diagram.table && diagram.table.tr.length > 0){
            res.binding = "tableconfig$"+resultTdValue(diagram);
        }

		var str = angular.toJson(res);

		//console.log(str);
		return str;
	}

    function resultTdValue(parts){
        var result = "";
        if(parts.table.tr){
            parts.table.tr.forEach(function(tr){
                if(tr.td){
                    var type = tr.type;
                    tr.td.forEach(function(td){
                        if(type == "table"){
                            result += resultTdValue(td);
                        }else if(type == "signal"){
                            result += td.value+"|"
                        }
                    });
                }
            });
        }
        return result;
    }

	this.updateBindingData = function(diagram) {
        if(diagram == undefined) return;
		var deferred = $q.defer();

		var askParam = getBinding(diagram);

		porterService.requestOne("diagram.getDiagramData", askParam).then(function(data) {
			if (data === undefined) return;
			var ret = angular.fromJson(data);
			//console.log(ret);
			var cfg = angular.fromJson(ret.ret);
			//console.log(cfg);

			deferred.resolve(cfg);
		}, function(data) {
			deferred.reject('unable to get diagram dynamic data');
		});

		return deferred.promise;
	};

	this.saveDiagram = function(diagram) {
		var deferred = $q.defer();

		var p = angular.toJson(diagram);
		p=base64.encode(p);
		porterService.requestOne("diagram.saveDiagram", p).then(function(data) {

			//console.log(data);

			deferred.resolve(data);
		}, function(data) {
			deferred.reject('unable to save diagram');
		});

		return deferred.promise;
	};

	this.updateParts = function(diagram, elem) {
		if (diagram) {
			var cfg = getPartConfig(diagram, elem.attr("partid"));

			cfg.left = fromPosX(elem[0].style.left);
			cfg.top = fromPosY(elem[0].style.top);
			cfg.width = getDefaultX(elem[0].style.width);
			cfg.height = getDefaultY(elem[0].style.height);
		}
	};

    this.updateCabinetData = function(diagram) {

        var deferred = $q.defer();

        var askParam = angular.toJson(diagram);

        porterService.requestOne("diagram.getCabinetData", askParam).then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);
            var cfg = angular.fromJson(ret.ret);

            deferred.resolve(cfg);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });

        return deferred.promise;
    };

    this.GetSignalHistoryChart = function(deviceId,baseTypeId) {

        var deferred = $q.defer();

        var p = base64.encode(deviceId+"|"+baseTypeId);

        porterService.requestOne("diagram.getSignalHistoryChart", p).then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);

            deferred.resolve(ret);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });

        return deferred.promise;
    };

    this.updatePowerData = function(mdcId,diagram){
        var deferred = $q.defer();

        var askParam = angular.toJson(diagram);
        askParam = mdcId + "|" + askParam;

        porterService.requestOne("activeSignal.getPowerData", askParam).then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);
            var cfg = angular.fromJson(ret.ret);

            deferred.resolve(cfg);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });

        return deferred.promise;
    };
    this.updatePowerKpi = function(diagram){
        var deferred = $q.defer();

        var askParam = angular.toJson(diagram);

        porterService.requestOne("activeSignal.getPowerKpi", askParam).then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);

            deferred.resolve(ret);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });

        return deferred.promise;
    };
    this.updateTempData = function(diagram){
        var deferred = $q.defer();

        var p = tempsToString(diagram);
        p=base64.encode(p);
        porterService.requestOne("activeSignal.getTempData", p).then(function(data) {
            if (data === undefined || data === '') return;
            var str = base64.decode(data);
            var ret = angular.fromJson(str);

            deferred.resolve(ret);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });

        return deferred.promise;
    };
    this.UpdateTemperature = function(diagram){
        var deferred = $q.defer();

        var p = angular.toJson(diagram);
        porterService.requestOne("activeSignal.UpdateTemperature", p).then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);
            ret.ret.forEach(function(item){
                var temps = item.temps;
                item.temps = angular.fromJson(temps);
            });
            deferred.resolve(ret.ret);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });
        return deferred.promise;
    };

    function tempsToString(data){
        var res = "";
        var index = 0;
        data.forEach(function(part){
            if(index === 0){
                res = part.mdcId+"+";
            }
            res += part.deviceId+"|"+part.signalId+"|"+part.x+"|"+part.y+"|"+part.slideName+"|"+part.side+";";
            index ++;
        });
        return res;
    }

    this.GetControlValueByBaseType = function(deviceId,baseTypeId){
        var deferred = $q.defer();

        var p = base64.encode(deviceId+"|"+baseTypeId);
        porterService.requestOne("diagram.getControlValueByBaseType", p).then(function(data) {
            if (data === undefined) return;
            var ret = angular.fromJson(data);
            deferred.resolve(ret);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });
        return deferred.promise;
    };

    //兼容IView版本的可视化窗口宽度
    this.GetScreenWidth = function(){
        var ver = localStorage.getItem("versions");
        if(ver == "IView") return getIViewScreenWidth();
        return getRealScreenWidth();
    };

    this.SaveNodeTemperature = function(json,nodeTempConfig){
        var deferred = $q.defer();

        var p = base64.encode(json+"|"+angular.toJson(nodeTempConfig));
        porterService.requestOne("diagram.SaveNodeTemperature", p).then(function(data) {
            if (data === undefined) return;
            deferred.resolve(data);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });
        return deferred.promise;
    };

    this.GenerateStaticPage = function(param){
        var deferred = $q.defer();

        porterService.requestOne("diagram.GenerateStaticPage", param).then(function(data) {
            if (data === undefined) return;
            deferred.resolve(data);
        }, function(data) {
            deferred.reject('unable to get diagram dynamic data');
        });
        return deferred.promise;
    };
}]);


//业务类

nurseService.service('zipFileService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.decompressionFile = function(filename) {
			var deferred = $q.defer();

			porterService.requestOne("zipFile.decompressionFile", base64.encode(filename)).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to decompressionFile file');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('equipmentTemplateService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.createEquipmentTemplate = function(filename) {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.createEquipmentTemplate", base64.encode(filename)).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to create equipmenttemplate');
			});

			return deferred.promise;
		};

		this.getAllEquipmentTemplate = function() {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.allEquipmentTemplateList").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get all equipmenttemplate list');
			});

			return deferred.promise;
		};

		this.getEquipmentTemplate = function(equipmentTemplateId) {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.getEquipmentTemplate", equipmentTemplateId).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get equipmenttemplate');
			});

			return deferred.promise;
		};

		this.deleteEquipmentTemplate = function(equipmentTemplateId) {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.deleteEquipmentTemplate", equipmentTemplateId).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to delete equipmenttemplate');
			});

			return deferred.promise;
		};

		this.getLoadEquipmentTemplateNums = function(equipmentTemplateId) {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.getLoadEquipmentTemplateNums", equipmentTemplateId).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get load equipmenttemplate nums');
			});

			return deferred.promise;
		};

		this.getLimitEquipmentTemplate = function(index, size) {
			var deferred = $q.defer();

			var ps=index+"|"+size;

			porterService.requestOne("equipmentTemplate.getLimitEquipmentTemplate", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get limit equipmenttemplate');
			});

			return deferred.promise;
		};

		this.getEquipmentTemplateNums = function() {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.getEquipmentTemplateNums").then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get equipmenttemplate nums');
			});

			return deferred.promise;
		};

		this.getIOEquipmentTemplates = function() {
			var deferred = $q.defer();

			porterService.requestOne("equipmentTemplate.getIOEquipmentTemplates").then(function(data) {
				if (data === undefined) return;
				try {
                    var ret = angular.fromJson(data);

                    deferred.resolve(ret.ret);
                }catch (e) {
                    deferred.resolve(data);
                }
			}, function(data) {
				deferred.reject('unable to get io equipmentTemplates');
			});

			return deferred.promise;
		};

        this.GetEquipmentTemplatesByBaseType = function(q) {
            var deferred = $q.defer();

            porterService.requestOne("equipmentTemplate.getEquipmentTemplatesByBaseType",q).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io equipmentTemplates');
            });

            return deferred.promise;
        };

        this.getHostEquipmentTemplates = function() {
            var deferred = $q.defer();

            porterService.requestOne("equipmentTemplate.getHostEquipmentTemplates").then(function(data) {
                if (data === undefined) return;
                try {
                    var ret = angular.fromJson(data);

                    deferred.resolve(ret.ret);
                }catch (e) {
                    deferred.resolve(data);
                }
            }, function(data) {
                deferred.reject('unable to get io equipmentTemplates');
            });

            return deferred.promise;
        };
    }
]);

nurseService.service('stationService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.initStationInfo = function() {
			var deferred = $q.defer();

			porterService.requestOne("station.initStationInfo").then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to init station info');
			});

			return deferred.promise;
		};

		this.getStationInfo = function() {
			var deferred = $q.defer();

			porterService.requestOne("station.getStationInfo").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get station info');
			});

			return deferred.promise;
		};

		this.updateStationInfo = function(stationId,stationName,contactId,remark) {
			var deferred = $q.defer();

			if(remark == undefined) {
				remark = "";
			}
			var ps=stationId+"|"+stationName+"|"+contactId+"|"+remark;

			porterService.requestOne("station.updateStationInfo", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to update station info');
			});

			return deferred.promise;
		};

		this.getCenterInfo = function() {
			var deferred = $q.defer();

			porterService.requestOne("station.getCenterInfo").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get center info');
			});

			return deferred.promise;
		};

		this.updateCenterInfo = function(centerId,centerIP,centerPort,centerDSIP, centerEnable) {
			var deferred = $q.defer();

			var enable = 0;
			if(centerEnable)
			{
				enable = 1;
			}
			else
			{
				enable = 0;
			}
			var ps=centerId+"|"+centerIP+"|"+centerPort+"|"+centerDSIP+"|"+centerEnable;

			porterService.requestOne("station.updateCenterInfo", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to update center info');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('monitorUnitService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.getMonitorUnit = function (stationId) {
			var deferred = $q.defer();

			porterService.requestOne("monitorUnit.getMonitorUnit", stationId).then(function (data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function (data) {
				deferred.reject('unable to get monitorUnit');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('equipmentService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.getDefaultEquipment = function(monitorUnitId, EquipmentTemplateId) {
			var deferred = $q.defer();

			var ps=monitorUnitId+"|"+EquipmentTemplateId;

			porterService.requestOne("equipment.getDefaultEquipment", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get default equipment');
			});

			return deferred.promise;
		};

		this.getAllEquipment = function() {
			var deferred = $q.defer();

			porterService.requestOne("equipment.getAllEquipmentList").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get all equipment list');
			});

			return deferred.promise;
		};

		this.getLimitEquipment = function(index, size) {
			var deferred = $q.defer();

			var ps=index+"|"+size;

			porterService.requestOne("equipment.getLimitEquipment", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get limit equipment');
			});

			return deferred.promise;
		}

		this.getSameNameEquipment = function(monitorUnitId, equipmentName) {
			var deferred = $q.defer();

			var ps=monitorUnitId+"|"+equipmentName;

			porterService.requestOne("equipment.getSameNameEquipment", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get same name equipment');
			});

			return deferred.promise;
		};

		this.getInsertEquipment = function(equipment) {
            var userName = localStorage.getItem("username");
			var deferred = $q.defer();

			var ps=equipment.EquipmentId+"|"+equipment.EquipmentName+"|"+equipment.StationId+"|"+equipment.EquipmentTemplateId+"|"+equipment.SamplerUnitId+"|"+equipment.MonitorUnitId+"|"+userName;

			porterService.requestOne("equipment.getInsertEquipment", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get insert equipment');
			});

			return deferred.promise;
		};

		this.deleteEquipment = function(stationId, equipmentId, samplerUnitId) {
			var deferred = $q.defer();

			var ps=stationId +"|"+equipmentId+"|"+samplerUnitId;

			porterService.requestOne("equipment.deleteEquipment", base64.encode(ps)).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to delete equipment');
			});

			return deferred.promise;
		};

		this.reLoadEquipment = function(stationId, stationName) {
			var deferred = $q.defer();

            var logonId = localStorage.getItem("username");
			var ps=stationId +"|"+stationName+"|"+logonId;

			porterService.requestOne("equipment.reLoadEquipment", base64.encode(ps)).then(function(data) {
				deferred.resolve(data);

			}, function(data) {
				deferred.reject('unable to reload equipment');
			});

			return deferred.promise;
		};

		this.getEquipmentNums = function() {
			var deferred = $q.defer();

			porterService.requestOne("equipment.getEquipmentNums").then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get equipment nums');
			});

			return deferred.promise;
		};

		this.getIOEquipments = function(stationId) {
			var deferred = $q.defer();

			porterService.requestOne("equipment.getIOEquipments", stationId).then(function(data) {
				if (data === undefined) return;
                try {
                    var ret = angular.fromJson(data);

                    deferred.resolve(ret.ret);
                }catch (e) {
                    deferred.resolve(data);
                }
			}, function(data) {
				deferred.reject('unable to get io equipments');
			});

			return deferred.promise;
		};

        this.updateEquipment = function(equipmentId,equipmentName,vendor,samplerUnitId) {
            var userName = localStorage.getItem("username");
            var deferred = $q.defer();

            var ps = equipmentId+"|"+equipmentName+"|"+vendor+"|"+samplerUnitId+"|"+userName;

            porterService.requestOne("equipment.updateEquipment", base64.encode(ps)).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to delete equipment');
            });

            return deferred.promise;
        };

        this.checkEquipmentConfig = function(equipmentId,equipmentName,portNo,address) {
            var deferred = $q.defer();

            var ps = equipmentId+"|"+equipmentName+"|"+portNo+"|"+address;

            porterService.requestOne("equipment.checkEquipmentConfig", base64.encode(ps)).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to delete equipment');
            });

            return deferred.promise;
        };

        this.CreateConfigManager = function() {
            var deferred = $q.defer();

            porterService.requestOne("equipment.createConfigManager").then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get equipment nums');
            });

            return deferred.promise;
        };

        this.ReLoadFSU = function() {
            var deferred = $q.defer();

            porterService.requestOne("equipment.reLoadFSU").then(function(data) {
                deferred.resolve(data);

            }, function(data) {
                deferred.reject('unable to reload equipment');
            });

            return deferred.promise;
        };

        this.RebindingEquipmentTemplate = function(equipmentId,equipmentTemplatId) {
            var deferred = $q.defer();

            porterService.requestOne("equipment.rebindingEquipmentTemplate",equipmentId+"|"+equipmentTemplatId).then(function(data) {
                deferred.resolve(data);

            }, function(data) {
                deferred.reject('unable to reload equipment');
            });

            return deferred.promise;
        };

        this.getHostEquipments = function(stationId) {
            var deferred = $q.defer();

            porterService.requestOne("equipment.getHostEquipments", stationId).then(function(data) {
                if (data === undefined) return;
                try {
                    var ret = angular.fromJson(data);

                    deferred.resolve(ret.ret);
                }catch (e) {
                    deferred.resolve(data);
                }
            }, function(data) {
                deferred.reject('unable to get io equipments');
            });

            return deferred.promise;
        };
    }
]);

nurseService.service('portService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.getDefaultPort = function(monitorUnitId, portNo) {
			var deferred = $q.defer();

			var ps=monitorUnitId+"|"+portNo;

			porterService.requestOne("port.getDefaultPort", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get default port');
			});

			return deferred.promise;
		};

		this.getInsertPort = function(port) {
			var deferred = $q.defer();

			var ps=port.PortId+"|"+port.MonitorUnitId+"|"+port.PortNo+"|"+port.PortType+"|"+port.Setting;

			porterService.requestOne("port.getInsertPort", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get insert port');
			});

			return deferred.promise;
		};

		this.getDefaultSmsPort = function() {
			var deferred = $q.defer();

			porterService.requestOne("port.getDefaultSmsPort").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get sms port');
			});

			return deferred.promise;
		};

		this.getInsertSmsPort = function(smsPort) {
			var deferred = $q.defer();

			var ps=smsPort.PortNo+"|"+smsPort.BaudRate+"|"+smsPort.SmsType;

			porterService.requestOne("port.getInsertSmsPort", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get insert sms port');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('samplerUnitService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.getDefaultSamplerUnit = function(equipmentTemplateId, portId, portNo, monitorUnitId) {
			var deferred = $q.defer();

			var ps=equipmentTemplateId+"|"+portId+"|"+portNo+"|"+monitorUnitId;

			porterService.requestOne("samplerUnit.getDefaultSamplerUnit", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get default samplerUnit');
			});

			return deferred.promise;
		};

		this.getInsertSamplerUnit = function(samplerUnit) {
			var deferred = $q.defer();

			var ps=samplerUnit.SamplerUnitId+"|"+samplerUnit.PortId+"|"+samplerUnit.MonitorUnitId+"|"+samplerUnit.SamplerId+"|"+samplerUnit.SamplerType+"|"+samplerUnit.SamplerUnitName+"|"+samplerUnit.Address+"|"+samplerUnit.DllPath;

			porterService.requestOne("samplerUnit.getInsertSamplerUnit", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to get insert samplerUnit');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('notifyService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {
		this.getAllEventNotifyRules = function() {
			var deferred = $q.defer();

			porterService.requestOne("notify.getAllEventNotifyRules").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get all eventNotifyRules');
			});

			return deferred.promise;
		};

		this.getDataItems = function(entryId) {
			var deferred = $q.defer();

			porterService.requestOne("notify.getDataItems", entryId).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get dataItems');
			});

			return deferred.promise;
		};

		this.setEventNotifyRule = function(description, mode, receivers, types, levels, equipments ) {
			var deferred = $q.defer();

			//解析描述和发送模式
			var ps=description + "#" + mode + "#";

			//解析接收者
			var receiver = "";
			for(var p in receivers)
			{
				if(receivers[p].Selected)
				{
					receiver += receivers[p].EmployeeName + "|" + receivers[p].Mobile + ";";
				}
			}
			receiver = receiver.substring(0, receiver.length-1);
			ps += receiver + "#";

			//解析事件状态
			var type = "";
			for(var p in types)
			{
				if(types[p].Selected)
				{
					type += types[p].ItemId + ",";
				}
			}
			type = type.substring(0, type.length-1);
			ps += type + "#";

			//解析事件等级
			var level = "";
			for(var p in levels)
			{
				if(levels[p].Selected)
				{
					level += levels[p].ItemId + ",";
				}
			}
			level = level.substring(0, level.length-1);
			ps += level + "#";

			//解析设备
			var equipment = "";
			for(var p in equipments)
			{
				if(equipments[p].Selected)
				{
					equipment += equipments[p].EquipmentId + ",";
				}
			}
			equipment = equipment.substring(0, equipment.length-1);
			ps += equipment;

			porterService.requestOne("notify.setEventNotifyRule", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to set eventNotifyRule');
			});

			return deferred.promise;
		};

		this.getEventNotifyRule = function(notifyId) {
			var deferred = $q.defer();

			porterService.requestOne("notify.getEventNotifyRule", notifyId).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get eventNotifyRule');
			});

			return deferred.promise;
		};

		this.deleteEventNotifyRule = function(notifyId) {
			var deferred = $q.defer();

			porterService.requestOne("notify.deleteEventNotifyRule", notifyId).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to delete eventNotifyRule');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('employeeService', ['$http', '$q', 'base64', 'porterService',
	function($http, $q, base64, porterService) {

		this.getDOEmployees = function() {
			var deferred = $q.defer();

			porterService.requestOne("employee.getDOEmployees").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get all employees');
			});

			return deferred.promise;
		};

		this.getAllEmployees = function() {
			var deferred = $q.defer();

			porterService.requestOne("employee.getAllEmployees").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);

				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get all employees');
			});

			return deferred.promise;
		};

		this.deleteEmployee = function(EmployeeId) {
			var deferred = $q.defer();

			porterService.requestOne("employee.deleteEmployee", EmployeeId).then(function(data) {
				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to delete employee');
			});

			return deferred.promise;
		};

		this.insertEmployee = function(name, mobile, email) {
			var deferred = $q.defer();

			var ps = name + "|" + mobile +"|"+ email;

			porterService.requestOne("employee.insertEmployee", base64.encode(ps)).then(function(data) {
				if (data === undefined) return;

				deferred.resolve(data);
			}, function(data) {
				deferred.reject('unable to insert employee');
			});

			return deferred.promise;
		};
	}
]);

nurseService.service('arenaService', ['$q', 'porterService', 'base64',
	function($q, porterService, base64){
	
		this.getConfig = function(name) {
			var deferred = $q.defer();
			var cn = base64.encode(name);
			porterService.requestOne("arena.getConfig",cn).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);
				deferred.resolve(ret);

			}, function(data) {
				deferred.reject('unable to get config');
			});

			return deferred.promise;
		};

		this.saveConfig = function(name, cfg){
			var deferred = $q.defer();
			var req = {
					name: base64.encode(name),
					file: base64.encode(cfg)
				};

			var reqstr = angular.toJson(req);

			porterService.requestOne("arena.saveConfig", reqstr).then(function(data) {
				deferred.resolve("OK");
			}, function(data) {
				deferred.reject('unable to save file');
			});			
			
			return deferred.promise;
		};

		this.getBinding = function(){
			var deferred = $q.defer();

			porterService.requestOne("arena.getBinding").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);
				deferred.resolve(ret.ret);			
			}, function(data) {
				deferred.reject('unable to get binding');
			});			

			return deferred.promise;
		};

		this.getData = function(bindingSet){
			var deferred = $q.defer();

			var reqstr = angular.toJson(bindingSet);

			porterService.requestOne("arena.getData", reqstr).then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);
				deferred.resolve(ret.ret);			
			}, function(data) {
				deferred.reject('unable to get data');
			});			
			
			return deferred.promise;
		};
}]);


nurseService.service('KpiLayout',['$http','$q','base64','porterService',
	function($http,$q,base64,porterService){
		this.kpiLayout = function(order){
			var deferred = $q.defer();
			porterService.requestOne('KPIData.kpiLayout',base64.encode(order)).then(function(data){
				if(data == undefined || data == 'notFile') return;
				deferred.resolve(data);
			},function(data){
				deferred.reject('unable to get kpiLayout')
			});
			return deferred.promise;
		}
	}
]);

nurseService.service('KpiService',['$http','$q','base64','porterService',
	function($http,$q,base64,porterService){
		this.kpiGetDataById = function(order){
			var deferred = $q.defer();
			porterService.requestOne('KPIData.kpiGetDataById',base64.encode(order)).then(function(data){
				if(data == undefined) return;
				deferred.resolve(data);
			},function(data){
				deferred.reject('unable to get kpiData')
			});
			return deferred.promise;
		};

        this.GetKPISqlDatas = function(kpiNo){
            var deferred = $q.defer();
            porterService.requestOne('KPIData.GetKPISqlDatas',""+kpiNo).then(function(data){
                if(data == undefined) return;
                var obj = base64.decode(data);
                deferred.resolve(angular.fromJson(obj));
            },function(data){
                deferred.reject('unable to get GetKPISqlDatas')
            });
            return deferred.promise;
        };
	}
]);
nurseService.service('CameraService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.getAllVideoEquipment = function(){
            var deferred = $q.defer();
            porterService.requestOne('videoEquipment.getAllMonitor').then(function(data){
                if(data == undefined) return;
                var ret = angular.fromJson(data);
                ret.ret.forEach(function(item){
                    item.cameraJson = angular.fromJson(item.cameraJson);
                });
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.loadVideoEquipment = function(){
            var deferred = $q.defer();
            porterService.requestOne('videoEquipment.loadVideoEquipment').then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.saveVideoEquipment = function(vName,vVideoType,vIpAddress,vPort,vChanNum,vUserName,vUserPwd,number){
            var deferred = $q.defer();
            var value = vName+"|"+vVideoType+"|"+vIpAddress+"|"+vPort+"|"+vChanNum+"|"+vUserName+"|"+vUserPwd+"|"+number;
            porterService.requestOne('videoEquipment.saveVideoEquipment',base64.encode(value)).then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.updateVideoEquipment = function(eId,eName,videoType,ipAddress,port,chanNum,userName,userPwd){
            var deferred = $q.defer();
            var value = eId+"|"+eName+"|"+videoType+"|"+ipAddress+"|"+port+"|"+chanNum+"|"+userName+"|"+userPwd;
            porterService.requestOne('videoEquipment.updateVideoEquipment',base64.encode(value)).then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.deleteVideoEquipment = function(para){
            var deferred = $q.defer();
            var value = base64.encode(para);
            porterService.requestOne('videoEquipment.deleteVideoEquipment',value).then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.saveCamera = function(EquipmentId,CameraName,ChanNum){
            var deferred = $q.defer();
            var value = EquipmentId+"|"+CameraName+"|"+ChanNum;
            porterService.requestOne('videoEquipment.saveCamera',base64.encode(value)).then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.updateCamera = function(cId,cName,chanNum){
            var deferred = $q.defer();
            var value = cId+"|"+cName+"|"+chanNum;
            porterService.requestOne('videoEquipment.updateCamera',base64.encode(value)).then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
        this.deleteCamera = function(para){
            var deferred = $q.defer();
            var value = base64.encode(para);
            porterService.requestOne('videoEquipment.deleteCamera',value).then(function(data){
                if(data == undefined) return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('unable to get VideoEquipment')
            });
            return deferred.promise;
        };
		this.getCamera = function(para){
			var deferred = $q.defer();
			porterService.requestOne('videoEquipment.getcamera',para).then(function(data){
				if(data == undefined) return;
				deferred.resolve(data);
			},function(data){
				deferred.reject('unable to get VideoEquipment')
			});
			return deferred.promise;
		}
    }
]);

nurseService.service('MdcAlarmService',['$http','$q','base64','porterService','diagramService',
    function($http, $q, base64, porterService, diagramService){
        this.getCabinetList = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetCabinetList',mdcId).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        };

        this.getGetOtherSignal = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetOtherSignal',mdcId).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        };
        this.getCabinetPowerInfo = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetCabinetPowerInfo',mdcId).then(function(data){
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        };
        this.GetPowerKpiInfo = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetPowerKpiInfo',mdcId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        };
        this.getCabinetTemp = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetCabinetTemp',mdcId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        }
        this.getPowerKpiDetail = function(mdcId) {
            var deferredOuter = $q.defer();
            this.GetPowerKpiInfo(mdcId).then(function(data){
                var deferred = $q.defer();
                var mDCPower = {};
                mDCPower.tags = {};
                mDCPower.tags.mPue = undefined;
                mDCPower.tags.itLoad = undefined;
                mDCPower.tags.totalPower = undefined;
                mDCPower.mPueData = 0;
                mDCPower.eLoad = 0;
                mDCPower.otherLoad = 0;
                mDCPower.totalElectricity = 0;
                mDCPower.series = {};
                mDCPower.xAxis = {};
                mDCPower.xAxis.mPue = {
                    data:['00-00']
                };
                mDCPower.series.mPue = {
                    data:[0]
                };
                mDCPower.series.itLoad = {
                    data:[
                        {value:0, name:'其他耗能'},
                        {value:0, name:'IT负载'}
                    ]
                };
                mDCPower.series.totalPower = {
                    data: [{
                        value: 0,
                        name: "功率 0W"
                    }]
                };
                diagramService.updatePowerKpi(data).then(function(data){
                    if(!data){
                        return;
                    }

                    var itLoadData;

                    /* mPue */
                    if(data.mPueDataList.series.length != 0)
                        mDCPower.series.mPue.data = data.mPueDataList.series;
                    if(data.mPueDataList.xAxis.length != 0)
                        mDCPower.xAxis.mPue.data = data.mPueDataList.xAxis;
                    mDCPower.mPueData = parseFloat(data.mPueData.value).toFixed(1);
                    /*if(mDCPower.mPueData < 1)
                        mDCPower.mPueData = "--";*/

                    /* itLoad */
                    itLoadData = mDCPower.series.itLoad.data;
                    var totalLoad = 0;
                    data.itLoadDataList.forEach(function(ele){
                        if(ele.type == "RatedLoad"){//额定负载
                            itLoadData[1].value = parseFloat(ele.value).toFixed(2);
                        }else{
                            itLoadData[0].value = parseFloat(ele.value).toFixed(2);
                        }
                        totalLoad += parseFloat(parseFloat(ele.value).toFixed(2));
                    });

                    mDCPower.eLoad = ((parseFloat(mDCPower.series.itLoad.data[1].value)/totalLoad)*100).toFixed(2);
                    if(isNaN(mDCPower.eLoad)){
                        mDCPower.eLoad = 0;
                        mDCPower.otherLoad = 0;
                    }else
                        mDCPower.otherLoad = parseFloat(100 - mDCPower.eLoad).toFixed(2);

                    /* totalPower */
                    mDCPower.series.totalPower.data[0].value = parseFloat(data.totalPower.value).toFixed(1);
                    mDCPower.series.totalPower.data[0].name = "功率 "+parseFloat(data.totalPower.value).toFixed(1)+"kW";
                    mDCPower.totalElectricity = parseFloat(data.totalElectricity.value).toFixed(1);
                    mDCPower.totalPower = parseFloat(data.totalPower.value).toFixed(1);

                    mDCPower.maxPower = data.maxPower;

                    deferred.resolve(data);
                    deferredOuter.resolve(mDCPower);
                },function(data){
                    deferred.reject('getPowerKpiInfo error');
                });
                return deferred.promise;
            });
            return deferredOuter.promise;
        };
        this.GetMDCAlarmInfo = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetMDCAlarmInfo',mdcId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = JSON.parse(data);
                deferred.resolve(ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        };
        this.GetTemperature = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetTemperature',mdcId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                ret.ret.forEach(function(item){
                    var temps = item.temps;
                    item.temps = angular.fromJson(temps);
                });
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('Inorganic cabinet');
            });
            return deferred.promise;
        };
        this.GetMdcNames = function(){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetMdcNames').then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
		};

        this.GetCabinetNumber = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetCabinetNumber',mdcId).then(function(data){
                if (data === undefined || data === "") return;
                if(parseInt(data) == 0)
                    deferred.resolve(24);
                else
                    deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.GetHistoryPueCharts = function(days){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetHistoryPueCharts',days).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.GetIPStatus = function(ip){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetIPStatus',ip).then(function(data){
                if (data === undefined || data === "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.ReLoadMdcConfig = function(){
            var deferred = $q.defer();
            var logonId = localStorage.getItem("username");
            porterService.requestOne('mdcAlarm.reLoadMdcConfig',logonId).then(function(data){
                if (data === undefined || data === "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.GetCabinetListInfo = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcAlarm.GetCabinetListInfo',mdcId).then(function(data){
                if (data === undefined || data === ""){
                    deferred.resolve(undefined);
                }else{
                    var ret = JSON.parse(data);
                    deferred.resolve(ret);
                }
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('DoorService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.speedAddDoorCard = function(speedDoorCard,endTime){
            var deferred = $q.defer();
            var str = base64.encode(speedDoorCardSplice(speedDoorCard,endTime));
            porterService.requestOne('door.speedAddDoorCard',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        var speedDoorCardSplice = function(data,endTime){
            var ds = "";
            data.doorList.forEach(function(item){
                if(ds != "")
                    ds += "&";
                ds += item.doorId;
            });
            var str = data.cardType+'|'+data.cardCode+"|"+data.cardName+"|"+data.userId+"|"+data.cardCategory+"|"+
                ds+"|"+data.timeGroup+"|"+data.openPassWord+"|"+endTime+"|"+data.description;
            return str;
        };

        this.getGetDoorListByDoorName = function(doorName){
            var deferred = $q.defer();
            var dn = base64.encode(doorName);
            porterService.requestOne('door.getDoorListByDoorName',dn).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.getGetDoorByDoorId = function(doorId){
            var deferred = $q.defer();
            porterService.requestOne('door.getDoorByDoorId',doorId).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                ret.ret[0].timeGroups = angular.fromJson(ret.ret[0].timeGroups);
                deferred.resolve(ret.ret[0]);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.updateDoor = function(data){
            var deferred = $q.defer();
            var str = base64.encode(data.doorId)+"|"+base64.encode(data.doorName)+"|"+base64.encode(data.doorNo)+"|"+base64.encode(data.password)+"|"+
                base64.encode(data.openDelay)+"|"+base64.encode(data.infrared)+"|"+base64.encode(data.address)+"|"+base64.encode(data.doorControlId);
            porterService.requestOne('door.updateDoor',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.activeControlDoor = function(stationId,equipmentId,command){
            var deferred = $q.defer();
            var str = stationId +"|"+ equipmentId +"|"+ command;
            porterService.requestOne('door.controlDoor',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.getDoorCardList = function(cardGroup,timeGroupId,endTime,employeeName,doorName,cardCode,cardName){
            var deferred = $q.defer();
            var str = base64.encode(cardGroup)+"|"+base64.encode(timeGroupId)+"|"+base64.encode(endTime)+"|"+
                base64.encode(employeeName)+"|"+base64.encode(doorName)+"|"+base64.encode(cardCode)+"|"+base64.encode(cardName);
            porterService.requestOne('door.getDoorCardList',str).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        //分页卡授权
        this.getLimitDoorCard = function(index, size, par){
            var deferred = $q.defer();
            var str = base64.encode(index+"|"+size+"|"+par);
            porterService.requestOne('door.getLimitDoorCard',str).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.getDoorCardNums = function(par){
            var deferred = $q.defer();
            porterService.requestOne('door.getDoorCardNums',base64.encode(par)).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.getDoorByTimeGroup = function(timeGroupId){
            var deferred = $q.defer();
            porterService.requestOne('door.getDoorByTimeGroup',timeGroupId).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.insDoorCardCommand = function(str){
            var deferred = $q.defer();
            porterService.requestOne('door.insDoorCardCommand',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.delDoorCardCommand = function(str){
            var deferred = $q.defer();
            porterService.requestOne('door.delDoorCardCommand',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        var timeGroupSplice = function(data,doorId){
            var str = "";
            for(var i=0;i<data.length;i++){
                if(i>0) str += "&";
                str += doorId+"|";
                str += data[i].timeGroupId+"|";
                str += data[i].timeGroupType;
            }
            return str;
        };
        this.getInfraredList=function(){
            var deferred = $q.defer();
            porterService.requestOne("door.getInfraredList").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get all getInfraredList');
            });
            return deferred.promise;
        };
        this.GetCardCode = function(equipmentId,baseTypeId){
            var deferred = $q.defer();
            porterService.requestOne("door.GetCardCode",equipmentId+"|"+baseTypeId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get all getInfraredList');
            });
            return deferred.promise;
		}

        this.GetDoorControls=function(){
            var deferred = $q.defer();
            porterService.requestOne("door.GetDoorControls").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get all GetDoorControls');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('TimeGroupService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.getTimeGroupList = function(){
            var deferred = $q.defer();
            porterService.requestOne('timeGroup.getTimeGroupList').then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                ret.ret.forEach(function(item){
                    item.timeGroupSpan = angular.fromJson(item.timeGroupSpan);
                });
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.getTimeGroupType = function(){
            var deferred = $q.defer();
            porterService.requestOne('timeGroup.getTimeGroupType').then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.insertTimeGroup = function(timeGroupName){
            var deferred = $q.defer();
            var str = base64.encode(timeGroupName);
            porterService.requestOne('timeGroup.insertTimeGroup',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.updateTimeGroup = function(timeGroupId,timeGroupName,timeSpanChar){
            var deferred = $q.defer();
            var str = base64.encode(timeGroupId+"|"+timeGroupName+"|"+timeSpanChar[0].timeSpanChar);
            porterService.requestOne('timeGroup.updateTimeGroup',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.deleteTimeGroup = function(timeGroupId){
            var deferred = $q.defer();
            porterService.requestOne('timeGroup.deleteTimeGroup',timeGroupId).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        var joinTimeSpanChar = function(timeSpanChar){
            var join = "";
            timeSpanChar.forEach(function(item){
                if(join == "")
                    join += item.timeSpanId;
                else
                    join += "-"+item.timeSpanId;

                join += "&"+item.timeSpanChar;
            });
            return join;
        };
    }
]);

nurseService.service('CardService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.getCardList = function(cardGroup,cardCategory,cardStatus,userName,cardName,cardCode){
            var deferred = $q.defer();
            var str = base64.encode(cardGroup)+"|"+base64.encode(cardCategory)+"|"+base64.encode(cardStatus)+"|"+
                base64.encode(userName)+"|"+base64.encode(cardName)+"|"+base64.encode(cardCode);
            porterService.requestOne('card.getCardList',str).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.getCardDataItem = function(){
            var deferred = $q.defer();
            porterService.requestOne('card.getCardDataItem').then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        /*this.insertCard = function(data){
            var deferred = $q.defer();
            var str = base64.encode(data.cardCode)+"|"+base64.encode(data.cardName)+"|"+base64.encode(data.cardCategory)+"|"+
                base64.encode(data.cardGroup)+"|"+base64.encode(data.userId)+"|"+base64.encode(data.cardStatus)+"|"+
                base64.encode(data.endTime)+"|"+base64.encode(data.description);
            porterService.requestOne('card.insertCard',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };*/
        this.getCardByCardId = function(cardId){
            var deferred = $q.defer();
            porterService.requestOne('card.getCardByCardId',cardId).then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                var obj = ret.ret[0];
                obj.doors = angular.fromJson(obj.doorCards);
                deferred.resolve(obj);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.checkoutCardCode = function(cardCode){
            var deferred = $q.defer();
            porterService.requestOne('card.checkoutCardCode',cardCode).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.updateCard = function(data){
            var deferred = $q.defer();
            var str = base64.encode(data.cardType+"|"+data.cardId+"|"+data.cardCode+"|"+data.cardName+"|"+data.cardCategory+"|"+
                data.userId+"|"+data.cardStatus+"|"+
                getDoorSplice(data.doors)+"|"+data.endTime+"|"+data.description);
            porterService.requestOne('card.updateCard',str).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        var getDoorSplice = function(doors){
            var str = "";
            doors.forEach(function(item){
                if(str != "") str += "&";
                str += item.doorId+"-"+item.timeGroupId+"-"+item.password;
            });
            return str;
        };
        this.deleteCard = function(cardId){
            var deferred = $q.defer();
            porterService.requestOne('card.deleteCard',cardId).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.getLimitCard = function(index, size,par) {
            var deferred = $q.defer();

            var ps=index+"|"+size+"|"+par;

            porterService.requestOne("card.getLimitCard", base64.encode(ps)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get limit equipment');
            });

            return deferred.promise;
        };

        this.getCardNums = function(par) {
            var deferred = $q.defer();

            porterService.requestOne("card.getCardNums", base64.encode(par)).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get equipment nums');
            });

            return deferred.promise;
        };

    }
]);

nurseService.service('EmailService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.getMailDict = function(){
            var deferred = $q.defer();
            porterService.requestOne('email.getMailDict').then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.setMailDict = function(data,account){
            var deferred = $q.defer();
            var p = jointMailTim(data,account);
            porterService.requestOne('email.setMailDict',base64.encode(p)).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        function jointMailTim(data,account){
            var reulst = account.id+"&";
            if(data.type == "all"){
                reulst += "all"
            }else{
                if(data.type == "month")
                    reulst += "month|"+data.day+" "+data.hour+":"+data.minute;
                if(data.type == "week")
                    reulst += "week|"+data.week+" "+data.hour+":"+data.minute;
                if(data.type == "day")
                    reulst += "day|"+data.hour+":"+data.minute;
            }
            reulst += "&"+account.account+"|"+account.password+"|"+account.smtpIp+"|"+account.smtpPort;
            return reulst;
        }
        this.GetEmailAccount = function(){
            var deferred = $q.defer();
            porterService.requestOne('email.GetEmailAccount').then(function(data){
                if(data == undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret[0]);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('netWorkPhoneService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.setNetPhone = function(netPhoneData){
            var deferred = $q.defer();
            porterService.requestOne('netWorkPhone.UpdateNetworkPhone',netPhoneData).then(function(data){
                if(data == undefined || data == "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        }

        this.getNetPhoneInfo = function(){
            var deferred = $q.defer();
            porterService.requestOne('netWorkPhone.GetNetworkPhoneInfo').then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        }
    }
]);

nurseService.service('MdcConfigService',['$http','$q','base64','porterService',
    function($http, $q, base64, porterService){
        this.GetMdcConfigInfo = function(){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.GetMdcConfigInfo').then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.SetMdcConfigInfo = function(data){
            var deferred = $q.defer();
            var q = parseConfigMdc(data);
            porterService.requestOne('mdcConfig.SetMdcConfigInfo',base64.encode(q)).then(function(data){
                if (data === undefined || data === "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        function parseConfigMdc(data){
            data.line1PhaseBVoltage = data.line1PhaseBVoltage == undefined ? "" : data.line1PhaseBVoltage;
            data.line1PhaseBCurrent = data.line1PhaseBCurrent == undefined ? "" : data.line1PhaseBCurrent;
            data.line1PhaseCVoltage = data.line1PhaseCVoltage == undefined ? "" : data.line1PhaseCVoltage;
            data.line1PhaseCCurrent = data.line1PhaseCCurrent == undefined ? "" : data.line1PhaseCCurrent;
            var str = data.type+"|"+data.id+"|"+data.name+"|"+data.cabinetNumber+"|"+data.cabinetUHeight+"|"+data.lineNumber+"|"+data.powerConsumption+"|"+
                data.line1PhaseAVoltage+"|"+data.line1PhaseACurrent+"|"+data.line1PhaseBVoltage+"|"+data.line1PhaseBCurrent+"|"+
                data.line1PhaseCVoltage+"|"+data.line1PhaseCCurrent;
            if(data.lineNumber == 2){
                str += "|"+data.line2PhaseAVoltage+"|"+data.line2PhaseACurrent+"|"+data.line2PhaseBVoltage+"|"+data.line2PhaseBCurrent+"|"+
                    data.line2PhaseCVoltage+"|"+data.line2PhaseCCurrent;
            }
            return str;
        }
        this.GetCabinetTypeDataItem = function(entryId){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.GetCabinetTypeDataItem',entryId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.GetOtherEvents = function(mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.GetOtherEvents',mdcId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };

        this.GetOtherSignal = function(){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.GetOtherSignal').then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.SetOtherSignal = function(q){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.SetOtherSignal',q).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.GetAllEvents = function(){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.GetAllEvents').then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.InitCabinet = function(cabinet,type){
            var deferred = $q.defer();
            var q = parseCabinet(cabinet,type);
            porterService.requestOne('mdcConfig.InitCabinet',base64.encode(q)).then(function(data){
                if (data === undefined || data === "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        function parseCabinet(cabinet,type){
            var q = cabinet.cabinetNo+"|"+cabinet.name+"|"+cabinet.mdcId+"|"+cabinet.cabinetType+"|";
            if(type == 1 || type == 0)
                q += "A";
            else{
                if(cabinet.cabinetNo <= (cabinet.cabinetNumber/2)) q += "A";
                else q += "B";
            }
            q += "|"+cabinet.ratedVoltage+"|"+cabinet.ratedCurrent+"|"+cabinet.phaseAVoltage+"|"+cabinet.phaseACurrent+"|"+
                cabinet.phaseBVoltage+"|"+cabinet.phaseBCurrent+"|"+cabinet.phaseCVoltage+"|"+cabinet.phaseCCurrent+"|"+cabinet.description;
            return q;
        };
        this.InitCabinetThermalSensors = function(cabinet){
            var deferred = $q.defer();
            var q = cabinet.mdcId+"|"+cabinet.cabinetNo+"|"+cabinet.thermalSensors1+"|"+cabinet.thermalSensors2+"|"+cabinet.thermalSensors3;
            porterService.requestOne('mdcConfig.InitCabinetThermalSensors',base64.encode(q)).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.UpdateOtherEvent = function(cabinet){
            var deferred = $q.defer();
            var q = parseOtherEvent(cabinet);
            porterService.requestOne('mdcConfig.UpdateOtherEvent',q).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        function parseOtherEvent(cabinet){
            var str = cabinet.mdcId+"|"+cabinet.cabinetId;
            if(cabinet.otherEvent){
                cabinet.otherEvent.forEach(function(item){
                    str += "|"+item.deviceId+"-"+item.signalId;
                });
            }
            return str;
        };
        this.UpdateCabinetDevice = function(cabinet){
            var deferred = $q.defer();
            var q = parseEquipment(cabinet);
            porterService.requestOne('mdcConfig.UpdateCabinetDevice',q).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        function parseEquipment(cabinet){
            var str = cabinet.mdcId+"|"+cabinet.cabinetId;
            if(cabinet.equipment){
                cabinet.equipment.forEach(function(item){
                    str += "|"+item.id+"-"+base64.encode(item.name)+"-"+item.index+"-"+item.height;
                });
            }
            return str;
        };

        this.GetCabinetAssetInfo = function(cabinetId,mdcId){
            var deferred = $q.defer();
            porterService.requestOne('mdcConfig.GetCabinetAssetInfo',cabinetId+"|"+mdcId).then(function(data){
                if (data === undefined || data === "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        this.UpdateCabinetAsset = function(cabinetAsset){
            var deferred = $q.defer();
            var q = base64.encode(parseCabinetAsset(cabinetAsset));
            porterService.requestOne('mdcConfig.UpdateCabinetAsset',q).then(function(data){
                if (data === undefined || data === "") return;
                deferred.resolve(data);
            },function(data){
                deferred.reject('No data');
            });
            return deferred.promise;
        };
        function parseCabinetAsset(ca){
            return ca.assetId+"|"+ca.mdcId+"|"+ca.cabinetId+"|"+ca.assetCode+"|"+ca.date+"|"+ca.vendor+"|"+
                ca.model+"|"+ca.responsible+"|"+ca.employeeId+"|"+ca.description;
        };

        this.GetAllAisleThermalHumidity = function(mdcId){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.getAllAisleThermalHumidity",mdcId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io GetAllAisleThermalHumidity');
            });

            return deferred.promise;
        };

        this.SetAisleThermalHumidity = function(q){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.setAisleThermalHumidity",q).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io SetAisleThermalHumidity');
            });

            return deferred.promise;
        };

        this.GetAisleDeviceLocation = function(){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.getAisleDeviceLocation").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io GetAisleDeviceLocation');
            });

            return deferred.promise;
        };

        this.SetAisleDeviceLocation = function(q){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.setAisleDeviceLocation",base64.encode(q)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io SetAisleDeviceLocation');
            });

            return deferred.promise;
        };

        this.DelAisleDeviceLocation = function(id){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.delAisleDeviceLocation",id).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io DelAisleDeviceLocation');
            });

            return deferred.promise;
        };

        this.GetMdcControlByName = function(mdcId,controlName){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.GetMdcControlByName",base64.encode(mdcId+"|"+controlName)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io GetMdcControlByName');
            });

            return deferred.promise;
        };

        this.SettingMdcControl = function(MdcId,ControlName,EquipmentId,BaseTypeId,ParameterValues,Password){
            var deferred = $q.defer();

            var q = MdcId+"|"+ControlName+"|"+EquipmentId+"|"+BaseTypeId+"|"+ParameterValues+"|"+Password;
            porterService.requestOne("mdcConfig.SettingMdcControl",base64.encode(q)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io SettingMdcControl');
            });

            return deferred.promise;
        };

        this.RemoveMdcControl = function(mdcId,ControlName){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.RemoveMdcControl",base64.encode(mdcId+"|"+ControlName)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io RemoveMdcControl');
            });

            return deferred.promise;
        };

        this.GetAllAisleDeviceList = function(){
            var deferred = $q.defer();

            porterService.requestOne("mdcConfig.GetAllAisleDeviceList").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io GetAisleDeviceLocation');
            });

            return deferred.promise;
        };
    }
]);

nurseService.service('TemplateService', ['$http', '$q', 'base64', 'porterService',
    function($http, $q, base64, porterService) {
        this.GetSignalByEquipmentTemplateId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetSignalByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.GetEventByEquipmentTemplateId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetEventByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.GetControlByEquipmentTemplateId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetControlByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.GetEventConditionByEquipmentTemplateId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetEventConditionByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.GetControlMeaningsByEquipmentTemplateId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetControlMeaningsByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.GetSignalMeaningsByEquipmentTemplateId = function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetSignalMeaningsByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.GetMaxBaseTypeByEquipmentTemplateId = function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetMaxBaseTypeByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.SaveSignalMeanings = function(Params) {
            var deferred = $q.defer();
            var q = parseSignalMeanings(Params);
            porterService.requestOne("template.SaveSignalMeanings", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        function parseSignalMeanings(data){
            var result = data.EquipmentTemplateId+"|"+data.Id;
            data.forEach(function(item){
                result += "|"+item.Value+"-"+item.Meanings;
            });
            return result;
        };

        this.SaveSignal = function(data) {
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.SignalId+"|"+data.SignalName+"|"+data.BaseTypeId+"|"+data.ChannelNo+"|"+
                data.ChannelType+"|"+data.DataType+"|"+data.ShowPrecision+"|"+data.Expression+"|"+data.SignalCategory+"|"+
                data.SignalType+"|"+data.Unit+"|"+data.Enable+"|"+data.Visible+"|"+data.StoreInterval+"|"+
                data.AbsValueThreshold+"|"+data.PercentThreshold+"|"+data.StaticsPeriod+"|"+data.ChargeStoreInterVal+"|"+data.ChargeAbsValue;
            porterService.requestOne("template.SaveSignal", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.DeleteSignal = function(equipmentTemplateId,id) {
            var deferred = $q.defer();
            var q = equipmentTemplateId+"|"+id;
            porterService.requestOne("template.DeleteSignal", q).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.GetNextSignalId = function(equipmentTemplateId,type) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetNextSignalId", equipmentTemplateId+"|"+type).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.AddSignal = function(data) {
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.SignalId+"|"+data.SignalName+"|"+data.BaseTypeId+"|"+data.ChannelNo+"|"+
                data.ChannelType+"|"+data.DataType+"|"+data.ShowPrecision+"|"+data.Expression+"|"+data.SignalCategory+"|"+
                data.SignalType+"|"+data.Unit+"|"+data.Enable+"|"+data.Visible+"|"+data.StoreInterval+"|"+
                data.AbsValueThreshold+"|"+data.PercentThreshold+"|"+data.StaticsPeriod+"|"+data.ChargeStoreInterVal+"|"+data.ChargeAbsValue;
            porterService.requestOne("template.AddSignal", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.BatchBaseTypeId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.BatchBaseTypeId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.GetDataItemByEntryId= function(EntryId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetDataItemByEntryId", EntryId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.SaveCondition = function(Params){
            var deferred = $q.defer();
            var q = parseEventCondition(Params);
            porterService.requestOne("template.SaveEventCondition", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        function parseEventCondition(data){
            var result = data.EquipmentTemplateId+"|"+data.EventId;
            data.forEach(function(item){
                if(item.StartCompareValue == undefined || item.StartCompareValue == "") item.StartCompareValue = 0;
                if(item.StartDelay == undefined || item.StartDelay == "") item.StartDelay = 0;
                result += "|"+item.EventConditionId+"&"+item.EventSeverity+"&"+item.StartOperation+"&"+item.StartCompareValue+"&"+
                    item.StartDelay+"&"+item.Meanings+"&"+item.BaseTypeId;
            });
            return result;
        };

        this.BatchModifyCondition = function(rarams){
            var deferred = $q.defer();
            porterService.requestOne("template.BatchModifyEventCondition", base64.encode(rarams)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.AddEvent = function(data){
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.EventId+"|"+data.EventName+"|"+data.StartType+"|"+data.EndType+"|"+
                data.StartExpression+"|"+data.EventCategory+"|"+data.SignalId+"|"+data.Enable+"|"+data.Visible;
            porterService.requestOne("template.AddEvent", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.SaveEvent = function(data){
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.EventId+"|"+data.EventName+"|"+data.StartType+"|"+data.EndType+"|"+
                data.StartExpression+"|"+data.EventCategory+"|"+data.SignalId+"|"+data.Enable+"|"+data.Visible;
            porterService.requestOne("template.SaveEvent", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.DeleteEvent = function(equipmentTemplateId,id){
            var deferred = $q.defer();
            var q = equipmentTemplateId+"|"+id;
            porterService.requestOne("template.DeleteEvent", q).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.SaveControlMeanings = function(Params) {
            var deferred = $q.defer();
            var q = parseSignalMeanings(Params);
            porterService.requestOne("template.SaveControlMeanings", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.AddControl = function(data) {
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.ControlId+"|"+data.ControlName+"|"+data.ControlCategory+"|"+
                data.CmdToken+"|"+data.ControlSeverity+"|"+data.SignalId+"|"+data.TimeOut+"|"+data.Retry+"|"+data.Enable+"|"+
                data.Visible+"|"+data.CommandType+"|"+data.ControlType+"|"+data.DataType+"|"+data.MaxValue+"|"+data.MinValue+"|"+data.BaseTypeId;;
            porterService.requestOne("template.AddControl", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.SaveControl = function(data) {
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.ControlId+"|"+data.ControlName+"|"+data.ControlCategory+"|"+
                data.CmdToken+"|"+data.ControlSeverity+"|"+data.SignalId+"|"+data.TimeOut+"|"+data.Retry+"|"+data.Enable+"|"+
                data.Visible+"|"+data.CommandType+"|"+data.ControlType+"|"+data.DataType+"|"+data.MaxValue+"|"+data.MinValue+"|"+data.BaseTypeId;
            porterService.requestOne("template.SaveControl", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.DeleteControl = function(equipmentTemplateId,id){
            var deferred = $q.defer();
            var q = equipmentTemplateId+"|"+id;
            porterService.requestOne("template.DeleteControl", q).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };


		this.getAllEventSeverity = function() {
			var deferred = $q.defer();
			porterService.requestOne("template.getAllEventSeverity").then(function(data) {
				if (data === undefined) return;
				var ret = angular.fromJson(data);
				deferred.resolve(ret.ret);
			}, function(data) {
				deferred.reject('unable to get all getAllEventSeverity');
			});
			return deferred.promise;
		};
        this.GetMaxChannelNo = function(q) {
            var deferred = $q.defer();

            porterService.requestOne("template.GetMaxChannelNo",q).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io equipmentTemplates');
            });

            return deferred.promise;
        };
		this.GetEquipmentBaseType = function(){
            var deferred = $q.defer();
            porterService.requestOne("template.GetEquipmentBaseType").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get all GetEquipmentBaseType');
            });
            return deferred.promise;
		};
        this.SaveEquipmentTemplate=function(data){
            var deferred = $q.defer();
            var q = data.EquipmentTemplateId+"|"+data.EquipmentCategory+"|"+data.EquipmentTemplateName+"|"+data.EquipmentBaseType+"|"+data.Vendor+"|"+data.Property;
            porterService.requestOne("template.SaveEquipmentTemplate", base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default Template');
            });
            return deferred.promise;
		};
        this.GetBaseDicByBaseType = function(type,baseType){
            var deferred = $q.defer();
            porterService.requestOne("template.GetBaseDicByBaseType",type +"|"+ baseType).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get all GetBaseDicByBaseType');
            });
            return deferred.promise;
        };
        this.GetEquipmentBaseTypeById = function(id){
            var deferred = $q.defer();
            porterService.requestOne("template.GetEquipmentBaseTypeById",id).then(function(data) {
                if (data === undefined)
                    deferred.resolve(101);
                else
                    deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get all GetEquipmentBaseTypeById');
            });
            return deferred.promise;
		};
		this.InsertBaseType=function(type,EquipmentBaseType,BaseTypeId,StartNum,EndNum){
            var deferred = $q.defer();
            porterService.requestOne("template.InsertBaseType",type+"|"+EquipmentBaseType+"|"+BaseTypeId+"|"+StartNum+"|"+EndNum).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get all GetEquipmentBaseTypeById');
            });
            return deferred.promise;
		};
        this.GetRemoteControlByEquipmentTemplateId= function(EquipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("template.GetRemoteControlByEquipmentTemplateId", EquipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        this.DeleteBaseDic = function(Type,BaseTypeId){
            var deferred = $q.defer();
            porterService.requestOne("template.DeleteBaseDic",Type+"|"+BaseTypeId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to insert all InsertControlBaseType');
            });
            return deferred.promise;
        };

        this.ShieldEnableEvent = function(equipmentTemplateId,eventId,enable){
            var deferred = $q.defer();

            var q = equipmentTemplateId+"|"+eventId+"|"+enable;
            porterService.requestOne("template.ShieldEnableEvent",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to insert all InsertControlBaseType');
            });
            return deferred.promise;
        };

        this.ExportProtocol = function(templateId){
            var deferred = $q.defer();
            porterService.requestOne("template.ExportProtocol",templateId).then(function(data) {
                if (data === undefined) return;
                data = data.replace("\\","/");
                var fileName = data.substring(data.lastIndexOf("/")+1);
                downloadURI("/upload/"+data,fileName);
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to save file');
            });
            return deferred.promise;
        };
        function downloadURI(uri, name) {
            var link = document.createElement("a");
            link.download = name;
            link.target = "_blank";

            // Construct the uri
            link.href = uri;
            document.body.appendChild(link);
            link.click();

            // Cleanup the DOM
            document.body.removeChild(link);
        }
    }
]);
nurseService.service('hisCardsService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        var self = {};

        Date.prototype.getFromFormat = function(format) {
            var yyyy = this.getFullYear().toString();
            format = format.replace(/yyyy/g, yyyy)
            var mm = (this.getMonth() + 1).toString();
            format = format.replace(/mm/g, (mm[1] ? mm : "0" + mm[0]));
            var dd = this.getDate().toString();
            format = format.replace(/dd/g, (dd[1] ? dd : "0" + dd[0]));
            var hh = this.getHours().toString();
            format = format.replace(/hh/g, (hh[1] ? hh : "0" + hh[0]));
            var ii = this.getMinutes().toString();
            format = format.replace(/ii/g, (ii[1] ? ii : "0" + ii[0]));
            var ss = this.getSeconds().toString();
            format = format.replace(/ss/g, (ss[1] ? ss : "0" + ss[0]));
            return format;
        };

        self.getHisCards = function(startTime, endTime) {
            var deferred = $q.defer();

            var qs = startTime.getFromFormat('yyyy-mm-dd') + "|" + endTime.getFromFormat('yyyy-mm-dd');

            porterService.requestOne("hiscard.getHisCard", qs).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        self.likeHisCards = function(index,size,startTime, endTime,param) {
            var deferred = $q.defer();

            var qs = index+"|"+size+"|"+startTime.getFromFormat('yyyy-mm-dd') + "|" + endTime.getFromFormat('yyyy-mm-dd')+"|"+param;

            porterService.requestOne("hiscard.likeHisCards", base64.encode(qs)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        self.likeHisCardTotals = function(startTime, endTime , param) {
            var deferred = $q.defer();

            var qs = startTime.getFromFormat('yyyy-mm-dd') + "|" + endTime.getFromFormat('yyyy-mm-dd')+"|"+param;

            porterService.requestOne("hiscard.likeHisCardTotals", base64.encode(qs)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get his alarm');
            });
            return deferred.promise;
        };

        return self;
    }
]);

nurseService.service('AlarmLinkageService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.GetAllAlarmLinkage= function() {
            var deferred = $q.defer();
            porterService.requestOne("alarmLinkage.GetAllAlarmLinkage").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                ret.ret.forEach(function(item){
                    if(item.controlLogActions != null && item.controlLogActions != ""){
                        var obj = angular.fromJson(item.controlLogActions);
                        item.controlLogActions = obj;
                    }
                });
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.InsertAlarmLinkage = function(data){
            var deferred = $q.defer();
            var q = fromUpdate(data);
            porterService.requestOne("alarmLinkage.InsertAlarmLinkage",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.UpdateAlarmLinkage = function(data){
            var deferred = $q.defer();
            var q = fromUpdate(data);
            porterService.requestOne("alarmLinkage.UpdateAlarmLinkage",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };
        function fromUpdate(data){
            var res = data.logActionId+"|"+data.actionName+"|"+data.triggerType+"|"+data.startExpression+
                "|"+data.description+"|";
            data.controlLogActions.forEach(function(item){
                res += item.equipmentId+"&"+item.actionId+"&"+item.controlId+"&"+item.actionValue+";";
            });
            return res;
        };

        this.DeleteAlarmLinkage = function(data){
            var deferred = $q.defer();
            porterService.requestOne("alarmLinkage.DeleteAlarmLinkage",data).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.GetEventExperByETId = function(equipmentTemplateId) {
            var deferred = $q.defer();
            porterService.requestOne("alarmLinkage.GetEventExperByETId",equipmentTemplateId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get default equipment');
            });
            return deferred.promise;
        };

        this.InsertSignalLinkage = function(data){
            var deferred = $q.defer();
            porterService.requestOne("alarmLinkage.InsertSignalLinkage",base64.encode(data)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get InsertSignalLinkage');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('ConfigureMoldService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.GetAllConfigureMold= function() {
            var deferred = $q.defer();
            porterService.requestOne("configureMold.GetAllConfigureMold").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                ret.ret.forEach(function(item){
                    if(item.parts != undefined && item.parts != '')
                        item.parts = angular.fromJson(item.parts);
                });
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };
        this.ParamConfigureMold= function(dom) {
            var deferred = $q.defer();

            var baseTypeId = "";
            if(dom.deviceBaseTypeId != "" && dom.deviceBaseTypeId != undefined)
                baseTypeId = dom.deviceBaseTypeId;
            else if(dom.diagram.deviceBaseTypeId != "" && dom.diagram.deviceBaseTypeId != undefined)
                baseTypeId = dom.diagram.deviceBaseTypeId;

            var title = "";
            $("#side-menu li a").each(function(){
                if($(this).context.className.indexOf("active") > -1){
                    title = this.innerText;
                }
            });

            porterService.requestOne("configureMold.GetShowConfigureMold").then(function(data) {
                if (data === undefined) return;
                var cfg = [];
                var ret = angular.fromJson(data);

                var cuurData = [];
                ret.ret.forEach(function(item){
                    if(item.parts != undefined && item.parts != ''){
                        item.parts = angular.fromJson(item.parts);

                        for(var i = 0;i < item.parts.length; i++){
                            if(item.parts[i].deviceId <= 0)
                                item.parts[i].deviceId = item.parts[i].configUrl.replace(/[^0-9]/ig,'');
                            if(item.parts[i].configUrl.indexOf("/"+baseTypeId+"/") > -1){
                                cuurData.push(item);
                                break;
                            }
                        }
                    }
                });
                if(cuurData.length == 1)
                    cfg = cuurData[0].parts;
                else{
                    cuurData.forEach(function(cd){
                        if(cd.configName == title.trim()){
                            cfg = cd.parts;
                        }
                    });
                }
                deferred.resolve(cfg);
            }, function(data) {
                deferred.reject('ParamConfigureMold Error');
            });
            return deferred.promise;
        };


        this.UpdateConfigureMold= function(cm) {
            var deferred = $q.defer();
            var q = cm.configId+"|"+cm.configName+"|"+cm.fontChart+"|"+cm.configUrl+"|"+cm.equipmentId+"|"+cm.displayIndex+"|"+
                cm.displayType+"|"+cm.parentId+"|"+cm.visible+"|"+cm.description;
            porterService.requestOne("configureMold.UpdateConfigureMold",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };
        this.InsertConfigureMold = function(configId) {
            var deferred = $q.defer();
            porterService.requestOne("configureMold.InsertConfigureMold",configId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };
        this.DeleteConfigureMold= function(configId) {
            var deferred = $q.defer();
            porterService.requestOne("configureMold.DeleteConfigureMold",configId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };
        this.SortConfigureMold= function(direction,configId) {
            var deferred = $q.defer();
            porterService.requestOne("configureMold.SortConfigureMold",direction+"|"+configId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };
        this.VisibleConfigureMold= function(configId,visible) {
            var deferred = $q.defer();
            porterService.requestOne("configureMold.VisibleConfigureMold",configId+"|"+visible).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };
        this.GetPartEquipments= function(parentId) {
            var deferred = $q.defer();
            porterService.requestOne("configureMold.GetPartEquipments",parentId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };

        this.GetStructureDevice = function(param){
            var deviceBaseTypeId = param.deviceBaseTypeId;

            var deferred = $q.defer();
            porterService.requestOne("configureMold.GetAllConfigureMold").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                var currDevices = [];
                ret.ret.forEach(function(item){
                    if(item.parts != undefined && item.parts != '')
                        item.parts = angular.fromJson(item.parts);

                    var parents = getParentsById(deviceBaseTypeId,item.parts);

                    if(parents.length > 0){
                        parents.forEach(function(parent){
                            currDevices.push(parent);
                        });
                    }

                    /*for(var i = 0;i < item.parts.length; i++){
                        if(item.parts[i].parentId == parentId && item.parts[i].visible != "false")
                            currDevices.push(item.parts[i]);
                    }*/
                });
                deferred.resolve(currDevices);
            }, function(data) {
                deferred.reject('GetAllConfigureMold Error');
            });
            return deferred.promise;
        };

        function getParentsById(id,parts){
            var result = [];
            if(parts){
                parts.forEach(function(part){
                    if(part.configUrl.indexOf("structure/"+id) > -1){
                        result = parts;
                    }
                });
                if(result == undefined){
                    parts.forEach(function(part){
                        if(part.equipmentId == id){
                            result = parts;
                        }
                    });
                }
            }
            return result;
        }

        this.ExportAllConfiguration = function(){
            var deferred = $q.defer();
            porterService.requestOne("configureMold.ExportAllConfiguration").then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('ExportAllConfiguration Error');
            });
            return deferred.promise;
        };
        this.ExportCurrentConfiguration = function(configId){
            var deferred = $q.defer();
            porterService.requestOne("configureMold.ExportCurrentConfiguration",configId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('ExportCurrentConfiguration Error');
            });
            return deferred.promise;
        };
        this.ImportAllConfiguration = function(param){
            var deferred = $q.defer();
            porterService.requestOne("configureMold.ImportAllConfiguration",param).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('ExportCurrentConfiguration Error');
            });
            return deferred.promise;
        };
        this.ImportCurrentConfiguration = function(param){
            var deferred = $q.defer();
            porterService.requestOne("configureMold.ImportCurrentConfiguration",param).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('ExportCurrentConfiguration Error');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('SystemSetting',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.LoadFeatureConfig = function() {
            var deferred = $q.defer();
            porterService.requestOne("systemSetting.loadFeatures").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };
        this.Shutdown = function(loginId,password) {
            var deferred = $q.defer();
            var q = loginId+"|"+password;
            porterService.requestOne("systemSetting.shutdown",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };
        this.Reboot = function(loginId,password) {
            var deferred = $q.defer();
            var q = loginId+"|"+password;
            porterService.requestOne("systemSetting.reboot",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };
        this.IsFactorStatFileExist = function() {
            var deferred = $q.defer();
            porterService.requestOne("systemSetting.isFactorStatFileExist").then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };
        this.Reset = function(loginId,password) {
            var deferred = $q.defer();
            var q = loginId+"|"+password;
            porterService.requestOne("systemSetting.reset",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };
        this.BrowserHeartbeat = function(type) {
            var deferred = $q.defer();
            var q = getSystemName()+"-"+type;
            porterService.requestOne("systemSetting.browserHeartbeat",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };

        function getSystemName(){
            var userAgent = window.navigator.userAgent;
            var name = "unknown";
            if (userAgent.indexOf("Windows")!= -1){
                name = "Windows";
            }else if (userAgent.indexOf("Mac") != -1){
                name = "Mac/iOS";
            }else if (userAgent.indexOf("X11") != -1){
                name = "UNIX";
            }else if (userAgent.indexOf("Linux") != -1){
                name = "Linux";
            }
            return name;
        };
    }
]);

nurseService.service('HistoryDataClear',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.GetAllIntervalClearData = function() {
            var deferred = $q.defer();
            porterService.requestOne("historyDataClear.GetAllIntervalClearData").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };

        this.InsertIntervalClearData = function(data) {
            var deferred = $q.defer();
            var q = data.name+"|"+data.clearObject+"|"+data.delay+"|"+data.period+"|"+data.storageDays+"|"+data.storageCols+"|"+data.status;
            porterService.requestOne("historyDataClear.InsertIntervalClearData",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };

        this.UpdateIntervalClearData = function(data) {
            var deferred = $q.defer();
            var q = data.id+"|"+data.name+"|"+data.clearObject+"|"+data.delay+"|"+data.period+"|"+data.storageDays+"|"+data.storageCols+"|"+data.status;
            porterService.requestOne("historyDataClear.UpdateIntervalClearData",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };

        this.DeleteIntervalClearData = function(id) {
            var deferred = $q.defer();
            porterService.requestOne("historyDataClear.DeleteIntervalClearData",id).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };

        this.ResetIntervalClearData = function() {
            var deferred = $q.defer();
            porterService.requestOne("historyDataClear.ResetIntervalClearData").then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('LoadFeatureConfig Error');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('EventService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.GetEquipmentTemplateEvents = function(q) {
            var deferred = $q.defer();
            porterService.requestOne("event.getEquipmentTemplateEvents",q).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                ret.ret.forEach(function(item){
                    item.equipments = angular.fromJson(item.equipments);
                });
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('GetEquipmentTemplateEvents Error');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('ImageManageService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.LoadImagesByPath = function(q) {
            var deferred = $q.defer();
            porterService.requestOne("imageManage.LoadImagesByPath",q).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('LoadImagesByPath Error');
            });
            return deferred.promise;
        };
    }
]);


nurseService.service('LicenseService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.CheckoutLicense = function(){
            var deferred = $q.defer();
            porterService.requestOne("license.CheckoutLicense").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('CheckoutLicense Error');
            });
            return deferred.promise;
        };

        this.GenerateInfoFile = function() {
            var deferred = $q.defer();
            porterService.requestOne("license.GenerateInfoFile").then(function(data) {
                if (data === undefined) return;
                downloadURI("/upload/NurseInfo.key","/upload/NurseInfo.key");
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('GenerateInfoFile Error');
            });
            return deferred.promise;
        };

        function downloadURI(uri, name) {
            var link = document.createElement("a");
            link.download = name;
            link.target = "_blank";

            // Construct the uri
            link.href = uri;
            document.body.appendChild(link);
            link.click();

            // Cleanup the DOM
            document.body.removeChild(link);
        }

        this.UploadLicenseFile = function(q){
            var deferred = $q.defer();
            porterService.requestOne("license.UploadLicenseFile",q).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('UploadLicenseFile Error');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('assetsManagerService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.addNewAssets = function(data){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.addNewAssetsInfo",data).then(function(data) {
                if (data === undefined) return;
                if("getOneCode" === data){
                    deferred.resolve(data);
                }else{
                    var ret = angular.fromJson(data);
                    deferred.resolve(ret.ret);
                }
            }, function(data) {
                deferred.reject('addAssetsInfo Error');
            });
            return deferred.promise;
        };
        this.loadAllAssetsInfo = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.getAllAssetsInfo").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('LoadAllAssetsInfo Error');
            });
            return deferred.promise;
        };
        this.editAssetsData = function(data){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.editAssetsInfo",data).then(function(retData) {
                if(retData === undefined) return ;
                if("getOtherCode" === retData){
                    deferred.resolve(retData);
                }else if("editAssetsById Error" === retData){
                    deferred.resolve(retData);
                }else{
                    var ret = angular.fromJson(retData);
                    deferred.resolve(ret.ret);
                }
            },function(retData){
                deferred.reject("editAssets Error");
            });
            return deferred.promise;
        };
        this.delAssets = function(id){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.delAssetsByAssetsId",id).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('delAssetsByAssetsId Error');
            });
            return deferred.promise;
        };
        this.getCabinetInfo = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.getCabinetInfo").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            });
            return deferred.promise;
        };
        this.importMDCAssets = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.oneKeyImportMDCAssets").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            });
            return deferred.promise;
        };
        this.selectCabinetUHeightByName = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.getMdcCabinetUHeight").then(function(retData) {
                if (retData === undefined) return;
                deferred.resolve(retData);
            });
            return deferred.promise;
        };
        this.LikeLimitAssetsInfo = function(index,size,param){
            var deferred = $q.defer();
            var q = index+"|"+size+"|"+param;
            porterService.requestOne("assetsManager.likeLimitAssetsInfo",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            });
            return deferred.promise;
        };
        this.GetLikeAssetsTotals = function(param){
            var deferred = $q.defer();
            porterService.requestOne("assetsManager.getLikeAssetsTotals",base64.encode(param)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('RtspVideoService',['$http','$q','base64','porterService',
    function($http, $q, base64, porterService){
        this.GetRtspVideo = function(){
            var deferred = $q.defer();

            porterService.requestOne("rtspVideo.getRtspVideo").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io getRtspVideo');
            });

            return deferred.promise;
        };
    }
]);

nurseService.service("UserOperationLogService",['$http','$q','base64','porterService',
    function($http, $q, base64, porterService){

        Date.prototype.getFromFormat = function(format) {
            var yyyy = this.getFullYear().toString();
            format = format.replace(/yyyy/g, yyyy);
            var mm = (this.getMonth() + 1).toString();
            format = format.replace(/mm/g, (mm[1] ? mm : "0" + mm[0]));
            var dd = this.getDate().toString();
            format = format.replace(/dd/g, (dd[1] ? dd : "0" + dd[0]));
            var hh = this.getHours().toString();
            format = format.replace(/hh/g, (hh[1] ? hh : "0" + hh[0]));
            var ii = this.getMinutes().toString();
            format = format.replace(/ii/g, (ii[1] ? ii : "0" + ii[0]));
            var ss = this.getSeconds().toString();
            format = format.replace(/ss/g, (ss[1] ? ss : "0" + ss[0]));
            return format;
        };

        this.getUserOperationLog = function(startTime,endTime){
            var deferred = $q.defer();

            var qs = startTime.getFromFormat('yyyy-mm-dd') + "|" + endTime.getFromFormat('yyyy-mm-dd');

            porterService.requestOne("userLog.getUserOperationLog",base64.encode(qs)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io GetUserOperationLog');
            });

            return deferred.promise;
        };

        this.getLikeUserOperationLog = function(index,size,startTime, endTime,param){
            var deferred = $q.defer();

            var qs = index+"|"+size+"|"+startTime.getFromFormat('yyyy-mm-dd') + "|" + endTime.getFromFormat('yyyy-mm-dd')+"|"+param;

            porterService.requestOne("userLog.getLikeUserOperationLog",base64.encode(qs)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io GetUserOperationLog');
            });

            return deferred.promise;
        };

        this.GetUserOperationLogTotal = function(startTime, endTime,param){
            var deferred = $q.defer();

            var qs = startTime.getFromFormat('yyyy-mm-dd') + "|" + endTime.getFromFormat('yyyy-mm-dd')+"|"+param;

            porterService.requestOne("userLog.getUserOperationLogTotal",base64.encode(qs)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io GetUserOperationLogTotal');
            });

            return deferred.promise;
        };

        this.GetOperationType = function(){
            var deferred = $q.defer();
            porterService.requestOne("userLog.getOperationType").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('SelectAllRack Error');
            });
            return deferred.promise;
        }
    }
]);

nurseService.service('assetRackManagerService',['$http','$q','base64','porterService',
    function($http,$q,base64,porterService){
        this.ControlRack = function(param){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.ControlRack",base64.encode(param)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('ControlRack Error');
            });
            return deferred.promise;
        };
        this.SelectAllRack = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.SelectAllRack").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('SelectAllRack Error');
            });
            return deferred.promise;
        };
        this.SelectAllCabinet = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.SelectAllCabinet").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('SelectAllRack Error');
            });
            return deferred.promise;
        };
        this.GetIpAddress = function(){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.GetIpAddress").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('SelectAllRack Error');
            });
            return deferred.promise;
        };
        this.addCabinetRack = function(cabinetId,ip,port){
            var deferred = $q.defer();
            var param = cabinetId+"|"+ip+"|"+port;
            porterService.requestOne("assetRackManager.InsertCabinetRack",base64.encode(param)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('SelectAllRack Error');
            });
            return deferred.promise;
        };
        this.deleteCabinetRack = function(cabinetId){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.DeleteRack",cabinetId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('SelectAllRack Error');
            });
            return deferred.promise;
        };
        this.updateCabinetRack = function(rack){
            var deferred = $q.defer();
            var usedDate = isNaN(rack.UsedDate) ? rack.UsedDate : rack.UsedDate.getFromFormat('yyyy-mm-dd');
            var q = rack.RackId+"|"+rack.CabinetId+"|"+rack.RackIP+"|"+rack.RackMask+"|"+rack.RackGateway+"|"+rack.RackPort+"|"+
                rack.ServerIP+"|"+rack.ServerPort+"|"+rack.DeviceId+"|"+usedDate+"|"+rack.Monitoring;
            porterService.requestOne("assetRackManager.UpdateRack",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('updateCabinetRack Error');
            });
            return deferred.promise;
        };
        this.forcedEndAlarm = function(CabinetId){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.ForcedEndAlarm",CabinetId).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('forcedEndAlarm Error');
            });
            return deferred.promise;
        };
        this.SelectAssetsManager = function(cabinetId){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.SelectAssetsManager",cabinetId).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('SelectAssetsManager Error');
            });
            return deferred.promise;
        };
        this.UpdateAssetsManager = function(assets){
            var deferred = $q.defer();
            var usedDate = isNaN(assets.usedDate) ? assets.usedDate : assets.usedDate.getFromFormat('yyyy-mm-dd');
            var q = assets.assetsId+"|"+assets.assetsCode+"|"+assets.cabinetId+"|"+assets.assetsName+"|"+assets.assetStyle+"|"+
                assets.equipmentId+"|"+usedDate+"|"+assets.uIndex+"|"+assets.uHeight+"|"+assets.description;
            porterService.requestOne("assetRackManager.UpdateAssetsManager",base64.encode(q)).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('UpdateAssetsManager Error');
            });
            return deferred.promise;
        };
        this.DeleteAssetsManager = function(cabinetId,uIndex,uHeight){
            var deferred = $q.defer();
            porterService.requestOne("assetRackManager.DeleteAssetsManager",cabinetId+"|"+uIndex+"|"+uHeight).then(function(data) {
                if (data === undefined) return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('DeleteAssetsManager Error');
            });
            return deferred.promise;
        };
        this.QueryAssetsManagerLog = function(startDate,endDate){
            var deferred = $q.defer();
            var startDate = isNaN(startDate) ? startDate : startDate.getFromFormat('yyyy-mm-dd');
            var endDate = isNaN(endDate) ? endDate : endDate.getFromFormat('yyyy-mm-dd');
            porterService.requestOne("assetRackManager.QueryAssetsManagerLog",base64.encode(startDate+"|"+endDate)).then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('SelectAssetsManager Error');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('languageService',['$http','$q','base64','porterService',
    function($http, $q, base64, porterService){
        this.GetLanguage = function(){
            var deferred = $q.defer();

            porterService.requestOne("language.GetLanguage").then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io GetLanguage');
            });
            return deferred.promise;
        };
        this.GetLoginLanguageJson = function(){
            var deferred = $q.defer();

            porterService.requestOne("language.GetLoginLanguageJson").then(function(data) {
                if (data === undefined) return;
                var ret = angular.fromJson(data);

                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io GetLanguage');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('otherModuleService',['$http','$q','base64','porterService',
    function($http, $q, base64, porterService){
        this.PrintConfig = function(type){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.printConfig",type).then(function(data) {
                if (data === undefined || data == "" || data == "[]") return;
                data = data.replace(/</g,"&lt;");
                data = data.replace(/>/g,"&gt;");
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io PrintConfig');
            });
            return deferred.promise;
        };

        this.ModifyConfig = function(type,ipList,fsuPort,deviceList){
            var deferred = $q.defer();
            var pram = "";
            if(type == 'snmp')
                pram = parseSnmpListStr(ipList,deviceList);
            else
                pram = parseBListStr(ipList,fsuPort,deviceList);

            porterService.requestOne("otherModule.modifyConfig",base64.encode(type+"|"+pram)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io ModifyConfig');
            });
            return deferred.promise;
        };
        function parseSnmpListStr(ipList,deviceList){
            var ips = "";
            var devs = "";
            ipList.forEach(function(ip){
                ips += ip.ip+"-"+ip.port+";";
            });
            if(deviceList && deviceList.length > 0){
                deviceList.forEach(function(device){
                    devs += device.id+"-"+base64.encode(device.name)+"-"+device.type+";";
                });
            }
            return ips+"|fsuPort|"+devs;
        };

        function parseBListStr(ipList,fsuPort,deviceList){
            var ips = "";
            var devs = "";
            ips += ipList[0].ip+"-"+ipList[0].port+"|"+fsuPort;
            if(deviceList && deviceList.length > 0){
                deviceList.forEach(function(device){
                    devs += device.code+"-"+device.id+"-"+base64.encode(device.name)+";";
                });
            }
            return ips+"|"+devs;
        }

        this.DetectionConfig = function(type){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.detectionConfig",type).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io DetectionConfig');
            });
            return deferred.promise;
        };

        this.RestartConfig = function(type){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.restartConfig",type).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io RestartConfig');
            });
            return deferred.promise;
        };

        this.UploadConfig = function(type,url){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.uploadConfig",base64.encode(type+"|"+url)).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io UploadConfig');
            });
            return deferred.promise;
        };

        this.SwitchCheck = function(status,type){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.switchCheck",status+"|"+type).then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io SwitchCheck');
            });
            return deferred.promise;
        };

        this.GetLogContent = function(){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.getLogContent").then(function(data) {
                if (data === undefined || data == "" || data == "[]") return;
                data = data.replace(/</g,"&lt;");
                data = data.replace(/>/g,"&gt;");
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io GetLogContent');
            });
            return deferred.promise;
        };

        this.AddLogContent = function(){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.addLogContent").then(function(data) {
                if (data === undefined) return;

                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io AddLogContent');
            });
            return deferred.promise;
        };

        this.ReturnCmdContent = function(cmd,type){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.returnCmdContent",base64.encode(cmd+"|"+type)).then(function(data) {
                if (data === undefined || data == "" || data == "[]") return;
                data = data.replace(/</g,"&lt;");
                data = data.replace(/>/g,"&gt;");
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io ReturnCmdContent');
            });
            return deferred.promise;
        };

        this.LoadOtherModuleConfig = function(type){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.loadOtherModuleConfig",base64.encode(type)).then(function(data) {
                if (data === undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io LoadOtherModuleConfig');
            });
            return deferred.promise;
        };

        this.ModifyOtherModuleConfig = function(type,Chinamobile){
            var deferred = $q.defer();
            var cfg = angular.toJson(Chinamobile);
            porterService.requestOne("otherModule.modifyOtherModuleConfig",base64.encode(type+"|"+cfg)).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io ModifyOtherModuleConfig');
            });
            return deferred.promise;
        };

        /*this.LoadChinamobileConfig = function(){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.loadChinamobileConfig").then(function(data) {
                if (data === undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io GetLogContent');
            });
            return deferred.promise;
        };

        this.ModifyChinamobileConfig = function(Chinamobile){
            var deferred = $q.defer();
            var cfg = angular.toJson(Chinamobile);
            porterService.requestOne("otherModule.modifyChinamobileConfig",base64.encode(cfg)).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io GetLogContent');
            });
            return deferred.promise;
        };

        this.LoadChinaunicomConfig = function(){
            var deferred = $q.defer();

            porterService.requestOne("otherModule.loadChinaunicomConfig").then(function(data) {
                if (data === undefined || data == "") return;
                var ret = angular.fromJson(data);
                deferred.resolve(ret);
            }, function(data) {
                deferred.reject('unable to get io loadChinaunicomConfig');
            });
            return deferred.promise;
        };

        this.ModifyChinaunicomConfig = function(Chinaunicom){
            var deferred = $q.defer();
            var cfg = angular.toJson(Chinaunicom);
            porterService.requestOne("otherModule.modifyChinaunicomConfig",base64.encode(cfg)).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io ModifyChinaunicomConfig');
            });
            return deferred.promise;
        };*/

        this.GetChinaunicomFSUID = function(){
            var deferred = $q.defer();
            porterService.requestOne("otherModule.getChinaunicomFSUID").then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io ModifyChinaunicomConfig');
            });
            return deferred.promise;
        };
    }
]);

nurseService.service('mdcHisDataService',['$http','$q','base64','porterService',
    function($http, $q, base64, porterService){
        this.GetMdcChartMap = function(deviceId){
            var deferred = $q.defer();

            porterService.requestOne("mdcHistoryData.GetMdcChartMap",deviceId).then(function(data) {
                if (data === undefined || data == "" || data == "[]") return;
                var ret = angular.fromJson(data);
                if(ret.ret){
                    ret.ret.forEach(function(item){
                        if(item.Series != "")
                            item.Series = angular.fromJson(item.Series);
                    });
                }
                deferred.resolve(ret.ret);
            }, function(data) {
                deferred.reject('unable to get io GetMdcChartMap');
            });
            return deferred.promise;
        };

        this.InitDeviceChartMap = function(ChartSignal){
            var deferred = $q.defer();

            var q = base64.encode(getInt(ChartSignal.ChartMapId)+"|"+ChartSignal.DeviceId+"|"+ChartSignal.ChartType+"|"+
                getString(ChartSignal.Title) +"|"+getString(ChartSignal.Y1Name) +"|"+getString(ChartSignal.Y2Name)+"|"+
                getString(ChartSignal.XName)+"|"+ChartSignal.Max+"|"+ChartSignal.Min);
            porterService.requestOne("mdcHistoryData.InitDeviceChartMap",q).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io GetMdcChartMap');
            });
            return deferred.promise;
        };

        this.RemoveDeviceChartMap = function(ChartMapId){
            var deferred = $q.defer();

            porterService.requestOne("mdcHistoryData.RemoveDeviceChartMap",ChartMapId).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io GetMdcChartMap');
            });
            return deferred.promise;
        };

        this.InitChartSignalMap = function(ChartMapId,Series){
            var deferred = $q.defer();

            var q = base64.encode(ChartMapId+"|"+parseSeries(Series));
            porterService.requestOne("mdcHistoryData.InitChartSignalMap",q).then(function(data) {
                if (data === undefined || data == "") return;
                deferred.resolve(data);
            }, function(data) {
                deferred.reject('unable to get io GetMdcChartMap');
            });
            return deferred.promise;
        };

        function getString(obj){
            if(obj == undefined)
                return "";
            else
                return obj;
        }
        function getInt(obj){
            if(obj == undefined || obj == "")
                return -1;
            else
                return obj;
        }

        function parseSeries(Series){
            var result = "";
            if(Series){
                Series.forEach(function(ser){
                    var cfg = ser.DeviceId+"-"+ser.BaseTypeId+"-"+getString(ser.Name);

                    if(result == "")
                        result = cfg;
                    else
                        result += "|"+cfg;
                });
            }
            return result;
        }
    }
]);