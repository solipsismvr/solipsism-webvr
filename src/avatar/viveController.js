var ee = require('event-emitter');

function viveController (THREE, options) {

  var appliedOptions = Object.assign({
    count: 2,
  }, options || {});

  return {
    fetchIsAvailable: function () {
      return Promise.resolve(navigator.getGamepads && navigator.getVRDisplays);
    },

    getHandler: function (scene) {
      // Fetch standing matrix for roomscale devices
      var standingMatrix = new THREE.Matrix4();
      if (navigator.getVRDisplays) {
        navigator.getVRDisplays().then(function (devices) {
          if((devices.length > 0) && devices[0].stageParameters) {
            standingMatrix.fromArray(devices[0].stageParameters.sittingToStandingTransform);
          }
        });
      }

      // Private properties for world transformation
      var worldLocationMatrix = new THREE.Matrix4();
      var worldScale = 1;

      // Return a single controller object
      function getController(gamepadId) {
        var controller = ee({});
        var wasPressed = [false, false, false, false, false];

        controller.onRender = function () {
          var gamepad = navigator.getGamepads()[gamepadId];

          if (gamepad !== undefined && gamepad.pose !== null) {
            var pose = gamepad.pose;

            // Transform gamepad data into the appropriate space
            var matrix = new THREE.Matrix4();

            var position = new THREE.Vector3();
            var orientation = new THREE.Quaternion();
            var scaleVector = new THREE.Vector3(1, 1, 1);
            position.fromArray(pose.position);
            orientation.fromArray(pose.orientation);

            matrix.compose(position, orientation, scaleVector);
            matrix.multiplyMatrices(standingMatrix, matrix);

            // Handle world transform
            if(worldScale != 1) {
              matrix.decompose(position, orientation, scaleVector);
              position.multiplyScalar(worldScale);
              matrix.compose(position, orientation, scaleVector);
            }
            if(worldLocationMatrix) {
              matrix.multiplyMatrices(worldLocationMatrix, matrix);
            }

            // Emit updatePose events
            matrix.decompose(position, orientation, scaleVector);
            controller.emit('updatePose', {
              position: [position.x, position.y, position.z],
              quaternion: [orientation.x, orientation.y, orientation.z, orientation.w],
              velocity: pose.linearVelocity ? [pose.linearVelocity.x, pose.linearVelocity.y, pose.linearVelocity.z] : [0, 0, 0],
              angularVelocity: pose.angularVelocity ? [pose.angularVelocity.x, pose.angularVelocity.y, pose.angularVelocity.z] : [0, 0, 0],
              scale: worldScale,
              visible: true,
            });

            // Check buttons
            gamepad.buttons.forEach(function (button, i) {
              if(button.pressed) {
                controller.emit('buttondown', i);
                if(!wasPressed[i]) {
                  controller.emit('buttonpress', i);
                }
              } else {
                if(wasPressed[i]) {
                  controller.emit('buttonoff', i);
                }
              }
              wasPressed[i] = button.pressed;
            });

            if(gamepad.axes[0] !== 0 || gamepad.axes[1]  !== 0) {
              if(!wasPressed[4]) {
                controller.emit('thumbdown', gamepad.axes[0], gamepad.axes[1]);
                wasPressed[4] = true;
              }
              controller.emit('thumbswipe', gamepad.axes[0], gamepad.axes[1]);

            } else {
              if(wasPressed[4]) {
                controller.emit('thumbup');
                wasPressed[4] = false;
              }
            }

          } else {
            controller.emit('updatePose', {
              visible: false
            });
          }
        };

        return controller;
      };

      // Build up the controller objects that we need
      var i;
      var controllers = [];
      for(i=0; i<appliedOptions.count; i++) {
        controllers.push(getController(i));
      }

      return {
        setLocation: function (matrix, scale) {
          worldLocationMatrix = matrix;
          worldScale = scale;
        },

        getControllers: function () {
          return controllers;
        },

        onRender: function (time) {
          controllers.forEach(function (controller) {
            controller.onRender(time);
          });
        }
      }
    }
  };
}

module.exports = viveController;
