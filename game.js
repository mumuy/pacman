'use strict';
/*
* 小型游戏引擎
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
        width:960,						//画布宽度
        height:640						//画布高度
    };
    var _extend = function(target,settings,params){
        params = params||{};
        for(var i in settings){
            target[i] = params[i]||settings[i];
        }
        return target;
    };
    _extend(_,settings,params);
    var $canvas = document.getElementById(id);
    $canvas.width = _.width;
    $canvas.height = _.height;
    var _context = $canvas.getContext('2d');	//画布上下文环境
    var _stages = [];							//布景对象队列
    var _events = {};							//事件集合
    var _index=0,								//当前布景索引
        _hander;  								//帧动画控制
    //活动对象构造
    var Item = function(params){
        this._params = params||{};
        this._id = 0;               //标志符
        this._stage = null;         //与所属布景绑定
        this._settings = {
            x:0,					//位置坐标:横坐标
            y:0,					//位置坐标:纵坐标
            width:20,				//宽
            height:20,				//高
            type:0,					//对象类型,0表示普通对象(不与地图绑定),1表示玩家控制对象,2表示程序控制对象
            color:'#F00',			//标识颜色
            status:1,				//对象状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时,4表示异常
            orientation:0,			//当前定位方向,0表示右,1表示下,2表示左,3表示上
            speed:0,				//移动速度
            //地图相关
            location:null,			//定位地图,Map对象
            coord:null,				//如果对象与地图绑定,需设置地图坐标;若不绑定,则设置位置坐标
            path:[],				//NPC自动行走的路径
            vector:null,			//目标坐标
            //布局相关
            frames:1,				//速度等级,内部计算器times多少帧变化一次
            times:0,				//刷新画布计数(用于循环动画状态判断)
            timeout:0,				//倒计时(用于过程动画状态判断)
            control:{},				//控制缓存,到达定位点时处理
            update:function(){}, 	//更新参数信息
            draw:function(){}		//绘制
        };
        _extend(this,this._settings,this._params);
    };
    Item.prototype.bind = function(eventType,callback){
        if(!_events[eventType]){
            _events[eventType] = {};
            $canvas.addEventListener(eventType,function(e){
                var position = _.getPosition(e);
                _stages[_index].items.forEach(function(item){
                    if(Math.abs(position.x-item.x)<item.width/2&&Math.abs(position.y-item.y)<item.height/2){
                        var key = 's'+_index+'i'+item._id;
                        if(_events[eventType][key]){
                            _events[eventType][key](e);
                        }
                    }
                });
                e.preventDefault();
            });
        }
        _events[eventType]['s'+this._stage.index+'i'+this._id] = callback.bind(this);  //绑定作用域
    };
    //地图对象构造器
    var Map = function(params){
        this._params = params||{};
        this._id = 0;               //标志符
        this._stage = null;         //与所属布景绑定
        this._settings = {
            x:0,					//地图起点坐标
            y:0,
            size:20,				//地图单元的宽度
            data:[],				//地图数据
            x_length:0,				//二维数组x轴长度
            y_length:0,				//二维数组y轴长度
            frames:1,				//速度等级,内部计算器times多少帧变化一次
            times:0,				//刷新画布计数(用于循环动画状态判断)
            cache:false,    		//是否静态（如静态则设置缓存）
            update:function(){},	//更新地图数据
            draw:function(){},		//绘制地图
        };
        _extend(this,this._settings,this._params);
    };
    //获取地图上某点的值
    Map.prototype.get = function(x,y){
        if(this.data[y]&&typeof this.data[y][x]!='undefined'){
            return this.data[y][x];
        }
        return -1;
    };
    //设置地图上某点的值
    Map.prototype.set = function(x,y,value){
        if(this.data[y]){
            this.data[y][x] = value;
        }
    };
    //地图坐标转画布坐标
    Map.prototype.coord2position = function(cx,cy){
        return {
            x:this.x+cx*this.size+this.size/2,
            y:this.y+cy*this.size+this.size/2
        };
    };
    //画布坐标转地图坐标
    Map.prototype.position2coord = function(x,y){
        var fx = Math.abs(x-this.x)%this.size-this.size/2;
        var fy = Math.abs(y-this.y)%this.size-this.size/2;
        return {
            x:Math.floor((x-this.x)/this.size),
            y:Math.floor((y-this.y)/this.size),
            offset:Math.sqrt(fx*fx+fy*fy)
        };
    };
    //寻址算法
    Map.prototype.finder = function(params){
        var defaults = {
            map:null,
            start:{},
            end:{},
            type:'path'
        };
        var options = _extend({},defaults,params);
        if(options.map[options.start.y][options.start.x]||options.map[options.end.y][options.end.x]){ //当起点或终点设置在墙上
            return [];
        }
        var finded = false;
        var result = [];
        var y_length  = options.map.length;
        var x_length = options.map[0].length;
        var steps = [];     //步骤的映射
        for(var y=y_length;y--;){
            steps[y] = new Array(x_length).fill(0);
        }
        var _getValue = function(x,y){  //获取地图上的值
            if(options.map[y]&&typeof options.map[y][x]!='undefined'){
                return options.map[y][x];
            }
            return -1;
        };
        var _next = function(to){ //判定是否可走,可走放入列表
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
        var _render = function(list){//找线路
            var new_list = [];
            var next = function(from,to){
                var value = _getValue(to.x,to.y);
                if(value<1){	//当前点是否可以走
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
    //布景对象构造器
    var Stage = function(params){
        this._params = params||{};
        this._settings = {
            index:0,                        //布景索引
            status:0,						//布景状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时,4表示异常
            maps:[],						//地图队列
            audio:[],						//音频资源
            images:[],						//图片资源
            items:[],						//对象队列
            timeout:0,						//倒计时(用于过程动画状态判断)
            update:function(){}				//嗅探,处理布局下不同对象的相对关系
        };
        _extend(this,this._settings,this._params);
    };
    //添加对象
    Stage.prototype.createItem = function(options){
        var item = new Item(options);
        //动态属性
        if(item.location){
            var position = item.location.coord2position(item.coord.x,item.coord.y);
            item.x = position.x;
            item.y = position.y;
        }
        //关系绑定
        item._stage = this;
        item._id = this.items.length;
        this.items.push(item);
        return item;
    };
    //重置物体位置
    Stage.prototype.resetItems = function(){
        this.status = 1;
        this.items.forEach(function(item,index){
            _extend(item,item._settings,item._params);
            if(item.location){
                var position = item.location.coord2position(item.coord.x,item.coord.y);
                item.x = position.x;
                item.y = position.y;
            }
        });
    };
    //获取对象列表
    Stage.prototype.getItemsByType = function(type){
        return this.items.filter(function(item){
            if(item.type==type){
                return item;
            }
        });
    };
    //添加地图
    Stage.prototype.createMap = function(options){
        var map = new Map(options);
        //动态属性
        map.data = JSON.parse(JSON.stringify(map._params.data));
        map.y_length = map.data.length;
        map.x_length = map.data[0].length;
        map.imageData = null;
        //关系绑定
        map._stage = this;
        map._id = this.maps.length;
        this.maps.push(map);
        return map;
    };
    //重置地图
    Stage.prototype.resetMaps = function(){
        this.status = 1;
        this.maps.forEach(function(map){
            _extend(map,map._settings,map._params);
            map.data = JSON.parse(JSON.stringify(map._params.data));
            map.y_length = map.data.length;
            map.x_length = map.data[0].length;
            map.imageData = null;
        });
    };
    //重置
    Stage.prototype.reset = function(){
        _extend(this,this._settings,this._params);
        this.resetItems();
        this.resetMaps();
    };
    //绑定事件
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
        _events[eventType]['s'+this.index] = callback.bind(this);	//绑定事件作用域
    };
    //动画开始
    this.start = function() {
        var f = 0;		//帧数计算
        var fn = function(){
            var stage = _stages[_index];
            _context.clearRect(0,0,_.width,_.height);		//清除画布
            _context.fillStyle = '#000000';
            _context.fillRect(0,0,_.width,_.height);
            f++;
            if(stage.timeout){
                stage.timeout--;
            }
            if(stage.update()!=false){		            //update返回false,则不绘制
                stage.maps.forEach(function(map){
                    if(!(f%map.frames)){
                        map.times = f/map.frames;		//计数器
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
                        item.times = f/item.frames;		   //计数器
                    }
                    if(stage.status==1&&item.status!=2){  	//对象及布景状态都不处于暂停状态
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
    //动画结束
    this.stop = function(){
        _hander&&cancelAnimationFrame(_hander);
    };
    //事件坐标
    this.getPosition = function(e){
        var box = $canvas.getBoundingClientRect();
        return {
            x:e.clientX-box.left*(_.width/box.width),
            y:e.clientY-box.top*(_.height/box.height)
        };
    }
    //创建布景
    this.createStage = function(options){
        var stage = new Stage(options);
        stage.index = _stages.length;
        _stages.push(stage);
        return stage;
    };
    //指定布景
    this.setStage = function(index){
        _stages[_index].status = 0;
        _index = index;
        _stages[_index].status = 1;
        return _stages[_index];
    };
    //下个布景
    this.nextStage = function(){
        if(_index<_stages.length-1){
            return this.setStage(++_index);
        }else{
            throw new Error('unfound new stage.');
        }
    };
    //初始化游戏引擎
    this.init = function(){
        _index = 0;
        this.start();
    };
}
