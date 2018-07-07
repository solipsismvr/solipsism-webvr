var ee = require('event-emitter');

function viveController (THREE, options) {

  var appliedOptions = Object.assign({
    count: 2,
  }, options || {});

  return {
    fetchIsAvailable: function () {
      return Promise.resolve(navigator.getGamepads && navigator.xr);
    },

    getHandler: function (scene) {
      // Private properties for world transformation
      var worldLocationMatrix = new THREE.Matrix4();
      var worldScale = 1;

      // Return a single controller object
      function getController(gamepadId) {
        var controller = ee({});
        var wasPressed = [false, false, false, false, false];

        controller.onRender = function (time, vrFrame) {
          var inputSource = null;
          var pose = null;

          if (vrFrame) {
            inputSource = vrFrame.session.getInputSources()[gamepadId];
          }

          if (inputSource) {
            pose = vrFrame.getInputPose(inputSource, window.vrFrameOfRef);
          }

          if (pose && pose.gripMatrix) {
            // Transform gamepad data into the appropriate space
            var matrix = new THREE.Matrix4();
            matrix.fromArray(pose.gripMatrix);

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
            var position = new THREE.Vector3();
            var orientation = new THREE.Quaternion();
            var scaleVector = new THREE.Vector3(1, 1, 1);
            matrix.decompose(position, orientation, scaleVector);
            controller.emit('updatePose', {
              position: [position.x, position.y, position.z],
              quaternion: [orientation.x, orientation.y, orientation.z, orientation.w],
              velocity: pose.linearVelocity ? [pose.linearVelocity.x, pose.linearVelocity.y, pose.linearVelocity.z] : [0, 0, 0],
              angularVelocity: pose.angularVelocity ? [pose.angularVelocity.x, pose.angularVelocity.y, pose.angularVelocity.z] : [0, 0, 0],
              scale: worldScale,
              visible: true,
            });

            /*
            var BUTTON_NAMES = [ 'trackpad', 'trigger', 'menu', 'grip' ];

            // Check buttons
            gamepad.buttons.forEach(function (button, i) {
              if(button.pressed) {
                controller.emit('buttondown', i);
                controller.emit('buttondown.' + BUTTON_NAMES[i], i);

                if(!wasPressed[i]) {
                  controller.emit('buttonpress', i);
                  controller.emit('buttonpress.' + BUTTON_NAMES[i], i);
              }
              } else {
                if(wasPressed[i]) {
                  controller.emit('buttonoff', i);
                  controller.emit('buttonoff.' + BUTTON_NAMES[i], i);
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
            */

          } else {
            controller.emit('updatePose', {
              visible: false
            });
          }
        };

        /**
         * Provide an object that will track movements of the controller
         */
        controller.track = function(object) {
          controller.on('updatePose', function (properties) {
            object.update(properties);
          });
        };

        function controllerAxis(axis) {
          var axisHandler = {};

          return {
            // Allow continuous scrolling, so that multiple swipe gestures can
            // scroll over a range with more precision
            withSwipeMode: function(mode, options) {
              var swipeModeHandler = ee({});

              if(mode !== 'continuous') {
                throw new Error('Only "continuous" mode is supported');
              }

              var chosenOptions = Object.assign(
                { min: 0, max: 1, start: 0.5, speed: 1, epsilon: 0.01 },
                options
              );

              var lastValue = null;
              var baseValue = null;
              var currentValue = chosenOptions.start;

              controller.on('thumbdown', function() {
                baseValue = currentValue - arguments[axis] * chosenOptions.speed * 2;
              });

              controller.on('thumbswipe', function() {
                var nextValue = arguments[axis];

                if(lastValue === null || Math.abs(nextValue - lastValue) > chosenOptions.epsilon) {
                  lastValue = nextValue;

                  currentValue = baseValue + (nextValue * chosenOptions.speed * 2);
                  currentValue = Math.min(chosenOptions.max, Math.max(chosenOptions.min, currentValue));

                  swipeModeHandler.emit('change', currentValue);
                }
              });

              // Pass initial value to any onchange listeners
              setTimeout(function() {
                swipeModeHandler.emit('change', currentValue);
              }, 0);

              swipeModeHandler.getValue = function() {
                return currentValue;
              };

              return swipeModeHandler;
            }
          }
        }

        controller.getXAxis = function () { return controllerAxis(0); }
        controller.getYAxis =  function () { return controllerAxis(1); }

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

        onRender: function (time, vrFrame) {
          controllers.forEach(function (controller) {
            controller.onRender(time, vrFrame);
          });
        }
      }
    }
  };
}

module.exports = viveController;
