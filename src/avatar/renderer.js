var VREffect = require('../support/VREffect');
var WEBVR = require('../support/WebVR');

function renderer (THREE, options) {
  var appliedOptions = Object.assign({
    parentEl: document.body,
    shadows: false,
    minDistance: 0.01,
    maxDistance: 100,
    antialias: false,
  }, options || {});

  return {
    fetchIsAvailable: function () {
      return Promise.resolve(true);
    },

    getHandler: function (scene) {
      // Create a camera
      var camera = new THREE.PerspectiveCamera(70, 1, appliedOptions.minDistance, appliedOptions.maxDistance);

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Set up the base renderer
      renderer = new THREE.WebGLRenderer({
        antialias: appliedOptions.antialias,
        preserveDrawingBuffer: true,
      });
      renderer.setClearColor(0x101010);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.sortObjects = false;

      if(appliedOptions.shadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }

      // Layer the VREffect onto the renderer
      vrEffect = new VREffect(THREE, renderer);

      // Attach to the document.[]
      appliedOptions.parentEl.appendChild(renderer.domElement);

      // Add the VR toggling button
      if (WEBVR.isLatestAvailable() === true) {
        var self = this;
        appliedOptions.parentEl.appendChild( WEBVR.getButton( vrEffect ) );
      }

      var msg;
      if( msg = WEBVR.getMessage()) {
        appliedOptions.parentEl.appendChild( msg );
      }

      var onResize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      // Add a resize handler
      window.addEventListener('resize', onResize);

      return {
        getCamera: function () {
          return camera;
        },

        setLocation: function (matrix, scale) {
          vrEffect.scale = scale;
        },

        onRender: function () {
          vrEffect.render(scene, camera);
        }
      }
    }
  };
}

module.exports = renderer;
