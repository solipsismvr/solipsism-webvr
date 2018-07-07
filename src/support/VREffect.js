/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
 *
 */

var VREffect = function (THREE, renderer, onError) {

  var vrHMD;
  var vrSession = null;
  var vrFrameOfRef = null;

  var eyeTranslationL = new THREE.Vector3();
  var eyeTranslationR = new THREE.Vector3();
  var renderRectL, renderRectR;
  var eyeFOVL, eyeFOVR;

  if (navigator.xr) {
    navigator.xr.requestDevice().then(function (device) {
      vrHMD = device;
    }).catch(function(error) {
      if (onError) onError('HMD not available: ' + error);
    });
  }

  this.isPresenting = false;
  this.scale = 1;

  var scope = this;

  var rendererSize = renderer.getSize();
  var rendererPixelRatio = renderer.getPixelRatio();

  this.setSize = function ( width, height ) {
    rendererSize = { width: width, height: height };

    if ( scope.isPresenting ) {
      var eyeParamsL = vrHMD.getEyeParameters( 'left' );
      renderer.setPixelRatio( 1 );
      renderer.setSize( eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false );

    } else {
      renderer.setPixelRatio( rendererPixelRatio );
      renderer.setSize( width, height );
    }
  };

  // fullscreen

  var canvas = renderer.domElement;
  var gl = canvas.getContext("webgl");

  /*
  function onFullscreenChange () {
    var wasPresenting = scope.isPresenting;
    scope.isPresenting = vrSession !== null;

    if (wasPresenting === scope.isPresenting) {
      return;
    }

    if (scope.isPresenting) {
      rendererPixelRatio = renderer.getPixelRatio();
      rendererSize = renderer.getSize();

      var eyeParamsL = vrHMD.getEyeParameters( 'left' );
      var eyeWidth, eyeHeight;

      eyeWidth = eyeParamsL.renderWidth;
      eyeHeight = eyeParamsL.renderHeight;

      renderer.setPixelRatio( 1 );
      renderer.setSize( eyeWidth * 2, eyeHeight, false );

    } else {

      renderer.setPixelRatio( rendererPixelRatio );
      renderer.setSize( rendererSize.width, rendererSize.height );

    }

  }
  */

  //window.addEventListener( 'vrdisplaypresentchange', onFullscreenChange, false );

  this.requestPresent = function () {
    return this.setFullScreen(true);
  };

  this.exitPresent = function () {
    return this.setFullScreen(false);
  };

  /**
   * Sets full-screen mode and enables VR
   */
  this.setFullScreen = function (boolean) {
    return new Promise(function (resolve, reject) {
      // No hardware
      if (vrHMD === undefined) {
        reject(new Error('No VR hardware found.'));
        return;
      }

      // No-op
      if (scope.isPresenting === boolean) {
        resolve();
        return;
      }

      // Enable
      if (boolean) {
        resolve(vrHMD.requestSession({ immersive: true, exclusive: true }).then(function(session) {
          vrSession = session;

          // Set this variable to let other subsystems know that a session is active
          window.vrSession = session;
          scope.isPresenting = true;

          return vrSession.requestFrameOfReference("stage")
            .then(function (frameOfRef) {
              window.vrFrameOfRef = frameOfRef;
              vrFrameOfRef = frameOfRef;
            })
            .then(function () {
              return gl.setCompatibleXRDevice(vrHMD)
            })
            .then(function () {
              vrSession.baseLayer = new XRWebGLLayer(vrSession, gl);
            });
        }));

      // Disable
      } else {
        var session = vrSession;
        vrSession = null;
        window.vrSession = null;
        scope.isPresenting = false;
        resolve(session.end());
      }
    });
  };

  // render
  this.render = function (scene, camera, vrFrame) {
    if (vrSession && vrFrame) {
      let pose = vrFrame.getDevicePose(vrFrameOfRef);
      gl.bindFramebuffer(gl.FRAMEBUFFER, vrSession.baseLayer.framebuffer);

      var autoUpdate = scene.autoUpdate;
      if (autoUpdate) {
        scene.updateMatrixWorld();
        scene.autoUpdate = false;
      }

      // TO DO: process this.scale != 1 into separating eye distance
      // TO DO: incorporate camera position

      let cameraEye = new THREE.PerspectiveCamera();
      cameraEye.position.set(0,1.8,0);
      let viewMatrix = new THREE.Matrix4();
      let cameraMatrix = new THREE.Matrix4();

      renderer.setScissorTest( true );
      renderer.clear();

      // Draw each eye
      for (let view of vrFrame.views) {
        let viewport = vrSession.baseLayer.getViewport(view);

        // Set projection matrix
        cameraEye.projectionMatrix.fromArray(view.projectionMatrix);

        // Set view matrix
        // TO DO: incorporate camera position somehow (perhaps a transfomration matrix?)
        viewMatrix.fromArray(pose.getViewMatrix(view));
        cameraMatrix.getInverse(viewMatrix);
        cameraMatrix.decompose(cameraEye.position, cameraEye.quaternion, cameraEye.scale);

        renderer.setViewport( viewport.x, viewport.y, viewport.width, viewport.height );
        renderer.setScissor( viewport.x, viewport.y, viewport.width, viewport.height );
        renderer.render( scene, cameraEye );
      }

      renderer.setScissorTest( false );

      if (autoUpdate) {
        scene.autoUpdate = true;
      }

//      vrHMD.submitFrame();

      return;

    }

    // Regular render mode if not HMD

    renderer.render( scene, camera );

  };

  //

  function fovToNDCScaleOffset( fov ) {

    var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
    var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
    var pyscale = 2.0 / ( fov.upTan + fov.downTan );
    var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
    return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };

  }

  function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

    rightHanded = rightHanded === undefined ? true : rightHanded;
    zNear = zNear === undefined ? 0.01 : zNear;
    zFar = zFar === undefined ? 10000.0 : zFar;

    var handednessScale = rightHanded ? - 1.0 : 1.0;

    // start with an identity matrix
    var mobj = new THREE.Matrix4();
    var m = mobj.elements;

    // and with scale/offset info for normalized device coords
    var scaleAndOffset = fovToNDCScaleOffset( fov );

    // X result, map clip edges to [-w,+w]
    m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
    m[ 0 * 4 + 1 ] = 0.0;
    m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
    m[ 0 * 4 + 3 ] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[ 1 * 4 + 0 ] = 0.0;
    m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
    m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
    m[ 1 * 4 + 3 ] = 0.0;

    // Z result (up to the app)
    m[ 2 * 4 + 0 ] = 0.0;
    m[ 2 * 4 + 1 ] = 0.0;
    m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
    m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

    // W result (= Z in)
    m[ 3 * 4 + 0 ] = 0.0;
    m[ 3 * 4 + 1 ] = 0.0;
    m[ 3 * 4 + 2 ] = handednessScale;
    m[ 3 * 4 + 3 ] = 0.0;

    mobj.transpose();

    return mobj;

  }

  function fovToProjection( fov, rightHanded, zNear, zFar ) {

    var DEG2RAD = Math.PI / 180.0;

    var fovPort = {
      upTan: Math.tan( fov.upDegrees * DEG2RAD ),
      downTan: Math.tan( fov.downDegrees * DEG2RAD ),
      leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
      rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
    };

    return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

  }

};

module.exports = VREffect;
