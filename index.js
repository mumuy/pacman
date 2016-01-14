//主程序,业务逻辑
(function(){
	var _DATA = [		//地图数据
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
		[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
		[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
		[1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
		[1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,1,1,1,2,2,1,1,1,0,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,1,2,2,2,2,2,2,1,0,1,1,0,1,1,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0],
		[1,1,1,1,1,1,0,1,1,0,1,2,2,2,2,2,2,1,0,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
		[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
		[1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
		[1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
		[1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
		[1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
		[1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
		[1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	],
	_COS = [1,0,-1,0],
	_SIN = [0,1,0,-1],
	_COLOR = ['#F00','#F93','#0CF','#F9C'],//红,橙,
	_LIFE = 3,
	_SCORE = 0;		//得分

	var game = new Game('canvas');
	//启动页
	(function(){
		var stage = game.createStage();
		//logo
		stage.createItem({
			x:game.width/2,
			y:game.height*.45,
			width:100,
			height:100,
			frames:10,
			draw:function(context){
				context.fillStyle = '#FFE600';
				context.beginPath();
				if(this.times%2){
					context.arc(this.x,this.y,this.width/2,.20*Math.PI,1.80*Math.PI,false);
				}else{
					context.arc(this.x,this.y,this.width/2,.01*Math.PI,1.99*Math.PI,false);
				}
				context.lineTo(this.x,this.y);
				context.closePath();
				context.fill();
				context.fillStyle = '#000';
				context.beginPath();
				context.arc(this.x+5,this.y-27,7,0,2*Math.PI,false);
				context.closePath();
				context.fill();
			}
		});
		//游戏名
		stage.createItem({
			x:game.width/2,
			y:game.height*.6,
			draw:function(context){
				context.font = 'bold 42px Helvetica';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillStyle = '#FFF';
				context.fillText('Pac-Man',this.x,this.y);
			}
		});
		//版权信息
		stage.createItem({
			x:game.width-12,
			y:game.height-5,
			draw:function(context){
				context.font = '14px Helvetica';
				context.textAlign = 'right';
				context.textBaseline = 'bottom';
				context.fillStyle = '#AAA';
				context.fillText('© passer-by.com',this.x,this.y);
			}
		});
		//事件绑定
		stage.bind('keydown',function(e){
			switch(e.keyCode){
				case 13:
				case 32:
					game.nextStage();
				break;
			}
		});
	})();
	//游戏主程序
	(function(){
		var stage = game.createStage({
			update:function(){
				var stage = this;
				if(stage.status==1){
					var player = stage.getItemsByType(1)[0];
					var items = stage.getItemsByType(2);
					items.forEach(function(item){  //物体检测
						var dx = item.x-player.x;
						var dy = item.y-player.y;
						if(dx*dx+dy*dy<750){
							stage.status = 3;
							stage.timeout = 30;
						}
					});
					if(JSON.stringify(goods.data).indexOf(0)<0){
						game.nextStage();
					}
				}else if(stage.status==3){
					if(!stage.timeout){
						_LIFE--;
						if(_LIFE){
							stage.resetItems();
						}else{
							game.nextStage();
							return false;
						}
					}
				}
			}
		});
		//绘制地图
		var map = stage.createMap({
			x:60,
			y:10,
			data:_DATA,
			draw:function(context){
				for(var j=0; j<this.y_length; j++){
					for(var i=0; i<this.x_length; i++){
						var value = this.get(i,j);
						if(value){
							var code = 0;
							if(this.get(i,j-1)&&!(this.get(i-1,j-1)&&this.get(i+1,j-1)&&this.get(i-1,j)&&this.get(i+1,j))){
								if(j){
									code += 1000;
								}
							}
							if(this.get(i+1,j)&&!(this.get(i+1,j-1)&&this.get(i+1,j+1)&&this.get(i,j-1)&&this.get(i,j+1))){
								if(i<this.x_length-1){
									code += 100;
								}
							}
							if(this.get(i,j+1)&&!(this.get(i-1,j+1)&&this.get(i+1,j+1)&&this.get(i-1,j)&&this.get(i+1,j))){
								if(j<this.y_length-1){
									code += 10;
								}
							}
							if(this.get(i-1,j)&&!(this.get(i-1,j-1)&&this.get(i-1,j+1)&&this.get(i,j-1)&&this.get(i,j+1))){
								if(i){
									code += 1;
								}
							}
							if(code){
								context.lineWidth = 2;
								context.strokeStyle=value==2?"#FFF":"#09C";
								var pos = this.coord2position(i,j);
								switch(code){
									case 1100:
										context.beginPath();
										context.arc(pos.x+this.size/2,pos.y-this.size/2,this.size/2,.5*Math.PI,1*Math.PI,false);
										context.stroke();
										context.closePath();
										break;
									case 110:
										context.beginPath();
										context.arc(pos.x+this.size/2,pos.y+this.size/2,this.size/2,Math.PI,1.5*Math.PI,false);
										context.stroke();
										context.closePath();
										break;
									case 11:
										context.beginPath();
										context.arc(pos.x-this.size/2,pos.y+this.size/2,this.size/2,1.5*Math.PI,2*Math.PI,false);
										context.stroke();
										context.closePath();
										break;
									case 1001:
										context.beginPath();
										context.arc(pos.x-this.size/2,pos.y-this.size/2,this.size/2,0,.5*Math.PI,false);
										context.stroke();
										context.closePath();
										break;
									default:
										var arr = String.prototype.split.call(code,'');
										if(+arr.pop()){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x-this.size/2,pos.y);
											context.stroke();
											context.closePath();
										}
										if(+arr.pop()){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x,pos.y+this.size/2);
											context.stroke();
											context.closePath();
										}
										if(+arr.pop()){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x+this.size/2,pos.y);
											context.stroke();
											context.closePath();
										}
										if(+arr.pop()){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x,pos.y-this.size/2);
											context.stroke();
											context.closePath();
										}
								}
							}
						}
					}
				}
			}
		});
		//物品地图
		var goods = stage.createMap({
			x:60,
			y:10,
			data:_DATA,
			draw:function(context){
				for(var j=0; j<this.y_length; j++){
					for(var i=0; i<this.x_length; i++){
						if(!this.get(i,j)){
							var pos = this.coord2position(i,j);
							context.fillStyle = "#F5F5DC";
							context.fillRect(pos.x-2,pos.y-2,4,4);
						}
					}
				}
			}
		});
		//得分
		stage.createItem({
			x:690,
			y:100,
			draw:function(context){
				context.font = 'bold 28px Helvetica';
				context.textAlign = 'left';
				context.textBaseline = 'bottom';
				context.fillStyle = '#C33';
				context.fillText('SCORE',this.x,this.y);
				context.font = '28px Helvetica';
				context.textAlign = 'left';
				context.textBaseline = 'top';
				context.fillStyle = '#FFF';
				context.fillText(_SCORE,this.x+12,this.y);
			}
		});
		//状态文字
		stage.createItem({
			x:690,
			y:320,
			frames:25,
			draw:function(context){
				if(stage.status==2&&this.times%2){
					context.font = '24px Helvetica';
					context.textAlign = 'left';
					context.textBaseline = 'center';
					context.fillStyle = '#09F';
					context.fillText('PAUSE',this.x,this.y);
				}
			}
		});
		//生命值
		stage.createItem({
			x:705,
			y:540,
			width:30,
			height:30,
			draw:function(context){
				for(var i=0;i<_LIFE;i++){
					var x=this.x+36*i,y=this.y;
					context.fillStyle = '#FFE600';
					context.beginPath();
					context.arc(x,y,this.width/2,.15*Math.PI,-.15*Math.PI,false);
					context.lineTo(x,y);
					context.closePath();
					context.fill();
				}
			}
		});
		//主角
		var player = stage.createItem({
			width:30,
			height:30,
			type:1,
			location:map,
			coord:{x:13.5,y:23},
			orientation:2,
			speed:2,
			frames:10,
			update:function(){
				var coord = this.coord;
				if(!coord.offset){
					if(typeof this.control.orientation!='undefined'){
						if(!map.get(coord.x+_COS[this.control.orientation],coord.y+_SIN[this.control.orientation])){
							this.orientation = this.control.orientation;
						}	
					}
					this.control = {};
					var value = map.get(coord.x+_COS[this.orientation],coord.y+_SIN[this.orientation]);
					if(value==0){
						this.x += this.speed*_COS[this.orientation];
						this.y += this.speed*_SIN[this.orientation];
					}else if(value<0){
						this.x -= map.size*(map.x_length-1)*_COS[this.orientation];
						this.y -= map.size*(map.y_length-1)*_SIN[this.orientation];
					}
				}else{
					if(!goods.get(this.coord.x,this.coord.y)){
						_SCORE++;
						goods.set(this.coord.x,this.coord.y,1);
					}
					this.x += this.speed*_COS[this.orientation];
					this.y += this.speed*_SIN[this.orientation];
				}
			},
			draw:function(context){
				context.fillStyle = '#FFE600';
				context.beginPath();
				if(stage.status<3){
					if(this.times%2){
						context.arc(this.x,this.y,this.width/2,(.5*this.orientation+.20)*Math.PI,(.5*this.orientation-.20)*Math.PI,false);
					}else{
						context.arc(this.x,this.y,this.width/2,(.5*this.orientation+.01)*Math.PI,(.5*this.orientation-.01)*Math.PI,false);
					}
				}else{
					if(stage.timeout) {
						context.arc(this.x,this.y,this.width/2,(.5*this.orientation+1-.02*stage.timeout)*Math.PI,(.5*this.orientation-1+.02*stage.timeout)*Math.PI,false);
					}
				}
				context.lineTo(this.x,this.y);
				context.closePath();
				context.fill();
			}
		});
		//NPC
		for(var i=0;i<4;i++){
			stage.createItem({
				width:30,
				height:30,
				orientation:3,
				color:_COLOR[i],
				location:map,
				coord:{x:12+i,y:14},
				vector:{x:12+i,y:14},
				type:2,
				frames:10,
				speed:1,
				timeout:Math.floor(Math.random()*120),
				update:function(){
					if(!this.coord.offset){
						if(!this.timeout){
							var new_map = JSON.parse(JSON.stringify(map.data).replace(/2/g,0));
							var items = stage.getItemsByType(2);
							var index = this.index;
							items.forEach(function(item){
								if(item.index!=index){
									new_map[item.coord.y][item.coord.x]=1;
								}
							});
							this.path = map.finder({
								map:new_map,
								start:this.coord,
								end:player.coord
							});
							if(this.path.length){
								this.vector = this.path[0];
							}
						}
						if(this.vector.change){ //是否转变方向
							this.coord.x = this.vector.x;
							this.coord.y = this.vector.y;
							var pos = map.coord2position(this.coord.x,this.coord.y);
							this.x = pos.x;
							this.y = pos.y;
						}
						if(this.vector.x>this.coord.x){
							this.orientation = 0;
						}else if(this.vector.x<this.coord.x){
							this.orientation = 2;
						}else if(this.vector.y>this.coord.y){
							this.orientation = 1;
						}else if(this.vector.y<this.coord.y){
							this.orientation = 3;
						}
					}
					this.x += this.speed*_COS[this.orientation];
					this.y += this.speed*_SIN[this.orientation];
				},
				draw:function(context){
					context.fillStyle = this.color;
					context.beginPath();              
	            	context.arc(this.x,this.y,this.width*.5,0,Math.PI,true);
	            	switch(this.times%2){
	            		case 0:
	            			context.lineTo(this.x-this.width*.5,this.y+this.height*.4);
	            			context.quadraticCurveTo(this.x-this.width*.4,this.y+this.height*.5,this.x-this.width*.2,this.y+this.height*.3);
			            	context.quadraticCurveTo(this.x,this.y+this.height*.5,this.x+this.width*.2,this.y+this.height*.3);
			            	context.quadraticCurveTo(this.x+this.width*.4,this.y+this.height*.5,this.x+this.width*.5,this.y+this.height*.4);
			            	break;
			            case 1:
			            	context.lineTo(this.x-this.width*.5,this.y+this.height*.3);
			            	context.quadraticCurveTo(this.x-this.width*.25,this.y+this.height*.5,this.x,this.y+this.height*.3);
			            	context.quadraticCurveTo(this.x+this.width*.25,this.y+this.height*.5,this.x+this.width*.5,this.y+this.height*.3);
			            	break;
	            	}
	            	context.fill();
	            	context.closePath();
	            	context.fillStyle = '#FFF';
	            	context.beginPath();
	            	context.arc(this.x-this.width*.15,this.y-this.height*.21,this.width*.12,0,2*Math.PI,false);
	            	context.arc(this.x+this.width*.15,this.y-this.height*.21,this.width*.12,0,2*Math.PI,false);
	            	context.fill();
	            	context.closePath();
	            	context.fillStyle = '#000';
	            	context.beginPath();
	            	context.arc(this.x-this.width*(.15-.04*_COS[this.orientation]),this.y-this.height*(.21-.04*_SIN[this.orientation]),this.width*.07,0,2*Math.PI,false);
	            	context.arc(this.x+this.width*(.15+.04*_COS[this.orientation]),this.y-this.height*(.21-.04*_SIN[this.orientation]),this.width*.07,0,2*Math.PI,false);
	            	context.fill();
	            	context.closePath();
				}
			});
		}
		//事件绑定
		stage.bind('keydown',function(e){
			switch(e.keyCode){
				case 13: //回车
				case 32: //空格
					this.status = this.status==2?1:2;
					break;
				case 39: //右
					player.control = {orientation:0};
					break;
				case 40: //下
					player.control = {orientation:1};
					break;
				case 37: //左
					player.control = {orientation:2};
					break;
				case 38: //上
					player.control = {orientation:3};
					break;
			}
		});
	})();
	//结束画面
	(function(){
		var stage = game.createStage();
		//游戏结束
		stage.createItem({
			x:game.width/2,
			y:game.height*.35,
			draw:function(context){
				context.fillStyle = '#FFF';
				context.font = 'bold 48px Helvetica';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText('GAME OVER',this.x,this.y);
			}
		});
		//记分
		stage.createItem({
			x:game.width/2,
			y:game.height*.5,
			draw:function(context){
				context.fillStyle = '#FFF';
				context.font = '20px Helvetica';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText('FINAL SCORE: '+(_SCORE+50*_LIFE),this.x,this.y);
			}
		});
		//事件绑定
		stage.bind('keydown',function(e){
			switch(e.keyCode){
				case 13: //回车
				case 32: //空格
					_SCORE = 0;
					_LIFE = 3;
					var st = game.setStage(1);
					st.reset();
					break;
			}
		});
	})();
	game.init();
})();