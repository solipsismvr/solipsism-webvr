var test = require('tape');

test("SolVR", function (t) {

  var SolVR = require('../src/Solipsism');

  SolVR.clearAvatarHandlers();
  SolVR.registerAvatarHandler('hmd', 'standing', {
    isAvailable: function () { return true; }
  });

  var avatar = SolVR.createAvatar([
    { hmd: 'standing' },
    { hmd: 'seated' },
  ]);

  new Sol();
  t.end();
})
