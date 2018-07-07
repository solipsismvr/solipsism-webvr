
function GameLoop() {
  this.callbacks = [];
  this.statusEl = null;
  this.lastFrameTime = (new Date()).getTime();
  this.lastTime = (new Date()).getTime();
  this.frameCounter = 0;
}

GameLoop.prototype.start = function() {
  this.isAnimating = true;

  frameSource = window.vrSession ? window.vrSession : window;
  frameSource.requestAnimationFrame( this.drawFrame.bind(this) );
}

GameLoop.prototype.stop = function() {
  this.isAnimating = false;
}

GameLoop.prototype.drawFrame = function(delta, vrFrame) {
  this.render(vrFrame);

  if( this.isAnimating) {
    frameSource = window.vrSession ? window.vrSession : window;
    frameSource.requestAnimationFrame( this.drawFrame.bind(this) );
  }
}

GameLoop.prototype.render = function(vrFrame) {
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
    callback(delta, vrFrame);
  });
}

/**
 * Add an item to the render loop.
 * Item must have an onRender() method.
 */
GameLoop.prototype.addItem = function(item) {
  console.log('additem', item)
  if (!item.onRender) {
    console.log('GameLoop.addItem(): No onRender() method on', item);
    return;
  }

  this.callbacks.push(function(delta,b) {
    item.onRender(delta,b);
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
