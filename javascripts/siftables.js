if(!Sift) 
  var Sift = {};
  
Sift.Session = function(num) {
  
}

var SiftSim = function() {
  var container, siftables, options;
      
  function addSiftable() {
    var element = $("<div></div>")
      .addClass("siftable")
      .appendTo(container)
    var s = new Siftables.Block(element, options);
    siftables.push(s);
    return s;
  }
  
  function tick() {
    $.each(siftables, function() {
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
      siftables = new Siftables();
      for(var i = 0; i < options.num; i++) {
        addSiftable();
      }
      setInterval(tick, 30)
      return siftables;
    },
    
    add: function() {
      return addSiftable();
    }
  }
}();

/* ---- Siftables container object ----------------------------------------- */

var Siftables = function() {
};
Siftables.prototype = new Array;
$.extend(Siftables.prototype, {
  _tick: function() {
    
  }
})


/**
 * Siftables.Block is an individual block object 
 */

Siftables.Block = function() {
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

$.extend(Siftables.Block.prototype, {
  
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