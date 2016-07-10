solipsism-webvr
===============

This package adds WebVR interaction to your [solipsism](https://github.com/sminnee/solipsism) game database. It provides tools for connecting to both HMDs and positional controllers to your solipsism world, as well as fail-over
tools for non-VR devices, and some renderer and gameloop support tools.

Note that although it has shortcuts to make it easier to use with a solipsism game database, it can be used with other
game worlds too.

Getting Started
---------------

### A simple world

To get started, let's assume you have a simple solipisism set-up. This is just a single-player world without physics;
to add physics and client/server multi-player support, see the [solipsism](https://github.com/sminnee/solipsism) docs.

```js
var THREE = require('three')
var Sol = require('solipsism');
var SolVR = require('solipsism-webvr');

var scene = new THREE.Scene();
var world = new Sol.GameWorld('Client');
var threeBinding = new Sol.ThreeBinding(THREE, scene);
world.addBinding(threeBinding);

world.add({
  type: 'light',
  light: 'spotlight',
  color: 0xFFFFFF,
  position: [1,10,5],
});

world.add({
  geometry: { type: 'box', size: [ 2, 0.2, 2 ] },
  material: { type: 'lambert', color: 0x007700 },
  mass: 0,
  position: [0, -0.1, 0],
});

world.add({
  geometry: { type: 'sphere', radius: 0.5, widthSegments: 16, heightSegments: 16 },
  material: { type: 'phong',  color: 0xCC0000, shininess: 60 },
  mass: 5,
  position: [0, 1, 0],
}));
```

### Handling different devices

The first thing we do is create an avatar:

```js
var avatar = SolVR.createAvatar([
  { hmd: 'standing' },
  { hmd: 'seated' },
  { hmd: 'mobile-polyfill', locomotion: 'keyboard' },
  { hmd: 'pointerlock', locomotion: 'keyboard' },
]);
```

The avatar object handles the player view of the game world, and influence in it. Because there are so many devices
available, `createAvatar()` is passed a list of different options. 

Each option will configure interaction

 * hmd:
   * standing: e.g. the HTC Vive
   * seated: e.g. the Oculus Rift or DK2
   * mobile-polyfill: fixed-position head tracking, e.g. Google Cardboard
   * pointerlock: desktop-based interaction with a mouse
 * locomotion:
   * keyboard: Use the arrow keys or WASD keys to move the avatar about the world

So the example above gives us the ability to interact across a number of different devices.

### Set up rendering

Once we have our avatar created, we should add its camera to the scene. We also create a renderer that will 
render to the entire window.

```js
avatar.addToScene(scene);
var renderer = new SolVR.FullScreenRenderer(scene, avatar.getCamera());
```

Next, we need to kick off rendering. `GameLoop` is a simple class that lets us register a number of objects to
have `onRender()` called with every animation frame.

```js
var gameLoop = new SolVR.GameLoop();
gameLoop.add(avatar);
gameLoop.add(renderer);
gameLoop.start();
```

At this point, you should have the ability to explore your scene using the capabilities of whatever device you connect
with.

### Player presence

By default, the player is invisible. In a single player world, this isn't such a big deal, but in a multi-player world
it might be nice to for other players to see you.

In this example, we're representing the player as a blue rectange 30cm x 20cm x 5cm, but you will probably want to get
more creative in your own examples:

```js
// Add a ,
avatar.getHmd().track(
  world.add({
    geometry: { type: 'box', size: [ 0.30, 0.20, 0.05 ] },
    material: { type: 'lambert', color: 0x0000FF },
    mass: 0,
  })
);
```

This relies on a copule of new methods:

 * The `getHmd()` represents the player camera. We use its track() method.
 * The `track()` method will call the `update()` method on whatever is passed into is, passing a payload map with
`position` (3 element array), `quaternion` (4 element arraay), and `visible` (boolean) keys in it. This will work
out-of-the-box with a solipsism GameObject, but other objects could be passed in here too.

### Hand controllers

Similar to the method for getting the player camera, the methods `getControllers()` and `getController(idx)` will
return objects representing in-game controllers.

Note that because some controllers can become available after your page is loaded (e.g. Vive controllers that are
initially turned off), the number of controllers available in this way won't be autodetected. At the moment it is hard
coded to 2 controllers, and any controllers that aren't avialable will send `visible: false` updates.

```js
// Add an object to track
avatar.getControllers().forEach(function (controller) {
  controller.track(
    world.add({
      type: 'viveController'
    })
  );

  // Button handling
  controller.on('buttonPress', function (button) {
    console.log('Button #' + button + ' was pressed');
  });
  controller.on('buttonRelease', function (button) {
    console.log('Button #' + button + ' was released');
  });
});

threeBinding.addObjectTypeLoader('viveController', SolVR.ViveControllerLoader(THREE));
```

The `viveController` object type isn't handled by the normal ThreeBdining, but `SolVR.ViveControllerLoader` can be
added as an object type loader for this. Note that the assets will be loaded directly from GitHub.
