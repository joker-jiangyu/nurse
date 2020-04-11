//debugger;
"use strict";

var nurseDirective = angular.module("nurseApp.directives", []);

nurseDirective.directive('chart', function() {
	return {
		restrict: 'E',
		template: '<div></div>',
		scope: {
			chartData: "=value",
			chartObj: "=obj"
		},
		transclude: true,
		replace: true,
		link: function($scope, $element, $attrs) {

			//Update when charts data changes
			$scope.$watch(function(){
                if($scope.chartData != undefined && $scope.chartData.series.length > 0)
                    return 'chartData'+$scope.chartData.series[0].data;
            }, function(value) {
				if (!value)
					return;

				// Initiate the chartData.chart if it doesn't exist yet
				$scope.chartData.chart = $scope.chartData.chart || {};

				// use default values if nothing is specified in the given settings
				$scope.chartData.chart.renderTo = $scope.chartData.chart.renderTo || $element[0];
				if ($attrs.type)
					$scope.chartData.chart.type = $scope.chartData.chart.type || $attrs.type;
				if ($attrs.height)
					$scope.chartData.chart.height = $scope.chartData.chart.height || $attrs.height;
				if ($attrs.width)
					$scope.chartData.chart.width = $scope.chartData.chart.type || $attrs.width;
				$scope.chartData.chart. backgroundColor= 'rgba(0,0,0,0)';
				var highchartsOptions = Highcharts.setOptions({
					lang: {
						loading: '加载中...',
						months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
						shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
						weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
						exportButtonTitle: '导出',
						printButtonTitle: '打印',
						rangeSelectorFrom: '从',
						rangeSelectorTo: '到',
						rangeSelectorZoom: "缩放",
						downloadPNG: '下载PNG格式',
						downloadJPEG: '下载JPEG格式',
						downloadPDF: '下载PDF格式',
						downloadSVG: '下载SVG格式',
						resetZoom : "还原大小",
    					resetZoomTitle : "还原大小"
					}
				});
				
				$scope.chartObj = new Highcharts.Chart($scope.chartData);

			});
		}
	};

});


nurseDirective.directive('multiselect', function($q) {
	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			language: "=",
			selectedLabel: "@",
			availableLabel: "@",
			displayAttr: "@",
			available: "=",
			model: "=ngModel"
		},
		templateUrl: 'partials/multiSelect.html',
		link: function(scope, elm, attrs) {
			scope.selected = {
				available: [],
				current: []
			};

			/* Handles cases where scope data hasn't been initialized yet */
			var dataLoading = function(scopeAttr) {
				var loading = $q.defer();
				if (scope[scopeAttr]) {
					loading.resolve(scope[scopeAttr]);
				} else {
					scope.$watch(scopeAttr, function(newValue, oldValue) {
						if (newValue !== undefined)
							loading.resolve(newValue);
					});
				}
				return loading.promise;
			};

			/* Filters out items in original that are also in toFilter. Compares by reference. */
			var filterOut = function(original, toFilter) {
				var filtered = [];
				angular.forEach(original, function(entity) {
					var match = false;
					for (var i = 0; i < toFilter.length; i++) {
						if (toFilter[i][attrs.displayAttr] == entity[attrs.displayAttr]) {
							match = true;
							break;
						}
					}
					if (!match) {
						filtered.push(entity);
					}
				});
				return filtered;
			};

			scope.refreshAvailable = function() {
				scope.available = filterOut(scope.available, scope.model);
				scope.selected.available = [];
				scope.selected.current = [];
			};

			scope.add = function() {
                if(!scope.available) scope.available = scope.selected.available;
                else scope.available = scope.available.concat(scope.selected.available);
                scope.model = filterOut(scope.model, scope.selected.available);
				scope.refreshAvailable();
			};
			scope.remove = function() {
				scope.model = scope.model.concat(scope.selected.current);
				scope.available = filterOut(scope.available, scope.selected.current);
				scope.refreshAvailable();
			};

			$q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
				scope.refreshAvailable();
			});

            scope.$watch('signalValue', function(newValue, oldValue, scope) {
                var value = newValue;
            })
		}
	};
});




nurseDirective.directive('basesignalsetter', ['$modal', 'baseTypeService','global','ConfigureMoldService','balert',
	function($modal, baseTypeService,global,ConfigureMoldService,balert) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var setDlg = null;

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});

					return found;
				}

                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;

                        var partid= element.parent().parent().attr("partid");
                        scope.partid=partid;
                        var obj = getPartConfig(scope.diagram, scope.partid);
                        if(global.getpara("DI",obj.binding))
                            scope.Topology.DeviceId = global.getpara("DI",obj.binding);
                        else
                            scope.Topology.DeviceId = scope.diagram.deviceId;

                        initList(scope.Topology.DeviceId);
                    });

					//region 修改信号名称
					var modifyDlg = $modal({
						scope: scope,
						templateUrl: 'partials/modifySignalName.html',
						show: false
					});
					scope.modifySignalName = function(){
						scope.modifySelects = scope.bind.selectedsigs;

						modifyDlg.$promise.then(modifyDlg.show);
					};
					scope.modify = function(){
						var arr = [];
						scope.displayNames = "";//baseTypeId.baseTypeName-...
						//获取input标签的id和value
						var modifys = $(".modify-signal-table").find(".modify-value");
						for(var i = 0; i < modifys.length; i++){
							if(modifys[i]){
								arr.push({
									id : modifys[i].id,
									value : modifys[i].value
								});
							}
						}
						//修改列表
						if(scope.modifySelects){
							scope.modifySelects.forEach(function(item){
								arr.forEach(function(a){
									if(item.baseTypeId == a.id && item.name != a.value){
										item.baseTypeName = a.value;
										scope.displayNames += a.id+"."+a.value+"-";
									}
								});
							});
						}
						scope.bind.selectedsigs = scope.modifySelects;
						modifyDlg.hide();
					};
					//endregion
                }
                /*********************************************************************/

				//show list 
				function initList(id) {

					baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
						var cfg = getPartConfig(scope.diagram, scope.partid);
						var bs = cfg.binding.split("\\|");
						scope.groupname = global.getpara("Name",cfg.options);
						scope.background = global.getpara("Background",cfg.options);
						scope.displayNames = global.getpara("DisplayName",cfg.options);
						var displays = scope.displayNames.split("-");

						var list = data;
						var selected = [];

						_.each(data, function(sig) {
							var found = _.find(bs, function(b) {

								var index = b.indexOf(sig.baseTypeId + "");

								if (index > 0) return true;

								return false;
							});

							if (found) {
								//修改显示名称
								if(displays){
									displays.forEach(function(dis){
										if(dis.indexOf(".") > -1){
											var dev = dis.split(".");
											if(sig.baseTypeId == dev[0])
												sig.baseTypeName = dev[1];
										}
									});
								}
								selected.push(sig);
							}
						});
                        if(list == undefined || list.length == undefined) return;
                        for(var i=0;i<selected.length;i++){
                            for(var j=0;j<list.length;j++){
                                if(list[j]==selected[i])
                                    list.splice(j,1);
                            }
                        }

						scope.bind = {
							siglist: list,
							selectedsigs: selected
						};

					});
				}


				element.bind('click', function() {
                    initDevice();

					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/basesignalsetter.html',
						show: false
					});

					setDlg.$promise.then(setDlg.show);

					//save selected

					scope.namechange = function(value){
						scope.groupname = value;
					};

					scope.changeBackgrund = function(value){
						scope.background = value;
					};

                    scope.changeDevice = function(id){
                        baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
							/*var list = data;
                            scope.bind = {
                                siglist: list,
                                selectedsigs: undefined
                            };*/
							scope.bind = retSelects(data,scope.bind.selectedsigs);
                        });
                    };

                    function retSelects(data,sigs){
                    	var bind = {siglist:data,selectedsigs: []};
                    	if(data){
                    		data.forEach(function(item){
                    			if(sigs){
									sigs.forEach(function(sig){
										if(item.baseTypeId == sig.baseTypeId)
											bind.selectedsigs.push(item);
									});
								}
							});
							for(var i = 0; i < bind.selectedsigs.length; i++){
								for(var j = 0; j < bind.siglist.length; j++){
									if(bind.selectedsigs[i].baseTypeId == bind.siglist[j].baseTypeId)
										bind.siglist.splice(j,1);
								}
							}
						}
                    	return bind;
					}

					scope.save = function() {
						if(scope.bind.selectedsigs == undefined || scope.bind.selectedsigs.length == 0){
							//'请选择信号！'
							balert.show('danger', scope.languageJson.Configuration.SignalControl.ErrorPrompt,3000);
							return;
						}

						var cfg = getPartConfig(scope.diagram, scope.partid);

						var bind = _.reduce(scope.bind.selectedsigs, function(memo, sig) {
							return memo + "BS:" + sig.baseTypeId + "|";
						}, '');
						cfg.binding = bind+"DI:"+scope.Topology.DeviceId;
                        cfg.options = "Name:"+scope.groupname+"|Background:"+scope.background+"|DisplayName:"+scope.displayNames;
						scope.resetParts();
						setDlg.hide();
					};

				});


			}
		};
	}
]);





nurseDirective.directive("signalgroup", ['diagramService','activeDeviceService','global',
	function(diagramService,activeDeviceService,global) {

		var linkFn = function(scope, elem, attrs, modelCtrl) {
			var cfg = diagramService.initPart(scope, elem, attrs);
			if (cfg === undefined) return;
            var name = global.getpara("Name",cfg.options);
			var background = global.getpara("Background",cfg.options);
			var displayNames = global.getpara("DisplayName",cfg.options);
			var displays = displayNames.split("-");
			//标题
			var titleHeight = 50;
            if(name == "" || name == undefined) {
				elem.find(".signal_title").hide();
				titleHeight = 0;
			}else
				elem.find(".groupname").html(name);
			//背景
			if(background == undefined)
				elem.find(".signal-body").addClass("configure_bg");
			else
				elem.find(".signal-body").addClass(background);

			var height = elem.find(".signal-body")[0].scrollHeight;
			elem.find(".signal-body-table").css("height",(height - titleHeight)+"px");

			scope.partid = attrs.partid;
			scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
				diagramService.updateEditStatus(elem, newValue);
			});
            activeDeviceService.getActiveDevices().then(function(data) {
                scope.devices = data;
            });
            scope.$watch('binddata', function(newValue, oldValue, scope) {
                var array = [];
                _.find(newValue, function(data) {
                    if(data.partId == scope.partid && data.signalName != ""){
                        var is = false;
                        if(scope.devices)
                            scope.devices.forEach(function(item){
                                if(item.status == "Disconnect" && data.deviceId == item.id)
                                    is = true;//通讯中断
                            });

                        if(data.alarmSeverity == 255){
                            if(is)	data.className = "signal-value-disconnect";//data.backgroundColor = "background-color:#575A5E";//通讯中断 灰色
                            else data.className = "signal-value-normal";//data.backgroundColor = "background-color:#5B9338";
                        }else if(data.alarmSeverity == -255 || data.alarmSeverity === ''){
                            //data.backgroundColor = "background-color:#575A5E";//signal-value-disconnect
							data.className = "signal-value-disconnect";
                            if(data.currentValue == "")
                                data.currentValue = scope.languageJson.Loading+"...";//加载中
                        }else data.className = "signal-value-alarm";//data.backgroundColor = "background-color:#A02B31";

						if(displays){
							displays.forEach(function(dis){
								if(dis.indexOf(".") > -1){
									var dev = dis.split(".");
									if(data.baseTypeId == dev[0])
										data.baseTypeName = dev[1];
								}
							});
						}

                        array.push(data);
                    }
                });
                scope.signalList = array;

				//组态背景高度自适应
				/*var oldHeight = elem.height()-20;
				var top = (name == "" || name == undefined) ? 20 : 70;
				var newHeight = top +  array.length*42;
				if(newHeight > oldHeight)
					elem.find(".signal-body").css("height",newHeight+"px");
				else
					elem.find(".signal-body").css("height","calc(100% - 19px)");*/
            });
		};

		return {
			scope: true,
			restrict: "AE",
			replace: true,
			templateUrl: "partials/signalgroup.html",
			compile: function(elem, attrs) {

				elem.find("tbody tr:first").attr("ng-repeat",
					"sig in signalList | filter:{ partId: '" + attrs.partid + "'}");

				return linkFn;
			}
		};
	}
]);



nurseDirective.directive('ngfile', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('change', function() {
				scope.$apply(function() {
					scope.$emit("fileSelected", element[0].files[0]);
				});
			});
		}
	};
}]);
nurseDirective.directive('ngfile2', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('change', function() {
                scope.$apply(function() {
                    scope.$emit("fileSelected2", element[0].files[0]);
                });
            });
        }
    };
}]);



nurseDirective.directive('resizer', ['$document', '$window', 'diagramService',
	function($document, $window, diagramService) {

	return {
		restrict: 'A',
		link: function($scope, $element, $attrs) {

			var m_type, m_ctrl;
			var moving = 0;

			var offsetX = 0;
			var offsetY = 0;
			var pageX = 0;
			var pageY = 0;

			// var menuWidth = 200;
			// var barHeight = 54;
			// var windowWidth = $(document.body).width();
			// var containerWidth = $(document.body).width() - menuWidth;
			// var windowHeight = $(document.body).height();

			// var elTop, elLeft;

			var r = document.createElement("div");
			var b = document.createElement("div");

			r.style.cursor = "e-resize";
			r.style.backgroundColor = "#0F5989";
			r.style.position = "absolute";
			r.style.right = "0px";
			r.style.top = "0px";
			r.style.height = "100%";
			r.style.width = "5px";
			r.className = "resizer";

			b.style.cursor = "s-resize";
			b.style.backgroundColor = "#0F5989";
			b.style.position = "absolute";
			b.style.right = "0px";
			b.style.bottom = "0px";
			b.style.height = "5px";
			b.style.width = "100%";
			b.className = "resizer";

			$element.append(r);
			$element.append(b);

			//	为调整控制元素设置拖拽处理
			r.addEventListener('mousedown', function(e) {
				if(sessionStorage.getItem("isLock") == "true") return;
				on_mousedown(e, r, 'r');
			});

			b.addEventListener('mousedown', function(e) {
				if(sessionStorage.getItem("isLock") == "true") return;
				on_mousedown(e, b, 'b');
			});

            // 鼠标移开保存控件修改
            r.addEventListener('mouseup', function(e) {
                on_mouseup();
            });
            b.addEventListener('mouseup', function(e) {
                on_mouseup();
            });
			$(document).on("mousemove", mousemove);
			$(document).on("mouseup", mouseup);

			//	页面鼠标移动侦听处理
			function mousemove(e) {
				//var e = window.event || e;
				if (!e) return;
				pageX = e.originalEvent.pageX;
				pageY = e.originalEvent.pageY;

				// if (!e) var e = window.event;
				// if (e.pageX || e.pageY) {
				// 	pageX = e.pageX;
				// 	pageY = e.pageY;
				// } else if (e.clientX || e.clientY) {
				// 	pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				// 	pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				// }
			}

			//	鼠标弹起处理
			//document.onkeyup = document.onmouseup = function(e) {

			function mouseup(e) {

				//如果鼠标右键不处理，避免和右键编辑状态导致无法结束问题
				if (e.which && e.which == 1) {
					// old netsapce implementation
					clearInterval(moving);
					moving = 0;
				} else if (e.button && e.button == 0) {
					// for microsoft or W3C model implementation
					clearInterval(moving);
					moving = 0;
				}
			}

			//	在控制元素中按下
			function on_mousedown(e, ctrl, type) {

				var e = e || window.event;
				//e.preventDefault();

				//计算出鼠标页面位置 和 当前元素位置的差 = 鼠标相对元素的位置
				// var mTop = parseFloat($element[0].style.marginTop) / 100;
				// var mLeft = parseFloat($element[0].style.marginLeft) / 100;

				// var elementContainerTop = mTop * windowWidth;
				// var elementContainerLeft = mLeft * windowWidth;

				// elTop = elementContainerTop + barHeight + barHeight; // why twice? i don't know
				// elLeft = elementContainerLeft + menuWidth;

				offsetX = $element.offset().left;
				offsetY = $element.offset().top;

				m_ctrl = ctrl;
				m_type = type;

				//angular.element(document.querySelectorAll(".resizer")).css("z-index", "0");
				//ctrl.style.zIndex = "10000";


				//console.log(e.pageY + ' ' + offsetY + ' ' + $element.offset());

				//	开始处理移动事件
				if (moving) {
					clearInterval(moving);
					moving = 0;
				} else
					moving = setInterval(on_move, 10);
			}
            function on_mouseup(){
                diagramService.updateParts($scope.diagram, $element);
            }

			function on_move() {
				if (moving) {

					var y = pageY - offsetY + 5;
					var x = pageX - offsetX + 5;

					//console.log(x + ' ' + pageX + ' ' + y + ' ' + pageY);

					switch (m_type) {
						case 'r':
							//var containerX = pageX - x + 5;
							//var mX = parseFloat(containerX / windowWidth) * 100 + "%";
							//$element[0].style.width = mX;
							//m_ctrl.style.left = x + "px";
							$element[0].style.width = x + "px";
							break;
						case 'b':
							//var containerY = pageY - y + 5;
							//var mY = parseFloat(containerY / getHeight()) * 100 + "%";
							//console.log(containerY + ' ' + mY + ' ' + getHeight() + ' ' + elTop + ' ' + pageY);
							//$element[0].style.height = mY;
							$element[0].style.height = y + "px";
							break;
					}

				}
			}

			$scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
				if (!newValue) {
					clearInterval(moving);
					moving = 0;
					$(r).hide();
					$(b).hide();
				} else {
					$(r).show();
					$(b).show();
				}
			});

			//清除document上的绑定
			$scope.$on('$destroy', function() {
				//console.log("destroy");

				$(document).off("mousemove", mousemove);
				$(document).off("mouseup", mouseup);

				diagramService.updateParts($scope.diagram, $element);
			});
		}
	};

}]);

nurseDirective.directive("dragger", ['$document','diagramService',
	function($document, diagramService) {
		return {
			restrict: "A",
			link: function($scope, $element, $attr) {

				// var elementTop;
				// var elementLeft;

				var offsetX = 0,
					offsetY = 0;

				// var menuWidth = 200;
				// var barHeight = 54;
				// var windowWidth = $(document.body).width();
				// var containerWidth = $(document.body).width() - menuWidth;
				// var windowHeight = $(document.body).height();

				var newElement = $element.find(".panel-heading");
				newElement.css("cursor", "move");

				newElement.on("mousedown", function($event) {
					if(sessionStorage.getItem("isLock") == "true") return;

					$event.preventDefault();

					// To keep the last selected box in front

					//angular.element(document.querySelectorAll(".contentEditorBox")).css("z-index", "0");
					//$element.css("z-index", "10000");

					// var mTop = parseFloat($element[0].style.marginTop) / 100;
					// var mLeft = parseFloat($element[0].style.marginLeft) / 100;

					// var elementContainerTop = mTop * windowWidth;
					// var elementContainerLeft = mLeft * windowWidth;

					// var elTop = elementContainerTop + barHeight + barHeight; // why twice? i don't know
					// var elLeft = elementContainerLeft + menuWidth;

					//console.log(mTop + ' ' + elementContainerTop + ' ' + elTop + ' ' + $event.pageY);
					//console.log(mLeft + ' ' + elementContainerLeft + ' ' + elLeft + ' ' + $event.pageX);

					offsetX = $event.pageX - $element.offset().left;
					offsetY = $event.pageY - $element.offset().top;

					//console.log($event.pageY + " " + offsetY);
					//console.log($event.pageX + " " + offsetX);

					$document.on("mousemove", mousemove);
					$document.on("mouseup", mouseup);
				});

				function mousemove($event) {
					var y = $event.pageY - offsetY;
					var x = $event.pageX - offsetX;


					// var containerY = y - barHeight * 2;
					// var mY = parseFloat(containerY / windowWidth) * 100 + "%";

					// var containerX = x - menuWidth;
					// var mX = parseFloat(containerX / windowWidth) * 100 + "%";

					// $element.css({
					// 	"margin-top": mY,
					// 	"margin-left": mX
					// });

					$element.css({
						left: x + "px",
						top: y + "px"
					});


				}

				function mouseup() {
					$document.off("mousemove", mousemove);
					$document.off("mouseup", mouseup);

					diagramService.updateParts($scope.diagram, $element);
				}
			}
		};
	}
]);


nurseDirective.directive("imagepart", ['diagramService',
	function(diagramService) {
		return {
			restrict: "AE",
			replace: true,
			templateUrl: "partials/imagepart.html",
			link: function(scope, elem, attrs, modelCtrl) {

				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				scope.partid = attrs.partid;
				var el = elem.find('.panel-body');

				el.css({
					"background-image": "url('" + cfg.options + "')"
				});


				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {

					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);



nurseDirective.directive('imagepartsetter', ['$modal','uploadService','balert','ImageManageService',
	function($modal,uploadService,balert,ImageManageService) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
				var showImgFileDlg = undefined;

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});
					return found;
				}

                function initFunction(){
                    scope.imgFilePath = undefined;
                    scope.showImgFile = function(){
                        scope.imgFiles = {
                            catalog : "img/diagram",
                            imageFile : undefined
                        };
                        showImgFileDlg = $modal({
                            scope: scope,
                            templateUrl: 'partials/showImgFile.html',
                            show: false
                        });
                        showImgFileDlg.$promise.then(showImgFileDlg.show);

                        scope.changeCatalog(scope.imgFiles.catalog);
                    };

                    scope.changeCatalog = function(catalog){
                        ImageManageService.LoadImagesByPath(catalog).then(function(data){
                            scope.ImageFiles = data;
                        });
                    };

                    scope.clickImage = function(imageFile,$event){
                        scope.imgFiles.imageFile = imageFile;
                        $($event.currentTarget).parent().find('div').removeClass("select-image");
                        $($event.currentTarget).addClass("select-image");
                    };

                    scope.selectImageFile = function(){
                        if(scope.imgFiles == undefined || scope.imgFiles.imageFile == undefined){
                        	//'请选择图片。'
                            balert.show('danger', scope.languageJson.Configuration.LocalImage.SelectError,3000);
                            return;
                        }
                        scope.imgFilePath = scope.imgFiles.imageFile;
                        showImgFileDlg.hide();
                    };
                }

				element.bind('click', function() {
                    initFunction();
					var partid= element.parent().parent().attr("partid");
					scope.partid=partid;
					var cofg = getPartConfig(scope.diagram,  scope.partid);
					scope.imagepart=cofg.options;
                    scope.file = undefined;

					scope.upload = function() {
						var file = scope.file;
						if (file === undefined) return;
						if(file.size>512000) {
							//'修改的图片不能大于500K,请压缩尺寸后再修改。'
							balert.show('danger', scope.languageJson.Configuration.ImageControl.SizeError,3000);
							return;

						}
						scope.loading = true;
						uploadService.uploadFile(scope.
							file).then(function(data) {
							//uploadService.deleteUploadFile($scope.diagram.page.bgImage);
							cofg.options = scope.imagepart = data;
							//'修改成功。'
							balert.show('success', scope.languageJson.Configuration.ImageControl.Succeed,2000);
							scope.resetParts();
                            setDlg.hide();
							scope.loading = false;
						});

					};

                    scope.uploadImgFile = function(){
                        if(scope.imgFilePath == undefined) return;
                        cofg.options = scope.imagepart = scope.imgFilePath;
                        //'修改成功。'
                        balert.show('success', scope.languageJson.Configuration.ImageControl.Succeed,2000);
                        scope.resetParts();
                        setDlg.hide();
                    };

					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/imagepartsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);
				});


			}
		}
	}
]);








nurseDirective.directive("linkbuttonpart", ['diagramService','global','$modal','$state','$stateParams',
	function(diagramService,global,$modal,$state,$stateParams) {
		return {
			restrict: "AE",
			replace: true,
			scope:true,
			templateUrl: "partials/linkbuttonpart.html",
			link: function(scope, elem, attrs, modelCtrl) {
				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;

				scope.partid = attrs.partid;
				scope.url=global.getpara('Url',cfg.options);
				scope.target=global.getpara('Target',cfg.options);
                var parentId = global.getpara('ParentId',cfg.options);
                var partId = global.getpara('PartId',cfg.options);
				var devBaseType = global.getpara('DevBaseType',cfg.options);

				//scope.showReturnButton = undefined;
				if(scope.target == "_configure") {
					elem.find(".linkbutton").hide();//隐藏a标签

					scope.showModalBox = function () {
					    var dia = $stateParams.diagram;
                        sessionStorage.setItem("LinkPath",dia.deviceId+"|"+dia.parentId+"|"+dia.deviceBaseTypeId);
						setDiagramView(partId,parentId,devBaseType);//'171323003','100000015'
                        $("#return-button").show();//显示返回按钮
					};
				}

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
                }

				if(scope.target == "_procedure") {
					elem.find(".linkbutton").hide();//隐藏a标签
					elem.find(".procedure").css("display","block");//隐藏a标签

					elem.find(".procedure")[0].setAttribute("href","myprotocol://");
				}

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);




nurseDirective.directive('linkbuttonsetter', ['$modal','ConfigureMoldService','global',
	function($modal,ConfigureMoldService,global) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
                var urls,targets,partId,devBaseType;

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});
					return found;
				}

                function initFunction(){
                    var cfg = getPartConfig(scope.diagram,  scope.partid);
                    scope.target = global.getpara('Target',cfg.options);
                    scope.url = global.getpara('Url',cfg.options);
                    scope.parentId = global.getpara('ParentId',cfg.options);
                    scope.partId = global.getpara('PartId',cfg.options);

                    scope.ConfigureParts = [];
                    ConfigureMoldService.GetAllConfigureMold().then(function(data){
                        scope.ConfigureMolds = data;
                        selectConfigure(scope.parentId,data);
                    });

                    scope.changeParent = function(data){
                        scope.partId = undefined;

                        var obj = angular.fromJson(data);
                        if(obj.parts){
                            scope.ConfigureParts = obj.parts;
                            scope.parentId = obj.configId;
                        }else
                            scope.ConfigureParts = [];
                    };

                    function selectConfigure(configId,datas){
                        var obj = [];
                        if(datas){
                            datas.forEach(function(item){
                                if(item.configId == configId)
                                    obj = item;
                            });
                        }
                        if(obj.parts){
                            scope.ConfigureParts = obj.parts;
                        }
                    }


                }
				element.bind('click', function() {
                    initFunction();
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/linkbuttonsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);
                    scope.urlchange = function(data){
                        urls = data;
                    };
                    scope.targetchange = function(data){
                        targets = data;
                    };
                    scope.changePart = function(data){
						var cfg = angular.fromJson(data);
                        partId = cfg.deviceId;
						devBaseType = cfg.baseTypeId;
                    };
					scope.save = function() {
                        if(targets == '_configure' &&
                            (scope.parentId === undefined || scope.part === undefined)){
                            return;
                        }

						var cofg = getPartConfig(scope.diagram,  scope.partid);
                        urls = (urls == undefined)?scope.url:urls;
                        targets = (targets == undefined)?scope.target:targets;
						var options="Url:"+urls+"|Target:"+targets+
                            "|ParentId:"+scope.parentId+createPartStr(scope.target,scope.part);
						cofg.options=options;
                        scope.resetParts();
						setDlg.hide();
					};

					function createPartStr(target,part){
						if(target != "_configure") return;
						var cfg = angular.fromJson(part);
						return "|PartId:"+cfg.deviceId+"|DevBaseType:"+cfg.baseTypeId;
					}

				});


			}
		}
	}
]);





nurseDirective.directive("camerapart", ['diagramService','global','$modal','CameraService',
	function(diagramService,global,$modal,CameraService) {
		return {
			restrict: "AE",
			replace: true,
			scope:true,
			templateUrl: "partials/camerapart.html",
			link: function(scope, elem, attrs, modelCtrl) {
                scope.isHide = true;
				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				scope.partid = attrs.partid;
				var setDlg = null;

				var el = elem.find('.panel-body');
				var img=global.getpara("Img",cfg.options);
				el.css({
					"background-image": "url('" + img + "')"
				});

				var cameraid=global.getpara("cameraid",cfg.options);
				var camera={};
				CameraService.getCamera(cameraid).then(function(data) {
					if(data=="") return;
					camera=eval( "(" + data + ")" );
				});

				var ele=elem.find(".panel-body");
				ele.bind("click",function(){
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/cameradialog.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);
					preview(camera);
				});

				scope.fullscreen=function(){
					iframecamera.window.fullscreen();
				};


				function preview(camera){
					var ip=camera.ip,
						port=camera.port,
						username=camera.username,
						pwd=camera.userpwd,
						channelno=camera.channum;
					scope.src="partials/camerapreview.html?ip="+ip+"&port="+port+"&user="+username+"&pwd="+pwd+"&channo="+channelno;


				}
				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);



nurseDirective.directive("controlpart", ['diagramService','devcontrolService','global','$modal','baseTypeService','balert','userService','base64',
	function(diagramService,devcontrolService,global,$modal,baseTypeService,balert,userService,base64) {
		return {
			restrict: "AE",
			replace: true,
			templateUrl: "partials/controlpart.html",
			link: function(scope, elem, attrs) {

				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				scope.partid = attrs.partid;
				var setDlg = null;
				var controlinfo = {};
				controlinfo.controlid = global.getpara('BS',cfg.binding);
                var dId = global.getpara('DeviceId',cfg.options);
				controlinfo.deviceid = (dId == "" ? scope.diagram.deviceId : dId);
                controlinfo.min = global.getpara("Min",cfg.options);
                controlinfo.max = global.getpara("Max",cfg.options);
				controlinfo.styleType = global.getpara("StyleType",cfg.options);


                controlinfo.types = {};
                controlinfo.types.control = {};

				controlinfo.commdanType = global.getpara('CommdanType',cfg.options);//1遥调 、2遥控
				controlinfo.values = global.getpara('Values',cfg.options);
                //控制样式
                if(controlinfo.styleType == 'DataControl') {//遥调
                    elem.find(".remote-control").hide();
                    elem.find(".remote-regulating").show();

					diagramService.GetControlValueByBaseType(controlinfo.deviceid,controlinfo.controlid).then(function(data){
						if(controlinfo.commdanType == 1){
							elem.find(".control-name").text(data.name);
							elem.find(".control-value").val(data.value);
							elem.find(".control-meaning").hide();
						}else{
							elem.find(".control-name").text(data.name);
							var obj = getMeaningByValue(controlinfo.values,data.value);
							elem.find(".control-value").hide();
							elem.find(".control-value").val(obj.value);
							elem.find(".control-meaning").val(obj.name);
						}
					});
                }else{//遥控  | 控制联动
                    elem.find(".remote-control").show();
                    elem.find(".remote-regulating").hide();
                    var img=global.getpara('Img',cfg.options);
                    var el = elem.find('.panel-body');
                    if(img == ""){
                        el.css({"background":"#fff","opacity":"0.1"});
                    }else{
                        el.css({"background-image": "url('" +img + "')"});
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

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });

                    return found;
                }

                scope.keyDownControl = function(event){
                    if(event.which === 13){
                        scope.sendcontrol();
                    }
                };

				scope.validateauthority=function(dom){
                    var partid = dom.target.parentNode.getAttribute("partid");
                    var config = getPartConfig(scope.diagram,partid);
                    scope.controlinfo = {};
                    scope.controlinfo.commdanType = global.getpara('CommdanType',config.options);
                    scope.controlinfo.pwdType = global.getpara('PwdType',config.options);
                    if(scope.controlinfo.pwdType != "NoPassword")
						scope.controlinfo.isPwd = true;
                    scope.controlinfo.Pwd = global.getpara('Pwd',config.options);
                    scope.controlinfo.controlid = global.getpara('BS',config.binding);
                    scope.controlinfo.ctlValue = global.getpara("Ctlvalue",config.options);


                    if(scope.controlinfo.commdanType == 3)
                        scope.controlinfo.linkage = angular.fromJson(global.getpara("Linkage",config.options));

                    if(global.getpara("DeviceId",config.options) != undefined && global.getpara("DeviceId",config.options) != "")
                        scope.controlinfo.deviceid = global.getpara("DeviceId",config.options);

                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/controlauthorizesetter.html',
                        show: false
                    });
                    if(scope.controlinfo.commdanType == 1){//遥调
                        scope.controlinfo.isShow = false;
                        setDlg.$promise.then(setDlg.show);

                        scope.controlinfo.optionType  = undefined;
                        scope.controlinfo.min = global.getpara("Min",config.options);
                        scope.controlinfo.max = global.getpara("Max",config.options);

                        scope.controlinfo.optionValue = scope.controlinfo.min;
                        scope.controlinfo.optionType = scope.controlinfo.min;
                    }else{
                        if(scope.controlinfo.pwdType != "NoPassword"){
                            scope.controlinfo.isShow = true;
                            setDlg.$promise.then(setDlg.show);
                        }else{
                        	var alert = scope.languageJson.Configuration.RemoteControl.Alert;
                            var userName = localStorage.getItem("username");
                            var paras = scope.controlinfo;
                            paras.optionType = scope.controlinfo.ctlValue;
                            if(scope.controlinfo.commdanType == 2) {
                                devcontrolService.senddevcontrol(paras.deviceid, paras.controlid, paras.optionType, userName).then(function (data) {
                                    if (data == "success")
                                        balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
                                    else
                                        balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
                                });
                            }else {
                                devcontrolService.sendControlLinkage(scope.controlinfo.linkage, userName).then(function (data) {
                                    if(data == "success")
                                        balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
                                    else
                                        balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
                                });
                            }
                        }
                    }
				};
                scope.changeTest = function(value){
                    scope.controlinfo.optionValue = value;
                };
                scope.changeValue = function(value){
                    scope.controlinfo.optionType = value;
                };

				scope.sendcontrol = function(){
					var alert = scope.languageJson.Configuration.RemoteControl.Alert;
                    if(scope.controlinfo.pwdType == "SharePassword"){
                    	if(scope.controlinfo.userpwd != undefined && base64.encode(scope.controlinfo.userpwd) == scope.controlinfo.Pwd)
							sendDeviceControl(alert);
                    	else
                        	balert.show('danger', alert.PasswordError,3000);//'密码不正确，请重新输入！'
                    }

					if(scope.controlinfo.pwdType == "LoginPassword"){
						userService.changePassword(localStorage.getItem("username"),scope.controlinfo.userpwd).then(function(data){
							if(data == "OK")
								sendDeviceControl(alert);
							else
							    balert.show('danger', alert.PasswordError,3000);//'密码不正确，请重新输入！'
						});
					}
				};

				function sendDeviceControl(alert){
					var paras = scope.controlinfo;
					var userName = localStorage.getItem("username");
					if(scope.controlinfo.commdanType == 1){
						devcontrolService.senddevcontrol(paras.deviceid,paras.controlid,paras.optionType,userName).then(function(data){
							if(data == "success")
								balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
							else
								balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
						});
					}else if(scope.controlinfo.commdanType == 2){
						paras.optionType = scope.controlinfo.ctlValue;
						devcontrolService.senddevcontrol(paras.deviceid,paras.controlid,paras.optionType,userName).then(function(data){
							if(data == "success")
								balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
							else
								balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
						});
					}else{
						devcontrolService.sendControlLinkage(scope.controlinfo.linkage,userName).then(function(data){
							if(data == "success")
								balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
							else
								balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
						});
					}
					scope.controlinfo.userpwd = "";
					setDlg.hide();
				}

				scope.PlusValue = function(dom){
				    var elem = $(dom.target).parent().parent().parent().parent().parent().parent().parent("[class=panel-primary]").prevObject;
                    var partid = elem.attr("partid");
                    if(partid == undefined){
                        elem = elem.parent();
                        partid = elem.attr("partid");
                    }
					var config = getPartConfig(scope.diagram,partid);
					if(config == undefined) return;
					var commdanType = global.getpara('CommdanType',config.options);//1遥调 、2遥控
					if(commdanType == 1){
						var val = elem.find(".control-value").val();
						controlinfo.max = global.getpara("Max",config.options);
						if(parseFloat(val)  >= parseFloat(controlinfo.max)) return;
						if((val+"").indexOf(".5") == -1){
							val = Math.round(parseFloat(val)) + 0.5;
						}else {
							val = parseFloat(val) +0.5;
						}
						elem.find(".control-value").val(val);
                        elem.find(".control-value").css("color","#5eb75e");
					}else{
						var values = global.getpara('Values',config.options);
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

                scope.MinusValue = function(dom){
                    var elem = $(dom.target).parent().parent().parent().parent().parent().parent().parent("[class=panel-primary]").prevObject;
                    var partid = elem.attr("partid");
                    if(partid == undefined){
                        elem = elem.parent();
                        partid = elem.attr("partid");
                    }
					var config = getPartConfig(scope.diagram,partid);
					if(config == undefined) return;
					var commdanType = global.getpara('CommdanType',config.options);//1遥调 、2遥控
					if(commdanType == 1){
						var val = elem.find(".control-value").val();
						controlinfo.min = global.getpara("Min",config.options);
						if(parseFloat(val) <= parseFloat(controlinfo.min)) return;
						val = parseFloat(val) - 0.5;
						elem.find(".control-value").val(val);
                        elem.find(".control-value").css("color","#5eb75e");
					}else{
						var values = global.getpara('Values',config.options);
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
					}
					return arr;
				}

                scope.TransparentControl = function(dom){
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/controlauthorizesetter.html',
						show: false
					});

                    var elem = $(dom.target).parent().parent().parent().parent().parent().parent().parent("[class=panel-primary]").prevObject;
                    var partid = elem.attr("partid");
                    if(partid == undefined){
                        elem = elem.parent();
                        partid = elem.attr("partid");
                    }
                    var config = getPartConfig(scope.diagram,partid);
                    var deviceId = global.getpara('DeviceId',config.options);
                    if(deviceId == "")
                        deviceId = scope.diagram.deviceId;
                    var controlid = global.getpara('BS',config.binding);

                    var userName = localStorage.getItem("username");
                    var val = elem.find(".control-value").val();

					var pwdType = global.getpara('PwdType',config.options);
					if(pwdType != "NoPassword"){
						scope.controlinfo = {
							isPwd : true,
							isShow : true,
                            pwdType : pwdType,
							Pwd : global.getpara('Pwd',config.options),
							deviceid : deviceId,
							controlid : controlid,
							optionType : val,
							commdanType : 1
						};
						setDlg.$promise.then(setDlg.show);
					}else{
						var alert = scope.languageJson.Configuration.RemoteControl.Alert;
						devcontrolService.senddevcontrol(deviceId, controlid, val, userName).then(function (data) {
							if (data == "success")
								balert.show('success', alert.Succeed, 3000);//"下发命令成功！"
							else
								balert.show('danger', alert.Failed, 3000);//"下发命令失败！"
						});
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

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {

					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);


nurseDirective.directive("newcontrolsetter",['$modal','baseTypeService','uploadService','balert','ConfigureMoldService','ImageManageService','base64','userService',
    function($modal,baseTypeService,uploadService,balert,ConfigureMoldService,ImageManageService,base64,userService){
        return {
            restrict:'A',
            link:function(scope,element){
                var setDlg = null;
                scope.controls = {};

                function getControlById(Controls, id) {
                    var found = _.find(Controls, function(part) {
                        return part.BaseTypeId === id;
                    });
                    return found;
                }

                function getPartNum(typename){
                    var  num=1;
                    var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++) {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum >= num) num=partnum+1;
                    }
                    return num;
                }

                function intFunction(){
					scope.initList = function(){
						scope.controls.lists = [];
						scope.controls.optionsControl = undefined;
						if(scope.diagram == undefined || scope.controls.deviceId == undefined) return;
						if(scope.controls.optionType != 3){
							if(scope.controls.optionType == undefined) return;
							baseTypeService.getAllControlBaseDevice(scope.controls.deviceId,scope.controls.optionType).then(function(data){
								if(data.length==0)
									scope.controls.lists = [{BaseTypeId:undefined,ControlName:scope.languageJson.Configuration.RemoteControl.NotData}];//'没有数据'
								else
									scope.controls.lists = data;
							});
						}else{
			  				scope.controls.styleType = 'ImageButton';
							scope.controls.control = undefined;
							scope.controls.controlValue = undefined;
							baseTypeService.getAllControlBaseDevice(scope.controls.deviceId,-1).then(function(data){
								scope.controls.Controls = data;
							});
						}
					};
					/******************* 过滤设备列表 & 加载信号列表 **************************/
					scope.initDevice = function(){
						var parentId = scope.diagram.parentId;
						if(scope.diagram.deviceBaseTypeId == "1004" ||
							(parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
							parentId = "";
						ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
							scope.decices = data;

                            scope.controls.deviceId = scope.diagram.deviceId;
                            if(scope.controls.deviceId == undefined)
                                scope.controls.deviceId = scope.decices[0].equipmentId;

                            scope.initList();
                        });

                        scope.checkedControl = function($event,data){
                            eval("scope."+data+" = "+$event.target.checked);
                        };
                        scope.getCheckbox = function(visible){
                            if(visible == true || visible == 'true')
                                return "√";
                            else
                                return "X";
                        };
                    };
                    /*********************************************************************/
				}
                element.bind("click",function(){
                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/newcontrolsetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);

					intFunction();
					scope.initDevice();
					scope.initList();
					initLocalImageFunction();
					initControlLinkage();

                    scope.controls = {
                        optionType : 1,
                        isControlCheck : true,
                        pwdType : 'NoPassword',
                        controlPwd : '',
                        controlType : 0,
                        delay : 0,
						styleType : 'ImageButton'
                    };
                    scope.file = undefined;

                    scope.controlClk = function(deviceId,baseTypeId){
                        if(deviceId == "")
                            deviceId = scope.diagram.deviceId;

                        scope.controls.values = [];
                        if(scope.controls.optionType == 2){
                            baseTypeService.getControlTypeBaseTypeId(deviceId+"|"+baseTypeId).then(function(data){
                                scope.controls.values = data;
                            });
                        }
                    };

                    scope.save = function(){
                        var alert = scope.languageJson.Configuration.RemoteControl.Alert;
                        if(scope.controls.optionType != 3 && (scope.controls.optionsControl == undefined || scope.controls.optionsControl == 0)){
                            balert.show('danger', alert.SelectControl,3000);//'请选择控制！'
                            return;
                        }
                        if(scope.controls.styleType == 'ImageButton'){
							if(scope.controls.optionType == 2 && (scope.controls.controlValue == undefined || scope.controls.controlValue == "")){
								balert.show('danger', alert.NotMeaning,3000);//'控制含义不能为空！'
								return;
						  	}
						}
                        if(scope.controls.optionType == 3 && (scope.controls.controlActions == undefined || scope.controls.controlActions.length == 0)){
							balert.show('danger', alert.SelectControl,3000);//'请选择控制！'
							return;
						}
						//加密
						scope.controls.controlPwd = base64.encode(scope.controls.controlPwd);

                        var cofg = {};
                        var count = getPartNum("control");
                        cofg.id = "control"+count;
                        cofg.type = "controlpart";
                        cofg.left="5";
                        cofg.top="80";
                        cofg.width = "163";
                        cofg.height = "187";
                        cofg.zindex = 2;
                        cofg.binding = "BS:"+scope.controls.optionsControl;
                        var str = "";
                        var obj = getControlById(scope.controls.lists,scope.controls.optionsControl);
						if(scope.controls.optionType == 1){//遥调
							str = "|CommdanType:1|Min:"+obj.MinValue+"|Max:"+obj.MaxValue+"|DeviceId:"+scope.controls.deviceId+
								"|PwdType:"+scope.controls.pwdType+"|Pwd:"+scope.controls.controlPwd+"|StyleType:"+scope.controls.styleType;
						}else if(scope.controls.optionType == 2){//遥控
							str = "|CommdanType:2|Ctlvalue:"+scope.controls.controlValue+"|DeviceId:"+scope.controls.deviceId+
								"|PwdType:"+scope.controls.pwdType+"|Pwd:"+scope.controls.controlPwd+"|StyleType:"+scope.controls.styleType+valueMeaning(scope.controls.styleType,scope.controls.values);
						}else{//控制联动
							str = "|CommdanType:3|"+scope.parseLinkageText()+"|PwdType:"+scope.controls.pwdType+"|Pwd:"+scope.controls.controlPwd;
						}
                        var file = scope.file;
                        if (file === undefined){
                            if(scope.imgFilePath == undefined)
                                cofg.options = "Img:"+str;
                            else
                                cofg.options = "Img:"+scope.imgFilePath+str;
                            scope.diagram.parts.push(cofg);
                            setDlg.hide();
                            scope.resetParts();
                        }else if(file.size>512000) {
                            balert.show('danger', alert.ImageSize,3000);//'修改的图片不能大于500K,请压缩尺寸。'
                        }else{
                            uploadService.uploadFile(scope.file).then(function(data) {
                                cofg.options = "Img:"+data+str;
                                scope.diagram.parts.push(cofg);
                                setDlg.hide();
                                scope.resetParts();
                            });
                        }
                    };

					function valueMeaning(styleType,values){
						var res = "";
						if(styleType == 'DataControl' && values){
							res = "|Values:";
							values.forEach(function(val){
								res += val.ParameterValue+"."+val.Meanings+";"
							});
						}
						return res;
					}

                    baseTypeService.getControlList().then(function(data) {
                        scope.ItemControls = data;
                        scope.controls.optionType =data[0].ItemId;
                    });
                });

                //本地图片
                function initLocalImageFunction(){
                    var showImgFileDlg = null;
                    scope.imgFilePath = undefined;
                    scope.showImgFile = function(varName){
                        scope.varName = varName;
                        scope.imgFiles = {
                            catalog : "img/diagram",
                            imageFile : undefined
                        };
                        showImgFileDlg = $modal({
                            scope: scope,
                            templateUrl: 'partials/showImgFile.html',
                            show: false
                        });
                        showImgFileDlg.$promise.then(showImgFileDlg.show);

                        scope.changeCatalog(scope.imgFiles.catalog);
                    };

                    scope.changeCatalog = function(catalog){
                        ImageManageService.LoadImagesByPath(catalog).then(function(data){
                            scope.ImageFiles = data;
                        });
                    };

                    scope.clickImage = function(imageFile,$event){
                        scope.imgFiles.imageFile = imageFile;
                        $($event.currentTarget).parent().find('div').removeClass("select-image");
                        $($event.currentTarget).addClass("select-image");
                    };

                    scope.selectImageFile = function(){
                        if(scope.imgFiles == undefined || scope.imgFiles.imageFile == undefined){
                            //'请选择图片。'
                            balert.show('danger', scope.languageJson.Configuration.RemoteControl.Alert.SelectImage,3000);
                            return;
                        }
                        //eval("scope."+scope.varName+" = scope.imgFiles.imageFile");
                        scope.imgFilePath = scope.imgFiles.imageFile;
                        showImgFileDlg.hide();
                    };
                }

                //控制联动
                function initControlLinkage(){
                    scope.changeControl = function(control){
                        scope.controls.controlValue = undefined;
                        var con = angular.fromJson(control);
                        scope.controls.CommandType = con.CommandType;
                        if(con.CommandType == 2){//开关控制
                            baseTypeService.getControlTypeBaseTypeId(scope.controls.deviceId+"|"+con.BaseTypeId).then(function(data){
                                scope.controls.Meanings = data;
                            });
                        }else{//数值控制
                            scope.MaxValue = con.MaxValue;
                            scope.MinValue = con.MinValue;
                        }
                    };

                    scope.changeControlValue = function(type, value){
                        var obj = {};
                        var alert = scope.languageJson.Configuration.RemoteControl.Alert;
                        if(scope.controls.controlActions == undefined)
                            scope.controls.controlActions = [];

                        if(type == 1){
                            if(scope.controls.Meanings){
                                scope.controls.Meanings.forEach(function(item){
                                    if(item.ParameterValue == value){
                                        obj.actionMeanings = item.Meanings;
                                    }
                                });
                            }
                        }else{
                            if(value == undefined || value == ""){
                                balert.show('danger',alert.NotValue,3000);//"控制值不能为空！"
                                return;
                            }
                            if((scope.MinValue == scope.MaxValue) ||
                                (parseFloat(scope.MinValue) <= parseFloat(value) && parseFloat(scope.MaxValue) >= parseFloat(value))){
                                obj.actionMeanings = value;
                            }else{
                                balert.show('danger', alert.InvalidValue,3000);//'控制值不合法，请重新输入！'
                                return;
                            }
                        }
                        obj.controlValue = value;

                        obj.delay = scope.controls.delay;
                        if(scope.decices && scope.controls.deviceId){
                            scope.decices.forEach(function(item){
                                if(item.equipmentId == scope.controls.deviceId) {
                                    obj.equipmentId = item.equipmentId;
                                    obj.equipmentName = item.configName;
                                }
                            });
                        }
                        if(scope.controls.control){
                            var control = angular.fromJson(scope.controls.control);
                            obj.baseTypeId = control.BaseTypeId;
                            obj.controlName = control.ControlName;
                        }
						obj.index = scope.controls.controlActions.length+1;
                        scope.controls.controlActions.push(obj);
                    };

					scope.deleteMeaningsClick = function($index){
						scope.controls.controlActions.splice($index,1);
					};

					scope.parseLinkageText = function(){
						if(scope.controls.controlActions){
							var result = "Linkage:";
							result += angular.toJson(scope.controls.controlActions);
							return result;
						}else return "Linkage:[]";
					}
                }
            }
        }
    }
]);


nurseDirective.directive('basecontrolsetter',['$modal','baseTypeService','global','uploadService','balert','ConfigureMoldService','ImageManageService','base64',
    function($modal,baseTypeService,global,uploadService,balert,ConfigureMoldService,ImageManageService,base64){
        return {
            restrict:'A',
            link:function(scope,element){
                var setDlg = null;
                scope.basecontrol = {};

                function getControlById(Controls, id) {
                    var found = _.find(Controls, function(part) {
                        return part.BaseTypeId === id;
                    });
                    return found;
                }

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }

                element.bind("click",function(){
                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/basecontrolsetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);
					initDevice();
					initControlLinkage();
                    initLocalImageFunction();

                    baseTypeService.getControlList().then(function(data) {
                        scope.ItemControls = data;
                    });

                    scope.controlClk = function(deviceId,baseTypeId){
                        if(deviceId == undefined || deviceId == "")
                            deviceId = scope.diagram.deviceId;

                        scope.basecontrol.values = [];
                        if(scope.basecontrol.optionType == 2){
                            baseTypeService.getControlTypeBaseTypeId(deviceId+"|"+baseTypeId).then(function(data){
                                scope.basecontrol.values = data;
                            });
                        }
                    };

                    var partid= element.parent().parent().attr("partid");
                    scope.partid = partid;
                    var cfg = getPartConfig(scope.diagram, scope.partid);
                    scope.basecontrol.optionsControl = global.getpara("BS",cfg.binding);
                    scope.basecontrol.file = global.getpara("Img",cfg.options);
                    scope.basecontrol.optionType = global.getpara("CommdanType",cfg.options);
                    scope.basecontrol.controlValue = global.getpara("Ctlvalue",cfg.options);
                    scope.basecontrol.deviceId = global.getpara("DeviceId",cfg.options);
                    //scope.basecontrol.isControlCheck = global.getpara('isShow',cfg.options) == "true" ? true : false;
					scope.basecontrol.pwdType = global.getpara("PwdType",cfg.options);

                    scope.basecontrol.controlPwd = global.getpara('Pwd',cfg.options);
					scope.basecontrol.oldControlPwd = scope.basecontrol.controlPwd;

                    var st = global.getpara('StyleType',cfg.options);
				  	        scope.basecontrol.styleType = (st == "") ? 'ImageButton' : st;

                    if(scope.basecontrol.deviceId == undefined || scope.basecontrol.deviceId == "")
                        scope.basecontrol.deviceId = scope.diagram.deviceId;
                    if(scope.basecontrol.optionType == 3)
                        parseActions(global.getpara("Linkage", cfg.options));

                    scope.file = undefined;

                    scope.controlClk(scope.basecontrol.deviceId,scope.basecontrol.optionsControl);

                    /******************* 过滤设备列表 & 加载信号列表 **************************/
                    function initDevice(){
                        var parentId = scope.diagram.parentId;
                        if(scope.diagram.deviceBaseTypeId == "1004" ||
                            (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                            parentId = "";
                        ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                            scope.decices = data;

                            scope.initList();
                        });

                        scope.checkedControl = function($event,data){
                            eval("scope."+data+" = "+$event.target.checked);
                        };
                        scope.getCheckbox = function(visible){
                            if(visible == true || visible == 'true')
                                return "√";
                            else
                                return "X";
                        };
                    }
                    /*********************************************************************/

                    scope.initList = function(){
                        scope.basecontrol.lists = undefined;
                        if(scope.diagram == undefined || scope.basecontrol.deviceId == undefined) return;
                        if(scope.basecontrol.optionType == undefined) return;
                        if(scope.basecontrol.optionType != 3){
                            baseTypeService.getAllControlBaseDevice(scope.basecontrol.deviceId,scope.basecontrol.optionType).then(function(data){
                                if(data.length==0)
                                    scope.basecontrol.lists = [{BaseTypeId:undefined,ControlName:scope.languageJson.Configuration.RemoteControl.NotData}];//'没有数据'
                                else
                                    scope.basecontrol.lists = data;
                            });
                        }else{
							scope.basecontrol.styleType = 'ImageButton';
                            scope.basecontrol.control = undefined;
                            scope.basecontrol.controlValue = undefined;
                            baseTypeService.getAllControlBaseDevice(scope.basecontrol.deviceId,-1).then(function(data){
                                scope.basecontrol.Controls = data;
                            });
                        }
                    };

                    scope.save = function(){
                    	if(scope.basecontrol.oldControlPwd != scope.basecontrol.controlPwd){
							scope.basecontrol.controlPwd = base64.encode(scope.basecontrol.controlPwd);
						}

                        var alert = scope.languageJson.Configuration.RemoteControl.Alert;
              					if(scope.basecontrol.styleType == 'ImageButton'){
              						if(scope.basecontrol.optionType == 2 && (scope.basecontrol.controlValue == undefined || scope.basecontrol.controlValue == "")){
              							balert.show('danger', alert.NotMeaning,3000);//'控制含义不能为空！'
              							return;
              						}
              					}
                        cfg.binding = "BS:"+scope.basecontrol.optionsControl;
                        var str = "";
                        var obj = getControlById(scope.basecontrol.lists,scope.basecontrol.optionsControl);
                        if(scope.basecontrol.optionType == 1){//遥控
                            str = "|CommdanType:1|Min:"+obj.MinValue+"|Max:"+obj.MaxValue+"|DeviceId:"+scope.basecontrol.deviceId+
								"|PwdType:"+scope.basecontrol.pwdType+"|Pwd:"+scope.basecontrol.controlPwd+"|StyleType:"+scope.basecontrol.styleType;
                        }else if(scope.basecontrol.optionType == 2){//开闭
                            str = "|CommdanType:2|Ctlvalue:"+scope.basecontrol.controlValue+"|DeviceId:"+scope.basecontrol.deviceId+
								"|PwdType:"+scope.basecontrol.pwdType+"|Pwd:"+scope.basecontrol.controlPwd+"|StyleType:"+scope.basecontrol.styleType+valueMeaning(scope.basecontrol.styleType,scope.basecontrol.values);
                        }else{//控制联动
                            str = "|CommdanType:3|"+scope.parseLinkageText()+"|PwdType:"+scope.basecontrol.pwdType+"|Pwd:"+scope.basecontrol.controlPwd;
                        }
                        var file = scope.file;
                        if (file === undefined){
                            if(scope.basecontrol.file != "")
                                cfg.options = "Img:"+scope.basecontrol.file+str;
                            else
                                cfg.options = "Img:"+str;
                            setDlg.hide();
                            scope.resetParts();
                        }else if(file.size>512000) {
                            balert.show('danger', alert.ImageSize,3000);//'修改的图片不能大于500K,请压缩尺寸。'
                        }else{
                            uploadService.uploadFile(scope.file).then(function(data) {
                                cfg.options = "Img:"+data+str;
                                setDlg.hide();
                                scope.resetParts();
                            });
                        }
                    };

                    function valueMeaning(styleType,values){
                    	var res = "";
                    	if(styleType == 'DataControl' && values){
                    		res = "|Values:";
                    		values.forEach(function(val){
                    			res += val.ParameterValue+"."+val.Meanings+";"
        							});
        						}
                    	return res;
					}

					/******************* 控制联动 Start **************************/
                    function parseActions (linkage){
                    	linkage = angular.fromJson(linkage);
						scope.basecontrol.controlActions = [];
						linkage.forEach(function(item){
							getControlObject(item);
						});
					}
					function sortObj(array, key) {
						return array.sort(function(a, b) {
							var x = a[key];
							var y = b[key];
							return x - y;
						});
					}
					function getControlObject(data,deviceName) {
                    	var obj = {
                    		index : data.index,
                    		delay : data.delay,
							equipmentId : data.equipmentId,
							baseTypeId : data.baseTypeId,
							controlValue : data.controlValue
						};
						var parentId = scope.diagram.parentId;
						if(scope.diagram.deviceBaseTypeId == "1004" ||
							(parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
							parentId = "";

						ConfigureMoldService.GetPartEquipments(parentId).then(function(decices){
							if(decices){
								decices.forEach(function(dec){
									if(dec.equipmentId == data.equipmentId) {
										obj.equipmentName = dec.configName;
										baseTypeService.getAllControlBaseDevice(data.equipmentId,-1).then(function(control){
											if(control){
												control.forEach(function(con){
													if(con.BaseTypeId == data.baseTypeId){
														obj.controlName = con.ControlName;
														baseTypeService.getControlTypeBaseTypeId(data.equipmentId+"|"+con.BaseTypeId).then(function(Meanings){
															var meanigs = "";
															if(Meanings){
																Meanings.forEach(function(mean){
																	if(mean.ParameterValue == data.controlValue){
																		meanigs = mean.Meanings;
																	}
																});
															}
															if(meanigs == "")
																obj.actionMeanings = data.controlValue;
															else
																obj.actionMeanings = meanigs;

															if(!isExist(scope.basecontrol.controlActions,obj))
																scope.basecontrol.controlActions.push(obj);
															scope.basecontrol.controlActions = sortObj(scope.basecontrol.controlActions,'index');
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}

					function isExist(arr,obj){
						if(arr){
							var is = false;
							arr.forEach(function(data){
								if(data.index == obj.index) is = true;
							});
							return is;
						}return false;
					}

                    //本地图片
                    function initLocalImageFunction(){
                        var showImgFileDlg = null;
                        scope.showImgFile = function(varName){
                            scope.varName = varName;
                            scope.imgFiles = {
                                catalog : "img/diagram",
                                imageFile : undefined
                            };
                            showImgFileDlg = $modal({
                                scope: scope,
                                templateUrl: 'partials/showImgFile.html',
                                show: false
                            });
                            showImgFileDlg.$promise.then(showImgFileDlg.show);

                            scope.changeCatalog(scope.imgFiles.catalog);
                        };

                        scope.changeCatalog = function(catalog){
                            ImageManageService.LoadImagesByPath(catalog).then(function(data){
                                scope.ImageFiles = data;
                            });
                        };

                        scope.clickImage = function(imageFile,$event){
                            scope.imgFiles.imageFile = imageFile;
                            $($event.currentTarget).parent().find('div').removeClass("select-image");
                            $($event.currentTarget).addClass("select-image");
                        };

                        scope.selectImageFile = function(){
                            if(scope.imgFiles == undefined || scope.imgFiles.imageFile == undefined){
                            	//'请选择图片。'
                                balert.show('danger', scope.languageJson.Configuration.RemoteControl.Alert.SelectImage,3000);
                                return;
                            }
                            //eval("scope."+scope.varName+" = scope.imgFiles.imageFile");
                            scope.basecontrol.file = scope.imgFiles.imageFile;
                            showImgFileDlg.hide();
                        };
                    }
					//控制联动
					function initControlLinkage(){
                        scope.basecontrol.delay = 0;
						scope.changeControl = function(control){
							scope.basecontrol.controlValue = undefined;
							var con = angular.fromJson(control);
							scope.basecontrol.CommandType = con.CommandType;
							if(con.CommandType == 2){//开关控制
								baseTypeService.getControlTypeBaseTypeId(scope.basecontrol.deviceId+"|"+con.BaseTypeId).then(function(data){
									scope.basecontrol.Meanings = data;
								});
							}else{//数值控制
								scope.MaxValue = con.MaxValue;
								scope.MinValue = con.MinValue;
							}
						};

						scope.changeControlValue = function(type, value){
							var obj = {};
							var alert = scope.languageJson.Configuration.RemoteControl.Alert;
							if(scope.basecontrol.controlActions == undefined)
								scope.basecontrol.controlActions = [];

							if(type == 1){
								if(scope.basecontrol.Meanings){
									scope.basecontrol.Meanings.forEach(function(item){
										if(item.ParameterValue == value){
											obj.actionMeanings = item.Meanings;
										}
									});
								}
							}else{
								if(value == undefined || value == ""){
									balert.show('danger',alert.NotValue,3000);//"控制值不能为空！"
									return;
								}
								if((scope.MinValue == scope.MaxValue) ||
									(parseFloat(scope.MinValue) <= parseFloat(value) && parseFloat(scope.MaxValue) >= parseFloat(value))){
									obj.actionMeanings = value;
								}else{
									balert.show('danger', alert.InvalidValue,3000);//'控制值不合法，请重新输入！'
									return;
								}
							}
							obj.controlValue = value;

							obj.delay = scope.basecontrol.delay;

							if(scope.decices && scope.basecontrol.deviceId){
								scope.decices.forEach(function(item){
									if(item.equipmentId == scope.basecontrol.deviceId) {
										obj.equipmentId = item.equipmentId;
										obj.equipmentName = item.configName;
									}
								});
							}
							if(scope.basecontrol.control){
								var control = angular.fromJson(scope.basecontrol.control);
								obj.baseTypeId = control.BaseTypeId;
								obj.controlName = control.ControlName;
							}
                            obj.index = scope.basecontrol.controlActions.length+1;
							scope.basecontrol.controlActions.push(obj);
						};

						scope.deleteMeaningsClick = function($index){
							scope.basecontrol.controlActions.splice($index,1);
						};

                        scope.parseLinkageText = function(){
                            if(scope.basecontrol.controlActions){
                                var result = "Linkage:";
                                result += angular.toJson(scope.basecontrol.controlActions);
                                return result;
                            }else return "Linkage:[]";
                        };
					}
					/******************* 控制联动 End **************************/
                });
            }
        }
    }
]);


nurseDirective.directive('newimagesignalsetter', ['$modal','baseTypeService','balert',
	function($modal,baseTypeService,balert) {
        var setDlg;
		return {
			restrict: 'A',
			link: function(scope, element) {
				scope.setDlg = null;
				scope.environmentradio ={};

				function getPartNum(typename){
					var  num=1;
					var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
					for(var i=0;i<cparts.length;i++) {
						if(cparts[i].id.indexOf(typename)==-1)continue;
						var partnum=parseInt(cparts[i].id.replace(typename,''));
						if(partnum >= num) num=partnum+1;
					}
					return num;
				}

				function getNewPart(type) {
					var num=getPartNum(type);
					var part={};
					part.id=type+num;
					switch (type) {
						case 'infrared':
							part.type="infrared";
							part.img="img/diagram/InfraredDetector_Alarm.png";
							part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Infrared+num+"#";//"红外"
							break;
						case 'smoke':
							part.type="smoke";
							part.img="img/diagram/Fog_inductor.png";
							part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Smoke+num+"#";//"烟感"
							break;
						case 'watermonitor':
							part.type="watermonitor";
							part.img="img/diagram/WaterMonitor.png";
							part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.LiquidLeak+num+"#";//"水浸"
							break;
						case 'temperature':
							part.type="temperature";
							part.img="img/diagram/temperature.png";
							part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Temperature+num+"#";//"温度"
							break;
						case 'humidity':
							part.type="humidity";
							part.img="img/diagram/Thermometer_Blue.png";
							part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Humidity+num+"#";//"湿度"
							break;
						case 'door':
							part.type="door";
							part.img="img/diagram/DoorAlarm.png";
							part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Door+num+"#";//"门碰"
							break;
                        case 'lamp':
                            part.type = "lamp";
                            part.img = "img/diagram/lamp.png";
                            part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Lamp+num+"#";//"灯"
                            break;
                        case 'audible':
                            part.type = "audible";
                            part.img = "img/diagram/audible.png";
                            part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Audible+num+"#";//"声光"
                            break;
                        case 'switch':
                            part.type = "switch";
                            part.img = "img/diagram/switch.png";
                            part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Switch+num+"#";//"其它开关量"
                            break;
                        case 'estimate':
                            part.type = "estimate";
                            part.img = "img/diagram/estimate.png";
                            part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Numerical+num+"#";//"其它模拟量"
                            break;
					}
					//默认背景图
					var style = localStorage.getItem("systemStyle");
					if(style == "Blue")
						part.background = "configure_bg";
					else if(style == "White")
						part.background = "white_bg";
					scope.newpart=part;
				}


                function initFunction(){
                    scope.checkedDoor = function($event,data){
                        eval("scope."+data+" = "+$event.target.checked);
                    };
                    scope.getCheckbox = function(visible){
                        if(visible == true || visible == 'true')
                            return "√";
                        else
                            return "X";
                    };
                }

				//show list
				function initList() {
                    scope.isImageCheck = true;
                    scope.isSignalCheck = true;

					baseTypeService.getSignalBaseTypes().then(function(data) {
						scope.siglist = data;
					});
				}

				element.bind('click', function() {
					initList();
					getNewPart("infrared");
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/newimagesignalsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);
                    initFunction();
				});


				scope.parttypechange = function(type) {
					getNewPart(type);
				};
				scope.savenewenvironment = function() {
                    if(scope.environmentradio.radiosig == undefined){
                    	//'请选择绑定信号。'
                        balert.show('danger', scope.languageJson.Configuration.ImageSignalControl.ErrorPrompt,3000);
                        return;
                    }
                    var bsAndDi = scope.environmentradio.radiosig.split("-");
					var cofg ={};
					cofg.id=scope.newpart.id;
					cofg.type="imagesignalpart";
					cofg.left="5";
					cofg.top="80";
					cofg.width="150";
					cofg.height="140";
					cofg.zindex="1";
					cofg.binding="BS:"+bsAndDi[0]+"|DI:"+bsAndDi[1];
					cofg.options="Name:"+scope.newpart.name+"|Img:"+scope.newpart.img+"|isImage:"+scope.isImageCheck+"|isSignal:"+scope.isSignalCheck+"|Background:"+scope.newpart.background;
					scope.diagram.parts.push(cofg);
					setDlg.hide();
					scope.resetParts();
				};
			}
		}
	}
]);

nurseDirective.directive('newdevicestatussetter',['$modal','baseTypeService','balert','$compile',
    function($modal,baseTypeService,balert,$compile){
        var setDlg;
        return {
            restrict:'A',
            link:function(scope,element){
                var initList = function(){
                    baseTypeService.getDeviceList().then(function(data){
                        scope.deviceList = data;
                    });
                };
                function getPartNum(typename){
                    var  num=1;
                    var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++) {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum >= num) num=partnum+1;
                    }
                    return num;
                }

                function getNewPart(type) {
                    var num = getPartNum(type);
                    scope.Device.id = type + num;
                }

                function initFunction(){
                    scope.showDeviceStatus = function(){
                        if($("#myDeviceStatus").css("display") == "block")
                            $("#myDeviceStatus").hide();
                        else
                            $("#myDeviceStatus").show();
                    };

                    scope.clickFontChart = function(fontChart){
                        scope.Device.fontChart = fontChart;
                        $("#myDeviceStatus").hide();
                    };

                    scope.checkedDeviceBox = function(item){
                        if(scope.Device.List == undefined || scope.Device.List == "")
                            scope.Device.List = [];

                        scope.Device.List = angular.fromJson(scope.Device.List);

                        if(item.isChecked == undefined || item.isChecked == false){
                            scope.Device.List.push(item.EquipmentId);
                            item.isChecked = true;
                        }else{
                            for(var i = 0;i < scope.Device.List.length;i ++){
                                if(scope.Device.List[i] == item.EquipmentId)
                                    scope.Device.List.splice(i,1);
                            }
                            item.isChecked = false;
                        }

                        scope.Device.List = angular.toJson(scope.Device.List);
                    };

                    function pasetDeivce(list){
                        var arr = angular.fromJson(list);
                        var result = "";
                        for(var i = 0;i < arr.length;i++){
                            result += arr[i]+"|";
                        }
                        return result;
                    }

                    scope.saveNewStatus = function(){
                        if(scope.Device.List == undefined || scope.Device.List == "[]" || scope.Device.List == ""){
                        	//'请选择绑定设备。'
                            balert.show('danger', scope.languageJson.Configuration.EquipmentControl.ErrorPrompt,3000);
                            return;
                        }

                        var cofg ={};
                        cofg.id=scope.Device.id;
                        cofg.type="devicestatuspart";
                        cofg.left="5";
                        cofg.top="80";
                        cofg.width="150";
                        cofg.height="140";
                        cofg.zindex = "1";
                        cofg.binding = pasetDeivce(scope.Device.List);
                        cofg.options = "Name:"+scope.Device.Name+"|FontChart:"+scope.Device.fontChart;
                        scope.diagram.parts.push(cofg);
                        setDlg.hide();
                        scope.resetParts();
                    };

                    scope.empty = function(){
                        scope.deviceList.forEach(function(item){
                            item.isChecked = false;
                        });
                        scope.Device.List = "[]";
                    };
                }

                element.bind('click',function(){
                    initFunction();
                    scope.Device = {
                        Name : "",
                        fontChart : "",
                        List : ""
                    };
                    initList();
                    getNewPart("status");
                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/newdevicestatussetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);
                });

            }
        }
    }
]);

nurseDirective.directive('newsignalsetter',['$modal','baseTypeService','balert','ConfigureMoldService',
   function($modal,baseTypeService,balert,ConfigureMoldService){
       return {
           restrict: 'A',
           link:function(scope,element){
               var setDlg = null;

               function getPartNum(typename){
                   var num = 1;
                   var cparts = scope.diagram.parts;
                   if(cparts == undefined){
                       scope.diagram.parts = [];
                       return 1;
                   }
                   for(var i=0;i<cparts.length;i++){
                       if(cparts[i].id.indexOf(typename)==-1) continue;

                       var partnum=parseInt(cparts[i].id.replace(typename,''));
                       if(partnum>=num){
                           num=partnum+1;
                       }
                   }
                   return num;
               }

               /******************* 过滤设备列表 & 加载信号列表 **************************/
               function initDevice(){
                   var parentId = scope.diagram.parentId;
                   if(scope.diagram.deviceBaseTypeId == "1004" ||
                       (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                       parentId = "";
                   ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                       scope.deviceList = data;

                       scope.Topology.DeviceId = scope.diagram.deviceId;
                       if(scope.Topology.DeviceId == undefined)
                           scope.Topology.DeviceId = scope.deviceList[0].equipmentId;

                       baseTypeService.getSignalBaseTypesByDeviceType(scope.Topology.DeviceId).then(function(data) {
                           var list = data;
                           scope.bind = {
                               siglist: list,
                               selectedsigs: undefined
                           };

                       });
                   });
               }
               /*********************************************************************/

               element.bind('click',function(){
				   scope.groupname = "";
				   scope.displayNames = "";//修改后的显示的信号名称
				   //默认背景图
				   var style = localStorage.getItem("systemStyle");
				   if(style == "Blue")
					   scope.background = "configure_bg";
				   else if(style == "White")
					   scope.background = "white_bg";

                   initDevice();
                   setDlg = $modal({
                       scope: scope,
                       templateUrl: 'partials/newsignalsetter.html',
                       show: false
                   });
                   setDlg.$promise.then(setDlg.show);

                   scope.namechange = function(value){
                       scope.groupname = value;
                   };

                   scope.changeBackgrund = function(value){
					   scope.background = value;
				   };

                   scope.changeDevice = function(id){
                       baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                           var list = data;
                           scope.bind = {
                               siglist: list,
                               selectedsigs: undefined
                           };

                       });
                   };

                   scope.save = function(){
                       if(scope.bind.selectedsigs == undefined || scope.bind.selectedsigs.length == 0){
                       		//'请选择信号！'
                           balert.show('danger', scope.languageJson.Configuration.SignalControl.ErrorPrompt,3000);
                           return;
                       }
                       var cfg = {};
                       var bind = _.reduce(scope.bind.selectedsigs, function(memo, sig) {
                           return memo + "BS:" + sig.baseTypeId + "|";
                       }, '');
                       var count = getPartNum("signalgroup");
                       var heightSize = scope.bind.selectedsigs.length;
                       cfg.id = "signalgroup"+count;
                       cfg.type = "signalgroup";
                       cfg.left="5";
                       cfg.top="80";
                       cfg.width="235";
                       cfg.height= 50*(heightSize+1)+20;
                       cfg.zindex="1";
                       cfg.binding = bind+"DI:"+scope.Topology.DeviceId;
                       cfg.options="Name:"+scope.groupname+"|Background:"+scope.background+"|DisplayName:"+scope.displayNames;
                       scope.diagram.parts.push(cfg);
                       scope.resetParts();
                       setDlg.hide();
                   };

                   //region 修改信号名称
				   var modifyDlg = $modal({
					   scope: scope,
					   templateUrl: 'partials/modifySignalName.html',
					   show: false
				   });
				   scope.modifySignalName = function(){
					   scope.modifySelects = scope.bind.selectedsigs;

					   modifyDlg.$promise.then(modifyDlg.show);
				   };
					scope.modify = function(){
						var arr = [];
						scope.displayNames = "";//baseTypeId.baseTypeName-...
						//获取input标签的id和value
						var modifys = $(".modify-signal-table").find(".modify-value");
						for(var i = 0; i < modifys.length; i++){
							if(modifys[i]){
								arr.push({
									id : modifys[i].id,
									value : modifys[i].value
								});
							}
						}
						//修改列表
						if(scope.modifySelects){
							scope.modifySelects.forEach(function(item){
								arr.forEach(function(a){
									if(item.baseTypeId == a.id && item.name != a.value){
										item.baseTypeName = a.value;
										scope.displayNames += a.id+"."+a.value+"-";
									}
								});
							});
						}
						scope.bind.selectedsigs = scope.modifySelects;
						modifyDlg.hide();
					};
				   //endregion
               });
           }
       }
   }
]);

nurseDirective.directive('newpiechartsetter',['$modal','baseTypeService','balert','equipmentTemplateService','base64','ConfigureMoldService',
    function($modal,baseTypeService,balert,equipmentTemplateService,base64,ConfigureMoldService){
        return {
            restrict: 'A',
            link:function(scope,element){
                var setDlg = null;
                scope.pies = {};

                function getPartNum(typename){
                    var num = 1;
                    var cparts = scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++){
                        if(cparts[i].id.indexOf(typename)==-1) continue;

                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum>=num){
                            num=partnum+1;
                        }
                    }
                    return num;
                }
                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.PieChart.Equipments = data;
                        scope.deviceList = data;

                        scope.PieChart.EquipmentId = scope.diagram.deviceId;
                        if(scope.PieChart.EquipmentId == undefined)
                            scope.PieChart.EquipmentId = scope.PieChart.Equipments[0].equipmentId;

						scope.changeEquipment(scope.PieChart.EquipmentId);
                    });
                }
                /*********************************************************************/

                function init(){
                    scope.PieChart = {
                        Title : '',
                        DataType : '1',
                        ChartType : 'line',
						Background : 'configure_bg',
                        Size : '7',
                        SingleBiaxial : '1',
                        LineColor : '[[0.2,"#59cd82"],[0.8,"#f7e140"],[1,"#f44b36"]]',
						LineImages : 'newGaugeBG1',
                        BarColor:'["#ff7f50","#87cefa","#c1232b","#fcce10","#9bca63"]',
                        Y1Name : '',
                        Y1Min : '0',
                        Y1Max : 'auto',
                        Y1Signals : '',
						PieColor : '#1066C3',
						PieValueType : "per"
                    };

                    var style = localStorage.getItem("systemStyle");
					if(style == "Blue")
						scope.PieChart.Background = "configure_bg";
                    else if(style == "White")
						scope.PieChart.Background = "white_bg";
                    else
						scope.PieChart.Background = "";
                }

                var showMultiDeviceSelectDlg = $modal({
                    scope:scope,
                    templateUrl:'partials/showMultiDeviceSelect.html',
                    show:false
                });

                //多设备多选
                function initMultiDeviceSelect(){
                    var filterOut = function(original, toFilter) {
                        if(toFilter == undefined) return original;
                        var filtered = [];
                        angular.forEach(original, function(entity) {
                            var match = false;
                            for (var i = 0; i < toFilter.length; i++) {
                                if (toFilter[i].deviceBaseTypeId == entity.deviceBaseTypeId &&
                                    toFilter[i].baseTypeId == entity.baseTypeId) {
                                    match = true;
                                    break;
                                }
                            }
                            if (!match) {
                                filtered.push(entity);
                            }
                        });
                        return filtered;
                    };

                    function fromJson(data){
                        var arr = [];
                        data.forEach(function(item){
                            arr.push(angular.fromJson(item));
                        });
                        return arr;
                    }

                    scope.refreshAvailable = function() {
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.bind.siglist);
                        scope.selected.available = [];
                        scope.selected.current = [];
                    };

                    scope.addMulti = function() {
                        scope.selected.available = fromJson(scope.selected.available);
                        if(!scope.bind.selectedsigs) scope.bind.selectedsigs = scope.selected.available;
                        else scope.bind.selectedsigs = scope.bind.selectedsigs.concat(scope.selected.available);
                        scope.bind.siglist = filterOut(scope.bind.siglist, scope.selected.available);
                        scope.refreshAvailable();
                    };

                    scope.removeMulti = function() {
                        scope.selected.current = fromJson(scope.selected.current);
                        scope.bind.siglist = scope.bind.siglist.concat(scope.selected.current);
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.selected.current);
                        scope.refreshAvailable();
                    };

                    scope.showMultiSelect = function(obj,data){
                        scope.selected = {};
                        if(scope.bind == undefined) scope.bind = {};
                        scope.bind.selectedsigs = undefined;
                        scope.obj = obj;//对象字符串
                        if(data != undefined && data != ""){
                            var data = angular.fromJson(data);
                            scope.bind.selectedsigs = data;
                        }
                        scope.Topology.DeviceId = scope.diagram.deviceId;
                        scope.changeDevice(scope.Topology.DeviceId);
                        showMultiDeviceSelectDlg.$promise.then(showMultiDeviceSelectDlg.show);
                    };

                    scope.saveMultiSelect = function(deviceId,obj){
						var error = scope.languageJson.Configuration.ActiveChartControl;
                        if(scope.bind.selectedsigs == undefined || scope.bind.selectedsigs.length == 0){
                        	//'信号不能为空！'
                            balert.show('danger', error.ErrorSignal,3000);
                            return;
                        }
                        if(scope.PieChart.DataType == 1 && ((scope.PieChart.ChartType == 'gauge' || scope.PieChart.ChartType == 'newGauge')
							&& scope.bind.selectedsigs.length > 1)){
                        	//'仪表盘的信号只能为一个！'
                            balert.show('danger', error.ErrorGauge,3000);
                            return;
                        }
                        if(scope.PieChart.ChartType == 'pie' && scope.bind.selectedsigs.length < 2){
                        	//'饼图的信号不能少于2个！'
                            balert.show('danger', error.ErrorPie,3000);
                            return;
                        }

                        if(scope.bind.selectedsigs.length > 0){
                            var str = angular.toJson(scope.bind.selectedsigs);
                            eval(obj+"=str");
                        }
                        showMultiDeviceSelectDlg.hide();
                    };

                    scope.changeDevice = function(id){
                        baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                            scope.bind.siglist = filterOut(data, scope.bind.selectedsigs);
                        });
                    };
                }

                function initFunction(){
                    initMultiDeviceSelect();

                    scope.changeEquipment = function(equipmentId){
                        baseTypeService.GetSinalByEquipmentId(equipmentId).then(function(data){
                            scope.PieChart.Signals = data;
                        });
                        scope.PieChart.SignalId = undefined;
                    };

                    scope.dataTypeChange = function(type){
                        if(type == 2 || type == 3 || type == 7)
                            scope.PieChart.ChartType = 'gauge';
                        else if(type == 4 || type == 5 || type == 6)
                            scope.PieChart.ChartType = 'pie';
                        if(type == 2)
                            scope.PieChart.Y1Max = 1.5;
                    };

                    /** 其他容量占比 **/
                    scope.ClickSignalsLi = function(id,symbol){
                        if(eval("scope.PieChart."+id+" == undefined"))
                            eval("scope.PieChart."+id+" = ''");

                        var textDom = document.getElementById(id);
                        var addStr = symbol;

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            if(id == 'Expression1')
                                scope.PieChart.Expression1 = scope.PieChart.Expression1.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression1.substring(scope.endPos);
                            else
                                scope.PieChart.Expression2 = scope.PieChart.Expression2.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression2.substring(scope.endPos);

                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            eval("scope.PieChart."+id+" += "+addStr+"");
                            textDom.focus();
                        }
                    };

                    scope.getCursortPosition = function(id){
                        scope.nowExprId = id;
                        var textDom = document.getElementById(id);
                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.startPos = textDom.selectionStart;
                            scope.endPos = textDom.selectionEnd;
                            scope.scrollTop = textDom.scrollTop;
                        }
                    };

                    scope.changeSignal = function(){
                        var textDom = undefined;
                        if(scope.nowExprId == undefined){
                            textDom = document.getElementById("Expression1");
                            if(scope.PieChart.Expression1 == undefined)
                                scope.PieChart.Expression1 = "";
                            scope.nowExprId = "Expression1";
                        }else{
                            textDom = document.getElementById(scope.nowExprId);
                            if(eval("scope.PieChart."+scope.nowExprId+" == undefined"))
                                eval("scope.PieChart."+scope.nowExprId+" = ''");
                        }

                        var addStr = "["+scope.PieChart.EquipmentId+"-"+scope.PieChart.SignalId+"]";

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            if(scope.nowExprId == 'Expression1')
                                scope.PieChart.Expression1 = scope.PieChart.Expression1.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression1.substring(scope.endPos);
                            else
                                scope.PieChart.Expression2 = scope.PieChart.Expression2.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression2.substring(scope.endPos);

                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            eval("scope.PieChart."+scope.nowExprId+" += "+addStr+"");
                            textDom.focus();
                        }
                    };

                    var showColorSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showColorSelect.html',
                        show:false
                    });
                    //仪表盘 盘颜色
                    scope.showColorSelect = function(data){
                        scope.ColorSelect = angular.fromJson(data);
                        showColorSelectDlg.$promise.then(showColorSelectDlg.show);

                        scope.saveColorSelect = function(){
                            var is = false;
                            for(var i = 0 ;i < scope.ColorSelect.length;i++){
                                if(scope.ColorSelect[i][0] == undefined || scope.ColorSelect[i][0] == "" ||
                                    scope.ColorSelect[i][1] == undefined || scope.ColorSelect[i][1] == "")
                                    is = true;
                            }
                            if(is){
                                //'不能为空！'
                                balert.show('danger', scope.languageJson.Configuration.ActiveChartControl.ErrorEmpty,3000);
                                return;
                            }
                            scope.PieChart.LineColor = angular.toJson(scope.ColorSelect);
                            showColorSelectDlg.hide();
                        };
                    };

                    var showBarColorSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showMoreColorBox.html',
                        show:false
                    });
                    //条形柱  柱子颜色
                    scope.showBarColorSelect = function(data){
                        scope.hideRange = true;//隐藏
                        //颜色集合
                        var colors = angular.fromJson(data);
                        scope.ColorSelect = [];
                        if(colors){
                            colors.forEach(function(col){
                                var c = [col,col];
                                scope.ColorSelect.push(c);
                            });
                        }

                        showBarColorSelectDlg.$promise.then(showBarColorSelectDlg.show);

                        //重写保存
                        scope.saveColorSelect = function(){
                            if(scope.ColorSelect){
                                var colors = [];
                                scope.ColorSelect.forEach(function(item){
                                    colors.push(item[1]);
                                });
                                scope.PieChart.BarColor = angular.toJson(colors);
                            }else
                                scope.PieChart.BarColor = "";
                            showBarColorSelectDlg.hide();
                        };
                    };
                    //新增
                    scope.addColorClick = function(){
                        scope.ColorSelect.push(["#ffffff","#ffffff"]);
                    };
                    //删除
                    scope.delColorClick = function($index){
                        scope.ColorSelect.splice($index,1);
                    };

                    scope.showColpickColor = function(color,index){
                        scope.mod = "scope.ColorSelect["+index+"][1]";
                        scope.color = color.replace(/#/g,'');
                        $('#picker').colpick({
                            flat:true,
                            color:scope.color,
                            onSubmit:function(hsb,hex,rgb,el){
                                eval(scope.mod+" = \"#"+hex+"\"");
                            }
                        });
                    };



                    scope.addMeaningClick = function(value,meaning,result){
                    	if(value == undefined || value == "") return result;
						if(meaning == undefined || meaning == "") return result;

						if(result == undefined || result == "")
							result = value+"."+meaning;
						else
							result += "/"+value+"."+meaning;

						return result;
					};
                }

                function parseBinding(data){
                    var result = '';
                    if(data.DataType == 1 || data.DataType == 7){
                        if(data.ChartType == 'line' || data.ChartType == 'bar')//折线图 || 柱形图
                            result = data.ChartType+'|'+data.Size+'&';
                        else if(data.DataType == 7)
							result = data.ChartType+'|AvgMaxMin&';
                        var y1Signals = angular.fromJson(data.Y1Signals);
                        y1Signals.forEach(function(item){
                            result += 'BS:'+item.baseTypeId+'|DI:'+item.deviceBaseTypeId+"&";
                        });
                    }else{//2:PUE 3:MDC功率 4:MDC空间总占比 5:IT负载 6:制冷容量
                        result = "piechart|"+data.DataType;
                        if(data.DataType == 6){
                            if(scope.PieChart.Expression2)
                                result += "|expr1:"+base64.encode(scope.PieChart.Expression1)+"&expr2:"+
                                    base64.encode(scope.PieChart.Expression2);
                            else
                                result += "|expr1:"+base64.encode(scope.PieChart.Expression1)+"&expr2:";
                        }
                    }
                    return result;
                }

                function showTitle(){
					setTimeout(function(){
						$(".powerFun").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.PowerFun+"</h5>");
						$(".absVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.AbsVal+"</h5>");
						$(".maxVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.MaxVal+"</h5>");
						$(".minVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.MinVal+"</h5>");
					},500);
				}

                function parseLineColor(ChartType){
                    if(ChartType == "gauge")//仪表盘
                        return scope.PieChart.LineColor;
                    else //矩形图
                        return scope.PieChart.BarColor;
                }

                element.bind('click',function(){
                    initFunction();
                    initDevice();
                    init();
                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/newpiechartsetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);
                    showTitle();

                    scope.save = function(){
						var error = scope.languageJson.Configuration.ActiveChartControl;
                        if(scope.PieChart.SingleBiaxial == 1 && scope.PieChart.DataType == 1 &&
                            (scope.PieChart.Y1Signals == undefined || scope.PieChart.Y1Signals == '')){
                        	//'Y1轴信号不能为空！'
                            balert.show('danger', error.ErrorY1,3000);
                            return;
                        }
                        if(scope.PieChart.SingleBiaxial == 2 && scope.PieChart.DataType == 1 &&
                            (scope.PieChart.Y2Signals == undefined || scope.PieChart.Y2Signals == '')){
                        	//'Y2轴信号不能为空！'
                            balert.show('danger', error.ErrorY2,3000);
                            return;
                        }
                        if(scope.PieChart.DataType == 6 && (scope.PieChart.ChartType == "pie" || scope.PieChart.ChartType == "gauge")
                            && (scope.PieChart.Expression1 == undefined || scope.PieChart.Expression1 == "")){
                        	//'当前值表达式不能为空！'
                            balert.show('danger', error.ErrorCurrentVal,3000);
                            return;
                        }
                        if(scope.PieChart.DataType == 6 && scope.PieChart.ChartType == "pie" &&
                            (scope.PieChart.Expression2 == undefined || scope.PieChart.Expression2 == "")){
                        	//'总值表达式不能为空！'
                            balert.show('danger', error.ErrorTotalVal,3000);
                            return;
                        }

                        var cofg ={};
                        cofg.id = "piechart"+getPartNum("piechart");
                        cofg.type = "piechartpart";
                        cofg.left = "5";
                        cofg.top = "80";
                        cofg.width = "400";
                        cofg.height = "300";
                        cofg.binding = parseBinding(scope.PieChart);
                        cofg.options = "Title:"+scope.PieChart.Title+"|ChartType:"+scope.PieChart.ChartType
                            +"|DataType:"+scope.PieChart.DataType+"|LineColor:"+parseLineColor(scope.PieChart.ChartType)
							+"|LineImages:"+scope.PieChart.LineImages
                            +"|Y1Name:"+scope.PieChart.Y1Name+"|Y1Min:"+scope.PieChart.Y1Min+"|Y1Max:"+scope.PieChart.Y1Max
                            +"|Size:"+scope.PieChart.Size+"|Background:"+scope.PieChart.Background
              				+"|PieColor:"+scope.PieChart.PieColor+"|PieValueType:"+scope.PieChart.PieValueType
              				+"|Unit:"+scope.PieChart.Unit+"|Meaning:"+scope.PieChart.Meaning;
                        scope.diagram.parts.push(cofg);
                        scope.resetParts();
                        setDlg.hide();
                    };
                });
            }
        }
    }
]);




nurseDirective.directive('newcamerasetter', ['$modal','CameraService','balert',
	function($modal,CameraService,balert) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
				scope.camerachecked={};
				scope.cameralist =new Array();
				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});

					return found;
				}


				function getPartNum(typename)
				{
					var  num=1;
					var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
					for(var i=0;i<cparts.length;i++)
					{
						if(cparts[i].id.indexOf(typename)==-1)continue;
						var partnum=parseInt(cparts[i].id.replace(typename,''));
						if(partnum>=num){
							num=partnum+1;
						}
					}
					return num;

				}

				function init(){

					CameraService.getAllVideoEquipment().then(function(data) {
						scope.cameralist=new Array();
						var cameradata = eval(data);
						for(var x in cameradata){
							for(var y in cameradata[x].cameraJson){
								var camera ={};
                                camera.cameraname = cameradata[x].equipmentName+ "-"+cameradata[x].cameraJson[y].cameraName;
                                camera.id=cameradata[x].equipmentId +'_'+cameradata[x].cameraJson[y].cameraId;
								scope.cameralist.push(camera);
							}
						}
					});
				}


				element.bind('click', function() {
					init();
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/newcamerasetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);

					scope.save = function() {
						if(scope.camerachecked.item==undefined){
							//'请选择需绑定的视频。'
							balert.show('warning', scope.languageJson.Configuration.VideoControl.ErrorPrompt,2000);
							return;
						}

						var confg ={};
						confg.id="camerapart"+getPartNum("camerapart");
						confg.type="camerapart";
						confg.left="5";
						confg.top="80";
						confg.width="60";
						confg.height="165";
						confg.zindex="1";
						confg.binding="BS:0";
						confg.options="Img:img/diagram/camera.png|cameraid:"+scope.camerachecked.item;
						scope.diagram.parts.push(confg);
						setDlg.hide();
						scope.resetParts();
					};
				});


			}
		}
	}
]);





nurseDirective.directive('newlabelsetter', ['$modal','baseTypeService','balert','ConfigureMoldService',
	function($modal,baseTypeService,balert,ConfigureMoldService) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
                var setDlgs = null;
                scope.data = {};

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});

					return found;
				}

                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;

                        scope.Topology.DeviceId = scope.deviceList[0].equipmentId;
						selectOption();

                        baseTypeService.getSignalBaseTypesByDeviceType(scope.Topology.DeviceId).then(function(datas) {
                            scope.data.devices = datas;
                        });
                    });
                }
                /*********************************************************************/

				function getPartNum(typename)
				{
					var  num=1;
					var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
					for(var i=0;i<cparts.length;i++)
					{
						if(cparts[i].id.indexOf(typename)==-1)continue;
						var partnum=parseInt(cparts[i].id.replace(typename,''));
						if(partnum>=num){
							num=partnum+1;
						}
					}
					return num;

				}

				function getNewPart(type) {
					var style = localStorage.getItem("systemStyle");

					var num=getPartNum(type);
					var part={};
					part.id=type+num;
					part.Name=scope.languageJson.Configuration.TextControl.TextContent.Content;//"新建文本"
					part.FontSize="15";
					part.FontWeight="bold";
					part.TextAlign="center";
					if(style == "White")
						part.Color="#000000";
					else
						part.Color="#FFFFFF";
					part.BackColor="";
                    part.BackStyle="";
					scope.newpart=part;

				}

				//根据文本内容选择信号
				function selectOption(){
					var patt = /\{\d*\-\d*\}/;
					scope.selectId = undefined;
					if(scope.newpart.Name != undefined && patt.test(scope.newpart.Name)){
						var content = scope.newpart.Name;
						var sIndex = content.indexOf("-") + 1;
						var eIndex = content.lastIndexOf("}");
						scope.Topology.DeviceId = content.substring(1,sIndex-1);
						scope.selectId = content.substring(sIndex,eIndex);
					}
				}

				element.bind('click', function() {
					getNewPart("label");
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/newlabelsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);

                    scope.changeDevice = function(id){
                        baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                            scope.data.devices = data;
                        });
                    };

					scope.save = function() {
                        if(scope.newpart.Name == undefined){
                            scope.newpart.Name = "";
                        }
						var cofg ={};
                        var signal = scope.newpart.Name.replace('{', '').replace('}', '').split('-');
						cofg.id=scope.newpart.id;
						cofg.type="labelpart";
						cofg.left="5";
						cofg.top="80";
						cofg.width="85";
						cofg.height="90";
						cofg.zindex="1";
						cofg.binding= signal.length == 1 ? "BS:0" : "BS:"+signal[1]+"|DI:"+signal[0];
						cofg.options="Name:"+scope.newpart.Name+"|FontSize:"+scope.newpart.FontSize+"|FontWeight:"+scope.newpart.FontWeight+
                            "|TextAlign:"+scope.newpart.TextAlign+"|Color:"+scope.newpart.Color+
                            "|BackColor:"+(scope.newpart.BackColor===undefined?"":scope.newpart.BackColor)+
                            "|BackStyle:"+(scope.newpart.BackStyle===undefined?"":scope.newpart.BackStyle);
						scope.diagram.parts.push(cofg);
						setDlg.hide();
						scope.resetParts();
					};

                    scope.bindingDlg = function(){
                        initDevice();
						selectOption();
                        setDlgs = $modal({
                            scope: scope,
                            templateUrl: 'partials/bindingDlg.html',
                            show: false
                        });
                        setDlgs.$promise.then(setDlgs.show);
                    };
                    scope.deleteBind = function(){
						scope.newpart.Name = "";
						setDlgs.hide();
					};
                    scope.ok = function(){
						if(scope.data.selecteds == undefined) return;
						var data = angular.fromJson(scope.data.selecteds[0]);
						//deviceBaseTypeId => EquipmentId
						scope.newpart.Name = "{"+data.deviceBaseTypeId+"-"+data.baseTypeId+"}";
						setDlgs.hide();
                    };
				});
			}
		}
	}
]);





nurseDirective.directive('newimagesetter', ['$modal','uploadService','balert','ImageManageService',
	function($modal,uploadService,balert,ImageManageService) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
				var showImgFileDlg = undefined;

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});
					return found;
				}

				function getPartNum(typename) {
					var  num = 1;
					var cparts = scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
					for(var i=0;i<cparts.length;i++) {
						if(cparts[i].id.indexOf(typename)==-1)continue;
						var partnum = parseInt(cparts[i].id.replace(typename,''));
						if(partnum >= num) num = partnum + 1;
					}
					return num;
				}

				function getNewPart(type){
					var num=getPartNum(type);
					var part={};
					part.id=type+num;
					part.options="img/diagram/default.jpg";
					scope.newpart=part;
				}

                function initFunction(){
                    scope.imgFilePath = undefined;
                    scope.showImgFile = function(){
                        scope.imgFiles = {
                            catalog : "img/diagram",
                            imageFile : undefined
                        };
                        showImgFileDlg = $modal({
                            scope: scope,
                            templateUrl: 'partials/showImgFile.html',
                            show: false
                        });
                        showImgFileDlg.$promise.then(showImgFileDlg.show);

                        scope.changeCatalog(scope.imgFiles.catalog);
                    };

                    scope.changeCatalog = function(catalog){
                        ImageManageService.LoadImagesByPath(catalog).then(function(data){
                            scope.ImageFiles = data;
                        });
                    };

                    scope.clickImage = function(imageFile,$event){
                        scope.imgFiles.imageFile = imageFile;
                        $($event.currentTarget).parent().find('div').removeClass("select-image");
                        $($event.currentTarget).addClass("select-image");
                    };

                    scope.selectImageFile = function(){
                        if(scope.imgFiles == undefined || scope.imgFiles.imageFile == undefined){
                        	//'请选择图片。'
                            balert.show('danger', scope.languageJson.Configuration.LocalImage.SelectError,3000);
                            return;
                        }
                        scope.imgFilePath = scope.imgFiles.imageFile;
                        showImgFileDlg.hide();
                    };
                }

				element.bind('click', function() {
					getNewPart("image");
                    initFunction();
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/newimagesetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);
                    scope.file = undefined;

					scope.save = function() {

						var cofg ={};
						cofg.id=scope.newpart.id;
						cofg.type="imagepart";
						cofg.left="5";
						cofg.top="80";
						cofg.width="100";
						cofg.height="120";
						cofg.binding="BS:0";
						var file = scope.file;
						if (file === undefined){
                            if(scope.imgFilePath == undefined){
                            	//'请选择上传图片或者本地图片'
                                balert.show('danger', scope.languageJson.Configuration.ImageControl.UploadError,3000);
                                return;
                            }
							cofg.options=scope.imgFilePath;
							scope.diagram.parts.push(cofg);
							setDlg.hide();
							scope.resetParts();
						}else if(file.size>512000) {
							//'新增图片不能大于500K,请压缩尺寸后再修改。'
							balert.show('danger', scope.languageJson.Configuration.ImageControl.SizeError,3000);
						}else {
							scope.loading = true;
							uploadService.uploadFile(scope.
								file).then(function(data) {
								cofg.options=data;
								scope.diagram.parts.push(cofg);
								setDlg.hide();
								scope.resetParts();
								scope.loading = false;
							});
						}
					};

				});


			}
		}
	}
]);





nurseDirective.directive('newlinkbuttonsetter', ['$modal','ConfigureMoldService','balert',
	function($modal,ConfigureMoldService,balert) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});
					return found;
				}

				function getPartNum(typename) {
					var  num = 1;
					var cparts = scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
					for(var i=0;i<cparts.length;i++) {
						if(cparts[i].id.indexOf(typename)==-1)continue;
						var partnum = parseInt(cparts[i].id.replace(typename,''));
						if(partnum >= num) num = partnum + 1;
					}
					return num;
				}

				function getNewPart(type){
					var num=getPartNum(type);
					var part={};
					part.id=type+num;
					part.url="/#";
					part.target="";
					scope.newpart=part;
				}

				function initFunction(){
                    scope.ConfigureParts = [];
                    ConfigureMoldService.GetAllConfigureMold().then(function(data){
                        scope.ConfigureMolds = data;
                    });

                    scope.changeParent = function(data){
                        scope.newpart.partId = undefined;

                        var obj = angular.fromJson(data);
                        if(obj.parts){
                            scope.ConfigureParts = obj.parts;
                            scope.newpart.parentId = obj.configId;
                        }else
                            scope.ConfigureParts = [];
                    };
                }

				element.bind('click', function() {
					getNewPart("linkbutton");
					initFunction();
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/newlinkbuttonsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);

					scope.save = function() {
					    if(scope.newpart.target == '_configure' &&
                            (scope.newpart.parentId == undefined || scope.newpart.part == undefined)){
					        return;
                        }
						var cofg ={};
						cofg.id=scope.newpart.id;
						cofg.type="linkbuttonpart";
						cofg.left="5";
						cofg.top="80";
						cofg.width="60";
						cofg.height="60";
						cofg.binding="BS:0";
						cofg.options="Url:"+scope.newpart.url+"|Target:"+scope.newpart.target+
                            "|ParentId:"+scope.newpart.parentId+createPartStr(scope.newpart.target,scope.newpart.part);
						scope.diagram.parts.push(cofg);
						setDlg.hide();
						scope.resetParts();
					};
				});

				function createPartStr(target,part){
				    if(target != "_configure") return;
					var cfg = angular.fromJson(part);
					return "|PartId:"+cfg.deviceId+"|DevBaseType:"+cfg.baseTypeId;
				}
			}
		}
	}
]);

nurseDirective.directive('newtablesetter',['$modal','baseTypeService','balert','$compile','ConfigureMoldService',
    function($modal,baseTypeService,balert,$compile,ConfigureMoldService){
        return {
            restrict : 'A',
            link: function(scope,element){
                var setDlg = null;
                var setDlgs = null;
                var rowCount = 2;
                var colCount = 4;
                var NtsId = "";

                function getPartNum(typename) {
                    var  num = 1;
                    var cparts = scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++) {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum = parseInt(cparts[i].id.replace(typename,''));
                        if(partnum >= num) num = partnum + 1;
                    }
                    return num;
                }

                function getNewPart(type){
                    var num=getPartNum(type);
                    var part={};
                    part.id=type+num;
                    part.url="/#";
                    part.target="";
                    scope.newpart=part;
                }

                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;

                        scope.Topology.DeviceId = scope.diagram.deviceId;
                        if(scope.Topology.DeviceId == undefined)
                            scope.Topology.DeviceId = scope.deviceList[0].equipmentId;

                        baseTypeService.getSignalBaseTypesByDeviceType(scope.Topology.DeviceId).then(function(datas) {
                            scope.data.devices = datas;
                        });

						var style = localStorage.getItem("systemStyle");
						if(style == "White")
							scope.Topology.Style = "white_bg";
						else
							scope.Topology.Style = "";
                    });
                }
                /*********************************************************************/

                element.bind('click',function(){
                    initDevice();
                    getNewPart("tablepart");
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/newtablesetter.html',
                        show:false
                    });
                    rowCount = 2;
                    colCount = 4;
                    setDlg.$promise.then(setDlg.show);
                    scope.NtsOcerflow = "";

                    scope.addCol = function(){
                        colCount++;
                        var i = 0;
                        $("#NtsTable tr").each(function(){
                            var trHtml = "";
                            if(i === 0){
                                trHtml = '<td><input type="text" id="rowTitle'+colCount+'" class="form-control" placeholder= "'+scope.languageJson.Configuration.TableControl.ColTitle+colCount+'" Virtual-Key-Board/></td>';//列标题
                            }else{
                                trHtml = '<td><input type="text" id="value'+(i+1)+'00'+(colCount-1)+'" ng-click="bindingDlg('+(i+1)+'00'+(colCount-1)+')" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.Value+(i+1)+'00'+(colCount-1)+'"/></td>';//值
                            }
                            var $html = $compile(trHtml)(scope);
                            $(this).append($html);
                            i++;
                        });
                        if(colCount >= 5 && colCount <= 9){
							var width = parseInt($("#ModalDialog").css("width")) + 120;
							$("#ModalDialog").css("width",width+"px");
						}else if(colCount > 9){
							var width = parseInt($("#NtsTable").css("width")) + 120;
							$("#NtsTable").css("width",width+"px");
						}
                    };
                    scope.addRow = function(){
                        rowCount++;
                        var rowTemplate = '<tr>';
                        for(var i=0;i<colCount;i++){
                            if(i === 0){
                                rowTemplate += '<td><input type="text" id="colTitle'+rowCount+'" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.RowTitle+rowCount+'" Virtual-Key-Board/></td>';//行标题
                            }else{
                                rowTemplate += '<td><input type="text" id="value'+rowCount+'00'+i+'" ng-click="bindingDlg('+rowCount+'00'+i+')" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.Value+rowCount+'00'+i+'"/></td>';//值
                            }
                        }
                        rowTemplate += '</tr>';
                        var $html = $compile(rowTemplate)(scope);
                        $("#NtsTable tbody").append($html);
                    };
                    scope.delCol = function(){
                        colCount--;
                        $("#NtsTable tr").each(function(){
                            $("td:eq("+colCount+")",this).remove();
                        });
                        var width = parseInt($("#ModalDialog").css("width")) - 120;
                        if(width >= 600)
                        	$("#ModalDialog").css("width",width+"px");
                    };
                    scope.delRow = function(){
                        rowCount--;
                        $("#NtsTable tr:eq("+rowCount+")").remove();
                    };

                    scope.changeDevice = function(id){
                        baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                            scope.data.devices = data;
                        });
                    };

                    scope.save = function(){
                        var cofg ={};
                        cofg.id=scope.newpart.id;
                        cofg.type="tablepart";
                        cofg.left="5";
                        cofg.top="80";
                        cofg.width=colCount*48;//570
                        cofg.height=rowCount*46;//160
                        cofg.zindex="1";
                        cofg.binding=getBinDing()+"|DI:"+scope.Topology.DeviceId;
                        cofg.options="Head:"+getHead()+"|Rows:"+RowsData()+"|Style:"+scope.Topology.Style;
                        scope.diagram.parts.push(cofg);
                        setDlg.hide();
                        scope.resetParts();
                    };

                    var getHead = function(){
                        var head = "";
                        var i = 0;
                        $("#NtsTable tr:eq(0) td").each(function(){
                            if(i === 0)
                                head += $(this).children('input').val();
                            else
                                head += ","+$(this).children('input').val();
                            i++;
                        });
                        return head;
                    };
                    var RowsData = function(){
                        var rowsData = "";
                        $("#NtsTable tr:gt(0)").each(function(){
                            var i = 0;
                            $(this).children('td').each(function(){
                                if(i === 0)
                                    rowsData += $(this).children('input').val();
                                else
                                    rowsData += ","+ $(this).children('input').val();
                                i++;
                            });
                            rowsData += "&";
                        });
                        rowsData = rowsData.substring(0,rowsData.length-1);
                        return rowsData;
                    };
                    var getBinDing = function(){
                        var binding = "";
                        var i = 0;
                        $("#NtsTable tr:gt(0)").each(function(){
                            $(this).children('td:gt(0)').each(function(){
                                var index = $(this).children('input').val().indexOf(":");
                                var length = $(this).children('input').val().length;
                                var value = $(this).children('input').val().substring(index+1,length-1);
                                if(value != ""){
                                    if(i === 0)
                                        binding += "BS:" + value;
                                    else
                                        binding += "|BS:" + value;
                                    i++;
                                }
                            });
                        });
                        return binding;
                    };

                    scope.bindingDlg = function(id){
                        setDlgs = $modal({
                            scope: scope,
                            templateUrl: 'partials/bindingTable.html',
                            show: false
                        });
                        NtsId = "value"+id;

                        setDlgs.$promise.then(setDlgs.show);
                    };
                    scope.ok = function(){
                        $("#"+NtsId).val("{"+scope.data.selecteds[0].baseTypeName+":"+scope.data.selecteds[0].baseTypeId+"}");
                        setDlgs.hide();
                    };
                    scope.deleteBind = function(){
                        $("#"+NtsId).val("");
                        setDlgs.hide();
                    };
                });
            }
        }
    }
]);


nurseDirective.directive('newvirtualsignalsetter',['$modal','equipmentTemplateService','baseTypeService','balert','base64','ConfigureMoldService',
    function($modal,equipmentTemplateService,baseTypeService,balert,base64,ConfigureMoldService){
        return {
            restrict : 'A',
            link : function(scope,element){
                var setDlg = null,bindMeaningsDlg = null;
                scope.virtualSignal = {};

                function init(){
                    scope.virtualSignal = {
                        name : '',
                        signalId : undefined,
                        Expression : '',
                        unit : '',
						Background : '',
						fontSize : 14,
						dataBackground : '2',
						dataColor : '[[999,"#ffffff"]]'
                    };
					var style = localStorage.getItem("systemStyle");
					if(style == "White") scope.virtualSignal.dataColor = '[[0,"#000000"]]';

                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.virtualSignal.equipments = data;

                        scope.virtualSignal.equipmentId = scope.diagram.deviceId;
                        if(scope.virtualSignal.equipmentId == undefined)
                            scope.virtualSignal.equipmentId = scope.virtualSignal.equipments[0].id;
                        scope.changeEquipment(scope.virtualSignal.equipmentId);
                    });

                    /*-----  绑定开关量含义 Start  ----*/
                    scope.bindMeaningsBox = function(){
                        scope.title = scope.languageJson.Configuration.VirtualControl.Kind.Analog;//"虚拟量";
                        bindMeaningsDlg = $modal({
                            scope:scope,
                            templateUrl:'partials/bindingMeanings.html',
                            show:false
                        });
                        bindMeaningsDlg.$promise.then(bindMeaningsDlg.show);
                    };
                    scope.addMeaningsCol = function(){
                        var value = -1;
                        if(scope.DataMeanings){
                            scope.DataMeanings.forEach(function(item){
                                if(item.Value > value){
                                    value = item.Value;
                                }
                            });
                        }
                        value ++;
                        var cfg = {
                            Value : value,
                            Meanings : scope.languageJson.Configuration.VirtualControl.Meaning2
                        };//'含义'

                        if(scope.DataMeanings == undefined) scope.DataMeanings = [];
                        scope.DataMeanings.push(cfg);
                    };
                    scope.deleteMeaningsClick = function($index){
                        scope.DataMeanings.splice($index,1);
                    };
                    scope.saveMeanings = function(){
                        scope.virtualSignal.meanings = "";
                        if(scope.DataMeanings){
                            scope.DataMeanings.forEach(function(item){
                                if(scope.virtualSignal.meanings == "")
                                    scope.virtualSignal.meanings += item.Meanings;
                                else
                                    scope.virtualSignal.meanings += "/" + item.Meanings;
                            });
                        }
                        bindMeaningsDlg.hide();
                    };
                    /*-----  绑定开关量含义 End  ----*/

					/*-----  颜色设置 Start  ---------------*/
					var showColorSelectDlg = $modal({
						scope:scope,
						templateUrl:'partials/showMoreColorBox.html',
						show:false
					});
					scope.showColorSelect = function(data){
						scope.ColorSelect = angular.fromJson(data);
						showColorSelectDlg.$promise.then(showColorSelectDlg.show);
					};
					scope.addColorClick = function(){
						scope.ColorSelect.push([1,"#ffffff"]);
					};
					scope.delColorClick = function($index){
						scope.ColorSelect.splice($index,1);
					};
					scope.saveColorSelect = function(){
						scope.virtualSignal.dataColor = angular.toJson(scope.ColorSelect);
						showColorSelectDlg.hide();
					};
					/*-----  颜色设置 End  ---------------*/
                }

                function getPartNum(typename){
                    var  num=1;
                    var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++) {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum >= num) num=partnum+1;
                    }
                    return num;
                }

                function getNewPart(type) {
                    var num = getPartNum(type);
                    scope.virtualSignal.id = type + num;
                }

                element.bind('click',function(){
                    init();
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/newvirtualsignalsetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);
					setTimeout(function(){
						$("#powerFun").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.PowerFun+"</h5>");
						$("#absVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.AbsVal+"</h5>");
						$("#maxVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.MaxVal+"</h5>");
						$("#minVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.MinVal+"</h5>");
						$("#int").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.Int+"</h5>");
						$("#double").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.Double+"</h5>");
					},500);

                    getNewPart("virtualSignal");

                    scope.changeEquipment = function(equipmentId){
                        baseTypeService.GetSinalByEquipmentId(equipmentId).then(function(data){
                            scope.virtualSignal.signals = data;
                        });
                        scope.virtualSignal.signalId = undefined;
                    };

                    scope.changeSignal = function(){
                        if(scope.virtualSignal.Expression == undefined)
                            scope.virtualSignal.Expression = "";

                        var textDom = document.getElementById("Expression");
                        var addStr = "["+scope.virtualSignal.equipmentId+"-"+scope.virtualSignal.signalId+"]";

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.virtualSignal.Expression = scope.virtualSignal.Expression.substring(0,scope.startPos)+addStr+
                                scope.virtualSignal.Expression.substring(scope.endPos);
                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            scope.virtualSignal.Expression += addStr;
                            textDom.focus();
                        }
                    };

                    scope.getCursortPosition = function() {
                        var textDom = document.getElementById("Expression");
                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.startPos = textDom.selectionStart;
                            scope.endPos = textDom.selectionEnd;
                            scope.scrollTop = textDom.scrollTop;
                        }
                    };

                    scope.ClickSignalsLi = function(symbol){
                        if(scope.virtualSignal.Expression == undefined)
                            scope.virtualSignal.Expression = "";

                        var textDom = document.getElementById("Expression");
                        var addStr = symbol;

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.virtualSignal.Expression = scope.virtualSignal.Expression.substring(0,scope.startPos)+addStr+
                                scope.virtualSignal.Expression.substring(scope.endPos);
                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            scope.virtualSignal.Expression += addStr;
                            textDom.focus();
                        }
                    };

                    scope.addNewVirtualSignal = function(){
                        if(scope.virtualSignal.Expression == undefined || scope.virtualSignal.Expression == ""){
                        	//'表达式不能为空。'
                            balert.show('danger', scope.languageJson.Configuration.VirtualControl.ErrorPrompt,3000);
                            return;
                        }
                        var cofg ={};
                        cofg.id=scope.virtualSignal.id;
                        cofg.type="virtualsignalpart";
                        cofg.left="5";
                        cofg.top="80";
                        cofg.width="150";
                        cofg.height="140";
                        cofg.zindex="1";
                        cofg.binding="expr:"+base64.encode(scope.virtualSignal.Expression);
                        cofg.options="Name:"+scope.virtualSignal.name+"|Category:"+scope.virtualSignal.category+getCategoryValue(scope.virtualSignal.category)
							+"|Background:"+scope.virtualSignal.background+"|FontSize:"+scope.virtualSignal.fontSize
							+"|DataBackground:"+scope.virtualSignal.dataBackground+"|DataColor:"+scope.virtualSignal.dataColor;
                        scope.diagram.parts.push(cofg);
                        setDlg.hide();
                        scope.resetParts();
                    };

                    function getCategoryValue(category){
                        if(category == 1){
                            return "|Unit:"+scope.virtualSignal.unit;
                        }else{
                            var result = "";
                            if(scope.DataMeanings){
                                scope.DataMeanings.forEach(function(item){
                                    if(result == "")
                                        result += item.Value+"-"+item.Meanings;
                                    else
                                        result += ","+item.Value+"-"+item.Meanings;
                                });
                            }
                            return "|Meanings:"+result;
                        }
                    }
                });
            }
        }
    }
]);




nurseDirective.directive("imagesignalsetter",['$modal','baseTypeService','global','balert',function($modal,baseTypeService,global,balert){
    return {
        restrict: 'A',
        link: function(scope,element){
            var setDlg = null;
            scope.updpart = {};
            function getPartConfig(diagram, id) {
                var found = _.find(diagram.parts, function(part) {
                    return part.id === id;
                });
                return found;
            }
            //show list
            function initList() {
                baseTypeService.getSignalBaseTypes().then(function(data) {
                    scope.siglist = data;
                });
            }
            function showSignal(){
                var obj = getPartConfig(scope.diagram, scope.partid);
                scope.updpart.id = obj.id;
                scope.updpart.type = (obj.id).replace(/\d/,"");
                getNewPart(scope.updpart.type);
                scope.updpart.name = global.getpara("Name",obj.options);
                scope.updpart.radiosig = global.getpara("BS",obj.binding)+"-"+global.getpara("DI",obj.binding);
                var isImage = global.getpara("isImage",obj.options);
                if(isImage != "false") scope.isImageCheck = true;
                else scope.isImageCheck = false;
                var isSignal = global.getpara("isSignal",obj.options);
                if(isSignal != "false") scope.isSignalCheck = true;
                else scope.isSignalCheck = false;
				scope.updpart.background = global.getpara("Background",obj.options);
            }
            function getPartNum(){
                var obj = getPartConfig(scope.diagram, scope.partid);
                return (obj.id).replace(/\D/g,"");
            }
            function getNewPart(type) {
                var part={};
                var num = getPartNum();
                part.id = type + num;
				switch (type) {
					case 'infrared':
						part.type="infrared";
						part.img="img/diagram/InfraredDetector_Alarm.png";
						part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Infrared+num+"#";//"红外"
						break;
					case 'smoke':
						part.type="smoke";
						part.img="img/diagram/Fog_inductor.png";
						part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Smoke+num+"#";//"烟感"
						break;
					case 'watermonitor':
						part.type="watermonitor";
						part.img="img/diagram/WaterMonitor.png";
						part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.LiquidLeak+num+"#";//"水浸"
						break;
					case 'temperature':
						part.type="temperature";
						part.img="img/diagram/temperature.png";
						part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Temperature+num+"#";//"温度"
						break;
					case 'humidity':
						part.type="humidity";
						part.img="img/diagram/Thermometer_Blue.png";
						part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Humidity+num+"#";//"湿度"
						break;
					case 'door':
						part.type="door";
						part.img="img/diagram/DoorAlarm.png";
						part.name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Door+num+"#";//"门碰"
						break;
					case 'lamp':
						part.type = "lamp";
						part.img = "img/diagram/lamp.png";
						part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Lamp+num+"#";//"灯"
						break;
					case 'audible':
						part.type = "audible";
						part.img = "img/diagram/audible.png";
						part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Audible+num+"#";//"声光"
						break;
					case 'switch':
						part.type = "switch";
						part.img = "img/diagram/switch.png";
						part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Switch+num+"#";//"其它开关量"
						break;
					case 'estimate':
						part.type = "estimate";
						part.img = "img/diagram/estimate.png";
						part.name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Numerical+num+"#";//"其它模拟量"
						break;
				}
                scope.updpart=part;
            }
            function getNewName(type,num){
                var name = "";
                switch (type) {
                    case 'infrared':
                        name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Infrared+num+"#";
                        break;
                    case 'smoke':
                        name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Smoke+num+"#";
                        break;
                    case 'watermonitor':
                        name= scope.languageJson.Configuration.ImageSignalControl.ControlType.LiquidLeak+num+"#";
                        break;
                    case 'temperature':
                        name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Temperature+num+"#";
                        break;
                    case 'humidity':
                        name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Humidity+num+"#";
                        break;
                    case 'door':
                        name= scope.languageJson.Configuration.ImageSignalControl.ControlType.Door+num+"#";
                        break;
                    case 'lamp':
                        name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Lamp+num+"#";
                        break;
                    case 'audible':
                        name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Audible+num+"#";
                        break;
                    case 'switch':
                        name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Switch+num+"#";
                        break;
                    case 'estimate':
                        name = scope.languageJson.Configuration.ImageSignalControl.ControlType.Numerical+num+"#";
                        break;
                }
                return name;
            }
            scope.parttypechange = function(type){
                getNewPart(type);
            };

            function initFunction(){
                scope.checkedDoor = function($event,data){
                    eval("scope."+data+" = "+$event.target.checked);
                };
                scope.getCheckbox = function(visible){
                    if(visible == true || visible == 'true')
                        return "√";
                    else
                        return "X";
                };
            }

            element.bind('click',function(){
                initList();
                var partid = element.parent().parent().attr("partid");
                scope.partid = partid;
                setDlg = $modal({
                    scope:scope,
                    templateUrl:'partials/imagesignalsetter.html',
                    show:false
                });
                setDlg.$promise.then(setDlg.show);
                showSignal();
                initFunction();
            });
            scope.saveimagesignal = function(){
				if(scope.updpart.radiosig == undefined){
					//'请选择绑定信号。'
					balert.show('danger', scope.languageJson.Configuration.ImageSignalControl.ErrorPrompt,3000);
					return;
				}
                var cfg = getPartConfig(scope.diagram, scope.partid);
                var id = scope.updpart.type+getPartNum();
                if(id == scope.partid){
                    cfg.id = id;
                }else{//当id重复时，修改id值
                    var obj = getPartConfig(scope.diagram, id);
                    var num = parseInt(getPartNum());
                    while(obj!=undefined){
                        num ++;
                        id = scope.updpart.type+num;
                        obj = getPartConfig(scope.diagram, id);
                    }
                    cfg.id = id;
                    scope.updpart.name = getNewName(scope.updpart.type,num);
                }
                var bsAndDi = scope.updpart.radiosig.split("-");
                cfg.binding = "BS:"+bsAndDi[0]+"|DI:"+bsAndDi[1];
                cfg.options = "Name:"+scope.updpart.name+"|Img:"+scope.updpart.img+"|isImage:"+scope.isImageCheck+"|isSignal:"+scope.isSignalCheck+"|Background:"+scope.updpart.background;
                scope.resetParts();
                setDlg.hide();
            };
        }
    }
}]);

nurseDirective.directive("tablesetter",['$modal','baseTypeService','balert','$compile','global','ConfigureMoldService',
    function($modal,baseTypeService,balert,$compile,global,ConfigureMoldService){
        return{
            restrict:'A',
            link: function(scope,element){
                var setDlg = null;
                var setDlgs = null;
                var rowCount = 1;
                var colCount = 4;
                var NtsId = "";
                scope.updpart = {};
                scope.updpart.tables = {};
                scope.updpart.tables.thead = [];
                scope.updpart.tables.tbody = [];



                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;

                        var partid= element.parent().parent().attr("partid");
                        scope.partid=partid;
                        var obj = getPartConfig(scope.diagram, scope.partid);
                        if(global.getpara("DI",obj.binding))
                            scope.Topology.DeviceId = global.getpara("DI",obj.binding);
                        else
                            scope.Topology.DeviceId = scope.diagram.deviceId;

                        baseTypeService.getSignalBaseTypesByDeviceType(scope.Topology.DeviceId).then(function(datas) {
                            scope.data.devices = datas;
                        });
                    });
                }
                /*********************************************************************/

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }

                function showSignal(){
                    var obj = getPartConfig(scope.diagram, scope.partid);
                    scope.updpart.id = obj.id;
                    scope.updpart.type = (obj.id).replace(/\d/,"");
                    scope.updpart.options = obj.options;

					scope.updateTable = function(){
						if(scope.updpart.options === undefined) return;
						var head=global.getpara("Head",scope.updpart.options);
						var rowsdata=global.getpara("Rows",scope.updpart.options);
						var headarry=head.split(',');
						var rows=rowsdata.split('&');
						var s= 568+120*(headarry.length-4);

						var style = global.getpara("Style",scope.updpart.options);
						scope.Topology.Style = style;

						if(headarry.length <= 3)
							scope.updpart.tables.style = { 'width':'450px'};
						else if(headarry.length <= 9)
							scope.updpart.tables.style = { 'width':s+'px'};
						else
							scope.updpart.tables.style = { 'width':'1200px'};
						for(var i = 0;i<headarry.length;i++){
							scope.updpart.tables.thead[i] = {};
							scope.updpart.tables.thead[i].id = "colTitle"+(i+1);
							scope.updpart.tables.thead[i].value = headarry[i];
						}

						for(var i = 0;i<rows.length;i++){
							if(rows.length == 1 && rows[0] == "") break;

							scope.updpart.tables.tbody[i] = {};
							scope.updpart.tables.tbody[i].tr = [];
							var tds = rows[i].split(',');
							for(var j = 0;j<tds.length;j++){
								scope.updpart.tables.tbody[i].tr[j] = {};
								if(j === 0){
									scope.updpart.tables.tbody[i].tr[j].id = 'rowTitle'+(i+2);
								}else{
									scope.updpart.tables.tbody[i].tr[j].id = 'value'+(i+2)+'00'+(j+1);
								}
								scope.updpart.tables.tbody[i].tr[j].value = tds[j];
							}
						}

						rowCount = rows.length;
						colCount = headarry.length;
					};
                    scope.updateTable();
                }

                function initFunction(){
					scope.addCol = function(){
						colCount++;
						var i = 0;
						$("#NtsTable tr").each(function(){
							var trHtml = "";
							if(i === 0){
								trHtml = '<td><input type="text" id="rowTitle'+colCount+'" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.ColTitle+colCount+'" Virtual-Key-Board/></td>';//列标题
							}else{
								trHtml = '<td><input type="text" id="value'+(i+1)+'00'+(colCount)+'" ng-click="bindingDlg('+(i+1)+'00'+(colCount)+')" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.Value+(i+1)+'00'+(colCount)+'"/></td>';
							}
							var $html = $compile(trHtml)(scope);
							$(this).append($html);
							i++;
						});
						if(colCount >= 5 && colCount <= 9){
							var width = parseInt($("#ModalDialog").css("width")) + 120;
							$("#ModalDialog").css("width",width+"px");
						}else if(colCount > 9){
							var width = parseInt($("#NtsTable").css("width")) + 120;
							$("#NtsTable").css("width",width+"px");
						}
					};
					scope.addRow = function(){
						rowCount++;
						var rowTemplate = '<tr>';
						for(var i=0;i<colCount;i++){
							if(i === 0){
								rowTemplate += '<td><input type="text" id="colTitle'+(rowCount+1)+'" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.RowTitle+(rowCount+1)+'" Virtual-Key-Board/></td>';//行标题
							}else{
								rowTemplate += '<td><input type="text" id="value'+(rowCount+1)+'00'+i+'" ng-click="bindingDlg('+(rowCount+1)+'00'+i+')" class="form-control" placeholder="'+scope.languageJson.Configuration.TableControl.Value+(rowCount+1)+'00'+i+'"/></td>';//值
							}
						}
						rowTemplate += '</tr>';
						var $html = $compile(rowTemplate)(scope);
						$("#NtsTable tbody").append($html);
					};
					scope.delCol = function(){
						colCount--;
						$("#NtsTable tr").each(function(){
							$("td:eq("+colCount+")",this).remove();
						});
						var width = parseInt($("#ModalDialog").css("width")) - 120;
						if(width >= 600)
							$("#ModalDialog").css("width",width+"px");
					};
					scope.delRow = function(){
						$("#NtsTable tr:eq("+rowCount+")").remove();
						rowCount--;
					};
				}
                element.bind('click',function(){
                    initDevice();
                    scope.partid = element.parent().parent().attr("partid");
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/tablesetter.html',
                        show:false
                    });
                    scope.updpart.tables.thead = [];
                    scope.updpart.tables.tbody = [];

                    setDlg.$promise.then(setDlg.show);
                    showSignal();
					initFunction();

                    scope.changeDevice = function(id){
                        baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                            scope.data.devices = data;
                        });
                    };

                    scope.save = function(){
                        var cfg = getPartConfig(scope.diagram, scope.partid);
                        cfg.binding=getBinDing()+"|DI:"+scope.Topology.DeviceId;
                        cfg.options="Head:"+getHead()+"|Rows:"+RowsData()+"|Style:"+scope.Topology.Style;
                        scope.resetParts();
                        setDlg.hide();
                    };

                    var getHead = function(){
                        var head = "";
                        var i = 0;
                        $("#NtsTable tr:eq(0) td").each(function(){
                            if(i === 0)
                                head += $(this).children('input').val();
                            else
                                head += ","+$(this).children('input').val();
                            i++;
                        });
                        return head;
                    };
                    var RowsData = function(){
                        var rowsData = "";
                        $("#NtsTable tr:gt(0)").each(function(){
                            var i = 0;
                            $(this).children('td').each(function(){
                                if(i === 0)
                                    rowsData += $(this).children('input').val();
                                else
                                    rowsData += ","+ $(this).children('input').val();
                                i++;
                            });
                            rowsData += "&";
                        });
                        rowsData = rowsData.substring(0,rowsData.length-1);
                        return rowsData;
                    };
                    var getBinDing = function(){
                        var binding = "";
                        var i = 0;
                        $("#NtsTable tr:gt(0)").each(function(){
                            $(this).children('td:gt(0)').each(function(){
                                var index = $(this).children('input').val().indexOf(":");
                                var length = $(this).children('input').val().length;
                                var value = $(this).children('input').val().substring(index+1,length-1);
                                if(value != ""){
                                    if(i === 0)
                                        binding += "BS:" + value;
                                    else
                                        binding += "|BS:" + value;
                                    i++;
                                }
                            });
                        });
                        return binding;
                    };
                    scope.bindingDlg = function(dom){
                        if(dom.td && dom.td.id.indexOf("value") === -1) return;
                        setDlgs = $modal({
                            scope: scope,
                            templateUrl: 'partials/bindingTable.html',
                            show: false
                        });
                        if(dom.td)
                            NtsId = dom.td.id;
                        else
                            NtsId = 'value'+dom;

                        setDlgs.$promise.then(setDlgs.show);
                    };
                    scope.ok = function(){
                        $("#"+NtsId).val("{"+scope.data.selecteds[0].baseTypeName+":"+scope.data.selecteds[0].baseTypeId+"}");
                        setDlgs.hide();
                    };
                    scope.deleteBind = function(){
                        $("#"+NtsId).val("");
                        setDlgs.hide();
                    };
                });
            }
        }
    }
]);

nurseDirective.directive('deletepartsetter', ['$modal','global','AlarmLinkageService','equipmentService',
    function($modal,global,AlarmLinkageService,equipmentService) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
				element.bind('click', function() {
					if(sessionStorage.getItem("isLock") == "true") return;

					var partid= element.parent().parent().attr("partid");
					scope.partid=partid;
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/deletepartsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);
                    scope.setDlg = setDlg;

					function getPartConfig(diagram, id) {
						var found = _.find(diagram.parts, function(part) {
							return part.id === id;
						});
						return found;
					}

                    scope.save = function() {
                        for(var i=0;i<scope.diagram.parts.length;i++)
                        {
                            if(scope.diagram.parts[i].id!=scope.partid) continue;

                            if(scope.partid.indexOf("percent") != -1){
								var cfg = getPartConfig(scope.diagram, scope.partid);
								var percents = global.getpara("Percents",cfg.options);

								var objs = percents.split(";");
								if(objs){
									objs.forEach(function(item){
										var obj = item.split("&");
										if(obj.length > 4 && obj[4] != "")
											AlarmLinkageService.DeleteAlarmLinkage(obj[4]);
									});
								}
                                equipmentService.ReLoadFSU();
							}

                            scope.diagram.parts.splice(i, 1);
                            break;
                        }
                        if(setDlg == null) scope.setDlg.hide();
                        else setDlg.hide();
                        scope.resetParts();
                    };
				});
			}
		}
	}
]);

nurseDirective.directive('devicestatussetter',['$modal','baseTypeService','global','balert',
    function($modal,baseTypeService,global,balert){
        return {
            restrict : 'A',
            link : function(scope,element){
                var setDlg;
                var initList = function(){
                    var obj = getPartConfig(scope.diagram, scope.partid);
                    scope.Device = {};
                    scope.Device.Name = global.getpara("Name",obj.options);
                    scope.Device.fontChart = global.getpara("FontChart",obj.options);

                    var arr = obj.binding.split("|");
                    var list = [];
                    arr.forEach(function(item){
                        if(item != "")  list.push(item);
                    });
                    scope.Device.List = angular.toJson(list);

                    baseTypeService.getDeviceList().then(function(data){
                        scope.deviceList = data;
                        scope.deviceList.forEach(function(item){
                            arr.forEach(function(a){
                                if(item.EquipmentId == a)
                                    item.isChecked = true;
                            });
                        });
                    });
                };

                function pasetDeivce(list){
                    var arr = angular.fromJson(list);
                    var result = "";
                    for(var i = 0;i < arr.length;i++){
                        result += arr[i]+"|";
                    }
                    return result;
                }

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }

                function initFunction(){
                    scope.showDeviceStatus = function(){
                        if($("#myDeviceStatus").css("display") == "block")
                            $("#myDeviceStatus").hide();
                        else
                            $("#myDeviceStatus").show();
                    };

                    scope.clickFontChart = function(fontChart){
                        scope.Device.fontChart = fontChart;
                        $("#myDeviceStatus").hide();
                    };

                    scope.checkedDeviceBox = function(item){
                        if(scope.Device.List == undefined || scope.Device.List == "")
                            scope.Device.List = [];

                        scope.Device.List = angular.fromJson(scope.Device.List);

                        if(item.isChecked == undefined || item.isChecked == false){
                            scope.Device.List.push(item.EquipmentId);
                            item.isChecked = true;
                        }else{
                            for(var i = 0;i < scope.Device.List.length;i ++){
                                if(scope.Device.List[i] == item.EquipmentId)
                                    scope.Device.List.splice(i,1);
                            }
                            item.isChecked = false;
                        }

                        scope.Device.List = angular.toJson(scope.Device.List);
                    };

                    scope.saveNewStatus = function(){
                        if(scope.Device.List == undefined || scope.Device.List == "[]" || scope.Device.List == ""){
                        	//'请选择绑定设备。'
                            balert.show('danger', scope.languageJson.Configuration.EquipmentControl.ErrorPrompt,3000);
                            return;
                        }

                        var cofg = getPartConfig(scope.diagram, scope.partid);
                        cofg.binding = pasetDeivce(scope.Device.List);
                        cofg.options = "Name:"+scope.Device.Name+"|FontChart:"+scope.Device.fontChart;
                        setDlg.hide();
                        scope.resetParts();
                    };

                    scope.empty = function(){
                        scope.deviceList.forEach(function(item){
                            item.isChecked = false;
                        });
                        scope.Device.List = "[]";
                    };
                }

                element.bind('click',function(){
                    initFunction();
                    initList();
                    var partid = element.parent().parent().attr("partid");
                    scope.partid = partid;
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/devicestatussetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);
                });
            }
        }
    }
]);

nurseDirective.directive('virtualsignalsetter',['$modal','baseTypeService','global','equipmentTemplateService','base64','ConfigureMoldService',
    function($modal,baseTypeService,global,equipmentTemplateService,base64,ConfigureMoldService){
        return {
            restrict : 'A',
            link : function(scope,element){
                var setDlg = null,bindMeaningsDlg = null;

                function init(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.virtualSignal.equipments = data;
                        scope.virtualSignal.equipmentId = scope.diagram.deviceId;
                        scope.changeEquipment(scope.diagram.deviceId);
                    });

                    /*-----  绑定开关量含义 Start  ----*/
                    scope.bindMeaningsBox = function(){
                        scope.title = scope.languageJson.Configuration.VirtualControl.Kind.Analog;//"虚拟量"
                        bindMeaningsDlg = $modal({
                            scope:scope,
                            templateUrl:'partials/bindingMeanings.html',
                            show:false
                        });
                        bindMeaningsDlg.$promise.then(bindMeaningsDlg.show);
                    };
                    scope.addMeaningsCol = function(){
                        var value = -1;
                        if(scope.DataMeanings){
                            scope.DataMeanings.forEach(function(item){
                                if(item.Value > value){
                                    value = item.Value;
                                }
                            });
                        }
                        value ++;
                        var cfg = {
                            Value : value,
                            Meanings : scope.languageJson.Configuration.VirtualControl.Meaning2
                        };//'含义'

                        if(scope.DataMeanings == undefined) scope.DataMeanings = [];
                        scope.DataMeanings.push(cfg);
                    };
                    scope.deleteMeaningsClick = function($index){
                        scope.DataMeanings.splice($index,1);
                    };
                    scope.saveMeanings = function(){
                        scope.virtualSignal.meanings = "";
                        if(scope.DataMeanings){
                            scope.DataMeanings.forEach(function(item){
                                if(scope.virtualSignal.meanings == "")
                                    scope.virtualSignal.meanings += item.Meanings;
                                else
                                    scope.virtualSignal.meanings += "/" + item.Meanings;
                            });
                        }
                        bindMeaningsDlg.hide();
                    };
                    /*-----  绑定开关量含义 End  ----*/

                    /*-----  颜色设置 Start  ---------------*/
                    var showColorSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showMoreColorBox.html',
                        show:false
                    });
                    scope.showColorSelect = function(data){
                        if(data == undefined || data == "") scope.ColorSelect = [];
                        else scope.ColorSelect = angular.fromJson(data);
                        showColorSelectDlg.$promise.then(showColorSelectDlg.show);
                    };
                    scope.addColorClick = function(){
                        scope.ColorSelect.push([1,"#ffffff"]);
                    };
                    scope.delColorClick = function($index){
                        scope.ColorSelect.splice($index,1);
                    };
                    scope.saveColorSelect = function(){
                        scope.virtualSignal.dataColor = angular.toJson(scope.ColorSelect);
                        showColorSelectDlg.hide();
                    };
                    /*-----  颜色设置 End  ---------------*/
                }

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }
                element.bind('click',function(){
                    init();
                    var partid = element.parent().parent().attr("partid");
                    scope.partid = partid;
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/virtualsignalsetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);
					setTimeout(function(){
						$("#powerFun").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.PowerFun+"</h5>");
						$("#absVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.AbsVal+"</h5>");
						$("#maxVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.MaxVal+"</h5>");
						$("#minVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.MinVal+"</h5>");
						$("#int").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.Int+"</h5>");
						$("#double").attr("data-original-title","<h5>"+scope.languageJson.Configuration.VirtualControl.Expression.Double+"</h5>");
					},500);

                    var obj = getPartConfig(scope.diagram, scope.partid);
                    scope.virtualSignal.name = global.getpara("Name",obj.options);
                    scope.virtualSignal.Expression = base64.decode(global.getpara("expr",obj.binding));
                    scope.virtualSignal.category = global.getpara("Category",obj.options);
                    if(scope.virtualSignal.category == 1)
                        scope.virtualSignal.unit = global.getpara("Unit",obj.options);
                    else{
                        var result = global.getpara("Meanings",obj.options);
                        scope.DataMeanings = [];
                        scope.virtualSignal.meanings = "";
                        var split = result.split(",");
                        split.forEach(function(item){
                            var meas = {};
                            meas.Value = item.split("-")[0];
                            meas.Meanings = item.split("-")[1];
                            scope.DataMeanings.push(meas);

                            if(scope.virtualSignal.meanings == "")
                                scope.virtualSignal.meanings += meas.Meanings;
                            else
                                scope.virtualSignal.meanings += "/"+meas.Meanings;
                        });
                    }
                    scope.virtualSignal.background = global.getpara("Background",obj.options);
                    scope.virtualSignal.fontSize = global.getpara("FontSize",obj.options) == "" ? "12" : global.getpara("FontSize",obj.options);
                    scope.virtualSignal.dataBackground = global.getpara("DataBackground",obj.options) == "" ? "2" : global.getpara("DataBackground",obj.options);
                    scope.virtualSignal.dataColor = global.getpara("DataColor",obj.options);

                    scope.changeEquipment = function(equipmentId){
                        baseTypeService.GetSinalByEquipmentId(equipmentId).then(function(data){
                            scope.virtualSignal.signals = data;
                        });
                        scope.virtualSignal.signalId = undefined;
                    };

                    scope.changeSignal = function(){
                        if(scope.virtualSignal.Expression == undefined)
                            scope.virtualSignal.Expression = "";

                        var textDom = document.getElementById("Expression");
                        var addStr = "["+scope.virtualSignal.equipmentId+"-"+scope.virtualSignal.signalId+"]";

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.virtualSignal.Expression = scope.virtualSignal.Expression.substring(0,scope.startPos)+addStr+
                                scope.virtualSignal.Expression.substring(scope.endPos);
                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            scope.virtualSignal.Expression += addStr;
                            textDom.focus();
                        }
                    };

                    scope.getCursortPosition = function() {
                        var textDom = document.getElementById("Expression");
                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.startPos = textDom.selectionStart;
                            scope.endPos = textDom.selectionEnd;
                            scope.scrollTop = textDom.scrollTop;
                        }
                    };

                    scope.ClickSignalsLi = function(symbol){
                        if(scope.virtualSignal.Expression == undefined)
                            scope.virtualSignal.Expression = "";

                        var textDom = document.getElementById("Expression");
                        var addStr = symbol;

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.virtualSignal.Expression = scope.virtualSignal.Expression.substring(0,scope.startPos)+addStr+
                                scope.virtualSignal.Expression.substring(scope.endPos);
                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            scope.virtualSignal.Expression += addStr;
                            textDom.focus();
                        }
                    };

                    scope.updNewVirtualSignal = function(){
                        if(scope.virtualSignal.Expression == undefined || scope.virtualSignal.Expression == ""){
                        	//'表达式不能为空。'
                            balert.show('danger', scope.languageJson.Configuration.VirtualControl.ErrorPrompt,3000);
                            return;
                        }
                        var cofg = getPartConfig(scope.diagram, scope.partid);
                        cofg.binding="expr:"+base64.encode(scope.virtualSignal.Expression);
                        cofg.options="Name:"+scope.virtualSignal.name+"|Category:"+scope.virtualSignal.category+getCategoryValue(scope.virtualSignal.category)
                            +"|Background:"+scope.virtualSignal.background+"|FontSize:"+scope.virtualSignal.fontSize
                            +"|DataBackground:"+scope.virtualSignal.dataBackground+"|DataColor:"+scope.virtualSignal.dataColor;

                        setDlg.hide();
                        scope.resetParts();
                    };

                    function getCategoryValue(category){
                        if(category == 1){
                            return "|Unit:"+scope.virtualSignal.unit;
                        }else{
                            var result = "";
                            if(scope.DataMeanings){
                                scope.DataMeanings.forEach(function(item){
                                    if(result == "")
                                        result += item.Value+"-"+item.Meanings;
                                    else
                                        result += ","+item.Value+"-"+item.Meanings;
                                });
                            }
                            return "|Meanings:"+result;
                        }
                    }

                });
            }
        }
    }
]);


nurseDirective.directive('setparttop', [function($modal) {
	return {
		restrict: 'A',
		link: function(scope, element) {
			function getPartConfig(diagram, id) {
				var found = _.find(diagram.parts, function(part) {
					return part.id === id;
				});
				return found;
			}
			element.bind('click', function() {
				var partid= element.parent().parent().attr("partid");
				scope.partid=partid;

				var maxcfg = _.max(scope.diagram.parts, function (part) {
					return part.zindex;
				});
				var newmax = maxcfg.zindex+1;
				if(newmax >= 998) newmax = 998;

				element.parent().parent().css("z-index",newmax);
				var cofg = getPartConfig(scope.diagram,  scope.partid);

				cofg.zindex =  newmax;

			});
		}
	}
}
]);





nurseDirective.directive("imagesignalpart", ['diagramService','global',function(diagramService,global) {
		return {
			restrict: "AE",
			replace: true,
			scope:true,
			templateUrl: "partials/imagesignalpart.html",
			link: function(scope, elem, attrs) {

				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				var currpartid=scope.partid = attrs.partid;
				scope.sigs={};
				var img=global.getpara("Img",cfg.options);
				var basetypeid=global.getpara("BS",cfg.binding);
                var deviceid = global.getpara("DI",cfg.binding);
				var bg = global.getpara("Background",cfg.options);

				var name=global.getpara("Name",cfg.options);
                if(name == "" || name == undefined)
                    elem.find(".diagram-sigimg-title-td").css("display","none");
                else
                    elem.find('strong').text(name);

                var isSignal = global.getpara("isSignal",cfg.options);
                if(isSignal == "false"){
                    elem.find('.diagram-sigimg-value-td').css("display","none");
                }

                var isImage = global.getpara("isImage",cfg.options);
                if(isImage != "false"){
                    elem.find('.diagram-sigimg-img').css({"background-image": "url('" +img + "')"});
                    var height = parseInt(elem.find('.diagram-sigimg-td').css("height")) - 55;
                    elem.find('.diagram-sigimg-img').css({'height':height+'px'});
                }else
                    elem.find(".diagram-sigimg-img-td").css("display","none");

                if((name == "" || name == undefined) && isSignal == "false")
                    elem.find('.diagram-sigimg-img').css({'margin':'10px 15px 10px 15px'});

                //背景
				if(bg == undefined)
					elem.find('.panel-body').addClass("configure_bg");
				else
					elem.find('.panel-body').addClass(bg);

				scope.$watch('binddata', function(newValue, oldValue, scope) {
					var value = _.findWhere(scope.binddata, {partId: currpartid, baseTypeId:basetypeid,deviceId:deviceid});
					if(value === undefined) return;
					if(value.alarmSeverity == 255 || value.alarmSeverity == "255")
					{
                        //elem.find('.diagram-sigimg-value').css("background-color","#5B9338");
						elem.find('.diagram-sigimg-value').removeClass("signal-value-disconnect");
						elem.find('.diagram-sigimg-value').removeClass("signal-value-alarm");
						elem.find('.diagram-sigimg-value').addClass("signal-value-normal");
                        elem.find('.diagram-sigimg-img').css({
                            "background-image": "url('" +img + "')"
                        });
					}else if(value.alarmSeverity == -255 || value.alarmSeverity == "-255" || value.alarmSeverity === ''){
                        //elem.find('.diagram-sigimg-value').css("background-color","#575A5E");
						elem.find('.diagram-sigimg-value').removeClass("signal-value-normal");
						elem.find('.diagram-sigimg-value').removeClass("signal-value-alarm");
						elem.find('.diagram-sigimg-value').addClass("signal-value-disconnect");
                        if(value.currentValue == "")
                            value.currentValue = scope.languageJson.Loading+"...";//加载中
                    }else{// 0 提示  、  1 一般  、 2 重要 、 3 紧急 告警
                        //elem.find('.diagram-sigimg-value').css("background-color","#A02B31");
						elem.find('.diagram-sigimg-value').removeClass("signal-value-normal");
						elem.find('.diagram-sigimg-value').removeClass("signal-value-disconnect");
						elem.find('.diagram-sigimg-value').addClass("signal-value-alarm");
                        var tempimg=img.split('.');
                        var alarmimg=tempimg[0]+".gif";
                        elem.find('.diagram-sigimg-img').css({
                            "background-image": "url('" +alarmimg + "')"
                        });
					}
					elem.find('.diagram-sigimg-value').text(value.currentValue);
				});

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);

nurseDirective.directive("devicestatuspart",['diagramService','global','$stateParams','$state','$compile',
    function(diagramService,global,$stateParams,$state,$compile){
        return {
            restrict:"AE",
            replace:true,
            scope:true,
            templateUrl:"partials/devicestatuspart.html",
            link:function(scope,elem,attrs){
                var cfg = diagramService.initPart(scope, elem, attrs);
                if (cfg === undefined) return;
                var currpartid = scope.partid = attrs.partid;
                var name = global.getpara("Name",cfg.options);
                var fontChart = global.getpara("FontChart",cfg.options);

                elem.find(".status-title strong").text(name);
                elem.find(".status-font-chart i")[0].className = "fa "+fontChart+" fa-fw alarmLevel1";

                scope.$watch('binddata', function(newValue, oldValue, scope) {
                    var value = _.findWhere(scope.binddata, {partId: currpartid});
                    if(value == undefined) return;

                    var text = "---";
                    if(value.currentValue == "Disconnect"){
                        /*elem.find('.diagram-sigimg-value').css("background-color","#575A5E");
                        text = "已中断";*/
                        elem.find('.status-value i')[0].className = "fa fa-minus-circle alarmLevel9";
                    }else if(value.currentValue == "Alarm"){
                        /*elem.find('.diagram-sigimg-value').css("background-color","#A02B31");
                        text = "有告警";*/
                        elem.find('.status-value i')[0].className = "fa fa-exclamation-circle alarmLevel3";
                    }else if(value.currentValue == "Normal"){
                        /*elem.find('.diagram-sigimg-value').css("background-color","#5B9338");
                        text = "正常";*/
                        elem.find('.status-value i')[0].className = "fa fa-check-circle alarmLevel0";
                    }
                    //elem.find('.diagram-sigimg-value').text(text);
                });

                scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
                    diagramService.updateEditStatus(elem, newValue);
                });

                scope.skipDevice = function(){
                    var value = _.findWhere(scope.binddata, {partId: currpartid});
                    if(value == undefined || value.deviceId == undefined || value.baseTypeId == undefined) return;
                    var cfg = {};
                    cfg.diagram = {};
                    cfg.diagram.page = {};

                    cfg.diagram.deviceBaseTypeId = value.baseTypeId;
                    cfg.diagram.deviceId = value.deviceId;
                    cfg.diagram.page.bgImage = "img/bg.jpg";

                    sessionStorage.setItem("currDeviceId",value.deviceId);

                    $stateParams.deviceBaseTypeId = value.baseTypeId;
                    $stateParams.diagramview = 'device.diagram';
                    $state.go($stateParams.diagramview, cfg);
                }
            }
        };
    }
]);

nurseDirective.directive("virtualsignalpart",['diagramService','global',
    function(diagramService,global){
        return {
            restrict:"AE",
            replace:true,
            scope:true,
            templateUrl:"partials/virtualsignalpart.html",
            link:function(scope,elem,attrs){
                var cfg = diagramService.initPart(scope, elem, attrs);
                if (cfg === undefined) return;
                var currpartid = scope.partid = attrs.partid;
                var name = global.getpara("Name",cfg.options);
                var category = global.getpara("Category",cfg.options);
                var result = "";
                if(category == 1)
                    result = global.getpara("Unit",cfg.options);
                else
                    result = global.getpara("Meanings",cfg.options);
                //背景样式
                var background = global.getpara("Background",cfg.options);
                elem.find(".panel-body").addClass(background);
                //字体大小
                var fontSize = global.getpara("FontSize",cfg.options);
                parseFontSize(fontSize);
                var dataBackground =  global.getpara("DataBackground",cfg.options);
                var dataColor =  global.getpara("DataColor",cfg.options);

                elem.find(".diagram-sigimg-title strong").text(name);

                scope.$watch('binddata', function(newValue, oldValue, scope) {
                    var value = _.findWhere(scope.binddata, {partId: currpartid});
                    if(value == undefined) return;

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


                    var color = parseDataColor(dataColor,value.currentValue);
                    elem.find('.diagram-sigimg-value').css("color",color);

                    if(category == 1)
                        elem.find('.diagram-sigimg-value').text(value.currentValue+" "+result);
                    else{
                        var split = result.split(",");
                        split.forEach(function(item){
                            var val = item.split("-")[0];
                            var mes = item.split("-")[1];
                            if(parseInt(value.currentValue) == parseInt(val) || value.currentValue == val)
                                elem.find('.diagram-sigimg-value').text(mes);
                        });
                    }
                });

                function parseDataColor(colors,value){
                    if(colors == undefined || colors == "") return "#ffffff";

					var style = localStorage.getItem("systemStyle");

                    var cols = angular.fromJson(colors);
                    var min = [999,"#ffffff"];
                    if(style == "White")
						min = [999,"#000000"];

                    if(cols){
                        cols.forEach(function(item){
                            if(value <= item[0]){
                                if(item[0] <= min[0]) min = item;
                            }
                        });
                    }
                    return min[1];
                }

                function parseFontSize(size){
                    elem.find(".panel-body").css("font-size",size+"px");
                    if(parseInt(size) > 20){
                        elem.find(".diagram-sigimg-value").css("height",(parseInt(size)+10)+"px");
                        elem.find(".diagram-sigimg-value").css("line-height",(parseInt(size)+10)+"px");
                    }
                }

                scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
                    diagramService.updateEditStatus(elem, newValue);
                });
            }
        };
    }
]);





nurseDirective.directive("labelpart", ['diagramService','global',
	function(diagramService,global) {
		return {
			restrict: "AE",
			replace: true,
			templateUrl: "partials/labelpart.html",
			link: function(scope, elem, attrs, modelCtrl) {

				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				scope.partid = attrs.partid;
                var body = elem.find('div.panel-body');
				var el = elem.find('td');
				var currpartid=attrs.partid;
				if(cfg.options!=undefined)
				{
					scope.changeOptions=cfg.options;
					setLabel(scope.changeOptions);
				}


				function activesignal(data) {
					var signal = data.replace('{', '').replace('}', '').split('-');
					setInterval(function(){
						var result = "";
                        var value = _.findWhere(scope.binddata, {partId: currpartid, baseTypeId: signal[1],deviceId:signal[0]});
						if(value===undefined){
                            var name = scope.changeOptions.split('|')[0].split(':')[1];
                            el.text(name);
							return;
                        }
						try{
                            eval("result=value.currentValue");
                        }catch(e){}
						el.text(result);
					},3000);
				}

				function setLabel(options) {
					if(scope.partid !=currpartid) return;
					if(options!=null){
						var attrs=options.split('|');
							for(var i=0;i<attrs.length;i++) {
								var attr=attrs[i].split(':');
								var type=attr[0];
								var value=attr[1];
								switch (type) {
									case "Name":
										if (value.indexOf('{') != -1)
										{
											activesignal(global.getpara("Name",options));
											break;
										}
										el.text(value);
										break;
									case "FontSize":
										el.css({ "font-size":value+"px"});
										break;
									case "FontWeight":
										el.css({ "font-weight":value});
										break;
									case "Color":
										el.css({ "color":value});
										break;
									case "BackColor":
										el.css({ "background-color":value});
										break;
                                    case "BackStyle":
                                        body.addClass(value);
                                        break;
									case "TextAlign":
										el.css({ "text-align":value});
										break;
								}
						}
					}
				}


				scope.$watch('changeOptions',function(newValue,oldValue){
					setLabel(newValue);
				});

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);




nurseDirective.directive('labelpartsetter', ['$modal','baseTypeService','balert','ConfigureMoldService',
	function($modal,baseTypeService,balert,ConfigureMoldService) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
                var setDlgs = null;
                scope.data = {};

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});

					return found;
				}

                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;
                        scope.Topology.DeviceId = scope.deviceList[0].equipmentId;
						selectOption();

                        baseTypeService.getSignalBaseTypesByDeviceType(scope.Topology.DeviceId).then(function(datas) {
                            scope.data.devices = datas;
                        });
                    });
                }
                /*********************************************************************/

				//show list
				function initList() {
					var labelcfg = getPartConfig(scope.diagram, scope.partid);
					scope.labelcfg=labelcfg;

					if(labelcfg.options!=null)
					{
						var attrs=labelcfg.options.split('|');
						for(var i=0;i<attrs.length;i++)
						{
							var attr=attrs[i].split(':');
							var type=attr[0];
							var value=attr[1];
							eval("labelcfg."+type+"='"+value+"'");
						}
					}
				}

				//根据文本内容选择信号
				function selectOption(){
					var patt = /\{\d*\-\d*\}/;
					scope.selectId = undefined;
					if(scope.labelcfg.Name != undefined && patt.test(scope.labelcfg.Name)){
						var content = scope.labelcfg.Name;
						var sIndex = content.indexOf("-") + 1;
						var eIndex = content.lastIndexOf("}");
						scope.Topology.DeviceId = content.substring(1,sIndex-1);
						scope.selectId = content.substring(sIndex,eIndex);
					}
				}

				element.bind('click', function() {
					var partid= element.parent().parent().attr("partid");
					scope.partid=partid;
					initList();
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/labelpartsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);

                    scope.changeDevice = function(id){
                        baseTypeService.getSignalBaseTypesByDeviceType(id).then(function(data) {
                            scope.data.devices = data;
                        });
                    };

					scope.save = function() {
                        if(scope.labelcfg.Name == undefined){
                            scope.labelcfg.Name = "";
                        }
						var cofg = getPartConfig(scope.diagram,  scope.partid);
						var options="Name:"+scope.labelcfg.Name+"|FontSize:"+scope.labelcfg.FontSize+
                            "|FontWeight:"+scope.labelcfg.FontWeight+"|TextAlign:"+scope.labelcfg.TextAlign+"|Color:"+scope.labelcfg.Color+
                            "|BackColor:"+(scope.labelcfg.BackColor===undefined?"":scope.labelcfg.BackColor)+
                            "|BackStyle:"+(scope.labelcfg.BackStyle===undefined?"":scope.labelcfg.BackStyle);
						cofg.options=scope.changeOptions=options;
                        var signal = scope.labelcfg.Name.replace('{', '').replace('}', '').split('-');
                        cofg.binding = signal.length == 1 ? "BS:0" : "BS:"+signal[1]+"|DI:"+signal[0];
						setDlg.hide();
					};

				});

                scope.bindingDlg = function(){
                    initDevice();
					selectOption();
                    setDlgs = $modal({
                        scope: scope,
                        templateUrl: 'partials/bindingDlg.html',
                        show: false
                    });
                    setDlgs.$promise.then(setDlgs.show);

					scope.deleteBind = function(){
						scope.labelcfg.Name = "";
						setDlgs.hide();
					};
                    scope.ok = function(){
                    	if(scope.data.selecteds == undefined) return;
                    	var data = angular.fromJson(scope.data.selecteds[0]);
                        //deviceBaseTypeId => EquipmentId
                        scope.labelcfg.Name = "{"+data.deviceBaseTypeId+"-"+data.baseTypeId+"}";
                        setDlgs.hide();
                    };
                };
			}
		}
	}
]);



nurseDirective.directive('camerapartsetter', ['$modal','CameraService','global',
	function($modal,CameraService,global) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var setDlg = null;
				scope.camerachecked={};
				scope.cameralist =new Array();
				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});
					return found;
				}

				function init(){
					CameraService.getAllVideoEquipment().then(function(data) {
						scope.cameralist=new Array();
						var cameradata = eval(data);
						for(var x in cameradata){
							for(var y in cameradata[x].cameraJson){
								var camera ={};
								camera.cameraname = cameradata[x].equipmentName+ "-"+cameradata[x].cameraJson[y].cameraName;
								camera.id=cameradata[x].equipmentId +'_'+cameradata[x].cameraJson[y].cameraId;
								scope.cameralist.push(camera);
							}
						}
						var cofg = getPartConfig(scope.diagram,  scope.partid);
						scope.camerachecked.item=global.getpara("cameraid",cofg.options);
					});
				}

				element.bind('click', function() {

					var partid= element.parent().parent().attr("partid");
					scope.partid=partid;
					init();
					setDlg = $modal({
						scope: scope,
						templateUrl: 'partials/camerapartsetter.html',
						show: false
					});
					setDlg.$promise.then(setDlg.show);

					scope.update = function() {
						if(scope.camerachecked.item==undefined){
							//'请选择需绑定的视频。'
							balert.show('warning', scope.languageJson.Configuration.VideoControl.ErrorPrompt,2000);
							return;
						}
						var cofg = getPartConfig(scope.diagram,  scope.partid);
						var option="Img:img/diagram/camera.png|cameraid:"+scope.camerachecked.item;
						cofg.options=option;
						setDlg.hide();
					};

				});


			}
		}
	}
]);




nurseDirective.directive("tablepart",['diagramService','global','$compile',
	function(diagramService,global,$compile) {
		return {
			restrict: "AE",
			replace: true,
			templateUrl: "partials/tablepart.html",
			link: function (scope, elem, attrs) {

				function handledrows(head,rowsdata,style){
                    if(style != undefined && style != ""){
                        elem.find(".panel-body").removeClass("configure_bg");
                        elem.find(".panel-body").addClass(style);
                    }

					var headarry=head.split(',');
					var rows=rowsdata.split('&');
					var tempvar = "";
					var result = "";
					var tr="<tr class='ng-table-sort-header'>@</tr>";
                    var str = "";
					for(var i=0;i<headarry.length;i++){
						tempvar+="<td>"+headarry[i]+"</td>";
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
								tempvar += "<td class='pointer "+resultColorClass(tds[j])+"' "+resultClickInfo(tds[j])+">" + getBindValue(tds[j]) + "</td>";
						}
						result+=tr.replace('@',tempvar);
					}
                    var containerDiv = elem.find('.table');
                    $compile(result)(scope).appendTo(containerDiv);
				}

                function resultClickInfo(signalbind){
                    var signal=signalbind.replace('{','').replace('}','').split(':');
                    var signalName = signal[0];
                    var baseTypeId = signal[1];
                    var deviceId = scope.diagram.deviceId;
                    return "ng-click=\"showHistoryChart(\'"+deviceId+"\',\'"+baseTypeId+"\',\'"+signalName+"\')\"";
                }

                function getBindValue(signalbind){
                    var signal=signalbind.replace('{','').replace('}','').split(':');
                    var baseTypeId = signal[1];
                    return "{{tableValue('"+currpartid+"','"+baseTypeId+"')}}";
                }
				function getBindClass(signalbind){
                    var signal=signalbind.replace('{','').replace('}','').split(':');
                    var baseTypeId = signal[1];
                    return "{{tableClass('"+currpartid+"','"+baseTypeId+"')}}";
                }

                scope.tableValue = function(partId,baseTypeId){
                    var value=_.findWhere(scope.binddata, {partId:partId,baseTypeId:baseTypeId});
                    if(value==undefined) return "loading..." ;
                    return value.currentValue == undefined ? "" : value.currentValue;
                };

				function resultColorClass(signalbind){
					var signal=signalbind.replace('{','').replace('}','').split(':');
					var baseTypeId = signal[1];
					return "{{colorClass(\""+currpartid+"\",\""+baseTypeId+"\")}}";
				}
				scope.colorClass = function(partId,baseTypeId){
					var value=_.findWhere(scope.binddata, {partId:partId,baseTypeId:baseTypeId});
					if(value==undefined) return "" ;
					if(parseInt(value.alarmSeverity) >= 0 && parseInt(value.alarmSeverity) <= 3 )
						return "alarmLevel3";
					else
						return "";
				};


				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				scope.partid = attrs.partid;
				var currpartid=attrs.partid;
				var head=global.getpara("Head",cfg.options);
				var rows=global.getpara("Rows",cfg.options);
                var style = global.getpara("Style",cfg.options);
				handledrows(head,rows,style);


				/*setInterval(function(){
					if (scope.binddata === undefined) return;
					handledrows(head,rows,style);
				},3000);*/


				scope.$watch('diagram.edit', function (newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}]);



nurseDirective.directive("gaugepart", ['diagramService','global',
	function(diagramService,global) {
		return {
			restrict: "AE",
			replace: true,
			templateUrl: "partials/gaugepart.html",
			link: function(scope, elem, attrs, modelCtrl) {
				function gaugeechart(controlattr)
				{
					var chartobj = elem.find('.gauge')[0];
					var gaugechart=echarts.init(chartobj);
					var timeTicket;
					var cmax=global.getpara("Max",controlattr);
                    var mins = global.getpara("Min",controlattr);
                    var cmin = mins=="" || isNaN(mins) ? 0 : mins;
					var cname=global.getpara("Name",controlattr);
					//var option = {tooltip : {formatter: "{b} : {c}"},series : [{type:'gauge',splitNumber: 5,axisLine: {lineStyle: {color: [[0.2, '#228b22'],[0.8, '#48b'],[1, '#ff4500']], width: 2}},axisTick: {splitNumber: 20,length :5,lineStyle: {color: 'auto'}},axisLabel: {textStyle: {color: 'auto'}},splitLine: {show: true,length :13,lineStyle: {color: 'auto'}},pointer : {width : 5},title : {show : true,offsetCenter: [0, '30%'],textStyle: {fontWeight: 'bolder'}},detail : {formatter:'{value}',textStyle: {color: 'auto',fontWeight: 'bolder'}}, center:['50%', '60%'], max:cmax,data:[{value: 50, name:cname}]}]};
					//var option={tooltip : {formatter: "{a} <br/>{b} : {c}%"},series : [{name:cname,type:'gauge',splitNumber: 5,detail : {formatter:'{value}'}, splitLine: {show: true,length :13,lineStyle: {color: '#11B8BB'}},axisLine: {lineStyle: {color: [[0.09, '#11B8BB'],[0.82, '#11B8BB'],[1, '#11B8BB']],width: 2,shadowColor : '#3AC3C6',shadowBlur: 20}},axisLabel: {textStyle: {fontWeight: 'bolder',color: '#fff',shadowColor : '#fff',shadowBlur: 12}},title : {show : true,offsetCenter: [0, '98%'],textStyle: {color:'#fff'}}, pointer : {width : 4},max:cmax,data:[{value: 0, name:cname}]}]};
					var option={backgroundColor: '#293646',  boundaryGap:false,tooltip: {formatter: "{c} {b}"},series: [{type: 'gauge',center: ['50%','50%'],min: cmin,max: cmax,splitNumber: 5,axisLine: {lineStyle: {color: [[0.09,'#0084D7'],[0.82,'#0084D7'],[1,'#0084D7']],width: 0,shadowColor: '#fff',shadowBlur: 10}},axisLabel: {textStyle: {color: '#fff',shadowColor: '#fff',shadowBlur: 7,fontSize:7}},axisTick: {length: 5,lineStyle: {color: 'auto',shadowColor: '#fff',shadowBlur: 10,width: 2}},splitLine: {length: 8,lineStyle: {width: 3,color: '#fff',shadowColor: '#fff',shadowBlur: 10}},pointer: {shadowColor: '#fff',    shadowBlur: 3,width: 3},title: {show: true,offsetCenter: ['0%','65'],textStyle: {fontWeight: 'bolder',fontSize: 13,color: '#fff'}},detail: {show: true,offsetCenter: ['0%','40%'],    textStyle: {fontSize:14,fontWeight: 'bolder',color: '#fff'}},data: [{value: 0,name: cname}]}]};




					gaugechart.setOption(option, true);

					setInterval(function (){
						if( scope.binddata==undefined)return;
						var signal=_.findWhere(scope.binddata, {partId:currentpartid});
						if(!signal)return;
						var value= signal.currentValue;
                        if(isNaN(parseFloat(value)))
                            value = cmin;
						option.series[0].data[0].value = parseFloat(value);

						try{
							window.onresize = gaugechart.resize(); //使第一个图表适应
							gaugechart.setOption(option, true);
						}catch(e){
							console.log("EChart Error:"+e.message);
						}
					},3000);

				}

				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				var currentpartid=scope.partid = attrs.partid;
				gaugeechart(cfg.options);

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		};
	}
]);

nurseDirective.directive("piechartpart", ['diagramService','global','$http','Exporter','$modal','MdcAlarmService',
    function(diagramService,global,$http,Exporter,$modal,MdcAlarmService) {
        return {
            restrict: "AE",
            replace: true,
            templateUrl: "partials/piechartpart.html",
            link: function(scope, elem, attrs, modelCtrl) {
                var cfg = diagramService.initPart(scope, elem, attrs);
                if (cfg === undefined) return;
                var chartobj = elem.find('.pie')[0];
                var piechart = echarts.init(chartobj);
                var currpartid=scope.partid = attrs.partid;
				//圆环进度条
				var cirRoot = elem.find('.circle')[0];
				var cirVal = elem.find('.circle .circle-value')[0];
				var cirName = elem.find('.circle .circle-name')[0];
				var circle = undefined;

                var ChartCfg = {};
                ChartCfg.Title = global.getpara("Title",cfg.options);
                ChartCfg.DataType = global.getpara("DataType",cfg.options);
                ChartCfg.ChartType = global.getpara("ChartType",cfg.options);
                ChartCfg.LineColor = global.getpara("LineColor",cfg.options);
				ChartCfg.LineImages = global.getpara("LineImages",cfg.options);
                ChartCfg.Y1Name = global.getpara("Y1Name",cfg.options);
                ChartCfg.Y1Min = global.getpara("Y1Min",cfg.options);
                ChartCfg.Y1Max = global.getpara("Y1Max",cfg.options);
				ChartCfg.Background = global.getpara("Background",cfg.options);
                if(ChartCfg.ChartType == 'pie'){
					ChartCfg.PieColor = global.getpara("PieColor",cfg.options);
					ChartCfg.PieValueType = global.getpara("PieValueType",cfg.options);
					ChartCfg.Unit = global.getpara("Unit",cfg.options);
					ChartCfg.Meaning = global.getpara("Meaning",cfg.options);
				}

				if(ChartCfg.ChartType != 'newGauge')
					cirRoot.style.display = "none";

				if(ChartCfg.DataType != 7)
					elem.find(".avg-max-min").hide();

				//标题
                if(ChartCfg.Title == undefined || ChartCfg.Title == "")
					elem.find(".isShow").hide();
                else
					elem.find(".title").html(ChartCfg.Title);

                //linux系统隐藏导出按钮
                if(window.navigator.userAgent.indexOf("Windows") == -1)
                    elem.find(".isShow i").hide();

                //背景
				if(ChartCfg.Background == undefined)
					elem.find(".panel-body").addClass("configure_bg");
				else
					elem.find(".panel-body").addClass(ChartCfg.Background);

                if(ChartCfg.DataType != 2)
                    elem.find(".pue").css("display","none");

                var chartOption = {};
                getOption(ChartCfg,cfg.binding);

                //nWidth:DIV宽度 nHeight:DIV高度  raw:默认大小
                function getChartPercent(nWidth,nHeight,raw){
                    if(nWidth > nHeight){
                        return nHeight/raw;
                    }else{
                        return nWidth/raw;
                    }
                }

                function getOption(ChartCfg,binding){
                    chartOption = {};
                    var per = getChartPercent(chartobj.clientWidth,chartobj.clientHeight,300);
                    var fontSize = per*26 > 20 ? 20 : per*26;
                    elem.find(".title").css("fontSize",fontSize+"px");
                    var sysStyle = localStorage.getItem("systemStyle");
                    if(ChartCfg.ChartType == 'line'){//曲线图与条形图
                        $http.get("data/LineOrBarCharts.json").success(function(data) {
                            var opt = data;
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
                            opt.yAxis[0].min = ChartCfg.Y1Min;
                            opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;

                            var colorArr = ["rgba(255, 127, 80, 0.6)","rgba(135, 206, 250, 0.6)","rgba(193, 35, 43, 0.6)","rgba(252, 206, 16, 0.6)","rgba(155, 202, 99, 0.6)"];

                            var arr = binding.split("&");
                            var index = 0;
                            for(var i = 1;i < arr.length;i++){
                                if(arr[i].indexOf("BS") == -1) continue;

                                var series = {
                                    name : '',
                                    type : ChartCfg.ChartType,
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
                                            {type : "max", name: scope.languageJson.Configuration.ActiveChartControl.Function.MaxVal},
                                            {type : "min", name: scope.languageJson.Configuration.ActiveChartControl.Function.MinVal}
                                        ]
                                    }
                                };//"最大值" / "最小值"
                                index ++;
                                if(index >= colorArr.length) index = 0;

                                opt.series.push(series);
                            }

                            //默认值
                            opt.xAxis[0].data[0]= ["加载中......"];
                            chartOption = opt;

							try {
								window.onresize = piechart.resize(); //使第一个图表适应
								piechart.setOption(chartOption, true);
							}catch(e){
								console.log("EChart Error:"+e.message);
							}
                        });
                    }else if(ChartCfg.ChartType == 'bar'){
                        $http.get("data/BarCharts.json").success(function(data){
                            var opt = data;

                            if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
                                opt.title.textStyle.color = "#464952";
                                opt.xAxis[0].axisLabel.textStyle.color = "#464952";
                                opt.yAxis[0].axisLabel.textStyle.color = "#464952";
                            }

                            //隐藏Y轴
                            if(ChartCfg.Y1Name == "false")
                                opt.yAxis[0].show = false;
                            else
                                opt.yAxis[0].name = ChartCfg.Y1Name;
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

                            chartOption = opt;

                            try {
                                window.onresize = piechart.resize(); //使第一个图表适应
                                piechart.setOption(chartOption, true);
                            }catch(e){
                                console.log("EChart Error:"+e.message);
                            }
                        });
                    }else if(ChartCfg.ChartType == 'pie'){//饼图
                        if(ChartCfg.DataType == 1){
                            $http.get("data/PieCharts.json").success(function(data){
                                var opt = data;
                                if(sysStyle == "White" && ChartCfg.Background != "gray_bg") {
                                    opt.title.textStyle.color = "#464952";
                                    opt.series[0].itemStyle.normal.label.textStyle.color = "#464952";
                                }

                                opt.series[0].radius = [per*20,"55%"];
                                opt.series[0].name = ChartCfg.Y1Name;

                                //默认值
								opt.series[0].data[0].value = 1;
								opt.series[0].data[0].name = '';
								opt.series[0].data[1].value = 0;
								opt.series[0].data[1].name = '';
                                chartOption = opt;

								try {
									window.onresize = piechart.resize(); //使第一个图表适应
									piechart.setOption(chartOption, true);
								}catch(e){
									console.log("EChart Error:"+e.message);
								}
                            });
                        }else{
                            $http.get("data/PercentPieCharts.json").success(function(data){
                                var opt = data;
                                if(sysStyle == "White" && ChartCfg.Background != "gray_bg") {
                                    opt.title.textStyle.color = "#464952";
                                    opt.series[0].data[0].itemStyle.normal.label.textStyle.color = "#464952";
                                    opt.series[0].data[1].itemStyle.normal.label.textStyle.color = "#464952";
                                }

                                //opt.series[0].data[0].name = "未使用";
								if(ChartCfg.PieValueType == "val") {
									if(ChartCfg.Unit == undefined || ChartCfg.Unit == "")
										opt.series[0].data[1].name = "";
									else
										opt.series[0].data[1].name = scope.languageJson.Configuration.ActiveChartControl.Chart.Unit + ChartCfg.Unit;/*"Unit:"*/
								}else if(ChartCfg.PieValueType == "sw"){
									opt.series[0].data[1].name = "";
								}else
									opt.series[0].data[1].name = scope.languageJson.Configuration.ActiveChartControl.Chart.Used;//"已使用" / ChartCfg.Y1Name;

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
								//opt.series[0].data[1].name = '';
                                chartOption = opt;

								try {
									window.onresize = piechart.resize(); //使第一个图表适应
									piechart.setOption(chartOption, true);
								}catch(e){
									console.log("EChart Error:"+e.message);
								}
                            });
                        }
                    }else if(ChartCfg.ChartType == 'newGauge'){//新仪表盘
						var body = elem.find('.panel-body')[0];
						per = getChartPercent(body.clientWidth,body.clientHeight,300);
                    	var size = per * 300;
                    	var radius = per * 100;
                    	var small = per * 20;
						fontSize = per*42;
						var fine1 = 10 * per;
						var fine2 = 5 * per;

						//仪表盘下显示单位
						/*var cirName = elem.find('.circle .circle-name')[0];
						cirName.innerHTML = ChartCfg.Y1Name;
						cirName.style.width = size + "px";*/
						
						var circleGauge = elem.find('.new_gauge')[0];
						//隐藏ECharts的DIV
						chartobj.style.display = "none";
						//设置样式
						cirRoot.style.fontSize = fontSize + "px";
						cirRoot.style.width = size + "px";
						if(ChartCfg.Title == "")
							cirVal.style.top = (size / 2) + "px";
						else
							cirVal.style.top = ((size / 2) + 34) + "px";
						cirVal.style.width = size + "px";
						cirName.style.width = size + "px";

						cirVal.style.lineHeight = fontSize + "px";
						cirName.style.lineHeight = fontSize + "px";

						circleGauge.width = size;
						circleGauge.height = size;
						//设置背景图
						circleGauge.style.backgroundImage = "url('/img/diagram/"+ChartCfg.LineImages+".png')";
						circleGauge.style.backgroundSize = size+'px';

						//设置圆环进度条的参数
						circle = CircleProcess(circleGauge,{
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
					}else{//仪表盘
                        $http.get("data/GaugeCharts.json").success(function(data){
                            var opt = data;
                            if(sysStyle == "White" && ChartCfg.Background != "gray_bg") {
								opt.title.textStyle.color = "#464952";
							}

                            opt.series[0].name = ChartCfg.Y1Name;
                            opt.series[0].min = parseFloat(ChartCfg.Y1Min);
                            opt.series[0].max = parseFloat(ChartCfg.Y1Max);
                            opt.series[0].axisLine.lineStyle.color = eval(ChartCfg.LineColor);
                            if(ChartCfg.DataType == 2)
                                opt.series[0].axisLabel.formatter = function (value, index) {
                                    return value.toFixed(2);
                                };
                            opt.series[0].radius = per*210;
                            opt.series[0].axisLine.lineStyle.width = per*30;
                            opt.series[0].axisLabel.textStyle.fontSize = per*20;
                            opt.series[0].pointer.width = per*12;
                            opt.series[0].title.textStyle.fontSize = per*30;

                            //默认值
							opt.series[0].data[0].value = 0;
							opt.series[0].data[0].name = '';
                            chartOption = opt;

                            //AVG位置
							if(ChartCfg.DataType == 7){
								opt.series[0].center = ["65%", "70%"];
								opt.series[0].radius =  per*170;
								elem.find(".avg-max-min .value").css("font-size",per*30+"px");
								elem.find(".avg-max-min .name").css("font-size",per*15+"px");

								elem.find('.max .value').html("0.0");
								elem.find('.min .value').html("0.0");
							}

							try {
								window.onresize = piechart.resize(); //使第一个图表适应
								piechart.setOption(chartOption, true);
							}catch(e){
								console.log("EChart Error:"+e.message);
							}
                        });
                    }
                }

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

                function initPieChats(list,currpartid,binddata,dataType,chartType,y1Name,PieValueType,meanings){
                    if(chartOption.series == undefined && chartType != 'newGauge') return;
                    if(dataType == 1){
                        var opt = [];
                        list.forEach(function(item){
                            var value = _.findWhere(binddata, {partId: currpartid,deviceId:item.deviceId,baseTypeId:item.baseTypeId});
                            if(value == undefined || value.currentValue == undefined || value.currentValue == "") return;
                            opt.push(value);
                        });
                        if(chartType == 'line'){
                            if(opt.length > 0){
                                chartOption.yAxis[0].axisLabel.formatter = '{value}';
                            }

                            var legendData = [];
                            var maxSize = 0;
                            for(var i = 0;i < chartOption.series.length;i++){
                                var cfg = angular.fromJson(opt[i].currentValue);
                                chartOption.series[i].data = cfg.data;
                                if(chartType == 'line') {
									chartOption.series[i].name = opt[i].deviceName + ' ' + opt[i].baseTypeName;
									legendData.push(opt[i].deviceName+' '+opt[i].baseTypeName);
								}else{
									chartOption.series[i].name = opt[i].deviceName;
									//legendData.push(opt[i].deviceName);
								}
                                if(cfg.date.length > maxSize){
                                    maxSize = cfg.date.length;
									chartOption.xAxis[0].data = cfg.date;
                                }
                            }
                            chartOption.legend.data = legendData;

                            chartOption.tooltip = {
                                trigger: 'axis',
                                formatter: function(params) {
									var result = "";
									if(chartType == 'line'){
										result = scope.languageJson.Configuration.ActiveChartControl.Chart.Time+' : '+params[0].name + '<br/>';
										for(var i = 0;i < params.length;i++){
											result += opt[i].deviceName+' '+opt[i].baseTypeName  + ' : ' + params[i].value + ' ' + opt[i].unit + '<br/>';
										}
									}else{
										result = params[0].name + '<br/>';
										for(var i = 0;i < params.length;i++){
											result += opt[i].deviceName  + ' : ' + params[i].value + ' ' + opt[i].unit + '<br/>';
										}
									}
                                    return result;
                                }
                            };//采集时间

                        }else if(chartType == 'bar'){//柱形图
                            if(opt.length == 0) return;

                            var names = [];
                            var datas = [];
                            opt.forEach(function(item){
                                var cfg = angular.fromJson(item.currentValue);
                                names.push(cfg.date[0]);
                                datas.push(cfg.data[0]);
                            });

                            chartOption.xAxis[0].data = names;
                            chartOption.series[0].data = datas;

                            var s = angular.toJson(chartOption);
                        }else if(chartType == 'pie'){//饼图
                            var data = [];
                            opt.forEach(function(item){
                                var cfg = {};
                                cfg.value = item.floatValue;
                                cfg.name = item.deviceName;
                                data.push(cfg);
                            });
                            chartOption.series[0].data = data;
                        }else if(chartType == 'gauge'){//仪表盘
                        	if(opt.length == 0) return;
                            chartOption.series[0].data[0].value = opt[0].floatValue;
                            chartOption.series[0].data[0].name = opt[0].signalName +" = "+opt[0].currentValue;
                        }else if(chartType == 'newGauge'){//新仪表盘
							if(opt.length == 0) return;
							runCircle(opt[0].floatValue,y1Name);
						}
                    }else{
                        var value = _.findWhere(binddata, {partId: currpartid});
                        if(value == undefined || value.currentValue == undefined || value.currentValue == "") return;

                        if(chartType == 'gauge'){//仪表盘
                        	if(dataType == 7){//平均值  最大值  最小值
								var cfg = angular.fromJson(value.currentValue);
								chartOption.series[0].data[0].value = cfg.avg;
								chartOption.series[0].data[0].name = "AVG = "+cfg.avg+" "+cfg.unit;

								elem.find('.max .value').html(cfg.max+" "+cfg.unit);
								elem.find('.min .value').html(cfg.min+" "+cfg.unit);

							}else if(dataType != 6){
                                chartOption.series[0].data[0].value = value.currentValue;
                                if(dataType == 2)//实时PUE
                                    chartOption.series[0].data[0].name = "PUE = "+value.currentValue;
                                if(dataType == 3)//实时MDC功率
                                    chartOption.series[0].data[0].name = scope.languageJson.Configuration.ActiveChartControl.Chart.Power+" = "+value.currentValue+" kW";//功率
                            }else{//其他
                                var cfg = angular.fromJson(value.currentValue);
                                chartOption.series[0].data[0].value = cfg.value;
                                chartOption.series[0].data[0].name = y1Name+" = "+cfg.value;
                            }
                        }else if(chartType == 'newGauge'){//新仪表盘
                        	var val = 0;
                        	try{
								var cfg = angular.fromJson(value.currentValue);
								val = cfg.value;
							}catch (e) {
								val = value.floatValue;
							}
							runCircle(val,y1Name);
						}else{//饼图
                            var cfg = angular.fromJson(value.currentValue);

                            chartOption.series[0].data[0].value = cfg.other;
                            chartOption.series[0].data[1].value = cfg.usage;
                            if(PieValueType == "val"){
								chartOption.series[0].itemStyle.normal.label.formatter = cfg.value;
								if(y1Name != "")
									chartOption.title.text = y1Name;
							}else if(PieValueType == "sw"){
                            	var meaning = getMeaningByValue(cfg.value,meanings);
								chartOption.series[0].data[0].name = meaning;
								chartOption.title.text = y1Name;
							}else{
								chartOption.series[0].itemStyle.normal.label.formatter = cfg.usage+' %';
								if(y1Name != "")
									chartOption.title.text = y1Name+" = "+cfg.value;
							}
                        }
                    }

					try {
						window.onresize = piechart.resize(); //使第一个图表适应
						piechart.setOption(chartOption, true);
					}catch(e){
						console.log("EChart Error:"+e.message);
					}
                }

                function runCircle(value,y1Name){
					value = parseFloat(value);
					var min = parseFloat(ChartCfg.Y1Min);
					var max = ChartCfg.Y1Max == "auto" ? 100 : parseFloat(ChartCfg.Y1Max);
					var section = max - min;
					var per = (value / section) * 100;

					cirVal.innerHTML = value;
					cirName.innerHTML = y1Name;

					circle.option.percent = per > 100 ? 100 : per;
					circle.run();
				}

                scope.$watch('binddata', function(newValue, oldValue, scope) {
                    if(cfg.binding == undefined) return;
                    var list = getBaseTypes(cfg.binding);
					var meanings = parsePieMeaning(ChartCfg.Meaning);
                    initPieChats(list,currpartid,scope.binddata,ChartCfg.DataType,ChartCfg.ChartType,ChartCfg.Y1Name,ChartCfg.PieValueType,meanings);
                });

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

				function getMeaningByValue(value,meanings){
                	var meaning = "";
                	if(meanings){
						meanings.forEach(function(item){
							if(item.value == value) meaning = item.meaning;
						});
					}
                	return meaning;
				}

                scope.clickExport = function(event){
                    var partid = event.target.parentNode.parentNode.parentNode.attributes["partid"].nodeValue;
                    var chart = [];
                    scope.binddata.forEach(function(item){
                        if(item.partId == partid && item.currentValue != scope.languageJson.Loading+"...")//加载中
                            chart.push(item);
                    });
                    if(chart.length == 0) return;
                    var exportData = getPieChatsExport(chart);
                    Exporter.toXls(exportData);
                };

                function getPieChatsExport(data) {
                    var arr = [];
                    if(data[0].description == ""){
                        arr.push({
                            name : scope.languageJson.Configuration.ActiveChartControl.Chart.Name,
                            data : scope.languageJson.Configuration.ActiveChartControl.Chart.Value,
                            date : scope.languageJson.Configuration.ActiveChartControl.Chart.Time
                        });//"名称" / "值" / "时间"

                        for(var i = 0;i < data.length;i++){
                            cfg = {};
                            cfg.name = data[i].deviceName+' '+data[i].signalName;
                            cfg.data = data[i].currentValue;
                            cfg.date = data[i].updateTime;
                            arr.push(cfg);
                        }
                        return arr;
                    }if(data[0].description.indexOf("line") > -1){
						arr.push({
							name : scope.languageJson.Configuration.ActiveChartControl.Chart.Name,
							data : scope.languageJson.Configuration.ActiveChartControl.Chart.Value,
							date : scope.languageJson.Configuration.ActiveChartControl.Chart.Time
						});//"名称" / "值" / "时间"
                        for(var i = 0;i < data.length;i++){
                            var currValue = angular.fromJson(data[i].currentValue);
                            for(var j = 0;j < currValue.data.length;j ++){
                                cfg = {};
                                cfg.name = data[i].deviceName+' '+data[i].baseTypeName;
                                cfg.data = currValue.data[j];
                                cfg.date = currValue.date[j];
                                arr.push(cfg);
                            }
                        }
                        return arr;
                    }else{
                    	var chartArr = scope.languageJson.Configuration.ActiveChartControl.Chart;
                        arr.push({
                            name : chartArr.DataName,
                            data : chartArr.Data
                        });// "数据名称" / "数据"

                        for(var i = 0;i < data.length;i++){
                            var split = data[i].description.split("|");
                            cfg = {};
                            if(split[1] == 2){
                                cfg.name = "PUE";
                                cfg.data = data[i].currentValue;
                            }else if(split[1] == 3){
                                cfg.name = chartArr.Power;//"功率"
                                cfg.data = data[i].currentValue+" kW";
                            }else{
                                if(split[1] == 4)
                                    cfg.name = chartArr.Space;//"空间容量";
                                if(split[1] == 5)
                                    cfg.name = chartArr.Load;//"负载容量";
                                if(split[1] == 6)
                                    cfg.name = chartArr.Cooling;//"制冷容量";
                                var value = data[i].currentValue;
                                cfg.data = angular.fromJson(value).usage+" %"
                            }

                            arr.push(cfg);
                        }
                        return arr;
                    }
                }

                scope.clickPue = function(){
                    scope.historyTitle = scope.languageJson.Configuration.ActiveChartControl.PueTitle;//"历史PUE曲线"
                    var setHistoryPueDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/historyPueCharts.html',
                        show: false
                    });
                    setHistoryPueDlg.$promise.then(setHistoryPueDlg.show);

                    MdcAlarmService.GetHistoryPueCharts("7").then(function(data){
                        var chartOption = {};
                        var ChartCfg = {
                            ChartType : 'line',
                            SingleBiaxial : 1,
                            Y1Name : 'PUE'
                        };
						var sysStyle = localStorage.getItem("systemStyle");
                        $http.get("data/LineOrBarCharts.json").success(function(json) {
                            var opt = json;
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
                            opt.yAxis[0].min = 1;
                            opt.yAxis[0].max = "auto";

                            var series = {
                                name : ChartCfg.Y1Name,
                                type : ChartCfg.ChartType,
                                data : [],
                                itemStyle : {normal: {areaStyle: {type: "default"}}},
                                markPoint : {
                                    data : [
                                        {type : "max", name: scope.languageJson.Configuration.ActiveChartControl.Function.MaxVal},
                                        {type : "min", name: scope.languageJson.Configuration.ActiveChartControl.Function.MinVal}
                                    ]
                                }
                            };//"最大值" / "最小值"

                            opt.series.push(series);
                            chartOption = opt;

                            chartOption.series[0].name = "PUE";
                            chartOption.series[0].data = data.datas;
                            chartOption.xAxis[0].data = data.dates;

                            echarts.init($("#HistoryPue")[0]).setOption(chartOption, true);
                        });
                    });
                };



                scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
                    diagramService.updateEditStatus(elem, newValue);
                });
            }
        };
    }
]);

nurseDirective.directive('newgaugesetter',['$modal','baseTypeService','ConfigureMoldService',
     function($modal,baseTypeService,ConfigureMoldService){
        return{
            restrict: 'A',
            link: function(scope, element) {
                var setDlg = null;
                scope.optgauges = {};
                scope.optgauges.min = 0;
                scope.optgauges.max = 500;

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram, function(part) {
                        return part.baseTypeId === id;
                    });
                    return found;
                }
                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;
                        scope.Topology.DeviceId = scope.deviceList[0].equipmentId;

                        baseTypeService.getGaugeSignalBaseType(scope.Topology.DeviceId).then(function(data) {
                            if(data.length==0)
                                scope.gauges = [{baseTypeId:undefined,baseTypeName:'没有数据'}];
                            else
                                scope.gauges = data;
                        });
                    });
                }
                /*********************************************************************/

                function getPartNum(typename){
                    var num = 1;
                    var cparts = scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++){
                        if(cparts[i].id.indexOf(typename)==-1) continue;

                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum>=num){
                            num=partnum+1;
                        }
                    }
                    return num;
                }

                element.bind('click', function() {
                    initDevice();
                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/newgaugesetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);

                    scope.save = function(){
                        var gauge = getPartConfig(scope.gauges, scope.optgauges.optionsGauges);
                        var cofg = {};
                        var count = getPartNum("gauge");
                        cofg.id = "gauge"+count;
                        cofg.type = "gaugepart";
                        cofg.left="5";
                        cofg.top="80";
                        cofg.width = "146";
                        cofg.height = "192";
                        cofg.zindex = "1";
                        cofg.binding = "BS:"+scope.optgauges.optionsGauges+"|DI:"+scope.Topology.DeviceId;
                        cofg.options = "Name:"+gauge.baseTypeName+"|Min:"+scope.optgauges.min+"|Max:"+scope.optgauges.max+"|Unit:"+gauge.remark;
                        scope.diagram.parts.push(cofg);
                        setDlg.hide();
                        scope.resetParts();
                    };
                    scope.changeDevice = function(id){
                        baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                            if(data.length==0)
                                scope.gauges = [{baseTypeId:undefined,baseTypeName:'没有数据'}];
                            else
                                scope.gauges = data;
                        });
                    };
                });
            }
        }
     }
]);

nurseDirective.directive('basegaugesetter',['$modal','baseTypeService','global','ConfigureMoldService',
    function($modal,baseTypeService,global,ConfigureMoldService){
        return {
            restrict: 'A',
            link: function(scope, element) {
                var setDlg = null;
                scope.basegauges = {};

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }
                function getGaugeConfig(gauges, id) {
                    var found = _.find(gauges, function(part) {
                        return part.baseTypeId === id;
                    });
                    return found;
                }
                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;
                    });
                }
                /*********************************************************************/

                element.bind('click',function(){
                    initDevice();
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/basegaugesetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);
                    var partid= element.parent().parent().attr("partid");
                    scope.partid = partid;
                    var cfg = getPartConfig(scope.diagram, scope.partid);
                    scope.basegauges.optionsGauges = global.getpara("BS",cfg.binding);
                    scope.Topology.DeviceId = global.getpara("DI",cfg.binding);
                    scope.basegauges.min = global.getpara("Min",cfg.options);
                    scope.basegauges.max = global.getpara("Max",cfg.options);

                    scope.save = function(){
                        var cofg = getPartConfig(scope.diagram, scope.partid);
                        var gauge = getGaugeConfig(scope.gauges, scope.basegauges.optionsGauges);
                        cofg.binding = "BS:"+scope.basegauges.optionsGauges+"|DI:"+scope.Topology.DeviceId;
                        cofg.options =  "Name:"+gauge.baseTypeName+"|Min:"+scope.basegauges.min+"|Max:"+scope.basegauges.max+"|Unit:"+gauge.remark;
                        setDlg.hide();
                        scope.resetParts();
                    };
                    scope.changeDevice = function(id){
                        baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                            if(data.length==0)
                                scope.gauges = [{baseTypeId:undefined,baseTypeName:'没有数据'}];
                            else
                                scope.gauges = data;
                        });
                    };
                    scope.changeDevice(scope.Topology.DeviceId);
                });

            }
        }
    }
]);

nurseDirective.directive('basepiechartsetter',['$modal','baseTypeService','global','diagramService','equipmentTemplateService','base64','balert','ConfigureMoldService',
    function($modal,baseTypeService,global,diagramService,equipmentTemplateService,base64,balert,ConfigureMoldService){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var setDlg = null;
                scope.PieChart = {};

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });

                    return found;
                }
                /******************* 过滤设备列表 & 加载信号列表 **************************/
				function initDevice(){
					var parentId = scope.diagram.parentId;
					if(scope.diagram.deviceBaseTypeId == "1004" ||
						(parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
						parentId = "";
					ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
						scope.PieChart.Equipments = data;
						scope.deviceList = data;

						scope.PieChart.EquipmentId = scope.diagram.deviceId;
						if(scope.PieChart.EquipmentId == undefined)
							scope.PieChart.EquipmentId = scope.PieChart.Equipments[0].equipmentId;

						scope.changeEquipment(scope.PieChart.EquipmentId);
					});
				}

                /*********************************************************************/

                function init(){
                    var partid = element.parent().parent().attr("partid");
                    scope.partid = partid;
                    var cfg = getPartConfig(scope.diagram, scope.partid);

                    scope.PieChart = {};
                    scope.PieChart.Title = global.getpara("Title",cfg.options);
                    scope.PieChart.DataType = global.getpara("DataType",cfg.options);
                    scope.PieChart.ChartType = global.getpara("ChartType",cfg.options);
                    scope.PieChart.LineColor = global.getpara("LineColor",cfg.options);
					scope.PieChart.LineImages = global.getpara("LineImages",cfg.options);
                    scope.PieChart.BarColor = global.getpara("LineColor",cfg.options);
                    scope.PieChart.Y1Name = global.getpara("Y1Name",cfg.options);
                    scope.PieChart.Y1Min = global.getpara("Y1Min",cfg.options);
                    scope.PieChart.Y1Max = global.getpara("Y1Max",cfg.options);
                    scope.PieChart.Size = global.getpara("Size",cfg.options);
                    scope.PieChart.Background = global.getpara("Background",cfg.options);
					scope.PieChart.PieColor = global.getpara("PieColor",cfg.options);
					scope.PieChart.PieValueType = global.getpara("PieValueType",cfg.options);
					scope.PieChart.Unit = global.getpara("Unit",cfg.options);
					scope.PieChart.Meaning = global.getpara("Meaning",cfg.options);

                    if(cfg.binding.split("|").length > 2){
                        var expression = cfg.binding.split("|")[2].split("&");
                        scope.PieChart.Expression1 = base64.decode(expression[0].substring(expression[0].indexOf(":")+1));
                        scope.PieChart.Expression2 = base64.decode(expression[1].substring(expression[1].indexOf(":")+1));
                    }

                    var bindings = cfg.binding.split("&");
                    bindings.forEach(function(item){
                        var devId = global.getpara("DI",item);
                        baseTypeService.getGaugeSignalBaseType(devId).then(function(data) {
                            var arr = [];
                            var cfgs = undefined;
                            var sigs = item.split("|");
                            data.forEach(function(item){
                                for(var j = 0;j < sigs.length;j++){
                                    if(sigs[j].indexOf("BS") == -1) continue;
                                    var id = global.getpara("BS",sigs[j]);
                                    if(item.baseTypeId == id)
                                        cfgs = item;
                                }
                            });
                            if(cfgs != undefined || cfgs != null){
                                if(scope.PieChart.Y1Signals == undefined || scope.PieChart.Y1Signals == "")
                                    arr.push(cfgs);
                                else{
                                    arr = angular.fromJson(scope.PieChart.Y1Signals);
                                    arr.push(cfgs);
                                }
                                scope.PieChart.Y1Signals = angular.toJson(arr);
                            }
                        });
                    });

                    function filterDevice(data){
                        if(scope.diagram.deviceBaseTypeId == "1004" ||
                            (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999)){
                            var list = [];
                            data.forEach(function(item){
                                if(item.parts != "" && item.parts != undefined){
                                    item.parts.forEach(function(i){
                                        if(i.deviceId != "" && i.deviceId != undefined)
                                            list.push(i);
                                    })
                                }
                            });
                            return list;
                        };
                        var list = [];
                        if(scope.diagram && scope.diagram.deviceList){
                            var deviceList = scope.diagram.deviceList.split("|");
                            deviceList.forEach(function(deviceId){
                                data.forEach(function(item){
                                    if(item.id == deviceId)
                                        list.push(item);
                                });
                            });
                        }
                        return list;
                    }
                }

                var showMultiDeviceSelectDlg = $modal({
                    scope:scope,
                    templateUrl:'partials/showMultiDeviceSelect.html',
                    show:false
                });


                //多设备多选
                function initMultiDeviceSelect(){
                    var filterOut = function(original, toFilter) {
                        if(toFilter == undefined) return original;
                        var filtered = [];
                        angular.forEach(original, function(entity) {
                            var match = false;
                            for (var i = 0; i < toFilter.length; i++) {
                                if (toFilter[i].deviceBaseTypeId == entity.deviceBaseTypeId &&
                                    toFilter[i].baseTypeId == entity.baseTypeId) {
                                    match = true;
                                    break;
                                }
                            }
                            if (!match) {
                                filtered.push(entity);
                            }
                        });
                        return filtered;
                    };

                    function fromJson(data){
                        var arr = [];
                        data.forEach(function(item){
                            arr.push(angular.fromJson(item));
                        });
                        return arr;
                    }

                    scope.refreshAvailable = function() {
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.bind.siglist);
                        scope.selected.available = [];
                        scope.selected.current = [];
                    };

                    scope.addMulti = function() {
                        scope.selected.available = fromJson(scope.selected.available);
                        if(!scope.bind.selectedsigs) scope.bind.selectedsigs = scope.selected.available;
                        else scope.bind.selectedsigs = scope.bind.selectedsigs.concat(scope.selected.available);
                        scope.bind.siglist = filterOut(scope.bind.siglist, scope.selected.available);
                        scope.refreshAvailable();
                    };

                    scope.removeMulti = function() {
                        scope.selected.current = fromJson(scope.selected.current);
                        scope.bind.siglist = scope.bind.siglist.concat(scope.selected.current);
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.selected.current);
                        scope.refreshAvailable();
                    };

                    scope.showMultiSelect = function(obj,data){
                        scope.selected = {};
                        scope.bind = {};
                        scope.bind.selectedsigs = undefined;
                        scope.obj = obj;//对象字符串
                        if(data != undefined && data != ""){
                            var data = angular.fromJson(data);
                            scope.bind.selectedsigs = data;
                        }
                        showMultiDeviceSelectDlg.$promise.then(showMultiDeviceSelectDlg.show);

                        scope.changeDevice(scope.Topology.DeviceId);
                    };

                    scope.saveMultiSelect = function(deviceId,obj){
                    	var error = scope.languageJson.Configuration.ActiveChartControl;
                        if(scope.bind.selectedsigs == undefined || scope.bind.selectedsigs.length == 0){
							//'信号不能为空！'
                            balert.show('danger', error.ErrorSignal,3000);
                            return;
                        }
                        if(scope.PieChart.DataType == 1 && ((scope.PieChart.ChartType == 'gauge' || scope.PieChart.ChartType == 'newGauge')
							&& scope.bind.selectedsigs.length > 1)){
                        	//'仪表盘的信号只能为一个！'
                            balert.show('danger', error.ErrorGauge,3000);
                            return;
                        }
                        if(scope.PieChart.ChartType == 'pie' && scope.bind.selectedsigs.length < 2){
                        	//'饼图的信号不能少于2个！'
                            balert.show('danger', error.ErrorPie,3000);
                            return;
                        }

                        if(scope.bind.selectedsigs.length > 0){
                            var str = angular.toJson(scope.bind.selectedsigs);
                            eval(obj+"=str");
                        }
                        showMultiDeviceSelectDlg.hide();
                    };

                    //show list
                    scope.changeDevice = function(id){
                        baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                            var selected = angular.fromJson(scope.bind.selectedsigs);
                            scope.bind = {
                                siglist: filterOut(data, selected),
                                selectedsigs: selected
                            };

                        });
                    };
                }

                function initFunction(){
                    initMultiDeviceSelect();

                    scope.dataTypeChange = function(type){
                        if(type == 2 || type == 3)
                            scope.PieChart.ChartType = 'gauge';
                        else if(type == 4 || type == 5 || type == 6)
                            scope.PieChart.ChartType = 'pie';
                        if(type == 2)
                            scope.PieChart.Y1Max = 1.5;
                    };

                    scope.changeEquipment = function(equipmentId){
                        baseTypeService.GetSinalByEquipmentId(equipmentId).then(function(data){
                            scope.PieChart.Signals = data;
                        });
                        scope.PieChart.SignalId = undefined;
                    };

                    /** 其他容量占比 **/
                    scope.ClickSignalsLi = function(id,symbol){
                        if(eval("scope.PieChart."+id+" == undefined"))
                            eval("scope.PieChart."+id+" = ''");

                        var textDom = document.getElementById(id);
                        var addStr = symbol;

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            if(id == 'Expression1')
                                scope.PieChart.Expression1 = scope.PieChart.Expression1.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression1.substring(scope.endPos);
                            else
                                scope.PieChart.Expression2 = scope.PieChart.Expression2.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression2.substring(scope.endPos);

                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            eval("scope.PieChart."+id+" += "+addStr+"");
                            textDom.focus();
                        }
                    };

                    scope.getCursortPosition = function(id){
                        scope.nowExprId = id;
                        var textDom = document.getElementById(id);
                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            scope.startPos = textDom.selectionStart;
                            scope.endPos = textDom.selectionEnd;
                            scope.scrollTop = textDom.scrollTop;
                        }
                    };

                    scope.changeSignal = function(){
                        var textDom = undefined;
                        if(scope.nowExprId == undefined){
                            textDom = document.getElementById("Expression1");
                            if(scope.PieChart.Expression1 == undefined)
                                scope.PieChart.Expression1 = "";
                            scope.nowExprId = "Expression1";
                        }else{
                            textDom = document.getElementById(scope.nowExprId);
                            if(eval("scope.PieChart."+scope.nowExprId+" == undefined"))
                                eval("scope.PieChart."+scope.nowExprId+" = ''");
                        }

                        var addStr = "["+scope.PieChart.EquipmentId+"-"+scope.PieChart.SignalId+"]";

                        if (textDom.selectionStart || textDom.selectionStart == '0') {
                            if(scope.nowExprId == 'Expression1')
                                scope.PieChart.Expression1 = scope.PieChart.Expression1.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression1.substring(scope.endPos);
                            else
                                scope.PieChart.Expression2 = scope.PieChart.Expression2.substring(0,scope.startPos)+addStr+
                                    scope.PieChart.Expression2.substring(scope.endPos);

                            textDom.focus();
                            textDom.selectionStart = scope.startPos + addStr.length;
                            textDom.selectionEnd = scope.startPos + addStr.length;
                            textDom.scrollTop = scope.scrollTop;
                        }else {
                            eval("scope.PieChart."+scope.nowExprId+" += "+addStr+"");
                            textDom.focus();
                        }
                    };

                    var showColorSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showColorSelect.html',
                        show:false
                    });
                    scope.showColorSelect = function(data){
                        scope.ColorSelect = angular.fromJson(data);
                        showColorSelectDlg.$promise.then(showColorSelectDlg.show);

                        scope.saveColorSelect = function(){
                            var is = false;
                            for(var i = 0 ;i < scope.ColorSelect.length;i++){
                                if(scope.ColorSelect[i][0] == undefined || scope.ColorSelect[i][0] == "" ||
                                    scope.ColorSelect[i][1] == undefined || scope.ColorSelect[i][1] == "")
                                    is = true;
                            }
                            if(is){
                                //'不能为空！'
                                balert.show('danger', scope.languageJson.Configuration.ActiveChartControl.ErrorEmpty,3000);
                                return;
                            }
                            scope.PieChart.LineColor = angular.toJson(scope.ColorSelect);
                            showColorSelectDlg.hide();
                        };
                    };

                    scope.showColpickColor = function(color,index){
                        scope.mod = "scope.ColorSelect["+index+"][1]";
                        scope.color = color.replace(/#/g,'');
                        $('#picker').colpick({
                            flat:true,
                            color:scope.color,
                            onSubmit:function(hsb,hex,rgb,el){
                                eval(scope.mod+" = \"#"+hex+"\"");
                            }
                        });
                    };

                    var showBarColorSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showMoreColorBox.html',
                        show:false
                    });
                    //条形柱  柱子颜色
                    scope.showBarColorSelect = function(data){
                        scope.hideRange = true;//隐藏
                        //颜色集合
                        var colors = angular.fromJson(data);
                        scope.ColorSelect = [];
                        if(colors){
                            colors.forEach(function(col){
                                var c = [col,col];
                                scope.ColorSelect.push(c);
                            });
                        }

                        showBarColorSelectDlg.$promise.then(showBarColorSelectDlg.show);

                        //重写保存
                        scope.saveColorSelect = function(){
                            if(scope.ColorSelect){
                                var colors = [];
                                scope.ColorSelect.forEach(function(item){
                                    colors.push(item[1]);
                                });
                                scope.PieChart.BarColor = angular.toJson(colors);
                            }else
                                scope.PieChart.BarColor = "";
                            showBarColorSelectDlg.hide();
                        };
                    };
                    //新增
                    scope.addColorClick = function(){
                        scope.ColorSelect.push(["#ffffff","#ffffff"]);
                    };
                    //删除
                    scope.delColorClick = function($index){
                        scope.ColorSelect.splice($index,1);
                    };

					scope.addMeaningClick = function(value,meaning,result){
						if(value == undefined || value == "") return result;
						if(meaning == undefined || meaning == "") return result;

						if(result == undefined || result == "")
							result = value+"."+meaning;
						else
							result += "/"+value+"."+meaning;

						return result;
					};
                }

                function parseBinding(data){
                    var result = '';
                    if(data.DataType == 1 || data.DataType == 7){
                        if(data.ChartType == 'line' || data.ChartType == 'bar')//折线图 || 柱形图
                            result = data.ChartType+'|'+data.Size+'&';
                        else if(data.DataType == 7)
							result = data.ChartType+'|AvgMaxMin&';
                        var y1Signals = angular.fromJson(data.Y1Signals);
                        y1Signals.forEach(function(item){
                            result += 'BS:'+item.baseTypeId+'|DI:'+item.deviceBaseTypeId+"&";
                        });
                    }else{//2:PUE 3:MDC功率 4:MDC空间总占比 5:IT负载 6:制冷容量
                        result = "piechart|"+data.DataType;
                        if(data.DataType == 6){
                            if(scope.PieChart.Expression2)
                                result += "|expr1:"+base64.encode(scope.PieChart.Expression1)+"&expr2:"+
                                    base64.encode(scope.PieChart.Expression2);
                            else
                                result += "|expr1:"+base64.encode(scope.PieChart.Expression1)+"&expr2:";
                        }
                    }
                    return result;
                }

				function showTitle(){
					setTimeout(function(){
						$(".powerFun").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.PowerFun+"</h5>");
						$(".absVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.AbsVal+"</h5>");
						$(".maxVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.MaxVal+"</h5>");
						$(".minVal").attr("data-original-title","<h5>"+scope.languageJson.Configuration.ActiveChartControl.Function.MinVal+"</h5>");
					},500);
				};

                function parseLineColor(ChartType){
                    if(ChartType == "gauge")//仪表盘
                        return scope.PieChart.LineColor;
                    else //矩形图
                        return scope.PieChart.BarColor;
                }

                element.bind('click', function() {
                    initFunction();
                    initDevice();
                    init();

                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/basepiechartsetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);
					showTitle();

                    scope.save = function() {
                    	var error = scope.languageJson.Configuration.ActiveChartControl;
                        if(scope.PieChart.SingleBiaxial == 1 && scope.PieChart.DataType == 1 &&
                            (scope.PieChart.Y1Signals == undefined || scope.PieChart.Y1Signals == '')){
                        	//'Y1轴信号不能为空！'
                            balert.show('danger', error.ErrorY1,3000);
                            return;
                        }
                        if(scope.PieChart.SingleBiaxial == 2 && scope.PieChart.DataType == 1 &&
                            (scope.PieChart.Y2Signals == undefined || scope.PieChart.Y2Signals == '')){
                        	//'Y2轴信号不能为空！'
                            balert.show('danger', error.ErrorY2,3000);
                            return;
                        }
                        if(scope.PieChart.DataType == 6 && (scope.PieChart.ChartType == "pie" || scope.PieChart.ChartType == "gauge")
                            && (scope.PieChart.Expression1 == undefined || scope.PieChart.Expression1 == "")){
                        	//'当前值表达式不能为空！'
                            balert.show('danger', error.ErrorCurrentVal,3000);
                            return;
                        }
                        if(scope.PieChart.DataType == 6 && scope.PieChart.ChartType == "pie" &&
                            (scope.PieChart.Expression2 == undefined || scope.PieChart.Expression2 == "")){
                        	//'总值表达式不能为空！'
                            balert.show('danger', error.ErrorTotalVal,3000);
                            return;
                        }
                        var cfg = getPartConfig(scope.diagram, scope.partid);

                        cfg.binding = parseBinding(scope.PieChart);
                        cfg.options = "Title:"+scope.PieChart.Title+"|ChartType:"+scope.PieChart.ChartType
                            +"|DataType:"+scope.PieChart.DataType+"|LineColor:"+parseLineColor(scope.PieChart.ChartType)
							+"|LineImages:"+scope.PieChart.LineImages
                            +"|Y1Name:"+scope.PieChart.Y1Name+"|Y1Min:"+scope.PieChart.Y1Min+"|Y1Max:"+scope.PieChart.Y1Max
                            +"|Size:"+scope.PieChart.Size+"|Background:"+scope.PieChart.Background
							+"|PieColor:"+scope.PieChart.PieColor+"|PieValueType:"+scope.PieChart.PieValueType
							+"|Unit:"+scope.PieChart.Unit+"|Meaning:"+scope.PieChart.Meaning;
                        scope.resetParts();
                        setDlg.hide();
                    };
                });
            }
        };
    }
]);



nurseDirective.directive("newtopologysetter",['$modal','balert','baseTypeService','uploadService','ImageManageService','ConfigureMoldService',
    function($modal,balert,baseTypeService,uploadService,ImageManageService,ConfigureMoldService){
        return {
            restrict : 'A',
            link : function(scope, element){
                var setDlg,showImgFileDlg;
                scope.Topology = {};

                function init(){
                    scope.Topology = {
                        title : "",
                        fontSize : "15",
                        upImgName : "img/diagram/up.png",
                        openImgName : "img/diagram/open.png",
                        rotate : "0"
                    };
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;

                        scope.Topology.DeviceId = scope.diagram.deviceId;
                        if(scope.Topology.DeviceId == undefined)
                            scope.Topology.DeviceId = scope.deviceList[0].equipmentId;
                        baseTypeService.getSignalSwitchByDeviceId(scope.Topology.DeviceId).then(function(datas){
                            scope.Topology.events = datas;
                        });
                    });

                    scope.clickSignal = function(deviceId,signalId){
                        baseTypeService.GetSignalMeaningsByDIdSId(deviceId,signalId).then(function(data){
                            scope.Topology.SignalMeanings = data;
                            scope.Topology.upValue = data.length >= 1 ? data[0].StateValue : "";
                            scope.Topology.openValue = data.length >= 2 ? data[1].StateValue : "";
                        });
                    };
                    scope.changeUpOpenValue = function(old,now){
                        if(scope.Topology.upValue == scope.Topology.openValue){
                            for(var i = 0;i < scope.Topology.SignalMeanings.length;i++){
                                if(eval("scope.Topology.SignalMeanings["+i+"].StateValue != scope.Topology."+old)){
                                    eval("scope.Topology."+now+" = scope.Topology.SignalMeanings["+i+"].StateValue");
                                    break;
                                }
                            }
                            if(scope.Topology.upValue == scope.Topology.openValue){
                                eval("scope.Topology."+now+" = ''");
                            }
                        }
                    };

                    scope.imgFilePath = undefined;
                    scope.showImgFile = function(varName){
                        scope.varName = varName;
                        scope.imgFiles = {
                            catalog : "img/diagram",
                            imageFile : undefined
                        };
                        showImgFileDlg = $modal({
                            scope: scope,
                            templateUrl: 'partials/showImgFile.html',
                            show: false
                        });
                        showImgFileDlg.$promise.then(showImgFileDlg.show);

                        scope.changeCatalog(scope.imgFiles.catalog);
                    };

                    scope.changeCatalog = function(catalog){
                        ImageManageService.LoadImagesByPath(catalog).then(function(data){
                            scope.ImageFiles = data;
                        });
                    };

                    scope.clickImage = function(imageFile,$event){
                        scope.imgFiles.imageFile = imageFile;
                        $($event.currentTarget).parent().find('div').removeClass("select-image");
                        $($event.currentTarget).addClass("select-image");
                    };

                    scope.selectImageFile = function(){
                        if(scope.imgFiles == undefined || scope.imgFiles.imageFile == undefined){
                        	//'请选择图片。'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ErrorImage,3000);
                            return;
                        }
                        eval("scope."+scope.varName+" = scope.imgFiles.imageFile");
                        showImgFileDlg.hide();
                    };
                }

                function getPartNum(typename){
                    var  num=1;
                    var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++)
                    {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum>=num){
                            num=partnum+1;
                        }
                    }
                    return num;

                }

                element.bind('click',function(){
                    init();
                    setDlg = $modal({
                        scope: scope,
                        templateUrl: 'partials/newtopologysetter.html',
                        show: false
                    });
                    setDlg.$promise.then(setDlg.show);
                    scope.file = undefined;
                    scope.file2 = undefined;

                    scope.save = function(){
                        if(scope.Topology.fontSize == undefined || scope.Topology.fontSize == "")
                            scope.Topology.fontSize = "15";
                        if(scope.Topology.rotate == undefined || scope.Topology.rotate == "")
                            scope.Topology.rotate = "0";
                        if(scope.Topology.SignalId == undefined || scope.Topology.SignalId == ""){
                        	//'事件不能为空！'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ErrorSignal,3000);
                            return;
                        }
                        if(scope.Topology.upValue == "" && scope.Topology.openValue == ""){
                        	//'断开值为非闭合时，闭合值不能为非断开！'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ErrorControl,3000);
                            return;
                        }

                        var upFile = scope.file;
                        var openFile = scope.file2;
                        if((upFile != undefined && upFile.size>512000) || (openFile != undefined && openFile.size>512000)){
                        	//'新增图片不能大于500K！'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ImageSizePrompt,3000);
                            return;
                        }

                        var cofg ={};
                        cofg.id = "topology"+getPartNum("topology");
                        cofg.type = "topologyspart";
                        cofg.left = "5";
                        cofg.top = "80";
                        cofg.width = "80";
                        cofg.height = "120";
                        cofg.binding = "SI:"+scope.Topology.SignalId+"|DI:"+scope.Topology.DeviceId;

                        if(upFile == undefined && openFile == undefined){
                            pushCofg(cofg);
                        }else if(upFile != undefined && openFile != undefined){
                            uploadService.uploadFile(upFile).then(function(data) {
                                scope.Topology.upImgName = data;
                                uploadService.uploadFile(openFile).then(function(data) {
                                    scope.Topology.openImgName = data;

                                    pushCofg(cofg);
                                });
                            });
                        }else if(upFile != undefined && openFile == undefined){
                            uploadService.uploadFile(upFile).then(function(data) {
                                scope.Topology.upImgName = data;

                                pushCofg(cofg);
                            });
                        }else{
                            uploadService.uploadFile(openFile).then(function(data) {
                                scope.Topology.openImgName = data;

                                pushCofg(cofg);
                            });
                        }
                    };

                    function pushCofg(cofg){
                        cofg.options = "Name:"+scope.Topology.title+"|fontSize:"+scope.Topology.fontSize+"|imgUpFile:"+
                            scope.Topology.upImgName+"|upValue:"+scope.Topology.upValue+"|imgOpenFile:"+scope.Topology.openImgName+
                            "|openValue:"+scope.Topology.openValue+"|rotate:"+scope.Topology.rotate;
                        scope.diagram.parts.push(cofg);
                        scope.resetParts();
                        setDlg.hide();
                    }

                    scope.changeDevice = function(deviceId){
                        baseTypeService.getSignalSwitchByDeviceId(deviceId).then(function(data){
                            scope.Topology.events = data;
                        });
                    };
                });

            }
        }
    }
]);


nurseDirective.directive("topologyspart",['diagramService','global',
    function(diagramService,global){
        return {
            restrict: "AE",
            replace: true,
            templateUrl: "partials/topologyspart.html",
            link : function(scope, elem, attrs){
                var cfg = diagramService.initPart(scope, elem, attrs);
                if (cfg === undefined) return;
                var currpartid=scope.partid = attrs.partid;
                var name = global.getpara("Name",cfg.options);
                var fontSize = global.getpara("fontSize",cfg.options);
                var imgUpFile = global.getpara("imgUpFile",cfg.options);
                var upValue = global.getpara("upValue",cfg.options);
                var imgOpenFile = global.getpara("imgOpenFile",cfg.options);
                var openValue = global.getpara("openValue",cfg.options);
                var rotate = global.getpara("rotate",cfg.options);

                scope.$watch('binddata', function(newValue, oldValue, scope) {
                    var value = _.findWhere(scope.binddata, {partId: currpartid});
                    if(value == undefined || value.floatValue == undefined) return;
                    //断开
                    var img = imgOpenFile;
                    //闭合
                    if(upValue == ""){
                        if(parseFloat(value.floatValue) != parseFloat(openValue))
                            img = imgUpFile;
                    }else{
                        if(parseFloat(value.floatValue) == parseFloat(upValue))
                            img = imgUpFile;
                    }

                    //图片大小
                    var height =  "calc(100% - 36px)";
                    var witch = "100%";
                    if(parseInt(rotate) == 90 || parseInt(rotate) == 270){
                        height = "100%";
                        witch = "calc(100% - 25px)";
                    }
                    //样式
                    elem.find('.topology-title').css({
                        "fontSize": fontSize+"px"
                    }).text(name);
                    elem.find('.topology-img').css({
                        "background-image": "url('" +img + "')",
                        "transform": "rotate("+rotate+"deg)",
                        "height":height,
                        "width":witch,
                        "-ms-transform": "rotate("+rotate+"deg)", /* IE 9 */
                        "-moz-transform": "rotate("+rotate+"deg)", /* Firefox */
                        "-webkit-transform": "rotate("+rotate+"deg)", /* Safari and Chrome */
                        "-o-transform": "rotate("+rotate+"deg)" /* Opera */
                    });
                });

                scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
                    diagramService.updateEditStatus(elem, newValue);
                });
            }
        }
    }
]);


nurseDirective.directive("topologysetter",['$modal','baseTypeService','global','uploadService','balert','ImageManageService','ConfigureMoldService',
    function($modal,baseTypeService,global,uploadService,balert,ImageManageService,ConfigureMoldService){
        return {
            restrict : "A",
            link : function(scope, element){
                var setDlg = null,showImgFileDlg = null;

                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }

                function init(){
                    var partid = element.parent().parent().attr("partid");
                    scope.partid = partid;
                    var cfg = getPartConfig(scope.diagram, scope.partid);

                    var evs = cfg.binding.split("|");
                    scope.Topology.SignalId = evs[0].split(":")[1];
                    scope.Topology.DeviceId = evs[1].split(":")[1];

                    baseTypeService.GetSignalMeaningsByDIdSId(scope.Topology.DeviceId,scope.Topology.SignalId).then(function(data){
                        scope.Topology.SignalMeanings = data;
                    });

                    scope.Topology.title = global.getpara("Name",cfg.options);
                    scope.Topology.fontSize = global.getpara("fontSize",cfg.options);
                    scope.Topology.upImgName = global.getpara("imgUpFile",cfg.options);
                    scope.Topology.upValue = global.getpara("upValue",cfg.options);
                    scope.Topology.openImgName = global.getpara("imgOpenFile",cfg.options);
                    scope.Topology.openValue = global.getpara("openValue",cfg.options);
                    scope.Topology.rotate = global.getpara("rotate",cfg.options);

                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;

                        baseTypeService.getSignalSwitchByDeviceId(scope.Topology.DeviceId).then(function(data){
                            scope.Topology.events = data;
                        });
                    });

                    scope.clickSignal = function(deviceId,signalId){
                        baseTypeService.GetSignalMeaningsByDIdSId(deviceId,signalId).then(function(data){
                            scope.Topology.SignalMeanings = data;
                            scope.Topology.upValue = data.length >= 1 ? data[0].StateValue : "";
                            scope.Topology.openValue = data.length >= 2 ? data[1].StateValue : "";
                        });
                    };
                    scope.changeUpOpenValue = function(old,now){
                        if(scope.Topology.upValue == scope.Topology.openValue){
                            for(var i = 0;i < scope.Topology.SignalMeanings.length;i++){
                                if(eval("scope.Topology.SignalMeanings["+i+"].StateValue != scope.Topology."+old)){
                                    eval("scope.Topology."+now+" = scope.Topology.SignalMeanings["+i+"].StateValue");
                                    break;
                                }
                            }
                            if(scope.Topology.upValue == scope.Topology.openValue){
                                eval("scope.Topology."+now+" = ''");
                            }
                        }
                    };

                    scope.imgFilePath = undefined;
                    scope.showImgFile = function(varName){
                        scope.varName = varName;
                        scope.imgFiles = {
                            catalog : "img/diagram",
                            imageFile : undefined
                        };
                        showImgFileDlg = $modal({
                            scope: scope,
                            templateUrl: 'partials/showImgFile.html',
                            show: false
                        });
                        showImgFileDlg.$promise.then(showImgFileDlg.show);

                        scope.changeCatalog(scope.imgFiles.catalog);
                    };

                    scope.changeCatalog = function(catalog){
                        ImageManageService.LoadImagesByPath(catalog).then(function(data){
                            scope.ImageFiles = data;
                        });
                    };

                    scope.clickImage = function(imageFile,$event){
                        scope.imgFiles.imageFile = imageFile;
                        $($event.currentTarget).parent().find('div').removeClass("select-image");
                        $($event.currentTarget).addClass("select-image");
                    };

                    scope.selectImageFile = function(){
                        if(scope.imgFiles == undefined || scope.imgFiles.imageFile == undefined){
                        	//'请选择图片。'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ErrorImage,3000);
                            return;
                        }
                        eval("scope."+scope.varName+" = scope.imgFiles.imageFile");
                        showImgFileDlg.hide();
                    };
                }

                element.bind('click',function(){
                    init();
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/topologysetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);
                    scope.file = undefined;
                    scope.file2 = undefined;

                    scope.save = function(){
                        if(scope.Topology.fontSize == undefined || scope.Topology.fontSize == "")
                            scope.Topology.fontSize = "15";
                        if(scope.Topology.rotate == undefined || scope.Topology.rotate == "")
                            scope.Topology.rotate = "0";
                        if(scope.Topology.SignalId == undefined || scope.Topology.SignalId == ""){
                        	//'事件不能为空！'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ErrorSignal,3000);
                            return;
                        }
                        if(scope.Topology.upValue == "" &&  scope.Topology.openValue == ""){
                        	//'断开值为非闭合时，闭合值不能为非断开！'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ErrorControl,3000);
                            return;
                        }

                        var upFile = scope.file;
                        var openFile = scope.file2;
                        if((upFile != undefined && upFile.size>512000) || (openFile != undefined && openFile.size>512000)){
                        	//'新增图片不能大于500K！'
                            balert.show('danger', scope.languageJson.Configuration.TopologyControl.ImageSizePrompt,3000);
                            return;
                        }

                        var cofg = getPartConfig(scope.diagram, scope.partid);
                        cofg.binding = "SI:"+scope.Topology.SignalId+"|DI:"+scope.Topology.DeviceId;

                        if(upFile == undefined && openFile == undefined){
                            pushCofg(cofg);
                        }else if(upFile != undefined && openFile != undefined){
                            uploadService.uploadFile(upFile).then(function(data) {
                                scope.Topology.upImgName = data;
                                uploadService.uploadFile(openFile).then(function(data) {
                                    scope.Topology.openImgName = data;

                                    pushCofg(cofg);
                                });
                            });
                        }else if(upFile != undefined && openFile == undefined){
                            uploadService.uploadFile(upFile).then(function(data) {
                                scope.Topology.upImgName = data;

                                pushCofg(cofg);
                            });
                        }else{
                            uploadService.uploadFile(openFile).then(function(data) {
                                scope.Topology.openImgName = data;

                                pushCofg(cofg);
                            });
                        }
                    };

                    function pushCofg(cofg){
                        cofg.options = "Name:"+scope.Topology.title+"|fontSize:"+scope.Topology.fontSize+"|imgUpFile:"+
                            scope.Topology.upImgName+"|upValue:"+scope.Topology.upValue+"|imgOpenFile:"+scope.Topology.openImgName+
                            "|openValue:"+scope.Topology.openValue+"|rotate:"+scope.Topology.rotate;
                        scope.resetParts();
                        setDlg.hide();
                    }

                    scope.changeDevice = function(deviceId){
                        baseTypeService.getSignalSwitchByDeviceId(deviceId).then(function(data){
                            scope.Topology.events = data;
                        });
                    };
                });
            }
        }
    }
]);



nurseDirective.directive("newhspiechartsetter",['$modal','baseTypeService','balert','ConfigureMoldService',
    function($modal,baseTypeService,balert,ConfigureMoldService){
        return {
            restrict : "A",
            link : function(scope, element){
                var setDlg = null;

                function init(){
                    scope.hrPieChart = {
                        GroupTitle : '',
                        ChartType : 'line',
                        DataType : '1',
						Background : "configure_bg",
                        SingleBiaxial : '1',
						HistoryDataType : "avg",
                        Y1Name : '',
                        Y1Min : '0',
                        Y1Max : 'auto',
                        Y2Name : '',
                        Y2Min : '0',
                        Y2Max : 'auto',
                        Days : '7'
                    };

					var style = localStorage.getItem("systemStyle");
					if(style == "White")
						scope.hrPieChart.Background = "white_bg";
                }
                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;
                        scope.Topology.DeviceId = scope.diagram.deviceId;
                        if(scope.Topology.DeviceId == undefined)
                            scope.Topology.DeviceId = scope.deviceList[0].equipmentId;

                        baseTypeService.getGaugeSignalBaseType(scope.Topology.DeviceId).then(function(data) {
                            var list = data;
                            scope.bind = {
                                siglist: list,
                                selectedsigs: undefined
                            };

                        });
                    });
                }
                /*********************************************************************/

                function initFunction(){
                    scope.bind = {};
                    scope.selected = {};
                    var showMultiSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showMultiDeviceSelect.html',
                        show:false
                    });

                    var filterOut = function(original, toFilter) {
                        if(toFilter == undefined) return original;
                        var filtered = [];
                        angular.forEach(original, function(entity) {
                            var match = false;
                            for (var i = 0; i < toFilter.length; i++) {
                                if (toFilter[i].deviceBaseTypeId == entity.deviceBaseTypeId &&
                                    toFilter[i].baseTypeId == entity.baseTypeId) {
                                    match = true;
                                    break;
                                }
                            }
                            if (!match) {
                                filtered.push(entity);
                            }
                        });
                        return filtered;
                    };

                    function fromJson(data){
                        var arr = [];
                        data.forEach(function(item){
                            arr.push(angular.fromJson(item));
                        });
                        return arr;
                    }

                    scope.refreshAvailable = function() {
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.bind.siglist);
                        scope.selected.available = [];
                        scope.selected.current = [];
                    };

                    scope.addMulti = function() {
                        scope.selected.available = fromJson(scope.selected.available);
                        if(!scope.bind.selectedsigs) scope.bind.selectedsigs = scope.selected.available;
                        else scope.bind.selectedsigs = scope.bind.selectedsigs.concat(scope.selected.available);
                        scope.bind.siglist = filterOut(scope.bind.siglist, scope.selected.available);
                        scope.refreshAvailable();
                    };

                    scope.removeMulti = function() {
                        scope.selected.current = fromJson(scope.selected.current);
                        scope.bind.siglist = scope.bind.siglist.concat(scope.selected.current);
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.selected.current);
                        scope.refreshAvailable();
                    };

                    scope.showMultiSelect = function(obj,data){
                        scope.bind.selectedsigs = undefined;
                        scope.obj = obj;//对象字符串
                        if(data != undefined && data != ""){
                            var data = angular.fromJson(data);
                            scope.Topology.DeviceId = data[0].deviceBaseTypeId;
                            scope.bind.selectedsigs = data;
                        }
                        scope.changeDevice(scope.Topology.DeviceId);
                        showMultiSelectDlg.$promise.then(showMultiSelectDlg.show);
                    };

                    scope.saveMultiSelect = function(deviceId,obj){
                        if(scope.bind.selectedsigs == undefined || scope.bind.selectedsigs.length == 0){
                            balert.show('danger', '信号不能为空！',3000);
                            return;
                        }
                        if(scope.hrPieChart.SingleBiaxial == 2 && scope.bind.selectedsigs.length > 1){
                            balert.show('danger', '双曲线不能选择多个信号！',3000);
                            return;
                        }

                        if(scope.bind.selectedsigs.length > 0){
                            var str = angular.toJson(scope.bind.selectedsigs);
                            eval(obj+"=str");
                        }
                        showMultiSelectDlg.hide();
                    };

                    scope.changeDevice = function(id){
                        baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                            scope.bind.siglist = filterOut(data, scope.bind.selectedsigs);
                        });
                    };
                }

                function getPartNum(typename){
                    var  num=1;
                    var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++)
                    {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum>=num){
                            num=partnum+1;
                        }
                    }
                    return num;
                }

                function parseBinding(data){
                    var result = data.DataType+'|'+data.Days+'|'+data.HistoryDataType;
                    if(data.DataType == 1){
                        result += '&';
                        var y1Signals = angular.fromJson(data.Y1Signals);
                        y1Signals.forEach(function(item){
                            result += 'BS:'+item.baseTypeId+'|DI:'+item.deviceBaseTypeId+"&";
                        });
                    }
                    if(data.DataType == 1 && data.SingleBiaxial == 2){
                        var y2Signals = angular.fromJson(data.Y2Signals);
                        y2Signals.forEach(function(item){
                            result += 'BS:'+item.baseTypeId+'|DI:'+item.deviceBaseTypeId;
                        });
                    }
                    return result;
                }

                element.bind('click',function(){
                    initFunction();
                    init();
                    initDevice();
                    setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/newhspiechartsetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);

                    scope.save = function(){
                        if(scope.hrPieChart.Days == undefined || scope.hrPieChart.Days == '' || isNaN(scope.hrPieChart.Days)){
                            balert.show('danger', '周期为数值并不能为空！',3000);
                            return;
                        }
                        if(scope.hrPieChart.SingleBiaxial == 1 &&  scope.hrPieChart.DataType == 1 &&
                            (scope.hrPieChart.Y1Signals == undefined || scope.hrPieChart.Y1Signals == '')){
                            balert.show('danger', 'Y1轴信号不能为空！',3000);
                            return;
                        }
                        if(scope.hrPieChart.SingleBiaxial == 2 &&  scope.hrPieChart.DataType == 1 &&
                            (scope.hrPieChart.Y2Signals == undefined || scope.hrPieChart.Y2Signals == '')){
                            balert.show('danger', 'Y2轴信号不能为空！',3000);
                            return;
                        }

                        var cofg ={};
                        cofg.id = "hspiechart"+getPartNum("hspiechart");
                        cofg.type = "hspiechartspart";
                        cofg.left = "5";
                        cofg.top = "80";
                        cofg.width = "400";
                        cofg.height = "300";
                        cofg.binding = parseBinding(scope.hrPieChart);
                        cofg.options = "Title:"+scope.hrPieChart.GroupTitle+"|ChartType:"+scope.hrPieChart.ChartType+"|DataType:"
                            +scope.hrPieChart.DataType+"|SingleBiaxial:"+scope.hrPieChart.SingleBiaxial+"|Y1Name:"
                            +scope.hrPieChart.Y1Name+"|Y1Min:"+scope.hrPieChart.Y1Min+"|Y1Max:"+scope.hrPieChart.Y1Max
                            +"|Y2Name:"+scope.hrPieChart.Y2Name+"|Y2Min:"+scope.hrPieChart.Y2Min+"|Y2Max:"+scope.hrPieChart.Y2Max
							+"|Background:"+scope.hrPieChart.Background;
                        scope.diagram.parts.push(cofg);
                        scope.resetParts();
                        setDlg.hide();
                    };
                });
            }
        }
    }
]);


nurseDirective.directive("hspiechartspart",['diagramService','global','$http','Exporter',
    function(diagramService,global,$http,Exporter){
        return{
            restrict: "AE",
            replace: true,
            templateUrl: "partials/hspiechartspart.html",
            link : function(scope, elem, attrs){
                var cfg = diagramService.initPart(scope, elem, attrs);
                if (cfg === undefined) return;
                var chartobj = elem.find('.pieChart')[0];
                var piechart = echarts.init(chartobj);

                var currpartid=scope.partid = attrs.partid;
                var ChartCfg = {};
                ChartCfg.Title = global.getpara("Title",cfg.options);
                ChartCfg.ChartType = global.getpara("ChartType",cfg.options);
                ChartCfg.DataType = global.getpara("DataType",cfg.options);
				ChartCfg.Background = global.getpara("Background",cfg.options);
                ChartCfg.SingleBiaxial = global.getpara("SingleBiaxial",cfg.options);
                ChartCfg.Y1Name = global.getpara("Y1Name",cfg.options);
                ChartCfg.Y1Min = global.getpara("Y1Min",cfg.options);
                ChartCfg.Y1Max = global.getpara("Y1Max",cfg.options);
                ChartCfg.Y2Name = global.getpara("Y2Name",cfg.options);
                ChartCfg.Y2Min = global.getpara("Y2Min",cfg.options);
                ChartCfg.Y2Max = global.getpara("Y2Max",cfg.options);
				//标题
                if(ChartCfg.Title == undefined || ChartCfg.Title == "")
					elem.find(".isShow").hide();
                else
                	elem.find(".title").html(ChartCfg.Title);

                //linux系统隐藏导出按钮
				if(window.navigator.userAgent.indexOf("Windows") == -1)
					elem.find(".isShow i").hide();

                //背景
				if(ChartCfg.Background == undefined)
					elem.find(".chart-body").addClass("configure_bg");
				else
					elem.find(".chart-body").addClass(ChartCfg.Background);

                var chartOption = {};
                getOption(ChartCfg,cfg.binding);

                //nWidth:DIV宽度 nHeight:DIV高度  raw:默认大小
                function getChartPercent(nWidth,nHeight,raw){
                    if(nWidth > nHeight){
                        return nHeight/raw;
                    }else{
                        return nWidth/raw;
                    }
                }

                function getOption(ChartCfg,binding){
                    chartOption = {};
                    var arr = binding.split("&");

                    var per = getChartPercent(chartobj.clientWidth,chartobj.clientHeight,300);
                    var fontSize = per*26 > 20 ? 20 : per*26;
                    elem.find(".title").css("fontSize",fontSize+"px");

					var sysStyle = localStorage.getItem("systemStyle");
                    if(ChartCfg.SingleBiaxial == 1){
                        $http.get("data/LineOrBarCharts.json").success(function(data) {
                            var opt = data;
							if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
								opt.title.textStyle.color = "#464952";
								opt.legend.textStyle.color = "#464952";
								opt.xAxis[0].axisLabel.textStyle.color = "#464952";
								opt.yAxis[0].axisLabel.textStyle.color = "#464952";
							}

                            //opt.title.text = ChartCfg.Title;
                            //隐藏Y轴
                            if(ChartCfg.Y1Name == "false")
                                opt.yAxis[0].show = false;
                            else
                                opt.yAxis[0].name = ChartCfg.Y1Name;
                            opt.yAxis[0].min = ChartCfg.Y1Min;
                            opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;
                            var colorArr = ["rgba(255, 127, 80, 0.6)","rgba(135, 206, 250, 0.6)","rgba(193, 35, 43, 0.6)","rgba(252, 206, 16, 0.6)","rgba(155, 202, 99, 0.6)"];

                            var index = 0;
                            for(var i = 0;i < arr.length;i ++){
                                var ser = ChartCfg.DataType == 1 ? arr[i].split("|") : "BS:PUE".split("|");
                                for(var j = 0;j < ser.length;j++){
                                    if(ser[j].indexOf("BS") == -1) continue;
                                    var series = {
                                        name : '',
                                        type : ChartCfg.ChartType,
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
                                                {type : "max", name: "最大值"},
                                                {type : "min", name: "最小值"}
                                            ]
                                        }
                                    };
                                    index ++;
                                    if(index >= colorArr.length) index = 0;

                                    opt.series.push(series);
                                }

                                //默认值
                                opt.xAxis[0].data[0]= ["加载中......"];
                                chartOption = opt;

								try {
									window.onresize = piechart.resize(); //使第一个图表适应
									piechart.setOption(chartOption, true);
								}catch(e){
									console.log("EChart Error:"+e.message);
								}
                            }
                        });
                    }else if(ChartCfg.SingleBiaxial == 2){
                        $http.get("data/HyperbolaCharts.json").success(function(data) {
                            var opt = data;
							if(sysStyle == "White" && ChartCfg.Background != "gray_bg"){
								opt.title.textStyle.color = "#464952";
								opt.legend.textStyle.color = "#464952";
								opt.xAxis[0].axisLabel.textStyle.color = "#464952";
								opt.yAxis[0].axisLabel.textStyle.color = "#464952";
								opt.yAxis[1].axisLabel.textStyle.color = "#464952";
							}

                            //opt.title.text = ChartCfg.Title;
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

                            opt.yAxis[0].min = ChartCfg.Y1Min;
                            opt.yAxis[0].max = ChartCfg.Y1Max == "" ? "auto" : ChartCfg.Y1Max;

                            if(ChartCfg.Y2Name == "false")
                                opt.yAxis[1].show = false;
                            else
                                opt.yAxis[1].name = ChartCfg.Y2Name;
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
                                    /*itemStyle : {normal: {areaStyle: {
                                        color :  (function (){
                                            var zrColor1 = zrender.tool.color;
                                            return zrColor1.getLinearGradient(
                                                0, 200, 0, 400,
                                                [[0, 'rgba(255, 127, 80, 0.6)'],[0.1, 'rgba(255, 127, 80, 0.5)'],[1, 'rgba(255, 127, 80, 0)']]
                                            )
                                        })()
                                    }}},*/
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
                                    /*itemStyle : {normal: {areaStyle: {
                                        color :  (function (){
                                            var zrColor2 = zrender.tool.color;
                                            return zrColor2.getLinearGradient(
                                                0, 200, 0, 400,
                                                [[0, 'rgba(135, 206, 250, 0.6)'],[0.1, 'rgba(135, 206, 250, 0.5)'],[1, 'rgba(135, 206, 250, 0)']]
                                            )
                                        })()
                                    }}},*/
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
                            chartOption = opt;

							try {
								window.onresize = piechart.resize(); //使第一个图表适应
								piechart.setOption(chartOption, true);
							}catch(e){
								console.log("EChart Error:"+e.message);
							}
                        });
                    }
                };

                function initPieChats(list,currpartid,binddata,dataType){
                    if(chartOption.series == undefined) return;
                    var opt = [];
                    var dates = [];
                    if(dataType == 1){
                        var legendData = [];
                        list.forEach(function(item){
                            var value = _.findWhere(binddata, {partId: currpartid,deviceId:item.deviceId,baseTypeId:item.baseTypeId});
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
                    }else{
                        var value = _.findWhere(binddata, {partId: currpartid});
                        if(value == undefined || value.currentValue == undefined) return;
                        var cfg = {};
                        var data = angular.fromJson(value.currentValue);
                        cfg.signalName = "PUE";
                        cfg.datas = data.datas;
                        dates = data.dates;
                        opt.push(cfg);
                    }

                    var j = 0;
                    for(var i = 0; i < chartOption.series.length;i++){
                        if(chartOption.series[i].name == undefined || opt.length <= j) continue;
                        chartOption.series[i].name = opt[j].signalName;
                        chartOption.series[i].data = opt[j].datas;
                        if(opt.legend != undefined && opt.legend.data.length > 0)
                            chartOption.legend.data = opt.legend.data;
                        j ++;
                    }
                    chartOption.xAxis[0].data = dates;

                    try{
						window.onresize = piechart.resize(); //使第一个图表适应
						piechart.setOption(chartOption, true);
					}catch(e){
						console.log("EChart Error:"+e.message);
					}
                };

                scope.$watch('binddata', function(newValue, oldValue, scope) {
                    if(cfg.binding == undefined) return;
                    var arr = cfg.binding.split("&");
                    var list = [];
                    for(var i = 0 ; i < arr.length;i++){
                        if(arr[i].indexOf("BS") == -1) continue;
                        var sig = {};
                        sig.deviceId = global.getpara("DI",arr[i]);
                        sig.baseTypeId = global.getpara("BS",arr[i]);
                        list.push(sig);
                    }

                    initPieChats(list,currpartid,scope.binddata,ChartCfg.DataType);
                });

                scope.clickHsExport = function(event){
                    var partid = event.target.parentNode.parentNode.parentNode.attributes["partid"].nodeValue;
                    var chart = [];
                    scope.binddata.forEach(function(item){
                        if(item.partId == partid && item.currentValue != "加载中...")
                            chart.push(item);
                    });
                    if(chart.length == 0) return;
                    var exportData = getHsPieChatsExport(chart);
                    Exporter.toXls(exportData);
                };

                function getHsPieChatsExport(data) {
                    var arr = [];

                    arr.push({
                        name:scope.languageJson.Configuration.ActiveChartControl.Chart.Name,
                        data:scope.languageJson.Configuration.ActiveChartControl.Chart.Value,
                        date:scope.languageJson.Configuration.ActiveChartControl.Chart.Time
                    });//"名称" / "值" / "时间"

                    for(var i = 0;i < data.length;i++){
                        var value = angular.fromJson(data[i].currentValue);
                        for(var j = 0; j < value.datas.length;j++){
                            cfg = {};
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

                scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
                    diagramService.updateEditStatus(elem, newValue);
                });
            }
        }
    }
]);


nurseDirective.directive("basehspiechartsetter",['$modal','baseTypeService','global','balert','ConfigureMoldService',
    function($modal,baseTypeService,global,balert,ConfigureMoldService){
        return {
            restrict : "A",
            link : function(scope, element){
                function getPartConfig(diagram, id) {
                    var found = _.find(diagram.parts, function(part) {
                        return part.id === id;
                    });
                    return found;
                }

                /******************* 过滤设备列表 & 加载信号列表 **************************/
                function initDevice(){
                    var parentId = scope.diagram.parentId;
                    if(scope.diagram.deviceBaseTypeId == "1004" ||
                        (parseInt(scope.diagram.deviceBaseTypeId) >= 8888 && parseInt(scope.diagram.deviceBaseTypeId) < 9999))
                        parentId = "";
                    ConfigureMoldService.GetPartEquipments(parentId).then(function(data){
                        scope.deviceList = data;
                        scope.Topology.DeviceId = scope.deviceList[0].equipmentId;

                        baseTypeService.getGaugeSignalBaseType(scope.Topology.DeviceId).then(function(data) {
                            scope.bind.siglist = data;
                        });
                    });
                }
                /*********************************************************************/

                function initFunction(){
                    scope.selected = {};
                    var showMultiSelectDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/showMultiDeviceSelect.html',
                        show:false
                    });

                    var filterOut = function(original, toFilter) {
                        if(toFilter == undefined) return original;
                        var filtered = [];
                        angular.forEach(original, function(entity) {
                            var match = false;
                            for (var i = 0; i < toFilter.length; i++) {
                                if (toFilter[i].deviceBaseTypeId == entity.deviceBaseTypeId &&
                                    toFilter[i].baseTypeId == entity.baseTypeId) {
                                    match = true;
                                    break;
                                }
                            }
                            if (!match) {
                                filtered.push(entity);
                            }
                        });
                        return filtered;
                    };

                    function fromJson(data){
                        var arr = [];
                        data.forEach(function(item){
                            arr.push(angular.fromJson(item));
                        });
                        return arr;
                    }

                    scope.refreshAvailable = function() {
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.bind.siglist);
                        scope.selected.available = [];
                        scope.selected.current = [];
                    };

                    scope.addMulti = function() {
                        scope.selected.available = fromJson(scope.selected.available);
                        if(!scope.bind.selectedsigs) scope.bind.selectedsigs = scope.selected.available;
                        else scope.bind.selectedsigs = scope.bind.selectedsigs.concat(scope.selected.available);
                        scope.bind.siglist = filterOut(scope.bind.siglist, scope.selected.available);
                        scope.refreshAvailable();
                    };

                    scope.removeMulti = function() {
                        scope.selected.current = fromJson(scope.selected.current);
                        scope.bind.siglist = scope.bind.siglist.concat(scope.selected.current);
                        scope.bind.selectedsigs = filterOut(scope.bind.selectedsigs, scope.selected.current);
                        scope.refreshAvailable();
                    };

                    scope.showMultiSelect = function(obj,data){
                        scope.bind = {};
                        scope.obj = obj;//对象字符串
						var sig = [];
                        if(data != undefined && data != ""){
							sig = angular.fromJson(data);
							scope.Topology.DeviceId = sig[0].deviceBaseTypeId;
                        }
						baseTypeService.getGaugeSignalBaseType(scope.Topology.DeviceId).then(function(datas) {
							scope.bind = {
								siglist: filterOut(datas,sig),
								selectedsigs: sig
							};
						});
                        showMultiSelectDlg.$promise.then(showMultiSelectDlg.show);
                    };

                    scope.saveMultiSelect = function(deviceId,obj){
                        if(scope.bind.selectedsigs == undefined || scope.bind.selectedsigs.length == 0){
                            balert.show('danger', '信号不能为空！',3000);
                            return;
                        }
                        if(scope.hrPieChart.SingleBiaxial == 2 && scope.bind.selectedsigs.length > 1){
                            balert.show('danger', '双曲线不能选择多个信号！',3000);
                            return;
                        }

                        if(scope.bind.selectedsigs.length > 0){
                            var str = angular.toJson(scope.bind.selectedsigs);
                            eval(obj+"=str");
                        }
                        showMultiSelectDlg.hide();
                    };

                    scope.changeDevice = function(id){
                        baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                            scope.bind.siglist = filterOut(data, scope.bind.selectedsigs);

                        });
                    };
                }

                function init(){
                    scope.bind = {};
                    var partid = element.parent().parent().attr("partid");
                    scope.partid = partid;
                    var cfg = getPartConfig(scope.diagram, scope.partid);
                    scope.hrPieChart = {};
                    scope.hrPieChart.GroupTitle = global.getpara("Title",cfg.options);
                    scope.hrPieChart.ChartType = global.getpara("ChartType",cfg.options);
                    scope.hrPieChart.DataType = global.getpara("DataType",cfg.options);
					scope.hrPieChart.Background = global.getpara("Background",cfg.options);
                    scope.hrPieChart.SingleBiaxial = global.getpara("SingleBiaxial",cfg.options);
                    scope.hrPieChart.Y1Name = global.getpara("Y1Name",cfg.options);
                    scope.hrPieChart.Y1Min = global.getpara("Y1Min",cfg.options);
                    scope.hrPieChart.Y1Max = global.getpara("Y1Max",cfg.options);
                    scope.hrPieChart.Y2Name = global.getpara("Y2Name",cfg.options);
                    scope.hrPieChart.Y2Min = global.getpara("Y2Min",cfg.options);
                    scope.hrPieChart.Y2Max = global.getpara("Y2Max",cfg.options);
                    var bins = cfg.binding.split("&");
                    var types = bins[0].split("|");
                    scope.hrPieChart.Days = types[1];
					scope.hrPieChart.HistoryDataType = types.length > 2 ? types[2] : "avg";

                    if(scope.hrPieChart.SingleBiaxial == 1){
                        bins.forEach(function(item){
                            if(item.indexOf("BS") > -1){
                                var id = global.getpara("DI",item);
                                baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                                    var sigs = item.split("|");
                                    var arr = [];
                                    var cfgs = {};
                                    data.forEach(function(items){
                                        for(var i = 0;i < sigs.length;i++){
                                            if(sigs[i].indexOf("BS") == -1) break;
                                            var bid = global.getpara("BS",sigs[i]);
                                            if(items.baseTypeId == bid)  cfgs = items;
                                        }
                                    });
                                    if(scope.hrPieChart.Y1Signals == undefined || scope.hrPieChart.Y1Signals.length == 0)
                                        arr.push(cfgs);
                                    else{
                                        arr = angular.fromJson(scope.hrPieChart.Y1Signals);
                                        arr.push(cfgs);
                                    }
                                    scope.hrPieChart.Y1Signals = angular.toJson(arr);
                                });
                            }
                        });
                    }else if(scope.hrPieChart.SingleBiaxial == 2){
                        bins.forEach(function(item){
                            if(item.indexOf("BS") > -1){
                                var id = global.getpara("DI",item);
                                baseTypeService.getGaugeSignalBaseType(id).then(function(data) {
                                    var sigs = item.split("|");
                                    var cfgs = [];
                                    data.forEach(function(items){
                                        for(var i = 0;i < sigs.length;i++){
                                            if(sigs[i].indexOf("BS") == -1) break;
                                            var bid = global.getpara("BS",sigs[i]);
                                            if(items.baseTypeId == bid) cfgs.push(items);
                                        }
                                    });
                                    if(cfgs.length > 0){
                                        if(scope.hrPieChart.Y1Signals == undefined || scope.hrPieChart.Y1Signals == "")
                                            scope.hrPieChart.Y1Signals = angular.toJson(cfgs);
                                        else if(scope.hrPieChart.Y2Signals == undefined || scope.hrPieChart.Y2Signals == "")
                                            scope.hrPieChart.Y2Signals = angular.toJson(cfgs);
                                    }
                                });
                            }
                        });
                    }
                }

                function parseBinding(data){
                    var result = data.DataType+'|'+data.Days+'|'+data.HistoryDataType;
                    if(data.DataType == 1){
                        result += '&';
                        var y1Signals = angular.fromJson(data.Y1Signals);
                        y1Signals.forEach(function(item){
                            result += 'BS:'+item.baseTypeId+'|DI:'+item.deviceBaseTypeId+'&';
                        });
                    }
                    if(data.DataType == 1 && data.SingleBiaxial == 2){
                        var y2Signals = angular.fromJson(data.Y2Signals);
                        y2Signals.forEach(function(item){
                            result += 'BS:'+item.baseTypeId+'|DI:'+item.deviceBaseTypeId;
                        });
                    }
                    return result;
                }

                element.bind('click',function(){
                    init();
                    initDevice();
                    initFunction();
                    var setDlg = $modal({
                        scope:scope,
                        templateUrl:'partials/basehspiechartsetter.html',
                        show:false
                    });
                    setDlg.$promise.then(setDlg.show);

                    scope.save = function(){
                        var cofg = getPartConfig(scope.diagram, scope.partid);;
                        cofg.binding = parseBinding(scope.hrPieChart);
                        cofg.options = "Title:"+scope.hrPieChart.GroupTitle+"|ChartType:"+scope.hrPieChart.ChartType+"|DataType:"
                            +scope.hrPieChart.DataType+"|SingleBiaxial:"+scope.hrPieChart.SingleBiaxial+"|Y1Name:"
                            +scope.hrPieChart.Y1Name+"|Y1Min:"+scope.hrPieChart.Y1Min+"|Y1Max:"+scope.hrPieChart.Y1Max
                            +"|Y2Name:"+scope.hrPieChart.Y2Name+"|Y2Min:"+scope.hrPieChart.Y2Min+"|Y2Max:"+scope.hrPieChart.Y2Max
							+"|Background:"+scope.hrPieChart.Background;
                        scope.resetParts();
                        setDlg.hide();
                    };
                });
            }
        }
    }
]);


nurseDirective.directive("newpercentsetter",['$modal','equipmentTemplateService','baseTypeService','TemplateService','AlarmLinkageService','balert','equipmentService','base64',
	function($modal,equipmentTemplateService,baseTypeService,TemplateService,AlarmLinkageService,balert,equipmentService,base64){
		return {
			restrict : "A",
			link : function(scope, element){
				var setNewDlg = undefined, setPerDlg = undefined;

				function initFunction(){
					scope.addPercent = {
                        equal : 10,
						unit:"",
                        percents : []
                    };
                    scope.percentRatio = {};

					equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data) {
						scope.addPercent.Devices = data;
					});

					scope.changeDevice = function(id) {
						baseTypeService.GetSinalByEquipmentId(id).then(function(data) {
							scope.addPercent.Signals = data;
							scope.addPercent.signalId = undefined;
						});
					};

					scope.changeSignal = function(i,id){
						if(scope.addPercent.Signals == undefined) return;
						scope.addPercent.Signals.forEach(function(item){
							if(item.signalId == id){
								var symbol = "["+scope.addPercent.devicesId+","+id+"]";
								scope.ClickLi(i,symbol);
							}
						});
					};

					scope.ClickLi = function(id,symbol){
						if(scope.addPercent.startExpression == undefined)
							scope.addPercent.startExpression = "";

						var textDom = document.getElementById(id);
						var addStr = symbol;

						if (textDom.selectionStart || textDom.selectionStart == '0') {
							scope.addPercent.startExpression = scope.addPercent.startExpression.substring(0,scope.startPos)+addStr+
								scope.addPercent.startExpression.substring(scope.endPos);
							textDom.focus();
							textDom.selectionStart = scope.startPos + addStr.length;
							textDom.selectionEnd = scope.startPos + addStr.length;
							textDom.scrollTop = scope.scrollTop;
						}else {
							scope.addPercent.startExpression += addStr;
							textDom.focus();
						}
					};

					scope.CheckExpression = function(id){
						var textDom = document.getElementById(id);
						if (textDom.selectionStart || textDom.selectionStart == '0') {
							scope.startPos = textDom.selectionStart;
							scope.endPos = textDom.selectionEnd;
							scope.scrollTop = textDom.scrollTop;
						}
					};

					scope.addPercentRatioClick = function(){
					    var size = 0;
					    var minSymbol = ">=";
					    if(scope.addPercent.percents && scope.addPercent.percents.length > 0) {
                            size = scope.addPercent.percents.length;
                            minSymbol = ">=";
                        }else{
                            minSymbol = "";
                        }

                        if(scope.percentRatio.color == undefined)
						    scope.percentRatio.color = "#114baf";
						scope.percentRatio.minSymbol = minSymbol;
						scope.percentRatio.maxSymbol = "<";
						scope.percentRatio.maxValue = "";
						scope.percentRatio.percent = parseInt((100 / scope.addPercent.equal)*(size + 1));
						scope.percentRatio.controlLogActions = [];

						setPerDlg = $modal({
							scope:scope,
							templateUrl:'partials/addPercent.html',
							show:false
						});
						setPerDlg.$promise.then(setPerDlg.show);
					};

                    scope.changeDeviceTemplate = function(id){
                        scope.percentRatio.AllControlMeanings = [];
                        scope.percentRatio.Controls = [];
                        scope.percentRatio.ControlMeanings = [];
                        scope.percentRatio.ControlValue = "";

                        var TemplateId = 0;
                        scope.addPercent.Devices.forEach(function(item){
                            if(item.id == id) TemplateId = item.equipmentTemplateId;
                        });
                        TemplateService.GetRemoteControlByEquipmentTemplateId(TemplateId).then(function(data){
                            scope.percentRatio.Controls = data;
                            if(scope.percentRatio.Controls.length >0 ){
                                scope.percentRatio.control = scope.percentRatio.Controls[0];
                                TemplateService.GetControlMeaningsByEquipmentTemplateId(TemplateId).then(function(data){
                                    scope.percentRatio.AllControlMeanings = data;
                                    scope.changeControl(scope.percentRatio.Controls[0]);
                                });
                            }
                        });
                        scope.percentRatio.controlValue = undefined;
                    };

                    scope.changeControl = function(data){
                        var con = angular.fromJson(data);
                        if(con.CommandType == 2){
                            var obj = [];
                            scope.percentRatio.AllControlMeanings.forEach(function(item){
                                if(item.ControlId == con.ControlId)
                                    obj.push(item);
                            });
                            scope.percentRatio.ControlMeanings = obj;
                        }else{
                            scope.MaxValue = con.MaxValue;
                            scope.MinValue = con.MinValue;
                        }
                        scope.CommandType = con.CommandType;
                        scope.percentRatio.controlValue = undefined;
                    };

                    //添加遥控到控制列表
                    scope.changeControlValue = function(id){
                        if(id == undefined) return;
                        if(scope.percentRatio.controlLogActions == undefined || scope.percentRatio.controlLogActions == "")
                            scope.percentRatio.controlLogActions = [];
                        var fig = {};
                        scope.addPercent.Devices.forEach(function(item){
                            if(item.id == scope.percentRatio.claDevicesId){
                                fig.equipmentId = item.id;
                                fig.equipmentName = item.name;
                            }
                        });
                        scope.percentRatio.Controls.forEach(function(item){
                            var con = angular.fromJson(scope.percentRatio.control);
                            if(item.ControlId == con.ControlId){
                                fig.controlId = item.ControlId;
                                fig.controlName = item.ControlName;
                            }
                        });
                        scope.percentRatio.ControlMeanings.forEach(function(item){
                            if(item.ParameterValue == id){
                                fig.actionValue = item.ParameterValue;
                                fig.actionMeanings = item.Meanings;
                            }
                        });
                        var is = false;
                        scope.percentRatio.controlLogActions.forEach(function(item){
                            if(item.equipmentId == fig.equipmentId && item.controlId == fig.controlId &&
                                item.actionValue == fig.actionValue) is = true;
                        });
                        if(!is)
                            scope.percentRatio.controlLogActions.push(fig);
                    };

                    //添加遥调到控制列表
                    scope.addControlValue = function(controlValue){
                        var prompt = scope.languageJson.Linkage.Prompt;
                        if(controlValue == undefined || controlValue == ""){
                            balert.show('danger',prompt.NotControlValue,3000);/*"控制值不能为空！"*/
                            return;
                        }
                        if(!(parseFloat(controlValue) >= parseFloat(scope.MinValue) && parseFloat(controlValue) <= parseFloat(scope.MaxValue))){
                            /*控制值的取值范围是*/
                            balert.show('danger',prompt.ControlValueRange+":["+scope.MinValue+"-"+scope.MaxValue+"]",3000);
                            return;
                        }
                        if(scope.percentRatio.controlLogActions == undefined || scope.percentRatio.controlLogActions == "")
                            scope.percentRatio.controlLogActions = [];
                        var fig = {};
                        scope.addPercent.Devices.forEach(function(item){
                            if(item.id == scope.percentRatio.claDevicesId){
                                fig.equipmentId = item.id;
                                fig.equipmentName = item.name;
                            }
                        });
                        scope.percentRatio.Controls.forEach(function(item){
                            var con = angular.fromJson(scope.percentRatio.control);
                            if(item.ControlId == con.ControlId){
                                fig.controlId = item.ControlId;
                                fig.controlName = item.ControlName;
                            }
                        });
                        fig.actionValue = controlValue;
                        fig.actionMeanings = controlValue;

                        var is = false;
                        scope.percentRatio.controlLogActions.forEach(function(item){
                            if(item.equipmentId == fig.equipmentId && item.controlId == fig.controlId &&
                                item.actionValue == fig.actionValue) is = true;
                        });
                        if(!is)
                            scope.percentRatio.controlLogActions.push(fig);
                    };

                    scope.deleteMeaningsClick = function($index){
                        scope.percentRatio.controlLogActions.splice($index,1);
                    };

                    function parseExpression(exper,ratio){
                        /*if(exper.indexOf("(") != 0 || exper.lastIndexOf(")") != (exper.length - 1))
                            exper = "("+exper+")";*/
                        var str = "";
                        if(ratio.minSymbol && ratio.minSymbol != "" && ratio.minValue != ""){
                            str = exper+" "+ratio.minSymbol+" "+ratio.minValue;
                        }

                        if(ratio.maxSymbol && ratio.maxSymbol != "" && ratio.maxValue != ""){
                            if(str == "")
                                str = exper+" "+ratio.maxSymbol+" "+ratio.maxValue;
                            else
                                str = str+" AND "+exper+" "+ratio.maxSymbol+" "+ratio.maxValue;
                        }
                        return str;
                    }
                    function fromLinkageString(percents,exper){
                        if(percents){
                            var param = "";
                            percents.forEach(function(items){
                                if(items.linkage.controlLogActions && items.linkage.controlLogActions.length > 0){
                                    var linkage = {
                                        actionName : "能量柱#"+scope.addPercent.title+"-"+items.percent,
                                        startExpression : parseExpression(exper,items.linkage),
                                    };
                                    var res = items.percent+"|"+linkage.actionName+"|1|"+linkage.startExpression+"||";
                                    items.linkage.controlLogActions.forEach(function(item){
                                        res += item.equipmentId+"&"+item.controlId+"&"+item.actionValue+";";
                                    });
                                    param += res + "^";
                                }
                            });
                            return param;
                        }else
                            return undefined;
                    }

                    scope.addPercentRatio = function(){
                    	var prompt = scope.languageJson.Configuration.PercentControl.Prompt;
                        if(scope.percentRatio.percent == undefined || scope.percentRatio.percent == ""){
                            balert.show('danger', prompt.NotRatio,10000);/*'占比不能为空！'*/
                            return;
                        }
                        if(scope.percentRatio.minSymbol != "" && (scope.percentRatio.minValue == "" || scope.percentRatio.minValue == undefined)){
                            balert.show('danger', prompt.NotMin,10000);/*'最小值不能为空！'*/
                            return;
                        }
                        if(scope.percentRatio.maxSymbol != "" && (scope.percentRatio.maxValue == "" || scope.percentRatio.maxValue == undefined)){
                            balert.show('danger', prompt.NotMax,10000);/*'最大值不能为空！'*/
                            return;
                        }

                        if(scope.addPercent.percents == undefined) scope.addPercent.percents = [];
                        //拼接区间字符串
                        var section = "";
                        if(scope.percentRatio.minSymbol == "") section += "( -∞ , ";
                        else if(scope.percentRatio.minSymbol == ">") section += "( "+scope.percentRatio.minValue+" , ";
                        else section += "[ "+scope.percentRatio.minValue+" , ";

                        if(scope.percentRatio.maxSymbol == "") section += "+∞)";
                        else if(scope.percentRatio.maxSymbol == "<") section += scope.percentRatio.maxValue+" )";
                        else section += scope.percentRatio.maxValue+" ]";

                        //以对象存储
                        var per = {
                            percent : scope.percentRatio.percent,
                            color : scope.percentRatio.color,
                            section : section,
                            size : scope.percentRatio.controlLogActions == undefined ? 0 : scope.percentRatio.controlLogActions.length,
                            linkage : {
                                minSymbol : scope.percentRatio.minSymbol,
                                minValue : scope.percentRatio.minValue,
                                maxSymbol : scope.percentRatio.maxSymbol,
                                maxValue : scope.percentRatio.maxValue,
                                controlLogActions : scope.percentRatio.controlLogActions
                            }
                        };
                        scope.addPercent.percents.push(per);
                        setPerDlg.hide();

						scope.percentRatio.minValue = scope.percentRatio.maxValue;
                    };

                    scope.deleteClick = function($index){
                        scope.addPercent.percents.splice($index,1);
                        //修改组态的删除  并根据LogActionId删除数据
                    };

                    function getPartNum(typename){
                        var  num=1;
                        var cparts=scope.diagram.parts;
                        if(cparts == undefined){
                            scope.diagram.parts = [];
                            return 1;
                        }
                        for(var i=0;i<cparts.length;i++)
                        {
                            if(cparts[i].id.indexOf(typename)==-1)continue;
                            var partnum=parseInt(cparts[i].id.replace(typename,''));
                            if(partnum>=num){
                                num=partnum+1;
                            }
                        }
                        return num;
                    }

					function getActiveId(percent,data){
						var res = "";
						if(data){
							var split1 = data.split("|");
							split1.forEach(function(item){
								var split2 = item.split("-");
								if(split2[0] == percent) res = split2[1];
							});
						}
						return res;
					}

                    function parsePercent(percents,data){
                        if(percents){
                            var res = "";
                            percents.forEach(function(item){
                                if(res != "") res += ";";
                                res += item.percent+"&"+item.color+"&"+item.section+"&"+item.size+"&"+getActiveId(item.percent,data);
                            });
                            return res;
                        }else return "";
                    }

                    scope.addAlarmLinkage = function(){
						var prompt = scope.languageJson.Configuration.PercentControl.Prompt;
                        if(scope.addPercent.startExpression == undefined || scope.addPercent.startExpression == ""){
                            balert.show('danger', prompt.NotExpression,10000);/*'表达式不能为空！'*/
                            return;
                        }
						if(scope.addPercent.percents == undefined || scope.addPercent.percents.length == 0){
							balert.show('danger', prompt.NotRatioQueue,10000);/*'占比队列不能为空！'*/
							return;
						}
                        var linkage = fromLinkageString(scope.addPercent.percents,scope.addPercent.startExpression);
                        if(linkage && linkage != ""){
                            AlarmLinkageService.InsertSignalLinkage(linkage).then(function(data){
                                if(data != "ERROR"){
                                    equipmentService.ReLoadFSU();

                                    var cofg ={};
                                    cofg.id = "percent"+getPartNum("percent");
                                    cofg.type = "percentpart";
                                    cofg.left = "5";
                                    cofg.top = "80";
                                    cofg.width = "100";
                                    cofg.height = "400";
                                    cofg.binding = "expr:"+base64.encode(scope.addPercent.startExpression);
                                    cofg.options = "Title:"+scope.addPercent.title+"|Equal:"+scope.addPercent.equal+"|Percents:"+parsePercent(scope.addPercent.percents,data)+"|Unit:"+scope.addPercent.unit;
                                    scope.diagram.parts.push(cofg);
                                    scope.resetParts();
									setNewDlg.hide();
                                }else{
                                    balert.show('danger', prompt.AddError,10000);/*'添加失败！'*/
                                }
                            });
                        }else{
							var cofg ={};
							cofg.id = "percent"+getPartNum("percent");
							cofg.type = "percentpart";
							cofg.left = "5";
							cofg.top = "80";
							cofg.width = "400";
							cofg.height = "240";
							cofg.binding = "expr:"+base64.encode(scope.addPercent.startExpression);
							cofg.options = "Title:"+scope.addPercent.title+"|Equal:"+scope.addPercent.equal+"|Percents:"+parsePercent(scope.addPercent.percents,undefined)+"|Unit:"+scope.addPercent.unit;
							scope.diagram.parts.push(cofg);
							scope.resetParts();
							setNewDlg.hide();
                        }
                    };
				}


				element.bind('click',function(){
					initFunction();
					setNewDlg = $modal({
						scope:scope,
						templateUrl:'partials/newpercentsetter.html',
						show:false
					});
					setNewDlg.$promise.then(setNewDlg.show);
				});
			}
		}
	}
]);

nurseDirective.directive("percentpart",['diagramService','global','$http','Exporter',
	function(diagramService,global,$http,Exporter){
		return{
			restrict: "AE",
			replace: true,
			templateUrl: "partials/percentpart.html",
			link : function(scope, elem, attrs){
				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;
				var currpartid = scope.partid = attrs.partid;
				var title = global.getpara("Title",cfg.options);
				//percent-color-section-size-activeId;
				var percents = global.getpara("Percents",cfg.options);
				var pers = parsePercentArr(percents);
				var unit = global.getpara("Unit",cfg.options);

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

				// [废]生成柱状图
				function createEqual(pers){
					if(pers){
						pers.forEach(function(item){
							elem.find('.percent-equal').append("<div style='height: "+item.percent+"%'></div>");
						});
					}
				}
				//createEqual(pers);

				//仪表盘
				var chartOption = {};
				var chartObj = elem.find('.pie')[0];
				var echart = echarts.init(chartObj);
				function createGaugeChart(chartObj,percents){
					var per = getChartPercent(chartObj.clientWidth,chartObj.clientHeight,300);

					elem.find('.percent-title').text(title == "undefined" ? "" : title);
					var fontSize = per*26 > 20 ? 20 : per*26;
					elem.find('.percent-title').css("fontSize",fontSize+"px");

					var sysStyle = localStorage.getItem("systemStyle");
					$http.get("data/GaugeCharts.json").success(function(data){
						var option = data;
						if(sysStyle == "White")
							option.title.textStyle.color = "#464952";

						option.series[0].min = 0.5;
						option.series[0].max = (percents == undefined ? 10 : percents.length) + 0.5;
						option.series[0].splitNumber = (percents == undefined ? 10 : percents.length)*2;
						option.series[0].axisLine.lineStyle.color = createColor(percents);
						option.series[0].radius = per*210;
						option.series[0].axisLine.lineStyle.width = per*30;
						//option.series[0].axisLabel.textStyle.fontSize = per*20;
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

						chartOption = option;
					});
				}
				createGaugeChart(chartObj,pers);

				//nWidth:DIV宽度 nHeight:DIV高度  raw:默认大小
				function getChartPercent(nWidth,nHeight,raw){
					if(nWidth > nHeight){
						return nHeight/raw;
					}else{
						return nWidth/raw;
					}
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

				function parseGaugeChart(elem,percents,value){
					if(chartOption == undefined || chartOption.series == undefined) return;
					var cfg =  meetConditions(value.currentValue,percents);

					chartOption.series[0].data[0].value = cfg.index;
					chartOption.series[0].data[0].name = value.currentValue+" "+unit;

					window.onresize = echart.resize(); //使第一个图表适应
					echart.setOption(chartOption, true);
				}

				scope.$watch('binddata', function(newValue, oldValue, scope) {
					var value = _.findWhere(scope.binddata, {partId: currpartid});
					if(value == undefined) return;
					//仪表盘
					parseGaugeChart(elem,pers,value);

					//柱状图
					/*var cfg =  meetConditions(value.currentValue,pers);
					elem.find('.percent-progress').css("height",(cfg.percent == undefined ? "0" : cfg.percent)+"%");
					elem.find('.percent-progress').css("background",cfg.color);
					elem.find('.percent-progress').css("z-index",0);

                    elem.find('.percent-progress').html(value.currentValue);*//*+"<br/>"+cfg.percent+"%"*/
				});

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

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		}
	}
]);

nurseDirective.directive("percentsetter",['$modal','equipmentTemplateService','baseTypeService','TemplateService','AlarmLinkageService','balert','equipmentService','base64','global',
	function($modal,equipmentTemplateService,baseTypeService,TemplateService,AlarmLinkageService,balert,equipmentService,base64,global){
		return {
			restrict : 'A',
			link : function(scope,element){
				var setDlg = undefined, setPerDlg = undefined;

				function initPercent(){
					scope.addPercent = {};
					var partid = element.parent().parent().attr("partid");
					scope.partid = partid;
					var cfg = getPartConfig(scope.diagram, scope.partid);

					scope.addPercent.startExpression = base64.decode(global.getpara("expr",cfg.binding));
					scope.addPercent.title = global.getpara("Title",cfg.options);
					scope.addPercent.equal = global.getpara("Equal",cfg.options);
                    scope.addPercent.unit = global.getpara("Unit",cfg.options);

					//percent-color-section-size-activeId;
					var percents = global.getpara("Percents",cfg.options);
					scope.addPercent.percents = parsePercentArr(percents);

					function parsePercentArr(percents){
						var objs = percents.split(";");
						var arr = [];
						if(objs){
							objs.forEach(function(item){
								var obj = item.split("&");
								var cfg = {
									percent : parseFloat(obj[0]),
									color : obj[1],
									section : obj[2],
									size : obj[3],
									activeId : obj[4]
								};
								arr.push(cfg);
							});
						}
						arr = sortObj(arr,"percent");
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
								maxSymbol = ">";
								maxValue = parseFloat(section.substring(section.indexOf(",")+1,section.indexOf(")")));
							}else if(section.indexOf("]") != -1){
								maxSymbol = ">=";
								maxValue = parseFloat(section.substring(section.indexOf(",")+1,section.indexOf("]")));
							}
						}

						cfg.minSymbol = minSymbol;
						cfg.minValue = minValue;
						cfg.maxSymbol = maxSymbol;
						cfg.maxValue = maxValue;
						return cfg;
					}

					//排序
					function sortObj(array, key) {
						return array.sort(function(a, b) {
							var x = parseInt(a[key]);
							var y = parseInt(b[key]);
							return x - y;
						});
					}
				}

				function getPartConfig(diagram, id) {
					var found = _.find(diagram.parts, function(part) {
						return part.id === id;
					});
					return found;
				}

				function initFunction(){
					scope.percentRatio = {};

					equipmentTemplateService.GetEquipmentTemplatesByBaseType("").then(function(data) {
						scope.addPercent.Devices = data;
					});

					scope.changeDevice = function(id) {
						baseTypeService.GetSinalByEquipmentId(id).then(function(data) {
							scope.addPercent.Signals = data;
							scope.addPercent.signalId = undefined;
						});
					};

					scope.changeSignal = function(i,id){
						if(scope.addPercent.Signals == undefined) return;
						scope.addPercent.Signals.forEach(function(item){
							if(item.signalId == id){
								var symbol = "["+scope.addPercent.devicesId+","+id+"]";
								scope.ClickLi(i,symbol);
							}
						});
					};

					scope.ClickLi = function(id,symbol){
						if(scope.addPercent.startExpression == undefined)
							scope.addPercent.startExpression = "";

						var textDom = document.getElementById(id);
						var addStr = symbol;

						if (textDom.selectionStart || textDom.selectionStart == '0') {
							scope.addPercent.startExpression = scope.addPercent.startExpression.substring(0,scope.startPos)+addStr+
								scope.addPercent.startExpression.substring(scope.endPos);
							textDom.focus();
							textDom.selectionStart = scope.startPos + addStr.length;
							textDom.selectionEnd = scope.startPos + addStr.length;
							textDom.scrollTop = scope.scrollTop;
						}else {
							scope.addPercent.startExpression += addStr;
							textDom.focus();
						}
					};

					scope.CheckExpression = function(id){
						var textDom = document.getElementById(id);
						if (textDom.selectionStart || textDom.selectionStart == '0') {
							scope.startPos = textDom.selectionStart;
							scope.endPos = textDom.selectionEnd;
							scope.scrollTop = textDom.scrollTop;
						}
					};

					scope.addPercentRatioClick = function(){
						var size = 0;
						var minSymbol = ">";
						if(scope.addPercent.percents && scope.addPercent.percents.length > 0) {
							size = scope.addPercent.percents.length;
							minSymbol = ">";
						}else{
							minSymbol = "";
						}

						if(scope.percentRatio.color == undefined)
						    scope.percentRatio.color = "#114baf";
						scope.percentRatio.minSymbol = minSymbol;
						scope.percentRatio.maxSymbol = "<=";
						scope.percentRatio.maxValue = "";
						scope.percentRatio.percent = parseInt((100 / scope.addPercent.equal)*(size + 1));
						scope.percentRatio.controlLogActions = [];

						setPerDlg = $modal({
							scope:scope,
							templateUrl:'partials/addPercent.html',
							show:false
						});
						setPerDlg.$promise.then(setPerDlg.show);
					};

					scope.changeDeviceTemplate = function(id){
						scope.percentRatio.AllControlMeanings = [];
						scope.percentRatio.Controls = [];
						scope.percentRatio.ControlMeanings = [];
						scope.percentRatio.ControlValue = "";

						var TemplateId = 0;
						scope.addPercent.Devices.forEach(function(item){
							if(item.id == id) TemplateId = item.equipmentTemplateId;
						});
						TemplateService.GetRemoteControlByEquipmentTemplateId(TemplateId).then(function(data){
							scope.percentRatio.Controls = data;
							if(scope.percentRatio.Controls.length >0 ){
								scope.percentRatio.control = scope.percentRatio.Controls[0];
								TemplateService.GetControlMeaningsByEquipmentTemplateId(TemplateId).then(function(data){
									scope.percentRatio.AllControlMeanings = data;
									scope.changeControl(scope.percentRatio.Controls[0]);
								});
							}
						});
						scope.percentRatio.controlValue = undefined;
					};

					scope.changeControl = function(data){
						var con = angular.fromJson(data);
						if(con.CommandType == 2){
							var obj = [];
							scope.percentRatio.AllControlMeanings.forEach(function(item){
								if(item.ControlId == con.ControlId)
									obj.push(item);
							});
							scope.percentRatio.ControlMeanings = obj;
						}else{
							scope.MaxValue = con.MaxValue;
							scope.MinValue = con.MinValue;
						}
						scope.CommandType = con.CommandType;
						scope.percentRatio.controlValue = undefined;
					};

					//添加遥控到控制列表
					scope.changeControlValue = function(id){
						if(id == undefined) return;
						if(scope.percentRatio.controlLogActions == undefined || scope.percentRatio.controlLogActions == "")
							scope.percentRatio.controlLogActions = [];
						var fig = {};
						scope.addPercent.Devices.forEach(function(item){
							if(item.id == scope.percentRatio.claDevicesId){
								fig.equipmentId = item.id;
								fig.equipmentName = item.name;
							}
						});
						scope.percentRatio.Controls.forEach(function(item){
							var con = angular.fromJson(scope.percentRatio.control);
							if(item.ControlId == con.ControlId){
								fig.controlId = item.ControlId;
								fig.controlName = item.ControlName;
							}
						});
						scope.percentRatio.ControlMeanings.forEach(function(item){
							if(item.ParameterValue == id){
								fig.actionValue = item.ParameterValue;
								fig.actionMeanings = item.Meanings;
							}
						});
						var is = false;
						scope.percentRatio.controlLogActions.forEach(function(item){
							if(item.equipmentId == fig.equipmentId && item.controlId == fig.controlId &&
								item.actionValue == fig.actionValue) is = true;
						});
						if(!is)
							scope.percentRatio.controlLogActions.push(fig);
					};

					//添加遥调到控制列表
					scope.addControlValue = function(controlValue){
						var prompt = scope.languageJson.Linkage.Prompt;
						if(controlValue == undefined || controlValue == ""){
							balert.show('danger',prompt.NotControlValue,3000);/*"控制值不能为空！"*/
							return;
						}
						if(!(parseFloat(controlValue) >= parseFloat(scope.MinValue) && parseFloat(controlValue) <= parseFloat(scope.MaxValue))){
							/*控制值的取值范围是*/
							balert.show('danger',prompt.ControlValueRange+":["+scope.MinValue+"-"+scope.MaxValue+"]",3000);
							return;
						}
						if(scope.percentRatio.controlLogActions == undefined || scope.percentRatio.controlLogActions == "")
							scope.percentRatio.controlLogActions = [];
						var fig = {};
						scope.addPercent.Devices.forEach(function(item){
							if(item.id == scope.percentRatio.claDevicesId){
								fig.equipmentId = item.id;
								fig.equipmentName = item.name;
							}
						});
						scope.percentRatio.Controls.forEach(function(item){
							var con = angular.fromJson(scope.percentRatio.control);
							if(item.ControlId == con.ControlId){
								fig.controlId = item.ControlId;
								fig.controlName = item.ControlName;
							}
						});
						fig.actionValue = controlValue;
						fig.actionMeanings = controlValue;

						var is = false;
						scope.percentRatio.controlLogActions.forEach(function(item){
							if(item.equipmentId == fig.equipmentId && item.controlId == fig.controlId &&
								item.actionValue == fig.actionValue) is = true;
						});
						if(!is)
							scope.percentRatio.controlLogActions.push(fig);
					};

					scope.deleteMeaningsClick = function($index){
						scope.percentRatio.controlLogActions.splice($index,1);
					};

					function parseExpression(exper,ratio){
						/*if(exper.indexOf("(") != 0 || exper.lastIndexOf(")") != (exper.length - 1))
							exper = "("+exper+")";*/
						var str = "";
						if(ratio.minSymbol && ratio.minSymbol != "" && ratio.minValue != ""){
							str = exper+" "+ratio.minSymbol+" "+ratio.minValue;
						}

						if(ratio.maxSymbol && ratio.maxSymbol != "" && ratio.maxValue != ""){
							if(str == "")
								str = exper+" "+ratio.maxSymbol+" "+ratio.maxValue;
							else
								str = str+" AND "+exper+" "+ratio.maxSymbol+" "+ratio.maxValue;
						}
						return str;
					}
					function fromLinkageString(percents,exper){
						if(percents){
							var param = "";
							percents.forEach(function(items){
								if(items.activeId == undefined || items.activeId == ""){
									if(items.linkage && items.linkage.controlLogActions && items.linkage.controlLogActions.length > 0){
										var linkage = {
											actionName : "能量柱#"+scope.addPercent.title+"-"+items.percent,
											startExpression : parseExpression(exper,items.linkage),
										};
										var res = items.percent+"|"+linkage.actionName+"|1|"+linkage.startExpression+"||";
										items.linkage.controlLogActions.forEach(function(item){
											res += item.equipmentId+"&"+item.controlId+"&"+item.actionValue+";";
										});
										param += res + "^";
									}
								}
							});
							return param;
						}else
							return undefined;
					}

					scope.addPercentRatio = function(){
						var prompt = scope.languageJson.Configuration.PercentControl.Prompt;
						if(scope.percentRatio.percent == undefined || scope.percentRatio.percent == ""){
							balert.show('danger', prompt.NotRatio,10000);/*'占比不能为空！'*/
							return;
						}
                        if(scope.percentRatio.minSymbol != "" && (scope.percentRatio.minValue == "" || scope.percentRatio.minValue == undefined)){
                            balert.show('danger', prompt.NotMin,10000);/*'最小值不能为空！'*/
                            return;
                        }
                        if(scope.percentRatio.maxSymbol != "" && (scope.percentRatio.maxValue == "" || scope.percentRatio.maxValue == undefined)){
                            balert.show('danger', prompt.NotMax,10000);/*'最大值不能为空！'*/
                            return;
                        }

						if(scope.addPercent.percents == undefined) scope.addPercent.percents = [];
						//拼接区间字符串
						var section = "";
						if(scope.percentRatio.minSymbol == "") section += "( -∞ , ";
						else if(scope.percentRatio.minSymbol == ">") section += "( "+scope.percentRatio.minValue+" , ";
						else section += "[ "+scope.percentRatio.minValue+" , ";

						if(scope.percentRatio.maxSymbol == "") section += "+∞)";
						else if(scope.percentRatio.maxSymbol == "<") section += scope.percentRatio.maxValue+" )";
						else section += scope.percentRatio.maxValue+" ]";

						//以对象存储
						var per = {
							percent : scope.percentRatio.percent,
							color : scope.percentRatio.color,
							section : section,
							size : scope.percentRatio.controlLogActions == undefined ? 0 : scope.percentRatio.controlLogActions.length,
							linkage : {
								minSymbol : scope.percentRatio.minSymbol,
								minValue : scope.percentRatio.minValue,
								maxSymbol : scope.percentRatio.maxSymbol,
								maxValue : scope.percentRatio.maxValue,
								controlLogActions : scope.percentRatio.controlLogActions
							}
						};
						scope.addPercent.percents.push(per);
						setPerDlg.hide();

						scope.percentRatio.minValue = scope.percentRatio.maxValue;
					};

					scope.deleteClick = function($index,activeId){
						scope.addPercent.percents.splice($index,1);
						//修改组态的删除  并根据LogActionId删除数据
						AlarmLinkageService.DeleteAlarmLinkage(activeId);
					};

					function getActiveId(percent,data){
						var res = "";
						if(data){
							var split1 = data.split("|");
							split1.forEach(function(item){
								var split2 = item.split("-");
								if(split2[0] == percent) res = split2[1];
							});
						}
						return res;
					}

					function parsePercent(percents,data){
						if(percents){
							var res = "";
							percents.forEach(function(item){
								if(res != "") res += ";";
								if(item.activeId && item.activeId != "")
									res += item.percent+"&"+item.color+"&"+item.section+"&"+item.size+"&"+item.activeId;
								else
									res += item.percent+"&"+item.color+"&"+item.section+"&"+item.size+"&"+getActiveId(item.percent,data);
							});
							return res;
						}else return "";
					}

					scope.addAlarmLinkage = function(){
						var prompt = scope.languageJson.Configuration.PercentControl.Prompt;
						if(scope.addPercent.startExpression == undefined || scope.addPercent.startExpression == ""){
							balert.show('danger', prompt.NotExpression,10000);/*'表达式不能为空！'*/
							return;
						}
						if(scope.addPercent.percents == undefined || scope.addPercent.percents.length == 0){
							balert.show('danger', prompt.NotRatioQueue,10000);/*'占比队列不能为空！'*/
							return;
						}
						var linkage = fromLinkageString(scope.addPercent.percents,scope.addPercent.startExpression);
						if(linkage && linkage != ""){
							AlarmLinkageService.InsertSignalLinkage(linkage).then(function(data){
								if(data != "ERROR"){
									equipmentService.ReLoadFSU();

									var cofg = getPartConfig(scope.diagram, scope.partid);
									cofg.binding = "expr:"+base64.encode(scope.addPercent.startExpression);
									cofg.options = "Title:"+scope.addPercent.title+"|Equal:"+scope.addPercent.equal+"|Percents:"+parsePercent(scope.addPercent.percents,data)+"|Unit:"+scope.addPercent.unit;

									scope.resetParts();
									setDlg.hide();
								}else{
									balert.show('danger', prompt.AddError,10000);/*'添加失败！'*/
								}
							});
						}else{
							var cofg = getPartConfig(scope.diagram, scope.partid);
							cofg.binding = "expr:"+base64.encode(scope.addPercent.startExpression);
							cofg.options = "Title:"+scope.addPercent.title+"|Equal:"+scope.addPercent.equal+"|Percents:"+parsePercent(scope.addPercent.percents,undefined)+"|Unit:"+scope.addPercent.unit;

							scope.resetParts();
							setDlg.hide();
						}
					};
				}

				element.bind('click',function(){
					initPercent();
					initFunction();
					setDlg = $modal({
						scope:scope,
						templateUrl:'partials/percentsetter.html',
						show:false
					});
					setDlg.$promise.then(setDlg.show);
				});
			}
		}
	}
]);

/*********************** 组态 --  3D MDC   Start  *************************/
nurseDirective.directive("newlarymdcsetter",['$modal',
    function($modal){
        return {
            restrict : "A",
            link : function(scope, element){
                function getPartNum(typename){
                    var  num = 1;
                    var cparts=scope.diagram.parts;
                    if(cparts == undefined){
                        scope.diagram.parts = [];
                        return 1;
                    }
                    for(var i=0;i<cparts.length;i++)
                    {
                        if(cparts[i].id.indexOf(typename)==-1)continue;
                        var partnum=parseInt(cparts[i].id.replace(typename,''));
                        if(partnum>=num){
                            num=partnum+1;
                        }
                    }
                    return num;
                }

                element.bind('click',function(){
                    var cofg = {};
                    cofg.id = "laryMdc"+getPartNum("laryMdc");
                    cofg.type = "larymdcpart";
                    cofg.left = "5";
                    cofg.top = "80";
                    cofg.width = "600";
                    cofg.height = "360";
                    scope.diagram.parts.push(cofg);
                    scope.resetParts();
                });
            }
        }
    }
]);

nurseDirective.directive("larymdcpart",['diagramService','MdcAlarmService',
    function(diagramService,MdcAlarmService){
        return{
            restrict: "AE",
            replace: true,
            templateUrl: "partials/laryMdcPart.html",
            link : function(scope, elem, attrs){
                var cfg = diagramService.initPart(scope, elem, attrs);
                if (cfg === undefined) return;
				var mdcConfig = undefined;
				//window.lary = Lary.create("renderCanvas", mdcConfig);
				MdcAlarmService.GetCabinetListInfo("").then(function(data){
					window.lary = Lary.create("renderCanvas", data);
					mdcConfig = data;
					//lary.refresh(mdcConfig);
				});

                scope.showSide = function(){
                    lary.showSide();
                };

                //alarm的告警测试，打开即可观看效果
                function randomAlarm() {
                    var rand = mdcConfig.racks[Math.floor(Math.random() * mdcConfig.racks.length)];

                    var randLevel = Math.floor(Math.random() * 5);
                    if (randLevel === 0) {
                        rand.state = "default";
                    } else {
                        rand.state = "alarm";
                    }
                    rand.level = randLevel;

                    lary.refresh(mdcConfig);
                }

                //setInterval(randomAlarm, 2000);


                //capacity的测试，打开即可观看效果
                function randomCapacity() {
                    var rand = mdcConfig.racks[Math.floor(Math.random() * mdcConfig.racks.length)];

                    rand.percent = Math.floor(Math.random() * 100);

                    rand.state = "capacity";

                    lary.refresh(mdcConfig);
                }

                //setInterval(randomCapacity, 3000);

                scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
                    diagramService.updateEditStatus(elem, newValue);
                });
            }
        }
    }
]);
/*********************** 组态 --  3D MDC   End  *************************/

/*********************** 组态 --  新增告警列表  Start  *************************/
nurseDirective.directive("newalarmlistsetter",['$modal',
	function($modal){
		return {
			restrict : "A",
			link : function(scope, element){
				function getPartNum(typename){
					var  num = 1;
					var cparts=scope.diagram.parts;
					if(cparts == undefined){
						scope.diagram.parts = [];
						return 1;
					}
					for(var i=0;i<cparts.length;i++)
					{
						if(cparts[i].id.indexOf(typename)==-1)continue;
						var partnum=parseInt(cparts[i].id.replace(typename,''));
						if(partnum>=num){
							num=partnum+1;
						}
					}
					return num;
				}

				element.bind('click',function(){
					var cofg = {};
					cofg.id = "alarmlist"+getPartNum("alarmlist");
					cofg.type = "alarmlistpart";
					cofg.left = "5";
					cofg.top = "80";
					cofg.width = "490";
					cofg.height = "296";
					scope.diagram.parts.push(cofg);
					scope.resetParts();
				});
			}
		}
	}
]);

nurseDirective.directive("alarmlistpart",['$interval','diagramService','alarmService',
	function($interval,diagramService,alarmService){
		return{
			restrict: "AE",
			replace: true,
			templateUrl: "partials/alarmListPart.html",
			link : function(scope, elem, attrs){
				var cfg = diagramService.initPart(scope, elem, attrs);
				if (cfg === undefined) return;

				scope.levelFilter = {
					levelUrgent : true,
					levelImportant : true,
					levelCommon : true,
					levelTip : true
				};

				function filterLevelAlarms (data) {
					var farr = [];

					if (scope.levelFilter.levelTip) farr.push(0);
					if (scope.levelFilter.levelCommon) farr.push(1);
					if (scope.levelFilter.levelImportant) farr.push(2);
					if (scope.levelFilter.levelUrgent) farr.push(3);

					var ret = _.filter(data, function(alarm) {
						return _.contains(farr, parseInt(alarm.alarmLevel));
					});

					return ret;
				}

				function loadActiveAlarm(){
					alarmService.updateActiveAlarmList().then(function(data) {
						scope.ActiveAlarm = filterLevelAlarms(data);
					});
				}

				scope.checkTest = function(type){
					if(type == 'levelUrgent')
						scope.levelFilter.levelUrgent = !scope.levelFilter.levelUrgent;
					else if(type == 'levelImportant')
						scope.levelFilter.levelImportant = !scope.levelFilter.levelImportant;
					else if(type == 'levelCommon')
						scope.levelFilter.levelCommon = !scope.levelFilter.levelCommon;
					else if(type == 'levelTip')
						scope.levelFilter.levelTip = !scope.levelFilter.levelTip;

					loadActiveAlarm();
				};

				var stop = undefined;
				scope.start = function() {
					if (angular.isDefined(stop)) return;
					loadActiveAlarm();
					stop = $interval(function() {
						loadActiveAlarm();
					}, 3000);
				};

				scope.stop = function() {
					if (angular.isDefined(stop)) {
						$interval.cancel(stop);
						stop = undefined;
					}
				};

				scope.$on('$destroy', function() {
					scope.stop();
				});

				scope.start();

				scope.$watch('diagram.edit', function(newValue, oldValue, scope) {
					diagramService.updateEditStatus(elem, newValue);
				});
			}
		}
	}
]);
/*********************** 组态 --  新增告警列表  End  *************************/

nurseDirective.directive('servertime',['TimerService','$interval','$modal','balert',
    function(TimerService, $interval,$modal,balert){
        return {
            restrict: 'AE',
			replace: "true",
			template: "<div  ng-click='timeSettingClick()'>" +
				"	<div id='time-server' class='clock'>{{timelabel}}</div>"+
				"</div>",
            link: function(scope, element) {

                function updateTimer(){ 
                	scope.time.setSeconds(scope.time.getSeconds() + 1);
 					scope.timelabel = scope.time.getFromFormat('yyyy-mm-dd hh:ii:ss');
                }

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

                var updStop = undefined;
                function init(){
                    TimerService.getSystemTime().then(function(data) {
                        var d = new Date(data);
                        var localTime = d.getTime();
                        var localOffset=d.getTimezoneOffset()*60000; //获得当地时间偏移的毫秒数   问题就在这
                        var utc = localTime - localOffset; //utc即GMT时间
                        var offset = 0;//时区
                        var hawaii = utc + (3600000*offset);
                        scope.time = new Date(hawaii);
                        updStop = $interval(updateTimer, 1000);
                    });                    
                }

                init();

				var timeSettingDialog = null;
                //校时弹出框
				scope.timeSettingClick = function(){
					timeSettingDialog = $modal({
						scope: scope,
						templateUrl: 'partials/timeSetting.html',
						show: false
					});
					timeSettingDialog.$promise.then(timeSettingDialog.show);
					var date = new Date();
					scope.dateTime = date.getFullYear() + "-" +  (date.getMonth() + 1) + "-" +  date.getDate() +
						" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
				};
				//修改时间
				scope.timeSave = function(){
					scope.dateTime = $("#dateTime").val();
					var regTime = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/;
					if(!regTime.test(scope.dateTime)){
						//时间格式不正确，请重新输入！
						balert.show('danger',scope.languageJson.Header.Advanced.Timing.FormatError,3000);
						return;
					}
					TimerService.DateTimeTiming(scope.dateTime).then(function(data){
						if(data == "OK"){
							//校时成功！
							balert.show('success',scope.languageJson.Header.Advanced.Timing.TimingSucceed,3000);
							timeSettingDialog.hide();

							if(angular.isDefined(updStop)){
								$interval.cancel(updStop);
								updStop = undefined;
							}
							init();
						}else if(data === "NotLinuxSystem"){
							//不支持当前系统！
							balert.show('danger',scope.languageJson.Header.Advanced.Timing.NotSystem,3000);
						}else{
							//校时失败！
							balert.show('danger',scope.languageJson.Header.Advanced.Timing.TimingError,3000);
						}
					});
				};

                //一小时定时校时
                $interval(function() {
                    if(angular.isDefined(updStop)){
                        $interval.cancel(updStop);
                        updStop = undefined;
                    }
                    init();
                }, 1000*60*60);

            }
        }
    }
]);



nurseDirective.directive('ngRightClick', function($parse) {
	return function(scope, element, attrs) {
		var fn = $parse(attrs.ngRightClick);
		element.bind('contextmenu', function(event) {
			scope.$apply(function() {
				event.preventDefault();
				fn(scope, {
					$event: event
				});
			});
		});
	};
});


nurseDirective.directive("checkbox", function() {
	return {
		scope: {},
		require: "ngModel",
		restrict: "E",
		replace: "true",
		template: "<button type=\"button\" ng-style=\"stylebtn\" class=\"btn btn-default\" ng-class=\"{'btn-xs': size==='default', 'btn-sm': size==='large', 'btn-lg': size==='largest', 'checked': checked===true}\">" +
			"<span ng-style=\"styleicon\" class=\"glyphicon\" ng-class=\"{'glyphicon-ok': checked===true}\"></span>" +
			"</button>",
		link: function(scope, elem, attrs, modelCtrl) {
			scope.size = "default";
			// Default Button Styling
			scope.stylebtn = {
				"display":"inline-block",
				"width":"32px",
				"height":"32px"
			};
			// Default Checkmark Styling
			scope.styleicon = {
				"width": "10px",
				"left": "-4px"
			};
			// If size is undefined, Checkbox has normal size (Bootstrap 'xs')
			if (attrs.large !== undefined) {
				scope.size = "large";
				scope.stylebtn = {
					"padding-top": "2px",
					"padding-bottom": "2px",
					"height": "30px"
				};
				scope.styleicon = {
					"width": "8px",
					"left": "-5px",
					"font-size": "17px"
				};
			}
			if (attrs.larger !== undefined) {
				scope.size = "larger";
				scope.stylebtn = {
					"padding-top": "2px",
					"padding-bottom": "2px",
					"height": "34px"
				};
				scope.styleicon = {
					"width": "8px",
					"left": "-8px",
					"font-size": "22px"
				};
			}
			if (attrs.largest !== undefined) {
				scope.size = "largest";
				scope.stylebtn = {
					"padding-top": "2px",
					"padding-bottom": "2px",
					"height": "45px"
				};
				scope.styleicon = {
					"width": "11px",
					"left": "-11px",
					"font-size": "30px"
				};
			}

			var trueValue = true;
			var falseValue = false;

			// If defined set true value
			if (attrs.ngTrueValue !== undefined) {
				trueValue = attrs.ngTrueValue;
			}
			// If defined set false value
			if (attrs.ngFalseValue !== undefined) {
				falseValue = attrs.ngFalseValue;
			}

			// Check if name attribute is set and if so add it to the DOM element
			if (scope.name !== undefined) {
				elem.name = scope.name;
			}

			// Update element when model changes
			scope.$watch(function() {
				if (modelCtrl.$modelValue === trueValue || modelCtrl.$modelValue === true) {
					modelCtrl.$setViewValue(trueValue);
				} else {
					modelCtrl.$setViewValue(falseValue);
				}
				return modelCtrl.$modelValue;
			}, function(newVal, oldVal) {
				scope.checked = modelCtrl.$modelValue === trueValue;
			}, true);

			// On click swap value and trigger onChange function
			elem.bind("click", function() {
				scope.$apply(function() {
					if (modelCtrl.$modelValue === falseValue) {
						modelCtrl.$setViewValue(trueValue);
					} else {
						modelCtrl.$setViewValue(falseValue);
					}
				});
			});
		}
	};
});

nurseDirective.directive("spinner", function() {
	return {
		scope: {
			show:'=',
			tip:'@'
		},
		restrict: "EA",
		replace: "true",
		templateUrl: "partials/spinner.html",

		link: function(scope, elem, attrs) {

			scope.$watch("show", function(newValue, oldValue) {
				if (newValue == true) {
					elem.show();
				} else {
					elem.hide();
				}
			}, true);
		}
	};
});


nurseDirective.directive("tmPagination",	function(equipmentService) {
		return {
			restrict: 'EA',
			template: '<div class="page-list">' +
			'<ul class="pagination" ng-show="conf.totalItems > 0">' +
			'<li ng-class="{disabled: conf.currentPage == 1}" ng-click="prevPage()"><span>&laquo;</span></li>' +
			'<li ng-repeat="item in pageList track by $index" ng-class="{active: item == conf.currentPage, separate: item == \'...\'}" ' +
			'ng-click="changeCurrentPage(item)">' +
			'<span>{{ item }}</span>' +
			'</li>' +
			'<li ng-class="{disabled: conf.currentPage == conf.numberOfPages}" ng-click="nextPage()"><span>&raquo;</span></li>' +
			'</ul>' +
			'<div class="page-total pull-right input-group" ng-show="conf.totalItems > 0">' +
			'<!--第--><input class="btn  btn-default" style="width:50px; margin:5px;" type="text" ng-model="jumpPageNum"  ng-keyup="jumpToPage($event)"/>GO ' +
			'<!--每页--><select class="btn btn-default"  style="margin:5px;"  ng-model="conf.itemsPerPage" ng-options="option for option in conf.perPageOptions "></select>' +
			'/ <!--共--><strong>{{ conf.totalItems }}</strong><!--条-->' +
			'</div>' +
			'<div class="no-items" ng-show="conf.totalItems <= 0">暂无数据</div>' +
			'</div>',
			replace: true,
			scope: {
				conf: '='
			},
			link: function(scope, element, attrs){
				// 变更当前页
				scope.changeCurrentPage = function(item) {
					if(item == '...'){
						return;
					}else{
						scope.conf.currentPage = item;
					}
				};

				// 定义分页的长度必须为奇数 (default:9)
				scope.conf.pagesLength = parseInt(scope.conf.pagesLength) ? parseInt(scope.conf.pagesLength) : 9 ;
				if(scope.conf.pagesLength % 2 === 0){
					// 如果不是奇数的时候处理一下
					scope.conf.pagesLength = scope.conf.pagesLength -1;
				}

				// conf.erPageOptions
				if(!scope.conf.perPageOptions){
					scope.conf.perPageOptions = [10, 15, 20, 30, 50];
				}

				// prevPage
				scope.prevPage = function(){
					if(scope.conf.currentPage > 1){
						scope.conf.currentPage -= 1;
					}
				};
				// nextPage
				scope.nextPage = function(){
					if(scope.conf.currentPage < scope.conf.numberOfPages){
						scope.conf.currentPage += 1;
					}
				};

				// 跳转页
				scope.jumpToPage = function(){
					scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g,'');
					if(scope.jumpPageNum !== ''){
						scope.conf.currentPage = scope.jumpPageNum;
					}
				};

				//调用
				// pageList数组
				function getPagination(newValue, oldValue) {
					scope.count = 1;
					// conf.currentPage
					scope.conf.currentPage = parseInt(scope.conf.currentPage) ? parseInt(scope.conf.currentPage) : 1;

					// conf.totalItems
					scope.conf.totalItems = parseInt(scope.conf.totalItems) ? parseInt(scope.conf.totalItems) : 0;

					// conf.itemsPerPage (default:10)
					scope.conf.itemsPerPage = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 10;

					// numberOfPages
					scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems/scope.conf.itemsPerPage);

					// judge currentPage > scope.numberOfPages
					if(scope.conf.currentPage < 1){
						scope.conf.currentPage = 1;
					}

					// 如果分页总数>0，并且当前页大于分页总数
					if(scope.conf.numberOfPages > 0 && scope.conf.currentPage > scope.conf.numberOfPages){
						scope.conf.currentPage = scope.conf.numberOfPages;
					}

					// jumpPageNum
					scope.jumpPageNum = scope.conf.currentPage;

					// 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
					var perPageOptionsLength = scope.conf.perPageOptions.length;
					// 定义状态
					var perPageOptionsStatus;
					for(var i = 0; i < perPageOptionsLength; i++){
						if(scope.conf.perPageOptions[i] == scope.conf.itemsPerPage){
							perPageOptionsStatus = true;
						}
					}
					// 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
					if(!perPageOptionsStatus){
						scope.conf.perPageOptions.push(scope.conf.itemsPerPage);
					}

					// 对选项进行sort
					scope.conf.perPageOptions.sort(function(a, b){return a-b});

					scope.pageList = [];
					if(scope.conf.numberOfPages <= scope.conf.pagesLength){
						// 判断总页数如果小于等于分页的长度，若小于则直接显示
						for(i =1; i <= scope.conf.numberOfPages; i++){
							scope.pageList.push(i);
						}
					}else{
						// 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
						// 计算中心偏移量
						var offset = (scope.conf.pagesLength - 1)/2;
						if(scope.conf.currentPage <= offset){
							// 左边没有...
							for(i =1; i <= offset +1; i++){
								scope.pageList.push(i);
							}
							scope.pageList.push('...');
							scope.pageList.push(scope.conf.numberOfPages);
						}else if(scope.conf.currentPage > scope.conf.numberOfPages - offset){
							scope.pageList.push(1);
							scope.pageList.push('...');
							for(i = offset + 1; i >= 1; i--){
								scope.pageList.push(scope.conf.numberOfPages - i);
							}
							scope.pageList.push(scope.conf.numberOfPages);
						}else{
							// 最后一种情况，两边都有...
							scope.pageList.push(1);
							scope.pageList.push('...');

							for(i = Math.ceil(offset/2) ; i >= 1; i--){
								scope.pageList.push(scope.conf.currentPage - i);
							}
							scope.pageList.push(scope.conf.currentPage);
							for(i = 1; i <= offset/2; i++){
								scope.pageList.push(scope.conf.currentPage + i);
							}

							scope.pageList.push('...');
							scope.pageList.push(scope.conf.numberOfPages);
						}
					}

					if(scope.conf.onChange){


						// 防止初始化两次请求问题
						if(!(oldValue != newValue && oldValue[0] == 0)) {
							scope.conf.onChange();
						}
					}
					scope.$parent.conf = scope.conf;

					var getData = {
						pageIndex: scope.conf.currentPage,
						pageSize: scope.conf.itemsPerPage
					};

					equipmentService.getLimitEquipment((scope.conf.currentPage - 1) * scope.conf.itemsPerPage, scope.conf.itemsPerPage).then(function(data) {
						scope.conf.equipments = data;

						equipmentService.getEquipmentNums().then(function(data) {
							scope.conf.totalItems = data;
						});

					});
				}

				scope.$watch(function() {

					if(!scope.conf.totalItems) {
						scope.conf.totalItems = 0;
					}

					var newValue = scope.conf.totalItems + ' ' +  scope.conf.currentPage + ' ' + scope.conf.itemsPerPage;
					return newValue;

				}, getPagination);
			}
		};
	}
);

nurseDirective.directive("tmProtocolPagination",	function(equipmentTemplateService) {
	return {
		restrict: 'EA',
		template: '<div class="page-list">' +
		'<ul class="pagination" ng-show="pro.totalItems > 0">' +
		'<li ng-class="{disabled: pro.currentPage == 1}" ng-click="prevPage()"><span>&laquo;</span></li>' +
		'<li ng-repeat="item in pageList track by $index" ng-class="{active: item == pro.currentPage, separate: item == \'...\'}" ' +
		'ng-click="changeCurrentPage(item)">' +
		'<span>{{ item }}</span>' +
		'</li>' +
		'<li ng-class="{disabled: pro.currentPage == pro.numberOfPages}" ng-click="nextPage()"><span>&raquo;</span></li>' +
		'</ul>' +
		'<div class="page-total  pull-right input-group" ng-show="pro.totalItems > 0">' +
		'<!--第--><input class="btn  btn-default" style="width:50px; margin:5px;" type="text" ng-model="jumpPageNum"  ng-keyup="jumpToPage($event)"/>GO ' +
		'<!--每页--><select  class="btn  btn-default" style="margin:5px;" ng-model="pro.itemsPerPage" ng-options="option for option in pro.perPageOptions "></select>' +
		'/<!--共--><strong>{{ pro.totalItems }}</strong><!--条-->' +
		'</div>' +
		'<div class="no-items" ng-show="pro.totalItems <= 0">暂无数据</div>' +
		'</div>',
		replace: true,
		scope: {
			pro: '='
		},
		link: function (scope, element, attrs) {
			// 变更当前页
			scope.changeCurrentPage = function (item) {
				if (item == '...') {
					return;
				} else {
					scope.pro.currentPage = item;
				}
			};

			// 定义分页的长度必须为奇数 (default:9)
			scope.pro.pagesLength = parseInt(scope.pro.pagesLength) ? parseInt(scope.pro.pagesLength) : 9;
			if (scope.pro.pagesLength % 2 === 0) {
				// 如果不是奇数的时候处理一下
				scope.pro.pagesLength = scope.pro.pagesLength - 1;
			}

			// pro.erPageOptions
			if (!scope.pro.perPageOptions) {
				scope.pro.perPageOptions = [10, 15, 20, 30, 50];
			}

			// prevPage
			scope.prevPage = function () {
				if (scope.pro.currentPage > 1) {
					scope.pro.currentPage -= 1;
				}
			};
			// nextPage
			scope.nextPage = function () {
				if (scope.pro.currentPage < scope.pro.numberOfPages) {
					scope.pro.currentPage += 1;
				}
			};

			// 跳转页
			scope.jumpToPage = function () {
				scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g, '');
				if (scope.jumpPageNum !== '') {
					scope.pro.currentPage = scope.jumpPageNum;
				}
			};

			function getEquipmentTemplateList(data) {

				var resArray = [];

				data.forEach(function (element, index) {
					var template = {};
					template.EquipmentTemplateId = element.EquipmentTemplateId;
					template.EquipmentTemplateName = element.EquipmentTemplateName;
					resArray.push(alarm);
				});

				return resArray;
			}

			//调用
			// pageList数组
			function getPagination(newValue, oldValue) {
				scope.count = 1;
				// pro.currentPage
				scope.pro.currentPage = parseInt(scope.pro.currentPage) ? parseInt(scope.pro.currentPage) : 1;

				// pro.totalItems
				scope.pro.totalItems = parseInt(scope.pro.totalItems) ? parseInt(scope.pro.totalItems) : 0;

				// pro.itemsPerPage (default:10)
				scope.pro.itemsPerPage = parseInt(scope.pro.itemsPerPage) ? parseInt(scope.pro.itemsPerPage) : 10;

				// numberOfPages
				scope.pro.numberOfPages = Math.ceil(scope.pro.totalItems / scope.pro.itemsPerPage);

				// judge currentPage > scope.numberOfPages
				if (scope.pro.currentPage < 1) {
					scope.pro.currentPage = 1;
				}

				// 如果分页总数>0，并且当前页大于分页总数
				if (scope.pro.numberOfPages > 0 && scope.pro.currentPage > scope.pro.numberOfPages) {
					scope.pro.currentPage = scope.pro.numberOfPages;
				}

				// jumpPageNum
				scope.jumpPageNum = scope.pro.currentPage;

				// 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
				var perPageOptionsLength = scope.pro.perPageOptions.length;
				// 定义状态
				var perPageOptionsStatus;
				for (var i = 0; i < perPageOptionsLength; i++) {
					if (scope.pro.perPageOptions[i] == scope.pro.itemsPerPage) {
						perPageOptionsStatus = true;
					}
				}
				// 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
				if (!perPageOptionsStatus) {
					scope.pro.perPageOptions.push(scope.pro.itemsPerPage);
				}

				// 对选项进行sort
				scope.pro.perPageOptions.sort(function (a, b) {
					return a - b
				});

				scope.pageList = [];
				if (scope.pro.numberOfPages <= scope.pro.pagesLength) {
					// 判断总页数如果小于等于分页的长度，若小于则直接显示
					for (i = 1; i <= scope.pro.numberOfPages; i++) {
						scope.pageList.push(i);
					}
				} else {
					// 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
					// 计算中心偏移量
					var offset = (scope.pro.pagesLength - 1) / 2;
					if (scope.pro.currentPage <= offset) {
						// 左边没有...
						for (i = 1; i <= offset + 1; i++) {
							scope.pageList.push(i);
						}
						scope.pageList.push('...');
						scope.pageList.push(scope.pro.numberOfPages);
					} else if (scope.pro.currentPage > scope.pro.numberOfPages - offset) {
						scope.pageList.push(1);
						scope.pageList.push('...');
						for (i = offset + 1; i >= 1; i--) {
							scope.pageList.push(scope.pro.numberOfPages - i);
						}
						scope.pageList.push(scope.pro.numberOfPages);
					} else {
						// 最后一种情况，两边都有...
						scope.pageList.push(1);
						scope.pageList.push('...');

						for (i = Math.ceil(offset / 2); i >= 1; i--) {
							scope.pageList.push(scope.pro.currentPage - i);
						}
						scope.pageList.push(scope.pro.currentPage);
						for (i = 1; i <= offset / 2; i++) {
							scope.pageList.push(scope.pro.currentPage + i);
						}

						scope.pageList.push('...');
						scope.pageList.push(scope.pro.numberOfPages);
					}
				}

				if (scope.pro.onChange) {


					// 防止初始化两次请求问题
					if (!(oldValue != newValue && oldValue[0] == 0)) {
						scope.pro.onChange();
					}
				}
				scope.$parent.pro = scope.pro;

				var getData = {
					pageIndex: scope.pro.currentPage,
					pageSize: scope.pro.itemsPerPage
				};

				/*ProtocolService.list(getData).success(function (response) {
				 scope.pro.equipmentTemplates = response.equipmentTemplates;
				 scope.pro.totalItems = response.count;
				 });*/
				equipmentTemplateService.getLimitEquipmentTemplate((scope.pro.currentPage - 1) * scope.pro.itemsPerPage, scope.pro.itemsPerPage).then(function (data) {

					scope.pro.equipmentTemplates = data;

					equipmentTemplateService.getEquipmentTemplateNums().then(function(data) {
						scope.pro.totalItems = data;
					});
				});
			}

			scope.$watch(function () {

				if (!scope.pro.totalItems) {
					scope.pro.totalItems = 0;
				}

				var newValue = scope.pro.totalItems + ' ' + scope.pro.currentPage + ' ' + scope.pro.itemsPerPage;
				return newValue;

			}, getPagination);
		}
	}
});

nurseDirective.directive("tmPaginationCard",	function(CardService) {
        return {
            restrict: 'EA',
            template: '<div class="page-list">' +
                '<ul class="pagination" ng-show="card.totalItems > 0">' +
                '<li ng-class="{disabled: card.currentPage == 1}" ng-click="prevPage()"><span>&laquo;</span></li>' +
                '<li ng-repeat="item in pageList track by $index" ng-class="{active: item == card.currentPage, separate: item == \'...\'}" ' +
                'ng-click="changeCurrentPage(item)">' +
                '<span>{{ item }}</span>' +
                '</li>' +
                '<li ng-class="{disabled: card.currentPage == card.numberOfPages}" ng-click="nextPage()"><span>&raquo;</span></li>' +
                '</ul>' +
                '<div class="page-total pull-right input-group" ng-show="card.totalItems > 0">' +
                '<!--第--><input class="btn  btn-default" style="width:50px; margin:5px;" type="text" ng-model="jumpPageNum"  ng-keyup="jumpToPage($event)"/>GO<!--页--> ' +
                '<!--每页--><select class="btn btn-default"  style="margin:5px;"  ng-model="card.itemsPerPage" ng-options="option for option in card.perPageOptions "></select>' +
                '/<!--共--><strong>{{ card.totalItems }}</strong><!--条-->' +
                '</div>' +
                '<div class="no-items" ng-show="card.totalItems <= 0">Not Data</div>' +
                '</div>',
            replace: true,
            scope: {
                card: '=',
                carddataitem : '='
            },
            link: function(scope, element, attrs){
                // 变更当前页
                scope.changeCurrentPage = function(item) {
                    if(item == '...'){
                        return;
                    }else{
                        scope.card.currentPage = item;
                    }
                };

                // 定义分页的长度必须为奇数 (default:9)
                scope.card.pagesLength = parseInt(scope.card.pagesLength) ? parseInt(scope.card.pagesLength) : 9 ;
                if(scope.card.pagesLength % 2 === 0){
                    // 如果不是奇数的时候处理一下
                    scope.card.pagesLength = scope.card.pagesLength -1;
                }

                // card.erPageOptions
                if(!scope.card.perPageOptions){
                    scope.card.perPageOptions = [10, 15, 20, 30, 50];
                }

                // prevPage
                scope.prevPage = function(){
                    if(scope.card.currentPage > 1){
                        scope.card.currentPage -= 1;
                    }
                };
                // nextPage
                scope.nextPage = function(){
                    if(scope.card.currentPage < scope.card.numberOfPages){
                        scope.card.currentPage += 1;
                    }
                };

                // 跳转页
                scope.jumpToPage = function(){
                    scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g,'');
                    if(scope.jumpPageNum !== ''){
                        scope.card.currentPage = scope.jumpPageNum;
                    }
                };

                //调用
                // pageList数组
                function getPagination(newValue, oldValue) {
                    scope.count = 1;
                    // card.currentPage
                    scope.card.currentPage = parseInt(scope.card.currentPage) ? parseInt(scope.card.currentPage) : 1;

                    // card.totalItems
                    scope.card.totalItems = parseInt(scope.card.totalItems) ? parseInt(scope.card.totalItems) : 0;

                    // card.itemsPerPage (default:10)
                    scope.card.itemsPerPage = parseInt(scope.card.itemsPerPage) ? parseInt(scope.card.itemsPerPage) : 10;

                    // numberOfPages
                    scope.card.numberOfPages = Math.ceil(scope.card.totalItems/scope.card.itemsPerPage);

                    // judge currentPage > scope.numberOfPages
                    if(scope.card.currentPage < 1){
                        scope.card.currentPage = 1;
                    }

                    // 如果分页总数>0，并且当前页大于分页总数
                    if(scope.card.numberOfPages > 0 && scope.card.currentPage > scope.card.numberOfPages){
                        scope.card.currentPage = scope.card.numberOfPages;
                    }

                    // jumpPageNum
                    scope.jumpPageNum = scope.card.currentPage;

                    // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                    var perPageOptionsLength = scope.card.perPageOptions.length;
                    // 定义状态
                    var perPageOptionsStatus;
                    for(var i = 0; i < perPageOptionsLength; i++){
                        if(scope.card.perPageOptions[i] == scope.card.itemsPerPage){
                            perPageOptionsStatus = true;
                        }
                    }
                    // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                    if(!perPageOptionsStatus){
                        scope.card.perPageOptions.push(scope.card.itemsPerPage);
                    }

                    // 对选项进行sort
                    scope.card.perPageOptions.sort(function(a, b){return a-b});

                    scope.pageList = [];
                    if(scope.card.numberOfPages <= scope.card.pagesLength){
                        // 判断总页数如果小于等于分页的长度，若小于则直接显示
                        for(i =1; i <= scope.card.numberOfPages; i++){
                            scope.pageList.push(i);
                        }
                    }else{
                        // 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
                        // 计算中心偏移量
                        var offset = (scope.card.pagesLength - 1)/2;
                        if(scope.card.currentPage <= offset){
                            // 左边没有...
                            for(i =1; i <= offset +1; i++){
                                scope.pageList.push(i);
                            }
                            scope.pageList.push('...');
                            scope.pageList.push(scope.card.numberOfPages);
                        }else if(scope.card.currentPage > scope.card.numberOfPages - offset){
                            scope.pageList.push(1);
                            scope.pageList.push('...');
                            for(i = offset + 1; i >= 1; i--){
                                scope.pageList.push(scope.card.numberOfPages - i);
                            }
                            scope.pageList.push(scope.card.numberOfPages);
                        }else{
                            // 最后一种情况，两边都有...
                            scope.pageList.push(1);
                            scope.pageList.push('...');

                            for(i = Math.ceil(offset/2) ; i >= 1; i--){
                                scope.pageList.push(scope.card.currentPage - i);
                            }
                            scope.pageList.push(scope.card.currentPage);
                            for(i = 1; i <= offset/2; i++){
                                scope.pageList.push(scope.card.currentPage + i);
                            }

                            scope.pageList.push('...');
                            scope.pageList.push(scope.card.numberOfPages);
                        }
                    }

                    if(scope.card.onChange){


                        // 防止初始化两次请求问题
                        if(!(oldValue != newValue && oldValue[0] == 0)) {
                            scope.card.onChange();
                        }
                    }
                    scope.$parent.card = scope.card;

                    var getData = {
                        pageIndex: scope.card.currentPage,
                        pageSize: scope.card.itemsPerPage
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
                        if(scope.carddataitem){
                            data.forEach(function(cs){
                                scope.carddataitem.Users.forEach(function(cdu){
                                    if(cs.userId == cdu.EmployeeId)
                                        cs.userName = cdu.EmployeeName;
                                });
                                scope.carddataitem.CardType.forEach(function(cdt){
                                    if(cs.cardType == cdt.ItemId)
                                        cs.cardTypeName = cdt.ItemValue;
                                });
                                scope.carddataitem.CardCategory.forEach(function(cdc){
                                    if(cs.cardCategory == cdc.ItemId)
                                        cs.cardCategoryName = cdc.ItemValue;
                                });
                                scope.carddataitem.DoorCard.sort(by("doorId"));
                                scope.carddataitem.DoorCard.forEach(function(cdd){
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
                    }

                    CardService.getLimitCard((scope.card.currentPage - 1) * scope.card.itemsPerPage, scope.card.itemsPerPage,scope.card.parameter).then(function(data) {
                        scope.card.cardList = fromCardList(data);

                        CardService.getCardNums(scope.card.parameter).then(function(datas) {
                            scope.card.totalItems = datas;
                        });

                    });
                }

                scope.$watch(function() {

                    if(!scope.card.totalItems) {
                        scope.card.totalItems = 0;
                    }

                    var newValue = scope.card.totalItems + ' ' +  scope.card.currentPage + ' ' + scope.card.itemsPerPage+''+scope.card.parameter;
                    return newValue;

                }, getPagination);
            }
        };
    }
);

nurseDirective.directive('draggable', ['$document',
    function($document) {//模态框拖动指令
        return {
            restrict: 'A',
            link: function(scope, element) {
                var startX = 0;
				var startY = 0;
				var x = 0;
				var y = 0;

                element.on('mousedown', function(event) {
                	//最后一个div
                    element = angular.element($(".am-modal-dialog:last"));
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.clientX - x;
					startY = event.clientY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });


                function mousemove(event) {
                    y = event.clientY - startY;
                    x = event.clientX - startX;
                    element.css({
                        top: y + 'px',
                        left:  x + 'px'
                    });
                }


                function mouseup() {
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }
            }
        };
}]);

/*
* ng-finish-render="ngRepeatFinished"标签属性
* DOM加载完后调用$scope.$on('ngRepeatFinished',function(event){});函数
* */
nurseDirective.directive('ngFinishRender',function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            //if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            //}
        }
    }
});

/**
 * 公共分页标签函数
 * 标签：<table-Paging table-Param="PagingParam" filer-Param="FilterParam"></table-Paging>
 * PagingParam为分页对象，包含属性有：
 * PagingParam = {
 *  currentPage:1   -- 当前页码
 *  itemsPerPage:10 -- 每页显示条数
 *  pagesLength:10  -- 页长
 *  totalItems:0    -- 数据总条数
 *  list:[]         -- 数据集合
 *  perPageOptions:[10, 20, 30, 40, 50] -- 页面显示条数选项
 *  onChange:function(){}   -- 值变化触发函数，放查询语法
 * }
 * FilterParam为过滤对象；值变化时也需要调用查询语法
 * */
nurseDirective.directive('tablePaging',['$rootScope',
    function($rootScope){
        return {
            restrict: 'EA',
            replace: true,
            template:
                '<div class="page-list">' +
                    '<ul class="pagination" ng-show="tableParam.totalItems > 0" style="cursor: pointer;margin: 0px 20px 20px 10px;">' +
                        '<li ng-class="{disabled: tableParam.currentPage == 1}" ng-click="prevPage()"><span>&laquo;</span></li>' +
                        '<li ng-repeat="item in pageList track by $index" ng-class="{active: item == tableParam.currentPage, separate: item == \'...\'}" ' +
                        'ng-click="changeCurrentPage(item)">' +
                            '<span>{{ item }}</span>' +
                        '</li>' +
                        '<li ng-class="{disabled: tableParam.currentPage == tableParam.numberOfPages}" ng-click="nextPage()"><span>&raquo;</span></li>' +
                    '</ul>' +
                    '<div class="page-total pull-right input-group" ng-show="tableParam.totalItems > 0">' +
                        '{{tableParam.hint.the}}<input class="btn  btn-default" style="width:50px; margin:5px;" type="text" ng-model="jumpPageNum"  ng-keyup="jumpToPage($event)"/>{{tableParam.hint.page}} ' +
                        '{{tableParam.hint.articel}}<select class="btn btn-default"  style="margin:5px;"  ng-model="tableParam.itemsPerPage" ng-options="option for option in tableParam.perPageOptions "></select>{{tableParam.hint.eachPage}}' +
                        '/{{tableParam.hint.total}}<strong>{{ tableParam.totalItems }}</strong>{{tableParam.hint.eachPage}}' +
                    '</div>' +
                    '<div class="no-items" ng-show="tableParam.totalItems <= 0">{{tableParam.hint.noData}}</div>' +
                '</div>',
            scope: {
                tableParam: '=',
                filterParam: '='
            },
            link: function(scope, element){
                // 变更当前页
                scope.changeCurrentPage = function(item) {
                    if(item == '...'){
                        return;
                    }else{
                        scope.tableParam.currentPage = item;
                    }
                };
                if(scope.tableParam === undefined) return;
                // 定义分页的长度必须为奇数 (default:9)
                scope.tableParam.pagesLength = parseInt(scope.tableParam.pagesLength) ? parseInt(scope.tableParam.pagesLength) : 9 ;
                if(scope.tableParam.pagesLength % 2 === 0){
                    // 如果不是奇数的时候处理一下
                    scope.tableParam.pagesLength = scope.tableParam.pagesLength -1;
                }

                // tableParam.erPageOptions
                if(!scope.tableParam.perPageOptions){
                    scope.tableParam.perPageOptions = [10, 15, 20, 30, 50];
                }

                // prevPage
                scope.prevPage = function(){
                    if(scope.tableParam.currentPage > 1){
                        scope.tableParam.currentPage -= 1;
                    }
                };
                // nextPage
                scope.nextPage = function(){
                    if(scope.tableParam.currentPage < scope.tableParam.numberOfPages){
                        scope.tableParam.currentPage += 1;
                    }
                };

                // 跳转页
                scope.jumpToPage = function(){
                    scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g,'');
                    if(scope.jumpPageNum !== ''){
                        scope.tableParam.currentPage = scope.jumpPageNum;
                    }
                };

                //调用
                // pageList数组
                function getPagination(newValue, oldValue) {
                    scope.tableParam.onChange(newValue, oldValue);

                    //返回总套数后在调用；等待$rootScope.$emit('resultTotal',{});的调用
                    $rootScope.$on('resultTotal', function () {
                        scope.count = 1;
                        // tableParam.currentPage
                        scope.tableParam.currentPage = parseInt(scope.tableParam.currentPage) ? parseInt(scope.tableParam.currentPage) : 1;

                        // tableParam.totalItems
                        scope.tableParam.totalItems = parseInt(scope.tableParam.totalItems) ? parseInt(scope.tableParam.totalItems) : 0;

                        // tableParam.itemsPerPage (default:10)
                        scope.tableParam.itemsPerPage = parseInt(scope.tableParam.itemsPerPage) ? parseInt(scope.tableParam.itemsPerPage) : 10;

                        // numberOfPages
                        scope.tableParam.numberOfPages = Math.ceil(scope.tableParam.totalItems/scope.tableParam.itemsPerPage);

                        // judge currentPage > scope.numberOfPages
                        if(scope.tableParam.currentPage < 1){
                            scope.tableParam.currentPage = 1;
                        }

                        // 如果分页总数>0，并且当前页大于分页总数
                        if(scope.tableParam.numberOfPages > 0 && scope.tableParam.currentPage > scope.tableParam.numberOfPages){
                            scope.tableParam.currentPage = scope.tableParam.numberOfPages;
                        }

                        // jumpPageNum
                        scope.jumpPageNum = scope.tableParam.currentPage;

                        // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                        var perPageOptionsLength = scope.tableParam.perPageOptions.length;
                        // 定义状态
                        var perPageOptionsStatus;
                        for(var i = 0; i < perPageOptionsLength; i++){
                            if(scope.tableParam.perPageOptions[i] == scope.tableParam.itemsPerPage){
                                perPageOptionsStatus = true;
                            }
                        }
                        // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                        if(!perPageOptionsStatus){
                            scope.tableParam.perPageOptions.push(scope.tableParam.itemsPerPage);
                        }

                        // 对选项进行sort
                        scope.tableParam.perPageOptions.sort(function(a, b){return a-b});

                        scope.pageList = [];
                        if(scope.tableParam.numberOfPages <= scope.tableParam.pagesLength){
                            // 判断总页数如果小于等于分页的长度，若小于则直接显示
                            for(i =1; i <= scope.tableParam.numberOfPages; i++){
                                scope.pageList.push(i);
                            }
                        }else{
                            // 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
                            // 计算中心偏移量
                            var offset = (scope.tableParam.pagesLength - 1)/2;
                            if(scope.tableParam.currentPage <= offset){
                                // 左边没有...
                                for(i =1; i <= offset +1; i++){
                                    scope.pageList.push(i);
                                }
                                scope.pageList.push('...');
                                scope.pageList.push(scope.tableParam.numberOfPages);
                            }else if(scope.tableParam.currentPage > scope.tableParam.numberOfPages - offset){
                                scope.pageList.push(1);
                                scope.pageList.push('...');
                                for(i = offset + 1; i >= 1; i--){
                                    scope.pageList.push(scope.tableParam.numberOfPages - i);
                                }
                                scope.pageList.push(scope.tableParam.numberOfPages);
                            }else{
                                // 最后一种情况，两边都有...
                                scope.pageList.push(1);
                                scope.pageList.push('...');

                                for(i = Math.ceil(offset/2) ; i >= 1; i--){
                                    scope.pageList.push(scope.tableParam.currentPage - i);
                                }
                                scope.pageList.push(scope.tableParam.currentPage);
                                for(i = 1; i <= offset/2; i++){
                                    scope.pageList.push(scope.tableParam.currentPage + i);
                                }

                                scope.pageList.push('...');
                                scope.pageList.push(scope.tableParam.numberOfPages);
                            }
                        }

                        if(scope.tableParam.onChange){

                            // 防止初始化两次请求问题
                            if(!(oldValue != newValue && oldValue[0] == 0)) {
                                scope.tableParam.onChange();
                            }
                        }
                        scope.$parent.tableParam = scope.tableParam;
                    });
                }

                scope.$watch(function() {

                    if(!scope.tableParam.totalItems)
                        scope.tableParam.totalItems = 0;

                    if(!scope.filterParam)
                        scope.filterParam = {};

                    var newValue = scope.tableParam.currentPage + ' ' + scope.tableParam.itemsPerPage+' '+angular.toJson(scope.filterParam);
                    return newValue;

                }, getPagination);
            }
        }
    }
]);

/**
 * 虚拟键盘
 * 输入框input添加Virtual-Key-Board属性
 * 需要给ng-model的对象赋值需要：Virtual-Key-Board="变量名"
 * */
nurseDirective.directive('virtualKeyBoard',['$document','$compile',
	function($document,$compile){
		return{
			restrict:'A',
			scope:{
				virtualKeyBoard : "="
			},
			link:function(scope,element){
				function loadKeyBoardHtml(input){
					var keyBoardBox =
						"<div id='key-board' class=\"input_box js_math\">\n" +
						"    <div class=\"mask\"></div>\n" +
						"    <div class=\"input_con\">\n" +
						"        <div class=\"txt_area clear\">\n" +
						"            <div id=\"txt_latex\"   class=\"input_cur input_latex l\"></div>\n" +
						"			 <div id=\"txt_latex_pwd\" class=\"input_cur input_latex l\"></div>\n" +
						/*"            <div class=\"btn_box\">\n" +
						"                <input type=\"button\" value=\"清空\" ng-click=\"clearValue();\">\n" +
						"                <input type=\"button\" value=\"确定\" class=\"addlatex btn_ok\" ng-click=\"saveValue()\">\n" +
						"            </div>\n" +*/
						"        </div>\n" +
						"        <div class=\"change_box clear\">\n" +
						"            <div class=\"l change_btns active\" data-type=\"zimu\">英文</div>\n" +
						"            <div class=\"l change_btns\" data-type=\"zhongwen\">中文</div>\n" +
						"            <div class=\"l change_btns\" data-type=\"shuzi\">123</div>\n" +
						"            <div class=\"l change_btns\" data-type=\"fuhao\">符号</div>\n" +
						"            <div class=\"l close_keyborad\"></div>\n" +
						"        </div>\n" +
						"        <div class=\"keyboard_box\">\n" +
						"            <div class=\"prettyprint\"></div>\n" +
						"            <div class=\"softkeyboard\"  name=\"softkeyboard\">\n" +
						"                <div class=\"c_panel shuzi\" id=\"shuzi\">\n" +
						"                    <table align=\"center\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" +
						"                        <tbody>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('0');\" value=\" 0 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('1');\" value=\" 1 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('2');\" value=\" 2 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('3');\" value=\" 3 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('4');\" value=\" 4 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('5');\" value=\" 5 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('6');\" value=\" 6 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('7');\" value=\" 7 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('8');\" value=\" 8 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('9');\" value=\" 9 \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" value=\".\" ng-click=\"addValue('.');\"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('①');\" value=\" ① \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('②');\" value=\" ② \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('③');\" value=\" ③ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('④');\" value=\" ④ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('⑤');\" value=\" ⑤ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('⑥');\" value=\" ⑥ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('⑦');\" value=\" ⑦ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('⑧');\" value=\" ⑧ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('⑨');\" value=\" ⑨ \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('+');\" value=\" + \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('-');\" value=\" - \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('*');\" value=\" * \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('/');\" value=\" / \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('=');\" value=\" = \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('<');\" value=\" < \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"addValue('>');\" value=\" > \"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" value=\"删除\" ng-click=\"backspace();\"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" type=\"button\" ng-click=\"clearValue();\" value=\"清空\"></td>\n" +
						"                            <td><input class=\"i_button i_button_num\" ng-click=\"changePanl('zimu');\" type=\"button\" value=\"返回\"></td>\n" +
						"                        </tr>\n" +
						"                        </tbody>\n" +
						"                    </table>\n" +
						"                </div>\n" +
						"                <div class=\"c_panel zimu\" id=\"zimu\" >\n" +
						"                    <table align=\"center\" width=\"98%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" +
						"                        <tbody>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('q');\" value=\" q \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('w');\" value=\" w \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('e');\" value=\" e \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('r');\" value=\" r \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('t');\" value=\" t \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('y');\" value=\" y \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('u');\" value=\" u \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('i');\" value=\" i \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('o');\" value=\" o \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('p');\" value=\" p \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" id=\"caps-lock\" ng-click=\"setCapsLock();\" value=\"大写\"></td>\n" +
						"                            <td style=\"display: none\"><input class=\"i_button i_button_zm js_ym\" type=\"button\" value=\"韵母\" ng-click=\"changePanl('yunmu');\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('a');\" value=\" a \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('s');\" value=\" s \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('d');\" value=\" d \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('f');\" value=\" f \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('g');\" value=\" g \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('h');\" value=\" h \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('j');\" value=\" j \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('k');\" value=\" k \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('l');\" value=\" l \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 空格\" ng-click=\"addValue('\\\\ ');\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('z');\" value=\" z \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('x');\" value=\" x \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('c');\" value=\" c \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('v');\" value=\" v \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('b');\" value=\" b \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('n');\" value=\" n \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"addValue('m');\" value=\" m \"></td>\n" +
						"                            <td colspan=\"2\"><input class=\"i_button i_button_bs\" type=\"button\" value=\" 删除\" ng-click=\"backspace();\"></td>\n" +
						"                        </tr>\n" +
						"                        </tbody>\n" +
						"                    </table>\n" +
						"                </div>\n" +
						"                <div class=\"c_panel fuhao\" id=\"fuhao\">\n" +
						"                    <table align=\"center\" width=\"98%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" +
						"                        <tbody>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('~');\" value=\" ~ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('@');\" value=\" @ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('#');\" value=\" # \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('$');\" value=\" $ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('￥');\" value=\" ￥ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('%');\" value=\" % \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('\\'');\" value=\" ' \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('_');\" value=\" _ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('|');\" value=\" | \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('-');\" value=\" - \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('+');\" value=\" + \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('=');\" value=\" = \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('<');\" value=\" < \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('>');\" value=\" > \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('《');\" value=\" 《 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('》');\" value=\" 》 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('!');\" value=\" ! \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('?');\" value=\" ? \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue(';');\" value=\" ; \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue(':');\" value=\" : \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('(');\" value=\" ( \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue(')');\" value=\" ) \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('*');\" value=\" * \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('/');\" value=\" / \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('{');\" value=\" { \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('}');\" value=\" } \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('[');\" value=\" [ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue(']');\" value=\" ] \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('、');\" value=\" 、 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue(',');\" value=\" , \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('。');\" value=\" 。 \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" onclick='addValue(\"\\\"\");' value=' \" '></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 空格\" ng-click=\"addValue('\\\\ ');\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"clearValue();\" value=\"清空\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 删除\" ng-click=\"backspace();\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 返回\" ng-click=\"changePanl('zimu');\"></td>\n" +
						"                        </tr>\n" +
						"                        </tbody>\n" +
						"                    </table>\n" +
						"                </div>\n" +
						"                <div class=\"c_panel yunmu\" id=\"yunmu\"  style=\"display:none;\">\n" +
						"                    <table align=\"center\" width=\"98%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" +
						"                        <tbody>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ā');\" value=\" ā \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('á');\" value=\" á \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǎ');\" value=\" ǎ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('à');\" value=\" à \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ō');\" value=\" ō \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ó');\" value=\" ó \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǒ');\" value=\" ǒ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ò');\" value=\" ò \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ê');\" value=\" ê \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 删除\" ng-click=\"backspace();\"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ē');\" value=\" ē \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('é');\" value=\" é \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ě');\" value=\" ě \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('è');\" value=\" è \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ī');\" value=\" ī \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('í');\" value=\" í \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǐ');\" value=\" ǐ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ì');\" value=\" ì \"></td>\n" +
						"                            <td ><input class=\"i_button i_button_zm\" type=\"button\" value=\" 空格\" ng-click=\"addValue('\\\\ ');\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"clearValue();\" value=\"清空\"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ū');\" value=\" ū \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ú');\" value=\" ú \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǔ');\" value=\" ǔ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ù');\" value=\" ù \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǖ');\" value=\" ǖ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǘ');\" value=\" ǘ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǚ');\" value=\" ǚ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ǜ');\" value=\" ǜ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('ü');\" value=\" ü \"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 返回\" ng-click=\"changePanl('zimu');\"></td>\n" +
						"                        </tr>\n" +
						"                        </tbody>\n" +
						"                    </table>\n" +
						"                </div>\n" +
						"                <div class=\"c_panel gongshi\" id=\"gongshi\">\n" +
						"                    <table align=\"center\" width=\"98%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" +
						"                        <tbody>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_1\" type=\"button\" ng-click=\"addValue('\\\\times',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_2\" type=\"button\" ng-click=\"addValue('\\\\div',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_3\" type=\"button\" ng-click=\"addValue('\\\\cdot',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_4\" type=\"button\" ng-click=\"addValue('\\\\leq',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_5\" type=\"button\" ng-click=\"addValue('\\\\geq',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_6\" type=\"button\" ng-click=\"addValue('\\\\neq',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_7\" type=\"button\" ng-click=\"addValue('\\\\frac{}{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_8\" type=\"button\" ng-click=\"addValue('^{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_9\" type=\"button\" ng-click=\"addValue('_{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_10\" type=\"button\" ng-click=\"addValue('\\\\sqrt{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_11\" type=\"button\" ng-click=\"addValue('\\\\sqrt[]{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_12\" type=\"button\" ng-click=\"addValue('\\\\left |  \\\\right |',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('<',true);\" value=\" < \"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('>',true);\" value=\" > \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('-',true);\" value=\" - \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('+',true);\" value=\" + \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('=',true);\" value=\" = \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('\\\\sum',true);\" value=\" ∑ \"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh\" type=\"button\" ng-click=\"addValue('\\\\approx',true);\" value=\" ≈ \" ></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_15\" type=\"button\" ng-click=\"addValue('\\\\vec{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_16\" type=\"button\" ng-click=\"addValue('\\\\dot{}',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_17\" type=\"button\" ng-click=\"addValue('\\\\pi',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_18\" type=\"button\" ng-click=\"addValue('\\\\alpha',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_19\" type=\"button\" ng-click=\"addValue('\\\\beta',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_20\" type=\"button\" ng-click=\"addValue('\\\\angle',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_21\" type=\"button\" ng-click=\"addValue('^{\\\\circ}',true);\"></td>\n" +
						"                        </tr>\n" +
						"                        <tr>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_22\" type=\"button\" ng-click=\"addValue('\\\\Delta',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_23\" type=\"button\" ng-click=\"addValue('\\\\odot',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_24\" type=\"button\" ng-click=\"addValue('\\\\perp',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_25\" type=\"button\" ng-click=\"addValue('\\\\pm',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_26\" type=\"button\" ng-click=\"addValue('\\\\mp',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_27\" type=\"button\" ng-click=\"addValue('\\\\theta',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_28\" type=\"button\" ng-click=\"addValue('\\\\lambda',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_fh i_icon i_icon_29\" type=\"button\" ng-click=\"addValue('\\\\mu',true);\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 空格\" ng-click=\"addValue('\\\\ ');\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" ng-click=\"clearValue();\" value=\"清空\"></td>\n" +
						"                            <td><input class=\"i_button i_button_zm\" type=\"button\" value=\" 删除\" ng-click=\"backspace();\"></td>\n" +
						"                            <td colspan=\"2\"><input class=\"i_button i_button_bs\" type=\"button\" value=\" 返回\" ng-click=\"changePanl('zimu');\"></td>\n" +
						"                        </tr>\n" +
						"                        </tbody>\n" +
						"                    </table>\n" +
						"                </div>\n" +
						"            </div>\n" +
						"        </div>\n" +
						"    </div>\n" +
						"</div>\n";
					keyBoardBox = $compile(keyBoardBox)(scope);
					//input.parentNode.appendChild(keyBoardBox[0]);
					var dialog = $(".modal .modal-dialog");
					if(dialog.length > 0 && dialog[dialog.length - 1].parentNode)
						dialog[dialog.length - 1].parentNode.appendChild(keyBoardBox[0]);
					else
						document.body.appendChild(keyBoardBox[0]);
					//document.body.appendChild(keyBoardBox[0]);
					/*document.getElementById("key_board_box").innerText = "";
					document.getElementById("key_board_box").appendChild(keyBoardBox[0]);*/
				}

				var CapsLockValue=0,
					check;
				//存储当前内容
				var tempSt = '',
					tempEt = '';
				//给输入的密码框添加新值
				var zn_en = 'en';

				var config={
					spaceBehavesLikeTab: true,
					leftRightIntoCmdGoes: 'up',
					restrictMismatchedBrackets: true,
					sumStartsWithNEquals: true,
					supSubsRequireOperand: true,
					autoSubscriptNumerals: true,
					handlers: {
						edit: function(){

						}
					}
				};

				function initFunction(mathField){
					//输入效果
					scope.addValue = function(newValue) {
						mathField.focus();
						if($(".change_btns.active").attr("data-type") == "zhongwen" && /[a-zA-Z]/.test(newValue)){
							znValue(newValue);
							return false;
						}
						CapsLockValue==0?'':newValue= newValue.toUpperCase();
						if($.trim($("#txt_latex").text()) == ''){
							mathField.latex(newValue);
						}else {
							mathField.write(newValue);
						}
						setPasswordValue(undefined,"add");
						setKeyValue();
					};

					//查找中文字符
					var _text = '';
					function znValue(obj) {
						_text ? _text += obj : _text=obj;
						//console.log(_text);
						var lists =zn_lists[_text];
						if(!lists){
							_text=obj;
							lists =zn_lists[_text];
							//console.log(_text)
						}
						var str = '<div class="zn_box clearfix"><span>'+_text+'</span><div class="zn_scroll"><ul class="clearfix">';
						for (var i=0;i<lists.length;i++){
							str+='<li Virtual-Key-Board>'+zn_lists[_text][i]+'</li>'
						}
						str+='</ul></div>';
						if(lists.length>=13){
							str+='<a href="javascript:;" class="zn_btn"></a>';
						}
						str+='</div>';
						$(".zn_box").remove();
						$(".input_con").append(str);
						setPasswordValue(undefined,"add");
						setKeyValue();
					}

					//清空
					scope.clearValue = function() {
						mathField.latex('');
						_text = '';
						$(".zn_box").remove();
						setPasswordValue("","clear");
						setKeyValue();
					};

					//实现BackSpace键的功能
					scope.backspace = function() {
						if(zn_en == 'zn' && _text.length>=1){
							if(_text.length == 1){
								_text = '';
								$(".zn_box").remove();
							}else {
								_text=_text.substring(0,_text.length-1);
								znValue(_text);
							}
							return false;
						}
						mathField.keystroke('Backspace');
						setPasswordValue(undefined,"del");
						setKeyValue();
					};

					//切换功能
					scope.changePanl = function(oj){
						mathField.focus();
						if(oj =='zhongwen'){
							zn_en = 'zn';
							if(CapsLockValue ==1){
								scope.setCapsLock();
							}
							$("input[value=韵母]").closest("td").show();
							$("input[value=小写]").closest("td").hide();
							$("input[value=大写]").closest("td").hide();
							$(".zimu").siblings(".c_panel").hide();
							$(".zimu").show();
						}else {
							zn_en = 'en';
							$("input[value=韵母]").closest("td").hide();
							$("input[value=小写]").closest("td").show();
							$("input[value=大写]").closest("td").show();
							_text='';
						}
						$("."+oj).siblings(".c_panel").hide();
						$("."+oj).show();

					};
					//设置是否大写的值
					scope.setCapsLock = function() {
						if (CapsLockValue==0){
							CapsLockValue=1;
							$("#caps-lock").val("小写");
							$.each($(".i_button_zm"),function(b, c) {
								$(c).val($(c).val().toUpperCase());
							});
						}else{
							CapsLockValue=0;
							$("#caps-lock").val("大写");
							$.each($(".i_button_zm"),function(b, c) {
								$(c).val($(c).val().toLowerCase());
							});
						}
						_text='';
						$(".zn_box").remove();
						$("input[value=英文]").val("中文");
					};
					scope.changePanl("zimu");

					$(document).on("click",".zn_btn",function () {
						$(this).toggleClass('on');
						if($(this).hasClass('on')){
							$('.zn_box').addClass('on');
							$(".zn_scroll ul").slimScroll({
								height:'200px'
							})
						}else {
							$('.zn_box').removeClass('on');
						}

					});
					$(document).on("click",".zn_box li",function () {
						mathField.typedText($(this).text());
						$(".zn_box").remove();
						_text = '';
						setKeyValue();
					});

					//关闭
					$(".close_keyborad").on("click",function () {
						$(".input_con").slideUp(function () {
							/*$(".input_box").hide();
							$("#txt_Search").val("");*/
							$("#key-board").remove();
						});
					});
                    $(".mask").on("click",function () {
                        $(".input_con").slideUp(function () {
                            $("#key-board").remove();
                        });
                    });


					//切换功能
					$(".change_btns").on("click",function () {
						$(this).addClass("active").siblings().removeClass("active")
						scope.changePanl($(this).attr("data-type"));
					});
				}

				/** type:add-添加字符、del-删除字符、clear-清空字符 */
				function setPasswordValue(value,type){
					var text = "";
					if(value == undefined || value == "")
						text = $("#txt_latex_pwd").text();
					else{
						for(var i = 0;i < value.length;i ++){
							text += "*";
						}
					}

					if(type == "add")
						$("#txt_latex_pwd").text(text+"*");
					else if(type == "del"){
						if(text == "") return;
						text = text.substring(0,text.length-1);
						$("#txt_latex_pwd").text(text);
					}else if(type == "clear"){
						$("#txt_latex_pwd").text("");
					}else{
						$("#txt_latex_pwd").text(text);
					}
				}
				function setKeyValue(){
					if(!(typeof MathQuill === "function")) return;

					var input = element[0];
					var MQ = MathQuill.getInterface(2);
					var mathField = MQ.MathField($("#txt_latex")[0], config);
					var latex = mathField.latex();
					input.value = latex.replace(/\\/g,"");
					scope.virtualKeyBoard = input.value;
				}
				//点击控件外，隐藏控件
				function clickOther(){
					$(document).bind("click", function (e) {
						var target = $(e.target);
						var attr = target.attr("Virtual-Key-Board");
						if(attr == undefined){
							if (target.closest("#key-board").length == 0) {
								$(".input_con").slideUp(function () {
									$("#key-board").remove();
								});
							}
						}else{
							if($(".gearDate").length > 0) {//关闭时间选择控件
                                $(".gearDate").remove();
                            }
						}
					});
				}
				element.bind('click', function() {
					if(!(typeof MathQuill === "function")) return;
					if(window.navigator.userAgent.indexOf("Windows") != -1) return;

					clickOther();

					//删除已打开的虚拟键盘
					if($("#key-board")[0] != undefined)
						$("#key-board").remove();

					var input = $(this)[0];
					loadKeyBoardHtml(input);
					var MQ = MathQuill.getInterface(2);
					var mathField = MQ.MathField($("#txt_latex")[0], config);
					initFunction(mathField);

					//输入框是password类型，隐藏输入字符
					var type = input.type;
					if(type == "password"){
						$("#txt_latex").hide();
						$("#txt_latex_pwd").show();
					}else{
						$("#txt_latex").show();
						$("#txt_latex_pwd").hide();
					}

					mathField.latex('');
					$(".input_box").show();
					$(".input_con").slideDown();
					var val = input.value;
					setPasswordValue(val,"default");
					//setKeyValue();
					if($.trim(val) !=''){
						var el = $(this).find('.mq-selectable').text();
						if(el){
							var txt = el.substr(0,el.length-1).substr(1,el.length-1);
						}else {
							var txt = val;
						}
						mathField.latex(txt);
						scope.virtualKeyBoard = txt;
					}

					scope.saveValue = function(){
						var latex = mathField.latex();
						input.value = latex.replace(/\\/g,"");
						scope.virtualKeyBoard = input.value;
						//$(".input_box").hide();
						$("#key-board").remove();
					};
				});
			}
		};
	}
]);

/**
 * 滑块
 * 使用方法：<rangeslider min="1" max="30" value="7" rang-value="rangeValues"></rangeslider>
 * min：为滑块最小值
 * max：为滑块最大值
 * step：为滑块
 * value：为滑块默认值
 * rang-value：为ng-modl绑定对象
 * */
nurseDirective.directive('rangeslider',['$document',
	function($document){
		return{
			restrict: 'EA',
			replace:true,
			template:'<div style="margin: 20px 0px;">' +
						'<input class="data-rangeslider" type="range" min="0" max="100" step="1">'+
						'<ul class="range-slider-ul"><!--<li ng-repeat="item in ruler">{{item}}</li>--></ul>'+
					'</div>',
			scope:{
				min : "=",
				max : "=",
				step : "=",
				value : "=",
				rangValue : "="
			},
			link:function(scope,element){
				var selector = ".data-rangeslider";
				var $inputRange = $(selector);
                var languageJson = angular.fromJson(sessionStorage.getItem("languageJson"));
				//默认属性
				$inputRange.attr({
					min: scope.min == undefined ? 0 : scope.min,
					max: scope.max == undefined ? 100 : scope.max,
					step: scope.step == undefined ? 1 : scope.step,
					value: scope.value == undefined ? 0 : scope.value
				});

				//标尺数组
				var length = parseInt(scope.max);
                var myDate = new Date();
                //获取当前月
                var month = myDate.getMonth()+1;
				for(var i = 1; i <= length; i++){
                    month ++;
                    element.find(".range-slider-ul").append("<li>"+month+languageJson.AlarmRecord.Month+"</li>");
                    if(month >= 12) month = 0;
				}
				var width = parseFloat(100 / length);
				element.find(".range-slider-ul li").css("width",width+"%");

				// Example functionality to demonstrate a value feedback
				// and change the output's value.
				function valueOutput(element) {
					var value = element.value;
					scope.rangValue = value;
				}

				// Initial value output
				for (var i = $inputRange.length - 1; i >= 0; i--) {
					valueOutput($inputRange[i]);
				}

				// Update value output
				$document.on('input', selector, function(e) {
					valueOutput(e.target);
				});

				// Initialize the elements
				$inputRange.rangeslider({
					polyfill: false
				});
			}
		}
	}
]);

/* 置顶
*	Stick-Click = "'#ID'"
*	1、为跳转位置ID名称
*   2、滚动条DIV添加ClassName = Stick-Click
*/
nurseDirective.directive('stickClick',['$document',
	function($document){
		return{
			restrict:'A',
			scope:{
				stickClick : "="
			},
			link:function(scope,element){
				element.bind('click', function(){
				    if($(".Stick-Click").length > 0){
                        var offsetTop = $(scope.stickClick)[0].offsetTop;
                        $(".Stick-Click").animate({scrollTop: offsetTop+'px'}, 500);
                    }else{
                        $(scope.stickClick).animate({scrollTop: '0px'}, 500);
                    }
				});
			}
		}
	}
]);

/* 全屏
 * Full-Screen
  * */
nurseDirective.directive('fullScreen',['$document',
	function($document){
		return{
			restrict:'A',
			link:function(scope,element){
				//进入全屏
				function intoFullScreen(){
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
				}
				//退出全屏
				function exitFullScreen(){
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

				function getSystemName(){
					var name = "unknown";
					var userAgent = window.navigator.userAgent;
					if (userAgent.indexOf("Windows NT 10.0")!= -1){
						name = "Windows 10";
					}else if (userAgent.indexOf("Windows NT 6.2") != -1){
						name = "Windows 8";
					}else if (userAgent.indexOf("Windows NT 6.1") != -1){
						name = "Windows 7";
					}else if (userAgent.indexOf("Windows NT 6.0") != -1){
						name = "Windows Vista";
					}else if (userAgent.indexOf("Windows NT 5.1") != -1){
						name = "Windows XP";
					}else if (userAgent.indexOf("Windows NT 5.0") != -1){
						name = "Windows 2000";
					}else if (userAgent.indexOf("Mac") != -1){
						name = "Mac/iOS";
					}else if (userAgent.indexOf("X11") != -1){
						name = "UNIX";
					}else if (userAgent.indexOf("Linux") != -1){
						name = "Linux";
					}
					return name;
				}

				/* 是否显示全屏按钮 */
				scope.isShowFullScreen = function(){
					var name = getSystemName();
					if(name.indexOf("Windows") == -1)
						return false;
					return true;
				};

				element.bind('click', function(){
					if(sessionStorage.getItem("FullScreen") == "true" ||
						sessionStorage.getItem("FullScreen") == undefined){
						intoFullScreen();
					}else{
						exitFullScreen();
					}
				});
			}
		}
	}
]);

/* 表格固定标题
 *  <table Table-Fixed-Header="tableFixedHeader" ></table>
 *  tableFixedHeader : {
 *  	className : 'container-fluid',//包含滚动条的类名如
 *  	scrollTop : 200,//滚动条滚动TOP距离大小后显示表头
 *  	top:98//表格定位top大小，该值为iView版本
 *  }
 *  */
nurseDirective.directive('tableFixedHeader',['$compile',
	function($compile){
		return{
			restrict:'A',
			scope:{
				tableFixedHeader : "="
			},
			link:function(scope,element){
				function loadTableHeader(){
					if(element[0] == undefined) return;

                    if(element.length > 0 && element[0].parentNode)
                        scope.tableFixedHeader.clientHeight = element[0].parentNode.clientHeight;

					var ths = getTableTh(element);

					var width = element[0].parentNode.clientWidth;
					var className = element[0].className;

					var headerTable =
						"<table ng-show=\"isShowThead\" class=\""+className+"\" style=\"position: fixed;z-index: 1;top: "+scope.tableFixedHeader.top+"px;width: "+width+"px;\">" +
						"	<thead>" +
						"	<tr>";

					if(ths){
						ths.forEach(function(th){
							//th.width th.name
							headerTable += "		<th width=\""+th.width+"px\">"+th.name+"</th>";
						});
					}

					headerTable +=
						"	</tr>" +
						"	</thead>" +
						"</table>";
					headerTable = $compile(headerTable)(scope);

					element[0].parentNode.appendChild(headerTable[0]);
				}

				function getTableTh(element){
					var ths = [];
					if(element[0].childNodes){
						element[0].childNodes.forEach(function(thead){
							if(thead.localName == 'thead'){
								if(thead.childNodes){
									thead.childNodes.forEach(function(tr){
										if(tr.localName == 'tr'){
											if(tr.childNodes){
												tr.childNodes.forEach(function(th){
													if(th.localName == 'th'){
														//th.scrollWidth th.innerText
														var t = {
															width : th.scrollWidth,
															name : th.innerText
														};
														ths.push(t);
													}
												});
											}
										}
									});
								}
							}
						})
					}
					return ths;
				}

				var is = true;
				$("."+scope.tableFixedHeader.className).scroll(function(){
					var scrollTop = $(this).scrollTop();

					if(scrollTop > parseInt(scope.tableFixedHeader.scrollTop) &&
                        scrollTop < parseInt(scope.tableFixedHeader.clientHeight))
						scope.isShowThead = true;
					else
						scope.isShowThead = false;

					if(is) loadTableHeader();
					is = false;
				});
			}
		}
	}
]);

/* 页面加载 */
nurseDirective.directive('pageLoad',['$rootScope',
	function ($rootScope) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				$rootScope.$on('$stateChangeSuccess', function() {
					$('.page-load').hide();
					$('#wrapper').show();
				});
			}
		};
	}
]);

/**
 *  滑动时间控件
 *  <date-Picker id="date" date-value="DateObj" date-type="date" min-date="1970-1-1" max-date="2029-12-31" />
 *  */
nurseDirective.directive('datePicker',[
	function(){
		return{
			restrict: 'EA',
			replace:true,
			template:'<input class="form-control time_setting" type="text">',
			scope:{
				id : "@",
				dateValue : "=",
				dateType : "@",
				minDate : "@",
				maxDate : "@",
				isClear : "@"
			},
			link:function(scope,element){
				scope.dateType = scope.dateType == undefined ? 'date' : scope.dateType;
				scope.minDate = scope.minDate == undefined ? '1970-1-1' : scope.minDate;
				scope.maxDate = scope.maxDate == undefined ? new Date().getFromFormat('yyyy-mm-dd') : scope.maxDate;
				scope.isClear = scope.isClear == undefined ? 'false' : scope.isClear;


				setTimeout(function(){
					//默认属性
					var $inputRange = element;
					$inputRange.attr({
						id : scope.id == undefined ? 'dateTime' : scope.id,
						value : scope.dateValue == undefined ? '' : getDateString(scope.dateValue,scope.dateType)
					});

					var calendar = new datePicker();
					calendar.init({
						'trigger': '#'+scope.id, /*按钮选择器，用于触发弹出插件*/
						'type': scope.dateType,/*模式：date日期；datetime日期时间；time时间；ym年月；*/
						'minDate':scope.minDate,/*最小日期*/
						'maxDate':scope.maxDate,/*最大日期*/
						'isClear':scope.isClear,
						'onSubmit':function(){/*确认时触发事件*/
							scope.dateValue = calendar.value;
						},
						'onClose':function(){/*取消时触发事件*/
						},
						'onClear':function(){/*清空时触发事件*/
							scope.dateValue = "";
							element[0].value = "";
						}
					});


				},300);

				function getDateString(date,type){
					if(date == undefined || date == "") return "";
					if(type == "ym"){
						return new Date(date).getFromFormat('yyyy-mm');
					}else if(type == "date"){
						return new Date(date).getFromFormat('yyyy-mm-dd');
					}else if(type == "datetime"){
						return new Date(date).getFromFormat('yyyy-mm-dd hh:ii:ss');
					}else{
						return new Date(date).getFromFormat('hh:ii:ss');
					}
				}
			}
		}
	}
]);