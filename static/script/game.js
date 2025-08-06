'use strict';
/*!
 * Meeting Monster - Game Engine
 * Based on Pacman by HaoLe Zheng
 * 
 * Original source: https://passer-by.com/pacman/
 * Licensed under MIT License
 * https://github.com/mumuy/pacman/blob/master/LICENSE
*/

/*
* Mini Game Engine
*/

// requestAnimationFrame polyfill
if (!Date.now)
Date.now = function() { return new Date().getTime(); };
(function() {
    'use strict';
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
            nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

function Game(id,params){
    var _ = this;
    var settings = {
        width:960,						//Canvas width
        height:640						//Canvas height
    };
    Object.assign(_,settings,params);
    var $canvas = document.getElementById(id);
    $canvas.width = _.width;
    $canvas.height = _.height;
    var _context = $canvas.getContext('2d');	//Canvas context environment
    var _stages = [];							//Stage object queue
    var _events = {};							//Event collection
    var _index=0,								//Current stage index
        _hander;  								//Frame animation control
    //Active object constructor
    var Item = function(params){
        this._params = params||{};
        this._id = 0;               //Identifier
        this._stage = null;         //Bind to parent stage
        this._settings = {
            x:0,					//Position coordinate: x-coordinate
            y:0,					//Position coordinate: y-coordinate
            width:20,				//Width
            height:20,				//Height
            type:0,					//Object type, 0=normal object (not bound to map), 1=player controlled, 2=program controlled
            color:'#F00',			//Identification color
            status:1,				//Object status, 0=inactive/ended, 1=normal, 2=paused, 3=temporary, 4=error
            orientation:0,			//Current orientation, 0=right, 1=down, 2=left, 3=up
            speed:0,				//Movement speed
            //Map related
            location:null,			//Location map, Map object
            coord:null,				//If object is bound to map, set map coordinates; if not, set position coordinates
            path:[],				//NPC automatic walking path
            vector:null,			//Target coordinates
            //Layout related
            frames:1,				//Speed level, internal counter times changes every N frames
            times:0,				//Canvas refresh counter (for loop animation state judgment)
            timeout:0,				//Countdown (for process animation state judgment)
            control:{},				//Control cache, processed when reaching target position
            update:function(){}, 	//Update parameter information
            draw:function(){}		//Draw
        };
        Object.assign(this,this._settings,this._params);
    };
    Item.prototype.bind = function(eventType,callback){
        if(!_events[eventType]){
            _events[eventType] = {};
            $canvas.addEventListener(eventType,function(e){
                var position = _.getPosition(e);
                _stages[_index].items.forEach(function(item){
                    if(item.x<=position.x&&position.x<=item.x+item.width&&item.y<=position.y&&position.y<=item.y+item.height){
                        var key = 's'+_index+'i'+item._id;
                        if(_events[eventType][key]){
                            _events[eventType][key](e);
                        }
                    }
                });
                e.preventDefault();
            });
        }
        _events[eventType]['s'+this._stage.index+'i'+this._id] = callback.bind(this);  //Bind scope
    };
    //Map object constructor
    var Map = function(params){
        this._params = params||{};
        this._id = 0;               //Identifier
        this._stage = null;         //Bind to parent stage
        this._settings = {
            x:0,					//Map start coordinates
            y:0,
            size:20,				//Map cell width
            data:[],				//Map data
            x_length:0,				//2D array x-axis length
            y_length:0,				//2D array y-axis length
            frames:1,				//Speed level, internal counter times changes every N frames
            times:0,				//Canvas refresh counter (for loop animation state judgment)
            cache:false,    		//Whether static (if static, set cache)
            update:function(){},	//Update map data
            draw:function(){},		//Draw map
        };
        Object.assign(this,this._settings,this._params);
    };
    //Get value at specific point on map
    Map.prototype.get = function(x,y){
        if(this.data[y]&&typeof this.data[y][x]!='undefined'){
            return this.data[y][x];
        }
        return -1;
    };
    //Set value at specific point on map
    Map.prototype.set = function(x,y,value){
        if(this.data[y]){
            this.data[y][x] = value;
        }
    };
    //Convert map coordinates to canvas coordinates
    Map.prototype.coord2position = function(cx,cy){
        return {
            x:this.x+cx*this.size+this.size/2,
            y:this.y+cy*this.size+this.size/2
        };
    };
    //Convert canvas coordinates to map coordinates
    Map.prototype.position2coord = function(x,y){
        var fx = Math.abs(x-this.x)%this.size-this.size/2;
        var fy = Math.abs(y-this.y)%this.size-this.size/2;
        return {
            x:Math.floor((x-this.x)/this.size),
            y:Math.floor((y-this.y)/this.size),
            offset:Math.sqrt(fx*fx+fy*fy)
        };
    };
    //Pathfinding algorithm
    Map.prototype.finder = function(params){
        var defaults = {
            map:null,
            start:{},
            end:{},
            type:'path'
        };
        var options = Object.assign({},defaults,params);
        if(options.map[options.start.y][options.start.x]||options.map[options.end.y][options.end.x]){ //When start or end point is set on wall
            return [];
        }
        var finded = false;
        var result = [];
        var y_length  = options.map.length;
        var x_length = options.map[0].length;
        var steps = Array(y_length).fill(0).map(()=>Array(x_length).fill(0));     //Step mapping
        var _getValue = function(x,y){  //Get value on map
            if(options.map[y]&&typeof options.map[y][x]!='undefined'){
                return options.map[y][x];
            }
            return -1;
        };
        var _next = function(to){ //Determine if walkable, add to list if walkable
            var value = _getValue(to.x,to.y);
            if(value<1){
                if(value==-1){
                    to.x = (to.x+x_length)%x_length;
                    to.y = (to.y+y_length)%y_length;
                    to.change = 1;
                }
                if(!steps[to.y][to.x]){
                    result.push(to);
                }
            }
        };
        var _render = function(list){//Find path
            var new_list = [];
            var next = function(from,to){
                var value = _getValue(to.x,to.y);
                if(value<1){	//Whether current point is walkable
                    if(value==-1){
                        to.x = (to.x+x_length)%x_length;
                        to.y = (to.y+y_length)%y_length;
                        to.change = 1;
                    }
                    if(to.x==options.end.x&&to.y==options.end.y){
                        steps[to.y][to.x] = from;
                        finded = true;
                    }else if(!steps[to.y][to.x]){
                        steps[to.y][to.x] = from;
                        new_list.push(to);
                    }
                }
            };
            list.forEach(function(current){
				next(current,{y:current.y+1,x:current.x});
                next(current,{y:current.y,x:current.x+1});
                next(current,{y:current.y-1,x:current.x});
                next(current,{y:current.y,x:current.x-1});
            });
            if(!finded&&new_list.length){
                _render(new_list);
            }
        };
        _render([options.start]);
        if(finded){
            var current=options.end;
            if(options.type=='path'){
                while(current.x!=options.start.x||current.y!=options.start.y){
                    result.unshift(current);
                    current=steps[current.y][current.x];
                }
            }else if(options.type=='next'){
                _next({x:current.x+1,y:current.y});
                _next({x:current.x,y:current.y+1});
                _next({x:current.x-1,y:current.y});
                _next({x:current.x,y:current.y-1});
            }
        }
        return result;
    };
    //Stage object constructor
    var Stage = function(params){
        this._params = params||{};
        this._settings = {
            index:0,                        //Stage index
            status:0,						//Stage status, 0=inactive/ended, 1=normal, 2=paused, 3=temporary
            maps:[],						//Map queue
            audio:[],						//Audio resources
            images:[],						//Image resources
            items:[],						//Object queue
            timeout:0,						//Countdown (for process animation state judgment)
            update:function(){}				//Detection, handle relative relationships between different objects in layout
        };
        Object.assign(this,this._settings,this._params);
    };
    //Add object
    Stage.prototype.createItem = function(options){
        var item = new Item(options);
        //Dynamic properties
        if(item.location){
            Object.assign(item,item.location.coord2position(item.coord.x,item.coord.y));
        }
        //Relationship binding
        item._stage = this;
        item._id = this.items.length;
        this.items.push(item);
        return item;
    };
    //Reset object positions
    Stage.prototype.resetItems = function(){
        this.status = 1;
        this.items.forEach(function(item,index){
            Object.assign(item,item._settings,item._params);
            if(item.location){
                Object.assign(item,item.location.coord2position(item.coord.x,item.coord.y));
            }
        });
    };
    //Get object list
    Stage.prototype.getItemsByType = function(type){
        return this.items.filter(function(item){
	    return item.type == type;
        });
    };
    //Add map
    Stage.prototype.createMap = function(options){
        var map = new Map(options);
        //Dynamic properties
        map.data = JSON.parse(JSON.stringify(map._params.data));
        map.y_length = map.data.length;
        map.x_length = map.data[0].length;
        map.imageData = null;
        //Relationship binding
        map._stage = this;
        map._id = this.maps.length;
        this.maps.push(map);
        return map;
    };
    //Reset maps
    Stage.prototype.resetMaps = function(){
        this.status = 1;
        this.maps.forEach(function(map){
            Object.assign(map,map._settings,map._params);
            map.data = JSON.parse(JSON.stringify(map._params.data));
            map.y_length = map.data.length;
            map.x_length = map.data[0].length;
            map.imageData = null;
        });
    };
    //Reset
    Stage.prototype.reset = function(){
        Object.assign(this,this._settings,this._params);
        this.resetItems();
        this.resetMaps();
    };
    //Bind events
    Stage.prototype.bind = function(eventType,callback){
        if(!_events[eventType]){
            _events[eventType] = {};
            window.addEventListener(eventType,function(e){
                var key = 's' + _index;
                if(_events[eventType][key]){
                    _events[eventType][key](e);
                }
                e.preventDefault();
            });
        }
        _events[eventType]['s'+this.index] = callback.bind(this);	//Bind event scope
    };
    //Animation start
    this.start = function() {
        var f = 0;		//Frame counter
        var timestamp = (new Date()).getTime();
        var fn = function(){
            var now = (new Date()).getTime();
            if(now-timestamp<16){   // Frame rate limiting, prevent animation too fast on high refresh rate screens
                _hander = requestAnimationFrame(fn);
                return false;
            }
            timestamp = now;
            var stage = _stages[_index];
            _context.clearRect(0,0,_.width,_.height);		//Clear canvas
            _context.fillStyle = '#000000';
            _context.fillRect(0,0,_.width,_.height);
            f++;
            if(stage.timeout){
                stage.timeout--;
            }
            if(stage.update()!=false){		            //If update returns false, don't draw
                stage.maps.forEach(function(map){
                    if(!(f%map.frames)){
                        map.times = f/map.frames;		//Counter
                    }
                    if(map.cache){
                        if(!map.imageData){
                            _context.save();
                            map.draw(_context);
                            map.imageData = _context.getImageData(0,0,_.width,_.height);
                            _context.restore();
                        }else{
                            _context.putImageData(map.imageData,0,0);
                        }
                    }else{
                    	map.update();
                        map.draw(_context);
                    }
                });
                stage.items.forEach(function(item){
                    if(!(f%item.frames)){
                        item.times = f/item.frames;		   //Counter
                    }
                    if(stage.status==1&&item.status!=2){  	//Neither object nor stage is in paused state
                        if(item.location){
                            item.coord = item.location.position2coord(item.x,item.y);
                        }
                        if(item.timeout){
                            item.timeout--;
                        }
                        item.update();
                    }
                    item.draw(_context);
                });
            }
            _hander = requestAnimationFrame(fn);
        };
        _hander = requestAnimationFrame(fn);
    };
    //Animation end
    this.stop = function(){
        _hander&&cancelAnimationFrame(_hander);
    };
    //Event coordinates
    this.getPosition = function(e){
        var box = $canvas.getBoundingClientRect();
        return {
            x:e.clientX-box.left*(_.width/box.width),
            y:e.clientY-box.top*(_.height/box.height)
        };
    }
    //Create stage
    this.createStage = function(options){
        var stage = new Stage(options);
        stage.index = _stages.length;
        _stages.push(stage);
        return stage;
    };
    //Set stage
    this.setStage = function(index){
        _stages[_index].status = 0;
        _index = index;
        _stages[_index].status = 1;
        _stages[_index].reset(); //Reset
        return _stages[_index];
    };
    //Next stage
    this.nextStage = function(){
        if(_index<_stages.length-1){
            return this.setStage(++_index);
        }else{
            throw new Error('unfound new stage.');
        }
    };
    //Get stage list
    this.getStages = function(){
        return _stages;
    };
    //Initialize game engine
    this.init = function(){
        _index = 0;
        this.start();
    };
}
