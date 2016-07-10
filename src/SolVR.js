var AvatarCreator = require('./AvatarCreator');

var avatarCreator = new AvatarCreator();

module.exports = {
  GameLoop: require('./GameLoop'),
  FullScreenRenderer: require('./GameLoop'),
  ViveControllerLoader: require('./ViveControllerLoader'),
  createAvatar: avatarCreator.createAvatar.bind(avatarCreator),
};
