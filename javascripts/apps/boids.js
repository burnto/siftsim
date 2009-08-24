
var App = function() {

  // our sift session
  var session;
  var flock;
  var siftables;

  return {

    setup: function(appRunner) {
      siftables = appRunner.siftables;
      flock = new Flock()
      for(var i = 0; i < 30; i++) {
        flock.addBoid(new Boid(appRunner.siftables[0], new Vector(128/2, 128/2)))
      }
    },

    loop: function() {
      // siftables.each(function(i) {
      //   console.log(i);
      // })
      $.each(siftables, function(i) {
        
        siftables[i].ctx.clearRect(0,0,128,128)
        siftables[i].ctx.clearRect(0,0,128,128)
      })
      flock.run();
    }

  }
}()
  
function Flock() {
  this.boids = new Array();
}
Flock.prototype = {
  run: function() {
    for(var i in this.boids) {
      this.boids[i].run(this.boids);
    }
  },
  
  addBoid: function(b) {
    this.boids.push(b);
  }
}
  
function Boid(_siftable, _loc) {
  this.siftable = _siftable;
  this.acc = new Vector(0,0)
  this.vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
  this.loc = _loc;
  this.r = 2;
  this.maxspeed = 5.0;
  this.maxforce = 0.1;
}
Boid.prototype = {
  run: function(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  },
  
  flock: function(boids) {
    sep = this.separate(boids);   // Separation
    ali = this.align(boids);      // Alignment
    coh = this.cohesion(boids);   // Cohesion
    // Arbitrarily weight these forces
    // sep.mult(2.0);
    // ali.mult(1.0);
    // coh.mult(1.0);
    sep.mult(2.0);
    ali.mult(2.0);
    coh.mult(2.0);
    // Add the force vectors to acceleration
    this.acc.add(sep);
    this.acc.add(ali);
    this.acc.add(coh);
  },
  
  update: function() {
    // Update velocity
    this.vel.add(this.acc);
    // Limit speed
    this.vel.limit(this.maxspeed);
    this.loc.add(this.vel);
    // Reset accelertion to 0 each cycle
    this.acc.mult(0);
  },  
  
  seek: function(target) {
    this.acc.add(this.steer(target,false));
  },
 
  arrive: function(target) {
    this.acc.add(this.steer(target,true));
  },

  steer: function(target, slowdown) {
    steer = new Vector(0,0,0);  // The steering vector
    desired = Vector.sub(target,this.loc);  // A vector pointing from the location to the target
    d = desired.mag(); // Distance from the target is the magnitude of the vector
    // If the distance is greater than 0, calc steering (otherwise return zero vector)
    if (d > 0) {
      // Normalize desired
      desired.normalize();
      // Two options for desired vector magnitude (1 -- based on distance, 2 -- maxspeed)
      if(slowdown && (d < 100)) 
        desired.mult(this.maxspeed*(d/100.0)); // This damping is somewhat arbitrary
      else 
        desired.mult(this.maxspeed);
      // Steering = Desired minus Velocity
      steer = Vector.sub(desired,this.vel);
      steer.limit(this.maxforce);  // Limit to maximum steering force
    } else {
      steer = new Vector(0,0);
    }
    return steer;
  },
  
  borders: function() {
    if (this.loc.x < -this.r) {
      this.siftable = (this.siftable.neighbors.left || this.siftable.furthest("right") || this.siftable);
      this.loc.x = 128 + this.r;
    }else if (this.loc.x > 128+this.r) {
      this.siftable = (this.siftable.neighbors.right || this.siftable.furthest("left") || this.siftable);
      this.loc.x = -this.r;
    }
    if (this.loc.y < -this.r) {
      this.siftable = (this.siftable.neighbors.top || this.siftable.furthest("bottom") || this.siftable);
      this.loc.y = 128 + this.r;
    }
    if (this.loc.y > 128+this.r) {
      this.siftable = (this.siftable.neighbors.bottom || this.siftable.furthest("top") || this.siftable);
      this.loc.y = -this.r;
    }
  },
  
  separate: function(boids) {
     desiredseparation = 25.0;
     sum = new Vector(0,0,0);
     count = 0;
     // For every boid in the system, check if it's too close
     for(var i in boids) {
       other = boids[i];
       d = this.loc.dist(other.loc);
       // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
       if ((d > 0) && (d < desiredseparation)) {
         // Calculate vector pointing away from neighbor
         diff = Vector.sub(this.loc,other.loc);
         diff.normalize();
         diff.div(d);        // Weight by distance
         sum.add(diff);
         count++;            // Keep track of how many
       }
     }
     // Average -- divide by how many
     if (count > 0) {
       sum.div(count);
     }
     return sum;
   },
  
  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align: function(boids) {
    neighbordist = 50.0;
    sum = new Vector(0,0,0);
    count = 0;
    for(var i in boids) {
      other = boids[i];
      d = this.loc.dist(other.loc);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(other.vel);
        count++;
      }
    }
    if(count > 0) {
      sum.div(count);
      sum.limit(this.maxforce);
    }
    return sum;
  },
  
  cohesion: function(boids) {
    neighbordist = 10.0;
    sum = new Vector(0,0);   // Start with empty vector to accumulate all locations
    count = 0;
    for(var i in boids) {
      other = boids[i];
      d = this.loc.dist(other.loc);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(other.loc); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.steer(sum,false);  // Steer towards the location
    }
    return sum;
  },
  
  render: function() {
    var ctx = this.siftable.ctx;
    ctx.strokeStyle = 'rgb(0,128,255)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.loc.x,this.loc.y,this.r,0,Math.PI*2,true);
    ctx.stroke();
  },
  
  updatePosition: function() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x += Math.random() - 1
    this.velocity.y += Math.random() - 1
  }
}



/** 
 * VECTOR
 */
 
function Vector(_x, _y, _z) {
  if(_y == undefined) _y = 0;
  if(_z == undefined) _z = 0;

  this.x = _x;
  this.y = _y;
  this.z = _z;
  
}
Vector.sub = function(v1,v2) {
  return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}
Vector.c = ["x", "y", "z"];
Vector.prototype = {
  mult: function(m) {
    for(var i in Vector.c) {
      i = Vector.c[i];
      this[i] = this[i] * m;
    }
  },
  div: function(m) {
    this.mult(1/m);
  },

  add: function(v2) {
    for(var i in Vector.c) {
      i = Vector.c[i]
      this[i] += v2[i];
    }
  },

  mag: function() {
    var sum = 0;
    for(var i in Vector.c) {
      i = Vector.c[i];
      sum += Math.pow(this[i], 2);
    }
    return Math.sqrt(sum);
  },
  
  normalize: function() {
    var mag = this.mag();
    var d = 1/mag;
    this.mult(d);
  },

  dist: function(v2) {
    return Vector.sub(this, v2).mag();
  },
  
  limit: function(m) {
    var mag = this.mag();
    if(mag > m) {
      var d = m/mag;
      this.mult(d);
    }
  }

}

