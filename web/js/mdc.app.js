//debugger;
'use strict';

angular.module('nurseApp', [
		'ui.router',
		'ngTable',
		'ngSanitize',
		'ngCsv',
		'ngAnimate',
		'mgcrea.ngStrap',
		'isteven-multi-select',
		'nurseApp.filters',
		'nurseApp.services',
		'nurseApp.directives',
		'nurseApp.controllers',
		'angular-svg-round-progressbar'
	]).run(['$rootScope', '$state', '$stateParams', 'userService',
			function($rootScope, $state, $stateParams, userService) {

				$rootScope.$state = $state;
				$rootScope.$stateParams = $stateParams;

				$rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
					//If in cameraview page,stop playing video.
					$(".fullscreen").hide();
					switch(toState.name)
					{
						case "cameraview":
						case "camerarecord":
							for(var i=0;i<16;i++) {
								var videostate=WebVideoCtrl.I_GetWindowStatus(i);
								if(videostate==0) continue;
								WebVideoCtrl.I_Stop(i);
							}
							break;
						case "device.diagram":
						case "adevice.diagram":
							$(".fullscreen").show();
							break;
					}
					var token = localStorage.getItem("token");
					userService.isLogin(token).then(function(data) {
						if (data != "TRUE") {
							event.preventDefault();
							$(window.location).attr("href", "login.html");
						}
					});
				});
			}
		]
	)
	.config(
		['$stateProvider', '$urlRouterProvider',
			function($stateProvider, $urlRouterProvider, plUploadServiceProvider) {
				$urlRouterProvider.otherwise('/');
				// Use $stateProvider to configure your states.
				$stateProvider
					.state("home", {
						url: "/",
						views: {
							'container': {
								templateUrl: 'partials/mdcoverview.html'
							}
						}
					})
					.state("mdcoverall", {
						url: "/mdcoverall",
						views: {
							'container': {
								templateUrl: 'partials/mdchome.html'
							}
						}
					})
					.state('alarm', {
						url: '/alarm/{alarmLevel:int}',
						views: {
							'container': {
								templateUrl: 'partials/alarm.html'
							}
						}
					})
					.state('device.diagram', {
						url: '/diagram',
						parent: 'device',
						params: {
							'diagram': null
						},
						views: {
							'diagram': {
								templateUrl: 'partials/diagram.html'
							}
						}
					})
					.state('mdcpower', {
						url: '/mdcpower',
						views: {
							'container': {
								templateUrl: 'partials/mdcpower.html'
							}
						}
					})
					.state('mdctemp', {
						url: '/mdctemp',
						views: {
							'container': {
								templateUrl: 'partials/mdctemp.html'
							}
						}
					})
					.state('mdcalarm', {
						url: '/mdcalarm',
						views: {
							'container': {
								templateUrl: 'partials/mdcalarm.html'
							}
						}
					})
					.state('device', {
						url: '/device/:deviceBaseTypeId',
						params: {
							'diagramview': 'device.diagram'
						},
						views: {
							'container': {
								templateUrl: 'partials/deviceDiagramView.html'
							}
						}
					})
					.state('adevice', {
						url: '/adevice/:deviceBaseTypeId',
						params: {
							'diagramview': 'adevice.diagram'
						},
						views: {
							'container': {
								templateUrl: 'partials/adeviceDiagramView.html'
							}
						}
					})
					.state('adevice.diagram', {
						url: '/adiagram',
						parent: 'adevice',
						params: {
							'diagram': null
						},
						views: {
							'diagram': {
								templateUrl: 'partials/diagram.html'
							}
						}
					})
					.state('config', {
						url: '/config',
						views: {
							'container': {
								templateUrl: 'partials/config.html'
							}
						}
					})
					.state('config3d', {
						url: '/config3d',
						views: {
							'container': {
								templateUrl: 'partials/editor.html'
							}
						}
					})
					.state('viewer3d', {
						url: '/viewer3d',
						views: {
							'container': {
								templateUrl: 'partials/viewer.html'
							}
						}
					})
					.state('debug', {
						url: '/debug',
						views: {
							'container': {
								templateUrl: 'partials/debug.html'
							}
						}
					})
					.state('protocol', {
						url: '/protocol',
						views: {
							'container': {
								templateUrl: 'partials/protocol.html'
							}
						}
					})
					.state('alarmrecord', {
						url: '/alarmrecord',
						views: {
							'container': {
								templateUrl: 'partials/alarmrecord.html'
							}
						}
					})
					.state('signalrecord', {
						url: '/signalrecord',
						views: {
							'container': {
								templateUrl: 'partials/signalrecord.html'
							}
						}
					})
					.state('deviceInfo', {
						url: '/deviceInfo/{deviceId:int}',
						views: {
							'container': {
								templateUrl: 'partials/deviceInfo.html'
							}
						}
					})
					.state('cameraview', {
						url: '/cameraview',
						views: {
							'container': {
								templateUrl: 'partials/cameraview.html'
							}
						}
					})
					.state('camerarecord', {
						url: '/camerarecord',
						views: {
							'container': {
								templateUrl: 'partials/camera.html'
							}
						}
					})
					.state('notify', {
						url: '/notify',
						views: {
							'container': {
								templateUrl: 'partials/notify.html'
							}
						}
					})
					.state('kpi', {
						url: '/kpi/{id:int}',
						views: {
							'container': {
								templateUrl: 'partials/kpi.html'
							}
						}
					})
					.state('timeSetting', {
						url: '/timeSetting',
						views: {
							'container': {
								templateUrl: 'partials/timeSetting.html'
							}
						}
					})
					.state('about', {
						url: '/about',
						views: {
							'container': {
								templateUrl: 'partials/about.html'
							}
						}
					})
                    .state('videoCamera', {
                        url: '/videoCamera',
                        views: {
                            'container': {
                                templateUrl: 'partials/VideoCamera.html'
                            }
                        }
                    })
                    .state('employee', {
                        url: '/employee',
                        views: {
                            'container': {
                                templateUrl: 'partials/employee.html'
                            }
                        }
                    })
                    .state('cardsrecord', {
                        url: '/cardsrecord',
                        views: {
                            'container': {
                                templateUrl: 'partials/cardsrecord.html'
                            }
                        }
                    })
                    .state('doorControl', {
                        url: '/doorControl',
                        views: {
                            'container': {
                                templateUrl: 'partials/doorControl.html'
                            }
                        }
                    })
                    .state('configMDCconfigMDC', {
                        url: '/configMDC',
                        views: {
                            'container': {
                                templateUrl: 'partials/configMDC.html'
                            }
                        }
                    })
                    .state('alarmLinkage', {
                        url: '/alarmLinkage',
                        views: {
                            'container': {
                                templateUrl: 'partials/alarmLinkage.html'
                            }
                        }
                    });
			}
		]);