var ee = require('event-emitter');

/**
 * Track a list of Three.JS objects an all listening to updatePose events
 */
function objectTracker(THREE, objects) {

  var tracker = ee({});

  // Retain some variables to reduce the volume of object creation/destruction every frame
  var matrix = new THREE.Matrix4();
  var position = new THREE.Vector3();
  var orientation = new THREE.Quaternion();
  var scaleVector = new THREE.Vector3(1, 1, 1);

  // Get the combined matrix of all objects in the list
  function getMatrix() {
    matrix.copy(objects[0].matrix);
    var i;
    for(i=1; i<objects.length; i++) {
      matrix.multiply(objects[i].matrix);
    }
    return matrix;
  };

  tracker.onRender = function(time) {
    getMatrix().decompose(position, orientation, scaleVector);

    this.emit('updatePose', {
      position: [position.x, position.y, position.z],
      quaternion: [orientation.x, orientation.y, orientation.z, orientation.w],
      visible: true,
    });
  };

  tracker.track = function(gameWorld) {
    this.on('updatePose', function (updates) {
      gameWorld.update(updates);
    });
  };

  return tracker;
}

module.exports = objectTracker;
