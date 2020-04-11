var BasePart = {
	create:function(mdc){
		return {
			id:'partId',
			category:'NA',
			shape:null,
			currentShape:null,
			powerShape:null,
			spaceShape:null,
			states:{
				expanded:false,
				selected:false
			},
			option:{
				expandPosition:{x:0,y:0,z:0}
			},
			dispose:function(mdc){
				mdc.scene.remove(this.shape);				
				if (this.id === "mapA"){
					var svg = this.shape.children[0].children[0].material.map.image;
					//delete this.shape.children[0].children[0].material.map;
				}
				PartManager.disposeShape(this.shape);
				//if (svg) console.log(svg);

				if (this.powerShape) {
					mdc.scene.remove(this.powerShape);
					PartManager.disposeShape(this.powerShape);
				}
				if (this.spaceShape) {
					mdc.scene.remove(this.spaceShape);
					PartManager.disposeShape(this.spaceShape);
				}
			},
			init:function(){
				this.shape.updateMatrixWorld(true);
				this.setCurrentShape(this.shape);
				//this.option.originPosition = this.shape.position.clone();
			},
			setCurrentShape:function(shape){
				this.currentShape = this.shape;
			},
			stagePower:function(mdc){
				var percent = 0.01;

				if (this.category !== "rack") return;
				if (this.currentShape) this.currentShape.visible = false;
				
				if (this.powerShape) {
					mdc.scene.remove(this.powerShape);
					PartManager.disposeShape(this.powerShape);
					//this.powerShape.visible = true;
				}
				
				if (!this.info) return;
				percent = this.info.activePower/this.info.ratedPower;
				this.powerShape = this.createPowerShape(this.shape.originPosition, percent);
				mdc.scene.add(this.powerShape);				
				
				this.powerShape.position.copy(this.currentShape.position);
				this.powerShape.rotation.copy(mdc.parts[0].currentShape.rotation);
				this.currentShape = this.powerShape;
			},
			stageDefault:function(mdc){
                if (this.category !== "rack") return;
				this.currentShape.visible = false;
				this.shape.position.copy(this.currentShape.position);
				this.shape.rotation.copy(mdc.parts[0].currentShape.rotation);
				this.currentShape = this.shape;
				this.currentShape.visible = true;
			},
			getWorldPosition:function(){
				//scene.updateMatrixWorld(true);
				var position = new THREE.Vector3();
				if (this.category === "rack")
				{
					position.setFromMatrixPosition( this.currentShape.children[0].children[0].matrixWorld);		
					// if (this.currentShape === this.powerShape){
					// 	position.setFromMatrixPosition( this.currentShape.children[0].matrixWorld);	
					// }
					// if (this.currentShape === this.shape){
					// 	position.setFromMatrixPosition( this.currentShape.children[0].children[0].matrixWorld);		
					// }
				}
				else if (this.category === "base"){
					position.setFromMatrixPosition( this.currentShape.matrixWorld);
				}
				else{
					position.setFromMatrixPosition( this.currentShape.children[0].matrixWorld);
				}
				return position;
			},
			stageSpace:function(mdc){
				var devs = [];
                if (this.category !== "rack") return;
				if (this.currentShape) this.currentShape.visible = false;
				
				if (this.spaceShape) {
					mdc.scene.remove(this.spaceShape);
					PartManager.disposeShape(this.spaceShape);
				}
				
				if (!this.info) return;
				if (this.info.devices) devs = this.info.devices;
				this.spaceShape = this.createSpaceShape(this.shape.originPosition, devs);
				mdc.scene.add(this.spaceShape);
				
				this.spaceShape.position.copy(this.currentShape.position);
				this.spaceShape.rotation.copy(mdc.parts[0].currentShape.rotation);
				this.currentShape = this.spaceShape;
			},
			createSpaceShape:function(pos, devices){
				var group = new THREE.Object3D();          
          
          		var geometry = new THREE.BoxGeometry( 55, 200, 80 );
				var material = new THREE.MeshBasicMaterial( {
					color: 0xB0CFF0, "transparent":true,"opacity":0.2,depthWrite:false
				} );

  			    var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

				var mat = new THREE.LineBasicMaterial( { color: 0xB0CFF0, linewidth: 1 , "transparent":true,"opacity":0.3} );

				var wireframe = new THREE.LineSegments( geo, mat );

				var cube = new THREE.Mesh( geometry, material);

				var that = this;
				devices.forEach(function(dev){
					group.add(that.createServerShape(dev.uIndex,dev.uHigh));	
				});
				
				group.add(cube);
				group.add(wireframe);

				group.position.x = pos.x;
				group.position.y = pos.y;
				group.position.z = pos.z;
				group.rotateY( 0 - PartManager.radians(90));

				var grp = new THREE.Object3D();  
				grp.add(group);
				return grp;				
			},
			createServerShape:function(uIndex,uSize){
				//var uh = 4.445;
				var uh = 4.7;
  				var geometry2 = new THREE.BoxGeometry( 50, uh * uSize, 79 );
				var material2 = new THREE.MeshBasicMaterial( {
					color: 0x84a0ac, "transparent":true,"opacity":0.8,depthWrite:false
				} );

				//var geo = new THREE.EdgesGeometry( geometry ); 

				//var mat = new THREE.LineBasicMaterial( { color: 0xB0CFF0, linewidth: 1 , "transparent":true,"opacity":0.3} );

				//var wireframe = new THREE.LineSegments( geo, mat );

				var cube = new THREE.Mesh( geometry2, material2);
				cube.position.y = uIndex * uh + (uh * uSize) / 2 - 100;

				return cube;
			},
			createPowerShape:function(pos, percent){
				var group = new THREE.Object3D();          
          
          		var geometry = new THREE.BoxGeometry( 55, 200, 80 );
				var material = new THREE.MeshBasicMaterial( {
					color: 0xB0CFF0, "transparent":true,"opacity":0.2,depthWrite:false
				} );

          		var geometry2 = new THREE.BoxGeometry( 50, 200 * percent, 79 );
				var material2 = new THREE.MeshBasicMaterial( {
					color: 0xB0CFF0, "transparent":true,"opacity":0.4,depthWrite:false
				} );

				var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

				var mat = new THREE.LineBasicMaterial( { color: 0xB0CFF0, linewidth: 1 , "transparent":true,"opacity":0.3} );

				var wireframe = new THREE.LineSegments( geo, mat );

				var cube = new THREE.Mesh( geometry, material);
				var cube2 = new THREE.Mesh( geometry2, material2);
				cube2.position.y = 100 * (percent - 1) + 1;
				group.add(cube2);
				group.add(cube);
				group.add(wireframe);

				group.position.x = pos.x;
				group.position.y = pos.y;
				group.position.z = pos.z;
				group.rotateY( 0 - PartManager.radians(90));

				var grp = new THREE.Object3D();  
				grp.add(group);
				return grp;
			},

			expand:function(){
				var that = this;
				if (that.states.expanded) return;
				//var pos = that.getWorldPosition();
				var shp = that.currentShape;

				if (this.category === "thermalMap"){
					if (this.id === "mapB") that.currentShape.children[0].position.x = -266;
					if (this.id === "mapA") that.currentShape.children[0].position.x = 266;
					that.states.expanded = true;
					return;
				}
	  	        new TWEEN.Tween(shp.position).to({
		        	x: that.option.expandPosition.x,
		        	y: that.option.expandPosition.y,
		        	z: that.option.expandPosition.z
		      	},1000).delay(Math.floor((Math.random() * 1000) + 1)).easing(TWEEN.Easing.Linear.None).onComplete(function () {
		      		that.states.expanded = true;
		      	}).start();
				new TWEEN.Tween(shp.rotation).to({
		        	x: 0,
		        	y: 0,
		        	z: 0
		      	},1000).delay(Math.floor((Math.random() * 1000) + 1)).easing(TWEEN.Easing.Linear.None).onComplete(function () {
		      		that.states.expanded = true;
		      	}).start();
			},
			collapse:function(){
				var that = this;
				if (!that.states.expanded) return;
				//var pos = that.getWorldPosition();
				// if (this.category === "rack" && this.id==="rack1"){
				// 	console.log(that.getWorldPosition().x,that.getWorldPosition().y,that.getWorldPosition().z);
				// }
				if (this.category === "thermalMap"){
					if (this.id === "mapA") that.currentShape.children[0].position.x = -166;
					if (this.id === "mapB") that.currentShape.children[0].position.x = 166;
					that.states.expanded = false;
					return;
				}
	  	        new TWEEN.Tween(that.currentShape.position).to({
		        	x: 0,//that.option.originPosition.x,
		        	y: 0,//that.option.originPosition.y,
		        	z: 0//that.option.originPosition.z
		      	},1000).delay(Math.floor((Math.random() * 1000) + 1))
		      	.easing(TWEEN.Easing.Linear.None).onComplete(function () {
		      		that.states.expanded = false;
		      	}).start();
			}
		};		
	}
};

