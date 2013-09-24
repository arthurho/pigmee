$(document).ready(function() {
  var game = new Game();
  game.init();

})
/******Other ******/
function getRandom() {
  var arr = [];
  for(var i = -5; i < 0; i++) {
    arr.push(i);  
  }
  for(var i = 1; i < 6; i++) {
    arr.push(i);  
  }
  arr.shuffle();
  var rand = Math.floor(Math.random() *arr.length);
  return arr[rand];
}
  
Array.prototype.shuffle = function() {
 	var len = this.length;
	var i = len;
	 while (i--) {
	 	var p = parseInt(Math.random()*len);
		var t = this[i];
  	this[i] = this[p];
  	this[p] = t;
 	}
};
  
/******Game******/
var Game = function() {
  
}

Game.prototype.init = function() {
  
  this.canvas = document.getElementById( 'myCanvas' );
  this.ctx = this.canvas.getContext('2d');
  
  this.leftPaddle = new Paddle(0);
  this.rightPaddle = new Paddle(this.canvas.width - 10);

  this.leftPlayer = new Player(this.leftPaddle, 81, 65); // q, a
  this.rightPlayer = new Player(this.rightPaddle, 80, 76); // p, l
  
  this.ball = new Ball();
  
  this.socket = io.connect('http://192.168.1.123:3000/');
  console.log(this.socket);
  var self = this;
  this.socket.on('receive', function(data) {
    console.log(data);
    var playerId = +data.playerId;
    console.log(playerId);
    console.log(typeof(playerId));
    //console.log(+data.moveY);
    if (playerId == 0) {
    	self.leftPlayer.padY = +data.moveY;
    }
    else if (playerId == 1) {
    	self.rightPlayer.padY = +data.moveY;
    }/*
    switch(playerId) {
      case 0:
        self.leftPlayer.padY = +data.moveY;
      case 1:
        self.rightPlayer.padY = +data.moveY;
    }*/
  });
  
  this.redraw();
  
  this.drawLoop = setInterval(this.redraw.bind(this), 20);
}

Game.prototype.redraw = function() {
  this.updatePlayers();
  this.updateBall();
  this.clearCanvas();
  this.drawBackground();
  this.drawPaddles();
  this.drawBall();
}

Game.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

Game.prototype.drawBackground = function() {
    this.ctx.fillStyle = "#F0F8FF";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

Game.prototype.drawPaddles = function() {
  this.leftPaddle.draw();
  this.rightPaddle.draw();
}

Game.prototype.drawBall = function() {
  this.ball.draw()
}

Game.prototype.updateBall = function() {
  this.ball.bounce(this.leftPaddle, this.rightPaddle, this.leftPlayer, this.rightPlayer)
}

Game.prototype.updatePlayers = function() {
  this.leftPlayer.updatePaddle();
  this.rightPlayer.updatePaddle();
}

/******Player******/
var Player = function(paddle, upkey, downkey) {
  this.canvas = document.getElementById('myCanvas');
  this.ctx = this.canvas.getContext('2d');
  
  this.paddle = paddle;
  this.padY = 0;
  
  this.initKeys(upkey, downkey);
}

Player.prototype.initKeys = function(upkey, downkey) {
  var self = this;
  $(document).keydown(function(e) {
    if(e.keyCode == upkey) {
      self.padY = -10;
    } else if(e.keyCode == downkey) {
      self.padY = 10;
    }
  });
  
  $(document).keyup(function(e) {
    if(e.which == upkey) {
      self.padY = 0;
     } else if(e.which = downkey) {
      self.padY = 0;
     }
  });

}

Player.prototype.updatePaddle = function() {
  if(this.paddle.y + this.padY >= 0 && (this.paddle.y + this.paddle.height + this.padY) <= this.canvas.height) {
      if(this.padY !== 0)
        this.paddle.y += this.padY;
  } 
}

/******Paddle******/
var Paddle = function(x) {
  this.canvas = document.getElementById( 'myCanvas' );
  this.ctx = this.canvas.getContext('2d');
  
  this.height = 100;
  this.width = 10;
  
  this.x = x;
  this.y = this.canvas.height/2
}

Paddle.prototype.draw = function() {
  this.ctx.fillStyle = "#00BFFF";
  this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

/******Ball******/



var Ball = function() {
  this.canvas = document.getElementById( 'myCanvas' );
  this.ctx = this.canvas.getContext('2d');
  
  this.radius = 10;
  this.x = this.canvas.width/2;
  this.y = this.canvas.height/2;
  this.dx = getRandom();
  this.dy = getRandom();
}

Ball.prototype.draw = function() {
  this.ctx.fillStyle = "#00BFFF";
  this.ctx.beginPath();
  this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true); 
  this.ctx.closePath();
  this.ctx.fill();
}

Ball.prototype.bounce = function(paddleLeft, paddleRight, leftPlayer, rightPlayer) {
  this.checkTopBottomWalls();
  this.checkPaddles(paddleLeft, paddleRight);
  this.checkOutOfBounds(leftPlayer, rightPlayer);
  
  
  this.x += this.dx;
  this.y += this.dy;
}

Ball.prototype.moveInit = function() {
  this.x = this.canvas.width/2;
  this.y = this.canvas.height/2;
    
  this.dx = getRandom();
  this.dy = getRandom();
}

Ball.prototype.checkTopBottomWalls = function() {
  if((this.y+this.radius+this.dy) > this.canvas.height || (this.y - this.radius + this.dy) < 0) {
    this.dy *= -1;
  }
}

Ball.prototype.checkOutOfBounds = function(leftPlayer, rightPlayer) {
  if((this.x - this.radius + this.dx) < 0) {
    this.moveInit();
  }
  
  if((this.x + this.radius + this.dx) > this.canvas.width) {
    this.moveInit();
  }
}

Ball.prototype.checkPaddles = function(paddleLeft, paddleRight) {
   if((this.x - this.radius + this.dx) < paddleLeft.x + paddleLeft.width) {
    if(((this.y - this.radius) >= paddleLeft.y) && ((this.y + this.radius) <= (paddleLeft.y + paddleLeft.height))) {
      this.dx = -1*this.dx;
    }
   }
   
   if((this.x + this.radius + this.dx) > paddleRight.x) {
    if(((this.y - this.radius) >= paddleRight.y) && ((this.y + this.radius) <= (paddleRight.y + paddleRight.height))) {
      this.dx = -1*this.dx;
    }
   }
}


