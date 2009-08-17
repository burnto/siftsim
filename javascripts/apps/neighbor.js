
var App = {
  setup: function() {
    $.each(siftables, function(s) {
      this.neighbor = function(s) {
        s.ctx.fillStyle = "rgb(0,0,0)";
        s.ctx.fillRect(0,0,128,128);
        s.ctx.fillStyle = "rgb(200,0,0)";
        if(s.neighbors.bottom) {
          s.ctx.fillRect(34,104,60,10);
        }
        if(s.neighbors.top) {
          s.ctx.fillRect(34,14,60,10);
        }
        if(s.neighbors.left) {
          s.ctx.fillRect(14,34,10,60);
        }
        if(s.neighbors.right) {
          s.ctx.fillRect(104,34,10,60);
        }

        s.ctx.beginPath();
        s.ctx.strokeStyle = 'rgb(0,128,255)';
        s.ctx.lineWidth = 2;
        // s.ctx.fillStyle = ;
        s.ctx.arc(64,64,10,0,Math.PI*2,true);
        s.ctx.stroke();


        // s.ctx.fillStyle = "rgb(200,0,0)";
        // s.ctx.fillRect(64-10,64-10,20,20);
      }
    })
  }
}

