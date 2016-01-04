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
	var map_data = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
	[1,0,1,0,0,1,0,1,0,0,0,1,0,1,1,0,1,0,0,0,1,0,1,0,0,1,0,1],
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
];		//地图数据
	(function(){
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
		stage.createMap({
			x:60,
			y:15,
			data:map_data,
			draw:function(context){
				context.strokeStyle='#f00';
				context.beginPath();
				context.moveTo(15,15);
				context.lineTo(15,15-this.size/2);
				context.stroke();
				context.closePath();
				context.beginPath();
				context.moveTo(15,15);
				context.lineTo(15,15+this.size/2);
				context.stroke();
				context.closePath();
				// var x_length = this.data[0].length;
				// var y_length = this.data.length;
				// for(var i=0; i<x_length; i++){
				// 	for(var j=0; j<y_length; j++){
				// 		context.lineWidth = 2;
				// 		context.strokeStyle="#09c";
				// 		if(this.get(j,i)){
				// 			var x = this.x+i*this.size;
				// 			var y = this.y+j*this.size;
				// 			var code = 0;
				// 			if(this.get(j-1,i)&&!(this.get(j-1,i-1)&&this.get(j-1,i+1)&&this.get(j,i-1)&&this.get(j,i+1))){
				// 				if(j){
				// 					code += 1000;
				// 				}
				// 			}
				// 			if(this.get(j,i+1)&&!(this.get(j-1,i+1)&&this.get(j+1,i+1)&&this.get(j-1,i)&&this.get(j+1,i))){
				// 				if(i<x_length-1){
				// 					code += 100;
				// 				}
				// 			}
				// 			if(this.get(j+1,i)&&!(this.get(j+1,i-1)&&this.get(j+1,i+1)&&this.get(j,i-1)&&this.get(j,i+1))){
				// 				if(j<y_length-1){
				// 					code += 10;
				// 				}
				// 			}
				// 			if(this.get(j,i-1)&&!(this.get(j-1,i-1)&&this.get(j+1,i-1)&&this.get(j-1,i)&&this.get(j+1,i))){
				// 				if(i){
				// 					code += 1;
				// 				}
				// 			}
				// 			if(code){
				// 				context.beginPath();
				// 				switch(code){
				// 					case 1100:
				// 						context.arc(x+this.size,y-this.size,this.size/2,.5*Math.PI,1*Math.PI,false);
				// 						context.stroke();
				// 						context.closePath();
				// 						break;
				// 					case 110:
				// 						context.arc(x+this.size,y+this.size,this.size/2,Math.PI,1.5*Math.PI,false);
				// 						context.stroke();
				// 						context.closePath();
				// 						break;
				// 					case 11:
				// 						context.arc(x-this.size,y+this.size,this.size/2,1.5*Math.PI,2*Math.PI,false);
				// 						context.stroke();
				// 						context.closePath();
				// 						break;
				// 					case 1001:
				// 						context.arc(x-this.size,y-this.size,this.size/2,0,.5*Math.PI,false);
				// 						context.stroke();
				// 						context.closePath();
				// 						break;
				// 					default:
				// 						if(code/1000){
				// 							context.moveTo(x,y);
				// 							context.lineTo(x,y-this.size);
				// 							context.stroke();
				// 							context.closePath();
				// 							context.beginPath();
				// 						}
				// 						code %= 1000;
				// 						if(code/100){
				// 							context.moveTo(x,y);
				// 							context.lineTo(x+this.size,y);
				// 							context.stroke();
				// 							context.closePath();
				// 							context.beginPath();
				// 						}
				// 						code %= 100;
				// 						if(code/10){
				// 							context.moveTo(x,y);
				// 							context.lineTo(x,y+this.size);
				// 							context.stroke();
				// 							context.closePath();
				// 							context.beginPath();
				// 						}
				// 						code %= 10;
				// 						if(code/1){
				// 							context.moveTo(x,y);
				// 							context.lineTo(x-this.size,y);
				// 							context.stroke();
				// 						}
				// 						context.closePath();
				// 				}
				// 			}
				// 		}
				// 	}
				// }
			}
		});
	})();
	game.init();
})();