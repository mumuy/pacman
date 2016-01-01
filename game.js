'use strict';
/*
* 小型游戏引擎
*/
function Game(id,options){
	var _ = this;
	options = options||{};
	var settings = {
		width:960,						//画布宽度
		height:640						//画布高度
	};
	for(var i in settings){
		this[i] = options[i]||settings[i];
	}
	var $canvas = document.getElementById(id);
	$canvas.width = _.width;
	$canvas.height = _.height;
	var _context = $canvas.getContext('2d');	//画布上下文环境
	var _stages = [];							//布景对象队列
	var _events = {};							//事件集合
	var _index,									//当前布景索引					
		_hander;  								//帧动画控制
	//活动对象构造
	var Item = function(options){
		options = options||{};
		var settings = {
			x:0,					//横坐标
			y:0,					//纵坐标
			width:20,				//宽
			height:20,				//高
			type:1,					//对象类型
			status:1,				//对象状态,1表示正常,0表示隐藏
			orientation:0,			//当前定位方向,0表示上,1表示右,2表示下,3表示左
			vector:{				//目标坐标
				x:0,
				y:0
			},
			speed:1,				//速度等级,内部计算器times多少帧变化一次
			update:function(){}, 	//更新参数信息
			draw:function(){}		//绘制
		};
		for(var i in settings){
			this[i] = options[i]||settings[i];
		}
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
			});
		}
		_events[eventType]['s'+this.stage.index+'i'+this.index] = callback;
	};
	//布景对象构造器
	var Stage = function(options){
		options = options||{};
		var settings = {
			map:{							//地图信息
				x:0,						//地图起点坐标
				y:0,		
				size:20,					//地图单元的宽度
				data:[]						//地图数据
			},
			status:1,						//布景状态
			audio:[],						//音频资源
			images:[],						//图片资源
			items:[]						//对象队列
		};
		for(var i in settings){
			this[i] = options[i]||settings[i];
		}
	}
	//动画开始
	Stage.prototype.start = function() {
		var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||window.mozRequestAnimationFrame ||window.msRequestAnimationFrame;
		var f = 0;		//帧数计算
		var stage = this;
		var fn = function(){
			_context.clearRect(0,0,_.width,_.height);	//清除画布
			if(stage.items.length){
				f++;
				stage.items.forEach(function(item,index){
					if(!(f%item.speed)){
						item.frames = f/item.speed;		//计数器
					}
					item.update();
					item.draw(_context);
				});
				_hander = requestAnimationFrame(fn);
			}
		};
		this.stop();
		_hander = requestAnimationFrame(fn);
	};
	//动画结束
	Stage.prototype.stop = function(){
		var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame ||window.msCancelAnimationFrame;
		_hander&&cancelAnimationFrame(_hander);
	};
	//添加对象
	Stage.prototype.createItem = function(options){
		var item = new Item(options);
		//对象动态属性
		item.stage = this;					//绑定对象与所属布景绑定
		item.index = this.items.length;		//对象层级
		this.items.push(item);
		return item;
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
			});
		}
		_events[eventType]['s'+this.index] = callback;
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
	//下个布景
	this.nextStage = function(){
		if(_stages[_index+1]){
			_index++;
			_stages[_index].start();
		}else{
			throw new Error('unfound new stage.');
		}
	};
	//初始化游戏引擎
	this.init = function(){
		_index = 0;
		if(_stages[_index]){
			_stages[_index].start();
		}
	};
}