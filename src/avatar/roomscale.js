var VRControls = require('../support/VRControls');

module.exports = function (THREE, options) {
  var vrControls = new VRControls(THREE, new THREE.Object3D());
  var matrix = new THREE.Matrix4();
  var scale = 1;

  return {
    fetchIsAvailable: function() {
      return vrControls.fetchHasRoomscaleVRDisplay();
    },

    getHandler: function() {
      var avatarObject;

      return {
        applyAvatarObject: function (avatarObject) {
          var vrControls = new VRControls(avatarObject);
          vrControls.track = function (gameObject) {
            vrControls.on('updatePose', function(pose) {
              gameObject.upate(pose);
            });
          }
        },

        getHmd: function () {
          return vrControls;
        },

        setLocation: function (newMatrix, newScale) {
          matrix = newMatrix;
          scale = newScale;
        },

        onRender: function () {
          vrControls.update(matrix, scale);
        },
      };
    },
  };
};
