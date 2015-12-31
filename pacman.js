// 'use strict';
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
		name:'Pac-Man',		//游戏名称
		copyright:'passer-by.com',		//版权信息
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
	var _hander = null;  						//画布更新
	//动画开始
	this.startAnimate = function(callback,frame){
		frame = frame||1;
		var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||window.mozRequestAnimationFrame ||window.msRequestAnimationFrame;
		var t = 0;	//帧数计算
		var fn = function(){
			t++;
			if(!(t%frame)){
				callback(t/frame);
			}
			_hander = requestAnimationFrame(fn);
		};
		_.stopAnimate();
		_hander = requestAnimationFrame(fn);
	};
	//动画开始
	this.stopAnimate = function(){
		var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame ||window.msCancelAnimationFrame;
		_hander&&cancelAnimationFrame(_hander);
	};
	//开始画面
	this.launch = function(){
		_.startAnimate(function(t){
			//清除画布
			_context.clearRect(0,0,_settings.width,_settings.height);
			//logo
			_context.fillStyle = '#FC3';
			_context.beginPath();
			if(t%2){
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
			_context.fillText(_settings.name,_settings.width/2,_settings.height*.6);
			//版权信息
			_context.font = '14px Helvetica';
			_context.textAlign = 'right';
			_context.textBaseline = 'bottom';
			_context.fillStyle = '#AAA';
			_context.fillText('© '+_settings.copyright,_settings.width-12,_settings.height-5);
		},10);
	};
	this.update = function(){
		_startAnimate(function(t){
			_items.forEach(function(item,index){
				item.update(t);
			});			
		});
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
	//事件
}