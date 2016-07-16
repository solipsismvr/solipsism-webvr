var AvatarHmd = require('./AvatarHmd.js');

function Avatar (handler) {
  var onRender;
  var camera;

  return {
    addToScene: function(scene) {
      var handlerHandler = handler.getHandler(scene);

      camera = handlerHandler.getCamera();
      onRender = handlerHandler.onRender.bind(handlerHandler);

      scene.add(handlerHandler.applyAvatarObject(camera));
    },
    onRender: function(time) {
      if (onRender) onRender(time);
    },
    getCamera: function() { return camera },
  };
}

module.exports = Avatar;
