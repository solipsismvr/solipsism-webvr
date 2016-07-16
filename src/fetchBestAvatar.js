var Avatar = require('./Avatar');

/**
 * AvatarCreator lets you register a number of different handlers against categories,
 * and then pass a number of combinatons to createAvatar. The first combination where
 * plugin.isAvaiable() returns true for all handlers will be used to create the avatar
 */
function fetchBestAvatar (candidates) {
  var self = this;

  var category;
  var type;
  var handler;

  // Check availability of all candidates
  return Promise.all(candidates.map(function (candidate, i) {
    return candidate.fetchIsAvailable();

  // Then generate an avatar from the first one that returns true
  }))
  .then(function (results) {
    var candidate;

    results.some(function (isAvailable, i) {
      if (isAvailable) candidate = candidates[i];
      return isAvailable;
    });

    if (candidate) {
      return new Avatar(candidate);
    } else {
      throw new Error("Can't find suitable candidate for Avatar. Get a better computer!");
    }

  });
}

module.exports = fetchBestAvatar;
