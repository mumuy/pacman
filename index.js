//主程序,业务逻辑
(function(){
	var game = new Game('canvas');
	//启动页
	(function(){
		var stage = game.createStage();
		stage.bind('keydown',function(e){
			switch(e.keyCode){
				case 13:
				case 32:
					game.nextStage();
				break;
			}
		});
		//logo
		stage.createItem({
			x:game.width/2,
			y:game.height*.45,
			width:100,
			height:100,
			speed:10,
			draw:function(context){
				context.fillStyle = '#FC3';
				context.beginPath();
				if(this.frames%2){
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
	})();
	//游戏主程序
	(function(){
		var MAP_ORIENTATION = {	//地图方向
			'38':0,
			'39':1,
			'40':2,
			'37':3
		},
			MAP_DATA = [		//地图数据
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
				[0,0,0,0,0,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,0,0,0,0,0],
				[0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0],
				[0,0,0,0,0,1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,1,0,1,0,0,0,0,0],
				[1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1],
				[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
				[1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1],
				[0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0],
				[0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0],
				[0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0],
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
			MAP_SIZE = 20;		//地图大小
		var stage = game.createStage();
		stage.bind('keydown',function(e){
			switch(e.keyCode){
				case 13:
				case 32:
					this.status = this.status==2?1:2;
				break;
			}
		});
		//绘制地图
		var map = stage.createMap({
			x:50,
			y:10,
			data:MAP_DATA,
			draw:function(context){
				var y_length = this.data.length;
				var x_length = this.data[0].length;
				for(var j=0; j<y_length; j++){
					for(var i=0; i<x_length; i++){
						context.lineWidth = 2;
						context.strokeStyle="#09C";
						if(this.get(i,j)){
							var code = 0;
							if(this.get(i,j-1)&&!(this.get(i-1,j-1)&&this.get(i+1,j-1)&&this.get(i-1,j)&&this.get(i+1,j))){
								if(j){
									code += 1000;
								}
							}
							if(this.get(i+1,j)&&!(this.get(i+1,j-1)&&this.get(i+1,j+1)&&this.get(i,j-1)&&this.get(i,j+1))){
								if(i<x_length-1){
									code += 100;
								}
							}
							if(this.get(i,j+1)&&!(this.get(i-1,j+1)&&this.get(i+1,j+1)&&this.get(i-1,j)&&this.get(i+1,j))){
								if(j<y_length-1){
									code += 10;
								}
							}
							if(this.get(i-1,j)&&!(this.get(i-1,j-1)&&this.get(i-1,j+1)&&this.get(i,j-1)&&this.get(i,j+1))){
								if(i){
									code += 1;
								}
							}
							if(code){
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
										if(Math.floor(code/1000)){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x,pos.y-this.size/2);
											context.stroke();
											context.closePath();
										}
										code %= 1000;
										if(Math.floor(code/100)){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x+this.size/2,pos.y);
											context.stroke();
											context.closePath();
										}
										code %= 100;
										if(Math.floor(code/10)){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x,pos.y+this.size/2);
											context.stroke();
											context.closePath();
										}
										code %= 10;
										if(Math.floor(code/1)){
											context.beginPath();
											context.moveTo(pos.x,pos.y);
											context.lineTo(pos.x-this.size/2,pos.y);
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
		//主角
		var pos = map.coord2position(14,23);
		var player = stage.createItem({
			x:pos.x-MAP_SIZE/2,
			y:pos.y,
			width:30,
			height:30,
			orientation:3,
			speed:10,
			draw:function(context){
				context.fillStyle = '#FC3';
				context.beginPath();
				switch(this.orientation){
					case 0:
						if(this.frames%2){
							context.arc(this.x,this.y,this.width/2,1.70*Math.PI,1.30*Math.PI,false);
						}else{
							context.arc(this.x,this.y,this.width/2,1.51*Math.PI,1.49*Math.PI,false);
						}
						break;
					case 1:
						if(this.frames%2){
							context.arc(this.x,this.y,this.width/2,.20*Math.PI,1.80*Math.PI,false);
						}else{
							context.arc(this.x,this.y,this.width/2,.01*Math.PI,1.99*Math.PI,false);
						}
						break;
					case 2:
						if(this.frames%2){
							context.arc(this.x,this.y,this.width/2,.70*Math.PI,.30*Math.PI,false);
						}else{
							context.arc(this.x,this.y,this.width/2,.51*Math.PI,.49*Math.PI,false);
						}
						break;
					case 3:
						if(this.frames%2){
							context.arc(this.x,this.y,this.width/2,1.20*Math.PI,.80*Math.PI,false);
						}else{
							context.arc(this.x,this.y,this.width/2,1.01*Math.PI,.99*Math.PI,false);
						}
						break;
				}
				context.lineTo(this.x,this.y);
				context.closePath();
				context.fill();
			}
		});
		stage.bind('keydown',function(e){
			player.orientation = MAP_ORIENTATION[e.keyCode];
		});
	})();
	game.init();
	game.nextStage();	//测试游戏主布景
})();