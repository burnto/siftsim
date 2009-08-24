
/** Atoms
 * 
 */

var App = function() {
  
  return {
    setup: function() {
      $.each(siftables, function(s) {
        var i = 0;
        var target = [63,63];
        var position = target;

        this.draw = function(s) {
          s.ctx.fillStyle = "rgb(0,0,0)";
          s.ctx.fillRect(0,0,128,128);

          position = [position[0] + (target[0] - position[0]) * 0.5,
                      position[1] + (target[1] - position[1]) * 0.5]
          s.ctx.fillStyle = "rgb(200,0,0)";
          s.ctx.fillRect(position[0] - 5, position[1] - 5, 10, 10);
        }


        this.neighbor = function(s) {
          target = [63,63];
          if(s.neighbors.top) {
            target[1] -= 58;
          }
          if(s.neighbors.right) {
            target[0] += 59
          }
          if(s.neighbors.bottom) {
            target[1] += 59
          }
          if(s.neighbors.left) {
            target[0] -= 58
          }
        }
      })
    }
  }
  
}()

