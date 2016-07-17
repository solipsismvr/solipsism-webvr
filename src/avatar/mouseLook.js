var objectTracker = require('../support/objectTracker');

/**
 * AvatarPlugin for a mouse-look based HMD
 */
function mouselook (THREE) {
  return {

    /**
     * Returns true if the browser is capable of using this plugin
     */
    fetchIsAvailable: function () {
      return Promise.resolve('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document);
    },

    /**
     * Get an active instance of this handler
     */
    getHandler: function (scene) {
      var element = document.body;

      var pointerLockEnabled = false;

      // Mouse looking
      var pitchObject = new THREE.Object3D();
      var yawObject = new THREE.Object3D();
      yawObject.position.y = 10;
      yawObject.add(pitchObject);

      // Mouse move - update the rotation variables if pointer lock is enabled
      var onMouseMove = function (event) {
        if (!pointerLockEnabled) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
      };

      // Pointer lock change - ensure pointerLockEnabled is the correct value
      var onPointerLockChange = function (event) {
        pointerLockEnabled = controlsEnabled = (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element);
      };

      // Document click - request pointer lock
      var onDocumentClick = function (event) {
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
      };

      document.addEventListener('mousemove', onMouseMove, false);

      document.addEventListener('pointerlockchange', onPointerLockChange, false);
      document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
      document.addEventListener('webkitpointerlockchange', onPointerLockChange, false);

      element.addEventListener('click', onDocumentClick, false);

      var hmd = objectTracker(THREE, [yawObject, pitchObject]);

      return {

        /**
         * Stop this plugin
         */
        stop: function () {
          document.removeEventListener('mousemove', onMouseMove, false);

          document.removeEventListener('pointerlockchange', onPointerLockChange, false);
          document.removeEventListener('mozpointerlockchange', onPointerLockChange, false);
          document.removeEventListener('webkitpointerlockchange', onPointerLockChange, false);

          element.removeEventListener('click', onDocumentClick, false);
        },

        /**
         * Place the camera inside the pitch/yaw combination
         */
        applyAvatarObject: function (avatarObject) {
          pitchObject.add(avatarObject);
          return yawObject;
        },

        getHmd: function() {
          return hmd;
        },

        onRender: function(time) {
          hmd.onRender(time);
        }
      };
    },
  };
}

module.exports = mouselook;
