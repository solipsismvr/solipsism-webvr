function Avatar (handler) {
  var handlerHandler = null;
  var camera;

  var controllers = null;

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
    onRender: function(time, frame) {
      if (handlerHandler && handlerHandler.onRender) {
        handlerHandler.onRender(time, frame);
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
      if(controllers === null) {
        controllers = handlerHandler.getControllers();
      }
      return controllers;
    },

    /**
     * Calls the given callback with each controller
     */
    withEachController: function(callback) {
      return this.getControllers().forEach(callback);
    },

    /**
     * Calls the given callback with the left controller
     */
    withLeftController: function(callback) {
      var controllers = this.getControllers();
      if(controllers.length > 0) {
        return callback(controllers[0]);
      }
    },

    /**
     * Calls the given callback with the right controller
     */
    withRightController: function(callback) {
      var controllers = this.getControllers();
      if(controllers.length > 1) {
        return callback(controllers[1]);
      }
    },

    /**
     * Calls the given callback if no controllers exist
     */
    withoutControllers: function(callback) {
      if(this.getControllers().length === 0) {
        return callback();
      }
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
