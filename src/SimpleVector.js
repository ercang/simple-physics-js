(function(w)
{
    ////////////////////////////////////////////////////////
    // SimpleVector Definition
    ////////////////////////////////////////////////////////
    function SimpleVector(_x, _y)
    {
        if (typeof(_x) === 'undefined') _x = 0;
        if (typeof(_y) === 'undefined') _y = 0;

        // member definitions
        this.x = _x;
        this.y = _y;
    }

    SimpleVector.prototype.getLength = function()
    {
        return Math.sqrt((this.x*this.x) + (this.y*this.y));
    };

    SimpleVector.prototype.getLength2 = function()
    {
        return (this.x*this.x) + (this.y*this.y);
    };

    SimpleVector.prototype.add = function(anotherVector)
    {
        this.x += anotherVector.x;
        this.y += anotherVector.y;
        return this;
    };

    SimpleVector.prototype.subtract = function(anotherVector)
    {
        this.x -= anotherVector.x;
        this.y -= anotherVector.y;
        return this;
    };

    SimpleVector.prototype.normalize = function()
    {
        var len = this.getLength();
        if(len != 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    };

    SimpleVector.prototype.scale = function(magnitude)
    {
        this.x *= magnitude;
        this.y *= magnitude;
        return this;
    };

    SimpleVector.prototype.scaleDown = function(scaleDownMagnitude)
    {
        if(scaleDownMagnitude == 0) {
            return;
        }
        
        var len = this.getLength();
        this.x /= len;
        this.y /= len;

        var magnitude = len - scaleDownMagnitude;
        if(magnitude < 0) {
            magnitude = 0;
        }

        this.x *= magnitude;
        this.y *= magnitude;
        return this;
    };

    SimpleVector.prototype.dotProduct = function(anotherVector)
    {
        return ((this.x * anotherVector.x) + (this.y * anotherVector.y));
    };

    SimpleVector.prototype.copy = function()
    {
        return new SimpleVector(this.x, this.y);
    };

    // export module or attach to the global object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SimpleVector;
    } else {
        w["SimpleVector"] = SimpleVector;
    }
    ////////////////////////////////////////////////////////
}(this));