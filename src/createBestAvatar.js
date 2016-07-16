var Avatar = require('./Avatar');

/**
 * AvatarCreator lets you register a number of different handlers against categories,
 * and then pass a number of combinatons to createAvatar. The first combination where
 * plugin.isAvaiable() returns true for all handlers will be used to create the avatar
 */
function createBestAvatar (candidates) {
  var self = this;

  var category;
  var type;
  var handler;

  var avatar = null;

  candidates.some(function (candidate) {
    if(candidate.isAvailable()) {
      var handlers = ({ hmd: candidate }).assign(candidate.getOtherHandlers());
      avatar = new Avatar(handlers);
      chosen = candidate;
      return true;
    }

    return false;
  });

  return avatar;
}

module.exports = createBestAvatar;
