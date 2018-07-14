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

var VREffect = function ( THREE, renderer, onError ) {

  var vrHMD;
  var renderRectL, renderRectR;
  var eyeFOVL, eyeFOVR;

  function gotVRDevices( devices ) {

    for ( var i = 0; i < devices.length; i ++ ) {

      if ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) {

        vrHMD = devices[ i ];
        break; // We keep the first we encounter

      }

    }

    if ( vrHMD === undefined ) {

      if ( onError ) onError( 'HMD not available' );

    }

  }

  if ( navigator.getVRDisplays ) {

    navigator.getVRDisplays().then( gotVRDevices );

  }

  //

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

  function onFullscreenChange () {

    var wasPresenting = scope.isPresenting;
    scope.isPresenting = vrHMD !== undefined && vrHMD.isPresenting;

    if ( wasPresenting === scope.isPresenting ) {

      return;

    }

    if ( scope.isPresenting ) {

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

  window.addEventListener( 'vrdisplaypresentchange', onFullscreenChange, false );

  this.setFullScreen = function ( boolean ) {

    return new Promise( function ( resolve, reject ) {

      if ( vrHMD === undefined ) {

        reject( new Error( 'No VR hardware found.' ) );
        return;

      }

      if ( scope.isPresenting === boolean ) {

        resolve();
        return;

      }

      if ( boolean ) {

        resolve( vrHMD.requestPresent( [ { source: canvas } ] ) );

      } else {

        resolve( vrHMD.exitPresent() );

      }

    } );

  };

  this.requestPresent = function () {

    return this.setFullScreen( true );

  };

  this.exitPresent = function () {

    return this.setFullScreen( false );

  };

  // render

  var cameraL = new THREE.PerspectiveCamera();
  cameraL.layers.enable( 1 );

  var cameraR = new THREE.PerspectiveCamera();
  cameraR.layers.enable( 2 );

  var cameraMatrix = new THREE.Matrix4();
  var viewMatrix = new THREE.Matrix4();
  var standingMatrix = new THREE.Matrix4();
  var invStandingMatrix = new THREE.Matrix4();

  var frameData = new VRFrameData();

  this.render = function ( scene, camera ) {

    if ( vrHMD && scope.isPresenting ) {

      var autoUpdate = scene.autoUpdate;

      if ( autoUpdate ) {

        scene.updateMatrixWorld();
        scene.autoUpdate = false;

      }

      vrHMD.getFrameData(frameData);
      standingMatrix.fromArray(vrHMD.stageParameters.sittingToStandingTransform);
      invStandingMatrix.getInverse(standingMatrix);

      var eyeParamsL = vrHMD.getEyeParameters( 'left' );
      var eyeParamsR = vrHMD.getEyeParameters( 'right' );

      // When rendering we don't care what the recommended size is, only what the actual size
      // of the backbuffer is.
      var size = renderer.getSize();
      renderRectL = { x: 0, y: 0, width: size.width / 2, height: size.height };
      renderRectR = { x: size.width / 2, y: 0, width: size.width / 2, height: size.height };

      renderer.setScissorTest( true );
      renderer.clear();

      if ( camera.parent === null ) camera.updateMatrixWorld();

      cameraL.projectionMatrix.fromArray(frameData.leftProjectionMatrix);
      cameraR.projectionMatrix.fromArray(frameData.rightProjectionMatrix);

      viewMatrix.fromArray(frameData.leftViewMatrix);
      viewMatrix.multiply(invStandingMatrix);
      cameraMatrix.getInverse(viewMatrix);

      cameraMatrix.decompose(cameraL.position, cameraL.quaternion, cameraL.scale);

      viewMatrix.fromArray(frameData.rightViewMatrix);
      viewMatrix.multiply(invStandingMatrix);
      cameraMatrix.getInverse(viewMatrix);

      cameraMatrix.decompose(cameraR.position, cameraR.quaternion, cameraR.scale);

//    To do, reincorporate camera movement
//      camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );
//      camera.matrixWorld.decompose( cameraR.position, cameraR.quaternion, cameraR.scale );
//      var scale = this.scale;
//      cameraL.translateOnAxis( eyeTranslationL, scale );
//      cameraR.translateOnAxis( eyeTranslationR, scale );


      // render left eye
      renderer.setViewport( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );
      renderer.setScissor( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );
      renderer.render( scene, cameraL );

      // render right eye
      renderer.setViewport( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );
      renderer.setScissor( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );
      renderer.render( scene, cameraR );

      renderer.setScissorTest( false );

      if ( autoUpdate ) {

        scene.autoUpdate = true;

      }

      vrHMD.submitFrame();

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
