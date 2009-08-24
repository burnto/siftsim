

var App = function() {

  // our sift session
  var session;
  
  // game variables
  var blocks;
  var i = 0;
  
  var critter;

  var appInterface = {

    setup: function(appRunner) {
      // blocks = appRunner.siftables.map(function(siftable) {
      //   return new Block(siftable)
      // })
      critter = new Critter (appRunner.siftables[0])
    },

    loop: function() {
      
      critter.draw();
      critter.updatePosition();
    }

  }
  
  function Block(siftable, critters) {
    this.siftable = siftable;
    this.critters = critters;
  }
  Block.prototype = {
    draw: function() {
      var s = this.siftable;
      s.ctx.fillStyle = "rgb(0,0,0)";
      s.ctx.fillRect(0,0,128,128);
      s.ctx.strokeStyle = 'rgb(0,128,255)';
      s.ctx.lineWidth = 2;
      if(s.neighbors.top) {
        s.ctx.beginPath();
        s.ctx.arc(64,64,10,0,Math.PI*2,true);
        s.ctx.stroke();
        neighborChanged = false;
      }
    }
  }
  
  function Critter(siftable) {
    this.siftable = siftable;
    this.position = { x: 63, y: 63 };
    this.velocity = { x: Math.random() * 3 - 2, y: Math.random() * 3 - 2}
  }
  Critter.prototype = {
    draw: function() {
      // draw
      var ctx = this.siftable.ctx;
      ctx.clearRect(0,0,128,128)
      ctx.strokeStyle = 'rgb(0,128,255)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.position.x,this.position.y,10,0,Math.PI*2,true);
      ctx.stroke();
    },
    
    updatePosition: function() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.velocity.x += Math.random() - 1
      this.velocity.y += Math.random() - 1
    }
  }
  return appInterface;
  
}()
