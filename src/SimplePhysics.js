if (typeof module !== 'undefined' && module.exports) {
    SimpleVector = require('./SimpleVector');
    SimpleBody = require('./SimpleBody');
    SpatialHash = require('../third_party/spatialhash');
}

(function(w)
{
    ////////////////////////////////////////////////////////
    // SimplePhysics Definition
    ////////////////////////////////////////////////////////
    function SimplePhysics(options)
    {
        if (typeof(options) === 'undefined') options = {};
        if (typeof(options.fixedStep) === 'undefined') options.fixedStep = 30/1000; // 30 msec
        if (typeof(options.linearDrag) === 'undefined') options.linearDrag = 10;
        if (typeof(options.size) === 'undefined') options.size = 100;
        if (typeof(options.gravity) === 'undefined') options.gravity = new SimpleVector(0,0);

        // member definitions
        this._fixedStep = options.fixedStep;
        this._linearDrag = options.linearDrag;
        this.calculateInstantLinearDrag();
        this._bodyList = [];
        this._worldSize = options.size;
        this.EPSILON = 1e-6;
        this._collisionListener = [];
        this._tickId = 0;
        this._gravity = options.gravity;

        // spatial hash
        this._spatialHash = new SpatialHash();
    }

    // SimplePhysics class definition
    SimplePhysics.prototype.init = function()
    {
        return true;
    };

    SimplePhysics.prototype.getWorldSize = function()
    {
        return this._worldSize;
    };

    SimplePhysics.prototype.getGravity = function()
    {
        return this._gravity;
    };

    SimplePhysics.prototype.setGravity = function(gravity)
    {
        this._gravity = gravity;
    };

    SimplePhysics.prototype.increaseTickId = function()
    {
        this._tickId++;
        if(this._tickId > 255)
        {
            this._tickId = 0;
        }
    };

    SimplePhysics.prototype.getTickId = function()
    {
        return this._tickId;
    };

    SimplePhysics.prototype.calculateInstantLinearDrag = function()
    {
        this._instantLinearDrag = this._linearDrag * this._fixedStep;
    };

    SimplePhysics.prototype.registerCollisionListener = function(listener)
    {
        this._collisionListener.push(listener);
    };

    SimplePhysics.prototype.deregisterCollisionListener = function(listener)
    {
        var success = false;
        var index = this._collisionListener.indexOf(listener);
        if (index > -1) {
            this._collisionListener.splice(index, 1);
            success = true;
        }
        return success;
    };
    
    SimplePhysics.prototype.buildSpatialHash = function()
    {
        this._spatialHash.clear();
        var arrayLength = this._bodyList.length;
        for (var i = 0; i < arrayLength; i++) {
            var currentBody = this._bodyList[i];
            if(currentBody.getCollisionLayer() >= 0)
            {
                // negative layer numbers are ignored!
                this._spatialHash.insert(currentBody, currentBody.getRect());
            }
        }
    };

    SimplePhysics.prototype.getFixedStep = function()
    {
        return this._fixedStep;
    };

    SimplePhysics.prototype.setFixedStep = function(fixedStep)
    {
        this._fixedStep = fixedStep;
        this.calculateInstantLinearDrag();
    };

    SimplePhysics.prototype.getLinearDrag = function()
    {
        return this._linearDrag;
    };

    SimplePhysics.prototype.setLinearDrag = function(drag)
    {
        this._linearDrag = drag;
        this.calculateInstantLinearDrag();
    };

    SimplePhysics.prototype.getBodyList = function()
    {
        return this._bodyList;
    };

    SimplePhysics.prototype.createBody = function(options)
    {
        var newBody = new SimpleBody(options);
        this._bodyList.push(newBody);
        return newBody;
    };

    SimplePhysics.prototype.removeBody = function(bodyToRemove)
    {
        var success = false;
        var index = this._bodyList.indexOf(bodyToRemove);
        if (index > -1) {
            this._bodyList.splice(index, 1);
            success = true;
        }
        return success;
    };

    SimplePhysics.prototype.removeAllBodies = function()
    {
        this._bodyList = [];
    };

    SimplePhysics.prototype.runStep = function()
    {
        // run one step simulation
        var arrayLength = this._bodyList.length;
        for (var i = 0; i < arrayLength; i++) {
            var currentBody = this._bodyList[i];
            currentBody.setCollidesFlag(false);
            this.iterateBody(currentBody);
        }

        // build spatial hash
        this.buildSpatialHash();

        // check circle collisions
        arrayLength = this._bodyList.length;
        var collisionListenerLength = this._collisionListener.length;
        for (var i = arrayLength-1; i > -1; i--) {
            var currentBody = this._bodyList[i];

            if(currentBody == undefined){
                // bodies can be removed in collision event, so this check must be done!
                continue;
            }

            // get candidates!
            var candidates = this._spatialHash.retrieve(currentBody.getRect());
            var candidatesLength = candidates.length;

            for(var j=0; j<candidatesLength; j++) {
                var otherBody = candidates[j];
                if(currentBody != otherBody) {
                    var collides = currentBody.checkCollision(otherBody);
                    if(collides) {
                        currentBody.setCollidesFlag(true);
                        otherBody.setCollidesFlag(true);

                        if(currentBody.isTrigger() == false && otherBody.isTrigger() == false)
                        {
                            // resolve collision if body of the bodies are not triggers. Otherwise this collision has no impact!
                            this.resolveCollision(currentBody, otherBody);
                        }

                        // propagate collision event
                        for(var k=0; k<collisionListenerLength; k++){
                            this._collisionListener[k].onCollision(currentBody, otherBody, currentBody.getContactPoint());
                        }
                    }
                }
            }
        }

        // check if bodies are insize the world
        var arrayLength = this._bodyList.length;
        for (var i = 0; i < arrayLength; i++) {
            var currentBody = this._bodyList[i];
            if(currentBody.isTrigger() == false)
            {
                this.worldBoundaryCheck(currentBody);
            }
        }

        this.increaseTickId();
    };

    SimplePhysics.prototype.iterateBody = function(bdy)
    {
        var mass = bdy.getMass();
        if(mass < this.EPSILON) {
            // no need to calculate if the object is static
            return;
        }

        // apply force
        // f = m * a ( a = f/m)
        var position = bdy.getPosition();
        var velocity = bdy.getVelocity();
        var force = bdy.getForce();

        if(Math.abs(this._gravity.x) > this.EPSILON) {
            force.x += this._gravity.x*mass;
        }

        if(Math.abs(this._gravity.y) > this.EPSILON) {
            force.y += this._gravity.y*mass;
        }

        if(Math.abs(force.x) > this.EPSILON) {
            var accelerationX = force.x/mass;
            velocity.x += accelerationX;
        }

        if(Math.abs(force.y) > this.EPSILON) {
            var accelerationY = force.y/mass;
            velocity.y += accelerationY;
        }

        // check against max speed
        var maxSpeed = bdy.getMaxSpeed();
        if(maxSpeed > this.EPSILON) {
            var maxSpeed2 = bdy.getMaxSpeed2();
            var vel2 = velocity.getLength2();
            if(vel2 > maxSpeed2) {
                // body is over maximum speed, scale the speed down!
                var vellen = Math.sqrt(vel2);
                velocity.x = maxSpeed * velocity.x / vellen;
                velocity.y = maxSpeed * velocity.y / vellen;
            }
        }

        // apply velocity & linear drag
        var hasVelocity = false;
        if(Math.abs(velocity.x) > this.EPSILON) {
            position.x += velocity.x * this._fixedStep;
            hasVelocity = true;
        }

        if(Math.abs(velocity.y) > this.EPSILON) {
            position.y += velocity.y * this._fixedStep;
            hasVelocity = true;
        }

        if(hasVelocity){
            var bodyDrag = bdy.getLinearDrag();
            if(bodyDrag < 0) {
                velocity.scaleDown(this._instantLinearDrag);
            } else {
                velocity.scaleDown(bodyDrag * this._fixedStep);
            }
        }

        // reset force to zero
        force.x = 0;
        force.y = 0;
    };

    SimplePhysics.prototype.resolveCollision = function(bodyA, bodyB)
    {
        // calculate normal
        var positionDelta = bodyB.getPosition().copy().subtract(bodyA.getPosition());
        var normal = positionDelta.copy().normalize();

        // calculate relative velocity
        var relativeVelocity = bodyB.getVelocity().copy().subtract(bodyA.getVelocity());

        // calculate relative velocity in terms of the normal direction
        var velocityAlongNormal = relativeVelocity.dotProduct(normal);

        // Do not resolve if velocities are separating
        if(velocityAlongNormal < this.EPSILON) {
            // Calculate restitution
            //var e = Math.min(bodyA.restitution, bodyB.restitution)
            var restitution = 0.4;
            // Calculate impulse scalar
            var impScalar = -(1 + restitution) * velocityAlongNormal;
            impScalar /= (bodyA.getInvMass()) + (bodyB.getInvMass());

            // apply impulse
            var impulseVec = normal.copy().scale(impScalar);
            var velA = bodyA.getVelocity();
            var velB = bodyB.getVelocity();
            velA.x -= impulseVec.x * bodyA.getInvMass();
            velA.y -= impulseVec.y * bodyA.getInvMass();
            velB.x += impulseVec.x * bodyB.getInvMass();
            velB.y += impulseVec.y * bodyB.getInvMass();
        }

        // positional correction
        var penetration = bodyA.getRadius() + bodyB.getRadius() - positionDelta.getLength();
        var percent = 0.2; // usually 20% to 80%
        var slop = 0.01; // usually 0.01 to 0.1
        var correction = Math.max(penetration - slop, 0.0) / (bodyA.getInvMass() + bodyB.getInvMass()) * percent;
        var correctionX = correction * normal.x;
        var correctionY = correction * normal.y;

        var posA = bodyA.getPosition();
        var posB = bodyB.getPosition();
        posA.x -= bodyA.getInvMass() * correctionX;
        posA.y -= bodyA.getInvMass() * correctionY;
        posB.x += bodyB.getInvMass() * correctionX;
        posB.y += bodyB.getInvMass() * correctionY;
    };

    SimplePhysics.prototype.worldBoundaryCheck = function(body)
    {
        var pos = body.getPosition();
        var vel = body.getVelocity();
        var radius = body.getRadius();
        var left = pos.x - radius;
        var right = pos.x + radius;
        var top = pos.y - radius;
        var bottom = pos.y + radius;

        if(left < -this._worldSize) {
            pos.x = -this._worldSize + radius;
            vel.x = Math.abs(vel.x)*0.5;
        }

        if(right > this._worldSize) {
            pos.x = this._worldSize - radius;
            vel.x = -Math.abs(vel.x)*0.5;
        }

        if(top < -this._worldSize) {
            pos.y = -this._worldSize + radius;
            vel.y = Math.abs(vel.y)*0.5;
        }

        if(bottom > this._worldSize) {
            pos.y = this._worldSize - radius;
            vel.y = -Math.abs(vel.y)*0.5;
        }
    };

    // export module or attach to the global object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SimplePhysics;
    } else {
        w["SimplePhysics"] = SimplePhysics;
    }
    ////////////////////////////////////////////////////////
}(this));