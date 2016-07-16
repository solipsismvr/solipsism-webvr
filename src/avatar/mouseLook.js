/**
 * AvatarPlugin for a mouse-look based HMD
 */
function mouselook (THREE) {
  return {

    /**
     * Returns true if the browser is capable of using this plugin
     */
    isAvailable: function () {
      return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    },

    /**
     * Get an active instance of this handler
     */
    getHandler: function () {
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

        getCamera: function () {
          return new THREE.PerspectiveCamera( 70, 1, 0.01, 100 );
        },

        /**
         * Place the camera inside the pitch/yaw combination
         */
        applyAvatarObject: function (avatarObject) {
          pitchObject.add(avatarObject);
          return yawObject;
        },

        /**
         * Returns the pose information; in this case a quaternion
         */
        getPose: function () {
          console.log('not implemennted');
          return;

          var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );
          var quaternion = new THREE.Quaternion();
          rotation.set(xRotation, yRoation, 0);
          quaternion.setFromEuler(rotation);

          return {
            quaternion: quaternion
          };
        },
      };
    },
  };
}

module.exports = mouselook;
