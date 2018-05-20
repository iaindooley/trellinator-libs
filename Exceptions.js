var InvalidDataException = function(msg)
{
    this.msg = msg;
    
    this.toString = function()
    {
        return this.msg;
    }
}

var InvalidActionException = function(msg)
{
    this.msg = msg;
    
    this.toString = function()
    {
        return this.msg;
    }
}
