if (typeof module !== 'undefined' && module.exports) {
    SimpleVector = require('./SimpleVector');
}

(function(w)
{
    ////////////////////////////////////////////////////////
    // SimpleBody Definition
    ////////////////////////////////////////////////////////
    function SimpleBody(options)
    {
        this.IGNORED_COLLISION_LAYER = -1;
        this.DEFAULT_COLLISION_LAYER = 0;

        if (typeof(options) === 'undefined') options = {};
        if (typeof(options.mass) === 'undefined') options.mass = 1;
        if (typeof(options.radius) === 'undefined') options.radius = 1;
        if (typeof(options.position) === 'undefined') options.position = new SimpleVector(0, 0);
        if (typeof(options.velocity) === 'undefined') options.velocity = new SimpleVector(0, 0);
        if (typeof(options.maxSpeed) === 'undefined') options.maxSpeed = 0;
        if (typeof(options.collisionLayer) === 'undefined') options.collisionLayer = this.DEFAULT_COLLISION_LAYER;
        if (typeof(options.isTrigger) === 'undefined') options.isTrigger = false;

        // member definitions
        this._mass = options.mass;
        this._radius = options.radius;
        this._position = options.position;
        this._velocity = options.velocity;
        this._force = new SimpleVector(0, 0);
        this._collides = false;
        this._maxSpeed = options.maxSpeed;
        this._maxSpeed2 = options.maxSpeed*options.maxSpeed;
        this._customData = options.customData;
        this._collisionLayer = options.collisionLayer;
        this._isTrigger = options.isTrigger;

        if(this._mass > 0) {
            this._invMass = 1/this._mass;
        } else {
            this._invMass = 0;
        }

        this._contactPoint = new SimpleVector(0, 0);
        this._linearDrag = -1;
    }

    SimpleBody.prototype.getMass = function()
    {
        return this._mass;
    };

    SimpleBody.prototype.getInvMass = function()
    {
        return this._invMass;
    };

    SimpleBody.prototype.setMass = function(mass)
    {
        this._mass = mass;

        if(this._mass > 0) {
            this._invMass = 1/this._mass;
        } else {
            this._invMass = 0;
        }
    };

    SimpleBody.prototype.getRadius = function()
    {
        return this._radius;
    };

    SimpleBody.prototype.setRadius = function(radius)
    {
        this._radius = radius;
    };

    SimpleBody.prototype.getLinearDrag = function()
    {
        return this._linearDrag;
    };

    SimpleBody.prototype.setLinearDrag = function(drag)
    {
        this._linearDrag = drag;
    };

    SimpleBody.prototype.getCollisionLayer = function()
    {
        return this._collisionLayer;
    };

    SimpleBody.prototype.setCollisionLayer = function(layer)
    {
        this._collisionLayer = layer;
    };

    SimpleBody.prototype.getPosition = function()
    {
        return this._position;
    };

    SimpleBody.prototype.setPosition = function(position)
    {
        this._position = position;
    };

    SimpleBody.prototype.getVelocity = function()
    {
        return this._velocity;
    };

    SimpleBody.prototype.setVelocity = function(velocity)
    {
        this._velocity = velocity;
    };

    SimpleBody.prototype.applyForce = function(force)
    {
        this._force.add(force);
    };

    SimpleBody.prototype.getForce = function()
    {
        return this._force;
    };

    SimpleBody.prototype.checkCollision = function(otherBody)
    {
        // no need to check for collision if layers are different!
        if(this.getCollisionLayer() != otherBody.getCollisionLayer()) {
            return false;
        }

        // test AABBs
        var minx1 = this._position.x - this._radius;
        var maxx1 = this._position.x + this._radius;
        var miny1 = this._position.y - this._radius;
        var maxy1 = this._position.y + this._radius;

        var minx2 = otherBody._position.x - otherBody._radius;
        var maxx2 = otherBody._position.x + otherBody._radius;
        var miny2 = otherBody._position.y - otherBody._radius;
        var maxy2 = otherBody._position.y + otherBody._radius;

        if(maxx1 < minx2 || minx1 > maxx2) return false;
        if(maxy1 < miny2 || miny1 > maxy2) return false;

        var sumOfRadius = this._radius + otherBody._radius;
        sumOfRadius *= sumOfRadius;
        var distanceVector = new SimpleVector(this._position.x - otherBody._position.x, this._position.y - otherBody._position.y);
        var distance2 = distanceVector.getLength2();
        if(distance2 < sumOfRadius)
        {
            distanceVector.normalize();
            this._contactPoint.x = this._position.x - (distanceVector.x)*this._radius;
            this._contactPoint.y = this._position.y - (distanceVector.y)*this._radius;
            return true;
        }

        this._contactPoint.x = 0;
        this._contactPoint.y = 0;
        return false;
    };

    SimpleBody.prototype.getContactPoint = function()
    {
        return this._contactPoint;
    };

    SimpleBody.prototype.setCollidesFlag = function(collides)
    {
        this._collides = collides;
    };

    SimpleBody.prototype.collides = function()
    {
        return this._collides;
    };

    SimpleBody.prototype.getRect = function()
    {
        var minx = this._position.x - this._radius;
        var miny = this._position.y - this._radius;
        var r2 = this._radius*2;

        return {
            x: minx,
            y: miny,
            width: r2,
            height: r2
        };
    };

    SimpleBody.prototype.setMaxSpeed = function(maxSpeed)
    {
        this._maxSpeed = maxSpeed;
        this._maxSpeed2 = maxSpeed * maxSpeed;
    };

    SimpleBody.prototype.getMaxSpeed = function()
    {
        return this._maxSpeed;
    };

    SimpleBody.prototype.getMaxSpeed2 = function()
    {
        return this._maxSpeed2;
    };

    SimpleBody.prototype.isTrigger = function()
    {
        return this._isTrigger;
    };

    SimpleBody.prototype.setCustomData = function(customData)
    {
        this._customData = customData;
    };

    SimpleBody.prototype.getCustomData = function()
    {
        return this._customData;
    };

    // export module or attach to the global object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SimpleBody;
    } else {
        w["SimpleBody"] = SimpleBody;
    }
    ////////////////////////////////////////////////////////
}(this));