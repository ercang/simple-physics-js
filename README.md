# SimplePhysics.js
Fixed step simple physics library that works with circles. This library both works in browser and nodejs environments

### TL;DR;
Here is the example that demonstrates library.

https://ercang.github.io/simple-physics-js/examples/browser_example/

### Features
* Only circles are supported
* Static bodies can be defined using zero mass
* Collision layers are supported
* Bodies can be defined as "triggers"
* There is no rotation support

### Folders
"./src" - Library source files

"./dist" - Minified library as a single file

"./examples" - Example usages of this library

"./third_party" - Third party code

# SimplePhysics.js API
### Create simple physics loop
```
// Create new simple physics instance
var physics = new SimplePhysics({
    fixedStep: 15/1000,
    linearDrag: 5,
    gravity: new SimpleVector(0, 0),
    size: 100
});

// initialize physics
physics.init();

// start loop by using animation frame
window.requestAnimationFrame(updateScreen);

function updateScreen()
{
    // this will run a single fixed time step
    physics.runStep();

    window.requestAnimationFrame(updateScreen);
}

```

### Add circular body
```
var obj = physics.createBody({
        mass: 20,
        radius: 5,
        position: new SimpleVector(0, 0),
        velocity: new SimpleVector(5, 0)
    });
```

### Remove all bodies
```
physics.removeAllBodies();
```

### Iterate through all bodies
```
var bodies = physics.getBodyList();
var arrayLength = bodies.length;
for (var i = 0; i < arrayLength; i++)
{
    var currentBody = bodies[i];

    // get body position
    var pos = currentBody.getPosition();
}
```

### Register to collision events
```
physics.registerCollisionListener({
    onCollision: function(currentBody, otherBody, contactPoint){

    }
});
```
