var ObjLoader = require('./ObjLoader');

function ViveControllerLoader(THREE) {
  var viveController;

  return function (properties, callback) {
    if(viveController) {
      callback(viveController.clone());

    } else {
      var vivePath = 'models/';
      var loader = new ObjLoader(THREE);
      var self = this;
      loader.load(vivePath + '/vr_controller_vive_1_5.obj', function (object) {
        var loader = new THREE.TextureLoader();

        var mesh = object.children[0];
        mesh.material.map = loader.load( vivePath + 'onepointfive_texture.png' );
        mesh.material.specularMap = loader.load( vivePath + 'onepointfive_spec.png' );

        viveController = object;

        callback(viveController.clone());
      });
    }
  }
}

module.exports = ViveControllerLoader;
