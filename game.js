'use strict';
/*
* 小型游戏引擎
*/
function Game(id,params){
	var _ = this;
	params = params||{};
	var settings = {
		width:960,						//画布宽度
		height:640						//画布高度
	};
	var _extend = function(target,settings,params){
		for(var i in settings){
			target[i] = params[i]||settings[i];
		}
		return target;
	};
	_extend(this,settings,params);
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
		this._settings = {
			x:0,					//位置坐标:横坐标
			y:0,					//位置坐标:纵坐标
			width:20,				//宽
			height:20,				//高
			type:0,					//对象类型,0表示普通对象(不与地图绑定),1表示玩家控制对象,2表示程序控制对象
			color:'#F00',			//标识颜色
			status:1,				//对象状态,0表示隐藏,1表示正常,2表示暂停
			orientation:0,			//当前定位方向,0表示右,1表示下,2表示左,3表示上
			speed:0,				//移动速度
			//地图相关
			location:null,			//定位地图,Map对象
			coord:null,				//如果对象与地图绑定,需设置地图坐标;若不绑定,则设置位置坐标
			path:[],				//NPC自动行走的路径
			vector:null,			//目标坐标
			//布局相关
			stage:null,				//绑定对象与所属布景绑定
			index:0,				//对象索引
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
						var key = 's'+_index+'i'+item.index;
						if(_events[eventType][key]){
							_events[eventType][key](e);
						}
					}
				});
				e.preventDefault(); 
			});
		}
		_events[eventType]['s'+this.stage.index+'i'+this.index] = callback.bind(this);  //绑定作用域
	};
	//地图对象构造器
	var Map = function(params){
		this._params = params||{};
		this._settings = {
			x:0,						//地图起点坐标
			y:0,		
			size:20,					//地图单元的宽度
			data:[],					//地图数据
			stage:null,					//布景
			x_length:0,					//二维数组x轴长度
			y_length:0,					//二维数组y轴长度
			update:function(){},		//更新地图数据
			draw:function(){},			//绘制地图
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
			end:{}
		};
		var options = _extend({},defaults,params);
		var result = [];
		if(options.map[options.start.y][options.start.x]||options.map[options.end.y][options.end.x]){ //当起点或终点设置在墙上
			return [];
		}
		var finded = false;
		var y_length  = options.map.length;
		var x_length = options.map[0].length;
		var steps = []; 	//步骤的映射
		for(var y=y_length;y--;){
			steps[y] = [];
			for(var x=x_length;x--;){
				steps[y][x] = 0;
			}
		}
		var _render = function(list){
			var new_list = [];
			var next = function(from,to){
				if(!finded){
					var value = options.map[to.y]&&typeof options.map[to.y][to.x] !='undefined'?options.map[to.y][to.x]:-1;
					if(value!=1){	//当前点是否可以走
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
				}
			};
			for(var i=0,len=list.length;i<len;i++){
				var current = list[i];
				next(current,{y:current.y+1,x:current.x});
				next(current,{y:current.y,x:current.x+1});
				next(current,{y:current.y-1,x:current.x});
				next(current,{y:current.y,x:current.x-1});
			}
			if(!finded&&new_list.length){
				_render(new_list);
			}
		};
		_render([options.start]);
		if(finded){
			var current=options.end;
			while(current.x!=options.start.x||current.y!=options.start.y){
				result.unshift(current);
				current=steps[current.y][current.x];
			}
		}
		return result;
	};
	//布景对象构造器
	var Stage = function(params){
		this._params = params||{};
		this._settings = {
			status:1,						//布景状态,0表示未激活,1表示正常,2表示暂停,3表示中断或异常,4表示结束
			maps:[],						//地图队列
			audio:[],						//音频资源
			images:[],						//图片资源
			items:[],						//对象队列
			timeout:0,						//倒计时(用于过程动画状态判断)
			update:function(){}				//嗅探,处理布局下不同对象的相对关系
		};
		_extend(this,this._settings,this._params);
	};
	//重置物体位置
	Stage.prototype.resetItems = function(){
		this.status = 1;
		this.items.forEach(function(item,index){
			_extend(item,item._settings,item._params);
			item.index = index;
			item.stage = this;
			if(item.location){
				var position = item.location.coord2position(item.coord.x,item.coord.y);
				item.x = position.x;
				item.y = position.y;
			}
		}.bind(this));
	};
	//重置地图
	Stage.prototype.resetMaps = function(){
		this.status = 1;
		this.maps.forEach(function(map){
			_extend(map,map._settings,map._params);
			map.data = JSON.parse(JSON.stringify(map._params.data));
			map.stage = this;
			map.y_length = map.data.length;
			map.x_length = map.data[0].length;
		}.bind(this));
	};
	//重置
	Stage.prototype.reset = function(){
		_extend(this,this._settings,this._params);
		this.resetItems();
		this.resetMaps();
	};
	//添加对象
	Stage.prototype.createItem = function(options){
		var item = new Item(options);
		//动态属性
		item.stage = this;
		item.index = this.items.length;
		if(item.location){
			var position = item.location.coord2position(item.coord.x,item.coord.y);
			item.x = position.x;
			item.y = position.y;
		}
		this.items.push(item);
		return item;
	};
	//获取对象列表
	Stage.prototype.getItemsByType = function(type){
		var items = this.items.filter(function(item){
			if(item.type==type){
				return item;
			}
		});
		return items;
	};
	//添加地图
	Stage.prototype.createMap = function(options){
		var map = new Map(options);
		//动态属性
		map.data = JSON.parse(JSON.stringify(map._params.data));
		map.stage = this;
		map.y_length = map.data.length;
		map.x_length = map.data[0].length;
		this.maps.push(map);
		return map;
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
		var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||window.mozRequestAnimationFrame ||window.msRequestAnimationFrame;
		var f = 0;		//帧数计算		
		var fn = function(){
			var stage = _stages[_index];
			_context.clearRect(0,0,_.width,_.height);		//清除画布
			f++;
			if(stage.timeout){
				stage.timeout--;
			}
			if(stage.update()!=false){		//update返回false,则不绘制
				if(stage.maps.length){
					stage.maps.forEach(function(map,index){
						map.update();
						map.draw(_context);
					});
				}			
				if(stage.items.length){
					stage.items.forEach(function(item){				
						if(!(f%item.frames)){
							item.times = f/item.frames;		//计数器
						}
						if(stage.status==1&&item.status==1){  	//对象及布景状态都处于正常状态下
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
			}
			_hander = requestAnimationFrame(fn);
		};
		_hander = requestAnimationFrame(fn);
	};
	//动画结束
	this.stop = function(){
		var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame ||window.msCancelAnimationFrame;	
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
		return _stages[_index];
	};
	//下个布景
	this.nextStage = function(){
		if(_index<_stages.length-1){
			_stages[_index].status = 0;
			_index++;
			return _stages[_index];
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