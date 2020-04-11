var ThermalMap = {
	toMaterial:function(option,side){

		// create svg element 
		var svgtemp = document.getElementById('svgtemp' + side);
		if (!svgtemp) {
			svgtemp = document.createElement('svgtemp' + side);
			document.body.appendChild(svgtemp);			
		}

		//generate themal map
		this.create('#svgtemp' + side,option);

		//convert svg to image
		var img = document.getElementById('imgsvg' + side);
		if (!img){
			img = new Image();
			img.setAttribute("id", "imgsvg" + side);
			document.body.appendChild(img);			
		}

        var serializer = new XMLSerializer();
        var svgStr = serializer.serializeToString(svgtemp.lastChild);
        //console.log(svgStr);
    	img.src = 'data:image/svg+xml;base64,'+window.btoa(svgStr);
		//img.style.visibility = 'hidden';
        img.style.display = 'none';

		//generate texture
		var canvas = document.getElementById('canvas' + side);

		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.setAttribute("id", 'canvas' + side);
			document.body.appendChild(canvas);			
		}
		//canvas.style.visibility = 'hidden';
        canvas.style.display = 'none';
		//var canvas = document.createElement('canvas');
		
		var context = canvas.getContext("2d");

        canvas.width = option.panel.width;
        canvas.height = option.panel.height;

		context.drawImage(img,0,0,canvas.width,canvas.height);
				//img.style.visibility = 'hidden';
                img.style.display = 'none';

		var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;


        var material = new THREE.MeshBasicMaterial( {
           map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0.7,depthWrite:false} );
        material.needsUpdate = true;
        //var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		//param.shininess = 100;
		//param.envMap = reflectionCube;

        return material;
	},
	create:function(id,option){
		var tm = {};
		var span = 3;//颗粒度，这是测试过没有颗粒感的最佳效果，如果小了CPU和内存受不了
		tm.init = function(id, option,span){

			// var tooltip = d3.select("body")
			// 	.append("div")
			// 	.style("position", "absolute")
			// 	.style("z-index", "10")
			// 	.style("visibility", "hidden")
			// 	.text("a simple tooltip");

			// 颜色Array(255,0,255)格式转为#FF00FF
		    function rgb2color(rgb)
		    {
		     var s = "#";
		     for (var i = 0; i < 3; i++)
		     {
		      var c = Math.round(rgb[i]).toString(16);
		      if (c.length == 1)
		       c = '0' + c;
		      s += c;
		     }
		     return s.toUpperCase();
		    }

		    function getHeatMapColor(value)
		    {
		        var resultColor = [];
		        var color = [ [0,0,1], [0,1,0], [1,1,0], [1,0,0] ];
		     
		        var idx1;        // |-- Our desired color will be between these two indexes in "color".
		        var idx2;        // |
		        var fractBetween = 0;  // Fraction between "idx1" and "idx2" where our value is.
		     
		        if(value <= 0)      {  idx1 = idx2 = 0; }    // accounts for an input <=0
		        else if(value >= 1)  {  idx1 = idx2 = 3; }    // accounts for an input >=0
		        else
		        {
		            value = value * 3;                      // Will multiply value by 3.
		            idx1  = Math.floor(value);                  // Our desired color will be after this index.
		            idx2  = idx1+1;                        // ... and before this index (inclusive).
		            fractBetween = value - idx1;    // Distance between the two indexes (0-1).
		        }

                resultColor.push(((color[idx2][2] - color[idx1][2])*fractBetween + color[idx1][2]) * 255);//blue
                resultColor.push(((color[idx2][1] - color[idx1][1])*fractBetween + color[idx1][1]) * 255);//green
                resultColor.push(((color[idx2][0] - color[idx1][0])*fractBetween + color[idx1][0]) * 255);//red

	    	    return resultColor
		    }

		    //任一点与指定的几个点的距离是d1,d2,d3等。
		    //指定点的温度是t1,t2,t3,
		    //那么任一点的温度可以通过公式(t1/d1+t2/d2+t3/d3)/(1/d1+1/d2+1/d3)得到
			var pickPointColor = function(x,y,sensors){
				var distances = [];
				var res ={};

				for(var i=0;i<sensors.length;i++){
					var xdis = parseFloat(Math.abs((sensors[i].x - x)));
					var ydis = parseFloat(Math.abs((sensors[i].y - y)));
					var dis = Math.sqrt(xdis*xdis + ydis*ydis);
					var item = {};
					if (dis == 0) return sensors[i].val;
					
					item.dis = dis;
					item.val = sensors[i].val;
					item.sub = sensors[i].val/dis;
					item.sum = 1/dis;					

					distances.push(item);
				}

				var temp = 0;
				var subtotal = 0;
				var sumtotal = 0;

				for(var j=0;j<distances.length;j++)
				{
					sumtotal += distances[j].sum;
					subtotal += distances[j].sub;
				}

				temp = subtotal / sumtotal;

				return temp;
			}

			var createPointMatrix = function(x,y, sensors, span){
				var m = [];
				for(var i=0;i<x;i = i + span){
					for(var j=0;j<y;j = j + span){
						m.push({
							'x':i,
							'y':j,
							'color':pickPointColor(i,j,sensors)
						});
					}
				}

				return m;
			};

			var dataset = createPointMatrix(option.panel.width,
				option.panel.height,
				option.sensors,span);

            $(id).empty();//清除所有的svg
			tm.svg = d3.select(id)					 //div id
			.append("svg:svg")
			.attr("width", option.panel.width)       //设定宽度
    		.attr("height", option.panel.height);    //设定高度

    		tm.svg.selectAll("rect")
    		.data(dataset)    		
    		.enter()
    		.insert("rect",":first-child")			 //' .append("rect")
    		.attr("x",function(d,i){
    			return d.x;
    		})
		    .attr("y",function(d,i){
		         return d.y;
		    })
		    .attr("width",span)
    		.attr("height",span)
    		.attr("fill",function(d,i){
    			//console.log(d.x,d.y,d.color);
    			return rgb2color(getHeatMapColor(d.color));
    		});
    		//.on("mouseover", function(d){
    		//	tooltip.text(d.color);
    		//	return tooltip.style("visibility", "visible");
    		//})
			//.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
			//.on("mouseout", function(){return tooltip.style("visibility", "hidden");});
		}

		tm.init(id,option,span);
		return tm;
	}
};