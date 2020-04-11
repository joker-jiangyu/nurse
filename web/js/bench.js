var Bench ={
  create:function(id, options) {
    var bn = {};

    //public vars
    bn.dirty = false;                 //is config need be saved
    bn.shapes = [];                   //all shape instances in svg
    bn.symbols = [];                  //all shape's template(symbol)
    bn.paper = null;                  //raphael core container object
    bn.temp = {};                     //all vars in temp object
    bn.enablePan = true;              //
    //bn.realScale = 20;                //unit : meter for rule calculation
    bn.options = {};

    ///////// function init code here /////////
    bn.init = function (domId) {

      //fields
      bn.id = domId;
      bn.domId = "#" + domId;           //div id
      //bn.offset = offset;               //size of screen not belong to svg element

      //states
      bn.mouseState = "default";        //mouse state: default/drawFloor....

      //members
      bn.getSize = function () {
        //var w = $(bn.domId).width();
        var w = $(document).width() - 491;
        var h = $(window).height() - $(bn.domId).position().top ;
        //var h = $(window).height() - $(bn.domId).offset().top + 117;
        //h = $(bn.domId).prop('scrollHeight');
        return { width: w, height: h };
      };

      //inner functions
      function createPaper() {
        var size =bn.getSize();
        bn.paper =new Raphael(document.getElementById(bn.id),
          size.width, size.height);
        bn.paper.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        bn.paper.setViewBox(0, 0, size.width, size.height);

        bn.resetSelection();
      }

      function enablePaperResize() {
        $(window).resize(function () {
          if (bn.temp.resizeTO) clearTimeout(bn.temp.resizeTO);
          bn.temp.resizeTO = setTimeout(function () {
            $(this).trigger('resizeEnd');
          }, 300);
        });

        $(window).unbind('resizeEnd').bind('resizeEnd', function () {
          //resize canvas
          bn.paper.setSize(bn.getSize().width,
            bn.getSize().height);
        });
      }

      function defineMouseBehavior() {
        bn.viewBoxWidth = bn.paper.width;
        bn.viewBoxHeight = bn.paper.height;
        var canvasID = bn.domId;
        var startX, startY;
        var mousedown = false;
        var dX, dY;
        var oX = 0, oY = 0, oWidth = bn.viewBoxWidth, oHeight = bn.viewBoxHeight;
        bn.viewBox = bn.paper.setViewBox(oX, oY, bn.viewBoxWidth, bn.viewBoxHeight);
        bn.viewBox.X = oX;
        bn.viewBox.Y = oY;

        function handleZoom(delta) {
          if (delta < 0) {
            bn.setZoom(0.95);
          }
          else {
            bn.setZoom(1.05);
          }
        }

        //Event handler for mouse wheel event.
        function wheel(e) {
          var event = e.originalEvent;
          var delta = 0;
          if (!event) /* For IE. */
            event = window.event;
          if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta / 120;
          } else if (event.detail) {
            /** Mozilla case. */
            delta = -event.detail / 3;
          }
          /** If delta is nonzero, handle it.
           * Basically, delta is now positive if wheel was scrolled up,
           * and negative, if wheel was scrolled down.
           */
          if (delta) {
            handleZoom(delta);
          }

          //Prevent default actions caused by mouse wheel
          if (event.preventDefault)
            event.preventDefault();
          event.returnValue = false;
        }

        $(canvasID).unbind('mousewheel DOMMouseScroll').bind(
          {'mousewheel DOMMouseScroll': wheel});

        function updateWallPath(mx, my) {
          var cp = bn.canvasPoint(mx, my);

          if (bn.temp.wallCache) {
            var twidth = Math.abs(cp.x - bn.temp.wallCache.lastX);
            var theight = Math.abs(cp.y - bn.temp.wallCache.lastY);

            if (twidth > theight) {
              bn.temp.wallCache.lastX = cp.x;
              bn.temp.wallCache.path += " H " + cp.x + " ";
            }
            else {
              bn.temp.wallCache.lastY = cp.y;
              bn.temp.wallCache.path += " V " + cp.y + " ";
            }
          }
          else {
            bn.temp.wallCache = {};
            bn.temp.wallCache.ps = [];
            bn.temp.wallCache.path = "M " + cp.x + " " + cp.y + " ";
            bn.temp.wallCache.lastX = cp.x;
            bn.temp.wallCache.lastY = cp.y;
          }

          var p = bn.addShape("pointIndicator",
            {x: bn.temp.wallCache.lastX, y: bn.temp.wallCache.lastY});

          bn.temp.wallCache.ps.push(p);

        }

        function panWindow(px, py) {
          if (bn.mouseState === "pan")
            $(canvasID).css('cursor', "url('/img/3d/hand-pull-lightblue.cur'), default");

          dX = startX - px;
          dY = startY - py;
          var x = bn.viewBoxWidth / bn.paper.width;
          var y = bn.viewBoxHeight / bn.paper.height;

          dX *= x;
          dY *= y;

          bn.paper.setViewBox(bn.viewBox.X + dX, bn.viewBox.Y + dY, bn.viewBoxWidth, bn.viewBoxHeight, true);
        }

        function getDoorPosition(x, y) {
          //find one wall
          var els = [];

          var elements = bn.paper.getElementsByPoint(x,y);
          elements.forEach(function(el){
            if (el.sym != undefined) els.push(el);
          });

          var pointRanges = [];
          
          var range = 5;
          while( range > 0)
          {
           pointRanges.push({ x1: x + range, y1: y});
           pointRanges.push({ x1: x, y1: y + range});
           pointRanges.push({ x1: x - range, y1: y});
           pointRanges.push({ x1: x, y1: y - range});
          
           range--;
          }
          
          var pts = [];
          pointRanges.forEach(function(point){
           var elements = bn.paper.getElementsByPoint(point.x1, point.y1);
           pts = _.filter(elements, function (el) {
             return el.sym !== undefined;
           });
          
           pts.forEach(function(ptsItem){
             if (_.contains(els, ptsItem) !== true){
               els.push(ptsItem);
             }
           });
          });

          var wps = _.filter(els, function (el) {
            return el.sym.name === "floorPath" || el.sym.name === "wallPath";
          });


          //find multi-points
          if (_.isUndefined(wps)) return;
          if (wps.length == 0 ) return;

          var positions = [];
          wps.forEach(function(pt){
            //get path points collection
            var lastX, lastY;
            var ptPoints = _.reduce(pt.realPath, function (ps, segment) {
              var point = {};

              if (segment[0] == "M") {
                point.x = segment[1];
                point.y = segment[2];
                lastX = point.x;
                lastY = point.y;
                point.type = "M";
              }

              if (segment[0] == "H") {
                point.x = segment[1];
                point.y = lastY;
                lastX = point.x;
                point.type = "H";
              }

              if (segment[0] == "V") {
                point.y = segment[1];
                point.x = lastX;
                lastY = point.y;
                point.type = "V";
              }

              ps.push(point);
              return ps;
            }, []);

            var position = _.reduce(ptPoints, function (pos, poi) {
              if (pos.min > Math.abs(poi.x - x)) {
                pos.min = Math.abs(poi.x - x);
                pos.type = "X";
                pos.x = poi.x;
                pos.y = poi.y;
              }

              if (pos.min > Math.abs(poi.y - y)) {
                pos.min = Math.abs(poi.y - y);
                pos.type = "Y";
                pos.x = poi.x;
                pos.y = poi.y;
              }

              return pos;
            }, {min: 99999999});

            positions.push(position);
          });

          //find right points
          var minPosition = _.min(positions, function(o){
            return o.min;
          });

          return minPosition;
        }

        function updateWallShape() {
          $(bn.domId).css('cursor', 'crosshair');
          if (bn.temp.wallCache.line) {
            bn.temp.wallCache.line.attr("path", bn.temp.wallCache.path);
          }
          else {
            bn.temp.wallCache.line = bn.paper.path(bn.temp.wallCache.path);
            bn.temp.wallCache.line.attr({
              "type": "path",
              "stroke": "#28a4c9",
              "stroke-width": 40,
              "stroke-linejoin": "round",
              "stroke-linecap": "round",
              "pointer-events": "all"
            });
          }
          
          if (bn.temp.wallCache.ps.length == 3){
            if (bn.currentSymbol.name == "floorPath"){
              bn.selectDefaultSymbol();              
            }
          }
        }

        function finishRuler(mx, my) {
          var cp = bn.canvasPoint(mx, my);

          if (!bn.temp.rule) {
            bn.temp.rule = {};
            bn.temp.rule.start = cp;
            bn.temp.rule.startIndicator = bn.addShape("pointIndicator", cp);
          } else {
            var shp = bn.addShape("ruler", {start: bn.temp.rule.start, end: cp});
            bn.temp.rule.startIndicator.delete();
            bn.temp.rule = undefined;
            mousedown = false;

            bn.selectDefaultSymbol();
          }

        }

        function prepareSelection(e){

          var el = bn.paper.getElementByPoint(e.pageX, e.pageY);

          if (bn.isSelectable(el)){
            var shp = bn.getShapeByElement(el);
            if (shp)
            {
              if (!shp.selected)
              {
                bn.resetSelection();
                bn.setSelection(el);
              }
              bn.selection.one = true;
            }
          }
          else {
            //selection default 0;
            bn.selection.one = false;
            var p1 = bn.canvasPoint(e.pageX, e.pageY);
            setMarquee(p1.x, p1.y, 0, 0);
            bn.marquee.toFront();
          }
        }

        $(canvasID).mousedown(function (e) {

          //if (bn.paper.getElementByPoint(e.pageX, e.pageY) != null) {
          //  bn.resetSelection();
          //  bn.selectByClick(e);
          //  if (bn.mouseState !== "drawWall" &&
          //    bn.mouseState !== "drawWallPart" &&
          //    bn.mouseState !== "drawRuler" &&
          //    bn.mouseState !== "drawShape") return;
          //}

          if (bn.mouseState === "default") prepareSelection(e);

          //common
          mousedown = true;
          startX = e.pageX;
          startY = e.pageY;

          //all situation can pan window
          panWindow(e.pageX, e.pageY);

          if (bn.mouseState === "drawWall") {
            updateWallPath(e.pageX, e.pageY);
          }

          if (bn.mouseState == "drawRuler") {
            finishRuler(e.pageX, e.pageY);
          }

          if (bn.mouseState == "drawShape"){
            var sp = bn.addShape(bn.currentSymbol.name, bn.canvasPoint(e.pageX,e.pageY));
                bn.shapes.forEach(function(shp){
                if (shp.selected) {
                  shp.updateLook();
                }
              });
            bn.resetSelection();
            bn.setSelection(sp.element);

          }

          if (bn.mouseState === "drawWallPart") {
            var cp = bn.canvasPoint(e.pageX, e.pageY);
            var pos = getDoorPosition(cp.x, cp.y);
            //var pos = getDoorPosition(e.clientX, e.clientY);

            if (_.isUndefined(pos)) return;

            var symbolName = bn.currentSymbol.name;
            if (pos.min < 100) {
              if (pos.type == "Y") {
                bn.addShape(symbolName, {x: cp.x, y: pos.y - 15, type: pos.type});
              }
              else {
                bn.addShape(symbolName, {x: pos.x - 15, y: cp.y, type: "X"});
              }
            }
          }

        });

        function setMarquee(x, y, width, height) {
          bn.marquee.attr({"x": x});
          bn.marquee.attr({"y": y});
          bn.marquee.attr({"width": width});
          bn.marquee.attr({"height": height});
        }

        function updateSelection(e){
          if (bn.selection.one) return;
          if (bn.selectRect) return;
          var p1 = bn.canvasPoint(startX, startY);
          var p2 = bn.canvasPoint(e.pageX, e.pageY);

          function Interval(lo, hi) {
            this.lo = Math.min(lo, hi);
            this.hi = Math.max(lo, hi);
          }

          Interval.prototype.contains = function(value) {
            return this.lo <= value && value <= this.hi;
          };

          Interval.prototype.isOverlapping = function(that) {
            return (
            this.contains(that.lo) ||
            this.contains(that.hi) ||
            that.contains(this.lo) ||
            that.contains(this.hi)
            );
          };

          function inSelection(shape) {
            var mBBox    = bn.marquee.getBBox();
            var sBBox    = shape.element.getBBox();
            var marqueeX = new Interval(mBBox.x, mBBox.x + mBBox.width);
            var marqueeY = new Interval(mBBox.y, mBBox.y + mBBox.height);
            var shapeX   = new Interval(sBBox.x, sBBox.x + sBBox.width);
            var shapeY   = new Interval(sBBox.y, sBBox.y + sBBox.height);

            return marqueeX.contains(shapeX.lo) &&
              marqueeX.contains(shapeX.hi) &&
              marqueeY.contains(shapeY.lo) &&
              marqueeY.contains(shapeY.hi);
          }

          function selectShapes() {

            bn.shapes.forEach(function(shape){
              if (!bn.isSelectable(shape.element)) return;

              if ( inSelection(shape) ) {
                bn.setSelection(shape.element);
              } else {
                bn.removeSelection(shape);
              }
            });
          }

          bn.marquee.show();

          setMarquee(
            Math.min(p1.x, p2.x), Math.min(p1.y, p2.y),
            Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y)
          );

          selectShapes();

        }

        $(canvasID).mousemove(function (e) {

          if (mousedown == false) {
            return;
          }

          if (bn.mouseState === "default") updateSelection(e);
          if (bn.mouseState === "pan") panWindow(e.pageX, e.pageY);
        });

        function finishSelection()
        {
          setMarquee(0,0,0,0);
          if (!bn.selection.one)
          {
            if (bn.selectRect)
            {
              bn.shapes.forEach(function(shp){
                if (shp.selected) {
                  shp.updateLook();
                }
              });
              bn.resetSelection();
            }
            else
            {
              if (bn.selection.length == 0) return;
              var box = bn.selection.getBBox();
              //console.log(box.x,box.y,box.width);
              bn.selectRect = bn.paper.rect(box.x,box.y,box.width,box.height);
              bn.selectRect.attr({fill: "green"});
              bn.selectRect.attr({"fill-opacity": "0.2"});
              bn.selectRect.attr({"stroke-opacity": "0.3"});
              bn.selectRect.attr({"stroke-dasharray":"-"});
              bn.selectRect.attr({stroke: "green"});
              bn.selectRect.attr({"stroke-width": 10});
              bn.selectRect.toFront();
              bn.selectRect.draggable();
            }
          }
          bn.selection.getBBox();
        }

        $(canvasID).mouseup(function (e) {

          //common
          if (mousedown == false) return;

          bn.viewBox.X += dX;
          bn.viewBox.Y += dY;
          mousedown = false;

          if (bn.mouseState === "default")
            finishSelection();


          var cp = bn.canvasPoint(e.pageX, e.pageY);

          if (bn.mouseState === "drawWall") {
            updateWallShape();
          } else if (bn.mouseState === "drawRuler") {
            if (bn.temp.rule) $(canvasID).css('cursor', 'crosshair');
          } else if (bn.mouseState === "drawWallPart") {
            $(canvasID).css('cursor', 'crosshair');
          } else if (bn.mouseState === "drawShape"){

          }
          else {
            $(canvasID).css('cursor', 'default');
          }


        });
      }

      function defineKeyBehavior() {
        $(document).keyup(function (e) {

          if (e.keyCode == 27) { // escape key maps to keycode `27`
            if (bn.currentSymbol.handleKey)
              bn.currentSymbol.handleKey("ESC");
          }
          if (e.keyCode == 46) {
            bn.delete();
          }

          if (e.keyCode == 37) {
            bn.move('left');
          }

          if (e.keyCode == 39){
            bn.move('right');
          }

          if (e.keyCode == 38){
            bn.move('up');
          }

          if (e.keyCode == 40){
            bn.move('down');
          }
        });

        $(document).keydown(function (e) {

          if (e.keyCode == 37) {
            bn.move('left');
          }

          if (e.keyCode == 39){
            bn.move('right');
          }

          if (e.keyCode == 38){
            bn.move('up');
          }

          if (e.keyCode == 40){
            bn.move('down');
          }

        });
      }

      //actions
      createPaper();
      defineMouseBehavior();
      defineKeyBehavior();

      bn.selectDefaultSymbol();
      enablePaperResize();
    };

    bn.clear = function () {
      bn.temp = {};                  //clear all temporary vars
      bn.dirty = false;              //set to default
      bn.shapes = [];                //clear shape instances
      bn.paper.clear();
      bn.resetSelection();
    };

    bn.load = function (config) {
      bn.clear();
      if (config) {
        bn.loadConfig = config;
      }
      else {
        bn.loadConfig = bn.demoConfig;
      }

      bn.setZoom(bn.loadConfig.editorZoom);

      var loadShape = function(sp) {
        var shp = bn.addShape(sp.param2D.symbol, sp.param2D);
        if (shp) {
          shp.config = sp;
          shp.updateLook();
        }
      };

      bn.loadConfig.shapes.forEach(function (shp) {
        loadShape(shp);
      });

      bn.shapes.forEach(function (shp) {
        if (shp.element.sym.name === "floorPath") return;
        if (shp.element.sym.name === "floorImage") return;
        shp.element.toFront();
      });

      bn.dirty = false;
    };

    bn.addShape = function (symbolName, param) {
      var sym = _.find(bn.symbols, function (item) {
        return item.name === symbolName;
      });
      if (_.isUndefined(sym)) return;

      /*unique elements create by each symbols*/
      var el = sym.create(param);
      $(el).keyup(function(event) {
        if (e.keyCode == 46) {
          bn.delete();
        }
      });
      el.sym = sym;

      var shp = _.extend({}, bn.shapeClass);
      shp.element = el;

      bn.shapes.push(shp);
      if (!shp.config) shp.newConfig();
      shp.updateLook();
      bn.dirty = true;
      return shp;
    };

    bn.shapeMakeup = function (el, sym) {
      //el.hover(function () {
      //  this.glowEffect = this.glow({color: "blue", width: 15});
      //}, function () {
      //  this.glowEffect.remove();
      //});
      if (sym.class)
      {
        $(el.node).attr("class", sym.class);
      }

      if (sym.style)
      {
        for(var a in sym.style)
        {
          el.attr(a, sym.style[a]);
        }
      }

      if (sym.class !== "floorPath")
        el.draggable();
      return el;
    };

    bn.selectSymbol = function (sym) {
      if (bn.currentSymbol) {
        if (bn.currentSymbol.endState)
          bn.currentSymbol.endState();
      }

      bn.mouseState = sym.mouseState;
      bn.currentSymbol = sym;
      if (sym.initState) sym.initState();

      //update cursor & mouseState for common purpose
      $(bn.domId).css('cursor', 'auto');

      if (sym.cursor) $(bn.domId).css('cursor', sym.cursor);
      bn.update();
    };

    bn.selectDefaultSymbol = function () {
      bn.selectSymbol(bn.symbols[0]);
    };

    bn.findShapeBySymbolName = function (name) {
      var sps = _.filter(bn.shapes, function (shp) {
        return shp.element.sym !== undefined;
      });

      return _.find(sps, function (shp) {
        return shp.element.sym.name === name;
      });
    };

    bn.setZoom = function (zoom){
      var vBHo = bn.viewBoxHeight;
      var vBWo = bn.viewBoxWidth;
      var vX = bn.viewBox.X;
      var vY = bn.viewBox.Y;

      bn.viewBoxWidth *= zoom;
      bn.viewBoxHeight *= zoom;

      bn.viewBox.X -= (bn.viewBoxWidth - vBWo) / 2;
      bn.viewBox.Y -= (bn.viewBoxHeight - vBHo) / 2;
      //bn.viewBox.X = zoom * vX;
      //bn.viewBox.Y = zoom * vY;

      bn.paper.setViewBox(bn.viewBox.X, bn.viewBox.Y, bn.viewBoxWidth, bn.viewBoxHeight, true);
    };

    bn.setSelection = function (el) {

      el.attr({"stroke": "#8ADBB2"});
      el.attr({"fill": "#74ED34"});
      el.attr({"fill-opacity": "0.7"});
      el.attr({"stroke-opacity": "0.7"});

      var exist = false;
      if (bn.selection) {
        bn.selection.forEach(function (e) {
          if (e === el) exist = true;
        });

        if (!exist)
        {
          if (el.sym) bn.selection.push(el);
        }

        bn.getShapeByElement(el).selected = true;
        //bn.selection.draggable();
        //console.log(bn.selection);

        var selectedShapes = [];
        bn.selection.forEach(function (e) {
          selectedShapes.push(bn.getShapeByElement(e));
        });

        bn.ev("shapeSelected", selectedShapes);
      }
    };

    bn.isSelectable = function(el){

      if (el == null) return false;
      if (el === bn.selectRect) return true;
      if (_.isUndefined(el.sym)) return false;
      if (el.sym.name === "floorPath") return false;
      if (el.sym.name === "floorImage") return false;

      return true;
    };

    bn.resetSelection = function (){
      var selectedShapes = [];
      if (bn.shapes) {
        bn.shapes.forEach(function (shp) {
          if (shp.selected) selectedShapes.push(shp);
        });
        bn.ev("resetShape", selectedShapes);
      }

      if (_.isUndefined(bn.marquee))
        bn.marquee = bn.paper.rect(0, 0, 0, 0);

      {
        bn.marquee = bn.paper.rect(0, 0, 0, 0);
        bn.marquee.attr({fill: "none"});
        bn.marquee.attr({"stroke-dasharray":"-"});
        bn.marquee.attr({stroke: "green"});
        bn.marquee.attr({"stroke-width": 10});
        bn.marquee.toFront();
      }

      bn.selection = bn.paper.set();
      if (bn.selectRect) {
        bn.selectRect.remove();
        bn.selectRect = undefined ;
      }

      bn.shapes.forEach(function(shp){
        shp.resetStyle();
        shp.selected = false;

      });
    };

    bn.getShapeByElement = function(el){
      var res = null;
      bn.shapes.forEach(function(shp){
        if (shp.element === el) res = shp;
      });

      return res;
    };

    bn.removeSelection = function (shape){
      shape.resetStyle();
      shape.selected = false;
      bn.selection.exclude(shape.element);
    };

    bn.save = function (){

      //get floor calc center2D for 3d config position update
      var floor = _.find(bn.shapes, function(shp){
        return shp.element.sym.name == "floorPath";
      });

      if (floor) floor.element.sym.calcCenter(floor.element);

      bn.loadConfig.shapes.length = 0;
      bn.shapes.forEach(function(shp){
        shp.updateConfig();
        bn.loadConfig.shapes.push(shp.config);
      });

      bn.uploadConfig(bn.loadConfig);
      //bn.demoConfig = bn.loadConfig;
      //bn.info(angular.toJson(bn.loadConfig));

      bn.dirty = false;
    };

    bn.newConfig = function(){
      var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
      var prompt = languageJson.Room3D.Edit.Prompt;
      var nc = {
        "name": "new floor",
        "title": prompt.Room,
        "description": prompt.Note,
        "version": "0.0.1",
        "editorZoom": 1,
        "shapes":[]
      };/*"新机房" "备注请放在这里"*/

      bn.load(nc);
    };

    bn.canvasPoint = function (pageX, pageY) {
      var rX = pageX - $(bn.domId).position().left;
      var rY = pageY - $(bn.domId).position().top;
      var x = bn.viewBoxWidth / bn.paper.width;
      var y = bn.viewBoxHeight / bn.paper.height;
      var tX = bn.viewBox.X + rX * x;
      var tY = bn.viewBox.Y + rY * y;

      return {x: tX, y: tY};
    };

    bn.delete = function(){
      if (bn.selection.length == 0) return;
      var needremoves = [];
      bn.shapes.forEach(function(shape){
        if (shape.selected) needremoves.push(shape);
      });

      needremoves.forEach(function(shp){
        shp.delete();
      });
    };

    bn.align = function(type){
      if (bn.selection.length < 2) return;

      if (type == "left"){
        var leftElement = _.min(bn.selection, function(el){
          var box = el.getBBox();
          return box.x;
        });

        var leftPosition = leftElement.getBBox().x;

        bn.selection.forEach(function(el){
          var offset = leftPosition - el.getBBox().x;
          var shp = bn.getShapeByElement(el);
          //el.nt_translate(offset,0);
          shp.translate(offset,0);
        });
      }

      if (type == "hcenter"){
        var ec = bn.selection.length;
        var sy = 0;
        bn.selection.forEach(function(el){
          sy = sy + el.getBBox().y;
        });

        var mid = sy/ec;
        bn.selection.forEach(function(el){
          var shp = bn.getShapeByElement(el);
          var offset = mid - el.getBBox().y;
          //el.nt_translate(0, offset);
          shp.translate(0,offset);
        });
      }

      if (type == "right"){
        var rightElement = _.max(bn.selection, function(el){
          var box = el.getBBox();
          return box.x;
        });

        var rightPosition = rightElement.getBBox().x + rightElement.getBBox().width;

        bn.selection.forEach(function(el){
          var shp = bn.getShapeByElement(el);
          var offset = rightPosition - el.getBBox().x - el.getBBox().width;
          shp.translate(offset, 0);
          //el.nt_translate(offset, 0);
        });
      }

      if (type == "top"){
        var topElement = _.min(bn.selection, function(el){
          return el.getBBox().y;
        });

        var topPosition = topElement.getBBox().y;

        bn.selection.forEach(function(el){
          var shp = bn.getShapeByElement(el);
          var offset = topPosition - el.getBBox().y;
          //el.nt_translate(0,offset);
          shp.translate(0,offset);
        });
      }

      if (type == "vcenter"){
        var ec = bn.selection.length;
        var sx = 0;
        bn.selection.forEach(function(el){
          sx = sx + el.getBBox().x;
        });

        var mid = sx/ec;
        bn.selection.forEach(function(el){
          var shp = bn.getShapeByElement(el);
          var offset = mid - el.getBBox().x;
          //el.nt_translate(offset,0);
          shp.translate(offset, 0);
        });
      }

      if (type == "bottom"){
        var bottomElement = _.max(bn.selection, function(el){
          var box = el.getBBox();
          return box.y;
        });

        var bottomPosition = bottomElement.getBBox().y + bottomElement.getBBox().height;

        bn.selection.forEach(function(el){
          var shp = bn.getShapeByElement(el);
          var offset = bottomPosition - el.getBBox().y - el.getBBox().height;
          //el.nt_translate(0,offset);
          shp.translate(0,offset);
        });
      }

      bn.dirty = true;
    };

    bn.spacing = function(type){
      if (bn.selection.length < 2) return;

      if (type == "h"){
        var leftElement = _.min(bn.selection, function(el){
          var box = el.getBBox();
          return box.x;
        });

        var leftPosition = leftElement.getBBox().x;

        var ar = _.sortBy(bn.selection, function(el){
          return -(leftPosition - el.getBBox().x); });

        var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
        var prompt = languageJson.Room3D.Edit.Prompt;
        /*"请输入物体间隔距离(cm)"*/
        bn.input(prompt.Distance,0,languageJson.InputBox).then(function(data){
          if (data.result){
            var interval = parseFloat(data.val);
            var leftSpace = 0;

            ar.forEach(function(el){
              el.nt_translate(leftPosition - el.getBBox().x,0);
              el.nt_translate(leftSpace,0);
              leftSpace = leftSpace + el.getBBox().width + interval;
            });
          }
        });
      }

      if (type == "v"){
        var topElement = _.min(bn.selection, function(el){
          var box = el.getBBox();
          return box.y;
        });

        var topPosition = topElement.getBBox().y;

        var ar = _.sortBy(bn.selection, function(el){
          return -(topPosition - el.getBBox().y); });

        var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
        var prompt = languageJson.Room3D.Edit.Prompt;
        /*"请输入物体间隔距离(cm)"*/
        bn.input(prompt.Distance,0,languageJson.InputBox).then(function(data){
          if (data.result){
            var interval = parseFloat(data.val);
            var topSpace = 0;

            ar.forEach(function(el){
              el.nt_translate(0, topPosition - el.getBBox().y);
              el.nt_translate(0, topSpace);
              topSpace = topSpace + el.getBBox().height + interval;
            });
          }
        });
      }

      bn.dirty = true;
    };

    bn.copy = function(){
      if (bn.selection.length == 0) return;

      var copyitems = [];

      bn.selection.forEach(function(el){
        var shp = bn.getShapeByElement(el);
        if (shp) copyitems.push(shp.clone());
      });

      bn.resetSelection();

      copyitems.forEach(function(shp){
        bn.shapes.push(shp);
        bn.setSelection(shp.element);
      });

      var box = bn.selection.getBBox();
      bn.selectRect = bn.paper.rect(box.x,box.y,box.width,box.height);
      bn.selectRect.attr({fill: "green"});
      bn.selectRect.attr({"fill-opacity": "0.2"});
      bn.selectRect.attr({"stroke-opacity": "0.3"});
      bn.selectRect.attr({"stroke-dasharray":"-"});
      bn.selectRect.attr({stroke: "green"});
      bn.selectRect.attr({"stroke-width": 10});
      bn.selectRect.toFront();
      bn.selectRect.draggable();
      bn.dirty = true;
    };

    bn.move = function(type){
      if (bn.selection.length < 1) return;

      if (type == "left"){
        bn.selection.forEach(function(el){
          bn.getShapeByElement(el).translate(-1,0);
          //el.nt_translate(-1,0);
        });
      }

      if (type == "right"){
        bn.selection.forEach(function(el){
          bn.getShapeByElement(el).translate(1,0);
          //el.nt_translate(1,0);
        });
      }

      if (type == "up"){
        bn.selection.forEach(function(el){
          bn.getShapeByElement(el).translate(0,-1);
          //el.nt_translate(0,-1);
        });
      }

      if (type == "down"){
        bn.selection.forEach(function(el){
          bn.getShapeByElement(el).translate(0,1);
          //el.nt_translate(0,1);
        });
      }

      bn.dirty = true;
    };

    bn.toBack = function(){
      //if (bn.selection.length < 1) return;
      bn.selection.forEach(function(el){
        el.toBack();
      });

      //floor and image can not select, so it's must be at bottom.
      var floor = _.find(bn.shapes, function(shp){
        return shp.element.sym.name == "floorPath";
      });

      if (floor) floor.element.toBack();

      var floorImage = _.find(bn.shapes, function(shp){
        return shp.element.sym.name == "floorImage";
      });

      if (floorImage) floorImage.element.toBack();
    };

    bn.toFront = function(){
      if (bn.selection.length < 1) return;
      bn.selection.forEach(function(el){
        el.toFront();
      });
    };

    var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
    var edit = languageJson.Room3D.Edit;

    bn.symbols = [
      {
        name: "cursor",
        title: edit.Cursor,/*"选择"*/
        tip: edit.CursorPrompt,/*"选中物体，可操作各种物体"*/
        icon: "/img/3d/cursor.png",
        mouseState: "default",
        cursor: "default",
        visible: true,
        initState: function(){
        }
      },
      {
        name: "pan",
        title: edit.Pan,/*"移动"*/
        tip: edit.PanPrompt,/*"拖动移动画布"*/
        icon: "/img/3d/move.png",
        mouseState: "pan",
        cursor: "default",
        visible: true,
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        initState: function(){
        }
      },
      {
        name: "pointIndicator",
        title: edit.Point,/*"点"*/
        tip: edit.PointPrompt,/*"鼠标点击提示"*/
        visible: false,
        class: "pointIndicator",
        props: {
          radius: 60
        },
        create: function (param) {
          return bn.shapeMakeup(bn.paper.circle(param.x, param.y, this.props.radius), this);
        }
      },
      {
        name: "floorImage",
        title: edit.FloorImage,/*"地板底图"*/
        tip: edit.ImagePrompt,/*"用来做地板衬底方便绘制"*/
        type: "part",
        elementType: "path",
        scale: 1,
        tempParam: null,
        create: function (param) {
          var cp = bn.getSize();
          var fx = (cp.width - param.width) / 2;
          var fy = (cp.height - param.height) / 2;
          var el = bn.paper.image(param.src, fx, fy, param.width, param.height);
          // if (param.scale) 
          // {
          //   el.scale(param.scale,param.scale);
          //   this.scale = param.scale;
          // }
          return el;
        },
        updateScale: function(element, realSize, rulerLength){
          
          var x = bn.viewBoxWidth / bn.paper.width;         
          this.scale = (100 * realSize) / (rulerLength);         

          //var y = bn.viewBoxHeight / bn.paper.height;
          element.scale(this.scale,this.scale);
          this.tempParam = {
            width : element.getBBox().width,
            height : element.getBBox().height
          };

        },
        update3DConfig: function(element, config){
          delete config['param3D'];
        },
        update2DConfig: function(element, config){          
          _.extend(config.param2D , this.tempParam);
          //config.param2D = this.tempParam;
          config.param2D.scale = this.scale;
        },
      },
      {
        name: "ruler",
        title: edit.Ruler,/*"标尺"*/
        tip: edit.RulerPrompt,/*"标尺状态: 标记地板底图尺寸用于缩放底图到适当大小"*/
        icon: "/img/3d/ruler.png",
        mouseState: "drawRuler",
        cursor: "crosshair",
        visible: true,
        class: "rulerPath",
        props:{
        },
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        create: function (param) {
          var line = bn.paper.path(["M", param.start.x, param.start.y,
            "L", param.end.x, param.end.y]);
          return bn.shapeMakeup(line, this);
        },
        initState: function () {
          var ruler = bn.findShapeBySymbolName("ruler");
          if (ruler) {
            /*"此操作将删除已经存在的标尺比例，重新计算底图缩放比例，是否继续？"*/
            bn.confirm(edit.Prompt.RulerConfirm,languageJson.ConfirmBox).then(function (data) {
              if (data === true) {
                ruler.delete();
                var imgElement =bn.findShapeBySymbolName("floorImage").element;
                imgElement.transform("");
              }
              if (data === false) bn.selectDefaultSymbol();
            });
          }
        },
        endState: function () {
          var ruler = bn.findShapeBySymbolName("ruler");
          if (ruler) {
            /*"请输入该线段对应实际长度，单位：米"*/
            bn.input(edit.Prompt.RulerInput,"0",languageJson.InputBox).then(function (data) {
              if (data.result){
                var v = parseFloat(data.val);
                if (v <= 0 || v > 9999)
                {
                  /*"输入的尺寸不正确, 请重新绘制"*/
                  bn.info(edit.Prompt.RulerInfo,languageJson.MessageBox);
                  ruler.delete();
                  return;
                }

                var imgElement =bn.findShapeBySymbolName("floorImage").element;
                imgElement.sym.updateScale(imgElement, v,
                  ruler.element.getTotalLength());
              }
              
              ruler.delete();

            });
          }
        },
        update3DConfig: function(element, config){
          delete config['param3D'];
        },
        update2DConfig: function(element, config){
          config.param2D.start = {};
          config.param2D.start.x = element.getBBox().x;
          config.param2D.start.y = element.getBBox().y;
          config.param2D.end = {};
          config.param2D.end.x = element.getBBox().x + element.getBBox().width;
          config.param2D.end.y = element.getBBox().y + element.getBBox().height;
        }
      },
      {
        name: "floorPath",
        title: edit.FloorPath,/*"地板"*/
        tip: edit.PathPrompt,/*"画地板状态: 画矩形封闭区域，点三点形成矩形"*/
        icon: "/img/3d/Floor2.png",
        mouseState: "drawWall",
        cursor: "crosshair",
        unit: "floor",
        moldId:"wallpath-default",
        visible: true,
        style:{
          "stroke":"#28a4c9",
          "stroke-width":"40",
          "stroke-linejoin":"round",
          "stroke-linecap": "round",
          "pointer-events": "all",
          "fill-opacity":"0.5",
          "fill":"#b9def0"
        },
        create: function (param) {
          return bn.shapeMakeup(bn.paper.path(param.path), this);
        },
        update: function(cfg, element){
          var mold = _.find(molds, function(m){
            return m.id == cfg.param3D.moldId; });

          if (cfg.param2D.angle) element.animate({
            transform:"r" + cfg.param2D.angle }, 500);

          element.animate({"stroke-width": mold.size.width }, 500);
        },
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        endState: function (){
          if (_.isUndefined(bn.temp.wallCache)) return;
          if (_.isUndefined(bn.temp.wallCache.ps)) return;
          bn.temp.wallCache.ps.forEach(function(shp){
            shp.delete();
          });

          //因为只能绘制矩形地板的原因，需对结果Path进行计算
          //只能点3个点，用直角折线形成精确的第三点并封闭来构成真正的矩形

          var startPoint = {};
          var endSegment = "";
          var index = 0;

          var floorLine = _.reduce(bn.temp.wallCache.line.attrs.path, function (ps, segment) {

            if (index == 3) return ps;
            index ++;

            if (segment[0] == "M") {
              ps = "M " + segment[1] + " " + segment[2];
              startPoint.x = segment[1];
              startPoint.y = segment[2];
            }

            if (segment[0] == "H") {
              ps = ps + " H " + segment[1];
              if (index == 3) endSegment = " V " + startPoint.y + " Z ";
            }

            if (segment[0] == "V") {
              ps = ps + " V " + segment[1];
              if (index == 3) endSegment = " H " + startPoint.x + " Z ";
            }

            return ps;
          }, "");

          if (index == 3) floorLine = floorLine + endSegment;
          //console.log(floorLine);
          var shp = bn.addShape("floorPath", {path: floorLine});
          bn.toBack();
          bn.temp.wallCache.line.remove();
          bn.temp.wallCache = undefined;

          //this.update2DConfig(shp.element, shp.config);
          //this.update3DConfig(shp.element. shp.config);
        },
        calcCenter: function(element){
          var fp = element;
          if (fp) {
            var ps = fp.attr("path");
            var w, h;
            var sx,sy,mx,my;

            var sx = parseFloat(ps[0][1]);
            var sy = parseFloat(ps[0][2]);

            if (ps[1][0] === "H")
              mx = parseFloat(ps[1][1]);
            else
              mx = parseFloat(ps[2][1]);

            if (ps[1][0] === "V")
              my = parseFloat(ps[1][1]);
            else
              my = parseFloat(ps[2][1]);
          }

          w = Math.abs(mx - sx);
          h = Math.abs(my - sy);

          bn.center2D = {};
          bn.center2D.x = sx + w / 2;
          bn.center2D.y = sy + h / 2;
        },
        initState: function(){
          bn.enablePan = false;
          var fp = bn.findShapeBySymbolName("floorPath");
          if (fp) {
            /*"地板只允许有一个，确定重新绘制？"*/
            bn.confirm(edit.Prompt.FloorConfirm,languageJson.ConfirmBox).then(function (data) {
              if (data === true) {
                fp.delete();
              }
              else
                bn.selectDefaultSymbol();
            });
          }
          else{
            /*"点击三个点形成直角折线来自动形成矩形地板"*/
            bn.info(edit.Prompt.FloorInfo,languageJson.MessageBox);
          }
        },
        update2DConfig: function(element, config){
          //todo: when moved all path string changed to 'c'
          config.param2D.path = element.attr("path").toString();
        },
        update3DConfig: function(element, config) {
          config.param3D.floorTexture = "/img/3d/floor05.png";

          var fp = element;
          if (fp) {
            var ps = fp.attr("path");
            var w, h;
            var sx,sy,mx,my;

            var sx = parseFloat(ps[0][1]);
            var sy = parseFloat(ps[0][2]);

            if (ps[1][0] === "H")
              mx = parseFloat(ps[1][1]);
            else
              mx = parseFloat(ps[2][1]);

            if (ps[1][0] === "V")
              my = parseFloat(ps[1][1]);
            else
              my = parseFloat(ps[2][1]);
          }

          w = Math.abs(mx - sx);
          h = Math.abs(my - sy);
          config.param3D.floorWidth = w;
          config.param3D.floorHeight = h;

          bn.center2D = {};
          bn.center2D.x = sx + w / 2;
          bn.center2D.y = sy + h / 2;

        }
      },
      {
        name: "wallPath",
        title: edit.WallPath,/*"墙壁"*/
        tip: edit.WallPrompt,/*"画墙状态：鼠标点击画墙等折线路径物体"*/
        icon: "/img/3d/wall.png",
        mouseState: "drawWall",
        unit: "wallPath",
        moldId:"wallpath-default",
        cursor: "crosshair",
        visible: true,
        style:{
          "stroke":"#28a4c9",
          "stroke-width":"40",
          "stroke-linejoin":"round",
          "stroke-linecap": "round",
          "pointer-events": "all",
          "fill-opacity":"0.5",
          "fill":"#b9def0"
        },
        update: function(cfg, element){
          var mold = _.find(molds, function(m){
            return m.id == cfg.param3D.moldId; });

          if (cfg.param2D.angle) element.animate({
            transform:"r" + cfg.param2D.angle }, 500);

          element.animate({"stroke-width": mold.size.width }, 500);
        },
        create: function (param) {
          //this.linePath = param.path;
          return bn.shapeMakeup(bn.paper.path(param.path), this);
        },
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        endState: function (){
          if (_.isUndefined(bn.temp.wallCache)) return;
          if (_.isUndefined(bn.temp.wallCache.ps)) return;
          bn.temp.wallCache.ps.forEach(function(shp){
            shp.delete();
          });
          bn.addShape("wallPath", bn.temp.wallCache);

          bn.temp.wallCache.line.remove();
          bn.temp.wallCache = undefined;
        },
        update2DConfig: function(element, config){
          if (config.param2D.pathArray)
          {
            var oldPath = bn.paper.path(config.param2D.pathArray.toString());
            // var pathOffset = {
            //   x: element.getBBox().x - oldPath.getBBox().x,
            //   y: element.getBBox().y - oldPath.getBBox().y
            // };

            // var newX = parseFloat(element.realPath[0][1]) + pathOffset.x;
            // var newY = parseFloat(element.realPath[0][2]) + pathOffset.y;

            var pathNew = oldPath.attrs.path.slice(0);

            pathNew[0][1] = element.getBBox().x;
            pathNew[0][2] = element.getBBox().y;

            config.param2D.path = pathNew.toString();
            config.param2D.pathArray = pathNew;

            oldPath.remove();
          }
          else if (element.attrs.path){
            config.param2D.path = element.attrs.path.toString();            
            config.param2D.pathArray = element.attrs.path;
          }
        },
        update3DConfig: function(element, config){
          var ps = config.param2D.pathArray;
          var lines = bn.util.get3DLinesBySegments(ps, 10);
          config.param3D.lines = lines;
        }
      },
      {
        name: "door",
        title: edit.Door,/*"门窗"*/
        tip: edit.DoorPrompt,/*"画门窗状态：在墙上鼠标点击的位置放置门窗"*/
        icon: "/img/3d/door.png",
        mouseState: "drawWallPart",
        unit: "door",
        moldId:"door-default",
        visible: true,
        cursor:"crosshair",
        style:{
          "fill": "#FF8080"
        },
        props: {
          width: 190,
          height: 30
        },
        create: function (param) {
          var rect;
          if (param.type === "Y") {
            rect = bn.paper.rect(param.x, param.y, this.props.width, this.props.height);
          }
          else {
            rect = bn.paper.rect(param.x, param.y, this.props.height, this.props.width);
          }
          return bn.shapeMakeup(rect, this);
        },
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        update: function(cfg, element){
          var mold = _.find(molds, function(m){
            return m.id == cfg.param3D.moldId; });

          if (cfg.param2D.angle) element.animate({
            transform:"r" + cfg.param2D.angle }, 500);

          if (element.attrs.width > element.attrs.height)
          {
            element.animate({
              width:mold.size.width,
              height:mold.size.depth
            }, 500);
          }
          else
          {
            element.animate({
              width:mold.size.depth,
              height:mold.size.width
            }, 500);
          }
        },
        update2DConfig: function(element, config){
          config.param2D.x = element.getBBox().x;
          config.param2D.y = element.getBBox().y;
          if (element.attrs.width > element.attrs.height)
            config.param2D.type = "Y";
          else
            config.param2D.type = "X";
        },
        update3DConfig: function(element, config){

          var c = bn.util.boxCenter(element);
          config.param3D.position = bn.util.Point3D(c);
          config.param3D.position.y = parseFloat(config.param3D.aboveGround);

          if (element.attrs.width > element.attrs.height)
            config.param3D.direct = "X";
          else
            config.param3D.direct = "Z";
        }
      },
      {
        name: "rack",
        title: edit.Rack,/*"机架"*/
        tip: edit.RackPrompt,/*"放置机架等盒状物体"*/
        icon: "/img/3d/rack.jpg",
        cursor:"url('/img/3d/object.cur'), default",
        mouseState: "drawShape",
        visible: true,
        unit: "rack",
        moldId:"rack-default",
        style:{
          "fill": "blue",
          "fill-opacity":"0.5",
          "stroke": "#437ded",
          "stroke-width":10,
          "pointer-events":"all"
        },
        props: {
          width: 70,
          depth: 100,
          height: 220
        },
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        create: function (param) {
          var rect = bn.paper.rect(param.x, param.y,
            this.props.width, this.props.depth);
          return bn.shapeMakeup(rect, this);
        },
        update: function(cfg, element){
          var mold = _.find(molds, function(m){
            return m.id == cfg.param3D.moldId; });

          if (cfg.param2D.angle) element.animate({
            transform:"R" + cfg.param2D.angle }, 600);

          element.animate({
            width:mold.size.width,
            height:mold.size.depth
          }, 500);
        },
        update2DConfig: function(element, config){
          //element.animate({transform:""}, 10); 

          config.param2D.x = element.attrs.x;
          config.param2D.y = element.attrs.y;


        },
        update3DConfig: function(element, config){
          var c = bn.util.boxCenter(element);
          config.param3D.position = bn.util.Point3D(c);
        }
      },
      //{
      //  name: "camera",
      //  title: "摄像头",
      //  tip: "放置摄像头在鼠标点击位置",
      //  icon: "/img/3d/camera.jpg",
      //  cursor:"url('/img/3d/object.cur'), default",
      //  mouseState: "drawShape",
      //  visible: true,
      //  style:{
      //    "stroke": "#ed4f44",
      //    "stroke-width":"10",
      //    "fill-opacity":"0.5",
      //    "fill":"red"
      //  },
      //  props: {
      //    radius: 30
      //  },
      //  handleKey : function (key){
      //    if (key === "ESC"){
      //      bn.selectDefaultSymbol();
      //    }
      //  },
      //  create: function (param) {
      //    return bn.shapeMakeup(bn.paper.circle(param.x, param.y, this.props.radius), this);
      //  },
      //  update2DConfig: function(element, config){
      //    config.param2D.x = element.getBBox().x;
      //    config.param2D.y = element.getBBox().y;
      //  },
      //  update3DConfig: function(element, config){
      //    config.param3D = {
      //      "unit": "camera",
      //      "angle": 0,
      //      "high": 300,
      //      "position":{x:0,y:0,z:0}
      //    };
      //    var c = bn.util.boxCenter(element);
      //    config.param3D.position = bn.util.Point3D(c);
      //    config.param3D.position.y = config.param3D.high;
      //  }
      //},
      {
        name: "flat",
        title: edit.Flat,/*"装饰"*/
        tip: edit.FlatPrompt,/*"放置平面图形到3D画布"*/
        icon: "/img/3d/plant.png",
        cursor:"url('/img/3d/object.cur'), default",
        mouseState: "drawShape",
        unit:"flat",
        moldId: "flat-default",
        visible: true,
        style:{
          "stroke": "#ed4fee",
          "stroke-width":"10",
          "fill-opacity":"0.5",
          "fill":"yellow"
        },
        props:{
          "width":"100",
          "depth":"100"
        },
        handleKey : function (key){
          if (key === "ESC"){
            bn.selectDefaultSymbol();
          }
        },
        create: function (param) {
          var rect = bn.paper.rect(param.x, param.y,
            this.props.width, this.props.width);
          return bn.shapeMakeup(rect, this);
        },
        update2DConfig: function(element, config){
          config.param2D.x = element.getBBox().x;
          config.param2D.y = element.getBBox().y;
          config.param2D.width = element.getBBox().width;
        },
        update: function(cfg, element){
          var mold = _.find(molds, function(m){
            return m.id == cfg.param3D.moldId; });

          element.animate({
            width:mold.size.width,
            height:mold.size.width
          }, 500);
        },
        update3DConfig: function(element, config){
          var c = bn.util.boxCenter(element);
          config.param3D.position = bn.util.Point3D(c);
          config.param3D.position.y = config.param3D.high;
        }
      }
    ];

    bn.shapeClass = {
      newConfig:function(){
        var that = this;
        if (!this.config)
        {
          this.config = {};
          this.config.name = this.element.sym.name;
          this.config.title = this.element.sym.title;

          this.config.param2D = {};
          this.config.param2D.symbol = this.element.sym.name;
          this.config.param2D.angle = 0;

          this.config.param3D = {};
          this.config.param3D.unit = this.element.sym.unit;
          this.config.param3D.moldId = this.element.sym.moldId;
          this.config.param3D.angle = 0;
          this.config.param3D.aboveGround = 0;

          this.config.param3D.bindings = [];
        }
        this.config.id = this.element.id;
      },
      getBindingTitle:function(){
        if (!this.config.param3D.bindings) return "无";
        var str = "<ul>";
        this.config.param3D.bindings.forEach(function(item){
          str = str + "<li>" + item.title + "</li>";
        });
        var str = str + "</ul>";
      },
      translate:function(dx,dy){
        if (this.element.matrix.split().rotate)
        {
          this.element.transform('');
        }
        this.element.nt_translate(dx,dy);
        this.updateLook();
      },
      updateLook:function(){
        if (this.element.sym)
        {
          if (this.element.sym.update){
            this.element.sym.update(this.config, this.element);
          }
        }
      },
      updateConfig:function(){
        var that = this;
        if (that.element.sym)
        {
          if (that.element.sym.update2DConfig)
            that.element.sym.update2DConfig(that.element,that.config);
          if (that.element.sym.update3DConfig)
            that.element.sym.update3DConfig(that.element,that.config);
        }
      },
      delete:function(){
        bn.shapes = _.without(bn.shapes, this);
        if (this.element.glowEffect)
          this.element.glowEffect.remove();
        this.element.remove();
        bn.proofer.resetUI();
        bn.resetSelection();
        bn.dirty = true;
      },
      resetStyle:function(){
        var that = this;
        if (that.element.sym.style)
        {
          for(var a in that.element.sym.style)
          {
            if (a == "stroke-width" && that.element.sym.name == "wallPath") continue;
            that.element.attr(a, that.element.sym.style[a]);
          }
        }
      },
      clone:function(){
        var that = this;
        var ns = _.extend({}, that);

        ns.config = angular.fromJson(angular.toJson(that.config));
        ns.element = that.element.clone();
        ns.config.id = that.element.id;
        ns.element.sym = _.extend({}, that.element.sym);
        ns.selected = that.selected;

        if (that.element.sym.class !== "floorPath")
          ns.element.draggable();
        return ns;
      }
    };

    bn.util = {};
    bn.util.Point3D = function(point2D){
      var p ={};
      if (bn.center2D)
      {
        p.x = point2D.x - bn.center2D.x;
        p.z = point2D.y - bn.center2D.y;
      }
      else{
        p.x = point2D.x;
        p.z = point2D.y;
      }
      return p;
    };

    bn.util.boxCenter = function(el){
      var box = el.getBBox();

      var p = {x: box.x + box.width / 2 , y:box.y + box.height / 2};

      return p;
    };

    bn.util.get3DLinesBySegments = function (segs, y) {
      var lastX, lastY;

      var lines = [];

      var parr = _.reduce(segs, function (ps, segment) {
        var point = {};

        if (segment[0] == "M") {
          point.x = parseFloat(segment[1]);
          point.y = parseFloat(segment[2]);
          lastX = point.x;
          lastY = point.y;
        }

        if (segment[0] == "H") {
          point.x = parseFloat(segment[1]);
          point.y = lastY;
          lastX = point.x;
        }

        if (segment[0] == "V") {
          point.y = parseFloat(segment[1]);
          point.x = lastX;
          lastY = point.y;
        }

        var p3 = bn.util.Point3D(point);
        p3.y = parseFloat(y);

        var startPoint = ps[ps.length - 1];

        if (startPoint)
        {
          var line = {
            start: startPoint,
            end: p3
          };

          lines.push(line);
        }

        ps.push(p3);
        return ps;
      }, []);

      return lines;
    };

    bn.proofer = {
      showSettings: function(shapes, setting){
        //single:
        if (_.isUndefined(shapes)) return;
        bn.proofer.shapes = shapes;
        bn.proofer.setting = setting;
        if (shapes.length == 1){
          var shp = shapes[0];
          if (!shp.config) shp.newConfig();
          setting.title = shp.config.title;
          setting.angle = shp.config.param2D.angle;
          setting.aboveGround = shp.config.param3D.aboveGround;
          setting.molds = this.getMolds(shp.element.sym.name);
          setting.mold = _.find(setting.molds,
            function(m){ return m.id == shp.config.param3D.moldId; });
          setting.bindings = shp.config.param3D.bindings;
        }

        if (shapes.length > 1){
          var allSame = true; var ns = [];
          ns.push(shapes[0].element.sym.name);
          shapes.forEach(function(shp){
            if (!_.contains(ns, shp.element.sym.name))
              allSame = false;
          });

          if (allSame){
            setting.molds = this.getMolds(shapes[0].element.sym.name);
          }
          else
            setting.molds = undefined;

          setting.title = undefined;
          setting.angle = undefined;
          setting.aboveGround = undefined;
          setting.mold = undefined;
          setting.bindings = [];
        }
      },
      resetUI: function(){
        if (bn.proofer.setting){
          bn.proofer.setting.molds = undefined;
          bn.proofer.setting.title = undefined;
          bn.proofer.setting.angle = undefined;
          bn.proofer.setting.aboveGround = undefined;
          bn.proofer.setting.mold = undefined;
          bn.proofer.setting.bindings = [];
        }
      },
      getMolds: function(symbolName){
        var ms = [];
        molds.forEach(function(m){
          if (m.name === symbolName) ms.push(m);
        });
        return ms;
      },
      saveShapes: function(shapes, setting){
        if (shapes.length == 1){
          var shp = shapes[0];
          if (shp.config)
          {
            shp.config.title = setting.title;
            shp.config.param2D.angle = parseFloat(setting.angle);
            shp.config.param3D.angle = parseFloat(setting.angle);
            shp.config.param3D.moldId = setting.mold.id;
            shp.config.param3D.aboveGround = parseFloat(setting.aboveGround);
            shp.config.param3D.bindings = setting.bindings;
            shp.updateLook();
          }
        }
        if (shapes.length > 1){
          var allSame = true; var ns = [];
          ns.push(shapes[0].element.sym.name);
          shapes.forEach(function(shp){
            if (!_.contains(ns, shp.element.sym.name))
              allSame = false;
          });

          shapes.forEach(function(shp){
            if (setting.title)
              shp.config.title = setting.title;
            if (setting.angle)
            {
              shp.config.param2D.angle = parseFloat(setting.angle);
              shp.config.param3D.angle = parseFloat(setting.angle);
            }
            if (allSame){
              if (setting.mold){
                shp.config.param3D.moldId = setting.mold.id;
              }
            }

            if (setting.aboveGround)
              shp.config.param3D.aboveGround = parseFloat(setting.aboveGround);
            shp.updateLook();
          });

        }
      },
      //rend: function(shapes, setting){
      //
      //  //when focus lose or save, save config to shape
      //  this.updateShapes(shapes,setting);
      //
      //  //3 load proof by shape's mold define
      //  //4 user can use set in template or modify it
      //  //multiple:
      //  //1 if shape's symbol is same, they can change style (not binding)
      //  //2 when focus lose or save, save copied config to each shape
      //},
      proofs:[
        {
          type:"rack",
          load: function(shape, setting){

          },
          save: function(shape, setting){

          }
        }
      ]
    };

    (function(R) {
      R.el.draggable = function(move, start, up) {
        this._ui = this._ui || {};

        var that = this;

        this._ui.onMove = R.is(move, 'function') ?
          move : function(distanceX, distanceY, x, y, deltaX, deltaY) {

          if (that.sym){
            if (that.sym.name == "floorPath") return;
            if (that.sym.name == "wallPath") return;
          }

          bn.dirty = true;
          bn.update();
          if (that === bn.selectRect)
          {
            that.translate(deltaX, deltaY);
            bn.shapes.forEach(function(shp){
              if (shp.selected)
              {
                if (shp.element.matrix.split().rotate)
                {
                  that._ui.rotatestr = "r"+shp.element.matrix.split().rotate;
                  shp.element.transform('');
                }

                shp.element.nt_translate(deltaX,deltaY);
              }
            });
          }
          else{
            if (that.sym){
              if (that.matrix.split().rotate)
              {
                that._ui.rotatestr = "r"+ that.matrix.split().rotate;
                that.transform('');
              }

              that.nt_translate(deltaX,deltaY);
            }
          }
        };

        this._ui.onStart = R.is(start, 'function') ? start : function(x, y) {
          if (bn.mouseState !== "default") return;
          //if (that.glowEffect) that.glowEffect.remove();
          $(bn.domId).css( 'cursor', "url('/img/3d/hand-pull-darkblue.cur'), default");
        };

        function onMove(distanceX, distanceY, x, y) {
          if (bn.mouseState !== "default") return;
          var cp = bn.canvasPoint(x, y);
          var deltaX = cp.x - that._ui.lastX;
          var deltaY = cp.y - that._ui.lastY;
          that._ui.lastX = cp.x;
          that._ui.lastY = cp.y;
          //if (that.glowEffect) that.glowEffect.remove();
          that._ui.onMove(distanceX, distanceY, x, y, deltaX, deltaY);
          that.paper.safari();
        }

        function onStart(x, y) {
          if (bn.mouseState !== "default") return;
          if (that.sym)
            if (that.sym.name == "floorPath") return;

          var cp = bn.canvasPoint(x, y);
          that._ui.lastX = cp.x;
          that._ui.lastY = cp.y;

          //if (that.glowEffect) that.glowEffect.remove();
          that._ui.onStart(x, y);
        }

        function onUp(e){
          if (that.sym){
            bn.getShapeByElement(that).updateLook();
          }
          $(bn.domId).css( 'cursor', "auto" );
        }

        return this.drag(onMove, onStart, onUp);
      };
    })(Raphael);

    (function() {
      /** define 2 custom attributes translateNT and scaleNT (relative attributes) */
      var initCA = function(shape) {
        if(!shape.paper.customAttributes["translateNT"]) {

          shape.paper.customAttributes["translateNT"] = function(dx, dy) {
            if (this.type == "circle" || this.type == "ellipse") {
              return {
                "cx" : this.attr("cx") + dx,
                "cy" : this.attr("cy") + dy
              };
            } else if (this.type == "rect" || this.type == "text"
              || this.type == "image") {
              return {
                "x" : this.attr("x") + dx,
                "y" : this.attr("y") + dy
              };
            } else if (this.type == "path") {
              var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
              matrix.translate(dx, dy);
              var newPath = Raphael.mapPath(this.attr("path"), matrix);
              this.attr({
                "path" : newPath
              });
            }
          };

          shape.paper.customAttributes["scaleNT"] = function(dx, dy) {

            if (this.type == "circle") {
              return {
                "r" : this.attr("r") * Math.max(dx, dy)
              };
            } else if (this.type == "ellipse") {
              return {
                "rx" : this.attr("rx") * dx,
                "ry" : this.attr("ry") * dy
              };
            } else if (this.type == "rect" || this.type == "image") {
              return {
                "width" : this.attr("width") * dx,
                "height" : this.attr("height") * dy
              };
            } else if (this.type == "text") {
              var fs = parseInt(this.attr("font-size") + "");
              return {
                "font-size" : fs * Math.max(dx, dy)
              };
            } else if (this.type == "path") {
              var bb = this.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y
                + bb.height / 2;
              var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
              matrix.scale(dx, dy, cx, cy);
              var newPath = Raphael.mapPath(this.attr("path"), matrix);
              return {
                "path" : newPath
              };
            }
          }


        }
      };
      Raphael.el.nt_translate = function(dx, dy) {
        initCA(this);
        if (this.type == "circle" || this.type == "ellipse") {
          this.attr({
            "cx" : this.attr("cx") + dx,
            "cy" : this.attr("cy") + dy
          });
        } else if (this.type == "rect" || this.type == "text"
          || this.type == "image") {
          this.attr({
            "x" : this.attr("x") + dx,
            "y" : this.attr("y") + dy
          });
        } else if (this.type == "path") {
          var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
          matrix.translate(dx, dy);
          var newPath = Raphael.mapPath(this.attr("path"), matrix);
          this.attr({
            "path" : newPath
          });
        }
        return this;
      };
      Raphael.el.nt_scale = function(dx, dy) {
        initCA(this);
        if (this.type == "circle") {
          this.attr({
            "r" : this.attr("r") * Math.max(dx, dy)
          });
        } else if (this.type == "ellipse") {
          this.attr({
            "rx" : this.attr("rx") * dx,
            "ry" : this.attr("ry") * dy
          });
        } else if (this.type == "rect" || this.type == "image") {
          this.attr({
            "width" : this.attr("width") * dx,
            "height" : this.attr("height") * dy
          });
        } else if (this.type == "text") {
          var fs = parseInt(this.attr("font-size") + "");
          this.attr({
            "font-size" : fs * Math.max(dx, dy)
          });
        } else if (this.type == "path") {
          var bb = this.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y
            + bb.height / 2;
          var matrix = Raphael.matrix(1, 0, 0, 1, 0, 0);
          matrix.scale(dx, dy, cx, cy);
          var newPath = Raphael.mapPath(this.attr("path"), matrix);
          this.attr({
            "path" : newPath
          });
        }
        return this;
      }

      Raphael.st.nt_translate = function(dx, dy) {
        initCA(this);
        this.forEach(function(shape, idx) {
          shape.nt_translate(dx, dy);
          return true;
        });
        return this;
      };
      Raphael.st.nt_scale = function(dx, dy) {
        initCA(this);
        this.forEach(function(shape, idx) {
          shape.nt_scale(dx, dy);
          return true;
        });
        return this;
      };
    })();

    //add reference service from outside
    bn.inject = function(){
      bn.$scope = bn.options.shell.$scope;
      bn.$modal = bn.options.shell.$modal;
      bn.$q = bn.options.shell.$q;
      bn.$srv = bn.options.shell.$srv;
      bn.$upload = bn.options.shell.$upload;

      bn.$scope.setting = {};
      bn.$scope.$on('shapeSelected', function(e, shapes) {
        bn.proofer.showSettings(shapes, bn.$scope.setting);
        if(!bn.$scope.$$phase) {
          bn.$scope.$apply();
        }
      });

      bn.$scope.$on('resetShape', function(e, shapes) {
        bn.proofer.saveShapes(shapes, bn.$scope.setting);
        if(!bn.$scope.$$phase) {
          bn.$scope.$apply();
        }
      });

      bn.$scope.change = function(){
        bn.dirty = true;
        bn.proofer.saveShapes(bn.proofer.shapes, bn.$scope.setting);
        if(!bn.$scope.$$phase) {
          bn.$scope.$apply();
        }
      };
    };

    bn.update = function(){
      if(!bn.$scope.$$phase) {
        bn.$scope.$apply();
      }
    };

    bn.input = function(msg, inputValue, inputBox){
      var deferred = bn.$q.defer();
      var $modalScope = bn.$scope.$new(true);
      $modalScope.message = msg;
      $modalScope.inputValue = inputValue;

      $modalScope.ok = function (){
        deferred.resolve({val:this.inputValue, result:true});
        this.$hide();
      };

      $modalScope.cancel = function (){
        deferred.resolve({val:undefined, result:false});
        this.$hide();
      };

      if($modalScope.languageJson == undefined)
        $modalScope.languageJson = {};
      $modalScope.languageJson.InputBox = inputBox;

      bn.$modal({scope: $modalScope,
        templateUrl: '/partials/inputBox.html',
        show: true});

      return deferred.promise;
    };

    bn.option = function(){
      var imgShape, floorShape;

      var $modalScope = bn.$scope.$new(false);
      $modalScope.m = {};

      var getMolds= function(symbolName){
        var ms = [];
        molds.forEach(function(m){
          if (m.name === symbolName) ms.push(m);
        });
        return ms;
      };

      var load= function(){
        imgShape = _.find(bn.shapes, function(shp){
          return shp.config.name == "floorImage";
        });

        if (imgShape)
        {
          $modalScope.m.img = imgShape.config.param2D.src;
        }
        
        floorShape = _.find(bn.shapes, function(shp){
          return shp.config.name == "floorPath";
        });
        if (floorShape){
          $modalScope.floorDisable = false;

          $modalScope.m.mold= _.find(molds,
            function(m){ return m.id == floorShape.config.param3D.moldId; });
        }
        else
          $modalScope.floorDisable = true;
      };

      $modalScope.walltype = false;
      $modalScope.molds = getMolds("wallPath");
      load();
      $modalScope.change = function(){
        if ($modalScope.m.mold){
          floorShape.config.param3D.moldId = $modalScope.m.mold.id;
          floorShape.updateLook();
        }

        bn.dirty = true;
      };

      $modalScope.$on("fileSelected",
            function(event, msg) {
                $modalScope.file = msg;
            });
      $modalScope.$on("fileSelected2",
            function(event, msg) {
                $modalScope.file2 = msg;
            });

      $modalScope.upload = function() {
            var file = $modalScope.file;

            if (file === undefined) return;

            bn.$upload.uploadFile($modalScope.file).then(function(data) {
                if ($modalScope.m.img) bn.$upload.deleteUploadFile($modalScope.m.img);
                $modalScope.m.img = data;
                bn.setBackground(data);
            });
      };

      $modalScope.ok = function (){
        this.$hide();
      };

      bn.$modal({scope: $modalScope,
        templateUrl: '/partials/pageOption.html',
        show: true});
    };

    bn.setBackground = function(imgurl) {
      var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
      var edit = languageJson.Room3D.Edit;
      var img = new Image();
      img.src = imgurl;
      img.onload = function() {
        var cfg = {
          "id": "0",
          "name": "floorImage",
          "title": edit.FloorImage,
          "param2D": {
            "symbol": "floorImage",
            "src": imgurl,
            "height": this.height,
            "width": this.width,
            "transparent": "0.4"
          }
        };/*"地板底图"*/

        var old = bn.findShapeBySymbolName("floorImage");
        if (old) old.delete();

        var shp = bn.addShape("floorImage", cfg.param2D);
        if (shp) {
          shp.config = cfg;
          shp.updateLook();
        }
      }
    };

    bn.setBinding = function(bs){
      if (!bs) return;
      var $modalScope = bn.$scope.$new(true);

      var echo= function(){
        bs.forEach(function(item){
          var dev = _.find($modalScope.data.devices,
            function(d){ return d.id === item.id; });
          if (dev) $modalScope.data.selecteds.push(dev);
        })
      };

      $modalScope.data = {};
      $modalScope.data.selecteds = [];
      bn.$srv.getBinding().then(function(data){
        $modalScope.data.devices = data;    
        echo();
      });

      $modalScope.ok = function (){
        bs.length = 0;
        $modalScope.data.selecteds.forEach(function(item){
         bs.push(item);
        });
        bn.dirty = true;
        this.$hide();
      };

      $modalScope.deleteBind = function (){
        bs.length = 0;
        bn.dirty = true;
        this.$hide();
      };

      var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));
      if($modalScope.languageJson == undefined)
        $modalScope.languageJson = {Configuration:{TextControl:{}}};
      $modalScope.languageJson.Configuration.TextControl.BindingSettings = languageJson.Configuration.TextControl.BindingSettings;

      bn.$modal({scope: $modalScope,
        templateUrl: '/partials/bindingDlg.html',
        show: true});
    };

    bn.confirm = function(msg,confirmBox){
      var deferred = bn.$q.defer();
      var $modalScope = bn.$scope.$new(true);
      $modalScope.message = msg;
      $modalScope.ok = function (){
        deferred.resolve(true);
        this.$hide();
      };

      $modalScope.cancel = function (){
        deferred.resolve(false);
        this.$hide();
      };

      if($modalScope.languageJson == undefined) $modalScope.languageJson = {};
      $modalScope.languageJson.ConfirmBox = confirmBox;

      bn.$modal({scope: $modalScope,
        templateUrl: '/partials/confirmBox.html',
        show: true});

      return deferred.promise;
    };

    bn.info = function(msg,messageBox){
      var $modalScope = bn.$scope.$new(true);
      $modalScope.message = msg;

      if($modalScope.languageJson == undefined) $modalScope.languageJson = {};
      $modalScope.languageJson.MessageBox = messageBox;

      bn.$modal({scope: $modalScope,
        templateUrl: '/partials/messageBox.html',
        show: true});
    };

    bn.uploadConfig = function(cfg){
      bn.$srv.saveConfig("demo", angular.toJson(cfg));
    };

    bn.ev = function(event, obj){
      bn.$scope.$emit(event, obj);
    };

    bn.local = function(key){
      var languageJson = angular.fromJson(sessionStorage.getItem('languageJson'));

      var zh ={
        new: "新建",
        save: "保存",
        clone: "复制并粘贴",
        delete: "删除",
        page_option: "画面设置",
        align_top: "上对齐",
        align_bottom: "下对齐",
        align_vcenter: "水平居中",
        align_left: "左对齐",
        align_hcenter: "垂直居中",
        align_right: "右对齐",
        align_vscale: "垂直等间距",
        align_hscale: "水平等间距",
        to_back: "移动到最下层",
        to_front: "移动到最上层",
        move_up: "向上移动物体",
        move_down: "向下移动物体",
        move_left: "向左移动物体",
        move_right: "向右移动物体"
      };

      var lan = undefined;
      if(languageJson.Room3D.Head)
        lan = languageJson.Room3D.Head;
      else
        lan = zh;


      for(var a in lan)
      {
        if (a == key) return lan[a];
      }

      return null;
    };

    bn.dispose = function(){
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

      $(window).off();
      $(window).unbind();
      $(document).off();
      $(document).unbind();
      $(bn.domId).off();
      $(bn.domId).unbind();

      bn.clear();
      bn.paper.clear();

      var clearPaper = function (paper){
        var paperDom = paper.canvas;
        paperDom.parentNode.removeChild(paperDom);
      };

      clearPaper(bn.paper);
      disposeObject(bn.paper);
      bn.paper = undefined;

      delete bn.options;
      bn.$scope.change = undefined;
      bn.$scope = undefined;
      bn.$modal = undefined;
      bn.$q = undefined;
      bn.$srv = undefined;
      bn.$upload = undefined;
      disposeObject(bn);
      bn = undefined;
    };

    /////////  create main code here  /////////
    bn.options = _.extend(bn.options, options);
    bn.inject();

    bn.init(id);

    bn.newConfig();

    return bn;
  }
};
