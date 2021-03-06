
if(!Sift) 
  var Sift = {};

Sift.Util = {
  extend: function(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }
}

Sift.Simulator = function() {

  // Simulator Block class definition

  var Block = function() {
    return function(_element, _options) {
      this.options = _options;
      var siftable = this;
      siftable.neighbors = {};
      siftable.element = _element
        .append($("<canvas></canvas>").attr({height: "128", width: "128"}))
        .data("siftable", siftable);
      _element.siblings().andSelf().draggable({stack: {group: ".siftable", min: 50}})
      siftable.ctx = siftable.element.find("canvas").get(0).getContext("2d");
    }
  }()

  $.extend(Block.prototype, {

    furthest: function(direction) {
      var f;
      var siftable = this.neighbors[direction];
      while(siftable) {
        f = siftable;
        siftable = siftable.neighbors[direction];
      }
      return f;
    },

    _updateNeighbors: function() {
      var siftable = this;
      var newNeighbors = {};
      var left = siftable.element.offset().left;
      var top = siftable.element.offset().top;
      var w = siftable.element.width();
      var h = siftable.element.height();
      var right = left + w;
      var bottom = top + h;
      siftable.element.siblings().each(function() {
        var s = $(this);
        var sLeft = s.offset().left;
        var sTop = s.offset().top;
        if(Math.abs(sLeft - left) <= siftable.options.tolerance) {
          if(Math.abs(sTop - bottom) <= siftable.options.tolerance) {
            newNeighbors.bottom = s.data("siftable");
          }else if(Math.abs(sTop + h - top) <= siftable.options.tolerance) {
            newNeighbors.top = s.data("siftable");
          }
        }
        if(Math.abs(sTop - top) <= siftable.options.tolerance) {
          if(Math.abs(sLeft - right) <= siftable.options.tolerance) {
            newNeighbors.right = s.data("siftable");
          }else if(Math.abs(sLeft + w - left) <= siftable.options.tolerance) {
            newNeighbors.left = s.data("siftable");
          }
        }
      })
      var changed = false;
      $.each(["top","right","bottom","left"], function() {
        changed = changed || (siftable.neighbors[this] != newNeighbors[this]);
      });
      siftable.neighbors = newNeighbors;
      return changed;
    },

    _tick: function() {
      if(this._updateNeighbors() && this.neighbor) {
        this.neighbor(this);
      }
      if(this.draw) 
        this.draw(this);
    }
  });


  // Simulator setup, functions, and interface

  var container, mySiftables, options;

  function addSiftable() {
    var element = $("<div></div>")
      .addClass("siftable")
      .appendTo(container)
    var s = new Block(element, options);
    mySiftables.push(s);
    return s;
  }

  function tick() {
    $.each(mySiftables, function() {
      this._tick()
    });
  }

  return {
    init: function(_container, _options) {
      options = {
        tolerance: 5,
        num: 4
      };
      $.extend(options, _options);
      container = $(_container).empty();
      mySiftables = [];
      for(var i = 0; i < options.num; i++) {
        addSiftable();
      }
      // setInterval(tick, 50)
      return {
        siftables: mySiftables,
        loop: function() {
          tick();
        },
        add: function() {
          return addSiftable();
        },
        clear: function() {
          container.empty();
          mySiftables = [];
        }
      }
    }
  }
}()

Sift.AppRunner = function() {
  
  var frameRate = 24;
  var app;
  var paused = false;
  var siftEnv;
  
  var timestamp;
  
  function loopAndRepeat() {
    timestamp = new Date();
    if(!paused) {
      siftEnv.loop();
      if(app.loop)
        app.loop(siftEnv);
    }
    var n = new Date() - timestamp;
    setTimeout(loopAndRepeat, (1000 / frameRate) - n)
  }
  
  function createSiftInterface() {
    return {
      siftables: siftEnv.siftables,
      quit: function() {
        console.log("quitting");
      },
    }
  }
  
  return {
    
    init: function(_siftEnv) {
      siftEnv = _siftEnv;
    },
    
    load: function(_app) {
      app = _app;
      app.setup(createSiftInterface());
      loopAndRepeat();
    },
    
    pause: function(_paused) {
      paused = _paused;
    },
    
    togglePause: function() {
      console.log("Pausing!")
      paused = !paused;
    }
    
  }
  
}();