var PartManager = {
	buildPart: function(partId,partCategory, shp, opt){
		var part = _.extend(BasePart.create(), {id:partId,category:partCategory, shape: shp, option: opt});
		part.shape.partId = partId;
		return part;
	},
	disposeObject: function(obj){
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
	},
	disposeShape: function(obj) {
        if (obj !== null) {
        	for (var i = 0; i < obj.children.length; i++) {
        		PartManager.disposeShape(obj.children[i]);
        	}
        
		    if(obj.dispose) {
            	obj.dispose();
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
					if (obj.material.map){
						obj.material.map.dispose();
						delete obj.material.map;
					}
            	}
          	}

        }
     
       	obj = undefined;
     },
	createBase: function(rowNumber) {
        //地板
        var bZ1 = 740 - (12 - rowNumber)*60;
        var bZ2 = (12 - rowNumber)*30;
        if(rowNumber > 12){
            bZ1 += (rowNumber - 12);
            bZ2 -= (rowNumber - 12)/2;
        }
        //右边台阶
        var sZ = (12 - rowNumber)*60 - 380;

		var group = new THREE.Object3D();
		var baseForm = this.baseObject({x: 340,	y: 40, z: bZ1 }, {x: 0,	y: 20,z: bZ2});
		var stageL1 = this.baseObject({x: 150,	y: 15, z: 100 }, {x: 0, y: 7.5,z: 380});
		var stageL2 = this.baseObject({x: 150,	y: 30, z: 50 }, {x: 0, y: 15,z: 380});

		var stageR1 = this.baseObject({x: 150,	y: 15, z: 100 }, {x: 0, y: 7.5,z: sZ});
		var stageR2 = this.baseObject({x: 150,	y: 30, z: 50 }, {x: 0, y: 15,z: sZ});
		group.add(baseForm);
		group.add(stageL1);
		group.add(stageL2);
		group.add(stageR1);
		group.add(stageR2);
		group.castShadow = true;
        group.receiveShadow = true;

        var option = { expandPosition:{x:0,y:-100,z:0} };
		return this.buildPart('base','base',group, option);
	},
	createWaterLeakageA: function(rowNumber) {
        var z1 = (12 - rowNumber)*30 - 340;
        var z2 = 340 - (12 - rowNumber)*30;
        var oz = -(rowNumber - 12)*30;

		var group = new THREE.Object3D();

		function makeLine(geo, color) {
            var g = new MeshLine();
            g.setGeometry(geo);

                material = new MeshLineMaterial({
                    color: new THREE.Color(0xffbb11),
                    //color: new THREE.Color( "rgb(200, 20, 20)" ),
                    //opacity: 1,
                    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                    sizeAttenuation: 11,
                    lineWidth: 12,
                    //near: 1,
                    //far: 100000,
                    //depthTest: true,
                    //depthWrite:true,
                    blending: THREE.Subtractive,
                    //transparent: false,
                    side: THREE.DoubleSide
                });

                var mesh = new THREE.Mesh(g.geometry, material);
                //mesh.frustumCulled = false;
                group.add(mesh);
            };

            var geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(50, 42, z1));
            geometry.vertices.push(new THREE.Vector3(142, 42, z1));
            geometry.vertices.push(new THREE.Vector3(142, 42, z2));
            geometry.vertices.push(new THREE.Vector3(50, 42, z2));
            geometry.vertices.push(new THREE.Vector3(50, 42, z1));

            makeLine(geometry);

        	var option = { expandPosition:{x:0,y:-100,z:oz} };
		return this.buildPart('waterLeakageA','waterLeakage',group, option);
	},
	createWaterLeakageB: function(rowNumber) {
        var z1 = (12 - rowNumber)*30 - 340;
        var z2 = 340 - (12 - rowNumber)*30;
        var oz = -(rowNumber - 12)*30;

		var group = new THREE.Object3D();

		function makeLine(geo, color) {
            var g = new MeshLine();
            g.setGeometry(geo);

            var material = new MeshLineMaterial({
                    color: new THREE.Color(0xffbb11),
                    //color: new THREE.Color( "rgb(200, 20, 20)" ),
                    //opacity: 1,
                    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                    sizeAttenuation: 11,
                    lineWidth: 12,
                    //near: 1,
                    //far: 100000,
                    //depthTest: true,
                    //depthWrite:true,
                    blending: THREE.Subtractive,
                    //transparent: false,
                    side: THREE.DoubleSide
                });

                var mesh = new THREE.Mesh(g.geometry, material);
                //mesh.frustumCulled = false;
                group.add(mesh);
            };

        var geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(-50, 42, z1));
        geometry.vertices.push(new THREE.Vector3(-142, 42, z1));
        geometry.vertices.push(new THREE.Vector3(-142, 42, z2));
        geometry.vertices.push(new THREE.Vector3(-50, 42, z2));
        geometry.vertices.push(new THREE.Vector3(-50, 42, z1));

        makeLine(geometry);

        var option = { expandPosition:{x:0,y:-100,z:oz} };
		return this.buildPart('waterLeakageB','waterLeakage',group, option);
	},
	createDoors:function(rowNumber){
        //右边门
        var dZ2 = (12 - rowNumber)*60 - 372;

		var res = [];
		var group1 = new THREE.Object3D();
		var group2 = new THREE.Object3D();

		var cfgDoorA = {
	    	faces:{
	        topFace: { texture: 'img/3d/molds/dark.png'},
	        bottomFace: { texture: 'img/3d/molds/dark.png'},
	        leftFace: { texture: 'img/3d/molds/dark.png' },
	        rightFace: { texture: 'img/3d/molds/dark.png' },
	        frontFace: { texture: 'img/3d/molds/rackdoorA1.png', color: 0xffffff,transparent:true,opacity: 1},
	        backFace: { texture: 'img/3d/molds/rackdoorB1.png', color: 0xffffff,transparent:true,opacity: 1}
	      }
		};
		var cfgDoorB = {
	    	faces:{
	        topFace: { texture: 'img/3d/molds/dark.png'},
	        bottomFace: { texture: 'img/3d/molds/dark.png'},
	        leftFace: { texture: 'img/3d/molds/dark.png' },
	        rightFace: { texture: 'img/3d/molds/dark.png' },
	        frontFace: { texture: 'img/3d/molds/rackdoorB1.png', color: 0xffffff,transparent:true,opacity: 1},
	        backFace: { texture: 'img/3d/molds/rackdoorA1.png', color: 0xffffff,transparent:true,opacity: 1}
	      }
		};

		var doorA1 = this.cubeObject({x: 90, y: 198, z: 9 }, {x: -44, y: 138,z: 372},cfgDoorA);
		var doorB1 = this.cubeObject({x: 90, y: 198, z: 9 }, {x: 44, y: 138,z: 372},cfgDoorB);
		group1.add(doorA1);
		group1.add(doorB1);
		var option1 = { expandPosition:{x:0,y:0,z:100} };
		res.push(this.buildPart('door1','door',group1, option1));

		var doorA2 = this.cubeObject({x: 90, y: 198, z: 9 }, {x: -44, y: 138,z: dZ2},cfgDoorA);
		var doorB2 = this.cubeObject({x: 90, y: 198, z: 9 }, {x: 44, y: 138,z: dZ2},cfgDoorB);
		group2.add(doorA2);
		group2.add(doorB2);
		var option2 = { expandPosition:{x:0,y:0,z:-100} };
		res.push(this.buildPart('door2','door',group2, option2));

		return res;
	},
	createCeiling: function(rowNumber){
        var fine = rowNumber - 12;
        //右边门横木
        var dZ2 = -(rowNumber - 12)*60 - 370 - fine;
        //天窗右边框
        var bZ2 = -(rowNumber - 12)*60 - 360;
        //天窗上下边框
        var cZ1 = 740 - (12 - rowNumber)*60;
        var cZ2 = (12 - rowNumber)*30;
        //电缆走线架
        var tZ1 = cZ1;
        var tZ2 = cZ2;

        var wt1 = 0,wt2 = 0;
        if(rowNumber*2%8 == 6){
            wt1 = 10;
            wt2 = 5;
        }else if(rowNumber*2%8 == 4){
            wt1 = 20;
            wt2 = 10;
        }

		var group = new THREE.Object3D();
		var cfgAssets = {
	    	faces:{
	        topFace: { texture: 'img/3d/molds/dark.png' },
	        bottomFace: { texture: 'img/3d/molds/dark.png' },
	        leftFace: { texture: 'img/3d/molds/dark.png' },
	        rightFace: { texture: 'img/3d/molds/dark.png' },
	        frontFace: { texture: 'img/3d/molds/dark.png' },
	        backFace: { texture: 'img/3d/molds/dark.png' }
	      }
	  	};
		var doorRail1 = this.cubeObject({x: 300, y: 10, z: 10 }, {x: 0, y: 240,z: 370},cfgAssets);
		var beam1 = this.cubeObject({x: 160, y: 30, z: 20+wt1 }, {x: 0, y: 260,z: 360-wt2},cfgAssets);

		var doorRail2 = this.cubeObject({x: 300, y: 10, z: 10 }, {x: 0, y: 240,z: dZ2},cfgAssets);
		var beam2 = this.cubeObject({x: 160, y: 30, z: 20+wt1 }, {x: 0, y: 260,z: bZ2+wt2},cfgAssets);
		group.add(doorRail1);
		group.add(beam1);
		group.add(doorRail2);
		group.add(beam2);

		var cfgWindow = {
	    	faces:{
	        topFace: { texture: 'img/3d/molds/ceilingwindow.png',tileWay:'T',textureSize:80, color: 0x888888,transparent:true,opacity: 0.8, widthSize:80,heightSize:740},
	        bottomFace: { texture: 'img/3d/molds/ceilingwindow.png', tileWay:'T',textureSize:80, color: 0x888888,transparent:true,opacity: 0.8, widthSize:80,heightSize:740},
	        leftFace: { texture: 'img/3d/molds/dark.png' },
	        rightFace: { texture: 'img/3d/molds/dark.png' },
	        frontFace: { texture: 'img/3d/molds/dark.png' },
	        backFace: { texture: 'img/3d/molds/dark.png' }
	      }
		};
		//var ceilingWindow = this.cubeObject({x: 160, y: 5, z: 740 }, {x: 0, y: 270,z: 0},cfgWindow);
		var ceilingWindow = new THREE.Object3D();
		var wins = this.createWindowParts(rowNumber);
		for (var i = wins.length - 1; i >= 0; i--) {
			ceilingWindow.add(wins[i]);
		}
		ceilingWindow.isWindow = true;

		group.add(ceilingWindow);

		var winCover1 = this.cubeObject({x:40, y:30,z:cZ1}, {x: 95, y: 260,z: cZ2},cfgAssets);
		var winCover2 = this.cubeObject({x:40, y:30,z:cZ1}, {x: -95, y: 260,z: cZ2},cfgAssets);
		group.add(winCover1);
		group.add(winCover2);

		var cfgTroughing= {
	    	faces:{
	        topFace: { texture: 'img/3d/molds/troughing.png',tileWay:'T',textureSize:30, color: 0xffffff,transparent:true,opacity: 1, widthSize:30,heightSize:720},
	        bottomFace: { texture: 'img/3d/molds/troughing.png',tileWay:'T',textureSize:30, color: 0xffffff,transparent:true,opacity: 1, widthSize:30,heightSize:720},
	        leftFace: { texture: 'img/3d/molds/troughing.png',tileWay:'T',textureSize:30, color: 0xffffff,transparent:true,opacity: 1, widthSize:30,heightSize:720},
	        rightFace: { texture: 'img/3d/molds/troughing.png',tileWay:'T',textureSize:30, color: 0xffffff,transparent:true,opacity: 1, widthSize:30,heightSize:720},
	        frontFace: { texture: 'img/3d/molds/troughing.png', color: 0xffffff,transparent:true,opacity: 1},
	        backFace: { texture: 'img/3d/molds/troughing.png', color: 0xffffff,transparent:true,opacity: 1}
	      }
		};

		var troughing1 = this.cubeObject({x:30, y:15,z:tZ1}, {x: 130, y: 250,z: tZ2},cfgTroughing);
		var troughing2 = this.cubeObject({x:30, y:15,z:tZ1}, {x: -130, y: 250,z: tZ2},cfgTroughing);
		group.add(troughing1);
		group.add(troughing2);

		var cfgAlarmer= {
	    	faces:{
	        topFace: { transparent:true,opacity: 0},
	        bottomFace: { transparent:true,opacity: 0},
	        leftFace: {transparent:true,opacity: 0},
	        rightFace: { transparent:true,opacity: 0},
	        frontFace: { texture: 'img/3d/molds/alarmer.png',color: 0x9999aa, transparent:true,opacity: 1},
	        backFace: { transparent:true,opacity: 0}
	      }
		};

		var alarmer = this.cubeObject({x:20, y:20,z:0}, {x: 0, y: 260,z: 375},cfgAlarmer);
		group.add(alarmer);

		var option = { expandPosition:{x:0,y:100,z:0} };
		return this.buildPart('ceiling','ceiling',group, option);
	},
	createWindowParts:function(rowNumber){
        //天窗
        var w = 740 + (rowNumber - 12)*60;
        var cZ = -(rowNumber - 12)*60+10 - 320;
        //  微调
        var cw = Math.floor(w/80)*80;
        var fine = cw - w + 20;

        if(rowNumber*2%8 == 6){
            fine += 10;
        }else if(rowNumber*2%8 == 4){
            fine += 20;
        }

		var wps = [];
		
		var cfgWindow = {
		   	faces:{
		        topFace: { texture: 'img/3d/molds/ceilingwindow.png',color: 0xffffff,transparent:true,opacity: 1},
		        bottomFace: { texture: 'img/3d/molds/ceilingwindow.png', color: 0xffffff,transparent:true,opacity: 1},
		        leftFace: { texture: 'img/3d/molds/dark.png' },
		        rightFace: { texture: 'img/3d/molds/dark.png' },
		        frontFace: { texture: 'img/3d/molds/dark.png' },
		        backFace: { texture: 'img/3d/molds/dark.png' }
		    }
		};

		var count = Math.floor(w/80);
		for(var i=0;i<count;i++){
			var cw = this.cubeObject({x: 154, y: 5, z: 80 }, {x: 0, y: 270,z: cZ + i * 80 - fine},cfgWindow);
			wps.push(cw);
		}		

		
		return wps;
	},
	createThermalMaps:function(rowNumber){
        var rWidth = rowNumber*60;
        var rWidths = rWidth + 10;

		var maps = [];
		var groupLeft = new THREE.Object3D();
		var groupRight = new THREE.Object3D();
		var grpLeft = new THREE.Object3D();
		var grpRight = new THREE.Object3D();

        var option = {
	        panel:{ width: rWidth, height:200},
	        sensors:[{x:20,y:40,val:0.8},{x:20,y:222,val:0.7},{x:130,y:455,val:0.8},
	        {x:270,y:405,val:0.3},{x:530,y:55,val:0.9}]
        };
        var m1 = ThermalMap.toMaterial(option,"A");
		var m2 = ThermalMap.toMaterial(option,"B");
		var geometry = new THREE.PlaneGeometry(rWidths, 200);
		var material1 = m1;
		var plane1 = new THREE.Mesh( geometry, material1 );

		var material2 = m2;//new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		var plane2 = new THREE.Mesh( geometry, material2);

		groupLeft.add(plane1);
		groupLeft.position.x = -166;
		groupLeft.rotateY( 0 - this.radians(90));
		//groupLeft.position.y = pos.y;
		groupLeft.position.y = 140;
		grpLeft.add(groupLeft);

		groupRight.add(plane2);
		groupRight.position.x = 166;
		groupRight.rotateY( 0 - this.radians(90));
		//groupRight.position.y = pos.y;
		groupRight.position.y = 140;
		grpRight.add(groupRight);

		var optionLeft = { expandPosition:{x:-100,y:0,z:0} };
		var optionRight = { expandPosition:{x:100,y:0,z:0} };

		// var geom = new THREE.BoxGeometry( 100, 100, 100 );
		// var mate = m;
		// var cube = new THREE.Mesh( geom, mate );

		maps.push(this.buildPart('mapA','thermalMap',grpLeft, optionLeft));
		maps.push(this.buildPart('mapB','thermalMap',grpRight, optionRight));

		return maps;
	},
	createThermalMap:function(side, points, option){
        //温场云图
        var rowNumber = parseInt(option.number/2);
        //宽度
        var gWidth = 730 + (rowNumber - 12)*60 + (rowNumber - 12);
        //位移
        var pZ = (12 - rowNumber)*30 - (rowNumber - 12)/2;

        var maps = [];
		var groupLeft = new THREE.Object3D();
		var groupRight = new THREE.Object3D();
		var grpLeft = new THREE.Object3D();
		var grpRight = new THREE.Object3D();

        var option = {
	        panel:{ width: 720, height:200},
	        sensors:points
        };
        var m = ThermalMap.toMaterial(option,side);

		var geometry = new THREE.PlaneGeometry(gWidth, 200);
		var material1 = m;
		var plane1 = new THREE.Mesh( geometry, material1 );

		var material2 = m;//new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		var plane2 = new THREE.Mesh( geometry, material2);

		groupLeft.add(plane1);
		groupLeft.position.x = -166;
		groupLeft.rotateY( 0 - this.radians(90));
		groupLeft.rotateZ( 0 - this.radians(180));
		//groupLeft.position.y = pos.y;
		groupLeft.position.y = 140;
        groupLeft.position.z = pZ; //平移
		grpLeft.add(groupLeft);

		groupRight.add(plane2);
		groupRight.position.x = 166;
		groupRight.rotateY( 0 - this.radians(90));
		groupLeft.rotateZ( 0 - this.radians(180));
		//groupRight.position.y = pos.y;
		groupRight.position.y = 140;
        groupRight.position.z = pZ; //平移
		grpRight.add(groupRight);

		var optionLeft = { expandPosition:{x:-100,y:0,z:0} };
		var optionRight = { expandPosition:{x:100,y:0,z:0} };

		var geom = new THREE.BoxGeometry( 100, 100, 100 );
		var mate = m;
		var cube = new THREE.Mesh( geom, mate );

		if (side === 'A') return this.buildPart('mapA','thermalMap',grpRight, optionRight);
		if (side === 'B') return this.buildPart('mapB','thermalMap',grpLeft, optionLeft);
		//maps.push(this.buildPart('mapLeft','thermalMap',grpLeft, optionLeft));
		//maps.push(this.buildPart('mapRight','thermalMap',grpRight, optionRight));

		//return maps;
	},
	createCameras:function(rowNumber){
        //摄像头位置；第6个和第7个机柜之间z：0
        var cZ1 = 120,cZ2 = -120;
        if(rowNumber < 12){
            cZ1 = 240;
            cZ2 = -240 - (rowNumber-12)*60;
        }else if(rowNumber > 12){
            cZ2 = -120 - (rowNumber-12)*60;
        }

		var cs = [];
     	
     	var option = { expandPosition:{x:0,y:180,z:0} };
     	var cgrp1 = new THREE.Object3D();
     	var cgrp2 = new THREE.Object3D();
     	var cgrpA = new THREE.Object3D();
     	var cgrpB = new THREE.Object3D();

     	var createCamera = function(grp){
     		var loader = new THREE.OBJLoader();	
     		var param ={};
        	param.color = 0x565656;
        	param.needsUpdate = true;    
        	param.shading= THREE.SmoothShading;
        	param.shininess = 100;
        	param.envMap = reflectionCube;    
	        param.reflectivity = 0.3;
        	param.refractionRatio = 0.5;
        	param.depthWrite = true;

        	loader.load( 'img/3d/molds/Round_SecurityCam_V01.obj', function ( object ) {
          		object.traverse( function ( child ) {
            		if ( child instanceof THREE.Mesh ) 
            		{
            			child.material = new THREE.MeshPhongMaterial(param);
            		}
            	});

          		object.scale.set( 4, 4, 4 );  	
          		grp.add( object );

		        var geometry = new THREE.SphereGeometry( 14, 32, 32 ,0,Math.PI * 2,Math.PI, Math.PI /2 + 0.1);
          		var material = new THREE.MeshPhongMaterial( {
              		color:0x17202a,
              		shininess:300,              
              		shading: THREE.SmoothShading,
              		envMap:reflectionCube,
              		reflectivity: 0.5,
              		refractionRatio:0,
              		depthWrite:true,
              		transparent:true,
              		side: THREE.DoubleSide      
          		} );
          		var sphere = new THREE.Mesh( geometry, material );
          		sphere.position.y = 5;
          		grp.add(sphere);
          	});
     	};
        
        createCamera(cgrp1);
        cgrp1.position.y = 240;
        cgrp1.position.z = cZ1;
        cgrpA.add(cgrp1);

        createCamera(cgrp2);
        cgrp2.position.y = 240;
        cgrp2.position.z = cZ2;
        cgrpB.add(cgrp2);

		cs.push(this.buildPart('camera1','camera',cgrpA, option));
		cs.push(this.buildPart('camera2','camera',cgrpB, option));

		return cs;
	},
	createCabinets: function(data){
        var cabinets = [];
        if(data.number){
            var optionLeft = { expandPosition:{x:-100,y:0,z:0} };
            var optionRight = { expandPosition:{x:100,y:0,z:0} };
            var rowNumber = parseInt(parseInt(data.number)/2);
            for(var i = 1;i <= parseInt(data.number);i++){
                var group = new THREE.Object3D();
                var rack = undefined;
                var x = 125,z = 335,f = -90;
                if(i <= rowNumber){
                    z = 335 - (i - 1)*61;
                }else{
                    z = 335 - (i - rowNumber - 1)*61;
                    x = -125;
                    f = 90;
                }
                var row = getRackByNumber(data.rowRacks,i);
                if(row != undefined){
                    rack = this.createRack({x: x, y: 140, z: z }, f, row.type);
                }else{
                    rack = this.createRack({x: x, y: 140, z: z }, f, "dark");//dark
                }
                group.add(rack);
                group.originPosition = {x: x, y: 140, z: z };
                if(i <= rowNumber){
                    cabinets.push(this.buildPart("rack"+i,"rack",group, optionRight));
                }else{
                    cabinets.push(this.buildPart("rack"+i,"rack",group, optionLeft));
                }
            }
        }

        function getRackByNumber(racks,number){
            var obj = undefined;
            if(racks){
                racks.forEach(function(item){
                    if(item.site == number) obj = item;
                });
            }
            return obj;
        }

		return cabinets;
	},
	createRack : function(position, al, Type){
		var group = new THREE.Object3D();
	    var cfg = {
	    	angle:al,
	    	faces:{
	        topFace: { texture: 'img/3d/molds/dark.png' },
	        bottomFace: { texture: 'img/3d/molds/dark.png' },
	        leftFace: { texture: 'img/3d/molds/dark.png' },
	        rightFace: { texture: 'img/3d/molds/dark.png' },
	        frontFace: { texture: 'img/3d/molds/'+Type+'.png' },
	        backFace: { texture: 'img/3d/molds/dark.png' }
	      }
	  	};
		var rack = this.cubeObject({x:60,y:200,z:80},position,cfg);
        if(Type == "dark")
            rack.material.visible = false;
        //rack.castShadow = true;
        //rack.receiveShadow = true;
		group.add(rack);
		return group;
	},
	cubeObject: function(size, pos, cfg){

		var obj = new THREE.Mesh(new THREE.CubeGeometry(size.x, size.y, size.z).clone(),
			new THREE.MeshFaceMaterial(
				[
					this.newFace(cfg.faces.rightFace), // +x
					this.newFace(cfg.faces.leftFace), // -x
					this.newFace(cfg.faces.topFace), // +y
					this.newFace(cfg.faces.bottomFace), // -y
					this.newFace(cfg.faces.frontFace), // +z
					this.newFace(cfg.faces.backFace) // -z
				]));

		obj.position.x = pos.x;
		obj.position.y = pos.y;
		obj.position.z = pos.z;

		if (cfg.angle) obj.rotateY( 0 - this.radians(cfg.angle));
		return obj;
	},
	radians : function(degrees) {
      return degrees * Math.PI / 180;
    },
	baseObject: function(size, pos) {

		var xm = this.newFace({tileWay:'T',widthSize:size.z,heightSize:size.y,textureSize:256,texture:"/img/3d/molds/basemetal.png"});
		var ym = this.newFace({tileWay:'T',widthSize:size.x,heightSize:size.z,textureSize:256,texture:"/img/3d/molds/basemetal.png"});
		var zm = this.newFace({tileWay:'T',widthSize:size.x,heightSize:size.y,textureSize:256,texture:"/img/3d/molds/basemetal.png"});
		//var ym = this.newFace({widthSize:size.x,heightSize:size.z,texture:"/img/3d/molds/basemetal.png"});
		//var zm = this.newFace({widthSize:size.x,heightSize:size.y,texture:"/img/3d/molds/basemetal.png"});

		// var obj = new THREE.Mesh(new THREE.CubeGeometry(size.x,size.y,size.z),
		//   new THREE.MeshFaceMaterial(xm));
		var obj = new THREE.Mesh(new THREE.CubeGeometry(size.x, size.y, size.z).clone(),
			new THREE.MeshFaceMaterial(
				[
					xm, // +x
					xm, // -x
					ym, // +y
					ym, // -y
					zm, // +z
					zm // -z
				]));

		obj.position.x = pos.x;
		obj.position.y = pos.y;
		obj.position.z = pos.z;
		//obj.castShadow = true;
        //obj.receiveShadow = true;
		return obj;
	},
	newFace: function(cfg) {
		var param = {};

		if (cfg.texture) param.map = new THREE.TextureLoader().load(cfg.texture);

		// if (cfg.widthSize) {
		// 	param.map.wrapS = param.map.wrapT = THREE.RepeatWrapping;
		// 	var walltileSize = 256;
		// 	param.map.repeat.set(cfg.widthSize / walltileSize, cfg.heightSize / walltileSize);
		// }
		
		if (cfg.tileWay){
          param.map.wrapS = param.map.wrapT = THREE.RepeatWrapping;
          var walltileSize = cfg.textureSize;

          if (cfg.tileWay == "H")
            param.map.repeat.set( cfg.faceSize / walltileSize, 1);

          if (cfg.tileWay == "T")
            param.map.repeat.set( cfg.widthSize / walltileSize, cfg.heightSize / walltileSize);

          if (cfg.tileWay == "V")
            param.map.repeat.set(1, cfg.faceSize / walltileSize);
        }
      

		if (cfg.side) param.side = cfg.side;
		if (cfg.color) param.color = new THREE.Color(cfg.color);

		if (cfg.transparent) param.transparent = cfg.transparent;

		var material = new THREE.MeshPhongMaterial(param);

		if (cfg.opacity) {
			material.opacity = cfg.opacity;
		} else {
			material.opacity = 1;
		}
		if (material.opacity !== 1) material.depthWrite = false;

		param.needsUpdate = true;
		//param.anisotropy = 16;
		param.shading= THREE.SmoothShading;
		//param.color = 0x222222;
		param.shininess = 100;
		param.envMap = reflectionCube;
		//param.transparent = true;
		//param.combine = THREE.MixOperation;
		//param.reflectivity = 0.3;
		param.refractionRatio = 0.5;
		//param.envMap.mapping = new THREE.CubeReflectionMapping();
		//return new THREE.MeshLambertMaterial(param);
		return new THREE.MeshPhongMaterial(param);
		//return material;
	}
};