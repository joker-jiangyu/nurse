var Arena ={
  create:function(id, config, options){
    var ar = {};

    ///////// function init code here /////////
    ar.init = function(id){

      // public vars
      ar.units = [];
      ar.options = {
        showSky: true,
        dynamicSky: false,
        showShadow: true,
        dynamicShadow: true
      };
      ar.id = id;
      ar.domId = "#" + id;
      ar.cruise = {
        target : new THREE.Vector3(),
        lon: 90,
        lat: 0,
        phi: 0,
        theta : 0
      };
      ar.temp = {};
      ar.shape3Ds = [];
      ar.mouse = new THREE.Vector2();

      function getViewSize(){
        var SCREEN_WIDTH = window.innerWidth - $(ar.domId).offset().left;
        var SCREEN_HEIGHT = window.innerHeight - $(ar.domId).offset().top - 17;

        return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
      }

      function initScene(){
        ar.raycaster = new THREE.Raycaster();
        ar.scene	= new THREE.Scene();
        //ar.scene.overrideMaterial = new THREE.MeshDepthMaterial();
      }

      function initRender(){
        if(Detector.webgl){
          ar.renderer = new THREE.WebGLRenderer({ antialias:true});

          if (ar.options.showShadow){
            ar.renderer.shadowMap.enabled = true;
            ar.renderer.shadowMapSoft = true;
            ar.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          }
          console.info("webGL render is working.");
        }else{
          ar.renderer = new THREE.CanvasRenderer(); //WebGLRenderer
          console.info("canvas render is working. restart brower remote to enable WebGL");
        }

        ar.renderer.sortObjects = false;
        ar.renderer.setClearColor( 0x0086b3 ,1);
        ar.renderer.setPixelRatio( window.devicePixelRatio );
        ar.renderer.setSize(getViewSize().width,getViewSize().height);
      }

      function initCamera(){
        // camera attributes
        var VIEW_ANGLE = 45, ASPECT = getViewSize().width / getViewSize().height,
          NEAR = 10, FAR = 50000;

        ar.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

        ar.camera.position.set(-100, 1600, 1800);
        ar.camera.lookAt(ar.scene.position);
        ar.scene.add(ar.camera);
        //ar.scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
        //ar.scene.fog.color.setHSL( 0.6, 0, 1 );
      }

      function initSky(){
        var texture_placeholder = document.createElement( 'canvas' );
        texture_placeholder.width = 128;
        texture_placeholder.height = 128;

        var context = texture_placeholder.getContext( '2d' );
        context.fillStyle = 'rgb( 200, 200, 200 )';
        context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );

        function loadTexture( path ) {

          var texture = new THREE.Texture( texture_placeholder );
          var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

          var image = new Image();
          image.onload = function () {

            texture.image = this;
            texture.needsUpdate = true;

          };
          image.src = path;

          return material;
        }

        var materials = [
        
         loadTexture('/img/3d/skybox/skybox_02.png'),
         loadTexture('/img/3d/skybox/skybox_04.png'),
         loadTexture('/img/3d/skybox/skybox_05.png'), 
         loadTexture('/img/3d/skybox/skybox_06.png'),
         loadTexture('/img/3d/skybox/skybox_01.png'),
         loadTexture('/img/3d/skybox/skybox_03.png')
        ];

        // var materials = [

        //   loadTexture( '/img/3d/skybox/px.jpg' ), // right
        //   loadTexture( '/img/3d/skybox/nx.jpg' ), // left
        //   loadTexture( '/img/3d/skybox/py.jpg' ), // top
        //   loadTexture( '/img/3d/skybox/ny.jpg' ), // bottom
        //   loadTexture( '/img/3d/skybox/pz.jpg' ), // back
        //   loadTexture( '/img/3d/skybox/nz.jpg' )  // front

        // ];

        var mesh = new THREE.Mesh(
          new THREE.BoxGeometry( 30000, 30000, 30000, 7, 7, 7 ),
          new THREE.MeshFaceMaterial( materials ) );
        mesh.scale.x = - 1;
        ar.scene.add( mesh );
      }

      function initResize(){
        $(window).resize(function (){
          ar.camera.aspect = getViewSize().width / getViewSize().height;
          ar.camera.updateProjectionMatrix();
          ar.renderer.setSize( getViewSize().width, getViewSize().height);
        });
      }

      function initControl(){
        //ar.controls = new THREE.OrbitControls(ar.camera, ar.renderer.domElement);
        ar.controls = new THREE.OrbitControls( ar.camera );
        ar.controls.addEventListener( 'change', ar.render );
        ar.controls.minDistance = 500;
        ar.controls.maxDistance = 5000;
        ar.controls.maxPolarAngle = Math.PI * 0.5;
        //ar.controls.minPolarAngle = Math.PI * 0.1;

        ar.container.style.position = "relative";
        var btnContainer = document.createElement('div');
        btnContainer.id = "btnContainer";
        btnContainer.style.cssText = "position:absolute;left:20px;bottom:20px;margin:10px;";

        var vi = document.createElement('img');
        vi.id = "veilimg";
        vi.style.cssText = "padding:3px;cursor:pointer;";
        vi.src = 'img/3d/veilView-h.png';
        vi.onclick = function(){
          if (this.src.indexOf('img/3d/veilView-h.png') >= 0)
          {
            this.src = 'img/3d/veilView-i.png';
            document.getElementById("overimg").src="img/3d/overview-h.png";
            ar.cartoon('veilview');
          }
        };

        var oi = document.createElement('img');
        oi.id = "overimg";
        oi.style.cssText = "padding:3px;cursor:pointer;";
        oi.src = "img/3d/overview-h.png";
        oi.onclick = function(){
          if (this.src.indexOf('img/3d/overview-h.png') >= 0)
          {
            this.src = 'img/3d/overview-i.png';
            document.getElementById("veilimg").src="img/3d/veilView-h.png";
            ar.cartoon('overview');
          }
        };

        btnContainer.appendChild(vi);
        btnContainer.appendChild(oi);
        ar.container.appendChild(btnContainer);
      }

      function initDebugParts(){
        // axes
        var axes = new THREE.AxisHelper(100);
        ar.scene.add( axes );

        // displays current and past frames per second attained by scene
        ar.stats = new Stats();
        ar.stats.domElement.style.position = 'absolute';
        ar.stats.domElement.style.bottom = '0px';
        ar.stats.domElement.style.zIndex = 100;
        ar.container.appendChild(ar.stats.domElement);

        // Grid
        var size = 800, step = 80;

        var geometry = new THREE.Geometry();

        for (var i = -size; i <= size; i += step) {
          geometry.vertices.push(new THREE.Vector3(-size, 0, i));
          geometry.vertices.push(new THREE.Vector3(size, 0, i));
          geometry.vertices.push(new THREE.Vector3(i, 0, -size));
          geometry.vertices.push(new THREE.Vector3(i, 0, size));
        }

        var material = new THREE.LineBasicMaterial({color: 0xeeeeee, opacity: 0.7});

        var line = new THREE.Line(geometry, material, THREE.LinePieces);
        ar.scene.add(line);

        //ArrowHelper
        var directionV3 = new THREE.Vector3(1, 0, 1);
        var originV3 = new THREE.Vector3(0, 200, 0);
        // 100 is length, 20 and 10 are head length and width
        var arrowHelper = new THREE.ArrowHelper(directionV3, originV3, 100, 0xff0000, 20, 10);
        ar.scene.add(arrowHelper);

        // 3. BoundingBoxHelper
        //bboxHelper = new THREE.BoundingBoxHelper(group, 0x999999);
        //ar.scene.add(bboxHelper);
      }

      function defineMouseBehavior(){
        ar.container.addEventListener( 'mousemove', onDocumentMouseMove, false );
        ar.container.addEventListener( 'mousedown', onDocumentMouseDown, false );
        function onDocumentMouseMove( event ) {
          ar.mouse.x = ( (event.clientX - $(ar.domId).position().left)/ $(ar.domId).width()) * 2 - 1;
          ar.mouse.y = - ( (event.clientY - $(ar.domId).position().top) / $(ar.domId).height()) * 2 + 1;
          event.preventDefault();
        }
        function onDocumentMouseDown( e ) {
          e.preventDefault();
          if (ar.INTERSECTED){
            var shp = ar.getShapeByMesh(ar.INTERSECTED);
            if (shp.config.bindings.length > 0) {
              var devId = shp.config.bindings[0].id;
              ar.options.shell.$location.url('/deviceInfo/' + devId);
              //alert(angular.toJson(shp.config));
            }
          }
        }
      }

      function attachToDom(){
        ar.container = document.getElementById(ar.id);
        ar.container.appendChild(ar.renderer.domElement);

      }

      initScene();
      initRender();
      initCamera();
      attachToDom();
      if (ar.options.showSky) initSky();
      initResize();
      initControl();
      //initDebugParts();
      defineMouseBehavior();
    };

    ar.clear = function(){
      ar.shape3Ds = [];
    };

    ar.load = function(config){
      ar.clear();
      if (config) {
        ar.loadConfig = config;
      }
      else {
        ar.loadConfig = bn.demoConfig;
      }

      ar.loadConfig.shapes.forEach(function (shp) {
        if (shp.param3D) ar.loadUnit(shp.param3D);
      });

      ar.initLight();
    };

    ar.loadUnit = function(param) {
      var ut = _.find(ar.units, function (item) {
        return item.name === param.unit;
      });

      if (_.isUndefined(ut)) return;
      if (_.isUndefined(ut.create)) return;

      var mesh = ut.create(param);
      mesh.unit = ut;

      var shp = _.extend({}, ar.shape3DClass);
      shp.mesh = mesh;
      shp.config = param;
      shp.id = _.uniqueId();

      ar.shape3Ds.push(shp);
      ar.scene.add(mesh);
    };

    ar.animate = function(){
      ar.aniframeId = requestAnimationFrame(ar.animate);
      TWEEN.update();
      ar.render();
      ar.controls.update();
    };

    ar.render = function(){
      if (!ar) return;
      ar.update();
      ar.renderer.render(ar.scene, ar.camera);
    };

    ar.update = function() {
      if (ar.options.dynamicSky){
        ar.cruise.lon += 0.1;

        ar.cruise.lat = Math.max( - 85, Math.min( 85, ar.cruise.lat ) );
        ar.cruise.phi = THREE.Math.degToRad( 90 - ar.cruise.lat );
        ar.cruise.theta = THREE.Math.degToRad( ar.cruise.lon );

        ar.cruise.target.x = 500 * Math.sin( ar.cruise.phi ) * Math.cos( ar.cruise.theta );
        ar.cruise.target.y = 500 * Math.cos( ar.cruise.phi );
        ar.cruise.target.z = 500 * Math.sin( ar.cruise.phi ) * Math.sin( ar.cruise.theta );

        ar.camera.lookAt( ar.cruise.target );
      }

      if (ar.options.dynamicShadow){
        var timer = Date.now() * 0.0001;
        ar.light.position.x = Math.sin(timer) * 1000;
        ar.light.position.z = Math.cos(timer) * 1000;
        ar.light.target.position.set(0, 0, 0);
      }

      ar.shape3Ds.forEach(function(shp){
        if (shp.mesh.unit.isFlat) shp.mesh.lookAt( ar.camera.position );
      });

      // high light mouse indicator
      ar.raycaster.setFromCamera( ar.mouse, ar.camera );
      var intersects = ar.raycaster.intersectObjects( ar.scene.children, true );

      if ( intersects.length > 0 ) {

        if ( ar.INTERSECTED != intersects[ 0 ].object ) {
          if ( ar.INTERSECTED ) ar.util.maskColor(ar.INTERSECTED, ar.INTERSECTED.currentHex);
          ar.INTERSECTED = intersects[ 0 ].object;
          ar.INTERSECTED.currentHex = ar.util.getMaskColor(ar.INTERSECTED);
          ar.util.maskColor(ar.INTERSECTED, 0x223366);
        }

      } else {
        if ( ar.INTERSECTED ) ar.util.maskColor(ar.INTERSECTED, ar.INTERSECTED.currentHex);
        ar.INTERSECTED = null;
      }
    };

    ar.getUnit = function(name){
      return _.find(ar.units, function (unit) {
        return unit.name === name;
      });
    };

    ar.initLight = function () {
      //泛光可调整整个房间的明暗度
      //var ambient = new THREE.AmbientLight( 0x888888);
      //ar.scene.add( ambient );

      //半球面环境光，模拟天空到大地的光线，可作为主环境光
      var envlight = new THREE.HemisphereLight( 0xffffff, 0xA2C9ED, 0.8);
      //var envlight = new THREE.HemisphereLight( 0x888888, 0x111111, 0.8);
      //envlight.position.set( 0, 1500, 0 );

      //envlight.shadowCameraFov = 60;
      ar.scene.add(envlight);

      // 5000 is sphere size, 3000 is arrow length
      //var hlightHelper = new THREE.HemisphereLightHelper(envlight, 10000, 1000);
      //ar.scene.add(hlightHelper);

      //平行光，用于产生阴影
      var light = new THREE.DirectionalLight(0x222222);
      light.position.set(0, 1000, 2000);
      light.target.position.set(0, 0, 0);


      light.castShadow = true;
      light.shadowDarkness = 0.7;
      //light.shadowCameraNear = 2;
      //light.shadowCameraFar = 5000;
      light.shadowCameraLeft = -3000;
      light.shadowCameraRight = 3000;
      light.shadowCameraTop = 3000;
      light.shadowCameraBottom = -3000;
      //light.shadowCameraFov = 60000;
      light.shadowMapWidth = light.shadowMapHeight = 1024;

      ar.scene.add(light);
      ar.light = light;

      //ar.camera.updateMatrix();
      //var cameraHelper = new THREE.CameraHelper( light.shadow );
      //this.scene.add(cameraHelper);

      //// 50 is helper size
      //dlightHelper = new THREE.DirectionalLightHelper(light, 500);
      //ar.scene.add(dlightHelper);

    };

    ar.dispose = function(){

      var disposeObject = function(obj){
        for(var b in obj){
          if(typeof(obj[b]) === "function" && obj[b].name === "event"){
            obj[b] = undefined;
          }
          else if(typeof(obj[b]) === "function" && obj[b].length > 0){
            disposeObject(obj[b]);
          }
          else if(typeof(obj[b]) === "object" && b === "dispatch"){
            disposeObject(obj[b]);
          }
        }
      };

      var disposeNode = function(node)
      {
        if (node instanceof THREE.Camera)
        {
          node = undefined;
        }
        else if (node instanceof THREE.Light)
        {
          if (!node.dispose){
            disposeObject(node);
          }
          else
            node.dispose ();
          node = undefined;
        }
        else if (node instanceof THREE.Mesh)
        {
          if (node.geometry)
          {
            node.geometry.dispose ();
            node.geometry = undefined;
            delete node.geometry;
          }

          if (node.material)
          {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
              $.each (node.material.materials, function (idx, mtrl)
              {
                if (!mtrl) return;
                mtrl.dispose();
                if (mtrl.map)           
                  {
                    mtrl.map.dispose();
                    mtrl.map = undefined;
                    delete mtrl.map;
                  }

                if (mtrl.lightMap)      mtrl.lightMap.dispose();
                if (mtrl.bumpMap)       mtrl.bumpMap.dispose();
                if (mtrl.normalMap)     mtrl.normalMap.dispose();
                if (mtrl.specularMap)   mtrl.specularMap.dispose();
                if (mtrl.envMap)        mtrl.envMap.dispose();

                mtrl.dispose();    // disposes any programs associated with the material
                mtrl = undefined;
                delete mtrl;
              });
            }
            else
            {
              if (node.material.map)          
              {
                node.material.map.dispose();
                node.material.map = undefined;
                delete node.material.map;
              }

              if (node.material.lightMap)     node.material.lightMap.dispose ();
              if (node.material.bumpMap)      node.material.bumpMap.dispose ();
              if (node.material.normalMap)    node.material.normalMap.dispose ();
              if (node.material.specularMap)  node.material.specularMap.dispose ();
              if (node.material.envMap)       node.material.envMap.dispose ();

              node.material.dispose ();   // disposes any programs associated with the material
              node.material = undefined;
              delete node.material;
            }
          }

          node = undefined;
        }
        else if (node instanceof THREE.Object3D)
        {
          node = undefined;
          delete node;
        }
      };

      var disposeHierarchy = function(node, callback)
      {
        for (var i = node.children.length - 1; i >= 0; i--)
        {
          var child = node.children[i];
          disposeHierarchy (child, callback);
          callback (child);
        }
      };

      //stop data pooling
      if (ar.provider) ar.provider.dispose();
      //remove event for controller
      $(window).off();
      $(window).unbind();
      $(document).off();
      $(document).unbind();
      $(ar.domId).off();
      $(ar.domId).unbind();
      if (ar.renderer) $(ar.renderer.domElement).off();

      //stop animation
      TWEEN.removeAll();
      if (ar.aniframeId) window.cancelAnimationFrame(ar.aniframeId);
      //remove shapes
      // if (ar.shape3Ds){
      //   ar.shape3Ds.forEach(function(shp){
      //     if (shp.mesh){
      //       ar.scene.remove(shp.mesh);
      //       disposeHierarchy(shp.mesh, disposeNode);
      //     }
      //   });
      //   disposeObject(ar.shape3Ds);
      //   ar.shape3Ds = undefined;
      //   delete ar.shape3Ds;
      // }

      //remove scene
      if (ar.controls) ar.controls.dispose();
      if (ar.raycaster) disposeObject(ar.raycaster);
      // $.each(ar.scene.children, function(idx, obj) {
      //           if (obj !== undefined) {
      //               if (obj.geometry) {
      //                   obj.geometry.dispose();
      //               }

      //               if (obj.material) {
      //                   if (obj.material instanceof THREE.MeshFaceMaterial) {
      //                       $.each(obj.material.materials, function(idx, obj) {
      //                           obj.dispose();
      //                       });
      //                   } else {
      //                       obj.material.dispose();
      //                   }
      //               }

      //               if (obj.dispose) {
      //                   obj.dispose();
      //               }
      //           }
      //       }); 

      //clear all resource

      if (ar.camera) disposeObject(ar.camera);
      //if (ar.scene) disposeHierarchy (ar.scene, disposeNode);
      if (ar.container) disposeObject(ar.container);      
      
      if (ar.renderer) 
        {
          ar.renderer.forceContextLoss();
          ar.renderer.context = null;
          ar.renderer.domElement = null;          
          disposeObject(ar.renderer);
          ar.renderer = null;
        }
        

      doDispose(ar.scene);

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
              $.each(obj.material.materials, function(idx, o) {
                if (!o) return;
                if (o.map)          
                {
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
          if(obj.dispose) {
            obj.dispose();
          }
        }
        obj = undefined;
      }

      ar.scene = null;

      disposeObject(ar);
      ar = undefined;
    };

    ar.cartoon = function(type){
      if (type == "overview"){
        var position = {x:0,y:3000,z:0};
        var target = {x:0,y:0,z:-1};
        ar.tweenCamera(position, target);
      }

      if (type == "veilview"){
        var position = {x:-3000,y:3000,z:-3000};
        var target = {x:0,y:0,z:0};
        ar.tweenCamera(position, target);
      }
    };

    ar.tweenCamera = function tweenCamera(position, target){
      //TWEEN.removeAll();

      new TWEEN.Tween(ar.camera.position).to({
        x: position.x,
        y: position.y,
        z: position.z
      },3000).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
        ar.camera.lookAt(target);
      }).onComplete(function () {
      }).start();
    };

    ar.getShapeByMesh = function (mesh){
      if (!mesh) return;

      var obj = mesh;
      while(!(obj.parent instanceof THREE.Scene)){
        obj = obj.parent;
      }

      var selected;
      ar.shape3Ds.forEach(function(shp){
        if (shp.mesh === obj){
          selected = shp;
        }
      });

      return selected;
    };

    ar.loadUnits = function(){
      ar.units = [
        {
          name : "floor",
          buildFloor: function(param){
            //因为SVG无法使用底图（只能使用UV贴图），作为地板非常难看。
            //这里取消平面自动地板生成功能（可生成不规则地板）限制为仅能使用矩形地板（使用BOX模拟）
            //所以下面代码注释掉：
            //var floorG = ar.transformSVGPath(param.path);
            //var planeMesh = ar.createShape(floorG, 0xdddddd, 0, 0, 0, Math.PI/2, 0, 0, 1);
            //group.add(planeMesh);
            //planeMesh.geometry.center();

            var tileSize = 64;

            var floorTexture = new THREE.TextureLoader().load(param.floorTexture);
            floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
            floorTexture.repeat.set( param.floorWidth / tileSize, param.floorHeight / tileSize );

            var floorMaterial = new THREE.MeshPhongMaterial( {
              map: floorTexture, side: THREE.DoubleSide} );

            var floorGeometry = new THREE.PlaneGeometry(param.floorWidth, param.floorHeight,1,1);
            var floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = -0.5;
            floor.rotation.x = Math.PI / 2;

            floor.receiveShadow = true;
            return floor;
          },
          create: function (param){
            //create an empty container
            var group = new THREE.Object3D();

            var floor = this.buildFloor(param);
            group.add(floor);

            //get enclosure lines


            var lines = [];

            var lineX1 = {};
            lineX1.start = {x: -(param.floorWidth / 2), y:0, z: -(param.floorHeight / 2)};
            lineX1.end = {x: param.floorWidth / 2, y:0, z: -(param.floorHeight / 2)};
            lines.push(lineX1);

            var lineX2 = {};
            lineX2.start = {x: -(param.floorWidth / 2), y:0, z: param.floorHeight / 2};
            lineX2.end = {x: param.floorWidth / 2, y:0, z: param.floorHeight / 2};
            lines.push(lineX2);

            var lineX3 = {};
            lineX3.start = {x: -(param.floorWidth / 2), y:0, z: -(param.floorHeight / 2)};
            lineX3.end = {x: -(param.floorWidth / 2), y:0, z: param.floorHeight / 2};
            lines.push(lineX3);

            var lineX4 = {};
            lineX4.start = {x: param.floorWidth / 2, y:0, z: -(param.floorHeight / 2)};
            lineX4.end = {x: param.floorWidth / 2, y:0, z: param.floorHeight / 2};
            lines.push(lineX4);

            //build walls
            lines.forEach(function(line){
              var mold = ar.util.getMold(param.moldId);
              group.add(ar.util.buildWall(mold, line));
            });

            return group;
          }
        },{
          name : "door",
          create: function (param) {

            return ar.util.buildWallPart(param);
          }
          //},{
          //  name : "window",
          //  create: function (param) {
          //    return ar.util.buildWallPart(param);
          //  }
        },{
          name:"rack",
          create: function(param){

            var mold = ar.util.getMold(param.moldId);

            var faces = [];
            // order of faces: x+,x-,y+,y-,z+,z-
            var rightFace = ar.util.newFace(mold.faces.rightFace);
            faces.push(rightFace);
            var leftFace = ar.util.newFace(mold.faces.leftFace);
            faces.push(leftFace);
            var topFace = ar.util.newFace(mold.faces.topFace);
            faces.push(topFace);
            var bottomFace = ar.util.newFace(mold.faces.bottomFace);
            faces.push(bottomFace);
            var frontFace = ar.util.newFace(mold.faces.frontFace);
            faces.push(frontFace);
            var backFace = ar.util.newFace(mold.faces.backFace);
            faces.push(backFace);

            var cubeMaterials = new THREE.MeshFaceMaterial(faces);
            var cubeGeometry = new THREE.CubeGeometry(
              mold.size.width, mold.size.high, mold.size.depth);

            var cube = new THREE.Mesh(cubeGeometry, cubeMaterials);

            cube.position.x = param.position.x;
            cube.position.y = mold.size.high / 2 + param.aboveGround;
            cube.position.z = param.position.z;

            //if (param.angle > 0 )
              cube.rotateY( 0 - ar.util.radians(param.angle));
            cube.castShadow = true;
            return cube;
          }
        },{
          name:"line",
          create: function(param){

            var geometry = new THREE.Geometry();
            param.lines.forEach(function(line){
              geometry.vertices.push(new THREE.Vector3(
                line.start.x,
                line.start.y,
                line.start.z
              ));
              geometry.vertices.push(new THREE.Vector3(
                line.end.x,
                line.end.y,
                line.end.z
              ));
            });

            var m = new THREE.LineBasicMaterial({
              color: param.color,fog:true});

            var line = new THREE.Line(geometry, m);

            return line;
          }
        },{
          name:"flat",
          isFlat:true,
          create: function(param){
            var mold = ar.util.getMold(param.moldId);

            var obj = ar.util.flatObject(param, mold,param.position, parseFloat(param.aboveGround));

            return obj.mesh;
          }
        },{
          name:"wallPath",
          create: function(param){
            var group = new THREE.Object3D();
            var mold = ar.util.getMold(param.moldId);
            if (param.moldId !== "wallpath-null") 
            {
              param.lines.forEach(function(line){
                group.add(ar.util.buildWall(mold, line));
              });
            }

            //if (param.angle > 0 )
              group.rotateY( 0 - ar.util.radians(param.angle));
            return group;
          }
        },{
          name:"camera",
          create: function(param){
            //var transparentColor = 0xffffff;
            //var size = {x:64,y:64};
            //var imgurl = "img/3d/CCTV-icon.png";
            //
            //var obj = ar.util.flatObject(imgurl, transparentColor,
            //  size,param.position);
            //
            //return obj.mesh;

            var geometry = new THREE.SphereGeometry( 30, 16, 16 );
            var material = new THREE.MeshBasicMaterial( {
              map: THREE.ImageUtils.loadTexture('img/3d/global.jpg')});
            var sphere = new THREE.Mesh( geometry, material );
            sphere.position.x = param.position.x;
            sphere.position.y = param.position.y;
            sphere.position.z = param.position.z;
            return sphere;
          }
        }
      ];
    };

    ar.shape3DClass = {
      mesh: undefined,
      tws:[],
      defaultColors:[],
      update:function(status){
        if (status.state === this.alarmLevel) return;

        this.alarmLevel = status.state;

        var needRemove=null;

        this.tws.forEach(function(fso){
          if (fso.id === this.id)
          {
            fso.twarray.forEach(function(tw){
              tw.stop();  
            });
            needRemove = fso;
          }
        });
        this.tws = _.without(this.tws, needRemove);

        this.resetColor();

        if (this.alarmLevel == 0) return;
        this.shining(this.alarmLevel);
      },
      resetColor:function(){
        var that = this;
        if (that.mesh.material instanceof THREE.MultiMaterial)
        {
          var i=0;
          that.mesh.material.materials.forEach(
            function(m) {
              m.color = {r:1,g:1,b:1};
          });
        }
      },
      shining: function(alarmLevel){
        var that = this;
        var color = {r:1,g:1,b:1};
        switch(alarmLevel)
        {
          case "1":
            color={r:0,g:0,b:2};
            break;
          case "2":
            color={r:2,g:2,b:0};
            break;
          case "3":
            color={r:2, g: 1, b:0};
            break;
          case "4":
            color={r:2, g: 0, b:0};
            break;
          default:
        }

        if (that.mesh.material instanceof THREE.MultiMaterial)
        {
          var kso = {id:that.id,twarray:[]};
          that.mesh.material.materials.forEach(function(m){
            var tw = new TWEEN.Tween(m.color)
              .to(color, 3000)
              .repeat(Infinity)
              .easing(TWEEN.Easing.Quartic.InOut)
              .start();

            kso.twarray.push(tw);
          
          });
          that.tws.push(kso);
        }
      }
    };

    ar.util = {};
    ar.util.createShape = function ( shape, color, x, y, z, rx, ry, rz, s ) {
      // flat shape like svg

      var geometry = new THREE.ShapeGeometry( shape );
      var material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        overdraw: true
      });

      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.set( x, y, z );
      mesh.rotation.set( rx, ry, rz );
      mesh.scale.set( s, s, s );

      return mesh;
    };

    ar.util.transformSVGPath = function (pathStr) {

      const DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46,
        MINUS = 45;

      var path = new THREE.Shape();

      var idx = 1, len = pathStr.length, activeCmd,
        x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
        x1 = 0, x2 = 0, y1 = 0, y2 = 0,
        rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;

      function eatNum() {
        var sidx, c, isFloat = false, s;
        // eat delims
        while (idx < len) {
          c = pathStr.charCodeAt(idx);
          if (c !== COMMA && c !== SPACE)
            break;
          idx++;
        }
        if (c === MINUS)
          sidx = idx++;
        else
          sidx = idx;
        // eat number
        while (idx < len) {
          c = pathStr.charCodeAt(idx);
          if (DIGIT_0 <= c && c <= DIGIT_9) {
            idx++;
            continue;
          }
          else if (c === PERIOD) {
            idx++;
            isFloat = true;
            continue;
          }

          s = pathStr.substring(sidx, idx);
          return isFloat ? parseFloat(s) : parseInt(s);
        }

        s = pathStr.substring(sidx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }

      function nextIsNum() {
        var c;
        // do permanently eat any delims...
        while (idx < len) {
          c = pathStr.charCodeAt(idx);
          if (c !== COMMA && c !== SPACE)
            break;
          idx++;
        }
        c = pathStr.charCodeAt(idx);
        return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
      }

      var canRepeat;
      activeCmd = pathStr[0];
      while (idx <= len) {
        canRepeat = true;
        switch (activeCmd) {
          // moveto commands, become lineto's if repeated
          case 'M':
            x = eatNum();
            y = eatNum();
            path.moveTo(x, y);
            activeCmd = 'L';
            break;
          case 'm':
            x += eatNum();
            y += eatNum();
            path.moveTo(x, y);
            activeCmd = 'l';
            break;
          case 'Z':
          case 'z':
            canRepeat = false;
            if (x !== firstX || y !== firstY)
              path.lineTo(firstX, firstY);
            break;
          // - lines!
          case 'L':
          case 'H':
          case 'V':
            nx = (activeCmd === 'V') ? x : eatNum();
            ny = (activeCmd === 'H') ? y : eatNum();
            path.lineTo(nx, ny);
            x = nx;
            y = ny;
            break;
          case 'l':
          case 'h':
          case 'v':
            nx = (activeCmd === 'v') ? x : (x + eatNum());
            ny = (activeCmd === 'h') ? y : (y + eatNum());
            path.lineTo(nx, ny);
            x = nx;
            y = ny;
            break;
          // - cubic bezier
          case 'C':
            x1 = eatNum(); y1 = eatNum();
          case 'S':
            if (activeCmd === 'S') {
              x1 = 2 * x - x2; y1 = 2 * y - y2;
            }
            x2 = eatNum();
            y2 = eatNum();
            nx = eatNum();
            ny = eatNum();
            path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
            x = nx; y = ny;
            break;
          case 'c':
            x1 = x + eatNum();
            y1 = y + eatNum();
          case 's':
            if (activeCmd === 's') {
              x1 = 2 * x - x2;
              y1 = 2 * y - y2;
            }
            x2 = x + eatNum();
            y2 = y + eatNum();
            nx = x + eatNum();
            ny = y + eatNum();
            path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
            x = nx; y = ny;
            break;
          // - quadratic bezier
          case 'Q':
            x1 = eatNum(); y1 = eatNum();
          case 'T':
            if (activeCmd === 'T') {
              x1 = 2 * x - x1;
              y1 = 2 * y - y1;
            }
            nx = eatNum();
            ny = eatNum();
            path.quadraticCurveTo(x1, y1, nx, ny);
            x = nx;
            y = ny;
            break;
          case 'q':
            x1 = x + eatNum();
            y1 = y + eatNum();
          case 't':
            if (activeCmd === 't') {
              x1 = 2 * x - x1;
              y1 = 2 * y - y1;
            }
            nx = x + eatNum();
            ny = y + eatNum();
            path.quadraticCurveTo(x1, y1, nx, ny);
            x = nx; y = ny;
            break;
          // - elliptical arc
          case 'A':
            rx = eatNum();
            ry = eatNum();
            xar = eatNum() * DEGS_TO_RADS;
            laf = eatNum();
            sf = eatNum();
            nx = eatNum();
            ny = eatNum();
            if (rx !== ry) {
              console.warn("Forcing elliptical arc to be a circular one :(",
                rx, ry);
            }
            // SVG implementation notes does all the math for us! woo!
            // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
            // step1, using x1 as x1'
            x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
            y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
            // step 2, using x2 as cx'
            var norm = Math.sqrt(
              (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
              (rx*rx * y1*y1 + ry*ry * x1*x1));
            if (laf === sf)
              norm = -norm;
            x2 = norm * rx * y1 / ry;
            y2 = norm * -ry * x1 / rx;
            // step 3
            cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
            cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;

            var u = new THREE.Vector2(1, 0),
              v = new THREE.Vector2((x1 - x2) / rx,
                (y1 - y2) / ry);
            var startAng = Math.acos(u.dot(v) / u.length() / v.length());
            if (u.x * v.y - u.y * v.x < 0)
              startAng = -startAng;

            // we can reuse 'v' from start angle as our 'u' for delta angle
            u.x = (-x1 - x2) / rx;
            u.y = (-y1 - y2) / ry;

            var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
            // This normalization ends up making our curves fail to triangulate...
            if (v.x * u.y - v.y * u.x < 0)
              deltaAng = -deltaAng;
            if (!sf && deltaAng > 0)
              deltaAng -= Math.PI * 2;
            if (sf && deltaAng < 0)
              deltaAng += Math.PI * 2;

            path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
            x = nx;
            y = ny;
            break;
          default:
            throw new Error("weird path command: " + activeCmd);
        }
        if (firstX === null) {
          firstX = x;
          firstY = y;
        }
        // just reissue the command
        if (canRepeat && nextIsNum())
          continue;
        activeCmd = pathStr[idx++];
      }

      return path;
    };

    ar.util.gradientTexture = function (){
      function generateMeterial() {

        var size = 512;

        // create canvas
        var canvas = document.createElement( 'canvas' );
        canvas.width = size;
        canvas.height = size;

        // get context
        var context = canvas.getContext( '2d' );

        // draw gradient
        context.rect( 0, 0, size, size );
        var gradient = context.createLinearGradient( 0, 0, 0, size );
        gradient.addColorStop(0, '#99ddff'); // light blue
        gradient.addColorStop(1, 'transparent'); // dark blue
        context.fillStyle = gradient;
        context.fill();

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;
        var material = new THREE.MeshBasicMaterial( {
          map: texture, transparent: true } );

        return material;
      }

      return generateMeterial();

    };

    ar.util.flatObject = function(param, mold, position,aboveGround){

      var material = ar.util.newFace(mold.face);

      var geometry = new THREE.PlaneGeometry( mold.size.width, mold.size.high, 1, 1 );

      var flat = new THREE.Mesh(geometry, material);

      flat.position.x = position.x;
      flat.position.y = mold.size.high / 2  + aboveGround;
      flat.position.z = position.z;

      var shp = _.extend({}, ar.shape3DClass);
      shp.mesh = flat;
      shp.isFlat = true;
      shp.id = _.uniqueId();
      ar.shape3Ds.push(shp);

      shp.config = param;

      return shp;
    };

    ar.util.buildWall = function(mold, segment){

      function updateLine(segment){
        if (segment.start.x === segment.end.x){
          segment.length = Math.abs(segment.end.z - segment.start.z);
          segment.direct = "Z";
        }
        if (segment.start.z === segment.end.z){
          segment.length = Math.abs(segment.end.x - segment.start.x);
          segment.direct = "X";
        }
        return segment;
      }

      var line = updateLine(segment);

      var sideMaterial = ar.util.newFace(mold.faces.sideFace,line.length);
      var wallMaterial = sideMaterial;
      var topMaterial = ar.util.newFace(mold.faces.topFace, line.length);

      var xlen,ylen,zlen,xm,ym,zm,px,py,pz;

      ylen = mold.size.high;
      py = ylen/2;

      if (line.direct === "X")
      {
        xlen = line.length + mold.size.width - 0.1;
        zlen = mold.size.width;
        zm = wallMaterial;
        ym = topMaterial;
        xm = sideMaterial;
        if (line.start.x < line.end.x)
          px = line.length/ 2 + line.start.x;
        if (line.start.x > line.end.x)
          px = line.start.x - line.length/2;
        pz = line.start.z;
      }

      if (line.direct === "Z")
      {
        zlen = line.length + mold.size.width / 2 - 0.1;
        xlen = mold.size.width;
        xm = wallMaterial;
        zm = sideMaterial;
        ym = topMaterial;
        if (line.start.z > line.end.z)
          pz = line.start.z - line.length / 2;
        if (line.start.z < line.end.z)
          pz = line.length /2 + line.start.z;
        px = line.start.x;
      }

      var wall = new THREE.Mesh(new THREE.CubeGeometry(xlen,ylen,zlen),
        new THREE.MeshFaceMaterial(
          [
            xm, // +x
            xm, // -x
            ym, // +y
            ym, // -y
            zm, // +z
            zm // -z
          ]));

      wall.position.x = px;
      wall.position.y = py;
      wall.position.z = pz;
      wall.castShadow = true;
      wall.receiveShadow = true;
      return wall;
    };

    ar.util.buildWallPart = function(param){
      var mold = ar.util.getMold(param.moldId);

      //var doorMaterial = ar.util.newFace(mold.faces.topFace);
      var frontMaterial = ar.util.newFace(mold.faces.frontFace);
      var backMaterial = ar.util.newFace(mold.faces.backFace);

      var sideMaterial = ar.util.newFace(mold.faces.sideFace);

      var xlen,ylen,zlen,xm1,xm2,ym1,ym2,zm1,zm2,px,py,pz;

      ylen = mold.size.high;
      py = mold.size.high /2 + param.position.y;

      if (param.direct === "X")
      {
        xlen = mold.size.width;
        zlen = mold.size.depth;
        zm1 = frontMaterial;
        zm2 = backMaterial;
        ym1 = sideMaterial;
        ym2 = sideMaterial;
        xm1 = sideMaterial;
        xm2 = sideMaterial;
        px = param.position.x;
        pz = param.position.z;
      }

      if (param.direct === "Z")
      {
        zlen = mold.size.width;
        xlen = mold.size.depth;
        xm1 = frontMaterial;
        xm2 = backMaterial;
        zm1 = sideMaterial;
        zm2 = sideMaterial;
        ym1 = sideMaterial;
        ym2 = sideMaterial;
        pz = param.position.z;
        px = param.position.x;
      }

      var door = new THREE.Mesh(new THREE.CubeGeometry(xlen,ylen,zlen),
        new THREE.MeshFaceMaterial(
          [
            xm1, // +x
            xm2, // -x
            ym1, // +y
            ym2, // -y
            zm1, // +z
            zm2 // -z
          ]));

      door.position.x = px;
      door.position.y = py;
      door.position.z = pz;

      return door;
    };

    ar.util.getMold = function(id){
      var res;
      molds.forEach(function(m){
        if (m.id === id) res = m;
      });

      return res;
    };

    ar.util.radians = function(degrees) {
      return degrees * Math.PI / 180;
    };

    ar.util.newFace = function(cfg, faceSize){

      var param = {};

      if (cfg.texture) {
        param.map = new THREE.TextureLoader().load( cfg.texture );

        if (cfg.tileWay){
          param.map.wrapS = param.map.wrapT = THREE.RepeatWrapping;
          var walltileSize = cfg.textureSize;

          if (cfg.tileWay == "H")
            param.map.repeat.set( faceSize / walltileSize, 1);

          if (cfg.tileWay == "T")
            param.map.repeat.set( faceSize / walltileSize, faceSize / walltileSize);

          if (cfg.tileWay == "V")
            param.map.repeat.set(1, faceSize / walltileSize);
        }
      }

      if (cfg.side) param.side = cfg.side;
      if (cfg.color) param.color = new THREE.Color(cfg.color);

      if (cfg.transparent) param.transparent = cfg.transparent;

      var material = new THREE.MeshPhongMaterial(param);

      if (cfg.opacity) {
        material.opacity = cfg.opacity;
      }
      else{
        material.opacity = 1;
      }
      if (material.opacity !== 1) material.depthWrite = false;

      return material;
    };

    ar.util.maskColor = function(mesh, color){
      if (!mesh) return;
      try {
        if (mesh.material instanceof THREE.MeshPhongMaterial)
        {
          mesh.material.emissive.setHex( color );
          //mesh.material.color.setHex( color );
        }

        if (mesh.material instanceof THREE.MultiMaterial)
        {
          mesh.material.materials.forEach(function(m){
            //m.color.setHex( color );
            m.emissive.setHex( color );
          });
        }        
      }
      catch(err) {
          
      }
    };

    ar.util.getMaskColor = function(mesh){
      if (!mesh) return;
      if (mesh.material instanceof THREE.MeshPhongMaterial)
      {
        return mesh.material.emissive.getHex();
      }

      if (mesh.material instanceof THREE.MultiMaterial)
      {
        return mesh.material.materials[0].emissive.getHex();
      }
    };

    ar.provider = {
      collectBinding : function(){
        var res = [];

        ar.shape3Ds.forEach(function(shp){
            if (shp.config.bindings.length > 0)
            {
              var pack = { id:shp.id, bs:shp.config.bindings};
              res.push(pack);
            }
        });

        return res;
      },
      start : function(){
        if (!ar.options.shell) return;

        var bindingSet = this.collectBinding();

        //http ask for result by interval
        this.stop = ar.options.shell.$interval(function() {
            //get data and refresh shapes status
            ar.options.shell.$srv.getData(bindingSet).then(function(data){
              ar.shape3Ds.forEach(function(shp){
                var status = _.find(data, function(item){
                  return item.id === shp.id;               
                });

                if (status) shp.update(status);
              });              
            });
        }, 5000);
      },
      dispose :function(){
        if (!ar.options.shell) return;
        if (this.stop)
          ar.options.shell.$interval.cancel(this.stop);

        ar.options.shell.$srv = undefined;
        ar.options.shell.$interval = undefined;
        ar.options.shell.$location = undefined;
        this.stop = undefined;
      }
    };
    /////////  create main code here  /////////
    ar.init(id);
    ar.loadUnits();
    if (config)
      ar.load(config);
    else
      ar.load();

    if (options)
      ar.options = _.extend(ar.options, options);

    //start 3D time line
    ar.animate();

    ar.provider.start();
    return ar;
  }
};
