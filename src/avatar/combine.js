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
    fetchIsAvailable: function() {
      return Promise.all(children.map(function (child) {
        return child.fetchIsAvailable();
      }))
      .then(function (results) {
        return results.every(function (x) { return x; });
      });
    },

    getHandler: function (scene) {
      var handlers = [];

      children.forEach(function (child) {
        handlers.push(child.getHandler(scene));
      });

      /**
       * Find the first handle with the given method and return the result
       */
      function findFirst (method) {
        var result = null;
        if(handlers.some(function (handler) {
          if(handler[method]) {
            result = handler[method]();
            return true;
          }
          return false;
        })) {
          return result;
        }

        throw new Error("No " + method + "() method defined on any avatar handler.");
      }

      /**
       * Call the given method on every handler
       */
      function callEvery (method) {
        var args = Array.prototype.slice.call(arguments, 1);
        handlers.forEach(function (handler) {
          if (handler[method]) {
            handler[method].apply(handler, args);
          }
        });
      }

      return {
        getCamera: function () {
          return findFirst('getCamera');
        },

        getHmd: function () {
          return findFirst('getHmd');
        },

        getControllers: function () {
          return handlers.reduce(
            function (list, handler) {
              if (handler.getControllers) {
                return list.concat(handler.getControllers());
              } else {
                return list;
              }
            },
            []
          );
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

        onRender: function (time, frame) {
          callEvery('onRender', time, frame);
        },

        setLocation: function (matrix, scale) {
          callEvery('setLocation', matrix, scale);
        },

        stop: function () {
          callEvery('stop');
        },
      }
    }
  }

};
