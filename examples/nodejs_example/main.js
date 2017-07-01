/**
 * Created by Ercan on 04.12.2016.
 */

var SimplePhysics = require("../../src/SimplePhysics");
var SimpleBody = require("../../src/SimpleBody");
var SimpleVector = require("../../src/SimpleVector");

console.log("============================");
console.log("Physics Test For NodeJS");
console.log("============================");

var physics = new SimplePhysics({
    fixedStep: 15/1000,
    linearDrag: 5
});

physics.init();

var obj = physics.createBody({
    mass: 1,
    radius: 1,
    position: new SimpleVector(0, 0),
    velocity: new SimpleVector(0, 0)
});
var pos = obj.getPosition();

console.log("Created SimpleBody");
console.log("Initial Object Position: [" + pos.x + ", " + pos.y + "]");

var iterationCount = 100;

var forceVector = new SimpleVector(100,0);
console.log("Apply Force on Body [x: " + forceVector.x + ", y:" + forceVector.y + "]");

obj.applyForce(forceVector);

for(var i=0; i<iterationCount; i++)
{
    physics.runStep();
}

console.log("After " + iterationCount + " iterations!");
console.log("Last Object1 Position: [" + pos.x + ", " + pos.y + "]");
