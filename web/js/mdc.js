var MDC = {
    create: function(id, option) {
        var mdc = {};
        mdc.id = id;
        mdc.domId = "#" + id;
        mdc.parts = [];
        mdc.event = { onMouseClick: null };
        mdc.options = option;
        mdc.mouse = new THREE.Vector2();

        function getViewSize() {
            var style = window.getComputedStyle(document.getElementById(mdc.id), null);

            var SCREEN_WIDTH = parseInt(style.getPropertyValue("width"));
            //window.innerWidth;
            var SCREEN_HEIGHT = parseInt(style.getPropertyValue("height"));
            //window.innerHeight;
            return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
        };

        mdc.initScene = function initScene() {
            mdc.raycaster = new THREE.Raycaster();
            mdc.scene = new THREE.Scene();

            var urls = [
                '/img/3d/rb_2.png',
                '/img/3d/rb_4.png',
                '/img/3d/rb_5.png',
                '/img/3d/rb_6.png',
                '/img/3d/rb_1.png',
                '/img/3d/rb_3.png'
            ];
            window.reflectionCube = new THREE.CubeTextureLoader().load(urls);
            reflectionCube.format = THREE.RGBFormat;
            mdc.scene.background = reflectionCube;

            mdc.clock = new THREE.Clock(true);
            mdc.tick = 0;
        };

        mdc.initRender = function() {
            if (Detector.webgl) {
                mdc.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

                if (mdc.enableShadow) {
                    mdc.renderer.shadowMap.enabled = true;
                    mdc.renderer.shadowMapSoft = true;
                    mdc.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                }
                console.info("webGL render is working.");
            } else {
                mdc.renderer = new THREE.CanvasRenderer(); //WebGLRenderer
                console.info("canvas render is working. restart brower remote to enable WebGL");
            }

            mdc.renderer.sortObjects = false;
            mdc.renderer.setClearColor(0x467676, 0.4); //0x232335
            mdc.renderer.setPixelRatio(window.devicePixelRatio);
            mdc.renderer.setSize(getViewSize().width, getViewSize().height);
        };

        mdc.initCamera = function() {

            // camera attributes
            var VIEW_ANGLE = 45,
                ASPECT = getViewSize().width / getViewSize().height,
                NEAR = 10,
                FAR = 50000;

            mdc.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
            mdc.camera.position.set(550, 550, 550);
            mdc.camera.lookAt(mdc.scene.position);
            mdc.scene.add(mdc.camera);
            //mdc.scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
            //mdc.scene.fog.color.setHSL( 0.6, 0, 1 );
        };

        mdc.initResize = function() {
            //window.addEventListener('resize', onWindowResize, false);
            $(window).resize(function (){
                var x = getViewSize().width;
                var y = getViewSize().height;
                mdc.camera.aspect = x / y;
                mdc.camera.updateProjectionMatrix();

                mdc.renderer.setSize(x, y);
            });
        };

        mdc.initControl = function() {
            mdc.controls = new THREE.OrbitControls(mdc.camera);
            mdc.controls.addEventListener('change', mdc.render);
            mdc.controls.minDistance = 200;
            mdc.controls.maxDistance = 5000;
            mdc.controls.maxPolarAngle = Math.PI * 0.5;
        };

        mdc.initDebugParts = function() {
            // axes
            var axes = new THREE.AxisHelper(1000);
            mdc.scene.add(axes);

            // displays current and past frames per second attained by scene
            mdc.stats = new Stats();
            mdc.stats.domElement.style.position = 'absolute';
            mdc.stats.domElement.style.bottom = '0px';
            mdc.stats.domElement.style.zIndex = 100;
            mdc.container.appendChild(mdc.stats.domElement);

            // Grid
            var size = 800,
                step = 80;

            var geometry = new THREE.Geometry();

            for (var i = -size; i <= size; i += step) {
                geometry.vertices.push(new THREE.Vector3(-size, 0, i));
                geometry.vertices.push(new THREE.Vector3(size, 0, i));
                geometry.vertices.push(new THREE.Vector3(i, 0, -size));
                geometry.vertices.push(new THREE.Vector3(i, 0, size));
            }

            var material = new THREE.LineBasicMaterial({ color: 0xeeeeee, opacity: 0.7 });

            var line = new THREE.Line(geometry, material, THREE.LinePieces);
            mdc.scene.add(line);

            // //ArrowHelper
            // var directionV3 = new THREE.Vector3(1, 0, 1);
            // var originV3 = new THREE.Vector3(0, 200, 0);
            // // 100 is length, 20 and 10 are head length and width
            // var arrowHelper = new THREE.ArrowHelper(directionV3, originV3, 100, 0xff0000, 20, 10);
            // mdc.scene.add(arrowHelper);

            // 3. BoundingBoxHelper
            //bboxHelper = new THREE.BoundingBoxHelper(group, 0x999999);
            //ar.scene.add(bboxHelper);
        };

        mdc.defineMouseBehavior = function() {
            mdc.container.addEventListener('mousemove', onDocumentMouseMove, false);
            mdc.container.addEventListener('dblclick', onDocumentMouseDown, false);

            function onDocumentMouseMove(event) {
                mdc.mouse.x = ((event.clientX - $(mdc.domId).position().left) / $(mdc.domId).width()) * 2 - 1;
                mdc.mouse.y = -((event.clientY - $(mdc.domId).position().top) / $(mdc.domId).height()) * 2 + 1;
                event.preventDefault();
            }

            function onDocumentMouseDown(e) {
                e.preventDefault();
                var part = null;
                if (mdc.INTERSECTED) {

                    for (var i = 0; i < mdc.parts.length; i++) {
                        var partexist = mdc.util.getObjectByMesh(mdc.parts[i].currentShape, mdc.INTERSECTED);
                        if (partexist) {
                            part = mdc.parts[i];
                            break;
                        }
                    }

                    if (!part) return;
                    if (part.category == "door") return;
                    if (part.category == "base") return;
                    if (part.category == "ceiling") return;
                    if (part.category == "waterLeakage") return;
                    if (part.category == "thermalMap") return;

                    if (mdc.event.onMouseClick) {
                        mdc.event.onMouseClick(part);
                    }
                }
            }
        };

        mdc.attachToDom = function() {
            mdc.container = document.getElementById(mdc.id);
            mdc.container.appendChild(mdc.renderer.domElement);
        };

        mdc.initLight = function() {
            //泛光可调整整个房间的明暗度
            var ambient = new THREE.AmbientLight(0xaaaaaa);
            mdc.scene.add(ambient);
            mdc.ambientLight = ambient;


            //var light = new THREE.DirectionalLight( 0xffffff );
            //light.position.set( 0, 1, 1 ).normalize();
            //mdc.scene.add(light);

            //半球面环境光，模拟天空到大地的光线，可作为主环境光
            var envlight = new THREE.HemisphereLight(0xffffff, 0xA2C9ED, 0.8);
            //var envlight = new THREE.HemisphereLight( 0x888888, 0x111111, 0.8);
            envlight.position.set(0, 1500, 0);

            //envlight.shadowCameraFov = 60;
            mdc.scene.add(envlight);

            // // 5000 is sphere size, 3000 is arrow length
            // //var hlightHelper = new THREE.HemisphereLightHelper(envlight, 10000, 1000);
            // //ar.scene.add(hlightHelper);

            // //平行光，用于产生阴影
            // var light = new THREE.DirectionalLight(0xffffff);
            // light.position.set(0, 1000, 1000);
            // light.target.position.set(0, 0, 0);


            // light.castShadow = true;
            // light.shadowDarkness = 0.7;
            // //light.shadowCameraNear = 2;
            // //light.shadowCameraFar = 5000;
            // light.shadowCameraLeft = -3000;
            // light.shadowCameraRight = 3000;
            // light.shadowCameraTop = 3000;
            // light.shadowCameraBottom = -3000;
            // //light.shadowCameraFov = 60000;
            // light.shadowMapWidth = light.shadowMapHeight = 1024;

            // mdc.scene.add(light);
            // mdc.light = light;

            // var light = new THREE.PointLight( 0xff0000, 1, 100 );
            // light.position.set( 50, 50, 50 );
            // mdc.scene.add( light );
            // mdc.light = light;

            mdc.angle = 0.1;

            var spotLight1 = new THREE.SpotLight(0xffffff);
            spotLight1.position.set(1000, 1000, 1000);

            spotLight1.castShadow = true;
            spotLight1.shadowCameraVisible = true;
            spotLight1.shadowDarkness = 0.7;
            spotLight1.shadowMapWidth = 1024;
            spotLight1.shadowMapHeight = 1024;

            spotLight1.shadowCameraNear = 500;
            spotLight1.shadowCameraFar = 4000;
            spotLight1.shadowCameraFov = 30;
            mdc.scene.add(spotLight1);
            mdc.light1 = spotLight1;


            var spotLight2 = new THREE.SpotLight(0xffffff);
            spotLight2.position.set(-1000, 1000, -1000);

            spotLight2.castShadow = true;
            spotLight2.shadowCameraVisible = true;
            spotLight2.shadowDarkness = 0.7;
            spotLight2.shadowMapWidth = 1024;
            spotLight2.shadowMapHeight = 1024;

            spotLight2.shadowCameraNear = 500;
            spotLight2.shadowCameraFar = 4000;
            spotLight2.shadowCameraFov = 30;
            mdc.scene.add(spotLight2);
            mdc.light2 = spotLight2;

            //ar.camera.updateMatrix();
            //var cameraHelper = new THREE.CameraHelper( light.shadow );
            //this.scene.add(cameraHelper);

            //// 50 is helper size
            //dlightHelper = new THREE.DirectionalLightHelper(light, 500);
            //ar.scene.add(dlightHelper);

        };

        mdc.init = function(id, option) {
            this.initScene();
            this.initRender();
            this.initCamera();
            this.attachToDom();
            this.initResize();
            this.initControl();
            //this.initDebugParts();
            this.defineMouseBehavior();
            this.initParts(option);
            this.initLight();            
        };

        mdc.animate = function(time) {
            mdc.aniframeId = requestAnimationFrame(mdc.animate);

            TWEEN.update();
            mdc.controls.update();
            mdc.render(time);

        };

        mdc.render = function(time) {
            if (!mdc) return;
            mdc.update(time);

            mdc.renderer.render(mdc.scene, mdc.camera);
        };

        mdc.update = function(time) {
            if (mdc.effect.smoke) {
                mdc.effect.smoke.group.tick(mdc.clock.getDelta());
            };

            if (mdc.effect.invade) {
                mdc.light1.color.setHex(0xff0000);
                mdc.light2.color.setHex(0xff0000);
                mdc.ambientLight.color.setHex(0xff6666);
            };
            if (!mdc.effect.invade) {
                mdc.light1.color.setHex(0xffffff);
                mdc.light2.color.setHex(0xffffff);
                mdc.ambientLight.color.setHex(0xaaaaaa);
            };

            if (mdc.effect.cruise) {
                mdc.parts.forEach(function(part) {
                    if (part.category !== "waterLeakage")
                        part.currentShape.rotation.y -= 0.002;
                });
            }

            var wls = _.where(mdc.parts, { category: "waterLeakage" });
            if (wls.length > 0) {
              wls.forEach(function(part){
                if(part.shape.children.length == 0) return;
                part.shape.children[0].material.uniforms.visibility.value = (time / 3000) % 1.0;
                //part.shape.children[0].rotation.copy(mdc.parts[0].currentShape.rotation);
              });
            }

            // high light mouse indicator
            mdc.raycaster.setFromCamera(mdc.mouse, mdc.camera);
            var intersects = mdc.raycaster.intersectObjects(mdc.scene.children, true);

            if (intersects.length > 0) {

                if (mdc.INTERSECTED != intersects[0].object) {
                    if (mdc.INTERSECTED) mdc.util.maskColor(mdc.INTERSECTED, mdc.INTERSECTED.currentHex);
                    mdc.INTERSECTED = intersects[0].object;
                    mdc.INTERSECTED.currentHex = mdc.util.getMaskColor(mdc.INTERSECTED);
                    mdc.util.maskColor(mdc.INTERSECTED, 0x223366);
                }

            } else {
                if (mdc.INTERSECTED) mdc.util.maskColor(mdc.INTERSECTED, mdc.INTERSECTED.currentHex);
                mdc.INTERSECTED = null;
            }

            if (Date.now() % 2 == 0) {
                mdc.angle -= 0.1;
                mdc.light1.position.x = 800 + 300 * Math.sin(mdc.angle);
                mdc.light1.position.y = 800 + 300 * Math.cos(mdc.angle);
                mdc.light1.position.z = 800 + 300 * Math.cos(mdc.angle);

                mdc.light2.position.x = -800 + 300 * Math.sin(mdc.angle);
                mdc.light2.position.y = 800 + 300 * Math.cos(mdc.angle);
                mdc.light2.position.z = -800 + 300 * Math.sin(mdc.angle);
            }
        };
        mdc.initParts = function(option) {

            if(option == undefined || option.number == undefined){
                if(option == undefined)
                    option = {};
                option.number = 24;
            }
            var rowNumber = parseInt(parseInt(option.number)/2);

            this.parts.push(PartManager.createBase(rowNumber));


            PartManager.createCameras(rowNumber).forEach(function(c) {
                mdc.parts.push(c);
            });

            this.parts.push(PartManager.createCeiling(rowNumber));

            PartManager.createCabinets(option).forEach(function(cab) {
                mdc.parts.push(cab);
            });

            PartManager.createThermalMaps(rowNumber).forEach(function(map) {
                mdc.parts.push(map);
            });

            PartManager.createDoors(rowNumber).forEach(function(door) {
                mdc.parts.push(door);
            });

            this.parts.forEach(function(part) {
                mdc.scene.add(part.shape);
                part.init();
            });


            mdc.scene.updateMatrixWorld(true);
        };

        mdc.util = {};
        mdc.util.getObjectByMesh = function(parent, mesh) {

            if (parent === mesh) return true;
            if (!parent) return;
            for (var i = 0; i < parent.children.length; i++) {
                if (mdc.util.getObjectByMesh(parent.children[i], mesh)) return true;
            }

            return false;
        };

        mdc.util.maskColor = function(mesh, color) {
            if (!mesh) return;

            for (var i = 0; i < mdc.parts.length; i++) {
                var partexist = mdc.util.getObjectByMesh(mdc.parts[i].currentShape, mesh);
                if (partexist) {
                    if (mdc.parts[i].category !== "rack") return;
                }
            }

            try {
                if (mesh.material instanceof THREE.MeshPhongMaterial) {
                    mesh.material.emissive.setHex(color);
                    //mesh.material.color.setHex( color );
                }

                if (mesh.material instanceof THREE.MultiMaterial) {
                    mesh.material.materials.forEach(function(m) {
                        //m.color.setHex( color );
                        m.emissive.setHex(color);
                    });
                }
            } catch (err) {

            }
        };

        mdc.util.getMaskColor = function(mesh) {
            if (!mesh) return;
            if (mesh.material instanceof THREE.MeshPhongMaterial) {
                return mesh.material.emissive.getHex();
            }

            if (mesh.material instanceof THREE.MultiMaterial) {
                return mesh.material.materials[0].emissive.getHex();
            }
        };

        mdc.stage = {};
        mdc.stage.current = null;
        mdc.stage.switch = function(newStage) {
            if (mdc.stage.current === newStage) return;
            mdc.effect.cruise = null;
            // var expanded = _.every(mdc.parts, function(part) {
            //     return part.states.expanded;
            // });
            // if (expanded) mdc.effect.collapseAll();
            // var collapsed = _.every(mdc.parts, function(part) {
            //     return !part.states.expanded;
            // });

            // var tick = 100;
            // if (!expanded && !collapsed) {
            //     return;
            // }

            if (mdc.stage.current) {
                if (mdc.stage.current === "monitor") mdc.stage.exitMonitor();
                if (mdc.stage.current === "thermal") mdc.stage.exitThermal();
                if (mdc.stage.current === "space") mdc.stage.exitSpace();
                if (mdc.stage.current === "power") mdc.stage.exitPower();
            }

            if (newStage === "monitor") mdc.stage.enterMonitor();
            if (newStage === "thermal") mdc.stage.enterThermal();
            if (newStage === "space") mdc.stage.enterSpace();
            if (newStage === "power") mdc.stage.enterPower();

            mdc.stage.current = newStage;

        };

        mdc.stage.enterMonitor = function() {
        };
        mdc.stage.exitMonitor = function() {

        };
        mdc.stage.enterThermal = function() {
            mdc.updateThermalMaps();
            mdc.parts.forEach(function(part) {
                part.stageDefault(mdc);
                if (part.category === "thermalMap"){
                    part.shape.visible = true;
                    //part.states.expanded = false;
                    //part.expand();
                }
            });
        };
        mdc.stage.exitThermal = function() {
            mdc.parts.forEach(function(part) {
                part.stageDefault(mdc);
                if (part.category === "thermalMap"){
                    part.shape.visible = false;
                }
            });
        };

        mdc.stage.enterSpace = function() {
            mdc.parts.forEach(function(part) {
                part.stageSpace(mdc);
            });
        };
        mdc.stage.exitSpace = function() {
            mdc.parts.forEach(function(part) {
                part.stageDefault(mdc);
            });
        };
        mdc.stage.enterPower = function() {
            mdc.parts.forEach(function(part) {
                part.stagePower(mdc);
            });
        };
        mdc.stage.exitPower = function() {
            mdc.parts.forEach(function(part) {
                part.stageDefault(mdc);
            });
        };

        mdc.effect = {};
        mdc.effect.tweenCamera = function(position, target) {
            new TWEEN.Tween(mdc.camera.position).to({
                x: position.x,
                y: position.y,
                z: position.z
            }, 3000).easing(TWEEN.Easing.Linear.None).onUpdate(function() {
                mdc.camera.lookAt(target);
            }).onComplete(function() {}).start();
        };
        mdc.effect.partmount = function() {
            var expanded = _.every(mdc.parts, function(part) {
                return part.states.expanded;
            });
            if (expanded) mdc.effect.collapseAll();
            var collapsed = _.every(mdc.parts, function(part) {
                return !part.states.expanded;
            });
            if (collapsed) mdc.effect.expandAll();
            if (!collapsed && !expanded) mdc.effect.collapseAll();
        };
        mdc.effect.expandAll = function() {
            mdc.effect.cruise = null;
            new TWEEN.Tween(mdc.camera.position)
                .to({ x: 700, y: 700, z: 700 }, 2000) // relative animation
                .start();
            mdc.parts.forEach(function(part) {
                part.expand();
            });

            if (!mdc.lastData && mdc.stage == "monitor") return;
            var wls = _.where(mdc.parts, { category: "waterLeakage" });
            wls.forEach(function(wd){
                wd.shape.visible = true;
                wd.shape.rotation.copy(mdc.parts[0].currentShape.rotation);
            });

        };
        mdc.effect.collapseAll = function() {
            mdc.effect.cruise = null;
            new TWEEN.Tween(mdc.camera.position)
                .to({ x: 530, y: 530, z: 530 }, 2000) // relative animation
                .start();
            mdc.parts.forEach(function(part) {
                if (part.category === "thermalMap"){
                    console.log('aa');
                }
                part.collapse();
            });

            if (!mdc.lastData && mdc.stage == "monitor") return;
            var wls = _.where(mdc.parts, { category: "waterLeakage" });
            wls.forEach(function(wd){
                wd.shape.visible = false;
            });
        };

        mdc.effect.skyLightfalling = function(status) {
            var angle = "-" + Math.PI / 2 ;
            if (status) 
            {
                mdc.effect.skyfall = {};
                angle = "-" + Math.PI / 2 ;
            }
            else
            {
                mdc.effect.skyfall = undefined;
                angle = 0 ;   
            }

            var ceiling = _.find(mdc.parts, function(part) {
                return part.id === "ceiling";
            });
            var oldceiling = _.find(ceiling.shape.children, function(mesh) {
                return mesh.isWindow === true;
            });

            oldceiling.children.forEach(function(win) {
                new TWEEN.Tween(win.rotation)
                    .to({ x: angle }, 1000) // relative animation
                    .start();
            });

        };

        mdc.effect.closeSmoking = function(){
            if (!mdc.effect.smoke) return;
            mdc.scene.remove(mdc.effect.smoke.group.mesh);
            PartManager.disposeShape(mdc.effect.smoke.group.mesh);
            mdc.effect.smoke = undefined;
        };

        mdc.effect.smoking = function(rowNumber) {
            function initParticles(rowNumber) {
                var zV = - (rowNumber - 12)*30;

                var loader = new THREE.TextureLoader();
                var url = 'img/3d/cloudSml.png';
                var texture = loader.load(url);

                var particleGroupCrash = new SPE.Group({
                    texture: {
                        value: texture
                    },
                    blending: THREE.NormalBlending
                });

                var crashemitter = new SPE.Emitter({

                    maxAge: { value: 3 },
                    position: {
                        value: new THREE.Vector3(0, 0, zV),
                        spread: new THREE.Vector3(200, 0, 260)
                    },
                    wiggle: {
                        value: 4000
                    },
                    size: {
                        value: [64, 256, 512],
                        spread: [0, 32, 64, 128, 192, 256, 512],
                        randomise: true
                    },
                    acceleration: {
                        value: new THREE.Vector3(0, 40, 0),
                        spread: new THREE.Vector3(40, 10, 40)
                    },
                    rotation: {
                        axis: new THREE.Vector3(0, 1, 0),
                        spread: new THREE.Vector3(10, 20, 0),
                        angle: 100 * Math.PI / 180
                    },
                    velocity: {
                        value: new THREE.Vector3(0, 1, -0.5),
                        spread: new THREE.Vector3(0.25, 0.1, 0.25)
                    },
                    opacity: {
                        value: [0.2, 0.3, 0]
                    },
                    color: {
                        value: [new THREE.Color(0x333333), new THREE.Color(0x111111)],
                        spread: [new THREE.Vector3(0.2, 0.1, 0.1), new THREE.Vector3(0, 0, 0)]
                    },
                    particleCount: 4000,
                    maxParticleCount: 300000
                });


                particleGroupCrash.addEmitter(crashemitter);
                mdc.scene.add(particleGroupCrash.mesh);
                return particleGroupCrash;
            };
            mdc.effect.smoke = {};
            mdc.effect.smoke.group = initParticles(rowNumber);
        };

        mdc.effect.invading = function() {
            mdc.effect.invade = {};
        };

        mdc.effect.openDoor = function(index){
            if (index === 0){ mdc.effect.doorA = {}; }
            if (index === 1){ mdc.effect.doorB = {}; }

            var doors = _.where(mdc.parts, { category: "door" });
            if(doors.length == 0) return;
            new TWEEN.Tween(doors[index].shape.children[0].position)
                .to({ x: -100 }, 1000)
                .start();
            new TWEEN.Tween(doors[index].shape.children[1].position)
                .to({ x: 100 }, 1000)
                .start();
        };

        mdc.effect.closeDoor = function(index){
            if (index === 0){ mdc.effect.doorA = undefined; }
            if (index === 1){ mdc.effect.doorB = undefined; }

            var doors = _.where(mdc.parts, { category: "door" });
            if(doors.length == 0) return;
            new TWEEN.Tween(doors[index].shape.children[0].position)
                .to({ x: -44 }, 1000)
                .start();
            new TWEEN.Tween(doors[index].shape.children[1].position)
                .to({ x: 44 }, 1000)
                .start();
        };

        mdc.effect.dooropening = function() {
            mdc.effect.dooropen = {};
            var doors = _.where(mdc.parts, { category: "door" });

            new TWEEN.Tween(doors[0].shape.children[0].position)
                .to({ x: -100 }, 1000)
                .start();
            new TWEEN.Tween(doors[0].shape.children[1].position)
                .to({ x: 100 }, 1000)
                .start();
        };

        mdc.effect.cruising = function() {
            var expanded = _.every(mdc.parts, function(part) {
                return part.states.expanded;
            });
            var collapsed = _.every(mdc.parts, function(part) {
                return !part.states.expanded;
            });
            if (!expanded && !collapsed) return;

            if (!mdc.effect.cruise) {
                mdc.effect.collapseAll();
                mdc.effect.cruise = {};
            } else {
                delete mdc.effect.cruise;
            }
        };

        mdc.effect.rackAlarming = function(rackId, alarmLevel){
            var resetColor = function(rack){
                var mesh = rack.currentShape.children[0].children[0];
                if (mesh.material instanceof THREE.MultiMaterial)
                {
                    var i=0;
                    mesh.material.materials.forEach(
                        function(m) {
                            m.color = {r:1,g:1,b:1};
                    });
                }
            };

            var showAlarm = function(rack, alarmLevel) {
                var tweens =[];
                var mesh = rack.currentShape.children[0].children[0];
                var color = 0xffffff;
                switch (alarmLevel) {
                    case 1:
                        color = 0x00FF33;
                        break;
                    case 2:
                        color = 0x66ccff;
                        break;
                    case 3:
                        color = 0xffff66;
                        break;
                    case 4:
                        color = 0xff6666;
                        break;
                    default:
                }

                if (mesh.material instanceof THREE.MultiMaterial) {
                    //var kso = {id:that.id,twarray:[]};
                    mesh.material.materials.forEach(function(m) {
                        var c = new THREE.Color(color);
                        var t1 = new TWEEN.Tween(m.color)
                            .to(c, 3000)
                            .easing(TWEEN.Easing.Quartic.InOut)
                            .repeat(Infinity)
                            .start();
                        var t2 = new TWEEN.Tween(m.shininess)
                            .to(400, 3000)
                            .easing(TWEEN.Easing.Quartic.InOut)
                            .repeat(Infinity)
                            .start();
                        tweens.push(t1);
                        tweens.push(t2);
                        //kso.twarray.push(tw);

                    });
                    //that.tws.push(kso);
                }

                return tweens;
            };

            var rack = _.find(mdc.parts, function(part) {
                return part.id === rackId;
            });

            if (!rack) return;
            if (!alarmLevel) return;
            // if no his & no new alarm, return 
            if (alarmLevel <= 0 && !rack.states.alarm) return;

            if (rack.states.alarm){
                //if new alarm is same to old, not need update.
                if (rack.states.alarm.alarmLevel == alarmLevel) return;
            }

            //stop old alarm
            if (rack.states.alarm){
                rack.states.alarm.tws.forEach(function(tw){
                    tw.stop();
                });          
                resetColor(rack);
                rack.states.alarm = null;   
                if (alarmLevel <= 0)  return;
            }

            //start new alarm 
            rack.states.alarm = {alarmLevel:alarmLevel, tws:[] };

            var twarray = showAlarm(rack, alarmLevel);

            twarray.forEach(function(tw){ rack.states.alarm.tws.push(tw); });


        };

        mdc.effect.shining = function() {
            var showAlarm = function(rack, alarmLevel) {
                var mesh = rack.currentShape.children[0].children[0];
                var color = 0xffffff;
                switch (alarmLevel) {
                    case 1:
                        color = 0x00FF33;
                        break;
                    case 2:
                        color = 0x66ccff;
                        break;
                    case 3:
                        color = 0xffff66;
                        break;
                    case 4:
                        color = 0xff6666;
                        break;
                    default:
                }

                if (mesh.material instanceof THREE.MultiMaterial) {
                    //var kso = {id:that.id,twarray:[]};
                    mesh.material.materials.forEach(function(m) {
                        var c = new THREE.Color(color);
                        new TWEEN.Tween(m.color)
                            .to(c, 3000)
                            .easing(TWEEN.Easing.Quartic.InOut)
                            .repeat(Infinity)
                            .start();
                        new TWEEN.Tween(m.shininess)
                            .to(400, 3000)
                            .easing(TWEEN.Easing.Quartic.InOut)
                            .repeat(Infinity)
                            .start();

                        //kso.twarray.push(tw);

                    });
                    //that.tws.push(kso);
                }
            };

            var r1 = _.find(mdc.parts, function(part) {
                return part.id === "rack1";
            });
            var r2 = _.find(mdc.parts, function(part) {
                return part.id === "rack8";
            });
            var r3 = _.find(mdc.parts, function(part) {
                return part.id === "rack10";
            });
            var r4 = _.find(mdc.parts, function(part) {
                return part.id === "rack17";
            });
            showAlarm(r1, 1);
            showAlarm(r2, 2);
            showAlarm(r3, 3);
            showAlarm(r4, 4);

        };

        mdc.effect.closeWaterLeakingA = function(){
            var wl = _.find(mdc.parts, function(part) {
                return part.id === "waterLeakageA";
            });

            if (!wl) return;            
            mdc.scene.remove(wl.shape);

            PartManager.disposeShape(wl.shape);

            mdc.parts = _.without(mdc.parts, wl);

            mdc.effect.waterDetectorA = undefined;
            delete mdc.effect.waterDetectorA;
        };

        mdc.effect.closeWaterLeakingB = function(){
            var wl = _.find(mdc.parts, function(part) {
                return part.id === "waterLeakageB";
            });

            if (!wl) return;            
            mdc.scene.remove(wl.shape);

            PartManager.disposeShape(wl.shape);

            mdc.parts = _.without(mdc.parts, wl);

            mdc.effect.waterDetectorB = undefined;
            delete mdc.effect.waterDetectorA;
        };

        mdc.effect.waterLeakingA = function(rowNumber) {
            mdc.effect.waterDetectorA = {};
            var wl = _.find(mdc.parts, function(part) {
                return part.id === "waterLeakageA";
            });

            if (wl) return;            

            var part= PartManager.createWaterLeakageA(rowNumber);
            
            mdc.parts.push(part);
            part.init();
            mdc.scene.add(part.shape);
            part.shape.rotation.copy(mdc.parts[0].currentShape.rotation);
            mdc.effect.expandAll();   
        };

        mdc.effect.waterLeakingB = function(rowNumber) {
            mdc.effect.waterDetectorB = {};
            var wl = _.find(mdc.parts, function(part) {
                return part.id === "waterLeakageB";
            });

            if (wl) return;            

            var part= PartManager.createWaterLeakageB(rowNumber);
            mdc.parts.push(part);
            part.init();
            mdc.scene.add(part.shape);
            part.shape.rotation.copy(mdc.parts[0].currentShape.rotation);
            mdc.effect.expandAll();   
        };
        
        mdc.updateThermalMaps = function(){
            var maps = [];
            if (mdc.stage.current !== "thermal") 
            {
                mdc.parts.forEach(function(part) {
                    if (part.category === "thermalMap"){
                        part.shape.visible = false;
                    }
                });
                return;
            }

            mdc.parts.forEach(function(part) {
                if (part.category === "thermalMap") {
                    maps.push(part);
                }
            });

            maps.forEach(function(map) {
                mdc.parts = _.without(mdc.parts, map);
                map.dispose(mdc);
            });

            maps=[];

            var cfgA = {side:'A',points:[]};
            var cfgB = {side:'B',points:[]};

            mdc.parts.forEach(function(part) {
                if (part.info) {
                    if (part.info.tempSensors){
                        part.info.tempSensors.forEach(function(sensor){                            
                            if (part.info.side === "A"){
                                cfgA.points.push(sensor);
                            }
                            if (part.info.side === "B"){
                                cfgB.points.push(sensor);
                            }
                        });
                    }
                }
            });
            
            var mapA,mapB;
            if (cfgA.points.length > 0){
                mapA = PartManager.createThermalMap(cfgA.side,cfgA.points, mdc.options);
                //setTimeout(function(){
                    mdc.parts.push(mapA);
                    mdc.scene.add(mapA.shape);
                    mapA.shape.rotation.copy(mdc.parts[0].currentShape.rotation);
                    mapA.init();
                    if (mdc.parts[0].states.expanded) mapA.expand();
                //}, 5000);

            }
            if (cfgB.points.length > 0){
                mapB = PartManager.createThermalMap(cfgB.side,cfgB.points, mdc.options);
                //setTimeout(function(){
                    mdc.parts.push(mapB);
                    mdc.scene.add(mapB.shape);
                    mapB.shape.rotation.copy(mdc.parts[0].currentShape.rotation);
                    mapB.init();
                    if (mdc.parts[0].states.expanded) mapB.expand();
                //}, 5000);
            }
        };

            mdc.dispose = function () {
                var disposeObject = function (obj) {
                    for (var b in obj) {
                        if (typeof (obj[b]) === "function" && obj[b].name === "event") {
                            obj[b] = undefined;
                        }
                        else if (typeof (obj[b]) === "function" && obj[b].length > 0) {
                            disposeObject(obj[b]);
                        }
                        else if (typeof (obj[b]) === "object" && b === "dispatch") {
                            disposeObject(obj[b]);
                        }
                    }
                };

                var disposeNode = function (node) {
                    if (node instanceof THREE.Camera) {
                        node = undefined;
                    }
                    else if (node instanceof THREE.Light) {
                        if (!node.dispose) {
                            disposeObject(node);
                        }
                        else
                            node.dispose();
                        node = undefined;
                    }
                    else if (node instanceof THREE.Mesh) {
                        if (node.geometry) {
                            node.geometry.dispose();
                            node.geometry = undefined;
                            delete node.geometry;
                        }

                        if (node.material) {
                            if (node.material instanceof THREE.MeshFaceMaterial) {
                                $.each(node.material.materials, function (idx, mtrl) {
                                    if (!mtrl) return;
                                    mtrl.dispose();
                                    if (mtrl.map) {
                                        mtrl.map.dispose();
                                        mtrl.map = undefined;
                                        delete mtrl.map;
                                    }

                                    if (mtrl.lightMap) mtrl.lightMap.dispose();
                                    if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                                    if (mtrl.normalMap) mtrl.normalMap.dispose();
                                    if (mtrl.specularMap) mtrl.specularMap.dispose();
                                    if (mtrl.envMap) mtrl.envMap.dispose();

                                    mtrl.dispose();    // disposes any programs associated with the material
                                    mtrl = undefined;
                                    delete mtrl;
                                });
                            }
                            else {
                                if (node.material.map) {
                                    node.material.map.dispose();
                                    node.material.map = undefined;
                                    delete node.material.map;
                                }

                                if (node.material.lightMap) node.material.lightMap.dispose();
                                if (node.material.bumpMap) node.material.bumpMap.dispose();
                                if (node.material.normalMap) node.material.normalMap.dispose();
                                if (node.material.specularMap) node.material.specularMap.dispose();
                                if (node.material.envMap) node.material.envMap.dispose();

                                node.material.dispose();   // disposes any programs associated with the material
                                node.material = undefined;
                                delete node.material;
                            }
                        }

                        node = undefined;
                    }
                    else if (node instanceof THREE.Object3D) {
                        node = undefined;
                        delete node;
                    }
                };

                var disposeHierarchy = function (node, callback) {
                    for (var i = node.children.length - 1; i >= 0; i--) {
                        var child = node.children[i];
                        disposeHierarchy(child, callback);
                        callback(child);
                    }
                };

                mdc.effect.closeSmoking();
                mdc.effect.closeWaterLeakingA();
                mdc.effect.closeWaterLeakingB();
                //remove event for controller
                $(window).off();
                $(window).unbind();
                $(document).off();
                $(document).unbind();
                $(mdc.domId).off();
                $(mdc.domId).unbind();
                if (mdc.renderer) $(mdc.renderer.domElement).off();

                //stop animation
                TWEEN.removeAll();
                if (mdc.aniframeId) window.cancelAnimationFrame(mdc.aniframeId);
                //remove shapes              

                //remove scene
                if (mdc.controls) mdc.controls.dispose();
                if (mdc.raycaster) disposeObject(mdc.raycaster);


                if (mdc.camera) disposeObject(mdc.camera);
                if (mdc.container) disposeObject(mdc.container);

                if (mdc.renderer) {
                    mdc.renderer.forceContextLoss();
                    mdc.renderer.context = null;
                    mdc.renderer.domElement = null;
                    disposeObject(mdc.renderer);
                    mdc.renderer = null;
                }

                doDispose(mdc.scene);

                function doDispose(obj) {
                    if (obj !== null) {
                        for (var i = 0; i < obj.children.length; i++) {
                            doDispose(obj.children[i]);
                        }
                        if (obj.geometry) {
                            obj.geometry.dispose();
                            obj.geometry = undefined;
                        }
                        if (obj.material) {
                            if (obj.material instanceof THREE.MeshFaceMaterial) {
                                $.each(obj.material.materials, function (idx, o) {
                                    if (!o) return;
                                    if (o.map) {
                                        o.map.dispose();
                                        o.map = undefined;
                                        delete o.map;
                                    }
                                    o.dispose();
                                });
                            } else {
                                obj.material.dispose();
                            }
                        }
                        if (obj.dispose) {
                            obj.dispose();
                        }
                    }
                    obj = undefined;
                }

                mdc.scene = null;

                disposeObject(mdc);
                mdc = undefined;
            };

        mdc.updateData = function (response) {
            if (!response) return;
            if (!response.mdc) return;
            if (!response.cabinets) return;
            mdc.lastData = response;

            var rowNumber = parseInt(parseInt(mdc.options.number)/2);

            //update smoke status
            if (mdc.stage.current === "monitor"){
                if (response.mdc.smokeDetector){
                    if (!mdc.effect.smoke && response.mdc.smokeDetector.alarming){
                        mdc.effect.smoking(rowNumber);
                    }
                    if (mdc.effect.smoke && !response.mdc.smokeDetector.alarming){
                        mdc.effect.closeSmoking();
                    }
                }
                if (response.mdc.infraredDetector){
                    if (!mdc.effect.invade && response.mdc.infraredDetector.alarming){
                        mdc.effect.invade = {};
                    }
                    if (mdc.effect.invade && !response.mdc.infraredDetector.alarming){
                        mdc.effect.invade = undefined;
                    }
                }
                if (response.mdc.ceilingWindow){
                    if (!mdc.effect.skyfall && response.mdc.ceilingWindow.opened){
                        mdc.effect.skyLightfalling(true);
                    }
                    if (mdc.effect.skyfall && !response.mdc.ceilingWindow.opened){
                        mdc.effect.skyLightfalling(false);
                    }
                }
                if (response.mdc.doorA){
                    if (!mdc.effect.doorA && response.mdc.doorA.opened){
                        mdc.effect.openDoor(0);
                    }
                    if (mdc.effect.doorA && !response.mdc.doorA.opened){
                        mdc.effect.closeDoor(0)
                    }
                }
                if (response.mdc.doorB){
                    if (!mdc.effect.doorB && response.mdc.doorB.opened){
                        mdc.effect.openDoor(1);
                    }
                    if (mdc.effect.doorB && !response.mdc.doorB.opened){
                        mdc.effect.closeDoor(1)
                    }
                }
                if (response.mdc.waterDetectorA){
                    if (!mdc.effect.waterDetectorA && response.mdc.waterDetectorA.alarming){
                        mdc.effect.waterLeakingA(rowNumber);
                    }
                    if (mdc.effect.waterDetectorA && !response.mdc.waterDetectorA.alarming){
                        mdc.effect.closeWaterLeakingA();
                    }
                }
                if (response.mdc.waterDetectorB){
                    if (!mdc.effect.waterDetectorB && response.mdc.waterDetectorB.alarming){
                        mdc.effect.waterLeakingB(rowNumber);
                    }
                    if (mdc.effect.waterDetectorB && !response.mdc.waterDetectorB.alarming){
                        mdc.effect.closeWaterLeakingB();
                    }
                }

                if (response.cabinets){
                    response.cabinets.forEach(function(cab){
                        mdc.effect.rackAlarming(cab.id,cab.alarmLevel);
                    });
                }
            }
            if (response.cabinets){
                response.cabinets.forEach(function(cab){
                    var rack = _.find(mdc.parts, function(part) {
                        return part.id === cab.id;
                    });

                    if (rack) rack.info = cab;
                });
                mdc.updateThermalMaps();
            }

        };

        mdc.init(id, option);

        //mdc.stage.switch('space');

        mdc.animate();
        return mdc;
    }

};
