/**
 * Created by Ercan on 08.11.2016.
 */

var canvas;
var ctx;
var oneUnitInPixel = 10;
var zoomLevel = 0.2;

var lastSimulationTime = 0;
var totalTime = 0;
var stats;

var physics = new SimplePhysics({
    fixedStep: 15/1000,
    linearDrag: 5,
    gravity: new SimpleVector(0, 0)
});

window.onresize = function(event) {
    if(canvas) {
        canvas.width = window.innerWidth - 100;
        canvas.height = window.innerHeight - 100;
        calculateOnePixelUnit();
    }
};

function calculateOnePixelUnit()
{
    var ratio1 = zoomLevel * canvas.width / 100;
    var ratio2 = (1920/1080) * zoomLevel * canvas.height / 100;

    oneUnitInPixel = Math.max(ratio1, ratio2);
}

function init()
{
    // global hook for the application
    canvas = document.getElementById('debugCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 100;
    oneUnitInPixel = window.innerWidth/100;

    physics.init();
    lastSimulationTime = new Date();

    window.requestAnimationFrame(updateScreen);

    // Add stats
    stats = new Stats();
    stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    // add wheel event handler
    canvas.addEventListener("wheel", function(e){
        e.preventDefault();

        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail || -e.deltaY)));

        zoomLevel += delta*0.02;
        zoomLevel = Math.min(zoomLevel, 1);
        zoomLevel = Math.max(zoomLevel, 0.1);

        calculateOnePixelUnit();
    });

    calculateOnePixelUnit();
}

function onAddBodyClicked()
{
    var x = Math.floor((Math.random() * 50) + 1);
    var y = Math.floor((Math.random() * 50) + 1);

    var sxv = Math.floor((Math.random() * 30) + 1) - 15;
    var syv = Math.floor((Math.random() * 30) + 1) - 15;
    var sx = 25 - x + sxv;
    var sy = 25 - y + syv;

    var r = Math.floor((Math.random() * 5) + 1);

    var obj = physics.createBody({
        mass: r*r,
        radius: r,
        position: new SimpleVector(x, y),
        velocity: new SimpleVector(sx, sy)
    });

    document.getElementById('bodyCountArea').innerHTML = physics.getBodyList().length + " Total Bodies";
}

function onRemoveBodiesClicked()
{
    physics.removeAllBodies();
}

function onToggleGravityClicked()
{
    var g = physics.getGravity();
    if(g.y > 1)
    {
        g.y = 0; // disable gravity
    }
    else if(g.y < -1)
    {
        g.y = 9.81; // enable gravity
    }
    else
    {
        g.y = -9.81
    }
}

function clearScreen()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateScreen()
{
    stats.begin();
    // run step
    var delta = new Date() - lastSimulationTime;
    totalTime += delta;
    lastSimulationTime = new Date();
    while(totalTime > 15){
        physics.runStep();
        totalTime -= 15;
    }

    clearScreen();

    drawPhysicsBodies(physics.getBodyList());

    stats.end();

    window.requestAnimationFrame(updateScreen);
}

function drawPhysicsBodies(bodies)
{
    var arrayLength = bodies.length;
    for (var i = 0; i < arrayLength; i++) {
        var currentBody = bodies[i];

        // draw circle
        var pos = currentBody.getPosition();

        var worldSize = physics.getWorldSize();
        var rad = currentBody.getRadius() * oneUnitInPixel;
        var screenX = (pos.x+worldSize) * oneUnitInPixel;
        var screenY = (pos.y+worldSize) * oneUnitInPixel;

        ctx.beginPath();
        ctx.arc(screenX, screenY, rad, 0, 2 * Math.PI, false);
        ctx.lineWidth = oneUnitInPixel/3;
        ctx.strokeStyle ='#000000';
        if(currentBody.collides() == true) {
            ctx.strokeStyle ='#F00000';
        }
        ctx.stroke();
    }
}