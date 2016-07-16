/**
 * Interfaces
 *
 * handler:
 *  - isAvailable()
 *  - getHandler()
 *     - getCamera()
 *     - applyAvatarObject(avatarObject)
 *     - onRender(avatarObject)
 *     - stop()
 */


module.exports = function (children) {

  return {
    isAvailable: function() {
      return handlers.every(function (handler) {
        return handler.isAvailable();
      });
    },

    getHandler: function () {
      var handlers = [];

      children.forEach(function (child) {
        handlers.push(child.getHandler());
      });

      function findFirst (method) {
        var result = null;
        handlers.some(function (handler) {
          if(handler[method]) {
            result = handler[method]();
          }
        });
        return result;
      }

      return {
        getCamera: function () {
          return findFirst('getCamera');
        },

        applyAvatarObject: function (startAvatarObject) {
          return handlers.reduce(
            function (avatarObject, handler) {
              if (handler.applyAvatarObject) {
                return handler.applyAvatarObject(avatarObject);
              } else {
                return avatarObject;
              }
            },
            startAvatarObject
          );
        },

        onRender: function (time) {
          return handlers.forEach(function (handler) {
            if (handler.onRender) {
              handler.onRender(time);
            }
          });
        },

        stop: function () {
          return handlers.forEach(function (handler) {
            if (handler.stop) {
              return handler.stop();
            }
          });
        },
      }
    }
  }

};
