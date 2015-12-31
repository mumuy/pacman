'use strict';
//活动对象构造
function Item(options){
	options = options||{};
	var _ = this;
	var settings = {
		x:0,					//横坐标
		y:0,					//纵坐标
		width:20,				//宽
		height:20,				//高
		type:1,					//对象类型
		status:1,				//对象状态,1表示正常
		orientation:0,			//当前定位方向,0表示上,1表示右,2表示下,3表示左
		vector:{				//目标坐标
			x:0,
			y:0
		},
		speed:1,				//速度等级,1表示与刷新频率一致
		update:function(){},	//更新参数信息
		draw:function(){}		//绘制
	};
	for(var i in settings){
		_[i] = options[i]||settings[i];
	}
}
//游戏对象
function Game(id,options){
	var _ = this;
	var _settings = {
		name:'Eat Beans',	//游戏名称
		width:960,			//画布宽度
		height:640,			//画布高度
		map:{				//地图信息
			x:0,			//地图起点坐标
			y:0,		
			size:20,		//地图单元的宽度
			data:[]
		},
		fresh:100,			//画布刷新频率,一秒10帧
		audio:[],			//音频资源
		images:[],			//图片资源
	};
	for(i in options){
		_settings[i] = options[i];
	}
	var $canvas = document.getElementById(id);
	$canvas.width = _settings.width;
	$canvas.height = _settings.height;
	var _context = $canvas.getContext('2d');	//画布上下文环境
	var _items = [];							//动画对象队列
	var _status = 0;							//页面状态
	var _t = 0;									//内部计算器,交替帧数更新动画
	var _hander = null;  						//画布更新
	
	//开始画面
	this.launch = function(){
		_hander = setInterval(function(){
			_t++;
			var s = _t%4;
			//清除画布
			_context.clearRect(0,0,_settings.width,_settings.height);
			//logo
			_context.fillStyle = '#FC3';
			_context.beginPath();
			if(s<2){
				_context.arc(_settings.width/2,_settings.height*.45,50,.20*Math.PI,1.80*Math.PI,false);
				_context.lineTo(_settings.width/2,_settings.height*.45);
			}else{
				_context.arc(_settings.width/2,_settings.height*.45,50,.01*Math.PI,1.99*Math.PI,false);
				_context.lineTo(_settings.width/2,_settings.height*.45);
			}
			_context.closePath();
			_context.fill();
			_context.fillStyle = '#000';
			_context.beginPath();
			_context.arc(_settings.width/2+5,_settings.height*.45-27,7,0,2*Math.PI,false);
			_context.closePath();
			_context.fill();
			//游戏名
			_context.font = 'bold 42px Helvetica';
			_context.textAlign = 'center';
			_context.textBaseline = 'middle';
			_context.fillStyle = '#FFF';
			_context.fillText(_settings.name,_settings.width/2,_settings.height*.618);			
		},_settings.fresh);
	};
	//动画停止
	this.stop = function(){
		_hander&&clearInterval(_hander);
	};
	//动画开始
	this.start = function(){
		_.stop();
		_hander = setInterval(function(){  //定时刷新画布
			_t++;
			_items.forEach(function(item,index){
				item.update(_t);
			});
		},_settings.fresh);
	};
	//添加对象
	this.addItem = function(item){
		_items.push(item);
	};
	//条件嗅探
	this.render = function(){

	};
	//绘图
	this.draw = function(){

	};
}