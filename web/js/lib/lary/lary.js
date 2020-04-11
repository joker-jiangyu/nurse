var Lary = {
    create: function(id, option) {
        var lary = {};
        // 画布
        lary.canvas = document.getElementById(id);
        lary.option = null; //初始化配置
        lary.cabinetShapes = []; //所有柜子的全局变量，shape为3D模型和业务数据合体
        //lary.initialCarmeraPosition = new BABYLON.Vector3(800, 210, 920); //斜45度视图
        lary.initialCarmeraPosition = new BABYLON.Vector3(50, 300, 800);

        if (!option) {
            lary.option = {
                mdcName: "mdc",
                racks: [
                    { index: 1, name: "TR01", face: "default", state: "capacity", percent: 28 },
                    { index: 2, name: "TR02", state: "alarm", level: 1, face: "default" },
                    { index: 3, name: "TR03", state: "default", face: "default" },
                    { index: 4, name: "TR04", state: "default", face: "default" },
                    { index: 5, name: "TR05", state: "default", face: "default" },
                    { index: 6, name: "TR06", state: "default", face: "default" },
                    { index: 7, name: "TR07", state: "default", face: "default" },
                    { index: 8, name: "TR08", state: "default", face: "default" },
                    { index: 9, name: "TR09", state: "default", face: "default" },
                    { index: 10, name: "TR10", state: "capacity", percent: 71, face: "default" },
                    { index: 11, name: "TR11", state: "default", face: "default" },
                    { index: 12, name: "TR12", state: "default", face: "default" },
                    { index: 13, name: "TR13", state: "default", face: "default" },
                    { index: 14, name: "TR14", state: "default", face: "default" },
                    { index: 15, name: "TR15", state: "default", face: "default" },
                    { index: 16, name: "TR16", state: "default", face: "default" },
                    { index: 17, name: "TR17", state: "default", face: "default" },
                    { index: 18, name: "TR18", state: "default", face: "default" },
                    { index: 19, name: "TR19", state: "default", face: "default" },
                    { index: 20, name: "TR20", state: "default", face: "default" },
                    { index: 21, name: "TR21", state: "default", face: "default" },
                    { index: 22, name: "TR22", state: "default", face: "default" },
                    { index: 23, name: "TR23", state: "default", face: "default" },
                    { index: 24, name: "TR24", state: "default", face: "default" },
                    { index: 25, name: "TR25", state: "default", face: "default" },
                    { index: 26, name: "TR26", state: "default", face: "default" },
                    { index: 27, name: "TR27", state: "default", face: "default" },
                    { index: 28, name: "TR28", state: "default", face: "default" },
                    { index: 29, name: "TR29", state: "default", face: "default" },
                    { index: 30, name: "TR30", state: "default", face: "default" }
                ],
                behaviors: {
                    clickCallback: null,
                    dbclickCallback: null
                }
            };
        } else {
            lary.option = option;
        }

        //初始化
        lary.init = function() {
            lary.engine = new BABYLON.Engine(lary.canvas, true, { stencil: true }); // Generate the BABYLON 3D engine
            lary.scene = new BABYLON.Scene(lary.engine);
            lary.scene.clearColor = new BABYLON.Color3(1, 1, 1);
            lary.manager = new BABYLON.GUI.GUI3DManager(lary.scene);
            lary.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
            //lary.anchor = new BABYLON.TransformNode("anchor",lary.scene);
            //lary.anchor.rotation.y = 3.1415926;
            lary.advancedTexture.isForeground = false;

            lary.light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(2000, 2000, 1000), lary.scene);
            lary.light1 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, -1, 0), lary.scene);
            lary.light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), lary.scene); //环境光
            lary.light.intensity = 0.3; //灯光强度

            lary.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), lary.scene);
            lary.camera.setPosition(lary.initialCarmeraPosition);
            lary.camera.attachControl(lary.canvas, false);

            lary.highlightLayer = new BABYLON.HighlightLayer("hl1", lary.scene);

            lary.materialDefaultCabinet = new BABYLON.StandardMaterial("cabinetBasicMaterial", lary.scene);
            //var cabinetTexture =  new BABYLON.CubeTexture('/rackbox/side', lary.scene);
            var cabinetTexture = new BABYLON.Texture("../../../img/diagram/mdc_rack.jpg", lary.scene);
            cabinetTexture.backFaceCulling = false;
            lary.materialDefaultCabinet.diffuseTexture = cabinetTexture;

            lary.materialSideCabinet = new BABYLON.StandardMaterial("cabinetSideMaterial", lary.scene);
            var cabinetSideTexture = new BABYLON.Texture("../../../img/diagram/side.jpg", lary.scene);
            cabinetSideTexture.backFaceCulling = false;
            lary.materialSideCabinet.diffuseTexture = cabinetSideTexture;

            lary.loadModel();
            lary.refresh(lary.option);

            // Move the light with the camera
            lary.scene.registerBeforeRender(function() {
                lary.light.position = lary.camera.position
            });

            //init camera animation
            lary.animationSide = new BABYLON.Animation("Side", "position", 25, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            var keys = [];

            keys.push({
                frame: 0,
                //value: BABYLON.Vector3.Zero(),
                value: lary.initialCarmeraPosition
                //outTangent: new BABYLON.Vector3(1000, 400, 1000)
            });

            keys.push({
                frame: 20,
                //inTangent: new BABYLON.Vector3(1, 0, 0),
                value: new BABYLON.Vector3(0, 300, 400)
                    //outTangent: new BABYLON.Vector3(-1, 0, 0)
            });

            keys.push({
                frame: 50,
                //inTangent: new BABYLON.Vector3(-100, 400, 100),
                value: new BABYLON.Vector3(-40, 300, -1000)
            });

            lary.animationSide.setKeys(keys);

            lary.camera.animations = [];
            lary.camera.animations.push(lary.animationSide);

            //lary.camera.position = lary.initialCarmeraPosition;
            //lary.camera.setPosition(lary.initialCarmeraPosition);
            // Register a render loop to repeatedly render the scene
            lary.engine.runRenderLoop(function() {
                lary.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", function() {
                lary.engine.resize();
            });
        };

        lary.loadModel = function() {
            // The first parameter can be used to specify which mesh to import. Here we import all meshes
            BABYLON.SceneLoader.ImportMesh("", "/js/lib/lary/", "mdc.obj", lary.scene, function(newMeshes) {
                // Set the target of the camera to the first imported mesh
                lary.camera.target = newMeshes[0];
            });

            /*lary.option.racks.forEach(element => {
                lary.createCabinet(element);
            });*/
            //低版本兼容
            lary.option.racks.forEach(function(element){
                lary.createCabinet(element);
            });
        };

        lary.getRackPosition = function(index) {
            if (index === 1) {
                return BABYLON.Vector3(0, 0, 0);
            }
        };

        lary.createCabinet = function(rackInfo) {
            //如果cabinet已经创建则不删除，只更新或隐藏模型对象。cabinetShapes
            //根据index创建对象，可能多个复合来进行控制显示隐藏。    
            var cabinetMaterial = new BABYLON.StandardMaterial("cabinetBasicMaterial", lary.scene);
            //var cabinetTexture =  new BABYLON.CubeTexture('/rackbox/side', lary.scene);
            var cabinetTexture = new BABYLON.Texture("../../../img/diagram/mdc_rack.jpg", lary.scene);
            cabinetTexture.backFaceCulling = false;
            cabinetMaterial.diffuseTexture = cabinetTexture;
            //cabinetTexture.emissiveTexture = cabinetTexture;
            //cabinetTexture.specularTexture = cabinetTexture;
            //cabinetMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
            //cabinetTexture.disableLighting = true;

            function create2DLabel(mesh, txt, manager) {
                var label = new BABYLON.GUI.Rectangle("label for " + txt);
                label.background = "#363636";
                label.height = "30px";
                label.alpha = 0.8;
                label.width = "30px";
                label.cornerRadius = 5;
                label.thickness = 2;
                lary.advancedTexture.addControl(label);
                label.linkWithMesh(mesh);
                var text1 = new BABYLON.GUI.TextBlock();
                text1.text = txt;
                text1.color = "white";
                text1.fontSize = "12";
                label.addControl(text1);
                label.linkOffsetY = -100;
                label.position.z = 300;
                return label;
            }

            function create3DTitle(position, txt, rotationY) {
                var button = new BABYLON.GUI.HolographicButton(txt);
                lary.manager.addControl(button);
                var text1 = new BABYLON.GUI.TextBlock();
                text1.text = txt;
                text1.color = "lightgreen";
                text1.fontSize = 88;
                button.content = text1;
                button.scaling = new BABYLON.Vector3(40, 20, 30);
                // button.text = "rotate";
                // button.imageUrl = "./textures/down.png";
                // button.onPointerUpObservable.add(function(){
                //     donut.rotation.x -= 0.05;
                // });
                button.position.x = position.x;
                button.position.y = position.y;
                button.position.z = position.z;
                button.mesh.rotation.y = rotationY;
                return button;
            }

            if (rackInfo.index <= 15) {
                //var box = BABYLON.MeshBuilder.CreateBox("cabinet" + rackInfo.index, { height: 200, width: 60, depth: 100 }, lary.scene);

                var pos = new BABYLON.Vector3(-512 + 64 * rackInfo.index, 0, -10);
                var box = lary.createCabinetBox("cabinet" + rackInfo.index, rackInfo.face, pos);

                //box.position.x = -512 + 64 * rackInfo.index;
                //box.position.z = -10;
                //box.material = cabinetMaterial;
                var pos = {};
                pos.x = -512 + 64 * rackInfo.index;
                pos.y = 130;
                pos.z = 40;

                var title = create3DTitle(pos, rackInfo.name, 3.141592);
                var capBox = BABYLON.MeshBuilder.CreateBox("cabinetCap" + rackInfo.index, { height: 200, width: 60, depth: 100 }, lary.scene);
                capBox.position = box.position;
                capBox.material = new BABYLON.StandardMaterial("myMaterial" + rackInfo.index, lary.scene);
                capBox.material.diffuseColor = new BABYLON.Color3.Teal();
                capBox.isVisible = false;

                var shape = { index: rackInfo.index, rackInfo: rackInfo, defaultMesh: box, title3D: title, capacityMesh: capBox };
                lary.cabinetShapes.push(shape);
            }

            if (rackInfo.index > 15) {
                var pos = new BABYLON.Vector3(-512 + 64 * (rackInfo.index - 15), -0, -230);
                var box = lary.createCabinetBox("cabinet" + rackInfo.index, rackInfo.face, pos);

                // var box = BABYLON.MeshBuilder.CreateBox("cabinet" + rackInfo.index, { height: 200, width: 60, depth: 100 }, lary.scene);
                // box.position.x = -512 + 64 * (rackInfo.index - 15);
                // box.position.z = -230
                //     //box.position.y = -0.1
                // box.material = cabinetMaterial;

                var pos = {};
                pos.x = -512 + 64 * (rackInfo.index - 15);
                pos.y = 130;
                pos.z = -280;

                var title = create3DTitle(pos, rackInfo.name, 0);

                var capBox = BABYLON.MeshBuilder.CreateBox("cabinetCap" + rackInfo.index, { height: 200, width: 60, depth: 100 }, lary.scene);
                capBox.position = box.position;
                capBox.material = new BABYLON.StandardMaterial("myMaterial" + rackInfo.index, lary.scene);
                capBox.material.diffuseColor = new BABYLON.Color3.Teal();
                capBox.isVisible = false;

                var shape = { index: rackInfo.index, rackInfo: rackInfo, defaultMesh: box, title3D: title, capacityMesh: capBox };

                lary.cabinetShapes.push(shape);
            }
        };

        lary.createCabinetBox = function(name, face, position) {
            var box = BABYLON.MeshBuilder.CreateBox(name, { height: 200, width: 60, depth: 100 }, lary.scene);
            box.showBoundingBox = false;

            var f = null;
            var ba = null;
            if (face === "default") {
                f = lary.materialDefaultCabinet;
                ba = lary.materialDefaultCabinet;
            } else if (face === "side") {
                f = lary.materialSideCabinet;
                ba = lary.materialSideCabinet;
            }

            //var ba = lary.materialSideCabinet;
            var l = lary.materialSideCabinet;
            var r = lary.materialSideCabinet;
            var t = lary.materialSideCabinet;
            var bo = lary.materialSideCabinet;
            // var f = new BABYLON.StandardMaterial("material0" + name, lary.scene);
            // f.diffuseColor = new BABYLON.Color3(0.75, 0, 0);
            // f.diffuseTexture=new BABYLON.Texture("nugget.png",scene);
            // var ba = new BABYLON.StandardMaterial("material1" + name, lary.scene);
            // ba.diffuseColor = new BABYLON.Color3(0, 0, 0.75);
            // var l = new BABYLON.StandardMaterial("material2" + name, lary.scene);
            // l.diffuseColor = new BABYLON.Color3(0, 0.75, 0.75);
            // var r = new BABYLON.StandardMaterial("material3" + name, lary.scene);
            // r.diffuseColor = new BABYLON.Color3(0, 0, 0.75);
            // var t = new BABYLON.StandardMaterial("material4" + name, lary.scene);
            // t.diffuseColor = new BABYLON.Color3(0, 0.75, 0);
            // var bo = new BABYLON.StandardMaterial("material5" + name, lary.scene);
            // bo.diffuseColor = new BABYLON.Color3(1, 1, 0);
            //put into one
            var multi = new BABYLON.MultiMaterial("nuggetman" + name, lary.scene);
            multi.subMaterials.push(f);
            multi.subMaterials.push(ba);
            multi.subMaterials.push(l);
            multi.subMaterials.push(r);
            multi.subMaterials.push(t);
            multi.subMaterials.push(bo);
            //apply material
            box.subMeshes = [];
            var verticesCount = box.getTotalVertices();
            box.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, box));
            box.subMeshes.push(new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, box));
            box.subMeshes.push(new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, box));
            box.subMeshes.push(new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, box));
            box.subMeshes.push(new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, box));
            box.subMeshes.push(new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, box));
            box.material = multi;
            box.position = position;
            return box;
        };

        //数据刷新
        lary.refresh = function(data) {
            /*data.racks.forEach((item) => {
                var foundCabinet = lary.cabinetShapes.find((shape, index) => {
                    return shape.index === item.index;
                })

                if (foundCabinet) {
                    try {
                        changeAlarmColor(item.state, foundCabinet);
                        changeCapacity(item.state, foundCabinet);
                    } catch (error) {
                        console.error(error);
                    }
                }

            });*/
            //低版本兼容，，，
            data.racks.forEach(function(item){
                var foundCabinet = undefined;
                lary.cabinetShapes.forEach(function(shape){
                    if(shape.index === item.index)
                        foundCabinet = shape;
                });

                if (foundCabinet) {
                    try {
                        changeAlarmColor(item.state, foundCabinet);
                        changeCapacity(item.state, foundCabinet);
                    } catch (error) {
                        console.error(error);
                    }
                }
            });

            function changeCapacity(state, shape) {
                //restore to default capcaity
                //refresh capacity
                shape.capacityMesh.isVisible = false;
                shape.defaultMesh.isVisible = true;
                shape.capacityMesh.scaling.y = 1;
                shape.capacityMesh.position.y = 0;

                if (state == "capacity") {
                    shape.defaultMesh.isVisible = false;
                    shape.capacityMesh.isVisible = true;
                    shape.capacityMesh.scaling.y = shape.rackInfo.percent / 100;
                    shape.capacityMesh.position.y = -200 * (1 - shape.rackInfo.percent / 100) / 2 + 1;
                }

            };

            function changeAlarmColor(state, shape) {
                lary.highlightLayer.removeMesh(shape.defaultMesh);
                if (state == "alarm") {
                    shape.defaultMesh.isVisible = true;
                    switch (shape.rackInfo.level) {
                        case 1:
                            lary.highlightLayer.addMesh(shape.defaultMesh, BABYLON.Color3.Red());
                            break;
                        case 2:
                            lary.highlightLayer.addMesh(shape.defaultMesh, BABYLON.Color3.FromHexString("#FF7F50"));
                            break;
                        case 3:
                            lary.highlightLayer.addMesh(shape.defaultMesh, BABYLON.Color3.Yellow());
                            break;
                        case 4:
                            lary.highlightLayer.addMesh(shape.defaultMesh, BABYLON.Color3.Blue());
                            break;
                    }
                }
            }
        };

        //显示MDC的A/B两外侧 sideX='A' or sideX='B' 
        lary.showSide = function(sideX) {
            if (lary.currentSide == null) {
                lary.currentSide = true;
            } else {
                lary.currentSide = !lary.currentSide;
            }

            if (lary.currentSide) {
                lary.scene.beginAnimation(lary.camera, 0, 50, true);
            } else {
                lary.scene.beginAnimation(lary.camera, 50, 0, true);
            }
        };

        //析构
        lary.dispose = function() {};



        //init steps
        lary.init();

        return lary;
    }

};


