/**
 * Provides WASD and/or arrow-key keyboard navigation to a Three.JS object
 * @param avatarObject THREE.Object3D that will be moved by the keyboard
 * @author Based on THREE.js example by  mrdoob / http://mrdoob.com/
 */
function keyboard (THREE, options) {

  return {
    isAvailable: function () {
      return true;
    },

    getHandler: function() {
      var controlsEnabled = true;

      var moveForward = false;
      var moveBackward = false;
      var moveLeft = false;
      var moveRight = false;
      var canJump = false;

      var velocity = new THREE.Vector3();
      var avatarObject = new THREE.Object3D();

      var onKeyDown = function (event) {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = true;
            break;

          case 37: // left
          case 65: // a
            moveLeft = true;
            break;

          case 40: // down
          case 83: // s
            moveBackward = true;
            break;

          case 39: // right
          case 68: // d
            moveRight = true;
            break;

          //case 32: // space
          //  if ( canJump === true ) velocity.y += 350;
          //  canJump = false;
          //  break;
        }
      };

      var onKeyUp = function (event) {
        switch( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = false;
            break;

          case 37: // left
          case 65: // a
            moveLeft = false;
            break;

          case 40: // down
          case 83: // s
            moveBackward = false;
            break;

          case 39: // right
          case 68: // d
            moveRight = false;
            break;
        }
      };

      document.addEventListener('keydown', onKeyDown, false);
      document.addEventListener('keyup', onKeyUp, false);

      return {
        stop: function() {
          controlsEnabled = false;
          document.removeEventListener('keydown', onKeyDown, false);
          document.removeEventListener('keyup', onKeyUp, false);
        },

        applyAvatarObject: function (newAvatarObject) {
          avatarObject = newAvatarObject;
          if(options.position) {
            avatarObject.position.fromArray(options.position);
          }
          return avatarObject;
        },

        onRender: function (delta) {
          if (controlsEnabled) {
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            if ( moveForward ) velocity.z -= 10.0 * delta;
            if ( moveBackward ) velocity.z += 10.0 * delta;

            if ( moveLeft ) velocity.x -= 10.0 * delta;
            if ( moveRight ) velocity.x += 10.0 * delta;

            avatarObject.translateX( velocity.x * delta );
            avatarObject.translateZ( velocity.z * delta );
          }
        },

        getPose: function () {
          return {
            position: [avatarObject.x, avatarObject.y, avatarObject.z],
          }
        },
      };
    }
  }
}

module.exports = keyboard;
