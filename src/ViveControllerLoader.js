var ObjLoader = require('./support/ObjLoader');

function ViveControllerLoader(THREE) {
  var viveController;

  var callbacks = [];

  return function (properties, callback) {

    // It has loaded
    if(viveController) {
      callback(viveController.clone());

    // It's in the middle of loading
    } else if(callbacks.length) {
      callbacks.push(callback);

    // It hasn't started loading
    } else {
      var vivePath = 'models/';
      var loader = new ObjLoader(THREE);
      var self = this;

      callbacks = [callback];

      loader.load(vivePath + '/vr_controller_vive_1_5.obj', function (object) {
        var loader = new THREE.TextureLoader();

        var mesh = object.children[0];
        mesh.material.map = loader.load( vivePath + 'onepointfive_texture.png' );
        mesh.material.specularMap = loader.load( vivePath + 'onepointfive_spec.png' );
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        viveController = object;

        callbacks.forEach(function (callback) {
          callback(viveController.clone());
        });
        callbacks = [];
      });
    }
  }
}

module.exports = ViveControllerLoader;