// /**
//  * 显示Toast
//  * @param text 文本内容
//  * @param type 类型 success error
//  * @param duration 持续时间
//  */
// show: function (text, type, duration) {
//     // 确保上一次的 TimeOut 已被清空
//     if (this.hideTimeOut) {
//         clearTimeout(this.hideTimeOut);
//         this.hideTimeOut = null;
//         // console.error('上一次的 TimeOut 还未走完!');
//         // return;
//     }
//     if (!text) {
//         console.error('text 不能为空!');
//         return;
//     }
//     var domToastWaka = document.getElementById('toastWaka');
//     console.log('domToastWaka', domToastWaka);
//     if (!domToastWaka) {
//         console.error('toastWaka DOM 不存在!');
//         return;
//     }
//     var domIconSuccess = domToastWaka.querySelector('.icon-success');   // 成功图标
//     var domIconError = domToastWaka.querySelector('.icon-error');   // 错误图标
//     var domToastText = domToastWaka.querySelector('.text');   // 文字
//     domToastText.innerHTML = text || '';
//     switch (type) {
//         case 'success':
//             domIconSuccess.style.display = 'inline';
//             domIconError.style.display = 'none';
//             break;
//         case 'error':
//             domIconSuccess.style.display = 'none';
//             domIconError.style.display = 'inline';
//             break;
//         default:
//             domIconSuccess.style.display = 'none';
//             domIconError.style.display = 'none';
//             break;
//     }
//     domToastWaka.style.display = 'block';
//     // 不传的话默认2s
//     var that = this;
//     this.hideTimeOut = setTimeout(function () {
//         domToastWaka.style.display = 'none';
//         that.hideTimeOut = null;    // 置 TimeOut 引用为空
//     }, duration || 2000);
// },
// /**
//  * 隐藏 Toast
//  */
// hide: function () {
//     // 如果 TimeOut 存在
//     if (this.hideTimeOut) {
//         // 清空 TimeOut 引用
//         clearTimeout(this.hideTimeOut);
//         this.hideTimeOut = null;
//     }
//     var domToastWaka = document.getElementById('toastWaka');
//     if (domToastWaka) {
//         domToastWaka.style.display = 'none';
//     }
// }/