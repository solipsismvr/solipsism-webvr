
function GameLoop() {
  this.callbacks = [];
  this.statusEl = null;
  this.lastFrameTime = (new Date()).getTime();
  this.lastTime = (new Date()).getTime();
  this.frameCounter = 0;

  // Find a vrDisplay to call requestAnimationFrame() on instead, for maximum render-speed
  this.vrDisplay = window;
  if(navigator.getVRDisplays) {
    var self = this;
    navigator.getVRDisplays().then(function(displays) {
      if (displays.length > 0) {
        self.vrDisplay = displays[0];
      }
    });
  }

}

GameLoop.prototype.animate = function() {
  this.vrDisplay.requestAnimationFrame( this.animate.bind(this) );
  this.render();
}

GameLoop.prototype.render = function() {
  var newTime = (new Date()).getTime();

  if (this.statusEl) {
    // Update frame count every 10 frames
    this.frameCounter = (this.frameCounter + 1) % 10;
    if(this.frameCounter === 0) {
      var fps = Math.round(100000/(newTime - this.lastFrameTime))/10;
      this.statusEl.innerHTML = fps + " fps";
      this.lastFrameTime = newTime;
    }
  }

  var delta = (newTime - this.lastTime) / 1000;
  this.lastTime = newTime;

  this.callbacks.forEach(function (callback) {
    callback(delta);
  });
}

/**
 * Add an item to the render loop.
 * Item must have an onRender() method.
 */
GameLoop.prototype.addItem = function(item) {
  this.callbacks.push(function(delta) {
    item.onRender(delta);
  });
}

/**
 * Add a callback to the render loop.
 * Don't forget to bind this, if needed!
 */
GameLoop.prototype.addCallback = function(callback) {
  this.callbacks.push(callback);
}

/**
 * Set the DOM element to write the FPS to
 */
GameLoop.prototype.setStatusEl = function(statusEl) {
  this.statusEl = statusEl;
}

module.exports = GameLoop;
