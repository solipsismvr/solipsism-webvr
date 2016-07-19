function Avatar (handler) {
  var handlerHandler = null;
  var camera;

  return {
    /**
     * Add the avatar to the scene.
     * Most of the avatar's behaviours won't be available until this is called.
     */
    addToScene: function(scene) {
      handlerHandler = handler.getHandler(scene);

      camera = handlerHandler.getCamera();
      scene.add(handlerHandler.applyAvatarObject(camera));
    },

    /**
     * Called by rhe GameLoop on each frame render
     */
    onRender: function(time) {
      if (handlerHandler && handlerHandler.onRender) {
        handlerHandler.onRender(time);
      }
    },

    /**
     * Return the camera object that is used to render the player's viewport
     */
    getCamera: function() {
      return camera;
    },

    /**
     * Return a representation of the HMD, with support for track() and on('updatePose')
     */
    getHmd: function() {
      return handlerHandler.getHmd();
    },

    /**
     * Return an array of representations of controllers, with support for track() and on('updatePose')
     */
    getControllers: function() {
      return handlerHandler.getControllers();
    },

    /**
     * Set the location of the avatar, as a transformation matrix and a scale.
     * This lets you teleport and shrink/grow the player
     */
    setLocation: function(matrix, scale) {
      if (handlerHandler && handlerHandler.setLocation) {
        handlerHandler.setLocation(matrix, scale);
      }
    },
  };
}

module.exports = Avatar;
