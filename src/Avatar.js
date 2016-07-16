var AvatarHmd = require('./AvatarHmd.js');

function Avatar (handler) {
  var handlerHandler = handler.getHandler();
  var camera = handlerHandler.getCamera();
  var avatarObject = handlerHandler.applyAvatarObject(camera);

  return {
    onRender: handlerHandler.onRender.bind(handlerHandler),
    getCamera: function() { return camera },
    addToScene: function(scene) { scene.add(avatarObject); },
  };
}

module.exports = Avatar;
