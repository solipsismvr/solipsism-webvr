module.exports = function (THREE) {

  return {
    GameLoop: require('./GameLoop'),
    ViveControllerLoader: require('./ViveControllerLoader')(THREE),

    createBestAvatar: require('./createBestAvatar'),
    Avatar: require('./Avatar'),

    // Fun-fact: you can use bind() to curry functions
    AvatarHandlers: {
      combine: require('./avatar/combine'),
      mouseLook: require('./avatar/mouseLook').bind(this, THREE),
      keyboard: require('./avatar/keyboard').bind(this, THREE),

      renderer: require('./avatar/renderer').bind(this, THREE),

// Not yet implemented
//      roomscale: require('./avatar/roomscale').bind(this, THREE),
//      seated: require('./avatar/seated').bind(this, THREE),
//      phoneLook: require('./avatar/phoneLook').bind(this, THREE),
//      viveController: require('./avatar/viveController').bind(this, THREE),
    }
  };

};
