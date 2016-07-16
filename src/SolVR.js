module.exports = function (THREE) {

  return {
    GameLoop: require('./GameLoop'),
    ViveControllerLoader: require('./ViveControllerLoader')(THREE),

    fetchBestAvatar: require('./fetchBestAvatar'),
    Avatar: require('./Avatar'),

    // Fun-fact: you can use bind() to curry functions
    AvatarHandlers: {
      combine: require('./avatar/combine'),
      mouseLook: require('./avatar/mouseLook').bind(this, THREE),
      keyboard: require('./avatar/keyboard').bind(this, THREE),
      roomscale: require('./avatar/roomscale').bind(this, THREE),
      viveController: require('./avatar/roomscale').bind(this, THREE),

      renderer: require('./avatar/renderer').bind(this, THREE),

// Not yet implemented
//      seated: require('./avatar/seated').bind(this, THREE),
//      phoneLook: require('./avatar/phoneLook').bind(this, THREE),
//      viveController: require('./avatar/viveController').bind(this, THREE),
    }
  };

};
