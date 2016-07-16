var VREffect = require('./support/VREffect');
var WEBVR = require('./support/WebVR');

function FullScreenRenderer (THREE, scene, camera) {
  this.scene = scene;

  // Create a camera
  this.camera = camera;
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();

  // Set up the base renderer
  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  //this.renderer.shadowMap.enabled = true;
  //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  this.renderer.setClearColor( 0x101010 );
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.sortObjects = false;

  // Layer the VREffect onto the renderer
  this.effect = new VREffect( THREE, this.renderer );

  // Attach to the document.[]
  document.body.appendChild(this.renderer.domElement);

  // Add the VR toggling button
  if (WEBVR.isLatestAvailable() === true) {
    var self = this;
    document.body.appendChild( WEBVR.getButton( this.effect ) );
  }

  var msg;
  if( msg = WEBVR.getMessage()) {
    document.body.appendChild( msg );
  }

  // Add a resize handler
  window.addEventListener('resize', (function () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.effect.setSize( window.innerWidth, window.innerHeight );
  }).bind(this));
}

FullScreenRenderer.prototype.onRender = function() {
  this.effect.render(this.scene, this.camera);
}

module.exports = FullScreenRenderer;
